import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userProgress } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount, syncRoleFromTiers } from '@/lib/auth/account';
import { loadExamQuestions, loadQuizMeta, resolveUnlock, correctTextOf } from '@/lib/exam';

export const dynamic = 'force-dynamic';

// Sınavı SUNUCUDA puanlar. İstemci skor GÖNDERMEZ; seçtiği cevapları gönderir.
// answers = { [qKey]: seçilenSeçenekMetni }. answers yoksa sadece aktif oturum temizlenir.
export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);

  const { quizId, answers } = await request.json().catch(() => ({}));
  if (!quizId) return errorJson('quizId gerekli');

  // İptal/çıkış: sadece aktif sınav oturumunu temizle
  if (!answers || typeof answers !== 'object') {
    await db
      .update(userProgress)
      .set({ activeExam: null, updatedAt: new Date() })
      .where(eq(userProgress.userId, payload.sub));
    return json({ cleared: true });
  }

  // Sunucuda puanla
  const questions = await loadExamQuestions(String(quizId));
  const total = questions.length;
  let correct = 0;
  for (const q of questions) {
    const sel = (answers as Record<string, string>)[q.qKey as string];
    if (sel != null && String(sel) === correctTextOf(q)) correct++;
  }
  const score = total > 0 ? (correct / total) * 100 : 0;

  const quizMeta = await loadQuizMeta(String(quizId));
  const threshold = String(quizId) === 'aura' ? 85 : (quizMeta?.passThreshold ?? 100);
  const newlyUnlock = resolveUnlock(String(quizId), quizMeta, score);

  const [pr] = await db.select().from(userProgress).where(eq(userProgress.userId, payload.sub));
  let unlocked = pr?.unlockedTiers ?? [];
  let unlockedTier: string | null = null;
  if (newlyUnlock && !unlocked.includes(newlyUnlock)) {
    unlocked = [...unlocked, newlyUnlock];
    unlockedTier = newlyUnlock;
  }

  await db
    .update(userProgress)
    .set({ unlockedTiers: unlocked, activeExam: null, updatedAt: new Date() })
    .where(eq(userProgress.userId, payload.sub));

  if (unlockedTier) await syncRoleFromTiers(payload.sub, payload.email, unlocked);

  const account = await getAccount(payload.sub);
  return json({
    score,
    total,
    correct,
    passed: score >= threshold,
    unlockedTier,
    unlockedTiers: account?.unlockedTiers ?? [],
    role: account?.role ?? 'free',
  });
}

export const OPTIONS = preflight;
