import jsPDF from 'jspdf';
import type { 
  CosmicMatrixReport, 
  MultiWorldCosmicMatrixReport, 
  PlanetaryDynamicDiagnosis 
} from '@/features/astrology/engine/CosmicMatrixEngine';
import type { DruidTree } from '@/features/astrology/engine/DruidTreeEngine';

// Helper to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Helper to draw rounded rectangle on Canvas
const drawCanvasRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

// Offscreen Canvas helper to render authentic golden Elder Futhark rune symbols into a high-DPI image
const renderRuneBadgeDataUrl = (symbols: string[]): string | null => {
  if (typeof document === 'undefined' || !symbols || symbols.length === 0) {
    return null;
  }
  try {
    const canvas = document.createElement('canvas');
    const scale = 3; // 3x Retina DPI for crisp PDF printing
    const w = 220;
    const h = 72;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);

    // Dark mystic background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0a0914');
    bgGrad.addColorStop(0.5, '#120f26');
    bgGrad.addColorStop(1, '#080811');
    ctx.fillStyle = bgGrad;

    const pad = 4;
    drawCanvasRoundedRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 14);
    ctx.fill();

    // Outer gold border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Inner subtle gold ring
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.28)';
    ctx.lineWidth = 1;
    drawCanvasRoundedRect(ctx, pad + 3, pad + 3, w - pad * 2 - 6, h - pad * 2 - 6, 11);
    ctx.stroke();

    // Render golden runes with generous spacing
    ctx.fillStyle = '#FBBF24'; // Bright warm gold
    ctx.font = 'bold 36px "Segoe UI Symbol", "Apple Symbols", "Noto Sans Runic", "BabelStone Runic", serif, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = symbols.join('   ');
    ctx.fillText(text, w / 2, h / 2 + 1);

    return canvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Canvas rune badge rendering error:', e);
    return null;
  }
};

// Word-wrap text renderer that supports inline markdown bold/italic formatting (**text**, *text*, ***text***)
const drawTextWithBold = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 6.5
): number => {
  let curX = x;
  let curY = y;

  const sanitizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/<img.*?src=".*?".*?>/g, '')
    .replace(/^\s*>\s*/gm, '')
    .replace(/\*\*\*(.*?)\*\*\*/g, '**$1**')
  const parts = sanitizedText.split(/(\s+|\*\*)/);
  let isBold = false;

  for (const part of parts) {
    if (part === '**') {
      isBold = !isBold;
      doc.setFont('LiberationSans', isBold ? 'bold' : 'normal');
      continue;
    }
    if (part.includes('\n')) {
      const newlineCount = (part.match(/\n/g) || []).length;
      curX = x;
      curY += lineHeight * newlineCount;
      continue;
    }
    if (part === '') continue;

    // Strip any rogue remaining asterisks so raw stars never leak to PDF
    const cleanWord = part.replace(/\*/g, '');
    if (!cleanWord && part !== '') continue;

    const wordWidth = doc.getTextWidth(cleanWord);
    if (curX + wordWidth > x + maxWidth && cleanWord.trim() !== '') {
      curX = x;
      curY += lineHeight;
    }

    doc.text(cleanWord, curX, curY);
    curX += wordWidth;
  }

  doc.setFont('LiberationSans', 'normal');
  return curY + lineHeight;
};

