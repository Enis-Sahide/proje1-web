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
    .replace(/\r\n/g, '\n') // Convert CRLF to LF
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

const ZODIAC_COLORS: Record<string, string> = {
  'Koç': '#FF453A', 'Aslan': '#FF453A', 'Yay': '#FF453A',
  'Boğa': '#32D74B', 'Başak': '#32D74B', 'Oğlak': '#32D74B',
  'İkizler': '#FFD60A', 'Terazi': '#FFD60A', 'Kova': '#FFD60A',
  'Yengeç': '#0A84FF', 'Akrep': '#0A84FF', 'Balık': '#0A84FF',
};

const ZODIAC_SYMBOLS: Record<string, string> = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋', 
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏', 
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓'
};

const ZODIAC_ORDER = [
  'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 
  'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'
];

const PLANET_SYMBOLS: Record<string, string> = {
  'Güneş': '☉', 'Ay': '☽', 'Merkür': '☿', 'Venüs': '♀', 'Mars': '♂', 
  'Jüpiter': '♃', 'Satürn': '♄', 'Uranüs': '♅', 'Neptün': '♆', 'Plüton': '♇',
  'Yükselen (ASC)': 'ASC', 'Tepe Noktası (MC)': 'MC', 'Kuzey Ay Düğümü': '☊',
  'Kiron': '⚷',
  'Vertex (Vx)': 'Vx', 'Şans Noktası (POF)': '⊗', 'Lilith': '⚸'
};

const ASPECT_COLORS: Record<string, string> = {
  'Kavuşum': '#D4AF37', 'Sekstil': '#0A84FF', 'Kare': '#FF453A', 'Üçgen': '#32D74B', 'Karşıt': '#FF453A', 'Görmeyen': '#0A84FF'
};

