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
      responderText: 'Kesinlikle Elif, gölgeyi bastırmak yerine onu fark edip dönüştürmek bilincin en büyük sıçrama noktasıdır.',
    },
    {
      openerKey: 'mert',
      openerText: 'Bugün Gezegen Saatleri ekranından Merkür saatini takip edip yarım kalan yazılarımı tamamladım, zihinsel odaklanma gerçekten çok fark ediyor.',
      responderKey: 'hermes',
      responderText: 'Kadim gelenekte "doğru eylemi doğru kozmik saatle buluşturmak" simyanın ilk adımıdır Mert, harika bir gözlem.',
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
      responderText: 'Çok doğru bir nokta Kaan. Zaten Human Design da Hayat Ağacı kanalları ve çakra merkezlerinin modern bir sentezidir; kökleri aynı kadim bilgeliğe dayanır.',
    },
    {
      openerKey: 'asli',
      openerText: 'Günün koşturmacası içinde sadece 3 dakika bile olsa diyafram nefesine dönmek insanı hemen kendi merkezine geri çağırıyor.',
      responderKey: 'kuzey',
      responderText: 'Nefes, ruh ile beden arasındaki en somut köprüdür Aslı; farkındalığın daim olsun.',
    },
  ],

  'kabala': [
    {
      openerKey: 'kaan',
      openerText: 'Yesod küresi Ay ile yönetildiği için rüyalar ve bilinçaltı imgeler bu merkezde toplanıyor. Yesod dengelendiğinde Malkuth yani günlük hayatımız da berraklaşıyor.',
      responderKey: 'sefirot',
      responderText: 'Çok doğru Kaan. Yesod kirli bir ayna gibiyse üst alemlerden (Tiferet’ten) gelen ışık fiziksel dünyaya çarpık yansır; içsel arınma bu yüzden şarttır.',
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
      responderText: 'Harika bir özet Derin. Suyun akabilmesi için nehir yatağının (Gevurah) sağlam olması gerekir.',
    },
  ],

  'sembolizm': [
    {
      openerKey: 'emre',
      openerText: 'Hermetik ilkelerden "Yukarıda ne varsa aşağıda da o vardır" yasası, hem astrolojinin hem de kutsal geometrinin temel taşıdır.',
      responderKey: 'hermes',
      responderText: 'Mikrokozmos (insan) ile makrokozmos (evren) birbirinin kusursuz aynasıdır; kendini bilen evreni bilir.',
    },
    {
      openerKey: 'nil',
      openerText: 'Rüyalarda görülen suyun berraklığı doğrudan duygusal bedenin (Yetzirah) o anki durumunu yansıtıyor; bulanık su zihinsel ve duygusal karmaşaya işaret ediyor.',
      responderKey: 'derin',
      responderText: 'Çok yerinde bir tespit Nil. Uyumadan önce niyet koymak ve zihni sakinleştirmek rüya sembollerini çok daha netleştiriyor.',
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
      responderText: 'Özellikle Güneş, Ay veya Yükselen dereceleri iki haritada üst üste geliyorsa ruhun kadersel teması çok güçlü çalışır.',
    },
  ],

  'human-design': [
    {
      openerKey: 'cem',
      openerText: 'Projektörler için en önemli soru "Ben kimim?" değil, "Beni gerçekten kim görüyor ve değerimi tanıyor?" sorusudur.',
      responderKey: 'defne',
      responderText: 'Ve doğru daveti aldıklarında bir Projektörün rehberliği bütün ekibin enerjisini en verimli şekilde yönlendiriyor.',
    },
    {
      openerKey: 'elif',
      openerText: 'Jeneratör ve MG’ler için tatmin duygusu doğru yolda olduğumuzun, hüsransa stratejiden çıktığımızın en net sinyali.',
      responderKey: 'mert',
      responderText: 'Ne zaman zihnimle "bunu yapmalıyım" diye zorlasam hüsran yaşıyorum; sakral yanıtı beklediğimde ise iş kendiliğinden akıyor.',
    },
  ],

  'numeroloji': [
    {
      openerKey: 'emre',
      openerText: 'Doğum tarihimizdeki rakamlar bu hayata getirdiğimiz araçları, ismimizdeki harf titreşimleri ise bu araçları hangi frekansta kullandığımızı gösterir.',
      responderKey: 'nil',
      responderText: 'Kişisel gün sayımı takip etmeye başladığımdan beri hangi gün dinlenip hangi gün adım atacağımı çok daha dengeli planlıyorum.',
    },
    {
      openerKey: 'zeynep',
      openerText: 'Yaşam Yolu 9 olanların "tamamlanma ve insanlığa şefkat" enerjisi çok yüksek ama geçmişi bırakmakta zorlanabiliyorlar.',
      responderKey: 'aurora',
      responderText: 'Çok doğru Zeynep; 9 sayısı eski döngüyü sevgiyle uğurlayıp ellerini yeniye açmayı öğrendiğinde gerçek bilgeliğe ulaşır.',
    },
  ],

  'kelt-druid': [
    {
      openerKey: 'ogham',
      openerText: 'Huş ağacı (Beith) Ogham alfabesinin ilk harfidir; arınmayı, yeni doğuşu ve eski kabuğu geride bırakma cesaretini simgeler.',
      responderKey: 'asli',
      responderText: 'Doğanın dört elementiyle (Toprak, Su, Ateş, Hava) günlük ritmimi uyumlamak zihinsel berraklığımı çok güçlendirdi.',
    },
    {
      openerKey: 'leyla',
      openerText: 'Üvez ağacı (Luis) kadim Kelt geleneğinde psi-koruma ve sezgisel ayırt etme gücüyle bilinir; enerji alanını korumak isteyenler için harika bir arketip.',
      responderKey: 'ogham',
      responderText: 'Kesinlikle ZoharIşığı; Üvez arketipi dışsal telkinlere kapılmadan kendi içsel hakikatini duymayı öğretir.',
    },
  ],

  'cakra-sifa': [
    {
      openerKey: 'aurora',
      openerText: 'Kalp çakrası (639 Hz) alt üç maddi çakra ile üst üç ruhsal çakranın denge noktasıdır; şefkat ve affetme en güçlü frekans yükselticidir.',
      responderKey: 'asli',
      responderText: 'Sabahları 5 dakika Kutu Nefesi (4-4-4-4) yapmak ve kalp merkezine odaklanmak bütün gün sinir sistemini dengede tutuyor.',
    },
    {
      openerKey: 'nil',
      openerText: 'Boğaz çakrası (741 Hz) sadece konuşmakla değil, kendi içsel gerçeğimizi bastırmadan ifade edebilmekle doğrudan bağlantılı.',
      responderKey: 'derin',
      responderText: 'İfade edilemeyen her söz boğaz ve tiroid bölgesinde enerji düğümü oluşturur Nil; ses frekanslarıyla çalışmak bu yüzden çok şifalı.',
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

  // 2. Selamlaşma / Merhaba
  if (
    lower === 'merhaba' ||
    lower === 'selam' ||
    lower === 'selamlar' ||
    lower.startsWith('merhaba ') ||
    lower.startsWith('selam ') ||
    lower.includes('iyi akşamlar') ||
    lower.includes('günaydın')
  ) {
    return `Hoş geldin ${firstName}, meclisimize selamlar! Analizlerin veya Kadim Dersler hakkında merak ettiğin bir konu olursa burada birlikte değerlendirebiliriz.`;
  }

  // 3. Teşekkür
  if (lower.includes('teşekkür') || lower.includes('sağ ol') || lower.includes('eyvallah') || lower.includes('harika')) {
    const thanksPool = [
      `Rica ederim ${firstName}, bu yolda birbirimize ayna tutmak hepimizin farkındalığını büyütüyor. Katkın için ben teşekkür ederim.`,
      `Ne demek ${firstName}, mecliste deneyimlerin paylaşılması enerjiyi çok daha berraklaştırıyor. Yolun açık olsun.`,
      `Çok mutlu oldum ${firstName}, kendi içsel gözlemlerini de fırsat buldukça paylaşırsan keyifle okuruz.`,
    ];
    return thanksPool[Math.floor(Math.random() * thanksPool.length)];
  }

  // 4. Odaya özel bağlamsal yanıt havuzları
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

function getDynamicDayDialogue(roomId: string): OngoingDialogueChain {
  const trDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
  const dayIndex = trDate.getDay(); // 0 Pazar .. 6 Cumartesi
  const dateLabel = trDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

  const dayRulers: Record<number, { dayName: string; planet: string; theme: string }> = {
    0: { dayName: 'Pazar', planet: 'Güneş', theme: 'öz bilinç, Tiferet kalp merkezi ve yaşam enerjisi' },
    1: { dayName: 'Pazartesi', planet: 'Ay', theme: 'sezgiler, Yesod bilinçaltı akışı ve duygusal denge' },
    2: { dayName: 'Salı', planet: 'Mars', theme: 'irade gücü, Gevurah disiplini ve kararlı adım atma' },
    3: { dayName: 'Çarşamba', planet: 'Merkür', theme: 'idrak, Hod zihinsel berraklığı ve sembol okumaları' },
    4: { dayName: 'Perşembe', planet: 'Jüpiter', theme: 'bilgelik, Hesed bolluk frekansı ve yüksek ufuklar' },
    5: { dayName: 'Cuma', planet: 'Venüs', theme: 'uyum, Netzach kalp rezonansı ve içsel huzur' },
    6: { dayName: 'Cumartesi', planet: 'Satürn', theme: 'köklenme, Binah idraki ve karmik dersleri tamamlama' },
  };

  const info = dayRulers[dayIndex] || dayRulers[0];
  const keys = ROOM_PERSONA_KEYS[roomId] || ROOM_PERSONA_KEYS['genel-meydan'];
  const openerKey = keys[dayIndex % keys.length];
  const responderKey = keys[(dayIndex + 1) % keys.length];

  return {
    openerKey,
    openerText: `${dateLabel} ${info.dayName} gününün yöneticisi ${info.planet}; bugün özellikle ${info.theme} üzerine tefekkür etmek çok güçlü sonuçlar veriyor.`,
    responderKey,
    responderText: `Çok güzel hatırlattın. Ben de bugün ${info.planet} saatinde nefes ve harita sentezimi birleştirerek çalıştım, akış çok berraktı.`,
  };
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
    // Her odanın eşiği biraz farklı olsun (45 dk ile 73 dk arası) ki aynı dakikada yazmasınlar
    const thresholdMinutes = 45 + idx * 4;

    const recentRows = await db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(35);

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
    let chosenChain = chains.find((c) => !recentContents.has(c.openerText));

    if (!chosenChain) {
      const dynamicChain = getDynamicDayDialogue(roomId);
      if (!recentContents.has(dynamicChain.openerText)) {
        chosenChain = dynamicChain;
      }
    }

    if (!chosenChain) continue;

    const openerDef = COMMUNITY_PERSONAS.find((p) => p.key === chosenChain!.openerKey);
    const responderDef = COMMUNITY_PERSONAS.find((p) => p.key === chosenChain!.responderKey);
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
