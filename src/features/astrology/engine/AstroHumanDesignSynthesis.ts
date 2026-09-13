import { AstroPoint, AstroAspect, ZodiacSign } from './AstrologyConstants';
import { HumanDesignChart, PlanetActivation, CenterCode } from '@/utils/HumanDesignEngine';

export interface AstroHDSynthesisItem {
  planetKey: string;
  planetName: string;
  symbol: string;
  sign: string;
  house: number;
  houseTheme: string;
  gate: number;
  gateName: string;
  line: number;
  center: string;
  isChannelDefined: boolean;
  aspects: {
    targetPlanet: string;
    type: string;
    nature: 'harmonious' | 'challenging' | 'neutral';
  }[];
  dominantNature: 'harmonious' | 'challenging' | 'neutral';
  synthesisTitle: string;
  synthesisInterpretation: string;
  giftPotential: string;
  shadowWarning: string;
}

export interface AstroHDSynthesisReport {
  items: AstroHDSynthesisItem[];
  dominantLifeArea: {
    house: number;
    title: string;
    description: string;
  };
  highestGiftGate: {
    gate: number;
    gateName: string;
    planet: string;
    house: number;
    description: string;
  };
  majorGrowthChallengeGate: {
    gate: number;
    gateName: string;
    planet: string;
    house: number;
    description: string;
  };
}

const HOUSE_METADATA: Record<number, { title: string; field: string; theme: string }> = {
  1: { title: '1. Ev (Bireysel Kimlik & Beden)', field: 'Benlik, Hayat Gücü ve Dış Dünyaya İlk İntiba', theme: 'Bireysel liderlik, beden farkındalığı ve dünyadaki varoluş duruşu' },
  2: { title: '2. Ev (Maddi Kaynaklar & Özdeğer)', field: 'Finansal Güvenlik, Maddi Değerler ve Yetenekler', theme: 'Kaynak üretme, özdeğer inşası ve somut dünya ile güven bağı' },
  3: { title: '3. Ev (Zihin & Yakın İletişim)', field: 'Öğrenme, İfade, Kardeşler ve Yakın Çevre', theme: 'Düşüncelerin aktarımı, veri işleme ve zihinsel ağlar' },
  4: { title: '4. Ev (Kökler & Yuva Mahremiyeti)', field: 'İç Güvenlik, Aile Kökeni ve Mahremiyet', theme: 'Ruhsal sığınak, duygusal temeller ve ata kalıtımı' },
  5: { title: '5. Ev (Yaratıcı Sahne & Aşk)', field: 'Özgün Yaratıcılık, Tutkular, Sahne ve Neşe', theme: 'Kalpten gelen kendini ifade, risk alma ve yaşam coşkusu' },
  6: { title: '6. Ev (Günlük Ritim & Hizmet)', field: 'Çalışma Disiplini, Beden Sağlığı ve Ustalık', theme: 'Pratik verimlilik, hizmet etme ve organizasyonel düzen' },
  7: { title: '7. Ev (İkili İlişkiler & Aynalanma)', field: 'Ortaklıklar, Evlilik ve Karşılıklı Sözleşmeler', theme: 'Öteki ile dengelenme, ilişkiler aynasında büyüme' },
  8: { title: '8. Ev (Dönüşüm & Derin Krizler)', field: 'Okült, Miras, Paylaşılan Güç ve Simya', theme: 'Küllerinden doğma, krizlerin bilgeliğe dönüştürülmesi' },
  9: { title: '9. Ev (Yüksek Bilgelik & Vizyon)', field: 'Hakikat Arayışı, Yurt Dışı, Felsefe ve Genişleme', theme: 'Ufukların ötesine geçme, inanç kalıplarının dönüşümü' },
  10: { title: '10. Ev (Kariyer & Toplumsal Misyon)', field: 'Mesleki Başarı, İtibar ve Yaşam Zirvesi', theme: 'Toplum önünde görünürlük, otorite ve miras bırakma' },
  11: { title: '11. Ev (Kolektif Vizyon & İdealler)', field: 'Gelecek Hayalleri, Topluluklar ve Ağlar', theme: 'Kolektif bilince katkı, hümaniter projeler ve dostluklar' },
  12: { title: '12. Ev (Bilinçaltı & Mistik Çözülme)', field: 'Karmik Hafıza, İnziva ve Evrensel Birlik', theme: 'Görünmeyen boyutlar, egonun teslimiyeti ve sezgisel bilgelik' }
};

