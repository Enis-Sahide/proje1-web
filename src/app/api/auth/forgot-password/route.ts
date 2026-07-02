import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { signResetToken } from '@/lib/auth/jwt';
import { json, preflight } from '@/lib/http/cors';
import { sendResetPasswordEmail } from '@/lib/mail/smtp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  const normEmail = String(email || '').trim().toLowerCase();
  const [u] = normEmail
    ? await db.select().from(users).where(eq(users.email, normEmail))
    : [undefined];

  let resetToken: string | undefined;
  if (u) {
    resetToken = await signResetToken(u.id);
    
    // SMTP ayarları varsa veya prod ortamındaysak e-posta gönder
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost || process.env.NODE_ENV === 'production') {
      await sendResetPasswordEmail(normEmail, resetToken);
    }
  }

  // Kullanıcı varlığı bilgisi sızdırmamak için her zaman success.
  return json({
    success: true,
    message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama talimatı gönderildi.',
    ...(process.env.NODE_ENV !== 'production' && resetToken ? { resetToken } : {}),
  });
}

export const OPTIONS = preflight;
