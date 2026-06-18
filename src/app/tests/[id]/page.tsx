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
import { supabase } from '@/lib/supabase';
import { allQuizzes } from '@/data/allQuizzes';
import { FINAL_QUIZ_QUESTIONS } from '@/data/finalQuiz';

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
  correctText: string;
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
  
  // Guard states
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  // To prevent multiple cleanups
  const activeSessionCleaned = useRef(false);

  useEffect(() => {
    async function checkExamAccess() {
      if (!user) {
        setBlockedReason("Sınava girmek için lütfen önce giriş yapın.");
        setIsLoadingCheck(false);
        return;
      }

      try {
        const metadata = user.user_metadata || {};
        const activeExam = metadata.activeExam;
        const examAttempts = metadata.examAttempts || {};

        // 1. Check if another device (mobile) has an active session
        if (activeExam && activeExam.examId) {
          const startTime = new Date(activeExam.startTime).getTime();
          const now = new Date().getTime();
          const diffInMinutes = (now - startTime) / (1000 * 60);

          // If session is on another device (not web) and started less than 60 minutes ago
          if (activeExam.device !== 'web' && diffInMinutes < 60) {
            setBlockedReason(
              "Bu sınava şu anda mobil cihazınızdan giriş yapılmış durumda! Güvenlik nedeniyle aynı anda hem webden hem de telefondan sınava girilemez."
            );
            setIsLoadingCheck(false);
            return;
          }
        }

        // 2. Check if already taken today
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        if (examAttempts[id as string] === today) {
          setBlockedReason(
            "Bu sınava bugün zaten girdiniz! Bir sınava aynı gün içerisinde en fazla 1 kez girebilirsiniz. Lütfen yarın tekrar deneyin."
          );
          setIsLoadingCheck(false);
          return;
        }

        // 3. Register active session & record attempt
        const updatedAttempts = { ...examAttempts, [id as string]: today };
        const { error } = await supabase.auth.updateUser({
          data: {
            ...metadata,
            activeExam: { examId: id, startTime: new Date().toISOString(), device: 'web' },
            examAttempts: updatedAttempts
          }
        });

        if (error) throw error;

        // Initialize quiz questions
        if (id === 'aura') {
          setQuizTitle("Aura & Çakra Sınavı");
          // Shuffle questions and options for Aura final exam
          const shuffled = shuffleArray(FINAL_QUIZ_QUESTIONS).map((q) => {
            const shuffledOptions = shuffleArray(q.options);
            return {
              id: String(q.id),
              question: q.question,
              options: shuffledOptions,
              correctText: q.correctAnswer,
              explanation: "Aura ve Çakra enerji katmanları, dirimsel gücünüzün (prana) bedeninizle kurduğu köprülerdir."
            };
          });
          setQuestions(shuffled);
        } else {
          const quizData = allQuizzes[id as string];
          if (!quizData) {
            setBlockedReason("Sınav bulunamadı veya geçerli değil.");
            setIsLoadingCheck(false);
            return;
          }
          setQuizTitle(quizData.title);
          const mapped = quizData.questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctText: q.options[q.correctAnswerIndex],
            explanation: q.explanation
          }));
          setQuestions(mapped);
        }

        setIsLoadingCheck(false);
      } catch (err) {
        console.error("Exam access verification error:", err);
        setBlockedReason("Sınav doğrulaması sırasında bir hata oluştu.");
        setIsLoadingCheck(false);
      }
    }

    checkExamAccess();

    // Clean up active session when user exits or unmounts
    return () => {
      if (!activeSessionCleaned.current) {
        activeSessionCleaned.current = true;
        clearActiveSession();
      }
    };
  }, [id, user]);

  const clearActiveSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        await supabase.auth.updateUser({
          data: {
            ...metadata,
            activeExam: null
          }
        });
      }
    } catch (e) {
      console.error("Failed to clear active exam session:", e);
    }
  };

  // Trigger unlock when finished
  useEffect(() => {
    if (isFinished && questions.length > 0) {
      const totalQuestions = questions.length;
      const score = (correctCount / totalQuestions) * 100;

      const triggerUnlock = async () => {
        // Unlock Logic based on exam ID and score
        if (score === 100) {
          if (id === 'numeroloji_1') await unlockTier('numeroloji_2');
          if (id === 'numeroloji_2') await unlockTier('numeroloji_3');
          if (id === 'numeroloji_3') await unlockTier('numeroloji_master');
          
          if (id === 'rune1') await unlockTier('rune_2');
          if (id === 'rune2') await unlockTier('rune_master');
          
          if (id === 'yoga_1') await unlockTier('yoga_2');
          if (id === 'yoga_2') await unlockTier('yoga_master');
          
          if (id === 'human_1') await unlockTier('human_2');
          if (id === 'human_2') await unlockTier('human_master');

          if (id === 'astroloji_1') await unlockTier('astroloji_2');
          if (id === 'astroloji_2') await unlockTier('astroloji_master');

          if (id === 'akupunktur_1') await unlockTier('akupunktur_2');
          if (id === 'akupunktur_2') await unlockTier('akupunktur_master');
        }

        if (score >= 85) {
          if (id === 'duygusal_hastaliklar_50') {
            await unlockTier('duygusal_hastaliklar_access');
          }
          if (id === 'aura') {
            await unlockTier('kadim_dersler_access');
            
            // Save spiritual title & score for Aura final exam
            let title = "Uyanış Yolcusu";
            if (score >= 90) title = "Üstat";
            else if (score >= 70) title = "Işık İşçisi";

            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              const currentMetadata = session.user.user_metadata || {};
              await supabase.auth.updateUser({
                data: {
                  ...currentMetadata,
                  spiritual_title: title,
                  spiritual_score: Math.round(score)
                }
              });
            }
          }
        }
      };

      triggerUnlock();
    }
  }, [isFinished, correctCount, questions, id, unlockTier]);

  const handleOptionSelect = (optionText: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionText);

    const isCorrect = optionText === questions[currentIndex].correctText;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleBackPress = () => {
    const confirmExit = window.confirm(
      "Testten çıkmak istediğinize emin misiniz? Mevcut ilerlemeniz kaydedilmeyecektir."
    );
    if (confirmExit) {
      router.push('/tests');
    }
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
            const isCorrectOption = option === currentQuestion.correctText;
            const showCorrect = isSelected && isCorrectOption;
            const showWrong = isSelected && isOptSelected && !isCorrectOption;

            let btnClass = "border-white/10 bg-white/[0.03] hover:border-[#D4AF37]/30 hover:bg-white/[0.06] text-white/80";
            let iconComponent = <div className="w-5 h-5 rounded-full border border-white/30 shrink-0" />;

            if (showCorrect) {
              btnClass = "border-green-500/40 bg-green-500/10 text-green-400 font-semibold shadow-[0_0_15px_rgba(34,197,94,0.15)]";
              iconComponent = <CheckCircle2 className="text-green-400 shrink-0" size={20} />;
            } else if (showWrong) {
              btnClass = "border-red-500/40 bg-red-500/10 text-red-400 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.15)]";
              iconComponent = <XCircle className="text-red-400 shrink-0" size={20} />;
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

        {/* Explanation & Next Button */}
        {isSelected && (
          <div className="mt-10 p-6 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Info size={18} />
              <span className="font-bold text-sm tracking-wider uppercase">Kadim Bilgi</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed font-serif italic">
              {currentQuestion.explanation}
            </p>

            <button
              onClick={handleNextQuestion}
              className="w-full mt-6 py-4 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 uppercase tracking-wider text-xs"
            >
              {currentIndex < totalQuestions - 1 ? (
                <>
                  Sonraki Soru
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Sonucu Gör
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
