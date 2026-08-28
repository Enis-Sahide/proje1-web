import { generateAstrologyChart, calculateDraconicChart, calculateHarmonicChart, calculateTransitAspects } from '../src/features/astrology/engine/AstrologyEngine';
import { AstroCity } from '../src/features/astrology/engine/AstrologyConstants';
import moment from 'moment-timezone';

function mod360(x: number) {
  return ((x % 360) + 360) % 360;
}

const FIXED_STARS_2000 = [
  { name: 'Sirius', longitude: 104.08 },     // 14°05' Cancer
  { name: 'Regulus', longitude: 149.83 },    // 29°50' Leo
  { name: 'Antares', longitude: 249.77 },    // 9°46' Sagittarius
  { name: 'Aldebaran', longitude: 69.78 },   // 9°47' Gemini
  { name: 'Spica', longitude: 203.83 }       // 23°50' Libra
];

function detectEclipse(transitPlanets: any[]): { isEclipse: boolean, type: 'Solar' | 'Lunar' | null, longitude: number | null } {
  const sun = transitPlanets.find(p => p.name === 'Güneş');
  const moon = transitPlanets.find(p => p.name === 'Ay');
  const northNode = transitPlanets.find(p => p.name === 'Kuzey Ay Düğümü');

  if (!sun || !moon || !northNode) {
    return { isEclipse: false, type: null, longitude: null };
  }

  let sunMoonDiff = Math.abs(sun.longitude - moon.longitude);
  if (sunMoonDiff > 180) sunMoonDiff = 360 - sunMoonDiff;

  let moonNodeDiff = Math.abs(moon.longitude - northNode.longitude);
  if (moonNodeDiff > 180) moonNodeDiff = 360 - moonNodeDiff;

  const isNearNode = (orbLimit: number) => {
    return moonNodeDiff <= orbLimit || Math.abs(moonNodeDiff - 180) <= orbLimit;
  };

  // Solar Eclipse: New Moon + near Node
  if (sunMoonDiff <= 3.0 && isNearNode(15.0)) {
    return { isEclipse: true, type: 'Solar', longitude: sun.longitude };
  }

  // Lunar Eclipse: Full Moon + near Node
  if (Math.abs(sunMoonDiff - 180) <= 3.0 && isNearNode(12.0)) {
    return { isEclipse: true, type: 'Lunar', longitude: moon.longitude };
  }

  return { isEclipse: false, type: null, longitude: null };
}

function checkEclipseAspect(eclipseLon: number, natalPlanets: any[]): boolean {
  for (const nPlanet of natalPlanets) {
    let diff = Math.abs(eclipseLon - nPlanet.longitude);
    if (diff > 180) diff = 360 - diff;

    // Conjunction, Opposition, Square within 2.0 degrees
    if (diff <= 2.0 || Math.abs(diff - 180) <= 2.0 || Math.abs(diff - 90) <= 2.0) {
      return true;
    }
  }
  return false;
}