const generateSvgString = (chartData: any): string => {
  const CHART_SIZE = 640;
  const CENTER = CHART_SIZE / 2;
  const RADIUS = CENTER - 85;
  const ascLon = chartData.ascendant.longitude;

  const getX = (lon: number, r: number) => CENTER + r * Math.cos((180 + ascLon - lon) * Math.PI / 180);
  const getY = (lon: number, r: number) => CENTER + r * Math.sin((180 + ascLon - lon) * Math.PI / 180);

  const R_TICKS_OUTER = RADIUS + 40;
  const R_ZODIAC_OUTER = RADIUS + 35;
  const R_ZODIAC_INNER = RADIUS + 10;
  const R_CUSP_NUM = RADIUS + 45;
  const R_PLANETS = RADIUS - 15;
  const R_ASPECTS = RADIUS - 40;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CHART_SIZE} ${CHART_SIZE}" width="${CHART_SIZE}" height="${CHART_SIZE}" style="background-color: #141928;">`;
  
  // Background circle for aspect lines
  svg += `<circle cx="${CENTER}" cy="${CENTER}" r="${R_ASPECTS}" stroke="rgba(212,175,55,0.3)" stroke-width="1" fill="rgba(0,0,0,0.4)" />`;

  // Aspect Lines
  chartData.aspects.filter((a: any) => a.type !== 'Kavuşum').forEach((a: any) => {
    const p1 = chartData.planets.find((p: any) => p.name === a.planet1) || (a.planet1.includes('ASC') ? chartData.ascendant : chartData.midheaven);
    const p2 = chartData.planets.find((p: any) => p.name === a.planet2) || (a.planet2.includes('ASC') ? chartData.ascendant : chartData.midheaven);
    if (p1 && p2) {
      const color = ASPECT_COLORS[a.type] || "rgba(212,175,55,0.3)";
      const width = a.isExact ? "2" : "1";
      svg += `<line x1="${getX(p1.longitude, R_ASPECTS)}" y1="${getY(p1.longitude, R_ASPECTS)}" x2="${getX(p2.longitude, R_ASPECTS)}" y2="${getY(p2.longitude, R_ASPECTS)}" stroke="${color}" stroke-width="${width}" opacity="0.6" />`;
    }
  });

  // Inner Rings
  svg += `<circle cx="${CENTER}" cy="${CENTER}" r="${R_ZODIAC_INNER}" stroke="rgba(212,175,55,0.3)" stroke-width="1.5" fill="none" />`;
  svg += `<circle cx="${CENTER}" cy="${CENTER}" r="${R_ZODIAC_OUTER}" stroke="rgba(212,175,55,0.3)" stroke-width="1.5" fill="none" />`;
  svg += `<circle cx="${CENTER}" cy="${CENTER}" r="${R_TICKS_OUTER}" stroke="rgba(212,175,55,0.3)" stroke-width="1" fill="none" />`;

  // 360 Degree Ticks
  let majorPath = "";
  let minorPath = "";
  for (let i = 0; i < 360; i++) {
    const isTen = i % 10 === 0;
    const isFive = i % 5 === 0;
    let length = 2;
    if (isTen) length = 6;
    else if (isFive) length = 4;

    const x1 = getX(i, R_TICKS_OUTER);
    const y1 = getY(i, R_TICKS_OUTER);
    const x2 = getX(i, R_TICKS_OUTER - length);
    const y2 = getY(i, R_TICKS_OUTER - length);

    if (isTen) {
      majorPath += `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} `;
    } else {
      minorPath += `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} `;
    }
  }
  svg += `<path d="${majorPath}" stroke="#D4AF37" stroke-width="1" fill="none" />`;
  svg += `<path d="${minorPath}" stroke="rgba(212,175,55,0.3)" stroke-width="0.5" fill="none" />`;

  // Zodiac Signs
  for (let i = 0; i < 12; i++) {
    const signLon = i * 30; 
    const midLon = signLon + 15;
    const signName = ZODIAC_ORDER[i];
    svg += `<line x1="${getX(signLon, R_ZODIAC_OUTER)}" y1="${getY(signLon, R_ZODIAC_OUTER)}" x2="${getX(signLon, R_ZODIAC_INNER)}" y2="${getY(signLon, R_ZODIAC_INNER)}" stroke="rgba(212,175,55,0.3)" stroke-width="1" />`;
    svg += `<text x="${getX(midLon, RADIUS + 22)}" y="${getY(midLon, RADIUS + 22) + 6}" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="${ZODIAC_COLORS[signName]}" text-anchor="middle" font-weight="bold">${ZODIAC_SYMBOLS[signName]}</text>`;
  }

  // House Lines
  chartData.houses.forEach((h: any) => {
    const isAngle = h.house === 1 || h.house === 4 || h.house === 7 || h.house === 10;
    const color = isAngle ? "#D4AF37" : "rgba(212,175,55,0.3)";
    const width = isAngle ? "2" : "1";
    const dash = isAngle ? "" : "stroke-dasharray=\"4, 4\"";
    svg += `<line x1="${getX(h.longitude, R_ASPECTS)}" y1="${getY(h.longitude, R_ASPECTS)}" x2="${getX(h.longitude, R_ZODIAC_INNER)}" y2="${getY(h.longitude, R_ZODIAC_INNER)}" stroke="${color}" stroke-width="${width}" ${dash} />`;
    svg += `<line x1="${getX(h.longitude, R_TICKS_OUTER)}" y1="${getY(h.longitude, R_TICKS_OUTER)}" x2="${getX(h.longitude, R_TICKS_OUTER + 5)}" y2="${getY(h.longitude, R_TICKS_OUTER + 5)}" stroke="${color}" stroke-width="${width}" />`;
    svg += `<text x="${getX(h.longitude, R_CUSP_NUM + (isAngle ? 5 : 0))}" y="${getY(h.longitude, R_CUSP_NUM + (isAngle ? 5 : 0)) + 4}" font-family="Arial, Helvetica, sans-serif" font-size="${isAngle ? "14" : "12"}" fill="${isAngle ? "#D4AF37" : "#9CA3AF"}" text-anchor="middle" font-weight="${isAngle ? "bold" : "normal"}">${h.degreeInSign}° ${h.house}. ${h.minutes}'</text>`;
  });

  // Planets
  const planetsList = [...chartData.planets, chartData.ascendant, chartData.midheaven];
  planetsList.forEach((p: any, i: number) => {
    let rOffset = 0;
    for(let j=0; j<i; j++) {
       if (Math.abs(p.longitude - planetsList[j].longitude) < 5) rOffset += 18;
    }
    const px = getX(p.longitude, R_PLANETS - rOffset);
    const py = getY(p.longitude, R_PLANETS - rOffset);

    svg += `<line x1="${getX(p.longitude, R_ZODIAC_INNER)}" y1="${getY(p.longitude, R_ZODIAC_INNER)}" x2="${px}" y2="${py}" stroke="rgba(212,175,55,0.3)" stroke-width="0.5" stroke-dasharray="1, 2" />`;
    svg += `<circle cx="${px}" cy="${py}" r="12" fill="#0F172A" stroke="#D4AF37" stroke-width="1" />`;
    svg += `<text x="${px}" y="${py + 5}" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#D4AF37" text-anchor="middle" font-weight="bold">${PLANET_SYMBOLS[p.name] || p.name[0]}</text>`;
    svg += `<text x="${px + 16}" y="${py - 5}" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#9CA3AF" text-anchor="start">${p.degreeInSign}°${String(p.minutes).padStart(2,'0')}'</text>`;
    if (p.isRetrograde) {
      svg += `<text x="${px + 16}" y="${py + 6}" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#FF453A" text-anchor="start" font-weight="bold">Rx</text>`;
    }
  });

  svg += `</svg>`;
  return svg;
};

