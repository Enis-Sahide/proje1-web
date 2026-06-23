"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HeartPulse, 
  ArrowLeft, 
  Leaf, 
  Activity, 
  Award, 
  ShieldCheck, 
  Droplet, 
  Coffee, 
  Sparkles, 
  Compass, 
  CheckCircle2 
} from 'lucide-react';

export default function ImeceHealthPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-6 relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back navigation & Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8">
          <Link 
            href="/explore" 
            className="flex items-center gap-2 text-sm text-mystic-text-muted hover:text-emerald-400 transition-colors duration-300 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Keşfet & Mağaza</span>
          </Link>
          <span className="text-mystic-text-muted/40">/</span>
          <span className="text-sm text-emerald-400 font-semibold">İmece Sağlık Teknolojisi</span>
        </div>

        {/* Hero Header */}
        <div className="text-center md:text-left mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest inline-block mb-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              Bütünsel Şifa & Teknoloji
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-mystic-text to-emerald-400 py-4 mb-6 drop-shadow-md leading-normal">
              İmece Sağlık Teknolojisi
            </h1>
            <p className="text-lg text-mystic-text-muted max-w-2xl leading-relaxed">
              19 Şubat 2015'te tamamlayıcı tıp alanında uzun yıllara dayanan deneyimle kurulan İmece Sistem, doğanın şifasını ve devrim niteliğindeki biyotıbbi teknolojileri bir araya getiren bir bütünsel sağlık platformudur.
            </p>
          </motion.div>
        </div>

        {/* Technology Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black/30 border border-emerald-500/10 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Activity size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Devrim Niteliğinde Çift Teknoloji Sinerjisi</h2>
            <p className="text-sm text-mystic-text-muted leading-relaxed">
              İmece gıda takviyeleri, sıradan tablet ve sert kapsüllerden farklı olarak <strong>Jel Süspansiyon Teknolojisi</strong> ile <strong>Negatif İyonlama Teknolojisi</strong>'ni dünyada eşsiz bir sinerjiyle bir arada kullanır. Jel süspansiyon sayesinde kimyasal bağlayıcı ve kaplamalar kullanılmazken, negatif iyonlama teknolojisi besin maddelerini hücresel potansiyele uygun şekilde negatif yükle yükler. Bu çift teknoloji birleşimi, emilimi ve <strong>biyoyararlanımı maksimum seviyeye ulaştırarak</strong> doğrudan hücre içine hızlı nüfuz sağlar.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black/30 border border-teal-500/10 rounded-3xl p-8 hover:border-teal-500/30 transition-all duration-300 shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
              <Leaf size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Doğal Koruyuculuk Felsefesi</h2>
            <p className="text-sm text-mystic-text-muted leading-relaxed">
              Gıda takviyelerinden kişisel bakım ürünlerine kadar tüm ürün gruplarında <strong>sentetik koruyucu kimyasallar kullanılmaz</strong>. Doğa dostu ve insan hücresine uyumlu patentli koruma sistemleri sayesinde, vücudunuza kimyasal yük bindirmeden hücresel düzeyde temiz ve doğal bir destek sağlanır.
            </p>
          </motion.div>
        </div>

        {/* Product Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-mystic-primary/20 pb-3 flex items-center gap-2">
            <Compass size={22} className="text-emerald-400" />
            <span>İmece Ürün Serileri & İçerikleri</span>
          </h2>

          <div className="space-y-6">
            
            {/* Category: SUP */}
            <div className="bg-black/20 border border-white/5 rounded-3xl p-6 md:p-8 hover:border-emerald-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-emerald-400 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10"><HeartPulse size={20} /></span>
                <h3 className="text-xl font-bold text-white">SUP Gıda Takviyeleri (Jel Serisi)</h3>
              </div>
              <p className="text-sm text-mystic-text-muted mb-6 leading-relaxed">
                Bitkilerin, şifalı mantarların ve deniz bileşenlerinin gücünü jel formunda sunan, hücre savunması ve yenilenmesini destekleyen patentli seri.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    Sup Detoks Mix Jel
                  </h4>
                  <p className="text-xs text-mystic-text-muted mt-1 leading-relaxed">Hücresel düzeyde temizliği, toksinlerin atılmasını ve karaciğer fonksiyonlarını destekleyen arındırıcı formül.</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    Sup Propolis Mix Jel
                  </h4>
                  <p className="text-xs text-mystic-text-muted mt-1 leading-relaxed">Güçlü doğal antioksidan propolis içeriği ile bağışıklık sistemini güçlendiren hücresel savunma kalkanı.</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    Sup Reishi & Spirulina Jelleri
                  </h4>
                  <p className="text-xs text-mystic-text-muted mt-1 leading-relaxed">Kırmızı Reishi mantarı ile stres/adaptasyon dengesi ve Spirulina ile zengin protein, mineral ve hücresel enerji takviyesi.</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    Sup Krill Mix Jel
                  </h4>
                  <p className="text-xs text-mystic-text-muted mt-1 leading-relaxed">Denizlerin en saf Omega-3 kaynağı olan krill yağı ile kalp, damar, beyin sağlığı ve bilişsel fonksiyonlar desteği.</p>
                </div>
              </div>
            </div>

            {/* Category: Hyranus */}
            <div className="bg-black/20 border border-white/5 rounded-3xl p-6 md:p-8 hover:border-emerald-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-emerald-400 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10"><Droplet size={20} /></span>
                <h3 className="text-xl font-bold text-white">Hyranus Kişisel Bakım</h3>
              </div>
              <p className="text-sm text-mystic-text-muted leading-relaxed">
                Tene ve saça uyumlu, kimyasal koruyucular içermeyen özel saç ve cilt bakım serisi. <strong>Hyranus Pro Şampuan</strong> ve sabun grubu gibi ürünler, cildin ve saç derisinin doğal mikrobiyom dengesini bozmadan korur, besler ve canlandırır.
              </p>
            </div>

            {/* Category: Coffee's Şah */}
            <div className="bg-black/20 border border-white/5 rounded-3xl p-6 md:p-8 hover:border-emerald-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-emerald-400 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10"><Coffee size={20} /></span>
                <h3 className="text-xl font-bold text-white">Coffee's Şah & Şifalı Gıdalar</h3>
              </div>
              <p className="text-sm text-mystic-text-muted mb-4 leading-relaxed">
                Kahve keyfini şifayla buluşturan özel bir konsept. Kırmızı Reishi (Ganoderma Lucidum) özleri ile zenginleştirilmiş kahve serisi, gün boyu zindelik verirken bağışıklık sistemini desteklemeye yardımcı olur.
              </p>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  Sup Alkali pH Damlası
                </h4>
                <p className="text-xs text-mystic-text-muted mt-1 leading-relaxed">İçme suyunun pH derecesini yükselterek vücudun asit-baz dengesini düzenlemeye yardımcı olan, alkali beslenmeyi destekleyen pratik gıda desteği.</p>
              </div>
            </div>

            {/* Category: Manyetik Denge */}
            <div className="bg-black/20 border border-white/5 rounded-3xl p-6 md:p-8 hover:border-emerald-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-emerald-400 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10"><Sparkles size={20} /></span>
                <h3 className="text-xl font-bold text-white">Manyetik Biyoenerji Denge Serisi</h3>
              </div>
              <p className="text-sm text-mystic-text-muted leading-relaxed">
                Çevremizdeki elektromanyetik kirliliğin vücudumuzun biyoenerji alanları üzerindeki olumsuz etkilerini dengelemek üzere tasarlanmış manyetik takı ve aksesuarlar. Beden frekansını optimize etmeye ve enerji akışını düzenlemeye yardımcı olur.
              </p>
            </div>

          </div>
        </section>

        {/* Quality and Certifications */}
        <section className="mb-16 bg-gradient-to-br from-emerald-950/20 to-black/40 border border-emerald-500/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Kalite Güvencesi & Sertifikalar</h2>
          </div>
          <p className="text-sm text-mystic-text-muted leading-relaxed mb-6">
            İmece Sistem, tamamlayıcı tıp standartlarına uygun, hijyenik ve modern tesislerde üretim yapmaktadır. Üretim süreçleri uluslararası standartlara (ISO 9001, ISO 22000 gıda güvenliği yönetim sistemleri ve GMP - İyi Üretim Uygulamaları) uygun olarak sertifikalandırılmıştır ve her ürün lotu sıkı kalite analizlerinden geçirilir.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-emerald-400">
            <span className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full flex items-center gap-1.5"><ShieldCheck size={12} /> GMP Uyumlu</span>
            <span className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full flex items-center gap-1.5"><ShieldCheck size={12} /> ISO 22000</span>
            <span className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full flex items-center gap-1.5"><ShieldCheck size={12} /> Helal Sertifikalı</span>
            <span className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full flex items-center gap-1.5"><ShieldCheck size={12} /> Patentli Formülasyonlar</span>
          </div>
        </section>

        {/* Registration CTA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-emerald-950/60 via-teal-950/30 to-black/60 border border-emerald-500/20 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Decorative glows */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <HeartPulse size={32} className="animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
              İmece ile Sağlığınızı Desteklemeye Başlayın
            </h2>
            <p className="text-sm text-mystic-text-muted mb-8 leading-relaxed">
              Tercihli müşteri olarak İmece dünyasına adım atın, patentli gıda takviyelerine ve şifa ürünlerine avantajlı fiyatlarla güvenle ulaşın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://imecesistem.com.tr/davet/TM/BT90000000114"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer"
              >
                Tercihli Müşteri Ol & Alışverişe Başla
              </a>
              <Link
                href="/explore"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-mystic-text-muted hover:text-white border border-white/5 hover:border-white/10 font-bold transition-all duration-300"
              >
                Mağazaya Dön
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
