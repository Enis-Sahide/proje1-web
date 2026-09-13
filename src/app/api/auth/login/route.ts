import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { ensureProfileAndProgress } from '@/lib/auth/account';
import { buildAuthResponse } from '@/lib/auth/respond';
import { errorJson, preflight } from '@/lib/http/cors';
import { loginSchema, formatZodError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return errorJson(formatZodError(parsed.error), 400);
  const { email: normEmail, password } = parsed.data;


  const [u] = await db.select().from(users).where(eq(users.email, normEmail));
  if (!u) return errorJson('Geçersiz e-posta veya şifre', 401);
  const ok = await verifyPassword(String(password), u.passwordHash);
  if (!ok) return errorJson('Geçersiz e-posta veya şifre', 401);

  if (u.emailVerified === false) {
    return errorJson(
      'E-posta adresiniz henüz doğrulanmamıştır. Lütfen e-postanıza gönderilen doğrulama kodunu girin.',
      403,
      { requiresVerification: true, email: u.email }
    );
  }

  await ensureProfileAndProgress(u.id, u.email);
  return buildAuthResponse(u.id, request);
}

export const OPTIONS = preflight;