async function runAnalysis() {
  const cityData: AstroCity = {
    name: 'Giresun',
    lat: 40.9128,
    lon: 38.3895,
    country: 'Türkiye',
    tz: 'Europe/Istanbul'
  };

  // Birth Details: June 26, 1992 at 12:00 UTC+3
  const natalMoment = moment.tz('1992-06-26 12:00:00', 'YYYY-MM-DD HH:mm:ss', cityData.tz);
  const natalDateObj = natalMoment.toDate();

  console.log(`Natal Date: ${natalMoment.format()} (UTC: ${natalDateObj.toISOString()})`);
  console.log(`City: ${cityData.name}`);
  console.log('--------------------------------------------------\n');

  // Generate 4 natal charts
  const assiahChart = await generateAstrologyChart(natalDateObj, cityData, false);
  const yetzirahChart = calculateDraconicChart(assiahChart);
  const beriyahChart = calculateHarmonicChart(assiahChart, 9);
  const atzilutChart = await generateAstrologyChart(natalDateObj, cityData, true); // Heliocentric

  console.log('--- 2017 - 2030 YILLARI ARASI HARİTA AKTİVASYON ANALİZİ ---');
  console.log('| Yıl | Toplam Gün | 1. Harita (Assiah) | 2. Harita (Yetzirah) | 3. Harita (Beriyah) | 4. Harita (Atzilut) | En Aktif Harita |');
  console.log('| :--- | :---: | :---: | :---: | :---: | :---: | :--- |');

  const getNatalPlanetWeight = (name: string) => {
    if (name === 'Yükselen (ASC)' || name === 'Tepe Noktası (MC)' || name === 'Güneş') return 1.5;
    if (name === 'Ay' || name === 'Merkür' || name === 'Venüs') return 1.2;
    if (name === 'Mars' || name === 'Jüpiter' || name === 'Satürn') return 1.0;
    return 1.2;
  };

  const getTransitPlanetSpeedWeight = (name: string) => {
    if (name === 'Ay') return 0.1;
    if (name === 'Merkür' || name === 'Venüs' || name === 'Güneş') return 0.5;
    if (name === 'Mars') return 1.0;
    if (name === 'Jüpiter' || name === 'Satürn') return 2.0;
    return 3.0; // Uranus, Neptune, Pluto, Chiron
  };

  for (let year = 2017; year <= 2030; year++) {
    const startMoment = moment.tz(`${year}-01-01`, 'YYYY-MM-DD', cityData.tz).startOf('day');
    const endMoment = moment.tz(`${year}-12-31`, 'YYYY-MM-DD', cityData.tz).startOf('day');
    const totalDays = endMoment.diff(startMoment, 'days') + 1;

    const yearlyCounts = { 1: 0, 2: 0, 3: 0, 4: 0, total: 0 };
    const currentMoment = startMoment.clone();

    for (let i = 0; i < totalDays; i++) {
      const transitDateObj = currentMoment.clone().hour(12).toDate();

      // Calculate age
      let age = currentMoment.year() - 1992;
      const mDiff = currentMoment.month() - 5;
      if (mDiff < 0 || (mDiff === 0 && currentMoment.date() < 26)) {
        age--;
      }

      // Generate Transit Charts
      const transitChart = await generateAstrologyChart(transitDateObj, cityData, false);
      const transitChartHelio = await generateAstrologyChart(transitDateObj, cityData, true);

      // Calculate aspects
      const transitsToAssiah = calculateTransitAspects(transitChart.planets, assiahChart.planets);
      const transitsToYetzirah = calculateTransitAspects(transitChart.planets, yetzirahChart.planets);
      const transitsToBeriyah = calculateTransitAspects(transitChart.planets, beriyahChart.planets);
      const transitsToAtzilut = calculateTransitAspects(transitChartHelio.planets, atzilutChart.planets);

      // Initialize counts
      let asiyahCount = 0;
      let yetzirahCount = 0;
      let beriyahCount = 0;
      let atzilutCount = 0;

      // 1. Assiah Transits
      for (const aspect of transitsToAssiah) {
        if (aspect.orb > 2.5) continue;
        if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
        asiyahCount += getNatalPlanetWeight(aspect.natalPlanet) * getTransitPlanetSpeedWeight(aspect.transitPlanet);
      }

      // 2. Yetzirah Transits
      for (const aspect of transitsToYetzirah) {
        if (aspect.orb > 2.5) continue;
        if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
        yetzirahCount += getNatalPlanetWeight(aspect.natalPlanet) * getTransitPlanetSpeedWeight(aspect.transitPlanet);
      }

      // 3. Beriyah Transits
      for (const aspect of transitsToBeriyah) {
        if (aspect.orb > 2.5) continue;
        if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
        beriyahCount += getNatalPlanetWeight(aspect.natalPlanet) * getTransitPlanetSpeedWeight(aspect.transitPlanet);
      }

      // 4. Atzilut Transits
      for (const aspect of transitsToAtzilut) {
        if (aspect.orb > 2.5) continue;
        if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
        atzilutCount += getNatalPlanetWeight(aspect.natalPlanet) * getTransitPlanetSpeedWeight(aspect.transitPlanet);
      }

      // Add Fixed Stars transits
      const transitYear = currentMoment.year();
      for (const tPlanet of transitChart.planets) {
        for (const star of FIXED_STARS_2000) {
          const starLon = mod360(star.longitude + (transitYear - 2000) * 0.01396);
          let diff = Math.abs(tPlanet.longitude - starLon);
          if (diff > 180) diff = 360 - diff;

          if (diff <= 1.5 || Math.abs(diff - 180) <= 1.5) {
            atzilutCount += 1.5 * getTransitPlanetSpeedWeight(tPlanet.name);
          }
        }
      }

      // 5. Eclipse Destiny Overrides
      const eclipse = detectEclipse(transitChart.planets);
      if (eclipse.isEclipse && eclipse.longitude !== null) {
        if (checkEclipseAspect(eclipse.longitude, assiahChart.planets)) {
          asiyahCount += 5.0;
        }
        if (checkEclipseAspect(eclipse.longitude, yetzirahChart.planets)) {
          yetzirahCount += 5.0;
        }
        if (checkEclipseAspect(eclipse.longitude, beriyahChart.planets)) {
          beriyahCount += 5.0;
        }
        if (checkEclipseAspect(eclipse.longitude, atzilutChart.planets)) {
          atzilutCount += 5.0;
        }
      }

      // Determine active level
      let activeLevel = 1;
      let maxWeight = asiyahCount;

      if (yetzirahCount > maxWeight) {
        activeLevel = 2;
        maxWeight = yetzirahCount;
      }
      if (beriyahCount > maxWeight) {
        activeLevel = 3;
        maxWeight = beriyahCount;
      }
      if (atzilutCount > maxWeight) {
        activeLevel = 4;
        maxWeight = atzilutCount;
      }

      // Fallback
      if (maxWeight === 0) {
        if (age < 28) {
          activeLevel = 2;
        } else if (age < 42) {
          activeLevel = 3;
        } else {
          activeLevel = 4;
        }
      }

      yearlyCounts[activeLevel as 1 | 2 | 3 | 4]++;
      yearlyCounts.total++;

      currentMoment.add(1, 'day');
    }

    const sortedLevels = Object.entries({ 1: yearlyCounts[1], 2: yearlyCounts[2], 3: yearlyCounts[3], 4: yearlyCounts[4] })
      .sort((a, b) => b[1] - a[1]);
    const winnerLevel = sortedLevels[0][0];
    const winnerName = winnerLevel === '1' ? 'Assiah (1. Harita)' :
                       winnerLevel === '2' ? 'Yetzirah (2. Harita)' :
                       winnerLevel === '3' ? 'Beriyah (3. Harita)' : 'Atzilut (4. Harita)';

    console.log(`| ${year} | ${yearlyCounts.total} | ${yearlyCounts[1]} | ${yearlyCounts[2]} | ${yearlyCounts[3]} | ${yearlyCounts[4]} | ${winnerName} |`);
  }
}

runAnalysis().catch(console.error);
