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
  summaryBadges: {
    leadershipStyle: string;
    workDynamic: string;
    coreAsset: string;
    decisionMotto: string;
  };
  idealWorkModel: {
    type: 'Girişimci & Bağımsız Kurucu' | 'Kurumsal Lider & Üst Yönetici' | 'Stratejik Rehber & Danışman' | 'Özerk Uzman & Zanaatkar';
    percentage: number;
    explanation: string;
  };
  superPower: string;
  shadowPitfalls: string;
  topSectors: CareerSectorMatch[];
  actionableGuidance: string[];
}

// 1. ZİRVEYİ TEMSİL EDEN SEKTÖR VERİLERİ (Teknik jargondan arındırılmış)
const MC_SECTOR_DATA: Record<string, {
  title: string;
  category: CareerSectorMatch['category'];
  cardExplanation: string;
  roles: string[];
  leadershipStyle: string;
}> = {
  'Koç': {
    title: 'Öncü Girişimci ve Kriz Lideri',
    category: 'Liderlik & Girişim',
    cardExplanation: 'Piyasada kimsenin cesaret edemediği ilk adımları atma, yenilikçi projeleri başlatma ve rekabetçi ortamda öncü olarak liderliği üstlenme potansiyelinizi temsil eder.',
    roles: ['Start-up Kurucusu', 'Kriz Yöneticisi', 'Proje Lideri', 'Operasyonel Direktör', 'Performans Mentoru'],
    leadershipStyle: 'Cesur, Hızlı & İnisiyatif Sahibi'
  },
  'Boğa': {
    title: 'Kalıcı Değer Mimarı ve Finans Direktörü',
    category: 'Finans & Strateji',
    cardExplanation: 'Somut varlıklar, güvenli sermaye yönetimi, gayrimenkul ve yüksek estetik kalitesi olan alanlarda zamana meydan okuyan saygın bir miras yaratma gücünüzü gösterir.',
    roles: ['Varlık & Portföy Yöneticisi', 'Gayrimenkul Geliştirici', 'Lüks Marka Direktörü', 'Sürdürülebilir Üretim Yatırımcısı', 'Değerleme Uzmanı'],
    leadershipStyle: 'Güvenilir, Sabırlı & Kalıcı Varlık Odaklı'
  },
  'İkizler': {
    title: 'Çok Kanallı Medya ve İletişim Ağı Mimarı',
    category: 'Sanat & İletişim',
    cardExplanation: 'Bilgiyi hızla sentezleyip kitlelere aktarma, dijital yayıncılık, birden fazla iş kolunu eşzamanlı yönetme ve sektörler arası stratejik köprüler kurma kabiliyetinizi ifade eder.',
    roles: ['Dijital Yayıncı & Yazar', 'Medya Direktörü', 'İletişim & PR Stratejisti', 'Piyasa & Veri Analisti', 'Teknoloji Ticareti Danışmanı'],
    leadershipStyle: 'Çok Yönlü, Hızlı & İkna Kabiliyeti Yüksek'
  },
  'Yengeç': {
    title: 'Topluluk Rehberi ve Kurumsal Sadakat Mimarı',
    category: 'Şifa & Danışmanlık',
    cardExplanation: 'Çalışma ortamında ve müşteri ilişkilerinde sarsılmaz bir güven bağı kurma, insanların derin ihtiyaçlarını karşılama ve koruyucu yönetim anlayışıyla saygınlık kazanma gücünüzü simgeler.',
    roles: ['İnsan Kaynakları Direktörü', 'Klinik Psikolog & Başdanışman', 'Butik İşletme Kurucusu', 'Kültürel Miras Yöneticisi', 'Sosyal Sorumluluk Lideri'],
    leadershipStyle: 'Empatik, Koruyucu & Yüksek Sadakat Yaratan'
  },
  'Aslan': {
    title: 'Karizmatik Direktör ve Sahne Lideri',
    category: 'Liderlik & Girişim',
    cardExplanation: 'Doğal bir vitrin ve marka yüzü olma, yaratıcı endüstrilerde en üst düzey yönetici unvanlarını taşıma ve projeleri görkemli başarı hikayelerine dönüştürme gücünüzü açığa çıkarır.',
    roles: ['Üst Düzey Yönetici (C-Level)', 'Kreatif Direktör', 'Yapımcı & Sahne Sanatları Lideri', 'Lüks Marka Temsilcisi', 'İlham Verici Konuşmacı'],
    leadershipStyle: 'Vizyoner, Karizmatik & İlham Verici'
  },
  'Başak': {
    title: 'Süreç Optimizatörü ve Sistem Mimarı',
    category: 'Organizasyon & Sistem',
    cardExplanation: 'Karmaşık operasyonları kusursuzlaştırma, veri ve kalite güvence altyapısı kurma ve teknik ustalığınızla sektörün en güvenilir referans noktası olma dehanızı temsil eder.',
    roles: ['Sistem & Kalite Mimarı', 'Yazılım & Altyapı Denetçisi', 'Süreç Optimizasyon Danışmanı', 'Finansal Denetim Direktörü', 'Stratejik Operasyon Müdürü'],
    leadershipStyle: 'Metodik, Kusursuz Detay Hakimiyeti & Çözümcü'
  },
  'Terazi': {
    title: 'Uluslararası Arabulucu ve Diplomatik Stratejist',
    category: 'Sanat & İletişim',
    cardExplanation: 'En çetrefilli müzakereleri anlaşmayla sonuçlandırma, üst düzey ortaklıklar inşa etme ve estetik vizyonunuzla prestijli kurumları temsil etme kabiliyetinizi parlatır.',
    roles: ['Kurumsal Arabulucu & Hukuk Müşaviri', 'Diplomat & Uluslararası Temsilci', 'Sanat Küratörü & İç Mimar', 'Stratejik Ortaklıklar Direktörü', 'Tasarım & Marka Yöneticisi'],
    leadershipStyle: 'Diplomatik, Adil & Ortaklık Kurucu'
  },
  'Akrep': {
    title: 'Stratejik Kriz Yöneticisi ve Derin Dönüşüm Lideri',
    category: 'Finans & Strateji',
    cardExplanation: 'Tıkanmış veya batmakta olan yapıları yeniden canlandırma, büyük fonları stratejik gizlilikle yönetme ve kritik sektörlerde vazgeçilmez bir güç odağı olma kapasitenizi anlatır.',
    roles: ['Girişim Sermayesi (VC) Lideri', 'Siber Güvenlik & Risk Danışmanı', 'Şirket Yeniden Yapılandırma Uzmanı', 'Stratejik Danışman', 'Derin Terapist & Psikiyatrist'],
    leadershipStyle: 'Soğukkanlı, Kriz Çözücü & Stratejik'
  },
  'Yay': {
    title: 'Global Vizyoner, Felsefi Mentor ve Keşifçi',
    category: 'Global Vizyon & Akademi',
    cardExplanation: 'Yerel sınırların ötesine geçerek uluslararası ticaret, yüksek akademi, global yayıncılık ve kitlelere yol gösteren felsefi danışmanlıkta kadersel söz sahibi olduğunuzu belgeler.',
    roles: ['Uluslararası Ticaret Direktörü', 'Akademisyen & Enstitü Yöneticisi', 'Global Yayıncı & Yazar', 'Uluslararası Danışman', 'Kurumsal Filozof & Stratejist'],
    leadershipStyle: 'Geniş Ufuklu, Global & İlham Veren'
  },
  'Oğlak': {
    title: 'Kurumsal Zirve Mimarı ve Otorite Figürü',
    category: 'Liderlik & Girişim',
    cardExplanation: 'Basamakları sabırla tırmanıp en tepe icra makamlarına oturma, büyük holdingleri veya kurumları sarsılmaz bir liyakatle yönetme ve kalıcı anıtlar bırakma gücünüzdür.',
    roles: ['Holding CEO / Genel Müdür', 'Büyük Projeler Direktörü', 'Kamu & Kurum Yöneticisi', 'Stratejik Planlama Başkanı', 'Kurumsal Hukuk Otoritesi'],
    leadershipStyle: 'Disiplinli, Otoriter & Kalıcı Miras Odaklı'
  },
  'Kova': {
    title: 'Gelecek Tasarımcısı ve Derin Teknoloji İnovatörü',
    category: 'Teknoloji & İnovasyon',
    cardExplanation: 'Çağının ilerisinde düşünerek yapay zeka, derin teknoloji, yeni nesil dijital platformlar ve sosyal girişimcilikle sektörün kurallarını baştan yazma misyonunuzu işaret eder.',
    roles: ['Yapay Zeka & Teknoloji Kurucusu', 'Dijital Dönüşüm Stratejisti', 'Sosyal İnovasyon Lideri', 'Platform Mimarı', 'İleri Teknoloji Danışmanı'],
    leadershipStyle: 'Yenilikçi, Devrimci & Özgürlükçü'
  },
  'Balık': {
    title: 'Empatik Vizyoner ve İlham Veren Sanatçı/Şifacı',
    category: 'Şifa & Danışmanlık',
    cardExplanation: 'Sanatsal deha, sinematik vizyon, psikolojik sezgi ve insan ruhuna dokunan projelerle toplumsal farkındalık yaratma ve derin bir iz bırakma gücünüzü temsil eder.',
    roles: ['Kreatif Yapımcı & Sanat Yönetmeni', 'Holistik Sağlık Merkezi Kurucusu', 'Psikolojik Başdanışman', 'Sanat Terapisti', 'Sosyal Vizyoner'],
    leadershipStyle: 'Sezgisel, Vizyoner & İnsani Değer Odaklı'
  }
};

