import { AstroPoint, TransitAspect, AstroCity } from './AstrologyConstants';
import { 
  MAJOR_PLANET_SIGN_CUSTOM_INTERPRETATIONS,
  getIngressPhase,
  getSkyPlanetSignInterpretation,
  getPlanetSignBriefHeadline,
  getSkyAspectInterpretation,
  IngressPhaseInfo
} from './SkyAspectInterpretations';
import { getGateAndLine } from '@/utils/HumanDesignEngine';
import { GATE_TITLES } from './AstroHumanDesignSynthesis';

export interface UnifiedSkyAspectInfo {
  targetPlanet: string;
  targetSign?: string;
  targetDegree?: number;
  aspectType: 'Kavuşum' | 'Sekstil' | 'Kare' | 'Üçgen' | 'Karşıt' | 'Görmeyen' | string;
  orb: number;
  orbStrength?: string;
  isHarmonious: boolean;
  summary: string;
  energyType: string;
}

export interface UnifiedSkyPlanet {
  planetName: string;
  sign: string;
  degreeInSign: number;
  minutes: number;
  isRetrograde?: boolean;
  longitude: number;
  ingressPhase: IngressPhaseInfo;
  aspects: UnifiedSkyAspectInfo[];
  headline: string;
  humanThemeTitle: string;
  humanNarrative: string;
  hdGateInfo?: {
    gate: number;
    line: number;
    title: string;
    gift: string;
    shadow: string;
  };
  collectiveTheme: string;
  dailyAdvice: string;
  chakraLayer: string;
  detailedAnalysis: string;
  minOrb?: number;
}

export interface UnifiedAspectInfo {
  natalPlanet: string;
  natalHouse?: number;
  aspectType: 'Kavuşum' | 'Sekstil' | 'Kare' | 'Üçgen' | 'Karşıt' | 'Görmeyen';
  orb: number;
  isHarmonious: boolean;
  summary: string;
}

export interface UnifiedPlanetTransit {
  planetName: string;
  sign: string;
  degreeInSign: number;
  minutes: number;
  isRetrograde?: boolean;
  house: number;
  houseTitle: string;
  houseKeywords: string;
  aspects: UnifiedAspectInfo[];
  headline: string;
  humanThemeTitle: string;
  humanNarrative: string;
  hdGateInfo?: {
    gate: number;
    line: number;
    title: string;
    gift: string;
    shadow: string;
  };
  synthesisSummary: string;
  detailedAnalysis: string;
  actionAdvice: string;
  chakraLayer: string;
}

export const LIFE_AREA_NAMES: Record<number, string> = {
  1: 'Bireysel Duruş & Benlik',
  2: 'Maddi Güvenlik & Öz Değer',
  3: 'Zihinsel İletişim & Fikirler',
  4: 'İçsel Güvenlik & Aile Kökleri',
  5: 'Yaratıcı Tutkular & Yaşam Neşesi',
  6: 'Günlük Düzen & Sağlık',
  7: 'İlişkiler & Karşılıklı Dengeler',
  8: 'Krizler & Derin Dönüşüm',
  9: 'Hayat Vizyonu & İnançlar',
  10: 'Kariyer & Otorite Hedefleri',
  11: 'Sosyal Çevre & Gelecek Umutları',
  12: 'Bilinçaltı & Ruhsal Arınma'
};

export const LIFE_AREA_DESCRIPTIONS: Record<number, string> = {
  1: 'kendi kişisel kararların, beden dilin ve dış dünyadaki bağımsız duruşun',
  2: 'maddi gelirlerin, harcamaların ve kendi öz değerine duyduğun inanç',
  3: 'iletişim tarzın, zihinsel projelerin ve yakın çevrenle olan diyalogların',
  4: 'içsel güvenliğin, yuvan ve ailevi köklerindeki bastırılmış duygular',
  5: 'yaratıcı enerjin, aşk hayatındaki beklentilerin ve yaşamdan aldığın keyif',
  6: 'günlük çalışma tempon, üstlendiğin sorumluluklar ve beden sağlığın',
  7: 'ikili ilişkilerin, evliliğin ve karşındaki insanlarla kurduğun sınır dengesi',
  8: 'derin psikolojik krizler, ortak kaynaklar ve bırakmakta zorlandığın bağlar',
  9: 'hayata bakış açın, inanç kalıpların ve geleceğe dair vizyonun',
  10: 'iş hayatındaki sorumlulukların, unvanın ve otoriteyle olan ilişkin',
  11: 'sosyal çevren, arkadaş grupların ve geleceğe yönelik ideallerin',
  12: 'bilinçaltındaki endişelerin, içsel yalnızlığın ve ruhsal arınma ihtiyacın'
};

export const HOUSE_TITLES: Record<number, string> = {
  1: '1. Ev: Benlik, Beden & Dış Dünyadaki Duruş',
  2: '2. Ev: Maddi Kaynaklar, Kazanç & Öz Değer',
  3: '3. Ev: Zihin, İletişim, Eğitim & Yakın Çevre',
  4: '4. Ev: Yuva, Aile, Kökler & İçsel Güvenlik',
  5: '5. Ev: Aşk, Yaratıcılık, Yaşam Neşesi & Çocuklar',
  6: '6. Ev: Günlük Yaşam, Çalışma Düzeni, Hizmet & Sağlık',
  7: '7. Ev: İkili İlişkiler, Evlilik & Ortaklıklar',
  8: '8. Ev: Derin Dönüşüm, Krizler, Ortak Bütçe & Psikolojik Şifa',
  9: '9. Ev: Yüksek Vizyon, İnançlar, Felsefe & Uzak Seyahatler',
  10: '10. Ev: Kariyer, Toplumsal Statü, Otorite & Yaşam Hedefleri',
  11: '11. Ev: Gelecek Umutları, Sosyal Çevre & Kolektif Gruplar',
  12: '12. Ev: Bilinçaltı, Karmik Çözülme, İnziva & Ruhsal Arınma'
};

export const HOUSE_SHORT_THEMES: Record<number, string> = {
  1: 'kişisel kararlarınız, imajınız ve bedeniniz',
  2: 'maddi gelirleriniz, sahip olduklarınız ve öz değeriniz',
  3: 'iletişiminiz, zihniniz, kardeşleriniz ve eğitimleriniz',
  4: 'yuvanız, aileniz, kökleriniz ve içsel huzurunuz',
  5: 'aşk hayatınız, yaratıcılığınız ve yaşama sevinciniz',
  6: 'günlük çalışma temponuz, sağlığınız ve rutinleriniz',
  7: 'evliliğiniz, ikili ilişkileriniz ve ortaklıklarınız',
  8: 'ortak kaynaklar, kriz yönetimi ve derin psikolojik dönüşümünüz',
  9: 'hayat felsefeniz, inançlarınız ve ufkunuzu genişleten yollar',
  10: 'kariyeriniz, hedefleriniz, unvanınız ve toplumsal statünüz',
  11: 'sosyal çevreniz, dostluklarınız ve gelecek vizyonunuz',
  12: 'bilinçaltınız, ruhsal şifalanmanız ve gizli korkularınız'
};

const PLANET_NATURES: Record<string, string> = {
  'Güneş': 'yaşam bilincinizi ve temel iradenizi',
  'Ay': 'duygusal güvenlik ihtiyacınızı ve hislerinizi',
  'Merkür': 'zihinsel algınızı ve iletişim dilinizi',
  'Venüs': 'ilişkilerdeki sevgi alma-verme dengenizi ve değer anlayışınızı',
  'Mars': 'harekete geçme cesaretinizi ve mücadele gücünüzü',
  'Jüpiter': 'büyüme, genişleme ve inanç fırsatlarınızı',
  'Satürn': 'sorumluluk, disiplin ve karmik olgunlaşma sınavlarınızı',
  'Uranüs': 'ani uyanışları, özgürleşme arzunuzu ve tabuları yıkma isteğinizi',
  'Neptün': 'sezgisel derinliğinizi, ruhsal ilhamınızı ve manevi çözülmeleri',
  'Plüton': 'kökten dönüşümü, küllerinden doğuşu ve psikolojik güçlenmenizi',
  'Kiron': 'ruhun en derin hassasiyetlerini ve şifalanma kapısını',
  'Lilith': 'bastırılmış otantik gücünüzü, boyun eğmeyen vahşi doğanızı ve tabuları'
};

const PLANET_CHAKRAS: Record<string, string> = {
  'Güneş': '3. Solar Pleksus (Manipura) - Benlik & İrade',
  'Ay': '4. Kalp & 2. Sakral - Duygusal Akış',
  'Merkür': '5. Boğaz Çakrası (Vishuddha) - Hakikat & İfade',
  'Venüs': '4. Kalp Çakrası (Anahata) - Sevgi & Değer',
  'Mars': '1. Kök & 3. Solar Pleksus - Yaşamsal Eylem',
  'Jüpiter': '6. Üçüncü Göz (Ajna) - Bilgelik & Genişleme',
  'Satürn': '1. Kök Çakra (Muladhara) - Disiplin & Sınırlar',
  'Uranüs': '7. Taç & 5. Boğaz - Radikal Özgürlük',
  'Neptün': '6. Üçüncü Göz & 7. Taç - Mistik Birlik',
  'Plüton': '1. Kök & Kundalini - Kökten Yenilenme',
  'Kiron': '4. Kalp & 6. Üçüncü Göz - İçsel Şifa',
  'Lilith': '2. Sakral & 1. Kök - Otantik Gölge Entegrasyonu'
};

