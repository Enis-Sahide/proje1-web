import { db } from '@/db/client';
import { runeBindings } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// runeBindings RuneBinding[] şeklini (data jsonb) döndürür.
export async function GET() {
  const rows = await db.select().from(runeBindings);
  return json(rows.map((r) => r.data));
}

export const OPTIONS = preflight;
