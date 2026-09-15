import { ZodiacSign } from './AstrologyConstants';
import { GATE_TITLES, GATE_TO_CENTER, LINE_BEHAVIOR_PROFILES } from './AstroHumanDesignSynthesis';

export interface IncarnationPastLifeInfo {
  sign: ZodiacSign;
  archetype: string;
  pastLifeRole: string;
  comfortZoneTrap: string;
  karmicGift: string;
  karmicDebtLesson: string;
}

export interface IncarnationHouseInfo {
  house: number;
  pastEnvironment: string;
  pastLifeCircumstances: string;
  unresolvedTheme: string;
}

export type RetroPolarity = 'active' | 'passive';

export interface RetroKarmicDebtOption {
  polarity: RetroPolarity;
  polarityLabel: string;
  pastLifeCause: string;
  currentLifeKarma: string;
  dharmaRemedy: string;
}

export interface RetroKarmicDebtData {
  planet: string;
  title: string;
  active: RetroKarmicDebtOption;
  passive: RetroKarmicDebtOption;
}

export interface RetroKarmicDebt {
  planet: string;
  title: string;
  polarity: RetroPolarity;
  polarityLabel: string;
  hdDiagnosis: string;
  pastLifeCause: string;
  currentLifeKarma: string;
  dharmaRemedy: string;
}

export interface ChironWound {
  title: string;
  woundDescription: string;
  healingGift: string;
  soulRemedy: string;
}

export interface NextLifeSeed {
  sign: ZodiacSign;
  evolutionGoal: string;
  nextIncarnationPotential: string;
  sacredPractice: string;
}

// 12 GAD (Güney Ay Düğümü) Burç Yorumları
export const GAD_SIGN_INTERPRETATIONS: Record<ZodiacSign, IncarnationPastLifeInfo> = {
  'Koç': {
    sign: 'Koç',
    archetype: 'Yalnız Savaşçı & Öncü Komutan',
    pastLifeRole: 'Geçmiş yaşamlarda tek başına hayatta kalma mücadelesi veren bir savaşçı, öncü kabile lideri veya yalnız mücadele eden bir gladyatördünüz. Kendi kurallarınızı koymaya ve her şeyi güçle çözmeye alışıktınız.',
    comfortZoneTrap: 'Aşırı benmerkezcilik, sabırsızlık, başkalarının ihtiyaçlarını görmezden gelme ve her şeyi bir savaş gibi algılama refleksi.',
    karmicGift: 'Korkusuz cesaret, yüksek inisiyatif alma kabiliyeti, sıfırdan başlama iradesi ve kriz anlarında sarsılmaz liderlik gücü.',
    karmicDebtLesson: 'Bu yaşamda "Ben" demeyi bırakıp "Biz" dengesini (Terazi KAD) kurmak, diplomasinin, iş birliğinin ve koşulsuz empatinin gücünü öğrenmek.'
  },
  'Boğa': {
    sign: 'Boğa',
    archetype: 'Toprak Ağası, Zanaatkar & Zengin Tüccar',
    pastLifeRole: 'Maddi güvenceye, toprağa, mülkiyete ve duyusal zevklere sıkı sıkıya bağlı bir yaşam sürdünüz. Maddi varlık biriktirmek ve statükoyu korumak en büyük varoluş gayenizdi.',
    comfortZoneTrap: 'Maddeye ve alışkanlıklara aşırı bağımlılık, değişime ve dönüşüme körü körüne direnç gösterme, konfor alanından çıkamama.',
    karmicGift: 'Muazzam sabır, elle tutulur somut değer yaratma becerisi, estetik ve doğayla derin ruhsal rezonans.',
    karmicDebtLesson: 'Bu yaşamda maddenin geçiciliğini kabul edip ruhsal dönüşümün ateşine (Akrep KAD) teslim olmak; derin paylaşımları, krizleri aşmayı ve manevi serveti keşfetmek.'
  },
  'İkizler': {
    sign: 'İkizler',
    archetype: 'Gezgin Katip, Haberci & Meraklı Entelektüel',
    pastLifeRole: 'Kasaba kasaba dolaşan bir kurye, bilgi toplayıcı, araştırmacı veya tüccardınız. Çok şey bildiniz ancak bilgiyi derinleştirmeden yüzeyde dağıttınız.',
    comfortZoneTrap: 'Kararsızlık, dedikodu ve yüzeysel bilgi akışında kaybolma, derin inanç ve taahhütlerden kaçınma.',
    karmicGift: 'Olağanüstü zihinsel çeviklik, dil ve iletişim dehası, her türlü çevreye hızla uyum sağlama yeteneği.',
    karmicDebtLesson: 'Dağınık zihni tek bir yüksek hakikat ve felsefede (Yay KAD) birleştirmek; bilginin ötesine geçip bilgeliğe ve inanca yürümek.'
  },
  'Yengeç': {
    sign: 'Yengeç',
    archetype: 'Klan Koruyucusu, Şefkatli Ana & Sığınak Bekçisi',
    pastLifeRole: 'Ailesini, kabilesini veya vatanını her şeyin önüne koyan, duygusal güvence kozasından hiç çıkmamış bir aile reisi veya koruyucu bir figürdünüz.',
    comfortZoneTrap: 'Duygusal bağımlılık, çocuksu alınganlık, geçmişe takılı kalma ve dünyayı tehlikeli bir yer olarak algılayıp kabuğuna çekilme.',
    karmicGift: 'Sınırsız empati, derin psişik sezgi, koruyup büyütme ve koşulsuz yuva enerjisi yayma yetisi.',
    karmicDebtLesson: 'Duygusal zayıflığı aşarak toplumda kendi ayakları üzerinde duran, disiplinli, sorumlu ve olgun bir lider (Oğlak KAD) olmak.'
  },
  'Aslan': {
    sign: 'Aslan',
    archetype: 'Hükümdar, Aristokrat & Sahne Sanatçısı',
    pastLifeRole: 'Saraylarda, alkışlar ve iltifatlar arasında yaşamış bir soylu, krallık yöneticisi veya merkeze konulmuş seçkin bir sanatçıydınız.',
    comfortZoneTrap: 'Sürekli onay ve alkış bekleme, kibre kapılma, özel muamele görme arzusu ve sadece kendi dramasını önemseme.',
    karmicGift: 'Kraliyet asaleti, sıcak cömertlik, yaratıcı ateş ve girdiği her ortamı aydınlatan karizmatik aura.',
    karmicDebtLesson: 'Kişisel egoyu ve tahtı aşıp kolektif bilince, insanlığa ve adil bir toplumsal geleceğe (Kova KAD) hizmet etmek.'
  },
  'Başak': {
    sign: 'Başak',
    archetype: 'Manastır Şifacısı, Hizmetkar & Titiz Muhasebeci',
    pastLifeRole: 'Detaylara kurban edilmiş, sürekli başkalarına hizmet etmiş, kendini feda etmiş bir hekim, analizci veya katı kurallara bağlı bir manastır görevlisiydiniz.',
    comfortZoneTrap: 'Kusursuzluk takıntısı, acımasız özeleştiri, evham ve kontrol edemediği hayat akışını mikro analizlerle yönetme çabası.',
    karmicGift: 'Kusursuz pratik zeka, arındırma ve şifalandırma dehası, kaosu anında düzene koyabilme becerisi.',
    karmicDebtLesson: 'Zihinsel analizi ve kusur arayışını bırakıp evrenin ilahi akışına (Balık KAD), teslimiyete ve koşulsuz sevgiye güvenmek.'
  },
  'Terazi': {
    sign: 'Terazi',
    archetype: 'Saray Diplomatı, Bağımlı Eş & Barış Elçisi',
    pastLifeRole: 'Kendi kimliğini bir başkasının varlığına feda etmiş, çatışmadan kaçmak için ödünler vermiş bir diplomat, eş veya arabulucuydunuz.',
    comfortZoneTrap: 'Kendi arzusunu bilememe, tek başına hareket edememe, aşırı onay bağımlılığı ve yapay nezaket.',
    karmicGift: 'Kusursuz zarafet, estetik duyu, insan ilişkilerinde adaleti ve ahengi en üst seviyede sağlama ustalığı.',
    karmicDebtLesson: 'Başkalarını memnun etmekten vazgeçip kendi özgün sesini, bağımsızlığını ve cesur kimliğini (Koç KAD) sahiplenmek.'
  },
  'Akrep': {
    sign: 'Akrep',
    archetype: 'Gizli Mistik, Büyücü, Savaş Lordu & Kriz Yöneticisi',
    pastLifeRole: 'Sürekli ölüm-kalım savaşları, gizli güç mücadeleleri, okült ritüeller veya ihanet dolu krizlerle çevrili fırtınalı bir yaşam sürdünüz.',
    comfortZoneTrap: 'Sürekli kriz üretme ihtiyacı, şüphecilik, intikam hissi, kontrolü kaybetme korkusu ve manipülasyon.',
    karmicGift: 'Ruhun derinliklerini okuma gücü, psişik dayanıklılık, ölümden sonra küllerinden yeniden doğabilme (Anka) sırrı.',
    karmicDebtLesson: 'Karanlık kriz bağımlılığını bırakıp huzuru, sadeliği, doğayı ve dingin güveni (Boğa KAD) inşa etmek.'
  },
  'Yay': {
    sign: 'Yay',
    archetype: 'Gezgin Filozof, Rahip, Kehanetçi & Maceraperest',
    pastLifeRole: 'Kendi inancını mutlak doğru kabul eden bir din adamı, göçebe kaşif, dogmatik vaiz veya toplumdan izole bir bilgeydiniz.',
    comfortZoneTrap: 'Kendi doğrusunu dikte etme, pratik gerçeklerden kopuk teoriler üretme, kibirli vaazlar verme ve detayları göz ardı etme.',
    karmicGift: 'Vizyoner genişlik, evrensel kanunları anlama feraseti, yüksek iyimserlik ve ilham kaynağı olma gücü.',
    karmicDebtLesson: 'Fildişi kuleden inip sıradan insanla iletişim kurmak, dinlemeyi öğrenmek ve günlük hayatın pratik gerçekleriyle (İkizler KAD) köprü olmak.'
  },
  'Oğlak': {
    sign: 'Oğlak',
    archetype: 'Sert Hükümdar, Statü Muhafızı & Katı Yargıç',
    pastLifeRole: 'Duygularını tamamen bastırıp kurallara, toplumsal hiyerarşiye ve unvana hizmet eden bir yönetici, yargıç veya ordu komutanıydınız.',
    comfortZoneTrap: 'Duygusuzluk, aşırı kontrolcülük, başarısızlık korkusu ve her şeyi bir yük veya görev olarak algılama.',
    karmicGift: 'Demir gibi disiplin, stratejik inşa yeteneği, yüksek sorumluluk bilinci ve krizlerde dimdik durabilme.',
    karmicDebtLesson: 'Zırhı çıkartıp kalbini açmak; şefkati, aileyi, duygusal kırılganlığı ve ruhsal yuvayı (Yengeç KAD) kucaklamak.'
  },
  'Kova': {
    sign: 'Kova',
    archetype: 'Asi Devrimci, Sürgün Bilim İnsanı & Marjinal Düşünür',
    pastLifeRole: 'Toplumun ilerisinde fikirleri yüzünden dışlanmış, soğuk bir gözlemci olarak yaşayan bir reformcu veya gizli cemiyet üyesiydiniz.',
    comfortZoneTrap: 'Duygusal mesafeli duruş, marjinalleşme kibri, insanlara kitle olarak bakıp bireyi görememe.',
    karmicGift: 'Dahi seviyesinde vizyon, toplumsal eşitlik ve hümanizm idealleri, geleceği okuma sezgisi.',
    karmicDebtLesson: 'Zihinsel soğukluktan çıkıp kalpten sevmeyi, sahneye çıkıp kişisel yaratıcılığını ve sıcaklığını (Aslan KAD) cömertçe saçmayı öğrenmek.'
  },
  'Balık': {
    sign: 'Balık',
    archetype: 'Manastır Münzevisi, Kurban & Hayalperest Mistik',
    pastLifeRole: 'Dünyevi sorumluluklardan kaçıp bir manastıra kapanmış, uyuşturucu/münzevilikle gerçeklikten kopmuş veya kurban rolünü oynamış bir ermiştiniz.',
    comfortZoneTrap: 'Sorumluluklardan kaçma, kurban psikolojisi, sisli illüzyonlara sığınma ve sınır çizememe.',
    karmicGift: 'Evrensel birlik bilinci, yüksek sezgi, şairane ilham ve ilahi kaynağa doğrudan bağlanma yeteneği.',
    karmicDebtLesson: 'Ruhsal bilgeliği somut dünyaya indirmek; günlük yaşamda disiplin, hizmet, ayırt etme ve pratik şifa (Başak KAD) üretmek.'
  }
};

