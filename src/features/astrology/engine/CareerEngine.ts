import { generateAstrologyChart } from './AstrologyEngine';
import { AstroCity, NatalChartData, AstroPoint, AstroAspect } from './AstrologyConstants';
import { calculateNameAnalysis, calculateLifePath } from '@/utils/numerologyCalculator';
import { generateChart, HumanDesignChart } from '@/utils/HumanDesignEngine';
import moment from 'moment-timezone';

export interface CareerSectorMatch {
  id: string;
  title: string;
  shortTitle: string;
  category: 'Liderlik & Girişim' | 'Teknoloji & İnovasyon' | 'Sanat & İletişim' | 'Şifa & Danışmanlık' | 'Finans & Strateji' | 'Global Vizyon & Akademi' | 'Organizasyon & Sistem';
  fitScore: number;
  percentage: number;
  color: string;
  recommendedRoles: string[];
  description: string;
}

export interface SecondarySectorMatch {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  percentage: number;
  color: string;
  recommendedRoles: string[];
}

export interface CareerEnergySegment {
  id: string;
  title: string;
  category: string;
  percentage: number;
  color: string;
}

export interface FocusStrategyData {
  type: 'Tek Alanda Derinleşme & Otorite' | 'Çok Kanallı (Polimat) Hibrit Kariyer';
  motto: string;
  explanation: string;
  actionAdvice: string;
}

export interface DharmaPathData {
  title: string;
  fromComfortZone: string;
  toGrowthMission: string;
  careerImpact: string;
}

export interface WealthMagnetData {
  channelTitle: string;
  mechanism: string;
  practicalFormula: string;
}

export interface BurnoutShieldData {
  coreRisk: string;
  toxicEnvironments: string;
  protectionFormula: string;
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
  focusStrategy: FocusStrategyData;
  dharmaPath: DharmaPathData;
  wealthMagnet: WealthMagnetData;
  burnoutShield: BurnoutShieldData;
  superPower: string;
  shadowPitfalls: string;
  topSectors: CareerSectorMatch[];
  secondarySectors: SecondarySectorMatch[];
  energyDistribution: {
    segments: CareerEnergySegment[];
  };
  actionableGuidance: string[];
}

interface SectorDefinition {
  id: string;
  title: string;
  shortTitle: string;
  category: CareerSectorMatch['category'];
  color: string;
  description: string;
  roles: string[];
}

const SECTOR_DEFINITIONS: Record<string, SectorDefinition> = {
  technology: {
    id: 'technology',
    title: 'Yazılım Mimarisi, Yapay Zeka & Derin Teknoloji',
    shortTitle: 'Yazılım & Teknoloji',
    category: 'Teknoloji & İnovasyon',
    color: '#8B5CF6',
    description: 'Bilişim sistemleri, algoritmik yazılım mimarisi, yapay zeka entegrasyonları ve ölçeklenebilir dijital platformlar inşa etme konusunda doğuştan gelen yüksek analitik problem çözme dehanızı temsil eder.',
    roles: ['Yazılım Mimarı & Full-Stack Mühendis', 'Yapay Zeka & Algoritma Geliştirici', 'Teknoloji Kurucusu (CTO / Founder)', 'Bulut & Sistem Altyapı Direktörü', 'Siber Güvenlik & Veri Analisti']
  },
  finance: {
    id: 'finance',
    title: 'Büyük Sermaye, Yatırım Stratejisi & Varlık Yönetimi',
    shortTitle: 'Finans & Sermaye',
    category: 'Finans & Strateji',
    color: '#10B981',
    description: 'Maddi kaynakları vizyoner hedefler doğrultusunda büyütme, portföy ve fon yönetimi, şirket satın almaları ve stratejik sermaye kurgularında söz sahibi olma gücünüzü simgeler.',
    roles: ['Yatırım Bankacısı & Portföy Yöneticisi', 'Özel Sermaye (PE) & Fon Direktörü', 'Finansal Stratejist & CFO', 'Gayrimenkul Geliştirme Yatırımcısı', 'Kriz Arbitrajı & Varlık Değerleme Uzmanı']
  },
  leadership: {
    id: 'leadership',
    title: 'Bağımsız Girişimcilik, Start-up & İcra Kurulu Liderliği',
    shortTitle: 'Girişim & Liderlik',
    category: 'Liderlik & Girişim',
    color: '#EAB308',
    description: 'Piyasada ilk adımı atma cesareti, start-up projelerini hızla ölçekleme, kriz anlarında inisiyatif alarak ekiplere ve şirketlere kararlı bir şekilde yön verme kudretinizi açığa çıkarır.',
    roles: ['Şirket Kurucusu & CEO', 'Start-up Büyüme Direktörü (Scale-up)', 'Kriz & Dönüşüm Yöneticisi', 'Girişim Sermayesi (VC) Ortağı', 'Operasyonel İcra Lideri']
  },
  systems: {
    id: 'systems',
    title: 'Sistem Mimarisi, Mühendislik & Süreç Optimizasyonu',
    shortTitle: 'Sistem & Mühendislik',
    category: 'Organizasyon & Sistem',
    color: '#3B82F6',
    description: 'Karmaşık operasyonel süreçlerden saat gibi işleyen kusursuz düzenler çıkarma, kalite güvence, endüstriyel altyapı ve sürdürülebilir organizasyonel standartlar inşa etme dehanızdır.',
    roles: ['Operasyon Direktörü (COO)', 'Endüstriyel & Sistem Mühendisi', 'Süreç Optimizasyon Danışmanı', 'Kurumsal Denetim & Kalite Başkanı', 'Büyük Ölçekli Proje Yöneticisi']
  },
  creative: {
    id: 'creative',
    title: 'Dijital Ürün Tasarımı, Medya & Kreatif İletişim',
    shortTitle: 'Tasarım & Medya',
    category: 'Sanat & İletişim',
    color: '#EC4899',
    description: 'Kullanıcı deneyimi (UI/UX), marka kimliği, yaratıcı içerik üretimi, görsel sanatlar ve kitleleri derinden etkileyen çok kanallı iletişim ağları kurma yeteneğinizi yansıtır.',
    roles: ['Kreatif Direktör', 'Dijital Ürün (UI/UX) Tasarımcısı', 'Medya & Yayıncılık Yöneticisi', 'Marka Kimliği Stratejisti', 'Görsel Yapımcı & Sanat Yönetmeni']
  },
  global: {
    id: 'global',
    title: 'Global Vizyon, Uluslararası Ticaret & Yüksek Akademi',
    shortTitle: 'Global Vizyon & Akademi',
    category: 'Global Vizyon & Akademi',
    color: '#F97316',
    description: 'Yerel sınırları aşarak çok uluslu ticaret, küresel stratejik ortaklıklar, yüksek akademik araştırmalar ve kitlelere yön veren felsefi danışmanlıkta kadersel söz sahibi olduğunuzu gösterir.',
    roles: ['Uluslararası Ticaret Direktörü', 'Akademisyen & Enstitü Başkanı', 'Küresel İş Geliştirme Danışmanı', 'Uluslararası Hukuk Müşaviri', 'Kurumsal Filozof & Stratejist']
  },
  human: {
    id: 'human',
    title: 'İnsan Kaynakları, Psikoloji & Büyüme Danışmanlığı',
    shortTitle: 'İnsan & Danışmanlık',
    category: 'Şifa & Danışmanlık',
    color: '#14B8A6',
    description: 'İnsan psikolojisinin derin dinamiklerini anlama, kurumlarda sadakat ve aidiyet ortamı yaratma, üst düzey yetenekleri keşfetme ve dönüştürücü koçluk verme kabiliyetinizi anlatır.',
    roles: ['İnsan Kaynakları Direktörü (CHRO)', 'Üst Düzey Yönetici Koçu & Mentor', 'Klinik Psikolog & Başdanışman', 'Kurumsal Kültür Mimarı', 'Sosyal Gelişim & Sağlık Lideri']
  }
};

