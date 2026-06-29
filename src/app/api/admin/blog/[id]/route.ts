import { eq, and, ne } from 'drizzle-orm';
import { db } from '@/db/client';
import { blogPosts } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

// PUT /api/admin/blog/[id]
// Admin: Updates an existing blog post.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return errorJson('Geçersiz id.', 400);

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

    const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug is unique among other posts
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, formattedSlug), ne(blogPosts.id, id)))
      .limit(1);

    if (existing.length > 0) {
      return errorJson('Bu URL Yolu (Slug) başka bir yazı tarafından kullanılıyor.', 400);
    }

    // 3) Update post
    const [updatedPost] = await db
      .update(blogPosts)
      .set({
        title,
        slug: formattedSlug,
        content,
        category,
        imageUrl: imageUrl || null,
        published: published !== undefined ? published : true,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();

    if (!updatedPost) {
      return errorJson('Güncellenecek yazı bulunamadı.', 404);
    }

    return json(updatedPost);
  } catch (error: any) {
    console.error('Admin Blog Update Error:', error);
    return errorJson('Blog yazısı güncellenirken hata oluştu.', 500);
  }
}

// DELETE /api/admin/blog/[id]
// Admin: Deletes a blog post.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return errorJson('Geçersiz id.', 400);

    // 1) Authenticate and authorize admin role
    const payload = await getAuthPayload(request);
    if (!payload) return errorJson('Yetkisiz', 401);
    const me = await getAccount(payload.sub);
    if (me?.role !== 'admin') return errorJson('Yetkisiz', 403);

    // 2) Delete post
    const [deletedPost] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();

    if (!deletedPost) {
      return errorJson('Silinecek yazı bulunamadı.', 404);
    }

    return json({ message: 'Yazı başarıyla silindi.', id: deletedPost.id });
  } catch (error: any) {
    console.error('Admin Blog Delete Error:', error);
    return errorJson('Blog yazısı silinirken hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
