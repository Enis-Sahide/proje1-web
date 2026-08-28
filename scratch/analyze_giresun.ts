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

async function runAnalysis() {
  const cityData: AstroCity = {
    name: 'Giresun',
    lat: 40.9128,
    lon: 38.3895,
    country: 'Türkiye',
    tz: 'Europe/Istanbul'
  };

  // Birth Details: March 17, 1995 at 18:05 UTC+2
  const natalMoment = moment.tz('1995-03-17 18:05:00', 'YYYY-MM-DD HH:mm:ss', cityData.tz);
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

  const getPlanetWeight = (name: string) => {
    if (name === 'Yükselen (ASC)' || name === 'Tepe Noktası (MC)' || name === 'Güneş') return 1.5;
    if (name === 'Ay' || name === 'Merkür' || name === 'Venüs') return 1.2;
    if (name === 'Mars' || name === 'Jüpiter' || name === 'Satürn') return 1.0;
    return 1.2; // Uranus, Neptune, Pluto, Chiron, Lilith, North Node etc.
  };

  for (let year = 2017; year <= 2030; year++) {
    const startMoment = moment.tz(`${year}-01-01`, 'YYYY-MM-DD', cityData.tz).startOf('day');
    const endMoment = moment.tz(`${year}-12-31`, 'YYYY-MM-DD', cityData.tz).startOf('day');
    const totalDays = endMoment.diff(startMoment, 'days') + 1;

    const yearlyCounts = { 1: 0, 2: 0, 3: 0, 4: 0, total: 0 };
    const currentMoment = startMoment.clone();

    for (let i = 0; i < totalDays; i++) {
      const transitDateObj = currentMoment.clone().hour(12).toDate();

      // Calculate age at transit date
      let age = currentMoment.year() - 1995;
      const mDiff = currentMoment.month() - 2; // March is index 2
      if (mDiff < 0 || (mDiff === 0 && currentMoment.date() < 17)) {
        age--;
      }

      // Generate Transit Charts
      const transitChart = await generateAstrologyChart(transitDateObj, cityData, false);
      const transitChartHelio = await generateAstrologyChart(transitDateObj, cityData, true);

      // Calculate transit aspects to each respective chart
      const transitsToAssiah = calculateTransitAspects(transitChart.planets, assiahChart.planets);
      const transitsToYetzirah = calculateTransitAspects(transitChart.planets, yetzirahChart.planets);
      const transitsToBeriyah = calculateTransitAspects(transitChart.planets, beriyahChart.planets);
      const transitsToAtzilut = calculateTransitAspects(transitChartHelio.planets, atzilutChart.planets);

      // Initialize counts with baseline padding (+2.5)
      let asiyahCount = 0;
      let yetzirahCount = 0;
      let beriyahCount = 0;
      let atzilutCount = 0;

      if (age < 28) {
        yetzirahCount += 2.5;
      } else if (age < 42) {
        beriyahCount += 2.5;
      } else {
        atzilutCount += 2.5;
      }

      // 1. Assiah Transits
      for (const aspect of transitsToAssiah) {
        if (aspect.orb > 2.5) continue;
        if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
        asiyahCount += getPlanetWeight(aspect.natalPlanet);
      }

      // 2. Yetzirah Transits
      for (const aspect of transitsToYetzirah) {
        if (aspect.orb > 2.5) continue;
        if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
        yetzirahCount += getPlanetWeight(aspect.natalPlanet);
      }

      // 3. Beriyah Transits (only if age >= 28)
      if (age >= 28) {
        for (const aspect of transitsToBeriyah) {
          if (aspect.orb > 2.5) continue;
          if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
          beriyahCount += getPlanetWeight(aspect.natalPlanet);
        }
      }

      // 4. Atzilut Transits (only if age >= 38)
      if (age >= 38) {
        for (const aspect of transitsToAtzilut) {
          if (aspect.orb > 2.5) continue;
          if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
          atzilutCount += getPlanetWeight(aspect.natalPlanet);
        }

        // Add Fixed Stars transits (only if age >= 38)
        const transitYear = currentMoment.year();
        for (const tPlanet of transitChart.planets) {
          for (const star of FIXED_STARS_2000) {
            const starLon = mod360(star.longitude + (transitYear - 2000) * 0.01396);
            let diff = Math.abs(tPlanet.longitude - starLon);
            if (diff > 180) diff = 360 - diff;

            if (diff <= 1.5 || Math.abs(diff - 180) <= 1.5) {
              atzilutCount += 1.5;
            }
          }
        }
      }

      // Determine active level
      let activeLevel = 1;
      let maxWeight = asiyahCount;

      if (yetzirahCount > maxWeight) {
        activeLevel = 2;
        maxWeight = yetzirahCount;
      }
      if (beriyahCount > maxWeight && age >= 28) {
        activeLevel = 3;
        maxWeight = beriyahCount;
      }
      if (atzilutCount > maxWeight && age >= 38) {
        activeLevel = 4;
        maxWeight = atzilutCount;
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