// 12 GAD Evi Yorumları (Geçmiş Yaşam Çevresi ve Şartları)
export const GAD_HOUSE_INTERPRETATIONS: Record<number, IncarnationHouseInfo> = {
  1: {
    house: 1,
    pastEnvironment: 'Bireysel Mücadele & Hayatta Kalma Arenası',
    pastLifeCircumstances: 'Önceki yaşamlarda yalnızca kendinize güvenmek zorundaydınız. Kimsenin yardımını beklemeden, tek başınıza cephede savaşır gibi hayatta kaldınız.',
    unresolvedTheme: 'İkili ilişkilerde denge kuramamak, ortaklıklara ve evlilik bağına güven duymakta zorlanmak.'
  },
  2: {
    house: 2,
    pastEnvironment: 'Zengin Ticaret Evleri veya Maddi Yoksunluk Deneyimi',
    pastLifeCircumstances: 'Maddi varlıkların, altının ve mülkiyetin hayati değer taşıdığı bir dünyadaydınız. Kendi emeğinizle inşa ettiğiniz kaynaklara saplantılı bir bağlılık vardı.',
    unresolvedTheme: 'Maddiyatı kaybetme korkusu, başkalarının kaynaklarını paylaşamama veya manevi değerleri ihmal etme.'
  },
  3: {
    house: 3,
    pastEnvironment: 'Yerel Ticaret Yolları, Kardeşlik Loncaları & Bilgi Ağları',
    pastLifeCircumstances: 'Kendi yerel çevresinde sürekli hareket halinde olan, haber toplayan, yakın akraba ve komşularıyla yoğun ama yüzeyde etkileşimde bulunan bir yaşam.',
    unresolvedTheme: 'Büyük resmi görememek, derin felsefelere kapalı kalmak, dağınık konuşmalarla zihinsel enerjiyi tüketmek.'
  },
  4: {
    house: 4,
    pastEnvironment: 'Ata Toprakları, Kabile Kaleleri & Kapalı Aile Çemberi',
    pastLifeCircumstances: 'Ailesinin veya soyunun geleneklerine sıkı sıkıya bağlı, dış dünyaya kapalı, vatan toprağına ve atalara derin kök salmış bir yaşam.',
    unresolvedTheme: 'Dünyaya açılma korkusu, kariyer ve toplumsal hedeflerden kaçıp geçmişin güvenli yuvasına sığınma refleksi.'
  },
  5: {
    house: 5,
    pastEnvironment: 'Aristokratik Saraylar, Sanat Locaları & Kumarhaneler',
    pastLifeCircumstances: 'Yaratıcılığın, aşk maceralarının, sahne ışıklarının ve kumar risklerinin merkezinde bir hayat sürdünüz. Kendi eğlenceniz ve egonuz her şeyin önündeydi.',
    unresolvedTheme: 'Toplumsal sorumlulukları hafife alma, kalabalıkların iyiliğini görmezden gelme, sürekli şahsi eğlence arayışı.'
  },
  6: {
    house: 6,
    pastEnvironment: 'Şifahaneler, Askeri Kışlalar veya Ağır Çalışma Kampları',
    pastLifeCircumstances: 'Kölelik derecesinde ağır hizmet şartları, sağlık sorunları veya katı günlük rutinler altında başkalarının emirlerini yerine getiren bir yaşam.',
    unresolvedTheme: 'Aşırı mükemmeliyetçilik, hastalık takıntıları, kurban-kurtarıcı döngülerine sıkışıp ruhsal huzuru kaçırma.'
  },
  7: {
    house: 7,
    pastEnvironment: 'Diplomatik Misyonlar, İttifak Evlilikleri & Saray Protokolleri',
    pastLifeCircumstances: 'Kendi kimliğinizi bir eşe, iş ortağına veya toplumsal protokole feda ettiniz. Yalnız kaldığınızda kendinizi yok saydınız.',
    unresolvedTheme: 'Kendi başına karar verememe, onaylanma açlığı, çatışmadan kaçmak için gerçekleri gizleme.'
  },
  8: {
    house: 8,
    pastEnvironment: 'Gizli Ezoterik Okullar, Simya Laboratuvarları & Miras Savaşları',
    pastLifeCircumstances: 'Ölümün, gizemli güçlerin, cinsellik ve ortak servet savaşlarının merkezinde, sırlarla dolu ve krizlerle yoğrulmuş fırtınalı bir yaşam.',
    unresolvedTheme: 'Güven kaybı, paranoya, kriz bağımlılığı ve başkalarının enerjilerini kontrol etme dürtüsü.'
  },
  9: {
    house: 9,
    pastEnvironment: 'Uzak Tapınaklar, Üniversite Kürsüleri & Kaşif Gemileri',
    pastLifeCircumstances: 'Yabancı ülkeleri dolaşan bir hacı, misyoner, din bilgini veya seyyah olarak dogmatik inançların savunuculuğunu yaptınız.',
    unresolvedTheme: 'Fanatizm, günlük pratik detayları küçümseme, kibirli öğütler verip kendi dersini yaşamama.'
  },
  10: {
    house: 10,
    pastEnvironment: 'İmparatorluk Divanı, Ordu Karargahı & Yüksek Bürokrasi',
    pastLifeCircumstances: 'Halkın gözü önünde yüksek unvanlara sahip, itibar ve makam uğruna şahsi ve duygusal hayatını kurban etmiş bir hükümdar veya komutan.',
    unresolvedTheme: 'Duygusal kırılganlığı zayıflık sayma, ailesine vakit ayıramama, soğuk ve katı otorite maskesi.'
  },
  11: {
    house: 11,
    pastEnvironment: 'Devrimci Gruplar, Gizli Cemiyetler & İsyancı Birlikler',
    pastLifeCircumstances: 'Bireysel kimliğini ideallere ve bir davaya adamış, arkadaş grupları veya kolektif hedefler uğruna kendi kalbinin sesini kısmış bir dava insanı.',
    unresolvedTheme: 'Bireysel sıcaklıktan ve romantik aşktan kaçınma, soğuk zihinsellikle duyguları entelektüalize etme.'
  },
  12: {
    house: 12,
    pastEnvironment: 'Münzevi Mağaraları, Manastırlar, Sürgün Adaları & Hapishaneler',
    pastLifeCircumstances: 'Dünyadan tamamen elini eteğini çekmiş, meditasyona, tefekküre veya esarete gömülmüş, bu dünyadaki varlığını unutmuş bir derviş veya tutsak.',
    unresolvedTheme: 'Dünyevi sorumluluklardan ve pratik gerçeklerden kopuş, kurban bilinci ve hayatın içine aktif olarak girememek.'
  }
};

// 12. Ev Burçları - Son Nefes ve Kapanış Hafızası
export const TWELFTH_HOUSE_SIGN_INTERPRETATIONS: Record<ZodiacSign, {
  lastBreathAtmosphere: string;
  subconsciousGift: string;
  hiddenFear: string;
}> = {
  'Koç': {
    lastBreathAtmosphere: 'Ani, beklenmedik bir mücadele, savaş meydanı veya yüksek adrenalin anında hızlı bir veda.',
    subconsciousGift: 'Korkusuz acil durum refleksleri ve anında yeniden başlama içgüdüsü.',
    hiddenFear: 'Güçsüz düşmek, arkadan saldırıya uğramak veya hareket edememek.'
  },
  'Boğa': {
    lastBreathAtmosphere: 'Huzurlu, doğayla baş başa ancak elindeki mallardan ve bedensel bağlardan ayrılmakta zorlanan bir kapanış.',
    subconsciousGift: 'Ruhu ve bedeni doğal yollarla dinginleştirme, içsel zenginlik hissiyatı.',
    hiddenFear: 'Tüm maddi varlığını ve güvencesini aniden kaybetme dehşeti.'
  },
  'İkizler': {
    lastBreathAtmosphere: 'Söylenmemiş sözlerin, yarım kalmış yazıların veya iletilememiş mesajların zihinde yankılandığı bir geçiş.',
    subconsciousGift: 'Telepatik algı, işaretleri okuma ve sembollerin dilini anlama yetisi.',
    hiddenFear: 'Yanlış anlaşılmak, susturulmak veya delirmek korkusu.'
  },
  'Yengeç': {
    lastBreathAtmosphere: 'Sevdiklerinin hasretiyle, anne kucağı özlemiyle veya vatanından uzakta duygusal bir ayrılık.',
    subconsciousGift: 'Ruhsal alemle psişik bağlantı, rüyalar aracılığıyla şifa ve koruma.',
    hiddenFear: 'Terk edilmek, kimsesiz kalmak ve sevgisiz bir dünyada unutulmak.'
  },
  'Aslan': {
    lastBreathAtmosphere: 'Yalnız kalmış bir sahnede, şan ve şöhretin ardından unutulmanın getirdiği hüzünlü bir kapanış.',
    subconsciousGift: 'Karanlıkta bile kendi iç ışığını yakabilen sarsılmaz kalp asaleti.',
    hiddenFear: 'Göz ardı edilmek, alay konusu olmak ve önemsiz sayılmak.'
  },
  'Başak': {
    lastBreathAtmosphere: 'Hastalık, yorgunluk veya tamamlanmamış bir görevin endişesi içinde, hizmet ederken gerçekleşen bir veda.',
    subconsciousGift: 'Hücresel düzeyde bedeni dinleme ve görünmeyen dengesizlikleri sezme dehasi.',
    hiddenFear: 'Kirlenmek, kontrolü kaybetmek ve aciz duruma düşmek.'
  },
  'Terazi': {
    lastBreathAtmosphere: 'İhanet, haksız bir yargılama veya sevilen bir eşin kaybının ardından kalbi kırık bir ayrılış.',
    subconsciousGift: 'Evrensel adaletin ve kozmik dengenin kusursuz sezgisi.',
    hiddenFear: 'Yalnızlık, çatışma ve adaletsizliğe maruz kalmak.'
  },
  'Akrep': {
    lastBreathAtmosphere: 'Büyük sırlar, okült dönüşümler veya ihanet dolu bir kriz anında ruhun bedeninden sıyrılması.',
    subconsciousGift: 'Ölüm ve doğum arasındaki perdenin ardını görme, karanlığı ışığa dönüştürme gücü.',
    hiddenFear: 'Ruhunu teslim etmek, zaaflarının başkaları tarafından kullanılması.'
  },
  'Yay': {
    lastBreathAtmosphere: 'Gurbette, yabancı diyarlarda bir seyahat veya arayış sırasında ufka bakarak gerçekleşen geçiş.',
    subconsciousGift: 'Evrensel rehberlik, yüksek bilgelik rüyaları ve ilahi adalet güveni.',
    hiddenFear: 'Kafese kapatılmak, inançlarının boş çıkması veya dar bir alana hapsedilmek.'
  },
  'Oğlak': {
    lastBreathAtmosphere: 'Ağır sorumlulukların, soğuk bir yalnızlığın veya tamamlanan büyük bir görevin vakur kapanışı.',
    subconsciousGift: 'Kadim ataların bilgeliğine bağlanma, ruhsal sabır ve dayanıklılık.',
    hiddenFear: 'Yetersiz olmak, başarısız damgası yemek ve emeklerinin boşa gitmesi.'
  },
  'Kova': {
    lastBreathAtmosphere: 'İdealleri uğruna sürgünde veya kendi zamanının çok ilerisinde anlaşılmadan geçen bir veda.',
    subconsciousGift: 'Kolektif bilinçdışına doğrudan anten olma, geleceğin enerjilerini indirme.',
    hiddenFear: 'Sürüye katılmak, bireyselliğini kaybetmek ve anlaşılmadan yok olmak.'
  },
  'Balık': {
    lastBreathAtmosphere: 'İlahi bir trans, derin bir teslimiyet veya dünyevi acılardan kurtuluş getiren mistik bir geçiş.',
    subconsciousGift: 'Kozmik merhamet, astral seyahat kabiliyeti ve şifalı dua gücü.',
    hiddenFear: 'Gerçek dünyanın sertliğiyle yüzleşmek, sınırlarını koruyamayıp dağılmak.'
  }
};

