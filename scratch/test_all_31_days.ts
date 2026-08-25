import { generateTransitChart } from '../src/features/astrology/engine/AstrologyEngine';
import moment from 'moment-timezone';

async function main() {
  const cityData = { name: 'Giresun', lat: 40.9167, lon: 38.3833, country: 'Türkiye', tz: 'Europe/Istanbul' };
  const natalDate = '1995-03-17';
  const natalTime = '18:05';
  
  const nMoment = moment.tz(`${natalDate} ${natalTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
  const nDateObj = nMoment.toDate();

  console.log(`### 17 Mart 1995 18:05 Giresun Doğumlu Kişi İçin Temmuz 2026 Özel Gün Analizi\n`);
  console.log(`Bu analiz, gökyüzünün yavaş hareket eden arka plan gezegen etkilerini (Satürn, Jüpiter, Uranüs vb. uzun vadeli etkileri) hariç tutarak, doğrudan **Günün Tetikleyicilerine** (Yeniay, Dolunay, Cazimi ve hızlı gezegenlerin Yükselen/Güneş/Ay ile kurduğu tam açılar) odaklanır.\n`);
  console.log(`| Gün | Önemli Tetikleyici Gelişme | Önerilen Holistik Çalışma | Topraklanma | Olumlama / Zihinsel Kodlama |`);
  console.log(`| :--- | :--- | :--- | :--- | :--- |`);

  for (let day = 1; day <= 31; day++) {
    const dayStr = String(day).padStart(2, '0');
    const tMoment = moment.tz(`2026-07-${dayStr} 12:00:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const tDateObj = tMoment.toDate();

    const transitData = await generateTransitChart(nDateObj, tDateObj, cityData);
    
    // Recalculate triggers
    const sunMoonAspect = transitData.transitTransitAspects.find(
      a => (a.planet1 === 'Güneş' && a.planet2 === 'Ay') || (a.planet1 === 'Ay' && a.planet2 === 'Güneş')
    );
    const isNewMoon = sunMoonAspect && sunMoonAspect.type === 'Kavuşum' && sunMoonAspect.orb < 3.0;
    const isFullMoon = sunMoonAspect && sunMoonAspect.type === 'Karşıt' && sunMoonAspect.orb < 3.0;

    const cazimi = transitData.transitTransitAspects.find(
      a => ((a.planet1 === 'Güneş' && a.planet2 === 'Merkür') || (a.planet1 === 'Merkür' && a.planet2 === 'Güneş')) &&
           a.type === 'Kavuşum' && a.orb <= 0.5
    );

    const personalPlanets = ['Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars'];
    const criticalNatalPoints = ['Güneş', 'Ay', 'Yükselen (ASC)', 'Tepe Noktası (MC)'];

    const activeTriggers: string[] = [];
    if (isNewMoon) activeTriggers.push('Yeniay (Bilinçaltı Başlangıç)');
    if (isFullMoon) activeTriggers.push('Dolunay (Duygusal Bitiş/Hasat)');
    if (cazimi) activeTriggers.push('Güneş-Merkür Cazimi (Manifest Kapısı)');

    transitData.transitAspects.forEach(aspect => {
      const isPersonal = personalPlanets.includes(aspect.transitPlanet);
      const isCritical = criticalNatalPoints.includes(aspect.natalPlanet);
      const isHard = aspect.type === 'Kavuşum' || aspect.type === 'Kare' || aspect.type === 'Karşıt';

      if (isPersonal && isCritical && isHard && aspect.orb < 1.2) {
        activeTriggers.push(`T.${aspect.transitPlanet} - N.${aspect.natalPlanet} ${aspect.type} (Kritik Tetiklenme)`);
      }
    });

    const hasTrigger = activeTriggers.length > 0;
    const guidance = transitData.holisticGuidance;

    if (hasTrigger && guidance) {
      console.log(`| **2026-07-${dayStr}** | ${activeTriggers.join(', ')} | ${guidance.breathWork.split(' (')[0]} | ${guidance.groundingTime} | *"${guidance.dailyAffirmation}"* |`);
    } else {
      // Just print a regular calm day line
      console.log(`| 2026-07-${dayStr} | - (Sakin/Dengeli Akış) | Doğal Nefes Ritmi | Rutin Temas (15-20 dk) | *"Bugün hayatın akışıyla uyum içindeyim."* |`);
    }
  }
}

main().catch(console.error);
