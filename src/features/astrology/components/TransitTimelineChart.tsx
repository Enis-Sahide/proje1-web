"use client";

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  Compass, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Layers, 
  TrendingUp, 
  Search,
  ChevronRight,
  Info
} from 'lucide-react';
import { TransitTimelineItem } from '@/features/astrology/engine/TransitTimelineEngine';

interface TransitTimelineChartProps {
  items: TransitTimelineItem[];
  startDateStr: string;
  endDateStr: string;
  range: string;
  onRangeChange?: (newRange: '1m' | '3m' | '6m' | '1y') => void;
  isLoading?: boolean;
}

const PLANET_SYMBOLS: Record<string, string> = {
  'Güneş': '☉', 'Ay': '☽', 'Merkür': '☿', 'Venüs': '♀', 'Mars': '♂', 
  'Jüpiter': '♃', 'Satürn': '♄', 'Uranüs': '♅', 'Neptün': '♆', 'Plüton': '♇',
  'Yükselen (ASC)': 'ASC', 'Tepe Noktası (MC)': 'MC', 'Kuzey Ay Düğümü': '☊',
  'Kiron': '⚷'
};

const ASPECT_SYMBOLS: Record<string, string> = {
  'Kavuşum': '☌',
  'Sekstil': '⚹',
  'Kare': '□',
  'Üçgen': '△',
  'Karşıt': '☍'
};

