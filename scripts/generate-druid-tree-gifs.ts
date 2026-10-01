import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface TreeConfig {
  id: string;
  name: string;
  oghamName: string;
  oghamSymbol: string;
  archetype: string;
  bgGradient: [string, string];
  primaryColor: string;
  secondaryColor: string;
  auraColor: string;
  trunkColor: string;
  trunkHighlight: string;
  foliageColor1: string;
  foliageColor2: string;
  specialType: 'birch' | 'rowan' | 'ash' | 'alder' | 'willow' | 'hawthorn' | 'oak' | 'holly' | 'hazel' | 'vine' | 'ivy' | 'reed' | 'elder';
}

const TREES: TreeConfig[] = [
  {
    id: 'birch',
    name: 'Huş Ağacı',
    oghamName: 'Beith',
    oghamSymbol: 'ᚁ',
    archetype: 'Işığın Elçisi & Yenilenme',
    bgGradient: ['#0A1A18', '#030E0C'],
    primaryColor: '#34D399',
    secondaryColor: '#E0E7FF',
    auraColor: 'rgba(52, 211, 153, 0.35)',
    trunkColor: '#E2E8F0',
    trunkHighlight: '#F8FAFC',
    foliageColor1: '#34D399',
    foliageColor2: '#059669',
    specialType: 'birch'
  },
  {
    id: 'rowan',
    name: 'Üvez Ağacı',
    oghamName: 'Luis',
    oghamSymbol: 'ᚂ',
    archetype: 'Koruyucu Kalkan & Sezgi',
    bgGradient: ['#1A0F12', '#0A0507'],
    primaryColor: '#F87171',
    secondaryColor: '#FDE047',
    auraColor: 'rgba(239, 68, 68, 0.35)',
    trunkColor: '#8D6E63',
    trunkHighlight: '#A1887F',
    foliageColor1: '#15803D',
    foliageColor2: '#166534',
    specialType: 'rowan'
  },
  {
    id: 'ash',
    name: 'Dişbudak Ağacı',
    oghamName: 'Nion',
    oghamSymbol: 'ᚃ',
    archetype: 'Kozmik Vizyon & Bilgelik',
    bgGradient: ['#091322', '#03070E'],
    primaryColor: '#60A5FA',
    secondaryColor: '#38BDF8',
    auraColor: 'rgba(96, 165, 250, 0.35)',
    trunkColor: '#6D4C41',
    trunkHighlight: '#8D6E63',
    foliageColor1: '#0284C7',
    foliageColor2: '#0369A1',
    specialType: 'ash'
  },
  {
    id: 'alder',
    name: 'Kızılağaç',
    oghamName: 'Fearn',
    oghamSymbol: 'ᚄ',
    archetype: 'Cesur Öncü & Muhafız',
    bgGradient: ['#1C1307', '#0A0602'],
    primaryColor: '#F59E0B',
    secondaryColor: '#10B981',
    auraColor: 'rgba(245, 158, 11, 0.35)',
    trunkColor: '#A0522D',
    trunkHighlight: '#CD853F',
    foliageColor1: '#10B981',
    foliageColor2: '#047857',
    specialType: 'alder'
  },
  {
    id: 'willow',
    name: 'Söğüt',
    oghamName: 'Saille',
    oghamSymbol: 'ᚅ',
    archetype: 'Ay Şifacısı & Dans Ruhu',
    bgGradient: ['#061819', '#020A0B'],
    primaryColor: '#2DD4BF',
    secondaryColor: '#FDE047',
    auraColor: 'rgba(45, 212, 191, 0.35)',
    trunkColor: '#5D4037',
    trunkHighlight: '#795548',
    foliageColor1: '#2DD4BF',
    foliageColor2: '#0D9488',
    specialType: 'willow'
  },
  {
    id: 'hawthorn',
    name: 'Alıç Ağacı',
    oghamName: 'Uath',
    oghamSymbol: 'ᚆ',
    archetype: 'Kalp Muhafızı & Aşk',
    bgGradient: ['#1C0E18', '#0A0309'],
    primaryColor: '#F472B6',
    secondaryColor: '#FDA4AF',
    auraColor: 'rgba(244, 114, 182, 0.35)',
    trunkColor: '#795548',
    trunkHighlight: '#8D6E63',
    foliageColor1: '#059669',
    foliageColor2: '#047857',
    specialType: 'hawthorn'
  },
  {
    id: 'oak',
    name: 'Meşe',
    oghamName: 'Duir',
    oghamSymbol: 'ᚇ',
    archetype: 'Kadim Egemenlik & Güç',
    bgGradient: ['#0A1D13', '#030D08'],
    primaryColor: '#10B981',
    secondaryColor: '#FBBF24',
    auraColor: 'rgba(16, 185, 129, 0.35)',
    trunkColor: '#5C3818',
    trunkHighlight: '#7A4D24',
    foliageColor1: '#059669',
    foliageColor2: '#065F46',
    specialType: 'oak'
  },
  {
    id: 'holly',
    name: 'Çobanpüskülü',
    oghamName: 'Tinne',
    oghamSymbol: 'ᚈ',
    archetype: 'Asil Savaşçı & Kış Işığı',
    bgGradient: ['#170A0F', '#090306'],
    primaryColor: '#EF4444',
    secondaryColor: '#34D399',
    auraColor: 'rgba(239, 68, 68, 0.35)',
    trunkColor: '#4E342E',
    trunkHighlight: '#6D4C41',
    foliageColor1: '#065F46',
    foliageColor2: '#064E3B',
    specialType: 'holly'
  },
  {
    id: 'hazel',
    name: 'Fındık Ağacı',
    oghamName: 'Coll',
    oghamSymbol: 'ᚉ',
    archetype: 'Saf Bilgelik & Sezgi',
    bgGradient: ['#1A1608', '#0A0802'],
    primaryColor: '#FBBF24',
    secondaryColor: '#F59E0B',
    auraColor: 'rgba(251, 191, 36, 0.35)',
    trunkColor: '#6B4423',
    trunkHighlight: '#8D5B2F',
    foliageColor1: '#D97706',
    foliageColor2: '#B45309',
    specialType: 'hazel'
  },
  {
    id: 'vine',
    name: 'Asma',
    oghamName: 'Muin',
    oghamSymbol: 'ᚋ',
    archetype: 'Ruhsal Sevinç & Hasat',
    bgGradient: ['#190C22', '#0A0410'],
    primaryColor: '#C084FC',
    secondaryColor: '#FBBF24',
    auraColor: 'rgba(192, 132, 252, 0.35)',
    trunkColor: '#582C10',
    trunkHighlight: '#7A3F19',
    foliageColor1: '#16A34A',
    foliageColor2: '#15803D',
    specialType: 'vine'
  },
  {
    id: 'ivy',
    name: 'Sarmaşık',
    oghamName: 'Gort',
    oghamSymbol: 'ᚌ',
    archetype: 'Yenilmez Sebat & Sarılış',
    bgGradient: ['#071918', '#020B0A'],
    primaryColor: '#14B8A6',
    secondaryColor: '#86EFAC',
    auraColor: 'rgba(20, 184, 166, 0.35)',
    trunkColor: '#374151',
    trunkHighlight: '#4B5563',
    foliageColor1: '#059669',
    foliageColor2: '#047857',
    specialType: 'ivy'
  },
  {
    id: 'reed',
    name: 'Kamış',
    oghamName: 'Ngetal',
    oghamSymbol: 'ᚍ',
    archetype: 'Müzik & Gizemli Flüt',
    bgGradient: ['#091720', '#03080D'],
    primaryColor: '#38BDF8',
    secondaryColor: '#2DD4BF',
    auraColor: 'rgba(56, 189, 248, 0.35)',
    trunkColor: '#0E7490',
    trunkHighlight: '#06B6D4',
    foliageColor1: '#14B8A6',
    foliageColor2: '#0D9488',
    specialType: 'reed'
  },
  {
    id: 'elder',
    name: 'Mürver Ağacı',
    oghamName: 'Ruis',
    oghamSymbol: 'ᚎ',
    archetype: 'Kadim Şifa & Büyülü Nene',
    bgGradient: ['#180C24', '#080310'],
    primaryColor: '#E879F9',
    secondaryColor: '#C084FC',
    auraColor: 'rgba(232, 121, 249, 0.35)',
    trunkColor: '#4A3B4E',
    trunkHighlight: '#68546D',
    foliageColor1: '#9333EA',
    foliageColor2: '#7E22CE',
    specialType: 'elder'
  }
];