// Polarize Edilmiş Retro Gezegenler - Karmik Borçlar (Aktif vs Pasif)
export const RETRO_KARMIC_DEBTS_DATA: Record<string, RetroKarmicDebtData> = {
  'Merkür': {
    planet: 'Merkür',
    title: 'Hakikat ve İletişim Karması',
    active: {
      polarity: 'active',
      polarityLabel: 'Aktif Zihinsel Manipülasyon',
      pastLifeCause: 'Geçmiş yaşamınızda bilgiyi çıkarlarınız için sakladınız, kasıtlı olarak asılsız haberler yaydınız veya keskin, alaycı sözlerinizle başkalarının onurunu zedelediniz.',
      currentLifeKarma: 'Zihnin sürekli aşırı analiz döngüsüne kilitlenmesi; sözlerinizin başkaları tarafından yanlış anlaşılacağı endişesiyle iletişimde tıkanma yaşama.',
      dharmaRemedy: 'Sadece saf hakikati konuşmak, dedikodudan bütünüyle uzak durmak, yazarak ve içsel bilgeliği dinleyerek zihni arındırmak.'
    },
    passive: {
      polarity: 'passive',
      polarityLabel: 'Susturulmuş Zihin & Sessiz Kalma Karması',
      pastLifeCause: 'Geçmiş yaşamınızda haksız iftiralara, yalanlara ve masumların karalanmasına şahit olduğunuz halde korkudan veya menfaatinizi korumak adına sustunuz; hakikati savunmayarak zulmün ve cehaletin yayılmasına sessizce zemin hazırladınız ya da baskı altında sahte tanıklık yapmaya alet edildiniz.',
      currentLifeKarma: 'Düşüncelerini ifade ederken derin bir suçluluk duyma, haksızlık karşısında boğaz düğümlenmesi, sözlerinin değer görmeyeceği inancıyla suskunluğa kilitlenme.',
      dharmaRemedy: 'Baskı ve korku ne olursa olsun hakikatin saf sesi olmak, iftiraya uğrayanların ve suskunların hakkını korkusuzca dile getirmek, içsel bilgeliğe güvenmek.'
    }
  },
  'Venüs': {
    planet: 'Venüs',
    title: 'Aşk, Değer ve Sadakat Karması',
    active: {
      polarity: 'active',
      polarityLabel: 'Bencil Sevgi & Kalp Kırma',
      pastLifeCause: 'Geçmiş yaşamınızda sevgiyi ve ilişkileri bencilce bir pazarlık unsuru yaptınız; başkalarının duygularıyla oynayarak kalpleri kırdınız ve sevgiyi istismar ettiniz.',
      currentLifeKarma: 'İlişkilerde samimiyete güvenememe, sevgiyi kaybetme korkusuyla aşırı sahiplenme veya geçmiş partnerlerin gölgelerini bugüne taşıma.',
      dharmaRemedy: 'Koşulsuz sevgiyi bir karşılık beklemeden deneyimlemek, sevgide güven inşa etmek ve estetik şifa yaratmak.'
    },
    passive: {
      polarity: 'passive',
      polarityLabel: 'Konfor Uğruna Sessizlik & Çıkar Ortaklığı',
      pastLifeCause: 'Geçmiş yaşamınızda kendi konforunuzu, canınızı veya maddi güvenliğinizi korumak uğruna sevdiklerinizin ve masum insanların sömürülmesine göz yumdunuz; adaletsiz ilişki ve çıkar ağlarına boyun eğerek zulmün sessiz bir parçası haline geldiniz.',
      currentLifeKarma: 'Kendini gerçek sevgiye layık görememe, ilişkilerde sürekli ödün verip sömürülme ve kendi değerini başkalarının onayına teslim etme.',
      dharmaRemedy: 'Menfaat için adaletsizliğe asla ortak olmamak; önce kendi öz-değerini inşa edip koşulsuz sevgi ve adalet ilkelerinden ödün vermemek.'
    }
  },
  'Mars': {
    planet: 'Mars',
    title: 'Güç, Öfke ve Şiddet Karması',
    active: {
      polarity: 'active',
      polarityLabel: 'Aktif Güç İstismarı & Aşırı Saldırganlık',
      pastLifeCause: 'Geçmiş yaşamınızda kontrolsüz öfke, aşırı güç gösterisi ve şiddet uyguladınız; haksız çatışmalara katılarak başkalarının sınırlarını zorla çiğnediniz.',
      currentLifeKarma: 'Kendi gücünüzün yıkıcılığından bilinçaltı düzeyde korkma, öfke patlamalarından sonra gelen derin suçluluk ve iradeyi yönetmekte zorlanma.',
      dharmaRemedy: 'Gücü ezmek ve dayatmak için değil; zayıfları korumak, adaleti sağlamak ve yapıcı bir disiplin/spor ile içsel ateşi arındırmak için kullanmak.'
    },
    passive: {
      polarity: 'passive',
      polarityLabel: 'Bastırılmış İrade & Zulme Alet Olma Karması',
      pastLifeCause: 'Geçmiş yaşamınızda çatışma korkusu ve zalim otoritelerin baskısı karşısında kendi gücünüzden vazgeçtiniz; haklı öfkenizi bastırıp felç oldunuz. Başkalarına yapılan haksızlıklara ve şiddete korkudan sessiz kaldınız ya da baskı altında istemeyerek de olsa zalimlerin elinde bir maşaya/araca dönüştürüldünüz.',
      currentLifeKarma: 'Öfkeyi içeriye yöneltme eğilimi, haksızlık karşısında donup kalma, hakkını savunurken suçluluk duyma ve kendi içsel gücünden korkma.',
      dharmaRemedy: 'Güç odaklarından ve çatışmadan korkmadan zayıfların yanında durmak; haklı öfkeyi bastırmadan sağlıklı bir adalet ve cesaret eylemine dönüştürmek.'
    }
  },
  'Jüpiter': {
    planet: 'Jüpiter',
    title: 'İnanç, Etik ve Kibir Karması',
    active: {
      polarity: 'active',
      polarityLabel: 'Ruhsal Kibir & İnanç İstismarı',
      pastLifeCause: 'Geçmiş yaşamınızda dini, ahlaki veya felsefi bir otoriteyi kötüye kullandınız; sahte vaazlar verdiniz ya da manevi kibirle başkalarını yargıladınız.',
      currentLifeKarma: 'Kendi ahlaki üstünlüğünü kanıtlama dürtüsü ile içsel boşluk arasında gidip gelme, dogmatik yargılama eğilimi.',
      dharmaRemedy: 'Tevazu ile daimi bir öğrenci kalmak, insanları yargılamadan kucaklamak ve bilgeliği karşılıksız bir cömertlikle sunmak.'
    },
    passive: {
      polarity: 'passive',
      polarityLabel: 'Dogmalara Boyun Eğme & Yozlaşmaya Göz Yumma',
      pastLifeCause: 'Geçmiş yaşamınızda dini, ahlaki veya kurumsal yozlaşmayı, insanların manevi olarak sömürüldüğünü gördüğünüz halde dışlanma veya cezalandırılma korkusuyla sustunuz; sahte tiranların ve dogmatik otoritelerin sessiz bir onaylayıcısı oldunuz.',
      currentLifeKarma: 'Dışsal hiçbir inanç sistemine veya rehbere güvenememe, derin bir ruhsal şüphecilik ve anlam arayışında yönünü kaybetme kaygısı.',
      dharmaRemedy: 'Hiçbir dogmaya veya sahte otoriteye körü körüne boyun eğmemek; kalbinin ve vicdanının evrensel ahlakına güvenerek hakikati savunmak.'
    }
  },
  'Satürn': {
    planet: 'Satürn',
    title: 'Büyük Karmik Sorumluluk & Zaman Borcu',
    active: {
      polarity: 'active',
      polarityLabel: 'Zalim Otorite & Katı Kurallar',
      pastLifeCause: 'Geçmiş yaşamınızda elinizdeki gücü ve makamı acımasızca kullandınız; başkalarına karşı zalimce bir otorite kurarak taahhütlerinizi ve adalet ilkelerini çiğnediniz.',
      currentLifeKarma: 'Otorite figürleriyle derin çatışmalar, cezalandırılma korkusu ve her hatada aşırı katı içsel yargıç sesine maruz kalma.',
      dharmaRemedy: 'Otoriteyi baskı kurmak için değil, adil ve şefkatli bir koruyucu olarak yapılandırmak; kendi sınırlarını sevgiyle inşa etmek.'
    },
    passive: {
      polarity: 'passive',
      polarityLabel: 'Sisteme Boyun Eğme & "Emir Kulu" Karması',
      pastLifeCause: 'Geçmiş yaşamınızda zalim bir sistemin veya tiranın idari çarkı haline geldiniz; "ben sadece emir kuluyum, kurallar böyle" diyerek başkalarına yapılan zulmü uyguladınız ya da haksızlıklara sessizce boyun eğerek vicdani sorumluluğu reddettiniz.',
      currentLifeKarma: 'Omuzlarda açıklanamaz bir suçluluk yükü, otorite figürleri karşısında donup kalma, hayatta her şeyin ancak ağır cezalar ve zahmetlerle geleceği inancı.',
      dharmaRemedy: 'Kör itaati bırakıp vicdani sorumluluğu her kuralın üzerinde tutmak; adil, şefkatli ve dik bir ruhsal omurga inşa etmek.'
    }
  },
  'Uranüs': {
    planet: 'Uranüs',
    title: 'Özgürlük ve İsyan Karması',
    active: {
      polarity: 'active',
      polarityLabel: 'Yıkıcı İsyan & Sorumsuz Başkaldırı',
      pastLifeCause: 'Geçmiş yaşamınızda anarşistçe bir yıkım yarattınız; toplumun kurallarını sorumsuzca hiçe sayarak kaos çıkardınız ve başkalarının düzenini altüst ettiniz.',
      currentLifeKarma: 'Sürekli bir yere veya düzene ait olamama, ani yıkıcı tepkiler ve kurallara karşı sebepsiz bir öfke hissetme.',
      dharmaRemedy: 'Özgürlüğü salt yıkım olarak değil; insanlığın hayrına çalışan yenilikçi, vizyoner ve yapıcı bir uyanış olarak yaşamak.'
    },
    passive: {
      polarity: 'passive',
      polarityLabel: 'Sürüye Uyma & Kolektif Lince Sessiz Kalma',
      pastLifeCause: 'Geçmiş yaşamınızda dışlanma ve yalnız kalma korkusuyla sürü psikolojisine boyun eğdiniz; masum bireylerin toplum tarafından dışlanmasına, haksız yere linç edilmesine veya ayrımcılığa uğramasına sessiz kalarak bu kolektif adaletsizliğe ortak oldunuz.',
      currentLifeKarma: 'Topluluklar içinde sürekli kendini yabancı hissetme, dışlanma paranoyası ve kendi özgün dehasını toplumdan gizleme eğilimi.',
      dharmaRemedy: 'Sürüden ayrılma pahasına hakikatin ve evrensel özgürlüğün yanında durmak; bireysel vicdanını kolektif cinnete asla kurban etmemek.'
    }
  },
  'Neptün': {
    planet: 'Neptün',
    title: 'İllüzyon, Kaçış ve Aldanış Karması',
    active: {
      polarity: 'active',
      polarityLabel: 'Manevi Manipülasyon & İllüzyon Yayma',
      pastLifeCause: 'Geçmiş yaşamınızda insanları manevi illüzyonlarla yanılttınız; sahte tarikatlar, batıl inançlar veya manevi güç gösterileriyle kitleleri aldattınız.',
      currentLifeKarma: 'Kendi sezgilerine güvenememe, ruhsal konularda kandırılmaktan dehşet duyma ve gerçeklikten kopma korkusu.',
      dharmaRemedy: 'Ruhsal uyanışı keskin bir ayırt etme yeteneği (discernment) ile birleştirmek, tevazuyla sadece ilahi sevginin temiz bir kanalı olmak.'
    },
    passive: {
      polarity: 'passive',
      polarityLabel: 'Sahte İnziva & Sömürüye Alan Açma',
      pastLifeCause: 'Geçmiş yaşamınızda sahte tarikatların, manevi sömürücülerin ve illüzyonların insanları zehirlediğini gördüğünüz halde "bana dokunmayan yılan bin yaşasın" diyerek sahte bir inzivaya sığındınız; ruhsal kaçışla sorumluluktan kaçarak kötülüğün yayılmasına alan açtınız.',
      currentLifeKarma: 'İlişkilerde kurtarıcı-kurban üçgenine çekilme, sınır çizememe, kime güveneceğini bilememe ve gerçeklikten kaçma arzusu.',
      dharmaRemedy: 'Ruhsal uyanışı dünyadan kaçış olarak değil, aktif bir şefkat ve ayırt etme gücüyle (discernment) dünyadaki karanlığı aydınlatmak için kullanmak.'
    }
  },
  'Plüton': {
    planet: 'Plüton',
    title: 'Karanlık Güç ve Dönüşüm Karması',
    active: {
      polarity: 'active',
      polarityLabel: 'Tiranlık & Kitle Manipülasyonu',
      pastLifeCause: 'Geçmiş yaşamınızda muazzam bir okült güç, siyasi tiranlık veya manipülasyonla kitleleri kontrol ettiniz; gücü başkalarını ezmek ve sindirmek için kullandınız.',
      currentLifeKarma: 'Kontrolü kaybetmekten veya güçsüz duruma düşmekten dehşet duyma, derin şüphecilik ve herkesi kontrol etme arzusu.',
      dharmaRemedy: 'Kontrol saplantısını bırakıp ilahi teslimiyeti öğrenmek; gücü başkalarına hükmetmek için değil, insanları karanlıktan aydınlığa çıkarmak için dönüştürmek.'
    },
    passive: {
      polarity: 'passive',
      polarityLabel: 'Korkudan Sığınma & Karanlığa Alet Olma',
      pastLifeCause: 'Geçmiş yaşamınızda karanlık güç odaklarının ve zalim tiranların başkalarını yok etmesine korkudan göz yumdunuz; kendi canınızı kurtarmak adına zalimlerin gölgesine sığındınız ve istemeyerek de olsa onların entrikalarına, ihanetlerine alet edildiniz.',
      currentLifeKarma: 'Güçsüz düşmekten dehşet duyma, insanlara güvenememe, derin bir sırtından bıçaklanma paranoyası ve kendi içsel gücünü ortaya çıkarmaktan korkma.',
      dharmaRemedy: 'Karanlık güç odaklarından korkmadan, ışığın ve dönüştürücü hakikatin tarafında durmak; kendi içsel korkularını yenerek Anka kuşu gibi küllerinden doğmak.'
    }
  }
};

// Geriye dönük uyumluluk için varsayılan fallback RETRO_KARMIC_DEBTS
export const RETRO_KARMIC_DEBTS: Record<string, RetroKarmicDebt> = Object.keys(RETRO_KARMIC_DEBTS_DATA).reduce((acc, p) => {
  const data = RETRO_KARMIC_DEBTS_DATA[p];
  acc[p] = {
    planet: data.planet,
    title: data.title,
    polarity: 'active',
    polarityLabel: data.active.polarityLabel,
    hdDiagnosis: 'Standart Astrolojik Rezonans',
    pastLifeCause: data.active.pastLifeCause,
    currentLifeKarma: data.active.currentLifeKarma,
    dharmaRemedy: data.active.dharmaRemedy
  };
  return acc;
}, {} as Record<string, RetroKarmicDebt>);

