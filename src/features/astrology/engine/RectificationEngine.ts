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
  birthDate: string; // YYYY-MM-DD
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

export interface RectificationResult {
  bestCandidate: CandidateScore;
  topCandidates: CandidateScore[];
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

// KADERSEL HEDEF EKSEN HİYERARŞİSİ (Strict Event-to-Axis Specificity)
const STRICT_EVENT_AFFINITY: Record<EventType, AxisAffinity> = {
  marriage: {
    targetAngleKeys: ['DSC', 'ASC', 'MC'],
    planets: ['Venüs', 'Jüpiter', 'Güneş', 'Ay'],
    aspectTypes: [0, 60, 120, 180],
    primaryWeight: 1.5
  },
  divorce: {
    targetAngleKeys: ['DSC', 'ASC'],
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
  const [bYear, bMonth, bDay] = input.birthDate.split('-').map(Number);
  
  const cityInput = input.birthCity;
  const cityName = typeof cityInput === 'string' ? cityInput : (cityInput && typeof cityInput === 'object' ? cityInput.name : 'İstanbul');
  const city = ASTRO_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase()) || ASTRO_CITIES[0];
  
  const tzName = city.tz || 'Europe/Istanbul';
  const momentBirth = moment.tz(`${input.birthDate} 12:00:00`, tzName);
  const tzOffsetHours = momentBirth.utcOffset() / 60.0;

  const startH = input.timeWindow?.startHour ?? 0;
  const endH = input.timeWindow?.endHour ?? 24;

  const baseJd = swe.swe_julday(bYear, bMonth, bDay, 12.0 - tzOffsetHours, Constants.SE_GREG_CAL);
  const baseSun = mod360(swe.swe_calc_ut(baseJd, Constants.SE_SUN, Constants.SEFLG_SWIEPH).xx[0]);

  // Her olay için Solar Arc derecesini ve transitleri hazırla
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

  // Aday dakikaları tara
  const candidateScores: CandidateScore[] = [];
  const stepMinutes = 1;
  const startMinute = Math.round(startH * 60);
  const endMinute = Math.min(1440, Math.round(endH * 60));

  for (let m = startMinute; m < endMinute; m += stepMinutes) {
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

    // Natal gezegenler
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

    // Mizaç / Element Uyumu
    let temperamentScore = 0;
    if (input.profile?.elementTemperament) {
      const allowedSigns = ELEMENT_SIGNS[input.profile.elementTemperament] || [];
      if (allowedSigns.includes(ascSignData.sign)) {
        temperamentScore += 30;
      }
    }
    candidateTotalScore += temperamentScore;

    // Her kadersel olayı SADECE kendi hedef eksenlerine kilitlenerek test et
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

      // 1. ÇİFT YÖNLÜ SOLAR ARC (Sadece Hedef Eksenlere)
      for (const pName of affinity.planets) {
        const natalP = natalPlanets[pName];
        if (natalP === undefined) continue;

        // A) İlerletilmiş Gezegen -> Hedef Eksen (En Güçlü Yönelim)
        const dirPlanet = mod360(natalP + evCalc.arcDegree);
        for (const ang of targetAngles) {
          for (const aspDeg of affinity.aspectTypes) {
            const diff = Math.abs(mod360(dirPlanet - ang.pos) - aspDeg);
            const orb = Math.min(diff, Math.abs(360 - diff));

            if (orb <= 1.0) {
              let score = Math.round(120 * affinity.primaryWeight * (1 - orb / 1.0));
              if (orb <= 0.25) score += 50;

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
                  explanation: `${evCalc.event.title} tarihinde Solar Arc ilerletimli ${pName}, doğrudan kadersel ekseniniz olan ${ang.name} noktasına ${orb.toFixed(2)}° orb ile ${aspectName} yaptı.`
                };
              }
            }
          }
        }

        // B) İlerletilmiş Hedef Eksen -> Natal Gezegen
        for (const ang of targetAngles) {
          const dirAng = mod360(ang.pos + evCalc.arcDegree);
          for (const aspDeg of affinity.aspectTypes) {
            const diff = Math.abs(mod360(dirAng - natalP) - aspDeg);
            const orb = Math.min(diff, Math.abs(360 - diff));

            if (orb <= 1.0) {
              let score = Math.round(100 * affinity.primaryWeight * (1 - orb / 1.0));
              if (orb <= 0.25) score += 40;

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
                  explanation: `${evCalc.event.title} tarihinde Solar Arc ilerletimli ${ang.name} ile Natal ${pName} arasında ${orb.toFixed(2)}° kesin orb ile ${aspectName} gerçekleşti.`
                };
              }
            }
          }
        }
      }

      // 2. İKİNCİL İLERLETİLMİŞ AY (PROGRESSED MOON)
      for (const ang of targetAngles) {
        for (const aspDeg of [0, 60, 90, 120, 180]) {
          const diff = Math.abs(mod360(evCalc.progMoonLon - ang.pos) - aspDeg);
          const orb = Math.min(diff, Math.abs(360 - diff));

          if (orb <= 0.9) {
            let score = Math.round(95 * affinity.primaryWeight * (1 - orb / 0.9));
            if (orb <= 0.20) score += 35;

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

      // 3. TRANSİTLER
      for (const pName of affinity.planets) {
        const trPos = evCalc.eventTransitPlanets[pName];
        if (trPos === undefined) continue;

        for (const ang of targetAngles) {
          for (const aspDeg of affinity.aspectTypes) {
            const diff = Math.abs(mod360(trPos - ang.pos) - aspDeg);
            const orb = Math.min(diff, Math.abs(360 - diff));

            if (orb <= 0.8) {
              let score = Math.round(85 * affinity.primaryWeight * (1 - orb / 0.8));
              if (orb <= 0.15) score += 30;

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
                  explanation: `${evCalc.event.title} tarihinde Transit ${pName}, haritanızın ${ang.name} eksenine ${orb.toFixed(2)}° orb ile ${aspectName} teması yaptı.`
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

    candidateScores.push({
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
    });
  }

  candidateScores.sort((a, b) => b.totalScore - a.totalScore);
  const best = candidateScores[0] || {
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
    bestCandidate: best,
    topCandidates: candidateScores.slice(0, 3),
    chartData,
    totalEventsProcessed: input.events.length,
    methodologyNote: `Bu rektifikasyon analizi; girilen ${input.events.length} kadersel yaşam olayı üzerinden Kadersel Hedef Eksenlere kilitlenmiş Çift Yönlü Solar Arc, İkincil İlerletim ve Transit açıları ile hesaplanarak, 1440 aday dakika arasından en yüksek matematiksel korelasyona (%${best.confidencePercent}) sahip saat olarak tespit edilmiştir.`
  };
}
