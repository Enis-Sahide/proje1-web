import { randomBytes } from 'node:crypto';
import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getReportProduct, normalizeProductType } from '@/lib/payment/settings';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

/**
 * POST /api/payment/guest-checkout
 *
 * Rapor siparişini oluşturur. Ödeme bu adımda alınmaz; istemci ardından
 * `/api/payment/treps/create-hpp` çağırıp kullanıcıyı Treps'e yönlendirir.
 *
 * Fiyat daima `report_products` tablosundan okunur.
 */
export async function POST(request: Request) {
  try {
    const { email, analysisType, birthData } = await request.json().catch(() => ({}));
    if (!email || !analysisType || !birthData) {
      return errorJson('E-posta, analiz türü veya doğum verileri eksik', 400);
    }

    const productType = normalizeProductType(analysisType);
    const product = await getReportProduct(productType);
    if (!product || !product.isActive) {
      return errorJson('Bu rapor türü şu anda satışta değil', 400);
    }

    const amount = Number(product.price);
    if (!Number.isFinite(amount) || amount <= 0) {
      return errorJson('Ürün fiyatı tanımlı değil', 500);
    }

    const orderId = `GORD_${randomBytes(8).toString('hex')}`;

    await db.insert(guestOrders).values({
      id: orderId,
      email,
      analysisType: productType,
      birthData,
      amount: Math.round(amount),
      paymentStatus: 'pending',
    });

    return json({
      success: true,
      orderId,
      amount,
      productName: product.name,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('Guest checkout error:', msg);
    return errorJson('Sipariş oluşturulamadı: ' + msg, 500);
  }
}
