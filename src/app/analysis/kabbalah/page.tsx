"use client";

import React, { useState } from 'react';
import { ArrowLeft, Loader2, Search, Triangle, Star, Compass, AlertCircle, ChevronDown, CheckCircle2, Moon, Sun, MoonStar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ASTRO_CITIES, AstroPoint, NatalChartData, AstroCity } from '@/features/astrology/engine/AstrologyConstants';
// Interpretations are fetched from the backend API.
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { X } from 'lucide-react';
import RequireRole from '@/core/ui/RequireRole';

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
  'Dünya': '⨁',
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

export default function KabbalahAnalysisPage() {
  const router = useRouter();

  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('12:00');
  const [cityKey, setCityKey] = useState<AstroCity | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [kabbalahAnalysis, setKabbalahAnalysis] = useState<any>(null);
  const [interpretations, setInterpretations] = useState<any>(null);
  const [errorStr, setErrorStr] = useState('');
  const [selectedWorld, setSelectedWorld] = useState<'assiah' | 'yetzirah' | 'beriyah' | 'atzilut'>('assiah');
  const [selectedInterp, setSelectedInterp] = useState<{title: string, content: string} | null>(null);

  const handleCalculate = async () => {
    try {
      setIsLoading(true);
      setErrorStr('');

      if (!dateStr || !timeStr || !cityKey) {
        throw new Error("Lütfen tüm tarih, saat ve şehir alanlarını doldurunuz.");
      }

      const res = await fetch('/api/astrology/kabbalah', {
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
        throw new Error(data.error || "Hesaplama hatası");
      }

      setChartData(data.data.charts);
      setKabbalahAnalysis(data.data.kabbalahAnalysis);
      setInterpretations(data.data.interpretations);
      setSelectedWorld('assiah');
    } catch (error: any) {
      console.error('Kabalistik hesaplama hatası:', error);
      setErrorStr(error.message || 'Harita oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSvgWheel = (currentChart: NatalChartData | null) => {
    if (!currentChart) return null;

    const ascLon = currentChart.ascendant.longitude;
    const getX = (lon: number, r: number) => CENTER + r * Math.cos((180 + ascLon - lon) * Math.PI / 180);
    const getY = (lon: number, r: number) => CENTER + r * Math.sin((180 + ascLon - lon) * Math.PI / 180);

    const R_TICKS_OUTER = RADIUS + 40;
    const R_ZODIAC_OUTER = RADIUS + 35;
    const R_ZODIAC_INNER = RADIUS + 10;
    const R_CUSP_NUM = RADIUS + 45;
    const R_PLANETS = RADIUS - 15;
    const R_ASPECTS = RADIUS - 40;

    return (
      <div className="w-full overflow-x-auto overflow-y-visible flex justify-center py-12 bg-black/40 rounded-3xl border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
        <svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} overflow="visible" className="max-w-full h-auto">
          {/* Aspect Lines */}
          <circle cx={CENTER} cy={CENTER} r={R_ASPECTS} stroke="rgba(212,175,55,0.3)" strokeWidth="1" fill="rgba(0,0,0,0.4)" />
          {currentChart.aspects.filter(a => a.type !== 'Kavuşum').map((a, i) => {
            const p1 = currentChart.planets.find(p => p.name === a.planet1) || (a.planet1.includes('ASC') ? currentChart.ascendant : currentChart.midheaven);
            const p2 = currentChart.planets.find(p => p.name === a.planet2) || (a.planet2.includes('ASC') ? currentChart.ascendant : currentChart.midheaven);
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

          {/* 360 Degree Ticks */}
          {Array.from({ length: 360 }).map((_, i) => {
            const isTen = i % 10 === 0;
            const isFive = i % 5 === 0;
            let length = 2;
            if (isTen) length = 6;
            else if (isFive) length = 4;
            
            return (
              <line 
                key={`tick-${i}`} 
                x1={getX(i, R_TICKS_OUTER)} y1={getY(i, R_TICKS_OUTER)} 
                x2={getX(i, R_TICKS_OUTER - length)} y2={getY(i, R_TICKS_OUTER - length)} 
                stroke={isTen ? "#D4AF37" : "rgba(212,175,55,0.3)"} 
                strokeWidth={isTen ? "1" : "0.5"} 
              />
            );
          })}

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
          {currentChart.houses.map((h, i) => {
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

          {/* Planets */}
          {currentChart.planets.map((p, i) => {
            let rOffset = 0;
            for(let j=0; j<i; j++) {
               if (Math.abs(p.longitude - currentChart.planets[j].longitude) < 5) rOffset += 18;
            }
            const px = getX(p.longitude, R_PLANETS - rOffset);
            const py = getY(p.longitude, R_PLANETS - rOffset);
            
            return (
              <g key={`planet-${i}`} className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedInterp(interpretations?.[selectedWorld]?.[p.name] || null)}>
                <line x1={getX(p.longitude, R_ZODIAC_INNER)} y1={getY(p.longitude, R_ZODIAC_INNER)} x2={px} y2={py} stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" strokeDasharray="1, 2" />
                <circle cx={px} cy={py} r="12" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" className="hover:fill-[#D4AF37]/20 transition-colors" />
                <text x={px} y={py + 5} fontSize="14" fill="#D4AF37" textAnchor="middle" fontWeight="bold">
                  {PLANET_SYMBOLS[p.name] || p.name[0]}
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-white overflow-hidden relative font-sans">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37] opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6A0DAD] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        <button 
          onClick={() => router.back()}
          className="flex items-center text-mystic-text-muted hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Geri Dön
        </button>

        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4 text-[#D4AF37]">
            <Triangle size={48} className="animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] tracking-tight mb-4">
            Kabalistik 4 Alem Analizi
          </h1>
          <p className="text-mystic-text-muted text-lg max-w-2xl mx-auto">
            Hayat Ağacının (Sefirot) mistik kapılarını aralayın. 1. Beden Haritanızın yöneticisini bulun ve hangi üst alemlere kadersel sıçrama yeteneğiniz olduğunu keşfedin.
          </p>
        </div>

        <RequireRole minimumRole="master">
          {!chartData && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Search className="mr-3 text-[#D4AF37]" /> Kimlik ve Doğum Bilgileri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi</label>
                  <input 
                    required 
                    type="date" 
                    min="1900-01-01"
                    max="2100-12-31"
                    value={dateStr} onChange={e => setDateStr(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Saati</label>
                  <input 
                    type="time" 
                    value={timeStr} onChange={e => setTimeStr(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Şehir *</label>
                  <LocationAutocomplete
                    onSelect={(c) => setCityKey(c)}
                    defaultDisplay={cityKey ? cityKey.name : ''}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              {errorStr && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center">
                  <span className="mr-2">⚠️</span> {errorStr}
                </div>
              )}

              <div className="mt-8">
                <button 
                  onClick={handleCalculate}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center text-lg shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40"
                >
                  {isLoading ? (
                    <><Loader2 className="animate-spin mr-2" /> 4 Alem Hesaplanıyor...</>
                  ) : (
                    <>Sefirot Kapılarını Aç</>
                  )}
                </button>
              </div>
            </div>
          )}

          {chartData && kabbalahAnalysis && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#111] to-black border border-white/10 rounded-2xl max-w-3xl mx-auto">
                <div className="text-[#D4AF37] mb-2"><MoonStar size={32} /></div>
                <h2 className="text-2xl font-bold text-white mb-2">1. Beden Haritası Yönetici Analizi</h2>
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-[#D4AF37] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                    {cityKey ? cityKey.name : ''} • {dateStr.split('-').reverse().join('.')} {timeStr}
                  </p>
                </div>
                <p className="text-mystic-text-muted text-center max-w-xl mt-4">
                  Yükselen Burcunuz: <strong className="text-white">{chartData.assiah.ascendant.sign}</strong>
                </p>
              </div>

              <div className={`p-8 rounded-2xl border max-w-3xl mx-auto ${kabbalahAnalysis.shortcutLevel > 0 ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-white/5 border-white/10'} backdrop-blur-sm relative overflow-hidden`}>
                {kabbalahAnalysis.shortcutLevel > 0 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-20 blur-[50px] pointer-events-none"></div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${kabbalahAnalysis.shortcutLevel > 0 ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white'}`}>
                    <Star size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold mb-2 ${kabbalahAnalysis.shortcutLevel > 0 ? 'text-[#D4AF37]' : 'text-white'}`}>
                      Kozmik Kestirme Yolunuz (Shortcut)
                    </h3>
                    <p className="text-white/90 leading-relaxed text-lg">
                      {kabbalahAnalysis.shortcutMessage}
                    </p>
                  </div>
                </div>
              </div>

              {chartData[selectedWorld]?.esoteric && (
                <div className="p-8 rounded-2xl border bg-[#6A0DAD]/10 border-[#6A0DAD]/30 max-w-3xl mx-auto backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#6A0DAD] opacity-20 blur-[50px] pointer-events-none"></div>
                  
                  <h3 className="text-2xl font-bold mb-6 text-[#E0B0FF] flex items-center">
                    <MoonStar className="mr-3" /> Ezoterik Sırlar (Karmik Kilitler ve İlerletimler)
                  </h3>
                  
                  <div className="space-y-6">
                    {selectedWorld === 'assiah' && chartData.assiah.esoteric.progressedSunSign && (
                      <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                        <h4 className="text-lg font-semibold text-white mb-2">İkincil İlerletilmiş Güneş (Progressed Sun)</h4>
                        {chartData.assiah.esoteric.progressedSunSign === chartData.assiah.planets.find((p: any) => p.name === 'Güneş')?.sign ? (
                          <p className="text-white/80">
                            Ruhsal Güneşiniz henüz burç değiştirmemiştir. Ancak <strong>{chartData.assiah.esoteric.progressedSunAge} yaşına</strong> geldiğinizde Güneşiniz sınırları aşarak yepyeni bir tekamül aşamasına geçecektir.
                          </p>
                        ) : (
                          <p className="text-white/80">
                            Natal Güneşiniz <strong>{chartData.assiah.planets.find((p: any) => p.name === 'Güneş')?.sign}</strong> olsa da, ruhunuz <strong>{chartData.assiah.esoteric.progressedSunAge} yaşından sonra</strong> uyanış yaşayarak sınırları aşmış ve <strong>{chartData.assiah.esoteric.progressedSunSign}</strong> burcuna (Progressed) evrilmiştir! Şu an hayata {chartData.assiah.esoteric.progressedSunSign} frekansından yaklaşıyor ve kararlarınızı bu enerjiyle alıyorsunuz.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="bg-black/40 p-5 rounded-xl border border-white/5">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {selectedWorld === 'assiah' ? '1. Katman (Assiah)' : selectedWorld === 'yetzirah' ? '2. Katman (Yetzirah)' : selectedWorld === 'beriyah' ? '3. Katman (Beriyah)' : '4. Katman (Atzilut)'} Kıstırılmış (Intercepted) Burçlar
                      </h4>
                      {chartData[selectedWorld].esoteric.interceptedSigns && chartData[selectedWorld].esoteric.interceptedSigns.length > 0 ? (
                        <p className="text-white/80">
                          Bu harita katmanınızda <strong>{chartData[selectedWorld].esoteric.interceptedSigns.join(' ve ')}</strong> burçları kıstırılmıştır! Ev çizgilerinde görünmeyen bu burçlar, bu alemdeki en derin ve kilitli karmik potansiyellerinizi işaret eder.
                        </p>
                      ) : (
                        <p className="text-white/80">
                          Bu harita katmanınızda kıstırılmış burç (Intercepted Sign) bulunmamaktadır. İlgili alemdeki tüm enerjiler doğrudan ev alanlarınıza akmaktadır.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-16 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                <h3 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-white">
                  4 Alem Harita Görüntüleyici
                </h3>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {[
                    { id: 'assiah', label: '1. Assiah (Fiziksel)', tech: 'Tropikal' },
                    { id: 'yetzirah', label: '2. Yetzirah (Duygusal)', tech: 'Drakonik' },
                    { id: 'beriyah', label: '3. Beriyah (Zihinsel)', tech: '9. Harmonik' },
                    { id: 'atzilut', label: '4. Atzilut (Kudret)', tech: 'Güneş Merkezli' }
                  ].map((world) => (
                    <button
                      key={world.id}
                      onClick={() => setSelectedWorld(world.id as any)}
                      className={`flex flex-col items-center px-6 py-3 rounded-xl border transition-all ${
                        selectedWorld === world.id 
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                          : 'bg-black/40 border-white/10 text-mystic-text-muted hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="font-bold">{world.label}</span>
                      <span className="text-xs opacity-70">{world.tech}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-2 flex justify-center items-center bg-black/40 rounded-2xl p-4 border border-white/5">
                    {renderSvgWheel(chartData[selectedWorld])}
                  </div>

                  <div className="bg-black/40 rounded-2xl p-6 border border-white/5 max-h-[650px] overflow-y-auto custom-scrollbar">
                    <h4 className="text-xl font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
                      <Star size={18} /> Gezegen Yerleşimleri
                    </h4>
                    <div className="space-y-3">
                      {chartData[selectedWorld].planets.map((p: AstroPoint, idx: number) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#D4AF37]/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedInterp(interpretations?.[selectedWorld]?.[p.name] || null)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-lg font-bold">
                              {PLANET_SYMBOLS[p.name] || p.name[0]}
                            </span>
                            <span className="font-medium text-white text-sm">{p.name}</span>
                          </div>
                          <div className="text-right flex flex-col">
                            <span className="text-mystic-text-muted text-xs">
                              <span style={{color: ZODIAC_COLORS[p.sign]}}>{ZODIAC_SYMBOLS[p.sign]} {p.sign}</span> 
                            </span>
                            <span className="text-white font-mono text-xs">
                              {p.degreeInSign}°{String(p.minutes).padStart(2, '0')}'
                              {p.isRetrograde && <span className="text-red-500 ml-1">Rx</span>}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ev Yerleşimleri Listesi */}
                  <div className="bg-black/40 rounded-2xl p-6 border border-white/5 max-h-[650px] overflow-y-auto custom-scrollbar">
                    <h4 className="text-xl font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
                      <Triangle size={18} className="rotate-180" /> Ev Yerleşimleri
                    </h4>
                    <div className="space-y-3">
                      {chartData[selectedWorld].houses.map((h: AstroPoint, idx: number) => (
                        <div 
                          key={`house-list-${idx}`} 
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white text-sm font-bold">
                              {h.house}
                            </span>
                            <span className="font-medium text-white text-sm">. Ev {h.house === 1 ? '(ASC)' : h.house === 10 ? '(MC)' : ''}</span>
                          </div>
                          <div className="text-right flex flex-col">
                            <span className="text-mystic-text-muted text-xs">
                              <span style={{color: ZODIAC_COLORS[h.sign]}}>{ZODIAC_SYMBOLS[h.sign]} {h.sign}</span> 
                            </span>
                            <span className="text-white font-mono text-xs">
                              {h.degreeInSign}°{String(h.minutes).padStart(2, '0')}'
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Detailed Description of The 4 Worlds */}
              <div className="space-y-6 pt-12">
                <h3 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
                  Alem Analizleri
                </h3>
                
                {kabbalahAnalysis.worlds.map((world, index) => {
                  const isMatch = (index + 1) === kabbalahAnalysis.shortcutLevel;
                  
                  return (
                    <div 
                      key={world.name}
                      className={`p-6 rounded-2xl border transition-all ${isMatch ? 'bg-[#D4AF37]/5 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)] scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-bold text-mystic-text-muted tracking-widest uppercase">
                              {index + 1}. Katman
                            </span>
                            {isMatch && <span className="bg-[#D4AF37] text-black text-xs font-bold px-2 py-0.5 rounded-full">Rezonans Noktanız</span>}
                          </div>
                          <h4 className="text-3xl font-bold text-white">
                            {world.name} <span className="text-gray-500 font-serif font-normal ml-2">{world.hebrewName}</span>
                          </h4>
                          <p className="text-[#D4AF37] font-medium">{world.title}</p>
                        </div>
                        
                        <div className="mt-4 md:mt-0 text-left md:text-right">
                          <div className="text-sm text-mystic-text-muted mb-1">Doğal Yönetici</div>
                          <div className="text-xl font-bold text-white bg-white/10 px-4 py-1 rounded-lg inline-block border border-white/5">
                            {world.naturalRuler}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h5 className="text-sm text-mystic-text-muted uppercase tracking-wider">Alem Tanımı</h5>
                          <p className="text-white/80 leading-relaxed text-sm">
                            {world.description}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm text-mystic-text-muted uppercase tracking-wider">Ezoterik Şifre</h5>
                          <p className="text-white/80 leading-relaxed text-sm italic">
                            {world.thothInfo}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-white/10 flex gap-6 text-sm">
                        <div><span className="text-mystic-text-muted mr-2">Element:</span><span className="text-white">{world.element}</span></div>
                        <div><span className="text-mystic-text-muted mr-2">Sefirot:</span><span className="text-white">{world.sephirot}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-8 pb-12 flex justify-center">
                <button 
                  onClick={() => {setChartData(null); setKabbalahAnalysis(null); setInterpretations(null); setDateStr(''); setTimeStr('');}}
                  className="px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-colors"
                >
                  Yeni Bir Ruh İçin Sorgula
                </button>
              </div>
              
            </div>
          )}
        </RequireRole>
      </div>

      {/* Modal - Interpretation Popup */}
      {selectedInterp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedInterp(null)}>
          <div 
            className="bg-[#111] border border-[#D4AF37]/30 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl relative animate-in fade-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#111]/90 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10">
              <h3 className="text-xl font-bold text-[#D4AF37]">{selectedInterp.title}</h3>
              <button onClick={() => setSelectedInterp(null)} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="text-white/90 leading-relaxed space-y-4 text-base whitespace-pre-wrap">
                {selectedInterp.content.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                  }
                  return <span key={index}>{part}</span>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
