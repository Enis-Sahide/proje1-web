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
    title: 'Aklı Doğru Kullanmayı Bilmeyenin İçgüdüsü de Körelir',
    slug: 'akli-dogru-kullanmayi-bilmeyenin-icgudusu-de-koreler',
    content: 'Modern rasyonalizm, yüzyıllardır insan bilincini keskin sınırlar ve dualitelerle bölmeye çalıştı. Bu yapay sınırların en belirgin olanlarından biri de \'akıl\' ile \'içgüdü\' arasına çekilen yapay duvardır. Zihnin analitik, hesapçı ve doğrusal işleyişi (akıl) yüceltilirken; bedenin, ruhun ve doğanın o derin, kadim fısıltısı (içgüdü) vahşi, kontrolsüz ve güvenilmez ilan edildi. Oysa ezoterik öğretiler ve yaşamın gizli geometrisi bize bambaşka bir gerçeği fısıldar: Akıl ve içgüdü birbirinin düşmanı değil, aynı bilincin iki farklı frekansıdır. Ve en önemlisi; aklı doğru kullanmayı bilmeyenin içgüdüsü de körelir.\n\n### Aklın İllüzyonu ve Yanlış Kullanımı\nAklı doğru kullanmamak, sadece zihinsel tembellik anlamına gelmez. Çoğu zaman aklı \'aşırı\' ama \'yanlış\' yönde kullanmak da bu kapsama girer. Modern insan, aklını sürekli bir endişe, kontrol mekanizması ve yapay kurgular üretmek için kullanır. Doğanın döngüsel ve kutsal matematiğinden koparak; sadece ego, hayatta kalma arzusu ve toplumsal korkular üzerine kurulu yapay bir matematik inşa eder. Zihin sürekli geçmişin pişmanlıkları ve geleceğin kaygıları arasında mekik dokurken, \'şimdi\'nin getirdiği bilgiyi işleme yeteneğini kaybeder.\n\nAklı doğru kullanamayan birey, dogmaların, manipülasyonların ve sanal illüzyonların esiri olur. Zihin kirlendiğinde ve kendi doğasından uzaklaştığında, sadece mantıklı düşünme yetisi zarar görmez; aynı zamanda insanın en temel hayatta kalma ve yön bulma pusulası olan içgüdüleri de bu kirlilikten nasibini alır.\n\n### İçgüdünün Sessiz İstilası ve Körelme\nİçgüdü, evrimin ve ruhun milyonlarca yıllık süzgecinden geçerek bedenimize kodlanmış olan kozmik bir kütüphanedir. Ne zaman tehlikede olduğumuzu, kime güvenebileceğimizi, hangi besinin bize şifa vereceğini ya da hangi yola sapmamız gerektiğini fısıldayan o sessiz sestir. Ancak bu sesin duyulabilmesi için alıcının (yani zihnin) berrak olması gerekir.\n\nAklını nefretle, önyargıyla, aşırı rasyonalizasyonla veya sürekli bir anksiyete haliyle meşgul eden biri, içgüdülerin o ince, zarif ve hafif fısıltılarını duyamaz hale gelir. Zihindeki gürültü o kadar yüksek ve kaotiktir ki, ruhun ve bedenin derinliklerinden gelen sezgisel sinyaller bu statik gürültünün altında ezilir.\n\nKörelme süreci tam da burada başlar. Kullanılmayan veya sürekli bastırılan her yeti gibi, içgüdü de zamanla zayıflar. Aklın kurduğu yapay illüzyonları gerçek sanan insan, bedeninin verdiği mikroskobik tepkileri (kalp atışının değişmesi, mide kasılması, auranın daralması gibi) rasyonel bahanelerle geçiştirir. \'Mantıklı olan bu\' diyerek kalbinin sesini susturur. Nihayetinde, pusulası bozulan bir gemi gibi, yaşamın fırtınalarında nereye savrulacağını bilemez hale gelir.\n\n### Parazitlenmiş İçgüdüler\nAklı doğru kullanmadığımızda içgüdüler sadece körelmekle kalmaz; aynı zamanda sapar ve hastalanır. Doğal olan korunma içgüdüsü, sürekli tetikte olma haliyle paranoyaya dönüşür. Sağlıklı beslenme ve yaşamda kalma dürtüsü, yapay hazların ve bağımlılıkların kölesi olur. Zihin, içgüdüden gelen saf sinyalleri kendi filtrelerine göre bükerek yalan yanlış yorumlar. Sonuçta birey, sezgisel hissettiğini sandığı şeylerin aslında sadece kendi korkularının veya egosunun yansımaları olduğunu fark edemez. Kendini dinlediğini sanırken, aslında sadece zihnindeki parazitleri dinlemektedir.\n\n### İki Kutbu Birleştirmek: Zihni Berraklaştırmak\nAklı doğru kullanmak; onu susturmak veya yok saymak değil, onun sınırlarını bilmek ve onu ruhun hizmetkarı yapmaktır. Zihin berraklaştığında, yani gereksiz bilgi çöplüğünden, kaygılardan ve yapay matematiklerden arındığında, içgüdülerin parlayacağı pürüzsüz bir ayna haline gelir.\n\nKadim ilimler der ki: Yukarısı nasılsa aşağısı da öyledir. Gökyüzündeki kozmik düzen (akıl/logo) bedenimizdeki hücresel bilgelikle (içgüdü/sezgi) tam bir uyum içinde çalışmalıdır. Aklını yüksek kozmik yasalara, kutsal geometriye ve Gaia\'nın döngülerine hizalayan insan, içgüdülerini de en saf haliyle özgür bırakır. Bu entegrasyon sağlandığında, kişi artık düşünerek karar vermez; doğru olanı zaten bilir ve o doğrultuda akar.\n\nTekamül yolculuğunda akıl bizim haritamız ise, içgüdü bizim pusulamızdır. Haritayı okumayı beceremeyen bir zihin, pusulayı da yanlış yorumlayacak ve en nihayetinde onun dilini tamamen unutacaktır. Zihninizi arındırın, aklınızı kutsal olanla hizalayın; göreceksiniz ki içinizdeki o kadim pusula, sizi asla şaşırtmayacak bir keskinlikle yeniden çalışmaya başlayacaktır.',
    imageUrl: '/mind_and_instinct.jpg',
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
