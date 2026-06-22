import { db } from '@/db/client';
import { productCategories, vendors, products } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Keşfet (Mağaza) → giriş zorunlu.
export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const [categories, vendorRows, productRows] = await Promise.all([
    db.select().from(productCategories),
    db.select().from(vendors),
    db.select().from(products),
  ]);
  return json({
    categories: categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
    vendors: vendorRows.map((v) => ({
      id: v.id,
      name: v.name,
      description: v.description,
      avatar: v.avatar,
      rating: v.rating != null ? Number(v.rating) : null,
      isFeatured: v.isFeatured,
    })),
    products: productRows.map((p) => ({
      id: p.id,
      vendorId: p.vendorId,
      categoryId: p.categoryId,
      name: p.name,
      description: p.description,
      price: p.price != null ? Number(p.price) : null,
      image: p.image,
      stock: p.stock,
    })),
  });
}

export const OPTIONS = preflight;
