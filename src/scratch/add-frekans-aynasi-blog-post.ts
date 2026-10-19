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
    title: 'Neden Hep Aynı Kısırdöngüye Giriyorsun? Zihnindeki 4 Bilinç Âlemi ve Doğum Haritanın Gizli Katmanı',
    slug: 'neden-hep-ayni-kisirdonguye-giriyorsun-frekans-aynasi',
    content: `Hiç gün içinde kendini şu cümleleri kurarken ya da içinden geçirirken yakaladın mı?

> *"Benim dediğim doğru, neden anlamıyorlar?"*
> *"Zaten kimse beni gerçekten anlamıyor..."*
> *"Bu sistem asla çalışmaz, her şey hatalı!"*
> *"Zihnim bir saniye bile susmuyor, her şeyi kontrol etmeye çalışmaktan tükendim."*

Çoğumuz bu tepkilerin basit bir sinir anı, yorgunluk ya da günlük stres olduğunu düşünürüz. Oysa kadim bilgelik ve modern psikoloji çok net bir gerçeği fısıldar: **Bu sesler sana ait değil; o an haritanda tetiklenen bilinç katmanına ait.**

Peki ama aynı insan, bazen küçük bir engelde öfkeyle savunmaya geçerken; başka bir gün aynı engeli nasıl büyük bir bilgelik, sükûnet ve sevgiyle karşılayabiliyor? 

Cevap, doğduğun andaki gökyüzü haritan ile şu an başının üstünde dönen canlı transitlerin buluştuğu o görünmez noktada gizli: **Frekans Aynası.**

---

### Doğum Haritan Bir Başlangıçtır; Asıl Soru: Şu An Hangi Haritanı Çalıştırıyorsun?

Geleneksel astroloji bize yıllarca tek bir doğum haritası sundu. Ancak insan tek bir boyuttan ibaret değildir. Kadim Kabalistik gelenek ve modern ezoterizm, insanın aynı anda **4 farklı bilinç âleminde** var olduğunu öğretir:

1. **1. Assiah (Fiziksel Eylem & Madde Boyutu):**  
   Otomatik tepkilerimiz, haklı çıkma hırsımız, bedenimizin verdiği anlık gerilim ve savunma mekanizmamız. Eğer öfkeyle çatışıyor ya da dış dünyayı suçluyorsanız, Assiah boyutunun gölgesindesinizdir.
2. **2. Yetzirah (Duygu, Bilinçaltı & Kalp Boyutu):**  
   İçimizdeki çocuğun *"Beni görün, beni olduğum gibi sevin, beni anlayın"* diyen kırılgan ama şifaya en açık sesi. Hislerinizi bastırmak yerine kalbinize sarıldığınızda bu boyut uyanır.
3. **3. Beriyah (Yüksek Zihin & Kadersel Bilgelik):**  
   Olaylara kuşbakışı bakan, *"Bu deneyim beni hangi erdemle olgunlaştırıyor?"* diyebilen stratejik ve bilge akıl. Dramaya kapılmadan bütüne hizmet eden çözümü gördüğünüz boyut.
4. **4. Atzilut (Kozmik Birlik & Saf Ruh):**  
   Zihnin tamamen sustuğu, kalbin evrensel birliğe ve ilahi akışa güvenle teslim olduğu saf dinginlik. Ayrılık yanılsamasının bittiği mutlak huzur.

Gökyüzündeki gezegenler doğum haritanızın hangi evine dokunursa dokunsun; hayatınızın o alanında (ilişkilerde, kariyerde, parada veya ailede) bir sınav başlar. Ve siz o gün, bu 4 boyuttan birini seçerek yaşarsınız.

---

### Cebinizdeki Canlı Kozmik Pusula: 7Layers

İşte tam bu noktada **7Layers**, sıradan burç fallarının ve statik analizlerin bittiği yerde yepyeni bir devir başlatıyor.

**7Layers Web ve Mobil Uygulaması**, sadece ömür boyu değişmeyen doğum haritanızı çıkarmakla kalmıyor; **Canlı Frekans Aynası** teknolojisiyle tam şu an gökyüzünün haritanıza uyguladığı sınavı anlık olarak teşhis ediyor:

- **Tetiklenen Yaşam Alanı:** Bugün ikili ilişkileriniz (7. Ev) mi, öz-değeriniz (2. Ev) mi, kariyeriniz (10. Ev) mi yoksa iletişim diliniz (3. Ev) mi sınavda?
- **Anlık Farkındalık Aynası:** Olaylara öfkeyle (Assiah) mi tepki veriyorsunuz, yoksa bilge bir sükûnetle (Beriyah) mi yaklaşıyorsunuz?
- **Human Design & Enerji Tipiniz:** Karar alırken zihninize mi güvenmelisiniz, yoksa sakral otoritenize mi?
- **Gezegen Saatleri & Canlı Transitler:** Günün hangi saatinde harekete geçmeli, ne zaman içsel inzivaya çekilmelisiniz?

---

### Kendini Keşfetme Sırası Sende: Bugün Hangi Frekanstasın?

Kendi kullanım kılavuzuna sahip olmadan bir hayat yaşamak, fırtınalı denizde pusulasız yol almaya benzer. Kısırdöngüleri kırmak, savunmayı bırakıp içindeki gücü şefkatle uyandırmak sandığından çok daha kolay.

Şimdi web sitemizden veya mobil uygulamamızdan **Frekans Aynası** analizine girerek doğum bilgilerinizi yazın; gökyüzünün şu an haritanıza uyguladığı sınavı ve içinizdeki 4 âlemin yansımasını **ücretsiz keşfedin!**`,
    imageUrl: '/knowing_oneself_mirror.jpg',
    category: 'Astroloji',
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