// 2. DÜNYEVİ MİSYON SEKTÖR VERİLERİ (Jargonsuz)
const DESTINY_SECTOR_DATA: Record<number, {
  title: string;
  category: CareerSectorMatch['category'];
  explanation: string;
  roles: string[];
}> = {
  1: {
    title: 'Bağımsız Girişimcilik ve İnisiyatif Alanı',
    category: 'Liderlik & Girişim',
    explanation: 'Başkalarının çizdiği sınırları aşarak kendi şirketini kurma, yeni pazarlar açma ve sektöre yön veren bir ilk uygulayıcı olma yeteneğinizi taçlandırır.',
    roles: ['Şirket Kurucusu / Founder', 'Buluş & Patent Sahibi', 'Yönetim Kurulu Danışmanı', 'Öncü Tasarımcı']
  },
  2: {
    title: 'Müzakere, Diplomasi ve İkili Ortaklıklar Alanı',
    category: 'Şifa & Danışmanlık',
    explanation: 'Çatışan taraflar arasında uzlaşma sağlama, üst düzey müzakereleri yönetme ve stratejik işbirliklerini büyük başarılara dönüştürme yeteneğinizdir.',
    roles: ['Müzakere Danışmanı', 'İnsan Kaynakları Uzmanı', 'Kurumsal Arabulucu', 'Stratejik Ortaklık Yöneticisi']
  },
  3: {
    title: 'Kreatif İletişim, Medya ve Sahne Alanı',
    category: 'Sanat & İletişim',
    explanation: 'Kelimeler, görseller ve sahne aurasıyla kitleleri etkileme, yaratıcı endüstrilerde marka yaratma ve ilham verici içerik üretme gücünüzdür.',
    roles: ['Kreatif Direktör', 'Yazar & Editör', 'Kurumsal İletişim Müdürü', 'Medya Danışmanı', 'Marka Kimliği Stratejisti']
  },
  4: {
    title: 'Operasyonel Düzen ve Sistemik Yapılanma Alanı',
    category: 'Organizasyon & Sistem',
    explanation: 'Karmaşık süreçlerden kusursuz bir düzen çıkarma, büyük projeleri planlama ve kurumları sarsılmaz temellere oturtma dehanızdır.',
    roles: ['Operasyon Direktörü (COO)', 'Sistem Mimarı', 'Büyük Proje Yöneticisi', 'Denetim Direktörü', 'Kurumsal Organizatör']
  },
  5: {
    title: 'Dinamik Pazarlama, İhracat ve Hızlı Ticaret Alanı',
    category: 'Liderlik & Girişim',
    explanation: 'Rutin mesaileri aşarak küresel trendleri koklama, serbest piyasada fırsatları erkenden yakalama ve hızlı büyüme sağlama gücünüzdür.',
    roles: ['Büyüme Direktörü (CMO)', 'Uluslararası Ticaret Yöneticisi', 'Sektörel Girişimci', 'Piyasa Brokerı']
  },
  6: {
    title: 'Hizmet Kalitesi, Eğitim ve Toplum Sağlığı Alanı',
    category: 'Şifa & Danışmanlık',
    explanation: 'Etik standartları koruma, insan sağlığı, eğitim ve danışmanlık odaklı sektörlerde toplumun güven kapısı haline gelen yapılar kurma misyonunuzdur.',
    roles: ['Sağlık & Yaşam Merkezi Yöneticisi', 'Eğitim Kurumu Lideri', 'Danışmanlık Direktörü', 'Toplumsal Gelişim Yöneticisi']
  },
  7: {
    title: 'Derin Analitik Uzmanlık ve Stratejik Düşünce Alanı',
    category: 'Teknoloji & İnovasyon',
    explanation: 'Yüzeysel bilgiyle yetinmeyip görünmeyeni keşfetme, veri mimarisi kurma ve stratejik felsefeyle kurumlara yol gösterme ustalığınızdır.',
    roles: ['Baş Teknoloji Danışmanı (CTO)', 'Veri Bilimci & Algoritma Uzmanı', 'Stratejik Araştırma Direktörü', 'Analitik Danışman']
  },
  8: {
    title: 'Büyük Sermaye, Yönetim Kurulu ve Finansal Güç Alanı',
    category: 'Finans & Strateji',
    explanation: 'Büyük bütçeleri yönetme, holding ve şirket konseylerine liderlik etme ve maddi kaynakları vizyoner hedefler için büyütme kabiliyetinizdir.',
    roles: ['Holding CEO / Yönetim Kurulu Üyesi', 'Yatırım Bankacısı & Fon Yöneticisi', 'Büyük Ölçekli Yatırımcı', 'Finansal Stratejist']
  },
  9: {
    title: 'Evrensel Kültür, Sosyal Dönüşüm ve Küresel Değer Alanı',
    category: 'Global Vizyon & Akademi',
    explanation: 'Yalnızca ticari çıkar için değil, toplumda ve dünyada kalıcı bir dönüşüm bırakacak küresel projeleri ve kültür fonlarını yönetme vizyonunuzdur.',
    roles: ['Uluslararası Vakıf Yöneticisi', 'Kültür & Sanat Direktörü', 'Sosyal Girişim Lideri', 'Uluslararası Temsilci']
  },
  11: {
    title: 'Vizyoner Liderlik ve İlham Rehberliği Alanı',
    category: 'Şifa & Danışmanlık',
    explanation: 'Alışılmış iş tanımlarının ötesinde vizyoner fikirleriyle topluma ve kurumlara yol gösteren kadersel bir rehberlik potansiyelidir.',
    roles: ['Üst Düzey Yönetici Mentoru', 'Vizyoner Enstitü Kurucusu', 'Dönüşüm Stratejisti', 'Sezgisel Lider']
  },
  22: {
    title: 'Evrensel Mimar ve Büyük Eserler Kuruculuğu',
    category: 'Finans & Strateji',
    explanation: 'Büyük vizyonları somut dünya gerçekliğine indiren, kıtalararası altyapı, teknoloji veya finans sistemleri inşa eden en güçlü yapı kuruculuğudur.',
    roles: ['Mega Projeler Direktörü', 'Uluslararası Altyapı Mimarı', 'Küresel Sistem Kurucusu', 'Stratejik Kurul Başkanı']
  },
  33: {
    title: 'Kolektif Hizmet ve Etik Standartlar Otoritesi',
    category: 'Şifa & Danışmanlık',
    explanation: 'İnsanlığa fayda sağlayan, etik standartları en tepeye koyan ve toplumun güvenini kazanan şefkatli bir liderlik misyonudur.',
    roles: ['İnsani Yardım Kuruluşu Direktörü', 'Etik Standartlar Kurulu Başkanı', 'Sosyal Enstitü Kurucusu', 'Uluslararası Temsilci']
  }
};

