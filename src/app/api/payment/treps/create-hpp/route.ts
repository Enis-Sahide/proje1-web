import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { initiateHPPPayment } from '@/lib/payment/service';
import { getReportProduct, normalizeProductType } from '@/lib/payment/settings';
import { validateBilling, type BillingInput } from '@/lib/billing/validate';

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
 * Gövde: `{ orderId, billing: { fullName, phone?, isCompany, companyTitle?, taxNumber?, taxOffice?, address, city, district } }`
 * Fatura bilgileri sunucuda doğrulanır (TCKN/VKN checksum, zorunlu il/ilçe).
 * @returns `{ redirectUrl }` — kullanıcı bu adrese yönlendirilmelidir.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}) as Record<string, unknown>);
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';

    if (!orderId) return errorJson('Sipariş kimliği eksik', 400);

    const billingCheck = validateBilling((body.billing ?? {}) as BillingInput);
    if (!billingCheck.ok) return errorJson(billingCheck.error, 400);
    const billing = billingCheck.value;

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

    // Üye girişi varsa işlemi kullanıcıya bağla (zorunlu değil).
    const payload = await getAuthPayload(request);

    // Treps'e giden ad/soyad: kurumsalda ünvanı ad alanına koyarız.
    const parts = billing.displayName.split(/\s+/);

    const result = await initiateHPPPayment({
      guestOrderId: order.id,
      productType,
      amount,
      userId: payload?.sub ?? null,
      payer: {
        customerId: payload?.sub || order.id,
        name: parts[0] || 'Musteri',
        surname: parts.slice(1).join(' ') || '-',
        email: order.email,
        phone: billing.phone ?? undefined,
        city: billing.city,
        address: billing.address,
      },
      billing: {
        isCompany: billing.isCompany,
        taxNumber: billing.taxNumber,
        taxOffice: billing.taxOffice,
        address: billing.address,
        city: billing.city,
        district: billing.district,
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
