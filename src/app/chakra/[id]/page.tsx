"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, ArrowLeft, Play, Info, Leaf, BookOpen, Activity, Square, AlertTriangle, Loader2 } from 'lucide-react';
import { useContent } from '@/lib/useContent';

export default function ChakraDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Audio Context Ref for inline meditation playing
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const { data: chakraData } = useContent<{ chakras: Record<string, any>; topics: any[] }>(
    '/api/content/chakras',
  );
  const { data: lessonsData } = useContent<Record<string, any>>('/api/content/chakra-lessons');
  const { data: guidelinesData } = useContent<any[]>('/api/content/guidelines');

  const CHAKRAS = chakraData?.chakras ?? {};
  const TOPICS = chakraData?.topics ?? [];
  const LESSONS = lessonsData ?? {};
  const GUIDELINES = guidelinesData ?? [];

  const chakra = CHAKRAS[id];

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

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopAudio]);

  const handleTogglePlay = (freq: number) => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(freq);
      setIsPlaying(true);
    }
  };

  if (!chakraData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-mystic-dark">
        <Loader2 className="animate-spin text-mystic-primary" size={36} />
      </div>
    );
  }

  if (!chakra) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-mystic-dark">
        <p>Çakra bulunamadı.</p>
        <button onClick={() => router.push('/')} className="ml-4 text-mystic-primary underline">Ana Sayfaya Dön</button>
      </div>
    );
  }

  const handleTopicPress = (topicId: string) => {
    // When closing the meditation accordion, stop playing automatically.
    if (expandedTopicId === 'meditasyon' && topicId !== 'meditasyon' && isPlaying) {
        stopAudio();
        setIsPlaying(false);
    }
    setExpandedTopicId(expandedTopicId === topicId ? null : topicId);
  };

  const renderExpandedContent = (topicId: string) => {
    const lessonKey = `${id}_${topicId}`;
    const lessonData = LESSONS[lessonKey];

    if (!lessonData) {
      return (
        <div className="mt-4 pt-4 border-t border-mystic-surface-light text-center text-mystic-text-muted italic">
          Bu dersin kadim parşömeni henüz yazılmadı...
        </div>
      );
    }

    return (
      <div className="mt-4 pt-4 border-t border-mystic-surface-light">
        {lessonData.image && (
          <div className="mb-6 rounded-xl overflow-hidden border border-mystic-primary/30 relative" style={{ borderColor: `${chakra.color}40` }}>
            <img 
              src={lessonData.image.uri} 
              alt={lessonData.title} 
              className="w-full h-auto max-h-[500px] object-contain bg-black/50"
            />
            {/* Play Button Overlay for Meditation */}
            {topicId === 'meditasyon' && lessonData.frequency && (
              <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center backdrop-blur-[1px] hover:bg-black/40 transition-colors duration-300">
                <button 
                  onClick={() => handleTogglePlay(lessonData.frequency)}
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all border-2 backdrop-blur-md group"
                  style={{ 
                    backgroundColor: isPlaying ? 'rgba(239, 68, 68, 0.15)' : `${chakra.color}20`,
                    borderColor: isPlaying ? 'rgba(239, 68, 68, 0.8)' : `${chakra.color}80`,
                    boxShadow: `0 0 20px ${isPlaying ? 'rgba(239, 68, 68, 0.3)' : `${chakra.color}40`}` 
                  }}
                >
                  {isPlaying ? <Square size={32} className="text-white/90 group-hover:text-white transition-colors" /> : <Play size={36} className="text-white/90 ml-2 group-hover:text-white transition-colors" />}
                </button>
                <div className="mt-4 text-white font-bold bg-black/60 px-4 py-1 rounded-full text-sm">
                  {lessonData.frequency} Hz Frekansı {isPlaying ? 'Durdur' : 'Çal'}
                </div>
              </div>
            )}
          </div>
        )}

        {lessonData.astrology && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex-1 bg-mystic-primary/5 border border-mystic-primary/20 rounded-xl p-3 flex flex-col items-center justify-center">
              <span className="text-2xl text-mystic-text mb-1">{lessonData.astrology.planetSymbol}</span>
              <span className="text-[10px] text-mystic-text-muted uppercase tracking-widest mb-1">Gezegen</span>
              <span className="text-sm font-bold" style={{ color: chakra.color }}>{lessonData.astrology.planet}</span>
            </div>
            
            <div className="flex-1 bg-mystic-primary/5 border border-mystic-primary/20 rounded-xl p-3 flex flex-col items-center justify-center">
              <span className="text-2xl text-mystic-text mb-1">{lessonData.astrology.signs.map((s: any) => s.symbol).join(' ')}</span>
              <span className="text-[10px] text-mystic-text-muted uppercase tracking-widest mb-1">Burç</span>
              <span className="text-sm font-bold text-center" style={{ color: chakra.color }}>{lessonData.astrology.signs.map((s: any) => s.name).join(' & ')}</span>
            </div>

            <div className="flex-1 bg-mystic-primary/5 border border-mystic-primary/20 rounded-xl p-3 flex flex-col items-center justify-center">
              <span className="text-2xl text-mystic-text mb-1">📅</span>
              <span className="text-[10px] text-mystic-text-muted uppercase tracking-widest mb-1">Gün</span>
              <span className="text-sm font-bold" style={{ color: chakra.color }}>{lessonData.astrology.day}</span>
            </div>
          </div>
        )}

        <div className="text-sm text-mystic-text leading-relaxed italic whitespace-pre-wrap mb-6">
          {lessonData.content}
        </div>

        {topicId === 'meditasyon' && (
          <div className="mt-6 border border-yellow-500/30 rounded-xl overflow-hidden shadow-lg">
            <button 
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="w-full p-4 flex items-center justify-between bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center text-yellow-500">
                <AlertTriangle size={20} className="mr-3" />
                <span className="font-bold tracking-wide">Önemli Hususlar (Mutlaka Okuyun)</span>
              </div>
              <div className="text-yellow-500">
                {showGuidelines ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            <div className={`grid transition-all duration-500 ease-in-out ${showGuidelines ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="p-4 bg-black/40 space-y-4">
                  {GUIDELINES.map((g, i) => (
                    <div key={i} className="flex border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 mt-1" style={{ backgroundColor: `${g.color}20`, borderColor: `${g.color}40`, borderWidth: 1 }}>
                        <span style={{ color: g.color }} className="font-bold text-xs">{i+1}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1 text-white">{g.title}</h4>
                        <p className="text-xs text-mystic-text-muted leading-relaxed">{g.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'information-circle-outline': return <Info size={24} />;
      case 'leaf-outline': return <Leaf size={24} />;
      case 'book-outline': return <BookOpen size={24} />;
      case 'body-outline': return <Activity size={24} />;
      default: return <Info size={24} />;
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col pb-20">
                  
      <div 
        className="fixed inset-0 opacity-40 -z-10 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 10%, ${chakra.color}60 50%, transparent 90%)`
        }}
      />

      <header className="flex items-center pt-24 md:pt-28 px-6 pb-6 border-b border-mystic-primary/30 bg-mystic-dark/50 backdrop-blur-md relative z-40">
        <button onClick={() => router.push('/')} className="mr-4 p-2 hover:bg-white/10 rounded-full transition cursor-pointer">
          <ArrowLeft size={28} className="text-mystic-primary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold drop-shadow-md" style={{ color: chakra.color }}>
            {chakra.title}
          </h1>
          <p className="text-sm text-mystic-text-muted italic tracking-wide">
            {chakra.subtitle}
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 mt-4 space-y-8">
        
        {/* Static Meditation Section */}
        <div className="bg-black/40 backdrop-blur-md border rounded-2xl overflow-hidden shadow-lg p-5" style={{ borderColor: `${chakra.color}60` }}>
           <div className="flex items-center mb-2">
              <div 
                className="w-12 h-12 rounded-full border flex items-center justify-center mr-4"
                style={{ backgroundColor: `${chakra.color}20`, borderColor: chakra.color, color: chakra.color }}
              >
                 <Activity size={24} />
              </div>
              <h2 className="text-xl font-bold tracking-wide" style={{ color: chakra.color }}>
                Aktivasyon ve Meditasyon
              </h2>
           </div>
           {renderExpandedContent('meditasyon')}
        </div>

        {/* Accordions for other topics */}
        <div className="space-y-4">
          {TOPICS.filter(t => t.id !== 'meditasyon').map((topic) => {
            const isExpanded = expandedTopicId === topic.id;

            return (
              <div 
                key={topic.id}
                className="rounded-2xl overflow-hidden transition-all duration-300"
              >
                <div 
                  className={`p-5 backdrop-blur-md border cursor-pointer transition-colors duration-300 ${isExpanded ? 'bg-black/60' : 'bg-black/40'}`}
                  style={{ borderColor: isExpanded ? `${chakra.color}80` : 'rgba(212, 175, 55, 0.3)' }}
                  onClick={() => handleTopicPress(topic.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div 
                        className="w-12 h-12 rounded-full border flex items-center justify-center mr-4"
                        style={{ backgroundColor: `${chakra.color}20`, borderColor: chakra.color, color: chakra.color }}
                      >
                        {getIcon(topic.icon)}
                      </div>
                      <h2 className={`text-lg font-bold tracking-wide transition-colors ${isExpanded ? '' : 'text-mystic-text'}`} style={{ color: isExpanded ? chakra.color : undefined }}>
                        {topic.title}
                      </h2>
                    </div>
                    
                    <div style={{ color: '#8f9bb3' }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  <div 
                    className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      {isExpanded && renderExpandedContent(topic.id)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
