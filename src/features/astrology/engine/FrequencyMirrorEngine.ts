import { AstroPoint, NatalChartData, TransitAspect } from './AstrologyConstants';

export interface FrequencyMirrorResult {
  title: string;
  reason: string;
  explanation: string;
  currentTheme: string;
  themeCategory: string;
  transitSummary: string;
  cosmicChallenge: string;
  prominentAspect: string;
  natalHouse: number;
  houseThemeName: string;
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
  spectrum: {
    assiah: {
      level: 1;
      name: string;
      title: string;
      reaction: string;
      diagnosis: string;
      color: string;
      bgClass: string;
    };
    yetzirah: {
      level: 2;
      name: string;
      title: string;
      reaction: string;
      diagnosis: string;
      color: string;
      bgClass: string;
    };
    beriyah: {
      level: 3;
      name: string;
      title: string;
      reaction: string;
      diagnosis: string;
      color: string;
      bgClass: string;
    };
    atzilut: {
      level: 4;
      name: string;
      title: string;
      reaction: string;
      diagnosis: string;
      color: string;
      bgClass: string;
    };
  };
}

interface HouseInfo {
  name: string;
  domain: string;
  shadowKeyword: string;
  growthKeyword: string;
}

const HOUSE_MAP: Record<number, HouseInfo> = {
  1: {
    name: '1. Ev (Benlik, Kimlik & Beden)',
    domain: 'Kişisel Kimlik, Beden Dili ve Dünyaya Duruş',
    shadowKeyword: 'kendini savunma veya onaylatma kaygısı',
    growthKeyword: 'özgün duruş ve yapıcı liderlik'
  },
  2: {
    name: '2. Ev (Öz-Değer & Maddi Kaynaklar)',
    domain: 'Maddi Güvenlik, Öz-Değer ve Sahip Olunan Yetenekler',
    shadowKeyword: 'yetersizlik veya kaybetme korkusu',
    growthKeyword: 'kendi değerini sahiplenme ve bereket bilinci'
  },
  3: {
    name: '3. Ev (Zihin, İletişim & Yakın Çevre)',
    domain: 'İletişim Dili, Düşünce Akışı, Kardeşler ve Kararlar',
    shadowKeyword: 'haklı çıkma savaşı ve zihinsel karmaşa',
    growthKeyword: 'berraklık, dinleme olgunluğu ve yapıcı ifade'
  },
  4: {
    name: '4. Ev (Kökler, Aile & İçsel Güvenlik)',
    domain: 'Aile, Kökler, Ev Hayatı ve İçsel Çocuk Güvencesi',
    shadowKeyword: 'içe kapanma veya geçmişe sitem etme',
    growthKeyword: 'içsel yuvayı şefkatle inşa etme'
  },
  5: {
    name: '5. Ev (Aşk, Yaratıcılık & Kalp Neşesi)',
    domain: 'Aşk Hayatı, Yaratıcı İfade, Sahne ve Yaşam Coşkusu',
    shadowKeyword: 'onay alamama endişesi veya duygusal dramalar',
    growthKeyword: 'kalbin özgün neşesini ve yaratıcılığını paylaşma'
  },
  6: {
    name: '6. Ev (Günlük Rutinler, Sağlık & Hizmet)',
    domain: 'İş Ortamı, Beden Sağlığı, Günlük Rutinler ve Düzen',
    shadowKeyword: 'aşırı kontrolcülük ve mükemmeliyetçilik kaygısı',
    growthKeyword: 'sağlıklı sınırlar ve dengeli hizmet'
  },
  7: {
    name: '7. Ev (İkili İlişkiler, Evlilik & Ortaklıklar)',
    domain: 'İkili İlişkiler, Ortaklıklar, Aynalama ve Birliktelikler',
    shadowKeyword: 'karşı tarafı suçlama veya kurban rolü',
    growthKeyword: 'aynalama ilkesini idrak edip dengeli bağ kurma'
  },
  8: {
    name: '8. Ev (Derin Dönüşüm & Kriz Yönetimi)',
    domain: 'Kriz Yönetimi, Paylaşılan Kaynaklar ve Gizli Korkular',
    shadowKeyword: 'tutunma, kontrol etme veya kaybetme paniği',
    growthKeyword: 'simyasal arınma ve küllerinden yeniden doğuş'
  },
  9: {
    name: '9. Ev (İnançlar, Yüksek Vizyon & Ufuklar)',
    domain: 'Hayat Felsefesi, İnançlar, Vizyon ve Geniş Perspektif',
    shadowKeyword: 'bağnazlık veya vizyonsuzluk hissi',
    growthKeyword: 'yüksek idrak ve evrensel anlam arayışı'
  },
  10: {
    name: '10. Ev (Kariyer, Başarı & Toplumsal Statü)',
    domain: 'Kariyer, Toplumsal Rol, Başarı ve Gelecek Hedefleri',
    shadowKeyword: 'başarısızlık korkusu veya otoriteyle çatışma',
    growthKeyword: 'olgun sorumluluk ve gerçek ustalık'
  },
  11: {
    name: '11. Ev (Sosyal Çevre, İdealler & Kolektif)',
    domain: 'Sosyal Çevre, Gelecek Hayalleri ve Topluluk Bağları',
    shadowKeyword: 'dışlanmış hissetme veya sürü psikolojisi',
    growthKeyword: 'bütüne hizmet eden özgün idealleri sahiplenme'
  },
  12: {
    name: '12. Ev (Bilinçaltı, Ruhsal Arınma & Teslimiyet)',
    domain: 'Bilinçaltı Çözülmeleri, Ruhsal Arınma ve İlahi Teslimiyet',
    shadowKeyword: 'kurban psikolojisi, kaçış veya belirsizlik korkusu',
    growthKeyword: 'derin sezgi, ruhsal şifa ve koşulsuz teslimiyet'
  }
};

