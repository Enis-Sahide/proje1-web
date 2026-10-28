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
  lineHeight: number = 6.5,
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
    doc.text('Kapsamlı Mesleki & Ezoterik Dosya', 195, 11, { align: 'right' });
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
    lineHeight: number = 6.2
  ): number => {
    return drawTextWithBold(doc, text, x, y, maxWidth, lineHeight, 265, 30, drawHeader);
  };

  // ================= SAYFA 1: KAPAK & GENEL MİZAÇ BAKIŞI =================
  drawHeader();
  curY = 30;

  // Title Card
  doc.setFillColor(...cardDark);
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, curY, 180, 42, 3, 3, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryDark);
  doc.text(birthInfo.fullName || data.personalInfo.fullName, 22, curY + 12);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(9.5);
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

  curY += 49;

  // 4 Core Badges (2x2 Grid)
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

  curY = renderText(data.idealWorkModel.explanation, 15, curY, 180, 6.2);
  curY += 6;

  // Kariyer Odak Stratejisi
  if (data.focusStrategy) {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...gold);
    doc.text(`UZMANLAŞMA STRATEJİSİ: ${data.focusStrategy.type}`, 15, curY);
    curY += 6;

    curY = renderText(
      `**Motto:** ${data.focusStrategy.motto}\n\n${data.focusStrategy.explanation}\n\n**Stratejik Eylem:** ${data.focusStrategy.actionAdvice}`,
      15, curY, 180, 6.2
    );
  }

  // ================= SAYFA 2: SEKTÖREL POTANSİYEL & ENERJİ SPEKTRUMU =================
  doc.addPage();
  drawHeader();
  curY = 30;

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...gold);
  doc.text('SEKTÖREL POTANSİYEL & ENERJİ SPEKTRUMU (%100)', 15, curY);
  curY += 7;

  // Enerji Dağılımı Özeti (%100)
  if (data.energyDistribution && data.energyDistribution.segments.length > 0) {
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(15, curY, 180, 16, 2, 2, 'F');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryDark);
    doc.text('Kişisel Potansiyel Dağılımı: ', 18, curY + 6);

    const segText = data.energyDistribution.segments
      .map(s => `${s.title}: %${s.percentage}`)
      .join('  •  ');
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...charcoal);
    const segLines = doc.splitTextToSize(segText, 172);
    doc.text(segLines.slice(0, 2), 18, curY + 11);

    curY += 21;
  }

  // 3 Ana Sektör Kartları
  data.topSectors.forEach((sec, idx) => {
    const titleText = `${idx + 1}. ${sec.title} • Uyum: %${sec.fitScore}`;
    const descLines = doc.splitTextToSize(sec.description, 168);
    const roleText = `Öne Çıkan Roller: ${sec.recommendedRoles.join(', ')}`;
    const roleLines = doc.splitTextToSize(roleText, 168);
    
    const cardH = 14 + (descLines.length * 4.2) + (roleLines.length * 3.8);
    ensureSpace(cardH + 6);

    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, curY, 180, cardH, 2, 2, 'FD');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryDark);
    doc.text(titleText, 20, curY + 7);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    let lineY = curY + 13;
    descLines.forEach((dl: string) => {
      doc.text(dl, 20, lineY);
      lineY += 4.2;
    });

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

  // Tamamlayıcı İkincil Sektörler
  if (data.secondarySectors && data.secondarySectors.length > 0) {
    ensureSpace(35);
    curY += 4;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...gold);
    doc.text('TAMAMLAYICI & İKİNCİL SEKTÖR POTANSİYELLERİ', 15, curY);
    curY += 6;

    data.secondarySectors.forEach((sSec) => {
      ensureSpace(16);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, curY, 180, 14, 2, 2, 'F');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primaryDark);
      doc.text(`${sSec.title} (%${sSec.percentage} Uyum)`, 20, curY + 6);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(`Destekleyici Roller: ${sSec.recommendedRoles.join(', ')}`, 20, curY + 11);

      curY += 16;
    });
  }

  // ================= SAYFA 3: GEZEGENLERİN MESLEKİ DEŞİFRELERİ (TAM LİSTE) =================
  doc.addPage();
  drawHeader();
  curY = 30;

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...gold);
  doc.text('GEZEGENLERİN MESLEKİ DEŞİFRELERİ & ZANAAT DALLARI', 15, curY);
  curY += 5;

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);
  doc.text('Doğum haritanızdaki göksel yerleşimlerin çalışma tarzınıza, meslek yeteneklerinize ve zanaat dallarına yansıması:', 15, curY);
  curY += 7;

  // All planetary insights rendered completely
  data.planetaryInsights.forEach((ins) => {
    const pTitle = `• ${ins.planet} (${ins.sign} - ${ins.house}. Ev): ${ins.title} [${ins.domain}]`;
    const expLines = doc.splitTextToSize(ins.explanation, 170);
    const profText = `Yatkın Meslekler & Zanaat Dalları: ${ins.suitableProfessions.join(', ')}`;
    const profLines = doc.splitTextToSize(profText, 170);

    const blockH = 10 + (expLines.length * 4.0) + (profLines.length * 3.8);
    ensureSpace(blockH + 4);

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryDark);
    doc.text(pTitle, 18, curY);
    curY += 5;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    expLines.forEach((el: string) => {
      doc.text(el, 22, curY);
      curY += 4.0;
    });

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...purple);
    profLines.forEach((pl: string) => {
      doc.text(pl, 22, curY);
      curY += 3.8;
    });

    curY += 4;
  });

  // ================= SAYFA 4: KADERSEL ZAMAN ÇİZELGESİ & AKTİF EVRE =================
  if (data.careerTimeline) {
    doc.addPage();
    drawHeader();
    curY = 30;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...gold);
    doc.text('KADERSEL KARİYER ZAMAN ÇİZELGESİ & AKTİF EVRENİZ', 15, curY);
    curY += 7;

    // Aktif Kadersel Evre Parlayan Kutu (activeMilestone)
    const activeM = data.careerTimeline.activeMilestone;
    if (activeM) {
      const activeDescLines = doc.splitTextToSize(activeM.description, 170);
      const actionLines = doc.splitTextToSize(`Bu Evrenin Altın Kuralı: ${activeM.actionGuidance}`, 170);
      const activeBoxH = 18 + (activeDescLines.length * 4.2) + (actionLines.length * 4.0);

      doc.setFillColor(254, 252, 232); // Light Amber
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.8);
      doc.roundedRect(15, curY, 180, activeBoxH, 2, 2, 'FD');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...gold);
      doc.text(`ŞU ANKİ AKTİF EVRENİZ: ${activeM.title} (${activeM.ageRange} - ${activeM.planetCycle})`, 20, curY + 8);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...charcoal);
      let aY = curY + 14;
      activeDescLines.forEach((adl: string) => {
        doc.text(adl, 20, aY);
        aY += 4.2;
      });

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryDark);
      aY += 1;
      actionLines.forEach((al: string) => {
        doc.text(al, 20, aY);
        aY += 4.0;
      });

      curY += activeBoxH + 8;
    }

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
    doc.text('HAYAT BOYU KADERSEL KARİYER YOL HARİTASI (TÜM DÖNÜM YAŞLARI)', 15, curY);
    curY += 6;

    data.careerTimeline.milestones.forEach((ms) => {
      const gLines = doc.splitTextToSize(`${ms.description} - ${ms.actionGuidance}`, 168);
      const msH = 14 + (gLines.length * 4.0);
      ensureSpace(msH + 4);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(220, 225, 235);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, curY, 180, msH, 2, 2, 'FD');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...gold);
      doc.text(`${ms.ageRange} YAŞ: ${ms.planetCycle.toUpperCase()} [${ms.status === 'active' ? 'AKTİF EVRE' : ms.status === 'completed' ? 'TAMAMLANDI' : 'GELECEK EVRE'}]`, 20, curY + 6);

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primaryDark);
      doc.text(ms.title, 20, curY + 12);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...charcoal);
      let mY = curY + 17;
      gLines.forEach((gl: string) => {
        doc.text(gl, 20, mY);
        mY += 4.0;
      });

      curY += msH + 4;
    });
  }

  // ================= SAYFA 5: İKİNCİL İLERLETİM (SECONDARY PROGRESSIONS) =================
  if (data.progressedCareer) {
    doc.addPage();
    drawHeader();
    curY = 30;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...purple);
    doc.text('İKİNCİL İLERLETİM: İÇSEL KARİYER SAATİNİZ', 15, curY);
    curY += 5;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(`Astro-Seek Standardı • 1 Gün = 1 Yıl İlerletim Formülü (${data.progressedCareer.currentAge} Yaş İlerletimi)`, 15, curY);
    curY += 8;

    // 1. İlerletilmiş Güneş
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryDark);
    doc.text('1. İlerletilmiş Güneş (Mesleki Kimlik & Ego Evrimi)', 15, curY);
    curY += 5;

    const sun = data.progressedCareer.progressedSun;
    curY = renderText(
      `**Mevcut İlerletilmiş Konum:** ${sun.progressedSign} ${sun.degreeInSign}°${sun.minutes}' (Doğum Güneşi: ${sun.natalSign} ${sun.natalDegree}°)\n` +
      `**Dönüşüm Teması:** ${sun.identityShiftTheme}\n` +
      `**Geçiş Yaşı:** ${sun.shiftAge} yaş • Sonraki Burç: ${sun.nextShiftAge} yaş\n\n` +
      `${sun.explanation}`,
      15, curY, 180, 6.0
    );
    curY += 7;

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
    curY += 7;

    // 3. İlerletilmiş Ay Fazı (30 Yıllık Döngü)
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...purple);
    doc.text(`3. 30 Yıllık Kariyer Döngüsü: ${data.progressedCareer.progressedMoonPhase.name}`, 15, curY);
    curY += 5;

    const phase = data.progressedCareer.progressedMoonPhase;
    curY = renderText(
      `**Döngü Mottosu:** "${phase.phaseMotto}" (Faz ${phase.phaseNumber}/8 • ${phase.elongationDegree}° Açı)\n\n` +
      `**Aşama Durumu:** ${phase.stageDescription}\n\n` +
      `**Kariyer Hasat Rehberi:** ${phase.careerHarvestGuidance}\n\n` +
      `🏛️ **${data.progressedCareer.progressedMidheaven.careerEvolutionTitle}**`,
      15, curY, 180, 6.0
    );
  }

  // ================= 10 GEZEGENİN MESLEKİ & ZANAAT GÖSTERGELERİ =================
  if (data.planetaryInsights && data.planetaryInsights.length > 0) {
    doc.addPage();
    drawHeader();
    curY = 30;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryDark);
    doc.text('GEZEGEN YERLEŞİMLERİNE GÖRE MESLEKİ & ZANAAT GÖSTERGELERİ', 15, curY);
    curY += 5;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text('Doğum haritanızdaki 10 temel kozmik gücün kamu memurluğu, zanaat, müzik, ticaret ve sahadaki yansımaları', 15, curY);
    curY += 8;

    data.planetaryInsights.forEach((pi) => {
      // Metinleri ve satırları kutu genişliğine (168mm) göre hesapla
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(7.5);
      const expLines = doc.splitTextToSize(pi.explanation, 168);
      const visibleExpLines = expLines.slice(0, 2); // En fazla 2 satır açıklama

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(7);
      const profText = `Tavsiye Edilen Meslek Dalları: ${pi.suitableProfessions.join(' • ')}`;
      const profLines = doc.splitTextToSize(profText, 168); // Asla sağdan taşmayacak şekilde satırlara böl

      // Dinamik Yükseklik: Üst padding (5) + Başlık (4.5) + Alt Başlık (4.5) + Açıklama + Meslekler + Alt padding (4)
      const boxH = 14 + (visibleExpLines.length * 3.8) + (profLines.length * 3.5);

      ensureSpace(boxH + 5);

      // Kutu Çizimi
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(15, curY, 180, boxH, 2, 2, 'FD');

      let innerY = curY + 5.5;

      // 1. Gezegen & Alan Başlığı
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...gold);
      doc.text(`${pi.planet.toUpperCase()} (${pi.sign} - ${pi.house}. Ev) • ${pi.domain.toUpperCase()}`, 20, innerY);
      innerY += 4.5;

      // 2. Mesleki Arketip Unvanı
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryDark);
      doc.text(pi.title, 20, innerY);
      innerY += 4.5;

      // 3. Açıklama Satırları
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...charcoal);
      visibleExpLines.forEach((el: string) => {
        doc.text(el, 20, innerY);
        innerY += 3.8;
      });
      innerY += 0.8;

      // 4. Tavsiye Edilen Meslek Dalları (Satır Satır Temiz Yerleşim)
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...purple);
      profLines.forEach((pl: string) => {
        doc.text(pl, 20, innerY);
        innerY += 3.5;
      });

      curY += boxH + 4;
    });
  }

  // ================= RUH HARİTASI (DRAKONİK KATMAN & RUHSAL ÇAĞRI) =================
  if (data.soulCareer) {
    doc.addPage();
    drawHeader();
    curY = 30;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...purple);
    doc.text('2. RUH HARİTASI: DRAKONİK ÇAĞRI & RUHSAL KARİYER', 15, curY);
    curY += 6;

    // KADİM EZOTERİK İLKE • ONTOLOJİK UYANIŞ ŞARTI MANİFESTO KUTUSU
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(7.5);
    const p1 = 'Kadim Gnostik ve Hermetik öğretilerde insanoğlunun büyük çoğunluğu yaşamını 1. Katman olan Madde Dünyası içerisinde, biyolojik ve toplumsal matrix’in mekanik düzeninde tamamlar. Bu yaratılışın dengesini kuran doğal bir fazdır.';
    const p1Lines = doc.splitTextToSize(p1, 168);

    const p2 = 'Drakonik (Ruh) Haritası, her insanda zorla çalışan bir mekanizma değil; yalnızca dünyevi statü ve paranın ötesindeki içsel sızıyı duyan, "Ben buraya sadece bu çarkı döndürmek için gelmedim" diyerek içsel kıvılcımını kristalleştiren bilinçler için aktifleşen yüksek oktavlı kadersel bir rehberdir. Uykuda olan bilinçler için bu katman sessiz bir tohum olarak bekler; rezonans duyanlar içinse gerçek hayat amacının kapısını açar.';
    const p2Lines = doc.splitTextToSize(p2, 168);

    const manifestoBoxH = 17 + (p1Lines.length * 3.8) + 2.5 + (p2Lines.length * 3.8);
    ensureSpace(manifestoBoxH + 5);

    doc.setFillColor(250, 245, 255);
    doc.setDrawColor(192, 132, 252);
    doc.roundedRect(15, curY, 180, manifestoBoxH, 2, 2, 'FD');

    let mY = curY + 6.5;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...purple);
    doc.text('KADİM EZOTERİK İLKE • ONTOLOJİK UYANIŞ ŞARTI (Hermetik & Gurdjieff Perspektifi)', 20, mY);
    mY += 5;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryDark);
    doc.text('Ruhsal Çağrı Bir Zorunluluk Değil, Bilinçli Bir Uyanış Potansiyelidir', 20, mY);
    mY += 5;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...charcoal);
    p1Lines.forEach((pl: string) => {
      doc.text(pl, 20, mY);
      mY += 3.8;
    });
    mY += 2;

    p2Lines.forEach((pl: string) => {
      doc.text(pl, 20, mY);
      mY += 3.8;
    });

    curY += manifestoBoxH + 6;

    // Drakonik MC Kartı (Dinamik Yükseklik)
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    const mcCallLines = doc.splitTextToSize(data.soulCareer.soulMidheaven.calling, 168);
    const mcImpactLines = doc.splitTextToSize(`Kolektife Bırakılacak Manevi Etki: ${data.soulCareer.soulMidheaven.impact}`, 168);
    const mcBoxH = 14 + (mcCallLines.slice(0, 2).length * 4.2) + (mcImpactLines.length * 4);

    ensureSpace(mcBoxH + 5);

    doc.setFillColor(250, 245, 255);
    doc.setDrawColor(216, 180, 254);
    doc.roundedRect(15, curY, 180, mcBoxH, 2, 2, 'FD');

    let mcY = curY + 6.5;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...purple);
    doc.text(`Drakonik MC (Ruhsal Tepe Noktası): ${data.soulCareer.soulMidheaven.sign} - ${data.soulCareer.soulMidheaven.title}`, 20, mcY);
    mcY += 5;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoal);
    mcCallLines.slice(0, 2).forEach((ml: string) => {
      doc.text(ml, 20, mcY);
      mcY += 4.2;
    });
    mcY += 1;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    mcImpactLines.forEach((il: string) => {
      doc.text(il, 20, mcY);
      mcY += 4;
    });

    curY += mcBoxH + 6;

    // Ruhun 3'lü Enkarnasyon Özü (Yükselen, Güneş, Ay)
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryDark);
    doc.text('RUHUN 3\'LÜ ENKARNASYON DOĞASI', 15, curY);
    curY += 5;

    const soulBoxW = 58;
    const soulBoxH = 26;
    const sCards = [
      { label: `Yükselen: ${data.soulCareer.soulAscendant.sign}`, text: data.soulCareer.soulAscendant.essence, color: purple },
      { label: `Güneş: ${data.soulCareer.soulSun.sign}`, text: data.soulCareer.soulSun.mission, color: gold },
      { label: `Ay: ${data.soulCareer.soulMoon.sign}`, text: data.soulCareer.soulMoon.emotionalNourishment, color: primaryDark }
    ];

    sCards.forEach((sc, scIdx) => {
      const scX = 15 + scIdx * 61;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(scX, curY, soulBoxW, soulBoxH, 2, 2, 'F');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...sc.color);
      doc.text(sc.label, scX + 4, curY + 6);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...charcoal);
      const scLines = doc.splitTextToSize(sc.text, soulBoxW - 8);
      scLines.slice(0, 3).forEach((scl: string, lIdx: number) => {
        doc.text(scl, scX + 4, curY + 12 + lIdx * 3.8);
      });
    });

    curY += soulBoxH + 7;

    // Ruhu Besleyen Kadersel Sektörler
    if (data.soulCareer.soulTopSectors && data.soulCareer.soulTopSectors.length > 0) {
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...purple);
      doc.text('RUHU BESLEYEN KADERSEL SEKTÖRLER', 15, curY);
      curY += 5;

      data.soulCareer.soulTopSectors.slice(0, 2).forEach((sSec, sIdx) => {
        ensureSpace(24);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, curY, 180, 20, 2, 2, 'F');

        doc.setFont('LiberationSans', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...purple);
        doc.text(`${sIdx + 1}. ${sSec.title} (%${sSec.percentage} Ruhsal Çağrı)`, 20, curY + 6);

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...charcoal);
        const sDesc = doc.splitTextToSize(sSec.description, 168);
        doc.text(sDesc[0] || '', 20, curY + 11);

        doc.setFont('LiberationSans', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...gold);
        doc.text(`Ruhsal Ustalık Dalları: ${sSec.recommendedRoles.join(', ')}`, 20, curY + 16);

        curY += 23;
      });
    }

    // Ruh-Madde Sentez Köprüsü
    ensureSpace(45);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
    doc.text('RUH - MADDE BÜTÜNSEL SENTEZ KÖPRÜSÜ', 15, curY);
    curY += 6;

    const bridge = data.soulCareer.soulMaterialBridge;
    curY = renderText(
      `**Madde Dünyası Kimliği:** ${bridge.materialIdentity}\n` +
      `**Ruhsal Çağrı:** ${bridge.soulCalling}\n\n` +
      `**Sentez Tavsiyesi:** ${bridge.synthesisAdvice}\n\n` +
      `⚠️ **Tatminsizlik Uyarısı:** ${bridge.unfulfillmentWarning}\n\n` +
      `🌿 **Kutsal Rutin (Günlük Ruhsal Uygulama):** ${bridge.dailySpiritualPractice}`,
      15, curY, 180, 6.0
    );
  }

  // ================= SAYFA 7: STRATEJİK GÜÇLER, SERVET, KORUMA & EYLEM PLANI =================
  doc.addPage();
  drawHeader();
  curY = 30;

  // 1. Kadersel Evrilme (Dharma)
  if (data.dharmaPath) {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...purple);
    doc.text('KADERSEL EVRİLME ROTASI (DHARMA - KUZEY DÜĞÜMÜ)', 15, curY);
    curY += 6;

    curY = renderText(
      `**Dharma Başlığı:** ${data.dharmaPath.title}\n\n` +
      `**Aşılması Gereken Konfor Alanı (Güney Düğüm Alışkanlıkları):** ${data.dharmaPath.fromComfortZone}\n\n` +
      `**Kadersel Büyüme Misyonu:** ${data.dharmaPath.toGrowthMission}\n\n` +
      `✨ **Kariyer Sıçraması:** ${data.dharmaPath.careerImpact}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // 2. Mesleki Süper Güç & Gölge Tuzaklar
  if (data.superPower || data.shadowPitfalls) {
    ensureSpace(35);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...gold);
    doc.text('MESLEKİ SÜPER GÜÇ VE GÖLGE TUZAKLAR (KÖR NOKTALAR)', 15, curY);
    curY += 6;

    curY = renderText(
      `⚡ **Mesleki Süper Gücünüz:** ${data.superPower}\n\n` +
      `⚠️ **Gölge Tuzaklar & Kör Noktalar:** ${data.shadowPitfalls}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // 3. Servet Mıknatısı
  if (data.wealthMagnet) {
    ensureSpace(28);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...gold);
    doc.text('SERVET MIKNATISI & FİNANSAL KALDIRAÇ STRATEJİNİZ', 15, curY);
    curY += 5;

    curY = renderText(
      `**Servet Kapısı:** ${data.wealthMagnet.channelTitle}\n` +
      `**İşleyiş Mekanizması:** ${data.wealthMagnet.mechanism}\n` +
      `**Uygulanabilir Formül:** ${data.wealthMagnet.practicalFormula}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // 4. Tükenmişlik Kalkanı
  if (data.burnoutShield) {
    ensureSpace(28);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text('TÜKENMİŞLİK KALKANI & MESLEKİ KORUMA REÇETESİ', 15, curY);
    curY += 5;

    curY = renderText(
      `**Temel Enerji Riski:** ${data.burnoutShield.coreRisk}\n` +
      `**Kaçınılması Gereken Toksik Ortamlar:** ${data.burnoutShield.toxicEnvironments}\n` +
      `**Koruma Formülü:** ${data.burnoutShield.protectionFormula}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // ==========================================
  // KADİM VE EZOTERİK 6 YENİ MESLEKİ MODÜL
  // ==========================================

  // Modül 1: Müzikal Enstrüman & Ses Yatkınlığı
  if (data.musicalAffinity) {
    ensureSpace(32);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(219, 39, 119); // Pink
    doc.text('MÜZİKAL ENSTRÜMAN, RİTİM & SES FREKANSI YATKINLIĞI', 15, curY);
    curY += 5;

    curY = renderText(
      `**Baskın Enstrüman Ailesi:** ${data.musicalAffinity.primaryInstrument.category} (${data.musicalAffinity.primaryInstrument.element})\n` +
      `**Rezonans & Nitelik:** ${data.musicalAffinity.primaryInstrument.essence}\n` +
      `**Uyumlu Enstrümanlar:** ${data.musicalAffinity.primaryInstrument.instruments.join(', ')}\n` +
      `**İkincil / Meditatif Frekans:** ${data.musicalAffinity.secondaryStyle.category} (${data.musicalAffinity.secondaryStyle.instruments.join(', ')})\n` +
      `**Vokal & Boğaz Çakrası:** ${data.musicalAffinity.vocalAptitude.style} — ${data.musicalAffinity.vocalAptitude.chakraResonance}\n` +
      `**Zihinsel Sıfırlanma Reçetesi:** ${data.musicalAffinity.musicalExpressionAdvice}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // Modül 2: El Becerisi & Zanaat Malzemesi Anatomisi
  if (data.craftsmanshipMaterial) {
    ensureSpace(32);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(217, 119, 6); // Amber
    doc.text('EL BECERİSİ & ZANAAT MALZEMESİ ANATOMİSİ', 15, curY);
    curY += 5;

    curY = renderText(
      `**Ustalık Unvanı:** ${data.craftsmanshipMaterial.craftsmanshipTitle}\n` +
      `**Baskın Madde:** ${data.craftsmanshipMaterial.primaryMaterial}\n` +
      `**Geleneksel El Aletleri:** ${data.craftsmanshipMaterial.toolsAndTechniques.join(', ')}\n` +
      `**Psikosomatik Şifa Gücü:** ${data.craftsmanshipMaterial.healingPower}\n` +
      `**Ticari Atölye Uygulamaları:** ${data.craftsmanshipMaterial.commercialApplications.join(' • ')}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // Modül 3: Kadersel Şans Noktası & Rızık Kapısı
  if (data.parsFortunaWealth) {
    ensureSpace(30);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text('KADERSEL ŞANS NOKTASI & RIZIK KAPISI (PARS FORTUNA)', 15, curY);
    curY += 5;

    curY = renderText(
      `**Konum & Kapı:** ${data.parsFortunaWealth.wealthPortalTitle}\n` +
      `**Kadersel Bereket Alanı:** ${data.parsFortunaWealth.karmicBlessingArea}\n` +
      `**Zahmetsiz Rızık Formülü:** ${data.parsFortunaWealth.practicalMonetizationGuidance}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // Modül 4: Ortaklık & Çalışma DNA'sı
  if (data.partnershipDna) {
    ensureSpace(30);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text('İŞ BİRLİĞİ & ORTAKLIK DNA’SI', 15, curY);
    curY += 5;

    curY = renderText(
      `**Çalışma Arketipi:** ${data.partnershipDna.archetype}\n` +
      `**İş Mottosu:** "${data.partnershipDna.motto}"\n` +
      `**Sinerji Şartı:** ${data.partnershipDna.synergyCondition}\n` +
      `**Toksik Ortaklık Riski:** ${data.partnershipDna.toxicPartnershipRisk}\n` +
      `**İdeal Takım Mimarisi:** ${data.partnershipDna.idealTeamStructure}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // Modül 5: Günün En Verimli Biyoritm & İmza Saatleri
  if (data.planetaryProductivityHours) {
    ensureSpace(30);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(202, 138, 4); // Yellow/Gold
    doc.text('GEZEGEN SAATLERİ & GÜNLÜK VERİMLİLİK BİYORİTMİ', 15, curY);
    curY += 5;

    curY = renderText(
      `**Yönetici Güç:** ${data.planetaryProductivityHours.rulingPlanet}\n` +
      `**🎯 Zihinsel Derin Odak Penceresi:** ${data.planetaryProductivityHours.peakMentalFocusWindow}\n` +
      `**✍️ Altın Müzakere & İmza Penceresi:** ${data.planetaryProductivityHours.goldenNegotiationWindow}\n` +
      `**🔋 Şarj & Arınma Penceresi:** ${data.planetaryProductivityHours.rechargeAndBurnoutPreventionWindow}\n` +
      `**⚡ Günlük Rutin Kuralı:** ${data.planetaryProductivityHours.dailyRoutineAdvice}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // Modül 6: Toplumsal İtibar & Sektörel Şöhret İmzası
  if (data.vocationalReputation) {
    ensureSpace(30);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text('TEPE NOKTASI (MC) & SEKTÖREL İTİBAR İMZASI', 15, curY);
    curY += 5;

    curY = renderText(
      `**İtibar Unvanı:** ${data.vocationalReputation.reputationTitle}\n` +
      `**Kamusal Arketip:** ${data.vocationalReputation.publicImageArchetype}\n` +
      `**Piyasanın Hatırlayacağı Saygın İz:** ${data.vocationalReputation.howIndustryRemembersYou}\n` +
      `**👑 Otorite Tetiği:** ${data.vocationalReputation.authorityTrigger}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  }

  // 5. Dünyevi Kariyer Eylem Planı (4 Somut Kural)
  if (data.actionableGuidance && data.actionableGuidance.length > 0) {
    ensureSpace(40);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
    doc.text('DÜNYEVİ KARİYER EYLEM PLANINIZ (4 STRATEJİK KURAL)', 15, curY);
    curY += 6;

    data.actionableGuidance.forEach((step, sIdx) => {
      ensureSpace(14);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, curY, 180, 11, 2, 2, 'F');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...gold);
      doc.text(`${sIdx + 1}`, 19, curY + 7);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...charcoal);
      const sLines = doc.splitTextToSize(step, 160);
      doc.text(sLines[0] || '', 25, curY + 7);

      curY += 13;
    });
  }

  // Footer Note
  ensureSpace(20);
  curY += 4;
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(15, curY, 180, 16, 2, 2, 'F');
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(
    'Bu analiz 7Layers Ezoterik & Kozmik Astroloji Motoru ile üretilmiştir. © 7Layers. Bütün hakları saklıdır.',
    105,
    curY + 9,
    { align: 'center' }
  );

  // Save the PDF
  const filename = `7Layers_Kariyer_Raporu_${(birthInfo.fullName || 'Danisan').replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
