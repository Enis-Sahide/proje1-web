import { generateTransitChart } from '../src/features/astrology/engine/AstrologyEngine';
import { AstroCity } from '../src/features/astrology/engine/AstrologyConstants';
import moment from 'moment-timezone';

async function runTests() {
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

  const startMoment = moment.tz('2026-01-01', 'YYYY-MM-DD', cityData.tz).startOf('day');
  const endMoment = moment.tz('2026-12-31', 'YYYY-MM-DD', cityData.tz).startOf('day');
  const totalDays = endMoment.diff(startMoment, 'days') + 1;

  // Trackers
  const countsA = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const countsB = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const countsC = { 1: 0, 2: 0, 3: 0, 4: 0 };

  const currentMoment = startMoment.clone();

  for (let i = 0; i < totalDays; i++) {
    const transitDateObj = currentMoment.clone().hour(12).toDate();

    // Age
    let age = currentMoment.year() - 1995;
    const mDiff = currentMoment.month() - 2;
    if (mDiff < 0 || (mDiff === 0 && currentMoment.date() < 17)) {
      age--;
    }

    const transitChartData = await generateTransitChart(natalDateObj, transitDateObj, cityData);
    const transitAspects = transitChartData.transitAspects;

    // --- FORMULA A: Tight Orb (orb <= 1.0) ---
    let asiyahA = 0;
    let yetzirahA = 0;
    let beriyahA = 0;
    let atzilutA = 0;

    for (const aspect of transitAspects) {
      if (aspect.orb > 1.0) continue; // Tight orb!
      if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;

      const n = aspect.natalPlanet;
      if (n === 'Yükselen (ASC)' || n === 'Tepe Noktası (MC)' || n === 'Güneş') {
        asiyahA += 1.5;
      } else if (n === 'Ay' || n === 'Merkür' || n === 'Venüs') {
        yetzirahA += 1.2;
      } else if (n === 'Mars' || n === 'Jüpiter' || n === 'Satürn') {
        beriyahA += 1.0;
      } else if (n === 'Uranüs' || n === 'Neptün' || n === 'Plüton' || n === 'Kiron') {
        atzilutA += 1.2;
      }
    }

    let levelA = 1;
    let maxA = asiyahA;
    if (yetzirahA > maxA) { levelA = 2; maxA = yetzirahA; }
    if (beriyahA > maxA && age >= 28) { levelA = 3; maxA = beriyahA; }
    if (atzilutA > maxA && age >= 38) { levelA = 4; maxA = atzilutA; }

    if (maxA === 0) {
      if (age < 28) levelA = 2;
      else if (age < 42) levelA = 3;
      else levelA = 4;
    }
    countsA[levelA as 1 | 2 | 3 | 4]++;

    // --- FORMULA B: Transit Speed Weighting (orb <= 2.5) ---
    let asiyahB = 0;
    let yetzirahB = 0;
    let beriyahB = 0;
    let atzilutB = 0;

    const getSpeedWeight = (tName: string) => {
      if (tName === 'Ay') return 0.1;
      if (tName === 'Merkür' || tName === 'Venüs' || tName === 'Güneş') return 0.3;
      if (tName === 'Mars') return 0.6;
      if (tName === 'Jüpiter' || tName === 'Satürn') return 1.5;
      return 2.0; // Uranus, Neptune, Pluto, Chiron
    };

    for (const aspect of transitAspects) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;

      const speedWeight = getSpeedWeight(aspect.transitPlanet);
      const n = aspect.natalPlanet;

      if (n === 'Yükselen (ASC)' || n === 'Tepe Noktası (MC)' || n === 'Güneş') {
        asiyahB += 1.5 * speedWeight;
      } else if (n === 'Ay' || n === 'Merkür' || n === 'Venüs') {
        yetzirahB += 1.2 * speedWeight;
      } else if (n === 'Mars' || n === 'Jüpiter' || n === 'Satürn') {
        beriyahB += 1.0 * speedWeight;
      } else if (n === 'Uranüs' || n === 'Neptün' || n === 'Plüton' || n === 'Kiron') {
        atzilutB += 1.2 * speedWeight;
      }
    }

    let levelB = 1;
    let maxB = asiyahB;
    if (yetzirahB > maxB) { levelB = 2; maxB = yetzirahB; }
    if (beriyahB > maxB && age >= 28) { levelB = 3; maxB = beriyahB; }
    if (atzilutB > maxB && age >= 38) { levelB = 4; maxB = atzilutB; }

    if (maxB === 0) {
      if (age < 28) levelB = 2;
      else if (age < 42) levelB = 3;
      else levelB = 4;
    }
    countsB[levelB as 1 | 2 | 3 | 4]++;

    // --- FORMULA C: Age Baseline Padding (orb <= 2.5, padding = +2.5) ---
    let asiyahC = 0;
    let yetzirahC = 0;
    let beriyahC = 0;
    let atzilutC = 0;

    // Add padding to the baseline level
    if (age < 28) yetzirahC += 2.5;
    else if (age < 42) beriyahC += 2.5;
    else atzilutC += 2.5;

    for (const aspect of transitAspects) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;

      const n = aspect.natalPlanet;
      if (n === 'Yükselen (ASC)' || n === 'Tepe Noktası (MC)' || n === 'Güneş') {
        asiyahC += 1.5;
      } else if (n === 'Ay' || n === 'Merkür' || n === 'Venüs') {
        yetzirahC += 1.2;
      } else if (n === 'Mars' || n === 'Jüpiter' || n === 'Satürn') {
        beriyahC += 1.0;
      } else if (n === 'Uranüs' || n === 'Neptün' || n === 'Plüton' || n === 'Kiron') {
        atzilutC += 1.2;
      }
    }

    let levelC = 1;
    let maxC = asiyahC;
    if (yetzirahC > maxC) { levelC = 2; maxC = yetzirahC; }
    if (beriyahC > maxC && age >= 28) { levelC = 3; maxC = beriyahC; }
    if (atzilutC > maxC && age >= 38) { levelC = 4; maxC = atzilutC; }

    countsC[levelC as 1 | 2 | 3 | 4]++;

    currentMoment.add(1, 'day');
  }

  console.log('--- 2026 YILI FORMÜL KARŞILAŞTIRMA SONUÇLARI ---');
  console.log(`Toplam Simülasyon Günü: ${totalDays}\n`);

  console.log('FORMÜL A (Dar Orb - 1.0 derece):');
  console.log(`- 1. Harita (Assiah): ${countsA[1]} gün (%${((countsA[1] / totalDays) * 100).toFixed(1)})`);
  console.log(`- 2. Harita (Yetzirah): ${countsA[2]} gün (%${((countsA[2] / totalDays) * 100).toFixed(1)})`);
  console.log(`- 3. Harita (Beriyah): ${countsA[3]} gün (%${((countsA[3] / totalDays) * 100).toFixed(1)})`);
  console.log(`- 4. Harita (Atzilut): ${countsA[4]} gün (%${((countsA[4] / totalDays) * 100).toFixed(1)})\n`);

  console.log('FORMÜL B (Transit Gezegen Hız Ağırlıklandırması):');
  console.log(`- 1. Harita (Assiah): ${countsB[1]} gün (%${((countsB[1] / totalDays) * 100).toFixed(1)})`);
  console.log(`- 2. Harita (Yetzirah): ${countsB[2]} gün (%${((countsB[2] / totalDays) * 100).toFixed(1)})`);
  console.log(`- 3. Harita (Beriyah): ${countsB[3]} gün (%${((countsB[3] / totalDays) * 100).toFixed(1)})`);
  console.log(`- 4. Harita (Atzilut): ${countsB[4]} gün (%${((countsB[4] / totalDays) * 100).toFixed(1)})\n`);

  console.log('FORMÜL C (Yaş Evresi Taban Puanı - +2.5):');
  console.log(`- 1. Harita (Assiah): ${countsC[1]} gün (%${((countsC[1] / totalDays) * 100).toFixed(1)})`);
  console.log(`- 2. Harita (Yetzirah): ${countsC[2]} gün (%${((countsC[2] / totalDays) * 100).toFixed(1)})`);
  console.log(`- 3. Harita (Beriyah): ${countsC[3]} gün (%${((countsC[3] / totalDays) * 100).toFixed(1)})`);
  console.log(`- 4. Harita (Atzilut): ${countsC[4]} gün (%${((countsC[4] / totalDays) * 100).toFixed(1)})\n`);
}

runTests().catch(console.error);
