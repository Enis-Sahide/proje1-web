"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Loader2, Sparkles, AlertCircle, CheckCircle, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot bot tuzağı

  // Doğrulama adımı state'leri
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tekrar gönder sayacı
  const [countdown, setCountdown] = useState(0);

  // URL'den doğrulama parametresi geldiyse doğrudan doğrulama adımına geç
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const verifyParam = searchParams.get('verify');
    if (emailParam) {
      setEmail(emailParam);
      if (verifyParam === 'true') {
        setStep('verify');
        setCountdown(60);
      }
    }
  }, [searchParams]);

  // Geri sayım sayacı
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Kayıt formunu gönderme (Adım 1)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await apiFetch<any>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName: name, website }),
      });

      if (res?.requiresVerification) {
        setStep('verify');
        setCountdown(60);
        setSuccessMessage('Doğrulama kodu e-posta adresinize gönderildi.');
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // 6 Haneli Kodu Doğrulama (Adım 2)
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu eksiksiz girin.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await apiFetch('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, code: code.trim() }),
      });

      setSuccessMessage('E-posta başarıyla doğrulandı! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Kod doğrulanamadı.');
      setLoading(false);
    }
  };

  // Tekrar Kod Gönder
  const handleResendCode = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError(null);

    try {
      await apiFetch('/api/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setCountdown(60);
      setSuccessMessage('Yeni doğrulama kodu e-postanıza gönderildi.');
    } catch (err: any) {
      setError(err.message || 'Kod yeniden gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-mystic-surface/80 backdrop-blur-xl p-8 rounded-3xl border border-mystic-primary/30 shadow-2xl my-8 relative">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-mystic-dark rounded-full border border-mystic-surface-light">
            {step === 'form' ? (
              <Sparkles className="text-mystic-accent" size={32} />
            ) : (
              <KeyRound className="text-mystic-primary" size={32} />
            )}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-mystic-text mb-2">
          {step === 'form' ? 'Aramıza Katılın' : 'E-Posta Doğrulama'}
        </h1>
        <p className="text-mystic-text-muted text-sm">
          {step === 'form'
            ? 'Kişisel analizleriniz ve ruhsal gelişiminiz için ilk adımı atın.'
            : `${email} adresine 6 haneli bir onay kodu gönderdik.`}
        </p>
      </div>

      {/* Mesaj Bildirimleri */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-start gap-3">
          <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-emerald-200">{successMessage}</p>
        </div>
      )}

      {/* ADIM 1: KAYIT FORMU */}
      {step === 'form' && (
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Honeypot gizli bot alanı */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

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
            className="w-full bg-gradient-to-r from-mystic-primary to-purple-600 hover:from-purple-600 hover:to-mystic-primary text-white font-bold py-3.5 rounded-xl mt-6 transition-all flex justify-center items-center shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Doğrulama Kodu Al ve Kayıt Ol'}
          </button>
        </form>
      )}

      {/* ADIM 2: E-POSTA DOĞRULAMA KODU (OTP) */}
      {step === 'verify' && (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label className="block text-center text-xs uppercase tracking-widest text-mystic-text-muted mb-3 font-semibold">
              6 Haneli Doğrulama Kodu
            </label>
            <div className="flex justify-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                placeholder="••••••"
                className="w-64 text-center py-3.5 bg-mystic-dark border-2 border-mystic-primary/50 focus:border-mystic-primary rounded-2xl text-white font-mono text-3xl tracking-[0.4em] outline-none shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all"
              />
            </div>
            <p className="text-center text-xs text-mystic-text-muted mt-2">
              Kod 15 dakika boyunca geçerlidir. Lütfen spam kutunuzu da kontrol edin.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length !== 6}
            className="w-full bg-gradient-to-r from-mystic-primary to-[#D4AF37] hover:brightness-110 text-black font-bold py-3.5 rounded-xl transition-all flex justify-center items-center shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2 text-black" /> : 'Kodu Onayla ve Giriş Yap'}
          </button>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-mystic-text-muted hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> E-postayı Değiştir
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading || countdown > 0}
              className="text-mystic-accent hover:text-white transition-colors flex items-center gap-1 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              {countdown > 0 ? `Tekrar Gönder (${countdown}s)` : 'Tekrar Kod Gönder'}
            </button>
          </div>
        </form>
      )}

      {step === 'form' && (
        <p className="mt-8 text-center text-mystic-text-muted text-sm">
          Zaten hesabınız var mı?{' '}
          <Link href="/auth/login" className="text-mystic-accent hover:text-white font-medium transition-colors">
            Giriş Yapın
          </Link>
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative pt-20">
      <Suspense fallback={<div className="text-white text-sm">Yükleniyor...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
