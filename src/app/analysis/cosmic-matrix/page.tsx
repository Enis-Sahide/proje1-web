"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, Sparkles, Layers, Compass, Shield, 
  RotateCcw, Flame, Droplets, Wind, Mountain, Sun, Moon, 
  CheckCircle2, AlertCircle, Bookmark, Compass as CompassIcon, 
  Eye, Zap, RefreshCw, Leaf
} from 'lucide-react';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import moment from 'moment-timezone';
import { AstroCity } from '@/features/astrology/engine/AstrologyConstants';
import { generateChart } from '@/utils/HumanDesignEngine';
import { 
  synthesizeCosmicMatrix, 
  CosmicMatrixReport, 
  PlanetaryDynamicDiagnosis 
} from '@/features/astrology/engine/CosmicMatrixEngine';

export default function CosmicMatrixPage() {
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
  const [report, setReport] = useState<CosmicMatrixReport | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'inward' | 'outward'>('all');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetaryDynamicDiagnosis | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr || !timeStr || !city) {
      alert("Lütfen doğum tarihi, saati ve şehir bilgilerini eksiksiz girin.");
      return;
    }

    setIsCalculating(true);
    try {
      // 1. Astroloji Harita Hesaplaması
      const astroRes = await fetch('/api/astrology/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localDate: dateStr,
          localTime: timeStr,
          cityData: city
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

      // 3. Kozmik Matris (4 Katman Sentezi)
      const matrixReport = synthesizeCosmicMatrix(
        astroJson.data.planets,
        astroJson.data.aspects,
        hdChart
      );

      setReport(matrixReport);
      if (matrixReport.planetaryDynamics.length > 0) {
        setSelectedPlanet(matrixReport.planetaryDynamics[0]);
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
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 font-sans selection:bg-amber-500/20 selection:text-amber-300 pt-28 pb-20">
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
          <div className="space-y-10">
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
                <button
                  onClick={() => setReport(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition-colors w-fit"
                >
                  <RefreshCw size={14} />
                  <span>Yeni Hesaplama</span>
                </button>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed max-w-4xl">
                {report.coreLifeMission.description}
              </p>
            </div>

            {/* 2. Dört Âlem Katman Dengesi */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
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
                    {report.personalTalisman.purpose}
                  </p>
                  <p className="text-xs text-amber-200/80 italic mt-2">
                    {report.personalTalisman.kabbalisticBridge}
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

            {/* 4. 13 Gezegen Enerji Çalışma Dinamikleri (İçe vs Dışa) */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                    <CompassIcon size={22} className="text-amber-400" />
                    13 Gezegenin Enerji Çalışma Dinamikleri
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Ahlaki etiketler olmadan, enerjinizin içe mi (Yin) yoksa dışa mı (Yang) aktığının somut teşhisi:
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
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

                      {/* Kadim Ağaç & Ortam Aromaterapisi (Güvenli Model) */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/90 flex items-center gap-1.5">
                            <Leaf size={13} className="text-emerald-400" />
                            Kadim Ağaç & Ortam Aromaterapisi
                          </span>
                          <span className="text-[10px] text-gray-500 italic">Harici / Ortam Kokusu</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                            <span className="text-[10px] text-gray-400 block font-semibold">🌲 Kadim Ağaç (Doğa Teması):</span>
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
                  Varlığınız tek bir boyuttan ibaret değildir. Haritanızdaki her bir gezegen gökyüzünde soyut bir göktaşı değil; 
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
                <table className="w-full text-left text-xs text-gray-300">
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
      </div>
    </div>
  );
}
