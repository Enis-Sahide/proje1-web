import { generateChart, HumanDesignChart, CenterCode } from '@/utils/HumanDesignEngine';
import moment from 'moment-timezone';
import { CandidateScore } from './RectificationEngine';
import { ASTRO_CITIES, AstroCity } from './AstrologyConstants';

export interface CandidateHDData {
  candidate: CandidateScore;
  dateUtc: Date;
  hdChart: HumanDesignChart;
  cleanType: string;
  cleanAuthority: string;
  cleanProfile: string;
  sunGate: number;
  sunLine: number;
}

export interface DisambiguationOption {
  id: string;
  label: string;
  subLabel?: string;
  description: string;
  favoredCandidateTimes: string[]; // hangi timeStr'ler ile örtüşüyor
  traitKey: string;
  traitValue: string;
}

export interface DisambiguationQuestion {
  id: string;
  category: 'authority' | 'type' | 'profile' | 'center' | 'hermetic' | 'mission';
  categoryLabel: string;
  iconName: string;
  title: string;
  question: string;
  hint: string;
  options: DisambiguationOption[];
}

export interface TriangulationResult {
  hasDisambiguation: boolean;
  questions: DisambiguationQuestion[];
  candidatesData: CandidateHDData[];
}

export interface CandidateEvaluationScore {
  timeStr: string;
  originalScore: number;
  hdMatchScore: number;
  totalTriangulatedScore: number;
  confidencePercent: number;
  isTopMatch: boolean;
  matchedTraits: string[];
  mismatchedTraits: string[];
}

