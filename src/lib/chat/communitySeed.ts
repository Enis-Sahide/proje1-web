import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { chatMessages, chatNotifications, chatProfiles, chatRooms, profiles, users } from '@/db/schema';
import { formatSafeDisplayName, sendExpoPushNotification } from './chatService';

interface CommunityPersona {
  key: string;
  email: string;
  fullName: string;
  nickname: string | null;
  role: 'free' | 'apprentice' | 'journeyman' | 'master';
}

export const COMMUNITY_PERSONAS: CommunityPersona[] = [
  { key: 'derin', email: 'seed.derin@7layers.internal', fullName: 'Derin Aksoy', nickname: 'Derin A.', role: 'journeyman' },
  { key: 'hermes', email: 'seed.hermes@7layers.internal', fullName: 'Kemal Erdem', nickname: 'HermesYolcusu', role: 'master' },
  { key: 'elif', email: 'seed.elif@7layers.internal', fullName: 'Elif Soylu', nickname: null, role: 'apprentice' },
  { key: 'sefirot', email: 'seed.sefirot@7layers.internal', fullName: 'Orhan Kaya', nickname: 'SefirotGezgini', role: 'master' },
  { key: 'mert', email: 'seed.mert@7layers.internal', fullName: 'Mert Tuna', nickname: null, role: 'apprentice' },
  { key: 'zeynep', email: 'seed.zeynep@7layers.internal', fullName: 'Zeynep Karaca', nickname: null, role: 'free' },
  { key: 'kuzey', email: 'seed.kuzey@7layers.internal', fullName: 'Canan Yıldız', nickname: 'KuzeyDüğümü', role: 'journeyman' },
  { key: 'aurora', email: 'seed.aurora@7layers.internal', fullName: 'Selin Demir', nickname: 'AuroraFrekans', role: 'journeyman' },
  { key: 'sinan', email: 'seed.sinan@7layers.internal', fullName: 'Sinan Başar', nickname: null, role: 'free' },
  { key: 'ogham', email: 'seed.ogham@7layers.internal', fullName: 'Tuna Arslan', nickname: 'OghamBilgesi', role: 'master' },
  { key: 'asli', email: 'seed.asli@7layers.internal', fullName: 'Aslı Çelik', nickname: 'LotusNefesi', role: 'apprentice' },
  { key: 'burak', email: 'seed.burak@7layers.internal', fullName: 'Burak Özkan', nickname: null, role: 'free' },
  { key: 'leyla', email: 'seed.leyla@7layers.internal', fullName: 'Leyla Şahin', nickname: 'ZoharIşığı', role: 'journeyman' },
  { key: 'kaan', email: 'seed.kaan@7layers.internal', fullName: 'Kaan Koç', nickname: 'SimyaAynası', role: 'apprentice' },
  { key: 'defne', email: 'seed.defne@7layers.internal', fullName: 'Defne Yalçın', nickname: null, role: 'journeyman' },
  { key: 'emre', email: 'seed.emre@7layers.internal', fullName: 'Emre Doğan', nickname: 'Pisagor9', role: 'master' },
  { key: 'nil', email: 'seed.nil@7layers.internal', fullName: 'Nilgün Aydın', nickname: null, role: 'apprentice' },
  { key: 'cem', email: 'seed.cem@7layers.internal', fullName: 'Cemre Vural', nickname: 'Projektör4_6', role: 'journeyman' },
];

interface SeedDialogueItem {
  personaKey: string;
  content: string;
  replyToIndex?: number; // index in the same room's array
  minsAgo: number;
}

