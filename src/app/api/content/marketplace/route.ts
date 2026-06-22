import { db } from '@/db/client';
import { productCategories, vendors, products } from '@/db/schema';
import { json, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// { CATEGORIES, VENDORS, PRODUCTS } şekillerini orijinaliyle döndürür.
export async function GET() {
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
