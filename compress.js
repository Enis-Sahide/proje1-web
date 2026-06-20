const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, 'public');

async function optimizeLogo() {
  const logoPath = path.join(publicDir, 'logo.png');
  if (fs.existsSync(logoPath)) {
    const tempPath = path.join(publicDir, 'logo-temp.png');
    console.log('Optimizing logo.png...');
    try {
      await sharp(logoPath)
        .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(tempPath);
      
      fs.unlinkSync(logoPath);
      fs.renameSync(tempPath, logoPath);
      console.log('logo.png optimized successfully!');
    } catch (err) {
      console.error('Error optimizing logo:', err);
    }
  }
}

async function optimizeBgs() {
  const bgs = ['fool-bg.png', 'galaxy-bg.png'];
  for (const bg of bgs) {
    const bgPath = path.join(publicDir, bg);
    if (fs.existsSync(bgPath)) {
      const tempPath = path.join(publicDir, bg.replace('.png', '-temp.png'));
      console.log(`Optimizing ${bg}...`);
      try {
        await sharp(bgPath)
          .png({ quality: 75, compressionLevel: 9 })
          .toFile(tempPath);
        
        fs.unlinkSync(bgPath);
        fs.renameSync(tempPath, bgPath);
        console.log(`${bg} optimized successfully!`);
      } catch (err) {
        console.error(`Error optimizing ${bg}:`, err);
      }
    }
  }
}

async function run() {
  await optimizeLogo();
  await optimizeBgs();
  console.log('All images optimized!');
}

run();
