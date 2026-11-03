import 'server-only';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { chatMessages, chatProfiles, profiles, users } from '@/db/schema';
import { formatSafeDisplayName } from './chatService';

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

// Zaman içinde odaya yeni mesaj eklemek için ekstra döngüsel diyalog havuzu
export const AMBIENT_ROTATION_POOL: Record<string, Array<{ personaKey: string; content: string }>> = {
  'genel-meydan': [
    { personaKey: 'kuzey', content: 'Bugünkü Kozmik Gökyüzü Rehberinde hem Beden hem Ruh haritası sentezini okudum, güne niyet koymak için harika bir pusula oluyor.' },
    { personaKey: 'derin', content: 'Yeni katılan tüm yolculara hoş geldiniz diyorum. Kadim Dersler bölümündeki okuma sırasını takip etmenizi özellikle tavsiye ederim.' },
    { personaKey: 'mert', content: 'Günün gezegen saatlerine dikkat ederek çalıştığımda verimimin iki katına çıktığını fark ettim.' },
  ],
  'kabala': [
    { personaKey: 'hermes', content: 'Yesod küresi Ay ile yönetilir; bilinçaltı kalıplarımızı temizlemeden Malkuth yani fiziksel hayatımızdaki yansımaları değiştiremeyiz.' },
    { personaKey: 'sefirot', content: '4 Alem haritasında Atzilut (Helyosentrik) katmanı, ruhun Güneş merkezli en saf niyetini gösterir.' },
  ],
  'sembolizm': [
    { personaKey: 'emre', content: 'Hermetik ilkelerden "Yukarıda ne varsa aşağıda da o vardır" yasası, hem astrolojinin hem de kutsal geometrinin temel taşıdır.' },
    { personaKey: 'derin', content: 'Rüyalarda görülen suyun berraklığı doğrudan duygusal bedenin (Yetzirah) o anki durumunu yansıtır.' },
  ],
  'astroloji': [
    { personaKey: 'defne', content: 'Satürn döngüsü (29-30 yaş) insanı gerçekten sahte olan her şeyden arındırıp kendi hakiki omurgasını kurmaya zorluyor.' },
    { personaKey: 'kuzey', content: 'Drakonik harita ile Tropikal harita arasındaki kavuşumlar, bu enkarnasyona taşıdığımız en güçlü ruhsal sözleşmeleri gösteriyor.' },
  ],
  'human-design': [
    { personaKey: 'cem', content: 'Projektörler için en önemli soru "Ben kimim?" değil, "Beni gerçekten kim görüyor ve tanıyor?" sorusudur.' },
    { personaKey: 'defne', content: 'Jeneratör ve MG’ler için tatmin duygusu doğru yolda olduğumuzun, hüsransa stratejiden çıktığımızın en net sinyalidir.' },
  ],
  'numeroloji': [
    { personaKey: 'emre', content: 'Doğum tarihimizdeki rakamlar bu hayata getirdiğimiz araçları, ismimizdeki harf titreşimleri ise bu araçları hangi frekansta kullandığımızı gösterir.' },
    { personaKey: 'nil', content: 'Kişisel gün sayımı takip etmeye başladığımdan beri hangi gün dinlenip hangi gün adım atacağımı çok daha dengeli planlıyorum.' },
  ],
  'kelt-druid': [
    { personaKey: 'ogham', content: 'Huş ağacı (Beith) Ogham alfabesinin ilk harfidir; arınmayı, yeni doğuşu ve eski kabuğu geride bırakma cesaretini simgeler.' },
    { personaKey: 'asli', content: 'Doğanın dört elementiyle (Toprak, Su, Ateş, Hava) günlük ritmimi uyumlamak zihinsel berraklığımı çok güçlendirdi.' },
  ],
  'cakra-sifa': [
    { personaKey: 'aurora', content: 'Kalp çakrası (639 Hz) alt üç maddi çakra ile üst üç ruhsal çakranın denge noktasıdır; şefkat ve affetme en güçlü frekans yükselticidir.' },
    { personaKey: 'asli', content: 'Sabahları 5 dakika Kutu Nefesi (4-4-4-4) yapmak bütün gün sinir sistemini dengede tutuyor.' },
  ],
};

const globalForSeed = globalThis as unknown as {
  __communitySeedPromise?: Promise<void> | null;
  __lastRotationCheckAt?: number;
};

export async function ensureCommunitySeededAndActive(): Promise<void> {
  if (!globalForSeed.__communitySeedPromise) {
    globalForSeed.__communitySeedPromise = runInitialCommunitySeed().catch((err) => {
      console.error('[communitySeed] Initial seed error:', err);
      globalForSeed.__communitySeedPromise = null;
    });
  }
  await globalForSeed.__communitySeedPromise;

  const now = Date.now();
  const lastCheck = globalForSeed.__lastRotationCheckAt || 0;
  if (now - lastCheck > 10 * 60 * 1000) {
    globalForSeed.__lastRotationCheckAt = now;
    void refreshRoomRecency().catch((err) => {
      console.warn('[communitySeed] Rotation check warning:', err);
    });
  }
}

async function runInitialCommunitySeed(): Promise<void> {
  // Mükerrer (çift) mesajları temizle
  await db.execute(sql`
    DELETE FROM chat_messages a
    USING chat_messages b
    WHERE a.room_id = b.room_id
      AND a.content = b.content
      AND a.id > b.id
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

  // Son güvenlik kontrolü: paralel isteklerden oluşabilecek mükerrer kayıtları sil
  await db.execute(sql`
    DELETE FROM chat_messages a
    USING chat_messages b
    WHERE a.room_id = b.room_id
      AND a.content = b.content
      AND a.id > b.id
  `);
}

async function refreshRoomRecency(): Promise<void> {
  const now = Date.now();

  for (const [roomId, poolItems] of Object.entries(AMBIENT_ROTATION_POOL)) {
    const [latest] = await db
      .select({
        id: chatMessages.id,
        createdAt: chatMessages.createdAt,
        content: chatMessages.content,
      })
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(1);

    if (!latest) continue;

    const ageMinutes = (now - new Date(latest.createdAt).getTime()) / (60 * 1000);
    if (ageMinutes < 45) continue;

    const candidate = poolItems.find((x) => x.content !== latest.content) || poolItems[0];
    if (!candidate) continue;

    const personaDef = COMMUNITY_PERSONAS.find((p) => p.key === candidate.personaKey);
    if (!personaDef) continue;

    const [u] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, personaDef.email));
    if (!u) continue;

    await db.execute(sql`
      DELETE FROM chat_messages
      WHERE room_id = ${roomId} AND content = ${candidate.content}
    `);

    const randomRecentOffsetMs = Math.floor(Math.random() * 14 + 3) * 60 * 1000;
    await db.insert(chatMessages).values({
      roomId,
      userId: u.id,
      content: candidate.content,
      createdAt: new Date(now - randomRecentOffsetMs),
    });
  }
}