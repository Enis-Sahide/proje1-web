import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { reportProducts } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

/**
 * GET /api/payment/products
 *
 * Satıştaki rapor ürünlerinin herkese açık listesi (id, ad, fiyat).
 * Checkout sayfası fiyatı buradan okur; istemcide sabit fiyat tutulmaz.
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: reportProducts.id,
        name: reportProducts.name,
        description: reportProducts.description,
        price: reportProducts.price,
        currency: reportProducts.currency,
      })
      .from(reportProducts)
      .where(eq(reportProducts.isActive, true))
      .orderBy(asc(reportProducts.sort));

    return json({ success: true, data: rows });
  } catch (error: unknown) {
    console.error('Ürünler okunamadı:', error);
    return errorJson('Ürünler okunamadı', 500);
  }
}
