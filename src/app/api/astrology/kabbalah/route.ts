import { NextRequest } from 'next/server';
import { generateAstrologyChart, calculateDraconicChart, calculateHarmonicChart } from '@/features/astrology/engine/AstrologyEngine';
import { getKabbalahAnalysis } from '@/features/astrology/engine/KabbalahInterpretations';
import { getEsotericPlanetInterpretation } from '@/features/astrology/engine/KabbalahPlanetInterpretations';
import { json, errorJson, preflight } from '@/lib/http/cors';
import moment from 'moment-timezone';

export async function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { localDate, localTime, cityData } = body;

    if (!localDate || !localTime || !cityData) {
      return errorJson('Tarih, saat veya şehir eksik', 400);
    }

    const momentObj = moment.tz(`${localDate} ${localTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const dateObj = momentObj.toDate();

    if (isNaN(dateObj.getTime())) {
      return errorJson('Geçersiz tarih formatı.', 400);
    }

    // Generate all 4 charts
    const assiahChart = await generateAstrologyChart(dateObj, cityData, false);
    const yetzirahChart = calculateDraconicChart(assiahChart);
    const beriyahChart = calculateHarmonicChart(assiahChart, 9);
    const atzilutChart = await generateAstrologyChart(dateObj, cityData, true); // Heliocentric

    // Generate Kabbalah analysis text details
    const kabbalahAnalysis = getKabbalahAnalysis(localDate);

    // Pre-calculate interpretations for planets in all 4 worlds
    const worlds = ['assiah', 'yetzirah', 'beriyah', 'atzilut'] as const;
    const charts = {
      assiah: assiahChart,
      yetzirah: yetzirahChart,
      beriyah: beriyahChart,
      atzilut: atzilutChart
    };

    const interpretations: Record<string, Record<string, { title: string; content: string }>> = {
      assiah: {},
      yetzirah: {},
      beriyah: {},
      atzilut: {}
    };

    for (const world of worlds) {
      const chart = charts[world];
      const isYetzirah = world === 'yetzirah';
      const isBeriyah = world === 'beriyah';
      const isAtzilut = world === 'atzilut';

      for (const p of chart.planets) {
        const interp = getEsotericPlanetInterpretation(
          p.name,
          p.sign,
          p.house,
          isYetzirah,
          isBeriyah,
          isAtzilut,
          p.isRetrograde
        );
        interpretations[world][p.name] = interp;
      }
    }

    return json({
      success: true,
      data: {
        charts,
        kabbalahAnalysis,
        interpretations
      }
    });
  } catch (error: any) {
    console.error('Kabbalah API Error:', error);
    return errorJson(error.message || 'Kabbalah hesaplama hatası.', 500);
  }
}
