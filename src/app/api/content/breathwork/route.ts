import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { breathworkTechniques } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// Orijinal TECHNIQUES şekli: { id, name, desc, instruction, phases, requiredRole? }
export async function GET() {
  const rows = await db.select().from(breathworkTechniques).orderBy(asc(breathworkTechniques.sort));
  return json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      desc: r.description,
      instruction: r.instruction,
      phases: r.phases,
      ...(r.requiredRole ? { requiredRole: r.requiredRole } : {}),
    })),
  );
}

export const OPTIONS = preflight;
