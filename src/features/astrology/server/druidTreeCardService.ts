import fs from 'fs';
import sharp from 'sharp';
import { DruidTree } from '../engine/DruidTreeEngine';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1440;
const PORTRAIT_WIDTH = 750;
const PORTRAIT_HEIGHT = 1000; // Exact 3:4 aspect ratio
const PORTRAIT_TOP = 50;
const PORTRAIT_LEFT = (CARD_WIDTH - PORTRAIT_WIDTH) / 2; // 165px

export const TREE_ENGLISH_NAMES: Record<string, string> = {
  birch: 'BIRCH',
  rowan: 'ROWAN',
  ash: 'ASH',
  alder: 'ALDER',
  willow: 'WILLOW',
  hawthorn: 'HAWTHORN',
  oak: 'OAK',
  holly: 'HOLLY',
  hazel: 'HAZEL',
  vine: 'VINE',
  ivy: 'IVY',
  reed: 'REED',
  elder: 'ELDER'
};

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function wrapText(text: string, maxCharsPerLine: number = 48): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Türkçe büyük ünlü ve ses uyumuna göre isme tam uygun iyelik eki oluşturur
 */
export function formatTurkishPossessive(name: string): string {
  const clean = name.trim();
  if (!clean) return 'KUTSAL DRUİD AĞACI';

  const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
  const lastChar = clean.slice(-1).toLocaleLowerCase('tr-TR');

  let lastVowel = '';
  for (let i = clean.length - 1; i >= 0; i--) {
    const char = clean[i].toLocaleLowerCase('tr-TR');
    if (vowels.includes(char)) {
      lastVowel = char;
      break;
    }
  }
  if (!lastVowel) lastVowel = 'a';

  const isLastCharVowel = vowels.includes(lastChar);
  let suffix = '';
  if (['a', 'ı'].includes(lastVowel)) suffix = isLastCharVowel ? 'NIN' : 'IN';
  else if (['e', 'i'].includes(lastVowel)) suffix = isLastCharVowel ? 'NİN' : 'İN';
  else if (['o', 'u'].includes(lastVowel)) suffix = isLastCharVowel ? 'NUN' : 'UN';
  else if (['ö', 'ü'].includes(lastVowel)) suffix = isLastCharVowel ? 'NÜN' : 'ÜN';

  return `${clean.toLocaleUpperCase('tr-TR')}'${suffix} KUTSAL AĞACI`;
}

/**
 * Yan sütunlarda harfleri dikey alt alta dizen yardımcı fonksiyon
 */
function renderVerticalText(text: string, x: number, startY: number, maxHeight: number, maxFontSize: number, fill: string): string {
  const chars = Array.from(text);
  const count = chars.length;
  if (count === 0) return '';

  const stepY = Math.min(42, Math.floor(maxHeight / count));
  const fontSize = Math.min(maxFontSize, Math.max(16, Math.floor(stepY * 0.65)));

  return chars.map((char, i) => {
    if (char === ' ') return ''; // Boşluk satır atlaması yaratır
    const y = startY + i * stepY;
    return `<text x="${x}" y="${y}" font-family="'Segoe UI', Roboto, sans-serif" font-size="${fontSize}" font-weight="800" fill="${fill}" text-anchor="middle">${escapeXml(char)}</text>`;
  }).join('\n');
}