/**
 * Calculates which natal house (1-12) a given longitude falls into.
 */
export function getHouseFromLongitude(lon: number, houses: AstroPoint[]): number {
  if (!houses || houses.length < 12) return 1;
  const sorted = [...houses].sort((a, b) => a.house - b.house);
  
  for (let i = 0; i < 12; i++) {
    const curH = sorted[i];
    const nextH = sorted[(i + 1) % 12];
    const cLon = curH.longitude;
    const nLon = nextH.longitude;

    if (cLon < nLon) {
      if (lon >= cLon && lon < nLon) return curH.house;
    } else {
      if (lon >= cLon || lon < nLon) return curH.house;
    }
  }
  return 1;
}

/**
 * Generates a unified, synthesized personal transit report for a specific transit planet.
 * Connects the Planet + Zodiac Sign + Natal House + Aspecting Natal Planets into one narrative.
 */
export function generateUnifiedPlanetTransit(
  transitPlanet: AstroPoint,
  allTransitAspects: TransitAspect[],
  natalPlanets: AstroPoint[],
  natalHouses: AstroPoint[]
): UnifiedPlanetTransit {
  const pName = transitPlanet.name;
  const sign = transitPlanet.sign;
  const house = transitPlanet.house || getHouseFromLongitude(transitPlanet.longitude, natalHouses);
  const houseTitle = HOUSE_TITLES[house] || `${house}. Ev`;
  const houseTheme = HOUSE_SHORT_THEMES[house] || 'bu yaşam alanınız';

  // Find all active aspects made by this transit planet to natal planets with strict orb filter
  const matchingAspects = allTransitAspects.filter(a => {
    if (a.transitPlanet !== pName) return false;
    const hasMoon = a.transitPlanet === 'Ay' || a.natalPlanet === 'Ay';
    if (a.type === 'Görmeyen') return a.orb <= 2.0;
    const maxOrb = hasMoon ? 4.5 : 3.5;
    return a.orb <= maxOrb;
  }).sort((a, b) => a.orb - b.orb);

  const aspectInfos: UnifiedAspectInfo[] = matchingAspects.map(asp => {
    const nPlanet = natalPlanets.find(p => p.name === asp.natalPlanet);
    const nHouse = nPlanet ? (nPlanet.house || getHouseFromLongitude(nPlanet.longitude, natalHouses)) : undefined;
    const isHarmonious = asp.type === 'Üçgen' || asp.type === 'Sekstil' || (asp.type === 'Kavuşum' && !['Satürn', 'Mars', 'Plüton'].includes(asp.transitPlanet));

    let summary = '';
    const nTheme = nHouse ? `${HOUSE_SHORT_THEMES[nHouse]} alanınızdaki` : '';
    switch (asp.type) {
      case 'Kavuşum':
        summary = `${nTheme} Natal ${asp.natalPlanet} ile kavuşarak bu alanda yepyeni ve yoğun bir odak döngüsü başlatıyor.`;
        break;
      case 'Karşıt':
        summary = `${nTheme} Natal ${asp.natalPlanet} ile karşı karşıya gelerek bu iki hayat alanı arasında ayna tutan bir denge sınavı açıyor.`;
        break;
      case 'Kare':
        summary = `${nTheme} Natal ${asp.natalPlanet} ile kare açı yaparak ertelediğiniz krizleri çözmeniz için sizi cesur bir aksiyona zorluyor.`;
        break;
      case 'Üçgen':
        summary = `${nTheme} Natal ${asp.natalPlanet} ile üçgen kurarak bu süreçte çabasız, akıcı ve şifalı bir destek kanalı açıyor.`;
        break;
      case 'Sekstil':
        summary = `${nTheme} Natal ${asp.natalPlanet} ile tatlı bir temas kurarak değerlendirmeniz gereken somut fırsatlar sunuyor.`;
        break;
      default:
        summary = `Natal ${asp.natalPlanet} ile etkileşim halinde.`;
    }

    return {
      natalPlanet: asp.natalPlanet,
      natalHouse: nHouse,
      aspectType: asp.type,
      orb: asp.orb,
      isHarmonious,
      summary
    };
  });

  // Custom interpretation lookup if available
  const customKey = `${pName}-${sign}`;
  const customInterp = MAJOR_PLANET_SIGN_CUSTOM_INTERPRETATIONS[customKey];

  // Human Design Gate & Line calculation for this transit degree
  const hdCalc = getGateAndLine(transitPlanet.longitude);
  const gateMeta = GATE_TITLES[hdCalc.gate];
  const hdGateInfo = gateMeta ? {
    gate: hdCalc.gate,
    line: hdCalc.line,
    title: gateMeta.title,
    gift: gateMeta.gift,
    shadow: gateMeta.shadow,
  } : undefined;

  // Aspect analysis for human language theme
  const primaryChallenging = aspectInfos.find(a => !a.isHarmonious);
  const primaryHarmonious = aspectInfos.find(a => a.isHarmonious);

  // 1. İnsan Dili Başlık (Jargondan Arındırılmış Tema)
  let humanThemeTitle = '';
  if (primaryChallenging && primaryChallenging.natalHouse && primaryChallenging.natalHouse !== house) {
    const mainArea = LIFE_AREA_NAMES[house] || 'Yaşam Yönü';
    const targetArea = LIFE_AREA_NAMES[primaryChallenging.natalHouse] || 'İçsel Alan';
    humanThemeTitle = `${mainArea} ile ${targetArea} Arasında Denge Sınavı`;
  } else if (primaryHarmonious && primaryHarmonious.natalHouse && primaryHarmonious.natalHouse !== house) {
    const mainArea = LIFE_AREA_NAMES[house] || 'Yaşam Yönü';
    const targetArea = LIFE_AREA_NAMES[primaryHarmonious.natalHouse] || 'İçsel Alan';
    humanThemeTitle = `${mainArea} ve ${targetArea} Arasında Akıcı Destek`;
  } else {
    humanThemeTitle = `${LIFE_AREA_NAMES[house] || 'Yaşam Alanı'} Konularında Yeniden Yapılanma`;
  }

  // 2. 7Layers Yaşam Alanı Özeti (Tekrar içermeyen, sade ve doğal insan dili)
  let humanNarrative = '';
  if (primaryChallenging && primaryChallenging.natalHouse) {
    if (primaryChallenging.natalHouse === house) {
      humanNarrative += `Şu dönemde doğrudan ${LIFE_AREA_DESCRIPTIONS[house]} üzerinde yoğunlaşan etkiler, seni derin bir yüzleşmeye, sınırlarını gözden geçirmeye ve içsel muhasebeye çekebilir. `;
    } else {
      humanNarrative += `Şu sıralar ${LIFE_AREA_DESCRIPTIONS[house]} ile ${LIFE_AREA_DESCRIPTIONS[primaryChallenging.natalHouse]} arasında seni iki yönlü bir baskıya ve yüzleşmeye çeken bir gerilim hissedebilirsin. Dış dünyada bir tarafa aşırı odaklanırken diğer tarafı ihmal ettiğinde içsel ya da ilişkisel sürtüşmeler tetiklenebilir. `;
    }
  } else if (primaryHarmonious && primaryHarmonious.natalHouse) {
    if (primaryHarmonious.natalHouse === house) {
      humanNarrative += `Bu dönemde ${LIFE_AREA_DESCRIPTIONS[house]} alanında yoğunlaşan uyumlu etkiler, sana güçlü bir rahatlama, derinleşme ve berraklık sağlıyor. Tıkanmış gibi görünen durumların kendiliğinden çözüme doğru aktığını fark edebilirsin. `;
    } else {
      humanNarrative += `Bu dönemde ${LIFE_AREA_DESCRIPTIONS[house]} alanında attığın adımlar, ${LIFE_AREA_DESCRIPTIONS[primaryHarmonious.natalHouse]} konularında sana güçlü bir destek ve rahatlama akışı sağlıyor. Çözülmez gibi görünen durumların daha doğal bir akışla hafiflediğini fark edebilirsin. `;
    }
  } else {
    humanNarrative += `Bu süreçte temel odak noktan doğrudan ${LIFE_AREA_DESCRIPTIONS[house]} üzerinde toplanıyor. Arka planda biriken belirsizlikleri netleştirmen ve sağlam kararlarla ilerlemen gerekiyor. `;
  }

  // Ruhsal ve Zihinsel Arketip Sentezi (Kafa karıştırıcı kapı etiketi olmadan)
  if (hdGateInfo) {
    humanNarrative += `Bu dönemin ruhsal ve zihinsel anahtarı; seni "${hdGateInfo.shadow}" tuzağında tüketmek yerine, "${hdGateInfo.gift}" potansiyelini hayatına taşımandır. `;
  }

  // Pratik Hayat Reçetesi
  if (primaryChallenging) {
    humanNarrative += `Karşılaştığın dirençlerde haklı çıkmak için güç savaşına girmek yerine, kendi sınırlarını sessizce ve netlikle korumak bu süreci en büyük içsel bilgelikle tamamlamanı sağlayacaktır.`;
  } else {
    humanNarrative += `Zihnindeki vesvese veya ertelemeleri bir kenara bırakıp eline geçen fırsatları yapıcı adımlarla değerlendirmek sana kalıcı bir huzur ve ferahlık getirecektir.`;
  }

  // Synthesize the classic technical summary (for advanced/astro users)
  const retroText = transitPlanet.isRetrograde ? ' (Retro Harekette)' : '';
  const headline = `Transit ${pName} ${house}. Evinizde (${sign} ${transitPlanet.degreeInSign}°)${retroText}`;

  let synthesisSummary = `Transit ${pName}, ${sign} burcunda seyrederek doğrudan ${houseTheme} konularınızı tetikliyor. `;
  if (aspectInfos.length > 0) {
    const challenging = aspectInfos.filter(a => !a.isHarmonious);
    const harmonious = aspectInfos.filter(a => a.isHarmonious);
    
    if (challenging.length > 0 && harmonious.length > 0) {
      synthesisSummary += `Aynı anda haritanızdaki ${challenging.map(a => `${a.natalHouse ? `${HOUSE_SHORT_THEMES[a.natalHouse]} alanındaki ` : ''}${a.natalPlanet} (${a.aspectType})`).join(', ')} ile yüzleşme hattı kurarken; ${harmonious.map(a => `${a.natalPlanet} (${a.aspectType})`).join(', ')} ile güçlü bir çıkış ve destek kapısı açıyor.`;
    } else if (challenging.length > 0) {
      synthesisSummary += `Bu süreçte özellikle ${challenging.map(a => `${a.natalHouse ? `${HOUSE_SHORT_THEMES[a.natalHouse]} alanındaki ` : ''}${a.natalPlanet} (${a.aspectType})`).join(', ')} teması üzerinden hayatınızda önemli bir yüzleşme ve yapılandırma talep ediyor.`;
    } else {
      synthesisSummary += `Bu geçiş, ${harmonious.map(a => `${a.natalHouse ? `${HOUSE_SHORT_THEMES[a.natalHouse]} alanındaki ` : ''}${a.natalPlanet} (${a.aspectType})`).join(', ')} ile uyumlanarak bu hayat alanında işlerinizi kolaylaştıran verimli bir akış sunuyor.`;
    }
  } else {
    synthesisSummary += `Şu an doğrudan majör bir natal gezegene açı yapmasa da, bu yaşam alanınızın arka planını sessiz ve derinden dönüştürmeye devam ediyor.`;
  }

  const actionAdvice = customInterp?.advice || 
    `Bu süreçte ${houseTheme} konularında aceleci olmadan, bilinçli ve yapıcı sınırlar çizerek hareket edin. Karşınıza çıkan durumları kriz değil, ruhsal olgunlaşma fırsatı olarak görün.`;

  const chakraLayer = customInterp?.chakra || PLANET_CHAKRAS[pName] || 'Kozmik Katman Entegrasyonu';

  // Detailed Analysis Synthesis:
  // 1. Öncelikli Anlam & Eylem (En Üst Bölüm)
  let detailedAnalysis = `【7Layers Yaşam Alanı Özeti】\n${humanNarrative}\n\n` +
    `【Bireysel Eylem & Dönüşüm Rehberliği】\n${actionAdvice}\n\n` +
    `【Metnin Oluşturulduğu Kaynaklar】\n` +
    `Bu analiz aşağıdaki astrolojik ve enerjetik katmanların sentezlenmesiyle oluşturulmuştur:\n\n` +
    `【Yaşam Alanı Etkisi: ${LIFE_AREA_NAMES[house] || houseTitle}】\n` +
    `${pName}, astrolojide ${PLANET_NATURES[pName] || 'önemli enerjileri'} temsil eder. Bu geçiş; ${houseTheme} alanınızda köklü bir uyanış ve farkındalık yaratır.\n\n`;

  if (hdGateInfo) {
    detailedAnalysis += `【Human Design & Davranışsal Arketip】\n` +
      `• Aktif Kapı: ${hdGateInfo.gate}. Kapı - ${hdGateInfo.title} (Çizgi ${hdGateInfo.line})\n` +
      `• Gölge Tehdidi: ${hdGateInfo.shadow}\n` +
      `• Hediye Potansiyeli: ${hdGateInfo.gift}\n\n`;
  }

  if (customInterp) {
    detailedAnalysis += `【Burç & Arketip Dinamiği: ${sign} Burcu】\n${customInterp.summary}\n\n`;
  }

  if (aspectInfos.length > 0) {
    detailedAnalysis += `【Bütünleşik Açı Bağlantıları & Tetiklenen Alanlar】\n` +
      aspectInfos.map(a => `• ${a.aspectType} Natal ${a.natalPlanet}${a.natalHouse ? ` (${LIFE_AREA_NAMES[a.natalHouse] || HOUSE_SHORT_THEMES[a.natalHouse]})` : ''} [Orb: ${a.orb.toFixed(1)}°]: ${a.summary}`).join('\n') + '\n\n';
  }

  if (transitPlanet.isRetrograde) {
    detailedAnalysis += `【Retro (Rx) İçsel Muhasebe】\n${pName} geri harekette olduğu için bu evin konularında dışarıya fevri adımlar atmak yerine, geçmişten gelen eksikleri tamamlamak ve içsel strateji kurmak çok daha hayırlıdır.\n\n`;
  }

  return {
    planetName: pName,
    sign,
    degreeInSign: transitPlanet.degreeInSign,
    minutes: transitPlanet.minutes,
    isRetrograde: transitPlanet.isRetrograde,
    house,
    houseTitle,
    houseKeywords: houseTheme,
    aspects: aspectInfos,
    headline,
    humanThemeTitle,
    humanNarrative,
    hdGateInfo,
    synthesisSummary,
    detailedAnalysis,
    actionAdvice,
    chakraLayer
  };
}

