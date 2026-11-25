'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  Sparkles,
  Radio,
  Compass,
  Share,
  PlusSquare,
  Globe,
  MessageSquare,
  BookOpen,
  Mail,
  Share2,
  ChevronRight,
} from 'lucide-react';
import { openPwaInstallModal } from '@/components/InstallPwaPrompt';

const PLAY_STORE_WEB_URL = 'https://play.google.com/store/apps/details?id=com.enissahide.esk7layers';
const PLAY_STORE_MARKET_URL = 'market://details?id=com.enissahide.esk7layers';

interface BioLinkItem {
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  iconKey: string;
  badgeText: string | null;
  isHighlighted: boolean;
  isActive: boolean;
  sortOrder: number;
}

const FALLBACK_BIO_LINKS: BioLinkItem[] = [
  {
    id: 'google-play-app',
    title: "Google Play'den İndir",
    subtitle: '7Layers Resmi Android Mobil Uygulaması',
    url: PLAY_STORE_WEB_URL,
    iconKey: 'playstore',
    badgeText: 'ANDROID MOBİL UYGULAMA',
    isHighlighted: true,
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'ios-app-mode',
    title: "🍎 iPhone'a Uygulama Modunda Ekle",
    subtitle: 'iPhone & iPad Ana Ekranına Tam Ekran Ekle (3 Adım)',
    url: '#ios-pwa',
    iconKey: 'apple',
    badgeText: 'IPHONE & IPAD (IOS SAFARI)',
    isHighlighted: false,
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'web-home',
    title: '7Layers Web Platformuna Giriş',
    subtitle: 'www.7layers.tr • Tüm Katmanlar & Günün Enerjisi',
    url: '/',
    iconKey: 'globe',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 30,
  },
  {
    id: 'analysis-hub',
    title: 'Ruhsal Analiz Merkezi',
    subtitle: 'Doğum Haritası, Kabalistik 4 Alem, Human Design & Numeroloji',
    url: '/analysis',
    iconKey: 'compass',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 40,
  },
  {
    id: 'kadim-meclis',
    title: '7Layers Kadim Meclis (8 Oda)',
    subtitle: 'Astroloji, Kabala, Sembolizm & Çakra Sohbet Odaları',
    url: '/meclis',
    iconKey: 'chat',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 50,
  },
  {
    id: 'schumann-live',
    title: 'Canlı Schumann Rezonansı (7.83 Hz)',
    subtitle: 'Anlık Dünya Elektromanyetik Spektrogramı & Analizi',
    url: '/analysis/schumann',
    iconKey: 'radio',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 60,
  },
  {
    id: 'kadim-dersler',
    title: 'Kadim Dersler & Seviye Sınavları',
    subtitle: 'Çırak, Kalfa ve Usta Derecesi Ezoterik Eğitimleri',
    url: '/kadim-dersler',
    iconKey: 'book',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 70,
  },
  {
    id: 'contact-support',
    title: 'İletişim & Destek Masası',
    subtitle: 'Özel Analiz Talebi, Soru & İş Birliği (info@7layers.tr)',
    url: '/iletisim',
    iconKey: 'mail',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 80,
  },
];

function renderBioIcon(iconKey: string, isHighlighted: boolean) {
  if (iconKey === 'playstore') {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
      </svg>
    );
  }
  const colorClass = isHighlighted ? 'text-black' : 'text-[#FDE68A]';
  switch (iconKey) {
    case 'apple':
      return <Smartphone size={19} className={colorClass} />;
    case 'compass':
      return <Compass size={19} className={isHighlighted ? 'text-black' : 'text-purple-400'} />;
    case 'chat':
      return <MessageSquare size={19} className={isHighlighted ? 'text-black' : 'text-amber-400'} />;
    case 'radio':
      return <Radio size={19} className={isHighlighted ? 'text-black' : 'text-cyan-400'} />;
    case 'book':
      return <BookOpen size={19} className={isHighlighted ? 'text-black' : 'text-emerald-400'} />;
    case 'mail':
      return <Mail size={19} className={isHighlighted ? 'text-black' : 'text-rose-400'} />;
    case 'sparkles':
      return <Sparkles size={19} className={colorClass} />;
    default:
      return <Globe size={19} className={isHighlighted ? 'text-black' : 'text-[#D4AF37]'} />;
  }
}

