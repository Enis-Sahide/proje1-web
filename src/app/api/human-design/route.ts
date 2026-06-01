import { NextResponse } from 'next/server';
import { generateChart } from '@/utils/HumanDesignEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, month, day, hour, minute, lat, lon, tz } = body;

    if (!year || !month || !day || hour === undefined || minute === undefined || !lat || !lon || !tz) {
      return NextResponse.json({ error: 'Eksik parametreler.' }, { status: 400 });
    }

    // Backend (Sunucu) tarafında astromik hesaplamayı gerçekleştiriyoruz
    const moment = require('moment-timezone');
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const m = moment.tz(dateString, "YYYY-MM-DD HH:mm", tz);
    const chartData = generateChart(m.toDate());

    return NextResponse.json(chartData);
  } catch (error: any) {
    console.error('Human Design API Error:', error);
    return NextResponse.json({ error: 'Hesaplama sırasında bir hata oluştu.' }, { status: 500 });
  }
}
