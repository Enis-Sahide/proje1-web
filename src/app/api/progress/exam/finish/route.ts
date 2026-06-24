import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userProgress } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';
import { loadExamQuestions, correctTextOf } from '@/lib/exam';
import { PASS_THRESHOLD } from '@/lib/levels';

export const dynamic = 'force-dynamic';

// Sınavı SUNUCUDA puanlar. Geçilirse (≥%80) sınavı passed_exams'a ekler;
// rol GEÇİLEN sınavlardan yeniden hesaplanır (seviye-bazlı model).
// answers = { [qKey]: seçilenSeçenekMetni }. answers yoksa sadece aktif oturum temizlenir.
export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);

  const { quizId, answers } = await request.json().catch(() => ({}));
  if (!quizId) return errorJson('quizId gerekli');

  // İptal/çıkış
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
  const passed = score >= PASS_THRESHOLD;

  // Geçtiyse passed_exams'a ekle (idempotent)
  const [pr] = await db.select().from(userProgress).where(eq(userProgress.userId, payload.sub));
  let passedExams = pr?.passedExams ?? [];
  let examAttempts = (pr?.examAttempts as Record<string, string>) ?? {};
  const today = new Date().toISOString().split('T')[0];
  const updatedAttempts = { ...examAttempts, [quizId]: today };

  let newlyPassed = false;
  if (passed && !passedExams.includes(String(quizId))) {
    passedExams = [...passedExams, String(quizId)];
    newlyPassed = true;
  }

  await db
    .update(userProgress)
    .set({ passedExams, examAttempts: updatedAttempts, activeExam: null, updatedAt: new Date() })
    .where(eq(userProgress.userId, payload.sub));

  // Rol passed_exams'tan yeniden hesaplanır (getAccount içinde)
  const account = await getAccount(payload.sub);

  return json({
    score,
    total,
    correct,
    passed,
    newlyPassed,
    role: account?.role ?? 'free',
    level: account?.level ?? 0,
    passedExams: account?.passedExams ?? [],
  });
}

export const OPTIONS = preflight;
