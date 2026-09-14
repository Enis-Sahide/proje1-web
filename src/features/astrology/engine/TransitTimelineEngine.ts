import { Constants } from '@fusionstrings/swisseph-wasi';
import { getSwe } from './AstrologyEngine';
import { AstroPoint } from './AstrologyConstants';
import { getSkyAspectInterpretation, getSkyPlanetSignInterpretation } from './SkyAspectInterpretations';
import { getHouseFromLongitude, HOUSE_TITLES, HOUSE_SHORT_THEMES } from './TransitSynthesisEngine';

export interface TransitTimelineItem {
  id: string;
  transitPlanet: string;
  natalPlanet: string;
  type: 'Kavuşum' | 'Karşıt' | 'Kare' | 'Üçgen' | 'Sekstil' | 'İngress';
  isHarmonious: boolean;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (e.g. "08:15")
  peakDate: string;  // YYYY-MM-DD
  peakTime?: string; // HH:mm (e.g. "18:25")
  endDate: string;    // YYYY-MM-DD
  endTime?: string;   // HH:mm (e.g. "21:45")
  minOrb: number;
  category: 'Kadersel' | 'Kişisel';
  title: string;
  summary: string;
  details: string;
  advice: string;
  chakraLayer: string;
  durationDays: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  phase: 'YAKLASAN' | 'ZIRVE' | 'UZAKLASAN';
  isStartedInPast: boolean;
  isPeakInPast: boolean;
  transitHouse?: number;
  natalHouse?: number;
}

interface AspectConfig {
  name: 'Kavuşum' | 'Karşıt' | 'Kare' | 'Üçgen' | 'Sekstil';
  angle: number;
  maxOrb: number;
  isHarmonious: boolean;
}

const ASPECTS: AspectConfig[] = [
  { name: 'Kavuşum', angle: 0, maxOrb: 3.0, isHarmonious: true },
  { name: 'Karşıt', angle: 180, maxOrb: 3.0, isHarmonious: false },
  { name: 'Kare', angle: 90, maxOrb: 3.0, isHarmonious: false },
  { name: 'Üçgen', angle: 120, maxOrb: 3.0, isHarmonious: true },
  { name: 'Sekstil', angle: 60, maxOrb: 2.5, isHarmonious: true }
];

const TRANSIT_BODIES = [
  { name: 'Plüton', id: Constants.SE_PLUTO, category: 'Kadersel' as const },
  { name: 'Neptün', id: Constants.SE_NEPTUNE, category: 'Kadersel' as const },
  { name: 'Uranüs', id: Constants.SE_URANUS, category: 'Kadersel' as const },
  { name: 'Satürn', id: Constants.SE_SATURN, category: 'Kadersel' as const },
  { name: 'Jüpiter', id: Constants.SE_JUPITER, category: 'Kadersel' as const },
  { name: 'Kiron', id: Constants.SE_CHIRON, category: 'Kadersel' as const },
  { name: 'Lilith', id: Constants.SE_MEAN_APOG, category: 'Kadersel' as const },
  { name: 'Mars', id: Constants.SE_MARS, category: 'Kişisel' as const },
  { name: 'Venüs', id: Constants.SE_VENUS, category: 'Kişisel' as const },
  { name: 'Güneş', id: Constants.SE_SUN, category: 'Kişisel' as const },
  { name: 'Merkür', id: Constants.SE_MERCURY, category: 'Kişisel' as const },
];

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

