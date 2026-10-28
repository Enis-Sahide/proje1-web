import jsPDF from 'jspdf';
import type { CareerAnalysisResult } from '@/features/astrology/engine/CareerEngine';

// Helper to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
};

// Word-wrap text renderer that supports inline markdown bold formatting (**text**) and auto-pagination
const drawTextWithBold = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 7.0,
  maxY: number = 265,
  startY: number = 30,
  onPageBreak?: () => void
): number => {
  let curX = x;
  let curY = y;
  const activeColor = (doc as any).getTextColor ? (doc as any).getTextColor() : '#1f2937';

  if (curY > maxY) {
    doc.addPage();
    if (onPageBreak) onPageBreak();
    curY = startY;
    doc.setTextColor(activeColor);
  }

  const sanitizedText = (text || '')
    .replace(/\r\n/g, '\n')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/<img.*?src=".*?".*?>/g, '')
    .replace(/^\s*>\s*/gm, '')
    .replace(/\*\*\*(.*?)\*\*\*/g, '**$1**')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '**$1**')
    .replace(/\*\((.*?)\)\*/g, '**$1**');
     
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
      for (let i = 0; i < newlineCount; i++) {
        curY += lineHeight;
        if (curY > maxY) {
          doc.addPage();
          if (onPageBreak) onPageBreak();
          curY = startY;
          doc.setTextColor(activeColor);
          doc.setFont('LiberationSans', isBold ? 'bold' : 'normal');
        }
      }
      continue;
    }
    if (part === '') continue;
    
    const cleanWord = part.replace(/\*/g, '');
    if (!cleanWord && part !== '') continue;

    const wordWidth = doc.getTextWidth(cleanWord);
    if (curX + wordWidth > x + maxWidth && cleanWord.trim() !== '') {
      curX = x;
      curY += lineHeight;
      if (curY > maxY) {
        doc.addPage();
        if (onPageBreak) onPageBreak();
        curY = startY;
        doc.setTextColor(activeColor);
        doc.setFont('LiberationSans', isBold ? 'bold' : 'normal');
      }
    }
    
    doc.text(cleanWord, curX, curY);
    curX += wordWidth;
  }
  
  doc.setFont('LiberationSans', 'normal');
  return curY + lineHeight;
};

