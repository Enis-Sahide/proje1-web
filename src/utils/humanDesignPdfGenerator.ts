import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HumanDesignChart, CenterCode, PLANET_SYMBOLS } from './HumanDesignEngine';

// Helper to convert ArrayBuffer to Base64 (needed for jsPDF addFileToVFS)
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Safe string translator/wrapper
const tr = (str: string | number | null | undefined): string => {
  if (str === null || str === undefined) return '';
  return String(str);
};

// Word-wrap text renderer that supports inline markdown bold formatting (**text**)
const drawTextWithBold = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 6
): number => {
  let curX = x;
  let curY = y;
  
  const sanitizedText = text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/<img.*?src=".*?".*?>/g, '')
    .replace(/^\s*>\s*/gm, '');
     
  const parts = sanitizedText.split(/(\s+|\*\*)/);
  let isBold = false;
  
  for (const part of parts) {
    if (part === '**') {
      isBold = !isBold;
      doc.setFont('LiberationSans', isBold ? 'bold' : 'normal');
      continue;
    }
    if (part === '\n') {
      curX = x;
      curY += lineHeight;
      continue;
    }
    if (part === '') continue;
    
    const wordWidth = doc.getTextWidth(part);
    if (curX + wordWidth > x + maxWidth && part.trim() !== '') {
      curX = x;
      curY += lineHeight;
    }
    
    doc.text(part, curX, curY);
    curX += wordWidth;
  }
  
  doc.setFont('LiberationSans', 'normal');
  return curY + lineHeight;
};

const normalizeHDKey = (key: string, type?: string): string => {
  if (!key) return "";
  const k = key.trim();
  if (k === "Memnuniyet") return "Tatmin";
  if (k === "Tepki Vermek") return "Yanıt Vermek";
  if (k === "Duygusal (Solar Pleksus)") return "Duygusal";
  if (k === "Reflektör") return "Yansıtıcı";
  if (k === "Manifesting Jeneratör") return "Manifesting Generator";
  if (k === "Ay Otoritesi (Reflektör)") return "Ay Döngüsü";
  if (k === "Ego (Kalp)") return "Ego";
  if (k === "Kendinden Gelen (G Merkezi)") return "Benlik";
  if (k === "Çevresel (Zihinsel)") return "Zihinsel";
  if (k === "Bir Ay Döngüsü Beklemek") return "28 Gün Beklemek";
  if (k === "Hayal Kırıklığı" && (type === "Reflektör" || type === "Yansıtıcı")) {
    return "Hayal Kırıklığı (Yansıtıcı)";
  }
  return k;
};

