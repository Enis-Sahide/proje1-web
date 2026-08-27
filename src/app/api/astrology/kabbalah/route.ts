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
    const transitAspects = calculateTransitAspects(transitChart.planets, assiahChart.planets);

    // Consciousness Level Calculation based on transit triggers
    let asiyahCount = 0;
    let yetzirahCount = 0;
    let beriyahCount = 0;
    let atzilutCount = 0;

    for (const aspect of transitAspects) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type !== 'Kavuşum' && aspect.type !== 'Karşıt' && aspect.type !== 'Kare') continue;

      const n = aspect.natalPlanet;
      if (n === 'Yükselen (ASC)' || n === 'Tepe Noktası (MC)' || n === 'Güneş') {
        asiyahCount += 1.5;
      } else if (n === 'Ay' || n === 'Merkür' || n === 'Venüs') {
        yetzirahCount += 1.2;
      } else if (n === 'Mars' || n === 'Jüpiter' || n === 'Satürn') {
        beriyahCount += 1.0;
      } else if (n === 'Uranüs' || n === 'Neptün' || n === 'Plüton' || n === 'Kiron') {
        atzilutCount += 1.2;
      }
    }

    let activeLevel = 1;
    let maxWeight = asiyahCount;

    if (yetzirahCount > maxWeight) {
      activeLevel = 2;
      maxWeight = yetzirahCount;
    }
    if (beriyahCount > maxWeight && age >= 28) {
      activeLevel = 3;
      maxWeight = beriyahCount;
    }
    if (atzilutCount > maxWeight && age >= 38) {
      activeLevel = 4;
      maxWeight = atzilutCount;
    }

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
          ? 'Gökyüzündeki güncel gezegen geçişleri doğrudan Yükselen (ASC), Tepe Noktası (MC) veya Güneş derecelerinizi tetikliyor. Bu durum, üst boyutlardaki (Beriyah/Atziluth) ruhsal potansiyelinizi yeryüzüne yansıtabilmeniz için şu an öncelikle kariyer, maddiyat, hedefler veya fiziksel sağlık gibi somut, dünyevi konuları (Assiah Boyutu) yapılandırmanız gerektiğine işaret eder.'
          : 'Yaş döngünüz ve temel gökyüzü etkileriniz gereği, şu an enerjiniz fiziksel dünyaya köklenme, düzen kurma ve dünyevi sorumluluklar üzerinde çalışmaktadır.',
        explanation: 'Assiah alemi Malkut (Krallık) sefirasıyla yönetilir. Üst boyutlardaki ruhsal haritalarınız arka planda aktiftir. Ancak evren şu an sizi soyut teorilerle değil, pratik ve dünyevi eylemlerle sınamaktadır. Fiziksel bedeninize iyi bakmak, bütçenizi düzene sokmak ve somut kararlar almak, bu dönem üst boyutlara geçişinizi sağlayacak en temel tekamül anahtarınızdır.'
      },
      2: {
        name: 'Yetzirah',
        title: 'Güncel Tekamül Odak Noktanız: Psikolojik ve Duygusal Boyut (Yetzirah)',
        reason: yetzirahCount > 0
          ? 'Güncel transit gezegenler Ay, Merkür veya Venüs derecelerinizi tetikliyor. Bu durum, 3. ve 4. boyutlardaki ruhsal potansiyelinizi hayatınıza tam olarak akıtabilmeniz için şu an öncelikle bilinçaltı kalıplarınızı, ilişkilerinizi ve hücresel hafızanızdaki eski duygusal yaraları (Yetzirah Boyutu) şifalandırmanız gerektiğine işaret eder.'
          : 'Mevcut astrolojik döngünüz, sizi geçmiş yaşam kalıplarınızı, atalardan gelen duygusal bağlarınızı ve korkularınızı çözmeye çağırmaktadır.',
        explanation: '3. haritanız (Beriyah - Ruhsal Yol) arka planda aktif olarak çalışmaktadır. Ancak gökyüzünün bu dönemdeki mesajı nettir: Ruhsal hedeflerinize ve yaşam amacınıza tıkanmadan yürüyebilmek için, şu an zihninizi veya ilişkilerinizi meşgul eden Yetzirah (Duygusal Boyut) sınavını başarıyla vermeli ve buradaki duygusal yükleri serbest bırakmalısınız.'
      },
      3: {
        name: 'Beriyah',
        title: 'Güncel Tekamül Odak Noktanız: Ruhsal Görevler ve Zihin Boyutu (Beriyah)',
        reason: beriyahCount > 0
          ? 'Transitler şu an Mars, Jüpiter veya Satürn derecelerinizle etkileşimde. Bu durum, kişisel egonun ve duygusal dramaların ötesine geçerek, ruhunuzun bu dünyadaki ezoterik görevlerini, kadersel yolunu ve yaşam amacını (Beriyah Boyutu) inşa etmeniz gereken ana eşikte olduğunuzu gösterir.'
          : 'Yaş döngünüz gereği (Satürn Dönüşü sonrası), artık hayatın sadece fiziksel veya duygusal yönüyle yetinemezsiniz; ruhsal görevlerinizi ciddiye alma ve kaderinizi yapılandırma zamanınız gelmiştir.',
        explanation: 'İlk Satürn Dönüşünüzü tamamlamış olmanızla birlikte, ruhsal haritanız (Beriyah) en aktif fazındadır. Gökyüzü bu dönemde sizi doğrudan yaşam amacınızı yapılandırmaya, bilgiyi bilgeliğe dönüştürmeye ve dünyada kalıcı bir ruhsal sorumluluk almaya davet etmektedir. Karşılaştığınız engeller, sizi bu kadersel göreve hizalayan rehberlerdir.'
      },
      4: {
        name: 'Atzilut',
        title: 'Güncel Tekamül Odak Noktanız: Kozmik ve İlahi Kudret Boyutu (Atzilut)',
        reason: atzilutCount > 0
          ? 'Transit gezegenler haritanızdaki Uranüs, Neptün, Plüton veya Kiron derecelerinizi ve Sabit Yıldızlarınızı doğrudan tetikliyor. Bu durum, sizi dünyevi sınırların dışına çıkararak doğrudan ilahi akışa, kozmik uyanışa ve galaktik kökenlerinizle (Atziluth Boyutu) hizalanmaya davet ediyor.'
          : 'Olgunluk yaş döngünüz (Uranüs Karşıtlığı ve Kiron Dönüşü sonrası), sizi dünyevi sınırların dışına çıkararak doğrudan ilahi akışa (Atzilut) bağlamaktadır.',
        explanation: 'Atzilut, Keter (Kudret/İlahi Işık) boyutudur. Bu aşamada artık egosal hiçbir kimliğe veya kişisel hırsa tutunamazsınız; tamamen evrensel bilince teslim olup, dünyada bir kanal olarak var olmanız gerekir. Sabit yıldızlarınızın enerjisi bu boyutta tamamen açığa çıkarak size rehberlik etmektedir.'
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
