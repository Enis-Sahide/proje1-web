"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoonStar, Star, CheckCircle2, Loader2, AlertCircle, X, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { getFullPlanetInterpretation, getAspectInterpretation, getHouseCuspInterpretation } from '@/features/astrology/engine/AstrologyInterpretations';
import { AstroPoint, AstroAspect, NatalChartData, ZodiacSign, Planet, AstroCity } from '@/features/astrology/engine/AstrologyConstants';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import { PrintableChart } from '@/components/PrintableChart';
import LocationAutocomplete from '@/components/LocationAutocomplete';

const ZODIAC_COLORS: Record<string, string> = {
  'Koç': '#FF453A', 'Aslan': '#FF453A', 'Yay': '#FF453A',
  'Boğa': '#32D74B', 'Başak': '#32D74B', 'Oğlak': '#32D74B',
  'İkizler': '#FFD60A', 'Terazi': '#FFD60A', 'Kova': '#FFD60A',
  'Yengeç': '#0A84FF', 'Akrep': '#0A84FF', 'Balık': '#0A84FF',
};

const ZODIAC_SYMBOLS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋', 
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏', 
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓'
};

const ZODIAC_ORDER = [
  'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 
  'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'
];

const PLANET_SYMBOLS: Record<string, string> = {
  'Güneş': '☉', 'Ay': '☽', 'Merkür': '☿', 'Venüs': '♀', 'Mars': '♂', 
  'Jüpiter': '♃', 'Satürn': '♄', 'Uranüs': '♅', 'Neptün': '♆', 'Plüton': '♇',
  'Yükselen (ASC)': 'ASC', 'Tepe Noktası (MC)': 'MC', 'Kuzey Ay Düğümü': '☊',
  'Kiron': '⚷',
  'Vertex (Vx)': 'Vx', 'Şans Noktası (POF)': '⊗', 'Lilith': '⚸'
};

const ASPECT_SYMBOLS: Record<string, string> = {
  'Kavuşum': '☌', 'Sekstil': '⚹', 'Kare': '□', 'Üçgen': '△', 'Karşıt': '☍', 'Görmeyen': '⚻'
};

const ASPECT_COLORS: Record<string, string> = {
  'Kavuşum': '#D4AF37', 'Sekstil': '#0A84FF', 'Kare': '#FF453A', 'Üçgen': '#32D74B', 'Karşıt': '#FF453A', 'Görmeyen': '#0A84FF'
};

const CHART_SIZE = 640;
const CENTER = CHART_SIZE / 2;
const RADIUS = CENTER - 85;