// Kiron - Ruh Yarası ve Şifa Kapısı
export const CHIRON_SIGN_WOUNDS: Record<ZodiacSign, ChironWound> = {
  'Koç': {
    title: 'Varoluş ve Benlik Yarası',
    woundDescription: 'Geçmişten gelen "Benim bu dünyada var olmaya hakkım var mı?" sorgulaması. Kendi isteklerini savunurken suçluluk duyma.',
    healingGift: 'Başkalarına özgüven ve cesaret aşılayan, onların içindeki savaşçıyı uyandıran bir ruh hekimi.',
    soulRemedy: 'Kendi varlığını bir başkasının onayına bağlamadan, saf benliğini kutlamak.'
  },
  'Boğa': {
    title: 'Değer ve Güvenlik Yarası',
    woundDescription: 'Geçmişte yaşanan derin kıtlık, mülksüzleşme veya bedenini reddetme travması. "Asla güvende olamayacağım" korkusu.',
    healingGift: 'Başkalarına güven, beden farkındalığı ve kendi değerini hatırlatma bilgeliği.',
    soulRemedy: 'Gerçek güvenliğin banka hesaplarında değil, ruhun tükenmez kaynağında olduğunu anlamak.'
  },
  'İkizler': {
    title: 'Zihin ve Ses Yarası',
    woundDescription: 'Geçmişte susturulmuş, düşünceleri "aptalca" bulunmuş ya da hakikati söylediği için cezalandırılmış ruh hafızası.',
    healingGift: 'Sözleriyle ruhları iyileştiren, anlaşılmayanları anlayan eşsiz bir iletişim şifacısı.',
    soulRemedy: 'Kendi özgün sesine güvenmek ve içsel sezgilerini kelimelere dökmekten çekinmemek.'
  },
  'Yengeç': {
    title: 'Aidiyet ve Şefkat Yarası',
    woundDescription: 'Geçmişte terk edilmişlik, sevgisizlik veya anne şefkatinden mahrum kalmış kök yarası.',
    healingGift: 'Tüm yaralı ruhlara ev ve sığınak olabilen, koşulsuz bir evrensel anne kalbi.',
    soulRemedy: 'Dışarıdan beklediği şefkati önce kendi içindeki yaralı çocuğa sunmak.'
  },
  'Aslan': {
    title: 'Yaratıcılık ve Işık Yarası',
    woundDescription: 'Geçmişte ışığı söndürülmüş, yaratıcılığı bastırılmış veya sahnede küçük düşürülmüş bir ruhun çekingenliği.',
    healingGift: 'Başkalarının içindeki yeteneği ve yaratıcı ateşi ortaya çıkaran muhteşem bir mentor.',
    soulRemedy: 'Alkış beklemeden, sadece yaratmanın saf neşesi için kalbinin ışığını parlatmak.'
  },
  'Başak': {
    title: 'Kusur ve Hizmet Yarası',
    woundDescription: 'Geçmişte sürekli eksik ve yetersiz hissettirilmiş, bedeninde veya ruhunda bir "leke" olduğuna inandırılmış.',
    healingGift: 'En kırık parçaları bile onaran, beden-zihin şifasında mucizeler yaratan bir el.',
    soulRemedy: 'Evrenin ve insanın kusurlu mükemmelliğini olduğu gibi sevgiyle kabul etmek.'
  },
  'Terazi': {
    title: 'İlişki ve Bütünlük Yarası',
    woundDescription: 'Geçmişte sevgi uğruna kendini tamamen kaybetmiş ya da ağır bir ihanetle kalbi yarılmış ruh.',
    healingGift: 'İnsanlar arasındaki en derin çatışmaları uzlaştıran, saf adaleti sağlayan bir denge ustası.',
    soulRemedy: 'Tamamlanmayı bir partnerde aramak yerine kendi eril ve dişil enerjisini içinde birleştirmek.'
  },
  'Akrep': {
    title: 'Ölüm, Kayıp ve Güç Yarası',
    woundDescription: 'Geçmişte ölümcül bir kayıp, yıkıcı bir büyü veya en güvendiği kişi tarafından sırtından vurulmuş olmanın karanlık yarası.',
    healingGift: 'Karanlığın en dibindeki ruhları çekip çıkaran, travmaları dönüştüren bir simyacı.',
    soulRemedy: 'Affetmenin mucizevi özgürleştirici gücünü deneyimlemek ve kontrolü ilahi akışa bırakmak.'
  },
  'Yay': {
    title: 'Anlam ve İnanç Yarası',
    woundDescription: 'Geçmişte inandığı tanrı, mabet veya felsefe tarafından aldatılmış, yaşamın anlamını yitirmiş bir arayışçı.',
    healingGift: 'Umutsuz kalplere yeniden kozmik inanç, neşe ve vizyon aşılayan bir ruh rehberi.',
    soulRemedy: 'Cevapları dışarıdaki dogmalarda değil, kendi kalbinin doğrudan evrenle kurduğu bağda bulmak.'
  },
  'Oğlak': {
    title: 'Otorite ve Yeterlilik Yarası',
    woundDescription: 'Geçmişte çok erken yaşta ağır sorumluluklar altında ezilmiş, şefkat yerine sadece görev görmüş ruh.',
    healingGift: 'Yıkılmış yapıları ayağa kaldıran, zorluklar karşısında dimdik durmayı öğreten bilge bir kılavuz.',
    soulRemedy: 'Kendi değerinin yalnızca başarı ve unvanlarla ölçülmediğini, sadece var olduğu için değerli olduğunu bilmek.'
  },
  'Kova': {
    title: 'Sürgün ve Dışlanmışlık Yarası',
    woundDescription: 'Geçmişte farklı ve sıradışı olduğu için kabilesinden kovulmuş, "ucube" veya yabancı hissettirilmiş bir ruh.',
    healingGift: 'Toplumun dışına itilmiş tüm ruhları birleştiren, geleceğin kardeşlik vizyonunu kuran bir vizyoner.',
    soulRemedy: 'Farklılığının bir lanet değil, insanlığa getirdiği kutsal bir armağan olduğunu sahiplenmek.'
  },
  'Balık': {
    title: 'Kozmik Ayrılık ve Keder Yarası',
    woundDescription: 'Cennetten dünyaya düşmüş gibi hisseden, dünyanın kabalığına ve acılarına dayanamayıp sürekli geri dönmek isteyen ruh.',
    healingGift: 'Dünyaya ilahi merhameti, koşulsuz sevgiyi ve kozmik birliği taşıyan bir melek enerjisi.',
    soulRemedy: 'Dünyayı terk edilecek bir sürgün yeri değil, ruhun ışığını toprağa demirleyeceği kutsal bir tapınak olarak görmek.'
  }
};

// 12 KAD (Kuzey Ay Düğümü) - Dharma ve Gelecek Yaşam Tohumu
export const KAD_NEXT_LIFE_SEEDS: Record<ZodiacSign, NextLifeSeed> = {
  'Koç': {
    sign: 'Koç',
    evolutionGoal: 'Kendi gücünü, liderliğini ve bağımsızlığını fethetmek.',
    nextIncarnationPotential: 'Öncü bir lider, yeni sistemlerin kurucusu veya bağımsız ruhsal yol açıcı olarak yüksek inisiyatif makamı.',
    sacredPractice: 'Başkalarının onayını beklemeden, ilk adımı atma cesareti göstermek.'
  },
  'Boğa': {
    sign: 'Boğa',
    evolutionGoal: 'Krizleri geride bırakıp huzuru, üretkenliği ve dinginliği inşa etmek.',
    nextIncarnationPotential: 'Maddenin ve doğanın sırlarına hakim, yeryüzüne bolluk ve kalıcı güzellik getiren bir usta.',
    sacredPractice: 'Sadelik içinde dinginleşmek, toprağa dokunmak ve sahip olduklarına derin şükran duymak.'
  },
  'İkizler': {
    sign: 'İkizler',
    evolutionGoal: 'Kibirli vaazları bırakıp dinlemeyi, öğrenmeyi ve köprü kurmayı başarmak.',
    nextIncarnationPotential: 'Toplumları aydınlatan bir haberci, iletişim dehası veya çağlar arası bilgi köprüsü.',
    sacredPractice: 'Önyargısızca dinlemek, her insanda gizli bir öğretmen olduğunu fark etmek.'
  },
  'Yengeç': {
    sign: 'Yengeç',
    evolutionGoal: 'Soğuk hedefleri aşıp kalbini, şefkatini ve ailesel sevgiyi beslemek.',
    nextIncarnationPotential: 'Kolektifin kalbini ısıtan, ruhsal koruyucu ve derin sezgileriyle şifa veren bir koruyucu arketip.',
    sacredPractice: 'Duygusal savunmasızlığını sevgiyle kabul etmek ve sevdiklerine güvenli bir sığınak sunmak.'
  },
  'Aslan': {
    sign: 'Aslan',
    evolutionGoal: 'Kalabalıkların ardına saklanmayı bırakıp kendi ışığını sahneye koymak.',
    nextIncarnationPotential: 'Güneş gibi parlayan, yaratıcılığıyla milyonlara ilham veren bir kraliyet ruhu veya sanat dehasi.',
    sacredPractice: 'Yaratıcılığını korkusuzca sergilemek ve başkalarının kalbine neşe tohumları ekmek.'
  },
  'Başak': {
    sign: 'Başak',
    evolutionGoal: 'Sisli hayallerden çıkıp pratik hizmeti, düzeni ve şifayı hayatın merkezine koymak.',
    nextIncarnationPotential: 'Kainatın mikro kodlarını çözen, beden ve ruh bilimlerinde çığır açan bir şifacı hekim.',
    sacredPractice: 'Her günü kutsal bir hizmet olarak görmek, küçük detaylardaki ilahi ahengi fark etmek.'
  },
  'Terazi': {
    sign: 'Terazi',
    evolutionGoal: 'Yalnız savaşçılığı bırakıp aşkta ve ortaklıkta kutsal dengeyi öğrenmek.',
    nextIncarnationPotential: 'Kozmik adaleti ve estetiği yeryüzüne indiren bir barış elçisi veya evrensel hukuk mimarı.',
    sacredPractice: 'Her durumda karşı tarafın gözünden bakabilmek ve adil bir ahenk kurmak.'
  },
  'Akrep': {
    sign: 'Akrep',
    evolutionGoal: 'Yüzeysel konfordan çıkıp ruhun en derin dönüşümüne cesaretle dalmak.',
    nextIncarnationPotential: 'Simyacı, ölümün ve yaşamın gizemlerini bilen bir usta, krizleri zafere dönüştüren Anka ruhu.',
    sacredPractice: 'Eskiye tutunmayı bırakıp ruhsal olarak ölme ve yeniden doğma cesareti göstermek.'
  },
  'Yay': {
    sign: 'Yay',
    evolutionGoal: 'Küçük dedikoduları aşıp evrensel hakikatin ve yüksek felsefenin kanatlarını açmak.',
    nextIncarnationPotential: 'Kozmik yasaları öğreten bir bilge, hakikat kaşifi veya yüksek bilinç öğretmeni.',
    sacredPractice: 'Vizyonunu genişletmek, seyahat etmek ve evrenin mükemmel işleyişine koşulsuz güvenmek.'
  },
  'Oğlak': {
    sign: 'Oğlak',
    evolutionGoal: 'Çocuksu sığınaklardan çıkıp kendi hayatının olgun ve sorumlu hükümdarı olmak.',
    nextIncarnationPotential: 'Çağları aşan yapılar ve medeniyet sistemleri kuran usta bir mimar veya bilge lider.',
    sacredPractice: 'Disiplinli adımlarla hedefe yürümek, sözünün eri olmak ve manevi mirasını inşa etmek.'
  },
  'Kova': {
    sign: 'Kova',
    evolutionGoal: 'Kişisel egoyu aşıp tüm insanlığın özgürlüğü ve kolektif uyanışı için çalışmak.',
    nextIncarnationPotential: 'Geleceğin yeni çağını kuran bir devrimci, evrensel bilim insanı veya kozmik rehber.',
    sacredPractice: 'İnsanlar arasında hiçbir ayrım gözetmeksizin herkesi bir bütünün eşit parçası olarak kucaklamak.'
  },
  'Balık': {
    sign: 'Balık',
    evolutionGoal: 'Aşırı kontrol ve evhamı bırakıp ilahi kaynağın sonsuz sevgisine teslim olmak.',
    nextIncarnationPotential: 'Maddi sınırlardan tamamen özgürleşmiş, yüksek boyutlarla doğrudan iletişimde olan aydınlanmış bir ermiş.',
    sacredPractice: 'Meditasyon, dua ve affetme yoluyla benlik sınırlarını eritebilmek.'
  }
};

// ==========================================
// DRAKONİK HARİTA: TROPİKAL VS DRAKONİK DERİN ARKETİPLER
// ==========================================

export interface DraconicPointDetails {
  pointName: string;
  tropicalSign: ZodiacSign;
  draconicSign: ZodiacSign;
  tropicalMeaning: string;
  draconicMeaning: string;
  synthesis: string;
  spiritualMeaning: string;
}

