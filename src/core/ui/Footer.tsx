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
          <span className="font-semibold text-white/70">7Layers Ancient Knowledge School</span>
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
