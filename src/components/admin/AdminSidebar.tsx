"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BookOpen,
  ChevronLeft,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

/** Yönetim panelinin tek menü kaynağı — yeni admin sayfası buraya eklenir. */
export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Genel Bakış',
    icon: LayoutDashboard,
    description: 'Platform özeti ve anlık göstergeler',
  },
  {
    href: '/admin/messages',
    label: 'Destek & Mesajlar',
    icon: MessageSquare,
    description: 'İletişim talepleri ve e-posta yanıtlama',
  },
  {
    href: '/admin/members',
    label: 'Üye Yönetimi',
    icon: Users,
    description: 'Kayıtlı üyeler, roller ve yetkilendirme',
  },
  {
    href: '/admin/blog',
    label: 'Blog Yönetimi',
    icon: BookOpen,
    description: 'Yazı ekleme, düzenleme ve yayınlama',
  },
  {
    href: '/admin/analytics',
    label: 'Ziyaretçi Analitiği',
    icon: Activity,
    description: 'Trafik, popüler sayfalar ve üye hareketleri',
  },
  {
    href: '/admin/payment',
    label: 'Ödeme & Faturalama',
    icon: CreditCard,
    description: 'Sanal POS, fatura ayarları ve işlemler',
  },
];

/** Aktif menü öğesini yol önekine göre bulur. */
export function activeNavItem(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
              active
                ? 'bg-mystic-primary/15 text-mystic-primary font-semibold border border-mystic-primary/30'
                : 'text-mystic-text-muted hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon size={17} className={active ? 'text-mystic-primary' : 'text-white/40 group-hover:text-white/70'} />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      {/* Marka */}
      <div className="px-5 py-6 border-b border-white/5">
        <Link href="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-3">
          <Image src="/logo.png" alt="7Layers" width={36} height={36} className="rounded-lg" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">7Layers</p>
            <p className="text-[11px] text-mystic-primary flex items-center gap-1 leading-tight">
              <Shield size={11} /> Yönetim Paneli
            </p>
          </div>
        </Link>
      </div>

      {/* Menü */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks onNavigate={onNavigate} />
      </div>

      {/* Alt bölüm */}
      <div className="border-t border-white/5 px-3 py-4 space-y-1">
        {user?.email && (
          <p className="px-3.5 pb-2 text-[11px] text-white/30 truncate" title={user.email}>
            {user.email}
          </p>
        )}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-mystic-text-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={17} className="text-white/40" />
          Siteye Dön
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={17} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  // Çekmece, menüdeki her bağlantının onNavigate'i ile kapanır — ayrı bir
  // rota izleyen effect'e gerek yok.
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Masaüstü: sabit kenar çubuğu */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-black/60 backdrop-blur-xl border-r border-white/10 z-40">
        <SidebarBody />
      </aside>

      {/* Mobil: üst çubuk */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <button
          onClick={() => setOpen(true)}
          aria-label="Menüyü aç"
          className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
        >
          <Menu size={18} />
        </button>
        <span className="text-sm font-bold text-white flex items-center gap-1.5">
          <Shield size={14} className="text-mystic-primary" /> Yönetim Paneli
        </span>
      </div>

      {/* Mobil: çekmece */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative w-72 max-w-[85vw] bg-[#0a0a12] border-r border-white/10 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setOpen(false)}
              aria-label="Menüyü kapat"
              className="absolute top-5 right-4 p-1.5 rounded-lg bg-white/5 text-white hover:bg-white/10 z-10"
            >
              <X size={16} />
            </button>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
