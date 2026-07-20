import { json, errorJson, preflight } from '@/lib/http/cors';
import sharp from 'sharp';

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

function generateRulesAnalysis(score: number, speed: number, density: number, bz: number, bt: number, a1: number, f1: number) {
  // 1. Zirve Ekstrem Schumann Fırtınası (Ekstrem G5 Fırtınası)
  if (score >= 9.0) {
    return {
      title: 'Ekstrem Schumann Rezonans Fırtınası (G5 Zirve Seviyesi)',
      science: `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana mod genliği (A1) tarihi zirvesine ulaşarak ${a1.toFixed(1)} seviyesine çıktı. Frekans ${f1.toFixed(2)} Hz düzeyinde ekstrem titreşiyor. İyonosfer tabakası tam doygunluk sınırında elektrik yüküyle yüklü.`,
      symptoms: 'Sinir sisteminin en yüksek kapasitede uyarılması, derin trans benzeri uyku halleri veya mutlak uykusuzluk, baş ve ensede çok yoğun basınç, kulaklarda çok yüksek tonda uğultu/çınlama sesleri, aşırı duyarlılık ve bedensel hafiflik/ağırlık hissi dalgalanmaları.',
      spiritual: 'Zirve boyutlar arası geçiş portalı ve hücresel simya devrededir. Kollektif bilinçle ve kozmik kaynakla bütünleşme anıdır. Bol alkali su tüketin ve çıplak ayakla nemli toprağa basarak mutlak topraklanma sağlayın. Zihni tamamen susturarak teslimiyet meditasyonu yapın.'
    };
  }

  // 2. Ağır Schumann Fırtınası (G4 Seviyesi)
  if (score >= 8.0) {
    return {
      title: 'Ağır Schumann Rezonans Fırtınası (G4 Seviyesi)',
      science: `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana mod genliği (A1) ekstrem bir yükselişle ${a1.toFixed(1)} seviyesine ulaştı. Frekans ${f1.toFixed(2)} Hz düzeyinde seyrediyor. İyonosfer tabakası çok yüksek manyetik basınç altında.`,
      symptoms: 'Yoğun fiziksel yorgunluk ve kas seğirmeleri (frekans uyumlanması), baş bölgesinde taç kısmına doğru yayılan basınç, uyku düzeninde derin kaymalar (gece yarısı uyanıp tekrar uyuyamama), zaman algısında geçici bükülmeler.',
      spiritual: 'Taç çakra portalı tamamen açılmıştır ve yüksek boyutlu ışık bedene geçiş enerjisi aktiftir. Bugün kendinizi zorlayacak fiziksel işlerden kesinlikle kaçının. Taç çakranızdan giren beyaz ışığın bedeninizi yıkayarak yere aktığını imgeleyin.'
    };
  }

  // 3. Şiddetli Schumann Fırtınası (G3 Seviyesi)
  if (score >= 7.0) {
    return {
      title: 'Şiddetli Schumann Rezonans Fırtınası (G3 Seviyesi)',
      science: `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana mod genliği (A1) sıradışı bir sıçramayla ${a1.toFixed(1)} seviyesine ulaştı. Frekans ${f1.toFixed(2)} Hz civarında seyrediyor. İyonosfer tabakası yoğun bir elektrik yüküyle titreşiyor.`,
      symptoms: 'Sinir sisteminde belirgin uyarılma, uyku düzeninde dalgalanmalar (derin uykusuzluk ya da rüya yoğunluğu), baş ve ense bölgesinde hafif basınç, kulaklarda kesintisiz tiz çınlamalar ve çok canlı, sembolik rüyalar.',
      spiritual: 'DNA sarmallarında uyarım ve ışık kodlarının entegrasyonu aktiftir. Bedeninizi yormadan hafif egzersizler yapın. Bol su tüketin, topraklanın ve yüksek frekanslı meditasyonlara odaklanın.'
    };
  }

  // 2. Aktif Schumann Manyetik Fırtınası (G1-G2 Seviyesi)
  if (score >= 5.0) {
    return {
      title: 'Aktif Schumann Manyetik Fırtınası (G1-G2 Seviyesi)',
      science: `Tomsk Rasathanesi verilerinde Schumann Rezonansı genliği (A1) yüksek uyarım göstererek ${a1.toFixed(1)} seviyesine ulaştı. Frekans ${f1.toFixed(2)} Hz olarak iyonosferik dalgalanmaları tetikliyor.`,
      symptoms: 'Kalp atışlarında ani hızlanma veya genişleme hissi, vücutta hafif statik elektrik birikimi (dokunulan yerlerin çarpması), hafif eklem ve şakak ağrıları, uykuya dalmakta gecikme ve içsel sabırsızlık.',
      spiritual: 'Kalp çakrası ve aura alanı genişlemektedir. Bedendeki fazla elektriği boşaltmak için tuzlu su banyosu yapın veya çıplak elle toprağa dokunun. Kalp merkezli nefes pratikleri (4 saniye al, 4 saniye ver) yaparak kozmik akışı bedende dengeleyin.'
    };
  }

  // 3. Hafif Schumann Dalgalanması (Hafif Uyarım Seviyesi)
  if (score >= 3.0) {
    return {
      title: 'Hafif Schumann Dalgalanması (Hafif Uyarım Seviyesi)',
      science: `Schumann Rezonansı ana mod genliği (A1) ${a1.toFixed(1)} seviyesine çıkarak hafif bir hareketlenme gösteriyor. Frekans ${f1.toFixed(2)} Hz civarında stabil seyrediyor.`,
      symptoms: 'Rüyalarda belirgin netleşme ve sembolizm artışı, sezgisel uyanışlar, zihinde yaratıcı fikir patlamaları, kulaklarda hafif dalgalı uğultular ve hafif tatlı bir yorgunluk/esneme hali.',
      spiritual: 'Uyanış kapıları hafifçe uyarılmaktadır. Meditasyon, günlük tutma, rüya analizleri yapma ve yaratıcı projelere odaklanma için harika bir akıştır. Üçüncü göz bölgesine mavi/mor bir ışık hayal ederek odaklanabilirsiniz.'
    };
  }
  
  // 4. Güneş Rüzgarı Hızı Sıçraması
  if (speed >= 500) {
    if (score >= 3.0) {
      return {
        title: 'Kozmik Plazma Rüzgarı Dalgası (Hızlı Akış)',
        science: `Güneş yüzeyindeki koronal deliklerden kopan yüksek hızlı plazma akışı saniyede ${Math.round(speed)} km hıza ulaşarak manyetik kalkanımızı sıkıştırıyor. Schumann Rezonansı ana mod genliği (A1): ${a1.toFixed(1)}, frekansı: ${f1.toFixed(2)} Hz.`,
        symptoms: 'Fiziksel bedende ani bir enerjik uyarılma, içsel sabırsızlık veya huzursuzluk hissi, kalp atışlarında hızlanma dalgaları, hafif sersemlik ve kulaklarda dalgalı frekans sesleri.',
        spiritual: 'Artan plazma akışı, aura alanınızı temizlemek ve eski hücresel kalıpları salıvermek için çalışır. Birikmiş statik elektriği nötrlemek için ılık/tuzlu bir duş alın. Kalp merkezli nefes pratikleri (4 saniye al, 4 saniye ver) yaparak akışı bedende dengeleyin.'
      };
    } else {
      return {
        title: 'Kozmik Plazma Rüzgarı Dalgası (Yumuşak Akış)',
        science: `Güneş rüzgarı hızı saniyede ${Math.round(speed)} km hıza ulaşsa da, iyonosferik Schumann genliği (${a1.toFixed(1)}) ve Kp seviyesi sakin seyrediyor.`,
        symptoms: 'Genel olarak dengeli enerji seviyeleri. Bazı hassas bünyelerde hafif esneme, tatlı bir yorgunluk ve statik elektrik uyarımı hissedilebilir.',
        spiritual: 'Gelen plazma rüzgarı hafif bir arınma sağlar. Bol su için ve bedendeki statik elektriği nötrlemek için topraklanın.'
      };
    }
  }
  
  // 5. Kalkan Açılması (Bz Güney)
  if (bz <= -3.0) {
    if (score >= 3.0) {
      return {
        title: 'Manyetik Kalkan Geçiş Portalı (Bz Güney Yönlü)',
        science: `Dünya'nın koruyucu manyetik kalkanının yönünü belirleyen Bz parametresi güneye yönelerek ${bz.toFixed(1)} nT seviyesine ulaştı. Kalkanımızda açılan bu kapı güneş rüzgarı sızıntısını artırırken, Schumann Rezonansı genliği ${a1.toFixed(1)} ve frekansı ${f1.toFixed(2)} Hz olarak ölçüldü.`,
        symptoms: 'Yüksek duygusal duyarlılık, empati yeteneğinde aşırı artış, başkalarının enerjilerini hissetme, hafif şakak ağrıları ve rüyalarda yoğun astral semboller.',
        spiritual: 'Kalkanın açık olması ruhsal olarak alıcı (reseptif) modda olduğumuzu gösterir. Negatif enerjilerden korunmak için kendinizi mor bir ışık küresi içinde hayal edin. Adaçayı veya üzerlik otu yakarak yaşam alanınızı arındırın.'
      };
    } else {
      return {
        title: 'Manyetik Kalkan Açılımı (Sakin Alıcılık Fazı)',
        science: `Manyetik kalkanın yönünü belirleyen Bz parametresi güneye yönelerek ${bz.toFixed(1)} nT seviyesine ulaştı. Kalkanımızda hafif geçirgenlik oluşsa da, Schumann genliği (${a1.toFixed(1)}) ve Kp seviyesi sakin olduğundan iyonosferik uyarım düşüktür.`,
        symptoms: 'Belirgin bir fiziksel veya duygusal semptom beklenmez. Ancak sezgilerde hafif bir netleşme, alıcı (reseptif) ruh hali ve sakin rüyalar görülebilir.',
        spiritual: 'Kapı açık ancak akış yumuşaktır. Aura alanını mor ışıkla koruma altına alıp dingin tefekkür ve meditasyon çalışmaları yapabilirsiniz.'
      };
    }
  }
  
  // 6. Parçacık Yoğunluğu Sıçraması
  if (density >= 10.0) {
    if (score >= 3.0) {
      return {
        title: 'Yoğun Parçacık Bombardımanı (Proton Yoğunluğu)',
        science: `Güneş rüzgarındaki parçacık (proton) yoğunluğu cm³ başına ${density.toFixed(1)} seviyesine ulaştı. Schumann Rezonansı ana mod genliği (A1) ${a1.toFixed(1)} ve frekansı ${f1.toFixed(2)} Hz olarak kaydedildi.`,
        symptoms: 'Eklem ağrıları, kas seğirmeleri, aşırı fiziksel yorgunluk ve uykuya geçişte zorlanma, göz arkasında hafif sızlama veya basınç.',
        spiritual: 'Artan proton akışı, hücresel şablonumuzda ve DNA yapımızda yoğun bir elektromanyetik dönüşüm tetikler. Ağır yiyeceklerden kaçının, hafif beslenin ve bol su için. Vücuttaki iletkenliği ve topraklanmayı artırmak için magnezyum takviyesi alabilirsiniz.'
      };
    } else {
      return {
        title: 'Kozmik Parçacık Akışı (Dengeli Entegrasyon)',
        science: `Güneş rüzgarındaki proton yoğunluğu cm³ başına ${density.toFixed(1)} seviyesinde aktif, ancak Schumann genliği (${a1.toFixed(1)}) dengeli ve doğal titreşimindedir.`,
        symptoms: 'Hafif bedensel ağırlık veya uyku isteği dışında ekstrem eklem/şakak hassasiyeti beklenmez.',
        spiritual: 'Hücresel düzeyde yavaş ve güvenli entegrasyon aktiftir. Hafif gıdalarla beslenerek bedene yardımcı olabilirsiniz.'
      };
    }
  }
  
  // 7. Sakin ve Dengeli Durum
  return {
    title: 'Dingin Elektromanyetik Akış (Sakin Faz)',
    science: `Güneş rüzgarı hızı (${Math.round(speed)} km/s) ve parçacık yoğunluğu (${density.toFixed(1)} p/cm³) normal sınırlarında. Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana frekansı ${f1.toFixed(2)} Hz (Genlik A1: ${a1.toFixed(1)}) seviyesinde dengeli ve doğal titreşiminde seyrediyor.`,
    symptoms: 'Zihinsel netlik, dengeli enerji seviyeleri, sakin uyku düzeni ve bedensel rahatlık. Olağanüstü bir uyarılma belirtisi beklenmez.',
    spiritual: 'Zihnin gürültüsünü yatıştırmak, yeni bilgiler öğrenmek, kadim dersleri çalışmak ve kök çakra meditasyonları yapmak için en ideal dönemdir. Enerjinizin merkezlendiği bu dingin zamanı tefekkür ile değerlendirebilirsiniz.'
  };
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
  if (a1 < 8) {
    return parseFloat((0.5 + ((a1 - 4) / 4) * 2.5).toFixed(2));
  } else if (a1 < 15) {
    return parseFloat((3.0 + ((a1 - 8) / 7) * 3.0).toFixed(2));
  } else if (a1 < 25) {
    return parseFloat((6.0 + ((a1 - 15) / 10) * 2.5).toFixed(2));
  } else {
    return parseFloat(Math.min(10.0, 8.5 + ((a1 - 25) / 25) * 1.5).toFixed(2));
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

async function detectFlaresFromImage(): Promise<{ score: number; peakA1: number } | null> {
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
    const dataEndX = 1444;
    const bgRegions = [
      { start: 55, end: 85 },   // 2 - 5 Hz
      { start: 130, end: 155 }, // 10 - 12.5 Hz
      { start: 190, end: 215 }  // 16 - 18.5 Hz
    ];
    
    let minBr = 255;
    let maxBr = 0;
    let sumTotalBr = 0;
    let colsCount = 0;
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
      sumTotalBr += avgBr;
      colsCount++;
    }
    
    // Check the latest columns (last 10 minutes, approx. 3 columns)
    let latestSum = 0;
    let latestCount = 0;
    for (let i = colBrightnesses.length - 3; i < colBrightnesses.length; i++) {
      latestSum += colBrightnesses[i];
      latestCount++;
    }
    const latestAvg = latestSum / latestCount;
    
    // Dynamic activity score from 0.0 to 10.0
    const range = maxBr - minBr;
    const normalizedScore = range === 0 ? 0.5 : ((latestAvg - minBr) / range) * 10;
    
    // Extrapolate peak A1 based on the normalized score
    // Minimum activity starts at A1=4.0, maximum activity (flare peak) goes up to A1=75.0
    let peakA1 = 6.0;
    if (normalizedScore < 3.0) {
      peakA1 = 4.0 + (normalizedScore / 3.0) * 4.0;
    } else if (normalizedScore < 6.0) {
      peakA1 = 8.0 + ((normalizedScore - 3.0) / 3.0) * 12.0;
    } else if (normalizedScore < 8.5) {
      peakA1 = 20.0 + ((normalizedScore - 6.0) / 2.5) * 20.0;
    } else {
      peakA1 = 40.0 + ((normalizedScore - 8.5) / 1.5) * 35.0;
    }
    
    return {
      score: parseFloat(normalizedScore.toFixed(2)),
      peakA1: parseFloat(peakA1.toFixed(1))
    };
  } catch (err) {
    console.error('Error detecting flares from image:', err);
    return null;
  }
}

