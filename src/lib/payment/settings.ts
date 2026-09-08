import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { posSettings, reportProducts } from '@/db/schema';
import { TrepsClient } from './treps/client';

export const MASKED = '••••••••';

export type PosSettingsRow = typeof posSettings.$inferSelect;

/** `pos_settings` satırını okur (yoksa null). */
export async function getPosSettings(): Promise<PosSettingsRow | null> {
  const [row] = await db.select().from(posSettings).where(eq(posSettings.provider, 'treps'));
  return row ?? null;
}

/**
 * Admin paneline gönderilecek güvenli hâl: gizli alanlar maskelenir,
 * yalnızca "tanımlı mı" bilgisi sızar.
 */
export function maskPosSettings(row: PosSettingsRow | null) {
  if (!row) return null;
  return {
    ...row,
    apiPassword: row.apiPassword ? MASKED : '',
    secure3dKey: row.secure3dKey ? MASKED : '',
    webhookSecret: row.webhookSecret ? MASKED : '',
  };
}

/**
 * Kayıtlı anahtarlarla hazır bir TrepsClient döner.
 *
 * @throws POS ayarı yoksa, pasifse veya zorunlu alanlar eksikse.
 */
export async function getTrepsClient(): Promise<TrepsClient> {
  const s = await getPosSettings();
  if (!s) throw new Error('POS ayarları bulunamadı. Admin panelinden Treps anahtarlarını girin.');
  if (!s.isActive) throw new Error('POS ayarları pasif durumda. Admin panelinden aktifleştirin.');
  if (!s.apiUsername || !s.apiPassword || !s.merchantId) {
    throw new Error('POS ayarları eksik (api_username / api_password / merchant_id).');
  }

  return new TrepsClient({
    apiBaseUrl: s.apiBaseUrl || 'https://poapi.treps.tr',
    apiUsername: s.apiUsername,
    apiPassword: s.apiPassword,
    merchantId: s.merchantId,
    commissionPlanCode: s.commissionPlanCode ?? undefined,
    maxInstallment: s.maxInstallment ?? undefined,
    secure3dKey: s.secure3dKey ?? undefined,
  });
}

// ─── Ürün / fiyat ────────────────────────────────────────────

export type ReportProductRow = typeof reportProducts.$inferSelect;

/** Rapor tipi kimliklerini tek biçime indirger (human_design → human-design). */
export function normalizeProductType(raw: string | null | undefined): string {
  const v = (raw || '').trim().toLowerCase();
  if (v === 'human_design') return 'human-design';
  return v;
}

/**
 * Satılan raporun fiyat/KDV bilgisini DB'den okur.
 * Fiyatlar admin panelinden yönetilir; kodda sabit fiyat yoktur.
 */
export async function getReportProduct(type: string): Promise<ReportProductRow | null> {
  const id = normalizeProductType(type);
  const [row] = await db.select().from(reportProducts).where(eq(reportProducts.id, id));
  return row ?? null;
}
