import { NextRequest } from 'next/server';
import { calculateMundaneTimeline } from '@/features/astrology/engine/TransitTimelineEngine';
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
      // body can be empty
    }

    const { 
      range = '1m', 
      startDateStr,
      categoryFilter = 'ALL',
      userTz,
      tzOffsetHours: clientTzOffset
    } = body;

    let tzOffsetHours = 3;
    let activeTimeZone = userTz || 'Europe/Istanbul';

    if (typeof clientTzOffset === 'number' && !isNaN(clientTzOffset)) {
      tzOffsetHours = clientTzOffset;
    } else if (userTz) {
      try {
        tzOffsetHours = moment.tz(userTz).utcOffset() / 60;
      } catch {
        tzOffsetHours = 3;
      }
    }

    const today = new Date();
    const startObj = startDateStr 
      ? new Date(startDateStr) 
      : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    let daysToAdd = 30;
    if (range === '3m') daysToAdd = 90;
    else if (range === '6m') daysToAdd = 180;
    else if (range === '1y') daysToAdd = 365;

    const endObj = new Date(startObj.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    // Compute Mundane Timeline (independent of natal chart) with user's local timezone
    const timelineItems = await calculateMundaneTimeline(startObj, endObj, {
      categoryFilter: categoryFilter as any,
      tzOffsetHours
    });

    return json({
      success: true,
      data: {
        startDate: startObj.toISOString().split('T')[0],
        endDate: endObj.toISOString().split('T')[0],
        range,
        categoryFilter,
        timeZone: activeTimeZone,
        tzOffsetHours,
        totalItems: timelineItems.length,
        items: timelineItems
      }
    });
  } catch (error: any) {
    console.error('Sky Timeline API Error:', error);
    return errorJson(error.message || 'Gökyüzü zaman çizelgesi hesaplanırken bir hata oluştu.', 500, { success: false });
  }
}
