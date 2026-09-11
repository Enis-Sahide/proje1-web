import 'server-only';
import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/db/client';
import { billingProfiles } from '@/db/schema';
import { isValidTCKN, isValidVKN } from './validate';

export type BillingProfileRow = typeof billingProfiles.$inferSelect;

export interface BillingProfileInput {
  label?: string;
  type?: 'individual' | 'company';
  title?: string;
  taxNumber?: string | null;
  taxOffice?: string | null;
  address?: string;
  city?: string;
  district?: string;
  phone?: string | null;
  email?: string | null;
  isDefault?: boolean;
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/**
 * Ham profil girdisini doğrular ve DB'ye yazılacak forma getirir.
 * @returns Hata mesajı veya normalize edilmiş alanlar.
 */
export function validateProfileInput(
  input: BillingProfileInput,
): { ok: true; value: Omit<BillingProfileRow, 'id' | 'userId' | 'createdAt' | 'updatedAt'> } | { ok: false; error: string } {
  const type = input.type === 'company' ? 'company' : 'individual';
  const label = str(input.label);
  const title = str(input.title);
  const taxNumber = str(input.taxNumber).replace(/\s/g, '');
  const taxOffice = str(input.taxOffice);
  const address = str(input.address);
  const city = str(input.city);
  const district = str(input.district);
  const phone = str(input.phone).replace(/[^\d+]/g, '');
  const email = str(input.email).toLowerCase();

  if (!label) return { ok: false, error: 'Profil adı zorunludur (ör. "Şahsi", "Şirketim").' };
  if (label.length > 40) return { ok: false, error: 'Profil adı en fazla 40 karakter olabilir.' };
  if (!city || !district) return { ok: false, error: 'İl ve ilçe zorunludur.' };
  if (!address || address.length < 5) return { ok: false, error: 'Adres eksik.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Fatura e-postası geçersiz.' };
  }

  if (type === 'company') {
    if (!title) return { ok: false, error: 'Firma ünvanı zorunludur.' };
    if (!isValidVKN(taxNumber)) return { ok: false, error: 'Vergi kimlik numarası geçersiz (10 hane).' };
    if (!taxOffice) return { ok: false, error: 'Vergi dairesi zorunludur.' };
  } else {
    if (!title || title.split(/\s+/).length < 2) return { ok: false, error: 'Ad ve soyad zorunludur.' };
    if (taxNumber && !isValidTCKN(taxNumber)) return { ok: false, error: 'TC kimlik numarası geçersiz.' };
  }

  return {
    ok: true,
    value: {
      label,
      type,
      title,
      taxNumber: taxNumber || null,
      taxOffice: type === 'company' ? taxOffice : null,
      address,
      city,
      district,
      phone: phone || null,
      email: email || null,
      isDefault: Boolean(input.isDefault),
    },
  };
}

export async function listProfiles(userId: string): Promise<BillingProfileRow[]> {
  return db
    .select()
    .from(billingProfiles)
    .where(eq(billingProfiles.userId, userId))
    .orderBy(desc(billingProfiles.isDefault), desc(billingProfiles.createdAt));
}

export async function getProfile(userId: string, id: string): Promise<BillingProfileRow | null> {
  const [row] = await db
    .select()
    .from(billingProfiles)
    .where(and(eq(billingProfiles.id, id), eq(billingProfiles.userId, userId)));
  return row ?? null;
}

/** Diğer profillerin varsayılan işaretini kaldırır. */
async function clearDefault(userId: string, exceptId?: string) {
  const cond = exceptId
    ? and(eq(billingProfiles.userId, userId), ne(billingProfiles.id, exceptId))
    : eq(billingProfiles.userId, userId);
  await db.update(billingProfiles).set({ isDefault: false }).where(cond);
}

export async function createProfile(userId: string, input: BillingProfileInput) {
  const check = validateProfileInput(input);
  if (!check.ok) return check;

  const existing = await listProfiles(userId);
  // İlk profil otomatik varsayılan olur.
  const isDefault = existing.length === 0 ? true : check.value.isDefault;
  if (isDefault) await clearDefault(userId);

  const [row] = await db
    .insert(billingProfiles)
    .values({ ...check.value, isDefault, userId })
    .returning();
  return { ok: true as const, value: row };
}

export async function updateProfile(userId: string, id: string, input: BillingProfileInput) {
  const current = await getProfile(userId, id);
  if (!current) return { ok: false as const, error: 'Profil bulunamadı' };

  // Kısmi güncelleme: gelmeyen alanlar mevcut değerden tamamlanır.
  const merged: BillingProfileInput = {
    label: input.label ?? current.label,
    type: (input.type ?? current.type) as 'individual' | 'company',
    title: input.title ?? current.title,
    taxNumber: input.taxNumber === undefined ? current.taxNumber : input.taxNumber,
    taxOffice: input.taxOffice === undefined ? current.taxOffice : input.taxOffice,
    address: input.address ?? current.address,
    city: input.city ?? current.city,
    district: input.district ?? current.district,
    phone: input.phone === undefined ? current.phone : input.phone,
    email: input.email === undefined ? current.email : input.email,
    isDefault: input.isDefault ?? current.isDefault,
  };
  const check = validateProfileInput(merged);
  if (!check.ok) return check;

  if (check.value.isDefault) await clearDefault(userId, id);

  const [row] = await db
    .update(billingProfiles)
    .set({ ...check.value, updatedAt: new Date() })
    .where(and(eq(billingProfiles.id, id), eq(billingProfiles.userId, userId)))
    .returning();
  return { ok: true as const, value: row };
}

export async function deleteProfile(userId: string, id: string) {
  const current = await getProfile(userId, id);
  if (!current) return { ok: false as const, error: 'Profil bulunamadı' };

  await db
    .delete(billingProfiles)
    .where(and(eq(billingProfiles.id, id), eq(billingProfiles.userId, userId)));

  // Varsayılan silindiyse kalan en yeni profili varsayılan yap.
  if (current.isDefault) {
    const [next] = await listProfiles(userId);
    if (next) {
      await db.update(billingProfiles).set({ isDefault: true }).where(eq(billingProfiles.id, next.id));
    }
  }
  return { ok: true as const };
}
