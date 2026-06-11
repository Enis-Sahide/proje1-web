import React from 'react';
import { HumanDesignChart, CenterCode, CHANNELS, PLANET_SYMBOLS } from '@/utils/HumanDesignEngine';

const COLORS = {
  background: '#0F172A',
  primary: '#0EA5E9',
  accent: '#E63946',
  conscious: '#FFFFFF',
  text: '#E0E0E0',
  textMuted: '#9CA3AF',
  cardBg: 'rgba(15, 23, 42, 0.8)',
};

const CENTER_COORDS: Record<CenterCode, { x: number, y: number, shape: string, color: string, s: number }> = {
  Head: { x: 200, y: 50, shape: 'triangle', color: '#F4D03F', s: 25 },
  Ajna: { x: 200, y: 110, shape: 'triangle-down', color: '#A8D5BA', s: 25 },
  Throat: { x: 200, y: 190, shape: 'square', color: '#D2B48C', s: 25 },
  G: { x: 200, y: 300, shape: 'diamond', color: '#F4D03F', s: 20 },
  Heart: { x: 255, y: 340, shape: 'triangle-down', color: '#E63946', s: 24 },
  Sacral: { x: 200, y: 430, shape: 'square', color: '#E63946', s: 25 },
  Root: { x: 200, y: 510, shape: 'square', color: '#D2B48C', s: 25 },
  Spleen: { x: 90, y: 400, shape: 'triangle-right', color: '#D2B48C', s: 30 },
  SolarPlexus: { x: 310, y: 400, shape: 'triangle-left', color: '#D2B48C', s: 30 },
};

const GATE_COORDS: Record<number, { x: number, y: number }> = {
  // Head
  64: { x: 185, y: 75 }, 61: { x: 200, y: 75 }, 63: { x: 215, y: 75 },
  // Ajna
  47: { x: 185, y: 85 }, 24: { x: 200, y: 85 }, 4: { x: 215, y: 85 },
  17: { x: 188, y: 110 }, 43: { x: 200, y: 135 }, 11: { x: 212, y: 110 },
  // Throat
  62: { x: 185, y: 165 }, 23: { x: 200, y: 165 }, 56: { x: 215, y: 165 },
  16: { x: 175, y: 182 }, 35: { x: 225, y: 176 },
  20: { x: 175, y: 198 }, 12: { x: 225, y: 190 },
  31: { x: 182, y: 215 }, 45: { x: 225, y: 204 },
  8: { x: 200, y: 215 }, 33: { x: 218, y: 215 },
  // G
  7: { x: 190, y: 290 }, 1: { x: 200, y: 280 }, 13: { x: 210, y: 290 },
  10: { x: 180, y: 300 }, 25: { x: 220, y: 300 },
  15: { x: 190, y: 310 }, 2: { x: 200, y: 320 }, 46: { x: 210, y: 310 },
  // Heart
  21: { x: 250, y: 316 }, 51: { x: 243, y: 340 },
  26: { x: 255, y: 364 }, 40: { x: 267, y: 340 },
  // Sacral
  5: { x: 185, y: 405 }, 14: { x: 200, y: 405 }, 29: { x: 215, y: 405 },
  34: { x: 175, y: 420 }, 59: { x: 225, y: 420 },
  27: { x: 175, y: 455 }, 
  42: { x: 190, y: 455 }, 3: { x: 205, y: 455 }, 9: { x: 220, y: 455 },
  // Root
  53: { x: 185, y: 485 }, 60: { x: 200, y: 485 }, 52: { x: 215, y: 485 },
  54: { x: 175, y: 500 }, 19: { x: 225, y: 500 },
  38: { x: 175, y: 515 }, 39: { x: 225, y: 515 },
  58: { x: 175, y: 530 }, 41: { x: 225, y: 530 },
  // Spleen
  48: { x: 60, y: 370 }, 57: { x: 95, y: 387 }, 44: { x: 75, y: 377 }, 50: { x: 120, y: 400 },
  32: { x: 100, y: 410 }, 28: { x: 80, y: 420 }, 18: { x: 60, y: 430 },
  // Solar Plexus
  36: { x: 340, y: 370 }, 22: { x: 325, y: 377 }, 37: { x: 305, y: 387 }, 6: { x: 280, y: 400 },
  49: { x: 300, y: 410 }, 55: { x: 320, y: 420 }, 30: { x: 340, y: 430 },
};

