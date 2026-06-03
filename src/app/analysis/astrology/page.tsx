"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoonStar, Star, CheckCircle2, Loader2 } from 'lucide-react';

export default function AstrologyPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    // Mock processing time
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 2500);
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
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <MoonStar size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Doğum Haritası Analizi</h1>
            <p className="text-mystic-text-muted">Astrolojik İsviçre Efemeris Verileriyle</p>
          </div>
        </div>

        {!showResult ? (
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#D4AF37]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2 animate-pulse">Gezegen Konumları Hesaplanıyor...</h3>
                <p className="text-sm text-white/60">Astro-Seek veritabanı taranıyor</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi</label>
                  <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Saati (Tam)</label>
                  <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğduğunuz Şehir/Ülke</label>
                <input required type="text" placeholder="Örn: İstanbul, Türkiye" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#b0902c] text-black font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                Haritamı Çıkar ve Analiz Et
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Mock Report */}
            <div className="bg-black/50 backdrop-blur-md border border-[#D4AF37]/30 p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6 text-green-400 border-b border-white/10 pb-4">
                <CheckCircle2 size={24} />
                <h2 className="text-xl font-bold text-white">Analiz Tamamlandı</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                  <span className="block text-mystic-text-muted text-sm mb-1">Güneş Burcu</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">Akrep ♏</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                  <span className="block text-mystic-text-muted text-sm mb-1">Yükselen</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">Yay ♐</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                  <span className="block text-mystic-text-muted text-sm mb-1">Ay Burcu</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">Koç ♈</span>
                </div>
              </div>

              <div className="space-y-6 text-mystic-text">
                <div className="bg-[#D4AF37]/5 p-6 rounded-2xl border border-[#D4AF37]/20">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Star size={18} className="text-[#D4AF37]" /> Ruhsal Potansiyeliniz
                  </h3>
                  <p className="leading-relaxed">
                    Akrebin derinliği ve Yükselen Yay'ın geniş vizyonu birleşerek size sezgisel bir bilgelik katıyor. Krizleri dönüştürme yeteneğiniz çok yüksek (Plüton 8. ev kavuşumu). Hayatta karşılaştığınız zorlukları, ruhsal evriminiz için bir basamak olarak kullanma potansiyeliniz var.
                  </p>
                </div>
                
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Dikkat Edilmesi Gereken Açılar (Karmik Dersler)</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong className="text-red-400">Satürn Karesi Güneş:</strong> Otorite figürleriyle ve kendi özgüveninizle ilgili sınavlar yaşayabilirsiniz. Sorumluluk almaktan kaçınmayın.</li>
                    <li><strong className="text-blue-400">Venüs Üçgen Neptün:</strong> Sanatsal yetenekleriniz ve koşulsuz sevgi kapasiteniz çok yüksek. Ancak ilişkilerde aşırı fedakarlıktan (kurban rolü) kaçının.</li>
                    <li><strong className="text-[#D4AF37]">Kuzey Ay Düğümü İkizler (7. Ev):</strong> Bu hayattaki temel amacınız insanlarla iletişim kurmak, bilgiyi paylaşmak ve ortaklıklarda dengeyi öğrenmektir.</li>
                  </ul>
                </div>
              </div>
              
              <button onClick={() => setShowResult(false)} className="mt-8 text-[#D4AF37] hover:text-white transition-colors underline text-sm">
                Yeni Bir Harita Hesapla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