// 3. MADDİ KAZANÇ VE DEĞER ÜRETİM SEKTÖR VERİLERİ (Jargonsuz)
const WEALTH_SECTOR_DATA: Record<string, {
  title: string;
  category: CareerSectorMatch['category'];
  explanation: string;
  roles: string[];
}> = {
  'Koç': {
    title: 'Öncü Girişimler ve Hızlı Pazar Fırsatları',
    category: 'Liderlik & Girişim',
    explanation: 'Pazara ilk giren olma cesaretiniz, hızlı kararlarınız ve inisiyatif alarak başlattığınız bağımsız projeler üzerinden doğrudan nakit akışı yaratacağınızı gösterir.',
    roles: ['Girişim Sermayesi Yatırımları', 'Hızlı Prototipleme & Satış', 'Bireysel Primli Projeler', 'Kriz Fırsatı Değerlendirme']
  },
  'Boğa': {
    title: 'Kalıcı Gayrimenkul, Mülk ve Varlık Portföyü',
    category: 'Finans & Strateji',
    explanation: 'Somut mülk edinme, gayrimenkul değerleme, bileşik getiri ve lüks tüketim ürünleri üzerinden nesiller boyu erimeyecek bir servet inşa etme potansiyelinizi anlatır.',
    roles: ['Gayrimenkul Portföy Yönetimi', 'Değerli Emtia & Fonlar', 'Lüks Tasarım Varlıkları', 'Kalıcı Gelir Getiren Mülkler']
  },
  'İkizler': {
    title: 'Bilgi Ticareti, Aracılık ve Çok Kanallı Gelirler',
    category: 'Sanat & İletişim',
    explanation: 'Bilgiyi hızla paketleyip sunma, dijital içerik telifleri, ticaret komisyonları ve birden fazla kanaldan beslenen dinamik gelir modelleriyle refah yaratırsınız.',
    roles: ['Dijital Lisans & Telif Gelirleri', 'Ticaret Aracılığı & Komisyonculuk', 'Eğitim & Danışmanlık Paketleri', 'Çok Kanallı E-Ticaret']
  },
  'Yengeç': {
    title: 'Barınma, Gıda ve Temel Güvenlik Hizmetleri',
    category: 'Şifa & Danışmanlık',
    explanation: 'İnsanların en temel barınma, beslenme ve duygusal emniyet ihtiyaçlarına yönelik hizmetlerle sarsılmaz bir finansal koruma kalkanı oluşturursunuz.',
    roles: ['Konut & Yaşam Alanı Yatırımları', 'Gastronomi & Organik Gıda', 'Aile Varlık Yönetimi', 'Güvenlik & Sağlık Hizmetleri']
  },
  'Aslan': {
    title: 'Prestij Markası, Lüks Ürünler ve İtibar Kazançları',
    category: 'Liderlik & Girişim',
    explanation: 'Kendi kişisel markanız, imzanızı taşıyan lüks tasarımlar, yaratıcı projeler ve yüksek profilli unvanlar sayesinde en yüksek kazanç akışını çekersiniz.',
    roles: ['Kişisel Marka Telifleri', 'Lüks Segment Danışmanlık', 'Yaratıcı Eser Sahipliği', 'Üst Düzey Yönetici Hakları']
  },
  'Başak': {
    title: 'Uzman Zanaat, Süreç Denetimi ve Teknik Danışmanlık',
    category: 'Organizasyon & Sistem',
    explanation: 'İnce işçilik, teknik analiz, süreç denetimi ve kimsenin fark edemediği hataları düzelterek elde edeceğiniz vazgeçilmez uzmanlık ücretleriyle kazanırsınız.',
    roles: ['Teknik Uzmanlık Danışmanlığı', 'Operasyonel Süreç Denetimi', 'Veri & Sağlık Analitik Hizmetleri', 'Bütçe Optimizasyon Sözleşmeleri']
  },
  'Terazi': {
    title: 'Stratejik Ortaklıklar, Hukuk ve Estetik Yatırımlar',
    category: 'Sanat & İletişim',
    explanation: 'Tek başına değil doğru ortaklarla hareket ederek, başarılı müzakereler, hukuk danışmanlıkları ve tasarım/estetik projeleri üzerinden büyük refah sağlarsınız.',
    roles: ['Şirket Ortaklık Payları', 'Hukuki Danışmanlık Sözleşmeleri', 'İç Mimarlık & Tasarım Gelirleri', 'Müzakere Komisyonları']
  },
  'Akrep': {
    title: 'Sermaye Yönetimi, Kriz Arbitrajı ve Dönüşüm Kazançları',
    category: 'Finans & Strateji',
    explanation: 'Başkalarının kaynaklarını yönetme, krizdeki varlıkları değerlendirip karlı şekilde büyütme ve gizli piyasa avantajlarıyla büyük sermayeler yönetirsiniz.',
    roles: ['Özel Sermaye Fon Yönetimi', 'Kriz Fırsatları & Arbitraj', 'Şirket Yapılandırma Gelirleri', 'Stratejik Ortaklık Karları']
  },
  'Yay': {
    title: 'Uluslararası Piyasalar, İhracat ve Döviz Gelirleri',
    category: 'Global Vizyon & Akademi',
    explanation: 'Yerel sınırların ötesine geçip döviz bazlı ihracat, yabancı yatırımcı ortaklıkları, küresel yayıncılık ve eğitimlerle devasa bereket kapıları aralarsınız.',
    roles: ['Döviz Bazlı İhracat Gelirleri', 'Uluslararası Eğitim & Telifler', 'Yabancı Yatırımcı Ortaklıkları', 'Küresel Danışmanlık Gelirleri']
  },
  'Oğlak': {
    title: 'Köklü Kurum Hisseleri, Altyapı ve Kalıcı Varlıklar',
    category: 'Liderlik & Girişim',
    explanation: 'Kısa vadeli spekülasyonlara kapılmadan, köklü şirket hisseleri, kalıcı altyapı mülkleri ve üst düzey yönetici paylarıyla zamana yenilmeyen bir servet inşa edersiniz.',
    roles: ['Şirket Hisse Opsiyonları', 'Altyapı & Gayrimenkul Yatırımları', 'Büyük Ticari Mülkler', 'Uzun Vadeli Kurumsal Portföy']
  },
  'Kova': {
    title: 'Dijital Platformlar, İnovatif Patentler ve Yeni Nesil Varlıklar',
    category: 'Teknoloji & İnovasyon',
    explanation: 'Geleneksel kalıplar dışındaki dijital varlıklar, patent gelirleri, yapay zeka platformları ve kitlesel modellerle beklenmedik finansal sıçramalar yaparsınız.',
    roles: ['Teknoloji Patenti Gelirleri', 'Yapay Zeka & Yazılım Abonelikleri', 'Dijital Varlık Portföyü', 'Platform Ortaklık Gelirleri']
  },
  'Balık': {
    title: 'Sanat Telifleri, Sezgisel Öngörüler ve Vizyoner Projeler',
    category: 'Şifa & Danışmanlık',
    explanation: 'Rasyonel piyasaların göremediği dalgaları önceden hissetme, sanatsal yapıtlar, manevi/şifa projeleri ve vizyoner ortaklıklarla beklenmedik zenginliklere ulaşırsınız.',
    roles: ['Sanat & Müzik Telif Hakları', 'Sağlık & Şifa Hizmetleri Geliri', 'Sezgisel Piyasa Yatırımları', 'Kreatif Proje Ortaklıkları']
  }
};

