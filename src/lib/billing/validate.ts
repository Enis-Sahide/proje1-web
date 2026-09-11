/**
 * Fatura alıcı bilgileri için doğrulama yardımcıları.
 * Hem checkout API'sinde hem de istemci formunda kullanılabilir (server-only değil).
 */

/** TC Kimlik No algoritmik doğrulama (11 hane, ilk hane 0 olamaz, checksum). */
export function isValidTCKN(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const d = value.split('').map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const c10 = (odd * 7 - even) % 10;
  const c11 = (d.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
  return c10 === d[9] && c11 === d[10];
}

/** Vergi Kimlik No algoritmik doğrulama (10 hane, checksum). */
export function isValidVKN(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false;
  const d = value.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (d[i] + (9 - i)) % 10;
    const p = tmp === 0 ? 0 : (tmp * Math.pow(2, 9 - i)) % 9 || 9;
    sum += p;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === d[9];
}

export interface BillingInput {
  fullName?: string;
  phone?: string;
  isCompany?: boolean;
  companyTitle?: string;
  taxNumber?: string;
  taxOffice?: string;
  address?: string;
  city?: string;
  district?: string;
}

export interface BillingInfo {
  /** Bireyselde ad soyad, kurumsalda ünvan */
  displayName: string;
  phone: string | null;
  isCompany: boolean;
  taxNumber: string | null;
  taxOffice: string | null;
  address: string;
  city: string;
  district: string;
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/**
 * Checkout'tan gelen ham fatura bilgilerini doğrular ve normalize eder.
 * @returns Hata mesajı (string) veya normalize edilmiş bilgi.
 */
export function validateBilling(input: BillingInput): { ok: true; value: BillingInfo } | { ok: false; error: string } {
  const isCompany = Boolean(input.isCompany);
  const fullName = str(input.fullName);
  const companyTitle = str(input.companyTitle);
  const taxNumber = str(input.taxNumber).replace(/\s/g, '');
  const taxOffice = str(input.taxOffice);
  const address = str(input.address);
  const city = str(input.city);
  const district = str(input.district);
  const phone = str(input.phone).replace(/[^\d+]/g, '');

  if (!city || !district) return { ok: false, error: 'Fatura için il ve ilçe zorunludur.' };
  if (!address || address.length < 5) return { ok: false, error: 'Fatura adresi eksik.' };

  if (isCompany) {
    if (!companyTitle) return { ok: false, error: 'Firma ünvanı zorunludur.' };
    if (!isValidVKN(taxNumber)) return { ok: false, error: 'Vergi kimlik numarası geçersiz (10 hane).' };
    if (!taxOffice) return { ok: false, error: 'Vergi dairesi zorunludur.' };
    return {
      ok: true,
      value: { displayName: companyTitle, phone: phone || null, isCompany, taxNumber, taxOffice, address, city, district },
    };
  }

  if (!fullName || fullName.split(/\s+/).length < 2) {
    return { ok: false, error: 'Fatura için ad ve soyad zorunludur.' };
  }
  if (taxNumber && !isValidTCKN(taxNumber)) {
    return { ok: false, error: 'TC kimlik numarası geçersiz.' };
  }
  return {
    ok: true,
    value: {
      displayName: fullName,
      phone: phone || null,
      isCompany: false,
      taxNumber: taxNumber || null,
      taxOffice: null,
      address,
      city,
      district,
    },
  };
}
