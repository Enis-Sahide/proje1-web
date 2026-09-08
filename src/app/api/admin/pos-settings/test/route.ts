import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { posSettings } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getPosSettings, MASKED } from '@/lib/payment/settings';
import { TrepsClient } from '@/lib/payment/treps/client';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

/**
 * POST /api/admin/pos-settings/test
 *
 * Treps'e bağlanmayı dener. Gövdede anahtar gelirse onlarla (kaydetmeden),
 * gelmezse kayıtlı ayarlarla test eder. Sonuç `pos_settings`'e işlenir.
 */
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const body = await request.json().catch(() => ({}));
    const saved = await getPosSettings();

    const apiBaseUrl = body.apiBaseUrl?.trim() || saved?.apiBaseUrl || 'https://poapi.treps.tr';
    const apiUsername = body.apiUsername?.trim() || saved?.apiUsername;
    // Maskelenmiş şifre ile test edilmek isteniyorsa kayıtlı şifreyi kullan.
    const apiPassword =
      body.apiPassword && body.apiPassword !== MASKED ? body.apiPassword : saved?.apiPassword;
    const merchantId = body.merchantId
      ? parseInt(String(body.merchantId), 10)
      : saved?.merchantId;

    if (!apiUsername || !apiPassword || !merchantId) {
      return json({
        success: false,
        message: 'Test için kullanıcı adı, şifre ve Merchant ID gereklidir.',
      });
    }

    const client = new TrepsClient({ apiBaseUrl, apiUsername, apiPassword, merchantId });
    const result = await client.testConnection();

    if (saved) {
      await db
        .update(posSettings)
        .set({ lastTestedAt: new Date(), lastTestResult: result.success })
        .where(eq(posSettings.provider, 'treps'));
    }

    return json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return json({ success: false, message: msg });
  }
}
