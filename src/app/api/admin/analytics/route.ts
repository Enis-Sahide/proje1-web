import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) return errorJson('Yetkisiz', 401);
    
    const me = await getAccount(payload.sub);
    if (me?.role !== 'admin') return errorJson('Yetkisiz', 403);

    // Son 14 günün günlük sayfa gösterimi ve tekil ziyaretçi sayısı
    const dailyStats = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') as date,
        COUNT(*)::int as page_views,
        COUNT(DISTINCT ip_hash)::int as unique_visitors
      FROM site_visits
      WHERE created_at > NOW() - INTERVAL '14 days'
      GROUP BY date
      ORDER BY date DESC
    `);

    // Toplam sayfa gösterimi ve tekil ziyaretçi sayısı (Tüm zamanlar)
    const totalStats = await db.execute(sql`
      SELECT 
        COUNT(*)::int as total_page_views,
        COUNT(DISTINCT ip_hash)::int as total_unique_visitors
      FROM site_visits
    `);

    // En çok ziyaret edilen sayfalar (Rotalar)
    const topPages = await db.execute(sql`
      SELECT 
        path,
        COUNT(*)::int as views
      FROM site_visits
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `);

    // Bugünün verileri (Hızlı göstergeler için)
    const todayStats = await db.execute(sql`
      SELECT 
        COUNT(*)::int as views,
        COUNT(DISTINCT ip_hash)::int as visitors
      FROM site_visits
      WHERE created_at >= CURRENT_DATE
    `);

    return json({
      daily: dailyStats.rows || [],
      total: totalStats.rows[0] || { total_page_views: 0, total_unique_visitors: 0 },
      topPages: topPages.rows || [],
      today: todayStats.rows[0] || { views: 0, visitors: 0 }
    });
  } catch (error: any) {
    console.error('Admin analytics fetch error:', error);
    return errorJson(error.message || 'Server error', 500);
  }
}

export const OPTIONS = preflight;
