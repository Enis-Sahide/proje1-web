/**
 * 7Layers - Kelt / Druid Ağaç Astrolojisi ve Bilgelik Motoru
 * 
 * Kadim Kelt (Druid) geleneğinde Güneş yılı, 4 kardinal ekinoks/gündönümü ağacı
 * ve yıl içinde ikişer zıt dönemde tekrarlanan 18 döngüsel ağaç (toplam 22 kutsal ağaç)
 * ve Ogham alfabesi ile eşleştirilir.
 * 
 * Tıbbi / dahili tüketim içermez. Yalnızca ağaç topraklanması (Shinrin-Yoku)
 * ve güvenli ortam kokulandırması (buhur/uçucu yağ) prensibini esas alır.
 */

export interface DruidTreePeriod {
  startMonth: number; // 1-12
  startDay: number;   // 1-31
  endMonth: number;   // 1-12
  endDay: number;     // 1-31
  label: string;      // Görsel tarih etiketi
}

export interface DruidTree {
  id: string;
  name: string;
  botanicalName: string;
  oghamSymbol: string;
  oghamName: string;
  periods: DruidTreePeriod[];
  isCardinalStation: boolean; // Ekinoks veya gündönümü ağacı mı?
  stationLabel?: string;      // "İlkbahar Ekinoksu", "Yaz Gündönümü" vb.
  archetype: string;          // Druid Arketipleri: "Kozmik Koruyucu", "Kalp Simyacısı" vb.
  element: string;            // Kelt Elementi: "Toprak & Ateş", "Hava" vb.
  rulingPlanets: string;      // Yönetici Kozmik Güç: "Güneş & Jüpiter"
  colorTheme: {
    primary: string;          // Örn. "#10B981"
    secondary: string;        // Örn. "#D4AF37"
    badgeBg: string;          // Örn. "rgba(16, 185, 129, 0.15)"
  };
  spiritualEssence: string;   // Kelt Druid mitolojik ruhsal özeti
  lightTraits: string[];      // Işık Potansiyeli ve Ruhsal Güçler (4 madde)
  shadowTraits: string[];     // Gölge Taraf ve Yaşam Fırtınası (4 madde)
  natureRitual: {
    grounding: string;        // Shinrin-Yoku / Ağaç Topraklanması (Doğa Yürüyüşü)
    ambientAroma: string;     // Ortam Kokusu (Yalnızca difüzör/buhur - dahili içilmez)
    soulPractice: string;     // Günlük Ruhsal Frekans Yükseltici Alışkanlık
  };
  relationships: {
    resonantTrees: string[];  // Ruhsal Rezonanstaki Uyumlu Ağaçlar
    catalystTrees: string[];  // Zıtlıkla Büyüten / Dönüştürücü Ağaçlar
  };
  druidicProverb: string;     // Kadim Kelt / Druid Bilgelik Sözü
}

