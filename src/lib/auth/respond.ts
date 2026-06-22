import { json } from '@/lib/http/cors';
import { signAccessToken } from './jwt';
import { createSession, setAuthCookies } from './session';
import { getAccount, type Account } from './account';

function publicUser(a: Account) {
  return {
    id: a.id,
    email: a.email,
    fullName: a.fullName,
    role: a.role,
    race: a.race,
    avatarUrl: a.avatarUrl,
  };
}

// Login/register/refresh sonrası ortak başarı yanıtı (cookie + JSON token).
export async function buildAuthResponse(userId: string, request: Request) {
  const account = await getAccount(userId);
  if (!account) throw new Error('Hesap oluşturulduktan sonra bulunamadı');
  const accessToken = await signAccessToken({
    sub: account.id,
    email: account.email,
    role: account.role,
  });
  const { token: refreshToken, expiresAt } = await createSession(
    account.id,
    request.headers.get('user-agent'),
  );
  const res = json({
    user: publicUser(account),
    role: account.role,
    unlockedTiers: account.unlockedTiers,
    examAttempts: account.examAttempts,
    activeExam: account.activeExam,
    accessToken,
    refreshToken,
  });
  setAuthCookies(res, accessToken, refreshToken, expiresAt);
  return res;
}

export { publicUser };
