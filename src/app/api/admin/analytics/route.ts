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

    // Son 14 günün günlük sayfa gösterimi ve tekil ziyaretçi sayısı (Admin rotaları hariç, visitor_id/ip_hash birleşik tekil)
    const dailyStats = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') as date,
        COUNT(*)::int as page_views,
        COUNT(DISTINCT COALESCE(visitor_id, ip_hash))::int as unique_visitors
      FROM site_visits
      WHERE created_at > NOW() - INTERVAL '14 days'
        AND path NOT LIKE '/admin%'
      GROUP BY date
      ORDER BY date DESC
    `);

    // Toplam sayfa gösterimi ve tekil ziyaretçi sayısı (Tüm zamanlar, Admin rotaları hariç)
    const totalStats = await db.execute(sql`
      SELECT 
        COUNT(*)::int as total_page_views,
        COUNT(DISTINCT COALESCE(visitor_id, ip_hash))::int as total_unique_visitors
      FROM site_visits
      WHERE path NOT LIKE '/admin%'
    `);

    // En çok ziyaret edilen sayfalar (Admin rotaları hariç)
    const topPages = await db.execute(sql`
      SELECT 
        path,
        COUNT(*)::int as views
      FROM site_visits
      WHERE path NOT LIKE '/admin%'
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `);

    // Bugünün verileri (Admin rotaları hariç, Türkiye saat diliminde)
    const todayStats = await db.execute(sql`
      SELECT 
        COUNT(*)::int as views,
        COUNT(DISTINCT COALESCE(visitor_id, ip_hash))::int as visitors
      FROM site_visits
      WHERE TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') = TO_CHAR(NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD')
        AND path NOT LIKE '/admin%'
    `);

    // En çok ziyaretçi gelen şehirler (Son 14 gün, Admin rotaları hariç)
    const topCities = await db.execute(sql`
      SELECT 
        city,
        country,
        COUNT(DISTINCT COALESCE(visitor_id, ip_hash))::int as visitors,
        COUNT(*)::int as views
      FROM site_visits
      WHERE city IS NOT NULL 
        AND created_at > NOW() - INTERVAL '14 days'
        AND path NOT LIKE '/admin%'
      GROUP BY city, country
      ORDER BY visitors DESC
      LIMIT 10
    `);

    const { searchParams } = new URL(request.url);
    const excludeAdmin = searchParams.get('excludeAdmin') !== 'false'; // default: true
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(isNaN(limitParam) ? 50 : limitParam, 5), 100);

    // Son aktif kayıtlı kullanıcı hareketleri
    const memberFilterSql = excludeAdmin
      ? sql`WHERE (p.role IS NULL OR p.role != 'admin') AND sv.path NOT LIKE '/admin%'`
      : sql``;

    const recentMemberVisits = await db.execute(sql`
      SELECT 
        TO_CHAR(sv.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
        sv.path as path,
        u.full_name as full_name,
        u.email as email,
        COALESCE(p.role, 'free') as role
      FROM site_visits sv
      JOIN users u ON sv.user_id = u.id
      LEFT JOIN profiles p ON p.user_id = u.id
      ${memberFilterSql}
      ORDER BY sv.created_at DESC
      LIMIT ${limit}
    `);

    // Şu an aktif kullanıcı sayısı (Son 5 dakikada işlem yapan gerçek tekil ziyaretçiler)
    const activeUsersStats = await db.execute(sql`
      SELECT COUNT(DISTINCT COALESCE(visitor_id, ip_hash))::int as active_users
      FROM site_visits
      WHERE created_at > NOW() - INTERVAL '5 minutes'
        AND path NOT LIKE '/admin%'
    `);

    return json({
      daily: dailyStats.rows,
      total: totalStats.rows[0] || { total_page_views: 0, total_unique_visitors: 0 },
      topPages: topPages.rows,
      today: todayStats.rows[0] || { views: 0, visitors: 0 },
      topCities: topCities.rows,
      recentMemberVisits: recentMemberVisits.rows,
      activeUsers: (activeUsersStats.rows[0] as any)?.active_users || 0,
    });
  } catch (error: any) {
    console.error('Admin Analytics Error:', error);
    return errorJson('Analiz verileri yüklenirken hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
