// Mundane (Kolektif / Gökyüzü) Açı ve Yerleşim Yorumları Sözlüğü

export interface SkyAspectInterpretation {
  title: string;
  category: 'Kadersel' | 'Kişisel' | 'Dönüşüm';
  energyType: 'Destekleyici' | 'Zorlayıcı / Sınav' | 'Kavuşum / Odaklanma';
  summary: string;
  collectiveTheme: string;
  dailyAdvice: string;
  chakraResonance: string;
}

const PLANET_ARCHETYPES: Record<string, { archetype: string; nature: string }> = {
  'Güneş': { archetype: 'Bilinç, Canlılık, Liderlik & Yaşam Gücü', nature: 'Aydınlatıcı, görünür kılan ve odak noktası oluşturan' },
  'Ay': { archetype: 'Kolektif Ruh Hali, Duygusal Dalgalar & Halkın Bilinci', nature: 'Hızlı değişen, sezgisel ve besleyici' },
  'Merkür': { archetype: 'İletişim, Ticaret, Zihinsel Akış & Bilgi Trafiği', nature: 'Bağlayıcı, analiz eden ve veri aktaran' },
  'Venüs': { archetype: 'İlişkiler, Değerler, Sanat & Finansal Akış', nature: 'Uyum arayan, birleştirici ve estetik' },
  'Mars': { archetype: 'Eylem, İrade, Mücadele & Cesaret', nature: 'Ateşleyici, harekete geçiren ve rekabetçi' },
  'Jüpiter': { archetype: 'Bolluk, Felsefe, Genişleme & Şans', nature: 'Büyüten, vizyon katan ve bereket getiren' },
  'Satürn': { archetype: 'Sorumluluk, Zaman, Sınırlar & Yapılanma', nature: 'Test eden, disipline eden ve kalıcılık sağlayan' },
  'Uranüs': { archetype: 'Uyanış, Ani Değişim, Özgürlük & Teknoloji', nature: 'Kalıpları kıran, sarsıcı ve yenilikçi' },
  'Neptün': { archetype: 'Ruhsallık, İlham, Hayal Gücü & Çözülme', nature: 'Sınırları eriten, şefkatli ama sisli' },
  'Plüton': { archetype: 'Dönüşüm, Güç, Küllerinden Doğuş & Krizler', nature: 'Yeniden yapılandıran, derin ve köklü' },
  'Kiron': { archetype: 'Kolektif Şifa, Hassasiyet & Bilge Yaralı', nature: 'Duyarlılık kazandıran ve kalbi onaran' },
};

