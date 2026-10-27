import { NextRequest, NextResponse } from 'next/server';
import { CareerEngine } from '@/features/astrology/engine/CareerEngine';
import { AstroCity, ASTRO_CITIES } from '@/features/astrology/engine/AstrologyConstants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, birthDate, birthTime, birthCity } = body;

    if (!fullName || !birthDate || !birthCity) {
      return NextResponse.json(
        { error: 'Ad Soyad, Doğum Tarihi ve Doğum Yeri zorunludur.' },
        { status: 400 }
      );
    }

    const cityData: AstroCity = typeof birthCity === 'string'
      ? ASTRO_CITIES.find(c => c.name.toLowerCase() === birthCity.toLowerCase()) || ASTRO_CITIES[0]
      : birthCity;

    const result = await CareerEngine.analyze(
      fullName.trim(),
      birthDate,
      birthTime || '12:00',
      cityData
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Career calculation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Mesleki analiz hesaplanırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
