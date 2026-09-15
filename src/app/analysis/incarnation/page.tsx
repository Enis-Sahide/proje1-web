"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  Moon, 
  Sun, 
  Compass, 
  Scroll, 
  ShieldAlert, 
  HeartHandshake, 
  Flame, 
  Layers, 
  Download, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Star,
  Activity,
  Lock,
  X,
  Key,
  Clock,
  Unlock
} from 'lucide-react';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import type { AstroCity } from '@/features/astrology/engine/AstrologyConstants';
import type { IncarnationAnalysisResult } from '@/features/astrology/engine/IncarnationEngine';
import { downloadIncarnationPDF } from '@/utils/incarnationPdfGenerator';
import { useAuth } from '@/context/AuthContext';
import AuthPromptModal from '@/components/AuthPromptModal';

const ZODIAC_SYMBOLS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋', 
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏', 
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓'
};

const ZODIAC_COLORS: Record<string, string> = {
  'Koç': '#FF453A', 'Aslan': '#FF453A', 'Yay': '#FF453A',
  'Boğa': '#32D74B', 'Başak': '#32D74B', 'Oğlak': '#32D74B',
  'İkizler': '#FFD60A', 'Terazi': '#FFD60A', 'Kova': '#FFD60A',
  'Yengeç': '#0A84FF', 'Akrep': '#0A84FF', 'Balık': '#0A84FF',
};

