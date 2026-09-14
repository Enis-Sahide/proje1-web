import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, emailVerifications } from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { isDisposableEmail, checkDomainHasMx, generateVerificationCode } from '@/lib/auth/validate';
import { sendVerificationCodeEmail } from '@/lib/mail/smtp';
import { registerSchema, formatZodError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorJson(formatZodError(parsed.error), 400);
    }
    const { email: normEmail, password, fullName, website } = parsed.data;

    // 1. Honeypot (bot tuzağı): website alanı gizlidir; botlar doldurursa engelle
    if (website) {
      return errorJson('Kayıt isteği reddedildi.', 400);
    }


    // 3. Tek kullanımlık / geçici e-posta engeli
    if (isDisposableEmail(normEmail)) {
      return errorJson('Geçici veya tek kullanımlık e-posta adresleri kabul edilmemektedir. Lütfen geçerli bir e-posta kullanın.');
    }

    // 4. Alan adı (DNS MX) denetimi - var olmayan domainleri durdur
    const domain = normEmail.split('@')[1];
    try {
      const hasMx = await checkDomainHasMx(domain);
      if (!hasMx) {
        return errorJson('Girdiğiniz e-posta sağlayıcısına ait aktif bir posta sunucusu bulunamadı. Lütfen geçerli bir e-posta adresi girin.', 400);
      }
    } catch (e: any) {
      console.warn(`[Register] MX check skipped due to DNS lookup exception for ${domain}:`, e?.message);
    }

    if (String(password).length < 6) return errorJson('Şifre en az 6 karakter olmalıdır.');

    // 5. Kayıtlı kullanıcı kontrolü
    const [existing] = await db.select().from(users).where(eq(users.email, normEmail));
    const passwordHash = await hashPassword(String(password));
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika geçerli

    if (existing) {
      // Eğer kullanıcı kayıtlı ama henüz e-postasını onaylamamışsa, kilitlenmesini önle: yeni kod gönderip doğrulama ekranına geçir
      if (existing.emailVerified === false) {
        await db.delete(emailVerifications).where(eq(emailVerifications.email, normEmail));
        await db.insert(emailVerifications).values({
          email: normEmail,
          code,
          passwordHash,
          fullName: fullName || existing.fullName || null,
          expiresAt,
        });

        // users tablosundaki şifreyi de yeni belirlenen şifre ile güncelle
        await db
          .update(users)
          .set({
            passwordHash,
            fullName: fullName || existing.fullName || null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id));

        await sendVerificationCodeEmail(normEmail, code);
        return json({
          requiresVerification: true,
          email: normEmail,
          message: 'Hesabınız için yeni bir 6 haneli doğrulama kodu e-postanıza gönderildi.',
        });
      }
      return errorJson('Bu e-posta adresi zaten kayıtlıdır. Lütfen giriş yapın.', 409, { isAlreadyRegistered: true });
    }

    // 6. Bilgileri geçici doğrulama tablosunda tut (users tablosuna HENÜZ yazma! - Lazy Registration)
    await db.delete(emailVerifications).where(eq(emailVerifications.email, normEmail));
    await db.insert(emailVerifications).values({
      email: normEmail,
      code,
      passwordHash,
      fullName: fullName ?? null,
      expiresAt,
    });

    // E-posta gönderimi
    const mailSent = await sendVerificationCodeEmail(normEmail, code);
    if (!mailSent) {
      console.warn(`[Register] Verification code email could not be sent to: ${normEmail}`);
    }

    return json({
      requiresVerification: true,
      email: normEmail,
      message: 'Eğer girdiğiniz e-posta adresi geçerliyse doğrulama kodu gönderilmiştir.',
    });
  } catch (err: any) {
    console.error('[Register API Error]:', err);
    return errorJson(err?.message || 'Kayıt işlemi sırasında beklenmeyen bir hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
