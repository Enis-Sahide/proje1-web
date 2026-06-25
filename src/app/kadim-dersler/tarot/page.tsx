"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Sparkles, Layers } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TarotPage() {
  const router = useRouter();
  const { role, hasAccess } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<'cirak' | 'kalfa' | 'ustat'>('cirak');

  const isKalfaUnlocked = hasAccess('tarot_2') || isAdmin;
  const isUstatUnlocked = hasAccess('tarot_3') || hasAccess('tarot_master') || isAdmin;

  const handleTabPress = (tab: 'cirak' | 'kalfa' | 'ustat') => {
    if (tab === 'kalfa' && !isKalfaUnlocked) {
      return;
    }
    if (tab === 'ustat' && !isUstatUnlocked) {
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center select-none bg-transparent">
      {/* Mystical deep background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1d0315] via-[#0a0108] to-[#000000] -z-50" />

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.push('/kadim-dersler')} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-200 to-mystic-primary tracking-wide">
              Tarot ve Arkana
            </h1>
            <p className="text-mystic-text-muted mt-1 text-sm md:text-base italic">78 kartın taşıdığı arketipsel enerjiler, açılım şablonları ve kadersel yol göstericiler</p>
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
            1. Derece
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
            2. Derece
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
            3. Derece
          </button>
        </div>

        {/* I. ÇIRAK SEKME İÇERİĞİ */}
        {activeTab === 'cirak' && (
          <div className="animate-in fade-in duration-500 text-center py-20 bg-mystic-surface/30 border border-mystic-primary/20 rounded-3xl backdrop-blur-md max-w-md mx-auto">
            <Layers className="text-mystic-primary mx-auto mb-4 animate-pulse" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">1. Derece: Çıraklık</h3>
            <p className="text-mystic-text-muted text-sm px-8 leading-relaxed">
              Bu seviyeye ait ders içeriği henüz eklenmemiştir. Sırların açığa çıkacağı zamanı bekleyin.
            </p>
          </div>
        )}

        {/* II. KALFA SEKME İÇERİĞİ */}
        {activeTab === 'kalfa' && isKalfaUnlocked && (
          <div className="animate-in fade-in duration-500 text-center py-20 bg-mystic-surface/30 border border-mystic-primary/20 rounded-3xl backdrop-blur-md max-w-md mx-auto">
            <Layers className="text-mystic-primary mx-auto mb-4 animate-pulse" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">2. Derece: Kalfalık</h3>
            <p className="text-mystic-text-muted text-sm px-8 leading-relaxed">
              Bu seviyeye ait ders içeriği henüz eklenmemiştir. Sırların açığa çıkacağı zamanı bekleyin.
            </p>
          </div>
        )}

        {/* III. ÜSTAT SEKME İÇERİĞİ */}
        {activeTab === 'ustat' && isUstatUnlocked && (
          <div className="animate-in fade-in duration-500 text-center py-20 bg-mystic-surface/30 border border-mystic-primary/20 rounded-3xl backdrop-blur-md max-w-md mx-auto">
            <Layers className="text-mystic-primary mx-auto mb-4 animate-pulse" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">3. Derece: Üstatlık</h3>
            <p className="text-mystic-text-muted text-sm px-8 leading-relaxed">
              Bu seviyeye ait ders içeriği henüz eklenmemiştir. Sırların açığa çıkacağı zamanı bekleyin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
