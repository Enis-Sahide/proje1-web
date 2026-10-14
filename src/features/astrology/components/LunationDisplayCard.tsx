"use client";

import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Sparkles, 
  Clock, 
  Compass, 
  Flame, 
  ShieldAlert, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Layers,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { 
  LunationEvent, 
  LUNATION_DURATIONS, 
  SIGN_LUNATION_INTERPRETATIONS, 
  HOUSE_LUNATION_INTERPRETATIONS,
  calculateLunationHouse 
} from '../engine/LunationEngine';

interface LunationDisplayCardProps {
  event: LunationEvent;
  natalHouses?: Array<{ house: number; sign: string }>;
  statusText?: string;
  isCompact?: boolean;
}

export default function LunationDisplayCard({
  event,
  natalHouses,
  statusText,
  isCompact = false,
}: LunationDisplayCardProps) {
  const [expanded, setExpanded] = useState(!isCompact);

  const durationInfo = LUNATION_DURATIONS[event.phase] || LUNATION_DURATIONS.full_moon;
  const signInterp = SIGN_LUNATION_INTERPRETATIONS[event.sign]?.[event.phase] || {
    title: `${event.sign} ${event.phaseName} Enerjisi`,
    collective: 'Gökyüzündeki bu güçlü faz hem bireysel hem kolektif düzeyde derin dönüşümler yaratıyor.',
    ritual: 'Kendi merkezinde kalmak için sessizce meditasyon yapın ve niyetlerinizi belirleyin.',
  };

  // Kişisel harita ev hesaplaması
  const houseNumber = calculateLunationHouse(event.sign, natalHouses);
  const houseInterp = HOUSE_LUNATION_INTERPRETATIONS[houseNumber]?.[event.phase];

  // Renk ve Rozet Mantığı
  const isEclipse = event.phase === 'solar_eclipse' || event.phase === 'lunar_eclipse';
  const isSolar = event.phase === 'solar_eclipse';
  const isLunar = event.phase === 'lunar_eclipse';
  const isFullMoon = event.phase === 'full_moon';

  const badgeColor = isSolar 
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
    : isLunar 
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
      : isFullMoon 
        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  const glowShadow = isSolar 
    ? 'shadow-[0_0_30px_rgba(245,158,11,0.2)]'
    : isLunar 
      ? 'shadow-[0_0_30px_rgba(168,85,247,0.2)]'
      : 'shadow-[0_0_30px_rgba(212,175,55,0.15)]';

  const formattedDate = new Date(event.utcDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`rounded-3xl border border-white/10 bg-gradient-to-b from-[#18181b]/95 to-black/95 backdrop-blur-xl p-5 sm:p-7 transition-all ${glowShadow} relative overflow-hidden`}>
      {/* Arka plan kozmik ışığı */}
      <div className={`absolute -right-20 -top-20 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20 ${
        isSolar ? 'bg-amber-500' : isLunar ? 'bg-purple-600' : 'bg-[#D4AF37]'
      }`} />

      {/* Başlık ve Rozetler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-2xl border ${badgeColor} flex items-center justify-center shrink-0`}>
            {isSolar ? (
              <Sun size={26} className="text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
            ) : (
              <Moon size={26} className={isLunar ? "text-purple-400" : "text-[#D4AF37]"} />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
                {event.phaseName}
              </span>
              <span className="text-xs text-white/50 flex items-center gap-1 font-mono">
                <Calendar size={13} /> {formattedDate}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{event.sign} {event.phaseName}</span>
              <span className="text-[#D4AF37] text-base font-normal">({event.signSymbol} {event.degree})</span>
            </h3>
          </div>
        </div>

        {/* Etki Süresi Rozeti */}
        <div className="flex flex-col sm:items-end gap-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90">
            <Clock size={14} className="text-[#D4AF37]" />
            <span>Etki Süresi: <strong className="text-white font-bold">{durationInfo.totalDuration}</strong></span>
          </div>
          <span className="text-[11px] text-white/50">
            Pik Noktası: <strong className="text-white/80">{durationInfo.peakWindow}</strong>
          </span>
          {statusText && (
            <span className="text-[11px] font-semibold text-emerald-400 mt-0.5">
              ● {statusText}
            </span>
          )}
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="mt-5 space-y-5">
        {/* Kolektif / Genel Gökyüzü Teması */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} /> Kolektif Gökyüzü Enerjisi: {signInterp.title}
          </h4>
          <p className="text-sm text-white/85 leading-relaxed">
            {signInterp.collective}
          </p>
          <p className="text-xs text-white/60 italic leading-relaxed pt-1">
            {durationInfo.description}
          </p>
        </div>

        {/* Kişisel Harita Etkisi (Varsa) */}
        {natalHouses && houseInterp && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-[#D4AF37]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={15} /> Kişisel Doğum Haritanızdaki Etkisi
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-white font-extrabold text-xs">
                {houseNumber}. Evinizde
              </span>
            </div>
            
            <h5 className="text-base font-bold text-white">
              {houseInterp.title}
            </h5>
            <p className="text-sm text-white/80 leading-relaxed">
              {houseInterp.personalImpact}
            </p>
            
            <div className="pt-2 border-t border-white/5 flex items-start gap-2 text-xs text-white/70">
              <CheckCircle2 size={15} className="text-[#32D74B] shrink-0 mt-0.5" />
              <span><strong>Kişisel Rehberlik & Tavsiye:</strong> {houseInterp.advice}</span>
            </div>
          </div>
        )}

        {/* Ritüel / Arınma Önerisi */}
        {expanded && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs text-white/70">
            <Flame size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Bu Dönemin Manevi Arınma & Ritüel Tavsiyesi:</strong>
              <span>{signInterp.ritual}</span>
            </div>
          </div>
        )}
      </div>

      {isCompact && (
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            {expanded ? <>Daha Az Detay <ChevronUp size={14} /></> : <>Tüm Detayları ve Ritüeli Gör <ChevronDown size={14} /></>}
          </button>
        </div>
      )}
    </div>
  );
}
