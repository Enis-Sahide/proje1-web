import { json, errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

function getStatusInfo(kp: number) {
  if (kp < 3) {
    return {
      label: 'Dengeli Akış (Sakin)',
      desc: 'Manyetik alan oldukça dingin ve dengeli. İç gözlem, zihinsel odaklanma, derin gevşeme ve kök çakra topraklama çalışmaları için mükemmel bir zemin. Zihnin gürültüsünü yatıştırmak ve sessizlik meditasyonları yapmak için ideal bir dönem.'
    };
  } else if (kp < 4) {
    return {
      label: 'Enerjisel Kıpırdanma (Kararsız)',
      desc: 'Elektromanyetik alanda hafif bir uyanış ve hareketlilik var. Aura alanında genişleme ve hafif bir duyarlılık hissedilebilir. Prana akışını dengeleyici nefes egzersizleri ve hafif esneme hareketleri için harika bir zaman dilimi.'
    };
  } else if (kp < 5) {
    return {
      label: 'Yüksek Titreşim (Aktif)',
      desc: 'Aktif bir manyetik alan mevcut. Bilinçaltı kapıları aralanıyor; rüyaların berraklaşması, sezgilerin ve psişik duyarlılığın güçlenmesi olasıdır. Üçüncü göz çalışmaları, rüya günlükleri tutma ve durugörü meditasyonları için çok elverişli bir süreç.'
    };
  } else if (kp < 6) {
    return {
      label: 'Işık Kapısı (G1 Manyetik Aktivite)',
      desc: 'Güneş\'ten gelen yüksek frekanslı kozmik bilgi paketlerinin iyonosfere ulaştığı özel bir uyanış penceresi. Zihinde uykusuzluk veya fiziksel duyarlılık olarak yansıyan bu etki, aslında derin çakra çalışmaları, DNA aktivasyonu meditasyonları ve yüksek benlikle bağ kurmak için olağanüstü bir fırsattır.'
    };
  } else if (kp < 7) {
    return {
      label: 'Kozmik Entegrasyon (G2 Manyetik Aktivite)',
      desc: 'Orta şiddette manyetik uyarım. Evrensel enerjinin hücresel düzeyde entegrasyonu gerçekleşiyor. Işık beden aktivasyonu, DNA şablonunun güncellenmesi ve yüksek boyutlu frekanslara uyumlanmak için bu zaman dilimini niyet çalışmaları ve sessiz tefekkür ile değerlendirebilirsiniz.'
    };
  } else if (kp < 8) {
    return {
      label: 'Portal Geçişi (G3 Manyetik Aktivite)',
      desc: 'Güçlü bir manyetik aktivite dalgası. Aura alanınız yoğun kozmik ışık kodlarıyla yıkanıyor. Duygusal dalgalanmalar ve uykuya dalışta zorlanmalar, eski kalıpların salınımına işaret eder. Çakra dengeleme, kalp kapısını açma ve kristal şifa meditasyonları için zirve noktası.'
    };
  } else if (kp < 9) {
    return {
      label: 'Hücresel Dönüşüm (G4 Manyetik Aktivite)',
      desc: 'Şiddetli manyetik uyarım ve kozmik akış. Hücreleriniz ve DNA iplikçikleriniz yüksek güneş kodlarını soğuruyor. Bu yoğun enerji altında kendinizi zorlamadan sessizce uzanarak meditasyon yapabilir, aura temizliği ve uyanış niyetlerinize odaklanarak kozmik akışla bütünleşebilirsiniz.'
    };
  } else {
    return {
      label: 'Ekstrem Kozmik Portal (G5 Manyetik Aktivite)',
      desc: 'Zirve seviyede elektromanyetik uyanış ve ışık portalı! Kolektif bilinçte muazzam bir vites değişimi. Bu olağanüstü kozmik akışı sessizce oturup taç ve kalp çakralarınızdan tüm bedeninize akan beyaz ışığı imgeleyerek, derin frekans meditasyonları ve DNA aktivasyon niyetleriyle taçlandırın.'
    };
  }
}

// Translate English text to Turkish using Google Translate gtx client
async function translateToTurkish(text: string): Promise<string> {
  if (!text || !text.trim()) return '';
  try {
    // Clean up single newlines which wrap sentences mid-way
    // Translate paragraph by paragraph to preserve spacing and grammar structure
    const paragraphs = text
      .split('\n\n')
      .map(para => para.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(para => para.length > 0);

    const translatedParagraphs: string[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.length === 0) continue;
      
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(paragraph)}`;
      
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        next: { revalidate: 3600 } // Cache translated chunks for 1 hour
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const translatedPart = data[0].map((item: any) => item[0]).join('');
          translatedParagraphs.push(translatedPart);
        } else {
          translatedParagraphs.push(paragraph);
        }
      } else {
        translatedParagraphs.push(paragraph);
      }
    }

    return translatedParagraphs.join('\n\n');
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Return English original if translation fails
  }
}

function parseDiscussion(text: string) {
  const sections = {
    solar: '',
    geomagnetic: '',
    wind: '',
    date: ''
  };

  const cleanText = text.replace(/\r\n/g, '\n');

  // Extract issued date
  const issuedMatch = cleanText.match(/:Issued:\s*(.*)/i);
  if (issuedMatch && issuedMatch[1]) {
    sections.date = issuedMatch[1].trim();
  }

  // Find index of main section headings
  const solarIdx = cleanText.indexOf('Solar Activity');
  const particlesIdx = cleanText.indexOf('Energetic Particle');
  const windIdx = cleanText.indexOf('Solar Wind');
  const geoIdx = cleanText.indexOf('Geomagnetic Field');

  // Solar Activity section
  if (solarIdx !== -1) {
    const endIdx = particlesIdx !== -1 ? particlesIdx : (windIdx !== -1 ? windIdx : (geoIdx !== -1 ? geoIdx : cleanText.length));
    sections.solar = cleanText.substring(solarIdx + 14, endIdx).trim();
  }

  // Solar Wind section
  if (windIdx !== -1) {
    const endIdx = geoIdx !== -1 ? geoIdx : cleanText.length;
    sections.wind = cleanText.substring(windIdx + 10, endIdx).trim();
  }

  // Geomagnetic Field section
  if (geoIdx !== -1) {
    sections.geomagnetic = cleanText.substring(geoIdx + 17).trim();
  }

  return sections;
}

export async function GET() {
  try {
    // 1. Fetch Kp index forecast data (observed + forecast)
    const kpRes = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json', {
      next: { revalidate: 300 } // cache for 5 minutes
    });
    if (!kpRes.ok) {
      throw new Error(`NOAA Kp API responded with status: ${kpRes.status}`);
    }
    const kpList = await kpRes.json();
    
    // Find index of the last observed reading
    const lastObservedIndex = kpList.map((item: any) => item.observed).lastIndexOf('observed');
    
    let past: any[] = [];
    let future: any[] = [];
    let currentKp = 0;
    let lastReadingTime = '';

    if (lastObservedIndex !== -1) {
      const startIdx = Math.max(0, lastObservedIndex - 15);
      past = kpList.slice(startIdx, lastObservedIndex + 1);
      future = kpList.slice(lastObservedIndex + 1, lastObservedIndex + 9);
      
      const lastObserved = kpList[lastObservedIndex];
      currentKp = parseFloat(lastObserved.kp);
      lastReadingTime = lastObserved.time_tag;
    } else {
      past = kpList.slice(-24);
      const lastItem = kpList[kpList.length - 1];
      currentKp = parseFloat(lastItem.kp);
      lastReadingTime = lastItem.time_tag;
    }

    const history = [
      ...past.map((item: any) => ({
        time: item.time_tag,
        kp: parseFloat(item.kp),
        predicted: false
      })),
      ...future.map((item: any) => ({
        time: item.time_tag,
        kp: parseFloat(item.kp),
        predicted: true
      }))
    ];

    const status = getStatusInfo(currentKp);

    // 2. Fetch real-time solar wind data (propagated solar wind 1-hour cadence is small and fast)
    let solarWind = {
      speed: 0,
      density: 0,
      temperature: 0,
      bz: 0,
      bt: 0,
      time: ''
    };

    try {
      const windRes = await fetch('https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json', {
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      if (windRes.ok) {
        const windList = await windRes.json();
        if (windList && windList.length > 1) {
          const latest = windList[windList.length - 1];
          const headers = windList[0];
          
          const speedIdx = headers.indexOf('speed');
          const densityIdx = headers.indexOf('density');
          const tempIdx = headers.indexOf('temperature');
          const bzIdx = headers.indexOf('bz');
          const btIdx = headers.indexOf('bt');
          const timeIdx = headers.indexOf('time_tag');

          solarWind = {
            speed: parseFloat(latest[speedIdx]) || 0,
            density: parseFloat(latest[densityIdx]) || 0,
            temperature: parseFloat(latest[tempIdx]) || 0,
            bz: parseFloat(latest[bzIdx]) || 0,
            bt: parseFloat(latest[btIdx]) || 0,
            time: latest[timeIdx] || ''
          };
        }
      }
    } catch (windErr) {
      console.error('Failed to fetch solar wind data:', windErr);
    }

    // 3. Fetch daily discussion text & translate
    let noaaDiscussion = {
      solar_activity_tr: '',
      geomagnetic_field_tr: '',
      solar_wind_tr: '',
      raw_date: ''
    };

    try {
      const discRes = await fetch('https://services.swpc.noaa.gov/text/discussion.txt', {
        next: { revalidate: 3600 } // Cache text for 1 hour
      });
      if (discRes.ok) {
        const discText = await discRes.text();
        const parsed = parseDiscussion(discText);
        
        noaaDiscussion = {
          solar_activity_tr: await translateToTurkish(parsed.solar),
          geomagnetic_field_tr: await translateToTurkish(parsed.geomagnetic),
          solar_wind_tr: await translateToTurkish(parsed.wind),
          raw_date: parsed.date
        };
      }
    } catch (discErr) {
      console.error('Failed to fetch/translate NOAA discussion:', discErr);
    }

    return json({
      current_kp: currentKp,
      status_label: status.label,
      status_desc: status.desc,
      updated_at: lastReadingTime,
      history: history,
      solar_wind: solarWind,
      noaa_discussion: noaaDiscussion
    });
  } catch (error: any) {
    console.error('NOAA Kp API Error:', error);
    return errorJson('Kozmik hava durumu verileri yüklenirken bir hata oluştu.', 500);
  }
}
