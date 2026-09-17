import { generateChart, HumanDesignChart, CenterCode } from '@/utils/HumanDesignEngine';
import moment from 'moment-timezone';
import { CandidateScore } from './RectificationEngine';
import { ASTRO_CITIES, AstroCity } from './AstrologyConstants';

export interface CandidateHDData {
  candidate: CandidateScore;
  dateUtc: Date;
  hdChart: HumanDesignChart;
  cleanType: string;
  cleanAuthority: string;
  cleanProfile: string;
}

export interface DisambiguationOption {
  id: string;
  label: string;
  subLabel?: string;
  description: string;
  favoredCandidateTimes: string[]; // hangi timeStr'ler ile örtüşüyor
  traitKey: string;
  traitValue: string;
}

export interface DisambiguationQuestion {
  id: string;
  category: 'authority' | 'type' | 'profile' | 'center' | 'hermetic';
  categoryLabel: string;
  iconName: string;
  title: string;
  question: string;
  hint: string;
  options: DisambiguationOption[];
}

export interface TriangulationResult {
  hasDisambiguation: boolean;
  questions: DisambiguationQuestion[];
  candidatesData: CandidateHDData[];
}

export interface CandidateEvaluationScore {
  timeStr: string;
  originalScore: number;
  hdMatchScore: number;
  totalTriangulatedScore: number;
  confidencePercent: number;
  isTopMatch: boolean;
  matchedTraits: string[];
  mismatchedTraits: string[];
}

/**
 * Verilen aday saatleri (CandidateScore[]) alır, her birinin Human Design haritasını hesaplar
 * ve adaylar arasındaki kritik zıtlıklara odaklanan dinamik sorular üretir.
 */
