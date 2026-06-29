import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { blogPosts } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

// GET /api/admin/blog
// Admin: Lists all blog posts (including unpublished drafts).
export async function GET(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) return errorJson('Yetkisiz', 401);
    const me = await getAccount(payload.sub);
    if (me?.role !== 'admin') return errorJson('Yetkisiz', 403);

    const rows = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));

    return json(rows);
  } catch (error: any) {
    console.error('Admin Blog List Error:', error);
    return errorJson('Blog yazıları listelenirken hata oluştu.', 500);
  }
}

// POST /api/admin/blog
// Admin: Creates a new blog post.
export async function POST(request: Request) {

  try {
    // 1) Authenticate and authorize admin role
    const payload = await getAuthPayload(request);
    if (!payload) return errorJson('Yetkisiz', 401);
    const me = await getAccount(payload.sub);
    if (me?.role !== 'admin') return errorJson('Yetkisiz', 403);

    // 2) Parse and validate body
    const body = await request.json();
    const { title, slug, content, category, imageUrl, published } = body;

    if (!title || !slug || !content || !category) {
      return errorJson('Lütfen tüm zorunlu alanları doldurun (Başlık, URL Yolu, İçerik, Kategori).', 400);
    }

    // Clean slug format (lowercase, replace spaces/specials)
    const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug is unique
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, formattedSlug))
      .limit(1);

    if (existing.length > 0) {
      return errorJson('Bu URL Yolu (Slug) zaten kullanımda. Lütfen başka bir tane seçin.', 400);
    }

    // 3) Insert new post
    const [newPost] = await db
      .insert(blogPosts)
      .values({
        title,
        slug: formattedSlug,
        content,
        category,
        imageUrl: imageUrl || null,
        published: published !== undefined ? published : true,
      })
      .returning();

    return json(newPost);
  } catch (error: any) {
    console.error('Admin Blog Create Error:', error);
    return errorJson('Blog yazısı eklenirken hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
