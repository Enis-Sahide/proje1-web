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
        title: 'İrade, Sınırlar ve Dünyevi Sorumluluk Sınavı',
        desc: 'Gökyüzü şu an kişisel gücünüzü, sınırlarınızı koruma kapasitenizi ve dünyevi sorumluluklar karşısındaki duruşunuzu sınıyor. Otorite figürleri, kariyer baskıları veya eyleme geçme zorunlulukları karşısında hangi bilinç düzeyinden yanıt veriyorsunuz?',
        assiah: {
          title: 'Reaktif Tutum: Öfke, İsyan veya Kontrol Takıntısı',
          reaction: 'Olayları kişiselleştirip dış koşulları ya da diğer insanları suçlamak; öfkeyle güç savaşına girmek, inatlaşmak veya yetersizlik korkusuyla her şeyi zorla kontrol etmeye çalışmak.',
          diagnosis: 'Eğer bu dönemde yaşadığınız engellere karşı dişinizi sıkıp hırsla çatışıyor veya "Neden her şey beni buluyor?" diyerek kurban psikolojisine giriyorsanız; 1. Haritanız olan Assiah\'ı alt frekansta çalıştırıyorsunuz.'
        },
        yetzirah: {
          title: 'İçsel Çocuk Tutumu: Duygusal Kökleri ve Güvensizliği Fark Etmek',
          reaction: 'Öfke veya yetersizlik hissinin altındaki çocukluk yaralarını, onaylanma açlığını ve geçmişte bastırılmış korkuları fark ederek duyguları şefkatle kabul etmek.',
          diagnosis: 'Tepki vermek yerine bir an durup "Bu öfke bana geçmişimle ilgili hangi yetersizlik yaramı hatırlatıyor?" diyerek duygularınızı anlamlandırmaya çalışıyorsanız; 2. Haritanız Yetzirah\'ı aktive ediyorsunuz.'
        },
        beriyah: {
          title: 'Bilge Zihin Tutumu: Stratejik Sorumluluk ve Yüksek İrade',
          reaction: 'Egoyu ve kişisel çatışmaları bir kenara bırakıp "Bu sınav beni hangi konuda daha disiplinli ve adil bir birey yapmaya zorluyor?" bilinciyle uzun vadeli, yapıcı adımlar atmak.',
          diagnosis: 'Dramaya kapılmadan sorumluluğu üstleniyor, sınırlarınızı nezaketle ama tavizsizce çizerek yapıcı bir çözüm planı uyguluyorsanız; 3. Haritanız Beriyah\'ın zihinsel kudretini çalıştırıyorsunuz.'
        },
        atzilut: {
          title: 'Kozmik Birlik Tutumu: İlahi İradeye Hizmet ve Mutlak Teslimiyet',
          reaction: 'Kişisel haklılık ve kazanma hırsını tamamen bırakarak, gerçekleşen her olayın ilahi adaletin kusursuz bir tezahürü olduğunu bilmek; iradesini bütüne adanmış saf sevgiye teslim etmek.',
          diagnosis: 'Zorlanma hissini tamamen aşarak, ilahi akışın sizi mükemmel şekilde terbiye ettiğini derinden hissediyor ve egonun sınırlarını aşan dingin bir güven içinde kalıyorsanız; 4. Haritanız Atzilut\'un kozmik frekansındasınız.'
        }
      },
      emotional_depth: {
        title: 'Duygusal Bağımlılık, İlişkiler ve Öz-Değer Sınavı',
        desc: 'Gökyüzü şu an ikili ilişkilerinizi, sevilme ve onaylanma ihtiyacınızı, duygusal sınırlarınızı sınıyor. Bir ilişkideki kriz veya içsel boşluk hissi karşısında hangi bilinç frekansından tepki veriyorsunuz?',
        assiah: {
          title: 'Reaktif Tutum: Kaybetme Korkusu, Manipülasyon veya Bağımlılık',
          reaction: 'Karşı tarafı suçlamak, sessiz cezalandırmalar uygulamak, terk edilme korkusuyla sınırları çiğnetmek veya ilgi görebilmek için kurban rolüne bürünmek.',
          diagnosis: 'Eğer bir ilişki veya güvensizlik anında karşı tarafı manipüle etmeye çalışıyor, aşırı fedakarlıkla kendinizi yok sayıyor ya da küsüp içine kapanıyorsanız; 1. Haritanız Assiah\'ı alt frekansta çalıştırıyorsunuz.'
        },
        yetzirah: {
          title: 'İçsel Çocuk Tutumu: Kendi Kalbine Şefkatle Ebeveynlik Etmek',
          reaction: 'Duygusal boşluğun dışarıdaki kişiden değil, kendi içsel bağınızın kopukluğundan kaynaklandığını anlamak; ağlama, yas tutma ve hücresel hafızadaki acıyı serbest bırakma cesareti göstermek.',
          diagnosis: 'Dışarıya sitem etmek yerine "Ben kendi kendimi nerede terk ettim de bunu dışarıda arıyorum?" sorusunu sorup kalbinize şefkatle sarılıyorsanız; 2. Haritanız Yetzirah\'ı aktive ediyorsunuz.'
        },
        beriyah: {
          title: 'Bilge Zihin Tutumu: Sağlıklı Sınırlar ve Koşulsuz Öz-Sevgi',
          reaction: 'İlişkilere kadersel bir ayna gözüyle bakmak; sevgiyi bağımlılıkla karıştırmadan, net ve sağlıklı sınırlar çekerek hem kendine hem karşındakine saygı duyan olgun bir duruş sergilemek.',
          diagnosis: 'Duygusal dramaları mantık ve yüksek şuurla ayrıştırarak, "Herkes kendi tekâmül yolunda; ben kendi değerimin mimarıyım" diyerek net sınırlar çizebiliyorsanız; 3. Haritanız Beriyah\'ı çalıştırıyorsunuz.'
        },
        atzilut: {
          title: 'Kozmik Birlik Tutumu: Koşulsuz Sevgi ve Birlik Şuuru',
          reaction: 'Karşısındaki kişiyi herhangi bir beklentiye, role veya talebe sokmadan saf ilahi bir ruh olarak görmek; sevginin alınıp verilen bir şey değil, varoluşun özü olduğunu yaşamak.',
          diagnosis: 'Hiçbir karşılık beklemeden, kimseye tutunmadan veya kırılmadan, saf ve dingin bir sevgi okyanusunda var olabiliyor ve yargılamayı tamamen bıraktıysanız; 4. Haritanız Atzilut\'u aktive ediyorsunuz.'
        }
      },
      mental_truth: {
        title: 'Zihinsel Kalıplar, Hakikati İfade ve İnanç Sınavı',
        desc: 'Gökyüzü şu an düşünce sisteminizi, doğru bildiğiniz dogmaları, iletişim dilinizi ve geleceğe dair inançlarınızı sınıyor. Bir fikir ayrılığı, belirsizlik veya zihinsel kriz karşısında nasıl bir tutum sergiliyorsunuz?',
        assiah: {
          title: 'Reaktif Tutum: Dogmatizm, Zihinsel Kaygı ve Haklı Çıkma Çabası',
          reaction: 'Kendi doğrusunu fanatikçe savunmak, sürekli felaket senaryoları kurmak, dinlemeden tartışmak veya aşırı analizle eylemsizliğe saplanmak.',
          diagnosis: 'Eğer tartışmalarda haklı çıkmak için didiniyor, kafanızda durmaksızın dönen vesveselere teslim oluyor veya geleceğe korkuyla bakıyorsanız; 1. Haritanız Assiah\'ı alt frekansta çalıştırıyorsunuz.'
        },
        yetzirah: {
          title: 'İçsel Çocuk Tutumu: Zihnin Duygusal Köklerini ve İnanç Yaralarını Keşfetmek',
          reaction: 'Düşüncelerin aslında geçmişte yaşanan incinmelerin kalkanı olduğunu fark etmek; "Hata yaparsam sevilmem" veya "Anlaşılmıyorum" hissiyle yüzleşmek.',
          diagnosis: 'Savunduğunuz fikirlerin arkasındaki onaylanmama veya küçük düşme korkusunu dürüstçe itiraf edip zihinsel savunma zırhınızı gevşetiyorsanız; 2. Haritanız Yetzirah\'ı aktive ediyorsunuz.'
        },
        beriyah: {
          title: 'Bilge Zihin Tutumu: Objektif Algı, Yüksek Vizyon ve İlham',
          reaction: 'Zihni yargılayıcı bir araç olmaktan çıkarıp, evrensel ilkeleri idrak eden berrak bir merceğe dönüştürmek; farklı bakış açılarını sentezleyip yapıcı çözümler üretmek.',
          diagnosis: 'Olaylara kuşbakışı bakarak, kutuplaşmadan sentez yapabiliyor ve zihninizi bütüne hizmet eden ilham dolu projelere yönlendirebiliyorsanız; 3. Haritanız Beriyah\'ı çalıştırıyorsunuz.'
        },
        atzilut: {
          title: 'Kozmik Birlik Tutumu: Zihnin Sessizliği ve Saf Sezgi (Gnosis)',
          reaction: 'Kavramların, kelimelerin ve düşüncelerin ötesine geçerek "Bilme" halini doğrudan kalpten deneyimlemek; mutlak sessizlikte ilahi ilhamı ve rehberliği duymak.',
          diagnosis: 'Zihinsel konuşmaların tamamen sustuğu derin bir meditatif dinginlikte, bilginin analizle değil doğrudan ilahi kaynaktan kalbinize aktığını deneyimliyorsanız; 4. Haritanız Atzilut frekansındasınız.'
        }
      },
      shadow_alchemy: {
        title: 'Gölge Simyası, Kriz Yönetimi ve Yeniden Doğuş Sınavı',
        desc: 'Gökyüzü şu an hayatınızda miadını doldurmuş olanı bırakma cesaretinizi, krizler karşısındaki dayanıklılığınızı ve karanlığı aydınlığa dönüştürme potansiyelinizi sınıyor. Beklenmedik bir kayıp, kriz veya dönüşüm anında nasıl tepki veriyorsunuz?',
        assiah: {
          title: 'Reaktif Tutum: Direnç Gösterme, İntikam veya Çöküş Hissi',
          reaction: 'Biten şeye umutsuzca tutunmak, yıkımı bir felaket olarak algılayıp hayata küsmek, haksızlığa uğradığını düşünüp intikam veya haset duygularına teslim olmak.',
          diagnosis: 'Eğer kontrolünüz dışındaki bir kayıp veya kriz anında çaresizliğe kapılıyor, öfkeyle yıkıcı tepkiler veriyor veya eskiyi bırakmamak için debeleniyorsanız; 1. Haritanız Assiah\'ı alt frekansta çalıştırıyorsunuz.'
        },
        yetzirah: {
          title: 'İçsel Çocuk Tutumu: Karanlıkla Yüzleşme ve Gölgeyi Kabul',
          reaction: 'Kendi içindeki kıskançlık, yetersizlik veya ölüm korkusu gibi en karanlık duyguları bastırmadan dürüstçe kabul etmek ve simyasal acıyı hissetmek.',
          diagnosis: 'Krizin size aynaladığı bastırılmış gölge parçalarınızı suçlamadan kucaklıyor ve acının içinden geçmeye izin veriyorsanız; 2. Haritanız Yetzirah\'ın şifasını aktive ediyorsunuz.'
        },
        beriyah: {
          title: 'Bilge Zihin Tutumu: Simyasal Dönüşüm ve Anka Kuşu Şuuru',
          reaction: 'Yıkılan formun ruhun özgürleşmesi için zorunlu olduğunu kavramak; krizden büyük bir tekâmül dersi çıkararak küllerinden yepyeni ve çok daha güçlü bir bilinçle doğmak.',
          diagnosis: '"Biten form gitti çünkü daha yüce bir varoluş doğmak zorunda" diyerek krizin ortasında yeni bir kadersel vizyon inşa edebiliyorsanız; 3. Haritanız Beriyah\'ı çalıştırıyorsunuz.'
        },
        atzilut: {
          title: 'Kozmik Birlik Tutumu: Mutlak Ölüm-Yeniden Doğuş ve Sonsuzluk Şuuru',
          reaction: 'Ölüm ile yaşamın, varlık ile yokluğun tek bir ilahi nefes olduğunu idrak etmek; hiçbir şeye sahip olunmadığını, dolayısıyla hiçbir şeyin kaybedilemeyeceğini bilerek mutlak huzurda kalmak.',
          diagnosis: 'En büyük fırtınanın ortasında bile varoluşun ebedi ışığıyla bir olduğunuzu bilip zerre kadar sarsılmadan saf kozmik güvenle durabiliyorsanız; 4. Haritanız Atzilut\'un zirvesindesiniz.'
        }
      }
    };

    const currentArchetype = challengeArchetypes[topCategory];

    const transitReason = prominentAspectDesc
      ? `Şu an gökyüzünde ${prominentAspectDesc} açısı doğrudan devrede. Bu güçlü göksel tetiklenme; haritanızın ${topCategory === 'will_power' ? 'fiziksel irade ve eylem' : topCategory === 'emotional_depth' ? 'duygusal bağlar ve bilinçaltı' : topCategory === 'mental_truth' ? 'zihinsel inanç ve vizyon' : 'kriz ve dönüşüm'} alanını aktive ederek sizi önemli bir tekâmül eşiğine davet ediyor.`
      : `Şu an gökyüzündeki güncel gezegen transitleri haritanızın temel akslarını tetikleyerek; sizi ${currentArchetype.title.toLowerCase()} kapsamında derin bir içsel farkındalığa davet ediyor.`;

    const activeConsciousness = {
      title: `Günün Kozmik Sınavı: ${currentArchetype.title}`,
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
