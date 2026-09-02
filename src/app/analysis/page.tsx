"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Compass, Fingerprint, Hexagon, MoonStar, Lock, Activity, AlertCircle, X, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ToolItem {
  id: string;
  title: string;
  description: string;
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
      id: 'rectification',
      title: 'Doğum Saati Belirleme',
      description: 'Doğum saatinizi tam bilmiyor musunuz? Yaşam olaylarınızla kesin doğum dakikanızı hesaplayın.',
      icon: <Clock size={32} />,
      color: '#E0AA3E',
      link: '/analysis/rectification'
    },
    {
      id: 'kabbalah',
      title: 'Kabalistik 4 Alem',
      description: 'Sefirot ağacındaki kadersel sıçrama noktalarınızı bulun.',
      icon: <MoonStar size={32} />,
      color: '#D4AF37',
      link: '/analysis/kabbalah',
      isLocked: true
    },
    {
      id: 'astrology',
      title: 'Doğum Haritası',
      description: 'Gezegenlerin doğum anınızdaki konumlarıyla ruhunuzun şifresini çözün.',
      icon: <MoonStar size={32} />,
      color: '#D4AF37',
      link: '/analysis/astrology'
    },
    {
      id: 'transits',
      title: 'Anlık Gökyüzü',
      description: 'Şu anki transitlerin (gezegen hareketlerinin) günlük hayatınıza ve çakralarınıza olan etkisi.',
      icon: <Compass size={32} />,
      color: '#32ADE6',
      link: '/analysis/transits'
    },
    {
      id: 'numerology',
      title: 'Numeroloji',
      description: 'Doğum tarihinizle Kader Sayınızı, Yaşam Yolunuzu ve ruhsal potansiyelinizi öğrenin.',
      icon: <Hexagon size={32} />,
      color: '#AF52DE',
      link: '/analysis/numerology'
    },
    {
      id: 'human-design',
      title: 'Human Design (Tasarımınız)',
      description: 'Enerji Tipinizi, Otoritenizi ve Stratejinizi öğrenerek hayatın akışında doğru kararlar verin.',
      icon: <Fingerprint size={32} />,
      color: '#34C759',
      link: '/analysis/human-design'
    },
    {
      id: 'chakra',
      title: 'Çakra',
      description: 'Anlık olarak çakra durumunuzu analiz edin.',
      icon: <Sparkles size={32} />,
      color: '#FF2D55',
      link: '/analysis/chakra'
    },
    {
      id: 'schumann',
      title: 'Schumann Rezonansı',
      description: 'Dünya\'nın kalp atışlarını ve anlık elektromanyetik alan etkilerini takip edin.',
      icon: <Activity size={32} />,
      color: '#00E5FF',
      link: '/analysis/schumann'
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-mystic-primary/10 border border-mystic-primary/30 text-mystic-primary mb-6">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary to-[#FFD700] mb-4">
            Ruhsal Analiz Merkezi
          </h1>
          <p className="text-lg text-mystic-text-muted max-w-2xl mx-auto">
            Astroloji, Numeroloji ve Human Design öğretilerini kullanarak kendinizi daha derin bir boyutta keşfedin. Bilgi, kendi karanlığınızı aydınlatacak en güçlü ışıktır.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              className="bg-mystic-surface/40 backdrop-blur-md rounded-3xl p-8 border border-mystic-surface-light hover:border-mystic-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] group relative overflow-hidden flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div 
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: tool.color }}
                >
                  {tool.icon}
                </div>
                {tool.isLocked && !isMasterOrAdmin && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-mystic-text-muted text-xs font-semibold">
                    <Lock size={12} className="text-mystic-primary" />
                    <span>Usta Seviyesi</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-mystic-accent transition-colors flex items-center gap-2">
                  {tool.title}
                </h3>
                <p className="text-mystic-text-muted text-sm leading-relaxed mb-6">
                  {tool.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-mystic-primary group-hover:text-mystic-accent transition-colors">
                <span>Analizi Başlat</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
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