export async function GET() {
  try {
    // 1. Fetch real-time solar wind data (propagated solar wind 1-hour cadence is small and fast)
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

    // 2. Fetch Kp index forecast data (observed + forecast)
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

    // Map all history blocks (past and future predictions) to Cosmic Impact Index (CEI)
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

    // 4. Fetch actual Schumann values from Tomsk .afq logs
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
    
    // 5. Calculate custom cosmic impact score (0.0 to 10.0)
    let finalImpactScore = 0.5;
    if (realSchumann) {
      finalImpactScore = getSchumannScoreFromA1(realSchumann.a1);
    } else {
      // Fallback to Kp-based CEI calculation
      const kpWeight = (currentKp / 9) * 4.0;
      const speedVal = solarWind.speed || 350;
      const speedWeight = Math.max(0, Math.min(2.5, ((speedVal - 300) / 500) * 2.5));
      const densityVal = solarWind.density || 4;
      const densityWeight = Math.max(0, Math.min(2.0, ((densityVal - 2) / 15) * 2.0));
      const btVal = solarWind.bt || 5;
      const btWeight = Math.max(0, Math.min(1.5, ((btVal - 5) / 15) * 1.5));
      const bzVal = solarWind.bz || 0;
      const bzMultiplier = bzVal < 0 ? (1.0 + Math.min(0.25, (Math.abs(bzVal) / 20) * 0.25)) : 1.0;
      const rawImpactScore = kpWeight + speedWeight + densityWeight + btWeight;
      finalImpactScore = parseFloat(Math.min(10.0, rawImpactScore * bzMultiplier).toFixed(2));
    }
    
    const cosmicStatus = getCosmicImpactStatusInfo(finalImpactScore);

    const finalA1 = realSchumann ? realSchumann.a1 : 6.0;
    const finalF1 = realSchumann ? realSchumann.f1 : 7.83;

    const aiAnalysis = generateRulesAnalysis(
      finalImpactScore,
      solarWind.speed,
      solarWind.density,
      solarWind.bz,
      solarWind.bt,
      finalA1,
      finalF1
    );

    return json({
      current_kp: currentKp,
      status_label: status.label,
      status_desc: status.desc,
      updated_at: lastReadingTime,
      history: history,
      solar_wind: solarWind,
      noaa_discussion: noaaDiscussion,
      cosmic_impact_score: finalImpactScore,
      cosmic_status_label: cosmicStatus.label,
      cosmic_status_desc: cosmicStatus.desc,
      ai_analysis: aiAnalysis,
      schumann_real: realSchumann
    });
  } catch (error: any) {
    console.error('NOAA Kp API Error:', error);
    return errorJson('Kozmik hava durumu verileri yüklenirken bir hata oluştu.', 500);
  }
}
