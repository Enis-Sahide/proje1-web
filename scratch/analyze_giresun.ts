import { generateTransitChart } from '../src/features/astrology/engine/AstrologyEngine';
import { AstroCity } from '../src/features/astrology/engine/AstrologyConstants';
import moment from 'moment-timezone';

async function runAnalysis() {
  // Giresun coordinates
  const cityData: AstroCity = {
    name: 'Giresun',
    lat: 40.9128,
    lon: 38.3895,
    country: 'Türkiye',
    tz: 'Europe/Istanbul'
  };

  // Birth Details
  // Natal date: March 17, 1995 at 18:05 Local Time (UTC+2)
  const natalMoment = moment.tz('1995-03-17 18:05:00', 'YYYY-MM-DD HH:mm:ss', cityData.tz);
  const natalDateObj = natalMoment.toDate();

  console.log(`Natal Date: ${natalMoment.format()} (UTC: ${natalDateObj.toISOString()})`);
  console.log(`City: ${cityData.name} (Lat: ${cityData.lat}, Lon: ${cityData.lon})`);
  console.log('--------------------------------------------------\n');

  // --- PERIOD 1: 1995 Birth 3-Months (1995-03-17 to 1995-06-17) ---
  console.log('--- 1995 DÖNEMİ ANALİZİ (17 Mart 1995 - 17 Haziran 1995) ---');
  await simulatePeriod(natalDateObj, cityData, '1995-03-17', '1995-06-17', 1995);

  console.log('\n--------------------------------------------------\n');

  // --- PERIOD 2: 2026 Current 3-Months (2026-08-28 to 2026-11-28) ---
  console.log('--- 2026 DÖNEMİ ANALİZİ (28 Ağustos 2026 - 28 Kasım 2026) ---');
  await simulatePeriod(natalDateObj, cityData, '2026-08-28', '2026-11-28', 1995);
}

async function simulatePeriod(natalDateObj: Date, cityData: AstroCity, startStr: string, endStr: string, birthYear: number) {
  const startMoment = moment.tz(startStr, 'YYYY-MM-DD', cityData.tz).startOf('day');
  const endMoment = moment.tz(endStr, 'YYYY-MM-DD', cityData.tz).startOf('day');
  
  const daysCount = endMoment.diff(startMoment, 'days') + 1;
  console.log(`Simülasyon Süresi: ${daysCount} gün`);

  let levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  let levelDailyDetails: Record<number, { date: string, maxWeight: number, counts: any }[]> = { 1: [], 2: [], 3: [], 4: [] };

  const currentMoment = startMoment.clone();

  for (let i = 0; i < daysCount; i++) {
    const transitDateObj = currentMoment.clone().hour(12).toDate(); // transit calculations usually at noon
    const transitDateStr = currentMoment.format('YYYY-MM-DD');

    // Calculate age at transit date
    let age = currentMoment.year() - birthYear;
    const m = currentMoment.month() - 2; // March is index 2
    if (m < 0 || (m === 0 && currentMoment.date() < 17)) {
      age--;
    }

    // Generate transit chart
    const transitChartData = await generateTransitChart(natalDateObj, transitDateObj, cityData);
    const transitAspects = transitChartData.transitAspects;

    // Calculate level weights
    let asiyahCount = 0;
    let yetzirahCount = 0;
    let beriyahCount = 0;
    let atzilutCount = 0;

    for (const aspect of transitAspects) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;

      const n = aspect.natalPlanet;
      if (n === 'Yükselen (ASC)' || n === 'Tepe Noktası (MC)' || n === 'Güneş') {
        asiyahCount += 1.5;
      } else if (n === 'Ay' || n === 'Merkür' || n === 'Venüs') {
        yetzirahCount += 1.2;
      } else if (n === 'Mars' || n === 'Jüpiter' || n === 'Satürn') {
        beriyahCount += 1.0;
      } else if (n === 'Uranüs' || n === 'Neptün' || n === 'Plüton' || n === 'Kiron') {
        atzilutCount += 1.2;
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

    if (maxWeight === 0) {
      if (age < 28) {
        activeLevel = 2;
      } else if (age < 42) {
        activeLevel = 3;
      } else {
        activeLevel = 4;
      }
    }

    levelCounts[activeLevel as 1 | 2 | 3 | 4]++;
    levelDailyDetails[activeLevel].push({
      date: transitDateStr,
      maxWeight,
      counts: { asiyahCount, yetzirahCount, beriyahCount, atzilutCount }
    });

    currentMoment.add(1, 'day');
  }

  console.log('\nHarita Aktivasyon Sayıları:');
  console.log(`1. Harita (Assiah - Eylem/Fiziksel): ${levelCounts[1]} gün (%${((levelCounts[1] / daysCount) * 100).toFixed(1)})`);
  console.log(`2. Harita (Yetzirah - Duygusal/Psikolojik): ${levelCounts[2]} gün (%${((levelCounts[2] / daysCount) * 100).toFixed(1)})`);
  console.log(`3. Harita (Burç/Beriyah - Zihinsel/Ruhsal Görev): ${levelCounts[3]} gün (%${((levelCounts[3] / daysCount) * 100).toFixed(1)})`);
  console.log(`4. Harita (Atzilut - Kozmik/İlahi): ${levelCounts[4]} gün (%${((levelCounts[4] / daysCount) * 100).toFixed(1)})`);

  const sortedLevels = Object.entries(levelCounts).sort((a, b) => b[1] - a[1]);
  const winnerLevel = sortedLevels[0][0];
  const winnerName = winnerLevel === '1' ? 'Assiah (1. Harita)' :
                     winnerLevel === '2' ? 'Yetzirah (2. Harita)' :
                     winnerLevel === '3' ? 'Beriyah (3. Harita)' : 'Atzilut (4. Harita)';

  console.log(`\n=> En çok aktif çalıştırılan harita: ${winnerName} (${sortedLevels[0][1]} gün)`);
}

runAnalysis().catch(console.error);
