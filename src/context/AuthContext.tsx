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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  role: 'free',
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('free');
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
          } else {
            setRole('free');
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
        } else {
          setRole('free');
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    <AuthContext.Provider value={{ user, session, isLoading, role, logout }}>
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
