"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Heart, 
  Activity, 
  Network, 
  Compass, 
  Fingerprint, 
  Shapes, 
  Calculator, 
  Gem, 
  Layers, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Unlock, 
  Check, 
  RefreshCw,
  Smartphone,
  X,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TestSubQuiz {
  title: string;
  id: string;
  requiredUnlock?: string;
  isHighlight?: boolean;
}

interface TestCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  isUnderConstruction?: boolean;
  subTests?: TestSubQuiz[];
  route?: string;
}

export default function TestsHubPage() {
  const router = useRouter();
  const { user, role, hasAccess, passedExams } = useAuth();
  const isAdmin = role === 'admin';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedUnderConstruction, setSelectedUnderConstruction] = useState<TestCategory | null>(null);

  const testCategories: TestCategory[] = [
    { id: 'aura', title: 'Aura & Çakra (50 Soru)', icon: Sparkles, route: '/tests/aura' },
    { 
      id: 'duygusal_hastaliklar', 
      title: 'Hastalıkların Duygusal Nedenleri (50 Soru)', 
      icon: Heart, 
      route: '/tests/duygusal_hastaliklar_50'
    },
    { 
      id: 'akupunktur', 
      title: 'Akupunktur ve Meridyenler', 
      icon: Activity, 
      subTests: [
        { title: '1. Derece: Çıraklık', id: 'akupunktur_1' },
        { title: '2. Derece: Kalfalık', id: 'akupunktur_2', requiredUnlock: 'akupunktur_2' },
        { title: '3. Derece: Üstatlık', id: 'akupunktur_3', requiredUnlock: 'akupunktur_master', isHighlight: true },
      ]
    },
    { 
      id: 'kabbalah', 
      title: 'Evrensel Kabbalah', 
      icon: Network, 
      subTests: [
        { title: '1. Derece: Çıraklık (50 Soru)', id: 'kabbalah_1' },
        { title: '2. Derece: Kalfalık (50 Soru)', id: 'kabbalah_2' },
      ]
    },
    { 
      id: 'astroloji', 
      title: 'Ezoterik Astroloji', 
      icon: Compass, 
      subTests: [
        { title: '1. Derece: Çıraklık', id: 'astroloji_1' },
        { title: '2. Derece: Kalfalık', id: 'astroloji_2', requiredUnlock: 'astroloji_2' },
        { title: '3. Derece: Üstatlık', id: 'astroloji_3', requiredUnlock: 'astroloji_master', isHighlight: true },
      ]
    },
    { 
      id: 'human', 
      title: 'Human Design', 
      icon: Fingerprint, 
      subTests: [
        { title: '1. Derece: Çıraklık', id: 'human_1' },
        { title: '2. Derece: Kalfalık', id: 'human_2', requiredUnlock: 'human_2' },
        { title: '3. Derece: Üstatlık', id: 'human_3', requiredUnlock: 'human_master', isHighlight: true },
      ]
    },
    { id: 'sembolizm', title: 'Kadim Sembolizm', icon: Shapes, isUnderConstruction: true, route: '#' },
    { 
      id: 'numeroloji', 
      title: 'Numeroloji', 
      icon: Calculator, 
      subTests: [
        { title: '1. Derece: Çıraklık', id: 'numeroloji_1' },
        { title: '2. Derece: Kalfalık', id: 'numeroloji_2', requiredUnlock: 'numeroloji_2' },
        { title: '3. Derece: Üstatlık', id: 'numeroloji_3', requiredUnlock: 'numeroloji_3', isHighlight: true },
      ]
    },
    { 
      id: 'rune', 
      title: 'Rune', 
      icon: Gem, 
      subTests: [
        { title: '1. Kademe: Semboller', id: 'rune1' },
        { title: '2. Kademe: Bağlamalar', id: 'rune2', requiredUnlock: 'rune_2' },
        { title: 'Büyük Final Sınavı', id: 'runeFinal', requiredUnlock: 'rune_master', isHighlight: true },
      ]
    },
    { id: 'tarot', title: 'Tarot ve Arkana', icon: Layers, isUnderConstruction: true, route: '#' },
    { 
      id: 'yoga', 
      title: 'Yoga Asanaları', 
      icon: Flame, 
      subTests: [
        { title: '1. Derece: Çıraklık', id: 'yoga_1' },
        { title: '2. Derece: Kalfalık', id: 'yoga_2', requiredUnlock: 'yoga_2' },
        { title: '3. Derece: Üstatlık', id: 'yoga_3', requiredUnlock: 'yoga_master', isHighlight: true },
      ]
    },
  ];

  const handlePress = (cat: TestCategory) => {
    if (cat.isUnderConstruction && !isAdmin) {
      setSelectedUnderConstruction(cat);
      return;
    }

    if (cat.subTests) {
      setExpandedId(expandedId === cat.id ? null : cat.id);
    } else if (cat.route) {
      router.push(cat.route);
    }
  };

  const handleSubTestClick = (sub: TestSubQuiz) => {
    // Seviye-bazlı: sınavın derecesi kullanıcının seviyesini geçmemeli.
    const isLocked = isAdmin ? false : !hasAccess(sub.id);
    if (isLocked) {
      alert("Bu sınava girmek için önceki dereceyi (tüm sınavlarını) tamamlamış olmalısın!");
      return;
    }
    router.push(`/tests/${sub.id}`);
  };


  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative bg-transparent selection:bg-[#D4AF37] selection:text-black">
      {/* Mystical deep background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b031b] via-[#020008] to-black -z-50" />

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles size={14} className="animate-pulse" /> Sınav Merkezi
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37] py-4 mb-4 tracking-wider uppercase leading-normal">
            Öğrendiklerini Test Et
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Ezoterik derecelerde yükselmek ve sırları açığa çıkarmak için kadim sınavlardan geçmelisin.
          </p>
        </div>

        {/* Categories Grid/List */}
        <div className="space-y-6">
          {testCategories.map((cat, i) => {
            const IconComponent = cat.icon;
            const isExpanded = expandedId === cat.id;
            const isUnderConstruction = cat.isUnderConstruction && !isAdmin;

            return (
              <div 
                key={cat.id}
                className={`group rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl transition-all duration-300 overflow-hidden ${
                  isUnderConstruction ? 'opacity-60 hover:opacity-80' : 'hover:border-[#D4AF37]/30 hover:bg-black/75 shadow-lg shadow-black/40'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Header Row */}
                <div 
                  onClick={() => handlePress(cat)}
                  className="flex items-center justify-between p-6 cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37]/40 transition-colors">
                      <IconComponent className="text-[#D4AF37]" size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                        {cat.title}
                        {isUnderConstruction && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-mystic-accent bg-mystic-accent/10 px-2 py-0.5 rounded-full border border-mystic-accent/20">
                            Hazırlanıyor
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>

                  <div>
                    {isUnderConstruction ? (
                      <Lock size={18} className="text-white/30" />
                    ) : cat.subTests ? (
                      isExpanded ? <ChevronUp size={20} className="text-[#D4AF37]" /> : <ChevronDown size={20} className="text-white/60" />
                    ) : (
                      <Sparkles size={20} className="text-[#D4AF37] opacity-60 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>

                {/* Sub-tests Expansion */}
                {isExpanded && cat.subTests && (
                  <div className="border-t border-white/5 bg-black/40 px-6 py-4 space-y-2">
                    {cat.subTests.map((sub, index) => {
                      const isLocked = isAdmin ? false : !hasAccess(sub.id);
                      const isUnlocked = !isLocked;
                      const hasPassed = passedExams.includes(sub.id);

                      return (
                        <div 
                          key={index}
                          onClick={() => handleSubTestClick(sub)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                            isLocked 
                              ? 'border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed' 
                              : sub.isHighlight 
                                ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10' 
                                : 'border-white/10 bg-white/[0.03] hover:border-[#D4AF37]/30 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isLocked ? (
                              <Lock size={16} className="text-white/30" />
                            ) : hasPassed ? (
                              <Check size={16} className="text-green-400 font-bold" />
                            ) : (
                              <Unlock size={16} className="text-amber-400" />
                            )}
                            <span className={`text-sm ${
                              isLocked 
                                ? 'text-white/40' 
                                : sub.isHighlight 
                                  ? 'text-amber-400 font-bold' 
                                  : 'text-white/80'
                            }`}>
                              {sub.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasPassed && (
                              <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-green-500/20 bg-green-500/10">
                                Tamamlandı
                              </span>
                            )}
                            {isUnlocked && !hasPassed && (
                              <span className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1">
                                Sınava Gir →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>


      </div>

      {/* Under Construction Popup Modal */}
      {selectedUnderConstruction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-mystic-surface border border-[#D4AF37]/20 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            
            <button 
              onClick={() => setSelectedUnderConstruction(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
              <Smartphone className="text-[#D4AF37] animate-bounce" size={32} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{selectedUnderConstruction.title}</h3>
            <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4">Mobil Uygulamada Aktif</p>
            
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Bu dersin/sınavın web sürümü şu anda geliştirme aşamasındadır. Eğitim içeriklerine, sınavlara ve derece atlama süreçlerine **Mobil Uygulamamız** üzerinden hemen erişebilirsiniz!
            </p>

            <button 
              onClick={() => setSelectedUnderConstruction(null)}
              className="bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-bold px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 w-full"
            >
              Anladım
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
