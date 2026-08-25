import { generateTransitChart } from '../src/features/astrology/engine/AstrologyEngine';
import moment from 'moment-timezone';

async function main() {
  const cityData = { name: 'Giresun', lat: 40.9167, lon: 38.3833, country: 'Türkiye', tz: 'Europe/Istanbul' };
  const natalDate = '1995-03-17';
  
  // Transit: August 27, 2026 at 18:05 local time
  const tMoment = moment.tz(`2026-08-27 18:05:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
  const tDateObj = tMoment.toDate();

  // Test times from 16:00 to 20:00 local time
  for (let hour = 16; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 5) {
      const nMoment = moment.tz(`${natalDate} ${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
      const nDateObj = nMoment.toDate();
      
      const transitData = await generateTransitChart(nDateObj, tDateObj, cityData);
      const sun = transitData.transitPlanets.find(p => p.name === 'Güneş')!;
      
      console.log(`Birth Time: ${hour}:${min} -> ASC: ${transitData.natalChart.ascendant.sign} ${transitData.natalChart.ascendant.degreeInSign}°, Sun House: ${sun.house}, Cusp 12: ${transitData.natalChart.houses[11].longitude}`);
    }
  }
}

main().catch(console.error);
