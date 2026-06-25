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
  const [showLockModal, setShowLockModal] = useState(false);
  const [requiredRoleName, setRequiredRoleName] = useState('');

  const isKalfaUnlocked = hasAccess('numeroloji_2') || isAdmin;
  const isUstatUnlocked = hasAccess('numeroloji_3') || isAdmin;

  const { data: numData, loading, error } = useContent<Record<number, any>>('/api/content/numerology/meanings');

  // Convert object to array and sort numerically
  const numbersArray = Object.values(numData ?? {}).sort((a: any, b: any) => a.number - b.number);

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
              <h3 className="text-lg font-bold text-mystic-primary mb-3">4. Temel Taşı ve Zirve Taşı</h3>
              <p className="text-sm text-mystic-text leading-relaxed">
                Bir kişinin ismindeki <strong>İlk Harf (Temel Taşı - Cornerstone)</strong> onun hayata karşı ilk reaksiyonunu, ilk savunma mekanizmasını gösterir. <strong>Son Harf (Zirve Taşı - Capstone)</strong> ise bir projeyi nasıl tamamladığını veya sorunları nasıl sonlandırdığını gösterir. İlk Sesli Harf ise ruhun dünyevi dünyaya bakan ilk penceresidir.
              </p>
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
