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
  Info,
  Lock
} from 'lucide-react';
import { TransitTimelineItem } from '@/features/astrology/engine/TransitTimelineEngine';

interface TransitTimelineChartProps {
  items: TransitTimelineItem[];
  startDateStr: string;
  endDateStr: string;
  range: string;
  onRangeChange?: (newRange: '1m' | '3m' | '6m' | '1y') => void;
  isLoading?: boolean;
  isPremium?: boolean;
  onRequirePremium?: () => void;
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
  isLoading = false,
  isPremium = false,
  onRequirePremium
}: TransitTimelineChartProps) {
  const [selectedItem, setSelectedItem] = useState<TransitTimelineItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'KADERSEL' | 'KISISEL'>('ALL');
  const [aspectFilter, setAspectFilter] = useState<'ALL' | 'HARMONIOUS' | 'CHALLENGING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const rangeStart = useMemo(() => {
    const t = new Date(startDateStr).getTime();
    return isNaN(t) ? Date.now() : t;
  }, [startDateStr]);

  const rangeEnd = useMemo(() => {
    const t = new Date(endDateStr).getTime();
    return isNaN(t) ? rangeStart + 30 * 24 * 60 * 60 * 1000 : Math.max(t, rangeStart + 24 * 60 * 60 * 1000);
  }, [endDateStr, rangeStart]);

  const totalRangeMs = Math.max(86400000, rangeEnd - rangeStart);

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
      const day = d.getDate() || 1;
      const mIdx = isNaN(d.getMonth()) ? 0 : d.getMonth();
      const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
      cols.push({
        label: `${day} ${monthNames[mIdx]}`,
        dateStr,
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
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchSummary = (item.summary || '').toLowerCase().includes(q);
        const matchChakra = (item.chakraLayer || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchChakra) return false;
      }

      return true;
    });
  }, [items, categoryFilter, aspectFilter, searchQuery]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Filter Bar */}
      <div className="bg-mystic-surface/60 backdrop-blur-md border border-mystic-surface-light p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        
        {/* Left: Range Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-mystic-text-muted mr-1 flex items-center gap-1.5 whitespace-nowrap">
            <Calendar size={14} className="text-mystic-primary" /> Zaman Aralığı:
          </span>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full">
            {[
              { id: '1m', label: '1 Ay', isLocked: false },
              { id: '3m', label: '3 Ay', isLocked: !isPremium },
              { id: '6m', label: '6 Ay', isLocked: !isPremium },
              { id: '1y', label: '1 Yıl', isLocked: !isPremium },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => {
                  if (r.isLocked) {
                    onRequirePremium?.();
                  } else {
                    onRangeChange?.(r.id as any);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  range === r.id 
                    ? 'bg-mystic-primary text-black shadow-md' 
                    : r.isLocked
                    ? 'text-mystic-text-muted/60 hover:text-mystic-primary/80 hover:bg-white/5 cursor-pointer'
                    : 'text-mystic-text-muted hover:text-white'
                }`}
              >
                <span>{r.label}</span>
                {r.isLocked && <Lock size={10} className="text-[#D4AF37]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Category & Aspect Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                categoryFilter === 'ALL' ? 'bg-white/20 text-white font-bold' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setCategoryFilter('KADERSEL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                categoryFilter === 'KADERSEL' ? 'bg-[#9333EA]/30 text-purple-300 font-bold border border-purple-500/30' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              Kadersel (Jüpiter/Satürn...)
            </button>
            <button
              onClick={() => setCategoryFilter('KISISEL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                categoryFilter === 'KISISEL' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              Kişisel (Mars/Güneş...)
            </button>
          </div>

          {/* Aspect Harmony */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setAspectFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                aspectFilter === 'ALL' ? 'bg-white/10 text-white font-bold' : 'text-mystic-text-muted'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setAspectFilter('HARMONIOUS')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                aspectFilter === 'HARMONIOUS' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-mystic-text-muted'
              }`}
            >
              Destek (🟢)
            </button>
            <button
              onClick={() => setAspectFilter('CHALLENGING')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                aspectFilter === 'CHALLENGING' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-mystic-text-muted'
              }`}
            >
              Sınav (🔴)
            </button>
          </div>
        </div>

        {/* Right: Search Box */}
        <div className="relative w-full xl:w-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mystic-text-muted" />
          <input
            type="text"
            placeholder="Gezegen veya katman ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-mystic-text-muted/60 focus:outline-none focus:border-mystic-primary/60 w-full xl:w-48"
          />
        </div>

      </div>

      {/* Main Gantt Timeline Container */}
      <div className="bg-mystic-surface/75 backdrop-blur-md border border-mystic-surface-light rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col w-full max-w-full">
        
        {/* Timeline Header Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Compass className="text-mystic-primary shrink-0" size={20} />
              Kozmik Zaman Çizelgesi (Gantt)
            </h3>
            <p className="text-xs text-mystic-text-muted mt-0.5">
              Yatay çubuklar açının etki süresini, parlayan işaretler doruk noktasını (0° Partil) temsil eder.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs">
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

        {/* Mobile Horizontal Scroll Cue */}
        <div className="flex sm:hidden items-center justify-between text-[11px] text-mystic-primary/90 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5 mb-3">
          <span>👈 Takvimi parmağınızla sağa-sola kaydırın 👉</span>
        </div>

        {/* Gantt Chart Body with Calendar Grid - Overflow isolated to inner canvas */}
        <div className="relative w-full overflow-x-auto select-none custom-scrollbar touch-pan-x pb-3">
          <div className="min-w-[660px] sm:min-w-[760px] relative">
          
            {/* Calendar Dates Axis Header */}
            <div className="relative h-10 border-b border-white/10 flex items-center mb-3">
              <div className="w-36 sm:w-44 shrink-0 text-xs font-bold text-mystic-text-muted pl-2 sticky left-0 bg-[#0F172A] z-30 py-2 border-r border-white/5">
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
              <div className="absolute inset-0 left-36 sm:left-44 pointer-events-none z-0">
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

                  // Compute relative percentages safely
                  const startClamped = Math.max(isNaN(itemStart) ? rangeStart : itemStart, rangeStart);
                  const endClamped = Math.min(isNaN(itemEnd) ? rangeEnd : itemEnd, rangeEnd);

                  const leftPercent = Math.max(0, ((startClamped - rangeStart) / totalRangeMs) * 100);
                  const widthPercent = Math.max(1.5, ((endClamped - startClamped) / totalRangeMs) * 100);
                  const peakPercent = Math.max(0, Math.min(100, isNaN(itemPeak) ? 0 : ((itemPeak - rangeStart) / totalRangeMs) * 100));

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
                      {/* Left Column Label (Sticky for easy navigation on small screens) */}
                      <div className="w-36 sm:w-44 shrink-0 flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-4 overflow-hidden sticky left-0 bg-[#0A0A0F] z-20 py-1 rounded-l-lg border-r border-white/5">
                        <span className="text-sm sm:text-base font-bold text-mystic-primary w-4 sm:w-5 text-center shrink-0">
                          {PLANET_SYMBOLS[item.transitPlanet] || '•'}
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-white truncate">
                          T.{item.transitPlanet}
                        </span>
                        <span className="text-[10px] sm:text-xs font-black text-mystic-accent shrink-0">
                          {ASPECT_SYMBOLS[item.type] || item.type}
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-gray-300 truncate">
                          N.{item.natalPlanet}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#D4AF37] w-4 sm:w-5 text-center shrink-0">
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
                            {item.isStartedInPast && <span className="text-[10px] opacity-75 mr-0.5 font-black">◀</span>}
                            {item.type} ({item.durationDays}g)
                          </span>

                          {/* Peak Point Glowing Marker (only if peak falls within range) */}
                          {!item.isPeakInPast && peakPercent >= leftPercent && peakPercent <= (leftPercent + widthPercent) && (
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_#fff] border-2 border-black flex items-center justify-center z-20 group-hover:scale-125 transition-transform"
                              style={{
                                left: `${Math.max(8, Math.min(widthPercent - 8, ((peakPercent - leftPercent) / widthPercent) * 100))}%`
                              }}
                              title={`Zirve (0° Partil): ${item.peakDate}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}

            </div>
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
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    selectedItem.isHarmonious 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : selectedItem.type === 'Kavuşum'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {selectedItem.category} Transit • {selectedItem.type}
                  </span>
                  
                  {/* Phase Badge */}
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedItem.phase === 'YAKLASAN'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : selectedItem.phase === 'ZIRVE'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse'
                      : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  }`}>
                    {selectedItem.phase === 'YAKLASAN' && '📈 Zirveye Yaklaşıyor'}
                    {selectedItem.phase === 'ZIRVE' && '⚡ Tam Zirvede (0°)'}
                    {selectedItem.phase === 'UZAKLASAN' && '📉 Zirvesi Geçti (Çözülüyor)'}
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

            {/* Key Dates Badge Box with Historical Accuracy */}
            <div className="grid grid-cols-3 gap-3 bg-black/50 p-4 rounded-2xl border border-white/5 mb-5 text-center">
              <div>
                <span className="text-[10px] text-mystic-text-muted block uppercase tracking-wider mb-0.5">Başlangıç</span>
                <span className="text-xs font-bold text-gray-200 block">{selectedItem.startDate}</span>
                {selectedItem.isStartedInPast && (
                  <span className="text-[9px] text-amber-400 font-semibold block mt-0.5">Geçmişte başladı</span>
                )}
              </div>
              <div className="border-x border-white/10">
                <span className="text-[10px] text-mystic-primary font-extrabold block uppercase tracking-wider flex items-center justify-center gap-1 mb-0.5">
                  <Sparkles size={10} /> Zirve (0°)
                </span>
                <span className="text-xs font-black text-[#D4AF37] block">{selectedItem.peakDate}</span>
                <span className={`text-[9px] font-semibold block mt-0.5 ${selectedItem.isPeakInPast ? 'text-sky-400' : 'text-emerald-400'}`}>
                  {selectedItem.isPeakInPast ? 'Zirvesi tamamlandı' : 'Zirve bekleniyor'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-mystic-text-muted block uppercase tracking-wider mb-0.5">Bitiş</span>
                <span className="text-xs font-bold text-gray-200 block">{selectedItem.endDate}</span>
                <span className="text-[9px] text-mystic-text-muted block mt-0.5">Toplam {selectedItem.durationDays} gün</span>
              </div>
            </div>

            {/* Dönemin Temel Özeti (Herkese Açık) */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-5">
              <strong className="text-white text-xs block mb-1.5 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                <Info size={14} className="text-mystic-primary" /> Dönemin Temel Özeti:
              </strong>
              <p className="text-xs text-gray-300 leading-relaxed">{selectedItem.summary}</p>
            </div>

            {/* 7Layers Çakra Reçetesi & Derin Dinamikler (Premium veya Kilitli) */}
            {isPremium ? (
              <>
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
              </>
            ) : (
              /* Kilitli Freemium Kartı */
              <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-6 shadow-xl">
                {/* Arka plan bulanık içerik simülasyonu */}
                <div className="filter blur-sm select-none opacity-25 pointer-events-none p-5 space-y-4 bg-black/50">
                  <div className="h-14 bg-purple-900/30 rounded-xl border border-purple-500/30 p-3">
                    <span className="h-3 w-32 bg-purple-400/50 block rounded mb-2"></span>
                    <span className="h-2 w-48 bg-purple-200/30 block rounded"></span>
                  </div>
                  <div className="space-y-2">
                    <span className="h-3 w-40 bg-white/40 block rounded"></span>
                    <span className="h-2 w-full bg-white/20 block rounded"></span>
                    <span className="h-2 w-3/4 bg-white/20 block rounded"></span>
                  </div>
                  <div className="h-16 bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-3">
                    <span className="h-3 w-28 bg-emerald-400/50 block rounded mb-2"></span>
                    <span className="h-2 w-5/6 bg-emerald-200/30 block rounded"></span>
                  </div>
                </div>

                {/* Ön plan Kilit Daveti */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37]/20 to-[#0EA5E9]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-3 shadow-lg">
                    <Lock size={22} />
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1.5">7Layers İnisiyasyon & Derin Rehberlik Kilitli</h4>
                  <p className="text-[11px] text-mystic-text-muted max-w-xs mb-4 leading-relaxed">
                    Bu kadersel transitin Çakra/Sefirot katman etkisi, derin psikolojik dinamikleri ve eylem adımları <strong>Çıraklık (Apprentice)</strong> seviyesi ve üzeri üyelere özeldir.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      onRequirePremium?.();
                    }}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#0EA5E9] hover:opacity-95 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all transform hover:scale-105"
                  >
                    Seviyeni Yükselt & Kilidi Aç
                  </button>
                </div>
              </div>
            )}

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
