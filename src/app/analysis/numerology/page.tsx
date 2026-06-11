"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Hexagon, Loader2, Calendar, User, ArrowRight, Target, Heart } from 'lucide-react';
import { calculateLifePath, calculatePersonalYear, calculateArrows, getBirthdayNumber } from '@/utils/numerologyCalculator';
import { lifePathData, birthdayData, arrowsData, emptyArrowsData, personalYearData } from '@/utils/numerologyData';

export default function NumerologyPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  
  // Computed Data
  const [lifePath, setLifePath] = useState<{ number: number; calculationString: string } | null>(null);
  const [birthday, setBirthday] = useState<number | null>(null);
  const [arrows, setArrows] = useState<{ arrowKeys: string[]; emptyArrowKeys: string[]; visualString: string } | null>(null);
  const [personalYear, setPersonalYear] = useState<{ number: number; calculationString: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;

    setIsAnalyzing(true);
    
    // Calculate Numerology Data
    setLifePath(calculateLifePath(birthDate));
    setBirthday(getBirthdayNumber(birthDate));
    setArrows(calculateArrows(birthDate));
    setPersonalYear(calculatePersonalYear(birthDate));

    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 2000);
  };

  const lpData = lifePath ? lifePathData[lifePath.number] || lifePathData[1] : null;
  const bdData = birthday ? birthdayData[birthday] || birthdayData[1] : null;
  const pyData = personalYear ? personalYearData[personalYear.number] || personalYearData[1] : null;

  // Format date for display: YYYY-MM-DD -> DD Mart YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
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
                <p className="text-sm text-white/60">Pisagor okları ve yaşam yolunuz analiz ediliyor</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi *</label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    required 
                    type="date" 
                    min="1900-01-01"
                    max="2100-12-31"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#AF52DE] transition-colors" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#AF52DE] hover:bg-[#8e3ec2] text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(175,82,222,0.3)]">
                Numerolojik Profilimi Çıkar
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Report Header */}
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#D4AF37]">Yaşam Boyu Raporu</h2>
              <span className="text-white font-medium bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                {formatDate(birthDate)}
              </span>
            </div>

            {/* Life Path Number */}
            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-[#AF52DE]/40 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#AF52DE]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#AF52DE]/10 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="flex flex-col items-center justify-start shrink-0">
                  <div className="text-sm text-mystic-text-muted mb-3 uppercase tracking-wider font-semibold">Yaşam Yolu</div>
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#AF52DE]/20 to-transparent border border-[#AF52DE]/30 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-5xl font-light text-white font-serif">{lifePath?.number}</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-2xl font-bold text-[#AF52DE] mb-2">Yaşam Yolu Numarası - {lifePath?.number}</h3>
                    <p className="text-sm text-gray-400 font-mono bg-black/30 p-2 rounded-lg inline-block border border-white/5">
                      {lifePath?.calculationString}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Target size={18} className="text-[#AF52DE]" /> Karakter, olasılıklar:
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {lpData?.character}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <ArrowRight size={18} className="text-[#AF52DE]" /> Zayıf yönler, öğrenilmesi gerekenler:
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {lpData?.weakness}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Birthday Number */}
            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-[#4285F4]/40 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#4285F4]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#4285F4]/10 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="flex flex-col items-center justify-start shrink-0">
                  <div className="text-sm text-mystic-text-muted mb-3 uppercase tracking-wider font-semibold">Doğum Günü</div>
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#4285F4]/20 to-transparent border border-[#4285F4]/30 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-5xl font-light text-white font-serif">{birthday}</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-2xl font-bold text-[#4285F4] mb-2">Doğum Günü Numarası - {birthday} - Yetenek</h3>
                    <p className="text-sm text-gray-400 font-mono bg-black/30 p-2 rounded-lg inline-block border border-white/5">
                      {birthDate.split('-').reverse().join('.')}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Heart size={18} className="text-[#4285F4]" /> Karakter, potansiyeller:
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {bdData?.character}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <ArrowRight size={18} className="text-[#4285F4]" /> Zayıf yönler, öğrenilmesi gerekenler:
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {bdData?.weakness}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pythagorean Arrows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {arrows?.arrowKeys.map(arrowKey => {
                const arrowData = arrowsData[arrowKey];
                return (
                  <div key={arrowKey} className="bg-black/30 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{arrowData.name}</h3>
                    <p className="text-sm text-[#D4AF37] mb-3 font-mono">Tam Ok {arrowKey}</p>
                    <div className="bg-black/50 py-2 px-4 rounded-lg mb-4 text-center font-mono tracking-widest text-gray-300 border border-white/5">
                      {arrows.visualString}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {arrowData.description}
                    </p>
                  </div>
                );
              })}
              
              {arrows?.emptyArrowKeys?.map(arrowKey => {
                const arrowData = emptyArrowsData[arrowKey];
                return (
                  <div key={`empty-${arrowKey}`} className="bg-black/30 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{arrowData.name}</h3>
                    <p className="text-sm text-gray-400 mb-3 font-mono">Boş Ok {arrowKey}</p>
                    <div className="bg-black/50 py-2 px-4 rounded-lg mb-4 text-center font-mono tracking-widest text-gray-300 border border-white/5 opacity-50">
                      {arrows.visualString}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {arrowData.description}
                    </p>
                  </div>
                );
              })}
              
              {(!arrows?.arrowKeys || arrows.arrowKeys.length === 0) && (!arrows?.emptyArrowKeys || arrows.emptyArrowKeys.length === 0) && (
                <div className="col-span-1 md:col-span-2 bg-black/30 border border-white/5 rounded-2xl p-6 text-center">
                  <p className="text-gray-400">Haritanızda tam oluşmuş veya tamamen boş bir Pisagor Oku bulunmamaktadır. Bu durum esnekliğinizi ve farklı enerjilere açık olduğunuzu gösterir.</p>
                </div>
              )}
            </div>

            {/* Personal Year */}
            <div className="bg-gradient-to-br from-[#32D74B]/10 to-transparent border border-[#32D74B]/30 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-[#32D74B] mb-2 border-b border-[#32D74B]/20 pb-4">
                Mevcut Döneme İlişkin Rapor
              </h2>
              
              <div className="mt-6 flex flex-col md:flex-row gap-6">
                 <div className="w-24 h-24 shrink-0 rounded-2xl bg-black/40 border border-[#32D74B]/30 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-4xl font-light text-[#32D74B] font-serif">{personalYear?.number}</span>
                 </div>
                 
                 <div className="flex-1">
                   <h3 className="text-lg font-bold text-white mb-2">Kişisel Yıl {personalYear?.number} - {pyData?.title}</h3>
                   <p className="text-xs text-gray-400 mb-4 font-mono">
                     Bir sonraki doğum gününe kadar (Son tarih: {formatDate(`${new Date().getFullYear() + 1}-${birthDate.split('-')[1]}-${birthDate.split('-')[2]}`)}):<br/>
                     {personalYear?.calculationString}
                   </p>
                   <p className="text-gray-300 text-sm leading-relaxed">
                     {pyData?.description}
                   </p>
                 </div>
              </div>
            </div>
            
            <button onClick={() => setShowResult(false)} className="mt-8 text-[#AF52DE] hover:text-white transition-colors underline text-sm w-full text-center">
              Yeni Bir Hesaplama Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
