import { NextRequest } from 'next/server';
import { generateAstrologyChart } from '@/features/astrology/engine/AstrologyEngine';
import { calculateIncarnationAnalysis } from '@/features/astrology/engine/IncarnationEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';
import moment from 'moment-timezone';

export async function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { localDate, localTime, cityData } = body;

    if (!localDate || !localTime || !cityData) {
      return errorJson('Tarih, saat veya şehir bilgisi eksik', 400);
    }

    const tz = cityData.tz || 'Europe/Istanbul';
    const momentObj = moment.tz(`${localDate} ${localTime}:00`, 'YYYY-MM-DD HH:mm:ss', tz);
    const dateObj = momentObj.toDate();

    if (isNaN(dateObj.getTime())) {
      return errorJson('Geçersiz tarih veya saat formatı.', 400);
    }

    // 1. Natal haritayı hesapla
    const natalChart = await generateAstrologyChart(dateObj, cityData, false);

    // 2. Karmik & Enkarnasyon analizini üret
    const incarnationData = calculateIncarnationAnalysis(natalChart);

    return json({
      success: true,
      data: {
        natalChart,
        incarnation: incarnationData,
        birthInfo: {
          localDate,
          localTime,
          cityName: cityData.name,
          country: cityData.country
        }
      }
    });
  } catch (error: any) {
    console.error('Karmik & Enkarnasyon hesaplama API hatası:', error);
    return errorJson(error.message || 'Karmik analiz hesaplanırken bir sunucu hatası oluştu.', 500);
  }
}
