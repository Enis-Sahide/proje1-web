import { 
  NatalChartData, 
  AstroPoint, 
  ZodiacSign, 
  ZODIAC_SIGNS 
} from './AstrologyConstants';
import { getSignAndDegree, calculateDraconicChart, calculateHarmonicChart } from './AstrologyEngine';
import {
  generateChart,
  HumanDesignChart,
  getGateAndLine,
  CenterCode
} from '@/utils/HumanDesignEngine';
import {
  GAD_SIGN_INTERPRETATIONS,
  GAD_HOUSE_INTERPRETATIONS,
  TWELFTH_HOUSE_SIGN_INTERPRETATIONS,
  RETRO_KARMIC_DEBTS,
  RETRO_KARMIC_DEBTS_DATA,
  RetroPolarity,
  CHIRON_SIGN_WOUNDS,
  KAD_NEXT_LIFE_SEEDS,
  IncarnationPastLifeInfo,
  IncarnationHouseInfo,
  RetroKarmicDebt,
  ChironWound,
  NextLifeSeed,
  getDraconicPointInterpretation,
  GADHDGateSynthesis,
  getGADHDGateSynthesis,
  TwelfthHouseHDFearSynthesis,
  getTwelfthHouseHDFearSynthesis,
  ChironHDGateSynthesis,
  getChironHDGateSynthesis,
  KADHDGateSynthesis,
  getKADHDGateSynthesis,
  IncarnationCrossDetails,
  getIncarnationCrossDetails,
  INTERCEPTED_SIGN_KARMIC_DATA,
  InterceptedSignKarmicInfo,
  getAnareticDegreeInfo,
  AnareticDegreeInfo
} from './IncarnationInterpretations';
import { GATE_TO_CENTER } from './AstroHumanDesignSynthesis';
import {
  HistoricalEraResult,
  CosmicOriginResult,
  calculateHistoricalEra,
  calculateCosmicOrigin
} from './IncarnationHistoricalCosmic';

export type { HistoricalEraResult, CosmicOriginResult };

export interface InterceptedSignItem {
  sign: ZodiacSign;
  oppositeSign: ZodiacSign;
  house: number;
  archetype: string;
  ruler: string;
  polarity: 'active' | 'passive';
  polarityLabel: string;
  hdDiagnosis: string;
  karmicRootCause: string;
  lockedPsychology: string;
  unlockKey: string;
  shadowTrap: string;
  planetsInside: string[];
}

export interface ProgressedEvolution {
  hasSpecialLocks: boolean;
  isCriticalDegree: boolean;
  degreeType: '29° Anaretik Derece' | '28° Kritik Eşik' | '0°-1° Taze Tohum' | 'Dengeli Seyir';
  badgeTitle: string;
  badgeColor: string;
  karmicStage: string;
  natalSunSign: ZodiacSign;
  natalSunDegree: number;
  natalSunMinutes: number;
  progressedSunSign: ZodiacSign;
  progressedAge: number;
  currentAge: number | null;
  hasShifted: boolean;
  evolutionSummary: string;
  interceptedSigns: InterceptedSignItem[];
  hasInterceptedSigns: boolean;
}

export interface GADAspect {
  planet: string;
  type: string;
  orb: number;
  interpretation: string;
}

export interface TropicalVsDraconicComparison {
  pointName: string;
  tropicalSign: ZodiacSign;
  tropicalDegree: number;
  draconicSign: ZodiacSign;
  draconicDegree: number;
  spiritualMeaning: string;
  tropicalMeaning: string;
  draconicMeaning: string;
  synthesis: string;
}

export interface IncarnationAnalysisResult {
  // GAD & Geçmiş Yaşam
  gad: {
    longitude: number;
    sign: ZodiacSign;
    degreeInSign: number;
    minutes: number;
    house: number;
    info: IncarnationPastLifeInfo;
    houseInfo: IncarnationHouseInfo;
    karmicRuler: {
      name: string;
      sign: ZodiacSign;
      house: number;
      isRetrograde: boolean;
      summary: string;
    };
    aspects: GADAspect[];
    hdGate?: GADHDGateSynthesis;
  };

  // 12. Ev Hafızası & Son Nefes
  twelfthHouse: {
    sign: ZodiacSign;
    ruler: string;
    lastBreathAtmosphere: string;
    subconsciousGift: string;
    hiddenFear: string;
    planetsIn12th: {
      name: string;
      sign: ZodiacSign;
      meaning: string;
    }[];
    hdFearSynthesis?: TwelfthHouseHDFearSynthesis;
  };

  // Karmik Borçlar (Retrolar)
  retroDebts: RetroKarmicDebt[];

  // Kiron Ruh Yarası
  chiron: {
    sign: ZodiacSign;
    house: number;
    wound: ChironWound;
    hdGate?: ChironHDGateSynthesis;
  } | null;

  // Drakonik Karşılaştırma
  draconicComparison: TropicalVsDraconicComparison[];

  // Gelecek Yaşam Tohumu (KAD & 8./9. Ev)
  kad: {
    sign: ZodiacSign;
    degreeInSign: number;
    house: number;
    seed: NextLifeSeed;
    hdGate?: KADHDGateSynthesis;
  };
  eighthHouse: {
    sign: ZodiacSign;
    ruler: string;
    transformationGateway: string;
  };