export class CareerEngine {
  public static async analyze(
    fullName: string,
    birthDate: string,
    birthTime: string,
    birthCity: AstroCity
  ): Promise<CareerAnalysisResult> {
    // 1. Doğum Haritası Hesapla (Tüm Gezegenler, Evler ve Açılar)
    const m = moment.tz(`${birthDate} ${birthTime || '12:00'}`, birthCity.tz || 'Europe/Istanbul');
    const dateObj = m.toDate();
    const chart = await generateAstrologyChart(dateObj, birthCity);

    // 2. Numeroloji Hesapla
    const nameAnalysis = calculateNameAnalysis(fullName);
    const destinyNum = nameAnalysis.destiny;
    const lifePath = calculateLifePath(birthDate);
    const lifePathNum = lifePath.number;
    const birthDayNum = parseInt(birthDate.split('-')[2] || '1', 10);

    // 3. Human Design Hesapla
    let hdChart: HumanDesignChart | null = null;
    try {
      hdChart = generateChart(dateObj);
    } catch {
      hdChart = null;
    }
    const hdType = hdChart ? hdChart.type : 'Jeneratör';
    const hdStrategy = hdChart ? hdChart.strategy : 'Yanıt Vermek';
    const hdAuthority = hdChart ? hdChart.authority : 'Sakral Otorite';

    // 4. EVRENSEL GEZEGEN PUANLAMA MOTORU (Çok Katmanlı Ezoterik Skorlama)
    const scores: Record<string, number> = {
      technology: 8,
      finance: 8,
      leadership: 8,
      systems: 8,
      creative: 8,
      global: 8,
      human: 8
    };

    const findPlanet = (name: string): AstroPoint => {
      return chart.planets.find(p => p.name === name) || {
        name,
        longitude: 0,
        sign: 'Koç',
        degreeInSign: 0,
        minutes: 0,
        house: 1
      };
    };

    const sun = findPlanet('Güneş');
    const moon = findPlanet('Ay');
    const mercury = findPlanet('Merkür');
    const venus = findPlanet('Venüs');
    const mars = findPlanet('Mars');
    const jupiter = findPlanet('Jüpiter');
    const saturn = findPlanet('Satürn');
    const uranus = findPlanet('Uranüs');
    const neptune = findPlanet('Neptün');
    const pluto = findPlanet('Plüton');
    const northNode = findPlanet('Kuzey Ay Düğümü');

    const ascSign = chart.ascendant ? chart.ascendant.sign : 'Koç';
    const mcSign = chart.midheaven ? chart.midheaven.sign : 'Oğlak';
    const house2Sign = chart.houses[1] ? chart.houses[1].sign : 'Boğa';
    const house3Sign = chart.houses[2] ? chart.houses[2].sign : 'İkizler';
    const house6Sign = chart.houses[5] ? chart.houses[5].sign : 'Başak';

    // A) MERKÜR & MARS BİLİŞSEL VE MEKANİK ETKİLEŞİMİ (Kodlama & Algoritma Dehası)
    // Ezoterik kural: Merkür (kod/dil) + Mars (mekanik/alet/eylem) = Doğal Yazılımcı / Hacker / Mühendis
    chart.aspects.forEach(asp => {
      const pair = `${asp.planet1}-${asp.planet2}`;

      if (pair.includes('Merkür') && pair.includes('Mars')) {
        scores.technology += 36; // Bilişsel mekanik hız & kodlama
        scores.systems += 22;
        scores.leadership += 14;
      }
      if (pair.includes('Merkür') && pair.includes('Uranüs')) {
        scores.technology += 34; // Dijital zeka, yapay zeka & derin teknoloji
        scores.systems += 16;
      }
      if (pair.includes('Merkür') && pair.includes('Satürn')) {
        scores.systems += 30; // Derin veritabanı, mimari ve sabırlı kodlama
        scores.technology += 24;
      }
      if (pair.includes('Mars') && pair.includes('Uranüs')) {
        scores.technology += 22;
        scores.leadership += 20;
      }
      if ((pair.includes('Güneş') || pair.includes('Mars')) && pair.includes('Jüpiter')) {
        scores.global += 24;
        scores.leadership += 20;
      }
      if (pair.includes('Venüs') && (pair.includes('Merkür') || pair.includes('Neptün'))) {
        scores.creative += 26;
      }
      if (pair.includes('Ay') && pair.includes('Neptün')) {
        scores.human += 26;
      }
    });

    // B) 3. EV (Bilişsel Diller, Programlama ve Çocukluk Merakı)
    if (['Kova', 'Başak', 'İkizler', 'Akrep'].includes(house3Sign)) {
      scores.technology += 20;
      scores.systems += 14;
    }
    if ([mercury.house, mars.house, uranus.house, saturn.house].includes(3)) {
      scores.technology += 24; // Çocukluktan beri bilgisayara ve koda çekilme
      scores.systems += 16;
    }

    // C) 6. EV (Teknik Zanaat, Masadaki Fiili İş)
    if (['Kova', 'Başak', 'Akrep', 'Oğlak'].includes(house6Sign)) {
      scores.systems += 22;
      scores.technology += 20;
    }
    if (uranus.house === 6) {
      scores.technology += 35;
      scores.systems += 18;
    }
    if (mercury.house === 6) {
      scores.technology += 30;
      scores.systems += 25;
    }
    if (mars.house === 6) {
      scores.systems += 26;
      scores.technology += 18;
    }

    // D) 10. EV (MC - Kariyer Zirvesi ve Toplumsal Unvan)
    if (uranus.house === 10 || uranus.house === 9) {
      scores.technology += 42;
      scores.leadership += 18;
    }
    if (mercury.house === 10) {
      scores.technology += 32;
      scores.systems += 24;
    }
    if (saturn.house === 10) {
      scores.systems += 32;
      scores.leadership += 20;
    }
    if (sun.house === 10) {
      scores.leadership += 32;
    }
    if (jupiter.house === 10) {
      scores.global += 32;
      scores.finance += 24;
    }
    if (pluto.house === 10) {
      scores.finance += 26;
      scores.technology += 18;
      scores.leadership += 22;
    }

    // E) GEZEGEN BURÇ ASİLETLERİ (Dignities)
    if (mercury.sign === 'Başak') {
      scores.technology += 38;
      scores.systems += 30;
    } else if (mercury.sign === 'İkizler' || mercury.sign === 'Kova') {
      scores.technology += 28;
      scores.creative += 20;
    } else if (mercury.sign === 'Akrep' || mercury.sign === 'Oğlak') {
      scores.technology += 20;
      scores.systems += 24;
    }

    if (['Kova', 'Başak', 'İkizler', 'Yay'].includes(uranus.sign)) {
      scores.technology += 18;
    }
    if (['Oğlak', 'Akrep', 'Başak'].includes(saturn.sign)) {
      scores.systems += 28;
      scores.finance += 20;
    }
    if (['Akrep', 'Koç', 'Oğlak'].includes(mars.sign)) {
      scores.leadership += 24;
      scores.systems += 20;
      scores.technology += 14;
    }
    if (['Aslan', 'Koç', 'Yay'].includes(sun.sign)) {
      scores.leadership += 28;
      scores.global += 18;
    }
    if (['Yay', 'Balık', 'Yengeç', 'Boğa'].includes(jupiter.sign)) {
      scores.global += 26;
      scores.finance += 22;
    }
    if (['Terazi', 'Boğa', 'Balık'].includes(venus.sign)) {
      scores.creative += 28;
      scores.human += 20;
    }
    if (['Yengeç', 'Boğa', 'Balık'].includes(moon.sign)) {
      scores.human += 26;
    }

    // F) YÜKSELEN BURÇ KATKISI
    if (['Kova', 'Başak', 'İkizler'].includes(ascSign)) {
      scores.technology += 22;
      scores.systems += 18;
    } else if (['Koç', 'Aslan'].includes(ascSign)) {
      scores.leadership += 22;
    } else if (['Boğa', 'Oğlak'].includes(ascSign)) {
      scores.finance += 20;
      scores.systems += 20;
    }

    // G) NUMEROLOJİ (Yaşam Yolu, Doğum Günü Sayısı & İsim)
    // Yaşam Yolu 7 (Analist, Kodlayıcı, Hacker) veya 4 (Sistem Mimarı)
    if (lifePathNum === 7) {
      scores.technology += 32;
      scores.systems += 22;
    } else if (lifePathNum === 4) {
      scores.systems += 30;
      scores.technology += 20;
    } else if (lifePathNum === 1 || lifePathNum === 5) {
      scores.leadership += 26;
    } else if (lifePathNum === 8 || lifePathNum === 22) {
      scores.finance += 28;
      scores.leadership += 20;
    }

    // Doğum Günü Sayısı (4, 7, 13, 22, 25, 31 teknik zekadır)
    if ([4, 7, 13, 22, 25, 31].includes(birthDayNum)) {
      scores.technology += 20;
      scores.systems += 18;
    }

    // İsim Kader Sayısı
    if (destinyNum === 7) scores.technology += 22;
    else if (destinyNum === 4) scores.systems += 24;
    else if (destinyNum === 8 || destinyNum === 22) scores.finance += 24;
    else if (destinyNum === 1) scores.leadership += 22;
    else if (destinyNum === 3) scores.creative += 24;
    else if (destinyNum === 2 || destinyNum === 6) scores.human += 24;
    else if (destinyNum === 9) scores.global += 22;

    // H) HUMAN DESIGN TİPİ
    if (hdType === 'Manifesting Jeneratör') {
      scores.technology += 16;
      scores.leadership += 16;
    } else if (hdType === 'Manifestör') {
      scores.leadership += 20;
    } else if (hdType === 'Projektör') {
      scores.systems += 18;
      scores.human += 18;
    }

    // 5. TÜM 7 SEKTÖRÜN BİREBİR TEKİL %100 DAĞILIMI
    const totalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);
    const sortedSectorKeys = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);

    const percentages: Record<string, number> = {};
    let sumPercentages = 0;
    sortedSectorKeys.forEach(k => {
      const pct = Math.max(3, Math.round((scores[k] / totalScore) * 100));
      percentages[k] = pct;
      sumPercentages += pct;
    });

    const diff = 100 - sumPercentages;
    percentages[sortedSectorKeys[0]] += diff;

    // İlk 3 Zirve Sektör
    const topSectors: CareerSectorMatch[] = sortedSectorKeys.slice(0, 3).map(key => {
      const def = SECTOR_DEFINITIONS[key];
      const pct = percentages[key];
      return {
        id: def.id,
        title: def.title,
        shortTitle: def.shortTitle,
        category: def.category,
        fitScore: pct,
        percentage: pct,
        color: def.color,
        recommendedRoles: def.roles,
        description: def.description
      };
    });

    // Kalan 4 İkincil Sektör
    const secondarySectors: SecondarySectorMatch[] = sortedSectorKeys.slice(3).map(key => {
      const def = SECTOR_DEFINITIONS[key];
      return {
        id: def.id,
        title: def.title,
        shortTitle: def.shortTitle,
        category: def.category,
        percentage: percentages[key],
        color: def.color,
        recommendedRoles: def.roles.slice(0, 3)
      };
    });

    // 7 Sektörün Spektrum Çubuğu
    const segments: CareerEnergySegment[] = sortedSectorKeys.map(key => {
      const def = SECTOR_DEFINITIONS[key];
      return {
        id: def.id,
        title: def.shortTitle,
        category: def.category,
        percentage: percentages[key],
        color: def.color
      };
    });

    // 6. ÖZET ROZETLER
    let leadershipStyle = 'Stratejik, Vizyoner & İnovatif';
    if (scores.technology >= scores.leadership && scores.technology >= scores.finance) {
      leadershipStyle = 'Analitik, Sistem Kuran & İnovasyon Odaklı';
    } else if (scores.leadership >= scores.technology && scores.leadership >= scores.finance) {
      leadershipStyle = 'Cesur, Hızlı İnisiyatif Alan & Öncü';
    } else if (scores.finance >= scores.technology) {
      leadershipStyle = 'Metodik, Sermaye Büyüten & Güvenilir';
    }

    let workDynamic = 'Sürdürülebilir Üretim & Derin Uzmanlık';
    if (hdType === 'Projektör') workDynamic = 'Stratejik Yönetim & Danışmanlık';
    else if (hdType === 'Manifestör') workDynamic = 'Bağımsız Başlatıcılık & İnovasyon';
    else if (hdType === 'Manifesting Jeneratör') workDynamic = 'Çok Kanallı Hızlı İcraat & Büyüme';
    else if (hdType === 'Reflektör') workDynamic = 'Yüksek Vizyon & Tarafsız Denetim';

    const coreAsset = topSectors[0].title;
    const decisionMotto = `${hdStrategy} & ${hdAuthority.replace('Otorite', '').trim()} Karar Modeli`;

    // 7. İDEAL ÇALIŞMA MODELİ
    let idealModelType: 'Girişimci & Bağımsız Kurucu' | 'Kurumsal Lider & Üst Yönetici' | 'Stratejik Rehber & Danışman' | 'Özerk Uzman & Zanaatkar' = 'Girişimci & Bağımsız Kurucu';
    let idealModelExp = '';
    let idealPercent = 92;

    if (topSectors[0].category === 'Teknoloji & İnovasyon' || ['Koç', 'Yay', 'Kova'].includes(mcSign) || hdType === 'Manifestör' || destinyNum === 1) {
      idealModelType = 'Girişimci & Bağımsız Kurucu';
      idealModelExp = 'Başkalarının katı bürokrasisi altında çalışmak yaratıcı ve teknolojik üretim kapasitenizi sınırlar. Kendi kurallarınızı koyduğunuz bağımsız projeler, teknoloji kuruculuğu veya serbest start-up modelleri sizin en yüksek verim ve kadersel doyum alanınızdır.';
      idealPercent = 96;
    } else if (['Oğlak', 'Aslan', 'Boğa'].includes(mcSign) || destinyNum === 8 || destinyNum === 4 || destinyNum === 22) {
      idealModelType = 'Kurumsal Lider & Üst Yönetici';
      idealModelExp = 'Büyük bütçeleri, organizasyonları ve sağlam kurumsal mekanizmaları yönetebilecek doğal bir otorite ve organizasyonel güç taşırsınız. Kurumların icra kurullarında veya holding zirvelerinde kalıcı bir miras inşa edersiniz.';
      idealPercent = 94;
    } else if (hdType === 'Projektör' || destinyNum === 2 || destinyNum === 7 || destinyNum === 11) {
      idealModelType = 'Stratejik Rehber & Danışman';
      idealModelExp = 'Operasyonel angaryalardan uzaklaşıp üst düzey liderlere veya kurumlara stratejik mimari çizdiğiniz başdanışmanlık modeli size en yüksek saygınlığı ve finansal akışı sağlar.';
      idealPercent = 91;
    } else {
      idealModelType = 'Özerk Uzman & Zanaatkar';
      idealModelExp = 'Kendi alanında en derin bilgiye sahip, teknik ustalığıyla aranılan ve kalite standartlarını kendisi belirleyen özerk bir çalışma biçimi sizin için idealdir.';
      idealPercent = 89;
    }

    // 8. YENİ EZOTERİK DERİNLİKLER:
    // A) KARİYER ODAK STRATEJİSİ (Tek Alanda Derinleşme mi, Çok Kanallı Polimat mı?)
    const focusStrategy = calculateFocusStrategy(chart, saturn, hdType, mcSign);

    // B) KADERSEL EVRİLME (DHARMA) - Kuzey Ay Düğümü Yolu
    const dharmaPath = calculateDharmaPath(northNode);

    // C) PARA & SERVET ÇEKME MODELİ (Şans Noktası & 2. Ev)
    const wealthMagnet = calculateWealthMagnet(house2Sign, topSectors[0].id);

    // D) TÜKENMİŞLİK KALKANI (Burnout Kalkanı)
    const burnoutShield = calculateBurnoutShield(hdType, topSectors[0].category);

    // 9. SÜPER GÜÇ VE GÖLGE TUZAKLAR
    const dominantCategory = topSectors[0].category;
    const superPower = generateCleanMultiPlanetSuperPower(dominantCategory, mercury.sign, uranus.house, destinyNum);
    const shadowPitfalls = generateCleanMultiPlanetShadowPitfall(dominantCategory, saturn.sign);

    // 10. 4 STRATEJİK EYLEM ADIMI
    const actionableGuidance = generateActionableGuidance(dominantCategory, hdType, destinyNum, house2Sign);

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
      focusStrategy,
      dharmaPath,
      wealthMagnet,
      burnoutShield,
      superPower,
      shadowPitfalls,
      topSectors,
      secondarySectors,
      energyDistribution: {
        segments
      },
      actionableGuidance
    };
  }
}

