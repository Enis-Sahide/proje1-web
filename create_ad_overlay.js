const sharp = require('sharp');
const path = require('path');

const bgPath = 'C:\\Users\\baha\\.gemini\\antigravity-ide\\brain\\aa884945-8be4-4b6c-af8f-16a831497c6f\\astro_comparative_ad_bg_1787227883855.png';
const outputPath = 'c:\\projeler\\7layers\\web\\public\\four_layer_astrology_ad.png';

async function main() {
  const image = sharp(bgPath);
  const metadata = await image.metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  console.log(`Image dimensions: ${width}x${height}`);

  // Create a stunning comparative SVG overlay with Turkish texts
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
          <stop offset="0%" stop-color="rgba(8, 10, 24, 0.94)" />
          <stop offset="50%" stop-color="rgba(16, 20, 48, 0.90)" />
          <stop offset="100%" stop-color="rgba(8, 10, 24, 0.94)" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(12, 15, 35, 0.96)" />
          <stop offset="100%" stop-color="rgba(6, 8, 20, 0.98)" />
        </linearGradient>
        <!-- Shadow -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.95"/>
        </filter>
      </defs>

      <!-- Top Header Panel -->
      <rect x="50" y="30" width="${width - 100}" height="120" rx="15" 
            fill="url(#blueGrad)" stroke="url(#goldGrad)" stroke-width="2" filter="url(#shadow)" />
      
      <text x="${width / 2}" y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="800" 
            fill="url(#goldGrad)" text-anchor="middle" letter-spacing="4">KİŞİYE ÖZEL YAZILIMSAL ANALİZ RAPORLARI</text>
            
      <text x="${width / 2}" y="115" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="900" 
            fill="#FFFFFF" text-anchor="middle" letter-spacing="1" filter="url(#shadow)">7LAYERS ASTROLOJİ SERVİSLERİ</text>
      
      <text x="${width / 2}" y="138" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" 
            fill="#94A3B8" text-anchor="middle" letter-spacing="0.5">Tamamen Ezoterik Kadim Kaynaklardan • İnsan Yorumundan Bağımsız Objektif Çözümleme</text>

      <!-- LEFT CARD: Klasik Doğum Haritası -->
      <rect x="50" y="690" width="430" height="290" rx="18" 
            fill="url(#cardGrad)" stroke="rgba(212, 175, 55, 0.4)" stroke-width="2" filter="url(#shadow)" />
      
      <rect x="70" y="710" width="160" height="28" rx="6" fill="#1E293B" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
      <text x="150" y="728" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="800" 
            fill="#94A3B8" text-anchor="middle" letter-spacing="1">YENİ BAŞLAYANLAR İÇİN</text>
            
      <text x="70" y="770" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="900" 
            fill="#FFFFFF" text-anchor="start" letter-spacing="0.5">KLASİK DOĞUM HARİTASI</text>
      
      <!-- Bullet Points Left -->
      <circle cx="80" cy="815" r="4" fill="url(#goldGrad)" />
      <text x="95" y="819" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#E2E8F0">Karakter ve Potansiyeller Analizi</text>

      <circle cx="80" cy="845" r="4" fill="url(#goldGrad)" />
      <text x="95" y="849" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#E2E8F0">Kariyer, İlişkiler ve Sağlık Hayatı</text>

      <circle cx="80" cy="875" r="4" fill="url(#goldGrad)" />
      <text x="95" y="879" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#E2E8F0">Gezegen Konumları ve Ev Yerleşimleri</text>
      
      <text x="70" y="930" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="500" 
            fill="#94A3B8" text-anchor="start" width="390">Astrolojiye yeni başlayanlar için en sade, net ve anlaşılır dünyevi rehberlik dökümanı.</text>


      <!-- RIGHT CARD: 4 Katmanlı Ezoterik Harita -->
      <rect x="544" y="690" width="430" height="290" rx="18" 
            fill="url(#cardGrad)" stroke="url(#goldGrad)" stroke-width="2.5" filter="url(#shadow)" />

      <rect x="564" y="710" width="160" height="28" rx="6" fill="#1E293B" stroke="url(#goldGrad)" stroke-width="1.5" />
      <text x="644" y="728" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="800" 
            fill="url(#goldGrad)" text-anchor="middle" letter-spacing="1">İLERİ SEVİYE / ANALİZ</text>

      <text x="564" y="770" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="900" 
            fill="url(#goldGrad)" text-anchor="start" letter-spacing="0.5">4 KATMANLI EZOTERİK HARİTA</text>

      <!-- Bullet Points Right -->
      <circle cx="574" cy="815" r="4" fill="url(#goldGrad)" />
      <text x="589" y="819" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#E2E8F0">Ruhun Evrimi ve Tekamül Yolculuğu</text>

      <circle cx="574" cy="845" r="4" fill="url(#goldGrad)" />
      <text x="589" y="849" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#E2E8F0">Geçmiş Yaşam Karmaları ve Ay Düğümleri</text>

      <circle cx="574" cy="875" r="4" fill="url(#goldGrad)" />
      <text x="589" y="879" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#E2E8F0">4 Alem (Assiah, Yetzirah, Briah, Atziluth)</text>
      
      <text x="564" y="930" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="500" 
            fill="#94A3B8" text-anchor="start" width="390">Ruhsal ve derin karmik arayışta olanlar, hayat amacını ve ilahi misyonunu arayanlar için ideal.</text>

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