const GATE_TITLES: Record<number, { title: string; gift: string; shadow: string }> = {
  1: { title: "Yaratıcılık & Kendini İfade", gift: "Özgün Deha", shadow: "Amaçsızlık ve Yetersizlik" },
  2: { title: "Alıcılık & Yön Tayini", gift: "Doğru Zamanlama ve Rehberlik", shadow: "Kayıp Hissetme" },
  3: { title: "Düzen & Yeni Başlangıçlar", gift: "Kaosu Düzene Çevirme", shadow: "Kaos ve Erteleme" },
  4: { title: "Formüller & Zihinsel Cevaplar", gift: "Mantıksal Çözümleme", shadow: "Zihinsel Saplantı" },
  5: { title: "Ritim & Evrensel Kalıplar", gift: "Doğal Akışa Güven", shadow: "Sabırsızlık ve Telaş" },
  6: { title: "Uyum & Duygusal Sürtüşme", gift: "Barışçıl Yakınlık", shadow: "Çatışma ve Savunma" },
  7: { title: "Demokratik Liderlik", gift: "Görünmeyen Yönlendirici", shadow: "Otoriterlik ve İktidar Hırsı" },
  8: { title: "Bireysel Katkı", gift: "Stil ve Örnek Olma", shadow: "Gösteriş Merakı" },
  9: { title: "Odak & Mikro Detaylar", gift: "Keskin Konsantrasyon", shadow: "Detaylarda Boğulma" },
  10: { title: "Kendini Sevme & Doğallık", gift: "Kişisel Özgünlük", shadow: "Kendinden Nefret / Kibir" },
  11: { title: "Fikir Dünyası & Görsel Hafıza", gift: "İlham Dolu Hikayeler", shadow: "Boş Hayalcilik" },
  12: { title: "Zarafet & İfade Sanatı", gift: "Derin Şiirsel Duruş", shadow: "Kibir ve İçe Kapanma" },
  13: { title: "Sırdaş Dinleyici", gift: "Geçmişin Bilgeliğini Tutma", shadow: "Sır Yükü ve Kurbanlık" },
  14: { title: "Güç & Kaynak Yönetimi", gift: "Bolluk ve Refah Üretimi", shadow: "Tükenmişlik ve Kölelik" },
  15: { title: "Evrensel Sevgi & Uçlar", gift: "Farklılıkları Kucaklama", shadow: "Aşırılık ve Dengesizlik" },
  16: { title: "Ustalık & Beceri", gift: "Çok Yönlü Deha", shadow: "Yüzeysellik ve Aldanış" },
  17: { title: "Görüşler & Gelecek Kurgusu", gift: "İleriyi Görebilme", shadow: "Fikir Dayatma" },
  18: { title: "Düzeltme & Kusursuzluk", gift: "Bozuk Olanı İyileştirme", shadow: "Kör Yargılama ve Eleştiri" },
  19: { title: "İhtiyaçlar & Duyarlılık", gift: "Toplumsal Şefkat", shadow: "Aşırı Bağımlılık" },
  20: { title: "Şimdiki Zaman & An", gift: "Saf Şimdiki An Bilinci", shadow: "Gelecek Kaygısı" },
  21: { title: "Kontrol & Yönetici İrade", gift: "Adil Kaynak İdaresi", shadow: "Zorbalık ve Kontrol Deliliği" },
  22: { title: "Zarafet & Duygu Sanatı", gift: "Yüksek Duygusal Nezaket", shadow: "Öfke Patlamaları" },
  23: { title: "Basitlik & Açıklama", gift: "Karmaşığı Basite İndirgeme", shadow: "Yanlış Anlaşılma" },
  24: { title: "Rasyonalizasyon & Dönüş", gift: "Zihinsel Aydınlanma", shadow: "Tekrarlayan Takıntılar" },
  25: { title: "Koşulsuz Sevgi & Masumiyet", gift: "Yargısız Kalp", shadow: "Yaralanmış Kibir" },
  26: { title: "İkna & Doğru Mesaj", gift: "Etkileyici Liderlik", shadow: "Manipülasyon ve Yalan" },
  27: { title: "Besleme & Koruma", gift: "Cömert Bakım", shadow: "Fedakarlık Tükenmişliği" },
  28: { title: "Mücadele & Yaşam Anlamı", gift: "Korkusuzca Anlam Arama", shadow: "Boş Mücadeleler" },
  29: { title: "Bağlılık & Evet Deme", gift: "Kendini Deneyime Adama", shadow: "Aşırı Yük Alma" },
  30: { title: "Ateşli Tutku & Kader", gift: "Duygusal Arınma", shadow: "Tükenmeyen Doyumsuzluk" },
  31: { title: "Liderlik Sesi", gift: "Halkın Sesi Olma", shadow: "Megalomani" },
  32: { title: "Süreklilik & Sezgi", gift: "Neyin Kalıcı Olduğunu Bilme", shadow: "Başarısızlık Korkusu" },
  33: { title: "Mahremiyet & Hatırlama", gift: "Deneyimden Ders Çıkarma", shadow: "Geçmişe Saplanma" },
  34: { title: "Saf Yaşam Gücü", gift: "Kudretli Üretim", shadow: "Kaba Kuvvet" },
  35: { title: "Deneyim & İlerleme", gift: "Doygun Macera Bilinci", shadow: "Can Sıkıntısı Krizi" },
  36: { title: "Kriz Çözücü & Merhamet", gift: "Karanlığı Aydınlatma", shadow: "Duygusal Kargaşa" },
  37: { title: "Aile & Anlaşmalar", gift: "Sıcak Topluluk Bağı", shadow: "Pazarlıkçı Sevgi" },
  38: { title: "Savaşçı & Amaç", gift: "Doğru Şey İçin Savaşma", shadow: "Sürekli İnat ve Saldırı" },
  39: { title: "Tetikleme & Provokasyon", gift: "Ruhu Harekete Geçirme", shadow: "Düşmanca Kışkırtma" },
  40: { title: "Yalnızlık & Topluluk", gift: "Çalışma ve Dinlenme Dengesi", shadow: "Dışlanmışlık Acısı" },
  41: { title: "Hayal Gücü & Başlangıç", gift: "Vizyoner Hayal Gücü", shadow: "Boş Fanteziler" },
  42: { title: "Büyüme & Döngüleri Bitirme", gift: "Döngüyü Başarıyla Tamamlama", shadow: "Yarım Bırakma" },
  43: { title: "İçgörü & Deha", gift: "Bireysel Eşsiz Düşünce", shadow: "Sağırlık ve İzolasyon" },
  44: { title: "Geçmiş Uyanıklığı & Ağlar", gift: "Doğru İnsanları Birleştirme", shadow: "Geçmiş Korkuları" },
  45: { title: "Bolluk Sahibi & Dağıtıcı", gift: "Topluluğu Zenginleştirme", shadow: "Hırslı Cimrilik" },
  46: { title: "Beden Sevgisi & Şans", gift: "Doğru Yerde ve Zamanda Olma", shadow: "Bedenini Reddetme" },
  47: { title: "Fikir Dünyası & Çözüm", gift: "Zor Soruları Aydınlatma", shadow: "Kafes Hissi" },
  48: { title: "Derinlik & Kuyu", gift: "Kusursuz Çözüm Uzmanlığı", shadow: "Yetersizlik Korkusu" },
  49: { title: "Devrim & İlkeler", gift: "Yüksek Adalet ve Dönüşüm", shadow: "Katı Reddetme" },
  50: { title: "Değerler & Yasalar", gift: "Sosyal Ahlak ve Koruyuculuk", shadow: "Aşırı Katılık" },
  51: { title: "Şok & Cesur Uyanış", gift: "Korkusuz Başlatıcı", shadow: "Gereksiz Sarsıntılar" },
  52: { title: "Sükunet & Dağ", gift: "Hareketsizliğin Gücü", shadow: "Atalet ve Felç Olma" },
  53: { title: "Yeni Başlangıçlar", gift: "Taze Tohum Ekme", shadow: "Daldan Dala Atlama" },
  54: { title: "Hırs & Yükseliş", gift: "Ruhsal ve Maddi Başarı", shadow: "Tükenmişlik Hırsı" },
  55: { title: "Ruh Bolluğu", gift: "Duygusal Özgürlük", shadow: "Melankoli ve Kurbanlık" },
  56: { title: "Gezgin & Hikaye", gift: "Ufuk Açıcı Anlatıcı", shadow: "Boş Konuşma" },
  57: { title: "Sezgisel Kulak", gift: "Anlık Sezgisel Netlik", shadow: "Gelecekten Ürperme" },
  58: { title: "Yaşam Sevinci", gift: "Neşeli Canlılık", shadow: "Mükemmeliyetçi Öfke" },
  59: { title: "Cinsellik & Yakınlık", gift: "Bariyerleri Eritme", shadow: "Ulaşılmaz Duvarlar" },
  60: { title: "Kabul & Mutasyon", gift: "Sınırlar İçinde Mucize Yaratma", shadow: "Kısıtlanmışlık Öfkesi" },
  61: { title: "İçsel Hakikat & Gizem", gift: "Bilinmeyene Erişme", shadow: "Neden Sorusu Çılgınlığı" },
  62: { title: "Detaylar & İsimlendirme", gift: "Pratik Kusursuz İfade", shadow: "Aşırı Detaycılık" },
  63: { title: "Mantıksal Şüphe", gift: "Bilimsel Hakikat Arayışı", shadow: "Kendinden Şüphe" },
  64: { title: "Kafa Karışıklığı & İmgeler", gift: "Geçmişi Sanata Çevirme", shadow: "Zihinsel Sis" }
};