function getAngularDifference(lon1: number, lon2: number, aspectAngle: number): number {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  return Math.abs(diff - aspectAngle);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getChakraLayer(tPlanet: string, nPlanet: string): string {
  const combined = `${tPlanet} ${nPlanet}`;
  if (combined.includes('Satürn') || combined.includes('Plüton')) {
    return '1. Kök Katmanı (Muladhara - Temel Güven, Sınav & Yapılanma)';
  }
  if (combined.includes('Lilith')) {
    return '2. Sakral Katmanı (Svadhisthana - Gölge Şifa, Tabular & Vahşi Bilgelik)';
  }
  if (combined.includes('Ay') || combined.includes('Venüs')) {
    return '4. Kalp Katmanı (Anahata - Sevgi, Şefkat & İlişkiler)';
  }
  if (combined.includes('Mars') || combined.includes('Güneş')) {
    return '3. Solar Pleksus Katmanı (Manipura - İrade & Özgüven)';
  }
  if (combined.includes('Merkür') || combined.includes('Uranüs')) {
    return '5. Boğaz Katmanı (Vishuddha - İletişim, Hakikat & Zihinsel Uyanış)';
  }
  if (combined.includes('Jüpiter') || combined.includes('Kiron')) {
    return '6. Üçüncü Göz Katmanı (Ajna - Bilgelik, Sezgi & İçsel Şifa)';
  }
  return '7. Taç Katmanı (Sahasrara - Birlik Bilinci & Kadersel Akış)';
}

function getInterpretationDetails(tPlanet: string, nPlanet: string, aspect: string): { summary: string; details: string; advice: string } {
  const isHarmonious = aspect === 'Üçgen' || aspect === 'Sekstil';
  const isChallenging = aspect === 'Kare' || aspect === 'Karşıt';

  let summary = '';
  let details = '';
  let advice = '';

  if (tPlanet === 'Satürn') {
    if (isChallenging) {
      summary = `Hayatınızın ${nPlanet} ile simgelenen alanında sorumluluk alma, sabır ve olgunlaşma sınavı.`;
      details = `Transit Satürn, natal ${nPlanet} noktanıza sert bir açı yaparak gevşek veya temelsiz yapıları zorlar. Bu süreçte engellerle veya gecikmelerle karşılaşabilirsiniz; ancak amaç sizi cezalandırmak değil, daha dayanıklı ve disiplinli bir temel kurmanızı sağlamaktır.`;
      advice = `✓ Yapılması Gereken: Planlı olun, sabredin ve sorumluluklardan kaçmayın.\n✗ Kaçınılması Gereken: Karamsarlığa kapılmak, kurban psikolojisine girmek ve kestirme yollara sapmak.`;
    } else {
      summary = `Kalıcı başarılar, sağlam iş birlikleri ve uzun vadeli ödüller dönemi.`;
      details = `Satürn'ün destekleyici açısı, ${nPlanet} konularında ektiğiniz tohumların sağlam kök salmasını sağlar. Disiplinli çabalarınız somut ve kalıcı sonuçlar doğurur.`;
      advice = `✓ Yapılması Gereken: Uzun vadeli projeleri hayata geçirin ve otorite figürleriyle sağlam ilişkiler kurun.`;
    }
  } else if (tPlanet === 'Jüpiter') {
    if (isChallenging) {
      summary = `Aşırı iyimserlik, abartılı harcamalar veya sınırlara meydan okuma eğilimi.`;
      details = `Jüpiter'in kare veya karşıt açısı, ${nPlanet} alanında vizyonu büyütürken aşırıya kaçma riski getirir. Boyunuzu aşan sözler vermekten veya gereksiz riskler almaktan kaçınmalısınız.`;
      advice = `✓ Yapılması Gereken: Fırsatları temkinli değerlendirin, gerçekçi zeminde kalın.\n✗ Kaçınılması Gereken: Fanatizm, savurganlık ve kibrin tuzağına düşmek.`;
    } else {
      summary = `Kozmik şans, ferahlık, büyüme ve bolluk kapılarının aralanması.`;
      details = `Jüpiter natal ${nPlanet} noktanıza ilahi lütuf, genişleme ve yüksek moral getiriyor. Hayatınızda tıkanan kapılar kendiliğinden açılabilir.`;
      advice = `✓ Yapılması Gereken: Yeni başlangıçlar yapın, seyahat edin ve ufkunuzu genişletin.`;
    }
  } else if (tPlanet === 'Plüton') {
    summary = `Küllerinden yeniden doğma, derin psikolojik arınma ve kadersel güçlenme.`;
    details = `Plüton'un ${nPlanet} ile teması, yüzeyde olanı yıkarak hakiki özünüzü ortaya çıkarır. Bu süreçte artık size hizmet etmeyen eski kalıpları, bağımlılıkları veya korkuları serbest bırakmanız gerekir.`;
    advice = `✓ Yapılması Gereken: Kontrolü bırakıp dönüşüme teslim olun; içsel gücünüze sahip çıkın.\n✗ Kaçınılması Gereken: Güç savaşları, takıntılar ve geçmişe çaresizce tutunmak.`;
  } else if (tPlanet === 'Uranüs') {
    summary = `Beklenmedik uyanışlar, sürpriz gelişmeler ve özgürleşme isteği.`;
    details = `Uranüs şimşek gibi çakarak ${nPlanet} alanında ani farkındalıklar ve değişimler tetikler. Rutinlerin kırıldığı, özgürlük hissinin yükseldiği bir evredir.`;
    advice = `✓ Yapılması Gereken: Esnek olun, yeniliklere kucak açın.\n✗ Kaçınılması Gereken: Ani fevri çıkışlarla köprüleri gereksiz yere yakmak.`;
  } else if (tPlanet === 'Neptün') {
    summary = `Sezgisel yükseliş, ruhsal derinlik, ilham ve bazen sisli belirsizlikler.`;
    details = `Neptün katı sınırları eritir. ${nPlanet} konularında ruhsal anlayışınız derinleşir, yaratıcılığınız artar; ancak pembe gözlüklerle gerçeklerden kopma riskine dikkat edilmelidir.`;
    advice = `✓ Yapılması Gereken: Meditasyon, sanat ve manevi çalışmalarla akışta kalın.\n✗ Kaçınılması Gereken: Kandırılmaya açık olmak, net olmayan sözleşmelere imza atmak.`;
  } else if (tPlanet === 'Mars') {
    if (isChallenging) {
      summary = `Yüksek adrenalin, acelecilik, sabırsızlık ve tartışma potansiyeli.`;
      details = `Transit Mars, ${nPlanet} üzerinde ateşli bir hareketlilik yaratır. Enerji çok yüksektir; doğru yönlendirilmezse öfke patlamalarına veya sakarlıklara yol açabilir.`;
      advice = `✓ Yapılması Gereken: Spor ve fiziksel eforla enerjinizi sağaltın.\n✗ Kaçınılması Gereken: Trafikte veya tartışmalarda öfkeyle karar almak.`;
    } else {
      summary = `Yüksek cesaret, kararlılık, fiziksel canlılık ve atılım gücü.`;
      details = `Mars'ın uyumlu açısı ertelediğiniz adımları atmak için gereken cesareti ve dayanıklılığı size kazandırır.`;
      advice = `✓ Yapılması Gereken: Hedeflerinize doğrudan odaklanın ve cesurca harekete geçin.`;
    }
  } else if (tPlanet === 'Lilith') {
    summary = `Bastırılmış gölgelerle yüzleşme, tabuları yıkma ve otantik bağımsızlık arayışı.`;
    details = `Transit Lilith, natal ${nPlanet} noktanıza temas ederken taviz verdiğiniz veya boyun eğdiğiniz alanlarda başkaldırı hissi uyandırır. Bu süreç, korkuların arkasındaki ilksel gücü sahiplenme vaktidir.`;
    advice = `✓ Yapılması Gereken: Gölge yönlerinizi inkar etmek yerine kabul edin; kendi sınırlarınızı ve özgürlüğünüzü korkusuzca savunun.\n✗ Kaçınılması Gereken: Öç alma arzusu, aşırı yıkıcı isyan ve kendini sabote etmek.`;
  } else {
    // Güneş, Venüs, Merkür
    summary = `${tPlanet}, natal ${nPlanet} noktanızla ${aspect} yaparak güncel odağınızı ve ilişkilerinizi canlandırıyor.`;
    details = `${tPlanet} transitinin getirdiği enerjiler, doğuştan gelen ${nPlanet} özelliklerinizi tetikleyerek kısa vadeli ama etkili farkındalıklar ve görüşmeler sağlar.`;
    advice = `✓ Yapılması Gereken: Karşınıza çıkan fırsatları değerlendirin ve zihninizi berrak tutun.`;
  }

  return { summary, details, advice };
}


const PLANET_LOOKBACK_DAYS: Record<string, number> = {
  'Plüton': 540,
  'Neptün': 540,
  'Uranüs': 450,
  'Satürn': 300,
  'Kiron': 365,
  'Lilith': 180,
  'Jüpiter': 150,
  'Mars': 45,
  'Güneş': 30,
  'Venüs': 30,
  'Merkür': 30,
};

const PLANET_LOOKAHEAD_DAYS: Record<string, number> = {
  'Plüton': 365,
  'Neptün': 365,
  'Uranüs': 300,
  'Satürn': 240,
  'Kiron': 240,
  'Lilith': 180,
  'Jüpiter': 120,
  'Mars': 45,
  'Güneş': 30,
  'Venüs': 30,
  'Merkür': 30,
};

export const FAST_PLANETS = new Set(['Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars']);

/**
 * Adaptive orb calculation:
 * For fast/personal planets (Güneş, Ay, Merkür, Venüs, Mars), expands the approaching orb (4.0° - 4.5°)
 * so daily influence is felt 3-4 days in advance as in classical astrology.
 * For slow/outer planets, keeps 2.5° - 3.0° to maintain clarity and avoid overly long intervals.
 */
export function getMaxOrb(planet1: string, planet2: string, aspectName: string): number {
  const isFastInvolved = FAST_PLANETS.has(planet1) || FAST_PLANETS.has(planet2);

  if (isFastInvolved) {
    switch (aspectName) {
      case 'Kavuşum':
        return 4.5;
      case 'Karşıt':
      case 'Kare':
      case 'Üçgen':
        return 4.0;
      case 'Sekstil':
        return 3.5;
      default:
        return 4.0;
    }
  }

  switch (aspectName) {
    case 'Kavuşum':
    case 'Karşıt':
    case 'Kare':
    case 'Üçgen':
      return 3.0;
    case 'Sekstil':
      return 2.5;
    default:
      return 3.0;
  }
}

interface RefinedTiming {
  startDateStr: string;
  startTimeStr?: string;
  peakDateStr: string;
  peakTimeStr?: string;
  endDateStr: string;
  endTimeStr?: string;
  exactMinOrb: number;
}

/**
 * Executes high-precision hourly and 5-minute interpolation around start, peak, and end dates.
 * Discovers the exact 0°00' peak minute and time of entry/exit into the aspect orb.
 */
function executeTimingRefinement(
  getOrbAtUtc: (utcDate: Date) => number,
  maxOrb: number,
  rawStart: Date,
  rawPeak: Date,
  rawEnd: Date,
  rawMinOrb: number,
  tzOffsetHours = 3
): RefinedTiming {
  // 1. Refine Peak Time (finding absolute minimum orb / exact 0° partil)
  let bestPeakUtc = new Date(rawPeak.getTime());
  let bestOrb = rawMinOrb;

  // Scan +/- 36 hours around rawPeak in 1-hour steps
  const peakStartMs = rawPeak.getTime() - 36 * 3600 * 1000;
  for (let hour = 0; hour <= 72; hour++) {
    const testDate = new Date(peakStartMs + hour * 3600 * 1000);
    const orb = getOrbAtUtc(testDate);
    if (orb < bestOrb) {
      bestOrb = orb;
      bestPeakUtc = testDate;
    }
  }

  // Refine in 5-minute steps around bestPeakUtc (+/- 45 minutes)
  const finePeakMs = bestPeakUtc.getTime() - 45 * 60 * 1000;
  for (let step = 0; step <= 18; step++) {
    const testDate = new Date(finePeakMs + step * 5 * 60 * 1000);
    const orb = getOrbAtUtc(testDate);
    if (orb < bestOrb) {
      bestOrb = orb;
      bestPeakUtc = testDate;
    }
  }

  const localPeak = new Date(bestPeakUtc.getTime() + tzOffsetHours * 3600 * 1000);
  const peakDateStr = `${localPeak.getUTCFullYear()}-${String(localPeak.getUTCMonth() + 1).padStart(2, '0')}-${String(localPeak.getUTCDate()).padStart(2, '0')}`;
  const peakTimeStr = `${String(localPeak.getUTCHours()).padStart(2, '0')}:${String(localPeak.getUTCMinutes()).padStart(2, '0')}`;

  // 2. Refine Start Time (crossing into <= maxOrb)
  let bestStartUtc: Date | null = null;
  const startScanMs = rawStart.getTime() - 36 * 3600 * 1000;
  for (let hour = 0; hour <= 72; hour++) {
    const testDate = new Date(startScanMs + hour * 3600 * 1000);
    const orb = getOrbAtUtc(testDate);
    if (orb <= maxOrb) {
      bestStartUtc = testDate;
      // Step backward in 5-minute increments up to 60 mins to find first minute inside orb
      for (let minStep = 1; minStep <= 12; minStep++) {
        const subDate = new Date(testDate.getTime() - minStep * 5 * 60 * 1000);
        if (getOrbAtUtc(subDate) <= maxOrb) {
          bestStartUtc = subDate;
        } else {
          break;
        }
      }
      break;
    }
  }

  let startDateStr = formatDate(rawStart);
  let startTimeStr: string | undefined = undefined;
  if (bestStartUtc) {
    const localStart = new Date(bestStartUtc.getTime() + tzOffsetHours * 3600 * 1000);
    startDateStr = `${localStart.getUTCFullYear()}-${String(localStart.getUTCMonth() + 1).padStart(2, '0')}-${String(localStart.getUTCDate()).padStart(2, '0')}`;
    startTimeStr = `${String(localStart.getUTCHours()).padStart(2, '0')}:${String(localStart.getUTCMinutes()).padStart(2, '0')}`;
  }

  // 3. Refine End Time (crossing out of <= maxOrb)
  let bestEndUtc: Date | null = null;
  const endScanMs = rawEnd.getTime() - 36 * 3600 * 1000;
  let wasInside = false;
  for (let hour = 0; hour <= 72; hour++) {
    const testDate = new Date(endScanMs + hour * 3600 * 1000);
    const orb = getOrbAtUtc(testDate);
    if (orb <= maxOrb) {
      wasInside = true;
      bestEndUtc = testDate;
    } else if (wasInside && orb > maxOrb) {
      const startSub = testDate.getTime() - 60 * 60 * 1000;
      for (let minStep = 1; minStep <= 12; minStep++) {
        const subDate = new Date(startSub + minStep * 5 * 60 * 1000);
        if (getOrbAtUtc(subDate) <= maxOrb) {
          bestEndUtc = subDate;
        } else {
          break;
        }
      }
      break;
    }
  }

  let endDateStr = formatDate(rawEnd);
  let endTimeStr: string | undefined = undefined;
  if (bestEndUtc) {
    const localEnd = new Date(bestEndUtc.getTime() + tzOffsetHours * 3600 * 1000);
    endDateStr = `${localEnd.getUTCFullYear()}-${String(localEnd.getUTCMonth() + 1).padStart(2, '0')}-${String(localEnd.getUTCDate()).padStart(2, '0')}`;
    endTimeStr = `${String(localEnd.getUTCHours()).padStart(2, '0')}:${String(localEnd.getUTCMinutes()).padStart(2, '0')}`;
  }

  return {
    startDateStr,
    startTimeStr,
    peakDateStr,
    peakTimeStr,
    endDateStr,
    endTimeStr,
    exactMinOrb: Number(bestOrb.toFixed(2))
  };
}

function refineNatalAspectTiming(
  swe: any,
  flags: number,
  tBodyId: number,
  nLon: number,
  aspectAngle: number,
  maxOrb: number,
  rawStart: Date,
  rawPeak: Date,
  rawEnd: Date,
  rawMinOrb: number,
  tzOffsetHours = 3
): RefinedTiming {
  const getOrbAtUtc = (utcDate: Date): number => {
    const y = utcDate.getUTCFullYear();
    const m = utcDate.getUTCMonth() + 1;
    const d = utcDate.getUTCDate();
    const h = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600;
    const jd = swe.swe_julday(y, m, d, h, Constants.SE_GREG_CAL);
    const calc = swe.swe_calc_ut(jd, tBodyId, flags);
    return getAngularDifference(mod360(calc.xx[0]), nLon, aspectAngle);
  };

  return executeTimingRefinement(getOrbAtUtc, maxOrb, rawStart, rawPeak, rawEnd, rawMinOrb, tzOffsetHours);
}

function refineMundaneAspectTiming(
  swe: any,
  flags: number,
  b1Id: number,
  b2Id: number,
  aspectAngle: number,
  maxOrb: number,
  rawStart: Date,
  rawPeak: Date,
  rawEnd: Date,
  rawMinOrb: number,
  tzOffsetHours = 3
): RefinedTiming {
  const getOrbAtUtc = (utcDate: Date): number => {
    const y = utcDate.getUTCFullYear();
    const m = utcDate.getUTCMonth() + 1;
    const d = utcDate.getUTCDate();
    const h = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600;
    const jd = swe.swe_julday(y, m, d, h, Constants.SE_GREG_CAL);
    const calc1 = swe.swe_calc_ut(jd, b1Id, flags);
    const calc2 = swe.swe_calc_ut(jd, b2Id, flags);
    return getAngularDifference(mod360(calc1.xx[0]), mod360(calc2.xx[0]), aspectAngle);
  };

  return executeTimingRefinement(getOrbAtUtc, maxOrb, rawStart, rawPeak, rawEnd, rawMinOrb, tzOffsetHours);
}

/**
 * Calculates all transit aspect intervals (Gantt bars) for a natal chart over a date range.
 * Includes adaptive per-planet lookback and backtracking to guarantee true historical entry and 0° peak dates.
 */
export async function calculateTransitTimeline(
  natalPlanets: AstroPoint[],
  startDate: Date,
  endDate: Date,
  options?: {
    categoryFilter?: 'ALL' | 'KADERSEL' | 'KISISEL';
    onlyMajorAspects?: boolean;
    lookbackDays?: number;
    lookaheadDays?: number;
    tzOffsetHours?: number;
    natalHouses?: AstroPoint[];
  }
): Promise<TransitTimelineItem[]> {
  const swe = await getSwe();
  const flags = Constants.SEFLG_SWIEPH | Constants.SEFLG_SPEED;

  // Filter transit bodies
  const bodiesToScan = TRANSIT_BODIES.filter(b => {
    if (!options?.categoryFilter || options.categoryFilter === 'ALL') return true;
    if (options.categoryFilter === 'KADERSEL') return b.category === 'Kadersel';
    if (options.categoryFilter === 'KISISEL') return b.category === 'Kişisel';
    return true;
  });

  // Natal target planets
  const validNatalTargets = natalPlanets.filter(p => 
    ['Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars', 'Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton', 'Kiron', 'Kuzey Ay Düğümü', 'Yükselen (ASC)', 'Tepe Noktası (MC)'].includes(p.name)
  );

  const timelineItems: TransitTimelineItem[] = [];
  const startDayTime = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())).getTime();
  const endDayTime = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59)).getTime();

  for (const tBody of bodiesToScan) {
    const lookbackDays = options?.lookbackDays ?? (PLANET_LOOKBACK_DAYS[tBody.name] ?? 90);
    const lookaheadDays = options?.lookaheadDays ?? (PLANET_LOOKAHEAD_DAYS[tBody.name] ?? 45);
    const stepDays = ['Plüton', 'Neptün', 'Uranüs', 'Satürn', 'Kiron'].includes(tBody.name) ? 2 : 1;

    const scanStartDate = new Date(startDate.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
    const scanEndDate = new Date(endDate.getTime() + lookaheadDays * 24 * 60 * 60 * 1000);

    const samples: { date: Date; dateStr: string; lon: number }[] = [];
    let cur = new Date(Date.UTC(scanStartDate.getUTCFullYear(), scanStartDate.getUTCMonth(), scanStartDate.getUTCDate(), 12, 0, 0));
    const scanEndUtc = new Date(Date.UTC(scanEndDate.getUTCFullYear(), scanEndDate.getUTCMonth(), scanEndDate.getUTCDate(), 12, 0, 0));

    while (cur <= scanEndUtc) {
      const year = cur.getUTCFullYear();
      const month = cur.getUTCMonth() + 1;
      const day = cur.getUTCDate();
      const hour = 12.0;

      const jd = swe.swe_julday(year, month, day, hour, Constants.SE_GREG_CAL);
      const calc = swe.swe_calc_ut(jd, tBody.id, flags);
      samples.push({
        date: new Date(cur.getTime()),
        dateStr: formatDate(cur),
        lon: mod360(calc.xx[0])
      });

      cur = new Date(cur.getTime() + stepDays * 24 * 60 * 60 * 1000);
    }

    if (samples.length === 0) continue;

    for (const nPlanet of validNatalTargets) {
      for (const aspect of ASPECTS) {
        const maxOrb = getMaxOrb(tBody.name, nPlanet.name, aspect.name);
        let inInterval = false;
        let intervalStart: Date | null = null;
        let intervalEnd: Date | null = null;
        let peakDate: Date | null = null;
        let minOrb = 999;

        const finalizeAndPush = (rawStart: Date, rawEnd: Date, rawPeak: Date, rawMinOrb: number) => {
          let sD = new Date(rawStart.getTime());
          let eD = new Date(rawEnd.getTime());
          let pD = new Date(rawPeak.getTime());
          let bestOrb = rawMinOrb;

          // 1. Backtracking: If interval started on the very first sample, trace further back into the past!
          if (sD.getTime() === samples[0].date.getTime()) {
            let backCur = new Date(sD.getTime() - 3 * 24 * 60 * 60 * 1000);
            let backSteps = 0;
            while (backSteps < 120) { // Up to 360 more days into the past
              const y = backCur.getUTCFullYear();
              const m = backCur.getUTCMonth() + 1;
              const d = backCur.getUTCDate();
              const jd = swe.swe_julday(y, m, d, 12.0, Constants.SE_GREG_CAL);
              const calc = swe.swe_calc_ut(jd, tBody.id, flags);
              const tLon = mod360(calc.xx[0]);
              const bOrb = getAngularDifference(tLon, nPlanet.longitude, aspect.angle);

              if (bOrb <= maxOrb) {
                sD = new Date(backCur.getTime());
                if (bOrb < bestOrb) {
                  bestOrb = bOrb;
                  pD = new Date(backCur.getTime());
                }
                backCur = new Date(backCur.getTime() - 3 * 24 * 60 * 60 * 1000);
                backSteps++;
              } else {
                break;
              }
            }
          }

          // 2. Forward tracking: If interval reached the very last sample, trace further forward into the future!
          if (eD.getTime() === samples[samples.length - 1].date.getTime()) {
            let fwdCur = new Date(eD.getTime() + 3 * 24 * 60 * 60 * 1000);
            let fwdSteps = 0;
            while (fwdSteps < 120) { // Up to 360 more days into the future
              const y = fwdCur.getUTCFullYear();
              const m = fwdCur.getUTCMonth() + 1;
              const d = fwdCur.getUTCDate();
              const jd = swe.swe_julday(y, m, d, 12.0, Constants.SE_GREG_CAL);
              const calc = swe.swe_calc_ut(jd, tBody.id, flags);
              const tLon = mod360(calc.xx[0]);
              const fOrb = getAngularDifference(tLon, nPlanet.longitude, aspect.angle);

              if (fOrb <= maxOrb) {
                eD = new Date(fwdCur.getTime());
                if (fOrb < bestOrb) {
                  bestOrb = fOrb;
                  pD = new Date(fwdCur.getTime());
                }
                fwdCur = new Date(fwdCur.getTime() + 3 * 24 * 60 * 60 * 1000);
                fwdSteps++;
              } else {
                break;
              }
            }
          }

          // 3. Absolute Guarantee: Peak and Start can NEVER be identical.
          if (pD.getTime() === sD.getTime() && eD.getTime() > sD.getTime()) {
            const midTime = sD.getTime() + Math.round((eD.getTime() - sD.getTime()) / 2);
            pD = new Date(midTime);
          }

          const sTime = sD.getTime();
          const eTime = eD.getTime();

          // Interval must overlap with the user requested [startDate, endDate] window
          if (eTime >= startDayTime && sTime <= endDayTime) {
            // Perform high-precision hourly & 5-minute interpolation
            const timing = refineNatalAspectTiming(
              swe,
              flags,
              tBody.id,
              nPlanet.longitude,
              aspect.angle,
              maxOrb,
              sD,
              pD,
              eD,
              bestOrb,
              options?.tzOffsetHours ?? 3
            );

            const durationDays = Math.max(1, Math.round((eTime - sTime) / (1000 * 60 * 60 * 24)));
            const interp = getInterpretationDetails(tBody.name, nPlanet.name, aspect.name);

            const isStartedInPast = sTime < startDayTime;
            const isPeakInPast = new Date(timing.peakDateStr).getTime() < startDayTime;

            let status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' = 'ACTIVE';
            if (sTime > startDayTime) status = 'UPCOMING';
            else if (eTime < startDayTime) status = 'COMPLETED';

            let phase: 'YAKLASAN' | 'ZIRVE' | 'UZAKLASAN' = 'YAKLASAN';
            if (timing.peakDateStr === formatDate(startDate)) phase = 'ZIRVE';
            else if (isPeakInPast) phase = 'UZAKLASAN';
            else phase = 'YAKLASAN';

            const peakSample = samples.find(s => s.dateStr === timing.peakDateStr) || samples.find(s => s.date.getTime() === pD.getTime());
            const tLonAtPeak = peakSample ? peakSample.lon : samples[0]?.lon || 0;
            const tHouse = options?.natalHouses ? getHouseFromLongitude(tLonAtPeak, options.natalHouses) : undefined;
            const nHouse = nPlanet.house || (options?.natalHouses ? getHouseFromLongitude(nPlanet.longitude, options.natalHouses) : undefined);

            let itemTitle = `Transit ${tBody.name} ${aspect.name} Natal ${nPlanet.name}`;
            if (tHouse && nHouse) {
              itemTitle = `Transit ${tBody.name} [${tHouse}. Ev] ${aspect.name} Natal ${nPlanet.name} [${nHouse}. Ev]`;
            } else if (tHouse) {
              itemTitle = `Transit ${tBody.name} [${tHouse}. Ev] ${aspect.name} Natal ${nPlanet.name}`;
            }

            let houseSection = '';
            if (tHouse && nHouse) {
              houseSection = `【Yaşam Alanı (Ev) Etkileşimi: ${tHouse}. Ev ➔ ${nHouse}. Ev】\n` +
                `Transit ${tBody.name} haritanızın ${tHouse}. evinde (${HOUSE_SHORT_THEMES[tHouse] || 'bu alan'}) hareket ederken, ` +
                `${nHouse}. evinizdeki (${HOUSE_SHORT_THEMES[nHouse] || 'bu alan'}) Natal ${nPlanet.name} noktanıza ${aspect.name} açı yapıyor. ` +
                `Bu durum, bu iki yaşam alanı arasında doğrudan bir köprü kurar ve kadersel farkındalık yaratır.\n\n`;
            } else if (tHouse) {
              houseSection = `【Yaşam Alanı (Ev) Etkisi: ${tHouse}. Ev】\n` +
                `Transit ${tBody.name}, haritanızın ${tHouse}. evinden (${HOUSE_SHORT_THEMES[tHouse] || 'bu alan'}) geçerken bu açıyı gerçekleştiriyor.\n\n`;
            }

            timelineItems.push({
              id: `${tBody.name}-${aspect.name}-${nPlanet.name}-${timing.startDateStr}`,
              transitPlanet: tBody.name,
              natalPlanet: nPlanet.name,
              type: aspect.name,
              isHarmonious: aspect.isHarmonious,
              startDate: timing.startDateStr,
              startTime: timing.startTimeStr,
              peakDate: timing.peakDateStr,
              peakTime: timing.peakTimeStr,
              endDate: timing.endDateStr,
              endTime: timing.endTimeStr,
              minOrb: timing.exactMinOrb,
              category: tBody.category,
              title: itemTitle,
              summary: interp.summary,
              details: houseSection + interp.details,
              advice: interp.advice,
              chakraLayer: getChakraLayer(tBody.name, nPlanet.name),
              durationDays,
              status,
              phase,
              isStartedInPast,
              isPeakInPast,
              transitHouse: tHouse,
              natalHouse: nHouse
            });
          }
        };

        for (let i = 0; i < samples.length; i++) {
          const sample = samples[i];
          const orb = getAngularDifference(sample.lon, nPlanet.longitude, aspect.angle);
          const isInside = orb <= maxOrb;

          if (isInside) {
            if (!inInterval) {
              inInterval = true;
              intervalStart = sample.date;
              peakDate = sample.date;
              minOrb = orb;
            } else {
              if (orb < minOrb) {
                minOrb = orb;
                peakDate = sample.date;
              }
            }
            intervalEnd = sample.date;
          } else {
            if (inInterval && intervalStart && intervalEnd && peakDate) {
              finalizeAndPush(intervalStart, intervalEnd, peakDate, minOrb);
              inInterval = false;
              intervalStart = null;
              intervalEnd = null;
              peakDate = null;
              minOrb = 999;
            }
          }
        }

        if (inInterval && intervalStart && intervalEnd && peakDate) {
          finalizeAndPush(intervalStart, intervalEnd, peakDate, minOrb);
        }
      }
    }

    // House Ingresses for personal timeline
    if (options?.natalHouses && options.natalHouses.length >= 12 && samples.length > 0) {
      let curHouse = getHouseFromLongitude(samples[0].lon, options.natalHouses);
      let segStart = samples[0];

      for (let i = 1; i < samples.length; i++) {
        const s = samples[i];
        const h = getHouseFromLongitude(s.lon, options.natalHouses);
        const isLast = i === samples.length - 1;

        if (h !== curHouse || isLast) {
          const segEnd = isLast && h === curHouse ? s : samples[i - 1];
          const sTime = segStart.date.getTime();
          const eTime = segEnd.date.getTime();

          if (eTime >= startDayTime && sTime <= endDayTime) {
            const durationDays = Math.max(1, Math.round((eTime - sTime) / (1000 * 60 * 60 * 24)));
            const midMs = (sTime + eTime) / 2;
            const midDate = new Date(midMs);
            const peakDateStr = formatDate(midDate);

            const isStartedInPast = sTime < startDayTime;
            const isPeakInPast = midMs < startDayTime;

            let status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' = 'ACTIVE';
            if (sTime > startDayTime) status = 'UPCOMING';
            else if (eTime < startDayTime) status = 'COMPLETED';

            const hTitle = HOUSE_TITLES[curHouse] || `${curHouse}. Ev`;
            const hTheme = HOUSE_SHORT_THEMES[curHouse] || 'bu yaşam alanınız';

            timelineItems.push({
              id: `house-ingress-${tBody.name}-${curHouse}-${segStart.dateStr}`,
              transitPlanet: tBody.name,
              natalPlanet: `${curHouse}. Ev`,
              type: 'İngress',
              isHarmonious: true,
              startDate: segStart.dateStr,
              startTime: '00:00',
              peakDate: peakDateStr,
              peakTime: '12:00',
              endDate: segEnd.dateStr,
              endTime: '23:59',
              minOrb: 0,
              category: tBody.category,
              title: `Transit ${tBody.name} → ${curHouse}. Evinizde (${hTitle.split(':')[1]?.trim() || ''})`,
              summary: `Transit ${tBody.name}, haritanızın ${curHouse}. evinde (${hTheme}) seyrediyor.`,
              details: `【Kişisel Yaşam Alanı (Ev) Geçişi: ${hTitle}】\n` +
                `Transit ${tBody.name}, bu döngü boyunca haritanızın ${curHouse}. evinden geçer. Bu dönemde ${hTheme} konuları gündeminizin merkezine yerleşir ve köklü bir farkındalık süreci başlar.\n\n` +
                `【Dönüşüm Rehberliği】\nBu evin getirdiği sorumlulukları ve fırsatları ertelemeden, yapıcı bir bilinçle sahiplenin.`,
              advice: `${curHouse}. evinizin temsil ettiği konularda farkındalıkla ve dengeli hareket edin.`,
              chakraLayer: `Kişisel Yaşam Alanı: ${hTitle}`,
              durationDays,
              status,
              phase: status === 'ACTIVE' ? 'ZIRVE' : (status === 'COMPLETED' ? 'UZAKLASAN' : 'YAKLASAN'),
              isStartedInPast,
              isPeakInPast,
              transitHouse: curHouse
            });
          }

          curHouse = h;
          segStart = s;
        }
      }
    }
  }

  // Sort timeline items:
  // 1. Kadersel (outer) planets first, then Kişisel
  // 2. Chronologically by peakDate
  return timelineItems.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category === 'Kadersel' ? -1 : 1;
    }
    return new Date(a.peakDate).getTime() - new Date(b.peakDate).getTime();
  });
}

