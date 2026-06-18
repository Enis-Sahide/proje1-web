"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';
import Link from 'next/link';

const roleLevels: Record<string, number> = {
  free: 0,
  apprentice: 1,
  journeyman: 2,
  master: 3
};

interface RequireRoleProps {
  children: React.ReactNode;
  minimumRole: 'free' | 'apprentice' | 'journeyman' | 'master';
  fallback?: React.ReactNode;
}

export default function RequireRole({ children, minimumRole, fallback }: RequireRoleProps) {
  const { role, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse bg-mystic-surface/50 h-32 rounded-2xl w-full"></div>;
  }

  const currentLevel = user ? (roleLevels[role] ?? 0) : -1;
  const requiredLevel = roleLevels[minimumRole] ?? 0;

  if (currentLevel >= requiredLevel || role === 'admin') {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback UI
  const roleNames = {
    free: 'Ücretsiz Üyelik',
    apprentice: 'Çıraklık',
    journeyman: 'Kalfalık',
    master: 'Ustalık'
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-mystic-surface/80 border border-mystic-primary/30 p-8 text-center flex flex-col items-center justify-center backdrop-blur-md">
      <div className="w-16 h-16 rounded-full bg-mystic-dark flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
        <Lock className="text-mystic-accent" size={32} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {minimumRole === 'free' ? 'En Az Ücretsiz Üyelik Gerektirir' : `${roleNames[minimumRole]} Mührü Gerekiyor`}
      </h3>
      <p className="text-mystic-text-muted mb-6">
        {minimumRole === 'free' 
          ? 'Bu bölümü kullanabilmek için lütfen ücretsiz giriş yapın veya kayıt olun.' 
          : 'Bu kadim bilgiye erişebilmek için hesabınızı yükseltmeniz gerekmektedir.'}
      </p>
      <Link 
        href={minimumRole === 'free' ? "/auth/login" : "/membership"} 
        className="bg-mystic-primary text-mystic-dark font-bold px-8 py-3 rounded-full hover:bg-mystic-accent transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)]"
      >
        {minimumRole === 'free' ? 'Giriş Yap' : 'Seviyeni Yükselt'}
      </Link>
    </div>
  );
}
