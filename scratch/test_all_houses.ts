import { generateTransitChart } from '../src/features/astrology/engine/AstrologyEngine';
import moment from 'moment-timezone';

async function main() {
  const cityData = { name: 'İstanbul', lat: 41.0082, lon: 28.9784, country: 'Türkiye', tz: 'Europe/Istanbul' };
  
  const natalDate = '1995-03-17';
  const natalTime = '18:05';
  const transitDate = '2026-08-27';
  const transitTime = '18:05';

  const nMoment = moment.tz(`${natalDate} ${natalTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
  const nDateObj = nMoment.toDate();

  const tMoment = moment.tz(`${transitDate} ${transitTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
  const tDateObj = tMoment.toDate();

  const transitData = await generateTransitChart(nDateObj, tDateObj, cityData);

  transitData.transitPlanets.forEach(p => {
    console.log(`Transit ${p.name}: ${p.sign} ${p.degreeInSign}° -> House ${p.house}`);
  });
}

main().catch(console.error);