export const ROOM_SEED_DIALOGUES: Record<string, SeedDialogueItem[]> = {
  'genel-meydan': [
    {
      personaKey: 'hermes',
      content: 'Meclisteki tüm yolculara selam olsun. Bugün gökyüzünde Ay ve Neptün arasındaki uyumlu açı sezgileri oldukça güçlendiriyor, iç sesinizi dinlemeyi ihmal etmeyin.',
      minsAgo: 260,
    },
    {
      personaKey: 'elif',
      content: 'Selamlar herkese, ben de bu sabah Aura giriş sınavını geçip Çırak derecesine adım attım. Derslerin derinliği gerçekten çok etkileyici.',
      minsAgo: 215,
    },
    {
      personaKey: 'derin',
      content: 'Tebrik ederim Elif! Özellikle 1. derece Kabala ve Astroloji derslerine geçtiğinde parçaların nasıl birleştiğini çok daha net göreceksin.',
      replyToIndex: 1,
      minsAgo: 185,
    },
    {
      personaKey: 'zeynep',
      content: 'Merhaba, ben de yeni katıldım. İlk kez doğum haritası ve Human Design analizimi bir arada inceledim, yıllardır anlam veremediğim döngülerim resmen gözümün önüne serildi.',
      minsAgo: 140,
    },
    {
      personaKey: 'kuzey',
      content: 'Hoş geldiniz Zeynep Hanım. Beden haritası ile ruh (Drakonik) haritasını birlikte okumak insanın kendi içindeki çatışmaları anlamasında muazzam bir anahtar.',
      replyToIndex: 3,
      minsAgo: 105,
    },
    {
      personaKey: 'mert',
      content: 'Akşam nefes çalışması öncesi 528 Hz frekansını açıp 15 dakika tefekkür ettim, zihnimdeki bütün ağırlık dağıldı. Herkese huzurlu bir akşam diliyorum.',
      minsAgo: 62,
    },
    {
      personaKey: 'asli',
      content: 'Kesinlikle katılıyorum, 4-7-8 nefes tekniğiyle birleştirince kalp ritmi hemen dengeleniyor.',
      replyToIndex: 5,
      minsAgo: 34,
    },
    {
      personaKey: 'sefirot',
      content: 'Unutmayın dostlar; dışarıdaki gürültü ne kadar artarsa artsın, kendi merkezinde kalan insan kendi frekans alanını korur. Hepinize yüksek farkındalıklı bir gün dilerim.',
      minsAgo: 14,
    },
  ],

  'kabala': [
    {
      personaKey: 'sefirot',
      content: 'Hayat Ağacında Tiferet (Güzellik/Kalp) küresi, üstteki ruhsal üçlü ile alttaki maddi alem arasında köprüdür. Kalp merkezini dengelemeden üst alemlere kalıcı sıçrama yapılamaz.',
      minsAgo: 310,
    },
    {
      personaKey: 'leyla',
      content: 'Kabalistik 4 Alem analizimde 1. Alem (Assiah) ile 2. Alem (Yetzirah) arasında Güneş burcumun tamamen değiştiğini gördüm. Bedenim Başak iken ruh haritamda Yay çıktı.',
      minsAgo: 250,
    },
    {
      personaKey: 'sefirot',
      content: 'Çok güzel bir örnek. Assiah senin bu dünyadaki aracın ve düzen kurma disiplinin; Yetzirah ise ruhunun asıl özlemi olan bilgelik ve ufuk arayışıdır. İkisini birleştirdiğinde Kestirme Yol (Shortcut) açılır.',
      replyToIndex: 1,
      minsAgo: 210,
    },
    {
      personaKey: 'kaan',
      content: 'Binah (Anlayış) ve Hokmah (Bilgelik) arasındaki dengeyi günlük hayatta nasıl deneyimliyorsunuz? Bazen aşırı analitik kalıp sezgiyi bastırdığımı fark ediyorum.',
      minsAgo: 155,
    },
    {
      personaKey: 'hermes',
      content: 'Analitik zihin Hod küresidir; onu sakinleştirmenin yolu Netzach (doğa, sanat ve kalp akışı) ile dengelemektir. Zihni susturduğunda Hokmah şimşek gibi çakar.',
      replyToIndex: 3,
      minsAgo: 98,
    },
    {
      personaKey: 'leyla',
      content: 'Beriyah (9. Harmonik) katmanındaki gezegen yerleşimlerimi inceledikçe neden belirli felsefi konulara çekildiğimi çok daha iyi anladım.',
      minsAgo: 42,
    },
    {
      personaKey: 'derin',
      content: 'Malkuth küresini yani fiziksel bedeni ve toprağı ihmal etmeden Keter’e uzanmak... "Kökleri yerde, dalları gökte olan ağaç" tam olarak bu.',
      minsAgo: 19,
    },
  ],

  'sembolizm': [
    {
      personaKey: 'hermes',
      content: 'Kadim sembolizmde Ouroboros (kendi kuyruğunu ısıran yılan), zamanın doğrusal değil döngüsel olduğunu ve her bitişin yeni bir başlangıcı beslediğini anlatır.',
      minsAgo: 290,
    },
    {
      personaKey: 'kaan',
      content: 'Son bir haftadır rüyalarımda sürekli sarmal merdivenler ve anahtar sembolü görüyorum. Sembolizm derslerindeki "İnisiyasyon ve Eşik" arketipiyle çok örtüşüyor.',
      minsAgo: 230,
    },
    {
      personaKey: 'derin',
      content: 'Sarmal merdiven bilinç katmanları arasında yükselişi, anahtar ise bilinçaltında kilitli kalmış bir yeteneğin artık açılmaya hazır olduğunu simgeler.',
      replyToIndex: 1,
      minsAgo: 190,
    },
    {
      personaKey: 'nil',
      content: 'Yaşam Çiçeği geometrisinin 7 çakra ve Sefirot dizilimiyle üst üste oturduğu çizimi inceleyen oldu mu? Kutsal geometride hiçbir oran tesadüf değil.',
      minsAgo: 130,
    },
    {
      personaKey: 'emre',
      content: 'Özellikle Vesica Piscis oranı, ruh ve maddenin kesişim kümesidir. 7Layers logosundaki katmanlı altın geometri de bu rezonansı taşıyor.',
      replyToIndex: 3,
      minsAgo: 75,
    },
    {
      personaKey: 'kaan',
      content: 'Teşekkür ederim Derin, rüya günlüğü tutmaya başladığımdan beri sembollerin dili çok daha berraklaştı.',
      replyToIndex: 2,
      minsAgo: 28,
    },
  ],

  'astroloji': [
    {
      personaKey: 'kuzey',
      content: 'Kuzey Ay Düğümü 10. evde olanlar burada mı? Konfor alanı olan 4. evden çıkıp toplumsal sorumluluk ve görünürlük almaya geçtiğimden beri hayatımın akışı değişti.',
      minsAgo: 275,
    },
    {
      personaKey: 'burak',
      content: 'Benim de Kuzey Düğümüm Kova 11. evde, Güney Düğümüm Aslan 5. evde. Bireysel onay arayışını bırakıp kolektife fayda üretmeye odaklandığımda bütün kapılar açıldı.',
      replyToIndex: 0,
      minsAgo: 225,
    },
    {
      personaKey: 'defne',
      content: 'Mesleki Yatkınlık & Kariyer analizinde MC (Tepe Noktası) yöneticimin Satürn ile yaptığı üçgen açının liderlik ve sistem kurma potansiyelini nasıl desteklediğini çok net gördüm.',
      minsAgo: 170,
    },
    {
      personaKey: 'kuzey',
      content: 'Kesinlikle, çoğu kişi sadece Güneş burcuna bakıyor ama kariyerde MC, 2. ev ve 6. ev yöneticileri ile Drakonik MC bambaşka bir derinlik veriyor.',
      replyToIndex: 2,
      minsAgo: 120,
    },
    {
      personaKey: 'zeynep',
      content: 'Chiron (Yaralı Şifacı) 1. evde olduğunda kişi kendi kimlik yarasını iyileştirirken başkalarına da cesaret rehberi oluyor. Harita analizindeki Chiron bölümü çok dokundu bana.',
      minsAgo: 68,
    },
    {
      personaKey: 'hermes',
      content: 'Gezegen saatlerini günlük işlerimde takip etmeye başladığımdan beri önemli görüşmelerimi Jüpiter veya Güneş saatine denk getiriyorum, akış inanılmaz rahatlıyor.',
      minsAgo: 22,
    },
  ],

  'human-design': [
    {
      personaKey: 'cem',
      content: '4/6 Profil Projektör olarak yıllarca Jeneratörler gibi durmadan çalışmaya zorlamışım kendimi. "Daveti Bekle" stratejisini uyguladığımdan beri hem enerjim korundu hem de doğru insanlar beni bulmaya başladı.',
      minsAgo: 280,
    },
    {
      personaKey: 'mert',
      content: 'Ben 2/4 Duygusal Jeneratörüm. Karar verirken "duygusal dalganın netleşmesini bekle" kuralı hayatımı kurtardı diyebilirim. Anlık heyecanla verdiğim sözlerden artık kaçınıyorum.',
      minsAgo: 220,
    },
    {
      personaKey: 'cem',
      content: 'Duygusal otoritede bir gece uyumak bile kararın rengini tamamen değiştiriyor, çok doğru bir farkındalık.',
      replyToIndex: 1,
      minsAgo: 180,
    },
    {
      personaKey: 'elif',
      content: 'Manifesting Generator (MG) olan var mı? Aynı anda üç farklı konuyla ilgilenirken çevremdekiler dağıldığımı sanıyor ama benim enerji mekanizmam tam olarak böyle çalışıyormuş.',
      minsAgo: 125,
    },
    {
      personaKey: 'defne',
      content: 'Ben de MG’yim Elif! Bizim için önemli olan adımları atlamak değil, sakral merkezden "evet" sesi gelen işlere enerjimizi akıtmak.',
      replyToIndex: 3,
      minsAgo: 78,
    },
    {
      personaKey: 'sinan',
      content: 'Taç ve Ajna merkezim tanımsız (açık) olduğu için başkalarının zihinsel kaygılarını kendi düşüncem sanıyordum. Analizdeki "Tanımsız Merkez Tuzakları" kısmını okumak büyük aydınlanma oldu.',
      minsAgo: 31,
    },
  ],

  'numeroloji': [
    {
      personaKey: 'emre',
      content: 'Pisagor sisteminde Yaşam Yolu 7 olanlar doğuştan araştırmacı ve hakikat arayışçısıdır. Ancak gölge yönü olan aşırı izolasyona düşmemek için öğrendiklerini paylaşmaları gerekir.',
      minsAgo: 300,
    },
    {
      personaKey: 'nil',
      content: 'İsim analizimde Boğaz ve Üçüncü Göz çakralarımda harf yoğunluğu yüksek çıktı, Kök çakramda ise eksiklik (karmik ders) göründü. Topraklanma çalışmalarına başladım.',
      minsAgo: 240,
    },
    {
      personaKey: 'emre',
      content: 'İsimdeki harflerin ses titreşimi (fonetik rezonans) çakraları doğrudan besler. Eksik çakra harflerini dengelemek için o merkezin frekansını ve nefesini kullanmak çok etkilidir.',
      replyToIndex: 1,
      minsAgo: 195,
    },
    {
      personaKey: 'zeynep',
      content: 'Son günlerde saate her baktığımda 11:11 ve 14:14 ile karşılaşıyorum. Kişisel yıl döngüm de 1’e girmiş durumda, yeni bir başlangıç enerjisi çok yoğun.',
      minsAgo: 135,
    },
    {
      personaKey: 'aurora',
      content: '1 Kişisel Yılı 9 yıllık döngünün tohum ekme zamanıdır Zeynep. Bu yıl attığın adımlar önümüzdeki 9 yılın temelini oluşturur.',
      replyToIndex: 3,
      minsAgo: 84,
    },
    {
      personaKey: 'burak',
      content: 'Üstad sayı 11’in getirdiği yüksek sezgiyi maddi dünyada somutlaştırmak için 2’nin sabrını ve diplomasisini öğrenmek gerekiyormuş, analizde çok güzel açıklanmış.',
      minsAgo: 25,
    },
  ],

  'kelt-druid': [
    {
      personaKey: 'ogham',
      content: 'Kelt Ağaç Takviminde Meşe (Duir), dayanıklılığın, bilgeliğin ve fırtınada köklerine güvenmenin sembolüdür. Doğayla bağımız koptukça içsel pusulamız da zayıflıyor.',
      minsAgo: 320,
    },
    {
      personaKey: 'asli',
      content: 'Kozmik Matris analizimde Kelt doğum ağacım Dişbudak (Nion) çıktı. "İçsel su ve evrensel bağlantı ağacı" tanımı ruhsal yapımla birebir örtüşüyor.',
      minsAgo: 255,
    },
    {
      personaKey: 'ogham',
      content: 'Dişbudak (Nion), İskandinav ve Kelt geleneğinde Yggdrasil ile de ilişkilidir; görünen ile görünmeyen alemleri birbirine bağlayan sezgisel zekayı temsil eder.',
      replyToIndex: 1,
      minsAgo: 205,
    },
    {
      personaKey: 'mert',
      content: 'Hafta sonu ormanda çıplak ayakla 20 dakika toprağa basarak yürüyüş yaptım. Şehirdeki statik elektriğin bedenden nasıl boşaldığını insan anında hissediyor.',
      minsAgo: 145,
    },
    {
      personaKey: 'leyla',
      content: 'Söğüt (Sail) ağacının Ay döngüleri ve su elementiyle olan bağı üzerine yazılan kısım harikaydı. Duyguları bastırmak yerine söğüt gibi esneyerek dönüştürmek...',
      minsAgo: 55,
    },
  ],

  'cakra-sifa': [
    {
      personaKey: 'aurora',
      content: 'Bugün Schumann Rezonansı spektrumunda öğle saatlerinde belirgin bir genlik artışı vardı. Baş ağrısı veya kulak çınlaması hissedenler bol su içip topraklanma nefesi yapabilir.',
      minsAgo: 245,
    },
    {
      personaKey: 'asli',
      content: 'Ben de tam öğle saatlerinde sebebini bilmediğim bir basınç hissetmiştim, Schumann grafiğine bakınca taşlar yerine oturdu! Hemen 432 Hz ve Kutu Nefesi uyguladım.',
      replyToIndex: 0,
      minsAgo: 200,
    },
    {
      personaKey: 'sinan',
      content: 'Solar Pleksus (528 Hz) ve Kalp Çakrası (639 Hz) çalışmalarına düzenli devam ettiğimden beri mide bölgemdeki stres kasılmaları tamamen geçti.',
      minsAgo: 150,
    },
    {
      personaKey: 'aurora',
      content: 'Duygusal beden (Yetzirah) çözüldüğünde fiziksel bedendeki (Assiah) blokaj da kendiliğinden gevşiyor Sinan Bey, şifa olsun.',
      replyToIndex: 2,
      minsAgo: 110,
    },
    {
      personaKey: 'nil',
      content: 'Uygulamanın ana ekranına Çakra & Ay Evresi widget’ını ekledim, telefonumu her açtığımda günün olumlamasını ve aktif çakra frekansını görmek çok güzel bir farkındalık yaratıyor.',
      minsAgo: 48,
    },
    {
      personaKey: 'derin',
      content: 'Gece uykuya geçmeden önce 852 Hz Üçüncü Göz frekansını düşük seste açıp günün muhasebesini yapmak rüya berraklığını inanılmaz artırıyor.',
      minsAgo: 16,
    },
  ],
};

