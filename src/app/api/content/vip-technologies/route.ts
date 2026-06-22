import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { vipTechnologies } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// VIP modül listesi. icon = lucide ikon ADI (istemci component'e eşler).
export async function GET() {
  const rows = await db.select().from(vipTechnologies).orderBy(asc(vipTechnologies.sort));
  return json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      desc: r.description,
      icon: r.icon,
      color: r.color,
      borderColor: r.borderColor,
      textColor: r.textColor,
      status: r.status,
      path: r.path,
    })),
  );
}

export const OPTIONS = preflight;