// 4. STRATEJİK EYLEM REHBERİ (Jargonsuz, doğrudan aksiyon dili)
const STRATEGIC_ACTION_1: Record<string, string> = {
  'Koç': 'Bürokrasiyi veya başkalarının onayını beklemeyin. Fikrinizi ilk pilot proje olarak hızla sahaya sürün; inisiyatif alıp sonuç ürettiğinizde doğal lider olarak otoriteyi devralırsınız.',
  'Boğa': 'Hızlı zenginleşme vadeden spekülatif heveslerden kaçının. Elle tutulur ürünler, gayrimenkul veya nakit akışı düzenli sağlam temellere odaklanarak sarsılmaz bir saygınlık inşa edin.',
  'İkizler': 'Fikirlerinizi tek bir kanala hapsetmeyin. Dijital ağları, çoklu medya kanallarını ve köprü kuruculuğunuzu kullanarak bilgiyi dolaşıma sokun; sektörün sözcüsü konumuna gelin.',
  'Yengeç': 'Soğuk kurumsal formaliteler yerine güven ve aidiyet ekosistemi yaratın. Müşterileriniz ve ekibinizle kuracağınız koruyucu sadakat bağı en büyük rekabet avantajınızdır.',
  'Aslan': 'Perde arkasında kalarak ışığınızı söndürmeyin. Projelerinizin vitrininde yer alın, sahne konuşmaları yapın ve markanızın bizzat ilham veren vizyoner yüzü olun.',
  'Başak': 'Kaotik iş süreçlerini saat gibi çalıştıran metodolojiler ve kalite standartları geliştirin. Kimsenin göremediği detayları kusursuzlaştırarak vazgeçilmez bir uzmanlık tescilleyin.',
  'Terazi': 'Tek başınıza yük taşımak yerine stratejik ittifaklar kurun. Müzakere masasında iki tarafı da kazandıran diplomatik zarafetinizle en zorlu sözleşmeleri bağlayın.',
  'Akrep': 'Yüzeysel işlerle vakit kaybetmeyin. Kriz yönetimi, radikal şirket dönüşümleri, siber güvenlik veya derin araştırma gerektiren kilit düğümleri çözerek vazgeçilmez bir güç odağı olun.',
  'Yay': 'Yerel sınırları hızla aşın. Uluslararası ticaret, yabancı dil vizyonu, küresel yayıncılık ve büyük resmi gösteren felsefi mentorluk projeleriyle kariyerinizi dünya ölçeğine taşıyın.',
  'Oğlak': 'Kısa vadeli alkışlar yerine 5-10 yıllık stratejik bir zirve planı yapın. Sarsılmaz disiplininiz ve hiyerarşik liderliğinizle zamanın silemeyeceği kalıcı bir miras bırakın.',
  'Kova': 'Geleneksel mesai ve kalıpları yıkmaktan çekinmeyin. Yapay zeka, yeni nesil dijital topluluklar ve kolektife çağ atlatacak inovatif çözümlerle sektörünüzde devrim başlatın.',
  'Balık': 'Salt mantığın sınırlarını aşın. Sanat, sinema, psikoloji ve manevi rehberlik kanallarında insanların kalbine dokunan vizyoner projelerle toplumsal ilham kaynağı olun.'
};

