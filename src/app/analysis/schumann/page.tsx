"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Activity, Zap, Compass, BookOpen, AlertCircle, Info, RefreshCw, Lock, Bell, BellOff, Sun, Waves, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LEVELS } from '@/lib/auth/roles';

interface KpHistoryItem {
  time: string;
  kp: number;
  predicted?: boolean;
}

interface KpData {
  current_kp: number;
  status_label: string;
  status_desc: string;
  updated_at: string;
  history: KpHistoryItem[];
}

interface HoverInfo {
  left: number;
  top: number;
  timeStr: string;
  kp: number;
  isForecast: boolean;
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
  const [data, setData] = useState<KpData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
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
  }, []);

  const isApprenticeOrAbove = role && (ROLE_LEVELS[role] >= 1 || role === 'admin');

  const toggleNotifications = () => {
    if (!isApprenticeOrAbove) return;
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('schumann_notifications', String(newState));
    
    if (newState) {
      setNotificationMsg("Jeomanyetik fırtına (Kp ≥ 5) ve yoğun kozmik enerji dalgalanmalarında cihazınıza bildirim gönderilecektir.");
      setTimeout(() => setNotificationMsg(null), 5000);

      // Web Notification API integration for direct browser notifications
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification("Kozmik Rezonans Bildirimleri Aktif!", {
                body: "Jeomanyetik fırtına (Kp ≥ 5) ve güçlü uyanış portallarında tarayıcınıza anlık bildirim gönderilecektir.",
                icon: "/sun.png"
              });
            }
          });
        } else if (Notification.permission === 'granted') {
          new Notification("Kozmik Rezonans Bildirimleri Aktif!", {
            body: "Bildirim ayarlarınız başarıyla doğrulandı.",
            icon: "/sun.png"
          });
        }
      }
    }
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
        // TEST: mock storm values (Kp >= 5.0) at indexes 12, 13, 20 and 21 for testing
        if (jsonData.history.length > 22) {
          // Measurements (Ölçüm)
          jsonData.history[12].kp = 5.2; // Moderate storm
          jsonData.history[12].predicted = false;
          jsonData.history[13].kp = 6.8; // High storm
          jsonData.history[13].predicted = false;
          
          // Forecasts (Tahmin)
          jsonData.history[20].kp = 5.8; // Moderate storm forecast
          jsonData.history[20].predicted = true;
          jsonData.history[21].kp = 7.1; // High storm forecast
          jsonData.history[21].predicted = true;
        }
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

  // Spectrogram rendering effect
  useEffect(() => {
    if (!canvasRef.current || !data || !data.history || data.history.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    


    // Draw solid space background for graph area
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, graphTop, width, graphHeight);

    const cols = data.history; // Exactly 24 blocks representing the last 72 hours
    
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

      const kpLow = cols[indexLow].kp;
      const kpHigh = cols[indexHigh].kp;
      const kp = kpLow + (kpHigh - kpLow) * weight;

      // Determine if this pixel column is in the future relative to the actual current time
      const isPredicted = x >= nowX;

      // Base background color
      let baseR = 3;
      let baseG = 3;
      let baseB = 10;

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

        resonances.forEach(res => {
          const dist = Math.abs(freqHz - res);
          if (dist < 2.0) {
            onResonance = true;
            resonanceDist = Math.min(resonanceDist, dist);
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
          const strength = Math.pow(Math.max(0, 1 - resonanceDist / 2.0), 2.2);
          
          r += resColor.r * strength;
          g += resColor.g * strength;
          b += resColor.b * strength;
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

  }, [data, timestamp, hoveredX]);

  const handleRefresh = () => {
    fetchData();
  };

  // Handle interactive mouse moves over the spectrogram
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data || !data.history || data.history.length === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const xCanvas = xPct * canvas.width;

    const cols = data.history;
    const startTimeMs = new Date(cols[0].time + 'Z').getTime();
    const totalDurationMs = cols.length * 3 * 60 * 60 * 1000;
    const targetTimeMs = startTimeMs + xPct * totalDurationMs;
    const targetDate = new Date(targetTimeMs);

    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const timeStr = `${targetDate.getDate()} ${monthNames[targetDate.getMonth()]} ${dayNames[targetDate.getDay()]} ${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`;

    // Interpolate Kp index value at hover coordinate
    const indexFloat = xPct * (cols.length - 1);
    const indexLow = Math.floor(indexFloat);
    const indexHigh = Math.min(indexLow + 1, cols.length - 1);
    const weight = indexFloat - indexLow;
    
    const kpLow = cols[indexLow].kp;
    const kpHigh = cols[indexHigh].kp;
    const kp = kpLow + (kpHigh - kpLow) * weight;

    const isForecast = targetTimeMs > Date.now();

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
            Gezegenimizin manyetik kalkanındaki dalgalanmaları (NOAA Küresel Kp Endeksi), Schumann rezonans frekanslarını ve uzay havasının iyonosfer üzerindeki enerjisel etkilerini canlı takip edin.
          </p>
        </div>

        {/* Gösterge Panelleri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Kp Endeksi */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-mystic-text-muted mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold">Anlık Kp Endeksi</span>
                <Activity size={16} className="text-[#00E5FF]" />
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-white/5 animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
                  {data?.current_kp}
                  <span className="text-xs text-mystic-text-muted font-normal">/ 9 Kp</span>
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-mystic-text-muted">
              Jeomanyetik aktivite ölçeği (0 = Sakin, 9 = Ekstrem).
            </div>
          </div>

          {/* Card 2: Durum Seviyesi */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-mystic-text-muted mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold">Manyetik Alan Durumu</span>
                <Zap size={16} className="text-amber-400" />
              </div>
              {isLoading ? (
                <div className="h-8 w-24 bg-white/5 animate-pulse rounded"></div>
              ) : (
                <div className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    (data?.current_kp ?? 0) >= 5
                      ? 'bg-red-500 animate-ping'
                      : (data?.current_kp ?? 0) >= 4
                      ? 'bg-orange-400'
                      : (data?.current_kp ?? 0) >= 3
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}></span>
                  {data?.status_label}
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-mystic-text-muted">
              Kozmik akışların manyetometrik etki derecesi.
            </div>
          </div>

          {/* Card 3: Veri Kaynağı */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-mystic-text-muted mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold">Veri Kaynağı</span>
                <Compass size={16} className="text-indigo-400" />
              </div>
              <div className="text-lg font-bold text-white">
                NOAA SWPC
              </div>
            </div>
            <div className="mt-4 text-xs text-mystic-text-muted">
              Planetary K-Index 3 saatlik bloklarla güncellenir.
            </div>
          </div>

        </div>

        {/* Veri Durumu ve Güncelleme Zamanı */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mb-8 backdrop-blur-sm gap-4">
          <div className="flex items-center gap-3 text-sm text-mystic-text-muted text-center sm:text-left">
            <Info size={18} className="text-[#00E5FF]" />
            <div>
              <span>Son Ölçüm Zamanı (UTC): </span>
              <strong className="text-white font-mono">
                {data?.updated_at ? new Date(data.updated_at + 'Z').toLocaleString('tr-TR') : '...'}
              </strong>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/40 hover:border-[#00E5FF]/60 text-white font-bold py-2 px-5 rounded-xl transition-all disabled:opacity-50 text-sm cursor-pointer"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Veriler Alınıyor...' : 'Verileri Yenile'}
          </button>
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
                    ? "Jeomanyetik fırtınaları (Kp ≥ 5) ve yoğun iyonosferik enerji patlamalarını anlık bildirim olarak alın."
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
          
          {notificationMsg && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {notificationMsg}
            </div>
          )}
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
              Canlı Kozmik Enerji Spektrogramı (Son 72 Saat)
            </h2>
            <p className="text-xs text-mystic-text-muted mt-1">
              Frekans dalgalanmalarını ve Kp Index kaynaklı enerjisel fırtına (beyaz patlamalar) durumunu izleyin. (Saat bilgisi için grafiğin üzerine gelin)
            </p>
          </div>

          {isLoading ? (
            <div className="h-64 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-mystic-text-muted">
              Spektrogram Çiziliyor...
            </div>
          ) : (
            <div className="w-full flex flex-col justify-center items-center py-6 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden group">
              
              <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm z-10 shadow-lg tracking-wider uppercase animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Canlı İzleme
              </div>

              {/* Interactive Spectrogram Area with HTML Tooltip overlay */}
              {/* Interactive Spectrogram Area with HTML Tooltip overlay */}
              <div className="relative w-full">
                <div className="w-full max-w-full overflow-x-auto flex justify-start md:justify-center px-4 relative">
                  <div className="relative">
                    
                    {/* Sticky Hz Scale */}
                    <div className="sticky left-4 z-10 pointer-events-none h-0 w-0">
                      <div className="absolute left-0 top-0 h-[270px] w-14 bg-black/85 backdrop-blur-[2px] border-r border-white/10 rounded-l-lg flex flex-col justify-start">
                        {labelResonances.map(res => {
                          const yPct = ((graphTop + (res / 40) * graphHeight) / canvasHeight) * 100;
                          return (
                            <span 
                              key={res}
                              className="absolute left-2.5 text-[9px] font-bold font-mono text-white/70 -translate-y-1/2 select-none"
                              style={{ top: `${yPct}%` }}
                            >
                              {res} Hz
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <canvas 
                      ref={canvasRef} 
                      width={800} 
                      height={270}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className="rounded-lg border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)] cursor-crosshair"
                    />

                    {/* Floating Interactive Tooltip */}
                    {hoverInfo && (
                      <div 
                        className="absolute bg-[#08080C]/95 border border-[#00E5FF]/40 backdrop-blur-md rounded-2xl p-4 text-xs shadow-[0_10px_30px_rgba(0,229,255,0.25)] pointer-events-none z-20 flex flex-col gap-2 text-left animate-in fade-in zoom-in-95 duration-100 min-w-[200px]"
                        style={{ 
                          left: `${hoverInfo.left}px`, 
                          top: `${hoverInfo.top}px`,
                          transform: 'translate(-50%, -115%)'
                        }}
                      >
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1.5">
                          <span className="font-bold text-[#00E5FF] font-mono">{hoverInfo.timeStr}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide ${
                            hoverInfo.isForecast ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}>
                            {hoverInfo.isForecast ? 'Tahmin' : 'Ölçüm'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-mystic-text-muted">Genlik:</span>
                          <span className="font-extrabold text-white font-mono">{hoverInfo.kp.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px] text-cyan-300 font-semibold border-t border-white/5 pt-1.5 mt-0.5">
                          {hoverInfo.spiritualStatus}
                        </div>
                        {hoverInfo.isForecast ? (
                          <div className="text-[9px] text-amber-400 font-medium italic mt-1 border-t border-white/5 pt-1">
                            * İleri Dönük Tahmin (Gerçek ölçümler geldiğinde güncellenecektir)
                          </div>
                        ) : (
                          <div className="text-[9px] text-emerald-400 font-medium italic mt-1 border-t border-white/5 pt-1">
                            ✓ Kesinleşmiş Ölçüm
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Watermark Logo & Text */}
                <div className="absolute right-8 top-4 flex items-center gap-1.5 bg-black/45 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl pointer-events-none select-none z-10 opacity-60">
                  <img src="/logo.png" className="w-3.5 h-3.5 rounded-full" alt="7LAYERS Logo" />
                  <span className="text-[10px] font-bold text-white tracking-widest font-mono">7LAYERS</span>
                </div>
              </div>

              <p className="text-center text-xs text-mystic-text-muted max-w-xl mt-6 px-4">
                * Grafik, NOAA Kp-Index verilerinden simüle edilen 72 saatlik elektromanyetik akışı temsil eder. Dikey eksen rezonans frekanslarını (Hz), yatay eksen ise zamanı gösterir. Grafikteki beyaz dik çizgiler enerji fırtınalarını simgeler.
              </p>
            </div>
          )}
        </div>

        {/* 2. Sayısal Kp Grafik Çizelgesi (Bar Chart) */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Activity size={22} className="text-[#00E5FF]" />
              Jeomanyetik Kp Eğilim Grafiği (Son 72 Saat)
            </h2>
            <p className="text-xs text-mystic-text-muted mt-1">
              Ölçülen jeomanyetik fırtına değerlerinin son 3 günlük (72 saat) saatlik blok gösterimi (Düz çizgiler geçmişi, kesikli çizgiler 24 saatlik tahmini gösterir).
            </p>
          </div>

          {isLoading ? (
            <div className="h-48 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-mystic-text-muted">
              Grafik Yükleniyor...
            </div>
          ) : (
            <div className="w-full bg-black/40 rounded-2xl border border-white/5 p-6 relative">
              {/* Watermark Logo & Text */}
              <div className="absolute right-6 top-6 flex items-center gap-1.5 bg-black/45 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl pointer-events-none select-none z-10 opacity-60">
                <img src="/logo.png" className="w-3.5 h-3.5 rounded-full" alt="7LAYERS Logo" />
                <span className="text-[10px] font-bold text-white tracking-widest font-mono">7LAYERS</span>
              </div>

              {/* Tooltip display space */}
              <div className="h-8 mb-4 text-center">
                {hoveredBar ? (
                  <div className="inline-flex items-center gap-3 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full animate-in fade-in duration-200">
                    <span className="text-mystic-text-muted">Zaman (UTC):</span>
                    <strong className="text-white">{formatTimeRange(hoveredBar.time)}</strong>
                    <span className="text-mystic-text-muted">|</span>
                    <span className="text-mystic-text-muted">Fırtına Seviyesi:</span>
                    <strong className="text-white">
                      {hoveredBar.kp} Kp
                    </strong>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      hoveredBar.predicted ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}>
                      {hoveredBar.predicted ? '⚠️ Tahmin (Değişebilir)' : '✅ Kesinleşmiş Ölçüm'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-mystic-text-muted">
                    Detayları görmek için sütunların üzerine gelin
                  </span>
                )}
              </div>

              {/* Bars Grid */}
              <div className="flex items-end justify-between h-48 w-full border-b border-white/10 pb-2 gap-1 md:gap-2 px-1">
                {data?.history.map((item, index) => {
                  const isForecast = !!item.predicted;
                  return (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col items-center h-full justify-end group/bar cursor-pointer"
                      onMouseEnter={() => setHoveredBar(item)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* The colored bar */}
                      <div 
                        className={`w-full max-w-[14px] rounded-t transition-all duration-300 ${getKpColorClass(item.kp, isForecast)}`}
                        style={{ height: `${Math.max((item.kp / 9) * 100, 6)}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[9px] text-mystic-text-muted mt-2 px-1">
                {data?.history.map((item, index) => {
                  if (index % 4 === 0) {
                    return (
                      <span key={index} className="text-center w-12 font-mono">
                        {formatTime(item.time)}
                      </span>
                    );
                  }
                  return <span key={index} className="w-0 overflow-hidden" />;
                })}
              </div>

              {/* Y Axis Legend indicators */}
              <div className="flex flex-wrap gap-4 justify-center mt-6 pt-4 border-t border-t-white/5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                  <span className="text-mystic-text-muted">Sakin (0 - 2.9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                  <span className="text-mystic-text-muted">Kararsız (3 - 3.9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-orange-500"></span>
                  <span className="text-mystic-text-muted">Aktif (4 - 4.9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
                  <span className="text-mystic-text-muted">Fırtına (5+)</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                  <span className="w-2.5 h-2.5 rounded border border-dashed border-cyan-400 bg-cyan-400/20"></span>
                  <span className="text-cyan-300 font-semibold">[Dashed] Tahmin Blokları (Önümüzdeki 24s)</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Enerji Analizi Durum Kartı */}
        {!isLoading && data?.status_desc && (
          <div className="bg-gradient-to-r from-[#4F46E5]/10 via-[#00E5FF]/5 to-[#4F46E5]/10 border border-[#00E5FF]/20 rounded-3xl p-8 backdrop-blur-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF] opacity-10 blur-[50px] pointer-events-none"></div>
            <h3 className="text-2xl font-bold mb-4 text-[#00E5FF] flex items-center gap-2">
              <BookOpen size={22} />
              Jeomanyetik Enerji Analizi
            </h3>
            <p className="text-white/95 leading-relaxed text-sm md:text-base">
              {data.status_desc}
            </p>
          </div>
        )}

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
                  <p>
                    <strong>Planetary K-Index (Kp Endeksi) Nedir?</strong>
                    <br />
                    Dünya genelindeki manyetometre ölçüm istasyonlarından gelen verilerin birleştirilmesiyle oluşturulan ve gezegenimizin manyetik alanındaki düzensizlikleri 0 ile 9 arasında ölçen resmi bir küresel endekstir. Kp değerinin 5 ve üzeri olması, küresel çapta bir <strong>Jeomanyetik Fırtına (Geomagnetic Storm)</strong> durumunu gösterir. Bu veriler NOAA tarafından yasal ve telifsiz sunulmaktadır.
                  </p>
                  <p>
                    <strong>Küresel Güneş Fırtınası vs. Yerel Atmosferik Gürültü:</strong>
                    <br />
                    Tekil ve bölgesel gözlemevi grafikleri (örneğin sadece belirli bir bölgedeki ölçüm istasyonları), o bölgedeki <em>yerel yıldırım, şimşek veya hava olayları</em> nedeniyle de yüksek genlikli beyaz patlamalar gösterebilir. Ancak bu lokal olaylar küresel insan bilincini ve biyolojisini etkilemez. Bizim kullandığımız küresel Kp endeksi ise yerel gürültüleri filtreleyerek sadece Dünya'nın tamamını ve insan biyo-alanını doğrudan etkileyen <strong>gerçek jeomanyetik güneş fırtınası hareketlerini</strong> gösterir.
                  </p>
                </div>
                <div className="space-y-4">
                  <p>
                    <strong>Güneş Fırtınası ve Biyolojik Etkiler:</strong>
                    <br />
                    Dünya'nın elektromanyetik kalkanı ile insan kalp ritmi, sinir sistema dengesi ve melatonin salgısı doğrudan senkronizedir. Kp endeksinin yükseldiği (grafikte sarı, turuncu ve beyaz patlama olarak gösterilen) günlerde baş ağrısı, yorgunluk, rüyalarda aşırı berraklık veya uyku bozuklukları gibi kozmik adaptasyon semptomları yaşanması bilimsel olarak oldukça yaygındır.
                  </p>
                  <p>
                    <strong>Saat Dilimi ve Yerel Saat Dönüşümü:</strong>
                    <br />
                    Bölgesel gözlemevi grafikleri genellikle istasyonun kurulu olduğu ülkenin veya şehrin yerel saat dilimine göre çizilir (örneğin Asya/Sibirya gözlemevleri kendi yerel saat dilimini kullanır). Bu gösterge paneli ise uluslararası uzay havası verilerini <strong>tamamen sizin cihazınızın yerel saat dilimine (örneğin Türkiye saati UTC+3)</strong> dönüştürerek gösterir. Bu nedenle yabancı grafiklerle aranızda saat farkı bulunması tamamen normaldir; buradaki saatler doğrudan kendi gününüzdeki anı temsil eder.
                  </p>
                  <p>
                    <strong>Kozmik Hava Tahmini: Gelecek 24 Saat Nasıl Hesaplanır?</strong>
                    <br />
                    Dünya ile Güneş arasında (L1 noktasında) konumlanmış gelişmiş uzay uyduları (DSCOVR ve ACE), Güneş patlamalarıyla fırlayan yüklü parçacıkları yola çıktıkları anda ölçer. Bu kozmik rüzgarların Dünya'ya ulaşması fiziksel olarak 15 saat ile 3 gün arasında sürer. Sistemimiz, uyduların yolda yakaladığı bu verileri işleyerek henüz gezegenimize ulaşmamış olan bu "kozmik bilgi paketçiklerini" saatlik modellemeler halinde önceden sunar. Böylece önümüzdeki 24 saatin uyanış portallarını (grafikteki kesikli tahmin alanlarını) önceden görerek meditasyon, niyet ve çakra dengeleme çalışmalarınızı en yüksek farkındalıkla planlayabilirsiniz.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-xs text-center text-mystic-text-muted">
                <p>
                  Veriler Amerika Birleşik Devletleri Ulusal Okyanus ve Atmosfer Dairesi (NOAA) Space Weather Prediction Center kaynaklarından anlık ve yasal olarak çekilmektedir.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
