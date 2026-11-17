"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shield,
  Eye,
  Compass,
  KeyRound,
  Hexagon,
  Zap,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import AnalysisBackButton from '@/components/ui/AnalysisBackButton';
import { useAuth } from '@/context/AuthContext';
import {
  analyzePersonalSymbolCodes,
  SymbolCodeAnalysisResult,
  PersonalSymbolCodeItem
} from '@/features/numerology/engine/SymbolCodeEngine';

export default function SymbolCodesAnalysisPage() {
  const routerUnused = null;
  const { user } = useAuth();

  const [fullName, setFullName] = useState('Bahadır');
  const [birthDate, setBirthDate] = useState('1990-05-15');
  const [birthTime, setBirthTime] = useState('');
  const [result, setResult] = useState<SymbolCodeAnalysisResult | null>(null);

  // Her bir bölümün kendi aktif seçili kartı (böylece 3 bölüm birbirine hiç karışmaz)
  const [selectedBodyId, setSelectedBodyId] = useState<string>('birth-code');
  const [selectedSoulId, setSelectedSoulId] = useState<string>('soul-urge');
  const [selectedAlchemyId, setSelectedAlchemyId] = useState<string>('karmic-debt');
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
      const initialBirth = qBirth || savedBirth || (user as any)?.birthDate || '1990-05-15';
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
      setSelectedBodyId('birth-time-portal');
    }
  };

  // 3 Net Katmana Ayırma:
  // 1. Bölüm: Doğum Tarihinden Gelen Kodlar (layer === 'body')
  const bodyCodes = result
    ? [
        result.codes.find((c) => c.id === 'birth-code'),
        result.codes.find((c) => c.id === 'body-field-code'),
        result.codes.find((c) => c.id === 'life-path'),
        result.codes.find((c) => c.id === 'planet-ruler'),
        result.codes.find((c) => c.id === 'birth-time-portal')
      ].filter((c): c is PersonalSymbolCodeItem => Boolean(c))
    : [];

  // 2. Bölüm: İsminizden Gelen Kodlar (layer === 'soul')
  const soulCodes = result
    ? [
        result.codes.find((c) => c.id === 'soul-urge'),
        result.codes.find((c) => c.id === 'outer-persona'),
        result.codes.find((c) => c.id === 'hidden-passion'),
        result.codes.find((c) => c.id === 'aura-protection')
      ].filter((c): c is PersonalSymbolCodeItem => Boolean(c))
    : [];

  // 3. Bölüm: Karmik Simya & Üst Benlik Sentez Kodları (layer === 'alchemy')
  const alchemyCodes = result
    ? [
        result.codes.find((c) => c.id === 'karmic-debt'),
        result.codes.find((c) => c.id === 'bridge-code'),
        result.codes.find((c) => c.id === 'maturity-code'),
        result.codes.find((c) => c.id === 'chaldean-compound'),
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

      {/* Özet & Nasıl Hesaplandı */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-7 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1 flex items-center gap-1.5">
            <Sparkles size={13} />
            Ne Anlama Gelir? (Ezoterik Özeti)
          </div>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">{codeItem.summary}</p>
        </div>
        <div className="lg:col-span-5 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center gap-1.5">
            <Hexagon size={13} />
            Nereden & Nasıl Hesaplandı?
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">{codeItem.calculationFormula}</p>
        </div>
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

      {/* Üst Benlik Sembol & Saat Tetikleyicileri */}
      <div
        className="p-4 rounded-xl border bg-gradient-to-r from-[#D4AF37]/10 via-black/60 to-transparent space-y-2.5"
        style={{ borderColor: `${codeItem.color}55` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
            <Eye size={15} />
            Günlük Hayatta Eşleşen Saat & Sembolleriniz
          </div>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">
              Hayvan / Totem & Arketip Sembolü:
            </span>
            <span className="text-white font-semibold">{codeItem.higherSelfTrigger.totemSymbol}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">
              Kutsal Geometri Mührü:
            </span>
            <span className="text-white font-semibold">
              {codeItem.higherSelfTrigger.geometricSymbol}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-amber-100 leading-relaxed">
          <strong className="text-[#D4AF37]">Bu Kodu Gördüğünüzde Üst Benliğiniz Ne Diyor? </strong>
          {codeItem.higherSelfTrigger.instantMessage}
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
            3 Katmanlı Sentez • Doğum Tarihi • İsim Frekansı • Karmik Simya
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-amber-100 to-[#D4AF37] mb-3 tracking-tight">
            Üst Benlik Sembol & Kişisel Kod Analizi
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Kişisel şifrelerinizi hiç karışıklığa yer bırakmadan kaynağın kendisine göre{' '}
            <span className="text-sky-400 font-semibold">1. Doğum Tarihinizden Gelenler</span>,{' '}
            <span className="text-[#D4AF37] font-semibold">2. İsminizden Gelenler</span> ve{' '}
            <span className="text-rose-400 font-semibold">3. İkisinin Birleşiminden Doğan Karmik & Üst Benlik Kodları</span>{' '}
            olarak adım adım inceleyin.
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
            {/* Üst Görünüm Anahtarı */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5">
              <p className="text-xs sm:text-sm text-gray-300">
                💡 Her bölümde istediğiniz kutuya tıklayarak o kodun derin açıklamasını hemen altında okuyabilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => setShowAllExpanded((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                  showAllExpanded
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40 hover:bg-[#D4AF37]/25'
                }`}
              >
                <BookOpen size={14} />
                {showAllExpanded ? 'Seçili Kart Görünümüne Dön' : 'Tüm Kodların Açıklamalarını Aynı Anda Aç'}
              </button>
            </div>

            {/* =====================================================================
                1. BÖLÜM: DOĞUM TARİHİNDEN GELEN KODLAR (BEDEN & YAŞAM ROTASI)
               ===================================================================== */}
            <div className="bg-[#0B0D14]/95 border border-sky-500/35 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_30px_rgba(56,189,248,0.08)]">
              <div className="border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full mb-2">
                  <Compass size={14} />
                  1. Bölüm • Doğum Tarihinizden Gelen Kodlar ({result.birthDate}
                  {result.birthTime ? ` • ${result.birthTime}` : ''})
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Beden & Fiziksel Yaşam Rotası Kodlarınız
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Dünyaya doğduğunuz gün ve saatin fiziksel bedeninize mühürlediği doğal yetenek, yürüyeceğiniz ana yaşam yolu ve gezegen yöneticiniz:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {bodyCodes.map((item) => {
                  const isSelected = selectedBodyId === item.id && !showAllExpanded;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedBodyId(item.id);
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
                        Doğum saatinizi biliyorsanız yukarıdaki kutuya girerek <strong>İlk Nefes Kapı Kodunuzu</strong>, <strong>Keldani Nöbetçi Gezegeninizi</strong> ve <strong>Gündüz/Gece Ruh Modunuzu</strong> açabilirsiniz.
                      </p>
                    </div>
                    <span className="text-[10px] text-teal-300/80 font-semibold mt-2">
                      Opsiyonel 4. Beden Kodu
                    </span>
                  </div>
                )}
              </div>

              {(showAllExpanded
                ? bodyCodes
                : [bodyCodes.find((c) => c.id === selectedBodyId) || bodyCodes[0]].filter(Boolean)
              ).map((item) => renderDetailCard(item!))}
            </div>

            {/* =====================================================================
                2. BÖLÜM: İSMİNİZDEN GELEN KODLAR (RUH & ÇAKRA REZONANSI)
               ===================================================================== */}
            <div className="bg-[#0B0D14]/95 border border-[#D4AF37]/35 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
              <div className="border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-full mb-2">
                  <Sparkles size={14} />
                  2. Bölüm • İsminizden Gelen Kodlar ({result.fullName})
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Ruh Haritası & Çakra Alanı Kodlarınız
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Adınızın ve soyadınızın sesli/sessiz harflerinden doğan içsel ruh arzunuz, dışsal ilk izleniminiz, en güçlü çakra silahınız ve açık kalan aura koruma kapınız:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {soulCodes.map((item) => {
                  const isSelected = selectedSoulId === item.id && !showAllExpanded;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedSoulId(item.id);
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
                      <div className="text-3xl font-black my-3" style={{ color: item.color }}>
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
                ? soulCodes
                : [soulCodes.find((c) => c.id === selectedSoulId) || soulCodes[0]].filter(Boolean)
              ).map((item) => renderDetailCard(item!))}
            </div>

            {/* =====================================================================
                3. BÖLÜM: KARMİK SİMYA & ÜST BENLİK KODLARI (İSİM + DOĞUM SENTEZİ)
               ===================================================================== */}
            <div className="bg-[#0B0D14]/95 border border-rose-500/35 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_30px_rgba(244,63,94,0.08)]">
              <div className="border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full mb-2">
                  <Shield size={14} />
                  3. Bölüm • İsim + Doğum Tarihi Birleşimi (Sentez Katmanı)
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Karmik Simya, Köprü & Üst Benlik Arketip Kodlarınız
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Doğum tarihiniz (Beden) ile isminiz (Ruh) birleştiğinde ortaya çıkan karmik sınavınız, iki haritayı birleştiren köprü kodunuz, 35+ yaş ustalık hasadınız ve kadim Babil sembol arketipiniz:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {alchemyCodes.map((item) => {
                  const isSelected = selectedAlchemyId === item.id && !showAllExpanded;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedAlchemyId(item.id);
                        setShowAllExpanded(false);
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)] scale-[1.01]'
                          : 'bg-black/50 border-white/10 hover:border-rose-400/50'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                          {item.shortTitle}
                        </div>
                        <div className="text-xs text-gray-300 font-semibold mt-0.5">{item.title}</div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black my-3" style={{ color: item.color }}>
                        {item.codeValue}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-2">
                        <span className="truncate">{item.subLabel}</span>
                        <span className="text-rose-400 font-bold shrink-0 ml-1">
                          {isSelected ? 'Açık ▼' : 'Oku →'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {(showAllExpanded
                ? alchemyCodes
                : [alchemyCodes.find((c) => c.id === selectedAlchemyId) || alchemyCodes[0]].filter(Boolean)
              ).map((item) => renderDetailCard(item!))}
            </div>

            {/* =====================================================================
                4. BÖLÜM: GÜNLÜK HAYATTA KARŞINIZA ÇIKAN ÜST BENLİK İŞARETLERİ
               ===================================================================== */}
            <div className="bg-[#0B0D14]/95 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-1">
                  <Zap size={14} />
                  4. Bölüm • Canlı Uyanış Rehberi
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Günlük Hayatta Karşınıza Çıkan Üst Benlik İşaretleri & Sembol Sözlüğü
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Saatlerde, plakalarda, rüyalarda veya önemli bir karar anında aşağıdaki kişisel kodlarınızdan birini gördüğünüzde Üst Benliğinizin size verdiği anlık talimatlar:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.synchronicitySignals.map((sig, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#D4AF37]/40 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
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
                        <h3 className="text-base sm:text-lg font-bold text-white">{sig.title}</h3>
                      </div>
                      <span
                        className="px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black shrink-0 border"
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

                    <div className="text-xs sm:text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl">
                      <strong className="text-emerald-400">Ne Yapmalısınız? </strong>
                      {sig.actionStep}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* =====================================================================
                5. BÖLÜM: ÜST HARİTALARINIZ (2. DRAKONİK RUH, 3. BERİYAH VE 4. ATZİLUTH KOZMİK HARİTA) KÖPRÜSÜ
               ===================================================================== */}
            <div className="bg-gradient-to-br from-[#D4AF37]/15 via-[#0B0D14] to-purple-950/25 border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_0_35px_rgba(212,175,55,0.12)]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2 max-w-3xl">
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/35 px-3 py-1 rounded-full">
                    <Sparkles size={14} />
                    Üst Haritalara Geçiş Anahtarı • Kabalistik 4 Alem & Drakonik Astroloji
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Üst Haritalarınız (2. Ruh Haritası, 3. Zihin ve 4. Kozmik Harita) Nasıl Çalışır?
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                    Yukarıda incelediğiniz sayısal kodların tamamı, bu dünyadaki <strong>1. Katman (Assiah / Fiziksel Enkarnasyon ve İsim Rezonansı)</strong> giriş şifrelerinizdir. Kadim öğretide <strong>Beden Alan Kodunuz ({result.summaryMetrics.birthMatrixFieldCode})</strong> ile sınırlarınızı koruduğunuzda, <strong>Gezegen Yöneticinizin ({result.summaryMetrics.lifePathPlanetName})</strong> sorumluluk sınavını verdiğinizde ve <strong>Karmik Kilidinizi ({result.summaryMetrics.primaryKarmicCode})</strong> şifalandırdığınızda; sayısal matrisin ötesindeki <strong>Astrolojik Üst Haritalarınız</strong> devreye girer:
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="text-xs font-extrabold text-purple-300 uppercase">
                    2. Harita • Yetzirah (Drakonik Ruh Haritası)
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Kuzey Ay Düğümünüzün 0° Koç noktasına çekilmesiyle hesaplanan gerçek <strong>Ruh Sözleşmesi</strong> haritanızdır. Beden sınavlarını aştığınızda gezegenleriniz Drakonik burç ve derecelerinde çalışmaya başlar.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="text-xs font-extrabold text-sky-300 uppercase">
                    3. Harita • Beriyah (9. Harmonik Yüksek Zihin)
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Doğum haritanızın 9. Harmonik (Navamsa) açılımıdır. Hayatın ikinci yarısındaki ruhsal olgunluğu, ilahi idraki ve kadersel yaşam misyonunuzu yönetir.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="text-xs font-extrabold text-amber-300 uppercase">
                    4. Harita • Atziluth (Heliocentric Kozmik Harita)
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Merkezde Dünya'nın (egonun) değil <strong>Güneş'in (Yüksek Benliğin)</strong> olduğu Güneş Merkezli haritanız ve Kraliyet Sabit Yıldızları (Sirius, Regulus, Antares, Aldebaran) bağlantınızdır.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
