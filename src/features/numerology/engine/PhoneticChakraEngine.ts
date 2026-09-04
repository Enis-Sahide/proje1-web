/**
 * PhoneticChakraEngine.ts
 * Kadim Harf Mahreçleri (Fonetik Anatomi), 9 Çakra Dağılımı,
 * Ouroboros Döngü Geometrisi, Kişisel İsim Simülatörü ve Marka Akustiği Motoru.
 */

export type MahrecType = 'throat' | 'palate' | 'lip' | 'dental';
export type ElementType = 'Ateş' | 'Toprak' | 'Hava' | 'Su' | 'Eter';
export type TargetGoal = 'wealth' | 'fame' | 'love' | 'spiritual';

export interface LetterInfo {
  char: string;
  chakra: number;
  mahrec: MahrecType;
  mahrecName: string;
  element: ElementType;
  meaning: string;
}

export interface ChakraData {
  number: number;
  name: string;
  sanskrit: string;
  domain: string;
  color: string;
  element: ElementType;
  planet: string;
  letters: string[];
}

export const CHAKRA_METADATA: Record<number, ChakraData> = {
  1: {
    number: 1,
    name: 'Kök Çakra',
    sanskrit: 'Muladhara',
    domain: 'Köklenme, Liderlik, Hayatta Kalma, Başlangıç Gücü',
    color: '#EF4444', // Kırmızı
    element: 'Ateş',
    planet: 'Güneş / Mars',
    letters: ['A', 'J', 'S', 'Ş']
  },
  2: {
    number: 2,
    name: 'Sakral Çakra',
    sanskrit: 'Svadhisthana',
    domain: 'Çekim Gücü, Yaratıcılık, İlişkiler, Müşteri Bağı, Alma-Verme',
    color: '#F97316', // Turuncu
    element: 'Su',
    planet: 'Ay / Venüs',
    letters: ['B', 'K', 'T']
  },
  3: {
    number: 3,
    name: 'Solar Pleksus',
    sanskrit: 'Manipura',
    domain: 'İrade, Ticari Eylem, Parayı Yönetme, Özgüven, Büyüme',
    color: '#EAB308', // Sarı/Altın
    element: 'Ateş',
    planet: 'Jüpiter / Güneş',
    letters: ['C', 'Ç', 'L', 'U', 'Ü']
  },
  4: {
    number: 4,
    name: 'Kalp Çakra',
    sanskrit: 'Anahata',
    domain: 'Güvenilirlik, Sevgi, Mülk/Bereket (Mem), Kalıcı Eser',
    color: '#22C55E', // Yeşil
    element: 'Toprak',
    planet: 'Venüs / Satürn',
    letters: ['D', 'M', 'V']
  },
  5: {
    number: 5,
    name: 'Boğaz Çakra',
    sanskrit: 'Vishuddha',
    domain: 'İfade, Görünürlük, Dijital Ağ, İletişim, Şöhret',
    color: '#06B6D4', // Turkuaz
    element: 'Hava',
    planet: 'Merkür',
    letters: ['E', 'N', 'W']
  },
  6: {
    number: 6,
    name: 'Üçüncü Göz',
    sanskrit: 'Ajna',
    domain: 'Vizyon, Estetik, Sanatsal İlham, Algı, Kutsal Çember',
    color: '#3B82F6', // İndigo / Mavi
    element: 'Eter',
    planet: 'Venüs / Jüpiter',
    letters: ['F', 'O', 'Ö', 'X']
  },
  7: {
    number: 7,
    name: 'Taç Çakra',
    sanskrit: 'Sahasrara',
    domain: 'Derin Analiz, Ruhsal Derinlik, Gizem, Bilgelik, Ar-Ge',
    color: '#A855F7', // Mor
    element: 'Eter',
    planet: 'Neptün / Satürn',
    letters: ['G', 'Ğ', 'P', 'Y']
  },
  8: {
    number: 8,
    name: 'Aura / Kozmik Çakra',
    sanskrit: 'Kozmik Merkez',
    domain: 'Büyük Finans, Ticari Hükümranlık, Adalet, Dönüşüm',
    color: '#EC4899', // Pembe / Magenta / Altın
    element: 'Toprak',
    planet: 'Satürn / Plüton',
    letters: ['H', 'Q', 'Z']
  },
  9: {
    number: 9,
    name: 'Evrensel Bilinç',
    sanskrit: 'Evrensel Merkez',
    domain: 'Tamamlanma, Global Etki, Şifacılık, İlahi Akış, Yayılım',
    color: '#F43F5E', // Gül Kurusu / Beyaz Işık
    element: 'Ateş',
    planet: 'Mars / Güneş',
    letters: ['I', 'İ', 'R']
  }
};

