import { MetadataRoute } from 'next';
import { db } from '@/db/client';
import { blogPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.7layers.tr';

  // 1. Static/Main routes
  const staticRoutes = [
    '',
    '/test',
    '/membership',
    '/privacy',
    '/explore',
    '/meditation',
    '/breathwork',
    '/vip-teknolojiler',
    '/blog',
    '/analysis',
    '/analysis/schumann',
    '/analysis/astrology',
    '/analysis/chakra',
    '/analysis/human-design',
    '/analysis/kabbalah',
    '/analysis/numerology',
    '/analysis/transits',
    '/kadim-dersler',
    '/kadim-dersler/akupunktur',
    '/kadim-dersler/astroloji',
    '/kadim-dersler/duygusal-hastaliklar',
    '/kadim-dersler/human-design',
    '/kadim-dersler/kabbalah',
    '/kadim-dersler/numeroloji',
    '/kadim-dersler/rune',
    '/kadim-dersler/sembolizm',
    '/kadim-dersler/tarot',
    '/kadim-dersler/yoga',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : (route === '/test' ? 0.9 : 0.8),
  }));

  // 2. Fetch published blog posts from DB for dynamic indexing
  let dynamicBlogRoutes: any[] = [];
  try {
    const posts = await db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.published, true));

    dynamicBlogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error generating dynamic blog routes for sitemap:', error);
  }

  return [...staticRoutes, ...dynamicBlogRoutes];
}