const HD_DETAILS_MAP: Record<string, { subtitle: string; description: string }> = {
  "Projektör": {
    subtitle: "Tür / Tip",
    description: "Projektörler, dünya nüfusunun yaklaşık %20'sini oluşturur. Enerjiyi başlatmak veya üretmek için değil, diğer tiplerin enerjisini yönlendirmek, rehberlik etmek ve yönetmek için buradadırlar. Doğal bir liderlik, rehberlik ve sezgisel gözlem yeteneğine sahiptirler. En büyük başarıları, davet edildikleri ortamlarda takdir görmek ve başkalarına en verimli yolları göstermektir."
  },
  "Jeneratör": {
    subtitle: "Tür / Tip",
    description: "Jeneratörler, nüfusun yaklaşık %37'sini oluşturur ve dünyanın birincil yaşam enerjisi motorudur. Tanımlı Sakral merkezleri sayesinde sürekli ve sürdürülebilir bir üretici güce sahiptirler. Yaşamlarındaki anahtar, dış dünyadan gelen uyarılara/fırsatlara yanıt vermek (cevap vermek) ve sevdikleri işlerde bu muazzam enerjiyi harcayarak derin bir tatmine ulaşmaktır."
  },
  "Manifesting Generator": {
    subtitle: "Tür / Tip",
    description: "Manifesting Generator'lar (M.G.), nüfusun yaklaşık %33'ünü oluşturur. Hem Jeneratörlerin sürdürülebilir yaşam enerjisine, hem de Manifestörlerin hızlı eyleme geçme ve başlatma gücüne sahiptirler. Çok yönlüdürler, aynı anda birden fazla işi yapabilirler. Stratejileri, yanıt vermek, eyleme geçmeden önce bilgilendirmek ve süreci takip etmektir."
  },
  "Manifestör": {
    subtitle: "Tür / Tip",
    description: "Manifestörler, nüfusun yaklaşık %9'unu oluşturur. Saf bir başlatıcı ve etki yaratıcı güçtürler. Kendi başlarına hareket edebilir, kararlar alabilir ve başkalarını harekete geçirebilirler. İlişkilerinde dirençle karşılaşmamak ve çevrelerine huzur vermek için harekete geçmeden önce mutlaka başkalarını bilgilendirmeleri gerekir."
  },
  "Yansıtıcı": {
    subtitle: "Tür / Tip",
    description: "Yansıtıcılar (Reflector), dünya nüfusunun sadece %1'ini oluşturan en nadir tiptir. Tüm 9 enerji merkezleri tamamen açıktır. Yaşadıkları ortamın, topluluğun ve ilişkide oldukları kişilerin sağlık ve refah düzeyini bir ayna gibi yansıtırlar. Yaşamlarındaki en büyük güç, bilgece bir gözlemci olmak ve doğru kararlar için 28 günlük Ay döngüsünü beklemektir."
  },
  "Dalak": {
    subtitle: "İç Otorite",
    description: "Dalak Otoritesi, anlık sezgilere, hayatta kalma reflekslerine ve içgüdülere dayanır. Vücudunuz size anında, sadece bir kez ve çok sessizce fısıldar (bir yere girmek veya girmemek, biriyle konuşmak veya konuşmamak gibi). Zihninizi susturup, o anlık 'güvenli/güvensiz' refleksine sadık kalmayı öğrenmelisiniz."
  },
  "Duygusal": {
    subtitle: "İç Otorite",
    description: "Duygusal Otorite, hislerinizin netleşmesini beklemeyi gerektirir. Sizin için 'anlık' bir evet veya hayır yoktur. Duygusal dalgalanmalarınızın (heyecan ve hüzün dalgalarının) yatışmasını beklemeli ve ancak dalga nötr bir noktaya ulaştığında karar vermelisiniz. 'Üzerine bir gece uyumak' sizin en büyük dostunuzdur."
  },
  "Sakral": {
    subtitle: "İç Otorite",
    description: "Sakral Otorite, karnınızdan (gut feeling) gelen anlık tepkilere dayanır. Bir soru sorulduğunda vücudunuzun çıkardığı 'hı-hı' (evet) veya 'ıh-ıh' (hayır) gibi sesler veya karın bölgesindeki büzülme/rahatlama hissi en doğru rehberinizdir. Zihinsel mantık yürütmeler yerine vücudunuzun bu fiziksel tepkilerine güvenin."
  },
  "Benlik": {
    subtitle: "İç Otorite",
    description: "Benlik (Self-Projected) Otoritesi, kalbinizin ve kimliğinin sesini duymakla ilgilidir. Sizin için en doğru karar, başkalarıyla konuşurken ağzınızdan filtresizce çıkan kendi sözlerinizde gizlidir. Karar almadan önce güvendiğiniz dostlarınızla sohbet edin ve ne söylediğinizi, sesinizin tonunu dinleyin; gerçeğiniz orada belirecektir."
  },
  "Zihinsel": {
    subtitle: "İç Otorite",
    description: "Zihinsel Otorite (Mental/Soundboard), çevrenizdeki insanları birer yankı tahtası (soundboard) olarak kullanmanızı gerektirir. Kararınızı dışarıya sesli olarak aktarırken kendi sesinizin frekansını ve ne hissettiğinizi dinleyerek netliğe ulaşırsınız. Karar anında zihinsel mantık kuralları yerine kendi sesinizin tınısına güvenin."
  },
  "Ego": {
    subtitle: "İç Otorite",
    description: "Ego (Yürek) Otoritesi, kalbinizin gerçekten neyi arzuladığına ve neye irade göstermek istediğine dayanır. Karar anında kendinize sormanız gereken soru: 'Ben bunu gerçekten istiyor muyum ve bunun için taahhüt vermeye hazır mıyım?' sorusudur. Kendi isteklerinizi dürüstçe kabul etmeniz en doğru yoldur."
  },
  "Ay Döngüsü": {
    subtitle: "İç Otorite",
    description: "Ay Döngüsü Otoritesi, sadece Yansıtıcı (Reflector) tipine özeldir. Tüm merkezleriniz açık olduğu için acele karar vermemeli, Ay'ın 28 günlük döngüsünü tamamlamasını beklemelisiniz. Bu süreç boyunca farklı günlerde konuyu değerlendirip içinizde biriken netliğe göre hareket etmelisiniz."
  },
  "Davet Beklemek": {
    subtitle: "Strateji",
    description: "Projektörler için geçerli stratejidir. İş, ilişkiler, kariyer veya ev gibi büyük yaşam adımlarında başkaları tarafından fark edilmeyi ve resmi/gayriresmi olarak davet edilmeyi beklemelisiniz. Davet edilmeden girdiğiniz durumlarda enerjiniz doğru algılanmaz ve burukluk yaşarsınız."
  },
  "Yanıt Vermek": {
    subtitle: "Strateji",
    description: "Jeneratörler için geçerli stratejidir. Hayatı sıfırdan başlatmaya (initiate) çalışmak yerine, önünüze çıkan fırsatlara, sorulara ve olaylara vücudunuzun (Sakral) verdiği yanıtı izlemelisiniz. Hayat size gelir, siz sadece yanıt verirsiniz."
  },
  "Bilgilendirmek ve Yanıt Vermek": {
    subtitle: "Strateji",
    description: "Manifesting Generator'lar için geçerli stratejidir. Eyleme geçmeden önce etrafınızı bilgilendirmeli ve Sakral merkezinizin yanıt vermesini beklemelisiniz. Bu, hayatınızdaki dirençleri ortadan kaldırır ve sizi derin bir tatmine ulaştırır."
  },
  "Bilgilendirmek": {
    subtitle: "Strateji",
    description: "Manifestörler için geçerli stratejidir. Büyük bir eylem başlatmadan veya karar almadan önce, bu durumdan etkilenecek kişileri önceden bilgilendirmelisiniz. Bu, etrafınızdaki direnç duvarlarını yıkar ve önünüzü açar."
  },
  "28 Gün Beklemek": {
    subtitle: "Strateji",
    description: "Yansıtıcılar (Reflector) için geçerli stratejidir. Kararlarınızın netleşmesi için Ay'ın 28 günlük geçiş döngüsünü beklemeli, bu sürede farklı ortamlarda konuyu gözlemlemelisiniz."
  },
  "Başarı": {
    subtitle: "İmza (Hizalanma Ödülü)",
    description: "Projektörlerin doğru stratejiyle (davet bekleyerek) hareket ettiklerinde hissettikleri tatmin ve takdir edilme duygusudur. Kendinizi başarılı, görülmüş ve bilgece yönlendirmiş hissettiğinizde doğru yoldasınız demektir."
  },
  "Tatmin": {
    subtitle: "İmza (Hizalanma Ödülü)",
    description: "Jeneratör ve Manifesting Generator'ların enerjilerini sevdikleri işlerde doğru şekilde tükettiklerinde hissettikleri derin içsel doyumdur. Akşam yatağa yorgun ama mutlu girmek tatmin imzanızdir."
  },
  "Huzur": {
    subtitle: "İmza (Hizalanma Ödülü)",
    description: "Manifestörlerin kararlarını alıp etrafı bilgilendirdikten sonra, hiç kimsenin direnciyle karşılaşmadan eylemlerini özgürce tamamladıklarında hissettikleri içsel dinginlik ve özgürlük hissidir."
  },
  "Sürpriz": {
    subtitle: "İmza (Hizalanma Ödülü)",
    description: "Yansıtıcıların (Reflector) yaşamın ve insanların beklenmedik güzelliklerine, mucizelerine ve farklılıklarına tanık olduklarında hissettikleri çocuksu hayranlık ve keyif alma duygusudur."
  },
  "Acı / Burukluk": {
    subtitle: "Benlik Olmayan Tema (Hizalanma Uyarısı)",
    description: "Projektörlerin davet edilmeden harekete geçtiklerinde veya başkaları tarafından görülmediklerini, takdir edilmediklerini hissettiklerinde yaşadıkları kırgınlık ve hayal kırıklığı hissidir."
  },
  "Hayal Kırıklığı": {
    subtitle: "Benlik Olmayan Tema (Hizalanma Uyarısı)",
    description: "Jeneratörlerin yanıt vermek yerine zihinsel kararlarla eyleme geçip engellerle karşılaştıklarında veya enerjilerini istemedikleri işlerde tükettiklerinde hissettikleri tıkanma ve bıkkınlık hissidir."
  },
  "Öfke": {
    subtitle: "Benlik Olmayan Tema (Hizalanma Uyarısı)",
    description: "Manifestörlerin eyleme geçmeden önce çevrelerini bilgilendirmedikleri için karşılaştıkları engeller, kontrol edilme çabaları veya kısıtlamalar karşısında hissettikleri patlama ve öfke duygusudur."
  },
  "Hayal Kırıklığı ve Öfke": {
    subtitle: "Benlik Olmayan Tema (Hizalanma Uyarısı)",
    description: "Manifesting Generator'ların hem hizalanmadıklarında hissettikleri tıkanıklık (hayal kırıklığı) hem de engellendiklerinde dışa vurdukları sabırsızlık ve kızgınlık (öfke) halidir."
  },
  "Hayal Kırıklığı (Yansıtıcı)": {
    subtitle: "Benlik Olmayan Tema (Hizalanma Uyarısı)",
    description: "Yansıtıcıların (Reflector) yanlış ortamlarda kalarak başkalarının olumsuz enerjilerini emdiklerinde veya hayatta hiç heyecan verici bir sürpriz kalmadığını düşündüklerinde hissettikleri donukluk halidir."
  }
};

