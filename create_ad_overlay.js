const sharp = require('sharp');
const path = require('path');

const bgPath = 'C:\\Users\\baha\\.gemini\\antigravity-ide\\brain\\aa884945-8be4-4b6c-af8f-16a831497c6f\\astro_vertical_story_pdf_bg_1787230416582.png';
const outputPath = 'c:\\projeler\\7layers\\web\\public\\four_layer_astrology_ad.png';

async function main() {
  const image = sharp(bgPath);
  const metadata = await image.metadata();
  const width = metadata.width || 1080;
  const height = metadata.height || 1920;

  console.log(`Image dimensions: ${width}x${height}`);

  // Create a stunning comparative vertical SVG overlay for stories (1080x1920)
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
          <stop offset="0%" stop-color="rgba(8, 10, 24, 0.95)" />
          <stop offset="50%" stop-color="rgba(16, 20, 48, 0.92)" />
          <stop offset="100%" stop-color="rgba(8, 10, 24, 0.95)" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(12, 15, 35, 0.96)" />
          <stop offset="100%" stop-color="rgba(6, 8, 20, 0.98)" />
        </linearGradient>
        <!-- Shadow -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.95"/>
        </filter>
      </defs>

      <!-- Top Header Panel -->
      <rect x="50" y="50" width="${width - 100}" height="170" rx="18" 
            fill="url(#blueGrad)" stroke="url(#goldGrad)" stroke-width="2" filter="url(#shadow)" />
      
      <text x="${width / 2}" y="100" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="800" 
            fill="url(#goldGrad)" text-anchor="middle" letter-spacing="4">KİŞİYE ÖZEL YAZILIMSAL ANALİZLER</text>
            
      <text x="${width / 2}" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="900" 
            fill="#FFFFFF" text-anchor="middle" letter-spacing="1" filter="url(#shadow)">7LAYERS ASTROLOJİ SERVİSLERİ</text>
      
      <text x="${width / 2}" y="185" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" 
            fill="#94A3B8" text-anchor="middle" letter-spacing="0.5">Ezoterik Kadim Kaynaklardan • İnsan Yorumundan Bağımsız</text>


      <!-- BOTTOM BLOCK: Stacked Cards for Vertical Layout -->

      <!-- CARD 1: Klasik Doğum Haritası -->
      <rect x="60" y="1160" width="${width - 120}" height="320" rx="20" 
            fill="url(#cardGrad)" stroke="rgba(212, 175, 55, 0.4)" stroke-width="2" filter="url(#shadow)" />
      
      <rect x="85" y="1185" width="180" height="32" rx="6" fill="#1E293B" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
      <text x="175" y="1205" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" 
            fill="#94A3B8" text-anchor="middle" letter-spacing="1">YENİ BAŞLAYANLAR İÇİN</text>
            
      <text x="85" y="1250" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="900" 
            fill="#FFFFFF" text-anchor="start" letter-spacing="0.5">KLASİK DOĞUM HARİTASI</text>
      
      <!-- Bullet Points Left -->
      <circle cx="95" cy="1295" r="4.5" fill="url(#goldGrad)" />
      <text x="115" y="1300" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#E2E8F0">Karakter ve Potansiyeller Analizi</text>

      <circle cx="95" cy="1330" r="4.5" fill="url(#goldGrad)" />
      <text x="115" y="1335" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#E2E8F0">Kariyer, İlişkiler ve Sağlık Hayatı</text>

      <circle cx="95" cy="1365" r="4.5" fill="url(#goldGrad)" />
      <text x="115" y="1370" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#E2E8F0">Gezegen Konumları ve Ev Yerleşimleri</text>
      
      <foreignObject x="85" y="1405" width="910" height="60">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #94A3B8; font-weight: 500; line-height: 1.4; text-align: left;">
          Astrolojiye yeni başlayanlar için en sade, net ve anlaşılır dünyevi rehberlik dökümanı.
        </div>
      </foreignObject>


      <!-- CARD 2: 4 Katmanlı Ezoterik Harita -->
      <rect x="60" y="1520" width="${width - 120}" height="320" rx="20" 
            fill="url(#cardGrad)" stroke="url(#goldGrad)" stroke-width="2.5" filter="url(#shadow)" />

      <rect x="85" y="1545" width="180" height="32" rx="6" fill="#1E293B" stroke="url(#goldGrad)" stroke-width="1.5" />
      <text x="175" y="1565" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" 
            fill="url(#goldGrad)" text-anchor="middle" letter-spacing="1">İLERİ SEVİYE / ANALİZ</text>

      <text x="85" y="1610" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="900" 
            fill="url(#goldGrad)" text-anchor="start" letter-spacing="0.5">4 KATMANLI EZOTERİK HARİTA</text>

      <!-- Bullet Points Right -->
      <circle cx="95" cy="1655" r="4.5" fill="url(#goldGrad)" />
      <text x="115" y="1660" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#E2E8F0">Ruhun Evrimi ve Tekamül Yolculuğu</text>

      <circle cx="95" cy="1690" r="4.5" fill="url(#goldGrad)" />
      <text x="115" y="1695" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#E2E8F0">Geçmiş Yaşam Karmaları ve Ay Düğümleri</text>

      <circle cx="95" cy="1725" r="4.5" fill="url(#goldGrad)" />
      <text x="115" y="1730" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#E2E8F0">4 Alem (Assiah, Yetzirah, Briah, Atziluth)</text>
      
      <foreignObject x="85" y="1765" width="910" height="60">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #94A3B8; font-weight: 500; line-height: 1.4; text-align: left;">
          Ruhsal ve derin karmik arayışta olanlar, hayat amacını ve ilahi misyonunu arayanlar için ideal.
        </div>
      </foreignObject>

    </svg>
  `;

  await image
    .composite([{
      input: Buffer.from(svgOverlay),
      top: 0,
      left: 0
    }])
    .toFile(outputPath);

  console.log(`Successfully generated Turkish comparative advertisement at: ${outputPath}`);
}

main().catch(console.error);
