"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Compass, Fingerprint, Hexagon, MoonStar, Lock, Activity, AlertCircle, X } from 'lucide-react';
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
      {/* Backgrounds */}
            
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
                } else {
                  router.push(tool.link);
                }
              }}
              className="group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.3)] cursor-pointer"
              style={{ borderColor: `rgba(255,255,255,0.1)` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${tool.color}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `rgba(255,255,255,0.1)`;
              }}
            >
              {tool.isLocked && (
                <div className="absolute top-6 right-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm z-10 animate-pulse">
                  <Lock size={12} /> Usta Seviyesi
                </div>
              )}
              <div 
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-20 -mt-20 opacity-20 transition-opacity duration-500 group-hover:opacity-40"
                style={{ backgroundColor: tool.color }}
              />
              
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border transition-colors duration-300"
                style={{ backgroundColor: `${tool.color}15`, borderColor: `${tool.color}40`, color: tool.color }}
              >
                {tool.icon}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                {tool.title}
              </h2>
              
              <p className="text-mystic-text-muted leading-relaxed">
                {tool.description}
              </p>

              <div className="mt-8 flex items-center text-sm font-bold tracking-widest uppercase transition-colors" style={{ color: tool.color }}>
                Analize Başla <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowLockModal(false)}>
          <div 
            className="bg-[#111] border border-[#D4AF37]/30 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-[#D4AF37] mx-auto mb-4 flex justify-center"><AlertCircle size={48} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Analiz Kilitli</h3>
            <p className="text-mystic-text-muted text-sm mb-6">
              Kabalistik 4 Alem analizi en yüksek düzeyde ruhsal sentez içerdiğinden sadece Usta Seviyesi (Master) ve üzeri üyelere özeldir.
              Dilerseniz üyeliğinizi Usta seviyesine yükselterek bu analize ve tüm premium içeriklere erişim sağlayabilirsiniz.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowLockModal(false);
                  router.push(`/membership`);
                }}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg"
              >
                Usta Seviyesine Yüksel
              </button>
              <button 
                onClick={() => setShowLockModal(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3 px-4 rounded-xl transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