// YARDIMCI EZOTERİK MOTOR HESAPLAMALARI:

function calculateFocusStrategy(chart: NatalChartData, saturn: AstroPoint, hdType: string, mcSign: string): FocusStrategyData {
  const isSaturnDominant = saturn.house === 10 || saturn.house === 1 || saturn.house === 6;
  const isMutableOrPolymath = ['İkizler', 'Yay', 'Kova'].includes(mcSign) || hdType === 'Manifesting Jeneratör';

  if (isSaturnDominant && !isMutableOrPolymath) {
    return {
      type: 'Tek Alanda Derinleşme & Otorite',
      motto: '10.000 Saat Kuralı & Sarsılmaz Niş Uzmanlık',
      explanation: 'Haritanızdaki Satürn ve yapı odaklı yerleşimler, enerjinizi birden fazla sektöre bölmenizin başarı hızınızı baltalayacağını gösterir. Başarı reçeteniz: Birbirinden bağımsız 3-4 işle uğraşmak yerine, tek bir çekirdek alanda sektörün en derin uzmanı olmak ve referans otorite haline gelmektir.',
      actionAdvice: 'Aynı anda birden fazla bağımsız sektöre dağılmayın. 1. sıradaki ana uzmanlığınıza odaklanın; diğer alanları sadece ana uzmanlığınızı besleyen yan araçlar olarak kullanın.'
    };
  }

  return {
    type: 'Çok Kanallı (Polimat) Hibrit Kariyer',
    motto: 'Çoklu Gelir Akışı & Paralel Portföy Kariyeri',
    explanation: 'Haritanız tek bir mesaiye, tek bir unvana veya tek bir sektöre hapsedilemeyecek kadar çok kanallı ve dinamik bir zihne işaret eder. Sizi tek bir masa başına veya tek bir iş tanımına mahkum etmek motivasyonunuzu köreltir. Birden fazla işi, yan projeyi ve sektörü eşzamanlı besleme potansiyeliniz bulunur.',
    actionAdvice: 'Kendinizi sadece tek bir unvanla sınırlamayın. Ana sektörünüzün yanında 2. ve 3. alanlarınızı paralel projeler, dijital yan gelirler veya yatırım kolları olarak hayatınızda eşzamanlı yaşatın.'
  };
}

