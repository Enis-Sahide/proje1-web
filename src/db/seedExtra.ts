// Daha önce sayfalara gömülü olan içeriklerin seed verisi (kaynak: ilgili sayfalar).
// VIP ikonları lucide ADI olarak saklanır (JSX değil); görseller şimdilik Supabase storage URL'i.

const AVATAR_BASE =
  'https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/avatars/';
const CHAKRA_ICON_BASE =
  'https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/chakras/';

export const BREATHWORK = [
  { id: 'nadishodhan', name: 'Nadi Shodhan', description: 'İda ve Pingala Dengesi', instruction: 'Gözlerinizi kapatın. Sol burun deliğinden yavaşça, derin ve yumuşak nefes alın. Sol deliği yüzük ve serçe parmaklarınızla kapatıp sağdan nefes verin. Çiçek koklar gibi nazikçe yapın. Bu egzersiz bedeninizdeki 72000 nadi kanalını temizler.\n\n9 tur nefes tavsiye edilir.', requiredRole: null, phases: [{ name: 'SOL AL', time: 4 }, { name: 'SAĞ VER', time: 6 }, { name: 'SAĞ AL', time: 4 }, { name: 'SOL VER', time: 6 }] },
  { id: '448', name: '4-4-8 Nefesi', description: 'Derin Gevşeme', instruction: 'Nefesi 4 saniye boyunca burnunuzdan alın. 4 saniye boyunca nefesinizi tutun. Ardından 8 saniye boyunca ağzınızdan yavaşça nefesinizi verin.', requiredRole: null, phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 8 }] },
  { id: '478', name: 'Kadim 4-7-8', description: 'Uyku ve Sakinlik', instruction: 'Dilinizi üst dişlerinizin arkasına yerleştirin. Nefesi burnunuzdan karnınıza (diyaframa) doğru alın. Ağzınızdan güçlü bir "hııış" sesiyle verin.', requiredRole: null, phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 7 }, { name: 'NEFES VER', time: 8 }] },
  { id: 'box', name: 'Kare Nefes', description: 'Odaklanma ve Denge', instruction: 'Dik oturun. Burnunuzdan göğüs kafesinizi eşit genişleterek alın. Nefesi tutarken omuzlarınızı kasmayın. Akciğerler boşaldığında huzurla bekleyin.', requiredRole: null, phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 4 }, { name: 'BEKLE', time: 4 }] },
  { id: 'ujjayi', name: 'Ateş Nefesi', description: 'Enerji ve Canlılık', instruction: 'Sadece burundan alın ve verin. Karın kaslarınızı bir körük gibi kullanarak nefesi hızlı ve ritmik bir şekilde itin. Göğüs hareketsiz kalmalıdır.', requiredRole: null, phases: [{ name: 'NEFES AL', time: 3 }, { name: 'NEFES VER', time: 3 }] },
  { id: 'relax', name: 'Stres Savar', description: 'Anksiyete Giderici', instruction: 'Sadece burnunuzdan derin diyafram nefesi alın. Verirken dudaklarınızı ıslık çalacakmış gibi büzün ve havayı çok yavaşça üfleyerek verin.', requiredRole: null, phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 6 }, { name: 'BEKLE', time: 2 }] },
  { id: 'bhramari', name: 'Arı Nefesi', description: 'Zihni Susturur', instruction: 'Gözlerinizi ve kulaklarınızı hafifçe kapatın. Burnunuzdan derin nefes alın. Verirken kapalı ağızla arı gibi "mmmm" diye mırıldanıp titreşimi beyninizde hissedin.', requiredRole: null, phases: [{ name: 'NEFES AL', time: 4 }, { name: 'NEFES VER', time: 8 }] },
  { id: 'sama', name: 'Sama Vritti', description: 'Sağ-Sol Lob Dengesi', instruction: 'Beyin loblarını eşitler. Omurganız dik olsun. Akciğerlerinize dolan ve boşalan havanın eşit sürede (6 saniye) olmasına tam odaklanın.', requiredRole: null, phases: [{ name: 'NEFES AL', time: 6 }, { name: 'NEFES VER', time: 6 }] },
  { id: 'tummo', name: 'Tummo', description: 'İçsel Isı ve Güç', instruction: 'Derin nefes alıp karın kaslarınızı ve pelvik tabanınızı sıkın (kök kilidi). Bedendeki sıcaklığın arttığını imgeleyin. Ardından çok yavaşça nefesi verin.', requiredRole: 'journeyman', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 8 }] },
];