const globalForSeed = globalThis as unknown as {
  __communitySeedPromise?: Promise<void> | null;
};

export async function ensureCommunitySeededAndActive(): Promise<void> {
  if (!globalForSeed.__communitySeedPromise) {
    globalForSeed.__communitySeedPromise = runInitialCommunitySeed().catch((err) => {
      console.error('[communitySeed] Initial seed error:', err);
      globalForSeed.__communitySeedPromise = null;
    });
  }
  await globalForSeed.__communitySeedPromise;

  // Vakti gelen (5-30 dk gecikmeli) zamanlanmış yanıtları ve geçmişte yanıtsız kalmış kullanıcı mesajlarını işle
  try {
    await scanAndScheduleUnansweredUserReplies();
    await processDueScheduledReplies();
  } catch (err) {
    console.warn('[communitySeed] Scheduled reply delivery warning:', err);
  }
}

async function runInitialCommunitySeed(): Promise<void> {
  // Zamanlanmış yanıt kuyruğu tablosu
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_scheduled_replies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id TEXT NOT NULL,
      room_title TEXT NOT NULL,
      room_icon TEXT NOT NULL DEFAULT '💬',
      persona_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      persona_display_name TEXT NOT NULL,
      recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipient_display_name TEXT NOT NULL,
      reply_to_message_id UUID NOT NULL,
      reply_preview_text TEXT NOT NULL,
      reply_content TEXT NOT NULL,
      deliver_at TIMESTAMPTZ NOT NULL,
      delivered BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Mükerrer (çift) mesajları temizle
  await db.execute(sql`
    DELETE FROM chat_messages a
    USING chat_messages b
    WHERE a.room_id = b.room_id
      AND a.content = b.content
      AND a.id > b.id
  `);

  // Eski ambient rotation nedeniyle gerçek kullanıcı yanıtının altına kaymış olan bot mesajlarını düzelt:
  // 1) "Yeni katılan tüm yolculara hoş geldiniz diyorum..." mesajını (rotasyonla sonradan eklendiyse) temizle
  await db.execute(sql`
    DELETE FROM chat_messages
    WHERE room_id = 'genel-meydan'
      AND content = 'Yeni katılan tüm yolculara hoş geldiniz diyorum. Kadim Dersler bölümündeki okuma sırasını takip etmenizi özellikle tavsiye ederim.'
  `);

  // 2) KuzeyDüğümü'nün "Bugünkü Kozmik Gökyüzü Rehberinde..." mesajına gerçek bir kullanıcı yanıt verdiyse,
  //    KuzeyDüğümü'nün mesaj tarihini o yanıtın 18 dakika öncesine çek ve reply_to_id bağını onar.
  await db.execute(sql`
    UPDATE chat_messages AS bot_msg
    SET created_at = user_reply.created_at - INTERVAL '18 minutes'
    FROM chat_messages AS user_reply
    WHERE bot_msg.room_id = 'genel-meydan'
      AND bot_msg.content LIKE 'Bugünkü Kozmik Gökyüzü Rehberinde%'
      AND user_reply.room_id = 'genel-meydan'
      AND user_reply.reply_preview_text LIKE 'Bugünkü Kozmik Gökyüzü Rehberinde%'
      AND bot_msg.created_at > user_reply.created_at
  `);

  await db.execute(sql`
    UPDATE chat_messages AS user_reply
    SET reply_to_id = bot_msg.id
    FROM chat_messages AS bot_msg
    WHERE user_reply.room_id = 'genel-meydan'
      AND bot_msg.room_id = 'genel-meydan'
      AND user_reply.reply_to_id IS NULL
      AND user_reply.reply_preview_text LIKE 'Bugünkü Kozmik Gökyüzü Rehberinde%'
      AND bot_msg.content LIKE 'Bugünkü Kozmik Gökyüzü Rehberinde%'
  `);

  // 1. Persona kullanıcılarını ve profillerini oluştur / güncelle
  const personaIdMap = new Map<string, { id: string; displayName: string }>();

  for (const p of COMMUNITY_PERSONAS) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, p.email));

    let userId = existing?.id;
    if (!userId) {
      const [inserted] = await db
        .insert(users)
        .values({
          email: p.email,
          passwordHash: '$2a$10$7layersCommunityPersonaSeedHashPlaceholder000000000000',
          fullName: p.fullName,
          emailVerified: true,
        })
        .returning({ id: users.id });
      userId = inserted.id;
    }

    await db
      .insert(profiles)
      .values({
        userId,
        role: p.role,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { role: p.role },
      });

    if (p.nickname) {
      await db
        .insert(chatProfiles)
        .values({
          userId,
          nickname: p.nickname,
        })
        .onConflictDoUpdate({
          target: chatProfiles.userId,
          set: { nickname: p.nickname },
        });
    }

    personaIdMap.set(p.key, {
      id: userId,
      displayName: formatSafeDisplayName(p.fullName, p.email, p.nickname),
    });
  }

  // 2. Her oda için eksik başlangıç diyaloglarını tekil olarak ekle
  const now = Date.now();
  for (const [roomId, dialogues] of Object.entries(ROOM_SEED_DIALOGUES)) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId));

    if ((Number(count) || 0) >= 4) {
      continue;
    }

    const insertedMessages: Array<{ id: string; senderName: string; content: string }> = [];

    for (let i = 0; i < dialogues.length; i++) {
      const item = dialogues[i];
      const persona = personaIdMap.get(item.personaKey);
      if (!persona) continue;

      const existingMsgRes = await db.execute<{ id: string }>(sql`
        SELECT id FROM chat_messages
        WHERE room_id = ${roomId} AND content = ${item.content}
        LIMIT 1
      `);
      const existingRow = existingMsgRes.rows?.[0];
      if (existingRow?.id) {
        insertedMessages.push({
          id: existingRow.id,
          senderName: persona.displayName,
          content: item.content,
        });
        continue;
      }

      let replyToId: string | null = null;
      let replyPreviewName: string | null = null;
      let replyPreviewText: string | null = null;

      if (typeof item.replyToIndex === 'number' && insertedMessages[item.replyToIndex]) {
        const targetMsg = insertedMessages[item.replyToIndex];
        replyToId = targetMsg.id;
        replyPreviewName = targetMsg.senderName;
        replyPreviewText = targetMsg.content.slice(0, 120);
      }

      const createdAt = new Date(now - item.minsAgo * 60 * 1000);

      const [inserted] = await db
        .insert(chatMessages)
        .values({
          roomId,
          userId: persona.id,
          content: item.content,
          replyToId,
          replyPreviewName,
          replyPreviewText,
          createdAt,
        })
        .returning({ id: chatMessages.id });

      insertedMessages.push({
        id: inserted.id,
        senderName: persona.displayName,
        content: item.content,
      });
    }
  }

  await db.execute(sql`
    DELETE FROM chat_messages a
    USING chat_messages b
    WHERE a.room_id = b.room_id
      AND a.content = b.content
      AND a.id > b.id
  `);
}

