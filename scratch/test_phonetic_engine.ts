import { PhoneticChakraEngine } from '../src/features/numerology/engine/PhoneticChakraEngine';

console.log('=== BRAND ANALYSIS: "Omnia Studio" ===');
const omnia = PhoneticChakraEngine.analyzeBrand('Omnia Studio');
console.log('Dominant Body Verdict:', omnia.dominantBodyVerdict);
console.log('Body Resonance:');
Object.entries(omnia.bodyResonance).forEach(([key, val]) => {
  console.log(` - ${val.meta.name}: %${val.percentage} (${val.count} harf)`);
});

console.log('\n=== PERSONAL NAME SIMULATION: "Ayşe Yılmaz" + "Melis" ===');
const sim = PhoneticChakraEngine.simulatePersonalName('Ayşe Yılmaz', 'Melis');
console.log('Dominant Body Verdict:', sim.dominantBodyVerdict);
console.log('Body Center Gains:', sim.bodyCenterGains);
console.log('Simulated Body Resonance:');
Object.entries(sim.simulatedBodyResonance).forEach(([key, val]) => {
  console.log(` - ${val.meta.name}: %${val.percentage} (${val.count} harf)`);
});
