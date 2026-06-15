import { NextRequest, NextResponse } from 'next/server';
import { generateTransitChart } from '@/features/astrology/engine/AstrologyEngine';
import moment from 'moment-timezone';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { natalDate, natalTime, transitDate, transitTime, cityData } = body;

    if (!natalDate || !natalTime || !transitDate || !transitTime || !cityData) {
      return NextResponse.json({ success: false, error: 'Eksik parametreler.' }, { status: 400 });
    }

    const nMoment = moment.tz(`${natalDate} ${natalTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const nDateObj = nMoment.toDate();

    const tMoment = moment.tz(`${transitDate} ${transitTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const tDateObj = tMoment.toDate();

    if (isNaN(nDateObj.getTime()) || isNaN(tDateObj.getTime())) {
      return NextResponse.json({ success: false, error: 'Geçersiz tarih formatı.' }, { status: 400 });
    }

    const transitData = await generateTransitChart(nDateObj, tDateObj, cityData);

    return NextResponse.json({
      success: true,
      data: transitData
    });
  } catch (error: any) {
    console.error('Calculate Transit API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Hesaplama sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
