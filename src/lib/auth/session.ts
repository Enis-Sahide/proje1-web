import { randomBytes, createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { sessions } from '@/db/schema';
import { verifyAccessToken, type AccessPayload } from './jwt';

const REFRESH_TTL_DAYS = Number(process.env.JWT_REFRESH_TTL_DAYS || 30);
const ACCESS_TTL_MIN = Number(process.env.JWT_ACCESS_TTL_MIN || 30);

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

function hashToken(t: string): string {
  return createHash('sha256').update(t).digest('hex');
}

export async function createSession(userId: string, userAgent?: string | null) {
  const token = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 86400 * 1000);
  await db.insert(sessions).values({
    userId,
    refreshTokenHash: hashToken(token),
    expiresAt,
    userAgent: userAgent ?? null,
  });
  return { token, expiresAt };
}

export async function rotateSession(oldToken: string, userAgent?: string | null) {
  const [row] = await db.select().from(sessions).where(eq(sessions.refreshTokenHash, hashToken(oldToken)));
  if (!row || row.revokedAt || row.expiresAt.getTime() < Date.now()) return null;
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, row.id));
  const fresh = await createSession(row.userId, userAgent);
  return { userId: row.userId, ...fresh };
}

export async function revokeSession(token: string) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.refreshTokenHash, hashToken(token)));
}

// İstek başlığından (Bearer) veya cookie'den access token'ı doğrula.
export async function getAuthPayload(request: Request): Promise<AccessPayload | null> {
  const auth = request.headers.get('authorization');
  let token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    const cookie = request.headers.get('cookie') || '';
    const m = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
  }
  if (!token) return null;
  return verifyAccessToken(token);
}

export function readRefreshCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)refresh_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Web için httpOnly cookie'ler (mobil JSON gövdedeki token'ları kullanır).
export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
  refreshExpires: Date,
) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookies.set('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: ACCESS_TTL_MIN * 60,
  });
  res.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    expires: refreshExpires,
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set('access_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set('refresh_token', '', { httpOnly: true, path: '/', maxAge: 0 });
}