// Güneş Kapıları için Temel Arketip Açıklamaları
const GATE_THEMES: Record<number, { title: string; desc: string }> = {
  1: { title: 'Özgün Yaratıcılık & İlham', desc: 'Kimseye benzemeyen özgün bir ifade biçimiyle sanatsal veya vizyoner bir şeyler üretme arzusu.' },
  2: { title: 'Doğal Yön Bulma & Alıcılık', desc: 'Hayatın sizi doğru zamanda doğru yere taşıyacağına güven duyarak akışta rehberlik alma yetisi.' },
  3: { title: 'Kaostan Düzen Yaratma & Yenilik', desc: 'Karışıklıkların içinden yeni ve taze bir başlangıç çıkarma, inovasyon üretme gücü.' },
  4: { title: 'Cevaplar & Mantıksal Formüller', desc: 'Sorunlara mantıklı çözümler üretme, zihinsel şüpheleri net formüllere dönüştürme.' },
  5: { title: 'Doğal Ritimler & Sabır', desc: 'Kendi doğal alışkanlık ve ritimlerine sadık kalarak doğru zamanı bekleme kabiliyeti.' },
  6: { title: 'Sınırlar, Sürtünme & Samimiyet', desc: 'İlişkilerde kiminle ne kadar yakınlaşacağını seçme ve duygusal sınırları yönetme.' },
  7: { title: 'Geleceğe Rehberlik & Demokratik Liderlik', desc: 'Topluma arkadan sessizce yön veren, halkın onayladığı yapıcı liderlik.' },
  8: { title: 'Kendi Tarzıyla Katkı Sunma', desc: 'Kendi özgünlüğünü sergileyerek başkalarına ilham verme ve topluma katkı koyma.' },
  9: { title: 'Detay Odaklılığı & Küçük Adımlar', desc: 'Büyük resimden ziyade küçük ama kritik ayrıntılara odaklanarak mükemmelleşme.' },
  10: { title: 'Kendini Sevme & Doğallık Yürüyüşü', desc: 'Başkalarının ne düşündüğüne aldırmadan kendi otantik tarzıyla yaşamın içinde yürüme.' },
  11: { title: 'Fikirler & Hikaye Anlatıcılığı', desc: 'Sürekli yeni konseptler, felsefeler ve anlatılar üretme isteği.' },
  12: { title: 'Ketumluk, Dil & Sanatsal İfade', desc: 'Sadece doğru ruh halinde olduğunda konuşup etkileyici ve şiirsel bir etki bırakma.' },
  13: { title: 'Sır Saklayıcı & Geçmişin Dinleyicisi', desc: 'İnsanların gelip en mahrem sırlarını anlattığı güvenilir ve bilge dinleyici rolü.' },
  14: { title: 'Bereket & Yaşam Enerjisiyle Üretim', desc: 'Sevdiği bir işe enerji koyduğunda maddi ve manevi bolluk üretme kapasitesi.' },
  15: { title: 'Aşırılıklar & İnsan Sevgisi', desc: 'Toplumun her kesimini kucaklayan, tekdüzelikten uzak değişken ritimlere açıklık.' },
  16: { title: 'Coşku & Ustalık Becerisi', desc: 'Bir beceriyi tekrar tekrar çalışarak virtuözlük düzeyinde ustalığa ulaştırma coşkusu.' },
  17: { title: 'Görüşler & Gelecek Tasarımı', desc: 'Geleceğe dair yapısal teoriler ve mantıksal argümanlar geliştirme.' },
  18: { title: 'Kusursuzlaştırma & İyileştirme Zekası', desc: 'Neyin bozuk veya kusurlu olduğunu anında fark edip onu daha iyi hale getirme dürtüsü.' },
  19: { title: 'İhtiyaçları Hissetme & Dayanışma', desc: 'Topluluğun temel fiziksel ve duygusal ihtiyaçlarını yüksek bir hassasiyetle sezme.' },
  20: { title: 'Şimdiki Zaman & Anın İçinde Var Olma', desc: 'Geçmiş ya da gelecekte değil, tam şu anın içinde saf farkındalıkla eyleme geçme.' },
  21: { title: 'Kontrol & Kaynak Yönetimi', desc: 'Kendi kaynaklarını, bütçesini ve alanını sıkı biçimde yönetme ve denetleme ihtiyacı.' },
  22: { title: 'Zarafet & Duygusal Açıklık', desc: 'Doğru ruh halindeyken büyüleyici bir nezaket ve sosyal çekim sergileme.' },
  23: { title: 'Özümseme & Karmaşığı Basitleştirme', desc: 'Zor ve anlaşılmaz teorileri herkesin anlayacağı basit cümlelere indirgeme.' },
  24: { title: 'Rasyonelleştirme & Dönüşüm', desc: 'Geçmişteki deneyimleri zihinde tekrar tekrar tartarak derin bir anlayışa ulaşma.' },
  25: { title: 'Evrensel Sevgi & Koşulsuz Masumiyet', desc: 'Hayatın getirdiği tüm yaralara rağmen kalbini dünyaya açık tutma cesareti.' },
  26: { title: 'İkna Gücü & Diplomatik Ustalık', desc: 'En az eforla en büyük etkiyi yaratma ve insanları bir fikre ikna edebilme yeteneği.' },
  27: { title: 'Şefkat, Besleme & Koruma', desc: 'Kendini ve muhtaç olanları koruyup kollama, fedakarca besleme refleksi.' },
  28: { title: 'Anlam Arayışı & Mücadele', desc: 'Hayatta uğruna savaşmaya değer derin bir amaç ve tutku bulma mücadelesi.' },
  29: { title: 'Kendini Adama & Gönüllülük', desc: 'Bir deneyime balıklama atlayıp "evet" diyerek sonuna kadar kendini adama.' },
  30: { title: 'Arzular & Tutkulu Kadercilik', desc: 'Hayatın iniş çıkışlı hislerini derin bir tutku ve arzuyla deneyimleme.' },
  31: { title: 'Öncülük & Toplumsal Ses', desc: 'İnsanların peşinden gittiği ve sesini dinlemek istediği doğal bir sözcülük rolü.' },
  32: { title: 'Süreklilik & Değer Koruma', desc: 'Kültürel veya kurumsal değerlerin zamana direnmesini sağlama zekası.' },
  33: { title: 'Geri Çekilme, Mahremiyet & Anılar', desc: 'Deneyimlerin ardından yalnızlığa çekilip olan biteni sindirme ve ders çıkarma.' },
  34: { title: 'Saf Güç & Bağımsız Enerji', desc: 'Kimseye bağımlı olmadan tek başına devasa işleri sırtlayabilen saf fiziksel güç.' },
  35: { title: 'Değişim & Yeni Deneyim İştahı', desc: 'Aynı şeyleri yaşamaktan sıkılıp sürekli yeni maceralara ve deneyimlere açılma.' },
  36: { title: 'Duygusal Kriz & Şefkatli Deneyim', desc: 'Bilinmeyenin ve krizlerin içine girerek duygusal olgunluğa erişme.' },
  37: { title: 'Aile Bağları, Güven & Anlaşmalar', desc: 'Sözleşmeler ve karşılıklı sadakatle kurulan sıcak aile/topluluk bağları.' },
  38: { title: 'Bireysel Direnç & Savaşçı Ruh', desc: 'Doğru bildiği şey uğruna tüm dünyaya tek başına kafa tutabilme dayanıklılığı.' },
  39: { title: 'Provokasyon & Ruh Halini Harekete Geçirme', desc: 'Durgun enerjileri harekete geçiren, insanları kışkırtarak uyandıran dinamizm.' },
  40: { title: 'Yalnızlık & Topluluğa Hizmet', desc: 'Çok çalışıp topluluğa hizmet ettikten sonra tamamen yalnız kalıp dinlenme ihtiyacı.' },
  41: { title: 'Hayal Gücü & Yeni Döngü Başlatma', desc: 'Kolektif alanda yeni bir rüya veya fantezi tohumu ekerek bir döngü başlatma.' },
  42: { title: 'Döngüleri Tamamlama & Bitişler', desc: 'Başlanan projeleri ve süreçleri layıkıyla sonuca ulaştırma enerjisi.' },
  43: { title: 'İçgörü & Bireysel Deha', desc: 'Kimsenin düşünmediği sıra dışı fikirleri aniden kavrama ("Buldum!" anı).' },
  44: { title: 'Uyanıklık & Geçmiş Kalıpları Hatırlama', desc: 'İnsanların geçmişteki hatalarını ve niyetlerini sezgisel bir koku gibi anlama.' },
  45: { title: 'Egemenlik & Topluluk Lideri', desc: 'Kaynakları elinde tutarak topluluğu koruyan ve yöneten kral/kraliçe arketipi.' },
  46: { title: 'Beden Sevgisi & Şans', desc: 'Bedeninde tamamen rahat hissederek hayatın tesadüflerinde doğru zamanda doğru yerde olma.' },
  47: { title: 'Baskı Altında Anlam Çıkarma', desc: 'Geçmişin kafa karışıklıklarını çözüp aydınlığa kavuşturma çabası.' },
  48: { title: 'Derin Bilgelik & Çözüm Havuzu', desc: 'Yüzeyin altında saklı duran derin teknik veya felsefi bilgi kaynağı.' },
  49: { title: 'İlkeler & Devrimci Dönüşüm', desc: 'İlkelerine ters düşen durumları hayatından kökten kesip atabilme kararlılığı.' },
  50: { title: 'Değerler, Ahlak & Koruyuculuk', desc: 'Toplumsal kuralları, etiği ve sevdiklerini koruma sorumluluğu.' },
  51: { title: 'Şok Etme & Cesaretle İlk Adım', desc: 'Beklenmedik krizlerle insanları sarsma ve cesaretle bilinmeyene atılma.' },
  52: { title: 'Hareketsizlik & Dağ Gibi Odaklanma', desc: 'Sakinleşip hareketsiz kalarak saatlerce bir işin başında derin odaklanma.' },
  53: { title: 'Gelişim & Yeni Başlangıç Baskısı', desc: 'Sürekli yeni projelere ve serüvenlere başlama arzusu.' },
  54: { title: 'Hırs & Yükselme Dürtüsü', desc: 'Maddi ve manevi merdivenleri tırmanarak en tepeye ulaşma isteği.' },
  55: { title: 'Ruh Hali & Bolluk Bilinci', desc: 'Melankoli ile coşku arasındaki iniş çıkışlarda hayatın duygusal derinliğini tatma.' },
  56: { title: 'Gezginlik, Deneyimler & Hikayeler', desc: 'Dünyayı gezip görerek topladığı anıları başkalarına anlatarak etkileme.' },
  57: { title: 'Sezgisel Netlik & Berrak Kulak', desc: 'Bilinmeyenin içindeki en ufak titreşimi saniyeler öncesinden sezebilme.' },
  58: { title: 'Yaşama Sevinci & Kusursuzluk İsteği', desc: 'Hayatı daha keyifli ve kusursuz kılmak için coşkulu bir eleştirel enerji.' },
  59: { title: 'Engelleri Yıkma & Samimiyet Kurma', desc: 'İnsanlar arasındaki yabancılık duvarlarını hızla eritip yakınlık kurma.' },
  60: { title: 'Sınırlılıkları Kabul & Mutasyon', desc: 'Mevcut sınırları kabul ederek o sınırlar içinden mucizevi bir sıçrama yaratma.' },
  61: { title: 'Evrensel Gizemler & İçsel Hakikat', desc: 'Varoluşun ve bilinmeyenin sırlarına karşı bastırılamaz bir merak duyma.' },
  62: { title: 'Detaylar & İsimlendirme Gücü', desc: 'Gözlemleri net isimler, kelimeler ve gerçeklerle somutlaştırma yeteneği.' },
  63: { title: 'Şüphe & Mantıksal Sorgulama', desc: 'Her şeyi peşinen kabul etmeyip mantıklı bir kanıt görene kadar sorgulama.' },
  64: { title: 'Görsel Hayal Gücü & Olasılıklar', desc: 'Zihinde zengin görüntüler ve olasılıklar canlandırarak anlam arayışı.' }
};

