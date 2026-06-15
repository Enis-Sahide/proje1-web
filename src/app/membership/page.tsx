"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Star, Crown, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MembershipPage() {
  const { user, role, logout } = useAuth(); // getting logout just to test if needed
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpgrade = async (newRole: string) => {
    if (!user) {
      router.push('/auth/login?redirect=/membership');
      return;
    }
    
    setLoadingTier(newRole);
    setUpgradeError(null);
    try {
      const { error } = await supabase.from('profiles').upsert({ 
        id: user.id, 
        role: newRole, 
        full_name: user.user_metadata?.full_name || '' 
      });
      if (error) throw error;
      
      // Update successful, hard navigate to force a full context refetch
      window.location.href = '/analysis/kabbalah';
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setUpgradeError(err?.message || 'Yükseltme sırasında veritabanı hatası oluştu.');
      setLoadingTier(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Misafir',
      price: 'Ücretsiz',
      icon: <Shield className="text-gray-400" size={32} />,
      features: ['Hastalıkların Duygusal Nedenleri Sözlüğü', 'Temel Astroloji Haritası (Kısa Yorum)', 'İnsan Tasarımı (Sadece Tip ve Otorite)'],
      checkColor: 'text-gray-400'
    },
    {
      id: 'apprentice',
      name: 'Çıraklık',
      price: '₺499 / ay',
      icon: <Star className="text-blue-400" size={32} />,
      features: ['Tüm Misafir Özellikleri', 'Kabalistik 4 Alem Analizi', 'İnsan Tasarımı Kapılar ve Kanallar', 'Reklamsız Deneyim'],
      checkColor: 'text-blue-400'
    },
    {
      id: 'journeyman',
      name: 'Kalfalık',
      price: '₺999 / ay',
      icon: <Crown className="text-[#D4AF37]" size={32} />,
      features: ['Tüm Çıraklık Özellikleri', 'Transit Astroloji Analizi', 'Özel V.I.P Meditasyon Dersleri', 'İleri Seviye Çakra ve Aura Testleri'],
      checkColor: 'text-[#D4AF37]'
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Mistik Yolculuğunuzu Derinleştirin</h1>
          <p className="text-mystic-text-muted text-lg max-w-2xl mx-auto">Kadim bilgeliğin kilitlerini açın. Sizin için en uygun seviyeyi seçerek ruhsal tekamülünüzde yeni bir sayfa açın.</p>
        </div>

        {upgradeError && (
          <div className="mb-8 max-w-3xl mx-auto bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center">
            <p className="text-red-200">{upgradeError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <div key={plan.id} className={`relative rounded-3xl p-8 border ${role === plan.id ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'border-white/10 bg-white/5'} flex flex-col`}>
              {role === plan.id && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-4 py-1 rounded-full">
                  Mevcut Planınız
                </div>
              )}
              <div className="flex justify-center mb-6">{plan.icon}</div>
              <h3 className="text-2xl font-bold text-center text-white mb-2">{plan.name}</h3>
              <div className="text-center text-xl font-medium text-mystic-text-muted mb-8">{plan.price}</div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-white/80">
                    <Check className={`mr-3 mt-0.5 shrink-0 ${plan.checkColor}`} size={16} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={role === plan.id || loadingTier === plan.id}
                className={`w-full py-4 rounded-xl font-bold transition-all flex justify-center items-center ${
                  role === plan.id 
                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                    : plan.id === 'journeyman'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {loadingTier === plan.id ? <Loader2 className="animate-spin" /> : role === plan.id ? 'Mevcut' : 'Seç (Test İçin)'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
