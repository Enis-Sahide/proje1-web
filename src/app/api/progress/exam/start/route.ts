import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userProgress } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';
import { examLevel, roleLevel } from '@/lib/levels';

export const dynamic = 'force-dynamic';

// Seviye kapısı + tek-cihaz + günlük 1 sınav kuralını sunucuda uygular.
export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const { quizId, device = 'web' } = await request.json().catch(() => ({}));
  if (!quizId) return errorJson('quizId gerekli');

  // 0. SEVİYE KAPISI: kullanıcı sadece kendi seviyesindeki (veya altındaki) sınava girebilir.
  const account = await getAccount(payload.sub);
  const requiredLevel = await examLevel(String(quizId));
  if (account && account.role !== 'admin' && roleLevel(account.role) < requiredLevel) {
    return errorJson('Bu sınava girmek için yeterli seviyede değilsiniz.', 403);
  }

  const [pr] = await db.select().from(userProgress).where(eq(userProgress.userId, payload.sub));
  const examAttempts = (pr?.examAttempts as Record<string, string>) ?? {};
  const activeExam = pr?.activeExam as { examId?: string; startTime?: string; device?: string } | null;

  // 2. Bugün zaten tamamlanmış mı?
  const today = new Date().toISOString().split('T')[0];
  if (examAttempts[quizId] === today) {
    return errorJson('Bu sınava bugün zaten girdiniz. Günde en fazla 1 kez girilebilir.', 429);
  }

  // 3. Aktif oturumu kaydet ve günlük deneme hakkını hemen tüket (examAttempts'e ekle)
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
