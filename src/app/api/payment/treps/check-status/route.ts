import type { NextRequest } from 'next/server';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { verifyPayment } from '@/lib/payment/service';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

/**
 * GET /api/payment/treps/check-status?token=…
 *
 * Bir ödemenin güncel durumunu Treps'e sorar. Kullanıcı callback'e dönmeden
 * sekmeyi kapattığında sonuç sayfasının durumu tazelemesi için kullanılır.
 *
 * @param token - HPP tokenı (HST-…) veya sipariş referansı (7L-…)
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return errorJson('token parametresi gerekli', 400);

  try {
    const result = await verifyPayment(token);
    return json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return errorJson(msg, 500);
  }
}
