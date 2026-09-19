"use client";

import React from 'react';
import { FileText, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-16 relative flex flex-col items-center bg-[#05050A] text-white selection:bg-[#D4AF37] selection:text-black">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11052C]/30 via-black to-black -z-50" />

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-mystic-surface/80 rounded-full border border-mystic-primary/30 shadow-[0_0_25px_rgba(212,175,55,0.15)]">
              <FileText className="text-mystic-primary" size={36} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-100 to-mystic-primary mb-3 tracking-wider uppercase">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="text-mystic-text-muted text-sm italic">
            Son Güncelleme: 8 Eylül 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-mystic-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl space-y-8 text-mystic-text leading-relaxed text-sm text-white/80">
          
          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">MADDE 1 – TARAFLAR</h2>
            <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-white/70">
              <p><strong>SATICI / SAĞLAYICI:</strong></p>
              <p>Ünvan: 7Layers Dijital Hizmetler & Bilişim (MySportsSchool)</p>
              <p>Web Sitesi: https://www.7layers.tr</p>
              <p>E-Posta: info@7layers.tr</p>
              <div className="pt-2 border-t border-white/10 mt-2">
                <p><strong>ALICI (MÜŞTERİ):</strong></p>
                <p>Web sitesi üzerinden dijital analiz raporu siparişi verirken e-posta adresi ve doğum bilgilerini beyan eden kişi.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">MADDE 2 – SÖZLEŞMENİN KONUSU</h2>
            <p>
              İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait <strong>https://www.7layers.tr</strong> internet sitesinden elektronik ortamda siparişini yaptığı, sitede nitelikleri ve satış fiyatı belirtilen <strong>dijital analiz raporu (Kabalistik Harita, Doğum Haritası, Human Design Analizi PDF)</strong> hizmetinin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">MADDE 3 – ÜRÜN VE HİZMET NİTELİĞİ</h2>
            <p>
              Satışa konu ürün; ALICI'nın sisteme girdiği doğum tarihi, doğum saati ve konum parametrelerine dayalı olarak algoritmik yazılım motorları tarafından otomatik oluşturulan, kişiye özel <strong>dijital veri ve PDF analiz raporudur</strong>. Fiziki kargo veya basılı materyal gönderimi bulunmamaktadır.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">MADDE 4 – TESLİMAT ŞEKLİ VE ZAMANI</h2>
            <p>
              Ödeme işleminin banka veya sanal POS (Treps vb.) üzerinden onaylanmasını müteakip, oluşturulan dijital PDF raporu sitede anında indirme butonuna açılır ve ALICI'nın belirttiği e-posta adresine tek kullanımlık güvenli indirme bağlantısı olarak iletilir. Hizmet anında elektronik ortamda ifa edilir.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">MADDE 5 – CAYMA HAKKI VE İADE KOŞULLARI</h2>
            <p>
              6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca; 
              <span className="text-[#D4AF37] font-semibold"> "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde tüketici cayma hakkını kullanamaz."</span>
            </p>
            <p className="mt-2">
              Kişiye özel hazırlanan algoritmik PDF raporları anında teslim edilen dijital içerik niteliğinde olduğundan, siparişin ve ödemenin onaylanması ile raporun üretilmesinin ardından cayma ve iade hakkı bulunmamaktadır. Sistemsel veya teknik bir aksaklık sebebiyle dosyanın teslim edilememesi durumunda destek ekibimiz dosyayı ALICI'ya manuel olarak temin eder.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">MADDE 6 – UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
            <p>
              İşbu sözleşmenin uygulanmasında, Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/50">
            <Link href="/" className="text-[#D4AF37] hover:underline">
              ← Ana Sayfaya Dön
            </Link>
            <span>7Layers Platform Sözleşmesi</span>
          </div>

        </div>
      </div>
    </div>
  );
}
