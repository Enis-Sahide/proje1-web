import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { moonPhases } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// Orijinal MoonPhaseEvent şekli: { utcDate, phase, phaseName, sign, signSymbol, degree }
export async function GET() {
  const rows = await db.select().from(moonPhases).orderBy(asc(moonPhases.sort));
  return json(
    rows.map((r) => ({
      utcDate: r.utcDate,
      phase: r.phase,
      phaseName: r.phaseName,
      sign: r.sign,
      signSymbol: r.signSymbol,
      degree: r.degree,
    })),
  );
}

export const OPTIONS = preflight;
