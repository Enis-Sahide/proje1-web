import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { ensureProfileAndProgress } from '@/lib/auth/account';
import { buildAuthResponse } from '@/lib/auth/respond';
import { errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) return errorJson('E-posta ve şifre gerekli');
  const normEmail = String(email).trim().toLowerCase();

  const [u] = await db.select().from(users).where(eq(users.email, normEmail));
  if (!u) return errorJson('Geçersiz e-posta veya şifre', 401);
  const ok = await verifyPassword(String(password), u.passwordHash);
  if (!ok) return errorJson('Geçersiz e-posta veya şifre', 401);

  await ensureProfileAndProgress(u.id, u.email);
  return buildAuthResponse(u.id, request);
}

export const OPTIONS = preflight;
