import { Metadata } from 'next';
import { db } from '@/db/client';
import { blogPosts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import React from 'react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    if (slug) {
      const rows = await db
        .select({ title: blogPosts.title, content: blogPosts.content })
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
        .limit(1);

      if (rows.length > 0) {
        const cleanDescription = rows[0].content
          ? rows[0].content.replace(/<[^>]*>/g, '').substring(0, 155) + '...'
          : `${rows[0].title} yazısını okuyun ve bilincinizi yükseltin.`;
        return {
          title: `${rows[0].title} | 7Layers Blog`,
          description: cleanDescription,
        };
      }
    }
  } catch (e) {
    console.error('Failed to generate dynamic metadata for blog post:', e);
  }
  return {
    title: '7Layers Blog - Kadim Bilgelik Kütüphanesi',
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
