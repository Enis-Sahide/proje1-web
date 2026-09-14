import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, emailVerifications } from '@/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { ensureProfileAndProgress } from '@/lib/auth/account';
import { buildAuthResponse } from '@/lib/auth/respond';
import { errorJson, preflight } from '@/lib/http/cors';
import { loginSchema, formatZodError } from '@/lib/validation';
import { generateVerificationCode } from '@/lib/auth/validate';
import { sendVerificationCodeEmail } from '@/lib/mail/smtp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return errorJson(formatZodError(parsed.error), 400);
    const { email: normEmail, password } = parsed.data;

    const [u] = await db.select().from(users).where(eq(users.email, normEmail));

    // 1. users tablosunda kullanıcı henüz yoksa: Lazy Registration ile emailVerifications tablosunda bekleyen bir kayıt var mı?
    if (!u) {
      const [pending] = await db
        .select()
        .from(emailVerifications)
        .where(eq(emailVerifications.email, normEmail))
        .orderBy(desc(emailVerifications.createdAt))
        .limit(1);

      if (pending && pending.passwordHash) {
        const ok = await verifyPassword(String(password), pending.passwordHash);
        if (ok) {
          // Şifre doğru, ancak e-posta henüz doğrulanmamış: yeni taze kod üret ve e-postaya gönder
          const code = generateVerificationCode();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
          await db
            .update(emailVerifications)
            .set({
              code,
              expiresAt,
              attempts: 0,
              createdAt: new Date(),
            })
            .where(eq(emailVerifications.id, pending.id));

          await sendVerificationCodeEmail(normEmail, code);

          return errorJson(
            'Hesabınızın e-posta doğrulaması henüz tamamlanmamış. Yeni bir 6 haneli doğrulama kodu e-postanıza gönderildi.',
            403,
            { requiresVerification: true, email: normEmail }
          );
        }
      }
      return errorJson('Geçersiz e-posta veya şifre', 401);
    }

    // 2. users tablosundaki kullanıcının şifresini kontrol et
    const ok = await verifyPassword(String(password), u.passwordHash);
    if (!ok) return errorJson('Geçersiz e-posta veya şifre', 401);

    // 3. E-posta doğrulanmamışsa kilitlenmeyi önle: yeni kod üretip e-postaya gönder
    if (u.emailVerified === false) {
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db.delete(emailVerifications).where(eq(emailVerifications.email, normEmail));
      await db.insert(emailVerifications).values({
        email: normEmail,
        code,
        passwordHash: u.passwordHash,
        fullName: u.fullName,
        expiresAt,
      });
      await sendVerificationCodeEmail(normEmail, code);

      return errorJson(
        'E-posta adresiniz henüz doğrulanmamıştır. Yeni bir 6 haneli doğrulama kodu e-postanıza gönderildi.',
        403,
        { requiresVerification: true, email: u.email }
      );
    }

    await ensureProfileAndProgress(u.id, u.email);
    return buildAuthResponse(u.id, request);
  } catch (err: any) {
    console.error('[Login API Error]:', err);
    return errorJson(err?.message || 'Giriş işlemi sırasında bir hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
