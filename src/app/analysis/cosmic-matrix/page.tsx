"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Loader2, Sparkles, Layers, Compass, Shield, 
  RotateCcw, Flame, Droplets, Wind, Mountain, Sun, Moon, 
  CheckCircle2, AlertCircle, Bookmark, Compass as CompassIcon, 
  Eye, Zap, RefreshCw, Leaf, Lock, Calendar, Clock, MapPin, User, Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthPromptModal from '@/components/AuthPromptModal';
import { downloadCosmicMatrixPDF } from '@/utils/cosmicMatrixPdfGenerator';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import moment from 'moment-timezone';
import { AstroCity } from '@/features/astrology/engine/AstrologyConstants';
import { generateChart } from '@/utils/HumanDesignEngine';
import { 
  synthesizeCosmicMatrix, 
  synthesizeMultiWorldCosmicMatrix,
  CosmicMatrixReport, 
  MultiWorldCosmicMatrixReport,
  CosmicWorld,
  PlanetaryDynamicDiagnosis 
} from '@/features/astrology/engine/CosmicMatrixEngine';
import { getDruidTreeByDate } from '@/features/astrology/engine/DruidTreeEngine';

const WORLDS_INFO: Array<{
  id: CosmicWorld;
  number: string;
  name: string;
  dimension: string;
  tech: string;
  badge: string;
  icon: string;
  desc: string;
  activeBg: string;
}> = [
  {
    id: 'assiah',
    number: '1. Âlem',
    name: 'Assiah (Beden)',
    dimension: 'Fiziksel Eylem & Tezahür',
    tech: 'Standart Tropikal Harita',
    badge: 'Maddi Dünya & Eylemler',
    icon: '🌍',
    desc: 'Fiziksel bedeninizin dünyevi alışkanlıkları, somut eylem tarzınız ve dünyevi gezegen yerleşimleriniz.',
    activeBg: 'bg-amber-400 text-black font-bold shadow-[0_0_20px_rgba(251,191,36,0.35)]'
  },
  {
    id: 'yetzirah',
    number: '2. Âlem',
    name: 'Yetzirah (Ruh)',
    dimension: 'Duygusal Şifa & Ruhsal Hafıza',
    tech: 'Drakonik Harita',
    badge: 'Ruhsal Hafıza & Düğümler',
    icon: '🌙',
    desc: 'Ruhunuzun derin bilinçaltı hafızası, geçmiş yaşam izleri ve kalbinizin gerçekte hangi enerjilerle şifalanmak istediği.',
    activeBg: 'bg-sky-400 text-black font-bold shadow-[0_0_20px_rgba(56,189,248,0.35)]'
  },
  {
    id: 'beriyah',
    number: '3. Âlem',
    name: 'Beriyah (Zihin)',
    dimension: 'Bilge İrade & Yüksek Dharma',
    tech: '9. Harmonik (Navamsa)',
    badge: 'Yüksek Zihin & Hayat Amacı',
    icon: '☀️',
    desc: 'Yüksek akıl, hayat felsefeniz, kadersel yaşam gayeniz (Dharma) ve zihninizin kurguladığı büyük ilahi mimari.',
    activeBg: 'bg-purple-400 text-black font-bold shadow-[0_0_20px_rgba(192,132,252,0.35)]'
  },
  {
    id: 'atzilut',
    number: '4. Âlem',
    name: 'Atzilut (Kudret)',
    dimension: 'Kozmik Birlik & Saf İrade',
    tech: 'Güneş Merkezli (Heliosentrik)',
    badge: 'Saf Bilinç & Birlik',
    icon: '👑',
    desc: 'Dünya egosundan arınmış, Güneş merkezli saf kozmik irade ve evrensel birliğe hizmet eden ilahi potansiyeliniz.',
    activeBg: 'bg-emerald-400 text-black font-bold shadow-[0_0_20px_rgba(52,211,153,0.35)]'
  }
];

const formatTurkishDate = (dStr: string) => {
  if (!dStr) return '';
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const parts = dStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const mIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (mIdx >= 0 && mIdx < 12) {
      return `${day} ${months[mIdx]} ${year}`;
    }
  }
  return dStr;
};

