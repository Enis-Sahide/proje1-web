"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Lock, Sparkles, X, Sun, Moon, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function YogaPage() {
  const router = useRouter();
  const { role, hasAccess } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<'cirak' | 'kalfa' | 'ustat'>('cirak');
  const [showLockModal, setShowLockModal] = useState(false);
  const [requiredRoleName, setRequiredRoleName] = useState('');

  const isKalfaUnlocked = hasAccess('yoga_2') || isAdmin;
  const isUstatUnlocked = hasAccess('yoga_master') || hasAccess('yoga_3') || isAdmin;

  const handleTabPress = (tab: 'cirak' | 'kalfa' | 'ustat') => {
    if (tab === 'kalfa' && !isKalfaUnlocked) {
      setRequiredRoleName('Kalfalık');
      setShowLockModal(true);
      return;
    }
    if (tab === 'ustat' && !isUstatUnlocked) {
      setRequiredRoleName('Üstatlık');
      setShowLockModal(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center select-none bg-transparent">
      {/* Mystical deep background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a082c] via-[#0b0314] to-[#000000] -z-50" />

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.push('/kadim-dersler')} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-200 to-mystic-primary tracking-wide">
              Yoga Asanaları ve Nadiler
            </h1>
            <p className="text-mystic-text-muted mt-1 text-sm md:text-base italic">Bedenin, Zihnin ve Ruhun Ezoterik Birleşimi</p>
          </div>
        </div>

        {/* Tab Menüsü */}
        <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 mb-8">
          <button 
            onClick={() => handleTabPress('cirak')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all ${
              activeTab === 'cirak' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            }`}
          >
            I. Çırak
          </button>
          
          <button 
            onClick={() => handleTabPress('kalfa')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'kalfa' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            } ${!isKalfaUnlocked && 'opacity-60'}`}
          >
            {!isKalfaUnlocked && <Lock size={14} className="text-mystic-primary" />}
            II. Kalfa
          </button>

          <button 
            onClick={() => handleTabPress('ustat')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ustat' 
                ? 'bg-mystic-primary text-black shadow-md' 
                : 'text-mystic-text-muted hover:text-white'
            } ${!isUstatUnlocked && 'opacity-60'}`}
          >
            {!isUstatUnlocked && <Lock size={14} className="text-mystic-primary" />}
            III. Üstat
          </button>
        </div>

        {/* I. ÇIRAK SEKME İÇERİĞİ */}
        {activeTab === 'cirak' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
              <Sparkles className="text-mystic-primary mb-4" size={40} />
              <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Köklenme ve Felsefe</h2>
              <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                <strong className="text-mystic-primary">Yoga</strong> kelimesi, Sanskritçe <strong className="text-mystic-primary">&quot;Yuj&quot;</strong> kökünden gelir ve <strong className="text-mystic-primary">&quot;Bütünleşmek/Birleşmek&quot;</strong> anlamına gelir. Bireysel ruhun evrensel ruhla birleştiği, egonun eridiği yerdir.
              </p>
            </div>

            <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-mystic-primary/20 shadow-xl">
              <img 
                src="https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/yoga/neophyte_lotus.png" 
                alt="Lotus Duruşu"
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">1. Ashtanga: 8 Basamaklı Yol</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Bilge <strong className="text-mystic-primary">Patanjali</strong>&apos;nin kurduğu sisteme <strong className="text-mystic-primary">Ashtanga (8 Uzuv)</strong> denir. Bu basamaklar şunlardır:
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-sm font-semibold text-mystic-text-muted grid grid-cols-2 gap-2">
                <div>1. Yama (Ahlaki Disiplinler)</div>
                <div>2. Niyama (Kişisel Gözlemler)</div>
                <div>3. Asana (Fiziksel Duruşlar)</div>
                <div>4. Pranayama (Nefes Kontrolü)</div>
                <div>5. Pratyahara (Duyuları Geri Çekme)</div>
                <div>6. Dharana (Odaklanma)</div>
                <div>7. Dhyana (Meditasyon)</div>
                <div>8. Samadhi (Mutlak Birleşme)</div>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">2. Asana: Rahat ve Sabit Duruş</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Patanjali&apos;ye göre <strong className="text-mystic-primary">Asana&apos;nın tam anlamı &quot;Rahat ve Sabit Oturuş/Duruş&quot;</strong> demektir (Sthiram sukham asanam). Temel asanalarımız:
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-3">
                <p>• <strong className="text-mystic-primary">Tadasana (Dağ Pozu):</strong> Köklenmenin ve ayakta duruşun en temel asanasıdır. Tüm ayakta pozların anasıdır.</p>
                <p>• <strong className="text-mystic-primary">Balasana (Çocuk Pozu):</strong> Dinlenme, içe dönme ve ego teslimiyeti pozudur. Sistem burada sakinleşir.</p>
                <p>• <strong className="text-mystic-primary">Vriksasana (Ağaç Pozu):</strong> Tek ayak üzerinde denge pozudur. Zihni sabitlemek için bakışları <strong className="text-mystic-primary">Drishti&apos;ye (Odak Noktası)</strong> kilitleriz.</p>
                <p>• <strong className="text-mystic-primary">Savasana (Ceset Pozu):</strong> Dersin <strong className="text-mystic-primary">en sonunda uygulanan</strong> yatarak dinlenme pozudur. Amacı tüm pratiğin hücresel entegrasyonudur.</p>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">3. Pranayama: Yaşam Enerjisi</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                <strong className="text-mystic-primary">Pranayama, yaşam enerjisini (Nefesi) kontrol etmektir.</strong>
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted">
                • <strong className="text-mystic-primary">Ujjayi Nefesi:</strong> Glottis kaslarının hafif sıkılmasıyla yaratılan <strong className="text-mystic-primary">&quot;Okyanus dalgası sesi&quot;</strong> çıkaran nefestir. Bedeni içten ısıtır.
              </div>
            </div>
          </div>
        )}

        {/* II. KALFA SEKME İÇERİĞİ */}
        {activeTab === 'kalfa' && isKalfaUnlocked && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
              <Sparkles className="text-mystic-primary mb-4" size={40} />
              <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Enerji Akışları ve Kilitler</h2>
              <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                Hatha Yoga kelimesindeki <strong className="text-mystic-primary">&quot;Ha&quot; Güneşi, &quot;Tha&quot; Ayı</strong> temsil eder. Kalfa, nefes ile hareketi (<strong className="text-mystic-primary">Vinyasa</strong>) mükemmel senkronize eden kişidir.
              </p>
            </div>

            <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden border border-mystic-primary/20 shadow-xl bg-black/30 p-6 flex items-center justify-center">
              <img 
                src="https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/yoga/surya_namaskar.png" 
                alt="Güneşe Selam"
                className="max-h-[300px] object-contain"
              />
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">1. Surya Namaskar & Akış Dinamikleri</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                <strong className="text-mystic-primary">Surya Namaskar (Güneşe Selam):</strong> Tam <strong className="text-mystic-primary">12 asanadan</strong> oluşan ardışık kozmik bir döngüdür. Kurucusu <strong className="text-mystic-primary">K. Pattabhi Jois</strong> olan Hatha Vinyasa sisteminin belkemiğidir.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-3">
                <p>• <strong className="text-mystic-primary">Adho Mukha Svanasana (Aşağı Bakan Köpek):</strong> Göğüs kafesi yere eridiği için en çok <strong className="text-mystic-primary">Kalp Çakrasını</strong> uyarır.</p>
                <p>• <strong className="text-mystic-primary">Chaturanga Dandasana:</strong> Şınavın alt pozisyonudur. <strong className="text-mystic-primary">Omuzlar dirsek hizasında, kollar kaburgalara yapışık</strong> olmalıdır.</p>
                <p>• <strong className="text-mystic-primary">Kobra vs Yukarı Bakan Köpek:</strong> <strong className="text-mystic-primary">Kobra (Bhujangasana)&apos;da kalça ve uyluklar YERDEDİR.</strong> Yukarı Bakan Köpekte ise dizler ve kalça HAVADADIR.</p>
                <p>• <strong className="text-mystic-primary">Virabhadrasana (Savaşçı Pozları):</strong> Hindu efsanesine göre Shiva&apos;nın öfkesiyle saç telinden yarattığı savaşçıdır. Egoyla olan savaşı temsil eder.</p>
                <p>• <strong className="text-mystic-primary">Kapotasana (Güvercin Pozu):</strong> Derin bir <strong className="text-mystic-primary">Kalça Açıcıdır</strong>. Yogaya göre <strong className="text-mystic-primary">Psoas (Kalça) kası &quot;Duygu Çöplüğüdür&quot;</strong> ve travmalar en çok burada depolanır.</p>
              </div>
            </div>

            <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden border border-mystic-primary/20 shadow-xl bg-black/30 p-6 flex items-center justify-center">
              <img 
                src="https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/yoga/nadis_anatomy.png" 
                alt="Nadi Anatomisi"
                className="max-h-[300px] object-contain"
              />
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">2. Enerji Anatomisi (Nadi ve Vayu)</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Fiziksel bedenin ötesinde, prana enerjisi 72.000 <strong className="text-mystic-primary">Nadi (Kanal)</strong> içinde akar. Hatha Pradipika&apos;ya göre hastalıkların sebebi <strong className="text-mystic-primary">bu nadilerdeki tıkanıklıklardır.</strong>
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-3">
                <p>• <strong className="text-mystic-primary">Ida Nadi:</strong> Sol burun deliği ile bağlantılı, Ay (Dişil/Serinletici) kanalıdır.</p>
                <p>• <strong className="text-mystic-primary">Pingala Nadi:</strong> Sağ burun deliği ile bağlantılı, Güneş (Eril/Isıtıcı) kanalıdır.</p>
                <p>• <strong className="text-mystic-primary">Sushumna Nadi:</strong> Omurganın tam ortasından geçen <strong className="text-mystic-primary">ana enerji kanalıdır.</strong></p>
                <p>• <strong className="text-mystic-primary">Nadi Shodhana Nefesi:</strong> Dönüşümlü burun nefesidir. <strong className="text-mystic-primary">Sağ ve sol beyni (Güneş-Ay enerjilerini) dengeler.</strong></p>
                <p>• <strong className="text-mystic-primary">Apana Vayu:</strong> Bedendeki 5 rüzgardan biridir, <strong className="text-mystic-primary">Aşağı doğru akan boşaltım ve topraklanma</strong> enerjisidir.</p>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">3. Bandhalar (Enerji Kilitleri)</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">Enerjinin sızmasını önleyen fiziksel kilitlerdir.</p>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-2">
                <p>• <strong className="text-mystic-primary">Mula Bandha:</strong> Pelvik taban kaslarının sıkılmasıdır.</p>
                <p>• <strong className="text-mystic-primary">Uddiyana Bandha:</strong> Karın vakumudur. <strong className="text-mystic-primary">Sadece nefes tamamen VERİLDİKTEN SONRA uygulanır.</strong></p>
                <p>• <strong className="text-mystic-primary">Jalandhara Bandha:</strong> <strong className="text-mystic-primary">Çenenin göğse (sternum) kilitlenmesidir.</strong></p>
                <p>• <strong className="text-mystic-primary">Maha Bandha (Büyük Kilit):</strong> <strong className="text-mystic-primary">Üç kilidin aynı anda uygulanmasıdır.</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* III. ÜSTAT SEKME İÇERİĞİ */}
        {activeTab === 'ustat' && isUstatUnlocked && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
              <Sparkles className="text-mystic-primary mb-4" size={40} />
              <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Sırların Zirvesi ve Aydınlanma</h2>
              <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                Üstat; illüzyon perdesini kaldıran, <strong className="text-mystic-primary">Kundaliniyi</strong> uyandıran ve Samadhi&apos;ye ulaşan ruhani kâşiftir. Tantrik felsefede Güneş ve Ay (Pingala ve Ida) <strong className="text-mystic-primary">3. Gözde (Ajna) birleştiğinde dualite biter.</strong>
              </p>
            </div>

            <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden border border-mystic-primary/20 shadow-xl bg-black/30 p-6 flex items-center justify-center">
              <img 
                src="https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/yoga/master_kundalini.png" 
                alt="Kundalini Uyandırılışı"
                className="max-h-[300px] object-contain"
              />
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">1. Kundalini ve İleri Pratikler</h3>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-3">
                <p>• <strong className="text-mystic-primary">Kundalini:</strong> Kök çakrada <strong className="text-mystic-primary">Kuyruk Sokumu tabanında (3.5 kez kıvrılmış)</strong> uyuyan sembolik yılan ateşidir.</p>
                <p>• <strong className="text-mystic-primary">3 Granthi (Düğüm):</strong> Kundalini yükselirken <strong className="text-mystic-primary">Brahma, Vishnu ve Rudra düğümlerini (Granthi)</strong> delmek zorundadır.</p>
                <p>• <strong className="text-mystic-primary">Kriya Yoga:</strong> Yogananda&apos;ya göre <strong className="text-mystic-primary">prana enerjisini doğrudan omurga etrafında dolaştırarak</strong> evrimi hızlandıran sistemdir.</p>
                <p>• <strong className="text-mystic-primary">Sirsasana (Baş Duruşu):</strong> Taç çakradan damlayan <strong className="text-mystic-primary">Amrita (Nektar)</strong> ateş çakrasında yanıp bitmesin diye süreci tersine çevirir. Bu yüzden Asanaların Kralıdır.</p>
                <p>• <strong className="text-mystic-primary">Padmasana (Lotus):</strong> Topukların basıncı sayesinde <strong className="text-mystic-primary">Apana (Aşağı akan) enerjisini yukarı iterek</strong> meditasyonu kilitler.</p>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">2. Mudralar, Mantralar ve Uyku</h3>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-3">
                <p>• <strong className="text-mystic-primary">Kechari Mudra:</strong> Sırların sırrıdır. <strong className="text-mystic-primary">Dilin genze kıvrılarak</strong> epifizden damlayan Soma nektarını yakalamasıdır.</p>
                <p>• <strong className="text-mystic-primary">Jnana Mudra:</strong> İşaret (Ego) ve Başparmak (Evren) birleşimidir.</p>
                <p>• <strong className="text-mystic-primary">Mantra Gücü:</strong> Anlama değil, <strong className="text-mystic-primary">ses titreşimlerinin (Naad) epifiz bezini ve çakraları yeniden kodlamasına</strong> dayanır.</p>
                <p>• <strong className="text-mystic-primary">Trataka:</strong> <strong className="text-mystic-primary">Ajna (3. Göz)</strong> çakrasını uyarmak için muma sabit bakıştır.</p>
                <p>• <strong className="text-mystic-primary">Yoga Nidra:</strong> Bilincin uyanık kaldığı <strong className="text-mystic-primary">&quot;Bilinçli Uyku&quot;</strong> şifa sistemidir.</p>
                <p>• <strong className="text-mystic-primary">Savasana Sırrı:</strong> Bedeni terk edip astral uyanıklığın provasını yapmaktır, <strong className="text-mystic-primary">&quot;Bilinçli Ölü Taklidi&quot;</strong> olarak bilinir.</p>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">3. Samadhi ve Felsefi Derinlik</h3>
              <div className="bg-black/30 p-4 rounded-xl text-sm text-mystic-text-muted leading-relaxed space-y-3">
                <p>• <strong className="text-mystic-primary">Pratyahara:</strong> <strong className="text-mystic-primary">Duyu organlarının</strong> dış dünyadan tamamen geri çekilmesidir.</p>
                <p>• <strong className="text-mystic-primary">Samyama:</strong> Son 3 uzvun (<strong className="text-mystic-primary">Dharana, Dhyana, Samadhi</strong>) kesintisiz birleşik akışıdır.</p>
                <p>• <strong className="text-mystic-primary">Kleshas (Izdıraplar):</strong> Patanjali&apos;ye göre acıların EN TEMEL nedeni <strong className="text-mystic-primary">Avidya (Cehâlet/Gerçeği görememe)</strong>&apos;dir.</p>
                <p>• <strong className="text-mystic-primary">Karma Yoga:</strong> <strong className="text-mystic-primary">Eylemin sonucundan beklenti duymadan</strong> hizmet etmektir.</p>
                <p>• <strong className="text-mystic-primary">Ahimsa:</strong> Düşüncede, sözde ve eylemde <strong className="text-mystic-primary">Şiddetsizliktir</strong>.</p>
                <p>• <strong className="text-mystic-primary">Samadhi:</strong> <strong className="text-mystic-primary">Gözlemleyen ile gözlemlenenin BİR olmasıdır</strong>. Son evresi <strong className="text-mystic-primary">Nirvikalpa Samadhi</strong>, egonun tohumsuz ve mutlak geri dönüşsüz yıkımıdır.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lock Popup Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-mystic-surface border border-mystic-primary/30 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-mystic-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <button 
              onClick={() => setShowLockModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <Lock className="text-red-500" size={32} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Derece Kilitli</h3>
            <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-4">Erişim Engellendi</p>
            
            <p className="text-mystic-text-muted text-sm leading-relaxed mb-6">
              Bu dersi/dereceyi açabilmeniz için en az <strong className="text-mystic-primary">{requiredRoleName}</strong> seviyesine ulaşmış olmanız gerekmektedir.
            </p>

            <button 
              onClick={() => setShowLockModal(false)}
              className="bg-gradient-to-r from-mystic-primary to-yellow-500 text-black font-bold px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 w-full"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
