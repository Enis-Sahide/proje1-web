"use client";

import React, { useState } from 'react';
import { ArrowLeft, Lock, Sparkles, X, Activity, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContent } from '@/lib/useContent';
import { useAuth } from '@/context/AuthContext';

interface AccordionItemProps {
  lessonKey: string;
  isExpanded: boolean;
  onToggle: () => void;
  lessonsData: Record<string, any> | null;
}

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
          {lesson.content && (
            <p className="text-mystic-text leading-relaxed text-sm md:text-base whitespace-pre-line">
              {lesson.content}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default function AkupunkturPage() {
  const router = useRouter();
  const { role, hasAccess } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<'cirak' | 'kalfa' | 'ustat'>('cirak');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const { data: lessonsData, loading, error } = useContent<Record<string, any>>('/api/content/lessons?discipline=akupunktur');

  const isKalfaUnlocked = hasAccess('akupunktur_2') || isAdmin;
  const isUstatUnlocked = hasAccess('akupunktur_3') || isAdmin;

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
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#031c17] via-[#010a08] to-[#000000] -z-50" />

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.push('/kadim-dersler')} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-200 to-mystic-primary tracking-wide">
              Akupunktur ve Meridyenler
            </h1>
            <p className="text-mystic-text-muted mt-1 text-sm md:text-base italic">Bedenin Görünmez Enerji Kanalları ve Şifa Haritası</p>
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

        {/* Tanıtım Kartı */}
        <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg text-center flex flex-col items-center">
          <Activity className="text-emerald-400 mb-4" size={40} />
          <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Enerji Kanalları (Chi)</h2>
          <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
            Bedenimizdeki görünmez enerji otoyolları olan meridyenler, yaşam gücümüzün (Chi) akışını sağlar. Bu akış tıkandığında hastalıklar başlar.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Activity className="animate-spin text-mystic-primary mx-auto mb-4" size={48} />
            <p className="text-mystic-text-muted">Meridyen haritaları yükleniyor...</p>
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
              <div className="animate-in fade-in duration-500">
                <AccordionItem lessonKey="1_temel_sifa" isExpanded={expandedLesson === '1_temel_sifa'} onToggle={() => handleToggle('1_temel_sifa')} lessonsData={lessonsData} />
              </div>
            )}

            {/* 2. Derece */}
            {activeTab === 'kalfa' && isKalfaUnlocked && (
              <div className="animate-in fade-in duration-500">
                <AccordionItem lessonKey="2_12_meridyen" isExpanded={expandedLesson === '2_12_meridyen'} onToggle={() => handleToggle('2_12_meridyen')} lessonsData={lessonsData} />
              </div>
            )}

            {/* 3. Derece */}
            {activeTab === 'ustat' && isUstatUnlocked && (
              <div className="animate-in fade-in duration-500">
                <AccordionItem lessonKey="3_dugumler_cozmek" isExpanded={expandedLesson === '3_dugumler_cozmek'} onToggle={() => handleToggle('3_dugumler_cozmek')} lessonsData={lessonsData} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
