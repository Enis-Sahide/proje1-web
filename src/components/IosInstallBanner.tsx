"use client";

import React, { useEffect, useState } from "react";
import { Share, PlusSquare, X, Smartphone, CheckCircle2 } from "lucide-react";

const DISMISS_KEY = "7layers_ios_pwa_dismissed_until";

export default function IosInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Standalone (zaten Ana Ekrana eklenmiş) modda ise gösterme
    const isStandalone =
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) return;

    // iOS / iPadOS cihaz tespiti
    const ua = window.navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

    if (!isIOS) return;

    // Kullanıcı yakın zamanda kapattıysa tekrar rahatsız etme (3 gün)
    try {
      const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || "0");
      if (dismissedUntil > Date.now()) return;
    } catch {}

    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      // 3 gün boyunca tekrar gösterme
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 3 * 24 * 60 * 60 * 1000));
    } catch {}
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 z-[90] md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#0b0a14]/95 backdrop-blur-xl border border-[#D4AF37]/40 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.85)] text-white">
        <div className="flex items-center gap-3">
          <img
            src="/apple-touch-icon.png"
            alt="7Layers"
            className="w-12 h-12 rounded-xl border border-[#D4AF37]/40 shrink-0 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Smartphone size={13} className="text-[#D4AF37] shrink-0" />
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider truncate">
                7Layers iPhone Uygulaması
              </h4>
            </div>
            <p className="text-xs text-white/80 mt-0.5 leading-snug">
              Ana ekranınıza ekleyerek tam ekran mobil uygulama olarak kullanın.
            </p>
          </div>
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 shadow-sm active:scale-95 transition-transform"
            >
              Yükle
            </button>
          )}
          <button
            onClick={handleDismiss}
            aria-label="Kapat"
            className="p-1.5 text-white/40 hover:text-white rounded-lg transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {expanded && (
          <div className="mt-3.5 pt-3 border-t border-white/10 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 bg-white/5 rounded-xl p-2.5 border border-white/5">
              <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold shrink-0">
                1
              </div>
              <p className="text-white/85 leading-relaxed">
                Safari alt veya üst çubuğundaki{" "}
                <span className="inline-flex items-center gap-1 text-[#D4AF37] font-semibold">
                  <Share size={13} className="inline" /> Paylaş
                </span>{" "}
                simgesine dokunun.
              </p>
            </div>

            <div className="flex items-start gap-2.5 bg-white/5 rounded-xl p-2.5 border border-white/5">
              <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold shrink-0">
                2
              </div>
              <p className="text-white/85 leading-relaxed">
                Menüden{" "}
                <span className="inline-flex items-center gap-1 text-[#D4AF37] font-semibold">
                  <PlusSquare size={13} className="inline" /> Ana Ekrana Ekle
                </span>{" "}
                seçeneğine ve ardından sağ üstteki{" "}
                <span className="text-white font-semibold">Ekle</span> butonuna dokunun.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                <CheckCircle2 size={12} /> Ana ekranınıza 7Layers ikonu eklenecektir
              </span>
              <button
                onClick={handleDismiss}
                className="text-[11px] text-white/50 hover:text-white underline"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
