"use client";

import React, { useState } from 'react';
import { AstroPoint, AstroAspect } from '@/features/astrology/engine/AstrologyConstants';

interface MundaneSkyWheelProps {
  planets: AstroPoint[];
  aspects: AstroAspect[];
  ascendant?: AstroPoint;
  onSelectAspect?: (aspect: AstroAspect) => void;
  onSelectPlanet?: (planet: AstroPoint) => void;
}

const ZODIAC_ORDER = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];
const ZODIAC_COLORS: Record<string, string> = {
  'Koç': '#FF453A', 'Boğa': '#32D74B', 'İkizler': '#FFD60A', 'Yengeç': '#E5E5EA',
  'Aslan': '#FF9F0A', 'Başak': '#32D74B', 'Terazi': '#FFD60A', 'Akrep': '#FF453A',
  'Yay': '#FF9F0A', 'Oğlak': '#8E8E93', 'Kova': '#0A84FF', 'Balık': '#0A84FF'
};
const ZODIAC_SYMBOLS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋', 'Aslan': '♌', 'Başak': '♍',
  'Terazi': '♎', 'Akrep': '♏', 'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓'
};
const PLANET_SYMBOLS: Record<string, string> = {
  'Güneş': '☉', 'Ay': '☽', 'Merkür': '☿', 'Venüs': '♀', 'Mars': '♂', 
  'Jüpiter': '♃', 'Satürn': '♄', 'Uranüs': '♅', 'Neptün': '♆', 'Plüton': '♇',
  'Kiron': '⚷', 'Kuzey Ay Düğümü': '☊', 'Lilith': '⚸'
};

const ASPECT_COLORS: Record<string, string> = {
  'Kavuşum': '#D4AF37',
  'Sekstil': '#0A84FF',
  'Kare': '#FF453A',
  'Üçgen': '#32D74B',
  'Karşıt': '#FF453A',
  'Görmeyen': '#8E8E93'
};

const CHART_SIZE = 600;
const CENTER = CHART_SIZE / 2;
const RADIUS = CENTER - 70;

