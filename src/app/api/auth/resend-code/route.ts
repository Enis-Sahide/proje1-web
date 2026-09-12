import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, emailVerifications } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { generateVerificationCode } from '@/lib/auth/validate';
import { sendVerificationCodeEmail } from '@/lib/mail/smtp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return errorJson('E-posta adresi gereklidir.', 400);
    }

    const normEmail = String(email).trim().toLowerCase();

    const [u] = await db.select().from(users).where(eq(users.email, normEmail));
    if (u?.emailVerified) {
      return json({
        success: true,
        message: 'Bu hesap zaten onaylanmıştır.',
      });
    }

    // Bekleyen doğrulama kaydını kontrol et
    const [pending] = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.email, normEmail))
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);

    if (!pending) {
      return json({
        success: true,
        message: 'Eğer bu hesap onay bekliyorsa, yeni doğrulama kodu gönderildi.',
      });
    }

    // Rate limit: Son 60 saniyede kod istenmiş mi kontrol et
    const elapsedMs = Date.now() - new Date(pending.createdAt).getTime();
    if (elapsedMs < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - elapsedMs) / 1000);
      return errorJson(`Lütfen yeni bir kod istemeden önce ${waitSeconds} saniye bekleyin.`, 429);
    }

    // Yeni 6 haneli kod üret ve güncelle
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

    await db
      .update(emailVerifications)
      .set({
        code,
        expiresAt,
        createdAt: new Date(),
      })
      .where(eq(emailVerifications.id, pending.id));

    await sendVerificationCodeEmail(normEmail, code);

    return json({
      success: true,
      message: 'Yeni doğrulama kodu e-posta adresinize gönderildi.',
    });
  } catch (err: any) {
    console.error('[Resend Code API Error]:', err);
    return errorJson(err?.message || 'Kod gönderilirken bir hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
