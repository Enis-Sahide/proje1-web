import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { blogPosts } from '../db/schema/blog';
import { eq } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  const newPost = {
    title: 'Modern İllüzyon: Yapay Matematikten Kutsal Geometriye ve Özsel Arınmaya',
    slug: 'modern-illuzyon-yapay-matematikten-kutsal-geometriye',
    content: 'Modern dünyada Tanrı kavramına yaklaşmak, zihnimizin karmaşık labirentlerinde kolayca kaybolabilecek bir arayışa dönüştü. Pek çok dini ve felsefi tartışmanın odağında bir Yaratıcı gerçekliğinin varlığı sorgulanırken; aslında etrafımıza, evrenin işleyişine ve kendi varoluşumuza daha derin bir gözle baktığımızda, görünmez bir elin, üstün bir bilincin varlığını hissetmek kaçınılmaz hale geliyor. Yaratıcıyı kavrayabilmenin ilk ve en temel şartı, insanın kendini kavrayabilmesidir. Kendimizi anlamak ise doğayla, Gaia ile yani yaşamın bütünüyle bir olmaktan geçer.\n\nBugün gıdalarımızın genetiğiyle oynanması, sentetik tabanlı ayakkabılarla toprak temasımızın kesilmesi ve evlerimizde kullandığımız sentetik malzemeler bizi Yaratıcı\'nın kutsal geometrisinden uzaklaştırıyor. Kolaylık adı altında çamaşır ve bulaşık makinesi gibi icatlarla su temasımızı azaltıyor, en büyük arınma ve şifa kaynağımızdan mahrum kalıyoruz. Yaratıcı bu dünyayı kusursuz bir matematik üzerine kurmuştur. Ancak modern yaşamda bu kutsal matematiği bozarak basit, yapay bir matematik kuruyor ve alt bilinçlere düşüyoruz.\n\nTekrar yükselmek ve Yaratıcıya yaklaşmak için iğrenme duygusundan ve yargılardan arınarak, bedenimizin doğal döngülerini kabul etmeli ve Gaia ile bütünleşmeliyiz.',
    imageUrl: 'https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/runes/fehu.png',
    category: 'Kişisel Gelişim',
    published: true,
  };

  console.log('Checking if post already exists...');
  const existing = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, newPost.slug));

  if (existing.length > 0) {
    console.log('Post already exists. Updating...');
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
    console.log('✅ Post updated successfully.');
  } else {
    console.log('Post does not exist. Inserting...');
    await db.insert(blogPosts).values(newPost);
    console.log('✅ Post inserted successfully.');
  }

  await pool.end();
}

main().catch(async (e) => {
  console.error('❌ Error executing script:', e);
  await pool.end();
  process.exit(1);
});
