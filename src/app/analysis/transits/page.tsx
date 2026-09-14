"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Compass, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Star, 
  X, 
  Globe, 
  Calendar, 
  Clock, 
  RefreshCw,
  Orbit,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { getTransitHouseInterpretation, getTransitAspectInterpretation } from '@/features/astrology/engine/TransitInterpretations';
import { getSkyPlanetSignInterpretation, getPlanetSignBriefHeadline, getIngressPhase } from '@/features/astrology/engine/SkyAspectInterpretations';
import { generateUnifiedPlanetTransit, UnifiedPlanetTransit, UnifiedAspectInfo, parseInterpretationSections } from '@/features/astrology/engine/TransitSynthesisEngine';
import { AstroCity, TransitChartData, AstroPoint, AstroAspect } from '@/features/astrology/engine/AstrologyConstants';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { useAuth } from '@/context/AuthContext';
import TransitTimelineChart from '@/features/astrology/components/TransitTimelineChart';
import MundaneSkyWheel from '@/features/astrology/components/MundaneSkyWheel';

const ZODIAC_ORDER = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];
const ZODIAC_COLORS: Record<string, string> = {
  'Koç': '#FF453A', 'Boğa': '#32D74B', 'İkizler': '#FFD60A', 'Yengeç': '#E5E5EA',
  'Aslan': '#FF9F0A', 'Başak': '#32D74B', 'Terazi': '#FFD60A', 'Akrep': '#FF453A',
  'Yay': '#FF9F0A', 'Oğlak': '#8E8E93', 'Kova': '#0A84FF', 'Balık': '#0A84FF'
};
const ZODIAC_SYMBOLS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋', 'Aslan': '♌', 'Başak': '♍',
  'Terazi': '♎', 'Akrep': '♏', 'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓'
};

const PLANET_SYMBOLS: Record<string, string> = {
  'Güneş': '☉', 'Ay': '☽', 'Merkür': '☿', 'Venüs': '♀', 'Mars': '♂', 
  'Jüpiter': '♃', 'Satürn': '♄', 'Uranüs': '♅', 'Neptün': '♆', 'Plüton': '♇',
  'Yükselen (ASC)': 'ASC', 'Tepe Noktası (MC)': 'MC', 'Kuzey Ay Düğümü': '☊',
  'Kiron': '⚷',
  'Vertex (Vx)': 'Vx', 'Şans Noktası (POF)': '⊗', 'Lilith': '⚸'
};

const ASPECT_COLORS: Record<string, string> = {
  'Kavuşum': '#D4AF37', 'Sekstil': '#0A84FF', 'Kare': '#FF453A', 'Üçgen': '#32D74B', 'Karşıt': '#FF453A', 'Görmeyen': '#0A84FF'
};

const CHART_SIZE = 640;
const CENTER = CHART_SIZE / 2;
const RADIUS = CENTER - 85;

