"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shield,
  Eye,
  Compass,
  KeyRound,
  Zap,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers
} from 'lucide-react';
import AnalysisBackButton from '@/components/ui/AnalysisBackButton';
import { useAuth } from '@/context/AuthContext';
import {
  analyzePersonalSymbolCodes,
  SymbolCodeAnalysisResult,
  PersonalSymbolCodeItem
} from '@/features/numerology/engine/SymbolCodeEngine';

export default function SymbolCodesAnalysisPage() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState('Bahadır');
  const [birthDate, setBirthDate] = useState('1995-03-17');
  const [birthTime, setBirthTime] = useState('');
  const [result, setResult] = useState<SymbolCodeAnalysisResult | null>(null);

  // Hangi harita aşamasının görüntülendiği:
  // 'stage1_body' -> 3. Haritayı çalıştırmadığı sürece aktif olan 1. Harita (Beden Haritası) Kodları
  // 'stage2_upper' -> 3. Haritayı çalıştırmaya başladığında değişen Üst Harita Kodları
  const [activeMapStage, setActiveMapStage] = useState<'stage1_body' | 'stage2_upper'>('stage1_body');

  const [selectedStage1Id, setSelectedStage1Id] = useState<string>('body-karmic-soul');
  const [selectedStage2Id, setSelectedStage2Id] = useState<string>('soul-urge');
  const [showAllExpanded, setShowAllExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qName = params.get('name');
      const qBirth = params.get('birthDate');
      const qTime = params.get('birthTime');

      const savedName = localStorage.getItem('7layers_last_numerology_name');
      const savedBirth = localStorage.getItem('7layers_last_numerology_birthdate');
      const savedTime = localStorage.getItem('7layers_last_numerology_birthtime');
      const initialName = qName || savedName || (user as any)?.name || (user as any)?.fullName || 'Bahadır';
      const initialBirth = qBirth || savedBirth || (user as any)?.birthDate || '1995-03-17';
      const initialTime = qTime || savedTime || '';

      setFullName(initialName);
      setBirthDate(initialBirth);
      setBirthTime(initialTime);
      const computed = analyzePersonalSymbolCodes(initialName, initialBirth, initialTime || undefined);
      setResult(computed);
    }
  }, [user]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !birthDate) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('7layers_last_numerology_name', fullName);
      localStorage.setItem('7layers_last_numerology_birthdate', birthDate);
      localStorage.setItem('7layers_last_numerology_birthtime', birthTime);
    }
    const computed = analyzePersonalSymbolCodes(fullName, birthDate, birthTime || undefined);
    setResult(computed);
    if (birthTime && birthTime.includes(':')) {
      setSelectedStage1Id('birth-time-portal');
    }
  };

  // 1. AŞAMA (1. HARİTA — BEDEN HARİTASI KODLARI):
  // Kişi 3. Haritayı çalıştırmadığı sürece Üst Benlikten mesaj aldığı çekirdek Beden Haritası kodları
  const stage1BodyCodes = result
    ? [
        result.codes.find((c) => c.id === 'body-karmic-soul'),
        result.codes.find((c) => c.id === 'body-field-code'),
        result.codes.find((c) => c.id === 'karmic-debt'),
        result.codes.find((c) => c.id === 'birth-code'),
        result.codes.find((c) => c.id === 'life-path'),
        result.codes.find((c) => c.id === 'planet-ruler'),
        result.codes.find((c) => c.id === 'birth-time-portal')
      ].filter((c): c is PersonalSymbolCodeItem => Boolean(c))
    : [];

  // 2. AŞAMA (3. HARİTA — ÜST HARİTAYI ÇALIŞTIRMAYA BAŞLADIĞINDA DEĞİŞEN YENİ KODLAR):
  const stage2UpperCodes = result
    ? [
        result.codes.find((c) => c.id === 'soul-urge'),
        result.codes.find((c) => c.id === 'aura-protection'),
        result.codes.find((c) => c.id === 'bridge-code'),
        result.codes.find((c) => c.id === 'chaldean-compound'),
        result.codes.find((c) => c.id === 'maturity-code'),
        result.codes.find((c) => c.id === 'upper-planet-ruler'),
        result.codes.find((c) => c.id === 'outer-persona'),
        result.codes.find((c) => c.id === 'hidden-passion'),
        result.codes.find((c) => c.id === 'subconscious-self')
      ].filter((c): c is PersonalSymbolCodeItem => Boolean(c))
    : [];

  const renderDetailCard = (codeItem: PersonalSymbolCodeItem) => (
    <div
      key={codeItem.id}
      className="rounded-2xl bg-gradient-to-br from-white/[0.06] via-[#0D101B] to-black border p-5 sm:p-7 space-y-5 shadow-xl mt-4"
      style={{ borderColor: `${codeItem.color}55` }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full border"
              style={{
                color: codeItem.color,
                borderColor: `${codeItem.color}55`,
                backgroundColor: `${codeItem.color}18`
              }}
            >
              {codeItem.layerBadge}
            </span>
            <span className="text-xs text-gray-400 font-medium">{codeItem.subLabel}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white pt-1">
            {codeItem.title}: <span style={{ color: codeItem.color }}>{codeItem.codeValue}</span>
          </h3>
          <p className="text-sm font-semibold text-[#D4AF37]">{codeItem.archetypeTitle}</p>
        </div>

        <div
          className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0 self-start md:self-center"
          style={{
            borderColor: `${codeItem.color}66`,
            backgroundColor: `${codeItem.color}15`
          }}
        >
          <span className="text-[9px] uppercase font-bold text-gray-300">KOD</span>
          <span className="text-xl font-black" style={{ color: codeItem.color }}>
            {codeItem.codeValue}
          </span>
        </div>
      </div>

      {/* Doğrudan Anlam Özeti */}
      <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
        <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1 flex items-center gap-1.5">
          <Sparkles size={13} />
          Bu Kod Sizin İçin Ne Anlama Geliyor?
        </div>
        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">{codeItem.summary}</p>
      </div>

      {/* Derin Açıklama Maddeleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {codeItem.sections.map((sec, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl bg-black/50 border border-white/10 space-y-1.5 ${
              codeItem.sections.length % 2 === 1 && idx === codeItem.sections.length - 1
                ? 'md:col-span-2'
                : ''
            }`}
          >
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={15} style={{ color: codeItem.color }} className="shrink-0" />
              {sec.heading}
            </h4>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {sec.content}
            </p>
          </div>
        ))}
      </div>

      {/* Kadim Sembol & Kutsal Geometri */}
      <div
        className="p-4 rounded-xl border bg-gradient-to-r from-[#D4AF37]/10 via-black/60 to-transparent space-y-2.5"
        style={{ borderColor: `${codeItem.color}55` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
            <Eye size={15} />
            {codeItem.isCoreSynchronicityCode
              ? 'Kadim Sembol & Üst Benlik Eşzamanlılık Frekansı'
              : 'Kadim Kaynak Sembol & Kutsal Geometri Karşılığı'}
          </div>
          {codeItem.isCoreSynchronicityCode && (
            <div className="flex flex-wrap items-center gap-1.5">
              {codeItem.higherSelfTrigger.clockCodes.map((clk) => (
                <span
                  key={clk}
                  className="px-2.5 py-0.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-bold"
                >
                  {clk}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">
              Kadim Sembol & Arketip:
            </span>
            <span className="text-white font-semibold">{codeItem.higherSelfTrigger.totemSymbol}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">
              Kutsal Geometri & Kamea Mührü:
            </span>
            <span className="text-white font-semibold">
              {codeItem.higherSelfTrigger.geometricSymbol}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 text-white relative overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        <AnalysisBackButton />

        {/* Başlık Alanı */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">
            <KeyRound size={14} />
            1. Harita (Beden Kodları) ➡️ 3. Harita (Üst Harita Kod Dönüşümü)
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-amber-100 to-[#D4AF37] mb-3 tracking-tight">
            Üst Benlik Sembol & Kişisel Kod Analizi
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            <strong>3. Haritanızı (Üst Bilinç Haritanızı)</strong> kalıcı olarak çalıştırmadığınız sürece Üst Benliğinizden mesaj aldığınız{' '}
            <span className="text-sky-400 font-semibold">1. Harita (Beden Haritası) Kodlarınızı</span> ve 3. Haritayı çalıştırmaya başladığınızda bunların yerini alan{' '}
            <span className="text-[#D4AF37] font-semibold">Yeni Üst Harita Kodlarınızı</span> iki ayrı aşamada inceleyin.
          </p>
        </div>

        {/* Giriş Formu */}
        <form
          onSubmit={handleAnalyze}
          className="bg-[#0B0D14]/90 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(212,175,55,0.1)] backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                Nüfus Cüzdanındaki Tam Adınız (İsim Katmanı)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition"
                required
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">
                Doğum Tarihiniz (Beden Katmanı)
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-sky-400 transition"
                required
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
                Doğum Saati (Opsiyonel • İlk Nefes)
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-teal-400 transition"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-extrabold text-sm shadow-lg shadow-[#D4AF37]/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Kodları Çöz
              </button>
            </div>
          </div>
        </form>

        {result && (
          <>
            {/* =====================================================================
                HARİTA AŞAMASI SEÇİCİ (1. HARİTA BEDEN KODLARI vs 3. HARİTA ÜST BİLİNÇ KODLARI)
               ===================================================================== */}
            <div className="bg-[#0B0D14]/95 border-2 border-[#D4AF37]/40 rounded-3xl p-5 sm:p-7 space-y-5 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                    <Layers size={15} />
                    Hangi Haritayı Çalıştırıyorsunuz? • Aktif Kod & Mesaj Seçici
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">
                    Çalıştırdığınız Haritaya Göre Üst Benlikten Aldığınız Kodlar Değişir
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllExpanded((prev) => !prev)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 self-start lg:self-center shrink-0 ${
                    showAllExpanded
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-white/5 text-gray-200 border-white/15 hover:border-[#D4AF37]/50'
                  }`}
                >
                  <BookOpen size={14} />
                  {showAllExpanded ? 'Tek Kart Görünümüne Dön' : 'Bu Aşamadaki Tüm Kodları Aç'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveMapStage('stage1_body')}
                  className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                    activeMapStage === 'stage1_body'
                      ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.25)]'
                      : 'bg-black/50 border-white/10 hover:border-sky-400/40 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
                      1. Aşama • Varsayılan Aktif Harita
                    </span>
                    {activeMapStage === 'stage1_body' && (
                      <span className="text-xs font-extrabold text-sky-400">ŞU AN AÇIK ●</span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    1. Harita — Beden Haritası Kodlarınız
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <strong>3. Haritanızı çalıştırmadığınız sürece</strong> günlük hayatta saatlerde ve sembollerde mesaj olarak alacağınız <strong>5 Çekirdek Beden Kodu</strong> (Ruh Kodu: <strong>{result.summaryMetrics.embeddedRuhKodu}</strong>, Alan Kodu: <strong>{result.summaryMetrics.birthMatrixFieldCode}</strong>, Karmik Kod: <strong>{result.summaryMetrics.primaryKarmicCode}</strong>, Doğum Kodu: <strong>{result.summaryMetrics.lifePathCode}</strong>, Gezegen: <strong>{result.summaryMetrics.lifePathPlanetName}</strong>).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMapStage('stage2_upper')}
                  className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                    activeMapStage === 'stage2_upper'
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)]'
                      : 'bg-black/50 border-white/10 hover:border-[#D4AF37]/40 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                      2. Aşama • Üst Harita Aktivasyonu
                    </span>
                    {activeMapStage === 'stage2_upper' && (
                      <span className="text-xs font-extrabold text-[#D4AF37]">ŞU AN AÇIK ●</span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    3. Harita — Üst Haritayı Çalıştırınca Değişen Yeni Kodlarınız
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Beden Haritasındaki Alan Koruma (<strong>{result.summaryMetrics.birthMatrixFieldCode}</strong>) ve Karmik Kilit (<strong>{result.summaryMetrics.primaryKarmicCode}</strong>) sınavlarını aşıp <strong>3. Haritanızı çalıştırmaya başladığınızda</strong> eski kodlarınızın yerini alan yeni Üst Bilinç kodlarınız ve dönüşüm tablosu.
                  </p>
                </button>
              </div>
            </div>

            {activeMapStage === 'stage1_body' ? (
              <>
                {/* =====================================================================
                    AŞAMA 1: 1. HARİTA (BEDEN HARİTASI) KODLARI
                   ===================================================================== */}
                <div className="bg-[#0B0D14]/95 border border-sky-500/35 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_30px_rgba(56,189,248,0.08)]">
                  <div className="border-b border-white/10 pb-4 space-y-2">
                    <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full">
                      <Compass size={14} />
                      1. Harita (Beden Haritası) • 3. Haritayı Çalıştırmadığınız Sürece Aktif Olan Kodlarınız
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      1. Harita — Beden Haritası Çekirdek Kodlarınız ({result.birthDate}
                      {result.birthTime ? ` • ${result.birthTime}` : ''})
                    </h2>
                    <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs sm:text-sm text-sky-200 leading-relaxed">
                      <strong>Önemli Rehberlik Kuralı:</strong> 3. Haritanızı (Üst Bilinç Haritanızı) kalıcı olarak çalıştırmaya başlamadığınız sürece, uzman analizlerinde verilen ve günlük hayatta Üst Benliğinizden mesaj olarak alacağınız kodlar <strong>yalnızca bu 1. Harita (Beden Haritası) kodlarıdır</strong>.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {stage1BodyCodes.map((item) => {
                      const isSelected = selectedStage1Id === item.id && !showAllExpanded;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedStage1Id(item.id);
                            setShowAllExpanded(false);
                          }}
                          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)] scale-[1.01]'
                              : 'bg-black/50 border-white/10 hover:border-sky-400/50'
                          }`}
                        >
                          <div>
                            <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                              {item.shortTitle}
                            </div>
                            <div className="text-xs text-gray-300 font-semibold mt-0.5">{item.title}</div>
                          </div>
                          <div className="text-3xl font-black my-3" style={{ color: item.color }}>
                            {item.codeValue}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-2">
                            <span className="truncate">{item.subLabel}</span>
                            <span className="text-sky-400 font-bold shrink-0 ml-1">
                              {isSelected ? 'Açık ▼' : 'Oku →'}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {!result.birthTime && (
                      <div className="p-4 rounded-2xl border border-dashed border-teal-500/35 bg-teal-500/5 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={12} />
                            İLK NEFES (DOĞUM SAATİ) KODU
                          </div>
                          <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                            Doğum saatinizi biliyorsanız yukarıdaki kutuya girerek <strong>İlk Nefes Kapı Kodunuzu</strong> ve <strong>Keldani Nöbetçi Gezegeninizi</strong> de Beden Haritanıza ekleyebilirsiniz.
                          </p>
                        </div>
                        <span className="text-[10px] text-teal-300/80 font-semibold mt-2">
                          Opsiyonel Beden Saati Kodu
                        </span>
                      </div>
                    )}
                  </div>

                  {(showAllExpanded
                    ? stage1BodyCodes
                    : [stage1BodyCodes.find((c) => c.id === selectedStage1Id) || stage1BodyCodes[0]].filter(Boolean)
                  ).map((item) => renderDetailCard(item!))}
                </div>

                {/* =====================================================================
                    AŞAMA 1 EŞZAMANLILIK SİNYALLERİ (1. HARİTA AKTİFKEN GELEN MESAJLAR)
                   ===================================================================== */}
                <div className="bg-[#0B0D14]/95 border border-sky-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-sky-400 mb-1">
                      <Zap size={14} />
                      1. Harita (Beden Haritası) • Canlı Uyanış & Saat Mesajları
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      3. Haritayı Çalıştırmadığınız Sürece Takip Edeceğiniz 3 Çekirdek Saat & Mesaj Kodu
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Beden Haritası aşamasındayken diğer yan sayıları değil, <strong>yalnızca bu 3 Çekirdek Beden Matrisi kodunuzu</strong> saatlerde veya plakalarda gördüğünüzde Üst Benliğinizden mesaj olarak almalısınız:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.synchronicitySignals.map((sig, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-sky-400/40 transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span
                                className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-1.5"
                                style={{
                                  color: sig.color,
                                  backgroundColor: `${sig.color}18`,
                                  border: `1px solid ${sig.color}44`
                                }}
                              >
                                {sig.sourceCodeName}
                              </span>
                              <h3 className="text-base font-bold text-white">{sig.title}</h3>
                            </div>
                            <span
                              className="px-2.5 py-1 rounded-xl font-mono text-xs font-black shrink-0 border"
                              style={{
                                color: sig.color,
                                borderColor: `${sig.color}55`,
                                backgroundColor: `${sig.color}15`
                              }}
                            >
                              {sig.code}
                            </span>
                          </div>

                          <div className="text-xs text-gray-400">
                            <strong className="text-gray-200">Eşleşen Sembol / Totem:</strong> {sig.symbolArchetype}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/5">
                            {sig.whenYouSeeIt}
                          </p>
                        </div>

                        <div className="text-xs sm:text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl">
                          <strong className="text-emerald-400">Ne Yapmalısınız? </strong>
                          {sig.actionStep}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* =====================================================================
                    AŞAMA 2: 1. HARİTADAN 3. HARİTAYA KOD DÖNÜŞÜM TABLOSU
                   ===================================================================== */}
                <div className="bg-[#0B0D14]/95 border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                  <div className="border-b border-white/10 pb-4 space-y-2">
                    <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-full">
                      <ArrowRight size={14} />
                      1. Harita ➡️ 3. Harita Kod Dönüşüm Anahtarı
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      3. Haritayı Çalıştırmaya Başladığınızda Kodlarınız Nasıl Değişir?
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      1. Haritadaki (Beden Haritasındaki) sınavlarınızı tamamladığınızda eski Beden kodlarınız görevini tamamlar ve yerini aşağıdaki <strong>3. Harita (Üst Harita) Kodlarına</strong> bırakır:
                    </p>
                  </div>

                  <div className="space-y-3">
                    {result.mapTransitionTable.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-black/50 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                      >
                        <div className="lg:col-span-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#D4AF37] block">
                            {row.category}
                          </span>
                        </div>
                        <div className="lg:col-span-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/25">
                          <span className="text-[10px] uppercase font-bold text-sky-300 block">
                            1. Harita (Eski Beden Kodu)
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-white block">
                            {row.bodyMapCode}
                          </span>
                          <span className="text-[11px] text-gray-300 block mt-0.5">
                            {row.bodyMapMeaning}
                          </span>
                        </div>
                        <div className="lg:col-span-3 p-3 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40">
                          <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">
                            3. Harita (Yeni Üst Harita Kodu)
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-white block">
                            {row.upperMapCode}
                          </span>
                          <span className="text-[11px] text-amber-100/90 block mt-0.5">
                            {row.upperMapMeaning}
                          </span>
                        </div>
                        <div className="lg:col-span-4 text-xs text-gray-300 leading-relaxed">
                          <strong className="text-emerald-400">Geçiş Şartı: </strong>
                          {row.unlockCondition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* =====================================================================
                    AŞAMA 2: 3. HARİTA (ÜST HARİTA) KOD KARTLARI
                   ===================================================================== */}
                <div className="bg-[#0B0D14]/95 border border-[#D4AF37]/35 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
                  <div className="border-b border-white/10 pb-4">
                    <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-full mb-2">
                      <Sparkles size={14} />
                      3. Harita (Üst Harita) • Yeni Aktifleşen Kodlarınız ({result.fullName})
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      3. Haritayı Çalıştırdığınızda Devreye Giren Üst Bilinç & Ruh Kodlarınız
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Beden Haritası sınavlarını aşıp 3. Haritanızı çalıştırmaya başladığınızda, artık savunma ve karmik borç kodları yerine aşağıdaki yaratım, köprü ve üst misyon kodlarınız çalışır:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {stage2UpperCodes.map((item) => {
                      const isSelected = selectedStage2Id === item.id && !showAllExpanded;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedStage2Id(item.id);
                            setShowAllExpanded(false);
                          }}
                          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)] scale-[1.01]'
                              : 'bg-black/50 border-white/10 hover:border-[#D4AF37]/50'
                          }`}
                        >
                          <div>
                            <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
                              {item.shortTitle}
                            </div>
                            <div className="text-xs text-gray-300 font-semibold mt-0.5">{item.title}</div>
                          </div>
                          <div className="text-2xl sm:text-3xl font-black my-3" style={{ color: item.color }}>
                            {item.codeValue}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-2">
                            <span className="truncate">{item.subLabel}</span>
                            <span className="text-[#D4AF37] font-bold shrink-0 ml-1">
                              {isSelected ? 'Açık ▼' : 'Oku →'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {(showAllExpanded
                    ? stage2UpperCodes
                    : [stage2UpperCodes.find((c) => c.id === selectedStage2Id) || stage2UpperCodes[0]].filter(Boolean)
                  ).map((item) => renderDetailCard(item!))}
                </div>

                {/* =====================================================================
                    AŞAMA 2 EŞZAMANLILIK SİNYALLERİ (3. HARİTA AKTİFKEN GELEN YENİ MESAJLAR)
                   ===================================================================== */}
                <div className="bg-[#0B0D14]/95 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-1">
                      <Zap size={14} />
                      3. Harita (Üst Harita) • Yeni Saat & Sembol Rehberliği
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      3. Haritayı Çalıştırmaya Başladığınızda Üst Benliğinizin Kullandığı Yeni Kodlar
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      3. Haritanızı çalıştırmaya başladığınızda, Üst Benliğiniz artık eski Beden Haritası kodlarıyla değil aşağıdaki <strong>Üst Harita (Öz Ruh, Köprü ve Hasat)</strong> kodlarıyla size mesaj verir:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.upperMapSynchronicitySignals.map((sig, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#D4AF37]/40 transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span
                                className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-1.5"
                                style={{
                                  color: sig.color,
                                  backgroundColor: `${sig.color}18`,
                                  border: `1px solid ${sig.color}44`
                                }}
                              >
                                {sig.sourceCodeName}
                              </span>
                              <h3 className="text-base font-bold text-white">{sig.title}</h3>
                            </div>
                            <span
                              className="px-2.5 py-1 rounded-xl font-mono text-xs font-black shrink-0 border"
                              style={{
                                color: sig.color,
                                borderColor: `${sig.color}55`,
                                backgroundColor: `${sig.color}15`
                              }}
                            >
                              {sig.code}
                            </span>
                          </div>

                          <div className="text-xs text-gray-400">
                            <strong className="text-gray-200">Eşleşen Sembol / Totem:</strong> {sig.symbolArchetype}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/5">
                            {sig.whenYouSeeIt}
                          </p>
                        </div>

                        <div className="text-xs sm:text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl">
                          <strong className="text-emerald-400">Ne Yapmalısınız? </strong>
                          {sig.actionStep}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* =====================================================================
                ASTROLOJİK ÜST HARİTALAR (2. DRAKONİK RUH, 3. BERİYAH VE 4. ATZİLUTH KOZMİK HARİTA) KÖPRÜSÜ
               ===================================================================== */}
            <div className="bg-gradient-to-br from-[#D4AF37]/15 via-[#0B0D14] to-purple-950/25 border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_35px_rgba(212,175,55,0.12)]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2 max-w-3xl">
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/35 px-3 py-1 rounded-full">
                    <Sparkles size={14} />
                    Astrolojik 4 Harita Sistemi • Kabalistik 4 Alem & Drakonik Astroloji
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Astrolojik 1., 2., 3. ve 4. Haritalarınızı Görüntüleyin
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                    Buradaki sayısal ve sembolik kodların astrolojik karşılığı olan <strong>1. Beden Haritası (Assiah / Natal)</strong>, <strong>2. Ruh Haritası (Yetzirah / Drakonik)</strong>, <strong>3. Yüksek Zihin Haritası (Beriyah / 9. Harmonik)</strong> ve <strong>4. İlahi Öz Haritası (Atziluth / Heliocentric)</strong> tablolarınızı incelemek için:
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <a
                    href="/analysis/kabbalah"
                    className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-extrabold text-xs sm:text-sm text-center shadow-lg shadow-[#D4AF37]/25 hover:opacity-95 transition flex items-center justify-center gap-2"
                  >
                    <Compass size={16} />
                    Kabalistik 4 Alem Haritalarını Aç →
                  </a>
                  <a
                    href="/analysis/cosmic-matrix"
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2"
                  >
                    <KeyRound size={15} />
                    7Layers Kozmik Matris Sentezi
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
