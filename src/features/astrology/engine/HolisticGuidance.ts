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

  // 2. Determine Grounding Time based on user rules
  let groundingTime = 'En az 41 dakika';
  let groundingReason = 'Yer ana (Gaia) ile hizalanmak ve rezonansa girmek için en az 41 dakika toprakla temas edin.';

  // Check for New Moon / Full Moon in transit transit aspects
  const sunMoonAspect = transitTransitAspects.find(
    a => (a.planet1 === 'Güneş' && a.planet2 === 'Ay') || (a.planet1 === 'Ay' && a.planet2 === 'Güneş')
  );

  const isNewMoon = sunMoonAspect && sunMoonAspect.type === 'Kavuşum' && sunMoonAspect.orb < 5;
  const isFullMoon = sunMoonAspect && sunMoonAspect.type === 'Karşıt' && sunMoonAspect.orb < 5;

  // Check for very hard aspects (Square/Opposition with tight orb < 2°)
  const tightHardAspects = transitAspects.filter(
    a => (a.type === 'Kare' || a.type === 'Karşıt') && a.orb < 2.0
  );

  if (isNewMoon || isFullMoon) {
    groundingTime = 'Mümkünse gün boyu';
    groundingReason = `${isNewMoon ? 'Yeniay' : 'Dolunay'} fazının güçlü manyetik ve ruhsal etkileriyle bütünleşmek için gün boyu doğayla ve toprakla temas halinde kalın.`;
  } else if (tightHardAspects.length > 0) {
    groundingTime = '1 saat üzeri';
    groundingReason = `Gökyüzündeki gerilimli etkileri (${tightHardAspects.map(a => `${a.transitPlanet}-${a.natalPlanet} ${a.type}`).join(', ')}) dengelemek ve topraklamak için en az 1 saat toprakla temas edin.`;
  }

  // 3. Determine Breath Work
  let breathWork = '4-4-4 Kare Nefes';
  if (tightHardAspects.length > 0) {
    breathWork = '4-4-8 Rahatlama Nefesi veya Pranayama (Sinir sistemini yatıştırmak için)';
  } else {
    // Check for Cazimi (Sun-Mercury conjunction with orb < 0.5°)
    const cazimi = transitTransitAspects.find(
      a => ((a.planet1 === 'Güneş' && a.planet2 === 'Merkür') || (a.planet1 === 'Merkür' && a.planet2 === 'Güneş')) &&
           a.type === 'Kavuşum' && a.orb <= 0.5
    );
    if (cazimi) {
      breathWork = 'Pranayama ve Niyet Çalışması (Cazimi - Dile benden ne dilersen kapısı açık)';
    }
  }

  // 4. Subconscious focus
  let subconsciousFocus = 'Günlük rutinleri düzene sokma ve bedensel arınma.';
  if (isNewMoon || isFullMoon) {
    subconsciousFocus = 'Rüya günlüğü tutma, eski kalıpları serbest bırakma ve niyet tohumları ekme.';
  } else if (tightHardAspects.length > 0) {
    subconsciousFocus = 'Blokaj temizleme, gölge yönlerle yüzleşme ve travma şifalandırma çalışması.';
  }

  // 5. Daily Affirmation
  let dailyAffirmation = 'Kendimi ve bedenimi sevgiyle kabul ediyorum, Gaia ile uyum içindeyim.';
  if (isNewMoon) {
    dailyAffirmation = 'Yeniliğe ve hayatın bana sunduğu tüm güzel olasılıklara kendimi açıyorum.';
  } else if (isFullMoon) {
    dailyAffirmation = 'Bana hizmet etmeyen tüm eski duyguları ve yükleri sevgiyle serbest bırakıyorum.';
  } else if (tightHardAspects.length > 0) {
    dailyAffirmation = 'Fırtınaların ortasında merkezimde kalmayı, huzuru ve dengeyi seçiyorum.';
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
