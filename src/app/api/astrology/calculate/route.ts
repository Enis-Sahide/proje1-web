import { NextRequest } from 'next/server';
import { generateAstrologyChart, calculateDraconicChart, calculateHarmonicChart } from '@/features/astrology/engine/AstrologyEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';
import moment from 'moment-timezone';

export async function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { localDate, localTime, cityData, calcAllWorlds } = body;

    if (!localDate || !localTime || !cityData) {
      return errorJson('Tarih, saat veya şehir eksik', 400);
    }

    const momentObj = moment.tz(`${localDate} ${localTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const dateObj = momentObj.toDate();

    if (isNaN(dateObj.getTime())) {
      return errorJson('Geçersiz tarih formatı.', 400);
    }

    const assiahChart = await generateAstrologyChart(dateObj, cityData, false);

    if (calcAllWorlds) {
      const yetzirahChart = calculateDraconicChart(assiahChart);
      const beriyahChart = calculateHarmonicChart(assiahChart, 9);
      const atzilutChart = await generateAstrologyChart(dateObj, cityData, true); // Heliocentric
      
      return json({
        success: true,
        data: {
          assiah: assiahChart,
          yetzirah: yetzirahChart,
          beriyah: beriyahChart,
          atzilut: atzilutChart
        }
      });
    }

    return json({
      success: true,
      data: assiahChart,
    });
  } catch (error: any) {
    console.error('Astrology API Error:', error);
    return errorJson(error.message || 'Hesaplama sırasında bir hata oluştu.', 500, { success: false });
  }
}