export const MEDITATION = [
  // chakra
  { id: '1', kind: 'chakra', hz: 396, name: 'Korku ve Suçluluk', description: 'Kök çakrayı temizler, engelleri kaldırır.', intent: 'Tüm eski korkularımı ve suçluluk duygularımı sevgiyle serbest bırakıyorum. Evrende tamamen güvendeyim.', color: '#FF3B30' },
  { id: '2', kind: 'chakra', hz: 417, name: 'Değişimi Kolaylaştırma', description: 'Sakral çakrayı arındırır, negatif enerjiyi ve travmaları temizler.', intent: 'Geçmişin yüklerinden özgürleşiyorum. Hayatımdaki mucizevi değişimleri sevgiyle kabul ediyorum.', color: '#FF9500' },
  { id: '3', kind: 'chakra', hz: 528, name: 'DNA Onarımı ve Mucize', description: 'Solar pleksus çakrasını dengeler, yaşam enerjisini artırır, frekansı yükseltir.', intent: 'Hücrelerim evrenin sevgi frekansıyla yenileniyor. Kendi içimdeki mucizevi şifa gücüne uyanıyorum.', color: '#FFCC00' },
  { id: '4', kind: 'chakra', hz: 639, name: 'İlişkiler ve Bağlantı', description: 'Kalp çakrasını açar, evrensel uyum getirir.', intent: 'Kendimi ve tüm varoluşu şefkatle kucaklıyorum. İlişkilerim saf sevgi, uyum ve denge içinde akıyor.', color: '#34C759' },
  { id: '5', kind: 'chakra', hz: 741, name: 'Sezgi ve Uyanış', description: 'Boğaz çakrasını açar, içgüdüleri güçlendirir, zihni berraklaştırır.', intent: 'Zihnimdeki tüm yanılsamalar (illüzyonlar) çözülüyor. İçsel rehberliğimi net bir şekilde duyuyorum.', color: '#32ADE6' },
  { id: '6', kind: 'chakra', hz: 852, name: 'Kozmik Bağlantı', description: 'Üçüncü göz çakrasını dengeler, üst benlikle bağ kurdurur, ruhani uyanış.', intent: 'Yüksek bilincimle tam bir bütünlük içindeyim. Evrensel gerçeği kalbimin gözüyle, açıkça görebiliyorum.', color: '#007AFF' },
  { id: '7', kind: 'chakra', hz: 963, name: 'İlahi Bütünlük', description: 'Tepe çakrayı açar, evrensel bilinçle tam bağlantı sağlar.', intent: 'Ben evrenin ta kendisiyim. İlahi olanla aramdaki tüm sınırlar kalktı ve sonsuz ışığa uyandım.', color: '#AF52DE' },
  // organ
  { id: 'org_1', kind: 'organ', hz: 110.0, name: 'Mide Şifası', description: 'Mide sağlığını destekler, sindirimi rahatlatır.', intent: 'Sindirimi sevgiyle kabul ediyor, midemi şifalandırıyorum.', color: '#FFCC00' },
  { id: 'org_2', kind: 'organ', hz: 117.3, name: 'Pankreas Şifası', description: 'Pankreası dengeler, kan şekerini düzenlemeye yardımcı olur.', intent: 'Pankreasım sağlıklı ve dengede, bedenimi besliyor.', color: '#FFCC00' },
  { id: 'org_3', kind: 'organ', hz: 220.0, name: 'Akciğer Şifası', description: 'Akciğer kapasitesini artırır, nefesi derinleştirir.', intent: 'Hayatın nefesini tam ve derinden içime çekiyorum.', color: '#34C759' },
  { id: 'org_4', kind: 'organ', hz: 315.8, name: 'Beyin Şifası', description: 'Zihinsel yorgunluğu giderir, beyin fonksiyonlarını dengeler.', intent: 'Zihnim berrak ve sakin, yüksek bilincimle uyum içindeyim.', color: '#AF52DE' },
  { id: 'org_5', kind: 'organ', hz: 317.8, name: 'Karaciğer Şifası', description: 'Karaciğerin arınmasını ve detoksifikasyonunu destekler.', intent: 'Bedenimdeki tüm toksinlerden ve öfkeden arınıyorum.', color: '#FFCC00' },
  { id: 'org_6', kind: 'organ', hz: 319.9, name: 'Böbrek Şifası', description: 'Böbrek sağlığını destekler, korkulardan arınmaya yardımcı olur.', intent: 'Korkuyu serbest bırakıyor, derin bir güven duygusuyla doluyorum.', color: '#FF9500' },
  { id: 'org_7', kind: 'organ', hz: 321.9, name: 'Kan ve Dolaşım', description: 'Kan hücrelerini canlandırır, dolaşımı rahatlatır.', intent: 'Yaşam enerjisi tüm bedenimde özgürce dolaşıyor.', color: '#FF3B30' },
];

