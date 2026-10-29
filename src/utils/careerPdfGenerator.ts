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

  const primaryDark: [number, number, number] = [15, 23, 42]; // Slate 900 - Net Koyu / Siyah
  const cardDark: [number, number, number] = [248, 250, 252]; // Slate Light
  const gold: [number, number, number] = [71, 85, 105]; // Koyu Slate / Farklı vurgular için tok koyu ton
  const purple: [number, number, number] = [15, 23, 42]; // Net Koyu
  const charcoal: [number, number, number] = [15, 23, 42]; // Net Siyah metin
  const muted: [number, number, number] = [71, 85, 105]; // Slate 600 - Net okunaklı koyu gri

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
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.6);
    doc.line(15, 15, 195, 15);
    doc.line(15, 285, 195, 285);

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryDark);
    doc.text('7LAYERS | KARİYER & MESLEKİ YATKINLIK ANALİZİ', 15, 11);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
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
    lineHeight: number = 6.0
  ): number => {
    return drawTextWithBold(doc, text, x, y, maxWidth, lineHeight, 265, 30, drawHeader);
  };

  // ================= SAYFA 1: KAPAK & GENEL MİZAÇ BAKIŞI =================
  drawHeader();
  curY = 30;

  // Title Info
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryDark);
  doc.text(birthInfo.fullName || data.personalInfo.fullName, 15, curY);
  curY += 7;

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...muted);
  const formattedDate = birthInfo.birthDate ? birthInfo.birthDate.split('T')[0].split('-').reverse().join('.') : '';
  doc.text(`Doğum: ${formattedDate} ${birthInfo.birthTime || '12:00'} • ${birthInfo.cityName} (Yaş: ${data.careerTimeline?.currentAge || ''})`, 15, curY);
  curY += 6;

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryDark);
  doc.text(`İdeal Model: ${data.idealWorkModel.type} (%${data.idealWorkModel.percentage} Uyum)`, 15, curY);
  curY += 5;

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  doc.text(`Karar İlkesi: "${data.summaryBadges.decisionMotto}"`, 15, curY);
  curY += 9;

  // 4 Core Badges (Kutusuz temiz akış)
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryDark);
  doc.text('TEMEL MESLEKİ MİZAÇ GÖSTERGELERİ', 15, curY);
  curY += 6;

  const badges = [
    { title: 'Liderlik Tarzı', val: data.summaryBadges.leadershipStyle },
    { title: 'Çalışma Dinamiği', val: data.summaryBadges.workDynamic },
    { title: 'Temel Yetkinlik', val: data.summaryBadges.coreAsset },
    { title: 'Karar Mekanizması', val: data.summaryBadges.decisionMotto }
  ];

  badges.forEach((b) => {
    ensureSpace(12);
    curY = renderText(`**${b.title}:** ${b.val}`, 15, curY, 180, 5.6);
    curY += 2;
  });

  if (data.summaryBadges.decisionExplanation) {
    ensureSpace(22);
    curY = renderText(
      `**Stratejik Karar Kılavuzu:** ${data.summaryBadges.decisionExplanation.replace(/\n\n/g, ' ')}`,
      15, curY, 180, 5.5
    );
    curY += 3;
  }
  curY += 4;

  // İdeal Çalışma Modeli Açıklaması
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryDark);
  doc.text('BÜYÜK SENTEZ: İDEAL ÇALIŞMA MODELİNİZ', 15, curY);
  curY += 6;

  curY = renderText(data.idealWorkModel.explanation, 15, curY, 180, 6.0);
  curY += 6;

  // Kariyer Odak Stratejisi
  if (data.focusStrategy) {
    ensureSpace(30);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
    doc.text(`UZMANLAŞMA STRATEJİSİ: ${data.focusStrategy.type}`, 15, curY);
    curY += 6;

    curY = renderText(
      `**Motto:** ${data.focusStrategy.motto}\n\n${data.focusStrategy.explanation}\n\n**Stratejik Eylem:** ${data.focusStrategy.actionAdvice}`,
      15, curY, 180, 6.0
    );
  }

  // ================= SAYFA 2: SEKTÖREL POTANSİYEL & ENERJİ SPEKTRUMU =================
  doc.addPage();
  drawHeader();
  curY = 30;

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryDark);
  doc.text('SEKTÖREL POTANSİYEL & ENERJİ SPEKTRUMU (%100)', 15, curY);
  curY += 6;

  // Enerji Dağılımı Özeti (%100)
  if (data.energyDistribution && data.energyDistribution.segments.length > 0) {
    const segText = data.energyDistribution.segments
      .map(s => `**${s.title}:** %${s.percentage}`)
      .join('  •  ');
    curY = renderText(segText, 15, curY, 180, 5.5);
    curY += 6;
  }

  // 3 Ana Sektör (Kutusuz, tam sayfa genişliğinde)
  data.topSectors.forEach((sec, idx) => {
    ensureSpace(28);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryDark);
    doc.text(`${idx + 1}. ${sec.title} • Uyum: %${sec.fitScore}`, 15, curY);
    curY += 5;

    curY = renderText(
      `${sec.description}\n` +
      `**Öne Çıkan Roller:** ${sec.recommendedRoles.join(', ')}`,
      15, curY, 180, 5.8
    );
    curY += 6;
  });

  // Tamamlayıcı İkincil Sektörler
  if (data.secondarySectors && data.secondarySectors.length > 0) {
    ensureSpace(30);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...primaryDark);
    doc.text('TAMAMLAYICI & İKİNCİL SEKTÖR POTANSİYELLERİ', 15, curY);
    curY += 6;

    data.secondarySectors.forEach((sSec) => {
      ensureSpace(16);
      curY = renderText(
        `**• ${sSec.title} (%${sSec.percentage} Uyum):** Destekleyici Roller: ${sSec.recommendedRoles.join(', ')}`,
        15, curY, 180, 5.5
      );
      curY += 3;
    });
  }

  // ================= GEZEGENLERİN MESLEKİ DEŞİFRELERİ (TAM LİSTE) =================
  if (curY > 175) {
    doc.addPage();
    drawHeader();
    curY = 30;
  } else {
    ensureSpace(40);
    curY += 8;
  }

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryDark);
  doc.text('GEZEGENLERİN MESLEKİ DEŞİFRELERİ & ZANAAT DALLARI', 15, curY);
  curY += 5;

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);
  doc.text('Doğum haritanızdaki göksel yerleşimlerin çalışma tarzınıza, meslek yeteneklerinize ve zanaat dallarına yansıması:', 15, curY);
  curY += 7;

  // All planetary insights rendered completely
  data.planetaryInsights.forEach((ins) => {
    ensureSpace(24);
    curY = renderText(
      `**• ${ins.planet} (${ins.sign} - ${ins.house}. Ev): ${ins.title} [${ins.domain}]**\n` +
      `${ins.explanation}\n` +
      `**Yatkın Meslekler & Zanaat Dalları:** ${ins.suitableProfessions.join(', ')}`,
      15, curY, 180, 5.5
    );
    curY += 4;
  });

  // ================= KADERSEL ZAMAN ÇİZELGESİ & AKTİF EVRE =================
  if (data.careerTimeline) {
    if (curY > 175) {
      doc.addPage();
      drawHeader();
      curY = 30;
    } else {
      ensureSpace(40);
      curY += 8;
    }

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryDark);
    doc.text('KADERSEL KARİYER ZAMAN ÇİZELGESİ & AKTİF EVRENİZ', 15, curY);
    curY += 7;

    // Aktif Kadersel Evre (renderText ile satır sarma)
    const activeM = data.careerTimeline.activeMilestone;
    if (activeM) {
      ensureSpace(28);
      const cleanAge = activeM.ageRange.replace(/yaş/gi, '').trim();
      curY = renderText(
        `**ŞU ANKİ AKTİF EVRENİZ: ${activeM.title} [ ${cleanAge} Yaş • ${activeM.planetCycle} ]**\n` +
        `${activeM.description}\n` +
        `**Bu Evrenin Altın Kuralı:** ${activeM.actionGuidance}`,
        15, curY, 180, 5.8
      );
      curY += 6;
    }

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...primaryDark);
    doc.text('HAYAT BOYU KADERSEL KARİYER YOL HARİTASI (TÜM DÖNÜM YAŞLARI)', 15, curY);
    curY += 6;

    data.careerTimeline.milestones.forEach((ms) => {
      ensureSpace(18);
      const cleanAge = ms.ageRange.replace(/yaş/gi, '').trim();
      const statusLabel = ms.status === 'active' ? 'AKTİF EVRE' : ms.status === 'completed' ? 'TAMAMLANDI' : 'GELECEK EVRE';
      curY = renderText(
        `**• ${cleanAge} Yaş: ${ms.planetCycle.toUpperCase()} [${statusLabel}] — ${ms.title}**\n` +
        `${ms.description} - ${ms.actionGuidance}`,
        15, curY, 180, 5.5
      );
      curY += 4;
    });
  }

  // ================= İKİNCİL İLERLETİM (SECONDARY PROGRESSIONS) =================
  if (data.progressedCareer) {
    if (curY > 175) {
      doc.addPage();
      drawHeader();
      curY = 30;
    } else {
      ensureSpace(40);
      curY += 8;
    }

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryDark);
    doc.text('İKİNCİL İLERLETİM: İÇSEL KARİYER SAATİNİZ', 15, curY);
    curY += 5;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(`Astro-Seek Standardı • 1 Gün = 1 Yıl İlerletim Formülü (${data.progressedCareer.currentAge} Yaş İlerletimi)`, 15, curY);
    curY += 8;

    // 1. İlerletilmiş Güneş
    ensureSpace(24);
    const sun = data.progressedCareer.progressedSun;
    curY = renderText(
      `**1. İlerletilmiş Güneş (Mesleki Kimlik & Ego Evrimi)**\n` +
      `**Mevcut İlerletilmiş Konum:** ${sun.progressedSign} ${sun.degreeInSign}°${sun.minutes}' (Doğum Güneşi: ${sun.natalSign} ${sun.natalDegree}°)\n` +
      `**Dönüşüm Teması:** ${sun.identityShiftTheme}\n` +
      `**Geçiş Yaşı:** ${sun.shiftAge} yaş • Sonraki Burç: ${sun.nextShiftAge} yaş\n\n` +
      `${sun.explanation}`,
      15, curY, 180, 5.8
    );
    curY += 6;

    // 2. İlerletilmiş Ay
    ensureSpace(24);
    const moon = data.progressedCareer.progressedMoon;
    curY = renderText(
      `**2. İlerletilmiş Ay (2.5 Yıllık Mesleki Mevsim & Odak Evi)**\n` +
      `**Mevcut Konum:** ${moon.sign} ${moon.degreeInSign}°${moon.minutes}' • **Odak Alanı:** ${moon.natalHouse}. Ev\n` +
      `**Döngü Teması:** ${moon.cycleTheme}\n` +
      `**Tahmini Kalan Süre:** ~${moon.estimatedMonthsLeft} Ay\n\n` +
      `${moon.houseImpact}`,
      15, curY, 180, 5.8
    );
    curY += 6;

    // 3. İlerletilmiş Ay Fazı (30 Yıllık Döngü)
    ensureSpace(24);
    const phase = data.progressedCareer.progressedMoonPhase;
    curY = renderText(
      `**3. 30 Yıllık Kariyer Döngüsü: ${phase.name}**\n` +
      `**Döngü Mottosu:** "${phase.phaseMotto}" (Faz ${phase.phaseNumber}/8 • ${phase.elongationDegree}° Açı)\n\n` +
      `**Aşama Durumu:** ${phase.stageDescription}\n\n` +
      `**Kariyer Hasat Rehberi:** ${phase.careerHarvestGuidance}`,
      15, curY, 180, 5.8
    );
    curY += 6;

    // 4. İlerletilmiş Tepe Noktası (Solar Arc MC)
    if (data.progressedCareer.progressedMidheaven) {
      const mc = data.progressedCareer.progressedMidheaven;
      ensureSpace(24);
      curY = renderText(
        `**4. Toplumsal Statü & Unvan Evrimi (İlerletilmiş MC - ${mc.careerEvolutionTitle})**\n` +
        `${mc.explanation || 'Kariyerinizde yeni bir statü ve toplumsal görünürlük evresine geçiş.'}`,
        15, curY, 180, 5.8
      );
      curY += 6;
    }
  }

  // ================= 10 GEZEGENİN MESLEKİ & ZANAAT GÖSTERGELERİ =================
  if (data.planetaryInsights && data.planetaryInsights.length > 0) {
    if (curY > 175) {
      doc.addPage();
      drawHeader();
      curY = 30;
    } else {
      ensureSpace(40);
      curY += 8;
    }

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryDark);
    doc.text('GEZEGEN YERLEŞİMLERİNE GÖRE MESLEKİ & ZANAAT GÖSTERGELERİ', 15, curY);
    curY += 5;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text('Doğum haritanızdaki 10 temel kozmik gücün kamu memurluğu, zanaat, müzik, ticaret ve sahadaki yansımaları', 15, curY);
    curY += 8;

    data.planetaryInsights.forEach((pi) => {
      ensureSpace(24);
      curY = renderText(
        `**• ${pi.planet.toUpperCase()} (${pi.sign} - ${pi.house}. Ev) • ${pi.domain.toUpperCase()}: ${pi.title}**\n` +
        `${pi.explanation}\n` +
        `**Tavsiye Edilen Meslek Dalları:** ${pi.suitableProfessions.join(' • ')}`,
        15, curY, 180, 5.5
      );
      curY += 4;
    });
  }

  // ================= RUH HARİTASI (DRAKONİK KATMAN & RUHSAL ÇAĞRI) =================
  if (data.soulCareer) {
    if (curY > 175) {
      doc.addPage();
      drawHeader();
      curY = 30;
    } else {
      ensureSpace(45);
      curY += 8;
    }

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryDark);
    doc.text('2. RUH HARİTASI: DRAKONİK ÇAĞRI & RUHSAL KARİYER', 15, curY);
    curY += 6;

    // KADİM EZOTERİK İLKE MANİFESTOSU
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryDark);
    doc.text('KADİM EZOTERİK İLKE • ONTOLOJİK UYANIŞ ŞARTI (Hermetik & Gurdjieff Perspektifi)', 15, curY);
    curY += 5;

    curY = renderText(
      `**Ruhsal Çağrı Bir Zorunluluk Değil, Bilinçli Bir Uyanış Potansiyelidir**\n\n` +
      `Kadim Gnostik ve Hermetik öğretilerde insanoğlunun büyük çoğunluğu yaşamını 1. Katman olan Madde Dünyası içerisinde, biyolojik ve toplumsal matrix’in mekanik düzeninde tamamlar. Bu yaratılışın dengesini kuran doğal bir fazdır.\n\n` +
      `Drakonik (Ruh) Haritası, her insanda zorla çalışan bir mekanizma değil; yalnızca dünyevi statü ve paranın ötesindeki içsel sızıyı duyan, "Ben buraya sadece bu çarkı döndürmek için gelmedim" diyerek içsel kıvılcımını kristalleştiren bilinçler için aktifleşen yüksek oktavlı kadersel bir rehberdir. Uykuda olan bilinçler için bu katman sessiz bir tohum olarak bekler; rezonans duyanlar içinse gerçek hayat amacının kapısını açar.`,
      15, curY, 180, 5.8
    );
    curY += 6;

    // Drakonik MC
    ensureSpace(24);
    curY = renderText(
      `**Drakonik MC (Ruhsal Tepe Noktası): ${data.soulCareer.soulMidheaven.sign} - ${data.soulCareer.soulMidheaven.title}**\n` +
      `${data.soulCareer.soulMidheaven.calling}\n` +
      `**Kolektife Bırakılacak Manevi Etki:** ${data.soulCareer.soulMidheaven.impact}`,
      15, curY, 180, 5.8
    );
    curY += 6;

    // Ruhun 3'lü Enkarnasyon Doğası
    ensureSpace(30);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryDark);
    doc.text('RUHUN 3\'LÜ ENKARNASYON DOĞASI', 15, curY);
    curY += 5;

    curY = renderText(
      `**Yükselen (${data.soulCareer.soulAscendant.sign}):** ${data.soulCareer.soulAscendant.essence}\n` +
      `**Güneş (${data.soulCareer.soulSun.sign}):** ${data.soulCareer.soulSun.mission}\n` +
      `**Ay (${data.soulCareer.soulMoon.sign}):** ${data.soulCareer.soulMoon.emotionalNourishment}`,
      15, curY, 180, 5.8
    );
    curY += 6;

    // Ruhu Besleyen Kadersel Sektörler
    if (data.soulCareer.soulTopSectors && data.soulCareer.soulTopSectors.length > 0) {
      ensureSpace(28);
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...primaryDark);
      doc.text('RUHU BESLEYEN KADERSEL SEKTÖRLER', 15, curY);
      curY += 5;

      data.soulCareer.soulTopSectors.slice(0, 2).forEach((sSec, sIdx) => {
        ensureSpace(20);
        curY = renderText(
          `**${sIdx + 1}. ${sSec.title} (%${sSec.percentage} Ruhsal Çağrı):** ${sSec.description}\n` +
          `**Ruhsal Ustalık Dalları:** ${sSec.recommendedRoles.join(', ')}`,
          15, curY, 180, 5.8
        );
        curY += 4;
      });
    }

    // Ruh-Madde Sentez Köprüsü
    ensureSpace(45);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
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
      15, curY, 180, 5.8
    );
  }

  // ================= STRATEJİK GÜÇLER, SERVET, KORUMA & EYLEM PLANI =================
  if (curY > 175) {
    doc.addPage();
    drawHeader();
    curY = 30;
  } else {
    ensureSpace(40);
    curY += 8;
  }

  // 1. Kadersel Evrilme (Dharma)
  if (data.dharmaPath) {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
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
    doc.setTextColor(...primaryDark);
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
    doc.setTextColor(...primaryDark);
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
    doc.setTextColor(...primaryDark);
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
    doc.setTextColor(...primaryDark);
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
    doc.setTextColor(...primaryDark);
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
    doc.setTextColor(...primaryDark);
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
    doc.setTextColor(...primaryDark);
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
    doc.setTextColor(...primaryDark);
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
    doc.setTextColor(...primaryDark);
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

  // 5. Dünyevi Kariyer Eylem Planı (4 Somut Kural - KUTUSUZ)
  if (data.actionableGuidance && data.actionableGuidance.length > 0) {
    ensureSpace(35);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
    doc.text('DÜNYEVİ KARİYER EYLEM PLANINIZ (4 STRATEJİK KURAL)', 15, curY);
    curY += 6;

    data.actionableGuidance.forEach((step, sIdx) => {
      ensureSpace(18);
      curY = renderText(
        `**${sIdx + 1}. Kural:** ${step}`,
        15, curY, 180, 5.8
      );
      curY += 3;
    });
    curY += 4;
  }

  // ================= 7LAYERS DİĞER ANALİZLER & KEŞİF KARTI (VIRAL TANITIM ALANI) =================
  ensureSpace(72);
  curY += 3;

  const promoBoxY = curY;
  const promoBoxHeight = 64;

  // Şık Arka Plan Kartı
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, promoBoxY, 180, promoBoxHeight, 3, 3, 'FD');

  // Başlık
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryDark);
  doc.text('✨ 7LAYERS İLE YAŞAMINIZIN DİĞER SIRLARINI KEŞFEDİN', 105, promoBoxY + 7, { align: 'center' });

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('Kadim ezoterik ilimler ve modern analiz motorumuzla kader haritanızın diğer katmanlarını çözün:', 105, promoBoxY + 11.5, { align: 'center' });

  // 4 Adet Merak Uyandırıcı Analiz Maddesi
  let itemY = promoBoxY + 17;
  const promoItems = [
    {
      title: '🔮 Kadersel İlişki & Sinastri Uyumu:',
      desc: 'Partnerinizle aranızdaki bağ bir tesadüf mü, karmik bir borç mu? Bilinçaltı dinamikler ve ilişki kaderi.'
    },
    {
      title: '🌳 Kabala Yaşam Ağacı & Ruh Misyonu:',
      desc: 'Ruhunuz bu enkarnasyona hangi sınavı aşmak için geldi? 10 Sefirot ve 22 Yol ile hayatın asıl manevi amacı.'
    },
    {
      title: '🧬 Human Design (Bilinç & Enerji Tasarımı):',
      desc: 'Doğru kararları zihninizle mi alıyorsunuz? Gerçek enerji tipinizi, auranızı ve tükenmeden yaşama stratejinizi öğrenin.'
    },
    {
      title: '⏳ Kozmik Doğum Saati Tespiti (Rektifikasyon):',
      desc: 'Doğum saatinizi tam bilmiyorsanız, geçmiş kilit olaylarınızla gerçek doğum dakikanızı matematiksel olarak bulun.'
    }
  ];

  promoItems.forEach((item) => {
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryDark);
    doc.text(item.title, 19, itemY);

    const titleWidth = doc.getTextWidth(item.title);
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(item.desc, 19 + titleWidth + 1.5, itemY);

    itemY += 7.2;
  });

  // Call to Action (Ziyaret & Keşif Buton Bandı)
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(19, promoBoxY + promoBoxHeight - 11, 172, 8, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(8.5);
  doc.text('👉 Hemen Ziyaret Edin: www.7layers.tr  •  Kişiye Özel Derin Haritalar & Farkındalık Analizleri', 105, promoBoxY + promoBoxHeight - 6, { align: 'center' });

  curY = promoBoxY + promoBoxHeight + 5;

  // Telif Alt Notu
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Bu analiz 7Layers Ezoterik & Kozmik Astroloji Motoru ile üretilmiştir. © 7Layers. Bütün hakları saklıdır.',
    105,
    curY,
    { align: 'center' }
  );

  // Save the PDF
  const filename = `7Layers_Kariyer_Raporu_${(birthInfo.fullName || 'Danisan').replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
