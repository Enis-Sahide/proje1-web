"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Lock, Sparkles, X, HelpCircle, Activity } from 'lucide-react';
import { useContent } from '@/lib/useContent';
import { useAuth } from '@/context/AuthContext';

interface AccordionItemProps {
  lessonKey: string;
  isExpanded: boolean;
  onToggle: () => void;
  lessonsData: Record<string, any> | null;
}

const SubAccordionItem = ({ item }: { item: { title: string, content: string } }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
      >
        <span className="text-sm font-semibold text-mystic-text">{item.title}</span>
        {isOpen ? <ChevronUp size={16} className="text-mystic-text-muted" /> : <ChevronDown size={16} className="text-mystic-text-muted" />}
      </button>
      {isOpen && (
        <div className="px-5 py-4 border-t border-white/5 text-sm text-mystic-text-muted leading-relaxed whitespace-pre-line">
          {item.content}
        </div>
      )}
    </div>
  );
};

const AccordionItem = ({ lessonKey, isExpanded, onToggle, lessonsData }: AccordionItemProps) => {
  const lesson = lessonsData?.[lessonKey];
  if (!lesson) return null;

  return (
    <div className="mb-4 bg-mystic-surface/85 border border-mystic-primary/20 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300">
      <button 
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-mystic-surface transition-colors"
      >
        <span className="text-lg font-bold text-mystic-primary">{lesson.title}</span>
        {isExpanded ? <ChevronUp size={20} className="text-mystic-primary" /> : <ChevronDown size={20} className="text-mystic-primary" />}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-in fade-in duration-300">
          {lesson.image && (
            <img 
              src={lesson.image.uri || lesson.image} 
              alt={lesson.title}
              className="w-full max-h-[300px] object-cover rounded-xl mb-4 border border-white/10 shadow"
            />
          )}
          {lesson.content && (
            <p className="text-mystic-text leading-relaxed text-sm md:text-base whitespace-pre-line">
              {lesson.content}
            </p>
          )}
          
          {lesson.items && lesson.items.length > 0 && (
            <div className="mt-4">
              {lesson.items.map((item: any, index: number) => (
                <SubAccordionItem key={index} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function YogaPage() {
  const router = useRouter();
  const { role, hasAccess } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<'cirak' | 'kalfa' | 'ustat'>('cirak');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [requiredRoleName, setRequiredRoleName] = useState('');

  const { data: lessonsData, loading, error } = useContent<Record<string, any>>('/api/content/lessons?discipline=yoga');

  const isKalfaUnlocked = hasAccess('yoga_2') || isAdmin;
  const isUstatUnlocked = hasAccess('yoga_master') || hasAccess('yoga_3') || isAdmin;

  const handleTabPress = (tab: 'cirak' | 'kalfa' | 'ustat') => {
    if (tab === 'kalfa' && !isKalfaUnlocked) {
      setRequiredRoleName('2. Derece (Kalfalık)');
      setShowLockModal(true);
      return;
    }
    if (tab === 'ustat' && !isUstatUnlocked) {
      setRequiredRoleName('3. Derece (Üstatlık)');
      setShowLockModal(true);
      return;
    }
    setActiveTab(tab);
    setExpandedLesson(null);
  };

  const handleToggle = (key: string) => {
    setExpandedLesson(prev => prev === key ? null : key);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center select-none bg-transparent">
      {/* Mystical deep background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a082c] via-[#0b0314] to-[#000000] -z-50" />

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.push('/kadim-dersler')} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-200 to-mystic-primary tracking-wide">
              Yoga Asanaları ve Nadiler
            </h1>
            <p className="text-mystic-text-muted mt-1 text-sm md:text-base italic">Bedenin, Zihnin ve Ruhun Ezoterik Birleşimi</p>
          </div>
        </div>

        {/* Tab Menüsü */}
        <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 mb-8">
          <button 
            onClick={() => handleTabPress('cirak')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all ${
              activeTab === 'cirak' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            }`}
          >
            1. Derece
          </button>
          
          <button 
            onClick={() => handleTabPress('kalfa')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'kalfa' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            } ${!isKalfaUnlocked && 'opacity-60'}`}
          >
            {!isKalfaUnlocked && <Lock size={14} className="text-mystic-primary" />}
            2. Derece
          </button>

          <button 
            onClick={() => handleTabPress('ustat')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ustat' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            } ${!isUstatUnlocked && 'opacity-60'}`}
          >
            {!isUstatUnlocked && <Lock size={14} className="text-mystic-primary" />}
            3. Derece
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Activity className="animate-spin text-mystic-primary mx-auto mb-4" size={48} />
            <p className="text-mystic-text-muted">Yoga arşivleri yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-mystic-surface/30 rounded-2xl border border-red-500/20">
            <HelpCircle className="text-red-500 mx-auto mb-4" size={48} />
            <p className="text-red-400">İçerik yüklenirken bir hata oluştu: {error}</p>
          </div>
        ) : (
          <div>
            {/* 1. Derece */}
            {activeTab === 'cirak' && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
                  <Sparkles className="text-mystic-primary mb-4" size={40} />
                  <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Köklenme ve Felsefe</h2>
                  <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                    <strong className="text-mystic-primary">Yoga</strong> kelimesi, Sanskritçe &quot;Yuj&quot; kökünden gelir ve &quot;Bütünleşmek/Birleşmek&quot; anlamına gelir. Bireysel ruhun evrensel ruhla birleştiği, egonun eridiği yerdir.
                  </p>
                </div>

                <AccordionItem lessonKey="1_ashtanga" isExpanded={expandedLesson === '1_ashtanga'} onToggle={() => handleToggle('1_ashtanga')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="1_asana" isExpanded={expandedLesson === '1_asana'} onToggle={() => handleToggle('1_asana')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="1_pranayama" isExpanded={expandedLesson === '1_pranayama'} onToggle={() => handleToggle('1_pranayama')} lessonsData={lessonsData} />
              </div>
            )}

            {/* 2. Derece */}
            {activeTab === 'kalfa' && isKalfaUnlocked && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
                  <Sparkles className="text-mystic-primary mb-4" size={40} />
                  <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Enerji Akışları ve Kilitler</h2>
                  <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                    Hatha Yoga kelimesindeki &quot;Ha&quot; Güneşi, &quot;Tha&quot; Ayı temsil eder. Kalfa, nefes ile hareketi (<strong className="text-mystic-primary">Vinyasa</strong>) mükemmel senkronize eden kişidir.
                  </p>
                </div>

                <AccordionItem lessonKey="2_surya_namaskar" isExpanded={expandedLesson === '2_surya_namaskar'} onToggle={() => handleToggle('2_surya_namaskar')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="2_nadi_vayu" isExpanded={expandedLesson === '2_nadi_vayu'} onToggle={() => handleToggle('2_nadi_vayu')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="2_bandhalar" isExpanded={expandedLesson === '2_bandhalar'} onToggle={() => handleToggle('2_bandhalar')} lessonsData={lessonsData} />
              </div>
            )}

            {/* 3. Derece */}
            {activeTab === 'ustat' && isUstatUnlocked && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
                  <Sparkles className="text-mystic-primary mb-4" size={40} />
                  <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Sırların Zirvesi ve Aydınlanma</h2>
                  <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                    Üstat; illüzyon perdesini kaldıran, <strong className="text-mystic-primary">Kundaliniyi</strong> uyandıran ve Samadhi&apos;ye ulaşan ruhani kâşiftir. Tantrik felsefede Güneş ve Ay (Pingala ve Ida) <strong className="text-mystic-primary">3. Gözde (Ajna) birleştiğinde dualite biter.</strong>
                  </p>
                </div>

                <AccordionItem lessonKey="3_kundalini" isExpanded={expandedLesson === '3_kundalini'} onToggle={() => handleToggle('3_kundalini')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="3_mudra_mantra" isExpanded={expandedLesson === '3_mudra_mantra'} onToggle={() => handleToggle('3_mudra_mantra')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="3_samadhi" isExpanded={expandedLesson === '3_samadhi'} onToggle={() => handleToggle('3_samadhi')} lessonsData={lessonsData} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lock Popup Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-mystic-surface border border-mystic-primary/30 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-mystic-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <button 
              onClick={() => setShowLockModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <Lock className="text-red-500" size={32} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Derece Kilitli</h3>
            <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-4">Erişim Engellendi</p>
            
            <p className="text-mystic-text-muted text-sm leading-relaxed mb-6">
              Bu dersi/dereceyi açabilmeniz için en az <strong className="text-mystic-primary">{requiredRoleName}</strong> seviyesine ulaşmış olmanız gerekmektedir.
            </p>

            <button 
              onClick={() => setShowLockModal(false)}
              className="bg-gradient-to-r from-mystic-primary to-yellow-500 text-black font-bold px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 w-full"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
