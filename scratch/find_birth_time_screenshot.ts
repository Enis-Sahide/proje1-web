import { generateTransitChart } from '../src/features/astrology/engine/AstrologyEngine';
import moment from 'moment-timezone';

async function main() {
  const cityData = { name: 'İstanbul', lat: 41.0082, lon: 28.9784, country: 'Türkiye', tz: 'Europe/Istanbul' };
  
  const natalDate = '1995-03-17';
  
  // Transit: August 27, 2026 at 06:00 AM local time
  const tMoment = moment.tz(`2026-08-27 06:00:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
  const tDateObj = tMoment.toDate();

  // Search all birth times
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 5) {
      const nMoment = moment.tz(`${natalDate} ${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
      const nDateObj = nMoment.toDate();
      
      const transitData = await generateTransitChart(nDateObj, tDateObj, cityData);
      
      const sun = transitData.transitPlanets.find(p => p.name === 'Güneş')!;
      const moon = transitData.transitPlanets.find(p => p.name === 'Ay')!;
      const venus = transitData.transitPlanets.find(p => p.name === 'Venüs')!;
      const mars = transitData.transitPlanets.find(p => p.name === 'Mars')!;

      // We want: Sun in 11, Moon in 5, Venus in 1, Mars in 10
      if (sun.house === 11 && moon.house === 5 && venus.house === 1 && mars.house === 10) {
        console.log(`FOUND BIRTH TIME: ${hour}:${min}`);
        console.log(`ASC: ${transitData.natalChart.ascendant.sign} ${transitData.natalChart.ascendant.degreeInSign}°`);
        console.log(`Sun House: ${sun.house}, Moon House: ${moon.house}, Venus House: ${venus.house}, Mars House: ${mars.house}`);
        return;
      }
    }
  }
}

main().catch(console.error);
