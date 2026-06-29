'use client';

import { useEffect, useState } from 'react';

// İçerik nadiren değişir → basit modül-içi cache (stale-while-revalidate değil,
// sayfa ömrü boyunca tek fetch). Dinamik güncelleme için sayfa yenilenmesi yeterli.
const cache = new Map<string, unknown>();

export function useContent<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(path ? (cache.get(path) as T) ?? null : null);
  const [loading, setLoading] = useState(path ? !cache.has(path) : false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
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