export const GATE_TO_CENTER: Record<number, string> = {
  64: 'Tepe (Taç)', 61: 'Tepe (Taç)', 63: 'Tepe (Taç)',
  47: 'Ajna (Zihin)', 24: 'Ajna (Zihin)', 4: 'Ajna (Zihin)', 17: 'Ajna (Zihin)', 43: 'Ajna (Zihin)', 11: 'Ajna (Zihin)',
  62: 'Boğaz', 23: 'Boğaz', 56: 'Boğaz', 16: 'Boğaz', 35: 'Boğaz', 20: 'Boğaz', 12: 'Boğaz', 45: 'Boğaz', 31: 'Boğaz', 8: 'Boğaz', 33: 'Boğaz',
  7: 'Benlik (G)', 1: 'Benlik (G)', 13: 'Benlik (G)', 10: 'Benlik (G)', 25: 'Benlik (G)', 15: 'Benlik (G)', 2: 'Benlik (G)', 46: 'Benlik (G)',
  21: 'Kalp (Ego)', 51: 'Kalp (Ego)', 26: 'Kalp (Ego)', 40: 'Kalp (Ego)',
  5: 'Sakral', 14: 'Sakral', 29: 'Sakral', 34: 'Sakral', 27: 'Sakral', 59: 'Sakral', 42: 'Sakral', 3: 'Sakral', 9: 'Sakral',
  53: 'Kök', 60: 'Kök', 52: 'Kök', 54: 'Kök', 19: 'Kök', 38: 'Kök', 39: 'Kök', 58: 'Kök', 41: 'Kök',
  48: 'Dalak', 57: 'Dalak', 44: 'Dalak', 50: 'Dalak', 32: 'Dalak', 28: 'Dalak', 18: 'Dalak',
  36: 'Solar Pleksus', 22: 'Solar Pleksus', 37: 'Solar Pleksus', 6: 'Solar Pleksus', 49: 'Solar Pleksus', 55: 'Solar Pleksus', 30: 'Solar Pleksus'
};

