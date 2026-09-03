import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { blogPosts } from '../db/schema/blog';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  const markdownPath = path.join(process.cwd(), 'scratch/kabalistik-harita-ve-10-sefira.md');
  const content = fs.readFileSync(markdownPath, 'utf-8');

  const newPost = {
    title: 'Kozmik Matris ve Yaşam Ağacı: Hangi Haritayı Çalıştırıyorsun? 10 Sefira, 7 Çakra ve Yaratımın Anatomisi',
    slug: 'kozmik-matris-ve-yasam-agaci-hangi-haritayi-calistiriyorsun',
    content: content,
    imageUrl: '/mystic_kabbalah_tree.jpg',
    category: 'Ezoterik',
    published: true,
  };

  console.log('Ezoterik makale veritabanında kontrol ediliyor...');
  const existing = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, newPost.slug));

  if (existing.length > 0) {
    console.log('Makale mevcut. Güncelleniyor...');
    await db
      .update(blogPosts)
      .set({
        title: newPost.title,
        content: newPost.content,
        imageUrl: newPost.imageUrl,
        category: newPost.category,
        published: newPost.published,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.slug, newPost.slug));
    console.log('✅ Makale başarıyla güncellendi.');
  } else {
    console.log('Makale bulunamadı. Yeni kayıt ekleniyor...');
    await db.insert(blogPosts).values(newPost);
    console.log('✅ Makale veritabanına başarıyla eklendi.');
  }

  await pool.end();
}

main().catch(async (e) => {
  console.error('❌ Hata oluştu:', e);
  await pool.end();
  process.exit(1);
});
