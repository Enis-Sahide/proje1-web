"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Lock, Sparkles, X, Network, HelpCircle } from 'lucide-react';
import { useContent } from '@/lib/useContent';
import { useAuth } from '@/context/AuthContext';

// Helper to format/parse markdown text and alerts into beautiful HTML elements
const formatContentText = (text: string) => {
  if (!text) return null;

  // Clean local desktop images or broken mobile images
  let cleanText = text.replace(/!\[.*?\]\(.*?\)/g, '');
  cleanText = cleanText.replace(/<img.*?src=".*?".*?>/g, '');

  // Split lines to detect blockquotes and GitHub alerts
  const lines = cleanText.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let currentBlockquote: string[] = [];
  let blockquoteType: 'note' | 'tip' | 'important' | 'warning' | 'default' = 'default';

  const flushBlockquote = (keyIndex: number) => {
    if (currentBlockquote.length === 0) return;

    const blockquoteText = currentBlockquote.join('\n');
    currentBlockquote = [];

    let borderClass = 'border-l-4 border-mystic-primary bg-mystic-surface/40';
    let title = '';
    let emoji = '📝';

    switch (blockquoteType) {
      case 'note':
        borderClass = 'border-l-4 border-blue-500 bg-blue-500/5';
        title = 'Not';
        emoji = '📝';
        break;
      case 'tip':
        borderClass = 'border-l-4 border-emerald-500 bg-emerald-500/5';
        title = 'İpucu';
        emoji = '💡';
        break;
      case 'important':
        borderClass = 'border-l-4 border-yellow-500 bg-yellow-500/5';
        title = 'Önemli';
        emoji = '⭐';
        break;
      case 'warning':
        borderClass = 'border-l-4 border-red-500 bg-red-500/5';
        title = 'Dikkat';
        emoji = '⚠️';
        break;
    }

    renderedElements.push(
      <div key={`bq-${keyIndex}`} className={`p-4 my-3 rounded-r-xl border-y border-r border-white/5 ${borderClass}`}>
        {title && <span className="block text-xs font-extrabold uppercase tracking-wider mb-1 text-white">{emoji} {title}</span>}
        <p className="text-sm text-mystic-text-muted leading-relaxed whitespace-pre-line">{blockquoteText}</p>
      </div>
    );
    blockquoteType = 'default';
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('>')) {
      let content = trimmed.substring(1).trim();
      
      if (content.toLowerCase().includes('[!note]')) {
        blockquoteType = 'note';
        return;
      } else if (content.toLowerCase().includes('[!tip]')) {
        blockquoteType = 'tip';
        return;
      } else if (content.toLowerCase().includes('[!important]')) {
        blockquoteType = 'important';
        return;
      } else if (content.toLowerCase().includes('[!warning]')) {
        blockquoteType = 'warning';
        return;
      }
      
      currentBlockquote.push(content);
    } else {
      if (currentBlockquote.length > 0) {
        flushBlockquote(index);
      }
      if (trimmed === '') {
        renderedElements.push(<div key={`br-${index}`} className="h-2" />);
      } else {
        // Parse bold and normal text
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="font-bold text-mystic-primary">{part.slice(2, -2)}</strong>;
          } else if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={pIdx} className="italic text-mystic-text-muted">{part.slice(1, -1)}</em>;
          }
          return part;
        });

        renderedElements.push(
          <p key={`p-${index}`} className="text-mystic-text text-sm md:text-base leading-relaxed my-1">
            {formattedLine}
          </p>
        );
      }
    }
  });

  if (currentBlockquote.length > 0) {
    flushBlockquote(lines.length);
  }

  return <div className="space-y-1">{renderedElements}</div>;
};

interface AccordionItemProps {
  lessonKey: string;
  isExpanded: boolean;
  onToggle: () => void;
  lessonsData: Record<string, any> | null;
  onImageSelect: (url: string) => void;
}

const SubAccordionItem = ({ item, onImageSelect }: { item: { title: string, content: string, image?: string }, onImageSelect: (url: string) => void }) => {
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
        <div className="px-5 py-4 border-t border-white/5 animate-in fade-in duration-200">
          {item.image && (
            <div className="cursor-pointer mb-3 max-w-sm" onClick={() => onImageSelect(item.image!)}>
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-auto object-contain rounded-lg border border-white/10 hover:opacity-90 transition-opacity"
              />
            </div>
          )}
          <div className="text-sm text-mystic-text leading-relaxed">
            {formatContentText(item.content)}
          </div>
        </div>
      )}
    </div>
  );
};

