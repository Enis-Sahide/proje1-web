"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Zap, Compass, BookOpen, AlertCircle, Info, RefreshCw, Lock, Bell, BellOff, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LEVELS } from '@/lib/auth/roles';

interface KpHistoryItem {
  time: string;
  kp: number;
}

interface KpData {
  current_kp: number;
  status_label: string;
  status_desc: string;
  updated_at: string;
  history: KpHistoryItem[];
}

export default function SchumannPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [data, setData] = useState<KpData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<KpHistoryItem | null>(null);

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
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const getKpColorClass = (kp: number) => {
    if (kp < 3) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-400';
    if (kp < 4) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:bg-amber-400';
    if (kp < 5) return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)] hover:bg-orange-400';
    return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:bg-red-400';
  };

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      const day = dayNames[d.getDay()];
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${hours}:${minutes}`;
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-white overflow-hidden relative font-sans">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00E5FF] opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4F46E5] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        <button 
          onClick={() => router.back()}
          className="flex items-center text-mystic-text-muted hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Geri Dön
        </button>

        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4 text-[#00E5FF]">
            <Sun size={48} className="animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] via-white to-[#4F46E5] tracking-tight mb-4">
            Kozmik Enerji ve Rezonans
          </h1>
          <p className="text-mystic-text-muted text-lg max-w-2xl mx-auto">
            Gezegenimizin manyetik koruma kalkanındaki dalgalanmaları (NOAA Küresel Kp Endeksi) ve uzay havasının insan biyo-alanı üzerindeki enerjisel etkilerini takip edin.
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

          {/* Card 3: Güncelleme Sıklığı */}
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

        {/* Canlı Grafik Paneli (Watermark-free, Custom SVG Bar Chart) */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Activity size={22} className="text-[#00E5FF]" />
              Son 72 Saatlik Jeomanyetik Kp Grafiği
            </h2>
            <p className="text-xs text-mystic-text-muted mt-1">
              Gezegenimizin manyetik kalkanındaki elektromanyetik fırtına eğilimlerini inceleyin.
            </p>
          </div>

          {isLoading ? (
            <div className="h-64 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-mystic-text-muted">
              Grafik Yükleniyor...
            </div>
          ) : (
            <div className="w-full bg-black/40 rounded-2xl border border-white/5 p-6 relative">
              
              {/* Tooltip display space */}
              <div className="h-8 mb-4 text-center">
                {hoveredBar ? (
                  <div className="inline-flex items-center gap-3 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full animate-in fade-in duration-200">
                    <span className="text-mystic-text-muted">Zaman:</span>
                    <strong className="text-white">{formatTime(hoveredBar.time)}</strong>
                    <span className="text-mystic-text-muted">|</span>
                    <span className="text-mystic-text-muted">Değer:</span>
                    <strong className="text-white">{hoveredBar.kp} Kp</strong>
                  </div>
                ) : (
                  <span className="text-xs text-mystic-text-muted">
                    Detayları görmek için sütunların üzerine gelin
                  </span>
                )}
              </div>

              {/* Bars Grid */}
              <div className="flex items-end justify-between h-48 w-full border-b border-white/10 pb-2 gap-1 md:gap-2">
                {data?.history.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex-1 flex flex-col items-center h-full justify-end group/bar cursor-pointer"
                    onMouseEnter={() => setHoveredBar(item)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* The colored bar */}
                    <div 
                      className={`w-full max-w-[14px] rounded-t transition-all duration-300 ${getKpColorClass(item.kp)}`}
                      style={{ height: `${Math.max((item.kp / 9) * 100, 4)}%` }}
                    />
                  </div>
                ))}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-mystic-text-muted mt-2 px-1">
                {data?.history.map((item, index) => {
                  // Only display label for every 4th bar to prevent crowding
                  if (index % 4 === 0) {
                    return (
                      <span key={index} className="text-center w-12 font-mono">
                        {formatTime(item.time).split(' ')[0]} {formatTime(item.time).split(' ')[1]}
                      </span>
                    );
                  }
                  return <span key={index} className="w-0 overflow-hidden" />;
                })}
              </div>

              {/* Y Axis Legend indicators */}
              <div className="flex flex-wrap gap-4 justify-center mt-6 pt-4 border-t border-white/5 text-[10px]">
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

        {/* Bilgilendirme Bölümü */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <Info size={22} className="text-[#00E5FF]" />
            Jeomanyetik Kp İndeksi Nedir?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-mystic-text-muted">
            <div className="space-y-4">
              <p>
                <strong>Planetary K-Index (Kp Endeksi)</strong>, Dünya genelindeki manyetometre ölçüm istasyonlarından gelen verilerin birleştirilmesiyle oluşturulan ve gezegenimizin manyetik alanındaki düzensizlikleri ölçen küresel bir endekstir.
              </p>
              <p>
                0 ile 9 arasında logaritmik bir skala kullanan bu endeks, kozmik rüzgarların ve güneş patlamalarının Dünya manyetosferinde oluşturduğu baskıyı temsil eder. Kp değerinin 5 ve üzeri olması resmi olarak bir **Jeomanyetik Fırtına (Geomagnetic Storm)** durumuna işaret eder.
              </p>
              <p>
                Bu veri akışı, Amerika Birleşik Devletleri Ulusal Okyanus ve Atmosfer Dairesi (NOAA) tarafından **tamamen açık, resmi ve telifsiz** olarak sağlanmaktadır.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                <strong>Güneş Fırtınası ve Biyolojik Etkiler:</strong>
                <br />
                Dünya'nın manyetik alanı ile insan biyolojisi (özellikle kalp ritmi değişkenliği, sinir sistemi dengesi ve melatonin salgısı) arasında yakın bir ilişki vardır. 
              </p>
              <p>
                Kp endeksinin yükseldiği jeomanyetik fırtına günlerinde, insanların biyolojik manyetik dengeleri etkilenerek şu semptomları yaşaması oldukça yaygındır:
                <br />
                * Baş ağrısı ve migren tetiklenmeleri
                <br />
                * Aşırı yorgunluk veya tam aksine uykuya dalamama
                <br />
                * Duygusal hassasiyet ve ani duygu durum değişiklikleri
                <br />
                * Sezgilerin ve rüyaların son derece berraklaşması
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-center text-mystic-text-muted">
            <p>
              Veriler Amerika Birleşik Devletleri Ulusal Okyanus ve Atmosfer Dairesi (NOAA) Space Weather Prediction Center kaynaklarından anlık ve yasal olarak çekilmektedir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
