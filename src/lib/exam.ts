import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { quizzes, quizQuestions } from '@/db/schema';

// 'aura' web testi DB'de 'final' quiz'inin sorularını kullanır.
export function questionsQuizId(examId: string): string {
  return examId === 'aura' ? 'final' : examId;
}

export async function loadExamQuestions(examId: string) {
  const qid = questionsQuizId(examId);
  return db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, qid))
    .orderBy(asc(quizQuestions.sort));
}

export async function loadQuizMeta(examId: string) {
  const [q] = await db.select().from(quizzes).where(eq(quizzes.id, examId));
  return q ?? null;
}

// Sınav sonucu hangi tier'ı açar? (sunucu otoritesi)
export function resolveUnlock(
  examId: string,
  quizMeta: { unlockTier: string | null; passThreshold: number } | null,
  score: number,
): string | null {
  if (examId === 'aura') return score >= 85 ? 'kadim_dersler_access' : null;
  if (quizMeta?.unlockTier && score >= quizMeta.passThreshold) return quizMeta.unlockTier;
  return null;
}

// Bir sorunun doğru cevap metni.
export function correctTextOf(q: { options: unknown; correctIndex: number }): string | null {
  const opts = (q.options as string[]) ?? [];
  return opts[q.correctIndex] ?? null;
}
