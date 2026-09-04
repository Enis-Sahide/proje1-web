"use client";

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Compass } from 'lucide-react';
import Link from 'next/link';

export default function TransitsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Transits Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 flex items-center justify-center text-center">
      <div className="bg-[#111] border border-[#0EA5E9]/30 rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mx-auto mb-4">
          <AlertCircle size={32} />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Transit Haritası Yüklenemedi</h2>
        <p className="text-mystic-text-muted text-xs mb-6 leading-relaxed">
          Gezegen konumları veya zaman çizelgesi hesaplanırken bir hata ile karşılaşıldı.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#0EA5E9] hover:opacity-90 text-black font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw size={16} />
            <span>Yeniden Hesapla</span>
          </button>

          <Link
            href="/analysis"
            className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-4 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Compass size={16} />
            <span>Analiz Merkezine Dön</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
