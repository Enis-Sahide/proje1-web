"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Check, Loader2, Award, Lock } from 'lucide-react';

const ROLE_LABELS: Record<string, { label: string; style: string }> = {
  free: { label: 'Ücretsiz Üyelik', style: 'border-white/10 text-mystic-text-muted bg-white/5' },
  apprentice: { label: 'Çıraklık (Seviye 1)', style: 'border-amber-700/50 text-amber-500 bg-amber-500/10 shadow-[0_0_8px_rgba(180,83,9,0.1)]' },
  journeyman: { label: 'Kalfalık (Seviye 2)', style: 'border-blue-500/50 text-blue-400 bg-blue-400/10 shadow-[0_0_8px_rgba(59,130,246,0.1)]' },
  master: { label: 'Ustalık (Seviye 3)', style: 'border-mystic-primary/50 text-mystic-primary bg-mystic-primary/10 shadow-[0_0_8px_rgba(212,175,55,0.15)]' },
  admin: { label: 'Yönetici (Admin)', style: 'border-red-500/50 text-red-400 bg-red-400/10 shadow-[0_0_8px_rgba(239,68,68,0.15)]' }
};

export default function ProfilePage() {
  const { user, role, session } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [showPwdSection, setShowPwdSection] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '');
    }
  }, [user]);

  if (!user) {
    return null; // RouteGuard will handle redirect to login
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
    }

    console.log("Saving started...", { id: user.id, name, email: user.email });
    try {
      // 1. Update Auth user metadata (Updates the Next.js session cache instantly)
      console.log("1. Calling supabase.auth.updateUser...");
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (authError) {
        console.error("Auth update error:", authError);
        throw authError;
      }
      console.log("Auth update successful.");

      // 2. Upsert profiles table (inserts if missing, updates if exists)
      console.log("2. Calling supabase.from('profiles').upsert...");
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          full_name: name,
          role: role || 'free'
        });

      if (profileError) {
        console.error("Profile upsert error:", profileError);
        throw profileError;
      }
      console.log("Profile upsert successful.");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Catch block triggered:", err);
      setError(err.message || 'Profil güncellenirken hata oluştu.');
    } finally {
      console.log("finally block: Setting loading to false.");
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPwdError("Şifreler uyuşmuyor.");
      return;
    }
    if (password.length < 6) {
      setPwdError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setPwdLoading(true);
    setPwdError(null);
    setPwdSuccess(false);

    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setPwdSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: any) {
      setPwdError(err.message || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setPwdLoading(false);
    }
  };

  const roleMeta = ROLE_LABELS[role] || ROLE_LABELS.free;
  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-transparent flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-mystic-surface/60 backdrop-blur-md border border-mystic-primary/20 rounded-3xl p-8 shadow-[0_0_30px_rgba(212,175,55,0.05)] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-mystic-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-mystic-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back Button */}
        <button 
          onClick={() => router.push(isAdmin ? '/admin/dashboard' : '/')}
          className="absolute top-6 left-6 text-mystic-text-muted hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-mystic-dark border border-mystic-primary/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative">
            <User className="text-mystic-primary" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profil Ayarları</h1>
          <p className="text-xs text-mystic-text-muted mt-1">Kişisel bilgilerinizi güncelleyin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/35 rounded-xl text-center">
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/35 rounded-xl text-center flex items-center justify-center gap-2">
            <Check className="text-green-400" size={16} />
            <p className="text-xs text-green-200">Profiliniz başarıyla güncellendi!</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-mystic-text-muted mb-2 uppercase tracking-wider">Ad Soyad</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mystic-text-muted">
                <User size={16} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-mystic-dark/80 border border-mystic-surface-light rounded-xl text-mystic-text focus:border-mystic-primary focus:ring-1 focus:ring-mystic-primary transition-all outline-none text-sm"
                placeholder="Adınız Soyadınız"
              />
            </div>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-semibold text-mystic-text-muted mb-2 uppercase tracking-wider">E-posta</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mystic-text-muted opacity-50">
                <Mail size={16} />
              </div>
              <input
                type="email"
                disabled
                value={user.email || ''}
                className="w-full pl-10 pr-3 py-3 bg-mystic-dark/40 border border-mystic-surface-light/40 rounded-xl text-mystic-text-muted/70 cursor-not-allowed outline-none text-sm"
              />
            </div>
            <p className="text-[10px] text-mystic-text-muted/65 mt-1.5 ml-1">E-posta adresiniz güvenlik sebebiyle değiştirilemez.</p>
          </div>

          {/* VIP Level Info */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="text-mystic-primary shrink-0" size={20} />
              <div>
                <span className="text-xs text-mystic-text-muted block font-medium">VIP Seviyeniz</span>
                <span className="text-[10px] text-mystic-text-muted/70">Kazanılan İnisiyasyon Seviyesi</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${roleMeta.style}`}>
              {roleMeta.label}
            </span>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-mystic-primary to-mystic-accent hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] text-black font-bold py-3.5 rounded-xl mt-6 transition-all flex justify-center items-center cursor-pointer text-sm shadow-md"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Değişiklikleri Kaydet'}
          </button>
        </form>

        <hr className="my-6 border-white/10" />

        {/* Change Password Collapsible Section */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowPwdSection(!showPwdSection)}
            className="w-full text-left text-xs font-semibold text-mystic-primary hover:text-white transition-colors uppercase tracking-wider flex items-center justify-between cursor-pointer"
          >
            <span>Şifre Değiştir</span>
            <span className="text-[10px]">{showPwdSection ? '▲' : '▼'}</span>
          </button>

          {showPwdSection && (
            <form onSubmit={handleUpdatePassword} className="space-y-5 mt-4">
              {pwdError && (
                <div className="p-3 bg-red-500/10 border border-red-500/35 rounded-xl text-center">
                  <p className="text-[11px] text-red-200">{pwdError}</p>
                </div>
              )}

              {pwdSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/35 rounded-xl text-center flex items-center justify-center gap-2">
                  <Check className="text-green-400" size={14} />
                  <p className="text-[11px] text-green-200">Şifreniz başarıyla güncellendi!</p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-mystic-text-muted mb-2 uppercase tracking-wider">Yeni Şifre</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mystic-text-muted">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-mystic-dark/80 border border-mystic-surface-light rounded-xl text-mystic-text focus:border-mystic-primary focus:ring-1 focus:ring-mystic-primary transition-all outline-none text-sm"
                    placeholder="Yeni Şifreniz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-mystic-text-muted mb-2 uppercase tracking-wider">Şifre Tekrar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mystic-text-muted">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-mystic-dark/80 border border-mystic-surface-light rounded-xl text-mystic-text focus:border-mystic-primary focus:ring-1 focus:ring-mystic-primary transition-all outline-none text-sm"
                    placeholder="Yeni Şifreniz (Tekrar)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 hover:bg-[#D4AF37]/30 text-[#D4AF37] hover:text-white font-bold py-3 rounded-xl mt-4 transition-all flex justify-center items-center cursor-pointer text-xs"
              >
                {pwdLoading ? <Loader2 className="animate-spin mr-2" size={14} /> : 'Şifreyi Güncelle'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
