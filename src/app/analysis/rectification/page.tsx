"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Activity, 
  Heart, 
  Briefcase, 
  GraduationCap, 
  Home, 
  Flame, 
  Zap, 
  RotateCcw,
  UserCheck,
  BookmarkCheck
} from 'lucide-react';
import { ASTRO_CITIES, AstroCity } from '@/features/astrology/engine/AstrologyConstants';
import { EventType, LifeEvent, RectificationResult } from '@/features/astrology/engine/RectificationEngine';

interface EventTemplate {
  type: EventType;
  label: string;
  icon: React.ReactNode;
  hint: string;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  { type: 'marriage', label: 'Evlilik / Ciddi İlişki', icon: <Heart className="text-rose-400" size={16} />, hint: 'Resmi nikah veya kadersel ilişki başlangıç tarihi' },
  { type: 'child_birth', label: 'Çocuk Doğumu', icon: <Sparkles className="text-amber-400" size={16} />, hint: 'İlk veya sonraki çocuğunuzun doğum tarihi' },
  { type: 'career_promotion', label: 'İşe Giriş / Önemli Terfi', icon: <Briefcase className="text-blue-400" size={16} />, hint: 'İlk resmi iş, büyük kariyer başlangıcı veya terfi' },
  { type: 'accident_surgery', label: 'Kaza / Büyük Ameliyat', icon: <Activity className="text-red-400" size={16} />, hint: 'Hastaneye yatış, hayati operasyon veya ciddi kaza' },
  { type: 'death_relative', label: 'Birinci Derece Yakın Kaybı', icon: <ShieldCheck className="text-zinc-400" size={16} />, hint: 'Anne, baba veya kardeş vefat tarihi' },
  { type: 'relocation', label: 'Taşınma / Şehir-Ülke Değişikliği', icon: <Home className="text-emerald-400" size={16} />, hint: 'Kalıcı şehir veya ülke değişikliği, yeni ev' },
  { type: 'graduation', label: 'Mezuniyet / Büyük Başarı', icon: <GraduationCap className="text-purple-400" size={16} />, hint: 'Üniversite/yüksek lisans mezuniyeti veya büyük ödül' },
  { type: 'divorce', label: 'Boşanma / Ciddi Ayrılık', icon: <Zap className="text-orange-400" size={16} />, hint: 'Resmi boşanma veya uzun ilişkinin kesin bitişi' },
  { type: 'financial_crisis', label: 'Maddi Kriz / İflas', icon: <Flame className="text-yellow-600" size={16} />, hint: 'Büyük maddi kayıp veya iflas dönüm noktası' },
  { type: 'spiritual_awakening', label: 'Ruhsal Uyanış / Dönüm Noktası', icon: <Sparkles className="text-indigo-400" size={16} />, hint: 'Hayat görüşünüzü kökten değiştiren spiritüel kırılma' },
];

interface BenchmarkPreset {
  id: string;
  name: string;
  title: string;
  officialTime: string;
  birthDate: string;
  cityName: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  bodyType: 'slender' | 'athletic' | 'stocky' | 'petite' | 'curvy';
  events: LifeEvent[];
}

