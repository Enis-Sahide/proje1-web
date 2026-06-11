import { SwissEph, Constants } from '@fusionstrings/swisseph-wasi';
import fs from 'fs';

async function test() {
  const wasmBuffer = fs.readFileSync('./node_modules/@fusionstrings/swisseph-wasi/wasm/libswephe.wasm');
  const module = new WebAssembly.Module(wasmBuffer);
  const swe = new SwissEph(module);
  
  const jd = swe.swe_julday(1990, 1, 1, 12.0, Constants.SE_GREG_CAL);
  console.log('Julian Day:', jd);

  const sunPos = swe.swe_calc_ut(jd, Constants.SE_SUN, Constants.SEFLG_SWIEPH);
  console.log('Sun Position:', sunPos);

  swe.swe_close();
}

test().catch(console.error);
