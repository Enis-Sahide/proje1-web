import { SwissEph, Constants } from '@fusionstrings/swisseph-wasi';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import { AstroCity, ASTRO_CITIES, ZODIAC_SIGNS, ZodiacSign, NatalChartData } from './AstrologyConstants';
import { generateAstrologyChart, getSignAndDegree } from './AstrologyEngine';

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

let sweInstance: SwissEph | null = null;
async function getSwe(): Promise<SwissEph> {
  if (sweInstance) return sweInstance;
  const wasmPath = path.join(process.cwd(), 'public', 'wasm', 'libswephe.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const module = new WebAssembly.Module(wasmBuffer);
  const swe = new SwissEph(module);

  const filesToMount = ['sepl_18.se1', 'semo_18.se1', 'seas_18.se1'];
  for (const filename of filesToMount) {
    const filePath = path.join(process.cwd(), 'public', 'ephe', filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      swe.mount(filename, content);
    }
  }
  swe.set_ephe_path('.');
  sweInstance = swe;
  return sweInstance;
}

export type EventType =
  | 'marriage'
  | 'divorce'
  | 'child_birth'
  | 'death_relative'
  | 'accident_surgery'
  | 'career_promotion'
  | 'relocation'
  | 'graduation'
  | 'financial_crisis'
  | 'spiritual_awakening';

export interface LifeEvent {
  id: string;
  type: EventType;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface PhysicalProfile {
  bodyType?: 'slender' | 'athletic' | 'stocky' | 'petite' | 'curvy';
  elementTemperament?: 'fire' | 'earth' | 'air' | 'water';
  vulnerabilityArea?: string;
}

export interface RectificationInput {
  dateMode?: 'exact' | 'month' | 'season';
  birthDate?: string; // YYYY-MM-DD (Tam tarih modunda)
  birthYear?: number;
  birthMonth?: number; // 1-12
  birthSeason?: 'spring' | 'summer' | 'autumn' | 'winter';
  birthCity: string | AstroCity;
  timeWindow?: {
    startHour: number; // 0-24
    endHour: number;   // 0-24
  };
  profile?: PhysicalProfile;
  events: LifeEvent[];
}

export interface EventMatchDetail {
  eventId: string;
  eventTitle: string;
  technique: 'Solar Arc' | 'İkincil İlerletim' | 'Transit';
  aspect: string;
  matchedPoint: string;
  orb: number;
  score: number;
  explanation: string;
}

export interface CandidateScore {
  timeStr: string;
  hour: number;
  minute: number;
  second: number;
  ascDegree: number;
  ascSign: string;
  mcDegree: number;
  mcSign: string;
  totalScore: number;
  confidencePercent: number;
  eventMatches: EventMatchDetail[];
  temperamentMatchScore: number;
}

export interface TimelinePoint {
  timeStr: string;
  hour: number;
  minute: number;
  score: number;
  probabilityPercent: number;
  ascSign: string;
  ascDegree: number;
  mcSign: string;
  mcDegree: number;
  topMatchExplanation?: string;
}

export interface DayCandidate {
  dateStr: string;
  day: number;
  month: number;
  year: number;
  score: number;
  probabilityPercent: number;
  sunSign: string;
  moonSign: string;
}

export interface RectificationResult {
  isDateRangeMode: boolean;
  selectedDateStr: string;
  topDateCandidates?: DayCandidate[];
  dayTimelinePoints?: DayCandidate[];
  bestCandidate: CandidateScore;
  topCandidates: CandidateScore[];
  timelinePoints: TimelinePoint[];
  chartData: NatalChartData;
  totalEventsProcessed: number;
  methodologyNote: string;
}

interface AxisAffinity {
  targetAngleKeys: ('ASC' | 'DSC' | 'MC' | 'IC' | 'H5' | 'H9' | 'H8')[];
  planets: string[];
  aspectTypes: number[];
  primaryWeight: number;
}

const STRICT_EVENT_AFFINITY: Record<EventType, AxisAffinity> = {
  marriage: {
    targetAngleKeys: ['DSC', 'ASC', 'MC'],
    planets: ['Venüs', 'Jüpiter', 'Güneş', 'Ay'],
    aspectTypes: [0, 60, 120, 180],
    primaryWeight: 1.5
  },
  divorce: {
    targetAngleKeys: ['DSC', 'ASC', 'H8'],
    planets: ['Uranüs', 'Satürn', 'Mars', 'Plüton'],
    aspectTypes: [0, 90, 180],
    primaryWeight: 1.5
  },
  child_birth: {
    targetAngleKeys: ['H5', 'IC', 'ASC'],
    planets: ['Jüpiter', 'Ay', 'Venüs', 'Güneş'],
    aspectTypes: [0, 60, 120, 180],
    primaryWeight: 1.5
  },
  death_relative: {
    targetAngleKeys: ['IC', 'MC', 'H8'],
    planets: ['Satürn', 'Plüton', 'Mars', 'Ay', 'Güneş'],
    aspectTypes: [0, 90, 180],
    primaryWeight: 1.5
  },
  career_promotion: {
    targetAngleKeys: ['MC', 'ASC'],
    planets: ['Güneş', 'Jüpiter', 'Satürn', 'Mars', 'Merkür'],
    aspectTypes: [0, 60, 120, 180],
    primaryWeight: 1.6
  },
  relocation: {
    targetAngleKeys: ['IC', 'H9'],
    planets: ['Uranüs', 'Jüpiter', 'Ay', 'Merkür'],
    aspectTypes: [0, 60, 90, 120, 180],
    primaryWeight: 1.4
  },
  accident_surgery: {
    targetAngleKeys: ['ASC', 'H8'],
    planets: ['Mars', 'Uranüs', 'Satürn', 'Plüton'],
    aspectTypes: [0, 90, 180],
    primaryWeight: 1.6
  },
  financial_crisis: {
    targetAngleKeys: ['MC', 'IC', 'ASC'],
    planets: ['Satürn', 'Plüton', 'Mars', 'Uranüs'],
    aspectTypes: [0, 90, 180],
    primaryWeight: 1.4
  },
  graduation: {
    targetAngleKeys: ['H9', 'MC'],
    planets: ['Jüpiter', 'Merkür', 'Güneş', 'Satürn'],
    aspectTypes: [0, 60, 120],
    primaryWeight: 1.3
  },
  spiritual_awakening: {
    targetAngleKeys: ['ASC', 'IC', 'MC'],
    planets: ['Neptün', 'Uranüs', 'Plüton', 'Jüpiter'],
    aspectTypes: [0, 60, 120, 180],
    primaryWeight: 1.3
  }
};

const ELEMENT_SIGNS: Record<string, string[]> = {
  fire: ['Koç', 'Aslan', 'Yay'],
  earth: ['Boğa', 'Başak', 'Oğlak'],
  air: ['İkizler', 'Terazi', 'Kova'],
  water: ['Yengeç', 'Akrep', 'Balık']
};

export async function runAutomatedRectification(input: RectificationInput): Promise<RectificationResult> {
  const swe = await getSwe();
  
  const cityInput = input.birthCity;
  const cityName = typeof cityInput === 'string' ? cityInput : (cityInput && typeof cityInput === 'object' ? cityInput.name : 'İstanbul');
  const city = ASTRO_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase()) || ASTRO_CITIES[0];
  const tzName = city.tz || 'Europe/Istanbul';

  const dateMode = input.dateMode || 'exact';
  let targetDates: string[] = [];

  if (dateMode === 'exact') {
    targetDates = [input.birthDate || '1992-06-15'];
  } else if (dateMode === 'month') {
    const y = input.birthYear || 1991;
    const m = input.birthMonth || 4;
    const daysInMonth = new Date(y, m, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      targetDates.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
  } else if (dateMode === 'season') {
    const y = input.birthYear || 1991;
    const season = input.birthSeason || 'spring';
    let startM = 3, endM = 5;
    if (season === 'summer') { startM = 6; endM = 8; }
    else if (season === 'autumn') { startM = 9; endM = 11; }
    else if (season === 'winter') { startM = 12; endM = 2; }

    if (season === 'winter') {
      // 1-31 Dec of year, 1-28 Feb of next year or same year
      for (let d = 1; d <= 31; d++) targetDates.push(`${y}-12-${String(d).padStart(2, '0')}`);
      for (let d = 1; d <= 31; d++) targetDates.push(`${y}-01-${String(d).padStart(2, '0')}`);
      for (let d = 1; d <= 28; d++) targetDates.push(`${y}-02-${String(d).padStart(2, '0')}`);
    } else {
      for (let m = startM; m <= endM; m++) {
        const daysInM = new Date(y, m, 0).getDate();
        for (let d = 1; d <= daysInM; d++) {
          targetDates.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
        }
      }
    }
  }

  // 1. EĞER TARİH ARALIĞI MODUNDAYSA: GÜNLERİ TARA VE EN İYİ GÜNLERİ BUL
  const dayEvaluations: DayCandidate[] = [];

  for (const dateStr of targetDates) {
    const [dYear, dMonth, dDay] = dateStr.split('-').map(Number);
    const momentBirth = moment.tz(`${dateStr} 12:00:00`, tzName);
    const tzOffsetHours = momentBirth.utcOffset() / 60.0;
    const noonJd = swe.swe_julday(dYear, dMonth, dDay, 12.0 - tzOffsetHours, Constants.SE_GREG_CAL);
    
    const noonSun = mod360(swe.swe_calc_ut(noonJd, Constants.SE_SUN, Constants.SEFLG_SWIEPH).xx[0]);
    const noonMoon = mod360(swe.swe_calc_ut(noonJd, Constants.SE_MOON, Constants.SEFLG_SWIEPH).xx[0]);
    const sunSign = getSignAndDegree(noonSun).sign;
    const moonSign = getSignAndDegree(noonMoon).sign;

    let dayScore = 0;

    // Mizaç ve Güneş/Ay burcu uyumu
    if (input.profile?.elementTemperament) {
      const allowed = ELEMENT_SIGNS[input.profile.elementTemperament] || [];
      if (allowed.includes(sunSign)) dayScore += 60;
      if (allowed.includes(moonSign)) dayScore += 40;
    }

    // Olayların Solar Arc ve transit uyumu
    for (const ev of input.events) {
      const [eYear, eMonth, eDay] = ev.date.split('-').map(Number);
      const evMoment = moment.tz(`${ev.date} 12:00:00`, tzName);
      const evJd = swe.swe_julday(eYear, eMonth, eDay, 12.0 - (evMoment.utcOffset() / 60.0), Constants.SE_GREG_CAL);
      const ageInYears = (evJd - noonJd) / 365.242199;
      const arc = ageInYears * 0.985647;

      const progSun = mod360(noonSun + arc);
      const trJupiter = mod360(swe.swe_calc_ut(evJd, Constants.SE_JUPITER, Constants.SEFLG_SWIEPH).xx[0]);
      const trSaturn = mod360(swe.swe_calc_ut(evJd, Constants.SE_SATURN, Constants.SEFLG_SWIEPH).xx[0]);

      // Güneş ve Ay'a major transitler
      for (const trP of [trJupiter, trSaturn]) {
        for (const asp of [0, 60, 90, 120, 180]) {
          const diffSun = Math.abs(mod360(trP - noonSun) - asp);
          const orbSun = Math.min(diffSun, Math.abs(360 - diffSun));
          if (orbSun <= 2.5) {
            dayScore += Math.round(50 * Math.exp(-0.5 * Math.pow(orbSun / 0.9, 2)));
          }

          const diffMoon = Math.abs(mod360(trP - noonMoon) - asp);
          const orbMoon = Math.min(diffMoon, Math.abs(360 - diffMoon));
          if (orbMoon <= 3.0) {
            dayScore += Math.round(40 * Math.exp(-0.5 * Math.pow(orbMoon / 1.0, 2)));
          }
        }
      }
    }

    dayEvaluations.push({
      dateStr,
      day: dDay,
      month: dMonth,
      year: dYear,
      score: dayScore,
      probabilityPercent: 0,
      sunSign,
      moonSign
    });
  }

  const maxDayScore = Math.max(1, ...dayEvaluations.map(d => d.score));
  for (const d of dayEvaluations) {
    d.probabilityPercent = Number(((d.score / maxDayScore) * 100).toFixed(1));
  }

  const sortedDays = [...dayEvaluations].sort((a, b) => b.score - a.score);
  const bestDay = sortedDays[0] || dayEvaluations[0];
  const topDateCandidates = sortedDays.slice(0, 3);

  // 2. EN İYİ GÜN ÜZERİNDEN 24 SAATLİK DİLİMİ TARA
  const finalBirthDate = dateMode === 'exact' ? (input.birthDate || '1992-06-15') : bestDay.dateStr;
  const [bYear, bMonth, bDay] = finalBirthDate.split('-').map(Number);
  
  const momentBirth = moment.tz(`${finalBirthDate} 12:00:00`, tzName);
  const tzOffsetHours = momentBirth.utcOffset() / 60.0;

  const startH = input.timeWindow?.startHour ?? 0;
  const endH = input.timeWindow?.endHour ?? 24;

  const baseJd = swe.swe_julday(bYear, bMonth, bDay, 12.0 - tzOffsetHours, Constants.SE_GREG_CAL);
  const baseSun = mod360(swe.swe_calc_ut(baseJd, Constants.SE_SUN, Constants.SEFLG_SWIEPH).xx[0]);

  const eventCalculations: Array<{
    event: LifeEvent;
    arcDegree: number;
    progMoonLon: number;
    eventTransitPlanets: Record<string, number>;
  }> = [];

  for (const ev of input.events) {
    const [eYear, eMonth, eDay] = ev.date.split('-').map(Number);
    const eventMoment = moment.tz(`${ev.date} 12:00:00`, tzName);
    const eventTzOffset = eventMoment.utcOffset() / 60.0;
    const eventJd = swe.swe_julday(eYear, eMonth, eDay, 12.0 - eventTzOffset, Constants.SE_GREG_CAL);
    
    const ageInDays = eventJd - baseJd;
    const ageInYears = ageInDays / 365.242199;
    const progJd = baseJd + ageInYears;

    const progSun = mod360(swe.swe_calc_ut(progJd, Constants.SE_SUN, Constants.SEFLG_SWIEPH).xx[0]);
    const progMoon = mod360(swe.swe_calc_ut(progJd, Constants.SE_MOON, Constants.SEFLG_SWIEPH).xx[0]);

    let trueSolarArc = mod360(progSun - baseSun);
    if (trueSolarArc > 180 && ageInYears < 100) {
      trueSolarArc = ageInYears * 0.985647;
    }

    const transitPlanets: Record<string, number> = {};
    const checkPlanets = [
      { name: 'Jüpiter', id: Constants.SE_JUPITER },
      { name: 'Satürn', id: Constants.SE_SATURN },
      { name: 'Uranüs', id: Constants.SE_URANUS },
      { name: 'Neptün', id: Constants.SE_NEPTUNE },
      { name: 'Plüton', id: Constants.SE_PLUTO },
      { name: 'Mars', id: Constants.SE_MARS },
      { name: 'Venüs', id: Constants.SE_VENUS }
    ];

    for (const p of checkPlanets) {
      const pos = swe.swe_calc_ut(eventJd, p.id, Constants.SEFLG_SWIEPH).xx[0];
      transitPlanets[p.name] = mod360(pos);
    }

    eventCalculations.push({
      event: ev,
      arcDegree: trueSolarArc,
      progMoonLon: progMoon,
      eventTransitPlanets: transitPlanets
    });
  }

  const rawPoints: TimelinePoint[] = [];
  const candidateScoresMap: Map<string, CandidateScore> = new Map();

  const startMinute = Math.round(startH * 60);
  const endMinute = Math.min(1440, Math.round(endH * 60));

  for (let m = startMinute; m <= endMinute; m += 4) {
    const hourVal = m / 60.0;
    const utcHour = hourVal - tzOffsetHours;
    let calcDay = bDay;
    let calcUtcHour = utcHour;
    if (calcUtcHour < 0) {
      calcUtcHour += 24;
      calcDay -= 1;
    } else if (calcUtcHour >= 24) {
      calcUtcHour -= 24;
      calcDay += 1;
    }

    const jd = swe.swe_julday(bYear, bMonth, calcDay, calcUtcHour, Constants.SE_GREG_CAL);
    const { cusps, ascmc } = swe.swe_houses(jd, city.lat, city.lon, 'P'.charCodeAt(0));

    const ascDeg = mod360(ascmc[0]);
    const mcDeg = mod360(ascmc[1]);
    const dscDeg = mod360(ascDeg + 180);
    const icDeg = mod360(mcDeg + 180);
    const h5Deg = mod360(cusps[5]);
    const h8Deg = mod360(cusps[8]);
    const h9Deg = mod360(cusps[9]);

    const angleMap: Record<string, { name: string; pos: number }> = {
      ASC: { name: 'Yükselen (ASC)', pos: ascDeg },
      MC: { name: 'Tepe Noktası (MC)', pos: mcDeg },
      DSC: { name: 'Alçalan / 7. Ev (DSC)', pos: dscDeg },
      IC: { name: 'Dip Noktası / 4. Ev (IC)', pos: icDeg },
      H5: { name: '5. Ev Başlangıcı', pos: h5Deg },
      H8: { name: '8. Ev Başlangıcı', pos: h8Deg },
      H9: { name: '9. Ev Başlangıcı', pos: h9Deg }
    };

    const ascSignData = getSignAndDegree(ascDeg);
    const mcSignData = getSignAndDegree(mcDeg);

    const natalPlanets: Record<string, number> = {};
    const nList = [
      { name: 'Güneş', id: Constants.SE_SUN },
      { name: 'Ay', id: Constants.SE_MOON },
      { name: 'Merkür', id: Constants.SE_MERCURY },
      { name: 'Venüs', id: Constants.SE_VENUS },
      { name: 'Mars', id: Constants.SE_MARS },
      { name: 'Jüpiter', id: Constants.SE_JUPITER },
      { name: 'Satürn', id: Constants.SE_SATURN },
      { name: 'Uranüs', id: Constants.SE_URANUS },
      { name: 'Neptün', id: Constants.SE_NEPTUNE },
      { name: 'Plüton', id: Constants.SE_PLUTO }
    ];

    for (const p of nList) {
      natalPlanets[p.name] = mod360(swe.swe_calc_ut(jd, p.id, Constants.SEFLG_SWIEPH).xx[0]);
    }

    let candidateTotalScore = 0;
    const matches: EventMatchDetail[] = [];
    let matchedEventsCount = 0;

    let temperamentScore = 0;
    if (input.profile?.elementTemperament) {
      const allowedSigns = ELEMENT_SIGNS[input.profile.elementTemperament] || [];
      if (allowedSigns.includes(ascSignData.sign)) {
        temperamentScore += 25;
      }
    }
    candidateTotalScore += temperamentScore;

    for (const evCalc of eventCalculations) {
      const affinity = STRICT_EVENT_AFFINITY[evCalc.event.type] || {
        targetAngleKeys: ['ASC', 'MC', 'DSC', 'IC'],
        planets: ['Güneş', 'Jüpiter', 'Satürn'],
        aspectTypes: [0, 60, 90, 120, 180],
        primaryWeight: 1.0
      };

      const targetAngles = affinity.targetAngleKeys.map(k => angleMap[k]).filter(Boolean);
      let bestEventMatchScore = 0;
      let bestMatchDetail: EventMatchDetail | null = null;

      // 1. Çift Yönlü Solar Arc
      for (const pName of affinity.planets) {
        const natalP = natalPlanets[pName];
        if (natalP === undefined) continue;

        const dirPlanet = mod360(natalP + evCalc.arcDegree);
        for (const ang of targetAngles) {
          for (const aspDeg of affinity.aspectTypes) {
            const diff = Math.abs(mod360(dirPlanet - ang.pos) - aspDeg);
            const orb = Math.min(diff, Math.abs(360 - diff));

            if (orb <= 2.5) {
              const gaussianWeight = Math.exp(-0.5 * Math.pow(orb / 0.9, 2));
              const score = Math.round(130 * affinity.primaryWeight * gaussianWeight);

              if (score > bestEventMatchScore) {
                bestEventMatchScore = score;
                const aspectName = aspDeg === 0 ? 'Kavuşum' : aspDeg === 90 ? 'Kare' : aspDeg === 120 ? 'Üçgen' : aspDeg === 180 ? 'Karşıt' : `${aspDeg}°`;
                bestMatchDetail = {
                  eventId: evCalc.event.id,
                  eventTitle: evCalc.event.title,
                  technique: 'Solar Arc',
                  aspect: aspectName,
                  matchedPoint: `İlerletilmiş ${pName} -> ${ang.name}`,
                  orb: Number(orb.toFixed(2)),
                  score,
                  explanation: `${evCalc.event.title} tarihinde Solar Arc ilerletimli ${pName}, kadersel ekseniniz olan ${ang.name} noktasına ${orb.toFixed(2)}° orb ile ${aspectName} yaptı.`
                };
              }
            }
          }
        }

        for (const ang of targetAngles) {
          const dirAng = mod360(ang.pos + evCalc.arcDegree);
          for (const aspDeg of affinity.aspectTypes) {
            const diff = Math.abs(mod360(dirAng - natalP) - aspDeg);
            const orb = Math.min(diff, Math.abs(360 - diff));

            if (orb <= 2.5) {
              const gaussianWeight = Math.exp(-0.5 * Math.pow(orb / 0.9, 2));
              const score = Math.round(110 * affinity.primaryWeight * gaussianWeight);

              if (score > bestEventMatchScore) {
                bestEventMatchScore = score;
                const aspectName = aspDeg === 0 ? 'Kavuşum' : aspDeg === 90 ? 'Kare' : aspDeg === 120 ? 'Üçgen' : aspDeg === 180 ? 'Karşıt' : `${aspDeg}°`;
                bestMatchDetail = {
                  eventId: evCalc.event.id,
                  eventTitle: evCalc.event.title,
                  technique: 'Solar Arc',
                  aspect: aspectName,
                  matchedPoint: `İlerletilmiş ${ang.name} -> Natal ${pName}`,
                  orb: Number(orb.toFixed(2)),
                  score,
                  explanation: `${evCalc.event.title} tarihinde Solar Arc ilerletimli ${ang.name} ile Natal ${pName} arasında ${orb.toFixed(2)}° orb ile ${aspectName} gerçekleşti.`
                };
              }
            }
          }
        }
      }

      // 2. İkincil İlerletilmiş Ay
      for (const ang of targetAngles) {
        for (const aspDeg of [0, 60, 90, 120, 180]) {
          const diff = Math.abs(mod360(evCalc.progMoonLon - ang.pos) - aspDeg);
          const orb = Math.min(diff, Math.abs(360 - diff));

          if (orb <= 2.2) {
            const gaussianWeight = Math.exp(-0.5 * Math.pow(orb / 0.9, 2));
            const score = Math.round(95 * affinity.primaryWeight * gaussianWeight);

            if (score > bestEventMatchScore) {
              bestEventMatchScore = score;
              const aspectName = aspDeg === 0 ? 'Kavuşum' : aspDeg === 90 ? 'Kare' : aspDeg === 120 ? 'Üçgen' : aspDeg === 180 ? 'Karşıt' : `${aspDeg}°`;
              bestMatchDetail = {
                eventId: evCalc.event.id,
                eventTitle: evCalc.event.title,
                technique: 'İkincil İlerletim',
                aspect: aspectName,
                matchedPoint: `Progresif Ay -> ${ang.name}`,
                orb: Number(orb.toFixed(2)),
                score,
                explanation: `${evCalc.event.title} tarihinde İkincil İlerletilmiş Ay, ${ang.name} eksenine ${orb.toFixed(2)}° orb ile ${aspectName} teması yaptı.`
              };
            }
          }
        }
      }

      // 3. Transitler
      for (const pName of affinity.planets) {
        const trPos = evCalc.eventTransitPlanets[pName];
        if (trPos === undefined) continue;

        for (const ang of targetAngles) {
          for (const aspDeg of affinity.aspectTypes) {
            const diff = Math.abs(mod360(trPos - ang.pos) - aspDeg);
            const orb = Math.min(diff, Math.abs(360 - diff));

            if (orb <= 2.2) {
              const gaussianWeight = Math.exp(-0.5 * Math.pow(orb / 0.9, 2));
              const score = Math.round(85 * affinity.primaryWeight * gaussianWeight);

              if (score > bestEventMatchScore) {
                bestEventMatchScore = score;
                const aspectName = aspDeg === 0 ? 'Kavuşum' : aspDeg === 90 ? 'Kare' : aspDeg === 120 ? 'Üçgen' : aspDeg === 180 ? 'Karşıt' : `${aspDeg}°`;
                bestMatchDetail = {
                  eventId: evCalc.event.id,
                  eventTitle: evCalc.event.title,
                  technique: 'Transit',
                  aspect: aspectName,
                  matchedPoint: `Transit ${pName} -> ${ang.name}`,
                  orb: Number(orb.toFixed(2)),
                  score,
                  explanation: `${evCalc.event.title} tarihinde Transit ${pName}, ${ang.name} eksenine ${orb.toFixed(2)}° orb ile ${aspectName} teması yaptı.`
                };
              }
            }
          }
        }
      }

      if (bestMatchDetail) {
        matches.push(bestMatchDetail);
        candidateTotalScore += bestEventMatchScore;
        matchedEventsCount++;
      }
    }

    const curH = Math.floor(m / 60);
    const curM = m % 60;
    const timeStr = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}:00`;

    const matchRatio = eventCalculations.length > 0 ? matchedEventsCount / eventCalculations.length : 0;
    let confidencePercent = Math.min(99.8, Number((82 + (matchRatio * 17.8)).toFixed(1)));
    if (eventCalculations.length < 3) {
      confidencePercent = Math.min(88, Number((50 + matchRatio * 38).toFixed(1)));
    }

    const candidateObj: CandidateScore = {
      timeStr,
      hour: curH,
      minute: curM,
      second: 0,
      ascDegree: ascDeg,
      ascSign: ascSignData.sign,
      mcDegree: mcDeg,
      mcSign: mcSignData.sign,
      totalScore: candidateTotalScore,
      confidencePercent,
      eventMatches: matches,
      temperamentMatchScore: temperamentScore
    };

    candidateScoresMap.set(`${curH}:${curM}`, candidateObj);

    rawPoints.push({
      timeStr: `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}`,
      hour: curH,
      minute: curM,
      score: candidateTotalScore,
      probabilityPercent: 0,
      ascSign: ascSignData.sign,
      ascDegree: Number(ascDeg.toFixed(1)),
      mcSign: mcSignData.sign,
      mcDegree: Number(mcDeg.toFixed(1)),
      topMatchExplanation: matches[0]?.explanation
    });
  }

  // GAUSS DALGA DÜZLEŞTİRME FİLTRESİ
  const smoothedPoints: TimelinePoint[] = rawPoints.map(pt => ({ ...pt }));
  const sigmaMinutes = 20;
  const stepMinutes = 4;
  const radiusSteps = Math.ceil((2.5 * sigmaMinutes) / stepMinutes);

  for (let i = 0; i < rawPoints.length; i++) {
    let weightSum = 0;
    let valueSum = 0;

    for (let j = Math.max(0, i - radiusSteps); j <= Math.min(rawPoints.length - 1, i + radiusSteps); j++) {
      const distMin = (j - i) * stepMinutes;
      const weight = Math.exp(-0.5 * Math.pow(distMin / sigmaMinutes, 2));
      weightSum += weight;
      valueSum += rawPoints[j].score * weight;
    }

    smoothedPoints[i].score = weightSum > 0 ? valueSum / weightSum : rawPoints[i].score;
  }

  const maxSmoothedScore = Math.max(1, ...smoothedPoints.map(p => p.score));
  for (const pt of smoothedPoints) {
    pt.probabilityPercent = Number(((pt.score / maxSmoothedScore) * 100).toFixed(1));
  }

  // DÜZLEŞTİRİLMİŞ DALGA ÜZERİNDEKİ GERÇEK TEPE NOKTALARI
  const crestCandidates: CandidateScore[] = [];
  for (let i = 1; i < smoothedPoints.length - 1; i++) {
    const prev = smoothedPoints[i - 1].probabilityPercent;
    const curr = smoothedPoints[i].probabilityPercent;
    const next = smoothedPoints[i + 1].probabilityPercent;

    if (curr >= prev && curr >= next && curr > 25) {
      const pt = smoothedPoints[i];
      const cand = candidateScoresMap.get(`${pt.hour}:${pt.minute}`) || {
        timeStr: `${pt.timeStr}:00`,
        hour: pt.hour,
        minute: pt.minute,
        second: 0,
        ascDegree: pt.ascDegree,
        ascSign: pt.ascSign,
        mcDegree: pt.mcDegree,
        mcSign: pt.mcSign,
        totalScore: Math.round(pt.score),
        confidencePercent: Math.min(99.4, Number((75 + (curr / 100) * 24.4).toFixed(1))),
        eventMatches: [],
        temperamentMatchScore: 0
      };
      cand.confidencePercent = Math.min(99.4, Number((75 + (curr / 100) * 24.4).toFixed(1)));
      crestCandidates.push(cand);
    }
  }

  crestCandidates.sort((a, b) => b.totalScore - a.totalScore);
  const finalProminentPeaks: CandidateScore[] = [];

  for (const cand of crestCandidates) {
    const isClose = finalProminentPeaks.some(p => Math.abs((p.hour * 60 + p.minute) - (cand.hour * 60 + cand.minute)) < 60);
    if (!isClose) {
      finalProminentPeaks.push(cand);
    }
    if (finalProminentPeaks.length >= 4) break;
  }

  if (finalProminentPeaks.length === 0) {
    const bestRaw = [...candidateScoresMap.values()].sort((a, b) => b.totalScore - a.totalScore)[0];
    if (bestRaw) finalProminentPeaks.push(bestRaw);
  }

  const best = finalProminentPeaks[0] || {
    timeStr: "12:00:00",
    hour: 12,
    minute: 0,
    second: 0,
    ascDegree: 0,
    ascSign: 'Koç',
    mcDegree: 90,
    mcSign: 'Oğlak',
    totalScore: 0,
    confidencePercent: 50,
    eventMatches: [],
    temperamentMatchScore: 0
  };

  const finalLocalHours = best.hour + (best.minute / 60.0) - tzOffsetHours;
  let finalDay = bDay;
  let finalUtcHour = finalLocalHours;
  if (finalUtcHour < 0) {
    finalUtcHour += 24;
    finalDay -= 1;
  } else if (finalUtcHour >= 24) {
    finalUtcHour -= 24;
    finalDay += 1;
  }

  const birthDateObj = new Date(Date.UTC(bYear, bMonth - 1, finalDay, Math.floor(finalUtcHour), Math.round((finalUtcHour % 1) * 60)));
  const chartData = await generateAstrologyChart(birthDateObj, city);

  return {
    isDateRangeMode: dateMode !== 'exact',
    selectedDateStr: finalBirthDate,
    topDateCandidates: dateMode !== 'exact' ? topDateCandidates : undefined,
    dayTimelinePoints: dateMode !== 'exact' ? dayEvaluations : undefined,
    bestCandidate: best,
    topCandidates: finalProminentPeaks,
    timelinePoints: smoothedPoints,
    chartData,
    totalEventsProcessed: input.events.length,
    methodologyNote: `Bu rektifikasyon analizi; ${dateMode !== 'exact' ? `${targetDates.length} günlük tarih aralığını ve ` : ''}seçili zaman dilimini Gauss rezonans filtresi ile tarayarak kadersel olaylarla en yüksek korelasyona sahip doğum tarihi ve saatini tespit etmiştir.`
  };
}
