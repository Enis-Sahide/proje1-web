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

  // Let's search all hours on March 17, 1995
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 5) {
      const utcHour = hour + min / 60.0;
      const jd = swe.swe_julday(1995, 3, 17, utcHour, Constants.SE_GREG_CAL);
      const res = swe.swe_houses(jd, lat, lon, 'P'.charCodeAt(0));
      const asc = res.ascmc[0];
      
      if (Math.abs(asc - 26.03) < 1.0) {
        console.log(`FOUND TIME (UTC): ${hour}:${min} -> ASC: ${asc}`);
      }
    }
  }
}

main().catch(console.error);
