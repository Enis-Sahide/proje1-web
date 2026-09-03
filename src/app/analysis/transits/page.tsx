"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Compass, Loader2, Sparkles, AlertCircle, Star, X } from 'lucide-react';
import { getTransitHouseInterpretation, getTransitAspectInterpretation } from '@/features/astrology/engine/TransitInterpretations';
import { AstroCity, TransitChartData } from '@/features/astrology/engine/AstrologyConstants';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { useAuth } from '@/context/AuthContext';
import TransitTimelineChart from '@/features/astrology/components/TransitTimelineChart';

interface AstroPoint {
  name: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  minutes: number;
  house: number;
  isRetrograde?: boolean;
}

interface AstroAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  isExact: boolean;
}

interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  type: string;
  orb: number;
  isExact: boolean;
}

interface NatalChartData {
  planets: AstroPoint[];
  ascendant: AstroPoint;
  midheaven: AstroPoint;
  houses: AstroPoint[]; 
  aspects: AstroAspect[];
}

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
  const { role, user } = useAuth();
  const isApprenticeOrAbove = role === 'apprentice' || role === 'journeyman' || role === 'master' || role === 'admin';
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transitData, setTransitData] = useState<TransitChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterp, setSelectedInterp] = useState<{title: string, content: string} | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);

  const [natalDateStr, setNatalDateStr] = useState('1990-01-01');
  const [natalTimeStr, setNatalTimeStr] = useState('12:00');
  const [cityKey, setCityKey] = useState<AstroCity | null>(null);

  const today = new Date();
  const defaultTDate = today.toISOString().split('T')[0];
  const defaultTTime = today.toTimeString().slice(0,5);

  const [transitDateStr, setTransitDateStr] = useState(defaultTDate);
  const [transitTimeStr, setTransitTimeStr] = useState(defaultTTime);

  // Timeline (Gantt) states
  const [activeTab, setActiveTab] = useState<'BIWHEEL' | 'TIMELINE'>('BIWHEEL');
  const [timelineData, setTimelineData] = useState<any>(null);
  const [timelineRange, setTimelineRange] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);

  const fetchTimeline = async (rangeToFetch: '1m' | '3m' | '6m' | '1y' = timelineRange) => {
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
          startDateStr: transitDateStr
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

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Proactively fetch 1-month timeline so it is ready immediately
      fetchTimeline('1m');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      <div className="w-full overflow-x-auto overflow-y-visible flex justify-center py-12 bg-black/40 rounded-3xl border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
        <svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} className="max-w-full h-auto drop-shadow-2xl overflow-visible">
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
    <div className="min-h-screen pt-24 pb-24 px-6 relative">
      
      

      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 flex items-center text-mystic-text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Geri Dön
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9]">
              <Compass size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Transit Haritası (Bi-Wheel)</h1>
              <p className="text-mystic-text-muted">Doğum haritanız üzerindeki güncel veya kadersel gezegen geçişleri</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {!transitData ? (
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#0EA5E9]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2 animate-pulse">Transitler Hesaplanıyor...</h3>
                <p className="text-sm text-white/60">Gezegen geçişleri ve natal açılarınız analiz ediliyor.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
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

              <button type="submit" disabled={isAnalyzing} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#0EA5E9] hover:opacity-90 disabled:opacity-50 text-black font-bold text-lg py-4 rounded-xl transition-all shadow-lg">
                Transit Haritamı Hesapla
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* View Navigation Tabs & Map Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/40 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('BIWHEEL')}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    activeTab === 'BIWHEEL'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#0EA5E9] text-black shadow-lg shadow-cyan-500/20'
                      : 'text-mystic-text-muted hover:text-white'
                  }`}
                >
                  <Compass size={16} />
                  <span>Anlık Çift Çember</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('TIMELINE');
                    if (!timelineData && !isTimelineLoading) {
                      fetchTimeline(timelineRange);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    activeTab === 'TIMELINE'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#0EA5E9] text-black shadow-lg shadow-cyan-500/20'
                      : 'text-mystic-text-muted hover:text-white'
                  }`}
                >
                  <Sparkles size={16} />
                  <span>Zaman Çizelgesi (Gantt)</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <span className="text-[11px] text-mystic-text-muted block">Harita Sahibi</span>
                  <span className="text-xs font-bold text-white">{cityKey?.name} • {natalDateStr}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => { setTransitData(null); setTimelineData(null); }} 
                  className="text-xs px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10 whitespace-nowrap"
                >
                  Yeni Harita Seç
                </button>
              </div>
            </div>

            {/* Tab 1: Bi-Wheel Anlık Harita */}
            {activeTab === 'BIWHEEL' && (
              <div className="space-y-10">
                <div className="bg-black/50 backdrop-blur-md border border-[#0EA5E9]/30 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                  <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
                     <div>
                       <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                         <Compass className="text-[#0EA5E9]" /> Çift Çemberli Transit Haritası
                       </h2>
                       <div className="flex flex-col gap-1 text-sm">
                         <p className="text-[#D4AF37] flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                           Natal: {cityKey ? cityKey.name : ''} • {natalDateStr.split('-').reverse().join('.')} {natalTimeStr}
                         </p>
                         <p className="text-[#0EA5E9] flex items-center gap-2">
                           <span className="w-3 h-3 rounded-full bg-[#0EA5E9] inline-block"></span>
                           Transit (Dış Çember): {transitDateStr.split('-').reverse().join('.')} {transitTimeStr}
                         </p>
                       </div>
                     </div>
                  </div>

                  {renderBiWheel()}
                </div>



            {/* Önemli Bilgilendirme Uyarı Kutusu */}
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

            {/* Analysis Grid */}
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
          </div>
        )}

            {/* Tab 2: Kozmik Zaman Çizelgesi (Gantt) */}
            {activeTab === 'TIMELINE' && (
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
                    fetchTimeline(newRange);
                  }}
                  isLoading={isTimelineLoading}
                  isPremium={isApprenticeOrAbove}
                  onRequirePremium={() => setShowLockModal(true)}
                />
              )
            )}
          </div>
        )}
      </div>

      {selectedInterp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedInterp(null)}>
          <div className="bg-mystic-dark border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#D4AF37] pr-8">{selectedInterp.title}</h3>
              <button onClick={() => setSelectedInterp(null)} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {selectedInterp.content}
            </div>
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
