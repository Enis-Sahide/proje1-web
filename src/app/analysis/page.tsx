"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Compass, Fingerprint, Hexagon, MoonStar, Moon, Lock, Activity, Clock, Scroll, TreePine, ChevronRight, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAnalysisAccess } from '@/hooks/useAnalysisAccess';
import AuthPromptModal from '@/components/AuthPromptModal';

interface ToolItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  isLocked?: boolean;
  isMasterPreview?: boolean;
}

export default function AnalysisPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const isMasterOrAdmin = role === 'master' || role === 'admin';
  const { isUnlocked: isCosmicUnlocked } = useAnalysisAccess('cosmic-matrix');
  const { isUnlocked: isIncarnationUnlocked } = useAnalysisAccess('incarnation');
  const [lockedTarget, setLockedTarget] = useState<{ id: string; title: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState('/checkout/guest');

  const tools: ToolItem[] = [
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
      id: 'moon-cycles',
      title: 'Ay Döngüleri & Tutulmalar',
      icon: <Moon size={22} />,
      color: '#E5C158',
      link: '/analysis/moon-cycles'
    },
    {
      id: 'chakra',
      title: 'Çakra Analizi',
      icon: <Sparkles size={22} />,
      color: '#FF2D55',
      link: '/analysis/chakra'
    },
    {
      id: 'frekans-aynasi',
      title: 'Frekans Aynası (Canlı)',
      icon: <Sparkles size={22} />,
      color: '#0EA5E9',
      link: '/analysis/frekans-aynasi'
    },
    {
      id: 'human-design',
      title: 'Human Design (Tasarımınız)',
      icon: <Fingerprint size={22} />,
      color: '#34C759',
      link: '/analysis/human-design'
    },
    {
      id: 'numerology',
      title: 'Numeroloji',
      icon: <Hexagon size={22} />,
      color: '#AF52DE',
      link: '/analysis/numerology'
    },
    {
      id: 'career',
      title: 'Mesleki Yatkınlık & Kariyer',
      icon: <Briefcase size={22} />,
      color: '#EAB308',
      link: '/analysis/career'
    },
    {
      id: 'kabbalah',
      title: 'Kabalistik 4 Alem',
      icon: <MoonStar size={22} />,
      color: '#D4AF37',
      link: '/analysis/kabbalah'
    },
    {
      id: 'druid-tree',
      title: 'Kelt Druid Ağacı Analizi',
      icon: <TreePine size={22} />,
      color: '#10B981',
      link: '/analysis/druid-tree'
    },
    {
      id: 'rectification',
      title: 'Doğum Saati Keşfi (Beta)',
      icon: <Clock size={22} />,
      color: '#E0AA3E',
      link: '/analysis/rectification'
    },
    {
      id: 'schumann',
      title: 'Schumann Rezonansı',
      icon: <Activity size={22} />,
      color: '#00E5FF',
      link: '/analysis/schumann'
    },
    {
      id: 'cosmic-matrix',
      title: '7Layers Kozmik Matris',
      icon: <Compass size={22} />,
      color: '#F59E0B',
      link: '/analysis/cosmic-matrix',
      isMasterPreview: true
    },
    {
      id: 'incarnation',
      title: 'Karmik & Enkarnasyon',
      icon: <Scroll size={22} />,
      color: '#FFD700',
      link: '/analysis/incarnation',
      isMasterPreview: true
    }
  ];

  const handleToolClick = (tool: ToolItem) => {
    if (tool.id === 'cosmic-matrix' && !isMasterOrAdmin && !isCosmicUnlocked) {
      setLockedTarget({ id: 'cosmic-matrix', title: tool.title });
      return;
    }
    if (tool.id === 'incarnation' && !isMasterOrAdmin && !isIncarnationUnlocked) {
      setLockedTarget({ id: 'incarnation', title: tool.title });
      return;
    }
    router.push(tool.link);
  };

  const handleProceedToPayment = () => {
    if (!lockedTarget) return;
    const query = new URLSearchParams({
      type: lockedTarget.id,
      email: user?.email || ''
    }).toString();
    const targetUrl = `/checkout/guest?${query}`;
    setLockedTarget(null);
    if (!user) {
      setPendingCheckoutUrl(targetUrl);
      setShowAuthModal(true);
      return;
    }
    router.push(targetUrl);
  };

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
          {tools.map((tool) => {
            const isItemLocked =
              (tool.id === 'cosmic-matrix' && !isMasterOrAdmin && !isCosmicUnlocked) ||
              (tool.id === 'incarnation' && !isMasterOrAdmin && !isIncarnationUnlocked);
            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
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
                    {isItemLocked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-md mt-0.5">
                        <Lock size={10} />
                        Özel Analiz
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-white/30 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all shrink-0">
                  {isItemLocked ? <Lock size={16} className="text-amber-400/70" /> : <ChevronRight size={18} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Adımlı Mikro-Onay Uyarı Penceresi */}
      {lockedTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setLockedTarget(null)}
        >
          <div
            className="bg-[#0F111A] border border-[#D4AF37]/40 rounded-3xl max-w-md w-full p-7 text-center shadow-[0_0_40px_rgba(212,175,55,0.2)] relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] mx-auto mb-4 flex items-center justify-center">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {lockedTarget.title}
            </h3>
            <p className="text-mystic-text-muted text-sm mb-7 leading-relaxed">
              Bu analizi kullanabilmek için ödeme yapmanız gerekir. Tek ödeme ile sınırsız sorgulama yapabilirsiniz.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLockedTarget(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                Çık
              </button>
              <button
                onClick={handleProceedToPayment}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/20"
              >
                Ödeme Yap
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl={pendingCheckoutUrl}
      />
    </div>
  );
}
