import { generateAstrologyChart } from './AstrologyEngine';
import { AstroCity, NatalChartData, AstroPoint } from './AstrologyConstants';
import { calculateNameAnalysis, calculateLifePath } from '@/utils/numerologyCalculator';
import { numerologyData } from '@/utils/numerologyData';
import { generateChart, HumanDesignChart } from '@/utils/HumanDesignEngine';
import moment from 'moment-timezone';

export interface CareerSectorMatch {
  title: string;
  category: 'Liderlik & Girişim' | 'Teknoloji & Analitik' | 'Sanat & İletişim' | 'Şifa & Danışmanlık' | 'Finans & Strateji' | 'Organizasyon & Sistem';
  fitScore: number; // 0 - 100
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
    workStrategy: string;
    decisionAuthority: string;
    careerDynamic: string;
  };
  synthesis: {
    idealWorkModel: {
      type: 'Girişimci & Bağımsız Kurucu' | 'Kurumsal Lider & Yönetici' | 'Stratejik Rehber & Danışman' | 'Özerk Uzman & Zanaatkar';
      percentage: number;
      explanation: string;
    };
    superPower: string;
    shadowPitfalls: string;
    topSectors: CareerSectorMatch[];
    actionableGuidance: string[];
  };
}

// 10. Ev (MC) Kariyer Yorumları
const MC_CAREER_INTERPRETATIONS: Record<string, { title: string; desc: string; sectors: string[] }> = {
  'Koç': {
    title: 'Öncü, Girişimci ve Cesur Lider',
    desc: 'Kariyerinizde bağımsızlık, hız ve ilk adımı atan kişi olma dürtüsü hakimdir. Emir almaktan hoşlanmaz, kriz anlarında soğukkanlılıkla risk alarak yolu açarsınız. Kendi işini kurmak veya inisiyatif alabileceğiniz dinamik pozisyonlar sizin için idealdir.',
    sectors: ['Girişimcilik & Start-up', 'Proje Yönetimi', 'Savunma & Güvenlik', 'Spor & Performans Yönetimi', 'Cerrahi / Acil Müdahale']
  },
  'Boğa': {
    title: 'Güvenilir İnşaatçı, Somut Değer ve Finans Mimarı',
    desc: 'Kariyerinizi aceleye getirmeden, sağlam tuğlalarla kalıcı bir anıt gibi inşa edersiniz. Güvenilirlik, finansal öngörü, estetik zevk ve kaynak yönetimi en büyük erdeminizdir. Gelir getirmeyen veya aşırı dalgalı spekülatif işler yerine sürdürülebilir refahı tercih edersiniz.',
    sectors: ['Bankacılık & Finans', 'Gayrimenkul & Değerleme', 'Mimarlık & Peyzaj', 'Lüks Tüketim & Sanat', 'Tarım & Sürdürülebilir Üretim']
  },
  'İkizler': {
    title: 'Çok Yönlü İletişimci, Bilgi ve Ağ Mimarı',
    desc: 'Kariyerinizin merkezinde fikirler, bilgi akışı, teknoloji ve iletişim yer alır. Tekdüze ve rutin ofis işleri sizi köreltir; aynı anda birkaç projeyi yönetmek, yazmak, anlatmak ve insanları birbirine bağlamak sizin dehanızdır.',
    sectors: ['Medya & Gazetecilik', 'Dijital Pazarlama & Sosyal Medya', 'Yazılım & Veri Analitiği', 'Halkla İlişkiler & Reklam', 'Ticaret & Satış']
  },
  'Yengeç': {
    title: 'Şefkatli Koruyucu, Topluluk Lideri ve Güven Verici',
    desc: 'Kariyerinizde insani dokunuş, güven ve aidiyet yaratma yeteneğinizle yükselirsiniz. İnsanların duygusal ve fiziksel ihtiyaçlarını anlama kabiliyetiniz güçlüdür. Kurum içinde bir aile bağı kurarak çalışanları motive edersiniz.',
    sectors: ['İnsan Kaynakları & Koçluk', 'Eğitim & Çocuk Gelişimi', 'Sağlık & Psikoloji', 'Otelcilik & Gastronomi', 'Tarih & Kültürel Miras']
  },
  'Aslan': {
    title: 'Karizmatik Vizyoner, Sahne Lideri ve Yaratıcı Direktör',
    desc: 'Toplum önünde doğal bir ışıltınız ve saygınlığınız vardır. Liderlik etmek, sahne ışıklarında olmak ve ilham vermek için yaratılmışsınız. Sıradan bir çalışan olmak yerine vizyon çizen bir direktör veya marka yüzü olmak size yakışır.',
    sectors: ['Üst Düzey Yöneticilik (C-Level)', 'Sahne Sanatları & Eğlence', 'Yaratıcı Direktörlük & Moda', 'Halka Açık Konuşmacılık', 'Lüks Marka Temsilciliği']
  },
  'Başak': {
    title: 'Mükemmeliyetçi Analist, Sistem Ustası ve Stratejist',
    desc: 'Detaylardaki ustalığınız, iş ahlakınız ve analitik zekanız sayesinde kimsenin göremediği aksaklıkları çözer, sistemleri saat gibi tıkır tıkır çalıştırırsınız. Hizmet üretmek ve somut kalite standartları belirlemek sizin imzanızdır.',
    sectors: ['Yazılım Kalite & Mimari', 'Tıp & Laboratuvar Analitiği', 'Denetim & Finansal Kontrol', 'Süreç Optimizasyonu & Danışmanlık', 'Akademi & Araştırma']
  },
  'Terazi': {
    title: 'Diplomatik Arabulucu, Estetik Uzmanı ve Ortaklık Dehası',
    desc: 'Kariyeriniz zarafet, müzakere kabiliyeti, hukuk ve estetik dengesi üzerine kuruludur. İkna gücünüz yüksektir; çatışan tarafları uzlaştırarak her iki taraf için de kazançlı anlaşmalar masaya koyarsınız.',
    sectors: ['Hukuk & Arabuluculuk', 'Diplomasi & Uluslararası İlişkiler', 'Sanat & İç Mimarlık', 'Halkla İlişkiler & Kurumsal Temsil', 'Moda & Tasarım']
  },
  'Akrep': {
    title: 'Stratejik Dönüşümcü, Kriz Yöneticisi ve Derin Araştırmacı',
    desc: 'Yüzeysel olan hiçbir şey ilginizi çekmez. Gizli kalmış gerçekleri ortaya çıkarmak, batmakta olan bir şirketi veya projeyi küllerinden yeniden doğurmak ve krizleri fırsata çevirmek sizin gücünüzdür.',
    sectors: ['Kriz Yönetimi & Yeniden Yapılanma', 'Siber Güvenlik & İstihbarat', 'Psikiyatri & Derin Terapi', 'Büyük Yatırım & Girişim Sermayesi (VC)', 'Cerrahi & Tıbbi Araştırma']
  },
  'Yay': {
    title: 'Global Vizyoner, Felsefi Mentor ve Keşifçi',
    desc: 'Sınırlar ve yerel kurallar sizi kısıtlar. Uluslararası işler, akademik çevreler, yayıncılık ve geleceğe yön veren felsefi projeler sizin arenanızdır. İnsanlara büyük resmi gösteren bir rehbersiniz.',
    sectors: ['Akademi & Yüksek Öğretim', 'Uluslararası Ticaret & İhracat', 'Yayıncılık & Medya', 'Turizm & Havacılık', 'Hukuk & Felsefi Danışmanlık']
  },
  'Oğlak': {
    title: 'Hiyerarşi Mimarı, Otorite Figürü ve Zirve İnşaatçısı',
    desc: 'Zodyakın en güçlü kariyer konumlarından biridir. Disiplin, sabır ve sarsılmaz bir iş ahlakıyla en tepeye tırmanırsınız. Kurumsal yapılarda, devlet kademelerinde veya büyük şirketlerde uzun soluklu bir miras bırakırsınız.',
    sectors: ['Kurumsal CEO / Genel Müdürlük', 'Mühendislik & Ağır Sanayi', 'Kamu Yönetimi & Bürokrasi', 'Stratejik Planlama & Portföy Yönetimi', 'Kurumsal Hukuk']
  },
  'Kova': {
    title: 'Yenilikçi İnovatör, Gelecek Tasarımcısı ve Devrimci',
    desc: 'Geleneksel kariyer yolları size göre değildir. Geleceğin teknolojileri, yapay zeka, toplumsal hareketler ve kolektife fayda sağlayan sıra dışı buluşlar sizin vizyonunuzu tetikler. Özgürlük alanınız mutlaka korunmalıdır.',
    sectors: ['Yapay Zeka & Derin Teknoloji', 'Sivil Toplum & Sosyal Girişimcilik', 'Astrofizik & Uzay Teknolojileri', 'Kripto & Fintek', 'Dijital Komünite Liderliği']
  },
  'Balık': {
    title: 'Sezgisel Vizyoner, Sanatsal Şifacı ve Empatik İlham Kaynağı',
    desc: 'Rasyonel aklın ötesindeki sezgilerinizle insanlara dokunan işlerde parıldarsınız. Sanat, sinema, ruhsal rehberlik ve şifa alanlarında dünyayı daha iyi bir yer haline getirecek projelerin doğal yaratıcısısınız.',
    sectors: ['Sanat, Müzik & Sinema', 'Holistik Sağlık & Şifa', 'Psikoloji & Manevi Danışmanlık', 'Sosyal Yardım & İnsani Diplomasi', 'Tasarım & Yaratıcı Yazarlık']
  }
};

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

