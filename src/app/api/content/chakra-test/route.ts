import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { chakraTestQuestions } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// CHAKRA_TEST_QUESTIONS [{id, chakraId, text}] şeklini döndürür.
export async function GET() {
  const rows = await db.select().from(chakraTestQuestions).orderBy(asc(chakraTestQuestions.id));
  return json(rows.map((r) => ({ id: r.id, chakraId: r.chakraKey, text: r.text })));
}

export const OPTIONS = preflight;
