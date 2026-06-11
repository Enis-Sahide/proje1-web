"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Construction } from 'lucide-react';

export default function Page() {
  const router = useRouter();
  return (
    <div className="min-h-screen pt-32 px-6 bg-black text-center selection:bg-[#D4AF37] selection:text-black">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#110022] via-black to-black -z-20" />
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03] mix-blend-screen pointer-events-none -z-10" />

      <div className="max-w-2xl mx-auto relative animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button onClick={() => router.back()} className="mb-12 flex items-center text-white/50 hover:text-white transition-colors mx-auto">
          <ArrowLeft size={20} className="mr-2" /> VIP Merkeze Dön
        </button>
        
        <Construction size={64} className="text-green-500 mx-auto mb-6 animate-pulse" />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500 mb-6 tracking-wider">
          Silva Teta Ekranı
        </h1>
        <p className="text-lg text-white/60 mb-12 leading-relaxed">
          Zihinsel lazer ile hastalıklı hücreleri silin ve yenilerini programlayın.
        </p>
        
        <div className="p-8 border border-[#D4AF37]/20 rounded-[2rem] bg-black/60 backdrop-blur-xl shadow-[0_0_50px_rgba(212,175,55,0.05)]">
          <h2 className="text-2xl text-[#D4AF37] font-bold mb-4">Laboratuvar İnşa Halinde!</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Mikrokozmik yörüngedeki gibi bu devasa kadim teknoloji için de ilerleyen aşamalarda 3D interaktif animasyonlar, nefes asistanları ve laboratuvar araçları eklenecektir. Altyapı hazırlıkları tamamlanıyor.
          </p>
        </div>
      </div>
    </div>
  );
}