/**
 * Aday doğum saatlerini alır ve daima 5-6 soru üreten derinlemesine
 * Human Design & Hermetik Triangülasyon analizini oluşturur.
 */
export function generateTriangulationQuestions(
  candidates: CandidateScore[],
  birthDateStr: string,
  birthCity: string | AstroCity
): TriangulationResult {
  if (!candidates || candidates.length < 2) {
    return {
      hasDisambiguation: false,
      questions: [],
      candidatesData: []
    };
  }

  const cityName = typeof birthCity === 'string' ? birthCity : (birthCity && typeof birthCity === 'object' ? birthCity.name : 'İstanbul');
  const city = ASTRO_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase()) || ASTRO_CITIES[0];
  const tzName = city.tz || 'Europe/Istanbul';

  const topCands = candidates.slice(0, 4);

  const candidatesData: CandidateHDData[] = topCands.map(cand => {
    const timeStrPadded = `${String(cand.hour).padStart(2, '0')}:${String(cand.minute).padStart(2, '0')}:${String(cand.second || 0).padStart(2, '0')}`;
    const m = moment.tz(`${birthDateStr} ${timeStrPadded}`, tzName);
    const dateUtc = m.toDate();
    const hdChart = generateChart(dateUtc);

    let cleanType = hdChart.type;
    let cleanAuthority = hdChart.authority;
    if (cleanAuthority.includes('(')) {
      cleanAuthority = cleanAuthority.split('(')[0].trim();
    }

    const sunAct = hdChart.conscious.find(p => p.planet === 'Sun');

    return {
      candidate: cand,
      dateUtc,
      hdChart,
      cleanType,
      cleanAuthority,
      cleanProfile: hdChart.profile,
      sunGate: sunAct ? sunAct.gate : 1,
      sunLine: sunAct ? sunAct.line : 1
    };
  });

  const questions: DisambiguationQuestion[] = [];

  // ========================================================
  // 1. SORU: İÇ OTORİTE & KARAR MEKANİZMASI
  // ========================================================
  const authoritiesMap = new Map<string, string[]>();
  candidatesData.forEach(cd => {
    const auth = cd.cleanAuthority;
    if (!authoritiesMap.has(auth)) authoritiesMap.set(auth, []);
    authoritiesMap.get(auth)!.push(cd.candidate.timeStr);
  });

  const authOptions: DisambiguationOption[] = [];
  authoritiesMap.forEach((times, auth) => {
    let label = '';
    let subLabel = '';
    let description = '';

    if (auth.toLowerCase().includes('sakral')) {
      label = 'Anlık Karın Sezgisi (Sakral Tepki)';
      subLabel = 'İçimden bir "uh-huh / evet" ya da "ı-ıh / hayır" sesi yükselir';
      description = 'Karar verirken zihnimle analiz yapmak yerine, teklif veya durum karşısında karnımdan yükselen anlık onay/ret enerjisine güvenirim. Çabuk netleşirim.';
    } else if (auth.toLowerCase().includes('duygusal')) {
      label = 'Duygusal Dalga & Zamana Bırakma (Solar Pleksus)';
      subLabel = 'Anında karar vermemem gerekir, üstüne uyumam şarttır';
      description = 'Anlık heyecanla veya moral bozukluğuyla karar verirsem pişman olurum. Duygu dalgamın yükselip durulmasını bekler, ertesi gün sakinleştiğimde netleşirim.';
    } else if (auth.toLowerCase().includes('dalak')) {
      label = 'Anlık Spontane Sezgi (Dalak / İçgüdü)';
      subLabel = 'Saniyelik bir beden ürpertisi veya içsel fısıltı';
      description = 'Kararlarım saniyelik bir koku alma veya anlık tehlike sezgisi gibidir. Mantığa sığmaz ama bedenim tehlikeyi veya doğruyu anında bilir.';
    } else if (auth.toLowerCase().includes('ego') || auth.toLowerCase().includes('kalp')) {
      label = 'İrade Gücü & Kalp Taahhüdü (Ego)';
      subLabel = 'Bu bana ve sevdiklerime ne kazandıracak?';
      description = 'Kararlarımda irademin gücü ve verdiğim söze sadık kalabilme kapasitem belirleyicidir. Gerçekten kalbimin istediği şeylere söz veririm.';
    } else if (auth.toLowerCase().includes('kendinden') || auth.toLowerCase().includes('g') || auth.toLowerCase().includes('benlik')) {
      label = 'Sesli Konuşma & Kimlik Netliği (Benlik / G)';
      subLabel = 'Fikrimi yüksek sesle birine anlatırken netleşirim';
      description = 'Karar anlarında kendimi dinlemem gerekir. Güvendiğim birine durumu anlatırken kendi ağzımdan çıkan cümleler bana doğru yolu gösterir.';
    } else {
      label = 'Çevresel / Zihinsel Netleşme & Ortam Uyumu';
      subLabel = 'Doğru ortamda bulunarak ve zaman tanıyarak netleşme';
      description = 'Karar verirken etrafımdaki alanın enerjisi çok önemlidir. Güvendiğim insanlarla tartışarak doğruya ulaşırım.';
    }

    authOptions.push({
      id: `auth_${auth.toLowerCase().replace(/\s+/g, '_')}`,
      label,
      subLabel,
      description,
      favoredCandidateTimes: times,
      traitKey: 'authority',
      traitValue: auth
    });
  });

  // Eğer tüm adaylar aynı otoriteye sahipse, karşılaştırma için zıt arketipi de ekle
  if (authoritiesMap.size === 1) {
    const existingAuth = Array.from(authoritiesMap.keys())[0];
    if (existingAuth.toLowerCase().includes('sakral')) {
      authOptions.push({
        id: 'auth_alt_emotional',
        label: 'Duygusal Dalgalanma & Bekleme İhtiyacı',
        subLabel: 'Asla anında karar veremem, üstüne uyumam gerekir',
        description: 'Kararlarımda anlık hisler yanıltıcıdır; birkaç gün bekleyip sakin kafayla karar alırım.',
        favoredCandidateTimes: [],
        traitKey: 'authority',
        traitValue: 'emotional_alt'
      });
    } else {
      authOptions.push({
        id: 'auth_alt_sacral',
        label: 'Anlık Karın Onayı (Sakral Hız)',
        subLabel: 'Beklemeye tahammülüm yoktur, karnım anında yanıt verir',
        description: 'Düşünmeden doğrudan bedenimin enerjisiyle yanıt veririm.',
        favoredCandidateTimes: [],
        traitKey: 'authority',
        traitValue: 'sacral_alt'
      });
    }
  }

  questions.push({
    id: 'q_authority',
    category: 'authority',
    categoryLabel: 'İç Otorite & Karar Mekanizması',
    iconName: 'Compass',
    title: 'Hayatınızda En Doğru ve Pişman Olmadığınız Kararları Nasıl Alırsınız?',
    question: 'Aday doğum saatlerinizin iç otorite rezonansını belirleyiniz:',
    hint: 'Bu soru aday saatlerinizin Solar Pleksus ve Sakral merkezlerinin aktiflik anını kilitler.',
    options: authOptions
  });

  // ========================================================
  // 2. SORU: PROFİL & YAŞAM ROLÜ (Lines)
  // ========================================================
  const profilesMap = new Map<string, string[]>();
  candidatesData.forEach(cd => {
    const prof = cd.cleanProfile;
    if (!profilesMap.has(prof)) profilesMap.set(prof, []);
    profilesMap.get(prof)!.push(cd.candidate.timeStr);
  });

  const profOptions: DisambiguationOption[] = [];
  profilesMap.forEach((times, prof) => {
    let label = `Profil ${prof}`;
    let subLabel = '';
    let description = '';

    if (prof === '1/3') {
      label = 'Profil 1/3: Araştırmacı & Deneyci (Sağlam Temel)';
      subLabel = 'Önce derinlemesine öğrenir, sonra deneme-yanılmayla pratikleşirim';
      description = 'Bir konuya girmeden önce kendimi güvende hissetmek için detayları ve temelleri hatmederim. Neyin çalışıp neyin çalışmadığını bizzat deneyerek, hatalarımdan öğrenerek keşfederim.';
    } else if (prof === '1/4') {
      label = 'Profil 1/4: Araştırmacı & Fırsatçı (Networker)';
      subLabel = 'Derin uzmanlık bilgimi sadece yakın dostlarımla ve güvendiğim çevreyle paylaşırım';
      description = 'Temeli sağlam kurmaya çok önem veririm ancak en büyük adımlarım ve fırsatlarım daima kendi güvenli dost/arkadaş çevrem üzerinden gelir.';
    } else if (prof === '2/4') {
      label = 'Profil 2/4: Münzevi & Fırsatçı (Doğal Yetenek)';
      subLabel = 'Kendi kabuğumda üretmeyi severim; başkaları beni "bu işte çok iyisin" diye çağırır';
      description = 'Yalnız kaldığımda çok verimliyimdir. Kendimi pazarlamaktan hoşlanmam; arkadaşlarım ve çevremin beni fark edip sahneye çağırmasıyla parlarım.';
    } else if (prof === '3/5') {
      label = 'Profil 3/5: Deneyci & Evrensel Çözücü (Kriz Savar)';
      subLabel = 'Hayatım deneme-yanılmalarla doludur; insanlar benden pratik kriz çözümleri bekler';
      description = 'Teorilere pek inanmam, sahada bizzat çarpışarak öğrenirim. İnsanlar zora düştüğünde beni bir kurtarıcı veya vizyoner gibi görür, onlara pratik çözümler sunarım.';
    } else if (prof === '4/6') {
      label = 'Profil 4/6: Fırsatçı (Networker) & Rol Modeli';
      subLabel = 'Kaderim dost çevreleri üzerinden akar; hayatımın evreleri (gençlik vs olgunluk) çok farklıdır';
      description = 'Fırsatlar yabancılardan değil, yakın dostluklardan doğar. Gençlikte çok deneme yapıp yorulmuş olsam da yaş ilerledikçe tarafsız, bilge bir gözlemci ve rol modeli haline gelirim.';
    } else if (prof === '5/1') {
      label = 'Profil 5/1: Evrensel Kurtarıcı & Derin Araştırmacı';
      subLabel = 'Yabancılar bana yüksek beklentiler yükler; bu beklentiyi derin bilgiyle karşılarım';
      description = 'Tanımadığım insanlar bile bana güvenip krizlerini çözmemi bekler. Hayal kırıklığı yaratmamak için konunun temeline en sağlam şekilde hakim olurum.';
    } else if (prof === '6/2') {
      label = 'Profil 6/2: Bilge Rol Modeli & Doğal Yetenek';
      subLabel = 'Uzaktan dünyayı izleyen yüksek standartlı bir gözlemci; kendi alanımda sessiz üstat';
      description = 'Hayata yüksek bir tepeden bakar gibi tarafsız bakarım. Sahtelikten ve vasatlıktan uzak durur, kendi kabuğumda mükemmelleşirim.';
    } else {
      label = `Profil ${prof}: Özgün Hayat Çizgisi`;
      subLabel = 'Kişilik ve beden bilincinizin hayattaki özgün ifadesi';
      description = `Bu profil kombinasyonu (${prof}), hayatınızdaki öğrenme, ilişkilenme ve toplumsal misyonunuzun özgün çizgisini temsil eder.`;
    }

    profOptions.push({
      id: `prof_${prof.replace('/', '_')}`,
      label,
      subLabel,
      description,
      favoredCandidateTimes: times,
      traitKey: 'profile',
      traitValue: prof
    });
  });

  if (profilesMap.size === 1) {
    profOptions.push({
      id: 'prof_alt_networker',
      label: 'Alternatif: Sosyal Network & Çevre Odaklı Rol (4. Çizgi)',
      subLabel: 'Fırsatlar bana sadece arkadaşlarım ve yakın çevremin davetleriyle gelir',
      description: 'Yabancılarla ilişki kurmak yerine kendi güvenli çevre ağımın içinde var olmayı tercih ederim.',
      favoredCandidateTimes: [],
      traitKey: 'profile',
      traitValue: 'alt_networker'
    });
  }

  questions.push({
    id: 'q_profile',
    category: 'profile',
    categoryLabel: 'Human Design Yaşam Profili (Lines)',
    iconName: 'Sparkles',
    title: 'Hayatı Deneyimleme, Öğrenme ve Sosyal Rolünüz Hangisine Daha Yakın?',
    question: 'Aday saatleriniz Güneş ve Dünya çizgilerini (Profile Lines) şekillendirmektedir:',
    hint: 'Bu soru doğum anınızdaki Güneş çizgisi kırılımını kesinleştirerek dakikayı daraltır.',
    options: profOptions
  });

  // ========================================================
  // 3. SORU: ENERJİ TİPİ & ÜRETİM RİTMİ
  // ========================================================
  const typesMap = new Map<string, string[]>();
  candidatesData.forEach(cd => {
    const tp = cd.cleanType;
    if (!typesMap.has(tp)) typesMap.set(tp, []);
    typesMap.get(tp)!.push(cd.candidate.timeStr);
  });

  const typeOptions: DisambiguationOption[] = [];
  typesMap.forEach((times, tp) => {
    let label = '';
    let subLabel = '';
    let description = '';

    if (tp === 'Jeneratör') {
      label = 'Saf Jeneratör: Adım Adım İnşa Eden Üretim Gücü';
      subLabel = 'Sevdiğim işe başladığımda enerjim tükenmez, adımları sırayla bitiririm';
      description = 'Doğal bir yaşam motoruna sahibim. Karşıma çıkan işe içten onay verip odaklandığımda saatlerce yorulmadan keyifle üretirim.';
    } else if (tp === 'Manifesting Jeneratör') {
      label = 'Manifesting Jeneratör: Hızlı & Çoklu Görevli (Multi-tasking)';
      subLabel = 'Aynı anda 3-4 işle uğraşırım, bazı adımları atlar hızlıca sonuca koşarım';
      description = 'Sabırsız ve çok hızlı bir enerjiye sahibim. Bir işi yaparken sonraki adımı düşünürüm. Adımları bazen atlar, sonra geri dönüp tamamlarım.';
    } else if (tp === 'Projektör') {
      label = 'Projektör: Rehber & Sistem Yöneticisi';
      subLabel = 'Sürekli fiziksel motorum yoktur; başkalarını verimli yönlendirmede ustayım';
      description = '7/24 iş üreten bir motor değilim. Dinlenmeye çok ihtiyacım var. İnsanların yeteneklerini ve enerjisini dışarıdan bir bilge gibi hemen görürüm.';
    } else if (tp === 'Manifestör') {
      label = 'Manifestör: Bağımsız Başlatıcı & Öncü';
      subLabel = 'Kimseden onay beklemem, aklıma koyduğumu yapar, sadece haber veririm';
      description = 'Sıfırdan başlatma gücüm yüksektir. Kontrol edilmekten hoşlanmam. Ne yapacağımı önceden haber verdiğimde hayatım kolaylaşır.';
    } else {
      label = 'Reflektör: Aynalayıcı & Kolektif Bilinç';
      subLabel = 'Bulunduğum ortamın ve insanların sağlık durumunu yansıtırım';
      description = 'Çevremdeki insanların aurasını sünger gibi çeker ve aynalarım. Tamamen açık ve esnek bir yapıya sahibim.';
    }

    typeOptions.push({
      id: `type_${tp.toLowerCase().replace(/\s+/g, '_')}`,
      label,
      subLabel,
      description,
      favoredCandidateTimes: times,
      traitKey: 'type',
      traitValue: tp
    });
  });

  if (typesMap.size === 1) {
    const existingType = Array.from(typesMap.keys())[0];
    if (existingType.includes('Jeneratör')) {
      typeOptions.push({
        id: 'type_alt_projector',
        label: 'Projektör Tarzı: Az Efor, Yüksek Rehberlik & Dinlenme İhtiyacı',
        subLabel: 'Fiziksel iş üretmek yerine başkalarına rehberlik etmek beni daha çok doyurur',
        description: 'Sürekli çalışmak beni tüketir; takdir edildiğimde ve davet aldığımda parlarım.',
        favoredCandidateTimes: [],
        traitKey: 'type',
        traitValue: 'alt_projector'
      });
    } else {
      typeOptions.push({
        id: 'type_alt_generator',
        label: 'Tükenmeyen Günlük İş Gücü & Yanıt Verme',
        subLabel: 'Fiziksel olarak çok üretkenim, enerjimi gün boyu harcamayı severim',
        description: 'Yorulmadan saatlerce bir işin üstünde çalışabilen güçlü bir motora sahibim.',
        favoredCandidateTimes: [],
        traitKey: 'type',
        traitValue: 'alt_generator'
      });
    }
  }

  questions.push({
    id: 'q_type',
    category: 'type',
    categoryLabel: 'Enerji Tipi & Çalışma / Üretim Ritmi',
    iconName: 'Zap',
    title: 'Günlük Hayattaki Üretim Gücünüz ve Enerji Akışınız Nasıl İşler?',
    question: 'Aday saatlerinizin Sakral motoru ve Boğaz merkezi bağlantısını belirleyiniz:',
    hint: 'Bu ayrım doğum saatinizde Boğaz merkezine motor bağlanıp bağlanmadığını netleştirir.',
    options: typeOptions
  });

  // ========================================================
  // 4. SORU: BEDEN KİMYASI, STRES & KORKU FİLTRESİ (MERKEZLER)
  // ========================================================
  const centersToCheck: CenterCode[] = ['Spleen', 'Heart', 'SolarPlexus', 'Root'];
  let chosenCenterCode: CenterCode = 'Spleen';

  for (const cCode of centersToCheck) {
    const withC = candidatesData.filter(cd => cd.hdChart.definedCenters.includes(cCode)).length;
    if (withC > 0 && withC < candidatesData.length) {
      chosenCenterCode = cCode;
      break;
    }
  }

  const withCenterTimes = candidatesData.filter(cd => cd.hdChart.definedCenters.includes(chosenCenterCode)).map(cd => cd.candidate.timeStr);
  const withoutCenterTimes = candidatesData.filter(cd => !cd.hdChart.definedCenters.includes(chosenCenterCode)).map(cd => cd.candidate.timeStr);

  let centerCategoryLabel = 'Dalak (Beden Sezgisi & Korku Filtresi)';
  let centerDefLabel = 'İstikrarlı Sağlık & Korkusuz Beden Sezgisi (Tanımlı Dalak)';
  let centerDefDesc = 'Kolay kolay hastalanmam veya neyin iyi gelip gelmeyeceğini anında bilirim. Başkalarının kaygıları beni paniğe sürüklemez.';
  let centerOpenLabel = 'Hassas Beden & Başkalarının Korkularını Hissetme (Açık Dalak)';
  let centerOpenDesc = 'Hastanelerin, kalabalıkların veya endişeli insanların gerginliğini sünger gibi çekerim. Zararlı olan şeyleri bırakmakta zorlanabilirim.';

  if (chosenCenterCode === 'Heart') {
    centerCategoryLabel = 'Kalp / Ego (İrade Gücü & Taahhüt)';
    centerDefLabel = 'Sabit Çelik İrade & Sözünü Kolayca Tutma (Tanımlı Kalp)';
    centerDefDesc = 'Bir şeye söz verdiğimde irademle yaparım. Kendimi kimseye ispatlama baskısı hissetmem.';
    centerOpenLabel = 'Dalgalı İrade & Değerini Kanıtlama Hırsı (Açık Kalp)';
    centerOpenDesc = 'İradem sabit çalışmaz, zorlama hedefler beni tüketir. İnsanlara değerimi kanıtlama baskısı hissederim.';
  } else if (chosenCenterCode === 'Root') {
    centerCategoryLabel = 'Kök Merkezi (Zaman Baskısı & Adrenalin)';
    centerDefLabel = 'Adrenalin Baskısıyla Kolayca Başa Çıkma (Tanımlı Kök)';
    centerDefDesc = 'Son teslim tarihleri beni felç etmez, baskı altında gayet odaklı ve sağlam çalışırım.';
    centerOpenLabel = 'Sürekli Acele Etme & Stresi Üzerinde Taşıma (Açık Kök)';
    centerOpenDesc = 'Üzerimde iş varken rahat oturamam; bir an önce bitirip özgür kalmak için acele eder, başkalarının telaşını üstüme alırım.';
  }

  questions.push({
    id: `q_center_${chosenCenterCode.toLowerCase()}`,
    category: 'center',
    categoryLabel: centerCategoryLabel,
    iconName: 'ShieldAlert',
    title: `Bedeninizdeki ${centerCategoryLabel} Dinamiği`,
    question: `Aday saatlerinizde bu enerji merkezinin açık veya tanımlı olma durumu test edilmektedir:`,
    hint: 'Bu soru Ay\'ın o saat aralığında kapattığı kanalları doğrudan doğrular.',
    options: [
      {
        id: `center_${chosenCenterCode}_def`,
        label: centerDefLabel,
        description: centerDefDesc,
        favoredCandidateTimes: withCenterTimes,
        traitKey: `center_${chosenCenterCode}`,
        traitValue: 'defined'
      },
      {
        id: `center_${chosenCenterCode}_open`,
        label: centerOpenLabel,
        description: centerOpenDesc,
        favoredCandidateTimes: withoutCenterTimes,
        traitKey: `center_${chosenCenterCode}`,
        traitValue: 'open'
      }
    ]
  });

  // ========================================================
  // 5. SORU: HERMETİK YÜKSELEN BURÇ & DIŞ DÜNYAYA İLK İZLENİM
  // ========================================================
  const ascMap = new Map<string, string[]>();
  candidatesData.forEach(cd => {
    const s = cd.candidate.ascSign;
    if (!ascMap.has(s)) ascMap.set(s, []);
    ascMap.get(s)!.push(cd.candidate.timeStr);
  });

  const ascOptions: DisambiguationOption[] = [];
  ascMap.forEach((times, sign) => {
    let sub = `Yükselen ${sign} Ekseni`;
    let desc = `Dış dünyaya verdiğiniz ilk izlenim, fiziksel beden diliniz ve hayata ilk adım atış refleksiniz ${sign} burcunun dinamiklerini yansıtır.`;

    if (['Koç', 'Aslan', 'Yay'].includes(sign)) {
      sub = `Yükselen ${sign} (Ateş Mizaç): Cesur, Doğrudan ve Heyecanlı`;
      desc = 'Bir odaya girdiğinizde enerjiniz hemen hissedilir. Açık sözlü, doğrudan harekete geçen ve beklemekten hoşlanmayan canlı bir ilk izlenim bırakırsınız.';
    } else if (['Boğa', 'Başak', 'Oğlak'].includes(sign)) {
      sub = `Yükselen ${sign} (Toprak Mizaç): Güvenilir, Ayakları Yere Basan ve Vakur`;
      desc = 'İlk izlenimde temkinli, güvenilir, sakin ve saygı uyandıran bir duruş sergilersiniz. Boş laftan ziyade somut duruşunuzla ağırlığınızı hissettirirsiniz.';
    } else if (['İkizler', 'Terazi', 'Kova'].includes(sign)) {
      sub = `Yükselen ${sign} (Hava Mizaç): Zeki, İletişimci ve Sosyal`;
      desc = 'Gözlemci, meraklı, konuşkan veya zarif bir auranız vardır. İnsanlarla hızla zihinsel frekans tutturabilir, tarafsız ve arkadaş canlısı görünürsünüz.';
    } else if (['Yengeç', 'Akrep', 'Balık'].includes(sign)) {
      sub = `Yükselen ${sign} (Su Mizaç): Sezgisel, Derin ve Korunaklı`;
      desc = 'Ortama ilk girdiğinizde hemen açılmazsınız; önce enerjiyi sezer, insanları tartarsınız. Bakışlarınız derin ve auranız gizemli/korunaklıdır.';
    }

    ascOptions.push({
      id: `asc_${sign.toLowerCase()}`,
      label: `Yükselen ${sign}`,
      subLabel: sub,
      description: desc,
      favoredCandidateTimes: times,
      traitKey: 'ascSign',
      traitValue: sign
    });
  });

  questions.push({
    id: 'q_ascendant',
    category: 'hermetic',
    categoryLabel: 'Hermetik Yükselen & İlk İzlenim Maskesi',
    iconName: 'Award',
    title: 'Dış Dünyaya Verdiğiniz İlk İzlenim ve Ortama Giriş Refleksiniz',
    question: 'Aday saatleriniz gökyüzünde yükselen burç (ASC) derecesini değiştirmektedir:',
    hint: 'İlk nefes anındaki gökyüzü ufkudur; bedeninizin dış dünyadaki maskesini belirler.',
    options: ascOptions
  });

  // ========================================================
  // 6. SORU: KADERSEL ODAK NOKTASI & GÜNEŞ KAPISI (ENKARNASYON MİSYONU)
  // ========================================================
  const gateMap = new Map<string, { gate: number; line: number; times: string[] }>();
  candidatesData.forEach(cd => {
    const key = `${cd.sunGate}.${cd.sunLine}`;
    if (!gateMap.has(key)) {
      gateMap.set(key, { gate: cd.sunGate, line: cd.sunLine, times: [] });
    }
    gateMap.get(key)!.times.push(cd.candidate.timeStr);
  });

  const missionOptions: DisambiguationOption[] = [];
  gateMap.forEach((info, key) => {
    const gTheme = GATE_THEMES[info.gate] || { title: `${info.gate}. Kapı Arketipi`, desc: 'Kişiliğinizin dünyaya sunduğu ana frekans ve yaşam misyonu.' };
    const formattedTimes = info.times.map(t => t.slice(0, 5)).join(', ');

    missionOptions.push({
      id: `gate_${info.gate}_${info.line}`,
      label: `${gTheme.title} (Kapı ${key})`,
      subLabel: `Aday Saat Modelleri: ${formattedTimes}`,
      description: gTheme.desc,
      favoredCandidateTimes: info.times,
      traitKey: 'sunGate',
      traitValue: key
    });
  });

  if (gateMap.size === 1) {
    const activeGate = Array.from(gateMap.values())[0].gate;
    const altGateNum = activeGate === 1 ? 2 : 1;
    const altTheme = GATE_THEMES[altGateNum];
    missionOptions.push({
      id: `gate_alt_${altGateNum}`,
      label: `${altTheme.title} (Alternatif Yaşam Misyonu)`,
      subLabel: 'Kişiliğinizin bu alternatif temayla rezonansı',
      description: altTheme.desc,
      favoredCandidateTimes: [],
      traitKey: 'sunGate',
      traitValue: 'alt_gate'
    });
  }

  questions.push({
    id: 'q_mission',
    category: 'mission',
    categoryLabel: 'Güneş Kapısı & Yaşam Misyonu',
    iconName: 'Target',
    title: 'Dünyaya Sunduğunuz En Büyük Doğuştan Yetenek ve Yaşam Temanız',
    question: 'Bilinçli Güneş kapınız (Işığınızın Özü) saat diliminize göre bu kadersel temayı taşır:',
    hint: 'Human Design haritanızın %70 enerjisini oluşturan Güneş kapısı ve çizgisidir.',
    options: missionOptions
  });

  return {
    hasDisambiguation: questions.length > 0,
    questions,
    candidatesData
  };
}

