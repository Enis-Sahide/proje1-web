import { db } from '@/db/client';
import { numerologyCalcData } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// numerologyDataWeb sözlüklerini { life_path, birthday, arrows, personal_year, empty_arrows } olarak döndürür.
export async function GET() {
  const rows = await db.select().from(numerologyCalcData);
  const out: Record<string, Record<string, unknown>> = {};
  for (const r of rows) {
    (out[r.kind] ??= {})[r.key] = r.value;
  }
  return json(out);
}

export const OPTIONS = preflight;
