import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { hdGates } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await db.select().from(hdGates).orderBy(asc(hdGates.id));
  return json(rows);
}

export const OPTIONS = preflight;