export default function MundaneSkyWheel({
  planets,
  aspects,
  ascendant,
  onSelectAspect,
  onSelectPlanet
}: MundaneSkyWheelProps) {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredAspect, setHoveredAspect] = useState<AstroAspect | null>(null);

  // Use ASC longitude for orientation or 0 (Aries at 9 o'clock)
  const baseDegree = ascendant ? ascendant.longitude : 0;

  const getX = (lon: number, r: number) => CENTER + r * Math.cos((180 + baseDegree - lon) * Math.PI / 180);
  const getY = (lon: number, r: number) => CENTER + r * Math.sin((180 + baseDegree - lon) * Math.PI / 180);

  const R_ZODIAC_OUTER = RADIUS;
  const R_ZODIAC_INNER = RADIUS - 32;
  const R_PLANET_RING = RADIUS - 60;
  const R_ASPECT_CORE = RADIUS - 90;

  // Major visible bodies
  const visiblePlanets = planets.filter(p => 
    ['Güneş', 'Ay', 'Merkür', 'Venüs', 'Mars', 'Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Plüton', 'Kiron'].includes(p.name)
  );

  const planetMap = new Map<string, AstroPoint>();
  visiblePlanets.forEach(p => planetMap.set(p.name, p));

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="relative w-full max-w-[620px] overflow-visible flex justify-center py-6 bg-black/40 rounded-3xl border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <svg 
          width={CHART_SIZE} 
          height={CHART_SIZE} 
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} 
          className="max-w-full h-auto drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Center glow gradient */}
            <radialGradient id="skyCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background circles */}
          <circle cx={CENTER} cy={CENTER} r={R_ASPECT_CORE} fill="url(#skyCenterGlow)" />
          <circle cx={CENTER} cy={CENTER} r={R_ASPECT_CORE} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <circle cx={CENTER} cy={CENTER} r={R_ZODIAC_INNER} stroke="rgba(212,175,55,0.35)" strokeWidth="1.5" fill="none" />
          <circle cx={CENTER} cy={CENTER} r={R_ZODIAC_OUTER} stroke="rgba(212,175,55,0.35)" strokeWidth="1.5" fill="none" />

          {/* 12 Zodiac Sign Segments */}
          {Array.from({ length: 12 }).map((_, i) => {
            const signLon = i * 30;
            const midLon = signLon + 15;
            const signName = ZODIAC_ORDER[i];
            return (
              <g key={`zodiac-seg-${i}`}>
                <line 
                  x1={getX(signLon, R_ZODIAC_OUTER)} 
                  y1={getY(signLon, R_ZODIAC_OUTER)} 
                  x2={getX(signLon, R_ZODIAC_INNER)} 
                  y2={getY(signLon, R_ZODIAC_INNER)} 
                  stroke="rgba(212,175,55,0.3)" 
                  strokeWidth="1" 
                />
                <text 
                  x={getX(midLon, RADIUS - 16)} 
                  y={getY(midLon, RADIUS - 16) + 6} 
                  fontSize="18" 
                  fill={ZODIAC_COLORS[signName]} 
                  textAnchor="middle" 
                  fontWeight="bold"
                  className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                >
                  {ZODIAC_SYMBOLS[signName]}
                </text>
              </g>
            );
          })}

          {/* Aspect Lines across the Center */}
          <g className="aspect-lines">
            {aspects.map((asp, idx) => {
              const p1 = planetMap.get(asp.planet1);
              const p2 = planetMap.get(asp.planet2);
              if (!p1 || !p2) return null;

              const isHighlighted = 
                hoveredAspect === asp || 
                hoveredPlanet === asp.planet1 || 
                hoveredPlanet === asp.planet2;

              const x1 = getX(p1.longitude, R_ASPECT_CORE);
              const y1 = getY(p1.longitude, R_ASPECT_CORE);
              const x2 = getX(p2.longitude, R_ASPECT_CORE);
              const y2 = getY(p2.longitude, R_ASPECT_CORE);

              const color = ASPECT_COLORS[asp.type] || '#888';

              return (
                <g key={`asp-${idx}`} className="cursor-pointer" onClick={() => onSelectAspect?.(asp)}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth={isHighlighted ? 2.5 : asp.isExact ? 1.5 : 0.8}
                    strokeOpacity={isHighlighted ? 0.95 : asp.isExact ? 0.6 : 0.3}
                    strokeDasharray={asp.type === 'Sekstil' || asp.type === 'Görmeyen' ? '4 4' : undefined}
                    onMouseEnter={() => setHoveredAspect(asp)}
                    onMouseLeave={() => setHoveredAspect(null)}
                  />
                </g>
              );
            })}
          </g>

          {/* Planet Glyphs and Badges */}
          {visiblePlanets.map((p, i) => {
            // Collision avoidance offset
            let rOffset = 0;
            for (let j = 0; j < i; j++) {
              if (Math.abs(p.longitude - visiblePlanets[j].longitude) < 6) {
                rOffset += 18;
              }
            }

            const px = getX(p.longitude, R_PLANET_RING - rOffset);
            const py = getY(p.longitude, R_PLANET_RING - rOffset);
            const isHovered = hoveredPlanet === p.name;

            return (
              <g 
                key={`pl-${p.name}`} 
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredPlanet(p.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
                onClick={() => onSelectPlanet?.(p)}
              >
                {/* Pointer ray to zodiac */}
                <line 
                  x1={getX(p.longitude, R_ZODIAC_INNER)} 
                  y1={getY(p.longitude, R_ZODIAC_INNER)} 
                  x2={px} 
                  y2={py} 
                  stroke={isHovered ? '#0EA5E9' : 'rgba(212,175,55,0.3)'} 
                  strokeWidth={isHovered ? 1.5 : 0.6} 
                  strokeDasharray="2 2" 
                />

                {/* Planet Circle */}
                <circle 
                  cx={px} 
                  cy={py} 
                  r={isHovered ? 15 : 13} 
                  fill="#0B0F19" 
                  stroke={isHovered ? '#0EA5E9' : '#D4AF37'} 
                  strokeWidth={isHovered ? 2 : 1.2}
                  className="filter drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                />

                {/* Glyph */}
                <text 
                  x={px} 
                  y={py + 5} 
                  fontSize="14" 
                  fill={isHovered ? '#0EA5E9' : '#D4AF37'} 
                  textAnchor="middle" 
                  fontWeight="bold"
                >
                  {PLANET_SYMBOLS[p.name] || p.name[0]}
                </text>

                {/* Degree and Retrograde label */}
                <text 
                  x={px + 16} 
                  y={py - 3} 
                  fontSize="10" 
                  fill="#E2E8F0" 
                  textAnchor="start"
                  fontWeight="500"
                >
                  {`${p.degreeInSign}°${String(p.minutes).padStart(2, '0')}'`}
                </text>
                {p.isRetrograde && (
                  <text 
                    x={px + 16} 
                    y={py + 9} 
                    fontSize="9" 
                    fill="#FF453A" 
                    textAnchor="start" 
                    fontWeight="bold"
                  >
                    Rx
                  </text>
                )}
              </g>
            );
          })}

          {/* Center Info Badge */}
          <circle cx={CENTER} cy={CENTER} r={32} fill="#090D16" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
          <text x={CENTER} y={CENTER - 5} fontSize="11" fill="#D4AF37" textAnchor="middle" fontWeight="bold">
            GÖKYÜZÜ
          </text>
          <text x={CENTER} y={CENTER + 10} fontSize="9" fill="#0EA5E9" textAnchor="middle">
            {aspects.length} Açı
          </text>
        </svg>

        {/* Hovered aspect pill overlay */}
        {hoveredAspect && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 border border-white/20 px-4 py-1.5 rounded-full text-xs text-white backdrop-blur-md shadow-xl flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <span className="font-bold text-[#0EA5E9]">{hoveredAspect.planet1}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10" style={{ color: ASPECT_COLORS[hoveredAspect.type] }}>
              {hoveredAspect.type}
            </span>
            <span className="font-bold text-[#D4AF37]">{hoveredAspect.planet2}</span>
            <span className="text-gray-400 text-[10px]">({hoveredAspect.orb.toFixed(1)}° orb)</span>
          </div>
        )}
      </div>

      {/* Legend below wheel */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
          <span>Kavuşum (0°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#32D74B]"></span>
          <span>Üçgen (120°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0A84FF]"></span>
          <span>Sekstil (60°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A]"></span>
          <span>Kare (90°) / Karşıt (180°)</span>
        </div>
      </div>
    </div>
  );
}
