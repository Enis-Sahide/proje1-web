import SwissEPH from 'sweph-wasm';

async function test() {
  const swe = await SwissEPH.init('file:///C:/projeler/proje1-web/node_modules/sweph-wasm/dist/wasm/swisseph.wasm');
  
  const jd = swe.swe_julday(1990, 1, 1, 12.0, swe.SE_GREG_CAL);
  console.log('Julian Day:', jd);

  const sunPos = swe.swe_calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);
  console.log('Sun Position [lon, lat, dist, lonSpd, latSpd, distSpd]:', sunPos);
  
  const houses = swe.swe_houses(jd, 41.0082, 28.9784, 'P');
  console.log('Houses:', houses);

  swe.swe_close();
}

test().catch(console.error);
