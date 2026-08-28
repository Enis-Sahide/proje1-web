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

    // Bugünün verileri (Hızlı göstergeler için, Türkiye saat diliminde)
    const todayStats = await db.execute(sql`
      SELECT 
        COUNT(*)::int as views,
        COUNT(DISTINCT ip_hash)::int as visitors
      FROM site_visits
      WHERE TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') = TO_CHAR(NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD')
    `);

    // En çok ziyaretçi gelen şehirler (Son 14 gün)
    const topCities = await db.execute(sql`
      SELECT 
        city,
        country,
        COUNT(DISTINCT ip_hash)::int as visitors,
        COUNT(*)::int as views
      FROM site_visits
      WHERE city IS NOT NULL AND created_at > NOW() - INTERVAL '14 days'
      GROUP BY city, country
      ORDER BY visitors DESC
      LIMIT 10
    `);

    // Son aktif kayıtlı kullanıcı hareketleri
    const recentMemberVisits = await db.execute(sql`
      SELECT 
        sv.created_at as created_at,
        sv.path as path,
        u.full_name as full_name,
        u.email as email
      FROM site_visits sv
      JOIN users u ON sv.user_id = u.id
      ORDER BY sv.created_at DESC
      LIMIT 15
    `);

    // Şu an aktif kullanıcı sayısı (Son 5 dakikada işlem yapan tekil IP'ler)
    const activeUsersStats = await db.execute(sql`
      SELECT COUNT(DISTINCT ip_hash)::int as active_users
      FROM site_visits
      WHERE created_at > NOW() - INTERVAL '5 minutes'
    `);

    return json({
      daily: dailyStats.rows || [],
      total: totalStats.rows[0] || { total_page_views: 0, total_unique_visitors: 0 },
      topPages: topPages.rows || [],
      today: todayStats.rows[0] || { views: 0, visitors: 0 },
      topCities: topCities.rows || [],
      recentMemberVisits: recentMemberVisits.rows || [],
      activeUsers: activeUsersStats.rows[0]?.active_users ?? 0
    });
  } catch (error: any) {
    console.error('Admin analytics fetch error:', error);
    return errorJson(error.message || 'Server error', 500);
  }
}

export const OPTIONS = preflight;
