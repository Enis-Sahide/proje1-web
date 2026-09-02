import { NextRequest } from 'next/server';
import { runAutomatedRectification, RectificationInput } from '@/features/astrology/engine/RectificationEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';

export async function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RectificationInput;
    const { dateMode = 'exact', birthDate, birthYear, birthMonth, birthSeason, birthCity, events } = body;

    if (!birthCity) {
      return errorJson('Doğum şehri seçimi zorunludur.', 400);
    }

    if (dateMode === 'exact' && !birthDate) {
      return errorJson('Doğum tarihi zorunludur.', 400);
    }

    if (dateMode === 'month' && (!birthYear || !birthMonth)) {
      return errorJson('Doğum yılı ve ayı zorunludur.', 400);
    }

    if (dateMode === 'season' && (!birthYear || !birthSeason)) {
      return errorJson('Doğum yılı ve mevsimi zorunludur.', 400);
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return errorJson('Rektifikasyon hesaplaması için en az bir kadersel yaşam olayı gereklidir.', 400);
    }

    const result = await runAutomatedRectification(body);

    return json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Rectification API Error:', error);
    return errorJson(error.message || 'Rektifikasyon hesaplaması sırasında beklenmedik bir hata oluştu.', 500, { success: false });
  }
}
