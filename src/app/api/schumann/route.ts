import { json, errorJson, preflight } from '@/lib/http/cors';
import sharp from 'sharp';
import { db } from '@/db/client';
import * as schema from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}


function getCosmicImpactStatusInfo(score: number) {
  if (score < 3.0) {
    return {
      label: 'Dengeli & Dingin Akış (Sakin)',
      desc: 'Uzay havası oldukça sakin ve Dünya manyetik kalkanı koruyucu fazda. Bedenin enerjisel alanı dengeli. Zihinsel odaklanma, iç gözlem ve derin dinlenme çalışmaları için mükemmel bir zemin. Dinginlik meditasyonlarına odaklanabilirsiniz.'
    };
  } else if (score < 5.0) {
    return {
      label: 'Hafif Enerjisel Dalgalanma (Uyarılmış)',
      desc: 'Manyetik kalkan veya güneş rüzgarı düzeyinde hafif bir uyanış var. Enerji alanınızda (aura) hafif genişleme ve duyarlılık artışı hissedilebilir. Topraklama, hafif nefes pratikleri ve prana dengeleme çalışmaları için ideal bir geçiş süreci.'
    };
  } else if (score < 7.0) {
    return {
      label: 'Yüksek Kozmik Uyarılma (Aktif)',
      desc: 'Dünya manyetik kalkanındaki açılmalar veya hızlanan güneş rüzgarı nedeniyle elektromanyetik alan aktif durumda. Rüyaların berraklaşması, sezgilerin güçlenmesi ve psişik duyarlılık olasıdır. Üçüncü göz çalışmaları ve kristal şifa pratikleri için çok elverişli.'
    };
  } else if (score < 8.5) {
    return {
      label: 'Yoğun Enerji Portalı (Giriş Aktif)',
      desc: 'Güneş rüzgarı ve açık manyetik kalkan (Bz Güney yönlü) nedeniyle yüksek frekanslı bilgi paketleri doğrudan iyonosfere akıyor. Uykusuzluk veya fiziksel hassasiyetler olarak yansıyan bu etki; DNA aktivasyon niyetleri ve yüksek benlikle bağ kurmak için olağanüstü bir portaldır.'
    };
  } else {
    return {
      label: 'Ekstrem Hücresel Entegrasyon (Zirve)',
      desc: 'Maksimum seviyede elektromanyetik uyarım ve ışık portalı! Kolektif bilinçte yoğun bir vites değişimi. Bu yoğun enerji altında kendinizi zorlamadan sessizce uzanıp taç ve kalp çakralarınızdan akan beyaz ışığı imgeleyerek derin meditasyon yapmanız önerilir.'
    };
  }
}

