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

  console.log('Natal ASC:', transitData.natalChart.ascendant);
  console.log('Natal House 11 Cusp:', transitData.natalChart.houses[10]);
  console.log('Natal House 12 Cusp:', transitData.natalChart.houses[11]);
  
  const sun = transitData.transitPlanets.find(p => p.name === 'Güneş');
  const mercury = transitData.transitPlanets.find(p => p.name === 'Merkür');

  console.log('Transit Sun:', sun);
  console.log('Transit Mercury:', mercury);
}

main().catch(console.error);
