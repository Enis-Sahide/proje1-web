"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Shield,
  Flame,
  Eye,
  Compass,
  Clock,
  Layers,
  KeyRound,
  Hexagon,
  Zap,
  BookOpen,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import AnalysisBackButton from '@/components/ui/AnalysisBackButton';
import { useAuth } from '@/context/AuthContext';
import {
  analyzePersonalSymbolCodes,
  SymbolCodeAnalysisResult,
  PersonalSymbolCodeItem,
  MapLayerType
} from '@/features/numerology/engine/SymbolCodeEngine';

export default function SymbolCodesAnalysisPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [fullName, setFullName] = useState('Bahadır');
  const [birthDate, setBirthDate] = useState('1990-05-15');
  const [birthTime, setBirthTime] = useState('');
  const [result, setResult] = useState<SymbolCodeAnalysisResult | null>(null);
  const [selectedCodeId, setSelectedCodeId] = useState<string>('karmic-debt');
  const [layerFilter, setLayerFilter] = useState<'all' | MapLayerType>('all');
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
  };

  const filteredCodes = result
    ? result.codes.filter((c) => (layerFilter === 'all' ? true : c.layer === layerFilter))
    : [];

  const activeCode: PersonalSymbolCodeItem | undefined =
    result?.codes.find((c) => c.id === selectedCodeId) || filteredCodes[0] || result?.codes[0];

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 text-white relative overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        <AnalysisBackButton />

        {/* Başlık Alanı */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">
            <KeyRound size={14} />
            3 Harita Sentezi • 12 Kişisel Kod & Sembol Kütüphanesi
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-amber-100 to-[#D4AF37] mb-3 tracking-tight">
            Üst Benlik Sembol & Kişisel Kod Analizi
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            İsminizden gelen <span className="text-[#D4AF37] font-semibold">Ruh Haritası (Briah)</span>, doğum tarihinizden gelen{' '}
            <span className="text-sky-400 font-semibold">Beden Haritası (Assiah)</span> ve ikisinin kesişiminden doğan{' '}
            <span className="text-rose-400 font-semibold">3. Harita (Karmik Simya, Aura Kalkanı & Köprü Kodları)</span> ile Üst Benliğinizin günlük hayatta karşınıza çıkardığı sembolleri çözün.
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
                Nüfus Cüzdanındaki Tam Adınız (Ruh Haritası)
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
                Doğum Tarihiniz (Beden Haritası)
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
                Doğum Saati (Opsiyonel • İlk Nefes Kapısı)
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
            {/* 3 HARİTA MİMARİSİ ÖZET PANELİ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#D4AF37]/15 to-transparent border border-[#D4AF37]/30">
                <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles size={15} />
                  1. Harita • Ruh Haritası (Briah)
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  {result.mapBalanceSummary.soulDominantNote}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-500/15 to-transparent border border-sky-500/30">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Compass size={15} />
                  2. Harita • Beden Haritası (Assiah)
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  {result.mapBalanceSummary.bodyDominantNote}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/15 to-transparent border border-rose-500/30">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Shield size={15} />
                  3. Harita • Karmik Simya & Aura (Yetzirah)
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  {result.mapBalanceSummary.bridgeSynthesisNote}
                </p>
              </div>
            </div>

            {/* 11 KİŞİSEL KOD IZGARASI VE HARİTA FİLTRESİ */}
            <div className="bg-[#0B0D14]/95 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#D4AF37] flex items-center gap-2">
                    <Layers size={22} />
                    Astro-Numerolojik 12 Kişisel Kodunuz
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Detaylı ezoterik açıklamasını, karmik kökenini ve Üst Benlik sembolünü okumak istediğiniz kod kutusuna tıklayın.
                  </p>
                </div>

                {/* Filtre Butonları */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'Tümü (12 Kod)' },
                    { id: 'alchemy', label: '3. Harita: Karmik & Aura (6)' },
                    { id: 'soul', label: '1. Ruh Haritası (3)' },
                    { id: 'body', label: '2. Beden Haritası (3)' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLayerFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        layerFilter === tab.id
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowAllExpanded((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                      showAllExpanded
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <BookOpen size={13} />
                    {showAllExpanded ? 'Tek Kart Görünümüne Dön' : 'Tümünü Alt Alta Aç'}
                  </button>
                </div>
              </div>

              {/* Kutu Izgarası */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
                {filteredCodes.map((item) => {
                  const isSelected = activeCode?.id === item.id && !showAllExpanded;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedCodeId(item.id);
                        setShowAllExpanded(false);
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                        isSelected
                          ? 'bg-white/[0.09] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.22)] scale-[1.02]'
                          : 'bg-black/50 border-white/10 hover:border-white/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div>
                        <span
                          className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 border"
                          style={{
                            color: item.color,
                            borderColor: `${item.color}44`,
                            backgroundColor: `${item.color}15`
                          }}
                        >
                          {item.layer === 'soul'
                            ? 'Ruh Haritası'
                            : item.layer === 'body'
                            ? 'Beden Haritası'
                            : '3. Harita • Simya'}
                        </span>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-snug">
                          {item.shortTitle}
                        </div>
                      </div>

                      <div
                        className="text-2xl sm:text-3xl font-black my-2 tracking-tight"
                        style={{ color: item.color }}
                      >
                        {item.codeValue}
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
                        <span className="text-[10px] text-gray-400 truncate">{item.subLabel}</span>
                        <ChevronRight
                          size={13}
                          className={`shrink-0 transition-transform ${
                            isSelected ? 'text-[#D4AF37] translate-x-0.5' : 'text-gray-500 group-hover:text-white'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* SEÇİLİ KODUN DERİN EZOTERİİK ANALİZ KARTI (VEYA TÜMÜ AÇIK MOD) */}
              <div className="space-y-6 pt-2">
                {(showAllExpanded ? filteredCodes : activeCode ? [activeCode] : []).map((codeItem) => (
                  <div
                    key={codeItem.id}
                    className="rounded-3xl bg-gradient-to-br from-white/[0.06] via-[#0D101B] to-black border p-6 sm:p-8 space-y-6 shadow-2xl"
                    style={{ borderColor: `${codeItem.color}55` }}
                  >
                    {/* Kart Üst Başlığı */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border"
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
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                          {codeItem.title}:{' '}
                          <span style={{ color: codeItem.color }}>{codeItem.codeValue}</span>
                        </h3>
                        <p className="text-sm sm:text-base font-semibold text-[#D4AF37]">
                          {codeItem.archetypeTitle}
                        </p>
                      </div>

                      <div
                        className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center border shrink-0 self-start md:self-center"
                        style={{
                          borderColor: `${codeItem.color}66`,
                          backgroundColor: `${codeItem.color}15`
                        }}
                      >
                        <span className="text-[10px] uppercase font-bold text-gray-300">KOD</span>
                        <span className="text-2xl font-black" style={{ color: codeItem.color }}>
                          {codeItem.codeValue}
                        </span>
                      </div>
                    </div>

                    {/* Özet & Hesaplama Mantığı */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-7 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1.5 flex items-center gap-1.5">
                          <Sparkles size={14} />
                          Ezoterik Özeti
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed">{codeItem.summary}</p>
                      </div>
                      <div className="lg:col-span-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
                          <Hexagon size={14} />
                          Nasıl Hesaplandı?
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                          {codeItem.calculationFormula}
                        </p>
                      </div>
                    </div>

                    {/* Derin Açıklama Bölümleri */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {codeItem.sections.map((sec, idx) => (
                        <div
                          key={idx}
                          className={`p-5 rounded-2xl bg-black/50 border border-white/10 space-y-2 ${
                            codeItem.sections.length % 2 === 1 && idx === codeItem.sections.length - 1
                              ? 'md:col-span-2'
                              : ''
                          }`}
                        >
                          <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                            <CheckCircle2 size={16} style={{ color: codeItem.color }} className="shrink-0" />
                            {sec.heading}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                            {sec.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Üst Benlik Günlük Sembol & Eşzamanlılık Kutusu */}
                    <div
                      className="p-5 rounded-2xl border bg-gradient-to-r from-[#D4AF37]/10 via-black/60 to-transparent space-y-3"
                      style={{ borderColor: `${codeItem.color}55` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                          <Eye size={16} />
                          Üst Benlik Sembol & Saat Tetikleyicileri
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-gray-400 block text-[11px] uppercase font-bold">
                            Hayvan / Totem & Arketip Sembolü:
                          </span>
                          <span className="text-white font-semibold">
                            {codeItem.higherSelfTrigger.totemSymbol}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-gray-400 block text-[11px] uppercase font-bold">
                            Kutsal Geometri Mührü:
                          </span>
                          <span className="text-white font-semibold">
                            {codeItem.higherSelfTrigger.geometricSymbol}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs sm:text-sm text-amber-100 leading-relaxed">
                        <strong className="text-[#D4AF37]">Bu Kodu Gördüğünde Üst Benliğin Ne Diyor? </strong>
                        {codeItem.higherSelfTrigger.instantMessage}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ÜST BENLİK GÜNLÜK EŞZAMANLILIK & SEMBOL SÖZLÜĞÜ */}
            <div className="bg-[#0B0D14]/95 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-1">
                  <Zap size={14} />
                  Canlı Uyanış Rehberi
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
          </>
        )}
      </div>
    </div>
  );
}

