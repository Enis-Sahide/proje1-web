export const FREQUENCIES = [
  { id: '1', hz: 396, name: 'Korku ve Suçluluk', desc: 'Kök çakrayı temizler, engelleri kaldırır.', intent: 'Tüm eski korkularımı ve suçluluk duygularımı sevgiyle serbest bırakıyorum. Evrende tamamen güvendeyim.', color: '#FF3B30' },
  { id: '2', hz: 417, name: 'Değişimi Kolaylaştırma', desc: 'Sakral çakrayı arındırır, negatif enerjiyi ve travmaları temizler.', intent: 'Geçmişin yüklerinden özgürleşiyorum. Hayatımdaki mucizevi değişimleri sevgiyle kabul ediyorum.', color: '#FF9500' },
  { id: '3', hz: 528, name: 'DNA Onarımı ve Mucize', desc: 'Solar pleksus çakrasını dengeler, yaşam enerjisini artırır, frekansı yükseltir.', intent: 'Hücrelerim evrenin sevgi frekansıyla yenileniyor. Kendi içimdeki mucizevi şifa gücüne uyanıyorum.', color: '#FFCC00' },
  { id: '4', hz: 639, name: 'İlişkiler ve Bağlantı', desc: 'Kalp çakrasını açar, evrensel uyum getirir.', intent: 'Kendimi ve tüm varoluşu şefkatle kucaklıyorum. İlişkilerim saf sevgi, uyum ve denge içinde akıyor.', color: '#34C759' },
  { id: '5', hz: 741, name: 'Sezgi ve Uyanış', desc: 'Boğaz çakrasını açar, içgüdüleri güçlendirir, zihni berraklaştırır.', intent: 'Zihnimdeki tüm yanılsamalar (illüzyonlar) çözülüyor. İçsel rehberliğimi net bir şekilde duyuyorum.', color: '#32ADE6' },
  { id: '6', hz: 852, name: 'Kozmik Bağlantı', desc: 'Üçüncü göz çakrasını dengeler, üst benlikle bağ kurdurur, ruhani uyanış.', intent: 'Yüksek bilincimle tam bir bütünlük içindeyim. Evrensel gerçeği kalbimin gözüyle, açıkça görebiliyorum.', color: '#007AFF' },
  { id: '7', hz: 963, name: 'İlahi Bütünlük', desc: 'Tepe çakrayı açar, evrensel bilinçle tam bağlantı sağlar.', intent: 'Ben evrenin ta kendisiyim. İlahi olanla aramdaki tüm sınırlar kalktı ve sonsuz ışığa uyandım.', color: '#AF52DE' },
];

export const ORGAN_FREQUENCIES = [
  { id: 'org_1', hz: 110.0, name: 'Mide Şifası', desc: 'Mide sağlığını destekler, sindirimi rahatlatır.', intent: 'Sindirimi sevgiyle kabul ediyor, midemi şifalandırıyorum.', color: '#FFCC00' },
  { id: 'org_2', hz: 117.3, name: 'Pankreas Şifası', desc: 'Pankreası dengeler, kan şekerini düzenlemeye yardımcı olur.', intent: 'Pankreasım sağlıklı ve dengede, bedenimi besliyor.', color: '#FFCC00' },
  { id: 'org_3', hz: 220.0, name: 'Akciğer Şifası', desc: 'Akciğer kapasitesini artırır, nefesi derinleştirir.', intent: 'Hayatın nefesini tam ve derinden içime çekiyorum.', color: '#34C759' },
  { id: 'org_4', hz: 315.8, name: 'Beyin Şifası', desc: 'Zihinsel yorgunluğu giderir, beyin fonksiyonlarını dengeler.', intent: 'Zihnim berrak ve sakin, yüksek bilincimle uyum içindeyim.', color: '#AF52DE' },
  { id: 'org_5', hz: 317.8, name: 'Karaciğer Şifası', desc: 'Karaciğerin arınmasını ve detoksifikasyonunu destekler.', intent: 'Bedenimdeki tüm toksinlerden ve öfkeden arınıyorum.', color: '#FFCC00' },
  { id: 'org_6', hz: 319.9, name: 'Böbrek Şifası', desc: 'Böbrek sağlığını destekler, korkulardan arınmaya yardımcı olur.', intent: 'Korkuyu serbest bırakıyor, derin bir güven duygusuyla doluyorum.', color: '#FF9500' },
  { id: 'org_7', hz: 321.9, name: 'Kan ve Dolaşım', desc: 'Kan hücrelerini canlandırır, dolaşımı rahatlatır.', intent: 'Yaşam enerjisi tüm bedenimde özgürce dolaşıyor.', color: '#FF3B30' },
];

export default function MeditationPage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center">
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen pointer-events-none -z-10" />
      
      <div className="max-w-4xl w-full relative z-10">
        <h1 className="text-4xl font-bold text-mystic-primary mb-6 drop-shadow-md">Frekans Odası</h1>
        <p className="text-mystic-text-muted text-lg mb-12">
          Zihninizi dinginleştirmek, içsel huzurunuzu bulmak ve evrensel enerjilerle hizalanmak için tasarlanmış şifa frekanslarımızı keşfedin.
        </p>

        <h2 className="text-2xl font-semibold text-mystic-accent mb-6 border-b border-mystic-surface-light pb-2">Çakra Frekansları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {FREQUENCIES.map((freq) => (
            <div key={freq.id} className="bg-mystic-surface/80 backdrop-blur-md border border-mystic-surface-light rounded-2xl overflow-hidden hover:border-mystic-primary transition-colors group cursor-pointer p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-lg" style={{ borderColor: freq.color, backgroundColor: freq.color + '20' }}>
                  <span className="font-bold text-lg" style={{ color: freq.color }}>{freq.hz}</span>
                  <span className="text-xs ml-1" style={{ color: freq.color }}>Hz</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-mystic-text" style={{ color: freq.color }}>{freq.name}</h3>
                  <p className="text-mystic-text-muted text-sm">{freq.desc}</p>
                </div>
              </div>
              <div className="bg-mystic-dark/50 p-4 rounded-xl border border-mystic-surface-light/50">
                <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: freq.color }}>Odak Niyeti</span>
                <p className="text-mystic-text text-sm italic">"{freq.intent}"</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold text-mystic-accent mb-6 border-b border-mystic-surface-light pb-2">Organ Şifalandırma Frekansları</h2>
        <p className="text-sm text-mystic-text-muted mb-6 italic">* Araştırmacı Barbara Hero'nun sağlıklı organlardaki ses dalgası ölçümlerine dayanır.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ORGAN_FREQUENCIES.map((freq) => (
            <div key={freq.id} className="bg-mystic-surface/80 backdrop-blur-md border border-mystic-surface-light rounded-2xl overflow-hidden hover:border-mystic-primary transition-colors group cursor-pointer p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-lg" style={{ borderColor: freq.color, backgroundColor: freq.color + '20' }}>
                  <span className="font-bold text-sm" style={{ color: freq.color }}>{freq.hz}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-mystic-text" style={{ color: freq.color }}>{freq.name}</h3>
                  <p className="text-mystic-text-muted text-sm">{freq.desc}</p>
                </div>
              </div>
              <div className="bg-mystic-dark/50 p-4 rounded-xl border border-mystic-surface-light/50">
                <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: freq.color }}>Odak Niyeti</span>
                <p className="text-mystic-text text-sm italic">"{freq.intent}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
