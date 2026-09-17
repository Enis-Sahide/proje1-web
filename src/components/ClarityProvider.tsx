"use client";

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';
import { useAuth } from '@/context/AuthContext';

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? 'ygjrbdxssh';

let initialized = false;

/**
 * Microsoft Clarity oturum kaydı / heatmap entegrasyonu.
 * Sadece production'da çalışır; giriş yapmış kullanıcıyı Clarity'ye tanıtır.
 */
export default function ClarityProvider() {
  const { user, role } = useAuth();

  useEffect(() => {
    if (initialized || process.env.NODE_ENV !== 'production') return;

    const startClarity = () => {
      try {
        Clarity.init(CLARITY_PROJECT_ID);
        initialized = true;
      } catch (e) {
        console.warn('Clarity init error:', e);
      }
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => setTimeout(startClarity, 1500));
      } else {
        setTimeout(startClarity, 2500);
      }
    }
  }, []);

  useEffect(() => {
    if (!initialized || !user) return;
    // Kullanıcıyı Clarity'de tanımla (id hash'lenerek iletilir)
    Clarity.identify(user.id, undefined, undefined, user.fullName ?? undefined);
    Clarity.setTag('role', role);
  }, [user, role]);

  return null;
}
