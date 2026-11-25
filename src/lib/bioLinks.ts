import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';

export interface BioLinkItem {
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  iconKey: string;
  badgeText: string | null;
  isHighlighted: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

const DEFAULT_BIO_LINKS: Omit<BioLinkItem, 'createdAt'>[] = [
  {
    id: 'google-play-app',
    title: "Google Play'den İndir",
    subtitle: '7Layers Resmi Android Mobil Uygulaması',
    url: 'https://play.google.com/store/apps/details?id=com.enissahide.esk7layers',
    iconKey: 'playstore',
    badgeText: 'ANDROID MOBİL UYGULAMA',
    isHighlighted: true,
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'ios-app-mode',
    title: "🍎 iPhone'a Uygulama Modunda Ekle",
    subtitle: 'iPhone & iPad Ana Ekranına Tam Ekran Ekle (3 Adım)',
    url: '#ios-pwa',
    iconKey: 'apple',
    badgeText: 'IPHONE & IPAD (IOS SAFARI)',
    isHighlighted: false,
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'web-home',
    title: '7Layers Web Platformuna Giriş',
    subtitle: 'www.7layers.tr • Tüm Katmanlar & Günün Enerjisi',
    url: '/',
    iconKey: 'globe',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 30,
  },
  {
    id: 'analysis-hub',
    title: 'Ruhsal Analiz Merkezi',
    subtitle: 'Doğum Haritası, Kabalistik 4 Alem, Human Design & Numeroloji',
    url: '/analysis',
    iconKey: 'compass',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 40,
  },
  {
    id: 'kadim-meclis',
    title: '7Layers Kadim Meclis (8 Oda)',
    subtitle: 'Astroloji, Kabala, Sembolizm & Çakra Sohbet Odaları',
    url: '/meclis',
    iconKey: 'chat',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 50,
  },
  {
    id: 'schumann-live',
    title: 'Canlı Schumann Rezonansı (7.83 Hz)',
    subtitle: 'Anlık Dünya Elektromanyetik Spektrogramı & Analizi',
    url: '/analysis/schumann',
    iconKey: 'radio',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 60,
  },
  {
    id: 'kadim-dersler',
    title: 'Kadim Dersler & Seviye Sınavları',
    subtitle: 'Çırak, Kalfa ve Usta Derecesi Ezoterik Eğitimleri',
    url: '/kadim-dersler',
    iconKey: 'book',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 70,
  },
  {
    id: 'contact-support',
    title: 'İletişim & Destek Masası',
    subtitle: 'Özel Analiz Talebi, Soru & İş Birliği (info@7layers.tr)',
    url: '/iletisim',
    iconKey: 'mail',
    badgeText: null,
    isHighlighted: false,
    isActive: true,
    sortOrder: 80,
  },
];

let isBioTableInitialized = false;

export async function ensureBioLinksTable(): Promise<void> {
  if (isBioTableInitialized) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS bio_links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      url TEXT NOT NULL,
      icon_key TEXT NOT NULL DEFAULT 'globe',
      badge_text TEXT,
      is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 100,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const countRes = await db.execute<{ cnt: number }>(sql`
    SELECT count(*)::int AS cnt FROM bio_links
  `);
  const count = Number(countRes.rows?.[0]?.cnt || 0);

  if (count === 0) {
    for (const item of DEFAULT_BIO_LINKS) {
      await db.execute(sql`
        INSERT INTO bio_links (
          id, title, subtitle, url, icon_key, badge_text, is_highlighted, is_active, sort_order
        ) VALUES (
          ${item.id},
          ${item.title},
          ${item.subtitle},
          ${item.url},
          ${item.iconKey},
          ${item.badgeText},
          ${item.isHighlighted},
          ${item.isActive},
          ${item.sortOrder}
        )
        ON CONFLICT (id) DO NOTHING
      `);
    }
  }

  isBioTableInitialized = true;
}

export async function listBioLinks(onlyActive = false): Promise<BioLinkItem[]> {
  await ensureBioLinksTable();

  const res = onlyActive
    ? await db.execute<{
        id: string;
        title: string;
        subtitle: string | null;
        url: string;
        icon_key: string;
        badge_text: string | null;
        is_highlighted: boolean;
        is_active: boolean;
        sort_order: number;
      }>(sql`
        SELECT id, title, subtitle, url, icon_key, badge_text, is_highlighted, is_active, sort_order
        FROM bio_links
        WHERE is_active = TRUE
        ORDER BY sort_order ASC, created_at ASC
      `)
    : await db.execute<{
        id: string;
        title: string;
        subtitle: string | null;
        url: string;
        icon_key: string;
        badge_text: string | null;
        is_highlighted: boolean;
        is_active: boolean;
        sort_order: number;
      }>(sql`
        SELECT id, title, subtitle, url, icon_key, badge_text, is_highlighted, is_active, sort_order
        FROM bio_links
        ORDER BY sort_order ASC, created_at ASC
      `);

  return (res.rows || []).map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    url: r.url,
    iconKey: r.icon_key || 'globe',
    badgeText: r.badge_text,
    isHighlighted: Boolean(r.is_highlighted),
    isActive: Boolean(r.is_active),
    sortOrder: Number(r.sort_order) || 100,
  }));
}
