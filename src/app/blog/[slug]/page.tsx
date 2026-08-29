"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, User, Sparkles, BookOpen, Share2, Link } from 'lucide-react';
import { useContent } from '@/lib/useContent';

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;
  const slugStr = typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : null;

  // Fetch blog detail by slug
  const { data: post, error, loading } = useContent<any>(slugStr ? `/api/content/blog/${slugStr}` : null);

  const [shareUrl, setShareUrl] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          <div className="flex flex-wrap items-center gap-4 text-mystic-text-muted text-xs border-b border-white/5 pb-5 mb-6 relative">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-mystic-accent" />
              <span>{new Date(post.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-mystic-accent" />
              <span>7Layers Bilge Rehber</span>
            </div>
            <div className="flex items-center gap-1.5 text-mystic-primary">
              <Sparkles size={14} />
              <span className="font-semibold">Bilgi ve Şifa Yolu</span>
            </div>

            {/* Quick Share Button */}
            <div className="relative ml-auto">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-mystic-primary hover:text-white border border-white/5 hover:border-white/10 px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
              >
                <Share2 size={12} /> Paylaş
              </button>
              
              {showDropdown && (
                <>
                  {/* Backdrop overlay to close dropdown */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  
                  {/* Dropdown Content */}
                  <div className="absolute right-0 mt-2 w-48 bg-mystic-surface border border-mystic-surface-light rounded-2xl p-3 shadow-2xl z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-mystic-text-muted mb-2 px-2">Paylaş</p>
                    <div className="space-y-1">
                      <a 
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:bg-white/5 px-2 py-1.5 rounded-xl transition-colors text-white font-semibold text-xs"
                      >
                        <span className="text-emerald-500">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.287 1.479 5.362 1.48 5.432-.001 9.851-4.42 9.854-9.859.002-2.632-1.018-5.105-2.872-6.961C17.078 1.958 14.6 1.939 12.009 1.939c-5.43 0-9.851 4.42-9.854 9.86-.001 2.083.518 3.738 1.523 5.421l-.999 3.648 3.778-.991z"/>
                          </svg>
                        </span>
                        WhatsApp
                      </a>
                      <a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:bg-white/5 px-2 py-1.5 rounded-xl transition-colors text-white font-semibold text-xs"
                      >
                        <span className="text-white">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </span>
                        Twitter / X
                      </a>
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:bg-white/5 px-2 py-1.5 rounded-xl transition-colors text-white font-semibold text-xs"
                      >
                        <span className="text-blue-500">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                          </svg>
                        </span>
                        Facebook
                      </a>
                      <button 
                        onClick={() => { handleCopyLink(); setShowDropdown(false); }}
                        className="flex items-center gap-2 hover:bg-white/5 w-full text-left px-2 py-1.5 rounded-xl transition-colors text-white font-semibold text-xs cursor-pointer"
                      >
                        <Link size={14} className="text-mystic-primary" />
                        {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Text body */}
          <div className="text-white/95 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-6 mb-10">
            {post.content}
          </div>

          {/* Share Section at bottom */}
          <div className="border-t border-white/5 pt-6 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Bu yazıyı faydalı buldunuz mu?</h4>
              <p className="text-xs text-mystic-text-muted">Sosyal medyada paylaşarak başkalarının da şifa ve bilgi yoluna ulaşmasına yardımcı olabilirsiniz.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 px-4 py-2 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.287 1.479 5.362 1.48 5.432-.001 9.851-4.42 9.854-9.859.002-2.632-1.018-5.105-2.872-6.961C17.078 1.958 14.6 1.939 12.009 1.939c-5.43 0-9.851 4.42-9.854 9.86-.001 2.083.518 3.738 1.523 5.421l-.999 3.648 3.778-.991z"/>
                </svg>
                WhatsApp
              </a>
              
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter / X
              </a>
              
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/30 px-4 py-2 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
                Facebook
              </a>
              
              <button 
                onClick={handleCopyLink}
                className="relative flex items-center gap-2 bg-mystic-primary/10 hover:bg-mystic-primary/20 text-mystic-primary border border-mystic-primary/20 hover:border-mystic-primary/30 px-4 py-2 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Link size={14} />
                {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
                
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-mystic-primary text-black text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl animate-bounce">
                    Kopyalandı!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
