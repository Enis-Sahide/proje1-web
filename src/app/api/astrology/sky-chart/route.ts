import { NextRequest } from 'next/server';
import { generateAstrologyChart, ASTRO_CITIES } from '@/features/astrology/engine/AstrologyEngine';
import { getSkyAspectInterpretation } from '@/features/astrology/engine/SkyAspectInterpretations';
import { json, errorJson, preflight } from '@/lib/http/cors';
import moment from 'moment-timezone';

export async function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // body can be empty for default today
    }

    const today = new Date();
    const dateStr = body.dateStr || today.toISOString().split('T')[0];
    const timeStr = body.timeStr || today.toTimeString().slice(0, 5);
    const city = body.cityData || ASTRO_CITIES.find(c => c.name === 'İstanbul') || ASTRO_CITIES[0];

    const mObj = moment.tz(`${dateStr} ${timeStr}:00`, 'YYYY-MM-DD HH:mm:ss', city.tz || 'Europe/Istanbul');
    const dateObj = mObj.toDate();

    if (isNaN(dateObj.getTime())) {
      return errorJson('Geçersiz tarih formatı.', 400, { success: false });
    }

    // Generate Chart for the sky moment
    const skyChart = await generateAstrologyChart(dateObj, city, false);

    // Mundane / Anlık Gökyüzü için katı orb filtresi:
    // Ay hızlı hareket ettiği için maks 4.5°, diğer gezegenler için maks 3.5°, Görmeyen için maks 2.0°
    const mundaneAspects = (skyChart.aspects || []).filter(asp => {
      const hasMoon = asp.planet1 === 'Ay' || asp.planet2 === 'Ay';
      if (asp.type === 'Görmeyen') return asp.orb <= 2.0;
      const maxOrb = hasMoon ? 4.5 : 3.5;
      return asp.orb <= maxOrb;
    });

    // Kesinlik önceliğine göre küçükten büyüğe sırala (0.0° tam kesin pik yapanlar en başta)
    mundaneAspects.sort((a, b) => a.orb - b.orb);

    // Enrich aspects with rich interpretations and orb intensity badges
    const enrichedAspects = mundaneAspects.map(asp => {
      const interp = getSkyAspectInterpretation(asp.planet1, asp.planet2, asp.type);
      let orbLevel: 'exact' | 'strong' | 'moderate' = 'moderate';
      let orbLabel = 'Gelişen / Ayrılan (Hafif)';
      if (asp.orb <= 1.0) {
        orbLevel = 'exact';
        orbLabel = 'Tam Kesin / Zirve (Pik)';
      } else if (asp.orb <= 2.5) {
        orbLevel = 'strong';
        orbLabel = 'Aktif & Yoğun';
      }

      return {
        ...asp,
        orbLevel,
        orbLabel,
        interpretation: interp
      };
    });

    return json({
      success: true,
      data: {
        date: dateStr,
        time: timeStr,
        city: city.name,
        planets: skyChart.planets,
        ascendant: skyChart.ascendant,
        midheaven: skyChart.midheaven,
        houses: skyChart.houses,
        aspects: enrichedAspects
      }
    });
  } catch (error: any) {
    console.error('Sky Chart API Error:', error);
    return errorJson(error.message || 'Gökyüzü haritası hesaplanırken bir hata oluştu.', 500, { success: false });
  }
}
