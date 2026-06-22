'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Moon, Calendar, Sparkles, AlertCircle, Globe } from 'lucide-react';
import { useContent } from '@/lib/useContent';

interface MoonPhaseEvent {
  utcDate: string; // ISO format UTC date
  phase: 'new_moon' | 'full_moon' | 'solar_eclipse' | 'lunar_eclipse';
  phaseName: string;
  sign: string;
  signSymbol: string;
  degree: string;
}

// MOON_PHASES_2026 içeriği DB'den gelir (/api/content/moon-phases)

export default function MoonCyclesWidget() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new_moon' | 'full_moon' | 'eclipse'>('all');
  const [isTurkeyTime, setIsTurkeyTime] = useState(true);
  const [nextPhase, setNextPhase] = useState<MoonPhaseEvent | null>(null);
  const { data: moonData } = useContent<MoonPhaseEvent[]>('/api/content/moon-phases');
  const MOON_PHASES_2026 = moonData ?? [];

  const containerRef = useRef<HTMLDivElement>(null);
  const nextItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTimeZoneLabel = (utcDateStr: string) => {
    if (isTurkeyTime) {
      return 'TRT';
    }
    return 'UTC';
  };

  const getFormattedData = (item: MoonPhaseEvent) => {
    const dateObj = new Date(item.utcDate);
    const options: Intl.DateTimeFormatOptions = { hour12: false };
    
    // TRT uses Europe/Istanbul, Standard uses UTC (Universal Time / UT)
    options.timeZone = isTurkeyTime ? 'Europe/Istanbul' : 'UTC';
    
    const day = dateObj.toLocaleDateString('tr-TR', { ...options, day: 'numeric' });
    const month = dateObj.toLocaleDateString('tr-TR', { ...options, month: 'long' });
    const shortMonth = dateObj.toLocaleDateString('tr-TR', { ...options, month: 'short' });
    
    const time = dateObj.toLocaleTimeString('tr-TR', {
      ...options,
      hour: '2-digit',
      minute: '2-digit'
    });

    let localDateStr = '';
    try {
      localDateStr = dateObj.toLocaleDateString('en-CA', options).split(',')[0];
    } catch (e) {
      localDateStr = dateObj.toISOString().split('T')[0];
    }

    return {
      dayMonth: `${day} ${shortMonth}`,
      fullDate: `${day} ${month} 2026`,
      time,
      dateStr: localDateStr
    };
  };

  useEffect(() => {
    if (!mounted) return;
    
    // Find next upcoming phase based on selection timezone
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = MOON_PHASES_2026.find(item => {
      const data = getFormattedData(item);
      return data.dateStr >= todayStr;
    });

    if (upcoming) {
      setNextPhase(upcoming);
    }
  }, [mounted, isTurkeyTime, moonData]);

  useEffect(() => {
    if (!mounted) return;
    
    if (nextItemRef.current) {
      setTimeout(() => {
        nextItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  }, [filter, nextPhase, isTurkeyTime, mounted]);

  if (!mounted) {
    return (
      <div className="bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light w-full max-w-sm shadow-xl min-h-[380px] animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-mystic-surface-light" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-mystic-surface-light rounded w-2/3" />
            <div className="h-3 bg-mystic-surface-light rounded w-1/2" />
          </div>
        </div>
        <div className="h-16 bg-mystic-surface-light rounded-xl mb-4" />
        <div className="h-8 bg-mystic-surface-light rounded-lg mb-4" />
        <div className="space-y-2">
          <div className="h-10 bg-mystic-surface-light rounded-xl" />
          <div className="h-10 bg-mystic-surface-light rounded-xl" />
        </div>
      </div>
    );
  }

  const filteredPhases = MOON_PHASES_2026.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'new_moon') return item.phase === 'new_moon';
    if (filter === 'full_moon') return item.phase === 'full_moon';
    if (filter === 'eclipse') return item.phase === 'solar_eclipse' || item.phase === 'lunar_eclipse';
    return true;
  });

  const getPhaseIcon = (phase: MoonPhaseEvent['phase']) => {
    switch (phase) {
      case 'new_moon':
        return <span className="text-lg text-neutral-500">🌑</span>;
      case 'full_moon':
        return <span className="text-lg text-yellow-200">🌕</span>;
      case 'solar_eclipse':
        return (
          <span className="relative flex items-center justify-center">
            <span className="text-lg text-orange-400">🌑</span>
            <Sparkles size={10} className="absolute -top-1 -right-1 text-orange-400 animate-pulse" />
          </span>
        );
      case 'lunar_eclipse':
        return (
          <span className="relative flex items-center justify-center">
            <span className="text-lg text-red-400">🌕</span>
            <Sparkles size={10} className="absolute -top-1 -right-1 text-red-400 animate-pulse" />
          </span>
        );
    }
  };

  const getPhaseStyle = (phase: MoonPhaseEvent['phase']) => {
    switch (phase) {
      case 'new_moon':
        return 'text-neutral-300 bg-neutral-950/40 border border-neutral-800/30';
      case 'full_moon':
        return 'text-yellow-200 bg-yellow-500/5 border border-yellow-500/20';
      case 'solar_eclipse':
        return 'text-orange-300 bg-orange-500/10 border border-orange-500/30';
      case 'lunar_eclipse':
        return 'text-red-300 bg-red-500/10 border border-red-500/30';
    }
  };

  const nextPhaseData = nextPhase ? getFormattedData(nextPhase) : null;

  return (
    <div className="bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light w-full max-w-sm shadow-xl relative overflow-hidden transition-all duration-300 hover:border-mystic-primary group/card">
      
      {/* Timezone Toggle Pill */}
      <div className="absolute top-4 right-4 flex items-center gap-0.5 bg-black/40 p-0.5 rounded-full border border-mystic-surface-light/50 text-[9px] font-bold z-20">
        <button
          onClick={() => setIsTurkeyTime(false)}
          className={`px-2 py-0.5 rounded-full transition-all flex items-center gap-0.5 ${
            !isTurkeyTime 
              ? 'bg-mystic-primary text-black font-extrabold' 
              : 'text-mystic-text-muted hover:text-mystic-text'
          }`}
          title="Evrensel Zaman Dilimi (UTC / GMT)"
        >
          <Globe size={8} /> UTC
        </button>
        <button
          onClick={() => setIsTurkeyTime(true)}
          className={`px-2 py-0.5 rounded-full transition-all ${
            isTurkeyTime 
              ? 'bg-mystic-primary text-black font-extrabold' 
              : 'text-mystic-text-muted hover:text-mystic-text'
          }`}
          title="Türkiye Saati (TRT)"
        >
          TRT
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-mystic-primary/10 border border-mystic-primary/30 shadow-inner">
          <Moon className="w-6 h-6 text-mystic-primary animate-pulse" />
        </div>
        <div>
          <h3 className="text-mystic-primary text-sm font-bold uppercase tracking-widest">Yıllık Ay Döngüleri</h3>
          <p className="text-mystic-text-muted text-[10px] mt-0.5">2026 Yeni Ay, Dolunay ve Tutulmalar</p>
        </div>
      </div>

      {/* Quick Summary / Highlight Section */}
      {nextPhase && nextPhaseData && (
        <div className="mb-4 p-3 bg-mystic-primary/5 rounded-xl border border-mystic-primary/20 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-mystic-accent tracking-wider flex items-center gap-1">
              <Sparkles size={10} className="animate-spin" style={{ animationDuration: '4s' }} /> Sıradaki Ay Fazı
            </span>
            <span className="text-[9px] text-mystic-text-muted">{nextPhaseData.fullDate}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-mystic-text flex items-center gap-1.5">
                {getPhaseIcon(nextPhase.phase)} {nextPhase.phaseName}
              </span>
              <span className="text-[9px] text-mystic-text-muted ml-6">
                Saat: {nextPhaseData.time} ({getTimeZoneLabel(nextPhase.utcDate)})
              </span>
            </div>
            <span className="text-xs font-semibold text-mystic-accent">
              {nextPhase.signSymbol} {nextPhase.sign} ({nextPhase.degree})
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-3 bg-black/20 p-0.5 rounded-lg border border-mystic-surface-light">
        {(['all', 'new_moon', 'full_moon', 'eclipse'] as const).map((t) => {
          const labels = { all: 'Tümü', new_moon: 'Yeni Ay', full_moon: 'Dolunay', eclipse: 'Tutulma' };
          const isActive = filter === t;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${
                isActive
                  ? 'bg-mystic-primary/20 text-mystic-accent border border-mystic-primary/30'
                  : 'text-mystic-text-muted hover:text-mystic-text hover:bg-mystic-surface-light/30'
              }`}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* Table/List */}
      <div 
        ref={containerRef}
        className="flex flex-col gap-1 max-h-[160px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-mystic-surface-light"
      >
        {filteredPhases.length > 0 ? (
          filteredPhases.map((item, idx) => {
            const isNext = nextPhase && item.utcDate === nextPhase.utcDate;
            const data = getFormattedData(item);
            return (
              <div
                key={idx}
                ref={isNext ? nextItemRef : null}
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl transition-all duration-300 ${
                  isNext
                    ? 'bg-mystic-primary/15 border-2 border-mystic-primary/40 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                    : 'hover:bg-mystic-surface-light/40 border border-transparent'
                }`}
              >
                {/* Left: Date & Time */}
                <div className="flex flex-col">
                  <span className={`text-[11px] font-bold ${isNext ? 'text-mystic-accent font-extrabold' : 'text-mystic-text'}`}>
                    {data.dayMonth}
                  </span>
                  <span className="text-[9px] text-mystic-text-muted leading-tight">
                    {data.time} <span className="opacity-80">({getTimeZoneLabel(item.utcDate)})</span>
                  </span>
                </div>

                {/* Center: Phase Name & Badge */}
                <div className={`flex items-center gap-1.5 py-0.5 px-2 rounded-md ${getPhaseStyle(item.phase)}`}>
                  {getPhaseIcon(item.phase)}
                  <span className="text-[10px] font-bold tracking-wide">{item.phaseName}</span>
                </div>

                {/* Right: Sign Name & Symbol */}
                <div className="flex items-center gap-1.5 text-right">
                  <span className="text-base text-mystic-accent" title={item.sign}>{item.signSymbol}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-mystic-text leading-tight">{item.sign}</span>
                    <span className="text-[9px] text-mystic-text-muted leading-none">{item.degree}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-xs text-mystic-text-muted py-6 flex flex-col items-center gap-2">
            <AlertCircle size={16} />
            <span>Kayıtlı döngü bulunamadı.</span>
          </div>
        )}
      </div>
    </div>
  );
}
