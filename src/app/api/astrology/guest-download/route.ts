import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { json, errorJson } from '@/lib/http/cors';
import { eq } from 'drizzle-orm';
import moment from 'moment-timezone';
import { generateAstrologyChart, calculateDraconicChart, calculateHarmonicChart } from '@/features/astrology/engine/AstrologyEngine';
import { getKabbalahAnalysis } from '@/features/astrology/engine/KabbalahInterpretations';
import { getEsotericPlanetInterpretation } from '@/features/astrology/engine/KabbalahPlanetInterpretations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return errorJson('İndirme belirteci eksik', 400);
    }
    
    // Check if downloadToken matches and paymentStatus is success
    const [order] = await db.select()
      .from(guestOrders)
      .where(eq(guestOrders.downloadToken, token));
      
    if (!order) {
      return errorJson('Geçersiz veya süresi dolmuş indirme belirteci', 404);
    }
    
    if (order.paymentStatus !== 'success') {
      return errorJson('Bu sipariş için ödeme tamamlanmamış', 402);
    }
    
    // Validate order timeframe (e.g. valid for 48 hours for a good user experience)
    const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
    if (orderAgeMs > 48 * 60 * 60 * 1000) {
      return errorJson('İndirme bağlantısının 48 saatlik geçerlilik süresi dolmuştur', 410);
    }
    
    const { localDate, localTime, cityData } = order.birthData as any;
    
    const momentObj = moment.tz(`${localDate} ${localTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const dateObj = momentObj.toDate();
    
    if (isNaN(dateObj.getTime())) {
      return errorJson('Doğum bilgileri geçersiz tarih formatı içeriyor.', 400);
    }
    
    let resultData: any = {};
    
    if (order.analysisType === 'kabbalah') {
      // Calculate all 4 charts
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
      
      resultData = {
        charts,
        kabbalahAnalysis,
        interpretations
      };
    } else if (order.analysisType === 'human-design' || order.analysisType === 'human_design') {
      const { generateChart } = require('@/utils/HumanDesignEngine');
      const { hdGates } = require('@/db/schema');
      const chartData = generateChart(dateObj);
      const gates = await db.select().from(hdGates);
      resultData = {
        chartData,
        gatesData: gates
      };
    } else {
      // Standard Esoteric Astrology Chart
      const assiahChart = await generateAstrologyChart(dateObj, cityData, false);
      resultData = {
        chartData: assiahChart
      };
    }
    
    return json({
      success: true,
      email: order.email,
      analysisType: order.analysisType,
      birthData: order.birthData,
      result: resultData
    });
  } catch (error: any) {
    console.error('Guest download error:', error);
    return errorJson('Veriler hesaplanamadı: ' + error.message, 500);
  }
}
