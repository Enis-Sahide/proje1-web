"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, Zap, Search, X } from 'lucide-react';
import moment from 'moment-timezone';
import { generateChart, HumanDesignChart, CenterCode, PLANET_SYMBOLS, CHANNELS } from '@/utils/HumanDesignEngine';
import { useContent } from '@/lib/useContent';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { AstroCity } from '@/features/astrology/engine/AstrologyConstants';

const COLORS = {
  background: '#0F172A',
  primary: '#32D74B',
  accent: '#E63946',
  conscious: '#FFFFFF',
  text: '#E0E0E0',
  textMuted: '#9CA3AF',
  cardBg: 'rgba(15, 23, 42, 0.8)',
};

const CENTER_COORDS: Record<CenterCode, { x: number, y: number, shape: string, color: string, s: number }> = {
  Head: { x: 200, y: 45, shape: 'triangle', color: '#F4D03F', s: 28 },
  Ajna: { x: 200, y: 115, shape: 'triangle-down', color: '#A8D5BA', s: 28 },
  Throat: { x: 200, y: 190, shape: 'square', color: '#D2B48C', s: 25 },
  G: { x: 200, y: 300, shape: 'diamond', color: '#F4D03F', s: 35 },
  Heart: { x: 255, y: 340, shape: 'triangle', color: '#FFF', s: 24 },
  Sacral: { x: 200, y: 400, shape: 'square', color: '#E1464F', s: 25 },
  Root: { x: 200, y: 480, shape: 'square', color: '#FFF', s: 25 },
  Spleen: { x: 90, y: 390, shape: 'triangle-right', color: '#FFF', s: 30 },
  SolarPlexus: { x: 310, y: 390, shape: 'triangle-left', color: '#D2B48C', s: 30 },
};

const GATE_COORDS: Record<number, { x: number, y: number }> = {
  // Head
  64: { x: 183, y: 70 }, 61: { x: 200, y: 70 }, 63: { x: 217, y: 70 },
  // Ajna
  47: { x: 183, y: 90 }, 24: { x: 200, y: 90 }, 4: { x: 217, y: 90 },
  17: { x: 183, y: 109 }, 43: { x: 200, y: 136 }, 11: { x: 217, y: 109 },
  // Throat
  62: { x: 183, y: 168 }, 23: { x: 200, y: 168 }, 56: { x: 217, y: 168 },
  16: { x: 178, y: 176 }, 35: { x: 222, y: 176 },
  20: { x: 178, y: 190 }, 12: { x: 222, y: 190 },
  45: { x: 222, y: 204 },
  31: { x: 186, y: 212 }, 8: { x: 200, y: 212 }, 33: { x: 214, y: 212 },
  // G
  7: { x: 186, y: 279 }, 1: { x: 200, y: 272 }, 13: { x: 214, y: 279 },
  10: { x: 172, y: 300 }, 25: { x: 228, y: 300 },
  15: { x: 186, y: 321 }, 2: { x: 200, y: 328 }, 46: { x: 214, y: 321 },
  // Heart
  21: { x: 255, y: 322 }, 51: { x: 240, y: 350 },
  26: { x: 240, y: 360 }, 40: { x: 270, y: 360 },
  // Sacral
  5: { x: 186, y: 378 }, 14: { x: 200, y: 378 }, 29: { x: 214, y: 378 },
  34: { x: 178, y: 386 }, 27: { x: 178, y: 414 },
  59: { x: 222, y: 400 },
  42: { x: 186, y: 422 }, 3: { x: 200, y: 422 }, 9: { x: 214, y: 422 },
  // Root
  53: { x: 186, y: 458 }, 60: { x: 200, y: 458 }, 52: { x: 214, y: 458 },
  54: { x: 178, y: 468 }, 19: { x: 222, y: 468 },
  38: { x: 178, y: 480 }, 39: { x: 222, y: 480 },
  58: { x: 178, y: 492 }, 41: { x: 222, y: 492 },
  // Spleen
  48: { x: 65, y: 362 }, 57: { x: 85, y: 372 }, 44: { x: 115, y: 387 },
  50: { x: 105, y: 398 }, 32: { x: 85, y: 408 }, 28: { x: 75, y: 412 }, 18: { x: 65, y: 418 },
  // Solar Plexus
  36: { x: 335, y: 362 }, 22: { x: 315, y: 372 }, 37: { x: 295, y: 382 },
  6: { x: 285, y: 387 }, 49: { x: 295, y: 398 }, 55: { x: 315, y: 408 }, 30: { x: 335, y: 418 },
};