const CENTER_NAMES: Record<CenterCode, string> = {
  Head: "Tepe (Taç) Merkezi",
  Ajna: "Zihin (Ajna) Merkezi",
  Throat: "Boğaz Merkezi",
  G: "Benlik (G) Merkezi",
  Heart: "Yürek (Ego/Kalp) Merkezi",
  Sacral: "Sakral Merkez",
  Root: "Kök Merkez",
  Spleen: "Dalak Merkezi",
  SolarPlexus: "Duygusal Solar Plexus Merkezi"
};

const CENTER_DESCRIPTIONS: Record<CenterCode, { defined: string; undefined: string }> = {
  Head: {
    defined: "İlham ve fikirlerin sabit bir kaynaktan aktığı anlamına gelir. Düşünceleriniz üzerinde derin bir odaklanma ve zihinsel baskı hissedebilirsiniz. Kendi ilham kaynağınız kendi içinizdedir.",
    undefined: "Zihniniz dışarıdan gelen her türlü fikre ve ilhama açıktır. Başkalarının sorularını çözmekle uğraşabilir veya kendi üzerinizde gereksiz zihinsel baskı hissedebilirsiniz. Kendi düşüncelerinizi filtrelemeyi öğrenmek bilgeliğinizdir."
  },
  Ajna: {
    defined: "Bilgiyi işleme, analiz etme ve yapılandırma şekliniz sabittir. Görüşlerinize ve fikirlerinize sıkı sıkıya bağlı olabilirsiniz. Kararlı ve tutarlı bir düşünce sistemine sahipsinizdir.",
    undefined: "Sabit bir düşünme kalıbınız yoktur. Olaylara çok farklı açılardan bakabilirsiniz. Fikirlerinize tutunup insanları ikna etmeye çalışmaktan kaçındığınızda zihinsel bir deha ve bilgelik kazanırsınız."
  },
  Throat: {
    defined: "Kendinizi ifade etme, konuşma ve eyleme geçme tarzınız sabittir. Ses tonunuz ve iletişim şekliniz tutarlıdır. Kendi özgün sesinize sahipsiniz.",
    undefined: "İfade ve iletişiminiz çevrenizdeki insanlara göre şekillenir. Bazen dikkat çekmek için gereksizce konuşabilirsiniz. Sessiz kalıp davet edilmeyi beklediğinizde sözleriniz büyük bir etki ve bilgelik taşır."
  },
  G: {
    defined: "Kimliğiniz, hayat yönünüz ve sevgi anlayışınız sabittir. Nereye gittiğinizi ve kim olduğunuzu içsel olarak bilirsiniz. İçsel pusulanız son derece güçlüdür.",
    undefined: "Sabit bir yön veya kimlik arayışınız yoktur. Birlikte olduğunuz insanlara göre kimliğiniz ve yönünüz şekillenir. Doğru ortamlarda bulunmak yönünüzü ve sevginizi bulmanızı sağlar."
  },
  Heart: {
    defined: "İrade gücünüz, özgüveniniz ve taahhüt verme kapasiteniz sabittir. Verdiğiniz sözleri tutmakta kararlısınızdır. İradenize güvenebilirsiniz.",
    undefined: "İrade gücünüz ve özdeğeriniz değişkendir. Başkalarına kendi değerinizi kanıtlamaya çalışabilirsiniz. Kimseye söz vermek veya bir şey kanıtlamak zorunda olmadığınızı anlamak en büyük özgürlüğünüzdir."
  },
  Sacral: {
    defined: "Sürdürülebilir bir yaşam enerjisine, iş gücüne ve üreme enerjisine sahipsiniz. Çalışmaktan ve üretmekten haz alırsınız. Büyük bir yaşam gücü motoruna sahipsiniz.",
    undefined: "Kendi enerjiniz sınırlıdır ve çabuk yorulabilirsiniz. Başkalarının enerjisini emip aşırı koşturabilir ve ne zaman durmanız gerektiğini bilemeyebilirsiniz. Dinlenmeyi öğrenmek ve hayata yanıt vermek sağlığınızın anahtarıdır."
  },
  Root: {
    defined: "Stres ve adrenalin baskısıyla başa çıkma şekliniz sabittir. Baskı altında soğukkanlılıkla çalışabilirsiniz. Doğal bir baskı yönetim sisteminiz vardır.",
    undefined: "Dışarıdan gelen stres ve baskıyı çok yoğun hissedersiniz. Bu baskıdan kurtulmak için aceleyle hareket edebilirsiniz. Stresin size ait olmadığını fark edip, hayatın doğal hızına teslim olmayı öğrenmelisiniz."
  },
  Spleen: {
    defined: "Güçlü bir bağışıklık sistemine, anlık sezgilere ve hayatta kalma içgüdüsüne sahipsiniz. Fiziksel olarak kendinizi güvende hissedersiniz. Güçlü bir sağlık korumanız vardır.",
    undefined: "Çevrenizdeki insanların sağlık ve güvenlik enerjilerini emersiniz. Size iyi gelmeyen ilişki veya alışkanlıklara (sırf güvende hissetmek için) tutunabilirsiniz. Korkularınızla yüzleşip, tutunmayı bırakmak bilgeliğinizdir."
  },
  SolarPlexus: {
    defined: "Kendi duygusal dalgalanmalarınız (inişler-çıkışlar) vardır. Kararlarınızı duygusal netliğe ulaştıktan sonra almalısınız. Duygusal derinliğiniz çok fazladır.",
    undefined: "Çevrenizdeki insanların tüm duygularını (öfke, üzüntü vb.) sünger gibi emip büyütürsünüz. Tartışmalardan ve çatışmalardan kaçınmak için kendinizi bastırabilirsiniz. Duyguların size ait olmadığını fark edip nötr kalmayı öğrenmelisiniz."
  }
};