const PLANET_NAMES_TR: Record<string, string> = {
  Sun: 'Güneş',
  Earth: 'Dünya',
  Moon: 'Ay',
  Mercury: 'Merkür',
  Venus: 'Venüs',
  Mars: 'Mars',
  Jupiter: 'Jüpiter',
  Saturn: 'Satürn',
  Uranus: 'Uranüs',
  Neptune: 'Neptün',
  Pluto: 'Plüton',
  NorthNode: 'Kuzey Düğümü',
  SouthNode: 'Güney Düğümü',
  Chiron: 'Kiron',
  Ascendant: 'Yükselen',
  Midheaven: 'Tepe Noktası (MC)'
};

const SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Earth: '⊕',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  NorthNode: '☊',
  SouthNode: '☋'
};

/**
 * Astroloji doğum haritası ile Human Design BodyGraph'ını sentezleyip
 * her gezegen için Ev-Kapı-Açı çapraz okuma matrisi üretir.
 */
export function synthesizeAstroHumanDesign(
  astroPlanets: AstroPoint[],
  astroAspects: AstroAspect[],
  hdChart: HumanDesignChart
): AstroHDSynthesisReport {
  const items: AstroHDSynthesisItem[] = [];
  const houseCount: Record<number, number> = {};

  const sunAstro = astroPlanets.find(ap => ap.name === 'Güneş');

  hdChart.conscious.forEach((conAct) => {
    const planetKey = conAct.planet;
    const planetName = PLANET_NAMES_TR[planetKey] || planetKey;

    // Astroloji gezegenini eşleştir
    let astroP = astroPlanets.find((ap) => {
      if (planetKey === 'Sun' && ap.name === 'Güneş') return true;
      if (planetKey === 'Moon' && ap.name === 'Ay') return true;
      if (planetKey === 'Mercury' && ap.name === 'Merkür') return true;
      if (planetKey === 'Venus' && ap.name === 'Venüs') return true;
      if (planetKey === 'Mars' && ap.name === 'Mars') return true;
      if (planetKey === 'Jupiter' && ap.name === 'Jüpiter') return true;
      if (planetKey === 'Saturn' && ap.name === 'Satürn') return true;
      if (planetKey === 'Uranus' && ap.name === 'Uranüs') return true;
      if (planetKey === 'Neptune' && ap.name === 'Neptün') return true;
      if (planetKey === 'Pluto' && ap.name === 'Plüton') return true;
      if (planetKey === 'NorthNode' && (ap.name === 'Kuzey Düğümü' || ap.name === 'Kuzey Düğüm')) return true;
      if (planetKey === 'SouthNode' && (ap.name === 'Güney Düğümü' || ap.name === 'Güney Düğüm')) return true;
      return ap.name.toLowerCase() === planetName.toLowerCase();
    });

    const symbol = SYMBOLS[planetKey] || '✦';
    let house = astroP?.house || 1;
    let sign = astroP?.sign || '';

    if (planetKey === 'Earth') {
      if (sunAstro) {
        house = ((sunAstro.house + 5) % 12) + 1; // 6 ev karşısı
      }
    }

    houseCount[house] = (houseCount[house] || 0) + 1;

    const houseInfo = HOUSE_METADATA[house] || { title: `${house}. Ev`, field: 'Yaşam Alanı', theme: 'Kişisel Gelişim' };
    const gateInfo = GATE_TITLES[conAct.gate] || { title: `${conAct.gate}. Kapı`, gift: 'Doğal Yetenek', shadow: 'Zorlayıcı Alışkanlık' };
    const centerName = GATE_TO_CENTER[conAct.gate] || 'Enerji Merkezi';

    // İlgili gezegenin açılarını filtrele
    const pAspects = astroAspects.filter((asp) => asp.planet1 === astroP?.name || asp.planet2 === astroP?.name);
    
    let challengingCount = 0;
    let harmoniousCount = 0;

    const formattedAspects = pAspects.map((asp) => {
      const other = asp.planet1 === astroP?.name ? asp.planet2 : asp.planet1;
      let nature: 'harmonious' | 'challenging' | 'neutral' = 'neutral';
      const t = asp.type.toLowerCase();
      if (t === 'kare' || t === 'karşıt' || t === 'square' || t === 'opposition') {
        nature = 'challenging';
        challengingCount++;
      } else if (t === 'üçgen' || t === 'sekstil' || t === 'trine' || t === 'sextile') {
        nature = 'harmonious';
        harmoniousCount++;
      }
      return {
        targetPlanet: other,
        type: asp.type,
        nature
      };
    });

    let dominantNature: 'harmonious' | 'challenging' | 'neutral' = 'neutral';
    if (challengingCount > harmoniousCount) dominantNature = 'challenging';
    else if (harmoniousCount > 0) dominantNature = 'harmonious';

    const isChannelDefined = hdChart.activeGates.includes(conAct.gate);

    // Bütünleşik Sentez Yorumu
    const synthesisTitle = `${planetName} ${houseInfo.title}'de & ${conAct.gate}.${conAct.line} Kapısında (${gateInfo.title})`;
    
    let synthesisInterpretation = `${planetName} enerjiniz, hayatınızın **${houseInfo.field}** sahnesinde somutlaşırken (${house}. Ev), içsel işletim sisteminizde **${conAct.gate}. Kapı (${gateInfo.title})** ve **${centerName} Merkezi** arketipiyle titreşmektedir. `;
    
    if (dominantNature === 'challenging') {
      synthesisInterpretation += `Haritanızdaki dinamik zorlayıcı açılar (Kare/Karşıt), bu kapının **Gölge Frekansı (${gateInfo.shadow})** üzerinden sınandığınızı ve dönüştürücü dersler sunduğunu gösterir.`;
    } else if (dominantNature === 'harmonious') {
      synthesisInterpretation += `Uyumlu açılar (Üçgen/Sekstil) sayesinde bu kapının **Armağan Frekansı (${gateInfo.gift})** yaşamınıza doğal, zahmetsiz ve akıcı bir deha olarak yansır.`;
    } else {
      synthesisInterpretation += `Bu kapının frekansı, ${houseInfo.theme} alanında doğrudan ve odaklı bir bilinç çalışması sunar.`;
    }

    items.push({
      planetKey,
      planetName,
      symbol,
      sign,
      house,
      houseTheme: houseInfo.theme,
      gate: conAct.gate,
      gateName: gateInfo.title,
      line: conAct.line,
      center: centerName,
      isChannelDefined,
      aspects: formattedAspects,
      dominantNature,
      synthesisTitle,
      synthesisInterpretation,
      giftPotential: gateInfo.gift,
      shadowWarning: gateInfo.shadow
    });
  });

  // En yoğun hayat sahnesi
  let dominantHouse = 1;
  let maxCount = 0;
  Object.entries(houseCount).forEach(([h, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantHouse = Number(h);
    }
  });

  const dominantHouseMeta = HOUSE_METADATA[dominantHouse] || HOUSE_METADATA[1];

  // En yüksek armağan kapısı (Harmonious açılı)
  const bestHarmonious = items.find((i) => i.dominantNature === 'harmonious') || items[0];
  // En büyük büyüme sınavı kapısı (Challenging açılı)
  const biggestChallenge = items.find((i) => i.dominantNature === 'challenging') || items[items.length - 1];

  return {
    items,
    dominantLifeArea: {
      house: dominantHouse,
      title: dominantHouseMeta.title,
      description: `Gezegenlerinizin ve kilit kapılarınızın en yoğun toplandığı yaşam sahnesi bu alandır. Bütünleşik kader yolculuğunuzun ana laboratuvarı **${dominantHouseMeta.field}** üzerinde çalışmaktadır.`
    },
    highestGiftGate: {
      gate: bestHarmonious?.gate || 1,
      gateName: bestHarmonious?.gateName || 'Yaratıcılık',
      planet: bestHarmonious?.planetName || 'Güneş',
      house: bestHarmonious?.house || 1,
      description: `${bestHarmonious?.planetName} gezegeniniz ${bestHarmonious?.house}. Evde ve ${bestHarmonious?.gate}. Kapı'da destekleyici açılar altındadır. En doğal başarı ve çekim alanınız **${bestHarmonious?.giftPotential}** armağanıdır.`
    },
    majorGrowthChallengeGate: {
      gate: biggestChallenge?.gate || 28,
      gateName: biggestChallenge?.gateName || 'Mücadele',
      planet: biggestChallenge?.planetName || 'Mars',
      house: biggestChallenge?.house || 8,
      description: `${biggestChallenge?.planetName} gezegeninizin aktive ettiği ${biggestChallenge?.gate}. Kapı, haritanızdaki dinamik kare/karşıt açılarla tetiklenmektedir. En büyük tekamül sıçramanız **${biggestChallenge?.shadowWarning}** gölgesiyle yüzleşip onu aşmaktan geçer.`
    }
  };
}
