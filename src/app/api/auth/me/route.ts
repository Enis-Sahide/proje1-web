import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';
import { publicUser } from '@/lib/auth/respond';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const account = await getAccount(payload.sub);
  if (!account) return errorJson('Kullanıcı bulunamadı', 404);
  return json({
    user: publicUser(account),
    role: account.role,
    level: account.level,
    unlockedTiers: account.unlockedTiers,
    passedExams: account.passedExams,
    examAttempts: account.examAttempts,
    activeExam: account.activeExam,
  });
}

export const OPTIONS = preflight;
