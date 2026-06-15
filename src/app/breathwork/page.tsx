"use client";

import React, { useState, useEffect } from 'react';
import { Play, Square, X, Wind } from 'lucide-react';

export const TECHNIQUES = [
  { id: 'nadishodhan', name: 'Nadi Shodhan', desc: 'İda ve Pingala Dengesi', instruction: 'Gözlerinizi kapatın. Sol burun deliğinden yavaşça, derin ve yumuşak nefes alın. Sol deliği yüzük ve serçe parmaklarınızla kapatıp sağdan nefes verin. Çiçek koklar gibi nazikçe yapın. Bu egzersiz bedeninizdeki 72000 nadi kanalını temizler.', phases: [{ name: 'SOL AL', time: 4 }, { name: 'SAĞ VER', time: 6 }, { name: 'SAĞ AL', time: 4 }, { name: 'SOL VER', time: 6 }] },
  { id: '448', name: '4-4-8 Nefesi', desc: 'Derin Gevşeme', instruction: 'Nefesi 4 saniye boyunca burnunuzdan alın. 4 saniye boyunca nefesinizi tutun. Ardından 8 saniye boyunca ağzınızdan yavaşça nefesinizi verin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 8 }] },
  { id: '478', name: 'Kadim 4-7-8', desc: 'Uyku ve Sakinlik', instruction: 'Dilinizi üst dişlerinizin arkasına yerleştirin. Nefesi burnunuzdan karnınıza (diyaframa) doğru alın. Ağzınızdan güçlü bir "hııış" sesiyle verin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 7 }, { name: 'NEFES VER', time: 8 }] },
  { id: 'box', name: 'Kare Nefes', desc: 'Odaklanma ve Denge', instruction: 'Dik oturun. Burnunuzdan göğüs kafesinizi eşit genişleterek alın. Nefesi tutarken omuzlarınızı kasmayın. Akciğerler boşaldığında huzurla bekleyin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 4 }, { name: 'BEKLE', time: 4 }] },
  { id: 'ujjayi', name: 'Ateş Nefesi', desc: 'Enerji ve Canlılık', instruction: 'Sadece burundan alın ve verin. Karın kaslarınızı bir körük gibi kullanarak nefesi hızlı ve ritmik bir şekilde itin. Göğüs hareketsiz kalmalıdır.', phases: [{ name: 'NEFES AL', time: 3 }, { name: 'NEFES VER', time: 3 }] },
  { id: 'relax', name: 'Stres Savar', desc: 'Anksiyete Giderici', instruction: 'Sadece burnunuzdan derin diyafram nefesi alın. Verirken dudaklarınızı ıslık çalacakmış gibi büzün ve havayı çok yavaşça üfleyerek verin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 6 }, { name: 'BEKLE', time: 2 }] },
  { id: 'bhramari', name: 'Arı Nefesi', desc: 'Zihni Susturur', instruction: 'Gözlerinizi ve kulaklarınızı hafifçe kapatın. Burnunuzdan derin nefes alın. Verirken kapalı ağızla arı gibi "mmmm" diye mırıldanıp titreşimi beyninizde hissedin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'NEFES VER', time: 8 }] },
  { id: 'sama', name: 'Sama Vritti', desc: 'Sağ-Sol Lob Dengesi', instruction: 'Beyin loblarını eşitler. Omurganız dik olsun. Akciğerlerinize dolan ve boşalan havanın eşit sürede (6 saniye) olmasına tam odaklanın.', phases: [{ name: 'NEFES AL', time: 6 }, { name: 'NEFES VER', time: 6 }] },
  { id: 'tummo', name: 'Tummo', desc: 'İçsel Isı ve Güç', instruction: 'Derin nefes alıp karın kaslarınızı ve pelvik tabanınızı sıkın (kök kilidi). Bedendeki sıcaklığın arttığını imgeleyin. Ardından çok yavaşça nefesi verin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 8 }] },
];

export default function BreathworkPage() {
  const [activeTech, setActiveTech] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundCount, setRoundCount] = useState(0);

  useEffect(() => {
    if (!isPlaying || !activeTech) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, activeTech]);

  useEffect(() => {
    if (timeLeft === 0 && isPlaying && activeTech) {
      const nextIndex = (phaseIndex + 1) % activeTech.phases.length;
      setPhaseIndex(nextIndex);
      setTimeLeft(activeTech.phases[nextIndex].time);
      
      if (nextIndex === 0) {
        setRoundCount((r) => r + 1);
      }
    }
  }, [timeLeft, isPlaying, activeTech, phaseIndex]);

  const handleStart = (tech: any) => {
    setActiveTech(tech);
    setPhaseIndex(0);
    setTimeLeft(tech.phases[0].time);
    setRoundCount(0);
    setIsPlaying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStop = () => {
    setIsPlaying(false);
    setActiveTech(null);
  };

  const getScaleClass = () => {
    if (!activeTech) return 'scale-100';
    const name = activeTech.phases[phaseIndex].name;
    if (name.includes('AL')) return 'scale-150';
    if (name.includes('VER')) return 'scale-75';
    // For 'TUT' or 'BEKLE', match the previous action
    const prevIndex = (phaseIndex - 1 + activeTech.phases.length) % activeTech.phases.length;
    const prevName = activeTech.phases[prevIndex].name;
    if (prevName.includes('AL')) return 'scale-150';
    return 'scale-75';
  };

  const currentPhase = activeTech ? activeTech.phases[phaseIndex] : null;

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center">
            
      <div className="max-w-4xl w-full relative z-10">
        <h1 className="text-4xl font-bold text-mystic-primary mb-6 drop-shadow-md text-center md:text-left">Nefes Egzersizleri</h1>
        <p className="text-mystic-text-muted text-lg mb-8 text-center md:text-left">
          Yaşam enerjisini (Prana) doğru kullanarak bedeninizi ve zihninizi şifalandırın.
        </p>

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
            
            {/* Animated Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center my-12">
              {/* Outer glowing rings */}
              <div className={`absolute inset-0 rounded-full border border-mystic-primary/20 transition-all ease-in-out ${currentPhase?.time ? `duration-[${currentPhase.time}000ms]` : 'duration-1000'} ${getScaleClass()}`} />
              <div className={`absolute inset-4 rounded-full border border-mystic-primary/40 transition-all ease-in-out delay-75 ${currentPhase?.time ? `duration-[${currentPhase.time}000ms]` : 'duration-1000'} ${getScaleClass()}`} />
              
              {/* Core solid circle */}
              <div className={`w-32 h-32 bg-gradient-to-tr from-mystic-primary to-mystic-accent rounded-full shadow-[0_0_50px_rgba(212,175,55,0.5)] flex flex-col items-center justify-center z-10 transition-all ease-in-out ${currentPhase?.time ? `duration-[${currentPhase.time}000ms]` : 'duration-1000'} ${getScaleClass()}`}>
                <span className="text-black font-bold text-lg tracking-widest">{currentPhase?.name}</span>
                <span className="text-black font-black text-4xl">{timeLeft}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="flex items-center gap-2 bg-mystic-primary text-black px-8 py-3 rounded-full font-bold hover:bg-[#D4AF37] transition-colors"
              >
                {isPlaying ? <><Square size={18} /> Duraklat</> : <><Play size={18} /> Devam Et</>}
              </button>
            </div>
          </div>
        )}

        {/* Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TECHNIQUES.map((tech) => (
            <div key={tech.id} className={`bg-mystic-surface/80 backdrop-blur-md border rounded-2xl overflow-hidden transition-colors group p-6 ${activeTech?.id === tech.id ? 'border-mystic-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-mystic-surface-light hover:border-mystic-primary/50'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-mystic-text mb-1 group-hover:text-mystic-accent transition-colors">{tech.name}</h3>
                  <p className="text-mystic-primary-light text-sm font-medium">{tech.desc}</p>
                </div>
                {activeTech?.id !== tech.id && (
                  <button onClick={() => handleStart(tech)} className="p-2 bg-mystic-primary/10 text-mystic-primary hover:bg-mystic-primary hover:text-black rounded-full transition-colors border border-mystic-primary/30">
                    <Play size={18} />
                  </button>
                )}
              </div>
              
              <div className="bg-mystic-dark/60 p-4 rounded-xl border border-mystic-surface-light/50 mb-4">
                <p className="text-mystic-text-muted text-sm leading-relaxed italic">
                  {tech.instruction}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tech.phases.map((phase, idx) => (
                  <div key={idx} className="bg-mystic-surface-light/50 px-3 py-1.5 rounded-lg border border-mystic-surface-light text-xs font-medium text-mystic-text flex items-center gap-2">
                    <span className="text-mystic-accent">{phase.name}</span>
                    <span className="text-mystic-text-muted">{phase.time}s</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
