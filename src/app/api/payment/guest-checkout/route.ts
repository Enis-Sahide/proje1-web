import { randomBytes } from 'node:crypto';
import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getReportProduct, normalizeProductType } from '@/lib/payment/settings';

import { z } from 'zod';
import { birthDataSchema, formatZodError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const apiGuestCheckoutSchema = z.object({
  email: z.string().trim().toLowerCase().email('Geçerli bir e-posta adresi girin'),
  analysisType: z.string().min(2, 'Analiz türü zorunludur'),
  birthData: z.object({
    localDate: birthDataSchema.shape.date,
    localTime: birthDataSchema.shape.time,
    cityData: z.object({
      name: z.string().min(2, 'Şehir adı gereklidir'),
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
      tz: z.string().optional(),
      country: z.string().optional(),
    }),
  }),
});

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
    const rawBody = await request.json().catch(() => ({}));
    const parsed = apiGuestCheckoutSchema.safeParse(rawBody);
    if (!parsed.success) {
      return errorJson(formatZodError(parsed.error), 400);
    }

    const { email, analysisType, birthData } = parsed.data;

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
