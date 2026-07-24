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
  
  const sanitizedText = text
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
  const white: [number, number, number] = [255, 255, 255];
  const grayText: [number, number, number] = [180, 180, 180];

  let currentY = 25;

  const checkSpace = (required: number) => {
    if (currentY + required > 275) {
      doc.addPage();
      doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
      doc.rect(0, 0, 210, 297, 'F');
      currentY = 25;
    }
  };

  // --- Title Page ---
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
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text("KABALİSTİK 4 ALEM HARİTA ANALİZİ", 20, 50);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text(`Konum: ${locationStr}   |   Doğum Bilgileri: ${dateStr}`, 20, 60);

  currentY = 75;

  // --- General Kabbalistic Overview ---
  checkSpace(70);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(15);
  doc.setFont('LiberationSans', 'bold');
  doc.text("Kabalistik ve Kozmik Genel Bakış", 20, currentY);
  currentY += 8;

  // Background rect for overview
  doc.setFillColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.rect(20, currentY, 170, 45, 'F');
  
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(11);
  doc.text(`Beden Yöneticiniz (Yaşam Yolu): ${kabbalahAnalysis.primaryRuler}`, 24, currentY + 8);
  
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(9.5);
  
  // Render shortcut message using drawTextWithBold
  drawTextWithBold(doc, kabbalahAnalysis.shortcutMessage, 24, currentY + 16, 162, 5.5);
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

    // Add a new page for each world
    doc.addPage();
    doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.rect(0, 0, 210, 297, 'F');
    currentY = 25;

    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(18);
    doc.setFont('LiberationSans', 'bold');
    doc.text(tr(worldTitles[world]), 20, currentY);
    currentY += 10;

    // Progression / Intercepted Info
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFontSize(10.5);
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
        const splitProg = doc.splitTextToSize(tr(progText), 170);
        doc.text(splitProg, 20, currentY);
        currentY += splitProg.length * 5.5 + 2;
      }
    }

    const intercepted = chart.esoteric.interceptedSigns || [];
    let interceptedText = '';
    if (intercepted.length > 0) {
      interceptedText = `Kıstırılan (Intercepted) Burçlar: ${intercepted.join(' ve ')}. Bu burçlar, bu alemdeki en derin ve kilitli karmik potansiyellerinizi işaret eder.`;
    } else {
      interceptedText = "Bu harita katmanında kıstırılmış burç bulunmamaktadır. Tüm enerjiler doğrudan ev alanlarınıza akmaktadır.";
    }
    const splitIntercepted = doc.splitTextToSize(tr(interceptedText), 170);
    doc.text(splitIntercepted, 20, currentY);
    currentY += splitIntercepted.length * 5.5 + 8;

    // Placements Summary Table
    checkSpace(80);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text("Gezegen Konum Özetleri", 20, currentY);
    currentY += 6;

    const planetsBody = chart.planets.map((p: any) => [
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

    // Detailed Esoteric Interpretations
    checkSpace(30);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text("Ezoterik Gezegen Analizleri", 20, currentY);
    currentY += 10;

    for (const p of chart.planets) {
      const interp = interpretations?.[world]?.[p.name];
      if (!interp) continue;

      checkSpace(50);
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      
      // Build a title combining planet name and interpreted title
      const titleStr = `${p.name} - ${interp.title}`;
      doc.text(tr(titleStr), 20, currentY);
      currentY += 7;

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(230, 230, 230);

      currentY = drawTextWithBold(doc, interp.content, 20, currentY, 170, 5.5);
      currentY += 10;
    }
  }

  // Save the PDF file
  doc.save(`Kabalistik_4_Alem_Analizi_${locationStr.replace(/\s+/g, '_')}.pdf`);
};
