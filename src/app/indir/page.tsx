'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Smartphone, ExternalLink, ArrowRight, ShieldCheck, Sparkles, Radio, Compass, Wind } from 'lucide-react';

const PLAY_STORE_WEB_URL = 'https://play.google.com/store/apps/details?id=com.enissahide.esk7layers';
const PLAY_STORE_MARKET_URL = 'market://details?id=com.enissahide.esk7layers';

export default function IndirPage() {
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect mobile / android
    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
    const isAndroidDevice = /android/i.test(ua);
    setIsAndroid(isAndroidDevice);

    // Auto-attempt redirect after a very brief moment
    const timer = setTimeout(() => {
      if (isAndroidDevice) {
        // Try market:// first, fallback to web play store
        window.location.href = PLAY_STORE_MARKET_URL;
      }
      setIsRedirecting(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-between selection:bg-[#D4AF37]/30">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#D4AF37]/15 via-[#8A5CF6]/10 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.25)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1c1a24] to-[#0d0f15] flex items-center justify-center overflow-hidden">
              <span className="text-[#D4AF37] font-serif font-bold text-lg">7</span>
            </div>
          </div>
          <span className="font-serif tracking-widest text-lg text-[#F0E6D2] font-semibold">
            7LAYERS
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs tracking-wider text-[#A3A8B8] hover:text-[#D4AF37] transition-colors flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
        >
          Web Sitesine Git <ArrowRight size={14} />
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-xl mx-auto px-6 py-6 w-full flex flex-col items-center text-center">
        {/* App Icon Container */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#E5C158] rounded-3xl blur-md opacity-40 animate-pulse" />
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-b from-[#181B26] to-[#0F111A] border border-[#D4AF37]/40 shadow-2xl flex items-center justify-center p-3">
            <div className="w-full h-full rounded-2xl bg-[#0B0D14] flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-[#D4AF37]/20 to-transparent" />
              <Smartphone className="w-12 h-12 text-[#D4AF37] relative z-10" />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles size={12} /> Google Play Store
          </span>
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck size={12} /> Resmi & Güvenli
          </span>
        </div>

        {/* Title & Slogan */}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF] via-[#F3E5AB] to-[#D4AF37] mb-3">
          7LAYERS Mobil
        </h1>
        <p className="text-sm sm:text-base text-[#A3A8B8] max-w-md mb-8 leading-relaxed">
          Kozmik analizler, canlı Schumann rezonansı ve kadim bilgelik rehberi şimdi cebinizde.
        </p>

        {/* Primary CTA Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3.5 mb-8">
          {/* Main Google Play Link */}
          <a
            href={PLAY_STORE_WEB_URL}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E6C65B] to-[#C99E2A] text-[#0A0C13] font-bold text-base shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.55)] hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group"
          >
            <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider font-semibold opacity-90 leading-none">
                Hemen Yükle
              </div>
              <div className="text-base font-extrabold tracking-wide leading-tight">
                Google Play'den İndir
              </div>
            </div>
          </a>

          {/* Android Deep Link alternative for native store open */}
          {isAndroid && (
            <a
              href={PLAY_STORE_MARKET_URL}
              className="w-full py-3 px-4 rounded-xl bg-white/5 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-[#E5D7B8] hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink size={14} /> Mağaza Uygulamasında Aç
            </a>
          )}
        </div>

        {/* Notice for Instagram In-App Browser */}
        <div className="w-full max-w-sm bg-black/40 border border-white/5 rounded-xl p-3.5 text-xs text-[#8A90A2] mb-10 text-left">
          <p className="flex items-start gap-2">
            <span className="text-[#D4AF37] font-bold">ℹ️ İpucu:</span>
            <span>
              Instagram içinden açtıysanız sağ üstteki üç noktaya (<strong className="text-white">⋮</strong>) dokunup 
              <strong className="text-[#D4AF37]"> "Tarayıcıda Aç"</strong> diyerek doğrudan mağazaya geçiş yapabilirsiniz.
            </span>
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Radio size={16} />
            </div>
            <h4 className="text-xs font-bold text-white">Canlı Schumann</h4>
            <p className="text-[11px] text-[#8A90A2] leading-snug">
              Dünya iyonosfer frekansı ve Tomsk spektrogram verileri.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Compass size={16} />
            </div>
            <h4 className="text-xs font-bold text-white">Kozmik Analizler</h4>
            <p className="text-[11px] text-[#8A90A2] leading-snug">
              Astroloji, Kabala ve İnsan Tasarımı tek çatı altında.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Wind size={16} />
            </div>
            <h4 className="text-xs font-bold text-white">Nefes & Frekans</h4>
            <p className="text-[11px] text-[#8A90A2] leading-snug">
              432 Hz sesler eşliğinde rehberli meditasyon ve nefes odası.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-[#6A7080] border-t border-white/5">
        <p>© {new Date().getFullYear()} 7LAYERS. Tüm hakları saklıdır.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/privacy" className="hover:text-[#A3A8B8] transition-colors">Gizlilik Politikası</Link>
          <span>•</span>
          <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-[#A3A8B8] transition-colors">Kullanım Şartları</Link>
          <span>•</span>
          <a href="mailto:info@7layers.tr" className="hover:text-[#A3A8B8] transition-colors">info@7layers.tr</a>
        </div>
      </footer>
    </div>
  );
}
