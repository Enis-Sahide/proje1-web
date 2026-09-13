import jsPDF from 'jspdf';
import { IncarnationAnalysisResult } from '@/features/astrology/engine/IncarnationEngine';

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
  lineHeight: number = 7.5
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

export const downloadIncarnationPDF = async (
  data: IncarnationAnalysisResult,
  birthInfo: {
    localDate: string;
    localTime: string;
    cityName: string;
    country: string;
  }
) => {
  const doc = new jsPDF();

  const primaryDark: [number, number, number] = [15, 18, 28]; // #0F121C
  const cardDark: [number, number, number] = [24, 29, 45]; // #181D2D
  const gold: [number, number, number] = [212, 175, 55]; // #D4AF37
  const white: [number, number, number] = [255, 255, 255];
  const muted: [number, number, number] = [170, 180, 200];

  // Paint dark background on new pages
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function(this: any, ...args: any[]) {
    const result = originalAddPage(...args);
    doc.setFillColor(...primaryDark);
    doc.rect(0, 0, 210, 297, 'F');
    return result;
  };

  // Initial background
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
    console.error("Failed to load custom fonts:", error);
  }

  // Draw Header
  const drawHeader = () => {
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.line(15, 15, 195, 15);
    doc.line(15, 285, 195, 285);

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...gold);
    doc.text('7LAYERS | KOZMİK & RUHSAL ANALİZ MERKEZİ', 15, 11);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...muted);
    doc.text('Karmik & Enkarnasyon Raporu', 195, 11, { align: 'right' });
  };

  let curY = 0;

  const ensureSpace = (needed: number) => {
    if (curY + needed > 268) {
      doc.addPage();
      drawHeader();
      curY = 30;
    }
  };

  // ================= PAGE 1 =================
  drawHeader();

  // Big Title
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...gold);
  doc.text('KARMİK & ENKARNASYON ANALİZİ', 105, 30, { align: 'center' });

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(...white);
  doc.text('Geçmiş Yaşam & Ruhun Tekâmül Haritası', 105, 39, { align: 'center' });

  // Birth Details Box
  doc.setFillColor(...cardDark);
  doc.roundedRect(15, 47, 180, 26, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 47, 180, 26, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(...gold);
  doc.text('DOĞUM BİLGİLERİ:', 22, 57);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(...white);
  doc.text(`Tarih: ${birthInfo.localDate}   |   Saat: ${birthInfo.localTime}   |   Konum: ${birthInfo.cityName}, ${birthInfo.country}`, 22, 66);

  // Soul Maturity Summary Banner (Dynamic Height)
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(11.5);
  const mLines = doc.splitTextToSize(data.soulMaturity.description, 166);
  const bannerHeight = 18 + (mLines.length * 6) + 4;

  doc.setFillColor(28, 36, 60);
  doc.roundedRect(15, 80, 180, bannerHeight, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, 80, 180, bannerHeight, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(...gold);
  doc.text(`RUHSAL OLGUNLUK SEVİYESİ: ${data.soulMaturity.tier.toUpperCase()} (${data.soulMaturity.score}/100)`, 22, 90);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(...white);
  doc.text(mLines, 22, 98);

  // SECTION 1: ÖNCEKİ ENKARNASYON & GAD
  curY = 80 + bannerHeight + 14;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...gold);
  doc.text('1. Önceki Yaşam & Kök Karmik Hafıza (GAD)', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 10;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(...white);
  doc.text(`Güney Ay Düğümü: ${data.gad.sign} Burcu (${data.gad.degreeInSign}°), ${data.gad.house}. Ev`, 15, curY);

  curY += 8;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...gold);
  doc.text(`Geçmiş Yaşam Arketipi: ${data.gad.info.archetype}`, 15, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13.5);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, `**Önceki Yaşam Rolü:** ${data.gad.info.pastLifeRole}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Konfor Alanı & Karmik Tuzak:** ${data.gad.info.comfortZoneTrap}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Geçmişten Taşınan Ruhsal Yetenek:** ${data.gad.info.karmicGift}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Karmik Cetvel (GAD Yöneticisi):** ${data.gad.karmicRuler.name} (${data.gad.karmicRuler.sign}, ${data.gad.karmicRuler.house}. Ev) - ${data.gad.karmicRuler.summary}`, 15, curY, 180, 7.5);

  // ================= PAGE 2 =================
  doc.addPage();
  drawHeader();

  // SECTION 2: 12. EV & SON NEFES
  curY = 30;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...gold);
  doc.text('2. 12. Ev Karmik Hafızası & Son Nefes Şartları', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 10;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(...white);
  doc.text(`12. Ev Burcu: ${data.twelfthHouse.sign} (Yönetici Gezegen: ${data.twelfthHouse.ruler})`, 15, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13.5);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, `**Son Nefes ve Kapanış Hissi:** ${data.twelfthHouse.lastBreathAtmosphere}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Bilinçaltı Koruma Armağanı:** ${data.twelfthHouse.subconsciousGift}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Gizli Karmik Korku:** ${data.twelfthHouse.hiddenFear}`, 15, curY, 180, 7.5);

  if (data.twelfthHouse.planetsIn12th.length > 0) {
    curY += 4;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...gold);
    doc.text('12. Evdeki Yerleşimler:', 15, curY);
    curY += 8;

    data.twelfthHouse.planetsIn12th.forEach(p => {
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(...white);
      curY = drawTextWithBold(doc, `• **${p.name} (${p.sign}):** ${p.meaning}`, 18, curY, 177, 7.2);
      curY += 3;
    });
  }

  // ================= PAGE 3: KARMIC DEBTS =================
  doc.addPage();
  drawHeader();

  curY = 30;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...gold);
  doc.text('3. Karmik Borçlar (Retro Gezegenler) & Kiron', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 10;
  if (data.retroDebts.length === 0) {
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(13.5);
    doc.setTextColor(...white);
    doc.text('Haritanızda doğrudan retrogezegen karmik borcu bulunmamaktadır. Ruhunuz geçmiş borçlarını büyük ölçüde arındırmış ve bu yaşama temiz bir karmik sayfa ile başlamıştır.', 15, curY);
    curY += 20;
  } else {
    data.retroDebts.forEach(debt => {
      // Split each text line to fit within card width (168mm)
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(11.5);
      const pastLifeLines = doc.splitTextToSize(`Geçmiş Yaşam Nedeni: ${debt.pastLifeCause}`, 168);
      const currentKarmaLines = doc.splitTextToSize(`Bu Yaşamdaki Borç: ${debt.currentLifeKarma}`, 168);
      doc.setFont('LiberationSans', 'bold');
      const dharmaLines = doc.splitTextToSize(`Dharma Reçetesi: ${debt.dharmaRemedy}`, 168);

      const lineHeight = 5.6;
      const totalTextLinesCount = pastLifeLines.length + currentKarmaLines.length + dharmaLines.length;
      // title(8mm) + lines + padding
      const cardHeight = 16 + (totalTextLinesCount * lineHeight) + 6;

      ensureSpace(cardHeight + 6);

      // Card Background & Border
      doc.setFillColor(...cardDark);
      doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'F');
      doc.setDrawColor(230, 90, 90);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'D');

      let textY = curY + 8;
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(13.5);
      doc.setTextColor(...gold);
      doc.text(`${debt.planet} Rx: ${debt.title}`, 20, textY);
      textY += 7;

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(11.5);
      doc.setTextColor(...white);
      doc.text(pastLifeLines, 20, textY);
      textY += pastLifeLines.length * lineHeight + 2;

      doc.text(currentKarmaLines, 20, textY);
      textY += currentKarmaLines.length * lineHeight + 2;

      doc.setFont('LiberationSans', 'bold');
      doc.setTextColor(110, 230, 160);
      doc.text(dharmaLines, 20, textY);

      curY += cardHeight + 6;
    });
  }

  // Chiron
  if (data.chiron) {
    ensureSpace(50);
    curY += 4;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...gold);
    doc.text(`Kiron (Karmik Ruh Yarası): ${data.chiron.sign} Burcu, ${data.chiron.house}. Ev`, 15, curY);

    curY += 9;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(13.5);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, `**Ruh Yarası:** ${data.chiron.wound.woundDescription}`, 15, curY, 180, 7.5);

    curY += 4;
    curY = drawTextWithBold(doc, `**Şifa Armağanı:** ${data.chiron.wound.healingGift}`, 15, curY, 180, 7.5);

    curY += 4;
    curY = drawTextWithBold(doc, `**Dönüşüm Anahtarı:** ${data.chiron.wound.soulRemedy}`, 15, curY, 180, 7.5);
  }

  // ================= PAGE 4: DRACONIC CARDS =================
  doc.addPage();
  drawHeader();

  curY = 30;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...gold);
  doc.text('4. Drakonik Harita: Ruhun Asıl Özü', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(...white);
  const dracDesc = 'Drakonik harita, Kuzey Ay Düğümü 0° Koç noktasına hizalanarak hesaplanan yüksek ruhsal boyut haritanızdır. Tropikal burcunuz dünyadaki maskeniz ve egonuz iken, Drakonik burcunuz ruhunuzun enkarnasyonlar ötesi öz titreşimidir.';
  curY = drawTextWithBold(doc, dracDesc, 15, curY, 180, 7.5);

  curY += 6;

  // Render Draconic comparisons with dynamic card height & word wrap
  data.draconicComparison.forEach(comp => {
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.5);
    const tropLines = doc.splitTextToSize(`• Dünyevi Maske (${comp.tropicalSign}): ${comp.tropicalMeaning || comp.spiritualMeaning}`, 168);
    const dracLines = doc.splitTextToSize(`• Ruhsal Öz (${comp.draconicSign}): ${comp.draconicMeaning || comp.spiritualMeaning}`, 168);
    const synthLines = doc.splitTextToSize(`• Kozmik Sentez: ${comp.synthesis || comp.spiritualMeaning}`, 168);

    const lineHeight = 5.2;
    const totalLines = tropLines.length + dracLines.length + synthLines.length;
    const cardHeight = 22 + (totalLines * lineHeight) + 6;

    ensureSpace(cardHeight + 6);

    doc.setFillColor(...cardDark);
    doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'D');

    // Card Header
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...gold);
    doc.text(comp.pointName, 20, curY + 7.5);

    // Tropical vs Draconic badges
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...white);
    doc.text(`Dünyevi (Tropikal): ${comp.tropicalSign} (${comp.tropicalDegree}°)`, 20, curY + 14.5);

    doc.setFont('LiberationSans', 'bold');
    doc.setTextColor(255, 215, 0);
    doc.text(`Ruhsal (Drakonik): ${comp.draconicSign} (${comp.draconicDegree}°)`, 105, curY + 14.5);

    let textY = curY + 21;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(215, 215, 225);
    doc.text(tropLines, 20, textY);
    textY += tropLines.length * lineHeight + 2;

    doc.setTextColor(190, 215, 255);
    doc.text(dracLines, 20, textY);
    textY += dracLines.length * lineHeight + 2;

    doc.setFont('LiberationSans', 'bold');
    doc.setTextColor(...gold);
    doc.text(synthLines, 20, textY);

    curY += cardHeight + 6;
  });

  // ================= PAGE 5: DHARMA & NEXT LIFE =================
  doc.addPage();
  drawHeader();

  curY = 30;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...gold);
  doc.text('5. Dharma & Gelecek Yaşam Tohumu (KAD)', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 10;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(...white);
  doc.text(`Kuzey Ay Düğümü: ${data.kad.sign} Burcu (${data.kad.degreeInSign}°), ${data.kad.house}. Ev`, 15, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13.5);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, `**Bu Yaşamdaki Nihai Tekâmül Hedefi:** ${data.kad.seed.evolutionGoal}`, 15, curY, 180, 7.5);

  curY += 5;
  curY = drawTextWithBold(doc, `**Gelecek Enkarnasyon Potansiyeli:** ${data.kad.seed.nextIncarnationPotential}`, 15, curY, 180, 7.5);

  curY += 5;
  curY = drawTextWithBold(doc, `**Kutsal Ruhsal Pratik:** ${data.kad.seed.sacredPractice}`, 15, curY, 180, 7.5);

  curY += 10;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...gold);
  doc.text('8. Ev: Boyut Geçişi & Ruhun Dönüşüm Kapısı', 15, curY);

  curY += 8;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13.5);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, data.eighthHouse.transformationGateway, 15, curY, 180, 7.5);

  // Bottom Notice
  curY += 12;
  ensureSpace(34);
  doc.setFillColor(25, 32, 50);
  doc.roundedRect(15, curY, 180, 30, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, curY, 180, 30, 3, 3, 'D');

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...muted);
  const disclaimer = 'Bu rapor, kadim Batı Karmik Astrolojisi ve Drakonik Ruh Haritası hesaplama ilkelerine dayanır. Bilinçaltınızın kök kalıplarını aydınlatmak ve tekâmül yolculuğunuzda size rehberlik etmek için hazırlanmıştır. Gelecek, özgür iradenizle şekillenen ilahi bir danstır.';
  doc.text(doc.splitTextToSize(disclaimer, 172), 20, curY + 9);

  // Add Page Numbers on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text(`Sayfa ${i} / ${totalPages}`, 105, 291, { align: 'center' });
  }

  // Save File
  const filename = `7Layers_Karmik_Enkarnasyon_Raporu_${birthInfo.cityName}.pdf`;
  doc.save(filename);
};