interface PlanetTrait {
  principle: string;
  shadowReaction: string;
  emotionalNeed: string;
  higherTruth: string;
  cosmicUnion: string;
  weight: number;
}

const PLANET_TRAITS: Record<string, PlanetTrait> = {
  'Güneş': {
    principle: 'yaşam enerjisi, özbenlik ve otantik varoluş',
    shadowReaction: 'Ego kırılması, görmezden gelinmeye karşı öfke veya aşırı gurur yapma eğilimi',
    emotionalNeed: 'Fark edilme, değerli olduğunu hissetme ve varlığıyla takdir görme arzusu',
    higherTruth: 'Değerin dışsal alkıştan değil, varoluşun özündeki ışıktan kaynaklandığını bilmek',
    cosmicUnion: 'Kişisel egoyu aşarak ilahi ışığın saf bir aynası ve taşıyıcısı olmak',
    weight: 3.5
  },
  'Ay': {
    principle: 'duygusal güvenlik, içsel çocuk, hisler ve aidiyet',
    shadowReaction: 'Duygusal savunmaya çekilme, alınganlık, güvensizlik veya karşısındakini manipüle etme',
    emotionalNeed: 'Koşulsuz şefkat, güvende hissetme ve kalbinin olduğu gibi kabul edilmesi',
    higherTruth: 'Duyguların gelip geçici dalgalar olduğunu idrak edip kendi kalbine anne/baba olmak',
    cosmicUnion: 'Evrensel sevginin kollarında mutlak bir güvende oluş bilinci',
    weight: 3.8
  },
  'Merkür': {
    principle: 'zihinsel algı, iletişim dili, analiz ve düşünce kalıpları',
    shadowReaction: 'Haklı çıkma hırsı, aşırı gevezelik/susma, zihinsel kaygılar ve yargılama',
    emotionalNeed: 'Anlaşılmak, düşüncelerinin dinlenmesi ve onaylanma ihtiyacı',
    higherTruth: 'Zihni bir çatışma aracı değil, hakikati anlamaya yarayan berrak bir mercek kılmak',
    cosmicUnion: 'Zihnin suskunluğunda doğrudan kalpten doğan ilahi sezgi ve ilham (Gnosis)',
    weight: 2.8
  },
  'Venüs': {
    principle: 'özdeğer, sevgi alma-verme dengesi, ilişkiler ve estetik',
    shadowReaction: 'Sevilmeme korkusuyla aşırı fedakarlık yapma ya da tam tersi soğuk bir duvar örme',
    emotionalNeed: 'Koşulsuz sevilmek, beğenilmek ve huzurlu bir bağ kurmak',
    higherTruth: 'Sevgiyi bağımlılıktan ayırıp kendi değerinin mimarı olarak sağlıklı sınırlar çekmek',
    cosmicUnion: 'Koşulsuz sevginin ve ilahi güzelliğin tüm varoluşta tecelli ettiğini hissetmek',
    weight: 3.0
  },
  'Mars': {
    principle: 'eylem cesareti, irade, dürtü ve sınır koyma gücü',
    shadowReaction: 'Fevri çıkışlar, öfke patlaması, acelecilik veya içe atılan bastırılmış kızgınlık',
    emotionalNeed: 'Engellenmeden hareket edebilme ve kişisel sınırlarının çiğnenmemesi',
    higherTruth: 'Öfkeyi yakıcı bir ateşe değil, odaklanmış ve sabırlı bir yapıcı eyleme dönüştürmek',
    cosmicUnion: 'Kişisel hırsları bırakıp eylemlerini ilahi düzene ve bütüne adamak',
    weight: 3.5
  },
  'Jüpiter': {
    principle: 'genişleme, inanç, hayat vizyonu ve kadersel fırsatlar',
    shadowReaction: 'Aşırı kibir, gerçekçi olmayan beklentiler, her şeyi bildiğini iddia etme veya umutsuzluk',
    emotionalNeed: 'Hayata güven duyma ve anlam arayışında tatmin olma arzusu',
    higherTruth: 'Deneyimlerin ardındaki ilahi adaleti ve büyüme dersini olgunlukla görmek',
    cosmicUnion: 'Evrenin sınırsız bolluğuna ve kadersel planın kusursuzluğuna tam inanç',
    weight: 3.0
  },
  'Satürn': {
    principle: 'sorumluluk, zaman, sabır, sınırlar ve olgunlaşma sınavı',
    shadowReaction: 'Ağır yetersizlik hissi, katı kurallar koyma, korkuyla geri çekilme veya suçluluk',
    emotionalNeed: 'Güvence, takdir, istikrar ve sağlam temeller üzerinde durma ihtiyacı',
    higherTruth: 'Zorlukların bir ceza değil, ruhu çelikleştiren kutsal bir inisiyasyon olduğunu bilmek',
    cosmicUnion: 'Zamanın ötesindeki ilahi düzene teslimiyet ve bilgece bir dinginlik',
    weight: 4.2
  },
  'Uranüs': {
    principle: 'uyanış, özgürleşme, ani farkındalıklar ve tabuları yıkma',
    shadowReaction: 'Asilik, aniden her şeyi yakıp yıkma dürtüsü, yabancılaşma veya huzursuz gerilim',
    emotionalNeed: 'Baskı altında kalmadan tamamen özgür ve özgün olabilme ihtiyacı',
    higherTruth: 'Eski kalıpların ruhun özgürleşmesi için kırıldığını bilip değişime kucak açmak',
    cosmicUnion: 'Evrensel kozmik zihinle ve yüksek bilinçle doğrudan hizalanmak',
    weight: 3.8
  },
  'Neptün': {
    principle: 'sezgi, hayal gücü, ilahi teslimiyet ve ruhsal derinlik',
    shadowReaction: 'Gerçeklerden kaçış, kurban rolü, belirsizlik içinde kaybolma veya hayal kırıklığı',
    emotionalNeed: 'Maddi dünyanın sertliğinden korunma ve şefkatli bir manevi sığınak bulma',
    higherTruth: 'İllüzyonları bırakıp sezgileri berrak bir manevi rehbere dönüştürmek',
    cosmicUnion: 'Tüm ayrılık yanılsamasını aşarak saf birlik denizinde erimek',
    weight: 3.6
  },
  'Plüton': {
    principle: 'derin simya, gölgeyle yüzleşme, güç dengeleri ve yeniden doğuş',
    shadowReaction: 'Güç savaşları, kontrol bağımlılığı, kıskançlık, derin öfke veya intikam hissi',
    emotionalNeed: 'Zayıf düşmemek, kontrolü kaybetmemek ve derin güvende hissetmek',
    higherTruth: 'Gölgeyi bastırmak yerine sevgiyle kabul edip küllerinden anka kuşu gibi doğmak',
    cosmicUnion: 'Ölüm ve doğumun bir olduğunu bilerek mutlak ilahi güce teslim olmak',
    weight: 4.5
  },
  'Kiron': {
    principle: 'şifacı yara, hassasiyet, yetersizliği şifaya çevirme bilgeliği',
    shadowReaction: 'Kronik yetersizlik duygusu, "ben zaten yaralıyım" diyerek geri çekilme',
    emotionalNeed: 'Yarasıyla kabul edilmek ve koşulsuz şefkatle sarılmak',
    higherTruth: 'Kendi yaranın, başkalarına ışık ve şifa sunan en kutsal kapı olduğunu anlamak',
    cosmicUnion: 'Yaradan\'ın şifa enerjisinin saf bir kanalı haline gelmek',
    weight: 3.5
  },
  'Kuzey Ay Düğümü': {
    principle: 'ruhun tekâmül yönü, kadersel sıçrama ve büyüme eşiği',
    shadowReaction: 'Konfor alanına yapışma, eski karmik alışkanlıklara sığınma direnci',
    emotionalNeed: 'Bilinmeyene adım atarken cesaret ve ruhsal rehberlik hissi',
    higherTruth: 'Korkulara rağmen ruhun çağrısına evet deyip yeni bilinç alanına yürümek',
    cosmicUnion: 'Kadersel misyonun ilahi planla tam bir ahenk içinde olduğunu yaşamak',
    weight: 3.4
  },
  'Yükselen (ASC)': {
    principle: 'dünyaya açılan kapı, beden, kişilik vitrini ve yaşam yaklaşımı',
    shadowReaction: 'Dış dünyaya karşı sert maskeler takınma veya aşırı savunmacı olma',
    emotionalNeed: 'Olduğu gibi görünme ve dünyada güvenli bir alan bulma ihtiyacı',
    higherTruth: 'Maskeleri çıkarıp içsel hakikatle dışsal duruşu bir kılmak',
    cosmicUnion: 'Bedenin ve kişiliğin ruhun kutsal bir tapınağı olduğunu bilmek',
    weight: 3.6
  },
  'Tepe Noktası (MC)': {
    principle: 'hayatın zirvesi, toplumsal rol, kariyer ve kadersel hedef',
    shadowReaction: 'Statü kaygısı, başarısızlık korkusu veya toplum baskısıyla savrulma',
    emotionalNeed: 'Yaptığı işin bir amaca hizmet etmesi ve saygı görme ihtiyacı',
    higherTruth: 'Başarıyı dışsal unvanlarda değil, ruhsal dürüstlük ve sorumlulukta aramak',
    cosmicUnion: 'Toplumsal varoluşunu ilahi ışığın dünyaya aktarımı olarak yaşamak',
    weight: 3.4
  }
};

