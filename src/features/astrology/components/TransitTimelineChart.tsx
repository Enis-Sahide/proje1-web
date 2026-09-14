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
  Lock,
  MapPin,
  Globe,
  RotateCcw
} from 'lucide-react';
import type { TransitTimelineItem } from '@/features/astrology/engine/TransitTimelineEngine';

interface TransitTimelineChartProps {
  items: TransitTimelineItem[];
  startDateStr: string;
  endDateStr: string;
  range: string;
  onRangeChange?: (newRange: '1m' | '3m' | '6m' | '1y') => void;
  isLoading?: boolean;
  isPremium?: boolean;
  onRequirePremium?: () => void;
  isMundane?: boolean;
  userTimezone?: string;
  tzOffsetHours?: number;
}

const PLANET_SYMBOLS: Record<string, string> = {
  'Güneş': '☉', 'Ay': '☽', 'Merkür': '☿', 'Venüs': '♀', 'Mars': '♂', 
  'Jüpiter': '♃', 'Satürn': '♄', 'Uranüs': '♅', 'Neptün': '♆', 'Plüton': '♇',
  'Yükselen (ASC)': 'ASC', 'Tepe Noktası (MC)': 'MC', 'Kuzey Ay Düğümü': '☊',
  'Kiron': '⚷', 'Lilith': '⚸'
};

const ASPECT_SYMBOLS: Record<string, string> = {
  'Kavuşum': '☌',
  'Sekstil': '⚹',
  'Kare': '□',
  'Üçgen': '△',
  'Karşıt': '☍'
};

const ZODIAC_SYMBOLS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓',
  'Koç Burcu': '♈', 'Boğa Burcu': '♉', 'İkizler Burcu': '♊', 'Yengeç Burcu': '♋',
  'Aslan Burcu': '♌', 'Başak Burcu': '♍', 'Terazi Burcu': '♎', 'Akrep Burcu': '♏',
  'Yay Burcu': '♐', 'Oğlak Burcu': '♑', 'Kova Burcu': '♒', 'Balık Burcu': '♓',
};

interface SectionBlock {
  title: string;
  content: string;
  type: 'phase' | 'theme' | 'collective' | 'advice' | 'retro' | 'general';
}

function parseSections(text: string): SectionBlock[] {
  if (!text) return [];
  if (!text.includes('【')) {
    return [{ title: '', content: text.trim(), type: 'general' }];
  }

  const rawBlocks = text.split('【').filter(b => b.trim().length > 0);
  return rawBlocks.map(block => {
    const closeIdx = block.indexOf('】');
    if (closeIdx === -1) {
      return { title: '', content: block.trim(), type: 'general' };
    }
    const title = block.slice(0, closeIdx).trim();
    const content = block.slice(closeIdx + 1).trim();

    let type: SectionBlock['type'] = 'general';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('geçiş evresi') || lowerTitle.includes('evre') || lowerTitle.includes('ingress')) {
      type = 'phase';
    } else if (lowerTitle.includes('tema') || lowerTitle.includes('özet') || lowerTitle.includes('doğa')) {
      type = 'theme';
    } else if (lowerTitle.includes('kolektif') || lowerTitle.includes('toplumsal') || lowerTitle.includes('küresel')) {
      type = 'collective';
    } else if (lowerTitle.includes('tavsiye') || lowerTitle.includes('rehberlik') || lowerTitle.includes('dönüşüm')) {
      type = 'advice';
    } else if (lowerTitle.includes('retro') || lowerTitle.includes('rx')) {
      type = 'retro';
    }

    return { title, content, type };
  });
}

function hasAdviceInDetails(details?: string): boolean {
  if (!details) return false;
  const lower = details.toLowerCase();
  return lower.includes('【bireysel rehberlik') || lower.includes('【bireysel tavsiye') || lower.includes('【rehberlik');
}

