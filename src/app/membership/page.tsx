"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  ArrowLeft, 
  Crown, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Save, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Tier {
  id: string;
  level: number;
  title: string;
  price: string;
  description: string;
  benefits: string[];
  color: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
}

const INITIAL_TIERS: Tier[] = [
  {
    id: 'apprentice',
    level: 1,
    title: 'Çırak Seviyesi',
    price: '99 TL / Ay',
    description: 'Ezoterik yolculuğa ilk adımınızı atın. Temel dersler ve başlangıç analizleri.',
    benefits: [
      '1. Derece Derslere Erişim',
      'Aura ve Çakra Sınavları',
      'Temel Frekans Odası Meditasyonları'
    ],
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    glowColor: 'rgba(245,158,11,0.15)'
  },
  {
    id: 'journeyman',
    level: 2,
    title: 'Kalfa Seviyesi',
    price: '199 TL / Ay',
    description: 'Bilginizi derinleştirin. 2. Derece dersler, detaylı numeroloji ve astroloji.',
    benefits: [
      '1. ve 2. Derece Derslere Erişim',
      'Detaylı Astroloji & Transitler',
      'Zenginleştirilmiş Frekans Seçenekleri',
      'Gelişmiş Ezoterik Sınavlar'
    ],
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    glowColor: 'rgba(59,130,246,0.15)'
  },
  {
    id: 'master',
    level: 3,
    title: 'Usta Seviyesi',
    price: '399 TL / Ay',
    description: 'Sırları çözün ve üstatlığa yükselin. Kadim Uygulamalar ve özel nefes çalışmaları.',
    benefits: [
      'Tüm Derecelere Sınırsız Erişim',
      'Kadim Uygulamalar Laboratuvarı',
      'Kabalistik 4 Alem Analizi',
      'Özel Simya & Nefes Seansları',
      'Birebir Rehberlik Mührü'
    ],
    color: 'from-[#D4AF37]/20 to-yellow-600/20',
    borderColor: 'border-[#D4AF37]/30',
    textColor: 'text-[#D4AF37]',
    glowColor: 'rgba(212,175,55,0.15)'
  }
];

