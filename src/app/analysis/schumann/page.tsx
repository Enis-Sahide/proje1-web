"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Activity, Zap, Compass, BookOpen, AlertCircle, Info, RefreshCw, Lock, Bell, BellOff, Sun, Waves, ChevronDown, ChevronUp, Wind, Gauge, Shield, Thermometer, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LEVELS } from '@/lib/auth/roles';

interface KpHistoryItem {
  time: string;
  kp: number;
  predicted?: boolean;
}

interface SolarWindData {
  speed: number;
  density: number;
  temperature: number;
  bz: number;
  bt: number;
  time: string;
}

interface NOAADiscussion {
  solar_activity_tr: string;
  geomagnetic_field_tr: string;
  solar_wind_tr: string;
  raw_date: string;
}

interface AIAnalysis {
  title: string;
  science: string;
  symptoms: string;
  spiritual: string;
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

interface KpData {
  current_kp: number;
  status_label: string;
  status_desc: string;
  updated_at: string;
  history: KpHistoryItem[];
  solar_wind?: SolarWindData;
  noaa_discussion?: NOAADiscussion;
  cosmic_impact_score?: number;
  cosmic_status_label?: string;
  cosmic_status_desc?: string;
  ai_analysis?: AIAnalysis;
  schumann_real?: RealSchumannRow;
  peak_a1_24h?: number;
  peak_score_24h?: number;
}

interface HoverInfo {
  left: number;
  top: number;
  timeStr: string;
  kp: number;
  isForecast: boolean;
  isCurrent?: boolean;
  spiritualStatus: string;
}

const labelResonances = [0, 7.83, 14, 20, 26, 32, 40];
const graphTop = 25;
const graphBottom = 245;
const graphHeight = 220;
const canvasHeight = 270;

export default function SchumannPage() {
  const router = useRouter();
  const { role } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [data, setData] = useState<KpData | null>(null);
  const [simulatedA1, setSimulatedA1] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [hoveredBar, setHoveredBar] = useState<KpHistoryItem | null>(null);
  
  // Interactive Hover Spectrogram State
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  
  // Accordion Guide State
  const [isGuideOpen, setIsGuideOpen] = useState(false);


  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/schumann?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error('Veriler güncellenirken sunucudan geçersiz yanıt alındı.');
      }
      const jsonData = await res.json();
      
