"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Clock, Loader2, RefreshCw } from 'lucide-react';

const STATUS_TEXT: Record<string, { title: string; hint: string }> = {
  failed: {
    title: 'Ödeme Tamamlanamadı',
    hint: 'Kartınızdan tahsilat yapılmadı. Farklı bir kartla tekrar deneyebilirsiniz.',
  },
  expired: {
    title: 'Ödeme Süresi Doldu',
    hint: 'Ödeme oturumunun süresi doldu. Yeni bir sipariş başlatmanız gerekiyor.',
  },
  pending: {
    title: 'Ödemeniz Doğrulanıyor',
    hint: 'Bankanızdan sonuç bekleniyor. Bu sayfa durumu kendiliğinden tazeler.',
  },
  error: {
    title: 'Bir Sorun Oluştu',
    hint: 'İşlem durumu sorgulanamadı. Tutar çekildiyse kısa süre içinde iade edilir.',
  },
};

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') || 'error';
  const message = searchParams.get('message');
  const order = searchParams.get('order');

  const [checking, setChecking] = useState(false);

  // Beklemede kalan işlemler için durumu yeniden sorgula.
  const recheck = async () => {
    if (!order) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/payment/treps/check-status?token=${encodeURIComponent(order)}`);
      const data = await res.json();
      if (data?.status === 'completed' && data.downloadToken) {
        router.push(`/checkout/success?token=${encodeURIComponent(data.downloadToken)}`);
        return;
      }
      if (data?.status && data.status !== status) {
        const params = new URLSearchParams({ status: data.status, order });
        if (data.error) params.set('message', data.error);
        router.replace(`/checkout/result?${params.toString()}`);
      }
    } catch {
      /* sessizce geç — kullanıcı elle tekrar deneyebilir */
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (status !== 'pending' || !order) return;
    const timer = setInterval(recheck, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, order]);

  const text = STATUS_TEXT[status] || STATUS_TEXT.error;
  const isPending = status === 'pending';

  return (
    <div className="max-w-md w-full bg-black/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center flex flex-col items-center shadow-2xl">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${
          isPending
            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        {isPending ? (
          <Clock size={30} className="text-[#D4AF37]" />
        ) : (
          <AlertCircle size={30} className="text-red-400" />
        )}
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">{text.title}</h1>
      <p className="text-mystic-text-muted text-sm leading-relaxed mb-2">{text.hint}</p>

      {message && (
        <p className="text-xs text-red-300/80 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4">
          {message}
        </p>
      )}

      {order && (
        <p className="text-[11px] text-white/30 font-mono mb-6">İşlem no: {order}</p>
      )}

      <div className="flex flex-col gap-2 w-full">
        {order && (
          <button
            onClick={recheck}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {checking ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Durumu Yeniden Sorgula
          </button>
        )}
        <Link
          href="/analysis"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-sm py-3 rounded-xl hover:brightness-110 transition-all"
        >
          <ArrowLeft size={16} />
          Analizlere Dön
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <div className="min-h-screen bg-[#05050A] text-white flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-center">
            <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-4" size={32} />
            <p className="text-mystic-text-muted">Sonuç yükleniyor...</p>
          </div>
        }
      >
        <ResultContent />
      </Suspense>
    </div>
  );
}
