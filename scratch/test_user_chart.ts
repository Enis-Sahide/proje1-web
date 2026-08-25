import { SwissEph, Constants } from '@fusionstrings/swisseph-wasi';
import fs from 'fs';
import path from 'path';

async function main() {
  const wasmPath = path.join(__dirname, '../public/wasm/libswephe.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const module = new WebAssembly.Module(wasmBuffer);
  const swe = new SwissEph(module);

  // Istanbul lat/lon
  const lat = 41.0082;
  const lon = 28.9784;

  // Natal: March 17, 1995 at 18:05 Local Time. 
  // Let's assume UTC+2 (since Turkey was on UTC+2 in winter and UTC+3 in summer). March is winter time.
  // Local 18:05 -> UTC 16:05 (16.0833 decimal hours)
  const jdNatal = swe.swe_julday(1995, 3, 17, 16.0833, Constants.SE_GREG_CAL);
  const flags = Constants.SEFLG_SWIEPH;

  // Calculate houses
  const hsys = 'P'.charCodeAt(0); // Placidus
  const { cusps, ascmc } = swe.swe_houses(jdNatal, lat, lon, hsys);
  
  console.log('ASC:', ascmc[0]);
  console.log('MC:', ascmc[1]);
  console.log('House Cusps:');
  for (let i = 1; i <= 12; i++) {
    console.log(`House ${i}: ${cusps[i]}`);
  }

  // Transit: August 27, 2026 at 18:05 (assuming UTC+3 for 2026, since Turkey stays on UTC+3 all year)
  // Local 18:05 -> UTC 15:05 (15.0833 decimal hours)
  const jdTransit = swe.swe_julday(2026, 8, 27, 15.0833, Constants.SE_GREG_CAL);
  
  const transitSun = swe.swe_calc_ut(jdTransit, Constants.SE_SUN, flags);
  const transitMercury = swe.swe_calc_ut(jdTransit, Constants.SE_MERCURY, flags);

  console.log('Transit Sun:', transitSun.xx[0]);
  console.log('Transit Mercury:', transitMercury.xx[0]);

  // Determine house of Transit Sun and Transit Mercury in Natal Chart
  const getHouse = (planetLon: number) => {
    for (let i = 1; i <= 12; i++) {
      const cusp = cusps[i];
      const nextCusp = i === 12 ? cusps[1] : cusps[i + 1];
      
      const distance = ((nextCusp - cusp) % 360 + 360) % 360;
      const pos = ((planetLon - cusp) % 360 + 360) % 360;
      
      if (pos < distance) {
        return i;
      }
    }
    return 1;
  };

  console.log('Transit Sun House:', getHouse(transitSun.xx[0]));
  console.log('Transit Mercury House:', getHouse(transitMercury.xx[0]));
}

main().catch(console.error);
