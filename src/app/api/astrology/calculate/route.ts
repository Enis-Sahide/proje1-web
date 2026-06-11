import { NextRequest, NextResponse } from 'next/server';
import { generateAstrologyChart, calculateDraconicChart, calculateHarmonicChart } from '@/features/astrology/engine/AstrologyEngine';
import { ASTRO_CITIES } from '@/features/astrology/engine/AstrologyConstants';
import moment from 'moment-timezone';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { localDate, localTime, cityData, calcAllWorlds } = body;

    if (!localDate || !localTime || !cityData) {
      return NextResponse.json({ success: false, error: 'Tarih, saat veya şehir eksik' }, { status: 400 });
    }

    const momentObj = moment.tz(`${localDate} ${localTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const dateObj = momentObj.toDate();

    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: 'Geçersiz tarih formatı.' }, { status: 400 });
    }

    // Always calculate Assiah (Base Tropical Chart)
    const assiahChart = await generateAstrologyChart(dateObj, cityData, false);

    if (calcAllWorlds) {
      // Calculate remaining 3 worlds
      const yetzirahChart = calculateDraconicChart(assiahChart);
      const beriyahChart = calculateHarmonicChart(assiahChart, 9);
      const atzilutChart = await generateAstrologyChart(dateObj, cityData, true); // Heliocentric
      
      return NextResponse.json({
        success: true,
        data: {
          assiah: assiahChart,
          yetzirah: yetzirahChart,
          beriyah: beriyahChart,
          atzilut: atzilutChart
        }
      });
    }

    // Default return for standard astrology calls
    return NextResponse.json({
      success: true,
      data: assiahChart,
    });
  } catch (error: any) {
    console.error('Astrology API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Hesaplama sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
