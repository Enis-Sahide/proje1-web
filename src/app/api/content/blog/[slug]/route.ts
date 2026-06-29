import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { blogPosts } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// GET /api/content/blog/[slug]
// Returns details of a single published blog post matching the slug.
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    if (!slug) {
      return errorJson('Geçersiz parametre.', 400);
    }

    const rows = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
      .limit(1);

    if (rows.length === 0) {
      return errorJson('Blog yazısı bulunamadı.', 404);
    }

    return json(rows[0]);
  } catch (error: any) {
    console.error('Blog Detail API Error:', error);
    return errorJson('Yazı yüklenirken hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
