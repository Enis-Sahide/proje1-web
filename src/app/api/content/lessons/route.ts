import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lessons } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// ?discipline=astrology|human_design|kabbalah|rune
// discipline verilirse Record<lessonKey, data>; verilmezse { discipline: Record }.
export async function GET(request: Request) {
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
