"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, Sparkles, Target, Award, ShieldAlert, 
  ArrowRight, RefreshCw, Layers, Compass, CheckCircle2,
  Zap, DollarSign, Flame, Lightbulb, Navigation, Clock, Calendar,
  Palette, Building2, FileText, Hammer, Music, HeartHandshake
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[700px] h-[350px] sm:h-[700px] bg-gradient-to-tr from-[#EAB308]/10 via-[#8B5CF6]/10 to-transparent rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />

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
          <p className="text-xs sm:text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Gezegenlerinizin, zihinsel yetenek açılarının ve kadersel döngülerinizin senteziyle en uygun meslek alanlarınızı, ideal odak modelinizi ve servet rotanızı keşfedin.
          </p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs sm:text-sm mb-6 flex items-center gap-3 max-w-xl mx-auto">
            <ShieldAlert size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* INPUT FORM */}
        {!result && (
          <div className="max-w-xl mx-auto bg-black/60 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                  Adınız ve Soyadınız
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Baha Yılmaz"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EAB308] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EAB308] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                    Doğum Saati (Opsiyonel)
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EAB308] transition-colors"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Bilinmiyorsa 12:00 kalabilir.</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                  Doğum Yeri (Şehir)
                </label>
                <LocationAutocomplete
                  defaultDisplay={birthCity ? `${birthCity.name}, ${birthCity.country}` : ''}
                  onSelect={(city) => setBirthCity(city)}
                  placeholder="Doğduğunuz şehri yazın..."
                />
              </div>

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

        {/* RESULTS SECTION */}
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
                    {result.personalInfo.birthDate ? result.personalInfo.birthDate.split('T')[0].split('-').reverse().join('.') : ''} • {result.personalInfo.cityName} (Yaş: {result.careerTimeline?.currentAge || ''})
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
                <span className="text-xs sm:text-sm font-bold text-[#8B5CF6] block leading-snug">
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

            {/* 1. İDEAL ÇALIŞMA MODELİ */}
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

            {/* 2. KRİTİK KARİYER DÖNÜM YAŞLARI & KADERSEL ZAMAN ÇİZELGESİ */}
            {result.careerTimeline && (
              <div className="bg-black/60 border border-amber-500/30 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 font-bold block">
                        Kadersel Zamanlama & Kariyer Döngüleri
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        Şu Anki Kadersel Evreniz ({result.careerTimeline.currentAge} Yaşındasınız)
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 self-start sm:self-auto font-semibold">
                    {result.careerTimeline.activeMilestone.ageRange}
                  </span>
                </div>

                {/* Aktif Evre Parlayan Kutu */}
                <div className="bg-gradient-to-br from-amber-500/15 via-black/50 to-black/80 border border-amber-500/40 p-4 sm:p-5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-bold text-amber-400 flex items-center gap-2">
                      <span>⚡ {result.careerTimeline.activeMilestone.title}</span>
                    </h4>
                    <span className="text-[11px] text-gray-400 italic">
                      {result.careerTimeline.activeMilestone.planetCycle}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                    {result.careerTimeline.activeMilestone.description}
                  </p>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                    <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Bu Evrenin Altın Kuralı:</strong> {result.careerTimeline.activeMilestone.actionGuidance}</span>
                  </div>
                </div>

                {/* 5 Aşamalı Yaş Yol Haritası (Timeline) */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-gray-400 block mb-2">
                    Hayat Boyu Kadersel Kariyer Yol Haritanız:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {result.careerTimeline.milestones.map((m, mIdx) => {
                      const isActive = m.status === 'active';
                      const isCompleted = m.status === 'completed';

                      return (
                        <div
                          key={mIdx}
                          className={`p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                            isActive
                              ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                              : isCompleted
                              ? 'bg-white/5 border-green-500/30 text-gray-300'
                              : 'bg-white/[0.02] border-white/5 text-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-white text-[11px]">
                              {m.ageRange}
                            </span>
                            {isActive ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-black">
                                AKTİF
                              </span>
                            ) : isCompleted ? (
                              <span className="text-[10px] text-green-400 font-bold">✓ Geçildi</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Gelecek</span>
                            )}
                          </div>
                          <span className={`font-semibold leading-tight text-[11px] ${isActive ? 'text-amber-300' : 'text-gray-300'}`}>
                            {m.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. KARİYER ODAK STRATEJİSİ (Tek Alanda Derinleşme mi, Çok Kanallı Polimat mı?) */}
            {result.focusStrategy && (
              <div className="bg-black/60 border border-blue-500/30 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Compass size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-blue-400 font-bold block">
                      Kariyer Odak & Uzmanlaşma Stratejisi
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {result.focusStrategy.type}
                    </h3>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-blue-300 inline-block mb-3">
                  {result.focusStrategy.motto}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
                  {result.focusStrategy.explanation}
                </p>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
                  <Lightbulb size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>Stratejik Eylem:</strong> {result.focusStrategy.actionAdvice}</span>
                </div>
              </div>
            )}

            {/* 4. TÜM SEKTÖRLER VE %100 ENERJİ SPEKTRUMU */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-1">
                <div className="p-2 rounded-xl bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20">
                  <Target size={18} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Kariyer Potansiyeli ve Sektörel Enerji Dağılımınız
                  </h3>
                  <span className="text-[11px] sm:text-xs text-gray-400 block">
                    Gezegen yerleşimlerinizin %100 üzerinden hesaplanan eksiksiz sektörel dağılımı
                  </span>
                </div>
              </div>

              {/* %100 Spektrum Çubuğu */}
              {result.energyDistribution && (
                <div className="bg-black/60 border border-white/10 p-4 sm:p-5 rounded-3xl shadow-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-gray-200">Kişisel Potansiyel Spektrumu (%100 Toplam)</span>
                    <span className="text-[11px] text-gray-400">7 sektörün haritanızdaki kümülatif payı</span>
                  </div>

                  <div className="w-full h-3.5 sm:h-4 bg-white/5 rounded-full p-0.5 border border-white/10 flex overflow-hidden">
                    {result.energyDistribution.segments.map((seg, sIdx) => (
                      <div
                        key={sIdx}
                        style={{ width: `${Math.max(3, seg.percentage)}%`, backgroundColor: seg.color }}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 relative"
                        title={`${seg.title}: %${seg.percentage}`}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
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

              {/* 3 Ana Sektör Kartları */}
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

              {/* Kalan 4 İkincil Sektör */}
              {result.secondarySectors && result.secondarySectors.length > 0 && (
                <div className="bg-black/50 border border-white/10 p-4 sm:p-6 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        İkincil & Destekleyici Kariyer Potansiyelleriniz
                      </h4>
                      <span className="text-[11px] text-gray-400">
                        Kariyer odağınızı zenginleştiren diğer tamamlayıcı yetkinlik alanlarınız
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">4 Tamamlayıcı Alan</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {result.secondarySectors.map((sec, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between gap-2"
                        style={{ borderLeftColor: sec.color, borderLeftWidth: '3px' }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {sec.shortTitle}
                          </span>
                          <span
                            className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-white/5"
                            style={{ color: sec.color }}
                          >
                            %{sec.percentage}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {sec.recommendedRoles.map((r, rIdx) => (
                            <span key={rIdx} className="text-[10px] bg-black/40 text-gray-400 px-1.5 py-0.5 rounded">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. GEZEGEN YERLEŞİMLERİNE GÖRE MESLEKİ, ZANAAT & SANAT HARİTASI */}
            {result.planetaryInsights && result.planetaryInsights.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-1">
                  <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <Palette size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Gezegen Yerleşimlerinize Göre Mesleki & Zanaat Göstergeleri
                    </h3>
                    <span className="text-[11px] sm:text-xs text-gray-400 block">
                      Doğum haritanızdaki gezegenlerin kamu memurluğu, tekstil, müzik, zanaat ve sahadaki doğrudan karşılıkları
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.planetaryInsights.map((insight, pIdx) => {
                    const getIcon = (iconName: string) => {
                      switch (iconName) {
                        case 'Palette': return <Palette size={18} className="text-pink-400" />;
                        case 'Building2': return <Building2 size={18} className="text-blue-400" />;
                        case 'FileText': return <FileText size={18} className="text-amber-400" />;
                        case 'Hammer': return <Hammer size={18} className="text-red-400" />;
                        case 'Music': return <Music size={18} className="text-purple-400" />;
                        case 'HeartHandshake': return <HeartHandshake size={18} className="text-emerald-400" />;
                        default: return <Briefcase size={18} className="text-gray-400" />;
                      }
                    };

                    const getDomainColor = (iconName: string) => {
                      switch (iconName) {
                        case 'Palette': return 'border-pink-500/30 bg-pink-500/10 text-pink-300';
                        case 'Building2': return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
                        case 'FileText': return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
                        case 'Hammer': return 'border-red-500/30 bg-red-500/10 text-red-300';
                        case 'Music': return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
                        case 'HeartHandshake': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
                        default: return 'border-white/10 bg-white/5 text-gray-300';
                      }
                    };

                    return (
                      <div
                        key={pIdx}
                        className="bg-black/50 border border-white/10 hover:border-white/20 p-4 sm:p-5 rounded-2xl flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                {getIcon(insight.iconName)}
                              </div>
                              <span className="text-xs font-bold text-white">
                                {insight.planet} ({insight.sign} • {insight.house}. Ev)
                              </span>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDomainColor(insight.iconName)}`}>
                              {insight.domain}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-semibold text-gray-200 mb-2 leading-snug">
                            {insight.title}
                          </h4>

                          <p className="text-xs text-gray-400 leading-relaxed mb-3">
                            {insight.explanation}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1.5 font-medium">
                            Yatkın Meslekler & Zanaat Dalları:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {insight.suitableProfessions.map((prof, profIdx) => (
                              <span
                                key={profIdx}
                                className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-md"
                              >
                                {prof}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. KADERSEL EVRİLME (DHARMA - KUZEY DÜĞÜMÜ ROTASI) */}
            {result.dharmaPath && (
              <div className="bg-gradient-to-br from-purple-500/10 via-black/60 to-black/80 border border-purple-500/30 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Navigation size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-purple-400 font-bold block">
                      Kadersel Evrilme Rotası (Dharma)
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {result.dharmaPath.title}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                      Aşılması Gereken Konfor Alanı:
                    </span>
                    <p className="text-xs sm:text-sm text-gray-300">
                      {result.dharmaPath.fromComfortZone}
                    </p>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/20 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-purple-300 uppercase tracking-wider block mb-1 font-bold">
                      Kadersel Büyüme Hedefi:
                    </span>
                    <p className="text-xs sm:text-sm text-white font-medium">
                      {result.dharmaPath.toGrowthMission}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/5">
                  ✨ <strong>Kariyer Sıçraması:</strong> {result.dharmaPath.careerImpact}
                </p>
              </div>
            )}

            {/* 6. PARA & SERVET ÇEKME MODELİ VE TÜKENMİŞLİK KALKANI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Para Çekme Modeli */}
              {result.wealthMagnet && (
                <div className="bg-black/50 border border-emerald-500/30 p-5 sm:p-6 rounded-3xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-emerald-400 font-bold block">Servet Çekme Kapısı</span>
                      <h4 className="text-base sm:text-lg font-bold text-white">{result.wealthMagnet.channelTitle}</h4>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
                    {result.wealthMagnet.mechanism}
                  </p>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-200">
                    <strong>Uygulanabilir Formül:</strong> {result.wealthMagnet.practicalFormula}
                  </div>
                </div>
              )}

              {/* Tükenmişlik Kalkanı */}
              {result.burnoutShield && (
                <div className="bg-black/50 border border-rose-500/30 p-5 sm:p-6 rounded-3xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Flame size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-rose-400 font-bold block">Tükenmişlik Kalkanı</span>
                      <h4 className="text-base sm:text-lg font-bold text-white">Enerji Sızıntısı & Koruma</h4>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-2">
                    <strong>Temel Risk:</strong> {result.burnoutShield.coreRisk}
                  </p>
                  <p className="text-xs text-rose-300/80 mb-3">
                    <strong>Kaçınılması Gereken:</strong> {result.burnoutShield.toxicEnvironments}
                  </p>
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-200">
                    <strong>Koruma Kalkanı:</strong> {result.burnoutShield.protectionFormula}
                  </div>
                </div>
              )}
            </div>

            {/* 7. SÜPER GÜÇ VE GÖLGE TUZAKLAR */}
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

            {/* 8. 4 STRATEJİK EYLEM ADIMI */}
            <div className="bg-black/60 border border-white/10 p-5 sm:p-8 rounded-3xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Kadersel Kariyer Eylem Planınız
                  </h3>
                  <span className="text-[11px] sm:text-xs text-gray-400 block">
                    Zirveye ulaşmak için hemen uygulayabileceğiniz 4 somut stratejik kural
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                {result.actionableGuidance.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-3.5 hover:border-[#EAB308]/30 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