async function generateRulesAnalysis(score: number, a1: number, f1: number) {
  try {
    const rules = await db.select().from(schema.schumannRules);
    const sortedRules = rules.sort((a, b) => parseFloat(a.minScore) - parseFloat(b.minScore));

    let matchedRule = sortedRules[0];
    for (const rule of sortedRules) {
      if (score >= parseFloat(rule.minScore)) {
        matchedRule = rule;
      }
    }

    if (!matchedRule) {
      return {
        title: 'Dingin Elektromanyetik Akış (Sakin Faz)',
        science: `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana frekansı ${f1.toFixed(2)} Hz (Genlik A1: ${a1.toFixed(1)}) seviyesinde dengeli ve doğal titreşiminde seyrediyor. İyonosfer tabakası sakin durumda.`,
        symptoms: 'Zihinsel netlik, dengeli enerji seviyeleri, sakin uyku düzeni ve bedensel rahatlık. Olağanüstü bir uyarılma belirtisi beklenmez.',
        spiritual: 'Zihnin gürültüsünü yatıştırmak, yeni bilgiler öğrenmek, kadim dersleri çalışmak ve kök çakra meditasyonları yapmak için en ideal dönemdir. Enerjinizin merkezlendiği bu dingin zamanı tefekkür ile değerlendirebilirsiniz.'
      };
    }

    let scienceText = matchedRule.science;
    if (parseFloat(matchedRule.minScore) >= 9.0) {
      scienceText = `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana mod genliği (A1) tarihi zirvesine ulaşarak ${a1.toFixed(1)} seviyesine çıktı. Frekans ${f1.toFixed(2)} Hz düzeyinde ekstrem titreşiyor. İyonosfer tabakası tam doygunluk sınırında elektrik yüküyle yüklü.`;
    } else if (parseFloat(matchedRule.minScore) >= 8.0) {
      scienceText = `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana mod genliği (A1) ekstrem bir yükselişle ${a1.toFixed(1)} seviyesine ulaştı. Frekans ${f1.toFixed(2)} Hz düzeyinde seyrediyor. İyonosfer tabakası çok yüksek manyetik basınç altında.`;
    } else if (parseFloat(matchedRule.minScore) >= 7.0) {
      scienceText = `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana mod genliği (A1) sıradışı bir sıçramayla ${a1.toFixed(1)} seviyesine ulaştı. Frekans ${f1.toFixed(2)} Hz civarında seyrediyor. İyonosfer tabakası yoğun bir elektrik yüküyle titreşiyor.`;
    } else if (parseFloat(matchedRule.minScore) >= 5.0) {
      scienceText = `Tomsk Rasathanesi verilerinde Schumann Rezonansı genliği (A1) yüksek uyarım göstererek ${a1.toFixed(1)} seviyesine ulaştı. Frekans ${f1.toFixed(2)} Hz olarak iyonosferik dalgalanmaları tetikliyor.`;
    } else if (parseFloat(matchedRule.minScore) >= 3.0) {
      scienceText = `Schumann Rezonansı ana mod genliği (A1) ${a1.toFixed(1)} seviyesine çıkarak hafif bir hareketlenme gösteriyor. Frekans ${f1.toFixed(2)} Hz civarında stabil seyrediyor.`;
    } else {
      scienceText = `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana frekansı ${f1.toFixed(2)} Hz (Genlik A1: ${a1.toFixed(1)}) seviyesinde dengeli ve doğal titreşiminde seyrediyor. İyonosfer tabakası sakin durumda.`;
    }

    return {
      title: matchedRule.title,
      science: scienceText,
      symptoms: matchedRule.symptoms,
      spiritual: matchedRule.spiritual,
    };
  } catch (err) {
    console.error('Error fetching schumann rules from DB:', err);
    return {
      title: 'Dingin Elektromanyetik Akış (Sakin Faz)',
      science: `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana frekansı ${f1.toFixed(2)} Hz (Genlik A1: ${a1.toFixed(1)}) seviyesinde dengeli ve doğal titreşiminde seyrediyor. İyonosfer tabakası sakin durumda.`,
      symptoms: 'Zihinsel netlik, dengeli enerji seviyeleri, sakin uyku düzeni ve bedensel rahatlık. Olağanüstü bir uyarılma belirtisi beklenmez.',
      spiritual: 'Zihnin gürültüsünü yatıştırmak, yeni bilgiler öğrenmek, kadim dersleri çalışmak ve kök çakra meditasyonları yapmak için en ideal dönemdir. Enerjinizin merkezlendiği bu dingin zamanı tefekkür ile değerlendirebilirsiniz.'
    };
  }
}


interface RealSchumannRow {
  time_tomsk: string;
  time_utc: string;
  a1: number;
  f1: number;
  q1: number;
  a2: number;
  f2: number;
  q2: number;
  a3: number;
  f3: number;
  q3: number;
  a4: number;
  f4: number;
  q4: number;
}

const getSchumannScoreFromA1 = (a1: number): number => {
  if (a1 <= 0) return 0.5;
  if (a1 < 8.0) {
    return parseFloat((0.5 + (a1 / 8.0) * 2.4).toFixed(2));
  } else if (a1 < 15.0) {
    return parseFloat((3.0 + ((a1 - 8.0) / 7.0) * 1.9).toFixed(2));
  } else if (a1 < 25.0) {
    return parseFloat((5.0 + ((a1 - 15.0) / 10.0) * 0.9).toFixed(2));
  } else if (a1 < 40.0) {
    return parseFloat((6.0 + ((a1 - 25.0) / 15.0) * 0.9).toFixed(2));
  } else if (a1 < 55.0) {
    return parseFloat((7.0 + ((a1 - 40.0) / 15.0) * 0.9).toFixed(2));
  } else if (a1 < 70.0) {
    return parseFloat((8.0 + ((a1 - 55.0) / 15.0) * 0.9).toFixed(2));
  } else {
    return parseFloat((9.0 + Math.min(1.0, ((a1 - 70.0) / 30.0) * 1.0)).toFixed(2));
  }
};

