"use client";

import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Sparkles, 
  Clock, 
  Compass, 
  Flame, 
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Crown,
  Leaf
} from 'lucide-react';
import { 
  LunationEvent, 
  LUNATION_DURATIONS, 
  SIGN_LUNATION_INTERPRETATIONS, 
  HOUSE_LUNATION_INTERPRETATIONS,
  calculateLunationHouse,
  getActiveSolarEclipse,
  ActiveSolarEclipseInfo
} from '../engine/LunationEngine';

interface LunationDisplayCardProps {
  event: LunationEvent;
  natalHouses?: Array<{ house: number; sign: string }>;
  statusText?: string;
  isCompact?: boolean;
  activeSolarEclipse?: ActiveSolarEclipseInfo | null;
}

export default function LunationDisplayCard({
  event,
  natalHouses,
  statusText,
  isCompact = false,
  activeSolarEclipse,
}: LunationDisplayCardProps) {
  // Hem Güneş Kadersel Çatısı hem de Ay Fazı varsayılan olarak kompakt/kapalı başlar, tıklandığında açılır
  const [isSolarOpen, setIsSolarOpen] = useState(false);
  const [isLunarOpen, setIsLunarOpen] = useState(false);

  // Aktif 6 Aylık Güneş Tutulması Kadersel Çatısını belirle
  const solarUmbrella = activeSolarEclipse !== undefined 
    ? activeSolarEclipse 
    : getActiveSolarEclipse(new Date(event.utcDate));
  
  // Şemsiye başlığı: eğer mevcut kart güneş tutulmasının kendisi değilse göster
  const showSolarUmbrellaBanner = solarUmbrella && event.phase !== 'solar_eclipse';

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
    ? 'shadow-[0_0_25px_rgba(245,158,11,0.2)]'
    : isLunar 
      ? 'shadow-[0_0_25px_rgba(168,85,247,0.2)]'
      : 'shadow-[0_0_25px_rgba(212,175,55,0.15)]';

  const formattedDate = new Date(event.utcDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const phaseTagLabel = isSolar
    ? '☀️ 6 Aylık Kadersel Ana Çatı'
    : isLunar
      ? '🌑 1 - 3 Aylık Kadersel Aydınlanma'
      : isFullMoon
        ? '🌕 14 Günlük Aktif Dolunay Hasat Fazı'
        : '🌑 14 Günlük Aktif Yeni Ay Tohum Fazı';

  return (
    <div className="space-y-3">
      {/* ☀️ 1. KAPSÜL: 6 Aylık Kadersel Güneş Tutulması Çatısı (Tıklanınca Açılır) */}
      {showSolarUmbrellaBanner && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-black/80 to-black/80 backdrop-blur-md overflow-hidden transition-all shadow-md">
          {/* Kompakt Tıklanabilir Başlık */}
          <button
            type="button"
            onClick={() => setIsSolarOpen(!isSolarOpen)}
            className="w-full p-3 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/5 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                <Sun size={20} className={isSolarOpen ? "animate-spin" : ""} style={{ animationDuration: '30s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/25 px-2 py-0.5 rounded border border-amber-500/40">
                    Aktif Kadersel Çatı (6 Aylık Süreç)
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>{solarUmbrella.event.sign} Güneş Tutulması</span>
                  <span className="text-amber-400/90 text-xs font-mono font-normal">({solarUmbrella.event.signSymbol} {solarUmbrella.event.degree})</span>
                </h4>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono text-amber-200/90 bg-black/50 px-2.5 py-1 rounded-xl border border-amber-500/20">
                <Clock size={12} className="text-amber-400" />
                <span>{solarUmbrella.statusText}</span>
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                {isSolarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </button>

          {/* Açılır Detay İçeriği */}
          {isSolarOpen && (
            <div className="p-4 sm:p-5 border-t border-amber-500/20 bg-black/60 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-200/90 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 self-start">
                <Clock size={13} className="text-amber-400 shrink-0" />
                <span>{solarUmbrella.statusText}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                Bu 6 aylık kadersel çatı, kolektif ve bireysel düzeyde {solarUmbrella.event.sign} arketipinin yönettiği yaşam alanlarında köklü bir yeniden yapılanma ve inisiyasyon sürecini başlatmıştır. Günlük ve aylık tüm ay fazları bu ana güneş çatısının altında şekillenir.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🌙 2. KAPSÜL: Güncel Ay Fazı / Dolunay / Yeniay (Tıklanınca Açılır) */}
      <div className={`rounded-3xl border border-white/10 bg-gradient-to-b from-[#18181b]/95 to-black/95 backdrop-blur-xl transition-all ${glowShadow} overflow-hidden`}>
        {/* Kompakt Tıklanabilir Başlık */}
        <button
          type="button"
          onClick={() => setIsLunarOpen(!isLunarOpen)}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-white/[0.03] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl border ${badgeColor} flex items-center justify-center shrink-0`}>
              {isSolar ? (
                <Sun size={24} className="text-amber-400" />
              ) : (
                <Moon size={24} className={isLunar ? "text-purple-400" : "text-[#D4AF37]"} />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${badgeColor}`}>
                  {event.phaseName}
                </span>
                <span className="text-xs text-white/50 flex items-center gap-1 font-mono">
                  <Calendar size={12} /> {formattedDate}
                </span>
                <span className="text-[10px] font-semibold text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {phaseTagLabel}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{event.sign} {event.phaseName}</span>
                <span className="text-[#D4AF37] text-sm font-normal">({event.signSymbol} {event.degree})</span>
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                <span>Etki: <strong className="text-white">{durationInfo.totalDuration}</strong></span>
                {statusText && <span className="text-emerald-400 font-semibold">● {statusText}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-xs font-semibold text-[#D4AF37] bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              {isLunarOpen ? 'Detayı Kapat' : 'Detayı İncele'}
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-white">
              {isLunarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {/* Açılır Faz Detay İçeriği */}
        {isLunarOpen && (
          <div className="p-5 sm:p-7 border-t border-white/10 space-y-6 animate-in fade-in duration-300">
            {/* Süre Rozeti */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/80">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#D4AF37]" />
                <span>Etki Süresi: <strong className="text-white font-bold">{durationInfo.totalDuration}</strong></span>
              </div>
              <span>
                Pik Noktası: <strong className="text-white/90">{durationInfo.peakWindow}</strong>
              </span>
            </div>

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

            {/* Kişisel Harita Ezoterik İnisiyasyon Portalı (Varsa) */}
            {natalHouses && houseInterp && (
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-[#D4AF37]/35 space-y-4 shadow-xl">
                {/* Portal Başlığı */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
                      <Compass size={14} /> Kişisel Doğum Haritası Portalı
                    </span>
                    <h5 className="text-base sm:text-lg font-black text-white mt-0.5">
                      {houseInterp.portalName || houseInterp.title}
                    </h5>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-black text-xs self-start sm:self-auto">
                    {houseNumber}. Evinizde
                  </span>
                </div>

                {/* Portal Anlam Açıklaması */}
                {houseInterp.portalMeaning && (
                  <p className="text-xs text-white/70 italic leading-relaxed">
                    {houseInterp.portalMeaning}
                  </p>
                )}

                {/* İki Katmanlı Bilinç Matrisi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle size={15} className="text-rose-400 shrink-0" />
                      <span>Alt Bilinç / Gölge Hali</span>
                    </div>
                    <p className="text-xs text-rose-100/85 leading-relaxed">
                      {houseInterp.shadowState || houseInterp.personalImpact}
                    </p>
                    <span className="text-[10px] text-rose-300/60 block pt-1 italic">
                      Ego, korku ve sınav seviyesinde günlük yaşam deneyimi
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-[#D4AF37]/40 space-y-2 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                      <Crown size={15} className="text-[#D4AF37] shrink-0" />
                      <span>Üst Bilinç / Ruhsal Boyut</span>
                    </div>
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      {houseInterp.elevatedState || houseInterp.personalImpact}
                    </p>
                    <span className="text-[10px] text-amber-300/60 block pt-1 italic">
                      7 çakra dengede ve arınmış bilinçle açılan inisiyasyon
                    </span>
                  </div>
                </div>

                {/* Çakra & Manevi Denge Reçetesi */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-100/90">
                  <Leaf size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300 block mb-0.5">Çakra & Manevi Denge Reçetesi:</strong>
                    <span className="leading-relaxed">{houseInterp.spiritualAdvice || houseInterp.advice}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ritüel / Arınma Önerisi */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs text-white/70">
              <Flame size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Bu Dönemin Manevi Arınma & Ritüel Tavsiyesi:</strong>
                <span>{signInterp.ritual}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
