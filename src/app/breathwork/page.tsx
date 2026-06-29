"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, X, Wind, Lock, Sparkles, ShieldAlert, Info, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useContent } from '@/lib/useContent';
import { useRouter } from 'next/navigation';

const roleLevels: Record<string, number> = {
  free: 0,
  apprentice: 1,
  journeyman: 2,
  master: 3,
  admin: 999
};

// TECHNIQUES içeriği DB'den gelir (/api/content/breathwork)

export default function BreathworkPage() {
  const { role } = useAuth();
  const router = useRouter();
  const { data: techData } = useContent<any[]>('/api/content/breathwork');
  const TECHNIQUES = techData ?? [];
  const [activeTech, setActiveTech] = useState<any>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const phaseIndexRef = useRef(phaseIndex);
  const activeTechRef = useRef(activeTech);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    phaseIndexRef.current = phaseIndex;
    activeTechRef.current = activeTech;
    isPlayingRef.current = isPlaying;
  }, [phaseIndex, activeTech, isPlaying]);

  useEffect(() => {
    if (!isPlaying || !activeTech) return;

    let animationFrame: number;
    let startTime = Date.now() - elapsedMs;
    let currentDuration = activeTech.phases[phaseIndex].time * 1000;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      let p = elapsed / currentDuration;

      if (p >= 1) {
        p = 0;
        startTime = now;
        setElapsedMs(0);
        const nextIndex = (phaseIndexRef.current + 1) % activeTechRef.current.phases.length;
        setPhaseIndex(nextIndex);
        phaseIndexRef.current = nextIndex;
        currentDuration = activeTechRef.current.phases[nextIndex].time * 1000;
        if (nextIndex === 0) {
          setRoundCount((r) => r + 1);
        }
      } else {
        setElapsedMs(elapsed);
      }

      setProgress(Math.min(1, Math.max(0, p)));
      setTimeLeft(Math.max(0, Math.ceil((currentDuration - elapsed) / 1000)));

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, activeTech, phaseIndex]);

  const handleStart = (tech: any) => {
    setActiveTech(tech);
    setPhaseIndex(0);
    setTimeLeft(tech.phases[0].time);
    setRoundCount(0);
    setElapsedMs(0);
    setProgress(0);
    setIsPlaying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStop = () => {
    setIsPlaying(false);
    setActiveTech(null);
    setElapsedMs(0);
    setProgress(0);
  };

  const getSmoothScale = () => {
    if (!activeTech) return 1;
    const currentName = activeTech.phases[phaseIndex].name;
    const isAl = currentName.includes('AL');
    const isVer = currentName.includes('VER');

    if (isAl) {
      return 1.0 + progress * 0.5;
    } else if (isVer) {
      return 1.5 - progress * 0.75;
    } else {
      const prevIndex = (phaseIndex - 1 + activeTech.phases.length) % activeTech.phases.length;
      const prevName = activeTech.phases[prevIndex].name;
      if (prevName.includes('AL')) {
        return 1.5;
      }
      return 0.75;
    }
  };

  const getOrbColor = () => {
    if (phaseIndex === 0) return '#EF4444'; // SOLUNUM AL
    if (phaseIndex === 2) return '#3B82F6'; // SOLUNUM VER
    return '#A855F7'; // TUT
  };

  const getInstructionText = () => {
    if (!activeTech) return '';
    if (activeTech.id === 'mikrokozmik') {
      if (phaseIndex === 0) return 'Nefes Al: Omurgadan yukarı (Yang)';
      if (phaseIndex === 1) return 'Tut: Tepe çakrada toplayın';
      if (phaseIndex === 2) return 'Nefes Ver: Göğüsten aşağı (Yin)';
      return 'Tut: Göbek altında mühürleyin';
    }
    return activeTech.instruction;
  };

  let cx = 150;
  let cy = 250;

  if (activeTech?.id === 'mikrokozmik') {
    if (phaseIndex === 0) {
      const angle = progress * Math.PI;
      cx = 150 + Math.sin(angle) * 80;
      cy = 250 - progress * 200;
    } else if (phaseIndex === 1) {
      cx = 150;
      cy = 50;
    } else if (phaseIndex === 2) {
      const angle = progress * Math.PI;
      cx = 150 - Math.sin(angle) * 80;
      cy = 50 + progress * 200;
    } else {
      cx = 150;
      cy = 250;
    }
  }

  const currentPhase = activeTech ? activeTech.phases[phaseIndex] : null;

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center bg-transparent">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />
            
      <div className="max-w-4xl w-full relative z-10">
        <h1 className="text-4xl font-bold text-mystic-primary mb-6 drop-shadow-md text-center md:text-left">Nefes Egzersizleri</h1>
        <p className="text-mystic-text-muted text-lg mb-8 text-center md:text-left">
          Yaşam enerjisini (Prana) doğru kullanarak bedeninizi ve zihninizi şifalandırın.
        </p>

        {/* Collapsible Guidelines */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 backdrop-blur-md relative overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="w-full flex items-center justify-between font-bold text-white text-base text-left focus:outline-none cursor-pointer"
          >
            <span className="flex items-center gap-3 text-mystic-accent">
              <Info className="text-mystic-accent animate-pulse" size={20} />
              Nefes Çalışmalarında Dikkat Edilmesi Gerekenler
            </span>
            <ChevronDown className={`text-mystic-text-muted transition-transform duration-300 ${isGuideOpen ? 'rotate-180 text-white' : ''}`} size={20} />
          </button>
          {isGuideOpen && (
            <div className="mt-5 pt-5 border-t border-white/10 text-sm text-mystic-text-muted space-y-3.5 leading-relaxed animate-in fade-in slide-in-from-top-4 duration-300">
              <p>• <strong className="text-white">Ortam ve Havalandırma:</strong> Egzersizleri sessiz, temiz ve önceden iyice havalandırılmış bir odada yapın.</p>
              <p>• <strong className="text-white">Duruş:</strong> Enerji kanallarının (nadi) rahatça açılması için omurganız mutlaka dik olmalıdır. Rahatça oturabilir veya gerekiyorsa düz uzanabilirsiniz.</p>
              <p>• <strong className="text-white">Zorlamama:</strong> Nefesinizi tutarken veya akciğerleri boşaltırken kendinizi asla aşırı zorlamayın. Doğal kapasitenizin sınırlarında kalın.</p>
              <p>• <strong className="text-white">Açlık Durumu:</strong> Egzersizlerin aç karnına ya da hafif bir yemekten en az 2 saat sonra yapılması tavsiye edilir.</p>
              <p>• <strong className="text-white">Vücut Tepkileri:</strong> Hafif baş dönmesi, karıncalanma veya sıcaklık artışı normaldir. Ancak aşırı rahatsızlık hissederseniz egzersizi durdurup normal nefesinize geçin.</p>
            </div>
          )}
        </div>

        {/* Breathing Player UI */}
        {activeTech && (
          <div className="bg-mystic-surface/80 backdrop-blur-xl border-2 border-mystic-primary/50 rounded-3xl p-8 mb-12 shadow-[0_0_40px_rgba(212,175,55,0.15)] flex flex-col items-center animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center w-full mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wind className="text-mystic-primary" /> {activeTech.name}
              </h2>
              <div className="flex items-center gap-4">
                <div className="bg-mystic-primary/10 text-mystic-primary border border-mystic-primary/30 px-4 py-1.5 rounded-full font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  TUR: {roundCount}
                </div>
                <button onClick={handleStop} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full transition-colors border border-red-500/30">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Visualizer container */}
            {activeTech.id === 'mikrokozmik' ? (
              <div className="relative w-72 h-72 flex items-center justify-center my-8">
                <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full scale-110 pointer-events-none" />
                
                <svg width="260" height="260" viewBox="0 0 300 300" className="relative z-10 overflow-visible">
                  {/* The Orbit Path */}
                  <path d="M 150 250 A 80 100 0 0 0 150 50" fill="none" stroke="rgba(239, 68, 68, 0.25)" strokeWidth="4" strokeDasharray="6,6" />
                  <path d="M 150 50 A 80 100 0 0 0 150 250" fill="none" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="4" strokeDasharray="6,6" />

                  {/* Chakras / Energy Centers */}
                  <circle cx="150" cy="250" r="10" fill="#EF4444" className="animate-pulse" /> {/* Root */}
                  <circle cx="150" cy="50" r="10" fill="#A855F7" className="animate-pulse" />  {/* Crown */}
                  <circle cx="150" cy="180" r="7" fill="#F59E0B" opacity="0.6" /> {/* Navel / Dantian */}
                  <circle cx="150" cy="120" r="7" fill="#10B981" opacity="0.6" /> {/* Heart */}
                  <circle cx="150" cy="80" r="7" fill="#3B82F6" opacity="0.6" />  {/* Throat */}

                  {/* The Moving Energy Orb */}
                  <g style={{ transform: `translate(${cx - 150}px, ${cy - 150}px)` }}>
                    <circle cx="150" cy="150" r="12" fill={getOrbColor()} />
                    <circle cx="150" cy="150" r="24" fill={getOrbColor()} opacity="0.3" className="animate-ping" />
                  </g>
                </svg>

                {/* Overlay text in center of orbit */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                  <span className="text-white/60 text-xs tracking-widest uppercase mb-1 font-bold">{currentPhase?.name}</span>
                  <span className="text-white text-5xl font-black">{timeLeft}</span>
                </div>
              </div>
            ) : (
              /* Standard Circle Visualizer with smooth scale */
              <div className="relative w-64 h-64 flex items-center justify-center my-12">
                {/* Outer glowing rings */}
                <div 
                  className="absolute inset-0 rounded-full border border-mystic-primary/20 transition-transform duration-75 ease-out"
                  style={{ transform: `scale(${getSmoothScale()})` }} 
                />
                <div 
                  className="absolute inset-4 rounded-full border border-mystic-primary/40 transition-transform duration-100 ease-out"
                  style={{ transform: `scale(${getSmoothScale()})` }} 
                />
                
                {/* Core solid circle */}
                <div 
                  className="w-32 h-32 bg-gradient-to-tr from-mystic-primary to-mystic-accent rounded-full shadow-[0_0_50px_rgba(212,175,55,0.4)] flex flex-col items-center justify-center z-10 transition-transform duration-75 ease-out"
                  style={{ transform: `scale(${getSmoothScale()})` }}
                >
                  <span className="text-black font-bold text-xs tracking-widest uppercase mb-1">{currentPhase?.name}</span>
                  <span className="text-black font-black text-4xl">{timeLeft}</span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="flex items-center gap-2 bg-mystic-primary text-black px-8 py-3 rounded-full font-bold hover:bg-[#D4AF37] transition-colors"
              >
                {isPlaying ? <><Square size={18} /> Duraklat</> : <><Play size={18} /> Devam Et</>}
              </button>
            </div>

            {/* Dynamic Instruction Context */}
            <div className="mt-8 w-full max-w-xl bg-black/45 border border-white/5 rounded-2xl p-4 text-center">
              <p className="text-mystic-accent text-sm font-bold uppercase tracking-wider mb-1">Talimat</p>
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
                {getInstructionText()}
              </p>
            </div>

            {/* Warning Alert if Mikrokozmik */}
            {activeTech.id === 'mikrokozmik' && (
              <div className="mt-4 w-full max-w-xl bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 backdrop-blur-md">
                <ShieldAlert className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-blue-200/80 leading-relaxed text-left">
                  <strong className="text-blue-400">Usta Tavsiyesi:</strong> Gözlerinizi kapatın. Dilinizi üst damağınıza yapıştırın. Nefes alırken enerjiyi omurganızdan yukarı çekin, nefes verirken göğsünüzden göbek deliğinizin 3 parmak altına (Dantian) indirin.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TECHNIQUES.map((tech) => {
            const techRequiredRole = tech.requiredRole || 'free';
            const hasAccess = (roleLevels[role] ?? 0) >= (roleLevels[techRequiredRole] ?? 0);

            return (
              <div key={tech.id} className={`bg-mystic-surface/80 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 group p-6 flex flex-col justify-between ${activeTech?.id === tech.id ? 'border-mystic-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-mystic-surface-light hover:border-mystic-primary/50'} ${!hasAccess && 'opacity-60'}`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-mystic-text mb-1 group-hover:text-mystic-accent transition-colors flex items-center gap-2">
                        {tech.name}
                      </h3>
                      <p className="text-mystic-primary-light text-sm font-semibold">{tech.desc}</p>
                    </div>
                    {activeTech?.id !== tech.id && (
                      hasAccess ? (
                        <button 
                          onClick={() => handleStart(tech)} 
                          className="p-2.5 bg-mystic-primary/10 text-mystic-primary hover:bg-mystic-primary hover:text-black rounded-full transition-all border border-mystic-primary/30 cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
                          title="Başlat"
                        >
                          <Play size={18} />
                        </button>
                      ) : (
                        <div className="p-2.5 bg-red-500/10 text-red-400 rounded-full border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]">
                          <Lock size={18} />
                        </div>
                      )
                    )}
                  </div>
                  
                  <div className="bg-mystic-dark/60 p-4 rounded-xl border border-mystic-surface-light/50 mb-4">
                    <p className="text-mystic-text-muted text-sm leading-relaxed italic whitespace-pre-line">
                      {tech.instruction}
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {tech.phases.map((phase: any, idx: number) => (
                      <div key={idx} className="bg-mystic-surface-light/50 px-3 py-1.5 rounded-lg border border-mystic-surface-light text-xs font-medium text-mystic-text flex items-center gap-2">
                        <span className="text-mystic-accent">{phase.name}</span>
                        <span className="text-mystic-text-muted">{phase.time}s</span>
                      </div>
                    ))}
                  </div>

                  {!hasAccess && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-red-400 gap-1.5">
                      <Lock size={12} className="shrink-0" />
                      <span>
                        {techRequiredRole === 'master' 
                          ? 'Ustalık (Seviye 3) Mührü Gerekmektedir' 
                          : 'Kalfalık (Seviye 2) Mührü Gerekmektedir'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
