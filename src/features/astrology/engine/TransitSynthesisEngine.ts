import { AstroPoint, TransitAspect, AstroCity } from './AstrologyConstants';
import { MAJOR_PLANET_SIGN_CUSTOM_INTERPRETATIONS } from './SkyAspectInterpretations';
import { getGateAndLine } from '@/utils/HumanDesignEngine';
import { GATE_TITLES } from './AstroHumanDesignSynthesis';

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

  // Find all active aspects made by this transit planet to natal planets
  const matchingAspects = allTransitAspects.filter(a => a.transitPlanet === pName);

  const aspectInfos: UnifiedAspectInfo[] = matchingAspects.map(asp => {
    const nPlanet = natalPlanets.find(p => p.name === asp.natalPlanet);
    const nHouse = nPlanet ? (nPlanet.house || getHouseFromLongitude(nPlanet.longitude, natalHouses)) : undefined;
    const isHarmonious = asp.type === 'Üçgen' || asp.type === 'Sekstil' || (asp.type === 'Kavuşum' && !['Satürn', 'Mars', 'Plüton'].includes(asp.transitPlanet));

    let summary = '';
    const nTheme = nHouse ? `${nHouse}. evinizdeki (${HOUSE_SHORT_THEMES[nHouse]})` : '';
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

  let synthesisSummary = `Transit ${pName}, ${sign} burcunda seyrederek haritanızın ${house}. evini (${houseTheme}) doğrudan tetikliyor. `;
  if (aspectInfos.length > 0) {
    const challenging = aspectInfos.filter(a => !a.isHarmonious);
    const harmonious = aspectInfos.filter(a => a.isHarmonious);
    
    if (challenging.length > 0 && harmonious.length > 0) {
      synthesisSummary += `Aynı anda haritanızdaki ${challenging.map(a => `${a.natalHouse ? `${a.natalHouse}. evdeki ` : ''}${a.natalPlanet} (${a.aspectType})`).join(', ')} ile yüzleşme hattı kurarken; ${harmonious.map(a => `${a.natalPlanet} (${a.aspectType})`).join(', ')} ile güçlü bir çıkış ve destek kapısı açıyor.`;
    } else if (challenging.length > 0) {
      synthesisSummary += `Bu süreçte özellikle ${challenging.map(a => `${a.natalHouse ? `${a.natalHouse}. evdeki ` : ''}${a.natalPlanet} (${a.aspectType})`).join(', ')} teması üzerinden hayatınızda önemli bir yüzleşme ve yapılandırma talep ediyor.`;
    } else {
      synthesisSummary += `Bu geçiş, ${harmonious.map(a => `${a.natalHouse ? `${a.natalHouse}. evdeki ` : ''}${a.natalPlanet} (${a.aspectType})`).join(', ')} ile uyumlanarak bu hayat alanında işlerinizi kolaylaştıran verimli bir akış sunuyor.`;
    }
  } else {
    synthesisSummary += `Şu an doğrudan majör bir natal gezegene açı yapmasa da, bu yaşam alanınızın arka planını sessiz ve derinden dönüştürmeye devam ediyor.`;
  }

  const actionAdvice = customInterp?.advice || 
    `Bu süreçte ${house}. evinizin temsil ettiği konularda aceleci olmadan, bilinçli ve yapıcı sınırlar çizerek hareket edin. Karşınıza çıkan durumları kriz değil, ruhsal olgunlaşma fırsatı olarak görün.`;

  const chakraLayer = customInterp?.chakra || PLANET_CHAKRAS[pName] || 'Kozmik Katman Entegrasyonu';

  // Detailed Analysis Synthesis:
  // 1. Öncelikli Anlam & Eylem (En Üst Bölüm)
  let detailedAnalysis = `【7Layers Yaşam Alanı Özeti】\n${humanNarrative}\n\n` +
    `【Bireysel Eylem & Dönüşüm Rehberliği】\n${actionAdvice}\n\n` +
    `【Metnin Oluşturulduğu Kaynaklar】\n` +
    `Bu analiz aşağıdaki astrolojik ve enerjetik katmanların sentezlenmesiyle oluşturulmuştur:\n\n` +
    `【Yaşam Alanı Etkisi: ${houseTitle}】\n` +
    `${pName}, astrolojide ${PLANET_NATURES[pName] || 'önemli enerjileri'} temsil eder. Bu geçiş sizin ${house}. evinizden geçerken; ${houseTheme} alanınızda köklü bir uyanış ve farkındalık yaratır.\n\n`;

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
      aspectInfos.map(a => `• ${a.aspectType} Natal ${a.natalPlanet}${a.natalHouse ? ` (${a.natalHouse}. Ev)` : ''} [Orb: ${a.orb.toFixed(1)}°]: ${a.summary}`).join('\n') + '\n\n';
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
