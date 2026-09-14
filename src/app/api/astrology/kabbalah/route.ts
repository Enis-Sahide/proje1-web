import { NextRequest } from 'next/server';
import { generateAstrologyChart, calculateDraconicChart, calculateHarmonicChart, calculateTransitAspects } from '@/features/astrology/engine/AstrologyEngine';
import { getKabbalahAnalysis } from '@/features/astrology/engine/KabbalahInterpretations';
import { getEsotericPlanetInterpretation, getEsotericHouseInterpretation } from '@/features/astrology/engine/KabbalahPlanetInterpretations';
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

    // --- FREKANS AYNASI (Kozmik Sınav & 4 Alem Bilinç Spektrumu) ---
    const mod360 = (x: number) => ((x % 360) + 360) % 360;
    const FIXED_STARS_2000 = [
      { name: 'Sirius', longitude: 104.08 },     // 14°05' Yengeç
      { name: 'Regulus', longitude: 149.83 },    // 29°50' Aslan
      { name: 'Antares', longitude: 249.77 },    // 9°46' Yay
      { name: 'Aldebaran', longitude: 69.78 },   // 9°47' İkizler
      { name: 'Spica', longitude: 203.83 }       // 23°50' Terazi
    ];

    const categoryWeights = {
      will_power: 0,
      emotional_depth: 0,
      mental_truth: 0,
      shadow_alchemy: 0
    };

    let prominentAspectDesc = '';
    let minHardOrb = 999;

    const classifyPoint = (pointName: string): 'will_power' | 'emotional_depth' | 'mental_truth' | 'shadow_alchemy' => {
      if (['Güneş', 'Mars', 'Satürn', 'Yükselen (ASC)', 'Tepe Noktası (MC)'].includes(pointName)) return 'will_power';
      if (['Ay', 'Venüs', 'Neptün', 'Lilith'].includes(pointName)) return 'emotional_depth';
      if (['Merkür', 'Jüpiter', 'Uranüs', 'Kuzey Ay Düğümü'].includes(pointName)) return 'mental_truth';
      if (['Plüton', 'Kiron', 'Güney Ay Düğümü'].includes(pointName)) return 'shadow_alchemy';
      return 'will_power';
    };

    // Scan transits to Assiah (Fiziksel / Enkarnasyon Haritası)
    for (const aspect of transitsToAssiah) {
      if (aspect.orb > 3.0) continue;
      const isHard = aspect.type === 'Kavuşum' || aspect.type === 'Karşıt' || aspect.type === 'Kare';
      const weight = (isHard ? 2.5 : 1.0) * (3.5 - aspect.orb);
      const cat = classifyPoint(aspect.natalPlanet);
      categoryWeights[cat] += weight;

      if (isHard && aspect.orb < minHardOrb) {
        minHardOrb = aspect.orb;
        prominentAspectDesc = `Transit ${aspect.transitPlanet} ${aspect.type} Natal ${aspect.natalPlanet} (Orb: ${aspect.orb.toFixed(1)}°)`;
      }
    }

    // Scan transits to Yetzirah (Duygusal / Ruh Haritası)
    for (const aspect of transitsToYetzirah) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type === 'Kavuşum' || aspect.type === 'Karşıt' || aspect.type === 'Kare') {
        const cat = classifyPoint(aspect.natalPlanet);
        categoryWeights[cat] += (3.0 - aspect.orb) * 0.8;
      }
    }

    // Scan transits to Beriyah (Zihinsel / Kadersel Harita)
    for (const aspect of transitsToBeriyah) {
      if (aspect.orb > 2.5) continue;
      if (aspect.type === 'Kavuşum' || aspect.type === 'Karşıt' || aspect.type === 'Kare') {
        const cat = classifyPoint(aspect.natalPlanet);
        categoryWeights[cat] += (3.0 - aspect.orb) * 0.7;
      }
    }

    // Scan transits to Atzilut & Sabit Yıldızlar
    const transitYear = now.getFullYear();
    for (const tPlanet of transitChart.planets) {
      for (const star of FIXED_STARS_2000) {
        const starLon = mod360(star.longitude + (transitYear - 2000) * 0.01396);
        let diff = Math.abs(tPlanet.longitude - starLon);
        if (diff > 180) diff = 360 - diff;

        if (diff <= 1.5 || Math.abs(diff - 180) <= 1.5) {
          categoryWeights.shadow_alchemy += 2.0;
          if (diff < minHardOrb) {
            minHardOrb = diff;
            prominentAspectDesc = `Transit ${tPlanet.name} Kavuşum Sabit Yıldız ${star.name} (Orb: ${diff.toFixed(1)}°)`;
          }
        }
      }
    }

    // Determine top category
    let topCategory: 'will_power' | 'emotional_depth' | 'mental_truth' | 'shadow_alchemy' = 'will_power';
    let maxCatWeight = categoryWeights.will_power;

    if (categoryWeights.emotional_depth > maxCatWeight) {
      topCategory = 'emotional_depth';
      maxCatWeight = categoryWeights.emotional_depth;
    }
    if (categoryWeights.mental_truth > maxCatWeight) {
      topCategory = 'mental_truth';
      maxCatWeight = categoryWeights.mental_truth;
    }
    if (categoryWeights.shadow_alchemy > maxCatWeight) {
      topCategory = 'shadow_alchemy';
      maxCatWeight = categoryWeights.shadow_alchemy;
    }

    // Fallback if weights are 0
    if (maxCatWeight === 0) {
      if (age < 28) topCategory = 'emotional_depth';
      else if (age < 42) topCategory = 'will_power';
      else topCategory = 'shadow_alchemy';
    }

    const challengeArchetypes = {
      will_power: {
        title: 'İrade, Sınırlar ve Yapıcı Eylem Potansiyeli',
        desc: 'Gökyüzü şu an kişisel gücünüzü, sağlıklı sınırlarınızı koruma kapasitenizi ve sorumluluklar karşısındaki duruşunuzu aydınlatıyor. Bu dönemde enerjinizi hangi bilinç düzeyinden yönlendirmeyi seçiyorsunuz?',
        assiah: {
          title: 'Farkındalık Alanı: Öfkeyi ve Kontrol Kaygısını Dönüştürmek',
          reaction: 'Olayları kişiselleştirmek veya zorlayıcı direnç göstermek yerine; sabırla durup enerjiyi yapıcı bir eyleme çevirme fırsatını görmek.',
          diagnosis: 'Eğer bu dönemde engellere karşı öfkeyle çatışıyor veya dış koşulları suçlama ihtiyacı hissediyorsanız; bu reaksiyonu fark edip enerjinizi Assiah\'ın yapıcı eylem gücüne ve sabrına dönüştürebilirsiniz.'
        },
        yetzirah: {
          title: 'İçsel Çocuk Tutumu: Duygusal Kökleri ve Güvensizliği Şefkatle Kucaklamak',
          reaction: 'Öfke veya yetersizlik hissinin altındaki çocukluk yaralarını ve geçmişte bastırılmış hisleri fark ederek duyguları şefkatle kabul etmek.',
          diagnosis: 'Tepki vermek yerine bir an durup hislerinizi anlamlandırmaya ve kalbinize şefkat göstermeye niyet ettiğinizde; 2. Haritanız Yetzirah\'ın şifa enerjisini aktive edersiniz.'
        },
        beriyah: {
          title: 'Bilge Zihin Tutumu: Stratejik Sorumluluk ve Yüksek İrade',
          reaction: 'Kişisel çatışmaları bir kenara bırakıp "Bu deneyim beni hangi erdemlerle donatıyor?" bilinciyle uzun vadeli, yapıcı adımlar atmak.',
          diagnosis: 'Dramaya kapılmadan sorumluluğu üstleniyor, sınırlarınızı nezaketle ama kararlılıkla çizerek yapıcı bir çözüm üretiyorsanız; 3. Haritanız Beriyah\'ın zihinsel kudretini çalıştırırsınız.'
        },
        atzilut: {
          title: 'Kozmik Birlik Tutumu: İlahi İradeye Hizmet ve Güvenli Teslimiyet',
          reaction: 'Kişisel haklılık hırsını bırakarak gerçekleşen her olayın tekâmül için kusursuz bir düzen taşıdığını bilmek; iradesini bütüne adanmış saf sevgiye teslim etmek.',
          diagnosis: 'İlahi akışın sizi sevgiyle olgunlaştırdığını derinden hissediyor ve egonun sınırlarını aşan dingin bir güven içinde kalıyorsanız; 4. Haritanız Atzilut\'un kozmik frekansındasınız.'
        }
      },
      emotional_depth: {
        title: 'Duygusal Denge, Sağlıklı Sınırlar ve Öz-Değer Farkındalığı',
        desc: 'Gökyüzü şu an ikili ilişkilerinizi, duygusal ihtiyaçlarınızı ve öz-değerinizi aydınlatıyor. İlişkilerinizde ve içsel dünyanızda hangi bilinç frekansından hareket ediyorsunuz?',
        assiah: {
          title: 'Farkındalık Alanı: Kaybetme Korkusunu ve Bağımlılığı Dönüştürmek',
          reaction: 'Karşı tarafı suçlamak ya da kurban rolüne bürünmek yerine; kendi duygusal ihtiyaçlarınızın sorumluluğunu üstlenmek.',
          diagnosis: 'Eğer ilişkilerde güvensizlik anında içe kapanıyor veya aşırı fedakarlıkla sınırlarınızı unutuyorsanız; bu ihtiyacı fark edip Assiah zemininde özdeğerinizi ve sağlıklı sınırlarınızı güçlendirebilirsiniz.'
        },
        yetzirah: {
          title: 'İçsel Çocuk Tutumu: Kendi Kalbine Şefkatle Ebeveynlik Etmek',
          reaction: 'Duygusal doyumun dışarıdaki kişilerden önce kendi içsel bağınızdan kaynaklandığını fark etmek; hislerinizi şefkatle serbest bırakma cesareti göstermek.',
          diagnosis: 'Dışarıya sitem etmek yerine kendi kalbinize sarılıp içsel çocuğunuza şefkatle yaklaşıyorsanız; 2. Haritanız Yetzirah\'ın iyileştirici gücünü aktive edersiniz.'
        },
        beriyah: {
          title: 'Bilge Zihin Tutumu: Sağlıklı Sınırlar ve Koşulsuz Öz-Sevgi',
          reaction: 'İlişkilere kadersel bir ayna gözüyle bakmak; sevgiyi bağımlılıkla karıştırmadan, net ve sağlıklı sınırlar çekerek hem kendine hem karşındakine saygı duyan olgun bir duruş sergilemek.',
          diagnosis: 'Duygusal süreçleri yüksek şuurla ayrıştırarak "Herkes kendi tekâmül yolunda; ben kendi değerimin mimarıyım" bilinciyle hareket ediyorsanız; 3. Haritanız Beriyah\'ı çalıştırırsınız.'
        },
        atzilut: {
          title: 'Kozmik Birlik Tutumu: Koşulsuz Sevgi ve Birlik Şuuru',
          reaction: 'Karşısındaki insanı herhangi bir role veya beklentiye hapsetmeden saf bir ruh olarak görmek; sevginin varoluşun özü olduğunu yaşamak.',
          diagnosis: 'Hiçbir karşılık beklemeden saf ve dingin bir sevgi okyanusunda var olabiliyor ve yargılamayı tamamen bıraktıysanız; 4. Haritanız Atzilut\'u aktive edersiniz.'
        }
      },
      mental_truth: {
        title: 'Zihinsel Berraklık, Hakikati İfade ve İlham',
        desc: 'Gökyüzü şu an düşünce sisteminizi, inanç kalıplarınızı ve iletişim dilinizi aydınlatıyor. Zihinsel süreçlerinizde nasıl bir tutum sergiliyorsunuz?',
        assiah: {
          title: 'Farkındalık Alanı: Haklı Çıkma Çabasını ve Kaygıyı Dönüştürmek',
          reaction: 'Kendi doğrusunu katıca savunmak yerine; zihni sakinleştirip dinlemeyi ve yapıcı çözümlere odaklanmayı seçmek.',
          diagnosis: 'Eğer zihinsel tartışmalarda haklı çıkma çabasına veya kaygılara kapıldığınızı hissediyorsanız; zihninizi sakinleştirerek Assiah aleminde düşüncelerinizi pratik ve yapıcı çözümlere odaklayabilirsiniz.'
        },
        yetzirah: {
          title: 'İçsel Çocuk Tutumu: Zihnin Duygusal Köklerini Keşfetmek',
          reaction: 'Düşüncelerin geçmiş incinmelerin savunma kalkanı olduğunu fark etmek; "Anlaşılmıyorum" hissiyle yüzleşip zihinsel zırhı gevşetmek.',
          diagnosis: 'Savunduğunuz fikirlerin arkasındaki onaylanma ihtiyacını dürüstçe fark edip şefkatle yaklaşıyorsanız; 2. Haritanız Yetzirah\'ı aktive edersiniz.'
        },
        beriyah: {
          title: 'Bilge Zihin Tutumu: Objektif Algı, Yüksek Vizyon ve İlham',
          reaction: 'Zihni yargılayıcı bir araç olmaktan çıkarıp, evrensel ilkeleri idrak eden berrak bir merceğe dönüştürmek; yapıcı ve ilham verici projeler üretmek.',
          diagnosis: 'Olaylara kuşbakışı bakarak kutuplaşmadan sentez yapabiliyor ve zihninizi bütüne hizmet eden projelere yönlendirebiliyorsanız; 3. Haritanız Beriyah\'ı çalıştırırsınız.'
        },
        atzilut: {
          title: 'Kozmik Birlik Tutumu: Zihnin Sessizliği ve Saf Sezgi (Gnosis)',
          reaction: 'Kavramların ve düşüncelerin ötesine geçerek hakikati doğrudan kalpten deneyimlemek; mutlak sükûnette ilahi ilhamı duymak.',
          diagnosis: 'Zihinsel karmaşanın tamamen dindiği derin bir meditatif dinginlikte, saf sezginin kalbinize aktığını deneyimliyorsanız; 4. Haritanız Atzilut frekansındasınız.'
        }
      },
      shadow_alchemy: {
        title: 'İçsel Simya, Dönüşüm ve Yeniden Doğuş Bilgeliği',
        desc: 'Gökyüzü şu an hayatınızda miadını doldurmuş olanı serbest bırakma cesaretinizi ve karanlığı aydınlığa dönüştürme potansiyelinizi aydınlatıyor. Dönüşüm anlarında nasıl tepki veriyorsunuz?',
        assiah: {
          title: 'Farkındalık Alanı: Direnci Bırakıp Akışa Güvenmek',
          reaction: 'Biten şeye tutunup hayata küsmek yerine; değişimin getirdiği doğal döngüyü kabul ederek yeni bir sayfa açmak.',
          diagnosis: 'Eğer beklenmedik değişimlerde eski kalıplara tutunma ihtiyacı duyuyorsanız; değişimin getirdiği arınma fırsatını fark ederek Assiah boyutunda sağlam ve esnek adımlarla yeniden köklenebilirsiniz.'
        },
        yetzirah: {
          title: 'İçsel Çocuk Tutumu: Gölge Parçaları Sevgiyle Kabul Etmek',
          reaction: 'Kendi içindeki korku veya yetersizlik duygularını bastırmadan dürüstçe kabul etmek ve iyileştirici dönüşüme izin vermek.',
          diagnosis: 'Değişimin size aynaladığı bastırılmış duygularınızı suçlamadan kucaklıyor ve şifalanmasına alan açıyorsanız; 2. Haritanız Yetzirah\'ın bilgeliğini aktive edersiniz.'
        },
        beriyah: {
          title: 'Bilge Zihin Tutumu: Simyasal Dönüşüm ve Anka Kuşu Şuuru',
          reaction: 'Eski formların ruhun özgürleşmesi için dönüştüğünü kavramak; deneyimlerden büyük bir bilgelik damıtarak küllerinden yeniden doğmak.',
          diagnosis: '"Tamamlanan deneyim bitti çünkü daha yüce bir varoluş filizleniyor" diyerek yeni bir kadersel vizyon inşa edebiliyorsanız; 3. Haritanız Beriyah\'ı çalıştırırsınız.'
        },
        atzilut: {
          title: 'Kozmik Birlik Tutumu: Sonsuzluk ve Birlik Şuuru',
          reaction: 'Ölüm ile yaşamın tek bir ilahi nefes olduğunu idrak etmek; hiçbir şeye bağımlı kalmadan sonsuz huzurda var olmak.',
          diagnosis: 'En büyük dalgalanmaların ortasında bile varoluşun ebedi ışığıyla bir olduğunuzu bilip saf kozmik güvenle durabiliyorsanız; 4. Haritanız Atzilut\'un zirvesindesiniz.'
        }
      }
    };

    const currentArchetype = challengeArchetypes[topCategory];

    const transitReason = prominentAspectDesc
      ? `Şu an gökyüzünde ${prominentAspectDesc} açısı doğrudan devrede. Bu güçlü göksel etkileşim; haritanızın ${topCategory === 'will_power' ? 'fiziksel irade ve eylem' : topCategory === 'emotional_depth' ? 'duygusal bağlar ve içsel dünya' : topCategory === 'mental_truth' ? 'zihinsel vizyon ve ifade' : 'derin dönüşüm ve bilgelik'} alanını aktive ederek sizi önemli bir tekâmül kapısına davet ediyor.`
      : `Şu an gökyüzündeki güncel gezegen transitleri haritanızın temel akslarını destekleyerek; sizi ${currentArchetype.title.toLowerCase()} kapsamında derin bir içsel farkındalığa davet ediyor.`;

    const activeConsciousness = {
      title: `Günün Kozmik Farkındalığı: ${currentArchetype.title}`,
      reason: transitReason,
      explanation: currentArchetype.desc,
      currentTheme: currentArchetype.title,
      themeCategory: topCategory,
      transitSummary: transitReason,
      cosmicChallenge: currentArchetype.desc,
      prominentAspect: prominentAspectDesc || null,
      spectrum: {
        assiah: {
          level: 1,
          name: '1. Assiah Alemi (Fiziksel Eylem / Madde)',
          title: currentArchetype.assiah.title,
          reaction: currentArchetype.assiah.reaction,
          diagnosis: currentArchetype.assiah.diagnosis,
          color: '#EF4444',
          bgClass: 'bg-red-500/10 border-red-500/30 text-red-300'
        },
        yetzirah: {
          level: 2,
          name: '2. Yetzirah Alemi (Duygu / Bilinçaltı / Kalp)',
          title: currentArchetype.yetzirah.title,
          reaction: currentArchetype.yetzirah.reaction,
          diagnosis: currentArchetype.yetzirah.diagnosis,
          color: '#0EA5E9',
          bgClass: 'bg-sky-500/10 border-sky-500/30 text-sky-300'
        },
        beriyah: {
          level: 3,
          name: '3. Beriyah Alemi (Yüksek Zihin / Kadersel Bilgelik)',
          title: currentArchetype.beriyah.title,
          reaction: currentArchetype.beriyah.reaction,
          diagnosis: currentArchetype.beriyah.diagnosis,
          color: '#F59E0B',
          bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        },
        atzilut: {
          level: 4,
          name: '4. Atzilut Alemi (İlahi Kudret / Mutlak Birlik)',
          title: currentArchetype.atzilut.title,
          reaction: currentArchetype.atzilut.reaction,
          diagnosis: currentArchetype.atzilut.diagnosis,
          color: '#A855F7',
          bgClass: 'bg-purple-500/10 border-purple-500/30 text-purple-300'
        }
      }
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

      if (!isBeriyah && !isAtzilut) {
        for (const h of chart.houses) {
          const houseInterp = getEsotericHouseInterpretation(
            h.house,
            h.sign,
            isYetzirah,
            false,
            false
          );
          interpretations[world][`Ev_${h.house}`] = houseInterp;
          interpretations[world][`${h.house}`] = houseInterp;
        }
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
