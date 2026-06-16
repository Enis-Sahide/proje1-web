"use client";

import React from 'react';
import Link from 'next/link';
import { Wrench, ArrowLeft, Crown } from 'lucide-react';

export default function MembershipPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-transparent flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-mystic-surface/60 backdrop-blur-md border border-mystic-primary/20 rounded-3xl p-8 text-center shadow-[0_0_30px_rgba(212,175,55,0.05)] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-mystic-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-mystic-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-full bg-mystic-dark border border-mystic-primary/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative">
          <Crown className="text-mystic-primary/40 absolute" size={40} />
          <Wrench className="text-mystic-accent animate-pulse relative z-10" size={28} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">VIP Seviyeler</h1>
        <p className="text-mystic-accent text-sm font-semibold uppercase tracking-wider mb-4">Yapım Aşamasında</p>
        
        <p className="text-mystic-text-muted text-sm leading-relaxed mb-8">
          Bu sayfa üzerinde çalışmalarımız devam ediyor. Çok yakında yeni vip seviyeleri, üyelik paketleri ve özel ayrıcalıklar hizmetinize sunulacaktır.
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-mystic-primary to-mystic-accent text-black font-bold px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 w-full"
        >
          <ArrowLeft size={16} />
          <span>Ana Sayfaya Dön</span>
        </Link>
      </div>
    </div>
  );
}