export default function TransitTimelineChart({
  items,
  startDateStr,
  endDateStr,
  range,
  onRangeChange,
  isLoading = false
}: TransitTimelineChartProps) {
  const [selectedItem, setSelectedItem] = useState<TransitTimelineItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'KADERSEL' | 'KISISEL'>('ALL');
  const [aspectFilter, setAspectFilter] = useState<'ALL' | 'HARMONIOUS' | 'CHALLENGING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const rangeStart = useMemo(() => new Date(startDateStr).getTime(), [startDateStr]);
  const rangeEnd = useMemo(() => new Date(endDateStr).getTime(), [endDateStr]);
  const totalRangeMs = Math.max(1, rangeEnd - rangeStart);

  const today = useMemo(() => {
    const t = new Date();
    return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())).getTime();
  }, []);

  const todayPercent = useMemo(() => {
    if (today < rangeStart) return -1;
    if (today > rangeEnd) return 101;
    return ((today - rangeStart) / totalRangeMs) * 100;
  }, [today, rangeStart, rangeEnd, totalRangeMs]);

  // Date column headers generator
  const dateColumns = useMemo(() => {
    const cols: { label: string; dateStr: string; percent: number }[] = [];
    const numCols = range === '1m' ? 6 : range === '3m' ? 6 : 8;
    for (let i = 0; i <= numCols; i++) {
      const time = rangeStart + (i / numCols) * totalRangeMs;
      const d = new Date(time);
      const day = d.getDate();
      const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      cols.push({
        label: `${day} ${monthNames[d.getMonth()]}`,
        dateStr: d.toISOString().split('T')[0],
        percent: (i / numCols) * 100
      });
    }
    return cols;
  }, [rangeStart, totalRangeMs, range]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (categoryFilter === 'KADERSEL' && item.category !== 'Kadersel') return false;
      if (categoryFilter === 'KISISEL' && item.category !== 'Kişisel') return false;

      // Aspect filter
      if (aspectFilter === 'HARMONIOUS' && !item.isHarmonious) return false;
      if (aspectFilter === 'CHALLENGING' && (item.isHarmonious || item.type === 'Kavuşum')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchChakra = item.chakraLayer.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchChakra) return false;
      }

      return true;
    });
  }, [items, categoryFilter, aspectFilter, searchQuery]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Filter Bar */}
      <div className="bg-mystic-surface/60 backdrop-blur-md border border-mystic-surface-light p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-mystic-text-muted mr-1 flex items-center gap-1.5">
            <Calendar size={14} className="text-mystic-primary" /> Zaman Aralığı:
          </span>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            {[
              { id: '1m', label: '1 Ay' },
              { id: '3m', label: '3 Ay' },
              { id: '6m', label: '6 Ay' },
              { id: '1y', label: '1 Yıl' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => onRangeChange?.(r.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  range === r.id 
                    ? 'bg-mystic-primary text-black shadow-md' 
                    : 'text-mystic-text-muted hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Category & Aspect Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                categoryFilter === 'ALL' ? 'bg-white/20 text-white font-bold' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              Tüm Gezegenler
            </button>
            <button
              onClick={() => setCategoryFilter('KADERSEL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                categoryFilter === 'KADERSEL' ? 'bg-[#9333EA]/30 text-purple-300 font-bold border border-purple-500/30' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              Kadersel (Jüpiter/Satürn/Plüton...)
            </button>
            <button
              onClick={() => setCategoryFilter('KISISEL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                categoryFilter === 'KISISEL' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              Kişisel (Mars/Güneş...)
            </button>
          </div>

          {/* Aspect Harmony */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setAspectFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aspectFilter === 'ALL' ? 'bg-white/10 text-white font-bold' : 'text-mystic-text-muted'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setAspectFilter('HARMONIOUS')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aspectFilter === 'HARMONIOUS' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-mystic-text-muted'
              }`}
            >
              Destekler (🟢)
            </button>
            <button
              onClick={() => setAspectFilter('CHALLENGING')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aspectFilter === 'CHALLENGING' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-mystic-text-muted'
              }`}
            >
              Sınavlar (🔴)
            </button>
          </div>
        </div>

        {/* Right: Search Box */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mystic-text-muted" />
          <input
            type="text"
            placeholder="Gezegen veya katman ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-mystic-text-muted/60 focus:outline-none focus:border-mystic-primary/60 w-full md:w-48"
          />
        </div>

      </div>

      {/* Main Gantt Timeline Container */}
      <div className="bg-mystic-surface/75 backdrop-blur-md border border-mystic-surface-light rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Timeline Header Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="text-mystic-primary" size={20} />
              Kozmik Zaman Çizelgesi (Gantt)
            </h3>
            <p className="text-xs text-mystic-text-muted">
              Yatay çubuklar açının etki süresini, parlayan işaretler ise açının doruk noktasını (0° Partil) temsil eder.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Destek
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span> Sınav / Kriz
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span> Kavuşum
            </span>
          </div>
        </div>

        {/* Gantt Chart Body with Calendar Grid */}
        <div className="relative w-full overflow-x-auto select-none min-w-[700px]">
          
          {/* Calendar Dates Axis Header */}
          <div className="relative h-10 border-b border-white/10 flex items-center mb-3">
            <div className="w-48 shrink-0 text-xs font-bold text-mystic-text-muted pl-2">
              Transit & Açı
            </div>
            <div className="relative flex-grow h-full">
              {dateColumns.map((col, idx) => (
                <div 
                  key={`col-${idx}`} 
                  className="absolute top-0 bottom-0 flex flex-col justify-center text-[10px] font-semibold text-mystic-text-muted"
                  style={{ left: `${col.percent}%`, transform: 'translateX(-50%)' }}
                >
                  <span>{col.label}</span>
                </div>
              ))}

              {/* Today vertical indicator */}
              {todayPercent >= 0 && todayPercent <= 100 && (
                <div 
                  className="absolute top-0 bottom-0 z-30 flex flex-col items-center"
                  style={{ left: `${todayPercent}%`, transform: 'translateX(-50%)' }}
                >
                  <span className="bg-mystic-primary text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                    Bugün
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Grid Guidelines & Content Rows */}
          <div className="relative flex flex-col gap-2.5 py-2">
            
            {/* Background Grid Lines */}
            <div className="absolute inset-0 left-48 pointer-events-none z-0">
              {dateColumns.map((col, idx) => (
                <div 
                  key={`grid-${idx}`} 
                  className="absolute top-0 bottom-0 border-l border-white/5"
                  style={{ left: `${col.percent}%` }}
                />
              ))}

              {/* Today Line */}
              {todayPercent >= 0 && todayPercent <= 100 && (
                <div 
                  className="absolute top-0 bottom-0 border-l-2 border-dashed border-mystic-primary/60 z-20"
                  style={{ left: `${todayPercent}%` }}
                />
              )}
            </div>

            {/* Rows */}
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center text-mystic-text-muted text-sm">
                Seçilen kriterlere uygun aktif bir transit bulunamadı.
              </div>
            ) : (
              filteredItems.map(item => {
                const itemStart = new Date(item.startDate).getTime();
                const itemEnd = new Date(item.endDate).getTime();
                const itemPeak = new Date(item.peakDate).getTime();

                // Compute relative percentages
                const startClamped = Math.max(itemStart, rangeStart);
                const endClamped = Math.min(itemEnd, rangeEnd);

                const leftPercent = Math.max(0, ((startClamped - rangeStart) / totalRangeMs) * 100);
                const widthPercent = Math.max(1.5, ((endClamped - startClamped) / totalRangeMs) * 100);
                const peakPercent = Math.max(0, Math.min(100, ((itemPeak - rangeStart) / totalRangeMs) * 100));

                // Color styles
                let barColor = 'from-emerald-500/80 to-teal-500/80 border-emerald-400/40 text-emerald-100';
                let iconColor = 'text-emerald-300';
                if (item.type === 'Kavuşum') {
                  barColor = 'from-amber-500/80 to-yellow-500/80 border-amber-300/40 text-amber-100';
                  iconColor = 'text-amber-300';
                } else if (!item.isHarmonious) {
                  barColor = 'from-rose-600/80 to-red-500/80 border-rose-400/40 text-rose-100';
                  iconColor = 'text-rose-300';
                }

                return (
                  <div 
                    key={item.id} 
                    className="relative flex items-center h-9 hover:bg-white/[0.03] rounded-xl transition-colors cursor-pointer group z-10"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Left Column Label */}
                    <div className="w-48 shrink-0 flex items-center gap-2 pl-2 pr-4 overflow-hidden">
                      <span className="text-base font-bold text-mystic-primary w-5 text-center shrink-0">
                        {PLANET_SYMBOLS[item.transitPlanet] || '•'}
                      </span>
                      <span className="text-xs font-semibold text-white truncate">
                        T.{item.transitPlanet}
                      </span>
                      <span className="text-xs font-black text-mystic-accent shrink-0">
                        {ASPECT_SYMBOLS[item.type] || item.type}
                      </span>
                      <span className="text-xs font-semibold text-gray-300 truncate">
                        N.{item.natalPlanet}
                      </span>
                      <span className="text-base font-bold text-[#D4AF37] w-5 text-center shrink-0">
                        {PLANET_SYMBOLS[item.natalPlanet] || '•'}
                      </span>
                    </div>

                    {/* Right Column: Bar Track */}
                    <div className="relative flex-grow h-full flex items-center">
                      
                      {/* Bar */}
                      <div 
                        className={`absolute h-7 rounded-xl bg-gradient-to-r ${barColor} border shadow-lg flex items-center justify-between px-2 transition-all duration-300 group-hover:scale-[1.01] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          minWidth: '36px'
                        }}
                      >
                        <span className="text-[10px] font-extrabold truncate drop-shadow-sm flex items-center gap-1">
                          {item.type} ({item.durationDays}g)
                        </span>

                        {/* Peak Point Glowing Marker */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_#fff] border-2 border-black flex items-center justify-center z-20 group-hover:scale-125 transition-transform"
                          style={{
                            left: `${Math.max(8, Math.min(widthPercent - 8, ((peakPercent - leftPercent) / widthPercent) * 100))}%`
                          }}
                          title={`Zirve (0° Partil): ${item.peakDate}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

      </div>

      {/* Interactive Detail Modal / Drawer */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-mystic-dark border border-mystic-primary/30 rounded-3xl max-w-xl w-full p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    selectedItem.isHarmonious 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : selectedItem.type === 'Kavuşum'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {selectedItem.category} Transit • {selectedItem.type}
                  </span>
                  <span className="text-xs text-mystic-text-muted">
                    Min Orb: <strong className="text-white">{selectedItem.minOrb}°</strong>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-mystic-primary">{PLANET_SYMBOLS[selectedItem.transitPlanet]}</span>
                  {selectedItem.title}
                  <span className="text-[#D4AF37]">{PLANET_SYMBOLS[selectedItem.natalPlanet]}</span>
                </h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-mystic-text-muted hover:text-white p-1 rounded-lg bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Key Dates Badge Box */}
            <div className="grid grid-cols-3 gap-3 bg-black/50 p-4 rounded-2xl border border-white/5 mb-5 text-center">
              <div>
                <span className="text-[10px] text-mystic-text-muted block uppercase tracking-wider">Başlangıç</span>
                <span className="text-xs font-bold text-gray-200">{selectedItem.startDate}</span>
              </div>
              <div className="border-x border-white/10">
                <span className="text-[10px] text-mystic-primary font-extrabold block uppercase tracking-wider flex items-center justify-center gap-1">
                  <Sparkles size={10} /> Zirve (0°)
                </span>
                <span className="text-xs font-black text-[#D4AF37]">{selectedItem.peakDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-mystic-text-muted block uppercase tracking-wider">Bitiş</span>
                <span className="text-xs font-bold text-gray-200">{selectedItem.endDate}</span>
              </div>
            </div>

            {/* 7Layers Chakra & Body Layer Connection */}
            <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 p-4 rounded-2xl mb-5 flex items-start gap-3">
              <Layers className="text-purple-400 shrink-0 mt-0.5" size={20} />
              <div>
                <span className="text-xs font-extrabold text-purple-300 block mb-0.5">
                  7Layers İnisiyasyon & Katman Etkisi
                </span>
                <p className="text-xs text-purple-100/90 leading-relaxed">
                  {selectedItem.chakraLayer}
                </p>
              </div>
            </div>

            {/* Content & Interpretation */}
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed mb-6">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5">
                <strong className="text-white block mb-1">Dönemin Ana Teması:</strong>
                <p className="text-xs text-gray-300 leading-relaxed">{selectedItem.summary}</p>
              </div>
              <div>
                <strong className="text-white block mb-1 text-xs uppercase tracking-wider">Kadersel & Psikolojik Dinamik:</strong>
                <p className="text-xs text-mystic-text-muted leading-relaxed whitespace-pre-wrap">{selectedItem.details}</p>
              </div>
              {selectedItem.advice && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <strong className="text-emerald-400 block mb-1.5 text-xs uppercase tracking-wider">Rehberlik & Tavsiye:</strong>
                  <p className="text-xs text-emerald-100 leading-relaxed whitespace-pre-line">{selectedItem.advice}</p>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors text-xs uppercase tracking-wider"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
