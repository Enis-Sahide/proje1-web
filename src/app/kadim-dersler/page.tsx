"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Activity, 
  Network, 
  Compass, 
  Fingerprint, 
  Shapes, 
  Calculator, 
  Gem, 
  Layers, 
  Sparkles, 
  Wrench, 
  ArrowLeft,
  X,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LessonCategory {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  route: string;
  isUnderConstruction?: boolean;
}

export default function KadimDerslerPage() {
  const router = useRouter();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [selectedConstruction, setSelectedConstruction] = useState<LessonCategory | null>(null);

  const categories: LessonCategory[] = [
    { 
      id: 'duygusal-hastaliklar', 
      title: 'Hastalıkların Duygusal Nedenleri', 
      desc: 'Bedenimizdeki rahatsızlıkların ardında yatan zihinsel ve ruhsal sebepleri ve iyileştirici telkinleri keşfedin.',
      icon: <Heart size={28} className="text-red-400" />, 
      route: '/kadim-dersler/duygusal-hastaliklar' 
    },
    { 
      id: 'numeroloji', 
      title: 'Numeroloji ve Sayıların Sırrı', 
      desc: 'Pisagor ve Keldani ekolleriyle kader sayılarınızı, ruh güdülerinizi ve yaşam döngülerinizi hesaplamayı öğrenin.',
      icon: <Calculator size={28} className="text-yellow-400" />, 
      route: '#',
      isUnderConstruction: true 
    },
    { 
      id: 'astroloji', 
      title: 'Ezoterik Astroloji', 
      desc: '4 katmanlı ruhsal doğum haritası okuma sanatı. Gezegenler, evler ve burçların derin ezoterik anlamları.',
      icon: <Compass size={28} className="text-blue-400" />, 
      route: '#',
      isUnderConstruction: true 
    },
    { 
      id: 'human', 
      title: 'Human Design (Kozmik Tasarım)', 
      desc: 'Genetik şifrelerinizi ve orijinal tasarımınızı keşfedin. Tipler, otoriteler ve 9 enerji merkezinin mekaniği.',
      icon: <Fingerprint size={28} className="text-purple-400" />, 
      route: '#',
      isUnderConstruction: true 
    },
    { 
      id: 'rune', 
      title: 'Rune Tılsımları', 
      desc: '24 Elder Futhark sembolünün kozmik enerjileri, tılsımlı bağlamalar oluşturma ve ritüel yöntemleri.',
      icon: <Gem size={28} className="text-emerald-400" />, 
      route: '#',
      isUnderConstruction: true 
    },
    { 
      id: 'yoga', 
      title: 'Yoga Asanaları ve Nadiler', 
      desc: 'Ashtanga 8 basamaklı yol, asanalar, enerji kilitleri (bandhalar) ve pranayama nefes kontrol yöntemleri.',
      icon: <Sparkles size={28} className="text-cyan-400" />, 
      route: '#',
      isUnderConstruction: true 
    },
    { 
      id: 'kabbalah', 
      title: 'Evrensel Kabbalah', 
      desc: 'Hayat ağacı (Sephiroth), 10 ilahi küre, kozmik enerjiler ve tekamül yollarının sırları.',
      icon: <Network size={28} className="text-indigo-400" />, 
      route: '#',
      isUnderConstruction: true 
    },
    { 
      id: 'akupunktur', 
      title: 'Akupunktur ve Meridyenler', 
      desc: 'Bedenimizdeki enerji kanalları (meridyenler), akupresür noktaları ve element dengeleri.',
      icon: <Activity size={28} className="text-teal-400" />, 
      route: '#',
      isUnderConstruction: true 
    },
    { 
      id: 'sembolizm', 
      title: 'Kadim Sembolizm', 
      desc: 'Ezoterik semboller, geometriler ve evrensel arketiplerin taşıdığı gizli frekanslar.',
      icon: <Shapes size={28} className="text-orange-400" />, 
      route: '#',
      isUnderConstruction: true 
    },
    { 
      id: 'tarot', 
      title: 'Tarot ve Büyük Arkana', 
      desc: '78 kartın taşıdığı arketipsel enerjiler, açılım şablonları ve kadersel yol göstericiler.',
      icon: <Layers size={28} className="text-pink-400" />, 
      route: '#',
      isUnderConstruction: true 
    },
  ];

  const handlePress = (cat: LessonCategory) => {
    const isApprenticeOrHigher = role && role !== 'free';
    if (cat.id !== 'duygusal-hastaliklar' && !isApprenticeOrHigher && role !== 'admin') {
      alert("Dersleri açabilmeniz için en az Çıraklık seviyesine ulaşmış olmanız lazım.");
      return;
    }

    if (cat.isUnderConstruction) {
      setSelectedConstruction(cat);
      return;
    }
    router.push(cat.route);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative bg-transparent selection:bg-[#D4AF37] selection:text-black">
      {/* Mystical deep background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#110022] via-black to-black -z-50" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Back Button */}
        <button onClick={() => router.push('/')} className="mb-8 flex items-center text-white/50 hover:text-[#D4AF37] transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Tapınağa Dön
        </button>

        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in duration-1000">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37] py-4 mb-4 tracking-wider uppercase leading-normal">
            Okült İlimler Kütüphanesi
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Ruhsal tekamülünüzü destekleyecek, binlerce yıllık kadim bilgileri barındıran ezoterik dersliklerimiz.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, i) => {
            const showConstruction = cat.isUnderConstruction && !isAdmin;
            return (
              <div 
                key={cat.id} 
                onClick={() => handlePress(cat)}
                className={`relative group overflow-hidden rounded-3xl p-[1px] cursor-pointer transition-all duration-500 hover:scale-[1.02] ${
                  showConstruction ? 'opacity-75 hover:opacity-100' : 'shadow-2xl hover:shadow-[#D4AF37]/15'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Golden Animated Border on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-black/40 to-[#D4AF37] opacity-20 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative h-full bg-black/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                        {cat.icon}
                      </div>
                      
                      {cat.isUnderConstruction && (
                        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-mystic-accent bg-mystic-accent/10 px-3 py-1 rounded-full border border-mystic-accent/20">
                          <Wrench size={10} />
                          {isAdmin ? 'Admin Erişimi' : 'Hazırlanıyor'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-6">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    {cat.isUnderConstruction ? (
                      <span className="text-xs font-semibold text-mystic-accent flex items-center">
                        {isAdmin ? 'Erişime Açık (Admin) →' : 'Dersi İncele 🔒'}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#D4AF37] flex items-center group-hover:translate-x-1 transition-transform">
                        Eğitime Başla <Sparkles size={12} className="ml-1.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Under Construction Popup Modal */}
      {selectedConstruction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-mystic-surface border border-mystic-primary/30 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            {/* Glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-mystic-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <button 
              onClick={() => setSelectedConstruction(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
              <Smartphone className="text-[#D4AF37] animate-bounce" size={32} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{selectedConstruction.title}</h3>
            <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4">Mobil Uygulamada Aktif</p>
            
            <p className="text-mystic-text-muted text-sm leading-relaxed mb-6">
              Bu dersin web sürümü şu anda geliştirme aşamasındadır. Eğitim içeriklerine, sınavlara ve derece atlama süreçlerine **Mobil Uygulamamız** üzerinden hemen erişebilirsiniz!
            </p>

            <button 
              onClick={() => setSelectedConstruction(null)}
              className="bg-gradient-to-r from-mystic-primary to-mystic-accent text-black font-bold px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 w-full"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
