import { generateAstrologyChart } from './src/features/astrology/engine/AstrologyEngine';
import moment from 'moment-timezone';

async function run() {
  const localDate = '1995-03-17';
  const localTime = '18:05';
  const tz = 'Europe/Istanbul';
  
  const momentObj = moment.tz(`${localDate} ${localTime}:00`, 'YYYY-MM-DD HH:mm:ss', tz);
  const dateObj = momentObj.toDate();
  
  const chart = await generateAstrologyChart(dateObj, 'Giresun');
  console.log("Ascendant Sign:", chart.ascendant.sign, chart.ascendant.degreeInSign);
  console.log("Esoteric:", chart.esoteric);
}

run().catch(console.error);