export interface SectionBlock {
  title: string;
  content: string;
  type: 'phase' | 'theme' | 'collective' | 'advice' | 'retro' | 'house' | 'aspects' | 'sources_header' | 'general';
}

export function parseInterpretationSections(text: string): SectionBlock[] {
  if (!text) return [];
  if (!text.includes('【')) {
    return [{ title: '', content: text.trim(), type: 'general' }];
  }

  const rawBlocks = text.split('【').filter(b => b.trim().length > 0);
  return rawBlocks.map(block => {
    const closeIdx = block.indexOf('】');
    if (closeIdx === -1) {
      return { title: '', content: block.trim(), type: 'general' };
    }
    const title = block.slice(0, closeIdx).trim();
    const content = block.slice(closeIdx + 1).trim();

    let type: SectionBlock['type'] = 'general';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('kaynaklar') || lowerTitle.includes('dayandığı')) {
      type = 'sources_header';
    } else if (lowerTitle.includes('yaşam alanı') || lowerTitle.includes('ev ') || lowerTitle.includes('ev:')) {
      type = 'house';
    } else if (lowerTitle.includes('bağlantı') || lowerTitle.includes('açı') || lowerTitle.includes('tetiklenen')) {
      type = 'aspects';
    } else if (lowerTitle.includes('geçiş evresi') || lowerTitle.includes('evre') || lowerTitle.includes('ingress')) {
      type = 'phase';
    } else if (lowerTitle.includes('tema') || lowerTitle.includes('özet') || lowerTitle.includes('doğa') || lowerTitle.includes('arketip')) {
      type = 'theme';
    } else if (lowerTitle.includes('kolektif') || lowerTitle.includes('toplumsal') || lowerTitle.includes('küresel')) {
      type = 'collective';
    } else if (lowerTitle.includes('tavsiye') || lowerTitle.includes('rehberlik') || lowerTitle.includes('eylem') || lowerTitle.includes('dönüşüm')) {
      type = 'advice';
    } else if (lowerTitle.includes('retro') || lowerTitle.includes('rx')) {
      type = 'retro';
    }

    return { title, content, type };
  });
}

/**
 * Generates a unified, synthesized collective sky transit report for a specific sky planet.
 * Connects the Planet + Zodiac Sign + Ingress Phase + Human Design Gate + Aspecting Sky Planets into one narrative.
 */