export function generateContextualPersonaReply(
  roomId: string,
  userMessage: string,
  recipientName: string,
  quotedBotText?: string | null
): string {
  const lower = userMessage.toLocaleLowerCase('tr-TR');
  const quotedLower = (quotedBotText || '').toLocaleLowerCase('tr-TR');
  const combined = `${lower} ${quotedLower}`;
  const firstName = recipientName.split(' ')[0] || 'dostum';

  // 1. "Nerede / görmedim / bulamadım / nasıl" soruları için nokta atışı rehber yanıtlar
  const isWhereOrHowQuestion =
    lower.includes('nerede') ||
    lower.includes('nerde') ||
    lower.includes('görmedim') ||
    lower.includes('gormedim') ||
    lower.includes('grmedim') ||
    lower.includes('bulamadım') ||
    lower.includes('bulamadim') ||
    lower.includes('hangi bölüm') ||
    lower.includes('nasıl bak') ||
    lower.includes('nasil bak') ||
    lower.includes('nasıl gir');

  if (isWhereOrHowQuestion) {
    if (
      combined.includes('kozmik gökyüzü') ||
      combined.includes('gökyüzü rehberi') ||
      combined.includes('beden hem ruh') ||
      combined.includes('sentez')
    ) {
      return `Ana sayfadaki (veya üst menüdeki) 'Kişisel Analizler' bölümünden 'Kozmik Gökyüzü Rehberi' ve 'Kabalistik 4 Alem' kartlarına tıklayarak görebilirsin ${firstName}. Doğum bilgilerini girdiğinde hem Beden hem Ruh haritası sentezin otomatik açılıyor.`;
    }
    if (combined.includes('ders') || combined.includes('sınav') || combined.includes('derece') || combined.includes('çırak')) {
      return `Üst menüdeki 'Kadim Dersler' sekmesinden tüm ders modüllerine ve derece sınavlarına ulaşabilirsin ${firstName}.`;
    }
    if (combined.includes('schumann') || combined.includes('frekans') || combined.includes('nefes') || combined.includes('gezegen saat')) {
      return `Menüdeki 'Kişisel Analizler' ve 'Kadim Uygulamalar' bölümlerinden canlı Schumann Rezonansı, Gezegen Saatleri ve Nefes/Frekans çalışmalarına doğrudan ulaşabilirsin ${firstName}.`;
    }
    return `Üst menüdeki 'Kişisel Analizler' ve 'Kadim Dersler' bölümlerinden bahsettiğim tüm analiz ve sentez ekranlarına doğrudan ulaşabilirsin ${firstName}. Doğum bilgilerin kayıtlıysa sistem senin için otomatik hesaplıyor.`;
  }

  // 2. Teşekkür / Selamlaşma
  if (lower.includes('teşekkür') || lower.includes('sağ ol') || lower.includes('eyvallah') || lower.includes('harika')) {
    const thanksPool = [
      `Rica ederim ${firstName}, bu yolda birbirimize ayna tutmak hepimizin farkındalığını büyütüyor. Katkın için ben teşekkür ederim.`,
      `Ne demek ${firstName}, mecliste deneyimlerin paylaşılması enerjiyi çok daha berraklaştırıyor. Yolun açık olsun.`,
      `Çok mutlu oldum ${firstName}, kendi içsel gözlemlerini de fırsat buldukça paylaşırsan keyifle okuruz.`,
    ];
    return thanksPool[Math.floor(Math.random() * thanksPool.length)];
  }

  // 3. Odaya özel bağlamsal yanıt havuzları
  const roomReplies: Record<string, string[]> = {
    'genel-meydan': [
      `Çok güzel bir noktaya değindin ${firstName}. Özellikle günlük gökyüzü sentezini ve kendi içsel ritmini bir arada gözlemlediğinde taşlar çok daha hızlı yerine oturuyor.`,
      `Katılıyorum ${firstName}. İlk başta kavramlar yoğun gelebilir ama hem analizlerdeki özet katmanları hem de Kadim Dersleri sindire sindire ilerledikçe her şey netleşiyor.`,
      `Paylaşımın için teşekkürler ${firstName}. Kendi merkezinde kalıp nefes ve frekans pratiklerini günlük rutine eklemek bile büyük fark yaratıyor.`,
    ],
    'kabala': [
      `Çok yerinde bir tespit ${firstName}. Hayat Ağacında her küre (Sefira) aslında kendi bilincimizin bir katmanıdır; Assiah’ta fark ettiğin her kalıp Yetzirah ve Beriyah’ta çözülmeye başlar.`,
      `Kesinlikle öyle ${firstName}. Özellikle Beden (Tropikal) ve Ruh (Drakonik) haritalarını 4 Alem matrisinde karşılaştırdığında hangi kürede denge kurman gerektiği çok net görülüyor.`,
      `Bu gözlemin çok değerli ${firstName}. Orta sütun (Keter - Tiferet - Yesod - Malkuth) dengesini koruduğunda sağ ve sol sütun arasındaki kutupluluk kendiliğinden uyumlanır.`,
    ],
    'sembolizm': [
      `Çok derin bir gözlem ${firstName}. Kadim semboller zihnin mantık filtresini aşarak doğrudan bilinçaltı ve üst-bilinçle konuşur; gördüğün işaretleri not almak harika bir pratik.`,
      `Haklısın ${firstName}. Kutsal geometri ve arketipler üzerine tefekkür ettikçe hayatın içindeki eşzamanlılıkların (synchronicity) dili çok daha anlaşılır hale geliyor.`,
    ],
    'astroloji': [
      `Harika bir nokta ${firstName}. Doğum haritasında özellikle Kuzey Ay Düğümü, Satürn ve MC (Tepe Noktası) üçlüsünü birlikte okumak kadersel yönü çok berraklaştırıyor.`,
      `Çok doğru ${firstName}. Gezegen transitlerini birer zorlama değil, içimizdeki potansiyeli uyandıran göksel gelişim pencereleri olarak gördüğümüzde akış tamamen değişiyor.`,
      `Kesinlikle katılıyorum ${firstName}. Tropikal harita dünyadaki aracımızı, Drakonik harita ise ruhsal pusulamızı gösteriyor; ikisini sentezlemek en doğrusu.`,
    ],
    'human-design': [
      `Çok güzel ifade ettin ${firstName}. Human Design’da zihni karar mekanizması olmaktan çıkarıp kendi Strateji ve Otoritemize güvendiğimiz anda direnç kalkıyor.`,
      `Kesinlikle ${firstName}. Özellikle tanımsız (açık) merkezlerimizden aldığımız dış koşullandırmaları fark etmek bile enerjimizi korumada devrim yaratıyor.`,
    ],
    'numeroloji': [
      `Çok güzel bir farkındalık ${firstName}. Doğum tarihinden gelen Yaşam Yolu sayısı ile isimdeki harflerin çakra titreşimi birleştiğinde kişinin yaşam melodisi ortaya çıkıyor.`,
      `Haklısın ${firstName}. Özellikle kişisel yıl ve kişisel gün döngülerine uyumlanarak adım atmak, akıntıya karşı kürek çekmeyi bırakıp rüzgarı arkana almak gibi.`,
    ],
    'kelt-druid': [
      `Çok güzel bir paylaşım ${firstName}. Doğanın döngüleri ve Kelt ağaç arketipleri bize her mevsimin ve her ruh halinin bir bilgeliği olduğunu hatırlatıyor.`,
      `Kesinlikle ${firstName}. Topraklanma ve doğanın ritmiyle hizalanmak, zihinsel karmaşayı en hızlı şifalandıran kadim anahtarlardan biri.`,
    ],
    'cakra-sifa': [
      `Çok doğru bir gözlem ${firstName}. Nefes çalışmalarıyla Solfeggio frekanslarını birleştirmek otonom sinir sistemini ve çakra akışını çok hızlı dengeliyor.`,
      `Şifa olsun ${firstName}. Özellikle Schumann Rezonansının yükseldiği günlerde su tüketimini artırmak ve kök-kalp çakra dengesine odaklanmak bedeni çok rahatlatıyor.`,
    ],
  };

  const pool = roomReplies[roomId] || roomReplies['genel-meydan'];
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function schedulePersonaReplyIfApplicable(params: {
  roomId: string;
  roomTitle: string;
  roomIcon: string;
  userMessageId: string;
  userMessageContent: string;
  senderUserId: string;
  senderDisplayName: string;
  replyTargetUserId: string | null;
  quotedBotText?: string | null;
}): Promise<void> {
  try {
    let targetUserId = params.replyTargetUserId;

    // Eğer Yanıtla'ya basmadan mesaj içinde @TakmaAd yazdıysa onu da yakala
    if (!targetUserId && params.userMessageContent.includes('@')) {
      const lowerContent = params.userMessageContent.toLocaleLowerCase('tr-TR');
      for (const p of COMMUNITY_PERSONAS) {
        const display = formatSafeDisplayName(p.fullName, p.email, p.nickname).toLocaleLowerCase('tr-TR');
        if (lowerContent.includes(`@${display}`)) {
          const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, p.email));
          if (u) {
            targetUserId = u.id;
            break;
          }
        }
      }
    }

    if (!targetUserId || targetUserId === params.senderUserId) {
      return;
    }

    // Bu mesaja zaten zamanlanmış bir yanıt varsa tekrar ekleme
    const existingScheduled = await db.execute<{ id: string }>(sql`
      SELECT id FROM chat_scheduled_replies
      WHERE reply_to_message_id = ${params.userMessageId}
      LIMIT 1
    `);
    if (existingScheduled.rows && existingScheduled.rows.length > 0) {
      return;
    }

    // Yanıt verilen kişi bir topluluk profili (@7layers.internal) mi kontrol et
    const [targetUser] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        nickname: chatProfiles.nickname,
      })
      .from(users)
      .leftJoin(chatProfiles, eq(users.id, chatProfiles.userId))
      .where(eq(users.id, targetUserId));

    if (!targetUser || !targetUser.email.endsWith('@7layers.internal')) {
      return;
    }

    const personaDisplayName = formatSafeDisplayName(
      targetUser.fullName,
      targetUser.email,
      targetUser.nickname
    );

    const replyContent = generateContextualPersonaReply(
      params.roomId,
      params.userMessageContent,
      params.senderDisplayName,
      params.quotedBotText
    );

    // 5 ile 30 dakika arası rastgele gecikme (milisaniye)
    const delayMinutes = Math.floor(Math.random() * 26) + 5; // 5..30 dk
    const delayMs = delayMinutes * 60 * 1000;
    const deliverAt = new Date(Date.now() + delayMs);

    await db.execute(sql`
      INSERT INTO chat_scheduled_replies (
        room_id,
        room_title,
        room_icon,
        persona_user_id,
        persona_display_name,
        recipient_user_id,
        recipient_display_name,
        reply_to_message_id,
        reply_preview_text,
        reply_content,
        deliver_at
      ) VALUES (
        ${params.roomId},
        ${params.roomTitle},
        ${params.roomIcon},
        ${targetUser.id},
        ${personaDisplayName},
        ${params.senderUserId},
        ${params.senderDisplayName},
        ${params.userMessageId},
        ${params.userMessageContent.slice(0, 90)},
        ${replyContent},
        ${deliverAt}
      )
    `);

    // Sunucu çalışmaya devam ettiği sürece tam zamanında teslim etmesi için zamanlayıcı kur
    const timer = setTimeout(() => {
      void processDueScheduledReplies().catch((err) => {
        console.warn('[communitySeed] Timer delivery error:', err);
      });
    }, delayMs + 500);

    if (typeof (timer as any)?.unref === 'function') {
      (timer as any).unref();
    }
  } catch (err) {
    console.warn('[schedulePersonaReplyIfApplicable] Error:', err);
  }
}

