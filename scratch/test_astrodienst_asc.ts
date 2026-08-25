import { SwissEph, Constants } from '@fusionstrings/swisseph-wasi';
import fs from 'fs';
import path from 'path';

async function main() {
  const wasmPath = path.join(__dirname, '../public/wasm/libswephe.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const module = new WebAssembly.Module(wasmBuffer);
  const swe = new SwissEph(module);

  const lat = 41.0082;
  const lon = 28.9784;

  // Let's test 1995-03-17 at 06:05 AM (local time UTC+2)
  // Local 06:05 -> UTC 04:05 (4.0833 decimal hours)
  const jdAM = swe.swe_julday(1995, 3, 17, 4.0833, Constants.SE_GREG_CAL);
  const hsys = 'P'.charCodeAt(0);
  const resAM = swe.swe_houses(jdAM, lat, lon, hsys);

  console.log('06:05 AM local time:');
  console.log('ASC:', resAM.ascmc[0]);
  console.log('House 12 cusp:', resAM.cusps[12]);
  console.log('House 1 cusp (ASC):', resAM.cusps[1]);

  // Let's test 1995-03-17 at 18:05 PM (local time UTC+2)
  // Local 18:05 -> UTC 16:05 (16.0833 decimal hours)
  const jdPM = swe.swe_julday(1995, 3, 17, 16.0833, Constants.SE_GREG_CAL);
  const resPM = swe.swe_houses(jdPM, lat, lon, hsys);

  console.log('\n18:05 PM local time:');
  console.log('ASC:', resPM.ascmc[0]);
  console.log('House 12 cusp:', resPM.cusps[12]);
  console.log('House 1 cusp (ASC):', resPM.cusps[1]);
  console.log('House 11 cusp:', resPM.cusps[11]);
}

main().catch(console.error);