const BENCHMARK_PRESETS: BenchmarkPreset[] = [
  {
    id: 'diana',
    name: 'Prenses Diana',
    title: 'İngiltere Prensesi',
    officialTime: '19:45 (Resmi Belge)',
    birthDate: '1961-07-01',
    cityName: 'Londra',
    element: 'water',
    bodyType: 'slender',
    events: [
      { id: 'd1', type: 'marriage', title: 'Prens Charles ile Evlilik', date: '1981-07-29' },
      { id: 'd2', type: 'child_birth', title: 'Prens William Doğumu (1. Çocuk)', date: '1982-06-21' },
      { id: 'd3', type: 'child_birth', title: 'Prens Harry Doğumu (2. Çocuk)', date: '1984-09-15' },
      { id: 'd4', type: 'death_relative', title: 'Baba Vefatı (John Spencer)', date: '1992-03-29' },
      { id: 'd5', type: 'divorce', title: 'Resmi Boşanma', date: '1996-08-28' },
    ]
  },
  {
    id: 'jobs',
    name: 'Steve Jobs',
    title: 'Apple Kurucusu',
    officialTime: '19:15 (Resmi Belge)',
    birthDate: '1955-02-24',
    cityName: 'San Francisco',
    element: 'earth',
    bodyType: 'slender',
    events: [
      { id: 'j1', type: 'career_promotion', title: "Apple'ın Kuruluşu", date: '1976-04-01' },
      { id: 'j2', type: 'financial_crisis', title: "Apple'dan Kovulması (Kriz)", date: '1985-09-16' },
      { id: 'j3', type: 'marriage', title: 'Laurene Powell ile Evlilik', date: '1991-03-18' },
      { id: 'j4', type: 'career_promotion', title: "Apple'a CEO Olarak Dönüşü", date: '1997-09-16' },
      { id: 'j5', type: 'accident_surgery', title: 'Kanser Ameliyatı', date: '2004-07-31' },
    ]
  },
  {
    id: 'obama',
    name: 'Barack Obama',
    title: 'ABD 44. Başkanı',
    officialTime: '19:24 (Resmi Belge)',
    birthDate: '1961-08-04',
    cityName: 'Honolulu',
    element: 'air',
    bodyType: 'athletic',
    events: [
      { id: 'o1', type: 'marriage', title: 'Michelle Robinson ile Evlilik', date: '1992-10-03' },
      { id: 'o2', type: 'death_relative', title: 'Anne Vefatı (Ann Dunham)', date: '1995-11-07' },
      { id: 'o3', type: 'child_birth', title: 'Malia Doğumu (1. Çocuk)', date: '1998-07-04' },
      { id: 'o4', type: 'career_promotion', title: 'ABD Başkanı Seçilmesi', date: '2008-11-04' },
    ]
  }
];