export default function HumanDesignPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const [name, setName] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  
  const [city, setCity] = useState<AstroCity | null>(null);
  const [activeGateId, setActiveGateId] = useState<number | null>(null);

  const { data: gatesData } = useContent<any[]>('/api/content/hd-gates');
  const activeGateData =
    activeGateId && gatesData ? gatesData.find((g: any) => g.id === activeGateId) : null;
  
  const [chart, setChart] = useState<HumanDesignChart | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr || !timeStr || !city) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      try {
        const dateTimeString = `${dateStr} ${timeStr}`;
        const m = moment.tz(dateTimeString, "YYYY-MM-DD HH:mm", city.tz);
        
        if (!m.isValid()) {
          alert("Girilen tarih/saat geçerli değil.");
          setIsAnalyzing(false);
          return;
        }

        const result = generateChart(m.toDate());
        setChart(result);
        setShowResult(true);
      } catch (err) {
        console.error(err);
        alert("Hesaplama sırasında bir hata oluştu.");
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500);
  };

  const drawChannels = () => {
    if (!chart) return null;
    const elements: React.ReactNode[] = [];

    // 16-48 is a long straight channel that crosses the Integration curves. 
    // Render it last so it appears on top as a bridge.
    const sortedChannels = [...CHANNELS].sort((a, b) => {
      if (a.id === 1648) return 1;
      if (b.id === 1648) return -1;
      return 0;
    });

    // 1. Arka plan çizgileri (gri zemin)
    sortedChannels.forEach(ch => {
       const g1 = ch.gates[0];
       const g2 = ch.gates[1];
       const c1 = GATE_COORDS[g1];
       const c2 = GATE_COORDS[g2];
       let p0x = c1.x, p0y = c1.y;
       let p2x = c2.x, p2y = c2.y;

       let bgPathD = `M ${p0x} ${p0y} L ${p2x} ${p2y}`;
       
       // Curved Integration Paths
       if ([1020, 1034, 2034, 2057, 1648].includes(ch.id)) {
         let cx = 0, cy = 0;
         if (ch.id === 1020) { cx = 120; cy = p2y; } // matches 20
         else if (ch.id === 1034) { cx = 60; cy = p0y; } // matches 10
         else if (ch.id === 2034) { cx = 80; cy = p0y; } // matches 20
         else if (ch.id === 2057) { cx = 40; cy = p0y; } // matches 20
         else if (ch.id === 1648) { cx = 0; cy = Math.min(p0y, p2y); } // wide outer curve
         bgPathD = `M ${p0x} ${p0y} Q ${cx} ${cy} ${p2x} ${p2y}`;
       }

       elements.push(<path d={bgPathD} stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" key={`bg-out-${ch.id}`} />);
       elements.push(<path d={bgPathD} stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" key={`bg-${ch.id}`} />);
    });
    
    // 2. Aktif kanallar (yarım/tam)
    sortedChannels.forEach(ch => {
       const g1 = ch.gates[0];
       const g2 = ch.gates[1];
       const c1 = GATE_COORDS[g1];
       const c2 = GATE_COORDS[g2];
       if (!c1 || !c2) return;
       let p0x = c1.x, p0y = c1.y;
       let p2x = c2.x, p2y = c2.y;

       const mx = (p0x + p2x) / 2;
       const my = (p0y + p2y) / 2;
       let g1Path = `M ${p0x} ${p0y} L ${mx} ${my}`;
       let g2Path = `M ${p2x} ${p2y} L ${mx} ${my}`;

       // Curved Integration Paths (dynamic bezier midpoints)
       if ([1020, 1034, 2034, 2057, 1648].includes(ch.id)) {
         let cx = 0, cy = 0;
         if (ch.id === 1020) { cx = 120; cy = p2y; }
         else if (ch.id === 1034) { cx = 60; cy = p0y; }
         else if (ch.id === 2034) { cx = 80; cy = p0y; }
         else if (ch.id === 2057) { cx = 40; cy = p0y; }
         else if (ch.id === 1648) { cx = 0; cy = Math.min(p0y, p2y); }
         
         const pmx = 0.25 * p0x + 0.5 * cx + 0.25 * p2x;
         const pmy = 0.25 * p0y + 0.5 * cy + 0.25 * p2y;
         
         const c1x = 0.5 * (p0x + cx), c1y = 0.5 * (p0y + cy);
         const c2x = 0.5 * (cx + p2x), c2y = 0.5 * (cy + p2y);

         g1Path = `M ${p0x} ${p0y} Q ${c1x} ${c1y} ${pmx} ${pmy}`;
         g2Path = `M ${p2x} ${p2y} Q ${c2x} ${c2y} ${pmx} ${pmy}`;
       }

       const g1Cons = chart.conscious.some(p => p.gate === g1);
       const g1Unc = chart.unconscious.some(p => p.gate === g1);
       const g2Cons = chart.conscious.some(p => p.gate === g2);
       const g2Unc = chart.unconscious.some(p => p.gate === g2);

       const drawHalf = (pathD: string, isConscious: boolean, isUnconscious: boolean, keyPrefix: string) => {
          if (!isConscious && !isUnconscious) return;
          
          elements.push(<path d={pathD} stroke="#000" strokeWidth="8" strokeLinecap="butt" strokeLinejoin="round" fill="none" key={`${keyPrefix}-outline`} />);
          
          if (isConscious && isUnconscious) {
            elements.push(<path d={pathD} stroke="#111" strokeWidth="6" strokeLinecap="butt" strokeLinejoin="round" fill="none" key={`${keyPrefix}-b`} />);
            elements.push(<path d={pathD} stroke={COLORS.accent} strokeWidth="6" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="3 3" fill="none" key={`${keyPrefix}-r`} />);
          } else if (isConscious) {
            elements.push(<path d={pathD} stroke="#111" strokeWidth="6" strokeLinecap="butt" strokeLinejoin="round" fill="none" key={`${keyPrefix}-con`} />);
          } else if (isUnconscious) {
            elements.push(<path d={pathD} stroke={COLORS.accent} strokeWidth="6" strokeLinecap="butt" strokeLinejoin="round" fill="none" key={`${keyPrefix}-unc`} />);
          }
       };

       drawHalf(g1Path, g1Cons, g1Unc, `g1-${ch.id}`);
       drawHalf(g2Path, g2Cons, g2Unc, `g2-${ch.id}`);
    });
    
    return elements;
  };

  const drawCenters = () => {
    if (!chart) return null;
    return Object.entries(CENTER_COORDS).map(([center, def]) => {
      const isDefined = chart.definedCenters.includes(center as CenterCode);
      
      const fill = isDefined ? def.color : '#FFFFFF';
      const stroke = isDefined ? 'none' : '#94A3B8';
      const s = def.s;
      
      const drawShape = () => {
        const sw = isDefined ? "0" : "1";
        if (def.shape === 'square') {
          return <rect x={def.x - s} y={def.y - s} width={s*2} height={s*2} fill={fill} stroke={stroke} strokeWidth={sw} key="mg" />;
        } else if (def.shape === 'diamond') {
          return <polygon points={`${def.x},${def.y-s-2} ${def.x+s+2},${def.y} ${def.x},${def.y+s+2} ${def.x-s-2},${def.y}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle') {
          return <polygon points={`${def.x},${def.y-s} ${def.x+s},${def.y+s} ${def.x-s},${def.y+s}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle-down') {
          return <polygon points={`${def.x-s},${def.y-s} ${def.x+s},${def.y-s} ${def.x},${def.y+s}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle-left') {
          return <polygon points={`${def.x+s},${def.y-s} ${def.x+s},${def.y+s} ${def.x-s},${def.y}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle-right') {
          return <polygon points={`${def.x-s},${def.y-s} ${def.x+s},${def.y} ${def.x-s},${def.y+s}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        }
        return null;
      };

      return (
        <g key={center}>
          {drawShape()}
        </g>
      );
    });
  }

  const drawGates = () => {
    if (!chart) return null;
    return Object.entries(GATE_COORDS).map(([gateId, coords]) => {
      const gNum = parseInt(gateId);
      const isCons = chart.conscious.some(p => p.gate === gNum);
      const isUnc = chart.unconscious.some(p => p.gate === gNum);
      const isActive = isCons || isUnc;
      
      const textX = coords.x;
      const textY = coords.y;

      return (
        <g 
          key={`glabel-${gateId}`} 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setActiveGateId(gNum)}
        >
          {isActive && <circle cx={textX} cy={textY} r={5.5} fill="#000" stroke="none" />}
          <text x={textX} y={textY} dominantBaseline="central" fontSize="8" fill={isActive ? "#FFF" : "#64748B"} stroke={isActive ? "none" : "#FFF"} strokeWidth={isActive ? "0" : "2"} paintOrder="stroke fill" fontWeight={isActive ? "900" : "bold"} textAnchor="middle">{gNum}</text>
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 relative">
      
      

      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 flex items-center text-mystic-text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Geri Dön
        </button>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#32D74B]/10 border border-[#32D74B]/30 flex items-center justify-center text-[#32D74B]">
              <Zap size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">İnsan Tasarımı Haritası</h1>
            </div>
          </div>
        </div>

        {!showResult ? (
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#32D74B]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2 animate-pulse">Vücut Grafiğiniz Çıkarılıyor...</h3>
                <p className="text-sm text-white/60">Gezegen konumları ve enerji merkezleri hesaplanıyor</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi *</label>
                  <input 
                    required 
                    type="date" 
                    min="1900-01-01"
                    max="2100-12-31"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#32D74B] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Saati *</label>
                  <input 
                    required 
                    type="time" 
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#32D74B] transition-colors" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğduğunuz Şehir *</label>
                <LocationAutocomplete
                  onSelect={(c) => setCity(c)}
                  defaultDisplay={city ? city.name : ''}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#32D74B] transition-colors"
                />
              </div>

              <button type="submit" className="w-full bg-[#32D74B] hover:bg-[#16a34a] text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(50,215,75,0.3)] mt-4">
                Haritayı Hesapla
              </button>
            </form>
          </div>
        ) : chart && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
              
              <div className="flex flex-col items-center justify-center mb-10">
                 <h2 className="text-3xl font-serif text-white mb-2">Kişisel Haritanız</h2>
                 <p className="text-mystic-text-muted">{dateStr} • {timeStr} • {city ? city.name : ''}</p>
              </div>

              <div className="flex flex-col lg:flex-row justify-center items-start gap-8 mb-10">
                {/* Left Column - Design */}
                <div className="w-full lg:w-48 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                  <h3 className="text-center font-bold uppercase tracking-wider text-[#E63946] mb-2 text-sm">Design</h3>
                  {chart.unconscious.map((p, i) => (
                    <div key={`unc-${i}`} className="flex items-center justify-between px-2 py-1 bg-white/5 rounded border border-white/5">
                      <span className="text-xl font-bold text-[#E63946]">{PLANET_SYMBOLS[p.planet]}</span>
                      <span className="text-sm font-bold text-[#E63946]">{p.gate}.{p.line}</span>
                    </div>
                  ))}
                </div>

                {/* Center SVG BodyGraph */}
                <div className="w-full max-w-md aspect-[320/540] bg-gradient-to-b from-[#e6c27a] to-[#c59b3f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
                  <svg width="100%" height="100%" viewBox="40 10 320 540" className="absolute inset-0">
                    {drawChannels()}
                    {drawCenters()}
                    {drawGates()}
                  </svg>
                </div>

                {/* Right Column - Personality */}
                <div className="w-full lg:w-48 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                  <h3 className="text-center font-bold uppercase tracking-wider text-white mb-2 text-sm">Personality</h3>
                  {chart.conscious.map((p, i) => (
                    <div key={`con-${i}`} className="flex items-center justify-between px-2 py-1 bg-white/5 rounded border border-white/5">
                      <span className="text-sm font-bold text-white">{p.gate}.{p.line}</span>
                      <span className="text-xl font-bold text-white">{PLANET_SYMBOLS[p.planet]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="block text-mystic-text-muted text-sm mb-1">Tür</span>
                  <span className="text-lg font-bold text-white">{chart.type}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="block text-mystic-text-muted text-sm mb-1">İç Otorite</span>
                  <span className="text-lg font-bold text-white">{chart.authority}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="block text-mystic-text-muted text-sm mb-1">Strateji</span>
                  <span className="text-lg font-bold text-white">{chart.strategy}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="block text-mystic-text-muted text-sm mb-1">Profil</span>
                  <span className="text-lg font-bold text-white">{chart.profile}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="block text-mystic-text-muted text-sm mb-1">İmza</span>
                  <span className="text-lg font-bold text-white">{chart.signature}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="block text-mystic-text-muted text-sm mb-1">Benlik Olmayan Tema</span>
                  <span className="text-lg font-bold text-white">{chart.notSelfTheme}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 lg:col-span-2">
                  <span className="block text-mystic-text-muted text-sm mb-1">Enkarnasyon Haçı</span>
                  <span className="text-lg font-bold text-white">{chart.incarnationCross}</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button onClick={() => setShowResult(false)} className="text-[#32D74B] hover:text-white transition-colors underline text-sm">
                  Yeni Bir Harita Hesapla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SIDEBAR for Gate Details */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-[#0F172A]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeGateId ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {activeGateId && (
          <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-[#32D74B]/20 flex items-center justify-center border border-[#32D74B]/30">
                <span className="text-[#32D74B] font-bold text-xl">{activeGateId}</span>
              </div>
              <button 
                onClick={() => setActiveGateId(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {activeGateData ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-150 fill-mode-both">
                <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                  {activeGateData.title}
                </h2>
                
                <div className="bg-black/30 rounded-2xl p-5 border border-white/5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#32D74B] w-20 shrink-0 pt-0.5">I Ching</span>
                    <span className="text-sm text-gray-300 font-medium">{activeGateData.iching}</span>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#E63946] w-20 shrink-0 pt-0.5">Astroloji</span>
                    <span className="text-sm text-gray-300 font-medium">{activeGateData.astrology}</span>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#F4D03F] w-20 shrink-0 pt-0.5">Biyoloji</span>
                    <span className="text-sm text-gray-300 font-medium">{activeGateData.biology}</span>
                  </div>
                </div>

                <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-[15px]">
                  <p>{activeGateData.description}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Loader2 size={32} className="animate-spin text-white mb-4" />
                <p className="text-sm text-white">Kapı verisi yükleniyor...</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
