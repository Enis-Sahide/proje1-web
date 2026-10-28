"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, Sparkles, Target, Award, ShieldAlert, 
  ArrowRight, User, Calendar, Clock, MapPin, Loader2,
  RefreshCw, Layers, Compass, CheckCircle2
} from 'lucide-react';
import AnalysisBackButton from '@/components/ui/AnalysisBackButton';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { AstroCity, ASTRO_CITIES } from '@/features/astrology/engine/AstrologyConstants';
import type { CareerAnalysisResult } from '@/features/astrology/engine/CareerEngine';
import { useAuth } from '@/context/AuthContext';

export default function CareerAnalysisPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthCity, setBirthCity] = useState<AstroCity | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CareerAnalysisResult | null>(null);

  // Load from user profile if exists
  useEffect(() => {
    if (user) {
      const anyUser = user as any;
      if (anyUser.fullName && !fullName) setFullName(anyUser.fullName);
      if (anyUser.birthDate && !birthDate) setBirthDate(anyUser.birthDate);
      if (anyUser.birthTime && birthTime === '12:00') setBirthTime(anyUser.birthTime);
      if (anyUser.birthPlace && !birthCity) {
        const found = ASTRO_CITIES.find(c => c.name.toLowerCase() === anyUser.birthPlace?.toLowerCase());
        if (found) setBirthCity(found);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Lütfen Ad ve Soyadınızı giriniz.');
      return;
    }
    if (!birthDate) {
      setError('Lütfen Doğum Tarihinizi seçiniz.');
      return;
    }
    if (!birthCity) {
      setError('Lütfen Doğum Yerinizi listeden seçiniz.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/astrology/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          birthDate,
          birthTime: birthTime || '12:00',
          birthCity
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Hesaplama sırasında sunucu hatası oluştu.');
      }

      setResult(data);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Career analysis error:', err);
      setError(err?.message || 'Hesaplama sırasında beklenmeyen bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-20 px-3.5 sm:px-6 relative overflow-x-hidden text-white bg-[#0a0a0f]">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[700px] h-[350px] sm:h-[700px] bg-gradient-to-tr from-[#EAB308]/10 via-[#AF52DE]/10 to-transparent rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto w-full">
        <AnalysisBackButton />

        {/* HEADER */}
        <div className="text-center mb-8 sm:mb-10 px-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] mb-4 shadow-[0_0_25px_rgba(234,179,8,0.2)]">
            <Briefcase size={26} className="sm:w-7 sm:h-7" />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#EAB308] via-white to-[#EAB308] mb-3 tracking-tight">
            Mesleki Yatkınlık & Kariyer Analizi
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-mystic-text-muted max-w-2xl mx-auto leading-relaxed">
            Doğum potansiyelinizin ve yetenek kodlarınızın senteziyle en uygun meslek alanlarınızı, ideal çalışma modelinizi ve kadersel başarı rotanızı keşfedin.
          </p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs sm:text-sm mb-6 flex items-center gap-3 max-w-xl mx-auto">
            <ShieldAlert size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM SECTION */}
        {!result && (
          <div className="max-w-2xl mx-auto bg-black/50 backdrop-blur-xl border border-white/10 p-5 sm:p-8 md:p-10 rounded-3xl shadow-2xl relative">
            {isLoading && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl z-20 flex flex-col items-center justify-center text-center p-6">
                <Loader2 size={44} className="animate-spin text-[#EAB308] mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Kariyer Profiliniz Çıkarılıyor...</h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                  Liderlik potansiyeliniz, çalışma dinamiğiniz ve ideal sektörleriniz hesaplanıyor.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Ad Soyad */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                  Adınız ve Soyadınız <span className="text-[#EAB308]">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Yılmaz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#EAB308] transition-colors"
                  />
                </div>
              </div>

              {/* Doğum Tarihi & Saati */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                    Doğum Tarihi <span className="text-[#EAB308]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="date"
                      required
                      min="1900-01-01"
                      max="2100-12-31"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-[#EAB308] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                    Doğum Saati <span className="text-[#EAB308]">*</span>
                  </label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="time"
                      required
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-[#EAB308] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Doğum Yeri (Şehir) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                  Doğum Yeri (Şehir / Ülke) <span className="text-[#EAB308]">*</span>
                </label>
                <LocationAutocomplete
                  defaultDisplay={birthCity ? `${birthCity.name}, ${birthCity.country}` : ''}
                  onSelect={(city) => setBirthCity(city)}
                  placeholder="Doğduğunuz şehri yazın..."
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Doğum yeri ve saati, kariyer zirvenizi ve çalışma alanı çizgilerini tam olarak tespit etmek için kullanılır.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] bg-gradient-to-r from-[#EAB308] via-[#D4AF37] to-[#EAB308] hover:opacity-95 text-black font-extrabold text-sm sm:text-base py-3.5 sm:py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Briefcase size={18} />
                <span>Kariyer Raporumu Çıkar</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* RESULTS SECTION - SINGLE WINDOW / DIRECT PRESENTATION */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Header Card */}
            <div className="bg-black/60 border border-white/10 p-5 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#EAB308]/20 to-transparent border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308] shrink-0 shadow-lg">
                  <Award size={30} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#EAB308] font-bold block mb-0.5">
                    Kariyer & Mesleki Yatkınlık Raporu
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                    {result.personalInfo.fullName}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 truncate">
                    {result.personalInfo.birthDate} • {result.personalInfo.cityName}
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Yeni Analiz Yap</span>
              </button>
            </div>

            {/* 4 Core Summary Badges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl text-center">
                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Liderlik Tarzı</span>
                <span className="text-xs sm:text-sm font-bold text-[#EAB308] block leading-snug">
                  {result.summaryBadges.leadershipStyle}
                </span>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl text-center">
                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Çalışma Dinamiği</span>
                <span className="text-xs sm:text-sm font-bold text-white block leading-snug">
                  {result.summaryBadges.workDynamic}
                </span>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl text-center">
                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Temel Yetkinlik</span>
                <span className="text-xs sm:text-sm font-bold text-[#AF52DE] block leading-snug">
                  {result.summaryBadges.coreAsset}
                </span>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl text-center">
                <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Karar Mekanizması</span>
                <span className="text-xs sm:text-sm font-bold text-green-400 block leading-snug">
                  {result.summaryBadges.decisionMotto}
                </span>
              </div>
            </div>

            {/* 1. İDEAL ÇALIŞMA MODELİ (BÜYÜK SENTEZ) */}
            <div className="bg-gradient-to-br from-[#EAB308]/15 via-black/70 to-black/90 border border-[#EAB308]/40 rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-5 mb-5">
                <div>
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#EAB308] font-bold block mb-1">
                    Büyük Sentez • Sizin İçin En İdeal Çalışma Modeli
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white">
                    {result.idealWorkModel.type}
                  </h3>
                </div>
                <div className="bg-black/60 border border-[#EAB308]/40 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-center shrink-0">
                  <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase block">Uyum Skoru</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#EAB308]">
                    %{result.idealWorkModel.percentage}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-base text-gray-200 leading-relaxed">
                {result.idealWorkModel.explanation}
              </p>
            </div>

            {/* 2. EN UYGUN SEKTÖRLER VE %100 ENERJİ DAĞILIMI */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-1">
                <div className="p-2 rounded-xl bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20">
                  <Target size={18} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    En Yüksek Başarı Vadeden Kariyer Alanlarınız
                  </h3>
                  <span className="text-[11px] sm:text-xs text-gray-400 block">
                    Gezegen yerleşimlerinizin %100 üzerinden hesaplanan matematiksel potansiyel dağılımı
                  </span>
                </div>
              </div>

              {/* %100 Kariyer Spektrumu Çubuğu (Mobil Uyumlu) */}
              {result.energyDistribution && (
                <div className="bg-black/60 border border-white/10 p-4 sm:p-5 rounded-3xl shadow-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-gray-200">Kişisel Potansiyel Spektrumu (%100)</span>
                    <span className="text-[11px] text-gray-400">Tüm haritanın kümülatif enerji dağılımı</span>
                  </div>

                  {/* Yatay Segmentli Çubuk */}
                  <div className="w-full h-3.5 sm:h-4 bg-white/5 rounded-full p-0.5 border border-white/10 flex overflow-hidden">
                    {result.energyDistribution.segments.map((seg, sIdx) => (
                      <div
                        key={sIdx}
                        style={{ width: `${Math.max(4, seg.percentage)}%`, backgroundColor: seg.color }}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 relative"
                        title={`${seg.title}: %${seg.percentage}`}
                      />
                    ))}
                  </div>

                  {/* Mobil Dostu Segment Etiketleri (Wrap) */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1">
                    {result.energyDistribution.segments.map((seg, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5 text-[11px] sm:text-xs bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-gray-300 font-medium">{seg.title}</span>
                        <span className="font-bold text-white">%{seg.percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3 Ana Sektör Kartları (Mobilde 1 sütun, masaüstünde 3 sütun) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {result.topSectors.map((sector, idx) => (
                  <div
                    key={idx}
                    className="bg-black/50 border border-white/10 hover:border-white/30 p-5 sm:p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden"
                    style={{ borderTopColor: sector.color, borderTopWidth: '3px' }}
                  >
                    <div
                      className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
                      style={{ backgroundColor: sector.color }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                          style={{
                            backgroundColor: `${sector.color}20`,
                            color: sector.color,
                            border: `1px solid ${sector.color}40`
                          }}
                        >
                          {sector.category}
                        </span>
                        <span
                          className="text-sm sm:text-base font-extrabold px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10"
                          style={{ color: sector.color }}
                        >
                          %{sector.percentage} Pay
                        </span>
                      </div>

                      <h4 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
                        {sector.title}
                      </h4>

                      <p className="text-xs text-gray-400 leading-relaxed mb-4">
                        {sector.description}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-white/5 space-y-2">
                      <span className="text-[11px] font-semibold text-gray-300 block">Önerilen İdeal Roller:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sector.recommendedRoles.map((role, rIdx) => (
                          <span key={rIdx} className="text-[11px] bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-lg">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* İkincil / Destekleyici Potansiyeller (Tekil Yüzdelerle Mobil Uyumlu) */}
              {result.secondarySectors && result.secondarySectors.length > 0 && (
                <div className="bg-black/50 border border-white/10 p-4 sm:p-5 rounded-3xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-gray-200">
                      İkincil & Destekleyici Kariyer Potansiyelleriniz
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Kariyerinizi güçlendiren tamamlayıcı yan yetkinlikler
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {result.secondarySectors.map((sec, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-white/5 border border-white/10 p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sec.color }}
                          />
                          <span className="text-[11px] sm:text-xs font-medium text-gray-200 truncate">
                            {sec.shortTitle}
                          </span>
                        </div>
                        <span
                          className="text-xs sm:text-sm font-bold shrink-0"
                          style={{ color: sec.color }}
                        >
                          %{sec.percentage}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-400 pt-1 leading-relaxed">
                    Kariyer odağınız ilk 3 ana alanda yoğunlaşırken; bu ikincil alanlar kriz anlarında veya çok kanallı projelerde size esneklik ve rekabet avantajı sağlar.
                  </p>
                </div>
              )}
            </div>

            {/* 3. SÜPER GÜÇ VE GÖLGE TUZAKLAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Süper Güç */}
              <div className="bg-black/40 border border-green-500/30 p-5 sm:p-6 rounded-3xl relative overflow-hidden group hover:border-green-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">Kariyer Süper Gücünüz</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {result.superPower}
                </p>
              </div>

              {/* Gölge Tuzaklar */}
              <div className="bg-black/40 border border-red-500/30 p-5 sm:p-6 rounded-3xl relative overflow-hidden group hover:border-red-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                    <ShieldAlert size={20} />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">Kaçınılması Gereken Kariyer Tuzakları</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {result.shadowPitfalls}
                </p>
              </div>
            </div>

            {/* 4. STRATEJİK EYLEM REHBERİ */}
            <div className="bg-black/40 border border-white/10 p-5 sm:p-8 rounded-3xl space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Compass size={20} className="text-[#EAB308]" />
                <span>Zirveye Ulaşmak İçin 4 Stratejik Kariyer Tavsiyesi</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {result.actionableGuidance.map((guide, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-3.5 sm:p-4 rounded-2xl flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#EAB308]/20 border border-[#EAB308]/40 flex items-center justify-center text-xs font-bold text-[#EAB308] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{guide}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Reset Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>Farklı Bir Kişi İçin Analiz Yap</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
