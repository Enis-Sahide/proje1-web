import { db } from '@/db/client';
import { invoiceSettings } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getInvoiceSettings, maskInvoiceSettings, MASKED } from '@/lib/billing/invoice-service';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

// GET /api/admin/invoice-settings — Faturalama ayarları (anahtarlar maskeli).
export async function GET(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);
    const row = await getInvoiceSettings();
    return json({ success: true, data: maskInvoiceSettings(row) });
  } catch (error: unknown) {
    console.error('Faturalama ayarları okunamadı:', error);
    return errorJson('Faturalama ayarları okunamadı', 500);
  }
}

// POST /api/admin/invoice-settings — Entegratör anahtarları + satıcı künyesi.
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const body = await request.json().catch(() => ({}));
    const existing = await getInvoiceSettings();

    const keep = (incoming: unknown, current: string | null) =>
      typeof incoming === 'string' && incoming && incoming !== MASKED ? incoming : current;
    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

    const values = {
      provider: 'birfatura',
      isActive: Boolean(body.isActive),
      testMode: body.testMode === undefined ? true : Boolean(body.testMode),
      apiKey: keep(body.apiKey, existing?.apiKey ?? null),
      secretKey: keep(body.secretKey, existing?.secretKey ?? null),
      integrationKey: keep(body.integrationKey, existing?.integrationKey ?? null),
      sellerTitle: str(body.sellerTitle),
      sellerTaxNumber: str(body.sellerTaxNumber),
      sellerTaxOffice: str(body.sellerTaxOffice),
      sellerAddress: str(body.sellerAddress),
      sellerDistrict: str(body.sellerDistrict),
      sellerCity: str(body.sellerCity),
      sellerEmail: str(body.sellerEmail),
      sellerPhone: str(body.sellerPhone),
      invoiceSeries: str(body.invoiceSeries) || 'EAR',
      defaultTaxRate: body.defaultTaxRate ? String(body.defaultTaxRate) : '20',
      autoIssue: body.autoIssue === undefined ? true : Boolean(body.autoIssue),
      updatedAt: new Date(),
    };

    const [row] = await db
      .insert(invoiceSettings)
      .values(values)
      .onConflictDoUpdate({ target: invoiceSettings.provider, set: values })
      .returning();

    return json({ success: true, data: maskInvoiceSettings(row) });
  } catch (error: unknown) {
    console.error('Faturalama ayarları kaydedilemedi:', error);
    return errorJson('Faturalama ayarları kaydedilemedi', 500);
  }
}
