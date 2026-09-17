import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';
import { BLOG_POSTS } from '../src/db/seedExtra';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  for (const post of BLOG_POSTS) {
    const existing = await db
      .select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.slug, post.slug));

    if (existing.length === 0) {
      console.log(`Inserting: ${post.title}`);
      await db.insert(schema.blogPosts).values({
        title: post.title,
        slug: post.slug,
        content: post.content,
        imageUrl: post.imageUrl,
        category: post.category,
        published: post.published,
        createdAt: post.createdAt,
      });
    } else {
      console.log(`Updating existing: ${post.title}`);
      await db
        .update(schema.blogPosts)
        .set({
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl,
          category: post.category,
          published: post.published,
        })
        .where(eq(schema.blogPosts.slug, post.slug));
    }
  }

  console.log('Sync completed successfully!');
  await pool.end();
}

main().catch((err) => {
  console.error('Error syncing blog posts:', err);
  process.exit(1);
});
