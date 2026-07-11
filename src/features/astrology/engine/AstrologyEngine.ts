import { SwissEph, Constants } from '@fusionstrings/swisseph-wasi';
import fs from 'fs';
import path from 'path';
import { ZodiacSign, Planet, AstroPoint, AstroAspect, NatalChartData, AstroCity, ASTRO_CITIES, ZODIAC_SIGNS, TransitChartData, TransitAspect } from './AstrologyConstants';

export { ASTRO_CITIES };


let sweInstance: SwissEph | null = null;
async function getSwe(): Promise<SwissEph> {
  if (sweInstance) return sweInstance;
  
  // Wasm modülünü yükle
  const wasmPath = path.join(process.cwd(), 'public', 'wasm', 'libswephe.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const module = new WebAssembly.Module(wasmBuffer);
  sweInstance = new SwissEph(module);
  
  return sweInstance;
}

function mod360(x: number) {
  return ((x % 360) + 360) % 360;
}

export function getSignAndDegree(longitude: number): { sign: ZodiacSign, degreeInSign: number, minutes: number, signIndex: number } {
  const lon = mod360(longitude);
  const signIndex = Math.floor(lon / 30);
  const decimalDegree = lon % 30;
  const degreeInSign = Math.floor(decimalDegree);
  const minutes = Math.floor((decimalDegree - degreeInSign) * 60);
  
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degreeInSign,
    minutes,
    signIndex
  };
}

function getHouseForLon(lon: number, cusps: number[]): number {
  for (let i = 1; i <= 12; i++) {
    const cusp = cusps[i];
    const nextCusp = i === 12 ? cusps[1] : cusps[i + 1];
    
    const distance = mod360(nextCusp - cusp);
    const pos = mod360(lon - cusp);
    
    if (pos < distance) {
      return i;
    }
  }
  return 1;
}

export function calculateAspects(planets: AstroPoint[]): AstroAspect[] {
  const aspects: AstroAspect[] = [];
  const orbs = {
    'Kavuşum': 10,
    'Karşıt': 10,
    'Üçgen': 8,
    'Kare': 8,
    'Sekstil': 6,
    'Görmeyen': 4
  };

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      let type: AstroAspect['type'] | null = null;
      let exactOrb = 0;

      if (diff <= orbs['Kavuşum']) { type = 'Kavuşum'; exactOrb = diff; }
      else if (Math.abs(diff - 180) <= orbs['Karşıt']) { type = 'Karşıt'; exactOrb = Math.abs(diff - 180); }
      else if (Math.abs(diff - 150) <= orbs['Görmeyen']) { type = 'Görmeyen'; exactOrb = Math.abs(diff - 150); }
      else if (Math.abs(diff - 120) <= orbs['Üçgen']) { type = 'Üçgen'; exactOrb = Math.abs(diff - 120); }
      else if (Math.abs(diff - 90) <= orbs['Kare']) { type = 'Kare'; exactOrb = Math.abs(diff - 90); }
      else if (Math.abs(diff - 60) <= orbs['Sekstil']) { type = 'Sekstil'; exactOrb = Math.abs(diff - 60); }

      if (type) {
        aspects.push({
          planet1: p1.name,
          planet2: p2.name,
          type,
          orb: exactOrb,
          isExact: exactOrb <= 1.0
        });
      }
    }
  }
  return aspects;
}

