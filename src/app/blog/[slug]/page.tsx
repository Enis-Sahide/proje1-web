"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, User, Sparkles, BookOpen } from 'lucide-react';
import { useContent } from '@/lib/useContent';

export default function BlogDetailPage() {
  const router = useRouter();
  const { slug } = useParams();

  // Fetch blog detail by slug
  const { data: post, error, loading } = useContent<any>(slug ? `/api/content/blog/${slug}` : null);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 relative flex items-center justify-center bg-transparent">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />
        <div className="flex flex-col items-center justify-center gap-4 text-mystic-text-muted">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-mystic-primary/10"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-mystic-primary border-r-mystic-accent animate-spin"></div>
          </div>
          <p className="text-sm">Bilgelik kütüphanesinden kayıt getiriliyor...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 relative flex items-center justify-center bg-transparent">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />
        <div className="bg-mystic-surface/80 border border-red-500/20 max-w-md w-full p-8 rounded-3xl backdrop-blur-md text-center shadow-2xl">
          <h3 className="text-red-400 font-bold text-xl mb-2">Yazı Bulunamadı</h3>
          <p className="text-mystic-text-muted text-sm mb-6">
            Aradığınız blog yazısı mevcut olmayabilir, yayından kaldırılmış olabilir veya URL yolu yanlıştır.
          </p>
          <button 
            onClick={() => router.push('/blog')}
            className="flex items-center justify-center gap-2 bg-mystic-primary text-black font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#D4AF37] transition-all w-full cursor-pointer"
          >
            <ArrowLeft size={16} /> Blog'a Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 relative flex flex-col items-center bg-transparent">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />
      
      <article className="max-w-3xl w-full relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/blog')}
          className="mb-8 flex items-center gap-2 text-mystic-text-muted hover:text-white transition-colors text-sm font-bold cursor-pointer group"
        >
          <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
          Blog'a Dön
        </button>

        {/* Cover Image banner */}
        <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden bg-black/40 border border-white/10 mb-8">
          {post.imageUrl ? (
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-mystic-text-muted">
              <BookOpen size={48} className="text-mystic-primary/20" />
              <span className="text-sm">7Layers Blog</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          
          {/* Metadata overlay on image bottom */}
          <div className="absolute bottom-6 left-6 right-6">
            <span className="bg-mystic-primary text-black text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full mb-3 inline-block">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
              {post.title}
            </h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-mystic-surface/75 border border-mystic-surface-light rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          {/* Top metadata info */}
          <div className="flex flex-wrap items-center gap-4 text-mystic-text-muted text-xs border-b border-white/5 pb-5 mb-6">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-mystic-accent" />
              <span>{new Date(post.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-mystic-accent" />
              <span>7Layers Bilge Rehber</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto text-mystic-primary">
              <Sparkles size={14} />
              <span className="font-semibold">Bilgi ve Şifa Yolu</span>
            </div>
          </div>

          {/* Text body */}
          <div className="text-white/95 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-6">
            {post.content}
          </div>
        </div>
      </article>
    </div>
  );
}