export default function MembershipPage() {
  const { role, user } = useAuth();
  const isAdmin = role === 'admin';

  // Load from localStorage or default
  const [tiers, setTiers] = useState<Tier[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('membership_tiers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_TIERS;
  });

  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [newBenefit, setNewBenefit] = useState('');

  const saveTiersToStorage = (updatedTiers: Tier[]) => {
    setTiers(updatedTiers);
    localStorage.setItem('membership_tiers', JSON.stringify(updatedTiers));
  };

  const handleEditClick = (tier: Tier) => {
    setEditingTier({ ...tier, benefits: [...tier.benefits] });
    setNewBenefit('');
  };

  const handleSaveEdit = () => {
    if (!editingTier) return;
    const updated = tiers.map(t => t.id === editingTier.id ? editingTier : t);
    saveTiersToStorage(updated);
    setEditingTier(null);
  };

  const handleAddBenefit = () => {
    if (!editingTier || !newBenefit.trim()) return;
    setEditingTier({
      ...editingTier,
      benefits: [...editingTier.benefits, newBenefit.trim()]
    });
    setNewBenefit('');
  };

  const handleRemoveBenefit = (index: number) => {
    if (!editingTier) return;
    const updatedBenefits = editingTier.benefits.filter((_, i) => i !== index);
    setEditingTier({
      ...editingTier,
      benefits: updatedBenefits
    });
  };

  // If not admin, show the "Yapım Aşamasında" screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 bg-transparent flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-mystic-surface/60 backdrop-blur-md border border-mystic-primary/20 rounded-3xl p-8 text-center shadow-[0_0_30px_rgba(212,175,55,0.05)] relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-mystic-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-mystic-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 rounded-full bg-mystic-dark border border-mystic-primary/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative">
            <Crown className="text-mystic-primary/40 absolute" size={40} />
            <Wrench className="text-mystic-accent animate-pulse relative z-10" size={28} />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">VIP Seviyeler</h1>
          <p className="text-mystic-accent text-sm font-semibold uppercase tracking-wider mb-4">Yapım Aşamasında</p>
          
          <p className="text-mystic-text-muted text-sm leading-relaxed mb-8">
            Bu sayfa üzerinde çalışmalarımız devam ediyor. Çok yakında yeni vip seviyeleri, üyelik paketleri ve özel ayrıcalıklar hizmetinize sunulacaktır.
          </p>

          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-mystic-primary to-mystic-accent text-black font-bold px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 w-full"
          >
            <ArrowLeft size={16} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  // Admin design and editor view
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 relative bg-transparent">
      {/* Background radial gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0724] via-black to-black -z-50" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck size={14} /> Admin Düzenleme Modu
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider uppercase leading-none">
              VIP Seviyeler Yönetimi
            </h1>
            <p className="text-sm text-white/50 mt-2">
              Seviye kartlarını düzenleyin ve kaydedin. Değişiklikler tarayıcıda kalıcı olarak saklanır.
            </p>
          </div>
          <button 
            onClick={() => {
              if (confirm("VIP seviyeleri varsayılan ayarlara sıfırlamak istiyor musunuz?")) {
                saveTiersToStorage(INITIAL_TIERS);
              }
            }}
            className="px-5 py-2.5 rounded-full border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 text-white/70 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Varsayılana Sıfırla
          </button>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className={`relative overflow-hidden rounded-3xl p-[1px] group transition-all duration-300 hover:-translate-y-2`}
              style={{
                background: `linear-gradient(135deg, ${tier.textColor === 'text-[#D4AF37]' ? '#D4AF37' : tier.textColor.includes('blue') ? '#3B82F6' : '#F59E0B'}30, rgba(255,255,255,0.05))`
              }}
            >
              {/* Card Body */}
              <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between min-h-[500px]">
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none blur-3xl rounded-3xl"
                  style={{ backgroundColor: tier.glowColor }}
                />

                {/* Edit Badge */}
                <button 
                  onClick={() => handleEditClick(tier)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all cursor-pointer z-10 animate-pulse"
                  title="Düzenle"
                >
                  <Edit3 size={16} />
                </button>

                <div>
                  <div className={`inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-6 ${tier.textColor}`}>
                    <Crown size={24} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.title}</h3>
                  <div className={`text-xl font-extrabold mb-4 ${tier.textColor}`}>{tier.price}</div>
                  
                  <p className="text-white/60 text-sm leading-relaxed mb-6">
                    {tier.description}
                  </p>
                </div>

                <div>
                  <div className="border-t border-white/5 pt-6 space-y-3">
                    {tier.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-white/80">
                        <Check size={14} className={`mt-0.5 shrink-0 ${tier.textColor}`} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingTier && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-lg w-full bg-mystic-surface border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-h-[85vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Edit3 size={20} className="text-[#D4AF37]" /> Kartı Düzenle: {editingTier.title}
                  </h3>
                  <button 
                    onClick={() => setEditingTier(null)}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Başlık</label>
                    <input 
                      type="text" 
                      value={editingTier.title}
                      onChange={(e) => setEditingTier({ ...editingTier, title: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Fiyat</label>
                    <input 
                      type="text" 
                      value={editingTier.price}
                      onChange={(e) => setEditingTier({ ...editingTier, price: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Açıklama</label>
                    <textarea 
                      value={editingTier.description}
                      onChange={(e) => setEditingTier({ ...editingTier, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-[#D4AF37] outline-none transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Özellikler / Ayrıcalıklar</label>
                    <div className="space-y-2 mb-3">
                      {editingTier.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 px-3 py-2 rounded-lg text-xs text-white/80">
                          <span>{benefit}</span>
                          <button 
                            onClick={() => handleRemoveBenefit(index)}
                            className="text-red-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Yeni özellik ekle..."
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddBenefit()}
                        className="flex-grow px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-[#D4AF37] outline-none transition-all"
                      />
                      <button 
                        onClick={handleAddBenefit}
                        className="px-4 py-2 bg-[#D4AF37] hover:bg-yellow-500 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus size={14} /> Ekle
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                  <button 
                    onClick={() => setEditingTier(null)}
                    className="flex-1 py-3 border border-white/10 text-white hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    İptal
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 bg-gradient-to-r from-mystic-primary to-mystic-accent text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> Kaydet
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
