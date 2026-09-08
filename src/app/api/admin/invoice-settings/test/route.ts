import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { invoiceSettings } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getInvoiceSettings, MASKED } from '@/lib/billing/invoice-service';
import { testConnection } from '@/lib/billing/providers/birfatura';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

/**
 * POST /api/admin/invoice-settings/test
 * Entegratör anahtarlarını kontör sorgusuyla doğrular.
 */
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const body = await request.json().catch(() => ({}));
    const saved = await getInvoiceSettings();

    const pick = (incoming: unknown, current: string | null | undefined) =>
      typeof incoming === 'string' && incoming && incoming !== MASKED ? incoming : current;

    const apiKey = pick(body.apiKey, saved?.apiKey);
    const secretKey = pick(body.secretKey, saved?.secretKey);
    const integrationKey = pick(body.integrationKey, saved?.integrationKey);
    const testMode = body.testMode === undefined ? saved?.testMode ?? true : Boolean(body.testMode);

    if (!apiKey || !secretKey || !integrationKey) {
      return json({
        success: false,
        message: 'Test için API Key, Secret Key ve Integration Key gereklidir.',
      });
    }

    const result = await testConnection({ apiKey, secretKey, integrationKey, testMode });

    if (saved) {
      await db
        .update(invoiceSettings)
        .set({ lastTestedAt: new Date(), lastTestResult: result.success })
        .where(eq(invoiceSettings.provider, 'birfatura'));
    }

    return json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return json({ success: false, message: msg });
  }
}
