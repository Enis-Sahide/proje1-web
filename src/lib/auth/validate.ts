import crypto from 'crypto';

// Bilinen geçici / tek kullanımlık (disposable) ve sahte e-posta sağlayıcıları
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'mailinator.com',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.net',
  'trashmail.com',
  'trashmail.net',
  'dispostable.com',
  'getairmail.com',
  'fakeinbox.com',
  'crazymailing.com',
  'generator.email',
  'mohmal.com',
  'mytemp.email',
  'tempail.com',
  'tempinbox.com',
  'maildrop.cc',
  'inboxkitten.com',
  'nada.ltd',
  'getnada.com',
  'fakemailgenerator.com',
  'dropmail.me',
  'emailondeck.com',
  'burnermail.io',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'tinad.site',
  'clipik.top',
]);

/**
 * E-posta adresinin geçici/sahte e-posta servislerine ait olup olmadığını denetler.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * 6 haneli kriptografik olarak güvenli OTP doğrulama kodu üretir.
 */
export function generateVerificationCode(): string {
  // 100000 ile 999999 arasında güvenli rastgele sayı
  const randomInt = crypto.randomInt(100000, 1000000);
  return randomInt.toString();
}
