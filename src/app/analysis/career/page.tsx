"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, Sparkles, Compass, Target, Award, ShieldAlert, 
  ArrowRight, User, Calendar, Clock, MapPin, Loader2, CheckCircle2,
  TrendingUp, Building2, Flame, RefreshCw, Star, Layers, Check
} from 'lucide-react';
import AnalysisBackButton from '@/components/ui/AnalysisBackButton';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { AstroCity, ASTRO_CITIES } from '@/features/astrology/engine/AstrologyConstants';
import { CareerEngine, CareerAnalysisResult } from '@/features/astrology/engine/CareerEngine';
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

  // Active section tab for result
  const [activeTab, setActiveTab] = useState<'overview' | 'astrology' | 'numerology' | 'humandesign' | 'sectors'>('overview');

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
      setError('Lütfen Ad ve Soyadınızı giriniz (Numeroloji Kader Sayısı için zorunludur).');
      return;
    }
    if (!birthDate) {
      setError('Lütfen Doğum Tarihinizi seçiniz.');
      return;
    }
    if (!birthCity) {
      setError('Lütfen Doğum Yerinizi listeden seçiniz (10. Ev MC kariyer zirvesini hesaplamak için zorunludur).');
      return;
    }

    setIsLoading(true);

    try {
      // 1-2 saniye zengin hesaplama hissi ve işlem süresi
      const analysisResult = await CareerEngine.analyze(
        fullName.trim(),
        birthDate,
        birthTime || '12:00',
        birthCity
      );
      setResult(analysisResult);
    } catch (err: any) {
      console.error('Career analysis error:', err);
      setError('Hesaplama sırasında beklenmeyen bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative overflow-x-hidden text-white bg-[#0a0a0f]">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#EAB308]/10 via-[#AF52DE]/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto">
        <AnalysisBackButton />

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] mb-4 shadow-[0_0_25px_rgba(234,179,8,0.2)]">
            <Briefcase size={28} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#EAB308] via-white to-[#EAB308] mb-3 tracking-tight">
            Mesleki Yatkınlık & Kariyer Analizi
          </h1>
          <p className="text-sm sm:text-base text-mystic-text-muted max-w-2xl mx-auto leading-relaxed">
            Doğum haritanızdaki <strong>10. Ev (MC Kariyer Zirvesi)</strong>, <strong>Numerolojik Kader Titreşimi</strong> ve <strong>Human Design İş Stratejisi</strong> ile ideal meslek alanlarınızı ve başarı potansiyelinizi keşfedin.
          </p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm mb-8 flex items-center gap-3 max-w-xl mx-auto">
            <ShieldAlert size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM SECTION */}
        {!result && (
          <div className="max-w-2xl mx-auto bg-black/50 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl relative">
            {isLoading && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl z-20 flex flex-col items-center justify-center text-center p-6">
                <Loader2 size={48} className="animate-spin text-[#EAB308] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Kozmik Kariyer Kodlarınız Taranıyor...</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  10. Ev MC tepe noktası, 6. Ev çalışma alanı, Kader sayısı ve Human Design iş stratejiniz sentezleniyor.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ad Soyad */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nüfus Cüzdanındaki Tam Adınız ve Soyadınız <span className="text-[#EAB308]">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Yılmaz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#EAB308] transition-colors"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  İsminizin ses frekansından dünyevi mesleki misyonunuz (Kader Sayısı) hesaplanır.
                </span>
              </div>

              {/* Doğum Tarihi & Saati */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-[#EAB308] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Doğum Saati <span className="text-[#EAB308]">*</span>
                  </label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="time"
                      required
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-[#EAB308] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Doğum Yeri (Şehir) */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Doğum Yeri (Şehir / Ülke) <span className="text-[#EAB308]">*</span>
                </label>
                <LocationAutocomplete
                  defaultDisplay={birthCity ? `${birthCity.name}, ${birthCity.country}` : ''}
                  onSelect={(city) => setBirthCity(city)}
                  placeholder="Doğduğunuz şehri yazın..."
                />
                <div className="bg-[#EAB308]/5 border border-[#EAB308]/20 rounded-xl p-3.5 mt-3 text-xs text-amber-200/80 leading-relaxed flex items-start gap-2.5">
                  <MapPin size={16} className="text-[#EAB308] shrink-0 mt-0.5" />
                  <span>
                    <strong>Doğum Yeri ve Saati Neden Önemli?</strong> Haritanızdaki <strong>10. Ev (MC Kariyer Zirvesi)</strong> ve 6. Ev çalışma alanı, doğduğunuz coğrafi koordinatlara göre belirlenir. Tam saati bilmiyorsanız yaklaşık saatle genel eğilimler hesaplanır.
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#EAB308] via-[#D4AF37] to-[#EAB308] hover:opacity-95 text-black font-extrabold text-base sm:text-lg py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.35)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase size={20} />
                <span>Kariyer Raporumu Çıkar</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* RESULTS SECTION */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Summary Bar */}
            <div className="bg-black/60 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EAB308]/20 to-transparent border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308] shrink-0 shadow-lg">
                  <Award size={32} />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#EAB308] font-bold block mb-1">
                    Kozmik Kariyer Profili
                  </span>
                  <h2 className="text-2xl font-bold text-white">
                    {result.personalInfo.fullName}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {result.personalInfo.birthDate} • {result.personalInfo.birthTime} • {result.personalInfo.cityName}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Yeni Analiz</span>
                </button>
              </div>
            </div>

            {/* 4 Pillars Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-black/40 border border-white/10 p-4 sm:p-5 rounded-2xl text-center">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">10. Ev MC (Zirve)</span>
                <span className="text-xl sm:text-2xl font-bold text-[#EAB308] font-serif block">
                  {result.astrology.mcSign} ({result.astrology.mcDegree}°)
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block truncate">Toplumsal İtibar</span>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 sm:p-5 rounded-2xl text-center">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Kader Sayısı</span>
                <span className="text-xl sm:text-2xl font-bold text-[#AF52DE] font-serif block">
                  {result.numerology.destinyNumber}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block truncate">{result.numerology.destinyTitle}</span>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 sm:p-5 rounded-2xl text-center">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Yaşam Yolu</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-serif block">
                  {result.numerology.lifePathNumber}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block truncate">Ruhsal Kariyer Karması</span>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 sm:p-5 rounded-2xl text-center">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Human Design</span>
                <span className="text-xl sm:text-2xl font-bold text-green-400 font-serif block">
                  {result.humanDesign.type}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block truncate">{result.humanDesign.profile}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#EAB308] text-black shadow-lg shadow-[#EAB308]/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                👑 Büyük Sentez & Model
              </button>
              <button
                onClick={() => setActiveTab('sectors')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'sectors'
                    ? 'bg-[#EAB308] text-black shadow-lg shadow-[#EAB308]/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                🎯 En Uygun Sektörler
              </button>
              <button
                onClick={() => setActiveTab('astrology')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'astrology'
                    ? 'bg-[#EAB308] text-black shadow-lg shadow-[#EAB308]/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                🪐 Astroloji Kariyer Üçgeni
              </button>
              <button
                onClick={() => setActiveTab('numerology')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'numerology'
                    ? 'bg-[#EAB308] text-black shadow-lg shadow-[#EAB308]/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                🔢 Numeroloji Misyonu
              </button>
              <button
                onClick={() => setActiveTab('humandesign')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'humandesign'
                    ? 'bg-[#EAB308] text-black shadow-lg shadow-[#EAB308]/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                ⚡ Human Design Stratejisi
              </button>
            </div>

            {/* TAB CONTENT */}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* İdeal Çalışma Modeli */}
                <div className="bg-gradient-to-br from-[#EAB308]/15 via-black/70 to-black/90 border border-[#EAB308]/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#EAB308] font-bold block mb-1">
                        Sizin İçin En İdeal Çalışma Formatı
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                        {result.synthesis.idealWorkModel.type}
                      </h3>
                    </div>
                    <div className="bg-black/60 border border-[#EAB308]/40 px-5 py-2.5 rounded-2xl text-center shrink-0">
                      <span className="text-[10px] text-gray-400 uppercase block">Uyum Skoru</span>
                      <span className="text-2xl font-bold text-[#EAB308]">
                        %{result.synthesis.idealWorkModel.percentage}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                    {result.synthesis.idealWorkModel.explanation}
                  </p>
                </div>

                {/* Süper Güç & Gölge Tuzaklar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Süper Güç */}
                  <div className="bg-black/40 border border-green-500/30 p-6 rounded-3xl relative overflow-hidden group hover:border-green-500/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                        <Sparkles size={20} />
                      </div>
                      <h4 className="text-lg font-bold text-white">Kariyer Süper Gücünüz</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {result.synthesis.superPower}
                    </p>
                  </div>

                  {/* Gölge Tuzaklar */}
                  <div className="bg-black/40 border border-red-500/30 p-6 rounded-3xl relative overflow-hidden group hover:border-red-500/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                        <ShieldAlert size={20} />
                      </div>
                      <h4 className="text-lg font-bold text-white">Kaçınılması Gereken Kariyer Tuzakları</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {result.synthesis.shadowPitfalls}
                    </p>
                  </div>
                </div>

                {/* Stratejik Eylem Rehberi */}
                <div className="bg-black/40 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-4">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target size={20} className="text-[#EAB308]" />
                    <span>Zirveye Ulaşmak İçin 4 Kadersel Tavsiye</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {result.synthesis.actionableGuidance.map((guide, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#EAB308]/20 border border-[#EAB308]/40 flex items-center justify-center text-xs font-bold text-[#EAB308] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{guide}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SECTORS */}
            {activeTab === 'sectors' && (
              <div className="space-y-6">
                <div className="text-center max-w-xl mx-auto mb-2">
                  <h3 className="text-xl font-bold text-white mb-1">Doğum Haritanıza Göre En Uyumlu Sektörler</h3>
                  <p className="text-xs text-gray-400">
                    Astroloji MC Tepe Noktası, 2. Ev kazanç kanalı ve Numerolojik misyonun ortak kesişimindeki ideal rotalar.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.synthesis.topSectors.map((sector, idx) => (
                    <div
                      key={idx}
                      className="bg-black/50 border border-white/10 hover:border-[#EAB308]/40 p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAB308]/5 rounded-full blur-2xl group-hover:bg-[#EAB308]/10 transition-colors pointer-events-none" />

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#EAB308] bg-[#EAB308]/10 border border-[#EAB308]/20 px-2.5 py-1 rounded-md">
                            {sector.category}
                          </span>
                          <span className="text-lg font-extrabold text-[#EAB308]">
                            %{sector.fitScore} Uyum
                          </span>
                        </div>

                        <h4 className="text-xl font-bold text-white group-hover:text-[#EAB308] transition-colors mb-2">
                          {sector.title}
                        </h4>

                        <p className="text-xs text-gray-400 leading-relaxed mb-4">
                          {sector.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-2">
                        <span className="text-[11px] font-semibold text-gray-300 block">Önerilen Roller / Alanlar:</span>
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
              </div>
            )}

            {/* TAB 3: ASTROLOGY */}
            {activeTab === 'astrology' && (
              <div className="space-y-6">
                {/* 10. Ev MC */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20">
                      <Award size={22} />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block">Toplumsal Zirve</span>
                      <h4 className="text-xl font-bold text-white">10. Ev (MC) - {result.astrology.mcSign} Burcu ({result.astrology.mcDegree}°)</h4>
                    </div>
                  </div>
                  <h5 className="text-sm font-semibold text-[#EAB308] mb-2">{result.astrology.mcTitle}</h5>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {result.astrology.mcInterpretation}
                  </p>
                </div>

                {/* 6. Ev & 2. Ev Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 6. Ev */}
                  <div className="bg-black/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-[#32ADE6]/10 text-[#32ADE6] border border-[#32ADE6]/20">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Çalışma Ortamı & Zanaat</span>
                        <h4 className="text-lg font-bold text-white">6. Ev - {result.astrology.house6Sign}</h4>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {result.astrology.house6Interpretation}
                    </p>
                  </div>

                  {/* 2. Ev */}
                  <div className="bg-black/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">Maddi Kazanç & Değer Üretimi</span>
                        <h4 className="text-lg font-bold text-white">2. Ev - {result.astrology.house2Sign}</h4>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {result.astrology.house2WealthKey}
                    </p>
                  </div>
                </div>

                {/* Satürn & Mars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl">
                    <h5 className="text-xs uppercase font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                      <ShieldAlert size={14} /> Satürn Kariyer İmtihanı ({result.astrology.saturnPlacement})
                    </h5>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1">
                      {result.astrology.saturnDisciplineAdvice}
                    </p>
                  </div>

                  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl">
                    <h5 className="text-xs uppercase font-bold text-red-400 mb-1 flex items-center gap-1.5">
                      <Flame size={14} /> Mars Eylem ve Girişim Tarzı ({result.astrology.marsPlacement})
                    </h5>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1">
                      {result.astrology.marsExecutionStyle}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NUMEROLOGY */}
            {activeTab === 'numerology' && (
              <div className="space-y-6">
                {/* Kader Sayısı */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#AF52DE]/15 border border-[#AF52DE]/30 flex items-center justify-center text-3xl font-serif text-[#AF52DE] shrink-0">
                      {result.numerology.destinyNumber}
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block">İsim Titreşiminiz (Kader Sayısı)</span>
                      <h4 className="text-xl font-bold text-white">{result.numerology.destinyTitle}</h4>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-[#AF52DE]/15 to-transparent border-l-2 border-[#AF52DE] p-4 rounded-r-2xl my-3">
                    <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                      <strong>Mesleki Yönelim:</strong> {result.numerology.destinyCareerAdvice}
                    </p>
                  </div>
                </div>

                {/* Yaşam Yolu & Ruh Güdüsü */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                    <span className="text-xs uppercase font-bold text-[#EAB308] block mb-1">
                      Yaşam Yolu ({result.numerology.lifePathNumber})
                    </span>
                    <h4 className="text-base font-bold text-white mb-2">Kadersel Yaşam Kulvarı</h4>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {result.numerology.lifePathVision || 'Yaşam yolunuz, bağımsız vizyonunuzu ve yeteneklerinizi sergileyerek topluma örnek bir kariyer inşa etmektir.'}
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                    <span className="text-xs uppercase font-bold text-pink-400 block mb-1">
                      Ruh Güdüsü ({result.numerology.soulUrgeNumber})
                    </span>
                    <h4 className="text-base font-bold text-white mb-2">İçsel Mesleki Tutku</h4>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {result.numerology.innerDrive || 'Ruhunuz derin anlamı olan, sadece para için değil kalıcı değer üreten işlerde gerçek huzura ulaşır.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: HUMAN DESIGN */}
            {activeTab === 'humandesign' && (
              <div className="space-y-6">
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-green-400 font-bold block mb-1">
                        Human Design Enerji Tipi
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                        {result.humanDesign.type}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Profil: {result.humanDesign.profile}</p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-xl text-xs font-semibold text-green-300">
                      Strateji: {result.humanDesign.workStrategy}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                        <Compass size={16} className="text-green-400" /> İş Hayatındaki Enerji Dinamiğiniz:
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {result.humanDesign.careerDynamic}
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-300">
                      <strong className="text-white">Doğru Karar Otoritesi ({result.humanDesign.decisionAuthority}):</strong> İş tekliflerini, sözleşmeleri ve kariyer sıçramalarını zihninizin mantıksal baskısıyla değil, bu otorite mekanizmasıyla onaylamalısınız.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
