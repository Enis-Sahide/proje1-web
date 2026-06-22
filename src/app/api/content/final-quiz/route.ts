import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { quizQuestions } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// FINAL_QUIZ_QUESTIONS şeklini ({ id, question, options, correctAnswer }) yeniden kurar.
export async function GET() {
  const rows = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, 'final'))
    .orderBy(asc(quizQuestions.sort));
  return json(
    rows.map((r) => {
      const options = (r.options as string[]) ?? [];
      const numericId = Number(r.qKey);
      return {
        id: Number.isNaN(numericId) ? r.qKey : numericId,
        question: r.question,
        options,
        correctAnswer: options[r.correctIndex] ?? null,
      };
    }),
  );
}

export const OPTIONS = preflight;
