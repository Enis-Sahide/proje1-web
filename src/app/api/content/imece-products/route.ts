import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { imeceProducts } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// Orijinal productSeries şekli: { title, icon, desc, items: [{name, desc}] }
export async function GET() {
  const rows = await db.select().from(imeceProducts).orderBy(asc(imeceProducts.sort));
  return json(
    rows.map((r) => ({
      title: r.title,
      icon: r.icon,
      desc: r.description,
      items: r.items,
    })),
  );
}

export const OPTIONS = preflight;