const profilesMap: Record<string, string> = {
  "1/3": "Araştırmacı / Deneyimci. Temel atmak, araştırmak ve deneme-yanılma yoluyla öğrenmek için buradasınız. Güvenli bir temel oluşturmak hayatınızın anahtarıdır.",
  "1/4": "Araştırmacı / Fırsatçı. Bilgiyi derinlemesine araştırıp, bu bilgiyi yakın dostlarınız ve sosyal çevreniz (network) aracılığıyla yaymak ve fırsatlara dönüştürmek için buradasınız.",
  "2/4": "Münzevi / Fırsatçı. Kendi başınıza kalıp yeteneklerinizi geliştirmek istersiniz. Doğru fırsatlar ve teklifler size her zaman yakın sosyal çevrenizden gelir.",
  "2/5": "Münzevi / Kurtarıcı. Doğal bir yeteneğe sahipsiniz ve kendi alanınızda kalmayı seversiniz. İnsanlar zor anlarında sizden pratik çözümler ve kurtarıcılık beklerler.",
  "3/5": "Deneyimci / Kurtarıcı. Hayatı deneme-yanılma ve hatalardan öğrenerek yaşarsınız. Kazandığınız bu pratik tecrübelerle başkalarının sorunlarına en gerçekçi çözümleri sunarsınız.",
  "3/6": "Deneyimci / Rol Modeli. Hayatınızın ilk yarısında yoğun deneyimler yaşayıp hatalardan öğrenir, olgunlaştıkça çevreniz için bilge bir izleyici ve rol modeli haline gelirsiniz.",
  "4/6": "Fırsatçı / Rol Modeli. Sosyal çevrenizle kurduğunuz köprüler ve dostluklar hayatınızın yönünü belirler. Yaşınız ilerledikçe tarafsız, bilge bir rol modeline dönüşürsünüz.",
  "4/1": "Fırsatçı / Araştırmacı. Kendi sabit inançlarınız ve araştırma temelleriniz üzerinde durursunuz. Bu temel bilgiyi yakın çevrenize aktararak hayatınızı kurarsınız.",
  "5/1": "Kurtarıcı / Araştırmacı. İnsanların sizden büyük beklentileri vardır. Bilgiyi derinlemesine araştırıp, kriz anlarında pratik ve evrensel çözümler üreterek liderlik edersiniz.",
  "5/2": "Kurtarıcı / Münzevi. Kendi köşenizde kalıp yeteneklerinizi geliştirmeyi seversiniz. İhtiyaç anında çağrıldığınızda, o pratik dehanızla krizleri çözersiniz.",
  "6/2": "Rol Modeli / Münzevi. Hayatınız 3 aşamalıdır (30 yaşına kadar deneme, 50 yaşına kadar izleme, 50'den sonra rol modeli). Kendi alanınızda kalıp bilgeliğinizi olgunlaştırırsınız.",
  "6/3": "Rol Modeli / Deneyimci. Hayat boyu denemekten ve öğrenmekten vazgeçmeyen, dinamik ve tecrübeli bir rol modelisiniz. Hayatın içinde aktif birer rehbersiniz."
};

const GATE_NAMES: Record<number, string> = {
  1: "Kendini İfade Etme / Yaratıcılık",
  2: "Alıcılık / Yön",
  3: "Düzen / Yeni Başlangıçlar",
  4: "Formüller / Zihinsel Cevaplar",
  5: "Ritim / Kalıplar",
  6: "Sürtüşme / Uyum ve Çatışma",
  7: "Rol / Liderlik",
  8: "Katkı / Bireysel İfade",
  9: "Odak / Detaylar",
  10: "Kendini Sevme / Davranış",
  11: "Fikirler / Uyum",
  12: "Çekingenlik / İfade",
  13: "Dinleyici / Sırdaş",
  14: "Güç / Kaynak Yönetimi",
  15: "Uçlar / Evrensel Sevgi ve Ritim",
  16: "Beceri / Yetenek",
  17: "Görüşler / Gelecek Planlama",
  18: "Düzeltme / Kusursuzlaştırma",
  19: "İhtiyaçlar / Bağlantı",
  20: "Şimdi / Anlık Farkındalık",
  21: "Kontrol / Hazine",
  22: "Zarafet / Duygusal Derinlik",
  23: "Basitlik / Bireysel Bilgelik",
  24: "Rasyonalizasyon / Geri Dönüş",
  25: "Koşulsuz Sevgi / Masumiyet",
  26: "Bencillik / Pazarlamacı (Ego)",
  27: "Bakım / Besleme",
  28: "Mücadele / Yaşam Amacı",
  29: "Bağlılık / Kararlılık (Evet Demek)",
  30: "Arzular / Ateşli Duygular",
  31: "Etki / Demokratik Liderlik",
  32: "Süreklilik / Uyum Sağlama",
  33: "Geri Çekilme / Mahremiyet",
  34: "Güç / Saf Yaşam Gücü",
  35: "Değişim / Deneyim Arayışı",
  36: "Kriz / Duygusal Deneyim",
  37: "Dostluk / Aile ve Anlaşmalar",
  38: "Savaşçı / Anlam Arayışı",
  39: "Provokasyon / Enerjisel Tetikleme",
  40: "Yalnızlık / Teslimiyet (Topluluk)",
  41: "Hayal Gücü / Kaynak İhtiyaçları",
  42: "Büyüme / Bitirme ve Olgunlaşma",
  43: "İçgörü / Bireysel Deha",
  44: "Uyanıklık / Geçmiş Deneyimler",
  45: "Hükümdar / Dağıtıcı (Topluluk)",
  46: "Beden Sevgisi / Doğru Yerde Olma",
  47: "Fikir Dünyası / Gerçekleşme",
  48: "Derinlik / Kuyu (Çözüm Arayışı)",
  49: "Devrim / İlkeler ve Reddetme",
  50: "Değerler / Koruma ve Kanunlar",
  51: "Şok / Uyanış ve Rekabet",
  52: "Durgunluk / Dağ (Odaklanma)",
  53: "Başlangıçlar / Tohum",
  54: "Hırs / Yükselme",
  55: "Ruh / Bereket ve Duygusal Bolluk",
  56: "Gezgin / Hikaye Anlatıcı",
  57: "Sezgi / Anlık Güvenlik",
  58: "Yaşam Sevinci / Canlılık",
  59: "Cinsellik / Yakınlık",
  60: "Sınırlar / Kabul ve Mutasyon",
  61: "Gizem / İçsel Gerçeklik",
  62: "Detaylar / Pratik Zihin",
  63: "Şüphe / Mantıksal Sorgulama",
  64: "Kafa Karışıklığı / Geçmişi Değerlendirme"
};

