// Transit Interpretations Dictionary

export function getTransitHouseInterpretation(transitPlanet: string, house: number): { title: string, content: string } {
  const planetNames: Record<string, string> = {
    'Güneş': 'Odağınızın, canlılığınızın ve bilinçli farkındalığınızın',
    'Ay': 'Duygusal ihtiyaçlarınızın ve içgüdüsel tepkilerinizin',
    'Merkür': 'Zihninizin, iletişim şeklinizin ve karar alma süreçlerinizin',
    'Venüs': 'İlişkilerinizin, değer duygunuzun ve zevklerinizin',
    'Mars': 'Enerjinizin, motivasyonunuzun ve mücadele gücünüzün',
    'Jüpiter': 'Büyüme fırsatlarının, inancınızın ve şansınızın',
    'Satürn': 'Sınavlarınızın, sorumluluklarınızın ve yapılandırma ihtiyacınızın',
    'Uranüs': 'Ani uyanışların, isyanların ve özgürleşme isteğinizin',
    'Neptün': 'İlhamınızın, yanılgılarınızın ve ruhsal çözülmelerinizin',
    'Plüton': 'Derin dönüşümlerinizin, krizlerinizin ve yeniden doğuşunuzun',
    'Kiron': 'Eski yaralarınızın tetiklenmesi ve şifalanma sürecinizin'
  };

  const houseThemes: Record<number, string> = {
    1: 'kişisel imajınız, bedeniniz ve hayatı başlatma enerjiniz üzerinde yoğunlaştığı bir dönemdesiniz. Kendinizi dış dünyaya yeniden tanıtıyorsunuz.',
    2: 'maddi kaynaklarınız, yetenekleriniz ve özdeğer algınız üzerinde çalıştığı bir zamandasınız. Sahip olduklarınızı yeniden değerlendiriyorsunuz.',
    3: 'iletişim ağınız, yakın çevreniz, eğitimleriniz ve zihinsel projeleriniz alanında aktifleştiği bir süreçtesiniz.',
    4: 'kökleriniz, aileniz, ev hayatınız ve en derin içsel dünyanızda köklü değişimler veya vurgular yarattığı bir dönem.',
    5: 'aşk hayatınız, yaratıcılığınız, çocuklarla ilgili konular ve hayattan aldığınız keyif alanında kendini gösterdiği bir süreç.',
    6: 'günlük rutinleriniz, iş ortamınız, sağlığınız ve hizmet etme şekliniz üzerinde etkili olduğu bir zamandasınız.',
    7: 'ikili ilişkileriniz, evliliğiniz, ortaklıklarınız ve açık düşmanlıklar alanında önemli testler veya fırsatlar getirdiği bir dönem.',
    8: 'krizler, dönüşümler, paylaşılan finansal kaynaklar ve derin psikolojik yüzleşmeler alanında çalıştığı bir evre.',
    9: 'hayat felsefeniz, inançlarınız, uzak seyahatler veya yüksek eğitim konularında ufkunuzu genişlettiği bir zaman dilimi.',
    10: 'kariyeriniz, toplumsal statünüz ve hedefleriniz alanında zirveye çıkma veya yeniden yapılanma etkileri verdiği bir süreç.',
    11: 'sosyal çevreniz, idealleriniz, umutlarınız ve dahil olduğunuz gruplar içinde vizyonunuzu güncellediği bir evre.',
    12: 'bilinçaltınız, gizli korkularınız, ruhsal inziva ihtiyacınız ve kadersel çözülmeler alanında derin bir içsel çalışma yaptığı dönem.'
  };

  const pTheme = planetNames[transitPlanet] || 'Bu gezegen enerjisinin';
  const hTheme = houseThemes[house] || 'bu alanda etkili olduğu bir süreç.';

  return {
    title: `Transit ${transitPlanet} ${house}. Evinizde`,
    content: `${transitPlanet} transit halindeyken ${house}. evinize girdiğinde; ${pTheme.toLowerCase()} ${hTheme} \n\nBu transit geçişi, haritanızdaki bu evin konularını tetikleyecek ve yaşamınızın bu alanında yeni bir sayfa açmanıza, farkındalık kazanmanıza veya birtakım sınavlar vermenize neden olacaktır.`
  };
}

