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

// Word-wrap text renderer that supports inline markdown bold formatting (**text**) and auto-pagination
const drawTextWithBold = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 7.5,
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
    
    // Strip any rogue remaining asterisks so raw stars never leak to PDF
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

  const primaryDark: [number, number, number] = [20, 25, 40]; // #141928 Deep Navy
  const cardDark: [number, number, number] = [248, 250, 252]; // #F8FAFC Light Card Background
  const gold: [number, number, number] = [184, 134, 11]; // #B8860B Rich Dark Gold
  const white: [number, number, number] = [31, 41, 55]; // #1F2937 High Contrast Charcoal Body (replaces invisible white)
  const muted: [number, number, number] = [100, 116, 139]; // #64748B Slate Muted

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
    lineHeight: number = 7.0
  ): number => {
    return drawTextWithBold(doc, text, x, y, maxWidth, lineHeight, 265, 30, drawHeader);
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

  const footnoteText = 'Ezoterik Not: Bu puan bir üstünlük ölçüsü veya ruhsal rütbe değildir; ruhun geçmiş enkarnasyonlardan devraldığı karmik ders, retro sorumluluk ve deneyim yoğunluğunu ifade eder.';
  const fnLines = doc.splitTextToSize(footnoteText, 166);

  const bannerHeight = 28 + (mLines.length * 5.2) + (fnLines.length * 4.4) + 4;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, 80, 180, bannerHeight, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, 80, 180, bannerHeight, 3, 3, 'D');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...gold);
  const maturityTitle = `RUHSAL OLGUNLUK: ${data.soulMaturity.tier.toUpperCase()} (${data.soulMaturity.score}/100) - ${data.soulMaturity.dominantElement} ELEMENTİ`;
  doc.text(doc.splitTextToSize(maturityTitle, 166), 22, 89);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10.5);
  if (data.cosmicOrigin?.isStarseed) {
    doc.setTextColor(30, 58, 138); // Deep Celestial Blue
    const starseedTitle = `KOZMİK KÖKEN: YÜKSEK BOYUTLU VARLIK (STARSEED / IŞIK ELÇİSİ)`;
    doc.text(doc.splitTextToSize(starseedTitle, 166), 22, 96);
  } else {
    doc.setTextColor(4, 120, 87); // Deep Gaia Emerald
    const gaiaTitle = `KOZMİK KÖKEN: KADİM GAİA YERLİSİ (DÜNYA MUHAFIZI)`;
    doc.text(doc.splitTextToSize(gaiaTitle, 166), 22, 96);
  }

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...white);
  doc.text(mLines, 22, 103);

  const fnY = 103 + (mLines.length * 5.2) + 4;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...gold);
  doc.text(fnLines, 22, fnY);

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
  curY = renderText(`Güney Ay Düğümü: ${data.gad.sign} Burcu (${data.gad.degreeInSign}°), ${data.gad.house}. Ev`, 15, curY, 180, 6.5);

  curY += 2;
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...gold);
  curY = renderText(`Geçmiş Yaşam Arketipi: ${data.gad.info.archetype}`, 15, curY, 180, 6.0);

  curY += 3;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...white);
  curY = renderText(`**Önceki Yaşam Rolü:** ${data.gad.info.pastLifeRole}`, 15, curY, 180, 6.8);
  curY += 3;
  curY = renderText(`**Konfor Alanı & Karmik Tuzak:** ${data.gad.info.comfortZoneTrap}`, 15, curY, 180, 6.8);
  curY += 3;
  curY = renderText(`**Geçmişten Taşınan Ruhsal Yetenek:** ${data.gad.info.karmicGift}`, 15, curY, 180, 6.8);
  curY += 3;
  curY = renderText(`**Karmik Cetvel (GAD Yöneticisi):** ${data.gad.karmicRuler.name} (${data.gad.karmicRuler.sign}, ${data.gad.karmicRuler.house}. Ev) - ${data.gad.karmicRuler.summary}`, 15, curY, 180, 6.8);

  if (data.gad.hdGate) {
    curY += 3;
    curY = renderText(`**Human Design Kapısı:** Kapı ${data.gad.hdGate.gate}.${data.gad.hdGate.line} (${data.gad.hdGate.title} - ${data.gad.hdGate.center} Merkezi) | ${data.gad.hdGate.lineArchetype}`, 15, curY, 180, 6.8);
    curY += 2.5;
    curY = renderText(`**HD Konfor Tuzağı:** ${data.gad.hdGate.shadowTrap}`, 15, curY, 180, 6.8);
    curY += 2.5;
    curY = renderText(`**HD Ruhsal Deha:** ${data.gad.hdGate.karmicGift}`, 15, curY, 180, 6.8);
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
  curY = renderText(`12. Ev Burcu: ${data.twelfthHouse.sign} (Yönetici Gezegen: ${data.twelfthHouse.ruler})`, 15, curY, 180, 6.5);

  curY += 3;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...white);
  curY = renderText(`**Son Nefes ve Kapanış Hissi:** ${data.twelfthHouse.lastBreathAtmosphere}`, 15, curY, 180, 6.8);
  curY += 3;
  curY = renderText(`**Bilinçaltı Koruma Armağanı:** ${data.twelfthHouse.subconsciousGift}`, 15, curY, 180, 6.8);
  curY += 3;
  curY = renderText(`**Gizli Karmik Korku:** ${data.twelfthHouse.hiddenFear}`, 15, curY, 180, 6.8);

  if (data.twelfthHouse.hdFearSynthesis) {
    curY += 3;
    curY = renderText(`**HD Karmik Korku Merkezi:** ${data.twelfthHouse.hdFearSynthesis.centerTitle}`, 15, curY, 180, 6.8);
    curY += 2.5;
    curY = renderText(`**Hücresel Son Nefes Travması:** ${data.twelfthHouse.hdFearSynthesis.traumaMechanism}`, 15, curY, 180, 6.8);
    curY += 2.5;
    curY = renderText(`**Özgürleşme Anahtarı:** ${data.twelfthHouse.hdFearSynthesis.liberationKey}`, 15, curY, 180, 6.8);
  }

  if (data.twelfthHouse.planetsIn12th.length > 0) {
    curY += 4;
    ensureSpace(25);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...gold);
    doc.text('12. Evdeki Yerleşimler:', 15, curY);
    curY += 7;

    data.twelfthHouse.planetsIn12th.forEach(p => {
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...white);
      curY = renderText(`• **${p.name} (${p.sign}):** ${p.meaning}`, 18, curY, 177, 6.5);
      curY += 2.5;
    });
  }

  // KARMİK ZAMAN TÜNELİ & DÜNYADAKİ ÇAĞ
  if (data.historicalEra) {
    ensureSpace(65);
    curY += 6;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(14.5);
    doc.setTextColor(...gold);
    const eraTitleLines = doc.splitTextToSize(`Karmik Zaman Tüneli: ${data.historicalEra.eraName}`, 180);
    doc.text(eraTitleLines, 15, curY);
    curY += (eraTitleLines.length * 6) + 1;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...gold);
    curY = renderText(`**Dönem & Çağ:** ${data.historicalEra.century} (${data.historicalEra.timeSpan}) | **Coğrafya:** ${data.historicalEra.geographyCulture}`, 15, curY, 180, 5.5);
    curY += 2;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...white);
    curY = renderText(`**Sosyal / Mesleki Rol:** ${data.historicalEra.archetypeRole}`, 15, curY, 180, 5.6);
    curY += 2;
    curY = renderText(`**Dönemin Atmosferi:** ${data.historicalEra.atmosphere}`, 15, curY, 180, 5.6);
    curY += 2;
    curY = renderText(`**Bilinçaltı İzi:** ${data.historicalEra.karmicImprint}`, 15, curY, 180, 5.6);
    curY += 2;
    curY = renderText(`**Ruhun Kök Hatırlayışı:** ${data.historicalEra.soulMemoryKey}`, 15, curY, 180, 5.6);
  }

  // ================= BÖLÜM 2: KOZMİK RUH KÖKENİ & GALAKTİK İZİ (STARSEED) =================
  if (data.cosmicOrigin) {
    ensureSpace(50);
    curY += 6;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(...gold);
    doc.text('2. Kozmik Ruh Kökeni & Galaktik Yıldız Hizalanmaları', 15, curY);

    curY += 6;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.6);
    doc.line(15, curY, 195, curY);

    // 2.0 KADİM SABİT YILDIZLAR & KRALİYET MUHAFIZLARI REHBERİ
    curY += 8;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...gold);
    doc.text('Kadim Sabit Yıldızlar, Sirius & Kraliyet Muhafızları Rehberi:', 15, curY);
    curY += 5;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...white);
    const wisdomGuide = 'Ezoterik astrolojide sabit yıldızlar, sıradan gezegen döngülerinin ötesinde ruhun evrensel hafızasını taşıyan "Kozmik Boyut Kapıları"dır. Kuran-ı Kerim\'de adı açıkça geçen tek yıldız olan Sirius (Şi\'ra - Necm 49), ilahi inisiyasyon ve yüksek şifa kaynağıdır. Pers ve Babil geleneğinde göğün dört ana yönünü bekleyen 4 Kraliyet Yıldızı (Regulus, Aldebaran, Antares, Fomalhaut) ise Dört Büyük Başmeleğin göksel muhafız kalkanını simgeler. Haritanızdaki bu temaslar, ruhunuzun bu enkarnasyona hangi kozmik yetki, ilahi koruma ve kadersel sınavlarla mühürlendiğini gösterir.';
    curY = renderText(wisdomGuide, 15, curY, 180, 5.4);
    curY += 6;

    // 2.1 BİRİNCİL KOZMİK RUH KÖKENİ
    ensureSpace(45);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(30, 58, 138); // Deep Celestial Blue
    const starTitle = data.cosmicOrigin.isHybrid && data.cosmicOrigin.hybridTitle
      ? `Kozmik Ruh Kökeni: ${data.cosmicOrigin.hybridTitle} (Galaktik Melez)`
      : `Kozmik Ruh Kökeni: ${data.cosmicOrigin.starName}`;
    const starTitleLines = doc.splitTextToSize(starTitle, 180);
    doc.text(starTitleLines, 15, curY);
    curY += (starTitleLines.length * 6) + 1;

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138); // Deep Celestial Blue
    curY = renderText(`**Frekans:** ${data.cosmicOrigin.frequencyBadge} | **Hiza:** ${data.cosmicOrigin.connectedPoint}`, 15, curY, 180, 5.6);
    curY += 3;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(...white);
    curY = renderText(`**Kozmik Yaşam Misyonu:** ${data.cosmicOrigin.soulMission}`, 15, curY, 180, 6.0);
    curY += 3;
    curY = renderText(`**Kozmik Deha & Hediye:** ${data.cosmicOrigin.cosmicGift}`, 15, curY, 180, 6.0);
    curY += 3;
    curY = renderText(`**Hücresel Yabancılık & Sınav:** ${data.cosmicOrigin.earthlyChallenge}`, 15, curY, 180, 6.0);
    curY += 5;

    // 2.2 ÖZEL BÖLÜM: 4 KRALİYET YILDIZI & BAŞMELEK KALKANLARI
    if (data.cosmicOrigin.royalStarsActive && data.cosmicOrigin.royalStarsActive.length > 0) {
      ensureSpace(50);
      curY += 4;
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(...gold);
      doc.text('👑 4 Kraliyet Yıldızı (Başmelek Muhafızları) Kalkanı', 15, curY);
      curY += 6;

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...white);
      const royalIntro = 'Haritanızda ilahi nizamın 4 büyük göksel muhafızından en az birinin mührü aktiftir. Bu yıldızlar ruhunuza muazzam bir kadersel yetki ve koruma verir; ancak her biri çok ağır ve tavizsiz bir ahlaki sınavla korunur:';
      curY = renderText(royalIntro, 15, curY, 180, 5.4);
      curY += 5;

      data.cosmicOrigin.royalStarsActive.forEach((royal) => {
        ensureSpace(45);
        const isRegulus = royal.starName.includes('Regulus');
        const isAldebaran = royal.starName.includes('Aldebaran');
        const isAntares = royal.starName.includes('Antares');
        const isFomalhaut = royal.starName.includes('Fomalhaut');

        let archangel = 'Kozmik Başmelek Kalkanı';
        let direction = 'Kraliyet Kapısı';
        let mandate = 'Yüksek kadersel sorumluluk ve ruhsal rehberlik yetkisi.';
        let testWarning = 'Gücü kötüye kullanmaktan, kibirden ve bencillikten mutlak arınma gereklidir.';

        if (isRegulus) {
          archangel = 'Başmelek Raphaël (Kuzey Gözcüsü - Şifa, Onur & Hakkaniyet)';
          direction = 'Kuzey Kraliyet Yıldızı (Aslan Kalbi)';
          mandate = 'Kitleleri arkasından sürükleyen doğal karizma, soylu duruş, liderlik kudreti ve ruhsal şifa elçiliği.';
          testWarning = 'İNTİKAM VE KİBİR TUZAĞI: Haklı bile olsanız asla intikam peşinde koşmamalı, güç zehirlenmesine kapılmamalısınız. İntikam arandığı anda kadersel tahttan düşüş kaçınılmazdır.';
        } else if (isAldebaran) {
          archangel = 'Başmelek Mikâil (Doğu Gözcüsü - Hakikat & Adalet Kılıcı)';
          direction = 'Doğu Kraliyet Yıldızı (Boğa Gözü)';
          mandate = 'Sarsılmaz söz kudreti, dürüstlük, hakikati en saf haliyle savunma ve ilahi adaleti yeryüzüne mühürleme yetisi.';
          testWarning = 'DÜRÜSTLÜK SINAVI: En ufak bir yalan, riya veya hileye başvurulduğunda ilahi sistem kişiyi derhal çok ağır kadersel sınavlara çeker.';
        } else if (isAntares) {
          archangel = 'Başmelek Uriel (Batı Gözcüsü - Dönüşüm Ateşi & Okült Simya)';
          direction = 'Batı Kraliyet Yıldızı (Akrep Kalbi)';
          mandate = 'Karanlığı ışığa dönüştürme, en derin krizleri ve yıkımları ilahi güce çevirme, ölüm ve yeniden doğum simyacılığı.';
          testWarning = 'TUTKU VE KİN SINAVI: Yıkıcı hırslardan, kıskançlıktan, insanları manipüle etmekten ve kindar takıntılardan mutlak arınma.';
        } else if (isFomalhaut) {
          archangel = 'Başmelek Cebrail (Güney Gözcüsü - Vahiy & Mistik İlham)';
          direction = 'Güney Kraliyet Yıldızı (Güney Balığı)';
          mandate = 'Mistik vizyonlar, durugörü, şiirsel/sanatsal deha ve manevi alemlerle dünya arasında ilahi bir köprü olma kabiliyeti.';
          testWarning = 'SAF NİYET SINAVI: Manevi hediyeleri dünyevi hırslar, büyü/okült manipülasyonlar veya bencilce çıkarlar için kullanmaktan mutlak sakınma.';
        }

        doc.setFont('LiberationSans', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...gold);
        doc.text(`👑 ${royal.starName} — ${direction}`, 15, curY);
        curY += 5;

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...muted);
        doc.text(`Başmelek: ${archangel}  |  Katman: ${royal.layer}  |  Nokta: ${royal.pointName} (${royal.orb}° orb)`, 15, curY);
        curY += 4.5;

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...white);
        curY = renderText(`**Kozmik Yetki & Ruhsal Görev:** ${mandate}`, 15, curY, 180, 5.8);
        curY += 2;
        curY = renderText(`**Kadersel İmtihan & İlahi Uyarı:** ${testWarning}`, 15, curY, 180, 5.8);
        curY += 4;

        doc.setDrawColor(...gold);
        doc.setLineWidth(0.3);
        doc.line(15, curY, 195, curY);
        curY += 5;
      });
    }

    // 2.3 TÜM AKTİF SABİT YILDIZ HİZALANMALARI (SINIRLAMA OLMAKSIZIN EKSİKSİZ)
    const starAlignments = (data.cosmicOrigin.allAlignments && data.cosmicOrigin.allAlignments.length > 0)
      ? data.cosmicOrigin.allAlignments.filter(a => !!a.interpretation)
      : (data.cosmicOrigin.secondaryStars || []).filter(a => !!a.interpretation);

    if (starAlignments.length > 0) {
      ensureSpace(50);
      curY += 4;
      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(...gold);
      doc.text('Katmanlar Arası Aktif Galaktik Sabit Yıldız Hizalanmaları', 15, curY);
      curY += 6;

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...white);
      const alignIntro = 'Doğum haritanızın 4 boyutunda (Fiziksel Natal, Drakonik Ruh Haritası, Human Design Bilinçdışı Tasarımı ve 9. Harmonik Beriyah Zihni) aktif olan sabit yıldız temaslarının kadersel açılımları:';
      curY = renderText(alignIntro, 15, curY, 180, 5.4);
      curY += 5;

      starAlignments.forEach((align) => {
        if (!align.interpretation) return;
        ensureSpace(48);

        const isRoyal = !!align.isRoyalStar;
        const isSirius = align.starName.includes('Sirius');
        const icon = isRoyal ? '👑' : isSirius ? '✨' : '★';

        doc.setFont('LiberationSans', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...gold);
        doc.text(`${icon} ${align.interpretation.title}`, 15, curY);
        curY += 5;

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...muted);
        doc.text(`Takımyıldız: ${align.constellation}  |  Katman: ${align.layer}  |  Nokta: ${align.connectedPoint} (${align.orb}° orb)`, 15, curY);
        curY += 4.5;

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...white);
        curY = renderText(`**🔮 Ezoterik Anlam & Kozmik Portal:** ${align.interpretation.esotericMeaning}`, 15, curY, 180, 5.8);
        curY += 2;
        curY = renderText(`**🌍 Hayattaki Tezahürü & Karakteristik Etkisi:** ${align.interpretation.lifeManifestation}`, 15, curY, 180, 5.8);
        curY += 2;
        curY = renderText(`**🧭 Ruhsal Görev & Kozmik Sınav:** ${align.interpretation.spiritualMission}`, 15, curY, 180, 5.8);
        curY += 4;

        doc.setDrawColor(220, 225, 235);
        doc.setLineWidth(0.3);
        doc.line(15, curY, 195, curY);
        curY += 5;
      });
    }
  }

  // ================= BÖLÜM 3: KARMIC DEBTS =================
  ensureSpace(50);
  curY += 6;
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
    doc.setFontSize(11);
    doc.setTextColor(...white);
    const noDebtText = 'Haritanızda doğrudan retrogezegen karmik borcu bulunmamaktadır. Ruhunuz geçmiş borçlarını büyük ölçüde arındırmış ve bu yaşama temiz bir karmik sayfa ile başlamıştır.';
    curY = renderText(noDebtText, 15, curY, 180, 6.5);
    curY += 8;
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
        doc.setTextColor(30, 58, 138);
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
      doc.setTextColor(4, 120, 87);
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
    curY = renderText(`Kiron (Karmik Ruh Yarası): ${data.chiron.sign} Burcu, ${data.chiron.house}. Ev`, 15, curY, 180, 6.5);

    curY += 3;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...white);
    curY = renderText(`**Ruh Yarası:** ${data.chiron.wound.woundDescription}`, 15, curY, 180, 6.8);
    curY += 3;
    curY = renderText(`**Şifa Armağanı:** ${data.chiron.wound.healingGift}`, 15, curY, 180, 6.8);
    curY += 3;
    curY = renderText(`**Dönüşüm Anahtarı:** ${data.chiron.wound.soulRemedy}`, 15, curY, 180, 6.8);

    if (data.chiron.hdGate) {
      curY += 3;
      curY = renderText(`**HD Kiron Kapısı:** Kapı ${data.chiron.hdGate.gate}.${data.chiron.hdGate.line} (${data.chiron.hdGate.title} - ${data.chiron.hdGate.center} Merkezi) | ${data.chiron.hdGate.lineArchetype}`, 15, curY, 180, 6.8);
      curY += 2.5;
      curY = renderText(`**Yaranın HD Kökeni:** ${data.chiron.hdGate.woundKey}`, 15, curY, 180, 6.8);
      curY += 2.5;
      curY = renderText(`**HD Şifa Dehası:** ${data.chiron.hdGate.healingGift}`, 15, curY, 180, 6.8);
      curY += 2.5;
      curY = renderText(`**Dönüşüm Pratiği:** ${data.chiron.hdGate.transformationPractice}`, 15, curY, 180, 6.8);
    }
  }

  // ================= BÖLÜM 4: DRACONIC CARDS =================
  ensureSpace(50);
  curY += 6;
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
  curY = renderText(dracDesc, 15, curY, 180, 7.0);

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
    doc.setTextColor(...white);
    doc.text(`Açı Tipi: ${data.incarnationCross.angleType}`, 20, cY);
    cY += 6;

    doc.setTextColor(30, 58, 138);
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
    doc.setTextColor(...gold);
    doc.text(`Ruhsal (Drakonik): ${comp.draconicSign} (${comp.draconicDegree}°)`, 105, curY + 14.5);

    let textY = curY + 21;
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...white);
    doc.text(tropLines, 20, textY);
    textY += tropLines.length * lineHeight + 2;

    doc.setTextColor(30, 58, 138);
    doc.text(dracLines, 20, textY);
    textY += dracLines.length * lineHeight + 2;

    doc.setFont('LiberationSans', 'bold');
    doc.setTextColor(...gold);
    doc.text(synthLines, 20, textY);

    curY += cardHeight + 6;
  });

  // ================= BÖLÜM 5: PROGRESSED EVOLUTION & INTERCEPTED SIGNS =================
  if (data.progressedEvolution?.hasSpecialLocks) {
    ensureSpace(50);
    curY += 6;
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
      doc.setFontSize(12.5);
      doc.setTextColor(...white);
      const anareticTitle = `Anaretik Eşik Durumu: ${data.progressedEvolution.badgeTitle}`;
      const anareticLines = doc.splitTextToSize(anareticTitle, 180);
      doc.text(anareticLines, 15, curY);
      curY += anareticLines.length * 6 + 2;
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
      doc.setTextColor(30, 58, 138);
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
      doc.setFontSize(13.5);
      doc.setTextColor(...gold);
      const interceptedTitle = 'Sıkıştırılmış Burçlar (Kilitli Sandıklar & Gizli Potansiyeller)';
      const interceptedLines = doc.splitTextToSize(interceptedTitle, 180);
      doc.text(interceptedLines, 15, curY);

      curY += interceptedLines.length * 6.5 + 2;
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
          doc.setTextColor(...gold);
          doc.text(hdLines, 20, textY);
          textY += (hdLines.length * lineHeight) + 2;
        }

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(185, 28, 28);
        doc.text(causeLines, 20, textY);
        textY += (causeLines.length * lineHeight) + 2;

        doc.setTextColor(180, 83, 9);
        doc.text(lockLines, 20, textY);
        textY += (lockLines.length * lineHeight) + 2;

        doc.setFont('LiberationSans', 'bold');
        doc.setTextColor(...white);
        doc.text(keyLines, 20, textY);

        curY += cardHeight + 6;
      });
    }
  }

  // ================= BÖLÜM 6 (veya 5): DHARMA & NEXT LIFE =================
  ensureSpace(50);
  const dharmaPageTitleNum = data.progressedEvolution?.hasSpecialLocks ? '6' : '5';
  curY += 6;
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
  curY = renderText(`Kuzey Ay Düğümü: ${data.kad.sign} Burcu (${data.kad.degreeInSign}°), ${data.kad.house}. Ev`, 15, curY, 180, 6.5);

  curY += 4;
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...white);
  curY = renderText(`**Bu Yaşamdaki Nihai Tekâmül Hedefi:** ${data.kad.seed.evolutionGoal}`, 15, curY, 180, 6.8);
  curY += 3;
  curY = renderText(`**Gelecek Enkarnasyon Potansiyeli:** ${data.kad.seed.nextIncarnationPotential}`, 15, curY, 180, 6.8);
  curY += 3;
  curY = renderText(`**Kutsal Ruhsal Pratik:** ${data.kad.seed.sacredPractice}`, 15, curY, 180, 6.8);

  if (data.kad.hdGate) {
    curY += 3;
    curY = renderText(`**Human Design KAD Kapısı:** Kapı ${data.kad.hdGate.gate}.${data.kad.hdGate.line} (${data.kad.hdGate.title} - ${data.kad.hdGate.center} Merkezi) | ${data.kad.hdGate.lineArchetype}`, 15, curY, 180, 6.8);
    curY += 2.5;
    curY = renderText(`**Evrimsel Rota:** ${data.kad.hdGate.evolutionPath}`, 15, curY, 180, 6.8);
    curY += 2.5;
    curY = renderText(`**Dharma Reçetesi:** ${data.kad.hdGate.actionableDharma}`, 15, curY, 180, 6.8);
  }

  if (data.incarnationCross) {
    curY += 6;
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...gold);
    const crossTitle = `Enkarnasyon Çaprazı: ${data.incarnationCross.title}`;
    const crossTitleLines = doc.splitTextToSize(crossTitle, 180);
    ensureSpace(crossTitleLines.length * 6.5 + 30);
    doc.text(crossTitleLines, 15, curY);
    curY += crossTitleLines.length * 6.5 + 3;

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
  doc.setFillColor(241, 245, 249);
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
