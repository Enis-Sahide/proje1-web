"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Hexagon, Loader2, Calendar, User, ArrowRight, Target, Heart, 
  Sparkles, Info, AlertCircle, Zap, Briefcase, Award, ShieldCheck, 
  CheckCircle2, TrendingUp, Compass, Flame, Droplets, Wind, Mountain
} from 'lucide-react';
import { calculateLifePath, calculatePersonalYear, calculateArrows, getBirthdayNumber, calculateNameAnalysis, reduceToSingleDigit } from '@/utils/numerologyCalculator';
import { lifePathData, birthdayData, arrowsData, emptyArrowsData, personalYearData, numerologyData } from '@/utils/numerologyData';
import { useAuth } from '@/context/AuthContext';
import { 
  PhoneticChakraEngine, 
  CHAKRA_METADATA, 
  TargetGoal, 
  SimulationComparison, 
  BrandAnalysisResult, 
  SuggestedNameItem 
} from '@/features/numerology/engine/PhoneticChakraEngine';

const isMaster = (num: number) => num === 11 || num === 22 || num === 33;

const reduceNumber = (num: number): number => {
  if (isMaster(num)) return num;
  let sum = num;
  while (sum > 9 && !isMaster(sum)) {
    sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
};

export default function NumerologyPage() {
  const router = useRouter();
  const { role } = useAuth();
  const isApprenticeOrAbove = role === 'apprentice' || role === 'journeyman' || role === 'master' || role === 'admin';
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsAdmin(params.get('admin') === 'true');
    }
  }, []);

  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<'name' | 'date' | 'brand'>('name');
  
  // Inputs
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandSlogan, setBrandSlogan] = useState('');

  // Simulator Inputs in Name Tab
  const [additionalNameInput, setAdditionalNameInput] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<TargetGoal>('wealth');

  // Computed Data for Date
  const [lifePath, setLifePath] = useState<{ number: number; calculationString: string } | null>(null);
  const [birthday, setBirthday] = useState<number | null>(null);
  const [arrows, setArrows] = useState<{ arrowKeys: string[]; emptyArrowKeys: string[]; visualString: string } | null>(null);
  const [personalYear, setPersonalYear] = useState<{ number: number; calculationString: string } | null>(null);

  // Computed Data for Name
  const [nameResults, setNameResults] = useState<{
    lifePathRaw: string;
    lifePath: number;
    destiny: number;
    soulUrge: number;
    personality: number;
    purpose: number;
    challenges: string;
    chakraMatrix: number[];
  } | null>(null);

  // Simulation Data (Name + Additional Name)
  const [simulationData, setSimulationData] = useState<SimulationComparison | null>(null);

  // Brand Analysis Data
  const [brandResult, setBrandResult] = useState<BrandAnalysisResult | null>(null);

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'date' && !birthDate) return;
    if (activeTab === 'name' && (!name || !birthDate)) return;
    if (activeTab === 'brand' && !brandName.trim()) return;

    setIsAnalyzing(true);
    
    if (activeTab === 'brand') {
      const fullBrand = brandSlogan.trim() ? `${brandName.trim()} ${brandSlogan.trim()}` : brandName.trim();
      const res = PhoneticChakraEngine.analyzeBrand(fullBrand);
      setBrandResult(res);
    } else if (activeTab === 'date') {
      setLifePath(calculateLifePath(birthDate));
      setBirthday(getBirthdayNumber(birthDate));
      setArrows(calculateArrows(birthDate));
      setPersonalYear(calculatePersonalYear(birthDate));
      setNameResults(null);
      setSimulationData(null);
    } else {
      // Name tab
      const lp = calculateLifePath(birthDate);
      const nameRes = calculateNameAnalysis(name);
      
      const parts = birthDate.split('-');
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const d = parseInt(parts[2]);
      
      const dRed = reduceNumber(d);
      const mRed = reduceNumber(m);
      const yRed = reduceNumber(y);
      const lifePathSum = dRed + mRed + yRed;
      const lifePathRaw = `${lifePathSum}/${lp.number}`;

      setLifePath(lp);
      setBirthday(getBirthdayNumber(birthDate));
      setArrows(calculateArrows(birthDate));
      setPersonalYear(calculatePersonalYear(birthDate));
      
      setNameResults({
        lifePathRaw,
        lifePath: lp.number,
        destiny: nameRes.destiny,
        soulUrge: nameRes.soulUrge,
        personality: nameRes.personality,
        purpose: nameRes.purpose,
        challenges: nameRes.challenges,
        chakraMatrix: nameRes.chakraMatrix
      });

      // Initial simulation with no additional name
      const sim = PhoneticChakraEngine.simulatePersonalName(name, additionalNameInput);
      setSimulationData(sim);
    }

    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 1500);
  };

  // Re-run simulation when user types an additional name or clicks a recommendation
  const handleAdditionalNameChange = (newAddName: string) => {
    setAdditionalNameInput(newAddName);
    if (name) {
      const sim = PhoneticChakraEngine.simulatePersonalName(name, newAddName);
      setSimulationData(sim);
    }
  };

  const lpData = lifePath ? lifePathData[lifePath.number] || lifePathData[1] : null;
  const bdData = birthday ? birthdayData[birthday] || birthdayData[1] : null;
  const pyData = personalYear ? personalYearData[personalYear.number] || personalYearData[1] : null;

  // Format date for display: YYYY-MM-DD -> DD Mart YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getMatrixText = (count: number) => {
    if (count === 0) return 'Eksik';
    if (count === 1) return '1 Harf';
    return `${count} Harf`;
  };

  // Analysis card for traditional numerology numbers
  const renderAnalysisCard = (
    title: string, 
    num: number, 
    dataKey: 'lifePathDetails' | 'destinyDetails' | 'soulUrgeDetails' | 'personalityDetails' | 'description'
  ) => {
    const data = numerologyData[num] || numerologyData[reduceNumber(num)];
    if (!data) return null;

    return (
      <div key={title} className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-[#AF52DE]/40 transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#AF52DE]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#AF52DE]/10 transition-colors"></div>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="flex flex-col items-center justify-start shrink-0">
            <div className="text-xs text-mystic-text-muted mb-2 uppercase tracking-wider font-semibold">Titreşim</div>
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#AF52DE]/20 to-transparent border border-[#AF52DE]/30 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-light text-white font-serif">{num}</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#AF52DE] bg-[#AF52DE]/10 px-2.5 py-1 rounded-full">{data.typology}</span>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                <Target size={16} className="text-[#AF52DE]" /> Analiz Raporu:
              </h4>
              <p className="text-gray-300 leading-relaxed text-sm">
                {dataKey === 'description' ? data.description : data[dataKey]}
              </p>
            </div>

            {dataKey === 'description' && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                {data.constructivePotentials && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-1">Yapıcı Potansiyeller:</h4>
                    <p className="text-gray-300 leading-relaxed text-xs">{data.constructivePotentials}</p>
                  </div>
                )}
                {data.negativePotentials && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-1">Gölge Yönler:</h4>
                    <p className="text-gray-300 leading-relaxed text-xs">{data.negativePotentials}</p>
                  </div>
                )}
                {data.relationships && (
                  <div>
                    <h4 className="text-sm font-semibold text-[#4285F4] mb-1">İlişkiler ve Aşk:</h4>
                    <p className="text-gray-300 leading-relaxed text-xs">{data.relationships}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDisclaimer = () => (
    <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-2xl p-4 flex gap-3 items-start mt-6">
      <Info size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
      <p className="text-xs text-mystic-text-muted leading-relaxed">
        Bu analizler, kadim Pisagor numerolojisi, Kabbalistik harf akustiği ve ses mahreci modellerine dayanan algoritmik ve matematiksel yorumlamalardır. Kişisel farkındalık ve kurumsal strateji yolculuğunuzda size rehberlik etmek üzere tasarlanmıştır.
      </p>
    </div>
  );

  const renderBarcodeWarnings = (
    lifePathNum: number,
    birthdayNum: number,
    destiny?: number,
    soulUrge?: number,
    personality?: number,
    chakraMatrix?: number[]
  ) => {
    const planetaryMap: Record<number, string> = {
      1: "Güneş", 2: "Ay", 3: "Jüpiter", 4: "Uranüs", 5: "Merkür",
      6: "Venüs", 7: "Neptün", 8: "Satürn", 9: "Mars"
    };
    const planetName = planetaryMap[lifePathNum] || "Satürn";

    let karmicCode = "Yok";
    if (birthDate.startsWith("19") || destiny === 19 || soulUrge === 19 || personality === 19 || lifePathNum === 1 || birthdayNum === 17) {
      karmicCode = "19/1";
    } else if (destiny === 13 || soulUrge === 13 || personality === 13 || lifePathNum === 4) {
      karmicCode = "13/4";
    } else if (destiny === 14 || soulUrge === 14 || personality === 14 || lifePathNum === 5) {
      karmicCode = "14/5";
    } else if (destiny === 16 || soulUrge === 16 || personality === 16 || lifePathNum === 7) {
      karmicCode = "16/7";
    }

    let ruhKodu = soulUrge ? reduceToSingleDigit(soulUrge) : reduceToSingleDigit(birthdayNum);
    if (karmicCode === "19/1") ruhKodu = 1;

    let alanKodu = 2;
    const missingList: number[] = [];
    if (chakraMatrix) {
      chakraMatrix.forEach((count, idx) => {
        if (count === 0) missingList.push(idx + 1);
      });
    }
    if (missingList.length > 0) alanKodu = missingList[0];

    const warnings = [];

    if (ruhKodu === 1 || karmicCode === "19/1") {
      const isNestedKarmic = ruhKodu === 1 && karmicCode === "19/1";
      warnings.push({
        number: "1 / 11:11 / 10:10",
        title: "11:11 Çift Yönlü Uyanış Frekansı",
        desc: `Haritanızda Ruh Kodu: 1 (Kişilik Kodu) ${isNestedKarmic ? "ve bu kodun içine gömülü olan Karmik Borç Kodu: 19/1" : ""} bulunmaktadır. Günlük hayatta 1 sayı dizilerini görmeniz: Liderlik, bağımsızlık ve öncü ruhunuzu aktif ederek akışta kalmanızı hatırlatır.`,
        icon: <Zap className="text-yellow-400" size={16} />,
        color: "border-yellow-400/20 bg-yellow-400/5 text-yellow-400"
      });
    }

    if (alanKodu === 2) {
      warnings.push({
        number: "2 / 22:22 / 222",
        title: "22:22 Aura Sınır ve Koruma Frekansı",
        desc: "Alandaki koruma kodunuz 2'dir. Günlük hayatta 2 dizilerini görmek; sınırlarınızı net çizmeniz ve enerji sızıntılarını engellemeniz gerektiği mesajını taşır.",
        icon: <Info className="text-blue-400" size={16} />,
        color: "border-blue-400/20 bg-blue-400/5 text-blue-400"
      });
    }

    if (reduceToSingleDigit(birthdayNum) === 8 || planetName === "Satürn") {
      warnings.push({
        number: "8 / 8:08 / 888",
        title: "8:08 Sorumluluk ve Satürn Frekansı",
        desc: `Beden yöneticiniz Satürn'dür. 8 görmek; dünyevi sorumlulukları ertelememeyi ve disiplin dengesini korumanızı hatırlatır.`,
        icon: <AlertCircle className="text-red-400" size={16} />,
        color: "border-red-400/20 bg-red-400/5 text-red-400"
      });
    }

    if (warnings.length === 0) {
      warnings.push({
        number: "Genel Sayısal Hat",
        title: "Eşzamanlı Rakamlar ve Yüksek Benlik Rehberi",
        desc: "Günlük hayatta karşılaştığınız tekrarlanan sayılar, Yüksek Benliğin o sayıların numerolojik enerjisini hayatınıza entegre etmeniz gerektiği mesajını taşır.",
        icon: <Sparkles className="text-indigo-400" size={16} />,
        color: "border-indigo-400/20 bg-indigo-400/5 text-indigo-400"
      });
    }

    if (!isApprenticeOrAbove) return null;

    return (
      <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 mt-6">
        <h3 className="text-lg font-bold text-[#D4AF37] mb-1">Astro-Numerolojik Kişisel Kodlarınız</h3>
        <p className="text-xs text-mystic-text-muted mb-6 leading-relaxed">
          Kozmik evren sistemine giriş kodlarınız ve bu kodların günlük hayattaki eşzamanlı uyanış titreşimleri.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase tracking-wider text-mystic-text-muted block mb-1">Karmik Borç Kodu</span>
            <span className="text-xl font-bold text-red-500 font-serif">{karmicCode}</span>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase tracking-wider text-mystic-text-muted block mb-1">Kişilik Kodu</span>
            <span className="text-xl font-bold text-white font-serif">{ruhKodu}</span>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase tracking-wider text-mystic-text-muted block mb-1">Aura Koruma Kodu</span>
            <span className="text-xl font-bold text-yellow-400 font-serif">
              {alanKodu}
              <span className="text-[9px] block text-mystic-text-muted font-sans font-normal mt-0.5">(Sınır ve Koruma)</span>
            </span>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase tracking-wider text-mystic-text-muted block mb-1">Doğum Kodu</span>
            <span className="text-xl font-bold text-white font-serif">{reduceToSingleDigit(birthdayNum)}</span>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-mystic-text-muted block mb-1">Gezegen Yöneticisi</span>
            <span className="text-sm font-bold text-[#E0B0FF] block mt-1.5">{planetName}</span>
          </div>
        </div>

        <h4 className="text-sm font-bold text-[#D4AF37] mb-3 border-t border-white/5 pt-4">Kozmik Eşzamanlılık Uyarıları</h4>
        <div className="space-y-4">
          {warnings.map((w, idx) => (
            <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border flex items-center justify-center shrink-0 ${w.color.split(' ').slice(0, 2).join(' ')}`}>
                  {w.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{w.title}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-mystic-text-muted">Eşleşen Kod: {w.number}</span>
                </div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 md:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 flex items-center text-mystic-text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Geri Dön
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#AF52DE]/10 border border-[#AF52DE]/30 flex items-center justify-center text-[#AF52DE]">
            <Hexagon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Numeroloji & Harf Akustiği</h1>
            <p className="text-mystic-text-muted">Pisagor, Kabala & Ses Mahreçlerine Göre Titreşimsel Analiz</p>
          </div>
        </div>

        {/* Tab Selection */}
        {!showResult && (
          <div className="grid grid-cols-3 border border-white/10 bg-black/40 rounded-2xl p-1 max-w-xl mx-auto mb-8">
            <button 
              type="button"
              onClick={() => setActiveTab('name')}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'name' ? 'bg-[#AF52DE] text-white shadow-lg' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              <User size={16} />
              <span>İsim & Ek İsim</span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('brand')}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'brand' ? 'bg-[#D4AF37] text-black font-bold shadow-lg' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              <Briefcase size={16} />
              <span>Marka & Şirket</span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('date')}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'date' ? 'bg-[#AF52DE] text-white shadow-lg' : 'text-mystic-text-muted hover:text-white'
              }`}
            >
              <Calendar size={16} />
              <span>Doğum Tarihi</span>
            </button>
          </div>
        )}

        {/* INPUT FORMS */}
        {!showResult ? (
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#AF52DE]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2 animate-pulse">Kozmik Ses ve Çakra Frekansları Titreşiyor...</h3>
                <p className="text-sm text-white/60">Mahreçler, Ouroboros aurası ve sayı sekansları taranıyor</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'name' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-mystic-text-muted mb-2">Nüfus Cüzdanındaki Tam Adınız ve Soyadınız *</label>
                    <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        required 
                        type="text" 
                        placeholder="Örn: Ayşe Yılmaz"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#AF52DE] transition-colors" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi *</label>
                    <div className="relative">
                      <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        required 
                        type="date" 
                        min="1900-01-01"
                        max="2100-12-31"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#AF52DE] transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-mystic-text-muted space-y-1">
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#AF52DE]" /> Ek İsim Simülasyonu Hakkında
                    </p>
                    <p>
                      Mevcut isminizi analiz ettikten sonra raporda açılacak <strong>Simülatör</strong> ile düşündüğünüz ek isimleri deneyebilir, eksik çakralarınızı kapatıp kapatmadığını canlı görebilirsiniz.
                    </p>
                  </div>

                  <button type="submit" className="w-full bg-[#AF52DE] hover:bg-[#8e3ec2] text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(175,82,222,0.3)]">
                    İsim & Çakra Profilimi Çıkar
                  </button>
                </>
              )}

              {activeTab === 'brand' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-mystic-text-muted mb-2">Firma, Şirket veya Proje İsmi *</label>
                    <div className="relative">
                      <Briefcase size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        required 
                        type="text" 
                        placeholder="Örn: Omnia Studio, 7Layers Labs, Arcana Digital"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mystic-text-muted mb-2">Slogan veya Ek Unvan (İsteğe Bağlı)</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Kadim Bilgiler, Creative Labs, Digital Solutions"
                      value={brandSlogan}
                      onChange={(e) => setBrandSlogan(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" 
                    />
                  </div>

                  <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl text-xs text-mystic-text-muted space-y-1">
                    <p className="font-semibold text-[#D4AF37] flex items-center gap-1.5">
                      <Award size={14} /> Şirket İsmi Akustiği Neler Sağlar?
                    </p>
                    <p>
                      • <strong>Ouroboros Geometrisi:</strong> İsmin ilk ve son harfinin parayı içeride tutma kabiliyeti.<br />
                      • <strong>Mahreç Analizi:</strong> Gırtlak (Görünürlük/Şöhret) vs Dudak (Mülk/Para/Satış) dengesi.<br />
                      • <strong>Sektörel Başarı Puanları:</strong> Finans, Görsel Sanat, Akademi/Eğitim veya Teknoloji uyumu.
                    </p>
                  </div>

                  <button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#b8972e] text-black font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                    Marka Akustiğini Analiz Et
                  </button>
                </>
              )}

              {activeTab === 'date' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi *</label>
                    <div className="relative">
                      <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        required 
                        type="date" 
                        min="1900-01-01"
                        max="2100-12-31"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#AF52DE] transition-colors" 
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full bg-[#AF52DE] hover:bg-[#8e3ec2] text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(175,82,222,0.3)]">
                    Yaşam Yolu Raporumu Getir
                  </button>
                </>
              )}
            </form>
          </div>
        ) : (
          /* RESULTS VIEW */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* BRAND RESULTS */}
            {activeTab === 'brand' && brandResult && (
              <div className="space-y-8">
                {/* Brand Header & Score */}
                <div className="bg-gradient-to-br from-[#D4AF37]/15 via-black/50 to-black/80 border border-[#D4AF37]/40 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">
                        Kurumsal Akustik & Rezonans Raporu
                      </span>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                        {brandResult.brandName}
                      </h2>
                      <p className="text-sm text-mystic-text-muted mt-2">
                        {brandResult.cleanLetters.length} Harf • {9 - brandResult.missingChakras.length}/9 Çakra Rezonansı
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-black/60 border border-[#D4AF37]/30 rounded-2xl p-4 shrink-0">
                      <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        <span className="text-2xl font-bold text-[#D4AF37]">{brandResult.acousticScore}</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/60">/ 100</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Rezonans Skoru</span>
                        <span className="text-xs text-green-400 font-semibold">
                          {brandResult.acousticScore >= 80 ? '👑 Zirve Titreşim' : brandResult.acousticScore >= 60 ? '⚡ Güçlü Rezonans' : '🌱 Geliştirilebilir'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ouroboros Aura Rozeti */}
                <div className={`p-6 rounded-3xl border ${
                  brandResult.ouroboros.isClosed 
                    ? 'bg-gradient-to-r from-green-500/10 via-black/40 to-transparent border-green-500/30' 
                    : 'bg-black/40 border-white/10'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      brandResult.ouroboros.isClosed ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
                    }`}>
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white">{brandResult.ouroboros.badge}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          brandResult.ouroboros.isClosed ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-white/10 text-white/60'
                        }`}>
                          {brandResult.ouroboros.isClosed ? 'Kapalı Aura Kalkanı' : 'Açık Enerji Hattı'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed mb-4">
                        {brandResult.ouroboros.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5 font-mono">
                        <div>
                          <strong className="text-mystic-primary">Temel Taşı (İlk Harf):</strong> {brandResult.cornerstone.char} ({brandResult.cornerstone.mahrecName} - {brandResult.cornerstone.element})
                        </div>
                        <div>
                          <strong className="text-mystic-primary">Zirve Taşı (Son Harf):</strong> {brandResult.capstone.char} ({brandResult.capstone.mahrecName} - {brandResult.capstone.element})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mahreç Dağılımı (Seslerin Anatomisi) */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Compass size={20} className="text-[#D4AF37]" />
                    <span>Fonetik Mahreç Dağılımı (Sesin Çıktığı Merkezler)</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between text-xs text-mystic-text-muted mb-1">
                        <span className="flex items-center gap-1 text-red-400"><Flame size={14} /> Gırtlak & Boğaz</span>
                        <span className="font-bold text-white">%{brandResult.mahrecStats.throat.percentage}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-semibold mt-1">Ateş & Güneş</p>
                      <p className="text-[11px] text-white/50 mt-1 leading-snug">Görünürlük, sahneye çıkış ve şöhret.</p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between text-xs text-mystic-text-muted mb-1">
                        <span className="flex items-center gap-1 text-green-400"><Mountain size={14} /> Dudak & Ağız</span>
                        <span className="font-bold text-white">%{brandResult.mahrecStats.lip.percentage}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-semibold mt-1">Toprak & Mülk</p>
                      <p className="text-[11px] text-white/50 mt-1 leading-snug">Mal, para, kazancı kasada tutma.</p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between text-xs text-mystic-text-muted mb-1">
                        <span className="flex items-center gap-1 text-blue-400"><Wind size={14} /> Damak & Dil</span>
                        <span className="font-bold text-white">%{brandResult.mahrecStats.palate.percentage}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-semibold mt-1">Hava & Zeka</p>
                      <p className="text-[11px] text-white/50 mt-1 leading-snug">İletişim, hızlı yayılma ve network.</p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between text-xs text-mystic-text-muted mb-1">
                        <span className="flex items-center gap-1 text-purple-400"><Droplets size={14} /> Diş & Islık</span>
                        <span className="font-bold text-white">%{brandResult.mahrecStats.dental.percentage}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-semibold mt-1">Aura & Odak</p>
                      <p className="text-[11px] text-white/50 mt-1 leading-snug">Manyetik çekim ve koruyucu kalkan.</p>
                    </div>
                  </div>
                </div>

                {/* Sektörel Uyumluluk Kartları */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" />
                    <span>Sektörel Başarı & Çekim Endeksi</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Finans */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-base">💰 Finans, E-Ticaret & Satış</h4>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          brandResult.industryScores.finance.level === 'high' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          brandResult.industryScores.finance.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'
                        }`}>
                          %{brandResult.industryScores.finance.score} Uyum
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {brandResult.industryScores.finance.verdict}
                      </p>
                    </div>

                    {/* Sanat & Görsel */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-base">🎨 Sanat, Görsel Tasarım & AI</h4>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          brandResult.industryScores.creative.level === 'high' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          brandResult.industryScores.creative.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'
                        }`}>
                          %{brandResult.industryScores.creative.score} Uyum
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {brandResult.industryScores.creative.verdict}
                      </p>
                    </div>

                    {/* Eğitim & Bilgelik */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-base">📚 Eğitim, Akademi & Ruhsal Danışmanlık</h4>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          brandResult.industryScores.educationSpiritual.level === 'high' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          brandResult.industryScores.educationSpiritual.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'
                        }`}>
                          %{brandResult.industryScores.educationSpiritual.score} Uyum
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {brandResult.industryScores.educationSpiritual.verdict}
                      </p>
                    </div>

                    {/* Teknoloji */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-base">⚡ Teknoloji, Yazılım & İnovasyon</h4>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          brandResult.industryScores.technology.level === 'high' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          brandResult.industryScores.technology.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'
                        }`}>
                          %{brandResult.industryScores.technology.score} Uyum
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {brandResult.industryScores.technology.verdict}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 9 Çakra Güç Barları */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">9 Çakra Frekans Dağılımı</h3>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(chNum => {
                      const count = brandResult.matrix[chNum - 1];
                      const meta = CHAKRA_METADATA[chNum];
                      return (
                        <div key={chNum} className="flex items-center gap-3 text-xs">
                          <span className="w-6 font-bold text-white font-mono">{chNum}.</span>
                          <span className="w-24 md:w-32 text-gray-300 truncate">{meta.name}</span>
                          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ 
                                width: count === 0 ? '0%' : `${Math.min(100, count * 33)}%`,
                                backgroundColor: meta.color 
                              }}
                            />
                          </div>
                          <span className={`w-16 text-right font-semibold ${count === 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {count === 0 ? 'Eksik' : `${count} Harf`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Güçlü Yönler & Tavsiyeler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 space-y-3">
                    <h4 className="font-bold text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} /> Markanın Güçlü Frekansları
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {brandResult.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5 space-y-3">
                    <h4 className="font-bold text-[#D4AF37] text-sm flex items-center gap-2">
                      <Sparkles size={16} /> Büyüme & Optimizasyon İpuçları
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {brandResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {renderDisclaimer()}
              </div>
            )}

            {/* PERSONAL NAME & SIMULATOR RESULTS */}
            {activeTab === 'name' && nameResults && (
              <>
                {/* Report Header */}
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#D4AF37]">
                    {name.toLocaleUpperCase('tr-TR')} ÖZEL ANALİZİ
                  </h2>
                  <span className="text-white font-medium bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                    {formatDate(birthDate)}
                  </span>
                </div>

                {/* INTERACTIVE ADDITIONAL NAME SIMULATOR */}
                <div className="bg-gradient-to-br from-[#AF52DE]/15 via-black/60 to-black/90 border border-[#AF52DE]/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#AF52DE] font-bold block mb-1">
                        Özel Laboratuvar
                      </span>
                      <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <Sparkles className="text-[#AF52DE]" /> Ek İsim Simülatörü & Çakra Tamamlama
                      </h3>
                      <p className="text-xs text-mystic-text-muted mt-1">
                        İsminize ikinci bir isim eklediğinizde eksik çakralarınızın nasıl kapandığını ve enerjinizin nasıl yükseldiğini anlık test edin.
                      </p>
                    </div>

                    {simulationData && (
                      <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl px-4 py-3 shrink-0">
                        <div className="text-center">
                          <span className="text-[10px] text-mystic-text-muted uppercase block">Önceki Puan</span>
                          <span className="text-lg font-bold text-white">{simulationData.scoreChange.originalScore}</span>
                        </div>
                        <ArrowRight size={16} className="text-[#AF52DE]" />
                        <div className="text-center">
                          <span className="text-[10px] text-green-400 uppercase block">Simülasyon</span>
                          <span className="text-2xl font-bold text-green-400">{simulationData.scoreChange.simulatedScore}</span>
                        </div>
                        {simulationData.scoreChange.difference > 0 && (
                          <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/30">
                            +{simulationData.scoreChange.difference}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Simulator Input Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8">
                      <label className="block text-xs font-semibold text-mystic-text-muted mb-1.5">
                        Test Etmek İstediğiniz Ek İsim:
                      </label>
                      <input 
                        type="text" 
                        placeholder="Örn: Melis, Berk, Defne, Arya, Gizem..."
                        value={additionalNameInput}
                        onChange={(e) => handleAdditionalNameChange(e.target.value)}
                        className="w-full bg-white/5 border border-[#AF52DE]/50 focus:border-[#AF52DE] rounded-xl px-4 py-3 text-white text-base focus:outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="md:col-span-4 flex items-end">
                      {additionalNameInput.trim() && (
                        <button 
                          onClick={() => handleAdditionalNameChange('')}
                          className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          Simülasyonu Sıfırla
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Simulation Comparative Status */}
                  {simulationData && (
                    <div className="space-y-4">
                      {/* Ouroboros Status with Additional Name */}
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3 text-xs">
                        <ShieldCheck size={20} className={simulationData.ouroborosInfo.isClosed ? 'text-green-400 shrink-0' : 'text-mystic-primary shrink-0'} />
                        <div>
                          <span className="font-bold text-white block mb-0.5">
                            {simulationData.simulatedFullName} $\rightarrow$ {simulationData.ouroborosInfo.title}
                          </span>
                          <p className="text-gray-300 leading-relaxed">
                            {simulationData.ouroborosInfo.description}
                          </p>
                        </div>
                      </div>

                      {/* Newly Filled Badges */}
                      {simulationData.newlyFilledChakras.length > 0 && (
                        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                          <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                          <div className="text-xs">
                            <span className="font-bold text-green-400 block mb-0.5">
                              Tebrikler! Ek İsim ile Yeni Kapanan Karmik Çakralar:
                            </span>
                            <span className="text-white">
                              {simulationData.newlyFilledChakras.map(ch => `${ch}. Çakra (${CHAKRA_METADATA[ch].name})`).join(', ')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 9-Chakra Live Matrix Comparison */}
                      <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-center pt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => {
                          const origCount = simulationData.originalMatrix[c - 1];
                          const simCount = simulationData.simulatedMatrix[c - 1];
                          const isNewlyFilled = origCount === 0 && simCount > 0;
                          const isStillEmpty = simCount === 0;

                          return (
                            <div 
                              key={c} 
                              className={`p-2.5 rounded-xl border transition-all ${
                                isNewlyFilled 
                                  ? 'bg-green-500/20 border-green-400 ring-2 ring-green-400/30' 
                                  : isStillEmpty 
                                  ? 'bg-red-500/10 border-red-500/30 opacity-70' 
                                  : 'bg-black/40 border-white/10'
                              }`}
                            >
                              <span className="text-[10px] text-mystic-text-muted block">{c}. Çakra</span>
                              <span className="text-base font-bold text-white block mt-0.5">{simCount}</span>
                              <span className="text-[9px] block uppercase font-bold tracking-wider mt-0.5">
                                {isNewlyFilled ? (
                                  <span className="text-green-400">Yeni Doldu!</span>
                                ) : isStillEmpty ? (
                                  <span className="text-red-400">Eksik</span>
                                ) : (
                                  <span className="text-white/60">Aktif</span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SMART RECOMMENDATIONS BY GOAL */}
                  <div className="border-t border-white/10 pt-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Award size={16} className="text-[#D4AF37]" /> Hedefinize Göre Tavsiye Edilen Ek İsimler:
                        </h4>
                        <p className="text-xs text-mystic-text-muted">
                          Hangi enerjiyi hayatınıza çekmek istiyorsanız seçin; sistem eksik çakralarınızı kapatan isimleri önersin:
                        </p>
                      </div>

                      {/* Goal Selector Buttons */}
                      <div className="flex flex-wrap gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => setSelectedGoal('wealth')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedGoal === 'wealth' ? 'bg-[#D4AF37] text-black shadow' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          💰 Bolluk & Para
                        </button>
                        <button
                          onClick={() => setSelectedGoal('fame')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedGoal === 'fame' ? 'bg-[#AF52DE] text-white shadow' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          🌟 Görünürlük
                        </button>
                        <button
                          onClick={() => setSelectedGoal('love')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedGoal === 'love' ? 'bg-pink-500 text-white shadow' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          💖 Aşk & Çekim
                        </button>
                        <button
                          onClick={() => setSelectedGoal('spiritual')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedGoal === 'spiritual' ? 'bg-blue-500 text-white shadow' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          🧘 Ruhsal Sezgi
                        </button>
                      </div>
                    </div>

                    {/* Filtered Recommended Names Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {simulationData && PhoneticChakraEngine.getRecommendedNamesForMissingChakras(
                        simulationData.originalMissing, 
                        selectedGoal
                      ).slice(0, 6).map((item, idx) => (
                        <div 
                          key={idx} 
                          className="bg-black/50 border border-white/10 hover:border-[#AF52DE]/50 p-4 rounded-2xl transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-lg font-bold text-white group-hover:text-[#AF52DE] transition-colors">{item.name}</h5>
                              <span className="text-[10px] uppercase font-bold text-mystic-text-muted bg-white/5 px-2 py-0.5 rounded-md">
                                {item.mahrecType === 'lip' ? 'Dudak' : item.mahrecType === 'throat' ? 'Gırtlak' : item.mahrecType === 'dental' ? 'Diş' : 'Damak'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed mb-3">
                              {item.reason}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleAdditionalNameChange(item.name)}
                            className="w-full py-2 bg-white/5 hover:bg-[#AF52DE] text-white text-xs font-bold rounded-xl transition-all border border-white/10 hover:border-transparent flex items-center justify-center gap-1.5"
                          >
                            <span>Bu İsmi Simüle Et</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Özet Tablosu */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-xs uppercase tracking-wider text-mystic-text-muted block mb-1">Hayat Kulvarı</span>
                    <span className="text-2xl font-bold text-white font-serif">{nameResults.lifePathRaw}</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-xs uppercase tracking-wider text-mystic-text-muted block mb-1">Kişilik Rakamı</span>
                    <span className="text-2xl font-bold text-white font-serif">{nameResults.personality}</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-xs uppercase tracking-wider text-mystic-text-muted block mb-1">İsim Numarası</span>
                    <span className="text-2xl font-bold text-white font-serif">{nameResults.destiny}</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-xs uppercase tracking-wider text-mystic-text-muted block mb-1">En Büyük Sınav</span>
                    <span className="text-2xl font-bold text-red-500 font-serif">{nameResults.challenges}</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-xs uppercase tracking-wider text-mystic-text-muted block mb-1">Ruhunu Tanımlama</span>
                    <span className="text-2xl font-bold text-white font-serif">{nameResults.soulUrge}</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-xs uppercase tracking-wider text-mystic-text-muted block mb-1">Varoluş Amacı</span>
                    <span className="text-2xl font-bold text-white font-serif">{nameResults.purpose}</span>
                  </div>
                </div>

                {/* Çakra Sütunu Ve Açıklaması */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-4">
                  <div className="md:col-span-5 border border-white/10 bg-black/30 rounded-2xl overflow-hidden">
                    <div className="bg-white/5 py-3 text-center border-b border-white/10">
                      <span className="text-sm font-bold text-[#AF52DE]">Çakra Sütunu</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((c) => {
                        const count = nameResults.chakraMatrix[c - 1];
                        return (
                          <div key={c} className="flex items-center justify-between px-4 py-2.5 text-sm">
                            <span className="text-mystic-text-muted">{c}. Çakra</span>
                            <span className={`font-semibold ${
                              count === 0 ? 'text-red-500' : 
                              count === 2 ? 'text-green-400' :
                              count === 3 ? 'text-yellow-400' :
                              count >= 4 ? 'text-[#AF52DE]' : 'text-white'
                            }`}>
                              {getMatrixText(count)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-4">
                    <div className="bg-[#AF52DE]/10 border border-[#AF52DE]/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-xs font-bold text-[#AF52DE]">
                      <Sparkles size={14} />
                      <span>Enerji Meridyenleri</span>
                    </div>
                    <p className="text-sm text-mystic-text-muted leading-relaxed">
                      Bu tablo, isminizi oluşturan harflerin 9 temel çakranıza ne kadar enerji (frekans) gönderdiğini gösterir. Bu dağılım, doğuştan gelen ruhsal yeteneklerinizi ve bu hayatta öğrenmeniz gereken karmik dersleri belirler.
                    </p>
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-start gap-3 text-xs leading-relaxed text-mystic-text-muted">
                        <span className="w-3 h-3 rounded-full bg-red-500 shrink-0 mt-0.5"></span>
                        <p><strong className="text-red-500">Eksik:</strong> Bu yaşamdaki karmik sınavınızdır. Ek isim simülasyonu ile bu frekansı dengeleyebilirsiniz.</p>
                      </div>
                      <div className="flex items-start gap-3 text-xs leading-relaxed text-mystic-text-muted">
                        <span className="w-3 h-3 rounded-full bg-white/40 shrink-0 mt-0.5"></span>
                        <p><strong className="text-white">1 Harf:</strong> Doğal ve dengeli bir enerji akışı vardır.</p>
                      </div>
                      <div className="flex items-start gap-3 text-xs leading-relaxed text-mystic-text-muted">
                        <span className="w-3 h-3 rounded-full bg-green-400 shrink-0 mt-0.5"></span>
                        <p><strong className="text-green-400">2 Harf:</strong> Güçlü ve verimli bir enerji hattıdır.</p>
                      </div>
                      <div className="flex items-start gap-3 text-xs leading-relaxed text-mystic-text-muted">
                        <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0 mt-0.5"></span>
                        <p><strong className="text-yellow-400">3 Harf:</strong> Baskın güçtür. Seçimlerinizi güçlü bir şekilde yönlendirir.</p>
                      </div>
                      <div className="flex items-start gap-3 text-xs leading-relaxed text-mystic-text-muted">
                        <span className="w-3 h-3 rounded-full bg-[#AF52DE] shrink-0 mt-0.5"></span>
                        <p><strong className="text-[#AF52DE]">4+ Harf:</strong> Ana taşıyıcı kolonunuz olan yeteneğinizdir.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detaylı Analizler */}
                <div className="space-y-6 pt-4">
                  <h3 className="text-xl font-bold text-white tracking-wide border-b border-white/5 pb-2">Detaylı Analiz Raporları</h3>
                  {renderAnalysisCard("Hayat Kulvarı (Yaşam Yolu)", nameResults.lifePath, "lifePathDetails")}
                  {renderAnalysisCard("En Ön Plandaki Kişilik", nameResults.personality, "personalityDetails")}
                  {renderAnalysisCard("İsim Numaranız (Kader)", nameResults.destiny, "description")}
                  {renderAnalysisCard("Ruhunuzu Tanımlama (Ruh Güdüsü)", nameResults.soulUrge, "soulUrgeDetails")}
                </div>

                {renderBarcodeWarnings(nameResults.lifePath, parseInt(birthDate.split('-')[2]), nameResults.destiny, nameResults.soulUrge, nameResults.personality, nameResults.chakraMatrix)}

                {renderDisclaimer()}
              </>
            )}

            {/* DATE ONLY RESULTS */}
            {activeTab === 'date' && lifePath && (
              <>
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#D4AF37]">
                    Doğum Tarihi Sayısal Analizi
                  </h2>
                  <span className="text-white font-medium bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                    {formatDate(birthDate)}
                  </span>
                </div>

                {/* Life Path Number */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-[#AF52DE]/40 transition-colors">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#AF52DE]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#AF52DE]/10 transition-colors"></div>
                  
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                    <div className="flex flex-col items-center justify-start shrink-0">
                      <div className="text-sm text-mystic-text-muted mb-3 uppercase tracking-wider font-semibold">Yaşam Yolu</div>
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#AF52DE]/20 to-transparent border border-[#AF52DE]/30 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-5xl font-light text-white font-serif">{lifePath?.number}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="border-b border-white/5 pb-4">
                        <h3 className="text-2xl font-bold text-[#AF52DE] mb-2">Yaşam Yolu Numarası - {lifePath?.number}</h3>
                        <p className="text-sm text-gray-400 font-mono bg-black/30 p-2 rounded-lg inline-block border border-white/5">
                          {lifePath?.calculationString}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Target size={18} className="text-[#AF52DE]" /> Karakter, olasılıklar:
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {lpData?.character}
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <ArrowRight size={18} className="text-[#AF52DE]" /> Zayıf yönler, öğrenilmesi gerekenler:
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {lpData?.weakness}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Birthday Number */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-[#4285F4]/40 transition-colors">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#4285F4]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#4285F4]/10 transition-colors"></div>
                  
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                    <div className="flex flex-col items-center justify-start shrink-0">
                      <div className="text-sm text-mystic-text-muted mb-3 uppercase tracking-wider font-semibold">Doğum Günü</div>
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#4285F4]/20 to-transparent border border-[#4285F4]/30 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-5xl font-light text-white font-serif">{birthday}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="border-b border-white/5 pb-4">
                        <h3 className="text-2xl font-bold text-[#4285F4] mb-2">Doğum Günü Numarası - {birthday} - Yetenek</h3>
                        <p className="text-sm text-gray-400 font-mono bg-black/30 p-2 rounded-lg inline-block border border-white/5">
                          {birthDate.split('-').reverse().join('.')}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Heart size={18} className="text-[#4285F4]" /> Karakter, potansiyeller:
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {bdData?.character}
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <ArrowRight size={18} className="text-[#4285F4]" /> Zayıf yönler, öğrenilmesi gerekenler:
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {bdData?.weakness}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pythagorean Arrows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {arrows?.arrowKeys.map(arrowKey => {
                    const arrowData = arrowsData[arrowKey];
                    return (
                      <div key={arrowKey} className="bg-black/30 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-1">{arrowData.name}</h3>
                        <p className="text-sm text-[#D4AF37] mb-3 font-mono">Tam Ok {arrowKey}</p>
                        <div className="bg-black/50 py-2 px-4 rounded-lg mb-4 text-center font-mono tracking-widest text-gray-300 border border-white/5">
                          {arrows.visualString}
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {arrowData.description}
                        </p>
                      </div>
                    );
                  })}
                  
                  {arrows?.emptyArrowKeys?.map(arrowKey => {
                    const arrowData = emptyArrowsData[arrowKey];
                    return (
                      <div key={`empty-${arrowKey}`} className="bg-black/30 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-1">{arrowData.name}</h3>
                        <p className="text-sm text-gray-400 mb-3 font-mono">Boş Ok {arrowKey}</p>
                        <div className="bg-black/50 py-2 px-4 rounded-lg mb-4 text-center font-mono tracking-widest text-gray-300 border border-white/5 opacity-50">
                          {arrows.visualString}
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {arrowData.description}
                        </p>
                      </div>
                    );
                  })}
                  
                  {(!arrows?.arrowKeys || arrows.arrowKeys.length === 0) && (!arrows?.emptyArrowKeys || arrows.emptyArrowKeys.length === 0) && (
                    <div className="col-span-1 md:col-span-2 bg-black/30 border border-white/5 rounded-2xl p-6 text-center">
                      <p className="text-gray-400">Haritanızda tam oluşmuş veya tamamen boş bir Pisagor Oku bulunmamaktadır. Bu durum esnekliğinizi ve farklı enerjilere açık olduğunuzu gösterir.</p>
                    </div>
                  )}
                </div>

                {/* Personal Year */}
                <div className="bg-gradient-to-br from-[#32D74B]/10 to-transparent border border-[#32D74B]/30 rounded-3xl p-6 md:p-8">
                  <h2 className="text-xl font-bold text-[#32D74B] mb-2 border-b border-[#32D74B]/20 pb-4">
                    Mevcut Döneme İlişkin Rapor
                  </h2>
                  
                  <div className="mt-6 flex flex-col md:flex-row gap-6">
                    <div className="w-24 h-24 shrink-0 rounded-2xl bg-black/40 border border-[#32D74B]/30 flex flex-col items-center justify-center shadow-lg">
                      <span className="text-4xl font-light text-[#32D74B] font-serif">{personalYear?.number}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">Kişisel Yıl {personalYear?.number} - {pyData?.title}</h3>
                      <p className="text-xs text-gray-400 mb-4 font-mono">
                        Bir sonraki doğum gününe kadar (Son tarih: {formatDate(`${new Date().getFullYear() + 1}-${birthDate.split('-')[1]}-${birthDate.split('-')[2]}`)}):<br/>
                        {personalYear?.calculationString}
                      </p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {pyData?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {isAdmin && renderBarcodeWarnings(
                  lifePath!.number,
                  birthday!
                )}

                {renderDisclaimer()}
              </>
            )}

            <button onClick={() => setShowResult(false)} className="mt-8 text-[#AF52DE] hover:text-white transition-colors underline text-sm w-full text-center">
              Yeni Bir Hesaplama Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
