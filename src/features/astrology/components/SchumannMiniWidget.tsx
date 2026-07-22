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

  const getGLevelLabel = (score: number) => {
    if (score < 5.0) return 'G0';
    if (score < 6.0) return 'G1';
    if (score < 7.0) return 'G2';
    if (score < 8.0) return 'G3';
    if (score < 9.0) return 'G4';
    return 'G5';
  };

  const getGLevelText = (score: number) => {
    if (score < 3.0) return 'G0 Sakin';
    if (score < 5.0) return 'G0 Aktif';
    if (score < 6.0) return 'G1 Orta';
    if (score < 7.0) return 'G2 Güçlü';
    if (score < 8.0) return 'G3 Şiddetli';
    if (score < 9.0) return 'G4 Ağır';
    return 'G5 Zirve';
  };

  const getGlowingIndicator = (score: number) => {
    if (score < 3.0) return 'bg-[#22D3EE] shadow-[0_0_10px_rgba(34,211,238,0.6)]';
    if (score < 5.0) return 'bg-[#34D399] shadow-[0_0_10px_rgba(52,211,153,0.6)]';
    if (score < 7.0) return 'bg-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.6)]';
    return 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]';
  };

  if (isLoading) {
    return (
      <div className="bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-5 border border-mystic-surface-light w-full max-w-sm shadow-xl flex items-center justify-center min-h-[90px] animate-pulse">
        <Loader2 className="animate-spin text-mystic-primary" size={20} />
      </div>
    );
  }

  const scoreVal = data?.cosmic_impact_score ?? 0.5;

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
              <span className="text-mystic-primary text-[10px] font-bold uppercase tracking-widest">Schumann Rezonansı</span>
              <span className={`w-1.5 h-1.5 rounded-full ${getGlowingIndicator(scoreVal)}`} />
            </div>
            <h4 className="text-white font-extrabold text-sm mt-0.5 tracking-tight group-hover/schumann:text-mystic-accent transition-colors">
              {getGLevelText(scoreVal)}
            </h4>
          </div>
        </div>

        {/* Right: SR Value Badge */}
        <div 
          className="py-1 px-3 rounded-xl border text-xs font-mono font-black flex items-center gap-1.5 transition-all duration-300"
          style={{
            borderColor: scoreVal < 3.0 ? '#22D3EE' : scoreVal < 5.0 ? '#34D399' : scoreVal < 7.0 ? '#EF4444' : '#FFFFFF',
            backgroundColor: scoreVal < 3.0 ? '#22D3EE' : scoreVal < 5.0 ? '#34D399' : scoreVal < 7.0 ? '#EF4444' : '#FFFFFF',
            color: '#000000'
          }}
        >
          <span className="font-extrabold">{getGLevelLabel(scoreVal)}</span>
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
