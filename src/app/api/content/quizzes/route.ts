import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { quizzes, quizQuestions } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// allQuizzes Record<string, Quiz> şeklini birebir döndürür.
export async function GET() {
  const qs = await db.select().from(quizzes);
  const questions = await db.select().from(quizQuestions).orderBy(asc(quizQuestions.sort));
  const byQuiz: Record<string, unknown[]> = {};
  for (const q of questions) {
    (byQuiz[q.quizId] ??= []).push({
      id: q.qKey,
      question: q.question,
      options: q.options,
      correctAnswerIndex: q.correctIndex,
      explanation: q.explanation,
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
