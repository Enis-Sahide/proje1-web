"use client";

import React, { useState, useRef } from 'react';
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
  BookmarkCheck,
  TrendingUp,
  Award,
  BarChart3,
  FlaskConical,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Sun,
  Compass,
  Target,
  HelpCircle,
  ShieldAlert,
  Check
} from 'lucide-react';
import { ASTRO_CITIES, AstroCity } from '@/features/astrology/engine/AstrologyConstants';
import { EventType, LifeEvent, RectificationResult, TimelinePoint, CandidateScore, DayCandidate } from '@/features/astrology/engine/RectificationEngine';
import {
  generateTriangulationQuestions,
  evaluateTriangulationAnswers,
  TriangulationResult,
  CandidateHDData,
  CandidateEvaluationScore,
  DisambiguationQuestion
} from '@/features/astrology/engine/HDRectificationTriangulator';

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

const MONTHS_LIST = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' },
];

const SEASONS_LIST = [
  { value: 'spring', label: '🌸 İlkbahar (Mart, Nisan, Mayıs)' },
  { value: 'summer', label: '☀️ Yaz (Haziran, Temmuz, Ağustos)' },
  { value: 'autumn', label: '🍂 Sonbahar (Eylül, Ekim, Kasım)' },
  { value: 'winter', label: '❄️ Kış (Aralık, Ocak, Şubat)' },
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
  timeWindowType: 'all' | 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';
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
    timeWindowType: 'evening',
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
    timeWindowType: 'evening',
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
    timeWindowType: 'evening',
    events: [
      { id: 'o1', type: 'marriage', title: 'Michelle Robinson ile Evlilik', date: '1992-10-03' },
      { id: 'o2', type: 'death_relative', title: 'Anne Vefatı (Ann Dunham)', date: '1995-11-07' },
      { id: 'o3', type: 'child_birth', title: 'Malia Doğumu (1. Çocuk)', date: '1998-07-04' },
      { id: 'o4', type: 'career_promotion', title: 'ABD Başkanı Seçilmesi', date: '2008-11-04' },
    ]
  },
  {
    id: 'x_person',
    name: 'X Kişisi',
    title: 'Özel Analiz Vakası',
    officialTime: '18:05 (Gerçek Saat)',
    birthDate: '1995-03-17',
    cityName: 'Giresun',
    element: 'water',
    bodyType: 'slender',
    timeWindowType: 'all',
    events: [
      { id: 'x1', type: 'graduation', title: 'Mezuniyet', date: '2015-06-15' },
      { id: 'x2', type: 'relocation', title: 'İl Değişimi', date: '2016-09-16' },
      { id: 'x3', type: 'death_relative', title: 'Babaanne Vefatı', date: '2019-11-26' },
      { id: 'x4', type: 'marriage', title: 'İlk Evlilik', date: '2020-07-16' },
      { id: 'x5', type: 'career_promotion', title: 'İş Yerinde Terfi', date: '2022-05-20' },
      { id: 'x6', type: 'relocation', title: 'İl Değişimi', date: '2023-08-11' },
      { id: 'x7', type: 'relocation', title: 'İl Değişimi', date: '2023-10-20' },
      { id: 'x8', type: 'divorce', title: 'Boşanma', date: '2023-11-21' },
      { id: 'x9', type: 'marriage', title: '2. Evlilik (İmam Nikahı)', date: '2023-12-20' },
      { id: 'x10', type: 'relocation', title: 'İl Değişimi', date: '2025-01-08' },
      { id: 'x11', type: 'marriage', title: 'Resmi Nikah', date: '2025-04-29' },
    ]
  }
];

