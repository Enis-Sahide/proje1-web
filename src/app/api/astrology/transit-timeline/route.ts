import { NextRequest } from 'next/server';
import { generateAstrologyChart } from '@/features/astrology/engine/AstrologyEngine';
import { calculateTransitTimeline } from '@/features/astrology/engine/TransitTimelineEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';
import moment from 'moment-timezone';

export async function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      natalDate, 
      natalTime, 
      cityData, 
      range = '1m', 
      startDateStr,
      categoryFilter = 'ALL' 
    } = body;

    if (!natalDate || !natalTime || !cityData) {
      return errorJson('Eksik parametreler. Doğum tarihi, saati ve şehri gereklidir.', 400, { success: false });
    }

    const nMoment = moment.tz(`${natalDate} ${natalTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz || 'Europe/Istanbul');
    const nDateObj = nMoment.toDate();

    if (isNaN(nDateObj.getTime())) {
      return errorJson('Geçersiz doğum tarihi formatı.', 400, { success: false });
    }

    // 1. Generate Natal Chart
    const natalChart = await generateAstrologyChart(nDateObj, cityData, false);

    // Combine planets with ASC and MC so they can be aspected by transits
    const allNatalPoints = [...natalChart.planets, natalChart.ascendant, natalChart.midheaven];

    // 2. Determine Timeline Start and End Date
    const today = new Date();
    const startObj = startDateStr ? new Date(startDateStr) : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    let daysToAdd = 30;
    if (range === '3m') daysToAdd = 90;
    else if (range === '6m') daysToAdd = 180;
    else if (range === '1y') daysToAdd = 365;

    const endObj = new Date(startObj.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    // 3. Compute Timeline
    const timelineItems = await calculateTransitTimeline(allNatalPoints, startObj, endObj, {
      categoryFilter: categoryFilter as any
    });

    return json({
      success: true,
      data: {
        startDate: startObj.toISOString().split('T')[0],
        endDate: endObj.toISOString().split('T')[0],
        range,
        categoryFilter,
        totalItems: timelineItems.length,
        items: timelineItems
      }
    });
  } catch (error: any) {
    console.error('Transit Timeline API Error:', error);
    return errorJson(error.message || 'Transit zaman çizelgesi hesaplanırken bir hata oluştu.', 500, { success: false });
  }
}
