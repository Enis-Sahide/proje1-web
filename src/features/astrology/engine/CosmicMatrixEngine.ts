import { elderFuthark1 } from '@/data/runes/elderFuthark1';
import { elderFuthark2 } from '@/data/runes/elderFuthark2';
import { elderFuthark3 } from '@/data/runes/elderFuthark3';
import { runeBindingsData } from '@/data/runes/bindings';
import { GATE_TITLES, GATE_TO_CENTER, LINE_BEHAVIOR_PROFILES } from './AstroHumanDesignSynthesis';

export const ALL_RUNES = [...elderFuthark1, ...elderFuthark2, ...elderFuthark3];

export interface PlanetaryInput {
  name: string;
  sign: string;
  house: number;
  degree: number;
  isRetrograde?: boolean;
  longitude?: number;
}

export interface AspectInput {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  nature?: 'harmonious' | 'challenging' | 'neutral';
}

export interface HDActivationInput {
  planet: string;
  gate: number;
  line: number;
}

export interface HDChartInput {
  conscious: HDActivationInput[];
  unconscious: HDActivationInput[];
  activeGates: number[];
  definedCenters: string[];
}

export type EnergyDirection = 'inward' | 'outward'; // İçe Yönelimli (Yin) vs Dışa Yönelimli (Yang)

export interface PlanetBotanical {
  tree: string;
  essentialOil: string;
  theme: string;
}

export interface PlanetaryDynamicDiagnosis {
  planetKey: string;
  planetName: string;
  symbol: string;
  sign: string;
  house: number;
  isRetrograde: boolean;
  gate: number;
  line: number;
  center: string;
  isCenterDefined: boolean;
  energyDirection: EnergyDirection;
  directionTitle: string;
  archetypeTheme: string;
  activeManifestation: string;
  neutralExplanation: string;
  kabbalahSephira: string;
  kabbalahWorld: string;
  kabbalahLesson: string;
  balancingRune: {
    name: string;
    symbol: string;
    element: string;
    stone: string;
    meaning: string;
    balancingAction: string;
  };
  botanical: PlanetBotanical;
  practicalRemedy: string;
}

export interface CosmicMatrixItem {
  planetKey: string;
  planetName: string;
  symbol: string;
  astrology: {
    sign: string;
    house: number;
    isRetrograde: boolean;
    aspects: string[];
  };
  kabbalah: {
    world: 'Assiah' | 'Yetzirah' | 'Beriyah' | 'Atzilut';
    worldTitle: string;
    sephira: string;
    sephiraMeaning: string;
  };
  humanDesign: {
    gate: number;
    gateName: string;
    line: number;
    lineArchetype: string;
    center: string;
    isDefined: boolean;
    gift: string;
    shadow: string;
  };
  rune: {
    name: string;
    symbol: string;
    element: string;
    stone: string;
    meaning: string;
    guidance: string;
  };
  chakra: {
    name: string;
    location: string;
  };
  botanical: PlanetBotanical;
  dynamic: {
    direction: EnergyDirection;
    summary: string;
  };
}

export interface FourWorldsBalance {
  assiah: { count: number; percentage: number; theme: string };
  yetzirah: { count: number; percentage: number; theme: string };
  beriyah: { count: number; percentage: number; theme: string };
  atzilut: { count: number; percentage: number; theme: string };
  dominantWorld: string;
  growthWorld: string;
}

export interface PersonalTalismanFormula {
  title: string;
  runesUsed: string;
  symbols: string[];
  purpose: string;
  usageInstructions: string;
  kabbalisticBridge: string;
  incenseAndHerbs?: string;
}

export interface CosmicMatrixReport {
  items: CosmicMatrixItem[];
  planetaryDynamics: PlanetaryDynamicDiagnosis[];
  fourWorldsBalance: FourWorldsBalance;
  personalTalisman: PersonalTalismanFormula;
  coreLifeMission: {
    title: string;
    description: string;
    keyArchetype: string;
  };
}

// Gezegen -> Sefira ve 4 Âlem Eşleşmeleri
const PLANET_KABBALAH_MAP: Record<string, { sephira: string; sephiraMeaning: string; defaultWorld: 'Assiah' | 'Yetzirah' | 'Beriyah' | 'Atzilut' }> = {
  Sun: { sephira: 'Tiferet', sephiraMeaning: 'Güzellik, Kalp, İlahi Uyum ve Bilinç', defaultWorld: 'Beriyah' },
  Moon: { sephira: 'Yesod', sephiraMeaning: 'Temel, Bilinçaltı Hafıza ve Astral Ayna', defaultWorld: 'Yetzirah' },
  Mercury: { sephira: 'Hod', sephiraMeaning: 'Görkem, Zihinsel İfade ve Hakikat İletişimi', defaultWorld: 'Yetzirah' },
  Venus: { sephira: 'Netzach', sephiraMeaning: 'Zafer, Duygusal Tutku ve Sanatsal Çekim', defaultWorld: 'Yetzirah' },
  Mars: { sephira: 'Gevurah', sephiraMeaning: 'Güç, İlahi Yargı, Sınır ve Disiplin', defaultWorld: 'Beriyah' },
  Jupiter: { sephira: 'Chesed', sephiraMeaning: 'Merhamet, Koşulsuz Bolluk ve Genişleme', defaultWorld: 'Beriyah' },
  Saturn: { sephira: 'Binah', sephiraMeaning: 'Kozmik Anlayış, Kadersel Zaman ve Büyük Sınırlar', defaultWorld: 'Beriyah' },
  Uranus: { sephira: 'Chokhmah', sephiraMeaning: 'İlahi Bilgelik, Ani Uyanış ve Kozmik Yıldırım', defaultWorld: 'Atzilut' },
  Neptune: { sephira: 'Keter', sephiraMeaning: 'Taç, Saf Birlik ve Sonsuz Işık Kaynağı', defaultWorld: 'Atzilut' },
  Pluto: { sephira: 'Daat (Kozmik Eşik)', sephiraMeaning: 'Gizemli Bilinçaltı Geçidi ve Kökten Yeniden Doğuş', defaultWorld: 'Atzilut' },
  NorthNode: { sephira: 'Keter Yolu', sephiraMeaning: 'Gelecek Tekâmül Amacı ve Ruhsal Zirve', defaultWorld: 'Atzilut' },
  SouthNode: { sephira: 'Malkhut Temeli', sephiraMeaning: 'Geçmiş Enkarnasyon Kökleri ve Atalardan Gelen Miras', defaultWorld: 'Assiah' },
  Chiron: { sephira: 'Tiferet-Yesod Köprüsü', sephiraMeaning: 'Yaralı Şifacı, Kalp ile Bilinçaltını Birleştiren Şifa', defaultWorld: 'Yetzirah' },
  Lilith: { sephira: 'Yesod-Malkhut Eşiği', sephiraMeaning: 'Bilinçaltı Vahşi Doğa, Gölge Benlik ve İlksel Güç', defaultWorld: 'Yetzirah' },
  Ascendant: { sephira: 'Malkhut', sephiraMeaning: 'Krallık, Fiziksel Beden ve Dünyevi Tezahür', defaultWorld: 'Assiah' }
};

