"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, TrendingUp, Search, ChevronRight } from 'lucide-react';
import { CATEGORIES, VENDORS, PRODUCTS } from '@/data/marketplaceData';

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    </div>
  );
}
