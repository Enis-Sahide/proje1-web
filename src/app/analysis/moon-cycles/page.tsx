"use client";

import React, { useState, useMemo } from 'react';
import { 
  Moon, 
  Sparkles, 
  Sun, 
  Calendar, 
  Clock, 
  Compass, 
  Flame, 
  ChevronRight, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import AnalysisBackButton from '@/components/ui/AnalysisBackButton';
import LunationDisplayCard from '@/features/astrology/components/LunationDisplayCard';
import { 
  MOON_PHASES_DATA, 
  getActiveOrNextLunation, 
  LunationEvent,
  LUNATION_DURATIONS
} from '@/features/astrology/engine/LunationEngine';

export default function MoonCyclesPage() {
  const [filter, setFilter] = useState<'all' | 'new_moon' | 'full_moon' | 'eclipse'>('all');
  
  // Varsayılan olarak bugüne en yakın veya aktif olan olayı seç
  const initialActive = useMemo(() => {
    return getActiveOrNextLunation(new Date());
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<LunationEvent>(initialActive.event);

  const filteredList = useMemo(() => {
    if (filter === 'all') return MOON_PHASES_DATA;
    if (filter === 'eclipse') {
      return MOON_PHASES_DATA.filter(p => p.phase === 'solar_eclipse' || p.phase === 'lunar_eclipse');
    }
    return MOON_PHASES_DATA.filter(p => p.phase === filter);
  }, [filter]);

  const getPhaseBadgeStyle = (phase: string) => {
    switch (phase) {
      case 'solar_eclipse':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'lunar_eclipse':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'full_moon':
        return 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30';
      case 'new_moon':
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const getPhaseIcon = (phase: string) => {
    if (phase === 'solar_eclipse') return <Sun size={14} className="text-amber-400" />;
    if (phase === 'lunar_eclipse') return <Moon size={14} className="text-purple-400" />;
    if (phase === 'full_moon') return <Moon size={14} className="text-[#D4AF37]" />;
    return <Moon size={14} className="text-emerald-400" />;
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Üst Geri Dön Butonu */}
        <AnalysisBackButton targetHref="/analysis" />

        {/* Başlık Alanı */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-purple-600/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.2)] shrink-0">
              <Moon size={32} className="animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1.5">
                <Sparkles size={12} /> 2026 Kozmik Takvim & Analiz
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Ay Döngüleri ve Tutulma Rehberi
              </h1>
              <p className="text-xs sm:text-sm text-mystic-text-muted mt-1">
                Yeniay, Dolunay, Güneş ve Ay Tutulmalarının kadersel etkileri, süreleri ve ritüelleri
              </p>
            </div>
          </div>
        </div>

        {/* 1. Seçilen / Aktif Olayın Büyük Vitrin Kartı */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
              <Sparkles size={15} /> İncelenen Kozmik Olay Detayı
            </h2>
            <span className="text-xs text-white/50">
              (Listeden dilediğiniz tutulmaya dokunarak detayını açabilirsiniz)
            </span>
          </div>

          <LunationDisplayCard 
            event={selectedEvent}
            statusText={
              selectedEvent.utcDate === initialActive.event.utcDate 
                ? initialActive.statusText 
                : undefined
            }
          />
        </div>

        {/* 2. 2026 Yıllık Liste & Filtreler */}
        <div className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-[#D4AF37]" />
              <span>2026 Yılı Tüm Ay Fazları ve Tutulmalar</span>
            </h3>

            {/* Filtre Sekmeleri */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
              {(['all', 'new_moon', 'full_moon', 'eclipse'] as const).map((t) => {
                const labels = { all: 'Tümü', new_moon: 'Yeni Ay', full_moon: 'Dolunay', eclipse: 'Tutulmalar' };
                const isActive = filter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#D4AF37] text-black shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Olay Kartları Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredList.map((item, idx) => {
              const isSelected = selectedEvent.utcDate === item.utcDate;
              const duration = LUNATION_DURATIONS[item.phase];
              const dateObj = new Date(item.utcDate);
              const formattedDate = dateObj.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              const formattedTime = dateObj.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedEvent(item);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#D4AF37]/15 to-transparent border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)] scale-[1.01]'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border ${getPhaseBadgeStyle(item.phase)} shrink-0`}>
                      {getPhaseIcon(item.phase)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPhaseBadgeStyle(item.phase)}`}>
                          {item.phaseName}
                        </span>
                        <span className="text-[11px] text-[#D4AF37] font-semibold">
                          {item.signSymbol} {item.sign} ({item.degree})
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-[#D4AF37] transition-colors">
                        {formattedDate} • <span className="text-xs text-white/50">{formattedTime} TRT</span>
                      </h4>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">
                        Etki: <strong>{duration.totalDuration}</strong> (Pik: {duration.peakWindow})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-white/40 group-hover:text-[#D4AF37] shrink-0">
                    <span className="hidden sm:inline">İncele</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
