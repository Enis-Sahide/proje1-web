export default function KadimDerslerPage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-mystic-text mb-6">Kadim Dersler</h1>
        <p className="text-mystic-text-muted text-lg mb-8">
          Astroloji, İnsan Tasarımı, Çakra Sistemi ve daha birçok spiritüel konuyu derinlemesine öğrenebileceğiniz kapsamlı rehberler.
        </p>

        <div className="space-y-6">
          {[
            { id: 'duygusal-hastaliklar', title: 'Hastalıkların Duygusal Nedenleri' },
            { id: 'akupunktur', title: 'Akupunktur ve Meridyenler' },
            { id: 'kabbalah', title: 'Evrensel Kabbalah' },
            { id: 'astroloji', title: 'Ezoterik Astroloji' },
            { id: 'human', title: 'Human Design' },
            { id: 'sembolizm', title: 'Kadim Sembolizm' },
            { id: 'numeroloji', title: 'Numeroloji' },
            { id: 'rune', title: 'Rune Tılsımları' },
            { id: 'tarot', title: 'Tarot ve Arkana' },
            { id: 'yoga', title: 'Yoga Asanaları' }
          ].map((item, index) => (
            <div key={index} className="bg-mystic-surface/80 backdrop-blur-md border border-mystic-surface-light rounded-2xl p-6 hover:border-mystic-primary transition-all group cursor-pointer flex items-center justify-between shadow-lg">
              <div>
                <h3 className="text-xl font-semibold text-mystic-text group-hover:text-mystic-accent transition-colors">{item.title}</h3>
              </div>
              <div className="text-mystic-primary opacity-50 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
