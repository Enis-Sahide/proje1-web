"use client";

import React from 'react';
import ExploreSection from '@/features/astrology/components/ExploreSection';
import { useContent } from '@/lib/useContent';
import PlanetaryHourWidget from '@/features/astrology/components/PlanetaryHourWidget';
import { ChevronDown, Quote, Loader2, Smartphone, Sparkles, ChevronRight } from 'lucide-react';
import MoonCyclesWidget from '@/features/astrology/components/MoonCyclesWidget';
import SchumannMiniWidget from '@/features/astrology/components/SchumannMiniWidget';
import Link from 'next/link';
import { PLANET_DAY_GUIDELINES } from '@/utils/PlanetaryHours';

// CHAKRA_MODULES içeriği DB'den gelir (/api/content/chakras → modules)

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export default function Home() {
  const [affirmation, setAffirmation] = React.useState<any>(null);
  const [dayName, setDayName] = React.useState<string>('');
  const [isNavigating, setIsNavigating] = React.useState<string | null>(null);
  const { data: affirmations } = useContent<Record<number, { text: string; author: string }>>(
    '/api/content/affirmations',
  );
  const { data: chakraData } = useContent<{ modules: any[] }>('/api/content/chakras');
  const CHAKRA_MODULES = chakraData?.modules ?? [];

  React.useEffect(() => {
    const day = new Date().getDay();
    setDayName(DAY_NAMES[day]);
    if (affirmations) setAffirmation(affirmations[day]);
  }, [affirmations]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      
      

      {/* Hero Section & Chakras */}
      <section className="flex-grow flex flex-col justify-center items-center py-12 md:py-24 px-4 relative z-10 min-h-screen">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mystic-accent via-mystic-text to-mystic-primary mb-4 tracking-tight drop-shadow-lg py-2">
              İçsel Uyanış
            </h1>
            <div className="w-full max-w-4xl mx-auto overflow-hidden relative h-8 mt-2">
              <p className="text-mystic-text-muted text-lg md:text-xl whitespace-nowrap absolute animate-marquee w-max">
                Gerçek katman katmandır ve yapman gereken unuttuklarını hatırlayarak katmanları açmaktır. Hatırladıkça aydınlık artacak ve ışığın kaynağını bulacaksın...
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-mystic-accent text-center mb-6">7 İnisiyasyon Katmanı</h2>

          {/* Mobile App Download Prompt Banner */}
          <div className="max-w-md mx-auto mb-12 w-full animate-pulse">
            <Link 
              href="/test"
              className="flex items-center gap-4 bg-gradient-to-r from-mystic-primary/20 via-mystic-accent/15 to-mystic-primary/20 border border-mystic-primary/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:border-mystic-primary/60 transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="p-2.5 bg-mystic-primary/10 text-mystic-primary rounded-xl border border-mystic-primary/20 shrink-0">
                <Smartphone size={20} className="animate-pulse" />
              </div>
              <div className="flex-grow text-left">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  7LAYERS Android Uygulaması Yayında!
                  <Sparkles className="text-mystic-accent shrink-0" size={14} />
                </h4>
                <p className="text-[11px] text-mystic-text-muted mt-0.5 leading-snug">
                  Google Play test ekibimize katılmak ve hemen indirmek için tıklayın.
                </p>
              </div>
              <ChevronRight size={18} className="text-mystic-primary" />
            </Link>
          </div>

          {/* Main Layout Grid */}
          <div className="mb-20 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full">
            
            {/* Left: Gezegen Saati & Günün Mesajı */}
            <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-end order-2 lg:order-1 gap-6">
              <PlanetaryHourWidget />
              {affirmation && (
                <div className="bg-mystic-surface/50 backdrop-blur-md rounded-2xl p-6 border border-mystic-surface-light w-full max-w-sm shadow-xl text-center lg:text-right relative overflow-hidden">
                  <div className="absolute -top-4 -left-4 text-mystic-primary/20">
                    <Quote size={80} />
                  </div>
                  <h3 className="text-mystic-primary text-sm font-bold uppercase tracking-widest mb-1">Günün Mesajı</h3>
                  <div className="text-mystic-text-muted text-xs mb-4">{dayName}</div>
                  <p className="text-mystic-text text-base italic leading-relaxed relative z-10 mb-4">
                    "{affirmation.text}"
                  </p>
                  <p className="text-mystic-accent font-semibold text-sm mb-4">— {affirmation.author}</p>
                  
                  {/* Planetary Day Guidelines */}
                  {(() => {
                    const day = new Date().getDay();
                    const planetKeys = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
                    const key = planetKeys[day];
                    const guide = PLANET_DAY_GUIDELINES[key];
                    if (!guide) return null;
                    return (
                      <div className="border-t border-white/5 pt-4 mt-2 text-left text-xs leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-2 justify-center lg:justify-end">
                          <span className="font-extrabold uppercase tracking-wider text-mystic-accent" style={{ color: guide.color }}>
                            {guide.symbol} {guide.name} Günü Enerjisi
                          </span>
                        </div>
                        <div className="space-y-2 text-mystic-text-muted">
                          <div>
                            <strong className="text-emerald-400 block mb-0.5">✓ Yapılması Önerilenler:</strong>
                            {guide.do}
                          </div>
                          <div>
                            <strong className="text-rose-400 block mb-0.5">✗ Kaçınılması Gerekenler:</strong>
                            {guide.avoid}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Center: Anatomical View */}
            <div className="relative w-full max-w-[320px] md:max-w-[400px] bg-black/20 backdrop-blur-md rounded-[3rem] border border-mystic-surface-light shadow-2xl overflow-hidden order-1 lg:order-2 shrink-0">
              <div className="relative w-full">
                {/* Silhouette Image */}
                <img 
                  src="https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/human_silhouette.png" 
                  alt="Human Silhouette"
                  className="w-full h-auto opacity-80 mix-blend-screen block"
                />

                {CHAKRA_MODULES.map((mod) => (
                  <Link 
                    href={`/chakra/${mod.id}`}
                    key={mod.id} 
                    onClick={() => setIsNavigating(mod.title)}
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer w-64 z-10"
                    style={{ top: mod.top }}
                  >
                    <div 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:z-20 bg-black/80 backdrop-blur-md"
                      style={{ borderColor: mod.color, boxShadow: `0 0 15px ${mod.color}90` }}
                    >
                      <span className="text-sm md:text-base font-bold drop-shadow-md" style={{ color: mod.color }}>{mod.id}</span>
                    </div>
                    
                    <div className="absolute top-1/2 -translate-y-1/2 left-[calc(50%+25px)] md:left-[calc(50%+30px)] bg-mystic-dark/95 px-4 py-2 rounded-xl border border-mystic-surface-light opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl transform -translate-x-4 group-hover:translate-x-0">
                      <span className="font-bold text-sm block" style={{ color: mod.color }}>{mod.title}</span>
                      <span className="text-xs text-mystic-text-muted block">{mod.subtitle}</span>
                      <span className="text-[10px] text-mystic-primary mt-1 opacity-80 block">İncele →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Yıllık Ay Döngüleri & Schumann Mini */}
            <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start order-3 lg:order-3 gap-6">
              <SchumannMiniWidget />
              <MoonCyclesWidget />
            </div>

          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-mystic-text-muted hidden md:block">
          <ChevronDown size={32} />
        </div>
      </section>

      <ExploreSection />
      
      {isNavigating && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center text-white transition-opacity duration-300 animate-fadeIn">
          <div className="flex flex-col items-center p-8 rounded-3xl bg-mystic-dark/80 border border-mystic-primary/20 shadow-2xl max-w-sm w-full mx-4 text-center">
            <Loader2 className="animate-spin text-mystic-primary mb-6" size={48} />
            <h3 className="text-xl font-bold text-mystic-accent mb-2">
              {isNavigating}
            </h3>
            <p className="text-sm text-mystic-text-muted">
              Kadim katmanlar açılıyor, lütfen bekleyin...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

