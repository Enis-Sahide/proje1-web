import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { races } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// Orijinal RACES şekli: { id, name, desc } + avatar URL.
export async function GET() {
  const rows = await db.select().from(races).orderBy(asc(races.sort));
  return json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      desc: r.description,
      avatar: r.avatarUrl,
    })),
  );
}

export const OPTIONS = preflight;
