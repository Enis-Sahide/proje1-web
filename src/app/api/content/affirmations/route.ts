import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { affirmations } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// DAILY_AFFIRMATIONS Record<number, {text, author}> şeklini döndürür.
export async function GET() {
  const rows = await db.select().from(affirmations).orderBy(asc(affirmations.id));
  const record: Record<number, { text: string; author: string | null }> = {};
  for (const r of rows) record[r.id] = { text: r.text, author: r.author };
  return json(record);
}

export const OPTIONS = preflight;
