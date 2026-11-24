"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Compass,
  Loader2,
  Sparkles,
  Calendar,
  Clock,
  RefreshCw,
  Wind,
  Hand,
  Gem,
  Sun,
  Moon,
  Volume2,
  Play,
  Square,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import SafeTimePicker from '@/components/ui/SafeTimePicker';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import AnalysisBackButton from '@/components/ui/AnalysisBackButton';
import { useAuth } from '@/context/AuthContext';
import { AstroCity, TransitChartData } from '@/features/astrology/engine/AstrologyConstants';
import {
  generate7LayersDailyGuide,
  SevenLayersDailyGuideReport,
  GuidePlanetaryHourSlot,
} from '@/features/astrology/engine/DailyRitualGuideEngine';

const STORAGE_KEY = '7layers_daily_guide_context_v1';

export default function SevenLayersDailyGuidePage() {
  const { role, isLoading: authLoading } = useAuth();
  const isAdmin = role === 'admin';
  const today = new Date();
  const defaultTDate = today.toISOString().split('T')[0];
  const defaultTTime = today.toTimeString().slice(0, 5);

  const [natalDateStr, setNatalDateStr] = useState('1990-01-01');
  const [natalTimeStr, setNatalTimeStr] = useState('12:00');
  const [cityKey, setCityKey] = useState<AstroCity | null>(null);
  const [transitCityKey, setTransitCityKey] = useState<AstroCity | null>(null);
  const [transitDateStr, setTransitDateStr] = useState(defaultTDate);
  const [transitTimeStr, setTransitTimeStr] = useState(defaultTTime);
  const [appliedDateStr, setAppliedDateStr] = useState(defaultTDate);
  const [appliedTimeStr, setAppliedTimeStr] = useState(defaultTTime);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitData, setTransitData] = useState<TransitChartData | null>(null);
  const [showFullHoraTable, setShowFullHoraTable] = useState(false);

  // Canlı Frekans Çalar (Web Audio)
  const [playingChakraHz, setPlayingChakraHz] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  // Canlı İnteraktif Pranayama Nefes Sayacı
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE'>('INHALE');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(4);
  const [breathRound, setBreathRound] = useState(1);

  const stopWebChakraAudio = () => {
    try {
      oscRef.current?.stop();
      oscRef.current?.disconnect();
    } catch {}
    try {
      lfoRef.current?.stop();
      lfoRef.current?.disconnect();
    } catch {}
    oscRef.current = null;
    lfoRef.current = null;
    setPlayingChakraHz(null);
  };

  const toggleWebChakraHz = (hz: number) => {
    if (playingChakraHz === hz) {
      stopWebChakraAudio();
      return;
    }
    stopWebChakraAudio();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hz, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.5;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.14;

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      lfo.start();
      oscRef.current = osc;
      lfoRef.current = lfo;
      setPlayingChakraHz(hz);
    } catch {}
  };

  useEffect(() => {
    return () => {
      stopWebChakraAudio();
    };
  }, []);

  const calculateGuideData = async (params: {
    nDate: string;
    nTime: string;
    nCity: AstroCity;
    tCity: AstroCity | null;
    tDate: string;
    tTime: string;
  }) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/astrology/calculate-transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          natalDate: params.nDate,
          natalTime: params.nTime,
          transitDate: params.tDate,
          transitTime: params.tTime,
          cityData: params.nCity,
          transitCityData: params.tCity || params.nCity,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Günlük rehber hesaplanırken bir hata oluştu.');
      }
      setAppliedDateStr(params.tDate);
      setAppliedTimeStr(params.tTime);
      setTransitData(data.data);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            natalDateStr: params.nDate,
            natalTimeStr: params.nTime,
            cityKey: params.nCity,
            transitCityKey: params.tCity,
            transitDateStr: params.tDate,
            transitTimeStr: params.tTime,
          })
        );
      } catch {}
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load saved context from localStorage or query params on mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const qDate = searchParams.get('date');
      const qTime = searchParams.get('time');
      const qAuto = searchParams.get('auto');

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const nDate = parsed.natalDateStr || '1990-01-01';
        const nTime = parsed.natalTimeStr || '12:00';
        const nCity = parsed.cityKey || null;
        const tCity = parsed.transitCityKey || null;
        const tDate = qDate || parsed.transitDateStr || defaultTDate;
        const tTime = qTime || parsed.transitTimeStr || defaultTTime;

        setNatalDateStr(nDate);
        setNatalTimeStr(nTime);
        if (nCity) setCityKey(nCity);
        if (tCity) setTransitCityKey(tCity);
        setTransitDateStr(tDate);
        setTransitTimeStr(tTime);

        if (nCity && (qAuto === '1' || parsed.autoLoad)) {
          void calculateGuideData({
            nDate,
            nTime,
            nCity,
            tCity,
            tDate,
            tTime,
          });
        }
      } else if (qDate) {
        setTransitDateStr(qDate);
        if (qTime) setTransitTimeStr(qTime);
      }
    } catch {}
  }, []);

  const shiftDateStrByDays = (baseDateStr: string, deltaDays: number): string => {
    const parts = baseDateStr.split('-').map(Number);
    const dt =
      parts.length === 3 && !isNaN(parts[0])
        ? new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0))
        : new Date();
    dt.setUTCDate(dt.getUTCDate() + deltaDays);
    return dt.toISOString().split('T')[0];
  };

  const dailyGuide: SevenLayersDailyGuideReport | null = useMemo(() => {
    if (!transitData) return null;
    const activeCity = transitCityKey || cityKey;
    const [y, m, d] = appliedDateStr.split('-').map(Number);
    const [hh, mm] = (appliedTimeStr || '12:00').split(':').map(Number);
    const targetDateObj =
      y && m && d
        ? new Date(y, m - 1, d, hh || 12, mm || 0, 0)
        : new Date();

    return generate7LayersDailyGuide({
      transitPlanets: transitData.transitPlanets,
      allTransitAspects: transitData.transitAspects,
      natalPlanets: transitData.natalChart.planets,
      natalHouses: transitData.natalChart.houses,
      targetDate: targetDateObj,
      dateStr: appliedDateStr,
      lat: activeCity?.lat ?? 41.0082,
      lon: activeCity?.lon ?? 28.9784,
      cityName: activeCity?.name || 'İstanbul',
    });
  }, [transitData, appliedDateStr, appliedTimeStr, cityKey, transitCityKey]);

  // Interactive Breathwork Timer Effect
  useEffect(() => {
    if (!isBreathingActive || !dailyGuide) return;
    const { inhaleSec, holdSec, exhaleSec, recommendedRounds } = dailyGuide.breathGuide;

    const timer = setInterval(() => {
      setBreathSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        if (breathPhase === 'INHALE') {
          setBreathPhase('HOLD');
          return holdSec;
        }
        if (breathPhase === 'HOLD') {
          setBreathPhase('EXHALE');
          return exhaleSec;
        }
        // End of EXHALE -> Next round or complete
        if (breathRound >= recommendedRounds) {
          setIsBreathingActive(false);
          setBreathPhase('INHALE');
          setBreathRound(1);
          return inhaleSec;
        }
        setBreathRound((r) => r + 1);
        setBreathPhase('INHALE');
        return inhaleSec;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase, breathRound, dailyGuide]);

  const toggleBreathTimer = () => {
    if (!dailyGuide) return;
    if (isBreathingActive) {
      setIsBreathingActive(false);
      return;
    }
    setBreathPhase('INHALE');
    setBreathSecondsLeft(dailyGuide.breathGuide.inhaleSec);
    setBreathRound(1);
    setIsBreathingActive(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityKey) {
      setError('Lütfen doğum şehrinizi seçin.');
      return;
    }
    void calculateGuideData({
      nDate: natalDateStr,
      nTime: natalTimeStr,
      nCity: cityKey,
      tCity: transitCityKey,
      tDate: transitDateStr,
      tTime: transitTimeStr,
    });
  };

  const renderHoraBadge = (slot: GuidePlanetaryHourSlot) => {
    return (
      <div
        key={`${slot.isDay ? 'd' : 'n'}-${slot.index}`}
        className={`rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-3 ${
          slot.isCurrentNow
            ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
            : slot.isGoldenForToday
            ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50'
            : 'bg-black/40 border-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0 border"
            style={{
              color: slot.color,
              borderColor: `${slot.color}50`,
              backgroundColor: `${slot.color}18`,
            }}
          >
            {slot.symbol}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {slot.planetTr} Saati
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-gray-300">
                {slot.isDay ? `☀️ Gündüz ${slot.index}. Saat` : `🌙 Gece ${slot.index}. Saat`}
              </span>
              {slot.isCurrentNow && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                  ŞU AN AKTİF
                </span>
              )}
            </div>
            {slot.goldenReason && (
              <p className="text-[11px] text-[#FDE68A] font-medium mt-0.5">
                ✦ {slot.goldenReason}
              </p>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-black text-white tabular-nums block">
            {slot.startFormatted} - {slot.endFormatted}
          </span>
          {slot.isGoldenForToday && (
            <span className="text-[10px] text-amber-300 font-bold">
              ★ Altın Meditasyon Vakti
            </span>
          )}
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center text-white">
        <Loader2 size={28} className="animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 relative text-white">
        <div className="max-w-xl mx-auto bg-black/60 backdrop-blur-xl border border-[#D4AF37]/35 rounded-3xl p-8 text-center space-y-4">
          <AlertCircle size={40} className="text-[#D4AF37] mx-auto" />
          <h1 className="text-xl font-extrabold text-white">
            Bu Modül Şu An Yalnızca Yönetici (Admin) Erişimine Açıktır
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Günlük Meditasyon Rehberi modülü test ve kalibrasyon aşamasında olduğu için şu anda yalnızca Admin yetkisine sahip hesaplarla görüntülenebilir.
          </p>
          <div className="pt-2">
            <AnalysisBackButton hasActiveResult={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative text-white">
      <div className="max-w-6xl mx-auto">
        <AnalysisBackButton hasActiveResult={!!dailyGuide} />

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/25 to-[#0EA5E9]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.2)]">
              <BookOpen size={30} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#FDE68A] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <Sparkles size={11} /> 6 Katmanlı Kişisel Ezoterik Uygulama Reçetesi
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Günlük Meditasyon Rehberi
              </h1>
              <p className="text-xs sm:text-sm text-mystic-text-muted">
                Doğum haritanızın o günkü dereceli açılarına göre kişisel çakra frekansı, en etkili gezegen saati, nefes, mudra, yön ve taş reçeteniz
              </p>
            </div>
          </div>
        </div>

        {/* Form or Active Guide */}
        {!dailyGuide ? (
          <div className="max-w-2xl mx-auto bg-black/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2 flex items-center gap-2">
              <Sparkles size={20} /> Kişisel Günlük Rehberinizi Oluşturun
            </h3>
            <p className="text-xs text-mystic-text-muted mb-6 leading-relaxed">
              Doğum bilgilerinizi ve rehberini görmek istediğiniz tarihi seçin. Sistem o günkü dar dereceli transitlerinize ve bulunduğunuz şehrin Güneş doğuş/batış saatine göre 6 katmanlı kişisel uygulama rehberinizi hazırlayacaktır.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-white/70 font-bold border-b border-white/10 pb-2">
                  1. Doğum Bilgileriniz (Natal Harita)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-mystic-text-muted mb-1">
                      Doğum Tarihi
                    </label>
                    <input
                      type="date"
                      required
                      value={natalDateStr}
                      onChange={(e) => setNatalDateStr(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-mystic-text-muted mb-1">
                      Doğum Saati
                    </label>
                    <SafeTimePicker value={natalTimeStr} onChange={setNatalTimeStr} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-mystic-text-muted mb-1">
                    Doğum Şehri
                  </label>
                  <LocationAutocomplete
                    onSelect={(city: AstroCity) => setCityKey(city)}
                    defaultDisplay={cityKey ? `${cityKey.name}, ${cityKey.country}` : ''}
                    placeholder="Doğduğunuz şehri arayın..."
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-xs uppercase tracking-wider text-[#0EA5E9] font-bold border-b border-white/10 pb-2">
                  2. Uygulama Günü & Bulunduğunuz Şehir (Gezegen Saatleri İçin)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-mystic-text-muted mb-1">
                      Uygulama Tarihi
                    </label>
                    <input
                      type="date"
                      required
                      value={transitDateStr}
                      onChange={(e) => setTransitDateStr(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#0EA5E9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-mystic-text-muted mb-1">
                      Referans Saat
                    </label>
                    <SafeTimePicker value={transitTimeStr} onChange={setTransitTimeStr} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-mystic-text-muted mb-1">
                    Şu An Bulunduğunuz Şehir (Opsiyonel - Boşsa Doğum Şehri Alınır)
                  </label>
                  <LocationAutocomplete
                    onSelect={(city: AstroCity) => setTransitCityKey(city)}
                    defaultDisplay={
                      transitCityKey ? `${transitCityKey.name}, ${transitCityKey.country}` : ''
                    }
                    placeholder="Güneş doğuş/batış gezegen saati için bulunduğunuz şehir..."
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-xs">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] hover:from-[#F59E0B] hover:to-[#D4AF37] text-black font-extrabold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>6 Katmanlı Günlük Rehberiniz Hesaplanıyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Günlük Meditasyon Rehberimi Aç</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Toolbar: Past/Future Day Navigator & Profile Switch */}
            <div className="bg-black/55 backdrop-blur-xl border border-white/10 p-3.5 sm:p-4 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    if (!cityKey) return;
                    const prevD = shiftDateStrByDays(transitDateStr, -1);
                    setTransitDateStr(prevD);
                    void calculateGuideData({
                      nDate: natalDateStr,
                      nTime: natalTimeStr,
                      nCity: cityKey,
                      tCity: transitCityKey,
                      tDate: prevD,
                      tTime: transitTimeStr,
                    });
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  ◀ -1 Gün
                </button>

                <div className="flex items-center gap-2 bg-black/60 border border-white/15 rounded-xl px-3 py-1.5">
                  <Calendar size={14} className="text-[#D4AF37] shrink-0" />
                  <input
                    type="date"
                    value={transitDateStr}
                    onChange={(e) => {
                      const newD = e.target.value;
                      setTransitDateStr(newD);
                      if (/^\d{4}-\d{2}-\d{2}$/.test(newD) && cityKey) {
                        void calculateGuideData({
                          nDate: natalDateStr,
                          nTime: natalTimeStr,
                          nCity: cityKey,
                          tCity: transitCityKey,
                          tDate: newD,
                          tTime: transitTimeStr,
                        });
                      }
                    }}
                    className="bg-transparent text-white text-xs sm:text-sm focus:outline-none"
                  />
                  <div className="border-l border-white/10 pl-2">
                    <SafeTimePicker
                      value={transitTimeStr}
                      onChange={(newT) => {
                        setTransitTimeStr(newT);
                        if (/^\d{2}:\d{2}$/.test(newT) && cityKey) {
                          void calculateGuideData({
                            nDate: natalDateStr,
                            nTime: natalTimeStr,
                            nCity: cityKey,
                            tCity: transitCityKey,
                            tDate: transitDateStr,
                            tTime: newT,
                          });
                        }
                      }}
                      className="text-xs scale-90 origin-left"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    if (!cityKey) return;
                    const nextD = shiftDateStrByDays(transitDateStr, 1);
                    setTransitDateStr(nextD);
                    void calculateGuideData({
                      nDate: natalDateStr,
                      nTime: natalTimeStr,
                      nCity: cityKey,
                      tCity: transitCityKey,
                      tDate: nextD,
                      tTime: transitTimeStr,
                    });
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  +1 Gün ▶
                </button>

                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    if (!cityKey) return;
                    const nD = new Date().toISOString().split('T')[0];
                    const nT = new Date().toTimeString().slice(0, 5);
                    setTransitDateStr(nD);
                    setTransitTimeStr(nT);
                    void calculateGuideData({
                      nDate: natalDateStr,
                      nTime: natalTimeStr,
                      nCity: cityKey,
                      tCity: transitCityKey,
                      tDate: nD,
                      tTime: nT,
                    });
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Bugün
                </button>

                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    if (!cityKey) return;
                    void calculateGuideData({
                      nDate: natalDateStr,
                      nTime: natalTimeStr,
                      nCity: cityKey,
                      tCity: transitCityKey,
                      tDate: transitDateStr,
                      tTime: transitTimeStr,
                    });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#F59E0B] text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  <span>Tarihi Tara</span>
                </button>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 border-white/10 pt-2.5 lg:pt-0">
                <div className="text-xs text-gray-300">
                  <span className="text-mystic-text-muted">Harita & Konum:</span>{' '}
                  <strong className="text-white">
                    {natalDateStr} • {(transitCityKey || cityKey)?.name}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopWebChakraAudio();
                    setIsBreathingActive(false);
                    setTransitData(null);
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/15 rounded-xl text-xs text-white border border-white/10 transition-colors cursor-pointer shrink-0"
                >
                  Bilgileri Değiştir
                </button>
              </div>
            </div>

            {/* 5'li Ezoterik Reçete Özeti (Çakra • Nefes • Topraklanma • Gezegen Saati • Renk) & 4 Adımlı Plan */}
            <div className="bg-gradient-to-br from-[#D4AF37]/15 via-black/60 to-[#0EA5E9]/10 border border-[#D4AF37]/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#FDE68A] flex items-center gap-2">
                  <Sparkles size={15} /> GÜNÜN 5&apos;Lİ EZOTERİK REÇETESİ & UYGULAMA PLANI ({appliedDateStr})
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/15">
                  {dailyGuide.fivePillarSummary.activeWorldsSummary}
                </span>
              </div>

              {/* 5'li Hızlı Reçete Şeridi */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-black/60 border border-[#D4AF37]/35 rounded-2xl p-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4AF37] block">
                    1. Aktif Çakra Devresi
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white mt-1 block">
                    {dailyGuide.fivePillarSummary.activeChakrasSummary}
                  </span>
                </div>

                <div className="bg-black/60 border border-cyan-500/35 rounded-2xl p-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 block">
                    2. Nefes Tekniği
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white mt-1 block">
                    {dailyGuide.fivePillarSummary.breathTypeSummary}
                  </span>
                </div>

                <div className="bg-black/60 border border-emerald-500/35 rounded-2xl p-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                    3. Topraklanma Süresi
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white mt-1 block">
                    {dailyGuide.fivePillarSummary.groundingSummary}
                  </span>
                </div>

                <div className="bg-black/60 border border-amber-500/35 rounded-2xl p-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                    4. Gezegen Saati (Hora)
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white mt-1 block">
                    {dailyGuide.directionTattvaGuide.rulingPlanetSymbol}{' '}
                    {dailyGuide.fivePillarSummary.planetaryHourSummary}
                  </span>
                </div>

                <div className="bg-black/60 border border-rose-500/35 rounded-2xl p-3 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 block">
                    5. Günün Renk Rezonansı
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                      style={{ backgroundColor: dailyGuide.fivePillarSummary.colorHex }}
                    />
                    <span className="text-xs sm:text-sm font-black text-white">
                      {dailyGuide.fivePillarSummary.colorSummary}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dailyGuide.crystalAromaGuide.dailyRitualChecklist.map((step, idx) => (
                  <div
                    key={`step-${idx}`}
                    className="bg-black/45 border border-white/10 rounded-2xl p-3.5 flex items-start gap-3"
                  >
                    <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* KATMAN 1: GÜNLÜK DERECELİ ÇAKRA & CANLI FREKANS ÇALAR */}
            <div
              className={`rounded-3xl p-5 sm:p-7 border shadow-xl space-y-4 ${
                dailyGuide.chakraPrescription.mode === 'NATURAL_REST'
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-[#0B0F19]/90 border-[#D4AF37]/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37] block">
                    1. KATMAN • DİNA-GOCHAR GÜNLÜK DERECELİ ÇAKRA & FREKANS ODAĞI
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    {dailyGuide.chakraPrescription.headline}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                      dailyGuide.chakraPrescription.mode === 'NATURAL_REST'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-[#D4AF37]/15 text-[#FDE68A] border-[#D4AF37]/30'
                    }`}
                  >
                    {dailyGuide.chakraPrescription.badge}
                  </span>
                  {playingChakraHz && (
                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse flex items-center gap-1">
                      <Volume2 size={12} /> {playingChakraHz} HZ AKTİF
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {dailyGuide.chakraPrescription.explanation}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {dailyGuide.chakraPrescription.recommendedChakras.map((item, idx) => {
                  const isPlayingThis = playingChakraHz === item.hz;
                  return (
                    <div
                      key={`dg-chk-${item.chakraId}-${idx}`}
                      className="bg-black/50 rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col justify-between gap-3"
                      style={{ borderColor: isPlayingThis ? item.color : undefined }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span
                            className="text-[10px] font-extrabold uppercase tracking-wider block"
                            style={{ color: item.color }}
                          >
                            {dailyGuide.chakraPrescription.recommendedChakras.length > 1
                              ? `${idx + 1}. ÇAKRA ODAĞI • `
                              : ''}
                            {item.planetSource}
                          </span>
                          <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                            {item.fullName} ({item.hz} Hz)
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleWebChakraHz(item.hz)}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                            isPlayingThis
                              ? 'bg-red-500/20 border-red-500 text-red-300'
                              : 'bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border-[#D4AF37] text-[#FDE68A]'
                          }`}
                        >
                          {isPlayingThis ? <Square size={13} /> : <Play size={13} />}
                          <span>{isPlayingThis ? 'Durdur' : `${item.hz} Hz Aç`}</span>
                        </button>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed">{item.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KATMAN 2: O GÜN MEDİTASYON İÇİN EN ETKİLİ GEZEGEN SAATİ (KELDANİ HORA) */}
            <div className="bg-[#0B0F19]/90 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                    2. KATMAN • KELDANİ GEZEGEN SAATİ (HORA) ZAMANLAYICISI
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    Bugün Meditasyon İçin En Etkili Gezegen Saatleri (
                    {dailyGuide.planetaryHourGuide.targetPlanetsTr.join(' & ')} Vakitleri)
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5">
                    <Sun size={13} /> Doğuş: {dailyGuide.planetaryHourGuide.sunriseFormatted}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold flex items-center gap-1.5">
                    <Moon size={13} /> Batış: {dailyGuide.planetaryHourGuide.sunsetFormatted}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-white font-bold">
                    Günün Hâkimi: {dailyGuide.planetaryHourGuide.dayRulerSymbol}{' '}
                    {dailyGuide.planetaryHourGuide.dayRulerTr}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {dailyGuide.planetaryHourGuide.guidanceText}
              </p>

              {/* Şu An Aktif Saat & Sıradaki Altın Saat Özeti */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyGuide.planetaryHourGuide.currentHour && (
                  <div className="bg-emerald-500/10 border border-emerald-500/35 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                        ⏱️ SEÇİLİ ZAMANDA AKTİF OLAN GEZEGEN SAATİ
                      </span>
                      <span className="text-base font-extrabold text-white mt-0.5 block">
                        {dailyGuide.planetaryHourGuide.currentHour.symbol}{' '}
                        {dailyGuide.planetaryHourGuide.currentHour.planetTr} Saati
                      </span>
                      <span className="text-xs text-gray-300">
                        {dailyGuide.planetaryHourGuide.currentHour.isDay ? 'Gündüz' : 'Gece'}{' '}
                        {dailyGuide.planetaryHourGuide.currentHour.index}. Saat
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-300 tabular-nums block">
                        {dailyGuide.planetaryHourGuide.currentHour.startFormatted} -{' '}
                        {dailyGuide.planetaryHourGuide.currentHour.endFormatted}
                      </span>
                      {dailyGuide.planetaryHourGuide.currentHour.isGoldenForToday && (
                        <span className="text-[10px] font-bold text-[#FDE68A]">
                          ★ Çakranızla Tam Uyumlu!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {dailyGuide.planetaryHourGuide.nextGoldenHour && (
                  <div className="bg-[#D4AF37]/15 border border-[#D4AF37]/45 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FDE68A] block">
                        ★ ÖNERİLEN ALTIN MEDİTASYON SAATİ
                      </span>
                      <span className="text-base font-extrabold text-white mt-0.5 block">
                        {dailyGuide.planetaryHourGuide.nextGoldenHour.symbol}{' '}
                        {dailyGuide.planetaryHourGuide.nextGoldenHour.planetTr} Saati
                      </span>
                      <span className="text-xs text-amber-200/80">
                        {dailyGuide.planetaryHourGuide.nextGoldenHour.goldenReason}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-[#FDE68A] tabular-nums block">
                        {dailyGuide.planetaryHourGuide.nextGoldenHour.startFormatted} -{' '}
                        {dailyGuide.planetaryHourGuide.nextGoldenHour.endFormatted}
                      </span>
                      <span className="text-[10px] text-gray-300">
                        {dailyGuide.planetaryHourGuide.nextGoldenHour.isDay
                          ? '☀️ Gündüz Vakti'
                          : '🌙 Gece Vakti'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* O Günün Tüm Altın Meditasyon Vakitleri Listesi */}
              <div className="space-y-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white/80 block">
                  Bugünün Tüm Altın Meditasyon Vakitleri (
                  {dailyGuide.planetaryHourGuide.goldenHours.length} Vakit):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dailyGuide.planetaryHourGuide.goldenHours.map(renderHoraBadge)}
                </div>
              </div>

              {/* 24 Saatlik Tam Tabloyu Aç / Kapat */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowFullHoraTable((v) => !v)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Clock size={14} className="text-[#D4AF37]" />
                  <span>
                    {showFullHoraTable
                      ? '24 Saatlik Tam Gezegen Saatleri Tablosunu Gizle'
                      : '24 Saatlik Tam Gezegen Saatleri (12 Gündüz + 12 Gece) Tablosunu Gör'}
                  </span>
                  {showFullHoraTable ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {showFullHoraTable && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 pt-2">
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-2">
                        ☀️ Gündüz Gezegen Saatleri (1 - 12)
                      </h4>
                      {dailyGuide.planetaryHourGuide.allDayHours.map(renderHoraBadge)}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 mb-2">
                        🌙 Gece Gezegen Saatleri (1 - 12)
                      </h4>
                      {dailyGuide.planetaryHourGuide.allNightHours.map(renderHoraBadge)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* KATMAN 3: SWARA YOGA BURUN KANALI & PRANAYAMA NEFES SAYACI */}
            <div className="bg-[#0B0F19]/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 block">
                    3. KATMAN • SWARA YOGA BURUN KANALI & PRANAYAMA NEFES REÇETESİ
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    {dailyGuide.breathGuide.pranayamaName}
                  </h2>
                  <span className="text-xs text-cyan-300/80 font-medium">
                    {dailyGuide.breathGuide.sanskritSubtitle} • {dailyGuide.breathGuide.swaraChannelName}
                  </span>
                </div>
                <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/35 text-cyan-200">
                  {dailyGuide.breathGuide.activeNostrilBadge}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Sol 2 Kolon: Açıklama ve Adım Adım Tarif */}
                <div className="lg:col-span-2 space-y-4">
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                    {dailyGuide.breathGuide.whyThisBreath}
                  </p>

                  <div className="bg-black/45 border border-white/10 rounded-2xl p-4 space-y-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 block">
                      Uygulama Adımları ({dailyGuide.breathGuide.recommendedRounds} Tam Tur):
                    </span>
                    {dailyGuide.breathGuide.stepByStep.map((st, idx) => (
                      <div key={`bst-${idx}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sağ Kolon: Canlı İnteraktif Nefes Sayacı */}
                <div className="bg-gradient-to-b from-cyan-500/15 to-black/60 border border-cyan-500/35 rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-4">
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                    CANLI PRANAYAMA NEFES REHBERİ
                  </span>

                  <div
                    className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-700 ${
                      !isBreathingActive
                        ? 'border-cyan-500/40 bg-cyan-500/10 scale-100'
                        : breathPhase === 'INHALE'
                        ? 'border-emerald-400 bg-emerald-500/20 scale-110 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                        : breathPhase === 'HOLD'
                        ? 'border-amber-400 bg-amber-500/20 scale-110 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                        : 'border-cyan-400 bg-cyan-500/15 scale-95'
                    }`}
                  >
                    {isBreathingActive ? (
                      <>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                          {breathPhase === 'INHALE'
                            ? 'NEFES AL'
                            : breathPhase === 'HOLD'
                            ? 'MERKEZDE TUT'
                            : 'YAVAŞÇA VER'}
                        </span>
                        <span className="text-3xl font-black text-white tabular-nums my-0.5">
                          {breathSecondsLeft} sn
                        </span>
                        <span className="text-[10px] font-bold text-cyan-200">
                          Tur {breathRound} / {dailyGuide.breathGuide.recommendedRounds}
                        </span>
                      </>
                    ) : (
                      <>
                        <Wind size={28} className="text-cyan-300 mb-1" />
                        <span className="text-xs font-extrabold text-white">
                          {dailyGuide.breathGuide.inhaleSec} - {dailyGuide.breathGuide.holdSec} -{' '}
                          {dailyGuide.breathGuide.exhaleSec} sn
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {dailyGuide.breathGuide.recommendedRounds} Tur Ritim
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={toggleBreathTimer}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isBreathingActive
                        ? 'bg-red-500/20 border border-red-500 text-red-300'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg'
                    }`}
                  >
                    {isBreathingActive ? <Square size={14} /> : <Play size={14} />}
                    <span>
                      {isBreathingActive ? 'Nefes Sayacını Durdur' : 'Canlı Nefes Sayacını Başlat'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* KATMAN 4: PARMAK MÜHRÜ (HASTA MUDRA) & TOHUM SES (BİJA MANTRA) */}
            <div className="bg-[#0B0F19]/90 border border-purple-500/30 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 block">
                  4. KATMAN • HASTA MUDRA (PARMAK MÜHRÜ) & BİJA MANTRA (TOHUM SES)
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  Sinir Sistemi & Meridyen Kilidi: Parmak Duruşu ve Ses Titreşimi
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyGuide.mudraMantraList.map((mm, idx) => (
                  <div
                    key={`mm-${mm.chakraId}-${idx}`}
                    className="bg-black/50 border border-white/10 rounded-2xl p-5 space-y-3.5"
                    style={{ borderColor: `${mm.color}40` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border"
                        style={{
                          color: mm.color,
                          borderColor: `${mm.color}45`,
                          backgroundColor: `${mm.color}15`,
                        }}
                      >
                        {mm.chakraShortName} ({mm.hz} Hz)
                      </span>
                      <span className="text-xs font-black text-[#FDE68A] bg-[#D4AF37]/15 border border-[#D4AF37]/35 px-3 py-1 rounded-xl">
                        🕉️ Mantra: {mm.bijaMantra} ({mm.mantraRepetitions})
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Hand size={17} className="text-purple-400 shrink-0" />
                        <span>{mm.mudraName}</span>
                      </h3>
                      <span className="text-xs text-purple-300/80 font-medium block mt-0.5">
                        {mm.mudraSubtitle}
                      </span>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                        ✋ Parmak Duruşu Tarifi:
                      </span>
                      <p className="text-xs text-gray-200 leading-relaxed">{mm.handPosture}</p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                        🔊 Seslendirme & İmgeleme:
                      </span>
                      <p className="text-xs text-[#FDE68A] font-semibold">
                        {mm.mantraPronunciation}
                      </p>
                      <p className="text-xs text-gray-300 leading-relaxed">{mm.meditationFocus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KATMAN 5 & KATMAN 6 YAN YANA: OTURUŞ YÖNÜ / TATTVA + DOĞAL TAŞ / TÜTSÜ / RENK */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KATMAN 5: DIG-SHUDDHI OTURUŞ YÖNÜ & TATTVA GEOMETRİSİ */}
              <div className="bg-[#0B0F19]/90 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-3.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                      5. KATMAN • DİG-SHUDDHİ PUSULA YÖNÜ & TATTVA GEOMETRİSİ
                    </span>
                    <h2 className="text-lg font-extrabold text-white mt-0.5">
                      Yönünüz: {dailyGuide.directionTattvaGuide.compassDirectionTr}
                    </h2>
                  </div>

                  <div className="flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl p-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0"
                      style={{
                        borderColor: `${dailyGuide.directionTattvaGuide.tattvaColorHex}60`,
                        backgroundColor: `${dailyGuide.directionTattvaGuide.tattvaColorHex}18`,
                        color: dailyGuide.directionTattvaGuide.tattvaColorHex,
                      }}
                    >
                      <span className="text-2xl font-black leading-none">
                        {dailyGuide.directionTattvaGuide.tattvaSymbol}
                      </span>
                      <span className="text-[10px] font-extrabold mt-1">
                        {dailyGuide.directionTattvaGuide.compassCode} (
                        {dailyGuide.directionTattvaGuide.compassAngleDeg}°)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-300 block">
                        {dailyGuide.directionTattvaGuide.sanskritDirectionName}
                      </span>
                      <h3 className="text-sm font-extrabold text-white">
                        {dailyGuide.directionTattvaGuide.tattvaName} —{' '}
                        {dailyGuide.directionTattvaGuide.tattvaGeometryName}
                      </h3>
                      <span className="text-xs text-gray-400 block">
                        Element Kanalı: {dailyGuide.directionTattvaGuide.tattvaElementTr}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <strong className="text-emerald-300">İmgeleme Rehberi: </strong>
                    {dailyGuide.directionTattvaGuide.visualizationGuide}
                  </p>
                </div>
              </div>

              {/* KATMAN 6: DOĞAL TAŞ / KRİSTAL, TÜTSÜ & RENK REZONANSI */}
              <div className="bg-[#0B0F19]/90 border border-rose-500/30 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-3.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 block">
                      6. KATMAN • RATNA & GANDHA (DOĞAL TAŞ, TÜTSÜ & RENK REZONANSI)
                    </span>
                    <h2 className="text-lg font-extrabold text-white mt-0.5">
                      Günün Kristal, Aromaterapi & Bitki İksiri Reçetesi
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                        <Gem size={12} /> Önerilen Doğal Taşlar
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dailyGuide.crystalAromaGuide.primaryCrystals.map((cr, i) => (
                          <span
                            key={`cr-${i}`}
                            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200"
                          >
                            💎 {cr}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Sparkles size={12} /> Tütsü & Uçucu Yağlar
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dailyGuide.crystalAromaGuide.incenseAndOils.map((inc, i) => (
                          <span
                            key={`inc-${i}`}
                            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200"
                          >
                            🌿 {inc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/45 border border-white/10 rounded-2xl p-3.5 space-y-2 text-xs">
                    <div>
                      <strong className="text-emerald-300">Önerilen Topraklanma Süresi: </strong>
                      <span className="text-white font-semibold">
                        {dailyGuide.crystalAromaGuide.groundingDurationLabel}
                      </span>
                    </div>
                    <div>
                      <strong className="text-amber-300">Günün Frekans Rengi: </strong>
                      <span className="text-white font-semibold">
                        {dailyGuide.crystalAromaGuide.colorToneName}
                      </span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        {dailyGuide.crystalAromaGuide.colorReason}
                      </p>
                    </div>
                    <div>
                      <strong className="text-rose-300">Kristal Kullanımı: </strong>
                      <span className="text-gray-300">
                        {dailyGuide.crystalAromaGuide.crystalPlacement}
                      </span>
                    </div>
                    <div>
                      <strong className="text-cyan-300">Önerilen Bitki Çayı & İksir: </strong>
                      <span className="text-gray-300">
                        {dailyGuide.crystalAromaGuide.herbalTeaOrElixir}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
