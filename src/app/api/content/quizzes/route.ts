import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { quizzes, quizQuestions } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// allQuizzes Record<string, Quiz> şekli — ANCAK doğru cevap (correctAnswerIndex) DÖNMEZ.
// Giriş zorunlu (Sınavlar bölümü). Puanlama sunucuda yapılır.
export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);

  const qs = await db.select().from(quizzes);
  const questions = await db.select().from(quizQuestions).orderBy(asc(quizQuestions.sort));
  const byQuiz: Record<string, unknown[]> = {};
  for (const q of questions) {
    (byQuiz[q.quizId] ??= []).push({
      id: q.qKey,
      question: q.question,
      options: q.options,
      // correctAnswerIndex GÜVENLİK NEDENİYLE GÖNDERİLMEZ
    });
  }
  const record: Record<string, unknown> = {};
  for (const q of qs) {
    record[q.id] = {
      id: q.id,
      title: q.title,
      description: q.description,
      questions: byQuiz[q.id] ?? [],
    };
  }
  return json(record);
}

export const OPTIONS = preflight;
