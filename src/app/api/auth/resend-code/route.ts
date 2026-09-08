import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, emailVerifications } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { generateVerificationCode } from '@/lib/auth/validate';
import { sendVerificationCodeEmail } from '@/lib/mail/smtp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email } = body;

  if (!email) {
    return errorJson('E-posta adresi gereklidir.', 400);
  }

  const normEmail = String(email).trim().toLowerCase();

  const [u] = await db.select().from(users).where(eq(users.email, normEmail));
  if (!u || u.emailVerified) {
    // Güvenlik: hesap yoksa veya zaten onaylıysa sızdırmadan başarı dön
    return json({
      success: true,
      message: 'Eğer bu hesap onay bekliyorsa, yeni doğrulama kodu gönderildi.',
    });
  }

  // Rate limit: Son 60 saniyede kod istenmiş mi kontrol et
  const [lastCode] = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.email, normEmail))
    .orderBy(desc(emailVerifications.createdAt))
    .limit(1);

  if (lastCode) {
    const elapsedMs = Date.now() - new Date(lastCode.createdAt).getTime();
    if (elapsedMs < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - elapsedMs) / 1000);
      return errorJson(`Lütfen yeni bir kod istemeden önce ${waitSeconds} saniye bekleyin.`, 429);
    }
  }

  // Yeni 6 haneli kod üret ve kaydet
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
    success: true,
    message: 'Yeni doğrulama kodu e-posta adresinize gönderildi.',
  });
}

export const OPTIONS = preflight;
