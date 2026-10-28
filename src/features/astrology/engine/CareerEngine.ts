import { generateAstrologyChart } from './AstrologyEngine';
import { AstroCity, NatalChartData, AstroPoint } from './AstrologyConstants';
import { calculateNameAnalysis, calculateLifePath } from '@/utils/numerologyCalculator';
import { numerologyData } from '@/utils/numerologyData';
import { generateChart, HumanDesignChart } from '@/utils/HumanDesignEngine';
import moment from 'moment-timezone';

export interface CareerSectorMatch {
  title: string;
  category: 'Liderlik & Girişim' | 'Teknoloji & İnovasyon' | 'Sanat & İletişim' | 'Şifa & Danışmanlık' | 'Finans & Strateji' | 'Global Vizyon & Akademi' | 'Organizasyon & Sistem';
  fitScore: number;
  recommendedRoles: string[];
  description: string;
}

export interface CareerAnalysisResult {
  personalInfo: {
    fullName: string;
    birthDate: string;
    birthTime: string;
    cityName: string;
  };
  astrology: {
    mcSign: string;
    mcDegree: number;
    mcTitle: string;
    mcInterpretation: string;
    house6Sign: string;
    house6Interpretation: string;
    house2Sign: string;
    house2WealthKey: string;
    saturnPlacement: string;
    saturnDisciplineAdvice: string;
    marsPlacement: string;
    marsExecutionStyle: string;
  };
  numerology: {
    destinyNumber: number;
    destinyTitle: string;
    destinyCareerAdvice: string;
    lifePathNumber: number;
    lifePathVision: string;
    soulUrgeNumber: number;
    innerDrive: string;
  };
  humanDesign: {
    type: string;
    profile: string;
    profileWorkRole: string;
    workStrategy: string;
    decisionAuthority: string;
    authorityTactic: string;
    careerDynamic: string;
  };
  synthesis: {
    idealWorkModel: {
      type: 'Girişimci & Bağımsız Kurucu' | 'Kurumsal Lider & Üst Yönetici' | 'Stratejik Rehber & Danışman' | 'Özerk Uzman & Zanaatkar';
      percentage: number;
      explanation: string;
    };
    superPower: string;
    shadowPitfalls: string;
    topSectors: CareerSectorMatch[];
    actionableGuidance: string[];
  };
}

// 1. 10. EV (MC) KARİYER ZİRVESİ - 12 BURÇ İÇİN ÖZGÜN VE DERİN TANIMLAR
const MC_SECTOR_DATA: Record<string, {
  title: string;
  category: CareerSectorMatch['category'];
  desc: string;
  cardExplanation: string;
  roles: string[];
}> = {
  'Koç': {
    title: 'Öncü Girişimci ve Kriz Lideri',
    category: 'Liderlik & Girişim',
    desc: 'Kariyerinizde bağımsızlık, hız ve ilk adımı atan kişi olma dürtüsü hakimdir. Emir almaktan hoşlanmaz, kriz anlarında soğukkanlılıkla risk alarak yolu açarsınız. Kendi işini kurmak veya inisiyatif alabileceğiniz dinamik pozisyonlar sizin için idealdir.',
    cardExplanation: '10. Evinizdeki Koç burcu; piyasada kimsenin cesaret edemediği ilk adımları atma, start-up kurma ve rekabetçi piyasada öncü olarak zirveye oturma potansiyelinizi temsil eder.',
    roles: ['Start-up Kurucusu', 'Acil Kriz Yöneticisi', 'Proje Lideri', 'Savunma & Güvenlik Direktörü', 'Performans Koçu']
  },
  'Boğa': {
    title: 'Kalıcı Değer Mimarı ve Finans Direktörü',
    category: 'Finans & Strateji',
    desc: 'Kariyerinizi aceleye getirmeden, sağlam tuğlalarla kalıcı bir anıt gibi inşa edersiniz. Güvenilirlik, finansal öngörü, estetik zevk ve kaynak yönetimi en büyük erdeminizdir. Gelir getirmeyen veya aşırı dalgalı spekülatif işler yerine sürdürülebilir refahı tercih edersiniz.',
    cardExplanation: '10. Evinizdeki Boğa burcu; somut varlıklar, gayrimenkul, finansal portföyler ve estetik kalitesi yüksek lüks ürünler üreterek zamana meydan okuyan bir saygınlık yaratacağınızı gösterir.',
    roles: ['Portföy & Varlık Yöneticisi', 'Gayrimenkul Geliştirici', 'Lüks Marka Direktörü', 'Sürdürülebilir Tarım Yatırımcısı', 'Sanat & Antika Değerleme Uzmanı']
  },
  'İkizler': {
    title: 'Çok Kanallı Medya ve Bilgi Ağı Mimarı',
    category: 'Sanat & İletişim',
    desc: 'Kariyerinizin merkezinde fikirler, bilgi akışı, teknoloji ve iletişim yer alır. Tekdüze ve rutin ofis işleri sizi köreltir; aynı anda birkaç projeyi yönetmek, yazmak, anlatmak ve insanları birbirine bağlamak sizin dehanızdır.',
    cardExplanation: '10. Evinizdeki İkizler burcu; bilgiyi hızla sentezleyip kitlelere aktarma, dijital yayıncılık, çoklu iş kolları yönetme ve sektörler arası köprü kurma dehanızı zirveye taşır.',
    roles: ['Dijital Yayıncı & Yazar', 'Medya Direktörü', 'Halkla İlişkiler & İletişim Stratejisti', 'Veri Analisti', 'Teknoloji Ticareti Danışmanı']
  },
  'Yengeç': {
    title: 'Topluluk Rehberi ve Kurumsal Aidiyet Mimarı',
    category: 'Şifa & Danışmanlık',
    desc: 'Kariyerinizde insani dokunuş, güven ve aidiyet yaratma yeteneğinizle yükselirsiniz. İnsanların duygusal ve fiziksel ihtiyaçlarını anlama kabiliyetiniz güçlüdür. Kurum içinde bir aile bağı kurarak çalışanları motive edersiniz.',
    cardExplanation: '10. Evinizdeki Yengeç burcu; müşterilerde ve ekiplerde sarsılmaz bir sadakat oluşturma, insanların en hassas ihtiyaçlarını karşılama ve koruyucu liderlikle itibar kazanma gücünüzü simgeler.',
    roles: ['İnsan Kaynakları Direktörü', 'Klinik Psikolog & Aile Danışmanı', 'Butik Otel & Gastronomi İşletmecisi', 'Tarih & Kültürel Miras Yöneticisi', 'Sosyal Sorumluluk Lideri']
  },
  'Aslan': {
    title: 'Karizmatik Direktör ve Sahne Lideri',
    category: 'Liderlik & Girişim',
    desc: 'Toplum önünde doğal bir ışıltınız ve saygınlığınız vardır. Liderlik etmek, sahne ışıklarında olmak ve ilham vermek için yaratılmışsınız. Sıradan bir çalışan olmak yerine vizyon çizen bir direktör veya marka yüzü olmak size yakışır.',
    cardExplanation: '10. Evinizdeki Aslan burcu; vizyoner bir marka yüzü olma, yaratıcı sektörlerde üst düzey yönetici unvanları taşıma ve projeleri görkemli başarı hikayelerine dönüştürme gücünüzü açığa çıkarır.',
    roles: ['C-Level Üst Düzey Yönetici', 'Kreatif Direktör', 'Sahne & Gösteri Sanatları Yapımcısı', 'Lüks Marka Temsilcisi', 'İlham Verici Konuşmacı']
  },
  'Başak': {
    title: 'Süreç Optimizatörü ve Sistem Mimarı',
    category: 'Organizasyon & Sistem',
    desc: 'Detaylardaki ustalığınız, iş ahlakınız ve analitik zekanız sayesinde kimsenin göremediği aksaklıkları çözer, sistemleri saat gibi tıkır tıkır çalıştırırsınız. Hizmet üretmek ve somut kalite standartları belirlemek sizin imzanızdır.',
    cardExplanation: '10. Evinizdeki Başak burcu; karmaşık operasyonları kusursuzlaştırma, veri ve kalite güvence mimarisi kurma ve teknik ustalığınızla sektörün en güvenilir referans noktası olma potansiyelinizi gösterir.',
    roles: ['Sistem & Kalite Mimarı', 'Yazılım Test & Güvence Mühendisi', 'Tıbbi Analiz & Sağlık Yöneticisi', 'Finansal Denetçi', 'Operasyonel Danışman']
  },
  'Terazi': {
    title: 'Uluslararası Arabulucu ve Diplomatik Stratejist',
    category: 'Sanat & İletişim',
    desc: 'Kariyeriniz zarafet, müzakere kabiliyeti, hukuk ve estetik dengesi üzerine kuruludur. İkna gücünüz yüksektir; çatışan tarafları uzlaştırarak her iki taraf için de kazançlı anlaşmalar masaya koyarsınız.',
    cardExplanation: '10. Evinizdeki Terazi burcu; en çetrefilli müzakereleri anlaşmayla sonuçlandırma, üst düzey ortaklıklar inşa etme ve estetik vizyonunuzla prestijli kurumları temsil etme kabiliyetinizi parlatır.',
    roles: ['Kurumsal Arabulucu & Avukat', 'Diplomat & Uluslararası Temsilci', 'Sanat Küratörü & İç Mimar', 'Stratejik Ortaklıklar Direktörü', 'Moda & Tasarım Yöneticisi']
  },
  'Akrep': {
    title: 'Stratejik Kriz Yöneticisi ve Derin Dönüşüm Lideri',
    category: 'Finans & Strateji',
    desc: 'Yüzeysel olan hiçbir şey ilginizi çekmez. Gizli kalmış gerçekleri ortaya çıkarmak, batmakta olan bir şirketi veya projeyi küllerinden yeniden doğurmak ve krizleri fırsata çevirmek sizin gücünüzdür.',
    cardExplanation: '10. Evinizdeki Akrep burcu; batmakta olan yapıları yeniden canlandırma, büyük fonları stratejik gizlilikle yönetme ve siber güvenlik/istihbarat gibi kritik alanlarda vazgeçilmez bir güç olma kapasitenizi anlatır.',
    roles: ['Risk Sermayesi (VC) Yöneticisi', 'Siber Güvenlik & İstihbarat Danışmanı', 'Şirket Birleşme & Devralma (M&A) Uzmanı', 'Psikiyatrist & Derin Terapist', 'Kriz Dönüşüm Danışmanı']
  },
  'Yay': {
    title: 'Global Vizyoner, Felsefi Mentor ve Keşifçi',
    category: 'Global Vizyon & Akademi',
    desc: 'Sınırlar ve yerel kurallar sizi kısıtlar. Uluslararası işler, akademik çevreler, yayıncılık ve geleceğe yön veren felsefi projeler sizin arenanızdır. İnsanlara büyük resmi gösteren bir rehbersiniz.',
    cardExplanation: '10. Evinizdeki Yay burcu; yerel kalıpların ötesine geçerek uluslararası ticaret, yüksek akademi, global yayıncılık ve kitlelere yol gösteren felsefi danışmanlıkta kadersel söz sahibi olduğunuzu belgeler.',
    roles: ['Uluslararası Ticaret & İhracat Direktörü', 'Akademisyen & Rektörlük/Bölüm Başkanlığı', 'Global Yayıncı & Editör', 'Uluslararası Turizm & Havacılık Lideri', 'Kurumsal Filozof & Stratejist']
  },
  'Oğlak': {
    title: 'Kurumsal Zirve Mimarı ve Otorite Figürü',
    category: 'Liderlik & Girişim',
    desc: 'Zodyakın en güçlü kariyer konumlarından biridir. Disiplin, sabır ve sarsılmaz bir iş ahlakıyla en tepeye tırmanırsınız. Kurumsal yapılarda, devlet kademelerinde veya büyük şirketlerde uzun soluklu bir miras bırakırsınız.',
    cardExplanation: '10. Evinizdeki Oğlak burcu; basamakları sabırla tırmanıp en tepe icra makamlarına oturma, holdingleri veya kamu kurumlarını sarsılmaz bir liyakatle yönetme ve kalıcı anıtlar bırakma gücünüzdür.',
    roles: ['Holding Genel Müdürü / CEO', 'Ağır Sanayi & Altyapı Projeleri Yöneticisi', 'Üst Düzey Kamu Bürokratı', 'Stratejik Planlama Kurulu Başkanı', 'Kurumsal Hukuk Otoritesi']
  },
  'Kova': {
    title: 'Gelecek Tasarımcısı ve Derin Teknoloji İnovatörü',
    category: 'Teknoloji & İnovasyon',
    desc: 'Geleneksel kariyer yolları size göre değildir. Geleceğin teknolojileri, yapay zeka, toplumsal hareketler ve kolektife fayda sağlayan sıra dışı buluşlar sizin vizyonunuzu tetikler. Özgürlük alanınız mutlaka korunmalıdır.',
    cardExplanation: '10. Evinizdeki Kova burcu; çağının 10 yıl ilerisinde düşünerek yapay zeka, derin teknoloji, blokzincir ve sosyal girişimcilikle sektörün kurallarını baştan yazma misyonunuzu işaret eder.',
    roles: ['Yapay Zeka & Derin Teknoloji Kurucusu', 'Blokzincir & Fintek Stratejisti', 'Sosyal İnovasyon & STK Başkanı', 'Astrofizik & Havacılık Uzmanı', 'Dijital Komünite Mimarı']
  },
  'Balık': {
    title: 'Empatik Vizyoner ve İlham Veren Sanatçı/Şifacı',
    category: 'Şifa & Danışmanlık',
    desc: 'Rasyonel aklın ötesindeki sezgilerinizle insanlara dokunan işlerde parıldarsınız. Sanat, sinema, ruhsal rehberlik ve şifa alanlarında dünyayı daha iyi bir yer haline getirecek projelerin doğal yaratıcısısınız.',
    cardExplanation: '10. Evinizdeki Balık burcu; sanatsal deha, sinematik vizyon, psikolojik sezgi ve insan ruhuna dokunan projelerle toplumsal vicdanı uyandırma ve kalıcı bir iz bırakma gücünüzü temsil eder.',
    roles: ['Sinema Yapımcısı & Yönetmen', 'Holistik Tıp & Şifa Merkezi Kurucusu', 'Manevi & Psikolojik Başdanışman', 'Müzik & Sanat Terapisti', 'İnsani Yardım Vakfı Yöneticisi']
  }
};