function calculateDharmaPath(northNode: AstroPoint): DharmaPathData {
  const sign = northNode.sign || 'Kova';
  const nodeInterpretations: Record<string, { title: string; from: string; to: string; impact: string }> = {
    'Koç': {
      title: 'Bağımsız Öncülük ve İnisiyatif Rotası',
      from: 'Başkalarının onayını bekleme ve aşırı uyum konfor alanı',
      to: 'Kendi bağımsız vizyonunun arkasında durarak ilk adımı atma cesareti',
      impact: 'Kariyerinizde başkalarına sırtınızı dayamayı bıraktığınız an devasa bir sıçrama yaşarsınız.'
    },
    'Boğa': {
      title: 'Somut Varlık ve Kalıcı Değer Üretim Rotası',
      from: 'Sürekli kriz yönetimi ve başkalarının finansal kaoslarına kapılma',
      to: 'Kendi üretken varlıklarını, mülklerini ve sağlam sermayesini inşa etme',
      impact: 'Kısa vadeli çalkantılardan uzaklaşıp kalıcı ve elle tutulur ürünler ürettiğinizde zenginlik kapınız açılır.'
    },
    'İkizler': {
      title: 'Dijital İletişim, Kod ve Çok Kanallı Ağlar Rotası',
      from: 'Aşırı soyut felsefi teoriler ve hayatta karşılığı olmayan büyük iddialar',
      to: 'Pratik kodlama, bilgi ticareti, dijital diller ve hızlı piyasa köprüleri kurma',
      impact: 'Bilgiyi pratik araçlara ve dijital ürünlere dönüştürdüğünüzde kariyeriniz küresel ölçeğe ulaşır.'
    },
    'Yengeç': {
      title: 'Koruyucu Güven Alanı ve Topluluk Liderliği Rotası',
      from: 'Duygusuz, katı kurumsal hiyerarşilerde sadece unvan için yıpranma',
      to: 'İnsanlara güven veren, aidiyet yaratan ve kendi ekosistemini koruyan liderlik',
      impact: 'Çalışanlarınıza ve müşterilerinize sadakat ve güven hissettirdiğinizde rakipsiz olursunuz.'
    },
    'Aslan': {
      title: 'Yaratıcı Sahne ve Karizmatik Marka Rotası',
      from: 'Kolektif kalabalıkların arkasında saklanıp anonim kalarak yetenekleri gizleme',
      to: 'Kendi kişisel markasını cesurca öne çıkarıp projenin vitrin yüzü olma',
      impact: 'Perde arkasından sahneye çıktığınız gün hak ettiğiniz finansal değere ve saygınlığa ulaşırsınız.'
    },
    'Başak': {
      title: 'Metodik Ustalık, Süreç Optimizasyonu ve Teknik Zanaat Rotası',
      from: 'Kaotik hayallere kapılıp detayları ve disiplini küçümseme',
      to: 'Saat gibi işleyen sistemler, kusursuz kodlama ve analitik kalite standartları kurma',
      impact: 'Süreçleri mükemmelleştirip kimsenin fark edemediği hataları çözdüğünüzde sektörün aranan ismi olursunuz.'
    },
    'Terazi': {
      title: 'Stratejik İttifaklar ve Diplomatik Müzakere Rotası',
      from: 'Her şeyi tek başına yapmaya çalışıp tek tabanca inatlaşma',
      to: 'Güçlü ortaklıklar kurma, iki tarafı da kazandıran sözleşmeler bağlama',
      impact: 'Doğru ortaklarla el sıkıştığınızda işleriniz tek başınıza yapabileceğinizin 10 katı büyür.'
    },
    'Akrep': {
      title: 'Stratejik Kriz Dönüşümü ve Derin Sermaye Rotası',
      from: 'Yüzeysel konfor alanına saplanıp değişimden korkma',
      to: 'Riskleri yönetme, siber güvenlik, kriz fırsatları ve derin dönüşüm yönetimi',
      impact: 'Başkalarının korkup kaçtığı zorlu problemleri çözdüğünüzde kadersel servet kapılarınız aralanır.'
    },
    'Yay': {
      title: 'Küresel Vizyon, İhracat ve Yüksek Ufuklar Rotası',
      from: 'Dar yerel piyasa dedikodularında ve küçük hesaplarda boğulma',
      to: 'Uluslararası standartlar, yabancı diller, döviz bazlı ihracat ve küresel felsefe',
      impact: 'Vizyonunuzu sınırların ötesine taşıdığınızda gerçek potansiyelinizin kilidi açılır.'
    },
    'Oğlak': {
      title: 'Kurumsal Zirve, Büyük Mimarlık ve Kalıcı Miras Rotası',
      from: 'Duygusal savrulmalarla kararlar alıp disiplinsiz davranma',
      to: 'Sarsılmaz çalışma ahlakı, uzun vadeli strateji ve tepe yöneticilik',
      impact: 'Sabırla 5-10 yıllık bir zirve planı yaptığınızda zamana meydan okuyan bir miras inşa edersiniz.'
    },
    'Kova': {
      title: 'Yapay Zeka, Derin Teknoloji ve Kolektif Devrim Rotası',
      from: 'Sadece kişisel egoya ve dar çıkarlara odaklanıp geleneksel yolları tekrarlama',
      to: 'Yapay zeka, dijital platformlar, açık kaynak ve geleceği şekillendiren teknolojiler',
      impact: 'Kalıpları kırıp topluma çağ atlatacak inovatif çözümler ürettiğinizde çağın öncüsü olursunuz.'
    },
    'Balık': {
      title: 'Vizyoner Sezgi, Sanat ve Holistik Dönüşüm Rotası',
      from: 'Ruhsuz katı mantık labirentlerinde sıkışıp iç sesini bastırma',
      to: 'İlham, sinematik vizyon, psikolojik sezgi ve insan ruhuna dokunan projeler',
      impact: 'Mantığınızın yanına sezgilerinizi eklediğinizde piyasanın göremediği fırsatları önceden yakalarsınız.'
    }
  };

  const item = nodeInterpretations[sign] || nodeInterpretations['Kova'];
  return {
    title: item.title,
    fromComfortZone: item.from,
    toGrowthMission: item.to,
    careerImpact: item.impact
  };
}