export default function TransitsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const isApprenticeOrAbove = role === 'apprentice' || role === 'journeyman' || role === 'master' || role === 'admin';

  // Mode Switch: MUNDANE (Kişiselden Bağımsız Gökyüzü) vs PERSONAL (Natal Bi-Wheel)
  const [analysisMode, setAnalysisMode] = useState<'MUNDANE' | 'PERSONAL'>('MUNDANE');

  // Shared Modals & Feedback
  const [selectedInterp, setSelectedInterp] = useState<{title: string, content: string, extra?: string} | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common Date defaults
  const today = new Date();
  const defaultTDate = today.toISOString().split('T')[0];
  const defaultTTime = today.toTimeString().slice(0, 5);

  // User Local Timezone Detection (Auto-detected from browser / device)
  const [userTz, setUserTz] = useState<string>('Europe/Istanbul');
  const [tzOffsetHours, setTzOffsetHours] = useState<number>(3);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
      const offset = -new Date().getTimezoneOffset() / 60;
      setUserTz(tz);
      setTzOffsetHours(offset);
    } catch {
      // fallback to Europe/Istanbul (UTC+3)
    }
  }, []);

  // -------------------------------------------------------------
  // 1. MUNDANE (Kolektif Gökyüzü) States
  // -------------------------------------------------------------
  const [skyDateStr, setSkyDateStr] = useState(defaultTDate);
  const [skyTimeStr, setSkyTimeStr] = useState(defaultTTime);
  const [skyTab, setSkyTab] = useState<'WHEEL' | 'TIMELINE'>('WHEEL');
  const [isSkyLoading, setIsSkyLoading] = useState(false);
  const [skyChartData, setSkyChartData] = useState<{
    date: string;
    time: string;
    city: string;
    planets: AstroPoint[];
    ascendant: AstroPoint;
    midheaven: AstroPoint;
    houses: AstroPoint[];
    aspects: any[];
  } | null>(null);
  const [skyAspectFilter, setSkyAspectFilter] = useState<'ALL' | 'HARMONIOUS' | 'CHALLENGING' | 'CONJUNCTION'>('ALL');
  const [skyRightTab, setSkyRightTab] = useState<'ASPECTS' | 'SIGN_PLACEMENTS'>('ASPECTS');
  const [signFilter, setSignFilter] = useState<'ALL' | 'NEW_INGRESS' | 'PERSONAL' | 'OUTER'>('ALL');

  // Mundane Timeline states
  const [skyTimelineData, setSkyTimelineData] = useState<any>(null);
  const [skyTimelineRange, setSkyTimelineRange] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
  const [isSkyTimelineLoading, setIsSkyTimelineLoading] = useState(false);

  // Fetch Mundane Sky Chart
  const fetchSkyChart = async (dateStr = skyDateStr, timeStr = skyTimeStr) => {
    setIsSkyLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/astrology/sky-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateStr, timeStr })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gökyüzü haritası hesaplanamadı.');
      }
      setSkyChartData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSkyLoading(false);
    }
  };

  // Fetch Mundane Timeline
  const fetchSkyTimeline = async (rangeToFetch: '1m' | '3m' | '6m' | '1y' = skyTimelineRange, startDate = skyDateStr) => {
    setIsSkyTimelineLoading(true);
    try {
      const res = await fetch('/api/astrology/sky-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDateStr: startDate,
          range: rangeToFetch,
          userTz,
          tzOffsetHours
        })
      });
      const data = await res.json();
      if (data.success) {
        setSkyTimelineData(data.data);
      }
    } catch (err) {
      console.error('Sky timeline fetch error:', err);
    } finally {
      setIsSkyTimelineLoading(false);
    }
  };

  // Auto-fetch Mundane chart on initial load
  useEffect(() => {
    if (!skyChartData) {
      fetchSkyChart(skyDateStr, skyTimeStr);
    }
  }, []);

  // -------------------------------------------------------------
  // 2. PERSONAL (Natal Bi-Wheel) States
  // -------------------------------------------------------------
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transitData, setTransitData] = useState<TransitChartData | null>(null);
  const [natalDateStr, setNatalDateStr] = useState('1990-01-01');
  const [natalTimeStr, setNatalTimeStr] = useState('12:00');
  const [cityKey, setCityKey] = useState<AstroCity | null>(null);
  const [transitDateStr, setTransitDateStr] = useState(defaultTDate);
  const [transitTimeStr, setTransitTimeStr] = useState(defaultTTime);

  const [personalTab, setPersonalTab] = useState<'BIWHEEL' | 'TIMELINE'>('BIWHEEL');
  const [personalViewMode, setPersonalViewMode] = useState<'SYNTHESIS' | 'TABLES'>('SYNTHESIS');
  const [timelineData, setTimelineData] = useState<any>(null);
  const [timelineRange, setTimelineRange] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);

  const unifiedTransits = useMemo(() => {
    if (!transitData) return [];
    return transitData.transitPlanets.map(p =>
      generateUnifiedPlanetTransit(
        p,
        transitData.transitAspects,
        transitData.natalChart.planets,
        transitData.natalChart.houses
      )
    );
  }, [transitData]);

  const fetchPersonalTimeline = async (rangeToFetch: '1m' | '3m' | '6m' | '1y' = timelineRange) => {
    if (!cityKey) return;
    setIsTimelineLoading(true);
    try {
      const res = await fetch('/api/astrology/transit-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          natalDate: natalDateStr,
          natalTime: natalTimeStr,
          cityData: cityKey,
          range: rangeToFetch,
          startDateStr: transitDateStr,
          userTz,
          tzOffsetHours
        })
      });
      const data = await res.json();
      if (data.success) {
        setTimelineData(data.data);
      }
    } catch (err) {
      console.error('Timeline fetch error:', err);
    } finally {
      setIsTimelineLoading(false);
    }
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityKey) {
      setError('Lütfen bir şehir seçin.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setTransitData(null);
    setTimelineData(null);

    try {
      const res = await fetch('/api/astrology/calculate-transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          natalDate: natalDateStr,
          natalTime: natalTimeStr,
          transitDate: transitDateStr,
          transitTime: transitTimeStr,
          cityData: cityKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Harita hesaplanırken bir hata oluştu.');
      }

      setTransitData(data.data);
      fetchPersonalTimeline('1m');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filtered Mundane Aspects
  const filteredSkyAspects = (skyChartData?.aspects || []).filter(asp => {
    if (skyAspectFilter === 'ALL') return true;
    if (skyAspectFilter === 'HARMONIOUS') return asp.type === 'Üçgen' || asp.type === 'Sekstil';
    if (skyAspectFilter === 'CHALLENGING') return asp.type === 'Kare' || asp.type === 'Karşıt';
    if (skyAspectFilter === 'CONJUNCTION') return asp.type === 'Kavuşum';
    return true;
  });

  const renderBiWheel = () => {
    if (!transitData) return null;
    const chartData = transitData.natalChart;
    const ascDegree = chartData.ascendant.longitude;
    
    const getX = (lon: number, r: number) => CENTER + r * Math.cos((180 + ascDegree - lon) * Math.PI / 180);
    const getY = (lon: number, r: number) => CENTER + r * Math.sin((180 + ascDegree - lon) * Math.PI / 180);

    const R_ZODIAC_OUTER = RADIUS;
    const R_ZODIAC_INNER = RADIUS - 30;
    const R_NATAL_PLANETS = RADIUS - 50;
    const R_TRANSIT_PLANETS = RADIUS + 25;
    const R_CUSP_NUM = RADIUS - 75;

    return (
      <div className="w-full overflow-x-auto flex justify-center py-6 sm:py-10 bg-[#0B0F17]/90 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <svg 
          width={CHART_SIZE} 
          height={CHART_SIZE} 
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} 
          className="w-full max-w-[580px] h-auto select-none touch-manipulation"
          style={{ contain: 'paint' }}
        >
          <circle cx={CENTER} cy={CENTER} r={R_ZODIAC_INNER} stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" fill="none" />
          <circle cx={CENTER} cy={CENTER} r={R_ZODIAC_OUTER} stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" fill="none" />
          <circle cx={CENTER} cy={CENTER} r={R_TRANSIT_PLANETS + 15} stroke="rgba(50,215,75,0.3)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          {Array.from({ length: 12 }).map((_, i) => {
            const signLon = i * 30; 
            const midLon = signLon + 15;
            const signName = ZODIAC_ORDER[i];
            return (
              <g key={`zodiac-${i}`}>
                <line x1={getX(signLon, R_ZODIAC_OUTER)} y1={getY(signLon, R_ZODIAC_OUTER)} x2={getX(signLon, R_ZODIAC_INNER)} y2={getY(signLon, R_ZODIAC_INNER)} stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
                <text x={getX(midLon, RADIUS - 15)} y={getY(midLon, RADIUS - 15) + 6} fontSize="18" fill={ZODIAC_COLORS[signName]} textAnchor="middle" fontWeight="bold">
                  {ZODIAC_SYMBOLS[signName]}
                </text>
              </g>
            );
          })}
          {chartData.houses.map((h, i) => {
            const isAngle = h.house === 1 || h.house === 4 || h.house === 7 || h.house === 10;
            return (
              <g key={`house-${i}`}>
                <line 
                  x1={getX(h.longitude, 20)} y1={getY(h.longitude, 20)} 
                  x2={getX(h.longitude, R_ZODIAC_INNER)} y2={getY(h.longitude, R_ZODIAC_INNER)} 
                  stroke={isAngle ? "#D4AF37" : "rgba(212,175,55,0.3)"} 
                  strokeWidth={isAngle ? "2" : "1"} 
                  strokeDasharray={isAngle ? "" : "4, 4"} 
                />
                <text x={getX(h.longitude, R_CUSP_NUM + (isAngle ? 5 : 0))} y={getY(h.longitude, R_CUSP_NUM + (isAngle ? 5 : 0)) + 4} fontSize={isAngle ? "14" : "12"} fill={isAngle ? "#D4AF37" : "#9CA3AF"} textAnchor="middle" fontWeight={isAngle ? "bold" : "normal"}>
                  {`${String(h.degreeInSign).padStart(2, '0')}° ${h.house}. ${String(h.minutes).padStart(2, '0')}'`}
                </text>
              </g>
            );
          })}
          {chartData.planets.map((p, i) => {
            let rOffset = 0;
            for(let j=0; j<i; j++) {
               if (Math.abs(p.longitude - chartData.planets[j].longitude) < 5) rOffset += 18;
            }
            const px = getX(p.longitude, R_NATAL_PLANETS - rOffset);
            const py = getY(p.longitude, R_NATAL_PLANETS - rOffset);
            return (
              <g key={`n-planet-${i}`} className="cursor-pointer">
                <line x1={getX(p.longitude, R_ZODIAC_INNER)} y1={getY(p.longitude, R_ZODIAC_INNER)} x2={px} y2={py} stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" strokeDasharray="1, 2" />
                <circle cx={px} cy={py} r="12" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />
                <text x={px} y={py + 5} fontSize="14" fill="#D4AF37" textAnchor="middle" fontWeight="bold">
                  {PLANET_SYMBOLS[p.name]}
                </text>
                <text x={px + 16} y={py - 5} fontSize="10" fill="#9CA3AF" textAnchor="start">
                  {`${p.degreeInSign}°${String(p.minutes).padStart(2,'0')}'`}
                </text>
              </g>
            );
          })}
          {transitData.transitPlanets.map((p, i) => {
            let rOffset = 0;
            for(let j=0; j<i; j++) {
               if (Math.abs(p.longitude - transitData.transitPlanets[j].longitude) < 5) rOffset += 18;
            }
            const px = getX(p.longitude, R_TRANSIT_PLANETS + rOffset);
            const py = getY(p.longitude, R_TRANSIT_PLANETS + rOffset);
            return (
              <g key={`t-planet-${i}`} className="cursor-pointer">
                <line x1={getX(p.longitude, R_ZODIAC_OUTER)} y1={getY(p.longitude, R_ZODIAC_OUTER)} x2={px} y2={py} stroke="rgba(50,215,75,0.3)" strokeWidth="0.5" strokeDasharray="1, 2" />
                <circle cx={px} cy={py} r="12" fill="#0F172A" stroke="#0EA5E9" strokeWidth="1" />
                <text x={px} y={py + 5} fontSize="14" fill="#0EA5E9" textAnchor="middle" fontWeight="bold">
                  {PLANET_SYMBOLS[p.name]}
                </text>
                <text x={px + 16} y={py - 5} fontSize="10" fill="#0EA5E9" textAnchor="start">
                  {`${p.degreeInSign}°${String(p.minutes).padStart(2,'0')}'`}
                </text>
                {p.isRetrograde && (
                  <text x={px + 16} y={py + 6} fontSize="10" fill="#FF453A" textAnchor="start" fontWeight="bold">Rx</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="mb-6 flex items-center text-mystic-text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Geri Dön
        </button>

        {/* Main Title Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] shadow-[0_0_25px_rgba(14,165,233,0.2)]">
              <Compass size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                Kozmik Gökyüzü & Transitler
              </h1>
              <p className="text-sm text-mystic-text-muted">
                Kişisel doğum haritanızdan bağımsız anlık gökyüzü açıları veya doğum haritası transit geçişleri
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Segmented Switch */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setAnalysisMode('MUNDANE')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                analysisMode === 'MUNDANE'
                  ? 'bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-black shadow-lg shadow-cyan-500/25'
                  : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              <Globe size={16} />
              <span>Kolektif Gökyüzü Açıları (Bağımsız)</span>
            </button>
            <button
              type="button"
              onClick={() => setAnalysisMode('PERSONAL')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                analysisMode === 'PERSONAL'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-black shadow-lg shadow-amber-500/25'
                  : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              <Sparkles size={16} />
              <span>Kişisel Transitler (Bi-Wheel Haritam)</span>
            </button>
          </div>
        </div>

        {/* Frekans Aynası Mini Banner */}
        <div className="max-w-4xl mx-auto mb-8 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0EA5E9]/15 via-[#6A0DAD]/15 to-[#D4AF37]/15 border border-[#0EA5E9]/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 rounded-xl bg-[#0EA5E9]/20 text-[#0EA5E9] shrink-0 hidden sm:block">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0EA5E9]/20 text-[#0EA5E9]">Frekans Aynası</span>
                <span className="text-xs text-white/70">Bugün Hangi Haritanızı Çalıştırıyorsunuz?</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                Canlı gökyüzü transitlerinin haritanızı hangi temada sınadığını ve 4 alemdeki tutumunuzu teşhis edin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/analysis/frekans-aynasi')}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] hover:from-[#38BDF8] hover:to-[#0EA5E9] text-black font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
          >
            <span>Frekansınızı Teşhis Edin</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 1: MUNDANE (Kolektif Gökyüzü Açıları - Kişisel Haritadan Bağımsız)   */}
        {/* ========================================================================= */}
        {analysisMode === 'MUNDANE' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Toolbar: Date & Tab Control */}
            <div className="bg-[#0A0D14]/90 sm:backdrop-blur-md border border-white/10 p-4 sm:p-6 rounded-3xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl">
              
              {/* Left: View Tabs */}
              <div className="flex items-center bg-black/60 p-1 rounded-2xl border border-white/10 shadow-lg">
                <button
                  type="button"
                  onClick={() => setSkyTab('WHEEL')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    skyTab === 'WHEEL'
                      ? 'bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-black shadow-lg'
                      : 'text-mystic-text-muted hover:text-white'
                  }`}
                >
                  <Orbit size={15} />
                  <span>Gökyüzü Çarkı & Açıları</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSkyTab('TIMELINE');
                    if (!skyTimelineData && !isSkyTimelineLoading) {
                      fetchSkyTimeline(skyTimelineRange, skyDateStr);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    skyTab === 'TIMELINE'
                      ? 'bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-black shadow-lg'
                      : 'text-mystic-text-muted hover:text-white'
                  }`}
                >
                  <Calendar size={15} />
                  <span>Kozmik Zaman Çizelgesi</span>
                </button>
              </div>

              {/* Right: Date Picker & Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                  <Clock size={14} className="text-[#0EA5E9]" />
                  <input 
                    type="date" 
                    value={skyDateStr}
                    onChange={(e) => setSkyDateStr(e.target.value)}
                    className="bg-transparent text-white text-xs sm:text-sm focus:outline-none"
                  />
                  <input 
                    type="time" 
                    value={skyTimeStr}
                    onChange={(e) => setSkyTimeStr(e.target.value)}
                    className="bg-transparent text-white text-xs sm:text-sm focus:outline-none border-l border-white/10 pl-2"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nD = new Date().toISOString().split('T')[0];
                    const nT = new Date().toTimeString().slice(0, 5);
                    setSkyDateStr(nD);
                    setSkyTimeStr(nT);
                    fetchSkyChart(nD, nT);
                    if (skyTab === 'TIMELINE') {
                      fetchSkyTimeline(skyTimelineRange, nD);
                    }
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                >
                  Şimdi
                </button>

                <button
                  type="button"
                  disabled={isSkyLoading}
                  onClick={() => {
                    fetchSkyChart(skyDateStr, skyTimeStr);
                    if (skyTab === 'TIMELINE') {
                      fetchSkyTimeline(skyTimelineRange, skyDateStr);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0EA5E9] hover:bg-[#38BDF8] text-black font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
                >
                  {isSkyLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  <span>Gökyüzünü Tara</span>
                </button>
              </div>
            </div>

            {/* Tab A: Gökyüzü Çarkı & Anlık Açı Listesi */}
            {skyTab === 'WHEEL' && (
              isSkyLoading && !skyChartData ? (
                <div className="py-24 text-center bg-black/40 rounded-3xl border border-white/5">
                  <Loader2 className="mx-auto text-[#0EA5E9] animate-spin mb-4" size={40} />
                  <h4 className="text-white font-bold text-lg mb-1">Gökyüzü Açıları Hesaplanıyor...</h4>
                  <p className="text-mystic-text-muted text-sm">Gezegenlerin ekliptik boylamları ve aralarındaki açı bağlantıları taranıyor.</p>
                </div>
              ) : skyChartData ? (
                <div className="space-y-8">
                  {/* Wheel & Aspects Split */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Mundane Sky Wheel (7 cols) */}
                    <div className="lg:col-span-7 bg-[#0A0D14]/90 sm:backdrop-blur-md border border-[#0EA5E9]/30 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col items-center">
                      <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Orbit className="text-[#0EA5E9]" size={20} />
                            Anlık Gökyüzü Çarkı (Mundane Wheel)
                          </h3>
                          <p className="text-xs text-mystic-text-muted">
                            {skyDateStr.split('-').reverse().join('.')} {skyTimeStr} • Gezegenlerin zodyaktaki anlık yerleşimleri
                          </p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20">
                          {skyChartData.aspects.length} Açı Aktif
                        </span>
                      </div>

                      <MundaneSkyWheel 
                        planets={skyChartData.planets}
                        aspects={skyChartData.aspects}
                        ascendant={skyChartData.ascendant}
                        onSelectAspect={(asp: any) => {
                          if (asp.interpretation) {
                            setSelectedInterp({
                              title: asp.interpretation.title,
                              content: `${asp.interpretation.summary}\n\n【Kolektif Etki】\n${asp.interpretation.collectiveTheme}\n\n【Günün Tavsiyesi】\n${asp.interpretation.dailyAdvice}`,
                              extra: asp.interpretation.chakraResonance
                            });
                          }
                        }}
                        onSelectPlanet={(planet) => {
                          const interp = getSkyPlanetSignInterpretation(
                            planet.name,
                            planet.sign,
                            planet.degreeInSign,
                            planet.minutes,
                            planet.isRetrograde
                          );
                          setSelectedInterp(interp);
                        }}
                      />
                    </div>

                    {/* Right: Active Sky Aspects or Planetary Sign Transits (5 cols) */}
                    <div className="lg:col-span-5 bg-[#0A0D14]/90 sm:backdrop-blur-md border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-3">
                        <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setSkyRightTab('ASPECTS')}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              skyRightTab === 'ASPECTS'
                                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-black shadow-md'
                                : 'text-mystic-text-muted hover:text-white'
                            }`}
                          >
                            <Sparkles size={14} />
                            <span>Aktif Açılar ({skyChartData.aspects.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSkyRightTab('SIGN_PLACEMENTS')}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              skyRightTab === 'SIGN_PLACEMENTS'
                                ? 'bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-black shadow-md'
                                : 'text-mystic-text-muted hover:text-white'
                            }`}
                          >
                            <Layers size={14} />
                            <span>Burç Geçişleri & Etkileri</span>
                          </button>
                        </div>
                      </div>

                      {skyRightTab === 'ASPECTS' ? (
                        <>
                          {/* Aspect Type Filters */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {[
                              { id: 'ALL', label: 'Tümü' },
                              { id: 'CONJUNCTION', label: 'Kavuşum (0°)' },
                              { id: 'HARMONIOUS', label: 'Destek (△, ⚹)' },
                              { id: 'CHALLENGING', label: 'Sınav (□, ☍)' },
                            ].map(f => (
                              <button
                                key={f.id}
                                onClick={() => setSkyAspectFilter(f.id as any)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                                  skyAspectFilter === f.id
                                    ? 'bg-white/20 text-white font-bold'
                                    : 'bg-white/5 text-mystic-text-muted hover:text-white'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>

                          {/* Aspects Scrollable List */}
                          <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                            {filteredSkyAspects.length === 0 ? (
                              <div className="text-center py-12 text-mystic-text-muted text-xs">
                                Seçilen filtrede aktif bir gökyüzü açısı bulunmuyor.
                              </div>
                            ) : (
                              filteredSkyAspects.map((asp, idx) => {
                                const interp = asp.interpretation;
                                return (
                                  <div
                                    key={`sky-asp-${idx}`}
                                    onClick={() => {
                                      if (interp) {
                                        setSelectedInterp({
                                          title: interp.title,
                                          content: `${interp.summary}\n\n【Kolektif Etki】\n${interp.collectiveTheme}\n\n【Günün Tavsiyesi】\n${interp.dailyAdvice}`,
                                          extra: interp.chakraResonance
                                        });
                                      }
                                    }}
                                    className="group p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-[#0EA5E9]/40 transition-all cursor-pointer flex flex-col gap-2 shadow-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg text-[#0EA5E9] font-bold">{PLANET_SYMBOLS[asp.planet1] || ''}</span>
                                        <span className="text-xs sm:text-sm font-semibold text-white">{asp.planet1}</span>
                                      </div>

                                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10">
                                        <span className="text-xs font-bold" style={{ color: ASPECT_COLORS[asp.type] }}>
                                          {asp.type}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                          ({asp.orb.toFixed(1)}°)
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className="text-xs sm:text-sm font-semibold text-white">{asp.planet2}</span>
                                        <span className="text-lg text-[#D4AF37] font-bold">{PLANET_SYMBOLS[asp.planet2] || ''}</span>
                                      </div>
                                    </div>

                                    {interp && (
                                      <p className="text-[11px] text-mystic-text-muted line-clamp-2 leading-relaxed">
                                        {interp.summary}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-gray-400">
                                      <span className="text-[#0EA5E9]/80 font-medium">
                                        {interp?.energyType || 'Açı'}
                                      </span>
                                      <span className="flex items-center gap-1 text-white/60 group-hover:text-white transition-colors">
                                        Yorumu Oku <ChevronRight size={12} />
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </>
                      ) : (
                        /* Sign Placements & Ingress Impacts List */
                        <div className="flex flex-col gap-3">
                          {/* Sign Placements Filter Tabs */}
                          <div className="flex flex-wrap gap-1.5 pb-1">
                            {[
                              { id: 'ALL', label: 'Tümü (13)' },
                              { id: 'NEW_INGRESS', label: '⚡ Yeni Girişler (İngress)' },
                              { id: 'PERSONAL', label: 'Kişisel (5)' },
                              { id: 'OUTER', label: 'Kolektif & Kadersel (8)' }
                            ].map(f => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setSignFilter(f.id as any)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                                  signFilter === f.id
                                    ? 'bg-[#0EA5E9] text-black font-bold shadow-md'
                                    : 'bg-white/5 text-mystic-text-muted hover:text-white'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-3 max-h-[530px] overflow-y-auto custom-scrollbar pr-1">
                            {(() => {
                              const standardOrder = ['Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars', 'Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton', 'Kiron', 'Lilith', 'Kuzey Ay Düğümü'];
                              const personalPlanets = ['Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars'];
                              const outerPlanets = ['Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton', 'Kiron', 'Lilith', 'Kuzey Ay Düğümü'];

                              let displayPlanets = [...skyChartData.planets]
                                .filter(p => standardOrder.includes(p.name))
                                .sort((a, b) => standardOrder.indexOf(a.name) - standardOrder.indexOf(b.name));

                              if (signFilter === 'NEW_INGRESS') {
                                displayPlanets = displayPlanets.filter(p => p.degreeInSign === 0 || p.degreeInSign === 1);
                              } else if (signFilter === 'PERSONAL') {
                                displayPlanets = displayPlanets.filter(p => personalPlanets.includes(p.name));
                              } else if (signFilter === 'OUTER') {
                                displayPlanets = displayPlanets.filter(p => outerPlanets.includes(p.name));
                              }

                              if (displayPlanets.length === 0) {
                                return (
                                  <div className="text-center py-12 text-mystic-text-muted text-xs bg-white/5 rounded-2xl border border-white/5 p-6">
                                    <p className="font-semibold text-white mb-1">Şu anda 0°-1° derecede taze burç girişi yapan gezegen bulunmuyor.</p>
                                    <p>Tüm gezegenlerin güncel burç seyirlerini görmek için yukarıdan "Tümü" filtresini seçebilirsiniz.</p>
                                  </div>
                                );
                              }

                              return displayPlanets.map((p, idx) => {
                                const interp = getSkyPlanetSignInterpretation(
                                  p.name,
                                  p.sign,
                                  p.degreeInSign,
                                  p.minutes,
                                  p.isRetrograde
                                );
                                const phase = interp.phase;

                                return (
                                  <div
                                    key={`pl-sign-${idx}`}
                                    onClick={() => setSelectedInterp(interp)}
                                    className="group p-3.5 rounded-2xl border bg-white/5 hover:bg-white/10 border-white/5 hover:border-[#0EA5E9]/40 transition-all cursor-pointer flex flex-col gap-2 shadow-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <span className="text-xl text-[#0EA5E9] font-bold group-hover:scale-110 transition-transform">
                                          {PLANET_SYMBOLS[p.name] || ''}
                                        </span>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#0EA5E9] transition-colors">
                                              {p.name}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${phase.badgeClass}`}>
                                              {phase.badge}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <div className="text-right">
                                          <span className="text-xs font-bold block" style={{ color: ZODIAC_COLORS[p.sign] }}>
                                            {ZODIAC_SYMBOLS[p.sign] || ''} {p.sign}
                                          </span>
                                          <span className="text-[10px] text-gray-400 font-mono">
                                            {p.degreeInSign}°{String(p.minutes).padStart(2, '0')}'
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-1">
                                      <h4 className="text-xs font-semibold text-[#D4AF37] line-clamp-1">
                                        {interp.headline}
                                      </h4>
                                      <p className="text-[11px] text-mystic-text-muted line-clamp-2 mt-0.5 leading-relaxed">
                                        {interp.summary}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-gray-400">
                                      <span className="text-[#0EA5E9]/80 font-medium truncate max-w-[200px]">
                                        {interp.extra?.split('•')[0] || p.sign}
                                      </span>
                                      <span className="flex items-center gap-1 text-white/70 group-hover:text-white transition-colors">
                                        Detaylı Analizi Oku <ChevronRight size={12} />
                                      </span>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Anlık Gezegen Burç Yerleşimleri Tablosu */}
                  <div className="bg-[#0A0D14]/90 sm:backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Layers className="text-[#38BDF8]" size={18} />
                          Anlık Gökyüzü Gezegen Yerleşimleri (13 Gök Cismi)
                        </h3>
                        <p className="text-xs text-mystic-text-muted">
                          Gezegenlerin burç dereceleri, geçiş evreleri (İngress / Retro / Aktif) ve kolektif temaları
                        </p>
                      </div>
                      <span className="text-[11px] text-[#0EA5E9] bg-[#0EA5E9]/10 px-3 py-1 rounded-full border border-[#0EA5E9]/20 w-fit">
                        💡 Detaylı burç geçiş analizi için karta tıklayın
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                      {skyChartData.planets
                        .filter(p => ['Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars', 'Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton', 'Kiron', 'Lilith', 'Kuzey Ay Düğümü'].includes(p.name))
                        .map((p, idx) => {
                          const interp = getSkyPlanetSignInterpretation(
                            p.name,
                            p.sign,
                            p.degreeInSign,
                            p.minutes,
                            p.isRetrograde
                          );
                          const phase = interp.phase;

                          return (
                            <div 
                              key={`sky-pl-${idx}`}
                              onClick={() => setSelectedInterp(interp)}
                              className="bg-white/5 border border-white/5 hover:border-[#0EA5E9]/50 hover:bg-white/10 hover:scale-[1.02] rounded-2xl p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-sm relative overflow-hidden"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg text-[#0EA5E9] font-bold group-hover:scale-110 transition-transform">
                                    {PLANET_SYMBOLS[p.name] || ''}
                                  </span>
                                  <span className="text-xs font-bold text-white truncate group-hover:text-[#0EA5E9] transition-colors">
                                    {p.name}
                                  </span>
                                </div>
                                <div className="flex items-baseline justify-between mt-2">
                                  <span className="text-xs font-bold" style={{ color: ZODIAC_COLORS[p.sign] }}>
                                    {p.sign}
                                  </span>
                                  <span className="text-[11px] text-gray-300 font-mono">
                                    {p.degreeInSign}°{String(p.minutes).padStart(2, '0')}'
                                  </span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${phase.badgeClass}`}>
                                    {phase.badge}
                                  </span>
                                </div>
                                <p className="text-[10px] text-mystic-text-muted mt-2 line-clamp-1 group-hover:text-gray-200 transition-colors">
                                  {interp.headline}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-white/5 text-[10px] text-gray-400 group-hover:text-[#38BDF8] transition-colors">
                                <span>Analizi Oku</span>
                                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : null
            )}

            {/* Tab B: Kozmik Zaman Çizelgesi (Mundane Gantt) */}
            {skyTab === 'TIMELINE' && (
              isSkyTimelineLoading && !skyTimelineData ? (
                <div className="py-24 text-center bg-black/40 rounded-3xl border border-white/5">
                  <Loader2 className="mx-auto text-[#0EA5E9] animate-spin mb-4" size={40} />
                  <h4 className="text-white font-bold text-lg mb-1">Gökyüzü Zaman Çizelgesi Hesaplanıyor...</h4>
                  <p className="text-mystic-text-muted text-sm">
                    Gezegenlerin gökyüzünde birbiriyle yapacağı açı başlangıç, 0° zirve ve bitiş döngüleri taranıyor.
                  </p>
                </div>
              ) : (
                <TransitTimelineChart
                  items={skyTimelineData?.items || []}
                  startDateStr={skyTimelineData?.startDate || skyDateStr}
                  endDateStr={skyTimelineData?.endDate || skyDateStr}
                  range={skyTimelineRange}
                  onRangeChange={(newRange) => {
                    setSkyTimelineRange(newRange);
                    fetchSkyTimeline(newRange, skyDateStr);
                  }}
                  isLoading={isSkyTimelineLoading}
                  isPremium={isApprenticeOrAbove}
                  onRequirePremium={() => setShowLockModal(true)}
                  isMundane={true}
                  userTimezone={skyTimelineData?.timeZone || userTz}
                  tzOffsetHours={skyTimelineData?.tzOffsetHours ?? tzOffsetHours}
                />
              )
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: PERSONAL (Doğum Haritası + Gökyüzü Bi-Wheel)                     */}
        {/* ========================================================================= */}
        {analysisMode === 'PERSONAL' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {!transitData ? (
              <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#0EA5E9]">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <h3 className="text-xl font-bold mb-2 animate-pulse">Transitler Hesaplanıyor...</h3>
                    <p className="text-sm text-white/60">Gezegen geçişleri ve natal açılarınız analiz ediliyor.</p>
                  </div>
                )}
                
                <form onSubmit={handlePersonalSubmit} className="space-y-8">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
                      <Star size={20}/> 1. Doğum Bilgileriniz (Natal)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi *</label>
                        <input required type="date" min="1900-01-01" max="2100-12-31" value={natalDateStr} onChange={e => setNatalDateStr(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Saati</label>
                        <input required type="time" value={natalTimeStr} onChange={e => setNatalTimeStr(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mystic-text-muted mb-2">Şehir *</label>
                        <LocationAutocomplete
                          onSelect={(c) => setCityKey(c)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0EA5E9]/5 p-6 rounded-2xl border border-[#0EA5E9]/20">
                    <h3 className="text-xl font-bold text-[#0EA5E9] mb-4 flex items-center gap-2">
                      <Compass size={20}/> 2. Transit (Geçiş) Tarihi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-mystic-text-muted mb-2">Transit Tarihi *</label>
                        <input required type="date" min="1900-01-01" max="2100-12-31" value={transitDateStr} onChange={e => setTransitDateStr(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0EA5E9] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mystic-text-muted mb-2">Transit Saati</label>
                        <input required type="time" value={transitTimeStr} onChange={e => setTransitTimeStr(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0EA5E9] transition-colors" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={isAnalyzing} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#0EA5E9] hover:opacity-90 disabled:opacity-50 text-black font-bold text-lg py-4 rounded-xl transition-all shadow-lg cursor-pointer">
                    Transit Haritamı Hesapla
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* View Navigation Tabs & Map Info */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40 p-3 sm:p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                  <div className="grid grid-cols-2 sm:flex items-center bg-black/60 p-1 rounded-2xl border border-white/10 shadow-lg w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setPersonalTab('BIWHEEL')}
                      className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-center ${
                        personalTab === 'BIWHEEL'
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#0EA5E9] text-black shadow-lg shadow-cyan-500/20'
                          : 'text-mystic-text-muted hover:text-white'
                      }`}
                    >
                      <Compass size={15} className="shrink-0" />
                      <span className="truncate">Çift Çember</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPersonalTab('TIMELINE');
                        if (!timelineData && !isTimelineLoading) {
                          fetchPersonalTimeline(timelineRange);
                        }
                      }}
                      className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-center ${
                        personalTab === 'TIMELINE'
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#0EA5E9] text-black shadow-lg shadow-cyan-500/20'
                          : 'text-mystic-text-muted hover:text-white'
                      }`}
                    >
                      <Sparkles size={15} className="shrink-0" />
                      <span className="truncate">Zaman Çizelgesi</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-mystic-text-muted block">Harita Sahibi</span>
                      <span className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[180px] block">{cityKey?.name || 'Seçildi'} • {natalDateStr}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { setTransitData(null); setTimelineData(null); }} 
                      className="text-xs px-3.5 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Yeni Harita Seç
                    </button>
                  </div>
                </div>

                {/* Personal Tab 1: Bi-Wheel */}
                {personalTab === 'BIWHEEL' && (
                  <div className="space-y-10">
                    <div className="bg-black/50 backdrop-blur-md border border-[#0EA5E9]/30 p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-full overflow-hidden">
                      <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
                         <div>
                           <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3 mb-2">
                             <Compass className="text-[#0EA5E9] shrink-0" /> Çift Çemberli Transit Haritası
                           </h2>
                           <div className="flex flex-col gap-1 text-xs sm:text-sm">
                             <p className="text-[#D4AF37] flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0"></span>
                               Natal: {cityKey ? cityKey.name : ''} • {natalDateStr ? natalDateStr.split('-').reverse().join('.') : ''} {natalTimeStr}
                             </p>
                             <p className="text-[#0EA5E9] flex items-center gap-2">
                               <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9] inline-block shrink-0"></span>
                               Transit (Dış Çember): {transitDateStr ? transitDateStr.split('-').reverse().join('.') : ''} {transitTimeStr}
                             </p>
                           </div>
                         </div>
                      </div>

                      {renderBiWheel()}
                    </div>

                    {/* Önemli Bilgilendirme */}
                    <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-6 rounded-3xl flex items-start gap-4">
                      <AlertCircle className="text-[#D4AF37] shrink-0 mt-0.5" size={24} />
                      <div>
                        <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Önemli Bilgilendirme</h4>
                        <p className="text-xs text-mystic-text-muted leading-relaxed">
                          Sistemimiz tarafından sunulan yorumlar, astrolojik hesaplama algoritmaları ile üretilmektedir. 
                          Astrolojide hiçbir gösterge tek başına bir anlam ifade etmez. Haritanızdaki herhangi bir gezegen konumu, ev yerleşimi veya açı; 
                          her zaman doğum haritanızın tamamı, diğer gezegen yerleşimleri ve gökyüzünün bütünsel bağlamı ile ilişkilendirilerek değerlendirilmelidir.
                        </p>
                      </div>
                    </div>

                    {/* Personal View Switcher (Synthesis vs Separate Tables) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/50 p-3 rounded-2xl border border-white/10 mb-6">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPersonalViewMode('SYNTHESIS')}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            personalViewMode === 'SYNTHESIS'
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#0EA5E9] text-black shadow-lg shadow-cyan-500/20'
                              : 'text-mystic-text-muted hover:text-white'
                          }`}
                        >
                          <Sparkles size={15} />
                          <span>Bütünleşik Gezegen Kartları (Sentez)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPersonalViewMode('TABLES')}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            personalViewMode === 'TABLES'
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'text-mystic-text-muted hover:text-white'
                          }`}
                        >
                          <Layers size={15} />
                          <span>Ayrık Tablolar</span>
                        </button>
                      </div>
                      <span className="text-[11px] text-mystic-text-muted hidden md:inline">
                        {personalViewMode === 'SYNTHESIS' 
                          ? 'Gezegen + Burç + Ev + Açı tek bir derlenmiş kartta sunulur' 
                          : 'Ayrı ev ve açı tabloları'}
                      </span>
                    </div>

                    {/* Mode A: Bütünleşik Kişisel Transit Sentezi */}
                    {personalViewMode === 'SYNTHESIS' ? (
                      <div className="space-y-6">
                        {unifiedTransits.map((ut: UnifiedPlanetTransit, idx: number) => (
                          <div 
                            key={`ut-${idx}`}
                            className="bg-black/60 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 rounded-3xl p-5 sm:p-7 transition-all shadow-xl space-y-4"
                          >
                            {/* Header: Human-First Title & Technical Meta Badges */}
                            <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3.5">
                                  <span className="text-3xl font-black text-[#0EA5E9] w-10 text-center shrink-0">
                                    {PLANET_SYMBOLS[ut.planetName] || '★'}
                                  </span>
                                  <div>
                                    <h4 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                                      {ut.humanThemeTitle}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      <span className="text-xs text-[#D4AF37] font-semibold flex items-center gap-1 bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-lg border border-[#D4AF37]/25">
                                        {ut.planetName} ({ZODIAC_SYMBOLS[ut.sign]} {ut.sign} {ut.degreeInSign}°)
                                      </span>
                                      <span className="text-xs text-sky-300 font-medium bg-sky-500/10 px-2.5 py-0.5 rounded-lg border border-sky-500/25">
                                        🏠 {ut.houseTitle.split(':')[1]?.trim() || ut.houseTitle}
                                      </span>
                                      {ut.hdGateInfo && (
                                        <span className="text-xs text-emerald-300 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/25">
                                          🧬 Kapı {ut.hdGateInfo.gate}: {ut.hdGateInfo.title}
                                        </span>
                                      )}
                                      {ut.isRetrograde && (
                                        <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                                          Rx Retro
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Human-Centric Narrative Box */}
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
                              <span className="text-[10px] text-[#0EA5E9] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                                <Sparkles size={12} /> 7Layers Yaşam Alanı Özeti
                              </span>
                              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                                {ut.humanNarrative}
                              </p>
                              {ut.hdGateInfo && (
                                <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] border-t border-white/5">
                                  <span className="text-red-400/90 font-medium">⚠️ Gölge: {ut.hdGateInfo.shadow}</span>
                                  <span className="text-gray-500">➔</span>
                                  <span className="text-emerald-400 font-medium">✨ Hediye: {ut.hdGateInfo.gift}</span>
                                </div>
                              )}
                            </div>

                            {/* Active Natal Aspects Row */}
                            <div>
                              <span className="text-[11px] text-mystic-text-muted block uppercase tracking-wider font-bold mb-2">
                                Eşzamanlı Tetiklenen Natal Gezegenler & Açılar:
                              </span>
                              {ut.aspects.length === 0 ? (
                                <div className="text-xs text-gray-400 italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                  Şu anda doğrudan majör bir natal gezegene açı yapmıyor; {ut.house}. evinizin genel atmosferini sessizce dönüştürüyor.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                  {ut.aspects.map((asp: UnifiedAspectInfo, aIdx: number) => (
                                    <div 
                                      key={`asp-${aIdx}`}
                                      className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all text-xs"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span 
                                          className="font-bold px-2 py-0.5 rounded text-[11px]"
                                          style={{ color: ASPECT_COLORS[asp.aspectType] || '#D4AF37', backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        >
                                          {asp.aspectType}
                                        </span>
                                        <span className="text-white font-medium">
                                          Natal {asp.natalPlanet}
                                        </span>
                                        {asp.natalHouse && (
                                          <span className="text-[11px] text-gray-400">
                                            [{asp.natalHouse}. Ev]
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-mystic-text-muted">
                                        Orb: {asp.orb.toFixed(1)}°
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Footer Action */}
                            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                              <span className="text-[11px] text-purple-300/80 flex items-center gap-1.5">
                                <Layers size={13} className="text-purple-400 shrink-0" />
                                <span>{ut.chakraLayer}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isApprenticeOrAbove) {
                                    setSelectedInterp({
                                      title: ut.humanThemeTitle,
                                      content: ut.detailedAnalysis,
                                      extra: ut.chakraLayer
                                    });
                                  } else {
                                    setShowLockModal(true);
                                  }
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37]/20 to-[#0EA5E9]/20 hover:from-[#D4AF37]/30 hover:to-[#0EA5E9]/30 text-white border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span>Derin Bütünleşik Analizi Gör</span>
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Mode B: Klasik Ayrık Tablolar */
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Transitlerin Düştüğü Evler */}
                        <div className="bg-black/50 backdrop-blur-md border border-[#0EA5E9]/30 p-8 rounded-3xl shadow-2xl">
                          <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Transit Gezegenler & Natal Evleriniz</h3>
                          <p className="text-sm text-mystic-text-muted mb-4">Gökyüzündeki gezegenler şu an doğum haritanızdaki hangi yaşam alanlarınızı (evlerinizi) tetikliyor?</p>
                          <div className="space-y-3">
                            {transitData.transitPlanets.map((p, i) => (
                              <div 
                                key={`th-${i}`} 
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[#0EA5E9]/30 hover:bg-white/10 transition-colors cursor-pointer"
                                onClick={() => {
                                  if (isApprenticeOrAbove) {
                                    setSelectedInterp(getTransitHouseInterpretation(p.name, p.house));
                                  } else {
                                    setShowLockModal(true);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3 w-1/3">
                                  <span className="text-2xl text-[#0EA5E9] font-bold w-8 text-center">{PLANET_SYMBOLS[p.name] || ''}</span>
                                  <span className="text-white font-medium">Transit {p.name}</span>
                                </div>
                                <div className="w-1/3 text-center">
                                  <span className="font-bold text-white">{p.house}. Evinizde</span>
                                </div>
                                <div className="w-1/3 text-right text-mystic-text-muted text-sm">
                                  <span style={{ color: ZODIAC_COLORS[p.sign] }}>{p.sign}</span> {p.degreeInSign}° {p.isRetrograde && <span className="text-red-400 font-bold ml-1">Rx</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Transit - Natal Açıları */}
                        <div className="bg-black/50 backdrop-blur-md border border-[#D4AF37]/30 p-8 rounded-3xl shadow-2xl">
                          <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Transit - Natal Açıları (Kadersel Tetiklenmeler)</h3>
                          <p className="text-sm text-mystic-text-muted mb-4">Gezegen geçişlerinin kendi doğuştan gelen karakterinize ve kaderinize yaptığı sert veya uyumlu açılar.</p>
                          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            {transitData.transitAspects.length === 0 ? (
                              <p className="text-mystic-text-muted text-center py-4">Şu anki transitler natal gezegenlerinize majör bir açı yapmıyor.</p>
                            ) : (
                              transitData.transitAspects.sort((a,b) => a.orb - b.orb).map((aspect, i) => (
                                <div 
                                  key={`ta-${i}`} 
                                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
                                  onClick={() => {
                                    if (isApprenticeOrAbove) {
                                      setSelectedInterp(getTransitAspectInterpretation(aspect.transitPlanet, aspect.natalPlanet, aspect.type));
                                    } else {
                                      setShowLockModal(true);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl text-[#0EA5E9] font-bold w-6 text-center">{PLANET_SYMBOLS[aspect.transitPlanet] || ''}</span>
                                    <span className="text-white font-medium text-sm">T.{aspect.transitPlanet}</span>
                                  </div>
                                  
                                  <div className="flex flex-col items-center flex-1 px-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-white/10" style={{ color: ASPECT_COLORS[aspect.type] }}>
                                      {aspect.type}
                                    </span>
                                    <span className="text-[10px] text-mystic-text-muted mt-1">
                                      Orb: {aspect.orb.toFixed(1)}° {aspect.isExact && <span className="text-[#D4AF37]">(Tam)</span>}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-medium text-sm">N.{aspect.natalPlanet}</span>
                                    <span className="text-xl text-[#D4AF37] font-bold w-6 text-center">{PLANET_SYMBOLS[aspect.natalPlanet] || ''}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Personal Tab 2: Timeline */}
                {personalTab === 'TIMELINE' && (
                  isTimelineLoading && !timelineData ? (
                    <div className="py-24 text-center bg-black/40 rounded-3xl border border-white/5">
                      <Loader2 className="mx-auto text-mystic-primary animate-spin mb-4" size={40} />
                      <h4 className="text-white font-bold text-lg mb-1">Kozmik Zaman Çizelgesi Hesaplanıyor...</h4>
                      <p className="text-mystic-text-muted text-sm">Gezegenlerin gökyüzü yörüngeleri ve açı başlangıç-bitiş tarihleri taranıyor.</p>
                    </div>
                  ) : (
                    <TransitTimelineChart
                      items={timelineData?.items || []}
                      startDateStr={timelineData?.startDate || transitDateStr}
                      endDateStr={timelineData?.endDate || transitDateStr}
                      range={timelineRange}
                      onRangeChange={(newRange) => {
                        setTimelineRange(newRange);
                        fetchPersonalTimeline(newRange);
                      }}
                      isLoading={isTimelineLoading}
                      isPremium={isApprenticeOrAbove}
                      onRequirePremium={() => setShowLockModal(true)}
                      userTimezone={timelineData?.timeZone || userTz}
                      tzOffsetHours={timelineData?.tzOffsetHours ?? tzOffsetHours}
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shared Interpretation Modal */}
      {selectedInterp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedInterp(null)}>
          <div className="bg-mystic-dark border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-[#D4AF37] pr-8 flex items-center gap-2">
                <Sparkles size={18} className="text-[#0EA5E9] shrink-0" />
                <span>{selectedInterp.title}</span>
              </h3>
              <button onClick={() => setSelectedInterp(null)} className="text-white/50 hover:text-white transition-colors cursor-pointer p-1">
                <X size={22} />
              </button>
            </div>
            
            <div className="space-y-3.5 mb-5">
              {parseInterpretationSections(selectedInterp.content).map((sec, sIdx) => {
                if (!sec.title && sec.type === 'general') {
                  return <p key={sIdx} className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{sec.content}</p>;
                }

                if (sec.type === 'sources_header') {
                  return (
                    <div key={sIdx} className="pt-4 pb-1 border-t border-white/10 space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-[#D4AF37]">
                        <Layers size={14} className="text-[#D4AF37]" />
                        {sec.title}
                      </span>
                      {sec.content && (
                        <p className="text-xs text-gray-400 leading-relaxed">{sec.content}</p>
                      )}
                    </div>
                  );
                }
                let borderClass = 'bg-white/[0.03] border-white/10';
                let icon = <Info size={13} className="text-gray-400" />;
                let titleColor = 'text-white';
                
                if (sec.type === 'house') {
                  borderClass = 'bg-amber-950/20 border-amber-500/25';
                  icon = <Compass size={13} className="text-amber-400" />;
                  titleColor = 'text-amber-300';
                } else if (sec.type === 'aspects') {
                  borderClass = 'bg-sky-950/20 border-sky-500/25';
                  icon = <Orbit size={13} className="text-sky-400" />;
                  titleColor = 'text-sky-300';
                } else if (sec.type === 'advice') {
                  borderClass = 'bg-emerald-950/20 border-emerald-500/25';
                  icon = <Sparkles size={13} className="text-emerald-400" />;
                  titleColor = 'text-emerald-300';
                } else if (sec.type === 'phase') {
                  borderClass = 'bg-indigo-950/30 border-indigo-500/25';
                  icon = <Sparkles size={13} className="text-indigo-400" />;
                  titleColor = 'text-indigo-300';
                } else if (sec.type === 'retro') {
                  borderClass = 'bg-purple-950/25 border-purple-500/30';
                  icon = <Clock size={13} className="text-purple-400" />;
                  titleColor = 'text-purple-300';
                }

                return (
                  <div key={sIdx} className={`border rounded-2xl p-4 ${borderClass}`}>
                    {sec.title && (
                      <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${titleColor}`}>
                        {icon}
                        {sec.title}
                      </span>
                    )}
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-line">{sec.content}</p>
                  </div>
                );
              })}
            </div>

            {selectedInterp.extra && (
              <div className="pt-3 border-t border-white/10 text-xs text-purple-300 flex items-center gap-2">
                <Layers size={14} className="text-purple-400 shrink-0" />
                <span>{selectedInterp.extra}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowLockModal(false)}>
          <div 
            className="bg-[#111] border border-[#0EA5E9]/30 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-[#0EA5E9] mx-auto mb-4 flex justify-center"><AlertCircle size={48} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Detaylı Analiz Kilitli</h3>
            <p className="text-mystic-text-muted text-sm mb-6 leading-relaxed">
              Transit geçişlerinin doğum haritanızdaki evlere ve gezegenlerinize yaptığı kadersel etkilerin detaylı yorumları Çıraklık Seviyesi (Apprentice) ve üzeri üyelere özeldir. Bu derin analiz seviye sistemine özeldir, yakında açılacaktır.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowLockModal(false)}
                className="w-full bg-[#0EA5E9] hover:bg-[#38BDF8] text-black font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#0EA5E9]/10"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