export function generateUnifiedSkyPlanet(
  skyPlanet: AstroPoint,
  allSkyAspects: any[],
  allSkyPlanets: AstroPoint[]
): UnifiedSkyPlanet {
  const pName = skyPlanet.name;
  const sign = skyPlanet.sign;
  const ingressPhase = getIngressPhase(skyPlanet.degreeInSign, skyPlanet.minutes, skyPlanet.isRetrograde);

  // Human Design Gate
  const hdCalc = getGateAndLine(skyPlanet.longitude);
  const gateMeta = GATE_TITLES[hdCalc.gate];
  const hdGateInfo = gateMeta ? {
    gate: hdCalc.gate,
    line: hdCalc.line,
    title: gateMeta.title,
    gift: gateMeta.gift,
    shadow: gateMeta.shadow,
  } : undefined;

  // Custom/Sign Interpretation
  const customKey = `${pName}-${sign}`;
  const customInterp = MAJOR_PLANET_SIGN_CUSTOM_INTERPRETATIONS[customKey];
  const signInterp = getSkyPlanetSignInterpretation(pName, sign, skyPlanet.degreeInSign, skyPlanet.minutes, skyPlanet.isRetrograde);
  const briefHeadline = getPlanetSignBriefHeadline(pName, sign);

  // Matching Aspects for this planet in the sky with STRICT MUNDANE ORB FILTER
  // Anlık gökyüzü transitlerinde orbu 3.5° (Ay için 4.5°, Görmeyen için 2.0°) üzerindeki alakasız açılar elenir.
  const matchingAspects = (allSkyAspects || []).filter(a => {
    if (a.planet1 !== pName && a.planet2 !== pName) return false;
    const hasMoon = a.planet1 === 'Ay' || a.planet2 === 'Ay';
    if (a.type === 'Görmeyen') return a.orb <= 2.0;
    const maxOrb = hasMoon ? 4.5 : 3.5;
    return a.orb <= maxOrb;
  });

  // Kesinlik (Proximity) önceliği: 0.0°'ye en yakın olan zirve açı daima en başa gelir!
  matchingAspects.sort((a, b) => a.orb - b.orb);

  const aspectInfos: UnifiedSkyAspectInfo[] = matchingAspects.map(asp => {
    const targetName = asp.planet1 === pName ? asp.planet2 : asp.planet1;
    const targetPlanet = allSkyPlanets.find(item => item.name === targetName);
    const isHarmonious = asp.type === 'Üçgen' || asp.type === 'Sekstil' || (asp.type === 'Kavuşum' && !['Satürn', 'Mars', 'Plüton'].includes(targetName));
    const interp = asp.interpretation || getSkyAspectInterpretation(asp.planet1, asp.planet2, asp.type);

    const orbStrength = asp.orb <= 1.0 
      ? 'Tam Kesin (Pik)' 
      : asp.orb <= 2.5 
      ? 'Aktif & Yoğun' 
      : 'Gelişen / Hafif';

    return {
      targetPlanet: targetName,
      targetSign: targetPlanet?.sign,
      targetDegree: targetPlanet?.degreeInSign,
      aspectType: asp.type,
      orb: asp.orb,
      orbStrength,
      isHarmonious,
      summary: interp?.summary || `${targetName} ile ${asp.type} açısı.`,
      energyType: interp?.energyType || (isHarmonious ? 'Destekleyici' : 'Zorlayıcı / Sınav')
    };
  });

  const primaryChallenging = aspectInfos.find(a => !a.isHarmonious);
  const primaryHarmonious = aspectInfos.find(a => a.isHarmonious && a.aspectType !== 'Kavuşum');
  const conjunctionAspect = aspectInfos.find(a => a.aspectType === 'Kavuşum');

  // 1. İnsan Odaklı Kolektif Başlık
  let humanThemeTitle = '';
  if (primaryChallenging) {
    humanThemeTitle = `Kolektif ${pName} ile ${primaryChallenging.targetPlanet} Arasında Denge & Sınav`;
  } else if (primaryHarmonious) {
    humanThemeTitle = `Kolektif ${pName} ve ${primaryHarmonious.targetPlanet} Arasında Akıcı Destek & Fırsat`;
  } else if (conjunctionAspect) {
    humanThemeTitle = `Kolektif ${pName} ve ${conjunctionAspect.targetPlanet} Kavuşumu: Yoğun Odak & Yenilenme`;
  } else {
    humanThemeTitle = `${pName} ${sign} Seyrinde: ${briefHeadline}`;
  }

  // 2. 7Layers Kolektif Gökyüzü Özeti
  let humanNarrative = `${pName}, ${sign} burcundaki seyrinde; kolektif bilince ${signInterp.summary.replace(/^.*?;\s*/, '')} `;

  const challengingList = aspectInfos.filter(a => !a.isHarmonious);
  const harmoniousList = aspectInfos.filter(a => a.isHarmonious && a.aspectType !== 'Kavuşum');

  if (challengingList.length > 0) {
    humanNarrative += `Şu sıralar gökyüzünde ${challengingList.map(a => `${a.targetPlanet} (${a.aspectType})`).join(', ')} ile kurduğu etkileşim; toplumsal ve bireysel düzeyde sabır, net sınırlar ve yüzleşmeler gerektiren bir gerilim yaratabilir. Bir tarafa aşırı kilitlenirken diğer sorumlulukları ihmal etmemek hayati önem taşır. `;
  }

  if (harmoniousList.length > 0) {
    humanNarrative += `Aynı zamanda ${harmoniousList.map(a => `${a.targetPlanet} (${a.aspectType})`).join(', ')} ile kurduğu ahenkli temas, tıkanıklıkları aşmanız için yapıcı çözümler, ilham verici çıkış yolları ve bereketli fırsatlar sunuyor. `;
  }

  if (conjunctionAspect) {
    humanNarrative += `${conjunctionAspect.targetPlanet} ile olan kavuşumu ise, bu alanda yepyeni ve tavizsiz bir odaklanma enerjisi başlatıyor. `;
  }

  if (aspectInfos.length === 0) {
    humanNarrative += `Şu anda diğer gökyüzü gezegenleriyle sert bir açı bağı kurmadan, ${sign} burcundaki arketipsel gücünü sakin ve istikrarlı bir şekilde dünyaya yaymaya devam ediyor. `;
  }

  if (hdGateInfo) {
    humanNarrative += `Bu gökyüzü döngüsünün kolektif anahtarı; "${hdGateInfo.shadow}" tuzağına kapılarak yıpranmak yerine, "${hdGateInfo.gift}" potansiyelini kararlarınıza ve ilişkilerinize yansıtabilmektir. `;
  }

  if (signInterp.advice) {
    humanNarrative += ` ${signInterp.advice}`;
  }

  const retroText = skyPlanet.isRetrograde ? ' (Retro Harekette - Rx)' : '';
  const headline = `Kolektif ${pName} (${sign} ${skyPlanet.degreeInSign}°)${retroText}`;
  const chakraLayer = customInterp?.chakra || PLANET_CHAKRAS[pName] || 'Kozmik Katman Entegrasyonu';
  const collectiveTheme = customInterp?.collective || signInterp.summary;
  const dailyAdvice = signInterp.advice || customInterp?.advice || 'Bu dönemde kendi içsel dengenizi koruyarak adımlar atın.';

  // Detailed Analysis Synthesis for modal
  let detailedAnalysis = `【7Layers Kolektif Gökyüzü Özeti】\n${humanNarrative}\n\n` +
    `【Kolektif Bilinç ve Toplumsal Etki】\n${collectiveTheme}\n\n` +
    `【Günün Kolektif Rehberliği & Tavsiyesi】\n${dailyAdvice}\n\n` +
    `【Metnin Dayandığı Kozmik Katmanlar】\n` +
    `Bu analiz anlık gökyüzü gezegen konumları, burç dinamikleri ve açı kalıplarının sentezlenmesiyle oluşturulmuştur:\n\n` +
    `【Burç Seyri & Geçiş Evresi: ${sign} Burcu】\n` +
    `• Evre: ${ingressPhase.badge} (${ingressPhase.label})\n` +
    `• Açıklama: ${ingressPhase.description}\n` +
    `• Burç Dinamiği: ${signInterp.summary}\n\n`;

  if (hdGateInfo) {
    detailedAnalysis += `【Human Design Kozmik Kapısı】\n` +
      `• Aktif Kapı: ${hdGateInfo.gate}. Kapı - ${hdGateInfo.title} (Çizgi ${hdGateInfo.line})\n` +
      `• Gölge Tuzağı: ${hdGateInfo.shadow}\n` +
      `• Hediye Frekansı: ${hdGateInfo.gift}\n\n`;
  }

  if (aspectInfos.length > 0) {
    detailedAnalysis += `【Eşzamanlı Aktif Gökyüzü Açıları】\n` +
      aspectInfos.map(a => `• ${a.aspectType} ${a.targetPlanet}${a.targetSign ? ` (${a.targetSign} ${a.targetDegree || 0}°)` : ''} [Orb: ${a.orb.toFixed(1)}° • ${a.orbStrength}]: ${a.summary}`).join('\n') + '\n\n';
  }

  if (skyPlanet.isRetrograde) {
    detailedAnalysis += `【Retro (Rx) İçe Dönüş】\n${pName} gökyüzünde geri harekette seyrediyor. Bu dönemde dışsal fevri atılımlar yerine, içsel değerlendirmeler yapmak, eksikleri onarmak ve stratejileri sağlamlaştırmak kolektif olarak çok daha verimlidir.\n\n`;
  }

  const minOrb = aspectInfos.length > 0 ? Math.min(...aspectInfos.map(a => a.orb)) : undefined;

  return {
    planetName: pName,
    sign,
    degreeInSign: skyPlanet.degreeInSign,
    minutes: skyPlanet.minutes,
    isRetrograde: skyPlanet.isRetrograde,
    longitude: skyPlanet.longitude,
    ingressPhase,
    aspects: aspectInfos,
    headline,
    humanThemeTitle,
    humanNarrative,
    hdGateInfo,
    collectiveTheme,
    dailyAdvice,
    chakraLayer,
    detailedAnalysis,
    minOrb
  };
}