// 2. KADER SAYISINA ÖZEL SEKTÖR KARTI DETAYLARI
const DESTINY_SECTOR_DATA: Record<number, {
  title: string;
  category: CareerSectorMatch['category'];
  explanation: string;
  roles: string[];
}> = {
  1: {
    title: 'Öncü Bağımsız Girişimci Kulvarı',
    category: 'Liderlik & Girişim',
    explanation: 'İsminizin 1 titreşimi, kimseden emir almadan kendi şirketini kurma, yeni pazarlar açma ve sektöre yön veren bir ilk uygulayıcı olma dünyevi misyonunuzu kesinleştirir.',
    roles: ['Şirket Kurucusu / Founder', 'Buluş & Patent Sahibi', 'Bağımsız Yönetim Kurulu Danışmanı', 'Öncü Tasarımcı']
  },
  2: {
    title: 'Diplomatik Ortaklık ve Stratejik Danışmanlık Kulvarı',
    category: 'Şifa & Danışmanlık',
    explanation: 'İsminizin 2 titreşimi, çatışan güçler arasında köprü kurma, üst düzey müzakereleri yönetme ve ikili işbirliklerini devasa karlara dönüştürme yeteneğinizi taçlandırır.',
    roles: ['Müzakere Danışmanı', 'Psikolog & İnsan Kaynakları Uzmanı', 'Uluslararası Arabulucu', 'Stratejik Ortaklık Yöneticisi']
  },
  3: {
    title: 'Kreatif İletişim, Medya ve Sahne Kulvarı',
    category: 'Sanat & İletişim',
    explanation: 'İsminizin 3 titreşimi, kelimeler, renkler ve sahne enerjisiyle kitleleri etkileme, yaratıcı endüstrilerde marka yaratma ve ilham verici içerik üretme misyonunuzdur.',
    roles: ['Kreatif Direktör', 'Yazar & Senarist', 'Halkla İlişkiler Müdürü', 'Medya & Gösteri Sanatçısı', 'Marka Kimliği Danışmanı']
  },
  4: {
    title: 'Sistemik Yapılandırma ve Kurumsal Mimarlık Kulvarı',
    category: 'Organizasyon & Sistem',
    explanation: 'İsminizin 4 titreşimi, kaostan kusursuz operasyonel düzen çıkarma, inşaat/mühendislik projelerini yönetme ve kurumları sarsılmaz temellere oturtma dehanızdır.',
    roles: ['Baş Operasyon Sorumlusu (COO)', 'Sistem Mühendisi', 'Büyük Proje Direktörü', 'Kurumsal Denetim Uzmanı', 'Mimar & İnşaat Yöneticisi']
  },
  5: {
    title: 'Dinamik Pazarlama, Seyahat ve İnovatif Ticaret Kulvarı',
    category: 'Liderlik & Girişim',
    explanation: 'İsminizin 5 titreşimi, rutin mesaileri aşarak küresel trendleri koklama, serbest piyasa ticaretinde fırsatları yakalama ve hızlı büyüme sağlama gücünüzdür.',
    roles: ['Büyüme & Pazarlama Direktörü (CMO)', 'Uluslararası Ticaret Ajanı', 'Seyahat & Kültür Girişimcisi', 'Finansal Piyasa Brokerı']
  },
  6: {
    title: 'Kurumsal Hizmet Kalitesi ve Toplum Sağlığı Kulvarı',
    category: 'Şifa & Danışmanlık',
    explanation: 'İsminizin 6 titreşimi, etik standartları koruma, insan sağlığı, eğitim ve aile/çocuk odaklı sektörlerde toplumun sığınağı haline gelen kurumlar inşa etme görevinizdir.',
    roles: ['Sağlık Kurumu Yöneticisi', 'Eğitim Kurumu Kurucusu', 'Aile Hukuku & Arabuluculuk Uzmanı', 'Toplumsal Gelişim Danışmanı']
  },
  7: {
    title: 'Derin Analitik Araştırma ve Felsefi Teknoloji Kulvarı',
    category: 'Teknoloji & İnovasyon',
    explanation: 'İsminizin 7 titreşimi, yüzeysel bilgiyle yetinmeyip görünmeyeni keşfetme, bilimsel veri mimarisi kurma ve stratejik felsefe ile kurumlara yol gösterme dehanızdır.',
    roles: ['Baş Teknoloji Danışmanı (CTO)', 'Veri Bilimci & Algoritma Mimarı', 'Akademik Başdanışman', 'Stratejik İstihbarat Analisti']
  },
  8: {
    title: 'Maddi Güç, Büyük Sermaye ve Organizasyon Yönetimi Kulvarı',
    category: 'Finans & Strateji',
    explanation: 'İsminizin 8 titreşimi, makro bütçeleri yönetme, büyük şirketlerin yönetim kurullarına başkanlık etme ve maddi gücü toplumsal kalkınma için etik kullanma misyonunuzdur.',
    roles: ['Holding CEO / İcra Kurulu Başkanı', 'Yatırım Bankacısı & Girişim Sermayesi Lideri', 'Büyük Gayrimenkul Yatırımcısı', 'Finansal Stratejist']
  },
  9: {
    title: 'Evrensel Kültür, Sosyal Dönüşüm ve Dünya Mirası Kulvarı',
    category: 'Global Vizyon & Akademi',
    explanation: 'İsminizin 9 titreşimi, sadece kişisel çıkar için değil insanlık için kalıcı değerler üretme, uluslararası fonları ve kültürel miras projelerini yönetme idealiyle parlar.',
    roles: ['Uluslararası Vakıf Başkanı', 'Kültür & Sanat Elçisi', 'Küresel Çevre & İklim Lideri', 'Uluslararası Diplomat']
  },
  11: {
    title: 'Yüksek Sezgi ve İlham Meşalesi Kulvarı (Üstat 11)',
    category: 'Şifa & Danışmanlık',
    explanation: 'Üstat 11 sayısı, geleneksel iş tanımlarının ötesinde insan bilincini yükselten, vizyoner fikirleriyle topluma rehberlik eden kadersel bir ilham liderliği gerektirir.',
    roles: ['Vizyoner Yaşam & Kariyer Mentoru', 'Holistik Akademi Kurucusu', 'Kültürel Dönüşüm Danışmanı', 'Sezgisel Stratejist']
  },
  22: {
    title: 'Evrensel Mimar ve Büyük Eserler Kurucusu (Üstat 22)',
    category: 'Finans & Strateji',
    explanation: 'Üstat 22 sayısı, devasa hayalleri dünya maddesine indiren en güçlü sayıdır; kıtalararası altyapı, teknoloji veya finans ağları kurma potansiyelini temsil eder.',
    roles: ['Kıtalararası Altyapı Direktörü', 'Küresel Finans Ağı Kurucusu', 'Mega Proje Mimarı', 'Devletlerarası Stratejik Danışman']
  },
  33: {
    title: 'Kolektif Şifa ve Etik Fedakarlık Otoritesi (Üstat 33)',
    category: 'Şifa & Danışmanlık',
    explanation: 'Üstat 33 sayısı, insanlığın acılarını dindiren, küresel ölçekte etik ve manevi reformlar başlatan yüce bir adanmışlık ve sevgi liderliğidir.',
    roles: ['Küresel İnsani Yardım Başdanışmanı', 'Etik Tıp Kurulu Başkanı', 'Manevi Enstitü Kurucusu', 'Uluslararası Barış Elçisi']
  }
};