export async function generateAstrologyChart(dateObj: Date, cityInput: string | AstroCity, isHeliocentric: boolean = false): Promise<NatalChartData> {
  const swe = await getSwe();
  
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  const hour = dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60.0;
  
  const city = typeof cityInput === 'string' 
    ? ASTRO_CITIES.find(c => c.name === cityInput) || ASTRO_CITIES[0]
    : cityInput;

  const jd = swe.swe_julday(year, month, day, hour, Constants.SE_GREG_CAL);
  let flags = Constants.SEFLG_SWIEPH | Constants.SEFLG_SPEED;
  if (isHeliocentric) {
    flags |= Constants.SEFLG_HELCTR;
  }

  // 1. Calculate Houses & ASC/MC
  let ascDeg = 0;
  let mcDeg = 90;
  let vertexDeg = 0;
  const housesObj: AstroPoint[] = [];
  const cuspDegrees = new Array(13).fill(0);

  if (!isHeliocentric) {
    const hsys = 'P'.charCodeAt(0); // Placidus
    const { cusps, ascmc } = swe.swe_houses(jd, city.lat, city.lon, hsys);
    ascDeg = mod360(ascmc[0]);
    mcDeg = mod360(ascmc[1]);
    vertexDeg = mod360(ascmc[3]);

    for (let i = 1; i <= 12; i++) {
      const cuspLon = mod360(cusps[i]);
      cuspDegrees[i] = cuspLon;
      const data = getSignAndDegree(cuspLon);
      housesObj.push({
        name: `${i}. Ev`,
        longitude: cuspLon,
        sign: data.sign,
        degreeInSign: data.degreeInSign,
        minutes: data.minutes,
        house: i
      });
    }
  } else {
    // For Heliocentric, houses and ASC are abstract, set them to 0 Aries
    for (let i = 1; i <= 12; i++) {
      const cuspLon = (i - 1) * 30;
      cuspDegrees[i] = cuspLon;
      const data = getSignAndDegree(cuspLon);
      housesObj.push({
        name: `${i}. Ev`,
        longitude: cuspLon,
        sign: data.sign,
        degreeInSign: data.degreeInSign,
        minutes: data.minutes,
        house: i
      });
    }
  }
  
  const ascData = getSignAndDegree(ascDeg);
  const ascendant: AstroPoint = {
    name: 'Yükselen (ASC)',
    longitude: ascDeg,
    sign: ascData.sign,
    degreeInSign: ascData.degreeInSign,
    minutes: ascData.minutes,
    house: 1
  };

  const mcData = getSignAndDegree(mcDeg);
  const midheaven: AstroPoint = {
    name: 'Tepe Noktası (MC)',
    longitude: mcDeg,
    sign: mcData.sign,
    degreeInSign: mcData.degreeInSign,
    minutes: mcData.minutes,
    house: 10
  };

  // 3. Planets
  const bodyMap = isHeliocentric ? [
    { name: 'Dünya', id: Constants.SE_EARTH },
    { name: 'Merkür', id: Constants.SE_MERCURY },
    { name: 'Venüs', id: Constants.SE_VENUS },
    { name: 'Mars', id: Constants.SE_MARS },
    { name: 'Jüpiter', id: Constants.SE_JUPITER },
    { name: 'Satürn', id: Constants.SE_SATURN },
    { name: 'Uranüs', id: Constants.SE_URANUS },
    { name: 'Neptün', id: Constants.SE_NEPTUNE },
    { name: 'Plüton', id: Constants.SE_PLUTO }
  ] : [
    { name: 'Güneş', id: Constants.SE_SUN },
    { name: 'Ay', id: Constants.SE_MOON },
    { name: 'Merkür', id: Constants.SE_MERCURY },
    { name: 'Venüs', id: Constants.SE_VENUS },
    { name: 'Mars', id: Constants.SE_MARS },
    { name: 'Jüpiter', id: Constants.SE_JUPITER },
    { name: 'Satürn', id: Constants.SE_SATURN },
    { name: 'Uranüs', id: Constants.SE_URANUS },
    { name: 'Neptün', id: Constants.SE_NEPTUNE },
    { name: 'Plüton', id: Constants.SE_PLUTO },
    { name: 'Kiron', id: Constants.SE_CHIRON }
  ];

  const planets: AstroPoint[] = [];

  for (const p of bodyMap) {
    const { xx } = swe.swe_calc_ut(jd, p.id, flags);
    const lon = mod360(xx[0]);
    const speed = xx[3];
    const isRetrograde = speed < 0;

    const data = getSignAndDegree(lon);
    
    planets.push({
      name: p.name,
      longitude: lon,
      sign: data.sign,
      degreeInSign: data.degreeInSign,
      minutes: data.minutes,
      house: getHouseForLon(lon, cuspDegrees),
      isRetrograde
    });
  }

  // 4. Derived & Esoteric Points
  if (!isHeliocentric) {
    // a) Kuzey Ay Düğümü
    const nodeCalc = swe.swe_calc_ut(jd, Constants.SE_TRUE_NODE, flags);
    const northNodeLon = mod360(nodeCalc.xx[0]);
    const nodeSpeed = nodeCalc.xx[3];
    const nnData = getSignAndDegree(northNodeLon);
    planets.push({
      name: 'Kuzey Ay Düğümü',
      longitude: northNodeLon,
      sign: nnData.sign,
      degreeInSign: nnData.degreeInSign,
      minutes: nnData.minutes,
      house: getHouseForLon(northNodeLon, cuspDegrees),
      isRetrograde: nodeSpeed < 0 
    });

    // b) Vertex
    const vxData = getSignAndDegree(vertexDeg);
    planets.push({
      name: 'Vertex (Vx)',
      longitude: vertexDeg,
      sign: vxData.sign,
      degreeInSign: vxData.degreeInSign,
      minutes: vxData.minutes,
      house: getHouseForLon(vertexDeg, cuspDegrees)
    });

    // c) Pars Fortuna (Şans Noktası)
    const sunPoint = planets.find(p => p.name === 'Güneş');
    const moonPoint = planets.find(p => p.name === 'Ay');
    if (sunPoint && moonPoint) {
      // Is Day Chart? Sun is above horizon (House 7 to 12)
      const isDayChart = sunPoint.house >= 7 && sunPoint.house <= 12;
      let pofDeg = 0;
      if (isDayChart) {
        pofDeg = mod360(ascDeg + moonPoint.longitude - sunPoint.longitude);
      } else {
        pofDeg = mod360(ascDeg + sunPoint.longitude - moonPoint.longitude);
      }
      const pofData = getSignAndDegree(pofDeg);
      planets.push({
        name: 'Şans Noktası (POF)',
        longitude: pofDeg,
        sign: pofData.sign,
        degreeInSign: pofData.degreeInSign,
        minutes: pofData.minutes,
        house: getHouseForLon(pofDeg, cuspDegrees)
      });
    }

    // d) Lilith (Mean Apogee)
    const lilithCalc = swe.swe_calc_ut(jd, Constants.SE_MEAN_APOG, flags);
    const lilithLon = mod360(lilithCalc.xx[0]);
    const lilithSpeed = lilithCalc.xx[3];
    const lilithData = getSignAndDegree(lilithLon);
    planets.push({
      name: 'Lilith',
      longitude: lilithLon,
      sign: lilithData.sign,
      degreeInSign: lilithData.degreeInSign,
      minutes: lilithData.minutes,
      house: getHouseForLon(lilithLon, cuspDegrees),
      isRetrograde: lilithSpeed < 0
    });
  }

  const aspects = calculateAspects(planets);

  // --- Esoteric Calculations ---
  const currentYear = new Date().getFullYear();
  const birthYear = dateObj.getFullYear();
  const currentAge = currentYear - birthYear;

  const sun = planets.find(p => p.name === 'Güneş');
  let progressedSunSign: ZodiacSign = sun ? sun.sign : 'Koç';
  let progressedSunAge = 0;
  
  if (sun && !isHeliocentric) {
    const degreesRemaining = 30 - (sun.degreeInSign + (sun.minutes / 60));
    // Progressed Sun moves ~0.9856 degrees per year
    progressedSunAge = Math.round(degreesRemaining / 0.9856);
    
    // Calculate current progressed sign
    const signIndex = ZODIAC_SIGNS.indexOf(sun.sign);
    const totalProgressedDegrees = currentAge * 0.9856;
    const currentAbsoluteLon = mod360(sun.longitude + totalProgressedDegrees);
    progressedSunSign = ZODIAC_SIGNS[Math.floor(currentAbsoluteLon / 30)] || sun.sign;
  }

  // Calculate Intercepted Signs
  const interceptedSigns: ZodiacSign[] = [];
  if (!isHeliocentric) {
    const houseSigns = new Set(housesObj.map(h => h.sign));
    for (const s of ZODIAC_SIGNS) {
      if (!houseSigns.has(s)) {
        interceptedSigns.push(s);
      }
    }
  }

  return {
    planets,
    ascendant,
    midheaven,
    houses: housesObj,
    aspects,
    esoteric: {
      progressedSunSign,
      progressedSunAge,
      currentAge,
      interceptedSigns
    }
  };
}