export const VIP = [
  { id: 'mikrokozmik', title: 'Mikrokozmik Yörünge', description: 'Bedenin enerji meridyenlerinde ışığı dolaştırın ve şifayı hedefleyin.', icon: 'Activity', color: 'from-blue-500/20 to-purple-500/20', borderColor: 'border-blue-500/50', textColor: 'text-blue-400', status: 'ACTIVE', path: '/vip-teknolojiler/mikrokozmik' },
  { id: 'bone-marrow', title: 'Kemik İliği Nefesi', description: 'Kök hücre aktivasyonunu zihinsel ve nefes kombinasyonuyla yönlendirin.', icon: 'Droplet', color: 'from-red-500/20 to-orange-500/20', borderColor: 'border-red-500/50', textColor: 'text-red-400', status: 'ACTIVE', path: '/vip-teknolojiler/bone-marrow' },
  { id: 'tummo', title: 'Tummo (İçsel Ateş)', description: 'Göbek deliğinin altındaki ateşi uyandırarak bağışıklığı ve iradeyi çelikleştirin.', icon: 'Flame', color: 'from-orange-500/20 to-yellow-500/20', borderColor: 'border-orange-500/50', textColor: 'text-orange-400', status: 'ACTIVE', path: '/vip-teknolojiler/tummo' },
  { id: 'silva', title: 'Silva Teta Ekranı', description: 'Zihinsel lazer ile hastalıklı hücreleri silin ve yenilerini programlayın.', icon: 'Brain', color: 'from-green-500/20 to-emerald-500/20', borderColor: 'border-green-500/50', textColor: 'text-green-400', status: 'ACTIVE', path: '/vip-teknolojiler/silva' },
  { id: 'merkaba', title: 'Merkaba Uyanışı', description: 'İç içe geçmiş tetrahedronları çevirerek boyutlar arası kuantum sıçraması yapın.', icon: 'Hexagon', color: 'from-cyan-500/20 to-blue-500/20', borderColor: 'border-cyan-500/50', textColor: 'text-cyan-400', status: 'ACTIVE', path: '/vip-teknolojiler/merkaba' },
  { id: 'rahmani', title: 'Kimatik Zikir', description: 'Sufi nefesiyle esmaları titreştirerek hücrelerin geometrisini düzenleyin.', icon: 'Fingerprint', color: 'from-[#D4AF37]/20 to-yellow-600/20', borderColor: 'border-[#D4AF37]/50', textColor: 'text-[#D4AF37]', status: 'ACTIVE', path: '/vip-teknolojiler/rahmani' },
];