export default function IncarnationAnalysisPage() {
  const router = useRouter();
  const { role, user } = useAuth();
  const isMasterOrAdmin = role === 'master' || role === 'admin';

  // Form states
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('12:00');
  const [cityKey, setCityKey] = useState<AstroCity | null>(null);

  // Status & Data
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [errorStr, setErrorStr] = useState('');
  const [resultData, setResultData] = useState<IncarnationAnalysisResult | null>(null);
  const [birthInfo, setBirthInfo] = useState<{ localDate: string; localTime: string; cityName: string; country: string } | null>(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'past_life' | 'karmic_debts' | 'draconic' | 'progressed' | 'next_life'>('past_life');

  useEffect(() => {
    if (resultData && activeTab === 'progressed' && !resultData.progressedEvolution?.hasSpecialLocks) {
      setActiveTab('past_life');
    }
  }, [resultData, activeTab]);

  const handleCalculate = async () => {
    try {
      setIsLoading(true);
      setErrorStr('');

      if (!dateStr || !timeStr || !cityKey) {
        throw new Error("Lütfen doğum tarihi, saati ve şehri eksiksiz doldurunuz.");
      }

      const res = await fetch('/api/astrology/incarnation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localDate: dateStr,
          localTime: timeStr,
          cityData: cityKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Hesaplama yapılırken bir hata oluştu.");
      }

      setResultData(data.data.incarnation);
      setBirthInfo(data.data.birthInfo);
      setActiveTab('past_life');
    } catch (err: any) {
      console.error("Enkarnasyon analizi hatası:", err);
      setErrorStr(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!resultData || !birthInfo) return;
    try {
      setIsPdfLoading(true);
      await downloadIncarnationPDF(resultData, birthInfo);
    } catch (err) {
      console.error("PDF oluşturma hatası:", err);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handlePurchaseReport = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const query = new URLSearchParams({
      type: 'incarnation',
      date: dateStr,
      time: timeStr,
      city: cityKey?.name || '',
      lat: (cityKey?.lat || '').toString(),
      lon: (cityKey?.lon || '').toString(),
      tz: cityKey?.tz || '',
      email: user?.email || ''
    }).toString();
    router.push(`/checkout/guest?${query}`);
  };

  // Reusable locked overlay banner inside tabs
  const renderLockedSectionNotice = () => (
    <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] shrink-0">
          <Lock size={24} />
        </div>
        <div>
          <h4 className="text-base font-bold text-white">Detaylı Analizler Usta Seviyesine Özeldir</h4>
          <p className="text-xs sm:text-sm text-mystic-text-muted mt-1 max-w-xl">
            Bu bölümdeki derin karmik nedenleri, dharma reçetelerini ve ezoterik ruh haritanızı görmek için Usta Seviyesi üye olabilir veya tüm detayları içeren 5 sayfalık PDF Raporunu indirebilirsiniz.
          </p>
        </div>
      </div>
      <button
        onClick={handlePurchaseReport}
        className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-[#D4AF37]/20 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
      >
        <Lock size={15} />
        <span>Raporu İndir (888 TL)</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative bg-mystic-dark">
      {/* Background glow ornaments */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#D4AF37]/15 to-purple-600/10 blur-[130px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => router.push('/analysis')}
          className="inline-flex items-center gap-2 text-mystic-text-muted hover:text-white transition-colors mb-6 text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Ruhsal Analiz Merkezi'ne Dön</span>
        </button>

        {/* Page Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] mb-4">
            <Sparkles size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-amber-200 mb-3">
            Karmik & Enkarnasyon Analizi
          </h1>
          <p className="text-sm sm:text-base text-mystic-text-muted max-w-2xl mx-auto">
            Önceki enkarnasyon kimliğiniz, bu hayata taşıdığınız karmik borçlar, Drakonik ruh haritanız ve gelecek enkarnasyon potansiyeliniz.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-mystic-surface/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-mystic-surface-light shadow-2xl mb-12 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">Doğum Tarihi *</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">Doğum Saati *</label>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">Doğum Şehri *</label>
              <LocationAutocomplete
                onSelect={(c) => setCityKey(c)}
                defaultDisplay={cityKey ? cityKey.name : ''}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all text-sm"
              />
            </div>
          </div>

          {errorStr && (
            <div className="mt-5 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs sm:text-sm flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{errorStr}</span>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F3CE65] to-[#B8860B] hover:brightness-110 text-black font-bold py-3.5 px-6 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Karmik Hafıza Çözümleniyor...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Ruhun Tekâmül Haritasını Keşfet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {resultData && birthInfo && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Soul Maturity Score & Top Bar */}
            <div className="bg-gradient-to-r from-[#171c2b] via-[#1c2237] to-[#171c2b] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                      Ruhsal Yaş Frekansı
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-mystic-text-muted border border-white/10">
                      Baskın Element: {resultData.soulMaturity.dominantElement}
                    </span>
                    {isMasterOrAdmin && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Usta Seviyesi Aktif
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {resultData.soulMaturity.tier} <span className="text-[#D4AF37]">({resultData.soulMaturity.score}/100)</span>
                  </h2>
                  <p className="text-sm text-mystic-text-muted max-w-2xl leading-relaxed">
                    {resultData.soulMaturity.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  {isMasterOrAdmin ? (
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isPdfLoading}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-sm font-semibold transition-all shadow-md hover:shadow-[#D4AF37]/20 cursor-pointer disabled:opacity-50"
                    >
                      {isPdfLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Download size={16} />
                      )}
                      <span>PDF Raporunu İndir</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchaseReport}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black text-sm font-bold transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer"
                    >
                      <Lock size={16} />
                      <span>Karmik Analiz Raporunu İndir (888 TL)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className={`grid ${resultData.progressedEvolution?.hasSpecialLocks ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10`}>
              <button
                onClick={() => setActiveTab('past_life')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'past_life'
                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/30 font-bold'
                    : 'text-mystic-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Scroll size={16} />
                <span>1. Önceki Yaşam</span>
              </button>

              <button
                onClick={() => setActiveTab('karmic_debts')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'karmic_debts'
                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/30 font-bold'
                    : 'text-mystic-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldAlert size={16} />
                <span>2. Karmik Borçlar</span>
              </button>

              <button
                onClick={() => setActiveTab('draconic')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'draconic'
                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/30 font-bold'
                    : 'text-mystic-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass size={16} />
                <span>3. Drakonik Ruh</span>
              </button>

              {resultData.progressedEvolution?.hasSpecialLocks && (
                <button
                  onClick={() => setActiveTab('progressed')}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'progressed'
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 font-bold'
                      : 'text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/10'
                  }`}
                >
                  <Key size={16} className="text-amber-400" />
                  <span>4. Karmik Kilitler</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('next_life')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'next_life'
                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/30 font-bold'
                    : 'text-mystic-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Flame size={16} />
                <span>{resultData.progressedEvolution?.hasSpecialLocks ? '5. Dharma & Gelecek' : '4. Dharma & Gelecek'}</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. PAST LIFE */}
            {activeTab === 'past_life' && (
              <div className="space-y-6">
                {/* GAD Headline Card */}
                <div className="bg-mystic-surface/50 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold mb-1">
                        Güney Ay Düğümü (GAD / Ketu)
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        <span style={{ color: ZODIAC_COLORS[resultData.gad.sign] || '#D4AF37' }}>
                          {ZODIAC_SYMBOLS[resultData.gad.sign]} {resultData.gad.sign}
                        </span>
                        <span className="text-base sm:text-lg font-normal text-mystic-text-muted">
                          {resultData.gad.degreeInSign}° ({resultData.gad.house}. Ev)
                        </span>
                      </h3>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right">
                      <div className="text-xs text-mystic-text-muted">Geçmiş Yaşam Arketipi</div>
                      <div className="text-sm font-bold text-[#FFD700]">{resultData.gad.info.archetype}</div>
                    </div>
                  </div>

                  {/* Human Design GAD Sentezi */}
                  {resultData.gad.hdGate && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-[#FFD700] font-bold text-xs">
                            ⚡ HD Kapısı: {resultData.gad.hdGate.gate}.{resultData.gad.hdGate.line}
                          </span>
                          <span className="text-white font-semibold">{resultData.gad.hdGate.title}</span>
                          <span className="text-white/50">({resultData.gad.hdGate.center} Merkezi)</span>
                        </div>
                        <span className="text-xs text-amber-300 font-medium">{resultData.gad.hdGate.lineArchetype}</span>
                      </div>
                      <p className="text-white/80 text-xs leading-relaxed">
                        <strong className="text-amber-400">Ruhun Kök Kodu:</strong> {resultData.gad.hdGate.synthesis}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20">
                          <strong className="text-rose-400 block mb-1">Gölge Konfor Tuzağı:</strong>
                          <span className="text-mystic-text-muted">{resultData.gad.hdGate.shadowTrap}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20">
                          <strong className="text-emerald-400 block mb-1">Geçmişten Taşınan Deha:</strong>
                          <span className="text-mystic-text-muted">{resultData.gad.hdGate.karmicGift}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-2 relative overflow-hidden">
                      <h4 className="text-sm font-bold text-[#D4AF37] flex items-center justify-between">
                        <span className="flex items-center gap-2"><span>📜</span> Önceki Yaşam Rolü & Kimliği</span>
                        {!isMasterOrAdmin && <Lock size={14} className="text-[#D4AF37]" />}
                      </h4>
                      <p className={`text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.gad.info.pastLifeRole}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-2 relative overflow-hidden">
                      <h4 className="text-sm font-bold text-amber-400 flex items-center justify-between">
                        <span className="flex items-center gap-2"><span>⚠️</span> Konfor Alanı & Karmik Tuzak</span>
                        {!isMasterOrAdmin && <Lock size={14} className="text-amber-400" />}
                      </h4>
                      <p className={`text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.gad.info.comfortZoneTrap}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-2 relative overflow-hidden">
                      <h4 className="text-sm font-bold text-emerald-400 flex items-center justify-between">
                        <span className="flex items-center gap-2"><span>🎁</span> Geçmişten Gelen Ruhsal Yetenek</span>
                        {!isMasterOrAdmin && <Lock size={14} className="text-emerald-400" />}
                      </h4>
                      <p className={`text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.gad.info.karmicGift}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-2 relative overflow-hidden">
                      <h4 className="text-sm font-bold text-cyan-400 flex items-center justify-between">
                        <span className="flex items-center gap-2"><span>🏛️</span> Geçmiş Yaşam Çevresi ({resultData.gad.house}. Ev)</span>
                        {!isMasterOrAdmin && <Lock size={14} className="text-cyan-400" />}
                      </h4>
                      <p className={`text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.gad.houseInfo.pastLifeCircumstances}
                      </p>
                    </div>
                  </div>

                  {/* Karmic Ruler Card */}
                  <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-2">
                        <span>👑</span> Karmik Cetvel (GAD Yöneticisi): {resultData.gad.karmicRuler.name} ({resultData.gad.karmicRuler.sign}, {resultData.gad.karmicRuler.house}. Ev)
                      </span>
                      {!isMasterOrAdmin && <Lock size={14} className="text-[#D4AF37]" />}
                    </div>
                    <p className={`text-sm text-white/90 leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                      {resultData.gad.karmicRuler.summary}
                    </p>
                  </div>

                  {/* Locked Banner if not master */}
                  {!isMasterOrAdmin && renderLockedSectionNotice()}
                </div>

                {/* 12th House & Last Breath Card */}
                <div className="bg-mystic-surface/50 border border-white/10 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                        <Moon size={24} />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-purple-400 font-bold">
                          Bilinçaltı & Son Nefes Hafızası
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">
                          12. Ev: {resultData.twelfthHouse.sign} Burcu (Yönetici: {resultData.twelfthHouse.ruler})
                        </h3>
                      </div>
                    </div>
                    {!isMasterOrAdmin && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-mystic-text-muted text-xs font-semibold">
                        <Lock size={12} className="text-[#D4AF37]" />
                        <span>Usta Seviyesi</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                      <span className="text-xs font-bold text-purple-300">Son Nefes & Geçiş Hali</span>
                      <p className={`text-xs sm:text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.twelfthHouse.lastBreathAtmosphere}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                      <span className="text-xs font-bold text-cyan-300">Bilinçaltı Koruma Armağanı</span>
                      <p className={`text-xs sm:text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.twelfthHouse.subconsciousGift}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                      <span className="text-xs font-bold text-rose-300">Gizli Karmik Korku</span>
                      <p className={`text-xs sm:text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.twelfthHouse.hiddenFear}
                      </p>
                    </div>
                  </div>

                  {/* Human Design 12. Ev Karmik Korku & Özgürleşme Sentezi */}
                  {resultData.twelfthHouse.hdFearSynthesis && (
                    <div className="mt-6 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs sm:text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs">
                          ⚡ Human Design Karmik Korku Merkezi
                        </span>
                        <span className="text-white font-semibold">{resultData.twelfthHouse.hdFearSynthesis.centerTitle}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20">
                          <strong className="text-rose-400 block mb-1">Hücresel Son Nefes Travması:</strong>
                          <p className="text-mystic-text-muted leading-relaxed">{resultData.twelfthHouse.hdFearSynthesis.traumaMechanism}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20">
                          <strong className="text-cyan-400 block mb-1">Özgürleşme & Ruhsal Teslimiyet:</strong>
                          <p className="text-mystic-text-muted leading-relaxed">{resultData.twelfthHouse.hdFearSynthesis.liberationKey}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {resultData.twelfthHouse.planetsIn12th.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <div className="text-xs font-bold text-white/70 uppercase tracking-wider">
                        12. Evde Yerleşen Karmik Gezegenler:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {resultData.twelfthHouse.planetsIn12th.map((p, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90">
                            <strong className="text-[#D4AF37]">{p.name} ({p.sign}):</strong>{' '}
                            <span className={!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}>
                              {p.meaning}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. KARMIC DEBTS & CHIRON */}
            {activeTab === 'karmic_debts' && (
              <div className="space-y-6">
                {/* Retro Planets Section */}
                <div className="bg-mystic-surface/50 border border-white/10 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <ShieldAlert size={24} />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-rose-400 font-bold">
                          Geçmiş Yaşam Borçları (Retrograd Gezegenler)
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">
                          {resultData.retroDebts.length > 0 
                            ? `${resultData.retroDebts.length} Adet Karmik Borç Gezegeni Tespit Edildi`
                            : 'Doğrudan Retro Karmik Borç Yok'}
                        </h3>
                      </div>
                    </div>
                    {!isMasterOrAdmin && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-mystic-text-muted text-xs font-semibold">
                        <Lock size={12} className="text-[#D4AF37]" />
                        <span>Usta Seviyesi</span>
                      </div>
                    )}
                  </div>

                  {resultData.retroDebts.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
                      <CheckCircle2 size={24} className="shrink-0" />
                      <span>
                        Haritanızda doğrudan retrogezegen karmik borcu tespit edilmemiştir. Ruhunuz geçmiş borçlarının önemli bir kısmını arındırmış ve bu yaşama daha hafif bir karmik bavul ile gelmiştir.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {resultData.retroDebts.map((debt, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-black/40 border border-rose-500/20 space-y-3 relative overflow-hidden">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                              {debt.planet} Rx: <span className="text-rose-400">{debt.title}</span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {debt.polarityLabel && (
                                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                                  debt.polarity === 'active' 
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                                    : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                }`}>
                                  {debt.polarityLabel}
                                </span>
                              )}
                              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Retrograd
                              </span>
                            </div>
                          </div>

                          {debt.hdDiagnosis && (
                            <div className="text-[11px] text-sky-300/90 bg-sky-950/40 border border-sky-800/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                              <span className="text-sky-400 font-bold shrink-0">⚡ Human Design Teşhisi:</span>
                              <span className="truncate">{debt.hdDiagnosis}</span>
                            </div>
                          )}

                          <div className="space-y-2 text-xs sm:text-sm">
                            <p className="text-mystic-text-muted">
                              <strong className="text-white/90">Geçmiş Yaşam Nedeni:</strong>{' '}
                              <span className={!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}>
                                {debt.pastLifeCause}
                              </span>
                            </p>
                            <p className="text-mystic-text-muted">
                              <strong className="text-white/90">Bu Yaşamdaki Borç:</strong>{' '}
                              <span className={!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}>
                                {debt.currentLifeKarma}
                              </span>
                            </p>
                            <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                              <strong className="text-emerald-400 block mb-1">Dharma Reçetesi & Şifa Yolu:</strong>
                              <span className={!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}>
                                {debt.dharmaRemedy}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isMasterOrAdmin && renderLockedSectionNotice()}
                </div>

                {/* Chiron Section */}
                {resultData.chiron && (
                  <div className="bg-mystic-surface/50 border border-white/10 rounded-3xl p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                          <HeartHandshake size={24} />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold">
                            Kiron (Karmik Ruh Yarası & Başkalarına Şifa Kapısı)
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-white">
                            {resultData.chiron.sign} Burcu, {resultData.chiron.house}. Ev
                          </h3>
                        </div>
                      </div>
                      {!isMasterOrAdmin && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-mystic-text-muted text-xs font-semibold">
                          <Lock size={12} className="text-[#D4AF37]" />
                          <span>Usta Seviyesi</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                        <span className="text-xs font-bold text-rose-400">Ruhun Kutsal Yarası</span>
                        <h4 className="text-sm font-semibold text-white">{resultData.chiron.wound.title}</h4>
                        <p className={`text-xs sm:text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                          {resultData.chiron.wound.woundDescription}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                        <span className="text-xs font-bold text-emerald-400">Başkalarına Dağıtılan Şifa</span>
                        <h4 className="text-sm font-semibold text-white">Şifacı Arketipiniz</h4>
                        <p className={`text-xs sm:text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                          {resultData.chiron.wound.healingGift}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                        <span className="text-xs font-bold text-[#D4AF37]">Dönüşüm & Kendini Sevme Anahtarı</span>
                        <h4 className="text-sm font-semibold text-white">İçsel Çözüm</h4>
                        <p className={`text-xs sm:text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                          {resultData.chiron.wound.soulRemedy}
                        </p>
                      </div>
                    </div>

                    {/* Human Design Kiron Kapı Sentezi */}
                    {resultData.chiron.hdGate && (
                      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/30 text-xs sm:text-sm space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-[#FFD700] font-bold text-xs">
                              ⚡ Kiron HD Kapısı: {resultData.chiron.hdGate.gate}.{resultData.chiron.hdGate.line}
                            </span>
                            <span className="text-white font-semibold">{resultData.chiron.hdGate.title}</span>
                            <span className="text-white/50">({resultData.chiron.hdGate.center} Merkezi)</span>
                          </div>
                          <span className="text-xs text-amber-300 font-medium">{resultData.chiron.hdGate.lineArchetype}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                          <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20">
                            <strong className="text-rose-400 block mb-1">Kiron Yarasının Kökeni:</strong>
                            <p className="text-mystic-text-muted leading-relaxed">{resultData.chiron.hdGate.woundKey}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20">
                            <strong className="text-emerald-400 block mb-1">Kozmik Şifa Dehası:</strong>
                            <p className="text-mystic-text-muted leading-relaxed">{resultData.chiron.hdGate.healingGift}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20">
                            <strong className="text-amber-400 block mb-1">Dönüşüm Pratiği:</strong>
                            <p className="text-mystic-text-muted leading-relaxed">{resultData.chiron.hdGate.transformationPractice}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. DRACONIC CHART */}
            {activeTab === 'draconic' && (
              <div className="space-y-6">
                {/* Draconic Introduction Banner */}
                <div className="bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-indigo-900/30 border border-indigo-500/30 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Compass size={28} className="text-indigo-400" />
                      <h3 className="text-2xl font-bold text-white">Drakonik Harita (Ruhun Gerçek Özü)</h3>
                    </div>
                    {!isMasterOrAdmin && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-mystic-text-muted text-xs font-semibold">
                        <Lock size={12} className="text-[#D4AF37]" />
                        <span>Usta Seviyesi</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-mystic-text-muted max-w-3xl leading-relaxed">
                    Tropikal natal haritanız bu dünyadaki biyolojik bedeninizin, maskenizin ve egonuzun arketipidir. Kuzey Ay Düğümü 0° Koç noktasına hizalanarak hesaplanan <strong className="text-white">Drakonik Harita</strong> ise enkarnasyonlar ötesindeki ebedi ruhunuzun yüksek titreşimini ve hakiki arzusunu yansıtır.
                  </p>
                </div>

                {/* Human Design Enkarnasyon Çaprazı (Ruhun Kozmik Misyonu) */}
                {resultData.incarnationCross && (
                  <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-indigo-950/40 border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold mb-1 flex items-center gap-2">
                          <Sparkles size={16} /> Human Design Enkarnasyon Çaprazı (Incarnation Cross)
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                          <span>{resultData.incarnationCross.title}</span>
                          <span className="text-sm font-normal text-mystic-text-muted font-mono">{resultData.incarnationCross.code}</span>
                        </h3>
                      </div>
                      <span className="px-3 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFD700] text-xs font-bold">
                        {resultData.incarnationCross.angleType}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <span className="text-xs font-bold text-indigo-300 block">Kozmik Sütunlar (Güneş & Dünya Kapıları):</span>
                      <p className="text-xs sm:text-sm text-white/90 font-mono leading-relaxed">{resultData.incarnationCross.gatesSummary}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 space-y-2">
                      <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Ruhun Dünyadaki Büyük Misyonu & Tekâmülü:</span>
                      <p className={`text-sm text-white/95 leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.incarnationCross.soulMission}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resultData.draconicComparison.map((comp, idx) => (
                    <div key={idx} className="bg-mystic-surface/50 border border-white/10 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <h4 className="text-base font-bold text-white">{comp.pointName}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                          <span className="text-xs text-mystic-text-muted block mb-1">Dünyevi (Tropikal)</span>
                          <div className="text-lg font-bold" style={{ color: ZODIAC_COLORS[comp.tropicalSign] }}>
                            {ZODIAC_SYMBOLS[comp.tropicalSign]} {comp.tropicalSign} ({comp.tropicalDegree}°)
                          </div>
                          <span className="text-[11px] text-white/50">Dışarıya gösterilen yüz</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                          <span className="text-xs text-indigo-300 block mb-1">Ruhsal (Drakonik)</span>
                          <div className="text-lg font-bold text-[#FFD700]">
                            {ZODIAC_SYMBOLS[comp.draconicSign]} {comp.draconicSign} ({comp.draconicDegree}°)
                          </div>
                          <span className="text-[11px] text-white/50">Ruhun derin arzusu</span>
                        </div>
                      </div>

                      <div className={`space-y-2.5 pt-2 text-xs sm:text-sm leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                          <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                            🎭 Dünyevi Yüzünüz ({comp.tropicalSign})
                          </span>
                          <p className="text-mystic-text-muted leading-relaxed">
                            {comp.tropicalMeaning || comp.spiritualMeaning}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                            ✨ Ruhsal Özünüz ({comp.draconicSign})
                          </span>
                          <p className="text-mystic-text-muted leading-relaxed">
                            {comp.draconicMeaning || comp.spiritualMeaning}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 space-y-1">
                          <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                            🎯 Tekâmül Anahtarı
                          </span>
                          <p className="text-white/90 leading-relaxed font-medium">
                            {comp.synthesis || comp.spiritualMeaning}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!isMasterOrAdmin && renderLockedSectionNotice()}
              </div>
            )}

            {/* TAB CONTENT: 4. PROGRESSED & INTERCEPTED */}
            {activeTab === 'progressed' && resultData.progressedEvolution && resultData.progressedEvolution.hasSpecialLocks && (
              <div className="space-y-6">
                {/* Special Illumination Alert / Initiation Key Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-purple-900/20 to-black/40 border border-amber-500/30 flex items-start gap-4 shadow-xl">
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-[#FFD700] shrink-0">
                    <Sparkles size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>⚠️ Özel Karmik Aydınlanma & İnisiyasyon Kilidi</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-mystic-text-muted leading-relaxed">
                      Doğum haritanızda ruhsal tekâmülünüzü doğrudan mühürleyen özel bir karmik eşik tespit edilmiştir. Bu gösterge sıradan bir enerji yerleşimi değil; geçmiş yaşamlardan bu enkarnasyona taşınan gizli bir inisiyasyon sınavı ve açılması gereken kilitli bir ruh kodudur.
                    </p>
                  </div>
                </div>

                {/* 28°-29° ANARETİK SINIR DERECESİ & İKİNCİL İLERLETİLMİŞ GÜNEŞ (SADECE VARSA GÖSTERİLİR) */}
                {resultData.progressedEvolution.isCriticalDegree && (
                  <div className="bg-gradient-to-r from-purple-950/40 via-mystic-surface/60 to-black/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            2. İlerletilmiş Harita (Secondary Progressions)
                          </span>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                            style={{
                              backgroundColor: `${resultData.progressedEvolution.badgeColor}20`,
                              color: resultData.progressedEvolution.badgeColor,
                              borderColor: `${resultData.progressedEvolution.badgeColor}40`
                            }}
                          >
                            {resultData.progressedEvolution.badgeTitle}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
                          İlerletilmiş Ruh Evrimi & Anaretik Sınır Derecesi
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-mystic-text-muted leading-relaxed max-w-3xl">
                      {resultData.progressedEvolution.evolutionSummary}
                    </p>

                    {/* Progressed Sun Shift Card */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                        <span className="text-xs text-white/50 block mb-1">Natal (Doğum Anı) Güneş</span>
                        <div className="text-lg font-bold text-white flex items-center gap-2">
                          <span>{ZODIAC_SYMBOLS[resultData.progressedEvolution.natalSunSign]}</span>
                          <span>{resultData.progressedEvolution.natalSunSign}</span>
                          <span className="text-xs text-white/60 font-mono">
                            {resultData.progressedEvolution.natalSunDegree}°{resultData.progressedEvolution.natalSunMinutes}'
                          </span>
                        </div>
                        <span className="text-[11px] text-white/40 mt-1 block">Ruhun bu hayata geldiği kök kimlik</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
                        <span className="text-xs text-purple-300 block mb-1">İkincil İlerletilmiş Güneş</span>
                        <div className="text-lg font-bold text-[#FFD700] flex items-center gap-2">
                          <span>{ZODIAC_SYMBOLS[resultData.progressedEvolution.progressedSunSign]}</span>
                          <span>{resultData.progressedEvolution.progressedSunSign}</span>
                        </div>
                        <span className="text-[11px] text-purple-200/60 mt-1 block">
                          {resultData.progressedEvolution.hasShifted 
                            ? `Ruhunuz ${resultData.progressedEvolution.progressedAge} yaşında bu burcun frekansına sıçradı.`
                            : `${resultData.progressedEvolution.progressedAge} yaşında bu yeni bilince sıçrayacak.`}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                        <span className="text-xs text-amber-300 block mb-1">Tekâmül Eşiği Yaşı</span>
                        <div className="text-lg font-bold text-white flex items-center gap-2">
                          <Clock size={18} className="text-[#D4AF37]" />
                          <span>{resultData.progressedEvolution.progressedAge} Yaş</span>
                        </div>
                        <span className="text-[11px] text-white/50 mt-1 block">
                          {resultData.progressedEvolution.degreeType === '29° Anaretik Derece'
                            ? '29° Anaretik: Geçmiş yaşam karmanızı ilk yıllarda kapatıp yeni frekansa geçtiniz.'
                            : 'Karmik kabuk değişimi ve içsel bilinç genişleme yaşı.'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SIKIŞTIRILMIŞ BURÇLAR (KİLİTLİ SANDIKLAR) (SADECE VARSA GÖSTERİLİR) */}
                {resultData.progressedEvolution.hasInterceptedSigns && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-[#D4AF37] border border-amber-500/30">
                          <Key size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg sm:text-xl font-bold text-white">
                            Sıkıştırılmış Burçlar (Kilitli Sandıklar & Gizli Potansiyeller)
                          </h4>
                          <p className="text-xs text-mystic-text-muted">
                            Ev çizgilerinin arasına hapsolmuş, geçmiş yaşamda bastırılmış veya yasaklanmış kök güçler
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {resultData.progressedEvolution.interceptedSigns.map((inter, idx) => (
                        <div
                          key={idx}
                          className="bg-mystic-surface/50 border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4"
                        >
                          <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-500/20 text-[#D4AF37] border border-amber-500/40">
                                  {inter.house}. Evde Hapsolmuş
                                </span>
                                <span className="text-xs text-white/50 font-medium">
                                  Yönetici: {inter.ruler}
                                </span>
                                {inter.polarityLabel && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    inter.polarity === 'active' 
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                  }`}>
                                    ⚡ {inter.polarityLabel}
                                  </span>
                                )}
                              </div>
                              <h5 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                                <span>{ZODIAC_SYMBOLS[inter.sign]} {inter.sign} Burcu</span>
                                <span className="text-xs font-normal text-mystic-text-muted">
                                  ({inter.archetype})
                                </span>
                              </h5>
                            </div>
                            <div className="p-2.5 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                              <Lock size={18} />
                            </div>
                          </div>

                          {inter.hdDiagnosis && (
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                              <strong className="text-[#FFD700] block mb-1">🧬 Human Design Sentezi:</strong>
                              {inter.hdDiagnosis}
                            </div>
                          )}

                          {inter.planetsInside && inter.planetsInside.length > 0 && (
                            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
                              <Star size={14} className="text-[#D4AF37] shrink-0" />
                              <span>
                                <strong>Bu Sandıkta Kilitli Gezegenler:</strong> {inter.planetsInside.join(', ')}
                              </span>
                            </div>
                          )}

                          <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
                            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                                ⛓️ Geçmiş Yaşamda Neden Kilitlendi?
                              </span>
                              <p className="text-mystic-text-muted leading-relaxed">
                                {inter.karmicRootCause}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                              <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">
                                🔒 Bu Yaşamdaki Bilinçaltı Etkisi
                              </span>
                              <p className="text-mystic-text-muted leading-relaxed">
                                {inter.lockedPsychology}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 space-y-1">
                              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block flex items-center gap-1.5">
                                <Unlock size={13} />
                                🗝️ Kilitli Sandığı Açacak Tekâmül Anahtarı
                              </span>
                              <p className="text-white/90 leading-relaxed font-medium">
                                {inter.unlockKey}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isMasterOrAdmin && renderLockedSectionNotice()}
              </div>
            )}

            {/* TAB CONTENT: 5. NEXT LIFE & DHARMA */}
            {activeTab === 'next_life' && (
              <div className="space-y-6">
                {/* North Node / Dharma Card */}
                <div className="bg-mystic-surface/50 border border-white/10 rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">
                        Kuzey Ay Düğümü (KAD / Rahu) - Şimdiki Dharma
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        <span style={{ color: ZODIAC_COLORS[resultData.kad.sign] || '#34C759' }}>
                          {ZODIAC_SYMBOLS[resultData.kad.sign]} {resultData.kad.sign}
                        </span>
                        <span className="text-base sm:text-lg font-normal text-mystic-text-muted">
                          {resultData.kad.degreeInSign}° ({resultData.kad.house}. Ev)
                        </span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold">
                        Tekâmül Pusulası
                      </div>
                      {!isMasterOrAdmin && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-mystic-text-muted text-xs font-semibold">
                          <Lock size={12} className="text-[#D4AF37]" />
                          <span>Usta</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <span className="text-xs font-bold text-emerald-400">Bu Yaşamdaki Nihai Amaç</span>
                      <h4 className="text-sm font-semibold text-white">Dharma Hedefi</h4>
                      <p className={`text-xs sm:text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.kad.seed.evolutionGoal}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <span className="text-xs font-bold text-[#D4AF37]">Gelecek Enkarnasyon Potansiyeli</span>
                      <h4 className="text-sm font-semibold text-white">Ruhun Bir Sonraki Seviyesi</h4>
                      <p className={`text-xs sm:text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.kad.seed.nextIncarnationPotential}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <span className="text-xs font-bold text-cyan-400">Kutsal Ruhsal Pratik</span>
                      <h4 className="text-sm font-semibold text-white">Günlük Tekâmül Eylemi</h4>
                      <p className={`text-xs sm:text-sm text-mystic-text-muted leading-relaxed ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                        {resultData.kad.seed.sacredPractice}
                      </p>
                    </div>
                  </div>

                  {/* Human Design KAD Evrim Yolu Sentezi */}
                  {resultData.kad.hdGate && (
                    <div className="mt-6 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs sm:text-sm space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                            ⚡ KAD HD Kapısı: {resultData.kad.hdGate.gate}.{resultData.kad.hdGate.line}
                          </span>
                          <span className="text-white font-semibold">{resultData.kad.hdGate.title}</span>
                          <span className="text-white/50">({resultData.kad.hdGate.center} Merkezi)</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-medium">{resultData.kad.hdGate.lineArchetype}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20">
                          <strong className="text-emerald-400 block mb-1">Ruhun Evrimsel Yolu:</strong>
                          <p className="text-mystic-text-muted leading-relaxed">{resultData.kad.hdGate.evolutionPath}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20">
                          <strong className="text-amber-400 block mb-1">Ruhsal Eylem Reçetesi (Dharma):</strong>
                          <p className="text-mystic-text-muted leading-relaxed">{resultData.kad.hdGate.actionableDharma}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 8th House: Boyut Geçişi & Dönüşüm Kapısı */}
                <div className="bg-mystic-surface/50 border border-white/10 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Flame size={24} />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                          8. Ev: Boyut Geçişi & Ruhun Dönüşüm Kapısı
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">
                          {resultData.eighthHouse.sign} Burcu (Yönetici: {resultData.eighthHouse.ruler})
                        </h3>
                      </div>
                    </div>
                    {!isMasterOrAdmin && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-mystic-text-muted text-xs font-semibold">
                        <Lock size={12} className="text-[#D4AF37]" />
                        <span>Usta Seviyesi</span>
                      </div>
                    )}
                  </div>

                  <p className={`text-sm text-mystic-text-muted leading-relaxed p-4 rounded-2xl bg-black/30 border border-white/5 ${!isMasterOrAdmin ? 'blur-sm select-none opacity-40' : ''}`}>
                    {resultData.eighthHouse.transformationGateway}
                  </p>
                </div>

                {!isMasterOrAdmin && renderLockedSectionNotice()}
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-4 flex gap-3 items-start mt-8">
              <AlertCircle size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <p className="text-xs text-mystic-text-muted leading-relaxed">
                Bu analiz; kadim Karmik Astroloji, Drakonik Ruh Haritası ve Human Design (Kapı, Merkez ve Enkarnasyon Çaprazı) kozmik hesaplamalarının hakiki bir sentezine dayanır. Amacı, bilinçaltı kök eğilimlerinizi aydınlatmak ve tekâmül sürecinizde size farkındalık kazandırmaktır. Kader kesin bir çizgi değil, özgür iradeniz ve yüksek bilincinizle şekillendirdiğiniz dinamik bir akıştır.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Giriş Yapın veya Kayıt Olun"
        description="Karmik analiz raporunuzu 888 TL karşılığında satın alıp profilinizde ve e-postanızda güvenle saklayabilmeniz için lütfen giriş yapın."
        redirectUrl={`/checkout/guest?type=incarnation&date=${dateStr}&time=${timeStr}&city=${encodeURIComponent(cityKey?.name || '')}&lat=${cityKey?.lat || ''}&lon=${cityKey?.lon || ''}&tz=${cityKey?.tz || ''}`}
      />

      {/* Premium Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowLockModal(false)}>
          <div 
            className="bg-[#111] border border-[#D4AF37]/30 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-[#D4AF37] mx-auto mb-4 flex justify-center"><Lock size={48} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Detaylı Karmik Analiz Kilitli</h3>
            <p className="text-mystic-text-muted text-sm mb-6 leading-relaxed">
              Geçmiş yaşam nedenleri, karmik borçlar ve dharma reçeteleri Usta Seviyesi (Master) üyelere özeldir. Usta üyeliğe geçebilir veya tüm detayları içeren 5 sayfalık PDF Raporunu indirebilirsiniz.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowLockModal(false);
                  handlePurchaseReport();
                }}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/20"
              >
                Raporu İndir (888 TL)
              </button>
              <button 
                onClick={() => setShowLockModal(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
