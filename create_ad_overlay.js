const sharp = require('sharp');
const path = require('path');

const bgPath = 'C:\\Users\\baha\\.gemini\\antigravity-ide\\brain\\aa884945-8be4-4b6c-af8f-16a831497c6f\\four_layer_astrology_digital_bg_1787221938991.png';
const outputPath = 'c:\\projeler\\7layers\\web\\public\\four_layer_astrology_ad.png';

async function main() {
  const image = sharp(bgPath);
  const metadata = await image.metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  console.log(`Image dimensions: ${width}x${height}`);

  // Create a stunning SVG overlay with Turkish texts
  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradients -->
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE082" />
          <stop offset="50%" stop-color="#FFB300" />
          <stop offset="100%" stop-color="#B78103" />
        </linearGradient>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(10, 12, 30, 0.92)" />
          <stop offset="50%" stop-color="rgba(20, 25, 55, 0.88)" />
          <stop offset="100%" stop-color="rgba(10, 12, 30, 0.92)" />
        </linearGradient>
        <!-- Shadow -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.9"/>
        </filter>
      </defs>

      <!-- Top Panel -->
      <rect x="50" y="40" width="${width - 100}" height="190" rx="20" 
            fill="url(#blueGrad)" stroke="url(#goldGrad)" stroke-width="2.5" filter="url(#shadow)" />
      
      <text x="${width / 2}" y="95" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="800" 
            fill="url(#goldGrad)" text-anchor="middle" letter-spacing="4">KİŞİYE ÖZEL ANALİZ DÖKÜMANI</text>
            
      <text x="${width / 2}" y="155" font-family="'Segoe UI', Arial, sans-serif" font-size="44" font-weight="900" 
            fill="#FFFFFF" text-anchor="middle" letter-spacing="2" filter="url(#shadow)">4 KATMANLI HARİTA ANALİZİ</text>
      
      <text x="${width / 2}" y="200" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="500" 
            fill="#E2E8F0" text-anchor="middle" letter-spacing="1">Tamamen Ezoterik Kadim Astroloji Kaynaklarından Derlenmiştir</text>

      <!-- Bottom Panel -->
      <rect x="50" y="${height - 210}" width="${width - 100}" height="170" rx="20" 
            fill="url(#blueGrad)" stroke="url(#goldGrad)" stroke-width="2.5" filter="url(#shadow)" />

      <text x="${width / 2}" y="${height - 165}" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="800" 
            fill="url(#goldGrad)" text-anchor="middle" letter-spacing="2">YAZILIMSAL ANALİZ RAPORU</text>

      <text x="${width / 2}" y="${height - 120}" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="700" 
            fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">İnsan Yorumu ve Kişisel Önyargılardan Tamamen Bağımsız</text>

      <text x="${width / 2}" y="${height - 80}" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="400" 
            fill="#94A3B8" text-anchor="middle" letter-spacing="0.5">%100 Algoritmik, Objektif ve Kadim Bilgilerle Hazırlanmış Döküman</text>
    </svg>
  `;

  await image
    .composite([{
      input: Buffer.from(svgOverlay),
      top: 0,
      left: 0
    }])
    .toFile(outputPath);

  console.log(`Successfully generated Turkish advertisement at: ${outputPath}`);
}

main().catch(console.error);
