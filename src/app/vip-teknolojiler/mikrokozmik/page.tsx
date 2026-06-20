"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export default function MicrocosmicOrbitPage() {
  const router = useRouter();
  
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'IDLE' | 'INHALE' | 'HOLD_TOP' | 'EXHALE' | 'HOLD_BOTTOM'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const INHALE_MS = 6000;
  const HOLD_TOP_MS = 2000;
  const EXHALE_MS = 6000;
  const HOLD_BOTTOM_MS = 2000;

  const phaseRef = useRef(phase);
  const activeRef = useRef(isActive);
  
  useEffect(() => {
    phaseRef.current = phase;
    activeRef.current = isActive;
  }, [phase, isActive]);

  useEffect(() => {
    if (!isActive) {
      setPhase('IDLE');
      setProgress(0);
      setTimeLeft(0);
      setCycles(0);
      return;
    }

    let animationFrame: number;
    let startTime = Date.now();
    let currentDuration = INHALE_MS;
    
    // Start with INHALE if just activated
    if (phaseRef.current === 'IDLE') {
      setPhase('INHALE');
      phaseRef.current = 'INHALE';
      setCycles(0);
    } else {
      if (phaseRef.current === 'INHALE') currentDuration = INHALE_MS;
      if (phaseRef.current === 'HOLD_TOP') currentDuration = HOLD_TOP_MS;
      if (phaseRef.current === 'EXHALE') currentDuration = EXHALE_MS;
      if (phaseRef.current === 'HOLD_BOTTOM') currentDuration = HOLD_BOTTOM_MS;
    }

    const tick = () => {
      if (!activeRef.current) return;
      
      const now = Date.now();
      const elapsed = now - startTime;
      let p = elapsed / currentDuration;

      if (p >= 1) {
        // Switch phase
        p = 0;
        startTime = now;
        if (phaseRef.current === 'INHALE') {
          setPhase('HOLD_TOP');
          currentDuration = HOLD_TOP_MS;
        } else if (phaseRef.current === 'HOLD_TOP') {
          setPhase('EXHALE');
          currentDuration = EXHALE_MS;
        } else if (phaseRef.current === 'EXHALE') {
          setPhase('HOLD_BOTTOM');
          currentDuration = HOLD_BOTTOM_MS;
        } else if (phaseRef.current === 'HOLD_BOTTOM') {
          setPhase('INHALE');
          currentDuration = INHALE_MS;
          setCycles(c => c + 1); // Increment completed cycles
        }
      }

      setProgress(p);
      setTimeLeft(Math.ceil((currentDuration - elapsed) / 1000));
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [isActive]); // Only re-run when isActive changes, handle phase internally

  const getInstruction = () => {
    switch (phase) {
      case 'IDLE': return 'Hazır olduğunuzda başlatın';
      case 'INHALE': return 'Nefes Al: Omurgadan yukarı (Yang)';
      case 'HOLD_TOP': return 'Tut: Tepe çakrada toplayın';
      case 'EXHALE': return 'Nefes Ver: Göğüsten aşağı (Yin)';
      case 'HOLD_BOTTOM': return 'Tut: Göbek altında mühürleyin';
      default: return '';
    }
  };

  let cx = 150;
  let cy = 250;
  
  if (phase === 'INHALE') {
    const angle = progress * Math.PI; 
    cx = 150 + Math.sin(angle) * 80;
    cy = 250 - progress * 200; 
  } else if (phase === 'HOLD_TOP') {
    cx = 150;
    cy = 50;
  } else if (phase === 'EXHALE') {
    const angle = progress * Math.PI;
    cx = 150 - Math.sin(angle) * 80;
    cy = 50 + progress * 200; 
  } else if (phase === 'HOLD_BOTTOM' || phase === 'IDLE') {
    cx = 150;
    cy = 250;
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 relative bg-transparent selection:bg-blue-500 selection:text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black -z-60" />
      
      <div className="max-w-4xl mx-auto relative">
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => router.back()} className="flex items-center text-white/50 hover:text-blue-400 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Kadim Uygulamalara Dön
          </button>
          
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-white/50 hover:text-white p-3 bg-white/5 rounded-full backdrop-blur-md">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-blue-400 mb-4 tracking-wider uppercase">
            Mikrokozmik Yörünge
          </h1>
          <p className="text-blue-200/60 max-w-2xl mx-auto text-sm md:text-base">
            Bedeninizin ana meridyenlerinde "Chi" enerjisini dolaştırın. İçsel simyanın temeli olan bu pratik, hücresel şifayı başlatır.
          </p>
        </div>

        {/* Warning Alert */}
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-4 mb-8 backdrop-blur-md">
          <ShieldAlert className="text-blue-400 shrink-0 mt-1" />
          <div className="text-xs md:text-sm text-blue-200/80 leading-relaxed">
            <strong className="text-blue-400">Usta Tavsiyesi:</strong> Gözlerinizi kapatın. Dilinizi üst damağınıza yapıştırın. Nefes alırken enerjiyi omurganızdan yukarı çekin, nefes verirken göğsünüzden göbek deliğinizin 3 parmak altına (Dantian) indirin.
          </div>
        </div>

        {/* Animation & Timer Container */}
        <div className="bg-black/60 backdrop-blur-2xl border border-blue-500/20 rounded-[3rem] p-8 md:p-12 shadow-[0_0_100px_rgba(59,130,246,0.1)] flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
          
          {/* Cycle Counter Badge */}
          {isActive && (
            <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-in fade-in z-30">
              {cycles} Tur
            </div>
          )}

          {/* Breathing Instruction */}
          <div className="absolute top-8 left-0 right-0 text-center z-20">
            <h2 className={`text-xl md:text-3xl font-bold transition-all duration-500 ${
              phase === 'INHALE' ? 'text-red-400 scale-105' : 
              phase === 'EXHALE' ? 'text-blue-400 scale-105' : 
              phase === 'IDLE' ? 'text-white/50' : 'text-purple-400 scale-100'
            }`}>
              {getInstruction()}
            </h2>
            {isActive && (
              <div className="mt-4 flex flex-col items-center">
                <div className={`text-5xl font-black mb-2 ${phase === 'INHALE' ? 'text-red-400' : phase === 'EXHALE' ? 'text-blue-400' : 'text-purple-400'}`}>
                  {timeLeft}
                </div>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-75 ${phase === 'INHALE' ? 'bg-red-500' : phase === 'EXHALE' ? 'bg-blue-500' : 'bg-purple-500'}`} 
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SVG Orbit Visualizer */}
          <div className="mt-24 mb-10 relative">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full transition-all duration-1000 ${isActive ? 'opacity-100 scale-150' : 'opacity-0 scale-50'}`} />
            
            <svg width="300" height="300" viewBox="0 0 300 300" className="relative z-10 overflow-visible">
              {/* The Orbit Path */}
              <path d="M 150 250 A 80 100 0 0 0 150 50" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="4" strokeDasharray="6,6" />
              <path d="M 150 50 A 80 100 0 0 0 150 250" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="4" strokeDasharray="6,6" />

              {/* Chakras / Energy Centers */}
              <circle cx="150" cy="250" r="10" fill="#EF4444" className="animate-pulse" /> {/* Root */}
              <circle cx="150" cy="50" r="10" fill="#A855F7" className="animate-pulse" />  {/* Crown */}
              <circle cx="150" cy="180" r="8" fill="#F59E0B" opacity="0.6" /> {/* Navel / Dantian */}
              <circle cx="150" cy="120" r="8" fill="#10B981" opacity="0.6" /> {/* Heart */}
              <circle cx="150" cy="80" r="8" fill="#3B82F6" opacity="0.6" />  {/* Throat */}

              {/* The Moving Energy Orb */}
              <g style={{ transform: `translate(${cx - 150}px, ${cy - 150}px)` }}>
                <circle cx="150" cy="150" r="14" fill={phase === 'INHALE' ? '#EF4444' : phase === 'EXHALE' ? '#3B82F6' : '#A855F7'} />
                <circle cx="150" cy="150" r="28" fill={phase === 'INHALE' ? '#EF4444' : phase === 'EXHALE' ? '#3B82F6' : '#A855F7'} opacity="0.4" className="animate-ping" />
              </g>
            </svg>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-auto z-10">
            <button 
              onClick={() => setIsActive(!isActive)}
              className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            >
              {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
            </button>
            <button 
              onClick={() => { setIsActive(false); setPhase('IDLE'); setProgress(0); setTimeLeft(0); }}
              className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <RotateCcw size={24} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
