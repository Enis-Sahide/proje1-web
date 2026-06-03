"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { EMOTIONAL_DISEASES, EmotionalDisease } from '@/data/emotionalDiseases';

export default function DuygusalHastaliklarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredDiseases = EMOTIONAL_DISEASES.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.cause.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Link href="/kadim-dersler" className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors">
            <ArrowLeft className="text-mystic-text" size={24} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-mystic-text">Hastalıkların Duygusal Nedenleri</h1>
            <p className="text-mystic-text-muted mt-2">Bedenimizdeki rahatsızlıkların ardında yatan zihinsel ve ruhsal sebepler.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-mystic-text-muted" size={20} />
          </div>
          <input
            type="text"
            placeholder="Hastalık, semptom veya duygu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-mystic-surface/50 border border-mystic-surface-light rounded-2xl text-mystic-text focus:outline-none focus:border-mystic-primary focus:ring-1 focus:ring-mystic-primary transition-all backdrop-blur-sm"
          />
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredDiseases.length > 0 ? (
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
                    <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-mystic-primary uppercase tracking-wider mb-2">Duygusal Nedeni</h4>
                        <p className="text-mystic-text-muted leading-relaxed">{disease.cause}</p>
                      </div>
                      <div className="bg-mystic-dark/50 p-4 rounded-xl border border-mystic-surface-light/50">
                        <h4 className="text-sm font-bold text-mystic-accent uppercase tracking-wider mb-2">Yeni Düşünce Modeli (Telkin)</h4>
                        <p className="text-mystic-text italic">"{disease.affirmation}"</p>
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
