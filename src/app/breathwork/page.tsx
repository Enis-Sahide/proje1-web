export const TECHNIQUES = [
  { id: 'nadishodhan', name: 'Nadi Shodhan', desc: 'İda ve Pingala Dengesi', instruction: 'Gözlerinizi kapatın. Sol burun deliğinden yavaşça, derin ve yumuşak nefes alın. Sol deliği yüzük ve serçe parmaklarınızla kapatıp sağdan nefes verin. Çiçek koklar gibi nazikçe yapın. Bu egzersiz bedeninizdeki 72000 nadi kanalını temizler.', phases: [{ name: 'SOL AL', time: 4 }, { name: 'SAĞ VER', time: 6 }, { name: 'SAĞ AL', time: 4 }, { name: 'SOL VER', time: 6 }] },
  { id: '448', name: '4-4-8 Nefesi', desc: 'Derin Gevşeme', instruction: 'Nefesi 4 saniye boyunca burnunuzdan alın. 4 saniye boyunca nefesinizi tutun. Ardından 8 saniye boyunca ağzınızdan yavaşça nefesinizi verin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 8 }] },
  { id: '478', name: 'Kadim 4-7-8', desc: 'Uyku ve Sakinlik', instruction: 'Dilinizi üst dişlerinizin arkasına yerleştirin. Nefesi burnunuzdan karnınıza (diyaframa) doğru alın. Ağzınızdan güçlü bir "hııış" sesiyle verin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 7 }, { name: 'NEFES VER', time: 8 }] },
  { id: 'box', name: 'Kare Nefes', desc: 'Odaklanma ve Denge', instruction: 'Dik oturun. Burnunuzdan göğüs kafesinizi eşit genişleterek alın. Nefesi tutarken omuzlarınızı kasmayın. Akciğerler boşaldığında huzurla bekleyin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 4 }, { name: 'BEKLE', time: 4 }] },
  { id: 'ujjayi', name: 'Ateş Nefesi', desc: 'Enerji ve Canlılık', instruction: 'Sadece burundan alın ve verin. Karın kaslarınızı bir körük gibi kullanarak nefesi hızlı ve ritmik bir şekilde itin. Göğüs hareketsiz kalmalıdır.', phases: [{ name: 'NEFES AL', time: 3 }, { name: 'NEFES VER', time: 3 }] },
  { id: 'relax', name: 'Stres Savar', desc: 'Anksiyete Giderici', instruction: 'Sadece burnunuzdan derin diyafram nefesi alın. Verirken dudaklarınızı ıslık çalacakmış gibi büzün ve havayı çok yavaşça üfleyerek verin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 6 }, { name: 'BEKLE', time: 2 }] },
  { id: 'bhramari', name: 'Arı Nefesi', desc: 'Zihni Susturur', instruction: 'Gözlerinizi ve kulaklarınızı hafifçe kapatın. Burnunuzdan derin nefes alın. Verirken kapalı ağızla arı gibi "mmmm" diye mırıldanıp titreşimi beyninizde hissedin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'NEFES VER', time: 8 }] },
  { id: 'sama', name: 'Sama Vritti', desc: 'Sağ-Sol Lob Dengesi', instruction: 'Beyin loblarını eşitler. Omurganız dik olsun. Akciğerlerinize dolan ve boşalan havanın eşit sürede (6 saniye) olmasına tam odaklanın.', phases: [{ name: 'NEFES AL', time: 6 }, { name: 'NEFES VER', time: 6 }] },
  { id: 'tummo', name: 'Tummo', desc: 'İçsel Isı ve Güç', instruction: 'Derin nefes alıp karın kaslarınızı ve pelvik tabanınızı sıkın (kök kilidi). Bedendeki sıcaklığın arttığını imgeleyin. Ardından çok yavaşça nefesi verin.', phases: [{ name: 'NEFES AL', time: 4 }, { name: 'TUT', time: 4 }, { name: 'NEFES VER', time: 8 }] },
];

export default function BreathworkPage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-12 relative flex flex-col items-center">
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen pointer-events-none -z-10" />
      
      <div className="max-w-4xl w-full relative z-10">
        <h1 className="text-4xl font-bold text-mystic-primary mb-6 drop-shadow-md">Nefes Egzersizleri</h1>
        <p className="text-mystic-text-muted text-lg mb-12">
          Yaşam enerjisini (Prana) doğru kullanarak bedeninizi ve zihninizi şifalandırın.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TECHNIQUES.map((tech) => (
            <div key={tech.id} className="bg-mystic-surface/80 backdrop-blur-md border border-mystic-surface-light rounded-2xl overflow-hidden hover:border-mystic-primary transition-colors group p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-mystic-text mb-1 group-hover:text-mystic-accent transition-colors">{tech.name}</h3>
                  <p className="text-mystic-primary-light text-sm font-medium">{tech.desc}</p>
                </div>
              </div>
              
              <div className="bg-mystic-dark/60 p-4 rounded-xl border border-mystic-surface-light/50 mb-4">
                <p className="text-mystic-text-muted text-sm leading-relaxed italic">
                  {tech.instruction}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tech.phases.map((phase, idx) => (
                  <div key={idx} className="bg-mystic-surface-light/50 px-3 py-1.5 rounded-lg border border-mystic-surface-light text-xs font-medium text-mystic-text flex items-center gap-2">
                    <span className="text-mystic-accent">{phase.name}</span>
                    <span className="text-mystic-text-muted">{phase.time}s</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
