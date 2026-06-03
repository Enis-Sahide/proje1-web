"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Fingerprint, CheckCircle2, Loader2, Zap } from 'lucide-react';

export default function HumanDesignPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 relative">
      <div className="fixed inset-0 bg-mystic-dark -z-20" />
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 flex items-center text-mystic-text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Geri Dön
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#34C759]/10 border border-[#34C759]/30 flex items-center justify-center text-[#34C759]">
            <Fingerprint size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Human Design Analizi</h1>
            <p className="text-mystic-text-muted">Aura Tipiniz, Otoriteniz ve Stratejiniz</p>
          </div>
        </div>

        {!showResult ? (
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#34C759]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2 animate-pulse">Vücut Grafiğiniz Çıkarılıyor...</h3>
                <p className="text-sm text-white/60">Enerji merkezleriniz hesaplanıyor</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi</label>
                  <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#34C759] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Saati</label>
                  <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#34C759] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğduğunuz Şehir</label>
                <input required type="text" placeholder="Örn: Ankara" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#34C759] transition-colors" />
              </div>
              <button type="submit" className="w-full bg-[#34C759] hover:bg-[#2da34a] text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(52,199,89,0.3)]">
                Tasarımımı Göster
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-black/50 backdrop-blur-md border border-[#34C759]/30 p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6 text-[#34C759] border-b border-white/10 pb-4">
                <CheckCircle2 size={24} />
                <h2 className="text-xl font-bold text-white">Analiz Tamamlandı</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                  <span className="block text-mystic-text-muted text-sm mb-1">Enerji Tipi</span>
                  <span className="text-2xl font-bold text-[#34C759]">Jeneratör</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                  <span className="block text-mystic-text-muted text-sm mb-1">Otorite</span>
                  <span className="text-2xl font-bold text-[#34C759]">Sakral</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                  <span className="block text-mystic-text-muted text-sm mb-1">Profil</span>
                  <span className="text-2xl font-bold text-[#34C759]">3 / 5</span>
                </div>
              </div>

              <div className="space-y-6 text-mystic-text">
                <div className="bg-[#34C759]/5 p-6 rounded-2xl border border-[#34C759]/20">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Zap size={18} className="text-[#34C759]" /> Sizin Stratejiniz: Beklemek ve Tepki Vermek
                  </h3>
                  <p className="leading-relaxed">
                    Saf bir Jeneratör olarak auranız çok büyük ve çekicidir. Kendi başınıza bir şeyler başlatmaya çalışmak (Manifest etmek) sizde hayal kırıklığı yaratır. Hayatın size getirdiği fırsatları gözlemleyin ve vücudunuzdaki (Sakral) o "hı-hı" veya "ı-ıh" içgüdüsel sesini dinleyerek tepki verin. Doğru kararı ancak o zaman verebilirsiniz.
                  </p>
                </div>
              </div>
              
              <button onClick={() => setShowResult(false)} className="mt-8 text-[#34C759] hover:text-white transition-colors underline text-sm">
                Yeni Bir Harita Hesapla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