const AccordionItem = ({ lessonKey, isExpanded, onToggle, lessonsData, onImageSelect }: AccordionItemProps) => {
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
            <div className="cursor-pointer mb-4 rounded-xl overflow-hidden max-w-lg" onClick={() => onImageSelect(lesson.image!)}>
              <img 
                src={lesson.image} 
                alt={lesson.title}
                className="w-full h-auto object-contain border border-white/10 hover:opacity-90 transition-opacity"
              />
            </div>
          )}
          {lesson.content && (
            <div className="text-mystic-text leading-relaxed text-sm md:text-base mb-4">
              {formatContentText(lesson.content)}
            </div>
          )}
          
          {lesson.items && lesson.items.length > 0 && (
            <div className="mt-4">
              {lesson.items.map((item: any, index: number) => (
                <SubAccordionItem key={index} item={item} onImageSelect={onImageSelect} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function KabbalahPage() {
  const router = useRouter();
  const { role, hasAccess } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<'cirak' | 'kalfa' | 'ustat'>('cirak');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  
  // Image zoom/view modal
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const { data: lessonsData, loading, error } = useContent<Record<string, any>>('/api/content/lessons?discipline=kabbalah');

  const ciraklikKeys = Object.keys(lessonsData ?? {}).filter(k => k.startsWith('ciraklik'));
  const kalfalikKeys = Object.keys(lessonsData ?? {}).filter(k => k.startsWith('kalfalik'));

  const isKalfaUnlocked = hasAccess('kabbalah_2') || isAdmin;
  const isUstatUnlocked = hasAccess('kabbalah_3') || isAdmin;

  const handleTabPress = (tab: 'cirak' | 'kalfa' | 'ustat') => {
    if (tab === 'kalfa' && !isKalfaUnlocked) {
      return;
    }
    if (tab === 'ustat' && !isUstatUnlocked) {
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
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#110121] via-[#05000a] to-[#000000] -z-50" />

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.push('/kadim-dersler')} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-200 to-mystic-primary tracking-wide">
              Evrensel Kabbalah
            </h1>
            <p className="text-mystic-text-muted mt-1 text-sm md:text-base italic">Hayat Ağacı ve Kozmik Şifrelerin Bilimi</p>
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
            <Network className="animate-spin text-mystic-primary mx-auto mb-4" size={48} />
            <p className="text-mystic-text-muted">Hayat Ağacı dalları çiziliyor...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-mystic-surface/30 rounded-2xl border border-red-500/20">
            <HelpCircle className="text-red-500 mx-auto mb-4" size={48} />
            <p className="text-red-400">İçerik yüklenirken bir hata oluştu: {error}</p>
          </div>
        ) : (
          <div>
            {/* Çıraklık (Seviye 1) */}
            {activeTab === 'cirak' && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
                  <Network className="text-mystic-primary mb-4" size={40} />
                  <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Yaşam Ağacına Giriş</h2>
                  <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                    Kabbalah, aklın değil <strong className="text-mystic-primary">evrensel ve ilahi olanın tek dilidir</strong>. Evrenin yaratılışını, kozmik düzeni ve insanın bu düzendeki rolünü anlatan kadim bir bilgeliktir.
                  </p>
                </div>

                {ciraklikKeys.map(key => (
                  <AccordionItem 
                    key={key} 
                    lessonKey={key} 
                    isExpanded={expandedLesson === key} 
                    onToggle={() => handleToggle(key)} 
                    lessonsData={lessonsData}
                    onImageSelect={setZoomImageUrl}
                  />
                ))}
              </div>
            )}

            {/* Kalfalık (Seviye 2) */}
            {activeTab === 'kalfa' && isKalfaUnlocked && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
                  <Sparkles className="text-mystic-primary mb-4" size={40} />
                  <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Pratik Kabbalah ve Thoth</h2>
                  <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                    Pozitif varoluş, Kozmos Tanrıları ve niyetin gücü... Hayatınızı ve auranızı yönetmeyi öğrenerek, bir <strong className="text-mystic-primary">Kozmos Tanrısı</strong> olarak yaratım sürecine aktif katılım vakti.
                  </p>
                </div>

                {kalfalikKeys.map(key => (
                  <AccordionItem 
                    key={key} 
                    lessonKey={key} 
                    isExpanded={expandedLesson === key} 
                    onToggle={() => handleToggle(key)} 
                    lessonsData={lessonsData}
                    onImageSelect={setZoomImageUrl}
                  />
                ))}
              </div>
            )}

            {/* Üstatlık (Seviye 3) */}
            {activeTab === 'ustat' && (
              <div className="animate-in fade-in duration-500 text-center py-20 bg-mystic-surface/30 border border-mystic-primary/20 rounded-3xl backdrop-blur-md max-w-md mx-auto">
                <Lock className="text-mystic-primary mx-auto mb-4 animate-pulse" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Mistik Bilgi Hazırlanıyor</h3>
                <p className="text-mystic-text-muted text-sm px-8 leading-relaxed">
                  Bu derecenin öğretileri henüz aktarılmamıştır. Tapınak çalışmalarına devam edin.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Image Zoom Modal */}
      {zoomImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setZoomImageUrl(null)}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
          >
            <X size={40} />
          </button>
          <img 
            src={zoomImageUrl} 
            alt="Kabbalah Şema"
            className="max-h-[85vh] max-w-full object-contain filter drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          />
        </div>
      )}
    </div>
  );
}
