import { NextRequest } from 'next/server';
import { generateAstrologyChart, calculateDraconicChart, calculateHarmonicChart } from '@/features/astrology/engine/AstrologyEngine';
import { getFullPlanetInterpretation, getHouseCuspInterpretation } from '@/features/astrology/engine/AstrologyInterpretations';
import { json, errorJson, preflight } from '@/lib/http/cors';
import moment from 'moment-timezone';

export async function OPTIONS() {
  return preflight();
}

function enrichChartWithInterpretations(chart: any) {
  if (!chart) return chart;
  const enrichPoint = (p: any) => p ? ({
    ...p,
    interpretation: getFullPlanetInterpretation(p.name, p.sign, p.house)
  }) : p;

  return {
    ...chart,
    planets: Array.isArray(chart.planets) ? chart.planets.map(enrichPoint) : chart.planets,
    ascendant: enrichPoint(chart.ascendant),
    midheaven: enrichPoint(chart.midheaven),
    houses: Array.isArray(chart.houses) ? chart.houses.map((h: any) => ({
      ...h,
      interpretation: getHouseCuspInterpretation(h.house, h.sign)
    })) : chart.houses,
  };
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

    const rawAssiahChart = await generateAstrologyChart(dateObj, cityData, false);
    const assiahChart = enrichChartWithInterpretations(rawAssiahChart);

    if (calcAllWorlds) {
      const yetzirahChart = enrichChartWithInterpretations(calculateDraconicChart(rawAssiahChart));
      const beriyahChart = enrichChartWithInterpretations(calculateHarmonicChart(rawAssiahChart, 9));
      const atzilutChart = enrichChartWithInterpretations(await generateAstrologyChart(dateObj, cityData, true));
      
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
