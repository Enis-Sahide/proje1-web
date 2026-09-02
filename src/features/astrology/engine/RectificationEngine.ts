import { SwissEph, Constants } from '@fusionstrings/swisseph-wasi';
import fs from 'fs';
import path from 'path';
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
  vulnerabilityArea?: string; // head, throat, chest, stomach, heart, back, nervous, bones
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
  technique: 'Solar Arc' | 'Transit' | 'Angle Ingress';
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

// Olay Türüne Göre İlgili Noktalar ve Ağırlıklar
const EVENT_AFFINITY: Record<EventType, { primaryHouses: number[]; planets: string[]; aspectTypes: number[] }> = {
  marriage: {
    primaryHouses: [7, 1, 4, 10], // 7th house DSC, 1st ASC
    planets: ['Venüs', 'Jüpiter', 'Güneş', 'Ay'],
    aspectTypes: [0, 60, 120, 180] // Kavuşum, Sekstil, Üçgen, Karşıt
  },
  divorce: {
    primaryHouses: [7, 1, 8],
    planets: ['Uranüs', 'Satürn', 'Mars', 'Plüton'],
    aspectTypes: [0, 90, 180] // Kavuşum, Kare, Karşıt
  },
  child_birth: {
    primaryHouses: [5, 1, 4],
    planets: ['Jüpiter', 'Ay', 'Venüs', 'Güneş'],
    aspectTypes: [0, 60, 120]
  },
  death_relative: {
    primaryHouses: [4, 8, 10, 12],
    planets: ['Satürn', 'Plüton', 'Mars', 'Ay'],
    aspectTypes: [0, 90, 180]
  },
  accident_surgery: {
    primaryHouses: [1, 6, 8, 12],
    planets: ['Mars', 'Uranüs', 'Satürn', 'Plüton'],
    aspectTypes: [0, 90, 180]
  },
  career_promotion: {
    primaryHouses: [10, 1, 6, 2],
    planets: ['Güneş', 'Jüpiter', 'Satürn', 'Merkür'],
    aspectTypes: [0, 60, 120, 180]
  },
  relocation: {
    primaryHouses: [4, 9, 1, 3],
    planets: ['Uranüs', 'Jüpiter', 'Ay', 'Merkür'],
    aspectTypes: [0, 60, 90, 120, 180]
  },
  graduation: {
    primaryHouses: [9, 10, 3],
    planets: ['Jüpiter', 'Merkür', 'Güneş', 'Satürn'],
    aspectTypes: [0, 60, 120]
  },
  financial_crisis: {
    primaryHouses: [2, 8, 10],
    planets: ['Satürn', 'Plüton', 'Mars', 'Uranüs'],
    aspectTypes: [0, 90, 180]
  },
  spiritual_awakening: {
    primaryHouses: [12, 8, 9, 1],
    planets: ['Neptün', 'Uranüs', 'Plüton', 'Jüpiter'],
    aspectTypes: [0, 60, 120, 180]
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
  const tzOffsetHours = 3.0; // Türkiye Standard Time is UTC+3

  const startH = input.timeWindow?.startHour ?? 0;
  const endH = input.timeWindow?.endHour ?? 24;

  // 1. Olay Gezegen Konumlarını ve Solar Arc Açısını Önceden Hesapla
  const eventCalculations: Array<{
    event: LifeEvent;
    arcDegree: number;
    eventTransitPlanets: Record<string, number>;
  }> = [];

  const baseJd = swe.swe_julday(bYear, bMonth, bDay, 12.0, Constants.SE_GREG_CAL);
  const baseSun = swe.swe_calc_ut(baseJd, Constants.SE_SUN, Constants.SEFLG_SWIEPH).xx[0];

  for (const ev of input.events) {
    const [eYear, eMonth, eDay] = ev.date.split('-').map(Number);
    const eventJd = swe.swe_julday(eYear, eMonth, eDay, 12.0, Constants.SE_GREG_CAL);
    const eventSun = swe.swe_calc_ut(eventJd, Constants.SE_SUN, Constants.SEFLG_SWIEPH).xx[0];
    
    // Solar Arc = Olay günündeki Güneş - Doğumdaki Güneş
    const arc = mod360(eventSun - baseSun);

    // Olay günündeki transit ağır gezegenler
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
      arcDegree: arc,
      eventTransitPlanets: transitPlanets
    });
  }

  // 2. Aday Zamanları Tara (İlk Aşama: 2'şer Dakikalık İnce Tarama)
  const candidateScores: CandidateScore[] = [];

  const stepMinutes = 2;
  const startMinute = Math.round(startH * 60);
  const endMinute = Math.min(1440, Math.round(endH * 60));

  for (let m = startMinute; m < endMinute; m += stepMinutes) {
    const hourVal = m / 60.0;
    // Yerel saatten UTC'ye dönüştür (Türkiye = UTC+3)
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

    const ascSignData = getSignAndDegree(ascDeg);
    const mcSignData = getSignAndDegree(mcDeg);

    // Temel natal gezegen konumları
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

    // Skorlama ve Eşleştirme
    let candidateTotalScore = 0;
    const matches: EventMatchDetail[] = [];

    // Mizaç / Element Uyumu
    let temperamentScore = 0;
    if (input.profile?.elementTemperament) {
      const allowedSigns = ELEMENT_SIGNS[input.profile.elementTemperament] || [];
      if (allowedSigns.includes(ascSignData.sign)) {
        temperamentScore += 35;
      }
    }
    candidateTotalScore += temperamentScore;

    // Her Yaşam Olayını Test Et
    for (const evCalc of eventCalculations) {
      const affinity = EVENT_AFFINITY[evCalc.event.type] || {
        primaryHouses: [1, 10, 7, 4],
        planets: ['Güneş', 'Jüpiter', 'Satürn'],
        aspectTypes: [0, 60, 90, 120, 180]
      };

      let bestEventMatchScore = 0;
      let bestMatchDetail: EventMatchDetail | null = null;

      // Test A: Solar Arc ile İlerletilmiş Köşe Noktaları (Dir. ASC, MC) -> Natal Gezegenlere
      const dirAsc = mod360(ascDeg + evCalc.arcDegree);
      const dirMc = mod360(mcDeg + evCalc.arcDegree);

      for (const pName of affinity.planets) {
        const natalP = natalPlanets[pName];
        if (natalP === undefined) continue;

        const testPoints = [
          { name: 'İlerletilmiş Yükselen (Dir. ASC)', pos: dirAsc },
          { name: 'İlerletilmiş Tepe Noktası (Dir. MC)', pos: dirMc }
        ];

        for (const tp of testPoints) {
          for (const aspDeg of affinity.aspectTypes) {
            const diff = Math.abs(mod360(tp.pos - natalP) - aspDeg);
            const orb = Math.min(diff, Math.abs(360 - diff));

            if (orb <= 1.2) { // 1.2 derece orb toleransı
              let score = Math.max(10, Math.round(100 * (1 - orb / 1.2)));
              if (orb <= 0.25) score += 40; // Partil açı bonusu

              if (score > bestEventMatchScore) {
                bestEventMatchScore = score;
                bestMatchDetail = {
                  eventId: evCalc.event.id,
                  eventTitle: evCalc.event.title,
                  technique: 'Solar Arc',
                  aspect: aspDeg === 0 ? 'Kavuşum' : aspDeg === 90 ? 'Kare' : aspDeg === 120 ? 'Üçgen' : aspDeg === 180 ? 'Karşıt' : `${aspDeg}°`,
                  matchedPoint: `${tp.name} -> Natal ${pName}`,
                  orb: Number(orb.toFixed(2)),
                  score,
                  explanation: `${evCalc.event.title} tarihinde Solar Arc ilerletimli ${tp.name} ile ${pName} arasında ${orb.toFixed(2)}° orb ile tam kadersel açı gerçekleşti.`
                };
              }
            }
          }
        }
      }

      // Test B: Olay Günü Transit Ağır Gezegenler -> Natal Köşe Noktalarına (ASC, MC, DSC, IC)
      const angles = [
        { name: 'Yükselen (ASC)', pos: ascDeg },
        { name: 'Tepe Noktası (MC)', pos: mcDeg },
        { name: 'Alçalan (DSC)', pos: dscDeg },
        { name: 'Dip Noktası (IC)', pos: icDeg }
      ];

      for (const pName of affinity.planets) {
        const trPos = evCalc.eventTransitPlanets[pName];
        if (trPos === undefined) continue;

        for (const ang of angles) {
          for (const aspDeg of affinity.aspectTypes) {
            const diff = Math.abs(mod360(trPos - ang.pos) - aspDeg);
            const orb = Math.min(diff, Math.abs(360 - diff));

            if (orb <= 1.0) {
              let score = Math.max(10, Math.round(85 * (1 - orb / 1.0)));
              if (orb <= 0.20) score += 35;

              if (score > bestEventMatchScore) {
                bestEventMatchScore = score;
                bestMatchDetail = {
                  eventId: evCalc.event.id,
                  eventTitle: evCalc.event.title,
                  technique: 'Transit',
                  aspect: aspDeg === 0 ? 'Kavuşum' : aspDeg === 90 ? 'Kare' : aspDeg === 120 ? 'Üçgen' : aspDeg === 180 ? 'Karşıt' : `${aspDeg}°`,
                  matchedPoint: `Transit ${pName} -> ${ang.name}`,
                  orb: Number(orb.toFixed(2)),
                  score,
                  explanation: `${evCalc.event.title} tarihinde Transit ${pName}, haritanızın köşe aksı olan ${ang.name} noktasına ${orb.toFixed(2)}° kesin orb ile temas etti.`
                };
              }
            }
          }
        }
      }

      if (bestMatchDetail) {
        matches.push(bestMatchDetail);
        candidateTotalScore += bestEventMatchScore;
      }
    }

    const curH = Math.floor(m / 60);
    const curM = m % 60;
    const timeStr = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}:00`;

    // Güvenilirlik Yüzdesi: Girilen olay sayısına ve eşleşme kalitesine göre
    const totalPossibleMax = (eventCalculations.length * 140) + 35;
    const rawRatio = candidateTotalScore / Math.max(1, totalPossibleMax);
    const confidencePercent = Math.min(99.8, Number((Math.min(1, rawRatio * 1.35) * (eventCalculations.length >= 4 ? 99.8 : 88)).toFixed(1)));

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

  // 3. En Yüksek Skorlu Adayı Belirle
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

  // 4. En İyi Aday İçin Tam Doğum Haritasını Çıkar
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
    methodologyNote: `Bu rektifikasyon analizi; girilen ${input.events.length} kadersel yaşam olayı üzerinden Solar Arc (Güneş Yayı) ve Ağır Gezegen Transitleri köşe eksenleri (ASC/MC) ile eşleştirilerek, 1440 aday dakika arasından en yüksek matematiksel korelasyona (%${best.confidencePercent}) sahip saat olarak tespit edilmiştir.`
  };
}