/**
 * Calculates mundane transit aspect intervals (Gantt bars) between moving sky planets over a date range.
 * Independent of any natal birth chart.
 */
export async function calculateMundaneTimeline(
  startDate: Date,
  endDate: Date,
  options?: {
    categoryFilter?: 'ALL' | 'KADERSEL' | 'KISISEL';
    onlyMajorAspects?: boolean;
    lookbackDays?: number;
    lookaheadDays?: number;
    tzOffsetHours?: number;
  }
): Promise<TransitTimelineItem[]> {
  const swe = await getSwe();
  const flags = Constants.SEFLG_SWIEPH | Constants.SEFLG_SPEED;

  const lookbackDays = options?.lookbackDays ?? 120;
  const lookaheadDays = options?.lookaheadDays ?? 90;

  const startDayTime = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())).getTime();
  const endDayTime = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59)).getTime();

  const scanStartDate = new Date(startDate.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
  const scanEndDate = new Date(endDate.getTime() + lookaheadDays * 24 * 60 * 60 * 1000);

  // 1. Pre-calculate positions of all 10 transit bodies for each sample day
  const dailySamples: { date: Date; dateStr: string; positions: Record<string, number> }[] = [];
  let cur = new Date(Date.UTC(scanStartDate.getUTCFullYear(), scanStartDate.getUTCMonth(), scanStartDate.getUTCDate(), 12, 0, 0));
  const scanEndUtc = new Date(Date.UTC(scanEndDate.getUTCFullYear(), scanEndDate.getUTCMonth(), scanEndDate.getUTCDate(), 12, 0, 0));

  while (cur <= scanEndUtc) {
    const year = cur.getUTCFullYear();
    const month = cur.getUTCMonth() + 1;
    const day = cur.getUTCDate();
    const jd = swe.swe_julday(year, month, day, 12.0, Constants.SE_GREG_CAL);

    const positions: Record<string, number> = {};
    for (const body of TRANSIT_BODIES) {
      const calc = swe.swe_calc_ut(jd, body.id, flags);
      positions[body.name] = mod360(calc.xx[0]);
    }

    dailySamples.push({
      date: new Date(cur.getTime()),
      dateStr: formatDate(cur),
      positions
    });

    cur = new Date(cur.getTime() + 1 * 24 * 60 * 60 * 1000);
  }

  if (dailySamples.length === 0) return [];

  const timelineItems: TransitTimelineItem[] = [];

  // Helper for single-point body position
  const getBodyLonAtDate = (date: Date, bodyId: number): number => {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const jd = swe.swe_julday(y, m, d, 12.0, Constants.SE_GREG_CAL);
    const calc = swe.swe_calc_ut(jd, bodyId, flags);
    return mod360(calc.xx[0]);
  };

  // 2. Scan all unique pairs of transit bodies
  for (let i = 0; i < TRANSIT_BODIES.length; i++) {
    for (let j = i + 1; j < TRANSIT_BODIES.length; j++) {
      const b1 = TRANSIT_BODIES[i];
      const b2 = TRANSIT_BODIES[j];

      // Determine category
      const isKadersel = b1.category === 'Kadersel' && b2.category === 'Kadersel';
      const category: 'Kadersel' | 'Kişisel' = isKadersel ? 'Kadersel' : 'Kişisel';

      if (options?.categoryFilter === 'KADERSEL' && category !== 'Kadersel') continue;
      if (options?.categoryFilter === 'KISISEL' && category !== 'Kişisel') continue;

      for (const aspect of ASPECTS) {
        const maxOrb = getMaxOrb(b1.name, b2.name, aspect.name);
        let inInterval = false;
        let intervalStart: Date | null = null;
        let intervalEnd: Date | null = null;
        let peakDate: Date | null = null;
        let minOrb = 999;

        const finalizeAndPush = (rawStart: Date, rawEnd: Date, rawPeak: Date, rawMinOrb: number) => {
          let sD = new Date(rawStart.getTime());
          let eD = new Date(rawEnd.getTime());
          let pD = new Date(rawPeak.getTime());
          let bestOrb = rawMinOrb;

          // Backtracking into the past if started at the very first sample
          if (sD.getTime() === dailySamples[0].date.getTime()) {
            let backCur = new Date(sD.getTime() - 2 * 24 * 60 * 60 * 1000);
            let backSteps = 0;
            while (backSteps < 60) {
              const lon1 = getBodyLonAtDate(backCur, b1.id);
              const lon2 = getBodyLonAtDate(backCur, b2.id);
              const bOrb = getAngularDifference(lon1, lon2, aspect.angle);

              if (bOrb <= maxOrb) {
                sD = new Date(backCur.getTime());
                if (bOrb < bestOrb) {
                  bestOrb = bOrb;
                  pD = new Date(backCur.getTime());
                }
                backCur = new Date(backCur.getTime() - 2 * 24 * 60 * 60 * 1000);
                backSteps++;
              } else {
                break;
              }
            }
          }

          // Forward tracking into the future if ended at the last sample
          if (eD.getTime() === dailySamples[dailySamples.length - 1].date.getTime()) {
            let fwdCur = new Date(eD.getTime() + 2 * 24 * 60 * 60 * 1000);
            let fwdSteps = 0;
            while (fwdSteps < 60) {
              const lon1 = getBodyLonAtDate(fwdCur, b1.id);
              const lon2 = getBodyLonAtDate(fwdCur, b2.id);
              const fOrb = getAngularDifference(lon1, lon2, aspect.angle);

              if (fOrb <= maxOrb) {
                eD = new Date(fwdCur.getTime());
                if (fOrb < bestOrb) {
                  bestOrb = fOrb;
                  pD = new Date(fwdCur.getTime());
                }
                fwdCur = new Date(fwdCur.getTime() + 2 * 24 * 60 * 60 * 1000);
                fwdSteps++;
              } else {
                break;
              }
            }
          }

          // Ensure peak and start are not identical if duration > 1
          if (pD.getTime() === sD.getTime() && eD.getTime() > sD.getTime()) {
            const midTime = sD.getTime() + Math.round((eD.getTime() - sD.getTime()) / 2);
            pD = new Date(midTime);
          }

          const sTime = sD.getTime();
          const eTime = eD.getTime();

          // Must overlap requested window
          if (eTime >= startDayTime && sTime <= endDayTime) {
            // High-precision mundane hourly & 5-minute refinement
            const timing = refineMundaneAspectTiming(
              swe,
              flags,
              b1.id,
              b2.id,
              aspect.angle,
              maxOrb,
              sD,
              pD,
              eD,
              bestOrb,
              options?.tzOffsetHours ?? 3
            );

            const durationDays = Math.max(1, Math.round((eTime - sTime) / (1000 * 60 * 60 * 24)));
            const interp = getSkyAspectInterpretation(b1.name, b2.name, aspect.name);

            const isStartedInPast = sTime < startDayTime;
            const isPeakInPast = new Date(timing.peakDateStr).getTime() < startDayTime;

            let status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' = 'ACTIVE';
            if (sTime > startDayTime) status = 'UPCOMING';
            else if (eTime < startDayTime) status = 'COMPLETED';

            let phase: 'YAKLASAN' | 'ZIRVE' | 'UZAKLASAN' = 'YAKLASAN';
            if (timing.peakDateStr === formatDate(startDate)) phase = 'ZIRVE';
            else if (isPeakInPast) phase = 'UZAKLASAN';
            else phase = 'YAKLASAN';

            timelineItems.push({
              id: `sky-${b1.name}-${aspect.name}-${b2.name}-${timing.startDateStr}`,
              transitPlanet: b1.name,
              natalPlanet: b2.name,
              type: aspect.name,
              isHarmonious: aspect.isHarmonious,
              startDate: timing.startDateStr,
              startTime: timing.startTimeStr,
              peakDate: timing.peakDateStr,
              peakTime: timing.peakTimeStr,
              endDate: timing.endDateStr,
              endTime: timing.endTimeStr,
              minOrb: timing.exactMinOrb,
              category,
              title: `${b1.name} ${aspect.name} ${b2.name}`,
              summary: interp.summary,
              details: interp.collectiveTheme,
              advice: interp.dailyAdvice,
              chakraLayer: interp.chakraResonance,
              durationDays,
              status,
              phase,
              isStartedInPast,
              isPeakInPast
            });
          }
        };

        for (let s = 0; s < dailySamples.length; s++) {
          const sample = dailySamples[s];
          const lon1 = sample.positions[b1.name];
          const lon2 = sample.positions[b2.name];
          const orb = getAngularDifference(lon1, lon2, aspect.angle);
          const isInside = orb <= maxOrb;

          if (isInside) {
            if (!inInterval) {
              inInterval = true;
              intervalStart = sample.date;
              peakDate = sample.date;
              minOrb = orb;
            } else {
              if (orb < minOrb) {
                minOrb = orb;
                peakDate = sample.date;
              }
            }
            intervalEnd = sample.date;
          } else {
            if (inInterval && intervalStart && intervalEnd && peakDate) {
              finalizeAndPush(intervalStart, intervalEnd, peakDate, minOrb);
              inInterval = false;
              intervalStart = null;
              intervalEnd = null;
              peakDate = null;
              minOrb = 999;
            }
          }
        }

        if (inInterval && intervalStart && intervalEnd && peakDate) {
          finalizeAndPush(intervalStart, intervalEnd, peakDate, minOrb);
        }
      }
    }
  }

  // 3. Scan Sign Ingresses (Burç Geçişleri) for all transit bodies with minute precision
  const ZODIAC_SIGNS = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];

  const findSignCrossingMoment = (
    bodyId: number,
    t1: Date,
    t2: Date,
    targetDegree: number,
    tzOffset: number
  ): { dateStr: string; timeStr: string; dateObj: Date } => {
    let low = t1.getTime();
    let high = t2.getTime();

    for (let iter = 0; iter < 12; iter++) {
      const mid = low + (high - low) / 2;
      const testDate = new Date(mid);
      const y = testDate.getUTCFullYear();
      const m = testDate.getUTCMonth() + 1;
      const d = testDate.getUTCDate();
      const hourFloat = testDate.getUTCHours() + testDate.getUTCMinutes() / 60.0 + testDate.getUTCSeconds() / 3600.0;
      const jd = swe.swe_julday(y, m, d, hourFloat, Constants.SE_GREG_CAL);
      const calc = swe.swe_calc_ut(jd, bodyId, flags);
      const lon = mod360(calc.xx[0]);

      let diff = lon - targetDegree;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      if (diff < 0) {
        low = mid;
      } else {
        high = mid;
      }
    }

    const finalUtc = new Date(low);
    const localMs = finalUtc.getTime() + tzOffset * 3600 * 1000;
    const localDate = new Date(localMs);

    const y = localDate.getUTCFullYear();
    const m = String(localDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(localDate.getUTCDate()).padStart(2, '0');
    const hh = String(localDate.getUTCHours()).padStart(2, '0');
    const mm = String(localDate.getUTCMinutes()).padStart(2, '0');

    return {
      dateStr: `${y}-${m}-${d}`,
      timeStr: `${hh}:${mm}`,
      dateObj: finalUtc
    };
  };

  const ingressItems: TransitTimelineItem[] = [];
  const tzOffset = options?.tzOffsetHours ?? 3;

  for (const b of TRANSIT_BODIES) {
    if (options?.categoryFilter === 'KADERSEL' && b.category !== 'Kadersel') continue;
    if (options?.categoryFilter === 'KISISEL' && b.category !== 'Kişisel') continue;

    const sampleSigns = dailySamples.map(s => Math.floor(s.positions[b.name] / 30) % 12);
    let segStartIdx = 0;

    while (segStartIdx < dailySamples.length) {
      const curSign = sampleSigns[segStartIdx];
      let segEndIdx = segStartIdx;
      while (segEndIdx + 1 < dailySamples.length && sampleSigns[segEndIdx + 1] === curSign) {
        segEndIdx++;
      }

      // Determine exact entry date/time for curSign
      let startMoment: { dateStr: string; timeStr: string; dateObj: Date } = {
        dateStr: dailySamples[segStartIdx].dateStr,
        timeStr: '00:00',
        dateObj: dailySamples[segStartIdx].date
      };
      if (segStartIdx === 0) {
        let backCur = new Date(dailySamples[0].date.getTime() - 3 * 24 * 3600 * 1000);
        let foundEntry = false;
        let steps = 0;
        while (steps < 120) {
          const lon = getBodyLonAtDate(backCur, b.id);
          const sign = Math.floor(lon / 30) % 12;
          if (sign !== curSign) {
            const nextDate = new Date(backCur.getTime() + 3 * 24 * 3600 * 1000);
            startMoment = findSignCrossingMoment(b.id, backCur, nextDate, curSign * 30.0, tzOffset);
            foundEntry = true;
            break;
          }
          backCur = new Date(backCur.getTime() - 3 * 24 * 3600 * 1000);
          steps++;
        }
        if (!foundEntry) {
          startMoment = {
            dateStr: dailySamples[0].dateStr,
            timeStr: '00:00',
            dateObj: dailySamples[0].date
          };
        }
      } else {
        const prevDate = dailySamples[segStartIdx - 1].date;
        const curDate = dailySamples[segStartIdx].date;
        startMoment = findSignCrossingMoment(b.id, prevDate, curDate, curSign * 30.0, tzOffset);
      }

      // Determine exact exit date/time for curSign
      let endMoment: { dateStr: string; timeStr: string; dateObj: Date } = {
        dateStr: dailySamples[segEndIdx].dateStr,
        timeStr: '23:59',
        dateObj: dailySamples[segEndIdx].date
      };
      if (segEndIdx === dailySamples.length - 1) {
        let fwdCur = new Date(dailySamples[dailySamples.length - 1].date.getTime() + 3 * 24 * 3600 * 1000);
        let foundExit = false;
        let steps = 0;
        while (steps < 120) {
          const lon = getBodyLonAtDate(fwdCur, b.id);
          const sign = Math.floor(lon / 30) % 12;
          if (sign !== curSign) {
            const prevDate = new Date(fwdCur.getTime() - 3 * 24 * 3600 * 1000);
            const exitTargetDegree = sign * 30.0;
            endMoment = findSignCrossingMoment(b.id, prevDate, fwdCur, exitTargetDegree, tzOffset);
            foundExit = true;
            break;
          }
          fwdCur = new Date(fwdCur.getTime() + 3 * 24 * 3600 * 1000);
          steps++;
        }
        if (!foundExit) {
          endMoment = {
            dateStr: dailySamples[dailySamples.length - 1].dateStr,
            timeStr: '23:59',
            dateObj: dailySamples[dailySamples.length - 1].date
          };
        }
      } else {
        const curDate = dailySamples[segEndIdx].date;
        const nextDate = dailySamples[segEndIdx + 1].date;
        const nextSign = sampleSigns[segEndIdx + 1];
        const exitTargetDegree = nextSign * 30.0;
        endMoment = findSignCrossingMoment(b.id, curDate, nextDate, exitTargetDegree, tzOffset);
      }

      // Midpoint / peak of sign
      const midMs = startMoment.dateObj.getTime() + Math.round((endMoment.dateObj.getTime() - startMoment.dateObj.getTime()) / 2);
      const midDateUtc = new Date(midMs);
      const localMidMs = midDateUtc.getTime() + tzOffset * 3600 * 1000;
      const localMid = new Date(localMidMs);
      const peakMoment = {
        dateStr: `${localMid.getUTCFullYear()}-${String(localMid.getUTCMonth() + 1).padStart(2, '0')}-${String(localMid.getUTCDate()).padStart(2, '0')}`,
        timeStr: `${String(localMid.getUTCHours()).padStart(2, '0')}:${String(localMid.getUTCMinutes()).padStart(2, '0')}`
      };

      const sTime = startMoment.dateObj.getTime();
      const eTime = endMoment.dateObj.getTime();

      if (eTime >= startDayTime && sTime <= endDayTime) {
        const signName = ZODIAC_SIGNS[curSign];
        const durationDays = Math.max(1, Math.round((eTime - sTime) / (1000 * 60 * 60 * 24)));
        const interp = getSkyPlanetSignInterpretation(b.name, signName, 0, 0, false, true);

        const now = Date.now();
        let status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' = 'ACTIVE';
        if (sTime > now) status = 'UPCOMING';
        else if (eTime < now) status = 'COMPLETED';

        const isStartedInPast = sTime < startDayTime;
        const isPeakInPast = midMs < startDayTime;

        let phase: 'YAKLASAN' | 'ZIRVE' | 'UZAKLASAN' = 'YAKLASAN';
        if (status === 'ACTIVE') phase = 'ZIRVE';
        else if (status === 'COMPLETED') phase = 'UZAKLASAN';

        ingressItems.push({
          id: `ingress-${b.name}-${signName}-${startMoment.dateStr}`,
          transitPlanet: b.name,
          natalPlanet: `${signName} Burcu`,
          type: 'İngress',
          isHarmonious: true,
          startDate: startMoment.dateStr,
          startTime: startMoment.timeStr,
          peakDate: peakMoment.dateStr,
          peakTime: peakMoment.timeStr,
          endDate: endMoment.dateStr,
          endTime: endMoment.timeStr,
          minOrb: 0,
          category: b.category,
          title: `${b.name} → ${signName} Burcu Geçişi`,
          summary: interp.summary || `${b.name} ${signName} burcunda seyrediyor.`,
          details: interp.content || `${signName} burcundaki bu geçiş, kolektif alanda önemli etkiler başlatır.`,
          advice: interp.advice || 'Bu burç geçişinde farkındalıkla hareket edin.',
          chakraLayer: interp.extra || getChakraLayer(b.name, signName),
          durationDays,
          status,
          phase,
          isStartedInPast,
          isPeakInPast
        });
      }

      segStartIdx = segEndIdx + 1;
    }
  }

  timelineItems.push(...ingressItems);

  // Sort: Active first, Kadersel first, then by peakDate
  return timelineItems.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category === 'Kadersel' ? -1 : 1;
    }
    return new Date(a.peakDate).getTime() - new Date(b.peakDate).getTime();
  });
}

