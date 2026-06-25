import { generateTransitChart } from '@/features/astrology/engine/AstrologyEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';

export async function OPTIONS() {
  return preflight();
}

export async function POST(req: Request) {
  try {
    const { natalDate, transitDate, cityKey } = await req.json();

    if (!natalDate || !transitDate || !cityKey) {
      return errorJson('Doğum tarihi, transit tarihi ve şehir zorunludur.', 400, { success: false });
    }

    const nDate = new Date(natalDate);
    const tDate = new Date(transitDate);

    const transitData = await generateTransitChart(nDate, tDate, cityKey);

    return json({ success: true, data: transitData });
  } catch (error: any) {
    console.error('Transit chart error:', error);
    return errorJson(error.message, 500, { success: false });
  }
}
