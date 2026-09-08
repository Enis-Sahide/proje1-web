"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Loader2, Sparkles, CheckCircle2, Lock, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { AstroCity } from '@/features/astrology/engine/AstrologyConstants';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

function GuestCheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Default type: kabbalah (500 TL), human-design (500 TL), or astrology (50 TL)
  const rawType = searchParams.get('type') || 'kabbalah';
  const analysisType = (rawType === 'astrology') ? 'astrology' : (rawType === 'human-design' || rawType === 'human_design') ? 'human-design' : 'kabbalah';
  const title = analysisType === 'kabbalah'
    ? 'Kabalistik 4 Alem Harita Analizi Raporu' 
    : analysisType === 'human-design'
    ? 'Human Design Kapsamlı Yaşam Rehberi Raporu'
    : 'Doğum Haritası Analizi Raporu';

  // Step state: 'info' -> 'payment' (Treps'e yönlendirme anı)
  const [step, setStep] = useState<'info' | 'payment'>('info');

  // Birth & Contact details state
  const [email, setEmail] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('12:00');
  const [cityKey, setCityKey] = useState<AstroCity | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Fiyat sunucudan okunur — istemcide sabit fiyat tutulmaz.
  const [amount, setAmount] = useState<number | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/payment/products')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.success) return;
        const product = (data.data as Array<{ id: string; price: string }>).find(
          (p) => p.id === analysisType,
        );
        if (product) setAmount(Number(product.price));
      })
      .catch(() => {
        /* fiyat okunamazsa buton devre dışı kalır */
      });
    return () => {
      cancelled = true;
    };
  }, [analysisType]);

  // Load pre-populated query params
  useEffect(() => {
    const pEmail = searchParams.get('email');
    const pDate = searchParams.get('date');
    const pTime = searchParams.get('time');
    const pCity = searchParams.get('city');
    const pLat = searchParams.get('lat');
    const pLon = searchParams.get('lon');
    const pTz = searchParams.get('tz');
    const pCountry = searchParams.get('country');
    
    if (pEmail) {
      setEmail(decodeURIComponent(pEmail));
    } else if (user?.email) {
      setEmail(user.email);
    }
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

  // Siparişi oluştur ve kullanıcıyı Treps'in güvenli ödeme sayfasına yönlendir.
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !dateStr || !timeStr || !cityKey) {
      setError('Lütfen tüm doğum bilgilerini ve e-posta adresinizi doldurun.');
      return;
    }
    if (!agreedTerms) {
      setError('Lütfen Mesafeli Satış Sözleşmesi ve İade Koşullarını onaylayınız.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Step 1: Create Order & get iFrame URL
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
        throw new Error(checkoutData.error || 'Sipariş başlatılamadı.');
      }

      // 2. Adım: Treps HPP oturumu aç ve yönlendir.
      const hppRes = await fetch('/api/payment/treps/create-hpp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId: checkoutData.orderId }),
      });

      const hppData = await hppRes.json();
      if (!hppRes.ok || !hppData.success || !hppData.redirectUrl) {
        throw new Error(hppData.error || 'Ödeme sayfası açılamadı.');
      }

      setStep('payment');
      // Kart bilgileri yalnızca Treps'in sayfasına girilir; bize hiç ulaşmaz.
      window.location.href = hppData.redirectUrl;
    } catch (err: any) {
      setError(err?.message || 'Ödeme altyapısına bağlanırken bir hata oluştu.');
      setStep('info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
      {/* Left panel: Order Summary */}
      <div className="flex-1 p-8 bg-gradient-to-br from-[#1e1b4b]/30 via-black/50 to-black/80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
        <div>
          <button 
            onClick={() => {
              if (step === 'payment') {
                setStep('info');
              } else {
                router.back();
              }
            }}
            className="flex items-center text-mystic-text-muted hover:text-white transition-colors mb-6 text-sm group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            {step === 'payment' ? 'Bilgileri Düzenle' : 'Geri Dön'}
          </button>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
              <Sparkles size={18} />
            </div>
            <span className="text-[#D4AF37] font-semibold text-xs tracking-wider uppercase">DİJİTAL ANALİZ RAPORU</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-tight">
            {title}
          </h1>
          
          <p className="text-mystic-text-muted text-xs md:text-sm leading-relaxed mb-6">
            Doğum parametrelerinizle anında hesaplanan profesyonel ve derinlikli PDF raporunuza güvenle erişin; raporunuz e-postanıza iletilir ve profilinizde saklanır.
          </p>

          <div className="space-y-3 pt-6 border-t border-white/10 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-mystic-text-muted">Hizmet Türü</span>
              <span className="text-white font-medium">Algoritmik PDF Raporu</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mystic-text-muted">Teslimat</span>
              <span className="text-green-400 font-medium">Anında İndirme + E-Posta</span>
            </div>
            {cityKey && (
              <div className="flex justify-between items-center">
                <span className="text-mystic-text-muted">Konum</span>
                <span className="text-white/80 font-mono text-[11px] truncate max-w-[160px]">{cityKey.name}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-base font-bold pt-3 border-t border-white/10">
              <span className="text-white">Toplam Ödeme</span>
              <span className="text-[#D4AF37]">{amount === null ? '…' : `${amount} TL`}</span>
            </div>
          </div>
        </div>

        {/* Security Reassurance */}
        <div className="pt-6 mt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-mystic-text-muted">
            <ShieldCheck size={16} className="text-green-400 shrink-0" />
            <span>Treps PCI-DSS Level 1 & 256-Bit SSL Koruması</span>
          </div>
        </div>
      </div>

      {/* Right panel: Step 1 Form OR Step 2 iFrame */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
        {step === 'info' ? (
          <form onSubmit={handleProceedToPayment} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-white">1. Adım: Doğum ve İletişim Bilgileri</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] font-semibold">1 / 2</span>
              </div>
              <p className="text-xs text-mystic-text-muted">
                Raporunuz bu bilgilere göre özel olarak üretilecektir.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs leading-relaxed">
                {error}
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                  E-Posta Adresiniz
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="PDF indirme linkinin gönderileceği adres"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                    Doğum Tarihi
                  </label>
                  <input 
                    type="date"
                    value={dateStr}
                    onChange={e => setDateStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                    Doğum Saati
                  </label>
                  <input 
                    type="time"
                    value={timeStr}
                    onChange={e => setTimeStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                  Doğum Şehri
                </label>
                <LocationAutocomplete onSelect={setCityKey} />
              </div>

              {/* Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 text-[11px] text-white/70 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={e => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37]"
                  />
                  <span>
                    <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-[#D4AF37] hover:underline">
                      Mesafeli Satış Sözleşmesi
                    </Link>
                    'ni ve{' '}
                    <Link href="/iptal-ve-iade" target="_blank" className="text-[#D4AF37] hover:underline">
                      İptal/İade Koşulları
                    </Link>
                    'nı okudum, kabul ediyorum.
                  </span>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || amount === null}
              className="w-full bg-gradient-to-r from-[#D4AF37] via-[#f5db8b] to-[#D4AF37] hover:brightness-110 text-black font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center text-sm mt-4 shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="animate-spin mr-2" size={16} /> Ödeme Geçidi Hazırlanıyor...</>
              ) : (
                <span className="flex items-center gap-2">
                  Ödemeye Devam Et{amount === null ? '' : ` (${amount} TL)`}
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        ) : (
          /* 2. Adım: Treps'in güvenli ödeme sayfasına yönlendiriliyor */
          <div className="flex flex-col items-center justify-center text-center py-12 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-6">
              <Lock size={28} className="text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Güvenli Ödeme Sayfasına Yönlendiriliyorsunuz</h3>
            <p className="text-xs text-mystic-text-muted max-w-xs leading-relaxed mb-6">
              Kart bilgileriniz yalnızca Treps&apos;in PCI-DSS sertifikalı sayfasına girilir; sitemize hiçbir
              zaman ulaşmaz. Sayfa birkaç saniye içinde açılmazsa geri dönüp tekrar deneyebilirsiniz.
            </p>
            <Loader2 className="animate-spin text-[#D4AF37]" size={24} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuestCheckoutPage() {
  return (
    <div className="min-h-screen bg-[#05050A] text-white flex items-center justify-center p-4 md:p-6 relative font-sans">
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
