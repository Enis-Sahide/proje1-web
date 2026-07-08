"use client";

import React from 'react';
import { 
  Smartphone, 
  Users, 
  CheckCircle, 
  Download, 
  Play, 
  Sparkles, 
  Info,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Heart
} from 'lucide-react';

export default function TestPage() {
  const googleGroupUrl = "https://groups.google.com/g/7layers-test-ekibi";
  const playStoreTestingUrl = "https://play.google.com/apps/testing/com.enissahide.esk7layers";
  const playStoreAppUrl = "https://play.google.com/store/apps/details?id=com.enissahide.esk7layers";
  const apkDownloadUrl = "/esk7layers.apk";

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 relative flex flex-col items-center bg-transparent selection:bg-[#D4AF37] selection:text-black">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />

      <div className="max-w-3xl w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-center mb-4">
            <div className="p-3.5 bg-mystic-surface/80 rounded-full border border-mystic-primary/30 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <Smartphone className="text-mystic-primary animate-pulse" size={40} />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-100 to-mystic-primary mb-3 tracking-wider uppercase">
            7LAYERS Test Ekibi
          </h1>
          <p className="text-mystic-text-muted text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Uygulamamızın Play Store'da resmi olarak yayına girebilmesi için test sürecini başarıyla tamamlamamız gerekiyor. Desteğiniz bizim için hayati önem taşımaktadır.
          </p>
        </div>

        {/* 14 Days Notice Box */}
        <div className="bg-gradient-to-r from-mystic-primary/10 to-mystic-accent/5 border border-mystic-primary/35 rounded-3xl p-6 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-mystic-primary pointer-events-none">
            <Heart size={140} />
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-mystic-primary/20 text-mystic-primary rounded-2xl border border-mystic-primary/30 shrink-0">
              <Heart className="fill-mystic-primary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1.5">Önemli Google Play Kuralı</h3>
              <p className="text-xs md:text-sm text-mystic-text-muted leading-relaxed">
                Google, uygulamayı mağazaya alabilmek için **en az 20 test kullanıcısının uygulamayı 14 gün boyunca kesintisiz olarak telefonunda yüklü tutmasını** şart koşmaktadır. Lütfen uygulamayı bu süre boyunca silmeyiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Steps Card (Method 1 - Primary) */}
        <div className="bg-mystic-surface/80 backdrop-blur-xl border border-mystic-primary/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles size={120} className="text-mystic-primary" />
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-mystic-surface-light">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-mystic-primary" size={26} />
              Asıl Kurulum Yöntemi (Zorunlu)
            </h2>
            <span className="px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-mystic-primary text-black rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)] animate-pulse">
              Play Store Onayı İçin Gerekli
            </span>
          </div>

          <div className="space-y-10 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-mystic-surface-light">
            
            {/* Step 1 */}
            <div className="flex gap-4 relative">
              <div className="w-9 h-9 rounded-full bg-mystic-primary text-black flex items-center justify-center font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.4)] z-10">
                1
              </div>
              <div className="flex-grow pt-1">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Users size={18} className="text-mystic-accent" />
                  Google Grubuna Katılın
                </h3>
                <p className="text-mystic-text-muted text-xs md:text-sm mb-4 leading-relaxed">
                  Google Play test yetkilendirmesi için öncelikle e-posta grubumuza üye olmanız gerekmektedir. Grubumuza katıldığınız e-posta adresiyle Play Store hesabınızın aynı olması şarttır.
                </p>
                <a 
                  href={googleGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-mystic-primary/10 hover:bg-mystic-primary/20 text-mystic-primary font-medium text-xs md:text-sm rounded-xl border border-mystic-primary/30 transition-all duration-300 group shadow-md"
                >
                  Test Grubuna Katıl
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 relative">
              <div className="w-9 h-9 rounded-full bg-mystic-primary text-black flex items-center justify-center font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.4)] z-10">
                2
              </div>
              <div className="flex-grow pt-1">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <CheckCircle size={18} className="text-mystic-accent" />
                  Test Programına Katılın (Onay Verin)
                </h3>
                <p className="text-mystic-text-muted text-xs md:text-sm mb-4 leading-relaxed">
                  Gruba katıldıktan sonra, aşağıdaki bağlantıyı kullanarak Google Play Store üzerinden "Test Kullanıcısı" olmayı onaylayın.
                </p>
                <a 
                  href={playStoreTestingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-mystic-primary/10 hover:bg-mystic-primary/20 text-mystic-primary font-medium text-xs md:text-sm rounded-xl border border-mystic-primary/30 transition-all duration-300 group shadow-md"
                >
                  Testi Kabul Et (Opt-in)
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 relative">
              <div className="w-9 h-9 rounded-full bg-mystic-primary text-black flex items-center justify-center font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.4)] z-10">
                3
              </div>
              <div className="flex-grow pt-1">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Play size={18} className="text-mystic-accent" />
                  Uygulamayı Play Store'dan İndirin
                </h3>
                <p className="text-mystic-text-muted text-xs md:text-sm mb-4 leading-relaxed">
                  Yukarıdaki iki adımı tamamladıktan sonra, uygulamayı normal bir şekilde doğrudan Google Play Store'dan indirebilirsiniz.
                </p>
                <a 
                  href={playStoreAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mystic-primary text-black font-semibold text-xs md:text-sm rounded-xl hover:bg-mystic-accent transition-all duration-300 group shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
                >
                  Google Play'den İndir
                  <Download size={16} />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Alternative Card (Method 2 - Backup) */}
        <div className="bg-mystic-surface/50 backdrop-blur-md border border-mystic-surface-light rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-300 hover:border-red-500/10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-mystic-surface-light">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Download className="text-mystic-accent" size={22} />
              Yedek Yöntem: Doğrudan APK İndir
            </h2>
            <span className="px-2 py-0.5 text-[9px] font-semibold bg-white/5 border border-white/10 text-mystic-text-muted rounded-full">
              Sadece Alternatif
            </span>
          </div>
          
          <p className="text-mystic-text-muted text-xs md:text-sm mb-6 leading-relaxed">
            Google Play adımlarında veya giriş yaparken teknik bir sorun yaşarsanız, uygulamayı doğrudan APK olarak indirip inceleyebilirsiniz.
          </p>

          <div className="bg-black/35 border border-red-500/15 rounded-2xl p-4 mb-6">
            <div className="flex gap-2.5 items-start text-red-400 mb-2">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span className="text-xs font-bold uppercase tracking-wider">Önemli Not</span>
            </div>
            <p className="text-[11px] md:text-xs text-mystic-text-muted leading-relaxed">
              Bu yöntem ile yapılan kurulumlar Google Play'in **20 kişilik resmi test kotasına dahil edilmez**. Lütfen mecbur kalmadıkça birinci yöntemi (Play Store) kullanın.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-center sm:text-left">
              <p className="text-xs text-white font-medium">Universal Android APK</p>
              <p className="text-[10px] text-mystic-text-muted">Boyut: ~92.6 MB</p>
            </div>
            <a 
              href={apkDownloadUrl}
              download="esk7layers-universal.apk"
              className="w-full sm:w-auto text-center inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-mystic-surface hover:bg-mystic-surface-light text-white font-semibold text-xs md:text-sm rounded-xl border border-white/10 transition-all duration-300"
            >
              Yine de APK İndir
              <Download size={16} />
            </a>
          </div>
        </div>

        {/* Support Alert */}
        <div className="mt-10 bg-mystic-surface/40 backdrop-blur-md border border-mystic-surface-light rounded-2xl p-5 flex items-center gap-4">
          <Info className="text-mystic-accent shrink-0" size={24} />
          <p className="text-xs text-white/70 leading-relaxed">
            Kurulum veya üyelik adımlarında herhangi bir sorunla karşılaşırsanız lütfen WhatsApp grubumuz üzerinden bizimle iletişime geçin. Katkılarınız için şimdiden çok teşekkür ederiz!
          </p>
        </div>

      </div>
    </div>
  );
}