export const TROPICAL_PERSONA_DESCRIPTIONS: Record<ZodiacSign, string> = {
  'Koç': 'Öncü, tez canlı ve bağımsız. İnsanlar sizi dışarıdan cesur ve tek başına karar alan bir savaşçı olarak görür.',
  'Boğa': 'Sakin, güvenilir ve sağlamcı. İnsanlar sizi dışarıdan sarsılmaz, konforuna düşkün ve pratik bir güç olarak görür.',
  'İkizler': 'Meraklı, konuşkan ve hızlı. İnsanlar sizi dışarıdan çok yönlü, sosyal ve zeki bir iletişimci olarak görür.',
  'Yengeç': 'Hassas, koruyucu ve aidiyet arayan. İnsanlar sizi dışarıdan şefkatli, duygusal ve yuva odaklı bir sığınak olarak görür.',
  'Aslan': 'Lider, parlayan ve takdir arayan. İnsanlar sizi dışarıdan özgüvenli, cömert ve sahne ışığı çeken biri olarak görür.',
  'Başak': 'Titiz, düzenli ve analizci. İnsanlar sizi dışarıdan çalışkan, detaylara hakim ve pratik bir problem çözücü olarak görür.',
  'Terazi': 'Zarif, kibar ve uyumlu. İnsanlar sizi dışarıdan adil, çatışmadan kaçınan ve onay arayan bir diplomat olarak görür.',
  'Akrep': 'Karizmatik, ketum ve güçlü. İnsanlar sizi dışarıdan gizemli, derin sezgileri olan ve kontrolü seven biri olarak görür.',
  'Yay': 'Neşeli, maceracı ve bağımsız. İnsanlar sizi dışarıdan sınır tanımayan, açık sözlü ve iyimser bir gezgin olarak görür.',
  'Oğlak': 'Ciddi, olgun ve hedef odaklı. İnsanlar sizi dışarıdan disiplinli, statü sahibi ve dayanıklı bir yönetici olarak görür.',
  'Kova': 'Özgün, mesafeli ve vizyoner. İnsanlar sizi dışarıdan sıradışı, bağımsız ve kuralları sorgulayan bir zihin olarak görür.',
  'Balık': 'Şefkatli, fedakar ve hayalperest. İnsanlar sizi dışarıdan ilahi akışa teslim, duyarlı ve sanatsal bir ruh olarak görür.'
};

export const DRACONIC_SOUL_DESCRIPTIONS: Record<ZodiacSign, string> = {
  'Koç': 'Ruhunuz onay beklemeden kendi yolunu açmak, korkusuzca inisiyatif almak ve öz iradesini ortaya koymak ister.',
  'Boğa': 'Ruhunuz kalıcı iç huzuru, doğayla uyumu ve maddeden bağımsız manevi bir güvenliği inşa etmek ister.',
  'İkizler': 'Ruhunuz alkış veya sabit roller peşinde değildir; zihinsel merak, özgür bilgi arayışı ve gerçeği sorgulama açlığı duyar.',
  'Yengeç': 'Ruhunuz dünyevi başarıların ötesinde, koşulsuz sevgiyle sarıp sarmalamak ve derin duygusal kökler bulmak ister.',
  'Aslan': 'Ruhunuz sahte tevazuyu aşıp kalbinin saf ışığını saçmak ve ilham veren yaratıcı bir liderlik sunmak ister.',
  'Başak': 'Ruhunuz kibri arındırıp ilahi düzene hizmet etmek, bütünü mikro şifalar ve faydalı işlerle onarmak ister.',
  'Terazi': 'Ruhunuz ego savaşlarını bırakıp ilahi dengenin, koşulsuz sevginin ve hakiki adaletin aracı olmak ister.',
  'Akrep': 'Ruhunuz yüzeysel tesellileri aşıp tabuları yıkmak, krizleri aşarak küllerinden yeniden doğmak ister.',
  'Yay': 'Ruhunuz dar kalıpları yırtarak evrensel hakikate, yüksek felsefeye ve sınırsız bilgeliğe kanat açmak ister.',
  'Oğlak': 'Ruhunuz geçici hevesleri aşıp ruhsal ustalığa ulaşmak ve asırları aşan kalıcı bir manevi miras bırakmak ister.',
  'Kova': 'Ruhunuz bireysel egoyu aşıp tüm insanlığın özgürleşmesine ve kolektif bilincin uyanışına hizmet etmek ister.',
  'Balık': 'Ruhunuz ayrılık illüzyonundan çıkıp İlahi Kaynak ile bir olmak, koşulsuz affediş ve evrensel şifaya ulaşmak ister.'
};

export function getDraconicPointInterpretation(
  pointName: string,
  tropicalSign: ZodiacSign,
  draconicSign: ZodiacSign
): DraconicPointDetails {
  const tropicalMeaning = TROPICAL_PERSONA_DESCRIPTIONS[tropicalSign] || TROPICAL_PERSONA_DESCRIPTIONS['Koç'];
  const draconicMeaning = DRACONIC_SOUL_DESCRIPTIONS[draconicSign] || DRACONIC_SOUL_DESCRIPTIONS['Koç'];

  let synthesis = '';
  if (tropicalSign === draconicSign) {
    synthesis = `Dünyevi kişiliğiniz ile ruhsal amacınız tam uyum içinde; maske takmadan, olduğunuz gibi var olarak tekâmül edin.`;
  } else {
    const p = pointName.toLowerCase();
    if (p.includes('güneş') || p.includes('asıl amaç')) {
      synthesis = `${tropicalSign}'ın dünyevi çekim gücünü ${draconicSign}'ın hakikatini yaşamak ve yaymak için kullanın; egoya değil, amaca odaklanın.`;
    } else if (p.includes('ay') || p.includes('bilinçaltı')) {
      synthesis = `${tropicalSign}'ın savunma reflekslerini bırakıp ${draconicSign}'ın içsel huzuruna ve bilgeliğine güvenin.`;
    } else if (p.includes('lilith') || p.includes('gölge')) {
      synthesis = `${tropicalSign}'ın korkularını ve tabularını aşarak ruhunuzun ${draconicSign} burcundaki vahşi, boyun eğmeyen ilksel gücünü sahiplenin.`;
    } else if (p.includes('yükselen') || p.includes('evrensel kimlik')) {
      synthesis = `${tropicalSign} dış maskenizi, ruhunuzun ${draconicSign} misyonunu topluma ulaştıran bir köprü yapın.`;
    } else {
      synthesis = `${tropicalSign} dünyevi hedeflerinizi ${draconicSign}'ın kalıcı ve manevi değerleriyle yönetin.`;
    }
  }

  const spiritualMeaning = `${tropicalMeaning} Ruhsal özde: ${draconicMeaning} Anahtar: ${synthesis}`;

  return {
    pointName,
    tropicalSign,
    draconicSign,
    tropicalMeaning,
    draconicMeaning,
    synthesis,
    spiritualMeaning
  };
}

// ==========================================
// HUMAN DESIGN FULL-SPECTRUM SENTEZİ
// ==========================================

export interface GADHDGateSynthesis {
  gate: number;
  line: number;
  title: string;
  center: string;
  lineArchetype: string;
  shadowTrap: string;
  karmicGift: string;
  synthesis: string;
}

export interface TwelfthHouseHDFearSynthesis {
  dominantCenter: string;
  centerTitle: string;
  traumaMechanism: string;
  liberationKey: string;
}

export interface ChironHDGateSynthesis {
  gate: number;
  line: number;
  title: string;
  center: string;
  lineArchetype: string;
  woundKey: string;
  healingGift: string;
  transformationPractice: string;
}

export interface KADHDGateSynthesis {
  gate: number;
  line: number;
  title: string;
  center: string;
  lineArchetype: string;
  evolutionGoal: string;
  evolutionPath: string;
  actionableDharma: string;
}

export interface IncarnationCrossDetails {
  code: string;
  title: string;
  angleType: 'Right Angle (Kişisel Kader)' | 'Juxtaposition (Sabit Kader)' | 'Left Angle (Kişilerarası Kader)';
  sunGateTitle: string;
  description: string;
  gatesSummary: string;
  soulMission: string;
}

