"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Hexagon, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function NumerologyPage() {
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
          <div className="w-16 h-16 rounded-full bg-[#AF52DE]/10 border border-[#AF52DE]/30 flex items-center justify-center text-[#AF52DE]">
            <Hexagon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Numeroloji Analizi</h1>
            <p className="text-mystic-text-muted">Pisagor Sistemine Göre Titreşimleriniz</p>
          </div>
        </div>

        {!showResult ? (
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#AF52DE]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2 animate-pulse">Sayısal Titreşimler Hesaplanıyor...</h3>
                <p className="text-sm text-white/60">Karmik dersleriniz bulunuyor</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-mystic-text-muted mb-2">Tam İsminiz (Kimlikteki)</label>
                <input required type="text" placeholder="Örn: Ayşe Yılmaz" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#AF52DE] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi</label>
                <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#AF52DE] transition-colors" />
              </div>
              <button type="submit" className="w-full bg-[#AF52DE] hover:bg-[#8e3ec2] text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(175,82,222,0.3)]">
                Numerolojik Profilimi Çıkar
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-black/50 backdrop-blur-md border border-[#AF52DE]/30 p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6 text-[#AF52DE] border-b border-white/10 pb-4">
                <CheckCircle2 size={24} />
                <h2 className="text-xl font-bold text-white">Analiz Tamamlandı</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="block text-mystic-text-muted text-sm mb-2">Yaşam Yolu Sayısı</span>
                  <div className="w-20 h-20 rounded-full border-4 border-[#AF52DE] flex items-center justify-center text-4xl font-bold text-white mb-2 shadow-[0_0_15px_rgba(175,82,222,0.5)]">
                    7
                  </div>
                  <span className="text-[#AF52DE] font-bold">Ruhsal Arayıcı & Bilge</span>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="block text-mystic-text-muted text-sm mb-2">Kader Sayısı (İfade)</span>
                  <div className="w-20 h-20 rounded-full border-4 border-[#AF52DE]/50 flex items-center justify-center text-4xl font-bold text-white mb-2">
                    11
                  </div>
                  <span className="text-[#AF52DE] font-bold">Üstat Sayı: İlham Veren</span>
                </div>
              </div>

              <div className="space-y-6 text-mystic-text">
                <div className="bg-[#AF52DE]/5 p-6 rounded-2xl border border-[#AF52DE]/20">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#AF52DE]" /> Numerolojik Potansiyeliniz
                  </h3>
                  <p className="leading-relaxed">
                    Yaşam Yolu 7 olmanız, sizin dünyaya gerçeği aramaya, derinleşmeye ve mistik konuları anlamaya geldiğinizi gösteriyor. 11 Üstat kader sayınız ise, öğrendiğiniz bu derin bilgileri insanlığa ışık tutmak (ilham vermek) için kullanmanız gerektiğine işaret ediyor.
                  </p>
                </div>
              </div>
              
              <button onClick={() => setShowResult(false)} className="mt-8 text-[#AF52DE] hover:text-white transition-colors underline text-sm">
                Yeni Bir İsim Hesapla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
