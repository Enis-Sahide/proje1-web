"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Lock, Sparkles, X, Calculator, HelpCircle, Sun, Moon } from 'lucide-react';
import { useContent } from '@/lib/useContent';
import { useAuth } from '@/context/AuthContext';

export default function NumerolojiPage() {
  const router = useRouter();
  const { role, hasAccess } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<'cirak' | 'kalfa' | 'ustat'>('cirak');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const isKalfaUnlocked = hasAccess('numeroloji_2') || isAdmin;
  const isUstatUnlocked = hasAccess('numeroloji_3') || isAdmin;

  const { data: numData, loading, error } = useContent<Record<number, any>>('/api/content/numerology/meanings');

  // Convert object to array and sort numerically
  const numbersArray = Object.values(numData ?? {}).sort((a: any, b: any) => a.number - b.number);

  const handleTabPress = (tab: 'cirak' | 'kalfa' | 'ustat') => {
    if (tab === 'kalfa' && !isKalfaUnlocked) {
      return;
    }
    if (tab === 'ustat' && !isUstatUnlocked) {
      return;
    }
    setActiveTab(tab);
    setExpandedId(null);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center select-none bg-transparent">
      {/* Mystical deep background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#030d1c] via-[#01060a] to-[#000000] -z-50" />

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button onClick={() => router.push('/kadim-dersler')} className="mr-4 p-2 rounded-full hover:bg-mystic-surface-light transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mystic-primary via-yellow-200 to-mystic-primary tracking-wide">
              Numeroloji ve Sayıların Sırrı
            </h1>
            <p className="text-mystic-text-muted mt-1 text-sm md:text-base italic">Doğum Haritanızın ve İsminizin Titreşimsel Dili</p>
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
            1. Derece
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
            2. Derece
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
            3. Derece
          </button>
        </div>

        {/* I. ÇIRAK SEKME İÇERİĞİ */}
        {activeTab === 'cirak' && (
          <div className="animate-in fade-in duration-500">
            {/* Giriş Bilgisi */}
            <div className="mb-8 p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg text-center flex flex-col items-center">
              <Calculator className="text-mystic-primary mb-4" size={40} />
              <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Pisagor ve Sayıların Evreni</h2>
              <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                &quot;Evrenin dili matematiktir.&quot; der Pisagor. Kadim Numeroloji felsefesine göre, var olan her şey belirli bir titreşime sahiptir ve bu titreşimler sayılar aracılığıyla okunabilir. İsimler, tarihler ve olaylar rastgele değildir; 1&apos;den 9&apos;a kadar olan ilkel enerjilerin dansıdır.
              </p>
              <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl mt-4">
                Bu derste, temel sayıların (1-9) ve yüksek frekanslı Üstat Sayıların (11, 22, 33) ezoterik anlamlarını, yönettikleri elementleri ve temsil ettikleri evrensel ilkeleri öğreneceksiniz.
              </p>
            </div>

            {/* Hesaplama Yöntemleri */}
            <h3 className="text-2xl font-bold text-mystic-text mb-6">Hesaplama Yöntemleri</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-mystic-surface/50 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
                <h4 className="font-bold text-mystic-primary mb-2">1. Yaşam Yolu Sayısı (Life Path)</h4>
                <p className="text-sm text-mystic-text-muted leading-relaxed mb-4">
                  Ruhunuzun bu hayattaki rotasını gösterir. Doğum tarihinizdeki (Gün, Ay, Yıl) tüm rakamların tek tek toplanmasıyla bulunur. Çıkan sonuç tek haneye düşene kadar toplanır.
                </p>
                <div className="bg-black/30 p-3 rounded-lg text-xs font-semibold text-[#FF9500] italic">
                  Örnek: 15.08.1990<br />
                  1+5 + 0+8 + 1+9+9+0 = 33 (Üstat sayı olduğu için sadeleşmez. Olmasaydı tekrar toplanırdı.)
                </div>
              </div>

              <div className="p-6 bg-mystic-surface/50 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
                <h4 className="font-bold text-mystic-primary mb-2">2. Kader / İfade Sayısı (Destiny)</h4>
                <p className="text-sm text-mystic-text-muted leading-relaxed mb-4">
                  Doğuştan sahip olduğunuz yetenekleri ifade eder. Nüfus cüzdanınızdaki tam adınızın Pisagor tablosundaki sayısal değerlerinin toplanmasıyla bulunur.
                </p>
                <div className="bg-black/40 p-3 rounded-lg text-xs text-mystic-text grid grid-cols-3 gap-y-1 text-center font-mono">
                  <div><span className="text-mystic-primary font-bold">1:</span> A, J, S, Ş</div>
                  <div><span className="text-mystic-primary font-bold">2:</span> B, K, T</div>
                  <div><span className="text-mystic-primary font-bold">3:</span> C, Ç, L, U, Ü</div>
                  <div><span className="text-mystic-primary font-bold">4:</span> D, M, V</div>
                  <div><span className="text-mystic-primary font-bold">5:</span> E, N, W</div>
                  <div><span className="text-mystic-primary font-bold">6:</span> F, O, Ö, X</div>
                  <div><span className="text-mystic-primary font-bold">7:</span> G, Ğ, P, Y</div>
                  <div><span className="text-mystic-primary font-bold">8:</span> H, Q, Z</div>
                  <div><span className="text-mystic-primary font-bold">9:</span> I, İ, R</div>
                </div>
              </div>

              <div className="p-6 bg-mystic-surface/50 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
                <h4 className="font-bold text-mystic-primary mb-2">3. Ruh Güdüsü Sayısı (Soul Urge)</h4>
                <p className="text-sm text-mystic-text-muted leading-relaxed mb-4">
                  En derin içsel arzularınızı temsil eder. Yalnızca isminizdeki SESLİ HARFLERİN (A, E, I, İ, O, Ö, U, Ü) sayısal değerlerinin toplanmasıyla bulunur.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-mystic-text mb-6">Sayıların Sırrı</h3>

            {loading ? (
              <div className="text-center py-10">
                <Calculator className="animate-spin text-mystic-primary mx-auto mb-4" size={48} />
                <p className="text-mystic-text-muted">Sayı sekansları titreşiyor...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-400">Hata: {error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {numbersArray.map((item: any) => {
                  const isExpanded = expandedId === item.number;

                  return (
                    <div 
                      key={item.number} 
                      className="bg-mystic-surface/80 border border-mystic-primary/20 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300"
                    >
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : item.number)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-mystic-surface transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-mystic-primary/10 border-2 border-mystic-primary flex items-center justify-center">
                            <span className="text-2xl font-bold text-mystic-primary">{item.number}</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-mystic-text">{item.title}</h4>
                            <p className="text-xs text-mystic-primary font-semibold mt-0.5">
                              {item.planet} • {item.element}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={20} className="text-mystic-primary" /> : <ChevronDown size={20} className="text-mystic-primary" />}
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4 animate-in fade-in duration-300">
                          <div className="bg-black/25 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                              <Sun size={16} className="text-yellow-400" />
                              <span className="text-sm font-bold text-yellow-400">Işık Yönü (Aydınlık)</span>
                            </div>
                            <p className="text-sm text-mystic-text leading-relaxed">{item.constructivePotentials}</p>
                          </div>

                          <div className="bg-black/25 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                              <Moon size={16} className="text-gray-400" />
                              <span className="text-sm font-bold text-gray-400">Gölge Yönü (Karanlık)</span>
                            </div>
                            <p className="text-sm text-mystic-text leading-relaxed">{item.negativePotentials}</p>
                          </div>

                          <div className="border-l-4 border-mystic-primary pl-4 py-1">
                            <h5 className="text-sm font-bold text-mystic-primary mb-1">Kader ve Yaşam Yolunda {item.number}</h5>
                            <p className="text-sm text-mystic-text-muted italic leading-relaxed">{item.lifePathDetails}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* II. KALFA SEKME İÇERİĞİ */}
        {activeTab === 'kalfa' && isKalfaUnlocked && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
              <Sparkles className="text-mystic-primary mb-4" size={40} />
              <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Gölgeler, Borçlar ve Zirveler</h2>
              <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                Çırak, sayıların sadece ışık yönlerini görür. Bir Kalfa ise gölgelerin içindeki karmik borçları, ruhun eksik frekanslarını ve hayatın 4 büyük &apos;Zirve&apos; (Pinnacle) döngüsünü okuyabilen kişidir.
              </p>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">1. Karmik Borçların Bedelleri</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Karmik borç sayıları, önceki yaşamlardan getirilen ruhsal günahların bedelleridir. Bir hesaplamada sadeleştirme yapmadan önce 13, 14, 16 veya 19 buluyorsanız, bu sayılar spesifik bir borcu işaret eder.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-xs font-semibold text-[#FF9500] leading-relaxed space-y-2">
                <p>• <strong>13 (Tembelliğin Bedeli):</strong> Önceki yaşamlarda sorumluluktan kaçanların borcudur. Bu hayatta kişi çok çalışmalı, pes etmemeli ve disiplinli olmalıdır. İşler her zaman zorlu ilerler.</p>
                <p>• <strong>14 (Özgürlüğün Suistimali):</strong> Fiziksel zevklerin veya başkalarının özgürlüğünü kısıtlamanın bedelidir. Bağımlılıklardan (alkol, cinsellik vb.) kaçınmak ve esnekliği öğrenmek zorundadır.</p>
                <p>• <strong>16 (Kibrin Yıkımı):</strong> İllegal aşklar veya ego ile başkalarının hayatını yıkmanın cezasıdır. Hayatlarında beklenmedik &apos;Kule&apos; yıkımları yaşarlar. Kibri bırakıp Tanrı&apos;ya teslim olmayı öğrenmelidirler.</p>
                <p>• <strong>19 (Zorbalığın Cezası):</strong> Gücün ve otoritenin bencilce kullanılmasının bedelidir. Bu kişiler bu hayatta kimsenin yardımını alamaz, her şeyi tek başlarına yapmak zorunda kalır ve liderliği sevgiyle öğrenler.</p>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">2. Zirve Döngüleri (Pinnacle Cycles)</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                İnsan hayatı 4 büyük bahar veya &quot;Zirve&quot; dönemine ayrılır. Bu döngüler kişinin o dönemki potansiyelini ve deneyim alanını gösterir.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-xs text-mystic-text space-y-2">
                <p><strong>1. Zirve:</strong> Doğum Ayı + Doğum Günü (Gençlik ve uyanış yılları)</p>
                <p><strong>2. Zirve:</strong> Doğum Günü + Doğum Yılı (Orta yaş, aile ve kariyer)</p>
                <p><strong>3. Zirve:</strong> 1. Zirve + 2. Zirve (Olgunluk ve ustalık dönemi)</p>
                <p><strong>4. Zirve:</strong> Doğum Ayı + Doğum Yılı (Bilgelik ve ruhsal hasat)</p>
                <p className="text-mystic-accent mt-3 italic font-semibold">
                  Formül: İlk Zirvenin bitiş yaşı &quot;36 - Yaşam Yolu Sayısı&quot; formülüyle hesaplanır. İkinci ve üçüncü zirveler her zaman tam 9 yıl sürer. Dördüncü zirve ise ölene kadar devam eder.
                </p>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">3. Eksik Sayılar (Karmic Lessons)</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Doğum isminizdeki tüm harfler Pisagor tablosuna yerleştirildiğinde (Örn: A=1, B=2...), hiç bulunmayan sayılar sizin &quot;Karmik Dersleriniz&quot; yani eksik frekanslarınızdır.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-xs text-mystic-text space-y-1">
                <p>• <strong>Hiç 1 yoksa:</strong> Liderlik ve inisiyatif alma dersi.</p>
                <p>• <strong>Hiç 4 yoksa:</strong> Disiplin, çalışma ve köklenme dersi.</p>
                <p>• <strong>Hiç 8 yoksa:</strong> Parayı yönetme ve otorite kurma dersi.</p>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">4. Sesin Doğduğu 4 Bedensel Rezonans Merkezi</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Ezoterik ses tıbbında ve Sufi Letaif ilminde beden bir müzik aletidir. Harfler ağızda şekillenmeden önce bedenin derin boşluklarında rezone olur:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-mystic-text">
                <div className="bg-black/30 p-3 rounded-xl border border-green-500/30">
                  <p className="font-bold text-green-400 mb-1">🫀 Kalp &amp; Göğüs Rezonansı (Sevgi &amp; Bereket):</p>
                  <p className="text-gray-300"><strong>M, A, L, D, V...</strong> Göğüs kafesini davul gibi titreten seslerdir. <strong>A (Alef)</strong> kalpten doğan saf varoluş ve sevgi feryadıdır; boğazla kalp arasında açık köprü kurar. <strong>M (Mem)</strong> ise göğüste uğuldayan mülk, para ve kalıcı bereketin mühür sesidir.</p>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-yellow-500/30">
                  <p className="font-bold text-yellow-400 mb-1">🔥 Karın &amp; Mide Rezonansı (İrade &amp; Eylem):</p>
                  <p className="text-gray-300"><strong>U, Ü, O, Ö, K, Ç, C, T...</strong> Söylerken karın kaslarının ve diyaframın kasıldığını hissedersiniz. Solar Pleksus ateşidir; cesareti, ticari atılımı, eyleme geçme iradesini yönetir.</p>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-cyan-500/30">
                  <p className="font-bold text-cyan-400 mb-1">🗣️ Boğaz Rezonansı (İfade &amp; Görünürlük):</p>
                  <p className="text-gray-300"><strong>E, H, N, B, P...</strong> Boğaz kanalında şekillenen seslerdir. <strong>E (He)</strong> boğazın doğal artikülasyonudur; içerideki duyguyu dış dünyaya tercüme eder, kitlelere hitap ve dijital ağ yayılımı sağlar.</p>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-purple-500/30">
                  <p className="font-bold text-purple-400 mb-1">🧠 Kafa &amp; Zihin Rezonansı (Sezgi &amp; Manyetizma):</p>
                  <p className="text-gray-300"><strong>I, İ, Y, S, Ş, Z, F, J, R...</strong> Sinüs boşluklarında ve epifiz bezinde mikrotitreşim yapar. Yüksek analitik zeka, strateji ve negatif enerjileri savuran manyetik bir kalkan oluşturur.</p>
                </div>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">5. İsim Simülasyonu ve Ek İsimle Çakra Dengeleme</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Kadim gelenekte bir insanın isminde eksik olan çakralar, hayatındaki tıkanıklık alanlarını (parasızlık, yalnızlık, ifade güçlüğü) gösterir. Bu eksiklikler bilinçli bir &quot;İkinci İsim&quot; eklenerek rezonans düzeyinde kapatılabilir:
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-xs text-mystic-text space-y-2">
                <p>• <strong>Bolluk &amp; Bereket Hedefi:</strong> 2 (Ortaklık), 3 (İrade), 4 (Mülk - Mem) ve 8 (Büyük Finans) çakralarını taşıyan isimler (Örn: <em>Melis, Burak, Berk, Demir, Banu</em>).</p>
                <p>• <strong>Görünürlük &amp; Şöhret Hedefi:</strong> 1 (Liderlik - Alef), 5 (Boğaz - İfade) ve 9 (Evrensel Yayılım) çakralarını taşıyan isimler (Örn: <em>Arya, Aras, Ege, Rana, Sera</em>).</p>
                <p>• <strong>Aşk &amp; Uyum Hedefi:</strong> 2 (Sakral Çekim) ve 4-6 (Kalp ve Estetik) çakralarını taşıyan isimler (Örn: <em>Defne, Can, Filiz, Deniz, Oya</em>).</p>
              </div>
            </div>
          </div>
        )}

        {/* III. ÜSTAT SEKME İÇERİĞİ */}
        {activeTab === 'ustat' && isUstatUnlocked && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="p-6 md:p-8 bg-mystic-surface/40 border border-mystic-primary/20 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center text-center">
              <Sparkles className="text-mystic-primary mb-4" size={40} />
              <h2 className="text-xl md:text-2xl font-bold text-mystic-text mb-3">Okült Geçitler ve Karanlık Döngüler</h2>
              <p className="text-mystic-text-muted leading-relaxed text-sm md:text-base max-w-2xl">
                Üstat, zamanın ve kaderin ötesini görür. Keldani sırlarına vakıftır. Zirvelerin aydınlığında değil, &quot;Mücadele Döngülerinin&quot; karanlığında yürümeyi bilir ve zamanın ruhunu okur.
              </p>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">1. Mücadele Döngüleri (Challenge Cycles)</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Zirve döngülerinin tam zıttıdır. Numerolojideki çoğu hesaplamanın aksine toplama ile değil, &quot;Çıkarma (Fark Alma)&quot; ile hesaplanır. Hayatınızın karanlık dehlizlerini, içsel şeytanlarınızı ve kör noktalarınızı gösterir. Sonuç her zaman Mutlak Değerdir (Negatif olamaz) ve hiçbir zaman 9 olamaz.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-xs text-mystic-text space-y-1">
                <p><strong>1. Mücadele:</strong> |Doğum Ayı - Doğum Günü|</p>
                <p><strong>2. Mücadele:</strong> |Doğum Günü - Doğum Yılı|</p>
                <p><strong>Ana (3.) Mücadele:</strong> |1. Mücadele - 2. Mücadele|</p>
                <p><strong>4. Mücadele:</strong> |Doğum Ayı - Doğum Yılı|</p>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">2. Pisagor vs. Keldani (Chaldean) Sistemi</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Pisagor sistemi 1-9 arası ardışık harf dizilimini (A=1, B=2, C=3) kullanır. Ancak antik Babil kaynaklı Keldani Sistemi çok daha mistiktir. Keldani sisteminde harfler sese dayalı titreşir ve <strong>hiçbir harfin değeri 9 olamaz.</strong> Çünkü 9 kutsal Tanrısal sayıdır ve fani harflere atanamaz.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-xs font-mono text-mystic-text grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                <div>1 = A, I, J, Q, Y</div>
                <div>2 = B, K, R</div>
                <div>3 = C, G, L, S</div>
                <div>4 = D, M, T</div>
                <div>5 = E, H, N, X</div>
                <div>6 = U, V, W</div>
                <div>7 = O, Z</div>
                <div>8 = F, P</div>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">3. Kişisel Zaman Okuması (Zaman Gezginliği)</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Evren 9 yıllık epik döngülerle hareket eder. Kişisel Yılınız, ruhunuzun o an evrensel tiyatroda hangi sahnede olduğunu söyler.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-xs text-mystic-text font-semibold text-[#FF9500] italic">
                Kişisel Yıl Formülü: Doğum Gününüz + Doğum Ayınız + İçinde Bulunduğumuz Evrensel Yıl (Örn: 2026=10=1).<br />
                Eğer bu toplam örneğin 9 çıkıyorsa; bu sizin için hasat, bitiş ve temizlik yılıdır.
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">4. Temel Taşı, Zirve Taşı ve Ouroboros Geometrisi</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Bir ismin ilk harfi <strong>Temel Taşı (Cornerstone)</strong>, son harfi ise <strong>Zirve Taşı (Capstone)</strong> olarak adlandırılır. Bu iki harfin birbiriyle ilişkisi, enerjinin akışını ya da kilitlenmesini belirler.
              </p>
              <div className="bg-black/30 p-4 rounded-xl text-xs text-mystic-text space-y-2">
                <p>• <strong>Kutsal Döngü (Ouroboros Kalkanı):</strong> İsmin aynı harfle başlayıp aynı harfle bitmesi (Örn: <em>Omnia Studio</em> - O...O veya A...A) paranın ve enerjinin dışarı kaçmasını önleyen kapalı bir bereket aurası çizer.</p>
                <p>• <strong>Dönüştürücü Akış:</strong> İsmin gırtlaktan (Ateş/Güneş) başlayıp dudakta (Toprak/Mem) bitmesi, fikirlerin hızla fiziksel servete dönüşmesini sağlar.</p>
              </div>
            </div>

            <div className="bg-mystic-surface/50 p-6 border-l-4 border-mystic-primary rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md">
              <h3 className="text-lg font-bold text-mystic-primary mb-3">5. Ticari Şirket ve Marka Akustiği Sırrı</h3>
              <p className="text-sm text-mystic-text leading-relaxed mb-4">
                Başarılı küresel markalar incelendiğinde harf frekanslarının tesadüfi olmadığı görülür:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-mystic-text">
                <div className="bg-black/30 p-3 rounded-xl">
                  <strong className="text-yellow-400 block mb-1">Finans &amp; E-Ticaret:</strong>
                  M (Mem - Mülk), B (Bet - Kap), L (Genişleme) ve 8 (Zayin - Otorite) harfleriyle müşterinin güvenle para harcaması ve kârın kasada kalması sağlanır.
                </div>
                <div className="bg-black/30 p-3 rounded-xl">
                  <strong className="text-indigo-400 block mb-1">Sanat &amp; Görsel Tasarım:</strong>
                  6. Çakra (O, F) ve 2. Çakra (B, K, T) harfleriyle estetik arzu, ilham ve görsel çekicilik manyetizması yaratılır.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
