"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Sparkles, X, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AkupunkturPage() {
  const router = useRouter();
  const { role, hasAccess } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<'cirak' | 'kalfa' | 'ustat'>('cirak');
  const [showLockModal, setShowLockModal] = useState(false);
  const [requiredRoleName, setRequiredRoleName] = useState('');

  const isKalfaUnlocked = hasAccess('akupunktur_2') || isAdmin;
  const isUstatUnlocked = hasAccess('akupunktur_3') || isAdmin;

  const handleTabPress = (tab: 'cirak' | 'kalfa' | 'ustat') => {
    if (tab === 'kalfa' && !isKalfaUnlocked) {
      setRequiredRoleName('Kalfalık');
      setShowLockModal(true);
      return;
    }
    if (tab === 'ustat' && !isUstatUnlocked) {
      setRequiredRoleName('Üstatlık');
      setShowLockModal(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center select-none bg-transparent">
      {/* Mystical deep background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#031c17] via-[#010a08] to-[#000000] -z-50" />

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.push('/kadim-dersler')} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-200 to-mystic-primary tracking-wide">
              Akupunktur ve Meridyenler
            </h1>
            <p className="text-mystic-text-muted mt-1 text-sm md:text-base italic">Bedenin Görünmez Enerji Kanalları ve Şifa Haritası</p>
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
            I. Çıraklık
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
            II. Kalfalık
          </button>

          <button 
            onClick={() => handleTabPress('ustat')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ustat' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            } ${!isUstatUnlocked && 'opacity-60'}`}
          >
            {!isUstatUnlocked && <Lock size={14} className="text-mystic-primary" />}
            III. Üstatlık
          </button>
        </div>

        {/* Tanıtım Kartı */}
        <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg text-center flex flex-col items-center animate-in fade-in duration-500">
          <Activity className="text-emerald-400 mb-4" size={40} />
          <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Enerji Kanalları (Chi)</h2>
          <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
            Bedenimizdeki görünmez enerji otoyolları olan meridyenler, yaşam gücümüzün (Chi) akışını sağlar. Bu akış tıkandığında hastalıklar başlar.
          </p>
        </div>

        {/* I. ÇIRAK SEKME İÇERİĞİ */}
        {activeTab === 'cirak' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">Çıraklık: Temel Şifa Enerjisi</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Akupunktur, bedenin yaşam enerjisi (Chi veya Prana) akışını dengelemeye dayanan binlerce yıllık kadim bir şifa yöntemidir.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-3">
                <p>• <strong className="text-mystic-primary">Chi (Yaşam Enerjisi):</strong> Evreni ve bedeni canlı tutan evrensel frekanstır.</p>
                <p>• <strong className="text-mystic-primary">Yin ve Yang:</strong> Bedenimizdeki organlar zıt kutupların (Eril/Dişil, Ateş/Su, Sıcak/Soğuk) dengesiyle çalışır. Hastalık, bu dengenin bozulmasıdır.</p>
                <p>• <strong className="text-mystic-primary">Meridyenler:</strong> Chi enerjisinin içinde aktığı nehirlerdir.</p>
              </div>
            </div>
          </div>
        )}

        {/* II. KALFA SEKME İÇERİĞİ */}
        {activeTab === 'kalfa' && isKalfaUnlocked && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">Kalfalık: 12 Ana Meridyen</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Ezoterik anatomiye göre bedenimizde organlara bağlı 12 Ana Meridyen bulunur. Her organ sadece kan pompalamaz, aynı zamanda bir duyguyu da depolar.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-3">
                <p>• <strong className="text-mystic-primary">Akciğer Meridyeni:</strong> Keder, yas ve üzüntüyü barındırır.</p>
                <p>• <strong className="text-mystic-primary">Karaciğer Meridyeni:</strong> Öfke, nefret ve hayal kırıklığının merkezidir.</p>
                <p>• <strong className="text-mystic-primary">Böbrek Meridyeni:</strong> Derin korkuları ve fobileri depolar. Yaşam enerjisinin bataryasıdır.</p>
                <p>• <strong className="text-mystic-primary">Mide Meridyeni:</strong> Yeni olayları, durumları ve fikirleri sindirememe, uzun süreli endişeleri tutar.</p>
                <p>• <strong className="text-mystic-primary">Kalp Meridyeni:</strong> Neşe, sevgi ve ruhun (Shen) tahtıdır. Katılaşmış kalp, kriz yaratır.</p>
              </div>
            </div>
          </div>
        )}

        {/* III. ÜSTAT SEKME İÇERİĞİ */}
        {activeTab === 'ustat' && isUstatUnlocked && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">Üstatlık: Düğümleri Çözmek</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Hastalıklar, enerjinin (Chi) kanallarda duygusal travmalarla tıkanması sonucu oluşur. Akupunktur noktaları, bu tıkanıklıkların açıldığı, nehrin akışının tekrar sağlandığı enerji düğümleridir.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-3">
                <p>• <strong className="text-mystic-primary">Yönetici Meridyenler:</strong> Ren Mai (Kavrama) ve Du Mai (Yönetme) kanalları omurga ve ön hattan geçerek tüm çakraları birbirine bağlar.</p>
                <p>• <strong className="text-mystic-primary">İğnelerin Sırrı:</strong> İğneler (veya akupresür noktalarına yapılan niyetli basılar), sinir sistemine şok vererek biriken öfke ve kederi serbest bırakır.</p>
                <p>• <strong className="text-mystic-primary">Hücresel Hafıza:</strong> Bedene atılan kördüğümler, bilinçli yüzleşme ve affetme ritüeli ile fiziksel olarak çözülür. Şifa, organın frekansının tekrar evrenle uyumlanmasıdır.</p>
              </div>
            </div>
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