// Bilinen önemli majör kombinasyonlar için özel kolektif yorumlar
const SPECIAL_COMBINATIONS: Record<string, Record<string, { summary: string; collective: string; advice: string }>> = {
  'Güneş-Merkür': {
    'Kavuşum': {
      summary: 'Merkür Cazimi / Güneşin Kalbinde: Zihinsel berraklık, önemli fikirlerin doğuşu ve güçlü iletişim dalgası.',
      collective: 'Kolektif zihinde kararların netleştiği, önemli anlaşmaların ve duyuruların yapıldığı çok güçlü bir uyanış zamanı.',
      advice: 'Aklınıza gelen fikirleri not edin, önemli görüşmeleri ve imzaları bu etki altındayken değerlendirin.'
    }
  },
  'Mars-Satürn': {
    'Kavuşum': {
      summary: 'Fren ve Gazın Buluşması: Kararlılık, sabır ve yüksek disiplin gerektiren somut inşa dönemi.',
      collective: 'Kolektifte kuralların sıkılaştığı, otorite ile bireysel irade arasında dengelerin sınandığı, sabredenlerin kazandığı bir enerji.',
      advice: 'Aceleci öfkeye kapılmayın. Enerjinizi uzun vadeli, stratejik ve kalıcı işlere yönlendirin.'
    },
    'Kare': {
      summary: 'Engellerle Yüzleşme ve Sabır Sınavı: Harekete geçmek isterken duvarlara çarpma hissi.',
      collective: 'Toplumsal gerilimlerin, gecikmelerin ve bürokratik engellerin arttığı bir dönem. Öfkeyle kalkan zararla oturur.',
      advice: 'Zorla kapı açmaya çalışmayın. Sakin kalın, stratejinizi gözden geçirin ve bedensel sağlığınıza ekstra dikkat edin.'
    },
    'Karşıt': {
      summary: 'Baskı ve Karşılaşmalar: İki zıt gücün çekişmesi, irade ile sınırların karşı karşıya gelmesi.',
      collective: 'Çatışma riskinin yükseldiği, sınırların zorlandığı ve diplomatik esnekliğin hayati olduğu bir transit.',
      advice: 'Güç gösterilerinden uzak durun. Haklı olmaya değil, yapıcı olmaya odaklanın.'
    }
  },
  'Jüpiter-Satürn': {
    'Kavuşum': {
      summary: 'Büyük Döngü (Great Conjunction): Sosyo-ekonomik sistemlerin ve kolektif yapıların yeniden inşası.',
      collective: 'Eski yapıların elenip yerine yepyeni 20 yıllık küresel paradigmaların kurulduğu tarihi eşik.',
      advice: 'Gelecek planlarınızı gerçekçi temellere oturtun; hayallerinizle disiplini sentezleyin.'
    },
    'Kare': {
      summary: 'Büyüme vs Sınırlar: Genişleme arzusu ile gerçekliğin gerektirdiği kısıtlamaların mücadelesi.',
      collective: 'Ekonomik dalgalanmalar, aşırı iyimserliğin bütçe kısıtlamalarına çarpması ve strateji revizyonları.',
      advice: 'Riskleri iyi hesaplayın. Boyunuzu aşan borçlanma veya yatırımlardan kaçının.'
    }
  },
  'Jüpiter-Uranüs': {
    'Kavuşum': {
      summary: 'Kozmik Şans ve Devrimsel Uyanış: Beklenmedik teknolojik, finansal ve zihinsel sıçramalar.',
      collective: 'Yapay zeka, bilim, finansal sistemler ve özgürlük alanlarında çığır açıcı ani devrimler.',
      advice: 'Eski alışkanlıkları bırakın. Yeni dünyaya, teknolojiye ve yenilikçi fırsatlara cesaretle adım atın.'
    }
  },
  'Mars-Plüton': {
    'Kare': {
      summary: 'Yüksek Adrenalin ve Güç Mücadelesi: Bastırılmış öfkelerin yüzeye çıkması ve kontrol savaşı.',
      collective: 'Kolektifte gerilimli olaylar, manipülatif güç dengeleri ve kriz yönetimi gerektiren durumlar.',
      advice: 'Provokasyonlara gelmeyin. Fiziksel enerjinizi spor, üretim veya arınma çalışmalarıyla topraklayın.'
    },
    'Kavuşum': {
      summary: 'Yenilmez İrade ve Derin Dönüşüm: Yıkıcı veya muazzam yapıcı olabilen atomik güç birleşimi.',
      collective: 'Kolektif düzeyde büyük hedeflere kilitlenme, köklü reformlar ve tavizsiz bir kararlılık.',
      advice: 'Gücünüzü başkalarını ezmek için değil, hayatınızdaki çürümüş durumları temizlemek için kullanın.'
    }
  },
  'Venüs-Jüpiter': {
    'Kavuşum': {
      summary: 'İki İyicilin Buluşması: Sevgi, bereket, kutlama ve cömertlik kapılarının ardına kadar açılması.',
      collective: 'Toplumda neşe, sanat, evlilikler, finansal rahatlama ve barışçıl diplomasi rüzgarları.',
      advice: 'Sosyal ilişkilerinizi güçlendirin, kalbinizi cömertçe açın ve fırsatları neşeyle karşılayın.'
    },
    'Üçgen': {
      summary: 'Kozmik Zarafet ve Şans: İlişkilerde ve kazançlarda tatlı, çabasız bir bolluk akışı.',
      collective: 'İyimserlik, yaratıcı sanatsal başarılar ve karşılıklı güven ortamı.',
      advice: 'Güzellikleri hayatınıza çekin, barışmak istediğiniz kişilerle adım atın.'
    }
  }
};

