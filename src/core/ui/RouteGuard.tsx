"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

const GUEST_PROTECTED_ROUTES = ['/profile', '/kadim-dersler', '/tests'];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isAdminRoute = pathname.startsWith('/admin');
    const isAuthRoute = pathname.startsWith('/auth');
    const isGuestProtectedRoute = GUEST_PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    if (user) {
      if (role !== 'admin') {
        // Non-admin logged-in users cannot access admin routes.
        if (isAdminRoute) {
          router.replace('/');
        }
      }
    } else {
      // Guest users cannot access admin routes or guest protected routes.
      if (isAdminRoute || isGuestProtectedRoute) {
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

  // Prevent flash of unauthorized content on admin routes or guest protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isGuestProtectedRoute = GUEST_PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (isAdminRoute && (!user || role !== 'admin')) {
    return null;
  }
  if (isGuestProtectedRoute && !user) {
    return null;
  }

  return <>{children}</>;
}
