"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, ChevronDown, ChevronUp, BookOpen, Lock } from 'lucide-react';
import { useContent } from '@/lib/useContent';
import { useAuth } from '@/context/AuthContext';

interface EmotionalDisease {
  name: string;
  cause: string;
  affirmation: string;
  organSystem?: string;
  detailedExplanation?: string;
  symptomMessage?: string;
}

export default function DuygusalHastaliklarPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { user } = useAuth();
  const isLoggedIn = !!user;
  const { data: diseases } = useContent<EmotionalDisease[]>('/api/content/emotional-diseases');
  const allDiseases = diseases ?? [];

  let filteredDiseases: EmotionalDisease[] = [];

  if (isLoggedIn) {
    filteredDiseases = allDiseases.filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.cause.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else {
    // Non-members only see results if they search with >= 2 characters
    if (searchQuery.length >= 2) {
      filteredDiseases = allDiseases.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.cause.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }

  // Alfabetik sırala (Türkçe karakter desteği ile)
  filteredDiseases.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

  const toggleExpand = (index: number) => {
    if (expandedId === index) {
      setExpandedId(null);
    } else {
      setExpandedId(index);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors">
            <ArrowLeft className="text-mystic-text" size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-mystic-text">Hastalıkların Duygusal Nedenleri</h1>
            <p className="text-mystic-text-muted mt-2">Bedenimizdeki rahatsızlıkların ardında yatan zihinsel ve ruhsal sebepler.</p>
          </div>
        </div>

        {/* Educational Article */}
        {isLoggedIn && (
          <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-mystic-dark rounded-full border border-mystic-surface-light">
                <BookOpen className="text-mystic-accent" size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-mystic-text">Bedenin Mesajları: Psikozomatik Bağlantı</h2>
            </div>
            <div className="space-y-4 text-mystic-text-muted leading-relaxed text-sm md:text-base">
              <p>
                Kadim öğretilere ve modern psikolojiye göre, bedenimiz aslında bilinçaltımızın bir yansımasıdır. Yaşadığımız, ancak ifade edemediğimiz veya çözemediğimiz duygusal tıkanıklıklar zamanla fiziksel bedende "hastalık" olarak tezahür eder.
              </p>
              <p>
                Bir ağrı veya semptom ortaya çıktığında, bu aslında bedenin bir <strong className="text-mystic-primary font-medium">yardım çağrısıdır</strong>. Kadim şifa sanatlarına göre, her organın ve bedensel bölgenin temsil ettiği spesifik duygusal ve zihinsel kalıplar vardır.
              </p>
              <p>
                Bu kütüphane, fiziksel semptomlarınızın altında yatan olası <strong className="text-mystic-accent font-medium">zihinsel kök inançları</strong> bulmanız için tasarlanmıştır. Şifa süreci, semptomu sadece fiziksel olarak bastırmakla değil, onun size ne anlatmaya çalıştığını anlamakla başlar. Mesajı alıp o kök duyguyu sevgiyle serbest bıraktığınızda, bedenin kendi kendini iyileştirme mekanizması devreye girer.
              </p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-mystic-text-muted" size={20} />
          </div>
          <input
            type="text"
            placeholder="Hastalık, semptom veya duygu ara... (En az 2 harf)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-mystic-surface/50 border border-mystic-surface-light rounded-2xl text-mystic-text focus:outline-none focus:border-mystic-primary focus:ring-1 focus:ring-mystic-primary transition-all backdrop-blur-sm"
          />
        </div>

        {/* List & Lock Messages */}
        <div className="space-y-4">
          {!isLoggedIn && searchQuery.length < 2 ? (
            <div className="text-center py-16 bg-mystic-surface/30 rounded-2xl border border-mystic-surface-light backdrop-blur-md flex flex-col items-center">
              <Search className="text-mystic-text-muted mb-4 opacity-50" size={48} />
              <h3 className="text-xl font-semibold text-mystic-text mb-2">Hastalığınızı Sorgulayın</h3>
              <p className="text-mystic-text-muted max-w-md mx-auto mb-8">
                Rahatsızlığınızın duygusal kökenini bulmak için arama çubuğuna en az 2 harf giriniz.
              </p>
              
              <div className="p-6 border border-white/5 rounded-2xl bg-black/40 w-full max-w-sm flex flex-col items-center opacity-70 grayscale">
                <div className="w-12 h-12 rounded-full bg-mystic-surface-light flex items-center justify-center mb-4 relative">
                  <BookOpen size={24} className="text-mystic-text" />
                  <div className="absolute -top-1 -right-1 bg-mystic-dark p-1 rounded-full border border-mystic-surface-light text-mystic-text-muted">
                    <Lock size={12} />
                  </div>
                </div>
                <h4 className="text-mystic-text font-bold mb-2">Tüm Liste Ansiklopedisi</h4>
                <div className="mt-2 pt-2 border-t border-white/5 w-full flex items-center justify-center text-xs font-bold text-mystic-text-muted/80">
                  <Lock size={12} className="mr-2" /> Ücretsiz Üyelik Gerektirir
                </div>
              </div>
            </div>
          ) : filteredDiseases.length > 0 ? (
              filteredDiseases.map((disease, index) => {
                const isExpanded = expandedId === index;
                return (
                  <div key={index} className="bg-mystic-surface/80 border border-mystic-surface-light rounded-2xl overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300">
                    <button 
                      onClick={() => toggleExpand(index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-mystic-surface transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-mystic-text pr-4">{disease.name}</h3>
                      {isExpanded ? (
                        <ChevronUp className="text-mystic-primary shrink-0" size={20} />
                      ) : (
                        <ChevronDown className="text-mystic-primary shrink-0" size={20} />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 border-t border-mystic-surface-light/30">
                        {/* Organ / Chakra Badge */}
                        {disease.organSystem && (
                          <div className="pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-mystic-primary/10 border border-mystic-primary/30 text-mystic-primary text-xs font-bold rounded-full">
                              🧬 {disease.organSystem}
                            </span>
                          </div>
                        )}

                        {/* Basic Cause */}
                        <div>
                          <h4 className="text-xs font-bold text-mystic-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            📌 Temel Duygusal Neden & Kök İnanç
                          </h4>
                          <p className="text-mystic-text text-sm leading-relaxed font-medium">{disease.cause}</p>
                        </div>

                        {/* Detailed Psychosomatic Explanation */}
                        {disease.detailedExplanation && (
                          <div className="p-4 bg-mystic-dark/40 rounded-xl border border-mystic-surface-light/40">
                            <h4 className="text-xs font-bold text-mystic-accent uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              🧠 Detaylı Psikosomatik & Ruhsal Analiz
                            </h4>
                            <p className="text-mystic-text-muted text-xs md:text-sm leading-relaxed">{disease.detailedExplanation}</p>
                          </div>
                        )}

                        {/* Body Message */}
                        {disease.symptomMessage && (
                          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              💡 Bedenin Şifa Mesajı
                            </h4>
                            <p className="text-amber-100/90 text-xs md:text-sm italic">{disease.symptomMessage}</p>
                          </div>
                        )}

                        {/* Affirmation Card */}
                        <div className="bg-gradient-to-r from-mystic-primary/10 via-mystic-accent/5 to-mystic-primary/10 p-4 rounded-xl border border-mystic-primary/30 shadow-inner">
                          <h4 className="text-xs font-bold text-mystic-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            ✨ Yeni Düşünce Modeli & Olumlama Telkini
                          </h4>
                          <p className="text-white text-sm md:text-base font-semibold italic">"{disease.affirmation}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-mystic-surface/30 rounded-2xl border border-mystic-surface-light">
                <p className="text-mystic-text-muted">Aramanıza uygun bir hastalık bulunamadı.</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
