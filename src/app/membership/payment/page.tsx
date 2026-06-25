"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import Link from 'next/link';
import { ArrowLeft, CreditCard, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

const TIER_DETAILS: Record<string, { title: string; price: string; role: string }> = {
  apprentice: { title: 'Çırak Seviyesi', price: '396 TL / Ay', role: 'apprentice' },
  journeyman: { title: 'Kalfa Seviyesi', price: '639 TL / Ay', role: 'journeyman' },
  master: { title: 'Usta Seviyesi', price: '999 TL / Ay', role: 'master' }
};

function PaymentCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  
  const tierKey = searchParams.get('tier') || 'apprentice';
  const details = TIER_DETAILS[tierKey] || TIER_DETAILS.apprentice;

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      setExpiry(`${val.substring(0, 2)}/${val.substring(2)}`);
    } else {
      setExpiry(val);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3) {
      setError('Lütfen tüm ödeme bilgilerini eksiksiz doldurun.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Perform mock upgrade API call
      await apiFetch('/api/auth/mock-upgrade', {
        method: 'POST',
        body: JSON.stringify({ targetRole: details.role })
      });

      // Sync AuthContext
      await refresh();
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/membership');
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Ödeme işlemi sırasında bir hata oluştu.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md w-full bg-black/80 backdrop-blur-xl border border-green-500/20 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(34,197,94,0.15)] flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
          <CheckCircle2 className="text-green-500" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Ödeme Başarılı!</h3>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          Ödemeniz başarıyla gerçekleştirildi. Hesabınız <strong>{details.title}</strong> seviyesine yükseltildi!
        </p>
        <div className="flex items-center justify-center gap-2 text-mystic-accent text-xs font-mono">
          <Loader2 className="animate-spin" size={14} /> Yönlendiriliyorsunuz...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
      {/* Order Summary */}
      <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-mystic-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <Link href="/membership" className="inline-flex items-center text-white/50 hover:text-white text-xs uppercase tracking-wider font-semibold mb-8 transition-colors">
            <ArrowLeft size={14} className="mr-1.5" /> Geri Dön
          </Link>
          
          <div className="mb-4">
            <span className="text-[10px] font-bold text-[#D4AF37] border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Seviye Yükseltme
            </span>
          </div>
          
          <h2 className="text-3xl font-extrabold text-white mt-4">{details.title}</h2>
          <p className="text-white/50 text-sm mt-2 leading-relaxed">
            Seviye atlayarak yeni ezoterik sınavlara, özel derslere ve kadim analiz araçlarına erişim sağlayın.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/50 text-sm">Üyelik Seviyesi:</span>
            <span className="text-white text-sm font-semibold">{details.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Toplam Tutar:</span>
            <span className="text-white text-xl font-extrabold">{details.price}</span>
          </div>
        </div>
      </div>

      {/* Card Form */}
      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="p-2 rounded-lg bg-mystic-primary/10 text-mystic-primary">
            <CreditCard size={20} />
          </div>
          <h3 className="text-lg font-bold text-white">Kart Bilgileri</h3>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">Kart Üzerindeki İsim</label>
            <input 
              type="text" 
              required
              placeholder="Ad Soyad"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:border-mystic-primary outline-none transition-all placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">Kart Numarası</label>
            <input 
              type="text" 
              required
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:border-mystic-primary outline-none transition-all placeholder:text-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">Son Kullanma Tarihi</label>
              <input 
                type="text" 
                required
                placeholder="AA/YY"
                value={expiry}
                onChange={handleExpiryChange}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:border-mystic-primary outline-none transition-all placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">CVC / CVV</label>
              <input 
                type="password" 
                required
                placeholder="000"
                value={cvv}
                onChange={handleCvvChange}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:border-mystic-primary outline-none transition-all placeholder:text-white/20"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-mystic-primary to-mystic-accent text-black font-bold py-3.5 rounded-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer mt-8"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>İşlem Yapılıyor...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              <span>Güvenli Ödeme Yap</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-transparent flex flex-col items-center justify-center">
      {/* Background radial gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0724] via-black to-black -z-50" />
      
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="animate-spin text-mystic-primary mx-auto mb-4" size={48} />
          <p className="text-white/80 text-sm font-mono">Ödeme sayfası yükleniyor...</p>
        </div>
      }>
        <PaymentCheckout />
      </Suspense>
    </div>
  );
}
