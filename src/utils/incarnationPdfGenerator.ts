import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  lineHeight: number = 6.2
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
    doc.setFontSize(10);
    doc.setTextColor(...gold);
    doc.text('7LAYERS | KOZMİK & RUHSAL ANALİZ MERKEZİ', 15, 11);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text('Karmik & Enkarnasyon Raporu', 195, 11, { align: 'right' });
  };

  let curY = 0;

  const ensureSpace = (needed: number) => {
    if (curY + needed > 275) {
      doc.addPage();
      drawHeader();
      curY = 28;
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
  doc.setFontSize(12.5);
  doc.setTextColor(...white);
  doc.text('Geçmiş Yaşam, Ruhun Tekâmül Haritası & Gelecek Enkarnasyon Potansiyeli', 105, 38, { align: 'center' });

  // Birth Details Box
  doc.setFillColor(...cardDark);
  doc.roundedRect(15, 45, 180, 24, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, 45, 180, 24, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text('DOĞUM BİLGİLERİ:', 22, 54);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  doc.text(`Tarih: ${birthInfo.localDate}   |   Saat: ${birthInfo.localTime}   |   Konum: ${birthInfo.cityName}, ${birthInfo.country}`, 22, 62);

  // Soul Maturity Summary Banner
  doc.setFillColor(28, 36, 58);
  doc.roundedRect(15, 75, 180, 38, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, 75, 180, 38, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...gold);
  doc.text(`RUHSAL OLGUNLUK SEVİYESİ: ${data.soulMaturity.tier.toUpperCase()} (${data.soulMaturity.score}/100)`, 22, 85);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  const mLines = doc.splitTextToSize(data.soulMaturity.description, 166);
  doc.text(mLines, 22, 93);

  // SECTION 1: ÖNCEKİ ENKARNASYON & GAD
  curY = 124;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...gold);
  doc.text('1. Önceki Yaşam & Kök Karmik Hafıza (Güney Ay Düğümü)', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(15, curY, 195, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...white);
  doc.text(`Güney Ay Düğümü (GAD): ${data.gad.sign} Burcu (${data.gad.degreeInSign}°), ${data.gad.house}. Ev`, 15, curY);

  curY += 7;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...gold);
  doc.text(`Geçmiş Yaşam Arketipi: ${data.gad.info.archetype}`, 15, curY);

  curY += 8;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, `**Önceki Yaşam Rolü:** ${data.gad.info.pastLifeRole}`, 15, curY, 180, 6.2);

  curY += 3;
  curY = drawTextWithBold(doc, `**Konfor Alanı & Karmik Tuzak:** ${data.gad.info.comfortZoneTrap}`, 15, curY, 180, 6.2);

  curY += 3;
  curY = drawTextWithBold(doc, `**Geçmişten Taşınan Ruhsal Yetenek:** ${data.gad.info.karmicGift}`, 15, curY, 180, 6.2);

  curY += 3;
  curY = drawTextWithBold(doc, `**Karmik Cetvel (GAD Yöneticisi):** ${data.gad.karmicRuler.name} (${data.gad.karmicRuler.sign}, ${data.gad.karmicRuler.house}. Ev) - ${data.gad.karmicRuler.summary}`, 15, curY, 180, 6.2);

  // ================= PAGE 2 =================
  doc.addPage();
  drawHeader();

  // SECTION 2: 12. EV & SON NEFES
  curY = 28;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...gold);
  doc.text('2. 12. Ev Karmik Hafızası & Son Nefes Şartları', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(15, curY, 195, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...white);
  doc.text(`12. Ev Burcu: ${data.twelfthHouse.sign} (Yönetici Gezegen: ${data.twelfthHouse.ruler})`, 15, curY);

  curY += 8;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, `**Son Nefes ve Kapanış Hissi:** ${data.twelfthHouse.lastBreathAtmosphere}`, 15, curY, 180, 6.2);

  curY += 3;
  curY = drawTextWithBold(doc, `**Bilinçaltı Koruma Armağanı:** ${data.twelfthHouse.subconsciousGift}`, 15, curY, 180, 6.2);

  curY += 3;
  curY = drawTextWithBold(doc, `**Gizli Karmik Korku:** ${data.twelfthHouse.hiddenFear}`, 15, curY, 180, 6.2);

  if (data.twelfthHouse.planetsIn12th.length > 0) {
    curY += 3;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...gold);
    doc.text('12. Evdeki Yerleşimler:', 15, curY);
    curY += 6;

    data.twelfthHouse.planetsIn12th.forEach(p => {
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...white);
      curY = drawTextWithBold(doc, `• **${p.name} (${p.sign}):** ${p.meaning}`, 18, curY, 177, 6.2);
      curY += 2;
    });
  }

  // SECTION 3: KARMİK BORÇLAR (RETROLAR) & KİRON
  curY += 6;
  ensureSpace(40);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...gold);
  doc.text('3. Karmik Borçlar (Retro Gezegenler) & Kiron Şifa Kapısı', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(15, curY, 195, curY);

  curY += 9;
  if (data.retroDebts.length === 0) {
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...white);
    doc.text('Haritanızda doğrudan retrogezegen karmik borcu bulunmamaktadır. Ruhunuz temiz bir karmik sayfa ile bu yaşama başlamıştır.', 15, curY);
    curY += 12;
  } else {
    data.retroDebts.forEach(debt => {
      ensureSpace(34);

      doc.setFillColor(...cardDark);
      doc.roundedRect(15, curY - 2, 180, 28, 2.5, 2.5, 'F');
      doc.setDrawColor(220, 80, 80);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, curY - 2, 180, 28, 2.5, 2.5, 'D');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...gold);
      doc.text(`${debt.planet} Rx: ${debt.title}`, 20, curY + 5);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...white);
      doc.text(`Geçmiş Yaşam Nedeni: ${debt.pastLifeCause}`, 20, curY + 11);
      doc.text(`Bu Yaşamdaki Borç: ${debt.currentLifeKarma}`, 20, curY + 17);
      doc.setTextColor(110, 230, 160);
      doc.text(`Dharma Reçetesi: ${debt.dharmaRemedy}`, 20, curY + 23);

      curY += 32;
    });
  }

  // Chiron
  if (data.chiron) {
    ensureSpace(45);
    curY += 4;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...gold);
    doc.text(`Kiron (Karmik Ruh Yarası & Başkalarına Şifa): ${data.chiron.sign} Burcu, ${data.chiron.house}. Ev`, 15, curY);

    curY += 8;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, `**Ruh Yarası:** ${data.chiron.wound.woundDescription}`, 15, curY, 180, 6.2);

    curY += 3;
    curY = drawTextWithBold(doc, `**Şifa Armağanı:** ${data.chiron.wound.healingGift}`, 15, curY, 180, 6.2);

    curY += 3;
    curY = drawTextWithBold(doc, `**Dönüşüm Anahtarı:** ${data.chiron.wound.soulRemedy}`, 15, curY, 180, 6.2);
  }

  // ================= PAGE 3 =================
  doc.addPage();
  drawHeader();

  // SECTION 4: DRAKONİK RUH HARİTASI
  curY = 28;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...gold);
  doc.text('4. Drakonik Harita: Ruhun Asıl Özü & Ebedi Kimliği', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(15, curY, 195, curY);

  curY += 8;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  const dracDesc = 'Drakonik harita, Kuzey Ay Düğümü 0° Koç noktasına hizalanarak hesaplanan yüksek ruhsal boyut haritanızdır. Tropikal burcunuz dünyadaki maskeniz ve egonuz iken, Drakonik burcunuz ruhunuzun enkarnasyonlar ötesi öz titreşimidir.';
  curY = drawTextWithBold(doc, dracDesc, 15, curY, 180, 6.2);

  curY += 4;
  const tableData = data.draconicComparison.map(c => [
    c.pointName,
    `${c.tropicalSign}\n(${c.tropicalDegree}°)`,
    `${c.draconicSign}\n(${c.draconicDegree}°)`,
    c.spiritualMeaning
  ]);

  autoTable(doc, {
    startY: curY,
    head: [['Kozmik Nokta', 'Dünyevi (Tropikal)', 'Ruhsal (Drakonik)', 'Ezoterik Ruh Yorumu']],
    body: tableData,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    styles: {
      font: 'LiberationSans',
      fontSize: 9.5,
      cellPadding: 4,
      textColor: [255, 255, 255],
      lineColor: [70, 80, 110]
    },
    headStyles: {
      fillColor: [38, 46, 72],
      textColor: [212, 175, 55],
      fontStyle: 'bold',
      fontSize: 10.5
    },
    alternateRowStyles: {
      fillColor: [20, 24, 38]
    },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 32 },
      2: { cellWidth: 32 },
      3: { cellWidth: 78 }
    }
  });

  // ================= PAGE 4 =================
  doc.addPage();
  drawHeader();

  // SECTION 5: DHARMA & GELECEK YAŞAM TOHUMU
  curY = 28;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...gold);
  doc.text('5. Dharma & Gelecek Yaşam Tohumu (Kuzey Ay Düğümü)', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(15, curY, 195, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...white);
  doc.text(`Kuzey Ay Düğümü (KAD): ${data.kad.sign} Burcu (${data.kad.degreeInSign}°), ${data.kad.house}. Ev`, 15, curY);

  curY += 8;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, `**Bu Yaşamdaki Nihai Tekâmül Hedefi:** ${data.kad.seed.evolutionGoal}`, 15, curY, 180, 6.2);

  curY += 4;
  curY = drawTextWithBold(doc, `**Gelecek Enkarnasyon Potansiyeli:** ${data.kad.seed.nextIncarnationPotential}`, 15, curY, 180, 6.2);

  curY += 4;
  curY = drawTextWithBold(doc, `**Kutsal Ruhsal Pratik:** ${data.kad.seed.sacredPractice}`, 15, curY, 180, 6.2);

  curY += 10;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...gold);
  doc.text('8. Ev: Boyut Geçişi & Ruhun Dönüşüm Kapısı', 15, curY);

  curY += 7;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, data.eighthHouse.transformationGateway, 15, curY, 180, 6.2);

  // Bottom Notice
  curY += 16;
  doc.setFillColor(25, 32, 50);
  doc.roundedRect(15, curY, 180, 26, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, curY, 180, 26, 3, 3, 'D');

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  const disclaimer = 'Bu rapor, kadim Batı Karmik Astrolojisi ve Drakonik Ruh Haritası hesaplama ilkelerine dayanır. Bilinçaltınızın kök kalıplarını aydınlatmak ve tekâmül yolculuğunuzda size rehberlik etmek için hazırlanmıştır. Gelecek, özgür iradenizle şekillenen ilahi bir danstır.';
  doc.text(doc.splitTextToSize(disclaimer, 172), 20, curY + 9);

  // Add Page Numbers on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(`Sayfa ${i} / ${totalPages}`, 105, 291, { align: 'center' });
  }

  // Save File
  const filename = `7Layers_Karmik_Enkarnasyon_Raporu_${birthInfo.cityName}.pdf`;
  doc.save(filename);
};