// 3. 2. EV (MADDİ KAZANÇ) - 12 BURÇ İÇİN TAMAMEN FARKLI ROLLER VE AÇIKLAMALAR
const HOUSE2_SECTOR_DATA: Record<string, {
  title: string;
  category: CareerSectorMatch['category'];
  explanation: string;
  roles: string[];
}> = {
  'Koç': {
    title: 'Koç Maddi Kazanç & Risk Portföyü',
    category: 'Liderlik & Girişim',
    explanation: '2. Evinizdeki Koç burcu; pazara ilk giren olma cesaretiniz, hızlı kararlarınız ve inisiyatif alarak başlattığınız bağımsız projeler üzerinden doğrudan nakit akışı yaratacağınızı gösterir.',
    roles: ['Girişim Sermayesi Yatırımları', 'Hızlı Prototipleme & Satış', 'Bireysel Primli Projeler', 'Kriz Fırsatı Değerlendirme']
  },
  'Boğa': {
    title: 'Boğa Kalıcı Varlık & Gayrimenkul Portföyü',
    category: 'Finans & Strateji',
    explanation: '2. Evinizdeki Boğa burcu; somut mülk edinme, gayrimenkul değerleme, bileşik getiri ve lüks tüketim ürünleri üzerinden nesiller boyu erimeyecek bir servet inşa etme potansiyelinizi anlatır.',
    roles: ['Gayrimenkul Portföy Yönetimi', 'Değerli Emtia & Altın Fonları', 'Lüks Tasarım Varlıkları', 'Kalıcı Gelir Sağlayan Mülkler']
  },
  'İkizler': {
    title: 'İkizler Bilgi Ticareti & Dijital Telif Portföyü',
    category: 'Sanat & İletişim',
    explanation: '2. Evinizdeki İkizler burcu; bilgiyi hızla paketleyip satma, dijital içerik telifleri, ticaret komisyonları ve birden fazla kanaldan akan dinamik mikro gelirlerle zenginleşeceğinizi modeller.',
    roles: ['Dijital Telif & Lisans Gelirleri', 'Ticaret Aracılığı & Komisyonculuk', 'Eğitim & Danışmanlık Paketleri', 'Çok Kanallı E-Ticaret']
  },
  'Yengeç': {
    title: 'Yengeç Barınma, Gıda & Güvenlik Portföyü',
    category: 'Şifa & Danışmanlık',
    explanation: '2. Evinizdeki Yengeç burcu; insanların en temel barınma, beslenme ve duygusal emniyet ihtiyaçlarına yönelik hizmetlerle sarsılmaz bir finansal koruma kalkanı oluşturacağınızı ifade eder.',
    roles: ['Konut & Yaşam Alanı Yatırımları', 'Gastronomi & Organik Gıda', 'Aile Varlık Yönetimi', 'Duygusal Güvenlik Danışmanlığı']
  },
  'Aslan': {
    title: 'Aslan Prestij, Marka & Lüks Kazanç Portföyü',
    category: 'Liderlik & Girişim',
    explanation: '2. Evinizdeki Aslan burcu; kendi kişisel markanız, imzanızı taşıyan lüks tasarımlar, eğlence/sahne projeleri ve yüksek profilli unvanlar sayesinde en yüksek kazanç akışını çekeceğinizi gösterir.',
    roles: ['Kişisel Marka Telifleri', 'Lüks Segment Danışmanlık', 'Yaratıcı Eser Sahipliği', 'Üst Düzey Yönetici Primleri']
  },
  'Başak': {
    title: 'Başak Uzman Zanaat & Süreç Optimizasyonu Portföyü',
    category: 'Organizasyon & Sistem',
    explanation: '2. Evinizdeki Başak burcu; ince işçilik, teknik analiz, süreç denetimi ve kimsenin fark edemediği hataları düzelterek elde edeceğiniz vazgeçilmez uzmanlık ücretleriyle para kazanacağınızı belgeler.',
    roles: ['Teknik Uzmanlık Danışmanlığı', 'Operasyonel Süreç Denetimi', 'Yazılım & Sağlık Analitik Hizmetleri', 'Bütçe Verimlilik Sözleşmeleri']
  },
  'Terazi': {
    title: 'Terazi Ortaklık, Hukuk & Estetik Değer Portföyü',
    category: 'Sanat & İletişim',
    explanation: '2. Evinizdeki Terazi burcu; tek başına değil doğru ortaklarla hareket ederek, başarılı müzakereler, hukuk danışmanlıkları ve tasarım/estetik projeleri üzerinden büyük refah sağlayacağınızı açıklar.',
    roles: ['Stratejik Şirket Ortaklıkları', 'Hukuki Danışmanlık Sözleşmeleri', 'İç Mimarlık & Tasarım Gelirleri', 'Lüks Müzakere Komisyonları']
  },
  'Akrep': {
    title: 'Akrep Sermaye Yönetimi & Kriz Fırsatları Portföyü',
    category: 'Finans & Strateji',
    explanation: '2. Evinizdeki Akrep burcu; başkalarının parasını ve fonlarını yönetme, krizdeki batık şirketleri alıp karlı şekilde elden çıkarma ve gizli piyasa avantajlarıyla büyük sermayeler yapacağınızı anlatır.',
    roles: ['Özel Sermaye Fon Yönetimi (PE)', 'Kriz Arbitrajı & Yatırım', 'Şirket Yeniden Yapılandırma', 'Stratejik Gizli Ortaklıklar']
  },
  'Yay': {
    title: 'Yay Uluslararası Piyasalar & Global Ticaret Portföyü',
    category: 'Global Vizyon & Akademi',
    explanation: '2. Evinizdeki Yay burcu; yerel para birimlerinin ötesine geçip döviz bazlı ihracat, yabancı yatırımcı ortaklıkları, küresel yayıncılık ve eğitimlerle devasa bereket kapıları aralayacağınızı modeller.',
    roles: ['Döviz Bazlı İhracat Gelirleri', 'Uluslararası Eğitim & Telif Hakları', 'Yabancı Yatırımcı Fonları', 'Küresel Turizm & Danışmanlık']
  },
  'Oğlak': {
    title: 'Oğlak Sağlam Hisse, Altyapı & Kurumsal Birikim Portföyü',
    category: 'Liderlik & Girişim',
    explanation: '2. Evinizdeki Oğlak burcu; kısa vadeli spekülasyonlara kapılmadan, köklü şirket hisseleri, kalıcı altyapı mülkleri ve üst düzey yönetici hisse opsiyonlarıyla sarsılmaz bir servet inşa edeceğinizi gösterir.',
    roles: ['Holding Hisse Opsiyonları', 'Altyapı & Enerji Yatırımları', 'Büyük Ölçekli Ticari Gayrimenkul', 'Uzun Vadeli Kurumsal Portföy']
  },
  'Kova': {
    title: 'Kova Dijital Varlık, Teknoloji & İnovasyon Portföyü',
    category: 'Teknoloji & İnovasyon',
    explanation: '2. Evinizdeki Kova burcu; geleneksel bankacılık dışındaki dijital varlıklar, patent gelirleri, yapay zeka platformları ve kitlesel fonlama modelleriyle çağ atlayarak para kazanacağınızı ifade eder.',
    roles: ['Teknoloji Patenti Gelirleri', 'Yapay Zeka & SaaS Abonelikleri', 'Blokzincir & Kripto Varlıklar', 'Kitlesel Fonlama Gelirleri']
  },
  'Balık': {
    title: 'Balık Sanat Telifleri, Şifa & Sezgisel Yatırım Portföyü',
    category: 'Şifa & Danışmanlık',
    explanation: '2. Evinizdeki Balık burcu; rasyonel piyasaların göremediği sezgisel dalgaları önceden hissetme, sanatsal yapıtlar, manevi/şifa projeleri ve vizyoner ortaklıklarla beklenmedik büyük zenginliklere ulaşacağınızı belgeler.',
    roles: ['Sanat & Müzik Telif Hakları', 'Holistik Sağlık Hizmetleri Geliri', 'Sezgisel Piyasa Yatırımları', 'Sinematik & Edebi Projeler']
  }
};

