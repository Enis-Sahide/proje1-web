"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Compass, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

export default function TransitsPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate fetching live transit data from Astro-Seek
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 relative">
      <div className="fixed inset-0 bg-mystic-dark -z-20" />
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 flex items-center text-mystic-text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Geri Dön
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#32ADE6]/10 border border-[#32ADE6]/30 flex items-center justify-center text-[#32ADE6]">
            <Compass size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Anlık Gökyüzü (Transitler)</h1>
            <p className="text-mystic-text-muted">Şu Anki Gezegen Hareketlerinin Etkisi</p>
          </div>
        </div>

        {isAnalyzing ? (
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-16 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-[#32ADE6]">
            <Loader2 size={48} className="animate-spin mb-4" />
            <h3 className="text-xl font-bold mb-2 animate-pulse">Astro-Seek Veritabanına Bağlanılıyor...</h3>
            <p className="text-sm text-mystic-text-muted">Gezegenlerin güncel koordinatları (Ephemeris) çekiliyor</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="bg-[#32ADE6]/10 border border-[#32ADE6]/30 p-6 rounded-2xl flex gap-4 text-[#32ADE6]">
              <Sparkles className="shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">Günün Enerjisi</h3>
                <p className="text-mystic-text text-sm leading-relaxed">
                  Bugün Ay Boğa burcunda ilerliyor. Maddi güvence, huzur ve bedensel konfor arayışımız çok yüksek. Aynı zamanda Venüs ve Neptün arasındaki uyumlu açı sayesinde spiritüel çalışmalar yapmak, affetmek ve yaratıcı işlerle uğraşmak için harika bir gün.
                </p>
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Önemli Gezegen Açıları</h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">☿</div>
                    <div>
                      <h4 className="font-bold text-white">Merkür Retro (Başak)</h4>
                      <p className="text-xs text-mystic-text-muted">Zihinsel yavaşlama ve revizyon</p>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20">
                    Etki: Yoğun
                  </div>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl">♂</div>
                    <div>
                      <h4 className="font-bold text-white">Mars Karesi Satürn</h4>
                      <p className="text-xs text-mystic-text-muted">Öfke kontrolü ve engellenme hissi</p>
                    </div>
                  </div>
                  <div className="bg-red-500/10 text-red-400 text-xs px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-1">
                    <AlertTriangle size={12} /> Etki: Krizli
                  </div>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xl">♃</div>
                    <div>
                      <h4 className="font-bold text-white">Jüpiter Üçgen Güneş</h4>
                      <p className="text-xs text-mystic-text-muted">Şans, bolluk ve ilahi koruma</p>
                    </div>
                  </div>
                  <div className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20">
                    Etki: Çok Olumlu
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-mystic-text-muted">
              Veriler anlık olarak Astro-Seek Ephemeris kütüphanesinden derlenmektedir.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