export const LETTERS_DB: Record<string, LetterInfo> = {
  A: { char: 'A', chakra: 1, mahrec: 'throat', mahrecName: 'Gırtlak / Göğüs', element: 'Ateş', meaning: 'Alef - İlk Kıvılcım, Görünürlük, Parlama ve Sahne Gücü' },
  B: { char: 'B', chakra: 2, mahrec: 'lip', mahrecName: 'Dudak', element: 'Su', meaning: 'Bet - Bereket Kabı, Toplama, Çekim ve Müşteri İlişkisi' },
  C: { char: 'C', chakra: 3, mahrec: 'palate', mahrecName: 'Damak', element: 'Hava', meaning: 'Neşeli Sosyallik, İletişimsel Yaratıcılık' },
  Ç: { char: 'Ç', chakra: 3, mahrec: 'palate', mahrecName: 'Damak', element: 'Ateş', meaning: 'Keskin Odaklanma, Kararlılık ve Ticari Atılım' },
  D: { char: 'D', chakra: 4, mahrec: 'palate', mahrecName: 'Damak / Diş', element: 'Toprak', meaning: 'Dalet - Kutsal Kapı, Sağlam Yapı, Kurumsallık ve Güven' },
  E: { char: 'E', chakra: 5, mahrec: 'throat', mahrecName: 'Gırtlak', element: 'Hava', meaning: 'He - İfade Genişliği, Hızlı Bilgi Yayılımı ve Dijital Ağ' },
  F: { char: 'F', chakra: 6, mahrec: 'lip', mahrecName: 'Dudak / Diş', element: 'Hava', meaning: 'Estetik Duyarlılık, Sanatsal Uyum ve Zarafet' },
  G: { char: 'G', chakra: 7, mahrec: 'palate', mahrecName: 'Damak / Gırtlak', element: 'Eter', meaning: 'Gimel - Gizemli Derinlik, Analitik Zeka ve Sır' },
  Ğ: { char: 'Ğ', chakra: 7, mahrec: 'throat', mahrecName: 'Gırtlak', element: 'Eter', meaning: 'Görünmez Köprü, Süptil Enerji Aktarımı' },
  H: { char: 'H', chakra: 8, mahrec: 'throat', mahrecName: 'Gırtlak', element: 'Ateş', meaning: 'Yaşam Nefesi, Büyük Otorite, Dönüştürücü Finansal Güç' },
  I: { char: 'I', chakra: 9, mahrec: 'throat', mahrecName: 'Gırtlak / Damak', element: 'Eter', meaning: 'Saf Sezgi, Arınma ve Evrensel Tamamlanma' },
  İ: { char: 'İ', chakra: 9, mahrec: 'palate', mahrecName: 'Damak', element: 'Eter', meaning: 'Yod - İlahi Tohum, Yüksek Zeka ve Ruhsal Işık' },
  J: { char: 'J', chakra: 1, mahrec: 'dental', mahrecName: 'Diş', element: 'Ateş', meaning: 'Manyetik Çekim, Karizmatik Başlangıç' },
  K: { char: 'K', chakra: 2, mahrec: 'palate', mahrecName: 'Damak', element: 'Hava', meaning: 'Kaf - Avuç İçi, Alma-Verme Dengesi, Ticari İkna' },
  L: { char: 'L', chakra: 3, mahrec: 'palate', mahrecName: 'Damak / Dil', element: 'Su', meaning: 'Lamed - Kalpten Yükselen Genişleme, Bereket Akışı' },
  M: { char: 'M', chakra: 4, mahrec: 'lip', mahrecName: 'Dudak', element: 'Toprak', meaning: 'Mem - Mülk, Mal, Maya, Para, Somutlaştırma ve Tutma' },
  N: { char: 'N', chakra: 5, mahrec: 'palate', mahrecName: 'Damak / Burun', element: 'Hava', meaning: 'Nun - Kesilmeyen Yaşam Nehri, Çoğalma ve Yayılma' },
  O: { char: 'O', chakra: 6, mahrec: 'throat', mahrecName: 'Dudak / Gırtlak', element: 'Eter', meaning: 'Ouroboros - Kutsal Küre, Tam Aura Koruma ve Vizyon' },
  Ö: { char: 'Ö', chakra: 6, mahrec: 'throat', mahrecName: 'Dudak / Gırtlak', element: 'Eter', meaning: 'İçsel Vizyon, Özgün Sanat ve Yaratıcı Sezgi' },
  P: { char: 'P', chakra: 7, mahrec: 'lip', mahrecName: 'Dudak', element: 'Toprak', meaning: 'Pe - İfade Patlaması, Saygınlık ve Prestij' },
  R: { char: 'R', chakra: 9, mahrec: 'palate', mahrecName: 'Damak / Dil', element: 'Ateş', meaning: 'Resh - Dinamik Güç, Şöhret, Yayılım ve Liderlik' },
  S: { char: 'S', chakra: 1, mahrec: 'dental', mahrecName: 'Diş', element: 'Ateş', meaning: 'Samekh - Koruyucu Kalkan, Sarsılmaz Karizma, Işık' },
  Ş: { char: 'Ş', chakra: 1, mahrec: 'dental', mahrecName: 'Diş', element: 'Ateş', meaning: 'Yoğun Manyetik Işıma, Odak ve Sahne Gücü' },
  T: { char: 'T', chakra: 2, mahrec: 'palate', mahrecName: 'Damak / Diş', element: 'Toprak', meaning: 'Tav - Mühür, Güven, Sadakat ve Müşteri Bağı' },
  U: { char: 'U', chakra: 3, mahrec: 'throat', mahrecName: 'Dudak / Gırtlak', element: 'Toprak', meaning: 'Derin İrade, Solar Pleksus Dayanıklılığı, Büyüme' },
  Ü: { char: 'Ü', chakra: 3, mahrec: 'throat', mahrecName: 'Dudak / Gırtlak', element: 'Eter', meaning: 'Yüksek İrade, İnce Zevkler ve Çözüm Üretme' },
  V: { char: 'V', chakra: 4, mahrec: 'lip', mahrecName: 'Dudak / Diş', element: 'Su', meaning: 'Vav - Bağlayıcı Kuvvet, Birlik, Aşk ve Şefkat' },
  Y: { char: 'Y', chakra: 7, mahrec: 'palate', mahrecName: 'Damak', element: 'Eter', meaning: 'Köprü Kurucu, Yüksek Vizyon ve Ruhsal Rehberlik' },
  Z: { char: 'Z', chakra: 8, mahrec: 'dental', mahrecName: 'Diş', element: 'Toprak', meaning: 'Zayin - Taç, Büyük Ticari Güç, Adalet ve Kararlılık' },
  // Uluslararası harfler
  Q: { char: 'Q', chakra: 8, mahrec: 'throat', mahrecName: 'Gırtlak', element: 'Toprak', meaning: 'Kozmik Zenginlik, Otorite ve Lüks' },
  W: { char: 'W', chakra: 5, mahrec: 'lip', mahrecName: 'Dudak', element: 'Hava', meaning: 'Global İletişim, Ağ Yayılımı' },
  X: { char: 'X', chakra: 6, mahrec: 'dental', mahrecName: 'Diş', element: 'Eter', meaning: 'Gizemli Vizyon, Yüksek Algı' }
};

