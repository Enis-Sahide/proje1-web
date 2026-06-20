"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, TrendingUp, Search, ChevronRight, HeartPulse, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, VENDORS, PRODUCTS } from '@/data/marketplaceData';

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImeceModalOpen, setIsImeceModalOpen] = useState(false);

  const featuredVendors = VENDORS.filter(v => v.isFeatured);
  
  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory ? p.categoryId === activeCategory : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Background */}
            
      {/* Header */}
      <header className="pt-24 pb-8 px-6 border-b border-mystic-primary/20 bg-mystic-dark/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-mystic-primary drop-shadow-md">Keşfet & Mağaza</h1>
            <p className="text-sm text-mystic-text-muted mt-1">Spiritüel ürünler, kadim kokular ve şifalı taşlar...</p>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Ürün veya mağaza ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/50 border border-mystic-primary/30 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-mystic-primary w-full md:w-64"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mystic-text-muted" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-12 mt-4">
        
        {/* Categories */}
        <section>
          <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-3">
            <button 
              onClick={() => setActiveCategory(null)}
              className={`whitespace-nowrap px-6 py-2 rounded-full border transition-colors duration-300 ${activeCategory === null ? 'bg-mystic-primary text-black font-bold border-mystic-primary' : 'bg-black/40 text-mystic-text border-mystic-primary/30 hover:border-mystic-primary/60'}`}
            >
              Tümü
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-6 py-2 rounded-full border transition-colors duration-300 ${activeCategory === cat.id ? 'bg-mystic-primary text-black font-bold border-mystic-primary' : 'bg-black/40 text-mystic-text border-mystic-primary/30 hover:border-mystic-primary/60'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Highlighted Banner for Imece */}
        <section className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-black/40 border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl p-6 md:p-8 transition-all duration-300 relative overflow-hidden group shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <HeartPulse size={32} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">İmece ile Sağlığı Destekle</h2>
                <p className="text-sm text-mystic-text-muted mt-1 max-w-xl">
                  Beden ve zihin dengenizi doğal, temiz ve güvenilir ürünlerle desteklemeye hazır mısınız? İmece sisteminin özel seçkisini inceleyin.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsImeceModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] whitespace-nowrap cursor-pointer"
            >
              Tercihli Müşteri Ol & Alışverişe Başla
            </button>
          </div>
        </section>

        {/* Featured Stores Slider */}
        {!activeCategory && !searchQuery && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-yellow-500" />
              <h2 className="text-xl font-bold text-white tracking-wide">Öne Çıkan Mağazalar</h2>
            </div>
            <div className="flex overflow-x-auto pb-6 hide-scrollbar gap-6 snap-x">
              {featuredVendors.map(vendor => (
                <Link href={`/explore/store/${vendor.id}`} key={vendor.id} className="snap-start shrink-0 w-72 bg-black/40 border border-mystic-primary/20 hover:border-mystic-primary/50 transition-all duration-300 rounded-2xl overflow-hidden group">
                  <div className="h-32 relative overflow-hidden">
                    <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-white">{vendor.name}</h3>
                      <div className="flex items-center bg-black/50 px-2 py-1 rounded-full border border-yellow-500/30">
                        <Star size={12} className="text-yellow-500 mr-1" fill="currentColor" />
                        <span className="text-xs text-white">{vendor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-mystic-text-muted line-clamp-2">{vendor.description}</p>
                    <div className="mt-4 flex items-center text-mystic-primary text-sm font-medium">
                      Mağazayı Ziyaret Et <ChevronRight size={16} className="ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="text-mystic-primary" />
            <h2 className="text-xl font-bold text-white tracking-wide">Tüm Ürünler</h2>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => {
                const vendor = VENDORS.find(v => v.id === product.vendorId);
                return (
                  <Link href={`/explore/product/${product.id}`} key={product.id} className="bg-black/30 border border-white/10 hover:border-mystic-primary/40 rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col">
                    <div className="h-48 relative overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <img src={vendor?.avatar} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-xs text-white/90">{vendor?.name}</span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-white mb-2">{product.name}</h3>
                      <p className="text-sm text-mystic-text-muted line-clamp-2 mb-4 flex-1">{product.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-bold text-mystic-primary">{product.price} ₺</span>
                        <button className="bg-mystic-primary/20 hover:bg-mystic-primary text-mystic-primary hover:text-black transition-colors p-2 rounded-full border border-mystic-primary/50">
                          <ShoppingBag size={20} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-black/20 rounded-2xl border border-white/5">
              <p className="text-mystic-text-muted">Aradığınız kriterlere uygun ürün bulunamadı.</p>
            </div>
          )}
        </section>

      </main>

      <AnimatePresence>
        {isImeceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImeceModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-mystic-dark/95 border border-mystic-surface-light rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden z-10"
            >
              {/* Decorative glows */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button 
                onClick={() => setIsImeceModalOpen(false)}
                className="absolute top-4 right-4 text-mystic-text-muted hover:text-white hover:bg-white/5 p-2 rounded-full transition-colors z-20"
                aria-label="Kapat"
              >
                <X size={20} />
              </button>

              {/* Header Icon */}
              <div className="flex flex-col items-center text-center mt-2 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <HeartPulse size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-mystic-text to-emerald-400">
                  İmece ile Sağlığını Destekle
                </h3>
              </div>

              {/* Body */}
              <div className="space-y-5 text-mystic-text-muted text-sm md:text-base leading-relaxed">
                <p className="text-center font-medium text-mystic-text">
                  Beden ve zihin dengenizi doğal, temiz ve güvenilir ürünlerle desteklemeye hazır mısınız?
                </p>
                
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-0.5">🌿</span>
                    <div>
                      <h4 className="font-bold text-mystic-text text-sm">Doğal & Güvenilir İçerikler</h4>
                      <p className="text-xs text-mystic-text-muted mt-0.5">Katkısız, temiz ve doğanın gücünü yansıtan formüller.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-0.5">🤝</span>
                    <div>
                      <h4 className="font-bold text-mystic-text text-sm">İmece Paylaşım Ruhu</h4>
                      <p className="text-xs text-mystic-text-muted mt-0.5">Sağlığınızı desteklerken toplumsal yardımlaşmaya katkı sağlayın.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-0.5">🎯</span>
                    <div>
                      <h4 className="font-bold text-mystic-text text-sm">Bütünsel Şifa Yaklaşımı</h4>
                      <p className="text-xs text-mystic-text-muted mt-0.5">Yaşam kalitenizi artırmaya yönelik özel ürün seçkisi.</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-center text-mystic-text-muted/60 px-4 mt-2">
                  Aşağıdaki buton sizi güvenli bir şekilde İmece Sistem tercihli müşteri sayfasına yönlendirir.
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex flex-col gap-3">
                <a 
                  href="https://imecesistem.com.tr/davet/TM/BT90000000114"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsImeceModalOpen(false)}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-center text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HeartPulse size={18} className="animate-pulse" />
                  <span>Tercihli Müşteri Ol & Alışverişe Başla</span>
                </a>

                <Link 
                  href="/explore/imece-health"
                  onClick={() => setIsImeceModalOpen(false)}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-center text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sağlık Teknolojisini & Ürünleri İncele</span>
                </Link>
                
                <button 
                  onClick={() => setIsImeceModalOpen(false)}
                  className="w-full py-3 text-sm font-semibold text-mystic-text-muted hover:text-white transition-colors"
                >
                  Daha Sonra
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
