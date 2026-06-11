import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Translate Turkish characters to English equivalents for default jsPDF font compatibility
const tr = (str: string | number): string => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U');
};

export const downloadChartPDF = (chartData: any, locationStr: string, dateStr: string) => {
  const doc = new jsPDF();

  const primaryDark: [number, number, number] = [20, 25, 40]; // #141928
  const secondaryDark: [number, number, number] = [30, 35, 50]; 
  const gold: [number, number, number] = [212, 175, 55]; // #D4AF37
  const mysticText: [number, number, number] = [200, 200, 200];

  // Title
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(22);
  doc.text(tr("Ezoterik Dogum Haritasi Raporu"), 14, 22);

  // Subtitle
  doc.setTextColor(mysticText[0], mysticText[1], mysticText[2]);
  doc.setFontSize(11);
  doc.text(tr(`${locationStr} | ${dateStr}`), 14, 30);

  let currentY = 40;

  const checkSpace = (required: number) => {
    if (currentY + required > 280) {
      doc.addPage();
      currentY = 20;
    }
  };

  // 1. Gezegen Yerleşimleri
  checkSpace(130);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(16);
  doc.text(tr("Gezegen Yerlesimleri"), 14, currentY);
  currentY += 5;

  const planetsBody = [...chartData.planets, chartData.ascendant, chartData.midheaven].map((p: any) => [
    tr(p.name),
    tr(p.sign),
    tr(`${p.degreeInSign}° ${String(p.minutes).padStart(2, '0')}' ${p.isRetrograde ? 'Rx' : ''}`),
    tr(`${p.house}. Ev`)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [[tr('Gezegen'), tr('Burc'), tr('Derece'), tr('Ev')]],
    body: planetsBody,
    theme: 'grid',
    headStyles: { fillColor: gold, textColor: primaryDark, fontStyle: 'bold' },
    bodyStyles: { fillColor: secondaryDark, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: primaryDark },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 2. Evler ve Kapsadığı Burçlar
  checkSpace(130);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(16);
  doc.text(tr("Evler ve Kapsadigi Burclar"), 14, currentY);
  currentY += 5;

  const housesBody = chartData.houses.map((h: any) => [
    tr(`${h.house}. Ev`),
    tr(h.sign),
    tr(`${h.degreeInSign}° ${String(h.minutes).padStart(2, '0')}'`)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [[tr('Ev'), tr('Giris Burcu'), tr('Derece')]],
    body: housesBody,
    theme: 'grid',
    headStyles: { fillColor: gold, textColor: primaryDark, fontStyle: 'bold' },
    bodyStyles: { fillColor: secondaryDark, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: primaryDark },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 3. Karmik Dinamikler (Açılar)
  checkSpace(60); // Sadece başlık ve ilk birkaç satır için alan kontrolü
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(16);
  doc.text(tr("Karmik Dinamikler (Acilar)"), 14, currentY);
  currentY += 5;

  const aspectsBody = chartData.aspects
    .filter((a: any) => a.orb <= 7)
    .sort((a: any, b: any) => a.orb - b.orb)
    .map((a: any) => [
      tr(`${a.planet1} - ${a.planet2}`),
      tr(a.type),
      tr(`${a.orb.toFixed(1)}° ${a.isExact ? '(Tam Aci)' : ''}`)
    ]);

  autoTable(doc, {
    startY: currentY,
    head: [[tr('Gezegenler'), tr('Aci Tipi'), tr('Tolerans (Orb)')]],
    body: aspectsBody,
    theme: 'grid',
    headStyles: { fillColor: gold, textColor: primaryDark, fontStyle: 'bold' },
    bodyStyles: { fillColor: secondaryDark, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: primaryDark },
  });

  // Save PDF
  doc.save("Ezoterik_Dogum_Haritasi.pdf");
};