export interface SimulationComparison {
  originalFullName: string;
  simulatedFullName: string;
  originalMatrix: number[]; // 1-9 count
  simulatedMatrix: number[];
  originalMissing: number[];
  simulatedMissing: number[];
  newlyFilledChakras: number[];
  stillMissingChakras: number[];
  originalMahrec: Record<MahrecType, number>;
  simulatedMahrec: Record<MahrecType, number>;
  cornerstone: LetterInfo;
  capstone: LetterInfo;
  ouroborosInfo: {
    isClosed: boolean;
    title: string;
    description: string;
  };
  scoreChange: {
    originalScore: number;
    simulatedScore: number;
    difference: number;
  };
}

export interface BrandAnalysisResult {
  brandName: string;
  cleanLetters: string[];
  matrix: number[];
  missingChakras: number[];
  dominantChakras: number[];
  mahrecStats: Record<MahrecType, { count: number; percentage: number }>;
  cornerstone: LetterInfo;
  capstone: LetterInfo;
  ouroboros: {
    isClosed: boolean;
    badge: string;
    description: string;
  };
  industryScores: {
    finance: { score: number; verdict: string; level: 'high' | 'medium' | 'low' };
    creative: { score: number; verdict: string; level: 'high' | 'medium' | 'low' };
    educationSpiritual: { score: number; verdict: string; level: 'high' | 'medium' | 'low' };
    technology: { score: number; verdict: string; level: 'high' | 'medium' | 'low' };
  };
  acousticScore: number;
  strengths: string[];
  recommendations: string[];
}

export interface SuggestedNameItem {
  name: string;
  targetGoal: TargetGoal;
  supportedChakras: number[];
  mahrecType: MahrecType;
  reason: string;
}

