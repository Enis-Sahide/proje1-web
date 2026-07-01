import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { resources } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await db.select().from(resources).orderBy(asc(resources.sort));
  return json(rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    fileUrl: r.fileUrl,
    level: r.level,
    description: r.description,
    sort: r.sort,
  })));
}

export const OPTIONS = preflight;
