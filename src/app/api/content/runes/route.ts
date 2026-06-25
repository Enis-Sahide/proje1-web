import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { runes } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

import { getAuthPayload } from '@/lib/auth/session';
import { errorJson } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// runeSymbols Rune[] şeklini (data jsonb) döndürür.
export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  
  const role = payload.role ?? 'free';
  const ROLE_LEVELS: Record<string, number> = { free: 0, apprentice: 1, journeyman: 2, master: 3, admin: 999 };
  const userLevel = ROLE_LEVELS[role] ?? 0;

  if (userLevel < 1 && role !== 'admin') {
    return errorJson('Yetkisiz - En az Çıraklık seviyesi gereklidir', 403);
  }

  const rows = await db.select().from(runes).orderBy(asc(runes.id));
  return json(rows.map((r) => r.data));
}

export const OPTIONS = preflight;