export function generateUnifiedSkyPlanets(
  allSkyPlanets: AstroPoint[],
  allSkyAspects: any[],
  sortBy: 'orb' | 'classic' = 'orb'
): UnifiedSkyPlanet[] {
  if (!allSkyPlanets || allSkyPlanets.length === 0) return [];

  const PRIORITY_ORDER = [
    'Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars',
    'Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton',
    'Kiron', 'Kuzey Ay Düğümü', 'Lilith'
  ];

  const filteredPlanets = [...allSkyPlanets].filter(p => PRIORITY_ORDER.includes(p.name));
  const unifiedList = filteredPlanets.map(p => generateUnifiedSkyPlanet(p, allSkyAspects, allSkyPlanets));

  if (sortBy === 'classic') {
    return unifiedList.sort((a, b) => PRIORITY_ORDER.indexOf(a.planetName) - PRIORITY_ORDER.indexOf(b.planetName));
  }

  // Varsayılan: ORB ÖNCELİKLİ (0.0°'ye en yakın, en kesin pik yapan açısı olan gezegenler en üstte!)
  return unifiedList.sort((a, b) => {
    const aOrb = a.minOrb !== undefined ? a.minOrb : 999;
    const bOrb = b.minOrb !== undefined ? b.minOrb : 999;

    if (aOrb !== bOrb) {
      return aOrb - bOrb;
    }
    // Eşitlik durumunda klasik sıraya göre
    return PRIORITY_ORDER.indexOf(a.planetName) - PRIORITY_ORDER.indexOf(b.planetName);
  });
}

export interface CurrentSkyOverview {
  headline: string;
  subHeadline: string;
  vibeNarrative: string;
  moonSign: string;
  moonDegree: number;
  moonMood: string;
  sunSign: string;
  sunDegree: number;
  barometer: {
    mental: { score: number; label: string; tone: string };
    emotional: { score: number; label: string; tone: string };
    action: { score: number; label: string; tone: string };
  };
  opportunities: string[];
  cautions: string[];
  topAspects: {
    p1: string;
    p2: string;
    aspectType: string;
    orb: number;
    badge: string;
    isHarmonious: boolean;
    summary: string;
  }[];
}

const MOON_MOODS: Record<string, { mood: string; energy: string; doAction: string; dontAction: string }> = {
  'Koç': { mood: 'Atılgan, sabırsız ve cesur', energy: 'Yüksek', doAction: 'Yeni adımlar atın ve fiziksel enerjinizi eyleme dökün.', dontAction: 'Düşünmeden fevri kararlar almaktan ve sert çıkışlardan kaçının.' },
  'Boğa': { mood: 'Dingin, kararlı ve güven arayan', energy: 'Sakin & Kalıcı', doAction: 'Finansal konuları düzenleyin, bedeninizi dinlendirin ve somut işlere odaklanın.', dontAction: 'Aşırı inatçılıktan ve değişime direnç göstermekten kaçının.' },
  'İkizler': { mood: 'Meraklı, konuşkan ve hareketli', energy: 'Zihinsel & Hızlı', doAction: 'İletişim kurun, araştırın, yarım kalan görüşmeleri ve yazışmaları tamamlayın.', dontAction: 'Aynı anda çok şeye bölünüp zihninizi dağıtmaktan kaçının.' },
  'Yengeç': { mood: 'Hassas, koruyucu ve sezgisel', energy: 'İçe Dönük & Derin', doAction: 'Sevdiklerinize ve evinize vakit ayırın, iç sesinize ve rüyalarınıza güvenin.', dontAction: 'Aşırı alınganlık yapmaktan ve geçmiş kırgınlıklara saplanmaktan kaçının.' },
  'Aslan': { mood: 'Özgüvenli, cömert ve sahne odaklı', energy: 'Sıcak & Yaratıcı', doAction: 'Yaratıcı projelerinizi sergileyin, cesaretinizi ortaya koyun ve takdir edin.', dontAction: 'Ego savaşlarına girmekten ve aşırı gururdan kaçının.' },
  'Başak': { mood: 'Analitik, titiz ve düzenleyici', energy: 'Pratik & Odaklı', doAction: 'Dağınıklıkları toparlayın, detay gerektiren işleri bitirin ve sağlığınıza özen gösterin.', dontAction: 'Aşırı özeleştiri yapmaktan ve kusur arayarak kaygılanmaktan kaçının.' },
  'Terazi': { mood: 'Uyumlu, diplomatik ve estetik', energy: 'Dengeli & Sosyal', doAction: 'İlişkilerde uzlaşma sağlayın, adaleti gözetin ve estetik dokunuşlar yapın.', dontAction: 'Kararsızlıkta kilitlenmekten ve ' + 'herkesi memnun etmek için kendinizi unutmaktan kaçının.' },
  'Akrep': { mood: 'Derin, sezgisel ve dönüştürücü', energy: 'Yoğun & Manyetik', doAction: 'Gizli kalmış meseleleri çözün, stratejik planlar yapın ve arınmaya odaklanın.', dontAction: 'Kuşkuculuğa kapılmaktan ve gizli güç savaşlarına girmekten kaçının.' },
  'Yay': { mood: 'İyimser, vizyoner ve özgür', energy: 'Genişlemeci & Neşeli', doAction: 'Gelecek vizyonunuzu genişletin, yeni şeyler öğrenin ve umudunuzu tazeleyin.', dontAction: 'Gerçekleşmesi zor büyük vaatler vermekten ve detayları ihmal etmekten kaçının.' },
  'Oğlak': { mood: 'Disiplinli, sorumluluk sahibi ve gerçekçi', energy: 'Ciddi & Hedef Odaklı', doAction: 'Kariyer hedeflerinize odaklanın, somut ve kalıcı planlar yapın.', dontAction: 'Aşırı karamsarlığa kapılmaktan ve kendinize katı kurallar koymaktan kaçının.' },
  'Kova': { mood: 'Yenilikçi, özgür ve vizyoner', energy: 'Sıradışı & Kolektif', doAction: 'Özgün fikirlerinizi paylaşın, toplumsal faydaya ve teknolojiye alan açın.', dontAction: 'Duygulardan tamamen kopuk davranmaktan ve anlamsız asilik yapmaktan kaçının.' },
  'Balık': { mood: 'Şefkatli, ilham dolu ve akışta', energy: 'Süptil & Manevi', doAction: 'Meditasyon, sanat ve şifa çalışmalarına yönelin, sezgilerinize kulak verin.', dontAction: 'Sorumluluklardan kaçmaktan ve kurban psikolojisine bürünmekten kaçının.' },
};

export function generateCurrentSkyOverview(
  allSkyPlanets: AstroPoint[],
  allSkyAspects: any[]
): CurrentSkyOverview | null {
  if (!allSkyPlanets || allSkyPlanets.length === 0) return null;

  const sun = allSkyPlanets.find(p => p.name === 'Güneş');
  const moon = allSkyPlanets.find(p => p.name === 'Ay');
  const mercury = allSkyPlanets.find(p => p.name === 'Merkür');
  const mars = allSkyPlanets.find(p => p.name === 'Mars');

  const moonSign = moon?.sign || 'Koç';
  const moonDeg = moon?.degreeInSign ?? 0;
  const sunSign = sun?.sign || 'Terazi';
  const sunDeg = sun?.degreeInSign ?? 0;

  const moonData = MOON_MOODS[moonSign] || MOON_MOODS['Koç'];

  // Açıları dar orb'a göre filtrele ve sırala
  const validAspects = (allSkyAspects || []).filter(a => a.orb <= 3.2);
  validAspects.sort((a, b) => a.orb - b.orb);

  const topAspects = validAspects.slice(0, 3).map(asp => {
    const isHarmonious = asp.type === 'Üçgen' || asp.type === 'Sekstil' || (asp.type === 'Kavuşum' && !['Satürn', 'Mars', 'Plüton'].includes(asp.planet2));
    const interp = asp.interpretation || getSkyAspectInterpretation(asp.planet1, asp.planet2, asp.type);
    return {
      p1: asp.planet1,
      p2: asp.planet2,
      aspectType: asp.type,
      orb: asp.orb,
      isHarmonious,
      summary: interp?.summary || `${asp.planet1} - ${asp.planet2} ${asp.type} açısı.`,
      badge: asp.orb <= 1.0 ? 'Pik Etki (Kesin)' : `${asp.orb.toFixed(1)}° Orb`
    };
  });

  // Barometre Puanları Hesaplama
  let mentalScore = 72;
  let emotionalScore = 70;
  let actionScore = 68;

  // Ay burcu elementi
  if (['Yengeç', 'Akrep', 'Balık'].includes(moonSign)) {
    emotionalScore += 16;
  } else if (['İkizler', 'Terazi', 'Kova'].includes(moonSign)) {
    mentalScore += 14;
  } else if (['Koç', 'Aslan', 'Yay'].includes(moonSign)) {
    actionScore += 18;
  } else if (['Boğa', 'Başak', 'Oğlak'].includes(moonSign)) {
    mentalScore += 8;
    actionScore += 8;
  }

  // Açıların etkisi
  topAspects.forEach(asp => {
    if (asp.isHarmonious) {
      mentalScore += 4;
      actionScore += 4;
    } else {
      emotionalScore += 6;
      actionScore += 2;
    }
  });

  mentalScore = Math.min(95, Math.max(45, mentalScore));
  emotionalScore = Math.min(96, Math.max(50, emotionalScore));
  actionScore = Math.min(94, Math.max(48, actionScore));

  const mentalTone = mentalScore >= 80 ? 'Yüksek & Berrak' : mentalScore >= 65 ? 'Stratejik & Dengeli' : 'Dağınık / Dikkat İstiyor';
  const emotionalTone = emotionalScore >= 80 ? 'Yoğun & Sezgisel' : emotionalScore >= 65 ? 'Dengeli & Sakin' : 'Hassas / Dinlenme Gerek';
  const actionTone = actionScore >= 80 ? 'Dinamik & Kararlı' : actionScore >= 65 ? 'Ölçülü & İstikrarlı' : 'Ağır / Bekle-Gör';

  // Başlık Kurgusu
  const peakAspect = topAspects[0];
  let headline = `Günün Ruh Hali: ${moonData.mood} Bir Atmosfer`;
  if (peakAspect) {
    if (peakAspect.isHarmonious) {
      headline = `Akıcı ve Destekleyici Enerjiler: ${moonData.mood}`;
    } else {
      headline = `Farkındalık ve Denge Zamanı: ${moonData.mood}`;
    }
  }

  const subHeadline = `☉ Güneş ${sunSign} (${sunDeg}°) • ☽ Ay ${moonSign} (${moonDeg}°)`;

  // Vurucu 2-3 Cümlelik Genel Anlatı
  let vibeNarrative = `Bugün genel atmosfer ${moonData.mood.toLowerCase()} bir frekansta akıyor. `;
  if (peakAspect) {
    vibeNarrative += `${peakAspect.summary.replace(/^.*?;\s*/, '')} `;
  }
  vibeNarrative += `Günün anahtarı: Duygusal dalgalanmalar karşısında merkezinizde kalarak, ${moonData.doAction.toLowerCase()}`;

  // Fırsatlar ve Tuzaklar
  const opportunities = [
    moonData.doAction,
    peakAspect?.isHarmonious
      ? `${peakAspect.p1} ve ${peakAspect.p2} temasının getirdiği ilhamı somut projelere dönüştürün.`
      : 'Zorlayıcı görünen durumları olgunlukla karşılayıp içsel sınırlarınızı netleştirin.'
  ];

  const cautions = [
    moonData.dontAction,
    peakAspect && !peakAspect.isHarmonious
      ? `${peakAspect.p1} ve ${peakAspect.p2} geriliminde aceleci kararlar almaktan ve restleşmelerden uzak durun.`
      : 'Günün getirdiği rahatlığa fazla kapılıp önemli sorumlulukları ertelemeyin.'
  ];

  return {
    headline,
    subHeadline,
    vibeNarrative,
    moonSign,
    moonDegree: moonDeg,
    moonMood: moonData.mood,
    sunSign,
    sunDegree: sunDeg,
    barometer: {
      mental: { score: mentalScore, label: `${mentalScore}%`, tone: mentalTone },
      emotional: { score: emotionalScore, label: `${emotionalScore}%`, tone: emotionalTone },
      action: { score: actionScore, label: `${actionScore}%`, tone: actionTone }
    },
    opportunities,
    cautions,
    topAspects
  };
}