// 4. SATÜRN KARİYER İMTİHANI (12 BURÇ İÇİN ÖZGÜN VE DERİN METİNLER)
const SATURN_DISCIPLINE_GUIDANCE: Record<string, string> = {
  'Koç': 'Satürn haritanızda Koç burcundadır. Kariyer sınavınız: Fevri aceleciliği yenmek, ilk zorlukta öfkeyle projeyi terk etmemek ve sabırla inisiyatif alarak kendi olgun liderliğinizi inşa etmektir.',
  'Boğa': 'Satürn haritanızda Boğa burcundadır. Kariyer sınavınız: Maddi güvensizlik ve kıtlık korkusuyla konfor alanına saplanıp kalmamak, parayı biriktirmekten öte değer üreten cesur projelere kanalize etmektir.',
  'İkizler': 'Satürn haritanızda İkizler burcundadır. Kariyer sınavınız: Onlarca yarım fikir arasında dağılmayı bırakıp, tek bir alanda uzmanlaşarak zihninizi disipline etmek ve derin bilgi otoritesi olmaktır.',
  'Yengeç': 'Satürn haritanızda Yengeç burcundadır. Kariyer sınavınız: İş hayatında duygusal alınganlıkları, küskünlükleri ve güven krizlerini aşarak profesyonel sınırları olgunlukla çizmeyi öğrenmektir.',
  'Aslan': 'Satürn haritanızda Aslan burcundadır. Kariyer sınavınız: Egoyu ve alkış bağımlılığını geride bırakıp, takdir edilmeseniz bile sahada gerçek bir liyakat ve ustalık sergileyerek gerçek saygınlığı kazanmaktır.',
  'Başak': 'Satürn haritanızda Başak burcundadır. Kariyer sınavınız: Yıpratıcı mükemmeliyetçiliği, aşırı eleştirelliği ve detaylarda boğulup projeleri geciktirme alışkanlığını esneklikle dengelemektir.',
  'Terazi': 'Satürn haritanızda Terazi burcundadır (Yücelim konumu). Kariyer sınavınız: Kararsızlıktan kurtulmak, başkalarını memnun etmek uğruna kendi hakkınızı feda etmemek ve adil sözleşmeler yapmaktır.',
  'Akrep': 'Satürn haritanızda Akrep burcundadır. Kariyer sınavınız: Aşırı şüphecilik, güç savaşları ve kontrol saplantısını bırakıp, kriz anlarında etik ve şeffaf dönüşüm liderliği sergilemektir.',
  'Yay': 'Satürn haritanızda Yay burcundadır. Kariyer sınavınız: Aşırı iyimserlikle gerçekçi olmayan hayallere kapılmamak, felsefi vizyonunuzu somut ve uygulanabilir bir akademik/ticari temele oturtmaktır.',
  'Oğlak': 'Satürn haritanızda Oğlak burcundadır (Kendi yöneticisi). Kariyer sınavınız: Aşırı katılık, duygusuzlaşma ve işkoliklik tuzağına düşmeden, basamakları hak ederek ve etik değerlerle tırmanmaktır.',
  'Kova': 'Satürn haritanızda Kova burcundadır. Kariyer sınavınız: Kibirli bir fildişi kuleye çekilmeden, marjinal fikirlerinizi toplumun anlayacağı pratik teknolojik ve kurumsal faydalara dönüştürmektir.',
  'Balık': 'Satürn haritanızda Balık burcundadır. Kariyer sınavınız: Kurban psikolojisi, hayalperestlik ve gerçeklerden kaçma eğilimini aşarak, sezgilerinizi elle tutulur disiplinli sanat veya şifa projelerine demirlemektir.'
};

// 5. MARS İŞ BİTİRİCİLİK VE EYLEM TARZI (12 BURÇ İÇİN)
const MARS_EXECUTION_STYLES: Record<string, string> = {
  'Koç': 'Mars kendi burcunda (Koç): İş hayatında doğrudan, korkusuz, anında aksiyon alan ve ilk darbeyi vuran müthiş bir girişim gücüne sahipsiniz. Kararlarınız saniyeler içinde eyleme döner.',
  'Boğa': 'Mars Boğa: Ağır ama durdurulamaz bir iş bitiricilik. Bir hedefe kitlendiğinizde yavaş ilerlersiniz ancak hiçbir engel sizi yolunuzdan döndüremez; başladığınız işi mutlaka bitirirsiniz.',
  'İkizler': 'Mars İkizler: Zihinsel hız ve çoklu görev gücü. Aynı anda beş koldan iletişim kurar, acil krizleri telefonla ve ikna kabiliyetinizle birkaç dakikada çözüme kavuşturursunuz.',
  'Yengeç': 'Mars Yengeç: Koruyucu ve stratejik savunma tarzı. Projelerinizi ve ekibinizi tehlikelere karşı sezgisel olarak korur, doğrudan saldırmak yerine dolaylı ve akılcı manevralarla ilerlersiniz.',
  'Aslan': 'Mars Aslan: Asil, cömert ve sahneyi ele geçiren liderlik. Eylemleriniz görkemlidir; ekibinize ilham vererek onları arkanızdan sürüklersiniz, sıradan işler motivasyonunuzu kırar.',
  'Başak': 'Mars Başak: Cerrahi titizlik ve metodik eylem. İş yaparken hata payını sıfıra indirir, en karmaşık analizleri adım adım uygulayarak kusursuz operasyonlar yürütürsünüz.',
  'Terazi': 'Mars Terazi: Diplomatik müzakere ve stratejik ittifak. Sert güç kullanmak yerine zarafetle, tarafları masaya oturtarak ve zekice dengeler kurarak hedeflerinize ulaşırsınız.',
  'Akrep': 'Mars Akrep: Sessiz, derinden ve öldürücü hassasiyette stratejik eylem. Rakipleriniz hamlenizi ancak iş bittiğinde anlar; krizleri soğukkanlılıkla fırsata çevirirsiniz.',
  'Yay': 'Mars Yay: Yüksek idealler uğruna cesur keşif ve büyük hamleler. Yerel riskleri göz ardı eder, küresel vizyonla büyük pazarlara açılır ve coşkunuzla engelleri aşarsınız.',
  'Oğlak': 'Mars Oğlak (Yücelim konumu): Zodyakın en etkili iş bitirici gücü. Duyguları işe karıştırmaz, soğukkanlı bir stratejist gibi hedefe adım adım ilerler ve mutlaka zirveye ulaşırsınız.',
  'Kova': 'Mars Kova: Sıra dışı inovasyon ve kural tanımaz yaratıcılık. Geleneksel yöntemleri çöpe atar, yeni teknolojiler ve devrimci yöntemlerle sistemi baştan kurgularsınız.',
  'Balık': 'Mars Balık: Sezgisel akış ve empatik manevra. Katı planlar yerine şartların getirdiği akışa göre esner, insan psikolojisini okuyarak görünmeyen kanallardan başarıya ulaşırsınız.'
};

