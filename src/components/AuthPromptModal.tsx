"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, UserPlus, LogIn, X, Sparkles } from 'lucide-react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  redirectUrl?: string;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  title = "Ücretsiz Üyelik Gerekli",
  description = "Satın aldığınız analiz raporunuzun e-postanıza güvenle iletilmesi ve profilinizde her zaman saklanabilmesi için lütfen ücretsiz giriş yapın veya 1 dakikada hesabınızı oluşturun.",
  redirectUrl = ""
}: AuthPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    const target = redirectUrl ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/login';
    router.push(target);
  };

  const handleRegister = () => {
    const target = redirectUrl ? `/auth/register?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/register';
    router.push(target);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0f0f18] border border-[#D4AF37]/30 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative text-white animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-5 mx-auto shadow-[0_0_30px_rgba(212,175,55,0.15)]">
          <Lock size={26} />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#D4AF37] font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>7Layers Güvenli Erişim</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-mystic-text-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-[#D4AF37] via-[#f5db8b] to-[#D4AF37] hover:brightness-110 text-black font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
          >
            <LogIn size={16} />
            <span>Giriş Yap</span>
          </button>

          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Ücretsiz Hesap Oluştur</span>
          </button>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Vazgeç ve Haritaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