const SIGN_FLAVORS: Record<string, { adj: string; style: string }> = {
  'Koç': { adj: 'cesur, öncü ve doğrudan', style: 'inisyatif alarak ve korkusuzca adım atarak' },
  'Boğa': { adj: 'dingin, sağlam ve güven odaklı', style: 'somut değerler üreterek ve sabırla inşa ederek' },
  'İkizler': { adj: 'zihinsel açıdan çevik, meraklı ve iletişim odaklı', style: 'yeni fikirler geliştirerek, konuşarak ve bağlantı kurarak' },
  'Yengeç': { adj: 'şefkatli, sezgisel ve koruyucu', style: 'duygusal bağları güçlendirerek ve iç sesinize kulak vererek' },
  'Aslan': { adj: 'özgüvenli, yaratıcı ve sıcak', style: 'kendi ışığınızı ortaya koyarak ve yürekten ifade ederek' },
  'Başak': { adj: 'analitik, özenli ve çözüm odaklı', style: 'detayları sadeleştirerek ve pratik düzen kurarak' },
  'Terazi': { adj: 'uzlaşmacı, zarif ve denge arayan', style: 'adil bir diyalog ve karşılıklı uyum kurarak' },
  'Akrep': { adj: 'derin, sezgisel ve dönüştürücü', style: 'yüzeyin altındaki gerçeği görerek ve stratejik hareket ederek' },
  'Yay': { adj: 'vizyoner, iyimser ve özgürlükçü', style: 'ufkunuzu genişleterek ve büyük resme odaklanarak' },
  'Oğlak': { adj: 'disiplinli, kararlı ve gerçekçi', style: 'uzun vadeli sorumluluk alarak ve sağlam sınırlar çizerek' },
  'Kova': { adj: 'yenilikçi, özgün ve ezber bozan', style: 'alışılmış kalıpların dışına çıkarak ve bağımsız düşünerek' },
  'Balık': { adj: 'ilham dolu, empatik ve ruhsal', style: 'sezgisel akışa güvenerek ve şefkatle yaklaşarak' }
};

const TRANSIT_PLANET_GIFT: Record<string, string> = {
  'Güneş': 'yaşam enerjinizi, görünürlüğünüzü ve bilinçli iradenizi parlatırken',
  'Ay': 'duygusal sezgilerinizi, samimi bağ kurma ihtiyacınızı ve içsel akışınızı harekete geçirirken',
  'Merkür': 'zihinsel berraklığınızı, karar alma hızınızı ve iletişim becerinizi güçlendirirken',
  'Venüs': 'ilişkilerde uyumu, çekim gücünüzü, sevgi akışını ve maddi/manevi bereketi artırırken',
  'Mars': 'cesaretinizi, fiziksel motivasyonunuzu ve ertelediğiniz adımları atma gücünüzü ateşlerken',
  'Jüpiter': 'büyüme fırsatlarını, şansı, iyimserliği ve ufuk açıcı destekleri büyütürken',
  'Satürn': 'kalıcı yapı kurma gücünüzü, sabrınızı ve uzun vadeli güven inşa etme disiplininizi sağlamlaştırırken',
  'Uranüs': 'ani zihinsel uyanışları, sürpriz sıçramaları ve kalıpları kıran özgürleştirici yenilikleri tetiklerken',
  'Neptün': 'ruhsal ilhamınızı, yaratıcı hayal gücünüzü ve sezgisel şifa kanalınızı derinleştirirken',
  'Plüton': 'küllerinden doğan içsel gücünüzü, karizmanızı ve kökten yenilenme kapasitenizi açığa çıkarırken',
  'Kiron': 'geçmiş yaraları bilgeliğe dönüştüren derin bir içsel şifa ve kabullenme kapısı açarken',
  'Lilith': 'bastırılmış otantik gücünüzü ve boyun eğmeyen özgüveninizi uyandırırken',
  'Kuzey Ay Düğümü': 'sizi ruhsal tekamülünüze ve geleceğin kadersel fırsatlarına doğru çekerken',
  'Şans Noktası (POF)': 'doğal akışta gelen kısmet, sevinç ve zahmetsiz denge noktanızı aydınlatırken',
  'Vertex (Vx)': 'beklenmedik ama kadersel nitelikteki karşılaşmaları ve dönüm noktalarını hızlandırırken'
};

const TRANSIT_PLANET_CHALLENGE: Record<string, string> = {
  'Güneş': 'ego çatışmalarına, irade savaşlarına veya aşırı gurur kaynaklı gerilimlere çekebilir',
  'Ay': 'anlık duygusal dalgalanmalara, alınganlığa veya geçmişten gelen güvensizlik tepkilerine açık hale getirebilir',
  'Merkür': 'zihinsel aşırı yüklenmeye, yanlış anlaşılmalara veya aceleci ve keskin sözlere zemin hazırlayabilir',
  'Venüs': 'ilişkilerde beklenti krizlerine, değer sorgulamalarına veya gereksiz harcama eğilimine yol açabilir',
  'Mars': 'sabırsızlığa, ani öfke patlamalarına ve fevri restleşmelere karşı ekstra dikkat gerektirir',
  'Jüpiter': 'aşırı iyimserlikle boyunuzu aşan sözler vermeye, abartıya ve sınırları zorlamaya itebilir',
  'Satürn': 'gecikmeler, ağır sorumluluklar veya daralma hissi üzerinden dayanıklılığınızı ve sabrınızı sınayabilir',
  'Uranüs': 'beklenmedik plan değişiklikleri, huzursuzluk ve ani kopuş dürtüsüyle sinir sisteminizi zorlayabilir',
  'Neptün': 'belirsizlik, kafa karışıklığı, gerçeklerden kaçış veya yanılsama riskine karşı uyanık olmayı gerektirir',
  'Plüton': 'derin güç savaşları, kontrol takıntısı veya artık miadını doldurmuş bağları bırakma krizi doğurabilir',
  'Kiron': 'eski bir kırgınlığın veya yetersizlik hissinin tetiklenmesiyle duygusal hassasiyet yaratabilir',
  'Lilith': 'bastırılmış öfke, gölge kıskançlıklar veya keskin sınır ihlali tepkilerini yüzeye çıkarabilir',
  'Kuzey Ay Düğümü': 'alışkın olduğunuz konfor alanından çıkarken yaşadığınız içsel direnci görünür kılabilir',
  'Şans Noktası (POF)': 'kolaycılığa kaçma veya mevcut kısmeti fark edemeyip içsel huzuru dağıtma sınavı getirebilir',
  'Vertex (Vx)': 'kontrolünüz dışında gelişen kadersel karşılaşmalar ve ani yön değişimleriyle dengenizi sınayabilir'
};

