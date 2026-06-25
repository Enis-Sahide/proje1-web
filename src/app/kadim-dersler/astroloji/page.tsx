"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Lock, Sparkles, X, Compass, HelpCircle } from 'lucide-react';
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
              src={lesson.image} 
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

export default function AstrolojiPage() {
  const router = useRouter();
  const { role, hasAccess } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<'neofit' | 'adept' | 'master'>('neofit');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [requiredRoleName, setRequiredRoleName] = useState('');

  const { data: lessonsData, loading, error } = useContent<Record<string, any>>('/api/content/lessons?discipline=astrology');

  const isAdeptUnlocked = hasAccess('astroloji_2') || isAdmin;
  const isMasterUnlocked = hasAccess('astroloji_master') || isAdmin;

  const handleTabPress = (tab: 'neofit' | 'adept' | 'master') => {
    if (tab === 'adept' && !isAdeptUnlocked) {
      setRequiredRoleName('Kalfalık');
      setShowLockModal(true);
      return;
    }
    if (tab === 'master' && !isMasterUnlocked) {
      setRequiredRoleName('Üstatlık');
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
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d031c] via-[#05010a] to-[#000000] -z-50" />

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.push('/kadim-dersler')} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-200 to-mystic-primary tracking-wide">
              Ezoterik Astroloji
            </h1>
            <p className="text-mystic-text-muted mt-1 text-sm md:text-base italic">4 Katmanlı Ruhsal Harita Okuma Sanatı</p>
          </div>
        </div>

        {/* Tab Menüsü */}
        <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 mb-8">
          <button 
            onClick={() => handleTabPress('neofit')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all ${
              activeTab === 'neofit' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            }`}
          >
            I. Çıraklık
          </button>
          
          <button 
            onClick={() => handleTabPress('adept')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'adept' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            } ${!isAdeptUnlocked && 'opacity-60'}`}
          >
            {!isAdeptUnlocked && <Lock size={14} className="text-mystic-primary" />}
            II. Kalfalık
          </button>

          <button 
            onClick={() => handleTabPress('master')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'master' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            } ${!isMasterUnlocked && 'opacity-60'}`}
          >
            {!isMasterUnlocked && <Lock size={14} className="text-mystic-primary" />}
            III. Üstatlık
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Compass className="animate-spin text-mystic-primary mx-auto mb-4" size={48} />
            <p className="text-mystic-text-muted">Kozmik arşivler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-mystic-surface/30 rounded-2xl border border-red-500/20">
            <HelpCircle className="text-red-500 mx-auto mb-4" size={48} />
            <p className="text-red-400">İçerik yüklenirken bir hata oluştu: {error}</p>
          </div>
        ) : (
          <div>
            {/* Çıraklık (Seviye 1) */}
            {activeTab === 'neofit' && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Fiziksel İllüzyon (Assiah)</h2>
                  <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base">
                    Sıradan insanların gördüğü dünyevi katmandır. Beden sağlığı, para, iş, eş gibi fiziksel tezahürlerin okunmasını ve haritanın nasıl sentezleneceğini içerir.
                  </p>
                </div>

                <AccordionItem lessonKey="1_nedir" isExpanded={expandedLesson === '1_nedir'} onToggle={() => handleToggle('1_nedir')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="1_harita_nasil_okunur" isExpanded={expandedLesson === '1_harita_nasil_okunur'} onToggle={() => handleToggle('1_harita_nasil_okunur')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="1_evler_katman1" isExpanded={expandedLesson === '1_evler_katman1'} onToggle={() => handleToggle('1_evler_katman1')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="1_gezegenler" isExpanded={expandedLesson === '1_gezegenler'} onToggle={() => handleToggle('1_gezegenler')} lessonsData={lessonsData} />
              </div>
            )}

            {/* Kalfalık (Seviye 2) */}
            {activeTab === 'adept' && isAdeptUnlocked && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Psikolojik ve Karmik (Yetzirah & Briah)</h2>
                  <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base">
                    Olayların arkasındaki &quot;Neden?&quot; sorusunu cevaplarız. Ruhun geçmiş yaşam borçları, içsel çatışmalar ve gölge arketiplerin okunduğu derin katmandır.
                  </p>
                </div>

                <AccordionItem lessonKey="2_evler_katman2" isExpanded={expandedLesson === '2_evler_katman2'} onToggle={() => handleToggle('2_evler_katman2')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="2_karmik_katman" isExpanded={expandedLesson === '2_karmik_katman'} onToggle={() => handleToggle('2_karmik_katman')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="2_evler_katman3" isExpanded={expandedLesson === '2_evler_katman3'} onToggle={() => handleToggle('2_evler_katman3')} lessonsData={lessonsData} />
              </div>
            )}

            {/* Üstatlık (Seviye 3) */}
            {activeTab === 'master' && isMasterUnlocked && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">İlahi Plan (Atziluth)</h2>
                  <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base">
                    Ruhun dünyevi acılarından arınıp evrensel bilince ulaştığı en yüksek frekanstır. Sabit yıldızlar ve tekamül kodlarının şifrelerini içerir.
                  </p>
                </div>

                <AccordionItem lessonKey="3_ezoterik_katman" isExpanded={expandedLesson === '3_ezoterik_katman'} onToggle={() => handleToggle('3_ezoterik_katman')} lessonsData={lessonsData} />
                <AccordionItem lessonKey="3_burclar_ezoterik" isExpanded={expandedLesson === '3_burclar_ezoterik'} onToggle={() => handleToggle('3_burclar_ezoterik')} lessonsData={lessonsData} />
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
