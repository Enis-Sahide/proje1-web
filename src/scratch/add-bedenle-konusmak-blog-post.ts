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
    title: 'Bedenin Bir Makine Değil, Canlı Bir Ekosistem: Organlarınla Konuşmak ve Onları Onurlandırmak Gerçekte Ne Demek?',
    slug: 'bedeninle-konusmak-organlari-onurlandirmak-hucresel-bilinc',
    content: `Sosyal medyada son günlerde sıkça paylaşılan çarpıcı bir iddia dolaşıyor: 

> *"Berlinli doktorlar dikkat çekici bir olgu gözlemledi: Bedenleriyle konuşmaya başlayan kadınlar kronik hastalıklarından kurtuldu..."*

Bu paylaşımın altına gelen ilk ve en doğal tepkilerden biri ise şuydu:  
**"Nasıl konuşmaya? Bunu anlamadım ben... Karşımda bir insan varmış gibi mi konuşacağım?"**

Modern insanın zihni haklı olarak bu soruyla kilitlenir. Çünkü yüzyıllardır bize öğretilen Kartezyen tıp modeli; insan bedenini ruhsuz bir otomobil, organları da sadece aşındığında değiştirilen mekanik dişliler gibi tanımladı. Kalp bir pompa, mide bir asit kazanı, karaciğer ise kimyasal bir filtreydi...

Oysa kadim Doğu tıbbından modern kuantum biyolojisine ve epigenetiğe kadar uzanan devasa bir gerçek var: **Bedenin cansız bir et yığını değil; trilyonlarca bilinçli hücrenin ve her biri bağımsız bir zekaya sahip organların oluşturduğu canlı bir evrendir.**

Peki organlarınla konuşmak gerçekte nedir? Karşına bir sandalye çekip sohbet etmek mi, yoksa hücresel düzeyde bir barışma protokolü mü? Gelin bu gerçeği tüm katmanlarıyla açığa çıkaralım.

---

### Bütün ile Parça Bilinci: Sen Bir Orkestrasın, Organların Enstrümanlar

Çoğu insan kişisel gelişim yolculuğunda kendine aynada olumlamalar yapar: *"Kendimi seviyorum, güvendeyim, sağlıklıyım..."*  
Bu harika bir başlangıçtır, ancak **bütününle** konuşmaktır. 

Sen nasıl bu evrenin bir parçası olarak başlı başına bir canlıysan; bedenindeki her bir organ da senin içinde yaşayan **başlı başına bir canlıdır.**

Kendinle konuştuğunda tüm orkestraya *"Harika çalın"* dersin. Ancak yıllardır aşırı stresle gerilmiş bir çello (karaciğerin) ya da susturulmaktan nefesi kesilmiş bir flüt (akciğerlerin) varsa; sadece şefe seslenmek yetmez. **Her bir enstrümanın yanına tek tek eğilmek, onun akordunu dinlemek ve onu onurlandırmak gerekir.**

---

### Organların Duygusal Hafızası: Hangi Organ Neyi Taşır?

Nörobiyolog Dr. Candace Pert’ün *"Molecules of Emotion"* (Duygu Molekülleri) adlı çığır açan çalışmasında kanıtladığı gibi: **Zihin sadece kafatasının içinde değildir.** Zihnimiz, tüm organlarımıza ve hücrelerimize sinir uçları ve neuropeptidler aracılığıyla yayılmış durumdadır. Yaşadığınız her bastırılmış duygu, kimyasal bir tortu olarak belirli organların dokusuna kodlanır.

İşte tam da bu yüzden organları tek tek onurlandırmak zorundayız:

1. **Kalp (Sevgi, Kırgınlık ve Yaşam Aşkı):**  
   Sen uyurken, öfkeliyken, çalışırken sana hiç sormadan günde yaklaşık 100.000 kez atar. Hayatında aldığın her ihanet, sevgisizlik ve kapanma hissi kalbin etrafında görünmez bir zırh oluşturur. Kalp, sadece kan pompalamaz; bedeninin en güçlü elektromanyetik alanını yayar.
2. **Karaciğer (Bastırılmış Öfke, Hırs ve Zehir Filtresi):**  
   Geleneksel Çin Tıbbı'nda (TCM) karaciğer, "öfke ve sabır" evidir. Hem yediğin kimyasalları hem de yutkunup içine attığın haksızlıkları süzmek için gece gündüz mesai yapar. Sessizce tükenir ama kolay kolay şikayet etmez.
3. **Mide ve Bağırsaklar (İkinci Beyin & Hazım):**  
   Sadece yediklerini değil, hayatında sindiremediğin olayları, yüzleşmekten korktuğun gerçekleri ve kontrol etme hırsını hazmetmeye çalışır. "Mideye kramp girmesi" ya da huzursuz bağırsak, aslında organının sana: *"Bu durumu sindiremiyorum, bana yardım et"* deme şeklidir.
4. **Böbrekler (Korku ve Yaşam Enerjisi):**  
   Bilinçaltındaki derin varoluşsal korkular, gelecek endişesi ve güvensizlik hissi böbreklerin enerjisini tüketir.
5. **Akciğerler (Hüzün, Yas ve Yaşama Tutunma):**  
   Hayattan derin bir nefes almaktan korkmak, ertelenmiş yaslar ve keder akciğer dokularına yerleşir.

---

### Bedenle "Nasıl" Konuşulur? (Adım Adım Beden Diyaloğu)

Karşında bir insan varmış gibi konuşmak zorunda değilsin. Bedenin sözcüklerden ziyade **dikkat, niyet, sıcaklık ve frekansı** anlar. Hücrelerin dili elektromanyetiktir.

İşte Berlinli doktorların gözlemlediği ve kadim ustaların binlerce yıldır uyguladığı 4 adımlı diyalog protokolü:

#### Adım 1: Fiziksel Temas ve Odak (Elini Üzerine Koy)
Dikkatin nereye akarsa enerjin oraya akar. Örneğin miden mi ağrıyor veya kalbin mi sıkışıyor? Avucunun içini o organın üzerine yerleştir. Avuç içleri yoğun sinir uçları ve biyo-elektrik yayar. Gözlerini kapat ve nefesini doğrudan o organın altındaki avucuna gönder.

#### Adım 2: Onurlandırma ve Varlığını Kabul Etme
O organa bugüne kadar sanki senin bir kölenmiş gibi davrandığını fark et. Ona içinden veya fısıltıyla şunu söyle:  
> *"Seni fark ediyorum. Yıllardır beni hayatta tutmak için bir saniye bile durmadan, hiç şikayet etmeden çalıştığını biliyorum. Varlığını onurlandırıyorum."*

#### Adım 3: Özür ve Yükünü Hafifletme
Ona yüklediğin duygusal yüklerin sorumluluğunu üstlen:  
> *"Yaşadığım öfkeleri, korkuları ve sindiremediğim stresleri sana yüklediğim için senden özür dilerim. Seni zehirlemek niyetinde değildim. Artık bu yükü taşımak zorunda değilsin; güvendesin."*

#### Adım 4: Semptomu Düşman Değil, Mesaj Olarak Dinlemek
Ağrı, sancı veya kronik bir semptom ortaya çıktığında hemen bir ağrı kesiciyle onu "susturmaya" çalışmak, yardım çığlığı atan bir çocuğun ağzını bantlamaya benzer.  
Semptom bir ceza değil; organının sana gönderdiği son acil durum mektubudur. Ona sor: *"Bana ne anlatmaya çalışıyorsun? Hayatımda neyi değiştirmemi istiyorsun?"*  
Ve zihnini susturup bedeninden yükselecek ilk hissi, anıyı ya da duyguyu gözlemle.

---

### Bilimsel Arka Plan: Hücrelerin Seni Dinlediğinin Biyolojik Kanıtı

Bu yaklaşım romantik bir fantezi değildir; katıksız bir nörobiyolojidir:

* **Vagus Siniri Aktivasyonu:** Elinizi göğsünüze veya karnınıza koyup sakin bir minnet frekansına geçtiğinizde, vagus siniri devreye girer. Kalp atış hızı değişkenliği (HRV) senkronize olur.
* **Parasempatik Şifa Modu:** Stres hormonları (kortizol ve adrenalin) kesilir; hücreler hayatta kalma (savunma) modundan **hücresel onarım (DNA tamiri ve antienflamatuar)** moduna geçer.
* **Epigenetik Değişim:** Hücre çekirdeğine giden kimyasal sinyaller, hastalığı tetikleyen genleri baskılayıp bağışıklığı güçlendiren genleri aktive eder.

---

### Bu Akşam Uygulayabileceğin 5 Dakikalık Gece Ritüeli

Yatağa uzandığında telefonunu kenara bırak. Bedenini bir bütün olarak tara ve sırayla elini gezdir:

1. **Elini kalbine koy:** *"Bugün benim için attığın yüz bin atış için teşekkür ederim. Kalbimi sevgiye ve huzura açıyorum."*
2. **Elini karaciğerine (sağ kaburganın altına) koy:** *"Bugün maruz kaldığım tüm toksinleri ve öfkeleri süzdüğün için teşekkür ederim. Artık gereksiz öfkeleri serbest bırakıyorum."*
3. **Elini karnına/midene koy:** *"Hayatın akışına güveniyorum. Sindiremediğim her şeyi gece boyunca sevgiyle serbest bırakmanı diliyorum."*

Bunu birkaç hafta boyunca düzenli yaptığında; kronik yorgunluklarının azaldığını, sindiriminin rahatladığını ve bedeninin seninle savaşmayı bırakıp senin en sadık dostun haline geldiğini kendi gözlerinle göreceksin.

---

### Unutma: Bedenin Senin İlk ve Son Evindir

7Layers felsefesinde her insan 4 temel âlemde (Assiah - Eylem/Beden, Yetzirah - Duygu, Beriah - Zihin, Atzilut - Ruh) yaşar. Beden boyutu, ruhun bu dünyadaki tapınağıdır. Tapınağını onurlandırmayan bir zihnin huzur bulması imkansızdır.

Bugün bir organına sarıl ve ona teşekkür et. Çünkü o, doğduğun günden beri seni bir saniye bile terk etmedi.`,
    imageUrl: '/cellular_body_healing.jpg',
    category: 'Farkındalık & Şifa',
    published: true,
  };

  const existing = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, newPost.slug));

  if (existing.length > 0) {
    console.log('Post already exists, updating...');
    await db
      .update(blogPosts)
      .set({
        title: newPost.title,
        content: newPost.content,
        imageUrl: newPost.imageUrl,
        category: newPost.category,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.slug, newPost.slug));
    console.log('Post updated successfully!');
  } else {
    console.log('Creating new post...');
    await db.insert(blogPosts).values(newPost);
    console.log('Post created successfully!');
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
