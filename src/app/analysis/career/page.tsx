"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, Sparkles, Target, Award, ShieldAlert, 
  ArrowRight, RefreshCw, Layers, Compass, CheckCircle2,
  Zap, DollarSign, Flame, Lightbulb, Navigation, Clock, Calendar,
  Palette, Building2, FileText, Hammer, Music, HeartHandshake, Globe, Feather,
  Sun, Moon, TrendingUp, Hourglass, Lock, Download, Loader2,
  Coins, Users, Mic, Radio
} from 'lucide-react';
import AnalysisBackButton from '@/components/ui/AnalysisBackButton';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import AuthPromptModal from '@/components/AuthPromptModal';
import { AstroCity, ASTRO_CITIES } from '@/features/astrology/engine/AstrologyConstants';
import type { CareerAnalysisResult } from '@/features/astrology/engine/CareerEngine';
import { downloadCareerPDF } from '@/utils/careerPdfGenerator';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';

export default function CareerAnalysisPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const isMasterOrAdmin = role === 'admin' || role === 'master';

  // Form State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthCity, setBirthCity] = useState<AstroCity | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CareerAnalysisResult | null>(null);
  const [activeLayer, setActiveLayer] = useState<'material' | 'soul'>('material');

  const isEffectiveUnlocked = Boolean(result?.isUnlocked || isMasterOrAdmin);

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
      const data = await apiFetch<CareerAnalysisResult>('/api/astrology/career', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          birthDate,
          birthTime: birthTime || '12:00',
          birthCity
        })
      });

      if (isMasterOrAdmin) {
        data.isUnlocked = true;
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

  const handlePurchaseReport = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const query = new URLSearchParams({
      type: 'career',
      fullName: fullName.trim() || result?.personalInfo.fullName || '',
      date: birthDate || result?.personalInfo.birthDate || '',
      time: birthTime || result?.personalInfo.birthTime || '12:00',
      city: birthCity?.name || result?.personalInfo.cityName || '',
      lat: (birthCity?.lat || '').toString(),
      lon: (birthCity?.lon || '').toString(),
      tz: birthCity?.tz || '',
      email: user?.email || ''
    }).toString();
    router.push(`/checkout/guest?${query}`);
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    try {
      setIsPdfLoading(true);
      await downloadCareerPDF(result, {
        fullName: fullName.trim() || result.personalInfo.fullName,
        birthDate: birthDate || result.personalInfo.birthDate,
        birthTime: birthTime || result.personalInfo.birthTime,
        cityName: birthCity?.name || result.personalInfo.cityName,
        country: birthCity?.country || 'Türkiye'
      });
    } catch (err) {
      console.error('Kariyer PDF oluşturma hatası:', err);
      alert('PDF oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const renderLockedSectionNotice = (titleText = "Bu Bölüm Kapsamlı Kariyer Raporuna Özeldir") => (
    <div className="mt-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] shrink-0">
          <Lock size={24} />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white">{titleText}</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            İkincil İlerletim saatini, kadersel zaman çizelgesini, Drakonik ruhsal çağrıyı ve servet kaldıraç stratejinizi içeren Kapsamlı Kariyer Raporunu (Özel PDF) hemen edinebilirsiniz.
          </p>
        </div>
      </div>
      <button
        onClick={handlePurchaseReport}
        className="shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-extrabold py-3 px-5 rounded-xl transition-all shadow-lg shadow-[#D4AF37]/20 text-xs sm:text-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
      >
        <Lock size={15} />
        <span>Raporu İndir (444 TL)</span>
      </button>
    </div>
  );

  const renderBigLockedShowcase = (layer: 'material' | 'soul') => (
    <div className="mt-6 rounded-3xl bg-gradient-to-b from-[#D4AF37]/20 via-black/90 to-black border-2 border-[#D4AF37]/40 p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#D4AF37]/30 to-[#B8860B]/10 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.3)]">
        <Lock size={36} className="sm:w-10 sm:h-10 animate-pulse" />
      </div>

      <div className="max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#D4AF37] font-extrabold block">
          🔒 {layer === 'material' ? 'Kapsamlı Kariyer Raporunun Kalan %85\'i Kilitlidir' : 'Drakonik Ruh Haritası ve Kadersel Çağrı Kilitlidir'}
        </span>
        <h3 className="text-xl sm:text-3xl font-black text-white">
          {layer === 'material' 
            ? 'Tüm Gezegenlerinizi, Sektörel Analizinizi ve Kadersel Rızık Haritanızı Açın' 
            : 'Ruhsal Tepe Noktanızı, Enkarnasyon Özünüzü ve İlahi Misyonunuzu Keşfedin'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-1">
          {layer === 'material'
            ? '7 Sektörün Yüzdelik Dağılımı, İkincil İlerletim Saati, Kadersel Zaman Çizelgesi, 10 Gezegenin Mesleki Deşifresi, Müzik/Zanaat Malzemesi, Pars Fortuna Rızık Kapısı, Biyoritm Saatleri ve İndirilebilir Özel PDF Raporu için hemen kilidi açın.'
            : 'Ruhsal MC (Tepe Noktası), Ruhun 3\'lü Enkarnasyon Doğası, Ruhu Besleyen Kadersel Sektörler ve Ruh-Madde Bütünsel Sentez Köprüsü Kapsamlı Kariyer Dosyasına dahildir.'}
        </p>
      </div>

      {/* Avantaj Rozetleri */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto text-left">
        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-[#D4AF37] font-bold block mb-0.5">✦ 7 SEKTÖR ANALİZİ</span>
          <span className="text-[11px] text-gray-300">Yüzdelik tekil uyum skoru</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-[#D4AF37] font-bold block mb-0.5">✦ İLERLETİM DÖNGÜSÜ</span>
          <span className="text-[11px] text-gray-300">İlerletilmiş Güneş & Ay saati</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-[#D4AF37] font-bold block mb-0.5">✦ 6 KADİM MODÜL</span>
          <span className="text-[11px] text-gray-300">Enstrüman, rızık & biyoritm</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-[#D4AF37] font-bold block mb-0.5">✦ ÖZEL PDF RAPORU</span>
          <span className="text-[11px] text-gray-300">İndirilebilir dijital analiz</span>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handlePurchaseReport}
          className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#B8860B] hover:opacity-95 text-black font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-[#D4AF37]/30 text-sm sm:text-base cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Lock size={18} />
          <span>Tüm Kilitleri Aç & Özel PDF'i Al (444 TL)</span>
          <ArrowRight size={18} />
        </button>
        <span className="block text-[11px] text-gray-400 mt-2">
          Tek seferlik ödeme • Derin Analiz • Özel PDF Raporu • Anında İndirme
        </span>
      </div>
    </div>
  );

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

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                {isEffectiveUnlocked ? (
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isPdfLoading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EAB308] via-[#D4AF37] to-[#EAB308] hover:opacity-95 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-[0.98]"
                  >
                    {isPdfLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    <span>Kariyer Raporunu İndir (PDF)</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePurchaseReport}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                  >
                    <Lock size={15} />
                    <span>Tüm Kilitleri Aç (444 TL)</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Yeni Analiz</span>
                </button>
              </div>
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

            {/* 2 KATMANLI EZOTERİK MİMARİ SEÇİCİ (Madde Dünyası vs Ruh Haritası) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-black/60 border border-white/15 rounded-3xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveLayer('material')}
                className={`flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all cursor-pointer ${
                  activeLayer === 'material'
                    ? 'bg-gradient-to-r from-amber-500/20 to-blue-500/10 border border-amber-500/40 text-white shadow-xl'
                    : 'bg-transparent border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <div className={`p-3 rounded-xl border shrink-0 ${
                  activeLayer === 'material'
                    ? 'bg-amber-500/20 text-[#EAB308] border-amber-500/30'
                    : 'bg-white/5 text-gray-400 border-white/10'
                }`}>
                  <Globe size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold block truncate">1. Madde Dünyası Haritası</span>
                    {activeLayer === 'material' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">Aktif</span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                    Dünyevi Kariyer, Rızık, Kamu, Tekstil, Ticaret & Sosyal Güvence
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveLayer('soul')}
                className={`flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all cursor-pointer ${
                  activeLayer === 'soul'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 border border-purple-500/40 text-white shadow-xl'
                    : 'bg-transparent border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <div className={`p-3 rounded-xl border shrink-0 ${
                  activeLayer === 'soul'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : 'bg-white/5 text-gray-400 border-white/10'
                }`}>
                  <Sparkles size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold block truncate">2. Ruh Haritası (Drakonik)</span>
                    {activeLayer === 'soul' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">Aktif</span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                    Kadersel Çağrı, Ruhu Besleyen Alanlar & İçsel Doyum
                  </span>
                </div>
              </button>
            </div>

            {/* ========== KATMAN 1: MADDE DÜNYASI HARİTASI ========== */}
            {activeLayer === 'material' && (
              <div className="space-y-6 animate-fadeIn">
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

            {/* KİLİTLİ DURUM: KAPSAMLI KARİYER RAPORU KİLİT VİTRİNİ */}
            {!isEffectiveUnlocked && renderBigLockedShowcase('material')}

            {/* AÇIK / SATIN ALINMIŞ DURUM: TÜM DERİN MESLEKİ BÖLÜMLER */}
            {isEffectiveUnlocked && (
              <>
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

                {!isEffectiveUnlocked && renderLockedSectionNotice("Kadersel Zaman Çizelgesi Detayları Kilitlidir")}
              </div>
            )}

            {/* 3. İKİNCİL İLERLETİM (SECONDARY PROGRESSIONS • ASTRO-SEEK STANDARDI) */}
            {result.progressedCareer && (
              <div className="bg-gradient-to-br from-indigo-950/40 via-black/80 to-purple-950/30 border border-indigo-500/30 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Hourglass size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-indigo-400 font-bold block">
                          İçsel Kariyer Saati • Astro-Seek Standardı
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                          {result.progressedCareer.currentAge} Yaş İlerletimi
                        </span>
                        {!isEffectiveUnlocked && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                            <Lock size={10} /> Kilitli
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-2xl font-bold text-white">
                        İkincil İlerletim: Mesleki Evrim ve Mevcut Sezonunuz
                      </h3>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shrink-0">
                    1 Gün = 1 Yıl Formülü (Secondary Progressions)
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* İlerletilmiş Güneş (Mesleki Kimlik & Ego Evrimi) */}
                  <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                        <Sun size={18} />
                        <span>İlerletilmiş Güneş (Kimlik Evrimi)</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                        {result.progressedCareer.progressedSun.progressedSign} {result.progressedCareer.progressedSun.degreeInSign}°{result.progressedCareer.progressedSun.minutes}&apos;
                      </span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div className="text-gray-400">
                        Doğum: <strong className="text-gray-200">{result.progressedCareer.progressedSun.natalSign} ({result.progressedCareer.progressedSun.natalDegree}°)</strong>
                      </div>
                      <ArrowRight size={14} className="text-amber-400" />
                      <div className="text-gray-400">
                        Şu An: <strong className="text-amber-300">{result.progressedCareer.progressedSun.progressedSign} ({result.progressedCareer.progressedSun.degreeInSign}°)</strong>
                      </div>
                    </div>

                    <div className="text-xs text-amber-200 font-semibold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      🎯 {result.progressedCareer.progressedSun.identityShiftTheme}
                    </div>

                    <p className={`text-xs text-gray-300 leading-relaxed ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                      {result.progressedCareer.progressedSun.explanation}
                    </p>

                    <div className="text-[11px] text-gray-400 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span>Geçiş Yaşı: <strong className="text-white">{result.progressedCareer.progressedSun.shiftAge} yaş</strong></span>
                      {result.progressedCareer.progressedSun.nextShiftAge && (
                        <span>Sonraki Burç: <strong className="text-amber-300">{result.progressedCareer.progressedSun.nextShiftAge} yaş</strong></span>
                      )}
                    </div>
                  </div>

                  {/* İlerletilmiş Ay (2.5 Yıllık Mesleki Mevsim & Odak Evi) */}
                  <div className="bg-black/50 border border-blue-500/20 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm">
                        <Moon size={18} />
                        <span>İlerletilmiş Ay (2.5 Yıllık Mevsim)</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
                        {result.progressedCareer.progressedMoon.sign} {result.progressedCareer.progressedMoon.degreeInSign}°{result.progressedCareer.progressedMoon.minutes}&apos;
                      </span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Natal Ev Etkisi</span>
                        <strong className="text-blue-300">{result.progressedCareer.progressedMoon.natalHouse}. Ev Odak Alanı</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block text-[10px] uppercase">Tahmini Kalan Süre</span>
                        <strong className="text-white">~{result.progressedCareer.progressedMoon.estimatedMonthsLeft} Ay</strong>
                      </div>
                    </div>

                    <div className="text-xs text-blue-200 font-semibold bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                      🌊 {result.progressedCareer.progressedMoon.cycleTheme}
                    </div>

                    <p className={`text-xs text-gray-300 leading-relaxed ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                      {result.progressedCareer.progressedMoon.houseImpact}
                    </p>

                    <div className="text-[11px] text-gray-400 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span>Döngü Süresi: <strong className="text-white">Her burçta ~2.5 yıl</strong></span>
                      <span>Odak: <strong className="text-blue-300">İçsel Motivasyon & Ritim</strong></span>
                    </div>
                  </div>
                </div>

                {/* 30 Yıllık Kariyer Döngüsü: İlerletilmiş Ay Fazı (Elongation) */}
                <div className="bg-black/60 border border-purple-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-purple-400" />
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        30 Yıllık Mesleki Yaşam Döngüsü: {result.progressedCareer.progressedMoonPhase.name}
                      </h4>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold self-start sm:self-auto">
                      Faz {result.progressedCareer.progressedMoonPhase.phaseNumber} / 8 • {result.progressedCareer.progressedMoonPhase.elongationDegree}° Açı
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[11px] text-purple-400 uppercase font-bold tracking-wider block">
                        Döngü Niteliği & Mevcut Durum
                      </span>
                      <p className="text-xs sm:text-sm text-gray-200 font-medium leading-snug">
                        &quot;{result.progressedCareer.progressedMoonPhase.phaseMotto}&quot;
                      </p>
                      <p className={`text-xs text-gray-400 leading-relaxed ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                        {result.progressedCareer.progressedMoonPhase.stageDescription}
                      </p>
                    </div>

                    <div className="bg-purple-950/30 border border-purple-500/20 p-4 rounded-xl space-y-2">
                      <span className="text-[11px] text-purple-300 uppercase font-bold tracking-wider block flex items-center gap-1.5">
                        <Lightbulb size={14} className="text-purple-400" />
                        Bu Fazda Uygulanacak Kariyer Stratejisi
                      </span>
                      <p className={`text-xs text-gray-200 leading-relaxed ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                        {result.progressedCareer.progressedMoonPhase.careerHarvestGuidance}
                      </p>
                      {result.progressedCareer.progressedMidheaven && (
                        <div className="pt-2 border-t border-purple-500/20 text-[11px] text-purple-200">
                          🏛️ <strong>Toplumsal Unvan Evrimi:</strong> {result.progressedCareer.progressedMidheaven.careerEvolutionTitle}
                          {result.progressedCareer.progressedMidheaven.explanation && (
                            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                              {result.progressedCareer.progressedMidheaven.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!isEffectiveUnlocked && renderLockedSectionNotice("İçsel Kariyer Saati ve İlerletim Detayları Kilitlidir")}
              </div>
            )}

            {/* 4. KARİYER ODAK STRATEJİSİ (Tek Alanda Derinleşme mi, Çok Kanallı Polimat mı?) */}
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

            {/* KADİM & EZOTERİK DERİN MESLEKİ MODÜLLER (6 YENİ BOYUT) */}

            {/* MODÜL 1: MÜZİKAL ENSTRÜMAN & SES YATKINLIĞI */}
            {result.musicalAffinity && (
              <div className="bg-gradient-to-br from-pink-900/20 via-black/70 to-purple-900/20 border border-pink-500/30 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/30">
                    <Music size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-pink-400 font-bold block">
                      Ezoterik Titreşim & Frekans Anatomisi
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Müzikal Enstrüman, Ritim & Ses Yatkınlığı
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Birincil Enstrüman Ailesi */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 uppercase">
                          Baskın Enstrüman Ailesi
                        </span>
                        <span className="text-[11px] text-pink-300 font-medium">
                          {result.musicalAffinity.primaryInstrument.element}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mb-2">
                        {result.musicalAffinity.primaryInstrument.category}
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed mb-3">
                        {result.musicalAffinity.primaryInstrument.essence}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] text-gray-400 block mb-1.5 uppercase font-semibold">Tavsiye Edilen Enstrümanlar:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.musicalAffinity.primaryInstrument.instruments.map((inst, idx) => (
                          <span key={idx} className="text-[11px] bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-lg text-pink-200">
                            🎵 {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* İkincil Stil & Frekans */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase">
                          İkincil / Meditatif Frekans
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mb-2">
                        {result.musicalAffinity.secondaryStyle.category}
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed mb-3">
                        {result.musicalAffinity.secondaryStyle.essence}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] text-gray-400 block mb-1.5 uppercase font-semibold">Uyumlu Ses Aletleri:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.musicalAffinity.secondaryStyle.instruments.map((inst, idx) => (
                          <span key={idx} className="text-[11px] bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg text-purple-200">
                            ✨ {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vokal & Boğaz Çakrası */}
                <div className="bg-black/50 border border-pink-500/20 p-4 rounded-2xl mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic size={16} className="text-pink-400" />
                    <span className="text-xs font-bold text-white">
                      Ses / Vokal & Hitabet Kapasitesi: {result.musicalAffinity.vocalAptitude.style}
                    </span>
                  </div>
                  <p className={`text-xs text-gray-300 leading-relaxed ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                    {result.musicalAffinity.vocalAptitude.chakraResonance}
                  </p>
                </div>

                {/* Zihinsel Rahatlama & Tavsiye */}
                <p className={`text-xs text-pink-200/90 bg-pink-500/15 p-3 rounded-xl border border-pink-500/20 ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                  🎼 <strong>Zihinsel Sıfırlanma Reçetesi:</strong> {result.musicalAffinity.musicalExpressionAdvice}
                </p>
              </div>
            )}

            {/* MODÜL 2: EL BECERİSİ & ZANAAT MALZEMESİ ANATOMİSİ */}
            {result.craftsmanshipMaterial && (
              <div className="bg-gradient-to-br from-amber-900/20 via-black/70 to-orange-900/20 border border-amber-500/30 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Hammer size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 font-bold block">
                      Dokunsal Ustalık & Maddeyle Temas
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {result.craftsmanshipMaterial.craftsmanshipTitle}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider mb-1.5">
                      Baskın Ustalık Hammaddesi
                    </span>
                    <p className="text-sm font-semibold text-white mb-2">
                      {result.craftsmanshipMaterial.primaryMaterial}
                    </p>
                    <span className="text-[10px] text-gray-400 block mb-1.5 uppercase font-semibold">Geleneksel El Aletleri & Teknikler:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.craftsmanshipMaterial.toolsAndTechniques.map((t, idx) => (
                        <span key={idx} className="text-[11px] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-amber-200">
                          🛠️ {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-orange-400 block tracking-wider mb-1.5">
                        Ticari Atölye & Ürün Fikirleri
                      </span>
                      <div className="space-y-1.5">
                        {result.craftsmanshipMaterial.commercialApplications.map((app, idx) => (
                          <div key={idx} className={`text-xs text-gray-300 flex items-center gap-2 ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{app}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 mt-3">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Psikosomatik Şifa:</span>
                      <p className={`text-xs text-amber-200/90 ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                        {result.craftsmanshipMaterial.healingPower}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODÜL 3 & 4: ŞANS NOKTASI (RIZIK KAPISI) & ORTAKLIK DNA'SI (2'li Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* MODÜL 3: KADERSEL ŞANS NOKTASI & RIZIK KAPISI */}
              {result.parsFortunaWealth && (
                <div className="bg-gradient-to-br from-emerald-900/25 via-black/70 to-emerald-950/30 border border-emerald-500/30 p-5 sm:p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center gap-3 mb-3.5">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Coins size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-emerald-400 font-bold block">
                          Pars Fortuna (Kadersel Rızık Kapısı)
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          {result.parsFortunaWealth.wealthPortalTitle}
                        </h4>
                      </div>
                    </div>

                    <p className={`text-xs sm:text-sm text-gray-300 leading-relaxed mb-3 ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                      {result.parsFortunaWealth.karmicBlessingArea}
                    </p>
                  </div>

                  <div className={`bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-xs text-emerald-200 mt-2 ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                    <strong>💰 Zahmetsiz Rızık Formülü:</strong> {result.parsFortunaWealth.practicalMonetizationGuidance}
                  </div>
                </div>
              )}

              {/* MODÜL 4: ORTAKLIK & ÇALIŞMA DNA'SI */}
              {result.partnershipDna && (
                <div className="bg-gradient-to-br from-blue-900/25 via-black/70 to-indigo-950/30 border border-blue-500/30 p-5 sm:p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center gap-3 mb-3.5">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        <Users size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-blue-400 font-bold block">
                          İş Birliği & Ortaklık DNA'sı
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          {result.partnershipDna.archetype}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-blue-300/90 font-medium italic mb-2.5">
                      "{result.partnershipDna.motto}"
                    </p>

                    <p className={`text-xs sm:text-sm text-gray-300 leading-relaxed mb-3 ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                      {result.partnershipDna.synergyCondition}
                    </p>
                  </div>

                  <div className="space-y-2 mt-2">
                    <div className={`bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-xs text-rose-200 ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                      ⚠️ <strong>Toksik Ortaklık Tuzağı:</strong> {result.partnershipDna.toxicPartnershipRisk}
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl text-xs text-blue-200">
                      👥 <strong>İdeal Takım Mimarisi:</strong> {result.partnershipDna.idealTeamStructure}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MODÜL 5 & 6: BİYORİTM ÇALIŞMA SAATLERİ & SEKTÖREL İTİBAR İMZASI (2'li Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* MODÜL 5: GÜNÜN EN VERİMLİ BİYORİTM & İMZA SAATLERİ */}
              {result.planetaryProductivityHours && (
                <div className="bg-gradient-to-br from-yellow-900/20 via-black/70 to-amber-950/30 border border-yellow-500/30 p-5 sm:p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center gap-3 mb-3.5">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                        <Clock size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-yellow-400 font-bold block">
                          Gezegen Saatleri & Verimlilik
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          Biyoritm & İmza Pencereleri ({result.planetaryProductivityHours.rulingPlanet})
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-3">
                      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-0.5">
                          🎯 Zihinsel Derin Odak & Kodlama/Üretim Penceresi
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-white">
                          {result.planetaryProductivityHours.peakMentalFocusWindow}
                        </p>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block mb-0.5">
                          ✍️ Altın Müzakere, Satış & İmza Penceresi
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-white">
                          {result.planetaryProductivityHours.goldenNegotiationWindow}
                        </p>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-0.5">
                          🔋 Şarj & Zihinsel Arınma Penceresi
                        </span>
                        <p className={`text-xs sm:text-sm font-semibold text-white ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                          {result.planetaryProductivityHours.rechargeAndBurnoutPreventionWindow}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs text-yellow-200/90 bg-yellow-500/15 p-3 rounded-xl border border-yellow-500/20 ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                    ⚡ <strong>Biyoritm Stratejisi:</strong> {result.planetaryProductivityHours.dailyRoutineAdvice}
                  </p>
                </div>
              )}

              {/* MODÜL 6: TOPLUMSAL İTİBAR & SEKTÖREL ŞÖHRET İMZASI */}
              {result.vocationalReputation && (
                <div className="bg-gradient-to-br from-indigo-900/20 via-black/70 to-purple-950/30 border border-indigo-500/30 p-5 sm:p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center gap-3 mb-3.5">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                        <Award size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-indigo-400 font-bold block">
                          Tepe Noktası (MC) & Sektörel İtibar
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          {result.vocationalReputation.reputationTitle}
                        </h4>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl mb-3">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                        İş Dünyasındaki Kamusal Arketipiniz
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {result.vocationalReputation.publicImageArchetype}
                      </p>
                    </div>

                    <div className="space-y-2 mb-3">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                        Piyasanın Sizi Hatırlayacağı Saygın İmza:
                      </span>
                      <p className={`text-xs sm:text-sm text-gray-300 leading-relaxed ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                        {result.vocationalReputation.howIndustryRemembersYou}
                      </p>
                    </div>
                  </div>

                  <div className={`bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl text-xs text-indigo-200 ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                    👑 <strong>Otorite Tetiği:</strong> {result.vocationalReputation.authorityTrigger}
                  </div>
                </div>
              )}
            </div>

            {/* Kilit Bilgilendirmesi (Eğer kilitliyse) */}
            {!isEffectiveUnlocked && renderLockedSectionNotice("Müzikal Frekans, Zanaat Hammaddesi, Kadersel Rızık ve Biyoritm Modülleri Kilitlidir")}

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
                    Dünyevi Kariyer Eylem Planınız
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
              </>
            )}
          </div>
        )}

        {/* ========== KATMAN 2: RUH HARİTASI (DRAKONİK KATMAN) ========== */}
        {activeLayer === 'soul' && result.soulCareer && (
          <div className="space-y-6 animate-fadeIn">
            {/* KADİM EZOTERİK İLKE & UYANIŞ ŞARTI (ONTOLOJİK BİLDİRİGELİK) */}
            <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/70 border border-purple-500/35 p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0 mt-0.5">
                  <Compass size={22} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-purple-400 font-bold">
                      Kadim Ezoterik İlke • Ontolojik Uyanış Şartı
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                      Hermetik & Gurdjieff Perspektifi
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Ruhsal Çağrı Bir Zorunluluk Değil, Bilinçli Bir Uyanış Potansiyelidir
                  </h4>
                  <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed">
                    Kadim Gnostik ve Hermetik öğretilerde insanoğlunun büyük çoğunluğu yaşamını <strong>1. Katman olan Madde Dünyası</strong> içerisinde, biyolojik ve toplumsal matrix’in mekanik düzeninde tamamlar. Bu yaratılışın dengesini kuran doğal bir fazdır.
                  </p>
                  <p className="text-xs sm:text-[13px] text-purple-200/90 leading-relaxed pt-1">
                    Aşağıda okuyacağınız <strong>Drakonik (Ruh) Haritası</strong>, her insanda zorla çalışan bir mekanizma değil; yalnızca dünyevi statü ve paranın ötesindeki içsel sızıyı duyan, <em>"Ben buraya sadece bu çarkı döndürmek için gelmedim"</em> diyerek içsel kıvılcımını kristalleştiren bilinçler için aktifleşen <strong>yüksek oktavlı kadersel bir rehberdir</strong>. Uykuda olan bilinçler için bu katman sessiz bir tohum olarak bekler; rezonans duyanlar içinse gerçek hayat amacının kapısını açar.
                  </p>
                </div>
              </div>
            </div>

            {/* KİLİTLİ DURUM: DRAKONİK RUH HARİTASI KİLİT VİTRİNİ */}
            {!isEffectiveUnlocked && renderBigLockedShowcase('soul')}

            {/* AÇIK / SATIN ALINMIŞ DURUM: TÜM RUHSAL VE ENKARNASYON ANALİZİ */}
            {isEffectiveUnlocked && (
              <>
                {/* 1. RUHSAL TEPE NOKTASI (DRAKONİK MC) & KADERSEL ÇAĞRI */}
            <div className="bg-gradient-to-br from-purple-900/30 via-black/80 to-pink-900/20 border border-purple-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-inner">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-purple-400 font-bold block">
                      Ruhsal Tepe Noktası (Drakonik MC: {result.soulCareer.soulMidheaven.sign})
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {result.soulCareer.soulMidheaven.title}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 self-start sm:self-auto">
                  Kadersel Ruh Çağrısı (Vocation)
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <p className="text-xs sm:text-base text-purple-100 leading-relaxed font-medium">
                  {result.soulCareer.soulMidheaven.calling}
                </p>
                <div className="bg-white/5 border border-purple-500/20 p-4 rounded-2xl text-xs sm:text-sm text-gray-300 flex items-start gap-2.5">
                  <Award size={18} className="text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Kolektife Bırakılacak Manevi Etki:</strong> {result.soulCareer.soulMidheaven.impact}</span>
                </div>
              </div>
            </div>

            {/* 2. RUHUN ENKARNASYON DOĞASI (3'LÜ KART) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/50 border border-purple-500/20 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
                  Ruhun Enkarnasyon Özü (Drakonik Yükselen: {result.soulCareer.soulAscendant.sign})
                </span>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  {result.soulCareer.soulAscendant.essence}
                </p>
              </div>

              <div className="bg-black/50 border border-pink-500/20 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-pink-400 block tracking-wider">
                  Ruhun İlahi Işığı (Drakonik Güneş: {result.soulCareer.soulSun.sign})
                </span>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  {result.soulCareer.soulSun.mission}
                </p>
              </div>

              <div className="bg-black/50 border border-blue-500/20 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                  Manevi Beslenme Kaynağı (Drakonik Ay: {result.soulCareer.soulMoon.sign})
                </span>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  {result.soulCareer.soulMoon.emotionalNourishment}
                </p>
              </div>
            </div>

            {/* 3. RUHU BESLEYEN KADERSEL SEKTÖRLER */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-1">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Feather size={18} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Ruhu Besleyen Mesleki & Sanatsal Alanlar
                  </h3>
                  <span className="text-[11px] sm:text-xs text-gray-400 block">
                    Maddi kaygılardan bağımsız, ruhunuzun bu dünyada üretirken en derin içsel tatmini duyduğu alanlar
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.soulCareer.soulTopSectors.map((sector, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-black/50 border border-purple-500/30 p-5 rounded-3xl flex flex-col justify-between shadow-xl"
                    style={{ borderTopColor: sector.color, borderTopWidth: '3px' }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase">
                          Ruhsal Çağrı #{sIdx + 1}
                        </span>
                        <span className="text-lg font-bold" style={{ color: sector.color }}>
                          %{sector.percentage}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mb-2">{sector.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed mb-4">{sector.description}</p>
                    </div>
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                        Ruhsal Ustalık Dalları:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {sector.recommendedRoles.map((r, rIdx) => (
                          <span key={rIdx} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-200">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. RUH & MADDE DENGE KÖPRÜSÜ (BÜTÜNSEL SENTEZ) */}
            <div className="bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-black/80 border border-amber-500/30 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Layers size={22} />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-300 font-bold block">
                    Ruh & Madde Bütünsel Entegrasyon Köprüsü
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Dünyevi Mesleğiniz ile Ruhsal Çağrınızı Birleştirme Formülü
                  </h3>
                </div>
              </div>

              <p className={`text-xs sm:text-sm text-gray-200 leading-relaxed ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                {result.soulCareer.soulMaterialBridge.synthesisAdvice}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                    ⚠️ Yalnızca Maddede Kalma Riski:
                  </span>
                  <p className={`text-xs text-rose-200 leading-relaxed ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                    {result.soulCareer.soulMaterialBridge.unfulfillmentWarning}
                  </p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    🕊️ Ruhsal Doyum İçin Kutsal Rutin:
                  </span>
                  <p className={`text-xs text-emerald-200 leading-relaxed ${!isEffectiveUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                    {result.soulCareer.soulMaterialBridge.dailySpiritualPractice}
                  </p>
                </div>
              </div>

              {!isEffectiveUnlocked && renderLockedSectionNotice("Drakonik Ruh Haritası ve Sentez Köprüsü Kilitlidir")}
            </div>

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
                      Aşılması Gereken Konfor Alanı (Geçmiş Alışkanlıklar)
                    </span>
                    <p className="text-xs sm:text-sm text-gray-300">
                      {result.dharmaPath.fromComfortZone}
                    </p>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-purple-300 uppercase tracking-wider block mb-1 font-semibold">
                      Büyüme ve Kadersel Misyon Kapısı
                    </span>
                    <p className="text-xs sm:text-sm text-purple-100 font-medium">
                      {result.dharmaPath.toGrowthMission}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-purple-200/90 bg-purple-500/15 p-3 rounded-xl border border-purple-500/20">
                  ✨ <strong>Kadersel Sıçrama:</strong> {result.dharmaPath.careerImpact}
                </p>
              </div>
            )}

            {/* 6. TÜKENMİŞLİK KALKANI */}
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
              </>
            )}
          </div>
        )}
          </div>
        )}
      </div>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Kariyer Analizi Üyeliği"
        description="Raporunuzun güvenle e-postanıza iletilmesi ve dilediğiniz zaman profilinizden indirebilmeniz için lütfen giriş yapın veya ücretsiz hesap oluşturun."
      />
    </div>
  );
}
