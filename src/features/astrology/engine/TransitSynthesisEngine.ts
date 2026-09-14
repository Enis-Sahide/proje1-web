import { AstroPoint, TransitAspect, AstroCity } from './AstrologyConstants';
import { MAJOR_PLANET_SIGN_CUSTOM_INTERPRETATIONS } from './SkyAspectInterpretations';

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
  synthesisSummary: string;
  detailedAnalysis: string;
  actionAdvice: string;
  chakraLayer: string;
}

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

  // Synthesize the unified narrative
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

  // Detailed Analysis Synthesis
  let detailedAnalysis = `【Yaşam Alanı Etkisi: ${houseTitle}】\n` +
    `${pName}, astrolojide ${PLANET_NATURES[pName] || 'önemli enerjileri'} temsil eder. Bu gezegen sizin ${house}. evinizden geçerken; ${houseTheme} alanınızda köklü bir uyanış ve farkındalık yaratır.\n\n`;

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

  const actionAdvice = customInterp?.advice || 
    `Bu süreçte ${house}. evinizin temsil ettiği konularda aceleci olmadan, bilinçli ve yapıcı sınırlar çizerek hareket edin. Karşınıza çıkan durumları kriz değil, ruhsal olgunlaşma fırsatı olarak görün.`;

  const chakraLayer = customInterp?.chakra || PLANET_CHAKRAS[pName] || 'Kozmik Katman Entegrasyonu';

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
    synthesisSummary,
    detailedAnalysis,
    actionAdvice,
    chakraLayer
  };
}

export interface SectionBlock {
  title: string;
  content: string;
  type: 'phase' | 'theme' | 'collective' | 'advice' | 'retro' | 'house' | 'aspects' | 'general';
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
    if (lowerTitle.includes('yaşam alanı') || lowerTitle.includes('ev ') || lowerTitle.includes('ev:')) {
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
