import type { NatalChartData, ZodiacSign } from './AstrologyConstants';
import { generateChart } from '@/utils/HumanDesignEngine';

export interface HistoricalEraResult {
  eraName: string;
  timeSpan: string;
  century: string;
  archetypeRole: string;
  geographyCulture: string;
  atmosphere: string;
  karmicImprint: string;
  soulMemoryKey: string;
}

export interface StarAlignment {
  starName: string;
  constellation: string;
  connectedPoint: string;
  orb: number;
  layer: 'Natal (Fiziksel)' | 'Drakonik (Ruh Haritası)' | 'Bilinçdışı Tasarım (Ruh Kökü)' | '3. Harita (Beriyah / Zihin)';
  frequencyBadge: string;
  isRoyalStar?: boolean;
}

export interface RoyalStarActivation {
  starName: string;
  layer: string;
  pointName: string;
  orb: number;
}

export interface CosmicOriginResult {
  isStarseed: boolean;
  starName: string;
  constellation: string;
  connectedPoint: string;
  orb: number | null;
  soulMission: string;
  cosmicGift: string;
  earthlyChallenge: string;
  frequencyBadge: string;
  // Hibrit ve Çoklu Yıldız Alanları
  isHybrid?: boolean;
  hybridTitle?: string;
  secondaryStars?: StarAlignment[];
  allAlignments?: StarAlignment[];
  royalStarsActive?: RoyalStarActivation[];
}

interface FixedStarDef {
  name: string;
  longitude: number; // 0-360 deg
  constellation: string;
  frequencyBadge: string;
  mission: string;
  gift: string;
  challenge: string;
}

