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
  
  const role = payload.role ?? 'free';
  const ROLE_LEVELS: Record<string, number> = { free: 0, apprentice: 1, journeyman: 2, master: 3, admin: 999 };
  const userLevel = ROLE_LEVELS[role] ?? 0;

  const discipline = new URL(request.url).searchParams.get('discipline');
  if (discipline) {
    if (userLevel < 1 && discipline !== 'duygusal_hastaliklar' && role !== 'admin') {
      return errorJson('Yetkisiz - En az Çıraklık seviyesi gereklidir', 403);
    }
    const rows = await db.select().from(lessons).where(eq(lessons.discipline, discipline));
    const record: Record<string, unknown> = {};
    for (const r of rows) {
      const key = r.lessonKey;
      const lessonLevel = key.startsWith('3_') || key.includes('master') || key.endsWith('_3')
        ? 3
        : key.startsWith('2_') || key.includes('kalfalik') || key.endsWith('_2')
          ? 2
          : key.startsWith('1_') || key.includes('ciraklik') || key.endsWith('_1')
            ? 1
            : 0;

      if (userLevel >= lessonLevel || role === 'admin') {
        record[r.lessonKey] = r.data;
      }
    }
    return json(record);
  }

  const rows = await db.select().from(lessons);
  const grouped: Record<string, Record<string, unknown>> = {};
  for (const r of rows) {
    const key = r.lessonKey;
    const lessonLevel = key.startsWith('3_') || key.includes('master') || key.endsWith('_3')
      ? 3
      : key.startsWith('2_') || key.includes('kalfalik') || key.endsWith('_2')
        ? 2
        : key.startsWith('1_') || key.includes('ciraklik') || key.endsWith('_1')
          ? 1
          : 0;

    if (userLevel >= lessonLevel || role === 'admin') {
      (grouped[r.discipline] ??= {})[r.lessonKey] = r.data;
    }
  }
  return json(grouped);
}

export const OPTIONS = preflight;
