"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  role: string;
  unlockedTiers: string[];
  unlockTier: (tierId: string) => Promise<void>;
  hasAccess: (tierId: string) => boolean;
  logout: () => Promise<void>;
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
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('free');
  const [unlockedTiers, setUnlockedTiers] = useState<string[]>([]);
  const router = useRouter();

  const getUserRole = async (currentUser: User | null): Promise<string> => {
    if (!currentUser) return 'free';
    
    try {
      // enissahide.kesik@outlook.com e-posta adresini otomatik olarak admin yap
      if (currentUser.email === 'enissahide.kesik@outlook.com') {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        
        if (error || profile?.role !== 'admin') {
          // Profil yoksa veya rolü admin değilse güncelle/ekle
          await supabase
            .from('profiles')
            .upsert({ 
              id: currentUser.id, 
              role: 'admin', 
              full_name: currentUser.user_metadata?.full_name || 'Admin Sahide' 
            });
        }
        return 'admin';
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();
      
      let dbRole = 'free';
      if (error || !data) {
        // Profil veritabanında yoksa otomatik oluştur (Self-healing)
        await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            role: 'free',
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Yeni Üye'
          });
        dbRole = 'free';
      } else {
        dbRole = data.role || 'free';
      }

      // Determine role from unlockedTiers metadata (synced from mobile app)
      const metadataTiers = currentUser.user_metadata?.unlockedTiers || [];
      let metadataRole = 'free';
      if (metadataTiers.length > 0) {
        const hasMaster = metadataTiers.some((t: string) => t.includes('master') || t.endsWith('_3') || t.includes('Final'));
        const hasJourneyman = metadataTiers.some((t: string) => t.includes('_2') || t.endsWith('_2'));
        
        if (hasMaster) {
          metadataRole = 'master';
        } else if (hasJourneyman) {
          metadataRole = 'journeyman';
        } else {
          metadataRole = 'apprentice';
        }
      }

      const roleLevels: Record<string, number> = {
        free: 0,
        apprentice: 1,
        journeyman: 2,
        master: 3
      };

      if (roleLevels[metadataRole] > roleLevels[dbRole]) {
        dbRole = metadataRole;
        await supabase
          .from('profiles')
          .update({ role: dbRole })
          .eq('id', currentUser.id);
      }
      
      return dbRole;
    } catch (e) {
      console.error("Error getting user role:", e);
      return 'free';
    }
  };

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const userRole = await getUserRole(session.user);
            setRole(userRole);
            setUnlockedTiers(session.user.user_metadata?.unlockedTiers || []);
          } else {
            setRole('free');
            setUnlockedTiers([]);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth session error:", error);
        if (mounted) setIsLoading(false);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userRole = await getUserRole(session.user);
          setRole(userRole);
          setUnlockedTiers(session.user.user_metadata?.unlockedTiers || []);
        } else {
          setRole('free');
          setUnlockedTiers([]);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const unlockTier = async (tierId: string) => {
    if (!user) return;
    try {
      const currentTiers = user.user_metadata?.unlockedTiers || [];
      if (!currentTiers.includes(tierId)) {
        const newTiers = [...currentTiers, tierId];
        setUnlockedTiers(newTiers);
        
        // 1. Sync to Supabase Auth user_metadata
        const { data, error } = await supabase.auth.updateUser({
          data: { unlockedTiers: newTiers }
        });
        
        if (error) throw error;

        // Immediately update local user state if successful
        if (data?.user) {
          setUser(data.user);
        }

        // 2. Determine overall role level and sync to public.profiles table
        const hasMaster = newTiers.some((t: string) => t.includes('master') || t.endsWith('_3') || t.includes('Final'));
        const hasJourneyman = newTiers.some((t: string) => t.includes('_2') || t.endsWith('_2'));
        
        let newRole = 'free';
        if (hasMaster) {
          newRole = 'master';
        } else if (hasJourneyman) {
          newRole = 'journeyman';
        } else if (newTiers.length > 0) {
          newRole = 'apprentice';
        }

        const roleLevels: Record<string, number> = {
          free: 0,
          apprentice: 1,
          journeyman: 2,
          master: 3,
          admin: 999
        };

        const currentRole = role || 'free';
        if (roleLevels[newRole] > roleLevels[currentRole]) {
          setRole(newRole);
          await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', user.id);
        }
      }
    } catch (error) {
      console.error('Progress update failed:', error);
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
      // Clear all Supabase related local storage keys immediately to force local logged out state
      try {
        for (const key in localStorage) {
          if (key.startsWith('sb-') || key.includes('supabase.auth')) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }

      // Fire server signOut in the background without blocking the client redirect
      supabase.auth.signOut().catch((error) => {
        console.error("Background signout error:", error);
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Immediately redirect to homepage to reload the app in a logged out state
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, role, unlockedTiers, unlockTier, hasAccess, logout }}>
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
