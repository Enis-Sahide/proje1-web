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
    content: 'Modern dünyada Tanrı kavramına yaklaşmak, zihnimizin karmaşık labirentlerinde kolayca kaybolabilecek bir arayışa dönüştü. Pek çok dini ve felsefi tartışmanın odağında bir Yaratıcı gerçekliğinin varlığı sorgulanırken; aslında etrafımıza, evrenin işleyişine ve kendi varoluşumuza daha derin bir gözle baktığımızda, görünmez bir elin, üstün bir bilincin varlığını hissetmek kaçınılmaz hale geliyor. Yaratıcıyı kavrayabilmenin ilk ve en temel şartı, insanın kendini kavrayabilmesidir. Kendimizi anlamak ise doğayla, Gaia ile yani yaşamın bütünüyle bir olmaktan geçer.\n\nBugün gıdalarımızın genetiğiyle oynanması, sentetik tabanlı ayakkabılarla toprak temasımızın kesilmesi ve evlerimizde kullandığımız sentetik malzemeler bizi Yaratıcı\'nın kutsal geometrisinden uzaklaştırıyor. Kolaylık adı altında çamaşır ve bulaşık makinesi gibi icatlarla su temasımızı azaltıyor, en büyük arınma ve şifa kaynağımızdan mahrum kalıyoruz. Yaratıcı bu dünyayı kusursuz bir matematik üzerine kurmuştur. Ancak modern yaşamda bu kutsal matematiği bozarak basit, yapay bir matematik kuruyor ve alt bilinçlere düşüyoruz.\n\nPeki bu yapay matematikten çıkıp bilincimizi yeniden yükseltmek ve Yaratıcı\'nın frekansına uyumlanmak için ne yapmalıyız? Çözüm, modern dünyanın bize dayattığı steril illüzyonu yıkarak hem dışımızdaki Gaia ile hem de içimizdeki doğayla barışmaktır.\n\nModern toplum bize sadece topraktan ve sudan iğrenmeyi değil, kendi bedenimizin en doğal döngülerinden de iğrenmeyi öğretmiştir. Terlemekten, bedensel kokulardan, tırnak ve saç uzamasından, hatta boşaltım sistemimizden utanır hale geldik. Oysa insan bedeni yaratılış gereği sürekli olarak alan, işleyen ve döngüyü tamamlamak üzere geri bırakan yaşayan bir organizmadır. Bize ait olan parçaları bedenimizden ayırırken onlara "kirli" veya "iğrenç" gözüyle bakmak, aslında Yaratıcı\'nın kurduğu o muazzam biyolojik döngüyü reddetmektir.\n\nTam da bu noktada, dualiteyi (iyi-kötü, temiz-kirli ayrımını) aşmak gerekir. Doğada hiçbir şey kaybolmaz ve hiçbir şey mutlak anlamda kirli değildir. Bizden "atık" olarak çıkan su, doğanın döngüsünde buharlaşır, yağmur olur ve nihayetinde tekrar içtiğimiz bardağa geri döner. Binlerce yıldır bu dünyada dönüp duran aynı kutsal su, hem arınmamızı sağlar hem de bizi o büyük bütünün parçası yapar. Neye, hangi gözle baktığımız; her şeyin arkasındaki bu kusursuz ve döngüsel matematiği görüp göremediğimiz hayati önem taşır. Yaratıcı\'nın frekansına yaklaşmak; iğrenmeyi ve yargılamayı bırakıp, bu muazzam döngünün kendisi olduğumuzu kabul etmekle başlar. Çünkü nihayetinde Yaratıcı dediğimiz o yüce kaynak, bu sonsuz döngünün ve her şeyin kendisinden başka bir şey değildir.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000',
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
