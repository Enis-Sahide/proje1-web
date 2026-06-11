export type ChakraId = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'thirdEye' | 'crown';

export interface ChakraQuestion {
  id: number;
  chakraId: ChakraId;
  text: string;
}

export const CHAKRA_TEST_QUESTIONS: ChakraQuestion[] = [
  // Root Chakra
  { id: 1, chakraId: 'root', text: 'Kendimi dünyada güvende, desteklenmiş ve köklenmiş hissediyorum.' },
  { id: 2, chakraId: 'root', text: 'Maddi konular ve temel ihtiyaçlarım konusunda içsel bir rahatlık taşıyorum.' },
  { id: 3, chakraId: 'root', text: 'Fiziksel bedenimle barışığım ve hayatta kalma endişesi yaşamıyorum.' },

  // Sacral Chakra
  { id: 4, chakraId: 'sacral', text: 'Hayattan zevk alabiliyor ve duygularımı rahatça akışa bırakabiliyorum.' },
  { id: 5, chakraId: 'sacral', text: 'Yaratıcı enerjim yüksek, yeni fikirler üretmekten keyif alıyorum.' },
  { id: 6, chakraId: 'sacral', text: 'Kendi cinselliğimle ve duygusal yakınlık kurmakla ilgili rahat hissediyorum.' },

  // Solar Plexus Chakra
  { id: 7, chakraId: 'solar', text: 'Kendi gücümün farkındayım ve gerektiğinde insanlara "hayır" diyebiliyorum.' },
  { id: 8, chakraId: 'solar', text: 'Özgüvenim yüksek, hedeflerime ulaşmak için gereken iradeye sahibim.' },
  { id: 9, chakraId: 'solar', text: 'Kararlarımı başkalarının etkisinde kalmadan, kendi iç sesimle alabiliyorum.' },

  // Heart Chakra
  { id: 10, chakraId: 'heart', text: 'Kendimi ve başkalarını hatalarıyla kabul edip, kolayca affedebiliyorum.' },
  { id: 11, chakraId: 'heart', text: 'İlişkilerimde karşılıksız sevgi, şefkat ve empati gösterebiliyorum.' },
  { id: 12, chakraId: 'heart', text: 'Sevgiyi almanın ve vermenin güvenli olduğuna inanıyorum.' },

  // Throat Chakra
  { id: 13, chakraId: 'throat', text: 'Duygu ve düşüncelerimi dürüstçe, korkmadan ifade edebiliyorum.' },
  { id: 14, chakraId: 'throat', text: 'İnsanlar benimle konuşurken onları gerçekten dinleyip anlayabiliyorum.' },
  { id: 15, chakraId: 'throat', text: 'İçsel gerçeğimi konuşmak benim için kolay ve doğaldır.' },

  // Third Eye Chakra
  { id: 16, chakraId: 'thirdEye', text: 'İçgüdülerime ve sezgilerime güvenirim; genellikle beni doğru yönlendirirler.' },
  { id: 17, chakraId: 'thirdEye', text: 'Gelecekle ilgili vizyonum net ve hayal gücüm çok kuvvetlidir.' },
  { id: 18, chakraId: 'thirdEye', text: 'Olayların sadece görünür yüzünü değil, arkasındaki derin anlamları da görebiliyorum.' },

  // Crown Chakra
  { id: 19, chakraId: 'crown', text: 'Evrenle, yaratıcıyla veya yüksek bir güçle derin bir bağ hissediyorum.' },
  { id: 20, chakraId: 'crown', text: 'Hayatımın daha büyük bir amacın parçası olduğunun farkındayım.' },
  { id: 21, chakraId: 'crown', text: 'Dünyevi kaygılardan arınıp saf bir içsel huzur ve bilinç halini deneyimleyebiliyorum.' }
];

export const CHAKRA_INFO = {
  root: { name: 'Kök Çakra', color: '#EF4444', meaning: 'Güven, Hayatta Kalma, Köklenme', pathId: '1' },
  sacral: { name: 'Sakral Çakra', color: '#F97316', meaning: 'Duygular, Yaratıcılık, Haz', pathId: '2' },
  solar: { name: 'Solar Pleksus', color: '#EAB308', meaning: 'İrade, Özgüven, Güç', pathId: '3' },
  heart: { name: 'Kalp Çakrası', color: '#22C55E', meaning: 'Sevgi, Şefkat, Affetme', pathId: '4' },
  throat: { name: 'Boğaz Çakrası', color: '#06B6D4', meaning: 'İletişim, Gerçeklik, İfade', pathId: '5' },
  thirdEye: { name: 'Üçüncü Göz', color: '#3B82F6', meaning: 'Sezgi, Vizyon, İçgörü', pathId: '6' },
  crown: { name: 'Taç Çakra', color: '#A855F7', meaning: 'Spiritüellik, Bütünlük, Bilinç', pathId: '7' }
};
