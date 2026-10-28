import { generateAstrologyChart, calculateDraconicChart, getSignAndDegree } from './AstrologyEngine';
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

export interface CareerMilestone {
  id: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  title: string;
  planetCycle: string;
  status: 'completed' | 'active' | 'upcoming';
  description: string;
  actionGuidance: string;
}

export interface CareerTimelineData {
  currentAge: number;
  activeMilestone: CareerMilestone;
  milestones: CareerMilestone[];
}

export interface PlanetaryPlacementCareerInsight {
  planet: string;
  sign: string;
  house: number;
  domain: string;
  iconName: string;
  title: string;
  explanation: string;
  suitableProfessions: string[];
}

export interface SoulCareerData {
  soulMidheaven: {
    sign: string;
    title: string;
    calling: string;
    impact: string;
  };
  soulAscendant: {
    sign: string;
    essence: string;
  };
  soulSun: {
    sign: string;
    mission: string;
  };
  soulMoon: {
    sign: string;
    emotionalNourishment: string;
  };
  soulTopSectors: CareerSectorMatch[];
  soulMaterialBridge: {
    materialIdentity: string;
    soulCalling: string;
    synthesisAdvice: string;
    unfulfillmentWarning: string;
    dailySpiritualPractice: string;
  };
}

export interface ProgressedCareerData {
  currentAge: number;
  progressedSun: {
    natalSign: string;
    natalDegree: number;
    progressedSign: string;
    degreeInSign: number;
    minutes: number;
    hasShifted: boolean;
    shiftAge: number;
    nextShiftAge: number;
    identityShiftTheme: string;
    explanation: string;
  };
  progressedMoon: {
    sign: string;
    degreeInSign: number;
    minutes: number;
    natalHouse: number;
    cycleTheme: string;
    houseImpact: string;
    estimatedMonthsLeft: number;
  };
  progressedMoonPhase: {
    name: string;
    phaseNumber: number;
    phaseMotto: string;
    elongationDegree: number;
    stageDescription: string;
    careerHarvestGuidance: string;
  };
  progressedMidheaven: {
    sign: string;
    degreeInSign: number;
    careerEvolutionTitle: string;
    explanation: string;
  };
}

export interface MusicalAffinityData {
  primaryInstrument: {
    category: string;
    instruments: string[];
    element: string;
    essence: string;
  };
  secondaryStyle: {
    category: string;
    instruments: string[];
    essence: string;
  };
  vocalAptitude: {
    hasAptitude: boolean;
    style: string;
    chakraResonance: string;
  };
  musicalExpressionAdvice: string;
}

export interface CraftsmanshipMaterialData {
  primaryMaterial: string;
  craftsmanshipTitle: string;
  toolsAndTechniques: string[];
  healingPower: string;
  commercialApplications: string[];
}

export interface ParsFortunaWealthData {
  sign: string;
  degreeInSign: number;
  house: number;
  wealthPortalTitle: string;
  karmicBlessingArea: string;
  practicalMonetizationGuidance: string;
}

export interface PartnershipDnaData {
  archetype: 'Yalnız Kurt (Solo Kurucu & Özerk Usta)' | 'İkili İttifak (Stratejik Ortaklık İnsanı)' | 'Kolektif Orkestra Şefi (Ağ & Komünite Lideri)';
  motto: string;
  synergyCondition: string;
  toxicPartnershipRisk: string;
  idealTeamStructure: string;
}

export interface PlanetaryProductivityHoursData {
  rulingPlanet: string;
  peakMentalFocusWindow: string;
  goldenNegotiationWindow: string;
  rechargeAndBurnoutPreventionWindow: string;
  dailyRoutineAdvice: string;
}

