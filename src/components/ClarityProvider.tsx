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
    Clarity.init(CLARITY_PROJECT_ID);
    initialized = true;
  }, []);

  useEffect(() => {
    if (!initialized || !user) return;
    // Kullanıcıyı Clarity'de tanımla (id hash'lenerek iletilir)
    Clarity.identify(user.id, undefined, undefined, user.fullName ?? undefined);
    Clarity.setTag('role', role);
  }, [user, role]);

  return null;
}