// Gezegen -> Rune Eşleşmeleri
const PLANET_RUNE_MAP: Record<string, string> = {
  Sun: 'Sowilo',
  Moon: 'Isa',
  Mercury: 'Ansuz',
  Venus: 'Gebo',
  Mars: 'Thurisaz',
  Jupiter: 'Fehu',
  Saturn: 'Nauthiz',
  Uranus: 'Hagalaz',
  Neptune: 'Laguz',
  Pluto: 'Eihwaz',
  NorthNode: 'Dagaz',
  SouthNode: 'Othala',
  Chiron: 'Kenaz',
  Lilith: 'Thurisaz',
  Ascendant: 'Uruz'
};

// Gezegen -> Çakra Eşleşmesi
const PLANET_CHAKRA_MAP: Record<string, { name: string; location: string }> = {
  Sun: { name: 'Solar Pleksus (3. Çakra)', location: 'Mide / İrade ve Benlik Merkezi' },
  Moon: { name: 'Sakral (2. Çakra)', location: 'Alt Karın / Duygular ve Yaratıcılık' },
  Mercury: { name: 'Boğaz (5. Çakra)', location: 'Boğaz / İfade ve Hakikat' },
  Venus: { name: 'Kalp (4. Çakra)', location: 'Göğüs Kafesi / Koşulsuz Sevgi ve Denge' },
  Mars: { name: 'Kök (1. Çakra)', location: 'Omurga Tabanı / Yaşam Mücadelesi ve Cesaret' },
  Jupiter: { name: 'Üçüncü Göz (6. Çakra)', location: 'Alın Ortası / Sezgi ve Geniş Vizyon' },
  Saturn: { name: 'Kök ve İskelet Sistemi', location: 'Kemikler, Omurga / Sınırlar ve Yapı' },
  Uranus: { name: 'Tepe / Taç (7. Çakra)', location: 'Başın Tepesi / Evrensel Bağlantı' },
  Neptune: { name: 'Yüksek Kalp (Timüs)', location: 'Göğüs Üstü / Kozmik Merhamet' },
  Pluto: { name: 'Kundalini Kapısı', location: 'Omurga Kökü / Simyasal Dönüşüm Enerjisi' },
  NorthNode: { name: 'Taç Çakra', location: 'Ruhsal Rehberlik Kapısı' },
  SouthNode: { name: 'Kök Çakra', location: 'Hücresel Atalara Ait Hafıza' },
  Chiron: { name: 'Kalp Çakrası', location: 'Ruhun Yarası ve Şifa Kapısı' },
  Lilith: { name: 'Sakral & Kundalini (2. Çakra)', location: 'Alt Karın / Gölge Şifa ve Vahşi Bilgelik' },
  Ascendant: { name: 'Bütün Biyofiziksel Beden', location: 'Aura ve Fiziksel Beden' }
};

const PLANET_NAMES_TR: Record<string, { tr: string; sym: string }> = {
  Sun: { tr: 'Güneş', sym: '☉' },
  Moon: { tr: 'Ay', sym: '☽' },
  Mercury: { tr: 'Merkür', sym: '☿' },
  Venus: { tr: 'Venüs', sym: '♀' },
  Mars: { tr: 'Mars', sym: '♂' },
  Jupiter: { tr: 'Jüpiter', sym: '♃' },
  Saturn: { tr: 'Satürn', sym: '♄' },
  Uranus: { tr: 'Uranüs', sym: '♅' },
  Neptune: { tr: 'Neptün', sym: '♆' },
  Pluto: { tr: 'Plüton', sym: '♇' },
  NorthNode: { tr: 'Kuzey Düğümü', sym: '☊' },
  SouthNode: { tr: 'Güney Düğümü', sym: '☋' },
  Chiron: { tr: 'Kiron', sym: '⚷' },
  Lilith: { tr: 'Lilith (Kara Ay)', sym: '⚸' },
  Ascendant: { tr: 'Yükselen', sym: 'ASC' }
};

// Tarihsel Kaynaklı Kadim Ağaç & Ortam Aromaterapisi Eşleşmeleri (Culpeper & Agrippa)
export const PLANET_HERB_MAP: Record<string, PlanetBotanical> = {
  Sun: {
    tree: 'Defne & Meşe Ağacı',
    essentialOil: 'Biberiye & Bergamot',
    theme: 'Solar Pleksus canlılığı, irade ve kalp neşesini canlandırır.'
  },
  Moon: {
    tree: 'Söğüt Ağacı & Nilüfer',
    essentialOil: 'Yasemin & Sandal Ağacı',
    theme: 'Duygusal akış, bilinçaltı dinginliği ve sezgisel denge sağlar.'
  },
  Mercury: {
    tree: 'Huş & Fındık Ağacı',
    essentialOil: 'Lavanta & Nane',
    theme: 'Zihinsel odaklanma, berraklık ve hakikat ifadesini açar.'
  },
  Venus: {
    tree: 'Mersin & Elma Ağacı',
    essentialOil: 'Şam Gülü & Itır',
    theme: 'Kalp çakrası şifası, şefkat ve estetik uyumu yeşertir.'
  },
  Mars: {
    tree: 'Alıç & Çam Ağacı',
    essentialOil: 'Sedir & Çam Reçinesi',
    theme: 'Köklenme, yapıcı cesaret, dayanıklılık ve canlılık kazandırır.'
  },
  Jupiter: {
    tree: 'Ulu Meşe & Ihlamur Ağacı',
    essentialOil: 'Akgünlük (Frankincense) & Misk Adaçayı',
    theme: 'Bilinç genişlemesi, 3. göz sezgisi ve ruhsal bilgeliği uyarır.'
  },
  Saturn: {
    tree: 'Servi & Porsuk Ağacı',
    essentialOil: 'Mür (Myrrh), Paçuli & Vetiver',
    theme: 'Sağlıklı sınırlar, sabır, disiplin ve güçlü topraklanma inşa eder.'
  },
  Uranus: {
    tree: 'Dişbudak Ağacı (Yggdrasil)',
    essentialOil: 'Çay Ağacı & Nane',
    theme: 'Elektriksel sinir sistemi rahatlaması ve yüksek uyanış sağlar.'
  },
  Neptune: {
    tree: 'Lübnan Sediri & Lotus',
    essentialOil: 'Lotus & Saf Günlük',
    theme: 'Psişik arınma, aurik kalkan ve ilahi teslimiyet frekansı verir.'
  },
  Pluto: {
    tree: 'Nar Ağacı & Porsuk',
    essentialOil: 'Vetiver & Mürrüsafi',
    theme: 'Hücresel yenilenme, derin detoks ve kökten dönüşüm gücü aşılar.'
  },
  NorthNode: {
    tree: 'Defne Ağacı',
    essentialOil: 'Akgünlük (Frankincense)',
    theme: 'Kadersel tekâmül rotasında berraklık ve yüksek amaca odaklanma sağlar.'
  },
  SouthNode: {
    tree: 'Selvi Ağacı',
    essentialOil: 'Paçuli & Mür',
    theme: 'Karmik tortuları toprağa iade edip hafifleme ve özgürleşme sağlar.'
  },
  Chiron: {
    tree: 'Zeytin & Mürver Ağacı',
    essentialOil: 'Helichrysum (Ölmez Çiçek) & Lavanta',
    theme: 'Ruh ve kalp yaralarını hücresel olarak onarma bilgeliğini uyandırır.'
  },
  Lilith: {
    tree: 'Ardıç Ağacı & Yabani Gül',
    essentialOil: 'Ardıç & Mür',
    theme: 'Gölge benliği arındırma ve ilksel içsel gücü özgürleştirme frekansı verir.'
  },
  Ascendant: {
    tree: 'Sedir Ağacı',
    essentialOil: 'Bergamot & Günlük',
    theme: 'Biyofiziksel beden aurasını güçlendirme ve koruyucu kalkan örer.'
  }
};