export const DRUID_TREES: DruidTree[] = [
  {
    id: 'oak',
    name: 'Meşe Ağacı',
    botanicalName: 'Quercus robur',
    oghamSymbol: 'ᚇ',
    oghamName: 'Duir',
    periods: [
      { startMonth: 3, startDay: 21, endMonth: 3, endDay: 21, label: '21 Mart (İlkbahar Ekinoksu)' }
    ],
    isCardinalStation: true,
    stationLabel: 'İlkbahar Ekinoksu (Ostara)',
    archetype: 'Kozmik Koruyucu & Sarsılmaz Kudret',
    element: 'Ateş & Toprak',
    rulingPlanets: 'Güneş & Jüpiter',
    colorTheme: {
      primary: '#10B981',
      secondary: '#F59E0B',
      badgeBg: 'rgba(16, 185, 129, 0.15)'
    },
    spiritualEssence: 'Druid rahiplerinin en kutsal ağacı olan Meşe (Duir - Keltçe "Kapı"), görünen dünya ile görünmeyen boyutlar arasındaki geçit bekçisidir. Kökleri yerin en derinlerine inerken dalları gök kubbeyi kucaklar. Bu ağacın ruhunu taşıyanlar, fırtınalarda asla kırılmayan, çevresindekilere sığınak olan doğal liderlerdir.',
    lightTraits: [
      'Olağanüstü içsel güç ve yüksek kriz yönetimi kabiliyeti',
      'Doğal koruyuculuk, cömertlik ve sarsılmaz adalet duygusu',
      'Zorluklar karşısında dirayet ve uzun vadeli vizyon kurma yeteneği',
      'Etrafındaki insanlara güven ve emniyet aşılayan bilge karizma'
    ],
    shadowTraits: [
      'Gereğinden fazla katılaşma, esneklik gösterememe ve inatçılık',
      'Tüm yükü tek başına sırtlanarak duygusal yıpranmaya teslim olma',
      'Kırılganlığını zayıflık sayıp kimseye yardım istememe eğilimi',
      'Otoritesini koruma kaygısıyla değişime direnç gösterme'
    ],
    natureRitual: {
      grounding: 'Güneşli bir günde yaşlı bir meşe ağacının sırtına yaslanarak köklerinden toprağa bağlandığınızı imgeleyin. 15 dakika nefesinize odaklanmak omurga hattınızı hizalar.',
      ambientAroma: 'Meşe Yosunu (Oakmoss) ve Sedir uçucu yağı (Yalnızca difüzör veya ortam kokulandırma; mekana derin bir sükunet ve topraklanma titreşimi yayar).',
      soulPractice: 'Zor bir karar anında acele etmeyin; meşe gibi köklenip fırtınanın dinmesini bekleyin ve sonra konuşun.'
    },
    relationships: {
      resonantTrees: ['Huş Ağacı', 'Dişbudak Ağacı', 'Selvi Ağacı'],
      catalystTrees: ['Ağlayan Söğüt Ağacı', 'Ihlamur Ağacı']
    },
    druidicProverb: 'En sert rüzgarlar en derin köklü meşeleri yıpratamaz; yalnızca yapraklarındaki gereksiz yükleri döker.'
  },
  {
    id: 'birch',
    name: 'Huş Ağacı',
    botanicalName: 'Betula pendula',
    oghamSymbol: 'ᚁ',
    oghamName: 'Beith',
    periods: [
      { startMonth: 6, startDay: 24, endMonth: 6, endDay: 24, label: '24 Haziran (Yaz Gündönümü)' }
    ],
    isCardinalStation: true,
    stationLabel: 'Yaz Gündönümü (Litha)',
    archetype: 'Işığın Elçisi & Yeniden Başlangıç',
    element: 'Işık & Su',
    rulingPlanets: 'Güneş & Venüs',
    colorTheme: {
      primary: '#34D399',
      secondary: '#E0E7FF',
      badgeBg: 'rgba(52, 211, 153, 0.15)'
    },
    spiritualEssence: 'Huş (Beith), orman yangınlarından sonra külün içinden ilk yeşeren kutsal ağaçtır. Beyaz kabuğuyla arılığı, masumiyeti ve yeni bir döngünün şafağını simgeler. Druid alfabesi Ogham\'ın ilk harfidir. Bu ağacın insanları geçmişi arkasında bırakıp her yeni güne tazelenmiş bir ruhla uyanma gücüne sahiptir.',
    lightTraits: [
      'Küllerinden doğma ve yenilenme yeteneği, yüksek adaptasyon',
      'Zarif, ilham verici, naif ve temiz niyetli düşünce yapısı',
      'Manevi arınma, yaratıcı sanatsal vizyon ve berrak zihin',
      'Başkalarının karanlığını nezaket ve şefkatle aydınlatma becerisi'
    ],
    shadowTraits: [
      'Aşırı kırılganlık ve dünyanın sert gerçeklerinden kaçma arzusu',
      'Sınır çizmekte zorlanma ve kötü niyetli enerjilere fazla açık olma',
      'Gerçekçilikten uzaklaşıp hayal aleminde kaybolma eğilimi',
      'Yalnız kalmaktan korkarak kendi değerini dış onayda arama'
    ],
    natureRitual: {
      grounding: 'Beyaz gövdeli bir Huş ağacının gölgesinde oturup avuç içlerinizi kabuğuna hafifçe dokundurun. Zihninizdeki eski kederleri ağacın beyaz ışığına teslim edin.',
      ambientAroma: 'Tatlı Huş (Sweet Birch) veya Nane uçucu yağı buhuru (Difüzörde birkaç damla; zihinsel yorgunluğu siler, mekana arındırıcı bir ferahlık katar).',
      soulPractice: 'Her sabah uyanır uyanmaz bir bardak ılık su içip pencereden gökyüzüne bakın ve "Bugün yeniden doğdum" niyetini tekrarlayın.'
    },
    relationships: {
      resonantTrees: ['Meşe Ağacı', 'Kayın Ağacı', 'Elma Ağacı'],
      catalystTrees: ['Ceviz Ağacı', 'Dişbudak Ağacı']
    },
    druidicProverb: 'Karanlık ne kadar uzun sürerse sürsün, Huş ağacı ilk ışık hüzmesini yansıtmak için ormanda hazır bekler.'
  },
  {
    id: 'olive',
    name: 'Zeytin Ağacı',
    botanicalName: 'Olea europaea',
    oghamSymbol: 'ᚑ',
    oghamName: 'Olr',
    periods: [
      { startMonth: 9, startDay: 23, endMonth: 9, endDay: 23, label: '23 Eylül (Sonbahar Ekinoksu)' }
    ],
    isCardinalStation: true,
    stationLabel: 'Sonbahar Ekinoksu (Mabon)',
    archetype: 'Kadim Bilge & Barışın Simyacısı',
    element: 'Toprak & Güneş',
    rulingPlanets: 'Güneş & Jüpiter',
    colorTheme: {
      primary: '#84CC16',
      secondary: '#D4AF37',
      badgeBg: 'rgba(132, 204, 22, 0.15)'
    },
    spiritualEssence: 'Sonbahar ekinoksunun kutsal bekçisi Zeytin, binlerce yıl ayakta kalabilen ölümsüz bilgelik ağacıdır. Gece ile gündüzün eşitlendiği günün temsilcisidir; çatışmaları yatıştıran, adaleti sağlayan ve içsel huzuru hiçbir dünyevi karmaşaya feda etmeyen dingin bir ruhsal merkezdir.',
    lightTraits: [
      'Yüksek sağduyu, dengeli muhakeme ve derin felsefi olgunluk',
      'Çevresindeki çatışmaları barıştıran doğal diplomatik auraya sahip olma',
      'Sessizliğin gücünü bilme ve gereksiz polemiklerden uzak durma',
      'Kendi sınırlarına ve başkalarının alanına saygı duyan asil tevazu'
    ],
    shadowTraits: [
      'Fazla tarafsız kalma kaygısıyla haksızlık karşısında geç tepki verme',
      'Duygusal mesafesini korurken soğuk veya ilgisiz algılanabilme',
      'Kendi huzurunu bozmamak için yüzleşilmesi gereken krizleri erteleme',
      'Mükemmeliyetçi sükunet arayışıyla hayatın coşkusunu bastırma'
    ],
    natureRitual: {
      grounding: 'Zeytin ağacının köklerinin yanına çıplak ayakla basın. Toprağa teşekkür ederek hayatınızdaki kutuplulukları (gece-gündüz, keder-neşe) kalbinizde eşitleyin.',
      ambientAroma: 'Buhur (Frankincense / Akgünlük) ve Bergamot buhuru (Difüzörde yakıldığında zihni dinginleştirir, meditatif odağı ve sükuneti derinleştirir).',
      soulPractice: 'Öfke veya telaş yükseldiğinde 3 saniye durun, göğsünüze dokunun ve "Denge benim özümdür" deyin.'
    },
    relationships: {
      resonantTrees: ['Sedir Ağacı', 'İncir Ağacı', 'Kestane Ağacı'],
      catalystTrees: ['Çam Ağacı', 'Karaağaç']
    },
    druidicProverb: 'Gerçek güç bağırmaz; asırlar boyunca taşların arasından meyve veren zeytin gibi sessizce direnir.'
  },
  {
    id: 'beech',
    name: 'Kayın Ağacı',
    botanicalName: 'Fagus sylvatica',
    oghamSymbol: 'ᚚ',
    oghamName: 'Phagos',
    periods: [
      { startMonth: 12, startDay: 22, endMonth: 12, endDay: 22, label: '22 Aralık (Kış Gündönümü)' }
    ],
    isCardinalStation: true,
    stationLabel: 'Kış Gündönümü (Yule)',
    archetype: 'Kadim Hafıza & Köklenmiş Disiplin',
    element: 'Toprak & Su',
    rulingPlanets: 'Satürn & Merkür',
    colorTheme: {
      primary: '#9CA3AF',
      secondary: '#D4AF37',
      badgeBg: 'rgba(156, 163, 175, 0.15)'
    },
    spiritualEssence: 'Kış gündönümünün en uzun gecesinde uyanık kalan Kayın (Phagos), geçmişin kütüphanesidir. Kadim zamanlarda runelerin ve yazıların ilk kazındığı ağaçtır; kelimelerin ve hafızanın koruyucusudur. Yaşamı sağlam prensipler, metodik bir düzen ve derin bir tarih bilinciyle inşa edenlerin simgesidir.',
    lightTraits: [
      'Üstün organizasyon kabiliyeti, stratejik planlama ve disiplin',
      'Gereksiz detayları eleyip öz bilgiye ve hakikate odaklanma gücü',
      'Sadık, güvenilir ve sözünün eri olan dürüst karakter',
      'Maddi ve manevi kaynakları ustalıkla yönetip geleceği güvenceye alma'
    ],
    shadowTraits: [
      'Aşırı kuralcılık, esneklik eksikliği ve katı kalıplara hapsolma',
      'Hatalara karşı toleranssızlık ve hem kendine hem çevreye aşırı eleştiri',
      'Yeniliklere ve beklenmedik sürprizlere şüpheyle yaklaşma',
      'Duygularını mantık filtresinden geçirmeden ifade etmekte zorlanma'
    ],
    natureRitual: {
      grounding: 'Kayın ağacının pürüzsüz gri kabuğuna alnınızı veya avucunuzu yaslayarak atalarınızın bilgeliğini çağırın. 10 dakika geçmişten gelen yükleri toprağa akıtın.',
      ambientAroma: 'Mür (Myrrh) ve Sandal Ağacı uçucu yağı buhuru (Difüzörde; mekana kutsal bir tapınak sessizliği ve köklü bir odaklanma sağlar).',
      soulPractice: 'Haftada bir gün geçmişinizde sizi üzen bir olayı kağıda yazın ve ardından o kağıdı yırtarak hafızanızı hafifletin.'
    },
    relationships: {
      resonantTrees: ['Meşe Ağacı', 'Selvi Ağacı', 'Huş Ağacı'],
      catalystTrees: ['Akçaağaç', 'Ağlayan Söğüt Ağacı']
    },
    druidicProverb: 'Köklerini geçmişin kayalarına derinlemesine salamayan bir ağaç, kışın ilk fırtınasında ayakta kalamaz.'
  },
  {
    id: 'apple',
    name: 'Elma Ağacı',
    botanicalName: 'Malus domestica',
    oghamSymbol: 'ᚊ',
    oghamName: 'Quert',
    periods: [
      { startMonth: 12, startDay: 23, endMonth: 1, endDay: 1, label: '23 Aralık - 1 Ocak' },
      { startMonth: 6, startDay: 25, endMonth: 7, endDay: 4, label: '25 Haziran - 4 Temmuz' }
    ],
    isCardinalStation: false,
    archetype: 'Kalp Simyacısı & Koşulsuz Sevgi',
    element: 'Su & Toprak',
    rulingPlanets: 'Venüs',
    colorTheme: {
      primary: '#EC4899',
      secondary: '#F59E0B',
      badgeBg: 'rgba(236, 72, 153, 0.15)'
    },
    spiritualEssence: 'Kelt mitolojisinde Avalon (Elmalar Adası), ruhların şifa bulduğu sonsuz gençlik ve sevgi diyarıdır. Elma ağacı (Quert), ikiye bölündüğünde çekirdeklerinin oluşturduğu beş köşeli yıldızla (pentagram) kutsal geometriyi taşır. Bu ağacın ruhu aşka, sanata, sıcaklığa ve insanları birleştiren manyetik bir cazibeye sahiptir.',
    lightTraits: [
      'Girdiği her ortama neşe, sıcaklık ve sevgi frekansı yayma yeteneği',
      'Yüksek empati, insan ilişkilerinde derin bağlar kurma dehası',
      'Güzelliği, estetiği ve hayatın tatlı anlarını takdir etme zarafeti',
      'Cömert, affedici ve koşulsuz şefkat sunabilen açık bir kalp'
    ],
    shadowTraits: [
      'Aşırı safiyet ve manipülatif insanlara karşı savunmasız kalma',
      'Hayır diyememe ve başkalarını mutlu etmek için kendi enerjisini tüketme',
      'Duygusal bağımlılık ve sevgi eksikliği korkusuyla ödün verme',
      'Çatışmadan kaçmak için gerçekleri görmezden gelme hali'
    ],
    natureRitual: {
      grounding: 'Çiçek açmış veya meyve vermiş bir elma ağacının altında kalbinizin üzerine elinizi koyarak 5 dakika derin kalp nefesi alın.',
      ambientAroma: 'Gül ve Palmarosa uçucu yağı buhuru (Difüzörde; kalp çakrasını yumuşatır, eve huzur ve sevgi aurası doldurur).',
      soulPractice: 'Günde en az bir kişiye karşılıksız içten bir teşekkür veya takdir cümlesi söyleyerek sevgi çemberinizi genişletin.'
    },
    relationships: {
      resonantTrees: ['Huş Ağacı', 'Ihlamur Ağacı', 'İncir Ağacı'],
      catalystTrees: ['Ceviz Ağacı', 'Sedir Ağacı']
    },
    druidicProverb: 'Elmanın kalbindeki çekirdek, içinde görünmeyen bir ormanın aşkını taşır.'
  },
  {
    id: 'fir',
    name: 'Köknar Ağacı',
    botanicalName: 'Abies alba',
    oghamSymbol: 'ᚐ',
    oghamName: 'Ailm',
    periods: [
      { startMonth: 1, startDay: 2, endMonth: 1, endDay: 11, label: '2 Ocak - 11 Ocak' },
      { startMonth: 7, startDay: 5, endMonth: 7, endDay: 14, label: '5 Temmuz - 14 Temmuz' }
    ],
    isCardinalStation: false,
    archetype: 'Asil Yalnızlık & Yüksek Zarafet',
    element: 'Hava & Toprak',
    rulingPlanets: 'Satürn & Jüpiter',
    colorTheme: {
      primary: '#059669',
      secondary: '#60A5FA',
      badgeBg: 'rgba(5, 150, 105, 0.15)'
    },
    spiritualEssence: 'Kelt Ogham alfabesinde Ailm (Köknar), ufuk çizgisini ve uzak vizyonları temsil eder. Karlı dağların zirvesinde dimdik duran Köknar, gururlu, asil ve gizemli bir ruhtur. Kalabalıkların gürültüsünden hoşlanmaz; kendi yüksek ideallerinin peşinde yalnız ama ihtişamlı yürümeyi tercih eder.',
    lightTraits: [
      'Sıra dışı asalet, rafine zevkler ve güçlü bir estetik anlayış',
      'Yalnızlıkta güçlenme ve bağımsız düşünebilme kapasitesi',
      'Uzak geleceği sezebilen yüksek perspektif ve stratejik akıl',
      'Sözüne sadık, güvenilir ve baskı altında sakin kalabilen duruş'
    ],
    shadowTraits: [
      'Aşırı mesafeli ve ulaşılamaz görünerek yalnızlığa hapsolma',
      'Kibir ve başkalarının yetersizliklerine tahammülsüzlük geliştirme',
      'Duygularını paylaşmayı zayıflık sayıp içine atarak katılaşma',
      'Kolay kolay kimseyi beğenmeme ve yüksek beklentilerle yıpranma'
    ],
    natureRitual: {
      grounding: 'Yüksek rakımlı bir çam/köknar ormanında ciğerlerinizi temiz reçine kokusuyla doldurarak dik duruş egzersizi yapın.',
      ambientAroma: 'Sibirya Göknarı (Siberian Fir) ve Selvi uçucu yağı buhuru (Difüzörde; zihni berraklaştırır, nefes yollarını açar ve asil bir sükunet verir).',
      soulPractice: 'Haftada bir akşam dijital dünyayı tamamen kapatıp kendi kendinizle derin bir sessizlik randevusu yapın.'
    },
    relationships: {
      resonantTrees: ['Selvi Ağacı', 'Sedir Ağacı', 'Dişbudak Ağacı'],
      catalystTrees: ['Kavak Ağacı', 'Ağlayan Söğüt Ağacı']
    },
    druidicProverb: 'Köknarın tepesi bulutlara değse de, gücü dağın taşını kavrayan sessiz köklerindedir.'
  },
  {
    id: 'elm',
    name: 'Karaağaç',
    botanicalName: 'Ulmus minor',
    oghamSymbol: 'ᚒ',
    oghamName: 'Uilleand',
    periods: [
      { startMonth: 1, startDay: 12, endMonth: 1, endDay: 24, label: '12 Ocak - 24 Ocak' },
      { startMonth: 7, startDay: 15, endMonth: 7, endDay: 25, label: '15 Temmuz - 25 Temmuz' }
    ],
    isCardinalStation: false,
    archetype: 'Asil Vicdan & Güvenilirlik Abidesi',
    element: 'Toprak',
    rulingPlanets: 'Satürn & Merkür',
    colorTheme: {
      primary: '#B45309',
      secondary: '#10B981',
      badgeBg: 'rgba(180, 83, 9, 0.15)'
    },
    spiritualEssence: 'Karaağaç, Druidlerin adalet ve dürüstlük meclislerinin altında toplandığı kutsal ağaçtır. Gösterişten uzak, sade ama devasa bir güven duygusu yayar. Karaağaç insanı, söz verdiğinde bunu hayatı pahasına tutan, toplumun ve ailesinin görünmeyen temel taşıdır.',
    lightTraits: [
      'Yüksek ahlaki bütünlük, dürüstlük ve sözünün eri olma',
      'Pratik zeka, sağlam adımlarla ilerleme ve somut başarılar üretme',
      'Liderlik yaparken mütevazı kalabilme ve ekibini koruma erdemi',
      'Kriz anlarında paniğe kapılmadan çözüm üreten sarsılmaz sükunet'
    ],
    shadowTraits: [
      'Hataları affetmekte zorlanma ve kırıldığında katı bir küskünlük sergileme',
      'Aşırı görev bilinciyle hayatın neşesini ve kendiliğindenliğini unutma',
      'Geleneksel düşünceye fazla yapışıp yenilikçi fikirlere kapalı kalma',
      'Kendine aşırı yüklenme ve bedeninin yorgunluk sinyallerini göz ardı etme'
    ],
    natureRitual: {
      grounding: 'Yaşlı bir karaağacın gövdesine iki elinizi bastırarak omurganızı dikleştirin. "Ben güvenilir bir dayanağım" hissini hücrelerinizde hissedin.',
      ambientAroma: 'Sedir Ağacı ve Paçuli uçucu yağı buhuru (Difüzörde; derin bir topraklanma ve emniyet hissi yaratır).',
      soulPractice: 'Göreviniz olmayan ancak başkalarının rahatı için sırtlandığınız bir sorumluluğu kibarca sahibine devredin.'
    },
    relationships: {
      resonantTrees: ['Kestane Ağacı', 'Gürgen Ağacı', 'Meşe Ağacı'],
      catalystTrees: ['Fındık Ağacı', 'Akçaağaç']
    },
    druidicProverb: 'Büyük gölgeli karaağaç, fırtınada yalnız kendi yapraklarını değil, altındaki tüm canlıları da saklar.'
  },
  {
    id: 'cypress',
    name: 'Selvi Ağacı',
    botanicalName: 'Cupressus sempervirens',
    oghamSymbol: 'ᚓ',
    oghamName: 'Eadha',
    periods: [
      { startMonth: 1, startDay: 25, endMonth: 2, endDay: 3, label: '25 Ocak - 3 Şubat' },
      { startMonth: 7, startDay: 26, endMonth: 8, endDay: 4, label: '26 Temmuz - 4 Ağustos' }
    ],
    isCardinalStation: false,
    archetype: 'Sadakat Savaşçısı & Özgür Ruh',
    element: 'Toprak & Ateş',
    rulingPlanets: 'Satürn',
    colorTheme: {
      primary: '#047857',
      secondary: '#94A3B8',
      badgeBg: 'rgba(4, 120, 87, 0.15)'
    },
    spiritualEssence: 'Göğe doğru bir mızrak gibi yükselen Selvi, zamansızlığın ve sadakatin simgesidir. Ne kışın soğuğu rengini soldurabilir ne de yazın sıcağı duruşunu bozabilir. Selvi ruhu, bağımsızlığına düşkündür ancak kalpten bağlandığı bir davaya veya insana sonsuz bir vefa ile bağlanır.',
    lightTraits: [
      'Gözü pek metanet, baskı altında bükülmeyen dik karakter',
      'Yalan söylemeyen, dürüst ve derin bir sadakat kapasitesi',
      'Maddi dünyadan ziyade manevi özgürlüğe ve ideallere değer verme',
      'Zor zamanlardan güçlenerek çıkan felsefi olgunluk ve dayanıklılık'
    ],
    shadowTraits: [
      'Yalnızlığa aşırı meyletme ve toplumsal bağlardan kopma riski',
      'Ölüm, kayıp veya melankoli temalarına fazla kapılma eğilimi',
      'Uyuşmazlık durumlarında uzlaşmaz ve inatçı bir tavır takınma',
      'Hayatın hafif ve şakacı taraflarını küçümseme refleksi'
    ],
    natureRitual: {
      grounding: 'Bir selvi ağacının yanında dik durarak başınızın tepesinden gökyüzüne, ayak tabanlarınızdan toprağa uzanan ekseni hissedin.',
      ambientAroma: 'Selvi (Cypress) ve Ardıç uçucu yağı buhuru (Difüzörde; zihni yas ve keder yüklerinden arındırır, netlik ve cesaret verir).',
      soulPractice: 'Geçmişte kaybettiğiniz veya biten bir döneme zihninizde teşekkür edin ve onu serbest bırakın.'
    },
    relationships: {
      resonantTrees: ['Köknar Ağacı', 'Sedir Ağacı', 'Meşe Ağacı'],
      catalystTrees: ['Elma Ağacı', 'İncir Ağacı']
    },
    druidicProverb: 'Selvi rüzgarla eğilir ama asla yere kapaklanmaz; çünkü gözü daima göğün en yüksek yıldızındadır.'
  },
  {
    id: 'poplar',
    name: 'Kavak Ağacı',
    botanicalName: 'Populus tremula',
    oghamSymbol: 'ᚕ',
    oghamName: 'Eadha',
    periods: [
      { startMonth: 2, startDay: 4, endMonth: 2, endDay: 8, label: '4 Şubat - 8 Şubat' },
      { startMonth: 5, startDay: 1, endMonth: 5, endDay: 14, label: '1 Mayıs - 14 Mayıs' },
      { startMonth: 8, startDay: 5, endMonth: 8, endDay: 13, label: '5 Ağustos - 13 Ağustos' }
    ],
    isCardinalStation: false,
    archetype: 'Rüzgarın Fısıltısı & Hassas Sezgi',
    element: 'Su & Hava',
    rulingPlanets: 'Ay & Merkür',
    colorTheme: {
      primary: '#06B6D4',
      secondary: '#A78BFA',
      badgeBg: 'rgba(6, 182, 212, 0.15)'
    },
    spiritualEssence: 'Kelt ozanlarının ağacı Kavak (Titrek Kavak), en hafif esintide bile fısıldayan yapraklarıyla bilinir. Bu fısıltılar, görünmeyen dünyaların haberlerini taşır. Kavak insanı derin bir içsel sezgiye, yüksek hassasiyete ve felsefi bir sorgulama gücüne sahiptir.',
    lightTraits: [
      'İnanılmaz keskin sezgiler, insanların iç yüzünü anında okuyabilme',
      'Sanatsal duyarlılık, edebiyat ve estetik alanlarda özgün vizyon',
      'Zihinsel esneklik ve olaylara çok boyutlu felsefi bakabilme',
      'Adaletsizliğe karşı duyarlı, ezilenlerin yanında yer alan vicdan'
    ],
    shadowTraits: [
      'Aşırı kararsızlık, sürekli şüphe ve içsel güvensizlik gelgitleri',
      'Ruh halinin çabuk dalgalanması ve dış enerjilerden hemen etkilenme',
      'Gelecek kaygısı ve yalnız kalma korkusunun felç edici hale gelmesi',
      'Kendi yeteneklerini küçümseyip geri planda kalma eğilimi'
    ],
    natureRitual: {
      grounding: 'Rüzgarlı bir günde bir kavak ağacının altında gözlerinizi kapatıp yaprakların hışırtısını 10 dakika bir meditasyon zili gibi dinleyin.',
      ambientAroma: 'Lavanta ve Limon Otu (Lemongrass) uçucu yağı buhuru (Difüzörde; dalgalanan zihni yatıştırır, endişeyi dağıtır).',
      soulPractice: 'Kararsız kaldığınızda yazı tura atmak yerine derin bir nefes alıp ilk aklınıza gelen iç sesinize güvenin.'
    },
    relationships: {
      resonantTrees: ['Ağlayan Söğüt Ağacı', 'Ihlamur Ağacı', 'Üvez Ağacı'],
      catalystTrees: ['Sedir Ağacı', 'Kayın Ağacı']
    },
    druidicProverb: 'Rüzgar estiğinde kavak yaprağı titrer ama kırılmaz; zira esnek olan şey sert olandan daha uzun yaşar.'
  },
  {
    id: 'cedar',
    name: 'Sedir Ağacı',
    botanicalName: 'Cedrus libani',
    oghamSymbol: 'ᚔ',
    oghamName: 'Iphin',
    periods: [
      { startMonth: 2, startDay: 9, endMonth: 2, endDay: 18, label: '9 Şubat - 18 Şubat' },
      { startMonth: 8, startDay: 14, endMonth: 8, endDay: 23, label: '14 Ağustos - 23 Ağustos' }
    ],
    isCardinalStation: false,
    archetype: 'Görkemli Güven & Doğuştan Lider',
    element: 'Ateş & Güneş',
    rulingPlanets: 'Jüpiter & Güneş',
    colorTheme: {
      primary: '#D97706',
      secondary: '#F59E0B',
      badgeBg: 'rgba(217, 119, 6, 0.15)'
    },
    spiritualEssence: 'Sedir, antik çağlardan beri tapınakların ve kutsal sandıkların yapımında kullanılan kralların ağacıdır. Çürümeye meydan okuyan reçinesi ve heybetli tacıyla özgüvenin, cömertliğin ve karizmanın timsalidir. Sedir ruhu, bulunduğu mekana anında hakim olan ve insanlara ilham veren bir liderdir.',
    lightTraits: [
      'Doğuştan gelen asil özgüven ve yüksek vizyoner hedefler',
      'Hızlı karar alma ve kriz anlarında sorumluluğu üstlenme cesareti',
      'Çevresindekileri yücelten, cömert ve koruyucu patronaj ruhu',
      'Estetik, kalite ve yaşamın lüks güzelliklerine değer veren rafine zevk'
    ],
    shadowTraits: [
      'Sabırsızlık ve başkalarının yavaşlığına karşı öfke duyma',
      'Kibri tetikleyen eleştiriye tahammülsüzlük ve haklı çıkma takıntısı',
      'Bazen riskleri küçümseyerek pervasızca büyük hamleler yapma',
      'Duygusal derinlik yerine dış prestije fazla odaklanma riski'
    ],
    natureRitual: {
      grounding: 'Bir sedir ağacının geniş gölgesinde dik oturun ve solar pleksus (mide) merkezinizden sarı bir güneş ışığının yayıldığını imgeleyin.',
      ambientAroma: 'Sedir Ağacı (Atlas Cedarwood) ve Portakal uçucu yağı buhuru (Difüzörde; odaklanmayı güçlendirir, cesaret ve lüks bir sükunet aşılar).',
      soulPractice: 'Günde bir kez ekibinizden veya ailenizden birinin başarısını kendi başarınızın önüne koyarak onu övün.'
    },
    relationships: {
      resonantTrees: ['Meşe Ağacı', 'Zeytin Ağacı', 'Çam Ağacı'],
      catalystTrees: ['Kavak Ağacı', 'Elma Ağacı']
    },
    druidicProverb: 'Sedir ağacı göğe doğru yükselirken gölgesini esirgemez; gerçek büyüklük paylaştıkça artandır.'
  },
  {
    id: 'pine',
    name: 'Çam Ağacı',
    botanicalName: 'Pinus sylvestris',
    oghamSymbol: 'ᚑ',
    oghamName: 'Och',
    periods: [
      { startMonth: 2, startDay: 19, endMonth: 2, endDay: 29, label: '19 Şubat - 28/29 Şubat' },
      { startMonth: 8, startDay: 24, endMonth: 9, endDay: 2, label: '24 Ağustos - 2 Eylül' }
    ],
    isCardinalStation: false,
    archetype: 'Pratik Deha & Hayat Tutkusu',
    element: 'Ateş & Toprak',
    rulingPlanets: 'Mars & Jüpiter',
    colorTheme: {
      primary: '#15803D',
      secondary: '#EAB308',
      badgeBg: 'rgba(21, 128, 61, 0.15)'
    },
    spiritualEssence: 'Çam ağacı, kışın en dondurucu soğuklarında bile zümrüt yeşili iğnelerini koruyan diriliş sembolüdür. Druid ateş ritüellerinde reçineli odunları ışığı harlamak için kullanılırdı. Çam insanı hayatı çok sever; detaycı, çalışkan, pratik ve zorlukların ortasında pratik çözümler üreten canlı bir zekaya sahiptir.',
    lightTraits: [
      'Olağanüstü organizasyon, titizlik ve detayları kusursuz tamamlama',
      'Hayat enerjisi yüksek, çalışkan ve üretken yaşam tarzı',
      'Kendi ayakları üzerinde duran pratik bağımsızlık ve finansal akıl',
      'Konfor alanını güzelleştiren, misafirperver ve samimi doğa'
    ],
    shadowTraits: [
      'Aşırı detaycılık nedeniyle büyük resmi kaçırma ve takıntılı olma',
      'Planları bozulduğunda aşırı kaygı ve kontrolcülük geliştirme',
      'Mükemmeliyetçilikle hem kendini hem sevdiklerini yorma',
      'Duygusal konularda mantığı fazlaca öne sürerek katılaşma'
    ],
    natureRitual: {
      grounding: 'Bir çam ormanında yürüyüş yapın, taze düşmüş bir çam kozalağını elinizde tutarak kutsal Fibonacci spiralini inceleyin.',
      ambientAroma: 'Çam İğnesi (Pine Needle) ve Biberiye uçucu yağı buhuru (Difüzörde; zihinsel yorgunluğu giderir, canlılık ve konsantrasyon verir).',
      soulPractice: 'Her şeyi mükemmel yapmaya çalışmak yerine bazen "%80 yeterince iyi" diyerek işi bitirip dinlenmeye geçin.'
    },
    relationships: {
      resonantTrees: ['Gürgen Ağacı', 'Sedir Ağacı', 'Kestane Ağacı'],
      catalystTrees: ['Ağlayan Söğüt Ağacı', 'Zeytin Ağacı']
    },
    druidicProverb: 'Kışın ortasında yeşil kalabilen çam, gücünü yazın övgülerinden değil, içindeki gizli ateşten alır.'
  },
  {
    id: 'willow',
    name: 'Ağlayan Söğüt Ağacı',
    botanicalName: 'Salix babylonica',
    oghamSymbol: 'ᚄ',
    oghamName: 'Saille',
    periods: [
      { startMonth: 3, startDay: 1, endMonth: 3, endDay: 10, label: '1 Mart - 10 Mart' },
      { startMonth: 9, startDay: 3, endMonth: 9, endDay: 12, label: '3 Eylül - 12 Eylül' }
    ],
    isCardinalStation: false,
    archetype: 'Ayın Ruhu & Şifacı Sezgi',
    element: 'Su',
    rulingPlanets: 'Ay',
    colorTheme: {
      primary: '#0D9488',
      secondary: '#67E8F9',
      badgeBg: 'rgba(13, 148, 136, 0.15)'
    },
    spiritualEssence: 'Söğüt (Saille), Druidlerin Ay ile doğrudan ilişkilendirdiği kutsal su ağacıdır. Kökleri nehir kıyılarında suya kavuşurken, esnek dalları suyun akışıyla dans eder. Gece rüyalarının, sezgilerin ve duygusal şifanın anahtarıdır. Söğüt ruhu son derece derin, empati dolu ve manevi dünyalarla irtibatı güçlü bir varlıktır.',
    lightTraits: [
      'Emsalsiz sezgisel güç, rüyalar ve önseziler yoluyla rehberlik alma',
      'Baskı ve kriz anlarında kırılmadan bükülüp yeniden doğrulabilme',
      'İnsanların acılarını dinleyip sağaltan doğal şifacı aurası',
      'Derin sanatsal, şiirsel ve ruhsal algı kapılarına sahip olma'
    ],
    shadowTraits: [
      'Geçmişe takılı kalma, melankoli ve kurban psikolojisine kayma',
      'Duygusal fırtınalarda mantığı tamamen kaybedip içine kapanma',
      'Pasif agresif tepkiler verme ve kırgınlıkları uzun süre içinde tutma',
      'Dış dünyanın gerçekliğinden kaçarak hayallerde kaybolma riski'
    ],
    natureRitual: {
      grounding: 'Su kenarındaki bir söğüt ağacının dallarının altına girin. Suyun akışına bakarak içinizdeki tüm eski gözyaşlarını akıntıya bırakın.',
      ambientAroma: 'Adaçayı (Clary Sage) ve Papatya uçucu yağı buhuru (Difüzörde; yoğun duygusal dalgalanmaları yatıştırır, sezgisel berraklık sağlar).',
      soulPractice: 'Her dolunay gecesinde bir rüya günlüğü tutun ve hislerinizi sansürlemeden kağıda dökün.'
    },
    relationships: {
      resonantTrees: ['Kavak Ağacı', 'Üvez Ağacı', 'Ihlamur Ağacı'],
      catalystTrees: ['Meşe Ağacı', 'Çam Ağacı']
    },
    druidicProverb: 'Nehre direnen kaya parçalanır; oysa suya eğilen söğüt selin üzerinden gülümseyerek geçer.'
  },
  {
    id: 'linden',
    name: 'Ihlamur Ağacı',
    botanicalName: 'Tilia cordata',
    oghamSymbol: 'ᚂ',
    oghamName: 'Luis',
    periods: [
      { startMonth: 3, startDay: 11, endMonth: 3, endDay: 20, label: '11 Mart - 20 Mart' },
      { startMonth: 9, startDay: 13, endMonth: 9, endDay: 22, label: '13 Eylül - 22 Eylül' }
    ],
    isCardinalStation: false,
    archetype: 'Huzur Elçisi & Fedakar Kalp',
    element: 'Hava & Su',
    rulingPlanets: 'Venüs & Jüpiter',
    colorTheme: {
      primary: '#F59E0B',
      secondary: '#10B981',
      badgeBg: 'rgba(245, 158, 11, 0.15)'
    },
    spiritualEssence: 'Kalp şeklindeki yaprakları ve tatlı kokulu çiçekleriyle Ihlamur, antik köy meydanlarının barış ve uzlaşı ağacıdır. İnsanları sakinleştiren, gerilimleri eriten ve kalpleri birbirine bağlayan şefkatli bir frekansı temsil eder. Ihlamur insanı, kavgasız ve huzurlu bir dünyanın hayalini kuran nazik bir ruhtur.',
    lightTraits: [
      'Olağanüstü nezaket, sıcakkanlılık ve insanları rahatlatan aura',
      'Bencil olmayan cömertlik, fedakarlık ve dostlarına koşulsuz destek',
      'Tartışmaları tatlı dille yatıştıran doğal barış yapıcılık dehası',
      'Hayatın küçük sürprizlerinden ve sıcak bir yuvadan mutluluk duyabilme'
    ],
    shadowTraits: [
      'Sürekli şüphecilik ve huzurunun bozulacağı korkusuyla aşırı kaygı',
      'Kendi ihtiyaçlarını hep erteleyip başkalarına hizmet ederken tükenme',
      'Net sınırlar koyamadığı için istismar edilmeye açık olma',
      'Zorluklarla mücadele etmek yerine tembellik veya kaçışa sığınma'
    ],
    natureRitual: {
      grounding: 'Çiçek açmış bir ıhlamur ağacının gölgesinde oturun. Gözlerinizi kapatıp mis kokusunu ciğerlerinize çekerken omuzlarınızdaki yükleri yere bırakın.',
      ambientAroma: 'Tatlı Portakal ve Ylang Ylang uçucu yağı buhuru (Difüzörde; kalpteki sıkışmayı giderir, neşe ve tatlı bir huzur yayar).',
      soulPractice: 'Bugün sadece kendiniz için hiçbir amaca hizmet etmeyen bir saatlik tembellik veya keyif zamanı ayırın.'
    },
    relationships: {
      resonantTrees: ['Elma Ağacı', 'Ağlayan Söğüt Ağacı', 'Fındık Ağacı'],
      catalystTrees: ['Meşe Ağacı', 'Ceviz Ağacı']
    },
    druidicProverb: 'Ihlamurun tatlı kokusu, en öfkeli kalbin bile zırhını sessizce eritir.'
  },
  {
    id: 'hazel',
    name: 'Fındık Ağacı',
    botanicalName: 'Corylus avellana',
    oghamSymbol: 'ᚉ',
    oghamName: 'Coll',
    periods: [
      { startMonth: 3, startDay: 22, endMonth: 3, endDay: 31, label: '22 Mart - 31 Mart' },
      { startMonth: 9, startDay: 24, endMonth: 10, endDay: 3, label: '24 Eylül - 3 Ekim' }
    ],
    isCardinalStation: false,
    archetype: 'Gizemli Deha & Bilgi Bekçisi',
    element: 'Hava',
    rulingPlanets: 'Merkür',
    colorTheme: {
      primary: '#8B5CF6',
      secondary: '#F59E0B',
      badgeBg: 'rgba(139, 92, 246, 0.15)'
    },
    spiritualEssence: 'Kelt mitolojisinde kutsal Segais Havuzu\'na düşen 9 fındık, bilgeliğin somon balığı tarafından yenir ve evrenin tüm sırları bu ağaçta toplanır. Druid asaları geleneksel olarak fındık dalından yapılırdı. Fındık ruhu, keskin zekası, büyüleyici çekim gücü ve gizli ilimlere olan doğal yatkınlığıyla tanınır.',
    lightTraits: [
      'Çok hızlı çalışan parlak bir analitik ve sezgisel zeka',
      'İnsanları mıknatıs gibi çeken büyüleyici ve sıra dışı karizma',
      'Derin araştırmacı ruh, gizli kalmış hakikatleri ortaya çıkarma tutkusu',
      'Özgün espri yeteneği ve monotonluğu kıran yaratıcı konuşma tarzı'
    ],
    shadowTraits: [
      'Ruh halinin aşırı değişkenliği; bir gün çok sıcakken ertesi gün mesafeli olma',
      'Zekasını insanları manipüle etmek veya iğneleyici eleştirilerde kullanma riski',
      'Sabırsızlık ve derinleşmeden daldan dala atlayarak enerjisini tüketme',
      'Kendi yüksek standartlarına uymayanları küçümseme refleksi'
    ],
    natureRitual: {
      grounding: 'İki adet fındığı avucunuzun içinde çevirerek zihinsel karmaşayı nötrleyin. Derin nefeslerle aklınızdaki sorunun cevabının belirmesine izin verin.',
      ambientAroma: 'Biberiye ve Nane uçucu yağı buhuru (Difüzörde; zihinsel odaklanmayı maksimuma çıkarır, hafızayı canlandırır).',
      soulPractice: 'Zihninizi meşgul eden karmaşık bir konuyu 7 yaşındaki bir çocuğa anlatırmış gibi basitleştirip bir deftere özetleyin.'
    },
    relationships: {
      resonantTrees: ['Üvez Ağacı', 'Akçaağaç', 'Ihlamur Ağacı'],
      catalystTrees: ['Karaağaç', 'Gürgen Ağacı']
    },
    druidicProverb: 'Bilgeliğin kabuğu serttir; ancak fındığı kırmayı bilen kişi evrenin gizli tadına ulaşır.'
  },
  {
    id: 'rowan',
    name: 'Üvez Ağacı',
    botanicalName: 'Sorbus aucuparia',
    oghamSymbol: 'ᚂ',
    oghamName: 'Luis',
    periods: [
      { startMonth: 4, startDay: 1, endMonth: 4, endDay: 10, label: '1 Nisan - 10 Nisan' },
      { startMonth: 10, startDay: 4, endMonth: 10, endDay: 13, label: '4 Ekim - 13 Ekim' }
    ],
    isCardinalStation: false,
    archetype: 'Koruyucu Vizyoner & Işık Savaşçısı',
    element: 'Ateş',
    rulingPlanets: 'Uranüs & Güneş',
    colorTheme: {
      primary: '#EF4444',
      secondary: '#F97316',
      badgeBg: 'rgba(239, 68, 68, 0.15)'
    },
    spiritualEssence: 'Kırmızı meyveleriyle Üvez (Luis), Druidlerin nazar, kem göz ve negatif enerjilere karşı kapı eşiklerine astığı en güçlü koruma ağacıdır. Kelt inancında öte alemlerle irtibat kurarken psişik bir kalkan görevi görür. Üvez insanı son derece hassas, vizyoner, haksızlığa tahammül edemeyen asil bir ruh bekçisidir.',
    lightTraits: [
      'Güçlü psişik koruma aurası, negatif enerjileri anında filtreleme',
      'Yüksek felsefi derinlik ve geleceğe dönük vizyoner fikirler',
      'Zarafetle harmanlanmış bağımsızlık ve haksızlığa karşı cesur duruş',
      'Sevdiklerini koruma içgüdüsü ve fedakar dostluk anlayışı'
    ],
    shadowTraits: [
      'Aşırı hassasiyet nedeniyle dünyanın çirkinliklerinden çabuk yaralanma',
      'Kendi standartlarını başkalarına dayatarak onları kurtarıcı rolüne soyunma',
      'İçsel öfkesini dışa vuramayıp kendini tüketme veya alınganlık geliştirme',
      'Her olumsuzlukta görünmeyen bir komplo veya düşmanlık arama takıntısı'
    ],
    natureRitual: {
      grounding: 'Kırmızı meyveli bir üvez ağacının yanına gidin. Gözlerinizi kapatıp etrafınızı saran parlak kırmızı bir ışık kalkanı imgeleyin.',
      ambientAroma: 'Zencefil ve Günlük (Frankincense) uçucu yağı buhuru (Difüzörde; aurayı psişik kirlilikten arındırır, canlılık ve cesaret aşılar).',
      soulPractice: 'Sizi aşağı çeken toksik bir ortamdan veya sohbetten suçluluk duymadan nazikçe uzaklaşın.'
    },
    relationships: {
      resonantTrees: ['Fındık Ağacı', 'Ağlayan Söğüt Ağacı', 'Akçaağaç'],
      catalystTrees: ['Dişbudak Ağacı', 'Kestane Ağacı']
    },
    druidicProverb: 'Kırmızı meyvesiyle üvez kapıda nöbet tutarken, hiçbir gölge içeriye adım atamaz.'
  },
  {
    id: 'maple',
    name: 'Akçaağaç',
    botanicalName: 'Acer pseudoplatanus',
    oghamSymbol: 'ᚉ',
    oghamName: 'Ceirt',
    periods: [
      { startMonth: 4, startDay: 11, endMonth: 4, endDay: 20, label: '11 Nisan - 20 Nisan' },
      { startMonth: 10, startDay: 14, endMonth: 10, endDay: 23, label: '14 Ekim - 23 Ekim' }
    ],
    isCardinalStation: false,
    archetype: 'Özgün Deha & Bağımsız Ruh',
    element: 'Hava & Ateş',
    rulingPlanets: 'Jüpiter & Merkür',
    colorTheme: {
      primary: '#F97316',
      secondary: '#E11D48',
      badgeBg: 'rgba(249, 115, 22, 0.15)'
    },
    spiritualEssence: 'Sonbaharda kızıla ve altına dönen yapraklarıyla Akçaağaç, sıradanlıktan nefret eden özgün ruhların sembolüdür. Hiç kimseye benzemez; kendi yolunu kendi çizer. Doğuştan meraklı, yaratıcı ve sınırları zorlayan Akçaağaç insanı, yeni fikirlerin, icatların ve dönüştürücü maceraların öncüsüdür.',
    lightTraits: [
      'Sonsuz öğrenme açlığı, parlak yaratıcılık ve özgün fikirler',
      'Geleneksel kalıplara meydan okuyan cesur ve bağımsız karakter',
      'Yüksek özgüven, gurur ve zorluklar karşısında yılmayan enerji',
      'Girdiği her ortama renk katan karizmatik ve ilham verici varlık'
    ],
    shadowTraits: [
      'Aşırı gurur ve başkalarından yardım istemeyi zayıflık sayma',
      'Çabuk sıkılma, başladığı projeleri yarım bırakıp yenisine koşma',
      'Fikirlerini dayatma arzusu ve eleştirildiğinde alıngan tepkiler verme',
      'İlişkilerde fazla talepkar ve tatminsiz olma riski'
    ],
    natureRitual: {
      grounding: 'Renkli bir akçaağaç yaprağını elinize alın, damarlarındaki karmaşık haritayı inceleyerek kendi hayat yolunuzun eşsizliğini kutlayın.',
      ambientAroma: 'Bergamot ve Greyfurt uçucu yağı buhuru (Difüzörde; ilham kanallarını açar, neşe ve tazelik saçar).',
      soulPractice: 'Bugün daha önce hiç denemediğiniz farklı bir yoldan yürüyün veya rutininizi kasten değiştirerek zihninizi şaşırtın.'
    },
    relationships: {
      resonantTrees: ['Fındık Ağacı', 'Üvez Ağacı', 'Dişbudak Ağacı'],
      catalystTrees: ['Kayın Ağacı', 'Karaağaç']
    },
    druidicProverb: 'Akçaağacın yaprağı hiçbir yaprağa benzemez; rüzgar onu koparsa bile yere bir alev gibi iner.'
  },
  {
    id: 'walnut',
    name: 'Ceviz Ağacı',
    botanicalName: 'Juglans regia',
    oghamSymbol: 'ᚅ',
    oghamName: 'Nin',
    periods: [
      { startMonth: 4, startDay: 21, endMonth: 4, endDay: 30, label: '21 Nisan - 30 Nisan' },
      { startMonth: 10, startDay: 24, endMonth: 11, endDay: 11, label: '24 Ekim - 11 Kasım' }
    ],
    isCardinalStation: false,
    archetype: 'Stratejik Karizma & Tutkulu Dönüşüm',
    element: 'Toprak & Ateş',
    rulingPlanets: 'Güneş & Plüton',
    colorTheme: {
      primary: '#78350F',
      secondary: '#D97706',
      badgeBg: 'rgba(120, 53, 15, 0.15)'
    },
    spiritualEssence: 'Sert kabuğunun içinde insan beynine benzeyen meyvesiyle Ceviz, derin stratejinin, korunaklı sırların ve radikal dönüşümlerin ağacıdır. Gölgesinde başka bitki barındırmaz; çünkü enerjisi son derece baskın ve yoğundur. Ceviz insanı çelişkilerle doludur: Aynı anda hem çok tutkulu hem çok soğukkanlı, hem fırtınalı hem sarsılmaz olabilir.',
    lightTraits: [
      'Emsalsiz stratejik zeka, krizleri lehine çevirme dehası',
      'Derin tutku, hedefine kilitlendiğinde dağları deviren kararlılık',
      'Çok güçlü ve etkileyici karizma, doğal bir otorite yayma',
      'Sevdiklerini sert kabuğuyla sonuna kadar koruyan sadakat'
    ],
    shadowTraits: [
      'Aşırı kıskançlık, intikam duygusu ve kin tutma eğilimi',
      'İlişkilerinde kontrolü elden bırakamama ve güvenmekte zorlanma',
      'İç dünyasındaki fırtınaları bastırıp etrafına sert bir zırh örme',
      'Taviz vermez katılıkla karşısındakini duygusal olarak ezme riski'
    ],
    natureRitual: {
      grounding: 'Bir ceviz ağacının yakınında oturup sert bir ceviz kabuğunu iki elinizle sıkın. İçinizdeki dirençleri ve dönüştürmek istediğiniz gölge yönleri düşünün.',
      ambientAroma: 'Vetiver ve Paçuli uçucu yağı buhuru (Difüzörde; yoğun tutkuyu dengeler, topraklanma ve derin sakinlik verir).',
      soulPractice: 'Geçmişte size haksızlık ettiğini düşündüğünüz bir insanı zihninizde serbest bırakarak kin yükünüzü hafifletin.'
    },
    relationships: {
      resonantTrees: ['Dişbudak Ağacı', 'Kestane Ağacı', 'Meşe Ağacı'],
      catalystTrees: ['Huş Ağacı', 'Elma Ağacı']
    },
    druidicProverb: 'Cevizin kabuğu ne kadar sertse, içindeki öz o kadar zengin ve besleyicidir.'
  },
  {
    id: 'chestnut',
    name: 'Kestane Ağacı',
    botanicalName: 'Castanea sativa',
    oghamSymbol: 'ᚉ',
    oghamName: 'Coll',
    periods: [
      { startMonth: 5, startDay: 15, endMonth: 5, endDay: 24, label: '15 Mayıs - 24 Mayıs' },
      { startMonth: 11, startDay: 12, endMonth: 11, endDay: 21, label: '12 Kasım - 21 Kasım' }
    ],
    isCardinalStation: false,
    archetype: 'Adalet Savaşçısı & Dürüst Vicdan',
    element: 'Toprak & Ateş',
    rulingPlanets: 'Jüpiter',
    colorTheme: {
      primary: '#92400E',
      secondary: '#F59E0B',
      badgeBg: 'rgba(146, 64, 14, 0.15)'
    },
    spiritualEssence: 'Dikenli zırhının içinde besleyici ve tatlı meyvesini saklayan Kestane, hakikatin ve adaletin sarsılmaz savunucusudur. Kolay kolay kimseye boyun eğmez; haksızlığa karşı anında sesini yükseltir. Kestane insanı dışarıdan sert veya mesafeli görünebilir ama kabuğunun altında sıcacık, dürüst ve yardımsever bir kalp çarpar.',
    lightTraits: [
      'Gözü pek dürüstlük, haksızlık karşısında dimdik durabilme cesareti',
      'Yüksek adalet duygusu, ezilenlerin yanında yer alan erdem',
      'Pratik organizasyon yeteneği ve ailesini/topluluğunu koruma arzusu',
      'Kendi emeğiyle inşa ettiği hayatta kimseye muhtaç olmama gururu'
    ],
    shadowTraits: [
      'Kendini sürekli savunmada hissetme ve erken saldırıya geçme refleksi',
      'Başkalarının kendisini anlamadığını düşünerek yalnızlığa çekilme',
      'Diplomasi eksikliği ve doğruyu patavatsızca söyleyerek kalp kırma',
      'Yenilgiyi kabul etmekte zorlanıp gereksiz savaşlara enerji harcama'
    ],
    natureRitual: {
      grounding: 'Yaşlı ve heybetli bir kestane ağacının gövdesine sarılın. Dikenli kabuğunuzu yere bırakıp içteki yumuşak şefkati dışarı salıverin.',
      ambientAroma: 'Sedir Ağacı ve Tatlı Portakal uçucu yağı buhuru (Difüzörde; savunma kalkanlarını gevşetir, sıcak bir emniyet hissi verir).',
      soulPractice: 'Bugün bir tartışmada haklı olsanız bile karşınızdakinin gururunu incitmeden konuyu tatlıya bağlayın.'
    },
    relationships: {
      resonantTrees: ['Karaağaç', 'Çam Ağacı', 'Zeytin Ağacı'],
      catalystTrees: ['Üvez Ağacı', 'Ihlamur Ağacı']
    },
    druidicProverb: 'Kestanenin dikeni elini acıtabilir; ancak sabredip kabuğunu açan kışın en bereketli ziyafetine kavuşur.'
  },
  {
    id: 'ash',
    name: 'Dişbudak Ağacı',
    botanicalName: 'Fraxinus excelsior',
    oghamSymbol: 'ᚅ',
    oghamName: 'Nion',
    periods: [
      { startMonth: 5, startDay: 25, endMonth: 6, endDay: 3, label: '25 Mayıs - 3 Haziran' },
      { startMonth: 11, startDay: 22, endMonth: 12, endDay: 1, label: '22 Kasım - 1 Aralık' }
    ],
    isCardinalStation: false,
    archetype: 'Kozmik Vizyoner & Hayat Ağacı Ruhu',
    element: 'Su & Ateş',
    rulingPlanets: 'Neptün & Güneş',
    colorTheme: {
      primary: '#2563EB',
      secondary: '#38BDF8',
      badgeBg: 'rgba(37, 99, 235, 0.15)'
    },
    spiritualEssence: 'Kuzey ve Kelt mitolojisinde tüm evreni birbirine bağlayan kadim Dünya ve Hayat Ağacı (Yggdrasil) bir Dişbudak\'tır (Nion). Kökleri evrenin derinliklerinde, tepesi ise yıldızların katındadır. Dişbudak insanı yüksek ideallerle, geniş vizyonla ve dünyayı değiştirecek ilham verici projelerle yaşar. Küçük hesaplara takılmaz; daima büyük resmi hedefler.',
    lightTraits: [
      'Geniş açılı vizyon, ilham verici hedefler koyma ve insanları sürükleme',
      'Yüksek özgüven, bağımsızlık ve kimseden emir almayan hür irade',
      'Kaderin büyük akışını sezebilme ve krizleri avantaja çevirme zekası',
      'Cömert, dost canlısı ve sevdiklerine geniş ufuklar açan rehberlik'
    ],
    shadowTraits: [
      'Aşırı talepkar olma, çevresindekileri kendi hedeflerine alet etme riski',
      'Eleştiriye tahammülsüzlük ve kendi vizyonunu mutlak doğru sayma',
      'Gündelik sıradan sorumlulukları küçümseyip detaylarda tökezleme',
      'Hırslarına yenik düşüp duygusal bağları ihmal etme eğilimi'
    ],
    natureRitual: {
      grounding: 'Yüksek bir tepedeki dişbudak ağacının yanında durup rüzgara karşı kollarınızı açın. Gökyüzü ile yeryüzü arasında bir köprü olduğunuzu hissedin.',
      ambientAroma: 'Buhur (Frankincense) ve Limon uçucu yağı buhuru (Difüzörde; vizyonu berraklaştırır, büyük amaçlara odaklanmayı kolaylaştırır).',
      soulPractice: 'Büyük hayallerinize giden yolda bugün yapılması gereken en küçük, en sıkıcı pratik adımı tamamlayın.'
    },
    relationships: {
      resonantTrees: ['Meşe Ağacı', 'Akçaağaç', 'Ceviz Ağacı'],
      catalystTrees: ['Huş Ağacı', 'Üvez Ağacı']
    },
    druidicProverb: 'Dişbudak ağacı kökleriyle dünyayı, dallarıyla yıldızları taşır; vizyonu dar olan onun gölgesini anlayamaz.'
  },
  {
    id: 'hornbeam',
    name: 'Gürgen Ağacı',
    botanicalName: 'Carpinus betulus',
    oghamSymbol: 'ᚈ',
    oghamName: 'Tinne',
    periods: [
      { startMonth: 6, startDay: 4, endMonth: 6, endDay: 13, label: '4 Haziran - 13 Haziran' },
      { startMonth: 12, startDay: 2, endMonth: 12, endDay: 11, label: '2 Aralık - 11 Aralık' }
    ],
    isCardinalStation: false,
    archetype: 'Estetik Kusursuzluk & Asil Sadakat',
    element: 'Toprak & Hava',
    rulingPlanets: 'Venüs & Satürn',
    colorTheme: {
      primary: '#0284C7',
      secondary: '#CBD5E1',
      badgeBg: 'rgba(2, 132, 199, 0.15)'
    },
    spiritualEssence: 'Gürgen ağacının odunu o kadar sert ve dayanıklıdır ki ona "demir ağaç" denir. Druid geleneğinde estetik güzellik ile çelik gibi disiplinin mükemmel sentezidir. Gürgen ruhu, hayatında zarafet, düzen, adalet ve kalite arar. Dağınıklığa tahammül edemez; görevlerini kusursuz yerine getiren güven timsalidir.',
    lightTraits: [
      'Kusursuz disiplin, organizasyon dehası ve yüksek estetik beğeni',
      'Görevlerine ve sevdiklerine sarsılmaz bir sadakatle bağlı olma',
      'Dış görünüşüne, zarafetine ve yaşam standardına özen gösterme',
      'Toplumsal düzene katkı sağlayan güvenilir ve saygın karakter'
    ],
    shadowTraits: [
      'Aşırı kuralcılık ve hayatın beklenmedik sürprizlerine tahammülsüzlük',
      'Başkalarının onayına ve toplumsal statüye gereğinden fazla değer verme',
      'Duygularını ifade etmekte tutukluk ve dışarıya mükemmel görünme baskısı',
      'Güvensizlik hissettiğinde aşırı şüpheci ve denetleyici olma'
    ],
    natureRitual: {
      grounding: 'Bir gürgen koruluğunda düzenli adımlarla yürüyün. Ayak basışlarınızın ritmine odaklanarak içinizdeki dengeyi yeniden kurun.',
      ambientAroma: 'Lavanta ve Sedir Ağacı uçucu yağı buhuru (Difüzörde; aşırı çalışan zihni gevşetir, mükemmeliyetçilik kaygısını siler).',
      soulPractice: 'Bugün evinizdeki veya masanızdaki bir eşyayı kasten hafif dağınık bırakın ve bununla barışık kalmayı deneyimleyin.'
    },
    relationships: {
      resonantTrees: ['Çam Ağacı', 'Karaağaç', 'İncir Ağacı'],
      catalystTrees: ['Fındık Ağacı', 'Akçaağaç']
    },
    druidicProverb: 'Demir kadar sert gürgen ağacı, zarafetiyle ormana düzen getirir.'
  },
  {
    id: 'fig',
    name: 'İncir Ağacı',
    botanicalName: 'Ficus carica',
    oghamSymbol: 'ᚓ',
    oghamName: 'Edad',
    periods: [
      { startMonth: 6, startDay: 14, endMonth: 6, endDay: 23, label: '14 Haziran - 23 Haziran' },
      { startMonth: 12, startDay: 12, endMonth: 12, endDay: 21, label: '12 Aralık - 21 Aralık' }
    ],
    isCardinalStation: false,
    archetype: 'Bereket Kaynağı & Şefkatli Kök',
    element: 'Toprak & Su',
    rulingPlanets: 'Jüpiter & Venüs',
    colorTheme: {
      primary: '#7C3AED',
      secondary: '#F59E0B',
      badgeBg: 'rgba(124, 58, 237, 0.15)'
    },
    spiritualEssence: 'Geniş yaprakları ve bal damlatan meyveleriyle İncir, antik dünyadan beri bereketin, ailenin ve cömertliğin sembolüdür. İncir insanı sevdiklerine kol kanat geren, sıcacık bir yuva kuran ve hayatın tüm zorluklarını pratik aklıyla çözen duyarlı bir ruhtur. Bağımsızlığına saygı duyulduğunda sınırsız bir şefkat sunar.',
    lightTraits: [
      'Büyük bir cömertlik, aile ve sevdiklerine koşulsuz destek olma',
      'Pratik yaşam zekası, krizleri pratik çözümlerle atlatabilme',
      'Hassas, sevecen ve çocuklara/hayvanlara karşı derin şefkat besleme',
      'Kendi ayakları üzerinde durabilen üretken ve bereketli karakter'
    ],
    shadowTraits: [
      'Alınganlık ve en ufak bir soğuklukta içine kapanarak küsme',
      'Aşırı korumacı tavırla sevdiklerini boğma ve kontrol etme eğilimi',
      'Zorluklar karşısında zaman zaman tembellik ve melankoliye sığınma',
      'Başkalarının nankörlüğünden fazlaca yaralanıp güvenini yitirme'
    ],
    natureRitual: {
      grounding: 'Geniş yapraklı bir incir ağacının altına oturun, avuçlarınızı gökyüzüne açarak hayatın sunduğu tüm bereketlere şükredin.',
      ambientAroma: 'Tatlı Portakal ve Buhur (Frankincense) uçucu yağı buhuru (Difüzörde; eve bereket, neşe ve sıcak bir sevgi aurası doldurur).',
      soulPractice: 'Sevdiklerinizin kendi hatalarını yapmalarına izin verin; onları koruma kaygınızı güvene dönüştürün.'
    },
    relationships: {
      resonantTrees: ['Elma Ağacı', 'Zeytin Ağacı', 'Gürgen Ağacı'],
      catalystTrees: ['Selvi Ağacı', 'Sedir Ağacı']
    },
    druidicProverb: 'İncirin tatlılığı dışındaki kabukta değil, içindeki binlerce tohumun sessiz birliğindedir.'
  }
];