// 6. HUMAN DESIGN PROFİL VE İŞ HAYATI ROLÜ
const HD_PROFILE_ROLES: Record<string, string> = {
  '1/3': '1/3 Profili (Araştırmacı / Deneyci): İş hayatında sağlam bilgi temeli kurmadan adım atmazsınız. Hataları ve aksaklıkları bizzat deneyerek çözer, sistemin en güvenilir kalite denetçisi olursunuz.',
  '1/4': '1/4 Profili (Araştırmacı / Fırsatçı Networker): Kendi alanınızda derinleşir ve kariyer sıçramalarınızı yakın dost çevreniz ve sadık profesyonel ağınız üzerinden gerçekleştirirsiniz.',
  '2/4': '2/4 Profili (Doğal Yetenek / Networker): Doğuştan gelen zahmetsiz bir yeteneğiniz vardır. Kendi halinizdeyken çevreniz sizi fark eder ve kariyer fırsatları tanıdıklarınız aracılığıyla kapınızı çalar.',
  '2/5': '2/5 Profili (Doğal Yetenek / Pratik Kurtarıcı): Kriz anlarında pratik ve şaşırtıcı çözümler üretirsiniz. Şirketler veya ekipler dara düştüğünde sizi çağırır ve olağanüstü sonuçlar beklentisiyle gelirler.',
  '3/5': '3/5 Profili (Kaşif / Evrensel Kurtarıcı): İş hayatının gerçek bir problem çözücüsüsünüz. Neyin çalışıp neyin çalışmadığını deneme-yanılmayla en hızlı siz görür, krizdeki projeleri ayağa kaldırırsınız.',
  '3/6': '3/6 Profili (Kaşif / Rol Model): Yaşamınızın ilk yarısında yoğun deneyimler yaşar, 50 yaş sonrasında ise sektörün bilge lideri ve genç nesillere yol gösteren tecrübeli rol modeli olursunuz.',
  '4/6': '4/6 Profili (Ağ Kurucu / Rol Model): Güvenilir bir dost ve geniş kitleleri birleştiren bir köprü figürsünüz. Liderliğiniz agresif baskıyla değil, güven ve ilham veren duruşunuzla gerçekleşir.',
  '4/1': '4/1 Profili (Köprü / Sabit Temel): Sarsılmaz kişisel ilkeleriniz ve sadık bir çevreniz vardır. Kendi bildiğiniz kuraldan şaşmadan, çevrenize sağlam bir dayanak noktası olursunuz.',
  '5/1': '5/1 Profili (Vizyoner Kurtarıcı / Araştırmacı): Yüksek beklentilerin odak noktasısınız. İnsanlar pratik çözümler için size güvenir; sağlam araştırma yaptığınız sürece her şirketi zirveye taşırsınız.',
  '5/2': '5/2 Profili (Kurtarıcı / İnzivadaki Deha): Kendi kabuğunuzda ustalaşırken, kriz anlarında çağrıldığınızda mucizevi çözümler üretir ve projeleri başarıyla tamamlarsınız.',
  '6/2': '6/2 Profili (Rol Model / Doğal Yetenek): Sektörün yüksekten gözlemleyen saygın bilgesisiniz. İnsanlar doğal zarafetinize ve tarafsız etik vizyonunuza hayran kalarak fikirlerinize danışır.',
  '6/3': '6/3 Profili (Rol Model / Kaşif): Hem hayatın tozunu yutmuş pratik bir uzman hem de geleceği gören saygın bir rehbersiniz. Dönüşüm gerektiren şirketlerin en büyük kurtarıcısısınız.'
};

// 7. HUMAN DESIGN OTORİTE TAKTİĞİ
const HD_AUTHORITY_TACTICS: Record<string, string> = {
  'Duygusal': 'Duygusal Otorite: Anlık heyecanla asla sözleşme imzalamayın veya ortaklık kabul etmeyin. Duygusal dalganızın durulması için en az 1 gece uyuyun; dingin kafayla verilen karar mutlak başarı getirir.',
  'Sakral': 'Sakral Otorite: Zihninizin mantıksal hesaplarına değil, karnınızdan gelen anlık "hı-hı" (evet) veya "ı-ıh" (hayır) sesine güvenin. İçiniz heyecan duymuyorsa o teklifi hemen reddedin.',
  'Dalak': 'Dalak Otoritesi: Anlık sezgilerinize kulak verin. İlk saniyede içinize sinmeyen bir iş ortağı veya teklif olursa mantığınız ne derse desin uzak durun; sezgileriniz sizi korur.',
  'Ego': 'Ego (Kalp) Otoritesi: "Bu iş bana gerçekten ne kazandıracak ve itibarımı artıracak mı?" sorusunu dürüstçe sorun. Kalbinizin gerçekten istediği ve iradenizi koyabileceğiniz taahhütlere girin.',
  'G': 'G Merkezi (Kendinden Gelen): Karar vermeden önce güvendiğiniz insanlarla konuşun ve kendi ses tonunuzu dinleyin. Konuşurken ne söylediğinizi duyduğunuz an doğru kararı vermiş olacaksınız.',
  'Çevresel': 'Çevresel / Zihinsel Otorite: Fiziksel çevrenizi değiştirin. Doğru mekanlarda ve kaliteli ortamlarda bulunduğunuzda aklınız berraklaşır; kararları dış ortamın getirdiği tarafsızlıkla verin.',
  'Ay': 'Ay Otoritesi: Büyük kariyer adımları için Ay’ın 28 günlük döngüsünü tamamlayın. Ay farklı burçlardan geçerken teklifi tüm yönleriyle tartın ve döngü sonunda netleşin.'
};

