const moment = require('moment-timezone');
const getSwe = require('@fusionstrings/swisseph-wasi').default || require('@fusionstrings/swisseph-wasi');

async function test() {
  const swe = await getSwe();
  
  const localDate = '1995-03-17';
  const localTime = '18:05';
  const tz = 'Europe/Istanbul';
  const lat = 40.9128;
  const lon = 38.3895;

  const momentObj = moment.tz(`${localDate} ${localTime}:00`, 'YYYY-MM-DD HH:mm:ss', tz);
  const dateObj = momentObj.toDate();
  
  console.log("UTC Time:", dateObj.toISOString());

  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  const hour = dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60.0;
  
  console.log(`UTC Year: ${year}, Month: ${month}, Day: ${day}, Hour: ${hour}`);

  // 1 = SE_GREG_CAL
  const jd = swe.swe_julday(year, month, day, hour, 1);
  console.log("Julian Day:", jd);

  // 'P' = Placidus
  const { cusps, ascmc } = swe.swe_houses(jd, lat, lon, 'P');
  
  const ascLon = ascmc[0];
  console.log("Ascendant Longitude:", ascLon);
  
  const ZODIAC_SIGNS = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];
  const signIndex = Math.floor(ascLon / 30);
  const degreeInSign = Math.floor(ascLon % 30);
  const sign = ZODIAC_SIGNS[signIndex];
  
  console.log(`Ascendant Sign: ${sign} (${degreeInSign}°)`);
}

test().catch(console.error);
