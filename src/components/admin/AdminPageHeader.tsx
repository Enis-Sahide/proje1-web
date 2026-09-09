"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Yönetim panelindeki sayfaların ortak başlığı.
 * `onRefresh` verilirse sağda bir yenileme düğmesi çıkar.
 */
export default function AdminPageHeader({
  title,
  description,
  icon: Icon,
  onRefresh,
  refreshing,
  actions,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 rounded-xl bg-mystic-primary/10 p-2.5 text-mystic-primary">
            <Icon size={20} />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 text-xs text-mystic-text-muted lg:text-sm">{description}</p>
          )}
        </div>
      </div>

      {(actions || onRefresh) && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Yenile
            </button>
          )}
        </div>
      )}
    </header>
  );
}
