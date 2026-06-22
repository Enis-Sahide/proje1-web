import { json, errorJson, preflight } from '@/lib/http/cors';
import { signAccessToken } from '@/lib/auth/jwt';
import { rotateSession, readRefreshCookie, setAuthCookies } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';
import { publicUser } from '@/lib/auth/respond';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = body.refreshToken || readRefreshCookie(request);
  if (!token) return errorJson('Refresh token bulunamadı', 401);

  const rotated = await rotateSession(token, request.headers.get('user-agent'));
  if (!rotated) return errorJson('Geçersiz veya süresi dolmuş oturum', 401);

  const account = await getAccount(rotated.userId);
  if (!account) return errorJson('Kullanıcı bulunamadı', 404);

  const accessToken = await signAccessToken({
    sub: account.id,
    email: account.email,
    role: account.role,
  });
  const res = json({
    user: publicUser(account),
    role: account.role,
    unlockedTiers: account.unlockedTiers,
    examAttempts: account.examAttempts,
    activeExam: account.activeExam,
    accessToken,
    refreshToken: rotated.token,
  });
  setAuthCookies(res, accessToken, rotated.token, rotated.expiresAt);
  return res;
}

export const OPTIONS = preflight;
