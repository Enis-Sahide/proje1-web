import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getFullPlanetInterpretation, getAspectInterpretation, getHouseCuspInterpretation } from '@/features/astrology/engine/AstrologyInterpretations';

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const tr = (str: string | number | null | undefined): string => {
  if (str === null || str === undefined) return '';
  return String(str);
};

const drawTextWithBold = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 6
): number => {
  let curX = x;
  let curY = y;
  const sanitizedText = text.replace(/^\s*>\s*/gm, '');
  const parts = sanitizedText.split(/(\s+|\*\*)/);
  let isBold = false;
  
  for (const part of parts) {
    if (part === '**') {
      isBold = !isBold;
      doc.setFont('LiberationSans', isBold ? 'bold' : 'normal');
      continue;
    }
    if (part === '\n') {
      curX = x;
      curY += lineHeight;
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

export const downloadChartPDF = async (chartData: any, locationStr: string, dateStr: string) => {
  const doc = new jsPDF();

  // Load custom fonts for Turkish character support
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
    console.error("Failed to load custom fonts, falling back to standard font:", error);
  }

  const primaryDark: [number, number, number] = [20, 25, 40]; // #141928
  const gold: [number, number, number] = [212, 175, 55]; // #D4AF37
  const textLight = '#f8fafc';
  const textMuted = '#94a3b8';

  // Draw Cover Page / Header
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 297, 'F');

  // Decorative Header Gold Line
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(1);
  doc.line(20, 35, 190, 35);

  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(28);
  doc.text("7LAYERS", 20, 30);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("EZOTERİK DOĞUM HARİTASI RAPORU", 20, 50);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(textMuted);
  doc.text(`Konum: ${locationStr}   |   Tarih & Saat: ${dateStr}`, 20, 60);

  let currentY = 75;

  const checkSpace = (required: number) => {
    if (currentY + required > 275) {
      doc.addPage();
      doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
      doc.rect(0, 0, 210, 297, 'F');
      currentY = 25;
    }
  };

  // 1. Gezegen Yerleşimleri Tablosu
  checkSpace(110);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text("1. GEZEGEN KONUMLARI", 20, currentY);
  currentY += 8;

  const planetsBody = [...chartData.planets, chartData.ascendant, chartData.midheaven].map((p: any) => [
    tr(p.name),
    tr(p.sign),
    tr(`${p.degreeInSign}° ${String(p.minutes).padStart(2, '0')}' ${p.isRetrograde ? 'Rx' : ''}`),
    tr(`${p.house}. Ev`)
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    head: [['Gezegen', 'Burç', 'Derece', 'Ev']],
    body: planetsBody,
    theme: 'grid',
    headStyles: { fillColor: gold, textColor: primaryDark, fontStyle: 'bold', font: 'LiberationSans' },
    bodyStyles: { fillColor: [24, 30, 48], textColor: [255, 255, 255], font: 'LiberationSans' },
    alternateRowStyles: { fillColor: [18, 23, 38] },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 2. Gezegen Yorumları
  checkSpace(30);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text("2. GEZEGEN VE EV YERLEŞİM ANALİZLERİ", 20, currentY);
  currentY += 10;

  for (const p of [...chartData.planets, chartData.ascendant, chartData.midheaven]) {
    const interp = getFullPlanetInterpretation(p.name, p.sign, p.house);
    
    checkSpace(45);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text(tr(interp.title), 20, currentY);
    currentY += 7;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(230, 230, 230);
    
    currentY = drawTextWithBold(doc, interp.content, 20, currentY, 170, 5.5);
    currentY += 10;
  }

  // 3. Ev Girişleri Yorumları
  checkSpace(30);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text("3. EV GİRİŞLERİ VE YAŞAM ALANLARI", 20, currentY);
  currentY += 10;

  for (const h of chartData.houses) {
    const interp = getHouseCuspInterpretation(h.house, h.sign);
    
    checkSpace(40);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text(tr(interp.title), 20, currentY);
    currentY += 7;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(230, 230, 230);
    
    currentY = drawTextWithBold(doc, interp.content, 20, currentY, 170, 5.5);
    currentY += 10;
  }

  // 4. Karmik Dinamikler (Açılar)
  const aspectsList = chartData.aspects
    .filter((a: any) => a.orb <= 7)
    .sort((a: any, b: any) => a.orb - b.orb);

  if (aspectsList.length > 0) {
    checkSpace(30);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text("4. KARMİK DİNAMİKLER VE AÇILAR", 20, currentY);
    currentY += 10;

    for (const a of aspectsList) {
      const interp = getAspectInterpretation(a.planet1, a.planet2, a.type);
      
      checkSpace(40);
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.text(tr(interp.title), 20, currentY);
      currentY += 7;

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(230, 230, 230);
      
      currentY = drawTextWithBold(doc, interp.content, 20, currentY, 170, 5.5);
      currentY += 10;
    }
  }

  // Save the PDF
  doc.save(`Ezoterik_Dogum_Haritasi_${locationStr.replace(/\s+/g, '_')}.pdf`);
};