const DEFAULT_TRAIT: PlanetTrait = {
  principle: 'içsel potansiyeliniz ve farkındalık merkeziniz',
  shadowReaction: 'Otomatik savunma mekanizmalarına veya kaygılara kapılma eğilimi',
  emotionalNeed: 'Güvende hissetme ve içsel dengesini koruma ihtiyacı',
  higherTruth: 'Olaylara daha geniş bir bilinçle bakıp yapıcı adımlar atmak',
  cosmicUnion: 'İlahi planın kusursuzluğuna güvenip içsel huzurda kalmak',
  weight: 2.0
};

export function calculateFrequencyMirror(
  natalChart: NatalChartData,
  transitPlanets: AstroPoint[],
  transitAspects: TransitAspect[],
  userAge?: number
): FrequencyMirrorResult {
  // 1. Score all transits to find the most catalytic, personal, and tight-orbed aspect
  let bestAspect: TransitAspect | null = null;
  let bestScore = -1;
  let bestNatalPoint: AstroPoint | null = null;

  for (const aspect of transitAspects) {
    if (aspect.orb > 3.2) continue;

    const tTrait = PLANET_TRAITS[aspect.transitPlanet] || DEFAULT_TRAIT;
    const nTrait = PLANET_TRAITS[aspect.natalPlanet] || DEFAULT_TRAIT;

    // Hard aspects (Conjunction, Opposition, Square) are powerful initiations/mirrors
    let aspectWeight = 1.0;
    if (aspect.type === 'Kavuşum') aspectWeight = 3.2;
    else if (aspect.type === 'Karşıt') aspectWeight = 3.0;
    else if (aspect.type === 'Kare') aspectWeight = 2.9;
    else if (aspect.type === 'Üçgen') aspectWeight = 1.8;
    else if (aspect.type === 'Sekstil') aspectWeight = 1.5;

    // Tightness factor (closer orb = stronger trigger)
    const orbFactor = Math.max(0.2, 3.5 - aspect.orb);

    const score = tTrait.weight * nTrait.weight * aspectWeight * orbFactor;

    if (score > bestScore) {
      bestScore = score;
      bestAspect = aspect;
      bestNatalPoint = natalChart.planets.find(p => p.name === aspect.natalPlanet) 
        || (natalChart.ascendant?.name === aspect.natalPlanet ? natalChart.ascendant : null)
        || (natalChart.midheaven?.name === aspect.natalPlanet ? natalChart.midheaven : null)
        || null;
    }
  }

  // Fallback if no transit with orb <= 3.2 found
  if (!bestAspect || !bestNatalPoint) {
    // Pick the tightest aspect in the entire list
    const sorted = [...transitAspects].sort((a, b) => a.orb - b.orb);
    if (sorted.length > 0) {
      bestAspect = sorted[0];
      bestNatalPoint = natalChart.planets.find(p => p.name === bestAspect!.natalPlanet) 
        || natalChart.planets[0];
    } else {
      // Default emergency fallback to Sun/1st house
      bestAspect = {
        transitPlanet: 'Güneş',
        natalPlanet: 'Güneş',
        type: 'Kavuşum',
        orb: 1.0,
        isExact: true
      };
      bestNatalPoint = natalChart.planets[0] || {
        name: 'Güneş',
        house: 1,
        sign: 'Koç',
        longitude: 0,
        degreeInSign: 0,
        minutes: 0
      };
    }
  }

  const houseNumber = (bestNatalPoint.house >= 1 && bestNatalPoint.house <= 12) ? bestNatalPoint.house : 1;
  const houseInfo = HOUSE_MAP[houseNumber] || HOUSE_MAP[1];
  const tTrait = PLANET_TRAITS[bestAspect.transitPlanet] || DEFAULT_TRAIT;
  const nTrait = PLANET_TRAITS[bestAspect.natalPlanet] || DEFAULT_TRAIT;

  // Aspect tone description
  let aspectDynamic = 'yoğun bir enerji akışı başlatıyor';
  let aspectChallenge = 'yüzleşme ve denge';
  if (bestAspect.type === 'Kavuşum') {
    aspectDynamic = 'doğrudan el ele vererek güçlü bir başlangıç ve yoğun odaklanma başlatıyor';
    aspectChallenge = 'yeni bir bilinç aşamasına sıçrama';
  } else if (bestAspect.type === 'Karşıt') {
    aspectDynamic = 'tam karşıdan ayna tutarak ikili dengeleri ve içsel gerilimleri açığa çıkarıyor';
    aspectChallenge = 'aynalama ve karşıtlıklar arasında denge kurma';
  } else if (bestAspect.type === 'Kare') {
    aspectDynamic = 'sert ve harekete geçirici bir sürtünmeyle eski kalıpları zorluyor';
    aspectChallenge = 'ertelemeyi bırakıp cesur ve olgun bir adım atma';
  } else if (bestAspect.type === 'Üçgen') {
    aspectDynamic = 'akıcı, koruyucu ve ilham dolu bir destek sunuyor';
    aspectChallenge = 'açılan şans ve şifa kapısını bilinçle değerlendirme';
  } else if (bestAspect.type === 'Sekstil') {
    aspectDynamic = 'yeni fırsatlar fısıldayarak sizi yapıcı adımlar atmaya çağırıyor';
    aspectChallenge = 'eyleme geçerek potansiyeli somutlaştırma';
  }

  const prominentAspectDesc = `Transit ${bestAspect.transitPlanet} ${bestAspect.type} Natal ${bestAspect.natalPlanet} (Orb: ${bestAspect.orb.toFixed(1)}°, ${houseNumber}. Ev)`;

  // Generate Theme Category (Specific to the House & Aspect)
  let themeCategory = 'self_identity';
  if ([1].includes(houseNumber)) themeCategory = 'self_identity';
  else if ([2].includes(houseNumber)) themeCategory = 'self_worth_resources';
  else if ([3].includes(houseNumber)) themeCategory = 'communication_mind';
  else if ([4].includes(houseNumber)) themeCategory = 'roots_family';
  else if ([5].includes(houseNumber)) themeCategory = 'creativity_love';
  else if ([6].includes(houseNumber)) themeCategory = 'health_service';
  else if ([7].includes(houseNumber)) themeCategory = 'relationships_mirror';
  else if ([8].includes(houseNumber)) themeCategory = 'shadow_transformation';
  else if ([9].includes(houseNumber)) themeCategory = 'vision_philosophy';
  else if ([10].includes(houseNumber)) themeCategory = 'career_mastery';
  else if ([11].includes(houseNumber)) themeCategory = 'community_ideals';
  else if ([12].includes(houseNumber)) themeCategory = 'soul_surrender';

  // Titles
  const mainTitle = `${houseNumber}. Evde Kozmik Sınav: ${houseInfo.domain}`;
  const currentTheme = `Transit ${bestAspect.transitPlanet} — Natal ${bestAspect.natalPlanet} ${bestAspect.type}ı (${houseInfo.name})`;
  
  const cosmicChallenge = `Gökyüzünde şu an hareket eden Transit ${bestAspect.transitPlanet}, doğum haritanızın ${houseNumber}. evindeki Natal ${bestAspect.natalPlanet} ile ${bestAspect.type} açı kuruyor. Bu etki, yaşamınızın '${houseInfo.domain}' alanında doğuştan taşıdığınız ${nTrait.principle} potansiyelini uyandırıyor. Gökyüzü sizden bu alanda ${aspectChallenge} sınavını geçmenizi ve alışılmış reaksiyonları aşmanızı talep ediyor.`;

  const transitSummary = `Şu an gökyüzünde ${prominentAspectDesc} açısı doğrudan devrededir. ${bestAspect.transitPlanet}'in getirdiği dinamik etki, ${bestAspect.natalPlanet}'inizin bulunduğu ${houseNumber}. ev temalarını harekete geçirerek ${aspectDynamic}.`;

  // 1. ASSIAH (Fiziksel / Otomatik Reaksiyon & Madde Boyutu)
  const assiahTitle = `Farkındalık Alanı: ${houseInfo.domain} Konusunda Otomatik Savunmayı Dönüştürmek`;
  const assiahReaction = `Eğer bu süreçte ${houseInfo.shadowKeyword} yaşıyor; ${tTrait.shadowReaction.toLowerCase()} sergiliyorsanız; olayları kişiselleştirmeden durup sabırla somut çözüme odaklanma fırsatını görmek.`;
  const assiahDiagnosis = `Günlük hayatta bu alanda baskı, acele veya öfkeyle dış dünyayı suçlama eğilimine girdiğinizi fark ederseniz; bu durum 1. Âlem Assiah'ın gölgesidir. Tepki vermek yerine nefes alıp enerjinizi bedeninizin dengesine ve pratik, yapıcı bir adıma dönüştürün.`;

  // 2. YETZIRAH (Duygusal Şifa & İçsel Çocuk Boyutu)
  const yetzirahTitle = `İçsel Çocuk Tutumu: ${nTrait.emotionalNeed} ve Şefkatli Kabul`;
  const yetzirahReaction = `Öfkenin, kırgınlığın ya da geri çekilmenin arkasındaki asıl hissin "${nTrait.emotionalNeed}" olduğunu dürüstçe fark etmek; kalpteki savunma zırhını gevşetip kendi duygusuna şefkatle ebeveynlik etmek.`;
  const yetzirahDiagnosis = `Dışarıdan onay ya da haklılık beklemek yerine, kalbinize elinizi koyup "Şu an içimdeki çocuk ne hissediyor ve neye ihtiyaç duyuyor?" diye sorduğunuzda; 2. Haritanız Yetzirah'ın şifa ve sevgi frekansını aktive edersiniz.`;

  // 3. BERIYAH (Yüksek Zihin, Strateji & Kadersel Bilgelik)
  const yetzirahBilgeTitle = `Bilge Zihin Tutumu: ${houseInfo.growthKeyword.toUpperCase()} ve Kadersel İdrak`;
  const beriyahReaction = `Olaylara kuşbakışı bakarak "${houseInfo.domain} alanındaki bu sınav beni hangi erdemle donatıyor?" bilinciyle yaklaşmak; dramaya kapılmadan ${nTrait.higherTruth.toLowerCase()} ilkesini hayatına uygulamak.`;
  const beriyahDiagnosis = `Karşılaştığınız durumları bir kriz veya engel değil, ruhunuzun olgunlaşması için tasarlanmış kadersel bir ayna olarak gördüğünüzde; 3. Haritanız Beriyah'ın zihinsel vizyonunu ve dengeli iradesini çalıştırırsınız.`;

  // 4. ATZILUT (Kozmik Birlik, Saf Ruh & İlahi Teslimiyet)
  const atzilutTitle = `Kozmik Birlik Tutumu: ${nTrait.cosmicUnion}`;
  const atzilutReaction = `Kişisel haklılık ve kontrol hırsını tamamen bırakmak; varoluşun kusursuz ilahi bir ahenkle aktığını bilerek iradesini evrensel birliğe ve sevgiye teslim etmek.`;
  const atzilutDiagnosis = `Zihninizin sessizliğe büründüğü, kalbinizin ayrılık yanılsamasını aşarak koşulsuz sevgi ve mutlak güvenle çarptığı o dingin tefekkür anında; 4. Haritanız Atzilut'un ilahi frekansındasınız.`;

  return {
    title: mainTitle,
    reason: transitSummary,
    explanation: cosmicChallenge,
    currentTheme,
    themeCategory,
    transitSummary,
    cosmicChallenge,
    prominentAspect: prominentAspectDesc,
    natalHouse: houseNumber,
    houseThemeName: houseInfo.domain,
    transitPlanet: bestAspect.transitPlanet,
    natalPlanet: bestAspect.natalPlanet,
    aspectType: bestAspect.type,
    orb: Number(bestAspect.orb.toFixed(1)),
    spectrum: {
      assiah: {
        level: 1,
        name: '1. Assiah Alemi (Fiziksel Eylem / Madde)',
        title: assiahTitle,
        reaction: assiahReaction,
        diagnosis: assiahDiagnosis,
        color: '#EF4444',
        bgClass: 'bg-red-500/10 border-red-500/30 text-red-300'
      },
      yetzirah: {
        level: 2,
        name: '2. Yetzirah Alemi (Duygu / Bilinçaltı / Kalp)',
        title: yetzirahTitle,
        reaction: yetzirahReaction,
        diagnosis: yetzirahDiagnosis,
        color: '#0EA5E9',
        bgClass: 'bg-sky-500/10 border-sky-500/30 text-sky-300'
      },
      beriyah: {
        level: 3,
        name: '3. Beriyah Alemi (Yüksek Zihin / Kadersel Bilgelik)',
        title: yetzirahBilgeTitle,
        reaction: beriyahReaction,
        diagnosis: beriyahDiagnosis,
        color: '#F59E0B',
        bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      },
      atzilut: {
        level: 4,
        name: '4. Atzilut Alemi (İlahi Kudret / Mutlak Birlik)',
        title: atzilutTitle,
        reaction: atzilutReaction,
        diagnosis: atzilutDiagnosis,
        color: '#A855F7',
        bgClass: 'bg-purple-500/10 border-purple-500/30 text-purple-300'
      }
    }
  };
}
