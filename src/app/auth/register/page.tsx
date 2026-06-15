"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'free' // Default role
          }
        }
      });

      if (signUpError) throw signUpError;
      
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative pt-20">
            
      <div className="max-w-md w-full bg-mystic-surface/80 backdrop-blur-xl p-8 rounded-3xl border border-mystic-primary/30 shadow-2xl my-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-mystic-dark rounded-full border border-mystic-surface-light">
              <Sparkles className="text-mystic-accent" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-mystic-text mb-2">Aramıza Katılın</h1>
          <p className="text-mystic-text-muted">Kişisel analizleriniz ve ruhsal gelişiminiz için ilk adımı atın.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-mystic-text-muted mb-1">Ad Soyad</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-mystic-text-muted" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 bg-mystic-dark/80 border border-mystic-surface-light rounded-xl text-mystic-text focus:border-mystic-primary focus:ring-1 focus:ring-mystic-primary transition-all outline-none"
                placeholder="Örn: Evrensel Işık"
              />
            </div>
          </div>

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
            <label className="block text-sm font-medium text-mystic-text-muted mb-1">Şifre</label>
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
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Ücretsiz Kayıt Ol'}
          </button>
        </form>

        <p className="mt-8 text-center text-mystic-text-muted text-sm">
          Zaten hesabınız var mı? <Link href="/auth/login" className="text-mystic-accent hover:text-white font-medium transition-colors">Giriş Yapın</Link>
        </p>
      </div>
    </div>
  );
}