export function getSkyAspectInterpretation(
  planet1: string,
  planet2: string,
  aspectType: string
): SkyAspectInterpretation {
  const p1 = planet1;
  const p2 = planet2;
  const key1 = `${p1}-${p2}`;
  const key2 = `${p2}-${p1}`;

  const isHarmonious = aspectType === 'Üçgen' || aspectType === 'Sekstil';
  const isChallenging = aspectType === 'Kare' || aspectType === 'Karşıt';
  const isConjunction = aspectType === 'Kavuşum';

  let energyType: SkyAspectInterpretation['energyType'] = 'Destekleyici';
  if (isChallenging) energyType = 'Zorlayıcı / Sınav';
  else if (isConjunction) energyType = 'Kavuşum / Odaklanma';

  let category: SkyAspectInterpretation['category'] = 'Kişisel';
  const outerPlanets = ['Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton'];
  if (outerPlanets.includes(p1) && outerPlanets.includes(p2)) {
    category = 'Kadersel';
  } else if (p1 === 'Plüton' || p2 === 'Plüton' || p1 === 'Neptün' || p2 === 'Neptün') {
    category = 'Dönüşüm';
  }

  // Check special handbook
  const specialMatch = SPECIAL_COMBINATIONS[key1]?.[aspectType] || SPECIAL_COMBINATIONS[key2]?.[aspectType];
  if (specialMatch) {
    return {
      title: `${p1} - ${p2} ${aspectType} Açısı`,
      category,
      energyType,
      summary: specialMatch.summary,
      collectiveTheme: specialMatch.collective,
      dailyAdvice: specialMatch.advice,
      chakraResonance: getChakraResonance(p1, p2)
    };
  }

  // Algorithmic synthesis for all other pairs
  const arch1 = PLANET_ARCHETYPES[p1] || { archetype: p1, nature: 'etkili' };
  const arch2 = PLANET_ARCHETYPES[p2] || { archetype: p2, nature: 'etkili' };

  let summary = '';
  let collectiveTheme = '';
  let dailyAdvice = '';

  if (isConjunction) {
    summary = `${p1} ve ${p2} güçlerini gökyüzünde birleştiriyor. Bu kavuşum, ${arch1.archetype} ile ${arch2.archetype} temalarını tek bir güçlü odakta toplar.`;
    collectiveTheme = `Kolektif alanda ${p1}'in ${arch1.nature} etkisiyle ${p2}'nin enerjisi kaynaşır. Yeni bir döngünün tohumları atılır.`;
    dailyAdvice = `Bu iki gezegenin temsil ettiği alanlarda yoğunlaşma yaşanacaktır. Zihninizi dağıtmadan hedefinize odaklanın.`;
  } else if (aspectType === 'Kare') {
    summary = `${p1} ile ${p2} arasında 90° gerilimli kare açı: Harekete geçiren dinamik bir sürtünme ve farkındalık zorunluluğu.`;
    collectiveTheme = `${arch1.archetype} ile ${arch2.archetype} arasında bir meydan okuma söz konusudur. Çatışmalar yapısal değişimleri tetikler.`;
    dailyAdvice = `Fevri tepkilerden kaçının. Gerilimi yapıcı eylemlere ve somut disiplinli adımlara dönüştürün.`;
  } else if (aspectType === 'Karşıt') {
    summary = `${p1} ile ${p2} arasında 180° karşıt açı: İki kutup arasında denge kurma ve ayna tutulma zamanı.`;
    collectiveTheme = `Kolektifte karşıt görüşlerin, kutuplaşmaların veya tarafların yüzleştiği bir atmosfer hakim olur.`;
    dailyAdvice = `Tek taraflı ısrarcı olmak yerine orta yolu bulun. Karşı tarafın bakış açısını anlamaya çalışın.`;
  } else if (aspectType === 'Üçgen') {
    summary = `${p1} ile ${p2} arasında 120° akıcı üçgen açı: Kolaylaşan enerji akışı, kozmik destek ve çabasız uyum.`;
    collectiveTheme = `${arch1.archetype} ve ${arch2.archetype} birbirine pürüzsüz destek vererek kolektif moral ve bereketi yükseltir.`;
    dailyAdvice = `Önünüze çıkan fırsatları değerlendirin. Bu akıcı enerjiyi projelerinizi hızlandırmak için kullanın.`;
  } else if (aspectType === 'Sekstil') {
    summary = `${p1} ile ${p2} arasında 60° sekstil açı: İletişim, yeni kapılar ve eyleme geçildiğinde meyve veren fırsatlar.`;
    collectiveTheme = `Yaratıcı çözümlerin, yapıcı diyalogların ve karşılıklı anlayışın kolektifte arttığı bir evre.`;
    dailyAdvice = `Fırsatlar kapınızı çalabilir ancak içeri almak için sizin adım atmanız gerekir. Girişimci olun.`;
  } else {
    summary = `${p1} ile ${p2} gökyüzünde ${aspectType} açısı kuruyor.`;
    collectiveTheme = `Kolektif bilinci incelikli şekilde etkileyen astrolojik bir etkileşim.`;
    dailyAdvice = `Günün enerjisine uyum sağlamak için sakin ve dengede kalın.`;
  }

  return {
    title: `${p1} - ${p2} ${aspectType} Açısı`,
    category,
    energyType,
    summary,
    collectiveTheme,
    dailyAdvice,
    chakraResonance: getChakraResonance(p1, p2)
  };
}

function getChakraResonance(p1: string, p2: string): string {
  const combined = `${p1} ${p2}`;
  if (combined.includes('Satürn') || combined.includes('Plüton')) {
    return '1. Kök Çakra (Muladhara) - Yapılanma, Sınırlar & Güven';
  }
  if (combined.includes('Venüs') || combined.includes('Ay')) {
    return '4. Kalp Çakra (Anahata) - Sevgi, Şefkat & Değerler';
  }
  if (combined.includes('Mars') || combined.includes('Güneş')) {
    return '3. Solar Pleksus (Manipura) - İrade, Cesaret & Eylem';
  }
  if (combined.includes('Merkür') || combined.includes('Uranüs')) {
    return '5. Boğaz Çakrası (Vishuddha) - Hakikat, İletişim & Uyanış';
  }
  if (combined.includes('Jüpiter') || combined.includes('Kiron')) {
    return '6. Üçüncü Göz (Ajna) - Bilgelik, Sezgi & Yüksek Anlayış';
  }
  return '7. Taç Çakrası (Sahasrara) - Kolektif Bilinç & Kozmik Uyum';
}