function calculateWealthMagnet(house2Sign: string, primarySectorId: string): WealthMagnetData {
  if (primarySectorId === 'technology' || ['Kova', 'Başak', 'İkizler'].includes(house2Sign)) {
    return {
      channelTitle: 'Dijital Lisans, SaaS & Zamandan Bağımsız Telif Modeli',
      mechanism: 'Saatlik mesainizi satmak yerine; bir kez kodlayıp defalarca satılan yazılım abonelikleri, dijital ürünler ve fikri mülkiyet hakları üzerinden para çekersiniz.',
      practicalFormula: 'Aktif emeğe dayalı kazanç modelinden hızla sıyrılıp, yinelenen gelir getiren dijital platform ve lisans kurgularına odaklanın.'
    };
  }
  if (primarySectorId === 'leadership' || ['Koç', 'Aslan'].includes(house2Sign)) {
    return {
      channelTitle: 'Hisse Payı, Girişim Sermayesi & C-Level Başarı Primleri',
      mechanism: 'Sabit maaşla yetinmek yerine; kurduğunuz veya ölçeklediğiniz şirketlerin hisse opsiyonları, büyüme primleri ve pazar inisiyatifleri üzerinden büyük refaha ulaşırsınız.',
      practicalFormula: 'Projelerde sadece icracı değil hissedar olun; risk aldığınız oranda katlanarak büyüyen bir nakit akışı inşa edin.'
    };
  }
  if (primarySectorId === 'finance' || ['Boğa', 'Oğlak', 'Akrep'].includes(house2Sign)) {
    return {
      channelTitle: 'Kalıcı Portföy, Gayrimenkul & Bileşik Getiri Havuzu',
      mechanism: 'Somut varlıklar, kira getiren ticari mülkler, fon yatırımları ve kriz arbitrajı üzerinden nesiller boyu erimeyecek bir servet inşa edersiniz.',
      practicalFormula: 'Elde ettiğiniz geliri spekülatif tüketim yerine üretken gayrimenkul ve güvenli sermaye araçlarına yönlendirerek bileşik büyüme sağlayın.'
    };
  }
  return {
    channelTitle: 'Yüksek Uzmanlık Sözleşmeleri & Stratejik Ortaklık Gelirleri',
    mechanism: 'Piyasanın çözemediği kritik düğümleri çözerek tek seferde yüksek danışmanlık ücreti alma ve stratejik ortaklık komisyonları üzerinden refah sağlarsınız.',
    practicalFormula: 'Hizmetlerinizi genel piyasa fiyatlarından ayrıştırıp, yalnızca en üst segment kurumlara stratejik değer vadeden butik sözleşmeler yapın.'
  };
}