const CROSS_FAMILIES: Record<number, { name: string; trName: string; theme: string }> = {
  1: { name: 'The Sphinx', trName: 'Sfenks Çaprazı (Kozmik Yön & Vizyon)', theme: 'Kolektife yön gösterme, yeni yollar açma ve evrensel kılavuzluk.' },
  2: { name: 'The Sphinx', trName: 'Sfenks Çaprazı (Kozmik Yön & Vizyon)', theme: 'Doğru zamanlama, yüksek alıcılık ve ilahi rotayı belirleme.' },
  7: { name: 'The Sphinx', trName: 'Sfenks Çaprazı (Kozmik Yön & Vizyon)', theme: 'Görünmeyen rehberlik, demokratik liderlik ve geleceğe yön verme.' },
  13: { name: 'The Sphinx', trName: 'Sfenks Çaprazı (Kozmik Yön & Vizyon)', theme: 'Geçmişin bilgeliğini dinleme, sırları tutma ve yön tayin etme.' },
  10: { name: 'The Vessel of Love', trName: 'Aşk Gemisi Çaprazı (Koşulsuz Sevgi & Birlik)', theme: 'Kendini sevme, özgün varoluş ve doğal duruşla örnek olma.' },
  15: { name: 'The Vessel of Love', trName: 'Aşk Gemisi Çaprazı (Koşulsuz Sevgi & Birlik)', theme: 'Tüm insanlığı ve uç kutupları kucaklayan evrensel sevgi.' },
  25: { name: 'The Vessel of Love', trName: 'Aşk Gemisi Çaprazı (Koşulsuz Sevgi & Birlik)', theme: 'Koşulsuz masumiyet, yargısız kalp ve evrensel şefkat.' },
  46: { name: 'The Vessel of Love', trName: 'Aşk Gemisi Çaprazı (Koşulsuz Sevgi & Birlik)', theme: 'Bedensel varoluşu sevme, dünya hayatının kutsallığı ve talih.' },
  19: { name: 'The Four Ways', trName: 'Dört Yol Çaprazı (Duyarlılık & Uyanış)', theme: 'Toplumsal ihtiyaçları hissetme, ruhsal yakınlık ve uyanış.' },
  24: { name: 'The Four Ways', trName: 'Dört Yol Çaprazı (Duyarlılık & Uyanış)', theme: 'Zihinsel aydınlanma, yenilenme ve hakikate geri dönüş.' },
  33: { name: 'The Four Ways', trName: 'Dört Yol Çaprazı (Duyarlılık & Uyanış)', theme: 'Mahremiyet, deneyimleri hafızada süzme ve bilgece hatırlama.' },
  44: { name: 'The Four Ways', trName: 'Dört Yol Çaprazı (Duyarlılık & Uyanış)', theme: 'Geçmişin kalıplarını tanıma, doğru ekipleri ve insanları birleştirme.' },
  4: { name: 'The Cross of Explanation', trName: 'Açıklama & Hakikat Çaprazı', theme: 'Formüller üretme, karmaşık soruları mantıkla aydınlatma.' },
  23: { name: 'The Cross of Explanation', trName: 'Açıklama & Hakikat Çaprazı', theme: 'Karmaşıklığı en saf ve basit hale indirgeyerek aktarma dehası.' },
  43: { name: 'The Cross of Explanation', trName: 'Açıklama & Hakikat Çaprazı', theme: 'Eşsiz içgörüler, tabuları yıkan orijinal deha ve yeni paradigmalar.' },
  49: { name: 'The Cross of Explanation', trName: 'Açıklama & Hakikat Çaprazı', theme: 'Devrimci ilkeler, yüksek adalet ve toplumun dönüşümü.' },
  21: { name: 'The Cross of Tension', trName: 'Gerilim & İrade Çaprazı', theme: 'Kaynakları adil yönetme, kontrol ve irade ustalığı.' },
  38: { name: 'The Cross of Tension', trName: 'Gerilim & İrade Çaprazı', theme: 'Değerli amaçlar için cesurca savaşma ve anlam arayışı.' },
  39: { name: 'The Cross of Tension', trName: 'Gerilim & İrade Çaprazı', theme: 'Ruhları harekete geçiren kışkırtma ve derin tutku uyandırma.' },
  48: { name: 'The Cross of Tension', trName: 'Gerilim & İrade Çaprazı', theme: 'Kusursuz derinlik, dipsiz bilgi kuyusu ve somut çözümler.' },
  32: { name: 'The Cross of Maya', trName: 'Maya Çaprazı (İllüzyonları Çözme & Gerçeklik)', theme: 'Kalıcı olanı geçici olandan ayırma ve sezgisel süreklilik.' },
  42: { name: 'The Cross of Maya', trName: 'Maya Çaprazı (İllüzyonları Çözme & Gerçeklik)', theme: 'Döngüleri tamamlama, olgunlaşma ve evrimsel büyüme.' },
  61: { name: 'The Cross of Maya', trName: 'Maya Çaprazı (İllüzyonları Çözme & Gerçeklik)', theme: 'Evrenin gizemlerini çözme, içsel hakikate ve ilhama ulaşma.' },
  62: { name: 'The Cross of Maya', trName: 'Maya Çaprazı (İllüzyonları Çözme & Gerçeklik)', theme: 'Kelimelerin ve detayların gücüyle gerçeği kusursuz adlandırma.' },
  17: { name: 'The Cross of Service', trName: 'Kutsal Hizmet & İyileştirme Çaprazı', theme: 'Geleceği öngören mantıksal vizyon ve toplumsal rehberlik.' },
  18: { name: 'The Cross of Service', trName: 'Kutsal Hizmet & İyileştirme Çaprazı', theme: 'Bozuk olanı onarma, kusursuzlaştırma ve şifa hizmeti.' },
  52: { name: 'The Cross of Service', trName: 'Kutsal Hizmet & İyileştirme Çaprazı', theme: 'Hareketsizliğin kutsal gücü, dağ gibi sarsılmaz odaklanma.' },
  58: { name: 'The Cross of Service', trName: 'Kutsal Hizmet & İyileştirme Çaprazı', theme: 'Yaşam sevinci, bütünü daha iyiye taşıma coşkusu ve canlılık.' },
  9: { name: 'The Cross of Planning', trName: 'Planlama & Topluluk Sözleşmesi Çaprazı', theme: 'Mikro detaylara odaklanma ve büyük planları adım adım örme.' },
  16: { name: 'The Cross of Planning', trName: 'Planlama & Topluluk Sözleşmesi Çaprazı', theme: 'Ustalık, çok yönlü beceriler ve geleceği coşkuyla kurma.' },
  37: { name: 'The Cross of Planning', trName: 'Planlama & Topluluk Sözleşmesi Çaprazı', theme: 'Aile, sıcak topluluk bağı ve kutsal sadakat sözleşmeleri.' },
  40: { name: 'The Cross of Planning', trName: 'Planlama & Topluluk Sözleşmesi Çaprazı', theme: 'Topluluk için adanmış çalışma ve bağımsız dinlenme dengesi.' },
  5: { name: 'The Cross of Consciousness', trName: 'Kozmik Bilinç & Evrensel Ritim Çaprazı', theme: 'Evrensel ritimlere güvenme ve doğru zamanlamayı bekleme.' },
  11: { name: 'The Cross of Consciousness', trName: 'Kozmik Bilinç & Evrensel Ritim Çaprazı', theme: 'İlham veren fikirler, hayal gücü ve görsel bilgelik.' },
  35: { name: 'The Cross of Consciousness', trName: 'Kozmik Bilinç & Evrensel Ritim Çaprazı', theme: 'İnsani deneyimlerin zenginliği ve tekâmül basamakları.' },
  63: { name: 'The Cross of Consciousness', trName: 'Kozmik Bilinç & Evrensel Ritim Çaprazı', theme: 'Mantıksal sorgulama, şüpheyi aydınlığa çıkarma ve bilim.' },
  20: { name: 'The Sleeping Phoenix', trName: 'Uyuyan Anka Çaprazı (Yeniden Doğuş & An Bilinci)', theme: 'Saf şimdiki anın gücü, anlık eylem ve yüksek farkındalık.' },
  34: { name: 'The Sleeping Phoenix', trName: 'Uyuyan Anka Çaprazı (Yeniden Doğuş & An Bilinci)', theme: 'Muazzam bireysel yaşam gücü ve saf üretken kudret.' },
  55: { name: 'The Sleeping Phoenix', trName: 'Uyuyan Anka Çaprazı (Yeniden Doğuş & An Bilinci)', theme: 'Ruhun bolluğu, duygusal özgürlük ve melankoliyi aşma.' },
  59: { name: 'The Sleeping Phoenix', trName: 'Uyuyan Anka Çaprazı (Yeniden Doğuş & An Bilinci)', theme: 'Bariyerleri eritme, derin yakınlık ve yeni nesiller doğurma.' },
  6: { name: 'The Cross of Eden', trName: 'Cennet & Duygusal Olgunluk Çaprazı', theme: 'Çatışmaları aşarak barışçıl yakınlığa ve birliğe ulaşma.' },
  12: { name: 'The Cross of Eden', trName: 'Cennet & Duygusal Olgunluk Çaprazı', theme: 'Duyguların zarafetle ifadesi ve derin şiirsel duruş.' },
  36: { name: 'The Cross of Eden', trName: 'Cennet & Duygusal Olgunluk Çaprazı', theme: 'Duygusal krizleri bilgeliğe dönüştürme ve merhamet.' },
  22: { name: 'The Cross of Eden', trName: 'Cennet & Duygusal Olgunluk Çaprazı', theme: 'Ruhsal zarafet, müzikal duyarlılık ve nezaketin gücü.' },
  3: { name: 'The Cross of Laws', trName: 'Evrensel Yasalar & Mutasyon Çaprazı', theme: 'Kaosu kozmik düzene çevirme ve yeni yapıları başlatma.' },
  50: { name: 'The Cross of Laws', trName: 'Evrensel Yasalar & Mutasyon Çaprazı', theme: 'Toplumsal ahlak, değerler ve yeni nesilleri koruma yasaları.' },
  60: { name: 'The Cross of Laws', trName: 'Evrensel Yasalar & Mutasyon Çaprazı', theme: 'Sınırları kabul ederek sınırsız mutasyonlar ve yenilik yaratma.' },
  27: { name: 'The Cross of Laws', trName: 'Evrensel Yasalar & Mutasyon Çaprazı', theme: 'Koşulsuz besleme, koruma ve kolektif sorumluluk alma.' },
  26: { name: 'The Cross of Alignment', trName: 'Hizalanma & Kaynak Liderliği Çaprazı', theme: 'Doğru mesajı aktarma, ikna gücü ve güven inşa etme.' },
  45: { name: 'The Cross of Alignment', trName: 'Hizalanma & Kaynak Liderliği Çaprazı', theme: 'Topluluğu zenginleştirme, bolluk dağıtma ve egemen liderlik.' },
  8: { name: 'The Cross of Alignment', trName: 'Hizalanma & Kaynak Liderliği Çaprazı', theme: 'Örnek olarak liderlik etme, özgün tarz ve bireysel katkı.' },
  14: { name: 'The Cross of Alignment', trName: 'Hizalanma & Kaynak Liderliği Çaprazı', theme: 'Yüksek enerji, kaynak üretimi ve vizyoner projeleri fonlama.' },
  28: { name: 'The Cross of Dedication', trName: 'Kozmik Adanmışlık & Kader Çaprazı', theme: 'Hayata derin anlam katma ve korkusuzca mücadele etme.' },
  29: { name: 'The Cross of Dedication', trName: 'Kozmik Adanmışlık & Kader Çaprazı', theme: 'Kendini deneyime tam adama, sadakat ve güvenle yola çıkma.' },
  30: { name: 'The Cross of Dedication', trName: 'Kozmik Adanmışlık & Kader Çaprazı', theme: 'Duygusal arınma, ateşli tutkular ve kaderin çağrısını kabul.' },
  41: { name: 'The Cross of Dedication', trName: 'Kozmik Adanmışlık & Kader Çaprazı', theme: 'Yeni döngüleri başlatan vizyoner hayal gücü ve umut.' },
  53: { name: 'The Cross of Ambition', trName: 'Yükseliş & Ruhsal Başarı Çaprazı', theme: 'Yeni başlangıçların tohumunu ekme ve tekâmülü ilerletme.' },
  54: { name: 'The Cross of Ambition', trName: 'Yükseliş & Ruhsal Başarı Çaprazı', theme: 'Maddi dünyadan ruhsal zirvelere tırmanan saf azim.' },
  56: { name: 'The Cross of Ambition', trName: 'Yükseliş & Ruhsal Başarı Çaprazı', theme: 'Hikayeler anlatma, insanları uyandırma ve vizyon genişletme.' },
  57: { name: 'The Cross of Ambition', trName: 'Yükseliş & Ruhsal Başarı Çaprazı', theme: 'Anlık sezgisel netlik, tehlikeleri önceden sezen kutsal kulak.' },
  31: { name: 'The Cross of Awakening', trName: 'Büyük Uyanış & Dönüşüm Çaprazı', theme: 'Halkın sesi olma, ilhamla yönlendirme ve modern liderlik.' },
  47: { name: 'The Cross of Awakening', trName: 'Büyük Uyanış & Dönüşüm Çaprazı', theme: 'Zor deneyimleri aydınlatma, kafeslerden kurtulma ve içsel simya.' },
  51: { name: 'The Cross of Awakening', trName: 'Büyük Uyanış & Dönüşüm Çaprazı', theme: 'Şoklarla inisiye etme, sahte konforları yıkıp ruhu uyandırma.' },
  64: { name: 'The Cross of Awakening', trName: 'Büyük Uyanış & Dönüşüm Çaprazı', theme: 'Geçmişin imgelerini geleceğin sanatına ve bilincine dönüştürme.' }
};

export function getGADHDGateSynthesis(gate: number, line: number): GADHDGateSynthesis {
  const gateData = GATE_TITLES[gate] || { title: 'Bilinmeyen Kapı', gift: 'Ruhsal Ustalık', shadow: 'Atalet' };
  const center = GATE_TO_CENTER[gate] || 'Bilinmeyen Merkez';
  const lineData = LINE_BEHAVIOR_PROFILES[line] || LINE_BEHAVIOR_PROFILES[1];

  const shadowTrap = `Geçmiş enkarnasyonlarda "${gateData.shadow}" gölgesinde saplanıp kaldınız. Bilinçaltınız zorlandığında ${lineData.rootFear.toLowerCase()} sebebiyle ${lineData.challengingBehavior.toLowerCase()} Bu kalıp sizin çok iyi bildiğiniz ama bu hayatta aşmanız gereken en büyük konfor alanı tuzağınızdır.`;
  const karmicGift = `Ruhunuz geçmiş yaşamlardan "${gateData.gift}" ustalığını ve ${lineData.harmoniousBehavior.toLowerCase()} gücünü bu hayata hazır bir armağan olarak getirmiştir. Bu yeteneği sığınağınız değil, KAD hedeflerinize sıçrama tahtası yapmalısınız.`;
  const synthesis = `Kapı ${gate}.${line} (${center} Merkezi) geçmiş yaşamınızın kök kodudur. Tanıdık gelen gölge eğiliminiz: "${gateData.shadow}". Ruhsal dehanız: "${gateData.gift}".`;

  return {
    gate,
    line,
    title: gateData.title,
    center,
    lineArchetype: lineData.archetype,
    shadowTrap,
    karmicGift,
    synthesis
  };
}