const CENTER_COORDS: Record<CenterCode, { x: number, y: number, shape: string, color: string, s: number }> = {
  Head: { x: 200, y: 45, shape: 'triangle', color: '#F4D03F', s: 28 },
  Ajna: { x: 200, y: 115, shape: 'triangle-down', color: '#A8D5BA', s: 28 },
  Throat: { x: 200, y: 190, shape: 'square', color: '#D2B48C', s: 25 },
  G: { x: 200, y: 300, shape: 'diamond', color: '#F4D03F', s: 35 },
  Heart: { x: 255, y: 340, shape: 'triangle', color: '#FFFFFF', s: 24 },
  Sacral: { x: 200, y: 400, shape: 'square', color: '#E1464F', s: 25 },
  Root: { x: 200, y: 480, shape: 'square', color: '#FFFFFF', s: 25 },
  Spleen: { x: 90, y: 390, shape: 'triangle-right', color: '#FFFFFF', s: 30 },
  SolarPlexus: { x: 310, y: 390, shape: 'triangle-left', color: '#D2B48C', s: 30 },
};

const GATE_COORDS: Record<number, { x: number, y: number }> = {
  64: { x: 183, y: 70 }, 61: { x: 200, y: 70 }, 63: { x: 217, y: 70 },
  47: { x: 183, y: 90 }, 24: { x: 200, y: 90 }, 4: { x: 217, y: 90 },
  17: { x: 183, y: 109 }, 43: { x: 200, y: 136 }, 11: { x: 217, y: 109 },
  62: { x: 183, y: 168 }, 23: { x: 200, y: 168 }, 56: { x: 217, y: 168 },
  16: { x: 178, y: 176 }, 35: { x: 222, y: 176 },
  20: { x: 178, y: 190 }, 12: { x: 222, y: 190 },
  45: { x: 222, y: 204 },
  31: { x: 186, y: 212 }, 8: { x: 200, y: 212 }, 33: { x: 214, y: 212 },
  7: { x: 186, y: 279 }, 1: { x: 200, y: 272 }, 13: { x: 214, y: 279 },
  10: { x: 172, y: 300 }, 25: { x: 228, y: 300 },
  15: { x: 186, y: 321 }, 2: { x: 200, y: 328 }, 46: { x: 214, y: 321 },
  21: { x: 255, y: 322 }, 51: { x: 240, y: 350 },
  26: { x: 240, y: 360 }, 40: { x: 270, y: 360 },
  5: { x: 186, y: 378 }, 14: { x: 200, y: 378 }, 29: { x: 214, y: 378 },
  34: { x: 178, y: 386 }, 27: { x: 178, y: 414 },
  59: { x: 222, y: 400 },
  42: { x: 186, y: 422 }, 3: { x: 200, y: 422 }, 9: { x: 214, y: 422 },
  53: { x: 186, y: 458 }, 60: { x: 200, y: 458 }, 52: { x: 214, y: 458 },
  54: { x: 178, y: 468 }, 19: { x: 222, y: 468 },
  38: { x: 178, y: 480 }, 39: { x: 222, y: 480 },
  58: { x: 178, y: 492 }, 41: { x: 222, y: 492 },
  48: { x: 65, y: 362 }, 57: { x: 85, y: 372 }, 44: { x: 115, y: 387 },
  50: { x: 105, y: 398 }, 32: { x: 85, y: 408 }, 28: { x: 75, y: 412 }, 18: { x: 65, y: 418 },
  36: { x: 335, y: 362 }, 22: { x: 315, y: 372 }, 37: { x: 295, y: 382 },
  6: { x: 285, y: 387 }, 49: { x: 295, y: 398 }, 55: { x: 315, y: 408 }, 30: { x: 335, y: 418 },
};

const CHANNELS = [
  { id: 18, gates: [1, 8], centers: ['G', 'Throat'] },
  { id: 214, gates: [2, 14], centers: ['G', 'Sacral'] },
  { id: 360, gates: [3, 60], centers: ['Sacral', 'Root'] },
  { id: 463, gates: [4, 63], centers: ['Ajna', 'Head'] },
  { id: 515, gates: [5, 15], centers: ['Sacral', 'G'] },
  { id: 659, gates: [6, 59], centers: ['SolarPlexus', 'Sacral'] },
  { id: 731, gates: [7, 31], centers: ['G', 'Throat'] },
  { id: 952, gates: [9, 52], centers: ['Sacral', 'Root'] },
  { id: 1020, gates: [10, 20], centers: ['G', 'Throat'] },
  { id: 1034, gates: [10, 34], centers: ['G', 'Sacral'] },
  { id: 1057, gates: [10, 57], centers: ['G', 'Spleen'] },
  { id: 1156, gates: [11, 56], centers: ['Ajna', 'Throat'] },
  { id: 1222, gates: [12, 22], centers: ['Throat', 'SolarPlexus'] },
  { id: 1333, gates: [13, 33], centers: ['G', 'Throat'] },
  { id: 1648, gates: [16, 48], centers: ['Throat', 'Spleen'] },
  { id: 1762, gates: [17, 62], centers: ['Ajna', 'Throat'] },
  { id: 1858, gates: [18, 58], centers: ['Spleen', 'Root'] },
  { id: 1949, gates: [19, 49], centers: ['Root', 'SolarPlexus'] },
  { id: 2034, gates: [20, 34], centers: ['Throat', 'Sacral'] },
  { id: 2057, gates: [20, 57], centers: ['Throat', 'Spleen'] },
  { id: 2145, gates: [21, 45], centers: ['Heart', 'Throat'] },
  { id: 2343, gates: [23, 43], centers: ['Throat', 'Ajna'] },
  { id: 2461, gates: [24, 61], centers: ['Ajna', 'Head'] },
  { id: 2551, gates: [25, 51], centers: ['G', 'Heart'] },
  { id: 2644, gates: [26, 44], centers: ['Heart', 'Spleen'] },
  { id: 2750, gates: [27, 50], centers: ['Sacral', 'Spleen'] },
  { id: 2838, gates: [28, 38], centers: ['Spleen', 'Root'] },
  { id: 2946, gates: [29, 46], centers: ['Sacral', 'G'] },
  { id: 3041, gates: [30, 41], centers: ['SolarPlexus', 'Root'] },
  { id: 3254, gates: [32, 54], centers: ['Spleen', 'Root'] },
  { id: 3457, gates: [34, 57], centers: ['Sacral', 'Spleen'] },
  { id: 3536, gates: [35, 36], centers: ['Throat', 'SolarPlexus'] },
  { id: 3740, gates: [37, 40], centers: ['SolarPlexus', 'Heart'] },
  { id: 3955, gates: [39, 55], centers: ['Root', 'SolarPlexus'] },
  { id: 4253, gates: [42, 53], centers: ['Sacral', 'Root'] },
  { id: 4764, gates: [47, 64], centers: ['Ajna', 'Head'] }
];