export function getTransitAspectInterpretation(tPlanet: string, nPlanet: string, aspect: string): { title: string, content: string } {
  let interaction = '';
  switch(aspect) {
    case 'Kavuşum': interaction = 'doğrudan birleşiyor ve enerjisini katlıyor. Bu, ilgili gezegenin konularında yeni bir döngünün başlangıcıdır.'; break;
    case 'Karşıt': interaction = 'tam karşıdan meydan okuyor. İlişkiler ve dış dünya üzerinden gelen farkındalıklar, krizler veya denge bulma ihtiyacı ön planda.'; break;
    case 'Kare': interaction = 'sürtüşme ve gerilim yaratıyor. Harekete geçmek zorunda kalacağınız, krizler yoluyla büyüyeceğiniz bir dönüm noktası.'; break;
    case 'Üçgen': interaction = 'uyumlu ve akıcı bir destek veriyor. Fırsatların kendiliğinden önünüze geleceği, çabasız bir gelişim süreci.'; break;
    case 'Sekstil': interaction = 'fırsatlar sunuyor ancak bunları değerlendirmek için sizin adım atmanız ve çaba göstermeniz gerekiyor.'; break;
    case 'Görmeyen': interaction = 'birbirini anlamakta zorlanıyor. İçsel bir huzursuzluk veya kontrol edemediğiniz temalar devrede olabilir.'; break;
    default: interaction = 'etkileşime giriyor.';
  }

  return {
    title: `Transit ${tPlanet} ${aspect} Natal ${nPlanet}`,
    content: `Gökyüzünde şu an hareket eden (Transit) ${tPlanet}, doğduğunuz andaki (Natal) ${nPlanet} ile ${interaction} \n\n${tPlanet}'in getirdiği güncel etkiler, ${nPlanet}'in temsil ettiği doğuştan gelen karakter özelliklerinizi ve kadersel temalarınızı güçlü bir şekilde tetikliyor. Bu açının kesinleştiği (orb'un 0 olduğu) günlerde bu etkiyi yaşamınızda en yoğun haliyle hissedersiniz.`
  };
}

