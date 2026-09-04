import { PhoneticChakraEngine } from '../src/features/numerology/engine/PhoneticChakraEngine';

console.log('--- TEST 1: BRAND ANALYSIS ("Omnia Studio") ---');
const omniaRes = PhoneticChakraEngine.analyzeBrand('Omnia Studio');
console.log('Brand:', omniaRes.brandName);
console.log('Acoustic Score:', omniaRes.acousticScore);
console.log('Ouroboros:', omniaRes.ouroboros);
console.log('Industry Scores:', omniaRes.industryScores);
console.log('Missing Chakras:', omniaRes.missingChakras);
console.log('Dominant Chakras:', omniaRes.dominantChakras);

console.log('\n--- TEST 2: PERSONAL NAME SIMULATION ("Ayşe Yılmaz" + "Melis") ---');
const simRes = PhoneticChakraEngine.simulatePersonalName('Ayşe Yılmaz', 'Melis');
console.log('Original Missing:', simRes.originalMissing);
console.log('Simulated Missing:', simRes.simulatedMissing);
console.log('Newly Filled Chakras:', simRes.newlyFilledChakras);
console.log('Score Change:', simRes.scoreChange);

console.log('\n--- TEST 3: SMART RECOMMENDATIONS FOR WEALTH ---');
const recs = PhoneticChakraEngine.getRecommendedNamesForMissingChakras(simRes.originalMissing, 'wealth');
console.log('Top 3 Wealth Recommendations:', recs.slice(0, 3).map(r => ({ name: r.name, reason: r.reason })));
