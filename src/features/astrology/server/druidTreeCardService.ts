import fs from 'fs';
import sharp from 'sharp';
import { DruidTree } from '../engine/DruidTreeEngine';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1440;
const INNER_IMG_WIDTH = 920;
const INNER_IMG_HEIGHT = 760;

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

function wrapText(text: string, maxCharsPerLine: number = 42): string[] {
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
 * Örnek: Baha -> BAHA'NIN DRUİD AĞACI
 *        Ali -> ALİ'NİN DRUİD AĞACI
 *        Mehmet -> MEHMET'İN DRUİD AĞACI
 *        Can -> CAN'IN DRUİD AĞACI
 *        Onur -> ONUR'UN DRUİD AĞACI
 *        Gül -> GÜL'ÜN DRUİD AĞACI
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

  return `${clean.toLocaleUpperCase('tr-TR')}'${suffix} DRUİD AĞACI`;
}

export async function renderDruidTreeCard(tree: DruidTree, rawImagePath: string, personName?: string): Promise<Buffer> {
  const rawBuffer = await fs.promises.readFile(rawImagePath);

  // Resize inner art to 920x760
  const resizedInnerImg = await sharp(rawBuffer)
    .resize(INNER_IMG_WIDTH, INNER_IMG_HEIGHT, { fit: 'cover', position: 'top' })
    .toBuffer();

  // Create rounded mask for inner image
  const maskSvg = `
    <svg width="${INNER_IMG_WIDTH}" height="${INNER_IMG_HEIGHT}">
      <rect x="0" y="0" width="${INNER_IMG_WIDTH}" height="${INNER_IMG_HEIGHT}" rx="32" ry="32" fill="#FFF"/>
    </svg>
  `;
  const roundedInnerImg = await sharp(resizedInnerImg)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const oghamTitle = `KELTÇE İSMİ (OGHAM): ${tree.oghamName.toUpperCase()} (${tree.oghamSymbol})`;
  const proverbLines = wrapText(`"${tree.druidicProverb}"`, 44);

  const cleanName = personName ? personName.trim() : '';
  const personalizedTitle = cleanName ? formatTurkishPossessive(cleanName) : 'KUTSAL DRUİD AĞACI';
  const footerText = cleanName 
    ? `✨ ${escapeXml(cleanName)} İçin Özel Analiz • 7layers.tr/analysis/druid-tree ✨`
    : `✨ Kendi Ruh Ağacını Keşfet: 7layers.tr/analysis/druid-tree ✨`;

  const overlaySvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#060C12"/>
          <stop offset="45%" stop-color="#09141B"/>
          <stop offset="100%" stop-color="#03080C"/>
        </linearGradient>

        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCD34D"/>
          <stop offset="50%" stop-color="#34D399"/>
          <stop offset="100%" stop-color="#10B981"/>
        </linearGradient>

        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34D399" stop-opacity="0.7"/>
          <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.7"/>
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bgGrad)"/>

      <!-- Outer Luxury Border -->
      <rect x="24" y="24" width="${CARD_WIDTH - 48}" height="${CARD_HEIGHT - 48}" rx="44" fill="none" stroke="url(#borderGrad)" stroke-width="2.5"/>
      <rect x="34" y="34" width="${CARD_WIDTH - 68}" height="${CARD_HEIGHT - 68}" rx="36" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1.5"/>

      <!-- Header Section -->
      <g transform="translate(0, 0)">
        <!-- Top Pill Badge -->
        <rect x="360" y="32" width="360" height="32" rx="16" fill="#FFFFFF" fill-opacity="0.06" stroke="#34D399" stroke-opacity="0.4" stroke-width="1.2"/>
        <text x="540" y="53" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#34D399" text-anchor="middle" letter-spacing="3">
          🌲 7LAYERS KELT DRUİD AĞACI 🌲
        </text>

        <!-- Kişiye Özel İsim Şeridi -->
        <text x="540" y="93" font-family="'Segoe UI', Roboto, sans-serif" font-size="23" font-weight="800" fill="#FCD34D" text-anchor="middle" letter-spacing="2">
          ✨ ${escapeXml(personalizedTitle)} ✨
        </text>

        <!-- Ağaç Adı -->
        <text x="540" y="137" font-family="'Georgia', serif" font-size="44" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          ${escapeXml(tree.name)}
        </text>

        <!-- Keltçe İsmi & Ogham -->
        <text x="540" y="167" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#6EE7B7" text-anchor="middle" letter-spacing="1.5">
          ${escapeXml(oghamTitle)}
        </text>
      </g>

      <!-- Inner Image Border Glow -->
      <rect x="76" y="181" width="${INNER_IMG_WIDTH + 8}" height="${INNER_IMG_HEIGHT + 8}" rx="36" fill="none" stroke="url(#goldGrad)" stroke-width="3" opacity="0.8" filter="url(#glow)"/>

      <!-- Bottom Card Details -->
      <g transform="translate(0, 965)">
        <!-- Archetype Box -->
        <rect x="80" y="0" width="${CARD_WIDTH - 160}" height="96" rx="20" fill="#040A10" fill-opacity="0.75" stroke="#34D399" stroke-opacity="0.35" stroke-width="1.5"/>
        
        <text x="110" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="bold" fill="#34D399" letter-spacing="1.5">
          ✨ RUHSAL ARKETİP &amp; MİZAÇ:
        </text>
        <text x="110" y="74" font-family="'Segoe UI', Roboto, sans-serif" font-size="29" font-weight="bold" fill="#FFFFFF">
          ${escapeXml(tree.archetype)}
        </text>

        <!-- Proverb Box (Large, High-Contrast & Wrapped) -->
        <g transform="translate(80, 114)">
          <rect x="0" y="0" width="${CARD_WIDTH - 160}" height="195" rx="20" fill="#000000" fill-opacity="0.65" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5"/>
          <line x1="2" y1="18" x2="2" y2="177" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>

          <text x="35" y="38" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#FCD34D" letter-spacing="2">
            📜 KADİM KELT BİLGELİĞİ:
          </text>

          <g transform="translate(35, 78)">
            ${proverbLines.map((line, idx) => `
              <text x="0" y="${idx * 42}" font-family="'Georgia', serif" font-size="27" font-style="italic" fill="#F8FAFC" font-weight="500">
                ${escapeXml(line)}
              </text>
            `).join('')}
          </g>
        </g>

        <!-- Footer Brand Line -->
        <line x1="120" y1="335" x2="${CARD_WIDTH - 120}" y2="335" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1"/>
        <text x="540" y="375" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#34D399" text-anchor="middle" letter-spacing="2">
          ${footerText}
        </text>
      </g>
    </svg>
  `;

  return sharp(Buffer.from(overlaySvg))
    .composite([
      {
        input: roundedInnerImg,
        top: 185,
        left: 80
      }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}
