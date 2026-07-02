import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { resources } from '@/db/schema';
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

    const rows = await db.select().from(resources).orderBy(asc(resources.sort));
    return json(rows.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      fileUrl: r.fileUrl,
      level: r.level,
      description: r.description,
      sort: r.sort,
    })));
  } catch (error: any) {
    console.error('Resources GET API Error:', error);
    return errorJson('Kaynaklar yüklenirken hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
