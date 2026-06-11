import React from 'react';
import { Star, MoonStar } from 'lucide-react';
const ZODIAC_COLORS: Record<string, string> = {
  'Koç': '#FF453A', 'Aslan': '#FF453A', 'Yay': '#FF453A',
  'Boğa': '#32D74B', 'Başak': '#32D74B', 'Oğlak': '#32D74B',
  'İkizler': '#FFD60A', 'Terazi': '#FFD60A', 'Kova': '#FFD60A',
  'Yengeç': '#0A84FF', 'Akrep': '#0A84FF', 'Balık': '#0A84FF',
};
const ZODIAC_ORDER = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];
const PLANET_SYMBOLS: Record<string, string> = {
  'Güneş': '☀️', 'Ay': '🌙', 'Merkür': '☿', 'Venüs': '♀', 'Mars': '♂', 
  'Jüpiter': '♃', 'Satürn': '♄', 'Uranüs': '♅', 'Neptün': '♆', 'Plüton': '♇',
  'Yükselen (ASC)': 'ASC', 'Tepe Noktası (MC)': 'MC', 'Kuzey Ay Düğümü': '☊',
  'Kiron': '⚷', 'Vertex (Vx)': 'Vx', 'Şans Noktası (POF)': '⊗', 'Lilith': '⚸'
};
const ASPECT_COLORS: Record<string, string> = {
  'Kavuşum': '#D4AF37', 'Sekstil': '#0A84FF', 'Kare': '#FF453A', 'Üçgen': '#32D74B', 'Karşıt': '#FF453A', 'Görmeyen': '#0A84FF'
};
const ASPECT_SYMBOLS: Record<string, string> = {
  'Kavuşum': '☌', 'Sekstil': '⚹', 'Kare': '□', 'Üçgen': '△', 'Karşıt': '☍', 'Görmeyen': '⚻'
};

interface PrintableChartProps {
  chartData: any;
  locationStr: string;
  dateStr: string;
  svgWheel: React.ReactNode;
  aspectGrid: React.ReactNode;
}