export const IMECE = [
  { title: 'SUP Gıda Takviyeleri (Jel Serisi)', icon: 'heart-outline', description: 'Bitkilerin, şifalı mantarların ve deniz bileşenlerinin gücünü jel formunda sunan, hücre savunması ve yenilenmesini destekleyen patentli seri.', items: [
    { name: 'Sup Detoks Mix Jel', desc: 'Toksinlerin atılmasını ve karaciğer fonksiyonlarını destekleyen arındırıcı formül.' },
    { name: 'Sup Propolis Mix Jel', desc: 'Bağışıklık sistemini güçlendiren hücresel savunma kalkanı.' },
    { name: 'Sup Reishi & Spirulina Jelleri', desc: 'Stres dengesi, zengin protein, mineral ve hücresel enerji takviyesi.' },
    { name: 'Sup Krill Mix Jel', desc: 'Hücre emilimi yüksek Omega-3, kalp ve beyin sağlığı desteği.' },
  ] },
  { title: 'Hyranus Kişisel Bakım', icon: 'sparkles-outline', description: 'Tene ve saça uyumlu, kimyasal koruyucular içermeyen özel saç ve cilt bakım serisi. Saç derisinin mikrobiyom dengesini korur.', items: [] },
  { title: "Coffee's Şah & Şifalı Gıdalar", icon: 'cafe-outline', description: 'Kırmızı Reishi özlü kahve serisi ve içme suyunun alkali dengesini sağlayan Sup Alkali pH Damlası.', items: [] },
  { title: 'Manyetik Biyoenerji Denge Serisi', icon: 'pulse-outline', description: 'Çevremizdeki elektromanyetik kirliliğin vücudumuz üzerindeki olumsuz etkilerini dengelemek üzere tasarlanmış biyoenerji takıları.', items: [] },
];

export const MOON_PHASES = [
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

export const RACES = [
  { id: 'pleiades', name: 'Pleiades (Ülker)', description: 'Şifacılar, sevgi ve ışık elçileri.', avatar: 'pleiades.png' },
  { id: 'sirius', name: 'Sirius', description: 'Kadim bilgelik, büyü ve spiritüel rehberler.', avatar: 'sirius.png' },
  { id: 'arcturus', name: 'Arcturus', description: 'İleri teknoloji, kutsal geometri, zihinsel şifa.', avatar: 'arcturus.png' },
  { id: 'andromeda', name: 'Andromeda', description: 'Özgürlük savaşçıları, galaktik gezginler.', avatar: 'andromeda.png' },
  { id: 'lyra', name: 'Lyra (Lir)', description: 'Galaksinin ataları, cesur savaşçılar.', avatar: 'lyra.png' },
  { id: 'orion', name: 'Orion', description: 'Bilgi, zihinsel güç ve çatışma çözücü bilgeler.', avatar: 'orion.png' },
  { id: 'mintaka', name: 'Mintaka', description: 'Su elementi, derin empati ve barış elçileri.', avatar: 'mintaka.png' },
  { id: 'blue_avians', name: 'Mavi Kuşsullar', description: '6. Boyut varlıkları, adalet ve kozmik denge.', avatar: 'sirius.png' },
  { id: 'sirius_pleiades', name: 'Sirius - Pleiades Melezi', description: 'Bilgelik ve sonsuz sevginin birleşimi.', avatar: 'pleiades.png' },
  { id: 'lyra_arcturus', name: 'Lyra - Arcturus Melezi', description: 'Kadim cesaret ve yüksek teknolojinin sentezi.', avatar: 'arcturus.png' },
  { id: 'orion_pleiades', name: 'Orion - Pleiades Melezi', description: 'Keskin bir zeka ve koşulsuz sevginin nadir birleşimi.', avatar: 'orion_pleiades.png' },
  { id: 'atlantis', name: 'Lemurya / Atlantis Tohumu', description: 'Kadim Dünya bilgeliği ile kozmik enerjinin melezleri.', avatar: 'mintaka.png' },
  { id: 'indigo', name: 'İndigo / Kristal Enerji', description: 'Dünyanın titreşimini yükseltmek için gelmiş yeni çağ melezleri.', avatar: 'pleiades.png' },
];

// Çakra ana sayfa ikon + konum (mobile MODULES / web CHAKRA_MODULES ile birebir)
export const CHAKRA_HOME: Record<number, { icon: string; top: string }> = {
  1: { icon: 'root.png', top: '82%' },
  2: { icon: 'sacral.png', top: '72%' },
  3: { icon: 'solar.png', top: '62%' },
  4: { icon: 'heart.png', top: '52%' },
  5: { icon: 'throat.png', top: '37%' },
  6: { icon: 'thirdeye.png', top: '25%' },
  7: { icon: 'crown.png', top: '15%' },
};

export const racesWithAvatar = RACES.map((r, i) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  avatarUrl: AVATAR_BASE + r.avatar,
  sort: i,
}));

