import SwissEPH from 'sweph-wasm';

async function test() {
  const swe = await SwissEPH.init();
  
  const jd = swe.swe_julday(1990, 1, 1, 12.0, swe.SE_GREG_CAL);
  console.log('Julian Day:', jd);

  // Get Sun position
  const sunPos = swe.swe_calc_ut(jd, swe.SE_SUN, swe.SEFLG_SWIEPH);
  console.log('Sun Position:', sunPos);

  swe.swe_close();
}

test().catch(console.error);
