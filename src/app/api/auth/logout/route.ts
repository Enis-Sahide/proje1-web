import { json, preflight } from '@/lib/http/cors';
import { revokeSession, readRefreshCookie, clearAuthCookies } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = body.refreshToken || readRefreshCookie(request);
  if (token) await revokeSession(token);
  const res = json({ success: true });
  clearAuthCookies(res);
  return res;
}

export const OPTIONS = preflight;
