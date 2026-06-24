"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  HelpCircle,
  Trophy,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

interface Question {
  id: string;
  question: string;
  options: string[];
  correctText?: string;
  explanation?: string;
}

export default function ExamTakingPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, role, unlockTier } = useAuth();

  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<{ correctText: string | null; explanation: string | null } | null>(null);
  
  // Guard states
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // To prevent multiple cleanups
  const activeSessionCleaned = useRef(false);
  const examStarted = useRef(false);

  useEffect(() => {
    async function checkExamAccess() {
      if (!user) {
        setBlockedReason("Sınava girmek için lütfen önce giriş yapın.");
        setIsLoadingCheck(false);
        return;
      }

      // 1-3. Tek-cihaz + günlük limit kontrolü + aktif oturum kaydı (sunucu tarafı)
      try {
        await apiFetch('/api/progress/exam/start', {
          method: 'POST',
          body: JSON.stringify({ quizId: id, device: 'web' }),
        });
        examStarted.current = true;
      } catch (err: any) {
        setBlockedReason(err?.message || "Sınav doğrulaması sırasında bir hata oluştu.");
        setIsLoadingCheck(false);
        return;
      }

      // İçeriği API'den yükle
      try {
        if (id === 'aura') {
          const finalQs = await apiFetch<any[]>('/api/content/final-quiz');
          setQuizTitle("Aura & Çakra Sınavı");
          const shuffled = shuffleArray(finalQs).map((q) => ({
            id: String(q.id),
            question: q.question,
            options: shuffleArray(q.options),
            explanation:
              "Aura ve Çakra enerji katmanları, dirimsel gücünüzün (prana) bedeninizle kurduğu köprülerdir.",
          }));
          setQuestions(shuffled);
        } else {
          const quizData = await apiFetch<any>(`/api/content/quizzes/${id}`).catch(() => null);
          if (!quizData) {
            setBlockedReason("Sınav bulunamadı veya geçerli değil.");
            setIsLoadingCheck(false);
            return;
          }
          setQuizTitle(quizData.title);
          setQuestions(
            quizData.questions.map((q: any) => ({
              id: q.id,
              question: q.question,
              options: q.options,
              // doğru cevap & açıklama sunucudan (exam/check) gelir
            })),
          );
        }
        setIsLoadingCheck(false);
      } catch (err) {
        console.error("Exam content load error:", err);
        setBlockedReason("Sınav içeriği yüklenemedi.");
        setIsLoadingCheck(false);
      }
    }

    checkExamAccess();

    // Clean up active session when user exits or unmounts
    return () => {
      if (!activeSessionCleaned.current) {
        activeSessionCleaned.current = true;
        if (examStarted.current) {
          clearActiveSession();
        }
      }
    };
  }, [id, user]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const clearActiveSession = async () => {
    try {
      // score yok → sadece aktif sınav oturumunu temizler (unlock yapmaz)
      await apiFetch('/api/progress/exam/finish', {
        method: 'POST',
        body: JSON.stringify({ quizId: id }),
      });
    } catch (e) {
      console.error("Failed to clear active exam session:", e);
    }
  };

  // Sınav bitince cevapları SUNUCUYA gönder; skoru ve kilidi sunucu belirler.
  useEffect(() => {
    if (isFinished && questions.length > 0) {
      const submit = async () => {
        try {
          await apiFetch('/api/progress/exam/finish', {
            method: 'POST',
            body: JSON.stringify({ quizId: id, answers }),
          });
        } catch (e) {
          console.error('Sınav gönderim hatası:', e);
        }
      };
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const handleOptionSelect = async (optionText: string) => {
    if (selectedOption !== null) return;
    const q = questions[currentIndex];
    setSelectedOption(optionText);
    setAnswers(prev => ({ ...prev, [q.id]: optionText }));
    try {
      const res = await apiFetch<{ correct: boolean; correctAnswer: string | null; explanation: string | null }>(
        '/api/exam/check',
        { method: 'POST', body: JSON.stringify({ quizId: id, qKey: q.id, answer: optionText }) },
      );
      setReveal({ correctText: res.correctAnswer, explanation: res.explanation });
      if (res.correct) setCorrectCount(prev => prev + 1);
    } catch {
      setReveal({ correctText: null, explanation: null });
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setReveal(null);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  };

  const handleBackPress = () => {
    setShowExitConfirm(true);
  };

  // --- LOADING CHECK ---
  if (isLoadingCheck) {
    return (
      <div className="min-h-screen bg-mystic-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-4" size={48} />
          <p className="text-white/80 text-sm font-mono">Sınav doğrulaması yapılıyor...</p>
        </div>
      </div>
    );
  }

  // --- BLOCKED SCREEN ---
  if (blockedReason) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 relative flex items-center justify-center">
        <div className="fixed inset-0 bg-[#0c0314] -z-50" />
        <div className="max-w-md w-full bg-black/80 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Sınav Girişi Engellendi</h3>
          <p className="text-white/60 text-sm leading-relaxed mb-8">{blockedReason}</p>
          <button 
            onClick={() => router.push('/tests')}
            className="w-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 text-[#D4AF37] font-bold py-3 rounded-full hover:bg-[#D4AF37]/5 transition-all duration-300"
          >
            Mabede Dön
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const score = (correctCount / totalQuestions) * 100;

  // --- RESULT SCREEN ---
  if (isFinished) {
    let resultTitle = "";
    let resultMessage = "";
    let resultColorClass = "text-[#D4AF37]";

    if (score === 100) {
      const isMasterTest = id && (id.toString().includes('_3') || id.toString().includes('Final') || id.toString().includes('master') || id === 'runeFinal');
      if (isMasterTest) {
        resultTitle = "Kadim Üstat";
        resultMessage = "Sembollerin ruhuna tamamen vakıfsın. Bu öğretideki en derin sırları çözdün ve Üstatlık mertebesine ulaştın!";
      } else {
        resultTitle = "Tam İdrak (Kilit Kırıldı)";
        resultMessage = "Bu derecenin temelini başarıyla kavradın. Bir sonraki ezoterik derecenin kapısı sana açıldı!";
      }
    } else if (score >= 85 && (id === 'duygusal_hastaliklar_50' || id === 'aura')) {
      resultTitle = id === 'aura' ? "Işık İşçisi / Üstat" : "Hastalıkların İdraki (Kilit Kırıldı)";
      resultMessage = id === 'aura' 
        ? "Büyük sınavı başarıyla tamamladın! Artık tüm kadim dersler kütüphanesine sınırsız erişim hakkına sahipsin."
        : "Hastalıkların duygusal şifalanma şifrelerini başarıyla çözdün!";
    } else if (score >= 60) {
      resultTitle = "Işık İşçisi";
      resultMessage = "Bilgeliğin artıyor ancak zihnin hala dalgalanıyor. Sonraki dereceye geçmek için tam idrak (%100 başarı) gereklidir.";
      resultColorClass = "text-amber-400";
    } else {
      resultTitle = "Arayışta";
      resultMessage = "Henüz sırlar okulunun başındasın. Öğretileri sessizlikte tekrar dinlemeli ve idrak etmelisin.";
      resultColorClass = "text-red-400";
    }

    return (
      <div className="min-h-screen pt-32 pb-24 px-4 relative flex items-center justify-center">
        <div className="fixed inset-0 bg-[#080210] -z-50" />
        <div className="max-w-lg w-full bg-black/70 backdrop-blur-xl border border-[#D4AF37]/20 p-8 md:p-12 rounded-3xl text-center shadow-[0_0_60px_rgba(212,175,55,0.15)] flex flex-col items-center">
          <Trophy className="text-[#D4AF37] animate-bounce mb-6" size={72} />
          
          <h2 className={`text-3xl font-extrabold mb-2 uppercase tracking-wide ${resultColorClass}`}>
            {resultTitle}
          </h2>
          
          <div className="w-32 h-32 rounded-full border-2 border-[#D4AF37]/40 bg-[#D4AF37]/5 flex flex-col justify-center items-center my-6">
            <span className="text-4xl font-extrabold text-white">% {Math.round(score)}</span>
            <span className="text-xs text-[#D4AF37]/60 tracking-wider">BAŞARI</span>
          </div>

          <p className="text-white/90 text-md italic leading-relaxed mb-6">
            "{resultMessage}"
          </p>

          <p className="text-white/40 text-sm font-mono mb-10">
            {totalQuestions} Sorudan {correctCount} Doğru Yanıt
          </p>

          <button 
            onClick={() => router.push('/tests')}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-bold hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 uppercase tracking-wider text-sm"
          >
            Mabede Dön
          </button>
        </div>
      </div>
    );
  }

  // --- EXAM RUNNING ---
  const progressPercent = (currentIndex / totalQuestions) * 100;
  const isSelected = selectedOption !== null;

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative bg-transparent">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d0422] via-[#03000a] to-black -z-50" />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <button 
            onClick={handleBackPress}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/40 text-[#D4AF37] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-center flex-grow mx-4">
            <h1 className="text-lg font-bold text-white tracking-wider truncate max-w-md mx-auto">
              {quizTitle}
            </h1>
            <p className="text-xs text-white/50 font-mono mt-1">
              Soru {currentIndex + 1} / {totalQuestions}
            </p>
          </div>
          
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-10">
          <div 
            className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-black/80 p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-xl pointer-events-none" />
          <p className="text-lg md:text-xl font-bold text-white text-center leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => {
            const isOptSelected = selectedOption === option;
            const isCorrectOption = reveal ? option === reveal.correctText : false;
            const showCorrect = reveal !== null && isCorrectOption;
            const showWrong = reveal !== null && isOptSelected && !isCorrectOption;
            const isPending = reveal === null && isOptSelected;

            let btnClass = "border-white/10 bg-white/[0.03] text-white/80";
            let iconComponent = <div className="w-5 h-5 rounded-full border border-white/30 shrink-0" />;

            if (showCorrect) {
              btnClass = "border-green-500/40 bg-green-500/10 text-green-400 font-semibold shadow-[0_0_15px_rgba(34,197,94,0.15)]";
              iconComponent = <CheckCircle2 className="text-green-400 shrink-0" size={20} />;
            } else if (showWrong) {
              btnClass = "border-red-500/40 bg-red-500/10 text-red-400 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.15)]";
              iconComponent = <XCircle className="text-red-400 shrink-0" size={20} />;
            } else if (isPending) {
              btnClass = "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.15)] animate-pulse";
              iconComponent = <Loader2 className="text-[#D4AF37] animate-spin shrink-0" size={20} />;
            } else if (isSelected) {
              btnClass = "border-white/5 bg-white/[0.01] text-white/30 cursor-not-allowed";
            } else {
              btnClass += " hover:border-[#D4AF37]/30 hover:bg-white/[0.06] cursor-pointer";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option)}
                disabled={isSelected}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border text-left transition-all duration-200 gap-4 ${btnClass}`}
              >
                <span className="text-sm md:text-md leading-relaxed">{option}</span>
                {iconComponent}
              </button>
            );
          })}
        </div>


      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-[#0c0314] border border-[#D4AF37]/20 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Sınavdan Çıkış</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Sınavdan çıkmak istediğinize emin misiniz? Çıkış yaparsanız bugünkü sınav hakkınız yanacaktır ve bugün tekrar giremezsiniz.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 px-6 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-sm font-semibold cursor-pointer"
              >
                İptal
              </button>
              <button 
                onClick={() => {
                  setShowExitConfirm(false);
                  router.push('/tests');
                }}
                className="flex-1 py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all text-sm font-semibold cursor-pointer"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
