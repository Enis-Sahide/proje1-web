"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Calendar, MapPin, RefreshCw, TrendingUp, UserCheck } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const ROLE_LABELS: Record<string, { label: string; style: string }> = {
  free: { label: 'Ücretsiz Üyelik', style: 'border-white/10 text-mystic-text-muted bg-white/5' },
  apprentice: { label: 'Çırak', style: 'border-amber-700/50 text-amber-500 bg-amber-500/10' },
  journeyman: { label: 'Kalfa', style: 'border-blue-500/50 text-blue-400 bg-blue-400/10' },
  master: { label: 'Usta', style: 'border-mystic-primary/50 text-mystic-primary bg-mystic-primary/10' },
  admin: { label: 'Yönetici', style: 'border-red-500/50 text-red-400 bg-red-400/10' },
};

/** Sunucudan gelen tarih biçimleri tutarsız olabildiği için savunmacı ayrıştırma. */
function formatDateSafe(raw: unknown): { dateStr: string; timeStr: string } {
  if (!raw) return { dateStr: '-', timeStr: '-' };
  try {
    let str = String(raw).trim();
    if (/[+-]\d{2}$/.test(str)) str += ':00';
    str = str.replace(' ', 'T');
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) {
      return {
        dateStr: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        timeStr: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
    }
    const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    if (m) return { dateStr: `${m[3]}.${m[2]}`, timeStr: `${m[4]}:${m[5]}` };
  } catch {
    /* aşağıdaki geri dönüşe düş */
  }
  return { dateStr: String(raw).slice(0, 10) || '-', timeStr: '' };
}

interface DailyRow { date: string; unique_visitors: number; page_views: number }
interface PageRow { path: string; views: number }
interface CityRow { city?: string; country?: string; visitors: number }
interface VisitRow {
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  path: string;
  created_at?: string;
  createdAt?: string;
}
interface Analytics {
  today?: { visitors?: number };
  activeUsers?: number;
  daily?: DailyRow[];
  topPages?: PageRow[];
  topCities?: CityRow[];
  recentMemberVisits?: VisitRow[];
}