export interface VocationalReputationData {
  reputationTitle: string;
  publicImageArchetype: string;
  howIndustryRemembersYou: string;
  authorityTrigger: string;
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
  careerTimeline: CareerTimelineData;
  progressedCareer: ProgressedCareerData;
  focusStrategy: FocusStrategyData;
  dharmaPath: DharmaPathData;
  wealthMagnet: WealthMagnetData;
  burnoutShield: BurnoutShieldData;
  superPower: string;
  shadowPitfalls: string;
  topSectors: CareerSectorMatch[];
  secondarySectors: SecondarySectorMatch[];
  planetaryInsights: PlanetaryPlacementCareerInsight[];
  soulCareer: SoulCareerData;
  musicalAffinity: MusicalAffinityData;
  craftsmanshipMaterial: CraftsmanshipMaterialData;
  parsFortunaWealth: ParsFortunaWealthData;
  partnershipDna: PartnershipDnaData;
  planetaryProductivityHours: PlanetaryProductivityHoursData;
  vocationalReputation: VocationalReputationData;
  energyDistribution: {
    segments: CareerEnergySegment[];
  };
  actionableGuidance: string[];
  isUnlocked?: boolean;
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
    title: 'Bilişim, Yazılım, Donanım & Teknik Mühendislik',
    shortTitle: 'Yazılım & Bilişim',
    category: 'Teknoloji & İnovasyon',
    color: '#8B5CF6',
    description: 'Bilişim altyapıları, yazılım mimarisi, donanım ve ağ sistemleri, veri analizi ve teknik problem çözme konusunda analitik yeteneklerinizi temsil eder.',
    roles: ['Yazılım Geliştirici & Mühendis', 'Bilişim & Ağ Teknisyeni', 'Veri Analisti & Yapay Zeka Uzmanı', 'Teknik Çözüm & Donanım Danışmanı', 'Bilgi İşlem Sorumlusu']
  },
  finance: {
    id: 'finance',
    title: 'Maliye, Bankacılık, Muhasebe & Esnaf Ticareti',
    shortTitle: 'Finans, Maliye & Ticaret',
    category: 'Finans & Strateji',
    color: '#10B981',
    description: 'Maddi kaynakları bereketle yönetme, bankacılık ve kamu maliyesi, vergi dairesi memuriyeti, esnaflık, işletme muhasebesi ve sermaye değerlendirme liyakatinizdir.',
    roles: ['Maliye / Vergi Dairesi Memuru', 'Banka Uzmanı & Veznedar', 'Mali Müşavir & Muhasebe Sorumlusu', 'Esnaf & Ticari İşletmeci', 'Gayrimenkul & Yatırım Danışmanı']
  },
  leadership: {
    id: 'leadership',
    title: 'İdari Yönetim, Kamu Şefliği & Bağımsız İşletmecilik',
    shortTitle: 'Yönetim & Girişim',
    category: 'Liderlik & Girişim',
    color: '#EAB308',
    description: 'İster kamu kurumlarında idari şeflik ve daire müdürlüğü, ister özel sektör yöneticiliği, isterse kendi atölyesini ve dükkanını kurma cesareti; insanlara ve işlere yön verme kudretinizdir.',
    roles: ['Kamu Kurum Yöneticisi & Daire Amiri', 'Bağımsız Atölye / Dükkan İşletmecisi', 'Şirket Müdürü & Operasyon Şefi', 'Kooperatif & Saha Yöneticisi', 'Kriz & Dönüşüm Lideri']
  },
  systems: {
    id: 'systems',
    title: 'Kamu Memuriyeti, Bürokrasi, Zanaat & Süreç Düzeni',
    shortTitle: 'Kamu Memuriyeti & Zanaat',
    category: 'Organizasyon & Sistem',
    color: '#3B82F6',
    description: 'Devlet kurumlarında intizamlı kamu memurluğu, adliye ve bürokrasi, arşiv ve evrak yönetimi, tekstil/imalat kalite kontrolü ve saat gibi işleyen düzenler kurma erdeminizdir.',
    roles: ['Devlet Memuru / Büro Amiri', 'Adliye & Evrak Kayıt Memuru', 'Tekstil & İmalat Kalite Kontrolörü', 'Maliye & Denetim Memuru', 'Sistem & Operasyon Mühendisi']
  },
  creative: {
    id: 'creative',
    title: 'Tekstil & Moda Tasarımı, Müzik, Sahne & Görsel Sanatlar',
    shortTitle: 'Tekstil, Sanat & Müzik',
    category: 'Sanat & İletişim',
    color: '#EC4899',
    description: 'Kumaş, dokuma ve tekstil tasarımı, müzikal enstrüman ve beste icrası, sahne sanatları, görsel estetik, dekorasyon ve ruhu besleyen eserler üretme dehanızı yansıtır.',
    roles: ['Tekstil, Kumaş & Moda Tasarımcısı', 'Müzisyen, Besteci & Ses Sanatçısı', 'Sahne Sanatçısı & Tiyatrocu', 'Görsel Sanatlar & Ressam/Zanaatkar', 'Dekorasyon & El Sanatları Ustası']
  },
  global: {
    id: 'global',
    title: 'Dış Ticaret, Lojistik, Gümrük, Turizm & Yüksek Akademi',
    shortTitle: 'Dış Ticaret & Akademi',
    category: 'Global Vizyon & Akademi',
    color: '#F97316',
    description: 'Uluslararası ticaret, gümrük ve lojistik sevkiyat, turizm acenteciliği, yabancı dil ve tercümanlık ile yüksek akademik araştırmalarda sınırları aşan vizyonunuzdur.',
    roles: ['Dış Ticaret & Gümrük Memuru', 'Lojistik & Sevkiyat Koordinatörü', 'Turizm & Otelcilik Yöneticisi', 'Tercüman & Dil Uzmanı', 'Akademisyen & Kültür Araştırmacısı']
  },
  human: {
    id: 'human',
    title: 'Öğretmenlik, Sağlık, Kamu Hizmeti & Sosyal Şifa',
    shortTitle: 'Eğitim, Sağlık & Hizmet',
    category: 'Şifa & Danışmanlık',
    color: '#14B8A6',
    description: 'Öğretmenlik ve gençleri yetiştirme, kamu sağlığı ve hemşirelik, sosyal hizmet memurluğu, psikolojik rehberlik ve insanlara şefkatle hizmet etme yüksek vicdanınızı simgeler.',
    roles: ['Öğretmen & Eğitimci', 'Hemşire & Sağlık Personeli', 'Kamu Sosyal Hizmet Görevlisi', 'Rehberlik & Psikolojik Danışman', 'İnsan Kaynakları & Yetenek Sorumlusu']
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
    chart.aspects.forEach(asp => {
      const pair = `${asp.planet1}-${asp.planet2}`;

      if (pair.includes('Merkür') && pair.includes('Mars')) {
        scores.technology += 36;
        scores.systems += 22;
        scores.leadership += 14;
      }
      if (pair.includes('Merkür') && pair.includes('Uranüs')) {
        scores.technology += 34;
        scores.systems += 16;
      }
      if (pair.includes('Merkür') && pair.includes('Satürn')) {
        scores.systems += 30;
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
      scores.technology += 24;
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

    if ([4, 7, 13, 22, 25, 31].includes(birthDayNum)) {
      scores.technology += 20;
      scores.systems += 18;
    }

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

    // 7. İDEAL ÇALIŞMA MODELİ (4 Boyutlu Matematiksel Puanlama Matrisi)
    const idealWorkModel = calculateIdealWorkModel(
      chart,
      saturn,
      mars,
      mercury,
      sun,
      jupiter,
      hdType,
      mcSign,
      destinyNum,
      house6Sign
    );

    // 8. KRİTİK KARİYER DÖNÜM YAŞLARI (Kadersel Zaman Çizelgesi)
    const careerTimeline = calculateCareerTimeline(birthDate);

    // 9. DİĞER EZOTERİK DERİNLİKLER:
    const focusStrategy = calculateFocusStrategy(chart, saturn, hdType, mcSign);
    const dharmaPath = calculateDharmaPath(northNode);
    const wealthMagnet = calculateWealthMagnet(house2Sign, topSectors[0].id);
    const burnoutShield = calculateBurnoutShield(hdType, topSectors[0].category);

    // 10. GEZEGEN YERLEŞİMLERİNE GÖRE BİREBİR MESLEKİ & ZANAAT DÖKÜMÜ
    const planetaryInsights = calculatePlanetaryCareerInsights(
      chart,
      sun,
      moon,
      mercury,
      venus,
      mars,
      jupiter,
      saturn,
      neptune,
      uranus,
      pluto
    );

    // 11. RUH HARİTASI (DRAKONİK KATMAN & KADERSEL ÇAĞRI)
    const draconicChart = calculateDraconicChart(chart);
    const soulCareer = calculateSoulCareer(chart, draconicChart, topSectors[0]);

    // 12. İKİNCİL İLERLETİM (SECONDARY PROGRESSIONS - ASTRO-SEEK STANDARDI)
    const progressedCareer = calculateSecondaryProgressions(chart, birthDate);

    // 13. SÜPER GÜÇ VE GÖLGE TUZAKLAR
    const dominantCategory = topSectors[0].category;
    const superPower = generateCleanMultiPlanetSuperPower(dominantCategory, mercury.sign, uranus.house, destinyNum);
    const shadowPitfalls = generateCleanMultiPlanetShadowPitfall(dominantCategory, saturn.sign);

    // 14. 4 STRATEJİK EYLEM ADIMI
    const actionableGuidance = generateActionableGuidance(dominantCategory, hdType, destinyNum, house2Sign);

    // 15. KADİM VE EZOTERİK DERİN MESLEKİ MODÜLLER (6 YENİ BOYUT)
    const musicalAffinity = calculateMusicalAffinity(chart, ascSign, sun, moon, mercury, venus, neptune, mars, house2Sign, mcSign);
    const craftsmanshipMaterial = calculateCraftsmanshipMaterial(chart, mars, saturn, venus, sun, ascSign);
    const parsFortunaWealth = calculateParsFortunaWealth(chart);
    const partnershipDna = calculatePartnershipDna(chart, sun, mars, venus);
    const planetaryProductivityHours = calculatePlanetaryProductivityHours(chart, sun, mercury, mars);
    const vocationalReputation = calculateVocationalReputation(chart, mcSign, saturn, sun);

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
      idealWorkModel,
      careerTimeline,
      progressedCareer,
      focusStrategy,
      dharmaPath,
      wealthMagnet,
      burnoutShield,
      superPower,
      shadowPitfalls,
      topSectors,
      secondarySectors,
      planetaryInsights,
      soulCareer,
      musicalAffinity,
      craftsmanshipMaterial,
      parsFortunaWealth,
      partnershipDna,
      planetaryProductivityHours,
      vocationalReputation,
      energyDistribution: {
        segments
      },
      actionableGuidance
    };
  }
}

// YARDIMCI EZOTERİK MOTOR HESAPLAMALARI:

function calculateCareerTimeline(birthDate: string): CareerTimelineData {
  const currentAge = moment().diff(moment(birthDate), 'years');

  const baseMilestones = [
    {
      id: 'discovery',
      ageRange: '18 - 27 Yaş',
      minAge: 0,
      maxAge: 27,
      title: 'Keşif, Deneme & Temel Yetenek İnşası',
      planetCycle: 'Mars & Jüpiter Gençlik Döngüsü',
      description: 'Piyasayı tanıma, çıraklık, farklı sektörleri deneyimleme ve temel teknik yetenekleri cebe koyma evresidir. Bu dönemde yapılan yön değişiklikleri ve arayışlar son derece doğaldır.',
      actionGuidance: 'Mükemmeliyetçilik aramak yerine farklı projelerde pişin ve teknik araç setinizi genişletin.'
    },
    {
      id: 'saturn_return',
      ageRange: '28 - 34 Yaş',
      minAge: 28,
      maxAge: 34,
      title: 'Profesyonel Rüştünü İspat & Ustalığa Geçiş',
      planetCycle: '1. Satürn Döngüsü & Hermetik Ustalık (33 Yaş)',
      description: 'Çıraklığın resmi olarak bittiği, genç yetenek sıfatından çıkıp ilk büyük unvanı, kamu derecesini, mesleki ustalığı veya kendi iş yerini/atölyesini kurduğunuz kadersel olgunlaşma sınavıdır.',
      actionGuidance: 'Dağınıklığı bırakın; uzmanlığınızı resmi unvana, memuriyet kademesine, ustalık belgesine veya tescilli bir iş modeline dökün.'
    },
    {
      id: 'nodal_shift',
      ageRange: '35 - 41 Yaş',
      minAge: 35,
      maxAge: 41,
      title: 'Kadersel Uyanış & Özgür Yolunu Çizme',
      planetCycle: '2. Kader Düğümleri & Jüpiter Döngüsü',
      description: 'Başkalarının dar kalıplarıyla yaşamaktan bıkıp kendi özgün vizyonunuzu ilan ettiğiniz, mesleğinizde kendi imzanızı attığınız veya kendi atölyenizi/işinizi kurduğunuz uyanış çağıdır.',
      actionGuidance: 'Konfor alanına saplanıp kalmayın; uzun süredir ertelediğiniz bağımsız projelerin veya mesleki atılımların sorumluluğunu üstlenin.'
    },
    {
      id: 'uranus_renaissance',
      ageRange: '42 - 48 Yaş',
      minAge: 42,
      maxAge: 48,
      title: 'Kariyer Rönesansı & Büyük İnovasyon Patlaması',
      planetCycle: 'Uranüs Karşıtlığı (Ruhun 2. Doğumu)',
      description: 'İkinci bahar ve en yüksek özerklik çağıdır. Kimseye kendinizi ispatlama kaygınız kalmaz; sektörünüzde, zanaatinizde veya sanatınızda çağ atlatacak özgün eserler, sistemler ve bağımsız projeler zirve yapar.',
      actionGuidance: 'Geleneksel kalıpları yıkın; mesleğinizde veya sanatınızda devrim yaratacak bağımsız çalışmalarınıza tam gaz verin.'
    },
    {
      id: 'legacy_authority',
      ageRange: '49+ Yaş',
      minAge: 49,
      maxAge: 120,
      title: 'Akil Liderlik, Kurumsal Miras & Mentorluk',
      planetCycle: 'Kiron & 2. Satürn Bilgelik Döngüsü',
      description: 'Günlük operasyonel koşturmadan çekilip; birikmiş tecrübeyi yeni nesillere aktarma, usta-çırak ilişkisiyle zanaatinizi/bilginizi yaşatma, kurumsal miras bırakma ve akil insanlık yapma evresidir.',
      actionGuidance: 'Operasyonu yeni nesil yeteneklere devredin; stratejik vizyon, usta öğreticilik ve kalıcı eserler bırakmaya odaklanın.'
    }
  ];

  // Aktif aşamayı tespit et (kesintisiz tam aralık)
  let activeIndex = baseMilestones.findIndex(m => currentAge >= m.minAge && currentAge <= m.maxAge);
  if (activeIndex === -1) {
    if (currentAge < 28) activeIndex = 0;
    else activeIndex = baseMilestones.length - 1;
  }

  const milestones: CareerMilestone[] = baseMilestones.map((m, idx) => {
    let status: 'completed' | 'active' | 'upcoming' = 'upcoming';
    if (idx < activeIndex) status = 'completed';
    else if (idx === activeIndex) status = 'active';

    return {
      ...m,
      status
    };
  });

  return {
    currentAge,
    activeMilestone: milestones[activeIndex],
    milestones
  };
}

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

interface IdealWorkModelResult {
  type: 'Girişimci & Bağımsız Kurucu' | 'Kurumsal Lider & Üst Yönetici' | 'Stratejik Rehber & Danışman' | 'Özerk Uzman & Zanaatkar';
  percentage: number;
  explanation: string;
}

function calculateIdealWorkModel(
  chart: NatalChartData,
  saturn: AstroPoint,
  mars: AstroPoint,
  mercury: AstroPoint,
  sun: AstroPoint,
  jupiter: AstroPoint,
  hdType: string,
  mcSign: string,
  destinyNum: number,
  house6Sign: string
): IdealWorkModelResult {
  const modelScores = {
    corporate: 10,
    consultant: 10,
    specialist: 10,
    entrepreneur: 10
  };

  // 1. KURUMSAL LİDER & ÜST YÖNETİCİ PUANLARI
  if (saturn.house === 10) modelScores.corporate += 35;
  if (['Oğlak', 'Aslan', 'Boğa'].includes(mcSign)) modelScores.corporate += 30;
  if (sun.house === 10) modelScores.corporate += 25;
  if ([8, 4, 22].includes(destinyNum)) modelScores.corporate += 30;
  if (['Oğlak', 'Boğa'].includes(saturn.sign)) modelScores.corporate += 15;

  // 2. STRATEJİK REHBER & DANIŞMAN PUANLARI
  if (hdType === 'Projektör') modelScores.consultant += 42;
  if (jupiter.house === 9 || jupiter.house === 10) modelScores.consultant += 28;
  if (['Terazi', 'İkizler', 'Balık', 'Kova'].includes(mercury.sign)) modelScores.consultant += 22;
  if ([7, 2, 11, 33].includes(destinyNum)) modelScores.consultant += 30;
  if (['Terazi', 'Balık'].includes(mcSign)) modelScores.consultant += 24;

  // 3. ÖZERK UZMAN & ZANAATKAR PUANLARI
  if (mercury.sign === 'Başak') modelScores.specialist += 36;
  if (saturn.house === 6 || mercury.house === 6 || mars.house === 6) modelScores.specialist += 32;
  if (['Başak', 'Boğa', 'Akrep'].includes(house6Sign)) modelScores.specialist += 24;
  if (mcSign === 'Başak' || mcSign === 'Akrep') modelScores.specialist += 22;
  if (hdType === 'Jeneratör') modelScores.specialist += 22;
  if (destinyNum === 4 || destinyNum === 6) modelScores.specialist += 18;

  // 4. GİRİŞİMCİ & BAĞIMSIZ KURUCU PUANLARI
  if (mars.house === 1 || mars.house === 10) modelScores.entrepreneur += 32;
  if (['Koç', 'Aslan'].includes(mcSign)) modelScores.entrepreneur += 28;
  if (hdType === 'Manifestör') modelScores.entrepreneur += 36;
  else if (hdType === 'Manifesting Jeneratör') modelScores.entrepreneur += 22;
  if (destinyNum === 1 || destinyNum === 5) modelScores.entrepreneur += 32;

  chart.aspects.forEach(asp => {
    const pair = `${asp.planet1}-${asp.planet2}`;
    if (pair.includes('Güneş') && pair.includes('Mars')) modelScores.entrepreneur += 18;
    if (pair.includes('Mars') && pair.includes('Uranüs')) modelScores.entrepreneur += 18;
    if (pair.includes('Merkür') && pair.includes('Satürn')) modelScores.specialist += 18;
    if (pair.includes('Satürn') && pair.includes('Jüpiter')) modelScores.corporate += 18;
  });

  const sorted = (Object.keys(modelScores) as Array<keyof typeof modelScores>).sort(
    (a, b) => modelScores[b] - modelScores[a]
  );
  const winner = sorted[0];
  const maxScore = modelScores[winner];

  // Dinamik yüzde: %83 - %95 arası
  const calculatedPercentage = Math.min(95, Math.max(83, Math.round(75 + (maxScore / 130) * 18)));

  if (winner === 'corporate') {
    return {
      type: 'Kurumsal Lider & Üst Yönetici',
      percentage: calculatedPercentage,
      explanation: 'Gerek devlet kademelerinde ve kamu kurumlarında intizamlı idari yönetim, gerekse kurumsal yapılarda, şube müdürlüklerinde veya icra mercilerinde kalıcı ve güven veren bir nizam inşa edersiniz. Büyük bütçeleri, insan kaynaklarını ve sağlam mekanizmaları yönetebilecek doğal bir otorite ve organizasyonel ciddiyet taşırsınız.'
    };
  }

  if (winner === 'consultant') {
    return {
      type: 'Stratejik Rehber & Danışman',
      percentage: calculatedPercentage,
      explanation: 'Operasyonel angaryalardan ve rutin amelelikten uzaklaşıp; kurumlara, liderlere veya bireylere stratejik yol haritası çizdiğiniz uzman rehberlik, hukuki/mali danışmanlık veya başdanışmanlık modeli size en yüksek saygınlığı ve finansal bereketi sağlar.'
    };
  }

  if (winner === 'specialist') {
    return {
      type: 'Özerk Uzman & Zanaatkar',
      percentage: calculatedPercentage,
      explanation: 'Kendi alanında en derin bilgiye ve el ustalığına sahip; ister kendi atölyesinde üretim yapan usta bir tekstilci/zanaatkar, ister bağımsız bir müzisyen/sanatçı, ister teknik sistem uzmanı olsun; kalitesini tavizsiz konuşturduğu özerk bir çalışma biçimi sizin için idealdir. Bürokrasiye boğulmak yerine zanaatinizi ve uzmanlığınızı bizzat icra etmek sizi zirveye taşır.'
    };
  }

  return {
    type: 'Girişimci & Bağımsız Kurucu',
    percentage: calculatedPercentage,
    explanation: 'Başkalarının katı direktifleri altında çalışmak yaratıcı enerjinizi ve bağımsız karar alma gücünüzü kısıtlar. Kendi işini, dükkanını, atölyesini veya bağımsız girişimini kurarak kendi kurallarıyla ilerleyen bağımsız modeller sizin en yüksek doyum ve bereket alanınızdır.'
  };
}

function calculatePlanetaryCareerInsights(
  chart: NatalChartData,
  sun: AstroPoint,
  moon: AstroPoint,
  mercury: AstroPoint,
  venus: AstroPoint,
  mars: AstroPoint,
  jupiter: AstroPoint,
  saturn: AstroPoint,
  neptune: AstroPoint,
  uranus: AstroPoint,
  pluto: AstroPoint
): PlanetaryPlacementCareerInsight[] {
  const insights: PlanetaryPlacementCareerInsight[] = [];

  // 1. VENÜS: Tekstil, Kumaş, Sanat, Müzik & Zanaat
  const venusArtsSigns = ['Boğa', 'Terazi', 'Balık', 'Yengeç'];
  const venusCraftSigns = ['Başak', 'Oğlak'];
  if (venusArtsSigns.includes(venus.sign) || [2, 5, 7, 12].includes(venus.house)) {
    insights.push({
      planet: 'Venüs',
      sign: venus.sign,
      house: venus.house,
      domain: 'Tekstil, Sanat & Müzik',
      iconName: 'Palette',
      title: `Venüs ${venus.sign} (${venus.house}. Ev) • Tekstil, Moda, Kumaş & Müzikal Yetenek`,
      explanation: `Venüs'ünüzün ${venus.sign} burcundaki ve ${venus.house}. evdeki yerleşimi; kumaş dokusu, tekstil tasarımı, renk ve desen ahengi ile el zanaatlerinde doğuştan gelen rafine bir estetik zevk bahşeder. Aynı zamanda müzik kulağı, enstrüman icrası, ses estetiği veya dekorasyon/görsel sanatlarda ruhu doyuran eserler çıkarma potansiyelinizi açığa çıkarır.`,
      suitableProfessions: [
        'Tekstil & Kumaş Tasarımcısı',
        'Müzisyen, Besteci & Ses Sanatçısı',
        'Moda & Stilist',
        'Görsel Sanatlar & Ressam',
        'Ev Tekstili & Dekorasyon Ustası'
      ]
    });
  } else if (venusCraftSigns.includes(venus.sign) || [6, 10].includes(venus.house)) {
    insights.push({
      planet: 'Venüs',
      sign: venus.sign,
      house: venus.house,
      domain: 'Tekstil, Sanat & Müzik',
      iconName: 'Palette',
      title: `Venüs ${venus.sign} (${venus.house}. Ev) • Tekstil Kalıp Ustalığı & İnce Zanaat`,
      explanation: `Venüs'ün bu yerleşimi, estetik yeteneği disiplin ve teknik milimetrik hassasiyetle birleştirir. Tekstil kalıpçılığı, titiz terzilik, takı/mücevher zanaatı, restorasyon ve üretimde sıfır hata ile çalışan usta el becerisi sunar.`,
      suitableProfessions: [
        'Tekstil Modelisti & Kalıp Ustası',
        'Mücevher & Kuyumculuk Zanaatkarı',
        'Tekstil Kalite Güvence Uzmanı',
        'El İşçiliği & Terzilik'
      ]
    });
  } else {
    insights.push({
      planet: 'Venüs',
      sign: venus.sign,
      house: venus.house,
      domain: 'Tekstil, Sanat & Müzik',
      iconName: 'Palette',
      title: `Venüs ${venus.sign} (${venus.house}. Ev) • Estetik İletişim, Sahne & Tasarım`,
      explanation: `Venüs'ünüzün ${venus.sign} yerleşimi; stil danışmanlığı, sahne tasarımı, tekstil ürünlerinin vitrin sunumu ve görsel albenisi yüksek tasarımlar hazırlama kabiliyetinizi destekler.`,
      suitableProfessions: [
        'Stil Danışmanı & Tasarımcı',
        'Sahne & Vitrin Tasarımcısı',
        'Görsel İletişim Uzmanı',
        'Tekstil Pazarlama & Temsil'
      ]
    });
  }

  // 2. SATÜRN: Kamu Memuriyeti, Devlet Nizamı, Bürokrasi & Liyakat
  const saturnGovSigns = ['Oğlak', 'Başak', 'Boğa', 'Yengeç'];
  if (saturnGovSigns.includes(saturn.sign) || [6, 10, 4, 1].includes(saturn.house)) {
    insights.push({
      planet: 'Satürn',
      sign: saturn.sign,
      house: saturn.house,
      domain: 'Kamu Memuriyeti & İdari Düzen',
      iconName: 'Building2',
      title: `Satürn ${saturn.sign} (${saturn.house}. Ev) • Devlet Memuriyeti & Kamu Nizamı`,
      explanation: `Satürn'ün ${saturn.sign} burcunda ve ${saturn.house}. evdeki sağlam konumu; devlet kademelerinde kamu memurluğu, kurumsal bürokrasi, evrak ve arşiv nizamı, adliye/vergi dairesi intizamı ve kanunlara sadakatle yükselmeyi destekler. Riskli maceralar yerine güvenceli, intizamlı ve kademeli kamu görevinde sarsılmaz bir liyakat sunar.`,
      suitableProfessions: [
        'Devlet Memuru & Büro Şefi',
        'Adliye & Evrak Kayıt Görevlisi',
        'Maliye / Vergi Dairesi Memuru',
        'Kamu İdare Personeli',
        'Mevzuat & Kalite Denetmeni'
      ]
    });
  } else {
    insights.push({
      planet: 'Satürn',
      sign: saturn.sign,
      house: saturn.house,
      domain: 'Kamu Memuriyeti & İdari Düzen',
      iconName: 'Building2',
      title: `Satürn ${saturn.sign} (${saturn.house}. Ev) • Kurumsal Denetim, Muhasebe & Zanaat Disiplini`,
      explanation: `Satürn'ün bu yerleşimi; mali denetim, muhasebe hesaplarının intizamı, usta-çırak disipliniyle zanaatte kök salma ve kurumsal yapıların omurgasını koruma ciddiyeti verir.`,
      suitableProfessions: [
        'Mali Müşavir & Muhasebe Sorumlusu',
        'Kurumsal Denetçi',
        'Arşiv & Büro Şefi',
        'Zanaat Atölye Şefi'
      ]
    });
  }

  // 3. MERKÜR: Büro Yönetimi, Esnaflık, Ticaret, Yazışma & El Zanaatı / Kodlama
  insights.push({
    planet: 'Merkür',
    sign: mercury.sign,
    house: mercury.house,
    domain: 'Büro, Ticaret & Zanaat',
    iconName: 'FileText',
    title: `Merkür ${mercury.sign} (${mercury.house}. Ev) • Büro İdaresi, Resmi Yazışma, Ticaret & Zanaat`,
    explanation: `Merkür'ün ${mercury.sign} yerleşimi; büro idaresi, resmi daire yazışmaları, kâtiplik, evrak tasnifi, esnaflık ve perakende ticaret zekasını güçlendirir. Aynı zamanda parmak ve el koordinasyonu gerektiren hassas zanaatlarda (terzilik, saatçilik, enstrüman tuşları veya klavye kodlaması) seri bir pratiklik kazandırır.`,
    suitableProfessions: [
      'Büro Yönetimi & İdari Memur',
      'Ticari İşletmeci & Esnaf',
      'Muhasebe & Evrak Raportörü',
      'Yazılım & Bilişim Uzmanı',
      'Editör & Yazışma Sorumlusu'
    ]
  });

  // 4. MARS: Saha Ustalığı, İmalat Sanayii, Güvenlik & Teknik Zanaat
  insights.push({
    planet: 'Mars',
    sign: mars.sign,
    house: mars.house,
    domain: 'Saha, İmalat & Güvenlik',
    iconName: 'Hammer',
    title: `Mars ${mars.sign} (${mars.house}. Ev) • Saha Ustalığı, İmalat Sanayii & Güvenlik`,
    explanation: `Mars'ın ${mars.sign} konumu; fabrikada imalat tezgâhı, sanayi atölyesi, mekanik tamirat, inşaat ve metalurji gibi bizzat sahada ter dökülen alanlarda yüksek dayanıklılık verir. Ayrıca polislik, askeriye, özel güvenlik, cerrahi tıp veya acil müdahale ekiplerinde soğukkanlı bir cesaret sağlar.`,
    suitableProfessions: [
      'Sanayi & Makine Teknisyeni',
      'Kolluk Kuvveti / Güvenlik Görevlisi',
      'Mekanik Tesisat & Bakım Ustası',
      'Cerrahi/Acil Sağlık Personeli',
      'Saha Operasyon Şefi'
    ]
  });

  // 5. NEPTÜN: Müzikal İlham, Sahne & Sanatsal Ruh
  insights.push({
    planet: 'Neptün',
    sign: neptune.sign,
    house: neptune.house,
    domain: 'İlham, Sahne & Sanat',
    iconName: 'Music',
    title: `Neptün ${neptune.sign} (${neptune.house}. Ev) • Müzikal İlham, Sahne & Sanatsal Ruh`,
    explanation: `Neptün'ün bu mistik yerleşimi; görünmeyen melodileri duyma, beste yapma, enstrümana duygu yükleme, sinema, tiyatro, şiir ve mistik sanatlar kanalını açar. Mantığın bittiği yerde ilhamla üreten, ruhları dinlendiren ve dinleyicileri büyüleyen bir sanat frekansıdır.`,
    suitableProfessions: [
      'Besteci, Aranjör & Müzisyen',
      'Sinema & Tiyatro Sanatçısı',
      'Fotoğraf & Görsel Yönetmeni',
      'Şair & Edebi Yazar',
      'Doğal Terapi & Şifa Uzmanı'
    ]
  });

  // 6. AY: Gıda, Beslenme, Konfeksiyon, Eğitim & Şefkat Hizmeti
  insights.push({
    planet: 'Ay',
    sign: moon.sign,
    house: moon.house,
    domain: 'Eğitim, Sağlık & Hizmet',
    iconName: 'HeartHandshake',
    title: `Ay ${moon.sign} (${moon.house}. Ev) • Gıda, Konfeksiyon, Eğitim & Şefkat Hizmeti`,
    explanation: `Ay'ınızın besleyici konumu; aşçılık, gıda işletmeciliği, ev tekstili/konfeksiyon, anaokulu/kreş eğitmenliği, hemşirelik ve kamuya şefkatle hizmet sunulan destek rollerinde derin bir iç huzur ve bereket sağlar.`,
    suitableProfessions: [
      'Gıda İşletmecisi & Aşçı',
      'Ev Tekstili & Konfeksiyon Ustası',
      'Hemşire & Bakım Uzmanı',
      'Anaokulu / Çocuk Gelişimcisi',
      'Kamu Sosyal Hizmet Görevlisi'
    ]
  });

  return insights;
}

function calculateSoulCareer(
  natalChart: NatalChartData,
  draconicChart: NatalChartData,
  primaryMaterialSector: CareerSectorMatch
): SoulCareerData {
  const dMc = (draconicChart.midheaven && draconicChart.midheaven.sign) || draconicChart.houses?.[9]?.sign || 'Koç';
  const dAsc = (draconicChart.ascendant && draconicChart.ascendant.sign) || draconicChart.houses?.[0]?.sign || 'Koç';
  const dSun = draconicChart.planets.find(p => p.name === 'Güneş')?.sign || 'Koç';
  const dMoon = draconicChart.planets.find(p => p.name === 'Ay')?.sign || 'Koç';
  const dVenus = draconicChart.planets.find(p => p.name === 'Venüs')?.sign || 'Koç';

  // 1. Ruhsal Tepe Noktası (Drakonik MC) - Kadersel Çağrı
  const mcCallings: Record<string, { title: string; calling: string; impact: string }> = {
    'Koç': {
      title: 'Öncü Ruh, Ruhsal Cesaret & Ezber Bozan Başlatıcılık',
      calling: 'Korkusuzca ilk adımı atarak başkalarının cesaret edemediği manevi yolları açmak, bağımsız ruhsal liderlik yapmak.',
      impact: 'Topluma kendi ayakları üzerinde durmayı ve ruhsal iradeyi aşılar.'
    },
    'Boğa': {
      title: 'Kutsal Madde, Doğal Şifa & Kalıcı Değer Üreticisi',
      calling: 'Toprakla, bedenle, doğayla ve ruhsal sanatla bağ kurarak dünyaya dinginlik, somut huzur ve şifa aşılamak.',
      impact: 'Ruhsal değerleri yeryüzünde elle tutulur, kalıcı ve huzurlu zanaat eserlerine dönüştürür.'
    },
    'İkizler': {
      title: 'Kozmik Elçi, Bilgelik Aktarıcısı & Köprü Kurucu',
      calling: 'Yüksek ruhsal gerçekleri anlaşılır sade dillere tercüme etmek, kelimeler ve yazıyla insanları uyandırmak.',
      impact: 'Zihinlerdeki tabuları yıkar, bilgi akışını hızlandırarak kolektif bilinci genişletir.'
    },
    'Yengeç': {
      title: 'Kolektif Anne, Ruhsal Şefkat & Sığınak İnşacısı',
      calling: 'Yaralı ruhlara şefkatle kucak açmak, aidiyet yaratmak, derin duygusal yaraları sevgiyle sarmak.',
      impact: 'İnsanların duygusal kökleriyle barışmasını ve kalpten beslenmesini sağlar.'
    },
    'Aslan': {
      title: 'İlahi Işık, Kalp Rehberi & Yaratıcı İlham Kaynağı',
      calling: 'Kendi içsel ışığını korkmadan parlatıp sahneye koymak, insanlara yaşama sevinci ve kalpten üretme ilhamı vermek.',
      impact: 'Karanlıkta kalan ruhlara umut, asalet ve yaratıcı coşku aşılar.'
    },
    'Başak': {
      title: 'Kutsal Hizmetkâr, Zanaat Üstadı & Simyacı Şifacı',
      calling: 'Kibri bırakıp bizzat alçakgönüllülükle hizmet etmek; beden, zihin ve ruh dengesini ince ayarla onarmak.',
      impact: 'Kaosu düzene çevirir, günlük hayatı kutsal bir ibadete ve arınmaya dönüştürür.'
    },
    'Terazi': {
      title: 'Kozmik Ahenk, İlahi Adalet & Güzellik Elçisi',
      calling: 'İnsanlar arasındaki kutuplaşmaları sevgi ve diplomasiyle eritmek, sanatı ve adaleti ruhsal bir mertebeye taşımak.',
      impact: 'Çatışmaları barışa, çirkinlikleri ruhu dinlendiren estetik bir armoniye evirir.'
    },
    'Akrep': {
      title: 'Gölge Şifacısı, Ruhsal Simyacı & Kriz Dönüştürücüsü',
      calling: 'İnsanların yüzleşmeye korktuğu en derin karanlıklara inip oradan elmaslar çıkarmak, tabuları ve travmaları dönüştürmek.',
      impact: 'Ölüm ve yeniden doğum döngülerinde ruhlara korkusuzca eşlik eder.'
    },
    'Yay': {
      title: 'Manevi Yol Gösterici, Hakikat Yolcusu & Bilge Gezgin',
      calling: 'Dar inanç kalıplarını yıkıp evrensel hakikati aramak; felsefe, yüksek öğreti ve rehberlikle ufukları genişletmek.',
      impact: 'Ruhları esaretten kurtarır, evrenin yüce anlamına doğru yolculuğa çıkarır.'
    },
    'Oğlak': {
      title: 'Ruhsal Mimar, Kadim Bilgelik Muhafızı & Akil Üstat',
      calling: 'Geçici hevesler yerine zamana meydan okuyan ruhsal sistemler kurmak, disiplin ve bilgelikle topluma rehberlik etmek.',
      impact: 'Manevi değerleri somut ve sarsılmaz bir sütun haline getirir.'
    },
    'Kova': {
      title: 'Kozmik Vizyoner, Kolektif Uyanışçı & Özgür Ruh',
      calling: 'İnsanlığı eski zincirlerinden kurtaracak devrimci fikirler getirmek, eşitlik ve kolektif kardeşlik ağları kurmak.',
      impact: 'Geleceğin ışığını bugüne taşır, insanlığı yeni bilinç çağına hazırlar.'
    },
    'Balık': {
      title: 'Evrensel Sevgi Kanalı, Mistisizm & Sanatsal Bütünlük',
      calling: 'Ego sınırlarını eritip koşulsuz merhamet kanalını açmak; müzik, sanat, dua ve teslimiyetle ruhları iyileştirmek.',
      impact: 'İlahi birlik hissini uyandırır, dünyevi acıları ilahi aşkla teselli eder.'
    }
  };

  const mcData = mcCallings[dMc] || mcCallings['Koç'];

  // 2. Ruhun Enkarnasyon Özü (Drakonik Ascendant)
  const ascEssences: Record<string, string> = {
    'Koç': 'Ruhunuz bu enkarnasyona saf yaşam enerjisini, bağımsız cesareti ve korkusuz başlangıçları deneyimlemeye geldi.',
    'Boğa': 'Ruhunuz yeryüzünün kutsal dengesini, dinginliği, doğal üretkenliği ve maddeyle barışmayı tecrübe etmeye geldi.',
    'İkizler': 'Ruhunuz zihinsel merakı, yüksek bilginin köprülerini kurmayı ve kelimelerin dönüştürücü gücünü yaymaya geldi.',
    'Yengeç': 'Ruhunuz kalbin şefkatini, koruyuculuğu ve koşulsuz bir yuva sevgisini dünyaya hediye etmeye geldi.',
    'Aslan': 'Ruhunuz ilahi yaratıcılığı, asil bir cömertliği ve kendi öz ışığıyla karanlığı aydınlatmayı öğrenmeye geldi.',
    'Başak': 'Ruhunuz arınmayı, kutsal zanaat ustalığını ve dünyayı sessizce iyileştiren adanmış bir hizmeti sunmaya geldi.',
    'Terazi': 'Ruhunuz ilahi ahengi, adil dengeleri ve ruhsal yoldaşlıkların kutsallığını inşa etmeye geldi.',
    'Akrep': 'Ruhunuz en derin gölgelerden geçerek ruhsal simyayı, tutkunun gücünü ve küllerinden doğmayı kavramaya geldi.',
    'Yay': 'Ruhunuz sonsuz hakikat arayışını, ilahi neşeyi ve evrensel bilgeliği kitlelerle paylaşmaya geldi.',
    'Oğlak': 'Ruhunuz manevi olgunluğu, zamansız kalitede eserler bırakmayı ve ruhsal bir üstat gibi sorumluluk almayı seçti.',
    'Kova': 'Ruhunuz toplumsal tabuları yıkarak bireysel özgürlüğü ve evrensel kardeşliği yeryüzüne indirmeyi seçti.',
    'Balık': 'Ruhunuz koşulsuz teslimiyeti, ilahi merhameti ve sanatsal ilhamla dünyayı arındırmayı seçti.'
  };

  // 3. Ruhu Besleyen Kadersel Sektörler (Drakonik Gezegen Dağılımı)
  const soulScores: Record<string, number> = {
    creative: 25,
    human: 25,
    global: 20,
    systems: 15,
    technology: 10,
    finance: 10,
    leadership: 15
  };

  if (['Balık', 'Terazi', 'Boğa', 'Aslan'].includes(dVenus) || ['Balık', 'Yengeç', 'Yay'].includes(dMc)) {
    soulScores.creative += 35;
    soulScores.human += 25;
  }
  if (['Başak', 'Oğlak'].includes(dMc) || ['Başak', 'Yengeç'].includes(dMoon)) {
    soulScores.human += 30;
    soulScores.systems += 25;
  }
  if (['Yay', 'Kova'].includes(dMc) || ['Yay', 'Kova'].includes(dSun)) {
    soulScores.global += 35;
    soulScores.creative += 20;
  }

  const soulTotal = Object.values(soulScores).reduce((a, b) => a + b, 0);
  const sortedSoulKeys = Object.keys(soulScores).sort((a, b) => soulScores[b] - soulScores[a]);
  const soulTopKeys = sortedSoulKeys.slice(0, 3);

  const soulTopSectors: CareerSectorMatch[] = soulTopKeys.map(k => {
    const def = SECTOR_DEFINITIONS[k];
    const pct = Math.round((soulScores[k] / soulTotal) * 100);
    return {
      id: def.id,
      title: def.title,
      shortTitle: def.shortTitle,
      category: def.category,
      fitScore: soulScores[k],
      percentage: pct,
      color: def.color,
      recommendedRoles: def.roles.slice(0, 3),
      description: def.description
    };
  });

  // 4. Ruh & Madde Denge Köprüsü:
  const soulMaterialBridge = {
    materialIdentity: `${primaryMaterialSector.shortTitle} alanındaki dünyevi mesleğiniz (Sosyal Güvence & Rızık)`,
    soulCalling: `Drakonik ${dMc} MC: ${mcData.title}`,
    synthesisAdvice: `Dünyevi alanda (${primaryMaterialSector.shortTitle}) çalışırken rızkınızı ve dünyevi intizamınızı sağlarsınız; ancak ruhunuzun doyması için Drakonik ${dMc} kadersel çağrınızı (${mcData.calling.substring(0, 75)}...) hayatınızın merkezine almalısınız. Dünyevi mesleğinizi bir nihai amaç değil; ruhsal sanatınızı, zanaatinizi, şifanızı ve yaratıcılığınızı besleyen güvenli bir zemin olarak konumlandırın.`,
    unfulfillmentWarning: `Eğer sadece maddi kazanç, maaş veya unvan peşinde koşup ruhunuzun bu kadersel çağrısını ihmal ederseniz; hayatınızda ne kadar para kazanırsanız kazanın içsel bir boşluk, anlamsızlık ve 'Ben neden buradayım?' buhranı baş gösterir.`,
    dailySpiritualPractice: `Haftada en az 4-5 saat dünyevi iş kaygılarından tamamen sıyrılarak; müzik, el zanaati, manevi tefekkür veya insanlara karşılıksız şifa/yardım sunacağınız ruhsal bir alanı kutsal bir ritüel olarak yaşatın.`
  };

  return {
    soulMidheaven: {
      sign: dMc,
      title: mcData.title,
      calling: mcData.calling,
      impact: mcData.impact
    },
    soulAscendant: {
      sign: dAsc,
      essence: ascEssences[dAsc] || ascEssences['Koç']
    },
    soulSun: {
      sign: dSun,
      mission: `Ruhunuz ${dSun} enerjisini yayarak parıldamayı ve dünyayı aydınlatmayı kadersel görev edinmiştir.`
    },
    soulMoon: {
      sign: dMoon,
      emotionalNourishment: `Ruhunuz ${dMoon} doğasında beslenir; dinginlik, duygusal derinlik ve samimiyet onun en büyük yakıtıdır.`
    },
    soulTopSectors,
    soulMaterialBridge
  };
}

function calculateSecondaryProgressions(natalChart: NatalChartData, birthDate: string): ProgressedCareerData {
  const currentAge = moment().diff(moment(birthDate), 'years');
  const exactAgeYears = moment().diff(moment(birthDate), 'days') / 365.2422;

  const natalSun = natalChart.planets.find(p => p.name === 'Güneş') || { longitude: 0, sign: 'Koç', degreeInSign: 0, minutes: 0 };
  const natalMoon = natalChart.planets.find(p => p.name === 'Ay') || { longitude: 0, sign: 'Boğa', degreeInSign: 0, minutes: 0 };
  const natalMc = natalChart.midheaven || { longitude: 0, sign: 'Oğlak', degreeInSign: 0, minutes: 0 };

  // 1. İlerletilmiş Güneş (Günde 0.9856473322 derece = Yılda 0.9856473322 derece)
  const SUN_PROG_RATE = 0.9856473322;
  const progSunLon = (natalSun.longitude + exactAgeYears * SUN_PROG_RATE) % 360;
  const progSunData = getSignAndDegree(progSunLon);

  const remainingToFirstShift = 30 - (natalSun.degreeInSign + natalSun.minutes / 60);
  const shiftAge = Math.round((remainingToFirstShift / SUN_PROG_RATE) * 10) / 10;
  const hasShifted = exactAgeYears >= shiftAge;

  const remainingInCurrentProgSun = 30 - (progSunData.degreeInSign + progSunData.minutes / 60);
  const nextShiftAge = Math.round((exactAgeYears + remainingInCurrentProgSun / SUN_PROG_RATE) * 10) / 10;

  const identityShiftTheme = `${natalSun.sign} Doğumu → ${progSunData.sign} Bilincine Evrilme`;
  let explanation = '';
  if (hasShifted) {
    explanation = `Doğum anınızdaki ${natalSun.sign} mizanız, yaklaşık ${shiftAge} yaşında kabuk değiştirerek ${progSunData.sign} enerjisine evrilmiştir. Gençlikteki öncelikleriniz yerini ${progSunData.sign} burcunun getirdiği mesleki olgunluğa bırakmıştır. Bir sonraki büyük kadersel mizaç dönüşümünüz yaklaşık ${nextShiftAge} yaşında gerçekleşecektir.`;
  } else {
    explanation = `Güneşiniz henüz doğum anınızdaki ${natalSun.sign} burcunda olgunlaşmaktadır. Yaklaşık ${shiftAge} yaşına geldiğinizde Güneşiniz ${progSunData.sign} burcuna geçecek ve kariyerinizde köklü bir zihniyet ve hedef değişimi tetiklenecektir.`;
  }

  // 2. İlerletilmiş Ay (Günde ~13.176358 derece = Yılda ~13.176358 derece)
  const MOON_PROG_RATE = 13.176358;
  const progMoonLon = (natalMoon.longitude + exactAgeYears * MOON_PROG_RATE) % 360;
  const progMoonData = getSignAndDegree(progMoonLon);

  const degsLeftInMoonSign = 30 - (progMoonData.degreeInSign + progMoonData.minutes / 60);
  const estimatedMonthsLeft = Math.max(1, Math.round((degsLeftInMoonSign / MOON_PROG_RATE) * 12));

  // Natal hangi evde olduğunu bul
  let natalHouse = 1;
  if (natalChart.houses && natalChart.houses.length === 12) {
    for (let i = 0; i < 12; i++) {
      const currentCusp = natalChart.houses[i].longitude;
      const nextCusp = natalChart.houses[(i + 1) % 12].longitude;
      const distance = (nextCusp - currentCusp + 360) % 360;
      const pointDist = (progMoonLon - currentCusp + 360) % 360;
      if (pointDist < distance) {
        natalHouse = natalChart.houses[i].house || (i + 1);
        break;
      }
    }
  }

  const houseThemes: Record<number, { title: string; impact: string }> = {
    1: { title: 'Yeni Başlangıçlar & Bireysel Kimlik İnşası', impact: '28 yıllık yepyeni bir kariyer döngüsünün başındasınız. Kendi vizyonunuzu, adınızı ve bireysel projelerinizi öne çıkarma zamanı.' },
    2: { title: 'Kendi Gelirini Artırma & Finansal Güvence', impact: 'Maaşınızı artırma, fiyatınızı yükseltme, birikim yapma ve yeteneklerinizi doğrudan nakit paraya dönüştürme dönemindesiniz.' },
    3: { title: 'Yeni Beceriler, Ticaret & İletişim Ağı', impact: 'Eğitim alma, yeni araç ve yazılımları öğrenme, yerel ticaret, resmi yazışmalar ve network kurma dönemindesiniz.' },
    4: { title: 'Köklenme, Temel Kurma & İç Düzen', impact: 'Kendi iş yerinizi, dükkanınızı veya atölyenizi kurma, ailevi/maddi güvenceyi sağlama ve sağlam temeller atma çağı.' },
    5: { title: 'Yaratıcı İfade, Sahne & Özgün Projeler', impact: 'Zevk alarak üretme, sahneye çıkma, risk alma, sanatsal veya inovatif projelerinizi parlatma zamanı.' },
    6: { title: 'Çok Çalışma, Zanaat, Hizmet & Ustalık', impact: 'Çıraklık, işe ve üretime adanma, detayları mükemmelleştirme, memuriyet veya zanaat disipliniyle pişme dönemi.' },
    7: { title: 'Stratejik Ortaklıklar & Müşteri Bağları', impact: 'Tek başına değil; doğru ortaklar bulma, sözleşmeler imzalama, danışmanlık verme ve kilit ittifaklar kurma zamanı.' },
    8: { title: 'Kriz Yönetimi, Yatırım & Derin Dönüşüm', impact: 'Kredi, fon, ortak sermaye yönetimi, eski mesleki alışkanlıkları geride bırakıp yenilenme çağı.' },
    9: { title: 'Vizyon Genişletme, Yüksek Eğitim & Dış Pazarlar', impact: 'Akademi, dış ticaret, yabancı diller, yayıncılık veya felsefi danışmanlıkta ufukları aşma zamanı.' },
    10: { title: 'Kariyer Zirvesi, Unvan, Terfi & Görünürlük', impact: 'En yüksek kariyer görünürlüğü dönemi! Emeklerinizin karşılığını alma, unvan tescilleme ve toplum önünde takdir görme çağı.' },
    11: { title: 'Kolektif Projeler, Birlik & Gelecek Vizyonu', impact: 'Meslek odaları, dernekler, kooperatifler, geniş kitlelere hitap eden projeler ve ekip liderliği zamanı.' },
    12: { title: 'Arınma, Defterleri Kapatma & Kuluçka Dönemi', impact: 'Eski 28 yıllık döngünün son faslı. Zorlamadan dinlenme, içsel hazırlık yapma ve yeni büyük döngüye zemin hazırlama zamanı.' }
  };

  const houseData = houseThemes[natalHouse] || houseThemes[10];

  // 3. İlerletilmiş Ay Fazı (Elongasyon Açısı: Moon - Sun)
  const phaseAngle = (progMoonLon - progSunLon + 360) % 360;
  let phaseNumber = 1;
  let phaseName = 'Yeniay Fazı (0° - 45°)';
  let phaseMotto = '30 Yıllık Yeni Kariyer Tohumunu Ekiş';
  let stageDescription = 'Önünüzdeki 30 yıllık hayat ve kariyerinizin tohumlarını ektiğiniz taptaze bir başlangıç evresindesiniz.';
  let careerHarvestGuidance = 'Hemen devasa meyveler beklemeyin; sabırla temelleri atın, yeni becerileri öğrenin ve yönünüzü belirleyin.';

  if (phaseAngle >= 45 && phaseAngle < 90) {
    phaseNumber = 2;
    phaseName = 'Hilal Fazı (45° - 90°)';
    phaseMotto = 'İlk Filizlenme & Cesur Mücadele';
    stageDescription = 'Ektiğiniz tohumların ilk filizlerini verdiği, dirençlerle karşılaştığınız ve kararlılıkla mücadele ettiğiniz evredir.';
    careerHarvestGuidance = 'Şüpheye düşmeyin; projelerinize tutunarak piyasadaki ilk engelleri inançla aşın.';
  } else if (phaseAngle >= 90 && phaseAngle < 135) {
    phaseNumber = 3;
    phaseName = 'İlk Dördün Fazı (90° - 135°)';
    phaseMotto = 'Kriz Yönetimi, Karar & Yön Tayini';
    stageDescription = 'Geri dönüşün olmadığı, kariyer rotanızdaki en kritik virajı döndüğünüz eylem ve karar aşamasıdır.';
    careerHarvestGuidance = 'Eskiye tutunmayı bırakın; cesur kararlar alarak profesyonel yolunuzu kesinleştirin.';
  } else if (phaseAngle >= 135 && phaseAngle < 180) {
    phaseNumber = 4;
    phaseName = 'Büyüyen Ay Fazı (135° - 180°)';
    phaseMotto = 'Ustalığı İnce Ayarla Mükemmelleştirme';
    stageDescription = 'Büyük hasattan hemen önceki evre. Hataları düzeltme, uzmanlığı cilalama ve kalite standartlarını zirveye çıkarma zamanıdır.';
    careerHarvestGuidance = 'Ayrıntılara odaklanın; ürününüzü veya zanaatinizi kusursuzlaştırarak büyük vitrine hazırlanın.';
  } else if (phaseAngle >= 180 && phaseAngle < 225) {
    phaseNumber = 5;
    phaseName = 'Dolunay Fazı (180° - 225°)';
    phaseMotto = 'Kariyer Zirvesi, Büyük Hasat & Görünürlük';
    stageDescription = '30 yıllık döngünün en aydınlık zirvesi! 15 yıldır verdiğiniz tüm emeklerin meyvelerini topladığınız hasat çağıdır.';
    careerHarvestGuidance = 'Mütevazılıkla geri çekilmeyin; hakkınız olan unvanı, geliri ve saygınlığı özgüvenle kabul edin.';
  } else if (phaseAngle >= 225 && phaseAngle < 270) {
    phaseNumber = 6;
    phaseName = 'Küçülen / Hasat Fazı (225° - 270°)';
    phaseMotto = 'Meyveleri Dağıtma & Bilgelik Aktarımı';
    stageDescription = 'Elde ettiğiniz başarıyı ve tecrübeyi başkalarıyla paylaştığınız, mentorluk ve akil liderlik yaptığınız evredir.';
    careerHarvestGuidance = 'Bilgiyi saklamayın; ekibinizi eğitin, zanaatinizi öğretin ve sektörel itibarınızı kökleştirin.';
  } else if (phaseAngle >= 270 && phaseAngle < 315) {
    phaseNumber = 7;
    phaseName = 'Son Dördün Fazı (270° - 315°)';
    phaseMotto = 'Yeniden Yapılanma & Fazlalıkları Eleme';
    stageDescription = 'Size artık hizmet etmeyen işleri, ortaklıkları ve yükleri elediğiniz, sadeleşme ve revizyon çağıdır.';
    careerHarvestGuidance = 'Yorulmuş sistemleri tasfiye edin; sadeleşerek operasyonel yüklerinizi hafifletin.';
  } else if (phaseAngle >= 315) {
    phaseNumber = 8;
    phaseName = 'Balsamik / Karanlık Ay Fazı (315° - 360°)';
    phaseMotto = 'Eski Döngüyü Kapatma, Arınma & Dinlenme';
    stageDescription = '30 yıllık koca bir kariyer perdesinin kapanış evresidir. Kuluçka zamanıdır; yeni büyük döngü için içsel hazırlık yapılır.';
    careerHarvestGuidance = 'Zorla yeni büyük hamleler yapmaya çalışmayın; dinlenin, arının ve yakında doğacak yeni döneme hazırlanarak güç toplayın.';
  }

  // 4. İlerletilmiş MC (Solar Arc)
  const progMcLon = ((natalMc.longitude || 0) + exactAgeYears * SUN_PROG_RATE) % 360;
  const progMcData = getSignAndDegree(progMcLon);

  const mcExplanations: Record<string, string> = {
    'Koç': 'Mesleki hayatınızda bağımsızlık, yeni bir sektöre öncülük etme ve başkalarının cesaret edemediği projeleri kendi inisiyatifinizle başlatma çağı.',
    'Boğa': 'Kariyerinizde somut finansal güvence, kalıcı üretken varlıklar inşa etme ve piyasada güven veren sağlam bir marka yaratma evresi.',
    'İkizler': 'Mesleki ağları (network) genişletme, ticaret, dijital medya, iletişim ve çok kanallı projelerle toplumsal görünürlük kazanma dönemi.',
    'Yengeç': 'Kendi şirketinizi/ekibinizi bir aile gibi koruma, aidiyet yaratma, gayrimenkul veya topluma hizmet odaklı saygın bir kariyer olgunlaşması.',
    'Aslan': 'Kariyerinizde sahneye çıkma, liderliği ve otoriteyi tam olarak üstlenme, kendi markanızı parlatma ve sektörde parmakla gösterilme çağı.',
    'Başak': 'Ustalık, teknik mükemmellik, hizmet kalitesini tescilleme ve operasyonel sistemleri kusursuz bir nizamla yönetme evresi.',
    'Terazi': 'Stratejik kurumsal ortaklıklar, prestijli iş birlikleri, halkla ilişkiler, diplomasi ve estetik standart belirleyiciliği dönemi.',
    'Akrep': 'Krizleri fırsata çevirme, büyük sermaye ve finansal dönüşüm yönetimi, stratejik hamleler ve derin sektörel otorite inşası.',
    'Yay': 'Uluslararası pazarlar, yüksek vizyon, akademi, yayıncılık ve sınırları aşan felsefi bir sektör liderliği çağı.',
    'Oğlak': 'Mesleki zirve, en üst unvanlar, devlet veya kurumsal kademelerde sarsılmaz bir nizam ve kalıcı bir miras bırakma evresi.',
    'Kova': 'Sektörde ezber bozan inovasyon, teknolojik devrim, bağımsız çalışma modelleri ve kitleleri peşinden sürükleyen vizyonerlik dönemi.',
    'Balık': 'Manevi doyum, sanatsal ilham, sezgisel rehberlik ve topluma şifa/ilham dağıtan yaratıcı bir mesleki olgunluk çağı.'
  };

  const mcExp = mcExplanations[progMcData.sign] || 'Kariyerinizde yeni bir statü ve toplumsal görünürlük evresine geçiş.';

  return {
    currentAge,
    progressedSun: {
      natalSign: natalSun.sign,
      natalDegree: natalSun.degreeInSign,
      progressedSign: progSunData.sign,
      degreeInSign: progSunData.degreeInSign,
      minutes: progSunData.minutes,
      hasShifted,
      shiftAge,
      nextShiftAge,
      identityShiftTheme,
      explanation
    },
    progressedMoon: {
      sign: progMoonData.sign,
      degreeInSign: progMoonData.degreeInSign,
      minutes: progMoonData.minutes,
      natalHouse,
      cycleTheme: houseData.title,
      houseImpact: houseData.impact,
      estimatedMonthsLeft
    },
    progressedMoonPhase: {
      name: phaseName,
      phaseNumber,
      phaseMotto,
      elongationDegree: Math.round(phaseAngle * 10) / 10,
      stageDescription,
      careerHarvestGuidance
    },
    progressedMidheaven: {
      sign: progMcData.sign,
      degreeInSign: progMcData.degreeInSign,
      careerEvolutionTitle: `İlerletilmiş Tepe Noktanız ${progMcData.sign} (${progMcData.degreeInSign}°)`,
      explanation: mcExp
    }
  };
}

// ---------------------------------------------------------
// 15. KADİM VE EZOTERİK YENİ DERİN MESLEKİ MODÜLLER:
// ---------------------------------------------------------

/**
 * 1. MÜZİKAL ENSTRÜMAN VE SES YATKINLIĞI (UZMAN ASTRO-ENSTRÜMAN MOTORU)
 * Fiziksel icra anatomisi (Yükselen parmak/el kontrolü), ruhsal ritim ve nefes (Ay ve MC),
 * zihinsel koordinasyon (Merkür), armoni ve tel rezonansı (Venüs & Balık/Boğa/Terazi),
 * mistik derinlik (Neptün), vokal rezonansı (2. Ev).
 */
function calculateMusicalAffinity(
  chart: NatalChartData,
  ascSign: string,
  sun: AstroPoint,
  moon: AstroPoint,
  mercury: AstroPoint,
  venus: AstroPoint,
  neptune: AstroPoint,
  mars: AstroPoint,
  house2Sign: string,
  mcSign: string
): MusicalAffinityData {
  // 6 Temel Müzikal Kulvar Puanlaması
  const scores = {
    strings: 0,   // Klasik/Akustik Gitar, Telli Armoni (Venüs, Balık stelyumu, Boğa/Terazi tel dokunuşu)
    winds: 0,     // Yan Flüt, Klarnet, Saksafon, Ney (Ay/MC Terazi/İkizler/Kova nefes ve diyafram)
    keys: 0,      // Piyano, Akustik Klavye, Tuşlular (Yükselen Başak/İkizler parmak koordinasyonu & Merkür)
    bowed: 0,     // Keman, Çello, Kontrbas, Yaylı Ud (Su stelyumu, Neptün perdesiz derinlik)
    rhythm: 0,    // Bateri, Perküsyon, Elektro Gitar (Mars, Ateş yükselen, yüksek nabız ve sahne itkisi)
    meditative: 0 // Handpan, Kalimba, Ses Çanakları (Neptün/12. Ev 432Hz meditatif şifa)
  };

  const instrumentReasons: Record<string, string[]> = {
    strings: [],
    winds: [],
    keys: [],
    bowed: [],
    rhythm: [],
    meditative: []
  };

  // A) TUŞLULAR & PİYANO (PARMAK & EL ANATOMİSİ, POLİFONİK ARMONİ):
  if (ascSign === 'Başak') {
    scores.keys += 48;
    instrumentReasons.keys.push('Yükselen Başak el-parmak mikro-koordinasyonu ve bağımsız el ritmi (Piyano)');
  } else if (ascSign === 'İkizler') {
    scores.keys += 38;
    instrumentReasons.keys.push('Yükselen İkizler parmak çevikliği ve hızlı nota geçişleri');
  } else if (['Terazi', 'Boğa'].includes(ascSign)) {
    scores.keys += 38;
    instrumentReasons.keys.push(`Yükselen ${ascSign} polifonik akor kulağı, tuş hassasiyeti ve armonik piyano yetisi (Piyano)`);
  } else if (['Oğlak'].includes(ascSign)) {
    scores.keys += 26;
    instrumentReasons.keys.push('Toprak yükselenin metronomik nota intizamı ve tuş ağırlığı');
  }

  if (['Başak', 'İkizler'].includes(mercury.sign)) {
    scores.keys += 30;
    instrumentReasons.keys.push(`Merkür ${mercury.sign} nörolojik parmak refleksleri`);
  } else if (['Balık', 'Terazi'].includes(mercury.sign)) {
    scores.keys += 25;
    instrumentReasons.keys.push(`Merkür ${mercury.sign} tuşlardaki duygusal nüans ve nüfuz kabiliyeti`);
  }
  if ([1, 3, 6, 10].includes(mercury.house)) {
    scores.keys += 18;
  }
  if (['Boğa', 'Başak', 'Oğlak'].includes(moon.sign)) {
    scores.keys += 16;
  }

  // B) TELLİ & AKUSTİK GİTAR (AKOR, ARMONİ & MELODİ):
  const piscesCount = chart.planets.filter(p => p.sign === 'Balık').length;
  if (['Balık', 'Terazi', 'Boğa'].includes(sun.sign)) {
    scores.strings += 38;
    instrumentReasons.strings.push(`${sun.sign} Güneşinin tellere dokunma arzusu ve melodik hassasiyeti (Gitar)`);
  }
  if (['Terazi', 'Balık', 'Boğa'].includes(moon.sign)) {
    scores.strings += 36;
    instrumentReasons.strings.push(`Ay ${moon.sign} armonik tel titreşimi ve akor duyarlılığı`);
  }
  if (['Balık', 'Boğa', 'Terazi'].includes(venus.sign)) {
    scores.strings += 32;
    instrumentReasons.strings.push(`Venüs ${venus.sign} estetik tını ve akor geçişleri`);
  }
  if (piscesCount >= 2) {
    scores.strings += 28;
    instrumentReasons.strings.push('Balık stelyumunun kalbi melodiye ve tellere dökme ihtiyacı');
  }

  // C) NEFESLİ ÇALGILAR & FLÜT (DİYAFRAM, NEFES & HAVA):
  if (['Terazi', 'İkizler', 'Kova'].includes(moon.sign)) {
    scores.winds += 46;
    instrumentReasons.winds.push(`Ay ${moon.sign} nefes-diyafram akışı ve melodik hava zarafeti (Flüt)`);
  }
  if (['İkizler', 'Terazi', 'Kova'].includes(mcSign)) {
    scores.winds += 36;
    instrumentReasons.winds.push(`Tepe Noktası (MC) ${mcSign} nefesli çalgılarda ifade dehası`);
  }
  if (['İkizler', 'Terazi'].includes(ascSign)) {
    scores.winds += 26;
    instrumentReasons.winds.push(`Yükselen ${ascSign} solunum ritmi ve nefes kontrolü`);
  }
  const airCount = chart.planets.filter(p => ['İkizler', 'Terazi', 'Kova'].includes(p.sign)).length;
  if (airCount >= 3) {
    scores.winds += 22;
  }

  // D) YAYLILAR & MİKRO-TON FREKANSI (KEMAN, ÇELLO, UD):
  if (piscesCount >= 3 || chart.planets.filter(p => ['Yengeç', 'Akrep', 'Balık'].includes(p.sign)).length >= 4) {
    scores.bowed += 36;
    instrumentReasons.bowed.push('Derin Su elementi yoğunluğunun perdesiz yaylılarda hüzün ve şifa bulması');
  }
  if ([8, 12].includes(neptune.house) || ['Balık', 'Akrep'].includes(neptune.sign)) {
    scores.bowed += 25;
    instrumentReasons.bowed.push('Neptünyen mikro-tonal perdeler ve trans frekansı');
  }
  if (['Yengeç', 'Akrep'].includes(moon.sign)) {
    scores.bowed += 20;
  }

  // E) RİTİM, VURMALI & SAHNE TELLERİ (BATERİ, PERKÜSYON, ELEKTRO GİTAR):
  if (['Koç', 'Aslan', 'Yay'].includes(ascSign)) {
    scores.rhythm += 46;
    instrumentReasons.rhythm.push(`Yükselen ${ascSign} yüksek sahne voltajı ve poliritmik beden nabzı (Bateri)`);
  }
  if ([1, 10].includes(mars.house) || ['Koç', 'Akrep', 'Oğlak'].includes(mars.sign)) {
    scores.rhythm += 36;
    instrumentReasons.rhythm.push(`Mars ${mars.sign} güçlü ataklar, vuruş kararlılığı ve sahne alevi`);
  }
  if (['Koç', 'Aslan', 'Yay'].includes(sun.sign) || ['Koç', 'Yay'].includes(moon.sign)) {
    scores.rhythm += 26;
  }

  // F) MEDİTATİF ŞİFA (HANDPAN, KALİMBA):
  if (neptune.house === 1 || neptune.house === 12 || ['Kova', 'Balık'].includes(moon.sign)) {
    scores.meditative += 32;
    instrumentReasons.meditative.push('Bilinçaltını arındıran 432Hz meditatif rezonans');
  }

  // Kulvarları Puanlarına Göre Sırala
  const sortedTracks = (Object.keys(scores) as Array<keyof typeof scores>)
    .sort((a, b) => scores[b] - scores[a]);

  const topTrack = sortedTracks[0];
  const secondTrack = sortedTracks[1];
  const thirdTrack = sortedTracks[2];

  // Enstrüman Eşleşmeleri
  const trackInstruments: Record<string, { title: string; main: string; items: string[]; element: string }> = {
    strings: {
      title: 'Klasik & Akustik Telli Armoni',
      main: 'Klasik / Akustik Gitar',
      items: ['Klasik & Akustik Gitar', 'Akustik Bas', 'Klasik Ud & Arp'],
      element: 'Venüs & Balık (Akor Rezonansı & Tel Dokunuşu)'
    },
    winds: {
      title: 'Nefesli Çalgılar & Hava Frekansı',
      main: 'Yan Flüt & Nefesliler',
      items: ['Yan Flüt', 'Klarnet & Ney', 'Saksafon'],
      element: 'Hava & Ay (Diyafram Kontrolü & Lirik Akış)'
    },
    keys: {
      title: 'Piyano & Akustik Tuşlu Sistemler',
      main: 'Piyano & Akustik Piyano',
      items: ['Akustik Piyano & Kuyruklu Piyano', 'Vintage Elektrikli Piyano (Rhodes)', 'Synthesizer Klavye'],
      element: 'Toprak & Merkür (Matematiksel Akor & Parmak İntizamı)'
    },
    bowed: {
      title: 'Perdesiz Yaylılar & Mikro-Ton Ailesi',
      main: 'Keman & Çello',
      items: ['Keman & Viyola', 'Çello & Kontrbas', 'Klasik Yaylı Ud'],
      element: 'Su & Eter (Mikro-Ton Geçişleri & Ruhani Derinlik)'
    },
    rhythm: {
      title: 'Dinamik Ritim & Sahne Telleri',
      main: 'Bateri & Elektro Gitar',
      items: ['Akustik Bateri & Davul Seti', 'Solo Elektro Gitar', 'Perküsyon & Bendir'],
      element: 'Ateş & Mars (Nabız, Yüksek İtki & Sahne Alevi)'
    },
    meditative: {
      title: 'Mistik & Meditatif Frekans Çalgıları',
      main: 'El Panı (Handpan / Hang Drum)',
      items: ['Handpan (Hang Drum)', 'Akustik Kalimba', 'Tibet Ses Çanakları'],
      element: 'Eter & 432Hz Şifa Rezonansı'
    }
  };

  // Kişiye özel en yüksek 3 enstrümanı seç ve birincil vitrini oluştur
  const primaryInstrumentsList = [
    trackInstruments[topTrack].main,
    trackInstruments[secondTrack].main,
    trackInstruments[thirdTrack].main
  ];

  // Birleşik kategori başlığı ve element
  const primaryCategory = `${trackInstruments[topTrack].title} & ${trackInstruments[secondTrack].title}`;
  const primaryElement = `${trackInstruments[topTrack].element} + ${trackInstruments[secondTrack].element}`;

  // Kişiye özel harita gerekçesi sentezi
  const topReasons = [
    ...(instrumentReasons[topTrack] || []),
    ...(instrumentReasons[secondTrack] || []),
    ...(instrumentReasons[thirdTrack] || [])
  ].slice(0, 3);

  const primaryEssence = topReasons.length > 0
    ? `Doğum haritanızdaki ${topReasons.join('; ')} bileşimi; bu enstrümanları parmaklarınızda, nefesinizde ve ruhunuzda en zahmetsizce rezonansa sokan ana kaynaktır.`
    : 'Doğum haritanızdaki el-parmak koordinasyonu, nefes dengesi ve melodi arayışı bu enstrümanlarda en yüksek uyumu sağlar.';

  // İkincil Stil (2. ve 3. sıradaki enstrümanların alternatif setleri)
  const secCategory = trackInstruments[secondTrack].title;
  const secInstruments = trackInstruments[secondTrack].items;
  const secEssence = `${trackInstruments[secondTrack].main} tınıları ve nefes/akor akışı, zihinsel korteks gerginliğinizi topraklayarak iş hayatındaki odaklanmanızı zirveye taşır.`;

  // Vokal / Şan Yatkınlığı (2. Ev ve Boğa / Terazi / Aslan tınısı)
  const isVocalFriendly = ['Boğa', 'Terazi', 'Aslan', 'İkizler', 'Balık', 'Yengeç'].includes(house2Sign) ||
    ['Boğa', 'Terazi', 'Aslan'].includes(venus.sign) ||
    ['Boğa', 'Terazi'].includes(moon.sign) ||
    venus.house === 2 || venus.house === 1;

  const vocalStyle = ['Boğa', 'Terazi'].includes(house2Sign) || ['Boğa', 'Terazi'].includes(venus.sign) || ['Terazi'].includes(moon.sign)
    ? 'Lirik, Buğulu & Sıcak Bariton / Mezzo Tınısı (Ruh Okşayan Kadife Rezonans)'
    : ['Aslan', 'Koç'].includes(house2Sign) || ['Aslan', 'Koç'].includes(ascSign)
      ? 'Dramatik, Güçlü & Yüksek Desibelli Sahne Vokali (Belting & Karizmatik Vurgu)'
      : 'Ruhani, İçsel & Şiirsel Melodik Vokal (Akustik & Tasavvufi Mırıldanma)';

  const chakraResonance = isVocalFriendly
    ? 'Vishuddha (5. Boğaz Çakrası) Rezonansı Açık: Ses telleriniz sadece konuşma değil, kelimeleri ve melodileri ruha şifa olarak aktarma frekansına sahip.'
    : 'Muladhara & Anahata Dengeleyici: Vokaliniz doğrudan kalp merkezli; teknik tizlerden ziyade samimi ve derin tınılarla rezonans yaratır.';

  return {
    primaryInstrument: {
      category: primaryCategory,
      instruments: primaryInstrumentsList,
      element: primaryElement,
      essence: primaryEssence
    },
    secondaryStyle: {
      category: secCategory,
      instruments: secInstruments,
      essence: secEssence
    },
    vocalAptitude: {
      hasAptitude: isVocalFriendly,
      style: vocalStyle,
      chakraResonance
    },
    musicalExpressionAdvice:
      `Günde en az 20 dakika ${primaryInstrumentsList[0]}, ${primaryInstrumentsList[1]} veya ${primaryInstrumentsList[2]} tellerine/tuşlarına/nefesine odaklanmak, doğum haritanızdaki zihinsel korteks gerginliğini sıfırlar ve iş hayatınızdaki karar alma berraklığınızı %40 artırır.`
  };
}

/**
 * 2. EL BECERİSİ & ZANAAT MALZEMESİ ANATOMİSİ
 * Parmakların ve zihnin hangi hammaddeyle temas ettiğinde ustalaştığı ve şifa bulduğu.
 */
function calculateCraftsmanshipMaterial(
  chart: NatalChartData,
  mars: AstroPoint,
  saturn: AstroPoint,
  venus: AstroPoint,
  sun: AstroPoint,
  ascSign: string
): CraftsmanshipMaterialData {
  let material = 'Masif Ahşap, Marangozluk & Organik Lifler';
  let title = 'Ahşap & Organik Doku Ustası (Köklenme ve Biçimlendirme)';
  let tools = ['Iskarpela & Rende', 'Doğal Ahşap Yağları & Mumlar', 'Ahşap Torna Tezgahı', 'Japon Çekme Testeresi'];
  let healing = 'Ağacın damarlarıyla temas etmek, aşırı zihinsel yorgunluğu ve kaygıyı toprağa aktararak sinir sisteminizi doğrudan sakinleştirir.';
  let commercial = ['Özel Tasarım Masif Mobilya & Masalar', 'Akustik Ahşap Hoparlör & Sanat Objeleri', 'Geleneksel Kündekari & Ahşap Oymacılık Atölyesi'];

  // Mars Koç/Akrep veya 1. / 10. Evde ise -> Demir / Çelik / Metal
  if (['Koç', 'Akrep', 'Oğlak'].includes(mars.sign) || [1, 10, 8].includes(mars.house)) {
    material = 'Dövme Çelik, Demir, Bakır & Metalurji Zanaatı';
    title = 'Ateş & Metal Simyacısı (Sertliği İradeyle Yoğurma)';
    tools = ['Örs & Çekiç', 'Gazlı Ocak & Tavlama Fırını', 'TIG / Gazaltı Kaynak Makinesi', 'Metal Polisaj & Asit Gravür'];
    healing = 'Metali dövmek ve ateşi kontrol etmek, içinizdeki bastırılmış öfke ve stres enerjisini somut bir sanat eserine ve kuvvete dönüştürür.';
    commercial = ['Koleksiyonluk Özel El Yapımı Şef Bıçakları', 'Özel Ferforje & Metal Mimari Detaylar', 'Endüstriyel Heykel & Metal Tasarım'];
  }
  // Venüs Boğa/Terazi veya Terazi/Boğa Yükselen -> Deri, Tekstil & Kumaş
  else if (['Boğa', 'Terazi'].includes(venus.sign) || ['Boğa', 'Terazi'].includes(ascSign)) {
    material = 'Doğal Deri, Saf İpek, Yün & Terzilik Kumaşları';
    title = 'Doku, Deri & Moda Zanaatkarı (Zarafet ve Mukavemet)';
    tools = ['Deri Delme Zımbaları & Mumlu İp', 'Geleneksel Saraç İğneleri', 'Döner Bıçak & Kalıp Masası', 'Bitkisel Tabaklama Yağları'];
    healing = 'Deriye dikiş atmak ve kumaşın dokusunu parmaklarla hissetmek, zihni derin bir transa ve estetik sükunete sokar.';
    commercial = ['Lüks El Yapımı Deri Çanta & Cüzdan Atölyesi', 'Kişiye Özel Terzilik & Kumaş Tasarımı', 'Deri Döşeme & Özel Aksesuar Üretimi'];
  }
  // Su burçları / 4. Ev vurgusu -> Kil, Seramik & Cam
  else if (['Yengeç', 'Balık', 'Akrep'].includes(sun.sign) || [4, 12].includes(sun.house)) {
    material = 'Doğal Kil, Seramik, Çamur & Cam Füzyon';
    title = 'Toprak & Su Şekillendiricisi (Akışkan Form Ustalığı)';
    tools = ['Çömlekçi Çarkı', 'Kil Şekillendirme Ebeşuarları', 'Yüksek Isı Sır Fırını', 'Cam Kesme & Füzyon Pürmüzü'];
    healing = 'Balçığa ve suya dokunmak, bilinçdışındaki duygusal düğümleri çözer ve sezgisel yaratıcılığı serbest bırakır.';
    commercial = ['Artizan Seramik Kahve & Sofra Takımları', 'Mimari Seramik Karo & Duvar Panoları', 'Özel Tasarım Cam Heykel & Aydınlatma'];
  }
  // Merkür Başak/İkizler/Kova -> Mikro-Mekanik & Kuyumculuk
  else if (['Başak', 'İkizler', 'Kova'].includes(chart.planets.find(p => p.name === 'Merkür')?.sign || '')) {
    material = 'Değerli Madenler (Gümüş/Altın), Değerli Taşlar & Mikro-Mekanik';
    title = 'Hassas Mikro-Mekanik & Kuyumculuk Ustası (Milimetrik Deha)';
    tools = ['Kuyumcu Kaynak Şalümosu', 'Büyüteçli Mikroskop & Kumpas', 'Hassas Saatçi Tornavidaları', 'Kıl Testere & Mıhlama Kalemleri'];
    healing = 'Göz ve elin mikron seviyesindeki mutlak uyumu, dağınık düşünceleri tek bir lazer odağında toplar.';
    commercial = ['Kişiye Özel Tasarım Gümüş & Altın Takı Atölyesi', 'Mekanik Saat Restorasyonu & Bakımı', 'Antika & Hassas Mekanizma Tamirciliği'];
  }

  return {
    primaryMaterial: material,
    craftsmanshipTitle: title,
    toolsAndTechniques: tools,
    healingPower: healing,
    commercialApplications: commercial
  };
}

/**
 * 3. KADERSEL ŞANS NOKTASI & RIZIK KAPISI (PARS FORTUNA / LOT OF FORTUNE)
 * Haritada zahmetsiz rızkın aktığı kadersel mesleki kapı.
 */
function calculateParsFortunaWealth(chart: NatalChartData): ParsFortunaWealthData {
  const pof = chart.planets.find(p => p.name.includes('Şans') || p.name.includes('POF')) || {
    name: 'Şans Noktası (POF)',
    sign: chart.ascendant?.sign || 'Koç',
    degreeInSign: 15,
    house: 2
  };

  const houseThemes: Record<number, { title: string; blessing: string; guidance: string }> = {
    1: {
      title: 'Bireysel Marka, Beden & Bağımsız Girişim Rızkı',
      blessing: 'Başkalarının emri altında değil; kendi adınızı, yüzünüzü ve şahsi markanızı ortaya koyduğunuzda kadersel bereket kapıları ardına kadar açılır.',
      guidance: 'Kendi firmanızı veya şahıs markanızı tescilleyin. Kendi tarzınızla liderlik ettiğiniz her iş doğrudan servet üretir.'
    },
    2: {
      title: 'Kendi Ürettiğin Somut Değer & Maddi Mülk Rızkı',
      blessing: 'En klasik ve güçlü zenginlik konumu. Elinizin emeği, nakit akışı kontrolü ve gayrimenkul/varlık biriktirme konusunda ilahi bir rızık akışına sahipsiniz.',
      guidance: 'Ürettiğiniz ürün veya hizmetin fiyatını hak ettiği seviyede tutun; asla bedelsiz veya ucuz hizmet vermeyin. Toprak ve güvenli varlıklara yatırım yapın.'
    },
    3: {
      title: 'Yerel Ticaret, Dijital Bilgi, Yazarlık & İletişim Ağı Rızkı',
      blessing: 'Diliniz, kaleminiz, yerel ticaret kabiliyetiniz ve networkünüz sizin en büyük darphanenizdir. Al-sat, komisyon, dijital içerik ve aracılıkla rızık gelir.',
      guidance: 'İletişim ağınızı diri tutun. Sosyal medya bültenleri, e-ticaret, yerel acentecilik veya eğitim içerikleriyle çoklu gelir akışları kurun.'
    },
    4: {
      title: 'Toprak, Gayrimenkul, Aile İşi & Atölye Rızkı',
      blessing: 'Köklerden, topraktan, gayrimenkul alım-satımından, mimariden ve kendi evinizde/atölyenizde kurduğunuz huzurlu üretimden bereket fışkırır.',
      guidance: 'Kira geliri getiren mülkler edinin. Aile mirasını veya geleneksel zanaatları modern dokunuşla ticarileştirin.'
    },
    5: {
      title: 'Yaratıcı Eserler, Sahne, Oyun & Spekülatif Kazanç Rızkı',
      blessing: 'Zevk aldığınız, içinizdeki çocuğu coşturan, sahneye taşıdığınız sanat, eğlence veya lüks tüketim projelerinden zahmetsiz para kazanırsınız.',
      guidance: 'Hobilerinizi asla kenara atmayın; onları premium birer markaya dönüştürün. Sanat, oyun veya yaratıcı tasarım üzerinden gelir yaratın.'
    },
    6: {
      title: 'Zanaat Ustalığı, Sağlık, Evcil Hayvanlar & Günlük Hizmet Rızkı',
      blessing: 'Göz nuru dökülen titiz işçilik, teknik problem çözücülük, sağlık sektörü, diyet/şifa veya evcil hayvan bakımında benzersiz bir müşteri sadakatiyle rızkınız büyür.',
      guidance: 'İşinizi kusursuz bir operasyonel standartla yapın. Müşterilerinizin hayatındaki karmaşayı çözen sistemler kurarak sürekli gelir elde edin.'
    },
    7: {
      title: 'Stratejik İttifaklar, Danışmanlık & Sözleşme Rızkı',
      blessing: 'Yalnızken değil; doğru ortakla birleştiğinizde, evlilik yoluyla veya kurduğunuz yüksek bütçeli ikili danışmanlık kontratlarıyla servetiniz katlanır.',
      guidance: 'Tek başınıza tüm yükü sırtlanmayın; operasyon veya satış tarafını güçlü bir ortağa devredip kâr paylaşımı anlaşmaları yapın.'
    },
    8: {
      title: 'Başkalarının Sermayesi, Fonlar, Yatırım & Kriz Çözme Rızkı',
      blessing: 'Büyük paraları, şirket birleşmelerini, fonları, kredileri ve krizdeki işletmeleri rehabilite etme kabiliyetiniz sayesinde büyük komisyon ve hisseler kazanırsınız.',
      guidance: 'Yatırım fonları, ortak sermaye havuzları ve risk sermayesi yönetimi üzerine uzmanlaşın. Krizleri ucuza kapatıp değere dönüştürün.'
    },
    9: {
      title: 'Uluslararası Ticaret, Dış Pazarlar, Yabancı Para & Akademi Rızkı',
      blessing: 'Doğduğunuz şehirde değil; sınırların ötesinde, yabancı döviz cinsinden, dış ticaret, turizm, yayıncılık veya küresel eğitimle gelen büyük servet kapısıdır.',
      guidance: 'İşinizi mutlaka küresel pazara açın. İhracat yapın, yabancı dilde danışmanlık verin veya yurt dışı bağlantılı projeleri kovalayın.'
    },
    10: {
      title: 'Kamu Otoritesi, Kurumsal İtibar & Sektörel Liderlik Rızkı',
      blessing: 'En yüksek görünürlük derecesi. Devlet ihaleleri, üst düzey kurumsal yöneticilik, tescilli lisanslar ve sektörün en tepesindeki unvanınızla gelen bereket.',
      guidance: 'Sektörünüzde lisanslı, resmi ve en saygın isim olun. Kurumsal ihaleler ve kamu/birlik projelerine teklif vererek en üst segmentle çalışın.'
    },
    11: {
      title: 'Büyük Topluluklar, Platformlar, Dernekler & Gelecek Teknolojisi Rızkı',
      blessing: 'Bireylerden değil; yüzbinlerce kişilik komünitelerden, kooperatiflerden, kitlesel fonlamadan ve SaaS/dijital platform aboneliklerinden gelen pasif servet.',
      guidance: 'Geniş bir kitleyi veya derneği arkanıza alın. Üyelik bazlı platformlar, ekosistemler veya sektörel birlikler kurarak ölçeklenin.'
    },
    12: {
      title: 'Gizli Danışmanlık, Arka Plan Stratejisi, Hastane & Spiritüel Rızık',
      blessing: 'Vitrin önünde değil; kulis arkasında, gizli danışmanlıkta, laboratuvar/hastane veya kapalı fonlarda fısıldayan stratejist olarak kazanılan kadersel rızık.',
      guidance: 'Görünür olmak için debelenmeyin; perde arkasında güçlü aktörlere akıl hocalığı yapın veya kapalı devre VIP hizmetler sunun.'
    }
  };

  const houseInfo = houseThemes[pof.house] || houseThemes[2];

  return {
    sign: pof.sign,
    degreeInSign: pof.degreeInSign,
    house: pof.house,
    wealthPortalTitle: `${pof.sign} Burcunda ${pof.house}. Ev Şans Noktası: ${houseInfo.title}`,
    karmicBlessingArea: houseInfo.blessing,
    practicalMonetizationGuidance: houseInfo.guidance
  };
}

/**
 * 4. ORTAKLIK & ÇALIŞMA DNA'SI
 * 1. Ev (Solo Bağımsızlık) vs 7. Ev (İkili İttifak) vs 11. Ev (Kolektif Ağ) analizi.
 */
function calculatePartnershipDna(
  chart: NatalChartData,
  sun: AstroPoint,
  mars: AstroPoint,
  venus: AstroPoint
): PartnershipDnaData {
  let soloScore = 0;
  let partnershipScore = 0;
  let collectiveScore = 0;

  // Gezegen evleri analizi
  chart.planets.forEach(p => {
    if ([1, 10].includes(p.house)) soloScore += 3;
    if ([7, 8].includes(p.house)) partnershipScore += 3;
    if ([11, 3, 9].includes(p.house)) collectiveScore += 3;
  });

  if (['Koç', 'Aslan', 'Oğlak'].includes(sun.sign)) soloScore += 4;
  if (['Terazi', 'Boğa', 'İkizler'].includes(sun.sign)) partnershipScore += 4;
  if (['Kova', 'Yay', 'Balık'].includes(sun.sign)) collectiveScore += 4;

  if (soloScore >= partnershipScore && soloScore >= collectiveScore) {
    return {
      archetype: 'Yalnız Kurt (Solo Kurucu & Özerk Usta)',
      motto: 'Hızlı karar al, bürokrasiyi sıfırla, mutlak sorumluluk üstlen.',
      synergyCondition: 'Sizin için ortaklık, hızınızı kesen bir onay mekanizmasıdır. Ortak yerine özerk taşeronlar veya doğrudan size bağlı uzmanlarla çalışmalısınız.',
      toxicPartnershipRisk: 'Eşit hisseli (%50-%50) ortaklıklarda yetki çatışması yaşanır; karar veremeyen pasif ortaklar sizin enerjinizi tüketir.',
      idealTeamStructure: 'Tek kurucu (CEO) + dışarıdan hizmet alınan uzman serbest çalışanlar (freelancer ağı).'
    };
  } else if (partnershipScore >= soloScore && partnershipScore >= collectiveScore) {
    return {
      archetype: 'İkili İttifak (Stratejik Ortaklık İnsanı)',
      motto: '1 + 1 = 3 Sinerjisi; Vizyon ve Operasyonun Kusursuz İkiliği.',
      synergyCondition: 'Tek başınıza kaldığınızda vizyonunuz yarım kalır; yanınızda güvenilir, sözleşmeyle bağlanmış ve yetki alanları net ayrılmış bir tamamlayıcı ortak olmalıdır.',
      toxicPartnershipRisk: 'Sınırları net çizilmemiş, yazılı protokolsüz ve duygusal temele dayalı ahbap-çavuş ortaklıkları en büyük iflas riskinizdir.',
      idealTeamStructure: 'İki kurucu ortak (Biri Ürün/Operasyon, Diğeri Satış/Vizyon) + çekirdek sadık operasyon kadrosu.'
    };
  } else {
    return {
      archetype: 'Kolektif Orkestra Şefi (Ağ & Komünite Lideri)',
      motto: 'Birlikten kuvvet doğar; dağıtık güç, kooperatif ruhu ve ekosistem liderliği.',
      synergyCondition: 'Hiyerarşik katı şirketler yerine dernekler, birlikler, kooperatifler veya açık kaynaklı ağlar kurarak kitleleri bir vizyon etrafında kenetlersiniz.',
      toxicPartnershipRisk: 'Aşırı merkeziyetçi ve dikte eden otoriter yapılar sizin vizyonunuzu boğar; çok sesliliği yönetememek kaosa yol açabilir.',
      idealTeamStructure: 'Yatay hiyerarşi, komite bazlı yönetim ve paydaşların söz sahibi olduğu modern kooperatif / platform mimarisi.'
    };
  }
}

/**
 * 5. GÜNÜN EN VERİMLİ BİYORİTM & İMZA SAATLERİ
 * Haritanın gündüz/gece dengesi, Merkür ve Mars saatlerine göre odak, imza ve şarj pencereleri.
 */
function calculatePlanetaryProductivityHours(
  chart: NatalChartData,
  sun: AstroPoint,
  mercury: AstroPoint,
  mars: AstroPoint
): PlanetaryProductivityHoursData {
  const isDayChart = (sun.house >= 7 && sun.house <= 12);
  const rulingPlanet = isDayChart ? 'Güneş & Merkür (Gündüz Zihni)' : 'Ay & Mars (Gece Odaklı Derin Strateji)';

  let mentalWindow = '08:30 - 11:45 (Sabah Zihinsel Berraklık Zirvesi)';
  let negotiationWindow = '13:30 - 15:45 (Merkür & Jüpiter Müzakere ve Sözleşme Penceresi)';
  let rechargeWindow = '18:00 - 20:00 (Venüs & Ay Topraklanma ve Zihinsel Detoks)';

  if (!isDayChart) {
    mentalWindow = '15:30 - 18:30 ve 21:30 - 00:30 (Sessizlikte Gelen Derin Analiz ve Kodlama/Üretim)';
    negotiationWindow = '11:00 - 13:30 (Öğle Güneşi Görünürlük ve Resmi Görüşmeler)';
    rechargeWindow = '18:30 - 20:30 (Fiziksel Spor, Yürüyüş ve Zihni Kapatma)';
  }

  return {
    rulingPlanet,
    peakMentalFocusWindow: mentalWindow,
    goldenNegotiationWindow: negotiationWindow,
    rechargeAndBurnoutPreventionWindow: rechargeWindow,
    dailyRoutineAdvice:
      'Kritik sözleşmeleri ve finansal imzaları asla yorgun olduğunuz akşam saatlerine bırakmayın; altın müzakere pencerenizde tamamlayın.'
  };
}

/**
 * 6. TOPLUMSAL İTİBAR & SEKTÖREL ŞÖHRET İMZASI (VOCATIONAL REPUTATION)
 * Tepe Noktası (MC) burcuna göre iş dünyasında ve kamuoyu nezdinde bırakılan silinmez iz.
 */
function calculateVocationalReputation(
  chart: NatalChartData,
  mcSign: string,
  saturn: AstroPoint,
  sun: AstroPoint
): VocationalReputationData {
  const mcThemes: Record<string, { title: string; archetype: string; memory: string; trigger: string }> = {
    'Koç': {
      title: 'Yolu Açan Öncü & Cesur Reformcu',
      archetype: 'İlk Adımı Atan Korkusuz Savaşçı',
      memory: 'Sektörün tıkandığı kriz anlarında kimsenin cesaret edemediği radikal kararları alıp piyasayı açan öncü olarak hatırlanır.',
      trigger: 'Hızlı inisiyatif alma, rekabetten korkmama ve bürokratik engelleri ezip geçme kudreti.'
    },
    'Boğa': {
      title: 'Yıkılmaz Güven Abidesi & Kalıcı Değer Mimarı',
      archetype: 'Sağlam Temeller Kuran Usta',
      memory: 'Asla batmayan, sözünün eri, piyasa fırtınalarında bile müşterisine ve işine sadık kalan en güvenilir kale olarak anılır.',
      trigger: 'Maddi güvence sağlama, sabırlı büyüme ve ürün/hizmet kalitesinde tavizsiz istikrar.'
    },
    'İkizler': {
      title: 'Piyasanın Bilgi Mimarı & Hızlı Ağ Kurucu',
      archetype: 'Entelektüel Arabulucu & İletişim Dehası',
      memory: 'Hangi kapının nasıl açılacağını bilen, bilgiyi ışık hızında pazarlayan ve sektörü birbirine bağlayan parlak zeka.',
      trigger: 'Hızlı adaptasyon, keskin hitabet ve karmaşık sektör verilerini herkesin anlayacağı dile çevirme ustalığı.'
    },
    'Yengeç': {
      title: 'Sektörün Koruyucu Hamisi & Duygusal Vizyoner',
      archetype: 'Güvenli Liman İnşa Eden Hami Lider',
      memory: 'Çalışanlarını ve müşterilerini bir aile gibi koruyan, insan odaklı ve samimi iş kültürüyle sevgiyle anılan lider.',
      trigger: 'Yüksek empati, kurumsal aidiyet hissi yaratma ve kriz anlarında sığınılan bilge liman olma.'
    },
    'Aslan': {
      title: 'Vitrin Lideri & İlham Veren Karizmatik Marka',
      archetype: 'Işıltılı Hükümdar & Cömert Vizyoner',
      memory: 'İsmi duyulduğunda saygı uyandıran, girdiği her sektöre lüks, vizyon ve yüksek standart getiren efsanevi yüz.',
      trigger: 'Doğal sahne aurası, yüksek özgüven ve personeline cömertçe ilham vererek onları yüceltme.'
    },
    'Başak': {
      title: 'Kusursuz İntizam & Çözüm Mühendisi',
      archetype: 'Metodik Usta & Sistem Denetçisi',
      memory: 'En ince kusuru bile gözden kaçırmayan, saat gibi işleyen mekanizmalar kuran ve israfı sıfırlayan mükemmeliyetçi.',
      trigger: 'Tavizsiz kalite kontrolü, analitik problem çözme ve operasyonel verimliliği zirveye çıkarma.'
    },
    'Terazi': {
      title: 'Müzakere Dehası & Estetik Diplomat',
      archetype: 'Denge Kuran Hakem & Zarafet Temsilcisi',
      memory: 'En zorlu hukuki ve ticari çatışmaları bile uzlaşmayla çözen, piyasaya adalet ve şıklık getiren zarif profesyonel.',
      trigger: 'Kusursuz diplomatik dil, adil paylaşım hissi ve estetik/tasarım kalitesiyle büyüleme.'
    },
    'Akrep': {
      title: 'Gölge Stratejist & Krizlerin Yenilmez Fatihi',
      archetype: 'Küllerinden Doğan Dönüşüm Simyacısı',
      memory: 'Herkesin battığı yerde sıfırdan servet inşa eden, sektörün arka planını en derinlemesine yöneten sarsılmaz güç.',
      trigger: 'Korkusuz kriz yönetimi, perde arkası stratejik zeka ve mutlak ketumluk.'
    },
    'Yay': {
      title: 'Ufukları Aşan Vizyoner & Küresel Kaşif',
      archetype: 'Büyük Resmi Gören Bilge Filozof',
      memory: 'Yerel sınırları kırıp sektörü dünyaya açan, vizyoner fikirleriyle çağının ötesinde işler başaran cesur gezgin.',
      trigger: 'Geniş felsefi vizyon, uluslararası bağlantılar ve cesur büyük hedefler koyma kabiliyeti.'
    },
    'Oğlak': {
      title: 'Kalıcı İmparatorluklar Kuran Otorite',
      archetype: 'Disiplinli Mimar & Zirvenin Hakimi',
      memory: 'Genç yaşta temellerini attığı işi nesiller boyu ayakta kalan kurumsal bir anıta dönüştüren çelik disiplinli lider.',
      trigger: 'Tavizsiz iş ahlakı, uzun vadeli stratejik sabır ve kurumsal hiyerarşiyi yönetme kudreti.'
    },
    'Kova': {
      title: 'Geleceği Bugüne Getiren Radikal İnovatör',
      archetype: 'Ezber Bozan Deha & Toplumcu Reformcu',
      memory: 'Geleneksel köhnemiş sistemleri yıkarak teknoloji ve özgürlük temelli yeni nesil iş modelleri kuran devrimci.',
      trigger: 'Özgün inovasyon, teknolojik vizyon ve kitleleri eşitlikçi bir geleceğe taşıma dehası.'
    },
    'Balık': {
      title: 'Ruh Katan Sanatkar & Şifa Rehberi',
      archetype: 'Sezgisel İlham Kaynağı & Derin Şifacı',
      memory: 'Sadece cüzdana değil insanların ruhuna hitap eden, işine maneviyat ve sanatsal derinlik katan unutulmaz usta.',
      trigger: 'Görünmeyeni sezen kuvvetli altıncı his, sanatsal incelik ve karşılıksız hizmet aşkı.'
    }
  };

  const theme = mcThemes[mcSign] || mcThemes['Oğlak'];

  return {
    reputationTitle: theme.title,
    publicImageArchetype: theme.archetype,
    howIndustryRemembersYou: theme.memory,
    authorityTrigger: theme.trigger
  };
}