const getIncarnationCrossDetails = (cross: string): string => {
  const match = cross.match(/\((\d+)\/(\d+)\s*\|\s*(\d+)\/(\d+)\)/);
  let gateDetails = "";
  
  if (match) {
    const pSun = parseInt(match[1]);
    const pEarth = parseInt(match[2]);
    const dSun = parseInt(match[3]);
    const dEarth = parseInt(match[4]);
    
    const nameSun = GATE_NAMES[pSun] || "Bilinmiyor";
    const nameEarth = GATE_NAMES[pEarth] || "Bilinmiyor";
    const nameDSun = GATE_NAMES[dSun] || "Bilinmiyor";
    const nameDEarth = GATE_NAMES[dEarth] || "Bilinmiyor";
    
    gateDetails = `\n\nBu özel Enkarnasyon Haçı, hayatınızdaki en büyük yaşam amacınızı temsil eder ve şu 4 kapının enerjisinin sentezinden oluşur:\n\n` +
      `• Kişilik Güneşi (Güneş - ${pSun}. Kapı): ${nameSun} - Hayattaki temel ifadeniz ve parladığınız ana alan.\n\n` +
      `• Kişilik Dünyası (Dünya - ${pEarth}. Kapı): ${nameEarth} - Sizi bu dünyada topraklayan ve dengeleyen kökler.\n\n` +
      `• Tasarım Güneşi (Güneş - ${dSun}. Kapı): ${nameDSun} - Bilinçdışı düzeydeki biyolojik/bedensel itici gücünüz.\n\n` +
      `• Tasarım Dünyası (Dünya - ${dEarth}. Kapı): ${nameDEarth} - Bilinçdışı düzeydeki fiziksel dengeniz.\n\n` +
      `Bu kapıların birleşimi, sizin hayattaki zorlukları, ilişkileri ve kendi özgün benliğinizi bulma yolculuğunuzu şekillendirir.`;
  }

  return `${cross} Enkarnasyon Haçı, yaşam amacınızı ve bu dünyaya getirdiğiniz temel enerjisel misyonu temsil eder. Dört ana kapınızın (Kişilik ve Tasarım Güneş/Dünya) birleşimiyle oluşur.${gateDetails}`;
};

const getHolisticSynthesisText = (type: string) => {
  const normalizedType = normalizeHDKey(type);
  if (normalizedType === "Yansıtıcı" || normalizedType === "Reflector") {
    return {
      title: "Ruhsal ve Yaşamsal Sentez Analiziniz",
      text1: "Siz dünya nüfusunun sadece %1'ini oluşturan en nadir tiplerden birisiniz. Enerji merkezlerinizin tamamı açık olduğu için, adeta yaşayan bir ayna gibi çevrenizin enerjisini yansıtırsınız. Bu alıcı/yansıtıcı (dişil/yin) ve sezgisel gücünüz -ki bu durum biyolojik cinsiyetten tamamen bağımsız, enerjisel bir açık olma ve dinleme halidir- çevrenizdeki insanların ve bulunduğunuz mekanların sağlık ve dengesini anında ölçebilmenizi sağlar.",
      text2: "Yaşamdaki en önemli rehberiniz doğru ortamlarda bulunmaktır. Eğer bulunduğunuz yerdeki insanlar sağlıksız veya huzursuzsa, siz de fiziksel olarak hastalanabilirsiniz. Çevrenizi son derece seçici oluşturmalısınız. Kararlarınızı aceleye getirmemeli, içinizdeki netliğin olgunlaşması için 28 günlük Ay döngüsünü beklemelisiniz."
    };
  }
  if (normalizedType === "Projektör" || normalizedType === "Projector") {
    return {
      title: "Ruhsal ve Yaşamsal Sentez Analiziniz",
      text1: "Siz diğer insanların enerjisini okumak, yönetmek ve onlara rehberlik etmek için buradasınız. Doğal bir sezgisel anlayışa ve liderlik gücüne sahipsiniz. Ancak bu gücün doğru çalışabilmesi için davet edilmeyi beklemelisiniz. Bu alıcı (dişil/yin) duruşunuz -ki bu durum biyolojik cinsiyetten bağımsız, enerjisel bir açık olma, sabır ve dinleme halidir- sizi doğru insanlarla buluşturacak anahtardır.",
      text2: "Eğer davet edilmeden kendinizi ve fikirlerinizi öne sürerseniz, enerjiniz görülmeyecek ve burukluk (bitterness) hissedeceksiniz. Kendi değerinizi bilin, doğru insanların sizi keşfetmesini bekleyin. Dinlenmek, yalnız kalmak ve enerjinizi korumak en büyük gücünüzdir."
    };
  }
  if (normalizedType === "Jeneratör" || normalizedType === "Generator") {
    return {
      title: "Ruhsal ve Yaşamsal Sentez Analiziniz",
      text1: "Siz hayatın ve üretkenliğin sürdürülebilir yaşam enerjisi kaynağısınız. Tanımlı Sakral merkezlerinizle durmaksızın çalışabilir, üretebilir ve inşa edebilirsiniz. Ancak bu eril/hareket enerjisini doğru yerlerde harcamak hayattaki en büyük sınavınızdir.",
      text2: "Kararlarınızı mantıkla almak yerine, hayatın size sunduğu uyarılara Sakral merkezinizin verdiği anlık 'gut feeling' (karın tepkisi) yanıtına göre şekillendirmelisiniz. Sevdiğiniz işleri yaptığınızda hissettiğiniz tatmin duygusu sizin doğru yolda olduğunuzun kanıtıdır."
    };
  }
  if (normalizedType === "Manifesting Generator") {
    return {
      title: "Ruhsal ve Yaşamsal Sentez Analiziniz",
      text1: "Siz hem Jeneratörün sınırsız yaşam enerjisine hem de Manifestörün hızlı eyleme geçme yeteneğine sahipsiniz. Aynı anda birden fazla kulvarda koşabilir, çok yönlü projeleri yönetebilirsiniz. Ancak bu eril hızınız bazen detayları atlamanıza veya sabırsızlık yaşamanıza yol açabilir.",
      text2: "Eyleme geçmeden önce etrafınızı bilgilendirmeli ve Sakral merkezinizin yanıt vermesini beklemelisiniz. Bu, hayatınızdaki dirençleri ortadan kaldırır ve sizi derin bir tatmine ulaştırır."
    };
  }
  // Manifestör
  return {
    title: "Ruhsal ve Yaşamsal Sentez Analiziniz",
    text1: "Siz saf bir eylem başlatıcı ve etki yaratıcısınız. Kimseden izin almadan, kendi başınıza kararlar alıp büyük projeleri ve süreçleri tetikleyebilirsiniz (saf eril yang güç). Ancak bu bağımsız auranız çevrenizde bazen direnç yaratabilir.",
    text2: "Eylemlerinizin önünü açmak ve ilişkilerinizde huzuru yakalamak için harekete geçmeden önce mutlaka çevrenizdeki insanları bilgilendirmelisiniz. Bu, dirençleri kırar ve eylemlerinizi huzur içinde tamamlamanızı sağlar."
  };
};

