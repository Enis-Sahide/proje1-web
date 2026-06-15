import { NextResponse } from 'next/server';
import { calculateLifePath, calculatePersonalYear, calculateArrows, getBirthdayNumber, calculateNameAnalysis } from '@/utils/numerologyCalculator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthDate, name } = body;

    if (!birthDate) {
      return NextResponse.json({ error: 'Eksik parametreler.' }, { status: 400 });
    }

    const lifePath = calculateLifePath(birthDate);
    const birthday = getBirthdayNumber(birthDate);
    const arrows = calculateArrows(birthDate);
    const personalYear = calculatePersonalYear(birthDate);

    let nameAnalysis = null;
    if (name) {
      nameAnalysis = calculateNameAnalysis(name);
    }

    return NextResponse.json({
      lifePath,
      birthday,
      arrows,
      personalYear,
      nameAnalysis
    });
  } catch (error: any) {
    console.error('Numerology API Error:', error);
    return NextResponse.json({ error: 'Hesaplama sırasında bir hata oluştu.' }, { status: 500 });
  }
}
