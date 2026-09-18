import jsPDF from 'jspdf';
import type { CosmicMatrixReport, PlanetaryDynamicDiagnosis } from '@/features/astrology/engine/CosmicMatrixEngine';
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

// Word-wrap text renderer that supports inline markdown bold formatting (**text**)
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
    .replace(/^\s*>\s*/gm, '');

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

    const wordWidth = doc.getTextWidth(part);
    if (curX + wordWidth > x + maxWidth && part.trim() !== '') {
      curX = x;
      curY += lineHeight;
    }

    doc.text(part, curX, curY);
    curX += wordWidth;
  }

  doc.setFont('LiberationSans', 'normal');
  return curY + lineHeight;
};

export const downloadCosmicMatrixPDF = async (
  report: CosmicMatrixReport,
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
  doc.text('4 Katmanlı Kozmik Çözümleme & 13 Gezegen Dinamik Teşhisi', 105, curY, { align: 'center' });

  // Künye Kartı
  curY += 10;
  doc.setFillColor(...cardDark);
  doc.roundedRect(15, curY, 180, 28, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, curY, 180, 28, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text('DANIŞAN / HARİTA SAHİBİ KÜNYESİ', 22, curY + 8);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...white);
  const displayName = userName.trim() ? userName.trim() : 'Bilinmeyen İsim';
  doc.text(`İsim: ${displayName}`, 22, curY + 16);
  doc.text(`Tarih: ${birthInfo.localDate}   |   Saat: ${birthInfo.localTime}`, 22, curY + 23);
  doc.text(`Konum: ${birthInfo.cityName}${birthInfo.country ? ', ' + birthInfo.country : ''}`, 115, curY + 16);

  curY += 36;

  // Druid Kök Ağacı Kartı
  if (druidTree) {
    doc.setFillColor(15, 30, 25);
    doc.roundedRect(15, curY, 180, 48, 3, 3, 'F');
    doc.setDrawColor(...emerald);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, curY, 180, 48, 3, 3, 'D');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...emerald);
    doc.text(`RUHSAL KÖK AĞACINIZ: ${druidTree.name.toUpperCase()} (${druidTree.botanicalName})`, 22, curY + 9);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...white);
    doc.text(`Kelt Ogham Sembolü: ${druidTree.oghamSymbol} (${druidTree.oghamName})   |   Element: ${druidTree.element}   |   Yönetici: ${druidTree.rulingPlanets}`, 22, curY + 17);

    const druidDesc = `Doğum gününüz gereği ruhsal rezonansınız ve doğadaki temel kökünüz ${druidTree.name} ile temas halindedir. Bu raporda incelenen 13 gezegenin bitkisel frekansları sizin ağaç kimliğiniz olmayıp; göksel enerjileri içe ve dışa aktarırken dengeleyen kadim aromaterapi frekanslarıdır.`;
    const dLines = doc.splitTextToSize(druidDesc, 166);
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(dLines, 22, curY + 25);

    curY += 56;
  }

  // 4 Âlem / Element Dengesi Özeti
  if (report.fourWorldsBalance) {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...gold);
    doc.text('4 Âlem & Element Dağılım Dengesi', 15, curY);

    curY += 3;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(15, curY, 195, curY);

    curY += 6;
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
      doc.roundedRect(elX, curY, colW, 24, 2, 2, 'F');
      doc.setDrawColor(60, 70, 95);
      doc.setLineWidth(0.3);
      doc.roundedRect(elX, curY, colW, 24, 2, 2, 'D');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...gold);
      doc.text(el.percent, elX + (colW / 2), curY + 9, { align: 'center' });

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...white);
      doc.text(el.count, elX + (colW / 2), curY + 16, { align: 'center' });

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...muted);
      const shortName = el.name.split(' (')[0];
      doc.text(shortName, elX + (colW / 2), curY + 21, { align: 'center' });
    });

    curY += 32;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, `**Baskın Âlem / Enerji:** ${fw.dominantWorld} | **Tekâmül ve Gelişim Âlemi:** ${fw.growthWorld}`, 15, curY, 180, 5.5);
    curY += 4;
  }

  // Yaşam Misyonu
  if (report.coreLifeMission) {
    ensureSpace(35);
    doc.setFillColor(...cardDark);
    doc.roundedRect(15, curY, 180, 28, 3, 3, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, curY, 180, 28, 3, 3, 'D');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...gold);
    doc.text(`ÇEKİRDEK YAŞAM MİSYONU: ${report.coreLifeMission.title.toUpperCase()}`, 22, curY + 8);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...white);
    const mDesc = report.coreLifeMission.description;
    const mLines = doc.splitTextToSize(mDesc, 166);
    doc.text(mLines, 22, curY + 16);

    curY += 34;
  }

  // ==========================================
  // GEZEGEN DİNAMİKLERİ VE REÇETELERİ (SAYFA 2+)
  // ==========================================
  doc.addPage();
  currentPage++;
  drawHeaderAndFooter(currentPage);
  curY = 24;

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...gold);
  doc.text('13 Gezegen Dinamik Teşhisi & Bitkisel Frekans Reçeteleri', 15, curY);

  curY += 3;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(15, curY, 195, curY);
  curY += 7;

  report.planetaryDynamics.forEach((planet: PlanetaryDynamicDiagnosis) => {
    ensureSpace(58);

    // Gezegen Başlık Çubuğu
    doc.setFillColor(...cardDark);
    doc.roundedRect(15, curY, 180, 10, 2, 2, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, curY, 180, 10, 2, 2, 'D');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...gold);
    const directionTag = planet.energyDirection === 'inward' ? '[İçe Dönük / Yin]' : '[Dışa Aktarılan / Yang]';
    doc.text(`${planet.planetName} (${planet.sign}, ${planet.house}. Ev) ${directionTag}`, 20, curY + 6.8);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`HD Kapı ${planet.gate}.${planet.line} (${planet.center})`, 190, curY + 6.8, { align: 'right' });

    curY += 13;

    // Teşhis ve Ruhsal Mesaj
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, `**Arketip & Akış:** ${planet.archetypeTheme}`, 17, curY, 176, 5);
    curY = drawTextWithBold(doc, `**Tezahür & Etki:** ${planet.activeManifestation}`, 17, curY, 176, 5);
    curY = drawTextWithBold(doc, `**Kabala & Ruhsal Ders:** ${planet.kabbalahSephira} (${planet.kabbalahWorld}) - ${planet.kabbalahLesson}`, 17, curY, 176, 5);

    // Dengeleyici Bitkisel Frekans & Buhur
    if (planet.botanical) {
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(160, 240, 200);
      curY = drawTextWithBold(
        doc,
        `**Bitkisel Denge & Buhur:** ${planet.botanical.tree} | Buhur/Uçucu Yağ: ${planet.botanical.essentialOil} (${planet.botanical.theme})`,
        17,
        curY,
        176,
        5
      );
    }

    // Pratik Dengeleme Önerisi
    if (planet.practicalRemedy) {
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 230, 160);
      curY = drawTextWithBold(doc, `**Pratik Dengeleme Reçetesi:** ${planet.practicalRemedy}`, 17, curY, 176, 5);
    }

    curY += 4;
  });

  // ==========================================
  // KİŞİSEL TILSIM & MÜHÜR FORMÜLÜ (SON SAYFA)
  // ==========================================
  if (report.personalTalisman) {
    ensureSpace(65);

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...gold);
    doc.text('Kişisel Kozmik Denge Mührü & Tılsım Formülü', 15, curY);

    curY += 3;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(15, curY, 195, curY);
    curY += 7;

    doc.setFillColor(...cardDark);
    doc.roundedRect(15, curY, 180, 50, 3, 3, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, curY, 180, 50, 3, 3, 'D');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...gold);
    doc.text(report.personalTalisman.title, 22, curY + 8);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...white);
    curY += 15;
    curY = drawTextWithBold(doc, `**Kullanılan Rünik & Göksel Semboller:** ${report.personalTalisman.runesUsed}`, 22, curY, 166, 5);
    curY = drawTextWithBold(doc, `**Amacı & Ruhsal Etkisi:** ${report.personalTalisman.purpose}`, 22, curY, 166, 5);
    curY = drawTextWithBold(doc, `**Uygulama & Odaklanma:** ${report.personalTalisman.usageInstructions}`, 22, curY, 166, 5);
    if (report.personalTalisman.incenseAndHerbs) {
      curY = drawTextWithBold(doc, `**Önerilen Doğal Tütsü/Bitki:** ${report.personalTalisman.incenseAndHerbs}`, 22, curY, 166, 5);
    }
  }

  // Save the PDF
  const safeName = (userName || 'Kozmik_Matris')
    .trim()
    .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_ -]/g, '')
    .replace(/\s+/g, '_');
  doc.save(`7Layers_Kozmik_Matris_${safeName}.pdf`);
};
