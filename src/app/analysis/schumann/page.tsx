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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationLevel, setNotificationLevel] = useState<'G1' | 'G2' | 'G3'>('G1');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<KpHistoryItem | null>(null);
  
  // Interactive Hover Spectrogram State
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  
  // Accordion Guide State
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Load notification state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('schumann_notifications');
    if (saved === 'true') {
      setNotificationsEnabled(true);
    }
    const savedLevel = localStorage.getItem('schumann_notification_level');
    if (savedLevel === 'G1' || savedLevel === 'G2' || savedLevel === 'G3') {
      setNotificationLevel(savedLevel);
    }
  }, []);

  const isApprenticeOrAbove = role && (ROLE_LEVELS[role] >= 1 || role === 'admin');

  const toggleNotifications = () => {
    if (!isApprenticeOrAbove) return;
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('schumann_notifications', String(newState));
    
    if (newState) {
      setNotificationMsg(`Fırtına uyarısı ${notificationLevel} ve üzeri seviyelerde tetiklenecek şekilde ayarlandı.`);
      setTimeout(() => setNotificationMsg(null), 5000);

      // Web Notification API integration for direct browser notifications
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification("Kozmik Rezonans Bildirimleri Aktif!", {
                body: "Seçtiğiniz fırtına seviyeleri ve üzeri iyonosferik enerji patlamalarında anlık bildirim gönderilecektir.",
                icon: "/logo.png"
              });
            }
          });
        } else if (Notification.permission === 'granted') {
          new Notification("Kozmik Rezonans Bildirimleri Aktif!", {
            body: "Bildirim ayarlarınız başarıyla doğrulandı.",
            icon: "/logo.png"
          });
        }
      }
    }
  };

  const getNotificationBody = (a1: number) => {
    if (a1 >= 70.0) {
      return "Etkiler: Yoğun baş/ense basıncı, kulak uğultusu, derin trans hali. Öneri: Çıplak ayakla nemli toprağa basın ve alkali su tüketin.";
    }
    if (a1 >= 55.0) {
      return "Etkiler: Yoğun yorgunluk, kas seğirmeleri, uyku kayması. Öneri: Fiziksel işlerden kaçının, beyaz ışık imgelemesi yapın.";
    }
    if (a1 >= 40.0) {
      return "Etkiler: Uykusuzluk, baş/ense basıncı, kulak çınlaması. Öneri: Hafif egzersizler yapın ve bol su tüketin.";
    }
    if (a1 >= 15.0) {
      return "Etkiler: Kalp merkezinde uyarılma, statik elektriklenme. Öneri: Tuzlu su banyosu yapın veya çıplak elle toprağa dokunun.";
    }
    return "Enerji alanı dengelidir. Meditasyon ve köklenmek için en uygun zamandır.";
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/schumann');
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

      // Trigger browser notifications if enabled
      const savedNotifications = localStorage.getItem('schumann_notifications') === 'true';
      const savedLevel = (localStorage.getItem('schumann_notification_level') || 'G1') as 'G1' | 'G2' | 'G3';
      
      if (savedNotifications && jsonData.triggered_g_level && jsonData.schumann_real) {
        const triggeredLevel = jsonData.triggered_g_level;
        const lastNotifLevel = localStorage.getItem('schumann_last_notification_level');
        const lastNotifTimeStr = localStorage.getItem('schumann_last_notification_time');
        
        let shouldNotify = false;
        const currentTime = Date.now();
        const lastTime = lastNotifTimeStr ? parseInt(lastNotifTimeStr) : 0;
        
        const levels = ['G1', 'G2', 'G3', 'G4', 'G5'];
        const userThresholdIdx = levels.indexOf(savedLevel);
        const triggeredIdx = levels.indexOf(triggeredLevel);
        
        if (triggeredIdx >= userThresholdIdx) {
          if (currentTime - lastTime < 3 * 60 * 60 * 1000) {
            // Within 3 hours, notify ONLY if the new level is higher than the last notified level
            const lastNotifiedIdx = lastNotifLevel ? levels.indexOf(lastNotifLevel) : -1;
            if (triggeredIdx > lastNotifiedIdx) {
              shouldNotify = true;
            }
          } else {
            // More than 3 hours have passed, notify anyway
            shouldNotify = true;
          }
        }
        
        if (shouldNotify) {
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            const bodyText = getNotificationBody(jsonData.schumann_real.a1);
            new Notification(`🚨 Schumann Rezonansı Yükseldi: ${triggeredLevel}`, {
              body: bodyText,
              icon: "/logo.png"
            });
            localStorage.setItem('schumann_last_notification_level', triggeredLevel);
            localStorage.setItem('schumann_last_notification_time', String(currentTime));
          }
        }
      }
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

  const generateRulesAnalysis = (score: number, speed: number, density: number, bz: number, bt: number, kp: number, a1: number, f1: number) => {
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

    // 4. Sakin ve Dengeli Durum
    return {
      title: 'Dingin Elektromanyetik Akış (Sakin Faz)',
      science: `Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana frekansı ${f1.toFixed(2)} Hz (Genlik A1: ${a1.toFixed(1)}) seviyesinde dengeli ve doğal titreşiminde seyrediyor. İyonosfer tabakası sakin durumda.`,
      symptoms: 'Zihinsel netlik, dengeli enerji seviyeleri, sakin uyku düzeni ve bedensel rahatlık. Olağanüstü bir uyarılma belirtisi beklenmez.',
      spiritual: 'Zihnin gürültüsünü yatıştırmak, yeni bilgiler öğrenmek, kadim dersleri çalışmak ve kök çakra meditasyonları yapmak için en ideal dönemdir. Enerjinizin merkezlendiği bu dingin zamanı tefekkür ile değerlendirebilirsiniz.'
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

  const getSchumannLevelLabel = (score: number) => {
    if (score < 3.0) return 'Düşük Seviye (Sakin / G0)';
    if (score < 5.0) return 'Hafif Uyarım (Aktif / G0)';
    if (score < 6.0) return 'Orta Fırtına (G1 Seviyesi)';
    if (score < 7.0) return 'Güçlü Fırtına (G2 Seviyesi)';
    if (score < 8.0) return 'Şiddetli Fırtına (G3 Seviyesi)';
    if (score < 9.0) return 'Ağır Fırtına (G4 Seviyesi)';
    return 'Zirve Patlama (Ekstrem G5 Fırtınası)';
  };

  const getSchumannEsotericTitle = (score: number) => {
    if (score < 3.0) return 'Topraklanma & Entegrasyon';
    if (score < 5.0) return 'Hafif Uyarım & Uyanış Kapısı';
    if (score < 6.0) return 'Kalp Çakrası Açılımı & Sezgi Sıçraması';
    if (score < 7.0) return 'DNA Aktivasyonu & Astral Kapı';
    if (score < 8.0) return 'Taç Çakra Portalı & Işık Gövde Geçişi';
    if (score < 9.0) return 'Boyutlar Arası Geçiş & Hücresel Simya';
    return 'Ekstrem Kozmik Bütünleşme & Hücresel Simya';
  };

  const getSchumannEsotericDesc = (score: number) => {
    if (score < 3.0) return 'Enerji alanı dengelidir. Alınan kozmik bilgilerin entegrasyonu, meditasyon ve köklenmek için en uygun zamandır.';
    if (score < 5.0) return 'Hafif uyarım fazı. Rüyalarda netleşme ve aurada temizlik başlar. Yeni frekanslara uyumlanmak için kapı açılmıştır.';
    if (score < 6.0) return 'Kalp merkezinde genişleme, yüksek empati ve sezgisel yeteneklerde artış görülür. Bedenin elektromanyetik alanı genişler.';
    if (score < 7.0) return 'Güçlü plazma akışı devrededir. Işık kodlarının DNA sarmallarına entegrasyonu başlar. Astral seyahat deneyimleri sıklaşabilir.';
    if (score < 8.0) return 'Taç çakradan yüksek miktarda kozmik ışık girişi olur. Zaman algısında bükülmeler ve yüksek boyutlu rehberlik alımı gerçekleşir.';
    if (score < 9.0) return 'Hücresel düzeyde simyasal dönüşüm dalgası. Kollektif bilinçte büyük uyanış tetiklemeleri, yüksek boyutlu portalların tam açılışı.';
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
            Gezegenimizin manyetik kalkanındaki dalgalanmaları, güneş rüzgarı hareketlerini ve anlık/tahmini Schumann Rezonans uyarılma düzeylerini canlı takip edin.
          </p>
        </div>

        {/* 1. Yol Kural Tabanlı Kozmik Durum Analizi */}
        {!isLoading && (
          (() => {
            // Determine active metrics (simulated or live)
            let a1 = data?.schumann_real?.a1 ?? 6.0;
            let f1 = data?.schumann_real?.f1 ?? 7.83;
            
            if (simulatedA1 !== null) {
              a1 = simulatedA1;
              f1 = 7.83 + (simulatedA1 / 75.0) * 0.5;
            }

            const score = simulatedA1 !== null ? getSchumannScoreFromA1(simulatedA1) : (data?.cosmic_impact_score ?? 0.5);
            
            // Keep solar wind and Kp index strictly at their live values (do not simulate)
            const activeKp = data?.current_kp ?? 0;
            const speed = data?.solar_wind?.speed ?? 350;
            const density = data?.solar_wind?.density ?? 4;
            const bz = data?.solar_wind?.bz ?? 0;
            const bt = data?.solar_wind?.bt ?? 5;

            const analysis = generateRulesAnalysis(score, speed, density, bz, bt, activeKp, a1, f1);

            return (
              <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8 relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Background glowing effects */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#4F46E5]/10 blur-[60px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00E5FF]/5 blur-[40px] rounded-full pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    {/* Big glowing score badge */}
                    {(() => {
                      const badge = getSchumannBadgeStyle(score);
                      return (
                        <div 
                          className={`${badge.bgColor} border w-20 h-20 rounded-2xl flex flex-col justify-center items-center shrink-0 relative transition-all duration-300 overflow-hidden`}
                          style={{
                            borderColor: badge.borderColor,
                            boxShadow: `0 0 20px ${badge.shadowColor}`
                          }}
                        >
                          <span className="text-[8px] text-mystic-text-muted uppercase font-bold tracking-wider mb-1">Seviye</span>
                          {/* Inner glowing column/bar */}
                          <div className="w-3.5 h-7 bg-white/10 rounded-md relative overflow-hidden mb-1 border border-white/5">
                            <div 
                              className="w-full absolute bottom-0 transition-all duration-300"
                              style={{
                                height: `${Math.max(10, score * 10)}%`,
                                backgroundColor: score < 3.0 ? '#22D3EE' : score < 5.0 ? '#34D399' : score < 7.0 ? '#EF4444' : '#FFFFFF',
                                boxShadow: `0 0 10px ${score < 3.0 ? '#22D3EE' : score < 5.0 ? '#34D399' : score < 7.0 ? '#EF4444' : '#FFFFFF'}`
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-white/50 font-semibold">
                            A1: {a1.toFixed(1)}
                          </span>
                        </div>
                      );
                    })()}

                    <div>
                      <span className="text-[9px] font-extrabold tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#00E5FF]/20">
                        KOZMİK ORACLE / DURUM RAPORU {data?.schumann_real && `- GÖZLEM SAATİ: ${formatRealTime(data.schumann_real.time_utc)}`}
                      </span>
                      <h2 className="text-xl font-extrabold text-white mt-1.5 flex flex-wrap items-center gap-2">
                        {analysis.title}
                        <span className="relative flex items-center justify-center group/level-tooltip">
                          <span 
                            className="text-[10px] font-extrabold px-3 py-1 rounded-full transition-all duration-300 cursor-help shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10"
                            style={{
                              color: score >= 7.0 ? '#000000' : '#FFFFFF',
                              backgroundColor: score < 3.0 ? '#0891B2' : score < 5.0 ? '#059669' : score < 7.0 ? '#DC2626' : '#FFFFFF',
                              boxShadow: score < 3.0 ? '0 0 10px rgba(8, 145, 178, 0.4)' : score < 5.0 ? '0 0 10px rgba(5, 150, 105, 0.4)' : score < 7.0 ? '0 0 10px rgba(220, 38, 38, 0.4)' : '0 0 15px rgba(255, 255, 255, 0.8)'
                            }}
                          >
                            {getSchumannLevelLabel(score)}
                          </span>
                          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 p-3 bg-[#181124] border border-[#8b5cf6]/40 text-[11px] text-white/90 rounded-xl opacity-0 group-hover/level-tooltip:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-2xl text-justify normal-case font-normal leading-relaxed">
                            <strong className="text-white block mb-1">Ezoterik Anlam: {getSchumannEsotericTitle(score)}</strong>
                            {getSchumannEsotericDesc(score)}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#181124]"></span>
                          </span>
                        </span>
                      </h2>
                    </div>
                  </div>

                  {/* Info button with tooltip */}
                  <span className="relative flex items-center justify-center group/tooltip md:mr-2 self-end md:self-center">
                    <span className="cursor-pointer text-white/30 hover:text-white transition-colors bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <Info size={16} />
                    </span>
                    <span className="absolute top-full mt-2 right-0 w-72 p-3.5 bg-[#181124] border border-[#8b5cf6]/40 text-[11px] text-white/90 rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-2xl text-justify leading-relaxed font-sans normal-case">
                      <strong>Schumann Rezonansı Seviyeleri:</strong><br />
                      Fiziksel A1 genlik aralıkları (4.0 - 75.0+) ve spektrogram renk yoğunluğunu temel alan Schumann uyarılma göstergesidir:
                      <br />• Sakin Faz (A1 &lt; 8.0) - Mavi
                      <br />• Hafif Uyarım (A1 &lt; 15.0) - Yeşil
                      <br />• G1-G2 Aktif Seviye (A1 &lt; 40.0) - Kırmızı
                      <br />• G3-G5 Seviyeleri (A1 &ge; 40.0) - Beyaz
                      <span className="absolute bottom-full right-4 border-4 border-transparent border-b-[#181124]"></span>
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bilimsel Teşhis */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <span>🔬</span> Bilimsel Teşhis
                      </h4>
                      <p className="text-sm text-white/85 leading-relaxed text-justify font-sans">
                        {analysis.science}
                      </p>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="relative flex items-center gap-1 group/obs-tooltip cursor-help text-[11px] text-[#00E5FF]/70 hover:text-[#00E5FF] transition-colors font-semibold">
                          <span>🌐</span> Rasathane Ölçüm Notu ⓘ
                          <span className="absolute bottom-full mb-2 left-0 w-72 p-3 bg-[#181124] border border-[#00E5FF]/40 text-[11px] text-white/90 rounded-xl opacity-0 group-hover/obs-tooltip:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-2xl text-justify normal-case font-normal leading-relaxed">
                            Spektrogram verileri Tomsk (Rusya) Rasathanesi'nden alınmaktadır. Schumann Rezonansı küresel bir fenomen olsa da, ölçülen genlik seviyeleri ve anlık beyaz parlamalar istasyon çevresindeki yerel yıldırım fırtınalarından da etkilenebilmektedir.
                            <span className="absolute top-full left-6 border-4 border-transparent border-t-[#181124]"></span>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Beden Reaksiyonları */}
                  <div className="bg-black/30 border border-[#D4AF37]/20 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-20%] w-16 h-16 bg-[#D4AF37]/5 blur-[20px] rounded-full pointer-events-none"></div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <span>⚡</span> Beden Reaksiyonları
                      </h4>
                      <p className="text-sm text-white/85 leading-relaxed text-justify font-sans">
                        {analysis.symptoms}
                      </p>
                    </div>
                  </div>

                  {/* Ruhsal Rehberlik */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[13px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <span>🧘</span> Ruhsal Rehberlik
                      </h4>
                      <p className="text-sm text-white/85 leading-relaxed text-justify font-sans">
                        {analysis.spiritual}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {/* Kozmik Enerji Simülatörü Kartı */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8 relative overflow-hidden">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Kozmik Enerji Simülatörü
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Test Paneli
                </span>
              </h3>
              <p className="text-xs text-mystic-text-muted mt-1">
                Farklı Schumann A1 genlik seviyelerinin etkilerini ve renk değişimlerini test edin
              </p>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-mystic-text-muted font-semibold">A1 4.0</span>
              <input 
                type="range" 
                min="4.0" 
                max="75.0" 
                step="0.5" 
                value={simulatedA1 !== null ? simulatedA1 : (data?.schumann_real?.a1 ?? 6.0)}
                onChange={(e) => setSimulatedA1(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                style={{ accentColor: '#D4AF37' }}
              />
              <span className="text-xs text-mystic-text-muted font-semibold">A1 75.0</span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
              <div className="text-sm text-mystic-text-muted flex items-center gap-2">
                <span>Simüle Edilen Değer:</span>
                <strong className={simulatedA1 !== null ? "text-[#D4AF37] font-bold text-[15px]" : "text-white font-bold text-[15px]"}>
                  {simulatedA1 !== null ? `A1 Genliği ${simulatedA1.toFixed(1)}` : 'Canlı Akış'}
                </strong>
              </div>
              {simulatedA1 !== null && (
                <button 
                  onClick={() => setSimulatedA1(null)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold py-1.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Canlı Veriye Dön
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <div>
              <p className="font-bold">Bir bağlantı hatası oluştu</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
          </div>
        )}

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





        {/* Kozmik Rezonans Bildirimleri Kartı */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${isApprenticeOrAbove ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20' : 'bg-white/5 text-mystic-text-muted border border-white/5'}`}>
                {notificationsEnabled && isApprenticeOrAbove ? <Bell className="animate-bounce" size={24} /> : <BellOff size={24} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Kozmik Rezonans Bildirimleri
                  {!isApprenticeOrAbove && (
                    <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={10} /> Çırak Seviyesi
                    </span>
                  )}
                </h3>
                <p className="text-xs text-mystic-text-muted mt-1 max-w-xl">
                  {isApprenticeOrAbove 
                    ? "Şık Kapısı fırtına uyarısı (G1, G2 veya G3 ve üzeri) iyonosferik enerji patlamalarında tarayıcınıza anlık bildirim gönderilecektir."
                    : "Bu özellik Çırak seviyesi ve üzeri üyelerimiz içindir. Seviyenizi yükselterek bildirimleri aktif edebilirsiniz."}
                </p>
              </div>
            </div>
            
            <div>
              {isApprenticeOrAbove ? (
                <button
                  onClick={toggleNotifications}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer flex items-center gap-2 ${
                    notificationsEnabled
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {notificationsEnabled ? 'Bildirimler Açık' : 'Bildirimleri Aç'}
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold px-4 py-2.5 rounded-xl backdrop-blur-sm select-none">
                  <Lock size={14} /> Kilitli
                </div>
              )}
            </div>
          </div>

          {notificationsEnabled && isApprenticeOrAbove && (
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-mystic-text-muted uppercase tracking-wider">Hassasiyet Seviyesi</span>
              <div className="flex flex-wrap gap-2">
                {(['G1', 'G2', 'G3'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setNotificationLevel(level);
                      localStorage.setItem('schumann_notification_level', level);
                      setNotificationMsg(`Fırtına uyarısı ${level} ve üzeri seviyelerde tetiklenecek şekilde ayarlandı.`);
                      setTimeout(() => setNotificationMsg(null), 5000);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      notificationLevel === level
                        ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {level} ve Üzeri
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {notificationMsg && (
            <div className="mt-4 p-3 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-xl text-[#00E5FF] text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
              {notificationMsg}
            </div>
          )}
        </div>



        {/* Bilgilendirme Bölümü (Açılır/Kapanır) */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md transition-all duration-300">
          <button 
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
          >
            <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <Info size={24} className="text-[#00E5FF] group-hover:rotate-12 transition-transform" />
              Jeomanyetik Rezonans Kılavuzu
            </h3>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-mystic-text-muted group-hover:text-white transition-colors">
              {isGuideOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {isGuideOpen && (
            <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-mystic-text-muted">
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl mb-4">
                    <strong className="text-white">Grafiklerin Yapısı ve Okunması:</strong>
                    <div className="mt-2 text-xs leading-relaxed flex flex-col gap-2">
                      <p>
                        <strong>• Schumann Rezonans Spektrogramı:</strong> Elektromanyetik alanın dikey eksende frekans (0 - 40 Hz), yatay eksende ise zaman bazlı uyarılma düzeyini gösterir. Bu grafik, Space Observing System 70 (Tomsk, Rusya) rasathanesinde bulunan ELF alıcı antenleri aracılığıyla doğrudan yeryüzünden ölçülen gerçek zamanlı elektromanyetik sonogram verilerini temsil eder. Zaman dilimi farkını en üstteki çift göstergeli anlık zaman panelinden (Yerel Saat ve Tomsk Saati) takip edebilirsiniz.
                      </p>
                    </div>
                  </div>

                  <p>
                    <strong>Kozmik Oracle / Durum Raporu Nedir?</strong>
                    <br />
                    Gözlemevinden alınan canlı Schumann Rezonansı genliğini (A1) ve spektrogram uyarım dalgalarını anlık olarak inceleyen yerel kural motorudur. Bu motor, rezonanstaki dalgalanmaları yorumlayarak size üç alanda bilgi verir:
                    <br />
                    <span className="text-white font-semibold">• 🔬 Bilimsel Teşhis:</span> İyonosferde gerçekleşen fiziksel olayların bilimsel açıklaması.
                    <br />
                    <span className="text-white font-semibold">• ⚡ Beden Reaksiyonları:</span> Rezonans değişimlerinin sinir sistemi, uyku düzeni ve baş bölgesi üzerindeki olası fiziksel etkileri.
                    <br />
                    <span className="text-white font-semibold">• 🧘 Ruhsal Rehberlik:</span> Enerjiyi topraklamak, aura alanını korumak ve uyanış kapılarından faydalanmak için önerilen meditasyon ve nefes pratikleri.
                  </p>
                </div>

                <div className="space-y-4">
                  <p>
                    <strong>Kozmik Enerji Simülatörü (Test Paneli):</strong>
                    <br />
                    Uygulamadaki test sürgüsü yardımıyla Schumann A1 Genlik değerini (4.0 - 75.0 arası) manuel olarak değiştirebilirsiniz. Sürgüyü oynattığınızda, Kozmik Oracle teşhisi, beden reaksiyonları ve ruhsal rehberlik önerileri senkronize bir şekilde güncellenerek yüksek rezonans titreşimlerinin etkilerini test etmenizi sağlar. "Canlı Veriye Dön" butonuyla gerçek verilere dönebilirsiniz.
                  </p>

                  <p>
                    <strong>Saat Dilimi ve Yerel Saat Dönüşümü:</strong>
                    <br />
                    Bölgesel gözlemevi grafikleri üzerinde (örneğin Tomsk ELF grafiğinin eksenlerinde) yazan saatler istasyonun yerel saatidir. Spektrogram görselinin hemen üzerine yerleştirdiğimiz çift zaman göstergeli panel ise, son ölçüm anını hem kendi cihazınızın yerel saat dilimine (örneğin Türkiye saati) dönüştürerek hem de Tomsk yerel saatiyle birlikte gösterir. Bu sayede grafik üzerindeki zaman dilimi farkını görselin hemen üstündeki zaman panelinden kolayca takip edebilirsiniz.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-xs text-center text-mystic-text-muted">
                <p>
                  Elektromanyetik Schumann verileri Tomsk Gözlemevi (Space Observing System 70, Rusya) kaynaklarından anlık olarak çekilmektedir.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