// Seçkin, titreşimi yüksek ek isim önerileri kütüphanesi
export const SUGGESTED_NAMES_DATABASE: SuggestedNameItem[] = [
  // 1. BOLLUK & BEREKET & KAZANÇ (2, 3, 4, 8 odaklı - M, B, L, D, Z, H)
  { name: 'Melis', targetGoal: 'wealth', supportedChakras: [4, 5, 3, 9, 1], mahrecType: 'lip', reason: 'Mem (4) mülkü, Lamed (3) bereket akışını, Samekh (1) korumayı sağlar.' },
  { name: 'Burak', targetGoal: 'wealth', supportedChakras: [2, 3, 9, 1], mahrecType: 'lip', reason: 'Bet (2) bereket haznesi açar, Resh (9) ve Kaf (2) ticari zekayı büyütür.' },
  { name: 'Berk', targetGoal: 'wealth', supportedChakras: [2, 5, 9, 2], mahrecType: 'lip', reason: 'Çift 2. çakra ile sağlam ticari ortaklık ve müşteri çekimi yaratır.' },
  { name: 'Banu', targetGoal: 'wealth', supportedChakras: [2, 1, 5, 3], mahrecType: 'lip', reason: 'Bet ve Nun ile kesintisiz bereket akışını ve solar eylem gücünü sağlar.' },
  { name: 'Demir', targetGoal: 'wealth', supportedChakras: [4, 5, 4, 9, 9], mahrecType: 'palate', reason: 'Dalet ve Mem (4. çakra) ile sarsılmaz mülk ve finansal temel kurar.' },
  { name: 'Melisa', targetGoal: 'wealth', supportedChakras: [4, 5, 3, 9, 1], mahrecType: 'lip', reason: 'Mem (4) ile kazancı tutar, L (3) ile ticareti büyütür, A (1) ile görünür kılar.' },
  { name: 'Zeynep', targetGoal: 'wealth', supportedChakras: [8, 5, 7, 5, 5, 7], mahrecType: 'dental', reason: 'Zayin (8) ile büyük finansal güç ve otorite çeker.' },
  { name: 'Baran', targetGoal: 'wealth', supportedChakras: [2, 1, 9, 1, 5], mahrecType: 'lip', reason: 'Bereket (B) ve akış (N) harfleriyle finansal canlılık getirir.' },
  { name: 'Lal', targetGoal: 'wealth', supportedChakras: [3, 1, 3], mahrecType: 'palate', reason: 'Çift Lamed (3) ile Jüpiter büyümesini ve lüks çekim gücünü kilitler.' },
  { name: 'Murat', targetGoal: 'wealth', supportedChakras: [4, 3, 9, 1, 2], mahrecType: 'lip', reason: '4, 3, 9, 1, 2 çakralarını tek başına dolduran tam bir ticari bereket ismidir.' },

  // 2. GÖRÜNÜRLÜK, ŞÖHRET & KARİZMA (1, 5, 9 odaklı - A, E, N, R, S, Ş)
  { name: 'Arya', targetGoal: 'fame', supportedChakras: [1, 9, 7, 1], mahrecType: 'throat', reason: 'Başta ve sonda A (Güneş) ile sahne ışıklarını ve şöhreti çeker.' },
  { name: 'Aras', targetGoal: 'fame', supportedChakras: [1, 9, 1, 1], mahrecType: 'throat', reason: 'Gırtlak ve diş rezonansı ile güçlü liderlik ve durdurulamaz görünürlük verir.' },
  { name: 'Ege', targetGoal: 'fame', supportedChakras: [5, 7, 5], mahrecType: 'throat', reason: 'He (5) ile sesin ve ifadenin kitlelere anında ulaşmasını sağlar.' },
  { name: 'Rana', targetGoal: 'fame', supportedChakras: [9, 1, 5, 1], mahrecType: 'palate', reason: 'Resh (9) yayılımı ve Alef (1) parlaklığı ile karizmayı zirveye taşır.' },
  { name: 'Sera', targetGoal: 'fame', supportedChakras: [1, 5, 9, 1], mahrecType: 'dental', reason: 'S-E-R-A: 1, 5, 9 ve 1 kombinasyonu görünürlük için kusursuz akış oluşturur.' },
  { name: 'Arel', targetGoal: 'fame', supportedChakras: [1, 9, 5, 3], mahrecType: 'throat', reason: 'Güneş kıvılcımı ve hızlı yayılma frekansı ile öne çıkmayı sağlar.' },
  { name: 'Atlas', targetGoal: 'fame', supportedChakras: [1, 2, 3, 1, 1], mahrecType: 'throat', reason: 'Kök ve liderlik enerjisini sarsılmaz bir karizma ile birleştirir.' },
  { name: 'Selin', targetGoal: 'fame', supportedChakras: [1, 5, 3, 9, 5], mahrecType: 'dental', reason: 'Işık saçan (S), akıcı (L, N) ve kitleleri etkileyen ses dengesi sunar.' },

  // 3. AŞK, MANYETİZMA & UYUM (2, 4, 6 odaklı - B, K, T, D, M, V, F, O)
  { name: 'Defne', targetGoal: 'love', supportedChakras: [4, 5, 6, 5, 5], mahrecType: 'palate', reason: 'Kalp (4) ve 3. Göz (6 - F) ile derin çekim, zarafet ve güven verir.' },
  { name: 'Can', targetGoal: 'love', supportedChakras: [3, 1, 5], mahrecType: 'palate', reason: 'Sıcak, kucaklayıcı ve cana yakın manyetizma saçar.' },
  { name: 'Filiz', targetGoal: 'love', supportedChakras: [6, 9, 3, 9, 8], mahrecType: 'lip', reason: 'F (6) ve L (3) ile kalpleri yumuşatan, aşkı yeşerten zarafet taşır.' },
  { name: 'Deniz', targetGoal: 'love', supportedChakras: [4, 5, 5, 9, 8], mahrecType: 'palate', reason: 'D (4) kalıcılığı ve Z (8) çekim aurası ile duygusal derinlik kurar.' },
  { name: 'Oya', targetGoal: 'love', supportedChakras: [6, 7, 1], mahrecType: 'throat', reason: 'O (6) ile sevgi aurası çizer, estetik ve duygusal bağı güçlendirir.' },
  { name: 'Tuna', targetGoal: 'love', supportedChakras: [2, 3, 5, 1], mahrecType: 'palate', reason: 'Tav (2) ile sadakat, bağlanma ve karşılıklı uyumu pekiştirir.' },
  { name: 'Kerem', targetGoal: 'love', supportedChakras: [2, 5, 9, 5, 4], mahrecType: 'palate', reason: 'K (2) ve M (4) ile sevgiyle veren ve karşılığını alan aşk dengesi kurar.' },

  // 4. RUHSAL DERİNLİK, SEZGİ & KORUMA (6, 7, 9 odaklı - G, P, Y, O, Ö, I, İ, R)
  { name: 'Gizem', targetGoal: 'spiritual', supportedChakras: [7, 9, 8, 5, 4], mahrecType: 'palate', reason: 'G (7) ve Z (8) ile okült algıyı, sezgiyi ve içsel bilgeliği açar.' },
  { name: 'Peri', targetGoal: 'spiritual', supportedChakras: [7, 5, 9, 9], mahrecType: 'lip', reason: 'Süptil alemlerle bağlantı ve durugörü frekansını güçlendirir.' },
  { name: 'Ilgaz', targetGoal: 'spiritual', supportedChakras: [9, 3, 7, 1, 8], mahrecType: 'throat', reason: 'I (9) ve G (7) ile yüksek zihin ve tefekkür gücü aşılar.' },
  { name: 'İrem', targetGoal: 'spiritual', supportedChakras: [9, 9, 5, 4], mahrecType: 'palate', reason: 'Çift Yod (9) ile ilahi ilhamı ve yüksek sezgiyi zihne indirir.' },
  { name: 'Yonca', targetGoal: 'spiritual', supportedChakras: [7, 6, 5, 3, 1], mahrecType: 'palate', reason: 'Y (7) ve O (6) ile 3. gözü açar, koruyucu aura oluşturur.' },
  { name: 'Gaye', targetGoal: 'spiritual', supportedChakras: [7, 1, 7, 5], mahrecType: 'palate', reason: 'Çift 7. çakra ile hayat amacını bulma ve ruhsal derinliği yükseltir.' }
];