// J2000 Epoch Sabit Yıldız ve Galaktik Merkez Koordinatları (0-360)
const GALACTIC_FIXED_STARS: FixedStarDef[] = [
  {
    name: 'Sirius (Alfa Canis Majoris)',
    longitude: 104.08, // 14°05' Yengeç
    constellation: 'Büyük Köpek (Canis Major)',
    frequencyBadge: 'Sirius (Mavi Işık Meclisi)',
    mission: 'Atlantis ve Antik Mısır tapınaklarına yüksek bilgelik getiren kadim ruhsal inisiye ve ilahi şifa elçiliği.',
    gift: 'Derin telepatik sezgi, auraları ve frekansları doğrudan hissetme, hücresel şifa yeteneği.',
    challenge: 'Dünyadaki duygusal kaos ve kaba frekanslar karşısında "buraya ait değilim, evimi özledim" yabancılık hissi.'
  },
  {
    name: 'Pleiades / Alcyone (Eta Tauri)',
    longitude: 59.99, // 29°59' Boğa
    constellation: 'Boğa / Ülker (Yedi Kızkardeş)',
    frequencyBadge: 'Pleiades (Yedi Kızkardeş / Ülker)',
    mission: '5. Boyut Kalp Çakrası bilincini yeryüzüne tohumlamak; koşulsuz sevgi ve yaratıcı ışığı yaymak.',
    gift: 'Yüksek empati, müzik, şiir, doğa ve hayvanlarla kelimesiz telepatik bağ kurabilme kabiliyeti.',
    challenge: 'Dünyadaki hiyerarşi, yalanlar, kabalık ve acımasız rekabet karşısında aşırı kırılganlık ve geri çekilme.'
  },
  {
    name: 'Arcturus (Alfa Boötis)',
    longitude: 204.24, // 24°14' Terazi
    constellation: 'Çoban (Boötes)',
    frequencyBadge: 'Arcturus (5. Boyut Bilinç Mimarisi)',
    mission: 'Geometrik şifa, ileri teknolojik zihin, evrensel adalet ve ilkel dünyevi sistemleri dönüştürme görevi.',
    gift: 'Karmaşık krizleri anında geometrik bir netlikle çözme, yüksek stratejik akıl ve sarsılmaz hakkaniyet.',
    challenge: 'Dünyanın hantal bürokrasisi, ilkel kuralları ve yavaşlığı karşısında zihinsel sabırsızlık ve yalnızlık.'
  },
  {
    name: 'Spica (Alfa Virginis)',
    longitude: 203.83, // 23°50' Terazi
    constellation: 'Başak (Virgo)',
    frequencyBadge: 'Spica (Kozmik Zarafet & İlahi Işık)',
    mission: 'Yeryüzüne ilahi uyum, yüksek estetik, bilgelik ve saf kristal ışık frekansını demirleme görevi.',
    gift: 'Kusursuz estetik zarafet, barışçıl diplomasi, ruhsal koruma ve yüksek sanatsal deha.',
    challenge: 'Kaba dünyevi çekişmelerden hızla tükenme, mükemmeliyetçilik sancısı.'
  },
  {
    name: 'Andromeda / Mirach (Beta Andromedae)',
    longitude: 44.40, // 14°24' Boğa
    constellation: 'Andromeda Galaksisi',
    frequencyBadge: 'Andromeda (Kozmik Özgürlük Gezgini)',
    mission: 'Kozmik bağımsızlık, boyut gezginliği ve otoriter hapishaneleri/dogmaları kırma elçiliği.',
    gift: 'Sınırlanamaz özgür irade, baskılara asla boyun eğmeme, vizyoner öncülük.',
    challenge: 'Kapalı mekanlar, katı rutinler ve dar görüşlü kurallar karşısında klostrofobi ve isyan refleksi.'
  },
  {
    name: 'Andromeda / Alpheratz (Alfa Andromedae)',
    longitude: 14.30, // 14°18' Koç
    constellation: 'Andromeda / Pegasus',
    frequencyBadge: 'Andromeda (Işık Savaşçısı & Gezgin)',
    mission: 'Kozmik zincirleri kırma, kitleleri özgürleştirme ve yeni bilinç kapılarını açma misyonu.',
    gift: 'Hızlı idrak, sınır tanımaz cesaret ve kadersel engelleri bir sıçrayışta aşabilme gücü.',
    challenge: 'Geleneksel dünyevi sınırlara ve yavaş insanlara tahammülsüzlük.'
  },
  {
    name: 'Orion / Rigel (Beta Orionis)',
    longitude: 76.83, // 16°50' İkizler
    constellation: 'Orion (Avcı)',
    frequencyBadge: 'Orion (Kadim Bilgelik Savaşçısı)',
    mission: 'Galaktik Işık ve Karanlık savaşlarından geçmiş, bilgeliğe ve kalp-akıl dengesine evrilen kıdemli ruh.',
    gift: 'Muazzam içsel direnç, hakikati her ne pahasına olursa olsun savunma, stratejik cesaret.',
    challenge: 'Her an bir savaş veya ihanet çıkacakmış gibi gardını düşürememe, insanlara tam güvenememe.'
  },
  {
    name: 'Orion / Betelgeuse (Alfa Orionis)',
    longitude: 88.75, // 28°45' İkizler
    constellation: 'Orion (Avcı)',
    frequencyBadge: 'Betelgeuse (Süpernova Kalp Savaşçısı)',
    mission: 'Kozmik dönüşüm; eskiyen galaktik kalıpları yıkıp yerine yüksek bilinç ışığını getirme.',
    gift: 'Devasa enerjetik çekim gücü, krizleri aşma kuvveti ve ilahi adanmışlık.',
    challenge: 'Ruhsal tükenmişlik hissi ve devasa sorumlulukların ağırlığı altında ezilme.'
  },
  {
    name: 'Orion / Bellatrix (Gamma Orionis)',
    longitude: 81.10, // 21°06' İkizler
    constellation: 'Orion (Avcı)',
    frequencyBadge: 'Bellatrix (Orion Savaşçı Elçisi)',
    mission: 'Galaktik adaleti koruma, cesur inisiyasyonlar ve stratejik zihin gücünü yeryüzüne aktarma.',
    gift: 'Korkusuz liderlik, zorlu engeller karşısında anında stratejik çözüm üretme ve yüksek irade.',
    challenge: 'Aşırı sertlik, duyguları bastırma ve empati kurmakta zorlanma riski.'
  },
  {
    name: 'Vega (Alfa Lyrae)',
    longitude: 285.32, // 15°19' Oğlak
    constellation: 'Lira (Çalgı)',
    frequencyBadge: 'Vega (Lira Galaktik Tohumu)',
    mission: 'Evrenin ilk saf humanoid tohumlarından; ilahi ses, müzik ve frekans simyacılığı.',
    gift: 'Sözcüklerle ve ses tonuyla aura arındırma, sanatsal deha ve büyüleyici zarafet.',
    challenge: 'Dünyanın kakofonisi ve estetik yoksunluğu karşısında aşırı duyusal yorgunluk.'
  },
  {
    name: 'Canopus (Alfa Carinae)',
    longitude: 104.97, // 14°58' Yengeç
    constellation: 'Carina (Gemi Omurgası)',
    frequencyBadge: 'Canopus (Büyük Kozmik Seyyah)',
    mission: 'Ruhlann galaksiler arası yolculuklarında yön bulmalarını sağlayan yüksek kozmik rehberlik.',
    gift: 'Doğal yön bulma yeteneği, derin içsel pusula, karmaşık yollardan selametle çıkma.',
    challenge: 'Dünyada tek bir yere veya kişiye kök salmakta zorlanma, ebedi göçmenlik hissi.'
  },
  {
    name: 'Galaktik Merkez (Galactic Center)',
    longitude: 267.05, // 27°03' Yay
    constellation: 'Samanyolu Galaktik Çekirdeği',
    frequencyBadge: 'Galaktik Merkez (Kozmik Elçi)',
    mission: 'Doğrudan Samanyolu çekirdeğinden bilgi indiren ve kitlelerin bilincini uyandıran Kozmik Elçilik.',
    gift: 'Yüksek kanallık, bilgiyi kaynaktan doğrudan "download" etme ve kitleleri uyandırma aurası.',
    challenge: 'Dünyanın dar kalıplarına sığamama, küçük dünyevi hedeflerle asla tatmin olamama.'
  },
  {
    name: 'Regulus (Alfa Leonis)',
    longitude: 149.83, // 29°50' Aslan
    constellation: 'Aslan (Kuzey Kraliyet Yıldızı - Başmelek Raphaël)',
    frequencyBadge: 'Regulus (Kuzey Kraliyet Yıldızı)',
    mission: 'Kozmik liderlik; intikam ve kibirden arınarak onur ve adaletle rehberlik etme inisiyasyonu.',
    gift: 'Doğal manyetik karizma, kitleleri peşinden sürükleme kudreti ve soylu cesaret.',
    challenge: 'Güç zehirlenmesi, intikam dürtüsü ve egonun tuzağına düşme riski.'
  },
  {
    name: 'Antares (Alfa Scorpii)',
    longitude: 249.77, // 9°46' Yay
    constellation: 'Akrep (Batı Kraliyet Yıldızı - Başmelek Uriel)',
    frequencyBadge: 'Antares (Batı Kraliyet Yıldızı)',
    mission: 'Ölüm ve yeniden doğum simyacılığı; korkusuzca karanlığın içine bakıp ışığı çıkarma.',
    gift: 'Derin okült algı, krizleri güce dönüştürme ve ruhsal koruma kalkanı.',
    challenge: 'Aşırı şüphecilik, takıntılar ve intikam arzusuyla enerjiyi tüketme.'
  },
  {
    name: 'Aldebaran (Alfa Tauri)',
    longitude: 69.78, // 9°47' İkizler
    constellation: 'Boğa (Doğu Kraliyet Yıldızı - Başmelek Mikâil)',
    frequencyBadge: 'Aldebaran (Doğu Kraliyet Yıldızı)',
    mission: 'Sarsılmaz ahlak ve hakikat elçiliği; zihinsel berraklığı dünyaya mühürleme.',
    gift: 'Büyüleyici söz kudreti, dürüstlük ve hakikati en saf haliyle dile getirme cesareti.',
    challenge: 'En ufak bir taviz veya yalan durumunda kozmik sistemin kişiyi anında sınavlara çekmesi.'
  },
  {
    name: 'Fomalhaut (Alfa Piscis Austrini)',
    longitude: 333.87, // 3°52' Balık
    constellation: 'Güney Balığı (Güney Kraliyet Yıldızı - Başmelek Cebrail)',
    frequencyBadge: 'Fomalhaut (Güney Kraliyet Yıldızı)',
    mission: 'Mistik vizyonlar, şiirsel ve sanatsal ilham; ruhsal alemlerle dünya arasında köprü olma.',
    gift: 'Rüyalarda geleceği görme, büyüleyici sanatsal ilham ve saf mistik cazibe.',
    challenge: 'Dünyevi pratik gerçeklikten kopma, kurban psikolojisine kayma ve hayal kırıklıkları.'
  }
];

