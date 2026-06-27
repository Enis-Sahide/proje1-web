"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCw, Activity, Zap, Waves, Compass, BookOpen, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SchumannData {
  activity_index: number;
  activity_index_label: string;
  schumann_index: number;
  schumann_frequency_hz: number;
  kp_index: number;
  kp_label: string;
  solar_flare_index: number;
  solar_flare_class: string;
  geomagnetic_status: string;
  summary: string;
  tip: string;
  updated_at: string;
}

export default function SchumannPage() {
  const router = useRouter();
  const [data, setData] = useState<SchumannData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sonogram' | 'frequency' | 'amplitude' | 'quality'>('sonogram');
  const [timestamp, setTimestamp] = useState<number>(Date.now());

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
      console.error('Schumann API fetch error:', err);
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

  // Helper to translate activity labels to Turkish
  const getActivityLabelTr = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'calm': return 'Sakin';
      case 'moderate': return 'Orta Derece';
      case 'active': return 'Aktif';
      case 'very_active': return 'Çok Aktif';
      case 'extreme': return 'Olağanüstü Aktif';
      default: return label || 'Bilinmiyor';
    }
  };

  const getGeomagneticLabelTr = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'quiet': return 'Sakin';
      case 'unsettled': return 'Kararsız';
      case 'active': return 'Aktif';
      case 'storm': return 'Fırtına';
      default: return label || 'Bilinmiyor';
    }
  };

  const getTabImageUrl = () => {
    switch (activeTab) {
      case 'sonogram':
        return `https://sos70.ru/provider.php?file=shm.jpg&t=${timestamp}`;
      case 'frequency':
        return `https://sos70.ru/provider.php?file=srf.jpg&t=${timestamp}`;
      case 'amplitude':
        return `https://sos70.ru/provider.php?file=sra.jpg&t=${timestamp}`;
      case 'quality':
        return `https://sos70.ru/provider.php?file=srq.jpg&t=${timestamp}`;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'sonogram': return 'Canlı Spektrogram (Sonogram)';
      case 'frequency': return 'Frekans Modları (Hz)';
      case 'amplitude': return 'Genlik (Güç) Modları';
      case 'quality': return 'Q-Faktörü (Kalite)';
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
            <Waves size={48} className="animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] via-white to-[#4F46E5] tracking-tight mb-4">
            Schumann Rezonansı
          </h1>
          <p className="text-mystic-text-muted text-lg max-w-2xl mx-auto">
            Dünya'nın kalp atışlarını, anlık elektromanyetik rezonansını ve uzay havasının iyonosfer üzerindeki enerjisel etkilerini takip edin.
          </p>
        </div>

        {/* Gösterge Paneli */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Schumann Index */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-mystic-text-muted mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold">Schumann Endeksi</span>
                <Activity size={16} className="text-[#00E5FF]" />
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-white/5 animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-extrabold text-white">
                  {data?.schumann_index ?? '7.83'} <span className="text-xs text-mystic-text-muted font-normal">Hz</span>
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-mystic-text-muted">
              Temel frekans: 7.83 Hz rezonans gücü.
            </div>
          </div>

          {/* Card 2: Aktivite Seviyesi */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-mystic-text-muted mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold">Aktivite Seviyesi</span>
                <Zap size={16} className="text-amber-400" />
              </div>
              {isLoading ? (
                <div className="h-8 w-24 bg-white/5 animate-pulse rounded"></div>
              ) : (
                <div className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    data?.activity_index_label === 'very_active' || data?.activity_index_label === 'extreme'
                      ? 'bg-red-500 animate-ping'
                      : data?.activity_index_label === 'active'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}></span>
                  {getActivityLabelTr(data?.activity_index_label ?? 'calm')}
                  <span className="text-xs font-normal text-mystic-text-muted">({data?.activity_index ?? 0}/100)</span>
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-mystic-text-muted">
              İyonosferik elektromanyetik aktivite endeksi.
            </div>
          </div>

          {/* Card 3: Jeomanyetik Durum (Kp) */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-mystic-text-muted mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold">Jeomanyetik (Kp)</span>
                <Compass size={16} className="text-indigo-400" />
              </div>
              {isLoading ? (
                <div className="h-8 w-24 bg-white/5 animate-pulse rounded"></div>
              ) : (
                <div className="text-xl font-extrabold text-white">
                  Kp {data?.kp_index ?? 0} <span className="text-xs font-normal text-mystic-text-muted">({getGeomagneticLabelTr(data?.kp_label ?? 'quiet')})</span>
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-mystic-text-muted">
              Dünya manyetik alanındaki fırtına endeksi.
            </div>
          </div>

          {/* Card 4: Güneş Parlaması */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-mystic-text-muted mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold">Güneş Parlaması</span>
                <Zap size={16} className="text-[#ff5e00]" />
              </div>
              {isLoading ? (
                <div className="h-8 w-20 bg-white/5 animate-pulse rounded"></div>
              ) : (
                <div className="text-xl font-extrabold text-white">
                  Sınıf {data?.solar_flare_class ?? 'C1.0'}
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-mystic-text-muted">
              Radyasyon akışı ve güneş patlama yoğunluğu.
            </div>
          </div>

        </div>

        {/* Veri Durumu ve Güncelleme Butonu */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mb-8 backdrop-blur-sm gap-4">
          <div className="flex items-center gap-3 text-sm text-mystic-text-muted text-center sm:text-left">
            <Info size={18} className="text-[#00E5FF]" />
            <div>
              <span>Veri Güncelleme Zamanı (Yerel): </span>
              <strong className="text-white font-mono">
                {data?.updated_at ? new Date(data.updated_at).toLocaleString('tr-TR') : '...'}
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

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <div>
              <p className="font-bold">Bir bağlantı hatası oluştu</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Canlı Görselleştirme Paneli */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Activity size={22} className="text-[#00E5FF]" />
              {getTabTitle()}
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'sonogram', label: 'Spektrogram (Sonogram)' },
                { id: 'frequency', label: 'Frekans' },
                { id: 'amplitude', label: 'Genlik' },
                { id: 'quality', label: 'Kalite' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
                      : 'bg-black/40 border-white/10 text-mystic-text-muted hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col justify-center items-center py-6 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden group">
            {/* Live Indicator overlay */}
            <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm z-10 shadow-lg tracking-wider uppercase animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Canlı İzleme
            </div>
            
            {/* The Image */}
            <img 
              src={getTabImageUrl()} 
              alt={getTabTitle()}
              className="max-w-full h-auto rounded-lg border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:scale-[1.01]"
              onError={(e) => {
                // Handle fallback if image loading fails
                (e.target as HTMLImageElement).src = "/placeholder-chart.png";
              }}
            />

            <p className="text-center text-xs text-mystic-text-muted max-w-xl mt-6 px-4">
              * Tomsk Uzay Gözlem İstasyonu verileri anlık olarak çizilmektedir. Grafikteki dikey eksen frekansı (0-40 Hz), yatay eksen ise son 3 günün saatlik değişimini (Tomsk yerel saatiyle) gösterir.
            </p>
          </div>
        </div>

        {/* Yapay Zeka Günlük Enerji Özeti */}
        {!isLoading && data?.summary && (
          <div className="bg-gradient-to-r from-[#4F46E5]/10 via-[#00E5FF]/5 to-[#4F46E5]/10 border border-[#00E5FF]/20 rounded-3xl p-8 backdrop-blur-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF] opacity-10 blur-[50px] pointer-events-none"></div>
            <h3 className="text-2xl font-bold mb-4 text-[#00E5FF] flex items-center gap-2">
              <BookOpen size={22} />
              Günün Kozmik Rezonans Analizi
            </h3>
            <p className="text-white/90 leading-relaxed text-sm md:text-base mb-6">
              {data.summary}
            </p>
            {data.tip && (
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Rezonans Tavsiyesi</h4>
                <p className="text-xs text-mystic-text-muted leading-relaxed italic">
                  "{data.tip}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bilgilendirme Bölümü */}
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <Info size={22} className="text-[#00E5FF]" />
            Schumann Rezonansı Nedir?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-mystic-text-muted">
            <div className="space-y-4">
              <p>
                <strong>Schumann Rezonansı (SR)</strong>, Dünya yüzeyi ile iletken iyonosfer tabakası arasında oluşan boşlukta sıkışan son derece düşük frekanslı (ELF) elektromanyetik dalgaların küresel çapta rezonansa girmesiyle oluşan doğal bir fenomendir.
              </p>
              <p>
                Bu rezonanslar, gezegen genelinde saniyede ortalama 50 kez çakan şimşek deşarjları tarafından uyarılır ve beslenir. İyonosfer boşluğunun geometrisi nedeniyle bu dalgalar sürekli olarak Dünya etrafında döner ve belirli harmoniklerde zirve yapar.
              </p>
              <p>
                Bu rezonansların en güçlüsü ve temeli yaklaşık olarak <strong>7.83 Hz</strong> frekansındadır ve bu nedenle bilim insanları ve ezoterik çevreler tarafından <em>"Dünya'nın Kalp Atışı"</em> veya <em>"Kozmik Akort Çatalı"</em> olarak nitelendirilir.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                <strong>İnsan Biyolojisi Üzerindeki Etkileri:</strong>
                <br />
                7.83 Hz frekansı, insan beynindeki <strong>Alfa ve Theta beyin dalgalarının sınır çizgisine</strong> denk gelir. Bu durum, insan biyolojisinin gezegenin elektromanyetik nabzıyla evrimsel olarak uyumlandığını gösterir.
              </p>
              <p>
                Schumann frekansının normalin üzerine çıktığı (grafikte parlak beyaz görünen) aktif dönemlerde, insanların sezgiselliklerinde artış, rüyalarında berraklık veya tam tersi olarak baş ağrısı, yorgunluk, anksiyete ve uyku bozuklukları gibi fiziksel adaptasyon semptomları yaşayabildiği gözlenmektedir.
              </p>
              <p>
                Bu aktif elektromanyetik günlerde meditasyon yapmak, doğada yürüyerek topraklanmak (grounding), bol su tüketmek ve çakraları dengelemek kozmik uyumlanma sürecinizi kolaylaştırır.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-center text-mystic-text-muted">
            <p>
              Veriler Tomsk Uzay Gözlem İstasyonu (TSU, Rusya), GFZ Potsdam ve NOAA Space Weather Center kaynaklarından derlenmektedir.
            </p>
            <p className="mt-1">
              Schumann verilerinin bu şekilde derlenmesi ve kompozit indekslenmesi ResonanceOne projesine atfedilmiştir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
