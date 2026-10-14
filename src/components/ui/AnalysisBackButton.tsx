"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, X, Check } from 'lucide-react';

interface AnalysisBackButtonProps {
  hasActiveResult?: boolean;
  targetHref?: string;
  label?: string;
  className?: string;
}

export default function AnalysisBackButton({
  hasActiveResult = false,
  targetHref = '/analysis',
  label = 'Geri Dön',
  className = '',
}: AnalysisBackButtonProps) {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasActiveResult) {
      setShowConfirmModal(true);
    } else {
      router.push(targetHref);
    }
  };

  const handleConfirmExit = () => {
    setShowConfirmModal(false);
    router.push(targetHref);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={`inline-flex items-center gap-2 py-2 px-3 -ml-3 mb-6 text-mystic-text-muted hover:text-white transition-colors cursor-pointer touch-manipulation z-20 font-semibold text-sm group ${className}`}
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        <span>{label}</span>
      </button>

      {/* Onay Modalı (Analiz Yapılmışsa Ayrılma Uyarısı) */}
      {showConfirmModal && (
        <div 
          onClick={() => setShowConfirmModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121216] border border-[#D4AF37]/40 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] relative animate-in zoom-in-95 duration-200 text-center"
          >
            {/* Kapat Butonu */}
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>

            {/* İkon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-inner">
              <AlertTriangle size={28} />
            </div>

            {/* Başlık ve Açıklama */}
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Analizinizden Ayrılmak Üzeresiniz
            </h3>
            <p className="text-xs sm:text-sm text-mystic-text-muted leading-relaxed mb-6">
              Sayfadan çıkarsanız hesaplanan harita ve analiz sonuçlarınız sıfırlanacaktır. Analizler listesine dönmek istediğinizden emin misiniz?
            </p>

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                İncelemeye Devam Et
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:opacity-90 text-black font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                Evet, Menüye Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