export class CareerEngine {
  public static async analyze(
    fullName: string,
    birthDate: string,
    birthTime: string,
    birthCity: AstroCity
  ): Promise<CareerAnalysisResult> {
    // 1. Astroloji Haritası Hesapla
    const m = moment.tz(`${birthDate} ${birthTime || '12:00'}`, birthCity.tz || 'Europe/Istanbul');
    const dateObj = m.toDate();

    const chart = await generateAstrologyChart(dateObj, birthCity);

    // 10. Ev MC
    const mcSign = chart.midheaven.sign;
    const mcDegree = Math.round(chart.midheaven.degreeInSign);
    const mcData = MC_SECTOR_DATA[mcSign] || MC_SECTOR_DATA['Oğlak'];

    // 6. Ev (Ev çizgisi indeksi 5)
    const house6 = chart.houses[5];
    const house6Sign = house6 ? house6.sign : 'Başak';
    const house6Text = HOUSE6_INTERPRETATIONS[house6Sign] || HOUSE6_INTERPRETATIONS['Başak'];

    // 2. Ev (Ev çizgisi indeksi 1)
    const house2 = chart.houses[1];
    const house2Sign = house2 ? house2.sign : 'Boğa';
    const house2Data = HOUSE2_SECTOR_DATA[house2Sign] || HOUSE2_SECTOR_DATA['Boğa'];

    // Satürn ve Mars
    const saturn = chart.planets.find(p => p.name === 'Satürn') || { sign: 'Oğlak', house: 10 };
    const mars = chart.planets.find(p => p.name === 'Mars') || { sign: 'Koç', house: 1 };

    const saturnAdvice = SATURN_DISCIPLINE_GUIDANCE[saturn.sign] || `Satürn haritanızda ${saturn.sign} burcunda (${saturn.house}. Ev); kariyerinizde sabır, liyakat ve uzun vadeli disiplin sınavlarınızı temsil eder.`;
    const marsStyle = MARS_EXECUTION_STYLES[mars.sign] || `Mars'ın ${mars.sign} burcundaki pozisyonu (${mars.house}. Ev), iş hayatında kararları hızla hayata geçirme üslubunuzu gösterir.`;

    // 2. Numeroloji Hesapla
    const nameAnalysis = calculateNameAnalysis(fullName);
    const lifePathAnalysis = calculateLifePath(birthDate);

    const destinyNum = nameAnalysis.destiny;
    const destinyInfo = numerologyData[destinyNum] || numerologyData[1];
    const destinySector = DESTINY_SECTOR_DATA[destinyNum] || DESTINY_SECTOR_DATA[1];

    const lifePathNum = lifePathAnalysis.number;
    const lifePathInfo = numerologyData[lifePathNum] || numerologyData[1];

    // 3. Human Design Hesapla
    let hdChart: HumanDesignChart | null = null;
    try {
      hdChart = generateChart(dateObj);
    } catch {
      hdChart = null;
    }

    const hdType = hdChart ? hdChart.type : 'Jeneratör';
    const hdProfile = hdChart ? hdChart.profile : '1/3';
    const hdStrategy = hdChart ? hdChart.strategy : 'Yanıt Vermek';
    const hdAuthority = hdChart ? hdChart.authority : 'Sakral Otorite';

    const profileWorkRole = HD_PROFILE_ROLES[hdProfile] || `İş hayatında ${hdProfile} profilinizin getirdiği deneyim ve uzmanlık senteziyle doğal bir otorite kurarsınız.`;
    
    // Otorite anahtar tespiti
    let authorityTacticKey = 'Sakral';
    if (hdAuthority.includes('Duygusal')) authorityTacticKey = 'Duygusal';
    else if (hdAuthority.includes('Dalak')) authorityTacticKey = 'Dalak';
    else if (hdAuthority.includes('Ego') || hdAuthority.includes('Kalp')) authorityTacticKey = 'Ego';
    else if (hdAuthority.includes('G')) authorityTacticKey = 'G';
    else if (hdAuthority.includes('Zihinsel') || hdAuthority.includes('Çevresel')) authorityTacticKey = 'Çevresel';
    else if (hdAuthority.includes('Ay') || hdAuthority.includes('Reflektör')) authorityTacticKey = 'Ay';
    const authorityTactic = HD_AUTHORITY_TACTICS[authorityTacticKey] || HD_AUTHORITY_TACTICS['Sakral'];

    let hdCareerDynamic = '';
    if (hdType === 'Jeneratör' || hdType === 'Manifesting Jeneratör') {
      hdCareerDynamic = 'Tükenmeden ve tutkuyla çalışabileceğiniz, sevdiğiniz işlerde sürdürülebilir enerji üreten bir ustasınız. Projelere sadece zihninizle değil, sakral içsel heyecanınızla "evet" dediğinizde başarı kaçınılmazdır.';
    } else if (hdType === 'Projektör') {
      hdCareerDynamic = 'Siz saatlerce amele gibi çalışmak için değil; sistemleri, insanları ve enerjiyi yüksekten yönetmek, danışmanlık vermek ve vizyon göstermek için buradasınız. Davet edildiğiniz ve değerinizin bilindiği ortamlarda parlayacaksınız.';
    } else if (hdType === 'Manifestör') {
      hdCareerDynamic = 'Siz başlatıcısınız. Yeni sektörler açmak, kimsenin cesaret edemediği projeleri tetiklemek ve emir almadan özerk liderlik yapmak sizin doğal yapınızdır. İlerlemeden önce ekibi bilgilendirmeniz dirençleri kırar.';
    } else {
      hdCareerDynamic = 'Siz kolektif sistemlerin aynası ve denetçisisiniz. Bir şirketin veya ekibin nereye gittiğini en tarafsız şekilde hisseder, uzun vadeli vizyon değerlendirmelerinde eşsiz bir danışman rolü üstlenirsiniz.';
    }

    // 4. BÜYÜK SENTEZ & 3 TAMAMEN AYRIŞTIRILMIŞ VE ÖZGÜN SEKTÖR KARTI
    const topSectors: CareerSectorMatch[] = [
      {
        title: mcData.title,
        category: mcData.category,
        fitScore: 96,
        recommendedRoles: mcData.roles,
        description: mcData.cardExplanation
      },
      {
        title: destinySector.title,
        category: destinySector.category,
        fitScore: 89,
        recommendedRoles: destinySector.roles,
        description: destinySector.explanation
      },
      {
        title: house2Data.title,
        category: house2Data.category,
        fitScore: 84,
        recommendedRoles: house2Data.roles,
        description: house2Data.explanation
      }
    ];

    // İdeal Çalışma Modeli
    let idealModelType: 'Girişimci & Bağımsız Kurucu' | 'Kurumsal Lider & Üst Yönetici' | 'Stratejik Rehber & Danışman' | 'Özerk Uzman & Zanaatkar' = 'Girişimci & Bağımsız Kurucu';
    let idealModelExp = '';
    let idealPercent = 90;

    if (['Koç', 'Yay', 'Kova'].includes(mcSign) || hdType === 'Manifestör' || destinyNum === 1 || destinyNum === 5) {
      idealModelType = 'Girişimci & Bağımsız Kurucu';
      idealModelExp = `10. Evinizdeki ${mcSign} öncü ateşi ve ${destinyNum} Kader Sayınızın dinamizmi gereği; başkalarının katı hiyerarşisi altında çalışmak potansiyelinizi sınırlar. Kendi kurallarınızı koyduğunuz bağımsız girişimler veya start-up yapıları sizin kadersel doyum alanınızdır.`;
      idealPercent = 95;
    } else if (['Oğlak', 'Aslan', 'Boğa'].includes(mcSign) || destinyNum === 8 || destinyNum === 4 || destinyNum === 22) {
      idealModelType = 'Kurumsal Lider & Üst Yönetici';
      idealModelExp = `10. Evinizdeki ${mcSign} otoritesi ve ${destinyNum} Kader Sayınızın inşa gücü; büyük bütçeleri, insan kaynaklarını ve sağlam holding mekanizmalarını yönetebilecek üst düzey bir icra kurulu liderliği potansiyeli taşır.`;
      idealPercent = 93;
    } else if (hdType === 'Projektör' || ['Terazi', 'İkizler', 'Balık'].includes(mcSign) || destinyNum === 2 || destinyNum === 7 || destinyNum === 11) {
      idealModelType = 'Stratejik Rehber & Danışman';
      idealModelExp = `Human Design ${hdType} enerjiniz ve ${mcSign} MC bilgeliğiniz; operasyonel angaryalardan uzaklaşıp üst düzey kurumlara, liderlere veya bireylere stratejik yol haritası çizdiğiniz uzman danışmanlık modelinde zirve yapar.`;
      idealPercent = 91;
    } else {
      idealModelType = 'Özerk Uzman & Zanaatkar';
      idealModelExp = `10. Evinizdeki ${mcSign} mükemmeliyetçiliği ve ${destinyNum} titreşiminiz; kendi alanında en derin bilgiye sahip, teknik veya sanatsal zanaatıyla aranılan ve standartlarını kendisi belirleyen özerk bir çalışma biçimini işaret eder.`;
      idealPercent = 88;
    }

    // Kişiye Özel Dinamik Süper Güç
    const superPower = generateDynamicSuperPower(mcSign, destinyNum, hdType);

    // Kişiye Özel Dinamik Gölge Tuzaklar
    const shadowPitfalls = generateDynamicShadowPitfall(mcSign, destinyNum, saturn.sign, hdType);

    // Tamamen Dinamik 4 Kadersel Tavsiye
    const mcAdvice = MC_ACTION_GUIDANCE[mcSign] || MC_ACTION_GUIDANCE['Oğlak'];
    const hdAdvice = HD_ACTION_GUIDANCE[hdType] || HD_ACTION_GUIDANCE['Jeneratör'];
    const destinyAdvice = DESTINY_ACTION_GUIDANCE[destinyNum] || (destinyInfo.constructivePotentials ? `Kader Sayınız (${destinyNum}): ${destinyInfo.constructivePotentials}` : 'Kader sayınız gereği etik gücünüzü ve vizyonunuzu ortaya koyun.');
    const house2Advice = HOUSE2_ACTION_GUIDANCE[house2Sign] || HOUSE2_ACTION_GUIDANCE['Boğa'];

    const actionableGuidance = [
      mcAdvice,
      hdAdvice,
      destinyAdvice,
      house2Advice
    ];

    return {
      personalInfo: {
        fullName,
        birthDate,
        birthTime: birthTime || '12:00',
        cityName: birthCity.name
      },
      astrology: {
        mcSign,
        mcDegree,
        mcTitle: mcData.title,
        mcInterpretation: mcData.desc,
        house6Sign,
        house6Interpretation: house6Text,
        house2Sign,
        house2WealthKey: house2Data.explanation,
        saturnPlacement: `${saturn.sign} (${saturn.house}. Ev)`,
        saturnDisciplineAdvice: saturnAdvice,
        marsPlacement: `${mars.sign} (${mars.house}. Ev)`,
        marsExecutionStyle: marsStyle
      },
      numerology: {
        destinyNumber: destinyNum,
        destinyTitle: destinyInfo.title,
        destinyCareerAdvice: destinySector.explanation,
        lifePathNumber: lifePathNum,
        lifePathVision: lifePathInfo.lifePathDetails || '',
        soulUrgeNumber: nameAnalysis.soulUrge,
        innerDrive: (numerologyData[nameAnalysis.soulUrge] || destinyInfo).soulUrgeDetails || ''
      },
      humanDesign: {
        type: hdType,
        profile: hdProfile,
        profileWorkRole,
        workStrategy: hdStrategy,
        decisionAuthority: hdAuthority,
        authorityTactic,
        careerDynamic: hdCareerDynamic
      },
      synthesis: {
        idealWorkModel: {
          type: idealModelType,
          percentage: idealPercent,
          explanation: idealModelExp
        },
        superPower,
        shadowPitfalls,
        topSectors,
        actionableGuidance
      }
    };
  }
}

