import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { chakraLessons } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// LESSONS Record<string, any> şeklini birebir döndürür. Opsiyonel ?chakra=1
export async function GET(request: Request) {
  const chakra = new URL(request.url).searchParams.get('chakra');
  const rows = chakra
    ? await db.select().from(chakraLessons).where(eq(chakraLessons.chakraId, Number(chakra)))
    : await db.select().from(chakraLessons);
  const record: Record<string, unknown> = {};
  for (const r of rows) record[r.id] = r.data;
  return json(record);
}

export const OPTIONS = preflight;
