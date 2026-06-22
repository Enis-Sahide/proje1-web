import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { meditationFrequencies } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// { chakra: [...], organ: [...] } — orijinal FREQUENCIES / ORGAN_FREQUENCIES şekli.
export async function GET() {
  const rows = await db.select().from(meditationFrequencies).orderBy(asc(meditationFrequencies.sort));
  const map = (r: (typeof rows)[number]) => ({
    id: r.id,
    hz: Number(r.hz),
    name: r.name,
    desc: r.description,
    intent: r.intent,
    color: r.color,
  });
  return json({
    chakra: rows.filter((r) => r.kind === 'chakra').map(map),
    organ: rows.filter((r) => r.kind === 'organ').map(map),
  });
}

export const OPTIONS = preflight;
