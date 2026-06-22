import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { emotionalDiseases } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await db.select().from(emotionalDiseases).orderBy(asc(emotionalDiseases.id));
  return json(rows.map((r) => ({ name: r.name, cause: r.cause, affirmation: r.affirmation })));
}

export const OPTIONS = preflight;