  // Human Design Enkarnasyon Çaprazı (Kozmik Yaşam Misyonu)
  incarnationCross?: IncarnationCrossDetails;

  // İkincil İlerletilmiş Harita & Karmik Kilitler (Sıkıştırılmış Burçlar & Anaretik Eşikler)
  progressedEvolution?: ProgressedEvolution;

  // Tarihsel Zaman Tüneli & Galaktik Ruh Kökeni (Aşama 1)
  historicalEra?: HistoricalEraResult;
  cosmicOrigin?: CosmicOriginResult;

  // Ruhsal Olgunluk Skoru & Seviye
  soulMaturity: {
    score: number;
    tier: 'Arayıcı Ruh' | 'Olgun Ruh' | 'Kadim Ruh' | 'Usta Ruh';
    description: string;
    dominantElement: string;
  };
}

const SIGN_RULERS: Record<ZodiacSign, { traditional: string; modern: string }> = {
  'Koç': { traditional: 'Mars', modern: 'Mars' },
  'Boğa': { traditional: 'Venüs', modern: 'Venüs' },
  'İkizler': { traditional: 'Merkür', modern: 'Merkür' },
  'Yengeç': { traditional: 'Ay', modern: 'Ay' },
  'Aslan': { traditional: 'Güneş', modern: 'Güneş' },
  'Başak': { traditional: 'Merkür', modern: 'Merkür' },
  'Terazi': { traditional: 'Venüs', modern: 'Venüs' },
  'Akrep': { traditional: 'Mars', modern: 'Plüton' },
  'Yay': { traditional: 'Jüpiter', modern: 'Jüpiter' },
  'Oğlak': { traditional: 'Satürn', modern: 'Satürn' },
  'Kova': { traditional: 'Satürn', modern: 'Uranüs' },
  'Balık': { traditional: 'Jüpiter', modern: 'Neptün' },
};

const ELEMENT_OF_SIGN: Record<ZodiacSign, string> = {
  'Koç': 'Ateş', 'Aslan': 'Ateş', 'Yay': 'Ateş',
  'Boğa': 'Toprak', 'Başak': 'Toprak', 'Oğlak': 'Toprak',
  'İkizler': 'Hava', 'Terazi': 'Hava', 'Kova': 'Hava',
  'Yengeç': 'Su', 'Akrep': 'Su', 'Balık': 'Su',
};

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

function findHouseForLongitude(lon: number, houses: AstroPoint[]): number {
  if (!houses || houses.length < 12) return 1;
  const cusps = houses.map(h => h.longitude);
  for (let i = 0; i < 12; i++) {
    const cusp = cusps[i];
    const nextCusp = i === 11 ? cusps[0] : cusps[i + 1];
    const dist = mod360(nextCusp - cusp);
    const pos = mod360(lon - cusp);
    if (pos < dist) {
      return i + 1;
    }
  }
  return 1;
}

interface KarmicPolarityResult {
  polarity: RetroPolarity;
  polarityLabel: string;
  hdDiagnosis: string;
}

