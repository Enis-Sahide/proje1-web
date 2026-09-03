import { Constants } from '@fusionstrings/swisseph-wasi';
import { getSwe } from './AstrologyEngine';
import { AstroPoint } from './AstrologyConstants';

export interface TransitTimelineItem {
  id: string;
  transitPlanet: string;
  natalPlanet: string;
  type: 'Kavuşum' | 'Karşıt' | 'Kare' | 'Üçgen' | 'Sekstil';
  isHarmonious: boolean;
  startDate: string; // YYYY-MM-DD
  peakDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
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
  'Jüpiter': 120,
  'Mars': 45,
  'Güneş': 30,
  'Venüs': 30,
  'Merkür': 30,
};

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

              if (bOrb <= aspect.maxOrb) {
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

              if (fOrb <= aspect.maxOrb) {
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
          // If they happen to fall on the same date, find the interior minimum between sD and eD
          if (pD.getTime() === sD.getTime() && eD.getTime() > sD.getTime()) {
            const midTime = sD.getTime() + Math.round((eD.getTime() - sD.getTime()) / 2);
            pD = new Date(midTime);
          }

          const sTime = sD.getTime();
          const eTime = eD.getTime();

          // Interval must overlap with the user requested [startDate, endDate] window
          if (eTime >= startDayTime && sTime <= endDayTime) {
            const durationDays = Math.max(1, Math.round((eTime - sTime) / (1000 * 60 * 60 * 24)));
            const interp = getInterpretationDetails(tBody.name, nPlanet.name, aspect.name);
            const startStr = formatDate(sD);
            const peakStr = formatDate(pD);
            const endStr = formatDate(eD);

            const isStartedInPast = sTime < startDayTime;
            const isPeakInPast = pD.getTime() < startDayTime;

            let status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' = 'ACTIVE';
            if (sTime > startDayTime) status = 'UPCOMING';
            else if (eTime < startDayTime) status = 'COMPLETED';

            let phase: 'YAKLASAN' | 'ZIRVE' | 'UZAKLASAN' = 'YAKLASAN';
            if (peakStr === formatDate(startDate)) phase = 'ZIRVE';
            else if (isPeakInPast) phase = 'UZAKLASAN';
            else phase = 'YAKLASAN';

            timelineItems.push({
              id: `${tBody.name}-${aspect.name}-${nPlanet.name}-${startStr}`,
              transitPlanet: tBody.name,
              natalPlanet: nPlanet.name,
              type: aspect.name,
              isHarmonious: aspect.isHarmonious,
              startDate: startStr,
              peakDate: peakStr,
              endDate: endStr,
              minOrb: Number(bestOrb.toFixed(2)),
              category: tBody.category,
              title: `Transit ${tBody.name} ${aspect.name} Natal ${nPlanet.name}`,
              summary: interp.summary,
              details: interp.details,
              advice: interp.advice,
              chakraLayer: getChakraLayer(tBody.name, nPlanet.name),
              durationDays,
              status,
              phase,
              isStartedInPast,
              isPeakInPast
            });
          }
        };

        for (let i = 0; i < samples.length; i++) {
          const sample = samples[i];
          const orb = getAngularDifference(sample.lon, nPlanet.longitude, aspect.angle);
          const isInside = orb <= aspect.maxOrb;

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

  // Sort timeline items:
  // 1. Kadersel (outer) planets first, then Kişisel
  // 2. Active now, then Upcoming
  // 3. Chronologically by peakDate
  return timelineItems.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category === 'Kadersel' ? -1 : 1;
    }
    return new Date(a.peakDate).getTime() - new Date(b.peakDate).getTime();
  });
}
