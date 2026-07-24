import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to convert ArrayBuffer to Base64 (needed for jsPDF addFileToVFS)
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Safe string translator/wrapper
const tr = (str: string | number | null | undefined): string => {
  if (str === null || str === undefined) return '';
  return String(str);
};

// Cleans cell text by stripping markdown images, HTML images, and headers
const cleanCellText = (text: string | null | undefined): string => {
  if (!text) return '';
  let clean = String(text);
  // Remove markdown images
  clean = clean.replace(/!\[.*?\]\(.*?\)/g, '');
  // Remove html images
  clean = clean.replace(/<img.*?src=".*?".*?>/g, '');
  // Translate GitHub alerts
  clean = clean.replace(/>\s*\[!WARNING\]/gi, 'DİKKAT:');
  clean = clean.replace(/>\s*\[!TIP\]/gi, 'İPUCU:');
  clean = clean.replace(/>\s*\[!NOTE\]/gi, 'NOT:');
  clean = clean.replace(/>\s*\[!IMPORTANT\]/gi, 'ÖNEMLİ:');
  // Remove markdown blockquote characters
  clean = clean.replace(/^\s*>\s*/gm, '');
  // Remove bold markdown asterisks
  clean = clean.replace(/\*\*/g, '');
  return clean.trim();
};

// Word-wrap text renderer that supports inline markdown bold formatting (**text**)
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
  
  // Clean up any remaining blockquote chars or image links for safety
  const sanitizedText = text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/<img.*?src=".*?".*?>/g, '')
    .replace(/^\s*>\s*/gm, '');
    
  // Split by space/delimiters or markdown bold tag while keeping it
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

interface WorldData {
  planets: any[];
  esoteric: {
    progressedSunSign?: string;
    progressedSunAge?: number;
    interceptedSigns?: string[];
  };
}

