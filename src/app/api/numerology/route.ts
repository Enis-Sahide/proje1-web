import { calculateLifePath, calculatePersonalYear, calculateArrows, getBirthdayNumber, calculateNameAnalysis } from '@/utils/numerologyCalculator';
import { PhoneticChakraEngine, TargetGoal } from '@/features/numerology/engine/PhoneticChakraEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';

export async function OPTIONS() {
  return preflight();
}

function buildRecommendedByGoal(missingChakras: number[]) {
  const goals: TargetGoal[] = ['wealth', 'fame', 'love', 'spiritual'];
  const map: Record<string, any[]> = {};
  for (const g of goals) {
    map[g] = PhoneticChakraEngine.getRecommendedNamesForMissingChakras(missingChakras, g).slice(0, 6);
  }
  return map;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, birthDate, name, additionalName, brandName } = body;

    if (action === 'simulateName') {
      if (!name) return errorJson('İsim gerekli.', 400);
      const simulation = PhoneticChakraEngine.simulatePersonalName(name, additionalName || '');
      const recommendedByGoal = buildRecommendedByGoal(simulation.originalMissing);
      return json({ simulation, recommendedByGoal });
    }

    if (action === 'analyzeBrand') {
      if (!brandName) return errorJson('Marka adı gerekli.', 400);
      const brandResult = PhoneticChakraEngine.analyzeBrand(brandName);
      return json({ brandResult });
    }

    if (!birthDate) {
      return errorJson('Eksik parametreler.', 400);
    }

    const lifePath = calculateLifePath(birthDate);
    const birthday = getBirthdayNumber(birthDate);
    const arrows = calculateArrows(birthDate);
    const personalYear = calculatePersonalYear(birthDate);

    let nameAnalysis = null;
    let simulation = null;
    let recommendedByGoal = null;
    if (name) {
      nameAnalysis = calculateNameAnalysis(name);
      simulation = PhoneticChakraEngine.simulatePersonalName(name, additionalName || '');
      recommendedByGoal = buildRecommendedByGoal(simulation.originalMissing);
    }

    return json({
      lifePath,
      birthday,
      arrows,
      personalYear,
      nameAnalysis,
      simulation,
      recommendedByGoal,
    });
  } catch (error: any) {
    console.error('Numerology API Error:', error);
    return errorJson('Hesaplama sırasında bir hata oluştu.', 500);
  }
}
