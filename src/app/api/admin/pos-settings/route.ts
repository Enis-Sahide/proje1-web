import { db } from '@/db/client';
import { posSettings } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getPosSettings, maskPosSettings, MASKED } from '@/lib/payment/settings';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

// GET /api/admin/pos-settings — Treps ayarlarını maskelenmiş olarak döner.
export async function GET(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);
    const row = await getPosSettings();
    return json({ success: true, data: maskPosSettings(row) });
  } catch (error: unknown) {
    console.error('POS ayarları okunamadı:', error);
    return errorJson('POS ayarları okunamadı', 500);
  }
}

// POST /api/admin/pos-settings — Ayarları kaydeder (upsert).
// Maskelenmiş gelen gizli alanlar korunur, yalnızca yeni girilenler yazılır.
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const body = await request.json().catch(() => ({}));
    const existing = await getPosSettings();

    const merchantId = body.merchantId ? parseInt(String(body.merchantId), 10) : null;
    if (body.merchantId && Number.isNaN(merchantId)) {
      return errorJson('Merchant ID sayısal olmalıdır', 400);
    }

    // Maskelenmiş değer geldiyse mevcut sırrı koru.
    const keep = (incoming: unknown, current: string | null) =>
      typeof incoming === 'string' && incoming && incoming !== MASKED ? incoming : current;

    const values = {
      provider: 'treps',
      isActive: Boolean(body.isActive),
      apiBaseUrl: body.apiBaseUrl?.trim() || 'https://poapi.treps.tr',
      apiUsername: body.apiUsername?.trim() || null,
      apiPassword: keep(body.apiPassword, existing?.apiPassword ?? null),
      merchantId,
      commissionPlanCode: body.commissionPlanCode?.trim() || null,
      maxInstallment: body.maxInstallment ? parseInt(String(body.maxInstallment), 10) || 1 : 1,
      minAmount: body.minAmount ? String(body.minAmount) : '1',
      secure3dKey: keep(body.secure3dKey, existing?.secure3dKey ?? null),
      webhookSecret: keep(body.webhookSecret, existing?.webhookSecret ?? null),
      updatedAt: new Date(),
    };

    const [row] = await db
      .insert(posSettings)
      .values(values)
      .onConflictDoUpdate({ target: posSettings.provider, set: values })
      .returning();

    return json({ success: true, data: maskPosSettings(row) });
  } catch (error: unknown) {
    console.error('POS ayarları kaydedilemedi:', error);
    return errorJson('POS ayarları kaydedilemedi', 500);
  }
}