// 2. Ev (Maddi Kazanç Kaynağı)
const HOUSE2_INTERPRETATIONS: Record<string, string> = {
  'Koç': 'Hızlı karar alma, cesaretle başlatılan projeler, bağımsız girişimler ve risk alarak pazarda öncü olma kabiliyetinizle para kazanırsınız.',
  'Boğa': 'Sabırlı yatırımlar, mülk edinme, somut ürün üretimi, finansal öngörü ve kalıcı varlık inşa etme yoluyla refah yaratırsınız.',
  'İkizler': 'Bilgiyi paraya dönüştürme, ticaret, aracılık, danışmanlık, dijital içerik ve iletişim ağlarınız üzerinden gelir sağlarsınız.',
  'Yengeç': 'İnsanların güvenlik ve barınma ihtiyaçlarını karşılama, gayrimenkul, gıda, aile işletmeleri ve empatik danışmanlıkla kazanırsınız.',
  'Aslan': 'Yaratıcı projeleriniz, kişisel markanız, lüks sektörler, sahne/eğlence ve liderlik pozisyonları size en yüksek finansal akışı sağlar.',
  'Başak': 'Uzmanlık gerektiren teknik zanaat, detaylı analiz, danışmanlık, sağlık sektörü ve sistem optimizasyonuyla gelir üretirsiniz.',
  'Terazi': 'Ortaklıklar, müzakere ve anlaşmalar, hukuk danışmanlığı, sanat/tasarım ve estetik hizmetler üzerinden refah çekersiniz.',
  'Akrep': 'Başkalarının kaynaklarını yönetme (fon/yatırım), krizden karlı çıkma, gizli potansiyelleri paraya çevirme ve stratejik ortaklıklar.',
  'Yay': 'Uluslararası ticaret, yabancı para birimleri, yüksek eğitim, yayıncılık ve küresel danışmanlık finansal bereket kapınızdır.',
  'Oğlak': 'Zamanla büyüyen kurumsal pozisyonlar, gayrimenkul, sağlam hisse senetleri, kalıcı yapılar ve yönetici unvanları ile servet yaparsınız.',
  'Kova': 'Yeni teknolojiler, dijital platformlar, topluluk projeleri, icatlar ve geleceğe yönelik yatırımlar üzerinden büyük kazançlar elde edersiniz.',
  'Balık': 'Sanatsal yaratımlar, şifa ve psikoloji, manevi rehberlik, sezgisel öngörüler ve insanlara umut veren vizyoner projelerle kazanırsınız.'
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
    const mcInterp = MC_CAREER_INTERPRETATIONS[mcSign] || MC_CAREER_INTERPRETATIONS['Oğlak'];

    // 6. Ev (Ev çizgisi indeksi 5)
    const house6 = chart.houses[5];
    const house6Sign = house6 ? house6.sign : 'Başak';
    const house6Text = HOUSE6_INTERPRETATIONS[house6Sign] || HOUSE6_INTERPRETATIONS['Başak'];

    // 2. Ev (Ev çizgisi indeksi 1)
    const house2 = chart.houses[1];
    const house2Sign = house2 ? house2.sign : 'Boğa';
    const house2Text = HOUSE2_INTERPRETATIONS[house2Sign] || HOUSE2_INTERPRETATIONS['Boğa'];

    // Satürn ve Mars
    const saturn = chart.planets.find(p => p.name === 'Satürn') || { sign: 'Oğlak', house: 10 };
    const mars = chart.planets.find(p => p.name === 'Mars') || { sign: 'Koç', house: 1 };

    const saturnAdvice = `Satürn haritanızda ${saturn.sign} burcunda ve ${saturn.house}. evde konumlanmıştır. Kariyerinizde ustalaşmanız ve gerçek zirvenize ulaşmanız için aceleci olmamanız, özellikle ${saturn.sign} prensibinin gerektirdiği sabır, metodik çalışma ve etik sorumluluk testlerinden geçmeniz kilit anahtardır.`;
    const marsStyle = `Mars'ın ${mars.sign} burcundaki ve ${mars.house}. evdeki pozisyonu, iş hayatında rekabet ederken ve kararları hayata geçirirken ${mars.sign} enerjisiyle (atak, kararlı ve stratejik) eyleme geçtiğinizi gösterir.`;

    // 2. Numeroloji Hesapla
    const nameAnalysis = calculateNameAnalysis(fullName);
    const lifePathAnalysis = calculateLifePath(birthDate);

    const destinyNum = nameAnalysis.destiny;
    const destinyInfo = numerologyData[destinyNum] || numerologyData[1];
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

    // 4. Büyük Sentez & Sektörel Skorlama
    const topSectors: CareerSectorMatch[] = [
      {
        title: mcInterp.title,
        category: getCategoryForSign(mcSign),
        fitScore: 95,
        recommendedRoles: mcInterp.sectors,
        description: `10. Ev MC (${mcSign}) ve Kader Numarası (${destinyNum}) rezonansı, toplum önünde en yüksek başarı ve saygınlığı bu kulvarda elde edeceğinizi işaret eder.`
      },
      {
        title: `${destinyInfo.title} Yolu`,
        category: getCategoryForNumber(destinyNum),
        fitScore: 88,
        recommendedRoles: destinyInfo.career ? [destinyInfo.career] : ['Stratejik Danışmanlık', 'Yöneticilik', 'Girişimcilik'],
        description: `İsminizin yaydığı titreşim (${destinyNum}), dünyevi misyonunuzun bu alanda meyve vereceğini ve yeteneklerinizi en rahat bu görevde parlatacağınızı vurgular.`
      },
      {
        title: `${house2Sign} Maddi Kazanç & Değer Portföyü`,
        category: getCategoryForSign(house2Sign),
        fitScore: 82,
        recommendedRoles: ['Kaynak & Bütçe Yönetimi', 'Stratejik Yatırım', 'Uzmanlık Temelli Hizmet'],
        description: `2. Evinizdeki ${house2Sign} burcu; maddi refaha ulaşırken hangi kabiliyetlerinizi paraya çevireceğinizi modeller.`
      }
    ];

    // İdeal Çalışma Modeli
    let idealModelType: 'Girişimci & Bağımsız Kurucu' | 'Kurumsal Lider & Yönetici' | 'Stratejik Rehber & Danışman' | 'Özerk Uzman & Zanaatkar' = 'Girişimci & Bağımsız Kurucu';
    let idealModelExp = '';
    let idealPercent = 90;

    if (['Koç', 'Yay', 'Kova'].includes(mcSign) || hdType === 'Manifestör' || destinyNum === 1) {
      idealModelType = 'Girişimci & Bağımsız Kurucu';
      idealModelExp = 'Kendi kurallarınızı koyabileceğiniz, hiyerarşik baskının olmadığı bağımsız projeler ve şirket kuruculuğu sizin ruhsal doyum kaynağınızdır.';
      idealPercent = 94;
    } else if (['Oğlak', 'Aslan', 'Boğa'].includes(mcSign) || destinyNum === 8 || destinyNum === 4) {
      idealModelType = 'Kurumsal Lider & Yönetici';
      idealModelExp = 'Büyük bütçeleri, insan kaynaklarını ve sağlam yapıları yönetebilecek kurumsal liderlik ve otorite kapasiteniz çok yüksektir.';
      idealPercent = 92;
    } else if (hdType === 'Projektör' || ['Terazi', 'İkizler', 'Balık'].includes(mcSign) || destinyNum === 2 || destinyNum === 7) {
      idealModelType = 'Stratejik Rehber & Danışman';
      idealModelExp = 'Operasyonel angaryalardan uzak, uzmanlığınızı ve bilgeliğinizi kurumlara ya da bireylere aktardığınız üst düzey danışmanlık modeli size en çok yakışandır.';
      idealPercent = 89;
    } else {
      idealModelType = 'Özerk Uzman & Zanaatkar';
      idealModelExp = 'Kendi alanında derinleşen, teknik veya sanatsal uzmanlığıyla aranan ve kalite standartlarını kendisi belirleyen bir çalışma tarzı size uygundur.';
      idealPercent = 86;
    }

    // Kişiye Özel Dinamik Süper Güç
    const superPower = generateDynamicSuperPower(mcSign, destinyNum, hdType);

    // Kişiye Özel Dinamik Gölge Tuzaklar
    const shadowPitfalls = generateDynamicShadowPitfall(mcSign, destinyNum, saturn.sign, hdType);

    // Tamamen Dinamik 4 Kadersel Tavsiye (Şablon tekrarlarından arındırılmış)
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
        mcTitle: mcInterp.title,
        mcInterpretation: mcInterp.desc,
        house6Sign,
        house6Interpretation: house6Text,
        house2Sign,
        house2WealthKey: house2Text,
        saturnPlacement: `${saturn.sign} (${saturn.house}. Ev)`,
        saturnDisciplineAdvice: saturnAdvice,
        marsPlacement: `${mars.sign} (${mars.house}. Ev)`,
        marsExecutionStyle: marsStyle
      },
      numerology: {
        destinyNumber: destinyNum,
        destinyTitle: destinyInfo.title,
        destinyCareerAdvice: destinyInfo.career || 'Kendi alanınızda liderlik ve özgün uzmanlık.',
        lifePathNumber: lifePathNum,
        lifePathVision: lifePathInfo.lifePathDetails || '',
        soulUrgeNumber: nameAnalysis.soulUrge,
        innerDrive: (numerologyData[nameAnalysis.soulUrge] || destinyInfo).soulUrgeDetails || ''
      },
      humanDesign: {
        type: hdType,
        profile: hdProfile,
        workStrategy: hdStrategy,
        decisionAuthority: hdAuthority,
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

function getCategoryForSign(sign: string): CareerSectorMatch['category'] {
  if (['Koç', 'Aslan'].includes(sign)) return 'Liderlik & Girişim';
  if (['Başak', 'Kova'].includes(sign)) return 'Teknoloji & Analitik';
  if (['İkizler', 'Terazi'].includes(sign)) return 'Sanat & İletişim';
  if (['Yengeç', 'Balık'].includes(sign)) return 'Şifa & Danışmanlık';
  if (['Boğa', 'Oğlak'].includes(sign)) return 'Finans & Strateji';
  return 'Organizasyon & Sistem';
}

function getCategoryForNumber(num: number): CareerSectorMatch['category'] {
  if ([1, 8].includes(num)) return 'Liderlik & Girişim';
  if ([4, 7].includes(num)) return 'Teknoloji & Analitik';
  if ([3, 5].includes(num)) return 'Sanat & İletişim';
  if ([2, 9, 11].includes(num)) return 'Şifa & Danışmanlık';
  if ([22, 33].includes(num)) return 'Finans & Strateji';
  return 'Organizasyon & Sistem';
}