function Panel({
  title,
  icon: Icon,
  children,
  className = '',
  header,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl border border-mystic-surface-light bg-mystic-surface/50 p-6 shadow-xl backdrop-blur-md ${className}`}
    >
      <div className="mb-6 flex flex-col gap-3 border-b border-white/5 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-white">
          <Icon size={18} className="text-mystic-primary" />
          {title}
        </h3>
        {header}
      </div>
      {children}
    </div>
  );
}

function Loading() {
  return (
    <div className="my-auto flex flex-col items-center justify-center gap-3 py-20">
      <RefreshCw className="animate-spin text-mystic-primary" size={32} />
      <p className="text-xs text-mystic-text-muted">Veriler yükleniyor...</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excludeAdmin, setExcludeAdmin] = useState(true);
  const [visitLimit, setVisitLimit] = useState(50);

  const fetchAnalytics = useCallback((exclude: boolean, limit: number) => {
    return apiFetch<Analytics>(`/api/admin/analytics?excludeAdmin=${exclude}&limit=${limit}`)
      .then((data) => {
        setAnalytics(data);
        setError(null);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Analiz verileri yüklenirken hata oluştu.'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAnalytics(excludeAdmin, visitLimit);
  }, [fetchAnalytics, excludeAdmin, visitLimit]);

  return (
    <>
      <AdminPageHeader
        title="Ziyaretçi Analitiği"
        description="Son 14 günün trafik, konum ve sayfa popülaritesi verileri"
        icon={Activity}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          fetchAnalytics(excludeAdmin, visitLimit);
        }}
      />

      {/* Özet kartlar */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-black/40 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-mystic-text-muted">Bugün Tekil Ziyaret</h3>
            <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
              <Activity size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{analytics?.today?.visitors ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/40 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-mystic-text-muted">Şu An Aktif</h3>
            <div className="animate-pulse rounded-lg bg-orange-500/15 p-2 text-orange-400">
              <Activity size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{analytics?.activeUsers ?? 0}</p>
          <p className="mt-2 text-[11px] text-mystic-text-muted">Son 5 dakikadaki tekil ruhlar</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Günlük trafik */}
          <Panel title="Günlük Trafik Akışı (Son 14 Gün)" icon={Calendar} className="lg:col-span-2">
            {loading && !analytics ? (
              <Loading />
            ) : error ? (
              <div className="py-12 text-center text-sm text-red-400">{error}</div>
            ) : !analytics?.daily?.length ? (
              <div className="py-20 text-center text-sm text-mystic-text-muted">
                Henüz trafik verisi bulunmuyor.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold uppercase text-mystic-text-muted">
                      <th className="px-4 py-3">Tarih</th>
                      <th className="px-4 py-3">Tekil Ziyaretçi</th>
                      <th className="px-4 py-3">Sayfa Görüntüleme</th>
                      <th className="px-4 py-3">Yoğunluk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white">
                    {analytics.daily.map((day) => {
                      const maxViews = Math.max(
                        ...analytics.daily!.map((d) => d.page_views || 1),
                        1,
                      );
                      const percent = Math.min(
                        100,
                        Math.round(((day.page_views || 0) / maxViews) * 100),
                      );
                      return (
                        <tr key={day.date} className="transition-colors hover:bg-white/5">
                          <td className="px-4 py-3.5 font-medium">{day.date}</td>
                          <td className="px-4 py-3.5">{day.unique_visitors}</td>
                          <td className="px-4 py-3.5 font-semibold text-mystic-accent">
                            {day.page_views}
                          </td>
                          <td className="w-48 px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-mystic-primary to-mystic-accent"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="w-8 text-right text-[10px] text-mystic-text-muted">
                                {percent}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* Popüler sayfalar */}
          <Panel title="En Çok Ziyaret Edilen Sayfalar" icon={TrendingUp}>
            {loading && !analytics ? (
              <Loading />
            ) : error ? (
              <div className="my-auto py-12 text-center text-sm text-red-400">{error}</div>
            ) : !analytics?.topPages?.length ? (
              <div className="my-auto py-20 text-center text-sm text-mystic-text-muted">
                Henüz popüler sayfa verisi bulunmuyor.
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topPages.map((page) => {
                  const maxViews = Math.max(...analytics.topPages!.map((p) => p.views || 1), 1);
                  const percent = Math.min(100, Math.round(((page.views || 0) / maxViews) * 100));
                  return (
                    <div
                      key={page.path}
                      className="space-y-1.5 rounded-2xl border border-white/5 bg-white/5 p-3 transition-all hover:border-white/10"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className="max-w-[180px] truncate font-semibold text-white"
                          title={page.path}
                        >
                          {page.path}
                        </span>
                        <span className="font-bold text-mystic-accent">{page.views} tık</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/30">
                        <div
                          className="h-full rounded-full bg-mystic-accent"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Şehirler */}
          <Panel title="Ziyaret Edilen Şehirler" icon={MapPin}>
            {loading && !analytics ? (
              <Loading />
            ) : error ? (
              <div className="my-auto py-12 text-center text-sm text-red-400">{error}</div>
            ) : !analytics?.topCities?.length ? (
              <div className="my-auto py-20 text-center text-sm text-mystic-text-muted">
                Henüz şehir bazlı veri bulunmuyor.
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topCities.map((city, idx) => {
                  const maxVisitors = Math.max(
                    ...analytics.topCities!.map((c) => c.visitors || 1),
                    1,
                  );
                  const percent = Math.min(
                    100,
                    Math.round(((city.visitors || 0) / maxVisitors) * 100),
                  );
                  return (
                    <div
                      key={idx}
                      className="space-y-1.5 rounded-2xl border border-white/5 bg-white/5 p-3 transition-all hover:border-white/10"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="max-w-[180px] truncate font-semibold text-white">
                          📍 {city.city || 'Bilinmeyen Şehir'}, {city.country || 'AB'}
                        </span>
                        <span className="font-bold text-mystic-accent">
                          {city.visitors} tekil
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/30">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Üye aktiviteleri */}
          <Panel
            title="Kayıtlı Üyelerin Son Aktiviteleri"
            icon={UserCheck}
            className="lg:col-span-2"
            header={
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setExcludeAdmin(true)}
                    className={`cursor-pointer rounded-lg px-3 py-1 font-semibold transition-all ${
                      excludeAdmin
                        ? 'bg-mystic-primary font-bold text-black'
                        : 'text-mystic-text-muted hover:text-white'
                    }`}
                  >
                    👥 Sadece Üyeler
                  </button>
                  <button
                    type="button"
                    onClick={() => setExcludeAdmin(false)}
                    className={`cursor-pointer rounded-lg px-3 py-1 font-semibold transition-all ${
                      !excludeAdmin
                        ? 'bg-mystic-primary font-bold text-black'
                        : 'text-mystic-text-muted hover:text-white'
                    }`}
                  >
                    🛡️ Yöneticiler Dahil
                  </button>
                </div>

                <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1 text-xs">
                  {[25, 50, 100].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setVisitLimit(l)}
                      className={`cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-all ${
                        visitLimit === l
                          ? 'bg-white/20 font-bold text-white'
                          : 'text-mystic-text-muted hover:text-white'
                      }`}
                    >
                      {l} kayıt
                    </button>
                  ))}
                </div>
              </div>
            }
          >
            {loading && !analytics ? (
              <Loading />
            ) : error ? (
              <div className="my-auto py-12 text-center text-sm text-red-400">{error}</div>
            ) : !analytics?.recentMemberVisits?.length ? (
              <div className="my-auto py-20 text-center text-sm text-mystic-text-muted">
                {excludeAdmin
                  ? 'Yönetici harici kayıtlı üye aktivitesi henüz bulunmuyor.'
                  : 'Kayıtlı üye aktivitesi henüz bulunmuyor.'}
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto overflow-x-auto pr-1">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-mystic-surface/90 backdrop-blur-md">
                    <tr className="border-b border-white/10 text-xs font-semibold uppercase text-mystic-text-muted">
                      <th className="px-3 py-2.5">Kullanıcı</th>
                      <th className="px-3 py-2.5">Sayfa</th>
                      <th className="px-3 py-2.5">Zaman</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white">
                    {analytics.recentMemberVisits.map((visit, idx) => {
                      const { dateStr, timeStr } = formatDateSafe(visit.created_at ?? visit.createdAt);
                      const roleMeta = ROLE_LABELS[visit.role || 'free'] || ROLE_LABELS.free;
                      return (
                        <tr key={idx} className="transition-colors hover:bg-white/5">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{visit.full_name || 'İsimsiz Üye'}</span>
                              {visit.role && visit.role !== 'free' && (
                                <span
                                  className={`rounded border px-1.5 py-0.5 text-[9px] ${roleMeta.style}`}
                                >
                                  {roleMeta.label}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-mystic-text-muted">{visit.email}</div>
                          </td>
                          <td
                            className="max-w-[200px] truncate px-3 py-3 font-mono text-xs text-mystic-accent"
                            title={visit.path}
                          >
                            {visit.path}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-xs text-mystic-text-muted">
                            {dateStr}, {timeStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