export const chakraHomeFor = (id: number) => ({
  imageIcon: CHAKRA_HOME[id] ? CHAKRA_ICON_BASE + CHAKRA_HOME[id].icon : null,
  homeTop: CHAKRA_HOME[id] ? CHAKRA_HOME[id].top : null,
});

export const BLOG_POSTS = [
  {
    title: 'Schumann Rezonansı ve İnsan Biyolojisi Üzerindeki Etkileri',
    slug: 'schumann-rezonansi-ve-insan-biyolojisi',
    content: 'Dünyanın doğal elektromanyetik kalp atışı olan 7.83 Hz Schumann rezonansı, insan beyninin alfa dalgaları ile doğrudan rezonansa girer. Güneş fırtınaları veya yüksek Kp indeksli günlerde bu rezonans frekansı dalgalanır. Bu süreçte uykusuzluk, baş ağrısı veya yüksek durugörü deneyimleri yaşanabilir.\n\nKendinizi dengelemek için toprakla bağ kurmalı ve diyafram nefesi egzersizleri uygulamalısınız.',
    imageUrl: 'https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/runes/fehu.png',
    category: 'Nefes',
    published: true
  },
  {
    title: 'Astrolojik Transitler ve Enerji Kapıları',
    slug: 'astrolojik-transitler-ve-enerji-kapilari',
    content: 'Gökyüzündeki gezegen konumları hayatımızın her alanını etkiler. Yeniay ve Dolunay dönemlerinde enerji alanlarımız genişler ve yeni niyet kapıları açılır. Kendi doğum haritanızdaki transitleri takip ederek en doğru zamanda en doğru adımları atabilirsiniz.',
    imageUrl: 'https://mbqjklupfoqbcfxusigs.supabase.co/storage/v1/object/public/app-assets/images/runes/uruz.png',
    category: 'Astroloji',
    published: true
  }
];

