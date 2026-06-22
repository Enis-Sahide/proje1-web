import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { guidelines } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// GUIDELINES [{icon, title, content, color}] şeklini döndürür.
export async function GET() {
  const rows = await db.select().from(guidelines).orderBy(asc(guidelines.sort));
  return json(rows.map((r) => ({ icon: r.icon, title: r.title, content: r.content, color: r.color })));
}

export const OPTIONS = preflight;