export const PrintableChart = React.forwardRef<HTMLDivElement, PrintableChartProps>(({ chartData, locationStr, dateStr, svgWheel, aspectGrid }, ref) => {
  if (!chartData) return null;

  const allPlanets = [...chartData.planets, chartData.ascendant, chartData.midheaven];

  return (
    <div 
      ref={ref}
      // Fixed width/height for exactly A4 portrait at ~150 DPI (1240x1754)
      className="w-[1240px] h-[1754px] bg-[#141928] text-white p-8 flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 40%)`,
        backgroundSize: '100% 100%'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-5 border-b border-[#D4AF37]/30 pb-3 mb-3 shrink-0">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
          <MoonStar size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-1 flex items-center gap-3">
            Ezoterik Doğum Haritası
          </h1>
          <p className="text-lg text-gray-400">
            {locationStr} • {dateStr}
          </p>
        </div>
      </div>

      {/* SVG Wheel & Aspect Grid Side by Side */}
      <div className="flex gap-6 items-start justify-center h-[450px] shrink-0">
        <div className="flex-1 bg-black/40 border border-[#D4AF37]/20 rounded-2xl flex justify-center items-center h-full relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] flex items-center justify-center scale-[0.75]">
            {svgWheel}
          </div>
        </div>
        <div className="flex-1 bg-black/40 border border-[#D4AF37]/20 rounded-2xl flex justify-center items-center h-full relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center scale-[0.90]">
            {aspectGrid}
          </div>
        </div>
      </div>

      {/* Gezegenler (Full Width, 3 Columns) */}
      <div className="bg-black/40 border border-[#D4AF37]/20 p-3 rounded-2xl flex flex-col mt-3 shrink-0">
        <h2 className="text-lg font-bold text-[#D4AF37] border-b border-white/10 pb-2 mb-2">Gezegen Yerleşimleri</h2>
        <div className="grid grid-cols-3 gap-x-8 gap-y-1">
          {allPlanets.map((p: any, i: number) => (
            <div key={i} className={`flex items-center px-2 py-1 border-b border-white/5 relative ${i % 3 !== 2 ? 'after:content-[""] after:absolute after:-right-4 after:top-1 after:bottom-1 after:w-px after:bg-white/10' : ''}`}>
              <div className="w-1/3 flex items-center gap-2">
                <span className="text-lg text-[#D4AF37] font-bold w-6 shrink-0 text-center">{PLANET_SYMBOLS[p.name] || ''}</span>
                <span className="font-medium text-xs truncate">{p.name}</span>
              </div>
              <div className="w-1/3 text-center font-bold text-xs truncate" style={{ color: ZODIAC_COLORS[p.sign] }}>{p.sign}</div>
              <div className="w-1/3 text-right text-gray-400 text-[10px] flex flex-col items-end justify-center">
                <div className="whitespace-nowrap">
                  <span className="text-white font-medium">{p.degreeInSign}° {String(p.minutes).padStart(2, '0')}'</span> {p.isRetrograde && <span className="text-red-400 font-bold ml-1">Rx</span>}
                </div>
                <span className="text-[9px] mt-0.5">{p.house}. Ev</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evler (Full Width, 4 Columns) */}
      <div className="bg-black/40 border border-[#D4AF37]/20 p-3 rounded-2xl flex flex-col mt-3 shrink-0">
        <h2 className="text-lg font-bold text-[#D4AF37] border-b border-white/10 pb-2 mb-2">Evler ve Kapsadığı Burçlar</h2>
        <div className="grid grid-cols-4 gap-2">
          {chartData.houses.map((h: any, i: number) => {
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
              <div key={i} className="flex flex-col p-1.5 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-gray-400 text-[10px] font-medium">
                    {h.house}. Ev {h.house === 1 ? '(ASC)' : h.house === 10 ? '(MC)' : h.house === 4 ? '(IC)' : h.house === 7 ? '(DSC)' : ''}
                  </span>
                  <div className="text-right text-[10px] font-medium text-white">
                    {h.degreeInSign}° {String(h.minutes).padStart(2, '0')}'
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-500">Giriş:</span>
                  <span className="font-bold text-[11px]" style={{ color: ZODIAC_COLORS[h.sign] }}>{h.sign}</span>
                </div>
                {spannedSigns.length > 1 && (
                  <div className="mt-0.5 text-[8px] truncate">
                    <span className="text-gray-500 mr-1">İçerdiği:</span>
                    <span className="font-medium text-white/80">{spannedSigns.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Karmik Dinamikler (Full Width, 4 Columns) */}
      <div className="bg-black/40 border border-[#D4AF37]/20 p-3 rounded-2xl flex flex-col mt-3 flex-1 overflow-hidden">
        <h2 className="text-lg font-bold text-[#D4AF37] border-b border-white/10 pb-2 mb-2">Karmik Dinamikler (Açılar)</h2>
        <div className="grid grid-cols-4 gap-2 content-start">
          {chartData.aspects.filter((a: any) => a.orb <= 7).sort((a: any, b: any) => a.orb - b.orb).slice(0, 28).map((a: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-lg border border-white/5">
              <div className="flex flex-col justify-center">
                <div className="font-bold text-white flex items-center gap-1 text-[11px]">
                  <span className="truncate max-w-[50px]">{a.planet1}</span>
                  <span className="text-sm leading-none mx-0.5" style={{ color: ASPECT_COLORS[a.type] }}>{ASPECT_SYMBOLS[a.type]}</span>
                  <span className="truncate max-w-[50px]">{a.planet2}</span>
                </div>
                <span className="text-[8px] text-gray-400 block leading-none mt-0.5">
                  Tol: {a.orb.toFixed(1)}° {a.isExact && <span className="text-[#D4AF37] ml-1 font-bold">(Tam)</span>}
                </span>
              </div>
              <div className="font-bold text-[9px]" style={{ color: ASPECT_COLORS[a.type] }}>{a.type}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});

PrintableChart.displayName = 'PrintableChart';
