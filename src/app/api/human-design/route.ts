import { generateChart } from '@/utils/HumanDesignEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';

export async function OPTIONS() {
  return preflight();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute, lat, lon, tz } = body;

    if (!year || !month || !day || hour === undefined || minute === undefined || !lat || !lon || !tz) {
      return errorJson('Eksik parametreler.', 400);
    }

    const moment = require('moment-timezone');
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const m = moment.tz(dateString, "YYYY-MM-DD HH:mm", tz);
    const chartData = generateChart(m.toDate());

    return json(chartData);
  } catch (error: any) {
    console.error('Human Design API Error:', error);
    return errorJson('Hesaplama sırasında bir hata oluştu.', 500);
  }
}
