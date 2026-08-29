const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
const imgPath = path.join(publicDir, 'barefoot_nature.jpg');
const tempPath = path.join(publicDir, 'barefoot_nature-temp.jpg');

async function run() {
  if (!fs.existsSync(imgPath)) {
    console.error('Image not found:', imgPath);
    return;
  }

  console.log('Optimizing barefoot_nature.jpg...');
  try {
    const originalSize = fs.statSync(imgPath).size;
    console.log('Original Size:', (originalSize / 1024).toFixed(2), 'KB');

    await sharp(imgPath)
      .resize(1200) // resize width to 1200, height auto
      .jpeg({ quality: 80 })
      .toFile(tempPath);

    fs.unlinkSync(imgPath);
    fs.renameSync(tempPath, imgPath);

    const optimizedSize = fs.statSync(imgPath).size;
    console.log('Optimized Size:', (optimizedSize / 1024).toFixed(2), 'KB');
    console.log('barefoot_nature.jpg optimized successfully!');
  } catch (err) {
    console.error('Error optimizing image:', err);
  }
}

run();
