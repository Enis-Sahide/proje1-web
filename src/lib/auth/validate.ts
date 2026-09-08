import crypto from 'crypto';
import dns from 'dns';

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

/**
 * Alan adının (domain) aktif bir MX (Mail Exchange) kaydına sahip olup olmadığını denetler.
 */
export async function checkDomainHasMx(domain: string): Promise<boolean> {
  if (!domain || !domain.includes('.')) return false;
  try {
    const records = await dns.promises.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (err: any) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'ESERVFAIL') {
      return false;
    }
    // Geçici ağ/DNS hatalarında kullanıcıyı bloke etmemek için izin ver
    console.warn(`DNS MX check warning for domain ${domain}:`, err.message);
    return true;
  }
}
