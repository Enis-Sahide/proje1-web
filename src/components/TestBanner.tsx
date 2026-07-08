"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Smartphone, X, Sparkles, ArrowRight } from 'lucide-react';

export default function TestBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/test' || pathname.startsWith('/admin')) {
      setIsVisible(false);
      return;
    }

    const dismissed = localStorage.getItem('dismissed_test_banner') === 'true';
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleClose = () => {
    localStorage.setItem('dismissed_test_banner', 'true');
    setIsVisible(false);
  };

  const handleJoin = () => {
    localStorage.setItem('dismissed_test_banner', 'true');
    setIsVisible(false);
    router.push('/test');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-[380px] z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-mystic-surface/95 backdrop-blur-md border border-mystic-primary/30 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5),_0_0_20px_rgba(212,175,55,0.15)] relative overflow-hidden group">
        
        {/* Subtle glowing pulse background */}
        <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-mystic-primary/10 rounded-full blur-2xl group-hover:bg-mystic-primary/20 transition-colors duration-500"></div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-1 bg-white/5 hover:bg-white/10 text-mystic-text-muted hover:text-white rounded-lg transition-colors cursor-pointer"
          aria-label="Kapat"
        >
          <X size={14} />
        </button>

        <div className="flex gap-4 items-start pr-6">
          {/* Icon */}
          <div className="p-3 bg-mystic-primary/10 text-mystic-primary rounded-xl border border-mystic-primary/20 shrink-0">
            <Smartphone className="animate-pulse" size={24} />
          </div>

          {/* Texts */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              7LAYERS Android Yayında!
              <Sparkles className="text-mystic-accent" size={14} />
            </h4>
            <p className="text-xs text-mystic-text-muted leading-relaxed">
              Google Play onay sürecine katkı sağlamak ve uygulamamızı hemen indirmek için test ekibimize katılın.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleJoin}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-mystic-primary text-black hover:bg-mystic-accent text-xs font-bold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:scale-[1.02] cursor-pointer"
          >
            Test Ekibine Katıl
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
