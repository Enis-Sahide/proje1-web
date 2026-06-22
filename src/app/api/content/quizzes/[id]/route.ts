import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { quizzes, quizQuestions } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Tek quiz — doğru cevap DÖNMEZ; giriş zorunlu.
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);

  const { id } = await ctx.params;
  const [q] = await db.select().from(quizzes).where(eq(quizzes.id, id));
  if (!q) return errorJson('Quiz bulunamadı', 404);
  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, id))
    .orderBy(asc(quizQuestions.sort));
  return json({
    id: q.id,
    title: q.title,
    description: q.description,
    questions: questions.map((x) => ({
      id: x.qKey,
      question: x.question,
      options: x.options,
      // correctAnswerIndex GÖNDERİLMEZ
    })),
  });
}

export const OPTIONS = preflight;