const convertSvgToPng = (svgString: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 640;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(image, 0, 0, 640, 640);
          const png = canvas.toDataURL('image/png');
          URL.revokeObjectURL(blobURL);
          resolve(png);
        } else {
          console.error("[pdfGenerator-kabbalah] Canvas context could not be created.");
          reject(new Error('Canvas context could not be created'));
        }
      };
      image.onerror = (err) => {
        console.error("[pdfGenerator-kabbalah] Image element failed to load SVG blob URL:", err);
        reject(err);
      };
      image.src = blobURL;
    } catch (err) {
      console.error("[pdfGenerator-kabbalah] Exception in convertSvgToPng:", err);
      reject(err);
    }
  });
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

  // Override addPage to automatically paint the dark background on all new pages (e.g. from autotable)
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function(this: any, ...args: any[]) {
    const result = originalAddPage(...args);
    doc.setFillColor(20, 25, 40); // primaryDark
    doc.rect(0, 0, 210, 297, 'F');
    return result;
  };

  // Generate chart images in background for each of the 4 worlds (runs in browser context)
  const chartImages: Record<string, string> = {};
  for (const world of ['assiah', 'yetzirah', 'beriyah', 'atzilut'] as const) {
    const chart = charts[world];
    if (chart) {
      try {
        const svgStr = generateSvgString(chart);
        chartImages[world] = await convertSvgToPng(svgStr);
      } catch (err) {
        console.error(`[pdfGenerator-kabbalah] Failed to generate chart visual for ${world}:`, err);
      }
    }
  }

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

  // Objectivity/Software validation statement on Cover Page (Introductory Disclaimer)
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // #94a3b8
  const infoText = "Bu analiz raporu ezoterik kadim astroloji ve kabala kaynaklarından derlenmiş olup, tamamen algoritmik yazılım sistemi tarafından, insan yorumu ve kişisel önyargılardan bağımsız olarak objektif bir biçimde oluşturulmuştur.";
  const splitInfo = doc.splitTextToSize(infoText, 170);
  doc.text(splitInfo, 20, 66);

  currentY = 86;

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

  // --- Active Consciousness Trigger Section ---
  if ((kabbalahAnalysis as any).activeConsciousness) {
    const ac = (kabbalahAnalysis as any).activeConsciousness;
    currentY += 5;
    
    // Header for active consciousness
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(13);
    doc.setFont('LiberationSans', 'bold');
    doc.text("Aktif Bilinç Boyutunuz (Gökyüzü Tetiklenmesi)", 20, currentY);
    currentY += 6;

    // Draw background rectangle (cyan/blue theme)
    doc.setFillColor(15, 30, 60); // Dark blue background
    doc.setDrawColor(14, 165, 233); // Cyan border
    doc.rect(20, currentY, 170, 100, 'FD'); // Fill and border

    doc.setTextColor(14, 165, 233);
    doc.setFontSize(13); // Increased font size
    doc.setFont('LiberationSans', 'bold');
    doc.text(ac.title, 24, currentY + 8);

    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(10.5); // Increased font size
    doc.setFont('LiberationSans', 'normal');
    
    let textY = drawTextWithBold(doc, ac.reason, 24, currentY + 18, 162, 6.0); // Increased Y offset and line height
    
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10.5); // Increased font size
    doc.text("MEVCUT TEKAMÜL TAVSİYESİ", 24, textY + 2);
    doc.setFont('LiberationSans', 'normal');
    doc.setTextColor(220, 220, 220);
    textY = drawTextWithBold(doc, ac.explanation, 24, textY + 8, 162, 6.0); // Increased line height

    // Render static vs transit warning footnote
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(8.5); // Increased font size
    const dateToday = new Date().toLocaleDateString('tr-TR');
    const warningText = `Önemli Bilgilendirme: Bu harita boyutları ömür boyu değişmeyen kalıcı potansiyellerinizdir. Ancak bu "Aktif Bilinç Boyutu" kartı, yalnızca sorgulama yapılan bugün (${dateToday}) tarihindeki güncel transit gezegen etkilerine göre hesaplanmış geçici bir dönem ödevidir. Canlı gökyüzü değişimlerini ve güncellenen ödevlerinizi takip etmek için dilediğiniz zaman uygulamamıza girerek güncel analizleri kontrol edebilirsiniz.`;
    drawTextWithBold(doc, warningText, 24, textY + 2, 162, 4.5); // Increased line height

    currentY += 107;
  }

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
    currentY = 25;

    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(18);
    doc.setFont('LiberationSans', 'bold');
    doc.text(tr(worldTitles[world]), 20, currentY);
    currentY += 10;

    // Draw world chart visual if available
    const imgBase64 = chartImages[world];
    if (imgBase64) {
      doc.addImage(imgBase64, 'PNG', 55, currentY, 100, 100);
      currentY += 106; // Move Y below the chart
    }

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
      interceptedText = "Bu harita boyutunda kıstırılmış burç bulunmamaktadır. Tüm enerjiler doğrudan ev alanlarınıza akmaktadır.";
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
      
      // Build a title using the interpreted title directly (it already includes the planet name)
      const titleStr = interp.title;
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
