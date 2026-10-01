import fs from 'fs';
import path from 'path';
import { DRUID_TREES } from '../src/features/astrology/engine/DruidTreeEngine';
import { renderDruidTreeCard } from '../src/features/astrology/server/druidTreeCardService';

async function main() {
  const publicDir = path.resolve(__dirname, '../public/druid-trees');
  const mobPublicDir = path.resolve(__dirname, '../../mobil/assets/druid-trees');

  for (const tree of DRUID_TREES) {
    const rawImg = path.join(publicDir, `${tree.id}.jpg`);
    if (!fs.existsSync(rawImg)) {
      console.warn(`Missing raw image for: ${tree.id}`);
      continue;
    }

    const cardBuffer = await renderDruidTreeCard(tree, rawImg);
    const cardOutput = path.join(publicDir, `${tree.id}-card.jpg`);
    await fs.promises.writeFile(cardOutput, cardBuffer);
    console.log(`Card created: ${cardOutput}`);

    if (fs.existsSync(mobPublicDir)) {
      const mobCardOutput = path.join(mobPublicDir, `${tree.id}-card.jpg`);
      await fs.promises.writeFile(mobCardOutput, cardBuffer);
    }
  }

  console.log('All 13 Druid Tree Cards successfully updated with clean layout and typography!');
}

main().catch(console.error);
