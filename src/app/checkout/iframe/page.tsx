"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, CreditCard, Lock, Loader2, CheckCircle2, AlertCircle, Smartphone, KeyRound } from 'lucide-react';

function IframePaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState('');

  // Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 3D Secure Modal State
  const [show3DModal, setShow3DModal] = useState(false);
  const [smsCode, setSmsCode] = useState('123456');
  const [verifying3D, setVerifying3D] = useState(false);
  const [countdown, setCountdown] = useState(180);

  // Success State
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch order info
  useEffect(() => {
    if (!orderId) {
      setOrderError('Sipariş referans numarası bulunamadı.');
      setLoadingOrder(false);
      return;
    }

    fetch(`/api/payment/order-info?orderId=${encodeURIComponent(orderId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setOrderError(data.error || 'Sipariş bilgisi yüklenemedi.');
        }
      })
      .catch(err => setOrderError(err.message || 'Bağlantı hatası'))
      .finally(() => setLoadingOrder(false));
  }, [orderId]);

  // Countdown timer for 3D Secure
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (show3DModal && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [show3DModal, countdown]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    setCardNumber(parts.length > 0 ? parts.join(' ') : val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    setExpiry(val.length > 2 ? `${val.substring(0, 2)}/${val.substring(2)}` : val);
  };

  const fillTestCard = () => {
    setCardName('Test Kullanıcısı');
    setCardNumber('5400 0000 0000 0000');
    setExpiry('12/28');
    setCvv('789');
    setFormError('');
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) {
      setFormError('Lütfen kart üzerindeki adı ve soyadı giriniz.');
      return;
    }
    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setFormError('Lütfen 16 haneli geçerli kart numarasını giriniz.');
      return;
    }
    if (expiry.length < 5) {
      setFormError('Lütfen son kullanma tarihini AA/YY formatında giriniz.');
      return;
    }
    if (cvv.length < 3) {
      setFormError('Lütfen kartın arkasındaki 3 haneli güvenlik kodunu giriniz.');
      return;
    }

    setFormError('');
    setShow3DModal(true);
    setCountdown(180);
  };

  const handleConfirm3DSecure = async () => {
    if (!smsCode || smsCode.length < 4) {
      setFormError('Lütfen geçerli onay kodunu giriniz.');
      return;
    }

    setVerifying3D(true);
    setFormError('');

    try {
      const callbackRes = await fetch('/api/payment/guest-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          cardName,
          cardNumber
        })
      });

      const callbackData = await callbackRes.json();
      if (!callbackRes.ok || !callbackData.success) {
        throw new Error(callbackData.error || 'Ödeme banka tarafından onaylanamadı.');
      }

      setShow3DModal(false);
      setPaymentSuccess(true);

      // Notify parent container window
      if (typeof window !== 'undefined') {
        const payload = {
          type: '7LAYERS_PAYMENT_SUCCESS',
          token: callbackData.token,
          orderId: orderId
        };
        window.parent.postMessage(payload, '*');
        
        // In case parent does not listen, redirect within iframe
        setTimeout(() => {
          window.parent.location.href = `/checkout/success?token=${encodeURIComponent(callbackData.token)}`;
        }, 1500);
      }
    } catch (err: any) {
      setFormError(err.message || 'Ödeme işlenirken bir sorun oluştu.');
      setShow3DModal(false);
    } finally {
      setVerifying3D(false);
    }
  };

  if (loadingOrder) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center p-6 text-center text-white">
        <Loader2 className="animate-spin text-[#D4AF37] mb-3" size={28} />
        <p className="text-xs text-white/60">Güvenli Ödeme Geçidi Yükleniyor...</p>
      </div>
    );
  }

  if (orderError) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center p-6 text-center text-white">
        <AlertCircle className="text-red-400 mb-3" size={32} />
        <h3 className="text-sm font-bold mb-1 text-red-400">Ödeme Başlatılamadı</h3>
        <p className="text-xs text-white/60 mb-4">{orderError}</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Ödeme Başarıyla Onaylandı!</h3>
        <p className="text-xs text-white/70 mb-4 max-w-xs">
          Banka provizyonu alındı. Rapor indirme sayfanıza yönlendiriliyorsunuz...
        </p>
        <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
      </div>
    );
  }

  const cardFirstDigit = cardNumber.replace(/\D/g, '')[0];
  const cardBrand = cardFirstDigit === '4' ? 'VISA' : cardFirstDigit === '5' ? 'Mastercard' : cardFirstDigit === '9' ? 'TROY' : 'Kart';

  return (
    <div className="w-full max-w-lg mx-auto bg-[#0a0a10] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl relative text-white font-sans">
      {/* Top Security Banner */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
            <Lock size={15} />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">3D SECURE GÜVENLİ ÖDEME</div>
            <div className="text-[10px] text-white/40">Treps PCI-DSS Level 1 Uyumlu Geçit</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/50 uppercase tracking-wider">Tutar</div>
          <div className="text-base font-bold text-[#D4AF37]">{order?.amount || 500} TL</div>
        </div>
      </div>

      {formError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Credit Card Form */}
      <form onSubmit={handleInitialSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider">
              Kart Üzerindeki İsim
            </label>
            <button
              type="button"
              onClick={fillTestCard}
              className="text-[10px] text-[#D4AF37]/80 hover:text-[#D4AF37] underline transition-colors"
            >
              Test Kartı Doldur
            </button>
          </div>
          <input
            type="text"
            value={cardName}
            onChange={e => setCardName(e.target.value)}
            placeholder="Ad Soyad"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37] transition-all"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider">
              Kart Numarası
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70 font-mono font-bold">
              {cardBrand}
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/20 font-mono tracking-wider focus:outline-none focus:border-[#D4AF37] transition-all"
              required
            />
            <CreditCard className="absolute left-3 top-3 text-white/30" size={16} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
              Son Kullanma
            </label>
            <input
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="AA/YY"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 font-mono text-center focus:outline-none focus:border-[#D4AF37] transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
              CVV / CVC
            </label>
            <input
              type="password"
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
              placeholder="•••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 font-mono text-center focus:outline-none focus:border-[#D4AF37] transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 bg-gradient-to-r from-[#D4AF37] via-[#f3d97e] to-[#D4AF37] hover:brightness-110 text-black font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
        >
          <Lock size={15} />
          <span>{order?.amount || 500} TL - 3D Secure ile Güvenle Öde</span>
        </button>
      </form>

      {/* Footer Security Badges */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-green-400" />
          256-Bit SSL Şifreli
        </span>
        <span>Treps / Sanal POS Altyapısı</span>
        <span>3D Secure 2.0</span>
      </div>

      {/* 3D Secure Simulation Modal */}
      {show3DModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121c] border border-[#D4AF37]/30 rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Banka 3D Secure Onayı</h4>
                <p className="text-[11px] text-white/50">Doğrulama Kodu Gönderildi</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 text-xs text-white/80">
              <p>
                İşlem Tutarı: <strong className="text-[#D4AF37]">{order?.amount || 500} TL</strong>
              </p>
              <p className="text-[11px] text-white/60">
                Kartınızın bağlı olduğu cep telefonuna gönderilen 6 haneli şifreyi giriniz:
              </p>

              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={smsCode}
                    onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    placeholder="123456"
                    className="w-full bg-white/5 border border-[#D4AF37]/40 rounded-xl pl-9 pr-4 py-2.5 text-center text-base tracking-[6px] font-mono font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                    maxLength={6}
                    autoFocus
                  />
                  <KeyRound className="absolute left-3 top-3 text-[#D4AF37]" size={16} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-white/40 mt-1.5">
                  <span>Kalan Süre: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                  <span className="text-[#D4AF37]/70">Simülasyon Kodu: 123456</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShow3DModal(false)}
                  disabled={verifying3D}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium text-xs transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleConfirm3DSecure}
                  disabled={verifying3D}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#D4AF37]/20"
                >
                  {verifying3D ? (
                    <><Loader2 className="animate-spin" size={14} /> Doğrulanıyor...</>
                  ) : (
                    <>Onayla ve Bitir</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IframePaymentPage() {
  return (
    <div className="w-full min-h-screen bg-[#05050A] flex items-center justify-center p-2">
      <Suspense fallback={
        <div className="p-8 text-center text-white">
          <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-2" size={24} />
          <p className="text-xs text-white/50">Yükleniyor...</p>
        </div>
      }>
        <IframePaymentContent />
      </Suspense>
    </div>
  );
}
