import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { ensureProfileAndProgress } from '@/lib/auth/account';
import { buildAuthResponse } from '@/lib/auth/respond';
import { errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { email, password, fullName } = await request.json().catch(() => ({}));
  if (!email || !password) return errorJson('E-posta ve şifre gerekli');
  const normEmail = String(email).trim().toLowerCase();
  if (String(password).length < 6) return errorJson('Şifre en az 6 karakter olmalı');

  const [existing] = await db.select().from(users).where(eq(users.email, normEmail));
  if (existing) return errorJson('Bu e-posta zaten kayıtlı', 409);

  const passwordHash = await hashPassword(String(password));
  const [u] = await db
    .insert(users)
    .values({ email: normEmail, passwordHash, fullName: fullName ?? null })
    .returning();
  await ensureProfileAndProgress(u.id, u.email);
  return buildAuthResponse(u.id, request);
}

export const OPTIONS = preflight;