// 13 Gezegenin Tarafsız İçe Yönelimli (Yin) vs Dışa Yönelimli (Yang) Dinamik Profilleri
interface DynamicProfile {
  theme: string;
  inward: {
    manifestation: string;
    neutralExplanation: string;
    actionableRemedy: string;
    kabbalahLesson: string;
  };
  outward: {
    manifestation: string;
    neutralExplanation: string;
    actionableRemedy: string;
    kabbalahLesson: string;
  };
}

const PLANET_DYNAMIC_PROFILES: Record<string, DynamicProfile> = {
  Sun: {
    theme: 'Benlik, Yaşam Amacı ve Özgün İfade',
    inward: {
      manifestation: 'Kendi ışığını ve potansiyelini geri planda tutma, yetersizlik hissiyle görünür olmaktan çekinme.',
      neutralExplanation: 'Güneş enerjiniz içselleşmiş durumdadır. Başkalarının takdirine bağımlı kalmadan kendi içsel merkezinde güç toplama refleksiniz vardır.',
      actionableRemedy: 'Işığınızı saklamayı bırakın; %70 hazır hissetseniz bile sahneye çıkıp varlığınızı ortaya koyun.',
      kabbalahLesson: 'Tiferet merkezinde içsel güneşi uyandırmak ve ilahi kıvılcımı korkusuzca parlatmak.'
    },
    outward: {
      manifestation: 'Aşırı onaylanma ihtiyacı, ortamı sürekli domine etme ve sahneyi başkalarına bırakmakta zorlanma.',
      neutralExplanation: 'Güneş enerjiniz dışa taşarak çalışmaktadır. Varlığınızı dış dünyanın gözünde onaylatma ve sürekli merkezde olma refleksi taşır.',
      actionableRemedy: 'Değerinizi dışsal alkışlarla ölçmeyin; başkalarına da parlayabilecekleri alanlar açarak gerçek liderliği gösterin.',
      kabbalahLesson: 'Tiferet sefirasındaki dengeyi korumak; egonun parıltısını başkalarını aydınlatmak için kullanmak.'
    }
  },
  Moon: {
    theme: 'Duygusal Hafıza, Güvenlik İhtiyacı ve Bilinçaltı',
    inward: {
      manifestation: 'Duygusal donma, hisleri içine atıp yok sayma ve aşırı rasyonelleştirerek kabuğuna çekilme.',
      neutralExplanation: 'Ay enerjisi içeriye akmaktadır. Kırılmaktan veya savunmasız görünmekten çekindiğiniz için duyguları kendi içinizde işleyip dışarıya duvar örersiniz.',
      actionableRemedy: 'Kırılganlığınızı bir zaaf değil, derin bir bağ kurma kapısı olarak görün; güven duyduğunuz kişilere hislerinizi açın.',
      kabbalahLesson: 'Yesod (Temel) küresinde bilinçaltı barajlarını açmak ve hislerin akışına teslim olmak.'
    },
    outward: {
      manifestation: 'Duygusal dalgalanmalar, hisleriyle ortamı etkileme, aşırı korumacı veya bağımlı olma eğilimi.',
      neutralExplanation: 'Ay enerjisi dışa yansıtılarak çalışmaktadır. İçinizdeki duygusal gelgitleri doğrudan ilişkilerinize ve çevreye yansıtma refleksiniz vardır.',
      actionableRemedy: 'Duygusal dalgalanmalarınızı başkalarının sorumluluğu yapmayın; hislerinizi gözlemleyip kendi iç merkezinizde sakinleştirin.',
      kabbalahLesson: 'Yesod aynamızı temiz tutmak ve başkalarının duygusal yüklerini üzerimize almamak.'
    }
  },
  Mercury: {
    theme: 'Zihinsel İfade, İletişim ve Hakikat',
    inward: {
      manifestation: 'Fikrini söyleyememe, sessiz kalarak içsel zihinsel fırtınalarda kaybolma ve aşırı analiz felci.',
      neutralExplanation: 'Merkür zihniniz içsel bir döngüde çalışmaktadır. Düşünceler dışarıya dökülmek yerine iç diyalogda defalarca tartılır ve suskunluk doğar.',
      actionableRemedy: 'Zihninizdeki kelimeleri hapsetmeyin; düşüncelerinizi yazarak veya sakin bir tonla doğrudan ifade etmeye başlayın.',
      kabbalahLesson: 'Hod (Zihinsel Görkem) dünyasındaki dili serbest bırakmak ve gerçeği korkusuzca konuşmak.'
    },
    outward: {
      manifestation: 'Fikirleri dayatma, keskin ve eleştirel sözler, aşırı konuşma veya sözcüklerle manipülasyon.',
      neutralExplanation: 'Merkür zihniniz doğrudan dışa fışkırmaktadır. Zihinsel hızınızı ve ikna gücünüzü dış dünyayı şekillendirmek için kullanırsınız.',
      actionableRemedy: 'Haklı olsanız dahi dinlemeyi öğrenin; kelimelerinizi başkalarını alt etmek için değil, anlamak için kullanın.',
      kabbalahLesson: 'Hod sefirasının zekasını alçakgönüllülük ve şefkatle dengelemek.'
    }
  },
  Venus: {
    theme: 'Öz Değer, Sevgi, İlişki ve Denge',
    inward: {
      manifestation: 'Kendini sevilmeye layık görememe, sınırları feda edip başkaları için tükenme ve ilişkide kendini unutma.',
      neutralExplanation: 'Venüs enerjiniz içselleşmiştir. Sevgiyi dışarıdan hak etmek zorunda olduğunuz inancıyla kendi ihtiyaçlarınızı arka plana itersiniz.',
      actionableRemedy: 'Önce kendi öz sevginizi ve sınırlarınızı inşa edin; "hayır" diyebilmek sevginin değerini azaltmaz.',
      kabbalahLesson: 'Netzach (Duygusal Zafer) küresinde kendi değerini ilahi bir armağan olarak kabul etmek.'
    },
    outward: {
      manifestation: 'Sevgiyi bir pazarlık unsuru yapma, aşırı beklentiler, sahiplenme veya yüzeysel beğenilme bağımlılığı.',
      neutralExplanation: 'Venüs enerjiniz dış dünyaya odaklıdır. Değer duygunuzu başkalarının size sunduğu ilgi ve estetik onay üzerinden ararsınız.',
      actionableRemedy: 'Sevgiyi bir pazarlık olmaktan çıkarın; gerçek bağın onaylanmaktan değil, saf kabullenmeden doğduğunu fark edin.',
      kabbalahLesson: 'Netzach sefirasında aşkı bencilce tutkudan arındırıp koşulsuz bir armağana dönüştürmek.'
    }
  },
  Mars: {
    theme: 'Eylem, İrade, Cesaret ve Sınır Koruma',
    inward: {
      manifestation: 'Harekete geçmekte tereddüt, öfkeyi içeri gömme, pasif-agresif birikimler ve gücünü ortaya koymaktan çekinme.',
      neutralExplanation: 'Mars enerjisi içeriye kilitlenmiştir. Çatışmaktan veya başkalarını incitmekten çekindiğiniz için enerjinizi eyleme dökmek yerine kendi içinizde baskılarsınız.',
      actionableRemedy: 'Öfkenizi bir düşman gibi görmeyin; onu yaratıcı disipline ve bedensel spora yönlendirerek sınırlarınızı net çizin.',
      kabbalahLesson: 'Gevurah (İlahi Güç) enerjisini korkusuzca eyleme dönüştürmek ve kendi egemenliğini savunmak.'
    },
    outward: {
      manifestation: 'Kontrolsüz fevrilik, ani sabırsızlık, sınırları aşarak başkalarına baskı kurma ve aceleci eylemler.',
      neutralExplanation: 'Mars enerjisi doğrudan dışarıya patlamaktadır. Engellerle karşılaştığınızda iradenizi zorlayarak ortamı kontrol etme eğiliminiz vardır.',
      actionableRemedy: 'Durup nefes almayı öğrenin; gücünüzü başkalarını ezmek veya hızlandırmak için değil, korumak için kullanın.',
      kabbalahLesson: "Gevurah'ın sertliğini merhamet (Chesed) ile yumuşatmak ve yapıcı bir liderlik inşa etmek."
    }
  },
  Jupiter: {
    theme: 'İnanç, Genişleme, Vizyon ve Kadersel Bolluk',
    inward: {
      manifestation: 'Kendi şansına inanmama, derin içsel boşluk, evrenin desteğine güvenmekte zorlanma ve şüphecilik.',
      neutralExplanation: 'Jüpiter vizyonunuz içsel sorgulamalarla çalışmaktadır. Dışsal dogmalara güvenmeyip her hakikati kendi iç süzgecinizden geçirme ihtiyacınız vardır.',
      actionableRemedy: 'Aşırı kuşkuculuğu bırakıp akışa güvenin; hayatın sunduğu küçük fırsatların büyük kapılar açacağını kabul edin.',
      kabbalahLesson: 'Chesed (İlahi Merhamet) kapısını açarak evrensel bolluğa içsel olarak izin vermek.'
    },
    outward: {
      manifestation: 'Ruhsal kibir, fanatizm, aşırı cüret, gerçekçi olmayan vaatler ve sınır tanımayan yayılma arzusu.',
      neutralExplanation: 'Jüpiter enerjisi dışa taşmaktadır. Kendi inançlarınızı ve vizyonunuzu mutlak doğru kabul edip başkalarına yayma refleksiniz yüksektir.',
      actionableRemedy: 'Her zaman öğrenci kalmayı bilin; tevazu olmadan büyüyen bilgelik kibre dönüşür.',
      kabbalahLesson: "Chesed'in sonsuz genişlemesini adalet ve sınır (Gevurah) ile dengede tutmak."
    }
  },
  Saturn: {
    theme: 'Sorumluluk, Kadersel Zaman ve Büyük Sınırlar',
    inward: {
      manifestation: 'Ağır suçluluk hissi, açıklanamaz yetersizlik, hata yapma korkusuyla felç olma ve kendi kendini cezalandırma.',
      neutralExplanation: 'Satürn disiplini içeriye yöneliktir. Dışarıdan kimse baskı yapmasa dahi kendi içinizde en acımasız yargıç olup kendinizi kısıtlarsınız.',
      actionableRemedy: 'Kusursuzluk takıntısını bırakın; zamanın sizin lehinize çalıştığını bilerek adımlarınızı sabırla atın.',
      kabbalahLesson: 'Binah (Kozmik Anlayış) derinliğini suçluluktan arındırıp olgun bir içsel bilgeliğe dönüştürmek.'
    },
    outward: {
      manifestation: 'Aşırı katılık, baskıcı kuralcılık, empati eksikliği ve başkalarını katı standartlarla yargılama.',
      neutralExplanation: 'Satürn enerjisi dış dünyaya bir otorite olarak yansımaktadır. Düzeni ve sınırları korumak adına çevrenize katı kurallar dayatabilirsiniz.',
      actionableRemedy: 'İnsanların hatalarını ve eksikliklerini hoşgörüyle karşılayın; gerçek otorite korkutarak değil, güven vererek kurulur.',
      kabbalahLesson: "Binah'ın kurallarını sevgiyle harmanlamak ve hayatın esnekliğine saygı duymak."
    }
  },
  Uranus: {
    theme: 'Özgünlük, Ani Uyanış ve Kalıpları Kırma',
    inward: {
      manifestation: 'İçsel huzursuzluk, dünyaya ve sisteme ait olamama hissi, özgünlüğünü bastırıp sıradanlaşmaya çalışma.',
      neutralExplanation: 'Uranüs uyanışı içsel gerilimler yaratmaktadır. Farklılığınızı ortaya koymaktan çekindiğinizde bu enerji içsel bir kaos olarak yaşanır.',
      actionableRemedy: 'Farklılığınızı bir kusur değil, dünyaya getirdiğiniz özgün bir hediye olarak kucaklayın.',
      kabbalahLesson: 'Chokhmah (İlahi Yıldırım) kıvılcımını zihinsel bir yaratıcılığa dönüştürmek.'
    },
    outward: {
      manifestation: 'Yıkıcı isyan, sebepsiz yere düzeni bozma, şok yaratma bağımlılığı ve uzlaşmaz tavırlar.',
      neutralExplanation: 'Uranüs enerjisi dış dünyaya ani patlamalar olarak yansır. Kuralları ve sınırları sırf isyan etmek için zorlama refleksi taşıyabilirsiniz.',
      actionableRemedy: 'Yıkmak kolay, inşa etmek bilgelik ister; isyanınızı yapıcı ve dönüştürücü projelere yönlendirin.',
      kabbalahLesson: "Chokhmah'ın asi gücünü ilahi amacın hizmetine sunmak."
    }
  },
  Neptune: {
    theme: 'Sezgi, İlahi Aşk, Birlik ve İllüzyon',
    inward: {
      manifestation: 'Gerçeklikten kaçış, psişik sünger gibi başkalarının acısını emip dağılma, kurban psikolojisi.',
      neutralExplanation: 'Neptün sınırları eriten enerjisiyle iç dünyanızda çalışır. Dünyanın sertliğinden korunmak için hayallere veya içsel inzivaya sığınırsınız.',
      actionableRemedy: 'Sınırlarınızı korumayı öğrenin; merhamet göstermek başkalarının acı denizinde boğulmak anlamına gelmez.',
      kabbalahLesson: "Keter'in saf ışığını dünyevi yaşamla birleştirip somut bir sanata veya duaya dönüştürmek."
    },
    outward: {
      manifestation: 'İllüzyon yaratma, insanları manevi beklentilerle yanıltma, kendini kurtarıcı zannedip gerçeklikten kopma.',
      neutralExplanation: 'Neptün enerjisi dışarıya idealleştirilmiş beklentiler olarak yansır. İnsanları ve olayları oldukları gibi değil, hayalinizdeki gibi görmek istersiniz.',
      actionableRemedy: 'Gerçekleri olduğu gibi görme cesaretini gösterin; hayallerinizi ayakları yere basan bir vizyonla buluşturun.',
      kabbalahLesson: "Keter'in berraklığını illüzyonlardan arındırmak ve saf hakikate teslim olmak."
    }
  },
  Pluto: {
    theme: 'Dönüşüm, Kökten Yeniden Doğuş ve Kudret',
    inward: {
      manifestation: 'Güçsüz düşmekten dehşet duyma, derin kaybetme korkusu, gizli şüphe ve her şeyin arkasında tehlike sezme.',
      neutralExplanation: 'Plüton dönüşümü bilinçaltı derinliklerinizde çalışmaktadır. Kontrolü kaybetme korkusu sebebiyle en derin hislerinizi kilit altında tutarsınız.',
      actionableRemedy: 'Bilinmeyene güvenmeyi öğrenin; kontrolü bıraktığınızda hayatın sizi en güvenli şekilde dönüştüreceğini bilin.',
      kabbalahLesson: 'Daat (Kozmik Uçurum) eşiğini cesaretle geçmek ve korkunun altındaki ilahi kudreti keşfetmek.'
    },
    outward: {
      manifestation: 'Mutlak kontrol saplantısı, krizleri ve insanları manipüle etme arzusu, güç savaşları.',
      neutralExplanation: 'Plüton enerjisi dış dünyaya bir güç alanı kurma refleksiyle akar. Ortamda veya ilişkide zayıf görünmemek için ipleri elinizde tutmak istersiniz.',
      actionableRemedy: 'Güç başkalarını kontrol etmekten değil, kendi zayıflıklarınızı kabul edip dönüşmekten doğar.',
      kabbalahLesson: "Daat'ın karanlığını egoyu yok etmek ve saf küllerinden doğan bir şifacıya dönüşmek için kullanmak."
    }
  },
  Chiron: {
    theme: 'Ruhsal Yara, Şifacı Bilgelik ve Kabul',
    inward: {
      manifestation: 'Kendi yarasını herkesten saklama, şifayı ve yardımı reddetme, içsel bir yalnızlık içinde acıyı taşıma.',
      neutralExplanation: 'Kiron yarası kendi içinize gömülüdür. Zayıf veya eksik görünmemek için yaranızı kimseye göstermeden tek başınıza başa çıkmaya çalışırsınız.',
      actionableRemedy: 'Yaranızı bir kusur gibi saklamayın; yardımı kabul etmek ruhsal büyümenin ilk adımıdır.',
      kabbalahLesson: 'Tiferet ile Yesod arasındaki köprüyü şifalandırmak ve kalbin yaralı yerinden ışığın sızdığını görmek.'
    },
    outward: {
      manifestation: 'Kendi yarası kanarken başkalarını kurtarma çılgınlığı, sürekli kurtarıcı rolüne soyunup tükenme.',
      neutralExplanation: 'Kiron enerjisi dışa doğru akar. Kendi yaranızla yüzleşmemek için dikkatinizi sürekli başkalarının dertlerini çözmeye yönlendirirsiniz.',
      actionableRemedy: 'Önce kendi kabınızı doldurun; kendinize vermediğiniz şifayı başkasına kalıcı olarak veremezsiniz.',
      kabbalahLesson: 'Yaralı şifacı arketipini dengelemek ve önce kendi ruhunu kucaklamak.'
    }
  },
  NorthNode: {
    theme: 'Gelecek Tekâmül Rotası ve Dharma Hedefi',
    inward: {
      manifestation: 'Geçmişin tanıdık konfor alanından çıkamama, geleceğe adım atmakta tereddüt ve kendi kaderinden çekinme.',
      neutralExplanation: 'Kuzey Düğümü çağrısı içsel bir arayış olarak çalışır. Ruhu çağıran hedefe doğru adım atmakta eski güvenlik alanının ağırlığı hissedilir.',
      actionableRemedy: 'Konfor alanınızın sınırlarını genişletin; bilinmeyene doğru atacağınız küçük bir adım bile kadersel bir ivme yaratacaktır.',
      kabbalahLesson: 'Keter yoluna doğru adım adım yükselmek ve ruhsal amaca sadakat göstermek.'
    },
    outward: {
      manifestation: 'Hazırlıksızca geleceğe atılma, geçmişin deneyimlerini ve köklerini yok sayarak aşırı sabırsız bir hedef arayışı.',
      neutralExplanation: 'Kuzey Düğümü dışsal bir hırs ve koşu gibi çalışır. Hedefe ulaşmak adına geçmişin temel taşlarını atlamak isteyebilirsiniz.',
      actionableRemedy: 'Geçmişin bilgeliğini ve köklerini unutmayın; geleceğe sağlam kökler üzerinden yürüyün.',
      kabbalahLesson: 'Keter zirvesine tırmanırken Malkhut temelini sağlam tutmak.'
    }
  },
  SouthNode: {
    theme: 'Geçmiş Yaşam Sermayesi ve Kök Hafıza',
    inward: {
      manifestation: 'Eski tanıdık reflekslere ve geçmiş duygusal kalıplara hapsolma, yenilik karşısında geçmişe sığınma.',
      neutralExplanation: 'Güney Düğümü bilinçaltı bir sığınak gibi çalışır. Kriz veya stres anlarında geçmişten getirdiğiniz otomatik davranışlara çekilirsiniz.',
      actionableRemedy: 'Eski kalıplarınız bir sığınak değil, bir sermayedir; onları yeniyi beslemek için kullanın ama orada takılı kalmayın.',
      kabbalahLesson: 'Malkhut temeline saygı duymak ama ruhu orada hapis bırakmamak.'
    },
    outward: {
      manifestation: 'Geçmişten getirdiği yetenek veya gücü bu hayatta da tek otorite olarak dayatma, yeni öğrenmelere direnç gösterme.',
      neutralExplanation: 'Güney Düğümü dışsal bir alışkanlık ve ustalık kalkanı olarak çalışır. Zaten iyi bildiğiniz alanda kalıp çevreyi buradan yönetmek istersiniz.',
      actionableRemedy: 'Eski ustalığınızı bir taht gibi kullanmayın; bilmediğiniz alanlarda da çırak kalma cesareti gösterin.',
      kabbalahLesson: 'Geçmişin meyvelerini geleceğin bahçesini yeşertmek için toprağa ekmek.'
    }
  },
  Lilith: {
    theme: 'Bastırılmış Vahşi Doğa, Tabular ve Gölge Güç',
    inward: {
      manifestation: 'Gerçek arzu ve öfkesini derine gömme, başkalarını memnun etmek adına otantik özünden ödün verme.',
      neutralExplanation: 'Lilith enerjiniz içselleşmiş bir gölge gibi çalışır. Kendi tabularınızla sessizce hesaplaşma ve yaralanmamak için derinlere çekilme refleksi taşır.',
      actionableRemedy: 'Kendi sınırlarınızı net çizin; başkalarını memnun etmek için otantik vahşi doğanızı bastırmayı bırakın.',
      kabbalahLesson: 'Karanlık aynanın ardındaki ilahi ışığı tanımak ve gölgeyi bilince entegre etmek.'
    },
    outward: {
      manifestation: 'Aşırı isyankarlık, otoriteye ani ve yıkıcı başkaldırı, en ufak kısıtlamada köprüleri yakma.',
      neutralExplanation: 'Lilith enerjiniz dışa taşarak çalışır. Kendi bağımsızlığını koruma refleksiyle tabuları provokatif ve ödünsüz şekilde yıkma dürtüsü verir.',
      actionableRemedy: 'İsyanınızı kör bir yıkıma değil yaratıcı bağımsızlığa dönüştürün; her durumu ölüm-kalım savaşına çevirmeyin.',
      kabbalahLesson: 'Gevurah\'ın sınır gücü ile Lilith\'in ham dişil kudretini kutsal dengede tutmak.'
    }
  }
};