function generateDynamicSuperPower(mcSign: string, destinyNum: number, hdType: string): string {
  const mcPowers: Record<string, string> = {
    'Koç': 'krizlerde ilk adımı atıp öncülük etme cesareti',
    'Boğa': 'sarsılmaz güvenilirlik ve kalıcı somut değer inşa etme dehası',
    'İkizler': 'hızlı bilgi sentezi, çoklu ağlar kurma ve ikna kabiliyeti',
    'Yengeç': 'derin duygusal sezgi, sadakat yaratma ve koruyucu liderlik',
    'Aslan': 'doğal karizma, sahne ışıltısı ve kitlelere ilham verme gücü',
    'Başak': 'kusursuz detay hakimiyeti, analitik zeka ve süreç optimizasyonu',
    'Terazi': 'çatışan tarafları uzlaştıran diplomatik zarafet ve estetik vizyon',
    'Akrep': 'krizleri fırsata çeviren stratejik derinlik ve dönüşüm gücü',
    'Yay': 'sınır tanımayan küresel vizyon ve büyük resmi felsefi kavrayış',
    'Oğlak': 'çelik gibi disiplin, sabırlı strateji ve kalıcı otorite kurma yeteneği',
    'Kova': 'kalıpların ötesine geçen devrimci inovasyon ve geleceği okuma sezgisi',
    'Balık': 'mantık sınırlarını aşan yaratıcı ilham ve empatik şifa vizyonu'
  };

  const destinyPowers: Record<number, string> = {
    1: 'kendi bağımsız yolunu açan öncü irade',
    2: 'kusursuz diplomatik uyum ve sezgisel denge',
    3: 'insanları peşinden sürükleyen ifade ve sanatsal çekim',
    4: 'sağlam temeller atan metodik inşa gücü',
    5: 'hızlı adapte olan dinamik dönüşüm zekası',
    6: 'yüksek sorumluluk ve güven veren koruyuculuk',
    7: 'derin bilgiye ve hakikate ulaşan analitik bilgelik',
    8: 'maddi ve kurumsal gücü yöneten stratejik liderlik',
    9: 'kolektif dönüşüm yaratan evrensel vizyon',
    11: 'karanlıkta yol gösteren yüksek sezgisel ışık',
    22: 'büyük hayalleri dünya maddesine indiren usta mimarlık',
    33: 'toplumu yücelten evrensel şefkat ve adanmışlık'
  };

  const power1 = mcPowers[mcSign] || 'stratejik liderlik';
  const power2 = destinyPowers[destinyNum] || 'özgün yetenek';

  return `10. Evinizdeki ${mcSign} Tepe Noktasının getirdiği "${power1}" ile ${destinyNum} Kader Sayınızın sağladığı "${power2}" birleşiyor. Human Design ${hdType} doğanızla birleştiğinde en kaotik iş ortamlarında bile doğru rotayı çizip ekibinizi zirveye taşıma kabiliyetine sahipsiniz.`;
}

function generateDynamicShadowPitfall(mcSign: string, destinyNum: number, saturnSign: string, hdType: string): string {
  const mcShadows: Record<string, string> = {
    'Koç': 'sabırsızlık ve fevri çıkışlarla köprüleri erken yakmak',
    'Boğa': 'değişime ve inovasyona aşırı direnç gösterip konfor tuzağına saplanmak',
    'İkizler': 'aşırı bölünerek projeleri yarım bırakmak ve yüzeyselleşmek',
    'Yengeç': 'iş ilişkilerini aşırı kişiselleştirip alınganlık ve küskünlük geliştirmek',
    'Aslan': 'eleştiriye tahammülsüzlük ve egonun takdir edilme bağımlılığı',
    'Başak': 'aşırı detayda boğulup büyük resmi kaçırmak ve aşırı eleştirellik',
    'Terazi': 'kararsızlık yüzünden fırsatları kaçırmak ve sınır çizememek',
    'Akrep': 'aşırı şüphecilik, paranoya ve gücü elde tutmak için gizli manipülasyon',
    'Yay': 'aşırı iyimserlikle riskleri hafife almak ve detayları küçümsemek',
    'Oğlak': 'aşırı katılık, duyguları tamamen bastırıp işkoliklik batağına düşmek',
    'Kova': 'kibirli bir fildişi kuleye çekilip ekiple duygusal teması koparmak',
    'Balık': 'sınır koyamamak, kurban rolüne bürünmek ve gerçeklerden kaçmak'
  };

  const shadow = mcShadows[mcSign] || 'erken vazgeçmek';

  return `Kariyerinizdeki en büyük gölge tuzak: 10. Ev ${mcSign} temelli "${shadow}". Ayrıca haritanızdaki ${saturnSign} Satürn sınavı gereği, kısa vadeli kolay kazançlara kapılmamalı; itibarınızı zedeleyecek aceleci hamlelerden uzak durmalısınız. ${hdType} stratejinizden koptuğunuzda tükenmişlik (burnout) riski tetiklenir.`;
}

// 6. Ev (Çalışma Ortamı)
const HOUSE6_INTERPRETATIONS: Record<string, string> = {
  'Koç': 'Hızlı tempolu, sürekli dinamizm gerektiren, bireysel kararlar alabildiğiniz ve rekabetin canlı olduğu ortamlarda en yüksek verime ulaşırsınız.',
  'Boğa': 'Huzurlu, ergonomik, estetik açıdan hoş ve plansız ani baskıların olmadığı stabil bir çalışma ortamında harikalar yaratırsınız.',
  'İkizler': 'Çoklu ekranların, hareketliliğin, beyin fırtınalarının ve esnek çalışma saatlerinin olduğu dijital veya hibrit ortamlarda parlarsınız.',
  'Yengeç': 'Ekip üyeleriyle güven bağı kurabildiğiniz, duygusal olarak desteklendiğiniz, samimi ve butik çalışma alanlarını tercih edersiniz.',
  'Aslan': 'Yaratıcılığınızı sergileyebileceğiniz, takdir edildiğiniz, estetik ve prestijli ofis veya sahne ortamları çalışma enerjinizi katlar.',
  'Başak': 'Organize, temiz, süreçlerin dokümante edildiği ve analitik araçlarla donatılmış tertipli ofis ortamlarında kusursuz çalışırsınız.',
  'Terazi': 'Ahenkli, gürültüden uzak, estetik dekorasyonlu ve işbirlikçi meslektaşlarla dolu diplomatik ortamlarda motivasyonunuz zirveye çıkar.',
  'Akrep': 'Odaklanabileceğiniz, gizliliği olan, derin konsantrasyon gerektiren ve dedikodudan uzak stratejik çalışma alanları sizin içindir.',
  'Yay': 'Seyahat imkanı olan, geniş ufuklu, açık hava veya uluslararası bağlantıları olan özgür çalışma biçimlerinde en verimli halinizdesinizdir.',
  'Oğlak': 'Hiyerarşisi net, sorumlulukların tanımlı olduğu, liyakate dayalı ve profesyonel kurumsal ortamlarda disiplininizle devleşirsiniz.',
  'Kova': 'Katı mesai saatlerinin olmadığı, inovasyonu ödüllendiren, uzaktan/hibrit ve modern teknolojiyle çalışan özgür platformlar sizin alanınızdır.',
  'Balık': 'Baskıcı saatlerin ve katı kuralların olmadığı, sezgilerinize ve yaratıcı ilhamlarınıza izin veren sakin ve ilham verici ortamlarda üretirsiniz.'
};

