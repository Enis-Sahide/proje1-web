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

    const inputBuffer = await fs.promises.readFile(imgPath);
    const meta = await sharp(inputBuffer).metadata();
    const W = meta.width || 896;
    const H = meta.height || 1200;

    // Seçenek 1: Lüks Yarı Saydam Rozet
    const svgBadge = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.8"/>
          </filter>
        </defs>
        <g transform="translate(${W - 215}, ${H - 65})">
          <rect width="185" height="38" rx="19" fill="#04090E" fill-opacity="0.75" stroke="#34D399" stroke-opacity="0.45" stroke-width="1.5"/>
          <text x="92" y="24" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#FCD34D" text-anchor="middle" letter-spacing="2.5" filter="url(#shadow)">
            ✦ 7LAYERS ✦
          </text>
        </g>
      </svg>
    `;

    const watermarkedBuffer = await sharp(inputBuffer)
      .composite([{ input: Buffer.from(svgBadge) }])
      .jpeg({ quality: 92 })
      .toBuffer();

    await fs.promises.writeFile(imgPath, watermarkedBuffer);
    console.log(`Watermarked web: ${tree.id}.jpg`);

    if (fs.existsSync(mobPublicDir)) {
      const mobImgPath = path.join(mobPublicDir, `${tree.id}.jpg`);
      await fs.promises.writeFile(mobImgPath, watermarkedBuffer);
      console.log(`Watermarked mobile: ${tree.id}.jpg`);
    }
  }

  console.log('All 13 Druid Tree images successfully stamped with 7LAYERS badge!');
}

main().catch(console.error);
