"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Geçersiz veya eksik sıfırlama bağlantısı. Lütfen e-postadaki bağlantıyı kullanın.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess("Şifreniz başarıyla güncellendi! Giriş ekranına yönlendiriliyorsunuz...");
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err?.message || "Şifre güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative pt-20">
      <div className="max-w-md w-full bg-mystic-surface/80 backdrop-blur-xl p-8 rounded-3xl border border-mystic-primary/30 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-mystic-dark rounded-full border border-mystic-surface-light">
              <Sparkles className="text-mystic-accent" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-mystic-text mb-2">Yeni Şifre Belirleyin</h1>
          <p className="text-mystic-text-muted">Lütfen hesabınız için yeni bir şifre girin.</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="text-green-500 shrink-0" size={20} />
            <p className="text-sm text-green-200 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handlePasswordReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-mystic-text-muted mb-1">Yeni Şifre</label>
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

            <div>
              <label className="block text-sm font-medium text-mystic-text-muted mb-1">Yeni Şifre (Tekrar)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-mystic-text-muted" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-mystic-primary" size={40} />
          <p className="text-mystic-text-muted">Yükleniyor...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
