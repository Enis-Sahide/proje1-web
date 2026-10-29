import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';

interface UnlockedResponse {
  success: boolean;
  isAllUnlocked: boolean;
  unlockedTypes: string[];
}

export function useAnalysisAccess(analysisType: string) {
  const { user, role, isLoading: authLoading } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const isMasterOrAdmin = role === 'admin' || role === 'master';

  useEffect(() => {
    // Admin veya Master için tüm analizler doğrudan açık
    if (isMasterOrAdmin) {
      setIsUnlocked(true);
      setLoading(false);
      return;
    }

    // Giriş yapmamış kullanıcı için kilitli
    if (!user && !authLoading) {
      setIsUnlocked(false);
      setLoading(false);
      return;
    }

    if (user) {
      let isMounted = true;
      apiFetch<UnlockedResponse>('/api/user/unlocked-analyses')
        .then((res) => {
          if (!isMounted) return;
          if (res?.isAllUnlocked) {
            setIsUnlocked(true);
          } else {
            const types = res?.unlockedTypes || [];
            const target = analysisType.toLowerCase();
            const hasAccess = types.includes(target);
            setIsUnlocked(hasAccess);
          }
        })
        .catch((err) => {
          console.error('Error checking analysis access:', err);
          if (isMounted) setIsUnlocked(false);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [user, role, isMasterOrAdmin, authLoading, analysisType]);

  return { isUnlocked, loading };
}