async function fetchRealSchumannData(): Promise<RealSchumannRow | null> {
  const tomskOffset = 7 * 60 * 60 * 1000;
  const nowTomsk = new Date(Date.now() + tomskOffset);
  
  const getFilename = (date: Date) => {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}.afq`;
  };

  const currentFilename = getFilename(nowTomsk);
  const prevFilename = getFilename(new Date(nowTomsk.getTime() - 24 * 60 * 60 * 1000));

  const tryFetch = async (filename: string): Promise<string | null> => {
    try {
      const url = `https://sos70.ru/images/${filename}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        next: { revalidate: 180 } // Cache for 3 minutes
      });
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      console.error(`Error fetching .afq file ${filename}:`, e);
    }
    return null;
  };

  let dataText = await tryFetch(currentFilename);
  if (!dataText) {
    console.log(`Current day's .afq file not found, falling back to previous day: ${prevFilename}`);
    dataText = await tryFetch(prevFilename);
  }

  if (!dataText) return null;

  try {
    const lines = dataText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith('2'));

    if (lines.length === 0) return null;

    const lastLine = lines[lines.length - 1];
    const parts = lastLine.split(/\s+/);
    if (parts.length < 14) return null;

    const time_tomsk = `${parts[0]} ${parts[1]}`;
    const utcDate = new Date(`${parts[0]}T${parts[1]}:00+07:00`);
    const time_utc = utcDate.toISOString();

    return {
      time_tomsk,
      time_utc,
      a1: parseFloat(parts[2]) || 0,
      f1: parseFloat(parts[3]) || 0,
      q1: parseFloat(parts[4]) || 0,
      a2: parseFloat(parts[5]) || 0,
      f2: parseFloat(parts[6]) || 0,
      q2: parseFloat(parts[7]) || 0,
      a3: parseFloat(parts[8]) || 0,
      f3: parseFloat(parts[9]) || 0,
      q3: parseFloat(parts[10]) || 0,
      a4: parseFloat(parts[11]) || 0,
      f4: parseFloat(parts[12]) || 0,
      q4: parseFloat(parts[13]) || 0,
    };
  } catch (parseErr) {
    console.error('Error parsing .afq file:', parseErr);
    return null;
  }
}

