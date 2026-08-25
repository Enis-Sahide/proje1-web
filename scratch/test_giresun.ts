import { SwissEph, Constants } from '@fusionstrings/swisseph-wasi';
import fs from 'fs';
import path from 'path';

async function main() {
  const wasmPath = path.join(__dirname, '../public/wasm/libswephe.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const module = new WebAssembly.Module(wasmBuffer);
  const swe = new SwissEph(module);

  // Giresun: 40.9128 N, 38.3895 E (or 40°55'N, 38°23'E which is 40.9167 N, 38.3833 E)
  // Let's use the exact coordinates from the screenshot: 40°55'N = 40.9167, 38°23'E = 38.3833
  const lat = 40.9167;
  const lon = 38.3833;

  // Birth: March 17, 1995 at 18:05. UT is 16:05 (16.0833 decimal hours)
  const jdNatal = swe.swe_julday(1995, 3, 17, 16.0833, Constants.SE_GREG_CAL);
  const flags = Constants.SEFLG_SWIEPH;

  const hsys = 'P'.charCodeAt(0); // Placidus
  const { cusps, ascmc } = swe.swe_houses(jdNatal, lat, lon, hsys);

  console.log('GIRESUN ASC:', ascmc[0]);
  console.log('House Cusps:');
  for (let i = 1; i <= 12; i++) {
    console.log(`House ${i}: ${cusps[i]}`);
  }

  // Transit: August 27, 2026 at 18:05 local time in Istanbul/Turkey (UTC+3, so UTC 15:05)
  const jdTransit = swe.swe_julday(2026, 8, 27, 15.0833, Constants.SE_GREG_CAL);
  const transitSun = swe.swe_calc_ut(jdTransit, Constants.SE_SUN, flags);

  console.log('\nTransit Sun Longitude:', transitSun.xx[0]);

  // House of Transit Sun in Natal
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

  console.log('Transit Sun House in Giresun Chart:', getHouse(transitSun.xx[0]));
}

main().catch(console.error);
