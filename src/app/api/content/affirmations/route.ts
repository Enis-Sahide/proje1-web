import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { affirmations } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';
import { DAILY_AFFIRMATIONS } from '@/data/affirmations';

export const dynamic = 'force-dynamic';

// DAILY_AFFIRMATIONS Record<number, {text, author}> şeklini döndürür.
export async function GET() {
  try {
    const dbPromise = db.select().from(affirmations).orderBy(asc(affirmations.id));
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const rows = await Promise.race([dbPromise, timeoutPromise]);

    if (!rows || rows.length === 0) {
      return json(DAILY_AFFIRMATIONS);
    }

    const record: Record<number, { text: string; author: string | null }> = {};
    for (const r of rows) record[r.id] = { text: r.text, author: r.author };
    return json(record);
  } catch {
    return json(DAILY_AFFIRMATIONS);
  }
}

export const OPTIONS = preflight;
