"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Filter, Search, Trash2, Users } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const ROLE_LABELS: Record<string, { label: string; style: string }> = {
  free: { label: 'Ücretsiz Üyelik', style: 'border-white/10 text-mystic-text-muted bg-white/5' },
  apprentice: { label: 'Çıraklık (Seviye 1)', style: 'border-amber-700/50 text-amber-500 bg-amber-500/10' },
  journeyman: { label: 'Kalfalık (Seviye 2)', style: 'border-blue-500/50 text-blue-400 bg-blue-400/10' },
  master: { label: 'Ustalık (Seviye 3)', style: 'border-mystic-primary/50 text-mystic-primary bg-mystic-primary/10' },
  admin: { label: 'Yönetici', style: 'border-red-500/50 text-red-400 bg-red-400/10' },
};

const ROLE_OPTIONS = [
  { value: 'free', label: 'Ücretsiz Üye' },
  { value: 'apprentice', label: 'Çırak (Seviye 1)' },
  { value: 'journeyman', label: 'Kalfa (Seviye 2)' },
  { value: 'master', label: 'Usta (Seviye 3)' },
  { value: 'admin', label: 'Yönetici (Admin)' },
];

interface Profile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
  email_verified?: boolean | null;
}

export default function AdminMembersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Not: setLoading burada çağrılmaz — effect gövdesinde senkron setState
  // cascading render'a yol açar. Yenile düğmesi spinner'ı kendisi açar.
  const fetchProfiles = useCallback(() => {
    return apiFetch<Profile[]>('/api/admin/profiles')
      .then((data) => {
        setProfiles(data || []);
        setError(null);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Üyeler yüklenirken hata oluştu.'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const profile = profiles.find((p) => p.id === userId);
    const userName = profile?.full_name || 'İsimsiz Üye';
    const roleLabel = ROLE_OPTIONS.find((r) => r.value === newRole)?.label ?? newRole;

    if (
      !window.confirm(
        `"${userName}" isimli üyenin yetki seviyesini "${roleLabel}" olarak değiştirmek istediğinize emin misiniz?`,
      )
    ) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      await apiFetch(`/api/admin/profiles/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p)));
    } catch (err: unknown) {
      alert('Rol güncellenirken bir hata oluştu: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !window.confirm(
        `"${userName}" isimli kullanıcıyı ve tüm platform verilerini kalıcı olarak silmek istediğinize emin misiniz?`,
      )
    ) {
      return;
    }

    setDeletingUserId(userId);
    try {
      await apiFetch(`/api/admin/profiles/${userId}`, { method: 'DELETE' });
      setProfiles((prev) => prev.filter((p) => p.id !== userId));
    } catch (err: unknown) {
      alert('Kullanıcı silinirken hata oluştu: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setDeletingUserId(null);
    }
  };

  const filtered = profiles.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (p.full_name?.toLowerCase() || '').includes(q) ||
      (p.email?.toLowerCase() || '').includes(q) ||
      p.id.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <>
      <AdminPageHeader
        title="Üye Yönetimi"
        description={`Kayıtlı üyeler, seviye mühürleri ve rol yetkilendirme — ${filtered.length} kayıt`}
        icon={Users}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          fetchProfiles();
        }}
      />

      {/* Filtreler */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-mystic-text-muted">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="İsim, e-posta veya ID ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/5 bg-black/40 py-2 pl-10 pr-4 text-sm text-white placeholder-mystic-text-muted transition-colors focus:border-mystic-primary/50 focus:outline-none"
          />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-mystic-text-muted">
            <Filter size={16} />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/5 bg-black/40 py-2 pl-10 pr-4 text-sm text-white transition-colors focus:border-mystic-primary/50 focus:outline-none"
          >
            <option value="all" className="bg-mystic-dark">Tüm Seviyeler</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value} className="bg-mystic-dark">
                {ROLE_LABELS[r.value]?.label ?? r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-mystic-text-muted">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-mystic-primary/10" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-r-mystic-accent border-t-mystic-primary" />
            </div>
            <p className="text-xs">Canlı üye verileri yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-mystic-text-muted">
            Kriterlere uygun üye bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider text-mystic-text-muted">
                <tr>
                  <th className="p-4 font-semibold">Üye Bilgileri</th>
                  <th className="p-4 font-semibold">Kayıt Tarihi</th>
                  <th className="p-4 font-semibold">Seviye (Mühür)</th>
                  <th className="p-4 text-right font-semibold">Rol Yetkilendirme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-white">
                {filtered.map((p) => {
                  const roleMeta = ROLE_LABELS[p.role || 'free'] || ROLE_LABELS.free;
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-white/5">
                      <td className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-tr from-mystic-primary/20 to-mystic-accent/20 text-sm font-bold uppercase text-mystic-primary">
                          {p.full_name ? p.full_name.slice(0, 2) : 'ÜY'}
                        </div>
                        <div>
                          <span className="block font-bold">{p.full_name || 'İsimsiz Üye'}</span>
                          <span className="mt-0.5 block text-xs text-white/70">{p.email}</span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-[10px] text-mystic-text-muted">
                              ID: {p.id.slice(0, 8)}...
                            </span>
                            {p.email_verified ? (
                              <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                                ✓ Onaylı
                              </span>
                            ) : (
                              <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                                ⏳ Onay Bekliyor
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs text-mystic-text-muted">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Bilinmiyor'}
                      </td>

                      <td className="p-4">
                        <span
                          className={`block w-max rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${roleMeta.style}`}
                        >
                          {roleMeta.label}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {updatingUserId === p.id && (
                            <div className="h-4 w-4 animate-spin rounded-full border border-mystic-primary/20 border-t-mystic-primary" />
                          )}
                          <select
                            value={p.role || 'free'}
                            disabled={updatingUserId === p.id || deletingUserId === p.id}
                            onChange={(e) => handleUpdateRole(p.id, e.target.value)}
                            className="rounded-xl border border-white/10 bg-black/60 px-2 py-1 text-xs text-white transition-colors focus:border-mystic-primary/50 focus:outline-none"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeleteUser(p.id, p.full_name || p.email || p.id)}
                            disabled={deletingUserId === p.id}
                            className="cursor-pointer rounded-lg border border-red-500/20 bg-white/5 p-1.5 text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                            title="Üyeyi Kalıcı Olarak Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
