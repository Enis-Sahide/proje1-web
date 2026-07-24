import { Quiz } from './allQuizzes';

export const astrologyQuiz1: Quiz = {
  id: "astroloji_1",
  title: "1. Derece: Çıraklık Sınavı",
  description: "Fiziksel Katman (Assiah), harita okuma sentez kuralları, evlerin 1. katman dünyevi anlamları ve gezegen arketipleri sınavı. (20 Soru)",
  questions: [
    {
      id: "ast_1",
      question: "Sıradan astroloji ile '4 Katmanlı Ezoterik Astroloji' arasındaki en temel fark nedir?",
      options: [
        "Ezoterik haritanın sadece Ay burcuna odaklanması",
        "Sıradan astrolojinin sadece fiziksel (Assiah) olaylarla ilgilenmesi, ezoterik astrolojinin ise haritayı 4 derinlikte (Olay, Psikoloji, Karma, Ruhsal) okuması",
        "Ezoterik astrolojinin 14 burçtan oluşması",
        "Sıradan astrolojinin sadece Güneş merkezli (Heliocentric) hesaplama yapması"
      ],
      correctAnswerIndex: 1,
      explanation: "Sıradan astroloji sadece dünyevi/fiziksel olayları (Ne olacak?) incelerken, ezoterik astroloji ruhun tekamülünü ve 4 farklı varoluş katmanını (Assiah, Yetzirah, Briah, Atziluth) sentezler."
    },
    {
      id: "ast_2",
      question: "Harita okuma sentez formülündeki 'Kim (Aktör / İçsel Güç)' sorusunun astrolojik karşılığı hangisidir?",
      options: [
        "Gezegen",
        "Burç",
        "Ev",
        "Açı"
      ],
      correctAnswerIndex: 0,
      explanation: "Harita sentezinde; Gezegen 'Kim?' (Aktör/Güç), Burç 'Nasıl?' (Kostüm/Tarz) ve Ev 'Nerede?' (Yaşam sahnesi) sorularına yanıt verir."
    },
    {
      id: "ast_3",
      question: "Sentez formülündeki 'Nasıl (Kostüm / Tarz)' sorusuna doğum haritasında hangi unsur cevap verir?",
      options: [
        "Gezegen",
        "Ev",
        "Açı",
        "Burç"
      ],
      correctAnswerIndex: 3,
      explanation: "Burçlar, gezegen aktörlerinin rolleri sergilerken giydikleri kostümleri, yani enerjiyi nasıl ve hangi tarzda yansıtacaklarını gösterir."
    },
    {
      id: "ast_4",
      question: "Harita okumasında 'Nerede (Sahne / Yaşam Alanı)' sorusunun karşılığı hangisidir?",
      options: [
        "Gezegen",
        "Ev",
        "Burç",
        "Açı"
      ],
      correctAnswerIndex: 1,
      explanation: "Evler, gezegenlerin (aktörler) ve burçların (kostümler) kendilerini hangi somut hayat sahnesinde (ilişkiler, kariyer, para vb.) göstereceğini belirler."
    },
    {
      id: "ast_5",
      question: "Mars gezegeninin Koç burcunda ve 7. evde yer alması, sentez formülüne göre ne şekilde yorumlanır?",
      options: [
        "Kişinin kariyerinde (10. ev) çok başarılı ve sabırlı olacağı",
        "Kişinin ikili ilişkiler (7. ev) arenasında sabırsız, atılgan ve çatışmacı/rekabetçi (Mars/Koç) olabileceği",
        "Kişinin maddi konularda çok tutucu davranacağı",
        "Kardeşleriyle olan ilişkilerinde aşırı korumacı bir yapı sergileyeceği"
      ],
      correctAnswerIndex: 1,
      explanation: "Mars (Savaşçı) + Koç (Atılgan/Sabırsız) + 7. Ev (İlişkiler/Ortaklıklar) sentezlendiğinde, kişinin ilişkilerinde mücadeleci ve sabırsız bir üslup benimseyeceği anlaşılır."
    },
    {
      id: "ast_6",
      question: "Gezegenlerin birbirleriyle yaptığı açılardan 'Kare Açı (90 Derece)' neyi simgeler?",
      options: [
        "Hiç çaba harcamadan rahatça akan şanslı enerjileri",
        "İki enerjinin kaynaşarak tek bir güçlü odak noktası oluşturmasını",
        "İçsel gerilim, kriz, çatışma ve eyleme geçme zorunluluğunu",
        "İlişkilerde yansıtılan tamamlanma ve denge ihtiyacını"
      ],
      correctAnswerIndex: 2,
      explanation: "Kare açılar (90°), haritadaki en büyük motivasyon kaynaklarıdır. Kriz yaratarak kişiyi konfor alanından çıkmaya ve eyleme geçmeye zorlar."
    },
    {
      id: "ast_7",
      question: "Gezegenler arasındaki 'Üçgen Açı (120 Derece)' ne anlama gelir?",
      options: [
        "Kişinin hayatında büyük krizler ve engellerle karşılaşacağını",
        "Doğuştan gelen, zahmetsizce akan rahat enerjileri ve doğal yetenekleri",
        "Fiziksel düzeyde ani ve yıkıcı olayların yaşanacağını",
        "İki gezegenin enerjilerinin birbirini tamamen yok edeceğini"
      ],
      correctAnswerIndex: 1,
      explanation: "Üçgen açılar (120°), haritada enerjinin dirençle karşılaşmadan aktığı, doğuştan gelen olumlu yetenek ve kolaylıkları temsil eder."
    },
    {
      id: "ast_8",
      question: "Gezegenler arasındaki 'Karşıt Açı (180 Derece)' psikolojik/dünyevi olarak ne şekilde tezahür eder?",
      options: [
        "Bireyin içsel dünyasında hiçbir gerilim yaşamayacağı şeklinde",
        "İki gezegen enerjisinin tek bir noktada birleşmesi şeklinde",
        "Dış dünyada, özellikle ilişkilerde yansıtılan açık çatışmalar veya tamamlanma ihtiyacı şeklinde",
        "Kariyerde aniden gelen şans ve terfiler şeklinde"
      ],
      correctAnswerIndex: 2,
      explanation: "Karşıt açılar (180°), projeksiyon yoluyla ilişkilerimizde karşı tarafa yansıttığımız içsel zıtlıkları ve denge arayışlarını gösterir."
    },
    {
      id: "ast_9",
      question: "İki gezegenin doğum haritasında 'Kavuşum (0 Derece)' yapması neyi gösterir?",
      options: [
        "Enerjilerin birbirini tamamen bloke ettiğini",
        "İki gezegen enerjisinin birleşerek çok güçlü bir odak noktası oluşturduğunu",
        "Kişinin mutlaka yurt dışına gideceğini",
        "Ebeveynlerin çocuklukta kişiyi tamamen serbest bıraktığını"
      ],
      correctAnswerIndex: 1,
      explanation: "Kavuşum açısı (0°), iki gezegen karakterinin bir araya gelerek tek bir güçlü enerji odağı ve mizaç özelliği oluşturmasıdır."
    },
    {
      id: "ast_10",
      question: "12 Evin 1. katmanında (Fiziksel Katman); 1. Ev (Yükselen / ASC) neyi temsil eder?",
      options: [
        "Maddi kazançlarımızı ve banka hesabımızı",
        "Fiziksel görünümümüzü, beden sağlığımızı ve dış dünyaya sunduğumuz maskeyi (Persona)",
        "Eşimizle olan resmi evliliğimizi",
        "Rüyalarımızı ve bilinçaltı korkularımızı"
      ],
      correctAnswerIndex: 1,
      explanation: "1. Ev (Yükselen), ruhun enkarne olduğu fiziksel bedeni, sağlık durumunu ve dış dünya ile ilk etkileşim maskesini yönetir."
    },
    {
      id: "ast_11",
      question: "Astrolojik haritada dünyevi anlamıyla 'cüzdanımız, sahip olduğumuz mallar ve para kazanma gücümüz' hangi evdir?",
      options: [
        "2. Ev",
        "5. Ev",
        "8. Ev",
        "11. Ev"
      ],
      correctAnswerIndex: 0,
      explanation: "Fiziksel düzeyde 2. Ev, tamamen kişinin kendi çabasıyla elde ettiği maddi kaynakları, cüzdanını ve taşınır mallarını yönetir."
    },
    {
      id: "ast_12",
      question: "'Kardeşler, kuzenler, yakın çevre, kısa yolculuklar ve günlük iletişim kapasitesi' hangi evin fiziksel konularındandır?",
      options: [
        "3. Ev",
        "6. Ev",
        "9. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 0,
      explanation: "3. Ev, yakın çevremizle olan her türlü bilgi akışını, kardeşleri, kısa seyahatleri ve temel zihinsel iletişimi yönetir."
    },
    {
      id: "ast_13",
      question: "Baba ocağı, gayrimenkuller, vatan, kökler ve haritanın en dip noktasını (IC) temsil eden ev hangisidir?",
      options: [
        "1. Ev",
        "4. Ev",
        "7. Ev",
        "10. Ev"
      ],
      correctAnswerIndex: 1,
      explanation: "4. Ev (IC), ailemizi, doğduğumuz evi, köklerimizi, taşınmaz mallarımızı ve iç dünyamızın temellerini temsil eder."
    },
    {
      id: "ast_14",
      question: "Fiziksel katmanda 'romantik aşklar, çocuklar, hobiler, borsa ve sahne yaratıcılığı' hangi evle bağdaştırılır?",
      options: [
        "2. Ev",
        "5. Ev",
        "7. Ev",
        "9. Ev"
      ],
      correctAnswerIndex: 1,
      explanation: "5. Ev, yaşama sevincini, aşk ilişkilerini, çocukları ve spekülatif kazanç yollarını yönetir."
    },
    {
      id: "ast_15",
      question: "Günlük rutin işler, ofis çalışma ortamı, evcil hayvanlar ve akut fiziksel hastalıkların göstergesi olan ev hangisidir?",
      options: [
        "4. Ev",
        "6. Ev",
        "8. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 1,
      explanation: "6. Ev, bedenimize nasıl baktığımızı, günlük işlerimizi, evcil hayvanlarımızı ve hizmet ettiğimiz alanları yönetir."
    },
    {
      id: "ast_16",
      question: "Resmi nikahlı eş, ortaklıklar, açık düşmanlar ve mahkemeler hangi evin sahnesidir?",
      options: [
        "7. Ev",
        "8. Ev",
        "10. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 0,
      explanation: "7. Ev (Alçalan/DC), birebir yaptığımız resmi anlaşmaları, ortaklıkları, evlilikleri ve karşımızdaki açık düşmanları simgeler."
    },
    {
      id: "ast_17",
      question: "Eşin parası, miras, nafakalar, banka kredileri ve fiziksel ölüm şekli hangi evden okunur?",
      options: [
        "2. Ev",
        "5. Ev",
        "8. Ev",
        "11. Ev"
      ],
      correctAnswerIndex: 2,
      explanation: "8. Ev, başkalarından gelen paraları (miras, kredi, borç), krizleri, ameliyatları ve dönüşüm süreçlerini temsil eder."
    },
    {
      id: "ast_18",
      question: "Yurtdışı seyahatleri, uzun yolculuklar, üniversite eğitimi, din/felsefe ve yayıncılık hangi evin konusudur?",
      options: [
        "3. Ev",
        "6. Ev",
        "9. Ev",
        "11. Ev"
      ],
      correctAnswerIndex: 2,
      explanation: "9. Ev, zihni genişleten yüksek eğitimi, uzak ülkeleri, yabancı kültürleri ve inanç sistemlerini yönetir."
    },
    {
      id: "ast_19",
      question: "Gezegen arketiplerinden 'Sınırlar, disiplin, zaman, korku, sorumluluklar ve Karma'nın Lordu' olarak bilinen gezegen hangisidir?",
      options: [
        "Mars",
        "Jüpiter",
        "Satürn",
        "Plüton"
      ],
      correctAnswerIndex: 2,
      explanation: "Satürn, hayat okulundaki zorlu öğretmenimizdir. Bizi sınırlayarak disipline sokar ve karmik borçlarımızı ödetir."
    },
    {
      id: "ast_20",
      question: "Doğum haritasındaki işlevi 'inanç, şans, büyüteç etkisi, genişleme ve felsefe' olan bilge gezegen hangisidir?",
      options: [
        "Güneş",
        "Venüs",
        "Jüpiter",
        "Neptün"
      ],
      correctAnswerIndex: 2,
      explanation: "Jüpiter, dokunduğu her şeyi büyüten, şans, bilgelik, inanç ve genişlemeyi temsil eden koruyucu gezegendir."
    }
  ]
};

export const astrologyQuiz2: Quiz = {
  id: "astroloji_2",
  title: "2. Derece: Kalfalık Sınavı",
  description: "Psikolojik (Yetzirah) ve Karmik Katman (Briah), Ay Düğümleri, Retro Gezegenler ve Evlerin derin şifreleri. (20 Soru)",
  questions: [
    {
      id: "ast_21",
      question: "Psikolojik Katmanda (Yetzirah) 7. Evin anlamı nedir?",
      options: [
        "Eşimizin banka hesap durumu",
        "Kişinin kendi içinde bastırdığı veya eksik hissettiği gölge yanlarını başkalarına yansıtması (Projeksiyon)",
        "Kardeşlerimizle çocuklukta yaşadığımız rekabet",
        "Toplum önünde takındığımız kariyer maskesi"
      ],
      correctAnswerIndex: 1,
      explanation: "Psikolojik katmanda 7. Ev, kendimizde kabullenmeyip dışarıya yansıttığımız (projeksiyon) özelliklerimizi eş veya düşman olarak hayatımıza çekme alanımızdır."
    },
    {
      id: "ast_22",
      question: "Psikolojik Katmanda 2. Evin temsil ettiği temel içsel kavram hangisidir?",
      options: [
        "Zihinsel merak ve algı hızı",
        "Özdeğer duygusu (Ben değerli miyim? sorusunun içsel yanıtı)",
        "Aileden kalan mirasların miktarı",
        "Kolektif bilinçaltı korkuları"
      ],
      correctAnswerIndex: 1,
      explanation: "Psikolojik düzeyde 2. Ev, cüzdandan öte özdeğer duygumuzdur. Maddi biriktirme hırsı genellikle bu içsel özdeğer boşluğunu kapatma çabasıdır."
    },
    {
      id: "ast_23",
      question: "Egonun dünyayla ilk karşılaşmasında geliştirdiği birincil savunma mekanizması (Persona) psikolojik olarak hangi evden başlar?",
      options: [
        "1. Ev",
        "4. Ev",
        "7. Ev",
        "10. Ev"
      ],
      correctAnswerIndex: 0,
      explanation: "1. Ev, benliğin dünyadaki ilk savunma mekanizmasıdır. Hayatta kalmak için taktığımız maske buradadır."
    },
    {
      id: "ast_24",
      question: "'İçsel Çocuk' (Inner Child) kavramının saf, kontrolsüz bir şekilde kimliğini yansıtma ve onaylanma alanı hangi evdir?",
      options: [
        "2. Ev",
        "5. Ev",
        "9. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 1,
      explanation: "5. Ev, psikolojik olarak içsel çocuğun özgürce oynadığı, yaratıcılığını sergilediği ve onay aradığı alandır."
    },
    {
      id: "ast_25",
      question: "Psikolojik krizlerin bedene fiziksel hastalık (somatizasyon) olarak yansıması, takıntılar ve kendini aşırı eleştirme hangi evin psikolojik gölgesidir?",
      options: [
        "3. Ev",
        "6. Ev",
        "8. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 1,
      explanation: "6. Ev, beden-zihin dengesidir. Zihinsel tıkanıklıklar buradaki gölgelerle bedene akut hastalıklar olarak yansır."
    },
    {
      id: "ast_26",
      question: "Derin krizler, travmalar, tabular ve egonun ölümü ile yüzleştiğimiz psikolojik terapi evi hangisidir?",
      options: [
        "4. Ev",
        "7. Ev",
        "8. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 2,
      explanation: "8. Ev, egonun kontrol edemediği karanlık sularla, krizlerle ve dönüşümlerle yüzleştiği psikolojik evdir."
    },
    {
      id: "ast_27",
      question: "Psikolojik olarak ebeveynlerin (dominant ebeveynin/annenin) mirası ve bireyin toplumda kabul görmek için egosunu terbiye etmesi hangi evdir?",
      options: [
        "1. Ev",
        "4. Ev",
        "10. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 2,
      explanation: "10. Ev (MC), ailedeki otorite figürlerinin beklentilerini karşılamak için egonun şekillendirildiği ve terbiye edildiği alandır."
    },
    {
      id: "ast_28",
      question: "Kolektif gölgeler, bastırılmış anılar, rüyalar ve egonun çözülüp okyanusa karışması psikolojik düzeyde hangi evdedir?",
      options: [
        "6. Ev",
        "8. Ev",
        "9. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 3,
      explanation: "12. Ev, bilinçaltının derin okyanusudur. Kolektif gölgeleri ve egonun çözülme sancılarını yönetir."
    },
    {
      id: "ast_29",
      question: "Karmik Katmanda (Briah) Güney Ay Düğümü (GAD) neyi temsil eder?",
      options: [
        "Ruhun bu hayatta gitmesi gereken, hiç bilmediği zorlu hedefi",
        "Geçmiş yaşamlarda ustalaşılan fakat artık ruhu aşağı çeken konfor alanını",
        "Anneyle olan çocukluk travmalarını",
        "Maddi kazanç elde etme yöntemlerimizi"
      ],
      correctAnswerIndex: 1,
      explanation: "GAD, ruhun geçmişten getirdiği alışkanlıkları ve konfor alanını gösterir. Gelişmek için bu alandan çıkıp KAD yönüne gidilmelidir."
    },
    {
      id: "ast_30",
      question: "Ruhun bu hayattaki nihai sınavı, korktuğu ama mutlaka öğrenmesi gereken hedef (Kutup Yıldızı) hangisidir?",
      options: [
        "Güney Ay Düğümü (GAD)",
        "Kuzey Ay Düğümü (KAD)",
        "Kiron (Chiron)",
        "MC Noktası"
      ],
      correctAnswerIndex: 1,
      explanation: "Kuzey Ay Düğümü (KAD), ruhun bu enkarnasyonda tekamül etmek için gitmesi gereken pusula yönünü gösterir."
    },
    {
      id: "ast_31",
      question: "Doğum anında geri giden (Retro) bir gezegen karmik olarak neyi ifade eder?",
      options: [
        "Kişinin o alanda çok şanslı olacağını",
        "Geçmiş yaşamlarda o gezegenin temsil ettiği enerjide yapılmış bir hata, israf veya karmik borcu",
        "Yurtdışına taşınma zorunluluğunu",
        "Kariyerde çok hızlı yükseleceğini"
      ],
      correctAnswerIndex: 1,
      explanation: "Retro gezegenler, geçmiş enkarnasyonlarda doğru kullanılmamış, geciktirilmiş veya suistimal edilmiş enerji derslerini (Karmik Borç) temsil eder."
    },
    {
      id: "ast_32",
      question: "Doğum haritasındaki 'Kiron (Chiron - Yaralı Şifacı)' neyi simgeler?",
      options: [
        "Zenginlik getiren şans noktalarını",
        "Kişinin kendine fayda sağlayamadığı ama başkalarını iyileştirerek şifa bulduğu en derin ruhsal yarasını",
        "Eşinin ailesinden gelecek olan borçları",
        "İlk okulda öğretmenleriyle yaşadığı çatışmaları"
      ],
      correctAnswerIndex: 1,
      explanation: "Kiron yaralı şifacıdır. Kendi yarasını kapatamaz ancak başkalarına şifa verdikçe ruhsal olarak kendi acısını dindirir."
    },
    {
      id: "ast_33",
      question: "Karmik Katmanda 'atalardan aktarılan kök karma ve soydan gelen miras' hangi evden incelenir?",
      options: [
        "2. Ev",
        "4. Ev",
        "8. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 1,
      explanation: "4. Ev (IC) ruhun kök karmasıdır. Aile soyundan taşınan genetik ve karmik yükleri gösterir."
    },
    {
      id: "ast_34",
      question: "Geçmişte kibirli bir efendi olan ruhun bu hayatta kibri kırmak için 'hizmetkar' rolü üstlendiği hizmet karması evi hangisidir?",
      options: [
        "1. Ev",
        "6. Ev",
        "10. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 1,
      explanation: "6. Ev karmik katmanda hizmet ve arınma sınavıdır. Egonun kibrini kırarak başkalarına hizmet etmeyi öğretir."
    },
    {
      id: "ast_35",
      question: "Geçmiş yaşam bağlantılı ruh eşi (soulmate) karşılaşmaları ve karmik aşklar hangi evde aranır?",
      options: [
        "2. Ev",
        "5. Ev",
        "9. Ev",
        "11. Ev"
      ],
      correctAnswerIndex: 1,
      explanation: "5. Ev, geçmiş enkarnasyonlardan taşınan karmik aşkları ve ruhsal rezonansları barındırır."
    },
    {
      id: "ast_36",
      question: "Geçmiş yaşamlarda edinilmiş karanlık bilgeliğin, büyü ve okült pratiklerin bu hayatta temizlendiği karmik borç evi hangisidir?",
      options: [
        "7. Ev",
        "8. Ev",
        "9. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 1,
      explanation: "8. Ev, geçmişteki okült ve ezoterik güçlerin yanlış kullanımından doğan karmik borçların tahsilat alanıdır."
    },
    {
      id: "ast_37",
      question: "Geçmiş yaşamlarda insanları kendi dogmaları ve inançlarıyla yargılayanların, bu hayatta 'inanç krizleri' yaşaması hangi evin karmik sınavıdır?",
      options: [
        "3. Ev",
        "6. Ev",
        "9. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 2,
      explanation: "9. Ev, yüksek inançların sınav yeridir. Geçmişteki dogmatik kibir, bu hayatta inanç krizlerine yol açar."
    },
    {
      id: "ast_38",
      question: "Ruhun bekleme odası olarak nitelendirilen, geçmiş hayat rüyalarının ve tüm çözülmemiş karmaların arşivi olan ev hangisidir?",
      options: [
        "4. Ev",
        "8. Ev",
        "10. Ev",
        "12. Ev"
      ],
      correctAnswerIndex: 3,
      explanation: "12. Ev, tüm enkarnasyon geçmişinin kilitlendiği, çözülmeyi bekleyen karmik kara deliktir."
    },
    {
      id: "ast_39",
      question: "Doğum haritasında 'Güneş' psikolojik olarak hangi merkezimizi yönetir?",
      options: [
        "Bilinçaltı savunma mekanizmalarımızı",
        "Bilinçli egomuzu, yaşam gücümüzü ve kendimizi gerçekleştirme merkezimizi",
        "Korkularımızı ve kısıtlamalarımızı",
        "Zihinsel iletişim yollarımızı"
      ],
      correctAnswerIndex: 1,
      explanation: "Güneş (Ego/Bilinç), kimliğimizin ve dünyadaki aktif varlığımızın temel yaşam gücü merkezidir."
    },
    {
      id: "ast_40",
      question: "Doğum haritasında 'Ay' psikolojik olarak neyin göstergesidir?",
      options: [
        "Kariyer hedeflerimizin",
        "Bilinçaltı güvenlik ihtiyacımızın, duygusal tepkilerimizin ve anneyle olan bağımızın",
        "Mantıklı kararlarımızın",
        "Toplum önündeki statümüzün"
      ],
      correctAnswerIndex: 1,
      explanation: "Ay (Duygu), savunma reflekslerimizi, çocukluk alışkanlıklarımızı ve kendimizi güvende hissettiğimiz anları yönetir."
    }
  ]
};

export const astrologyQuiz3: Quiz = {
  id: "astroloji_3",
  title: "3. Derece: Üstatlık Sınavı",
  description: "Ezoterik Katman (Atziluth), burçların tekamül şifreleri, sabit yıldızlar, heliocentric harita ve 4 katmanlı okuma sentez adımları. (20 Soru)",
  questions: [
    {
      id: "ast_41",
      question: "Ezoterik Astroloji katmanındaki (Atziluth) temel felsefi odak noktası nedir?",
      options: [
        "Bireyin daha zengin olması ve evlenmesi",
        "Kişisel egoyu (Ben) aşarak, kolektifin evrimine ve dünyaya hizmet eden bir ruh haline gelmek (Biz)",
        "Gelecekteki fiziksel olayları tahmin etmek",
        "Sadece retro gezegenlerin yerlerini hesaplamak"
      ],
      correctAnswerIndex: 1,
      explanation: "Ezoterik astrolojide 'Ben' kavramı erir. Ruh, dünyevi hırslarından sıyrılarak evrensel plana hizmet eden bir işçi bilincine (Atziluth) ulaşır."
    },
    {
      id: "ast_42",
      question: "Doğum haritasında bir gezegenin Sabit Yıldızlarla (Sirius, Regulus, Antares vb.) kavuşum yapması neyi gösterir?",
      options: [
        "Kişinin hiçbir yeteneği olmadığını",
        "Dünyevi kaderin ötesinde, kolektif/tanrısal bir yetki, misyon veya kozmik müdahale etkisini",
        "Eşinin çok zengin olacağını",
        "Sadece çocuk sahibi olacağını"
      ],
      correctAnswerIndex: 1,
      explanation: "Sabit yıldızlar, haritadaki kişisel planı aşan, tanrısal ve kozmik müdahaleleri, büyük trajedileri veya devasa başarı şifrelerini taşır."
    },
    {
      id: "ast_43",
      question: "Güneş'i merkeze alan 'Heliocentric Harita' ezoterik olarak neyi gösterir?",
      options: [
        "Kişinin dünyevi zenginliğini",
        "Egonun (yer merkezli) kaygılarından sıyrılarak, ruhun galaksideki gerçek rotasını, öz amacını ve ilahi planını",
        "Sağlık durumunun detaylarını",
        "Doğum yerinin coğrafi koordinatlarını"
      ],
      correctAnswerIndex: 1,
      explanation: "Güneş merkezli harita, dünyevi ego haritasından (Geocentric) farklı olarak ruhun (Güneş'in) gözünden tekamül amacını gösterir."
    },
    {
      id: "ast_44",
      question: "Ezoterik astrolojide Koç burcunun yöneticisinin Merkür olması neyi simgeler?",
      options: [
        "Koç'un çok dedikoducu olacağını",
        "Koç'un uyanmış formunda, zihinsel aydınlanma ateşini dünyaya cesaretle getiren bir ışık elçisi olmasını",
        "Kişinin seyahat etmeyi çok seveceğini",
        "Sadece ticaretle ilgileneceğini"
      ],
      correctAnswerIndex: 1,
      explanation: "Mars dünyevi Koç'un yöneticisidir (savaş). Merkür ise ezoterik Koç'u yönetir; buradaki amaç zihinsel aydınlanmayı cesaretle başlatmaktır."
    },
    {
      id: "ast_45",
      question: "Koç burcunun gölge ve ezoterik (uyanmış) şifresi hangi seçenekte doğru verilmiştir?",
      options: [
        "Gölge: Tembellik / Ezoterik: Sanatçı olmak",
        "Gölge: Bencilce saldırmak ('Ben') / Ezoterik: İlahi aydınlanma ateşini cesaretle getiren aydınlanma öncüsü",
        "Gölge: Korkaklık / Ezoterik: Para biriktirmek",
        "Gölge: İçe kapanıklık / Ezoterik: Yönetici olmak"
      ],
      correctAnswerIndex: 1,
      explanation: "Uyanmamış Koç bencilce savaşır. Uyanmış/Ezoterik Koç ise kolektif aydınlanmanın korkusuz liderliğini üstlenir."
    },
    {
      id: "ast_46",
      question: "Boğa burcunun ezoterik şifresi nedir?",
      options: [
        "Maddi konforu sonsuza kadar korumak",
        "Üçüncü gözü açarak maddenin (formun) içindeki ışığı ve maneviyatı bulmak, ışığı dünyada demirlemek",
        "Sürekli yer değiştirmek",
        "Hizmet sektöründe lider olmak"
      ],
      correctAnswerIndex: 1,
      explanation: "Uyanmış Boğa, maddenin illüzyonunu aşar. Formun içindeki ilahi ışığı ve manevi zenginliği görerek dünyevi planda sabitler."
    },
    {
      id: "ast_47",
      question: "İkizler (Gemini) burcunun ezoterik (uyanmış) şifresi hangisidir?",
      options: [
        "Her konuda yüzeysel bilgi sahibi olmak",
        "Ruh ve madde arasındaki ikiliği (dualiteyi) saf bir sevgi senteziyle birleştirmek",
        "Kardeşleriyle ortak ticaret yapmak",
        "Duygusal olarak sürekli içe kapanmak"
      ],
      correctAnswerIndex: 1,
      explanation: "İkizler uyanmış seviyede, dualiteyi (ikiliği) parçalamak yerine sevgi ve bilgelik senteziyle tekliğe ulaştırır."
    },
    {
      id: "ast_48",
      question: "Yengeç burcunun uyanmış ezoterik formunun görevi nedir?",
      options: [
        "Kendi ailesine bağımlı olmak",
        "Tüm insanlığı kendi çocuğu gibi şefkatle besleyen 'Evrensel Anne' bilincine yükselmek",
        "Tarih öğretmeni olmak",
        "Gayrimenkul ticareti yapmak"
      ],
      correctAnswerIndex: 1,
      explanation: "Yengeç uyanışında sadece kendi yuvasını değil, tüm dünyayı evi görerek insanlığa şefkatli bir analık (Evrensel Anne) sunar."
    },
    {
      id: "ast_49",
      question: "Aslan burcunun narsisizm ve kibir (gölge) kalıbından sıyrılarak ulaştığı ezoterik hedef hangisidir?",
      options: [
        "Daha büyük sahnelerde şov yapmak",
        "Kişisel egoyu eritip içindeki İlahi Çocuğu uyandırmak ve sevgisini evrensel bir ışık olarak saçmak",
        "Her şeyi kontrol altında tutmak",
        "Bütün parayı tek başına yönetmek"
      ],
      correctAnswerIndex: 1,
      explanation: "Aslan uyanışında alkış ve egosal onay aramaz; ilahi yaratıcı kıvılcımı sevgiyle kitlelere ulaştırır."
    },
    {
      id: "ast_50",
      question: "Başak (Virgo) burcunun uyanmış ezoterik şifresi nedir?",
      options: [
        "Detaylarda boğulup insanları sürekli eleştirmek",
        "Kusursuz bir adanmışlıkla insanlığa karşılıksız ve şefkatle hizmet etmek, 'Mesih' bilincini taşımak",
        "Sürekli temizlik yapmak",
        "Ofis ortamının yöneticisi olmak"
      ],
      correctAnswerIndex: 1,
      explanation: "Başak inisiyasyonunda kibirli eleştiriyi bırakır. Kusursuz bir teslimiyetle insanlığa şifa ve karşılıksız hizmet verir."
    },
    {
      id: "ast_51",
      question: "Terazi (Libra) burcunun uyanmış ezoterik işlevi nedir?",
      options: [
        "Sürekli kararsız kalmak ve onay beklemek",
        "Karanlık ve aydınlığın (karşıtlıkların) jilet gibi ince dengesini kurarak evrensel adaleti ve barışı sağlamak",
        "Estetik ameliyatlar yaptırmak",
        "Sadece evlenmek için taviz vermek"
      ],
      correctAnswerIndex: 1,
      explanation: "Terazi uyanışı, dünyevi uyum arayışını aşarak hakiki kozmik adaleti ve zıtlıkların dengesini yeryüzüne getirir."
    },
    {
      id: "ast_52",
      question: "Akrep burcunun gölgeleri (intikam, zehir, manipülasyon) yerine ezoterik seviyede temsil ettiği en büyük ruhsal güç hangisidir?",
      options: [
        "Gizli sırları açığa çıkarıp şantaj yapmak",
        "Şeytanıyla (gölgesiyle) yüzleşip onu alt ederek ruhsal dirilişi (Anka Kuşu / Phoenix) gerçekleştirmek",
        "Bütün ortakların parasını ele geçirmek",
        "Seksüel enerjiyi dünyevi hırslar için kullanmak"
      ],
      correctAnswerIndex: 1,
      explanation: "Akrep inisiyasyonunda ejderhayla (gölgeyle) savaşıp kazanır; ölümü ve yeniden doğuşu deneyimleyerek Anka Kuşu olur."
    },
    {
      id: "ast_53",
      question: "Yay burcunun ezoterik (uyanmış) şifresi hangisinde doğru tanımlanmıştır?",
      options: [
        "Kendi inancının tek doğru olduğunu iddia etmek (Fanatiklik)",
        "Oku doğrudan Tanrı'ya (ilahi gerçeğe) nişanlayan, insanlığı dünyevi karanlıktan bilgeliğe ulaştıran bilge",
        "Sürekli gezerek macera yaşamak",
        "Akademik unvanlarla övünmek"
      ],
      correctAnswerIndex: 1,
      explanation: "Yay burcunun oku, dünyevi hedeflerden ilahi gerçeğe (bilgeliğe) yönelmiştir. Kitleleri karanlıktan ışığa taşır."
    },
    {
      id: "ast_54",
      question: "Oğlak burcunun ezoterik seviyedeki 'zirvedeki inisiyasyonu' neyi ifade eder?",
      options: [
        "Şirkette en üst düzey yönetici olmak",
        "Tüm dünyevi hırslardan arınarak, dağın zirvesinde Tanrısal ışıkla aydınlanan ruhsal usta olmak (Buda/İsa arketipi)",
        "Gayrimenkul imparatorluğu kurmak",
        "Çok katı kurallarla insanları yönetmek"
      ],
      correctAnswerIndex: 1,
      explanation: "Oğlak uyanışında madde dağının tepesine dünyevi hiçbir yük getirmeden tırmanır ve orada ilahi ışıkla aydınlanır (Üstat seviyesi)."
    },
    {
      id: "ast_55",
      question: "Kova burcunun uyanmış ezoterik vazifesi nedir?",
      options: [
        "Kurallara karşı sebepsizce anarşi yaratmak",
        "Kendini unutan, Kutsal Kâse'den tüm insanlığın üzerine yaşam ve kardeşlik suyunu (evrensel aydınlanmayı) döken su taşıyıcısı",
        "Sadece internet gruplarında takılmak",
        "Duygusuz ve soğuk arkadaşlıklar kurmak"
      ],
      correctAnswerIndex: 1,
      explanation: "Kova, tüm insanlığı kucaklar. Kendi egosunu feda ederek aydınlanma suyunu kitlelere ulaştırır."
    },
    {
      id: "ast_56",
      question: "Balık burcunun dünyevi kurban psikolojisi (gölge) yerine ezoterik seviyede temsil ettiği ilahi bilinç hangisidir?",
      options: [
        "Gerçek dünyadan kaçarak hayallere sığınmak",
        "Egonun tamamen eriyip okyanusa (Tanrı'ya) karıştığı, evrensel kurtarıcı, en yüksek merhamet ve Mesih bilinci",
        "Sürekli mağdur rolü oynamak",
        "Maddi yardımlardan kaçmak"
      ],
      correctAnswerIndex: 1,
      explanation: "Balık, inisiyasyon çemberinin sonudur. Egonun sınırları kalkar ve ruh ilahi bütünlüğe (merhamet ve birlik bilincine) karışır."
    },
    {
      id: "ast_57",
      question: "4 Katmanlı Harita Entegrasyonundaki en temel altın kural hangisidir?",
      options: [
        "Sadece 4. katmandaki sabit yıldızları dikkate almak",
        "Fiziksel (1. Katman) ve Psikolojik (2. Katman) tıkanıklıkları çözmeden, kişiyi doğrudan ezoterik ve ruhsal amaçlara yönlendirmemek",
        "Yükselen burcu her zaman ihmal etmek",
        "Sadece retro gezegenlerin olduğu evleri okumak"
      ],
      correctAnswerIndex: 1,
      explanation: "Altın kural sırayı takip etmektir. Dünyevi (Asiyah) ve psikolojik (Yetzirah) dengelenme kurulmadan ruhsal amaçlar (Briah/Atziluth) havada kalır."
    },
    {
      id: "ast_58",
      question: "Harita entegrasyon sentezinin 1. Adımında (Asiyah) neyi tespit edip dengeleriz?",
      options: [
        "Sabit yıldız kavuşumlarını",
        "Element dengesini ve Yükselen (ASC) yöneticisinin durumunu (fiziksel donanım)",
        "Karmik borçları ve retroları",
        "İkiz alev kodlarını"
      ],
      correctAnswerIndex: 1,
      explanation: "1. Adım dünyevi katmandır. Element dağılımı ve ASC yöneticisi analiz edilerek fiziksel donanım dengelenir."
    },
    {
      id: "ast_59",
      question: "Entegrasyon sentezinin 2. Adımında (Yetzirah) hangi yerleşimleri inceleyerek savunma mekanizmalarımızı ve yaralarımızı çözeriz?",
      options: [
        "Sadece Jüpiter ve Satürn'ü",
        "Ay, Merkür ve Chiron (Kiron) konumlarını",
        "Heliocentric haritayı",
        "Sadece Güney Ay Düğümünü"
      ],
      correctAnswerIndex: 1,
      explanation: "2. Adım psikolojik katmandır. Ay, Merkür ve Chiron analiz edilerek bilinçaltı yaralar ve egonun savunma mekanizmaları çözülür."
    },
    {
      id: "ast_60",
      question: "Entegrasyon sentezinin 4. Adımında (Atziluth) ilahi misyonumuzu entegre etmek için neleri hesaplarız?",
      options: [
        "Sadece 2. evdeki para durumunu",
        "Sabit yıldızlar, Galaktik Merkez kavuşumları ve Monad bağlantısını",
        "Sadece kardeşlerle olan ilişkileri",
        "Ofis çalışma ortamındaki rutinlerimizi"
      ],
      correctAnswerIndex: 1,
      explanation: "4. Adım kozmik plandır (Atziluth). Sabit yıldızlar ve Galaktik Merkez bağlantılarıyla ruhun evrensel misyonu sentezlenir."
    }
  ]
};

export const allAstrologyQuizzes = {
  'astroloji_1': astrologyQuiz1,
  'astroloji_2': astrologyQuiz2,
  'astroloji_3': astrologyQuiz3,
};
