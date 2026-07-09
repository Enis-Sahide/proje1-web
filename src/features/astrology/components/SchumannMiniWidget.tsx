'use client';

import React, { useState, useEffect } from 'react';
import { Waves, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface KpData {
  current_kp: number;
  status_label: string;
  status_desc: string;
  cosmic_impact_score?: number;
}

export default function SchumannMiniWidget() {
  const [data, setData] = useState<KpData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/schumann');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Error fetching Schumann mini widget data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Refresh every 5 minutes in background
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score < 3.0) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
    if (score < 5.0) return 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
    if (score < 7.0) return 'text-orange-400 border-orange-500/30 bg-orange-500/10 shadow-[0_0_8px_rgba(249,115,22,0.15)]';
    return 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse';
  };

  const getGlowingIndicator = (score: number) => {
    if (score < 3.0) return 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (score < 5.0) return 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    if (score < 7.0) return 'bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
    return 'bg-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-ping';
  };

  const getKpColor = (kp: number) => {
    if (kp < 3.0) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
    if (kp < 4.0) return 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
    if (kp < 5.0) return 'text-orange-400 border-orange-500/30 bg-orange-500/10 shadow-[0_0_8px_rgba(249,115,22,0.15)]';
    return 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse';
  };

  if (isLoading) {
    return (
      <div className="bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-5 border border-mystic-surface-light w-full max-w-sm shadow-xl flex items-center justify-center min-h-[90px] animate-pulse">
        <Loader2 className="animate-spin text-mystic-primary" size={20} />
      </div>
    );
  }

  const kpVal = data?.current_kp ?? 0;
  const scoreVal = data?.cosmic_impact_score ?? kpVal;

  return (
    <Link 
      href="/analysis/schumann"
      className="bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-5 border border-mystic-surface-light w-full max-w-sm shadow-xl relative overflow-hidden transition-all duration-300 hover:border-mystic-primary/50 hover:scale-[1.03] group/schumann block"
    >
      {/* Background glow lines */}
      <div className="absolute top-[-20%] right-[-20%] w-[40%] h-[40%] bg-[#00E5FF]/5 blur-[30px] rounded-full pointer-events-none transition-all duration-300 group-hover/schumann:bg-[#00E5FF]/10" />

      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-mystic-primary/10 border border-mystic-primary/20 shadow-inner group-hover/schumann:scale-110 transition-transform">
            <Waves className="w-5 h-5 text-mystic-accent" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-mystic-primary text-[10px] font-bold uppercase tracking-widest">Schumann Rezonansı • SR {scoreVal.toFixed(1)}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${getGlowingIndicator(scoreVal)}`} />
            </div>
            <h4 className="text-white font-extrabold text-sm mt-0.5 tracking-tight group-hover/schumann:text-mystic-accent transition-colors">
              {data?.status_label.split(' ')[0]}
            </h4>
          </div>
        </div>

        {/* Right: Kp Value Badge */}
        <div className={`py-1 px-3 rounded-xl border text-xs font-mono font-black flex items-center gap-1.5 ${getKpColor(kpVal)}`}>
          <span className="text-white font-extrabold">{kpVal.toFixed(2)}</span>
          <span className="opacity-60 text-[10px]">Kp</span>
        </div>

      </div>

      {/* Footer details */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-mystic-text-muted">
        <span className="truncate max-w-[200px] italic">
          {scoreVal >= 7.0 ? '🧬 Işık Portalı: DNA Aktivasyonu' : scoreVal >= 5.0 ? '👁️ Yüksek Sezgi ve Farkındalık' : scoreVal >= 3.0 ? '⚡ Enerjisel Kıpırdanma & Yenilenme' : '🧘 Dengeli ve Dingin Akış'}
        </span>
        <span className="text-mystic-accent font-bold flex items-center gap-1 group-hover/schumann:translate-x-1 transition-transform">
          Canlı İzle <ArrowRight size={10} />
        </span>
      </div>
    </Link>
  );
}
