"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Square, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useContent } from '@/lib/useContent';

// FREQUENCIES / ORGAN_FREQUENCIES içeriği DB'den gelir (/api/content/meditation)

export default function MeditationScreen() {
  const router = useRouter();
  const { data: medData } = useContent<{ chakra: any[]; organ: any[] }>('/api/content/meditation');
  const FREQUENCIES = medData?.chakra ?? [];
  const ORGAN_FREQUENCIES = medData?.organ ?? [];

  const [activeFreq, setActiveFreq] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customHz, setCustomHz] = useState<number>(432);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showChakras, setShowChakras] = useState(true);
  const [showOrgans, setShowOrgans] = useState(false);
  const [customTimerStr, setCustomTimerStr] = useState('');

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtxRef.current = new AudioContextClass();
    }
  };

  const startAudio = (freq: number) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    stopAudio();

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const gain = ctx.createGain();
    // Fade in to avoid clicking noises
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    oscRef.current = osc;
    gainRef.current = gain;
  };

  const stopAudio = useCallback(() => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch(e) {}
      oscRef.current.disconnect();
      oscRef.current = null;
    }
    if (gainRef.current) {
      gainRef.current.disconnect();
      gainRef.current = null;
    }
  }, []);

  const setAudioFrequency = (freq: number) => {
    const ctx = audioCtxRef.current;
    if (oscRef.current && ctx) {
      oscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopAudio]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedDuration !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopAudio();
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedDuration, timeRemaining, stopAudio]);

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setActiveFreq('CUSTOM');
      startAudio(customHz);
      setIsPlaying(true);
      if (selectedDuration !== null && timeRemaining <= 0) {
        setTimeRemaining(selectedDuration * 60);
      }
    }
  };

  const togglePresetPlay = (freq: any) => {
    if (activeFreq?.id === freq.id && isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setActiveFreq(freq);
      setCustomHz(freq.hz);
      startAudio(freq.hz);
      setIsPlaying(true);
      if (selectedDuration !== null && timeRemaining <= 0) {
        setTimeRemaining(selectedDuration * 60);
      }
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCustomHz(val);
    setActiveFreq('CUSTOM');
    if (isPlaying) {
      setAudioFrequency(val);
    }
  };

  const adjustCustomHz = (amount: number) => {
    const newHz = Math.max(1, Math.min(2000, customHz + amount));
    setCustomHz(newHz);
    setActiveFreq('CUSTOM');
    if (isPlaying) {
      setAudioFrequency(newHz);
    }
  };

  const handleDurationChange = (val: number | null) => {
    setSelectedDuration(val);
    if (isPlaying) {
      if (val === null) setTimeRemaining(0);
      else setTimeRemaining(val * 60);
    }
  };

  const applyCustomTimer = () => {
    const str = customTimerStr.replace(',', '.');
    if (!str) return;
    let totalSecs = 0;
    if (str.includes('.')) {
      const parts = str.split('.');
      const m = parseInt(parts[0]) || 0;
      const s = parseInt(parts[1]) || 0;
      totalSecs = (m * 60) + s;
    } else {
      totalSecs = (parseInt(str) || 0) * 60;
    }
    if (totalSecs > 0) {
      setSelectedDuration(totalSecs / 60);
      if (isPlaying) setTimeRemaining(totalSecs);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen relative flex flex-col pt-24 pb-20">

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 mt-4 space-y-8">
        
        {/* Custom Frequency Panel */}
        <div className="bg-black/40 backdrop-blur-md border border-mystic-primary/30 rounded-2xl p-6 flex flex-col items-center shadow-lg">
          <h2 className="text-mystic-text-muted uppercase tracking-widest text-sm mb-4">Özel Frekans</h2>
          
          <div className="flex items-baseline mb-6">
            <span className="text-6xl font-bold text-white tabular-nums">{customHz}</span>
            <span className="text-2xl font-bold text-mystic-primary ml-2">Hz</span>
          </div>

          <div className="flex items-center w-full gap-4 mb-8">
            <button onClick={() => adjustCustomHz(-1)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition shrink-0 text-white">
              <Minus size={24} />
            </button>
            <input 
              type="range" 
              min="1" max="2000" 
              value={customHz} 
              onChange={handleSliderChange}
              className="flex-1 accent-mystic-primary"
            />
            <button onClick={() => adjustCustomHz(1)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition shrink-0 text-white">
              <Plus size={24} />
            </button>
          </div>

          <button 
            onClick={togglePlay}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${isPlaying ? 'bg-red-500 shadow-red-500/50' : 'bg-mystic-primary shadow-mystic-primary/50'}`}
          >
            {isPlaying ? <Square size={32} className="text-black" /> : <Play size={36} className="text-black ml-2" />}
          </button>
        </div>

        {/* Timer Selection */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
          <h3 className="text-white font-bold mb-4">Dinleme Süresi:</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Örn: 3.45" 
                value={customTimerStr}
                onChange={(e) => setCustomTimerStr(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white w-24 text-center focus:outline-none focus:border-mystic-primary"
              />
              <button onClick={applyCustomTimer} className="bg-white/10 hover:bg-white/20 text-mystic-primary font-bold px-4 py-2 rounded-lg transition">
                Ayarla
              </button>
            </div>

            {[
              { label: '∞', value: null },
              { label: '5 Dk', value: 5 },
              { label: '15 Dk', value: 15 },
            ].map((opt, i) => {
              const isSelected = selectedDuration === opt.value && !customTimerStr;
              return (
                <button 
                  key={i}
                  onClick={() => { setCustomTimerStr(''); handleDurationChange(opt.value); }}
                  className={`px-4 py-2 rounded-full border transition ${isSelected ? 'bg-mystic-primary border-mystic-primary text-black font-bold' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}`}
                >
                  <span className={opt.label === '∞' ? 'text-xl leading-none' : ''}>{opt.label}</span>
                </button>
              )
            })}
          </div>

          {timeRemaining > 0 && isPlaying && (
            <div className="mt-4 text-center text-mystic-primary font-bold tracking-widest">
              KALAN SÜRE: {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* Chakra Frequencies */}
        <div>
          <button 
            className="flex items-center justify-center w-full py-4 text-mystic-text-muted hover:text-mystic-text transition gap-2"
            onClick={() => setShowChakras(!showChakras)}
          >
            <span className="uppercase tracking-widest text-sm font-bold">Çakra Frekansları</span>
            {showChakras ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className={`space-y-4 transition-all duration-500 overflow-hidden ${showChakras ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {FREQUENCIES.map((freq) => {
              const isActive = activeFreq?.id === freq.id;
              return (
                <div 
                  key={freq.id}
                  onClick={() => togglePresetPlay(freq)}
                  className={`group relative flex flex-col p-4 rounded-xl border cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isActive ? 'bg-white/5 border-transparent' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
                  style={{ borderColor: isActive ? freq.color : undefined }}
                >
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300" 
                    style={{ background: isActive ? `linear-gradient(90deg, ${freq.color} 0%, transparent 100%)` : 'transparent' }} 
                  />
                  
                  <div className="flex items-start">
                    <div 
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 mr-4 z-10 transition-colors"
                      style={{ borderColor: freq.color, backgroundColor: isActive ? `${freq.color}20` : 'transparent' }}
                    >
                      {isActive && isPlaying ? <Square size={16} color={freq.color} /> : <Play size={20} color={freq.color} className="ml-1" />}
                    </div>

                    <div className="flex-1 z-10">
                      <div className="flex items-baseline mb-1 gap-2">
                        <span className="text-lg font-bold" style={{ color: freq.color }}>{freq.hz} Hz</span>
                        <span className="text-sm font-bold text-white">— {freq.name}</span>
                      </div>
                      <p className="text-xs text-mystic-text-muted mb-2">{freq.desc}</p>
                      
                      {isActive && (
                        <div className="mt-2 p-3 rounded-lg border bg-black/50" style={{ borderColor: `${freq.color}40` }}>
                          <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: freq.color }}>Odak Niyeti:</span>
                          <span className="text-sm text-gray-200 italic">"{freq.intent}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Organ Frequencies */}
        <div>
          <button 
            className="flex items-center justify-center w-full py-4 text-mystic-text-muted hover:text-mystic-text transition gap-2"
            onClick={() => setShowOrgans(!showOrgans)}
          >
            <span className="uppercase tracking-widest text-sm font-bold">Organ Şifalandırma Frekansları</span>
            {showOrgans ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className={`space-y-4 transition-all duration-500 overflow-hidden ${showOrgans ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <p className="text-center text-mystic-text-muted text-xs italic px-4 mb-4">
              * Araştırmacı Barbara Hero'nun sağlıklı organlardaki ses dalgası ölçümlerine dayanır. Ortalama dinleme süresi 15 dakikadır.
            </p>
            
            {ORGAN_FREQUENCIES.map((freq) => {
              const isActive = activeFreq?.id === freq.id;
              return (
                <div 
                  key={freq.id}
                  onClick={() => {
                    togglePresetPlay(freq);
                    if (activeFreq?.id !== freq.id) {
                      handleDurationChange(15);
                      setCustomTimerStr('');
                    }
                  }}
                  className={`group relative flex flex-col p-4 rounded-xl border cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isActive ? 'bg-white/5 border-transparent' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
                  style={{ borderColor: isActive ? freq.color : undefined }}
                >
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300" 
                    style={{ background: isActive ? `linear-gradient(90deg, ${freq.color} 0%, transparent 100%)` : 'transparent' }} 
                  />
                  
                  <div className="flex items-start">
                    <div 
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 mr-4 z-10 transition-colors"
                      style={{ borderColor: freq.color, backgroundColor: isActive ? `${freq.color}20` : 'transparent' }}
                    >
                      {isActive && isPlaying ? <Square size={16} color={freq.color} /> : <Play size={20} color={freq.color} className="ml-1" />}
                    </div>

                    <div className="flex-1 z-10">
                      <div className="flex items-baseline mb-1 gap-2">
                        <span className="text-lg font-bold" style={{ color: freq.color }}>{freq.hz} Hz</span>
                        <span className="text-sm font-bold text-white">— {freq.name}</span>
                      </div>
                      <p className="text-xs text-mystic-text-muted mb-2">{freq.desc}</p>
                      
                      {isActive && (
                        <div className="mt-2 p-3 rounded-lg border bg-black/50" style={{ borderColor: `${freq.color}40` }}>
                          <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: freq.color }}>Odak Niyeti:</span>
                          <span className="text-sm text-gray-200 italic">"{freq.intent}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
