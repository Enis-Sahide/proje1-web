import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { reportProducts } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { normalizeProductType } from '@/lib/payment/settings';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

// GET /api/admin/report-products — Satılan raporlar ve fiyatları.
export async function GET(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);
    const rows = await db.select().from(reportProducts).orderBy(asc(reportProducts.sort));
    return json({ success: true, data: rows });
  } catch (error: unknown) {
    console.error('Ürünler okunamadı:', error);
    return errorJson('Ürünler okunamadı', 500);
  }
}

// POST /api/admin/report-products — Tek bir ürünü kaydeder (upsert).
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const body = await request.json().catch(() => ({}));
    const id = normalizeProductType(body.id);
    if (!id) return errorJson('Ürün kimliği gerekli', 400);

    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return errorJson('Fiyat pozitif bir sayı olmalıdır', 400);
    }

    const taxRate = body.taxRate === undefined ? 20 : Number(body.taxRate);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return errorJson('KDV oranı 0-100 aralığında olmalıdır', 400);
    }

    const values = {
      id,
      name: String(body.name || '').trim() || id,
      description: body.description?.trim() || null,
      price: String(price),
      taxRate: String(taxRate),
      currency: body.currency?.trim() || 'TRY',
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      sort: Number.isFinite(Number(body.sort)) ? Number(body.sort) : 0,
      updatedAt: new Date(),
    };

    const [row] = await db
      .insert(reportProducts)
      .values(values)
      .onConflictDoUpdate({ target: reportProducts.id, set: values })
      .returning();

    return json({ success: true, data: row });
  } catch (error: unknown) {
    console.error('Ürün kaydedilemedi:', error);
    return errorJson('Ürün kaydedilemedi', 500);
  }
}
