import { NextRequest } from 'next/server';
import { generateAstrologyChart } from '@/features/astrology/engine/AstrologyEngine';
import { calculateIncarnationAnalysis } from '@/features/astrology/engine/IncarnationEngine';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
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

    // 2. Karmik & Enkarnasyon analizini üret (Human Design sentezi için dateObj ile)
    let incarnationData = calculateIncarnationAnalysis(natalChart, dateObj);

    // 3. Kullanıcı yetkisini doğrula (Master veya Admin mi?)
    const payload = await getAuthPayload(req);
    const isMasterOrAdmin = payload && (payload.role === 'master' || payload.role === 'admin');

    // Eğer Master veya Admin değilse: Derin ezoterik sırları sunucu tarafında maskele (Crack geçirmez koruma)
    if (!isMasterOrAdmin) {
      const MASKED = "Bu derin karmik analiz Usta Seviyesi üyelere ve PDF Raporuna özeldir.";
      incarnationData = {
        ...incarnationData,
        twelfthHouse: {
          ...incarnationData.twelfthHouse,
          lastBreathAtmosphere: MASKED,
          subconsciousGift: MASKED,
          hiddenFear: MASKED,
          planetsIn12th: incarnationData.twelfthHouse.planetsIn12th.map(p => ({
            ...p,
            meaning: MASKED
          }))
        },
        retroDebts: incarnationData.retroDebts.map(d => ({
          ...d,
          pastLifeCause: MASKED,
          currentLifeKarma: MASKED,
          dharmaRemedy: MASKED,
          hdDiagnosis: MASKED
        })),
        chiron: incarnationData.chiron ? {
          ...incarnationData.chiron,
          wound: {
            ...incarnationData.chiron.wound,
            woundDescription: MASKED,
            healingGift: MASKED,
            soulRemedy: MASKED
          }
        } : null,
        kad: {
          ...incarnationData.kad,
          seed: {
            ...incarnationData.kad.seed,
            evolutionGoal: MASKED,
            nextIncarnationPotential: MASKED,
            sacredPractice: MASKED
          }
        },
        draconicComparison: incarnationData.draconicComparison.map(c => ({
          ...c,
          spiritualMeaning: MASKED,
          draconicMeaning: MASKED,
          synthesis: MASKED
        })),
        progressedEvolution: incarnationData.progressedEvolution ? {
          ...incarnationData.progressedEvolution,
          evolutionSummary: MASKED
        } : undefined
      };
    }

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