export function determineKarmicPolarity(
  planetName: string,
  natalPoint: AstroPoint,
  hdChart: HumanDesignChart | null,
  natalChart: NatalChartData
): KarmicPolarityResult {
  const debtData = RETRO_KARMIC_DEBTS_DATA[planetName];
  if (!debtData) {
    return {
      polarity: 'active',
      polarityLabel: 'Genel Karmik Rezonans',
      hdDiagnosis: 'Standart Astrolojik Gösterge'
    };
  }

  // Human Design Kapı ve Çizgisi
  const { gate, line } = getGateAndLine(natalPoint.longitude);
  const gateDiagnosis = `Kapı ${gate}.${line}`;

  let activeScore = 0;
  let passiveScore = 0;
  const diagnosisPoints: string[] = [];

  // 1. Human Design Merkezleri
  if (hdChart) {
    const isDefined = (center: CenterCode) => hdChart.definedCenters.includes(center);

    // Kalp / Ego (İrade & Güç Dayatma)
    if (isDefined('Heart')) {
      activeScore += 3;
      if (['Mars', 'Satürn', 'Plüton'].includes(planetName)) {
        diagnosisPoints.push('Tanımlı Kalp/Ego (İrade Gücü & Baskı)');
      }
    } else {
      passiveScore += 3;
      if (['Mars', 'Venüs', 'Satürn'].includes(planetName)) {
        diagnosisPoints.push('Açık Kalp Merkezi (İrade Yetersizliği & Ezilme)');
      }
    }

    // Solar Pleksus (Duygusal Fırtına vs Çatışmadan Kaçınma / Felç)
    if (isDefined('SolarPlexus')) {
      activeScore += 2;
      if (['Mars', 'Venüs', 'Neptün'].includes(planetName)) {
        diagnosisPoints.push('Tanımlı Solar Pleksus (Duygusal Patlama Dalgası)');
      }
    } else {
      // Açık Solar Pleksus en belirgin 'öfkeyi bastırıp felç olma' sebebidir!
      passiveScore += 4;
      if (['Mars', 'Merkür', 'Neptün'].includes(planetName)) {
        diagnosisPoints.push('Açık Solar Pleksus (Çatışmadan Kaçınma & Felç)');
      }
    }

    // Kök Merkezi (Stres / Baskıyı Dışa Vurma vs Donup Kalma)
    if (isDefined('Root')) {
      activeScore += 2;
    } else {
      passiveScore += 2;
    }

    // 2. Human Design Tipi
    if (hdChart.type === 'Manifestor') {
      activeScore += 4;
      diagnosisPoints.push('Manifestor Tipi (Doğrudan Başlatıcı Güç)');
    } else if (hdChart.type === 'Projector' || hdChart.type === 'Reflector') {
      passiveScore += 3;
      diagnosisPoints.push(`${hdChart.type} Tipi (Dış Baskıya Boyun Eğme)`);
    } else if (hdChart.type === 'Manifesting Generator') {
      activeScore += 1;
    }
  }

  // 3. Çizgi Arketipi (Line 1-6)
  if (line === 1 || line === 2) {
    passiveScore += 2;
    diagnosisPoints.push(`${line}. Çizgi (İçe Çekilme & Bastırma)`);
  } else if (line === 4 || line === 5) {
    activeScore += 2;
    diagnosisPoints.push(`${line}. Çizgi (Dışa Vuran Liderlik & Otorite)`);
  } else if (line === 3) {
    if (planetName === 'Mars' || planetName === 'Uranüs') activeScore += 1;
  } else if (line === 6) {
    if (planetName === 'Jüpiter' || planetName === 'Satürn') activeScore += 1;
  }

  // 4. Astroloji Haritası (Burç, Ev & Sert Açılar)
  const sign = natalPoint.sign;
  const house = natalPoint.house;

  if (['Koç', 'Akrep', 'Aslan', 'Oğlak'].includes(sign)) {
    activeScore += 2;
  } else if (['Balık', 'Yengeç', 'Boğa', 'Başak'].includes(sign)) {
    passiveScore += 2;
  }

  if ([1, 8, 10].includes(house)) {
    activeScore += 2;
  } else if ([4, 6, 12].includes(house)) {
    passiveScore += 3;
    diagnosisPoints.push(`${house}. Ev (İnziva & Bilinçaltına İtme)`);
  }

  const challengingAspects = natalChart.aspects.filter(
    a => (a.planet1 === planetName || a.planet2 === planetName) && (a.type === 'Kare' || a.type === 'Karşıt')
  );
  challengingAspects.forEach(a => {
    const otherPlanet = a.planet1 === planetName ? a.planet2 : a.planet1;
    if (otherPlanet === 'Satürn' || otherPlanet === 'Kiron') {
      passiveScore += 2;
    } else if (otherPlanet === 'Plüton' || otherPlanet === 'Mars' || otherPlanet === 'Uranüs') {
      activeScore += 2;
    }
  });

  const polarity: RetroPolarity = activeScore > passiveScore ? 'active' : 'passive';
  const option = debtData[polarity];

  const topDiagnosis = diagnosisPoints.slice(0, 2).join(' & ');
  const hdDiagnosis = topDiagnosis ? `${topDiagnosis} (${gateDiagnosis})` : gateDiagnosis;

  return {
    polarity,
    polarityLabel: option.polarityLabel,
    hdDiagnosis
  };
}

