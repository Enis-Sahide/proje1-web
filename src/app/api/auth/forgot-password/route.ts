import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { signResetToken } from '@/lib/auth/jwt';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// NOT: E-posta gönderimi henüz bağlı değil. Kullanıcı varsa reset token üretilir.
// Production'da bu token e-posta ile gönderilmeli; geliştirmede yanıt içinde döner.
export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  const normEmail = String(email || '').trim().toLowerCase();
  const [u] = normEmail
    ? await db.select().from(users).where(eq(users.email, normEmail))
    : [undefined];

  let resetToken: string | undefined;
  if (u) {
    resetToken = await signResetToken(u.id);
    // TODO: e-posta ile gönder (n8n/Novu). Şimdilik dev'de yanıtta döndürülür.
  }

  // Kullanıcı sayımı sızdırmamak için her zaman success.
  return json({
    success: true,
    message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama talimatı gönderildi.',
    ...(process.env.NODE_ENV !== 'production' && resetToken ? { resetToken } : {}),
  });
}

export const OPTIONS = preflight;