export const SCHUMANN_RULES = [
  {
    minScore: '0.0',
    title: 'Dingin Elektromanyetik Akış (Sakin Faz)',
    science: 'Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana frekansı 7.83 Hz civarında dengeli ve doğal titreşiminde seyrediyor. İyonosfer tabakası sakin durumda.',
    symptoms: 'Zihinsel netlik, dengeli enerji seviyeleri, sakin uyku düzeni ve bedensel rahatlık. Olağanüstü bir uyarılma belirtisi beklenmez.',
    spiritual: 'Zihnin gürültüsünü yatıştırmak, yeni bilgiler öğrenmek, kadim dersleri çalışmak ve kök çakra meditasyonları yapmak için en ideal dönemdir. Enerjinizin merkezlendiği bu dingin zamanı tefekkür ile değerlendirebilirsiniz.'
  },
  {
    minScore: '3.0',
    title: 'Hafif Schumann Dalgalanması (Hafif Uyarım Seviyesi)',
    science: 'Schumann Rezonansı ana mod genliği (A1) hafif bir hareketlenme gösteriyor. Frekans 7.83 Hz civarında stabil seyrediyor.',
    symptoms: 'Rüyalarda belirgin netleşme ve sembolizm artışı, sezgisel uyanışlar, zihinde yaratıcı fikir patlamaları, kulaklarda hafif dalgalı uğultular ve hafif tatlı bir yorgunluk/esneme hali.',
    spiritual: 'Uyanış kapıları hafifçe uyarılmaktadır. Meditasyon, günlük tutma, rüya analizleri yapma ve yaratıcı projelere odaklanma için harika bir akıştır. Üçüncü göz bölgesine mavi/mor bir ışık hayal ederek odaklanabilirsiniz.'
  },
  {
    minScore: '5.0',
    title: 'Aktif Schumann Manyetik Fırtınası (G1-G2 Seviyesi)',
    science: 'Tomsk Rasathanesi verilerinde Schumann Rezonansı genliği (A1) yüksek uyarım göstererek iyonosferik dalgalanmaları tetikliyor.',
    symptoms: 'Kalp atışlarında ani hızlanma veya genişleme hissi, vücutta hafif statik elektrik birikimi (dokunulan yerlerin çarpması), hafif eklem ve şakak ağrıları, uykuya dalmakta gecikme ve içsel sabırsızlık.',
    spiritual: 'Kalp çakrası ve aura alanı genişlemektedir. Bedendeki fazla elektriği boşaltmak için tuzlu su banyosu yapın veya çıplak elle toprağa dokunun. Kalp merkezli nefes pratikleri (4 saniye al, 4 saniye ver) yaparak kozmik akışı bedende dengeleyin.'
  },
  {
    minScore: '7.0',
    title: 'Şiddetli Schumann Fırtınası (G3 Seviyesi)',
    science: 'Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana mod genliği (A1) sıradışı bir sıçramayla yükseldi. İyonosfer tabakası yoğun bir elektrik yüküyle titreşiyor.',
    symptoms: 'Sinir sisteminde belirgin uyarılma, uyku düzeninde dalgalanmalar (derin uykusuzluk ya da rüya yoğunluğu), baş ve ense bölgesinde hafif basınç, kulaklarda kesintisiz tiz çınlamalar ve çok canlı, sembolik rüyalar.',
    spiritual: 'DNA sarmallarında uyarım ve ışık kodlarının entegrasyonu aktiftir. Bedeninizi yormadan hafif egzersizler yapın. Bol su tüketin, topraklanın ve yüksek frekanslı meditasyonlara odaklanın.'
  },
  {
    minScore: '8.0',
    title: 'Ağır Schumann Fırtınası (G4 Seviyesi)',
    science: 'Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana mod genliği (A1) ekstrem bir yükselişe ulaştı. İyonosfer tabakası çok yüksek manyetik basınç altında.',
    symptoms: 'Yoğun fiziksel yorgunluk ve kas seğirmeleri (frekans uyumlanması), baş bölgesinde taç kısmına doğru yayılan basınç, uyku düzeninde derin kaymalar (gece yarısı uyanıp tekrar uyuyamama), zaman algısında geçici bükülmeler.',
    spiritual: 'Taç çakra portalı tamamen açılmıştır ve yüksek boyutlu ışık bedene geçiş enerjisi aktiftir. Bugün kendinizi zorlayacak fiziksel işlerden kesinlikle kaçının. Taç çakranızdan giren beyaz ışığın bedeninizi yıkayarak yere aktığını imgeleyin.'
  },
  {
    minScore: '9.0',
    title: 'Ekstrem Schumann Rezonans Fırtınası (G5 Zirve Seviyesi)',
    science: 'Tomsk Rasathanesi ölçümlerine göre Schumann Rezonansı ana mod genliği (A1) tarihi zirvesine ulaştı. Frekans düzeyinde ekstrem titreşiyor. İyonosfer tabakası tam doygunluk sınırında elektrik yüküyle yüklü.',
    symptoms: 'Sinir sisteminin en yüksek kapasitede uyarılması, derin trans benzeri uyku halleri veya mutlak uykusuzluk, baş ve ensede çok yoğun basınç, kulaklarda çok yüksek tonda uğultu/çınlama sesleri, aşırı duyarlılık ve bedensel hafiflik/ağırlık hissi dalgalanmaları.',
    spiritual: 'Zirve boyutlar arası geçiş portalı ve hücresel simya devrededir. Kollektif bilinçle ve kozmik kaynakla bütünleşme anıdır. Bol alkali su tüketin ve çıplak ayakla nemli toprağa basarak mutlak topraklanma sağlayın. Zihni tamamen susturarak teslimiyet meditasyonu yapın.'
  }
];

