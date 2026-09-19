const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\baha\\.gemini\\antigravity-ide\\brain\\af6f26ed-98dd-476b-bb35-2a1ab42ed59e';
const tomskImgPath = path.join(__dirname, 'real_tomsk.jpg');

async function buildFrames() {
  console.log('Preparing real 7Layers Schumann scenes with Sharp...');

  // Read real tomsk image as base64 for embedding in SVG
  const tomskBuf = fs.readFileSync(tomskImgPath);
  const tomskBase64 = `data:image/jpeg;base64,${tomskBuf.toString('base64')}`;

  // -------------------------------------------------------------
  // FRAME 1: Hook - Gerçek 7Layers Girişi ve Semptom Sorusu
  // -------------------------------------------------------------
  const svgFrame1 = `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05050A"/>
        <stop offset="50%" stop-color="#080814"/>
        <stop offset="100%" stop-color="#030308"/>
      </linearGradient>
      <radialGradient id="glowCyan" cx="0.5" cy="0.3" r="0.4">
        <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowGold" cx="0.5" cy="0.75" r="0.4">
        <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.8"/>
      </filter>
    </defs>

    <rect width="1080" height="1920" fill="url(#bg)"/>
    <circle cx="540" cy="500" r="600" fill="url(#glowCyan)"/>
    <circle cx="540" cy="1400" r="600" fill="url(#glowGold)"/>

    <!-- 7Layers Header -->
    <g transform="translate(0, 140)">
      <text x="540" y="0" text-anchor="middle" font-family="'Segoe UI', 'Arial', sans-serif" font-weight="900" font-size="34" fill="#D4AF37" letter-spacing="8">7LAYERS</text>
      <text x="540" y="38" text-anchor="middle" font-family="'Segoe UI', 'Arial', sans-serif" font-weight="600" font-size="18" fill="#FFFFFF" fill-opacity="0.6" letter-spacing="4">KADİM BİLGİLER VE ANALİZ PORTALI</text>
      <line x1="440" y1="65" x2="640" y2="65" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.4"/>
    </g>

    <!-- Main Card Hook -->
    <g transform="translate(80, 420)" filter="url(#shadow)">
      <rect width="920" height="980" rx="36" fill="#0E101A" fill-opacity="0.85" stroke="#00E5FF" stroke-width="2" stroke-opacity="0.35"/>
      
      <!-- Top Pulsing Live Badge -->
      <g transform="translate(460, 80)">
        <rect x="-180" y="-30" width="360" height="60" rx="30" fill="#00E5FF" fill-opacity="0.12" stroke="#00E5FF" stroke-width="1.5"/>
        <circle cx="-130" cy="0" r="7" fill="#00E5FF"/>
        <text x="-105" y="6" font-family="'Segoe UI', sans-serif" font-weight="800" font-size="18" fill="#00E5FF" letter-spacing="2">CANLI VERİ AKIŞI</text>
      </g>

      <!-- Icon: Waves / Earth Pulse -->
      <g transform="translate(460, 240)">
        <circle cx="0" cy="0" r="75" fill="#00E5FF" fill-opacity="0.08" stroke="#00E5FF" stroke-width="2" stroke-opacity="0.3"/>
        <path d="M -40 10 Q -20 -30 0 10 T 40 10" fill="none" stroke="#00E5FF" stroke-width="6" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="14" fill="#D4AF37"/>
      </g>

      <!-- Question Text -->
      <text x="460" y="390" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="44" fill="#FFFFFF">BUGÜN SEBEPSİZ BİR</text>
      <text x="460" y="450" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="44" fill="#FFB84D">AĞIRLIK YA DA ÇINLAMA</text>
      <text x="460" y="510" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="44" fill="#FFFFFF">MI HİSSEDİYORSUN?</text>

      <line x1="160" y1="570" x2="760" y2="570" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.15"/>

      <!-- Explanation -->
      <text x="460" y="640" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="600" font-size="26" fill="#FFFFFF" fill-opacity="0.8">Sorun sende değil.</text>
      <text x="460" y="690" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="28" fill="#00E5FF">Dünya'nın Kalp Atışı Olan</text>
      <text x="460" y="740" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="34" fill="#D4AF37">SCHUMANN REZONANSI</text>
      <text x="460" y="790" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="26" fill="#FFFFFF">AZ ÖNCE SERTÇE SIÇRADI ⚡</text>

      <!-- Sub label -->
      <g transform="translate(460, 890)">
        <rect x="-240" y="-30" width="480" height="60" rx="30" fill="#FFFFFF" fill-opacity="0.06" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.5"/>
        <text x="0" y="7" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="20" fill="#D4AF37" letter-spacing="1">7LAYERS CANLI ÖLÇÜMÜ</text>
      </g>
    </g>

    <!-- Bottom Swipe Indicator -->
    <text x="540" y="1740" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="24" fill="#00E5FF" letter-spacing="2">CANLI GÖZLEMEVİ VERİSİ İÇİN İZLEYİN ↓</text>
  </svg>
  `;

  // -------------------------------------------------------------
  // FRAME 2: Real 7Layers Tomsk Live Spectrogram Interface
  // -------------------------------------------------------------
  const svgFrame2 = `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05050A"/>
        <stop offset="40%" stop-color="#070712"/>
        <stop offset="100%" stop-color="#040409"/>
      </linearGradient>
      <filter id="shadow2" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.9"/>
      </filter>
    </defs>

    <rect width="1080" height="1920" fill="url(#bg2)"/>

    <!-- Page Header (Real 7Layers style) -->
    <g transform="translate(80, 130)">
      <text x="0" y="0" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="42" fill="#FFFFFF">Schumann Rezonansı</text>
      <text x="0" y="44" font-family="'Segoe UI', sans-serif" font-weight="600" font-size="22" fill="#00E5FF">&amp; Kozmik Enerji Portalı</text>
    </g>

    <!-- Live Observatory Badges Row -->
    <g transform="translate(80, 240)">
      <rect x="0" y="0" width="280" height="48" rx="14" fill="#00E5FF" fill-opacity="0.12" stroke="#00E5FF" stroke-width="1.5"/>
      <circle cx="24" cy="24" r="6" fill="#00E5FF"/>
      <text x="44" y="31" font-family="'Segoe UI', sans-serif" font-weight="800" font-size="15" fill="#00E5FF" letter-spacing="1">CANLI ÖLÇÜM</text>

      <!-- Time Badges -->
      <rect x="300" y="0" width="280" height="48" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.1"/>
      <text x="320" y="30" font-family="'Segoe UI', sans-serif" font-weight="600" font-size="15" fill="#FFFFFF">Yerel: <tspan fill="#00E5FF" font-weight="800">22:45</tspan></text>

      <rect x="600" y="0" width="320" height="48" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.1"/>
      <text x="620" y="30" font-family="'Segoe UI', sans-serif" font-weight="600" font-size="15" fill="#FFFFFF">Tomsk: <tspan fill="#A78BFA" font-weight="800">02:45 (Rusya)</tspan></text>
    </g>

    <!-- Real Spectrogram Card Container -->
    <g transform="translate(60, 330)" filter="url(#shadow2)">
      <rect width="960" height="660" rx="28" fill="#080812" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.15"/>
      
      <!-- Header inside card -->
      <text x="40" y="55" font-family="'Segoe UI', sans-serif" font-weight="800" font-size="24" fill="#FFFFFF">Space Observing System 70</text>
      <text x="40" y="88" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="16" fill="#FFFFFF" fill-opacity="0.5">Tomsk Rasathanesi Canlı İyonosfer Spektrogramı</text>

      <!-- Embedded Real Tomsk Spectrogram Image -->
      <g transform="translate(30, 120)">
        <rect width="900" height="460" rx="16" fill="#000000" stroke="#00E5FF" stroke-width="1" stroke-opacity="0.3"/>
        <clipPath id="tomskClip">
          <rect width="900" height="460" rx="16"/>
        </clipPath>
        <image href="${tomskBase64}" x="0" y="0" width="900" height="460" preserveAspectRatio="xMidYMid slice" clip-path="url(#tomskClip)"/>
      </g>

      <!-- Frequency Marker Labels -->
      <g transform="translate(40, 620)">
        <text x="0" y="0" font-family="'Segoe UI', sans-serif" font-weight="800" font-size="15" fill="#00E5FF">ANA FREKANS: 7.83 Hz</text>
        <text x="320" y="0" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="15" fill="#10B981">14.1 Hz</text>
        <text x="440" y="0" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="15" fill="#F59E0B">20.3 Hz</text>
        <text x="560" y="0" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="15" fill="#EF4444">26.4 Hz</text>
      </g>
    </g>

    <!-- Explanation Box (Directly from 7Layers Kılavuzu) -->
    <g transform="translate(60, 1040)" filter="url(#shadow2)">
      <rect width="960" height="660" rx="28" fill="#0A0D18" fill-opacity="0.9" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.3"/>
      
      <text x="40" y="60" font-family="'Segoe UI', sans-serif" font-weight="800" font-size="26" fill="#D4AF37">GRAFİK RENKLERİNİN ANLAMI</text>
      
      <!-- Color Guide Grid -->
      <g transform="translate(40, 110)">
        <circle cx="15" cy="15" r="15" fill="#10B981"/>
        <text x="45" y="22" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="20" fill="#FFFFFF">Yeşil: <tspan fill="#FFFFFF" fill-opacity="0.7" font-weight="500">Doğal 7.83 Hz Denge Frekansı</tspan></text>
      </g>
      <g transform="translate(40, 185)">
        <circle cx="15" cy="15" r="15" fill="#F59E0B"/>
        <text x="45" y="22" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="20" fill="#FFFFFF">Sarı/Turuncu: <tspan fill="#FFFFFF" fill-opacity="0.7" font-weight="500">Hafif ve Orta Uyarılma Fazı</tspan></text>
      </g>
      <g transform="translate(40, 260)">
        <circle cx="15" cy="15" r="15" fill="#EF4444"/>
        <text x="45" y="22" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="20" fill="#FFFFFF">Kırmızı: <tspan fill="#FFFFFF" fill-opacity="0.7" font-weight="500">Aktif Manyetik Dalgalanma</tspan></text>
      </g>
      <g transform="translate(40, 335)">
        <circle cx="15" cy="15" r="15" fill="#FFFFFF" stroke="#00E5FF" stroke-width="2"/>
        <text x="45" y="22" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="20" fill="#FFFFFF">Beyaz: <tspan fill="#00E5FF" font-weight="700">Zirve Elektromanyetik Parlamalar ⚡</tspan></text>
      </g>

      <line x1="40" y1="410" x2="920" y2="410" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.1"/>

      <text x="40" y="470" font-family="'Segoe UI', sans-serif" font-weight="800" font-size="24" fill="#00E5FF">CANLI TAKİP ET &amp; BEDENİNİ ANLA</text>
      <text x="40" y="520" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="20" fill="#FFFFFF" fill-opacity="0.8">Frekans yükseldiğinde baş ağrısı ve uyku düzenindeki</text>
      <text x="40" y="560" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="20" fill="#FFFFFF" fill-opacity="0.8">değişimleri anlık olarak grafikte gör.</text>

      <g transform="translate(40, 600)">
        <text x="0" y="0" font-family="'Segoe UI', sans-serif" font-weight="800" font-size="18" fill="#D4AF37">7LAYERS • CANLI KOZMİK VERİ</text>
      </g>
    </g>

    <text x="540" y="1770" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="800" font-size="24" fill="#00E5FF">BEDENSEL SEMPTOMLAR VE REHBERLİK ↓</text>
  </svg>
  `;

  // -------------------------------------------------------------
  // FRAME 3: Real 7Layers Semptom ve Ruhsal Rehberlik Kartları
  // -------------------------------------------------------------
  const svgFrame3 = `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05050A"/>
        <stop offset="50%" stop-color="#0A0B16"/>
        <stop offset="100%" stop-color="#040409"/>
      </linearGradient>
      <filter id="shadow3" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.9"/>
      </filter>
    </defs>

    <rect width="1080" height="1920" fill="url(#bg3)"/>

    <!-- Header -->
    <g transform="translate(80, 140)">
      <text x="0" y="0" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="38" fill="#FFFFFF">Rezonans Seviyeleri &amp;</text>
      <text x="0" y="46" font-family="'Segoe UI', sans-serif" font-weight="800" font-size="32" fill="#D4AF37">Beden Reaksiyonları Kılavuzu</text>
      <text x="0" y="90" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="18" fill="#FFFFFF" fill-opacity="0.6">7Layers Biyo-Frekans ve Ruhsal Analiz Motoru</text>
    </g>

    <!-- Card 1: Beden Reaksiyonları (Direct from 7Layers DB/UI) -->
    <g transform="translate(60, 310)" filter="url(#shadow3)">
      <rect width="960" height="420" rx="28" fill="#0C0E1A" stroke="#00E5FF" stroke-width="2" stroke-opacity="0.4"/>
      
      <g transform="translate(40, 60)">
        <text x="0" y="0" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="28" fill="#00E5FF">⚡ Beden Reaksiyonları Nelerdir?</text>
      </g>

      <g transform="translate(40, 120)">
        <circle cx="10" cy="10" r="6" fill="#00E5FF"/>
        <text x="35" y="16" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="22" fill="#FFFFFF">Kulaklarda Tiz Çınlama ve Uğultular</text>
        <text x="35" y="48" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="17" fill="#FFFFFF" fill-opacity="0.65">Frekans yükseldiğinde sinir sistemi uyarılır.</text>
      </g>

      <g transform="translate(40, 210)">
        <circle cx="10" cy="10" r="6" fill="#00E5FF"/>
        <text x="35" y="16" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="22" fill="#FFFFFF">Baş ve Ense Bölgesinde Geçici Basınç</text>
        <text x="35" y="48" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="17" fill="#FFFFFF" fill-opacity="0.65">İyonosferdeki elektromanyetik yüklenme artışı.</text>
      </g>

      <g transform="translate(40, 300)">
        <circle cx="10" cy="10" r="6" fill="#00E5FF"/>
        <text x="35" y="16" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="22" fill="#FFFFFF">Canlı ve Berrak Rüyalar, Uyku Kaymaları</text>
        <text x="35" y="48" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="17" fill="#FFFFFF" fill-opacity="0.65">Theta ve alfa dalgaları Dünya ritmiyle etkileşir.</text>
      </g>
    </g>

    <!-- Card 2: Ruhsal Rehberlik (Direct from 7Layers DB/UI) -->
    <g transform="translate(60, 770)" filter="url(#shadow3)">
      <rect width="960" height="420" rx="28" fill="#0E1118" stroke="#D4AF37" stroke-width="2" stroke-opacity="0.4"/>
      
      <g transform="translate(40, 60)">
        <text x="0" y="0" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="28" fill="#D4AF37">🧘 7Layers Ruhsal Rehberlik</text>
      </g>

      <g transform="translate(40, 120)">
        <circle cx="10" cy="10" r="6" fill="#D4AF37"/>
        <text x="35" y="16" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="22" fill="#FFFFFF">Kalp Çakrası ve Aura Genişlemesi</text>
        <text x="35" y="48" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="17" fill="#FFFFFF" fill-opacity="0.65">Enerjini dengelemek için nefes egzersizleri yap.</text>
      </g>

      <g transform="translate(40, 210)">
        <circle cx="10" cy="10" r="6" fill="#D4AF37"/>
        <text x="35" y="16" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="22" fill="#FFFFFF">Topraklanma &amp; Biyolojik Senkronizasyon</text>
        <text x="35" y="48" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="17" fill="#FFFFFF" fill-opacity="0.65">Çıplak ayakla toprağa bas veya tuzlu suyla arın.</text>
      </g>

      <g transform="translate(40, 300)">
        <circle cx="10" cy="10" r="6" fill="#D4AF37"/>
        <text x="35" y="16" font-family="'Segoe UI', sans-serif" font-weight="700" font-size="22" fill="#FFFFFF">7Layers Nefes Odası ile Uyumlan</text>
        <text x="35" y="48" font-family="'Segoe UI', sans-serif" font-weight="500" font-size="17" fill="#FFFFFF" fill-opacity="0.65">528 Hz ve 432 Hz frekanslarıyla dinginleş.</text>
      </g>
    </g>

    <!-- Bottom CTA Card -->
    <g transform="translate(60, 1240)" filter="url(#shadow3)">
      <rect width="960" height="460" rx="28" fill="#0A0C16" stroke="#00E5FF" stroke-width="2"/>
      
      <g transform="translate(480, 100)">
        <circle cx="0" cy="0" r="45" fill="#00E5FF" fill-opacity="0.1" stroke="#00E5FF" stroke-width="2"/>
        <path d="M -15 0 L 0 15 L 20 -15" fill="none" stroke="#00E5FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <text x="480" y="200" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="34" fill="#FFFFFF">DÜNYA'NIN KALP ATIŞINI</text>
      <text x="480" y="245" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="34" fill="#D4AF37">CANLI OLARAK İZLE</text>

      <g transform="translate(480, 340)">
        <rect x="-300" y="-45" width="600" height="90" rx="45" fill="#00E5FF"/>
        <text x="0" y="12" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="28" fill="#000000" letter-spacing="1">7layers.tr/analysis/schumann</text>
      </g>
      
      <text x="480" y="425" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-weight="600" font-size="18" fill="#FFFFFF" fill-opacity="0.6">Ücretsiz Canlı Ölçüm &amp; Günlük Rehberlik</text>
    </g>
  </svg>
  `;

  // Render SVGs to PNGs using sharp
  const p1 = path.join(brainDir, 'real_scene1.png');
  const p2 = path.join(brainDir, 'real_scene2.png');
  const p3 = path.join(brainDir, 'real_scene3.png');

  await sharp(Buffer.from(svgFrame1)).png().toFile(p1);
  console.log('Saved real_scene1.png');

  await sharp(Buffer.from(svgFrame2)).png().toFile(p2);
  console.log('Saved real_scene2.png');

  await sharp(Buffer.from(svgFrame3)).png().toFile(p3);
  console.log('Saved real_scene3.png');

  console.log('All 3 real 7Layers scenes successfully created!');
}

buildFrames().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