export class PhoneticChakraEngine {
  /**
   * İsmi temizler ve Türkçe karakterleri doğru formatlar
   */
  public static cleanText(text: string): string {
    return text.toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ]/g, '');
  }

  /**
   * İsmi harf harf analiz eder
   */
  public static getLetterInfos(text: string): LetterInfo[] {
    const cleaned = this.cleanText(text);
    const result: LetterInfo[] = [];

    for (const char of cleaned) {
      if (LETTERS_DB[char]) {
        result.push(LETTERS_DB[char]);
      }
    }
    return result;
  }

  /**
   * 1-9 Çakra Matrisini (Frekans adetlerini) hesaplar
   */
  public static calculateChakraMatrix(letters: LetterInfo[]): number[] {
    const matrix = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const l of letters) {
      if (l.chakra >= 1 && l.chakra <= 9) {
        matrix[l.chakra - 1]++;
      }
    }
    return matrix;
  }

  /**
   * Mahreç dağılımını hesaplar
   */
  public static calculateMahrecDistribution(letters: LetterInfo[]): Record<MahrecType, { count: number; percentage: number }> {
    const counts: Record<MahrecType, number> = {
      throat: 0,
      palate: 0,
      lip: 0,
      dental: 0
    };

    if (letters.length === 0) {
      return {
        throat: { count: 0, percentage: 0 },
        palate: { count: 0, percentage: 0 },
        lip: { count: 0, percentage: 0 },
        dental: { count: 0, percentage: 0 }
      };
    }

    for (const l of letters) {
      counts[l.mahrec]++;
    }

    const total = letters.length;
    return {
      throat: { count: counts.throat, percentage: Math.round((counts.throat / total) * 100) },
      palate: { count: counts.palate, percentage: Math.round((counts.palate / total) * 100) },
      lip: { count: counts.lip, percentage: Math.round((counts.lip / total) * 100) },
      dental: { count: counts.dental, percentage: Math.round((counts.dental / total) * 100) }
    };
  }

  /**
   * Ouroboros (Temel Taşı - Zirve Taşı Döngüsü) Analizi
   */
  public static analyzeOuroboros(firstLetter?: LetterInfo, lastLetter?: LetterInfo) {
    if (!firstLetter || !lastLetter) {
      return {
        isClosed: false,
        title: 'Belirsiz Döngü',
        description: 'İsimde analiz edilecek yeterli harf bulunamadı.'
      };
    }

    // Tam Ouroboros: İlk ve son harf aynı (örn: O...O, A...A, S...S)
    if (firstLetter.char === lastLetter.char) {
      return {
        isClosed: true,
        title: 'Tam Aura Kalkanı (Kutsal Döngü)',
        description: `İsim "${firstLetter.char}" harfiyle başlayıp "${lastLetter.char}" harfiyle bitiyor. Ezoterik olarak kusursuz bir Ouroboros (devridaim) çemberidir. Kazanılan para, bereket ve enerji dışarı kaçmaz, isim çatısı altında sürekli çoğalarak dolaşır.`
      };
    }

    // Mahreç veya Element Uyumlu Kapanış: (Örn: Gırtlak ile başlayıp Dudak ile bitme: Fikri kazanca dönüştürme)
    if (firstLetter.mahrec === 'throat' && lastLetter.mahrec === 'lip') {
      return {
        isClosed: true,
        title: 'Maddeleştirici Bereket Akışı',
        description: `İsim göğüs/gırtlaktan (${firstLetter.char} - Vizyon/Ateş) doğup dudakta (${lastLetter.char} - Mülk/Toprak) kilitleniyor. Soyut fikirleri somut servete ve kazanca dönüştürme kabiliyeti çok yüksektir.`
      };
    }

    if (firstLetter.chakra === lastLetter.chakra) {
      return {
        isClosed: true,
        title: 'Rezonans Çemberi',
        description: `İsmin başı ve sonu aynı çakra (${firstLetter.chakra}. Çakra) frekansıyla birbirine kenetlenmiş. Dengeli ve dış etkilere karşı koruyucu bir aura yayar.`
      };
    }

    return {
      isClosed: false,
      title: 'Açık Kozmik Akış',
      description: `İsim farklı mahreç ve elementlerle başlayıp bitiyor (${firstLetter.char} $\\rightarrow$ ${lastLetter.char}). Bu durum isme dinamizm, sürekli hareket ve dış dünyayla yoğun etkileşim kazandırır.`
    };
  }

  /**
   * Kişisel İsim ve Ek İsim Simülatörü
   */
  public static simulatePersonalName(originalFullName: string, additionalName: string = ''): SimulationComparison {
    const origLetters = this.getLetterInfos(originalFullName);
    const origMatrix = this.calculateChakraMatrix(origLetters);

    const fullCombined = additionalName.trim()
      ? `${originalFullName} ${additionalName}`
      : originalFullName;

    const simLetters = this.getLetterInfos(fullCombined);
    const simMatrix = this.calculateChakraMatrix(simLetters);

    const origMissing: number[] = [];
    origMatrix.forEach((c, idx) => { if (c === 0) origMissing.push(idx + 1); });

    const simMissing: number[] = [];
    simMatrix.forEach((c, idx) => { if (c === 0) simMissing.push(idx + 1); });

    // Yeni kapanan çakralar
    const newlyFilled = origMissing.filter(ch => !simMissing.includes(ch));
    const stillMissing = simMissing;

    // Mahreçler
    const origMahrecCounts: Record<MahrecType, number> = { throat: 0, palate: 0, lip: 0, dental: 0 };
    origLetters.forEach(l => origMahrecCounts[l.mahrec]++);

    const simMahrecCounts: Record<MahrecType, number> = { throat: 0, palate: 0, lip: 0, dental: 0 };
    simLetters.forEach(l => simMahrecCounts[l.mahrec]++);

    const cornerstone = simLetters[0] || LETTERS_DB['A'];
    const capstone = simLetters[simLetters.length - 1] || LETTERS_DB['A'];

    const ouroboros = this.analyzeOuroboros(cornerstone, capstone);

    // Akustik Puanlama (100 üzerinden)
    // 9 çakranın doluluk oranı (her çakra ~9 puan) + mahreç dengesi + ouroboros
    const origFilledCount = 9 - origMissing.length;
    const simFilledCount = 9 - simMissing.length;

    let origScore = Math.round((origFilledCount / 9) * 80) + 10;
    let simScore = Math.round((simFilledCount / 9) * 80) + 10;

    if (ouroboros.isClosed) simScore += 10;
    simScore = Math.min(100, simScore);
    origScore = Math.min(100, origScore);

    return {
      originalFullName,
      simulatedFullName: fullCombined,
      originalMatrix: origMatrix,
      simulatedMatrix: simMatrix,
      originalMissing: origMissing,
      simulatedMissing: simMissing,
      newlyFilledChakras: newlyFilled,
      stillMissingChakras: stillMissing,
      originalMahrec: origMahrecCounts,
      simulatedMahrec: simMahrecCounts,
      cornerstone,
      capstone,
      ouroborosInfo: ouroboros,
      scoreChange: {
        originalScore: origScore,
        simulatedScore: simScore,
        difference: simScore - origScore
      }
    };
  }

  /**
   * Marka / Firma İsmi Rezonans Analizi
   */
  public static analyzeBrand(brandName: string): BrandAnalysisResult {
    const letters = this.getLetterInfos(brandName);
    const cleanChars = letters.map(l => l.char);
    const matrix = this.calculateChakraMatrix(letters);
    const mahrecStats = this.calculateMahrecDistribution(letters);

    const missingChakras: number[] = [];
    const dominantChakras: number[] = [];

    matrix.forEach((count, idx) => {
      const chNum = idx + 1;
      if (count === 0) missingChakras.push(chNum);
      if (count >= 2) dominantChakras.push(chNum);
    });

    const cornerstone = letters[0] || LETTERS_DB['A'];
    const capstone = letters[letters.length - 1] || LETTERS_DB['A'];
    const ouroboros = this.analyzeOuroboros(cornerstone, capstone);

    // Sektörel Skorlama Algoritması:
    // 1. Finans & Ticaret: 2 (Müşteri), 3 (Solar), 4 (Mem - Para/Mülk), 8 (Büyük Para) + Dudak mahreci
    let finScore = 40;
    if (matrix[3] > 0) finScore += 20; // 4. Çakra (Mülk - Mem)
    if (matrix[1] > 0) finScore += 15; // 2. Çakra (Ticari bağ)
    if (matrix[2] > 0) finScore += 15; // 3. Çakra (İrade/Büyüme)
    if (matrix[7] > 0) finScore += 10; // 8. Çakra (Büyük finans)
    if (mahrecStats.lip.percentage >= 20) finScore += 10;
    if (ouroboros.isClosed) finScore += 10;
    finScore = Math.min(100, Math.max(30, finScore));

    // 2. Sanat & Yaratıcılık & Görsel: 2 (Sakral), 6 (3. Göz), 3 (İlham) + Eter/Hava
    let artScore = 35;
    if (matrix[5] > 0) artScore += 25; // 6. Çakra (Görsel estetik)
    if (matrix[1] > 0) artScore += 20; // 2. Çakra (Yaratıcılık)
    if (matrix[2] > 0) artScore += 15; // 3. Çakra (İfade)
    if (matrix[0] > 0) artScore += 10; // 1. Çakra (Özgünlük)
    if (mahrecStats.throat.percentage >= 20) artScore += 10;
    artScore = Math.min(100, Math.max(30, artScore));

    // 3. Eğitim, Akademi & Ruhsal Danışmanlık: 5 (Boğaz - İfade), 7 (Taç - Bilgelik), 9 (Evrensel Bilinç)
    let eduScore = 40;
    if (matrix[4] > 0) eduScore += 20; // 5. Çakra (Öğretme/Boğaz)
    if (matrix[6] > 0) eduScore += 25; // 7. Çakra (Bilgelik/Taç)
    if (matrix[8] > 0) eduScore += 20; // 9. Çakra (Evrensellik)
    if (matrix[3] > 0) eduScore += 10; // 4. Çakra (Kalp bağı)
    eduScore = Math.min(100, Math.max(30, eduScore));

    // 4. Teknoloji & Yazılım & İnovasyon: 1 (Liderlik/Güneş), 5 (Dijital ağ), 7 (Ar-Ge), Damak (Hız/Zeka)
    let techScore = 35;
    if (matrix[0] > 0) techScore += 20; // 1. Çakra (İnovasyon)
    if (matrix[4] > 0) techScore += 20; // 5. Çakra (Network)
    if (matrix[6] > 0) techScore += 20; // 7. Çakra (Kodlama/Analiz)
    if (mahrecStats.palate.percentage >= 30) techScore += 15;
    techScore = Math.min(100, Math.max(30, techScore));

    const getLevel = (s: number): 'high' | 'medium' | 'low' => {
      if (s >= 80) return 'high';
      if (s >= 60) return 'medium';
      return 'low';
    };

    const getVerdict = (s: number, sector: string): string => {
      if (s >= 80) return `Mükemmel Frekans: Bu isim ${sector} alanında son derece güçlü bir çekim ve başarı vaat ediyor.`;
      if (s >= 60) return `Dengeli Frekans: ${sector} alanında verimli çalışır; yan pazarlama stratejileriyle desteklenebilir.`;
      return `Geliştirilebilir: ${sector} odaklı hedeflerde fonetik takviye veya ek slogan desteği faydalı olur.`;
    };

    // Genel Akustik Skoru
    const filledCount = 9 - missingChakras.length;
    let acousticScore = Math.round((filledCount / 9) * 70) + 15;
    if (ouroboros.isClosed) acousticScore += 15;
    acousticScore = Math.min(100, acousticScore);

    // Güçlü yönler
    const strengths: string[] = [];
    if (ouroboros.isClosed) strengths.push('Kutsal Ouroboros Döngüsü: İsmin başında ve sonundaki harf dengesi enerjinin içeride devridaim etmesini sağlıyor.');
    if (matrix[3] > 0) strengths.push('Mem (Mülk/Bereket) Frekansı: İsminizde kalıcı mülk, para ve kazancı kasada tutan 4. çakra titreşimi mevcut.');
    if (matrix[0] > 0) strengths.push('Alef (Öncülük) Işığı: 1. çakra harfleri markaya pazarda ilk sıralarda yer alma ve öncü olma gücü veriyor.');
    if (matrix[5] > 0) strengths.push('Estetik & Vizyon: 6. çakra desteği markaya görsel çekicilik ve modern bir algı katıyor.');
    if (mahrecStats.lip.percentage >= 25) strengths.push('Yüksek Maddeleşme Gücü: Dudak seslerinin yoğunluğu projelerin kârlı sonuçlara dönüşmesini destekler.');

    // Öneriler
    const recommendations: string[] = [];
    if (missingChakras.includes(2)) recommendations.push('2. Çakra (Sakral) eksik: Müşterilerle sıcak duygusal bağ kurmak için marka kimliğinde samimi ve davetkâr bir dil benimseyin.');
    if (missingChakras.includes(3)) recommendations.push('3. Çakra (Solar Pleksus) eksik: Satış ve ticari eylem aşamalarında net CTA (eylem çağrısı) ve kararlı kampanyalar yürütün.');
    if (missingChakras.includes(4)) recommendations.push('4. Çakra (Kalp) eksik: Marka isminde M veya D gibi topraklayıcı harf bulunmuyor; güven ve garanti vurgusunu öne çıkarın.');
    if (!ouroboros.isClosed) recommendations.push('Açık Akış: Marka logosunda çember, daire veya koruyucu bir çerçeve sembolü kullanarak enerjiyi mühürleyebilirsiniz.');

    return {
      brandName,
      cleanLetters: cleanChars,
      matrix,
      missingChakras,
      dominantChakras,
      mahrecStats,
      cornerstone,
      capstone,
      ouroboros: {
        isClosed: ouroboros.isClosed,
        badge: ouroboros.title,
        description: ouroboros.description
      },
      industryScores: {
        finance: { score: finScore, verdict: getVerdict(finScore, 'Finans ve E-Ticaret'), level: getLevel(finScore) },
        creative: { score: artScore, verdict: getVerdict(artScore, 'Sanat, Tasarım ve Görsel'), level: getLevel(artScore) },
        educationSpiritual: { score: eduScore, verdict: getVerdict(eduScore, 'Eğitim, Akademi ve Bilgelik'), level: getLevel(eduScore) },
        technology: { score: techScore, verdict: getVerdict(techScore, 'Teknoloji ve İnovasyon'), level: getLevel(techScore) }
      },
      acousticScore,
      strengths,
      recommendations
    };
  }

  /**
   * Eksik çakralara ve hedefe göre akıllı ek isim önerilerini filtreler
   */
  public static getRecommendedNamesForMissingChakras(missingChakras: number[], goal?: TargetGoal): SuggestedNameItem[] {
    let pool = SUGGESTED_NAMES_DATABASE;

    if (goal) {
      pool = pool.filter(item => item.targetGoal === goal);
    }

    // Eksik çakralardan en az birini dolduran isimleri öne al ve skorla
    const scored = pool.map(item => {
      const intersection = item.supportedChakras.filter(ch => missingChakras.includes(ch));
      return {
        item,
        score: intersection.length
      };
    });

    // Skora göre sırala (en çok eksiği kapatan en üstte)
    scored.sort((a, b) => b.score - a.score);

    return scored.map(s => s.item);
  }
}
