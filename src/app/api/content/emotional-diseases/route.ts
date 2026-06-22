import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { emotionalDiseases } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Dersler > Duygusal Hastalıklar → giriş zorunlu.
export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const rows = await db.select().from(emotionalDiseases).orderBy(asc(emotionalDiseases.id));
  return json(rows.map((r) => ({ name: r.name, cause: r.cause, affirmation: r.affirmation })));
}

export const OPTIONS = preflight;
