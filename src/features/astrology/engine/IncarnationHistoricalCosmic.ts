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

export interface StarPointInterpretation {
  title: string;
  esotericMeaning: string;
  lifeManifestation: string;
  spiritualMission: string;
}

export interface StarAlignment {
  starName: string;
  constellation: string;
  connectedPoint: string;
  orb: number;
  layer: 'Natal (Fiziksel)' | 'Drakonik (Ruh Haritası)' | 'Bilinçdışı Tasarım (Ruh Kökü)' | '3. Harita (Beriyah / Zihin)';
  frequencyBadge: string;
  isRoyalStar?: boolean;
  pointName?: string;
  interpretation?: StarPointInterpretation;
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
    name: 'Polaris (Alfa Ursae Minoris / Kutup Yıldızı)',
    longitude: 88.57, // 28°34' İkizler
    constellation: 'Küçük Ayı (Ursa Minor)',
    frequencyBadge: 'Polaris (Kozmik İstikamet & Kutup Direği)',
    mission: 'Kozmik pusula olma; fırtınalarda yönünü kaybeden ruhlara istikamet ve sarsılmaz ilahi nizam getirme görevi.',
    gift: 'Sarsılmaz içsel pusula, krizlerde anında doğru yönü bulma ve kitleleri savrulmaktan koruyan manevi ağırlık.',
    challenge: 'Aşırı katılık, esneyememe ve herkesin kendisi kadar kararlı olmasını beklemenin getirdiği hayal kırıklığı.'
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

export function generateStarPointInterpretation(
  starName: string,
  pointName: string,
  layer: string,
  orb: number
): StarPointInterpretation {
  const isSirius = starName.includes('Sirius');
  const isPolaris = starName.includes('Polaris');
  const isOrion = starName.includes('Orion') || starName.includes('Betelgeuse') || starName.includes('Rigel') || starName.includes('Bellatrix');
  const isAndromeda = starName.includes('Andromeda') || starName.includes('Mirach') || starName.includes('Alpheratz');
  const isPleiades = starName.includes('Pleiades') || starName.includes('Alcyone');
  const isArcturus = starName.includes('Arcturus');
  const isGalacticCenter = starName.includes('Galaktik Merkez');
  const isSpica = starName.includes('Spica');
  const isVega = starName.includes('Vega');
  const isCanopus = starName.includes('Canopus');

  const isAldebaran = starName.includes('Aldebaran');
  const isRegulus = starName.includes('Regulus');
  const isAntares = starName.includes('Antares');
  const isFomalhaut = starName.includes('Fomalhaut');

  const pLower = pointName.toLowerCase();
  const isVenus = pLower.includes('venüs') || pLower.includes('venus');
  const isVertex = pLower.includes('vertex');
  const isSun = pLower.includes('güneş') || pLower.includes('sun');
  const isMoon = pLower.includes('ay') || pLower.includes('moon');
  const isAsc = pLower.includes('yükselen') || pLower.includes('asc');
  const isMc = pLower.includes('tepe') || pLower.includes('mc');
  const isMars = pLower.includes('mars');
  const isMercury = pLower.includes('merkür') || pLower.includes('mercury');
  const isNeptune = pLower.includes('neptün') || pLower.includes('neptune');
  const isUranus = pLower.includes('uranüs') || pLower.includes('uranus');

  // 1. SIRIUS (Şİ'RA) ÖZEL KOMBİNASYONLARI
  if (isSirius) {
    if (isVenus) {
      return {
        title: "Sirius (Şi'ra) & Venüs: İlahi Kalp & Kozmik Şifa Kapısı",
        esotericMeaning: "Ruhunuzun ilahi aşk, değer ve estetik merkezi (Venüs), Kuran'da adı geçen tek yıldız olan Şi'ra'nın 6. boyut mavi ışık frekansıyla mühürlenmiştir. Bu kavuşum, Atlantis ve Antik Mısır tapınaklarında inisiye edilmiş şifacı ve bilgelik elçisi kıdemli ruhlarda görülür.",
        lifeManifestation: "Dünyevi sığ ilişkilere, menfaat bağlarına ve yüzeysel heveslere asla tahammül edemezsiniz. İlişkilerinizde aradığınız şey aslında ruh eşiniz değil, Sirius'taki kozmik ailenizin yüksek frekansıdır. Sanat, estetik, hücresel şifa ve insanlara karşılıksız sevgi akıtma konusunda doğal bir manyetizmanız vardır.",
        spiritualMission: "Dünyanın kaba ve bencil sevgi kalıplarını dönüştürmek; koşulsuz sevgi ve kadim şifa frekansını insan ilişkilerine demirlemek."
      };
    }
    if (isVertex) {
      return {
        title: "Sirius (Şi'ra) & Vertex (Vx): Kadersel Uyanış & İlahi Randevular Kapısı",
        esotericMeaning: "Astrolojide Vertex 'Kadersel Girdap Kapısı'dır; kişinin kendi iradesi dışındaki ilahi eşzamanlılıkları ve kadersel sıçramaları yönetir. Sirius ile kavuşumu, hayatınızın belirli dönemlerinde kadersel portalların aniden açılacağını gösterir.",
        lifeManifestation: "Karşınıza çıkan bazı kilit insanlar ve yaşadığınız ani kadersel karşılaşmalar asla rastlantı değildir. Bu karşılaşmalar, ruhunuzun derinliklerinde uyuyan kadim Sirius kodlarını uyandırmak üzere evrensel bir plan tarafından sahnelenir. Kriz gibi görünen dönüm noktaları sizi bir anda yüksek ruhsal misyonunuza taşır.",
        spiritualMission: "İlahi eşzamanlılıklara ve kadersel randevulara güvenmek; hayatın akışında karşınıza çıkan kozmik işaretleri okuyarak kitlelere pusula olmak."
      };
    }
    if (isAsc) {
      return {
        title: "Sirius (Şi'ra) & Yükselen (ASC): Mavi Işık Ruhsal Aurası",
        esotericMeaning: "Auranız doğrudan Sirius frekansıyla parlar. İnsanlar sizin yanınızda açıklayamadıkları bir huzur, saygı ve ruhsal arınma hissederler.",
        lifeManifestation: "Odaya girdiğinizde söz söylemeseniz dahi varlığınız ortamın frekansını yükseltir. Ruhsal kanallık ve sezgisel rehberlik yeteneğiniz çok güçlüdür.",
        spiritualMission: "Karanlık ortamlara ilahi ışığı ve yüksek Sirius bilgelik frekansını yaymak."
      };
    }
    return {
      title: `Sirius (Şi'ra) & ${pointName} İnisiyasyonu`,
      esotericMeaning: `Sirius'un kadim şifa ve ilahi rehberlik enerjisi haritanızdaki ${pointName} noktası üzerinden aktive olmaktadır. Ruhsal hafızanızda yüksek inisiyasyon bilgisi saklıdır.`,
      lifeManifestation: `${pointName} temsil ettiği yaşam alanında derin bir sezgisellik, sahtelikleri anında sezme ve ilahi adalet arayışı yaşarsınız.`,
      spiritualMission: "Dünyevi yanılsamaları aşıp Sirius'un kadim hakikat ışığını yeryüzüne aktarmak."
    };
  }

  // 2. POLARIS (KUTUP YILDIZI)
  if (isPolaris) {
    return {
      title: `Polaris (Kutup Yıldızı) & ${pointName}: Kozmik Pusula & Arşın Direği`,
      esotericMeaning: "Kutup Yıldızı, gökkubbenin ve arşın etrafında döndüğü sarsılmaz merkezdir. Haritanızdaki bu kavuşum, ruhunuzun fırtınalarda asla savrulmayan bir kozmik pusula olduğunu simgeler.",
      lifeManifestation: "Hayatınız boyunca krizler, kaoslar ve kitlelerin yönsüz kaldığı anlarda herkes içgüdüsel olarak size bakar. Doğal bir içsel istikametiniz vardır; insanlar sizin yanınızda güvende hisseder.",
      spiritualMission: "Karanlıkta yönünü kaybeden ruhlara istikamet vermek ve evrensel ilahi nizamı yeryüzünde temsil etmek."
    };
  }

  // 3. GALAKTİK MERKEZ
  if (isGalacticCenter) {
    return {
      title: `Galaktik Merkez & ${pointName}: Samanyolu Çekirdeğinden Kozmik Elçilik`,
      esotericMeaning: "Doğrudan Samanyolu'nun kalbinden gelen ilahi yayın frekansıdır. Ruhunuzun bilinci evrensel kaynak kodlara bağlıdır.",
      lifeManifestation: "Küçük dünyevi hedefler sizi asla doyurmaz. Doğrudan ilham ve vahiy gibi aniden gelen derin idraklere sahipsiniz. Bilgiyi kaynaktan doğrudan 'download' edersiniz.",
      spiritualMission: "Eski dar zihinsel kalıpları yıkıp kitleleri yeni galaktik bilinç çağına uyandırmak."
    };
  }

  // 4. KRALİYET YILDIZLARI
  if (isAldebaran) {
    return {
      title: `Aldebaran & ${pointName}: Başmelek Mikâil'in Hakikat Terazisi`,
      esotericMeaning: "Doğu Kraliyet Yıldızı Aldebaran, Başmelek Mikâil'in kozmik kılıcı ve hakikat terazisidir. Dürüstlük, sözün namusu ve ilahi adalet sınavıdır.",
      lifeManifestation: "Büyüleyici bir söz kudretine ve dürüstlüğe sahipsiniz. En ufak bir yalan veya hakkaniyetsizlik anında sistem sizi sınavlara çeker; doğru yolda kaldığınızda ise göksel bir koruma kalkanı verir.",
      spiritualMission: "Yeryüzünde hakikati ve ilahi adaleti tavizsiz savunmak."
    };
  }
  if (isRegulus) {
    return {
      title: `Regulus & ${pointName}: Başmelek Raphaël'in Asil Liderlik Mührü`,
      esotericMeaning: "Kuzey Kraliyet Yıldızı Regulus, Başmelek Raphaël'in şifa ve soylu liderlik kapısıdır. Asalet, cömertlik ve bağışlayıcılık sınavıdır.",
      lifeManifestation: "Doğal bir karizmanız ve kitleleri peşinizden sürükleme yeteneğiniz vardır. İntikam duygusundan arındığınız ve affedici olduğunuz sürece hayatınızda kadersel bir yükseliş vaat eder.",
      spiritualMission: "Güç ve liderliği egonun değil, ilahi adaletin ve şifanın hizmetine sunmak."
    };
  }
  if (isAntares) {
    return {
      title: `Antares & ${pointName}: Başmelek Azrail & Uriel'in Simya Kapısı`,
      esotericMeaning: "Batı Kraliyet Yıldızı Antares, ölüm ve yeniden doğumun, karanlığın kalbine inip ışıkla çıkmanın simyasıdır.",
      lifeManifestation: "Hayatınızda en büyük krizler ve yıkımlar, sizin en büyük gücünüze ve manevi uyanışınıza dönüşür. Korkusuz bir psikolojik ve okült algılama kabiliyetiniz vardır.",
      spiritualMission: "Karanlık ve kriz içindeki ruhları aydınlığa çıkarmak ve simyasal dönüşümü yönetmek."
    };
  }
  if (isFomalhaut) {
    return {
      title: `Fomalhaut & ${pointName}: Başmelek Cebrail'in Mistik Vizyon Kapısı`,
      esotericMeaning: "Güney Kraliyet Yıldızı Fomalhaut, Başmelek Cebrail'in ilahi vahyinin, sanatsal dehasının ve mistik rüyalarının kanalıdır.",
      lifeManifestation: "Geleceğe dair rüyalar, ilhamla gelen sanatsal deha ve derin bir mistik çekim. Niyetiniz saf olduğu sürece mucizevi eşzamanlılıklar yaşarsınız.",
      spiritualMission: "Manevi alemler ile dünya arasında sanatsal ve sezgisel bir köprü olmak."
    };
  }

  // 5. DİĞER GALAKTİK SABİT YILDIZLAR
  if (isOrion) {
    return {
      title: `Orion (${starName.split(' ')[0]}) & ${pointName}: Kadim Bilgelik & Işık Savaşçısı`,
      esotericMeaning: "Galaktik Işık ve Karanlık savaşlarından geçmiş, bilgeliğe ve kalp-akıl dengesine evrilen kıdemli ruh inisiyasyonu.",
      lifeManifestation: "Muazzam bir içsel direnç, haksızlıklara karşı sarsılmaz cesaret ve kriz anlarında anında stratejik çözüm üretebilme gücü.",
      spiritualMission: "Yeryüzünde adaleti, gerçeği ve ilahi dengeyi her ne pahasına olursa olsun savunmak."
    };
  }

  if (isPleiades) {
    return {
      title: `Pleiades (Ülker) & ${pointName}: 5. Boyut Kalp Çakrası Frekansı`,
      esotericMeaning: "5. Boyut koşulsuz sevgi, yüksek empati ve yaratıcı ışığı yeryüzüne tohumlama görevi.",
      lifeManifestation: "Aşırı duyarlılık, telepatik sezgiler, sanat, müzik ve hayvanlarla kelimesiz anlaşabilme yeteneği.",
      spiritualMission: "Dünyanın katılaşmış kalplerini sevgi, şefkat ve ilahi zarafetle yumuşatmak."
    };
  }

  if (isArcturus) {
    return {
      title: `Arcturus & ${pointName}: 5. Boyut Bilinç Mimarisi & Geometrik Şifa`,
      esotericMeaning: "İleri teknolojik zihin, geometrik şifa ve evrensel adalet frekansı.",
      lifeManifestation: "Karmaşık sistemleri ve krizleri anında geometrik bir netlikle çözme dehası, yüksek stratejik akıl.",
      spiritualMission: "Dünyanın ilkel ve hantal sistemlerini dönüştürerek yüksek ilahi nizamı kurmak."
    };
  }

  if (isAndromeda) {
    return {
      title: `Andromeda & ${pointName}: Kozmik Özgürlük & Boyut Gezginliği`,
      esotericMeaning: "Kozmik bağımsızlık, otoriter dogmaları kırma ve yeni bilinç kapılarını açma elçiliği.",
      lifeManifestation: "Baskılara asla boyun eğmeme, sınırlanamaz özgür irade ve vizyoner öncülük gücü.",
      spiritualMission: "Kozmik zincirleri kırmak ve insan bilincine özgürlük aşılamak."
    };
  }

  if (isCanopus) {
    return {
      title: `Canopus (Süheyl) & ${pointName}: Büyük Kozmik Seyyah & Ruhsal Kılavuz`,
      esotericMeaning: "Ruhların boyutlar arası yolculuklarında yön bulmalarını sağlayan kadim seyir yıldızı.",
      lifeManifestation: "En karmaşık labirentlerden bile selametle çıkabilme, insanlara hayat yolculuklarında manevi rehberlik etme kabiliyeti.",
      spiritualMission: "Yolunu kaybetmiş ruhlara deniz feneri gibi kılavuzluk etmek."
    };
  }

  // Genel Fallback
  return {
    title: `${starName.split(' ')[0]} & ${pointName} Kozmik Hizalanması`,
    esotericMeaning: `${starName} sabit yıldızının kadim frekansı, haritanızdaki ${pointName} noktasıyla ${orb}° orb ile rezonansa girmektedir.`,
    lifeManifestation: `Bu yaşam alanında sıradan dünyevi sınırların ötesinde bir çekim, derin bir ruhsal arayış ve kadersel sorumluluk hissedersiniz.`,
    spiritualMission: "Ruhunuzun geçmiş enkarnasyonlardan getirdiği kadim bilgiyi bu noktada dünya planına aktarmak."
  };
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
      const isKey = ['Güneş', 'Ay', 'Kuzey Ay Düğümü', 'Lilith', 'Venüs', 'Merkür', 'Mars'].includes(p.name);
      pointsToTest.push({
        name: `Drakonik ${p.name}`,
        longitude: p.longitude,
        weight: isKey ? 3.3 : 2.5,
        maxOrb: isKey ? 3.0 : 2.5,
        layer: 'Drakonik (Ruh Haritası)'
      });
    });
    if (draconicChart.houses && draconicChart.houses.length > 0) {
      const dAsc = draconicChart.houses.find(h => h.house === 1);
      if (dAsc) pointsToTest.push({ name: 'Drakonik Yükselen (ASC)', longitude: dAsc.longitude, weight: 3.2, maxOrb: 3.0, layer: 'Drakonik (Ruh Haritası)' });
      const dMc = draconicChart.houses.find(h => h.house === 10);
      if (dMc) pointsToTest.push({ name: 'Drakonik Tepe Noktası (MC)', longitude: dMc.longitude, weight: 2.8, maxOrb: 2.5, layer: 'Drakonik (Ruh Haritası)' });
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
      const isKey = ['Güneş', 'Ay', 'Venüs', 'Merkür', 'Mars', 'Lilith', 'Vertex (Vx)', 'Kuzey Ay Düğümü'].includes(p.name);
      pointsToTest.push({
        name: `3. Harita ${p.name}`,
        longitude: p.longitude,
        weight: isKey ? 2.3 : 1.6,
        maxOrb: isKey ? 3.0 : 2.2,
        layer: '3. Harita (Beriyah / Zihin)'
      });
    });
    if (beriyahChart.ascendant) {
      pointsToTest.push({
        name: '3. Harita Yükselen (ASC)',
        longitude: beriyahChart.ascendant.longitude,
        weight: 2.3,
        maxOrb: 3.0,
        layer: '3. Harita (Beriyah / Zihin)'
      });
    }
    if (beriyahChart.midheaven) {
      pointsToTest.push({
        name: '3. Harita Tepe Noktası (MC)',
        longitude: beriyahChart.midheaven.longitude,
        weight: 2.0,
        maxOrb: 2.5,
        layer: '3. Harita (Beriyah / Zihin)'
      });
    }
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
    if (starName.includes('Polaris')) return 'Polaris';
    if (starName.includes('Sirius') || starName.includes('Canopus')) return 'Sirius';
    if (starName.includes('Pleiades')) return 'Pleiades';
    if (starName.includes('Orion') || starName.includes('Rigel') || starName.includes('Betelgeuse') || starName.includes('Bellatrix')) return 'Orion';
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

  const CORE_STARSEED_FAMILIES = new Set(['Pleiades', 'Orion', 'Sirius', 'Arcturus', 'Andromeda', 'Vega', 'Polaris']);
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
      if (allMatches.some(m => m.family === 'Sirius') && f1 !== 'Sirius' && f2 !== 'Sirius') resonantAdditions.push('Sirius Işığı');
      if (allMatches.some(m => m.family === 'Galaktik Merkez')) resonantAdditions.push('Galaktik Merkez');
      if (sortedStarseedFamilies.length >= 3 && !resonantAdditions.includes(sortedStarseedFamilies[2].family)) {
        resonantAdditions.push(sortedStarseedFamilies[2].family);
      }
      if (royalActivations.length > 0) resonantAdditions.push(`${royalActivations[0].starName} Kalkanı`);

      if (resonantAdditions.length > 0) {
        frequencyBadge = `${hybridTitle} (${resonantAdditions.slice(0, 2).join(' & ')} Rezonanslı)`;
      } else {
        frequencyBadge = `${hybridTitle} (Çok Boyutlu Işık Tohumu)`;
      }

      const siriusMatch = allMatches.find(m => m.family === 'Sirius');
      const siriusExtra = siriusMatch ? ` Ayrıca ${siriusMatch.point.name} (${siriusMatch.point.layer}) üzerinden aktive olan kadim Sirius (Şi'ra) hattı, ruhunuzun hafızasında saklı olan Atlantis ve ezoterik bilgelik kodlarını uyandırmaktadır.` : '';

      soulMission = `${bestMatch.star.mission} Aynı zamanda ruhunuz ${f2} frekansıyla da melezlenmiş olup, iki galaktik bilinç arasında evrensel bir köprü kurma ve yüksek bilgiyi yeryüzüne sentezleme vazifesi taşımaktadır.${siriusExtra}`;
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

    // Tüm bireysel sabit yıldız temaslarını müstakil olarak koru ve her birine özel ezoterik anlam ata
    const allAlignmentsList: StarAlignment[] = allMatches.slice(0, 12).map(m => {
      const cleanConnectedPoint = `${m.point.name} ile ${m.orb}° orb`;
      const interpretation = generateStarPointInterpretation(m.star.name, m.point.name, m.point.layer, m.orb);
      return {
        starName: m.star.name,
        constellation: m.star.constellation,
        connectedPoint: cleanConnectedPoint,
        orb: m.orb,
        layer: m.point.layer,
        frequencyBadge: m.star.frequencyBadge,
        isRoyalStar: m.isRoyal,
        pointName: m.point.name,
        interpretation
      };
    });

    // İkincil yıldızları topla (en yüksek puanlı diğer yıldızlar)
    const seenStarNames = new Set<string>([bestMatch.star.name]);
    const uniqueSecondaryList: StarAlignment[] = [];
    for (const m of allMatches) {
      if (!seenStarNames.has(m.star.name)) {
        seenStarNames.add(m.star.name);
        uniqueSecondaryList.push({
          starName: m.star.name,
          constellation: m.star.constellation,
          connectedPoint: `${m.point.name} ile ${m.orb}° orb`,
          orb: m.orb,
          layer: m.point.layer,
          frequencyBadge: m.star.frequencyBadge,
          isRoyalStar: m.isRoyal,
          pointName: m.point.name,
          interpretation: generateStarPointInterpretation(m.star.name, m.point.name, m.point.layer, m.orb)
        });
      }
      if (uniqueSecondaryList.length >= 5) break;
    }

    return {
      isStarseed,
      starName: bestMatch.star.name,
      constellation: bestMatch.star.constellation,
      connectedPoint: `${bestMatch.point.name} ile Kavuşum (${bestMatch.orb}° orb)`,
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