export const downloadKabbalahPDF = async (
  charts: { assiah: WorldData; yetzirah: WorldData; beriyah: WorldData; atzilut: WorldData },
  kabbalahAnalysis: { primaryRuler: string; shortcutMessage: string },
  interpretations: any,
  locationStr: string,
  dateStr: string
) => {
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
  const secondaryDark: [number, number, number] = [30, 35, 50]; 
  const gold: [number, number, number] = [212, 175, 55]; // #D4AF37
  const purple: [number, number, number] = [106, 13, 173]; // #6A0DAD
  const white: [number, number, number] = [255, 255, 255];
  const grayText: [number, number, number] = [180, 180, 180];

  let currentY = 20;

  const checkSpace = (required: number) => {
    if (currentY + required > 280) {
      doc.addPage();
      currentY = 20;
    }
  };

  // --- Title Page / Header ---
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(22);
  doc.setFont('LiberationSans', 'bold');
  doc.text(tr("KABALİSTİK 4 ALEM DOĞUM HARİTASI RAPORU"), 14, currentY);
  currentY += 10;

  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFontSize(11);
  doc.setFont('LiberationSans', 'normal');
  doc.text(tr(`Doğum Bilgileri: ${locationStr} | Tarih: ${dateStr}`), 14, currentY);
  currentY += 15;

  // --- General Kabbalistic Overview ---
  checkSpace(70);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(15);
  doc.setFont('LiberationSans', 'bold');
  doc.text(tr("Kabalistik ve Kozmik Genel Bakış"), 14, currentY);
  currentY += 8;

  // Background rect for overview
  doc.setFillColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.rect(14, currentY, 182, 45, 'F');
  
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(11);
  doc.text(tr(`Beden Yöneticiniz (Yaşam Yolu): ${kabbalahAnalysis.primaryRuler}`), 18, currentY + 7);
  
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(9.5);
  
  // Render shortcut message using drawTextWithBold
  drawTextWithBold(doc, kabbalahAnalysis.shortcutMessage, 18, currentY + 15, 174, 5.5);
  currentY += 55;

  // --- 4 Worlds Analysis ---
  const worldKeys = ['assiah', 'yetzirah', 'beriyah', 'atzilut'] as const;
  const worldTitles: Record<string, string> = {
    assiah: "1. Assiah Alemi (Fiziksel / Eylem Alemi)",
    yetzirah: "2. Yetzirah Alemi (Duygusal / Şekillendirme Alemi)",
    beriyah: "3. Beriyah Alemi (Zihinsel / Yaratım Alemi)",
    atzilut: "4. Atzilut Alemi (Ruhsal / Kudret Alemi)"
  };

  for (const world of worldKeys) {
    const chart = charts[world];
    if (!chart) continue;

    // Add a new page for each world to keep the report clean and readable
    doc.addPage();
    currentY = 20;

    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(16);
    doc.setFont('LiberationSans', 'bold');
    doc.text(tr(worldTitles[world]), 14, currentY);
    currentY += 8;

    // Progression / Intercepted Info
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFontSize(10);
    doc.setFont('LiberationSans', 'normal');

    if (world === 'assiah') {
      const sun = chart.planets.find(p => p.name === 'Güneş');
      const progSign = chart.esoteric.progressedSunSign;
      const progAge = chart.esoteric.progressedSunAge;
      if (sun && progSign) {
        let progText = '';
        if (progSign === sun.sign) {
          progText = `Ruhsal Güneşiniz henüz burç değiştirmemiştir. Ancak ${progAge} yaşına geldiğinizde Güneşiniz sınırları aşarak yeni bir tekamül aşamasına geçecektir.`;
        } else {
          progText = `Natal Güneşiniz ${sun.sign} olsa da, ruhunuz ${progAge} yaşından sonra uyanış yaşayarak sınırları aşmış ve ${progSign} burcuna (Progressed) evrilmiştir.`;
        }
        const splitProg = doc.splitTextToSize(tr(progText), 182);
        doc.text(splitProg, 14, currentY);
        currentY += splitProg.length * 5 + 2;
      }
    }

    const intercepted = chart.esoteric.interceptedSigns || [];
    let interceptedText = '';
    if (intercepted.length > 0) {
      interceptedText = `Kıstırılan (Intercepted) Burçlar: ${intercepted.join(' ve ')}. Bu burçlar, bu alemdeki en derin ve kilitli karmik potansiyellerinizi işaret eder.`;
    } else {
      interceptedText = "Bu harita katmanında kıstırılmış burç bulunmamaktadır. Tüm enerjiler doğrudan ev alanlarınıza akmaktadır.";
    }
    const splitIntercepted = doc.splitTextToSize(tr(interceptedText), 182);
    doc.text(splitIntercepted, 14, currentY);
    currentY += splitIntercepted.length * 5 + 5;

    // Placements Table
    const tableBody = chart.planets.map((p: any) => {
      const interp = interpretations?.[world]?.[p.name];
      const placementText = `${p.sign} | ${p.house}. Ev`;
      const degreeText = `${p.degreeInSign}° ${String(p.minutes).padStart(2, '0')}' ${p.isRetrograde ? 'Rx' : ''}`;
      const interpText = interp ? `${interp.title}: ${cleanCellText(interp.content)}` : 'Yorum yok';
      return [
        tr(p.name),
        tr(placementText),
        tr(degreeText),
        tr(interpText)
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [[tr('Gezegen'), tr('Yerleşim'), tr('Derece'), tr('Ezoterik Açıklama')]],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: gold, textColor: primaryDark, fontStyle: 'bold', font: 'LiberationSans' },
      bodyStyles: { fillColor: secondaryDark, textColor: [255, 255, 255], fontSize: 8, font: 'LiberationSans' },
      alternateRowStyles: { fillColor: primaryDark },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 120 }
      },
      styles: { overflow: 'linebreak' }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Save the PDF file
  doc.save(`Kabalistik_4_Alem_Analizi_${locationStr.replace(/\s+/g, '_')}.pdf`);
};
