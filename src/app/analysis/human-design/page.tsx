"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, Zap, Search, X } from 'lucide-react';
import moment from 'moment-timezone';
import { generateChart, HumanDesignChart, CenterCode, PLANET_SYMBOLS, CHANNELS } from '@/utils/HumanDesignEngine';
import { useContent } from '@/lib/useContent';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { AstroCity } from '@/features/astrology/engine/AstrologyConstants';

const COLORS = {
  background: '#0F172A',
  primary: '#32D74B',
  accent: '#E63946',
  conscious: '#FFFFFF',
  text: '#E0E0E0',
  textMuted: '#9CA3AF',
  cardBg: 'rgba(15, 23, 42, 0.8)',
};

const CENTER_COORDS: Record<CenterCode, { x: number, y: number, shape: string, color: string, s: number }> = {
  Head: { x: 200, y: 45, shape: 'triangle', color: '#F4D03F', s: 28 },
  Ajna: { x: 200, y: 115, shape: 'triangle-down', color: '#A8D5BA', s: 28 },
  Throat: { x: 200, y: 190, shape: 'square', color: '#D2B48C', s: 25 },
  G: { x: 200, y: 300, shape: 'diamond', color: '#F4D03F', s: 35 },
  Heart: { x: 255, y: 340, shape: 'triangle', color: '#FFF', s: 24 },
  Sacral: { x: 200, y: 400, shape: 'square', color: '#E1464F', s: 25 },
  Root: { x: 200, y: 480, shape: 'square', color: '#FFF', s: 25 },
  Spleen: { x: 90, y: 390, shape: 'triangle-right', color: '#FFF', s: 30 },
  SolarPlexus: { x: 310, y: 390, shape: 'triangle-left', color: '#D2B48C', s: 30 },
};

