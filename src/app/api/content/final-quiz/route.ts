import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { quizQuestions } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// FINAL_QUIZ_QUESTIONS şekli — ANCAK correctAnswer DÖNMEZ. Giriş zorunlu.
export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);

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
        // correctAnswer GÖNDERİLMEZ
      };
    }),
  );
}

export const OPTIONS = preflight;
