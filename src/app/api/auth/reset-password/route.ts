import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { verifyResetToken } from '@/lib/auth/jwt';
import { hashPassword } from '@/lib/auth/password';
import { json, errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { token, password } = await request.json().catch(() => ({}));
  if (!token || !password) return errorJson('Token ve yeni şifre gerekli');
  if (String(password).length < 6) return errorJson('Şifre en az 6 karakter olmalı');

  const userId = await verifyResetToken(String(token));
  if (!userId) return errorJson('Geçersiz veya süresi dolmuş token', 401);

  const passwordHash = await hashPassword(String(password));
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
  return json({ success: true });
}

export const OPTIONS = preflight;