function calculateBurnoutShield(hdType: string, dominantCategory: string): BurnoutShieldData {
  if (hdType === 'Projektör') {
    return {
      coreRisk: 'Haftada 50+ saat aralıksız operasyonel amelelik yapmak ve davetsiz ortamlarda kendini ispatlamaya çalışmak.',
      toxicEnvironments: 'Katı mesai saatlerinin dayatıldığı, bedensel eforun zekanın önüne geçtiği ve uzmanlığın takdir edilmediği mikro-yönetim şirketleri.',
      protectionFormula: 'Günde maksimum 4-5 saat yüksek odaklı stratejik danışmanlık yapın; dinlenme aralıklarınızı takviminize bir iş görevi gibi sabitleyin.'
    };
  }
  if (hdType === 'Manifestör') {
    return {
      coreRisk: 'Başkalarından izin beklemek, hantal bürokratik onay süreçlerinde sıkışmak ve kontrol edilmek.',
      toxicEnvironments: 'Her kararın 10 farklı komite tarafından onaylandığı, hiyerarşik ve vizyonsuz kurumlar.',
      protectionFormula: 'Aksiyona geçmeden önce etrafınızdakileri kısaca bilgilendirin ve kendi bağımsız operasyonel alanınızı koruyun.'
    };
  }
  if (dominantCategory === 'Teknoloji & İnovasyon') {
    return {
      coreRisk: 'Kusursuzluk takıntısıyla projeyi yayına almayı ertelemek ve kimseye güvenemeyip her satırı tek başına kodlamaya çalışmak.',
      toxicEnvironments: 'Teknik vizyonu olmayan yöneticilerin gerçekçi olmayan teslim süreleri dayattığı plansız yazılım ekipleri.',
      protectionFormula: 'Hızlı MVP (prototip) kültürü benimseyin; tekrarlayan işleri otomatize edin ve delegasyon sınırlarınızı net çizin.'
    };
  }
  return {
    coreRisk: 'Sınır koyamamak, başkalarının iş yükünü sırtlanmak ve dinlenme zamanını suçluluk hissiyle heba etmek.',
    toxicEnvironments: 'Sınırların belirsiz olduğu, mesai dışı taleplerin normalleştiği kaotik çalışma ortamları.',
    protectionFormula: 'Haftalık "işe kapalı" kutsal saatler belirleyin; enerjinizi sadece en yüksek katma değer üreten 1-2 göreve teksif edin.'
  };
}