export function generateTriangulationQuestions(
  candidates: CandidateScore[],
  birthDateStr: string,
  birthCity: string | AstroCity
): TriangulationResult {
  if (!candidates || candidates.length < 2) {
    return {
      hasDisambiguation: false,
      questions: [],
      candidatesData: []
    };
  }

  // Şehir ve zaman dilimini belirle
  const cityName = typeof birthCity === 'string' ? birthCity : (birthCity && typeof birthCity === 'object' ? birthCity.name : 'İstanbul');
  const city = ASTRO_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase()) || ASTRO_CITIES[0];
  const tzName = city.tz || 'Europe/Istanbul';

  // En güçlü ilk 4 adayı al
  const topCands = candidates.slice(0, 4);

  // Her aday için HD haritasını çıkar
  const candidatesData: CandidateHDData[] = topCands.map(cand => {
    // Saat ve dakikayı yerel zaman diliminden UTC Date'e dönüştür
    const timeStrPadded = `${String(cand.hour).padStart(2, '0')}:${String(cand.minute).padStart(2, '0')}:${String(cand.second || 0).padStart(2, '0')}`;
    const m = moment.tz(`${birthDateStr} ${timeStrPadded}`, tzName);
    const dateUtc = m.toDate();
    const hdChart = generateChart(dateUtc);

    // Temizlenmiş etiketler
    let cleanType = hdChart.type;
    let cleanAuthority = hdChart.authority;
    if (cleanAuthority.includes('(')) {
      cleanAuthority = cleanAuthority.split('(')[0].trim();
    }

    return {
      candidate: cand,
      dateUtc,
      hdChart,
      cleanType,
      cleanAuthority,
      cleanProfile: hdChart.profile
    };
  });

  const questions: DisambiguationQuestion[] = [];

  // ==========================================
  // 1. SORU: İÇ OTORİTE & KARAR VERME MEKANİZMASI
  // ==========================================
  const authoritiesMap = new Map<string, string[]>();
  candidatesData.forEach(cd => {
    const auth = cd.cleanAuthority;
    if (!authoritiesMap.has(auth)) authoritiesMap.set(auth, []);
    authoritiesMap.get(auth)!.push(cd.candidate.timeStr);
  });

  if (authoritiesMap.size > 1) {
    const options: DisambiguationOption[] = [];
    authoritiesMap.forEach((times, auth) => {
      let label = '';
      let subLabel = '';
      let description = '';

      if (auth.toLowerCase().includes('sakral')) {
        label = 'Anlık Karın Sezgisi (Sakral Tepki)';
        subLabel = 'İçimden bir "uh-huh / evet" ya da "ı-ıh / hayır" yükselir';
        description = 'Karar verirken zihnimle analiz yapmak yerine, bir teklif veya durum karşısında karnımın altından anında yükselen bir enerji/ses bana doğruyu söyler. Çabuk ve net yanıt veririm.';
      } else if (auth.toLowerCase().includes('duygusal')) {
        label = 'Duygusal Dalga & Zamana Bırakma (Solar Pleksus)';
        subLabel = 'Anında karar vermemem gerekir, üstüne uyumam şarttır';
        description = 'Anlık coşkuyla veya anlık moral bozukluğuyla verdiğim kararlar genelde pişmanlık getirir. Duygu dalgamın yükselip durulmasını bekler, ertesi gün sakinleştiğimde en berrak netliğe kavuşurum.';
      } else if (auth.toLowerCase().includes('dalak')) {
        label = 'Anlık Spontane Sezgi (Dalak / İçgüdü)';
        subLabel = 'Saniyelik bir beden dürtüsü veya içsel bir fısıltı';
        description = 'Kararlarım saniyelik bir koku alma, tüy ürpermesi veya anlık hayatta kalma zekası gibidir. Bir kez fısıldar ve kaybolur. Mantığa sığmaz ama bedenim tehlikeyi veya doğruyu anında bilir.';
      } else if (auth.toLowerCase().includes('ego') || auth.toLowerCase().includes('kalp')) {
        label = 'İrade Gücü & Kalp Taahhüdü (Ego)';
        subLabel = 'Bu bana ve sevdiklerime ne kazandıracak?';
        description = 'Kararlarımda irademin gücü ve verdiğim söze sadık kalabilme kapasitem belirleyicidir. Gerçekten kalbimin istediği ve irademi ortaya koyabileceğim şeylere "evet" derim.';
      } else if (auth.toLowerCase().includes('kendinden') || auth.toLowerCase().includes('g merkezi') || auth.toLowerCase().includes('benlik')) {
        label = 'Sesli Konuşma & Kimlik Netliği (Benlik / G)';
        subLabel = 'Fikrimi yüksek sesle birine anlatırken netleşirim';
        description = 'Karar anlarında kendimi dinlemem gerekir. Güvendiğim birine durumu anlatırken kendi ağzımdan çıkan cümleler bana doğru yolu fısıldar.';
      } else {
        label = 'Çevresel / Zihinsel Netleşme veya Ay Ritmi';
        subLabel = 'Doğru ortamda bulunarak ve zaman tanıyarak netleşme';
        description = 'Karar verirken etrafımdaki alanın aurası ve çevre faktörü çok önemlidir. Zamana yayarak çevremle rezonans kurarak doğruya ulaşırım.';
      }

      options.push({
        id: `auth_${auth.toLowerCase().replace(/\s+/g, '_')}`,
        label,
        subLabel,
        description,
        favoredCandidateTimes: times,
        traitKey: 'authority',
        traitValue: auth
      });
    });

    questions.push({
      id: 'q_authority',
      category: 'authority',
      categoryLabel: 'İç Otorite & Karar Mekanizması',
      iconName: 'Compass',
      title: 'Hayatınızda En Doğru ve Pişman Olmadığınız Kararları Nasıl Alırsınız?',
      question: 'Aday doğum saatleriniz arasında derin bir "Karar Verme Otoritesi" farkı var. Kendi iç işleyişinize en uygun olanı seçiniz:',
      hint: 'Bu soru aday saatlerinizin Solar Pleksus (Duygu) ve Sakral merkezlerinin aktiflik anını kesinleştirir.',
      options
    });
  }

  // ==========================================
  // 2. SORU: PROFİL (1/3, 4/6, 2/4 vb.) FARKLI MI?
  // ==========================================
  const profilesMap = new Map<string, string[]>();
  candidatesData.forEach(cd => {
    const prof = cd.cleanProfile;
    if (!profilesMap.has(prof)) profilesMap.set(prof, []);
    profilesMap.get(prof)!.push(cd.candidate.timeStr);
  });

  if (profilesMap.size > 1) {
    const options: DisambiguationOption[] = [];
    profilesMap.forEach((times, prof) => {
      let label = `Profil ${prof}`;
      let subLabel = '';
      let description = '';

      if (prof === '1/3') {
        label = 'Profil 1/3: Araştırmacı & Deneyci (Sağlam Temel)';
        subLabel = 'Önce her şeyi derinlemesine öğrenir, sonra deneme-yanılmayla pratikleşirim';
        description = 'Bir konuya girmeden önce kendimi güvende hissetmek için kitapları, detayları ve temelleri hatmederim. Hayatta neyin çalışıp neyin çalışmadığını bizzat deneyerek, hatalarımdan öğrenerek keşfederim.';
      } else if (prof === '1/4') {
        label = 'Profil 1/4: Araştırmacı & Fırsatçı (Networker)';
        subLabel = 'Derin uzmanlık bilgimi sadece yakın dostlarımla ve güvendiğim çevreyle paylaşırım';
        description = 'Temeli sağlam kurmaya çok önem veririm ancak en büyük adımlarım ve fırsatlarım daima kendi güvenli dost/arkadaş çevrem üzerinden gelir. Yabancılardan ziyade tanıdık bağlar esastır.';
      } else if (prof === '2/4') {
        label = 'Profil 2/4: Münzevi & Fırsatçı (Doğal Yetenek)';
        subLabel = 'Kendi kabuğumda üretmeyi severim; başkaları beni "bu işte çok iyisin" diye çağırır';
        description = 'Yalnız kaldığımda çok verimliyimdir. Kendimi pazarlamaktan hoşlanmam; arkadaşlarım ve çevremin beni fark edip sahneye çağırmasıyla parlarım.';
      } else if (prof === '3/5') {
        label = 'Profil 3/5: Deneyci & Evrensel Çözücü (Kriz Savar)';
        subLabel = 'Hayatım deneme-yanılmalarla doludur; insanlar benden pratik kriz çözümleri bekler';
        description = 'Teorilere pek inanmam, sahada bizzat çarpışarak öğrenirim. İnsanlar zora düştüğünde beni bir kurtarıcı veya vizyoner gibi görür, onlara pratik çözümler sunarım.';
      } else if (prof === '4/6') {
        label = 'Profil 4/6: Fırsatçı (Networker) & Rol Modeli';
        subLabel = 'Kaderim dost çevreleri üzerinden akar; hayatımın evreleri (gençlik vs olgunluk) çok farklıdır';
        description = 'Fırsatlar yabancılardan değil, yakın dostluklardan doğar. Gençlikte çok deneme yapıp yorulmuş olsam da yaş ilerledikçe tarafsız, bilge bir gözlemci ve rol modeli haline gelirim.';
      } else if (prof === '5/1') {
        label = 'Profil 5/1: Evrensel Kurtarıcı & Derin Araştırmacı';
        subLabel = 'Yabancılar bana yüksek beklentiler yükler; bu beklentiyi derin bilgiyle karşılarım';
        description = 'Tanımadığım insanlar bile bana güvenip krizlerini çözmemi bekler. Hayal kırıklığı yaratmamak için konunun temeline en sağlam şekilde hakim olurum.';
      } else if (prof === '6/2') {
        label = 'Profil 6/2: Bilge Rol Modeli & Doğal Yetenek';
        subLabel = 'Uzaktan dünyayı izleyen yüksek standartlı bir gözlemci; kendi alanımda sessiz üstat';
        description = 'Hayata yüksek bir tepeden bakar gibi tarafsız bakarım. Sahtelikten ve vasatlıktan uzak durur, kendi kabuğumda mükemmelleşirim.';
      } else {
        label = `Profil ${prof}: Yaşam Rolü`;
        subLabel = 'Kişilik ve beden bilincinizin hayattaki özgün ifadesi';
        description = `Bu profil kombinasyonu (${prof}), hayatınızdaki öğrenme, ilişkilenme ve toplumsal misyonunuzun özgün çizgisini temsil eder.`;
      }

      options.push({
        id: `prof_${prof.replace('/', '_')}`,
        label,
        subLabel,
        description,
        favoredCandidateTimes: times,
        traitKey: 'profile',
        traitValue: prof
      });
    });

    questions.push({
      id: 'q_profile',
      category: 'profile',
      categoryLabel: 'Human Design Yaşam Profili (Lines)',
      iconName: 'Sparkles',
      title: 'Hayatı Deneyimleme ve Öğrenme Tarzınız Hangisine Daha Yakın?',
      question: 'Aday saatleriniz Güneş ve Dünya derecelerinin çizgilerini (Profile Lines) farklılaştırıyor:',
      hint: 'Bu soru doğum anınızdaki Güneş çizgisi kırılımını kesinleştirerek saati daraltır.',
      options
    });
  }

  // ==========================================
  // 3. SORU: ENERJİ TİPİ FARKLI MI? (Jeneratör, MG, Projektör, Manifestör vb.)
  // ==========================================
  const typesMap = new Map<string, string[]>();
  candidatesData.forEach(cd => {
    const tp = cd.cleanType;
    if (!typesMap.has(tp)) typesMap.set(tp, []);
    typesMap.get(tp)!.push(cd.candidate.timeStr);
  });

  if (typesMap.size > 1) {
    const options: DisambiguationOption[] = [];
    typesMap.forEach((times, tp) => {
      let label = '';
      let subLabel = '';
      let description = '';

      if (tp === 'Jeneratör') {
        label = 'Saf Jeneratör: Adım Adım İnşa Eden Üretim Gücü';
        subLabel = 'Sevdiğim işe başladığımda enerjim tükenmez, adımları sırayla bitiririm';
        description = 'Doğal bir yaşam enerjisine sahibim. Hayatta bir şeyleri zorla başlatmak yerine, karşıma çıkan fırsatlara karnımdan onay verip odaklandığımda saatlerce yorulmadan keyifle üretirim.';
      } else if (tp === 'Manifesting Jeneratör') {
        label = 'Manifesting Jeneratör: Hızlı, Çoklu Görevli (Multi-tasking) Kasırga';
        subLabel = 'Aynı anda 3-4 işle uğraşırım, bazı adımları atlar hızlıca sonuca koşarım';
        description = 'Sabırsız ve çok hızlı bir enerjiye sahibim. Bir işi yaparken bir sonraki adımı düşünürüm. Adımları bazen atlar, sonra eksikleri tamamlarım. Tek bir alana hapsolmak beni boğar.';
      } else if (tp === 'Projektör') {
        label = 'Projektör: Rehber & Sistem Yöneticisi';
        subLabel = 'Sürekli fiziksel motorum yoktur; başkalarını verimli yönlendirmede ustayım';
        description = 'Ben 7/24 iş üreten bir motor değilim. Dinlenmeye ve alanıma ihtiyacım var. İnsanların enerjisini, yeteneklerini ve nereye akması gerektiğini dışarıdan bir bilge gibi hemen görürüm. Takdir edilmek benim için çok değerlidir.';
      } else if (tp === 'Manifestör') {
        label = 'Manifestör: Bağımsız Başlatıcı & Öncü';
        subLabel = 'Kimseden onay beklemem, aklıma koyduğumu yapar, sadece bilgilendiririm';
        description = 'Kendi başıma bir şeyleri sıfırdan var etme gücüm yüksektir. Kontrol edilmekten nefret ederim. İnsanlara ne yapacağımı önceden haber verdiğimde hayatım pürüzsüzleşir.';
      } else {
        label = 'Reflektör: Aynalayıcı & Kolektif Bilinç';
        subLabel = 'Bulunduğum ortamın ve insanların sağlık durumunu yansıtırım';
        description = 'Çevremdeki insanların enerjisini sünger gibi çeker ve aynalarım. Tamamen açık ve esnek bir yapıya sahibim.';
      }

      options.push({
        id: `type_${tp.toLowerCase().replace(/\s+/g, '_')}`,
        label,
        subLabel,
        description,
        favoredCandidateTimes: times,
        traitKey: 'type',
        traitValue: tp
      });
    });

    questions.push({
      id: 'q_type',
      category: 'type',
      categoryLabel: 'Enerji Tipi & Çalışma Ritmi',
      iconName: 'Zap',
      title: 'Günlük Hayattaki Üretim ve Enerji Akışınız Nasıl İşler?',
      question: 'Aday saatlerinizin birinde Boğaz ve Sakral merkezi arasında kanal kapanarak enerji tipiniz değişiyor:',
      hint: 'Bu ayrım doğum saatinizde Sakral motorunun Boğaz ile bağlanıp bağlanmadığını netleştirir.',
      options
    });
  }

  // ==========================================
  // 4. SORU: MERKEZLERİN AÇIK/KAPALI DURUMU (Dalak, Kalp, Boğaz)
  // ==========================================
  if (questions.length < 3) {
    const centersToCheck: CenterCode[] = ['Spleen', 'Heart', 'Throat', 'SolarPlexus'];
    for (const cCode of centersToCheck) {
      const withCenter: string[] = [];
      const withoutCenter: string[] = [];

      candidatesData.forEach(cd => {
        if (cd.hdChart.definedCenters.includes(cCode)) {
          withCenter.push(cd.candidate.timeStr);
        } else {
          withoutCenter.push(cd.candidate.timeStr);
        }
      });

      if (withCenter.length > 0 && withoutCenter.length > 0 && withCenter.length !== candidatesData.length) {
        let centerTitle = '';
        let optDefLabel = '';
        let optDefDesc = '';
        let optOpenLabel = '';
        let optOpenDesc = '';

        if (cCode === 'Spleen') {
          centerTitle = 'Beden Sezgisi ve Bağışıklık (Dalak Merkezi)';
          optDefLabel = 'İstikrarlı Sağlık & Anlık Korkusuzluk (Tanımlı Dalak)';
          optDefDesc = 'Genelde kolay kolay hastalanmam veya neyin bana iyi gelip gelmeyeceğini anında hissederim. Başkalarının kaygıları beni kolay kolay paniğe sürüklemez.';
          optOpenLabel = 'Duyarlı Beden & Başkalarının Korkularını Hissetme (Açık Dalak)';
          optOpenDesc = 'Hastanelerin, kalabalıkların veya endişeli insanların yaydığı gerginliği ve mikropları anında kendi üzerimde hissederim. Bana iyi gelmeyen insanları bırakmakta bazen zorlanırım.';
        } else if (cCode === 'Heart') {
          centerTitle = 'İrade Gücü & Kendini İspat (Kalp / Ego Merkezi)';
          optDefLabel = 'Sabit İrade & Sözünü Kolayca Tutabilme (Tanımlı Kalp)';
          optDefDesc = 'Bir şeye söz verdiğimde çelik gibi irademle yaparım. Özdeğerimden genellikle şüphe duymam, kendimi ispatlama hırsına kapılmam.';
          optOpenLabel = 'Dalgalı İrade & Değerini Kanıtlama Baskısı (Açık Kalp)';
          optOpenDesc = 'İradem sabit bir motor gibi çalışmaz, zorlama hedefler beni yıpratır. Bazen insanlara değerimi veya başarımı ispat etmek zorunda gibi hissederim.';
        }

        if (centerTitle) {
          questions.push({
            id: `q_center_${cCode.toLowerCase()}`,
            category: 'center',
            categoryLabel: centerTitle,
            iconName: 'ShieldAlert',
            title: `Bedeninizdeki ${centerTitle} İşleyişi`,
            question: `Aday saatlerinizin birinde ${cCode} merkezi renkli (tanımlı), diğerinde beyaz (açık):`,
            hint: 'Bu soru Ay\'ın o saatte kapattığı kapıyı doğrudan teyit eder.',
            options: [
              {
                id: `center_${cCode}_def`,
                label: optDefLabel,
                description: optDefDesc,
                favoredCandidateTimes: withCenter,
                traitKey: `center_${cCode}`,
                traitValue: 'defined'
              },
              {
                id: `center_${cCode}_open`,
                label: optOpenLabel,
                description: optOpenDesc,
                favoredCandidateTimes: withoutCenter,
                traitKey: `center_${cCode}`,
                traitValue: 'open'
              }
            ]
          });
          break;
        }
      }
    }
  }

  // ==========================================
  // 5. EĞER ADAYLAR ARASINDA HD FARKI ÇOK AZSA: ASTROLOJİK YÜKSELEN / MİZAC SORUSU
  // ==========================================
  if (questions.length < 2) {
    const ascSigns = Array.from(new Set(candidatesData.map(c => c.candidate.ascSign)));
    if (ascSigns.length > 1) {
      const options: DisambiguationOption[] = candidatesData.map(cd => ({
        id: `asc_${cd.candidate.timeStr}`,
        label: `Yükselen ${cd.candidate.ascSign} (${cd.candidate.timeStr.slice(0, 5)})`,
        subLabel: `Astrolojik Yükselen Burç Derecesi: ${cd.candidate.ascDegree.toFixed(1)}°`,
        description: `Dış dünyadaki ilk izleniminiz, fiziki duruşunuz ve hayata adım atış refleksiniz ${cd.candidate.ascSign} burcunun dinamiklerini taşır.`,
        favoredCandidateTimes: [cd.candidate.timeStr],
        traitKey: 'ascSign',
        traitValue: cd.candidate.ascSign
      }));

      questions.push({
        id: 'q_ascendant',
        category: 'hermetic',
        categoryLabel: 'Yükselen Burç ve Dış Görünüm Rezonansı',
        iconName: 'Award',
        title: 'Dış Dünyaya Verdiğiniz İlk İzlenim ve Doğal Maskeniz',
        question: 'Aday saatleriniz gökyüzünde yükselen burç eksenini değiştirmektedir:',
        hint: 'Yükselen burç ilk nefes anındaki gökyüzü ufkudur.',
        options
      });
    }
  }

  return {
    hasDisambiguation: questions.length > 0,
    questions,
    candidatesData
  };
}