function FormattedDetails({ text }: { text?: string }) {
  if (!text) return null;
  const sections = parseSections(text);

  if (sections.length === 1 && sections[0].type === 'general' && !sections[0].title) {
    return <p className="text-xs text-mystic-text-muted leading-relaxed whitespace-pre-wrap">{sections[0].content}</p>;
  }

  return (
    <div className="space-y-3 mt-1.5">
      {sections.map((sec, idx) => {
        switch (sec.type) {
          case 'phase':
            return (
              <div key={idx} className="bg-indigo-950/30 border border-indigo-500/25 rounded-2xl p-3.5 shadow-sm">
                <span className="text-[11px] font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={13} className="text-indigo-400 shrink-0" />
                  {sec.title}
                </span>
                <p className="text-xs text-indigo-100/90 leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            );
          case 'theme':
            return (
              <div key={idx} className="bg-amber-950/20 border border-amber-500/25 rounded-2xl p-3.5 shadow-sm">
                <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Compass size={13} className="text-amber-400 shrink-0" />
                  {sec.title}
                </span>
                <p className="text-xs text-amber-100/90 leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            );
          case 'collective':
            return (
              <div key={idx} className="bg-sky-950/20 border border-sky-500/25 rounded-2xl p-3.5 shadow-sm">
                <span className="text-[11px] font-extrabold text-sky-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Globe size={13} className="text-sky-400 shrink-0" />
                  {sec.title}
                </span>
                <p className="text-xs text-sky-100/90 leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            );
          case 'advice':
            return (
              <div key={idx} className="bg-emerald-950/20 border border-emerald-500/25 rounded-2xl p-3.5 shadow-sm">
                <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  {sec.title}
                </span>
                <p className="text-xs text-emerald-100 leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            );
          case 'retro':
            return (
              <div key={idx} className="bg-purple-950/25 border border-purple-500/30 rounded-2xl p-3.5 shadow-sm">
                <span className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <RotateCcw size={13} className="text-purple-400 shrink-0" />
                  {sec.title}
                </span>
                <p className="text-xs text-purple-100/90 leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            );
          default:
            return (
              <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 shadow-sm">
                {sec.title && (
                  <span className="text-[11px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Info size={13} className="text-[#D4AF37] shrink-0" />
                    {sec.title}
                  </span>
                )}
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            );
        }
      })}
    </div>
  );
}

export default function TransitTimelineChart({
  items,
  startDateStr,
  endDateStr,
  range,
  onRangeChange,
  isLoading = false,
  isPremium = false,
  onRequirePremium,
  isMundane = false,
  userTimezone = 'Europe/Istanbul',
  tzOffsetHours = 3
}: TransitTimelineChartProps) {
  const [selectedItem, setSelectedItem] = useState<TransitTimelineItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'KADERSEL' | 'KISISEL'>('ALL');
  const [aspectFilter, setAspectFilter] = useState<'ALL' | 'HARMONIOUS' | 'CHALLENGING'>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<'ALL' | 'ASPECTS' | 'INGRESS'>('ALL');
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
      // Event Type filter
      if (eventTypeFilter === 'ASPECTS' && item.type === 'İngress') return false;
      if (eventTypeFilter === 'INGRESS' && item.type !== 'İngress') return false;

      // Category filter
      if (categoryFilter === 'KADERSEL' && item.category !== 'Kadersel') return false;
      if (categoryFilter === 'KISISEL' && item.category !== 'Kişisel') return false;

      // Aspect filter
      if (item.type !== 'İngress') {
        if (aspectFilter === 'HARMONIOUS' && !item.isHarmonious) return false;
        if (aspectFilter === 'CHALLENGING' && (item.isHarmonious || item.type === 'Kavuşum')) return false;
      }

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
  }, [items, categoryFilter, aspectFilter, eventTypeFilter, searchQuery]);

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

        {/* Center: Event Type, Category & Aspect Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Event Type (Tümü / Açılar / Burç Geçişleri) */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setEventTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                eventTypeFilter === 'ALL' ? 'bg-white/20 text-white font-bold' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setEventTypeFilter('ASPECTS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                eventTypeFilter === 'ASPECTS' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              Açılar (☌, □, △)
            </button>
            <button
              onClick={() => setEventTypeFilter('INGRESS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                eventTypeFilter === 'INGRESS' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              ⚡ Burç Geçişleri (İngress)
            </button>
          </div>

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
              {isMundane ? 'Büyük Döngüler (Jüpiter, Satürn...)' : 'Kadersel (Jüpiter/Satürn...)'}
            </button>
            <button
              onClick={() => setCategoryFilter('KISISEL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                categoryFilter === 'KISISEL' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              {isMundane ? 'Hızlı / İç Gezegenler (Mars, Venüs...)' : 'Kişisel (Mars/Güneş...)'}
            </button>
          </div>

          {/* Aspect Harmony (Only relevant for aspects) */}
          {eventTypeFilter !== 'INGRESS' && (
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
          )}
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
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                <MapPin size={11} className="text-[#D4AF37]" />
                Zaman Dilimi: <strong className="text-white">{userTimezone}</strong> (UTC{tzOffsetHours >= 0 ? `+${tzOffsetHours}` : tzOffsetHours})
              </span>
              <span className="text-[11px] text-mystic-text-muted">
                • Tüm başlangıç ve zirve saatleri cihazınızın yerel konumuna göre hesaplanmıştır.
              </span>
            </div>
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
              <div className="w-40 sm:w-48 shrink-0 text-xs font-bold text-mystic-text-muted pl-2 sticky left-0 bg-[#0F172A] z-30 py-2 border-r border-white/5">
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
              <div className="absolute inset-0 left-40 sm:left-48 pointer-events-none z-0">
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
                  const isStartedInPast = !isNaN(itemStart) && itemStart < rangeStart;
                  const isEndedInFuture = !isNaN(itemEnd) && itemEnd > rangeEnd;
                  const isPeakInRange = !isNaN(itemPeak) && itemPeak >= rangeStart && itemPeak <= rangeEnd;
                  const peakPercent = isPeakInRange ? ((itemPeak - rangeStart) / totalRangeMs) * 100 : -1;

                  // Color styles
                  let barColor = 'from-emerald-500/80 to-teal-500/80 border-emerald-400/40 text-emerald-100';
                  let iconColor = 'text-emerald-300';
                  if (item.type === 'İngress') {
                    barColor = 'from-cyan-600/80 via-indigo-600/80 to-purple-600/80 border-cyan-400/40 text-cyan-100';
                    iconColor = 'text-cyan-300';
                  } else if (item.type === 'Kavuşum') {
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
                      <div className="w-40 sm:w-48 shrink-0 flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 pr-1.5 sm:pr-3 overflow-hidden sticky left-0 bg-[#0A0A0F] z-20 py-1 rounded-l-lg border-r border-white/5">
                        <span className="text-sm sm:text-base font-bold text-mystic-primary w-4 sm:w-5 text-center shrink-0">
                          {PLANET_SYMBOLS[item.transitPlanet] || '•'}
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-white truncate">
                          {isMundane || item.type === 'İngress' ? item.transitPlanet : `T.${item.transitPlanet}`}
                        </span>
                        <span className="text-[10px] sm:text-xs font-black text-mystic-accent shrink-0">
                          {item.type === 'İngress' ? '➔' : (ASPECT_SYMBOLS[item.type] || item.type)}
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-gray-300 truncate">
                          {item.type === 'İngress' ? item.natalPlanet.replace(' Burcu', '') : (isMundane ? item.natalPlanet : `N.${item.natalPlanet}`)}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#D4AF37] w-4 sm:w-5 text-center shrink-0">
                          {item.type === 'İngress'
                            ? (ZODIAC_SYMBOLS[item.natalPlanet] || '♒')
                            : (PLANET_SYMBOLS[item.natalPlanet] || '•')}
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
                            {isStartedInPast && <span className="text-[10px] opacity-75 mr-0.5 font-black" title="Bu pencereden önce başladı">◀</span>}
                            {item.type === 'İngress' 
                              ? `⚡ ${item.natalPlanet.replace(' Burcu', '')} (${item.durationDays}g)` 
                              : `${item.type} (${item.durationDays}g)`}
                            {isEndedInFuture && <span className="text-[10px] opacity-75 ml-0.5 font-black" title="Bu pencerenin sonrasına uzanıyor">▶</span>}
                          </span>

                          {/* Peak Point Glowing Marker (only if peak falls strictly within active range) */}
                          {isPeakInRange && (
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_#fff] border-2 border-black flex items-center justify-center z-20 group-hover:scale-125 transition-transform"
                              style={{
                                left: `${Math.max(8, Math.min(widthPercent - 8, ((peakPercent - leftPercent) / widthPercent) * 100))}%`
                              }}
                              title={item.type === 'İngress' ? `Merkez Derecesi (15°): ${item.peakDate}${item.peakTime ? ` • Saat: ${item.peakTime}` : ''}` : `Zirve (0° Partil): ${item.peakDate}${item.peakTime ? ` • Saat: ${item.peakTime}` : ''}`}
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
                    {isMundane 
                      ? (selectedItem.category === 'Kadersel' ? 'Büyük Döngü' : 'Hızlı Gezegen') 
                      : `${selectedItem.category} Transit`} • {selectedItem.type}
                  </span>
                  
                  {/* Phase Badge */}
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedItem.phase === 'YAKLASAN'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : selectedItem.phase === 'ZIRVE'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse'
                      : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  }`}>
                    {selectedItem.phase === 'YAKLASAN' && (selectedItem.type === 'İngress' ? '📈 Merkeze Yaklaşıyor' : '📈 Zirveye Yaklaşıyor')}
                    {selectedItem.phase === 'ZIRVE' && (selectedItem.type === 'İngress' ? '⚡ Burç Seyrinde (Aktif)' : '⚡ Tam Zirvede (0°)')}
                    {selectedItem.phase === 'UZAKLASAN' && (selectedItem.type === 'İngress' ? '📉 Burç Çıkışına Yakın' : '📉 Zirvesi Geçti (Çözülüyor)')}
                  </span>

                  <span className="text-xs text-mystic-text-muted">
                    {selectedItem.type === 'İngress' ? (
                      <>Etki: <strong className="text-white">Burç Seyri</strong></>
                    ) : (
                      <>Min Orb: <strong className="text-white">{selectedItem.minOrb}°</strong></>
                    )}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-mystic-primary">{PLANET_SYMBOLS[selectedItem.transitPlanet]}</span>
                  {selectedItem.title}
                  <span className="text-[#D4AF37]">
                    {selectedItem.type === 'İngress'
                      ? (ZODIAC_SYMBOLS[selectedItem.natalPlanet] || '')
                      : PLANET_SYMBOLS[selectedItem.natalPlanet]}
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-mystic-text-muted hover:text-white p-1 rounded-lg bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Key Dates Badge Box with Historical Accuracy & Hourly Precision */}
            <div className="grid grid-cols-3 gap-3 bg-black/50 p-4 rounded-2xl border border-white/5 mb-5 text-center">
              <div>
                <span className="text-[10px] text-mystic-text-muted block uppercase tracking-wider mb-0.5">Başlangıç</span>
                <span className="text-xs font-bold text-gray-200 block">
                  {selectedItem.startDate}
                  {selectedItem.startTime && (
                    <span className="text-[10px] text-gray-400 font-mono block sm:inline sm:ml-1 font-normal">
                      ({selectedItem.startTime})
                    </span>
                  )}
                </span>
                {selectedItem.isStartedInPast ? (
                  <span className="text-[9px] text-amber-400 font-semibold block mt-0.5">Geçmişte başladı</span>
                ) : selectedItem.startDate === new Date().toISOString().split('T')[0] ? (
                  <span className="text-[9px] text-emerald-400 font-semibold block mt-0.5">
                    {selectedItem.startTime && selectedItem.startTime > `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
                      ? `Bugün ${selectedItem.startTime}'te başlayacak`
                      : `Bugün ${selectedItem.startTime ? `${selectedItem.startTime}'te ` : ''}başladı`}
                  </span>
                ) : (
                  <span className="text-[9px] text-sky-400 font-semibold block mt-0.5">Başlaması bekleniyor</span>
                )}
              </div>
              <div className="border-x border-white/10">
                <span className="text-[10px] text-mystic-primary font-extrabold block uppercase tracking-wider flex items-center justify-center gap-1 mb-0.5">
                  <Sparkles size={10} /> {selectedItem.type === 'İngress' ? 'Merkez (15°)' : 'Zirve (0°)'}
                </span>
                <span className="text-xs font-black text-[#D4AF37] block">
                  {selectedItem.peakDate}
                  {selectedItem.peakTime && (
                    <span className="text-[11px] text-amber-200/90 font-mono block sm:inline sm:ml-1 font-bold">
                      • {selectedItem.peakTime}
                    </span>
                  )}
                </span>
                <span className={`text-[9px] font-semibold block mt-0.5 ${selectedItem.isPeakInPast ? 'text-sky-400' : 'text-emerald-400'}`}>
                  {selectedItem.isPeakInPast 
                    ? (selectedItem.type === 'İngress' ? 'Merkez geride kaldı' : 'Zirvesi tamamlandı') 
                    : (selectedItem.type === 'İngress' ? 'Merkez bekleniyor' : 'Zirve bekleniyor')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-mystic-text-muted block uppercase tracking-wider mb-0.5">Bitiş</span>
                <span className="text-xs font-bold text-gray-200 block">
                  {selectedItem.endDate}
                  {selectedItem.endTime && (
                    <span className="text-[10px] text-gray-400 font-mono block sm:inline sm:ml-1 font-normal">
                      ({selectedItem.endTime})
                    </span>
                  )}
                </span>
                <span className="text-[9px] text-mystic-text-muted block mt-0.5">Toplam {selectedItem.durationDays} gün</span>
              </div>
            </div>

            {/* Location & Timezone Note */}
            <div className="text-[10px] text-mystic-text-muted text-center mb-5 flex items-center justify-center gap-1.5 bg-white/[0.03] py-2 px-3 rounded-xl border border-white/5">
              <MapPin size={11} className="text-[#D4AF37] shrink-0" />
              <span>Tüm saatler cihazınızın yerel saat dilimine (<strong className="text-gray-200">{userTimezone}</strong> • UTC{tzOffsetHours >= 0 ? `+${tzOffsetHours}` : tzOffsetHours}) göre hesaplanmıştır.</span>
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
                    <strong className="text-white block mb-2 text-xs uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <Sparkles size={13} className="text-[#D4AF37]" /> Kadersel & Psikolojik Dinamik:
                    </strong>
                    <FormattedDetails text={selectedItem.details} />
                  </div>
                  {selectedItem.advice && !hasAdviceInDetails(selectedItem.details) && (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-500/25 rounded-2xl">
                      <strong className="text-emerald-400 block mb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5 font-bold">
                        <CheckCircle2 size={13} /> Rehberlik & Tavsiye:
                      </strong>
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