function generateCleanMultiPlanetSuperPower(category: string, mercurySign: string, uranusHouse: number, destinyNum: number): string {
  if (category === 'Teknoloji & İnovasyon' || mercurySign === 'Başak' || uranusHouse === 10) {
    return 'Doğuştan gelen keskin algoritmik mantık, karmaşık sistemleri hızla haritalandırma yetisi ve çağının ötesindeki teknolojik vizyon haritanızda kusursuz bir uyumla birleşiyor. En çetrefilli yazılım ve altyapı problemlerini kimsenin göremediği pratik metotlarla çözerek yüksek katma değerli dijital eserlere dönüştürme gücüne sahipsiniz.';
  }
  if (category === 'Finans & Strateji') {
    return 'Maddi kaynakları, sermaye piyasalarını ve kurumsal güç dengelerini yüksek bir stratejik zeka ile yönetme kabiliyetiniz en büyük kozunuzdur. Kriz dönemlerinde dahi fırsatları önceden sezerek kalıcı finansal kaleler inşa etme dehanız bulunur.';
  }
  if (category === 'Liderlik & Girişim') {
    return 'Piyasada ilk adımı atma cesareti, riskleri hızla yönetilebilir fırsatlara çevirme ve ekipleri peşinizden sürükleyen karizmatik icra gücünüz doğuştan gelen en parlak liderlik donanımınızdır.';
  }
  if (category === 'Organizasyon & Sistem') {
    return 'Kaotik operasyonları saat gibi tıkır tıkır çalışan sistemlere dönüştürme, mimari standartları belirleme ve en ince ayrıntıya kadar kaliteyi tescilleme ustalığınız sektörde sizi vazgeçilmez kılar.';
  }
  if (category === 'Sanat & İletişim') {
    return 'Kullanıcıların zihnini ve kalbini fetheden görsel/estetik deha ile bilgiyi kitlelere kusursuz bir dille aktarma gücünüz yaratıcı endüstrilerde benzersiz bir marka değeri yaratır.';
  }
  return 'Geniş ufuklu küresel vizyonunuz ile insan odaklı stratejik aklınız birleşerek en zorlu piyasa şartlarında dahi doğru rotayı çizip projeleri zirveye taşımanızı sağlar.';
}