export function getTwelfthHouseHDFearSynthesis(dominantCenter: string): TwelfthHouseHDFearSynthesis {
  switch (dominantCenter) {
    case 'Dalak':
      return {
        dominantCenter: 'Dalak',
        centerTitle: 'Dalak (Spleen) Merkezi - Hayatta Kalma & Beden Travması',
        traumaMechanism: 'Son nefeste ani bir tehlike, terk edilme veya fiziksel bedeni koruyamama korkusu bilinçaltınıza kazınmış. Geçmişten gelen bu hücresel korku, şimdiki hayatınızda açıklanamayan anksiyete, hastalık evhamı veya tehlike beklentisi olarak yüzeye çıkabilir.',
        liberationKey: 'Anlık sezgilerinize güvenin. Bedeninizin verdiği ilk ses daima doğrudur. Geleceğin belirsizliğini zihinle kontrol etmeye çalışmak yerine bedeninizin doğal bilgeliğine teslim olun.'
      };
    case 'Solar Pleksus':
      return {
        dominantCenter: 'Solar Pleksus',
        centerTitle: 'Solar Pleksus Merkezi - Duygusal Suçluluk & Utanç Travması',
        traumaMechanism: 'Son nefeste derin bir duygusal hayal kırıklığı, dışlanma, sevdiklerinin acısına sebep olma veya sevilmediğini hissederek ölme travması taşınıyor. Bilinçaltınız insanları memnun etmeye çalışırken kendi duygularını bastırma veya aniden öfkeyle patlama döngüsüne girebilir.',
        liberationKey: 'Duygusal dalgalanmaların en dibindeyken karar almayın. Başkalarının onayını kazanmak için kendi sınırlarınızı feda etmekten vazgeçin; duygusal özgürlük, suçluluk duymadan "Hayır" diyebilmektir.'
      };
    case 'Tepe (Taç)':
    case 'Ajna (Zihin)':
      return {
        dominantCenter: 'Ajna / Tepe',
        centerTitle: 'Taç & Ajna Merkezi - Zihinsel Sis & İnanç İhaneti Travması',
        traumaMechanism: 'Son nefeste fikirleri, inançları veya bildiği sırlar yüzünden cezalandırılma, zihinsel dengesini kaybetme veya inandığı tüm sistemin çöküşünü izleme korkusu bilinçaltına yerleşmiş. Bu hayatta aşırı düşünme, her şeyi analiz etme takıntısı ve yanılma korkusu yaratır.',
        liberationKey: 'Her sorunun zihinsel bir cevabı olmak zorunda değildir. Zihninizi bir rehber olarak kullanın, bir gardiyan değil. Bilinmeyenin içindeki ilahi düzene teslim olun.'
      };
    case 'Kalp (Ego)':
      return {
        dominantCenter: 'Kalp (Ego)',
        centerTitle: 'Kalp (Ego) Merkezi - İrade Kırılması & Değersizlik Travması',
        traumaMechanism: 'Son nefeste iradenin zorbalıkla kırılması, verilen sözlerin tutulamaması, köleleştirilme veya itibarını kaybederek ölme travması taşınıyor. Bu durum şimdiki hayatta kendini sürekli ispatlama, aşırı güç gösterme veya değersizlik korkusu doğurabilir.',
        liberationKey: 'Değerinizi hiçbir dış başarıya, unvana veya başkalarının onayına bağlamayın. Siz hiçbir şey kanıtlamak zorunda değilsiniz; varoluşunuz tek başına kutsaldır.'
      };
    case 'Kök':
      return {
        dominantCenter: 'Kök',
        centerTitle: 'Kök Merkezi - Ağır Yük & Sürekli Baskı Travması',
        traumaMechanism: 'Son nefeste bitmeyen bir savaş, ağır sorumluluklar altında ezilme veya yetiştirilemeyen zaman baskısı ile ölme hafızası kayıtlıdır. Şimdiki hayatınızda her şeyi hemen bitirme telaşı ve kronik stres üretebilir.',
        liberationKey: 'Hayat bir yarış değildir. Sahte aciliyetlerin sizi esir almasına izin vermeyin; derin nefes alın ve dinlenmenin en kutsal hak olduğunu kabul edin.'
      };
    case 'Benlik (G)':
      return {
        dominantCenter: 'Benlik (G)',
        centerTitle: 'Benlik (G) Merkezi - Yön Yitimi & Aidiyetsizlik Travması',
        traumaMechanism: 'Son nefeste sürgün edilme, kimsesiz kalma, nereye gideceğini bilememe ve ruhsal köklerinden koparılma travması taşınıyor. Bu durum şimdiki hayatta sürekli kim olduğunu ve nereye ait olduğunu arama huzursuzluğu yaratır.',
        liberationKey: 'Doğru yer ve doğru insanları aramak yerine kendi kalbinizin merkezinde evinizi bulun. Siz kendinizle barıştığınızda evren sizi doğru yöne zahmetsizce çekecektir.'
      };
    case 'Sakral':
      return {
        dominantCenter: 'Sakral',
        centerTitle: 'Sakral Merkezi - Yaşam Gücünün Sömürülmesi & Tükenmişlik',
        traumaMechanism: 'Son nefeste tüm yaşam enerjisinin başkalarının hizmetinde son damlasına kadar tüketilmesi, köle gibi çalıştırılma ve kendi arzularını yaşayamadan ölme travması mevcuttur.',
        liberationKey: 'Sadece karnınızdan, derinlerinizden coşkulu bir "Evet" gelen işlere ve insanlara enerjinizi verin. Tükendiğiniz yerde durmayı kutsal bir sınır olarak görün.'
      };
    case 'Boğaz':
    default:
      return {
        dominantCenter: 'Boğaz',
        centerTitle: 'Boğaz Merkezi - Susturulma & Hakikati Haykıramama',
        traumaMechanism: 'Son nefeste söylemek istediklerini söyleyememe, sesi kesilerek veya sırları mezara götürerek ölme travması taşınıyor. Şimdiki hayatta kendini ifade ederken boğazda düğümlenme veya konuşmaktan çekinme yaratabilir.',
        liberationKey: 'Sözünüzün kudretini fark edin. Doğru zaman geldiğinde kimseden onay beklemeden kendi hakikatinizi nezaketle ama tavizsizce dile getirin.'
      };
  }
}

export function getChironHDGateSynthesis(gate: number, line: number): ChironHDGateSynthesis {
  const gateData = GATE_TITLES[gate] || { title: 'Bilinmeyen Kapı', gift: 'Ruhsal Şifa', shadow: 'Yara' };
  const center = GATE_TO_CENTER[gate] || 'Bilinmeyen Merkez';
  const lineData = LINE_BEHAVIOR_PROFILES[line] || LINE_BEHAVIOR_PROFILES[1];

  const woundKey = `Kiron ${gate}. Kapı (${gateData.title}) ve ${line}. Çizgide (${center} Merkezi) yerleşmiştir. Ruhsal yaranızın kökeni: "${gateData.shadow}" frekansıdır. Bilinçaltınız ${lineData.rootFear.toLowerCase()} sebebiyle kendini doğuştan yaralı veya eksik hissetmiştir.`;
  const healingGift = `Bu yara sizin kapanmayacak kusurunuz değil; dünyaya sunacağınız en yüce şifa armağanıdır: "${gateData.gift}". Bu alanda derin bir sızı çektiğiniz için, aynı yarayı taşıyan insanları hemen fark eder ve ${lineData.harmoniousBehavior.toLowerCase()} dehasıyla onlara yol gösterirsiniz.`;
  const transformationPractice = `${lineData.actionableRemedy} Başkalarına şifa verirken kendi yaranızın da dönüştüğünü ve kutsal bir ışık kaynağına evrildiğini göreceksiniz.`;

  return {
    gate,
    line,
    title: gateData.title,
    center,
    lineArchetype: lineData.archetype,
    woundKey,
    healingGift,
    transformationPractice
  };
}

export function getKADHDGateSynthesis(gate: number, line: number): KADHDGateSynthesis {
  const gateData = GATE_TITLES[gate] || { title: 'Bilinmeyen Kapı', gift: 'Gelecek Işığı', shadow: 'Atalet' };
  const center = GATE_TO_CENTER[gate] || 'Bilinmeyen Merkez';
  const lineData = LINE_BEHAVIOR_PROFILES[line] || LINE_BEHAVIOR_PROFILES[1];

  const evolutionGoal = `Kuzey Düğümünüz ${gate}. Kapı (${gateData.title}) ve ${line}. Çizgidedir (${center} Merkezi). Ruhunuzun bu hayatta açığa çıkarması gereken ana potansiyel: "${gateData.gift}".`;
  const evolutionPath = `Bu yaşamda ${lineData.archetype} duruşunu sahiplenmeli ve ${lineData.generalTendency.toLowerCase()} doğrultusunda cesur adımlar atmalısınız. "${gateData.shadow}" gölgesine düşmekten çekinmeyin; gölgeyle yüzleştiğinizde "${gateData.gift}" dehası serbest kalacaktır.`;
  const actionableDharma = lineData.actionableRemedy;

  return {
    gate,
    line,
    title: gateData.title,
    center,
    lineArchetype: lineData.archetype,
    evolutionGoal,
    evolutionPath,
    actionableDharma
  };
}

export function getIncarnationCrossDetails(
  consciousSunGate: number,
  consciousEarthGate: number,
  unconsciousSunGate: number,
  unconsciousEarthGate: number,
  profile: string
): IncarnationCrossDetails {
  const code = `(${consciousSunGate}/${consciousEarthGate} | ${unconsciousSunGate}/${unconsciousEarthGate})`;
  const sunGateData = GATE_TITLES[consciousSunGate] || { title: 'Kozmik Kapı', gift: 'Ruhsal Uyanış', shadow: 'Amaçsızlık' };
  const family = CROSS_FAMILIES[consciousSunGate] || {
    name: 'The Cross of Purpose',
    trName: 'Evrensel Yaşam Amacı Çaprazı',
    theme: 'Kozmik bilincin uyanışı ve bireysel ruhsal amacın dünyaya taşınması.'
  };

  let angleType: 'Right Angle (Kişisel Kader)' | 'Juxtaposition (Sabit Kader)' | 'Left Angle (Kişilerarası Kader)';
  let angleDescription = '';

  if (profile === '4/1') {
    angleType = 'Juxtaposition (Sabit Kader)';
    angleDescription = 'Kişisel kader ile kolektif kader arasında sarsılmaz bir köprü görevi görürsünüz. Yaşam rotanız son derece nettir ve dış etkilerle kolay kolay rotasından sapmaz. Belirli ve odaklanmış bir ruhsal misyona kilitlenmişsinizdir.';
  } else if (profile.startsWith('5/') || profile.startsWith('6/')) {
    angleType = 'Left Angle (Kişilerarası Kader)';
    angleDescription = 'Kişilerarası ve kolektif bir misyonla bu dünyadasınız. Hayatınız, başkalarıyla kesişerek onlara rehberlik etmek, geçmiş karmik düğümleri çözmek ve toplumsal bir dönüşüm başlatmak için tasarlanmıştır. Başkalarına bıraktığınız etki sizin asıl tekâmülünüzdür.';
  } else {
    angleType = 'Right Angle (Kişisel Kader)';
    angleDescription = 'Bağımsız ve kişisel bir tekâmül sürecine odaklısınız. Dünyadaki varoluşunuz, kendi kararlarınız ve bireysel deneyimleriniz üzerinden yeni yollar keşfetmeye ayarlıdır. Başkalarının beklentilerinden bağımsız, kendi özgün patikanızı inşa etmek için buradasınız.';
  }

  const title = `${angleType.split(' ')[0]} Cross of ${family.name} (${family.trName})`;
  const gatesSummary = `Bilinçli Güneş: Kapı ${consciousSunGate} (Yaşam Işığı: ${sunGateData.gift}) | Bilinçli Dünya: Kapı ${consciousEarthGate} (Topraklanma) | Bilinçdışı Güneş: Kapı ${unconsciousSunGate} (Ruhsal İtici Güç) | Bilinçdışı Dünya: Kapı ${unconsciousEarthGate} (Karmik Temel)`;
  const soulMission = `${angleDescription} ${family.trName} altında doğarak ruhunuz şu büyük temayı gerçekleştirmeyi seçti: "${family.theme}". Bilinçli Güneşinizin ${consciousSunGate}. Kapıdaki (${sunGateData.title}) dehasını açığa çıkardığınızda, bu çapraz tüm ihtişamıyla hayatınızda parlar.`;

  return {
    code,
    title,
    angleType,
    sunGateTitle: sunGateData.title,
    description: angleDescription,
    gatesSummary,
    soulMission
  };
}

export interface InterceptedSignKarmicInfo {
  sign: ZodiacSign;
  oppositeSign: ZodiacSign;
  archetype: string;
  karmicRootCause: string;
  lockedPsychology: string;
  unlockKey: string;
  shadowTrap: string;
}

