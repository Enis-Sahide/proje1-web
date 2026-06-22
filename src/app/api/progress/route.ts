import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const account = await getAccount(payload.sub);
  if (!account) return errorJson('Kullanıcı bulunamadı', 404);
  return json({
    unlockedTiers: account.unlockedTiers,
    examAttempts: account.examAttempts,
    activeExam: account.activeExam,
    role: account.role,
  });
}

export const OPTIONS = preflight;