const STRATEGIC_ACTION_2: Record<string, string> = {
  'Jeneratör': 'Zihninizin "para için bunu yapmalıyım" baskısına teslim olmayın. İçsel heyecanınızın ve enerjinizin gerçekten "evet" dediği iş tekliflerine odaklanın; sevdiğiniz işte yorulmadan devleşirsiniz.',
  'Manifesting Jeneratör': 'Aynı anda birkaç farklı projede koşma hakkınız var. Ancak bir adımdan diğerine geçerken ekibinizi ve müşterilerinizi mutlaka önceden bilgilendirin; böylece dirençleri yok edersiniz.',
  'Projektör': 'Saatlerce amele gibi beden gücüyle çalışmak doğanıza aykırıdır. Yeteneğinizin takdir edildiği ve fikrinize resmi davet geldiği yönetici, mentor veya sistem danışmanı rollerini seçin.',
  'Manifestor': 'Kimseden izin veya icazet beklemeyin; siz yeni çağları başlatan öncüsünüz. Sadece aksiyona geçmeden önce etrafınızdakileri bilgilendirerek engelleri baştan savın.',
  'Reflektör': 'Kariyer kararlarını ve ortaklıkları bir gecede vermeyin. Zaman tanıyarak farklı insanlarla ve ortamlarda gözlem yapın; dinginlikle verilen kararlar size mutlak başarı getirir.'
};