export const TURKISH_CENTER_TO_CODE: Record<string, string> = {
  'Tepe (Taç)': 'Head',
  'Ajna (Zihin)': 'Ajna',
  'Boğaz': 'Throat',
  'Benlik (G)': 'G',
  'Kalp (Ego)': 'Heart',
  'Sakral': 'Sacral',
  'Kök': 'Root',
  'Dalak': 'Spleen',
  'Solar Pleksus': 'SolarPlexus'
};

const YANG_PLANETS = ['Sun', 'Mars', 'Jupiter', 'Uranus', 'Pluto'];
const YIN_PLANETS = ['Moon', 'Venus', 'Neptune', 'Saturn', 'Lilith'];
const FIRE_AIR_SIGNS = ['Koç', 'İkizler', 'Aslan', 'Terazi', 'Yay', 'Kova', 'Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius'];
const YANG_HOUSES = [1, 3, 5, 7, 9, 10, 11];

export function normalizePlanetKey(name: string): string {
  if (!name) return 'Sun';
  const clean = name.trim().toLowerCase();
  
  if (clean.includes('lilith')) return 'Lilith';
  
  if (clean.includes('kuzey') || clean.includes('northnode') || clean.includes('true node') || clean === 'node') return 'NorthNode';
  if (clean.includes('güney') || clean.includes('southnode')) return 'SouthNode';
  if (clean.includes('güneş') || clean === 'sun') return 'Sun';
  if (clean === 'ay' || clean === 'moon') return 'Moon';
  if (clean.includes('merkür') || clean === 'mercury') return 'Mercury';
  if (clean.includes('venüs') || clean === 'venus') return 'Venus';
  if (clean === 'mars') return 'Mars';
  if (clean.includes('jüpiter') || clean === 'jupiter') return 'Jupiter';
  if (clean.includes('satürn') || clean === 'saturn') return 'Saturn';
  if (clean.includes('uranüs') || clean === 'uranus') return 'Uranus';
  if (clean.includes('neptün') || clean === 'neptune') return 'Neptune';
  if (clean.includes('plüton') || clean.includes('pluto')) return 'Pluto';
  if (clean.includes('kiron') || clean.includes('chiron')) return 'Chiron';
  if (clean.includes('yükselen') || clean.includes('asc')) return 'Ascendant';
  if (clean.includes('tepe') || clean.includes('mc')) return 'Midheaven';
  if (clean.includes('dünya') || clean === 'earth') return 'Earth';
  
  return name;
}