async function detectFlaresFromImage(): Promise<{ 
  score: number; 
  peakA1: number; 
  score24h: number; 
  peakA124h: number; 
} | null> {
  try {
    const url = 'https://sos70.ru/provider.php?file=shm.jpg';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://sos70.ru/'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!res.ok) return null;
    
    const buffer = Buffer.from(await res.arrayBuffer());
    const image = sharp(buffer);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    
    const dataStartX = 60;
    const dataEndX = info.width - 10;
    const bgRegions = [
      { start: 55, end: 85 },   // 2 - 5 Hz
      { start: 130, end: 155 }, // 10 - 12.5 Hz
      { start: 190, end: 215 }  // 16 - 18.5 Hz
    ];
    
    let minBr = 255;
    let maxBr = 0;
    const colBrightnesses: number[] = [];
    
    for (let x = dataStartX; x <= dataEndX; x++) {
      let sumBr = 0;
      let count = 0;
      for (const reg of bgRegions) {
        for (let y = reg.start; y <= reg.end; y++) {
          const idx = (y * info.width + x) * info.channels;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const br = 0.299 * r + 0.587 * g + 0.114 * b;
          sumBr += br;
          count++;
        }
      }
      const avgBr = sumBr / count;
      colBrightnesses.push(avgBr);
      if (avgBr < minBr) minBr = avgBr;
      if (avgBr > maxBr) maxBr = avgBr;
    }
    
    // 1. Find the latest column index that has actual signal (avoiding empty black timezone buffer)
    let latestDataIndex = colBrightnesses.length - 1;
    for (let i = colBrightnesses.length - 1; i >= 1; i--) {
      if (colBrightnesses[i] > 15.0 && colBrightnesses[i - 1] > 15.0) {
        latestDataIndex = i;
        break;
      }
    }

    // Calculate current / latest average around the latest data point
    let latestSum = 0;
    let latestCount = 0;
    const startIndex = Math.max(0, latestDataIndex - 5);
    const endIndex = latestDataIndex;
    for (let i = startIndex; i <= endIndex; i++) {
      latestSum += colBrightnesses[i];
      latestCount++;
    }
    const latestAvg = latestCount > 0 ? (latestSum / latestCount) : 4.0;
    
    // 2. Calculate the overall peak in the last 24 hours (maximum column in the chart, ignoring margins)
    let maxOverallBr = 4.0;
    const safeStart = Math.min(20, colBrightnesses.length);
    const safeEnd = Math.max(0, colBrightnesses.length - 10);
    for (let i = safeStart; i < safeEnd; i++) {
      if (colBrightnesses[i] > maxOverallBr) {
        maxOverallBr = colBrightnesses[i];
      }
    }

    const getA1FromBrightness = (avgBr: number): number => {
      if (avgBr <= 15.0) {
        return parseFloat((4.0 + (avgBr / 15.0) * 4.0).toFixed(1));
      } else if (avgBr <= 40.0) {
        return parseFloat((8.0 + ((avgBr - 15.0) / 25.0) * 7.0).toFixed(1));
      } else if (avgBr <= 80.0) {
        return parseFloat((15.0 + ((avgBr - 40.0) / 40.0) * 10.0).toFixed(1));
      } else if (avgBr <= 120.0) {
        return parseFloat((25.0 + ((avgBr - 80.0) / 40.0) * 15.0).toFixed(1));
      } else if (avgBr <= 160.0) {
        return parseFloat((40.0 + ((avgBr - 120.0) / 40.0) * 15.0).toFixed(1));
      } else if (avgBr <= 200.0) {
        return parseFloat((55.0 + ((avgBr - 160.0) / 40.0) * 15.0).toFixed(1));
      } else {
        return parseFloat((70.0 + Math.min(20.0, ((avgBr - 200.0) / 55.0) * 20.0)).toFixed(1));
      }
    };

    const peakA1 = getA1FromBrightness(latestAvg);
    const score = getSchumannScoreFromA1(peakA1);
    
    const peakA124h = getA1FromBrightness(maxOverallBr);
    const score24h = getSchumannScoreFromA1(peakA124h);

    return {
      score: score,
      peakA1: peakA1,
      score24h: score24h,
      peakA124h: peakA124h
    };
  } catch (err) {
    console.error('Error detecting flares from image:', err);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const simulatedA1Param = searchParams.get('simulatedA1');
    const hasSimulatedA1 = simulatedA1Param !== null && simulatedA1Param !== '';
    const simulatedA1 = hasSimulatedA1 ? parseFloat(simulatedA1Param!) : null;

    // 1. Fetch actual Schumann values from Tomsk .afq logs
    let realSchumann = await fetchRealSchumannData();
    
    // Detect flares/bursts dynamically from the live spectrogram image
    const imageFlareData = await detectFlaresFromImage();
    if (imageFlareData) {
      if (!realSchumann) {
        // Create fallback object since .afq log is offline but spectrogram image works
        realSchumann = {
          time_tomsk: 'Canlı Gözlem',
          time_utc: new Date().toISOString(),
          a1: imageFlareData.peakA1,
          f1: 7.83,
          q1: 10,
          a2: 6.0,
          f2: 14.1,
          q2: 10,
          a3: 6.0,
          f3: 20.3,
          q3: 10,
          a4: 6.0,
          f4: 26.4,
          q4: 10
        };
      } else if (imageFlareData.peakA1 > realSchumann.a1) {
        console.log(`Image-based flare detected! Scaling A1 from ${realSchumann.a1} to ${imageFlareData.peakA1}`);
        realSchumann.a1 = imageFlareData.peakA1;
      }
    }
    
    // 2. Calculate custom cosmic impact score (0.0 to 10.0)
    const finalA1 = simulatedA1 !== null ? simulatedA1 : (realSchumann ? realSchumann.a1 : 6.0);
    const finalF1 = simulatedA1 !== null ? (7.83 + (simulatedA1 / 75.0) * 0.5) : (realSchumann ? realSchumann.f1 : 7.83);
    const finalImpactScore = getSchumannScoreFromA1(finalA1);
    
    const cosmicStatus = getCosmicImpactStatusInfo(finalImpactScore);

    const aiAnalysis = await generateRulesAnalysis(
      finalImpactScore,
      finalA1,
      finalF1
    );

    let triggeredGLevel: string | null = null;
    if (finalA1 >= 70.0) {
      triggeredGLevel = 'G5';
    } else if (finalA1 >= 55.0) {
      triggeredGLevel = 'G4';
    } else if (finalA1 >= 40.0) {
      triggeredGLevel = 'G3';
    } else if (finalA1 >= 25.0) {
      triggeredGLevel = 'G2';
    } else if (finalA1 >= 15.0) {
      triggeredGLevel = 'G1';
    }

    let peakA124h = realSchumann ? realSchumann.a1 : 6.0;
    if (imageFlareData) {
      peakA124h = Math.max(peakA124h, imageFlareData.peakA124h);
    }
    const finalPeakA1 = simulatedA1 !== null ? simulatedA1 : peakA124h;
    const finalPeakScore = getSchumannScoreFromA1(finalPeakA1);

    const allRules = await db.select().from(schema.schumannRules);

    return json({
      cosmic_impact_score: finalImpactScore,
      cosmic_status_label: cosmicStatus.label,
      cosmic_status_desc: cosmicStatus.desc,
      ai_analysis: aiAnalysis,
      schumann_real: realSchumann,
      triggered_g_level: triggeredGLevel,
      schumann_rules: allRules,
      peak_a1_24h: finalPeakA1,
      peak_score_24h: finalPeakScore
    });
  } catch (error: any) {
    console.error('Schumann API Error:', error);
    return errorJson('Kozmik hava durumu verileri yüklenirken bir hata oluştu.', 500);
  }
}