export const downloadCareerPDF = async (
  data: CareerAnalysisResult,
  birthInfo: {
    fullName: string;
    birthDate: string;
    birthTime?: string;
    cityName: string;
    country?: string;
  }
) => {
  const doc = new jsPDF();

  const primaryDark: [number, number, number] = [20, 25, 40]; // Deep Navy
  const cardDark: [number, number, number] = [248, 250, 252]; // Slate Light Card
  const gold: [number, number, number] = [184, 134, 11]; // Rich Gold
  const purple: [number, number, number] = [124, 58, 237]; // Mystic Purple
  const charcoal: [number, number, number] = [31, 41, 55]; // High-Contrast Text
  const muted: [number, number, number] = [100, 116, 139]; // Muted Slate

  // Custom fonts for Turkish characters
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
    console.error("Failed to load custom fonts for Career PDF:", error);
  }

  const drawHeader = () => {
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.line(15, 15, 195, 15);
    doc.line(15, 285, 195, 285);

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...gold);
    doc.text('7LAYERS | KARİYER & MESLEKİ YATKINLIK ANALİZİ', 15, 11);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text('Özel Mesleki Dosya', 195, 11, { align: 'right' });
  };

  let curY = 0;

  const ensureSpace = (needed: number) => {
    if (curY + needed > 265) {
      doc.addPage();
      drawHeader();
      curY = 30;
    }
  };

  const renderText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number = 180,
    lineHeight: number = 6.5
  ): number => {
    return drawTextWithBold(doc, text, x, y, maxWidth, lineHeight, 265, 30, drawHeader);
  };

  // ================= SAYFA 1: KAPAK & GENEL BAKIŞ =================
  drawHeader();
  curY = 30;

  // Title Box
  doc.setFillColor(...cardDark);
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, curY, 180, 42, 3, 3, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryDark);
  doc.text(birthInfo.fullName || data.personalInfo.fullName, 22, curY + 12);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  const formattedDate = birthInfo.birthDate ? birthInfo.birthDate.split('T')[0].split('-').reverse().join('.') : '';
  doc.text(`Doğum: ${formattedDate} ${birthInfo.birthTime || '12:00'} • ${birthInfo.cityName} (Yaş: ${data.careerTimeline?.currentAge || ''})`, 22, curY + 20);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...gold);
  doc.text(`İdeal Model: ${data.idealWorkModel.type} (%${data.idealWorkModel.percentage} Uyum)`, 22, curY + 30);
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  doc.text(`Karar İlkesi: "${data.summaryBadges.decisionMotto}"`, 22, curY + 37);

  curY += 50;

  // 4 Core Badges (2x2 Grid for generous width and multi-line safety)
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...gold);
  doc.text('TEMEL MESLEKİ MİZAÇ ROZETLERİ', 15, curY);
  curY += 5;

  const badgeW = 88;
  const badgeH = 19;
  const gapX = 4;
  const gapY = 4;
  const badges = [
    { title: 'Liderlik Tarzı', val: data.summaryBadges.leadershipStyle },
    { title: 'Çalışma Dinamiği', val: data.summaryBadges.workDynamic },
    { title: 'Temel Yetkinlik', val: data.summaryBadges.coreAsset },
    { title: 'Karar Mekanizması', val: data.summaryBadges.decisionMotto }
  ];

  badges.forEach((b, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const bx = 15 + col * (badgeW + gapX);
    const by = curY + row * (badgeH + gapY);

    doc.setFillColor(243, 244, 246);
    doc.roundedRect(bx, by, badgeW, badgeH, 2, 2, 'F');

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(b.title.toUpperCase(), bx + 6, by + 6);

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    const valLines = doc.splitTextToSize(b.val, badgeW - 12);
    valLines.slice(0, 2).forEach((vl: string, vlIdx: number) => {
      doc.text(vl, bx + 6, by + 12 + vlIdx * 4.2);
    });
  });

  curY += 2 * badgeH + gapY + 7;

  // İdeal Çalışma Modeli Açıklaması
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...gold);
  doc.text('BÜYÜK SENTEZ: İDEAL ÇALIŞMA MODELİNİZ', 15, curY);
  curY += 6;

  curY = renderText(data.idealWorkModel.explanation, 15, curY, 180, 6.5);
  curY += 6;

  // Kariyer Odak Stratejisi
  if (data.focusStrategy) {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...gold);
    doc.text(`UZMANLAŞMA STRATEJİSİ: ${data.focusStrategy.type}`, 15, curY);
    curY += 6;

    curY = renderText(`**Motto:** ${data.focusStrategy.motto}\n\n${data.focusStrategy.explanation}\n\n**Stratejik Eylem:** ${data.focusStrategy.actionAdvice}`, 15, curY, 180, 6.5);
  }

  // ================= SAYFA 2: SEKTÖRLER & ENERJİ DAĞILIMI =================
  doc.addPage();
  drawHeader();
  curY = 30;

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...gold);
  doc.text('SEKTÖREL POTANSİYEL & ENERJİ SPEKTRUMU (%100)', 15, curY);
  curY += 8;

  // Top Sectors List (Dynamic Height & Multi-line Wrapped Roles)
  data.topSectors.forEach((sec, idx) => {
    const titleText = `${idx + 1}. ${sec.title} • Uyum: %${sec.fitScore}`;
    const descLines = doc.splitTextToSize(sec.description, 168);
    const roleText = `Öne Çıkan Roller: ${sec.recommendedRoles.join(', ')}`;
    const roleLines = doc.splitTextToSize(roleText, 168);
    
    // Total card height with generous padding
    const cardH = 14 + (descLines.length * 4.2) + (roleLines.length * 4.0);
    ensureSpace(cardH + 6);

    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, curY, 180, cardH, 2, 2, 'FD');

    // Title
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryDark);
    doc.text(titleText, 20, curY + 7);

    // Description lines
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    let lineY = curY + 13;
    descLines.forEach((dl: string) => {
      doc.text(dl, 20, lineY);
      lineY += 4.2;
    });

    // Roles lines
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    lineY += 1.5;
    roleLines.forEach((rl: string) => {
      doc.text(rl, 20, lineY);
      lineY += 3.8;
    });

    curY += cardH + 5;
  });

  curY += 5;

  // Gezegensel Mesleki Göstergeler
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...gold);
  doc.text('GEZEGENLERİN MESLEKİ DEŞİFRELERİ', 15, curY);
  curY += 8;

  data.planetaryInsights.slice(0, 4).forEach((ins) => {
    ensureSpace(28);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryDark);
    doc.text(`• ${ins.planet} (${ins.sign} - ${ins.house}. Ev): ${ins.title}`, 18, curY);
    curY += 5;

    curY = renderText(ins.explanation, 22, curY, 172, 5.5);
    curY += 3;
  });

  // ================= SAYFA 3: KADERSEL ZAMAN ÇİZELGESİ =================
  if (data.careerTimeline) {
    doc.addPage();
    drawHeader();
    curY = 30;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...gold);
    doc.text('KADERSEL KARİYER DÖNÜM YAŞLARI & ZAMAN ÇİZELGESİ', 15, curY);
    curY += 8;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    curY = renderText(
      'Gezegen döngüleri (Satürn döngüsü, Nodal aks kayması, Uranüs karşıtlığı ve Kiron şifalanması) mesleki hayatınızdaki kırılma, yükselme ve olgunlaşma aşamalarını belirler.',
      15, curY, 180, 6.0
    );
    curY += 5;

    data.careerTimeline.milestones.forEach((ms) => {
      ensureSpace(34);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(220, 225, 235);
      doc.roundedRect(15, curY, 180, 28, 2, 2, 'FD');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...gold);
      doc.text(`${ms.ageRange} YAŞ: ${ms.planetCycle.toUpperCase()}`, 20, curY + 7);

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primaryDark);
      doc.text(ms.title, 20, curY + 14);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...charcoal);
      const gLines = doc.splitTextToSize(`${ms.description} - ${ms.actionGuidance}`, 170);
      doc.text(gLines.slice(0, 2), 20, curY + 21);

      curY += 32;
    });
  }

  // ================= SAYFA 4: İKİNCİL İLERLETİM (SECONDARY PROGRESSIONS) =================
  if (data.progressedCareer) {
    doc.addPage();
    drawHeader();
    curY = 30;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...purple);
    doc.text('İKİNCİL İLERLETİM: İÇSEL KARİYER SAATİNİZ', 15, curY);
    curY += 6;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text('Astro-Seek Standardı • 1 Gün = 1 Yıl İlerletim Formülü', 15, curY);
    curY += 8;

    // 1. İlerletilmiş Güneş
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryDark);
    doc.text('1. İlerletilmiş Güneş (Mesleki Kimlik & Ego Evrimi)', 15, curY);
    curY += 5;

    const sun = data.progressedCareer.progressedSun;
    curY = renderText(
      `**Mevcut İlerletilmiş Konum:** ${sun.progressedSign} ${sun.degreeInSign}°${sun.minutes}' (Doğum: ${sun.natalSign} ${sun.natalDegree}°)\n` +
      `**Dönüşüm Teması:** ${sun.identityShiftTheme}\n` +
      `**Geçiş Yaşı:** ${sun.shiftAge} yaş • Sonraki Burç: ${sun.nextShiftAge} yaş\n\n` +
      `${sun.explanation}`,
      15, curY, 180, 6.0
    );
    curY += 8;

    // 2. İlerletilmiş Ay
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryDark);
    doc.text('2. İlerletilmiş Ay (2.5 Yıllık Mesleki Mevsim & Odak Evi)', 15, curY);
    curY += 5;

    const moon = data.progressedCareer.progressedMoon;
    curY = renderText(
      `**Mevcut Konum:** ${moon.sign} ${moon.degreeInSign}°${moon.minutes}' • **Odak Alanı:** ${moon.natalHouse}. Ev\n` +
      `**Döngü Teması:** ${moon.cycleTheme}\n` +
      `**Tahmini Kalan Süre:** ~${moon.estimatedMonthsLeft} Ay\n\n` +
      `${moon.houseImpact}`,
      15, curY, 180, 6.0
    );
    curY += 8;

    // 3. İlerletilmiş Ay Fazı (30 Yıllık Döngü)
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...purple);
    doc.text(`3. 30 Yıllık Kariyer Döngüsü: ${data.progressedCareer.progressedMoonPhase.name}`, 15, curY);
    curY += 5;

    const phase = data.progressedCareer.progressedMoonPhase;
    curY = renderText(
      `**Döngü Mottosu:** "${phase.phaseMotto}" (Faz ${phase.phaseNumber}/8 • ${phase.elongationDegree}°)\n\n` +
      `**Aşama Durumu:** ${phase.stageDescription}\n\n` +
      `**Kariyer Hasat Rehberi:** ${phase.careerHarvestGuidance}\n\n` +
      `🏛️ **${data.progressedCareer.progressedMidheaven.careerEvolutionTitle}**`,
      15, curY, 180, 6.0
    );
  }

  // ================= SAYFA 5: RUH HARİTASI (DRAKONİK KATMAN) =================
  if (data.soulCareer) {
    doc.addPage();
    drawHeader();
    curY = 30;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...purple);
    doc.text('2. RUH HARİTASI: DRAKONİK ÇAĞRI & RUHSAL KARİYER', 15, curY);
    curY += 8;

    curY = renderText(
      'Kuzey Ay Düğümü 0° Koç burcuna referanslanarak çıkarılan Drakonik haritanız, dünyevi hedeflerin ötesinde ruhunuzun bu yaşamda deneyimlemeye can attığı mesleki misyonu açıklar.',
      15, curY, 180, 6.0
    );
    curY += 6;

    // Soul MC and Planets
    doc.setFillColor(250, 245, 255);
    doc.setDrawColor(216, 180, 254);
    doc.roundedRect(15, curY, 180, 36, 2, 2, 'FD');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...purple);
    doc.text(`Drakonik MC (Ruhsal Tepe Noktası): ${data.soulCareer.soulMidheaven.sign} - ${data.soulCareer.soulMidheaven.title}`, 20, curY + 8);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    const mcLines = doc.splitTextToSize(data.soulCareer.soulMidheaven.calling, 170);
    doc.text(mcLines.slice(0, 3), 20, curY + 16);

    curY += 42;

    // Ruh-Madde Sentez Köprüsü
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
    doc.text('RUH - MADDE SENTEZ KÖPRÜSÜ', 15, curY);
    curY += 6;

    const bridge = data.soulCareer.soulMaterialBridge;
    curY = renderText(
      `**Madde Dünyası Kimliği:** ${bridge.materialIdentity}\n` +
      `**Ruhsal Çağrı:** ${bridge.soulCalling}\n\n` +
      `**Sentez Tavsiyesi:** ${bridge.synthesisAdvice}\n\n` +
      `⚠️ **Tatminsizlik Uyarısı:** ${bridge.unfulfillmentWarning}\n\n` +
      `🌿 **Kutsal Rutin (Günlük Uygulama):** ${bridge.dailySpiritualPractice}`,
      15, curY, 180, 6.0
    );
  }

  // ================= SAYFA 6: SERVET & TÜKENMİŞLİK KALKANI =================
  doc.addPage();
  drawHeader();
  curY = 30;

  // Servet Mıknatısı
  if (data.wealthMagnet) {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...gold);
    doc.text('SERVET MIKNATISI & FİNANSAL KALDIRAÇ STRATEJİNİZ', 15, curY);
    curY += 6;

    curY = renderText(
      `**Servet Kapısı:** ${data.wealthMagnet.channelTitle}\n\n` +
      `**İşleyiş Mekanizması:** ${data.wealthMagnet.mechanism}\n\n` +
      `**Uygulanabilir Formül:** ${data.wealthMagnet.practicalFormula}`,
      15, curY, 180, 6.0
    );
    curY += 8;
  }

  // Tükenmişlik Kalkanı
  if (data.burnoutShield) {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38); // Crimson
    doc.text('TÜKENMİŞLİK KALKANI & MESLEKİ KORUMA REÇETESİ', 15, curY);
    curY += 6;

    curY = renderText(
      `**Temel Enerji Riski:** ${data.burnoutShield.coreRisk}\n\n` +
      `**Kaçınılması Gereken Toksik Ortamlar:** ${data.burnoutShield.toxicEnvironments}\n\n` +
      `**Koruma Formülü:** ${data.burnoutShield.protectionFormula}`,
      15, curY, 180, 6.0
    );
    curY += 8;
  }

  // Footer Note
  ensureSpace(25);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(15, curY, 180, 20, 2, 2, 'F');
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(
    'Bu analiz 7Layers Ezoterik & Kozmik Astroloji Motoru ile üretilmiştir. © 7Layers. Bütün hakları saklıdır.',
    105,
    curY + 11,
    { align: 'center' }
  );

  // Save the PDF
  const filename = `7Layers_Kariyer_Raporu_${(birthInfo.fullName || 'Danisan').replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
