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
    const { natalDate, natalTime, transitDate, transitTime, cityData, transitCityData } = body;

    if (!natalDate || !natalTime || !transitDate || !transitTime || !cityData) {
      return errorJson('Eksik parametreler.', 400, { success: false });
    }

    const normCity = {
      name: cityData.name || 'İstanbul',
      lat: cityData.lat ?? cityData.latitude ?? 41.0082,
      lon: cityData.lon ?? cityData.longitude ?? 28.9784,
      tz: cityData.tz || cityData.timezone || 'Europe/Istanbul',
      country: cityData.country || 'Türkiye'
    };

    const rawTCity = transitCityData || cityData;
    const normTCity = {
      name: rawTCity.name || normCity.name,
      lat: rawTCity.lat ?? rawTCity.latitude ?? normCity.lat,
      lon: rawTCity.lon ?? rawTCity.longitude ?? normCity.lon,
      tz: rawTCity.tz || rawTCity.timezone || normCity.tz,
      country: rawTCity.country || normCity.country
    };

    const nMoment = moment.tz(`${natalDate} ${natalTime}:00`, 'YYYY-MM-DD HH:mm:ss', normCity.tz);
    const nDateObj = nMoment.toDate();

    const tMoment = moment.tz(`${transitDate} ${transitTime}:00`, 'YYYY-MM-DD HH:mm:ss', normTCity.tz);
    const tDateObj = tMoment.toDate();

    if (isNaN(nDateObj.getTime()) || isNaN(tDateObj.getTime())) {
      return errorJson('Geçersiz tarih formatı.', 400, { success: false });
    }

    const transitData = await generateTransitChart(nDateObj, tDateObj, normCity, normTCity);

    return json({
      success: true,
      data: transitData
    });
  } catch (error: any) {
    console.error('Calculate Transit API Error:', error);
    return errorJson(error.message || 'Hesaplama sırasında bir hata oluştu.', 500, { success: false });
  }
}
