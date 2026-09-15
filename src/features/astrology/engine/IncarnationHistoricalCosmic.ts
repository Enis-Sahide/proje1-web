import type { NatalChartData, ZodiacSign } from './AstrologyConstants';

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
    name: 'Andromeda / Mirach & Alpheratz',
    longitude: 44.40, // 14°24' Boğa
    constellation: 'Andromeda Galaksisi',
    frequencyBadge: 'Andromeda (Kozmik Özgürlük Gezgini)',
    mission: 'Kozmik bağımsızlık, boyut gezginliği ve otoriter hapishaneleri/dogmaları kırma elçiliği.',
    gift: 'Sınırlanamaz özgür irade, baskılara asla boyun eğmeme, vizyoner öncülük.',
    challenge: 'Kapalı mekanlar, katı rutinler ve dar görüşlü kurallar karşısında klostrofobi ve isyan refleksi.'
  },
  {
    name: 'Orion / Rigel & Betelgeuse',
    longitude: 76.83, // 16°50' İkizler (Rigel)
    constellation: 'Orion (Avcı)',
    frequencyBadge: 'Orion (Kadim Bilgelik Savaşçısı)',
    mission: 'Galaktik Işık ve Karanlık savaşlarından geçmiş, bilgeliğe ve kalp-akıl dengesine evrilen kıdemli ruh.',
    gift: 'Muazzam içsel direnç, hakikati her ne pahasına olursa olsun savunma, stratejik cesaret.',
    challenge: 'Her an bir savaş veya ihanet çıkacakmış gibi gardını düşürememe, insanlara tam güvenememe.'
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
 * 1. Galaktik Ruh Kökeni & Sabit Yıldız Taraması
 * Güneş, Ay, ASC, GAD, KAD, Kiron ve Tepe Noktası (MC) incelenir.
 */
export function calculateCosmicOrigin(natalChart: NatalChartData): CosmicOriginResult {
  const pointsToTest: { name: string; longitude: number }[] = [];

  // Gezegenler
  natalChart.planets.forEach(p => {
    if (['Güneş', 'Ay', 'Kuzey Ay Düğümü', 'Kiron', 'Mars', 'Venüs'].includes(p.name)) {
      pointsToTest.push({ name: p.name, longitude: p.longitude });
    }
  });

  // GAD (KAD + 180)
  const kad = natalChart.planets.find(p => p.name === 'Kuzey Ay Düğümü');
  if (kad) {
    const gadLon = (kad.longitude + 180) % 360;
    pointsToTest.push({ name: 'Güney Ay Düğümü (GAD)', longitude: gadLon });
  }

  // Yükselen (1. Ev başlangıcı)
  if (natalChart.houses && natalChart.houses.length > 0) {
    const ascHouse = natalChart.houses.find(h => h.house === 1);
    if (ascHouse) {
      pointsToTest.push({ name: 'Yükselen (ASC)', longitude: ascHouse.longitude });
    }
  }

  const MAX_ORB = 1.65; // Maksimum kavuşum payı
  let bestMatch: {
    star: FixedStarDef;
    pointName: string;
    orb: number;
  } | null = null;

  for (const star of GALACTIC_FIXED_STARS) {
    for (const pt of pointsToTest) {
      const diff = angleDifference(star.longitude, pt.longitude);
      if (diff <= MAX_ORB) {
        if (!bestMatch || diff < bestMatch.orb) {
          bestMatch = {
            star,
            pointName: pt.name,
            orb: Math.round(diff * 100) / 100
          };
        }
      }
    }
  }

  if (bestMatch) {
    return {
      isStarseed: true,
      starName: bestMatch.star.name,
      constellation: bestMatch.star.constellation,
      connectedPoint: `${bestMatch.pointName} ile Kavuşum (${bestMatch.orb}° orb)`,
      orb: bestMatch.orb,
      soulMission: bestMatch.star.mission,
      cosmicGift: bestMatch.star.gift,
      earthlyChallenge: bestMatch.star.challenge,
      frequencyBadge: bestMatch.star.frequencyBadge
    };
  }

  // Eğer doğrudan sabit yıldız teması yoksa: Asil ve bilge Gaia Muhafızı kimliği
  return {
    isStarseed: false,
    starName: 'Kadim Dünya Ruhu (Earth Native - Gaia Muhafızı)',
    constellation: 'Terra / Gaia (Dünya Gezegeni)',
    connectedPoint: 'Dünya Biyosferik Kökü & 4 Element Hizası',
    orb: null,
    soulMission: 'Dünya gezegeninin elemental hafızasında ustalaşmak; madde ile mana arasındaki kutsal köprüyü inşa etmek ve yeryüzüne sağlam kök salmak.',
    cosmicGift: 'Kuvvetli pratik sağduyu, dünyevi krizlerde sarsılmaz dirayet, doğanın mevsimleriyle doğrudan uyumlanma ve yaşamı güvenle inşa etme kudreti.',
    earthlyChallenge: 'Madde dünyasının ağırlığına kapılıp ruhsal kanatlarını unutma riski; dünyevi kaygıları aşarak ilahi güveni koruma sınavı.',
    frequencyBadge: 'Kadim Dünya Muhafızı (Gaia)'
  };
}

/**
 * 2. Tarihsel Zaman Tüneli & Geçmiş Yaşam Dünya Çağı
 * GAD Burcu, Evi, Yöneticisi ve Plüton/Satürn konumlarından sentezlenir.
 */
export function calculateHistoricalEra(
  natalChart: NatalChartData,
  gadSign: ZodiacSign,
  gadHouse: number
): HistoricalEraResult {
  const pluto = natalChart.planets.find(p => p.name === 'Plüton');
  const saturn = natalChart.planets.find(p => p.name === 'Satürn');
  const mars = natalChart.planets.find(p => p.name === 'Mars');

  // GAD Burç ve Ev kombinasyonuna göre 12 ana tarihsel çağ haritası
  if (['Akrep', 'Başak'].includes(gadSign) || gadHouse === 8 || (pluto && pluto.house === 8)) {
    return {
      eraName: 'Geç Orta Çağ, Büyük Veba & Engizisyon Dönemi',
      timeSpan: 'M.S. 1340 – 1490 civarı',
      century: '14. - 15. Yüzyıl',
      archetypeRole: 'Bitki Şifacısı, Lonca Hekimi, Manastır Ebesi veya Gizli Bilgi Koruyucusu',
      geographyCulture: 'Orta ve Batı Avrupa (İngiltere, Fransa, Ren Vadisi veya İberya)',
      atmosphere: 'Kara Veba salgınının yarattığı kitlesel kayıplar, kilisenin sert denetimi ve cadı avlarının gölgesinde hayatta kalma mücadelesi.',
      karmicImprint: 'İftiraya uğrama ve yeteneklerini gizleme korkusu; aşırı hijyen/sağlık anksiyetesi ve derin bir hayatta kalma refleksi.',
      soulMemoryKey: 'Geçmişte insanlara şifa verirken cezalandırıldığınız için bu yaşamda ruhsal gücünüzü ortaya koymaktan çekinebilirsiniz.'
    };
  }

  if (['Terazi', 'Boğa', 'İkizler'].includes(gadSign) && [5, 7, 3].includes(gadHouse)) {
    return {
      eraName: 'Rönesans & Büyük Aydınlanma Çağı',
      timeSpan: 'M.S. 1500 – 1650 civarı',
      century: '16. - 17. Yüzyıl',
      archetypeRole: 'Rönesans Ressamı/Heykeltıraşı, Hümanist Düşünür, Matbaacı veya İtalyan Tüccarı',
      geographyCulture: 'İtalya (Floransa, Venedik), Flandre veya Erken Aydınlanma Avrupası',
      atmosphere: 'Sanatın, anatomik ve coğrafi keşiflerin, klasik antik bilgeliğin yeniden doğduğu büyüleyici estetik uyanış.',
      karmicImprint: 'Estetik mükemmeliyetçilik, zarafet tutkusu ve kaba ortamlara karşı derin tahammülsüzlük.',
      soulMemoryKey: 'Eserleriniz veya fikirlerinizle dünyayı güzelleştirdiniz; bu hayatta da estetik ve adaleti ruhunuzun gıdası sayarsınız.'
    };
  }

  if (['Koç', 'Oğlak'].includes(gadSign) || gadHouse === 10 || (mars && mars.house === 10)) {
    return {
      eraName: 'Antik Roma İmparatorluğu & Lejyonlar Çağı',
      timeSpan: 'M.Ö. 100 – M.S. 330 civarı',
      century: 'M.Ö. 1. yy - M.S. 4. yy',
      archetypeRole: 'Roma Lejyon Komutanı, Senatör, Taş/Yol Mimarı veya Hukukçu',
      geographyCulture: 'Akdeniz Havzası, İtalya, Galya veya Küçük Asya (Anadolu Roma Eyaletleri)',
      atmosphere: 'Demir disiplin, imparatorluk inşası, askeri nizam ve hukukun katı kurallarıyla örülü bir fetih dünyası.',
      karmicImprint: 'Görev bilinci uğruna duyguları bastırma, ihanete uğrama ihtiyatı ve her durumu askeri bir strateji gibi yönetme eğilimi.',
      soulMemoryKey: 'Büyük sorumluluklar ve otorite taşıdınız; bu yaşamda yumuşamayı, teslimiyeti ve kalbinizi açmayı öğreniyorsunuz.'
    };
  }

  if (['Aslan', 'Boğa'].includes(gadSign) && [5, 9, 1].includes(gadHouse)) {
    return {
      eraName: 'Antik Mısır & Nil Tapınakları Çağı',
      timeSpan: 'M.Ö. 2000 – 1200 civarı',
      century: 'M.Ö. 2. Binyıl',
      archetypeRole: 'Güneş Tapınağı İnisiyesi, Astronom Rahip/Rahibe, Kutsal Geometri Mimarı veya Hanedan Mensubu',
      geographyCulture: 'Nil Deltası, Thebes, Memphis veya Heliopolis',
      atmosphere: 'Sirius ve Güneş kültü, mumyalama ve ölüm ötesi bilgeliği, piramitlerin ve hiyerogliflerin kutsal ritüelleri.',
      karmicImprint: 'Doğal bir asalet, sıradanlığa tahammülsüzlük, ezoterik sembollere ve ritüellere karşı çocukluktan gelen aşinalık.',
      soulMemoryKey: 'Kutsal bilgiye ve yüksek statüye sahiptiniz; bu enkarnasyonda gücünüzü kibirsizce, sevgiyle dünyevi yaşama entegre etmeniz bekleniyor.'
    };
  }

  if (['Yay', 'İkizler'].includes(gadSign) && [9, 3].includes(gadHouse)) {
    return {
      eraName: 'Antik Yunan, İskenderiye & Felsefe Çağı',
      timeSpan: 'M.Ö. 450 – M.Ö. 150 civarı',
      century: 'M.Ö. 5. - 2. Yüzyıl',
      archetypeRole: 'Akademi Filozofu, İskenderiye Kütüphanecisi, Gezgin Hekim veya Matematikçi',
      geographyCulture: 'Atina, İskenderiye (Mısır), Efes veya Miletos',
      atmosphere: 'Felsefi münazaralar, tiyatro, geometri, hakikat arayışı ve antik parşömenlerin altın çağı.',
      karmicImprint: 'Dogmalara ve kör inançlara karşı alerji, durmaksızın gerçeği sorgulama ve entelektüel özgürlük tutkusu.',
      soulMemoryKey: 'Fikirleriniz döneminizin çok ötesindeydi; bu yaşamda da anlaşılmama korkusu yaşamadan bildiğiniz hakikati anlatmalısınız.'
    };
  }

  if (['Balık', 'Yengeç'].includes(gadSign) && [12, 4].includes(gadHouse)) {
    return {
      eraName: 'Erken Orta Çağ & Manastır / İnziva Dönemi',
      timeSpan: 'M.S. 500 – 950 civarı',
      century: '6. - 10. Yüzyıl',
      archetypeRole: 'Manastır Şifacısı, Münzevi İnzivacı, Kutsal Metin Kâtibi veya Yetimhane Koruyucusu',
      geographyCulture: 'İrlanda, İskoçya Yaylaları, Kapadokya veya Bizans Kırsalı',
      atmosphere: 'Sessizlik yeminleri, dünyevi gürültüden el etek çekme, dualar ve ruhsal adanmışlıkla geçen derin bir yalnızlık.',
      karmicImprint: 'Kalabalıklardan çabuk yorulma, dünyayı fazla hoyrat bulma ve kendi ihtiyaçlarını başkaları için feda etme refleksi.',
      soulMemoryKey: 'Ruhunuz geçmişte uzun süre sessizlikte kaldı; bu yaşamda dünyadan kaçmak yerine dünyanın içinde ışığınızı parlatmalısınız.'
    };
  }

  if (['Yay', 'Koç'].includes(gadSign) && [8, 9].includes(gadHouse)) {
    return {
      eraName: 'Feodal Dönem & Haçlı Seferleri Çağı',
      timeSpan: 'M.S. 1095 – 1290 civarı',
      century: '11. - 13. Yüzyıl',
      archetypeRole: 'Şövalye, Kale Muhafızı, Kutsal Toprak Yolcusu veya Feodal Baron',
      geographyCulture: 'Levant (Kudüs, Antakya), Güney Fransa veya Doğu Akdeniz',
      atmosphere: 'İnanç uğruna at sırtında yapılan aylar süren yolculuklar, kale kuşatmaları ve kutsal emanet savaşları.',
      karmicImprint: 'Büyük idealler uğruna her şeyi terk edebilme cesareti, ancak savaşın masumiyet üzerindeki tahribatından kalan gizli hüzün.',
      soulMemoryKey: 'İnandığınız değerler için savaştınız; bu yaşamda savaşınız dış dünyayla değil, kendi içsel barışınızladır.'
    };
  }

  if (['Yay', 'Boğa', 'Aslan'].includes(gadSign) && [2, 9].includes(gadHouse)) {
    return {
      eraName: 'Osmanlı & İpek Yolu Doğu Medeniyetleri',
      timeSpan: 'M.S. 1450 – 1750 civarı',
      century: '15. - 18. Yüzyıl',
      archetypeRole: 'İpek Yolu Kervan Tüccarı, Medrese Müderrisi, Dergâh Dervişi veya Saray Hekimi',
      geographyCulture: 'İstanbul, Semerkand, İsfahan, Şam veya Tebriz',
      atmosphere: 'Kervansaraylar, baharat pazarları, tasavvuf meclisleri, kubbe mimarisi ve Doğu ile Batı arasındaki köprü.',
      karmicImprint: 'Misafirperverlik, derin tevekkül, yolculuk tutkusu ve ticarette adalet hassasiyeti.',
      soulMemoryKey: 'Geniş coğrafyaları birbirine bağladınız; bu yaşamda da farklı kültürleri ve insanları kaynaştıran bilge bir köprüsünüz.'
    };
  }

  if (['Oğlak', 'Kova', 'Başak'].includes(gadSign) && [6, 10, 11].includes(gadHouse)) {
    return {
      eraName: 'Sanayi Devrimi & Viktorya Dönemi',
      timeSpan: 'M.S. 1780 – 1900 civarı',
      century: '18. - 19. Yüzyıl',
      archetypeRole: 'Fabrika Mühendisi, Lokomotif Tasarımcısı, Emekçi Savunucusu veya Katı Bürokrasi Yöneticisi',
      geographyCulture: 'İngiltere (Manchester, Londra), Ruhr Vadisi (Almanya) veya New England (Amerika)',
      atmosphere: 'Kömür dumanları, buhar makineleri, fabrika çarkları, saat disiplini ve sınıfsal dönüşüm mücadeleleri.',
      karmicImprint: 'Sürekli üretme ve çalışma baskısı, dinlenirken içsel suçluluk duyma ve duyguları mantığa kurban etme korkusu.',
      soulMemoryKey: 'Makineler ve sistemler inşa ettiniz; bu hayatta ruhunuzun da beslenmeye ve dinlenmeye hakkı olduğunu hatırlamalısınız.'
    };
  }

  // Varsayılan: Kadim Doğa ve Şamanik Kültürler
  return {
    eraName: 'Kadim Doğa & Şamanik Kabile Döngüsü',
    timeSpan: 'Tarih Ötesi / Kadim Zamanlar',
    century: 'Kadim Döngü',
    archetypeRole: 'Kabile Şamanı, Ateş Koruyucusu, Bitki Bilgesi veya Avcı Rehber',
    geographyCulture: 'Kuzey Avrasya Bozkırları, Mezopotamya Yaylaları veya Yerli Amerikan Ormanları',
    atmosphere: 'Şehirlerden uzak; yıldızların, rüzgârın, kurtların ve doğa ruhlarının diliyle nefes alınan saf kabile yaşamı.',
    karmicImprint: 'Modern betonarme binalara ve yapay düzene derin bir yabancılık; orman, toprak ve gökyüzü hasreti.',
    soulMemoryKey: 'Doğanın saf zekasıyla yaşadınız; bu hayatta da toprağa dokunduğunuzda ve iç sesinizi dinlediğinizde anında şifalanırsınız.'
  };
}