function generateCleanMultiPlanetShadowPitfall(category: string, saturnSign: string): string {
  if (category === 'Teknoloji & İnovasyon') {
    return 'Kariyerinizde dikkat etmeniz gereken en büyük gölge tuzak: "Kusursuzluk arayışıyla projeleri yayına almayı geciktirmek ve her şeyi tek başına kodlamaya çalışmak". Harika fikirlerinizi prototip aşamasında erkenden sahaya sürmeli; zamanınızı tüketen ikincil teknik detayları ekibe veya otomatik araçlara devretmeyi öğrenmelisiniz.';
  }
  if (category === 'Finans & Strateji') {
    return 'Kariyerinizde dikkat etmeniz gereken en büyük gölge tuzak: "Aşırı kontrolcülük ve kriz anlarında gücü tamamen elde tutma takıntısı". Aşırı kuşkuculuktan kaçınmalı, güvenilir ortaklık mekanizmaları kurarak büyüme hızınızı korumalısınız.';
  }
  if (category === 'Liderlik & Girişim') {
    return 'Kariyerinizde dikkat etmeniz gereken en büyük gölge tuzak: "Sabırsızlıkla köprüleri erken yakmak ve bürokratik detaylara tahammülsüzlük". Hızlı kararlar alırken ekibin hızınıza yetişmesine izin vermeli; stratejik sabrı elden bırakmamalısınız.';
  }
  return 'Kariyerinizde dikkat etmeniz gereken en büyük gölge tuzak: "Kendi sınırlarınızı aşırı zorlayarak tükenmişlik yaşamak". Dinlenme ve odaklanma dengesini koruyarak enerjinizi yalnızca en yüksek katma değer üreten alanlara teksif etmelisiniz.';
}

function generateActionableGuidance(category: string, hdType: string, destinyNum: number, house2Sign: string): string[] {
  const step1 = category === 'Teknoloji & İnovasyon'
    ? 'Fikirlerinizi uzun süre arka planda saklamak yerine hızlı prototiplerle (MVP) sahaya sürün; kodunuzu ve dijital ürünlerinizi erken kullanıcı geri bildirimiyle büyüterek pazarda doğal otorite kurun.'
    : 'Bürokrasiyi veya başkalarının onayını beklemeyin. Projenizi ilk pilot model olarak hızla devreye alın; inisiyatif alıp sonuç ürettiğinizde doğal lider olarak otoriteyi devralırsınız.';

  let step2 = 'İçsel heyecanınızın ve enerjinizin gerçekten "evet" dediği iş tekliflerine ve projelere odaklanın; sevdiğiniz uzmanlıkta yorulmadan devleşirsiniz.';
  if (hdType === 'Projektör') step2 = 'Yeteneğinizin ve bilginizin resmi olarak takdir edildiği başdanışman, sistem mimarı ve stratejik yönetici rollerini seçin.';
  else if (hdType === 'Manifestör') step2 = 'Kimseden izin veya icazet beklemeyin; yeni projeleri doğrudan başlatan öncü gücünüzü kullanın.';
  else if (hdType === 'Manifesting Jeneratör') step2 = 'Aynı anda birkaç yenilikçi teknoloji ve iş kolunu paralel yönetme kabiliyetinizi kucaklayın; gereksiz operasyonel ağırlıkları erkenden devredin.';

  const step3 = destinyNum === 7 || destinyNum === 4
    ? 'Yüzeysel piyasa trendlerine kapılmak yerine konunuzun en derin algoritmik ve sistemik üstadı olarak pozisyon alın; derin uzmanlık size kalıcı saygınlık ve yüksek kazanç getirecektir.'
    : destinyNum === 8 || destinyNum === 22
    ? 'Teknolojik ve operasyonel bilginizi büyük bütçeleri yönetme kabiliyetiyle birleştirin; hisse opsiyonları ve kurumsal pay sahipliği üzerinden servet inşa edin.'
    : 'Özgün vizyonunuzu ve bağımsız çalışma iradenizi projelerinizin merkezine koyun; takipçi değil standart belirleyici olun.';

  const step4 = ['Kova', 'Başak', 'İkizler'].includes(house2Sign)
    ? 'Yazılım abonelikleri (SaaS), teknoloji lisansları, dijital ürünler ve yüksek uzmanlık danışmanlığı üzerinden çok kanallı gelir akışı kurgulayın.'
    : 'Kalıcı gayrimenkul mülkleri, şirket hisseleri ve üretken varlıklar üzerinden sermayenizi büyüterek zamana meydan okuyan bir finansal koruma kalkanı oluşturun.';

  return [step1, step2, step3, step4];
}
