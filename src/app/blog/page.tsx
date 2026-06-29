"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, Calendar, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { useContent } from '@/lib/useContent';

const CATEGORIES = ['Tümü', 'Astroloji', 'Nefes', 'Ritüeller', 'Kişisel Gelişim', 'Çakra Dengeleme'];

export default function BlogListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  // Fetch published blog posts from API
  const { data: blogData, loading } = useContent<any[]>('/api/content/blog');
  const posts = blogData ?? [];

  // Filter posts based on search term and category
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'Tümü' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center bg-transparent">
      {/* Background stars / dust */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />
      
      <div className="max-w-5xl w-full relative z-10">
        {/* Header */}
        <div className="text-center md:text-left mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-mystic-primary mb-3 drop-shadow-md flex items-center justify-center md:justify-start gap-2">
              <BookOpen className="text-mystic-primary" /> Bilgi Kütüphanesi
            </h1>
            <p className="text-mystic-text-muted text-base">
              Kadim sırlar, astrolojik rehberler ve zihinsel gelişim üzerine makaleler.
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 backdrop-blur-md flex flex-col md:flex-row gap-5 justify-between items-center">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-mystic-primary text-black shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
                    : 'bg-white/5 text-mystic-text-muted border border-white/5 hover:border-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mystic-text-muted" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kütüphanede ara..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-mystic-primary transition-all"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4 text-mystic-text-muted">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-mystic-primary/10"></div>
              <div className="absolute inset-0 rounded-full border-2 border-t-mystic-primary border-r-mystic-accent animate-spin"></div>
            </div>
            <p className="text-sm">Bilgelik kütüphanesi açılıyor...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-24 text-center bg-white/5 border border-white/5 rounded-3xl backdrop-blur-sm">
            <HelpCircle className="mx-auto text-mystic-text-muted mb-4" size={48} />
            <h3 className="text-white font-bold text-lg mb-1">Aradığınız kriterlere uygun yazı bulunamadı</h3>
            <p className="text-mystic-text-muted text-sm max-w-md mx-auto">Başka bir kategori seçebilir veya arama kelimelerini değiştirebilirsiniz.</p>
          </div>
        ) : (
          /* Responsive Post Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <div 
                key={post.id}
                onClick={() => router.push(`/blog/${post.slug}`)}
                className="bg-mystic-surface/85 border border-mystic-surface-light hover:border-mystic-primary/30 rounded-3xl overflow-hidden group flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  {/* Cover image wrapper */}
                  <div className="relative h-48 w-full overflow-hidden bg-black/40 border-b border-mystic-surface-light">
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-mystic-text-muted">
                        <Sparkles size={24} className="text-mystic-primary/30" />
                        <span className="text-xs">7Layers Bilgelik Kütüphanesi</span>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-black/60 border border-white/10 backdrop-blur-md text-mystic-primary text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-mystic-text-muted text-xs mb-3">
                      <Calendar size={12} />
                      <span>{new Date(post.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-mystic-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-mystic-text-muted text-xs leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 border-t border-white/5 mt-auto flex items-center justify-between text-xs font-bold text-mystic-primary group-hover:text-[#D4AF37] transition-all">
                  <span>Yazıyı Oku</span>
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