export function determineInterceptedSignPolarity(
  sign: ZodiacSign,
  hdChart: HumanDesignChart | null,
  natalChart: NatalChartData,
  planetsInside: string[]
): {
  polarity: 'active' | 'passive';
  polarityLabel: string;
  hdDiagnosis: string;
  karmicRootCause: string;
  lockedPsychology: string;
  unlockKey: string;
  shadowTrap: string;
} {
  const data = INTERCEPTED_SIGN_KARMIC_DATA[sign];
  if (!data) {
    return {
      polarity: 'active',
      polarityLabel: 'Genel Karmik Kilit',
      hdDiagnosis: 'Standart Astrolojik Boyut',
      karmicRootCause: '',
      lockedPsychology: '',
      unlockKey: '',
      shadowTrap: ''
    };
  }

  let activeScore = 0;
  let passiveScore = 0;
  const diagnosisPoints: string[] = [];

  if (hdChart) {
    const isDefined = (center: CenterCode) => hdChart.definedCenters.includes(center);

    // 1. Burcun Yönetici Merkez Analizleri
    if (['Koç', 'Aslan', 'Oğlak'].includes(sign)) {
      if (isDefined('Heart')) {
        activeScore += 3;
        diagnosisPoints.push('Tanımlı Kalp/Ego (Güç & İrade Otoritesi)');
      } else {
        passiveScore += 3;
        diagnosisPoints.push('Açık Kalp Merkezi (Özdeğer & İrade Kırılması)');
      }
    }

    if (['Aslan', 'Terazi', 'Yay'].includes(sign)) {
      if (isDefined('G')) {
        activeScore += 2;
        diagnosisPoints.push('Tanımlı G-Merkezi (Baskın Kimlik & Yön)');
      } else {
        passiveScore += 2;
        diagnosisPoints.push('Açık G-Merkezi (Görünmezlik & Kimlik Arayışı)');
      }
    }

    if (['Yengeç', 'Akrep', 'Balık'].includes(sign)) {
      if (isDefined('SolarPlexus')) {
        activeScore += 3;
        diagnosisPoints.push('Tanımlı Solar Pleksus (Duygusal Tahakküm Dalgası)');
      } else {
        passiveScore += 4;
        diagnosisPoints.push('Açık Solar Pleksus (Duygusal Çatışmadan Kaçınma & Kurban)');
      }
    }

    if (['İkizler', 'Kova', 'Başak'].includes(sign)) {
      if (isDefined('Throat')) {
        activeScore += 2;
        diagnosisPoints.push('Tanımlı Boğaz (Sözsel Baskı & İfade Üstünlüğü)');
      } else {
        passiveScore += 3;
        diagnosisPoints.push('Açık Boğaz (Susturulmuş Ses & İfade Çekingenliği)');
      }
    }

    // 2. Human Design Tipi
    if (hdChart.type === 'Manifestor') {
      activeScore += 3;
      diagnosisPoints.push('Manifestor Tipi (Başlatıcı Güç)');
    } else if (hdChart.type === 'Projector' || hdChart.type === 'Reflector') {
      passiveScore += 3;
      diagnosisPoints.push(`${hdChart.type} Tipi (Dış Baskıya Maruz Kalma)`);
    } else if (hdChart.type === 'Manifesting Generator') {
      activeScore += 1;
    }
  }

  // 3. Kilitli Gezegenler varsa onların kapı ve çizgisine bak
  if (planetsInside.length > 0) {
    const mainPlanet = natalChart.planets.find(p => planetsInside.includes(p.name));
    if (mainPlanet) {
      const { gate, line } = getGateAndLine(mainPlanet.longitude);
      diagnosisPoints.push(`${mainPlanet.name} Kapı ${gate}.${line}`);
      if (line === 1 || line === 2) {
        passiveScore += 2;
      } else if (line === 3 || line === 5) {
        activeScore += 2;
      }
    }
  }

  const polarity: 'active' | 'passive' = activeScore >= passiveScore ? 'active' : 'passive';
  const selected = data[polarity];
  const hdDiagnosis = diagnosisPoints.length > 0 ? diagnosisPoints.slice(0, 2).join(' & ') : 'Human Design Rezonansı';

  return {
    polarity,
    polarityLabel: selected.polarityLabel,
    hdDiagnosis,
    karmicRootCause: selected.karmicRootCause,
    lockedPsychology: selected.lockedPsychology,
    unlockKey: selected.unlockKey,
    shadowTrap: selected.shadowTrap
  };
}

