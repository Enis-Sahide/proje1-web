"use client";

import React, { useEffect, useState } from 'react';
import { Smartphone, Share, PlusSquare, X, CheckCircle2, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function openPwaInstallModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('7layers:open-pwa-install'));
  }
}

export default function InstallPwaPrompt() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standaloneMatch =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMatch);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
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

  const handleInstallAction = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowModal(false);
        }
        return;
      } catch {
        // fallback to modal
      }
    }
    setShowModal(true);
  };

  if (!showModal) return null;

  return (
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
  );
}
