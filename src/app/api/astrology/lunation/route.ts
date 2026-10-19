import { NextRequest } from 'next/server';
import { 
  getActiveOrNextLunation, 
  getActiveSolarEclipse, 
  calculateLunationHouse, 
  SIGN_LUNATION_INTERPRETATIONS, 
  HOUSE_LUNATION_INTERPRETATIONS,
  MOON_PHASES_DATA,
  LUNATION_DURATIONS,
  LunationEvent
} from '@/features/astrology/engine/LunationEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

/**
 * GET handler: Hedef tarihe göre aktif Yeni Ay/Dolunay/Tutulma ve 6 Aylık Güneş Tutulması Kadersel Çatısını döner.
 * Query parametreleri: date (ISO format), eventUtcDate (spesifik olay)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const eventUtcDate = searchParams.get('eventUtcDate');

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    if (isNaN(targetDate.getTime())) {
      return errorJson('Geçersiz tarih formatı.', 400, { success: false });
    }

    let activeResult = getActiveOrNextLunation(targetDate);
    let event = activeResult.event;
    let statusText = activeResult.statusText;
    let durationInfo = activeResult.durationInfo;
    let daysDiff = activeResult.daysDiff;

    // Eğer spesifik bir olay istendiyse takvimden bul
    if (eventUtcDate) {
      const found = MOON_PHASES_DATA.find(e => e.utcDate === eventUtcDate);
      if (found) {
        event = found;
        durationInfo = LUNATION_DURATIONS[found.phase];
        daysDiff = Math.round((new Date(found.utcDate).getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
        statusText = daysDiff === 0 
          ? 'Bugün Gerçekleşiyor (Pik Gün)!' 
          : daysDiff > 0 
            ? `${daysDiff} gün sonra gerçekleşecek` 
            : `Etkisi Devam Ediyor (${Math.abs(daysDiff)} gün önce gerçekleşti)`;
      }
    }

    const activeSolarEclipse = getActiveSolarEclipse(targetDate);
    const signInterpretation = SIGN_LUNATION_INTERPRETATIONS[event.sign]?.[event.phase] || null;

    return json({
      success: true,
      data: {
        event,
        statusText,
        durationInfo,
        daysDiff,
        isExactOrActive: activeResult.isExactOrActive,
        activeSolarEclipse,
        signInterpretation,
        personal: null,
      },
    });
  } catch (error: any) {
    console.error('Lunation API GET Error:', error);
    return errorJson(error.message || 'Ay döngüsü analizi alınamadı.', 500, { success: false });
  }
}

/**
 * POST handler: Kişisel doğum haritası evleri (natalHouses) ile birlikte zenginleştirilmiş analiz.
 * Body: { targetDate?: string, natalHouses?: Array<{ house: number, sign: string }>, eventUtcDate?: string }
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // body can be empty
    }

    const targetDate = body.targetDate ? new Date(body.targetDate) : new Date();
    if (isNaN(targetDate.getTime())) {
      return errorJson('Geçersiz tarih formatı.', 400, { success: false });
    }

    let activeResult = getActiveOrNextLunation(targetDate);
    let event = activeResult.event;
    let statusText = activeResult.statusText;
    let durationInfo = activeResult.durationInfo;
    let daysDiff = activeResult.daysDiff;

    if (body.eventUtcDate) {
      const found = MOON_PHASES_DATA.find(e => e.utcDate === body.eventUtcDate);
      if (found) {
        event = found;
        durationInfo = LUNATION_DURATIONS[found.phase];
        daysDiff = Math.round((new Date(found.utcDate).getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
        statusText = daysDiff === 0 
          ? 'Bugün Gerçekleşiyor (Pik Gün)!' 
          : daysDiff > 0 
            ? `${daysDiff} gün sonra gerçekleşecek` 
            : `Etkisi Devam Ediyor (${Math.abs(daysDiff)} gün önce gerçekleşti)`;
      }
    }

    const activeSolarEclipse = getActiveSolarEclipse(targetDate);
    const signInterpretation = SIGN_LUNATION_INTERPRETATIONS[event.sign]?.[event.phase] || null;

    // Kişisel Natal Ev Portalı Hesabı
    let personal = null;
    if (Array.isArray(body.natalHouses) && body.natalHouses.length > 0) {
      const houseNumber = calculateLunationHouse(event.sign, body.natalHouses);
      const houseInterp = HOUSE_LUNATION_INTERPRETATIONS[houseNumber]?.[event.phase];
      if (houseInterp) {
        personal = {
          houseNumber,
          title: houseInterp.title,
          portalName: houseInterp.portalName,
          portalMeaning: houseInterp.portalMeaning,
          shadowState: houseInterp.shadowState,
          elevatedState: houseInterp.elevatedState,
          spiritualAdvice: houseInterp.spiritualAdvice,
          personalImpact: houseInterp.personalImpact,
          advice: houseInterp.advice,
        };
      }
    }

    return json({
      success: true,
      data: {
        event,
        statusText,
        durationInfo,
        daysDiff,
        isExactOrActive: activeResult.isExactOrActive,
        activeSolarEclipse,
        signInterpretation,
        personal,
      },
    });
  } catch (error: any) {
    console.error('Lunation API POST Error:', error);
    return errorJson(error.message || 'Kişisel ay döngüsü analizi hesaplanırken hata oluştu.', 500, { success: false });
  }
}