/**
 * Kullanıcının işaretlediği cevaplara göre aday puanlarını günceller ve
 * kesin kazanan adayı (nokta atışı) belirler.
 */
export function evaluateTriangulationAnswers(
  candidatesData: CandidateHDData[],
  questions: DisambiguationQuestion[],
  selectedOptionIds: Record<string, string>
): CandidateEvaluationScore[] {
  const result: CandidateEvaluationScore[] = candidatesData.map(cd => {
    let hdBonus = 0;
    const matchedTraits: string[] = [];
    const mismatchedTraits: string[] = [];

    questions.forEach(q => {
      const chosenOptId = selectedOptionIds[q.id];
      if (!chosenOptId) return;

      const chosenOpt = q.options.find(o => o.id === chosenOptId);
      if (!chosenOpt) return;

      const isFavored = chosenOpt.favoredCandidateTimes.includes(cd.candidate.timeStr);
      if (isFavored) {
        hdBonus += 40;
        matchedTraits.push(`${q.categoryLabel}: ${chosenOpt.label.split('(')[0].trim()}`);
      } else if (chosenOpt.favoredCandidateTimes.length > 0) {
        hdBonus -= 30;
        mismatchedTraits.push(`${q.categoryLabel} uyumsuzluğu`);
      }
    });

    const totalTriangulatedScore = Math.max(0, cd.candidate.totalScore + hdBonus);

    return {
      timeStr: cd.candidate.timeStr,
      originalScore: cd.candidate.totalScore,
      hdMatchScore: hdBonus,
      totalTriangulatedScore,
      confidencePercent: 0,
      isTopMatch: false,
      matchedTraits,
      mismatchedTraits
    };
  });

  const maxScore = Math.max(1, ...result.map(r => r.totalTriangulatedScore));
  result.forEach(r => {
    r.confidencePercent = Math.min(99, Math.round((r.totalTriangulatedScore / maxScore) * 100));
  });

  result.sort((a, b) => b.totalTriangulatedScore - a.totalTriangulatedScore);
  if (result.length > 0 && Object.keys(selectedOptionIds).length > 0) {
    result[0].isTopMatch = true;
  }

  return result;
}