export function calculateDraconicChart(baseChart: NatalChartData): NatalChartData {
  const northNode = baseChart.planets.find(p => p.name === 'Kuzey Ay Düğümü');
  const nnLon = northNode ? northNode.longitude : 0;
  
  const shift = (lon: number) => mod360(lon - nnLon);
  
  const shiftPoint = (p: AstroPoint): AstroPoint => {
    const newLon = shift(p.longitude);
    const data = getSignAndDegree(newLon);
    return {
      ...p,
      longitude: newLon,
      sign: data.sign,
      degreeInSign: data.degreeInSign,
      minutes: data.minutes
    };
  };

  const planets = baseChart.planets.map(shiftPoint);
  const ascendant = shiftPoint(baseChart.ascendant);
  const midheaven = shiftPoint(baseChart.midheaven);
  const houses = baseChart.houses.map(shiftPoint);
  const aspects = calculateAspects(planets);

  const interceptedSigns: ZodiacSign[] = [];
  const houseSigns = new Set(houses.map(h => h.sign));
  for (const s of ZODIAC_SIGNS) {
    if (!houseSigns.has(s)) interceptedSigns.push(s);
  }

  return { planets, ascendant, midheaven, houses, aspects, esoteric: { interceptedSigns } } as any;
}

export function calculateHarmonicChart(baseChart: NatalChartData, harmonic: number): NatalChartData {
  const shift = (lon: number) => mod360(lon * harmonic);
  
  const shiftPoint = (p: AstroPoint): AstroPoint => {
    const newLon = shift(p.longitude);
    const data = getSignAndDegree(newLon);
    return {
      ...p,
      longitude: newLon,
      sign: data.sign,
      degreeInSign: data.degreeInSign,
      minutes: data.minutes
    };
  };

  const planets = baseChart.planets.map(shiftPoint);
  const ascendant = shiftPoint(baseChart.ascendant);
  const midheaven = shiftPoint(baseChart.midheaven);
  const houses = baseChart.houses.map(shiftPoint);
  const aspects = calculateAspects(planets); 

  const interceptedSigns: ZodiacSign[] = [];
  const houseSigns = new Set(houses.map(h => h.sign));
  for (const s of ZODIAC_SIGNS) {
    if (!houseSigns.has(s)) interceptedSigns.push(s);
  }

  return { planets, ascendant, midheaven, houses, aspects, esoteric: { interceptedSigns } } as any;
}



