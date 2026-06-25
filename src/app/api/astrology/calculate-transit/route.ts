import { NextRequest } from 'next/server';
import { generateTransitChart } from '@/features/astrology/engine/AstrologyEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';
import moment from 'moment-timezone';

export async function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { natalDate, natalTime, transitDate, transitTime, cityData } = body;

    if (!natalDate || !natalTime || !transitDate || !transitTime || !cityData) {
      return errorJson('Eksik parametreler.', 400, { success: false });
    }

    const nMoment = moment.tz(`${natalDate} ${natalTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const nDateObj = nMoment.toDate();

    const tMoment = moment.tz(`${transitDate} ${transitTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const tDateObj = tMoment.toDate();

    if (isNaN(nDateObj.getTime()) || isNaN(tDateObj.getTime())) {
      return errorJson('Geçersiz tarih formatı.', 400, { success: false });
    }

    const transitData = await generateTransitChart(nDateObj, tDateObj, cityData);

    return json({
      success: true,
      data: transitData
    });
  } catch (error: any) {
    console.error('Calculate Transit API Error:', error);
    return errorJson(error.message || 'Hesaplama sırasında bir hata oluştu.', 500, { success: false });
  }
}
