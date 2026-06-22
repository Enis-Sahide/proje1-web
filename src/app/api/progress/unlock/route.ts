import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userProgress } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount, syncRoleFromTiers } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const { tierId } = await request.json().catch(() => ({}));
  if (!tierId) return errorJson('tierId gerekli');

  const [pr] = await db.select().from(userProgress).where(eq(userProgress.userId, payload.sub));
  const current = pr?.unlockedTiers ?? [];
  if (!current.includes(tierId)) {
    const newTiers = [...current, tierId];
    await db
      .update(userProgress)
      .set({ unlockedTiers: newTiers, updatedAt: new Date() })
      .where(eq(userProgress.userId, payload.sub));
    await syncRoleFromTiers(payload.sub, payload.email, newTiers);
  }

  const account = await getAccount(payload.sub);
  return json({ unlockedTiers: account?.unlockedTiers ?? [], role: account?.role ?? 'free' });
}

export const OPTIONS = preflight;
