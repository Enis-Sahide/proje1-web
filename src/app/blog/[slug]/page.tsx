import React from 'react';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { blogPosts } from '@/db/schema';
import BlogDetailClient from './BlogDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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
    return {
      title: 'Yazı Bulunamadı - 7Layers Blog',
    };
  }

  const post = rows[0];
  const ogImageUrl = post.imageUrl
    ? post.imageUrl.startsWith('http')
      ? post.imageUrl
      : `https://www.7layers.tr${post.imageUrl}`
    : 'https://www.7layers.tr/logo.png';

  return {
    title: `${post.title} - 7Layers Blog`,
    description: post.content.substring(0, 160) + '...',
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160) + '...',
      url: `https://www.7layers.tr/blog/${post.slug}`,
      siteName: '7Layers',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content.substring(0, 160) + '...',
      images: [ogImageUrl],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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
    notFound();
  }

  const post = rows[0];

  // Increment view count
  await db
    .update(blogPosts)
    .set({ views: sql`${blogPosts.views} + 1` })
    .where(eq(blogPosts.id, post.id));

  return <BlogDetailClient post={post} />;
}
