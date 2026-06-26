"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Activity, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '@/lib/useContent';
import RequireRole from '@/core/ui/RequireRole';

type Step = 'intro' | 'quiz' | 'result';

// Presentational çakra meta (sorular DB'den gelir).
type ChakraId = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'thirdEye' | 'crown';
const CHAKRA_INFO: Record<ChakraId, { name: string; color: string; meaning: string; pathId: string }> = {
  root: { name: 'Kök Çakra', color: '#EF4444', meaning: 'Güven, Hayatta Kalma, Köklenme', pathId: '1' },
  sacral: { name: 'Sakral Çakra', color: '#F97316', meaning: 'Duygular, Yaratıcılık, Haz', pathId: '2' },
  solar: { name: 'Solar Pleksus', color: '#EAB308', meaning: 'İrade, Özgüven, Güç', pathId: '3' },
  heart: { name: 'Kalp Çakrası', color: '#22C55E', meaning: 'Sevgi, Şefkat, Affetme', pathId: '4' },
  throat: { name: 'Boğaz Çakrası', color: '#06B6D4', meaning: 'İletişim, Gerçeklik, İfade', pathId: '5' },
  thirdEye: { name: 'Üçüncü Göz', color: '#3B82F6', meaning: 'Sezgi, Vizyon, İçgörü', pathId: '6' },
  crown: { name: 'Taç Çakra', color: '#A855F7', meaning: 'Spiritüellik, Bütünlük, Bilinç', pathId: '7' },
};

interface ChakraQuestion { id: number; chakraId: ChakraId; text: string; }