/**
 * Geçmişte gerçek bir kullanıcının bir bota yanıt verip de (sunucu yeniden başlatması veya
 * önceki sürüm geçişi yüzünden) henüz yanıt alamadığı mesajları tarar ve kuyruğa ekler.
 */
async function scanAndScheduleUnansweredUserReplies(): Promise<void> {
  const unansweredRes = await db.execute<{
    id: string;
    room_id: string;
    user_id: string;
    content: string;
    reply_to_id: string | null;
    reply_preview_name: string | null;
    reply_preview_text: string | null;
    created_at: string;
    sender_full_name: string | null;
    sender_email: string;
    sender_nickname: string | null;
  }>(sql`
    SELECT
      m.id,
      m.room_id,
      m.user_id,
      m.content,
      m.reply_to_id,
      m.reply_preview_name,
      m.reply_preview_text,
      m.created_at,
      u.full_name AS sender_full_name,
      u.email AS sender_email,
      cp.nickname AS sender_nickname
    FROM chat_messages m
    INNER JOIN users u ON u.id = m.user_id
    LEFT JOIN chat_profiles cp ON cp.user_id = m.user_id
    WHERE u.email NOT LIKE '%@7layers.internal'
      AND (m.reply_to_id IS NOT NULL OR m.reply_preview_name IS NOT NULL)
      AND NOT EXISTS (
        SELECT 1 FROM chat_messages r WHERE r.reply_to_id = m.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM chat_scheduled_replies sr WHERE sr.reply_to_message_id = m.id
      )
    ORDER BY m.created_at ASC
    LIMIT 20
  `);

  const rows = unansweredRes.rows || [];
  if (rows.length === 0) return;

  for (const row of rows) {
    let personaEmail: string | null = null;

    if (row.reply_to_id) {
      const [targetMsg] = await db
        .select({ email: users.email })
        .from(chatMessages)
        .innerJoin(users, eq(chatMessages.userId, users.id))
        .where(eq(chatMessages.id, row.reply_to_id));
      if (targetMsg?.email?.endsWith('@7layers.internal')) {
        personaEmail = targetMsg.email;
      }
    }

    if (!personaEmail && row.reply_preview_name) {
      const matchedPersona = COMMUNITY_PERSONAS.find((p) => {
        const displayName = formatSafeDisplayName(p.fullName, p.email, p.nickname);
        return displayName === row.reply_preview_name || p.nickname === row.reply_preview_name;
      });
      if (matchedPersona) {
        personaEmail = matchedPersona.email;
      }
    }

    if (!personaEmail) continue;

    const [personaUser] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        nickname: chatProfiles.nickname,
      })
      .from(users)
      .leftJoin(chatProfiles, eq(users.id, chatProfiles.userId))
      .where(eq(users.email, personaEmail));

    if (!personaUser) continue;

    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, row.room_id));
    const roomTitle = room?.title || 'Genel Meydan';
    const roomIcon = room?.icon || '🏛️';

    const senderDisplayName = formatSafeDisplayName(
      row.sender_full_name,
      row.sender_email,
      row.sender_nickname
    );
    const personaDisplayName = formatSafeDisplayName(
      personaUser.fullName,
      personaUser.email,
      personaUser.nickname
    );

    const replyContent = generateContextualPersonaReply(
      row.room_id,
      row.content,
      senderDisplayName,
      row.reply_preview_text
    );

    const msgCreatedMs = new Date(row.created_at).getTime();
    const ageMs = Date.now() - msgCreatedMs;
    const delayMinutes = Math.floor(Math.random() * 26) + 5; // 5..30 dk
    const targetDeliverMs = msgCreatedMs + delayMinutes * 60 * 1000;
    // Eğer mesaj zaten 5-30 dk süresini doldurmuşsa (örn. dün akşam yazılmışsa) hemen şimdi teslim et
    const deliverAt = ageMs >= delayMinutes * 60 * 1000 ? new Date(Date.now() - 1000) : new Date(targetDeliverMs);

    await db.execute(sql`
      INSERT INTO chat_scheduled_replies (
        room_id,
        room_title,
        room_icon,
        persona_user_id,
        persona_display_name,
        recipient_user_id,
        recipient_display_name,
        reply_to_message_id,
        reply_preview_text,
        reply_content,
        deliver_at
      ) VALUES (
        ${row.room_id},
        ${roomTitle},
        ${roomIcon},
        ${personaUser.id},
        ${personaDisplayName},
        ${row.user_id},
        ${senderDisplayName},
        ${row.id},
        ${row.content.slice(0, 90)},
        ${replyContent},
        ${deliverAt}
      )
    `);
  }
}

