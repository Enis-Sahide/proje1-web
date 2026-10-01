import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { DRUID_TREES } from '../src/features/astrology/engine/DruidTreeEngine';

async function main() {
  const publicDir = path.resolve(__dirname, '../public/druid-trees');
  const mobPublicDir = path.resolve(__dirname, '../../mobil/assets/druid-trees');

  for (const tree of DRUID_TREES) {
    const imgPath = path.join(publicDir, `${tree.id}.jpg`);
    if (!fs.existsSync(imgPath)) {
      console.warn(`File not found: ${imgPath}`);
      continue;
    }

    const inputBuffer = fs.readFileSync(imgPath);
    const meta = await sharp(inputBuffer).metadata();
    const W = meta.width || 896;
    const H = meta.height || 1200;

    // Seçenek 1: Belirgin, Net ve Şık 7LAYERS Rozeti (Tek Katman)
    const svgBadge = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.9"/>
          </filter>
        </defs>
        <g transform="translate(${W - 270}, ${H - 85})">
          <rect width="240" height="56" rx="28" fill="#04090E" fill-opacity="0.85" stroke="#34D399" stroke-opacity="0.7" stroke-width="2"/>
          <text x="120" y="36" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#FCD34D" text-anchor="middle" letter-spacing="3" filter="url(#glow)">
            ✦ 7LAYERS ✦
          </text>
        </g>
      </svg>
    `;

    const watermarkedBuffer = await sharp(inputBuffer)
      .composite([{ input: Buffer.from(svgBadge) }])
      .jpeg({ quality: 92 })
      .toBuffer();

    fs.writeFileSync(imgPath, watermarkedBuffer);
    console.log(`Watermarked web: ${tree.id}.jpg`);

    if (fs.existsSync(mobPublicDir)) {
      const mobImgPath = path.join(mobPublicDir, `${tree.id}.jpg`);
      fs.writeFileSync(mobImgPath, watermarkedBuffer);
      console.log(`Watermarked mobile: ${tree.id}.jpg`);
    }
  }

  console.log('All 13 Druid Tree images successfully stamped with clean 7LAYERS badge!');
}

main().catch(console.error);
