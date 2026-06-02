"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';
// import { supabase } from '@/utils/supabaseClient'; // TODO: Setup Supabase Client

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Supabase login logic
    setTimeout(() => {
      setLoading(false);
      alert("Giriş işlemi başarılı (Demo)");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative pt-20">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-screen -z-10 pointer-events-none" />
      
      <div className="max-w-md w-full bg-mystic-surface/80 backdrop-blur-xl p-8 rounded-3xl border border-mystic-primary/30 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-mystic-dark rounded-full border border-mystic-surface-light">
              <Sparkles className="text-mystic-accent" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-mystic-text mb-2">Hoş Geldiniz</h1>
          <p className="text-mystic-text-muted">Kozmik yolculuğunuza devam etmek için giriş yapın.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-mystic-text-muted mb-1">E-posta</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-mystic-text-muted" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 bg-mystic-dark/80 border border-mystic-surface-light rounded-xl text-mystic-text focus:border-mystic-primary focus:ring-1 focus:ring-mystic-primary transition-all outline-none"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-mystic-text-muted">Şifre</label>
              <Link href="/auth/forgot-password" className="text-sm text-mystic-primary hover:text-mystic-accent transition-colors">Şifremi Unuttum?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-mystic-text-muted" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 bg-mystic-dark/80 border border-mystic-surface-light rounded-xl text-mystic-text focus:border-mystic-primary focus:ring-1 focus:ring-mystic-primary transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-mystic-primary to-purple-600 hover:from-purple-600 hover:to-mystic-primary text-white font-bold py-3.5 rounded-xl mt-6 transition-all flex justify-center items-center shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Giriş Yap'}
          </button>
        </form>

        <p className="mt-8 text-center text-mystic-text-muted text-sm">
          Hesabınız yok mu? <Link href="/auth/register" className="text-mystic-accent hover:text-white font-medium transition-colors">Hemen Üye Olun</Link>
        </p>
      </div>
    </div>
  );
}
