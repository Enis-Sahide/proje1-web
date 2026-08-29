import { NextRequest } from 'next/server';
import { generateAstrologyChart, calculateDraconicChart, calculateHarmonicChart, calculateTransitAspects } from '@/features/astrology/engine/AstrologyEngine';
import { getKabbalahAnalysis } from '@/features/astrology/engine/KabbalahInterpretations';
import { getEsotericPlanetInterpretation } from '@/features/astrology/engine/KabbalahPlanetInterpretations';
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
      return errorJson('Tarih, saat veya şehir eksik', 400);
    }

    const momentObj = moment.tz(`${localDate} ${localTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const dateObj = momentObj.toDate();

    if (isNaN(dateObj.getTime())) {
      return errorJson('Geçersiz tarih formatı.', 400);
    }

    // Generate all 4 charts
    const assiahChart = await generateAstrologyChart(dateObj, cityData, false);
    const yetzirahChart = calculateDraconicChart(assiahChart);
    const beriyahChart = calculateHarmonicChart(assiahChart, 9);
    const atzilutChart = await generateAstrologyChart(dateObj, cityData, true); // Heliocentric

    // Generate Kabbalah analysis text details
    const kabbalahAnalysis = getKabbalahAnalysis(localDate);

    // Calculate user age
    const birthDate = new Date(localDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Calculate active transits using current server time
    const now = new Date();
    const transitChart = await generateAstrologyChart(now, cityData, false);
    const transitChartHelio = await generateAstrologyChart(now, cityData, true);

    const transitsToAssiah = calculateTransitAspects(transitChart.planets, assiahChart.planets);
    const transitsToYetzirah = calculateTransitAspects(transitChart.planets, yetzirahChart.planets);
    const transitsToBeriyah = calculateTransitAspects(transitChart.planets, beriyahChart.planets);
    const transitsToAtzilut = calculateTransitAspects(transitChartHelio.planets, atzilutChart.planets);

    // Consciousness Level Calculation based on transit triggers
    let asiyahCount = 0;
    let yetzirahCount = 0;
    let beriyahCount = 0;
    let atzilutCount = 0;

    const mod360 = (x: number) => ((x % 360) + 360) % 360;
    const FIXED_STARS_2000 = [
      { name: 'Sirius', longitude: 104.08 },     // 14°05' Cancer
      { name: 'Regulus', longitude: 149.83 },    // 29°50' Leo
      { name: 'Antares', longitude: 249.77 },    // 9°46' Sagittarius
      { name: 'Aldebaran', longitude: 69.78 },   // 9°47' Gemini
      { name: 'Spica', longitude: 203.83 }       // 23°50' Libra
    ];

    const getPlanetWeight = (name: string) => {
      if (name === 'Yükselen (ASC)' || name === 'Tepe Noktası (MC)' || name === 'Güneş') return 1.5;
      if (name === 'Ay' || name === 'Merkür' || name === 'Venüs') return 1.2;
      if (name === 'Mars' || name === 'Jüpiter' || name === 'Satürn') return 1.0;
      return 1.2;
    };

    // 1. Assiah Transits
    for (const aspect of transitsToAssiah) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
      asiyahCount += getPlanetWeight(aspect.natalPlanet);
    }

    // 2. Yetzirah Transits
    for (const aspect of transitsToYetzirah) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
      yetzirahCount += getPlanetWeight(aspect.natalPlanet);
    }

    // 3. Beriyah Transits (No age locks!)
    for (const aspect of transitsToBeriyah) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
      beriyahCount += getPlanetWeight(aspect.natalPlanet);
    }

    // 4. Atzilut Transits (No age locks!)
    for (const aspect of transitsToAtzilut) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;
      atzilutCount += getPlanetWeight(aspect.natalPlanet);
    }

    // Add Fixed Stars transits (No age locks!)
    const transitYear = now.getFullYear();
    for (const tPlanet of transitChart.planets) {
      for (const star of FIXED_STARS_2000) {
        const starLon = mod360(star.longitude + (transitYear - 2000) * 0.01396);
        let diff = Math.abs(tPlanet.longitude - starLon);
        if (diff > 180) diff = 360 - diff;

        if (diff <= 1.5 || Math.abs(diff - 180) <= 1.5) {
          atzilutCount += 1.5;
        }
      }
    }

    let activeLevel = 1;
    let maxWeight = asiyahCount;

    if (yetzirahCount > maxWeight) {
      activeLevel = 2;
      maxWeight = yetzirahCount;
    }
    if (beriyahCount > maxWeight) {
      activeLevel = 3;
      maxWeight = beriyahCount;
    }
    if (atzilutCount > maxWeight) {
      activeLevel = 4;
      maxWeight = atzilutCount;
    }

    // Fallback if all weights are 0
    if (maxWeight === 0) {
      if (age < 28) {
        activeLevel = 2;
      } else if (age < 42) {
        activeLevel = 3;
      } else {
        activeLevel = 4;
      }
    }

    const levels: Record<number, { name: string; title: string; reason: string; explanation: string }> = {
      1: {
        name: 'Assiah',
        title: 'Güncel Tekamül Odak Noktanız: Fiziksel ve Dünyevi Boyut (Assiah)',
        reason: asiyahCount > 0 
          ? 'Güncel transitler sebebiyle; Yükselen (ASC), Tepe Noktası (MC) veya Güneş dereceleriniz tetikleniyor. Bu durum, üst boyutlardaki (Beriyah/Atziluth) ruhsal potansiyelinizi yeryüzüne yansıtabilmeniz için şu an öncelikle kariyer, maddiyat, hedefler veya fiziksel sağlık gibi somut, dünyevi konuları (Assiah Boyutu) yapılandırmanız gerektiğine işaret eder.'
          : 'Yaş döngünüz ve temel gökyüzü etkileriniz gereği, şu an enerjiniz fiziksel dünyaya köklenme, düzen kurma ve dünyevi sorumluluklar üzerinde çalışmaktadır.',
        explanation: 'Üst boyutlardaki ruhsal potansiyelinizi yeryüzünde daha güçlü hissedebilmek için, evren şu an sizi somut ve dünyevi konularla sınıyor olabilir. Bedeninize iyi bakmak, bütçenizi yönetmek ve dünyevi sorumluluklarınızı yüksek bir farkındalıkla ele almak, üst boyutların kapısını aralamanıza yardımcı olacak en temel tekamül adımıdır.'
      },
      2: {
        name: 'Yetzirah',
        title: 'Güncel Tekamül Odak Noktanız: Psikolojik ve Duygusal Boyut (Yetzirah)',
        reason: yetzirahCount > 0
          ? 'Güncel transitler sebebiyle; Ay, Merkür veya Venüs dereceleriniz tetikleniyor. Bu durum, bilinçaltı kalıplarınızın, ilişkilerinizi ve hücresel hafızanızdaki eski duygusal yaraları (Yetzirah Boyutu) şifalandırmanız gerektiğine işaret eder.'
          : 'Güncel transitler sebebiyle; Ay, Merkür veya Venüs dereceleriniz doğrudan tetiklenmiyor olsa da, mevcut döngünüz gereği bilinçaltı kalıplarınızı, ilişkilerinizi ve hücresel hafızanızdaki eski duygusal yaraları (Yetzirah Boyutu) şifalandırmanız gerektiğine işaret eder.',
        explanation: 'Şu anki tekamül sınavınız duygusal ve psikolojik boyuttan (Yetzirah) geliyor olabilir. Bu dönemde karşınıza çıkan zihinsel karmaşaları veya ikili ilişkilerdeki zorlukları yüksek bir farkındalıkla yönetebilirseniz, üst haritalarınızın ruhsal potansiyelini yaşamınıza başarıyla entegre etmeye başladığınızı göreceksiniz.'
      },
      3: {
        name: 'Beriyah',
        title: 'Güncel Tekamül Odak Noktanız: Ruhsal Görevler ve Zihin Boyutu (Beriyah)',
        reason: beriyahCount > 0
          ? 'Güncel transitler sebebiyle; Mars, Jüpiter veya Satürn dereceleriniz tetikleniyor. Bu durum, kişisel egonun ve duygusal dramaların ötesine geçerek, ruhunuzun bu dünyadaki ezoterik görevlerini, kadersel yolunu ve yaşam amacını (Beriyah Boyutu) inşa etmeniz gereken ana eşikte olduğunuzu gösterir.'
          : 'Yaş döngünüz gereği (Satürn Dönüşü sonrası), artık hayatın sadece fiziksel veya duygusal yönüyle yetinemezsiniz; ruhsal görevlerinizi ciddiye alma ve kaderinizi yapılandırma zamanınız gelmiştir.',
        explanation: 'Şu anki tekamül odağınız doğrudan ruhsal görevleriniz ve zihin boyutunuzdan (Beriyah) geliyor olabilir. Bu dönemde karşınıza çıkan sorumlulukları ve yaşam amacınıza dair sorgulamaları yüksek bir olgunlukla ele alabilirseniz, üst haritalarınızın bilgelik gücünü yaşamınıza başarıyla entegre etmeye başladığınızı göreceksiniz.'
      },
      4: {
        name: 'Atzilut',
        title: 'Güncel Tekamül Odak Noktanız: Kozmik ve İlahi Kudret Boyutu (Atzilut)',
        reason: atzilutCount > 0
          ? 'Güncel transitler sebebiyle; haritanızdaki Uranüs, Neptün, Plüton veya Kiron dereceleriniz ile Sabit Yıldızlarınız doğrudan tetikleniyor. Bu durum, sizi dünyevi sınırların dışına çıkararak doğrudan ilahi akışa, kozmik uyanışa ve galaktik kökenlerinizle (Atziluth Boyutu) hizalanmaya davet ediyor.'
          : 'Olgunluk yaş döngünüz (Uranüs Karşıtlığı ve Kiron Dönüşü sonrası), sizi dünyevi sınırların dışına çıkararak doğrudan ilahi akışa (Atzilut) bağlamaktadır.',
        explanation: 'Şu anki tekamül odağınız doğrudan en yüksek kozmik ve ilahi boyuttan (Atzilut) geliyor olabilir. Bu dönemde karşınıza çıkan mistik sorgulamaları veya ani uyanışları kişisel hırslardan uzak, yüksek bir teslimiyetle yönetebilirseniz, sabit yıldızlarınızın ve kozmik rehberlerinizin gücünü yaşamınıza başarıyla entegre etmeye başladığınızı göreceksiniz.'
      }
    };

    const activeConsciousness = {
      level: activeLevel,
      ...levels[activeLevel]
    };

    (kabbalahAnalysis as any).activeConsciousness = activeConsciousness;

    // Pre-calculate interpretations for planets in all 4 worlds
    const worlds = ['assiah', 'yetzirah', 'beriyah', 'atzilut'] as const;
    const charts = {
      assiah: assiahChart,
      yetzirah: yetzirahChart,
      beriyah: beriyahChart,
      atzilut: atzilutChart
    };

    const interpretations: Record<string, Record<string, { title: string; content: string }>> = {
      assiah: {},
      yetzirah: {},
      beriyah: {},
      atzilut: {}
    };

    for (const world of worlds) {
      const chart = charts[world];
      const isYetzirah = world === 'yetzirah';
      const isBeriyah = world === 'beriyah';
      const isAtzilut = world === 'atzilut';

      for (const p of chart.planets) {
        const interp = getEsotericPlanetInterpretation(
          p.name,
          p.sign,
          p.house,
          isYetzirah,
          isBeriyah,
          isAtzilut,
          p.isRetrograde
        );
        interpretations[world][p.name] = interp;
      }
    }

    return json({
      success: true,
      data: {
        charts,
        kabbalahAnalysis,
        interpretations
      }
    });
  } catch (error: any) {
    console.error('Kabbalah API Error:', error);
    return errorJson(error.message || 'Kabbalah hesaplama hatası.', 500);
  }
}
