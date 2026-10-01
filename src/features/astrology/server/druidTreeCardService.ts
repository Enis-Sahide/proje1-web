import fs from 'fs';
import sharp from 'sharp';
import { DruidTree } from '../engine/DruidTreeEngine';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1440;
const PORTRAIT_WIDTH = 640;
const PORTRAIT_HEIGHT = 853; // 3:4 aspect ratio
const PORTRAIT_TOP = 50;
const PORTRAIT_LEFT = (CARD_WIDTH - PORTRAIT_WIDTH) / 2; // 220px

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

function wrapText(text: string, maxCharsPerLine: number = 44): string[] {
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

export async function renderDruidTreeCard(tree: DruidTree, rawImagePath: string, personName?: string): Promise<Buffer> {
  const rawBuffer = await fs.promises.readFile(rawImagePath);

  // Resize raw image to exact 3:4 portrait (640x853)
  const resizedPortrait = await sharp(rawBuffer)
    .resize(PORTRAIT_WIDTH, PORTRAIT_HEIGHT, { fit: 'cover' })
    .toBuffer();

  // Create rounded mask for portrait image
  const maskSvg = `
    <svg width="${PORTRAIT_WIDTH}" height="${PORTRAIT_HEIGHT}">
      <rect width="${PORTRAIT_WIDTH}" height="${PORTRAIT_HEIGHT}" rx="28" fill="#FFF"/>
    </svg>
  `;
  const roundedPortrait = await sharp(resizedPortrait)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const proverbLines = wrapText(`"${tree.druidicProverb}"`, 44);
  const cleanName = personName ? personName.trim() : '';
  const treeTopLabel = cleanName ? formatTurkishPossessive(cleanName) : 'KUTSAL AĞAÇ';
  const footerText = cleanName 
    ? `✨ ${escapeXml(cleanName)} İçin Özel Analiz • 7layers.tr/analysis/druid-tree ✨`
    : `✨ Kendi Ruh Ağacını Keşfet: 7layers.tr/analysis/druid-tree ✨`;

  const overlaySvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#04080D"/>
          <stop offset="50%" stop-color="#071118"/>
          <stop offset="100%" stop-color="#020508"/>
        </linearGradient>

        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCD34D"/>
          <stop offset="50%" stop-color="#34D399"/>
          <stop offset="100%" stop-color="#10B981"/>
        </linearGradient>

        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34D399" stop-opacity="0.6"/>
          <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.6"/>
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
      <rect x="20" y="20" width="${CARD_WIDTH - 40}" height="${CARD_HEIGHT - 40}" rx="36" fill="none" stroke="url(#borderGrad)" stroke-width="2"/>

      <!-- Left Column Details (X: 35, Width: 160) -->
      <g transform="translate(35, 55)">
        <!-- Top Pill -->
        <rect x="0" y="0" width="160" height="34" rx="17" fill="#FFFFFF" fill-opacity="0.06" stroke="#34D399" stroke-opacity="0.4" stroke-width="1.2"/>
        <text x="80" y="22" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#34D399" text-anchor="middle" letter-spacing="1.5">
          🌲 7LAYERS 🌲
        </text>

        <!-- Vertical Ogham Rune Badge -->
        <g transform="translate(0, 50)">
          <rect x="0" y="0" width="160" height="110" rx="18" fill="#03080C" fill-opacity="0.8" stroke="#34D399" stroke-opacity="0.3" stroke-width="1.2"/>
          <text x="80" y="55" font-family="'Georgia', serif" font-size="52" font-weight="bold" fill="#34D399" text-anchor="middle" filter="url(#glow)">
            ${tree.oghamSymbol}
          </text>
          <text x="80" y="85" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF" text-anchor="middle" letter-spacing="1.5">
            OGHAM: ${tree.oghamName.toUpperCase()}
          </text>
        </g>

        <!-- Tree Name & Title Block -->
        <g transform="translate(0, 180)">
          <rect x="0" y="0" width="160" height="190" rx="18" fill="#03080C" fill-opacity="0.8" stroke="#F59E0B" stroke-opacity="0.3" stroke-width="1.2"/>
          <text x="80" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-size="${cleanName ? 9.5 : 11}" font-weight="bold" fill="#FCD34D" text-anchor="middle" letter-spacing="1.5">
            ${escapeXml(treeTopLabel)}
          </text>
          <text x="80" y="75" font-family="'Georgia', serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
            ${escapeXml(tree.name.replace(' Ağacı', ''))}
          </text>
          <text x="80" y="105" font-family="'Georgia', serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
            Ağacı
          </text>
          <line x1="25" y1="125" x2="135" y2="125" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1"/>
          <text x="80" y="150" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-style="italic" fill="#9CA3AF" text-anchor="middle">
            ${escapeXml(tree.botanicalName)}
          </text>
        </g>

        <!-- Vertical Period Badge -->
        <g transform="translate(0, 390)">
          <rect x="0" y="0" width="160" height="85" rx="18" fill="#03080C" fill-opacity="0.8" stroke="#34D399" stroke-opacity="0.3" stroke-width="1.2"/>
          <text x="80" y="28" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#34D399" text-anchor="middle" letter-spacing="1">
            KUTSAL DÖNEM
          </text>
          <text x="80" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
            ${escapeXml(tree.periods[0]?.label || '')}
          </text>
        </g>
      </g>

      <!-- Center Portrait Image Glow Frame (x: 220, y: 50, w: 640, h: 853) -->
      <rect x="${PORTRAIT_LEFT - 4}" y="${PORTRAIT_TOP - 4}" width="${PORTRAIT_WIDTH + 8}" height="${PORTRAIT_HEIGHT + 8}" rx="32" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" opacity="0.85" filter="url(#glow)"/>

      <!-- Right Column Details (X: 885, Width: 160) -->
      <g transform="translate(885, 55)">
        <!-- Element Box -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="160" height="90" rx="18" fill="#03080C" fill-opacity="0.8" stroke="#34D399" stroke-opacity="0.3" stroke-width="1.2"/>
          <text x="80" y="30" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#34D399" text-anchor="middle" letter-spacing="1.5">
            DOĞA ELEMENTİ
          </text>
          <text x="80" y="62" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
            ${escapeXml(tree.element)}
          </text>
        </g>

        <!-- Ruler Planets Box -->
        <g transform="translate(0, 105)">
          <rect x="0" y="0" width="160" height="110" rx="18" fill="#03080C" fill-opacity="0.8" stroke="#F59E0B" stroke-opacity="0.3" stroke-width="1.2"/>
          <text x="80" y="30" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#FCD34D" text-anchor="middle" letter-spacing="1.5">
            KOZMİK GÜÇ
          </text>
          <text x="80" y="65" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
            ${escapeXml(tree.rulingPlanets.split('&')[0]?.trim() || tree.rulingPlanets)}
          </text>
          ${tree.rulingPlanets.includes('&') ? `
            <text x="80" y="88" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#E5E7EB" text-anchor="middle">
              &amp; ${escapeXml(tree.rulingPlanets.split('&')[1]?.trim())}
            </text>
          ` : ''}
        </g>

        <!-- Light Trait Highlight -->
        <g transform="translate(0, 230)">
          <rect x="0" y="0" width="160" height="150" rx="18" fill="#03080C" fill-opacity="0.8" stroke="#34D399" stroke-opacity="0.3" stroke-width="1.2"/>
          <text x="80" y="28" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#34D399" text-anchor="middle" letter-spacing="1">
            RUHSAL ERDEM
          </text>
          <text x="80" y="65" font-family="'Georgia', serif" font-size="13" font-style="italic" fill="#FCD34D" text-anchor="middle">
            ✦ ${escapeXml(tree.lightTraits[0]?.slice(0, 16) || '')}
          </text>
          <text x="80" y="90" font-family="'Georgia', serif" font-size="12" font-style="italic" fill="#E5E7EB" text-anchor="middle">
            ${escapeXml(tree.lightTraits[0]?.slice(16, 36) || '')}
          </text>
          <text x="80" y="125" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" fill="#9CA3AF" text-anchor="middle">
            Kutsal Koruyucu
          </text>
        </g>

        <!-- Celtic Knot Seal -->
        <g transform="translate(0, 395)">
          <rect x="0" y="0" width="160" height="80" rx="18" fill="#03080C" fill-opacity="0.8" stroke="#34D399" stroke-opacity="0.3" stroke-width="1.2"/>
          <text x="80" y="48" font-family="'Segoe UI', Roboto, sans-serif" font-size="28" fill="#34D399" text-anchor="middle" filter="url(#glow)">
            ☸
          </text>
        </g>
      </g>

      <!-- Bottom Section (Y: 925 to 1400) -->
      <g transform="translate(35, 925)">
        <!-- Archetype Box -->
        <rect x="0" y="0" width="${CARD_WIDTH - 70}" height="95" rx="20" fill="#040A10" fill-opacity="0.85" stroke="#34D399" stroke-opacity="0.4" stroke-width="1.5"/>
        <text x="35" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="bold" fill="#34D399" letter-spacing="1.5">
          ✨ RUHSAL ARKETİP &amp; MİZAÇ:
        </text>
        <text x="35" y="73" font-family="'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF">
          ${escapeXml(tree.archetype)}
        </text>

        <!-- Proverb Box -->
        <g transform="translate(0, 112)">
          <rect x="0" y="0" width="${CARD_WIDTH - 70}" height="195" rx="20" fill="#000000" fill-opacity="0.75" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5"/>
          <line x1="2" y1="18" x2="2" y2="177" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>

          <text x="35" y="38" font-family="'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="700" fill="#FCD34D" letter-spacing="2">
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
        <line x1="120" y1="335" x2="${CARD_WIDTH - 190}" y2="335" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1"/>
        <text x="${(CARD_WIDTH - 70) / 2}" y="375" font-family="'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="700" fill="#34D399" text-anchor="middle" letter-spacing="2">
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
