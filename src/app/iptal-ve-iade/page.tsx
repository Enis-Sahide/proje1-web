"use client";

import React from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function IptalVeIadePage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-16 relative flex flex-col items-center bg-[#05050A] text-white selection:bg-[#D4AF37] selection:text-black">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-mystic-surface/80 rounded-full border border-mystic-primary/30 shadow-[0_0_25px_rgba(212,175,55,0.15)]">
              <RotateCcw className="text-mystic-primary" size={36} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-100 to-mystic-primary mb-3 tracking-wider uppercase">
            İptal ve İade Koşulları
          </h1>
          <p className="text-mystic-text-muted text-sm italic">
            Son Güncelleme: 8 Eylül 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-mystic-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl space-y-8 text-sm text-white/80 leading-relaxed">
          
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-5 rounded-2xl flex items-start gap-4">
            <ShieldCheck className="text-[#D4AF37] shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-white mb-1">Dijital İçerik ve Anında İfa Bildirimi</h3>
              <p className="text-xs text-white/70">
                7Layers platformunda sunulan astroloji, numeroloji ve kabala raporları; kullanıcının doğum tarihi, saati ve koordinatlarına özel olarak anında yazılım motorları tarafından hesaplanan ve indirilebilir PDF formatında sunulan <strong>gayrimaddi dijital ürünlerdir</strong>.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">1. Cayma Hakkı Kapsamı Dışındaki Ürünler</h2>
            <p>
              Mesafeli Sözleşmeler Yönetmeliği'nin 15. Maddesi uyarınca, tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallar ile elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde <strong>cayma hakkı kullanılamaz</strong>.
            </p>
            <p className="mt-2">
              Ödeme tamamlandığı anda rapor üretim süreci otomatik olarak başlar, dosya oluşturulur ve e-posta adresinize tek kullanımlık indirme linki gönderilir. Bu nedenle onaylanan siparişlerde iptal veya iade yapılamamaktadır.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">2. Hatalı Bilgi Girişi Durumu</h2>
            <p>
              Sipariş esnasında doğum tarihi, doğum saati veya doğum yeri bilgilerinin kullanıcı tarafından hatalı girilmesi durumunda yazılım bu hatalı parametrelere göre hesaplama yapacaktır. Kullanıcı kaynaklı hatalı veri girişlerinden dolayı iade veya ücretsiz yeni rapor talebi karşılanamamaktadır. Lütfen ödeme yapmadan önce girdiğiniz bilgileri kontrol ediniz.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">3. Teknik Aksaklık ve Telafi Garantisi</h2>
            <p>
              Ödemesi tamamlanmış olmasına rağmen teknik bir arıza nedeniyle raporu indirilemeyen veya e-posta sunucu filtreleri nedeniyle indirme linkine ulaşamayan kullanıcılarımızın hakları korunmaktadır. 
            </p>
            <p className="mt-2">
              Böyle bir durumda <strong>destek@7layers.tr</strong> adresine sipariş numaranız ve e-posta adresinizle başvurduğunuz takdirde, raporunuz kontrol edilerek 24 saat içerisinde doğrudan e-posta adresinize PDF olarak manuel olarak iletilir veya teknik arıza giderilemiyorsa tahsil edilen ücret kesintisiz iade edilir.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/50">
            <Link href="/" className="text-[#D4AF37] hover:underline">
              ← Ana Sayfaya Dön
            </Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="text-white/70 hover:text-white underline">
              Mesafeli Satış Sözleşmesi
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