const WIDTH = 540;
const HEIGHT = 660;
const TOTAL_FRAMES = 10;
const FRAME_DELAY = 120; // 120ms per frame = 1.2s seamless loop

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateTreeSVG(tree: TreeConfig, frameIndex: number): string {
  const progress = frameIndex / TOTAL_FRAMES; // 0 to 1
  const rad = progress * Math.PI * 2;

  // Animation values
  const bobY = Math.sin(rad) * 6; // -6 to +6 px
  const swayAngle = Math.sin(rad) * 3; // -3 to +3 degrees
  const armWaveAngle = Math.sin(rad * 2) * 12; // -12 to +12 degrees
  const auraPulse = 0.85 + Math.sin(rad) * 0.15; // 0.7 to 1.0 scale
  const blinkState = frameIndex === 4 || frameIndex === 5; // cute natural blink
  const halfBlink = frameIndex === 3 || frameIndex === 6;

  // Floating particles
  const particles = [
    { bx: 110, by: 460, speed: 70, size: 4, phase: 0 },
    { bx: 420, by: 430, speed: 65, size: 5, phase: 1.5 },
    { bx: 160, by: 260, speed: 85, size: 6, phase: 3.0 },
    { bx: 380, by: 240, speed: 75, size: 4, phase: 4.5 },
    { bx: 270, by: 190, speed: 90, size: 5, phase: 2.2 },
    { bx: 90,  by: 340, speed: 60, size: 4, phase: 5.1 },
    { bx: 450, by: 350, speed: 80, size: 5, phase: 0.8 },
  ];

  let particleSvg = '';
  particles.forEach((p, idx) => {
    const pY = (p.by - ((progress * p.speed * 2 + p.phase * 30) % 280));
    const pX = p.bx + Math.sin(rad + p.phase) * 16;
    const pOpacity = Math.sin(((pY - 140) / 320) * Math.PI);
    const clampedOpacity = Math.max(0, Math.min(0.9, pOpacity));
    particleSvg += `
      <circle cx="${pX.toFixed(1)}" cy="${pY.toFixed(1)}" r="${p.size}" fill="${tree.primaryColor}" opacity="${clampedOpacity.toFixed(2)}" filter="url(#glow)"/>
      <circle cx="${pX.toFixed(1)}" cy="${pY.toFixed(1)}" r="${(p.size * 0.5).toFixed(1)}" fill="#FFFFFF" opacity="${clampedOpacity.toFixed(2)}"/>
    `;
  });

  // Eyes rendering
  let eyesSvg = '';
  if (blinkState) {
    // Closed happy curve eyes ^^
    eyesSvg = `
      <path d="M 235 348 Q 248 340 260 348" stroke="#1E293B" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <path d="M 280 348 Q 292 340 305 348" stroke="#1E293B" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    `;
  } else if (halfBlink) {
    // Half open
    eyesSvg = `
      <ellipse cx="247" cy="347" rx="8" ry="4" fill="#1E293B"/>
      <ellipse cx="293" cy="347" rx="8" ry="4" fill="#1E293B"/>
    `;
  } else {
    // Large round shiny kawaii eyes
    eyesSvg = `
      <ellipse cx="247" cy="346" rx="9.5" ry="12" fill="#1E293B"/>
      <circle cx="244" cy="342" r="4" fill="#FFFFFF"/>
      <circle cx="251" cy="351" r="1.8" fill="#FFFFFF"/>
      
      <ellipse cx="293" cy="346" rx="9.5" ry="12" fill="#1E293B"/>
      <circle cx="290" cy="342" r="4" fill="#FFFFFF"/>
      <circle cx="297" cy="351" r="1.8" fill="#FFFFFF"/>
    `;
  }

  // Tree accessory & foliage customization by tree.specialType
  let customFoliage = '';
  let accessorySvg = '';

  switch (tree.specialType) {
    case 'birch':
      // White silver canopy + birch spots + leaf crown
      customFoliage = `
        <ellipse cx="270" cy="235" rx="105" ry="90" fill="url(#foliageGrad)"/>
        <ellipse cx="215" cy="250" rx="75" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="325" cy="250" rx="75" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="180" rx="60" ry="55" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Silver Birch Crown & Markings -->
        <line x1="240" y1="365" x2="252" y2="367" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>
        <line x1="288" y1="375" x2="300" y2="376" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>
        <line x1="242" y1="395" x2="256" y2="397" stroke="#64748B" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="282" y1="410" x2="298" y2="411" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>
        <!-- Star Tiara -->
        <g transform="translate(270, 160)">
          <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill="#FDE047" filter="url(#glow)"/>
          <circle cx="0" cy="0" r="3" fill="#FFFFFF"/>
        </g>
      `;
      break;

    case 'rowan':
      // Green canopy + red berries + leaf wreath
      customFoliage = `
        <ellipse cx="270" cy="235" rx="100" ry="85" fill="url(#foliageGrad)"/>
        <ellipse cx="210" cy="255" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="330" cy="255" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="185" rx="65" ry="55" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Rowan Red Berries Clusters -->
        <g fill="#EF4444" stroke="#DC2626" stroke-width="1">
          <circle cx="225" cy="225" r="7"/><circle cx="236" cy="223" r="6"/><circle cx="230" cy="233" r="6"/>
          <circle cx="310" cy="225" r="7"/><circle cx="320" cy="223" r="6"/><circle cx="315" cy="233" r="6"/>
          <circle cx="265" cy="165" r="6"/><circle cx="275" cy="164" r="6.5"/><circle cx="270" cy="173" r="6"/>
          <circle cx="200" cy="280" r="6"/><circle cx="208" cy="286" r="5.5"/>
          <circle cx="340" cy="280" r="6"/><circle cx="332" cy="286" r="5.5"/>
        </g>
      `;
      break;

    case 'ash':
      // Cosmic starlight hanging from branches
      customFoliage = `
        <ellipse cx="270" cy="225" rx="110" ry="95" fill="url(#foliageGrad)"/>
        <ellipse cx="205" cy="245" rx="75" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="335" cy="245" rx="75" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="170" rx="70" ry="60" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Hanging Stars -->
        <g stroke="#FDE047" stroke-width="1.5">
          <line x1="195" y1="260" x2="195" y2="295"/>
          <polygon points="195,295 197,301 203,301 198,305 200,311 195,307 190,311 192,305 187,301 193,301" fill="#FDE047" filter="url(#glow)"/>
          <line x1="345" y1="260" x2="345" y2="295"/>
          <polygon points="345,295 347,301 353,301 348,305 350,311 345,307 340,311 342,305 337,301 343,301" fill="#FDE047" filter="url(#glow)"/>
        </g>
      `;
      break;

    case 'alder':
      // Brave shield leaf & warrior feather
      customFoliage = `
        <ellipse cx="270" cy="235" rx="100" ry="85" fill="url(#foliageGrad)"/>
        <ellipse cx="210" cy="250" rx="75" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="330" cy="250" rx="75" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="180" rx="65" ry="55" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Shield Leaf -->
        <g transform="translate(325, 360)">
          <path d="M 0 0 C 15 0 25 15 25 35 C 25 55 0 70 0 70 C 0 70 -25 55 -25 35 C -25 15 -15 0 0 0 Z" fill="#F59E0B" stroke="#D97706" stroke-width="3"/>
          <circle cx="0" cy="35" r="10" fill="#10B981"/>
        </g>
      `;
      break;

    case 'willow':
      // Long graceful weeping branches dancing
      const willowSway = Math.sin(rad) * 12;
      customFoliage = `
        <ellipse cx="270" cy="235" rx="100" ry="80" fill="url(#foliageGrad)"/>
        <ellipse cx="210" cy="245" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="330" cy="245" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <!-- Weeping Vines -->
        <g stroke="${tree.foliageColor1}" stroke-width="7" stroke-linecap="round" fill="none">
          <path d="M 180 260 Q ${165 + willowSway} 350 ${180 + willowSway * 1.5} 430"/>
          <path d="M 210 270 Q ${195 + willowSway} 360 ${210 + willowSway * 1.5} 440"/>
          <path d="M 330 270 Q ${345 - willowSway} 360 ${330 - willowSway * 1.5} 440"/>
          <path d="M 360 260 Q ${375 - willowSway} 350 ${360 - willowSway * 1.5} 430"/>
        </g>
      `;
      accessorySvg = `
        <!-- Golden Crescent Moon -->
        <g transform="translate(270, 165)">
          <path d="M -8 -15 A 16 16 0 0 0 14 12 A 13 13 0 1 1 -8 -15 Z" fill="#FDE047" filter="url(#glow)"/>
        </g>
      `;
      break;

    case 'hawthorn':
      // Blossoms of pink and white, flower crown
      customFoliage = `
        <ellipse cx="270" cy="235" rx="100" ry="85" fill="url(#foliageGrad)"/>
        <ellipse cx="210" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="330" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="180" rx="65" ry="55" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Pink Hawthorn Blossom Flowers -->
        <g fill="#F472B6" stroke="#FFFFFF" stroke-width="1.5">
          <circle cx="230" cy="210" r="7"/><circle cx="230" cy="210" r="3" fill="#FDE047"/>
          <circle cx="310" cy="210" r="7"/><circle cx="310" cy="210" r="3" fill="#FDE047"/>
          <circle cx="270" cy="165" r="8"/><circle cx="270" cy="165" r="3.5" fill="#FDE047"/>
          <circle cx="185" cy="270" r="6.5"/><circle cx="185" cy="270" r="2.5" fill="#FDE047"/>
          <circle cx="355" cy="270" r="6.5"/><circle cx="355" cy="270" r="2.5" fill="#FDE047"/>
        </g>
      `;
      break;

    case 'oak':
      // Acorn hat crown + golden leaf
      customFoliage = `
        <ellipse cx="270" cy="230" rx="115" ry="90" fill="url(#foliageGrad)"/>
        <ellipse cx="200" cy="250" rx="80" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="340" cy="250" rx="80" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="175" rx="75" ry="60" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Royal Acorn Cap / Crown -->
        <g transform="translate(270, 160)">
          <!-- Acorn Crown -->
          <ellipse cx="0" cy="0" rx="35" ry="14" fill="#78350F" stroke="#F59E0B" stroke-width="2.5"/>
          <path d="M -30 0 Q 0 -35 30 0 Z" fill="#92400E"/>
          <!-- Little Acorn stem -->
          <path d="M 0 -25 Q 5 -35 12 -38" stroke="#78350F" stroke-width="5" stroke-linecap="round" fill="none"/>
          <!-- Acorn textured dots -->
          <circle cx="-12" cy="-10" r="2.5" fill="#B45309"/>
          <circle cx="0" cy="-14" r="2.5" fill="#B45309"/>
          <circle cx="12" cy="-10" r="2.5" fill="#B45309"/>
        </g>
      `;
      break;

    case 'holly':
      // Red winter scarf + holly berries
      customFoliage = `
        <ellipse cx="270" cy="235" rx="100" ry="85" fill="url(#foliageGrad)"/>
        <ellipse cx="210" cy="250" rx="75" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="330" cy="250" rx="75" ry="70" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="180" rx="65" ry="55" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Cozy Red Winter Scarf -->
        <g transform="translate(270, 385)">
          <path d="M -45 -5 Q 0 10 45 -5 Q 35 18 -40 16 Z" fill="#DC2626" stroke="#991B1B" stroke-width="2"/>
          <path d="M 15 10 L 25 55 L 42 53 L 30 8 Z" fill="#EF4444" stroke="#991B1B" stroke-width="2"/>
          <line x1="25" y1="55" x2="42" y2="53" stroke="#FDE047" stroke-width="3" stroke-dasharray="2 3"/>
        </g>
      `;
      break;

    case 'hazel':
      // Scholar round glasses + hazelnut wand
      customFoliage = `
        <ellipse cx="270" cy="235" rx="100" ry="85" fill="url(#foliageGrad)"/>
        <ellipse cx="210" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="330" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="180" rx="65" ry="55" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Cute Round Glasses -->
        <g stroke="#F59E0B" stroke-width="3.5" fill="none">
          <circle cx="247" cy="346" r="15"/>
          <circle cx="293" cy="346" r="15"/>
          <line x1="262" y1="346" x2="278" y2="346"/>
        </g>
        <!-- Hazelnut Clusters -->
        <circle cx="270" cy="165" r="9" fill="#92400E"/>
        <circle cx="282" cy="170" r="8" fill="#B45309"/>
        <circle cx="258" cy="170" r="8" fill="#78350F"/>
      `;
      break;

    case 'vine':
      // Grapes clusters + twisting spiral tendrils
      customFoliage = `
        <ellipse cx="270" cy="235" rx="105" ry="85" fill="url(#foliageGrad)"/>
        <ellipse cx="205" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="335" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="180" rx="65" ry="55" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Purple Grape Clusters -->
        <g fill="#9333EA" stroke="#7E22CE" stroke-width="1.5">
          <!-- Left cluster -->
          <circle cx="195" cy="270" r="7"/><circle cx="207" cy="270" r="7"/><circle cx="201" cy="282" r="7"/><circle cx="201" cy="293" r="6"/>
          <!-- Right cluster -->
          <circle cx="335" cy="270" r="7"/><circle cx="347" cy="270" r="7"/><circle cx="341" cy="282" r="7"/><circle cx="341" cy="293" r="6"/>
        </g>
      `;
      break;

    case 'ivy':
      // Heart-shaped leaf wreath & open hugging arms
      customFoliage = `
        <ellipse cx="270" cy="235" rx="100" ry="85" fill="url(#foliageGrad)"/>
        <ellipse cx="210" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="330" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="180" rx="65" ry="55" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Heart Shaped Leaf Crown -->
        <g transform="translate(270, 160)">
          <path d="M 0 5 C -15 -15 -35 5 0 35 C 35 5 15 -15 0 5 Z" fill="#10B981" stroke="#047857" stroke-width="2"/>
        </g>
      `;
      break;

    case 'reed':
      // Musical flute pipe & musical notes
      const noteY = (progress * 50) % 50;
      customFoliage = `
        <ellipse cx="270" cy="235" rx="90" ry="80" fill="url(#foliageGrad)"/>
        <!-- Tall slender reeds in background -->
        <rect x="235" y="140" width="14" height="150" rx="7" fill="#0D9488"/>
        <rect x="255" y="125" width="14" height="165" rx="7" fill="#14B8A6"/>
        <rect x="275" y="130" width="14" height="160" rx="7" fill="#0D9488"/>
        <rect x="295" y="145" width="14" height="145" rx="7" fill="#14B8A6"/>
      `;
      accessorySvg = `
        <!-- Wooden Pan Flute -->
        <g transform="translate(285, 360)">
          <rect x="0" y="0" width="7" height="35" rx="3.5" fill="#FBBF24"/>
          <rect x="8" y="5" width="7" height="30" rx="3.5" fill="#FBBF24"/>
          <rect x="16" y="10" width="7" height="25" rx="3.5" fill="#FBBF24"/>
          <rect x="24" y="15" width="7" height="20" rx="3.5" fill="#FBBF24"/>
        </g>
        <!-- Floating Music Notes -->
        <text x="330" y="${340 - noteY}" font-family="sans-serif" font-size="22" fill="#38BDF8" opacity="0.85">♪</text>
        <text x="350" y="${310 - noteY}" font-family="sans-serif" font-size="26" fill="#FDE047" opacity="0.85">♫</text>
      `;
      break;

    case 'elder':
      // Fairy wings & elderberry flowers
      customFoliage = `
        <ellipse cx="270" cy="235" rx="100" ry="85" fill="url(#foliageGrad)"/>
        <ellipse cx="210" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="330" cy="250" rx="70" ry="65" fill="url(#foliageGrad)"/>
        <ellipse cx="270" cy="180" rx="65" ry="55" fill="${tree.foliageColor1}"/>
      `;
      accessorySvg = `
        <!-- Translucent Fairy Wings -->
        <g opacity="0.75" fill="#E9D5FF" stroke="#C084FC" stroke-width="2">
          <ellipse cx="185" cy="340" rx="40" ry="18" transform="rotate(-30 185 340)"/>
          <ellipse cx="355" cy="340" rx="40" ry="18" transform="rotate(30 355 340)"/>
        </g>
        <!-- Elderberry Cluster -->
        <g fill="#F3E8FF" stroke="#A855F7" stroke-width="1">
          <circle cx="270" cy="165" r="4"/><circle cx="264" cy="172" r="3.5"/><circle cx="276" cy="172" r="3.5"/>
        </g>
      `;
      break;
  }

  // Waving hand/branch
  const leftBranchPath = `M 220 375 Q ${180 - armWaveAngle} 360 ${170 - armWaveAngle * 1.5} ${380 + bobY * 0.5}`;
  const rightBranchPath = `M 320 375 Q ${360 + armWaveAngle} 360 ${370 + armWaveAngle * 1.5} ${380 - bobY * 0.5}`;

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradients -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${tree.bgGradient[0]}"/>
          <stop offset="100%" stop-color="${tree.bgGradient[1]}"/>
        </linearGradient>

        <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${tree.primaryColor}" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="${tree.secondaryColor}" stop-opacity="0.8"/>
        </linearGradient>

        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${tree.trunkColor}"/>
          <stop offset="45%" stop-color="${tree.trunkHighlight}"/>
          <stop offset="100%" stop-color="${tree.trunkColor}"/>
        </linearGradient>

        <linearGradient id="foliageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${tree.foliageColor1}"/>
          <stop offset="100%" stop-color="${tree.foliageColor2}"/>
        </linearGradient>

        <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${tree.primaryColor}" stop-opacity="0.45"/>
          <stop offset="60%" stop-color="${tree.primaryColor}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${tree.primaryColor}" stop-opacity="0"/>
        </radialGradient>

        <!-- Filters -->
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Background Card -->
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)"/>

      <!-- Card Borders & Inner Glow -->
      <rect x="10" y="10" width="${WIDTH - 20}" height="${HEIGHT - 20}" rx="28" fill="none" stroke="url(#cardBorder)" stroke-width="2"/>
      <rect x="16" y="16" width="${WIDTH - 32}" height="${HEIGHT - 32}" rx="22" fill="none" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="1"/>

      <!-- Header Section -->
      <g id="header">
        <!-- Top Badge -->
        <rect x="145" y="28" width="250" height="26" rx="13" fill="#FFFFFF" fill-opacity="0.06" stroke="${tree.primaryColor}" stroke-opacity="0.3" stroke-width="1"/>
        <text x="270" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="${tree.primaryColor}" text-anchor="middle" letter-spacing="1.5">
          🌲 KELT DRUİD AĞACI TOTEMİ 🌲
        </text>

        <!-- Tree Name -->
        <text x="270" y="82" font-family="'Georgia', serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">
          ${escapeXml(tree.name)}
        </text>

        <!-- Archetype Subtitle -->
        <text x="270" y="104" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="${tree.secondaryColor}" text-anchor="middle" opacity="0.9">
          ${escapeXml(tree.archetype)}
        </text>
      </g>

      <!-- Floating Magic Particles -->
      ${particleSvg}

      <!-- Sacred Aura / Halo behind the tree -->
      <circle cx="270" cy="305" r="${145 * auraPulse}" fill="url(#auraGrad)"/>
      <circle cx="270" cy="305" r="130" fill="none" stroke="${tree.primaryColor}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="4 8"/>

      <!-- Mascot Character Group (with Bobbing & Sway) -->
      <g transform="translate(0, ${bobY.toFixed(1)}) rotate(${swayAngle.toFixed(2)} 270 380)">
        
        <!-- Ground Shadow -->
        <ellipse cx="270" cy="460" rx="85" ry="14" fill="#000000" opacity="0.45" filter="url(#glow)"/>

        <!-- Little Wooden Feet -->
        <ellipse cx="242" cy="452" rx="15" ry="9" fill="${tree.trunkColor}"/>
        <ellipse cx="298" cy="452" rx="15" ry="9" fill="${tree.trunkColor}"/>

        <!-- Chubby Trunk Body -->
        <path d="M 230 450 C 215 380 220 320 270 320 C 320 320 325 380 310 450 Z" 
              fill="url(#trunkGrad)" filter="url(#softShadow)"/>

        <!-- Cute Rosy Cheeks -->
        <ellipse cx="230" cy="358" rx="8" ry="5" fill="#FF6B8B" opacity="0.75" filter="url(#glow)"/>
        <ellipse cx="310" cy="358" rx="8" ry="5" fill="#FF6B8B" opacity="0.75" filter="url(#glow)"/>

        <!-- Cute Eyes -->
        ${eyesSvg}

        <!-- Happy Mouth / Smile -->
        <path d="M 264 360 Q 270 367 276 360" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>

        <!-- Arms / Branches -->
        <path d="${leftBranchPath}" stroke="${tree.trunkColor}" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="${rightBranchPath}" stroke="${tree.trunkColor}" stroke-width="8" stroke-linecap="round" fill="none"/>

        <!-- Tiny Leaves on Hands -->
        <circle cx="${170 - armWaveAngle * 1.5}" cy="${380 + bobY * 0.5}" r="7" fill="${tree.foliageColor1}"/>
        <circle cx="${370 + armWaveAngle * 1.5}" cy="${380 - bobY * 0.5}" r="7" fill="${tree.foliageColor1}"/>

        <!-- Fluffy Foliage Canopy -->
        <g filter="url(#softShadow)">
          ${customFoliage}
        </g>

        <!-- Accessories & Hats & Props -->
        ${accessorySvg}
      </g>

      <!-- Footer Badge & Ogham Glyph -->
      <g id="footer" transform="translate(0, 0)">
        <!-- Ogham Seal Box -->
        <rect x="235" y="495" width="70" height="70" rx="18" fill="#000000" fill-opacity="0.5" stroke="${tree.primaryColor}" stroke-width="1.8" filter="url(#glow)"/>
        <text x="270" y="542" font-family="'Georgia', serif" font-size="34" font-weight="bold" fill="${tree.primaryColor}" text-anchor="middle">
          ${tree.oghamSymbol}
        </text>
        <text x="270" y="582" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          OGHAM: ${tree.oghamName.toUpperCase()}
        </text>

        <!-- Brand Footer -->
        <text x="270" y="625" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="${tree.primaryColor}" text-anchor="middle" letter-spacing="0.5">
          ✨ 7layers.tr/analysis/druid-tree ✨
        </text>
      </g>
    </svg>
  `;
}

async function generateSingleTreeGif(tree: TreeConfig, outputDir: string) {
  console.log(`Generating GIF for: ${tree.name} (${tree.id})...`);
  const frameBuffers: Buffer[] = [];

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const svgStr = generateTreeSVG(tree, i);
    const pngBuf = await sharp(Buffer.from(svgStr))
      .resize(WIDTH, HEIGHT)
      .png()
      .toBuffer();
    frameBuffers.push(pngBuf);
  }

  // Create vertical stack of frames
  const compositeInputs = frameBuffers.map((buf, index) => ({
    input: buf,
    top: index * HEIGHT,
    left: 0
  }));

  const stackedBuffer = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT * TOTAL_FRAMES,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite(compositeInputs)
    .png()
    .toBuffer();

  const delays = new Array(TOTAL_FRAMES).fill(FRAME_DELAY);

  const gifBuffer = await sharp(stackedBuffer, {
    animated: true,
    pageHeight: HEIGHT
  } as any)
    .gif({
      loop: 0,
      delay: delays,
      effort: 7
    })
    .toBuffer();

  const outFilePath = path.join(outputDir, `${tree.id}.gif`);
  fs.writeFileSync(outFilePath, gifBuffer);
  console.log(`Saved: ${outFilePath} (${(gifBuffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const webOutputDir = path.join(__dirname, '../public/druid-tree-gifs');
  if (!fs.existsSync(webOutputDir)) {
    fs.mkdirSync(webOutputDir, { recursive: true });
  }

  console.log(`Starting Druid Tree GIF generation for ${TREES.length} trees...`);
  for (const tree of TREES) {
    await generateSingleTreeGif(tree, webOutputDir);
  }

  // Also copy to mobile assets if directory exists
  const mobilOutputDir = path.resolve(__dirname, '../../mobil/assets/druid-tree-gifs');
  if (!fs.existsSync(mobilOutputDir)) {
    fs.mkdirSync(mobilOutputDir, { recursive: true });
  }

  for (const tree of TREES) {
    const src = path.join(webOutputDir, `${tree.id}.gif`);
    const dst = path.join(mobilOutputDir, `${tree.id}.gif`);
    fs.copyFileSync(src, dst);
  }

  console.log('All 13 Druid Tree GIFs successfully generated for Web and Mobile!');
}

main().catch(err => {
  console.error('Error generating GIFs:', err);
  process.exit(1);
});