/**
 * Kullanıcının işaretlediği cevaplara göre her adaya bir triangülasyon skoru hesaplar
 * ve kesin kazanan adayı (nokta atışı) tespit eder.
 */
export function evaluateTriangulationAnswers(
  candidatesData: CandidateHDData[],
  questions: DisambiguationQuestion[],
  selectedOptionIds: Record<string, string> // questionId -> optionId
): CandidateEvaluationScore[] {
  const result: CandidateEvaluationScore[] = candidatesData.map(cd => {
    let hdBonus = 0;
    const matchedTraits: string[] = [];
    const mismatchedTraits: string[] = [];

    // Her soru için kontrol et
    questions.forEach(q => {
      const chosenOptId = selectedOptionIds[q.id];
      if (!chosenOptId) return;

      const chosenOpt = q.options.find(o => o.id === chosenOptId);
      if (!chosenOpt) return;

      const isFavored = chosenOpt.favoredCandidateTimes.includes(cd.candidate.timeStr);
      if (isFavored) {
        hdBonus += 50; // Her tutarlı cevap için +50 puan
        matchedTraits.push(`${q.categoryLabel}: ${chosenOpt.label.split(':')[0]}`);
      } else {
        hdBonus -= 40; // Uyuşmayan cevap için ceza
        mismatchedTraits.push(`${q.categoryLabel} uyumsuzluğu`);
      }
    });

    const totalTriangulatedScore = Math.max(0, cd.candidate.totalScore + hdBonus);

    return {
      timeStr: cd.candidate.timeStr,
      originalScore: cd.candidate.totalScore,
      hdMatchScore: hdBonus,
      totalTriangulatedScore,
      confidencePercent: 0,
      isTopMatch: false,
      matchedTraits,
      mismatchedTraits
    };
  });

  // Skoru en yüksek olanı zirve yap ve yüzdeleri hesapla
  const maxScore = Math.max(1, ...result.map(r => r.totalTriangulatedScore));
  result.forEach(r => {
    r.confidencePercent = Math.min(99, Math.round((r.totalTriangulatedScore / maxScore) * 100));
  });

  // Sırala
  result.sort((a, b) => b.totalTriangulatedScore - a.totalTriangulatedScore);
  if (result.length > 0 && Object.keys(selectedOptionIds).length > 0) {
    result[0].isTopMatch = true;
  }

  return result;
}
