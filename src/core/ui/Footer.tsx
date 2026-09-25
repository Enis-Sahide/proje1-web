"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Yönetim paneli ve ödeme iframe'i kendi bağımsız düzenlerini kullanır.
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout/iframe')) {
    return null;
  }

  return (
    <footer className="w-full border-t border-white/5 bg-black/60 backdrop-blur-md py-8 px-4 mt-auto text-xs text-white/50 z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-semibold text-white/70">7Layers Ancient Knowledge Realm</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span>© {new Date().getFullYear()} Tüm Hakları Saklıdır.</span>
        </div>

        {/* Center: Legal & Contact Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
          <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-[#D4AF37] transition-colors">
            Mesafeli Satış Sözleşmesi
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/iptal-ve-iade" className="hover:text-[#D4AF37] transition-colors">
            İptal ve İade Koşulları
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">
            Gizlilik ve KVKK
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/iletisim" className="hover:text-[#D4AF37] transition-colors font-medium">
            İletişim
          </Link>
          <span className="text-white/20">•</span>
          <a
            href="mailto:info@7layers.tr"
            className="hover:text-[#D4AF37] text-white/70 transition-colors flex items-center gap-1.5"
            title="E-Posta Gönder"
          >
            <Mail size={12} className="text-[#D4AF37]" />
            <span>info@7layers.tr</span>
          </a>
          <span className="text-white/20">•</span>
          <a
            href="https://www.instagram.com/7layers.tr?stkn=MXRnbnl0Nnp0dmxoNQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#D4AF37] text-white/70 transition-colors flex items-center gap-1.5"
            title="Instagram'da Takip Et"
          >
            <svg 
              width={12} 
              height={12} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-[#D4AF37]"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <span>@7layers.tr</span>
          </a>
          <span className="text-white/20">•</span>
          <a
            href="https://www.youtube.com/@enissahidekesik"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#D4AF37] text-white/70 transition-colors flex items-center gap-1.5"
            title="YouTube Kanalı"
          >
            <svg 
              width={13} 
              height={13} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-[#D4AF37]"
            >
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
            </svg>
            <span>YouTube</span>
          </a>
          <span className="text-white/20">•</span>
          <Link
            href="/iletisim"
            className="hover:text-[#D4AF37] text-white/70 transition-colors flex items-center gap-1.5"
            title="İletişim & Destek Masası"
          >
            <Mail size={13} className="text-[#D4AF37]" />
            <span>Destek & İletişim</span>
          </Link>
        </div>

        {/* Right: Security Badge */}
        <div className="flex items-center gap-2 text-[10px] text-white/40">
          <ShieldCheck size={14} className="text-green-500/80" />
          <span>256-Bit SSL & 3D Secure Güvenli Ödeme</span>
        </div>
      </div>
    </footer>
  );
}
