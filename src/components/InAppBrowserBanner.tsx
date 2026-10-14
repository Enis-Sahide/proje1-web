"use client";

import React, { useState, useEffect } from 'react';
import { Compass, X } from 'lucide-react';

export default function InAppBrowserBanner() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const isDismissed = sessionStorage.getItem('dismissed_inapp_banner') === 'true';
      if (isDismissed) return;

      const ua = window.navigator.userAgent || window.navigator.vendor || '';
      // Instagram, Facebook, TikTok veya benzeri In-App WebView kontrolü
      const inApp = /Instagram|FBAN|FBAV|musical_ly|ByteLocale|ByteFullConfig/i.test(ua);
      
      if (inApp) {
        setIsInAppBrowser(true);
        setDismissed(false);
      }
    } catch {
      // Storage access blocked or restricted in private mode
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('dismissed_inapp_banner', 'true');
    } catch {}
  };

  if (!isInAppBrowser || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#D4AF37]/20 via-[#0EA5E9]/20 to-[#D4AF37]/20 border-b border-[#D4AF37]/30 text-white text-xs px-3 py-2 z-50 relative flex items-center justify-between gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Compass size={15} className="text-[#D4AF37] shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
        <p className="truncate">
          <span className="font-semibold text-[#D4AF37]">Instagram Tarayıcısı:</span> Daha akıcı kullanım için sağ üstteki <span className="underline font-bold">⋯</span> menüsünden <span className="text-[#0EA5E9] font-medium">"Tarayıcıda Aç"</span>ı seçebilirsiniz.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Kapat"
        className="p-1 text-white/60 hover:text-white rounded-md bg-white/5 hover:bg-white/10 shrink-0 transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}
