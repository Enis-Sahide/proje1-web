import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, emailVerifications } from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { isDisposableEmail, checkDomainHasMx, generateVerificationCode } from '@/lib/auth/validate';
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

  // 4. Alan adı (DNS MX) denetimi - var olmayan domainleri durdur
  const domain = normEmail.split('@')[1];
  const hasMx = await checkDomainHasMx(domain);
  if (!hasMx) {
    return errorJson('Girdiğiniz e-posta sağlayıcısına ait aktif bir posta sunucusu bulunamadı. Lütfen geçerli bir e-posta adresi girin.', 400);
  }

  if (String(password).length < 6) return errorJson('Şifre en az 6 karakter olmalıdır.');

  // 5. Kayıtlı kullanıcı kontrolü
  const [existing] = await db.select().from(users).where(eq(users.email, normEmail));
  if (existing) {
    return errorJson('Bu e-posta adresi zaten kayıtlıdır.', 409);
  }

  // 6. Şifreyi hashle ve bilgileri geçici doğrulama tablosunda tut (users tablosuna HENÜZ yazma!)
  const passwordHash = await hashPassword(String(password));
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika geçerli

  await db.delete(emailVerifications).where(eq(emailVerifications.email, normEmail));
  await db.insert(emailVerifications).values({
    email: normEmail,
    code,
    passwordHash,
    fullName: fullName ?? null,
    expiresAt,
  });

  // E-posta gönderimi
  await sendVerificationCodeEmail(normEmail, code);

  return json({
    requiresVerification: true,
    email: normEmail,
    message: 'Eğer girdiğiniz e-posta adresi geçerliyse doğrulama kodu gönderilmiştir.',
  });
}

export const OPTIONS = preflight;