export default function IndirPage() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [links, setLinks] = useState<BioLinkItem[]>(FALLBACK_BIO_LINKS);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
    const isAndroidDevice = /android/i.test(ua);
    const isIOSDevice = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsAndroid(isAndroidDevice);
    if (isIOSDevice) {
      setShowIosSteps(true);
    }

    fetch('/api/bio-links', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.links) && data.links.length > 0) {
          setLinks(data.links);
        }
      })
      .catch(() => {
        // keep fallback links
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#06080E] text-white flex flex-col justify-between selection:bg-[#D4AF37]/30 relative overflow-x-hidden">
      {/* Ambient Cosmic Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-gradient-to-b from-[#D4AF37]/18 via-[#8A5CF6]/10 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute bottom-0 right-0 w-[380px] h-[380px] bg-[#D4AF37]/8 rounded-full blur-3xl" />
      </div>

      {/* Linktree Style Centered Container */}
      <main className="relative z-10 max-w-md mx-auto px-4 pt-10 pb-12 w-full flex flex-col items-center text-center">
        {/* Profile Avatar & Verified Badge */}
        <div className="relative mb-4">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#B8860B] rounded-full blur-md opacity-45 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-[#0D0F18] border-2 border-[#D4AF37]/60 shadow-2xl flex items-center justify-center p-1.5 overflow-hidden">
            <Image
              src="/gold-logo.png"
              alt="7Layers Logo"
              width={88}
              height={88}
              className="rounded-full object-cover"
              priority
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/12 border border-[#D4AF37]/35 text-[#FDE68A] text-[11px] font-bold px-3 py-1 rounded-full mb-2">
          <Sparkles size={12} />
          <span>Ancient Knowledge Realm • Kadim Bilgiler Alanı</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FDE68A] to-[#D4AF37] tracking-tight">
          7LAYERS
        </h1>
        <p className="text-xs sm:text-sm text-[#A3A8B8] max-w-xs mt-1.5 mb-6 leading-relaxed">
          Astroloji, Kabalistik 4 Alem, Human Design, Çakra Frekansları ve Canlı Schumann Rezonansı Platformu
        </p>

        {/* Social Quick Icons Row */}
        <div className="flex items-center justify-center gap-3 mb-7">
          <a
            href="https://www.instagram.com/7layers.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 flex items-center justify-center text-[#FDE68A] transition-all"
            title="Instagram @7layers.tr"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@enissahidekesik"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 flex items-center justify-center text-[#FDE68A] transition-all"
            title="YouTube Kanalı"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
            </svg>
          </a>
          <a
            href="mailto:info@7layers.tr"
            className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 flex items-center justify-center text-[#FDE68A] transition-all"
            title="E-Posta: info@7layers.tr"
          >
            <Mail size={17} />
          </a>
          <a
            href="https://api.whatsapp.com/send?text=Merhaba!%207LAYERS%20Kadim%20Bilgiler%20Alanı%20ve%20Mobil%20Uygulamasına%20buradan%20ulaşabilirsin:%20https://www.7layers.tr/links"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 flex items-center justify-center text-emerald-400 transition-all"
            title="WhatsApp'ta Paylaş"
          >
            <Share2 size={17} />
          </a>
        </div>

        {/* Dynamic Linktree Stack Buttons from Admin Panel */}
        <div className="w-full flex flex-col gap-3">
          {links.map((item) => {
            const isIosSpecial = item.url === '#ios-pwa' || item.id === 'ios-app-mode';
            const isPlayStoreSpecial = item.id === 'google-play-app' || item.url.includes('play.google.com');
            const targetHref = isPlayStoreSpecial && isAndroid ? PLAY_STORE_MARKET_URL : item.url;
            const isExternal = targetHref.startsWith('http://') || targetHref.startsWith('https://') || targetHref.startsWith('market://') || targetHref.startsWith('mailto:');

            const cardClass = item.isHighlighted
              ? 'w-full p-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E6C65B] to-[#C99E2A] text-[#0A0C13] shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] hover:scale-[1.015] active:scale-[0.99] transition-all flex items-center justify-between gap-3 text-left'
              : 'w-full p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#D4AF37]/45 transition-all flex items-center justify-between gap-3 group text-left';

            const iconBoxClass = item.isHighlighted
              ? 'w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center shrink-0'
              : 'w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0';

            const innerContent = (
              <>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={iconBoxClass}>{renderBioIcon(item.iconKey, item.isHighlighted)}</div>
                  <div className="min-w-0">
                    {item.badgeText && (
                      <div
                        className={`text-[10px] uppercase tracking-wider font-extrabold leading-none mb-0.5 ${
                          item.isHighlighted ? 'opacity-80' : 'text-[#FDE68A]'
                        }`}
                      >
                        {item.badgeText}
                      </div>
                    )}
                    <div
                      className={`text-sm sm:text-base font-extrabold leading-tight truncate ${
                        item.isHighlighted ? 'text-[#0A0C13]' : 'text-white group-hover:text-[#FDE68A] transition-colors'
                      }`}
                    >
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          item.isHighlighted ? 'text-black/75 font-semibold' : 'text-[#8A90A2]'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className={
                    item.isHighlighted
                      ? 'shrink-0 opacity-80'
                      : 'text-white/40 group-hover:text-[#D4AF37] shrink-0'
                  }
                />
              </>
            );

            if (isIosSpecial) {
              return (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowIosSteps((prev) => !prev);
                      openPwaInstallModal();
                    }}
                    className={`${cardClass} cursor-pointer`}
                  >
                    {innerContent}
                  </button>
                  {showIosSteps && (
                    <div className="w-full rounded-2xl bg-[#0F121C] border border-[#D4AF37]/35 p-4 text-left shadow-xl">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-extrabold text-[#FDE68A]">
                          🍎 iPhone Ana Ekranına Ekleme (3 Adım)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                          Tam Ekran Modu
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-white/85">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            1
                          </span>
                          <div>
                            iPhone <strong className="text-white">Safari</strong> tarayıcısında alt barda yer alan{' '}
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[#FDE68A] font-bold">
                              <Share size={11} /> Paylaş
                            </span>{' '}
                            ikonuna dokunun.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            2
                          </span>
                          <div>
                            Menüyü aşağı kaydırıp{' '}
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[#FDE68A] font-bold">
                              <PlusSquare size={11} /> Ana Ekrana Ekle
                            </span>{' '}
                            seçeneğine basın.
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            3
                          </span>
                          <div>
                            Sağ üstten <strong className="text-[#FDE68A]">&ldquo;Ekle&rdquo;</strong>ye dokunun. 7Layers artık adres çubuksuz tam ekran uygulama olarak açılır!
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            }

            if (isExternal) {
              return (
                <a
                  key={item.id}
                  href={targetHref}
                  target={targetHref.startsWith('http') ? '_blank' : undefined}
                  rel={targetHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={cardClass}
                >
                  {innerContent}
                </a>
              );
            }

            return (
              <Link key={item.id} href={targetHref} className={cardClass}>
                {innerContent}
              </Link>
            );
          })}
        </div>

        {/* Notice for Instagram In-App Browser */}
        <div className="w-full bg-black/45 border border-white/10 rounded-2xl p-3.5 text-xs text-[#8A90A2] mt-6 text-left">
          <p className="flex items-start gap-2">
            <span className="text-[#D4AF37] font-bold shrink-0">ℹ️ İpucu:</span>
            <span>
              Instagram içinden açtıysanız sağ üstteki üç noktaya (<strong className="text-white">⋮</strong>) dokunup{' '}
              <strong className="text-[#D4AF37]">&ldquo;Tarayıcıda Aç (Safari / Chrome)&rdquo;</strong> diyerek uygulamayı doğrudan indirebilir veya ana ekrana ekleyebilirsiniz.
            </span>
          </p>
        </div>
      </main>

      {/* Minimal Bio Footer */}
      <footer className="relative z-10 w-full py-5 text-center text-[11px] text-[#6A7080] border-t border-white/5">
        <p>© {new Date().getFullYear()} 7LAYERS Ancient Knowledge Realm</p>
      </footer>
    </div>
  );
}
