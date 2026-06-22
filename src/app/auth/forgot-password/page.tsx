"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Mail, Loader2, Sparkles, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResetLink(null);

    try {
      const res = await apiFetch<{ message?: string; resetToken?: string }>(
        '/api/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email }) },
      );
      setSuccess(
        res.message ||
          'Eğer bu e-posta kayıtlıysa, şifre sıfırlama talimatı gönderildi.',
      );
      // E-posta gönderimi henüz bağlı değil: geliştirmede doğrudan bağlantı göster.
      if (res.resetToken) {
        setResetLink(`/auth/reset-password?token=${encodeURIComponent(res.resetToken)}`);
      }
      setEmail('');
    } catch (err: any) {
      setError(err?.message || 'Sıfırlama isteği gönderilemedi.');
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
          <h1 className="text-3xl font-bold text-mystic-text mb-2">Şifremi Unuttum</h1>
          <p className="text-mystic-text-muted">Kayıtlı e-posta adresinizi girin, size şifre yenileme bağlantısı gönderelim.</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-green-200 font-medium leading-relaxed">{success}</p>
          </div>
        )}

        {resetLink && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/40 rounded-xl p-4">
            <p className="text-xs text-amber-200/90 mb-2">
              (Geliştirme) E-posta gönderimi henüz bağlı değil. Sıfırlama bağlantısı:
            </p>
            <Link href={resetLink} className="text-sm text-mystic-accent break-all underline">
              {resetLink}
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleResetRequest} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-mystic-primary to-purple-600 hover:from-purple-600 hover:to-mystic-primary text-white font-bold py-3.5 rounded-xl mt-6 transition-all flex justify-center items-center shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Bağlantı Gönder'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-mystic-primary hover:text-mystic-accent transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Giriş Ekranına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-mystic-primary" size={40} />
          <p className="text-mystic-text-muted">Yükleniyor...</p>
        </div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