export default function ChakraAnalysisPage() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<ChakraId, number>>({
    root: 0, sacral: 0, solar: 0, heart: 0, throat: 0, thirdEye: 0, crown: 0
  });
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const { data: questionsData } = useContent<ChakraQuestion[]>('/api/content/chakra-test');
  const CHAKRA_TEST_QUESTIONS = questionsData ?? [];
  const isTransitioning = React.useRef(false);

  const handleAnswer = (points: number) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    const question = CHAKRA_TEST_QUESTIONS[currentQuestion];
    setScores(prev => ({
      ...prev,
      [question.chakraId]: prev[question.chakraId] + points
    }));

    if (currentQuestion < CHAKRA_TEST_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 350); // Prevent double clicks during animation
    } else {
      setStep('result');
    }
  };

  const getPercentage = (score: number) => {
    // Min score is 3 (1+1+1), Max is 9 (3+3+3). 
    // formula: ((score - 3) / 6) * 100
    const pct = Math.round(((score - 3) / 6) * 100);
    return Math.max(0, Math.min(100, pct));
  };

  const renderIntro = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-mystic-surface/80 border border-mystic-surface-light rounded-2xl p-8 md:p-12 backdrop-blur-md shadow-2xl flex flex-col items-center text-center"
    >
      <div className="w-24 h-24 rounded-full bg-mystic-dark border border-mystic-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
        <Sparkles size={40} className="text-mystic-primary opacity-80" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-mystic-text mb-4">Çakra Analizine Hoş Geldiniz</h2>
      
      <p className="text-mystic-text-muted text-lg max-w-2xl leading-relaxed mb-8">
        Bu test, 7 ana enerji merkezinizin mevcut durumunu analiz etmek için özel olarak tasarlanmıştır. 
        Size 21 adet önerme sunacağız. Lütfen bu önermelerin hayatınızdaki mevcut durumunuza ne kadar uygun olduğunu düşünerek, 
        <b> içgüdüsel ve dürüst </b> yanıtlar verin.
      </p>
      
      <button
        onClick={() => setStep('quiz')}
        disabled={CHAKRA_TEST_QUESTIONS.length === 0}
        className="inline-flex items-center gap-2 text-mystic-dark font-bold bg-gradient-to-r from-mystic-primary to-mystic-accent px-8 py-4 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {CHAKRA_TEST_QUESTIONS.length === 0 ? 'Sorular yükleniyor...' : 'Analize Başla'} <Activity size={20} />
      </button>
    </motion.div>
  );

  const renderQuiz = () => {
    // Sorular henüz yüklenmediyse bekleme göster
    if (CHAKRA_TEST_QUESTIONS.length === 0) {
      return (
        <div className="text-center text-mystic-text-muted py-20">Sorular yükleniyor...</div>
      );
    }
    // Safety check just in case
    if (currentQuestion >= CHAKRA_TEST_QUESTIONS.length) {
      return null;
    }

    const question = CHAKRA_TEST_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion) / CHAKRA_TEST_QUESTIONS.length) * 100;

    return (
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-mystic-text-muted mb-2 font-medium">
            <span>Soru {currentQuestion + 1} / {CHAKRA_TEST_QUESTIONS.length}</span>
            <span>%{Math.round(progress)} Tamamlandı</span>
          </div>
          <div className="h-2 w-full bg-mystic-dark rounded-full overflow-hidden border border-mystic-surface-light">
            <motion.div 
              className="h-full bg-gradient-to-r from-mystic-primary to-mystic-accent"
              initial={{ width: `${((currentQuestion - 1) / CHAKRA_TEST_QUESTIONS.length) * 100}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-mystic-surface/80 border border-mystic-surface-light rounded-2xl p-8 md:p-12 backdrop-blur-md shadow-2xl text-center"
          >
            <h3 className="text-xl md:text-2xl font-medium text-mystic-text mb-10 leading-relaxed">
              "{question.text}"
            </h3>

            <div className="flex flex-col gap-4">
              <button onClick={() => handleAnswer(1)} className="w-full py-4 px-6 rounded-xl border border-mystic-surface-light bg-mystic-dark/50 text-mystic-text hover:bg-mystic-primary/10 hover:border-mystic-primary/50 transition-all font-medium text-lg">
                Hiçbir Zaman
              </button>
              <button onClick={() => handleAnswer(2)} className="w-full py-4 px-6 rounded-xl border border-mystic-surface-light bg-mystic-dark/50 text-mystic-text hover:bg-mystic-primary/10 hover:border-mystic-primary/50 transition-all font-medium text-lg">
                Bazen
              </button>
              <button onClick={() => handleAnswer(3)} className="w-full py-4 px-6 rounded-xl border border-mystic-surface-light bg-mystic-dark/50 text-mystic-text hover:bg-mystic-primary/10 hover:border-mystic-primary/50 transition-all font-medium text-lg">
                Her Zaman
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const renderResult = () => {
    const chakraKeys = Object.keys(CHAKRA_INFO) as ChakraId[];
    const sortedChakras = chakraKeys.map(key => ({
      key,
      score: scores[key],
      pct: getPercentage(scores[key])
    })).sort((a, b) => a.pct - b.pct);

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="bg-mystic-surface/80 border border-mystic-surface-light rounded-2xl p-8 md:p-12 backdrop-blur-md shadow-2xl mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-mystic-text mb-4">Çakra Haritanız Hazır</h2>
          <p className="text-mystic-text-muted text-lg max-w-2xl mx-auto">
            Enerji bedeninizin anlık görüntüsü hesaplandı. %100'e yakın olan çakralarınız sağlıklı ve açık, 
            düşük olanlar ise bloke olmuş veya şifalanmaya ihtiyaç duyan merkezlerinizdir.
          </p>
        </div>

        <div className="space-y-6">
          {sortedChakras.map(({ key, pct }, index) => {
            const info = CHAKRA_INFO[key];
            const isUrgent = pct < 40;
            const showUrgentHeader = isUrgent && index === 0;

            return (
              <div key={key}>
                {showUrgentHeader && (
                  <h3 className="text-red-400 font-bold text-xl mb-4 text-left border-b border-red-500/30 pb-2 flex items-center gap-2">
                    <Activity size={24} /> Acil Şifalanması Gerekenler
                  </h3>
                )}
                <div className={`bg-mystic-dark/50 border ${isUrgent ? 'border-red-500/30' : 'border-mystic-surface-light'} rounded-xl p-6`}>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: info.color }}>{info.name}</h3>
                      <p className="text-sm text-mystic-text-muted mt-1">{info.meaning}</p>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: info.color }}>
                      %{pct}
                    </div>
                  </div>
                  
                  <div className="h-3 w-full bg-mystic-surface rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: info.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>

                  <div className="mt-4 text-sm">
                    {isUrgent ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                        <p className="text-red-400">Bu çakranızda ciddi blokajlar görünüyor. Enerji akışı zayıf. Acil şifalanması gerekiyor.</p>
                        <Link href={`/chakra/${info.pathId}`} onClick={() => setIsNavigating(info.name)} className="shrink-0 text-sm font-bold px-5 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full hover:bg-red-500/20 transition-colors flex items-center gap-2">
                          {info.name} Şifası <ArrowLeft className="rotate-180" size={16} />
                        </Link>
                      </div>
                    ) : pct < 70 ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                        <p className="text-yellow-400">Bu çakranız dengesiz çalışıyor. Zaman zaman tıkanıklıklar yaşıyorsunuz. Şifalanmaya ihtiyacı var.</p>
                        <Link href={`/chakra/${info.pathId}`} onClick={() => setIsNavigating(info.name)} className="shrink-0 text-sm font-bold px-5 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full hover:bg-yellow-500/20 transition-colors flex items-center gap-2">
                          Dengele <ArrowLeft className="rotate-180" size={16} />
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-green-400">Bu çakranız oldukça sağlıklı ve dengeli bir şekilde titreşiyor. Harika!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/meditation" className="inline-flex items-center gap-2 text-mystic-dark font-bold bg-gradient-to-r from-mystic-primary to-mystic-accent px-8 py-4 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:scale-105">
            Dengelemek İçin Frekans Odasına Git →
          </Link>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center">
      {/* Background */}
            
      <div className="max-w-4xl w-full">
        <RequireRole minimumRole="free">
          {/* Header (Only show in intro or quiz) */}
          {step !== 'result' && (
            <div className="mb-12 flex items-center">
              <Link href="/analysis" className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors">
                <ArrowLeft className="text-mystic-text" size={24} />
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-mystic-text flex items-center gap-3">
                  Çakra Analizi
                  <Sparkles className="text-mystic-primary" size={32} />
                </h1>
                <p className="text-mystic-text-muted mt-2">Enerji merkezlerinizdeki tıkanıklıkları keşfedin.</p>
              </div>
            </div>
          )}

          {step === 'intro' && renderIntro()}
          {step === 'quiz' && renderQuiz()}
          {step === 'result' && renderResult()}
        </RequireRole>
      </div>

      {isNavigating && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center text-white transition-opacity duration-300">
          <div className="flex flex-col items-center p-8 rounded-3xl bg-mystic-dark/80 border border-mystic-primary/20 shadow-2xl max-w-sm w-full mx-4 text-center">
            <Loader2 className="animate-spin text-mystic-primary mb-6" size={48} />
            <h3 className="text-xl font-bold text-mystic-accent mb-2">
              {isNavigating}
            </h3>
            <p className="text-sm text-mystic-text-muted">
              Kadim katmanlar açılıyor, lütfen bekleyin...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
