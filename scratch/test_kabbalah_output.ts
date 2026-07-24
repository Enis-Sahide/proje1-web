import { generateAstrologyChart, calculateDraconicChart } from '../src/features/astrology/engine/AstrologyEngine';
import { getEsotericPlanetInterpretation } from '../src/features/astrology/engine/KabbalahPlanetInterpretations';

async function main() {
  const dateObj = new Date("1995-05-15T12:00:00Z");
  const cityData = { name: "Istanbul", lat: 41.0082, lon: 28.9784, tz: "Europe/Istanbul", country: "Turkey", admin1: "" };
  
  console.log("Calculating Assiah...");
  const assiah = await generateAstrologyChart(dateObj, cityData, false);
  
  console.log("Calculating Yetzirah...");
  const yetzirah = calculateDraconicChart(assiah);
  
  console.log("\n--- COMPARE PLANETS ---");
  for (let i = 0; i < assiah.planets.length; i++) {
    const pA = assiah.planets[i];
    const pY = yetzirah.planets.find(p => p.name === pA.name);
    if (pY) {
      console.log(`Planet: ${pA.name}`);
      console.log(`  Assiah:   ${pA.sign} | ${pA.degreeInSign}° ${pA.minutes}'`);
      console.log(`  Yetzirah: ${pY.sign} | ${pY.degreeInSign}° ${pY.minutes}'`);
      
      const interpA = getEsotericPlanetInterpretation(pA.name, pA.sign, pA.house, false, false, false, pA.isRetrograde);
      const interpY = getEsotericPlanetInterpretation(pY.name, pY.sign, pY.house, true, false, false, pY.isRetrograde);
      
      console.log(`  Interp Assiah (Title): ${interpA.title}`);
      console.log(`  Interp Yetzirah (Title): ${interpY.title}`);
      console.log(`  Are Interps Identical? ${interpA.content === interpY.content}`);
    }
  }
}

main().catch(console.error);