interface Props {
  chart: HumanDesignChart;
}

export default function HumanDesignBodygraph({ chart }: Props) {
  const drawChannels = () => {
    if (!chart) return null;
    const elements: React.ReactNode[] = [];

    CHANNELS.forEach(ch => {
       const g1 = ch.gates[0];
       const g2 = ch.gates[1];
       const c1 = GATE_COORDS[g1];
       const c2 = GATE_COORDS[g2];
       if (!c1 || !c2) return;
       elements.push(<path d={`M ${c1.x} ${c1.y} L ${c2.x} ${c2.y}`} stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" key={`bg-${ch.id}`} />);
    });
    
    // 2. Aktif kanallar (yarım/tam)
    CHANNELS.forEach(ch => {
       const g1 = ch.gates[0];
       const g2 = ch.gates[1];
       const c1 = GATE_COORDS[g1];
       const c2 = GATE_COORDS[g2];
       if (!c1 || !c2) return;

       const mx = (c1.x + c2.x) / 2;
       const my = (c1.y + c2.y) / 2;
       const g1Path = `M ${c1.x} ${c1.y} L ${mx} ${my}`;
       const g2Path = `M ${c2.x} ${c2.y} L ${mx} ${my}`;

       const g1Cons = chart.conscious.some(p => p.gate === g1);
       const g1Unc = chart.unconscious.some(p => p.gate === g1);
       const g2Cons = chart.conscious.some(p => p.gate === g2);
       const g2Unc = chart.unconscious.some(p => p.gate === g2);

       const drawHalf = (pathD: string, isConscious: boolean, isUnconscious: boolean, keyPrefix: string) => {
          if (isConscious && isUnconscious) {
            elements.push(<path d={pathD} stroke="#111" strokeWidth="6" strokeLinecap="square" fill="none" key={`${keyPrefix}-b`} />);
            elements.push(<path d={pathD} stroke={COLORS.accent} strokeWidth="6" strokeLinecap="square" strokeDasharray="6 6" fill="none" key={`${keyPrefix}-r`} />);
          } else if (isConscious) {
            elements.push(<path d={pathD} stroke="#111" strokeWidth="6" strokeLinecap="square" fill="none" key={`${keyPrefix}-con`} />);
          } else if (isUnconscious) {
            elements.push(<path d={pathD} stroke={COLORS.accent} strokeWidth="6" strokeLinecap="square" fill="none" key={`${keyPrefix}-unc`} />);
          }
       }

       drawHalf(g1Path, g1Cons, g1Unc, `g1-${ch.id}`);
       drawHalf(g2Path, g2Cons, g2Unc, `g2-${ch.id}`);
    });
    
    return elements;
  };

  const drawCenters = () => {
    if (!chart) return null;
    return Object.entries(CENTER_COORDS).map(([center, def]) => {
      const isDefined = chart.definedCenters.includes(center as CenterCode);
      const fill = isDefined ? def.color : '#FFFFFF';
      const stroke = isDefined ? 'none' : '#94A3B8';
      const s = def.s;
      
      const drawShape = (dx: number, dy: number) => {
        const sw = isDefined ? 0 : 1;
        if (def.shape === 'square') {
          return <rect x={def.x - s + dx} y={def.y - s + dy} width={s*2} height={s*2} fill={fill} stroke={stroke} strokeWidth={sw} key="mg" />;
        } else if (def.shape === 'diamond') {
          return <polygon points={`${def.x + dx},${def.y-s-2 + dy} ${def.x+s+2 + dx},${def.y + dy} ${def.x + dx},${def.y+s+2 + dy} ${def.x-s-2 + dx},${def.y + dy}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle') {
          return <polygon points={`${def.x + dx},${def.y-s + dy} ${def.x+s + dx},${def.y+s + dy} ${def.x-s + dx},${def.y+s + dy}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle-down') {
          return <polygon points={`${def.x-s + dx},${def.y-s + dy} ${def.x+s + dx},${def.y-s + dy} ${def.x + dx},${def.y+s + dy}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle-left') {
          return <polygon points={`${def.x+s + dx},${def.y-s + dy} ${def.x+s + dx},${def.y+s + dy} ${def.x-s + dx},${def.y + dy}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle-right') {
          return <polygon points={`${def.x-s + dx},${def.y-s + dy} ${def.x+s + dx},${def.y + dy} ${def.x-s + dx},${def.y+s + dy}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        }
        return null;
      };

      return (
        <g key={center}>
          {drawShape(0, 0)}
        </g>
      );
    });
  }

  const drawGates = () => {
    if (!chart) return null;
    return Object.entries(GATE_COORDS).map(([gateId, coords]) => {
      const gNum = parseInt(gateId);
      const isCons = chart.conscious.some(p => p.gate === gNum);
      const isUnc = chart.unconscious.some(p => p.gate === gNum);
      const isActive = isCons || isUnc;
      
      let shiftX = 0;
      let shiftY = 0;
      let centerSize = 10;
      
      const centerCoordsObj = CHANNELS.find(ch => ch.gates.includes(gNum));
      if (centerCoordsObj) {
        const c1Name = centerCoordsObj.centers[0];
        const c2Name = centerCoordsObj.centers[1];
        const c1 = CENTER_COORDS[c1Name as CenterCode];
        const c2 = CENTER_COORDS[c2Name as CenterCode];
        const dist1 = Math.hypot(c1.x - coords.x, c1.y - coords.y);
        const dist2 = Math.hypot(c2.x - coords.x, c2.y - coords.y);
        const myCenter = dist1 < dist2 ? c1 : c2;
        centerSize = myCenter.s;
        
        const dx = myCenter.x - coords.x;
        const dy = myCenter.y - coords.y;
        const len = Math.hypot(dx, dy);
        if (len > 0) {
           shiftX = (dx / len) * (centerSize * 0.30);
           shiftY = (dy / len) * (centerSize * 0.30);
        }
      }

      const textX = coords.x + shiftX;
      const textY = coords.y + shiftY;

      return (
        <g key={`glabel-${gateId}`}>
          {isActive && <circle cx={textX} cy={textY} r={6.5} fill={COLORS.primary} />}
          <text 
            x={textX} 
            y={textY} 
            fontSize={isActive ? "7" : "8"} 
            fill={isActive ? "#FFFFFF" : "#64748B"} 
            fontWeight={isActive ? "900" : "bold"} 
            textAnchor="middle"
            dominantBaseline="central"
          >
            {gNum}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center">
      {/* Design Column */}
      <div className="w-full lg:w-1/4 flex flex-col gap-2 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
        <h3 className="text-center font-bold uppercase mb-2 text-rose-500">Design</h3>
        {chart.unconscious.map((p, i) => (
          <div key={`unc-${i}`} className="flex justify-between items-center text-rose-500 font-bold">
            <span className="text-lg">{PLANET_SYMBOLS[p.planet] || '?'}</span>
            <span>{p.gate}.{p.line}</span>
          </div>
        ))}
      </div>

      {/* SVG Bodygraph */}
      <div className="w-full lg:w-2/4 bg-sky-500/20 p-4 rounded-xl flex justify-center items-center overflow-hidden">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="40 10 320 540" 
          className="max-h-[600px] drop-shadow-2xl"
          style={{ overflow: 'visible' }}
        >
          {drawChannels()}
          {drawCenters()}
          {drawGates()}
        </svg>
      </div>

      {/* Personality Column */}
      <div className="w-full lg:w-1/4 flex flex-col gap-2 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
        <h3 className="text-center font-bold uppercase mb-2 text-white">Personality</h3>
        {chart.conscious.map((p, i) => (
          <div key={`con-${i}`} className="flex justify-between items-center text-white font-bold">
            <span>{p.gate}.{p.line}</span>
            <span className="text-lg">{PLANET_SYMBOLS[p.planet] || '?'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
