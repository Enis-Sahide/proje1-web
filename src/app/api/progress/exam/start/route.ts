import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userProgress } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Tek-cihaz + günlük 1 sınav kuralını sunucuda uygular (eski test/[id].tsx mantığı).
export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const { quizId, device = 'web' } = await request.json().catch(() => ({}));
  if (!quizId) return errorJson('quizId gerekli');

  const [pr] = await db.select().from(userProgress).where(eq(userProgress.userId, payload.sub));
  const examAttempts = (pr?.examAttempts as Record<string, string>) ?? {};
  const activeExam = pr?.activeExam as { examId?: string; startTime?: string; device?: string } | null;

  // 1. Başka cihazda aktif (60 dk içinde) sınav var mı?
  if (activeExam?.examId && activeExam.startTime) {
    const diffMin = (Date.now() - new Date(activeExam.startTime).getTime()) / 60000;
    if (activeExam.device !== device && diffMin < 60) {
      return errorJson('Bu sınava şu anda başka bir cihazdan giriş yapılmış.', 409);
    }
  }

  // 2. Bugün zaten girilmiş mi?
  const today = new Date().toISOString().split('T')[0];
  if (examAttempts[quizId] === today) {
    return errorJson('Bu sınava bugün zaten girdiniz. Günde en fazla 1 kez girilebilir.', 429);
  }

  // 3. Aktif oturumu kaydet + denemeyi işaretle
  const updatedAttempts = { ...examAttempts, [quizId]: today };
  await db
    .update(userProgress)
    .set({
      activeExam: { examId: quizId, startTime: new Date().toISOString(), device },
      examAttempts: updatedAttempts,
      updatedAt: new Date(),
    })
    .where(eq(userProgress.userId, payload.sub));

  return json({ success: true });
}

export const OPTIONS = preflight;