export const INTERCEPTED_SIGN_KARMIC_DATA: Record<ZodiacSign, InterceptedSignKarmicInfo> = {
  'Koç': {
    sign: 'Koç',
    oppositeSign: 'Terazi',
    archetype: 'Kilitli Cesaret & Bastırılmış İrade',
    karmicRootCause: 'Geçmiş yaşamlarda kendi isteklerinizi, öfkenizi veya liderliğinizi doğrudan ortaya koyduğunuzda şiddetle cezalandırıldınız, dışlandınız ya da başkalarına zarar verdiğiniz için vicdani felç yaşayarak iradenizi sandığa kilitlediniz.',
    lockedPsychology: 'Kişi erken yaşlarda kendi haklarını savunmakta zorlanır, çatışmadan çekinir veya ani öfke patlamalarıyla içsel baskıyı dışa vurur. "Ben kimim ve ne istiyorum?" sorusu kilitli kalır.',
    unlockKey: 'İkincil ilerletimde Mars veya Koç açıldığında ruh, başkalarından onay beklemeden kendi adına eyleme geçme hakkını geri kazanır. Sağlıklı bencillik ve cesaret kutsal bir uyanıştır.',
    shadowTrap: 'Pasif-agresif birikimler veya kendi hakkını savunmak yerine başkalarının gölgesine sığınmak.'
  },
  'Boğa': {
    sign: 'Boğa',
    oppositeSign: 'Akrep',
    archetype: 'Kilitli Özdeğer & Maddi Güven',
    karmicRootCause: 'Geçmiş hayatta mülkiyetiniz, toprağınız veya bedeniniz elinizden zorla alındı; ya da aşırı maddeye saplanıp her şeyi bir gecede kaybederek derin bir kıtlık ve değersizlik travmasıyla ruhunuzu kilitlediniz.',
    lockedPsychology: 'Kendi emeğinin ve bedeninin kıymetini bilmekte zorlanma, parayla veya sahip olduklarıyla sürekli bir güvensizlik yaşama veya tam tersine aşırı bağımlılık geliştirme hali.',
    unlockKey: 'Kendi özdeğerinin dışsal varlıklara değil, ruhun doğuştan gelen hakkına dayandığını anlamak. Toprakla, bedenle ve huzurla barışıp kendi üretken bahçesini kurmak.',
    shadowTrap: 'Değersizlik hissiyle azına razı olmak ya da kaybetme korkusuyla biriktirme takıntısı.'
  },
  'İkizler': {
    sign: 'İkizler',
    oppositeSign: 'Yay',
    archetype: 'Kilitli Ses & Susturulmuş Merak',
    karmicRootCause: 'Geçmiş yaşamlarda düşündüklerinizi söylediğiniz, gerçeği sorguladığınız veya bir bilgiyi yaydığınız için susturuldunuz, alaya alındınız ya da fikirleriniz yüzünden bedel ödediniz.',
    lockedPsychology: 'Kişi düşündüklerini söylerken anlaşılmayacağı korkusu yaşar; zihni sürekli konuşur ama en hakiki düşüncelerini dışarıya akıtamaz, zihinsel kararsızlık yaşar.',
    unlockKey: 'Kendi zihninin kıvraklığına ve sesine güvenmek. Düşüncelerini korkusuzca yazmak, konuşmak ve merakını yargılamadan takip etmek bu kilidi açar.',
    shadowTrap: 'Suskunluk ile yüzeysel gevezelik arasında gidip gelerek derin hakikatini saklamak.'
  },
  'Yengeç': {
    sign: 'Yengeç',
    oppositeSign: 'Oğlak',
    archetype: 'Kilitli Şefkat & Bastırılmış Yuva',
    karmicRootCause: 'Geçmiş hayatta ailenizden, köklerinizden veya sevdiklerinizden zorla koparıldınız; duygusal kırılganlık gösterdiğiniz için ezildiniz ve duyguları göstermenin bir zayıflık olduğuna inanarak kalbinizi mühürlediniz.',
    lockedPsychology: 'Duygularını ifade etmekte büyük bir çekingenlik, ait hissedememe, şefkat beklerken katı bir kabuk arkasına saklanma ve içsel çocukla temas kuramama.',
    unlockKey: 'Kendi kendine şefkatli bir anne olabilmek; kırılganlığın en büyük ruhsal güç olduğunu kabul ederek güvenli duygusal alanlar inşa etmek.',
    shadowTrap: 'Kırılmaktan korktuğu için mesafeli durup içten içe derin yalnızlık çekmek.'
  },
  'Aslan': {
    sign: 'Aslan',
    oppositeSign: 'Kova',
    archetype: 'Kilitli Işık & Bastırılmış Görkem',
    karmicRootCause: 'Geçmişte kibirle güç kullanıp sonrasında büyük bir utanç yaşadınız; ya da tam tersine yetenekleriniz ve yaratıcı parlaklığınız hasetle söndürüldü, öne çıkmanız yasaklandı.',
    lockedPsychology: 'Kendi yaratıcılığını göstermekten utanma, sahnede olmaktan veya takdir edilmekten korkma; "Ben özel değilim" inancıyla kendi ışığını saklama.',
    unlockKey: 'Kalp merkezini (Anahata) açarak, başkalarının alkışı için değil sadece varoluşun bir kutlaması olarak içindeki çocuğu ve yaratıcı dehasını parlatmak.',
    shadowTrap: 'Görünmez olmaya çalışırken içten içe fark edilmemenin derin kırgınlığını yaşamak.'
  },
  'Başak': {
    sign: 'Başak',
    oppositeSign: 'Balık',
    archetype: 'Kilitli Düzen & Bastırılmış Ustalık',
    karmicRootCause: 'Geçmiş hayatta yaptığınız işlerde haksız yere kusurlu bulundunuz, köle gibi çalıştırılıp emeğiniz hiçe sayıldı ya da aşırı mükemmeliyetçilik yüzünden hayatı kendinize zehir ettiniz.',
    lockedPsychology: 'Sürekli bir yetersizlik hissi, detaylarda boğulup büyük resmi kaçırma korkusu veya kendi bedeninin ve zanaatının bilgeliğine güvenememe.',
    unlockKey: 'Mükemmelliğin bir hedef değil, ilahi bir süreç olduğunu kabul etmek. Bedenine ve sunduğu hizmete saygı duyarak sadeleşmeyi ve arınmayı öğrenmek.',
    shadowTrap: 'Kendini ve çevresini acımasızca eleştirerek harekete geçmeyi ertelemek.'
  },
  'Terazi': {
    sign: 'Terazi',
    oppositeSign: 'Koç',
    archetype: 'Kilitli Denge & Bastırılmış Eşitlik',
    karmicRootCause: 'Geçmiş yaşamlarda ilişkilerde tamamen yok sayıldınız, evlilikler veya ortaklıklarda sömürüldünüz ya da çatışmayı engellemek uğruna tüm haklarınızı teslim ettiniz.',
    lockedPsychology: 'Hakiki bir ortaklık kurmakta tereddüt, karar vermekte aşırı zorlanma, yalnız kalma korkusu ile sınır koyamama arasındaki içsel sıkışma.',
    unlockKey: 'Kendi içinde eril ve dişil dengeyi kurup, taviz vermeden de sevilebileceğini anlamak. Adaleti ve uyumu dışarıdan dilenmek yerine kendi merkezinden yaymak.',
    shadowTrap: 'Huzur bozulmasın diye boyun eğip içten içe adaletsizlik duygusuyla dolmak.'
  },
  'Akrep': {
    sign: 'Akrep',
    oppositeSign: 'Boğa',
    archetype: 'Kilitli Dönüşüm & Mühürlü Simya',
    karmicRootCause: 'Geçmişte derin bir ihanet, büyü/okültizm cezalandırılması veya ölümcül bir kriz deneyimlediniz. Gücünüzü gösterdiğinizde felaket geldiği için sezgilerinizi ve tutkunuzu yerin altına kilitlediniz.',
    lockedPsychology: 'Aşırı kontrolcülük, kimseye güvenememe, derin duygulardan ve cinsellik/tutku gibi dönüştürücü güçlerden korkma, savunma kalkanı arkasında yaşama.',
    unlockKey: 'Karanlıktan korkmak yerine onun içindeki ışığı görmeyi öğrenmek. Sezgisel ve simyasal gücünü teslimiyetle ve şifa amacıyla açığa çıkarmak.',
    shadowTrap: 'İhanete uğrama korkusuyla herkesi şüpheli görüp kendi cehennemini yaratmak.'
  },
  'Yay': {
    sign: 'Yay',
    oppositeSign: 'İkizler',
    archetype: 'Kilitli İnanç & Mühürlü Vizyon',
    karmicRootCause: 'Geçmiş hayatta dini dogmalar veya fanatizm yüzünden zulüm gördünüz ya da kendi inancınız yüzünden sürüldünüz; ruhunuz yüksek anlam arayışını kilitledi.',
    lockedPsychology: 'Hayatın anlamına ve evrenin adaletine güvenmekte zorlanma, kendi vizyonunu küçümseme, dar kalıplar içine sıkışıp kalma hissi.',
    unlockKey: 'Evrensel bilgeliğe ve kendi içsel felsefesine yeniden inanmak. Seyahat, felsefe ve yüksek bilinç kapılarını cesaretle aralamak.',
    shadowTrap: 'Ya hiçbir şeye inanmayıp sinikleşmek ya da dogmatik bir fanatizme sığınmak.'
  },
  'Oğlak': {
    sign: 'Oğlak',
    oppositeSign: 'Yengeç',
    archetype: 'Kilitli Otorite & Bastırılmış Saygınlık',
    karmicRootCause: 'Geçmişte üzerinize kaldıramayacağınız kadar erken yaşta devasa sorumluluklar yüklendi veya otorite figürleri tarafından ezilerek başarı hakkınız gaspedildi.',
    lockedPsychology: 'Başarı ve sorumluluk almaktan bilinçdışı korkma, kendi hayatının yöneticisi olduğunu kabul etmekte zorlanma veya tam tersi katı bir soğukluk sergileme.',
    unlockKey: 'Kendi içsel bilge otoritesini (Satürn) sahiplenmek. Zamanın bilgeliğine güvenerek sabırla kendi kalıcı ruhsal krallığını inşa etmek.',
    shadowTrap: 'Başarısızlık korkusuyla sorumluluktan kaçmak veya duygusuz bir işkolikliğe sığınmak.'
  },
  'Kova': {
    sign: 'Kova',
    oppositeSign: 'Aslan',
    archetype: 'Kilitli Özgünlük & Mühürlü Deha',
    karmicRootCause: 'Geçmişte farklı düşündüğünüz, toplumsal normların ötesine geçtiğiniz veya devrimci fikirleriniz yüzünden aforoz edildiniz, kabileden/topluluktan kovuldunuz.',
    lockedPsychology: 'Kendi marjinal ve dahi tarafını saklama, topluma uyum sağlamak için sıradanlaşma çabası, kolektife güvenmekte ve ait hissetmekte zorlanma.',
    unlockKey: 'Kendi tuhaflığını ve benzersiz dehasını kutsal bir hediye olarak kabul etmek. Kolektif bilinci uyandırmak için sürüden ayrılma cesaretini göstermek.',
    shadowTrap: 'Dışlanma korkusuyla silikleşmek ya da isyankar olup bağları tamamen koparmak.'
  },
  'Balık': {
    sign: 'Balık',
    oppositeSign: 'Başak',
    archetype: 'Kilitli Teslimiyet & Mühürlü Sezgi',
    karmicRootCause: 'Geçmiş yaşamlarda aşırı fedakarlık yapıp kurban edildiniz; manastırlarda/inzivalarda dünyadan koparıldınız ya da sezgileriniz yüzünden büyücülükle suçlanıp yok edildiniz.',
    lockedPsychology: 'Ruhsal alem ile madde alemi arasında köprü kuramama, sezgilerine güvenmekten korkma, kurban psikolojisine düşme veya aşırı mantıkçılıkla sezgileri bastırma.',
    unlockKey: 'Evrenle bir olduğunu hatırlamak. Şartsız teslimiyet ve ilahi sevgi kanalını açarak sanatsal ve şifacı ilhamı dünyaya aktarmak.',
    shadowTrap: 'Gerçeklerden kaçmak için bağımlılıklara sığınmak veya aşırı katı rasyonalizmle ruhunu hapsetmek.'
  }
};

export interface AnareticDegreeInfo {
  degreeType: '29° Anaretik Derece' | '28° Kritik Eşik' | '0°-1° Taze Tohum' | 'Dengeli Seyir';
  badgeTitle: string;
  badgeColor: string;
  karmicStage: string;
  evolutionSummary: string;
}

export function getAnareticDegreeInfo(
  degreeInSign: number,
  minutes: number,
  natalSign: ZodiacSign,
  progressedSign: ZodiacSign,
  progressedAge: number,
  currentAge: number | null
): AnareticDegreeInfo {
  if (degreeInSign === 29) {
    return {
      degreeType: '29° Anaretik Derece',
      badgeTitle: '29° Anaretik Derece (Karmik Kapanış & Usta Eşik)',
      badgeColor: '#EF4444',
      karmicStage: 'Tamamlanmış Ruhsal Döngü',
      evolutionSummary: `Doğum anınızda Güneş ${natalSign} burcunun 29. son derecesindedir. Ezoterik astrolojide 29° bir kriz değil, "Karmik Mühür" derecesidir. Ruhunuz ${natalSign} burcunun tüm derslerini geçmiş yaşamlarda tamamlamış ve bu hayata o kapıyı kapatmaya gelmiştir. İkincil İlerletilmiş Haritanızda henüz ${progressedAge} yaşındayken Güneşiniz ${progressedSign} burcuna geçmiş ve ruhsal bilinciniz çocukluğunuzun hemen başında bir sonraki basamağa sıçramıştır.${currentAge !== null ? ` Şu an ${currentAge} yaşındasınız ve yaşam kararlarınızı ${progressedSign} frekansının olgunluğuyla almaktasınız.` : ''}`
    };
  }
  if (degreeInSign === 28) {
    return {
      degreeType: '28° Kritik Eşik',
      badgeTitle: '28° Kritik Geçiş Eşiği',
      badgeColor: '#F59E0B',
      karmicStage: 'Kabuk Değişimi Hazırlığı',
      evolutionSummary: `Güneşiniz ${natalSign} burcunun 28. derecesinde olup son eşiktedir. Ruhunuz bu burcun son sınavlarını verirken bir yandan da ${progressedSign} burcunun enerjisine çekilir. İkincil İlerletilmiş Haritanızda yaklaşık ${progressedAge} yaşında Güneşiniz ${progressedSign} burcuna adım atmış ve yaşamınızda köklü bir mizaç ve rota değişimi tetiklenmiştir.${currentAge !== null && currentAge >= progressedAge ? ` Şu an ${currentAge} yaşındasınız ve ruhunuz ${progressedSign} burcunun derin bilinciyle hareket etmektedir.` : ''}`
    };
  }
  if (degreeInSign === 0 || (degreeInSign === 1 && minutes <= 30)) {
    return {
      degreeType: '0°-1° Taze Tohum',
      badgeTitle: '0°-1° Taze Tohum (Yeni Evrimsel Başlangıç)',
      badgeColor: '#10B981',
      karmicStage: 'Saf Keşif Alanı',
      evolutionSummary: `Güneşiniz ${natalSign} burcunun en başında (0°-1°) yer almaktadır. Bu, ruhunuzun ${natalSign} arketipiyle yepyeni bir sayfaya başladığını gösterir. Geçmiş yaşam yükü en az olan, saf bir öğrenme ve inşa etme dönemindesiniz. Önünüzde yaklaşık 30 yıllık kesintisiz bir ${natalSign} ustalığı yolculuğu bulunmaktadır.`
    };
  }
  return {
    degreeType: 'Dengeli Seyir',
    badgeTitle: 'Dengeli Tekâmül Seyri',
    badgeColor: '#6366F1',
    karmicStage: 'Kademeli Ruhsal İnşa',
    evolutionSummary: `Güneşiniz ${natalSign} burcunun ${degreeInSign}. derecesindedir. Ruhunuz bu arketipte dengeli bir ustalık sürecindedir. İkincil İlerletilmiş Haritanıza göre yaklaşık ${progressedAge} yaşına geldiğinizde Güneşiniz sınırları aşarak ${progressedSign} burcuna geçecek ve ruhunuz yeni bir tekâmül evresine adım atacaktır.${currentAge !== null && currentAge >= progressedAge ? ` Şu an ${currentAge} yaşındasınız ve bu geçiş gerçekleşmiş durumdadır; ${progressedSign} frekansını hayatınıza entegre etmişsinizdir.` : ''}`
  };
}