export const downloadCosmicMatrixPDF = async (
  report: CosmicMatrixReport | MultiWorldCosmicMatrixReport,
  druidTree: DruidTree | null,
  userName: string,
  birthInfo: {
    localDate: string;
    localTime: string;
    cityName: string;
    country?: string;
  }
) => {
  const doc = new jsPDF();

  const primaryDark: [number, number, number] = [10, 13, 20]; // #0A0D14
  const cardDark: [number, number, number] = [20, 25, 38]; // #141926
  const gold: [number, number, number] = [212, 175, 55]; // #D4AF37
  const white: [number, number, number] = [255, 255, 255];
  const muted: [number, number, number] = [170, 180, 200];
  const emerald: [number, number, number] = [52, 211, 153]; // #34D399

  // Paint dark background on new pages
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function (this: any, ...args: any[]) {
    const result = originalAddPage(...args);
    doc.setFillColor(...primaryDark);
    doc.rect(0, 0, 210, 297, 'F');
    return result;
  };

  // Initial page background
  doc.setFillColor(...primaryDark);
  doc.rect(0, 0, 210, 297, 'F');

  // Load custom fonts for Turkish characters
  try {
    const [regularRes, boldRes] = await Promise.all([
      fetch('/fonts/LiberationSans-Regular.ttf'),
      fetch('/fonts/LiberationSans-Bold.ttf')
    ]);

    const [regularBuf, boldBuf] = await Promise.all([
      regularRes.arrayBuffer(),
      boldRes.arrayBuffer()
    ]);

    const base64Regular = arrayBufferToBase64(regularBuf);
    const base64Bold = arrayBufferToBase64(boldBuf);

    doc.addFileToVFS('LiberationSans-Regular.ttf', base64Regular);
    doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');

    doc.addFileToVFS('LiberationSans-Bold.ttf', base64Bold);
    doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');

    doc.setFont('LiberationSans', 'normal');
  } catch (error) {
    console.error('Failed to load custom fonts:', error);
  }

  // Header & Footer helper
  const drawHeaderAndFooter = (pageNumber: number, totalPages: number = 6) => {
    // Header
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.6);
    doc.line(15, 14, 195, 14);

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...gold);
    doc.text('7LAYERS | KOZMİK MATRİS SENTEZİ & RUHSAL KÜNYE', 15, 10.5);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text('Astroloji • Human Design • Kabala • Druid', 195, 10.5, { align: 'right' });

    // Footer
    doc.line(15, 285, 195, 285);
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text('7Layers Bilgelik Sistemi © Kişiye Özel Ezoterik Rapor', 15, 290);
    doc.text(`Sayfa ${pageNumber}`, 195, 290, { align: 'right' });
  };

  let curY = 0;
  let currentPage = 1;

  const ensureSpace = (needed: number) => {
    if (curY + needed > 275) {
      doc.addPage();
      currentPage++;
      drawHeaderAndFooter(currentPage);
      curY = 24;
    }
  };

  // ==========================================
  // SAYFA 1: KAPAK, KÜNYE VE DRUİD AĞACI REHBERİ
  // ==========================================
  drawHeaderAndFooter(1);

  curY = 28;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...gold);
  doc.text('KOZMİK MATRİS SENTEZİ RAPORU', 105, curY, { align: 'center' });

  curY += 7;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...white);
  doc.text('4 Âlem Bilinç Katmanı & 13 Gezegen Dinamik Teşhisi (Master Analiz)', 105, curY, { align: 'center' });

  // Künye Kartı
  curY += 8;
  doc.setFillColor(...cardDark);
  doc.roundedRect(15, curY, 180, 26, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, curY, 180, 26, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...gold);
  doc.text('DANIŞAN / HARİTA SAHİBİ KÜNYESİ', 22, curY + 7);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10.2);
  doc.setTextColor(...white);
  const displayName = userName.trim();
  if (displayName) {
    doc.text(`İsim: ${displayName}`, 22, curY + 15);
    doc.text(`Tarih: ${birthInfo.localDate}   |   Saat: ${birthInfo.localTime}`, 22, curY + 21);
    doc.text(`Konum: ${birthInfo.cityName}${birthInfo.country ? ', ' + birthInfo.country : ''}`, 115, curY + 15);
  } else {
    doc.text(`Tarih: ${birthInfo.localDate}   |   Saat: ${birthInfo.localTime}`, 22, curY + 17);
    doc.text(`Konum: ${birthInfo.cityName}${birthInfo.country ? ', ' + birthInfo.country : ''}`, 115, curY + 17);
  }

  curY += 32;

  // Druid Kök Ağacı Kartı
  if (druidTree) {
    doc.setFillColor(15, 30, 25);
    doc.roundedRect(15, curY, 180, 50, 3, 3, 'F');
    doc.setDrawColor(...emerald);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, curY, 180, 50, 3, 3, 'D');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...emerald);
    doc.text(`RUHSAL KÖK AĞACINIZ: ${druidTree.name.toUpperCase()} (${druidTree.botanicalName})`, 22, curY + 8);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...white);
    doc.text(`Kelt Ogham Sembolü: ${druidTree.oghamSymbol} (${druidTree.oghamName})   |   Element: ${druidTree.element}   |   Yönetici: ${druidTree.rulingPlanets}`, 22, curY + 16);

    const druidDesc = `Doğum gününüz gereği ruhsal rezonansınız ve doğadaki temel kökünüz ${druidTree.name} ile temas halindedir. Bu raporda incelenen 13 gezegenin bitkisel frekansları sizin ağaç kimliğiniz olmayıp; göksel enerjileri içe ve dışa aktarırken dengeleyen kadim aromaterapi frekanslarıdır.`;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.2);
    doc.setTextColor(...muted);
    drawTextWithBold(doc, druidDesc, 22, curY + 23.5, 166, 5.2);

    curY += 56;
  }

  // 4 Âlem / Element Dengesi Özeti
  if (report.fourWorldsBalance) {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(...gold);
    doc.text('4 Âlem & Element Dağılım Dengesi', 15, curY);

    curY += 3;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(15, curY, 195, curY);

    curY += 5;
    const fw = report.fourWorldsBalance;
    const elementsData = [
      { name: 'Ateş / Atzilut (Ruhsal İlham)', percent: `${fw.atzilut.percentage}%`, count: `${fw.atzilut.count} Yerleşim` },
      { name: 'Su / Beriyah (Duygusal Bilinç)', percent: `${fw.beriyah.percentage}%`, count: `${fw.beriyah.count} Yerleşim` },
      { name: 'Hava / Yetzirah (Zihinsel Formülasyon)', percent: `${fw.yetzirah.percentage}%`, count: `${fw.yetzirah.count} Yerleşim` },
      { name: 'Toprak / Assiah (Maddi Tezahür)', percent: `${fw.assiah.percentage}%`, count: `${fw.assiah.count} Yerleşim` }
    ];

    const colW = 42;
    elementsData.forEach((el, i) => {
      const elX = 15 + (i * 45);
      doc.setFillColor(...cardDark);
      doc.roundedRect(elX, curY, colW, 28, 2, 2, 'F');
      doc.setDrawColor(60, 70, 95);
      doc.setLineWidth(0.3);
      doc.roundedRect(elX, curY, colW, 28, 2, 2, 'D');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(13.5);
      doc.setTextColor(...gold);
      doc.text(el.percent, elX + (colW / 2), curY + 10, { align: 'center' });

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...white);
      doc.text(el.count, elX + (colW / 2), curY + 17.5, { align: 'center' });

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...muted);
      const shortName = el.name.split(' (')[0];
      doc.text(shortName, elX + (colW / 2), curY + 24, { align: 'center' });
    });

    curY += 34;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.8);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, `**Baskın Âlem / Enerji:** ${fw.dominantWorld} | **Tekâmül ve Gelişim Âlemi:** ${fw.growthWorld}`, 15, curY, 180, 5.8);
    curY += 4;
  }

  // Yaşam Misyonu
  if (report.coreLifeMission) {
    doc.setFillColor(...cardDark);
    doc.roundedRect(15, curY, 180, 38, 3, 3, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, curY, 180, 38, 3, 3, 'D');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...gold);
    doc.text(`ÇEKİRDEK YAŞAM MİSYONU: ${report.coreLifeMission.title.toUpperCase()}`, 22, curY + 8.5);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...white);
    const mDesc = report.coreLifeMission.description;
    drawTextWithBold(doc, mDesc, 22, curY + 16, 166, 5.5);

    curY += 42;
  }

  // ==========================================
  // SAYFA 2: KİŞİSEL KADİM RUNE MÜHRÜ VE 13 GEZEGEN
  // ==========================================
  doc.addPage();
  currentPage++;
  drawHeaderAndFooter(currentPage);
  curY = 24;

  // 3. KİŞİYE ÖZEL KADİM RUNE MÜHRÜ & TILSIM FORMÜLÜ
  if (report.personalTalisman) {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...gold);
    doc.text('Kişiye Özel Kadim Rune Mührü & Tılsım Formülü', 15, curY);

    curY += 3;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(15, curY, 195, curY);
    curY += 6;

    // Generate Rune Badge image if symbols exist
    const runeBadgeDataUrl = report.personalTalisman.symbols && report.personalTalisman.symbols.length > 0
      ? renderRuneBadgeDataUrl(report.personalTalisman.symbols)
      : null;

    const badgeW = 56;
    const badgeH = 17;
    const badgeExtraH = runeBadgeDataUrl ? (badgeH + 6) : 0;

    // Calculate dynamic height for talisman card
    const runesLines = doc.splitTextToSize(`Kullanılan Rünik & Göksel Semboller: ${report.personalTalisman.runesUsed}`, 166);
    const purposeLines = doc.splitTextToSize(`Amacı & Ruhsal Etkisi: ${report.personalTalisman.purpose}`, 166);
    const bridgeLines = report.personalTalisman.kabbalisticBridge
      ? doc.splitTextToSize(`Ezoterik & Kabbalistik Köprü: ${report.personalTalisman.kabbalisticBridge}`, 166)
      : [];
    const usageLines = doc.splitTextToSize(`Uygulama & Odaklanma: ${report.personalTalisman.usageInstructions}`, 166);
    const incenseLines = report.personalTalisman.incenseAndHerbs 
      ? doc.splitTextToSize(`Önerilen Doğal Tütsü/Bitki: ${report.personalTalisman.incenseAndHerbs}`, 166) 
      : [];

    const lineH = 6.2;
    const totalLinesCount = runesLines.length + purposeLines.length + bridgeLines.length + usageLines.length + incenseLines.length;
    const talismanCardH = 14 + badgeExtraH + (totalLinesCount * lineH) + (incenseLines.length > 0 ? 6 : 4);

    doc.setFillColor(...cardDark);
    doc.roundedRect(15, curY, 180, talismanCardH, 3, 3, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, curY, 180, talismanCardH, 3, 3, 'D');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(...gold);
    doc.text(report.personalTalisman.title, 22, curY + 8.5);

    let textY = curY + 16;
    if (runeBadgeDataUrl) {
      const badgeX = 15 + (180 - badgeW) / 2;
      const badgeY = curY + 12;
      doc.addImage(runeBadgeDataUrl, 'PNG', badgeX, badgeY, badgeW, badgeH);
      textY = badgeY + badgeH + 6;
    }

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.8);
    doc.setTextColor(...white);
    textY = drawTextWithBold(doc, `**Kullanılan Rünik & Göksel Semboller:** ${report.personalTalisman.runesUsed}`, 22, textY, 166, lineH);
    textY = drawTextWithBold(doc, `**Amacı & Ruhsal Etkisi:** ${report.personalTalisman.purpose}`, 22, textY, 166, lineH);
    if (report.personalTalisman.kabbalisticBridge) {
      textY = drawTextWithBold(doc, `**Ezoterik & Kabbalistik Köprü:** ${report.personalTalisman.kabbalisticBridge}`, 22, textY, 166, lineH);
    }
    textY = drawTextWithBold(doc, `**Uygulama & Odaklanma:** ${report.personalTalisman.usageInstructions}`, 22, textY, 166, lineH);
    if (report.personalTalisman.incenseAndHerbs) {
      drawTextWithBold(doc, `**Önerilen Doğal Tütsü/Bitki:** ${report.personalTalisman.incenseAndHerbs}`, 22, textY, 166, lineH);
    }

    curY += talismanCardH + 9;
  }

  // ==========================================
  // FREKANS AYNASI & 4 ÂLEM ENTEGRASYON REHBERİ
  // ==========================================
  ensureSpace(58);
  doc.setFillColor(15, 25, 45); // Derin lacivert
  doc.roundedRect(15, curY, 180, 52, 3, 3, 'F');
  doc.setDrawColor(14, 165, 233); // Cyan kenarlık
  doc.setLineWidth(0.5);
  doc.roundedRect(15, curY, 180, 52, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(14, 165, 233);
  doc.text('⚡ FREKANS AYNASI REHBERİ: HANGİ ÂLEMİNİZİ ÇALIŞTIRIYORSUNUZ?', 22, curY + 8);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(9.8);
  doc.setTextColor(230, 235, 245);
  const faDesc = `Bu raporda varlığınızın 4 temel âlemdeki (Assiah, Yetzirah, Beriyah, Atzilut) 13 gezegen dinamikleri ve aromaterapi reçeteleri eksiksiz sunulmuştur. Hayatın her evresinde aynı katmanı çalıştırmazsınız. Hangi katmandaki bitkisel reçeteyi ne zaman uygulayacağınızı tespit etmek için: 7Layers Frekans Aynası analizimizdeki güncel kozmik sınavınıza ve tutumunuza bakarak o an hangi haritanızı (Beden, Ruh, Zihin veya Kudret) çalıştırdığınızı teşhis edebilir ve doğrudan o âleme ait dengeleyici reçeteleri hayata geçirebilirsiniz.`;
  drawTextWithBold(doc, faDesc, 22, curY + 15.5, 166, 5.0);

  curY += 60;

  // ==========================================
  // 4 ÂLEM 13 GEZEGEN DİNAMİK TEŞHİSLERİ
  // ==========================================
  const worldsData = (report as any).worlds ? [
    {
      key: 'assiah',
      title: 'BÖLÜM 1: 1. ASSİAH ÂLEMİ (FİZİKSEL BEDEN & EYLEM)',
      tech: 'Standart Tropikal Jeosentrik Harita',
      desc: 'Fiziksel bedenin dünyevi alışkanlıkları, somut eylem tarzınız ve dünyevi mücadelelerinizdeki gezegen yerleşimleriniz.',
      report: (report as any).worlds.assiah as CosmicMatrixReport
    },
    {
      key: 'yetzirah',
      title: 'BÖLÜM 2: 2. YETZİRAH ÂLEMİ (DUYGUSAL RUH & HAFIZA)',
      tech: 'Drakonik Ruh Haritası (Kuzey Düğümü 0° Koç)',
      desc: 'Ruhunuzun derin bilinçaltı hafızası, geçmiş yaşam izleri ve kalbinizin gerçekte hangi enerjilerle şifalanmak istediği.',
      report: (report as any).worlds.yetzirah as CosmicMatrixReport
    },
    {
      key: 'beriyah',
      title: 'BÖLÜM 3: 3. BERİYAH ÂLEMİ (ZİHİNSEL BİLGELİK & YÜKSEK DHARMA)',
      tech: '9. Harmonik (Navamsa) Zihin Haritası',
      desc: 'Yüksek akıl, hayat felsefeniz, kadersel yaşam gayeniz (Dharma) ve zihninizin kurguladığı büyük ilahi mimari.',
      report: (report as any).worlds.beriyah as CosmicMatrixReport
    },
    {
      key: 'atzilut',
      title: 'BÖLÜM 4: 4. ATZİLUT ÂLEMİ (RUHSAL BİRLİK & İLAHİ KUDRET)',
      tech: 'Güneş Merkezli (Heliosentrik) Harita',
      desc: 'Dünya egosundan arınmış, Güneş merkezli saf kozmik irade ve evrensel birliğe hizmet eden ilahi potansiyeliniz.',
      report: (report as any).worlds.atzilut as CosmicMatrixReport
    }
  ] : [
    {
      key: 'assiah',
      title: '13 GEZEGEN DİNAMİK TEŞHİSİ & BİTKİSEL FREKANS REÇETELERİ',
      tech: 'Standart Tropikal Harita',
      desc: 'Fiziksel bedenin dünyevi alışkanlıkları ve somut eylem tarzınız.',
      report: report as CosmicMatrixReport
    }
  ];

  worldsData.forEach((wData) => {
    // Her âlem yeni bir sayfada başlar
    doc.addPage();
    currentPage++;
    drawHeaderAndFooter(currentPage);
    curY = 24;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14.5);
    doc.setTextColor(...gold);
    doc.text(wData.title, 15, curY);

    curY += 3;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(15, curY, 195, curY);

    curY += 6;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.2);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, `**Astrolojik Yöntem:** ${wData.tech} | **Kozmik Boyut:** ${wData.desc}`, 15, curY, 180, 5.5);
    curY += 6;

    wData.report.planetaryDynamics.forEach((planet: PlanetaryDynamicDiagnosis) => {
      ensureSpace(68);

      // Gezegen Başlık Çubuğu
      doc.setFillColor(...cardDark);
      doc.roundedRect(15, curY, 180, 11, 2, 2, 'F');
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, curY, 180, 11, 2, 2, 'D');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...gold);
      const directionTag = planet.energyDirection === 'inward' ? '[İçe Dönük / Yin]' : '[Dışa Aktarılan / Yang]';
      doc.text(`${planet.planetName} (${planet.sign}, ${planet.house}. Ev) ${directionTag}`, 20, curY + 7.5);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...muted);
      doc.text(`HD Kapı ${planet.gate}.${planet.line} (${planet.center})`, 190, curY + 7.5, { align: 'right' });

      curY += 15;

      // Teşhis ve Ruhsal Mesaj
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...white);
      curY = drawTextWithBold(doc, `**Arketip & Akış:** ${planet.archetypeTheme}`, 17, curY, 176, 6.2);
      curY = drawTextWithBold(doc, `**Tezahür & Etki:** ${planet.activeManifestation}`, 17, curY, 176, 6.2);
      curY = drawTextWithBold(doc, `**Kabala & Ruhsal Ders:** ${planet.kabbalahSephira} (${planet.kabbalahWorld}) - ${planet.kabbalahLesson}`, 17, curY, 176, 6.2);

      // Dengeleyici Bitkisel Frekans & Buhur
      if (planet.botanical) {
        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(160, 240, 200);
        curY = drawTextWithBold(
          doc,
          `**Bitkisel Denge & Buhur:** ${planet.botanical.tree} | Buhur/Uçucu Yağ: ${planet.botanical.essentialOil} (${planet.botanical.theme})`,
          17,
          curY,
          176,
          6.2
        );
      }

      // Pratik Dengeleme Önerisi
      if (planet.practicalRemedy) {
        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(255, 230, 160);
        curY = drawTextWithBold(doc, `**Pratik Dengeleme Reçetesi:** ${planet.practicalRemedy}`, 17, curY, 176, 6.2);
      }

      curY += 5;
    });
  });

  // Save the PDF
  const safeName = userName.trim()
    ? userName.trim().replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_ -]/g, '').replace(/\s+/g, '_')
    : `Analiz_${birthInfo.localDate}`;
  doc.save(`7Layers_Kozmik_Matris_${safeName}.pdf`);
};