export default function AstrologyPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chartData, setChartData] = useState<NatalChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('12:00');
  const [cityKey, setCityKey] = useState<AstroCity | null>(null);
  
  const [selectedInterp, setSelectedInterp] = useState<{title: string, content: string} | null>(null);

  // Accordion states
  const [showAspectGrid, setShowAspectGrid] = useState(false);
  const [showPlanets, setShowPlanets] = useState(true);
  const [showHouses, setShowHouses] = useState(false);
  const [showAspectList, setShowAspectList] = useState(true);

  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    alert("Bilgilendirme: İndirilen görselde sadece astrolojik tablo verileri yer almaktadır. Butonlara tıklayıp açtığınız detaylı uzun yorum metinleri dökümana dahil değildir.");
    setIsDownloading(true);
    try {
      // Temporarily remove the offscreen positioning to capture it safely
      const node = printRef.current;
      node.style.position = 'relative';
      node.style.left = '0';
      node.style.top = '0';
      node.style.opacity = '1';
      node.style.zIndex = '9999';

      const dataUrl = await htmlToImage.toPng(node, { 
        backgroundColor: '#141928',
        pixelRatio: 2,
        style: {
          position: 'relative',
          left: '0',
          top: '0'
        }
      });
      
      // Restore original styles
      node.style.position = 'absolute';
      node.style.left = '-9999px';
      node.style.top = '-9999px';
      node.style.opacity = '0';
      node.style.zIndex = '-9999';

      download(dataUrl, 'Ezoterik_Dogum_Haritasi.png');
    } catch (err) {
      console.error(err);
      alert('İndirme sırasında bir hata oluştu.');
      
      // Ensure styles are restored on error
      const node = printRef.current;
      if (node) {
        node.style.position = 'absolute';
        node.style.left = '-9999px';
        node.style.top = '-9999px';
        node.style.opacity = '0';
        node.style.zIndex = '-9999';
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    setChartData(null);

    try {
      if (!dateStr || !timeStr || !cityKey) {
        throw new Error("Tüm alanları doldurunuz.");
      }

      const res = await fetch('/api/astrology/calculate', {
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
        throw new Error(data.error || 'Harita hesaplanırken bir hata oluştu.');
      }

      setChartData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderSvgWheel = (isPrintMode = false) => {
    if (!chartData) return null;

    const ascLon = chartData.ascendant.longitude;
    const getX = (lon: number, r: number) => CENTER + r * Math.cos((180 + ascLon - lon) * Math.PI / 180);
    const getY = (lon: number, r: number) => CENTER + r * Math.sin((180 + ascLon - lon) * Math.PI / 180);

    const R_TICKS_OUTER = RADIUS + 40;
    const R_ZODIAC_OUTER = RADIUS + 35;
    const R_ZODIAC_INNER = RADIUS + 10;
    const R_CUSP_NUM = RADIUS + 45;
    const R_PLANETS = RADIUS - 15;
    const R_ASPECTS = RADIUS - 40;

    const svgContent = (
      <svg 
        width={CHART_SIZE} 
        height={CHART_SIZE} 
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} 
        className={isPrintMode ? "max-w-full h-auto" : "w-[640px] h-[640px] shrink-0 mx-auto"}
      >
          {/* Aspect Lines */}
          <circle cx={CENTER} cy={CENTER} r={R_ASPECTS} stroke="rgba(212,175,55,0.3)" strokeWidth="1" fill="rgba(0,0,0,0.4)" />
          {chartData.aspects.filter(a => a.type !== 'Kavuşum').map((a, i) => {
            const p1 = chartData.planets.find(p => p.name === a.planet1) || (a.planet1.includes('ASC') ? chartData.ascendant : chartData.midheaven);
            const p2 = chartData.planets.find(p => p.name === a.planet2) || (a.planet2.includes('ASC') ? chartData.ascendant : chartData.midheaven);
            if (!p1 || !p2) return null;
            
            return (
              <line 
                key={`asp-${i}`} 
                x1={getX(p1.longitude, R_ASPECTS)} y1={getY(p1.longitude, R_ASPECTS)} 
                x2={getX(p2.longitude, R_ASPECTS)} y2={getY(p2.longitude, R_ASPECTS)} 
                stroke={ASPECT_COLORS[a.type] || "rgba(212,175,55,0.3)"} 
                strokeWidth={a.isExact ? "2" : "1"} 
                opacity={0.6}
              />
            );
          })}

          {/* Inner Rings */}
          <circle cx={CENTER} cy={CENTER} r={R_ZODIAC_INNER} stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" fill="none" />
          <circle cx={CENTER} cy={CENTER} r={R_ZODIAC_OUTER} stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" fill="none" />
          <circle cx={CENTER} cy={CENTER} r={R_TICKS_OUTER} stroke="rgba(212,175,55,0.3)" strokeWidth="1" fill="none" />

          {/* 360 Degree Ticks as paths for optimized rendering performance */}
          {(() => {
            let majorPath = "";
            let minorPath = "";
            for (let i = 0; i < 360; i++) {
              const isTen = i % 10 === 0;
              const isFive = i % 5 === 0;
              let length = 2;
              if (isTen) length = 6;
              else if (isFive) length = 4;

              const x1 = getX(i, R_TICKS_OUTER);
              const y1 = getY(i, R_TICKS_OUTER);
              const x2 = getX(i, R_TICKS_OUTER - length);
              const y2 = getY(i, R_TICKS_OUTER - length);

              if (isTen) {
                majorPath += `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} `;
              } else {
                minorPath += `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} `;
              }
            }
            return (
              <g>
                <path d={majorPath} stroke="#D4AF37" strokeWidth="1" fill="none" />
                <path d={minorPath} stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" fill="none" />
              </g>
            );
          })()}

          {/* Zodiac Signs */}
          {Array.from({ length: 12 }).map((_, i) => {
            const signLon = i * 30; 
            const midLon = signLon + 15;
            const signName = ZODIAC_ORDER[i];

            return (
              <g key={`zodiac-${i}`}>
                <line x1={getX(signLon, R_ZODIAC_OUTER)} y1={getY(signLon, R_ZODIAC_OUTER)} x2={getX(signLon, R_ZODIAC_INNER)} y2={getY(signLon, R_ZODIAC_INNER)} stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
                <text x={getX(midLon, RADIUS + 22)} y={getY(midLon, RADIUS + 22) + 6} fontSize="18" fill={ZODIAC_COLORS[signName]} textAnchor="middle" fontWeight="bold">
                  {ZODIAC_SYMBOLS[signName]}
                </text>
              </g>
            );
          })}

          {/* House Lines */}
          {chartData.houses.map((h, i) => {
            const isAngle = h.house === 1 || h.house === 4 || h.house === 7 || h.house === 10;
            return (
              <g key={`house-${i}`}>
                <line 
                  x1={getX(h.longitude, R_ASPECTS)} y1={getY(h.longitude, R_ASPECTS)} 
                  x2={getX(h.longitude, R_ZODIAC_INNER)} y2={getY(h.longitude, R_ZODIAC_INNER)} 
                  stroke={isAngle ? "#D4AF37" : "rgba(212,175,55,0.3)"} 
                  strokeWidth={isAngle ? "2" : "1"} 
                  strokeDasharray={isAngle ? "" : "4, 4"} 
                />
                <line x1={getX(h.longitude, R_TICKS_OUTER)} y1={getY(h.longitude, R_TICKS_OUTER)} x2={getX(h.longitude, R_TICKS_OUTER + 5)} y2={getY(h.longitude, R_TICKS_OUTER + 5)} stroke={isAngle ? "#D4AF37" : "rgba(212,175,55,0.3)"} strokeWidth={isAngle ? "2" : "1"} />
                <text x={getX(h.longitude, R_CUSP_NUM + (isAngle ? 5 : 0))} y={getY(h.longitude, R_CUSP_NUM + (isAngle ? 5 : 0)) + 4} fontSize={isAngle ? "14" : "12"} fill={isAngle ? "#D4AF37" : "#9CA3AF"} textAnchor="middle" fontWeight={isAngle ? "bold" : "normal"}>
                  {`${String(h.degreeInSign).padStart(2, '0')}° ${h.house}. ${String(h.minutes).padStart(2, '0')}'`}
                </text>
              </g>
            );
          })}

          {/* Planets (Removed click modal handlers to prevent lag and accidental mobile clicks) */}
          {chartData.planets.map((p, i) => {
            let rOffset = 0;
            for(let j=0; j<i; j++) {
               if (Math.abs(p.longitude - chartData.planets[j].longitude) < 5) rOffset += 18;
            }
            const px = getX(p.longitude, R_PLANETS - rOffset);
            const py = getY(p.longitude, R_PLANETS - rOffset);
            
            return (
              <g key={`planet-${i}`}>
                <line x1={getX(p.longitude, R_ZODIAC_INNER)} y1={getY(p.longitude, R_ZODIAC_INNER)} x2={px} y2={py} stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" strokeDasharray="1, 2" />
                <circle cx={px} cy={py} r="12" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />
                <text x={px} y={py + 5} fontSize="14" fill="#D4AF37" textAnchor="middle" fontWeight="bold">
                  {PLANET_SYMBOLS[p.name]}
                </text>
                <text x={px + 16} y={py - 5} fontSize="10" fill="#9CA3AF" textAnchor="start">
                  {`${p.degreeInSign}°${String(p.minutes).padStart(2,'0')}'`}
                </text>
                {p.isRetrograde && (
                  <text x={px + 16} y={py + 6} fontSize="10" fill="#FF453A" textAnchor="start" fontWeight="bold">Rx</text>
                )}
              </g>
            );
          })}
          </svg>
    );

    if (isPrintMode) return svgContent;

    return (
      <div className="w-full overflow-x-auto overflow-y-visible flex justify-start md:justify-center py-6 sm:py-12 bg-black/40 rounded-3xl border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] custom-scrollbar">
        {svgContent}
      </div>
    );
  };

  const renderAspectGrid = (isPrintMode = false) => {
    if (!chartData) return null;
    const bodies = [
      chartData.planets.find(p => p.name === 'Güneş'),
      chartData.planets.find(p => p.name === 'Ay'),
      chartData.planets.find(p => p.name === 'Merkür'),
      chartData.planets.find(p => p.name === 'Venüs'),
      chartData.planets.find(p => p.name === 'Mars'),
      chartData.planets.find(p => p.name === 'Jüpiter'),
      chartData.planets.find(p => p.name === 'Satürn'),
      chartData.planets.find(p => p.name === 'Uranüs'),
      chartData.planets.find(p => p.name === 'Neptün'),
      chartData.planets.find(p => p.name === 'Plüton'),
      chartData.planets.find(p => p.name === 'Kiron'),
      chartData.planets.find(p => p.name === 'Lilith'),
      chartData.ascendant,
      chartData.midheaven
    ].filter(Boolean) as AstroPoint[];

    const gridContent = (
      <div className={`${isPrintMode ? 'overflow-hidden p-2' : 'min-w-fit mx-auto p-4 sm:p-6 bg-black/20 border border-[#D4AF37]/10'} flex flex-col items-center select-none rounded-3xl`}>
        <div className="inline-flex flex-col">
          {bodies.map((body, row) => (
            <div key={`row-${row}`} className="flex">
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-[#D4AF37] mr-1 sm:mr-2 border-r border-[#D4AF37]/20 text-base sm:text-lg">
                {PLANET_SYMBOLS[body.name] || body.name}
              </div>
              {bodies.slice(0, row).map((colBody, col) => {
                const aspect = chartData.aspects.find(a => 
                  (a.planet1 === body.name && a.planet2 === colBody.name) || 
                  (a.planet2 === body.name && a.planet1 === colBody.name)
                );
                return (
                  <div key={`cell-${row}-${col}`} className="w-7 h-7 sm:w-8 sm:h-8 border border-white/10 flex items-center justify-center bg-black/20 hover:bg-[#D4AF37]/10 transition-colors">
                    {aspect ? (
                      <span className="text-lg sm:text-xl font-bold" style={{ color: ASPECT_COLORS[aspect.type] }}>
                        {ASPECT_SYMBOLS[aspect.type]}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex">
            <div className="w-7 h-7 sm:w-8 sm:h-8 mr-1 sm:mr-2"></div>
            {bodies.slice(0, bodies.length - 1).map((colBody, col) => (
               <div key={`col-label-${col}`} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#D4AF37] text-base sm:text-lg font-bold mt-1 sm:mt-2">
                 {PLANET_SYMBOLS[colBody.name] || colBody.name}
               </div>
            ))}
        </div>
        </div>
      </div>
    );

    if (isPrintMode) return gridContent;

    return (
      <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {gridContent}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 relative">
            
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 flex items-center text-mystic-text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Geri Dön
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <MoonStar size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Doğum Haritası Analizi</h1>
            <p className="text-mystic-text-muted">Kozmik Şifrenizi Çözün</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {!chartData ? (
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-4 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#D4AF37]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2 animate-pulse">Gezegen Konumları Hesaplanıyor...</h3>
                <p className="text-sm text-white/60">Gökyüzü haritanız yüksek hassasiyetle çiziliyor.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi *</label>
                  <input required type="date" min="1900-01-01" max="2100-12-31" value={dateStr} onChange={e => setDateStr(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Saati (Tam)</label>
                  <input required type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-mystic-text-muted mb-2">Şehir *</label>
                <LocationAutocomplete 
                  onSelect={(c) => setCityKey(c)} 
                  defaultDisplay={cityKey ? cityKey.name : ''}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <button type="submit" disabled={isAnalyzing} className="w-full bg-[#D4AF37] hover:bg-[#b0902c] disabled:opacity-50 text-black font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                Haritamı Çıkar ve Analiz Et
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Visual SVG Wheel */}
            <div className="bg-black/50 backdrop-blur-md border border-[#D4AF37]/30 p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center w-full">
              <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
                 <div>
                   <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                     <Star className="text-[#D4AF37]" /> Ezoterik Doğum Haritası
                   </h2>
                   <p className="text-mystic-text-muted flex items-center gap-2 text-sm font-medium">
                     {cityKey ? cityKey.name : ''} • {dateStr.split('-').reverse().join('.')} {timeStr}
                   </p>
                 </div>
                 <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                   <button disabled={isDownloading} onClick={handleDownloadImage} className="flex-1 sm:flex-initial text-xs sm:text-sm px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 rounded-full text-[#D4AF37] transition-colors border border-[#D4AF37]/30 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50">
                     {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                     {isDownloading ? "Görsel Hazırlanıyor..." : "Haritayı İndir (PNG)"}
                   </button>
                   <button onClick={() => setChartData(null)} className="flex-1 sm:flex-initial text-xs sm:text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10 whitespace-nowrap text-center">
                     Yeni Harita
                   </button>
                 </div>
              </div>
              {renderSvgWheel()}
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              
              {/* Left Column: Gezegenler & Evler Listesi */}
              <div className="flex flex-col gap-8 h-fit">
                
                {/* Gezegen Yerleşimleri */}
                <div className="bg-black/50 backdrop-blur-md border border-[#D4AF37]/30 p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col h-fit">
                <button 
                  onClick={() => setShowPlanets(!showPlanets)}
                  className="w-full flex items-center justify-between text-xl font-bold text-white border-b border-white/10 pb-4 focus:outline-none"
                >
                  <span>Gezegen Yerleşimleri</span>
                  {showPlanets ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                <div className={`transition-all duration-700 ease-in-out origin-top flex flex-col overflow-hidden ${showPlanets ? 'opacity-100 max-h-[4000px] mt-6' : 'opacity-0 max-h-0'}`}>
                  <div className="flex text-mystic-text-muted text-sm px-4 py-2 border-b border-white/5 mb-2 shrink-0">
                    <div className="w-[45%]">Gezegen</div>
                    <div className="w-[20%] text-center">Burç</div>
                    <div className="w-[35%] text-right">Derece & Ev</div>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {[...chartData.planets, chartData.ascendant, chartData.midheaven].map((p, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedInterp(getFullPlanetInterpretation(p.name, p.sign, p.house))}
                      className="w-full flex items-center text-left hover:bg-white/5 transition-colors p-3 sm:p-4 rounded-xl border border-transparent hover:border-white/10 group"
                    >
                      <div className="w-[45%] flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="text-xl sm:text-2xl text-[#D4AF37] font-bold w-8 sm:w-12 shrink-0 text-center">{PLANET_SYMBOLS[p.name] || ''}</span>
                        <span className="text-white font-medium group-hover:text-[#D4AF37] transition-colors truncate sm:whitespace-normal" title={p.name}>{p.name}</span>
                      </div>
                      <div className="w-[20%] text-center font-bold text-sm sm:text-base" style={{ color: ZODIAC_COLORS[p.sign] }}>{p.sign}</div>
                      <div className="w-[35%] text-right text-mystic-text-muted text-xs sm:text-sm">
                        {p.degreeInSign}° {String(p.minutes).padStart(2, '0')}' {p.isRetrograde && <span className="text-red-400 font-bold ml-1">Rx</span>}
                        <br />
                        <span className="text-xs">{p.house}. Ev</span>
                      </div>
                    </button>
                  ))}
                </div>
                </div>
              </div>

                {/* Evler ve Kapsadığı Burçlar */}
                <div className="bg-black/50 backdrop-blur-md border border-[#D4AF37]/30 p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col h-fit">
                <button 
                  onClick={() => setShowHouses(!showHouses)}
                  className="w-full flex items-center justify-between text-xl font-bold text-white border-b border-white/10 pb-4 focus:outline-none"
                >
                  <span>Evler ve Kapsadığı Burçlar</span>
                  {showHouses ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                <div className={`transition-all duration-700 ease-in-out origin-top flex flex-col overflow-hidden ${showHouses ? 'opacity-100 max-h-[4000px] mt-6' : 'opacity-0 max-h-0'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {chartData.houses.map((h, i) => {
                    const nextH = chartData.houses[(i + 1) % 12];
                    let startLon = h.longitude;
                    let endLon = nextH.longitude;
                    if (endLon < startLon) endLon += 360;

                    const startSignIdx = Math.floor(startLon / 30);
                    const endSignIdx = Math.floor(endLon / 30);
                    
                    const spannedSigns = [];
                    for (let s = startSignIdx; s <= endSignIdx; s++) {
                      spannedSigns.push(ZODIAC_ORDER[s % 12]);
                    }

                    return (
                      <button 
                        key={i} 
                        onClick={() => setSelectedInterp(getHouseCuspInterpretation(h.house, h.sign))}
                        className="flex flex-col p-4 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-mystic-text-muted text-sm block">
                            {h.house}. Ev {h.house === 1 ? '(ASC)' : h.house === 10 ? '(MC)' : h.house === 4 ? '(IC)' : h.house === 7 ? '(DSC)' : ''}
                          </span>
                          <div className="text-right text-sm text-mystic-text-muted">
                            {h.degreeInSign}° {String(h.minutes).padStart(2, '0')}'
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-mystic-text-muted mr-1">Giriş:</span>
                          <span className="font-bold text-white group-hover:text-[#D4AF37] transition-colors" style={{ color: ZODIAC_COLORS[h.sign] }}>{h.sign}</span>
                        </div>
                        {spannedSigns.length > 1 && (
                          <div className="mt-1">
                            <span className="text-xs text-mystic-text-muted mr-1">İçerdiği Burçlar:</span>
                            <span className="text-xs font-medium text-white/80">{spannedSigns.join(', ')}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                </div>
              </div>
            </div>

            {/* Right Column: Aspect Grid and List */}
              <div className="flex flex-col gap-8 h-fit">
                
                {/* Aspect Grid */}
                <div className="bg-black/50 backdrop-blur-md border border-[#D4AF37]/30 p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col overflow-hidden h-fit">
                  <button 
                    onClick={() => setShowAspectGrid(!showAspectGrid)}
                    className="w-full flex items-center justify-between text-xl font-bold text-white border-b border-white/10 pb-4 focus:outline-none"
                  >
                    <span>Açı Tablosu</span>
                    {showAspectGrid ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </button>
                  <div className={`transition-all duration-700 ease-in-out origin-top overflow-hidden ${showAspectGrid ? 'opacity-100 max-h-[4000px] mt-6' : 'opacity-0 max-h-0'}`}>
                    <div className="bg-white/5 p-4 rounded-2xl overflow-x-auto flex justify-center w-full">
                      {renderAspectGrid()}
                    </div>
                  </div>
                </div>

                {/* Aspect List (Without Grid) */}
                <div className="bg-black/50 backdrop-blur-md border border-[#D4AF37]/30 p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col h-fit">
                  <button 
                    onClick={() => setShowAspectList(!showAspectList)}
                    className="w-full flex items-center justify-between text-xl font-bold text-white border-b border-white/10 pb-4 focus:outline-none"
                  >
                    <span>Karmik Dinamikler (Açılar)</span>
                    {showAspectList ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </button>
                  <div className={`transition-all duration-700 ease-in-out origin-top flex-1 flex flex-col overflow-hidden ${showAspectList ? 'opacity-100 max-h-[4000px] mt-6' : 'opacity-0 max-h-0'}`}>
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {chartData.aspects.filter(a => a.orb <= 7).sort((a,b) => a.orb - b.orb).map((a, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedInterp(getAspectInterpretation(a.planet1, a.planet2, a.type))}
                      className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{a.planet1}</span>
                          <span className="text-2xl" style={{ color: ASPECT_COLORS[a.type] }}>{ASPECT_SYMBOLS[a.type]}</span>
                          <span>{a.planet2}</span>
                        </div>
                        <span className="text-sm text-mystic-text-muted mt-1 block">Tolerans: {a.orb.toFixed(1)}° {a.isExact && <span className="text-[#D4AF37] ml-2 font-bold">(Tam Açı)</span>}</span>
                      </div>
                      <div className="font-semibold" style={{ color: ASPECT_COLORS[a.type] }}>{a.type}</div>
                    </button>
                  ))}
                </div>
                </div>
              </div>

            </div>
            </div>
          </div>
        )}

        {/* Interpretation Modal */}
        {selectedInterp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#141928] border border-[#D4AF37]/50 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold text-[#D4AF37] pr-8">{selectedInterp.title}</h3>
                <button onClick={() => setSelectedInterp(null)} className="p-2 text-mystic-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors absolute right-6 top-6">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedInterp.content.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={index}>{part}</span>;
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Printable Chart (Hidden from screen) */}
        <div className="fixed top-0 left-[-9999px] z-[-9999] opacity-0 pointer-events-none">
          {chartData && (
            <PrintableChart 
              ref={printRef}
              chartData={chartData} 
              locationStr={cityKey ? cityKey.name : ''} 
              dateStr={`${dateStr.split('-').reverse().join('.')} ${timeStr}`} 
              svgWheel={renderSvgWheel(true)}
              aspectGrid={renderAspectGrid(true)}
            />
          )}
        </div>

      </div>
    </div>
  );
}
