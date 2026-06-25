import { calculateLifePath, calculatePersonalYear, calculateArrows, getBirthdayNumber, calculateNameAnalysis } from '@/utils/numerologyCalculator';
import { json, errorJson, preflight } from '@/lib/http/cors';

export async function OPTIONS() {
  return preflight();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthDate, name } = body;

    if (!birthDate) {
      return errorJson('Eksik parametreler.', 400);
    }

    const lifePath = calculateLifePath(birthDate);
    const birthday = getBirthdayNumber(birthDate);
    const arrows = calculateArrows(birthDate);
    const personalYear = calculatePersonalYear(birthDate);

    let nameAnalysis = null;
    if (name) {
      nameAnalysis = calculateNameAnalysis(name);
    }

    return json({
      lifePath,
      birthday,
      arrows,
      personalYear,
      nameAnalysis
    });
  } catch (error: any) {
    console.error('Numerology API Error:', error);
    return errorJson('Hesaplama sırasında bir hata oluştu.', 500);
  }
}
