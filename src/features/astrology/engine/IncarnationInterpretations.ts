import { ZodiacSign } from './AstrologyConstants';

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

export interface RetroKarmicDebt {
  planet: string;
  title: string;
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

// Retro Gezegenler - Karmik Borçlar
export const RETRO_KARMIC_DEBTS: Record<string, RetroKarmicDebt> = {
  'Merkür': {
    planet: 'Merkür',
    title: 'Hakikat ve İletişim Karması',
    pastLifeCause: 'Geçmiş yaşamlarda bilgiyi çıkarlarınız için sakladınız, yalan haber yaydınız veya keskin sözlerinizle başkalarının onurunu zedelediniz.',
    currentLifeKarma: 'Zihin sürekli geriye dönük çalışır; kendinizi ifade etmekte gecikir, yanlış anlaşılma endişesiyle susar ya da iç diyaloğa kilitlenirsiniz.',
    dharmaRemedy: 'Sadece hakikati konuşmak, dedikodudan uzak durmak, yazarak ruhu arındırmak ve içsel bilgeliği dinlemek.'
  },
  'Venüs': {
    planet: 'Venüs',
    title: 'Aşk, Değer ve Sadakat Karması',
    pastLifeCause: 'Geçmişte aşka, ilişkilere veya sanata gereken değeri vermediniz; sevgiyi bir pazarlık unsuru yaptınız ya da kalpleri kırdınız.',
    currentLifeKarma: 'Kendini sevilmeye layık görememe, ilişkilerde sürekli geçmiş partnerlerin gölgelerini arama veya aşırı fedakarlıkla tükenme.',
    dharmaRemedy: 'Önce kendi öz değerini inşa etmek, koşulsuz sevgiyi bir pazarlık olmadan deneyimlemek ve estetik şifa yaratmak.'
  },
  'Mars': {
    planet: 'Mars',
    title: 'Güç, Öfke ve Şiddet Karması',
    pastLifeCause: 'Geçmişte kontrolsüz şiddet uyguladınız, haksız savaşlara katıldınız ya da tam tersine haklı öfkenizi bastırıp felç oldunuz.',
    currentLifeKarma: 'Öfkeyi içeriye yöneltme eğilimi, pasif-agresif patlamalar, harekete geçmekte tereddüt ve kendi gücünden korkma.',
    dharmaRemedy: 'Öfkeyi yapıcı bir yaratıcı disipline ve spora kanalize etmek, zayıfların koruyucusu olarak cesaret göstermek.'
  },
  'Jüpiter': {
    planet: 'Jüpiter',
    title: 'İnanç, Etik ve Kibir Karması',
    pastLifeCause: 'Geçmişte dini ya da ahlaki bir otoriteyi kötüye kullandınız, sahte vaiz oldunuz ya da ruhsal kibirle başkalarını yargıladınız.',
    currentLifeKarma: 'Dışsal inanç sistemlerine şüpheyle bakma, içsel boşluk hissi ve kendi ahlaki ilkelerini sıfırdan keşfetme zorunluluğu.',
    dharmaRemedy: 'Dogmalara değil kendi vicdanının sesine güvenmek, tevazu ile öğrenci kalmak ve karşılıksız bilgelik paylaşmak.'
  },
  'Satürn': {
    planet: 'Satürn',
    title: 'Büyük Karmik Sorumluluk & Zaman Borcu',
    pastLifeCause: 'Geçmiş yaşamlarda aldığınız sorumlulukları terk ettiniz, başkalarına karşı zalimce bir otorite kurdunuz veya taahhütlerinizi hiçe saydınız.',
    currentLifeKarma: 'Hayatta her şeyin geç ve büyük zahmetlerle gelmesi, derin yetersizlik hissi ve omuzlarda hissedilen açıklanamaz suçluluk yükü.',
    dharmaRemedy: 'Zamanın efendisi olmak, sabırla çalışmak, dürüstlükten asla sapmamak ve kendi sınırlarını sevgiyle inşa etmek.'
  },
  'Uranüs': {
    planet: 'Uranüs',
    title: 'Özgürlük ve İsyan Karması',
    pastLifeCause: 'Geçmişte anarşistçe bir yıkım yarattınız ya da toplumun kurallarını hiçe sayarak başkalarının hayatını altüst ettiniz.',
    currentLifeKarma: 'Sürekli bir yere ait olamama hissi, ani içsel huzursuzluklar ve sistemle uzlaşmakta derin bir direnç.',
    dharmaRemedy: 'Özgürlüğü sadece kendini soyutlamak olarak değil, insanlığın tekâmülüne hizmet eden özgün bir uyanış olarak yaşamak.'
  },
  'Neptün': {
    planet: 'Neptün',
    title: 'İllüzyon, Kaçış ve Aldanış Karması',
    pastLifeCause: 'Geçmişte gerçeklerden kaçmak için bağımlılıklara, sahte tarikatlara sığındınız veya insanları manevi illüzyonlarla yanılttınız.',
    currentLifeKarma: 'Sınır koyamama, sürekli kurban rolüne çekilme, kime güveneceğini bilememe ve gerçeklikten kopma arzusu.',
    dharmaRemedy: 'Ruhsal uyanışı ayırt etme yeteneğiyle (discernment) birleştirmek, sanat ve dua ile ilahi sevginin saf kanalı olmak.'
  },
  'Plüton': {
    planet: 'Plüton',
    title: 'Karanlık Güç ve Dönüşüm Karması',
    pastLifeCause: 'Geçmişte muazzam bir güç, büyü veya siyasi manipülasyonla kitleleri yönettiniz ya da yıkıcı bir ihanetin kurbanı oldunuz.',
    currentLifeKarma: 'Güçsüz düşmekten dehşet duyma, derin kontrol ihtiyacı ve hayatın belirli dönemlerinde yaşanan köklü yıkım-yeniden doğuş krizleri.',
    dharmaRemedy: 'Egoyu öldürüp Anka kuşu gibi küllerinden doğmak, gücü başkalarını manipüle etmek için değil, onları karanlıktan çıkarmak için kullanmak.'
  }
};

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
  'Koç': 'Dünyevi planda Koç; öncü olma, rekabet etme, bağımsızlık, hız, ilk adımı atma ve doğrudan yüzleşme arzusudur. İnsanlar sizi dışarıdan cesur, tez canlı, kendi başına buyruk ve savaşçı bir enerjiyle algılar.',
  'Boğa': 'Dünyevi planda Boğa; maddi güvence, somut istikrar, duyusal hazlar, sadakat ve konfor alanını koruma arzusudur. İnsanlar sizi dışarıdan sakin, güvenilir, köklü ve sarsılmaz bir kale gibi algılar.',
  'İkizler': 'Dünyevi planda İkizler; zihinsel merak, çok yönlülük, sosyal iletişim, bilgi toplama ve sürekli hareket halinde olma arzusudur. İnsanlar sizi dışarıdan esprili, konuşkan, çevik ve zeki bir arayışçı olarak algılar.',
  'Yengeç': 'Dünyevi planda Yengeç; duygusal güvence, aidiyet, ailesel bağlar, koruyuculuk ve şefkatli bir koza yaratma arzusudur. İnsanlar sizi dışarıdan duyarlı, empatik, anaç/babacan ve hassas bir sığınak olarak algılar.',
  'Aslan': 'Dünyevi planda Aslan; görünürlük, sahnede olma, takdir edilme, onay görme, yaratıcı karizma sergileme ve liderlik arzusudur. İnsanlar sizi dışarıdan kendine güvenen, cömert, gururlu ve ortamın parlayan yıldızı olarak algılar.',
  'Başak': 'Dünyevi planda Başak; pratik fayda, düzen, analiz, kusursuzluk, hizmet etme ve işleri mükemmel çalıştırma arzusudur. İnsanlar sizi dışarıdan titiz, çalışkan, güvenilir ve detaylara hakim bir usta olarak algılar.',
  'Terazi': 'Dünyevi planda Terazi; estetik, sosyal ahenk, diplomasi, onaylanma, ortaklık kurma ve çatışmadan kaçınma arzusudur. İnsanlar sizi dışarıdan kibar, zarif, adil ve uyumlu bir diplomat olarak algılar.',
  'Akrep': 'Dünyevi planda Akrep; güç, kontrol, gizem, derin duygusal bağlar, kriz yönetimi ve nüfuz sahibi olma arzusudur. İnsanlar sizi dışarıdan karizmatik, ketum, sezgisel ve sarsılmaz bir iradeye sahip olarak algılar.',
  'Yay': 'Dünyevi planda Yay; özgürlük, macera, iyimserlik, büyük vizyonlar, felsefi keşif ve sınırları aşma arzusudur. İnsanlar sizi dışarıdan neşeli, coşkulu, bağımsız ve açık sözlü bir gezgin olarak algılar.',
  'Oğlak': 'Dünyevi planda Oğlak; statü, saygınlık, somut başarı, disiplin, sorumluluk alma ve zirveye tırmanma arzusudur. İnsanlar sizi dışarıdan olgun, otoriter, ciddi ve dayanıklı bir yönetici olarak algılar.',
  'Kova': 'Dünyevi planda Kova; özgünlük, bağımsızlık, marjinallik, toplumsal idealler, yenilik ve gelenekleri yıkma arzusudur. İnsanlar sizi dışarıdan vizyoner, entelektüel, mesafeli ve sıra dışı bir reformcu olarak algılar.',
  'Balık': 'Dünyevi planda Balık; sınırsız empati, hayal gücü, fedakarlık, maneviyat ve katı dünyadan kaçış arzusudur. İnsanlar sizi dışarıdan şefkatli, gizemli, sanatsal ve ilahi akışa teslim bir ruh olarak algılar.'
};

