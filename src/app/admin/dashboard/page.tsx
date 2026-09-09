"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, BookOpen, LayoutDashboard, Users } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { ADMIN_NAV } from '@/components/admin/AdminSidebar';

interface Summary {
  members: number | null;
  blogs: number | null;
  todayVisitors: number | null;
  activeUsers: number | null;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: number | null;
  hint: string;
  icon: React.ElementType;
  tone: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-6 transition-colors hover:border-white/15"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-mystic-text-muted">{label}</h3>
        <div className={`rounded-lg p-2 ${tone}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">
        {value === null ? (
          <span className="inline-block h-6 w-8 animate-pulse rounded bg-white/10" />
        ) : (
          value
        )}
      </p>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-mystic-text-muted">
        {hint}
        <ArrowRight
          size={11}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      </p>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary>({
    members: null,
    blogs: null,
    todayVisitors: null,
    activeUsers: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    // Her uç bağımsız — biri düşerse diğer göstergeler yine dolar.
    const members = apiFetch<unknown[]>('/api/admin/profiles')
      .then((d) => d?.length ?? 0)
      .catch(() => null);
    const blogs = apiFetch<unknown[]>('/api/admin/blog')
      .then((d) => d?.length ?? 0)
      .catch(() => null);
    const analytics = apiFetch<{ today?: { visitors?: number }; activeUsers?: number }>(
      '/api/admin/analytics?excludeAdmin=true&limit=25',
    ).catch(() => null);

    return Promise.all([members, blogs, analytics])
      .then(([m, b, a]) =>
        setSummary({
          members: m,
          blogs: b,
          todayVisitors: a?.today?.visitors ?? (a ? 0 : null),
          activeUsers: a?.activeUsers ?? (a ? 0 : null),
        }),
      )
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Genel Bakış'ın kendisi hariç, panelin diğer bölümleri.
  const sections = ADMIN_NAV.filter((item) => item.href !== '/admin/dashboard');

  return (
    <>
      <AdminPageHeader
        title="Genel Bakış"
        description="Platformun anlık durumu ve yönetim bölümleri"
        icon={LayoutDashboard}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          load();
        }}
      />

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Üye"
          value={summary.members}
          hint="Platforma kayıtlı ruhlar"
          icon={Users}
          tone="bg-purple-500/15 text-purple-400"
          href="/admin/members"
        />
        <StatCard
          label="Bugün Tekil Ziyaret"
          value={summary.todayVisitors}
          hint="Bugünkü tekil ruh ziyareti"
          icon={Activity}
          tone="bg-emerald-500/15 text-emerald-400"
          href="/admin/analytics"
        />
        <StatCard
          label="Şu An Aktif"
          value={summary.activeUsers}
          hint="Son 5 dakikadaki tekil ruhlar"
          icon={Activity}
          tone="bg-orange-500/15 text-orange-400"
          href="/admin/analytics"
        />
        <StatCard
          label="Blog Kütüphanesi"
          value={summary.blogs}
          hint="Rehber ve yazılar"
          icon={BookOpen}
          tone="bg-mystic-primary/20 text-mystic-primary"
          href="/admin/blog"
        />
      </div>

      {/* Bölüm kısayolları */}
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-mystic-text-muted">
        Yönetim Bölümleri
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-black/40 p-5 transition-colors hover:border-mystic-primary/30 hover:bg-white/5"
          >
            <div className="rounded-xl bg-white/5 p-2.5 text-mystic-primary transition-colors group-hover:bg-mystic-primary/10">
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">{label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-mystic-text-muted">{description}</p>
            </div>
            <ArrowRight
              size={16}
              className="ml-auto mt-1 shrink-0 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-mystic-primary"
            />
          </Link>
        ))}
      </div>
    </>
  );
}
