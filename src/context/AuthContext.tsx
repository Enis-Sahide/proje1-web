"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export interface AppUser {
  id: string;
  email: string;
  fullName: string | null;
  // Geriye dönük uyumluluk (Navigation/profile user.user_metadata?.full_name kullanıyor)
  user_metadata: {
    full_name?: string;
    unlockedTiers?: string[];
    race?: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  session: { user: AppUser } | null;
  isLoading: boolean;
  role: string;
  unlockedTiers: string[];
  passedExams: string[];
  examAttempts: Record<string, any>;
  unlockTier: (tierId: string) => Promise<void>;
  hasAccess: (tierId: string) => boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  role: 'free',
  unlockedTiers: [],
  passedExams: [],
  examAttempts: {},
  unlockTier: async () => {},
  hasAccess: () => false,
  logout: async () => {},
  refresh: async () => {},
});

interface MeResponse {
  user: { id: string; email: string; fullName: string | null; role: string };
  role: string;
  unlockedTiers: string[];
  passedExams?: string[];
  examAttempts?: Record<string, any>;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('free');
  const [unlockedTiers, setUnlockedTiers] = useState<string[]>([]);
  const [passedExams, setPassedExams] = useState<string[]>([]);
  const [examAttempts, setExamAttempts] = useState<Record<string, any>>({});

  const applyMe = (me: MeResponse | null) => {
    if (me?.user) {
      setUser({
        id: me.user.id,
        email: me.user.email,
        fullName: me.user.fullName,
        user_metadata: {
          full_name: me.user.fullName ?? undefined,
          unlockedTiers: me.unlockedTiers,
        },
      });
      setRole(me.role || 'free');
      setUnlockedTiers(me.unlockedTiers || []);
      setPassedExams(me.passedExams || []);
      setExamAttempts(me.examAttempts || {});
    } else {
      setUser(null);
      setRole('free');
      setUnlockedTiers([]);
      setPassedExams([]);
      setExamAttempts({});
    }
  };

  const refresh = async () => {
    try {
      const me = await apiFetch<MeResponse>('/api/auth/me');
      applyMe(me);
    } catch {
      applyMe(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unlockTier = async (tierId: string) => {
    if (!user) return;
    try {
      const res = await apiFetch<{ unlockedTiers: string[]; role: string }>(
        '/api/progress/unlock',
        { method: 'POST', body: JSON.stringify({ tierId }) },
      );
      setUnlockedTiers(res.unlockedTiers);
      setRole(res.role);
      setUser((u) =>
        u ? { ...u, user_metadata: { ...u.user_metadata, unlockedTiers: res.unlockedTiers } } : u,
      );
    } catch (e) {
      console.error('Tier açma hatası:', e);
    }
  };

  // Seviye-bazlı erişim: tierId'nin derecesi (1/2/3) kullanıcının rol seviyesini geçmemeli.
  const hasAccess = (tierId: string) => {
    if (role === 'admin') return true;
    if (!tierId) return true;
    const ROLE_LEVELS: Record<string, number> = { free: 0, apprentice: 1, journeyman: 2, master: 3, admin: 999 };
    const lvl = tierId.includes('master') || /3$/.test(tierId)
      ? 3
      : /2$/.test(tierId)
        ? 2
        : /1$/.test(tierId)
          ? 1
          : 0;
    return (ROLE_LEVELS[role] ?? 0) >= lvl;
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST', body: '{}' });
    } catch (e) {
      console.error('Çıkış hatası:', e);
    } finally {
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user ? { user } : null,
        isLoading,
        role,
        unlockedTiers,
        passedExams,
        examAttempts,
        unlockTier,
        hasAccess,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
