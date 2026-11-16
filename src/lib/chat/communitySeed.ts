import 'server-only';
import { desc, eq, sql } from 'drizzle-orm';
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

// Her odada varsayılan olarak hangi topluluk üyelerinin aktif olduğu
const ROOM_PERSONA_KEYS: Record<string, string[]> = {
  'genel-meydan': ['kuzey', 'derin', 'hermes', 'sefirot', 'elif', 'asli'],
  'kabala': ['sefirot', 'leyla', 'hermes', 'derin', 'kaan'],
  'sembolizm': ['hermes', 'derin', 'emre', 'kaan', 'nil'],
  'astroloji': ['kuzey', 'defne', 'hermes', 'burak', 'zeynep'],
  'human-design': ['cem', 'defne', 'mert', 'elif', 'sinan'],
  'numeroloji': ['emre', 'aurora', 'nil', 'zeynep', 'burak'],
  'kelt-druid': ['ogham', 'asli', 'leyla', 'mert'],
  'cakra-sifa': ['aurora', 'asli', 'derin', 'nil', 'sinan'],
};

interface SeedDialogueItem {
  personaKey: string;
  content: string;
  replyToIndex?: number;
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
      content: '4-7-8 nefes tekniğiyle 528 Hz frekansını birleştirince kalp ritmi hemen dengeleniyor Mert, akşam saatleri için en güzel pratik.',
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
      content: 'Assiah senin bu dünyadaki aracın ve düzen kurma disiplinin; Yetzirah ise ruhunun asıl özlemi olan bilgelik ve ufuk arayışıdır. İkisini birleştirdiğinde Kestirme Yol (Shortcut) açılır.',
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
      content: 'Çoğu kişi sadece Güneş burcuna bakıyor ama kariyerde MC, 2. ev ve 6. ev yöneticileri ile Drakonik MC bambaşka bir derinlik veriyor Defne.',
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
      content: 'Duygusal otoritede bir gece uyumak bile kararın rengini tamamen değiştiriyor Mert, en sağlam süzgeç o.',
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

// Eski mesajları silmeden odalarda zaman içinde akmaya devam eden karşılıklı diyalog çiftleri
interface OngoingDialogueChain {
  openerKey: string;
  openerText: string;
  responderKey: string;
  responderText: string;
}

const ONGOING_DIALOGUE_CHAINS: Record<string, OngoingDialogueChain[]> = {
  'genel-meydan': [
    {
      openerKey: 'elif',
      openerText: 'Kozmik Matris Sentez raporundaki 7 katmanlı özeti bugün tekrar not alarak okudum; özellikle gölge yanlarımla yüzleşme kısmı çok ufuk açıcı.',
      responderKey: 'derin',
      responderText: 'Gölgeyi bastırmak yerine onu fark edip dönüştürmek bilincin en büyük sıçrama noktasıdır Elif. İnsan kendi karanlığıyla barıştığında ışığı da parlıyor.',
    },
    {
      openerKey: 'mert',
      openerText: 'Bugün Gezegen Saatleri ekranından Merkür saatini takip edip yarım kalan yazılarımı tamamladım, zihinsel odaklanma gerçekten çok fark ediyor.',
      responderKey: 'hermes',
      responderText: 'Kadim gelenekte doğru eylemi doğru kozmik saatle buluşturmak simyanın ilk adımıdır Mert. Rüzgarı arkana alarak yürümek gibi.',
    },
    {
      openerKey: 'zeynep',
      openerText: 'Kadim Dersler içerisindeki Duygusal Hastalıklar ve Beden Haritası sınavını az önce tamamladım, her fiziksel belirtinin duygusal bir mesajı olduğunu görmek inanılmaz.',
      responderKey: 'aurora',
      responderText: 'Tebrikler Zeynep! Beden asla yalan söylemez; ruhun duymazdan geldiği her duyguyu beden görünür kılar.',
    },
    {
      openerKey: 'kaan',
      openerText: 'Kabalistik 4 Alem ile Human Design analizini yan yana koyduğunuzda ikisinin birbirini nasıl tamamladığını fark ettiniz mi?',
      responderKey: 'sefirot',
      responderText: 'Zaten Human Design da Hayat Ağacı kanalları ve çakra merkezlerinin modern bir sentezidir Kaan; kökleri aynı kadim bilgeliğe dayanır.',
    },
    {
      openerKey: 'asli',
      openerText: 'Günün koşturmacası içinde sadece 3 dakika bile olsa diyafram nefesine dönmek insanı hemen kendi merkezine geri çağırıyor.',
      responderKey: 'kuzey',
      responderText: 'Nefes, ruh ile beden arasındaki en somut köprüdür Aslı; farkındalığın daim olsun.',
    },
    {
      openerKey: 'burak',
      openerText: 'Yeni Ay ve Dolunay geçişlerinde uyku düzenim hep değişiyor. Son zamanlarda gece yatmadan önce 4-7-8 nefesini deniyorum, zihni ciddi anlamda yatıştırıyor.',
      responderKey: 'aurora',
      responderText: 'Ay fazları bedendeki sıvı dengesini ve epifiz bezini doğrudan etkiliyor Burak. Akşam saatlerinde ekran ışığını azaltıp 4-7-8 nefesine geçmek sinir sistemini hemen parasempatik moda alıyor.',
    },
    {
      openerKey: 'nil',
      openerText: 'Bazen gün içinde aynı sayı dizilerini üst üste görmek tesadüf olamayacak kadar net hissettiriyor. Bugün üç kez 11:11 yakaladım.',
      responderKey: 'emre',
      responderText: 'Eşzamanlılıklar zihnin o an hangi frekansta olduğunu gösteren işaret fişekleri gibidir Nil. O an aklından geçen niyeti not almak çok işe yarıyor.',
    },
    {
      openerKey: 'defne',
      openerText: 'Sabah uyanır uyanmaz telefona bakmak yerine ilk 10 dakikayı sessizlikte geçirmeye başladım; günün geri kalanındaki stres eşiğim bambaşka oldu.',
      responderKey: 'leyla',
      responderText: 'Sabahın ilk dakikaları teta dalgalarının hala aktif olduğu en kıymetli eşik Defne. O alanı dış dünyaya değil kendi niyetine açmak bütün günü koruyor.',
    },
    {
      openerKey: 'cem',
      openerText: 'Beden haritasıyla Ruh (Drakonik) haritasını karşılaştırırken en çok Yükselen burçlarımın farkı dikkatimi çekti; dışarıya verdiğim tepkiyle içsel arayışım çok farklıymış.',
      responderKey: 'kuzey',
      responderText: 'Tropikal yükselen hayata taktığımız maske ve savunma kalkanımızdır Cem; Drakonik yükselen ise ruhun o maskenin altında aslında neyi deneyimlemek istediğini fısıldar.',
    },
    {
      openerKey: 'ogham',
      openerText: 'Şehir hayatında betonun içinde kaldıkça insanın enerjisi nasıl da ağırlaşıyor. Bugün yarım saat toprak ve ağaçlarla temas etmek bile zihnimi sıfırladı.',
      responderKey: 'asli',
      responderText: 'Çıplak ayakla toprağa basmak ya da bir ağacın gövdesine yaslanmak bedendeki statik elektriği en hızlı boşaltan yöntem OghamBilgesi.',
    },
  ],

  'kabala': [
    {
      openerKey: 'kaan',
      openerText: 'Yesod küresi Ay ile yönetildiği için rüyalar ve bilinçaltı imgeler bu merkezde toplanıyor. Yesod dengelendiğinde Malkuth yani günlük hayatımız da berraklaşıyor.',
      responderKey: 'sefirot',
      responderText: 'Yesod kirli bir ayna gibiyse üst alemlerden (Tiferet’ten) gelen ışık fiziksel dünyaya çarpık yansır Kaan; içsel arınma bu yüzden şarttır.',
    },
    {
      openerKey: 'leyla',
      openerText: '4 Alem haritasında Atzilut (Helyosentrik / Güneş merkezli) katmanı incelediğimde ego-merkezli bakıştan bütüne hizmet eden saf niyete geçişi çok net hissettim.',
      responderKey: 'hermes',
      responderText: 'Atzilut zaten "Saf İlahi Akış" alemidir Leyla; orada kişisel çıkar değil, evrensel düzendeki öz görevimiz konuşur.',
    },
    {
      openerKey: 'derin',
      openerText: 'Gevurah (Disiplin/Sınır) olmadan Hesed (Merhamet/Bolluk) kontrolsüzce dağılır. Hayatta sınır çizmeyi öğrenmek de ruhsal gelişimin bir parçası.',
      responderKey: 'sefirot',
      responderText: 'Suyun akabilmesi için nehir yatağının (Gevurah) sağlam olması gerekir Derin; sınırlar ışığı hapseden duvarlar değil, onu taşıyan kaptır.',
    },
    {
      openerKey: 'elif',
      openerText: 'Hod (Zihin/Mantık) ve Netzach (Duygu/Arzu) arasındaki denge bozulduğunda insan ya aşırı analizden adım atamıyor ya da dürtüsel kararlar veriyor.',
      responderKey: 'kaan',
      responderText: 'İkisinin ortasındaki Tiferet (Kalp) bilincine çıkmadan o sarkaç hep sallanır Elif. Kalp merkezi mantıkla sezgiyi aynı potada eritiyor.',
    },
    {
      openerKey: 'burak',
      openerText: 'Beriyah (Yaratım) alemiyle Yetzirah (Biçimlenme) alemi arasındaki farkı kendi hayatımda niyet koymak ve o niyeti alışkanlığa dönüştürmek olarak gözlemliyorum.',
      responderKey: 'leyla',
      responderText: 'Tam üstüne bastın Burak; Beriyah tohumun içindeki öz fikir, Yetzirah ise o tohumun filizlenirken aldığı duygusal ve zihinsel kalıptır.',
    },
  ],

  'sembolizm': [
    {
      openerKey: 'emre',
      openerText: 'Hermetik ilkelerden "Yukarıda ne varsa aşağıda da o vardır" yasası, hem astrolojinin hem de kutsal geometrinin temel taşıdır.',
      responderKey: 'hermes',
      responderText: 'Mikrokozmos (insan) ile makrokozmos (evren) birbirinin kusursuz aynasıdır Emre; kendini bilen evreni bilir.',
    },
    {
      openerKey: 'nil',
      openerText: 'Rüyalarda görülen suyun berraklığı doğrudan duygusal bedenin (Yetzirah) o anki durumunu yansıtıyor; bulanık su zihinsel ve duygusal karmaşaya işaret ediyor.',
      responderKey: 'derin',
      responderText: 'Uyumadan önce niyet koymak ve zihni sakinleştirmek rüya sembollerini çok daha netleştiriyor Nil.',
    },
    {
      openerKey: 'leyla',
      openerText: 'Rüyamda sürekli eski bir evin bilmediğim yeni odalarını keşfettiğimi görüyorum. Sembolizm derslerinden sonra bunun kendi bilinçaltımda yeni açılan potansiyeller olduğunu anladım.',
      responderKey: 'hermes',
      responderText: 'Ev arketipi doğrudan kişinin kendi psişesidir ZoharIşığı. Yeni odalar veya çatı katı görmek, daha önce fark etmediğin üst bilinç katmanlarına kapı araladığını gösterir.',
    },
    {
      openerKey: 'mert',
      openerText: 'Ouroboros (kendi kuyruğunu ısıran yılan) sembolü bana hep bitişlerin aslında yeni bir başlangıcın besini olduğunu hatırlatıyor.',
      responderKey: 'emre',
      responderText: 'Simyada "Prima Materia"nın döngüsel dönüşümüdür Mert; doğada ve ruhta hiçbir enerji kaybolmaz, sadece form değiştirir.',
    },
  ],

  'astroloji': [
    {
      openerKey: 'defne',
      openerText: 'Satürn döngüsü (29-30 yaş) insanı gerçekten sahte olan her şeyden arındırıp kendi hakiki omurgasını kurmaya zorluyor.',
      responderKey: 'kuzey',
      responderText: 'Satürn büyük öğretmendir Defne; sabırla inşa edilen hiçbir emeği karşılıksız bırakmaz, sadece temeli çürük olanı yıkar.',
    },
    {
      openerKey: 'burak',
      openerText: 'Drakonik harita ile Tropikal harita arasındaki kavuşumlar, bu enkarnasyona taşıdığımız en güçlü ruhsal sözleşmeleri gösteriyor.',
      responderKey: 'hermes',
      responderText: 'Özellikle Güneş, Ay veya Yükselen dereceleri iki haritada üst üste geliyorsa ruhun kadersel teması çok güçlü çalışır Burak.',
    },
    {
      openerKey: 'elif',
      openerText: 'Yeni Ay dönemlerinde haritamda hangi ev tetikleniyorsa o alanda somut bir tohum ekmeye özen gösteriyorum; Dolunayda ise sonuçları çok net görünür oluyor.',
      responderKey: 'defne',
      responderText: 'Yeni Ay niyetin toprağa düştüğü karanlık ve verimli evredir Elif; özellikle ilk 8 saat içinde niyeti yazıya dökmek o evin enerjisini çok güzel aktive ediyor.',
    },
    {
      openerKey: 'cem',
      openerText: 'Güney Ay Düğümü konfor alanımız olduğu için stres anında hemen oraya kaçıyoruz ama asıl büyüme Kuzey Ay Düğümünün olduğu evin sorumluluğunu alınca başlıyor.',
      responderKey: 'kuzey',
      responderText: 'Güney Düğümü tamamen çöpe atmak değil Cem, oradaki ustalığı Kuzey Düğümün hedefi için yakıt olarak kullanmak gerçek dengeyi kuruyor.',
    },
  ],

  'human-design': [
    {
      openerKey: 'cem',
      openerText: 'Projektörler için en önemli soru "Ben kimim?" değil, "Beni gerçekten kim görüyor ve değerimi tanıyor?" sorusudur.',
      responderKey: 'defne',
      responderText: 'Doğru daveti aldıklarında bir Projektörün rehberliği bütün ekibin enerjisini en verimli şekilde yönlendiriyor Cem.',
    },
    {
      openerKey: 'elif',
      openerText: 'Jeneratör ve MG’ler için tatmin duygusu doğru yolda olduğumuzun, hüsransa stratejiden çıktığımızın en net sinyali.',
      responderKey: 'mert',
      responderText: 'Ne zaman zihnimle "bunu yapmalıyım" diye zorlasam hüsran yaşıyorum Elif; sakral yanıtı beklediğimde ise iş kendiliğinden akıyor.',
    },
    {
      openerKey: 'asli',
      openerText: 'Duygusal Otoriteye sahip biri olarak "hemen şimdi" karar vermemeyi öğrenmek hayatımdaki en büyük özgürlük oldu; duygusal dalganın durulmasını beklemek şart.',
      responderKey: 'cem',
      responderText: 'Solar Pleksus tanımlıysa anlık coşkuyla ya da anlık düşüşle verilen sözler sonradan hep yük oluyor Aslı; "bunun üzerine bir gece uyuyayım" demek en sağlam anahtar.',
    },
  ],

  'numeroloji': [
    {
      openerKey: 'emre',
      openerText: 'Doğum tarihimizdeki rakamlar bu hayata getirdiğimiz araçları, ismimizdeki harf titreşimleri ise bu araçları hangi frekansta kullandığımızı gösterir.',
      responderKey: 'nil',
      responderText: 'Kişisel gün sayımı takip etmeye başladığımdan beri hangi gün dinlenip hangi gün adım atacağımı çok daha dengeli planlıyorum Emre.',
    },
    {
      openerKey: 'zeynep',
      openerText: 'Yaşam Yolu 9 olanların "tamamlanma ve insanlığa şefkat" enerjisi çok yüksek ama geçmişi bırakmakta zorlanabiliyorlar.',
      responderKey: 'aurora',
      responderText: '9 sayısı eski döngüyü sevgiyle uğurlayıp ellerini yeniye açmayı öğrendiğinde gerçek bilgeliğe ulaşır Zeynep.',
    },
    {
      openerKey: 'kaan',
      openerText: '11, 22 ve 33 gibi Üstat Sayılara sahip haritalarda sinir sistemi yüksek voltajlı bir trafo gibi çalışıyor; topraklanma olmazsa içsel gerilim yaratabiliyor.',
      responderKey: 'emre',
      responderText: 'Üstat sayıların sırrı önce alt basamağını (2, 4, 6) sağlamlaştırmaktır Kaan; kökleri sağlam olmayan ağaç yüksek rüzgarı taşıyamaz.',
    },
  ],

  'kelt-druid': [
    {
      openerKey: 'ogham',
      openerText: 'Huş ağacı (Beith) Ogham alfabesinin ilk harfidir; arınmayı, yeni doğuşu ve eski kabuğu geride bırakma cesaretini simgeler.',
      responderKey: 'asli',
      responderText: 'Doğanın dört elementiyle (Toprak, Su, Ateş, Hava) günlük ritmimi uyumlamak zihinsel berraklığımı çok güçlendirdi OghamBilgesi.',
    },
    {
      openerKey: 'leyla',
      openerText: 'Üvez ağacı (Luis) kadim Kelt geleneğinde psi-koruma ve sezgisel ayırt etme gücüyle bilinir; enerji alanını korumak isteyenler için harika bir arketip.',
      responderKey: 'ogham',
      responderText: 'Üvez arketipi dışsal telkinlere kapılmadan kendi içsel hakikatini duymayı öğretir ZoharIşığı.',
    },
    {
      openerKey: 'derin',
      openerText: 'Meşe ağacı (Duir) Keltlerde dayanıklılığın ve zamanın ötesindeki kapıların bekçisidir; zorlu geçiş dönemlerinde Meşe arketipiyle meditasyon yapmak çok güç veriyor.',
      responderKey: 'ogham',
      responderText: 'Druid kelimesinin kökü bile Meşe bilgeliğinden gelir Derin; fırtınada kırılmayan köklerin sırrı oradadır.',
    },
  ],

  'cakra-sifa': [
    {
      openerKey: 'aurora',
      openerText: 'Kalp çakrası (639 Hz) alt üç maddi çakra ile üst üç ruhsal çakranın denge noktasıdır; şefkat ve affetme en güçlü frekans yükselticidir.',
      responderKey: 'asli',
      responderText: 'Sabahları 5 dakika Kutu Nefesi (4-4-4-4) yapmak ve kalp merkezine odaklanmak bütün gün sinir sistemini dengede tutuyor AuroraFrekans.',
    },
    {
      openerKey: 'nil',
      openerText: 'Boğaz çakrası (741 Hz) sadece konuşmakla değil, kendi içsel gerçeğimizi bastırmadan ifade edebilmekle doğrudan bağlantılı.',
      responderKey: 'derin',
      responderText: 'İfade edilemeyen her söz boğaz ve tiroid bölgesinde enerji düğümü oluşturur Nil; ses frekanslarıyla çalışmak bu yüzden çok şifalı.',
    },
    {
      openerKey: 'zeynep',
      openerText: 'Schumann Rezonansında beyaz patlamaların olduğu günlerde baş ağrısı ve kulak çınlaması yaşayan var mı? Bol su içip 432 Hz dinlemek bana çok iyi geldi.',
      responderKey: 'aurora',
      responderText: 'Yerkürenin elektromanyetik alanı yükseldiğinde beyin dalgalarımız da o frekansa uyumlanmaya çalışıyor Zeynep; tuzlu ılık duş ve çıplak ayakla topraklanma semptomları hemen hafifletir.',
    },
  ],
};

const globalForSeed = globalThis as unknown as {
  __communitySeedPromise?: Promise<void> | null;
  __communityEngineLock?: Promise<void> | null;
  __lastReplyScanAt?: number;
  __lastOngoingCheckAt?: number;
};

export async function ensureCommunitySeededAndActive(): Promise<void> {
  if (!globalForSeed.__communitySeedPromise) {
    globalForSeed.__communitySeedPromise = runInitialCommunitySeed().catch((err) => {
      console.error('[communitySeed] Initial seed error:', err);
      globalForSeed.__communitySeedPromise = null;
    });
  }
  await globalForSeed.__communitySeedPromise;

  if (globalForSeed.__communityEngineLock) {
    return globalForSeed.__communityEngineLock;
  }

  const now = Date.now();
  const lastScan = globalForSeed.__lastReplyScanAt || 0;
  if (now - lastScan < 10 * 1000) {
    return;
  }
  globalForSeed.__lastReplyScanAt = now;

  globalForSeed.__communityEngineLock = (async () => {
    try {
      // 1) Geçmişte yanıtsız kalmış gerçek kullanıcı mesajlarını tara ve zamanı gelen yanıtları teslim et
      try {
        await scanAndScheduleUnansweredUserReplies();
        await processDueScheduledReplies();
      } catch (err) {
        console.warn('[communitySeed] Scheduled reply delivery warning:', err);
      }

      // 2) Odalarda eski mesajları silmeden belirli aralıklarla yeni sohbet akışı başlat
      const currentNow = Date.now();
      const lastOngoing = globalForSeed.__lastOngoingCheckAt || 0;
      if (currentNow - lastOngoing > 2 * 60 * 1000) {
        globalForSeed.__lastOngoingCheckAt = currentNow;
        try {
          await advanceOngoingCommunityChat();
        } catch (err) {
          console.warn('[communitySeed] Ongoing chat warning:', err);
        }
      }
    } finally {
      globalForSeed.__communityEngineLock = null;
    }
  })();

  await globalForSeed.__communityEngineLock;
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

  // Mükerrer (çift) zamanlanmış yanıtları temizle
  await db.execute(sql`
    DELETE FROM chat_scheduled_replies a
    USING chat_scheduled_replies b
    WHERE a.reply_to_message_id = b.reply_to_message_id
      AND a.id > b.id
  `);

  // Mükerrer (çift) mesajları temizle
  await db.execute(sql`
    DELETE FROM chat_messages a
    USING chat_messages b
    WHERE a.room_id = b.room_id
      AND a.content = b.content
      AND a.id > b.id
  `);

  // Eski basmakalıp günlük şablon mesajlarını temizle
  await db.execute(sql`
    DELETE FROM chat_messages
    WHERE content LIKE '%gününün yöneticisi%; bugün özellikle%'
       OR content LIKE 'Çok güzel hatırlattın. Ben de bugün % saatinde nefes ve harita sentezimi birleştirerek çalıştım%'
  `);

  await db.execute(sql`
    DELETE FROM chat_scheduled_replies
    WHERE reply_content LIKE '%gününün yöneticisi%; bugün özellikle%'
       OR reply_content LIKE 'Çok güzel hatırlattın. Ben de bugün % saatinde nefes ve harita sentezimi birleştirerek çalıştım%'
  `);

  // Pinokyo veya diğer kullanıcıların Yeni Ay / genel sorularına verilmiş eski basmakalıp yanıtları doğal içerikle güncelle
  await db.execute(sql`
    UPDATE chat_messages
    SET content = 'Yeni Ay dönemleri tohum ekme ve niyeti somutlaştırma vaktidir Pinokyo. Özellikle Yeni Ayın haritanda düştüğü evi Kozmik Gökyüzü Rehberinden kontrol edip o alanla ilgili 3 net niyet yazmanı, akşamları da 4-7-8 nefesiyle zihni sakinleştirmeni öneririm; ilk hilal görünene kadar atılan küçük ama kararlı adımlar çok hızlı kök salar.'
    WHERE content LIKE 'Çok güzel bir noktaya değindin Pinokyo%'
      AND reply_preview_text LIKE '%yeni ayda ne yapmalı%'
  `);

  await db.execute(sql`
    UPDATE chat_messages
    SET content = 'Harika haber Pinokyo! Mobilden bildirimlerle takip etmek ve anlık sohbete katılmak çok daha pratik olmuş, hoş geldin.'
    WHERE reply_preview_text LIKE 'Arkadaşlar Mobil uygulayı guncelleyin%'
  `);

  // Eski ambient rotation nedeniyle gerçek kullanıcı yanıtının altına kaymış olan bot mesajlarını düzelt:
  await db.execute(sql`
    DELETE FROM chat_messages
    WHERE room_id = 'genel-meydan'
      AND content = 'Yeni katılan tüm yolculara hoş geldiniz diyorum. Kadim Dersler bölümündeki okuma sırasını takip etmenizi özellikle tavsiye ederim.'
  `);

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

  // 1. "Nerede / görmedim / bulamadım / nasıl girilir" uygulama içi yönlendirme soruları
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

  // 2. Yeni Ay / Dolunay / Ay Fazları / Tutulma soruları ve paylaşımları
  if (
    lower.includes('yeni ay') ||
    lower.includes('yeniay') ||
    lower.includes('dolunay') ||
    lower.includes('tutulma') ||
    lower.includes('hilal') ||
    lower.includes('ay faz')
  ) {
    const moonPool = [
      `Yeni Ay dönemleri tohum ekme ve niyeti somutlaştırma vaktidir ${firstName}. Özellikle Yeni Ayın haritanda düştüğü evi Kozmik Gökyüzü Rehberinden kontrol edip o alanla ilgili 3 net niyet yazmanı, akşamları da 4-7-8 nefesiyle zihni sakinleştirmeni öneririm; ilk hilal görünene kadar atılan küçük ama kararlı adımlar çok hızlı kök salar.`,
      `Ay döngülerinde Yeni Ay içe çekilip niyet belirleme, Dolunay ise artık hizmet etmeyen yükleri bırakma ve tamamlanma evresidir ${firstName}. Bu süreçte su tüketimini artırmak, 528 Hz frekansıyla kısa bir nefes çalışması yapmak ve öğrendiğin dersleri günlük küçük rutinlere dökmek enerjiyi çok dengeli tutar.`,
      `Yeni Ay enerjisinde zihin çok hızlı dağılabildiği için bir deftere bu döngüde hayatında neyi başlatmak istediğini şimdiki zaman kipiyle yazmak çok etkilidir ${firstName}. Ayrıca Gezegen Saatlerinden Jüpiter veya Güneş saatini seçip niyet çalışmanı o vakitte yaparsan akış çok daha güçlü çalışır.`,
    ];
    return moonPool[Math.floor(Math.random() * moonPool.length)];
  }

  // 3. Gezegen Saatleri ile ilgili mesajlar
  if (
    lower.includes('gezegen saat') ||
    lower.includes('merkür saat') ||
    lower.includes('jüpiter saat') ||
    lower.includes('venüs saat') ||
    lower.includes('mars saat') ||
    lower.includes('satürn saat') ||
    lower.includes('güneş saat') ||
    lower.includes('ay saat')
  ) {
    const planetaryPool = [
      `Gezegen saatleriyle hizalanmak akıntıya karşı yüzmeyi bırakıp rüzgarı arkana almak gibidir ${firstName}. Özellikle önemli başlangıçları Güneş veya Jüpiter saatine, derin araştırma ve yazıları Merkür saatine, içsel arınma ve yapılandırmayı Satürn saatine denk getirdiğinde verim katlanarak artıyor.`,
      `Ben de günümü planlarken mutlaka Keldani gezegen sırasına bakıyorum ${firstName}. Mars saatinde tartışmalardan kaçınıp fiziksel harekete odaklanmak, Venüs saatinde ise sanata ve ikili ilişkilere vakit ayırmak günün ritmini bambaşka bir dengeye oturtuyor.`,
    ];
    return planetaryPool[Math.floor(Math.random() * planetaryPool.length)];
  }

  // 4. Çakra, Frekans, Nefes, Schumann, Uyku, Yorgunluk, Baş Ağrısı
  if (
    lower.includes('schumann') ||
    lower.includes('frekans') ||
    lower.includes('çakra') ||
    lower.includes('cakra') ||
    lower.includes('nefes') ||
    lower.includes('baş ağrı') ||
    lower.includes('yorgun') ||
    lower.includes('uyku') ||
    lower.includes('çınlama') ||
    lower.includes('topraklan')
  ) {
    const healingPool = [
      `Yerkürenin elektromanyetik frekansı yükseldiğinde veya yoğun enerji geçişlerinde sinir sistemi ilk tepkiyi verir ${firstName}. Gün içinde 5 dakika Kutu Nefesi (4-4-4-4) uygulamak, bol su içmek ve mümkünse çıplak ayakla toprağa basmak bedendeki fazla statik yükü hemen boşaltır.`,
      `Beden ve enerji alanı yorulduğunda zorlamak yerine 432 Hz veya 528 Hz frekansını kısık seste açıp diyafram nefesine dönmek en hızlı şifadır ${firstName}. Özellikle Kök ve Kalp çakrası dengelendiğinde zihinsel ağırlık kendiliğinden dağılıyor.`,
    ];
    return healingPool[Math.floor(Math.random() * healingPool.length)];
  }

  // 5. Rüya, Sembol, İşaret, Sayı Sekansları (11:11 vb.)
  if (
    lower.includes('rüya') ||
    lower.includes('ruya') ||
    lower.includes('sembol') ||
    lower.includes('11:11') ||
    lower.includes('işaret') ||
    lower.includes('kabus') ||
    lower.includes('arketip')
  ) {
    const symbolPool = [
      `Rüyalar ve gün içinde karşılaştığımız tekrarlayan semboller, bilinçaltının (Yesod küresinin) bizimle kurduğu doğrudan dildir ${firstName}. Uyanır uyanmaz rüya detaylarını veya o sembolü gördüğün anki duygunu birkaç cümleyle not edersen birkaç hafta içinde kendi kişisel sembol sözlüğün ortaya çıkar.`,
      `Sembolizmde dışsal anlamdan çok o imgenin sende uyandırdığı ilk his önemlidir ${firstName}. Uykudan önce zihni sakinleştirip "Bu gece ihtiyacım olan rehberliği berraklıkla hatırlamaya niyet ediyorum" demek rüya kanalını çok netleştirir.`,
    ];
    return symbolPool[Math.floor(Math.random() * symbolPool.length)];
  }

  // 6. Harita, Burç, Yükselen, Drakonik / Ruh Haritası, Kuzey Düğümü, Satürn
  if (
    lower.includes('harita') ||
    lower.includes('drakonik') ||
    lower.includes('ruh harita') ||
    lower.includes('yükselen') ||
    lower.includes('kuzey düğüm') ||
    lower.includes('güney düğüm') ||
    lower.includes('satürn') ||
    lower.includes('chiron') ||
    lower.includes('transit')
  ) {
    const astroPool = [
      `Tropikal (Beden) haritamız bu dünyadaki karakterimizi ve elimizdeki araçları anlatırken, Drakonik (Ruh) haritamız o araçlarla hangi kadersel amacı gerçekleştirmeye geldiğimizi gösterir ${firstName}. İki harita arasındaki kavuşum derecelerine bakmak insana kendi içsel pusulasını bulduruyor.`,
      `Haritada özellikle Kuzey Ay Düğümünün bulunduğu ev ve burç, ruhun bu hayatta büyüme yönüdür ${firstName}. Konfor alanı olan Güney Düğümden çıkıp Kuzey Düğüm temasına cesaretle adım attığında transitler de seni desteklemeye başlar.`,
    ];
    return astroPool[Math.floor(Math.random() * astroPool.length)];
  }

  // 7. Human Design (Projektör, Jeneratör, MG, Manifestör, Reflektör, Otorite)
  if (
    lower.includes('human design') ||
    lower.includes('projektör') ||
    lower.includes('jeneratör') ||
    lower.includes('manifestör') ||
    lower.includes('reflektör') ||
    lower.includes('otorite') ||
    lower.includes('sakral')
  ) {
    const hdPool = [
      `Human Design’da en büyük dönüşüm, kararları zihnin korkularıyla değil kendi İçsel Otoritenle almaya başladığında yaşanıyor ${firstName}. Tanımsız merkezlerinden aldığın dış baskıları "bu benim enerjim değil" diyerek bıraktığında bedenin çok hafifliyor.`,
      `Kendi enerji tipinin stratejisine güvendiğinde hayattaki direnç noktaları tek tek çözülüyor ${firstName}. Zorlayarak kapı açmaya çalışmak yerine doğru zamanlamayı ve içsel onayı beklemek her zaman en doğru insanlarla buluşturuyor.`,
    ];
    return hdPool[Math.floor(Math.random() * hdPool.length)];
  }

  // 8. Kabala, Sefirot, Hayat Ağacı, 4 Alem
  if (
    lower.includes('kabala') ||
    lower.includes('sefirot') ||
    lower.includes('sefira') ||
    lower.includes('hayat ağacı') ||
    lower.includes('atzilut') ||
    lower.includes('beriyah') ||
    lower.includes('yetzirah') ||
    lower.includes('assiah') ||
    lower.includes('tiferet') ||
    lower.includes('yesod') ||
    lower.includes('malkuth')
  ) {
    const kabbalahPool = [
      `Hayat Ağacındaki her Sefira aslında kendi iç dünyamızdaki bir bilinç durağıdır ${firstName}. Sağ sütundaki merhamet ve genişlemeyi (Hesed), sol sütundaki disiplin ve sınırla (Gevurah) dengelediğimizde Orta Sütundaki kalp bilinci (Tiferet) kendiliğinden açılır.`,
      `4 Alem sentezinde niyetin (Atzilut) düşünceye (Beriyah), düşüncenin duyguya (Yetzirah) ve en sonunda fiziksel eyleme (Assiah/Malkuth) nasıl indiğini izlemek muazzam bir farkındalık veriyor ${firstName}.`,
    ];
    return kabbalahPool[Math.floor(Math.random() * kabbalahPool.length)];
  }

  // 9. Genel tavsiye / "ne yapmalı / ne önerirsiniz / sizce" soruları
  if (
    lower.includes('ne yapmalı') ||
    lower.includes('ne yapmali') ||
    lower.includes('ne önerir') ||
    lower.includes('tavsiye') ||
    lower.includes('nasıl başla') ||
    lower.includes('sizce') ||
    lower.includes('?')
  ) {
    const advicePool = [
      `Bence en güzeli öğrendiklerini bir anda yüklenmek yerine her gün tek bir küçük pratiği hayata geçirmek ${firstName}. Sabahları günün gezegen saatine ve gökyüzü sentezine bakıp niyetini belirlemek, akşamları da 5 dakika nefesle günü kapatmak öğrendiğin tüm kadim bilgileri sindirmeni sağlar.`,
      `Bu dönemde zihni çok fazla bilgiyle yormaktansa kendi içsel ritmini dinlemek çok daha kıymetli ${firstName}. Kişisel Analizlerindeki gölge ve potansiyel maddelerinden sadece bir tanesini seçip bu hafta hayatında onu gözlemlemeni öneririm; deneyimlenmeyen bilgi sadece zihinde kalıyor.`,
      `Benim deneyimimde en kalıcı dönüşüm, Kadim Derslerdeki teorik bilgiyi günlük nefes, frekans ve gezegen saati takibiyle birleştirince oldu ${firstName}. Küçük ama istikrarlı adımlar her zaman en derin kökü salıyor.`,
    ];
    return advicePool[Math.floor(Math.random() * advicePool.length)];
  }

  // 10. Selamlaşma / Merhaba
  if (
    lower === 'merhaba' ||
    lower === 'selam' ||
    lower === 'selamlar' ||
    lower.startsWith('merhaba ') ||
    lower.startsWith('selam ') ||
    lower.includes('iyi akşamlar') ||
    lower.includes('günaydın')
  ) {
    return `Hoş geldin ${firstName}, meclisimize selamlar! Analizlerin, gökyüzü gündemi veya Kadim Dersler hakkında konuşmak istediğin bir konu olursa keyifle sohbet edebiliriz.`;
  }

  // 11. Teşekkür
  if (lower.includes('teşekkür') || lower.includes('sağ ol') || lower.includes('eyvallah') || lower.includes('harika')) {
    const thanksPool = [
      `Rica ederim ${firstName}, bu yolda birbirimize ayna tutmak hepimizin farkındalığını büyütüyor. Katkın için ben teşekkür ederim.`,
      `Ne demek ${firstName}, mecliste deneyimlerin paylaşılması enerjiyi çok daha berraklaştırıyor. Yolun açık olsun.`,
      `Keyifle ${firstName}, kendi içsel gözlemlerini de fırsat buldukça paylaşırsan memnuniyetle okuruz.`,
    ];
    return thanksPool[Math.floor(Math.random() * thanksPool.length)];
  }

  // 12. Odaya özel doğal, kalıpsız sohbet yanıt havuzları
  const roomReplies: Record<string, string[]> = {
    'genel-meydan': [
      `Günlük gökyüzü sentezini ve kendi içsel ritmini bir arada gözlemlediğinde taşlar çok daha hızlı yerine oturuyor ${firstName}. Özellikle kendi deneyimlerini not alarak ilerlemek büyük fark yaratıyor.`,
      `İlk başta kavramlar yoğun gelebilir ama hem analizlerdeki özet katmanları hem de Kadim Dersleri sindire sindire ilerledikçe her şey kendi içinde bir bütün oluşturuyor ${firstName}.`,
      `Günün telaşı içinde kendi merkezinde kalıp nefes ve frekans pratiklerini rutine eklemek bile insanın enerji alanını hemen toparlıyor ${firstName}.`,
      `Hepimizin haritası parmak izi gibi eşsiz ${firstName}; öğrendiğimiz bu kadim araçları kendi hayatımızda test ettikçe içsel rehberliğimiz çok daha net duyuluyor.`,
      `Paylaştığın bu deneyim çok kıymetli ${firstName}. İnsanın kendi döngülerini fark etmesi, otomatik pilottan çıkıp hayatının direksiyonuna geçmesinin ilk adımı.`,
    ],
    'kabala': [
      `Hayat Ağacında her küre (Sefira) aslında kendi bilincimizin bir katmanıdır ${firstName}; Assiah’ta fark ettiğin her kalıp Yetzirah ve Beriyah’ta çözülmeye başlar.`,
      `Beden (Tropikal) ve Ruh (Drakonik) haritalarını 4 Alem matrisinde karşılaştırdığında hangi kürede denge kurman gerektiği çok net görülüyor ${firstName}.`,
      `Orta sütun (Keter - Tiferet - Yesod - Malkuth) dengesini koruduğunda sağ ve sol sütun arasındaki kutupluluk kendiliğinden uyumlanır ${firstName}.`,
      `Kabala’da bilgi sadece zihinde kaldığında Hod küresinde sıkışır ${firstName}; onu kalbe (Tiferet) ve günlük eyleme (Malkuth) indirdiğimizde gerçek simya başlıyor.`,
    ],
    'sembolizm': [
      `Kadim semboller zihnin mantık filtresini aşarak doğrudan bilinçaltı ve üst-bilinçle konuşur ${firstName}; gördüğün işaretleri not almak harika bir pratik.`,
      `Kutsal geometri ve arketipler üzerine tefekkür ettikçe hayatın içindeki eşzamanlılıkların (synchronicity) dili çok daha anlaşılır hale geliyor ${firstName}.`,
      `Doğa ve evren bizimle kelimelerle değil sembollerle ve oranlarla konuşuyor ${firstName}; içsel gözlem derinleştikçe her olay bir ayna haline geliyor.`,
    ],
    'astroloji': [
      `Doğum haritasında özellikle Kuzey Ay Düğümü, Satürn ve MC (Tepe Noktası) üçlüsünü birlikte okumak kadersel yönü çok berraklaştırıyor ${firstName}.`,
      `Gezegen transitlerini birer zorlama değil, içimizdeki potansiyeli uyandıran göksel gelişim pencereleri olarak gördüğümüzde akış tamamen değişiyor ${firstName}.`,
      `Tropikal harita dünyadaki aracımızı, Drakonik harita ise ruhsal pusulamızı gösteriyor ${firstName}; ikisini birlikte değerlendirmek en sağlıklısı.`,
    ],
    'human-design': [
      `Human Design’da zihni karar mekanizması olmaktan çıkarıp kendi Strateji ve Otoritemize güvendiğimiz anda direnç kalkıyor ${firstName}.`,
      `Özellikle tanımsız (açık) merkezlerimizden aldığımız dış koşullandırmaları fark etmek bile enerjimizi korumada devrim yaratıyor ${firstName}.`,
      `Kendi tasarımına uygun yaşamak bencilce değil ${firstName}; tam aksine kendi frekansın doğru çalıştığında çevrene de en temiz enerjiyi yayıyorsun.`,
    ],
    'numeroloji': [
      `Doğum tarihinden gelen Yaşam Yolu sayısı ile isimdeki harflerin çakra titreşimi birleştiğinde kişinin yaşam melodisi ortaya çıkıyor ${firstName}.`,
      `Kişisel yıl ve kişisel gün döngülerine uyumlanarak adım atmak, doğru mevsimde doğru tohumu ekmek gibi ${firstName}.`,
      `Sayılar evrenin temel mimarisidir ${firstName}; kendi haritandaki sayısal dengeleri fark etmek eksik kalan çakra enerjilerini tamamlamayı çok kolaylaştırıyor.`,
    ],
    'kelt-druid': [
      `Doğanın döngüleri ve Kelt ağaç arketipleri bize her mevsimin ve her ruh halinin bir bilgeliği olduğunu hatırlatıyor ${firstName}.`,
      `Topraklanma ve doğanın ritmiyle hizalanmak, zihinsel karmaşayı en hızlı şifalandıran kadim anahtarlardan biri ${firstName}.`,
      `Ogham bilgeliğinde her ağaç bir öğretmendir ${firstName}; kendi doğum ağacının gölge ve ışık yönlerini gözlemlemek doğayla bağını çok güçlendirir.`,
    ],
    'cakra-sifa': [
      `Nefes çalışmalarıyla Solfeggio frekanslarını birleştirmek otonom sinir sistemini ve çakra akışını çok hızlı dengeliyor ${firstName}.`,
      `Schumann Rezonansının yükseldiği günlerde su tüketimini artırmak ve kök-kalp çakra dengesine odaklanmak bedeni çok rahatlatıyor ${firstName}, şifa olsun.`,
      `Ses frekansları ve bilinçli nefes hücresel düzeyde rezonans yaratıyor ${firstName}; günde 10 dakika bile düzenli uygulamak enerji bedenini berraklaştırır.`,
    ],
  };

  const pool = roomReplies[roomId] || roomReplies['genel-meydan'];
  return pool[Math.floor(Math.random() * pool.length)];
}

async function pickDefaultPersonaUserIdForRoom(roomId: string): Promise<string | null> {
  const keys = ROOM_PERSONA_KEYS[roomId] || ROOM_PERSONA_KEYS['genel-meydan'];
  const pickedKey = keys[Math.floor(Math.random() * keys.length)];
  const persona = COMMUNITY_PERSONAS.find((p) => p.key === pickedKey) || COMMUNITY_PERSONAS[0];
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, persona.email));
  return u?.id || null;
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

    // Eğer Yanıtla'ya basmadan mesaj içinde @TakmaAd yazdıysa onu yakala
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

    // Kullanıcı kimseyi etiketlemeden doğrudan odaya mesaj/soru yazdıysa, o odadaki uygun bir topluluk üyesi yanıtlasın
    if (!targetUserId) {
      targetUserId = await pickDefaultPersonaUserIdForRoom(params.roomId);
    }

    if (!targetUserId || targetUserId === params.senderUserId) {
      return;
    }

    // Bu mesaja zaten bekleyen veya gönderilmiş bir yanıt varsa tekrar ekleme
    const existingReply = await db.execute<{ id: string }>(sql`
      SELECT id FROM chat_messages WHERE reply_to_id = ${params.userMessageId}
      UNION ALL
      SELECT id FROM chat_scheduled_replies WHERE reply_to_message_id = ${params.userMessageId} AND delivered = FALSE
      LIMIT 1
    `);
    if (existingReply.rows && existingReply.rows.length > 0) {
      return;
    }

    // Yanıt verecek kişi bir topluluk profili (@7layers.internal) mi kontrol et
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
        ${deliverAt.toISOString()}::timestamptz
      )
    `);

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
 * Geçmişte gerçek bir kullanıcının yazdığı ama henüz hiçbir yanıt almamış mesajları tarar ve kuyruğa ekler.
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
      AND NOT EXISTS (
        SELECT 1 FROM chat_messages r WHERE r.reply_to_id = m.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM chat_scheduled_replies sr WHERE sr.reply_to_message_id = m.id AND sr.delivered = FALSE
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
      const cleanPreview = row.reply_preview_name.replace(/^@/, '').trim().toLocaleLowerCase('tr-TR');
      const matchedPersona = COMMUNITY_PERSONAS.find((p) => {
        const displayName = formatSafeDisplayName(p.fullName, p.email, p.nickname).toLocaleLowerCase('tr-TR');
        const nick = (p.nickname || '').toLocaleLowerCase('tr-TR');
        return displayName === cleanPreview || nick === cleanPreview || displayName.includes(cleanPreview);
      });
      if (matchedPersona) {
        personaEmail = matchedPersona.email;
      }
    }

    if (!personaEmail) {
      const keys = ROOM_PERSONA_KEYS[row.room_id] || ROOM_PERSONA_KEYS['genel-meydan'];
      const fallbackPersona = COMMUNITY_PERSONAS.find((p) => p.key === keys[0]) || COMMUNITY_PERSONAS[0];
      personaEmail = fallbackPersona.email;
    }

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
        ${deliverAt.toISOString()}::timestamptz
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
    const [origMsg] = await db
      .select({ id: chatMessages.id })
      .from(chatMessages)
      .where(eq(chatMessages.id, row.reply_to_message_id));

    if (!origMsg) continue;

    // Aynı yanıt zaten eklendiyse tekrar ekleme
    const alreadyReplied = await db.execute<{ id: string }>(sql`
      SELECT id FROM chat_messages
      WHERE reply_to_id = ${row.reply_to_message_id}
        AND user_id = ${row.persona_user_id}
      LIMIT 1
    `);
    if (alreadyReplied.rows && alreadyReplied.rows.length > 0) continue;

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

    // Alıcı gerçek bir kullanıcıysa bildirim gönder (botlar arası yanıtlarda bildirim tablosunu şişirme)
    const [recipientUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, row.recipient_user_id));

    if (recipientUser && !recipientUser.email.endsWith('@7layers.internal')) {
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
}

/**
 * Eski mesajları silmeden, odalarda son mesajın üzerinden 45-75 dk geçtiyse
 * yeni bir topluluk mesajı ekler ve 8-22 dk sonrasına başka bir topluluk üyesinin yanıtını planlar.
 */
async function advanceOngoingCommunityChat(): Promise<void> {
  // Türkiye saatiyle gece 01:00 - 07:59 arasında botlar yeni sohbet başlatmasın
  const trHour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Istanbul',
      hour: 'numeric',
      hour12: false,
    }).format(new Date())
  );
  if (trHour >= 1 && trHour < 8) {
    return;
  }

  const now = Date.now();
  const roomIds = Object.keys(ONGOING_DIALOGUE_CHAINS);

  for (let idx = 0; idx < roomIds.length; idx++) {
    const roomId = roomIds[idx];
    // Her odanın eşiği biraz farklı olsun (60 dk ile 95 dk arası) ki aynı dakikada yazmasınlar
    const thresholdMinutes = 60 + idx * 5;

    const recentRows = await db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);

    if (recentRows.length === 0) continue;

    const latest = recentRows[0];
    const ageMinutes = (now - new Date(latest.createdAt).getTime()) / (60 * 1000);
    if (ageMinutes < thresholdMinutes) continue;

    // Bu odada halihazırda bekleyen bir zamanlanmış yanıt varsa onun çıkmasını bekle
    const pendingInRoom = await db.execute<{ id: string }>(sql`
      SELECT id FROM chat_scheduled_replies
      WHERE room_id = ${roomId} AND delivered = FALSE
      LIMIT 1
    `);
    if (pendingInRoom.rows && pendingInRoom.rows.length > 0) continue;

    const recentContents = new Set(recentRows.map((r) => r.content));
    const chains = ONGOING_DIALOGUE_CHAINS[roomId] || [];
    const chosenChain = chains.find((c) => !recentContents.has(c.openerText));

    if (!chosenChain) continue;

    const openerDef = COMMUNITY_PERSONAS.find((p) => p.key === chosenChain.openerKey);
    const responderDef = COMMUNITY_PERSONAS.find((p) => p.key === chosenChain.responderKey);
    if (!openerDef || !responderDef) continue;

    const [openerUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, openerDef.email));
    const [responderUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, responderDef.email));
    if (!openerUser || !responderUser) continue;

    const openerDisplayName = formatSafeDisplayName(openerDef.fullName, openerDef.email, openerDef.nickname);
    const responderDisplayName = formatSafeDisplayName(responderDef.fullName, responderDef.email, responderDef.nickname);

    // 1. Açılış mesajını şimdi ekle
    const [insertedOpener] = await db
      .insert(chatMessages)
      .values({
        roomId,
        userId: openerUser.id,
        content: chosenChain.openerText,
      })
      .returning({ id: chatMessages.id });

    // 2. Karşılık verecek diğer topluluk üyesinin yanıtını 8-22 dk sonrasına zamanla
    const replyDelayMinutes = Math.floor(Math.random() * 15) + 8; // 8..22 dk
    const deliverAt = new Date(Date.now() + replyDelayMinutes * 60 * 1000);

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
        ${roomId},
        ${roomId},
        '💬',
        ${responderUser.id},
        ${responderDisplayName},
        ${openerUser.id},
        ${openerDisplayName},
        ${insertedOpener.id},
        ${chosenChain.openerText.slice(0, 90)},
        ${chosenChain.responderText},
        ${deliverAt.toISOString()}::timestamptz
      )
    `);
  }
}