export const downloadHumanDesignPDF = async (
  chart: HumanDesignChart,
  locationStr: string,
  dateStr: string
) => {
  const doc = new jsPDF();

  // Load custom fonts for Turkish character support
  try {
    const [regularRes, boldRes] = await Promise.all([
      fetch('/fonts/LiberationSans-Regular.ttf'),
      fetch('/fonts/LiberationSans-Bold.ttf')
    ]);
    
    const [regularBuf, boldBuf] = await Promise.all([
      regularRes.arrayBuffer(),
      boldRes.arrayBuffer()
    ]);

    const base64Regular = arrayBufferToBase64(regularBuf);
    const base64Bold = arrayBufferToBase64(boldBuf);

    doc.addFileToVFS('LiberationSans-Regular.ttf', base64Regular);
    doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');

    doc.addFileToVFS('LiberationSans-Bold.ttf', base64Bold);
    doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');

    doc.setFont('LiberationSans', 'normal');
  } catch (error) {
    console.error("Failed to load custom fonts, falling back to standard font:", error);
  }

  const primaryDark: [number, number, number] = [15, 23, 42]; // #0F172A
  const secondaryDark: [number, number, number] = [30, 41, 59]; // #1E293B
  const gold: [number, number, number] = [212, 175, 55]; // #D4AF37
  const white: [number, number, number] = [255, 255, 255];
  const grayText: [number, number, number] = [180, 180, 180];

  let currentY = 25;

  const checkSpace = (required: number) => {
    if (currentY + required > 275) {
      doc.addPage();
      doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
      doc.rect(0, 0, 210, 297, 'F');
      currentY = 25;
    }
  };

  // --- Cover Page ---
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(1.5);
  doc.line(20, 35, 190, 35);

  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(26);
  doc.text("7LAYERS", 20, 30);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text("HUMAN DESIGN YAŞAM REHBERİ", 20, 50);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text(`Konum: ${locationStr}   |   Tarih & Saat: ${dateStr}`, 20, 60);

  currentY = 75;

  // --- Section 1: Summary Table & Bodygraph side-by-side ---
  checkSpace(115);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text("Tasarım Özeti ve Bodygraph", 20, currentY);
  currentY += 8;

  const summaryBody = [
    ["Tip / Tür", tr(normalizeHDKey(chart.type))],
    ["Profil", tr(chart.profile)],
    ["İç Otorite", tr(normalizeHDKey(chart.authority, chart.type))],
    ["Strateji", tr(normalizeHDKey(chart.strategy))],
    ["İmza", tr(normalizeHDKey(chart.signature))],
    ["Benlik Olmayan Tema", tr(normalizeHDKey(chart.notSelfTheme, chart.type))],
    ["Enkarnasyon Haçı", tr(chart.incarnationCross.split(' (')[0])]
  ];

  // Render autoTable on the left (width 95mm)
  autoTable(doc, {
    startY: currentY,
    margin: { left: 20 },
    tableWidth: 95,
    head: [['Parametre', 'Değer']],
    body: summaryBody,
    theme: 'grid',
    headStyles: { fillColor: gold, textColor: primaryDark, fontStyle: 'bold', font: 'LiberationSans' },
    bodyStyles: { fillColor: secondaryDark, textColor: [255, 255, 255], font: 'LiberationSans', fontSize: 8.5 },
    alternateRowStyles: { fillColor: primaryDark },
  });

  // Render Vector Bodygraph on the right (x from 125 to 195, scale = 0.20)
  const offsetX = 125;
  const offsetY = currentY - 5;
  const scale = 0.20;

  // Draw Bodygraph channels background lines
  doc.setLineWidth(1.0);
  doc.setDrawColor(80, 90, 110);
  for (const ch of CHANNELS) {
    const g1 = ch.gates[0];
    const g2 = ch.gates[1];
    const c1 = GATE_COORDS[g1];
    const c2 = GATE_COORDS[g2];
    if (!c1 || !c2) continue;
    
    const p1x = offsetX + (c1.x - 40) * scale;
    const p1y = offsetY + (c1.y - 10) * scale;
    const p2x = offsetX + (c2.x - 40) * scale;
    const p2y = offsetY + (c2.y - 10) * scale;

    doc.line(p1x, p1y, p2x, p2y);
  }

  // Draw active channel halves
  doc.setLineWidth(1.8);
  for (const ch of CHANNELS) {
    const g1 = ch.gates[0];
    const g2 = ch.gates[1];
    const c1 = GATE_COORDS[g1];
    const c2 = GATE_COORDS[g2];
    if (!c1 || !c2) continue;

    const hasCon1 = chart.conscious.some(p => p.gate === g1);
    const hasUncon1 = chart.unconscious.some(p => p.gate === g1);
    const hasCon2 = chart.conscious.some(p => p.gate === g2);
    const hasUncon2 = chart.unconscious.some(p => p.gate === g2);

    const active1 = hasCon1 || hasUncon1;
    const active2 = hasCon2 || hasUncon2;

    const p1x = offsetX + (c1.x - 40) * scale;
    const p1y = offsetY + (c1.y - 10) * scale;
    const p2x = offsetX + (c2.x - 40) * scale;
    const p2y = offsetY + (c2.y - 10) * scale;

    const midX = (p1x + p2x) / 2;
    const midY = (p1y + p2y) / 2;

    if (active1) {
      const color1 = hasCon1 ? [255, 255, 255] : [230, 70, 70];
      doc.setDrawColor(color1[0], color1[1], color1[2]);
      doc.line(p1x, p1y, midX, midY);
    }
    if (active2) {
      const color2 = hasCon2 ? [255, 255, 255] : [230, 70, 70];
      doc.setDrawColor(color2[0], color2[1], color2[2]);
      doc.line(p2x, p2y, midX, midY);
    }
  }

  // Helper to draw center shapes
  const drawCenterShape = (center: CenterCode, x: number, y: number, size: number, isDefined: boolean, defaultColorHex: string) => {
    let fillColor = [30, 41, 59]; // dark gray background for undefined
    if (isDefined) {
      const r = parseInt(defaultColorHex.substring(1, 3), 16);
      const g = parseInt(defaultColorHex.substring(3, 5), 16);
      const b = parseInt(defaultColorHex.substring(5, 7), 16);
      fillColor = [r, g, b];
    }
    doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.4);

    const coord = CENTER_COORDS[center];
    const s = size * scale;
    const px = offsetX + (x - 40) * scale;
    const py = offsetY + (y - 10) * scale;

    if (coord.shape === 'triangle') {
      doc.triangle(px, py - s, px - s, py + s/2, px + s, py + s/2, 'FD');
    } else if (coord.shape === 'triangle-down') {
      doc.triangle(px, py + s, px - s, py - s/2, px + s, py - s/2, 'FD');
    } else if (coord.shape === 'triangle-right') {
      doc.triangle(px + s, py, px - s/2, py - s, px - s/2, py + s, 'FD');
    } else if (coord.shape === 'triangle-left') {
      doc.triangle(px - s, py, px + s/2, py - s, px + s/2, py + s, 'FD');
    } else if (coord.shape === 'square') {
      doc.rect(px - s, py - s, s * 2, s * 2, 'FD');
    } else if (coord.shape === 'diamond') {
      doc.triangle(px, py - s, px + s, py, px - s, py, 'FD');
      doc.triangle(px, py + s, px + s, py, px - s, py, 'FD');
    }
  };

  // Draw all 9 centers
  const centerKeys: CenterCode[] = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Sacral', 'Root', 'Spleen', 'SolarPlexus'];
  for (const center of centerKeys) {
    const isDefined = chart.definedCenters.includes(center);
    const coord = CENTER_COORDS[center];
    drawCenterShape(center, coord.x, coord.y, coord.s, isDefined, coord.color);
  }

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // --- Section 2: Detailed Core Properties ---
  const coreParams = [
    { key: chart.type, title: "Tasarım Tipi" },
    { key: chart.authority, title: "İç Otorite" },
    { key: chart.strategy, title: "Strateji" },
    { key: chart.signature, title: "İmza (Hizalanma İşareti)" },
    { key: chart.notSelfTheme, title: "Benlik Olmayan Tema (Direnç Sinyali)" }
  ];

  for (const item of coreParams) {
    const normalizedKey = normalizeHDKey(item.key, chart.type);
    const detail = HD_DETAILS_MAP[normalizedKey];
    if (!detail) continue;

    checkSpace(50);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text(`${item.title}: ${normalizedKey}`, 20, currentY);
    currentY += 7;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(230, 230, 230);
    currentY = drawTextWithBold(doc, detail.description, 20, currentY, 170, 5.5);
    currentY += 10;
  }

  // --- Profile Details ---
  const profileDetails = profilesMap[chart.profile] || `${chart.profile} profili, hayattaki temel duruşunuzu simgeler.`;
  checkSpace(50);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text(`Profil Yapısı: ${chart.profile}`, 20, currentY);
  currentY += 7;

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  currentY = drawTextWithBold(doc, profileDetails, 20, currentY, 170, 5.5);
  currentY += 10;

  // --- Incarnation Cross ---
  const crossDetails = getIncarnationCrossDetails(chart.incarnationCross);
  checkSpace(70);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text("Yaşam Amacı (Enkarnasyon Haçı)", 20, currentY);
  currentY += 7;

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  currentY = drawTextWithBold(doc, crossDetails, 20, currentY, 170, 5.5);
  currentY += 12;

  // --- Holistic Synthesis ---
  const synthesis = getHolisticSynthesisText(chart.type);
  checkSpace(70);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text(synthesis.title, 20, currentY);
  currentY += 7;

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  currentY = drawTextWithBold(doc, `${synthesis.text1}\n\n${synthesis.text2}`, 20, currentY, 170, 5.5);
  currentY += 12;

  // --- Section 3: Energy Centers Analysis ---
  doc.addPage();
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 297, 'F');
  currentY = 25;

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text("Enerji Merkezleri Çözümlemesi", 20, currentY);
  currentY += 10;

  for (const center of centerKeys) {
    const isDefined = chart.definedCenters.includes(center);
    const centerName = CENTER_NAMES[center] || center;
    const centerDesc = CENTER_DESCRIPTIONS[center];

    checkSpace(45);
    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    const statusText = isDefined ? "Tanımlı / Renkli" : "Açık / Beyaz";
    doc.text(`${centerName} (${statusText})`, 20, currentY);
    currentY += 7;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(230, 230, 230);
    const desc = isDefined ? centerDesc.defined : centerDesc.undefined;
    currentY = drawTextWithBold(doc, desc, 20, currentY, 170, 5.5);
    currentY += 10;
  }

  // --- Section 4: Planetary Activations (Gates) ---
  doc.addPage();
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 297, 'F');
  currentY = 25;

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text("Gezegen Kapı Aktivasyonları", 20, currentY);
  currentY += 10;

  const tableRows: any[] = [];
  const planetTranslations: Record<string, string> = {
    Sun: 'Güneş', Earth: 'Dünya', Moon: 'Ay', NorthNode: 'Kuzey Düğüm', SouthNode: 'Güney Düğüm',
    Mercury: 'Merkür', Venus: 'Venüs', Mars: 'Mars', Jupiter: 'Jüpiter', Saturn: 'Satürn',
    Uranus: 'Uranüs', Neptune: 'Neptün', Pluto: 'Plüton'
  };

  for (let i = 0; i < chart.conscious.length; i++) {
    const con = chart.conscious[i];
    const uncon = chart.unconscious[i];
    const planetSymbol = PLANET_SYMBOLS[con.planet] || '';
    const planetName = planetTranslations[con.planet] || con.planet;
    
    const conText = `${con.gate}.${con.line} (${GATE_NAMES[con.gate]?.split(' / ')[0] || ''})`;
    const unconText = `${uncon.gate}.${uncon.line} (${GATE_NAMES[uncon.gate]?.split(' / ')[0] || ''})`;

    tableRows.push([
      tr(`${planetSymbol} ${planetName}`),
      tr(conText),
      tr(unconText)
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: 20, right: 20 },
    head: [['Gezegen', 'Kişilik (Bilinçli - Siyah)', 'Tasarım (Bilinçdışı - Kırmızı)']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: gold, textColor: primaryDark, fontStyle: 'bold', font: 'LiberationSans' },
    bodyStyles: { fillColor: secondaryDark, textColor: [255, 255, 255], font: 'LiberationSans' },
    alternateRowStyles: { fillColor: primaryDark },
  });

  // Save the PDF
  doc.save(`Human_Design_Analiz_Raporu_${locationStr.replace(/\s+/g, '_')}.pdf`);
};