const STRATEGIC_ACTION_3: Record<number, string> = {
  1: 'Takipçi değil kural koyucu olun. Başkalarının çizdiği şablonları uygulamak yerine özgün vizyonunuzla bağımsız projelerin liderliğini üstlenin.',
  2: 'Diplomasi ve ortaklık gücünüzü devreye sokun. Çatışmalı ortamlarda arabulucu ve şifacı rolü üstlenerek her iki taraftan da değer üretin.',
  3: 'Sahne, söz ve yaratıcı ifade sizin gücünüzdür. Fikirlerinizi estetik bir sunum veya etkileyici bir hitabetle paylaşarak kitleleri peşinizden sürükleyin.',
  4: 'Disiplin ve sağlam yapı kuruculuğunuzu gösterin. Karmaşık süreçleri sistemleştirip denetlenebilir hale getirerek vazgeçilmez bir operasyonel temel olun.',
  5: 'Esnek ve uyum sağlayıcı olun. Değişen piyasa koşullarını erkenden hissedin; kriz anlarında yeni fırsat kapılarına hızla yönelin.',
  6: 'Hizmet kalitesi ve topluluk sorumluluğuna odaklanın. Danışanlarınıza veya müşterilerinize güven veren koruyucu standartlar geliştirin.',
  7: 'Derin uzmanlık ve analitik felsefe inşa edin. Yüzeysel piyasa trendlerine kapılmak yerine konunuzun en derin üstadı olarak saygı görün.',
  8: 'Büyük bütçeleri, güç dengelerini ve organizasyonel yapıları etik bir şekilde yönetin. Maddi dünyayı manevi sorumlulukla dengeleyin.',
  9: 'Kolektife ilham veren küresel misyonlar üstlenin. Sadece kişisel çıkar için değil, dünyada kalıcı bir dönüşüm bırakacak projeleri seçin.',
  11: 'Yüksek sezgisel vizyonunuzu profesyonel hayata entegre edin; insanlara yol gösteren ilham verici bir rehber olun.',
  22: 'Büyük idealleri somut dünya gerçekliğine indirin; uluslararası ölçekte kalıcı kurumlar ve yapılar inşa edin.',
  33: 'Yüksek fedakarlık ve şefkatle insanlığa değer katan, etik standartları en tepeye koyan projelerde liderlik edin.'
};

const STRATEGIC_ACTION_4: Record<string, string> = {
  'Koç': 'Hızlı karar alma cesaretiniz ve pazara ilk giren olma cüretiniz en büyük para kaynağınızdır. Tereddüt ettiğinizde kazanç enerjiniz durur; ilk adımı atın.',
  'Boğa': 'Somut mülk edinme, bileşik getiri, gayrimenkul ve lüks tasarım varlıkları refah kapınızdır. Parayı harcamak yerine üretken varlıklarda tutarak büyütün.',
  'İkizler': 'Bilgi ticareti, danışmanlık, dijital telifler, aracılık ve eğitim içerikleri üzerinden birden fazla dinamik gelir akışı yaratın.',
  'Yengeç': 'Barınma, gayrimenkul, gıda ve insanların duygusal güvenliğini sağlayan butik hizmetlerle para kazanırsınız. Kazancınızı güvenceniz için değerlendirin.',
  'Aslan': 'Kişisel markanız, lüks segment ürünler, yaratıcı eserleriniz ve sahne görünürlüğünüz para çeker. Hizmetinizi asla düşük fiyatlandırmayın.',
  'Başak': 'Yüksek uzmanlık gerektiren analitik zanaat, süreç denetimi, sağlık ve optimizasyon danışmanlığı ile sürdürülebilir yüksek gelir elde edersiniz.',
  'Terazi': 'Başarılı ortaklıklar, estetik/tasarım danışmanlığı, hukuk ve aracılık sözleşmeleri zenginlik kapınızdır. Kazancınız denge ve adalete bağlıdır.',
  'Akrep': 'Fon yönetimi, krizdeki varlıkları ucuza alıp katlayarak satma, stratejik yatırımlar ve ortak sermaye yönetimi ile büyük paraları yönetirsiniz.',
  'Yay': 'Yabancı para birimleri, uluslararası e-ticaret, küresel eğitimler ve turizm/yayıncılık bereketi getirir. Vizyonunuzu küresel tutun.',
  'Oğlak': 'Kalıcı yapılar, kurumsal hisseler, uzun vadeli gayrimenkuller ve tepe yönetici primleri ile zamana yenilmeyen bir servet inşa edersiniz.',
  'Kova': 'Dijital platformlar, yapay zeka araçları, kitle fonlaması ve yenilikçi patentlerle beklenmedik büyük finansal sıçramalar yaparsınız.',
  'Balık': 'Sezgisel yatırımlar, sanatsal telif hakları, holistik şifa ve insan ruhunu iyileştiren vizyoner projelerle bolluğu hayatınıza çekersiniz.'
};

