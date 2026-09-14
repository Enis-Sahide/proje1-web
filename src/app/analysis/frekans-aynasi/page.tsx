"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Sparkles, Compass, AlertCircle, RefreshCw, MoonStar, ExternalLink } from 'lucide-react';
import { ASTRO_CITIES, AstroCity } from '@/features/astrology/engine/AstrologyConstants';
import LocationAutocomplete from '@/components/LocationAutocomplete';

export default function FrekansAynasiPage() {
  const router = useRouter();

  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('12:00');
  const [cityKey, setCityKey] = useState<AstroCity | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [activeConsciousness, setActiveConsciousness] = useState<any>(null);
  const [errorStr, setErrorStr] = useState('');

  const handleCalculate = async () => {
    try {
      setIsLoading(true);
      setErrorStr('');

      if (!dateStr || !timeStr || !cityKey) {
        throw new Error("Lütfen tüm tarih, saat ve şehir alanlarını doldurunuz.");
      }

      const res = await fetch('/api/astrology/kabbalah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localDate: dateStr,
          localTime: timeStr,
          cityData: cityKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Hesaplama hatası");
      }

      const ac = data.data?.kabbalahAnalysis?.activeConsciousness;
      if (!ac) {
        throw new Error("Frekans analizi verisi oluşturulamadı.");
      }

      setActiveConsciousness(ac);
    } catch (error: any) {
      console.error('Frekans Aynası hesaplama hatası:', error);
      setErrorStr(error.message || 'Frekans aynası oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Lighting Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[#0EA5E9] opacity-10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#6A0DAD] opacity-10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/analysis')}
          className="inline-flex items-center gap-2 text-mystic-text-muted hover:text-white mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} />
          <span>Analizlere Dön</span>
        </button>

        {/* Page Title & Intro */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 text-[#0EA5E9] text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            <span>Kozmik Sınav & Canlı Tekâmül Aynası</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mystic tracking-wider mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-[#0EA5E9]">
            Hangi Haritanızı Çalıştırıyorsunuz?
          </h1>
          <p className="text-mystic-text-muted max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Doğum haritanız ömür boyu değişmeyen kalıcı potansiyelinizdir. <strong>Frekans Aynası</strong> ise, tam şu an gökyüzündeki canlı transitlerin haritanıza uyguladığı sınavı tespit eder ve tepkinizin 4 Alemden hangisini aktive ettiğini anlık olarak aynalar.
          </p>
        </div>

        {/* Input Form (Visible if not yet calculated or user wants to re-run) */}
        {!activeConsciousness && (
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl mb-12">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Compass size={22} className="text-[#0EA5E9]" />
              <span>Doğum Bilgilerinizi Girin</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-mystic-text-muted font-bold mb-2">
                  Doğum Tarihi
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0EA5E9] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-mystic-text-muted font-bold mb-2">
                  Doğum Saati
                </label>
                <input
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0EA5E9] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-mystic-text-muted font-bold mb-2">
                  Doğum Yeri
                </label>
                <LocationAutocomplete 
                  onSelect={(city: AstroCity) => setCityKey(city)}
                  defaultDisplay={cityKey ? cityKey.name : ''}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0EA5E9] text-sm"
                />
              </div>
            </div>

            {errorStr && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-6 flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorStr}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isLoading || !dateStr || !timeStr || !cityKey}
              onClick={handleCalculate}
              className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-black bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#0EA5E9] hover:opacity-95 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Kozmik Frekans Hesaplanıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Frekansımı Teşhis Et</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Calculated Result: Full Frequency Mirror */}
        {activeConsciousness && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Frekans Aynası Kartı */}
            <div className="p-6 md:p-8 rounded-3xl border border-[#0EA5E9]/30 bg-gradient-to-b from-[#0EA5E9]/15 via-[#0EA5E9]/5 to-black/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA5E9] opacity-15 blur-[80px] pointer-events-none" />

              {/* Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#0EA5E9] text-black">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest font-bold text-[#0EA5E9]">Anlık Gökyüzü Aynası</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Hangi Bilinç Âlemini Deneyimliyorsunuz?
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveConsciousness(null); }}
                    className="flex items-center gap-1.5 text-xs text-mystic-text-muted hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <RefreshCw size={14} />
                    <span>Yeniden Hesapla</span>
                  </button>
                </div>
              </div>

              {/* Güncel Sınav Kutusu */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    Gelişim Odak Noktası
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-[#0EA5E9]">
                    {activeConsciousness.currentTheme || activeConsciousness.title}
                  </h4>
                </div>

                <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4">
                  {activeConsciousness.cosmicChallenge || activeConsciousness.explanation}
                </p>

                <div className="text-xs text-sky-300/90 bg-sky-950/40 p-3 rounded-xl border border-sky-800/30 flex items-start gap-2">
                  <span className="shrink-0 text-sky-400 font-bold">⚡ Göksel Rehberlik:</span>
                  <span>{activeConsciousness.transitSummary || activeConsciousness.reason}</span>
                </div>
              </div>

              {/* 4 Alem Spektrumu */}
              {activeConsciousness.spectrum && (
                <div className="mb-8">
                  <div className="mb-4">
                    <h5 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>🪞 4 Âlem Frekans Aynası: Bilinç Boyutunuzu Keşfedin</span>
                    </h5>
                    <p className="text-xs text-mystic-text-muted mt-1">
                      Bu gökyüzü etkisi karşısında geliştirdiğiniz içsel tutum, şu an hangi bilinç boyutunu deneyimlediğinizi yansıtır:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Assiah */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-red-500/30 bg-red-950/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-red-500/20">
                          <span className="text-xs font-bold text-red-400">1. Âlem (Eylem & Madde / Assiah)</span>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">Fiziksel / Pratik Boyut</span>
                        </div>
                        <h6 className="text-sm font-bold text-white mb-2">
                          {activeConsciousness.spectrum.assiah.title}
                        </h6>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">
                          {activeConsciousness.spectrum.assiah.reaction}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-black/50 border border-red-500/20 text-[11px] text-red-200/90 leading-relaxed">
                        <strong className="text-red-400 block mb-0.5">Farkındalık Aynası:</strong>
                        {activeConsciousness.spectrum.assiah.diagnosis}
                      </div>
                    </div>

                    {/* 2. Yetzirah */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-sky-500/30 bg-sky-950/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-sky-500/20">
                          <span className="text-xs font-bold text-sky-400">2. Âlem (Duygu & Şekillendirme / Yetzirah)</span>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">Duygusal Şifa</span>
                        </div>
                        <h6 className="text-sm font-bold text-white mb-2">
                          {activeConsciousness.spectrum.yetzirah.title}
                        </h6>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">
                          {activeConsciousness.spectrum.yetzirah.reaction}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-black/50 border border-sky-500/20 text-[11px] text-sky-200/90 leading-relaxed">
                        <strong className="text-sky-400 block mb-0.5">Farkındalık Aynası:</strong>
                        {activeConsciousness.spectrum.yetzirah.diagnosis}
                      </div>
                    </div>

                    {/* 3. Beriyah */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-500/20">
                          <span className="text-xs font-bold text-amber-400">3. Âlem (Zihin & Yaratım / Beriyah)</span>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Bilge İrade</span>
                        </div>
                        <h6 className="text-sm font-bold text-white mb-2">
                          {activeConsciousness.spectrum.beriyah.title}
                        </h6>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">
                          {activeConsciousness.spectrum.beriyah.reaction}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                        <strong className="text-amber-400 block mb-0.5">Farkındalık Aynası:</strong>
                        {activeConsciousness.spectrum.beriyah.diagnosis}
                      </div>
                    </div>

                    {/* 4. Atzilut */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-500/20">
                          <span className="text-xs font-bold text-purple-400">4. Âlem (Ruh & Kudret / Atzilut)</span>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Kozmik Birlik</span>
                        </div>
                        <h6 className="text-sm font-bold text-white mb-2">
                          {activeConsciousness.spectrum.atzilut.title}
                        </h6>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">
                          {activeConsciousness.spectrum.atzilut.reaction}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-black/50 border border-purple-500/20 text-[11px] text-purple-200/90 leading-relaxed">
                        <strong className="text-purple-400 block mb-0.5">Farkındalık Aynası:</strong>
                        {activeConsciousness.spectrum.atzilut.diagnosis}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dipnot */}
              <div className="space-y-2 border-t border-white/10 pt-4 mt-2">
                <p className="text-xs md:text-sm text-mystic-text-muted leading-relaxed">
                  🌱 <strong>Ezoterik İlke:</strong> Hayat deneyimlerindeki bilinçli farkındalığınız, o an hangi âlemin potansiyelini aktive ettiğinizi belirler. Üst boyutların rehberliğini hayatınıza dahil etmek için bakış açınızı fiziksel reaksiyondan (Assiah), bilgelik, sezgi ve içsel huzura (Beriyah & Atzilut) kolaylıkla dönüştürebilirsiniz.
                </p>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => router.push('/analysis/kabbalah')}
                className="p-5 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/10 to-transparent hover:from-[#D4AF37]/20 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase mb-1">
                    <MoonStar size={14} />
                    <span>Derin Ezoterik Analiz</span>
                  </div>
                  <h4 className="text-white font-bold text-base group-hover:text-[#D4AF37] transition-colors">
                    Kabalistik 4 Alem Haritanız
                  </h4>
                  <p className="text-xs text-mystic-text-muted mt-0.5">
                    Tropikal, Drakonik, 9. Harmonik ve Helyosentrik haritalarınızı inceleyin.
                  </p>
                </div>
                <ExternalLink size={18} className="text-[#D4AF37] shrink-0 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/analysis/transits')}
                className="p-5 rounded-2xl border border-[#0EA5E9]/30 bg-gradient-to-r from-[#0EA5E9]/10 to-transparent hover:from-[#0EA5E9]/20 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-[#0EA5E9] text-xs font-bold uppercase mb-1">
                    <Compass size={14} />
                    <span>Gökyüzü Çarkı & Zaman Çizelgesi</span>
                  </div>
                  <h4 className="text-white font-bold text-base group-hover:text-[#0EA5E9] transition-colors">
                    Anlık Gökyüzü Transitleri
                  </h4>
                  <p className="text-xs text-mystic-text-muted mt-0.5">
                    Gezegen açılarının dakikası dakikasına hareketlerini takip edin.
                  </p>
                </div>
                <ExternalLink size={18} className="text-[#0EA5E9] shrink-0 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
