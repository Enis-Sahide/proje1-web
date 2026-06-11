import { NextResponse } from 'next/server';
import { generateTransitChart } from '@/features/astrology/engine/AstrologyEngine';

export async function POST(req: Request) {
  try {
    const { natalDate, transitDate, cityKey } = await req.json();

    if (!natalDate || !transitDate || !cityKey) {
      return NextResponse.json({ success: false, error: 'Doğum tarihi, transit tarihi ve şehir zorunludur.' }, { status: 400 });
    }

    const nDate = new Date(natalDate);
    const tDate = new Date(transitDate);

    const transitData = await generateTransitChart(nDate, tDate, cityKey);

    return NextResponse.json({ success: true, data: transitData });
  } catch (error: any) {
    console.error('Transit chart error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
