"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Lock, Sparkles, X, Gem, HelpCircle } from 'lucide-react';
import { useContent } from '@/lib/useContent';
import { useAuth } from '@/context/AuthContext';

export default function RunePage() {
  const router = useRouter();
  const { role, hasAccess } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<'cirak' | 'kalfa' | 'ustat'>('cirak');
  const [showLockModal, setShowLockModal] = useState(false);
  const [requiredRoleName, setRequiredRoleName] = useState('');

  const { data: runesData, loading: loadingRunes } = useContent<any[]>('/api/content/runes');
  const { data: bindingsData, loading: loadingBindings } = useContent<any[]>('/api/content/rune-bindings');

  const isKalfaUnlocked = hasAccess('rune_2') || isAdmin;

  const handleTabPress = (tab: 'cirak' | 'kalfa' | 'ustat') => {
    if (tab === 'kalfa' && !isKalfaUnlocked) {
      setRequiredRoleName('Kalfalık');
      setShowLockModal(true);
      return;
    }
    if (tab === 'ustat') {
      setActiveTab('ustat');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center select-none bg-transparent">
      {/* Mystical deep background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#031c10] via-[#010a06] to-[#000000] -z-50" />

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.push('/kadim-dersler')} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-200 to-mystic-primary tracking-wide">
              Rune Tılsımları
            </h1>
            <p className="text-mystic-text-muted mt-1 text-sm md:text-base italic">24 Elder Futhark Sembolü ve Bağlamaların Gizemi</p>
          </div>
        </div>

        {/* Tab Menüsü */}
        <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 mb-8">
          <button 
            onClick={() => handleTabPress('cirak')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all ${
              activeTab === 'cirak' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            }`}
          >
            I. Çırak (Semboller)
          </button>
          
          <button 
            onClick={() => handleTabPress('kalfa')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'kalfa' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            } ${!isKalfaUnlocked && 'opacity-60'}`}
          >
            {!isKalfaUnlocked && <Lock size={14} className="text-mystic-primary" />}
            II. Kalfa (Bağlamalar)
          </button>

          <button 
            onClick={() => handleTabPress('ustat')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all ${
              activeTab === 'ustat' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            }`}
          >
            III. Üstat
          </button>
        </div>

        {/* I. ÇIRAK SEKME İÇERİĞİ */}
        {activeTab === 'cirak' && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg text-center flex flex-col items-center">
              <Gem className="text-mystic-primary mb-4" size={40} />
              <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">ᚠ - Elder Futhark Sembolleri</h2>
              <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                Kadim bilgelerin kayalara kazıdığı bu sırlar, yalnızca frekansı doğru okuyan gözlere fısıldar. 24 Elder Futhark sembolünün kozmik sırrını, elementlerini ve şifalarını keşfet.
              </p>
            </div>

            {loadingRunes ? (
              <div className="text-center py-10">
                <Gem className="animate-spin text-mystic-primary mx-auto mb-4" size={48} />
                <p className="text-mystic-text-muted">Rünik yazıtlar çözümleniyor...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(runesData ?? []).map((rune: any) => (
                  <div key={rune.id || rune.name} className="p-6 md:p-8 bg-mystic-surface/80 border border-mystic-primary/25 rounded-3xl backdrop-blur-md shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-mystic-primary tracking-wider uppercase">{rune.name}</span>
                        <span className="text-4xl text-mystic-accent font-normal">{rune.symbol}</span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider bg-mystic-primary/10 border border-mystic-primary/30 text-white px-3 py-1 rounded-full">
                        {rune.element}
                      </span>
                    </div>

                    <p className="text-mystic-text text-sm md:text-base leading-relaxed mb-6">
                      {rune.meaning}
                    </p>

                    <div className="space-y-4 mb-6">
                      <div>
                        <h5 className="text-xs font-bold text-mystic-primary uppercase tracking-wider mb-1">Ritüel ve Tılsım Kullanımı:</h5>
                        <p className="text-sm text-mystic-text-muted leading-relaxed">{rune.usage}</p>
                      </div>
                      {rune.ritual && (
                        <div>
                          <h5 className="text-xs font-bold text-mystic-primary uppercase tracking-wider mb-1">Rune&apos;un Mesajı:</h5>
                          <p className="text-sm text-mystic-text-muted leading-relaxed italic">{rune.ritual}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                      {rune.stone && <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-mystic-text">💎 {rune.stone}</span>}
                      {rune.astrology && <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-mystic-text">🪐 {rune.astrology}</span>}
                      {rune.plant && <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-mystic-text">🌿 {rune.plant}</span>}
                      {rune.animal && <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-mystic-text">🐾 {rune.animal}</span>}
                      {rune.mythology && <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-mystic-text">📖 {rune.mythology}</span>}
                      {(rune.polarite || rune.polarity) && <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-mystic-text">☯️ {rune.polarite || rune.polarity}</span>}
                      {rune.tarot && <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-mystic-text">🃏 {rune.tarot}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* II. KALFA SEKME İÇERİĞİ */}
        {activeTab === 'kalfa' && isKalfaUnlocked && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg text-center flex flex-col items-center">
              <Sparkles className="text-mystic-primary mb-4" size={40} />
              <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Rune Bağlamaları (Bindrunes)</h2>
              <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                Frekansların birbiriyle dansı, tek bir sembolün gücünü kozmik bir şifaya dönüştürür. Uyumlanmış semboller, niyetle birleştiğinde evrenin en güçlü tılsımlarını yaratır.
              </p>
            </div>

            {loadingBindings ? (
              <div className="text-center py-10">
                <Gem className="animate-spin text-mystic-primary mx-auto mb-4" size={48} />
                <p className="text-mystic-text-muted">Tılsımlı bağlar örülüyor...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(bindingsData ?? []).map((binding: any) => (
                  <div key={binding.id || binding.title} className="p-6 md:p-8 bg-mystic-surface/80 border border-mystic-primary/25 rounded-3xl backdrop-blur-md shadow-xl">
                    <h3 className="text-xl font-bold text-mystic-primary mb-4 flex items-center gap-2">
                      <Sparkles size={20} />
                      {binding.title}
                    </h3>

                    {binding.image && (
                      <div className="w-full max-w-md mx-auto aspect-square bg-black/45 border border-mystic-primary/20 rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-6 shadow-inner">
                        <img 
                          src={binding.image} 
                          alt={binding.title}
                          className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                        />
                      </div>
                    )}

                    <p className="text-mystic-text text-sm md:text-base leading-relaxed mb-6">
                      {binding.description}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-mystic-primary uppercase tracking-wider mb-2">Kullanılan Semboller:</h4>
                        <div className="inline-block bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold text-white tracking-widest font-mono">
                          {binding.runesUsed}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-mystic-primary uppercase tracking-wider mb-1">Ritüel Uygulaması:</h4>
                        <p className="text-sm text-mystic-text-muted leading-relaxed whitespace-pre-line">{binding.usageInstructions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* III. ÜSTAT SEKME İÇERİĞİ */}
        {activeTab === 'ustat' && (
          <div className="animate-in fade-in duration-500 text-center py-20 bg-mystic-surface/30 border border-mystic-primary/20 rounded-3xl backdrop-blur-md max-w-md mx-auto">
            <Lock className="text-mystic-primary mx-auto mb-4 animate-pulse" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Mistik Bilgi Kilitli</h3>
            <p className="text-mystic-text-muted text-sm px-8 leading-relaxed">
              Bu ilmin Üstatlık derecesi henüz aktarılmamıştır. Tapınaktaki çalışmalarınıza devam edin.
            </p>
          </div>
        )}
      </div>

      {/* Lock Popup Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-mystic-surface border border-mystic-primary/30 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-mystic-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <button 
              onClick={() => setShowLockModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <Lock className="text-red-500" size={32} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Derece Kilitli</h3>
            <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-4">Erişim Engellendi</p>
            
            <p className="text-mystic-text-muted text-sm leading-relaxed mb-6">
              Bu dersi/dereceyi açabilmeniz için en az <strong className="text-mystic-primary">{requiredRoleName}</strong> seviyesine ulaşmış olmanız gerekmektedir.
            </p>

            <button 
              onClick={() => setShowLockModal(false)}
              className="bg-gradient-to-r from-mystic-primary to-yellow-500 text-black font-bold px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 w-full"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
