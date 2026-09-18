import jsPDF from 'jspdf';
import type { IncarnationAnalysisResult } from '@/features/astrology/engine/IncarnationEngine';

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
  lineHeight: number = 7.5
): number => {
  let curX = x;
  let curY = y;
  
  const sanitizedText = text
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
      curY += lineHeight * newlineCount;
      continue;
    }
    if (part === '') continue;
    
    // Strip any rogue remaining asterisks so raw stars never leak to PDF
    const cleanWord = part.replace(/\*/g, '');
    if (!cleanWord && part !== '') continue;

    const wordWidth = doc.getTextWidth(cleanWord);
    if (curX + wordWidth > x + maxWidth && cleanWord.trim() !== '') {
      curX = x;
      curY += lineHeight;
    }
    
    doc.text(cleanWord, curX, curY);
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
    doc.setFontSize(11);
    doc.setTextColor(...gold);
    doc.text('7LAYERS | KOZMİK & RUHSAL ANALİZ MERKEZİ', 15, 11);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...muted);
    doc.text('Karmik & Enkarnasyon Raporu', 195, 11, { align: 'right' });
  };

  let curY = 0;

  const ensureSpace = (needed: number) => {
    if (curY + needed > 268) {
      doc.addPage();
      drawHeader();
      curY = 30;
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
  doc.setFontSize(13);
  doc.setTextColor(...white);
  doc.text('Geçmiş Yaşam & Ruhun Tekâmül Haritası', 105, 39, { align: 'center' });

  // Birth Details Box
  doc.setFillColor(...cardDark);
  doc.roundedRect(15, 47, 180, 26, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 47, 180, 26, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(...gold);
  doc.text('DOĞUM BİLGİLERİ:', 22, 57);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(...white);
  doc.text(`Tarih: ${birthInfo.localDate}   |   Saat: ${birthInfo.localTime}   |   Konum: ${birthInfo.cityName}, ${birthInfo.country}`, 22, 66);

  // Soul Maturity & Cosmic Frequency Summary Banner (Dynamic Height)
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10.5);
  const synthText = data.cosmicOrigin?.isStarseed
    ? `${data.soulMaturity.description} Kozmik Hiza: Ruhunuz dünyada derin bir geçmiş yaşam birikimine (${data.soulMaturity.tier} - ${data.soulMaturity.dominantElement} Elementi) sahip olmakla birlikte, kök bilinci ${data.cosmicOrigin.frequencyBadge} ile mühürlenmiş yüksek boyutlu bir elçidir.`
    : `${data.soulMaturity.description} Kozmik Hiza: Ruhunuz doğrudan Dünya gezegeninin kökleriyle rezonansta olan bilge bir Kadim Gaia Muhafızıdır.`;
  const mLines = doc.splitTextToSize(synthText, 166);
  const bannerHeight = 26 + (mLines.length * 5.2);

  doc.setFillColor(28, 36, 60);
  doc.roundedRect(15, 80, 180, bannerHeight, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, 80, 180, bannerHeight, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...gold);
  doc.text(`RUHSAL OLGUNLUK: ${data.soulMaturity.tier.toUpperCase()} (${data.soulMaturity.score}/100) - ${data.soulMaturity.dominantElement} ELEMENTİ`, 22, 89);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10.5);
  if (data.cosmicOrigin?.isStarseed) {
    doc.setTextColor(190, 220, 255);
    doc.text(`KOZMİK KÖKEN: YÜKSEK BOYUTLU VARLIK (STARSEED / IŞIK ELÇİSİ)`, 22, 96);
  } else {
    doc.setTextColor(160, 240, 180);
    doc.text(`KOZMİK KÖKEN: KADİM GAİA YERLİSİ (DÜNYA MUHAFIZI)`, 22, 96);
  }

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  doc.text(mLines, 22, 103);

  // SECTION 1: ÖNCEKİ ENKARNASYON & GAD
  curY = 80 + bannerHeight + 14;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...gold);
  doc.text('1. Önceki Yaşam & Kök Karmik Hafıza (GAD)', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 10;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(...white);
  doc.text(`Güney Ay Düğümü: ${data.gad.sign} Burcu (${data.gad.degreeInSign}°), ${data.gad.house}. Ev`, 15, curY);

  curY += 8;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...gold);
  doc.text(`Geçmiş Yaşam Arketipi: ${data.gad.info.archetype}`, 15, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13.5);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, `**Önceki Yaşam Rolü:** ${data.gad.info.pastLifeRole}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Konfor Alanı & Karmik Tuzak:** ${data.gad.info.comfortZoneTrap}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Geçmişten Taşınan Ruhsal Yetenek:** ${data.gad.info.karmicGift}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Karmik Cetvel (GAD Yöneticisi):** ${data.gad.karmicRuler.name} (${data.gad.karmicRuler.sign}, ${data.gad.karmicRuler.house}. Ev) - ${data.gad.karmicRuler.summary}`, 15, curY, 180, 7.5);

  if (data.gad.hdGate) {
    curY += 4;
    curY = drawTextWithBold(doc, `**Human Design Kapısı:** Kapı ${data.gad.hdGate.gate}.${data.gad.hdGate.line} (${data.gad.hdGate.title} - ${data.gad.hdGate.center} Merkezi) | ${data.gad.hdGate.lineArchetype}`, 15, curY, 180, 7.5);
    curY += 3;
    curY = drawTextWithBold(doc, `**HD Konfor Tuzağı:** ${data.gad.hdGate.shadowTrap}`, 15, curY, 180, 7.5);
    curY += 3;
    curY = drawTextWithBold(doc, `**HD Ruhsal Deha:** ${data.gad.hdGate.karmicGift}`, 15, curY, 180, 7.5);
  }

  // ================= PAGE 2 =================
  doc.addPage();
  drawHeader();

    // SECTION 2: 12. EV & SON NEFES
    curY = 30;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(...gold);
    doc.text('12. Ev Karmik Hafızası & Son Nefes Şartları', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 10;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(...white);
  doc.text(`12. Ev Burcu: ${data.twelfthHouse.sign} (Yönetici Gezegen: ${data.twelfthHouse.ruler})`, 15, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13.5);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, `**Son Nefes ve Kapanış Hissi:** ${data.twelfthHouse.lastBreathAtmosphere}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Bilinçaltı Koruma Armağanı:** ${data.twelfthHouse.subconsciousGift}`, 15, curY, 180, 7.5);

  curY += 4;
  curY = drawTextWithBold(doc, `**Gizli Karmik Korku:** ${data.twelfthHouse.hiddenFear}`, 15, curY, 180, 7.5);

  if (data.twelfthHouse.hdFearSynthesis) {
    curY += 4;
    curY = drawTextWithBold(doc, `**HD Karmik Korku Merkezi:** ${data.twelfthHouse.hdFearSynthesis.centerTitle}`, 15, curY, 180, 7.5);
    curY += 3;
    curY = drawTextWithBold(doc, `**Hücresel Son Nefes Travması:** ${data.twelfthHouse.hdFearSynthesis.traumaMechanism}`, 15, curY, 180, 7.5);
    curY += 3;
    curY = drawTextWithBold(doc, `**Özgürleşme Anahtarı:** ${data.twelfthHouse.hdFearSynthesis.liberationKey}`, 15, curY, 180, 7.5);
  }

  if (data.twelfthHouse.planetsIn12th.length > 0) {
    curY += 4;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...gold);
    doc.text('12. Evdeki Yerleşimler:', 15, curY);
    curY += 8;

    data.twelfthHouse.planetsIn12th.forEach(p => {
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(...white);
      curY = drawTextWithBold(doc, `• **${p.name} (${p.sign}):** ${p.meaning}`, 18, curY, 177, 7.2);
      curY += 3;
    });
  }

  // KARMİK ZAMAN TÜNELİ & DÜNYADAKİ ÇAĞ
  if (data.historicalEra) {
    ensureSpace(45);
    curY += 6;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14.5);
    doc.setTextColor(...gold);
    doc.text(`Karmik Zaman Tüneli: ${data.historicalEra.eraName}`, 15, curY);

    curY += 5.5;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 215, 0);
    doc.text(`Dönem & Çağ: ${data.historicalEra.century} (${data.historicalEra.timeSpan}) | Coğrafya: ${data.historicalEra.geographyCulture}`, 15, curY);

    curY += 6.5;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, `**Sosyal / Mesleki Rol:** ${data.historicalEra.archetypeRole}`, 15, curY, 180, 5.5);
    curY += 2.5;
    curY = drawTextWithBold(doc, `**Dönemin Atmosferi:** ${data.historicalEra.atmosphere}`, 15, curY, 180, 5.5);
    curY += 2.5;
    curY = drawTextWithBold(doc, `**Bilinçaltı İzi:** ${data.historicalEra.karmicImprint}`, 15, curY, 180, 5.5);
    curY += 2.5;
    curY = drawTextWithBold(doc, `**Ruhun Kök Hatırlayışı:** ${data.historicalEra.soulMemoryKey}`, 15, curY, 180, 5.5);
  }

  // ================= PAGE: KOZMİK RUH KÖKENİ & GALAKTİK İZİ (STARSEED) =================
  if (data.cosmicOrigin) {
    doc.addPage();
    drawHeader();

    curY = 30;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(...gold);
    doc.text('2. Kozmik Ruh Kökeni & Galaktik Yıldız Hizalanmaları', 15, curY);

    curY += 6;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.6);
    doc.line(15, curY, 195, curY);

    curY += 10;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(180, 200, 255);
    const starTitle = data.cosmicOrigin.isHybrid && data.cosmicOrigin.hybridTitle
      ? `Kozmik Ruh Kökeni: ${data.cosmicOrigin.hybridTitle} (Galaktik Melez)`
      : `Kozmik Ruh Kökeni: ${data.cosmicOrigin.starName}`;
    doc.text(starTitle, 15, curY);

    curY += 6;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(190, 220, 255);
    doc.text(`Frekans: ${data.cosmicOrigin.frequencyBadge} | Hiza: ${data.cosmicOrigin.connectedPoint}`, 15, curY);

    curY += 7;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, `**Kozmik Yaşam Misyonu:** ${data.cosmicOrigin.soulMission}`, 15, curY, 180, 6.0);
    curY += 3;
    curY = drawTextWithBold(doc, `**Kozmik Deha & Hediye:** ${data.cosmicOrigin.cosmicGift}`, 15, curY, 180, 6.0);
    curY += 3;
    curY = drawTextWithBold(doc, `**Hücresel Yabancılık & Sınav:** ${data.cosmicOrigin.earthlyChallenge}`, 15, curY, 180, 6.0);

    if (data.cosmicOrigin.secondaryStars && data.cosmicOrigin.secondaryStars.length > 0) {
      curY += 3;
      const secAlignmentsText = data.cosmicOrigin.secondaryStars
        .map(s => `${s.starName.split(' ')[0]} (${s.layer.includes('Bilinçdışı') ? 'Bilinçdışı Tasarım' : s.layer.includes('Drakonik') ? 'Drakonik' : s.layer.includes('Beriyah') ? '3. Harita' : 'Natal'}, ${s.orb}° orb)`)
        .join(' • ');
      curY = drawTextWithBold(doc, `**Katmanlar Arası Hizalanan Yıldızlar:** ${secAlignmentsText}`, 15, curY, 180, 5.8);
    }

    if (data.cosmicOrigin.royalStarsActive && data.cosmicOrigin.royalStarsActive.length > 0) {
      curY += 3;
      const royalText = data.cosmicOrigin.royalStarsActive
        .map(r => `${r.starName} (${r.layer.includes('Beriyah') ? '3. Harita' : r.layer.includes('Drakonik') ? 'Drakonik' : 'Natal'}, ${r.pointName}, ${r.orb}° orb)`)
        .join(' • ');
      doc.setTextColor(...gold);
      curY = drawTextWithBold(doc, `**Aktif Kraliyet Yıldızları (4 Melek Kalkanı):** ${royalText}`, 15, curY, 180, 5.8);
      doc.setTextColor(...white);
    }

    // Öne çıkan sabit yıldız temaslarının ezoterik tezahürleri
    if (data.cosmicOrigin.allAlignments && data.cosmicOrigin.allAlignments.length > 0) {
      const topInterpreted = data.cosmicOrigin.allAlignments
        .filter(a => !!a.interpretation)
        .slice(0, 3);
      if (topInterpreted.length > 0) {
        curY += 5;
        doc.setFont('LiberationSans', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...gold);
        doc.text('Öne Çıkan Sabit Yıldız İnisiyasyonları & Kadersel Tezahürü:', 15, curY);
        curY += 7;

        topInterpreted.forEach(align => {
          if (!align.interpretation) return;

          doc.setFont('LiberationSans', 'bold');
          doc.setFontSize(11.5);
          const starTitleLines = doc.splitTextToSize(`★ ${align.interpretation.title} (${align.orb}° orb - ${align.connectedPoint})`, 168);

          doc.setFont('LiberationSans', 'normal');
          doc.setFontSize(10.5);
          const meaningLines = doc.splitTextToSize(align.interpretation.esotericMeaning, 168);

          const lineHeight = 5.2;
          const cardHeight = 10 + (starTitleLines.length * 5.6) + (meaningLines.length * lineHeight) + 6;

          ensureSpace(cardHeight + 6);

          doc.setFillColor(...cardDark);
          doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'F');
          doc.setDrawColor(90, 110, 180);
          doc.setLineWidth(0.4);
          doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'D');

          let textY = curY + 6.5;
          doc.setFont('LiberationSans', 'bold');
          doc.setFontSize(11.5);
          doc.setTextColor(255, 215, 0);
          doc.text(starTitleLines, 20, textY);
          textY += (starTitleLines.length * 5.6) + 2;

          doc.setFont('LiberationSans', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(...white);
          doc.text(meaningLines, 20, textY);

          curY += cardHeight + 6;
        });
      }
    }
  }

  // ================= PAGE 3: KARMIC DEBTS =================
  doc.addPage();
  drawHeader();

  curY = 30;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...gold);
  doc.text('3. Karmik Borçlar (Retro Gezegenler) & Kiron', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 10;
  if (data.retroDebts.length === 0) {
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(13.5);
    doc.setTextColor(...white);
    doc.text('Haritanızda doğrudan retrogezegen karmik borcu bulunmamaktadır. Ruhunuz geçmiş borçlarını büyük ölçüde arındırmış ve bu yaşama temiz bir karmik sayfa ile başlamıştır.', 15, curY);
    curY += 20;
  } else {
    data.retroDebts.forEach(debt => {
      // Split each text line to fit within card width (168mm)
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(12);
      const titleStr = `${debt.planet} Rx: ${debt.title}${debt.polarityLabel ? ` [${debt.polarityLabel}]` : ''}`;
      const titleLines = doc.splitTextToSize(titleStr, 168);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(10.5);
      const hdDiagLines = debt.hdDiagnosis ? doc.splitTextToSize(`⚡ Human Design Teşhisi: ${debt.hdDiagnosis}`, 168) : [];

      doc.setFontSize(11);
      const pastLifeLines = doc.splitTextToSize(`Geçmiş Yaşam Nedeni: ${debt.pastLifeCause}`, 168);
      const currentKarmaLines = doc.splitTextToSize(`Bu Yaşamdaki Borç: ${debt.currentLifeKarma}`, 168);
      doc.setFont('LiberationSans', 'bold');
      const dharmaLines = doc.splitTextToSize(`Dharma Reçetesi: ${debt.dharmaRemedy}`, 168);

      const lineHeight = 5.4;
      const titleHeight = titleLines.length * 5.8;
      const hdHeight = hdDiagLines.length > 0 ? (hdDiagLines.length * 4.8 + 2.5) : 0;
      const totalTextLinesCount = pastLifeLines.length + currentKarmaLines.length + dharmaLines.length;
      
      const cardHeight = 10 + titleHeight + hdHeight + (totalTextLinesCount * lineHeight) + 8;

      ensureSpace(cardHeight + 6);

      // Card Background & Border
      doc.setFillColor(...cardDark);
      doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'F');
      doc.setDrawColor(230, 90, 90);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'D');

      let textY = curY + 7;
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...gold);
      doc.text(titleLines, 20, textY);
      textY += titleLines.length * 5.8 + 2;

      if (hdDiagLines.length > 0) {
        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(130, 210, 255);
        doc.text(hdDiagLines, 20, textY);
        textY += hdDiagLines.length * 4.8 + 2;
      }

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...white);
      doc.text(pastLifeLines, 20, textY);
      textY += pastLifeLines.length * lineHeight + 2;

      doc.text(currentKarmaLines, 20, textY);
      textY += currentKarmaLines.length * lineHeight + 2;

      doc.setFont('LiberationSans', 'bold');
      doc.setTextColor(110, 230, 160);
      doc.text(dharmaLines, 20, textY);

      curY += cardHeight + 6;
    });
  }

  // Chiron
  if (data.chiron) {
    ensureSpace(50);
    curY += 4;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...gold);
    doc.text(`Kiron (Karmik Ruh Yarası): ${data.chiron.sign} Burcu, ${data.chiron.house}. Ev`, 15, curY);

    curY += 9;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(13.5);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, `**Ruh Yarası:** ${data.chiron.wound.woundDescription}`, 15, curY, 180, 7.5);

    curY += 4;
    curY = drawTextWithBold(doc, `**Şifa Armağanı:** ${data.chiron.wound.healingGift}`, 15, curY, 180, 7.5);

    curY += 4;
    curY = drawTextWithBold(doc, `**Dönüşüm Anahtarı:** ${data.chiron.wound.soulRemedy}`, 15, curY, 180, 7.5);

    if (data.chiron.hdGate) {
      curY += 4;
      curY = drawTextWithBold(doc, `**HD Kiron Kapısı:** Kapı ${data.chiron.hdGate.gate}.${data.chiron.hdGate.line} (${data.chiron.hdGate.title} - ${data.chiron.hdGate.center} Merkezi) | ${data.chiron.hdGate.lineArchetype}`, 15, curY, 180, 7.5);
      curY += 3;
      curY = drawTextWithBold(doc, `**Yaranın HD Kökeni:** ${data.chiron.hdGate.woundKey}`, 15, curY, 180, 7.5);
      curY += 3;
      curY = drawTextWithBold(doc, `**HD Şifa Dehası:** ${data.chiron.hdGate.healingGift}`, 15, curY, 180, 7.5);
      curY += 3;
      curY = drawTextWithBold(doc, `**Dönüşüm Pratiği:** ${data.chiron.hdGate.transformationPractice}`, 15, curY, 180, 7.5);
    }
  }

  // ================= PAGE 4: DRACONIC CARDS =================
  doc.addPage();
  drawHeader();

  curY = 30;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...gold);
  doc.text('4. Drakonik Harita: Ruhun Asıl Özü', 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(...white);
  const dracDesc = 'Drakonik harita, Kuzey Ay Düğümü 0° Koç noktasına hizalanarak hesaplanan yüksek ruhsal boyut haritanızdır. Tropikal burcunuz dünyadaki maskeniz ve egonuz iken, Drakonik burcunuz ruhunuzun enkarnasyonlar ötesi öz titreşimidir.';
  curY = drawTextWithBold(doc, dracDesc, 15, curY, 180, 7.5);

  if (data.incarnationCross) {
    curY += 4;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11.5);
    const crossTitleLines = doc.splitTextToSize(`⚡ ENKARNASYON ÇAPRAZI: ${data.incarnationCross.title} ${data.incarnationCross.code}`, 168);
    const crossMissionLines = doc.splitTextToSize(`Ruhun Büyük Misyonu: ${data.incarnationCross.soulMission}`, 168);
    
    const crossBoxHeight = 16 + (crossTitleLines.length * 5.5) + (Math.min(2, crossMissionLines.length) * 5);
    ensureSpace(crossBoxHeight + 6);

    doc.setFillColor(...cardDark);
    doc.roundedRect(15, curY, 180, crossBoxHeight, 3, 3, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.6);
    doc.roundedRect(15, curY, 180, crossBoxHeight, 3, 3, 'D');

    let cY = curY + 7;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...gold);
    doc.text(crossTitleLines, 20, cY);
    cY += crossTitleLines.length * 5.5 + 2;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Açı Tipi: ${data.incarnationCross.angleType}`, 20, cY);
    cY += 6;

    doc.setTextColor(215, 225, 255);
    doc.text(crossMissionLines.slice(0, 2), 20, cY);

    curY += crossBoxHeight + 6;
  }

  curY += 6;

  // Render Draconic comparisons with dynamic card height & word wrap
  data.draconicComparison.forEach(comp => {
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.5);
    const tropLines = doc.splitTextToSize(`• Dünyevi Yüzünüz (${comp.tropicalSign}): ${comp.tropicalMeaning || comp.spiritualMeaning}`, 168);
    const dracLines = doc.splitTextToSize(`• Ruhsal Özünüz (${comp.draconicSign}): ${comp.draconicMeaning || comp.spiritualMeaning}`, 168);
    const synthLines = doc.splitTextToSize(`• Tekâmül Anahtarı: ${comp.synthesis || comp.spiritualMeaning}`, 168);

    const lineHeight = 5.2;
    const totalLines = tropLines.length + dracLines.length + synthLines.length;
    const cardHeight = 22 + (totalLines * lineHeight) + 6;

    ensureSpace(cardHeight + 6);

    doc.setFillColor(...cardDark);
    doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'D');

    // Card Header
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...gold);
    doc.text(comp.pointName, 20, curY + 7.5);

    // Tropical vs Draconic badges
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...white);
    doc.text(`Dünyevi (Tropikal): ${comp.tropicalSign} (${comp.tropicalDegree}°)`, 20, curY + 14.5);

    doc.setFont('LiberationSans', 'bold');
    doc.setTextColor(255, 215, 0);
    doc.text(`Ruhsal (Drakonik): ${comp.draconicSign} (${comp.draconicDegree}°)`, 105, curY + 14.5);

    let textY = curY + 21;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(215, 215, 225);
    doc.text(tropLines, 20, textY);
    textY += tropLines.length * lineHeight + 2;

    doc.setTextColor(190, 215, 255);
    doc.text(dracLines, 20, textY);
    textY += dracLines.length * lineHeight + 2;

    doc.setFont('LiberationSans', 'bold');
    doc.setTextColor(...gold);
    doc.text(synthLines, 20, textY);

    curY += cardHeight + 6;
  });

  // ================= PAGE 5: PROGRESSED EVOLUTION & INTERCEPTED SIGNS =================
  if (data.progressedEvolution?.hasSpecialLocks) {
    doc.addPage();
    drawHeader();

    curY = 30;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(...gold);
    doc.text('5. Karmik Kilitler & Ruhsal İnisiyasyon', 15, curY);

    curY += 6;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.6);
    doc.line(15, curY, 195, curY);

    curY += 8;

    // Aydınlanma Uyarısı
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(9.5);
    const alertLines = doc.splitTextToSize('Doğum haritanızda ruhsal tekâmülünüzü doğrudan mühürleyen özel bir karmik eşik/kilit tespit edilmiştir. Bu gösterge sıradan bir yerleşim değil, geçmiş yaşamlardan bu enkarnasyona taşınan gizli bir inisiyasyon sınavıdır.', 168);
    const alertBoxHeight = 10 + (alertLines.length * 4.8) + 4;

    doc.setFillColor(...cardDark);
    doc.roundedRect(15, curY, 180, alertBoxHeight, 3, 3, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, curY, 180, alertBoxHeight, 3, 3, 'D');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...gold);
    doc.text('Özel Karmik Aydınlanma Uyarısı:', 20, curY + 6);
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...white);
    doc.text(alertLines, 20, curY + 12);

    curY += alertBoxHeight + 6;

    // SADECE 28°-29° ANARATİK SINIR DERECESİ VARSA
    if (data.progressedEvolution.isCriticalDegree) {
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...white);
      doc.text(`Anaretik Eşik Durumu: ${data.progressedEvolution.badgeTitle}`, 15, curY);

      curY += 7;
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...white);
      curY = drawTextWithBold(doc, data.progressedEvolution.evolutionSummary, 15, curY, 180, 6);

      curY += 4;
      // Box for Natal vs Progressed Sun
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(9.5);
      const shiftNote = data.progressedEvolution.hasShifted
        ? `Ruhunuz ${data.progressedEvolution.progressedAge} yaşında kabuk değiştirerek ${data.progressedEvolution.progressedSunSign} bilincine evrilmiştir.`
        : `${data.progressedEvolution.progressedAge} yaşında Güneş sınırları aşarak ${data.progressedEvolution.progressedSunSign} burcuna sıçrayacaktır.`;
      const shiftLines = doc.splitTextToSize(shiftNote, 168);
      const sunBoxHeight = 17 + (shiftLines.length * 4.8) + 4;

      doc.setFillColor(...cardDark);
      doc.roundedRect(15, curY, 180, sunBoxHeight, 3, 3, 'F');
      doc.setDrawColor(80, 70, 140);
      doc.roundedRect(15, curY, 180, sunBoxHeight, 3, 3, 'D');

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(200, 180, 255);
      doc.text('Natal Güneş (Doğum Anı):', 20, curY + 6.5);
      doc.setFont('LiberationSans', 'normal');
      doc.setTextColor(...white);
      doc.text(`${data.progressedEvolution.natalSunSign} (${data.progressedEvolution.natalSunDegree}°${data.progressedEvolution.natalSunMinutes}')`, 75, curY + 6.5);

      doc.setFont('LiberationSans', 'bold');
      doc.setTextColor(...gold);
      doc.text('İlerletilmiş Güneş (Progressed):', 20, curY + 13);
      doc.setFont('LiberationSans', 'normal');
      doc.setTextColor(...white);
      doc.text(`${data.progressedEvolution.progressedSunSign} (Geçiş Yaşı: ${data.progressedEvolution.progressedAge} Yaş)`, 85, curY + 13);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...muted);
      doc.text(shiftLines, 20, curY + 19);

      curY += sunBoxHeight + 6;
    }

    // SADECE SIKIŞTIRILMIŞ BURÇLAR VARSA
    if (data.progressedEvolution.hasInterceptedSigns) {
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...gold);
      doc.text('Sıkıştırılmış Burçlar (Kilitli Sandıklar & Gizli Potansiyeller)', 15, curY);

      curY += 8;
      data.progressedEvolution.interceptedSigns.forEach(inter => {
        const polText = inter.polarityLabel ? ` [${inter.polarityLabel}]` : '';
        const titleText = `${inter.sign} Burcu (${inter.archetype}) - ${inter.house}. Evde Hapsolmuş${polText}`;

        doc.setFont('LiberationSans', 'bold');
        doc.setFontSize(11);
        const titleLines = doc.splitTextToSize(titleText, 168);

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(9.5);
        const hdLines = inter.hdDiagnosis ? doc.splitTextToSize(`HD Teşhisi: ${inter.hdDiagnosis}`, 168) : [];
        const causeLines = doc.splitTextToSize(`Geçmiş Kök Neden: ${inter.karmicRootCause}`, 168);
        const lockLines = doc.splitTextToSize(`Bilinçaltı Kilit: ${inter.lockedPsychology}`, 168);

        doc.setFont('LiberationSans', 'bold');
        const keyLines = doc.splitTextToSize(`Açılış Anahtarı: ${inter.unlockKey}`, 168);

        const lineHeight = 4.8;
        let cardHeight = 10 + (titleLines.length * 5.4);
        if (hdLines.length > 0) cardHeight += (hdLines.length * lineHeight) + 2;
        cardHeight += (causeLines.length * lineHeight) + 2;
        cardHeight += (lockLines.length * lineHeight) + 2;
        cardHeight += (keyLines.length * lineHeight) + 4;

        ensureSpace(cardHeight + 6);
        doc.setFillColor(...cardDark);
        doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'F');
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.3);
        doc.roundedRect(15, curY, 180, cardHeight, 3, 3, 'D');

        let textY = curY + 6.5;
        doc.setFont('LiberationSans', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...gold);
        doc.text(titleLines, 20, textY);
        textY += (titleLines.length * 5.4) + 1.5;

        if (hdLines.length > 0) {
          doc.setFont('LiberationSans', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(255, 215, 0);
          doc.text(hdLines, 20, textY);
          textY += (hdLines.length * lineHeight) + 2;
        }

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(255, 180, 180);
        doc.text(causeLines, 20, textY);
        textY += (causeLines.length * lineHeight) + 2;

        doc.setTextColor(255, 230, 180);
        doc.text(lockLines, 20, textY);
        textY += (lockLines.length * lineHeight) + 2;

        doc.setFont('LiberationSans', 'bold');
        doc.setTextColor(...white);
        doc.text(keyLines, 20, textY);

        curY += cardHeight + 6;
      });
    }
  }

  // ================= PAGE 6 (veya 5): DHARMA & NEXT LIFE =================
  doc.addPage();
  drawHeader();

  const dharmaPageTitleNum = data.progressedEvolution?.hasSpecialLocks ? '6' : '5';
  curY = 30;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...gold);
  doc.text(`${dharmaPageTitleNum}. Dharma & Gelecek Yaşam Tohumu (KAD)`, 15, curY);

  curY += 6;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(15, curY, 195, curY);

  curY += 10;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(...white);
  doc.text(`Kuzey Ay Düğümü: ${data.kad.sign} Burcu (${data.kad.degreeInSign}°), ${data.kad.house}. Ev`, 15, curY);

  curY += 9;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13.5);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, `**Bu Yaşamdaki Nihai Tekâmül Hedefi:** ${data.kad.seed.evolutionGoal}`, 15, curY, 180, 7.5);

  curY += 5;
  curY = drawTextWithBold(doc, `**Gelecek Enkarnasyon Potansiyeli:** ${data.kad.seed.nextIncarnationPotential}`, 15, curY, 180, 7.5);

  curY += 5;
  curY = drawTextWithBold(doc, `**Kutsal Ruhsal Pratik:** ${data.kad.seed.sacredPractice}`, 15, curY, 180, 7.5);

  if (data.kad.hdGate) {
    curY += 4;
    curY = drawTextWithBold(doc, `**Human Design KAD Kapısı:** Kapı ${data.kad.hdGate.gate}.${data.kad.hdGate.line} (${data.kad.hdGate.title} - ${data.kad.hdGate.center} Merkezi) | ${data.kad.hdGate.lineArchetype}`, 15, curY, 180, 7.5);
    curY += 3;
    curY = drawTextWithBold(doc, `**Evrimsel Rota:** ${data.kad.hdGate.evolutionPath}`, 15, curY, 180, 7.5);
    curY += 3;
    curY = drawTextWithBold(doc, `**Dharma Reçetesi:** ${data.kad.hdGate.actionableDharma}`, 15, curY, 180, 7.5);
  }

  if (data.incarnationCross) {
    curY += 6;
    ensureSpace(32);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...gold);
    doc.text(`Enkarnasyon Çaprazı: ${data.incarnationCross.title}`, 15, curY);

    curY += 6;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...white);
    curY = drawTextWithBold(doc, data.incarnationCross.soulMission, 15, curY, 180, 6.5);
  }

  curY += 8;
  ensureSpace(28);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...gold);
  doc.text('8. Ev: Boyut Geçişi & Ruhun Dönüşüm Kapısı', 15, curY);

  curY += 8;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(13.5);
  doc.setTextColor(...white);
  curY = drawTextWithBold(doc, data.eighthHouse.transformationGateway, 15, curY, 180, 7.5);

  // Bottom Notice
  curY += 12;
  ensureSpace(34);
  doc.setFillColor(25, 32, 50);
  doc.roundedRect(15, curY, 180, 30, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, curY, 180, 30, 3, 3, 'D');

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...muted);
  const disclaimer = 'Bu rapor; kadim Karmik Astroloji, Drakonik Ruh Haritası ve Human Design (Kapı, Merkez ve Enkarnasyon Çaprazı) kozmik hesaplamalarının hakiki bir sentezine dayanır. Bilinçaltınızın kök kalıplarını aydınlatmak ve tekâmül yolculuğunuzda size rehberlik etmek için hazırlanmıştır. Gelecek, özgür iradeniz ve yüksek bilincinizle şekillenen dinamik bir akıştır.';
  doc.text(doc.splitTextToSize(disclaimer, 172), 20, curY + 9);

  // Add Page Numbers on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text(`Sayfa ${i} / ${totalPages}`, 105, 291, { align: 'center' });
  }

  // Save File
  const filename = `7Layers_Karmik_Enkarnasyon_Raporu_${birthInfo.cityName}.pdf`;
  doc.save(filename);
};