export function calculateIncarnationAnalysis(
  natalChart: NatalChartData,
  birthDate?: Date | null
): IncarnationAnalysisResult {
  // Eğer birthDate verilmişse Human Design haritasını hesapla
  let hdChart: HumanDesignChart | null = null;
  if (birthDate && !isNaN(birthDate.getTime())) {
    try {
      hdChart = generateChart(birthDate);
    } catch (e) {
      console.warn('Human Design chart could not be generated for incarnation analysis:', e);
    }
  }

  // 1. KAD ve GAD Hesabı
  const kadPoint = natalChart.planets.find(p => p.name === 'Kuzey Ay Düğümü') || {
    name: 'Kuzey Ay Düğümü',
    longitude: 0,
    sign: 'Koç' as ZodiacSign,
    degreeInSign: 0,
    minutes: 0,
    house: 1
  };

  const gadLon = mod360(kadPoint.longitude + 180);
  const gadData = getSignAndDegree(gadLon);
  const gadHouse = findHouseForLongitude(gadLon, natalChart.houses);

  const gadSignInfo = GAD_SIGN_INTERPRETATIONS[gadData.sign] || GAD_SIGN_INTERPRETATIONS['Koç'];
  const gadHouseInfo = GAD_HOUSE_INTERPRETATIONS[gadHouse] || GAD_HOUSE_INTERPRETATIONS[1];

  // Human Design Güney Ay Düğümü (GAD) Kapı & Çizgi Sentezi
  const gadHD = getGateAndLine(gadLon);
  const gadHDSynthesis = getGADHDGateSynthesis(gadHD.gate, gadHD.line);

  // GAD Yöneticisi (Karmik Cetvel)
  const rulerPair = SIGN_RULERS[gadData.sign] || { traditional: 'Mars', modern: 'Mars' };
  const rulerPlanet = natalChart.planets.find(p => p.name === rulerPair.modern) || 
                      natalChart.planets.find(p => p.name === rulerPair.traditional) ||
                      natalChart.planets[0];

  const karmicRulerSummary = `Geçmiş yaşamınızdaki ruhsal irade ve eylemleriniz ${rulerPlanet.name} arketipiyle şekillendi. Bu gezegenin haritanızda ${rulerPlanet.house}. evde ve ${rulerPlanet.sign} burcunda olması; önceki hayatınızda özellikle bu yaşam alanında yoğunlaşan önemli bir kimlik, meslek ve kadersel döngü yaşadığınızı gösterir.`;

  // GAD Açıları
  const gadAspects: GADAspect[] = [];
  natalChart.planets.forEach(p => {
    if (p.name === 'Kuzey Ay Düğümü') return;
    let diff = Math.abs(p.longitude - gadLon);
    if (diff > 180) diff = 360 - diff;

    if (diff <= 8) {
      gadAspects.push({
        planet: p.name,
        type: 'Kavuşum',
        orb: Number(diff.toFixed(1)),
        interpretation: `${p.name} geçmiş yaşamlardan doğrudan bu hayata taşınan bir ruh parçasıdır. Bu yetenek veya yük, doğuştan gelen refleksif bir gücünüzdür.`
      });
    } else if (Math.abs(diff - 90) <= 6) {
      gadAspects.push({
        planet: p.name,
        type: 'Kare (Karmik Düğüm)',
        orb: Number(Math.abs(diff - 90).toFixed(1)),
        interpretation: `${p.name} geçmiş yaşam ile şimdiki evrimsel hedefiniz arasında bir gerilim kapısıdır. Bu gezegenin temalarını bilinçli çözmek karmik sıçrama yaratır.`
      });
    } else if (Math.abs(diff - 120) <= 6) {
      gadAspects.push({
        planet: p.name,
        type: 'Üçgen (Karmik Lütuf)',
        orb: Number(Math.abs(diff - 120).toFixed(1)),
        interpretation: `Geçmiş yaşamlarda ${p.name} konusunda biriktirdiğiniz erdemler ve ustalıklar bu hayatta size doğal bir ilahi akış ve destek olarak geri döner.`
      });
    }
  });

  // 2. 12. Ev Karmik Hafıza & Son Nefes
  const h12 = natalChart.houses && natalChart.houses.length >= 12 ? natalChart.houses[11] : {
    name: '12. Ev',
    longitude: 330,
    sign: 'Balık' as ZodiacSign,
    degreeInSign: 0,
    minutes: 0,
    house: 12
  };
  const h12Info = TWELFTH_HOUSE_SIGN_INTERPRETATIONS[h12.sign] || TWELFTH_HOUSE_SIGN_INTERPRETATIONS['Balık'];
  const h12Ruler = SIGN_RULERS[h12.sign]?.modern || 'Neptün';

  const planetsIn12th = natalChart.planets
    .filter(p => p.house === 12 && p.name !== 'Kuzey Ay Düğümü')
    .map(p => {
      let meaning = `${p.name} 12. evde: Geçmiş yaşamda bu enerji bilinçaltına itilmiş veya gizlenmiş. Bu hayatta yalnızlık, rüyalar veya derin tefekkür anlarında uyanan mistik bir güçtür.`;
      if (p.name === 'Satürn') meaning = 'Satürn 12. evde: Geçmiş yaşamda ağır bir izolasyon, sürgün veya manastır disiplini yaşanmış. Bu yaşamda derin ruhsal dayanıklılık ve yalnızlıkta huzur bulma kabiliyeti verir.';
      if (p.name === 'Güneş') meaning = 'Güneş 12. evde: Geçmişte kimliği gölgelenmiş veya gizli hizmette bulunmuş bir ruh. Bu yaşamda egosuz ilahi ışığı yansıtma görevi vardır.';
      if (p.name === 'Ay') meaning = 'Ay 12. evde: Geçmiş yaşamlardan taşınan derin psişik sünger algı. Başkalarının acılarını hissetme ve sezgisel şifa gücü.';
      if (p.name === 'Lilith') meaning = 'Lilith 12. evde: Geçmiş yaşamlarda tabuları yıktığı veya otoriteye boyun eğmediği için dışlanmış bir ruh hafızası. Bu yaşamda derin okült bilgelik ve gölgeyle korkusuzca yüzleşme potansiyeli taşır.';
      return {
        name: p.name,
        sign: p.sign,
        meaning
      };
    });

  // 12. evdeki gezegenlerin ve yöneticinin bağlandığı Human Design merkezini tespit et
  let dominant12thCenter = 'Dalak';
  const h12RulerPlanet = natalChart.planets.find(p => p.name === h12Ruler);
  if (h12RulerPlanet) {
    const rulerGate = getGateAndLine(h12RulerPlanet.longitude).gate;
    const c = GATE_TO_CENTER[rulerGate];
    if (c) dominant12thCenter = c;
  } else if (planetsIn12th.length > 0) {
    const p1 = natalChart.planets.find(p => p.name === planetsIn12th[0].name);
    if (p1) {
      const pGate = getGateAndLine(p1.longitude).gate;
      const c = GATE_TO_CENTER[pGate];
      if (c) dominant12thCenter = c;
    }
  } else {
    if (['Balık', 'Yengeç', 'Akrep'].includes(h12.sign)) dominant12thCenter = 'Solar Pleksus';
    else if (['İkizler', 'Kova', 'Terazi'].includes(h12.sign)) dominant12thCenter = 'Ajna (Zihin)';
    else if (['Koç', 'Aslan', 'Yay'].includes(h12.sign)) dominant12thCenter = 'Kalp (Ego)';
    else dominant12thCenter = 'Dalak';
  }
  const hdFearSynthesis = getTwelfthHouseHDFearSynthesis(dominant12thCenter);

  // 3. Karmik Borçlar (Retrolar - Human Design Sentezi ile Nokta Atışı Kutuplanma)
  const retroDebts: RetroKarmicDebt[] = [];
  natalChart.planets.forEach(p => {
    if (p.isRetrograde && RETRO_KARMIC_DEBTS_DATA[p.name]) {
      const data = RETRO_KARMIC_DEBTS_DATA[p.name];
      const { polarity, polarityLabel, hdDiagnosis } = determineKarmicPolarity(p.name, p, hdChart, natalChart);
      const chosenOption = data[polarity];
      retroDebts.push({
        planet: data.planet,
        title: data.title,
        polarity,
        polarityLabel,
        hdDiagnosis,
        pastLifeCause: chosenOption.pastLifeCause,
        currentLifeKarma: chosenOption.currentLifeKarma,
        dharmaRemedy: chosenOption.dharmaRemedy
      });
    }
  });

  // 4. Kiron Ruh Yarası (Human Design Kapı & Çizgi Sentezi)
  const chironPoint = natalChart.planets.find(p => p.name === 'Kiron');
  let chironResult = null;
  if (chironPoint) {
    const wound = CHIRON_SIGN_WOUNDS[chironPoint.sign] || CHIRON_SIGN_WOUNDS['Koç'];
    const chironHD = getGateAndLine(chironPoint.longitude);
    const chironHDSynthesis = getChironHDGateSynthesis(chironHD.gate, chironHD.line);
    chironResult = {
      sign: chironPoint.sign,
      house: chironPoint.house,
      wound,
      hdGate: chironHDSynthesis
    };
  }

  // 5. Drakonik Harita ve Karşılaştırma
  const draconicChart = calculateDraconicChart(natalChart);
  const draconicComparison: TropicalVsDraconicComparison[] = [];

  const pointsToCompare = [
    { name: 'Güneş', label: 'Güneş (Ruhun Asıl Amacı)' },
    { name: 'Ay', label: 'Ay (Bilinçaltı & Duygusal Öz)' },
    { name: 'Lilith', label: 'Lilith (Ruhun Gölge Gücü & İlksel Özgürlüğü)' },
    { name: 'Yükselen (ASC)', label: 'Yükselen (Ruhun Evrensel Kimliği)' },
    { name: 'Tepe Noktası (MC)', label: 'Tepe Noktası (Ruhun Kozmik Misyonu)' }
  ];

  pointsToCompare.forEach(pt => {
    let tropPoint: AstroPoint | undefined;
    let dracPoint: AstroPoint | undefined;

    if (pt.name === 'Yükselen (ASC)') {
      tropPoint = natalChart.ascendant;
      dracPoint = draconicChart.ascendant;
    } else if (pt.name === 'Tepe Noktası (MC)') {
      tropPoint = natalChart.midheaven;
      dracPoint = draconicChart.midheaven;
    } else {
      tropPoint = natalChart.planets.find(p => p.name === pt.name);
      dracPoint = draconicChart.planets.find(p => p.name === pt.name);
    }

    if (tropPoint && dracPoint) {
      const interp = getDraconicPointInterpretation(pt.name, tropPoint.sign, dracPoint.sign);
      draconicComparison.push({
        pointName: pt.label,
        tropicalSign: tropPoint.sign,
        tropicalDegree: tropPoint.degreeInSign,
        draconicSign: dracPoint.sign,
        draconicDegree: dracPoint.degreeInSign,
        spiritualMeaning: interp.spiritualMeaning,
        tropicalMeaning: interp.tropicalMeaning,
        draconicMeaning: interp.draconicMeaning,
        synthesis: interp.synthesis
      });
    }
  });

  // 6. Gelecek Yaşam Tohumu (KAD & 8./9. Ev & HD Kuzey Düğümü Kapısı)
  const kadSeed = KAD_NEXT_LIFE_SEEDS[kadPoint.sign] || KAD_NEXT_LIFE_SEEDS['Koç'];
  const kadHD = getGateAndLine(kadPoint.longitude);
  const kadHDSynthesis = getKADHDGateSynthesis(kadHD.gate, kadHD.line);

  const h8 = natalChart.houses && natalChart.houses.length >= 8 ? natalChart.houses[7] : {
    name: '8. Ev',
    longitude: 210,
    sign: 'Akrep' as ZodiacSign,
    degreeInSign: 0,
    minutes: 0,
    house: 8
  };
  const h8Ruler = SIGN_RULERS[h8.sign]?.modern || 'Plüton';
  const transformationGateway = `8. Eviniz ${h8.sign} burcunda ve yöneticisi ${h8Ruler}. Ruhunuzun bu bedenden ayrılışındaki ve boyut geçişlerindeki ana kapısı ${h8.sign} enerjisidir. Bu kapıdan geçerken bırakmanız gereken en büyük ağırlık; ${h8.sign} burcunun negatif gölgeleri (bağımlılıklar, korkular veya kontrol takıntısı) olacaktır.`;

  // 7. Human Design Enkarnasyon Çaprazı (Kozmik Yaşam Misyonu)
  let incarnationCrossResult: IncarnationCrossDetails | undefined = undefined;
  if (hdChart && hdChart.conscious && hdChart.unconscious) {
    const cSun = hdChart.conscious.find(p => p.planet === 'Sun');
    const cEarth = hdChart.conscious.find(p => p.planet === 'Earth');
    const uSun = hdChart.unconscious.find(p => p.planet === 'Sun');
    const uEarth = hdChart.unconscious.find(p => p.planet === 'Earth');

    if (cSun && cEarth && uSun && uEarth) {
      incarnationCrossResult = getIncarnationCrossDetails(
        cSun.gate,
        cEarth.gate,
        uSun.gate,
        uEarth.gate,
        hdChart.profile || '1/3'
      );
    }
  }

  // 8. Ruhsal Olgunluk Skoru (Soul Maturity Score)
  let score = 55; // Baz puan

  // Retro gezegenler derin karmik geçmişi gösterir
  score += retroDebts.length * 6;

  // 12. evdeki gezegenler
  score += planetsIn12th.length * 5;

  // GAD açıları
  score += gadAspects.length * 3;

  // Kiron retrosu veya açıları
  if (chironPoint?.isRetrograde) score += 5;

  // Element dağılımı
  const elementCounts: Record<string, number> = { 'Ateş': 0, 'Toprak': 0, 'Hava': 0, 'Su': 0 };
  natalChart.planets.forEach(p => {
    const el = ELEMENT_OF_SIGN[p.sign];
    if (el) elementCounts[el] = (elementCounts[el] || 0) + 1;
  });

  let dominantElement = 'Su';
  let maxCount = 0;
  Object.entries(elementCounts).forEach(([el, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantElement = el;
    }
  });

  if (dominantElement === 'Su') score += 4; // Su elementi yüksek sezgisel ve karmik hafızadır

  score = Math.min(99, Math.max(42, score));

  let tier: 'Arayıcı Ruh' | 'Olgun Ruh' | 'Kadim Ruh' | 'Usta Ruh' = 'Olgun Ruh';
  let tierDesc = '';

  if (score >= 88) {
    tier = 'Usta Ruh';
    tierDesc = 'Ruhunuz sayısız medeniyet ve boyut döngüsünü tamamlamış, dünyevi illüzyonların ötesine geçmiş usta bir bilgelik taşımaktadır. Bu yaşamınız kazaen değil, bir rehberlik ve son eksikleri mühürleme görevidir.';
  } else if (score >= 74) {
    tier = 'Kadim Ruh';
    tierDesc = 'Ruhunuz derin bir tarihsel ve kozmik hafızaya sahiptir. Yaşınızdan bağımsız olarak çocukluğunuzdan beri içinizde taşıdığınız o "eski insan" hissiyatı, geçmiş enkarnasyonların zengin tortusudur.';
  } else if (score >= 58) {
    tier = 'Olgun Ruh';
    tierDesc = 'Bireysel deneyimlerden ilişkisel ve toplumsal derslere evrilen, karmik borçlarını bilinçle ödeyip dharma yolunda kararlılıkla ilerleyen güçlü bir tekâmül aşamasındasınız.';
  } else {
    tier = 'Arayıcı Ruh';
    tierDesc = 'Dünyevi deneyimlerin tazeliği ve dinamizmi içindesiniz. Karmik yükleriniz nispeten hafiftir; bu enkarnasyondaki ana amacınız yeni ruhsal tohumlar ekmek ve özgür iradeyle yolu açmaktır.';
  }

  // 9. İkincil İlerletilmiş Harita & Karmik Kilitler (Sıkıştırılmış Burçlar & Anaretik Eşikler)
  const sun = natalChart.planets.find(p => p.name === 'Güneş') || {
    name: 'Güneş',
    longitude: 0,
    sign: 'Koç' as ZodiacSign,
    degreeInSign: 0,
    minutes: 0,
    house: 1
  };

  const sunData = getSignAndDegree(sun.longitude);
  const remainingDegrees = 30 - sunData.degreeInSign - (sunData.minutes / 60);
  const progressedAge = Math.round((remainingDegrees / 0.9856) * 10) / 10;

  // Sıradaki İlerletilmiş Güneş Burcu
  const currentSunIndex = ZODIAC_SIGNS.indexOf(sunData.sign);
  const nextSunIndex = (currentSunIndex + 1) % 12;
  const directNextSign = ZODIAC_SIGNS[nextSunIndex];

  // Yaş hesabı
  let currentAge: number | null = null;
  let currentProgressedSign: ZodiacSign = directNextSign;
  let hasShifted = false;

  if (birthDate && !isNaN(birthDate.getTime())) {
    currentAge = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000));
    hasShifted = currentAge >= progressedAge;
    // Toplam ilerletilmiş boylam
    const totalProgLon = mod360(sun.longitude + (currentAge * 0.9856));
    const progData = getSignAndDegree(totalProgLon);
    currentProgressedSign = progData.sign;
  }

  // Anaretik ve kritik derece bilgisi
  const anareticInfo = getAnareticDegreeInfo(
    sunData.degreeInSign,
    sunData.minutes,
    sunData.sign,
    directNextSign,
    progressedAge,
    currentAge
  );

  // Sıkıştırılmış Burçlar (Intercepted Signs)
  const cuspSigns = new Set<ZodiacSign>();
  if (natalChart.houses && natalChart.houses.length >= 12) {
    natalChart.houses.forEach(h => cuspSigns.add(h.sign));
  }

  const interceptedSigns: InterceptedSignItem[] = [];
  ZODIAC_SIGNS.forEach((sign, sIdx) => {
    if (!cuspSigns.has(sign)) {
      // Bu burç hiçbir evin başlangıç çizgisinde değil -> SIKIŞTIRILMIŞ!
      const midLon = sIdx * 30 + 15;
      const containingHouse = findHouseForLongitude(midLon, natalChart.houses);
      const karmicData = INTERCEPTED_SIGN_KARMIC_DATA[sign];
      const ruler = SIGN_RULERS[sign]?.modern || SIGN_RULERS[sign]?.traditional || 'Bilinmiyor';

      // Bu kilitli burcun içinde bulunan gezegenler
      const planetsInside = natalChart.planets
        .filter(p => p.sign === sign && p.name !== 'Kuzey Ay Düğümü')
        .map(p => p.name);

      if (karmicData) {
        const polarityResult = determineInterceptedSignPolarity(
          sign,
          hdChart,
          natalChart,
          planetsInside
        );

        interceptedSigns.push({
          sign,
          oppositeSign: karmicData.oppositeSign,
          house: containingHouse,
          archetype: karmicData.archetype,
          ruler,
          polarity: polarityResult.polarity,
          polarityLabel: polarityResult.polarityLabel,
          hdDiagnosis: polarityResult.hdDiagnosis,
          karmicRootCause: polarityResult.karmicRootCause,
          lockedPsychology: polarityResult.lockedPsychology,
          unlockKey: polarityResult.unlockKey,
          shadowTrap: polarityResult.shadowTrap,
          planetsInside
        });
      }
    }
  });

  const isCriticalDegree = [28, 29].includes(sunData.degreeInSign);
  const hasInterceptedSigns = interceptedSigns.length > 0;
  const hasSpecialLocks = hasInterceptedSigns || isCriticalDegree;

  const progressedEvolution: ProgressedEvolution = {
    hasSpecialLocks,
    isCriticalDegree,
    degreeType: anareticInfo.degreeType,
    badgeTitle: anareticInfo.badgeTitle,
    badgeColor: anareticInfo.badgeColor,
    karmicStage: anareticInfo.karmicStage,
    natalSunSign: sunData.sign,
    natalSunDegree: sunData.degreeInSign,
    natalSunMinutes: sunData.minutes,
    progressedSunSign: currentProgressedSign,
    progressedAge,
    currentAge,
    hasShifted,
    evolutionSummary: anareticInfo.evolutionSummary,
    interceptedSigns,
    hasInterceptedSigns
  };

  // 10. Tarihsel Zaman Tüneli & Galaktik Ruh Kökeni (Aşama 1)
  const historicalEra = calculateHistoricalEra(natalChart, gadData.sign, gadHouse);
  const beriyahChart = calculateHarmonicChart(natalChart, 9);
  const cosmicOrigin = calculateCosmicOrigin(natalChart, birthDate, beriyahChart);

  return {
    gad: {
      longitude: gadLon,
      sign: gadData.sign,
      degreeInSign: gadData.degreeInSign,
      minutes: gadData.minutes,
      house: gadHouse,
      info: gadSignInfo,
      houseInfo: gadHouseInfo,
      karmicRuler: {
        name: rulerPlanet.name,
        sign: rulerPlanet.sign,
        house: rulerPlanet.house,
        isRetrograde: !!rulerPlanet.isRetrograde,
        summary: karmicRulerSummary
      },
      aspects: gadAspects,
      hdGate: gadHDSynthesis
    },
    historicalEra,
    cosmicOrigin,
    twelfthHouse: {
      sign: h12.sign,
      ruler: h12Ruler,
      lastBreathAtmosphere: h12Info.lastBreathAtmosphere,
      subconsciousGift: h12Info.subconsciousGift,
      hiddenFear: h12Info.hiddenFear,
      planetsIn12th,
      hdFearSynthesis
    },
    retroDebts,
    chiron: chironResult,
    draconicComparison,
    kad: {
      sign: kadPoint.sign,
      degreeInSign: kadPoint.degreeInSign,
      house: kadPoint.house,
      seed: kadSeed,
      hdGate: kadHDSynthesis
    },
    eighthHouse: {
      sign: h8.sign,
      ruler: h8Ruler,
      transformationGateway
    },
    incarnationCross: incarnationCrossResult,
    progressedEvolution,
    soulMaturity: {
      score,
      tier,
      description: tierDesc,
      dominantElement
    }
  };
}
