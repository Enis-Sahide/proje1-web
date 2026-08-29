"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

// HERKESE AÇIK (public): /, /meditation (Frekans Odası), /breathwork (Nefes), /analysis (Analiz) + /auth
// Aşağıdakiler en az GİRİŞ ister (misafir → /auth/login):
const GUEST_PROTECTED_ROUTES = [
  '/profile',
  '/kadim-dersler', // Dersler
  '/tests', // Sınavlar
  '/explore', // Keşfet
  '/vip-teknolojiler', // VIP (Kadim Uygulamalar)
  '/membership', // VIP Seviyeler
  '/vendor', // Satıcı paneli
];

// Rol seviyeleri (büyük = üst).
const ROLE_LEVELS: Record<string, number> = {
  free: 0,
  apprentice: 1,
  journeyman: 2,
  master: 3,
  admin: 999,
};

// ── SAYFA (ROUTE) BAZLI MİNİMUM ROL ───────────────────────────────
// Buraya istediğin sayfa yolunu ve gereken minimum rolü ekle.
// Eşleşme "başlangıç" (prefix) ile yapılır; admin her zaman geçer.
// Yetersiz seviyedeki giriş yapmış kullanıcı /membership'e, misafir /auth/login'e yönlenir.
// Örnek (yorumu açıp kullan):
//   '/vip-teknolojiler': 'master',
//   '/analysis/kabbalah': 'journeyman',
const ROUTE_MIN_ROLE: Record<string, 'apprentice' | 'journeyman' | 'master'> = {
  '/vip-teknolojiler': 'master', // Kadim Uygulamalar — sadece Usta
};

function requiredRoleFor(pathname: string): string | null {
  const match = Object.keys(ROUTE_MIN_ROLE).find((p) => pathname.startsWith(p));
  return match ? ROUTE_MIN_ROLE[match as keyof typeof ROUTE_MIN_ROLE] : null;
}

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isAdminRoute = pathname.startsWith('/admin');
    const isAuthRoute = pathname.startsWith('/auth');
    const isGuestProtectedRoute = GUEST_PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const minRole = requiredRoleFor(pathname);

    if (user) {
      if (role !== 'admin') {
        // Non-admin logged-in users cannot access admin routes.
        if (isAdminRoute) {
          router.replace('/');
          return;
        }
        // Seviye yetersizse rol-korumalı sayfalardan üyelik sayfasına yönlendir.
        if (minRole && (ROLE_LEVELS[role] ?? 0) < (ROLE_LEVELS[minRole] ?? 0)) {
          router.replace('/membership');
        }
      }
    } else {
      // Guest users cannot access admin routes, guest protected routes or role-gated routes.
      if (isAdminRoute || isGuestProtectedRoute || minRole) {
        router.replace('/auth/login');
      }
    }
  }, [user, role, isLoading, pathname, router]);

  // While loading, render a clean loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-mystic-dark flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-mystic-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-mystic-primary border-r-mystic-accent animate-spin"></div>
        </div>
      </div>
    );
  }

  // Prevent flash of unauthorized content on admin / guest-protected / role-gated routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isGuestProtectedRoute = GUEST_PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const minRole = requiredRoleFor(pathname);
  if (isAdminRoute && (!user || role !== 'admin')) {
    return null;
  }
  if (isGuestProtectedRoute && !user) {
    return null;
  }
  if (minRole && role !== 'admin' && (!user || (ROLE_LEVELS[role] ?? 0) < (ROLE_LEVELS[minRole] ?? 0))) {
    return null;
  }

  return <>{children}</>;
}