export function getTransitTransitAspectInterpretation(
  p1: string,
  p2: string,
  aspect: string,
  houseNum?: number
): { title: string, content: string } {
  const planetThemes: Record<string, { keyword: string, action: string }> = {
    'Güneş': { keyword: 'Bilinç ve Hayat Enerjisi', action: 'parlamayı ve odaklanmayı' },
    'Ay': { keyword: 'Duygular ve İçgüdüler', action: 'duygusal temaları ve hassasiyeti' },
    'Merkür': { keyword: 'Zihin, İletişim ve Kararlar', action: 'düşünceleri, konuşmaları ve anlaşmaları' },
    'Venüs': { keyword: 'İlişkiler, Değerler ve Sevgi', action: 'ikili ilişkileri, sevgiyi ve finansal değerleri' },
    'Mars': { keyword: 'Eylem, Mücadele ve Motivasyon', action: 'harekete geçmeyi, cesareti ve mücadele gücünü' },
    'Jüpiter': { keyword: 'Büyüme, İnanç ve Fırsatlar', action: 'şansı, genişlemeyi ve iyimserliği' },
    'Satürn': { keyword: 'Disiplin, Sorumluluk ve Yapılandırma', action: 'ciddiyeti, olgunlaşmayı ve kısıtlamaları' },
    'Uranüs': { keyword: 'Uyanış, Özgürlük ve Ani Değişimler', action: 'ani farkındalıkları ve yenilikleri' },
    'Neptün': { keyword: 'Sezgiler, Hayaller ve İlham', action: 'maneviyatı, sanatsal ilhamı ve belirsizlikleri' },
    'Plüton': { keyword: 'Dönüşüm, Güç ve Krizler', action: 'derin değişimleri, güç mücadelelerini ve simyasal dönüşümü' },
    'Kiron': { keyword: 'Yaralar ve Şifalanma', action: 'geçmiş yaraları ve ruhsal şifalanma sürecini' }
  };

  const aspectThemes: Record<string, string> = {
    'Kavuşum': 'odak noktasında birleştiriyor. Bu iki gezegenin temsil ettiği enerjiler dünyada el ele vererek güçlü bir başlangıç ve yoğun bir odaklanma yaratıyor.',
    'Karşıt': 'karşı karşıya getirerek gerilim yaratıyor. İlişkiler, kararlar ve olaylar üzerinden bir denge bulma ve farkındalık geliştirme sınavı devrede.',
    'Kare': 'arasında sert bir çatışma ve sürtüşme yaratıyor. Harekete geçmeyi zorunlu kılan, engelleri aşmak için çaba gerektiren bir gerilim mevcut.',
    'Üçgen': 'arasında çok akıcı ve destekleyici bir energy akışı sağlıyor. İşlerin kendiliğinden yoluna girmesi ve şanslı fırsatların kapıyı çalması kolaylaşıyor.',
    'Sekstil': 'destekleyici fırsat kapıları aralıyor. Ancak bu olumlu enerjiden yararlanmak için dünyada somut adımlar atılması ve çaba gösterilmesi gerekiyor.',
    'Görmeyen': 'arasında bir kör nokta yaratıyor. Dünyada ne yöne gideceğini bilememe veya içsel huzursuzluk hissi tetiklenebilir.'
  };

  const houseThemes: Record<number, { domain: string, focus: string }> = {
    1: { domain: 'kişisel imajınız, bedeniniz ve hayata başlangıç şekliniz', focus: 'bireysel hedeflerinizi başlatma ve kendinizi ifade etme' },
    2: { domain: 'maddi kaynaklarınız, yetenekleriniz ve öz değer algınız', focus: 'güvenlik arayışınızı ve finansal durumunuzu' },
    3: { domain: 'iletişim ağınız, eğitimleriniz, yakın çevre ve zihinsel projeleriniz', focus: 'zihinsel trafiğinizi ve yakın çevrenizle olan bağları' },
    4: { domain: 'kökleriniz, ev hayatınız, aileniz ve iç dünyanız', focus: 'içsel güvenliğinizi ve ailevi meselelerinizi' },
    5: { domain: 'aşk hayatınız, yaratıcılığınız, çocuklarla olan konular ve hayattan aldığınız keyif', focus: 'yaratım gücünüzü ve hobilerinizi' },
    6: { domain: 'günlük rutinleriniz, iş ortamınız, sağlığınız ve hizmet etme şekliniz', focus: 'düzen kurma ve arınma isteğinizi' },
    7: { domain: 'ikili ilişkileriniz, evlilik ve ortaklıklarınız', focus: 'ilişkilerde denge ve adalet kurma ihtiyacınızı' },
    8: { domain: 'paylaşılan finansal kaynaklar, krizler ve derin dönüşümler', focus: 'simyasal arınma ve psikolojik yüzleşmeleri' },
    9: { domain: 'hayat felsefeniz, inançlarınız, uzak seyahatler veya yüksek eğitim', focus: 'yaşam vizyonunuzu ve gerçeği arama isteğinizi' },
    10: { domain: 'kariyeriniz, hedefleriniz ve toplumsal statünüz', focus: 'kariyer basamaklarını ve sorumluluklarınızı' },
    11: { domain: 'sosyal çevreniz, umutlarınız ve dahil olduğunuz gruplar', focus: 'gelecek hayallerinizi ve arkadaşlıklarınızı' },
    12: { domain: 'bilinçaltınız, gizli korkularınız ve ruhsal inziva ihtiyacınız', focus: 'içsel kabuğunuza çekilmeyi, ruhsal teslimiyeti ve kadersel arınmayı' }
  };

  const name1 = planetThemes[p1] || { keyword: p1, action: p1 };
  const name2 = planetThemes[p2] || { keyword: p2, action: p2 };
  const aspectText = aspectThemes[aspect] || 'etkileşim yaratıyor.';

  const title = `Gökyüzünde ${p1} ve ${p2} ${aspect}`;
  let content = `Bugün gökyüzünde ${p1} (${name1.keyword}) ile ${p2} (${name2.keyword}) bir "${aspect}" açısı yapıyor.\n\nKolektif Etki:\nBu göksel kombinasyon, küresel planda ${name1.action} ve ${name2.action} ${aspectText}\n\nBu açı, gün boyunca dünya genelindeki enerjiyi (kolektif astrolojik hava durumunu) şekillendirir.`;

  if (houseNum && houseThemes[houseNum]) {
    const house = houseThemes[houseNum];
    content += `\n\nSizin Haritanıza Özel Etki:\nBu açı, sizin doğum haritanızda **${houseNum}. evde (${house.domain})** gerçekleşiyor. Dolayısıyla bu kolektif enerjiyi hayatınızda en güçlü şekilde **${house.focus}** tetikleyen konular üzerinden deneyimleyeceksiniz.`;
  }

  return { title, content };
}
