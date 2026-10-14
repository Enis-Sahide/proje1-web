/**
 * LunationEngine.ts
 * Yeni Ay, Dolunay, Güneş Tutulması ve Ay Tutulması Etki Motoru.
 * Kolektif ve 12 Ev kişisel astrolojik analizlerini, etki sürelerini yönetir.
 */

export type LunationType = 'new_moon' | 'full_moon' | 'solar_eclipse' | 'lunar_eclipse';

export interface LunationEvent {
  utcDate: string; // ISO format
  phase: LunationType;
  phaseName: string;
  sign: string;
  signSymbol: string;
  degree: string;
}

export interface LunationDurationInfo {
  totalDuration: string; // örn: "6 Ay", "14 Gün", "1 - 3 Ay"
  peakWindow: string;    // örn: "±15 Gün", "±3 Gün", "±7 - 14 Gün"
  description: string;
  nature: string;
}

export const LUNATION_DURATIONS: Record<LunationType, LunationDurationInfo> = {
  new_moon: {
    totalDuration: '14 Gün',
    peakWindow: '±3 Gün',
    description: 'Bir sonraki Dolunaya kadar tohum ekme, niyet belirleme ve sıfırdan başlama enerjisidir.',
    nature: 'Başlangıç, Niyet, Tohum Ekme',
  },
  full_moon: {
    totalDuration: '14 Gün',
    peakWindow: '±3 ila 5 Gün',
    description: 'Hasat alma, gizli olanın aydınlanması, ilişkilerde veya projelerde netleşme ve doruk noktasıdır.',
    nature: 'Hasat, Yüzleşme, Doruk Noktası',
  },
  lunar_eclipse: {
    totalDuration: '1 ila 3 Ay',
    peakWindow: '±7 ila 14 Gün',
    description: 'Süper Dolunay niteliğindedir. Kadersel kapanışlar, duygusal aydınlanmalar ve bitmesi gereken bağların kopuşudur.',
    nature: 'Kadersel Kapanış, Dönüşüm, Aydınlanma',
  },
  solar_eclipse: {
    totalDuration: 'Tam 6 Ay',
    peakWindow: '±15 ila 30 Gün',
    description: 'Süper Yeniay niteliğindedir. Bir sonraki tutulma aksına kadar 6 ay boyunca yaşam rotasını değiştiren kadersel başlangıçları tetikler.',
    nature: 'Kadersel Başlangıç, Köklü Dönüm Noktası',
  },
};