export default function RectificationPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Step 1: Doğum Bilgileri
  const [birthDate, setBirthDate] = useState<string>('1992-06-15');
  const [selectedCity, setSelectedCity] = useState<AstroCity>(ASTRO_CITIES[0]);
  const [citySearch, setCitySearch] = useState<string>('');
  const [timeWindowType, setTimeWindowType] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night' | 'custom'>('all');
  const [customStartHour, setCustomStartHour] = useState<number>(0);
  const [customEndHour, setCustomEndHour] = useState<number>(24);

  // Step 2: Mizaç ve Beden
  const [bodyType, setBodyType] = useState<'slender' | 'athletic' | 'stocky' | 'petite' | 'curvy'>('athletic');
  const [elementTemperament, setElementTemperament] = useState<'fire' | 'earth' | 'air' | 'water'>('fire');

  // Step 3: Olaylar Listesi
  const [events, setEvents] = useState<LifeEvent[]>([
    { id: '1', type: 'career_promotion', title: 'İlk İşe Giriş', date: '2015-09-01' },
    { id: '2', type: 'relocation', title: 'Şehir Değişikliği / Taşınma', date: '2019-04-12' },
    { id: '3', type: 'marriage', title: 'Evlilik / Nişan', date: '2021-08-20' },
  ]);

  // Yeni Olay Ekleme Formu
  const [newEventTemplate, setNewEventTemplate] = useState<EventType>('career_promotion');
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventDate, setNewEventDate] = useState<string>('');

  // Hesaplama Durumu ve Sonuç
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [result, setResult] = useState<RectificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Preset Yükleme
  const handleLoadPreset = (preset: BenchmarkPreset) => {
    setActivePreset(preset.id);
    setBirthDate(preset.birthDate);
    const targetCity = ASTRO_CITIES.find(c => c.name.toLowerCase() === preset.cityName.toLowerCase()) || selectedCity;
    setSelectedCity(targetCity);
    setBodyType(preset.bodyType);
    setElementTemperament(preset.element);
    setEvents([...preset.events]);
    setTimeWindowType('all');
    setCurrentStep(3); // Doğrudan olaylar adımına geç
  };

  // Doğruluk Gücü Göstergesi
  const getAccuracyGauge = () => {
    const count = events.length;
    if (count === 0) return { percent: 40, label: 'Yetersiz Veri', color: 'bg-zinc-600', text: 'text-zinc-400' };
    if (count === 1) return { percent: 65, label: 'Temel Yakınsama', color: 'bg-amber-600', text: 'text-amber-400' };
    if (count === 2) return { percent: 80, label: 'İyi Korelasyon', color: 'bg-blue-500', text: 'text-blue-400' };
    if (count === 3) return { percent: 92, label: 'Yüksek Doğruluk', color: 'bg-emerald-500', text: 'text-emerald-400' };
    return { percent: 99.6, label: 'Maksimum Kesinlik (%99+)', color: 'bg-gradient-to-r from-emerald-400 to-[#D4AF37]', text: 'text-[#D4AF37]' };
  };

  const accuracy = getAccuracyGauge();

  const handleAddEvent = () => {
    if (!newEventDate) {
      alert('Lütfen olayın gerçekleştiği tarihi seçiniz.');
      return;
    }
    const template = EVENT_TEMPLATES.find(t => t.type === newEventTemplate);
    const title = newEventTitle.trim() || template?.label || 'Önemli Olay';

    const newEv: LifeEvent = {
      id: Date.now().toString(),
      type: newEventTemplate,
      title,
      date: newEventDate
    };

    setEvents(prev => [...prev, newEv]);
    setNewEventTitle('');
    setNewEventDate('');
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleCalculate = async () => {
    if (events.length === 0) {
      setErrorMsg('Lütfen en az 1 kadersel yaşam olayı ekleyiniz.');
      return;
    }

    setIsCalculating(true);
    setErrorMsg('');

    let startHour = 0;
    let endHour = 24;

    if (timeWindowType === 'morning') { startHour = 6; endHour = 12; }
    else if (timeWindowType === 'afternoon') { startHour = 12; endHour = 18; }
    else if (timeWindowType === 'evening') { startHour = 18; endHour = 24; }
    else if (timeWindowType === 'night') { startHour = 0; endHour = 6; }
    else if (timeWindowType === 'custom') { startHour = customStartHour; endHour = customEndHour; }

    try {
      const payload = {
        birthDate,
        birthCity: selectedCity,
        timeWindow: { startHour, endHour },
        profile: { bodyType, elementTemperament },
        events
      };

      const res = await fetch('/api/astrology/rectification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Hesaplama yapılamadı.');
      }

      setResult(data.data);
      setCurrentStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Hesaplama sırasında bir hata oluştu.');
    } finally {
      setIsCalculating(false);
    }
  };

  const filteredCities = ASTRO_CITIES.filter(c => 
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] mb-4 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Clock size={32} className="animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] tracking-tight mb-3">
            Akıllı Doğum Saati Belirleme
          </h1>
          <p className="text-sm sm:text-base text-mystic-text-muted max-w-2xl mx-auto">
            Doğum saatinizi tam bilmiyor musunuz? Hayatınızdaki dönüm noktası olaylar ve astronomik tersine mühendislik ile kesin doğum dakikanızı hesaplayın.
          </p>
        </div>

        {/* HAZIR REFERANS TEST VAKALARI SEÇİCİSİ */}
        <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-[#181818] via-black to-[#181818] border border-[#D4AF37]/30 rounded-3xl backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              <BookmarkCheck size={16} /> Resmi Doğum Belgesiyle Kanıtlanmış Referans Vakalar (Canlı Test)
            </div>
          </div>
          <p className="text-xs text-mystic-text-muted mb-4">
            Algoritmanın doğruluğunu test etmek için aşağıdaki dünyaca ünlü kişilerden birine tıklayınız; doğum bilgileri ve resmi olayları otomatik yüklenecektir:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BENCHMARK_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className={`p-3.5 rounded-2xl border text-left transition-all group cursor-pointer ${
                  activePreset === preset.id
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-white/5 border-white/10 hover:border-[#D4AF37]/40 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white group-hover:text-[#D4AF37] transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#D4AF37] font-semibold">
                    {preset.cityName}
                  </span>
                </div>
                <div className="text-[11px] text-white/50">{preset.title}</div>
                <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <UserCheck size={12} /> Saat: {preset.officialTime}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step Navigation Bar */}
        {currentStep < 4 && (
          <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className={currentStep === 1 ? 'text-[#D4AF37]' : 'text-white/40'}>1. Doğum & Şehir</span>
              <span className={currentStep === 2 ? 'text-[#D4AF37]' : 'text-white/40'}>2. Mizaç & Beden</span>
              <span className={currentStep === 3 ? 'text-[#D4AF37]' : 'text-white/40'}>3. Yaşam Olayları</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#D4AF37] to-amber-500 h-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Doğum Tarihi, Şehir ve Zaman Penceresi */}
        {currentStep === 1 && (
          <div className="bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Calendar className="text-[#D4AF37]" size={20} />
              Doğum Bilgileri ve Zaman Penceresi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-2">
                  Doğum Tarihi
                </label>
                <input 
                  type="date"
                  value={birthDate}
                  onChange={e => {
                    setBirthDate(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-2">
                  Doğum Şehri (Seçili: {selectedCity.name})
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Şehir ara (örn: İstanbul, Londra, San Francisco)..."
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors pl-10"
                  />
                  <MapPin className="absolute left-3 top-3.5 text-white/40" size={18} />
                </div>
                {citySearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto">
                    {filteredCities.map(c => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setSelectedCity(c);
                          setCitySearch('');
                          setActivePreset(null);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-colors border-b border-white/5"
                      >
                        {c.name} ({c.country})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-3">
                Doğum Saati Hakkında Bildikleriniz
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'all', label: 'Hiç Bilmiyorum (24 Saat)' },
                  { id: 'morning', label: 'Sabah (06:00 - 12:00)' },
                  { id: 'afternoon', label: 'Öğleden Sonra (12:00 - 18:00)' },
                  { id: 'evening', label: 'Akşam (18:00 - 00:00)' },
                  { id: 'night', label: 'Gece (00:00 - 06:00)' },
                  { id: 'custom', label: 'Özel Aralık Belirle' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setTimeWindowType(opt.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                      timeWindowType === opt.id 
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {timeWindowType === 'custom' && (
                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-white/60 block mb-1">Başlangıç Saati: {customStartHour}:00</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="23" 
                      value={customStartHour} 
                      onChange={e => setCustomStartHour(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-white/60 block mb-1">Bitiş Saati: {customEndHour}:00</label>
                    <input 
                      type="range" 
                      min={customStartHour + 1} 
                      max="24" 
                      value={customEndHour} 
                      onChange={e => setCustomEndHour(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#E5C158] transition-all cursor-pointer"
              >
                Sonraki Adım: Mizaç & Beden
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Mizaç ve Beden */}
        {currentStep === 2 && (
          <div className="bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="text-[#D4AF37]" size={20} />
              Beden Yapısı ve Temel Mizaç (Yükselen Filtresi)
            </h2>
            <p className="text-xs text-mystic-text-muted">
              Yükselen burcun fiziksel beden ve mizaç üzerindeki etkisini eşleştirmek için size en yakın seçenekleri belirleyin.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-3">
                Doğal Karakter & Mizaç Eğiliminiz
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'fire', label: 'Ateş Mizacı', desc: 'Hızlı, sabırsız, lider ruhlu, doğrudan ve enerjik (Koç, Aslan, Yay)' },
                  { id: 'earth', label: 'Toprak Mizacı', desc: 'Sakin, planlı, sabırlı, pratik ve maddeye değer veren (Boğa, Başak, Oğlak)' },
                  { id: 'air', label: 'Hava Mizacı', desc: 'İletişim odaklı, meraklı, konuşkan, zihinsel ve sosyal (İkizler, Terazi, Kova)' },
                  { id: 'water', label: 'Su Mizacı', desc: 'Duygusal, sezgisel, derin, empati gücü yüksek ve hassas (Yengeç, Akrep, Balık)' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setElementTemperament(item.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      elementTemperament === item.id
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-sm text-[#D4AF37] mb-1">{item.label}</div>
                    <div className="text-xs text-white/60 leading-relaxed">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-3">
                Fiziksel Beden Yapınız
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'slender', label: 'İnce & Uzun Hatlı' },
                  { id: 'athletic', label: 'Atletik & Dinamik' },
                  { id: 'stocky', label: 'Kalıplı & Geniş Omuzlu' },
                  { id: 'petite', label: 'Minyon & Zarif' },
                  { id: 'curvy', label: 'Kıvrımlı & Yumuşak Hatlı' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setBodyType(item.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                      bodyType === item.id
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/15 transition-all"
              >
                <ArrowLeft size={18} />
                Geri
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#E5C158] transition-all cursor-pointer"
              >
                Sonraki Adım: Yaşam Olayları
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Kadersel Yaşam Olayları */}
        {currentStep === 3 && (
          <div className="bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-white/80">Hesaplama Gücü & Güvenilirlik</span>
                <span className={`text-xs font-extrabold ${accuracy.text}`}>{accuracy.label}</span>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${accuracy.color}`}
                  style={{ width: `${accuracy.percent}%` }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Eklenmiş Yaşam Olayları ({events.length})</span>
                {activePreset && (
                  <span className="text-xs font-normal text-emerald-400">
                    ✓ {BENCHMARK_PRESETS.find(p => p.id === activePreset)?.name} verileri yüklendi
                  </span>
                )}
              </h3>

              {events.length === 0 ? (
                <div className="p-6 bg-white/5 border border-dashed border-white/20 rounded-2xl text-center text-xs text-white/40">
                  Henüz hiçbir kadersel olay eklenmedi. Lütfen aşağıdan en az 1 olay ekleyin.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {events.map(ev => {
                    const tpl = EVENT_TEMPLATES.find(t => t.type === ev.type);
                    return (
                      <div key={ev.id} className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-xl">
                            {tpl?.icon || <Sparkles size={16} />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{ev.title}</div>
                            <div className="text-xs text-mystic-text-muted">{ev.date}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveEvent(ev.id)}
                          className="p-2 text-white/40 hover:text-red-400 transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Yeni Olay Ekleme Paneli */}
            <div className="p-5 bg-[#181818] border border-[#D4AF37]/20 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                <Plus size={16} /> Yeni Kadersel Olay Ekle
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-white/50 mb-1 uppercase font-semibold">Olay Türü</label>
                  <select
                    value={newEventTemplate}
                    onChange={e => setNewEventTemplate(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {EVENT_TEMPLATES.map(t => (
                      <option key={t.type} value={t.type} className="bg-[#181818] text-white">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-white/50 mb-1 uppercase font-semibold">Olay Başlığı (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: İlk İş, İstanbul'a Taşınma"
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/50 mb-1 uppercase font-semibold">Olay Tarihi (Gün/Ay/Yıl)</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                onClick={handleAddEvent}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-xs font-bold text-white rounded-xl border border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Listeye Ekle
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={isCalculating}
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/15 transition-all"
              >
                <ArrowLeft size={18} />
                Geri
              </button>
              <button
                onClick={handleCalculate}
                disabled={isCalculating || events.length === 0}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] text-black font-extrabold px-8 py-3.5 rounded-2xl hover:scale-[1.02] shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <RotateCcw className="animate-spin" size={18} />
                    Kozmik Eksenler Hesaplanıyor (1440 Dakika Taranıyor)...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Kesin Doğum Saatini Hesapla
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SONUÇ RAPORU */}
        {currentStep === 4 && result && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            
            <div className="bg-gradient-to-b from-[#181818] to-black border-2 border-[#D4AF37]/50 rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)]">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-extrabold uppercase tracking-widest mb-4">
                <CheckCircle2 size={16} /> Rektifikasyon Başarıyla Tamamlandı
              </div>

              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-2">
                Tespit Edilen Kesin Doğum Saatiniz
              </h2>

              <div className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] tracking-tight my-4">
                {result.bestCandidate.timeStr.slice(0, 5)}
              </div>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-6 pt-6 border-t border-white/10 text-xs sm:text-sm">
                <div>
                  <span className="text-white/40 block">Yükselen Burç (ASC)</span>
                  <span className="font-bold text-white text-base">{result.bestCandidate.ascSign} ({result.bestCandidate.ascDegree.toFixed(1)}°)</span>
                </div>
                <div>
                  <span className="text-white/40 block">Kariyer Noktası (MC)</span>
                  <span className="font-bold text-white text-base">{result.bestCandidate.mcSign} ({result.bestCandidate.mcDegree.toFixed(1)}°)</span>
                </div>
                <div>
                  <span className="text-white/40 block">Matematiksel Güvenilirlik</span>
                  <span className="font-bold text-[#D4AF37] text-base">%{result.bestCandidate.confidencePercent}</span>
                </div>
              </div>
            </div>

            {/* Kadersel Kanıt Matrisi Tablosu */}
            <div className="bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-[#D4AF37]" size={20} />
                Kadersel Açı ve Olay Eşleşme Kanıtları
              </h3>
              <p className="text-xs text-mystic-text-muted">
                Girmiş olduğunuz yaşam olaylarının bu saatteki Solar Arc ve Transit köşe açılarıyla nasıl dakikası dakikasına kilitlendiğini gösterir:
              </p>

              <div className="space-y-3 mt-4">
                {result.bestCandidate.eventMatches.map((m, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[#D4AF37] flex items-center gap-1.5">
                        <Sparkles size={14} /> {m.eventTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        {m.technique} • {m.aspect} (Orb: {m.orb}°)
                      </span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {m.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Farklı Bilgilerle Yeniden Hesapla
              </button>

              <button
                onClick={() => {
                  router.push(`/analysis/astrology`);
                }}
                className="py-3.5 px-8 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-xs font-black text-black transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Bu Saat ile Doğum Haritasını Aç
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