export function calculateTransitAspects(transitPlanets: AstroPoint[], natalPlanets: AstroPoint[]): TransitAspect[] {
  const aspects: TransitAspect[] = [];
  const orbs = {
    'Kavuşum': 3,
    'Karşıt': 3,
    'Üçgen': 3,
    'Kare': 3,
    'Sekstil': 3,
    'Görmeyen': 1
  };

  for (const tPlanet of transitPlanets) {
    for (const nPlanet of natalPlanets) {
      let diff = Math.abs(tPlanet.longitude - nPlanet.longitude);
      if (diff > 180) diff = 360 - diff;

      let type: TransitAspect['type'] | null = null;
      let exactOrb = 0;

      if (diff <= orbs['Kavuşum']) { type = 'Kavuşum'; exactOrb = diff; }
      else if (Math.abs(diff - 180) <= orbs['Karşıt']) { type = 'Karşıt'; exactOrb = Math.abs(diff - 180); }
      else if (Math.abs(diff - 150) <= orbs['Görmeyen']) { type = 'Görmeyen'; exactOrb = Math.abs(diff - 150); }
      else if (Math.abs(diff - 120) <= orbs['Üçgen']) { type = 'Üçgen'; exactOrb = Math.abs(diff - 120); }
      else if (Math.abs(diff - 90) <= orbs['Kare']) { type = 'Kare'; exactOrb = Math.abs(diff - 90); }
      else if (Math.abs(diff - 60) <= orbs['Sekstil']) { type = 'Sekstil'; exactOrb = Math.abs(diff - 60); }

      if (type) {
        aspects.push({
          transitPlanet: tPlanet.name,
          natalPlanet: nPlanet.name,
          type,
          orb: exactOrb,
          isExact: exactOrb <= 1.0
        });
      }
    }
  }
  return aspects;
}

export async function generateTransitChart(
  natalDateObj: Date, 
  transitDateObj: Date, 
  cityInput: string | AstroCity,
  transitCityInput?: string | AstroCity
): Promise<TransitChartData> {
  const natalChart = await generateAstrologyChart(natalDateObj, cityInput, false);
  const transitChart = await generateAstrologyChart(transitDateObj, transitCityInput || cityInput, false);

  // Map transit planets to natal houses
  const mappedTransitPlanets = transitChart.planets.map(tp => ({
    ...tp,
    house: getHouseForLon(tp.longitude, natalChart.houses.map(h => h.longitude))
  }));

  const transitAspects = calculateTransitAspects(mappedTransitPlanets, natalChart.planets);

  return {
    natalChart,
    transitPlanets: mappedTransitPlanets,
    transitAspects
  };
}
