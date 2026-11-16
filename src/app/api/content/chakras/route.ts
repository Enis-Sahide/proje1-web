import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { chakras, chakraTopics } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';
import { CHAKRAS, TOPICS } from '@/data/chakraData';
import { chakraHomeFor } from '@/db/seedExtra';

export const dynamic = 'force-dynamic';

function buildStaticChakrasFallback() {
  const chakrasRecord: Record<string, any> = {};
  const modules: any[] = [];

  for (const [idStr, info] of Object.entries(CHAKRAS)) {
    const numId = Number(idStr);
    const { imageIcon, homeTop } = chakraHomeFor(numId);
    chakrasRecord[idStr] = {
      title: info.title,
      subtitle: info.subtitle,
      color: info.color,
      imageIcon,
      homeTop,
    };
    modules.push({
      id: numId,
      title: info.title,
      subtitle: info.subtitle,
      color: info.color,
      imageIcon,
      top: homeTop,
    });
  }

  return {
    chakras: chakrasRecord,
    modules,
    topics: TOPICS.map((t) => ({ id: t.id, title: t.title, icon: t.icon })),
  };
}

export async function GET() {
  try {
    const dbPromise = Promise.all([
      db.select().from(chakras).orderBy(asc(chakras.id)),
      db.select().from(chakraTopics).orderBy(asc(chakraTopics.sort)),
    ]);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const result = await Promise.race([dbPromise, timeoutPromise]);

    if (!result || result[0].length === 0) {
      return json(buildStaticChakrasFallback());
    }

    const [chakraRows, topics] = result;
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
  } catch {
    return json(buildStaticChakrasFallback());
  }
}

export const OPTIONS = preflight;
