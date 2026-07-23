'use client';

import React from 'react';
import { Waves, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SchumannMiniWidget() {
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
            <span className="text-mystic-primary text-[10px] font-bold uppercase tracking-widest block">Schumann Rezonansı</span>
            <h4 className="text-white font-extrabold text-sm mt-0.5 tracking-tight group-hover/schumann:text-mystic-accent transition-colors">
              Canlı Spektrogram Ölçümü
            </h4>
          </div>
        </div>

        {/* Right: Icon indicator instead of badge */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover/schumann:border-mystic-accent/30 transition-colors">
          <ArrowRight className="w-4 h-4 text-mystic-text-muted group-hover/schumann:text-mystic-accent transition-colors" />
        </div>
      </div>

      {/* Footer details */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-mystic-text-muted">
        <span className="truncate max-w-[200px] italic">
          🧘 Dünya'nın kalp atışlarını izleyin
        </span>
        <span className="text-mystic-accent font-bold flex items-center gap-1 group-hover/schumann:translate-x-1 transition-transform">
          Canlı İzle <ArrowRight size={10} />
        </span>
      </div>
    </Link>
  );
}
