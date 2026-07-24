import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Turkish character translation helper for default jsPDF fonts
const tr = (str: string | number | null | undefined): string => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U');
};

interface WorldData {
  planets: any[];
  esoteric: {
    progressedSunSign?: string;
    progressedSunAge?: number;
    interceptedSigns?: string[];
  };
}

export const downloadKabbalahPDF = (
  charts: { assiah: WorldData; yetzirah: WorldData; beriyah: WorldData; atzilut: WorldData },
  kabbalahAnalysis: { primaryRuler: string; shortcutMessage: string },
  interpretations: any,
  locationStr: string,
  dateStr: string
) => {
  const doc = new jsPDF();

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
  doc.text(tr("KABALISTIK 4 ALEM DOGUM HARITASI RAPORU"), 14, currentY);
  currentY += 10;

  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFontSize(11);
  doc.text(tr(`Dogum Bilgileri: ${locationStr} | Tarih: ${dateStr}`), 14, currentY);
  currentY += 15;

  // --- General Kabbalistic Overview ---
  checkSpace(60);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(15);
  doc.text(tr("Kabalistik ve Kozmik Genel Bakis"), 14, currentY);
  currentY += 8;

  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(10);
  doc.setFillColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.rect(14, currentY, 182, 35, 'F');
  
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text(tr(`Beden Yoneticiniz (Yasam Yolu): ${kabbalahAnalysis.primaryRuler}`), 18, currentY + 7);
  
  doc.setTextColor(white[0], white[1], white[2]);
  const splitMessage = doc.splitTextToSize(tr(kabbalahAnalysis.shortcutMessage), 174);
  doc.text(splitMessage, 18, currentY + 15);
  currentY += 45;

  // --- 4 Worlds Analysis ---
  const worldKeys = ['assiah', 'yetzirah', 'beriyah', 'atzilut'] as const;
  const worldTitles: Record<string, string> = {
    assiah: "1. Assiah Alemi (Fiziksel / Eylem Alemi)",
    yetzirah: "2. Yetzirah Alemi (Duygusal / Sekillendirme Alemi)",
    beriyah: "3. Beriyah Alemi (Zihinsel / Yaratim Alemi)",
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
    doc.text(tr(worldTitles[world]), 14, currentY);
    currentY += 8;

    // Progression / Intercepted Info
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFontSize(10);

    if (world === 'assiah') {
      const sun = chart.planets.find(p => p.name === 'Güneş');
      const progSign = chart.esoteric.progressedSunSign;
      const progAge = chart.esoteric.progressedSunAge;
      if (sun && progSign) {
        let progText = '';
        if (progSign === sun.sign) {
          progText = `Ruhsal Gunesiniz henüz burc degistirmemistir. Ancak ${progAge} yasina geldiginizde Gunesiniz sinirlari asarak yeni bir tekamul asamasina gececektir.`;
        } else {
          progText = `Natal Gunesiniz ${sun.sign} olsa da, ruhunuz ${progAge} yasindan sonra uyanis yasayarak sinirlari asmis ve ${progSign} burcuna (Progressed) evrilmistir.`;
        }
        const splitProg = doc.splitTextToSize(tr(progText), 182);
        doc.text(splitProg, 14, currentY);
        currentY += splitProg.length * 5 + 2;
      }
    }

    const intercepted = chart.esoteric.interceptedSigns || [];
    let interceptedText = '';
    if (intercepted.length > 0) {
      interceptedText = `Kistirilan (Intercepted) Burclar: ${intercepted.join(' ve ')}. Bu burclar, bu alemdeki en derin ve kilitli karmik potansiyellerinizi isaret eder.`;
    } else {
      interceptedText = "Bu harita katmaninda kistirilan burc bulunmamaktadir. Tum enerjiler dogrudan ev alanlarina akmaktadir.";
    }
    const splitIntercepted = doc.splitTextToSize(tr(interceptedText), 182);
    doc.text(splitIntercepted, 14, currentY);
    currentY += splitIntercepted.length * 5 + 5;

    // Placements Table
    const tableBody = chart.planets.map((p: any) => {
      const interp = interpretations?.[world]?.[p.name];
      const placementText = `${p.sign} | ${p.house}. Ev`;
      const degreeText = `${p.degreeInSign}° ${String(p.minutes).padStart(2, '0')}' ${p.isRetrograde ? 'Rx' : ''}`;
      const interpText = interp ? `${interp.title}: ${interp.content}` : 'Yorum yok';
      return [
        tr(p.name),
        tr(placementText),
        tr(degreeText),
        tr(interpText)
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [[tr('Gezegen'), tr('Yerlesim'), tr('Derece'), tr('Esoterik Aciklama')]],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: gold, textColor: primaryDark, fontStyle: 'bold' },
      bodyStyles: { fillColor: secondaryDark, textColor: [255, 255, 255], fontSize: 8 },
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
