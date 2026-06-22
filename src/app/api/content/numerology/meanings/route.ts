import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { numerologyMeanings } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// numerologyData Record<number, NumerologyMeaning> şeklini döndürür.
export async function GET() {
  const rows = await db.select().from(numerologyMeanings).orderBy(asc(numerologyMeanings.number));
  const record: Record<number, unknown> = {};
  for (const r of rows) record[r.number] = r.data;
  return json(record);
}

export const OPTIONS = preflight;