const renderFormattedText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-amber-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

export default function CosmicMatrixPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const isMasterOrAdmin = role === 'master' || role === 'admin';

  const [name, setName] = useState('');
  const [dateStr, setDateStr] = useState('1990-01-01');
  const [timeStr, setTimeStr] = useState('12:00');
  const [city, setCity] = useState<AstroCity | null>({
    name: 'İstanbul, Türkiye',
    country: 'Turkey',
    lat: 41.0082,
    lon: 28.9784,
    tz: 'Europe/Istanbul'
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [report, setReport] = useState<CosmicMatrixReport | null>(null);
  const [multiReport, setMultiReport] = useState<MultiWorldCosmicMatrixReport | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<CosmicWorld>('assiah');
  const [activeFilter, setActiveFilter] = useState<'all' | 'inward' | 'outward'>('all');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetaryDynamicDiagnosis | null>(null);

  const [bYear, bMonth, bDay] = (dateStr || '1990-01-01').split('-').map(Number);
  const druidTree = getDruidTreeByDate(bDay || 1, bMonth || 1);

  const handleSelectWorld = (world: CosmicWorld) => {
    setSelectedWorld(world);
    if (multiReport) {
      const wRep = multiReport.worlds[world];
      setReport(wRep);
      if (wRep.planetaryDynamics.length > 0) {
        setSelectedPlanet(wRep.planetaryDynamics[0]);
      }
    }
  };

  const handlePurchaseReport = () => {
    const query = new URLSearchParams({
      type: 'cosmic-matrix',
      date: dateStr,
      time: timeStr,
      city: city?.name || '',
      lat: (city?.lat || '').toString(),
      lon: (city?.lon || '').toString(),
      tz: city?.tz || '',
      email: user?.email || '',
      name: name || ''
    }).toString();

    if (!user) {
      setShowAuthModal(true);
      return;
    }
    router.push(`/checkout/guest?${query}`);
  };

  const handleDownloadPdf = async () => {
    const targetReport = multiReport || report;
    if (!targetReport) return;
    try {
      setIsPdfLoading(true);
      await downloadCosmicMatrixPDF(
        targetReport,
        druidTree || null,
        name.trim(),
        {
          localDate: dateStr,
          localTime: timeStr,
          cityName: city?.name || 'İstanbul',
          country: city?.country || 'Türkiye'
        }
      );
    } catch (err) {
      console.error('Kozmik Matris PDF indirme hatası:', err);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr || !timeStr || !city) {
      alert("Lütfen doğum tarihi, saati ve şehir bilgilerini eksiksiz girin.");
      return;
    }

    setIsCalculating(true);
    try {
      // 1. Astroloji Harita Hesaplaması (4 Âlem dahil)
      const astroRes = await fetch('/api/astrology/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localDate: dateStr,
          localTime: timeStr,
          cityData: city,
          calcAllWorlds: true
        })
      });

      const astroJson = await astroRes.json();
      if (!astroJson.success || !astroJson.data) {
        throw new Error(astroJson.error || 'Astroloji verisi hesaplanamadı.');
      }

      // 2. Human Design Harita Hesaplaması
      const dateTimeString = `${dateStr} ${timeStr}`;
      const m = moment.tz(dateTimeString, "YYYY-MM-DD HH:mm", city.tz || 'Europe/Istanbul');
      if (!m.isValid()) {
        alert("Girilen tarih/saat geçerli değil.");
        setIsCalculating(false);
        return;
      }
      const hdChart = generateChart(m.toDate());

      // 3. Kozmik Matris (4 Âlem Sentezi)
      if (astroJson.data.assiah && astroJson.data.yetzirah) {
        const fullMulti = synthesizeMultiWorldCosmicMatrix(
          {
            assiah: astroJson.data.assiah,
            yetzirah: astroJson.data.yetzirah,
            beriyah: astroJson.data.beriyah,
            atzilut: astroJson.data.atzilut
          },
          hdChart
        );
        setMultiReport(fullMulti);
        const cur = fullMulti.worlds[selectedWorld];
        setReport(cur);
        if (cur.planetaryDynamics.length > 0) {
          setSelectedPlanet(cur.planetaryDynamics[0]);
        }
      } else {
        const singleReport = synthesizeCosmicMatrix(
          astroJson.data.planets,
          astroJson.data.aspects,
          hdChart
        );
        setReport(singleReport);
        if (singleReport.planetaryDynamics.length > 0) {
          setSelectedPlanet(singleReport.planetaryDynamics[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Kozmik Matris hesaplanırken bir hata oluştu.');
    } finally {
      setIsCalculating(false);
    }
  };

  const filteredDynamics = report?.planetaryDynamics.filter(d => {
    if (activeFilter === 'all') return true;
    return d.energyDirection === activeFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 font-sans selection:bg-amber-500/20 selection:text-amber-300 pt-28 pb-20 overflow-x-hidden">
      {/* Arka Plan Mistik Işıklandırma */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[130px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Üst Navigasyon */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
          <Link 
            href="/analysis"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Tüm Analizler</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30">
              Master Sentez Analizi
            </span>
          </div>
        </div>

        {/* Usta Seviyesi Kapısı */}
        {!isMasterOrAdmin ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
              <Lock size={36} className="text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Usta Seviyesi Gerektiriyor</h2>
            <p className="text-mystic-text-muted text-base leading-relaxed mb-8 max-w-lg mx-auto">
              7Layers Kozmik Matris Analizi; Astroloji, Kabalistik 4 Âlem, Human Design ve Kadim Futhark Runelerini
              tek bir sentezde birleştiren ileri düzey bir araçtır. Bu analiz yalnızca <strong className="text-amber-300">Usta (Master)</strong> ve üstü seviyelere açıktır.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-black font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-amber-500/25 text-sm cursor-pointer"
              >
                <Sparkles size={18} />
                Seviyeni Yükselt
              </button>
              <button
                onClick={handlePurchaseReport}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 px-6 rounded-2xl border border-white/20 transition-all text-sm cursor-pointer shadow-lg hover:border-amber-500/40"
              >
                <Lock size={16} className="text-amber-400" />
                <span>PDF Raporunu Satın Al (1.111 TL)</span>
              </button>
            </div>
            <p className="text-xs text-mystic-text-muted mt-5">
              Mevcut seviyeniz: <span className="text-amber-400 font-semibold capitalize">{role || 'Üye'}</span>
            </p>
          </div>
        ) : (
          <>
        {/* Giriş & Form Alanı */}
        {!report ? (
          <div className="max-w-3xl mx-auto text-center space-y-8 py-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-medium tracking-wide">
                <Sparkles size={14} className="text-amber-400" />
                Astroloji × Kabala × Human Design × Rune
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                7Layers Kozmik Matris
              </h1>
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Ruhsal varlığınızı 4 kadim katmanda (Astroloji, 4 Âlem, Human Design ve Kadim Futhark Runeleri) aynı anda okuyun. Ahlaki etiketler olmadan, enerjinizin içe mi yoksa dışa mı aktığını keşfedin.
              </p>
            </div>

            <form onSubmit={handleCalculate} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Adınız & Soyadınız (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Deniz Yılmaz"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Doğum Saati
                  </label>
                  <input
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Doğum Yeri
                  </label>
                  <LocationAutocomplete
                    defaultDisplay={city?.name || ''}
                    onSelect={(c) => setCity(c)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold text-base transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Kozmik Katmanlar Hesaplanıyor...</span>
                    </>
                  ) : (
                    <>
                      <Compass size={20} />
                      <span>Kozmik Matris Analizini Başlat</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* SONUÇ EKRANI */
          <div className="space-y-8">
            {/* 0. Doğum Künyesi & Analiz Edilen Kişi Bilgileri */}
            <div className="bg-gradient-to-r from-amber-500/15 via-black/70 to-purple-500/15 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <User size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400 block">7Layers Sentez Künyesi</span>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                      {name.trim() ? `${name.trim()} - Kozmik Matris Sentezi` : 'Kozmik Matris Sentez Künyesi'}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isPdfLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isPdfLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>{isPdfLoading ? 'PDF Hazırlanıyor...' : 'PDF Raporu İndir'}</span>
                  </button>

                  <button
                    onClick={() => setReport(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
                  >
                    <RefreshCw size={14} />
                    <span>Yeni Hesaplama</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 rounded-xl px-3.5 py-2.5">
                  <Calendar size={16} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Doğum Tarihi</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-200">
                      {formatTurkishDate(dateStr)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 rounded-xl px-3.5 py-2.5">
                  <Clock size={16} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Doğum Saati</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-200">
                      {timeStr || '12:00'}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 bg-black/40 border border-white/5 rounded-xl px-3.5 py-2.5">
                  <MapPin size={16} className="text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Doğum Yeri</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-200 truncate block" title={city?.name}>
                      {city?.name || 'Bilinmiyor'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 0.1 Kompakt Ruhsal Kök Ağacı & Gezegen Frekans Rehberi */}
            {druidTree && (
              <div className="bg-gradient-to-r from-emerald-950/40 via-black/70 to-emerald-900/20 border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🌲</span>
                    <div>
                      <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold block">
                        Ruhsal Kök Ağacınız (Kelt / Druid)
                      </span>
                      <span className="text-base sm:text-lg font-bold text-white">
                        {druidTree.name} <span className="text-xs font-normal text-emerald-300/80 italic font-sans">({druidTree.botanicalName})</span>
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/25 px-3 py-1 rounded-xl w-fit text-xs">
                    <span className="text-gray-400">Ogham:</span>
                    <span className="text-lg text-emerald-400 font-serif font-bold leading-none">{druidTree.oghamSymbol}</span>
                    <span className="text-gray-300 font-medium">({druidTree.oghamName})</span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Doğum gününüz gereği ruhsal rezonansınız ve doğadaki kökünüz <strong className="text-emerald-300 font-semibold">{druidTree.name}</strong> ile temas halindedir. Aşağıdaki 13 gezegen kartında analiz edilen bitkisel frekanslar ve aromaterapiler ise sizin ağaç kimliğiniz olmayıp; haritanızdaki göksel enerjileri içe ve dışa aktarırken dengelemek üzere kadim ilkelerle eşleştirilmiştir.
                  </p>
                  <p className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Hangi gezegeninizin hangi bitkisel koku ve frekansla dengelendiğini aşağıdaki analizlerden inceleyebilirsiniz.</span>
                  </p>
                </div>
              </div>
            )}

            {/* 1. Başlık & Yaşam Misyonu */}
            <div className="bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-transparent border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    <Sparkles size={14} />
                    <span>Ruhsal Tekâmül & Kozmik Kod</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {name ? `${name} - ` : ''}{report.coreLifeMission.title}
                  </h1>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed max-w-4xl">
                {renderFormattedText(report.coreLifeMission.description)}
              </p>
            </div>

            {/* 2. Dört Âlem Katman Dengesi */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Layers size={20} className="text-amber-400" />
                  Kabalistik Dört Âlem Enerji Dağılımı
                </h2>
                <span className="text-xs text-gray-400">
                  Baskın Düzlem: <b className="text-amber-300">{report.fourWorldsBalance.dominantWorld}</b>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Mountain size={16} />
                      <span>Assiah (Eylem)</span>
                    </div>
                    <span className="text-sm font-bold text-white">%{report.fourWorldsBalance.assiah.percentage}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-700" style={{ width: `${report.fourWorldsBalance.assiah.percentage}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">{report.fourWorldsBalance.assiah.theme}</p>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                      <Droplets size={16} />
                      <span>Yetzirah (Duygu)</span>
                    </div>
                    <span className="text-sm font-bold text-white">%{report.fourWorldsBalance.yetzirah.percentage}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full rounded-full transition-all duration-700" style={{ width: `${report.fourWorldsBalance.yetzirah.percentage}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">{report.fourWorldsBalance.yetzirah.theme}</p>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Wind size={16} />
                      <span>Beriyah (Zihin)</span>
                    </div>
                    <span className="text-sm font-bold text-white">%{report.fourWorldsBalance.beriyah.percentage}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-700" style={{ width: `${report.fourWorldsBalance.beriyah.percentage}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">{report.fourWorldsBalance.beriyah.theme}</p>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                      <Flame size={16} />
                      <span>Atzilut (Kudret)</span>
                    </div>
                    <span className="text-sm font-bold text-white">%{report.fourWorldsBalance.atzilut.percentage}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full rounded-full transition-all duration-700" style={{ width: `${report.fourWorldsBalance.atzilut.percentage}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">{report.fourWorldsBalance.atzilut.theme}</p>
                </div>
              </div>
            </div>

            {/* 3. Kişiye Özel Kadim Rune Mührü (Tılsım Formülü) */}
            <div className="bg-gradient-to-r from-amber-950/30 via-black/40 to-purple-950/30 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
                    ᚱ Kişiye Özel Kadim Rune Mührü & Tılsım Formülü
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    {report.personalTalisman.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 bg-black/50 border border-amber-400/30 rounded-2xl px-6 py-3">
                  {report.personalTalisman.symbols.map((sym, sIdx) => (
                    <span key={`sym-${sIdx}`} className="text-3xl sm:text-4xl text-amber-300 font-serif">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Mührün Amacı & Etkisi
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {renderFormattedText(report.personalTalisman.purpose)}
                  </p>
                  <p className="text-xs text-amber-200/80 italic mt-2">
                    {renderFormattedText(report.personalTalisman.kabbalisticBridge)}
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2.5">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                    Nasıl Uygulanır? (Ritüel & Kullanım)
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {report.personalTalisman.usageInstructions}
                  </p>
                  {report.personalTalisman.incenseAndHerbs && (
                    <div className="pt-2 border-t border-white/10 flex items-start gap-1.5 text-[11px] text-emerald-300/90 leading-relaxed">
                      <Leaf size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Ortam Tütsüsü & Aromaterapi:</strong> {report.personalTalisman.incenseAndHerbs}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4 Âlem Bilinç Katmanı Seçicisi */}
            <div className="bg-gradient-to-r from-amber-950/20 via-black/50 to-purple-950/20 border border-amber-500/25 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1 flex items-center gap-1.5">
                    <Layers size={15} className="text-amber-400" /> Kabalistik 4 Âlem Bilinç Katmanı Teşhisi
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Hangi Âleminizin Frekansını İnceliyorsunuz?
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                    13 Gezegen enerjiniz sabit ve tek boyutlu değildir. Bedeninizde (Assiah), ruhunuzda (Yetzirah), zihninizde (Beriyah) veya saf özünüzde (Atzilut) hangi potansiyeli aktive ettiğinizi aşağıdan seçerek 13 gezegeninizin o katmandaki yerleşimlerini ve reçetelerini inceleyebilirsiniz:
                  </p>
                </div>
              </div>

              {/* 4 Katman Kart Butonları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {WORLDS_INFO.map((w) => {
                  const isSelected = selectedWorld === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectWorld(w.id)}
                      className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 group ${
                        isSelected 
                          ? `${w.activeBg} scale-[1.02]` 
                          : 'bg-black/40 border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{w.icon}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isSelected ? 'bg-black/20 border-black/30 text-black' : 'bg-white/5 border-white/10 text-gray-400'
                        }`}>
                          {w.tech}
                        </span>
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                          isSelected ? 'text-black/80' : 'text-amber-400'
                        }`}>
                          {w.number}
                        </span>
                        <h4 className={`text-base font-bold leading-tight ${isSelected ? 'text-black' : 'text-white'}`}>
                          {w.name}
                        </h4>
                        <p className={`text-xs mt-1 line-clamp-1 ${isSelected ? 'text-black/90 font-medium' : 'text-gray-400'}`}>
                          {w.dimension}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Aktif Katman Ezoterik Rehber Notu */}
              {(() => {
                const curW = WORLDS_INFO.find(w => w.id === selectedWorld) || WORLDS_INFO[0];
                return (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3 text-xs text-gray-300">
                    <div className="text-2xl shrink-0 mt-0.5">{curW.icon}</div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{curW.name} Frekansı Aktif:</span>
                        <span className="text-amber-300 font-semibold">[{curW.tech} • {curW.dimension}]</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {curW.desc} Aşağıdaki 13 gezegen teşhisi, burç yerleşimleri, enerji akış yönelimleri (İçe/Dışa) ve dengeleyici bitkisel buhur reçeteleri doğrudan <strong>{curW.name}</strong> katmanına göre güncellenmiştir.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Frekans Aynası Entegrasyon & Tespit Kartı */}
              <div className="bg-gradient-to-r from-sky-950/40 via-black/40 to-blue-950/30 border border-sky-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                    <Zap size={15} /> Frekans Aynası ile Aktif Katmanınızı Keşfedin
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                    Şu anki hayat sınavınızda hangi âleminizi (Beden, Ruh, Zihin veya Kudret) çalıştırdığınızı bilmiyor musunuz? <strong>Frekans Aynası</strong> analiziyle güncel gökyüzü tetikleyicilerinizi sorgulayabilir, tutumunuza göre hangi katmanda olduğunuzu netleştirip buradaki ilgili reçeteyi uygulayabilirsiniz.
                  </p>
                </div>
                <Link
                  href="/analysis/frekans-aynasi"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-all shrink-0 shadow-lg shadow-sky-500/20"
                >
                  <Eye size={14} /> Frekans Aynası'nı Aç
                </Link>
              </div>
            </div>

            {/* 4. 13 Gezegen Enerji Çalışma Dinamikleri (İçe vs Dışa) */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                    <CompassIcon size={22} className="text-amber-400" />
                    13 Gezegenin Enerji Çalışma Dinamikleri
                    <span className="text-sm font-sans font-normal text-amber-300/90 ml-2 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                      {WORLDS_INFO.find(w => w.id === selectedWorld)?.name || 'Assiah'}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Seçilen bilinç katmanında ({WORLDS_INFO.find(w => w.id === selectedWorld)?.tech || 'Tropikal'}), enerjinizin içe mi (Yin) yoksa dışa mı (Yang) aktığının somut teşhisi:
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 self-start sm:self-auto max-w-full">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeFilter === 'all' 
                        ? 'bg-amber-400 text-black font-bold' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Tümü ({report.planetaryDynamics.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('inward')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeFilter === 'inward' 
                        ? 'bg-indigo-500 text-white font-bold' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    İçe Yönelimli ({report.planetaryDynamics.filter(d => d.energyDirection === 'inward').length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('outward')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeFilter === 'outward' 
                        ? 'bg-amber-500 text-black font-bold' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Dışa Yönelimli ({report.planetaryDynamics.filter(d => d.energyDirection === 'outward').length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredDynamics.map((dyn) => {
                  const isInward = dyn.energyDirection === 'inward';
                  return (
                    <div
                      key={`dyn-${dyn.planetKey}`}
                      className="bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-3xl p-6 space-y-4 transition-all"
                    >
                      {/* Kart Başlığı */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-2xl text-white">
                            {dyn.symbol}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                              {dyn.planetName}
                              {dyn.isRetrograde && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                                  Retro
                                </span>
                              )}
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-normal">
                                {dyn.house}. Ev ({dyn.sign})
                              </span>
                            </h3>
                            <span className="text-xs text-amber-300/80 font-medium">
                              {dyn.archetypeTheme}
                            </span>
                          </div>
                        </div>

                        {/* Yönelim Rozeti */}
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                            isInward
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {isInward ? 'İçe Yönelimli (Yin)' : 'Dışa Yönelimli (Yang)'}
                          </span>
                          <span className="block text-[11px] text-gray-400 mt-1">
                            Kapı {dyn.gate}.{dyn.line} · {dyn.center} ({dyn.isCenterDefined ? 'Tanımlı' : 'Açık'})
                          </span>
                        </div>
                      </div>

                      {/* Somut Davranış Refleksi */}
                      <div className={`p-4 rounded-2xl border ${
                        isInward 
                          ? 'bg-indigo-950/20 border-indigo-500/30' 
                          : 'bg-amber-950/20 border-amber-500/30'
                      } space-y-1.5`}>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                          🎯 Sende Görülen Somut Davranış Refleksi
                        </span>
                        <p className="text-sm font-medium text-white leading-relaxed">
                          {dyn.activeManifestation}
                        </p>
                        <p className="text-xs text-gray-300/80 leading-relaxed pt-1">
                          {dyn.neutralExplanation}
                        </p>
                      </div>

                      {/* Dengeleyici Rune & Kabala Kutusu */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-black/40 rounded-2xl p-3.5 border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                              <span className="text-base">{dyn.balancingRune.symbol}</span>
                              <span>Rune: {dyn.balancingRune.name}</span>
                            </span>
                            <span className="text-[10px] text-gray-400">{dyn.balancingRune.stone}</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {dyn.balancingRune.balancingAction}
                          </p>
                        </div>

                        <div className="bg-black/40 rounded-2xl p-3.5 border border-white/5 space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
                            Kabala: {dyn.kabbalahSephira} ({dyn.kabbalahWorld})
                          </span>
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {dyn.kabbalahLesson}
                          </p>
                        </div>
                      </div>

                      {/* Çıkış ve Denge Reçetesi */}
                      <div className="bg-emerald-950/20 rounded-2xl p-3.5 border border-emerald-500/30 flex items-start gap-2.5">
                        <span className="text-emerald-400 text-base mt-0.5">💡</span>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                            Pratik Dengeleme Reçetesi
                          </span>
                          <p className="text-xs text-emerald-100/90 leading-relaxed">
                            {dyn.practicalRemedy}
                          </p>
                        </div>
                      </div>

                      {/* Kadim Gezegen Bitkisi & Ortam Aromaterapisi */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/90 flex items-center gap-1.5">
                            <Leaf size={13} className="text-emerald-400" />
                            Gezegen Aromaterapi & Frekans Dengeleyici
                          </span>
                          <span className="text-[10px] text-gray-500 italic">Harici / Ortam Buhuru</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                            <span className="text-[10px] text-gray-400 block font-semibold">🌿 Dengeleyici Bitkisel Frekans:</span>
                            <span className="text-white font-medium">{dyn.botanical.tree}</span>
                          </div>
                          <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                            <span className="text-[10px] text-gray-400 block font-semibold">🌸 Ortam Uçucu Yağı (Buhurdanlık):</span>
                            <span className="text-white font-medium">{dyn.botanical.essentialOil}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-snug">
                          {dyn.botanical.theme}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Bütünleşik 5 Katman Çapraz Okuma Matrisi (Tablo) */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Bookmark size={20} className="text-amber-400" />
                  5 Katman Bütünleşik Matris Tablosu
                </h2>
                <span className="text-xs text-gray-400">
                  Astroloji × Kabala × Human Design × Rune × Biyofizik
                </span>
              </div>

              {/* Açıklayıcı Rehber Bilgi Kutusu */}
              <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-sky-500/10 border border-amber-500/25 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <Sparkles size={15} className="text-amber-400 shrink-0" />
                  <span>Bu Tabloyu Nasıl Okumalısınız? (Kozmik Röntgen Rehberi)</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                  Bu matris tablosu, yukarıda her bir gezegeniniz için adım adım detaylandırdığımız 5 derin katmanın tek bir bakışta görülebilen <strong className="text-amber-300">bütünsel kozmik haritası ve röntgen özetidir</strong>. 
                  Varlığınız tek bir boyuttan ibaret değildir; yukarıdaki analizlerde incelediğiniz gibi haritanızdaki her bir gezegen gökyüzünde soyut bir göktaşı değil; 
                  zihninizde bir sahne <strong className="text-amber-300">(Astroloji)</strong>, ruhunuzda ilahi bir kapı <strong className="text-purple-300">(Kabala)</strong>, hücrelerinizde genetik bir devre <strong className="text-emerald-300">(Human Design)</strong>, 
                  auranızda dengeleyici bir mühür <strong className="text-amber-200">(Kadim Futhark Runesi)</strong> ve etten kemikten bedeninizde somut bir merkezdir <strong className="text-sky-300">(Çakra & Biyofizik)</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-white/10 text-[11px]">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-amber-400 font-bold block">1. Astroloji</span>
                    <span className="text-gray-400 block leading-snug">Bu enerji dünyevi hayatınızda hangi alanda (Ev) ve tarzda (Burç) yaşanıyor?</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-purple-400 font-bold block">2. Kabala (Sefira)</span>
                    <span className="text-gray-400 block leading-snug">Ruhunuz bu enerjiyi Hayat Ağacı’nın hangi kapısında ve hangi âlemde deneyimliyor?</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-emerald-400 font-bold block">3. Human Design</span>
                    <span className="text-gray-400 block leading-snug">Bedeninizdeki genetik devre (Kapı), davranış çizgisi ve psikolojik merkez neresidir?</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-amber-300 font-bold block">4. Kadim Rune</span>
                    <span className="text-gray-400 block leading-snug">Bu frekans dengesini kaybettiğinde onu hizalayacak kadim arketip ve şifa mührü nedir?</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-sky-400 font-bold block">5. Beden & Çakra</span>
                    <span className="text-gray-400 block leading-snug">Bu enerji fiziksel bedeninizde nereye depolanır ve bloke olursa hangi bölge alarm verir?</span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto bg-white/[0.02] border border-white/10 rounded-3xl shadow-2xl">
                <table className="w-full min-w-[640px] text-left text-xs text-gray-300">
                  <thead className="bg-white/5 uppercase tracking-wider text-gray-400 font-bold border-b border-white/10">
                    <tr>
                      <th className="py-4 px-4">Gezegen</th>
                      <th className="py-4 px-4">1. Astroloji</th>
                      <th className="py-4 px-4">2. Kabala (Sefira)</th>
                      <th className="py-4 px-4">3. Human Design</th>
                      <th className="py-4 px-4">4. Kadim Futhark Runesi</th>
                      <th className="py-4 px-4">5. Beden & Çakra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {report.items.map((item) => (
                      <tr key={`row-${item.planetKey}`} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <span className="text-base text-amber-300">{item.symbol}</span>
                          <span>{item.planetName}</span>
                        </td>
                        <td className="py-3 px-4">
                          {item.astrology.house}. Ev · {item.astrology.sign}
                          {item.astrology.isRetrograde && (
                            <span className="ml-1 text-[10px] text-rose-400 font-semibold">(R)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-purple-300 font-semibold">{item.kabbalah.sephira}</span>
                          <span className="block text-[10px] text-gray-400">{item.kabbalah.world}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#32D74B] font-semibold">Kapı {item.humanDesign.gate}.{item.humanDesign.line}</span>
                          <span className="block text-[10px] text-gray-400">{item.humanDesign.center}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-amber-300">
                          {item.rune.symbol} {item.rune.name}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          <div>{item.chakra.name}</div>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/90 mt-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            🌲 {item.botanical.tree.split('&')[0].replace(/\(.*?\)/g, '').trim()} · 🌸 {item.botanical.essentialOil.split('&')[0].replace(/\(.*?\)/g, '').trim()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Güvenlik & Tıbbi Sorumluluk Uyarısı */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-start gap-3 text-xs text-gray-400">
                <Shield size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong className="text-amber-300 font-semibold">Güvenlik & Enerjetik Bilgilendirme:</strong> Bu sayfada yer alan kadim ağaç ve aromaterapi eşleşmeleri sembolik doğa teması, açık hava topraklanması ve ortam buhurdanlığı/difüzör frekansına dayanır. Kesinlikle dahili tüketim (yeme, içme, kaynatma), tıbbi tedavi veya ilaç niteliği taşımaz. Sağlık konularında daima uzman hekiminize danışınız.
                </p>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl={`/checkout/guest?type=cosmic-matrix&date=${dateStr}&time=${timeStr}&city=${encodeURIComponent(city?.name || '')}&lat=${city?.lat || ''}&lon=${city?.lon || ''}&tz=${city?.tz || ''}&name=${encodeURIComponent(name || '')}`}
      />
    </div>
  );
}
