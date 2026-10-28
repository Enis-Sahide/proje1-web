import { generateAstrologyChart } from './AstrologyEngine';
import { AstroCity, NatalChartData, AstroPoint, AstroAspect } from './AstrologyConstants';
import { calculateNameAnalysis } from '@/utils/numerologyCalculator';
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

interface SectorDefinition {
  id: string;
  title: string;
  category: CareerSectorMatch['category'];
  description: string;
  roles: string[];
}

const SECTOR_DEFINITIONS: Record<string, SectorDefinition> = {
  technology: {
    id: 'technology',
    title: 'Yazılım Mimarisi, Yapay Zeka & Derin Teknoloji',
    category: 'Teknoloji & İnovasyon',
    description: 'Bilişim sistemleri, algoritmik yazılım mimarisi, yapay zeka entegrasyonları ve ölçeklenebilir dijital platformlar inşa etme konusunda doğuştan gelen yüksek analitik problem çözme dehanızı temsil eder.',
    roles: ['Yazılım Mimarı & Full-Stack Mühendis', 'Yapay Zeka & Algoritma Geliştirici', 'Teknoloji Kurucusu (CTO / Founder)', 'Bulut & Sistem Altyapı Direktörü', 'Siber Güvenlik & Veri Analisti']
  },
  finance: {
    id: 'finance',
    title: 'Büyük Sermaye, Yatırım Stratejisi & Varlık Yönetimi',
    category: 'Finans & Strateji',
    description: 'Maddi kaynakları vizyoner hedefler doğrultusunda büyütme, portföy ve fon yönetimi, şirket satın almaları ve stratejik sermaye kurgularında söz sahibi olma gücünüzü simgeler.',
    roles: ['Yatırım Bankacısı & Portföy Yöneticisi', 'Özel Sermaye (PE) & Fon Direktörü', 'Finansal Stratejist & CFO', 'Gayrimenkul Geliştirme Yatırımcısı', 'Kriz Arbitrajı & Varlık Değerleme Uzmanı']
  },
  leadership: {
    id: 'leadership',
    title: 'Bağımsız Girişimcilik, Start-up & İcra Kurulu Liderliği',
    category: 'Liderlik & Girişim',
    description: 'Piyasada ilk adımı atma cesareti, start-up projelerini hızla ölçekleme, kriz anlarında inisiyatif alarak ekiplere ve şirketlere kararlı bir şekilde yön verme kudretinizi açığa çıkarır.',
    roles: ['Şirket Kurucusu & CEO', 'Start-up Büyüme Direktörü (Scale-up)', 'Kriz & Dönüşüm Yöneticisi', 'Girişim Sermayesi (VC) Ortağı', 'Operasyonel İcra Lideri']
  },
  systems: {
    id: 'systems',
    title: 'Sistem Mimarisi, Mühendislik & Süreç Optimizasyonu',
    category: 'Organizasyon & Sistem',
    description: 'Karmaşık operasyonel süreçlerden saat gibi işleyen kusursuz düzenler çıkarma, kalite güvence, endüstriyel altyapı ve sürdürülebilir organizasyonel standartlar inşa etme dehanızdır.',
    roles: ['Operasyon Direktörü (COO)', 'Endüstriyel & Sistem Mühendisi', 'Süreç Optimizasyon Danışmanı', 'Kurumsal Denetim & Kalite Başkanı', 'Büyük Ölçekli Proje Yöneticisi']
  },
  creative: {
    id: 'creative',
    title: 'Dijital Ürün Tasarımı, Medya & Kreatif İletişim',
    category: 'Sanat & İletişim',
    description: 'Kullanıcı deneyimi (UI/UX), marka kimliği, yaratıcı içerik üretimi, görsel sanatlar ve kitleleri derinden etkileyen çok kanallı iletişim ağları kurma yeteneğinizi yansıtır.',
    roles: ['Kreatif Direktör', 'Dijital Ürün (UI/UX) Tasarımcısı', 'Medya & Yayıncılık Yöneticisi', 'Marka Kimliği Stratejisti', 'Görsel Yapımcı & Sanat Yönetmeni']
  },
  global: {
    id: 'global',
    title: 'Global Vizyon, Uluslararası Ticaret & Yüksek Akademi',
    category: 'Global Vizyon & Akademi',
    description: 'Yerel sınırları aşarak çok uluslu ticaret, küresel stratejik ortaklıklar, yüksek akademik araştırmalar ve kitlelere yön veren felsefi danışmanlıkta kadersel söz sahibi olduğunuzu gösterir.',
    roles: ['Uluslararası Ticaret Direktörü', 'Akademisyen & Enstitü Başkanı', 'Küresel İş Geliştirme Danışmanı', 'Uluslararası Hukuk Müşaviri', 'Kurumsal Filozof & Stratejist']
  },
  human: {
    id: 'human',
    title: 'İnsan Kaynakları, Psikoloji & Büyüme Danışmanlığı',
    category: 'Şifa & Danışmanlık',
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

    // 4. EVRENSEL GEZEGEN PUANLAMA MOTORU (Multi-Planet Weighted Scoring)
    const scores: Record<string, number> = {
      technology: 10,
      finance: 10,
      leadership: 10,
      systems: 10,
      creative: 10,
      global: 10,
      human: 10
    };

    // Gezegenleri bul
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

    const mcSign = chart.midheaven.sign;
    const house2 = chart.houses[1] ? chart.houses[1].sign : 'Boğa';
    const house6 = chart.houses[5] ? chart.houses[5].sign : 'Başak';
    const house10 = chart.houses[9] ? chart.houses[9].sign : mcSign;

    // A) URANÜS DEĞERLENDİRMESİ (Yazılım, Teknoloji, Yapay Zeka, İnovasyon)
    if (uranus.house === 10 || uranus.house === 9) {
      scores.technology += 42; // Kariyer zirvesinde doğrudan bilişim/yazılım
      scores.leadership += 18;
    } else if (uranus.house === 6) {
      scores.technology += 35; // Günlük teknik uzmanlık
      scores.systems += 15;
    } else if (uranus.house === 1 || uranus.house === 11) {
      scores.technology += 28;
      scores.leadership += 20;
    } else if (uranus.house === 3) {
      scores.technology += 24; // Kodlama ve dijital diller
      scores.creative += 12;
    }
    if (['Kova', 'Başak', 'İkizler', 'Yay'].includes(uranus.sign)) {
      scores.technology += 18;
    }

    // B) MERKÜR DEĞERLENDİRMESİ (Algoritmik Zeka, Kodlama, Sistem & Veri)
    if (mercury.sign === 'Başak') {
      // Merkür Başak'ta yücelir ve yönetir: En üst düzey algoritmik mantık, hata ayıklama (debug), veri mimarisi
      scores.technology += 38;
      scores.systems += 30;
    } else if (mercury.sign === 'İkizler' || mercury.sign === 'Kova') {
      scores.technology += 26;
      scores.creative += 20;
    } else if (mercury.sign === 'Akrep' || mercury.sign === 'Oğlak') {
      scores.systems += 22;
      scores.technology += 16;
    }
    if (mercury.house === 10 || mercury.house === 6 || mercury.house === 3 || mercury.house === 11) {
      scores.technology += 22;
      scores.systems += 18;
    }

    // C) SATÜRN DEĞERLENDİRMESİ (Dayanıklı Altyapı, Sistem Mimarisi, Yönetim & Regülasyon)
    if (['Oğlak', 'Akrep', 'Başak'].includes(saturn.sign)) {
      scores.systems += 28;
      scores.finance += 20;
      scores.technology += 16; // Sağlam backend altyapısı ve veri güvenliği
    }
    if (saturn.house === 10 || saturn.house === 6) {
      scores.systems += 30;
      scores.leadership += 18;
    } else if (saturn.house === 2 || saturn.house === 8) {
      scores.finance += 25;
    }

    // D) MARS DEĞERLENDİRMESİ (Teknik Aksiyon, Mühendislik, Start-up İnisiyatifi)
    if (['Akrep', 'Koç', 'Oğlak'].includes(mars.sign)) {
      scores.leadership += 24;
      scores.systems += 20;
      scores.technology += 14;
    }
    if (mars.house === 10 || mars.house === 1) {
      scores.leadership += 28;
    } else if (mars.house === 6) {
      scores.systems += 22;
      scores.technology += 16;
    }

    // E) GÜNEŞ DEĞERLENDİRMESİ (Liderlik, İtibar, Görünürlük & Karizma)
    if (['Aslan', 'Koç', 'Yay'].includes(sun.sign)) {
      scores.leadership += 28;
      scores.global += 18;
    } else if (['Boğa', 'Başak', 'Oğlak'].includes(sun.sign)) {
      scores.finance += 20;
      scores.systems += 22;
    } else if (['İkizler', 'Terazi', 'Kova'].includes(sun.sign)) {
      scores.technology += 16;
      scores.creative += 20;
    }
    if (sun.house === 10 || sun.house === 1) {
      scores.leadership += 25;
    }

    // F) JÜPİTER DEĞERLENDİRMESİ (Büyük Sermaye, Global Vizyon, Uluslararası Ticaret)
    if (['Yay', 'Balık', 'Yengeç', 'Boğa'].includes(jupiter.sign)) {
      scores.global += 26;
      scores.finance += 22;
    }
    if (jupiter.house === 10 || jupiter.house === 9) {
      scores.global += 30;
      scores.leadership += 15;
    } else if (jupiter.house === 2 || jupiter.house === 8) {
      scores.finance += 26;
    }

    // G) VENÜS & NEPTÜN DEĞERLENDİRMESİ (Tasarım, UI/UX, Sanat, Diplomasi, Şifa)
    if (['Terazi', 'Boğa', 'Balık'].includes(venus.sign)) {
      scores.creative += 28;
      scores.human += 18;
    }
    if (venus.house === 10 || venus.house === 5 || venus.house === 1) {
      scores.creative += 24;
    }
    if (['Balık', 'Yengeç', 'Akrep'].includes(neptune.sign) || neptune.house === 10 || neptune.house === 12) {
      scores.creative += 18;
      scores.human += 20;
    }

    // H) PLÜTON & AY DEĞERLENDİRMESİ (Siber Güvenlik, Derin Finans, İnsan Kaynakları)
    if (pluto.house === 10 || pluto.house === 8 || pluto.house === 2) {
      scores.finance += 22;
      scores.technology += 14; // Kriptoloji ve siber güvenlik
      scores.leadership += 16;
    }
    if (['Yengeç', 'Boğa', 'Balık'].includes(moon.sign) || moon.house === 10 || moon.house === 6) {
      scores.human += 26;
    }

    // I) GEZEGEN AÇILARI (ASPECTS)
    chart.aspects.forEach(asp => {
      const p1 = asp.planet1;
      const p2 = asp.planet2;
      const pair = `${p1}-${p2}`;

      // Merkür - Uranüs: Teknoloji ve Yazılım Dehası
      if (pair.includes('Merkür') && pair.includes('Uranüs')) {
        scores.technology += 25;
      }
      // Mars - Uranüs: Hızlı Prototipleme & Teknoloji Girişimi
      if (pair.includes('Mars') && pair.includes('Uranüs')) {
        scores.technology += 16;
        scores.leadership += 14;
      }
      // Merkür - Satürn: Sistem Mimarisi, Kusursuz Mantık
      if (pair.includes('Merkür') && pair.includes('Satürn')) {
        scores.systems += 20;
        scores.technology += 14;
      }
      // Güneş - Jüpiter veya Mars - Jüpiter: Büyük Ölçekli Liderlik
      if ((pair.includes('Güneş') || pair.includes('Mars')) && pair.includes('Jüpiter')) {
        scores.global += 16;
        scores.leadership += 14;
      }
      // Venüs - Merkür veya Venüs - Neptün: Kreatif Tasarım ve UI/UX
      if (pair.includes('Venüs') && (pair.includes('Merkür') || pair.includes('Neptün'))) {
        scores.creative += 20;
      }
    });

    // J) 10. EV (MC) BURCU VE KARİYER EKSENİ
    if (mcSign === 'Kova') {
      scores.technology += 25;
      scores.leadership += 15;
    } else if (mcSign === 'Başak') {
      scores.systems += 25;
      scores.technology += 20;
    } else if (mcSign === 'Yay') {
      scores.global += 25;
      // Yay aynı zamanda vizyoner teknoloji ve küresel start-up'ları destekler
      scores.technology += 12;
      scores.leadership += 14;
    } else if (mcSign === 'Koç' || mcSign === 'Aslan') {
      scores.leadership += 25;
    } else if (mcSign === 'Oğlak' || mcSign === 'Boğa') {
      scores.finance += 22;
      scores.systems += 20;
    } else if (mcSign === 'İkizler' || mcSign === 'Terazi') {
      scores.creative += 22;
    } else if (mcSign === 'Yengeç' || mcSign === 'Balık') {
      scores.human += 24;
    }

    // K) NUMEROLOJİ KADER SAYISI KATKISI
    if (destinyNum === 7) {
      scores.technology += 24;
      scores.systems += 18;
    } else if (destinyNum === 4) {
      scores.systems += 25;
      scores.technology += 14;
    } else if (destinyNum === 8 || destinyNum === 22) {
      scores.finance += 25;
      scores.leadership += 18;
    } else if (destinyNum === 1 || destinyNum === 5) {
      scores.leadership += 22;
    } else if (destinyNum === 3) {
      scores.creative += 24;
    } else if (destinyNum === 2 || destinyNum === 6 || destinyNum === 11 || destinyNum === 33) {
      scores.human += 24;
    } else if (destinyNum === 9) {
      scores.global += 22;
    }

    // L) HUMAN DESIGN TİPİ KATKISI
    if (hdType === 'Manifestör') {
      scores.leadership += 18;
    } else if (hdType === 'Projektör') {
      scores.systems += 16;
      scores.human += 18;
    } else if (hdType === 'Manifesting Jeneratör') {
      scores.technology += 14;
      scores.leadership += 14;
    }

    // 5. PUANLARI SIRALA VE EN YÜKSEK 3 SEKTÖRÜ SEÇ
    const sortedSectorKeys = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const maxScore = scores[sortedSectorKeys[0]] || 100;

    // İlk 3 sektörü formatla
    const topSectors: CareerSectorMatch[] = sortedSectorKeys.slice(0, 3).map((key, idx) => {
      const def = SECTOR_DEFINITIONS[key];
      // Normalize fit score: 1. %94-98, 2. %87-92, 3. %82-86
      let calculatedFit = Math.round((scores[key] / maxScore) * 96);
      if (idx === 0) calculatedFit = Math.max(95, Math.min(98, calculatedFit));
      if (idx === 1) calculatedFit = Math.max(88, Math.min(93, calculatedFit));
      if (idx === 2) calculatedFit = Math.max(82, Math.min(87, calculatedFit));

      return {
        title: def.title,
        category: def.category,
        fitScore: calculatedFit,
        recommendedRoles: def.roles,
        description: def.description
      };
    });

    // 6. ÖZET ROZETLER (Jargonsuz)
    let leadershipStyle = 'Stratejik, Vizyoner & İnovatif';
    if (scores.technology > scores.leadership && scores.technology > scores.finance) {
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

    if (topSectors[0].category === 'Teknoloji & İnovasyon' || ['Koç', 'Yay', 'Kova'].includes(mcSign) || hdType === 'Manifestör' || destinyNum === 1 || destinyNum === 5) {
      idealModelType = 'Girişimci & Bağımsız Kurucu';
      idealModelExp = 'Başkalarının katı bürokrasisi altında çalışmak analitik ve teknolojik üretim kapasitenizi sınırlar. Kendi kurallarınızı koyduğunuz bağımsız yazılım projeleri, teknoloji kuruculuğu veya serbest start-up modelleri sizin en yüksek verim ve kadersel doyum alanınızdır.';
      idealPercent = 96;
    } else if (['Oğlak', 'Aslan', 'Boğa'].includes(mcSign) || destinyNum === 8 || destinyNum === 4 || destinyNum === 22) {
      idealModelType = 'Kurumsal Lider & Üst Yönetici';
      idealModelExp = 'Büyük bütçeleri, teknolojik altyapıları ve sağlam kurumsal mekanizmaları yönetebilecek doğal bir icra gücü taşırsınız. Kurumların teknoloji konseylerinde, icra kurullarında veya holding zirvelerinde kalıcı bir miras inşa edersiniz.';
      idealPercent = 94;
    } else if (hdType === 'Projektör' || destinyNum === 2 || destinyNum === 7 || destinyNum === 11) {
      idealModelType = 'Stratejik Rehber & Danışman';
      idealModelExp = 'Operasyonel angaryalardan uzaklaşıp üst düzey şirketlere ve teknoloji liderlerine stratejik mimari çizdiğiniz başdanışmanlık modeli size en yüksek saygınlığı ve finansal akışı sağlar.';
      idealPercent = 91;
    } else {
      idealModelType = 'Özerk Uzman & Zanaatkar';
      idealModelExp = 'Kendi alanında en derin bilgiye sahip, teknik ustalığıyla aranılan ve kalite standartlarını kendisi belirleyen özerk bir çalışma biçimi sizin için idealdir.';
      idealPercent = 89;
    }

    // 8. SÜPER GÜÇ VE GÖLGE TUZAKLAR
    const dominantCategory = topSectors[0].category;
    const superPower = generateCleanMultiPlanetSuperPower(dominantCategory, mercury.sign, uranus.house, destinyNum);
    const shadowPitfalls = generateCleanMultiPlanetShadowPitfall(dominantCategory, saturn.sign);

    // 9. 4 STRATEJİK EYLEM ADIMI (Jargonsuz)
    const actionableGuidance = generateActionableGuidance(dominantCategory, hdType, destinyNum, house2);

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
