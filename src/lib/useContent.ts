'use client';

import { useEffect, useState } from 'react';

// İçerik nadiren değişir → basit modül-içi cache (stale-while-revalidate değil,
// sayfa ömrü boyunca tek fetch). Dinamik güncelleme için sayfa yenilenmesi yeterli.
const cache = new Map<string, unknown>();

export function useContent<T = any>(path: string) {
  const [data, setData] = useState<T | null>((cache.get(path) as T) ?? null);
  const [loading, setLoading] = useState(!cache.has(path));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (cache.has(path)) {
      setData(cache.get(path) as T);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(path)
      .then((r) => {
        if (!r.ok) throw new Error(`İçerik yüklenemedi (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (!active) return;
        cache.set(path, d);
        setData(d as T);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(String(e?.message || e));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path]);

  return { data, loading, error };
}

export function useMarketplace() {
  const { data, loading, error } = useContent<{
    categories: any[];
    vendors: any[];
    products: any[];
  }>('/api/content/marketplace');
  return {
    categories: data?.categories ?? [],
    vendors: data?.vendors ?? [],
    products: data?.products ?? [],
    loading,
    error,
  };
}
