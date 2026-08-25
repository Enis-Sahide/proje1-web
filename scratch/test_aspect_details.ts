import { SwissEph, Constants } from '@fusionstrings/swisseph-wasi';
import fs from 'fs';
import path from 'path';

async function main() {
  const wasmPath = path.join(__dirname, '../public/wasm/libswephe.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const module = new WebAssembly.Module(wasmBuffer);
  const swe = new SwissEph(module);

  // Natal: March 17, 1995 at 18:05 Local Time. Assuming Istanbul (UTC+2 or +3, let's check UTC+2)
  // UTC time: 1995-03-17 16:05 (or 15:05 if UTC+3)
  const natalYear = 1995;
  const natalMonth = 3;
  const natalDay = 17;
  const natalHour = 16.0833; // 18:05 - 2h = 16:05 = 16.0833
  
  const jdNatal = swe.swe_julday(natalYear, natalMonth, natalDay, natalHour, Constants.SE_GREG_CAL);
  const flags = Constants.SEFLG_SWIEPH;

  const natalSun = swe.swe_calc_ut(jdNatal, Constants.SE_SUN, flags);
  const natalMercury = swe.swe_calc_ut(jdNatal, Constants.SE_MERCURY, flags);

  console.log('Natal Sun Longitude:', natalSun.xx[0]);
  console.log('Natal Mercury Longitude:', natalMercury.xx[0]);

  // Transit: August 27, 2026. Let's say noon (12:00) UTC
  const transitYear = 2026;
  const transitMonth = 8;
  const transitDay = 27;
  const transitHour = 12.0;

  const jdTransit = swe.swe_julday(transitYear, transitMonth, transitDay, transitHour, Constants.SE_GREG_CAL);
  const transitSun = swe.swe_calc_ut(jdTransit, Constants.SE_SUN, flags);
  const transitMercury = swe.swe_calc_ut(jdTransit, Constants.SE_MERCURY, flags);

  console.log('Transit Sun Longitude:', transitSun.xx[0]);
  console.log('Transit Mercury Longitude:', transitMercury.xx[0]);
}

main().catch(console.error);
