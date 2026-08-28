import { generateTransitChart } from '../src/features/astrology/engine/AstrologyEngine';
import { AstroCity } from '../src/features/astrology/engine/AstrologyConstants';
import moment from 'moment-timezone';

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

  console.log('--- 2026 YILI 12 AYLIK AKTİVASYON ANALİZİ ---');
  
  const startMoment = moment.tz('2026-01-01', 'YYYY-MM-DD', cityData.tz).startOf('day');
  const endMoment = moment.tz('2026-12-31', 'YYYY-MM-DD', cityData.tz).startOf('day');
  const totalDays = endMoment.diff(startMoment, 'days') + 1;

  // Track counts by month (1 to 12)
  // Each month will have counts for levels 1, 2, 3, 4
  const monthlyCounts: Record<number, { 1: number, 2: number, 3: number, 4: number, total: number }> = {};
  for (let m = 1; m <= 12; m++) {
    monthlyCounts[m] = { 1: 0, 2: 0, 3: 0, 4: 0, total: 0 };
  }

  const yearlyCounts = { 1: 0, 2: 0, 3: 0, 4: 0, total: 0 };

  const currentMoment = startMoment.clone();

  for (let i = 0; i < totalDays; i++) {
    const transitDateObj = currentMoment.clone().hour(12).toDate();
    const month = currentMoment.month() + 1; // 1-indexed

    // Calculate age at transit date
    let age = currentMoment.year() - 1995;
    const mDiff = currentMoment.month() - 2; // March is index 2
    if (mDiff < 0 || (mDiff === 0 && currentMoment.date() < 17)) {
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

    // Determine active level (Option 1: Kademeli Öncelik)
    let activeLevel = 1;
    let maxWeight = asiyahCount;

    if (age >= 38 && atzilutCount > 0) {
      activeLevel = 4;
      maxWeight = atzilutCount;
    } else if (age >= 28 && beriyahCount > 0) {
      activeLevel = 3;
      maxWeight = beriyahCount;
    } else if (yetzirahCount > 0) {
      activeLevel = 2;
      maxWeight = yetzirahCount;
    } else if (asiyahCount > 0) {
      activeLevel = 1;
      maxWeight = asiyahCount;
    } else {
      maxWeight = 0;
      if (age < 28) {
        activeLevel = 2;
      } else if (age < 42) {
        activeLevel = 3;
      } else {
        activeLevel = 4;
      }
    }

    monthlyCounts[month][activeLevel as 1 | 2 | 3 | 4]++;
    monthlyCounts[month].total++;
    
    yearlyCounts[activeLevel as 1 | 2 | 3 | 4]++;
    yearlyCounts.total++;

    currentMoment.add(1, 'day');
  }

  // Print Monthly Table
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  console.log('| Ay | Toplam Gün | 1. Harita (Assiah) | 2. Harita (Yetzirah) | 3. Harita (Beriyah) | 4. Harita (Atzilut) |');
  console.log('| :--- | :---: | :---: | :---: | :---: | :---: |');
  for (let m = 1; m <= 12; m++) {
    const counts = monthlyCounts[m];
    console.log(`| ${monthNames[m - 1]} | ${counts.total} | ${counts[1]} | ${counts[2]} | ${counts[3]} | ${counts[4]} |`);
  }
  console.log(`| **TOPLAM** | **${yearlyCounts.total}** | **${yearlyCounts[1]}** | **${yearlyCounts[2]}** | **${yearlyCounts[3]}** | **${yearlyCounts[4]}** |`);

  const sortedLevels = Object.entries({ 1: yearlyCounts[1], 2: yearlyCounts[2], 3: yearlyCounts[3], 4: yearlyCounts[4] })
    .sort((a, b) => b[1] - a[1]);
  const winnerLevel = sortedLevels[0][0];
  const winnerName = winnerLevel === '1' ? 'Assiah (1. Harita)' :
                     winnerLevel === '2' ? 'Yetzirah (2. Harita)' :
                     winnerLevel === '3' ? 'Beriyah (3. Harita)' : 'Atzilut (4. Harita)';

  console.log(`\n=> 2026 Yılında En Çok Aktif Çalıştırılan Harita: ${winnerName} (${sortedLevels[0][1]} gün)`);
}

runAnalysis().catch(console.error);
