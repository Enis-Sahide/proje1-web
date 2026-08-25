import { generateTransitChart } from '../src/features/astrology/engine/AstrologyEngine';
import moment from 'moment-timezone';

async function main() {
  const cityData = { name: 'İstanbul', lat: 41.0082, lon: 28.9784, country: 'Türkiye', tz: 'Europe/Istanbul' };
  const natalDate = '1995-03-17';
  const natalTime = '18:05';

  const dates = ['2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28'];
  for (const d of dates) {
    for (const h of [0, 6, 12, 18]) {
      const tMoment = moment.tz(`${d} ${String(h).padStart(2,'0')}:00:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
      const tDateObj = tMoment.toDate();
      const transitData = await generateTransitChart(moment.tz(`${natalDate} ${natalTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz).toDate(), tDateObj, cityData);
      
      const sun = transitData.transitPlanets.find(p => p.name === 'Güneş')!;
      const moon = transitData.transitPlanets.find(p => p.name === 'Ay')!;
      const mercury = transitData.transitPlanets.find(p => p.name === 'Merkür')!;
      
      console.log(`${d} ${h}:00 -> Sun: ${sun.sign} ${sun.degreeInSign}°, Moon: ${moon.sign} ${moon.degreeInSign}°, Mercury: ${mercury.sign} ${mercury.degreeInSign}°, Sun House: ${sun.house}`);
    }
  }
}

main().catch(console.error);
