import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { loadExamQuestions, correctTextOf } from '@/lib/exam';

export const dynamic = 'force-dynamic';

// Tek soruluk anlık geri bildirim. Doğru cevap anahtarı toplu sızmasın diye
// soru bazında, sadece kullanıcı bir seçim yaptıktan sonra döner.
export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);

  const { quizId, qKey, answer } = await request.json().catch(() => ({}));
  if (!quizId || qKey == null) return errorJson('quizId ve qKey gerekli');

  const questions = await loadExamQuestions(String(quizId));
  const q = questions.find((x) => x.qKey === String(qKey));
  if (!q) return errorJson('Soru bulunamadı', 404);

  const correctText = correctTextOf(q);
  return json({
    correct: answer != null && String(answer) === correctText,
    correctAnswer: correctText,
    explanation: q.explanation,
  });
}

export const OPTIONS = preflight;
