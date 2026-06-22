import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { chakraTestQuestions } from '@/db/schema';

export const dynamic = 'force-dynamic';

type ChakraId = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'thirdEye' | 'crown';

// Mobil ve web çakraları arasındaki renk ve ID eşleştirmeleri
const CHAKRA_MAP: Record<ChakraId, { numericId: number; color: string }> = {
  root: { numericId: 1, color: '#FF3B30' },
  sacral: { numericId: 2, color: '#FF9500' },
  solar: { numericId: 3, color: '#FFCC00' },
  heart: { numericId: 4, color: '#34C759' },
  throat: { numericId: 5, color: '#00C7BE' },
  thirdEye: { numericId: 6, color: '#32ADE6' },
  crown: { numericId: 7, color: '#AF52DE' },
};

const CHAKRA_NAMES: Record<number, string> = {
  1: 'Kök Çakra',
  2: 'Sakral Çakra',
  3: 'Solar Pleksus',
  4: 'Kalp Çakrası',
  5: 'Boğaz Çakrası',
  6: 'Üçüncü Göz',
  7: 'Tepe Çakra',
};

async function loadQuestions(): Promise<{ id: number; chakraId: ChakraId; text: string }[]> {
  const rows = await db.select().from(chakraTestQuestions).orderBy(asc(chakraTestQuestions.id));
  return rows.map((r) => ({ id: r.id, chakraId: r.chakraKey as ChakraId, text: r.text }));
}

export async function GET() {
  try {
    const questions = await loadQuestions();
    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error('Chakra API GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Sorular yüklenirken hata oluştu.' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers } = body as { answers: { questionId: number; score: number }[] };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Cevaplar geçersiz veya eksik.' },
        { status: 400 },
      );
    }

    const questions = await loadQuestions();

    // Skorları hesapla
    const chakraScores: Record<ChakraId, number> = {
      root: 0, sacral: 0, solar: 0, heart: 0, throat: 0, thirdEye: 0, crown: 0,
    };

    // Her soru için score (1, 2, veya 3) ekle
    answers.forEach((ans) => {
      const q = questions.find((item) => item.id === ans.questionId);
      if (q) {
        chakraScores[q.chakraId] += ans.score;
      }
    });

    // Her çakranın yüzdesini hesapla (tıkanıklık = 100 - açıklık)
    const results = Object.keys(chakraScores).map((key) => {
      const chakraId = key as ChakraId;
      const rawScore = chakraScores[chakraId];

      const opennessPct = Math.round(((rawScore - 3) / 6) * 100);
      const boundedOpenness = Math.max(0, Math.min(100, opennessPct));
      const blockagePercent = 100 - boundedOpenness;

      const mapInfo = CHAKRA_MAP[chakraId];

      return {
        id: mapInfo.numericId,
        name: CHAKRA_NAMES[mapInfo.numericId],
        color: mapInfo.color,
        score: rawScore,
        percent: blockagePercent,
      };
    });

    // En çok tıkalı olandan en aza doğru sırala
    results.sort((a, b) => b.percent - a.percent);

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Chakra API POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Hesaplama sırasında hata oluştu.' },
      { status: 500 },
    );
  }
}