// 10. Ev MC Burcuna Özel Eylem ve Zirve Taktikleri
const MC_ACTION_GUIDANCE: Record<string, string> = {
  'Koç': '10. Eviniz Koç: Bürokrasi veya başkalarının onayını beklemeyin. Fikrinizi ilk pilot proje olarak hızla sahaya sürün; inisiyatif alıp sonuç ürettiğinizde doğal lider olarak otoriteyi devralırsınız.',
  'Boğa': '10. Eviniz Boğa: Hızlı zenginleşme vadeden spekülatif heveslerden kaçının. Elle tutulur ürünler, gayrimenkul veya nakit akışı düzenli sağlam temellere odaklanarak sarsılmaz bir saygınlık inşa edin.',
  'İkizler': '10. Eviniz İkizler: Fikirlerinizi tek bir kanala hapsetmeyin. Dijital ağları, çoklu medya kanallarını ve köprü kuruculuğunuzu kullanarak bilgiyi dolaşıma sokun; sektörün sözcüsü konumuna gelin.',
  'Yengeç': '10. Eviniz Yengeç: Soğuk kurumsal formaliteler yerine güven ve aidiyet ekosistemi yaratın. Müşterileriniz ve ekibinizle kuracağınız koruyucu sadakat bağı en büyük rekabet avantajınızdır.',
  'Aslan': '10. Eviniz Aslan: Perde arkasında kalarak ışığınızı söndürmeyin. Projelerinizin vitrininde yer alın, sahne konuşmaları yapın ve markanızın bizzat ilham veren vizyoner yüzü olun.',
  'Başak': '10. Eviniz Başak: Kaotik iş süreçlerini saat gibi çalıştıran metodolojiler ve kalite standartları geliştirin. Kimsenin göremediği detayları kusursuzlaştırarak vazgeçilmez bir uzmanlık tescilleyin.',
  'Terazi': '10. Eviniz Terazi: Tek başınıza yük taşımak yerine stratejik ittifaklar kurun. Müzakere masasında iki tarafı da kazandıran diplomatik zarafetinizle en zorlu sözleşmeleri bağlayın.',
  'Akrep': '10. Eviniz Akrep: Yüzeysel işlerle vakit kaybetmeyin. Kriz yönetimi, radikal şirket dönüşümleri, siber güvenlik veya derin araştırma gerektiren kilit düğümleri çözerek vazgeçilmez bir güç odağı olun.',
  'Yay': '10. Eviniz Yay: Yerel sınırları hızla aşın. Uluslararası ticaret, yabancı dil vizyonu, küresel yayıncılık ve büyük resmi gösteren felsefi mentorluk projeleriyle kariyerinizi dünya ölçeğine taşıyın.',
  'Oğlak': '10. Eviniz Oğlak: Kısa vadeli alkışlar yerine 5-10 yıllık stratejik bir zirve planı yapın. Sarsılmaz disiplininiz ve hiyerarşik liderliğinizle zamanın silemeyeceği kalıcı bir miras bırakın.',
  'Kova': '10. Eviniz Kova: Geleneksel mesai ve kalıpları yıkmaktan çekinmeyin. Yapay zeka, yeni nesil dijital topluluklar ve kolektife çağ atlatacak inovatif çözümlerle sektörünüzde devrim başlatın.',
  'Balık': '10. Eviniz Balık: Salt mantığın sınırlarını aşın. Sanat, sinema, psikoloji ve manevi rehberlik kanallarında insanların kalbine dokunan vizyoner projelerle toplumsal ilham kaynağı olun.'
};

// 2. Ev Burcuna Özel Finansal Bereket Modeli
const HOUSE2_ACTION_GUIDANCE: Record<string, string> = {
  'Koç': '2. Eviniz Koç: Hızlı karar alma cesaretiniz ve pazara ilk giren olma cüretiniz en büyük para kaynağınızdır. Tereddüt ettiğinizde kazanç enerjiniz durur; ilk adımı atın.',
  'Boğa': '2. Eviniz Boğa: Somut mülk edinme, bileşik getiri, gayrimenkul ve lüks tasarım varlıkları refah kapınızdır. Parayı harcamak yerine üretken varlıklarda tutarak büyütün.',
  'İkizler': '2. Eviniz İkizler: Bilgi ticareti, danışmanlık, dijital telifler, aracılık ve eğitim içerikleri üzerinden birden fazla dinamik gelir akışı yaratın.',
  'Yengeç': '2. Eviniz Yengeç: Barınma, gayrimenkul, gıda ve insanların duygusal güvenliğini sağlayan butik hizmetlerle para kazanırsınız. Kazancınızı aileniz ve güvenceniz için değerlendirin.',
  'Aslan': '2. Eviniz Aslan: Kişisel markanız, lüks segment ürünler, yaratıcı eserleriniz ve sahne görünürlüğünüz para çeker. Hizmetinizi asla düşük fiyatlandırmayın.',
  'Başak': '2. Eviniz Başak: Yüksek uzmanlık gerektiren analitik zanaat, süreç denetimi, sağlık ve optimizasyon danışmanlığı ile sürdürülebilir yüksek gelir elde edersiniz.',
  'Terazi': '2. Eviniz Terazi: Başarılı ortaklıklar, estetik/tasarım danışmanlığı, hukuk ve aracılık sözleşmeleri zenginlik kapınızdır. Kazancınız denge ve adalete bağlıdır.',
  'Akrep': '2. Eviniz Akrep: Fon yönetimi, krizdeki varlıkları ucuza alıp katlayarak satma, stratejik yatırımlar ve ortak sermaye yönetimi ile büyük paraları yönetirsiniz.',
  'Yay': '2. Eviniz Yay: Yabancı para birimleri, uluslararası e-ticaret, küresel eğitimler ve turizm/yayıncılık bereketi getirir. Vizyonunuzu küresel tutun.',
  'Oğlak': '2. Eviniz Oğlak: Kalıcı yapılar, kurumsal hisseler, uzun vadeli gayrimenkuller ve tepe yönetici primleri ile zamana yenilmeyen bir servet inşa edersiniz.',
  'Kova': '2. Eviniz Kova: Dijital platformlar, yapay zeka araçları, kitle fonlaması ve yenilikçi patentlerle beklenmedik büyük finansal sıçramalar yaparsınız.',
  'Balık': '2. Eviniz Balık: Sezgisel yatırımlar, sanatsal telif hakları, holistik şifa ve insan ruhunu iyileştiren vizyoner projelerle bolluğu hayatınıza çekersiniz.'
};

// Human Design Tipine Göre Karar & İş Stratejisi
const HD_ACTION_GUIDANCE: Record<string, string> = {
  'Jeneratör': 'Human Design Jeneratör: Zihninizin "para için yapmalıyım" baskısına teslim olmayın. Sakral merkezinizin (karnınızın) içtenlikle "evet" dediği işlere odaklanın; sevdiğiniz işte yorulmadan devleşirsiniz.',
  'Manifesting Jeneratör': 'Human Design Manifesting Jeneratör: Aynı anda birkaç kulvarda koşma hakkınız var. Ancak bir adımdan diğerine geçerken ekibinizi ve müşterilerinizi mutlaka "bilgilendirin"; böylece sürtünmeyi yok edersiniz.',
  'Projektör': 'Human Design Projektör: Saatlerce amele gibi beden gücüyle çalışmak doğanıza aykırıdır. Yeteneğinizin tanındığı ve fikrinize resmi "davet" geldiği yönetici, mentor veya sistem danışmanı rollerini seçin.',
  'Manifestor': 'Human Design Manifestor: Kimseden izin veya icazet beklemeyin; siz yeni çağları başlatan öncüsünüz. Sadece aksiyona geçmeden önce etrafınızdakileri "bilgilendirerek" engelleri baştan savın.',
  'Reflektör': 'Human Design Reflektör: Kariyer kararlarını ve ortaklıkları bir gecede vermeyin. Ay’ın 28 günlük döngüsü boyunca farklı insanlarla ve ortamlarda gözlem yaparak tarafsız bilgeliğinizle yön çizin.'
};

// Kader Sayısına Göre Aksiyon
const DESTINY_ACTION_GUIDANCE: Record<number, string> = {
  1: 'Kader Sayınız 1: Takipçi değil kural koyucu olun. Başkalarının çizdiği şablonları uygulamak yerine özgün vizyonunuzla bağımsız projelerin liderliğini üstlenin.',
  2: 'Kader Sayınız 2: Diplomasi ve ortaklık gücünüzü devreye sokun. Çatışmalı ortamlarda arabulucu ve şifacı rolü üstlenerek her iki taraftan da değer üretin.',
  3: 'Kader Sayınız 3: Sahne, söz ve yaratıcı ifade sizin gücünüzdür. Fikirlerinizi mizah, görsel tasarım veya etkileyici bir hitabetle sunarak kitleleri peşinizden sürükleyin.',
  4: 'Kader Sayınız 4: Disiplin ve sağlam yapı kuruculuğunuzu gösterin. Karmaşık süreçleri sistemleştirip denetlenebilir hale getirerek vazgeçilmez bir operasyonel temel olun.',
  5: 'Kader Sayınız 5: Esnek ve uyum sağlayıcı olun. Değişen piyasa koşullarını en hızlı siz koklarsınız; kriz anlarında yeni fırsat kapılarına hızla yönelin.',
  6: 'Kader Sayınız 6: Hizmet kalitesi ve topluluk sorumluluğuna odaklanın. Danışanlarınıza veya müşterilerinize güven veren koruyucu standartlar geliştirin.',
  7: 'Kader Sayınız 7: Derin uzmanlık ve analitik felsefe inşa edin. Yüzeysel piyasa trendlerine kapılmak yerine konunuzun en derin üstadı olarak saygı görün.',
  8: 'Kader Sayınız 8: Büyük bütçeleri, güç dengelerini ve organizasyonel yapıları etik bir şekilde yönetin. Maddi dünyayı manevi sorumlulukla dengeleyin.',
  9: 'Kader Sayınız 9: Kolektife ilham veren küresel misyonlar üstlenin. Sadece kişisel çıkar için değil, dünyada kalıcı bir dönüşüm bırakacak projeleri seçin.',
  11: 'Kader Sayınız 11 (Üstat Sezgi): Yüksek sezgisel vizyonunuzu profesyonel hayata entegre edin; insanlara yol gösteren kadersel bir ilham meşalesi olun.',
  22: 'Kader Sayınız 22 (Üstat Mimar): Büyük idealleri somut dünya gerçekliğine indirin; uluslararası ölçekte kalıcı kurumlar ve yapılar inşa edin.',
  33: 'Kader Sayınız 33 (Üstat Şifacı): Yüksek fedakarlık ve şefkatle insanlığın acılarını dindiren, etik standartları en tepeye koyan projelerde liderlik edin.'
};