// Boylam farkı (0-180 derece)
function angleDifference(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * 1. Galaktik Ruh Kökeni, Çoklu Sabit Yıldız & Melez (Hibrit Starseed) Taraması
 * - 1. Katman: Drakonik Harita (2. Harita / Ruhun Enkarnasyon Hafızası)
 * - 2. Katman: Bilinçdışı Tasarım (Human Design 88° Güneş Kayması / Ruh Kökü)
 * - 3. Katman: Natal (Fiziksel Düzlem / Enkarnasyon Aracı)
 * - 4. Katman: 3. Harita (Beriyah / 9. Harmonik / Ruhun Dharması & Yaratım)
 */
export function calculateCosmicOrigin(
  natalChart: NatalChartData,
  birthDate?: Date | null,
  beriyahChart?: NatalChartData | null,
  draconicChart?: NatalChartData | null
): CosmicOriginResult {
  interface TestPoint {
    name: string;
    longitude: number;
    weight: number;
    maxOrb: number;
    layer: 'Natal (Fiziksel)' | 'Drakonik (Ruh Haritası)' | 'Bilinçdışı Tasarım (Ruh Kökü)' | '3. Harita (Beriyah / Zihin)';
  }

  const pointsToTest: TestPoint[] = [];

  // ==========================================
  // KATMAN 1: DRAKONİK HARİTA (2. Harita / Ruhun Kozmik Hafızası)
  // ==========================================
  if (draconicChart && draconicChart.planets) {
    draconicChart.planets.forEach(p => {
      const isLum = ['Güneş', 'Ay', 'Kuzey Ay Düğümü', 'Lilith'].includes(p.name);
      pointsToTest.push({
        name: `Drakonik ${p.name}`,
        longitude: p.longitude,
        weight: isLum ? 3.3 : 2.5,
        maxOrb: isLum ? 2.2 : 1.85,
        layer: 'Drakonik (Ruh Haritası)'
      });
    });
    if (draconicChart.houses && draconicChart.houses.length > 0) {
      const dAsc = draconicChart.houses.find(h => h.house === 1);
      if (dAsc) pointsToTest.push({ name: 'Drakonik Yükselen (ASC)', longitude: dAsc.longitude, weight: 3.2, maxOrb: 2.2, layer: 'Drakonik (Ruh Haritası)' });
      const dMc = draconicChart.houses.find(h => h.house === 10);
      if (dMc) pointsToTest.push({ name: 'Drakonik Tepe Noktası (MC)', longitude: dMc.longitude, weight: 2.8, maxOrb: 2.0, layer: 'Drakonik (Ruh Haritası)' });
    }
  }

  // ==========================================
  // KATMAN 2: BİLİNÇDIŞI TASARIM (Human Design 88° Sun Shift / Ruh Kökü)
  // ==========================================
  if (birthDate && !isNaN(birthDate.getTime())) {
    try {
      const hdChart = generateChart(birthDate);
      if (hdChart && hdChart.unconscious) {
        const trMap: Record<string, string> = {
          'Sun': 'Tasarım Güneşi',
          'Earth': 'Tasarım Dünyası',
          'Moon': 'Tasarım Ayı',
          'NorthNode': 'Tasarım KAD',
          'SouthNode': 'Tasarım GAD',
          'Mercury': 'Tasarım Merkürü',
          'Venus': 'Tasarım Venüsü',
          'Mars': 'Tasarım Marsı',
          'Jupiter': 'Tasarım Jüpiteri',
          'Saturn': 'Tasarım Satürnü',
          'Uranus': 'Tasarım Uranüsü',
          'Neptune': 'Tasarım Neptünü',
          'Pluto': 'Tasarım Plütonu'
        };

        hdChart.unconscious.forEach(p => {
          const isLum = ['Sun', 'Earth', 'Moon', 'NorthNode', 'SouthNode'].includes(p.planet);
          pointsToTest.push({
            name: trMap[p.planet] || `Tasarım ${p.planet}`,
            longitude: p.longitude,
            weight: isLum ? 2.9 : 2.1,
            maxOrb: isLum ? 2.0 : 1.75,
            layer: 'Bilinçdışı Tasarım (Ruh Kökü)'
          });
        });

        const natalLilith = natalChart.planets.find(p => p.name === 'Lilith');
        if (natalLilith) {
          pointsToTest.push({
            name: 'Tasarım Lilith',
            longitude: ((natalLilith.longitude - 9.77) % 360 + 360) % 360,
            weight: 2.4,
            maxOrb: 2.0,
            layer: 'Bilinçdışı Tasarım (Ruh Kökü)'
          });
        }
      }
    } catch (e) {
      console.warn('Bilinçdışı tasarım haritası hesaplanamadı:', e);
    }
  }

  // ==========================================
  // KATMAN 3: NATAL HARİTA (Fiziksel Beden & Enkarnasyon Aracı)
  // ==========================================
  const kad = natalChart.planets.find(p => p.name === 'Kuzey Ay Düğümü');
  if (kad) {
    pointsToTest.push({ name: 'Kuzey Ay Düğümü (KAD)', longitude: kad.longitude, weight: 3, maxOrb: 2.2, layer: 'Natal (Fiziksel)' });
    const gadLon = (kad.longitude + 180) % 360;
    pointsToTest.push({ name: 'Güney Ay Düğümü (GAD)', longitude: gadLon, weight: 3, maxOrb: 2.2, layer: 'Natal (Fiziksel)' });
  }

  const sun = natalChart.planets.find(p => p.name === 'Güneş');
  if (sun) pointsToTest.push({ name: 'Güneş', longitude: sun.longitude, weight: 3, maxOrb: 2.2, layer: 'Natal (Fiziksel)' });

  const moon = natalChart.planets.find(p => p.name === 'Ay');
  if (moon) pointsToTest.push({ name: 'Ay', longitude: moon.longitude, weight: 3, maxOrb: 2.2, layer: 'Natal (Fiziksel)' });

  if (natalChart.houses && natalChart.houses.length > 0) {
    const ascHouse = natalChart.houses.find(h => h.house === 1);
    if (ascHouse) pointsToTest.push({ name: 'Yükselen (ASC)', longitude: ascHouse.longitude, weight: 3, maxOrb: 2.2, layer: 'Natal (Fiziksel)' });

    const mcHouse = natalChart.houses.find(h => h.house === 10);
    if (mcHouse) pointsToTest.push({ name: 'Tepe Noktası (MC)', longitude: mcHouse.longitude, weight: 2.5, maxOrb: 2.0, layer: 'Natal (Fiziksel)' });
  }

  const lilith = natalChart.planets.find(p => p.name === 'Lilith');
  if (lilith) pointsToTest.push({ name: 'Lilith', longitude: lilith.longitude, weight: 2.5, maxOrb: 2.0, layer: 'Natal (Fiziksel)' });

  const personalPlanets = ['Merkür', 'Venüs', 'Mars', 'Kiron'];
  natalChart.planets.forEach(p => {
    if (personalPlanets.includes(p.name)) {
      pointsToTest.push({ name: p.name, longitude: p.longitude, weight: 2.2, maxOrb: 1.85, layer: 'Natal (Fiziksel)' });
    }
  });

  const outerPlanets = ['Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton'];
  natalChart.planets.forEach(p => {
    if (outerPlanets.includes(p.name)) {
      pointsToTest.push({ name: p.name, longitude: p.longitude, weight: 1.5, maxOrb: 1.75, layer: 'Natal (Fiziksel)' });
    }
  });

  // ==========================================
  // KATMAN 4: 3. HARİTA (Beriyah / 9. Harmonik / Navamsa Ruh Dharması)
  // ==========================================
  if (beriyahChart && beriyahChart.planets) {
    beriyahChart.planets.forEach(p => {
      const isKey = ['Güneş', 'Ay', 'Venüs', 'Merkür', 'Mars', 'Lilith'].includes(p.name);
      pointsToTest.push({
        name: `3. Harita ${p.name}`,
        longitude: p.longitude,
        weight: isKey ? 2.3 : 1.6,
        maxOrb: isKey ? 3.0 : 2.2,
        layer: '3. Harita (Beriyah / Zihin)'
      });
    });
  }

  // ==========================================
  // SABİT YILDIZ & KRALİYET YILDIZI TARAMASI
  // ==========================================
  interface MatchItem {
    star: FixedStarDef;
    point: TestPoint;
    orb: number;
    score: number;
    family: string;
    isRoyal: boolean;
  }

  const getStarFamily = (starName: string): string => {
    if (starName.includes('Pleiades')) return 'Pleiades';
    if (starName.includes('Orion') || starName.includes('Rigel') || starName.includes('Betelgeuse') || starName.includes('Bellatrix')) return 'Orion';
    if (starName.includes('Sirius') || starName.includes('Canopus')) return 'Sirius';
    if (starName.includes('Fomalhaut')) return 'Fomalhaut';
    if (starName.includes('Aldebaran')) return 'Aldebaran';
    if (starName.includes('Antares')) return 'Antares';
    if (starName.includes('Regulus')) return 'Regulus';
    if (starName.includes('Arcturus') || starName.includes('Spica')) return 'Arcturus';
    if (starName.includes('Andromeda')) return 'Andromeda';
    if (starName.includes('Vega')) return 'Vega';
    if (starName.includes('Galaktik Merkez')) return 'Galaktik Merkez';
    return starName.split(' ')[0];
  };

  const CORE_STARSEED_FAMILIES = new Set(['Pleiades', 'Orion', 'Sirius', 'Arcturus', 'Andromeda', 'Vega']);
  const ROYAL_STARS = new Set(['Regulus', 'Antares', 'Aldebaran', 'Fomalhaut']);
  const allMatches: MatchItem[] = [];
  const royalActivations: RoyalStarActivation[] = [];

  for (const star of GALACTIC_FIXED_STARS) {
    const isRoyal = Array.from(ROYAL_STARS).some(rs => star.name.includes(rs));
    const family = getStarFamily(star.name);

    for (const pt of pointsToTest) {
      const diff = angleDifference(star.longitude, pt.longitude);
      if (diff <= pt.maxOrb) {
        const roundedOrb = Math.round(diff * 100) / 100;
        const layerBonus = pt.layer.includes('Drakonik') ? 3.0 : pt.layer.includes('Bilinçdışı') ? 2.0 : 0;
        const score = pt.weight * 10 - diff * 2.8 + layerBonus;

        allMatches.push({
          star,
          point: pt,
          orb: roundedOrb,
          score,
          family,
          isRoyal
        });

        if (isRoyal) {
          royalActivations.push({
            starName: star.name.split(' ')[0],
            layer: pt.layer,
            pointName: pt.name,
            orb: roundedOrb
          });
        }
      }
    }
  }

  // Skorlara göre sırala
  allMatches.sort((a, b) => b.score - a.score);

  if (allMatches.length > 0) {
    // Starseed ailelerini skorlarına göre topla
    const starseedFamilyMap = new Map<string, { family: string; maxScore: number; bestMatch: MatchItem }>();
    allMatches.forEach(m => {
      if (CORE_STARSEED_FAMILIES.has(m.family)) {
        const existing = starseedFamilyMap.get(m.family);
        if (!existing || m.score > existing.maxScore) {
          starseedFamilyMap.set(m.family, { family: m.family, maxScore: m.score, bestMatch: m });
        }
      }
    });

    const sortedStarseedFamilies = Array.from(starseedFamilyMap.values()).sort((a, b) => b.maxScore - a.maxScore);

    let bestMatch = allMatches[0];
    let isStarseed = false;
    let isHybrid = false;
    let hybridTitle = bestMatch.star.name;
    let frequencyBadge = bestMatch.star.frequencyBadge;
    let soulMission = bestMatch.star.mission;
    let cosmicGift = bestMatch.star.gift;
    let earthlyChallenge = bestMatch.star.challenge;

    // A. İki veya daha fazla Starseed ırkı varsa -> Doğal ve dinamik Galaktik Melez
    if (sortedStarseedFamilies.length >= 2) {
      isStarseed = true;
      isHybrid = true;
      bestMatch = sortedStarseedFamilies[0].bestMatch;
      const f1 = sortedStarseedFamilies[0].family;
      const f2 = sortedStarseedFamilies[1].family;
      hybridTitle = `${f1} & ${f2} Galaktik Melezi`;

      // Varsa 3. Starseed veya portal rezonansı
      const resonantAdditions: string[] = [];
      if (sortedStarseedFamilies.length >= 3) resonantAdditions.push(sortedStarseedFamilies[2].family);
      if (allMatches.some(m => m.family === 'Galaktik Merkez')) resonantAdditions.push('Galaktik Merkez');
      if (royalActivations.length > 0) resonantAdditions.push(`${royalActivations[0].starName} Işığı`);

      if (resonantAdditions.length > 0) {
        frequencyBadge = `${hybridTitle} (${resonantAdditions.slice(0, 2).join(' & ')} Rezonanslı)`;
      } else {
        frequencyBadge = `${hybridTitle} (Çok Boyutlu Işık Tohumu)`;
      }

      soulMission = `${bestMatch.star.mission} Aynı zamanda ruhunuz ${f2} frekansıyla da melezlenmiş olup, iki galaktik bilinç arasında evrensel bir köprü kurma ve yüksek bilgiyi yeryüzüne sentezleme vazifesi taşımaktadır.`;
      cosmicGift = `${bestMatch.star.gift} Melez galaktik kökeniniz sayesinde zıt boyutları anında kavrama, hem sezgisel hem de stratejik bilgiyi aynı anda işleyebilme dehanız vardır.`;
      earthlyChallenge = `${bestMatch.star.challenge} Farklı yıldız frekanslarını tek bir biyolojik bedende taşımanın getirdiği içsel dalgalanma ve dünyaya ait hissedememe sancısı.`;
    }
    // B. Tek bir Starseed ırkı varsa -> Saf Starseed (Melez Değil!)
    else if (sortedStarseedFamilies.length === 1) {
      isStarseed = true;
      isHybrid = false;
      bestMatch = sortedStarseedFamilies[0].bestMatch;
      hybridTitle = `${sortedStarseedFamilies[0].family} Yıldız Tohumu (Starseed)`;
      frequencyBadge = `${sortedStarseedFamilies[0].family} Tohumu`;
    }
    // C. Hiç Starseed ırkı yok ama Kraliyet Yıldızı varsa -> Kraliyet Muhafızı
    else if (royalActivations.length > 0) {
      isStarseed = false;
      isHybrid = false;
      const topRoyal = allMatches.find(m => ROYAL_STARS.has(m.family))!;
      bestMatch = topRoyal;
      hybridTitle = `${topRoyal.family} Muhafızı (Kraliyet Işığı)`;
      frequencyBadge = `${topRoyal.family} (Kraliyet Bekçisi)`;
    }

    // İkincil yıldızları topla (en yüksek puanlı diğer yıldızlar)
    const secondaryMatches = allMatches.filter(m => m.star.name !== bestMatch.star.name);
    const uniqueSecondaryList: StarAlignment[] = [];
    const seenStars = new Set<string>([bestMatch.star.name]);

    for (const m of secondaryMatches) {
      if (!seenStars.has(m.star.name)) {
        seenStars.add(m.star.name);
        uniqueSecondaryList.push({
          starName: m.star.name,
          constellation: m.star.constellation,
          connectedPoint: `${m.point.name} (${m.point.layer}) ile ${m.orb}° orb`,
          orb: m.orb,
          layer: m.point.layer,
          frequencyBadge: m.star.frequencyBadge,
          isRoyalStar: m.isRoyal
        });
      }
      if (uniqueSecondaryList.length >= 5) break;
    }

    const allAlignmentsList: StarAlignment[] = allMatches.slice(0, 10).map(m => ({
      starName: m.star.name,
      constellation: m.star.constellation,
      connectedPoint: `${m.point.name} (${m.point.layer}) ile ${m.orb}° orb`,
      orb: m.orb,
      layer: m.point.layer,
      frequencyBadge: m.star.frequencyBadge,
      isRoyalStar: m.isRoyal
    }));

    return {
      isStarseed,
      starName: bestMatch.star.name,
      constellation: bestMatch.star.constellation,
      connectedPoint: `${bestMatch.point.name} (${bestMatch.point.layer}) ile Kavuşum (${bestMatch.orb}° orb)`,
      orb: bestMatch.orb,
      soulMission,
      cosmicGift,
      earthlyChallenge,
      frequencyBadge,
      isHybrid,
      hybridTitle,
      secondaryStars: uniqueSecondaryList,
      allAlignments: allAlignmentsList,
      royalStarsActive: royalActivations
    };
  }

  // D. Eğer doğrudan hiçbir sabit yıldız teması yoksa: Asil ve bilge Gaia Muhafızı kimliği
  return {
    isStarseed: false,
    starName: 'Kadim Dünya Ruhu (Earth Native - Gaia Muhafızı)',
    constellation: 'Terra / Gaia (Dünya Gezegeni)',
    connectedPoint: 'Dünya Biyosferik Kökü & 4 Element Hizası',
    orb: null,
    soulMission: 'Dünya gezegeninin elemental hafızasında ustalaşmak; madde ile mana arasındaki kutsal köprüyü inşa etmek ve yeryüzüne sağlam kök salmak.',
    cosmicGift: 'Kuvvetli pratik sağduyu, dünyevi krizlerde sarsılmaz dirayet, doğanın mevsimleriyle doğrudan uyumlanma ve yaşamı güvenle inşa etme kudreti.',
    earthlyChallenge: 'Madde dünyasının ağırlığına kapılıp ruhsal kanatlarını unutma riski; dünyevi kaygıları aşarak ilahi güveni koruma sınavı.',
    frequencyBadge: 'Kadim Dünya Muhafızı (Gaia)',
    isHybrid: false
  };
}

const SIGN_TO_RULERS: Record<ZodiacSign, string[]> = {
  'Koç': ['Mars'],
  'Boğa': ['Venüs'],
  'İkizler': ['Merkür'],
  'Yengeç': ['Ay'],
  'Aslan': ['Güneş'],
  'Başak': ['Merkür'],
  'Terazi': ['Venüs'],
  'Akrep': ['Plüton', 'Mars'],
  'Yay': ['Jüpiter'],
  'Oğlak': ['Satürn'],
  'Kova': ['Uranüs', 'Satürn'],
  'Balık': ['Neptün', 'Jüpiter']
};

interface HistoricalEraDef {
  id: string;
  result: HistoricalEraResult;
  primarySigns: ZodiacSign[];
  secondarySigns: ZodiacSign[];
  primaryHouses: number[];
  secondaryHouses: number[];
  rulerPlanets: string[];
  bonusPlanet?: { name: string; house: number };
}

/**
 * 2. Tarihsel Zaman Tüneli & Geçmiş Yaşam Dünya Çağı
 * GAD Burcu, Evi, Yöneticisi, 12. Ev ve Gezegen dinamiklerinden çok faktörlü astrolojik puanlamayla sentezlenir.
 */
export function calculateHistoricalEra(
  natalChart: NatalChartData,
  gadSign: ZodiacSign,
  gadHouse: number
): HistoricalEraResult {
  const gadRulers = SIGN_TO_RULERS[gadSign] || ['Mars'];
  const h12Sign = natalChart.houses && natalChart.houses.length >= 12 ? natalChart.houses[11]?.sign : null;

  const planetHouseMap: Record<string, number> = {};
  if (natalChart.planets) {
    natalChart.planets.forEach(p => {
      planetHouseMap[p.name] = p.house;
    });
  }

  const ERAS: HistoricalEraDef[] = [
    {
      id: 'veba',
      primarySigns: ['Akrep'],
      secondarySigns: ['Başak', 'Balık'],
      primaryHouses: [8],
      secondaryHouses: [6, 12],
      rulerPlanets: ['Plüton', 'Mars'],
      bonusPlanet: { name: 'Plüton', house: 8 },
      result: {
        eraName: 'Geç Orta Çağ, Büyük Veba & Engizisyon Dönemi',
        timeSpan: 'M.S. 1340 – 1490 civarı',
        century: '14. - 15. Yüzyıl',
        archetypeRole: 'Bitki Şifacısı, Lonca Hekimi, Manastır Ebesi veya Gizli Bilgi Koruyucusu',
        geographyCulture: 'Orta ve Batı Avrupa (İngiltere, Fransa, Ren Vadisi veya İberya)',
        atmosphere: 'Kara Veba salgınının yarattığı kitlesel kayıplar, kilisenin sert denetimi ve cadı avlarının gölgesinde hayatta kalma mücadelesi.',
        karmicImprint: 'İftiraya uğrama ve yeteneklerini gizleme korkusu; aşırı hijyen/sağlık anksiyetesi ve derin bir hayatta kalma refleksi.',
        soulMemoryKey: 'Geçmişte insanlara şifa verirken cezalandırıldığınız için bu yaşamda ruhsal gücünüzü ortaya koymaktan çekinebilirsiniz.'
      }
    },
    {
      id: 'ronesans',
      primarySigns: ['Terazi'],
      secondarySigns: ['Boğa', 'İkizler'],
      primaryHouses: [5, 7],
      secondaryHouses: [3, 11],
      rulerPlanets: ['Venüs', 'Merkür'],
      bonusPlanet: { name: 'Venüs', house: 5 },
      result: {
        eraName: 'Rönesans & Büyük Aydınlanma Çağı',
        timeSpan: 'M.S. 1500 – 1650 civarı',
        century: '16. - 17. Yüzyıl',
        archetypeRole: 'Rönesans Ressamı/Heykeltıraşı, Hümanist Düşünür, Matbaacı veya İtalyan Tüccarı',
        geographyCulture: 'İtalya (Floransa, Venedik), Flandre veya Erken Aydınlanma Avrupası',
        atmosphere: 'Sanatın, anatomik ve coğrafi keşiflerin, klasik antik bilgeliğin yeniden doğduğu büyüleyici estetik uyanış.',
        karmicImprint: 'Estetik mükemmeliyetçilik, zarafet tutkusu ve kaba ortamlara karşı derin tahammülsüzlük.',
        soulMemoryKey: 'Eserleriniz veya fikirlerinizle dünyayı güzelleştirdiniz; bu hayatta da estetik ve adaleti ruhunuzun gıdası sayarsınız.'
      }
    },
    {
      id: 'roma',
      primarySigns: ['Koç'],
      secondarySigns: ['Oğlak', 'Aslan'],
      primaryHouses: [10],
      secondaryHouses: [1, 6],
      rulerPlanets: ['Mars', 'Satürn'],
      bonusPlanet: { name: 'Mars', house: 10 },
      result: {
        eraName: 'Antik Roma İmparatorluğu & Lejyonlar Çağı',
        timeSpan: 'M.Ö. 100 – M.S. 330 civarı',
        century: 'M.Ö. 1. yy - M.S. 4. yy',
        archetypeRole: 'Roma Lejyon Komutanı, Senatör, Taş/Yol Mimarı veya Hukukçu',
        geographyCulture: 'Akdeniz Havzası, İtalya, Galya veya Küçük Asya (Anadolu Roma Eyaletleri)',
        atmosphere: 'Demir disiplin, imparatorluk inşası, askeri nizam ve hukukun katı kurallarıyla örülü bir fetih dünyası.',
        karmicImprint: 'Görev bilinci uğruna duyguları bastırma, ihanete uğrama ihtiyatı ve her durumu askeri bir strateji gibi yönetme eğilimi.',
        soulMemoryKey: 'Büyük sorumluluklar ve otorite taşıdınız; bu yaşamda yumuşamayı, teslimiyeti ve kalbinizi açmayı öğreniyorsunuz.'
      }
    },
    {
      id: 'misir',
      primarySigns: ['Aslan'],
      secondarySigns: ['Boğa', 'Akrep'],
      primaryHouses: [9],
      secondaryHouses: [1, 5, 8],
      rulerPlanets: ['Güneş', 'Plüton'],
      bonusPlanet: { name: 'Güneş', house: 9 },
      result: {
        eraName: 'Antik Mısır & Nil Tapınakları Çağı',
        timeSpan: 'M.Ö. 2000 – 1200 civarı',
        century: 'M.Ö. 2. Binyıl',
        archetypeRole: 'Güneş Tapınağı İnisiyesi, Astronom Rahip/Rahibe, Kutsal Geometri Mimarı veya Hanedan Mensubu',
        geographyCulture: 'Nil Deltası, Thebes, Memphis veya Heliopolis',
        atmosphere: 'Sirius ve Güneş kültü, mumyalama ve ölüm ötesi bilgeliği, piramitlerin ve hiyerogliflerin kutsal ritüelleri.',
        karmicImprint: 'Doğal bir asalet, sıradanlığa tahammülsüzlük, ezoterik sembollere ve ritüellere karşı çocukluktan gelen aşinalık.',
        soulMemoryKey: 'Kutsal bilgiye ve yüksek statüye sahiptiniz; bu enkarnasyonda gücünüzü kibirsizce, sevgiyle dünyevi yaşama entegre etmeniz bekleniyor.'
      }
    },
    {
      id: 'yunan',
      primarySigns: ['İkizler'],
      secondarySigns: ['Yay', 'Kova'],
      primaryHouses: [9, 3],
      secondaryHouses: [11],
      rulerPlanets: ['Merkür', 'Jüpiter'],
      bonusPlanet: { name: 'Merkür', house: 9 },
      result: {
        eraName: 'Antik Yunan, İskenderiye & Felsefe Çağı',
        timeSpan: 'M.Ö. 450 – M.Ö. 150 civarı',
        century: 'M.Ö. 5. - 2. Yüzyıl',
        archetypeRole: 'Akademi Filozofu, İskenderiye Kütüphanecisi, Gezgin Hekim veya Matematikçi',
        geographyCulture: 'Atina, İskenderiye (Mısır), Efes veya Miletos',
        atmosphere: 'Felsefi münazaralar, tiyatro, geometri, hakikat arayışı ve antik parşömenlerin altın çağı.',
        karmicImprint: 'Dogmalara ve kör inançlara karşı alerji, durmaksızın gerçeği sorgulama ve entelektüel özgürlük tutkusu.',
        soulMemoryKey: 'Fikirleriniz döneminizin çok ötesindeydi; bu yaşamda da anlaşılmama korkusu yaşamadan bildiğiniz hakikati anlatmalısınız.'
      }
    },
    {
      id: 'manastir',
      primarySigns: ['Balık'],
      secondarySigns: ['Yengeç', 'Başak'],
      primaryHouses: [12],
      secondaryHouses: [4, 6],
      rulerPlanets: ['Neptün', 'Ay'],
      bonusPlanet: { name: 'Neptün', house: 12 },
      result: {
        eraName: 'Erken Orta Çağ & Manastır / İnziva Dönemi',
        timeSpan: 'M.S. 500 – 950 civarı',
        century: '6. - 10. Yüzyıl',
        archetypeRole: 'Manastır Şifacısı, Münzevi İnzivacı, Kutsal Metin Kâtibi veya Yetimhane Koruyucusu',
        geographyCulture: 'İrlanda, İskoçya Yaylaları, Kapadokya veya Bizans Kırsalı',
        atmosphere: 'Sessizlik yeminleri, dünyevi gürültüden el etek çekme, dualar ve ruhsal adanmışlıkla geçen derin bir yalnızlık.',
        karmicImprint: 'Kalabalıklardan çabuk yorulma, dünyayı fazla hoyrat bulma ve kendi ihtiyaçlarını başkaları için feda etme refleksi.',
        soulMemoryKey: 'Ruhunuz geçmişte uzun süre sessizlikte kaldı; bu yaşamda dünyadan kaçmak yerine dünyanın içinde ışığınızı parlatmalısınız.'
      }
    },
    {
      id: 'hacli',
      primarySigns: ['Yay'],
      secondarySigns: ['Koç'],
      primaryHouses: [9],
      secondaryHouses: [8, 1],
      rulerPlanets: ['Mars', 'Jüpiter'],
      bonusPlanet: { name: 'Mars', house: 9 },
      result: {
        eraName: 'Feodal Dönem & Haçlı Seferleri Çağı',
        timeSpan: 'M.S. 1095 – 1290 civarı',
        century: '11. - 13. Yüzyıl',
        archetypeRole: 'Şövalye, Kale Muhafızı, Kutsal Toprak Yolcusu veya Feodal Baron',
        geographyCulture: 'Levant (Kudüs, Antakya), Güney Fransa veya Doğu Akdeniz',
        atmosphere: 'İnanç uğruna at sırtında yapılan aylar süren yolculuklar, kale kuşatmaları ve kutsal emanet savaşları.',
        karmicImprint: 'Büyük idealler uğruna her şeyi terk edebilme cesareti, ancak savaşın masumiyet üzerindeki tahribatından kalan gizli hüzün.',
        soulMemoryKey: 'İnandığınız değerler için savaştınız; bu yaşamda savaşınız dış dünyayla değil, kendi içsel barışınızladır.'
      }
    },
    {
      id: 'osmanli',
      primarySigns: ['Boğa'],
      secondarySigns: ['Yay', 'Yengeç'],
      primaryHouses: [2],
      secondaryHouses: [9, 7],
      rulerPlanets: ['Jüpiter', 'Venüs'],
      bonusPlanet: { name: 'Jüpiter', house: 2 },
      result: {
        eraName: 'Osmanlı & İpek Yolu Doğu Medeniyetleri',
        timeSpan: 'M.S. 1450 – 1750 civarı',
        century: '15. - 18. Yüzyıl',
        archetypeRole: 'İpek Yolu Kervan Tüccarı, Medrese Müderrisi, Dergâh Dervişi veya Saray Hekimi',
        geographyCulture: 'İstanbul, Semerkand, İsfahan, Şam veya Tebriz',
        atmosphere: 'Kervansaraylar, baharat pazarları, tasavvuf meclisleri, kubbe mimarisi ve Doğu ile Batı arasındaki köprü.',
        karmicImprint: 'Misafirperverlik, derin tevekkül, yolculuk tutkusu ve ticarette adalet hassasiyeti.',
        soulMemoryKey: 'Geniş coğrafyaları birbirine bağladınız; bu yaşamda da farklı kültürleri ve insanları kaynaştıran bilge bir köprüsünüz.'
      }
    },
    {
      id: 'sanayi',
      primarySigns: ['Oğlak'],
      secondarySigns: ['Kova', 'Başak'],
      primaryHouses: [6, 10],
      secondaryHouses: [11],
      rulerPlanets: ['Satürn', 'Uranüs'],
      bonusPlanet: { name: 'Satürn', house: 6 },
      result: {
        eraName: 'Sanayi Devrimi & Viktorya Dönemi',
        timeSpan: 'M.S. 1780 – 1900 civarı',
        century: '18. - 19. Yüzyıl',
        archetypeRole: 'Fabrika Mühendisi, Lokomotif Tasarımcısı, Emekçi Savunucusu veya Katı Bürokrasi Yöneticisi',
        geographyCulture: 'İngiltere (Manchester, Londra), Ruhr Vadisi (Almanya) veya New England (Amerika)',
        atmosphere: 'Kömür dumanları, buhar makineleri, fabrika çarkları, saat disiplini ve sınıfsal dönüşüm mücadeleleri.',
        karmicImprint: 'Sürekli üretme ve çalışma baskısı, dinlenirken içsel suçluluk duyma ve duyguları mantığa kurban etme korkusu.',
        soulMemoryKey: 'Makineler ve sistemler inşa ettiniz; bu hayatta ruhunuzun da beslenmeye ve dinlenmeye hakkı olduğunu hatırlamalısınız.'
      }
    },
    {
      id: 'samanik',
      primarySigns: ['Yengeç'],
      secondarySigns: ['Boğa', 'Balık', 'Akrep'],
      primaryHouses: [4],
      secondaryHouses: [12, 8],
      rulerPlanets: ['Ay', 'Neptün'],
      bonusPlanet: { name: 'Ay', house: 4 },
      result: {
        eraName: 'Kadim Doğa & Şamanik Kabile Döngüsü',
        timeSpan: 'Tarih Ötesi / Kadim Zamanlar',
        century: 'Kadim Döngü',
        archetypeRole: 'Kabile Şamanı, Ateş Koruyucusu, Bitki Bilgesi veya Avcı Rehber',
        geographyCulture: 'Kuzey Avrasya Bozkırları, Mezopotamya Yaylaları veya Yerli Amerikan Ormanları',
        atmosphere: 'Şehirlerden uzak; yıldızların, rüzgârın, kurtların ve doğa ruhlarının diliyle nefes alınan saf kabile yaşamı.',
        karmicImprint: 'Modern betonarme binalara ve yapay düzene derin bir yabancılık; orman, toprak ve gökyüzü hasreti.',
        soulMemoryKey: 'Doğanın saf zekasıyla yaşadınız; bu hayatta da toprağa dokunduğunuzda ve iç sesinizi dinlediğinizde anında şifalanırsınız.'
      }
    }
  ];

  let bestEra = ERAS[0];
  let maxScore = -1;

  ERAS.forEach((era, eIdx) => {
    let score = 0;

    // 1. GAD Burcu uyumu (Temel Arketip: 4 / 2 puan)
    if (era.primarySigns.includes(gadSign)) {
      score += 4.0;
    } else if (era.secondarySigns.includes(gadSign)) {
      score += 2.0;
    }

    // 2. GAD Evi uyumu (Deneyim Alanı: 3 / 1.5 puan)
    if (era.primaryHouses.includes(gadHouse)) {
      score += 3.0;
    } else if (era.secondaryHouses.includes(gadHouse)) {
      score += 1.5;
    }

    // 3. GAD Yöneticisi Gezegen uyumu (Karmik Cetvel: 2.5 puan)
    if (gadRulers.some((r: string) => era.rulerPlanets.includes(r))) {
      score += 2.5;
    }

    // 4. 12. Ev (Son Nefes / Bilinçaltı) uyumu (1.5 / 0.8 puan)
    if (h12Sign) {
      if (era.primarySigns.includes(h12Sign)) score += 1.5;
      else if (era.secondarySigns.includes(h12Sign)) score += 0.8;
    }

    // 5. Özel Gezegen bonusu (1.5 puan)
    if (era.bonusPlanet && planetHouseMap[era.bonusPlanet.name] === era.bonusPlanet.house) {
      score += 1.5;
    }

    // 6. Eşitlik durumunda adil deterministik hafif ofset
    const hash = Math.abs(Math.sin((gadHouse * 31) + (gadSign.charCodeAt(0) * 17) + (eIdx * 13))) * 0.1;
    score += hash;

    if (score > maxScore) {
      maxScore = score;
      bestEra = era;
    }
  });

  return bestEra.result;
}