const NATAL_PLANET_CORE: Record<string, string> = {
  'Güneş': 'temel kimliğinizi, yaşam amacınızı ve özgüven merkezinizi',
  'Ay': 'duygusal ihtiyaçlarınızı, içsel güvenlik alanınızı ve kalp huzurunuzu',
  'Merkür': 'düşünce yapınızı, öğrenme biçiminizi ve kendinizi ifade etme dilinizi',
  'Venüs': 'sevgi dilinizi, ilişki beklentilerinizi ve öz değer algınızı',
  'Mars': 'eylem tarzınızı, sınır koruma refleksinizi ve yaşam enerjinizi',
  'Jüpiter': 'hayat vizyonunuzu, inançlarınızı ve bolluk bilincinizi',
  'Satürn': 'sorumluluk bilincinizi, kariyer omurganızı ve sınırlarınızı',
  'Uranüs': 'bireysel özgünlüğünüzü ve özgürlük alanınızı',
  'Neptün': 'sezgisel dünyanızı, hayallerinizi ve ruhsal duyarlılığınızı',
  'Plüton': 'derin psikolojik gücünüzü ve krizleri dönüştürme potansiyelinizi',
  'Kiron': 'en hassas ruhsal yaranızı ve şifalanma kapasitenizi',
  'Lilith': 'tavizsiz doğanızı ve bastırılmış içgüdüsel gücünüzü',
  'Kuzey Ay Düğümü': 'bu hayattaki kadersel gelişim yönünüzü',
  'Şans Noktası (POF)': 'doğuştan gelen kısmet ve içsel neşe kaynağınızı',
  'Vertex (Vx)': 'kadersel kesişme ve önemli karşılaşma noktanızı',
  'Yükselen (ASC)': 'dış dünyaya sunduğunuz duruşu, beden enerjinizi ve kişisel başlangıçlarınızı',
  'Tepe Noktası (MC)': 'toplumsal hedeflerinizi, mesleki yönünüzü ve görünür başarınızı'
};

export interface PersonalGuidanceItem {
  text: string;
  astroTag?: string;
}

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildDynamicAspectOpportunity(params: {
  transitPlanet: string;
  transitSign: string;
  transitDegree: number;
  transitHouse: number;
  natalPlanet: string;
  natalSign: string;
  natalDegree: number;
  natalHouse: number;
  aspectType: string;
}): PersonalGuidanceItem {
  const { transitPlanet, transitSign, transitDegree, transitHouse, natalPlanet, natalSign, natalDegree, natalHouse, aspectType } = params;
  const signFlavor = SIGN_FLAVORS[transitSign] || { adj: 'dinamik', style: 'farkındalıkla hareket ederek' };
  const tGift = TRANSIT_PLANET_GIFT[transitPlanet] || 'yeni bir farkındalık ve destek akışı sunarken';
  const nCore = NATAL_PLANET_CORE[natalPlanet] || 'doğuştan gelen potansiyelinizi';
  const nArea = HOUSE_SHORT_THEMES[natalHouse] || 'bu yaşam alanınız';
  const tArea = HOUSE_SHORT_THEMES[transitHouse] || 'güncel gündeminiz';

  const aspectAction = aspectType === 'Üçgen'
    ? `${signFlavor.style} çabasız, doğal ve akıcı sonuçlar elde edebilirsiniz.`
    : aspectType === 'Sekstil'
    ? `${signFlavor.style} önünüze çıkan fırsatları somut bir girişime ve iletişime dönüştürebilirsiniz.`
    : `${signFlavor.style} bu alanda yepyeni ve kalıcı bir sayfa açabilirsiniz.`;

  const houseBridge = transitHouse !== natalHouse
    ? `${capitalizeFirst(tArea)} alanındaki hareketlilik doğrudan ${nArea} konularınızı besliyor; `
    : `Doğrudan ${nArea} konularınızda yoğunlaşan bu süreçte `;

  const text = `${capitalizeFirst( signFlavor.adj )} bir enerji akışı, ${tGift} ${nCore} güçlendiriyor. ${houseBridge}${aspectAction}`;
  const astroTag = `Transit ${transitPlanet} (${transitSign} ${transitDegree}°) • ${aspectType} • Natal ${natalPlanet} (${natalSign} ${natalDegree}°)`;
  return { text, astroTag };
}

function buildDynamicAspectCaution(params: {
  transitPlanet: string;
  transitSign: string;
  transitDegree: number;
  transitHouse: number;
  natalPlanet: string;
  natalSign: string;
  natalDegree: number;
  natalHouse: number;
  aspectType: string;
}): PersonalGuidanceItem {
  const { transitPlanet, transitSign, transitDegree, transitHouse, natalPlanet, natalSign, natalDegree, natalHouse, aspectType } = params;
  const signFlavor = SIGN_FLAVORS[transitSign] || { adj: 'yoğun', style: 'dengeli kalarak' };
  const tChallenge = TRANSIT_PLANET_CHALLENGE[transitPlanet] || 'içsel bir gerilim ve sınav yaratabilir';
  const nCore = NATAL_PLANET_CORE[natalPlanet] || 'hassas dengelerinizi';
  const nArea = HOUSE_SHORT_THEMES[natalHouse] || 'bu yaşam alanınız';
  const tArea = HOUSE_SHORT_THEMES[transitHouse] || 'güncel gündeminiz';

  const aspectWarning = aspectType === 'Karşıt'
    ? `İki uç arasında savrulmak yerine, ${tArea} ile ${nArea} konuları arasında bilinçli ve sakin bir denge kurun.`
    : aspectType === 'Kare'
    ? `${capitalizeFirst(nArea)} konularında yükselen içsel baskıyı fevri tepkilere dönüştürmeyin; sabırla ve sınırlarınızı koruyarak ilerleyin.`
    : aspectType === 'Kavuşum'
    ? `${capitalizeFirst(nArea)} alanında yoğunlaşan bu baskıyı aceleci kararlarla değil, ${signFlavor.style} yönetin.`
    : `${capitalizeFirst(nArea)} konularında kör noktalara ve ani yargılara kapılmadan önce şartların netleşmesini bekleyin.`;

  const text = `${capitalizeFirst(nCore)} tetikleyen güncel etkiler, sizi ${tChallenge}. ${aspectWarning}`;
  const astroTag = `Transit ${transitPlanet} (${transitSign} ${transitDegree}°) • ${aspectType} • Natal ${natalPlanet} (${natalSign} ${natalDegree}°)`;
  return { text, astroTag };
}

export interface PersonalTransitOverview {
  headline: string;
  subHeadline: string;
  themeDescription: string;
  focusHouses: {
    house: number;
    title: string;
    description: string;
    planetNames: string[];
  }[];
  barometer: {
    mental: { score: number; label: string; tone: string };
    emotional: { score: number; label: string; tone: string };
    action: { score: number; label: string; tone: string };
  };
  opportunities: PersonalGuidanceItem[];
  cautions: PersonalGuidanceItem[];
  topAspects: {
    transitPlanet: string;
    transitSign: string;
    transitDegree: number;
    transitHouse: number;
    natalPlanet: string;
    natalSign: string;
    natalDegree: number;
    natalHouse: number;
    aspectType: string;
    orb: number;
    badge: string;
    isHarmonious: boolean;
    summary: string;
  }[];
  lifeAdvice: string;
}

