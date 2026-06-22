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
  unlockTier: async () => {},
  hasAccess: () => false,
  logout: async () => {},
  refresh: async () => {},
});

interface MeResponse {
  user: { id: string; email: string; fullName: string | null; role: string };
  role: string;
  unlockedTiers: string[];
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('free');
  const [unlockedTiers, setUnlockedTiers] = useState<string[]>([]);

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
    } else {
      setUser(null);
      setRole('free');
      setUnlockedTiers([]);
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

  const hasAccess = (tierId: string) => {
    if (role === 'admin') return true;
    if (!tierId) return true;
    if (tierId.endsWith('_1')) return true;
    return unlockedTiers.includes(tierId);
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
