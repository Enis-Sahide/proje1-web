import { generateTransitChart } from '../src/features/astrology/engine/AstrologyEngine';
import moment from 'moment-timezone';

async function main() {
  const cityData = { name: 'Giresun', lat: 40.9167, lon: 38.3833, country: 'Türkiye', tz: 'Europe/Istanbul' };
  const natalDate = '1995-03-17';
  const natalTime = '18:05';
  
  const nMoment = moment.tz(`${natalDate} ${natalTime}:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
  const nDateObj = nMoment.toDate();

  console.log(`| Gün | Özel Gün mü? | Puan | Önemli Göksel Tetiklenmeler | Topraklanma Süresi | Nefes Çalışması |`);
  console.log(`| :--- | :--- | :--- | :--- | :--- | :--- |`);

  // Loop through all days of August 2026
  for (let day = 1; day <= 31; day++) {
    const dayStr = String(day).padStart(2, '0');
    // Run for 12:00 PM (noon) to get stable daily transits
    const tMoment = moment.tz(`2026-08-${dayStr} 12:00:00`, 'YYYY-MM-DD HH:mm:ss', cityData.tz);
    const tDateObj = tMoment.toDate();

    const transitData = await generateTransitChart(nDateObj, tDateObj, cityData);
    const guidance = transitData.holisticGuidance;

    if (guidance) {
      const isSpecial = guidance.groundingTime !== 'Rutin Temas (15-20 dk)';
      
      // Let's manually recalculate score for output logging
      let score = 0;
      
      // Conjunction of Sun-Moon (New Moon/Full Moon)
      const sunMoonAspect = transitData.transitTransitAspects.find(
        a => (a.planet1 === 'Güneş' && a.planet2 === 'Ay') || (a.planet1 === 'Ay' && a.planet2 === 'Güneş')
      );
      const isNewMoon = sunMoonAspect && sunMoonAspect.type === 'Kavuşum' && sunMoonAspect.orb < 3.0;
      const isFullMoon = sunMoonAspect && sunMoonAspect.type === 'Karşıt' && sunMoonAspect.orb < 3.0;
      if (isNewMoon || isFullMoon) score += 2.0;

      // Cazimi
      const cazimi = transitData.transitTransitAspects.find(
        a => ((a.planet1 === 'Güneş' && a.planet2 === 'Merkür') || (a.planet1 === 'Merkür' && a.planet2 === 'Güneş')) &&
             a.type === 'Kavuşum' && a.orb <= 0.5
      );
      if (cazimi) score += 4.0;

      const outerPlanets = ['Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton', 'Kiron'];
      const personalPlanets = ['Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars'];
      const criticalNatalPoints = ['Güneş', 'Ay', 'Yükselen (ASC)', 'Tepe Noktası (MC)'];

      const triggers: string[] = [];
      if (isNewMoon) triggers.push('Yeniay');
      if (isFullMoon) triggers.push('Dolunay');
      if (cazimi) triggers.push('Güneş-Merkür Cazimi');

      transitData.transitAspects.forEach(aspect => {
        const isOuter = outerPlanets.includes(aspect.transitPlanet);
        if (isOuter && aspect.orb < 1.5) {
          score += 4.0;
          triggers.push(`T.${aspect.transitPlanet}-N.${aspect.natalPlanet} ${aspect.type} (Orb: ${aspect.orb.toFixed(1)}°)`);
        }

        const isPersonal = personalPlanets.includes(aspect.transitPlanet);
        const isCritical = criticalNatalPoints.includes(aspect.natalPlanet);
        const isHard = aspect.type === 'Kavuşum' || aspect.type === 'Kare' || aspect.type === 'Karşıt';

        if (isPersonal && isCritical && isHard && aspect.orb < 1.0) {
          score += 3.0;
          triggers.push(`T.${aspect.transitPlanet}-N.${aspect.natalPlanet} ${aspect.type} (Orb: ${aspect.orb.toFixed(1)}°)`);
        }

        if (isPersonal && aspect.orb < 1.0 && !isCritical) {
          score += 0.5;
          triggers.push(`T.${aspect.transitPlanet}-N.${aspect.natalPlanet} ${aspect.type} (Orb: ${aspect.orb.toFixed(1)}°)`);
        }
      });

      if (isSpecial) {
        console.log(`| **2026-08-${dayStr}** | Evet (Özel) | **${score.toFixed(1)}** | ${triggers.join(', ') || 'Cazimi/Ay Fazı'} | ${guidance.groundingTime} | ${guidance.breathWork.split(' (')[0]} |`);
      } else {
        console.log(`| 2026-08-${dayStr} | Hayır (Sakin) | ${score.toFixed(1)} | - | ${guidance.groundingTime} | ${guidance.breathWork} |`);
      }
    }
  }
}

main().catch(console.error);