export class CareerEngine {
  public static async analyze(
    fullName: string,
    birthDate: string,
    birthTime: string,
    birthCity: AstroCity
  ): Promise<CareerAnalysisResult> {
    // 1. Astroloji Haritası Hesapla (Arka Plan)
    const m = moment.tz(`${birthDate} ${birthTime || '12:00'}`, birthCity.tz || 'Europe/Istanbul');
    const dateObj = m.toDate();
    const chart = await generateAstrologyChart(dateObj, birthCity);

    const mcSign = chart.midheaven.sign;
    const mcData = MC_SECTOR_DATA[mcSign] || MC_SECTOR_DATA['Oğlak'];

    const house2 = chart.houses[1];
    const house2Sign = house2 ? house2.sign : 'Boğa';
    const house2Data = WEALTH_SECTOR_DATA[house2Sign] || WEALTH_SECTOR_DATA['Boğa'];

    const saturn = chart.planets.find(p => p.name === 'Satürn') || { sign: 'Oğlak', house: 10 };

    // 2. Numeroloji Hesapla (Arka Plan)
    const nameAnalysis = calculateNameAnalysis(fullName);
    const destinyNum = nameAnalysis.destiny;
    const destinySector = DESTINY_SECTOR_DATA[destinyNum] || DESTINY_SECTOR_DATA[1];

    // 3. Human Design Hesapla (Arka Plan)
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

    // 4. ÖZET ROZETLER (Teknik jargondan arındırılmış)
    const leadershipStyle = mcData.leadershipStyle;
    let workDynamic = 'Sürdürülebilir Üretim & Derin Uzmanlık';
    if (hdType === 'Projektör') workDynamic = 'Stratejik Yönetim & Danışmanlık';
    else if (hdType === 'Manifestör') workDynamic = 'Bağımsız Başlatıcılık & İnovasyon';
    else if (hdType === 'Manifesting Jeneratör') workDynamic = 'Çok Kanallı Dinamik Yöneticilik';
    else if (hdType === 'Reflektör') workDynamic = 'Tarafsız Denetim & Yüksek Vizyon';

    const coreAsset = destinySector.title;
    const decisionMotto = `${hdStrategy} & ${hdAuthority.replace('Otorite', '').trim()} Karar Dinamiği`;

    // 5. EN UYGUN 3 SEKTÖR
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

    // 6. İDEAL ÇALIŞMA MODELİ
    let idealModelType: 'Girişimci & Bağımsız Kurucu' | 'Kurumsal Lider & Üst Yönetici' | 'Stratejik Rehber & Danışman' | 'Özerk Uzman & Zanaatkar' = 'Girişimci & Bağımsız Kurucu';
    let idealModelExp = '';
    let idealPercent = 90;

    if (['Koç', 'Yay', 'Kova'].includes(mcSign) || hdType === 'Manifestör' || destinyNum === 1 || destinyNum === 5) {
      idealModelType = 'Girişimci & Bağımsız Kurucu';
      idealModelExp = 'Başkalarının katı hiyerarşisi altında çalışmak yaratıcı potansiyelinizi sınırlar. Kendi kurallarınızı koyduğunuz bağımsız girişimler, şirket kuruculuğu veya serbest start-up modelleri sizin en yüksek verim ve kadersel doyum alanınızdır.';
      idealPercent = 95;
    } else if (['Oğlak', 'Aslan', 'Boğa'].includes(mcSign) || destinyNum === 8 || destinyNum === 4 || destinyNum === 22) {
      idealModelType = 'Kurumsal Lider & Üst Yönetici';
      idealModelExp = 'Büyük bütçeleri, insan kaynaklarını ve sağlam kurumsal mekanizmaları yönetebilecek doğal bir otorite ve organizasyonel güç taşırsınız. Kurumların icra kurullarında veya holding zirvelerinde kalıcı bir miras inşa edersiniz.';
      idealPercent = 93;
    } else if (hdType === 'Projektör' || ['Terazi', 'İkizler', 'Balık'].includes(mcSign) || destinyNum === 2 || destinyNum === 7 || destinyNum === 11) {
      idealModelType = 'Stratejik Rehber & Danışman';
      idealModelExp = 'Operasyonel angaryalardan uzaklaşıp üst düzey kurumlara, liderlere veya bireylere stratejik yol haritası çizdiğiniz uzman danışmanlık modeli size en yüksek saygınlığı ve finansal akışı sağlar.';
      idealPercent = 91;
    } else {
      idealModelType = 'Özerk Uzman & Zanaatkar';
      idealModelExp = 'Kendi alanında en derin bilgiye sahip, teknik veya sanatsal zanaatıyla aranılan ve kalite standartlarını kendisi belirleyen özerk bir çalışma biçimi sizin için idealdir.';
      idealPercent = 88;
    }

    // 7. SÜPER GÜÇ VE GÖLGE TUZAKLAR (Jargonsuz)
    const superPower = generateCleanSuperPower(mcSign, destinyNum);
    const shadowPitfalls = generateCleanShadowPitfall(mcSign, saturn.sign);

    // 8. 4 STRATEJİK TAVSİYE (Jargonsuz)
    const actionableGuidance = [
      STRATEGIC_ACTION_1[mcSign] || STRATEGIC_ACTION_1['Oğlak'],
      STRATEGIC_ACTION_2[hdType] || STRATEGIC_ACTION_2['Jeneratör'],
      STRATEGIC_ACTION_3[destinyNum] || 'Yeteneklerinizi ekip çalışmalarında ana kozunuz yapın ve vizyonunuzu cesurca ortaya koyun.',
      STRATEGIC_ACTION_4[house2Sign] || STRATEGIC_ACTION_4['Boğa']
    ];

    return {
      personalInfo: {
        fullName,
        birthDate,
        birthTime: birthTime || '12:00',
        cityName: birthCity.name
      },
      summaryBadges: {
        leadershipStyle,
        workDynamic,
        coreAsset,
        decisionMotto
      },
      idealWorkModel: {
        type: idealModelType,
        percentage: idealPercent,
        explanation: idealModelExp
      },
      superPower,
      shadowPitfalls,
      topSectors,
      actionableGuidance
    };
  }
}

