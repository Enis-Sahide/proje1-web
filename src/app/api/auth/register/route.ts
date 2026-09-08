import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, emailVerifications } from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { ensureProfileAndProgress } from '@/lib/auth/account';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { isDisposableEmail, generateVerificationCode } from '@/lib/auth/validate';
import { sendVerificationCodeEmail } from '@/lib/mail/smtp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, fullName, website } = body;

  // 1. Honeypot (bot tuzağı): website alanı gizlidir; botlar doldurursa engelle
  if (website) {
    return errorJson('Kayıt isteği reddedildi.', 400);
  }

  if (!email || !password) return errorJson('E-posta ve şifre gereklidir.');
  const normEmail = String(email).trim().toLowerCase();

  // 2. Format kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normEmail)) {
    return errorJson('Lütfen geçerli bir e-posta adresi girin.');
  }

  // 3. Tek kullanımlık / geçici e-posta engeli
  if (isDisposableEmail(normEmail)) {
    return errorJson('Geçici veya tek kullanımlık e-posta adresleri kabul edilmemektedir. Lütfen geçerli bir e-posta kullanın.');
  }

  if (String(password).length < 6) return errorJson('Şifre en az 6 karakter olmalıdır.');

  const [existing] = await db.select().from(users).where(eq(users.email, normEmail));
  if (existing) {
    if (existing.emailVerified) {
      return errorJson('Bu e-posta adresi zaten kayıtlıdır.', 409);
    }
    
    // Kullanıcı daha önce kayıt olmuş fakat kodunu doğrulamamış
    const passwordHash = await hashPassword(String(password));
    await db
      .update(users)
      .set({ passwordHash, fullName: fullName ?? existing.fullName, updatedAt: new Date() })
      .where(eq(users.id, existing.id));

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

    await db.delete(emailVerifications).where(eq(emailVerifications.email, normEmail));
    await db.insert(emailVerifications).values({
      email: normEmail,
      code,
      expiresAt,
    });

    await sendVerificationCodeEmail(normEmail, code);

    return json({
      requiresVerification: true,
      email: normEmail,
      message: 'Doğrulama kodu e-posta adresinize gönderildi.',
    });
  }

  const passwordHash = await hashPassword(String(password));
  const [u] = await db
    .insert(users)
    .values({
      email: normEmail,
      passwordHash,
      fullName: fullName ?? null,
      emailVerified: false,
    })
    .returning();

  await ensureProfileAndProgress(u.id, u.email);

  // 6 haneli OTP kodu üret ve kaydet
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

  await db.delete(emailVerifications).where(eq(emailVerifications.email, normEmail));
  await db.insert(emailVerifications).values({
    email: normEmail,
    code,
    expiresAt,
  });

  // E-posta gönderimi
  await sendVerificationCodeEmail(normEmail, code);

  return json({
    requiresVerification: true,
    email: normEmail,
    message: 'Doğrulama kodu e-posta adresinize gönderildi.',
  });
}

export const OPTIONS = preflight;
