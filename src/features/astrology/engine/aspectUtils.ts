import { AstroPoint, AstroAspect } from './AstrologyConstants';

export function calculateAspects(planets: AstroPoint[]): AstroAspect[] {
  const aspects: AstroAspect[] = [];
  const orbs = {
    'Kavuşum': 10,
    'Karşıt': 10,
    'Üçgen': 8,
    'Kare': 8,
    'Sekstil': 6,
    'Görmeyen': 4
  };

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      let type: AstroAspect['type'] | null = null;
      let exactOrb = 0;

      if (diff <= orbs['Kavuşum']) { type = 'Kavuşum'; exactOrb = diff; }
      else if (Math.abs(diff - 180) <= orbs['Karşıt']) { type = 'Karşıt'; exactOrb = Math.abs(diff - 180); }
      else if (Math.abs(diff - 150) <= orbs['Görmeyen']) { type = 'Görmeyen'; exactOrb = Math.abs(diff - 150); }
      else if (Math.abs(diff - 120) <= orbs['Üçgen']) { type = 'Üçgen'; exactOrb = Math.abs(diff - 120); }
      else if (Math.abs(diff - 90) <= orbs['Kare']) { type = 'Kare'; exactOrb = Math.abs(diff - 90); }
      else if (Math.abs(diff - 60) <= orbs['Sekstil']) { type = 'Sekstil'; exactOrb = Math.abs(diff - 60); }

      if (type) {
        aspects.push({
          planet1: p1.name,
          planet2: p2.name,
          type,
          orb: exactOrb,
          isExact: exactOrb <= 1.0
        });
      }
    }
  }
  return aspects;
}