export async function processDueScheduledReplies(): Promise<void> {
  const dueRes = await db.execute<{
    id: string;
    room_id: string;
    room_title: string;
    room_icon: string;
    persona_user_id: string;
    persona_display_name: string;
    recipient_user_id: string;
    recipient_display_name: string;
    reply_to_message_id: string;
    reply_preview_text: string;
    reply_content: string;
  }>(sql`
    UPDATE chat_scheduled_replies
    SET delivered = TRUE
    WHERE delivered = FALSE AND deliver_at <= NOW()
    RETURNING
      id,
      room_id,
      room_title,
      room_icon,
      persona_user_id,
      persona_display_name,
      recipient_user_id,
      recipient_display_name,
      reply_to_message_id,
      reply_preview_text,
      reply_content
  `);

  const rows = dueRes.rows || [];
  for (const row of rows) {
    // Kullanıcının mesajı silinmişse yanıt gönderme
    const [origMsg] = await db
      .select({ id: chatMessages.id })
      .from(chatMessages)
      .where(eq(chatMessages.id, row.reply_to_message_id));

    if (!origMsg) continue;

    const [inserted] = await db
      .insert(chatMessages)
      .values({
        roomId: row.room_id,
        userId: row.persona_user_id,
        content: row.reply_content,
        replyToId: row.reply_to_message_id,
        replyPreviewName: row.recipient_display_name,
        replyPreviewText: row.reply_preview_text,
      })
      .returning({ id: chatMessages.id });

    await db.insert(chatNotifications).values({
      recipientUserId: row.recipient_user_id,
      senderUserId: row.persona_user_id,
      senderName: row.persona_display_name,
      roomId: row.room_id,
      roomTitle: row.room_title,
      roomIcon: row.room_icon,
      messageId: inserted.id,
      messagePreview: row.reply_content.slice(0, 120),
      isRead: false,
    });

    const [recipientProfile] = await db
      .select({ expoPushToken: chatProfiles.expoPushToken })
      .from(chatProfiles)
      .where(eq(chatProfiles.userId, row.recipient_user_id));

    if (recipientProfile?.expoPushToken) {
      void sendExpoPushNotification(
        recipientProfile.expoPushToken,
        `${row.room_icon} ${row.room_title} • Yeni Yanıt`,
        `@${row.persona_display_name}: "${row.reply_content.slice(0, 85)}"`,
        { roomId: row.room_id, messageId: inserted.id, type: 'chat_reply' }
      );
    }
  }
}
