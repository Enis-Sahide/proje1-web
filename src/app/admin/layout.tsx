import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'Yönetim Paneli',
  // Panel arama motorlarına kapalı.
  robots: { index: false, follow: false },
};

/**
 * Yönetim panelinin kendi kabuğu: sabit kenar çubuğu + içerik alanı.
 * Genel site navigasyonu ve footer'ı bu rotada gizlenir, böylece panel
 * bağımsız bir uygulama gibi davranır.
 *
 * Erişim koruması iki katmanlı: `src/proxy.ts` (sunucu tarafı ilk kapı) ve
 * her `/api/admin/*` route'undaki `requireAdmin()` (asıl yetki denetimi).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mystic-dark">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
