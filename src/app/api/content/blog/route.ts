import { desc, eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { blogPosts } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// GET /api/content/blog
// Returns list of published blog posts. Supports filtering by category via query params.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let conditions = [eq(blogPosts.published, true)];
    if (category && category !== 'all') {
      conditions.push(eq(blogPosts.category, category));
    }

    const rows = await db
      .select()
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.createdAt));

    return json(rows);
  } catch (error: any) {
    console.error('Blog API Error:', error);
    return errorJson('Blog yazıları yüklenirken hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
