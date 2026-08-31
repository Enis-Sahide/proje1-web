import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { blogPosts } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// GET /api/content/blog/[slug]
// Returns details of a single published blog post matching the slug.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return errorJson('Geçersiz parametre.', 400);
    }

    const isDev = process.env.NODE_ENV === 'development';
    const condition = isDev
      ? eq(blogPosts.slug, slug)
      : and(eq(blogPosts.slug, slug), eq(blogPosts.published, true));

    const rows = await db
      .select()
      .from(blogPosts)
      .where(condition)
      .limit(1);

    if (rows.length === 0) {
      return errorJson('Blog yazısı bulunamadı.', 404);
    }

    const post = rows[0];

    // Increment view count
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.id, post.id));

    return json(post);
  } catch (error: any) {
    console.error('Blog Detail API Error:', error);
    return errorJson('Yazı yüklenirken hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
