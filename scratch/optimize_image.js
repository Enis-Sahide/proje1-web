const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function optimize() {
  const inputPath = path.resolve('public/sun_gaia_esoteric.jpg');
  const tempJpgPath = path.resolve('public/sun_gaia_esoteric_opt.jpg');
  const webpPath = path.resolve('public/sun_gaia_esoteric.webp');

  console.log('Original size:', fs.statSync(inputPath).size, 'bytes');

  // Resize to 1024px width, progressive, quality 78
  await sharp(inputPath)
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true, mozjpeg: true })
    .toFile(tempJpgPath);

  // Also create WebP version
  await sharp(inputPath)
    .resize({ width: 1024, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(webpPath);

  // Replace original JPG with optimized JPG
  fs.unlinkSync(inputPath);
  fs.renameSync(tempJpgPath, inputPath);

  console.log('Optimized JPG size:', fs.statSync(inputPath).size, 'bytes');
  console.log('Optimized WebP size:', fs.statSync(webpPath).size, 'bytes');
}

optimize().catch(err => {
  console.error('Error optimizing image:', err);
  process.exit(1);
});
