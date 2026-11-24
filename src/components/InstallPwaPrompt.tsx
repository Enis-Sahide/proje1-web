"use client";

import React, { useEffect, useState } from 'react';
import { Smartphone, Share, PlusSquare, X, CheckCircle2, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_STORAGE_KEY = '7layers_pwa_banner_dismissed_at';

export function openPwaInstallModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('7layers:open-pwa-install'));
  }
}

export default function InstallPwaPrompt() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standaloneMatch =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMatch);

    const ua = window.navigator.userAgent || '';
    const iosDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);

    const dismissedAt = Number(localStorage.getItem(DISMISS_STORAGE_KEY) || '0');
    const recentlyDismissed = Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000; // 3 gün

    if (!standaloneMatch && iosDevice && !recentlyDismissed) {
      const t = setTimeout(() => setShowFloatingBanner(true), 2200);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissedAt = Number(localStorage.getItem(DISMISS_STORAGE_KEY) || '0');
      const recentlyDismissed = Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000;
      if (!recentlyDismissed) {
        setShowFloatingBanner(true);
      }
    };

    const handleOpenModalEvent = () => {
      setShowModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('7layers:open-pwa-install', handleOpenModalEvent);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('7layers:open-pwa-install', handleOpenModalEvent);
    };
  }, []);

  const dismissBanner = () => {
    setShowFloatingBanner(false);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  const handleInstallAction = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowFloatingBanner(false);
          setShowModal(false);
        }
        return;
      } catch {
        // fallback to modal
      }
    }
    setShowModal(true);
  };

  return (
    <>
      {/* iPhone / Mobil Alt Yüzen Kurulum Barı (Tam Ekran Uygulama Modunda Değilse) */}
      {!isStandalone && showFloatingBanner && (
        <div className="fixed bottom-16 lg:bottom-5 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-sm z-40">
          <div className="bg-[#0D0F18]/95 backdrop-blur-xl border border-[#D4AF37]/45 rounded-2xl p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
              <Smartphone size={20} className="text-[#FDE68A]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-[#FDE68A] truncate">
                {isIOS ? '7Layers’ı iPhone’a Uygulama Olarak Ekle' : '7Layers’ı Telefona Uygulama Olarak Ekle'}
              </p>
              <p className="text-[11px] text-white/70 leading-tight mt-0.5">
                Adres çubuğu olmadan tam ekran mobil uygulama modunda açın.
              </p>
            </div>

            <button
              onClick={handleInstallAction}
              className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-extrabold hover:bg-[#FDE68A] transition-colors shrink-0"
            >
              Ekle
            </button>

            <button
              onClick={dismissBanner}
              className="p-1 text-white/40 hover:text-white transition-colors shrink-0"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Adım Adım iPhone (iOS Safari) & Android Uygulama Modu Kurulum Modalı */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#0C0E17] border border-[#D4AF37]/45 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-1"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
                <Smartphone size={24} className="text-[#FDE68A]" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                  7LAYERS • TAM EKRAN UYGULAMA MODU
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  iPhone &amp; Telefona Uygulama Olarak Ekle
                </h3>
              </div>
            </div>

            {isStandalone ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
                <CheckCircle2 size={20} className="shrink-0" />
                <span>7Layers şu anda telefonunuzda zaten tam ekran Uygulama Modunda çalışıyor!</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-white/75 leading-relaxed mb-4">
                  7Layers’ı App Store veya mağaza indirmesine gerek kalmadan doğrudan ana ekranınıza ekleyip{' '}
                  <strong className="text-[#FDE68A]">adres çubuksuz tam ekran uygulama</strong> olarak kullanabilirsiniz:
                </p>

                {/* iPhone / iPad (iOS Safari) Adımları */}
                <div className="rounded-2xl bg-white/[0.04] border border-[#D4AF37]/30 p-4 mb-3">
                  <div className="text-xs font-extrabold text-[#FDE68A] mb-3 flex items-center gap-2">
                    <span>🍎 iPhone / iPad (Safari) İçin 3 Kolay Adım:</span>
                  </div>

                  <div className="space-y-3 text-xs text-white/85">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <div className="flex-1">
                        Safari ekranının en altındaki (veya üstündeki){' '}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[#FDE68A] font-bold">
                          <Share size={12} /> Paylaş
                        </span>{' '}
                        butonuna dokunun.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <div className="flex-1">
                        Açılan menüyü biraz aşağı kaydırıp{' '}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[#FDE68A] font-bold">
                          <PlusSquare size={12} /> Ana Ekrana Ekle
                        </span>{' '}
                        seçeneğine dokunun.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <div className="flex-1">
                        Sağ üstteki <strong className="text-[#FDE68A]">&ldquo;Ekle&rdquo;</strong> butonuna basın. Artık 7Layers ana ekranınızda kendi logosuyla tam ekran uygulama olarak açılacak!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Android / Chrome Tek Tuş Kurulum veya Rehber */}
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallAction}
                    className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#FDE68A] transition-colors mb-2"
                  >
                    <Download size={16} />
                    <span>Tek Tuşla Cihaza Uygulama Olarak Yükle</span>
                  </button>
                ) : (
                  <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 text-[11px] text-white/65">
                    <strong className="text-white/90">🤖 Android (Chrome):</strong> Sağ üstteki{' '}
                    <strong>⋮ (Üç Nokta)</strong> menüsüne dokunup{' '}
                    <strong className="text-[#FDE68A]">&ldquo;Ana ekrana ekle&rdquo;</strong> veya{' '}
                    <strong className="text-[#FDE68A]">&ldquo;Uygulamayı yükle&rdquo;</strong> seçeneğine basabilirsiniz.
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/85 text-xs font-bold transition-colors"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
