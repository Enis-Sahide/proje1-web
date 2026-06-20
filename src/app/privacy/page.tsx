"use client";

import React from 'react';
import { Shield, Lock, Eye, Trash2, Globe, Sparkles } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-16 relative flex flex-col items-center bg-transparent selection:bg-[#D4AF37] selection:text-black">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-mystic-surface/80 rounded-full border border-mystic-primary/30 shadow-[0_0_25px_rgba(212,175,55,0.15)]">
              <Shield className="text-mystic-primary" size={36} />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-100 to-mystic-primary mb-3 tracking-wider uppercase">
            Gizlilik Politikası
          </h1>
          <p className="text-mystic-text-muted text-sm italic">
            Son Güncelleme: 20 Haziran 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-mystic-surface/80 backdrop-blur-xl border border-mystic-surface-light rounded-3xl p-8 md:p-10 shadow-2xl space-y-8 text-mystic-text leading-relaxed">
          
          <p className="text-white/80 text-center text-lg font-medium border-b border-white/5 pb-6">
            7Layers olarak, kişisel bilgilerinizin ve kozmik analiz verilerinizin gizliliğine ve güvenliğine en üst düzeyde önem veriyoruz. Bu politika, verilerinizin nasıl toplandığını, korunduğunu ve kullanıldığını açıklamaktadır.
          </p>

          {/* Section 1 */}
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-mystic-primary/10 text-mystic-primary rounded-xl border border-mystic-primary/20 shrink-0">
              <Lock size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">1. Toplanan Veriler ve Şifre Güvenliği</h2>
              <p className="text-white/70 text-sm">
                Hesabınızı oluştururken ve doğrularken yalnızca adınız, soyadınız ve e-posta adresiniz toplanır. Hesabınıza ait şifreler, endüstri standardı olan **Supabase Auth** altyapısında tek yönlü kriptografik algoritmalar ile şifrelenmiş (hashed) olarak saklanır. Sistem yöneticilerimiz de dahil olmak üzere hiç kimse şifrelerinizi düz metin olarak göremez veya erişemez.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-mystic-primary/10 text-mystic-primary rounded-xl border border-mystic-primary/20 shrink-0">
              <Eye size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">2. Verilerin Kullanım Amacı</h2>
              <p className="text-white/70 text-sm">
                Toplanan verileriniz, uygulama içerisindeki bireysel astroloji, numeroloji ve çakra analizlerinizin hesaplanması, nefes odası ve meditasyonlardaki rütbe/ilerleme geçmişinizin takibi ve satın aldığınız üyelik seviyelerinin senkronizasyonu amacıyla kullanılır. Analiz sonuçlarınız tamamen size özeldir.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-mystic-primary/10 text-mystic-primary rounded-xl border border-mystic-primary/20 shrink-0">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">3. Üçüncü Taraflarla Paylaşım</h2>
              <p className="text-white/70 text-sm">
                7Layers, kişisel verilerinizi asla üçüncü şahıslara satmaz, kiralamaz veya ticari amaçlarla paylaşmaz. Verileriniz yalnızca kendi bulut veritabanımız olan Supabase altyapısında SSL/TLS protokolleri ile şifrelenmiş güvenli tüneller üzerinden taşınır ve depolanır.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-mystic-primary/10 text-mystic-primary rounded-xl border border-mystic-primary/20 shrink-0">
              <Trash2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">4. Veri Silme ve Kullanıcı Hakları (Kişisel Verileri Silme Talebi)</h2>
              <p className="text-white/70 text-sm">
                Dilediğiniz zaman profil ayarlarınız üzerinden veya doğrudan destek ekibimizle iletişime geçerek hesabınızın, analiz geçmişinizin ve tüm ilişkili verilerinizin veritabanımızdan kalıcı olarak silinmesini talep edebilirsiniz. Talebiniz üzerine tüm kişisel bilgileriniz Supabase sistemlerimizden geri döndürülemeyecek şekilde silinir.
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-black/40 border border-mystic-primary/20 rounded-2xl p-5 flex items-center gap-4">
            <Sparkles className="text-mystic-accent shrink-0" size={24} />
            <p className="text-xs text-white/60 leading-normal">
              Bu gizlilik politikası, 7Layers uygulamasının Google Play Store kurallarına ve KVKK / GDPR standartlarına tam uyum sağlaması amacıyla hazırlanmıştır. Sorularınız için bizimle her zaman iletişime geçebilirsiniz.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
