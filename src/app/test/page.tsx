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
  AlertTriangle
} from 'lucide-react';

export default function TestPage() {
  const googleGroupUrl = "https://groups.google.com/g/esk7layers-testers";
  const playStoreTestingUrl = "https://play.google.com/apps/testing/com.enissahide.esk7layers";
  const playStoreAppUrl = "https://play.google.com/store/apps/details?id=com.enissahide.esk7layers";
  const apkDownloadUrl = "/esk7layers.apk";

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 relative flex flex-col items-center bg-transparent selection:bg-[#D4AF37] selection:text-black">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />

      <div className="max-w-4xl w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-center mb-4">
            <div className="p-3.5 bg-mystic-surface/80 rounded-full border border-mystic-primary/30 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <Smartphone className="text-mystic-primary" size={40} />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-100 to-mystic-primary mb-3 tracking-wider uppercase">
            7LAYERS Test Ekibi
          </h1>
          <p className="text-mystic-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Yeni Android sürümümüzü test ederek gelişimimize katkıda bulunun. Kapalı test grubumuza katılabilir veya doğrudan APK kurulumu gerçekleştirebilirsiniz.
          </p>
        </div>

        {/* Main Grid: Steps & Alternative */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps Column (Left & Center) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-mystic-surface/75 backdrop-blur-xl border border-mystic-surface-light rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-mystic-primary/20">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles size={120} className="text-mystic-primary" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="text-mystic-primary" size={24} />
                Yöntem 1: Google Play Kapalı Test Süreci
              </h2>

              <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-mystic-surface-light">
                
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
                      Google Play kuralları gereği, test kullanıcısı olabilmek için öncelikle e-posta grubumuza üye olmanız gerekmektedir. Grubumuza katıldığınız e-posta adresiyle Play Store hesabınızın aynı olması şarttır.
                    </p>
                    <a 
                      href={googleGroupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-mystic-primary/10 hover:bg-mystic-primary/20 text-mystic-primary font-medium text-xs md:text-sm rounded-xl border border-mystic-primary/30 transition-all duration-300 group shadow-md"
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
                      Test Programına Katılın
                    </h3>
                    <p className="text-mystic-text-muted text-xs md:text-sm mb-4 leading-relaxed">
                      Gruba katıldıktan sonra, aşağıdaki bağlantıyı kullanarak Google Play Store üzerinden "Test Kullanıcısı" onayını vermeniz gerekmektedir.
                    </p>
                    <a 
                      href={playStoreTestingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-mystic-primary/10 hover:bg-mystic-primary/20 text-mystic-primary font-medium text-xs md:text-sm rounded-xl border border-mystic-primary/30 transition-all duration-300 group shadow-md"
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
                      Yukarıdaki iki adımı tamamladıktan sonra, uygulamayı normal bir şekilde doğrudan Google Play Store'dan indirebilir veya güncelleyebilirsiniz.
                    </p>
                    <a 
                      href={playStoreAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-mystic-primary text-black font-semibold text-xs md:text-sm rounded-xl hover:bg-mystic-accent transition-all duration-300 group shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
                    >
                      Google Play'den İndir
                      <Download size={16} />
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Alternative Column (Right) */}
          <div className="space-y-6">
            <div className="bg-mystic-surface/75 backdrop-blur-xl border border-mystic-surface-light rounded-3xl p-6 md:p-8 shadow-2xl h-full flex flex-col justify-between transition-all duration-300 hover:border-mystic-primary/20">
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Download className="text-mystic-accent" size={24} />
                  Yöntem 2: Hızlı Kurulum (Doğrudan APK)
                </h2>
                
                <p className="text-mystic-text-muted text-xs md:text-sm mb-6 leading-relaxed">
                  Google Play Store, Google Grubu ve üyelik onayları gibi süreçlerle uğraşmak istemiyorsanız, doğrudan güncel Android APK dosyasını indirerek cihazınıza kurabilirsiniz.
                </p>

                <div className="bg-black/35 border border-yellow-500/10 rounded-2xl p-4 mb-6">
                  <div className="flex gap-2.5 items-start text-yellow-500/80 mb-2">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">APK Kurulum Notu</span>
                  </div>
                  <p className="text-[11px] text-mystic-text-muted leading-relaxed">
                    Telefonunuz bu dosyayı kurarken "Bilinmeyen Uygulama Kaynağı" veya "Play Protect engelledi" uyarıları verebilir. Güvenle <strong>"Yine de Yükle"</strong> seçeneğini tıklayarak kuruluma devam edebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-mystic-surface-light mt-auto">
                <a 
                  href={apkDownloadUrl}
                  download="esk7layers-universal.apk"
                  className="w-full text-center inline-flex justify-center items-center gap-2 px-5 py-3 bg-mystic-accent hover:bg-mystic-accent/80 text-black font-bold text-sm rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:scale-[1.02]"
                >
                  Doğrudan APK İndir
                  <Download size={18} />
                </a>
                <p className="text-center text-[10px] text-mystic-text-muted mt-2">
                  Boyut: ~92.6 MB (Universal Android APK)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Alert */}
        <div className="mt-12 bg-mystic-surface/40 backdrop-blur-md border border-mystic-surface-light rounded-2xl p-5 flex items-center gap-4">
          <Info className="text-mystic-accent shrink-0" size={24} />
          <p className="text-xs text-white/70 leading-relaxed">
            Kurulum sırasında herhangi bir hata veya sorunla karşılaşırsanız lütfen WhatsApp grubu üzerinden ekran görüntüsü alarak bizimle iletişime geçin. Desteğiniz için teşekkürler!
          </p>
        </div>

      </div>
    </div>
  );
}
