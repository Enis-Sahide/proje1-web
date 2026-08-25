import { TransitChartData, TransitAspect } from './AstrologyConstants';

export interface HolisticGuidanceData {
  activeChakras: string[];
  groundingTime: string;
  breathWork: string;
  subconsciousFocus: string;
  dailyAffirmation: string;
  reasoning: string;
}

export function calculateHolisticGuidance(
  transitPlanets: any[],
  transitAspects: TransitAspect[],
  transitTransitAspects: any[]
): HolisticGuidanceData {
  // 1. Determine active chakras based on transit planets and aspects
  const chakrasSet = new Set<string>();
  
  // Find transit Sun & Moon positions
  const tSun = transitPlanets.find(p => p.name === 'Güneş');
  const tMoon = transitPlanets.find(p => p.name === 'Ay');
  
  // Standard mappings based on user instructions and traditional astrology:
  // Moon is connected to Heart (Kalp) chakra, Venus to Sacral (Sakral), Sun/Jupiter to Solar Plexus/Crown, etc.
  if (tSun) {
    chakrasSet.add('Solar Plexus (Karın) Çakrası');
  }
  if (tMoon) {
    chakrasSet.add('Kalp Çakrası (Ay Enerjisi)');
  }
  
  // If there are major transits affecting Mercury/Venus/Mars, add their chakras
  transitAspects.forEach(aspect => {
    if (aspect.transitPlanet === 'Merkür' || aspect.natalPlanet === 'Merkür') {
      chakrasSet.add('Boğaz Çakrası (İletişim)');
    }
    if (aspect.transitPlanet === 'Venüs' || aspect.natalPlanet === 'Venüs') {
      chakrasSet.add('Sakral (Cinsel/Yaratıcı) Çakra');
    }
    if (aspect.transitPlanet === 'Mars' || aspect.natalPlanet === 'Mars') {
      chakrasSet.add('Kök Çakra (Hayatta Kalma/Eylem)');
    }
    if (aspect.transitPlanet === 'Jüpiter' || aspect.transitPlanet === 'Satürn') {
      chakrasSet.add('Tepe (Taç) Çakra');
    }
  });

  const activeChakras = Array.from(chakrasSet);
  if (activeChakras.length === 0) {
    activeChakras.push('Kalp Çakrası', 'Kök Çakra');
  }

  // 2. Score the day's transits to see if it qualifies as a Special Day matching professional standards
  let totalScore = 0;

  // New Moon / Full Moon check (2.0 points)
  const sunMoonAspect = transitTransitAspects.find(
    a => (a.planet1 === 'Güneş' && a.planet2 === 'Ay') || (a.planet1 === 'Ay' && a.planet2 === 'Güneş')
  );
  const isNewMoon = sunMoonAspect && sunMoonAspect.type === 'Kavuşum' && sunMoonAspect.orb < 3.0;
  const isFullMoon = sunMoonAspect && sunMoonAspect.type === 'Karşıt' && sunMoonAspect.orb < 3.0;

  if (isNewMoon || isFullMoon) {
    totalScore += 2.0;
  }

  // Cazimi check (4.0 points)
  const cazimi = transitTransitAspects.find(
    a => ((a.planet1 === 'Güneş' && a.planet2 === 'Merkür') || (a.planet1 === 'Merkür' && a.planet2 === 'Güneş')) &&
         a.type === 'Kavuşum' && a.orb <= 0.5
  );
  if (cazimi) {
    totalScore += 4.0;
  }

  // Check transit aspects (personal transits to natal)
  const outerPlanets = ['Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton', 'Kiron'];
  const personalPlanets = ['Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars'];
  const criticalNatalPoints = ['Güneş', 'Ay', 'Yükselen (ASC)', 'Tepe Noktası (MC)'];

  const tightHardAspects = transitAspects.filter(
    a => (a.type === 'Kare' || a.type === 'Karşıt') && a.orb < 1.5
  );

  transitAspects.forEach(aspect => {
    // Rule A: Outer planet exact transit to natal planet (orb < 1.5) -> 4.0 points
    const isOuterPlanet = outerPlanets.includes(aspect.transitPlanet);
    if (isOuterPlanet && aspect.orb < 1.5) {
      totalScore += 4.0;
    }

    // Rule B: Personal planet transit to critical natal points with tight orb (< 1.0) and major aspects -> 3.0 points
    const isPersonalPlanet = personalPlanets.includes(aspect.transitPlanet);
    const isCriticalPoint = criticalNatalPoints.includes(aspect.natalPlanet);
    const isHardAspect = aspect.type === 'Kavuşum' || aspect.type === 'Kare' || aspect.type === 'Karşıt';
    
    if (isPersonalPlanet && isCriticalPoint && isHardAspect && aspect.orb < 1.0) {
      totalScore += 3.0;
    }

    // Rule C: Minor personal transits (orb < 1.0) -> 0.5 points
    if (isPersonalPlanet && aspect.orb < 1.0 && !isCriticalPoint) {
      totalScore += 0.5;
    }
  });

  const isSpecialDay = totalScore >= 4.0;

  // If it's a calm day with no significant triggers, don't force intense advice
  if (!isSpecialDay) {
    return {
      activeChakras: [],
      groundingTime: 'Rutin Temas (15-20 dk)',
      breathWork: 'Doğal Nefes Ritmi',
      subconsciousFocus: 'Zihni dinlendirme, özel bir çalışma veya arınma gerekmiyor.',
      dailyAffirmation: 'Bugün hayatın doğal akışıyla ve dengesiyle uyum içindeyim.',
      reasoning: 'Bugün haritanızda kadersel, yoğun veya gerilimli bir göksel tetiklenme bulunmuyor. Gökyüzü sakin ve dengeli. Enerjinizi zorlamadan günlük rutininizi sürdürebilirsiniz.'
    };
  }

  // 3. Determine Grounding Time based on user rules for Special Days
  let groundingTime = 'En az 41 dakika';
  let groundingReason = 'Yer ana (Gaia) ile hizalanmak ve rezonansa girmek için en az 41 dakika toprakla temas edin.';

  if (isNewMoon || isFullMoon) {
    groundingTime = 'Mümkünse gün boyu';
    groundingReason = `${isNewMoon ? 'Yeniay' : 'Dolunay'} fazının güçlü manyetik ve ruhsal etkileriyle bütünleşmek için gün boyu doğayla ve toprakla temas halinde kalın.`;
  } else if (tightHardAspects.length > 0) {
    groundingTime = '1 saat üzeri';
    groundingReason = `Gökyüzündeki gerilimli etkileri (${tightHardAspects.map(a => `${a.transitPlanet}-${a.natalPlanet} ${a.type}`).join(', ')}) dengelemek ve topraklamak için en az 1 saat toprakla temas edin.`;
  }

  // 4. Determine Breath Work and Subconscious Focus based on active aspects and houses
  let breathWork = '4-4-4 Kare Nefes';
  const sunHouse = tSun ? tSun.house : 1;

  let subconsciousFocus = 'Günlük rutinleri düzene sokma ve bedensel arınma.';
  let dailyAffirmation = 'Kendimi ve bedenimi sevgiyle kabul ediyorum, Gaia ile uyum içindeyim.';

  if (tightHardAspects.length > 0) {
    breathWork = '4-4-8 Rahatlama Nefesi veya Pranayama (Sinir sistemini yatıştırmak için)';
    subconsciousFocus = 'Blokaj temizleme, gölge yönlerle yüzleşme ve travma şifalandırma çalışması.';
    dailyAffirmation = 'Fırtınaların ortasında merkezimde kalmayı, huzuru ve dengeyi seçiyorum.';
  } else if (cazimi) {
    // Dynamically adjust recommendations based on WHICH HOUSE the Sun-Mercury Cazimi falls in!
    const houseThemes: Record<number, { breath: string; focus: string; affirmation: string }> = {
      1: {
        breath: 'Başlangıç ve Canlılık Nefesi (Cazimi - 1. evinizde bedensel yenilenme)',
        focus: 'Kişisel hedefleri netleştirme, fiziksel canlılık ve yeni kararlar için niyet etme.',
        affirmation: 'Kendimi tüm varlığımla kabul ediyor, hayatımda yepyeni ve parlak bir sayfa açıyorum.'
      },
      2: {
        breath: 'Bolluk ve Öz Değer Nefesi (Cazimi - 2. evinizde bolluk bilinci)',
        focus: 'Finansal niyetler yazma, öz güven tazeleme and öz değer bilincini artırma.',
        affirmation: 'Hayatın tüm bolluk ve bereketine kendimi açıyorum, kendi değerimin farkındayım.'
      },
      3: {
        breath: 'Zihinsel Netlik Nefesi (Cazimi - 3. evinizde zihinsel vizyon)',
        focus: 'Yeni anlaşmalar, eğitim niyetleri ve yakın çevre ilişkilerini şifalandırma.',
        affirmation: 'Zihnim net, sözlerim güçlü ve yaratıcı fikirlerle doluyum.'
      },
      4: {
        breath: 'Köklenme ve Güven Nefesi (Cazimi - 4. evinizde ailevi şifalanma)',
        focus: 'Aile içi huzur niyetleri, köklerle barışma ve ev ortamını arındırma.',
        affirmation: 'Köklerimden gelen güçle güvendeyim, yuvamda huzuru ve sevgiyi seçiyorum.'
      },
      5: {
        breath: 'Yaratıcılık ve Neşe Nefesi (Cazimi - 5. evinizde yaratıcı manifest)',
        focus: 'Sanatsal projeler, hobiler veya aşk hayatı için niyet tohumları ekme.',
        affirmation: 'Hayatın neşesini ve yaratıcı enerjimi sevgiyle dışarıya yansıtıyorum.'
      },
      6: {
        breath: 'Şifa ve Hizmet Nefesi (Cazimi - 6. evinizde bedensel arınma)',
        focus: 'Sağlıklı yaşam kararları alma ve günlük çalışma düzenini şifalandırma.',
        affirmation: 'Bedenime sevgiyle bakıyor, onu şifa, sağlık ve zindelikle dolduruyorum.'
      },
      7: {
        breath: 'Uyum ve İlişki Nefesi (Cazimi - 7. evinizde ilişkileri şifalandırma)',
        focus: 'Ortaklıklar, evlilik ve ikili ilişkilerde denge ve sevgi niyetleri.',
        affirmation: 'İlişkilerimde sevgi, saygı ve mükemmel bir uyumu tezahür ettiriyorum.'
      },
      8: {
        breath: 'Simya ve Dönüşüm Nefesi (Cazimi - 8. evinizde derin arınma)',
        focus: 'Ortak kaynaklar, finansal kriz çözümleri ve korkuları dönüştürme çalışması.',
        affirmation: 'Tüm korkularımı güce dönüştürüyor, hayatın akışına güvenle teslim oluyorum.'
      },
      9: {
        breath: 'Bilgelik ve Keşif Nefesi (Cazimi - 9. evinizde vizyon genişletme)',
        focus: 'Eğitim, yüksek bilgi, seyahat ve felsefi konularda yeni ufuklara niyet etme.',
        affirmation: 'Evrenin bilgeliğine kendimi açıyor, inançlarımla hayatımı güzelleştiriyorum.'
      },
      10: {
        breath: 'Başarı ve Liderlik Nefesi (Cazimi - 10. evinizde kariyer odağı)',
        focus: 'Kariyer hedefleri yazma, iş hayatında başarı ve toplumsal statü niyetleri.',
        affirmation: 'Kariyerimde parlıyor, sorumluluklarımı başarıyla ve güvenle yerine getiriyorum.'
      },
      11: {
        breath: 'Vizyon ve Topluluk Nefesi (Cazimi - 11. evinizde gelecek idealleri)',
        focus: 'Gelecek hedeflerini kağıda dökme, dilekleri netleştirme ve sosyal çevre niyetleri.',
        affirmation: 'Geleceğe güvenle yürüyorum, hayallerimin kolaylıkla gerçekleşmesine izin veriyorum.'
      },
      12: {
        breath: 'Rüya ve Meditasyon Nefesi (Cazimi - 12. evinizde rüyalar yoluyla manifest)',
        focus: 'Rüya günlüğü tutma, uyku öncesi niyetler ve derin bilinçaltı blokaj temizliği.',
        affirmation: 'Bilinçaltımdaki tüm eski kalıpları sevgiyle serbest bırakıyor, rüyalarımın rehberliğini kabul ediyorum.'
      }
    };

    const theme = houseThemes[sunHouse] || houseThemes[12];
    breathWork = theme.breath;
    subconsciousFocus = theme.focus;
    dailyAffirmation = theme.affirmation;
  } else if (isNewMoon || isFullMoon) {
    subconsciousFocus = 'Rüya günlüğü tutma, eski kalıpları serbest bırakma ve niyet tohumları ekme.';
    dailyAffirmation = isNewMoon 
      ? 'Yeniliğe ve hayatın bana sunduğu tüm güzel olasılıklara kendimi açıyorum.'
      : 'Bana hizmet etmeyen tüm eski duyguları ve yükleri sevgiyle serbest bırakıyorum.';
  }

  return {
    activeChakras,
    groundingTime,
    breathWork,
    subconsciousFocus,
    dailyAffirmation,
    reasoning: groundingReason
  };
}
