"use client";

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  TreePine, 
  Sparkles, 
  Calendar, 
  ArrowLeft, 
  Share2, 
  Check, 
  BookOpen, 
  Search, 
  AlertCircle,
  Shield,
  Heart,
  Sun,
  Leaf,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DRUID_TREES, 
  getDruidTreeAnalysis, 
  DruidTree,
  DruidTreeAnalysis 
} from '@/features/astrology/engine/DruidTreeEngine';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function DruidTreePage() {
  const [userName, setUserName] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [analyzedData, setAnalyzedData] = useState<DruidTreeAnalysis | null>(null);
  const [analyzedName, setAnalyzedName] = useState('');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTreeId, setExpandedTreeId] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // Gün sayısını aya göre sınırla
  const daysInMonth = useMemo(() => {
    if (selectedMonth === 2) return 29;
    if ([4, 6, 9, 11].includes(selectedMonth)) return 30;
    return 31;
  }, [selectedMonth]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const analysis = getDruidTreeAnalysis(selectedDay, selectedMonth);
    setAnalyzedData(analysis);
    setAnalyzedName(userName.trim());

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const currentTree: DruidTree | null = analyzedData ? analyzedData.tree : null;

  const handleCopyShare = () => {
    if (!currentTree) return;
    const shareText = `🌲 Kelt Druid Ağacı Analizim: ${currentTree.name} (${currentTree.oghamSymbol} ${currentTree.oghamName})\n` +
      `✨ Ruhsal Karakter: ${currentTree.archetype}\n` +
      `🪐 Yönetici Güç: ${currentTree.rulingPlanets} | Element: ${currentTree.element}\n` +
      `📜 Druid Bilgeliği: "${currentTree.druidicProverb}"\n\n` +
      `Sen de kendi kutsal Kelt ağacını analiz et: 7layers.org/analysis/druid-tree`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Ansiklopedi listesi (13 Kutsal Ogham Ağacı)
  const filteredTrees = useMemo(() => {
    if (!searchTerm.trim()) return DRUID_TREES;
    const q = searchTerm.toLowerCase();
    return DRUID_TREES.filter(t => 
      t.name.toLowerCase().includes(q) ||
      t.archetype.toLowerCase().includes(q) ||
      t.oghamName.toLowerCase().includes(q) ||
      t.periods.some(p => p.label.toLowerCase().includes(q))
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#070A0F] text-gray-100 pt-28 pb-24 px-4 sm:px-6 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Arka Plan Mistik Işık Efektleri */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-40 right-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-1/3 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Üst Geri Dönüş Linki */}
        <div>
          <Link 
            href="/analysis"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors py-2 px-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30"
          >
            <ArrowLeft size={16} />
            <span>Tüm Analizlere Dön</span>
          </Link>
        </div>

        {/* Hero Başlık Bölümü */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium tracking-wide">
            <TreePine size={16} className="text-emerald-400" />
            <span>13 Kutsal Kelt Ağacı & Ogham Bilgeliği</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 tracking-tight">
            Kelt Druid Ağacı Analizi
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Antik Kelt (Druid) rahiplerine göre her ruh, doğduğu günün döngüsünde 13 kutsal ağaçtan birinin ve kadim ağaç harfinin (Ogham) frekansıyla mühürlenir. 
            Doğum gününüzü seçerek kutsal koruyucu ağacınızı, ruhsal arketipinizi ve orman topraklanması (Shinrin-Yoku) ritüelinizi analiz edin.
          </p>
        </div>

        {/* Doğum Tarihi Seçim Formu */}
        <div className="bg-white/[0.03] border border-emerald-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* İsim Alanı (Opsiyonel) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Adınız <span className="text-emerald-400 font-normal lowercase">(opsiyonel)</span>
                </label>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Örn. Ali"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Gün Seçici */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Doğum Günü
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="bg-[#0B0F17] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ay Seçici */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Doğum Ayı
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    const newMonth = Number(e.target.value);
                    setSelectedMonth(newMonth);
                    const maxForNew = newMonth === 2 ? 29 : [4, 6, 9, 11].includes(newMonth) ? 30 : 31;
                    if (selectedDay > maxForNew) setSelectedDay(maxForNew);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1} className="bg-[#0B0F17] text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base tracking-wide transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01]"
            >
              <Sparkles size={20} className="text-amber-200" />
              <span>Kelt Druid Ağacımı Analiz Et</span>
            </button>
          </form>
        </div>

        {/* Sonuç Alanı */}
        <AnimatePresence>
          {analyzedData && currentTree && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Ana Ağaç Totem Rozeti & Başlığı */}
              <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-[#0B131B]/60 to-[#070A0F] p-6 sm:p-10 shadow-2xl">
                {/* Arka plan dev Ogham glifi */}
                <div className="absolute -right-8 -top-10 text-[180px] font-serif text-emerald-500/5 select-none pointer-events-none">
                  {currentTree.oghamSymbol}
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-3xl sm:text-4xl text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        {currentTree.oghamSymbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                            Kadim Ağaç Alfabesi Harfi (Ogham): {currentTree.oghamName}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                          {analyzedName ? `${analyzedName} İçin: ` : ''}{currentTree.name}
                        </h2>
                        <p className="text-xs text-gray-400 italic">
                          {currentTree.botanicalName}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyShare}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                      <span>{copied ? 'Kopyalandı!' : 'Özeti Paylaş'}</span>
                    </button>
                  </div>

                  {/* Arketip ve Kozmik Kartlar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                      <span className="text-emerald-400 text-[11px] uppercase tracking-wider block font-bold mb-1">
                        Ruhsal Karakter & Mizaç (Arketip)
                      </span>
                      <span className="text-white font-semibold">
                        {currentTree.archetype}
                      </span>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                      <span className="text-amber-400 text-[11px] uppercase tracking-wider block font-bold mb-1">
                        Yönetici Gezegen & Kozmik Güç
                      </span>
                      <span className="text-white font-semibold">
                        {currentTree.rulingPlanets}
                      </span>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                      <span className="text-teal-400 text-[11px] uppercase tracking-wider block font-bold mb-1">
                        Doğa Elementi
                      </span>
                      <span className="text-white font-semibold">
                        {currentTree.element}
                      </span>
                    </div>
                  </div>

                  {/* Tarih Dönemleri */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-400 font-medium">Hüküm Sürdüğü Kutsal Tarihler:</span>
                    {currentTree.periods.map((p, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]"
                      >
                        {p.label}
                      </span>
                    ))}
                  </div>

                  {/* Druid Özdeyişi */}
                  <div className="border-t border-white/10 pt-4">
                    <blockquote className="italic font-serif text-sm sm:text-base text-amber-200/90 leading-relaxed border-l-2 border-amber-400/60 pl-4 py-1">
                      "{currentTree.druidicProverb}"
                    </blockquote>
                  </div>
                </div>
              </div>

              {/* Ruhsal Öz & Kelt Hikayesi */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wider uppercase">
                  <BookOpen size={18} />
                  <span>Mitolojik Köken & Ruhsal Öz</span>
                </div>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                  {currentTree.spiritualEssence}
                </p>
              </div>

              {/* Işık ve Gölge Kutupları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Işık Potansiyeli */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm tracking-wider uppercase">
                    <Sun size={18} className="text-emerald-400" />
                    <span>Işık Potansiyelleri & Ruhsal Erdemler</span>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
                    {currentTree.lightTraits.map((trait, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-emerald-400 text-base leading-none shrink-0">✦</span>
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gölge Taraf & Fırtına Sınavı */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm tracking-wider uppercase">
                    <Shield size={18} className="text-amber-400" />
                    <span>Gölge Sınavı & Olgunlaşma Fırtınası</span>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
                    {currentTree.shadowTraits.map((trait, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-amber-400 text-base leading-none shrink-0">❖</span>
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Doğa Ritüeli, Ortam Aromaterapisi & Günlük Pratik */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-amber-950/30 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-sm tracking-wider uppercase">
                  <Leaf size={18} className="text-teal-400" />
                  <span>Kadim Kelt Doğayla Rezonans Ritüeli</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  {/* Ağaç Topraklanması */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <TreePine size={16} />
                      <span>Orman Banyosu & Topraklanma (Shinrin-Yoku)</span>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {currentTree.natureRitual.grounding}
                    </p>
                  </div>

                  {/* Güvenli Ortam Aromaterapisi */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Wind size={16} />
                      <span>Ortam Buhuru & Doğal Koku (Difüzör)</span>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {currentTree.natureRitual.ambientAroma}
                    </p>
                  </div>

                  {/* Günlük Ruhsal Pratik */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-teal-300 font-bold">
                      <Sparkles size={16} />
                      <span>Ruhsal Dengeleyici Günlük Alışkanlık</span>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {currentTree.natureRitual.soulPractice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ruhsal Ağaç Uyumu */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-sm tracking-wider uppercase">
                  <Heart size={18} className="text-pink-400" />
                  <span>Ruhsal Ağaç Uyumu (İlişkiler & Rezonans)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-emerald-400 font-bold block">Ruhsal Rezonanstaki Uyumlu Ağaçlar:</span>
                    <div className="flex flex-wrap gap-2">
                      {currentTree.relationships.resonantTrees.map((t, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-amber-400 font-bold block">Geliştiren Zıt Ağaçlar (Katalizör):</span>
                    <div className="flex flex-wrap gap-2">
                      {currentTree.relationships.catalystTrees.map((t, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sosyal Medya Hikaye Kartı (Viral Format) */}
              <div className="bg-gradient-to-br from-emerald-950/60 via-[#0A1118] to-amber-950/40 border border-emerald-400/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 mb-2">
                  <Share2 size={14} className="text-emerald-300" />
                  <span>Sosyal Medya Hikayesi İçin Hazır Kart</span>
                </div>
                <div className="max-w-md mx-auto bg-gradient-to-b from-[#0F1C18] to-[#080D12] border-2 border-emerald-400/30 rounded-2xl p-6 shadow-2xl space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
                      7LAYERS KELT DRUİD AĞACI ANALİZİ
                    </span>
                    <span className="text-2xl text-emerald-300">{currentTree.oghamSymbol}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Kutsal Kelt Ağacı Analizim:</span>
                    <h3 className="text-xl font-serif font-bold text-white">
                      {currentTree.name} ({currentTree.oghamName})
                    </h3>
                    <p className="text-xs text-amber-300 font-medium mt-0.5">
                      {currentTree.archetype}
                    </p>
                  </div>
                  <p className="text-xs text-gray-300 italic border-l-2 border-emerald-400 pl-3 py-1">
                    "{currentTree.druidicProverb}"
                  </p>
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[10px] text-gray-400">
                    <span>{currentTree.element} • {currentTree.rulingPlanets}</span>
                    <span className="text-emerald-400 font-semibold">7layers.org</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Bu kartın ekran görüntüsünü alarak Instagram veya WhatsApp durumunuzda paylaşabilir, sevdiklerinizin kendi ağaçlarını keşfetmesini sağlayabilirsiniz.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kutsal Kelt Ağacı Ansiklopedisi & Arama */}
        <div className="border-t border-white/10 pt-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                <BookOpen size={22} className="text-emerald-400" />
                <span>13 Kutsal Kelt Ağacı Ansiklopedisi</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Otantik 13 Ay Ogham döngüsündeki tüm kutsal ağaçları inceleyin; kartlara tıklayarak detayları keşfedin.
              </p>
            </div>
            {/* Arama Kutusu */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ağaç veya tarih ara..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Tarih ve Takvim Rehber Bilgi Kutusu */}
          <div className="bg-white/[0.02] border border-emerald-500/20 rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-serif font-bold text-sm sm:text-base">
              <Calendar size={18} className="text-emerald-400" />
              <span>Otantik Kelt Ogham Ağaç Takvimi Sistemi (13 Kutsal Ay)</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-300">
              Antik Druidlerin kutsal <strong>Ogham ağaç alfabesi</strong>ne dayanan bu otoriter sistemde yıl, 28'er günlük 13 kutsal Ay döngüsüne bölünür. Her kişi doğduğu tarihe göre tek ve kesin bir koruyucu ağaç ruhuyla rezonanstadır. Örneğin <strong>18 Şubat – 17 Mart</strong> arasında doğanların kutsal ağacı <strong>Dişbudak (Nion)</strong> ağacıdır.
            </p>
          </div>

          {/* Ağaç Kartları Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrees.map((tree) => {
              const isExpanded = expandedTreeId === tree.id;
              return (
                <div 
                  key={tree.id}
                  onClick={() => setExpandedTreeId(isExpanded ? null : tree.id)}
                  className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-300">
                        {tree.oghamSymbol}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {tree.name}
                        </h4>
                        <span className="text-[11px] text-gray-400 block">
                          {tree.oghamName} • {tree.rulingPlanets}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-300/90 font-medium">
                    {tree.archetype}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tree.periods.map((p, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300">
                        {p.label}
                      </span>
                    ))}
                  </div>

                  {/* Genişletilmiş Tam Açıklama ve Özellikler */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-white/10 text-xs text-gray-300 space-y-3 animate-in fade-in duration-200">
                      <p className="italic text-[11px] text-amber-200">"{tree.druidicProverb}"</p>
                      <p className="text-xs leading-relaxed text-gray-300">{tree.spiritualEssence}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 space-y-1">
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <Sun size={12} /> Işık Erdemleri:
                          </span>
                          <ul className="space-y-0.5 text-gray-300 list-disc list-inside">
                            {tree.lightTraits.slice(0, 2).map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 space-y-1">
                          <span className="font-bold text-rose-400 flex items-center gap-1">
                            <Shield size={12} /> Gölge Sınavı:
                          </span>
                          <ul className="space-y-0.5 text-gray-300 list-disc list-inside">
                            {tree.shadowTraits.slice(0, 2).map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const firstPeriod = tree.periods[0];
                            const analysis = getDruidTreeAnalysis(firstPeriod.startDay, firstPeriod.startMonth);
                            setSelectedDay(firstPeriod.startDay);
                            setSelectedMonth(firstPeriod.startMonth);
                            setAnalyzedData(analysis);
                            setTimeout(() => {
                              resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 50);
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles size={14} className="text-amber-200" />
                          <span>Bu Ağacın Tam Analizini Gör</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Medikal / Güvenlik Sorumluluk Reddi Kutusu */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 sm:p-6 text-xs text-gray-400 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-amber-400/90 font-semibold text-xs uppercase tracking-wider">
            <AlertCircle size={15} />
            <span>Keltik Botanik ve Ritüel Sorumluluk Reddi</span>
          </div>
          <p>
            Bu analizde sunulan Kelt Druid ağaç arketipleri, Ogham sembolleri, Shinrin-Yoku (orman topraklanması) ve ortam kokulandırması önerileri tamamen kadim mitoloji, sembolizm ve rezonans odaklıdır.
            <strong> Kesinlikle tıbbi teşhis, tedavi veya dahili (içilerek/yenilerek) bitki tüketimi niteliği taşımaz.</strong> Uçucu yağları yalnızca mekan kokulandırmasında (difüzör/buhurdanlık) kullanınız; hamilelik, alerji veya astım gibi sağlık durumlarında uzman hekiminize danışınız.
          </p>
        </div>
      </div>
    </div>
  );
}
