"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, Lock, Droplet, Flame, Brain, Fingerprint, Activity, Hexagon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const VIP_MODULES = [
  {
    id: 'mikrokozmik',
    title: 'Mikrokozmik Yörünge',
    desc: 'Bedenin enerji meridyenlerinde ışığı dolaştırın ve şifayı hedefleyin.',
    icon: <Activity size={32} />,
    color: 'from-blue-500/20 to-purple-500/20',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-400',
    status: 'ACTIVE',
    path: '/vip-teknolojiler/mikrokozmik'
  },
  {
    id: 'bone-marrow',
    title: 'Kemik İliği Nefesi',
    desc: 'Kök hücre aktivasyonunu zihinsel ve nefes kombinasyonuyla yönlendirin.',
    icon: <Droplet size={32} />,
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400',
    status: 'ACTIVE',
    path: '/vip-teknolojiler/bone-marrow'
  },
  {
    id: 'tummo',
    title: 'Tummo (İçsel Ateş)',
    desc: 'Göbek deliğinin altındaki ateşi uyandırarak bağışıklığı ve iradeyi çelikleştirin.',
    icon: <Flame size={32} />,
    color: 'from-orange-500/20 to-yellow-500/20',
    borderColor: 'border-orange-500/50',
    textColor: 'text-orange-400',
    status: 'ACTIVE',
    path: '/vip-teknolojiler/tummo'
  },
  {
    id: 'silva',
    title: 'Silva Teta Ekranı',
    desc: 'Zihinsel lazer ile hastalıklı hücreleri silin ve yenilerini programlayın.',
    icon: <Brain size={32} />,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-400',
    status: 'ACTIVE',
    path: '/vip-teknolojiler/silva'
  },
  {
    id: 'merkaba',
    title: 'Merkaba Uyanışı',
    desc: 'İç içe geçmiş tetrahedronları çevirerek boyutlar arası kuantum sıçraması yapın.',
    icon: <Hexagon size={32} />,
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/50',
    textColor: 'text-cyan-400',
    status: 'ACTIVE',
    path: '/vip-teknolojiler/merkaba'
  },
  {
    id: 'rahmani',
    title: 'Kimatik Zikir',
    desc: 'Sufi nefesiyle esmaları titreştirerek hücrelerin geometrisini düzenleyin.',
    icon: <Fingerprint size={32} />,
    color: 'from-[#D4AF37]/20 to-yellow-600/20',
    borderColor: 'border-[#D4AF37]/50',
    textColor: 'text-[#D4AF37]',
    status: 'ACTIVE',
    path: '/vip-teknolojiler/rahmani'
  }
];

export default function VIPHubPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 relative bg-transparent selection:bg-[#D4AF37] selection:text-black">
      {/* Deep premium background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#110022] via-black to-black -z-60" />
      
      <div className="max-w-6xl mx-auto relative">
        <button onClick={() => router.back()} className="mb-12 flex items-center text-white/50 hover:text-[#D4AF37] transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Merkez Tapınağa Dön
        </button>

        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="w-24 h-24 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-[0_0_50px_rgba(212,175,55,0.2)] mb-6 relative">
            <Shield size={48} />
            <div className="absolute inset-0 bg-[#D4AF37] blur-3xl opacity-20 rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-yellow-200 to-[#D4AF37] mb-4 tracking-wider uppercase">
            Kadim Uygulamalar
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Yalnızca Usta seviyesini geçen inisiyelerin (öğrencilerin) girebildiği İçsel Simya laboratuvarı. Burada insan biyo-bilgisayarını hacklemeyi öğreneceksiniz.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {VIP_MODULES.map((mod, i) => (
            <Link 
              href={mod.path}
              key={mod.id} 
              className={`relative group overflow-hidden rounded-3xl p-[1px] ${mod.status === 'LOCKED' ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-[#D4AF37]/20'}`}
              style={{ animationDelay: `${i * 100}ms` }}
              onClick={(e) => mod.status === 'LOCKED' && e.preventDefault()}
            >
              {/* Animated Border Gradient for Active */}
              {mod.status === 'ACTIVE' && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-black to-[#D4AF37] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              
              <div className={`relative h-full bg-black/90 backdrop-blur-xl rounded-3xl p-8 border ${mod.borderColor} flex flex-col justify-between`}>
                <div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-6 shadow-inner`}>
                    <div className={mod.textColor}>{mod.icon}</div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${mod.status === 'ACTIVE' ? 'text-white' : 'text-white/50'}`}>
                    {mod.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-8">
                    {mod.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                  {mod.status === 'ACTIVE' ? (
                    <span className="flex items-center text-sm font-bold text-[#D4AF37] group-hover:translate-x-2 transition-transform">
                      Laboratuvara Gir <Sparkles size={16} className="ml-2" />
                    </span>
                  ) : (
                    <span className="flex items-center text-sm font-bold text-red-400/80">
                      <Lock size={16} className="mr-2" /> Ustalık Mührü Gerekiyor
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