const GATE_COORDS: Record<number, { x: number, y: number }> = {
  // Head
  64: { x: 183, y: 70 }, 61: { x: 200, y: 70 }, 63: { x: 217, y: 70 },
  // Ajna
  47: { x: 183, y: 90 }, 24: { x: 200, y: 90 }, 4: { x: 217, y: 90 },
  17: { x: 183, y: 109 }, 43: { x: 200, y: 136 }, 11: { x: 217, y: 109 },
  // Throat
  62: { x: 183, y: 168 }, 23: { x: 200, y: 168 }, 56: { x: 217, y: 168 },
  16: { x: 178, y: 176 }, 35: { x: 222, y: 176 },
  20: { x: 178, y: 190 }, 12: { x: 222, y: 190 },
  45: { x: 222, y: 204 },
  31: { x: 186, y: 212 }, 8: { x: 200, y: 212 }, 33: { x: 214, y: 212 },
  // G
  7: { x: 186, y: 279 }, 1: { x: 200, y: 272 }, 13: { x: 214, y: 279 },
  10: { x: 172, y: 300 }, 25: { x: 228, y: 300 },
  15: { x: 186, y: 321 }, 2: { x: 200, y: 328 }, 46: { x: 214, y: 321 },
  // Heart
  21: { x: 255, y: 322 }, 51: { x: 240, y: 350 },
  26: { x: 240, y: 360 }, 40: { x: 270, y: 360 },
  // Sacral
  5: { x: 186, y: 378 }, 14: { x: 200, y: 378 }, 29: { x: 214, y: 378 },
  34: { x: 178, y: 386 }, 27: { x: 178, y: 414 },
  59: { x: 222, y: 400 },
  42: { x: 186, y: 422 }, 3: { x: 200, y: 422 }, 9: { x: 214, y: 422 },
  // Root
  53: { x: 186, y: 458 }, 60: { x: 200, y: 458 }, 52: { x: 214, y: 458 },
  54: { x: 178, y: 468 }, 19: { x: 222, y: 468 },
  38: { x: 178, y: 480 }, 39: { x: 222, y: 480 },
  58: { x: 178, y: 492 }, 41: { x: 222, y: 492 },
  // Spleen
  48: { x: 65, y: 362 }, 57: { x: 85, y: 372 }, 44: { x: 115, y: 387 },
  50: { x: 105, y: 398 }, 32: { x: 85, y: 408 }, 28: { x: 75, y: 412 }, 18: { x: 65, y: 418 },
  // Solar Plexus
  36: { x: 335, y: 362 }, 22: { x: 315, y: 372 }, 37: { x: 295, y: 382 },
  6: { x: 285, y: 387 }, 49: { x: 295, y: 398 }, 55: { x: 315, y: 408 }, 30: { x: 335, y: 418 },
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
    description: "Manifesting Generator'lar (M.G.), nüfusun yaklaşık %33'ünü oluşturur. Hem Jeneratörlerin sürdürülebilir yaşam enerjisine, hem de Manifestörlerin hızlı eyleme geçme ve başlatma gücüne sahiptirler. Çok yönlüdürler, aynı anda birden fazla işi yapabilirler. Stratejileri, yanıt vermek, harekete geçmeden önce bilgilendirmek ve süreci takip etmektir."
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
    description: "Benlik (Self-Projected) Otoritesi, kalbinizin ve kimliğinizin sesini duymakla ilgilidir. Sizin için en doğru karar, başkalarıyla konuşurken ağzınızdan filtresizce çıkan kendi sözlerinizde gizlidir. Karar almadan önce güvendiğiniz dostlarınızla sohbet edin ve ne söylediğinizi, sesinizin tonunu dinleyin; gerçeğiniz orada belirecektir."
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
    description: "Manifesting Generator'lar için geçerli stratejidir. Eyleme geçmeden önce etrafınızdaki insanları bilgilendirerek dirençle karşılaşmayı engeller ve eylemi Sakral merkezinizin verdiği yanıta göre şekillendirirsiniz."
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
    description: "Jeneratör ve Manifesting Generator'ların enerjilerini sevdikleri işlerde doğru şekilde tükettiklerinde hissettikleri derin içsel doyumdur. Akşam yatağa yorgun ama mutlu girmek tatmin imzanızdır."
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

const getProfileDetails = (profile: string) => {
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
  return {
    subtitle: "Profil Yapısı",
    description: profilesMap[profile] || `${profile} profili, hayattaki temel duruşunuzu, öğrenme ve etkileşim kurma modelinizi simgeler.`
  };
};

const getIncarnationCrossDetails = (cross: string) => {
  return {
    subtitle: "Enkarnasyon Haçı",
    description: `${cross} Enkarnasyon Haçı, hayatınızdaki en büyük yaşam amacınızı, kaderinizi ve bu dünyaya getirdiğiniz temel enerjisel misyonu temsil eder. Dört ana kapınızın (Kişilik ve Tasarım Güneş/Dünya) birleşimiyle oluşur.`
  };
};

const getHolisticSynthesisText = (type: string) => {
  if (type === "Yansıtıcı" || type === "Reflector") {
    return {
      title: "Ruhsal ve Yaşamsal Sentez Analiziniz",
      text1: "Siz dünya nüfusunun sadece %1'ini oluşturan en nadir tiplerden birisiniz. Enerji merkezlerinizin tamamı açık olduğu için, adeta yaşayan bir ayna gibi çevrenizin enerjisini yansıtırsınız. Bu alıcı/yansıtıcı (dişil/yin) ve sezgisel gücünüz -ki bu durum biyolojik cinsiyetten tamamen bağımsız, enerjisel bir açık olma ve dinleme halidir- çevrenizdeki insanların ve bulunduğunuz mekanların sağlık ve dengesini anında ölçebilmenizi sağlar.",
      text2: "Yaşamdaki en önemli rehberiniz doğru ortamlarda bulunmaktır. Eğer bulunduğunuz yerdeki insanlar sağlıksız veya huzursuzsa, siz de fiziksel olarak hastalanabilirsiniz. Çevrenizi son derece seçici oluşturmalısınız. Kararlarınızı aceleye getirmemeli, içinizdeki netliğin olgunlaşması için 28 günlük Ay döngüsünü beklemelisiniz."
    };
  }
  if (type === "Projektör" || type === "Projector") {
    return {
      title: "Ruhsal ve Yaşamsal Sentez Analiziniz",
      text1: "Siz diğer insanların enerjisini okumak, yönetmek ve onlara rehberlik etmek için buradasınız. Doğal bir sezgisel anlayışa ve liderlik gücüne sahipsiniz. Ancak bu gücün doğru çalışabilmesi için davet edilmeyi beklemelisiniz. Bu alıcı (dişil/yin) duruşunuz -ki bu durum biyolojik cinsiyetten bağımsız, enerjisel bir açık olma, sabır ve dinleme halidir- sizi doğru insanlarla buluşturacak anahtardır.",
      text2: "Eğer davet edilmeden kendinizi ve fikirlerinizi öne sürerseniz, enerjiniz görülmeyecek ve burukluk (bitterness) hissedeceksiniz. Kendi değerinizi bilin, doğru insanların sizi keşfetmesini bekleyin. Dinlenmek, yalnız kalmak ve enerjinizi korumak en büyük gücünüzdür."
    };
  }
  if (type === "Jeneratör" || type === "Generator") {
    return {
      title: "Ruhsal ve Yaşamsal Sentez Analiziniz",
      text1: "Siz hayatın ve üretkenliğin sürdürülebilir yaşam enerjisi kaynağısınız. Tanımlı Sakral merkezlerinizle durmaksızın çalışabilir, üretebilir ve inşa edebilirsiniz. Ancak bu eril/hareket enerjisini doğru yerlerde harcamak hayattaki en büyük sınavınızdır.",
      text2: "Kararlarınızı mantıkla almak yerine, hayatın size sunduğu uyarılara Sakral merkezinizin verdiği anlık 'gut feeling' (karın tepkisi) yanıtına göre şekillendirmelisiniz. Sevdiğiniz işleri yaptığınızda hissettiğiniz tatmin duygusu sizin doğru yolda olduğunuzun kanıtıdır."
    };
  }
  if (type === "Manifesting Generator") {
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

export default function HumanDesignPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const [name, setName] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  
  const [city, setCity] = useState<AstroCity | null>(null);
  const [activeGateId, setActiveGateId] = useState<number | null>(null);
  const [activeDetail, setActiveDetail] = useState<{ title: string; subtitle?: string; badge?: string; description: string } | null>(null);

  const { data: gatesData } = useContent<any[]>('/api/content/hd-gates');
  const activeGateData =
    activeGateId && gatesData ? gatesData.find((g: any) => g.id === activeGateId) : null;
  
  const [chart, setChart] = useState<HumanDesignChart | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr || !timeStr || !city) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      try {
        const dateTimeString = `${dateStr} ${timeStr}`;
        const m = moment.tz(dateTimeString, "YYYY-MM-DD HH:mm", city.tz);
        
        if (!m.isValid()) {
          alert("Girilen tarih/saat geçerli değil.");
          setIsAnalyzing(false);
          return;
        }

        const result = generateChart(m.toDate());
        setChart(result);
        setShowResult(true);
      } catch (err) {
        console.error(err);
        alert("Hesaplama sırasında bir hata oluştu.");
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500);
  };

  const drawChannels = () => {
    if (!chart) return null;
    const elements: React.ReactNode[] = [];

    // 16-48 is a long straight channel that crosses the Integration curves. 
    // Render it last so it appears on top as a bridge.
    const sortedChannels = [...CHANNELS].sort((a, b) => {
      if (a.id === 1648) return 1;
      if (b.id === 1648) return -1;
      return 0;
    });

    // 1. Arka plan çizgileri (gri zemin)
    sortedChannels.forEach(ch => {
       const g1 = ch.gates[0];
       const g2 = ch.gates[1];
       const c1 = GATE_COORDS[g1];
       const c2 = GATE_COORDS[g2];
       let p0x = c1.x, p0y = c1.y;
       let p2x = c2.x, p2y = c2.y;

       let bgPathD = `M ${p0x} ${p0y} L ${p2x} ${p2y}`;
       
       // Curved Integration Paths
       if ([1020, 1034, 2034, 2057, 1648].includes(ch.id)) {
         let cx = 0, cy = 0;
         if (ch.id === 1020) { cx = 120; cy = p2y; } // matches 20
         else if (ch.id === 1034) { cx = 60; cy = p0y; } // matches 10
         else if (ch.id === 2034) { cx = 80; cy = p0y; } // matches 20
         else if (ch.id === 2057) { cx = 40; cy = p0y; } // matches 20
         else if (ch.id === 1648) { cx = 0; cy = Math.min(p0y, p2y); } // wide outer curve
         bgPathD = `M ${p0x} ${p0y} Q ${cx} ${cy} ${p2x} ${p2y}`;
       }

       elements.push(<path d={bgPathD} stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" key={`bg-out-${ch.id}`} />);
       elements.push(<path d={bgPathD} stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" key={`bg-${ch.id}`} />);
    });
    
    // 2. Aktif kanallar (yarım/tam)
    sortedChannels.forEach(ch => {
       const g1 = ch.gates[0];
       const g2 = ch.gates[1];
       const c1 = GATE_COORDS[g1];
       const c2 = GATE_COORDS[g2];
       if (!c1 || !c2) return;
       let p0x = c1.x, p0y = c1.y;
       let p2x = c2.x, p2y = c2.y;

       const mx = (p0x + p2x) / 2;
       const my = (p0y + p2y) / 2;
       let g1Path = `M ${p0x} ${p0y} L ${mx} ${my}`;
       let g2Path = `M ${p2x} ${p2y} L ${mx} ${my}`;

       // Curved Integration Paths (dynamic bezier midpoints)
       if ([1020, 1034, 2034, 2057, 1648].includes(ch.id)) {
         let cx = 0, cy = 0;
         if (ch.id === 1020) { cx = 120; cy = p2y; }
         else if (ch.id === 1034) { cx = 60; cy = p0y; }
         else if (ch.id === 2034) { cx = 80; cy = p0y; }
         else if (ch.id === 2057) { cx = 40; cy = p0y; }
         else if (ch.id === 1648) { cx = 0; cy = Math.min(p0y, p2y); }
         
         const pmx = 0.25 * p0x + 0.5 * cx + 0.25 * p2x;
         const pmy = 0.25 * p0y + 0.5 * cy + 0.25 * p2y;
         
         const c1x = 0.5 * (p0x + cx), c1y = 0.5 * (p0y + cy);
         const c2x = 0.5 * (cx + p2x), c2y = 0.5 * (cy + p2y);

         g1Path = `M ${p0x} ${p0y} Q ${c1x} ${c1y} ${pmx} ${pmy}`;
         g2Path = `M ${p2x} ${p2y} Q ${c2x} ${c2y} ${pmx} ${pmy}`;
       }

       const g1Cons = chart.conscious.some(p => p.gate === g1);
       const g1Unc = chart.unconscious.some(p => p.gate === g1);
       const g2Cons = chart.conscious.some(p => p.gate === g2);
       const g2Unc = chart.unconscious.some(p => p.gate === g2);

       const drawHalf = (pathD: string, isConscious: boolean, isUnconscious: boolean, keyPrefix: string) => {
          if (!isConscious && !isUnconscious) return;
          
          elements.push(<path d={pathD} stroke="#000" strokeWidth="8" strokeLinecap="butt" strokeLinejoin="round" fill="none" key={`${keyPrefix}-outline`} />);
          
          if (isConscious && isUnconscious) {
            elements.push(<path d={pathD} stroke="#111" strokeWidth="6" strokeLinecap="butt" strokeLinejoin="round" fill="none" key={`${keyPrefix}-b`} />);
            elements.push(<path d={pathD} stroke={COLORS.accent} strokeWidth="6" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="3 3" fill="none" key={`${keyPrefix}-r`} />);
          } else if (isConscious) {
            elements.push(<path d={pathD} stroke="#111" strokeWidth="6" strokeLinecap="butt" strokeLinejoin="round" fill="none" key={`${keyPrefix}-con`} />);
          } else if (isUnconscious) {
            elements.push(<path d={pathD} stroke={COLORS.accent} strokeWidth="6" strokeLinecap="butt" strokeLinejoin="round" fill="none" key={`${keyPrefix}-unc`} />);
          }
       };

       drawHalf(g1Path, g1Cons, g1Unc, `g1-${ch.id}`);
       drawHalf(g2Path, g2Cons, g2Unc, `g2-${ch.id}`);
    });
    
    return elements;
  };

  const drawCenters = () => {
    if (!chart) return null;
    return Object.entries(CENTER_COORDS).map(([center, def]) => {
      const isDefined = chart.definedCenters.includes(center as CenterCode);
      
      const fill = isDefined ? def.color : '#FFFFFF';
      const stroke = isDefined ? 'none' : '#94A3B8';
      const s = def.s;
      
      const drawShape = () => {
        const sw = isDefined ? "0" : "1";
        if (def.shape === 'square') {
          return <rect x={def.x - s} y={def.y - s} width={s*2} height={s*2} fill={fill} stroke={stroke} strokeWidth={sw} key="mg" />;
        } else if (def.shape === 'diamond') {
          return <polygon points={`${def.x},${def.y-s-2} ${def.x+s+2},${def.y} ${def.x},${def.y+s+2} ${def.x-s-2},${def.y}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle') {
          return <polygon points={`${def.x},${def.y-s} ${def.x+s},${def.y+s} ${def.x-s},${def.y+s}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle-down') {
          return <polygon points={`${def.x-s},${def.y-s} ${def.x+s},${def.y-s} ${def.x},${def.y+s}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle-left') {
          return <polygon points={`${def.x+s},${def.y-s} ${def.x+s},${def.y+s} ${def.x-s},${def.y}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        } else if (def.shape === 'triangle-right') {
          return <polygon points={`${def.x-s},${def.y-s} ${def.x+s},${def.y} ${def.x-s},${def.y+s}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" key="mg" />;
        }
        return null;
      };

      return (
        <g 
          key={center} 
          className="cursor-pointer hover:opacity-85 transition-opacity"
          onClick={() => {
            setActiveGateId(null);
            const isDefined = chart.definedCenters.includes(center as CenterCode);
            const centerName = CENTER_NAMES[center as CenterCode];
            const desc = CENTER_DESCRIPTIONS[center as CenterCode][isDefined ? 'defined' : 'undefined'];
            setActiveDetail({
              title: centerName,
              subtitle: "Enerji Merkezi",
              badge: isDefined ? "Tanımlı (Renkli)" : "Tanımsız (Beyaz)",
              description: `Bu merkez haritanızda ${isDefined ? 'TANIMLI' : 'TANIMSIZ'} durumdadır.\n\n${desc}`
            });
          }}
        >
          {drawShape()}
        </g>
      );
    });
  }

  const drawGates = () => {
    if (!chart) return null;
    return Object.entries(GATE_COORDS).map(([gateId, coords]) => {
      const gNum = parseInt(gateId);
      const isCons = chart.conscious.some(p => p.gate === gNum);
      const isUnc = chart.unconscious.some(p => p.gate === gNum);
      const isActive = isCons || isUnc;
      
      const textX = coords.x;
      const textY = coords.y;

      return (
        <g 
          key={`glabel-${gateId}`} 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            setActiveDetail(null);
            setActiveGateId(gNum);
          }}
        >
          {isActive && <circle cx={textX} cy={textY} r={5.5} fill="#000" stroke="none" />}
          <text x={textX} y={textY} dominantBaseline="central" fontSize="8" fill={isActive ? "#FFF" : "#64748B"} stroke={isActive ? "none" : "#FFF"} strokeWidth={isActive ? "0" : "2"} paintOrder="stroke fill" fontWeight={isActive ? "900" : "bold"} textAnchor="middle">{gNum}</text>
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 relative">
      
      

      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 flex items-center text-mystic-text-muted hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Geri Dön
        </button>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#32D74B]/10 border border-[#32D74B]/30 flex items-center justify-center text-[#32D74B]">
              <Zap size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">İnsan Tasarımı Haritası</h1>
            </div>
          </div>
        </div>

        {!showResult ? (
          <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#32D74B]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2 animate-pulse">Vücut Grafiğiniz Çıkarılıyor...</h3>
                <p className="text-sm text-white/60">Gezegen konumları ve enerji merkezleri hesaplanıyor</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Tarihi *</label>
                  <input 
                    required 
                    type="date" 
                    min="1900-01-01"
                    max="2100-12-31"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#32D74B] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğum Saati *</label>
                  <input 
                    required 
                    type="time" 
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#32D74B] transition-colors" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-mystic-text-muted mb-2">Doğduğunuz Şehir *</label>
                <LocationAutocomplete
                  onSelect={(c) => setCity(c)}
                  defaultDisplay={city ? city.name : ''}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#32D74B] transition-colors"
                />
              </div>

              <button type="submit" className="w-full bg-[#32D74B] hover:bg-[#16a34a] text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(50,215,75,0.3)] mt-4">
                Haritayı Hesapla
              </button>
            </form>
          </div>
        ) : chart && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
              
              <div className="flex flex-col items-center justify-center mb-10">
                 <h2 className="text-3xl font-serif text-white mb-2">Kişisel Haritanız</h2>
                 <p className="text-mystic-text-muted">{dateStr} • {timeStr} • {city ? city.name : ''}</p>
              </div>

              <div className="flex flex-col lg:flex-row justify-center items-start gap-8 mb-10">
                {/* Left Column - Design */}
                <div className="w-full lg:w-48 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                  <h3 className="text-center font-bold uppercase tracking-wider text-[#E63946] mb-2 text-sm">Design</h3>
                  {chart.unconscious.map((p, i) => (
                    <div 
                      key={`unc-${i}`} 
                      className="flex items-center justify-between px-2 py-1 bg-white/5 rounded border border-white/5 cursor-pointer hover:bg-white/10 hover:border-[#E63946]/30 transition-all"
                      onClick={() => {
                        setActiveDetail(null);
                        setActiveGateId(p.gate);
                      }}
                    >
                      <span className="text-xl font-bold text-[#E63946]">{PLANET_SYMBOLS[p.planet]}</span>
                      <span className="text-sm font-bold text-[#E63946]">{p.gate}.{p.line}</span>
                    </div>
                  ))}
                </div>

                {/* Center SVG BodyGraph */}
                <div className="w-full max-w-md aspect-[320/540] bg-gradient-to-b from-[#e6c27a] to-[#c59b3f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
                  <svg width="100%" height="100%" viewBox="40 10 320 540" className="absolute inset-0">
                    {drawChannels()}
                    {drawCenters()}
                    {drawGates()}
                  </svg>
                </div>

                {/* Right Column - Personality */}
                <div className="w-full lg:w-48 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                  <h3 className="text-center font-bold uppercase tracking-wider text-white mb-2 text-sm">Personality</h3>
                  {chart.conscious.map((p, i) => (
                    <div 
                      key={`con-${i}`} 
                      className="flex items-center justify-between px-2 py-1 bg-white/5 rounded border border-white/5 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
                      onClick={() => {
                        setActiveDetail(null);
                        setActiveGateId(p.gate);
                      }}
                    >
                      <span className="text-sm font-bold text-white">{p.gate}.{p.line}</span>
                      <span className="text-xl font-bold text-white">{PLANET_SYMBOLS[p.planet]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setActiveGateId(null);
                    const match = HD_DETAILS_MAP[chart.type];
                    setActiveDetail({
                      title: chart.type,
                      subtitle: match?.subtitle || "Tür / Tip",
                      description: match?.description || ""
                    });
                  }}
                >
                  <span className="block text-mystic-text-muted text-sm mb-1">Tür</span>
                  <span className="text-lg font-bold text-white">{chart.type}</span>
                </div>
                <div 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setActiveGateId(null);
                    const match = HD_DETAILS_MAP[chart.authority];
                    setActiveDetail({
                      title: chart.authority,
                      subtitle: match?.subtitle || "İç Otorite",
                      description: match?.description || ""
                    });
                  }}
                >
                  <span className="block text-mystic-text-muted text-sm mb-1">İç Otorite</span>
                  <span className="text-lg font-bold text-white">{chart.authority}</span>
                </div>
                <div 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setActiveGateId(null);
                    const match = HD_DETAILS_MAP[chart.strategy];
                    setActiveDetail({
                      title: chart.strategy,
                      subtitle: match?.subtitle || "Strateji",
                      description: match?.description || ""
                    });
                  }}
                >
                  <span className="block text-mystic-text-muted text-sm mb-1">Strateji</span>
                  <span className="text-lg font-bold text-white">{chart.strategy}</span>
                </div>
                <div 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setActiveGateId(null);
                    const match = getProfileDetails(chart.profile);
                    setActiveDetail({
                      title: `Profil ${chart.profile}`,
                      subtitle: match.subtitle,
                      description: match.description
                    });
                  }}
                >
                  <span className="block text-mystic-text-muted text-sm mb-1">Profil</span>
                  <span className="text-lg font-bold text-white">{chart.profile}</span>
                </div>
                <div 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setActiveGateId(null);
                    const match = HD_DETAILS_MAP[chart.signature];
                    setActiveDetail({
                      title: chart.signature,
                      subtitle: match?.subtitle || "İmza (Hizalanma Ödülü)",
                      description: match?.description || ""
                    });
                  }}
                >
                  <span className="block text-mystic-text-muted text-sm mb-1">İmza</span>
                  <span className="text-lg font-bold text-white">{chart.signature}</span>
                </div>
                <div 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setActiveGateId(null);
                    const match = HD_DETAILS_MAP[chart.notSelfTheme];
                    setActiveDetail({
                      title: chart.notSelfTheme,
                      subtitle: match?.subtitle || "Benlik Olmayan Tema",
                      description: match?.description || ""
                    });
                  }}
                >
                  <span className="block text-mystic-text-muted text-sm mb-1">Benlik Olmayan Tema</span>
                  <span className="text-lg font-bold text-white">{chart.notSelfTheme}</span>
                </div>
                <div 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 lg:col-span-2 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setActiveGateId(null);
                    const match = getIncarnationCrossDetails(chart.incarnationCross);
                    setActiveDetail({
                      title: chart.incarnationCross,
                      subtitle: match.subtitle,
                      description: match.description
                    });
                  }}
                >
                  <span className="block text-mystic-text-muted text-sm mb-1">Enkarnasyon Haçı</span>
                  <span className="text-lg font-bold text-white">{chart.incarnationCross}</span>
                </div>
              </div>

              {/* Bütünsel Yorum (Holistic Synthesis) */}
              {(() => {
                const synthesis = getHolisticSynthesisText(chart.type);
                return (
                  <div className="bg-gradient-to-r from-emerald-950/20 to-teal-950/20 rounded-3xl border border-emerald-500/10 p-6 md:p-8 space-y-6 mb-8 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-[#32D74B]" />
                      <h3 className="text-2xl font-serif text-white font-bold">{synthesis.title}</h3>
                    </div>
                    <div className="space-y-4 text-gray-300 leading-relaxed text-[15px] md:text-base">
                      <p>{synthesis.text1}</p>
                      <p>{synthesis.text2}</p>
                    </div>
                  </div>
                );
              })()}
              
              <div className="flex justify-center">
                <button 
                  onClick={() => {
                    setShowResult(false);
                    setActiveDetail(null);
                    setActiveGateId(null);
                  }} 
                  className="text-[#32D74B] hover:text-white transition-colors underline text-sm"
                >
                  Yeni Bir Harita Hesapla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SIDEBAR for Details */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-[#0F172A]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${(activeGateId || activeDetail) ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {activeGateId && (
          <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-[#32D74B]/20 flex items-center justify-center border border-[#32D74B]/30">
                <span className="text-[#32D74B] font-bold text-xl">{activeGateId}</span>
              </div>
              <button 
                onClick={() => setActiveGateId(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {activeGateData ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-150 fill-mode-both text-left">
                <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                  {activeGateData.title}
                </h2>
                
                <div className="bg-black/30 rounded-2xl p-5 border border-white/5 space-y-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#32D74B] w-20 shrink-0 pt-0.5">I Ching</span>
                      <span className="text-sm text-gray-300 font-medium">{activeGateData.iching}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 italic pl-[92px] -mt-1 leading-normal">Bu kapının felsefi sembol ismi ve arketipi</span>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#E63946] w-20 shrink-0 pt-0.5">Astroloji</span>
                      <span className="text-sm text-gray-300 font-medium">{activeGateData.astrology}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 italic pl-[92px] -mt-1 leading-normal">Bu kapının gökyüzündeki burç koordinatı</span>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#F4D03F] w-20 shrink-0 pt-0.5">Biyoloji</span>
                      <span className="text-sm text-gray-300 font-medium">{activeGateData.biology}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 italic pl-[92px] -mt-1 leading-normal">Bu kapının vücutta etkilediği organ veya salgı bezi</span>
                  </div>
                </div>

                <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-[15px]">
                  <p>{activeGateData.description}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Loader2 size={32} className="animate-spin text-white mb-4" />
                <p className="text-sm text-white">Kapı verisi yükleniyor...</p>
              </div>
            )}
          </div>
        )}

        {activeDetail && (
          <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar text-left">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#32D74B]">
                {activeDetail.subtitle || "Human Design Bilgisi"}
              </span>
              <button 
                onClick={() => setActiveDetail(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-150 fill-mode-both">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                  {activeDetail.title}
                </h2>
                {activeDetail.badge && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#32D74B]/20 text-[#32D74B] border border-[#32D74B]/30 shrink-0">
                    {activeDetail.badge}
                  </span>
                )}
              </div>

              <div className="w-full h-px bg-white/5" />

              <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-[15px] whitespace-pre-wrap">
                <p>{activeDetail.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