      // Limit history to the last 24 items (last 72 hours of 3-hourly blocks)
      if (jsonData && jsonData.history) {
        jsonData.history = jsonData.history.slice(-24);
      }
      setData(jsonData);
      setTimestamp(Date.now());


    } catch (err: any) {
      console.error('Kp API fetch error:', err);
      setError(err.message || 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Schumann Rezonansı & Kozmik Enerji Portalı | İçsel Uyanış";
    fetchData();

    // Set up automatic background polling every 5 minutes (300,000 ms)
    const interval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper for smooth continuous resonance color stops based on Kp index
  const getResonanceColor = (kp: number) => {
    const stops = [
      { kp: 0.0, r: 0, g: 110, b: 140 },   // Deep green-blue (quiet)
      { kp: 2.0, r: 16, g: 185, b: 129 },  // Emerald green (normal)
      { kp: 3.5, r: 245, g: 158, b: 11 },  // Amber/yellow (unsettled)
      { kp: 4.3, r: 249, g: 115, b: 22 },  // Orange (active)
      { kp: 4.8, r: 239, g: 68, b: 68 },   // Red (high)
      { kp: 5.2, r: 255, g: 255, b: 255 }  // Solid white (storm)
    ];

    let low = stops[0];
    let high = stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
      if (kp >= stops[i].kp && kp <= stops[i + 1].kp) {
        low = stops[i];
        high = stops[i + 1];
        break;
      }
    }

    const range = high.kp - low.kp;
    const factor = range === 0 ? 0 : (kp - low.kp) / range;

    return {
      r: low.r + (high.r - low.r) * factor,
      g: low.g + (high.g - low.g) * factor,
      b: low.b + (high.b - low.b) * factor
    };
  };

  const getSchumannScoreFromA1 = (a1: number) => {
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


  const getCosmicStatusInfo = (score: number) => {
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
  };

  const getSimulatedStatus = (kpVal: number) => {
    if (kpVal < 3.0) {
      return {
        label: 'Sakin Jeomanyetik Alan',
        desc: 'Manyetik alan sakin. Enerji akışları dengeli ve entegrasyon için elverişli. İçsel huzur ve meditasyon çalışmaları için uygun bir zaman.'
      };
    } else if (kpVal < 4.0) {
      return {
        label: 'Aktif Kozmik Enerji',
        desc: 'Manyetik alanda aktif kıpırdanmalar var. Hücrelerde hafif bir uyarım, rüyalarda canlanma veya geçici uykusuzluk hissedilebilir.'
      };
    } else if (kpVal < 5.0) {
      return {
        label: 'Yoğun Jeomanyetik Hareketlilik',
        desc: 'Jeomanyetik hareketlilik yoğunlaşıyor. Baş ağrısı, sezgilerde artış ve enerjisel hassasiyet gözlemlenebilir. Topraklanmaya önem verin.'
      };
    } else {
      let gLevel = 'G1';
      let gDesc = 'Küçük';
      if (kpVal >= 9.0) { gLevel = 'G5'; gDesc = 'Sıra Dışı'; }
      else if (kpVal >= 8.0) { gLevel = 'G4'; gDesc = 'Şiddetli'; }
      else if (kpVal >= 7.0) { gLevel = 'G3'; gDesc = 'Güçlü'; }
      else if (kpVal >= 6.0) { gLevel = 'G2'; gDesc = 'Orta'; }
      else { gLevel = 'G1'; gDesc = 'Küçük'; }

      return {
        label: `JEOMANYETİK FIRTINA: ${gLevel} (${gDesc})`,
        desc: `Güçlü kozmik enerji fırtınası devrede! NOAA G-Skalasına göre ${gLevel} seviyesinde ${gDesc.toLowerCase()} jeomanyetik fırtına yaşanmaktadır. Hücresel uyanış portalları açık. Fiziksel yorgunluk, yoğun rüyalar ve yüksek enerjisel titreşim dalgaları olasıdır.`
      };
    }
  };

  const FALLBACK_SCHUMANN_RULES = [
    {
      minScore: '0.0',
      title: 'Dingin Elektromanyetik Akış (Sakin Faz)',
      symptoms: 'Zihinsel netlik, dengeli enerji seviyeleri, sakin uyku düzeni ve bedensel rahatlık. Olağanüstü bir uyarılma belirtisi beklenmez.',
      spiritual: 'Zihnin gürültüsünü yatıştırmak, yeni bilgiler öğrenmek, kadim dersleri çalışmak ve kök çakra meditasyonları yapmak için en ideal dönemdir. Enerjinizin merkezlendiği bu dingin zamanı tefekkür ile değerlendirebilirsiniz.'
    },
    {
      minScore: '3.0',
      title: 'Hafif Schumann Dalgalanması (Hafif Uyarım Seviyesi)',
      symptoms: 'Rüyalarda belirgin netleşme ve sembolizm artışı, sezgisel uyanışlar, zihinde yaratıcı fikir patlamaları, kulaklarda hafif dalgalı uğultular ve hafif tatlı bir yorgunluk/esneme hali.',
      spiritual: 'Uyanış kapıları hafifçe uyarılmaktadır. Meditasyon, günlük tutma, rüya analizleri yapma ve yaratıcı projelere odaklanma için harika bir akıştır. Üçüncü göz bölgesine mavi/mor bir ışık hayal ederek odaklanabilirsiniz.'
    },
    {
      minScore: '5.0',
      title: 'Aktif Schumann Manyetik Fırtınası (G1-G2 Seviyesi)',
      symptoms: 'Kalp atışlarında ani hızlanma veya genişleme hissi, vücutta hafif statik elektrik birikimi (dokunulan yerlerin çarpması), hafif eklem ve şakak ağrıları, uykuya dalmakta gecikme ve içsel sabırsızlık.',
      spiritual: 'Kalp çakrası ve aura alanı genişlemektedir. Bedendeki fazla elektriği boşaltmak için tuzlu su banyosu yapın veya çıplak elle toprağa dokunun. Kalp merkezli nefes pratikleri (4 saniye al, 4 saniye ver) yaparak kozmik akışı bedende dengeleyin.'
    },
    {
      minScore: '7.0',
      title: 'Şiddetli Schumann Fırtınası (G3 Seviyesi)',
      symptoms: 'Sinir sisteminde belirgin uyarılma, uyku düzeninde dalgalanmalar (derin uykusuzluk ya da rüya yoğunluğu), baş ve ense bölgesinde hafif basınç, kulaklarda kesintisiz tiz çınlamalar ve çok canlı, sembolik rüyalar.',
      spiritual: 'DNA sarmallarında uyarım ve ışık kodlarının entegrasyonu aktiftir. Bedeninizi yormadan hafif egzersizler yapın. Bol su tüketin, topraklanın ve yüksek frekanslı meditasyonlara odaklanın.'
    },
    {
      minScore: '8.0',
      title: 'Ağır Schumann Fırtınası (G4 Seviyesi)',
      symptoms: 'Yoğun fiziksel yorgunluk ve kas seğirmeleri (frekans uyumlanması), baş bölgesinde taç kısmına doğru yayılan basınç, uyku düzeninde derin kaymalar (gece yarısı uyanıp tekrar uyuyamama), zaman algısında geçici bükülmeler.',
      spiritual: 'Taç çakra portalı tamamen açılmıştır ve yüksek boyutlu ışık bedene geçiş enerjisi aktiftir. Bugün kendinizi zorlayacak fiziksel işlerden kesinlikle kaçının. Taç çakranızdan giren beyaz ışığın bedeninizi yıkayarak yere aktığını imgeleyin.'
    },
    {
      minScore: '9.0',
      title: 'Ekstrem Schumann Rezonans Fırtınası (G5 Zirve Seviyesi)',
      symptoms: 'Sinir sisteminin en yüksek kapasitede uyarılması, derin trans benzeri uyku halleri veya mutlak uykusuzluk, baş ve ensede çok yoğun basınç, kulaklarda çok yüksek tonda uğultu/çınlama sesleri, aşırı duyarlılık ve bedensel hafiflik/ağırlık hissi dalgalanmaları.',
      spiritual: 'Zirve boyutlar arası geçiş portalı ve hücresel simya devrededir. Kollektif bilinçle ve kozmik kaynakla bütünleşme anıdır. Bol alkali su tüketin ve çıplak ayakla nemli toprağa basarak mutlak topraklanma sağlayın. Zihni tamamen susturarak teslimiyet meditasyonu yapın.'
    }
  ];

  const generateRulesAnalysis = (score: number, speed: number, density: number, bz: number, bt: number, kp: number, a1: number, f1: number) => {
    const rules = (data as any)?.schumann_rules || FALLBACK_SCHUMANN_RULES;
    const sortedRules = [...rules].sort((a, b) => parseFloat(a.minScore) - parseFloat(b.minScore));
    let matchedRule = sortedRules[0];
    for (const rule of sortedRules) {
      if (score >= parseFloat(rule.minScore)) {
        matchedRule = rule;
      }
    }

    let scienceText = matchedRule.science;
    if (!scienceText) {
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
    }

    return {
      title: matchedRule.title,
      science: scienceText,
      symptoms: matchedRule.symptoms,
      spiritual: matchedRule.spiritual,
    };
  };

  const historyToRender = data?.history ? data.history.map((item, idx) => {
    // Son ölçüm indeksini bul (tahmin/predicted olmayan en son eleman)
    const lastMeasuredIdx = data.history.reduce((lastIdx, currItem, currIdx) => {
      if (!currItem.predicted) {
        return currIdx;
      }
      return lastIdx;
    }, -1);

    // Canlı / ŞİMDİ sütunu için tam gözlemlenen Schumann indeksini kullan
    if (idx === lastMeasuredIdx) {
      if (simulatedA1 !== null) {
        return { ...item, kp: getSchumannScoreFromA1(simulatedA1) };
      }
      return { ...item, kp: data.cosmic_impact_score };
    }
    
    // Geçmiş ve gelecek tahmin blokları için doğrudan kendi Kp değerini kullan (eski ağırlıklı hesaplamalar kaldırıldı)
    return { ...item, kp: item.kp ?? 0 };
  }) : [];

  const kpHistoryToRender = data?.history ? data.history.map((item, idx) => {
    const lastMeasuredIdx = data.history.reduce((lastIdx, currItem, currIdx) => {
      if (!currItem.predicted) {
        return currIdx;
      }
      return lastIdx;
    }, -1);

    if (simulatedA1 !== null && idx === lastMeasuredIdx) {
      const activeKp = Math.min(9.0, (simulatedA1 / 75.0) * 9.0);
      return { ...item, kp: activeKp };
    }
    return item;
  }) : [];

  // Spectrogram rendering effect
  useEffect(() => {
    if (!canvasRef.current || !data || historyToRender.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    


    // Draw solid space background for graph area
    ctx.fillStyle = '#000028';
    ctx.fillRect(0, graphTop, width, graphHeight);

    const cols = historyToRender; // Use simulated history when actively 24 blocks representing the last 72 hours
    
    // Precise current time (ŞİMDİ) X placement based on the user's browser time
    const startTimeMs = new Date(cols[0].time.endsWith('Z') ? cols[0].time : cols[0].time + 'Z').getTime();
    const totalDurationMs = cols.length * 3 * 60 * 60 * 1000; // 72 hours in ms
    const currentMs = Date.now();
    const nowPct = (currentMs - startTimeMs) / totalDurationMs;
    const nowX = nowPct * width;

    // 1. Draw Spectrogram Data Column by Column
    for (let x = 0; x < width; x++) {
      // Linear interpolation between the 3-hour Kp blocks
      const pct = x / width;
      const indexFloat = pct * (cols.length - 1);
      const indexLow = Math.floor(indexFloat);
      const indexHigh = Math.min(indexLow + 1, cols.length - 1);
      const weight = indexFloat - indexLow;

      const colLow = cols[indexLow];
      const colHigh = cols[indexHigh];
      const kpLow = colLow?.kp ?? 0;
      const kpHigh = colHigh?.kp ?? 0;
      const kp = kpLow + (kpHigh - kpLow) * weight;

      // Determine if this pixel column is in the future relative to the actual current time
      const isPredicted = x >= nowX;

      // Base background color
      let baseR = 0;
      let baseG = 0;
      let baseB = 40;

      // Smooth resonance color calculation
      const resColor = getResonanceColor(kp);

      // Draw the column pixel-by-pixel inside the graph limits
      for (let y = graphTop; y < graphBottom; y++) {
        const freqPct = (y - graphTop) / graphHeight; // 0 at top, 1 at bottom
        const freqHz = freqPct * 40; // Scale 0 to 40 Hz

        // Schumann resonances (7.83, 14.1, 20.3, 26.4, 32.4 Hz)
        const resonances = [7.83, 14.1, 20.3, 26.4, 32.4];
        let onResonance = false;
        let resonanceDist = 999;
        let resonanceIdx = -1;

        resonances.forEach((res, idx) => {
          const dist = Math.abs(freqHz - res);
          if (dist < 3.2) {
            onResonance = true;
            if (dist < resonanceDist) {
              resonanceDist = dist;
              resonanceIdx = idx;
            }
          }
        });

        // Add soft organic sensor noise (applied identically to RGB to keep it greyscale/natural)
        const sensorNoise = (Math.random() - 0.5) * 8;

        let r = baseR;
        let g = baseG;
        let b = baseB;

        // Apply storm background glow centered at 7.83 Hz
        if (kp >= 5.0) {
          const stormGlowFactor = Math.min(1, (kp - 5.0) / 0.5);
          const dist = Math.abs(freqHz - 7.83);
          const decay = Math.max(0, 1 - dist / 22.0); // Fades out over 22 Hz range
          const glowIntensity = stormGlowFactor * 240 * Math.pow(decay, 1.8);
          r += glowIntensity;
          g += glowIntensity;
          b += glowIntensity * 0.95;
        }

        if (onResonance) {
          // Quadratic falloff for smooth glowing edges on the horizontal lines
          const strength = Math.pow(Math.max(0, 1 - resonanceDist / 3.2), 2.0);
          
          // 1. En düşük değer rengini (0, 110, 140) her zaman ve her yerde çiz
          const baseAlpha = 0.35 * strength;
          r = r * (1 - baseAlpha) + 0 * baseAlpha;
          g = g * (1 - baseAlpha) + 110 * baseAlpha;
          b = b * (1 - baseAlpha) + 140 * baseAlpha;

          // 2. Sadece Genlik (Kp) 0.1 ve üzeri olduğunda üzerine ekstra yarı şeffaf genlik rengi ekle
          if (kp >= 0.1) {
            const lineR = resColor.r;
            const lineG = resColor.g;
            const lineB = resColor.b;

            // 8Hz'de şeffaflık %0 (opaklık 1.00) olup uzaklaştıkça %20 artacak şekilde (yani opaklığı 1.00'dan başlatıp 0.20 düşürüyoruz)
            // 8Hz (idx = 0) -> Opaklık = 1.00 (şeffaflık %0 - tam net renk)
            // 14Hz (idx = 1) -> Opaklık = 0.80 (şeffaflık %20)
            // 20Hz (idx = 2) -> Opaklık = 0.60 (şeffaflık %40)
            // 26Hz (idx = 3) -> Opaklık = 0.40 (şeffaflık %60)
            // 32Hz (idx = 4) -> Opaklık = 0.20 (şeffaflık %80)
            const alpha = 1.00 - resonanceIdx * 0.20;

            // Rengi doğrudan tam yoğunluğuyla bindiriyoruz
            const blend = alpha * strength;
            r = r * (1 - blend) + lineR * blend;
            g = g * (1 - blend) + lineG * blend;
            b = b * (1 - blend) + lineB * blend;
          }
        }

        // Add vertical scanline noise during active/storm states (Kp >= 5.0)
        if (kp >= 5.0) {
          const scanPattern = Math.cos(x * 0.15);
          if (scanPattern > 0.6) {
            const scanStrength = (kp / 9) * 15;
            r += scanStrength;
            g += scanStrength;
            b += scanStrength;
          }
        }

        // Apply sensor noise
        r += sensorNoise;
        g += sensorNoise;
        b += sensorNoise;

        // If it's a predicted (future) segment, dim the colors slightly for visual contrast
        if (isPredicted) {
          r *= 0.65;
          g *= 0.65;
          b *= 0.70;
        }

        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // 2. Draw Top Date Bar
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, width, 25);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.lineTo(width, 25);
    ctx.stroke();

    // Draw date labels centered on each day section (8 segments per day)
    if (cols.length >= 24) {
      ctx.fillStyle = '#00E5FF'; // High visibility Cyan for dates
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      
      const date1 = new Date(cols[0].time + 'Z');
      const date2 = new Date(cols[8].time + 'Z');
      const date3 = new Date(cols[16].time + 'Z');

      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

      const label1 = `${dayNames[date1.getDay()]} (${date1.toLocaleDateString('tr-TR')})`;
      const label2 = `${dayNames[date2.getDay()]} (${date2.toLocaleDateString('tr-TR')})`;
      // Mark Day 3 as Forecast since it represents future data
      const label3 = `${dayNames[date3.getDay()]} (${date3.toLocaleDateString('tr-TR')}) - [TAHMİN]`;

      ctx.fillText(label1, (4 / 24) * width, 16);
      ctx.fillText(label2, (12 / 24) * width, 16);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // slightly dim forecast day header
      ctx.fillText(label3, (20 / 24) * width, 16);
    }

    // 3. Draw Bottom Time Bar
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, graphBottom, width, 25);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, graphBottom);
    ctx.lineTo(width, graphBottom);
    ctx.stroke();

    // 4. Draw Vertical Hour Grid Lines & Labels centered on each 3-hour block
    for (let h = 0; h <= cols.length; h++) {
      const x = (h / cols.length) * width;
      
      // Draw vertical grid line (dashed/subtle)
      ctx.strokeStyle = h % 8 === 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(x, graphTop);
      ctx.lineTo(x, graphBottom);
      ctx.stroke();

      if (h < cols.length) {
        // Calculate the exact hour label
        const date = new Date(cols[h].time + 'Z');
        let hourLabel = String(date.getHours()).padStart(2, '0');
        
        const isDayTransition = hourLabel === '00';
        const isPredicted = cols[h].predicted;
        
        ctx.fillStyle = isPredicted 
          ? 'rgba(255, 255, 255, 0.3)' 
          : h % 8 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)';
        
        ctx.font = h % 8 === 0 ? 'bold 8px monospace' : '8px monospace';
        ctx.textAlign = 'center';
        
        if (isDayTransition) {
          const dayNamesShort = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
          const dayName = dayNamesShort[date.getDay()];
          hourLabel = `${dayName} ${hourLabel}`;
          ctx.fillStyle = isPredicted ? '#00e5ff80' : '#00E5FF'; // Cyan highlight for date boundary
          ctx.font = 'bold 8px monospace';
        }
        
        // Align text directly under the grid line
        ctx.fillText(hourLabel, x, height - 8);
      }
    }

    // 5. Draw "ŞİMDİ" (NOW) Vertical Dashed Line at the ACTUAL current local time coordinate
    if (nowPct >= 0 && nowPct <= 1) {
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]); // Dashed line
      ctx.beginPath();
      ctx.moveTo(nowX, graphTop);
      ctx.lineTo(nowX, graphBottom);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash state
      
      // Draw a sleek indicator badge
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ŞİMDİ', nowX, graphTop + 12);
    }

    // 6. Draw interactive hovered scanline guide
    if (hoveredX !== null) {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hoveredX, graphTop);
      ctx.lineTo(hoveredX, graphBottom);
      ctx.stroke();
    }

    // 7. Draw horizontal grid lines and frequency labels (overlay)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    labelResonances.forEach(res => {
      if (res !== 0 && res !== 40) {
        const y = graphTop + (res / 40) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    });

    // 8. Auto-scroll container to center the "ŞİMDİ" vertical line on initial load
    if (!hasAutoScrolled.current && scrollContainerRef.current && nowPct >= 0 && nowPct <= 1) {
      const container = scrollContainerRef.current;
      const targetScrollLeft = nowX - container.clientWidth / 2;
      setTimeout(() => {
        if (container) {
          container.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: 'smooth'
          });
        }
      }, 300);
      hasAutoScrolled.current = true;
    }

  }, [data, timestamp, hoveredX, simulatedA1]);

  const handleRefresh = () => {
    fetchData();
  };

  // Handle interactive mouse moves over the spectrogram
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data || historyToRender.length === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const xCanvas = xPct * canvas.width;

    const cols = historyToRender;
    const startTimeMs = new Date(cols[0].time + 'Z').getTime();
    const totalDurationMs = cols.length * 3 * 60 * 60 * 1000;
    const targetTimeMs = startTimeMs + xPct * totalDurationMs;
    const targetDate = new Date(targetTimeMs);

    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const timeStr = `${targetDate.getDate()} ${monthNames[targetDate.getMonth()]} ${dayNames[targetDate.getDay()]} ${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`;

    // Get the discrete 3-hour block under the cursor
    const blockIndex = Math.min(cols.length - 1, Math.max(0, Math.floor(xPct * cols.length)));
    const kp = cols[blockIndex]?.kp ?? 0;
    const isForecast = !!cols[blockIndex].predicted;

    // Find the last measured index representing the current ("ŞİMDİ") slot
    const lastMeasuredIdx = cols.reduce((lastIdx, currItem, currIdx) => {
      if (!currItem.predicted) {
        return currIdx;
      }
      return lastIdx;
    }, -1);
    const isCurrent = blockIndex === lastMeasuredIdx;

    // Set spiritual guidance tooltip message
    let spiritualStatus = 'Dengeli Enerji Akışı';
    if (kp >= 5.0) spiritualStatus = 'DNA Aktivasyonu & Kozmik Uyanış Portalı';
    else if (kp >= 4.0) spiritualStatus = 'Yüksek Sezgi ve Hücresel Aktiviteler';
    else if (kp >= 3.0) spiritualStatus = 'Enerjisel Kıpırdanma ve Yenilenme';

    // absolute positioning inside the relative container
    const containerRect = canvas.parentElement?.getBoundingClientRect();
    const left = e.clientX - (containerRect?.left ?? 0);
    const top = e.clientY - (containerRect?.top ?? 0) - 20;

    setHoverInfo({
      left,
      top,
      timeStr,
      kp,
      isForecast,
      isCurrent,
      spiritualStatus
    });
    setHoveredX(xCanvas);
  };

  const handleMouseLeave = () => {
    setHoveredX(null);
    setHoverInfo(null);
  };

  const getKpColorClass = (kp: number, predicted?: boolean) => {
    if (kp < 3) return predicted ? 'bg-emerald-500/40 border border-dashed border-emerald-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-400';
    if (kp < 4) return predicted ? 'bg-amber-500/40 border border-dashed border-amber-500' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:bg-amber-400';
    if (kp < 5) return predicted ? 'bg-orange-500/40 border border-dashed border-orange-500' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)] hover:bg-orange-400';
    return predicted ? 'bg-red-500/40 border border-dashed border-red-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:bg-red-400';
  };

  const getKpTextColorClass = (kp: number) => {
    if (kp < 3) return 'text-emerald-400';
    if (kp < 4) return 'text-amber-400';
    if (kp < 5) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z');
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      const day = dayNames[d.getDay()];
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${hours}:${minutes}`;
    } catch (e) {
      return timeStr;
    }
  };

  const formatRealTime = (utcTimeStr?: string) => {
    if (!utcTimeStr) return '---';
    try {
      const d = new Date(utcTimeStr);
      return d.toLocaleString('tr-TR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (e) {
      return utcTimeStr;
    }
  };

  const formatTomskTime = (utcTimeStr?: string) => {
    if (!utcTimeStr) return '---';
    try {
      const d = new Date(utcTimeStr);
      const tomskDate = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      return tomskDate.toLocaleString('tr-TR', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC'
      });
    } catch (e) {
      return utcTimeStr;
    }
  };

  const formatTimeRange = (timeStr: string) => {
    try {
      const dStart = new Date(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z');
      const dEnd = new Date(dStart.getTime() + 3 * 60 * 60 * 1000);
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      
      const startDay = dayNames[dStart.getDay()];
      const startHours = String(dStart.getHours()).padStart(2, '0');
      
      const endDay = dayNames[dEnd.getDay()];
      const endHours = String(dEnd.getHours()).padStart(2, '0');
      
      if (startDay !== endDay) {
        return `${startDay} ${startHours}:00 - ${endDay} ${endHours}:00`;
      }
      return `${startDay} ${startHours}:00 - ${endHours}:00`;
    } catch (e) {
      return timeStr;
    }
  };

  const getSchumannBadgeStyle = (score: number) => {
    if (score < 3.0) {
      return {
        borderColor: 'rgba(6, 182, 212, 0.4)', // cyan/mavi
        shadowColor: 'rgba(6, 182, 212, 0.15)',
        textClass: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10'
      };
    }
    if (score < 5.0) {
      return {
        borderColor: 'rgba(16, 185, 129, 0.4)', // emerald/yeşil
        shadowColor: 'rgba(16, 185, 129, 0.15)',
        textClass: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10'
      };
    }
    if (score < 7.0) {
      return {
        borderColor: 'rgba(239, 68, 68, 0.4)', // red/kırmızı
        shadowColor: 'rgba(239, 68, 68, 0.15)',
        textClass: 'text-red-400',
        bgColor: 'bg-red-500/10'
      };
    }
    // Peak / White spot / Flare
    return {
      borderColor: 'rgba(255, 255, 255, 0.6)', // white/beyaz
      shadowColor: 'rgba(255, 255, 255, 0.4)',
      textClass: 'text-white font-extrabold drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]',
      bgColor: 'bg-white/10'
    };
  };

  const getSchumannLevelLabel = (a1: number) => {
    if (a1 < 8.0) return 'Düşük Seviye (Sakin / G0)';
    if (a1 < 15.0) return 'Hafif Uyarım (Aktif / G0)';
    if (a1 < 25.0) return 'Hafif Fırtına (G1 Seviyesi)';
    if (a1 < 40.0) return 'Orta Fırtına (G2 Seviyesi)';
    if (a1 < 55.0) return 'Güçlü Fırtına (G3 Seviyesi)';
    if (a1 < 70.0) return 'Ağır Fırtına (G4 Seviyesi)';
    return 'Zirve Patlama (Ekstrem G5 Fırtınası)';
  };

  const getSchumannEsotericTitle = (a1: number) => {
    if (a1 < 8.0) return 'Topraklanma & Entegrasyon';
    if (a1 < 15.0) return 'Hafif Uyarım & Uyanış Kapısı';
    if (a1 < 25.0) return 'Kalp Çakrası Açılımı & Sezgi Sıçraması';
    if (a1 < 40.0) return 'DNA Aktivasyonu & Astral Kapı';
    if (a1 < 55.0) return 'Taç Çakra Portalı & Işık Gövde Geçişi';
    if (a1 < 70.0) return 'Boyutlar Arası Geçiş & Hücresel Simya';
    return 'Ekstrem Kozmik Bütünleşme & Hücresel Simya';
  };

  const getSchumannEsotericDesc = (a1: number) => {
    if (a1 < 8.0) return 'Enerji alanı dengelidir. Alınan kozmik bilgilerin entegrasyonu, meditasyon ve köklenmek için en uygun zamandır.';
    if (a1 < 15.0) return 'Hafif uyarım fazı. Rüyalarda netleşme ve aurada temizlik başlar. Yeni frekanslara uyumlanmak için kapı açılmıştır.';
    if (a1 < 25.0) return 'Kalp merkezinde genişleme, yüksek empati ve sezgisel yeteneklerde artış görülür. Bedenin elektromanyetik alanı genişler.';
    if (a1 < 40.0) return 'Güçlü plazma akışı devrededir. Işık kodlarının DNA sarmallarına entegrasyonu başlar. Astral seyahat deneyimleri sıklaşabilir.';
    if (a1 < 55.0) return 'Taç çakradan yüksek miktarda kozmik ışık girişi olur. Zaman algısında bükülmeler ve yüksek boyutlu rehberlik alımı gerçekleşir.';
    if (a1 < 70.0) return 'Hücresel düzeyde simyasal dönüşüm dalgası. Kollektif bilinçte büyük uyanış tetiklemeleri, yüksek boyutlu portalların tam açılışı.';
    return 'Zirve enerjisel portal devrede. Sinir sisteminin en yüksek kapasitede çalışması ve kozmik bilinçle bütünleşme anıdır. Bol dinlenme ve topraklanma gerekir.';
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-white overflow-hidden relative font-sans pt-24">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00E5FF] opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4F46E5] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-30">
        
        <button 
          onClick={() => router.back()}
          className="flex items-center text-mystic-text-muted hover:text-white transition-colors mb-8 group cursor-pointer relative z-50"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Geri Dön
        </button>

        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4 text-[#00E5FF]">
            <Sun size={48} className="animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] via-white to-[#4F46E5] tracking-tight mb-4">
            Schumann Rezonansı & Kozmik Enerji
          </h1>
          <p className="text-mystic-text-muted text-lg max-w-2xl mx-auto">
            Gezegenimizin manyetik kalkanındaki dalgalanmaları ve anlık Schumann Rezonansı uyarılma düzeylerini canlı takip edin.
          </p>
        </div>

        {/* 1. Canlı Spektrogram (Sonogram) Modu */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Waves size={22} className="text-[#00E5FF]" />
              Schumann Rezonansı
            </h2>
            <p className="text-xs text-mystic-text-muted mt-1">
              Frekans dalgalanmalarını ve Schumann Rezonansı sonogramını canlı izleyin. Bu veriler Space Observing System 70 (Tomsk, Rusya) rasathanesinden canlı olarak alınmaktadır.
            </p>
          </div>

          {isLoading ? (
            <div className="h-64 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-mystic-text-muted">
              Spektrogram Yükleniyor...
            </div>
          ) : (
            <div className="w-full flex flex-col justify-center items-center py-6 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden group">
              {/* Header block with local and observer times */}
              <div className="flex flex-col sm:flex-row items-center gap-3 px-4 mb-4 text-center z-10 w-full justify-center">
                <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span> Canlı Gözlemevi Ölçümü
                </div>
                {data?.schumann_real && (
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/90 font-semibold font-sans">
                    <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      Yerel Saat: <span className="text-[#00E5FF]">{formatRealTime(data.schumann_real.time_utc)}</span>
                    </span>
                    <span className="text-white/30 font-normal">|</span>
                    <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      Tomsk Saati: <span className="text-[#A78BFA]">{formatTomskTime(data.schumann_real.time_utc)}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Scrollable Spectrogram Container */}
              <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="min-w-[750px] px-4 mt-2 relative">
                  <img 
                    src={`/api/schumann/image?t=${timestamp}`} 
                    alt="Canlı Schumann Rezonans Spektrogramı (Tomsk, Rusya)" 
                    className="w-full h-auto rounded-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>

              <div className="mt-2 text-center px-4">
                <span className="text-xs text-mystic-text-muted">
                  Grafik verileri Space Observing System 70 (Tomsk, Rusya) üzerinden her saat güncellenmektedir. Mobil cihazlarda grafiği yatayda kaydırarak inceleyebilirsiniz.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Schumann Rezonansı Kılavuzu */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md transition-all duration-300">
          <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 mb-6">
            <Info size={24} className="text-[#00E5FF]" />
            Schumann Rezonansı Kılavuzu
          </h3>
          
          {/* Renklerin Anlamı */}
          <div className="mb-8 bg-white/5 border border-white/10 p-5 rounded-2xl">
            <h4 className="text-base font-bold text-[#00E5FF] mb-3 flex items-center gap-2">
              <Sparkles size={16} /> Grafik Renklerinin Anlamı
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full bg-[#000028] border border-white/20 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Mavi/Koyu Mavi</strong>
                  <span className="text-mystic-text-muted">Sakin durum ve arka plan elektromanyetik gürültüsü.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Yeşil</strong>
                  <span className="text-mystic-text-muted">Doğal rezonans frekans çizgileri (7.83, 14, 20 Hz vb.).</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Sarı/Turuncu</strong>
                  <span className="text-mystic-text-muted">Hafif ve orta seviyede enerjisel uyarılma/frekans artışı.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Kırmızı</strong>
                  <span className="text-mystic-text-muted">Aktif manyetik dalgalanmalar ve güçlü plazma akışları.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full bg-white shrink-0 mt-0.5 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <div>
                  <strong className="text-white block">Beyaz</strong>
                  <span className="text-mystic-text-muted">Zirve elektromanyetik uyarılma ve anlık parlamalar.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seviyelere Göre Etkiler */}
          <div className="space-y-6">
            <h4 className="text-base font-bold text-white mb-4">
              Rezonans Seviyeleri, Beden Reaksiyonları ve Ruhsal Rehberlik
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Level G0 - Sakin */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#22D3EE]/20">
                    Sakin Faz (A1 &lt; 8.0)
                  </span>
                  <span className="text-sm font-bold text-white">Dingin Elektromanyetik Akış</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed text-mystic-text-muted">
                  <div>
                    <strong className="text-white block mb-1">⚡ Beden Reaksiyonları:</strong>
                    Zihinsel netlik, dengeli energy seviyeleri, sakin uyku düzeni ve bedensel rahatlık. Olağanüstü bir uyarılma belirtisi beklenmez.
                  </div>
                  <div>
                    <strong className="text-white block mb-1">🧘 Ruhsal Rehberlik:</strong>
                    Zihnin gürültüsünü yatıştırmak, yeni bilgiler öğrenmek, kadim dersleri çalışmak ve kök çakra meditasyonları yapmak için en ideal dönemdir. Enerjinizin merkezlendiği bu dingin zamanı tefekkür ile değerlendirebilirsiniz.
                  </div>
                </div>
              </div>

              {/* Level G0 - Uyarım */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#34D399] bg-[#34D399]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#34D399]/20">
                    Hafif Uyarım (A1 8.0 - 15.0)
                  </span>
                  <span className="text-sm font-bold text-white">Hafif Schumann Dalgalanması</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed text-mystic-text-muted">
                  <div>
                    <strong className="text-white block mb-1">⚡ Beden Reaksiyonları:</strong>
                    Rüyalarda belirgin netleşme ve sembolizm artışı, sezgisel uyanışlar, zihinde yaratıcı fikir patlamaları, kulaklarda hafif dalgalı uğultular ve hafif tatlı bir yorgunluk/esneme hali.
                  </div>
                  <div>
                    <strong className="text-white block mb-1">🧘 Ruhsal Rehberlik:</strong>
                    Uyanış kapıları hafifçe uyarılmaktadır. Meditasyon, günlük tutma, rüya analizleri yapma ve yaratıcı projelere odaklanma için harika bir akıştır. Üçüncü göz bölgesine mavi/mor bir ışık hayal ederek odaklanabilirsiniz.
                  </div>
                </div>
              </div>

              {/* Level G1-G2 */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:border-amber-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#F59E0B]/20">
                    Aktif Seviye (A1 15.0 - 40.0)
                  </span>
                  <span className="text-sm font-bold text-white">Aktif Schumann Manyetik Fırtınası (G1-G2)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed text-mystic-text-muted">
                  <div>
                    <strong className="text-white block mb-1">⚡ Beden Reaksiyonları:</strong>
                    Kalp atışlarında ani hızlanma veya genişleme hissi, vücutta hafif statik elektrik birikimi (dokunulan yerlerin çarpması), hafif eklem ve şakak ağrıları, uykuya dalmakta gecikme ve içsel sabırsızlık.
                  </div>
                  <div>
                    <strong className="text-white block mb-1">🧘 Ruhsal Rehberlik:</strong>
                    Kalp çakrası ve aura alanı genişlemektedir. Bedendeki fazla elektriği boşaltmak için tuzlu su banyosu yapın veya çıplak elle toprağa dokunun. Kalp merkezli nefes pratikleri (4 saniye al, 4 saniye ver) yaparak kozmik akışı bedende dengeleyin.
                  </div>
                </div>
              </div>

              {/* Level G3 */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:border-orange-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#F97316] bg-[#F97316]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#F97316]/20">
                    Güçlü Fırtına (A1 40.0 - 55.0)
                  </span>
                  <span className="text-sm font-bold text-white">Şiddetli Schumann Fırtınası (G3)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed text-mystic-text-muted">
                  <div>
                    <strong className="text-white block mb-1">⚡ Beden Reaksiyonları:</strong>
                    Sinir sisteminde belirgin uyarılma, uyku düzeninde dalgalanmalar (derin uykusuzluk ya da rüya yoğunluğu), baş ve ense bölgesinde hafif basınç, kulaklarda kesintisiz tiz çınlamalar ve çok canlı, sembolik rüyalar.
                  </div>
                  <div>
                    <strong className="text-white block mb-1">🧘 Ruhsal Rehberlik:</strong>
                    DNA sarmallarında uyarım ve ışık kodlarının entegrasyonu aktiftir. Bedeninizi yormadan hafif egzersizler yapın. Bol su tüketin, topraklanın ve yüksek frekanslı meditasyonlara odaklanın.
                  </div>
                </div>
              </div>

              {/* Level G4 */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:border-red-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#EF4444]/20">
                    Ağır Fırtına (A1 55.0 - 70.0)
                  </span>
                  <span className="text-sm font-bold text-white">Ağır Schumann Fırtınası (G4)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed text-mystic-text-muted">
                  <div>
                    <strong className="text-white block mb-1">⚡ Beden Reaksiyonları:</strong>
                    Yoğun fiziksel yorgunluk ve kas seğirmeleri (frekans uyumlanması), baş bölgesinde taç kısmına doğru yayılan basınç, uyku düzeninde derin kaymalar (gece yarısı uyanıp tekrar uyuyamama), zaman algısında geçici bükülmeler.
                  </div>
                  <div>
                    <strong className="text-white block mb-1">🧘 Ruhsal Rehberlik:</strong>
                    Taç çakra portalı tamamen açılmıştır ve yüksek boyutlu ışık bedene geçiş enerjisi aktiftir. Bugün kendinizi zorlayacak fiziksel işlerden kesinlikle kaçının. Taç çakranızdan giren beyaz ışığın bedeninizi yıkayarak yere aktığını imgeleyin.
                  </div>
                </div>
              </div>

              {/* Level G5 */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:border-white/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full uppercase border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    Zirve Fırtına (A1 &gt;= 70.0)
                  </span>
                  <span className="text-sm font-bold text-white">Ekstrem Schumann Rezonans Fırtınası (G5)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed text-mystic-text-muted">
                  <div>
                    <strong className="text-white block mb-1">⚡ Beden Reaksiyonları:</strong>
                    Sinir sisteminin en yüksek kapasitede uyarılması, derin trans benzeri uyku halleri veya mutlak uykusuzluk, baş ve ensede çok yoğun basınç, kulaklarda çok yüksek tonda uğultu/çınlama sesleri, aşırı duyarlılık ve bedensel hafiflik/ağırlık hissi dalgalanmaları.
                  </div>
                  <div>
                    <strong className="text-white block mb-1">🧘 Ruhsal Rehberlik:</strong>
                    Zirve boyutlar arası geçiş portalı ve hücresel simya devrededir. Kollektif bilinçle ve kozmik kaynakla bütünleşme anıdır. Bol alkali su tüketin ve çıplak ayakla nemli toprağa basarak mutlak topraklanma sağlayın. Zihni tamamen susturarak teslimiyet meditasyonu yapın.
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-center text-mystic-text-muted">
            <p>
              Elektromanyetik Schumann verileri Tomsk Gözlemevi (Space Observing System 70, Rusya) kaynaklarından anlık olarak çekilmektedir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