// 2026 Resmi Ay Döngüsü ve Tutulma Takvimi
export const MOON_PHASES_DATA: LunationEvent[] = [
  { utcDate: '2026-01-03T10:03:26.043Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Yengeç', signSymbol: '♋', degree: '13°' },
  { utcDate: '2026-01-18T19:52:39.367Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Oğlak', signSymbol: '♑', degree: '28°' },
  { utcDate: '2026-02-01T22:09:49.657Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Aslan', signSymbol: '♌', degree: '13°' },
  { utcDate: '2026-02-17T12:01:47.328Z', phase: 'solar_eclipse', phaseName: 'Güneş Tutulması', sign: 'Kova', signSymbol: '♒', degree: '28°' },
  { utcDate: '2026-03-03T11:38:32.022Z', phase: 'lunar_eclipse', phaseName: 'Ay Tutulması', sign: 'Başak', signSymbol: '♍', degree: '12°' },
  { utcDate: '2026-03-19T01:24:05.931Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Balık', signSymbol: '♓', degree: '28°' },
  { utcDate: '2026-04-02T02:12:36.809Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Terazi', signSymbol: '♎', degree: '12°' },
  { utcDate: '2026-04-17T11:52:21.628Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Koç', signSymbol: '♈', degree: '27°' },
  { utcDate: '2026-05-01T17:23:47.564Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Akrep', signSymbol: '♏', degree: '11°' },
  { utcDate: '2026-05-16T20:01:32.344Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Boğa', signSymbol: '♉', degree: '25°' },
  { utcDate: '2026-05-31T08:45:48.291Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Yay', signSymbol: '♐', degree: '9°' },
  { utcDate: '2026-06-15T02:54:39.007Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'İkizler', signSymbol: '♊', degree: '24°' },
  { utcDate: '2026-06-29T23:57:17.744Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Oğlak', signSymbol: '♑', degree: '8°' },
  { utcDate: '2026-07-14T09:44:04.307Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Yengeç', signSymbol: '♋', degree: '21°' },
  { utcDate: '2026-07-29T14:36:19.011Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Kova', signSymbol: '♒', degree: '6°' },
  { utcDate: '2026-08-12T17:37:11.343Z', phase: 'solar_eclipse', phaseName: 'Güneş Tutulması', sign: 'Aslan', signSymbol: '♌', degree: '20°' },
  { utcDate: '2026-08-28T04:19:06.085Z', phase: 'lunar_eclipse', phaseName: 'Ay Tutulması', sign: 'Balık', signSymbol: '♓', degree: '4°' },
  { utcDate: '2026-09-11T03:27:28.467Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Başak', signSymbol: '♍', degree: '18°' },
  { utcDate: '2026-09-26T16:49:32.233Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Koç', signSymbol: '♈', degree: '3°' },
  { utcDate: '2026-10-10T15:50:36.724Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Terazi', signSymbol: '♎', degree: '17°' },
  { utcDate: '2026-10-26T04:12:15.538Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Boğa', signSymbol: '♉', degree: '2°' },
  { utcDate: '2026-11-09T07:02:42.392Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Akrep', signSymbol: '♏', degree: '16°' },
  { utcDate: '2026-11-24T14:54:04.191Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'İkizler', signSymbol: '♊', degree: '2°' },
  { utcDate: '2026-12-09T00:52:31.284Z', phase: 'new_moon', phaseName: 'Yeni Ay', sign: 'Yay', signSymbol: '♐', degree: '16°' },
  { utcDate: '2026-12-24T01:28:45.040Z', phase: 'full_moon', phaseName: 'Dolunay', sign: 'Yengeç', signSymbol: '♋', degree: '2°' },
];

// Burçlara Göre Kolektif Yorumlar
export const SIGN_LUNATION_INTERPRETATIONS: Record<string, Record<LunationType, { title: string; collective: string; ritual: string }>> = {
  'Koç': {
    new_moon: {
      title: 'Cesaret, Girişim ve Bireysel Uyanış',
      collective: 'Yeni adımlar atmak, kendi gücünüzü geri almak ve ertelediğiniz projelere başlamak için eşsiz bir motivasyon kapısı açılıyor.',
      ritual: 'Kırmızı bir mum eşliğinde kendi sınırlarınızı koruma ve yeni hedeflerinize başlama niyetinizi yazın.',
    },
    full_moon: {
      title: 'Bireysel Sınırların ve Sabrın Hasadı',
      collective: 'Ben-biz dengesinde gerilimler açığa çıkabilir. Öfkeyi yapıcı bir eyleme dönüştürme ve bağımsızlığınızı ilan etme zamanı.',
      ritual: 'Öfke veya bastırılmış duygularınızı bir kağıda döküp güvenli bir şekilde yakın ve derin nefeslerle arının.',
    },
    solar_eclipse: {
      title: 'Kadersel Liderlik ve Kimlik Yenilenmesi',
      collective: 'Önümüzdeki 6 ay boyunca hayatınızın iplerini tamamen elinize alacağınız, radikal bir benlik inşası dönemi başlıyor.',
      ritual: 'Eski hayatınıza veda eden ve yeni lider kimliğinizi kucaklayan güçlü bir taahhüt mektubu yazın.',
    },
    lunar_eclipse: {
      title: 'Yıpratıcı Mücadelelerin Kadersel Kapanışı',
      collective: 'Sizi tüketen gereksiz rekabet ve kavgalar kadersel olarak sonlanıyor. Gücünüzü tüketen bağları kesme vakti.',
      ritual: 'Tuzlu suyla ellerinizi ve ayaklarınızı yıkayarak savaş enerjisinden arının.',
    },
  },
  'Boğa': {
    new_moon: {
      title: 'Maddi Güvenlik, Özdeğer ve Kökleşme',
      collective: 'Finansal yatırımlar, üretkenlik ve bedensel huzur için kalıcı tohumlar ekme zamanı. Değerinizi hatırlayın.',
      ritual: 'Toprağa dokunarak veya saksıya bir tohum ekerek bereket niyetlerinizi toprak anaya emanet edin.',
    },
    full_moon: {
      title: 'Finansal Netleşme ve Değerlerin İmtihanı',
      collective: 'Maddi konularda bir hasat dönemi. Aşırı tutuculuk ile akışa güvenme arasındaki gerilim çözüme ulaşıyor.',
      ritual: 'Cüzdanınızı veya bereket taşlarınızı ay ışığında arındırın ve bolluk frekansına odaklanın.',
    },
    solar_eclipse: {
      title: 'Maddi Boyutta 6 Aylık Köklü Devrim',
      collective: 'Önümüzdeki 6 ay boyunca gelir kaynaklarınız, üretim alanlarınız ve dünyaya bakış açınız köklü biçimde değişiyor.',
      ritual: 'Gelecek 6 aylık finansal vizyonunuzu ve özdeğer hedeflerinizi yeşil mürekkeple yazıp saklayın.',
    },
    lunar_eclipse: {
      title: 'Korku ve Bağımlılıkların Kadersel Vedası',
      collective: 'Maddi kaygılar ve kaybetme korkusuyla tutunduğunuz ne varsa serbest bırakılıyor. Ruhsal özgürlük başlıyor.',
      ritual: 'Korkularınızı yazdığınız kağıdı yırtarak toprağa gömün; dönüşüme izin verin.',
    },
  },
  'İkizler': {
    new_moon: {
      title: 'Zihinsel Açıklık, Yeni Bağlantılar ve İletişim',
      collective: 'Yeni fikirler, eğitimler, seyahatler ve anlaşmalar için zihnin en parlak çalıştığı evre. Yeni bir vizyon edinin.',
      ritual: 'Bir günlük başlatın ve zihninize gelen ilham verici fikirleri sansürlemeden listeleyin.',
    },
    full_moon: {
      title: 'Bilgi Kirliliğinden Gerçeğe Ulaşma',
      collective: 'Kararsızlıkların bittiği, hakikatin gün yüzüne çıktığı bir tamamlama anı. Net bir konuşma veya imza gündeme gelebilir.',
      ritual: 'Zihninizi dinlendirmek için lavanta kokusu eşliğinde 10 dakika sessiz meditasyon yapın.',
    },
    solar_eclipse: {
      title: 'İletişim ve Algıda 6 Aylık Kadersel Açılım',
      collective: 'Önümüzdeki 6 ay boyunca çevreniz, kardeşler/yakın çevre ilişkileriniz ve düşünce yapınız yepyeni bir seviyeye evriliyor.',
      ritual: 'Öğrenmek istediğiniz kadim ilimleri veya yazmak istediğiniz projeyi belirleyip ilk sayfasını açın.',
    },
    lunar_eclipse: {
      title: 'Yalanlar, Yanılsamalar ve Zihinsel Detoks',
      collective: 'Size hizmet etmeyen gereksiz dedikodular, yüzeysel ilişkiler ve zihinsel yükler kadersel olarak geride kalıyor.',
      ritual: 'Telefonunuzdaki ve dijital dünyanızdaki gereksiz yükleri temizleyerek alan açın.',
    },
  },
  'Yengeç': {
    new_moon: {
      title: 'Duygusal Şifa, Yuva ve İçsel Güvenlik',
      collective: 'Ailenize, evinize ve ruhsal sığınağınıza odaklanma zamanı. Kendi kalbinize şefkat göstermek için güçlü bir başlangıç.',
      ritual: 'Evinizde adaçayı veya üzerlik tütsüsü yakarak alanınızı arındırın ve yuvaya huzur dileyin.',
    },
    full_moon: {
      title: 'Duyguların Zirvesi ve Ailevi Netleşmeler',
      collective: 'Geçmişin yükleri ve çocukluk anıları su yüzüne çıkabilir. Sezgileriniz son derece güçlü; rüyalarınıza dikkat edin.',
      ritual: 'Bir kase suya ay ışığını yansıtıp niyetinizi suya fısıldayın ve sabah o suyla yüzünüzü yıkayın.',
    },
    solar_eclipse: {
      title: 'Ruhsal Kökler ve Ailede 6 Aylık Kadersel Dönüşüm',
      collective: 'Önümüzdeki 6 ay ev değişimi, taşınma, aile kurma veya ata bağlarını şifalandırma konusunda dönüm noktası olacak.',
      ritual: 'Atalarınıza sevgi ve teşekkür gönderen bir dua veya niyet meditasyonu yapın.',
    },
    lunar_eclipse: {
      title: 'Geçmişin Prangalarından Kadersel Kopuş',
      collective: 'Yıllardır taşıdığınız melankoli, alınganlık ve kurban psikolojisi kadersel olarak son buluyor. Yeniden doğuyorsunuz.',
      ritual: 'Eski fotoğraflardan veya anılardan sizi aşağı çeken bir objeyi hayatınızdan sevgiyle çıkarın.',
    },
  },
  'Aslan': {
    new_moon: {
      title: 'Yaratıcılık, Sahne ve Kalbin Coşkusu',
      collective: 'Özgüveninizi sahneye koyma, aşk kapılarını aralama ve yaratıcı projelere imza atma vakti. Kendi ışığınızı saklamayın.',
      ritual: 'Altın renkli bir eşyanızı takın ve aynaya bakıp kendi değerinizi ve yeteneklerinizi onaylayın.',
    },
    full_moon: {
      title: 'Ego Sınavı ve Hak Ettiğin Değeri Görme',
      collective: 'Yeteneğinizin ve emeklerinizin takdir gördüğü bir doruk noktası. Aşırı gururdan kaçınarak kalpten sevmeye odaklanın.',
      ritual: 'Güneş taşı veya sitrin taşıyla kalbinizin üzerine dokunup sevgi titreşimini yükseltin.',
    },
    solar_eclipse: {
      title: 'Kader Sahnesinde 6 Aylık Büyük Rol Değişimi',
      collective: 'Önümüzdeki 6 ay boyunca hayatınızın parlayan yıldızı olacağınız, liderlik ve yaratıcılıkta kadersel kapılar açılıyor.',
      ritual: 'Kendinizi 6 ay sonra nerede görmek istediğinizi büyük bir vizyon panosu olarak resmedin.',
    },
    lunar_eclipse: {
      title: 'Göz Boyayan Işıkların Sönüşü ve Özgünlük',
      collective: 'Sahte alkışlar, yüzeysel beğeniler ve toksik gurur kadersel olarak temizleniyor. Gerçek dostlar ve saf yetenek kalıyor.',
      ritual: 'Sizi sadece onay almak için yaptığınız rollerden özgürleştirecek bir affetme meditasyonu yapın.',
    },
  },
  'Başak': {
    new_moon: {
      title: 'Sağlık, Düzen, Arınma ve Hizmet',
      collective: 'Günlük rutinlerinizi düzenlemek, bedeninizi şifalandırmak ve detaylı planlar yapmak için en verimli evre.',
      ritual: 'Detoks içeceği hazırlayın, çalışma alanınızı kusursuzca düzenleyin ve hedeflerinizi maddeler halinde yazın.',
    },
    full_moon: {
      title: 'Mükemmeliyetçilik Tuzağını Aşma ve Hasat',
      collective: 'Aşırı eleştirellik ve kaygıyı geride bırakma zamanı. Emek verdiğiniz bir projenin veya sağlık sürecinin neticesini alıyorsunuz.',
      ritual: 'Bedeninizi esneten nefes egzersizleri yapın ve kendinizi olduğunuz gibi kabullenin.',
    },
    solar_eclipse: {
      title: 'İş, Sağlık ve Rutinlerde 6 Aylık Kadersel İyileşme',
      collective: 'Önümüzdeki 6 ay boyunca mesleki uzmanlığınız, çalışma şartlarınız ve beden sağlığınız baştan ayağa yenilenecek.',
      ritual: 'Bedeninize ve hayatınıza saygı gösteren bir sağlık ve disiplin sözleşmesi imzalayın.',
    },
    lunar_eclipse: {
      title: 'Yük Olan Sorumluluklardan Kadersel Kurtuluş',
      collective: 'Başkalarının sorumluluğunu üstlenmekten yorulduğunuz döngü bitiyor. Sınır çizmeyi kadersel olarak öğreniyorsunuz.',
      ritual: 'Sizin göreviniz olmayan işleri sahiplerine iade ettiğinizi imgeleyerek nefes verin.',
    },
  },
  'Terazi': {
    new_moon: {
      title: 'İlişkiler, Uyum, Adalet ve Estetik',
      collective: 'Yeni bir ortaklık, aşka yelken açma veya hayatınızdaki dengesizlikleri giderme dönemi. Barışçıl adımlar kazandırır.',
      ritual: 'Gül kuvars taşı eşliğinde hayatınıza hakiki sevgi ve adil ortaklıkları davet eden bir niyet tutun.',
    },
    full_moon: {
      title: 'İkili İlişkilerde Aynalama ve Nihai Karar',
      collective: 'İlişkilerde "ben" ve "sen" arasındaki dinamikler tüm çıplaklığıyla görünür oluyor. Bitmesi gereken ortaklıklar netleşir.',
      ritual: 'İlişkilerinizde sizi huzursuz eden beklentileri bir kağıda yazıp suya bırakın.',
    },
    solar_eclipse: {
      title: 'İlişki ve Evlilik Aksında 6 Aylık Kadersel Kader',
      collective: 'Önümüzdeki 6 ay kadersel bir ruh eşiyle karşılaşma, evlilik veya önemli bir hukuki/iş ortaklığı dönüm noktası getirecek.',
      ritual: 'Hayatınızda istediğiniz dengeli ilişki profilini en ince detayına kadar yazıp pembe bir kurdeleyle sarın.',
    },
    lunar_eclipse: {
      title: 'Bağımlı ve Toksik İlişkilerin Kadersel Sonu',
      collective: 'Sırf yalnız kalmamak için taviz verdiğiniz her bağ kadersel olarak kopuyor. Kendi dengenizi buluyorsunuz.',
      ritual: 'Kordon kesme (enerji bağı koparma) meditasyonu ile eski sevgililerden ve tükenmiş bağlardan özgürleşin.',
    },
  },
  'Akrep': {
    new_moon: {
      title: 'Küllerinden Doğuş, Tutku ve Gizli Güç',
      collective: 'Bilinçaltınızı temizlemek, finansal krizleri fırsata çevirmek ve sezgilerinizi uyandırmak için derin bir dönüşüm kapısı.',
      ritual: 'Siyah turmalin veya obsidyen taşıyla aura temizliği yapın, en derin korkunuzu güce dönüştürmeye niyet edin.',
    },
    full_moon: {
      title: 'Karanlığın Aydınlanması ve Büyük Yüzleşme',
      collective: 'Sırlara, gizli kalan gerçeklere ve finansal paylaşımlara dair güçlü bir aydınlanma. Güç savaşlarına girmekten kaçının.',
      ritual: 'Tuzlu banyo yaparak aurik tortuları arındırın ve sezgilerinizi dinleyin.',
    },
    solar_eclipse: {
      title: 'Ruhsal ve Finansal 6 Aylık Simya Dönemi',
      collective: 'Önümüzdeki 6 ay boyunca ortaklaşa gelirler, yatırımlar ve okült ilimlerde muazzam bir kadersel dönüşüm yaşanacak.',
      ritual: 'Korkularınızın arkasında saklanan gerçek potansiyelinizi uyandırma yemini edin.',
    },
    lunar_eclipse: {
      title: 'Zehirli Hırsların ve Kıskançlığın Kadersel Sonu',
      collective: 'İntikam, şüphe ve aşırı kontrol tutkusu kadersel bir şokla terk ediliyor. Saf şifa ve güven frekansı açılıyor.',
      ritual: 'Geçmişte size haksızlık yapanları kendi içsel özgürlüğünüz için tamamen affedin ve yükü evrene bırakın.',
    },
  },
  'Yay': {
    new_moon: {
      title: 'Yüksek Vizyon, İnanç, Keşif ve Özgürlük',
      collective: 'Yeni felsefeler keşfetmek, yurt dışı adımları, akademik hedefler ve hayatın anlamına doğru kanatlanma zamanı.',
      ritual: 'Gözlerinizi kapatıp evrenin sonsuz genişliğini imgeleyin ve inançlarınızı yenileyin.',
    },
    full_moon: {
      title: 'İnançların Sınavı ve Büyük Resmin Görünmesi',
      collective: 'Küçük ayrıntılarda boğulmaktan kurtulup hayatınızın büyük tablosunu görüyorsunuz. Uzun süren bir davanın veya eğitimin sonu.',
      ritual: 'Mavi bir mum yakarak bilgelik ve ilahi adalet niyetlerinizi dile getirin.',
    },
    solar_eclipse: {
      title: 'Hayat Felsefesi ve Yurt Dışı Aksında 6 Aylık Kadersel Sıçrama',
      collective: 'Önümüzdeki 6 ay boyunca inançlarınız, dünya görüşünüz ve uluslararası bağlantılarınız kadersel biçimde genişliyor.',
      ritual: 'Ruhsal pusulanızı belirleyin ve hayat amacınızı tek bir cümleyle özetleyip başucunuza koyun.',
    },
    lunar_eclipse: {
      title: 'Dogmaların ve Fanatizmin Kadersel Çöküşü',
      collective: 'Artık geçerliliğini yitirmiş katı inançlar ve boş vaatler kadersel olarak sonlanıyor. Gerçek hakikate uyanış.',
      ritual: 'Kendi kendinizi sınırlandırdığınız "Asla yapamam" dediğiniz inançları yakın.',
    },
  },
  'Oğlak': {
    new_moon: {
      title: 'Kariyer, Statü, Disiplin ve Zirve Hedefleri',
      collective: 'Kariyerinizde somut bir yapı inşa etmek, otoritenizi güçlendirmek ve uzun vadeli projelere temel atmak için ideal zaman.',
      ritual: '10 yıllık büyük hayat hedeflerinizi hiyerarşik olarak kağıda dökün ve kararlılık yemini edin.',
    },
    full_moon: {
      title: 'Başarıların Hasadı ve Sorumluluk Yüzleşmesi',
      collective: 'Toplum önündeki duruşunuz ve kariyerinizde bir dönemin zirvesi veya kapanışı. Aşırı katı olmaktan kaçının.',
      ritual: 'Taş veya kristal gibi ağır, köklü bir objeyi elinizde tutarak sabrınızı ve dirayetinizi kutsayın.',
    },
    solar_eclipse: {
      title: 'Kariyer ve Zirvede 6 Aylık Kadersel İnşa',
      collective: 'Önümüzdeki 6 ay boyunca mesleki unvanınız, toplumdaki konumunuz ve sorumluluklarınız baştan yazılıyor.',
      ritual: 'Zirveye giden yolda bırakmanız gereken yükleri ve üstleneceğiniz yeni liderliği yazın.',
    },
    lunar_eclipse: {
      title: 'Tükenmiş Sistemlerin ve Katı Otoritenin Sonu',
      collective: 'Sizi duygusuzlaştıran aşırı işkoliklik ve katı kurallar kadersel olarak yıkılıyor. Duygu ve mantık dengeleniyor.',
      ritual: 'Başarısızlık korkunuzu serbest bırakın ve kendinizi sadece unvanlarınızla tanımlamaktan vazgeçin.',
    },
  },
  'Kova': {
    new_moon: {
      title: 'Gelecek Vizyonu, Özgünlük, Teknoloji ve Kolektif',
      collective: 'Sıra dışı fikirleri hayata geçirmek, topluluklarla bir araya gelmek ve çağı yakalayan adımlar atmak için eşsiz bir zemin.',
      ritual: 'Geleceğe bir mektup yazın; insanlığa ve kendinize sunmak istediğiniz özgün projeyi mühürleyin.',
    },
    full_moon: {
      title: 'Bireysel Dehanın Kolektifle Buluşması',
      collective: 'Dostluklar, dernekler ve sosyal çevrelerde netleşme anı. Sizi kısıtlayan kalıpları kırıp özgürlüğünüzü ilan edin.',
      ritual: 'Yıldızları izleyerek evrensel bilinçle bağlantı kurun ve kalbinizi kolektif şifaya açın.',
    },
    solar_eclipse: {
      title: 'Çağ Atlatacak 6 Aylık Kadersel Uyanış',
      collective: 'Önümüzdeki 6 ay boyunca dijital projeler, vizyoner atılımlar ve sosyal çevrenizde devrim niteliğinde kadersel değişimler olacak.',
      ritual: 'Kendi özgün dehanızı kutlayan ve tabuları yıkan bir vizyon meditasyonu yapın.',
    },
    lunar_eclipse: {
      title: 'Sahte İdeallerin ve Samimiyetsiz Grupların Sonu',
      collective: 'Sizi sadece kullanan arkadaş grupları ve anlamsız sosyal davalar kadersel olarak eleniyor. Gerçek dostlar kalıyor.',
      ritual: 'Sosyal çevrenizde enerji vampirliği yapan ilişkileri zihninizde serbest bırakın.',
    },
  },
  'Balık': {
    new_moon: {
      title: 'Ruhsal Uyanış, Teslimiyet, Sezgi ve İlahi Akış',
      collective: 'Evrenle bir olma, meditasyon, sanat ve sınırsız empati zamanı. Mantığı bir kenara bırakıp kalbin sesini dinleyin.',
      ritual: 'Deniz tuzuyla arınma banyosu yapın, ilahi müziğe kendinizi bırakıp rüyalarınızı not edin.',
    },
    full_moon: {
      title: 'Ruhun Aynası ve İllüzyonların Dağılması',
      collective: 'Kendi kendinizi kandırdığınız veya aşırı fedakarlık yaptığınız konular gün yüzüne çıkıyor. İlahi adalete güvenin.',
      ritual: 'Ametist veya selenit kristaliyle tepe çakranızı aktive ederek ilahi rehberlik talep edin.',
    },
    solar_eclipse: {
      title: 'Bilinçaltında ve Ruhta 6 Aylık Kozmik Dönüşüm',
      collective: 'Önümüzdeki 6 ay boyunca ruhsal yetenekleriniz, yaratıcı sanatınız ve karmik yükleriniz baştan aşağı şifalanacak.',
      ritual: 'Tüm evrene şartsız koşulsuz sevgi ve şifa gönderen küresel bir niyet meditasyonu yapın.',
    },
    lunar_eclipse: {
      title: 'Kurban Psikolojisi ve Bağımlılıkların Kadersel Sonu',
      collective: 'Kendinizi feda ettiğiniz toksik merhamet döngüsü kadersel olarak son buluyor. Ruhunuz özgürleşiyor.',
      ritual: 'Eski pişmanlıklarınızı suya akıtın; "Her şey olması gerektiği gibiydi, affediyorum ve özgürüm" deyin.',
    },
  },
};

// 12 Ev Bireysel Harita Etkileri (Kişinin Natal Haritasında Hangi Eve Düştüğüne Göre)
export const HOUSE_LUNATION_INTERPRETATIONS: Record<number, Record<LunationType, { title: string; personalImpact: string; advice: string }>> = {
  1: {
    new_moon: {
      title: '1. Ev: Fiziksel Beden, İmaj ve Yeni Benlik',
      personalImpact: 'Doğrudan kimliğinizi, dış görünüşünüzü ve kişisel hedeflerinizi yenileme fırsatı.',
      advice: 'Sağlığınıza, tarzınıza ve kendinize yatırım yapın. İlk adımı cesaretle atın.',
    },
    full_moon: {
      title: '1. Ev: Bireysel Gücün Zirvesi ve Kişisel Farkındalık',
      personalImpact: 'Kişisel sınırlarınızı çizdiğiniz, başkalarının beklentilerini bir kenara koyup kendinizi seçtiğiniz bir an.',
      advice: 'Yorulmuş bedeninizi dinlendirin, aşırı tepkisellikten kaçının.',
    },
    solar_eclipse: {
      title: '1. Ev: Hayatınızın Yönünde 6 Aylık Kadersel Başlangıç',
      personalImpact: 'Önümüzdeki 6 ay boyunca hayatınızın ana rotası, kariyeriniz ve imajınız baştan ayağa değişiyor.',
      advice: 'Eski sizi geride bırakmaktan korkmayın; bu sizin kadersel yeniden doğuşunuz.',
    },
    lunar_eclipse: {
      title: '1. Ev: Eski Kimliğin Kadersel Vedası',
      personalImpact: 'Size artık dar gelen eski alışkanlıklar ve roller kadersel olarak sonlanıyor.',
      advice: 'Yitirdiklerinizin yasını tutmak yerine açılan temiz sayfaya odaklanın.',
    },
  },
  2: {
    new_moon: {
      title: '2. Ev: Para, Gelir Kaynakları ve Özdeğer',
      personalImpact: 'Yeni bir kazanç kapısı aralamak, bütçe yapmak ve özsaygınızı yükseltmek için mükemmel zaman.',
      advice: 'Kendi yeteneklerinize güvenerek maddi hedefler belirleyin.',
    },
    full_moon: {
      title: '2. Ev: Maddi Hasat ve Değer Yüzleşmesi',
      personalImpact: 'Beklediğiniz bir para gelebilir veya harcamalarınızı dengelemeniz gereken bir tablo oluşabilir.',
      advice: 'Fevri harcamalardan kaçının, gerçek değerinizi parayla ölçmeyin.',
    },
    solar_eclipse: {
      title: '2. Ev: Finansal Hayatınızda 6 Aylık Kadersel Sıçrama',
      personalImpact: 'Önümüzdeki 6 ay boyunca gelir modeliniz, maaşınız veya mülkleriniz kökten dönüşebilir.',
      advice: 'Geleceğinizi güvence altına alacak akılcı yatırımlara yönelin.',
    },
    lunar_eclipse: {
      title: '2. Ev: Maddi Bağımlılıkların ve Kaygıların Sonu',
      personalImpact: 'Sizi tüketen maddi borçlar veya parasal korkular kadersel bir çözümle geride kalıyor.',
      advice: 'Bolluğun sizin doğal hakkınız olduğunu hatırlayın.',
    },
  },
  3: {
    new_moon: {
      title: '3. Ev: İletişim, Eğitim, Yakın Çevre ve Ticaret',
      personalImpact: 'Yeni bir eğitime başlamak, sözleşme imzalamak veya bir dijital projeyi hayata geçirmek için harika.',
      advice: 'Fikirlerinizi açıkça paylaşın; kardeşler ve yakın çevreyle bağları tazeleyin.',
    },
    full_moon: {
      title: '3. Ev: Bir Kararın Netleşmesi ve Zihinsel Hasat',
      personalImpact: 'Uzun süredir düşündüğünüz bir fikri nihai karara bağlayabilir, beklediğiniz bir haberi alabilirsiniz.',
      advice: 'Trafikte ve mesajlaşmalarda sakin kalın; kelimelerinizi özenle seçin.',
    },
    solar_eclipse: {
      title: '3. Ev: Zihinsel Vizyonda 6 Aylık Kadersel Atılım',
      personalImpact: 'Önümüzdeki 6 ay boyunca medya, ticaret, yazarlık veya yeni bir çevre konusunda kadersel bir kapı açılıyor.',
      advice: 'Sözünüzün gücünü keşfedin ve bilgiyi yaymaktan çekinmeyin.',
    },
    lunar_eclipse: {
      title: '3. Ev: Yanıltıcı Bilgiler ve Çevre Temizliği',
      personalImpact: 'Size faydası olmayan dedikoducu ilişkiler ve gereksiz zihinsel karmaşalar kadersel olarak eleniyor.',
      advice: 'Zihinsel detoks yapın, gerçeği çarpıtan insanlarla mesafenizi koruyun.',
    },
  },
  4: {
    new_moon: {
      title: '4. Ev: Yuva, Aile, Ev ve Kökler',
      personalImpact: 'Evinizi yenilemek, taşınmak veya ailevi meselelerde huzurlu yeni bir sayfa açmak için ideal.',
      advice: 'Evinizi arındırın ve kalbinizi dinlendirecek sıcak bir alan yaratın.',
    },
    full_moon: {
      title: '4. Ev: Ailevi Netleşmeler ve İçsel Denge',
      personalImpact: 'Ev veya mülk konularında bir sonuca ulaşabilir, aile büyükleriyle önemli bir konuyu çözebilirsiniz.',
      advice: 'Kariyer ve ev dengesini gözetin; duygularınızı bastırmayın.',
    },
    solar_eclipse: {
      title: '4. Ev: Ev ve Ailede 6 Aylık Kadersel Dönüm Noktası',
      personalImpact: 'Önümüzdeki 6 ay mülk edinme, şehir/ülke değiştirme veya ailevi yapıda köklü kadersel değişimler getirebilir.',
      advice: 'Köklerinizi sağlamlaştırın; ait olduğunuz yeri yeniden tanımlayın.',
    },
    lunar_eclipse: {
      title: '4. Ev: Geçmişin Prangalarından Kurtuluş',
      personalImpact: 'Ata karması, çocukluk travmaları veya sizi kısıtlayan ailevi kalıplar kadersel olarak şifalanıyor.',
      advice: 'Affedin ve serbest bırakın; kendi özgür yuvanızı kurun.',
    },
  },
  5: {
    new_moon: {
      title: '5. Ev: Aşk, Yaratıcılık, Çocuklar ve Hobiler',
      personalImpact: 'Kalbinizi yeni bir aşka açmak, sanatsal bir üretime başlamak ve hayatın tadını çıkarmak için en neşeli evre.',
      advice: 'İçinizdeki çocuğu serbest bırakın; eğlenmeyi kendinize hak görün.',
    },
    full_moon: {
      title: '5. Ev: Aşkta Doruk Noktası ve Yaratıcı Hasat',
      personalImpact: 'Bir flörtün adı konabilir veya yaratıcı bir eseriniz tamamlanıp görünürlük kazanabilir.',
      advice: 'Aşkta aşırı dramadan kaçının; kalpten gelen samimiyete tutunun.',
    },
    solar_eclipse: {
      title: '5. Ev: Aşk ve Tutkularda 6 Aylık Kadersel Kıvılcım',
      personalImpact: 'Önümüzdeki 6 ay hayatınızın aşkıyla tanışabilir, çocuk sahibi olabilir veya büyük bir yeteneğinizi kariyere dönüştürebilirsiniz.',
      advice: 'Işığınızı parlatmaktan çekinmeyin; sahne sizin.',
    },
    lunar_eclipse: {
      title: '5. Ev: Sahte Heveslerin Kadersel Sonu',
      personalImpact: 'Sizi sadece oyalayan, derinliği olmayan flörtler ve riskli spekülasyonlar kadersel olarak sonlanıyor.',
      advice: 'Gerçek tutkunun peşinden gidin; vadesi dolmuş eğlenceleri bırakın.',
    },
  },
  6: {
    new_moon: {
      title: '6. Ev: Sağlık, Günlük Rutinler ve İş Ortamı',
      personalImpact: 'Sağlıklı bir beslenme/spor programına başlamak ve çalışma düzeninizi verimli kılmak için ideal.',
      advice: 'Bedeninizin sinyallerini dinleyin; küçük adımlarla büyük disiplin kurun.',
    },
    full_moon: {
      title: '6. Ev: Çalışma Koşullarında Netleşme ve Sağlık Şifası',
      personalImpact: 'Süren bir iş projesinin teslimi veya bir sağlık tedavisinin olumlu tamamlanması gündeme gelebilir.',
      advice: 'Tükenmişlik hissine teslim olmayın; dinlenmeyi ihmal etmeyin.',
    },
    solar_eclipse: {
      title: '6. Ev: Meslek ve Sağlıkta 6 Aylık Kadersel Dönüşüm',
      personalImpact: 'Önümüzdeki 6 ay boyunca çalışma ortamınız, ekibiniz veya yaşam tarzınız köklü biçimde iyileşecek.',
      advice: 'Bedeninizi kutsal bir mabet olarak görün ve hizmet alanınızı genişletin.',
    },
    lunar_eclipse: {
      title: '6. Ev: Yıpratıcı İş Yüklerinin Kadersel Bitişi',
      personalImpact: 'Sizi sömüren angaryalar, toksik çalışma ortamları veya sağlıksız alışkanlıklar kadersel olarak devreden çıkıyor.',
      advice: 'Hayır demeyi öğrenin; sınırlarınızı koruyun.',
    },
  },
  7: {
    new_moon: {
      title: '7. Ev: İkili İlişkiler, Evlilik ve Ortaklıklar',
      personalImpact: 'Yeni bir ortaklık kurmak, ciddi bir ilişkiye adım atmak veya danışmanlık almak için güçlü bir kapı.',
      advice: 'Karşı tarafı can kulağıyla dinleyin; eşitlik ve adalet temelinde birleşin.',
    },
    full_moon: {
      title: '7. Ev: İlişkilerde Tamamlanma veya Yol Ayrımı',
      personalImpact: 'İkili ilişkilerinizde yüzleşmeler, ilişkinin seviye atlaması ya da miadı dolduysa medeni bir kapanış anı.',
      advice: 'Haklı olmaya değil, huzurlu olmaya odaklanın.',
    },
    solar_eclipse: {
      title: '7. Ev: Evlilik ve Ortaklıklarda 6 Aylık Kadersel İttifak',
      personalImpact: 'Önümüzdeki 6 ay boyunca kadersel bir evlilik, hayat ortağıyla buluşma veya devasa bir iş birliği sizi bekliyor.',
      advice: 'Birlikte büyümeye hazır olun; yalnızlık perdesi aralanıyor.',
    },
    lunar_eclipse: {
      title: '7. Ev: Toksik ve Karşılıksız Bağların Kadersel Sonu',
      personalImpact: 'Sizi aşağı çeken, saygının bittiği her türlü ilişki ve ortaklık kadersel olarak hayatınızdan temizleniyor.',
      advice: 'Bırakın gitsinler; boşalan yere hakkınız olan gerçek sevgi gelecektir.',
    },
  },
  8: {
    new_moon: {
      title: '8. Ev: Ortak Finans, Dönüşüm, Miras ve Okültizm',
      personalImpact: 'Kredi, borç yapılandırma, pasif gelir kapıları ve derin psikolojik şifa için dönüştürücü bir evre.',
      advice: 'Bilinçaltı korkularınızla yüzleşin; gücünüzü geri alın.',
    },
    full_moon: {
      title: '8. Ev: Finansal Düğümlerin Çözülmesi ve Simya',
      personalImpact: 'Beklenen bir miras, nafaka, kredi veya ortak para konusu netleşebilir. Derin bir kriz fırsata dönüşür.',
      advice: 'Gizli gerçeklerin aydınlanmasına direnmeyin; akışa teslim olun.',
    },
    solar_eclipse: {
      title: '8. Ev: Finansal ve Ruhsal 6 Aylık Büyük Dönüşüm',
      personalImpact: 'Önümüzdeki 6 ay boyunca eşinizin geliri, yatırımlarınız ve ruhsal güçlerinizde kadersel bir metamorfoz yaşanacak.',
      advice: 'Küllerinizden yeniden doğmaya hazır olun.',
    },
    lunar_eclipse: {
      title: '8. Ev: Borçların ve Duygusal Prangaların Sonu',
      personalImpact: 'Ağır bir borcun kapanması veya yıllardır süren bir bağımlılığın kadersel olarak yok olması.',
      advice: 'Hafiflediğinizi hissedin; artık özgürsünüz.',
    },
  },
  9: {
    new_moon: {
      title: '9. Ev: Yurt Dışı, Yüksek Öğrenim, İnanç ve Vizyon',
      personalImpact: 'Uzak seyahatler, vize başvuruları, felsefi çalışmalar ve hayatın derin manasını aramak için ilham dolu bir zaman.',
      advice: 'Ufkunuzu genişletin; yeni kültürlere ve fikirlere açık olun.',
    },
    full_moon: {
      title: '9. Ev: Akademik / Hukuki Hasat ve İnanç Netliği',
      personalImpact: 'Bir davanın sonuçlanması, tezin teslimi veya uluslararası bir bağlantının meyve vermesi gündeme gelebilir.',
      advice: 'Önyargılardan uzak durun; evrensel adalet tecelli ediyor.',
    },
    solar_eclipse: {
      title: '9. Ev: Hayat Felsefesinde 6 Aylık Kadersel Sıçrama',
      personalImpact: 'Önümüzdeki 6 ay yurt dışına yerleşme, yüksek akademik kariyer veya ruhsal bir üstatlıkla kadersel açılım getirecek.',
      advice: 'Büyük düşünün; sınırlar sadece zihninizdedir.',
    },
    lunar_eclipse: {
      title: '9. Ev: Dogmaların ve Kurgulanmış İnançların Sonu',
      personalImpact: 'Size dayatılmış sahte inançlar ve boş dogmalar kadersel olarak çöküyor; saf bilgeliğe ulaşıyorsunuz.',
      advice: 'Kendi hakikatinizin rehberi olun.',
    },
  },
  10: {
    new_moon: {
      title: '10. Ev: Kariyer, Toplumsal Statü ve Zirve',
      personalImpact: 'Yeni bir işe başlamak, terfi istemek veya kendi işinizi kurmak için gökyüzünün en güçlü onay zamanı.',
      advice: 'Liderliğinizi ortaya koyun; otoritenizi saygıyla inşa edin.',
    },
    full_moon: {
      title: '10. Ev: Kariyerde Zirve, Görünürlük ve Ödül',
      personalImpact: 'Yılların emeğinin toplum önünde takdir edilmesi, önemli bir projenin başarısı veya unvan değişimi.',
      advice: 'Başarılarınızı kutlayın ama kibre kapılmayın.',
    },
    solar_eclipse: {
      title: '10. Ev: Kariyer ve Hayat Amacında 6 Aylık Kadersel Devrim',
      personalImpact: 'Önümüzdeki 6 ay boyunca mesleğiniz, yöneticilik rolünüz ve toplumdaki yeriniz kadersel olarak baştan yazılacak.',
      advice: 'Kaderinizin çağırdığı sorumluluğu üstlenin; geri adım atmayın.',
    },
    lunar_eclipse: {
      title: '10. Ev: Yanlış Kariyer Hedeflerinin Kadersel Bitişi',
      personalImpact: 'Ruhunuza uymayan bir işi veya sizi tüketen bir unvanı kadersel olarak terk edebilirsiniz.',
      advice: 'Gerçek misyonunuza yer açmak için unvan takıntılarını bırakın.',
    },
  },
  11: {
    new_moon: {
      title: '11. Ev: Gelecek Hayalleri, Dostluklar ve Sosyal Çevre',
      personalImpact: 'Yeni bir sosyal gruba dahil olmak, ortak idealler için birleşmek ve büyük dilekler tutmak için harika bir kapı.',
      advice: 'Geleceğe dair hayallerinizi vizyonlayın; doğru insanlarla bir araya gelin.',
    },
    full_moon: {
      title: '11. Ev: Bir Dileğin Gerçekleşmesi ve Dostluk Sınavı',
      personalImpact: 'Uzun süredir umut ettiğiniz bir dileğiniz somutlaşabilir; dostlarınızın gerçek yüzünü görebilirsiniz.',
      advice: 'Gerçek dostlarınızın kıymetini bilin; samimiyetsiz kalabalıklardan sıyrılın.',
    },
    solar_eclipse: {
      title: '11. Ev: Sosyal Ağlar ve İdeallerde 6 Aylık Kadersel Yükseliş',
      personalImpact: 'Önümüzdeki 6 ay büyük bir topluluğa liderlik edebilir, hayallerinizi gerçekleştirecek kilit bağlantılar kurabilirsiniz.',
      advice: 'Geleceği inşa eden ekibin bir parçası olun.',
    },
    lunar_eclipse: {
      title: '11. Ev: Sahte Çevrelerin ve Boş Hayallerin Sonu',
      personalImpact: 'Sizi sadece çıkarı için arayan arkadaşlar kadersel bir olayla eleniyor. Gerçek dostlar kalıyor.',
      advice: 'Az ve öz insanla yola devam edin.',
    },
  },
  12: {
    new_moon: {
      title: '12. Ev: Bilinçaltı, Ruhsal Arınma, İnziva ve Gizli Güç',
      personalImpact: 'İç dünyanıza çekilmek, meditasyon, terapi ve tüm görünmez bağları şifalandırmak için kutsal bir evre.',
      advice: 'Sessizliğe sığının; rüyalarınızı kaydedin ve ilahi plana teslim olun.',
    },
    full_moon: {
      title: '12. Ev: Gizli Düşmanların ve Sırların Aydınlanması',
      personalImpact: 'Arkanızdan dönen oyunlar veya bastırdığınız korkular açığa çıkar; ilahi koruma altındasınız.',
      advice: 'Korkmayın; açığa çıkan her şey sizi korumak için gün yüzüne çıkıyor.',
    },
    solar_eclipse: {
      title: '12. Ev: Ruhsal Aydınlanmada 6 Aylık Kadersel Uyanış',
      personalImpact: 'Önümüzdeki 6 ay boyunca bilinçaltı blokajlarınız tamamen çözülecek, sezgisel ve medyumik güçleriniz uyanacak.',
      advice: 'Manevi pratiklere ağırlık verin; ilahi akış sizi taşıyor.',
    },
    lunar_eclipse: {
      title: '12. Ev: Karmik Borçların ve İzolasyonun Kadersel Sonu',
      personalImpact: 'Yıllardır süren yalnızlık, kurban psikolojisi ve karmik yükler kadersel olarak sonlanıyor.',
      advice: 'Kafesinizin kapısı açıldı; aydınlığa adım atın.',
    },
  },
};

/**
 * Verilen bir tarihe en yakın ve aktif olan Ay Döngüsü veya Tutulmayı tespit eder.
 */
export function getActiveOrNextLunation(targetDate: Date = new Date()): {
  event: LunationEvent;
  isExactOrActive: boolean;
  statusText: string;
  durationInfo: LunationDurationInfo;
  daysDiff: number;
} {
  const targetTime = targetDate.getTime();
  
  // En yakın olayı bul
  let closestEvent = MOON_PHASES_DATA[0];
  let minDiff = Math.abs(new Date(closestEvent.utcDate).getTime() - targetTime);

  for (const item of MOON_PHASES_DATA) {
    const diff = Math.abs(new Date(item.utcDate).getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestEvent = item;
    }
  }

  const daysDiff = Math.round((new Date(closestEvent.utcDate).getTime() - targetTime) / (1000 * 60 * 60 * 24));
  const durationInfo = LUNATION_DURATIONS[closestEvent.phase];

  // Aktif etki aralığında mı?
  let isExactOrActive = false;
  let statusText = '';

  if (closestEvent.phase === 'solar_eclipse') {
    // Güneş tutulması 6 ay etkilidir (±90 gün civarı)
    isExactOrActive = Math.abs(daysDiff) <= 90;
    statusText = daysDiff === 0 
      ? 'Bugün Gerçekleşiyor (Pik Gün)!' 
      : daysDiff > 0 
        ? `${daysDiff} gün sonra gerçekleşecek (Öncü Tesir Başladı)`
        : `Etkisi Devam Ediyor (${Math.abs(daysDiff)} gün önce gerçekleşti • 6 Ay Sürecek)`;
  } else if (closestEvent.phase === 'lunar_eclipse') {
    isExactOrActive = Math.abs(daysDiff) <= 30;
    statusText = daysDiff === 0 
      ? 'Bugün Gerçekleşiyor (Pik Anı)!' 
      : daysDiff > 0 
        ? `${daysDiff} gün sonra gerçekleşecek (Yoğunlaşma Evresi)`
        : `Etkisi Devam Ediyor (${Math.abs(daysDiff)} gün önce gerçekleşti • 1-3 Ay Yankılanır)`;
  } else {
    // Yeniay veya Dolunay (14 gün etki)
    isExactOrActive = Math.abs(daysDiff) <= 7;
    statusText = daysDiff === 0 
      ? 'Bugün Gerçekleşiyor (Pik Anı)!' 
      : daysDiff > 0 
        ? `${daysDiff} gün sonra gerçekleşecek`
        : `Etkisi Devam Ediyor (${Math.abs(daysDiff)} gün önce gerçekleşti)`;
  }

  return {
    event: closestEvent,
    isExactOrActive,
    statusText,
    durationInfo,
    daysDiff,
  };
}

/**
 * Natal evlere göre olayın hangi evde gerçekleştiğini hesaplar (Placidus / Whole Sign uyumlu)
 */
export function calculateLunationHouse(
  lunationSign: string,
  houses?: Array<{ house: number; sign: string }>
): number {
  if (!houses || houses.length === 0) return 1;

  // Burç eşleşmesine göre evin bulunması
  const matchedHouse = houses.find(h => h.sign.toLowerCase() === lunationSign.toLowerCase());
  return matchedHouse ? matchedHouse.house : 1;
}