export function synthesizeCosmicMatrix(
  astroPlanets: PlanetaryInput[],
  astroAspects: AspectInput[],
  hdChart: HDChartInput
): CosmicMatrixReport {
  const items: CosmicMatrixItem[] = [];
  const planetaryDynamics: PlanetaryDynamicDiagnosis[] = [];

  const worldCounts: Record<string, number> = {
    Assiah: 0,
    Yetzirah: 0,
    Beriyah: 0,
    Atzilut: 0
  };

  // Eğer Güney Düğümü eksikse Kuzey Düğümünden otomatik türet
  let effectivePlanets = [...astroPlanets];
  const hasSouthNode = effectivePlanets.some(p => normalizePlanetKey(p.name) === 'SouthNode');
  const northNode = effectivePlanets.find(p => normalizePlanetKey(p.name) === 'NorthNode');
  if (!hasSouthNode && northNode) {
    const oppHouse = ((northNode.house + 5) % 12) + 1;
    effectivePlanets.push({
      name: 'Güney Düğümü',
      sign: 'Kök Hafıza',
      house: oppHouse,
      degree: northNode.degree,
      isRetrograde: true,
      longitude: ((northNode.longitude || 0) + 180) % 360
    });
  }

  effectivePlanets.forEach((p) => {
    const normKey = normalizePlanetKey(p.name);
    const meta = PLANET_NAMES_TR[normKey] || { tr: p.name, sym: '✧' };
    const kabbalahMeta = PLANET_KABBALAH_MAP[normKey] || {
      sephira: 'Tiferet',
      sephiraMeaning: 'Kalp ve Bilinç',
      defaultWorld: 'Beriyah'
    };

    // 4 Âlem Tespiti
    let assignedWorld: 'Assiah' | 'Yetzirah' | 'Beriyah' | 'Atzilut' = kabbalahMeta.defaultWorld;
    if ([1, 2, 6, 10].includes(p.house)) assignedWorld = 'Assiah';
    else if ([3, 4, 7, 8].includes(p.house)) assignedWorld = 'Yetzirah';
    else if ([5, 9, 11].includes(p.house)) assignedWorld = 'Beriyah';
    else if (p.house === 12) assignedWorld = 'Atzilut';
    worldCounts[assignedWorld] = (worldCounts[assignedWorld] || 0) + 1;

    // Human Design Eşleşmesi (Doğru İngilizce normKey ile arama)
    const hdCon = hdChart.conscious.find((c) => c.planet === normKey);
    const hdUnc = hdChart.unconscious.find((u) => u.planet === normKey);
    const activeGate = hdCon?.gate || hdUnc?.gate || (Math.floor(Math.random() * 64) + 1);
    const activeLine = hdCon?.line || hdUnc?.line || 3;
    const gateInfo = GATE_TITLES[activeGate] || {
      title: 'Kozmik Kapı',
      gift: 'Denge ve Farkındalık',
      shadow: 'Korku ve Direnç'
    };

    const centerName = GATE_TO_CENTER[activeGate] || 'Solar Pleksus';
    const centerCode = TURKISH_CENTER_TO_CODE[centerName] || centerName;
    const isCenterDefined = hdChart.definedCenters.some(dc => 
      dc.toLowerCase() === centerCode.toLowerCase() || 
      dc.toLowerCase() === centerName.toLowerCase()
    );
    const lineProfile = LINE_BEHAVIOR_PROFILES[activeLine] || LINE_BEHAVIOR_PROFILES[1];

    // Rune Eşleşmesi (Doğru normKey ile)
    const runeName = PLANET_RUNE_MAP[normKey] || 'Algiz';
    const runeData = ALL_RUNES.find((r) => r.name.toLowerCase() === runeName.toLowerCase()) || ALL_RUNES[0];

    // Açı Listesi
    const pAspects = astroAspects
      .filter((a) => a.planet1 === p.name || a.planet2 === p.name || normalizePlanetKey(a.planet1) === normKey || normalizePlanetKey(a.planet2) === normKey)
      .map((a) => {
        const other = (a.planet1 === p.name || normalizePlanetKey(a.planet1) === normKey) ? a.planet2 : a.planet1;
        return `${other} ile ${a.type}`;
      });

    // Çakra (Doğru normKey ile)
    const chakraMeta = PLANET_CHAKRA_MAP[normKey] || { name: 'Kalp Çakrası', location: 'Göğüs' };

    // 🎯 ÇOK KATMANLI ENERJİ ÇALIŞMA YÖNÜ TESPİTİ (İçe Yönelimli vs Dışa Yönelimli)
    let score = 0;

    // 1. Gezegen temel doğası
    if (YANG_PLANETS.includes(normKey)) score += 2;
    else if (YIN_PLANETS.includes(normKey)) score -= 2;
    else if (normKey === 'NorthNode') score += 1;
    else if (normKey === 'SouthNode') score -= 1;

    // 2. Burç Elementi (Ateş/Hava = Yang, Toprak/Su = Yin)
    const isFireOrAir = p.sign ? FIRE_AIR_SIGNS.some(s => p.sign.toLowerCase().includes(s.toLowerCase())) : false;
    if (isFireOrAir) score += 1;
    else score -= 1;

    // 3. Ev Pozisyonu (1, 3, 5, 7, 9, 10, 11 = Yang; 2, 4, 6, 8, 12 = Yin)
    if (YANG_HOUSES.includes(p.house)) score += 1;
    else score -= 1;

    // 4. Human Design Tanımlı Merkez & Çizgi
    if (isCenterDefined) score += 1;
    else score -= 1;

    if ([4, 5, 6].includes(activeLine)) score += 1;
    else score -= 1;

    // 5. Retro Durumu (Retrograde içe dönük çalışmayı kesinleştirir/derinleştirir)
    if (p.isRetrograde) score -= 3;

    // Karar: Pozitif ise Yang (Dışa Yönelimli), Negatif ise Yin (İçe Yönelimli)
    const energyDirection: EnergyDirection = score > 0 
      ? 'outward' 
      : score < 0 
        ? 'inward' 
        : (YANG_PLANETS.includes(normKey) ? 'outward' : 'inward');

    const profile = PLANET_DYNAMIC_PROFILES[normKey] || PLANET_DYNAMIC_PROFILES['Sun'];
    const activeDynamic = energyDirection === 'outward' ? profile.outward : profile.inward;

    items.push({
      planetKey: normKey,
      planetName: meta.tr,
      symbol: meta.sym,
      astrology: {
        sign: p.sign,
        house: p.house,
        isRetrograde: !!p.isRetrograde,
        aspects: pAspects
      },
      kabbalah: {
        world: assignedWorld,
        worldTitle: assignedWorld === 'Assiah' ? 'Assiah (Eylem & Beden Âlemi)'
          : assignedWorld === 'Yetzirah' ? 'Yetzirah (Duygu & Astral Âlem)'
          : assignedWorld === 'Beriyah' ? 'Beriyah (Zihin & Yaratım Âlemi)'
          : 'Atzilut (İlahi Kudret & Birlik Âlemi)',
        sephira: kabbalahMeta.sephira,
        sephiraMeaning: kabbalahMeta.sephiraMeaning
      },
      humanDesign: {
        gate: activeGate,
        gateName: gateInfo.title,
        line: activeLine,
        lineArchetype: lineProfile.archetype,
        center: centerName,
        isDefined: isCenterDefined,
        gift: gateInfo.gift,
        shadow: gateInfo.shadow
      },
      rune: {
        name: runeData.name,
        symbol: runeData.symbol,
        element: runeData.element,
        stone: runeData.stone,
        meaning: runeData.meaning,
        guidance: runeData.usage
      },
      chakra: chakraMeta,
      botanical: PLANET_HERB_MAP[normKey] || PLANET_HERB_MAP.Sun,
      dynamic: {
        direction: energyDirection,
        summary: activeDynamic.manifestation
      }
    });

    // Tüm gezegenler için detaylı dinamik teşhisi ekle
    planetaryDynamics.push({
      planetKey: normKey,
      planetName: meta.tr,
      symbol: meta.sym,
      sign: p.sign,
      house: p.house,
      isRetrograde: !!p.isRetrograde,
      gate: activeGate,
      line: activeLine,
      center: centerName,
      isCenterDefined,
      energyDirection,
      directionTitle: energyDirection === 'inward' 
        ? 'İçe Yönelimli Dinamik (Yin / İçselleştirilmiş Çalışma)' 
        : 'Dışa Yönelimli Dinamik (Yang / Dışsallaştırılmış Çalışma)',
      archetypeTheme: profile.theme,
      activeManifestation: activeDynamic.manifestation,
      neutralExplanation: activeDynamic.neutralExplanation,
      kabbalahSephira: kabbalahMeta.sephira,
      kabbalahWorld: assignedWorld,
      kabbalahLesson: activeDynamic.kabbalahLesson,
      balancingRune: {
        name: runeData.name,
        symbol: runeData.symbol,
        element: runeData.element,
        stone: runeData.stone,
        meaning: runeData.meaning,
        balancingAction: runeData.usage
      },
      botanical: PLANET_HERB_MAP[normKey] || PLANET_HERB_MAP.Sun,
      practicalRemedy: activeDynamic.actionableRemedy
    });
  });

  // 4 Âlem Dağılımı
  const totalPoints = items.length || 1;
  const fourWorldsBalance: FourWorldsBalance = {
    assiah: {
      count: worldCounts.Assiah,
      percentage: Math.round((worldCounts.Assiah / totalPoints) * 100),
      theme: 'Fiziksel Beden, Somut Üretim, Para ve Pratik Disiplin'
    },
    yetzirah: {
      count: worldCounts.Yetzirah,
      percentage: Math.round((worldCounts.Yetzirah / totalPoints) * 100),
      theme: 'Duygusal Bağlar, Astral Hafıza, Sezgiler ve Kalp Çakrası'
    },
    beriyah: {
      count: worldCounts.Beriyah,
      percentage: Math.round((worldCounts.Beriyah / totalPoints) * 100),
      theme: 'Zihinsel Mimari, Yaratıcı Zeka, Felsefe ve Kadersel Kanunlar'
    },
    atzilut: {
      count: worldCounts.Atzilut,
      percentage: Math.round((worldCounts.Atzilut / totalPoints) * 100),
      theme: 'Saf Ruh, Birlik Bilinci, İlahi Kudret ve Kozmik Tekâmül'
    },
    dominantWorld: 'Assiah',
    growthWorld: 'Atzilut'
  };

  let maxW = 'Assiah';
  let maxV = -1;
  let minW = 'Atzilut';
  let minV = 999;
  Object.entries(worldCounts).forEach(([w, count]) => {
    if (count > maxV) { maxV = count; maxW = w; }
    if (count < minV) { minV = count; minW = w; }
  });
  fourWorldsBalance.dominantWorld = maxW;
  fourWorldsBalance.growthWorld = minW;

  // Kişiye Özel Kadim Rune Bağlama Mührü (Tılsım Formülü)
  // İçe dönük eğilimler çoğunluktaysa cesaret ve koruma, dışa dönükler çoğunluktaysa denge ve uyum
  const inwardCount = planetaryDynamics.filter(d => d.energyDirection === 'inward').length;
  let selectedBinding = runeBindingsData[0];

  if (inwardCount > planetaryDynamics.length / 2) {
    selectedBinding = runeBindingsData.find(b => b.id === 'korunma_tilsimi') || runeBindingsData[0];
  } else {
    selectedBinding = runeBindingsData.find(b => b.id === 'iliskide_denge') || runeBindingsData[2];
  }

  const personalTalisman: PersonalTalismanFormula = {
    title: `Kozmik Denge Mührü: ${selectedBinding.title}`,
    runesUsed: selectedBinding.runesUsed,
    symbols: selectedBinding.runesUsed.split(' - ').map(rName => {
      const match = ALL_RUNES.find(r => r.name.toLowerCase() === rName.trim().toLowerCase());
      return match ? match.symbol : 'ᚱ';
    }),
    purpose: selectedBinding.description,
    usageInstructions: selectedBinding.usageInstructions,
    kabbalisticBridge: `Bu tılsım, ${fourWorldsBalance.dominantWorld} âlemindeki aşırı yoğunluğu ${fourWorldsBalance.growthWorld} âlemine aktararak aura dengesini tesis eder.`,
    incenseAndHerbs: inwardCount > planetaryDynamics.length / 2
      ? 'Aura arındırıcı ve koruyucu Defne yaprağı & Sedir Ağacı tütsüsü eşliğinde uygulanması frekansı katbekat yükseltir.'
      : 'Kalp ferahlığı ve denge için Gül yaprakları & Akgünlük (Frankincense) tütsüsü eşliğinde uygulanması tesiri hızlandırır.'
  };

  return {
    items,
    planetaryDynamics,
    fourWorldsBalance,
    personalTalisman,
    coreLifeMission: {
      title: `${items[0]?.planetName || 'Güneş'} ile ${fourWorldsBalance.dominantWorld} Düzleminde Kozmik Tekâmül`,
      description: `Ruhunuz bu enkarnasyonda **${fourWorldsBalance.dominantWorld}** katmanının tecrübelerini tamamlayarak **${fourWorldsBalance.growthWorld}** âleminin yüksek idrakine sıçramak üzere kodlanmıştır. Haritanızdaki 13 gezegen enerjisini içe veya dışa taşırırken aşırılıklara kaçmadan, Human Design çizgilerinizin dehasını ve Rune mühürlerinizi denge anahtarı olarak kullanabilirsiniz.`,
      keyArchetype: `${items[0]?.humanDesign.lineArchetype || '3. Çizgi: Deneyimci'}`
    }
  };
}