export const DRACONIC_SOUL_DESCRIPTIONS: Record<ZodiacSign, string> = {
  'Koç': 'Ruhunuzun derin ebedi arzusu Koç frekansındadır; dünyevi maskeniz ne kadar uyumlu olursa olsun, ruhunuz tekâmül etmek için korkusuzca kendi öz yolunu açmak, kimseye sormadan inisiyatif almak ve kendi ilahi iradesini ortaya koymak ister.',
  'Boğa': 'Ruhunuzun derin ebedi arzusu Boğa frekansındadır; dış dünyanın tüm karmaşası içinde ruhunuz kendi içsel tapınağında sükuneti, doğayla tam birliği, kalıcı manevi değerleri ve ruhsal zenginliği inşa etmek ister.',
  'İkizler': 'Ruhunuzun derin ebedi arzusu İkizler frekansındadır; alkıştan veya katı rollerden ziyade, ruhunuz zihinsel merak, evrensel bilgi arayışı, önyargısızca sorgulama ve hakikat tohumlarını kitlelere aktarma peşindedir.',
  'Yengeç': 'Ruhunuzun derin ebedi arzusu Yengeç frekansındadır; dış dünyadaki başarılarınızın ötesinde, ruhunuz koşulsuz şefkati, kutsal anaç enerjiyi, duygusal köklerle barışmayı ve kalpleri bir yuva sıcaklığında kucaklamayı arar.',
  'Aslan': 'Ruhunuzun derin ebedi arzusu Aslan frekansındadır; sahte tevazuyu bırakıp ilahi bir kraliyet çocuğu olduğunu hatırlamak, kalbin saf güneş ışığını korkusuzca yaymak ve ruhsal liderliğini yaratıcılıkla ortaya koymak ister.',
  'Başak': 'Ruhunuzun derin ebedi arzusu Başak frekansındadır; ruhunuz dünyayı ilahi düzenin mikro şifalarıyla onarmak, kibri arındırmak, kutsal bir hizmet bilinci geliştirmek ve kaosu ışığın geometrisiyle hizalamak ister.',
  'Terazi': 'Ruhunuzun derin ebedi arzusu Terazi frekansındadır; ego savaşlarını bir kenara bırakıp ilahi aşkın ve evrensel dengenin aracı olmak, ilişkiler aynasında Yaratıcı\'nın güzelliğini ve adaletini yansıtmak ister.',
  'Akrep': 'Ruhunuzun derin ebedi arzusu Akrep frekansındadır; yüzeysel hiçbir teselliyle yetinmeyip ruhun en karanlık mağaralarını temizlemek, tabuları yıkmak, kadersel bir simya ile küllerinden yeniden doğmak ister.',
  'Yay': 'Ruhunuzun derin ebedi arzusu Yay frekansındadır; dünyevi dogma ve dar kalıpları yırtarak evrenin yüksek yasalarına, mutlak hakikate ve ilahi bilgeliğe kanat açmak, kadersel bir ışık rehberi olmak ister.',
  'Oğlak': 'Ruhunuzun derin ebedi arzusu Oğlak frekansındadır; gelip geçici hevesleri aşıp ruhun ebedi ustalığını, kadersel disiplinini kazanmak ve arkasında asırları aşan kutsal bir tekâmül mirası bırakmak ister.',
  'Kova': 'Ruhunuzun derin ebedi arzusu Kova frekansındadır; kişisel hırslardan tamamen özgürleşerek tüm insanlığın uyanışına, kolektif bilincin sıçramasına ve yeni çağın kozmik kardeşliğine hizmet etmek ister.',
  'Balık': 'Ruhunuzun derin ebedi arzusu Balık frekansındadır; dünya illüzyonunun ve ayrılık bilincinin ötesine geçip İlahi Kaynak ile bir olmak, koşulsuz sevgiyle affetmek ve kozmik şifa kanalı haline gelmek ister.'
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
    synthesis = `Nadir bir kozmik hizalanma: ${pointName} noktanız hem dünyevi maskenizde hem de ebedi ruh boyutunuzda ${tropicalSign} burcunda buluşuyor! Bu durum, dünyevi kişiliğiniz ile ruhunuzun ebedi amacının tam bir uyum içinde olduğunu gösterir. Maske takmadan, olduğunuz gibi parlayarak tekâmül etmelisiniz.`;
  } else {
    synthesis = `Kozmik Sentez & Tekâmül Anahtarı: Dış dünyadaki ${tropicalSign} yetenek ve davranışlarınızı bir ego tatmin aracı olarak değil; ruhunuzun derinlerindeki ${draconicSign} hakikatini ve ebedi arzusunu dünyada somutlaştırmak için kutsal bir köprü olarak kullanmalısınız. Dünyevi ${tropicalSign} maskeniz, ruhunuzun ${draconicSign} cevherini koruyan ve ifade eden kutsal kadehtir.`;
  }

  const spiritualMeaning = `${tropicalMeaning} ${draconicMeaning} ${synthesis}`;

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
