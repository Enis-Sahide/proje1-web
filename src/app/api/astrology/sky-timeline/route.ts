import { NextRequest } from 'next/server';
import { calculateMundaneTimeline } from '@/features/astrology/engine/TransitTimelineEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';

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
      categoryFilter = 'ALL' 
    } = body;

    const today = new Date();
    const startObj = startDateStr 
      ? new Date(startDateStr) 
      : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    let daysToAdd = 30;
    if (range === '3m') daysToAdd = 90;
    else if (range === '6m') daysToAdd = 180;
    else if (range === '1y') daysToAdd = 365;

    const endObj = new Date(startObj.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    // Compute Mundane Timeline (independent of natal chart)
    const timelineItems = await calculateMundaneTimeline(startObj, endObj, {
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
    console.error('Sky Timeline API Error:', error);
    return errorJson(error.message || 'Gökyüzü zaman çizelgesi hesaplanırken bir hata oluştu.', 500, { success: false });
  }
}
