'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Moon, Calendar, Sparkles, AlertCircle, Globe } from 'lucide-react';

interface MoonPhaseEvent {
  utcDate: string; // ISO format UTC date
  phase: 'new_moon' | 'full_moon' | 'solar_eclipse' | 'lunar_eclipse';
  phaseName: string;
  sign: string;
  signSymbol: string;
  degree: string;
}

const MOON_PHASES_2026: MoonPhaseEvent[] = [
  { utcDate: '2026-01-03T10:03:26.043Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Yengeç', signSymbol: '♋', degree: '13°' },
  { utcDate: '2026-01-18T19:52:39.367Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Oğlak', signSymbol: '♑', degree: '28°' },
  { utcDate: '2026-02-01T22:09:49.657Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Aslan', signSymbol: '♌', degree: '13°' },
  { utcDate: '2026-02-17T12:01:47.328Z', phase: 'solar_eclipse', phaseName: 'Güneş Tutulması', sign: 'Kova', signSymbol: '♒', degree: '28°' },
  { utcDate: '2026-03-03T11:38:32.022Z', phase: 'lunar_eclipse', phaseName: 'Ay Tutulması', sign: 'Başak', signSymbol: '♍', degree: '12°' },
  { utcDate: '2026-03-19T01:24:05.931Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Balık', signSymbol: '♓', degree: '28°' },
  { utcDate: '2026-04-02T02:12:36.809Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Terazi', signSymbol: '♎', degree: '12°' },
  { utcDate: '2026-04-17T11:52:21.628Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Koç', signSymbol: '♈', degree: '27°' },
  { utcDate: '2026-05-01T17:23:47.564Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Akrep', signSymbol: '♏', degree: '11°' },
  { utcDate: '2026-05-16T20:01:32.344Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Boğa', signSymbol: '♉', degree: '25°' },
  { utcDate: '2026-05-31T08:45:48.291Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Yay', signSymbol: '♐', degree: '9°' },
  { utcDate: '2026-06-15T02:54:39.007Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'İkizler', signSymbol: '♊', degree: '24°' },
  { utcDate: '2026-06-29T23:57:17.744Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Oğlak', signSymbol: '♑', degree: '8°' },
  { utcDate: '2026-07-14T09:44:04.307Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Yengeç', signSymbol: '♋', degree: '21°' },
  { utcDate: '2026-07-29T14:36:19.011Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Kova', signSymbol: '♒', degree: '6°' },
  { utcDate: '2026-08-12T17:37:11.343Z', phase: 'solar_eclipse', phaseName: 'Güneş Tutulması', sign: 'Aslan', signSymbol: '♌', degree: '20°' },
  { utcDate: '2026-08-28T04:19:06.085Z', phase: 'lunar_eclipse', phaseName: 'Ay Tutulması', sign: 'Balık', signSymbol: '♓', degree: '4°' },
  { utcDate: '2026-09-11T03:27:28.467Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Başak', signSymbol: '♍', degree: '18°' },
  { utcDate: '2026-09-26T16:49:32.233Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Koç', signSymbol: '♈', degree: '3°' },
  { utcDate: '2026-10-10T15:50:36.724Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Terazi', signSymbol: '♎', degree: '17°' },
  { utcDate: '2026-10-26T04:12:15.538Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Boğa', signSymbol: '♉', degree: '2°' },
  { utcDate: '2026-11-09T07:02:42.392Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Akrep', signSymbol: '♏', degree: '16°' },
  { utcDate: '2026-11-24T14:54:04.191Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'İkizler', signSymbol: '♊', degree: '2°' },
  { utcDate: '2026-12-09T00:52:31.284Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Yay', signSymbol: '♐', degree: '16°' },
  { utcDate: '2026-12-24T01:28:45.040Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Yengeç', signSymbol: '♋', degree: '2°' }
];

export default function MoonCyclesWidget() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new_moon' | 'full_moon' | 'eclipse'>('all');
  const [isTurkeyTime, setIsTurkeyTime] = useState(true);
  const [nextPhase, setNextPhase] = useState<MoonPhaseEvent | null>(null);
  
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
  }, [mounted, isTurkeyTime]);

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