function generateCleanSuperPower(mcSign: string, destinyNum: number): string {
  const mcPowers: Record<string, string> = {
    'Koç': 'kriz anlarında tereddüt etmeden ilk adımı atıp öncülük etme cesareti',
    'Boğa': 'sarsılmaz güvenilirlik ve kalıcı somut değer inşa etme ustalığı',
    'İkizler': 'hızlı bilgi sentezi, çoklu ağlar kurma ve güçlü ikna kabiliyeti',
    'Yengeç': 'derin insani sezgi, yüksek sadakat yaratma ve koruyucu liderlik',
    'Aslan': 'doğal karizma, sahne ışıltısı ve insanlara ilham verme gücü',
    'Başak': 'kusursuz detay hakimiyeti, analitik zeka ve süreçleri mükemmelleştirme',
    'Terazi': 'çatışan tarafları uzlaştıran diplomatik zarafet ve estetik vizyon',
    'Akrep': 'krizleri fırsata çeviren stratejik derinlik ve dönüşüm gücü',
    'Yay': 'sınır tanımayan küresel vizyon ve büyük resmi felsefi kavrayış',
    'Oğlak': 'çelik gibi disiplin, sabırlı strateji ve kalıcı otorite kurma yeteneği',
    'Kova': 'kalıpların ötesine geçen devrimci inovasyon ve geleceği okuma sezgisi',
    'Balık': 'mantık sınırlarını aşan yaratıcı ilham ve empatik vizyonerlik'
  };

  const destinyPowers: Record<number, string> = {
    1: 'kendi bağımsız yolunu açan öncü iradeniz',
    2: 'kusursuz diplomatik uyum ve sezgisel dengeniz',
    3: 'insanları peşinden sürükleyen ifade ve sanatsal çekiminiz',
    4: 'sağlam temeller atan metodik inşa gücünüz',
    5: 'hızlı adapte olan dinamik dönüşüm zekanız',
    6: 'yüksek sorumluluk ve güven veren koruyuculuğunuz',
    7: 'derin bilgiye ve hakikate ulaşan analitik bilgeliğiniz',
    8: 'maddi ve kurumsal gücü yöneten stratejik liderliğiniz',
    9: 'kolektif dönüşüm yaratan evrensel vizyonunuz',
    11: 'karanlıkta yol gösteren yüksek sezgisel ışığınız',
    22: 'büyük hayalleri dünya maddesine indiren usta mimarlığınız',
    33: 'toplumu yücelten evrensel şefkat ve adanmışlığınız'
  };

  const p1 = mcPowers[mcSign] || 'stratejik liderlik gücünüz';
  const p2 = destinyPowers[destinyNum] || 'özgün yetenekleriniz';

  return `Doğuştan gelen ${p1} ile ${p2} mükemmel bir ahenkle birleşiyor. En kaotik piyasa koşullarında dahi doğru rotayı belirleyip projeleri ve ekipleri zirveye taşıma kabiliyetine sahipsiniz.`;
}

function generateCleanShadowPitfall(mcSign: string, saturnSign: string): string {
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

  return `Kariyerinizde dikkat etmeniz gereken en büyük gölge tuzak: "${shadow}". Kısa vadeli kolay kazançlara kapılmamalı; itibarınızı zedeleyecek aceleci hamlelerden uzak durmalısınız. Enerjinizi tüketen gereksiz sorumlulukları zamanında devretmediğinizde tükenmişlik riski doğabilir.`;
}
