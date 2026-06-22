import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessons } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// ?discipline=astrology|human_design|kabbalah|rune
// Dersler bölümü → giriş zorunlu.
export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const discipline = new URL(request.url).searchParams.get('discipline');
  if (discipline) {
    const rows = await db.select().from(lessons).where(eq(lessons.discipline, discipline));
    const record: Record<string, unknown> = {};
    for (const r of rows) record[r.lessonKey] = r.data;
    return json(record);
  }
  const rows = await db.select().from(lessons);
  const grouped: Record<string, Record<string, unknown>> = {};
  for (const r of rows) {
    (grouped[r.discipline] ??= {})[r.lessonKey] = r.data;
  }
  return json(grouped);
}

export const OPTIONS = preflight;
