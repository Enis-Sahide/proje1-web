"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Compass, Fingerprint, Hexagon, MoonStar, Lock, Activity, AlertCircle, Clock, Scroll, TreePine, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ToolItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  isLocked?: boolean;
}

export default function AnalysisPage() {
  const router = useRouter();
  const { role } = useAuth();
  const isMasterOrAdmin = role === 'master' || role === 'admin';
  const [showLockModal, setShowLockModal] = useState(false);

  const tools: ToolItem[] = [
    {
      id: 'cosmic-matrix',
      title: '7Layers Kozmik Matris',
      icon: <Compass size={22} />,
      color: '#F59E0B',
      link: '/analysis/cosmic-matrix',
      isLocked: true
    },
    {
      id: 'druid-tree',
      title: 'Kelt Druid Ağacı Analizi',
      icon: <TreePine size={22} />,
      color: '#10B981',
      link: '/analysis/druid-tree'
    },
    {
      id: 'incarnation',
      title: 'Karmik & Enkarnasyon',
      icon: <Scroll size={22} />,
      color: '#FFD700',
      link: '/analysis/incarnation',
      isLocked: true
    },
    {
      id: 'rectification',
      title: 'Doğum Saati Keşfi (Beta)',
      icon: <Clock size={22} />,
      color: '#E0AA3E',
      link: '/analysis/rectification'
    },
    {
      id: 'kabbalah',
      title: 'Kabalistik 4 Alem',
      icon: <MoonStar size={22} />,
      color: '#D4AF37',
      link: '/analysis/kabbalah'
    },
    {
      id: 'frekans-aynasi',
      title: 'Frekans Aynası (Canlı)',
      icon: <Sparkles size={22} />,
      color: '#0EA5E9',
      link: '/analysis/frekans-aynasi'
    },
    {
      id: 'astrology',
      title: 'Doğum Haritası',
      icon: <MoonStar size={22} />,
      color: '#D4AF37',
      link: '/analysis/astrology'
    },
    {
      id: 'transits',
      title: 'Anlık Gökyüzü',
      icon: <Compass size={22} />,
      color: '#32ADE6',
      link: '/analysis/transits'
    },
    {
      id: 'numerology',
      title: 'Numeroloji',
      icon: <Hexagon size={22} />,
      color: '#AF52DE',
      link: '/analysis/numerology'
    },
    {
      id: 'human-design',
      title: 'Human Design (Tasarımınız)',
      icon: <Fingerprint size={22} />,
      color: '#34C759',
      link: '/analysis/human-design'
    },
    {
      id: 'chakra',
      title: 'Çakra Analizi',
      icon: <Sparkles size={22} />,
      color: '#FF2D55',
      link: '/analysis/chakra'
    },
    {
      id: 'schumann',
      title: 'Schumann Rezonansı',
      icon: <Activity size={22} />,
      color: '#00E5FF',
      link: '/analysis/schumann'
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative overflow-x-hidden text-white">
      <div className="max-w-6xl mx-auto">
        {/* Başlık Alanı */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] mb-3 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Sparkles size={24} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] mb-2 tracking-tight">
            Ruhsal Analiz Merkezi
          </h1>
          <p className="text-sm text-mystic-text-muted max-w-xl mx-auto">
            Astroloji, Kabala, Numeroloji ve Human Design analizlerinize doğrudan ulaşın.
          </p>
        </div>

        {/* Kompakt ve Net Analiz Izgarası */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {tools.map((tool) => (
            <div 
              key={tool.id}
              onClick={(e) => {
                if (tool.isLocked && !isMasterOrAdmin) {
                  e.preventDefault();
                  setShowLockModal(true);
                  return;
                }
                router.push(tool.link);
              }}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-200 group cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden backdrop-blur-md shadow-sm hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 transition-transform duration-200 group-hover:scale-105 shrink-0"
                  style={{ color: tool.color }}
                >
                  {tool.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                      {tool.title}
                    </h3>
                  </div>
                  {tool.isLocked && !isMasterOrAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-md mt-0.5">
                      <Lock size={10} />
                      Usta Seviyesi
                    </span>
                  )}
                </div>
              </div>

              <div className="text-white/30 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowLockModal(false)}>
          <div 
            className="bg-[#111] border border-[#D4AF37]/30 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-[#D4AF37] mx-auto mb-4 flex justify-center"><AlertCircle size={48} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Usta Seviyesi Gerekli</h3>
            <p className="text-mystic-text-muted text-sm mb-6 leading-relaxed">
              Bu derin ezoterik analiz Usta Seviyesi (Master) üyelere özeldir. Bu derin analiz seviye sistemine özeldir, yakında açılacaktır.
            </p>
            <button 
              onClick={() => setShowLockModal(false)}
              className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/10"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
