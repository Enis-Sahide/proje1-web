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
        .select({ title: blogPosts.title, summary: blogPosts.summary })
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
        .limit(1);

      if (rows.length > 0) {
        return {
          title: `${rows[0].title} | 7Layers Blog`,
          description: rows[0].summary || `${rows[0].title} yazısını okuyun ve bilincinizi yükseltin.`,
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
