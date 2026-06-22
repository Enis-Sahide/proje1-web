import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { chakras, chakraTopics } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function GET() {
  const chakraRows = await db.select().from(chakras).orderBy(asc(chakras.id));
  const topics = await db.select().from(chakraTopics).orderBy(asc(chakraTopics.sort));
  const chakrasRecord: Record<string, any> = {};
  for (const c of chakraRows) {
    chakrasRecord[String(c.id)] = {
      title: c.title,
      subtitle: c.subtitle,
      color: c.color,
      imageIcon: c.imageIcon,
      homeTop: c.homeTop,
    };
  }
  return json({
    chakras: chakrasRecord,
    // ana sayfa kartları için dizi (id ile)
    modules: chakraRows.map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      color: c.color,
      imageIcon: c.imageIcon,
      top: c.homeTop,
    })),
    topics: topics.map((t) => ({ id: t.id, title: t.title, icon: t.icon })),
  });
}

export const OPTIONS = preflight;
