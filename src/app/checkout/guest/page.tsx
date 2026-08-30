"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, ShieldCheck, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { AstroCity } from '@/features/astrology/engine/AstrologyConstants';
import { useAuth } from '@/context/AuthContext';

function GuestCheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Default type: kabbalah (500 TL) or astrology (50 TL)
  const analysisType = searchParams.get('type') === 'astrology' ? 'astrology' : 'kabbalah';
  const amount = analysisType === 'kabbalah' ? 500 : 50;
  const title = analysisType === 'kabbalah' ? 'Kabalistik 4 Alem Harita Analizi Raporu' : 'Doğum Haritası Analizi Raporu';

  // Birth details state
  const [email, setEmail] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('12:00');
  const [cityKey, setCityKey] = useState<AstroCity | null>(null);

  // Card details state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successToken, setSuccessToken] = useState('');

  // Load pre-populated query params
  React.useEffect(() => {
    const pEmail = searchParams.get('email');
    const pDate = searchParams.get('date');
    const pTime = searchParams.get('time');
    const pCity = searchParams.get('city');
    const pLat = searchParams.get('lat');
    const pLon = searchParams.get('lon');
    const pTz = searchParams.get('tz');
    const pCountry = searchParams.get('country');
    
    if (pEmail) setEmail(decodeURIComponent(pEmail));
    if (pDate) setDateStr(pDate);
    if (pTime) setTimeStr(pTime);
    if (pCity && pLat && pLon && pTz) {
      setCityKey({
        name: decodeURIComponent(pCity),
        lat: parseFloat(pLat),
        lon: parseFloat(pLon),
        tz: pTz,
        country: pCountry ? decodeURIComponent(pCountry) : ''
      });
    }
  }, [searchParams]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !dateStr || !timeStr || !cityKey) {
      setError('Lütfen tüm doğum bilgilerini ve e-posta adresinizi doldurun.');
      return;
    }
    if (!cardName || cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3) {
      setError('Lütfen kredi kartı bilgilerini eksiksiz doldurun.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Step 1: Create Order
      const checkoutRes = await fetch('/api/payment/guest-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          analysisType,
          birthData: {
            localDate: dateStr,
            localTime: timeStr,
            cityData: cityKey
          }
        })
      });
      
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.success) {
        throw new Error(checkoutData.error || 'Sipariş oluşturulamadı.');
      }
      
      // Step 2: Process Mock Payment
      const callbackRes = await fetch('/api/payment/guest-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: checkoutData.orderId,
          cardName,
          cardNumber
        })
      });
      
      const callbackData = await callbackRes.json();
      if (!callbackRes.ok || !callbackData.success) {
        throw new Error(callbackData.error || 'Ödeme tamamlanamadı.');
      }
      
      setSuccessToken(callbackData.token);
      setSuccess(true);
      
      setTimeout(() => {
        router.push(`/checkout/success?token=${encodeURIComponent(callbackData.token)}`);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Ödeme işlemi sırasında bir hata oluştu.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md w-full bg-black/80 backdrop-blur-xl border border-green-500/20 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(34,197,94,0.15)] flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Ödeme Başarılı!</h2>
        <p className="text-mystic-text-muted text-sm mb-4">
          Ödemeniz onaylandı. PDF indirme bağlantınız hazırlanıyor ve e-postanıza gönderiliyor...
        </p>
        <Loader2 className="animate-spin text-[#D4AF37] mt-2" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
      {/* Left panel: Order Summary */}
      <div className="flex-1 p-8 bg-gradient-to-br from-[#1e1b4b]/20 to-black/40 border-b md:border-b-0 md:border-r border-white/10">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-mystic-text-muted hover:text-white transition-colors mb-8 text-sm group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Geri Dön
        </button>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
            <Sparkles size={20} />
          </div>
          <span className="text-[#D4AF37] font-semibold text-sm tracking-wider uppercase">PDF ANALİZ SATIN ALMA</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-tight">
          {title}
        </h1>
        
        <p className="text-mystic-text-muted text-sm leading-relaxed mb-8">
          Kayıt olmadan, doğum bilgilerinizi girerek profesyonel analizinizi anında PDF olarak indirebilir ve e-posta adresinizden dilediğiniz zaman erişebilirsiniz.
        </p>

        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-mystic-text-muted text-sm">Ürün Bedeli</span>
            <span className="text-white font-medium">{amount} TL</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold pt-4 border-t border-white/5">
            <span className="text-white">Toplam Ödeme</span>
            <span className="text-[#D4AF37]">{amount} TL</span>
          </div>
        </div>
      </div>

      {/* Right panel: Form */}
      <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6">
        <h2 className="text-xl font-bold text-white mb-2">1. Doğum & İletişim Bilgileri</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">E-Posta Adresiniz</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="PDF indirme linkinin gönderileceği adres"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">Doğum Tarihi</label>
              <input 
                type="date"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">Doğum Saati</label>
              <input 
                type="time"
                value={timeStr}
                onChange={e => setTimeStr(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">Doğum Şehri</label>
            <LocationAutocomplete onSelect={setCityKey} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white pt-4 border-t border-white/10 mb-2">2. Kart ile Ödeme</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">Kart Üzerindeki İsim</label>
            <input 
              type="text"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">Kart Numarası</label>
            <div className="relative">
              <input 
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="0000 0000 0000 0000"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
              <CreditCard className="absolute left-4 top-3.5 text-white/30" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">Son Kullanma</label>
              <input 
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="AA/YY"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">CVV</label>
               <input 
                type="password"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                placeholder="123"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-bold py-4 px-6 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center text-lg mt-6 shadow-lg shadow-[#D4AF37]/20"
        >
          {loading ? (
            <><Loader2 className="animate-spin mr-2" /> İşleniyor...</>
          ) : (
            `Ödemeyi Yap ve PDF'i Al (${amount} TL)`
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-mystic-text-muted mt-4">
          <ShieldCheck size={14} className="text-green-500" />
          <span>256-bit SSL Güvenli Kart Ödeme Altyapısı</span>
        </div>
      </form>
    </div>
  );
}

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05050A] text-white flex items-center justify-center p-6 relative font-sans">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-4" size={32} />
          <p className="text-mystic-text-muted">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#05050A] text-white flex items-center justify-center p-6 relative z-10 font-sans">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37] opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6A0DAD] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-md w-full bg-black/80 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] flex flex-col items-center z-10">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-500">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Ödeme Altyapısı Aktif Değil</h2>
          <p className="text-mystic-text-muted text-sm leading-relaxed mb-6">
            Satın alma altyapısı şu anda test aşamasındadır. Bu sayfa sadece yöneticiler (admin) tarafından görüntülenebilir.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-white/5 hover:bg-white/10 rounded-xl py-3 text-white transition-colors border border-white/10"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050A] text-white flex items-center justify-center p-6 relative font-sans">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37] opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6A0DAD] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-4" size={32} />
          <p className="text-mystic-text-muted">Ödeme Formu Yükleniyor...</p>
        </div>
      }>
        <GuestCheckoutForm />
      </Suspense>
    </div>
  );
}
