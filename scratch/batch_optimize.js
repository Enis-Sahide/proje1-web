const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const IMAGES = [
  { file: 'mystic_kabbalah_tree.jpg', width: 1200, quality: 78, type: 'jpeg' },
  { file: 'unconditional_love_and_expectations.jpg', width: 1200, quality: 78, type: 'jpeg' },
  { file: 'shm.jpg', width: 1024, quality: 78, type: 'jpeg' },
  { file: 'vocal_frequency_healing.jpg', width: 1024, quality: 78, type: 'jpeg' },
  { file: 'mind_and_instinct.jpg', width: 1024, quality: 78, type: 'jpeg' },
  { file: 'barefoot_nature.jpg', width: 1024, quality: 78, type: 'jpeg' },
  { file: 'tcm_meridians.png', width: 1024, quality: 80, type: 'png' },
  { file: 'tcm_tongue.png', width: 1024, quality: 80, type: 'png' }
];

async function main() {
  const results = [];

  for (const item of IMAGES) {
    const filePath = path.resolve('public', item.file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping: ${item.file} (not found)`);
      continue;
    }

    const originalSize = fs.statSync(filePath).size;
    const tempPath = path.resolve('public', `_temp_${item.file}`);

    let pipeline = sharp(filePath).resize({ width: item.width, withoutEnlargement: true });

    if (item.type === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: item.quality, progressive: true, mozjpeg: true });
    } else if (item.type === 'png') {
      pipeline = pipeline.png({ quality: item.quality, compressionLevel: 9, palette: true });
    }

    await pipeline.toFile(tempPath);

    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);

    const newSize = fs.statSync(filePath).size;
    results.push({
      file: item.file,
      beforeKB: Math.round(originalSize / 1024),
      afterKB: Math.round(newSize / 1024),
      savings: `${Math.round((1 - newSize / originalSize) * 100)}%`
    });
  }

  console.table(results);
}

main().catch(err => {
  console.error('Batch optimization error:', err);
  process.exit(1);
});