export async function renderDruidTreeCard(tree: DruidTree, rawImagePath: string, personName?: string): Promise<Buffer> {
  const rawBuffer = await fs.promises.readFile(rawImagePath);

  // Resize raw image to exact 3:4 portrait (750x1000)
  const resizedPortrait = await sharp(rawBuffer)
    .resize(PORTRAIT_WIDTH, PORTRAIT_HEIGHT, { fit: 'cover', position: 'center' })
    .toBuffer();

  // Create rounded mask for portrait image
  const maskSvg = `
    <svg width="${PORTRAIT_WIDTH}" height="${PORTRAIT_HEIGHT}">
      <rect width="${PORTRAIT_WIDTH}" height="${PORTRAIT_HEIGHT}" rx="24" fill="#FFF"/>
    </svg>
  `;
  const roundedPortrait = await sharp(resizedPortrait)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const cleanName = personName ? personName.trim() : '';
  const titleLeft = cleanName ? formatTurkishPossessive(cleanName) : tree.name.toLocaleUpperCase('tr-TR');
  const enName = TREE_ENGLISH_NAMES[tree.id] || tree.id.toUpperCase();
  const titleRight = `${enName} • ${tree.oghamName.toUpperCase()}`;
  const proverbLines = wrapText(`"${tree.druidicProverb}"`, 48);

  const footerText = cleanName 
    ? `✦ 7LAYERS.COM ✦ ${cleanName.toLocaleUpperCase('tr-TR')} İÇİN ÖZEL ANALİZ ✦`
    : `✦ 7LAYERS.COM ✦ KENDİ KUTSAL AĞACINI KEŞFET ✦`;

  const overlaySvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#0B1A1E" stop-opacity="1"/>
          <stop offset="60%" stop-color="#050C10" stop-opacity="1"/>
          <stop offset="100%" stop-color="#020507" stop-opacity="1"/>
        </radialGradient>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bgGlow)"/>

      <!-- Outer Card Border -->
      <rect x="20" y="20" width="${CARD_WIDTH - 40}" height="${CARD_HEIGHT - 40}" rx="28" fill="none" stroke="#F59E0B" stroke-opacity="0.35" stroke-width="1.5"/>
      <rect x="28" y="28" width="${CARD_WIDTH - 56}" height="${CARD_HEIGHT - 56}" rx="22" fill="none" stroke="#34D399" stroke-opacity="0.2" stroke-width="1"/>

      <!-- Left Flank: Ogham Rune & Vertical Turkish Title (Center X: 82) -->
      <g transform="translate(0, 0)">
        <!-- Top Ogham Rune Emblem -->
        <circle cx="82" cy="95" r="34" fill="#040A10" stroke="#F59E0B" stroke-opacity="0.5" stroke-width="1.5"/>
        <text x="82" y="108" font-family="'Segoe UI', Roboto, sans-serif" font-size="34" fill="#FCD34D" text-anchor="middle" filter="url(#goldGlow)">
          ${escapeXml(tree.oghamSymbol)}
        </text>

        <!-- Vertical Line Accent -->
        <line x1="82" y1="145" x2="82" y2="185" stroke="#F59E0B" stroke-opacity="0.4" stroke-width="1.5"/>

        <!-- Vertical Tree Name -->
        ${renderVerticalText(titleLeft, 82, 225, 480, 24, '#FFFFFF')}

        <!-- Vertical 7LAYERS mark -->
        <line x1="82" y1="740" x2="82" y2="780" stroke="#34D399" stroke-opacity="0.4" stroke-width="1.5"/>
        ${renderVerticalText("7LAYERS", 82, 820, 210, 16, '#34D399')}
        <circle cx="82" cy="1035" r="4" fill="#34D399" opacity="0.6"/>
      </g>

      <!-- Central Image Golden Frame -->
      <rect x="${PORTRAIT_LEFT - 6}" y="${PORTRAIT_TOP - 6}" width="${PORTRAIT_WIDTH + 12}" height="${PORTRAIT_HEIGHT + 12}" rx="30" fill="none" stroke="#F59E0B" stroke-opacity="0.5" stroke-width="2"/>
      <rect x="${PORTRAIT_LEFT - 12}" y="${PORTRAIT_TOP - 12}" width="${PORTRAIT_WIDTH + 24}" height="${PORTRAIT_HEIGHT + 24}" rx="34" fill="none" stroke="#34D399" stroke-opacity="0.25" stroke-width="1"/>

      <!-- Right Flank: Celtic Seal & Vertical English/Celtic Name (Center X: 998) -->
      <g transform="translate(0, 0)">
        <!-- Top Celtic Seal -->
        <circle cx="998" cy="95" r="34" fill="#040A10" stroke="#34D399" stroke-opacity="0.5" stroke-width="1.5"/>
        <text x="998" y="107" font-family="'Segoe UI', Roboto, sans-serif" font-size="28" fill="#34D399" text-anchor="middle" filter="url(#emeraldGlow)">
          ☸
        </text>

        <!-- Vertical Line Accent -->
        <line x1="998" y1="145" x2="998" y2="185" stroke="#34D399" stroke-opacity="0.4" stroke-width="1.5"/>

        <!-- Vertical English/Celtic Title -->
        ${renderVerticalText(titleRight, 998, 225, 480, 22, '#FCD34D')}

        <!-- Vertical DRUID mark -->
        <line x1="998" y1="740" x2="998" y2="780" stroke="#F59E0B" stroke-opacity="0.4" stroke-width="1.5"/>
        ${renderVerticalText("DRUID", 998, 820, 210, 16, '#FCD34D')}
        <circle cx="998" cy="1035" r="4" fill="#FCD34D" opacity="0.6"/>
      </g>

      <!-- Bottom Panel (Y: 1075 to 1400) -->
      <g transform="translate(50, 1075)">
        <!-- Archetype Box -->
        <rect x="0" y="0" width="${CARD_WIDTH - 100}" height="84" rx="18" fill="#040A10" fill-opacity="0.85" stroke="#34D399" stroke-opacity="0.35" stroke-width="1.5"/>
        <text x="35" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#34D399" letter-spacing="1.5">
          ✨ RUHSAL ARKETİP:
        </text>
        <text x="35" y="65" font-family="'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="bold" fill="#FFFFFF">
          ${escapeXml(tree.archetype)}
        </text>

        <!-- Proverb Box -->
        <g transform="translate(0, 96)">
          <rect x="0" y="0" width="${CARD_WIDTH - 100}" height="175" rx="18" fill="#000000" fill-opacity="0.75" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5"/>
          <line x1="3" y1="16" x2="3" y2="159" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>

          <text x="35" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#FCD34D" letter-spacing="1.5">
            📜 KADİM KELT BİLGELİĞİ:
          </text>

          ${proverbLines.map((line, idx) => `
            <text x="35" y="${68 + idx * 26}" font-family="'Georgia', serif" font-size="19" font-style="italic" fill="#E5E7EB">
              ${escapeXml(line)}
            </text>
          `).join('')}

          <text x="35" y="${68 + proverbLines.length * 26 + 18}" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#9CA3AF" letter-spacing="0.5">
            Denge, güç ve köklerin kadim koruyucusu.
          </text>
        </g>

        <!-- Footer Brand Line -->
        <text x="${(CARD_WIDTH - 100) / 2}" y="305" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#34D399" text-anchor="middle" letter-spacing="2">
          ${footerText}
        </text>
      </g>
    </svg>
  `;

  return sharp(Buffer.from(overlaySvg))
    .composite([
      {
        input: roundedPortrait,
        top: PORTRAIT_TOP,
        left: PORTRAIT_LEFT
      }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}