export function generatePersonalTransitOverview(
  transitPlanets: AstroPoint[],
  allTransitAspect: TransitAspect[],
  natalPlanets: AstroPoint[],
  natalHouses: AstroPoint[]
): PersonalTransitOverview | null {
  if (!transitPlanets || transitPlanets.length === 0 || !natalPlanets || natalPlanets.length === 0) {
    return null;
  }

  // Açıları dar orb'a göre sırala (0.0° en başta)
  const validAspects = (allTransitAspect || []).filter(a => a.orb <= 3.5);
  validAspects.sort((a, b) => a.orb - b.orb);

  const enrichAspect = (asp: TransitAspect) => {
    const tPlanet = transitPlanets.find(p => p.name === asp.transitPlanet);
    const nPlanet = natalPlanets.find(p => p.name === asp.natalPlanet);
    const tHouse = tPlanet ? (tPlanet.house || getHouseFromLongitude(tPlanet.longitude, natalHouses)) : 1;
    const nHouse = nPlanet ? (nPlanet.house || getHouseFromLongitude(nPlanet.longitude, natalHouses)) : 1;
    const isHarmonious = asp.type === 'Üçgen' || asp.type === 'Sekstil' || (asp.type === 'Kavuşum' && !['Satürn', 'Mars', 'Plüton', 'Kiron', 'Lilith'].includes(asp.transitPlanet));

    const tSign = tPlanet?.sign || '';
    const tDeg = tPlanet?.degreeInSign ?? 0;
    const nSign = nPlanet?.sign || '';
    const nDeg = nPlanet?.degreeInSign ?? 0;

    const signFlavor = SIGN_FLAVORS[tSign] || { adj: 'aktif', style: 'farkındalıkla' };
    const nCore = NATAL_PLANET_CORE[asp.natalPlanet] || 'doğuştan gelen potansiyelinizi';
    const nArea = HOUSE_SHORT_THEMES[nHouse] || 'bu yaşam alanınız';

    let summary = '';
    switch (asp.type) {
      case 'Kavuşum':
        summary = `${capitalizeFirst(nArea)} konularında yoğun bir odak ve yeni başlangıç döngüsü açılıyor; ${nCore} doğrudan harekete geçiren ${signFlavor.adj} bir etki altındasınız.`;
        break;
      case 'Üçgen':
        summary = `${capitalizeFirst(nArea)} konularında ${signFlavor.style} çabasız bir ilerleme ve akış sağlanıyor; ${nCore} besleyen doğal bir destek devrede.`;
        break;
      case 'Sekstil':
        summary = `${capitalizeFirst(nArea)} alanında somut adımlarla büyüyen fırsatlar beliriyor; ${nCore} harekete geçirerek yeni kapılar açabilirsiniz.`;
        break;
      case 'Kare':
        summary = `${capitalizeFirst(nArea)} konularında ertelediğiniz kararları yapılandırmanızı isteyen bir eşiktesiniz; ${nCore} zorlayan bu süreci bilinçli adımlarla yönetin.`;
        break;
      case 'Karşıt':
        summary = `${capitalizeFirst(nArea)} ekseninde ilişkisel ve içsel sınırlarınızı dengelemeniz gerekiyor; ${nCore} aynalayan önemli bir farkındalık sürecindesiniz.`;
        break;
      default:
        summary = `${capitalizeFirst(nArea)} konularında ${nCore} tetikleyen ince bir ayar ve gözlem süreci yaşanıyor.`;
    }

    const badge = asp.orb <= 0.8 ? `★ Tam Pik (${asp.orb.toFixed(1)}°)` : `${asp.orb.toFixed(1)}° Orb`;

    return {
      transitPlanet: asp.transitPlanet,
      transitSign: tSign,
      transitDegree: tDeg,
      transitHouse: tHouse,
      natalPlanet: asp.natalPlanet,
      natalSign: nSign,
      natalDegree: nDeg,
      natalHouse: nHouse,
      aspectType: asp.type,
      orb: asp.orb,
      badge,
      isHarmonious,
      summary
    };
  };

  const allEnrichedAspects = validAspects.map(enrichAspect);
  const topAspects = allEnrichedAspects.slice(0, 3);

  // Odak Yaşam Alanları (En çok transit gezegen alan evler)
  const houseCounts: Record<number, string[]> = {};
  for (const tp of transitPlanets) {
    const h = tp.house || getHouseFromLongitude(tp.longitude, natalHouses);
    if (!houseCounts[h]) houseCounts[h] = [];
    houseCounts[h].push(tp.name);
  }

  const sortedHouses = Object.entries(houseCounts)
    .map(([hStr, pNames]) => ({
      house: parseInt(hStr, 10),
      planetNames: pNames,
      count: pNames.length
    }))
    .sort((a, b) => b.count - a.count);

  const focusHouses = sortedHouses.slice(0, 2).map(item => ({
    house: item.house,
    title: LIFE_AREA_NAMES[item.house] || HOUSE_SHORT_THEMES[item.house] || 'Yaşam Alanı',
    description: HOUSE_SHORT_THEMES[item.house] || 'bu yaşam alanınız',
    planetNames: item.planetNames
  }));

  // Barometre Puanları Hesaplama
  let mentalScore = 74;
  let emotionalScore = 70;
  let actionScore = 72;

  const tMoon = transitPlanets.find(p => p.name === 'Ay');
  const tMoonHouse = tMoon ? (tMoon.house || getHouseFromLongitude(tMoon.longitude, natalHouses)) : 1;

  if ([1, 5, 9].includes(tMoonHouse)) {
    actionScore += 12;
    mentalScore += 6;
  } else if ([4, 8, 12].includes(tMoonHouse)) {
    emotionalScore += 16;
    actionScore -= 4;
  } else if ([3, 6, 10].includes(tMoonHouse)) {
    mentalScore += 14;
    actionScore += 8;
  } else if ([2, 7, 11].includes(tMoonHouse)) {
    mentalScore += 8;
    emotionalScore += 8;
  }

  topAspects.forEach(asp => {
    if (asp.isHarmonious) {
      mentalScore += 5;
      actionScore += 4;
    } else {
      emotionalScore += 6;
      actionScore += 2;
    }
  });

  mentalScore = Math.min(95, Math.max(45, mentalScore));
  emotionalScore = Math.min(96, Math.max(48, emotionalScore));
  actionScore = Math.min(95, Math.max(46, actionScore));

  const mentalTone = mentalScore >= 80 ? 'Yüksek & Berrak' : mentalScore >= 65 ? 'Stratejik & Dengeli' : 'Dağınık / Dinlenme İhtiyacı';
  const emotionalTone = emotionalScore >= 80 ? 'Yoğun & Sezgisel' : emotionalScore >= 65 ? 'Dengeli & Dingin' : 'Hassas / Sınır Koruma';
  const actionTone = actionScore >= 80 ? 'Kararlı & Cesur' : actionScore >= 65 ? 'Ölçülü & İstikrarlı' : 'Temkinli / Gözlemde Kal';

  const peak = topAspects[0];
  const mainFocusTitle = focusHouses[0]?.title || 'Yaşam Alanlarınız';
  let headline = `${mainFocusTitle} Odağında Dengeli Akış`;
  let subHeadline = focusHouses.length > 0 
    ? `Ana Odak: ${focusHouses.map(h => `${h.title} (${h.description})`).join(' ve ')}`
    : 'Bütünsel Dönüşüm Süreci';

  if (peak) {
    const peakAreaTitle = LIFE_AREA_NAMES[peak.natalHouse] || mainFocusTitle;
    if (peak.isHarmonious) {
      headline = `${peakAreaTitle} Konularında Destekleyici & Akıcı İlerleme`;
    } else {
      headline = `${peakAreaTitle} Konularında Farkındalık & Yapılanma Zamanı`;
    }
  }

  let themeDescription = '';
  if (focusHouses.length > 0) {
    themeDescription = `Bugün haritanızda en yoğun hareketlilik doğrudan ${focusHouses.map(h => h.description).join(' ile ')} konularında toplanıyor. `;
  } else {
    themeDescription = `Bugün gökyüzü geçişleri yaşam alanlarınızın kilit noktalarını harekete geçiriyor. `;
  }

  if (peak) {
    themeDescription += `${peak.summary} `;
  }

  themeDescription += `Dış dünyadaki gelişmelere fevri tepkiler vermek yerine, kendi içsel merkezinizi koruyarak adımlarınızı bilinçli atmanız sürecin hediyelerini açığa çıkaracaktır.`;

  const opportunities: PersonalGuidanceItem[] = [];
  const cautions: PersonalGuidanceItem[] = [];

  const harmoniousAspects = allEnrichedAspects.filter(a => a.isHarmonious).slice(0, 3);
  const challengingAspects = allEnrichedAspects.filter(a => !a.isHarmonious).slice(0, 3);

  if (harmoniousAspects.length > 0) {
    harmoniousAspects.forEach(asp => {
      opportunities.push(buildDynamicAspectOpportunity(asp));
    });
  } else {
    opportunities.push({ text: 'Günün sakin enerjisi altında geçmiş planlarınızı gözden geçirmek ve içsel dinginliği güçlendirmek için elverişli bir zemin var.' });
  }

  if (challengingAspects.length > 0) {
    challengingAspects.forEach(asp => {
      cautions.push(buildDynamicAspectCaution(asp));
    });
  } else {
    cautions.push({ text: 'Aşırı rahatlığa kapılıp tamamlanması gereken sorumluluklarınızı ertelemekten kaçının.' });
  }

  const peakHouseTopics = peak ? (HOUSE_SHORT_THEMES[peak.natalHouse] || 'bu yaşam alanınız') : '';
  const capitalizedPeakTopics = peakHouseTopics ? peakHouseTopics.charAt(0).toUpperCase() + peakHouseTopics.slice(1) : '';
  const lifeAdvice = peak
    ? (peak.isHarmonious 
        ? `${capitalizedPeakTopics} konularında oluşan bereketli akışı cesaret ve şükranla karşılayın; ertelediğiniz adımları hayata geçirin.`
        : `${capitalizedPeakTopics} konularında beliren sürtüşmeleri bir kriz değil, sizi daha sağlam ve olgun kılan bir basamak olarak görün.`)
    : 'Haritanızdaki sakin akışı içsel dinlenme ve hedeflerinizi sadeleştirme fırsatı olarak değerlendirin.';

  return {
    headline,
    subHeadline,
    themeDescription,
    focusHouses,
    barometer: {
      mental: { score: mentalScore, label: `${mentalScore}%`, tone: mentalTone },
      emotional: { score: emotionalScore, label: `${emotionalScore}%`, tone: emotionalTone },
      action: { score: actionScore, label: `${actionScore}%`, tone: actionTone }
    },
    opportunities: opportunities.slice(0, 3),
    cautions: cautions.slice(0, 3),
    topAspects,
    lifeAdvice
  };
}