export default function RectificationPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  // Step 1: Tarih Bilgisi Modu
  const [dateKnowledgeMode, setDateKnowledgeMode] = useState<'exact' | 'month' | 'season'>('exact');
  const [birthDate, setBirthDate] = useState<string>('1992-06-15');
  const [birthYear, setBirthYear] = useState<number>(1991);
  const [birthMonth, setBirthMonth] = useState<number>(4);
  const [birthSeason, setBirthSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');

  const [selectedCity, setSelectedCity] = useState<AstroCity>(ASTRO_CITIES[0]);
  const [citySearch, setCitySearch] = useState<string>('');
  const [timeWindowType, setTimeWindowType] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night' | 'custom'>('evening');
  const [customStartHour, setCustomStartHour] = useState<number>(17);
  const [customEndHour, setCustomEndHour] = useState<number>(23);

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
  const [selectedPeak, setSelectedPeak] = useState<CandidateScore | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<TimelinePoint | null>(null);

  // Human Design & Hermetik Triangülasyon State
  const [triangulationData, setTriangulationData] = useState<TriangulationResult | null>(null);
  const [triangulationAnswers, setTriangulationAnswers] = useState<Record<string, string>>({});
  const [triangulationScores, setTriangulationScores] = useState<CandidateEvaluationScore[]>([]);

  const handleSelectDisambiguationOption = (questionId: string, optionId: string) => {
    const updatedAnswers = {
      ...triangulationAnswers,
      [questionId]: optionId
    };
    setTriangulationAnswers(updatedAnswers);

    if (triangulationData) {
      const evaluated = evaluateTriangulationAnswers(
        triangulationData.candidatesData,
        triangulationData.questions,
        updatedAnswers
      );
      setTriangulationScores(evaluated);

      const topWinner = evaluated.find(e => e.isTopMatch) || evaluated[0];
      if (topWinner && result) {
        const matchingCand = result.topCandidates.find(c => c.timeStr === topWinner.timeStr);
        if (matchingCand) {
          setSelectedPeak(matchingCand);
        }
      }
    }
  };

  const handleResetTriangulation = () => {
    setTriangulationAnswers({});
    setTriangulationScores([]);
    if (result) {
      setSelectedPeak(result.bestCandidate);
    }
  };

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleLoadPreset = (preset: BenchmarkPreset) => {
    setActivePreset(preset.id);
    setDateKnowledgeMode('exact');
    setBirthDate(preset.birthDate);
    const targetCity = ASTRO_CITIES.find(c => c.name.toLowerCase() === preset.cityName.toLowerCase()) || selectedCity;
    setSelectedCity(targetCity);
    setBodyType(preset.bodyType);
    setElementTemperament(preset.element);
    setEvents([...preset.events]);
    setTimeWindowType(preset.timeWindowType);
    setCurrentStep(3);
  };

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
    else if (timeWindowType === 'evening') { startHour = 17; endHour = 23; }
    else if (timeWindowType === 'night') { startHour = 0; endHour = 6; }
    else if (timeWindowType === 'custom') { startHour = customStartHour; endHour = customEndHour; }

    try {
      const payload = {
        dateMode: dateKnowledgeMode,
        birthDate: dateKnowledgeMode === 'exact' ? birthDate : undefined,
        birthYear: dateKnowledgeMode !== 'exact' ? birthYear : undefined,
        birthMonth: dateKnowledgeMode === 'month' ? birthMonth : undefined,
        birthSeason: dateKnowledgeMode === 'season' ? birthSeason : undefined,
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
      setSelectedPeak(data.data.bestCandidate);

      // Human Design & Hermetik Triangülasyon Sorularını Üret
      if (data.data?.topCandidates && data.data.topCandidates.length > 1) {
        const activeBirthDate = dateKnowledgeMode === 'exact' ? birthDate : (data.data.selectedDateStr || birthDate);
        const tri = generateTriangulationQuestions(data.data.topCandidates, activeBirthDate, selectedCity);
        setTriangulationData(tri);
        setTriangulationAnswers({});
        setTriangulationScores([]);
      } else {
        setTriangulationData(null);
        setTriangulationAnswers({});
        setTriangulationScores([]);
      }

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

  const renderWavePath = (points: TimelinePoint[], width: number, height: number) => {
    if (!points || points.length === 0) return { pathData: '', fillData: '' };
    
    const svgPoints = points.map((pt, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - (pt.probabilityPercent / 100) * (height - 45) - 20;
      return { x, y };
    });

    let pathData = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 1; i < svgPoints.length; i++) {
      const prev = svgPoints[i - 1];
      const cur = svgPoints[i];
      const cx = (prev.x + cur.x) / 2;
      pathData += ` C ${cx} ${prev.y}, ${cx} ${cur.y}, ${cur.x} ${cur.y}`;
    }

    const fillData = `${pathData} L ${width} ${height} L 0 ${height} Z`;
    return { pathData, fillData };
  };

  const handleMouseMoveChart = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!result?.timelinePoints || !chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = mouseX / rect.width;
    const index = Math.round(ratio * (result.timelinePoints.length - 1));
    const pt = result.timelinePoints[index];
    if (pt) {
      setHoveredPoint(pt);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] mb-4 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Clock size={32} className="animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] tracking-tight">
              Doğum Saati Keşfi & Olasılık Analizi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              Beta
            </span>
          </div>
          <p className="text-sm sm:text-base text-mystic-text-muted max-w-2xl mx-auto">
            Doğum zaman aralığınızı kadersel olaylarınızla tarayarak <span className="text-[#D4AF37] font-semibold">Kozmik Rezonans ve Olasılık Dalga Grafiğini</span> çıkarın.
          </p>
        </div>

        {/* BETA & BİLİMSEL/EZOTERİK METODOLOJİ BİLGİLENDİRME PANOSU */}
        <div className="mb-8 bg-gradient-to-br from-[#1c1810] via-[#141414] to-[#1a150c] border border-amber-500/30 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
          <div 
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <FlaskConical size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  Metodoloji & Bilimsel/Astrolojik Şeffaflık Rehberi
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                    Önemli Bilgilendirme
                  </span>
                </h3>
                <p className="text-xs text-white/60">
                  Bu modülün çalışma prensibi, kullanılan uluslararası ekoller ve olasılık spektrumu hakkında.
                </p>
              </div>
            </div>
            <button className="text-amber-400 p-1 hover:bg-white/5 rounded-lg transition-colors">
              {isMethodologyOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {isMethodologyOpen && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-4 text-xs text-white/80 leading-relaxed">
              
              {/* AKADEMİK & BİLİMSEL ÇİFT-KÖR ÇALIŞMA KAYNAĞI */}
              <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert size={16} className="text-red-400" />
                  Akademik & Bilimsel Araştırma Gerçeği: Dr. Geoffrey Dean Çift-Kör Rektifikasyon Deneyi
                </div>
                <p className="text-white/80 text-[11px] leading-relaxed">
                  <strong>Kaynak:</strong> <em>Correlation: Journal of Research in Astrology (Dean & Mather)</em> ve Uluslararası Astroloji Araştırmaları Derneği (ISAR) kör testleri.
                </p>
                <p className="text-white/70 text-[11px] leading-relaxed">
                  Doğum belgeli resmi doğum saatleri saniyesine kadar bilinen kişilerin 10 büyük kadersel yaşam olayı (evlilik, kaza, vefat, terfi) alınmış ve dünyanın en ünlü <strong>22 usta rektifikasyon uzmanına</strong> çift-kör (double-blind) olarak verilmiştir. 
                  <strong>Çarpıcı Sonuç:</strong> 22 uzman astrolog da birbirinden taban tabana zıt saatler çıkarmış; hiçbir astrolog gerçek doğum belgesi saatini rastgele bir tahminden daha yüksek bir oranla tutturamamıştır. Bu araştırma, rektifikasyonun <em>laboratuvarda kesin dakika bulan bir bilim olmadığını</em>, sembolik bir rezonans hipotezi olduğunu akademik olarak kanıtlamıştır.
                </p>
              </div>

              {/* AÇI VE ORB GERÇEĞİ */}
              <div className="flex items-start gap-2.5">
                <Info className="text-amber-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="text-amber-200">Açı ve Orb Gerçeği (Neden "Tekil Bir Dakika" İddiası Yanıltıcıdır?):</strong>
                  <p className="text-white/70 mt-1">
                    Klasik ve modern astrolojide (Robert Hand & Noel Tyl ekolü) hiçbir kadersel olay gökyüzünde <code>0°00'</code> tam dakikaya vurduğu an bir elektrik şalteri gibi patlamaz. Olaylar açının yaklaşma <em>(applying)</em> veya uzaklaşma <em>(separating)</em> fazında, haftalar veya aylar sürebilen tolerans pencerelerinde tetiklenir. Bu sebeple bir algoritmanın ya da astroloğun "Sen tam 09:14'te doğdun" demesi bilimsel değil, bir pazarlama illüzyonudur.
                  </p>
                </div>
              </div>

              {/* İLK NEFES PENCERESİ */}
              <div className="flex items-start gap-2.5">
                <Clock className="text-amber-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="text-amber-200">Biyolojik "İlk Nefes" Tolerans Penceresi:</strong>
                  <p className="text-white/70 mt-1">
                    Doğum tek bir saniye değil; başın çıkması, göbek bağının kesilmesi ve bebeğin ciğerlerine ilk havayı çekip ağlaması (kadim Prana anı) dahil 2-4 dakikalık biyolojik bir süreçtir. Sistemimiz bu nedenle aday saatleri mutlak dogmalar olarak değil, <strong>±4 dakikalık Rezonans Pencereleri</strong> olarak sunar.
                  </p>
                </div>
              </div>

              {/* KULLANILAN TEKNİKLER */}
              <div className="flex items-start gap-2.5">
                <BookOpen className="text-amber-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="text-amber-200">Sistemimizde Çalışan Matematiksel Altyapı:</strong>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-white/70">
                    <li><span className="text-white font-semibold">Solar Arc Directions (Noel Tyl Ekolü):</span> Olayların köşe evlere (ASC, MC) olan matematiksel izdüşümü.</li>
                    <li><span className="text-white font-semibold">İkincil İlerletimler (Secondary Progressions):</span> Progresif Ay ve Güneş döngüleri.</li>
                    <li><span className="text-white font-semibold">NASA Swiss Ephemeris Altyapısı:</span> Yüksek hassasiyetli gök mekaniği kütüphanesi.</li>
                    <li><span className="text-white font-semibold">Human Design Çaprazlama:</span> Aday zaman pencereleri arasındaki iç otorite ve profil zıtlıklarını ayırt eden enerji filtresi.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-white/60">
                <strong className="text-amber-300">Şeffaflık Taahhüdü:</strong> Bu araç kullanıcılarımıza gerçekçi olmayan sahte bir "nokta atışı doğum dakikası" satmaz; astrolojinin ve insan tasarımının ortak rezonans ürettiği en güçlü olasılık pencerelerini şeffafça keşfetmeniz için bir rehberdir.
              </div>
            </div>
          )}
        </div>

        {/* HAZIR REFERANS TEST VAKALARI SEÇİCİSİ */}
        <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-[#181818] via-black to-[#181818] border border-[#D4AF37]/30 rounded-3xl backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              <BookmarkCheck size={16} /> Resmi Doğum Belgesiyle Kanıtlanmış Referans Vakalar (Canlı Test)
            </div>
          </div>
          <p className="text-xs text-mystic-text-muted mb-4">
            Algoritmanın rezonans dalga grafiğini test etmek için aşağıdaki kişilerden birine tıklayınız; resmi doğum bilgileri otomatik yüklenecektir:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

        {/* STEP 1: Doğum Tarihi Modu, Şehir ve Zaman Penceresi */}
        {currentStep === 1 && (
          <div className="bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Calendar className="text-[#D4AF37]" size={20} />
              Doğum Tarihi Bilginiz ve Zaman Penceresi
            </h2>

            {/* 3 Tarih Bilgi Seviyesi Sekmeleri */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-2.5">
                Doğum Tarihi Hakkında Ne Kadar Bilginiz Var?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'exact', label: '📅 Tam Tarihi Biliyorum', desc: 'Gün / Ay / Yıl tam biliniyor' },
                  { id: 'month', label: '🗓️ Sadece Ay & Yılı Biliyorum', desc: 'Örn: Nisan 1991 (30 gün taranır)' },
                  { id: 'season', label: '🌸 Sadece Mevsim & Yılı Biliyorum', desc: 'Örn: 1991 İlkbahar (3 ay taranır)' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setDateKnowledgeMode(tab.id as any);
                      setActivePreset(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      dateKnowledgeMode === tab.id
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#D4AF37] mb-1">{tab.label}</div>
                    <div className="text-[11px] text-white/50">{tab.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              
              {/* Tarih Giriş Alanları */}
              {dateKnowledgeMode === 'exact' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-2">
                    Doğum Tarihi (Gün/Ay/Yıl)
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
              )}

              {dateKnowledgeMode === 'month' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-2">
                      Doğum Yılı
                    </label>
                    <input 
                      type="number"
                      min="1920"
                      max="2030"
                      value={birthYear}
                      onChange={e => setBirthYear(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-2">
                      Doğum Ayı
                    </label>
                    <select
                      value={birthMonth}
                      onChange={e => setBirthMonth(Number(e.target.value))}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      {MONTHS_LIST.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {dateKnowledgeMode === 'season' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-2">
                      Doğum Yılı
                    </label>
                    <input 
                      type="number"
                      min="1920"
                      max="2030"
                      value={birthYear}
                      onChange={e => setBirthYear(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-mystic-text-muted mb-2">
                      Doğum Mevsimi
                    </label>
                    <select
                      value={birthSeason}
                      onChange={e => setBirthSeason(e.target.value as any)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      {SEASONS_LIST.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

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
                Doğum Zaman Dilimi (Tahmini Aralık)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'evening', label: 'Akşam (17:00 - 23:00)' },
                  { id: 'afternoon', label: 'Öğleden Sonra (12:00 - 18:00)' },
                  { id: 'morning', label: 'Sabah (06:00 - 12:00)' },
                  { id: 'night', label: 'Gece (00:00 - 06:00)' },
                  { id: 'all', label: 'Tüm Gün (24 Saat)' },
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
              Beden Yapısı ve Temel Mizaç (Güneş / Yükselen Filtresi)
            </h2>
            <p className="text-xs text-mystic-text-muted">
              Doğum gününüzü ve yükseleninizi daraltmak için doğal karakter yapınızı ve mizaç eğiliminizi seçin.
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
                    {dateKnowledgeMode !== 'exact' ? 'Tarih Aralığı ve Saat Spektrumu Taranıyor...' : 'Kozmik Rezonans Dalga Grafiği Çıkarılıyor...'}
                  </>
                ) : (
                  <>
                    <TrendingUp size={18} />
                    {dateKnowledgeMode !== 'exact' ? 'Tarih & Saat Spektrumunu Hesapla' : 'Olasılık Dalga Grafiğini Hesapla'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SONUÇ EKRANI (TARİH VE SAAT SPEKTRUMU) */}
        {currentStep === 4 && result && selectedPeak && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            
            {/* BİLİMSEL GERÇEKLİK & EĞİTİM NİTELİĞİ UYARISI BANNER'I */}
            <div className="bg-gradient-to-r from-amber-950/40 via-[#181510] to-[#121212] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Info size={18} className="shrink-0 text-amber-400" />
                Önemli Bilimsel Hatırlatma: Aday Modeller ve Gerçek Doğum Anı
              </div>
              <p className="text-white/85 text-xs leading-relaxed">
                Aşağıdaki dalga grafiğinde gösterilen zirveler, girdiğiniz olayların astrolojik formüllerle oluşturduğu <strong>teorik simülasyon modelleridir</strong>.
              </p>
              <p className="text-white/70 text-[11px] leading-relaxed">
                Çift-kör bilimsel araştırmaların (Dr. Geoffrey Dean ve ISAR deneyleri) kanıtladığı üzere; <strong>gerçek doğum anınız bu modellerin tamamen dışında da olabilir.</strong> Sistemimiz bu 3 modelden birinin kesinlikle sizin doğum saatiniz olduğunu taahhüt etmez; bu araç astroloji ve Human Design dinamiklerinin hayat olaylarıyla nasıl rezonans kurduğunu incelemeniz için ders ve eğitim niteliğinde bir araştırma simülatörüdür.
              </p>
            </div>
            
            {/* EĞER TARİH ARALIĞI MODUNDAYSA: TESPİT EDİLEN EN OLASI DOĞUM GÜNLERİ */}
            {result.isDateRangeMode && result.topDateCandidates && (
              <div className="bg-[#121212]/95 border-2 border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  <CalendarDays size={18} /> Tarih Aralığı Analiz Sonucu
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Tespit Edilen En Olası Doğum Günleri
                </h3>
                <p className="text-xs text-mystic-text-muted">
                  Kadersel olaylarınızın gökyüzü transitleri ve mizaç uyumuyla oluşturduğu en güçlü doğum tarihleri aşağıdadır:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
                  {result.topDateCandidates.map((d, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border text-left ${
                        idx === 0
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-[#D4AF37]">
                          {idx === 0 ? '🏆 En Olası Tarih' : `${idx + 1}. Aday Tarih`}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-400 text-[10px] font-mono font-bold">
                          %{d.probabilityPercent}
                        </span>
                      </div>
                      <div className="text-xl font-extrabold text-white my-1">
                        {d.day} {MONTHS_LIST.find(m => m.value === d.month)?.label} {d.year}
                      </div>
                      <div className="text-xs text-white/70 mt-2 pt-2 border-t border-white/10 flex justify-between">
                        <span>Güneş: <strong className="text-white">{d.sunSign}</strong></span>
                        <span>Ay: <strong className="text-white">{d.moonSign}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* İNTERAKTİF SVG DALGA GRAFİĞİ KARTI */}
            <div className="bg-[#121212]/95 border-2 border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(212,175,55,0.15)] space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">
                    <TrendingUp size={14} /> Kozmik Rezonans Spektrumu (Beta)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {result.selectedDateStr} Doğum Saati Olasılık Dağılım Grafiği
                  </h2>
                  <p className="text-xs text-white/50 mt-1">
                    Kadersel olaylarınızın Solar Arc ve Transit yönelimleriyle oluşturduğu pürüzsüz rezonans dalgaları aşağıdadır.
                  </p>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-white/5 border border-[#D4AF37]/30 text-right">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">Seçili Zirve Saati</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{selectedPeak.timeStr.slice(0, 5)}</span>
                </div>
              </div>

              {/* SVG Area Chart */}
              <div ref={chartContainerRef} className="relative w-full h-72 sm:h-80 bg-black/60 rounded-2xl p-4 border border-white/10 overflow-hidden">
                
                {/* Y-Axis Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                  <div className="border-b border-white/20 w-full text-[10px] text-right font-mono">%100</div>
                  <div className="border-b border-white/20 w-full text-[10px] text-right font-mono">%75</div>
                  <div className="border-b border-white/20 w-full text-[10px] text-right font-mono">%50</div>
                  <div className="border-b border-white/20 w-full text-[10px] text-right font-mono">%25</div>
                  <div className="w-full text-[10px] text-right font-mono">%0</div>
                </div>

                {/* SVG Smooth Curves */}
                {(() => {
                  const { pathData, fillData } = renderWavePath(result.timelinePoints, 800, 240);
                  const totalPts = result.timelinePoints.length;
                  const startHour = result.timelinePoints[0]?.hour ?? 0;
                  const startMin = result.timelinePoints[0]?.minute ?? 0;
                  const endHour = result.timelinePoints[totalPts - 1]?.hour ?? 24;
                  const endMin = result.timelinePoints[totalPts - 1]?.minute ?? 0;

                  const startTotalMin = startHour * 60 + startMin;
                  const endTotalMin = endHour * 60 + endMin;
                  const totalRange = Math.max(1, endTotalMin - startTotalMin);

                  return (
                    <svg 
                      viewBox="0 0 800 240" 
                      className="w-full h-full cursor-crosshair relative z-10"
                      preserveAspectRatio="none"
                      onMouseMove={handleMouseMoveChart}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
                          <stop offset="50%" stopColor="#10B981" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <path d={fillData} fill="url(#waveGradient)" />
                      <path d={pathData} fill="none" stroke="#D4AF37" strokeWidth="3.5" className="drop-shadow-[0_0_12px_rgba(212,175,55,0.85)]" />

                      {/* TEMİZ, ÇAKIŞMAYAN ZİRVE DORUKLARI */}
                      {result.topCandidates.map((cand, idx) => {
                        const totalMins = cand.hour * 60 + cand.minute;
                        const x = Math.max(25, Math.min(775, ((totalMins - startTotalMin) / totalRange) * 800));

                        const pt = result.timelinePoints.find(p => p.hour === cand.hour && Math.abs(p.minute - cand.minute) < 4);
                        const percent = pt?.probabilityPercent || 85;
                        const y = 240 - (percent / 100) * (240 - 45) - 20;

                        const isSelected = selectedPeak.timeStr === cand.timeStr;

                        return (
                          <g key={idx} className="cursor-pointer group" onClick={() => setSelectedPeak(cand)}>
                            <line 
                              x1={x} 
                              y1={y} 
                              x2={x} 
                              y2={240} 
                              stroke={isSelected ? "#FFD700" : "rgba(255,255,255,0.3)"} 
                              strokeDasharray="4 4" 
                              strokeWidth={isSelected ? "2" : "1"} 
                            />
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isSelected ? "9" : "6"} 
                              fill={isSelected ? "#FFD700" : "#10B981"} 
                              stroke="#ffffff" 
                              strokeWidth="2.5" 
                              className={isSelected ? "animate-pulse" : ""}
                            />
                            <text 
                              x={x} 
                              y={y - 14} 
                              textAnchor="middle" 
                              fill={isSelected ? "#FFD700" : "#ffffff"} 
                              fontSize="12" 
                              fontWeight="bold"
                            >
                              {cand.timeStr.slice(0, 5)} (%{percent})
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}

                {/* Live Tooltip on Hover */}
                {hoveredPoint && (
                  <div className="absolute top-3 left-4 pointer-events-none bg-[#1a1a1a]/95 border border-[#D4AF37]/50 rounded-xl px-4 py-2 shadow-2xl z-20 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">Saat: {hoveredPoint.timeStr}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold">
                        Rezonans Yüksekliği: %{hoveredPoint.probabilityPercent}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/70 mt-0.5">
                      Yükselen: <span className="text-white font-bold">{hoveredPoint.ascSign} ({hoveredPoint.ascDegree}°)</span> • MC: {hoveredPoint.mcSign}
                    </div>
                  </div>
                )}
              </div>

              {/* X-Axis Timeline Labels */}
              <div className="flex justify-between text-[11px] font-mono text-white/40 px-2 pt-1 border-t border-white/5">
                {result.timelinePoints.length > 0 && (
                  <>
                    <span>{result.timelinePoints[0]?.timeStr}</span>
                    <span>{result.timelinePoints[Math.floor(result.timelinePoints.length / 2)]?.timeStr}</span>
                    <span>{result.timelinePoints[result.timelinePoints.length - 1]?.timeStr}</span>
                  </>
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* 🎯 NOKTA ATIŞI DOĞRULAMA (HUMAN DESIGN & ENERJİ TRİANGÜLASYONU) */}
            {/* ======================================================== */}
            {triangulationData && triangulationData.hasDisambiguation && (
              <div className="bg-gradient-to-br from-[#1c1810] via-[#121212] to-[#18140c] border-2 border-[#D4AF37]/60 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_40px_rgba(212,175,55,0.15)] space-y-6 relative overflow-hidden">
                {/* Arka plan dekoratif parıltı */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

                {/* Başlık ve Açıklama */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">
                      <Target size={14} className="animate-pulse" />
                      Kozmik Rezonans & Enerji Filtresi (Human Design Çaprazlama)
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      Aday Zaman Pencereleri Arasında Enerji Uyumu Testi
                    </h3>
                    <p className="text-xs text-mystic-text-muted mt-1 max-w-2xl">
                      Aday doğum saatleriniz arasında gökyüzü <strong className="text-white">İç Otoriteyi</strong>, <strong className="text-white">Human Design Profilini</strong> veya <strong className="text-white">Enerji Tipini</strong> değiştirmektedir. Aşağıdaki {triangulationData.questions.length} soruyu yanıtlayarak doğanıza en yakın rezonans aralığını belirleyin:
                    </p>
                  </div>

                  {Object.keys(triangulationAnswers).length > 0 && (
                    <button
                      onClick={handleResetTriangulation}
                      className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white/80 font-medium border border-white/10 transition-colors"
                    >
                      <RotateCcw size={14} />
                      Yanıtları Sıfırla
                    </button>
                  )}
                </div>

                {/* SORULAR LİSTESİ */}
                <div className="space-y-6">
                  {triangulationData.questions.map((q, qIdx) => {
                    const selectedOptId = triangulationAnswers[q.id];

                    return (
                      <div key={q.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] shrink-0 mt-0.5">
                            {q.category === 'authority' && <Compass size={18} />}
                            {q.category === 'profile' && <Sparkles size={18} />}
                            {q.category === 'type' && <Zap size={18} />}
                            {q.category === 'center' && <ShieldAlert size={18} />}
                            {q.category === 'hermetic' && <Award size={18} />}
                            {q.category === 'mission' && <Target size={18} />}
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
                              Soru {qIdx + 1}: {q.categoryLabel}
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                              {q.title}
                            </h4>
                            <p className="text-xs text-white/60 mt-1">
                              {q.question}
                            </p>
                          </div>
                        </div>

                        {/* Seçenek Kartları */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {q.options.map(opt => {
                            const isChosen = selectedOptId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleSelectDisambiguationOption(q.id, opt.id)}
                                className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                                  isChosen
                                    ? 'bg-[#D4AF37]/25 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <span className={`text-xs font-bold ${isChosen ? 'text-[#D4AF37]' : 'text-white'}`}>
                                    {opt.label}
                                  </span>
                                  {isChosen && (
                                    <span className="p-1 rounded-full bg-[#D4AF37] text-black shrink-0">
                                      <Check size={12} strokeWidth={3} />
                                    </span>
                                  )}
                                </div>
                                {opt.subLabel && (
                                  <div className="text-[11px] text-amber-200/90 font-medium italic mb-1.5">
                                    "{opt.subLabel}"
                                  </div>
                                )}
                                <p className="text-[11px] text-white/70 leading-relaxed">
                                  {opt.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* TRİANGÜLASYON KAZANAN SAAT KARTI (SONUÇ ROZETİ) */}
                {(() => {
                  const answeredCount = Object.keys(triangulationAnswers).length;
                  const totalQuestions = triangulationData.questions.length;
                  const topWinnerScore = triangulationScores.find(s => s.isTopMatch);
                  const winningCandidateHD = triangulationData.candidatesData.find(c => c.candidate.timeStr === topWinnerScore?.timeStr);

                  if (answeredCount === 0 || !topWinnerScore || !winningCandidateHD) {
                    return (
                      <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-white/20 text-center text-xs text-white/50">
                        Soruları yanıtladıkça sistem aday saatleri eleyecek ve en yüksek rezonans pencerenizi burada gösterecektir.
                      </div>
                    );
                  }

                  const totalMins = winningCandidateHD.candidate.hour * 60 + winningCandidateHD.candidate.minute;
                  const startM = Math.max(0, totalMins - 4);
                  const endM = Math.min(1439, totalMins + 4);
                  const formatT = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
                  const windowStr = `${formatT(startM)} - ${formatT(endM)}`;

                  return (
                    <div className="bg-gradient-to-r from-emerald-950/40 via-[#181818] to-amber-950/40 border-2 border-emerald-500/60 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg">
                            <Target size={26} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 size={14} /> İşaretlediğiniz Niteliklerle En Çok Örtüşen Model
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 mt-0.5">
                              {winningCandidateHD.candidate.timeStr.slice(0, 5)}
                              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                %{topWinnerScore.confidencePercent} Nitelik Uyumu
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-300/80 mt-1 font-mono">
                              Teorik Simülasyon Doruğu (Aday Saatler Arasında Karşılaştırma)
                            </div>
                          </div>
                        </div>

                        <div className="text-right sm:text-right">
                          <span className="text-[11px] text-white/60">İlerleme: </span>
                          <strong className="text-xs text-[#D4AF37]">{answeredCount} / {totalQuestions} Soru Yanıtlandı</strong>
                        </div>
                      </div>

                      {/* Doğrulanan Human Design & Astroloji Özeti */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center">
                          <span className="block text-[10px] uppercase font-bold text-white/40">Human Design Tipi</span>
                          <span className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5 block">{winningCandidateHD.cleanType}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center">
                          <span className="block text-[10px] uppercase font-bold text-white/40">İç Otorite</span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-300 mt-0.5 block">{winningCandidateHD.cleanAuthority}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center">
                          <span className="block text-[10px] uppercase font-bold text-white/40">Yaşam Profili</span>
                          <span className="text-xs sm:text-sm font-bold text-cyan-300 mt-0.5 block">{winningCandidateHD.cleanProfile}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center">
                          <span className="block text-[10px] uppercase font-bold text-white/40">Astrolojik Yükselen</span>
                          <span className="text-xs sm:text-sm font-bold text-purple-300 mt-0.5 block">{winningCandidateHD.candidate.ascSign} ({winningCandidateHD.candidate.ascDegree.toFixed(1)}°)</span>
                        </div>
                      </div>

                      {/* Eşleşen Karakteristikler */}
                      {topWinnerScore.matchedTraits.length > 0 && (
                        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-white/60">Örtüşen Nitelikler:</span>
                          {topWinnerScore.matchedTraits.map((t, idx) => (
                            <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Check size={10} strokeWidth={3} /> {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Uyuşmayan Karakteristikler */}
                      {topWinnerScore.mismatchedTraits.length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-rose-400/80">Uyuşmayan Nitelikler:</span>
                          {topWinnerScore.mismatchedTraits.map((t, idx) => (
                            <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/25 flex items-center gap-1">
                              ✕ {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-[10px] text-white/40 italic pt-1">
                        * Bilimsel Hatırlatma: Bu sonuç bir kesinlik taahhüdü değildir; gerçek doğum anınız bu modellerin tamamen dışında da olabilir.
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TÜM BELİRGİN ZİRVELERİN LİSTESİ */}
            <div className="bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-[#D4AF37]" size={20} />
                Tespit Edilen Teorik Simülasyon Modelleri ({result.topCandidates.length} Model)
              </h3>
              <p className="text-xs text-mystic-text-muted">
                Kadersel olaylarınızın matematiksel algoritmada oluşturduğu tepe noktaları aşağıdadır. (Gerçek doğum anınız bu modellerin dışında da olabilir):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                {result.topCandidates.map((cand, idx) => {
                  const isSelected = selectedPeak.timeStr === cand.timeStr;
                  const pt = result.timelinePoints.find(p => p.hour === cand.hour && Math.abs(p.minute - cand.minute) < 4);
                  const wavePercent = pt?.probabilityPercent || 85;

                  const triScore = triangulationScores.find(s => s.timeStr === cand.timeStr);
                  const candHD = triangulationData?.candidatesData.find(c => c.candidate.timeStr === cand.timeStr);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedPeak(cand)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        triScore?.isTopMatch
                          ? 'bg-gradient-to-br from-[#D4AF37]/25 to-emerald-950/40 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.3)] ring-1 ring-[#D4AF37]'
                          : isSelected 
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-[#D4AF37]">
                          {triScore?.isTopMatch ? '🏆 En Yüksek Uyumlu Model' : `${idx + 1}. Simülasyon Modeli`}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          triScore?.isTopMatch ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-emerald-400'
                        }`}>
                          {triScore ? `Nitelik Uyumu: %${triScore.confidencePercent}` : `Simülasyon Rezonansı: %${wavePercent}`}
                        </span>
                      </div>

                      <div className="text-2xl font-black text-white my-1 flex items-center justify-between">
                        <span>{cand.timeStr.slice(0, 5)}</span>
                        {candHD && (
                          <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-white/10 text-amber-200">
                            {candHD.cleanType} • {candHD.cleanProfile}
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5 text-xs text-white/70 mt-2 pt-2 border-t border-white/10">
                        <div>Teorik Model Doruğu: <strong className="text-white font-mono text-[11px]">{cand.timeStr.slice(0, 5)}</strong></div>
                        <div>Yükselen (ASC): <strong className="text-white">{cand.ascSign} ({cand.ascDegree.toFixed(1)}°)</strong></div>
                        <div>Tepe Noktası (MC): <strong className="text-white">{cand.mcSign}</strong></div>
                        {candHD && (
                          <div className="text-[11px] text-emerald-300/80">Otorite: <strong>{candHD.cleanAuthority}</strong></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEÇİLİ ZİRVENİN KADERSEL KANIT MATRİSİ */}
            <div className="bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-[#D4AF37]" size={20} />
                {selectedPeak.timeStr.slice(0, 5)} Zirvesi İçin Kadersel Açı Kanıtları
              </h3>
              <p className="text-xs text-mystic-text-muted">
                Seçtiğiniz bu saatteki Solar Arc ve Transit kilitlenmelerinin detaylı dökümü:
              </p>

              <div className="space-y-3 mt-4">
                {selectedPeak.eventMatches.map((m, idx) => (
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

            {/* BUTONLAR */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Farklı Bilgilerle Yeniden Hesapla
              </button>

              <button
                onClick={() => {
                  router.push(`/analysis/astrology`);
                }}
                className="py-3.5 px-8 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-xs font-black text-black transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> {selectedPeak.timeStr.slice(0, 5)} Saatiyle Doğum Haritasını Aç
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
