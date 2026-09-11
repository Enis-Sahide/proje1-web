import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { initiateHPPPayment } from '@/lib/payment/service';
import { getReportProduct, normalizeProductType } from '@/lib/payment/settings';
import { getProfile } from '@/lib/billing/profile-service';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

/**
 * POST /api/payment/treps/create-hpp
 *
 * Var olan bir sipariş için Treps ödeme sayfası açar.
 * Tutar daima sunucuda `report_products` üzerinden belirlenir; istemciden
 * gelen fiyat bilgisine güvenilmez.
 *
 * Gövde: `{ orderId, billingProfileId }`
 * Fatura bilgileri kullanıcının kayıtlı fatura profilinden alınır ve işleme
 * KOPYALANIR (profil sonradan değişse bile fatura sabit kalır).
 * @returns `{ redirectUrl }` — kullanıcı bu adrese yönlendirilmelidir.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}) as Record<string, unknown>);
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';

    if (!orderId) return errorJson('Sipariş kimliği eksik', 400);

    // Satın alma üyelik gerektirir; fatura profili kullanıcıya ait olmalı.
    const payload = await getAuthPayload(request);
    if (!payload) return errorJson('Fatura kesebilmek için giriş yapmalısınız', 401);

    const billingProfileId = typeof body.billingProfileId === 'string' ? body.billingProfileId : '';
    if (!billingProfileId) return errorJson('Fatura profili seçilmedi', 400);
    const profile = await getProfile(payload.sub, billingProfileId);
    if (!profile) return errorJson('Fatura profili bulunamadı', 404);

    const [order] = await db.select().from(guestOrders).where(eq(guestOrders.id, orderId));
    if (!order) return errorJson('Sipariş bulunamadı', 404);
    if (order.paymentStatus === 'success') {
      return errorJson('Bu sipariş zaten ödenmiş', 409);
    }

    const productType = normalizeProductType(order.analysisType);
    const product = await getReportProduct(productType);
    if (!product || !product.isActive) {
      return errorJson('Bu rapor türü şu anda satışta değil', 400);
    }

    const amount = Number(product.price);
    if (!Number.isFinite(amount) || amount <= 0) {
      return errorJson('Ürün fiyatı geçersiz', 500);
    }

    // Sipariş tutarı fiyat değiştiyse güncellenir.
    if (order.amount !== Math.round(amount)) {
      await db
        .update(guestOrders)
        .set({ amount: Math.round(amount) })
        .where(eq(guestOrders.id, orderId));
    }

    // Treps'e giden ad/soyad: kurumsalda ünvanı ad alanına koyarız.
    const parts = profile.title.split(/\s+/);

    const result = await initiateHPPPayment({
      guestOrderId: order.id,
      productType,
      amount,
      userId: payload.sub,
      payer: {
        customerId: payload.sub,
        name: parts[0] || 'Musteri',
        surname: parts.slice(1).join(' ') || '-',
        email: profile.email || order.email,
        phone: profile.phone ?? undefined,
        city: profile.city,
        address: profile.address,
      },
      billing: {
        profileId: profile.id,
        isCompany: profile.type === 'company',
        taxNumber: profile.taxNumber,
        taxOffice: profile.taxOffice,
        address: profile.address,
        city: profile.city,
        district: profile.district,
      },
    });

    if (!result.success) return errorJson(result.error || 'Ödeme başlatılamadı', 502);

    return json({
      success: true,
      redirectUrl: result.redirectUrl,
      externalOrderId: result.externalOrderId,
      amount,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[create-hpp]', msg);
    return errorJson(msg, 500);
  }
}
