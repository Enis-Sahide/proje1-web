import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { runes } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// runeSymbols Rune[] şeklini (data jsonb) döndürür.
export async function GET() {
  const rows = await db.select().from(runes).orderBy(asc(runes.id));
  return json(rows.map((r) => r.data));
}

export const OPTIONS = preflight;