/**
 * Kadim Kelt 13 Ay (Ogham) Ağaçları Listesi
 * Robert Graves ve antik Ogham alfabesi geleneğine dayanan 13 kutsal ağaç döngüsü.
 */
export const OGHAM_TREES: DruidTree[] = [
  {
    "id": "ogham_birch",
    "name": "Huş Ağacı",
    "botanicalName": "Betula pendula",
    "oghamSymbol": "ᚁ",
    "oghamName": "Beith",
    "periods": [
      {
        "startMonth": 12,
        "startDay": 24,
        "endMonth": 1,
        "endDay": 20,
        "label": "24 Aralık - 20 Ocak (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Işığın Elçisi & Yeniden Başlangıç (Arınma Ruhu)",
    "element": "Işık & Su",
    "rulingPlanets": "Güneş & Venüs",
    "colorTheme": {
      "primary": "#34D399",
      "secondary": "#E0E7FF",
      "badgeBg": "rgba(52, 211, 153, 0.15)"
    },
    "spiritualEssence": "Huş (Beith), antik Ogham alfabesinin ilk harfidir. Kış gündönümünün hemen ertesinde, karanlığın içinden ilk ışığı müjdeleyen beyaz kabuklu arınma ağacıdır. Bu dönemde doğanlar, küllerinden yeniden doğma gücüne, tertemiz bir niyetle hayata sıfırdan başlama iradesine ve etrafındaki insanların karanlığını şefkatle aydınlatma yeteneğine sahiptir.",
    "lightTraits": [
      "Küllerinden doğma ve tazelenme yeteneği, yüksek zihinsel berraklık",
      "Zarif, ilham verici, naif ve temiz niyetli düşünce yapısı",
      "Yaratıcı sanatsal vizyon ve geçmişin yüklerini kolayca bırakabilme",
      "Başkalarının karanlığını nezaket ve şefkatle aydınlatma becerisi"
    ],
    "shadowTraits": [
      "Aşırı kırılganlık ve dünyanın sert gerçeklerinden kaçma arzusu",
      "Sınır çizmekte zorlanma ve kötü niyetli enerjilere fazla açık olma",
      "Gerçekçilikten uzaklaşıp hayal aleminde kaybolma eğilimi",
      "Yalnız kalmaktan korkarak kendi değerini dış onayda arama"
    ],
    "natureRitual": {
      "grounding": "Beyaz gövdeli bir Huş ağacının gölgesinde oturup avuç içlerinizi kabuğuna hafifçe dokundurun. Zihninizdeki eski kederleri ağacın beyaz ışığına teslim edin.",
      "ambientAroma": "Tatlı Huş (Sweet Birch) veya Nane uçucu yağı buhuru (Difüzörde birkaç damla; zihinsel yorgunluğu siler, mekana arındırıcı bir ferahlık katar).",
      "soulPractice": "Her sabah uyanır uyanmaz bir bardak ılık su içip pencereden gökyüzüne bakın ve \"Bugün yeniden doğdum\" niyetini tekrarlayın."
    },
    "relationships": {
      "resonantTrees": [
        "Meşe Ağacı",
        "Dişbudak Ağacı",
        "Alıç Ağacı"
      ],
      "catalystTrees": [
        "Kamış",
        "Asma"
      ]
    },
    "druidicProverb": "Karanlık ne kadar uzun sürerse sürsün, Huş ağacı ilk ışık hüzmesini yansıtmak için ormanda hazır bekler."
  },
  {
    "id": "ogham_rowan",
    "name": "Üvez Ağacı",
    "botanicalName": "Sorbus aucuparia",
    "oghamSymbol": "ᚂ",
    "oghamName": "Luis",
    "periods": [
      {
        "startMonth": 1,
        "startDay": 21,
        "endMonth": 2,
        "endDay": 17,
        "label": "21 Ocak - 17 Şubat (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Psişik Muhafız & Sezgisel Vizyoner (Ruhsal Kalkan)",
    "element": "Ateş & Hava",
    "rulingPlanets": "Uranüs & Merkür",
    "colorTheme": {
      "primary": "#EF4444",
      "secondary": "#FCA5A5",
      "badgeBg": "rgba(239, 68, 68, 0.15)"
    },
    "spiritualEssence": "Kelt mitolojisinde Üvez (Luis - \"Fısıltı\"), kötü enerjileri kovan ve psişik farkındalığı uyandıran koruyucu sihir ağacıdır. Kırmızı meyveleriyle kış ortasında yaşam ateşini diri tutar. Üvez insanları yüksek hayal gücüne, güçlü altıncı hisse ve bağımsız bir düşünce yapısına sahiptir. Kendi ilkelerine sadık, sürü psikolojisine asla uymayan özgün ruhlardır.",
    "lightTraits": [
      "Geleceği sezen güçlü altıncı his ve yüksek vizyoner ilham",
      "Negatif enerjilere ve manipülasyona karşı doğal psişik koruma",
      "Özgün, sıra dışı, bağımsız ve derin felsefi düşünce kabiliyeti",
      "Haksızlıklara karşı sessiz kalmayan ilkeli ve dürüst adalet duygusu"
    ],
    "shadowTraits": [
      "Zihinsel aşırı uyarılma, huzursuzluk ve uyku problemleri",
      "İnsanların kendisini anlamadığını düşünerek kibirli bir yalnızlığa çekilme",
      "Aşırı idealizm sebebiyle pratik dünyayı küçümseme ve gerilme",
      "Duygusal mesafesini korurken sevdiklerine soğuk algılanma riski"
    ],
    "natureRitual": {
      "grounding": "Bir üvez ağacının yanında durarak derin nefes alın. Kırmızı meyvelerin ateşini kalbinizde canlandırarak auranızın parladığını imgeleyin.",
      "ambientAroma": "Biberiye ve Sedir Ağacı uçucu yağı buhuru (Difüzörde; psişik enerjiyi dengeler, mekanı negatif tesirlerden arındırır).",
      "soulPractice": "Haftada bir gün sosyal medyadan ve ekrandan 2 saat uzaklaşıp yalnızca sezgisel ilhamlarınıza kulak verin."
    },
    "relationships": {
      "resonantTrees": [
        "Huş Ağacı",
        "Dişbudak Ağacı",
        "Sarmaşık"
      ],
      "catalystTrees": [
        "Kızılağaç",
        "Mürver Ağacı"
      ]
    },
    "druidicProverb": "Üvez ağacının meyvesi kar üstünde parlar; gerçeği gören göz kalabalığın gürültüsüne aldanmaz."
  },
  {
    "id": "ogham_ash",
    "name": "Dişbudak Ağacı",
    "botanicalName": "Fraxinus excelsior",
    "oghamSymbol": "ᚅ",
    "oghamName": "Nion",
    "periods": [
      {
        "startMonth": 2,
        "startDay": 18,
        "endMonth": 3,
        "endDay": 17,
        "label": "18 Şubat - 17 Mart (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Kozmik Vizyoner & Hayat Ağacı Ruhu (Evrensel Bağlantı)",
    "element": "Su & Ateş",
    "rulingPlanets": "Neptün & Güneş",
    "colorTheme": {
      "primary": "#2563EB",
      "secondary": "#38BDF8",
      "badgeBg": "rgba(37, 99, 235, 0.15)"
    },
    "spiritualEssence": "Kuzey ve Kelt mitolojisinde tüm evreni birbirine bağlayan kadim Dünya ve Hayat Ağacı (Yggdrasil) bir Dişbudak'tır (Nion). Kökleri derin sulara, dalları ise yıldızların katına uzanır. Dişbudak insanı yüksek ideallerle, geniş vizyonla ve dünyayı değiştirecek ilham verici projelerle yaşar. Küçük dünyevi hesaplara takılmaz; daima büyük resmi hedefler.",
    "lightTraits": [
      "Geniş açılı vizyon, ilham verici hedefler koyma ve insanları sürükleme",
      "Yüksek özgüven, bağımsızlık ve kimseden emir almayan hür irade",
      "Kaderin büyük akışını sezebilme ve krizleri avantaja çevirme zekası",
      "Cömert, dost canlısı ve sevdiklerine geniş ufuklar açan rehberlik"
    ],
    "shadowTraits": [
      "Aşırı talepkar olma, çevresindekileri kendi hedeflerine alet etme riski",
      "Eleştiriye tahammülsüzlük ve kendi vizyonunu mutlak doğru sayma",
      "Gündelik sıradan sorumlulukları küçümseyip detaylarda tökezleme",
      "Hırslarına yenik düşüp duygusal bağları ihmal etme eğilimi"
    ],
    "natureRitual": {
      "grounding": "Yüksek bir tepedeki dişbudak ağacının yanında durup rüzgara karşı kollarınızı açın. Gökyüzü ile yeryüzü arasında bir köprü olduğunuzu hissedin.",
      "ambientAroma": "Buhur (Frankincense / Akgünlük) ve Limon uçucu yağı buhuru (Difüzörde; vizyonu berraklaştırır, büyük amaçlara odaklanmayı kolaylaştırır).",
      "soulPractice": "Büyük hayallerinize giden yolda bugün yapılması gereken en küçük, en sıkıcı pratik adımı tamamlayın."
    },
    "relationships": {
      "resonantTrees": [
        "Meşe Ağacı",
        "Kızılağaç",
        "Sarmaşık"
      ],
      "catalystTrees": [
        "Söğüt Ağacı",
        "Kamış"
      ]
    },
    "druidicProverb": "Dişbudak ağacı kökleriyle dünyayı, dallarıyla yıldızları taşır; vizyonu dar olan onun gölgesini anlayamaz."
  },
  {
    "id": "ogham_alder",
    "name": "Kızılağaç",
    "botanicalName": "Alnus glutinosa",
    "oghamSymbol": "ᚃ",
    "oghamName": "Fearn",
    "periods": [
      {
        "startMonth": 3,
        "startDay": 18,
        "endMonth": 4,
        "endDay": 14,
        "label": "18 Mart - 14 Nisan (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Manevi Muhafız & Cesur Öncü (Ruhsal Kalkan)",
    "element": "Ateş & Su",
    "rulingPlanets": "Mars & Güneş",
    "colorTheme": {
      "primary": "#DC2626",
      "secondary": "#F87171",
      "badgeBg": "rgba(220, 38, 38, 0.15)"
    },
    "spiritualEssence": "Kızılağaç (Fearn), suyun altında kaldıkça çürümek yerine taşlaşarak sertleşen olağanüstü bir direnç ağacıdır. Kelt savaşçılarının kutsal kalkanları kızılağaçtan yontulurdu; çünkü bu ağaç hem fiziksel darbeleri hem de manevi negatif enerjileri geri püskürtür. Bu ağacın insanları, zorluklar ve baskılar altında dağılmaz; aksine kriz anlarında sarsılmaz bir cesaret ve liderlik sergiler.",
    "lightTraits": [
      "Baskı ve kriz anlarında sarsılmaz cesaret ve dirayet",
      "Sevdiklerini ve hakikatini koruma konusunda yüksek koruyuculuk",
      "Harekete geçme cesareti, öncülük ve pratik çözüm üretme dehası",
      "Duygusal derinlikle fiziksel gücü harmanlayan asil duruş"
    ],
    "shadowTraits": [
      "Gereksiz yere kavgacı veya savunmacı bir tutuma bürünme",
      "Kendi sınırlarını korurken başkalarının alanına sert müdahale etme",
      "Sabırsızlık ve diplomasi yerine doğrudan güç kullanma eğilimi",
      "Yaralanmaktan korktuğu için duygularını kalın bir kabuk arkasına saklama"
    ],
    "natureRitual": {
      "grounding": "Bir nehir veya su kenarındaki kızılağacın yanında durun. Ayaklarınızı nemli toprağa basarak içinizdeki öfkeyi ve telaşı suyun akışına teslim edin.",
      "ambientAroma": "Sedir ve Biberiye uçucu yağı buhuru (Yalnızca difüzör; zihni uyarır, cesaret ve odaklanma aşılar).",
      "soulPractice": "Bugün ertelediğiniz ve yüzleşmekten çekindiğiniz tek bir zorlu konuşmayı nezaketle ama kararlılıkla yapın."
    },
    "relationships": {
      "resonantTrees": [
        "Meşe Ağacı",
        "Dişbudak Ağacı",
        "Alıç Ağacı"
      ],
      "catalystTrees": [
        "Söğüt Ağacı",
        "Fındık Ağacı"
      ]
    },
    "druidicProverb": "Kızılağaç suyun içinde çürümez; asil ruh fırtınalarda eğilse de köklerinden kopmaz."
  },
  {
    "id": "ogham_willow",
    "name": "Söğüt Ağacı",
    "botanicalName": "Salix alba",
    "oghamSymbol": "ᚄ",
    "oghamName": "Saille",
    "periods": [
      {
        "startMonth": 4,
        "startDay": 15,
        "endMonth": 5,
        "endDay": 12,
        "label": "15 Nisan - 12 Mayıs (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Ay Büyücüsü & Bilinçaltı Şifacısı (Duygusal Bilgelik)",
    "element": "Su & Ruh",
    "rulingPlanets": "Ay & Neptün",
    "colorTheme": {
      "primary": "#06B6D4",
      "secondary": "#A5F3FC",
      "badgeBg": "rgba(6, 182, 212, 0.15)"
    },
    "spiritualEssence": "Söğüt (Saille), Ay'ın evreleriyle ve suların gelgitleriyle nefes alan kutsal Druid şifa ağacıdır. Nehir kenarlarında eğilen zarif dalları esnekliği, fırtınaya direnmek yerine onunla akmayı simgeler. Söğüt insanları olağanüstü sezgilere, güçlü rüya hafızasına ve insanların acılarını bir dokunuşla dindiren derin bir şefkate sahiptir.",
    "lightTraits": [
      "Gelişmiş psişik sezgiler, durugörü ve bilinçaltını okuma gücü",
      "Fırtınalarda kırılmayan, esnek ve akışa güvenen adaptasyon",
      "Derin empati, merhamet ve çevresine huzur veren dingin aura",
      "Sanatsal ilham, şiirsel zeka ve duyguları dönüştürme ustalığı"
    ],
    "shadowTraits": [
      "Aşırı duygusallık, melankoliye ve kurban psikolojisine kapılma",
      "Kendi sınırlarını koruyamayıp başkalarının dertleriyle tükenme",
      "Ruh halinin Ay döngüsü gibi aşırı iniş çıkışlar göstermesi",
      "Gerçeklerden kaçarak pasif-agresif davranışlar sergileme"
    ],
    "natureRitual": {
      "grounding": "Dolunay veya hilal gecesinde su kenarındaki bir söğüt ağacının dallarına dokunun. Zihninizdeki tüm kaygıları suya bıraktığınızı imgeleyin.",
      "ambientAroma": "Papatya ve Lavanta buhuru (Difüzörde; duygusal gerginliği çözer, derin ve huzurlu bir uyku verir).",
      "soulPractice": "Her sabah uyandığınızda gördüğünüz rüyaları not alın ve bilinçaltınızın size fısıldadığı mesajları dinleyin."
    },
    "relationships": {
      "resonantTrees": [
        "Fındık Ağacı",
        "Asma",
        "Huş Ağacı"
      ],
      "catalystTrees": [
        "Kızılağaç",
        "Meşe Ağacı"
      ]
    },
    "druidicProverb": "Söğüt rüzgara karşı direnmez, onunla dans eder; en güçlü olan değil, en esnek olan hayatta kalır."
  },
  {
    "id": "ogham_hawthorn",
    "name": "Alıç Ağacı",
    "botanicalName": "Crataegus monogyna",
    "oghamSymbol": "ᚆ",
    "oghamName": "Huath",
    "periods": [
      {
        "startMonth": 5,
        "startDay": 13,
        "endMonth": 6,
        "endDay": 9,
        "label": "13 Mayıs - 9 Haziran (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Kalp Kapısının Bekçisi & Sezgisel Sınır (İçsel Simyacı)",
    "element": "Hava & Ateş",
    "rulingPlanets": "Venüs & Mars",
    "colorTheme": {
      "primary": "#EC4899",
      "secondary": "#F472B6",
      "badgeBg": "rgba(236, 72, 153, 0.15)"
    },
    "spiritualEssence": "Alıç (Huath), Kelt mitolojisinde doğaüstü boyutlarla dünya arasındaki sınır çizgisidir. Dikenleriyle sınır koymayı, bembeyaz ve pembe çiçekleriyle ise koşulsuz sevginin kapısını korumayı öğretir. Alıç insanları dışarıdan gizemli veya mesafeli görünebilir; ancak derinlerinde tutkulu, yaratıcı ve kalbinin ritmini hisseden bir simyacı taşırlar.",
    "lightTraits": [
      "Sağlıklı sınırlar çizme ve kendi enerjisini koruma ustalığı",
      "Derin empati, kalbin bilgeliğini duyma ve incelikli zarafet",
      "Yüksek yaratıcılık, merak ve sıra dışı problemlere özgün çözümler",
      "İnsanların gerçek niyetlerini sezebilen keskin içgörü"
    ],
    "shadowTraits": [
      "Aşırı ketum olma ve insanlara güvenmekte zorlanma",
      "Dikenlerini gereğinden fazla dışarı çıkarıp sevdiklerini incitme riski",
      "İçsel çelişkileri dışarıya öfke veya alaycılık olarak yansıtma",
      "Duygusal iniş çıkışlarda kendini tamamen kabuğuna çekme"
    ],
    "natureRitual": {
      "grounding": "Çiçek açmış bir alıç ağacının yanına yaklaşın. Derin bir nefes alıp kalbinizin üzerine elinizi koyun ve \"Sınırlarım benim kutsal alanımdır\" deyin.",
      "ambientAroma": "Gül ve Bergamot uçucu yağı buhuru (Difüzörde; kalp merkezini yumuşatır, güven ve huzur yayar).",
      "soulPractice": "Bugün başkalarını memnun etmek için istemediğiniz bir şeye \"evet\" demek yerine, nezaketle \"hayır\" deyin."
    },
    "relationships": {
      "resonantTrees": [
        "Huş Ağacı",
        "Kızılağaç",
        "Sarmaşık"
      ],
      "catalystTrees": [
        "Çobanpüskülü",
        "Meşe Ağacı"
      ]
    },
    "druidicProverb": "Alıç ağacı dikenleriyle kalbini korur, çiçekleriyle dünyayı büyüler; gerçek güç sınırlarını bilmektir."
  },
  {
    "id": "ogham_oak",
    "name": "Meşe Ağacı",
    "botanicalName": "Quercus robur",
    "oghamSymbol": "ᚇ",
    "oghamName": "Duir",
    "periods": [
      {
        "startMonth": 6,
        "startDay": 10,
        "endMonth": 7,
        "endDay": 7,
        "label": "10 Haziran - 7 Temmuz (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Kozmik Koruyucu & Sarsılmaz Kudret (Kapı Bekçisi)",
    "element": "Ateş & Toprak",
    "rulingPlanets": "Güneş & Jüpiter",
    "colorTheme": {
      "primary": "#10B981",
      "secondary": "#F59E0B",
      "badgeBg": "rgba(16, 185, 129, 0.15)"
    },
    "spiritualEssence": "Druid rahiplerinin en kutsal ağacı olan Meşe (Duir - Keltçe \"Kapı\"), görünen dünya ile görünmeyen boyutlar arasındaki geçit bekçisidir. Kökleri yerin en derinlerine inerken dalları gök kubbeyi kucaklar. Bu ağacın ruhunu taşıyanlar, fırtınalarda asla kırılmayan, çevresindekilere sığınak olan doğal liderlerdir.",
    "lightTraits": [
      "Olağanüstü içsel güç ve yüksek kriz yönetimi kabiliyeti",
      "Doğal koruyuculuk, cömertlik ve sarsılmaz adalet duygusu",
      "Zorluklar karşısında dirayet ve uzun vadeli vizyon kurma yeteneği",
      "Etrafındaki insanlara güven ve emniyet aşılayan bilge karizma"
    ],
    "shadowTraits": [
      "Gereğinden fazla katılaşma, esneklik gösterememe ve inatçılık",
      "Tüm yükü tek başına sırtlanarak duygusal yıpranmaya teslim olma",
      "Kırılganlığını zayıflık sayıp kimseye yardım istememe eğilimi",
      "Otoritesini koruma kaygısıyla değişime direnç gösterme"
    ],
    "natureRitual": {
      "grounding": "Güneşli bir günde yaşlı bir meşe ağacının sırtına yaslanarak köklerinden toprağa bağlandığınızı imgeleyin. 15 dakika nefesinize odaklanmak omurga hattınızı hizalar.",
      "ambientAroma": "Meşe Yosunu ve Sedir uçucu yağı buhuru (Difüzörde; mekana derin bir sükunet ve topraklanma titreşimi yayar).",
      "soulPractice": "Zor bir karar anında acele etmeyin; meşe gibi köklenip fırtınanın dinmesini bekleyin ve sonra konuşun."
    },
    "relationships": {
      "resonantTrees": [
        "Huş Ağacı",
        "Dişbudak Ağacı",
        "Çobanpüskülü"
      ],
      "catalystTrees": [
        "Söğüt Ağacı",
        "Fındık Ağacı"
      ]
    },
    "druidicProverb": "En sert rüzgarlar en derin köklü meşeleri yıpratamaz; yalnızca yapraklarındaki gereksiz yükleri döker."
  },
  {
    "id": "ogham_holly",
    "name": "Çobanpüskülü",
    "botanicalName": "Ilex aquifolium",
    "oghamSymbol": "ᚈ",
    "oghamName": "Tinne",
    "periods": [
      {
        "startMonth": 7,
        "startDay": 8,
        "endMonth": 8,
        "endDay": 4,
        "label": "8 Temmuz - 4 Ağustos (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Işığın Asil Şövalyesi & Sarsılmaz Lider (Karakter Gücü)",
    "element": "Ateş & Toprak",
    "rulingPlanets": "Mars & Güneş",
    "colorTheme": {
      "primary": "#059669",
      "secondary": "#EF4444",
      "badgeBg": "rgba(5, 150, 105, 0.15)"
    },
    "spiritualEssence": "Kelt efsanelerinde Çobanpüskülü Kralı (Tinne), yılın karanlık yarısını Meşe Kralı ile nöbetleşe yöneten kudretli orman bekçisidir. Kışın en çetin soğuklarında bile yapraklarını dökmeyen, kırmızı meyveleriyle yaşama meydan okuyan asalet simgesidir. Tinne insanları yüksek özsaygı, liderlik adaleti ve sözünün eri olma erdemiyle tanınır.",
    "lightTraits": [
      "Doğuştan gelen asil liderlik ve kriz anlarında sorumluluk alma",
      "Zorluklar karşısında asla pes etmeyen yüksek dayanıklılık",
      "Cömertlik, sadakat ve etrafındakilere kol kanat germe",
      "Yüksek hedefler koyup adım adım sonuca ulaştıran kararlılık"
    ],
    "shadowTraits": [
      "Aşırı gurur, kibir ve yardım kabul etmekte zorlanma",
      "Başkalarının eksikliklerine karşı sabırsız ve talepkar olma",
      "Rekabeti kişiselleştirip başarısızlığa tahammül edememe",
      "Duygusal hassasiyetlerini gizlemek için fazla otoriter görünme"
    ],
    "natureRitual": {
      "grounding": "Yaprak dökmeyen yaşlı bir çobanpüskülü veya meşe ağacının önünde dik durun. Omurganızın bir aslan gibi dikleştiğini hissedin.",
      "ambientAroma": "Çam İğnesi ve Sedir Ağacı uçucu yağı buhuru (Difüzörde; mekana asil bir güç, ferahlık ve odaklanma katar).",
      "soulPractice": "Bugün başarınızı tek başınıza sahiplenmek yerine, arkasındaki ekibinize veya ailenize teşekkür ederek onları yüceltin."
    },
    "relationships": {
      "resonantTrees": [
        "Meşe Ağacı",
        "Dişbudak Ağacı",
        "Mürver Ağacı"
      ],
      "catalystTrees": [
        "Alıç Ağacı",
        "Söğüt Ağacı"
      ]
    },
    "druidicProverb": "Çobanpüskülü kar altında yeşil kalır; asil karakter kriz anında kim olduğunu gösterir."
  },
  {
    "id": "ogham_hazel",
    "name": "Fındık Ağacı",
    "botanicalName": "Corylus avellana",
    "oghamSymbol": "ᚉ",
    "oghamName": "Coll",
    "periods": [
      {
        "startMonth": 8,
        "startDay": 5,
        "endMonth": 9,
        "endDay": 1,
        "label": "5 Ağustos - 1 Eylül (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Kadim Bilgeliğin Muhafızı & Yaratıcı Deha (Kutsal Sezgi)",
    "element": "Hava & Su",
    "rulingPlanets": "Merkür & Ay",
    "colorTheme": {
      "primary": "#F59E0B",
      "secondary": "#FDE68A",
      "badgeBg": "rgba(245, 158, 11, 0.15)"
    },
    "spiritualEssence": "Kelt mitolojisinde kutsal Bilgelik Havuzu'nun çevresinde 9 fındık ağacı (Coll) dururdu. Havuza düşen fındıkları yiyen Kelt somonu evrensel bilgiye ulaşırdı. Fındık insanları keskin bir zekaya, hızlı öğrenme kabiliyetine, büyüleyici bir auraya ve karmaşık meseleleri tek hamlede çözen yaratıcı bir zihne sahiptir.",
    "lightTraits": [
      "Sıra dışı zeka, güçlü hafıza ve entelektüel kavrayış kabiliyeti",
      "İnsanları etkileyen karizmatik anlatım, espri ve söz ustalığı",
      "Özgün fikirler üretme, sanatsal ilham ve stratejik deha",
      "Bilgiye duyulan derin saygı ve öğrendiklerini cömertçe paylaşma"
    ],
    "shadowTraits": [
      "Zihinsel aşırı yüklenme ve beynini bir türlü susturamama",
      "Çevresindekilerin yavaşlığına karşı sabırsız ve alaycı olma",
      "Duygusal meseleleri fazla analiz ederek kalbin sesini bastırma",
      "Mükemmeliyetçilik sebebiyle projeleri bitirmekte zorlanma"
    ],
    "natureRitual": {
      "grounding": "Bir fındık ağacının gölgesinde oturun. Avucunuza bir fındık veya çakıl taşı alıp parmaklarınızla dokunun; zihninizin berraklaştığını hissedin.",
      "ambientAroma": "Nane ve Biberiye uçucu yağı buhuru (Difüzörde; konsantrasyonu artırır, zihinsel sisi dağıtır).",
      "soulPractice": "Bugün yeni bir şey öğrendiğinizde onu kendi içinizde tutmayın; sevdiklerinizden birine ilham olacak şekilde anlatın."
    },
    "relationships": {
      "resonantTrees": [
        "Asma",
        "Söğüt Ağacı",
        "Dişbudak Ağacı"
      ],
      "catalystTrees": [
        "Kızılağaç",
        "Meşe Ağacı"
      ]
    },
    "druidicProverb": "Fındığın kabuğu serttir ama içi saf bilgeliktir; hakikat sabırla arayanlara açılır."
  },
  {
    "id": "ogham_vine",
    "name": "Asma",
    "botanicalName": "Vitis vinifera",
    "oghamSymbol": "ᚋ",
    "oghamName": "Muin",
    "periods": [
      {
        "startMonth": 9,
        "startDay": 2,
        "endMonth": 9,
        "endDay": 29,
        "label": "2 Eylül - 29 Eylül (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Ruhsal Hasat & Bilgelik Simyacısı (İçsel Denge)",
    "element": "Su & Toprak",
    "rulingPlanets": "Venüs & Jüpiter",
    "colorTheme": {
      "primary": "#7C3AED",
      "secondary": "#C084FC",
      "badgeBg": "rgba(124, 58, 237, 0.15)"
    },
    "spiritualEssence": "Asma (Muin), Kelt geleneğinde sonbahar ekinoksunun bereket ve hasat sembolüdür. Derin kökleriyle topraktan aldığı acıyı ve tecrübeyi, tatlı ve besleyici bir meyveye dönüştürür. Asma insanları yüksek estetik zevk, felsefi derinlik, empati ve zıtlıkları uyumlu bir senteze ulaştırma kabiliyetine sahiptir.",
    "lightTraits": [
      "Yüksek sezgisel anlayış ve insan psikolojisini derinlemesine çözme",
      "Zıt fikirleri ve çatışmaları uzlaştıran diplomatik zeka",
      "Estetik, sanat, müzik ve incelikli yaşam kültürüne düşkünlük",
      "Hayatın krizlerinden ders çıkarıp olgunlaşma yeteneği"
    ],
    "shadowTraits": [
      "Kararsızlık ve iki seçenek arasında uzun süre bocalama",
      "Ruh halinin çabuk dalgalanması ve melankoliye eğilim",
      "Aşırı konfor düşkünlüğü veya zevklerin bağımlısı olma riski",
      "Başkalarının duygusal yüklerini sünger gibi çekip yorulma"
    ],
    "natureRitual": {
      "grounding": "Bir bağda veya yaprakları kızıla dönmüş bir asmanın altında oturun. Hayatınızda verdiğiniz emeklerin meyvelerini tek tek hatırlayıp şükredin.",
      "ambientAroma": "Tatlı Portakal ve Adaçayı uçucu yağı buhuru (Difüzörde; neşe, bereket ve dingin bir zihinsel ferahlık yayar).",
      "soulPractice": "Bugün karar vermekte zorlandığınız bir konuda zihninizle değil, karnınızdaki ilk sezgisel hisle seçim yapın."
    },
    "relationships": {
      "resonantTrees": [
        "Fındık Ağacı",
        "Söğüt Ağacı",
        "Huş Ağacı"
      ],
      "catalystTrees": [
        "Çobanpüskülü",
        "Kızılağaç"
      ]
    },
    "druidicProverb": "Ham üzüm sabırla güneşte bekledikçe tatlanır; ruhun olgunluğu aceleyle değil, hayatın demiyle kazanılır."
  },
  {
    "id": "ogham_ivy",
    "name": "Sarmaşık",
    "botanicalName": "Hedera helix",
    "oghamSymbol": "ᚌ",
    "oghamName": "Gort",
    "periods": [
      {
        "startMonth": 9,
        "startDay": 30,
        "endMonth": 10,
        "endDay": 27,
        "label": "30 Eylül - 27 Ekim (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Sarsılmaz Azim & Sadık Yolcu (Engelleri Aşan Ruh)",
    "element": "Su & Hava",
    "rulingPlanets": "Satürn & Ay",
    "colorTheme": {
      "primary": "#0D9488",
      "secondary": "#2DD4BF",
      "badgeBg": "rgba(13, 148, 136, 0.15)"
    },
    "spiritualEssence": "Sarmaşık (Gort), en kaygan duvarlara ve en dik uçurumlara inatla tırmanan yenilmez iradedir. Diğer bitkilerin solduğu sonbahar sonlarında çiçek açarak doğanın döngüsünü canlı tutar. Sarmaşık insanları, imkansız görünen şartlarda bile çıkış yolu bulan, sevdiklerine derinden bağlı, sadakat timsali güçlü ruhlardır.",
    "lightTraits": [
      "Engeller karşısında olağanüstü dayanıklılık ve tırmanma azmi",
      "Derin sadakat, dostluk ve fedakar bağlılık erdemi",
      "Karanlık veya zorlu durumlarda çözüm üreten pratik strateji",
      "Zor zamanlarda sevdiklerine sığınak ve dayanak olma"
    ],
    "shadowTraits": [
      "Bağımlı ilişkiler kurma ve ayrılmakta aşırı zorlanma",
      "Kendi değerini başkalarının sevgisine ve onayına bağlama riski",
      "İnatçılık yapıp bırakılması gereken durumları zorla sürdürme",
      "Zihnini kuruntulara ve gizli şüphelere fazla kaptırma"
    ],
    "natureRitual": {
      "grounding": "Taş bir duvara sarılmış yeşil sarmaşıklara dokunun. Parmak uçlarınızla onun tutunma köklerini hissedin ve içinizdeki gücü toprağa bağlayın.",
      "ambientAroma": "Okaliptüs ve Lavanta buhuru (Difüzörde; nefesi açar, zihindeki tıkanıklıkları dağıtır).",
      "soulPractice": "Bugün size artık hizmet etmeyen, sadece alışkanlıktan sürdürdüğünüz bir düşünceyi veya eşyayı serbest bırakın."
    },
    "relationships": {
      "resonantTrees": [
        "Alıç Ağacı",
        "Dişbudak Ağacı",
        "Meşe Ağacı"
      ],
      "catalystTrees": [
        "Asma",
        "Huş Ağacı"
      ]
    },
    "druidicProverb": "Sarmaşık taşı çatlatarak değil, ona sabırla sarılarak zirveye ulaşır; gerçek güç sebat etmektir."
  },
  {
    "id": "ogham_reed",
    "name": "Kamış",
    "botanicalName": "Phragmites australis",
    "oghamSymbol": "ᚍ",
    "oghamName": "Ngetal",
    "periods": [
      {
        "startMonth": 10,
        "startDay": 28,
        "endMonth": 11,
        "endDay": 24,
        "label": "28 Ekim - 24 Kasım (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Gizemlerin Kaşifi & Derin Bilge (Hakikat Arayıcısı)",
    "element": "Su & Hava",
    "rulingPlanets": "Plüton & Neptün",
    "colorTheme": {
      "primary": "#6366F1",
      "secondary": "#A5B4FC",
      "badgeBg": "rgba(99, 102, 241, 0.15)"
    },
    "spiritualEssence": "Kamış (Ngetal), Samhain kapısının (Kelt yeni yılı) kutsal ağacıdır. Kelt ozanlarının flütleri ve Druidlerin yazı kalemleri kamıştan yapılırdı. Kökleri derin sulara inerken fırtınada esner ama asla kırılmaz. Kamış ruhu, görünmeyenin ardındaki hakikati arayan, sırlar saklayan ve sözün büyüleyici gücünü bilen bir kâşiftir.",
    "lightTraits": [
      "İnsanların gizli motivasyonlarını anında sezen keskin radar",
      "Büyük fırtınalarda esneyip kırılmayan olağanüstü esneklik",
      "Güçlü hitabet, kelimeleri etkili kullanma ve yazarlık yeteneği",
      "Kriz ve dönüşüm anlarında soğukkanlılıkla yön bulma"
    ],
    "shadowTraits": [
      "Aşırı şüphecilik, takıntılı araştırmalar ve gizlilik tutkusu",
      "İnsanları manipüle etme veya güç oyunlarına çekilme riski",
      "Yıkıcı duyguları içinde biriktirip içine kapanma eğilimi",
      "Başkalarının sınırlarını fazla zorlayıp onları rahatsız etme"
    ],
    "natureRitual": {
      "grounding": "Bir göl veya gölet kenarındaki sazlıkların hışırtısını dinleyin. Rüzgarın kamışlar arasındaki melodisine odaklanarak zihninizi boşaltın.",
      "ambientAroma": "Mür (Myrrh) ve Paçuli buhuru (Difüzörde; meditatif konsantrasyonu derinleştirir, derin sezgileri uyarır).",
      "soulPractice": "Bugün içinizde sakladığınız bir şüpheyi konuşmak yerine, bir kağıda yazın ve sonra o kağıdı yırtarak serbest bırakın."
    },
    "relationships": {
      "resonantTrees": [
        "Dişbudak Ağacı",
        "Mürver Ağacı",
        "Söğüt Ağacı"
      ],
      "catalystTrees": [
        "Meşe Ağacı",
        "Kızılağaç"
      ]
    },
    "druidicProverb": "Fırtınada sert ağaçlar devrilir, esnek kamış bükülür ve rüzgar dindiğinde dimdik ayağa kalkar."
  },
  {
    "id": "ogham_elder",
    "name": "Mürver Ağacı",
    "botanicalName": "Sambucus nigra",
    "oghamSymbol": "ᚎ",
    "oghamName": "Ruis",
    "periods": [
      {
        "startMonth": 11,
        "startDay": 25,
        "endMonth": 12,
        "endDay": 23,
        "label": "25 Kasım - 23 Aralık (Ogham Ayı)"
      }
    ],
    "isCardinalStation": false,
    "archetype": "Döngülerin Efendisi & Büyük Şifacı (Yeniden Doğuş Kapısı)",
    "element": "Toprak & Su",
    "rulingPlanets": "Satürn & Ay",
    "colorTheme": {
      "primary": "#8B5CF6",
      "secondary": "#DDD6FE",
      "badgeBg": "rgba(139, 92, 246, 0.15)"
    },
    "spiritualEssence": "Mürver (Ruis), 13 aylık Kelt Ogham döngüsünün 13. ve sonuncu kapısıdır. Kelt geleneğinde Mürver Ana, ölüm ve yeniden doğumun, döngülerin tamamlanmasının ve eskiyi bırakmanın bekçisidir. Kış gündönümünden hemen önce tüm yüklerin arınmasını sağlar. Mürver insanları hayatın derin gizemlerini kavrayan, bağımsız ve evrensel bilgeliğe açık yaşlı ruhlardır.",
    "lightTraits": [
      "Eski döngüleri kapatıp cesaretle yeniye başlama bilgeliği",
      "Yüksek ruhsal şifa gücü, insanları teselli etme ve dönüştürme",
      "Sıra dışı özgürlük aşkı, toplumsal kalıpların ötesine geçme",
      "Büyük resmi görme ve kaderin iniş çıkışlarını vakarla karşılama"
    ],
    "shadowTraits": [
      "Gereksiz yere acımasızca köprüleri yıkıp arkasına bakmama riski",
      "Yalnızlaşma, insanlardan uzaklaşıp yabancılaşma eğilimi",
      "Aşırı dobralıkla sevdiklerinin kalbini kırma riski",
      "Hayatın sıradan zevklerini küçümseyip nihilist düşüncelere kapılma"
    ],
    "natureRitual": {
      "grounding": "Bir mürver ağacının gövdesine elinizi koyun. Hayatınızda artık bitmesi gereken bir dönemi zihninizde mürverin köklerine bırakın.",
      "ambientAroma": "Akgünlük (Frankincense) ve Mürver çiçeği buhuru (Difüzörde; arınma, kutsal koruma ve içsel dinginlik aşılar).",
      "soulPractice": "Bugün artık size hizmet etmeyen bir eşyayı, ilişki kalıbını veya dargınlığı tamamen affederek bitirin."
    },
    "relationships": {
      "resonantTrees": [
        "Huş Ağacı",
        "Kamış",
        "Çobanpüskülü"
      ],
      "catalystTrees": [
        "Üvez Ağacı",
        "Fındık Ağacı"
      ]
    },
    "druidicProverb": "Mürver yapraklarını dökmeden yeni baharın tomurcuklarını hazırlar; her son, içinde daha büyük bir başlangıç taşır."
  }
];

/**
 * 21 Kutsal Kelt Güneş Döngüsü Ağaçları (Mevsimsel Tekrarlar ve Ekinokslar)
 */
export const SOLAR_TREES: DruidTree[] = DRUID_TREES;

export interface DruidTreeAnalysis {
  oghamTree: DruidTree;       // 13 Kelt Ay / Ogham Ağacı (Birincil Otantik Harita)
  solarTree: DruidTree;       // 21 Kelt Güneş Döngüsü Ağacı
  primaryTree: DruidTree;
}

/**
 * Belirli bir tarihin periyot içinde olup olmadığını denetler (yıl atlama durumları dahil).
 */
function isDateInPeriod(day: number, month: number, period: DruidTreePeriod): boolean {
  const { startMonth, startDay, endMonth, endDay } = period;

  // Aynı ay içinde
  if (startMonth === endMonth) {
    return month === startMonth && day >= startDay && day <= endDay;
  }

  // Normal yıl akışı (örneğin 12 Ocak - 24 Ocak)
  if (startMonth < endMonth) {
    if (month === startMonth && day >= startDay) return true;
    if (month === endMonth && day <= endDay) return true;
    if (month > startMonth && month < endMonth) return true;
    return false;
  }

  // Yıl dönümünü aşan aralık (örneğin 24 Aralık - 20 Ocak)
  if (startMonth > endMonth) {
    if (month === startMonth && day >= startDay) return true;
    if (month === endMonth && day <= endDay) return true;
    if (month > startMonth || month < endMonth) return true;
    return false;
  }

  return false;
}

/**
 * Verilen gün ve aya göre 13 Kelt Ay (Ogham) ağacını bulur.
 */
export function getOghamTreeByDate(day: number, month: number): DruidTree {
  for (const tree of OGHAM_TREES) {
    for (const period of tree.periods) {
      if (isDateInPeriod(day, month, period)) {
        return tree;
      }
    }
  }
  // 23 Aralık kış gündönümü geçiş günü için Mürver veya Huş
  return OGHAM_TREES[OGHAM_TREES.length - 1];
}

/**
 * Verilen gün ve aya göre 21 Kelt Güneş ağacını bulur.
 */
export function getSolarTreeByDate(day: number, month: number): DruidTree {
  // 1. Ekinoks ve gündönümü
  if (month === 3 && day === 21) return SOLAR_TREES.find(t => t.id === 'oak')!;
  if (month === 6 && day === 24) return SOLAR_TREES.find(t => t.id === 'birch')!;
  if (month === 9 && day === 23) return SOLAR_TREES.find(t => t.id === 'olive')!;
  if (month === 12 && day === 22) return SOLAR_TREES.find(t => t.id === 'beech')!;

  // 2. Döngüsel ağaçlar
  for (const tree of SOLAR_TREES) {
    for (const period of tree.periods) {
      if (isDateInPeriod(day, month, period)) {
        return tree;
      }
    }
  }
  return SOLAR_TREES.find(t => t.id === 'apple')!;
}

/**
 * Verilen gün ve aya göre Kelt Ağacını hesaplar.
 * Varsayılan sistem: 'ogham' (13 Ay Ogham Takvimi; 17 Mart doğrudan Dişbudak Ağacı döner).
 */
export function getDruidTreeByDate(day: number, month: number, system: 'ogham' | 'solar' = 'ogham'): DruidTree {
  if (system === 'solar') {
    return getSolarTreeByDate(day, month);
  }
  return getOghamTreeByDate(day, month);
}

/**
 * Her iki takvim sistemini de içeren bütünsel Kelt Ağaç Analizini döndürür.
 */
export function getDruidTreeAnalysis(day: number, month: number): DruidTreeAnalysis {
  const oghamTree = getOghamTreeByDate(day, month);
  const solarTree = getSolarTreeByDate(day, month);
  return {
    oghamTree,
    solarTree,
    primaryTree: oghamTree
  };
}

export function getAllDruidTrees(system: 'ogham' | 'solar' = 'ogham'): DruidTree[] {
  return system === 'ogham' ? OGHAM_TREES : SOLAR_TREES;
}

export function getDruidTreeById(id: string): DruidTree | undefined {
  return OGHAM_TREES.find(t => t.id === id) || SOLAR_TREES.find(t => t.id === id);
}
