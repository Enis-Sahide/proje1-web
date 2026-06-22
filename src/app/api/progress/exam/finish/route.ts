import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userProgress, quizzes } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount, syncRoleFromTiers } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

// Sınavı bitirir: eşik geçilirse ilgili tier'ı açar; aktif oturumu temizler.
// score verilmezse sadece aktif oturum temizlenir (iptal/çıkış).
export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const { quizId, score } = await request.json().catch(() => ({}));
  if (!quizId) return errorJson('quizId gerekli');

  const [pr] = await db.select().from(userProgress).where(eq(userProgress.userId, payload.sub));
  const [q] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));

  let unlocked = pr?.unlockedTiers ?? [];
  let unlockedTier: string | null = null;

  if (typeof score === 'number' && q?.unlockTier && score >= q.passThreshold) {
    if (!unlocked.includes(q.unlockTier)) {
      unlocked = [...unlocked, q.unlockTier];
      unlockedTier = q.unlockTier;
    }
  }

  await db
    .update(userProgress)
    .set({ unlockedTiers: unlocked, activeExam: null, updatedAt: new Date() })
    .where(eq(userProgress.userId, payload.sub));

  if (unlockedTier) await syncRoleFromTiers(payload.sub, payload.email, unlocked);

  const account = await getAccount(payload.sub);
  return json({
    unlockedTiers: account?.unlockedTiers ?? [],
    role: account?.role ?? 'free',
    unlockedTier,
  });
}

export const OPTIONS = preflight;
