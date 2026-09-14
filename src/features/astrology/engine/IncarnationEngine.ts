import { 
  NatalChartData, 
  AstroPoint, 
  ZodiacSign, 
  ZODIAC_SIGNS 
} from './AstrologyConstants';
import { getSignAndDegree, calculateDraconicChart } from './AstrologyEngine';
import {
  GAD_SIGN_INTERPRETATIONS,
  GAD_HOUSE_INTERPRETATIONS,
  TWELFTH_HOUSE_SIGN_INTERPRETATIONS,
  RETRO_KARMIC_DEBTS,
  CHIRON_SIGN_WOUNDS,
  KAD_NEXT_LIFE_SEEDS,
  IncarnationPastLifeInfo,
  IncarnationHouseInfo,
  RetroKarmicDebt,
  ChironWound,
  NextLifeSeed,
  getDraconicPointInterpretation
} from './IncarnationInterpretations';

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
  };

  // Karmik Borçlar (Retrolar)
  retroDebts: RetroKarmicDebt[];

  // Kiron Ruh Yarası
  chiron: {
    sign: ZodiacSign;
    house: number;
    wound: ChironWound;
  } | null;

  // Drakonik Karşılaştırma
  draconicComparison: TropicalVsDraconicComparison[];

  // Gelecek Yaşam Tohumu (KAD & 8./9. Ev)
  kad: {
    sign: ZodiacSign;
    degreeInSign: number;
    house: number;
    seed: NextLifeSeed;
  };
  eighthHouse: {
    sign: ZodiacSign;
    ruler: string;
    transformationGateway: string;
  };

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

export function calculateIncarnationAnalysis(natalChart: NatalChartData): IncarnationAnalysisResult {
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

  // 3. Karmik Borçlar (Retrolar)
  const retroDebts: RetroKarmicDebt[] = [];
  natalChart.planets.forEach(p => {
    if (p.isRetrograde && RETRO_KARMIC_DEBTS[p.name]) {
      retroDebts.push(RETRO_KARMIC_DEBTS[p.name]);
    }
  });

  // 4. Kiron Ruh Yarası
  const chironPoint = natalChart.planets.find(p => p.name === 'Kiron');
  let chironResult = null;
  if (chironPoint) {
    const wound = CHIRON_SIGN_WOUNDS[chironPoint.sign] || CHIRON_SIGN_WOUNDS['Koç'];
    chironResult = {
      sign: chironPoint.sign,
      house: chironPoint.house,
      wound
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

  // 6. Gelecek Yaşam Tohumu (KAD & 8./9. Ev)
  const kadSeed = KAD_NEXT_LIFE_SEEDS[kadPoint.sign] || KAD_NEXT_LIFE_SEEDS['Koç'];

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

  // 7. Ruhsal Olgunluk Skoru (Soul Maturity Score)
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
      aspects: gadAspects
    },
    twelfthHouse: {
      sign: h12.sign,
      ruler: h12Ruler,
      lastBreathAtmosphere: h12Info.lastBreathAtmosphere,
      subconsciousGift: h12Info.subconsciousGift,
      hiddenFear: h12Info.hiddenFear,
      planetsIn12th
    },
    retroDebts,
    chiron: chironResult,
    draconicComparison,
    kad: {
      sign: kadPoint.sign,
      degreeInSign: kadPoint.degreeInSign,
      house: kadPoint.house,
      seed: kadSeed
    },
    eighthHouse: {
      sign: h8.sign,
      ruler: h8Ruler,
      transformationGateway
    },
    soulMaturity: {
      score,
      tier,
      description: tierDesc,
      dominantElement
    }
  };
}
