import {
  birthDataSchema,
  guestCheckoutSchema,
  billingProfileSchema,
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  numerologyInputSchema,
  formatZodError
} from '../lib/validation';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, errorDetail?: any) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  ❌ [FAIL] ${testName}`, errorDetail || '');
  }
}

console.log('====================================================');
console.log('  7LAYERS ZOD KAPSAMLI DOĞRULAMA (VALIDATION) TESTİ ');
console.log('====================================================\n');

// ── 1. Doğum & Konum Verisi Testleri ──────────────────────────────────────
console.log('--- 1. DOĞUM VE KONUM VERİSİ TESTLERİ ---');

const validBirthData = {
  date: '1995-06-15',
  time: '14:30',
  city: {
    name: 'İstanbul',
    lat: 41.0082,
    lon: 28.9784,
    tz: 'Europe/Istanbul',
    country: 'Türkiye'
  }
};

assert(birthDataSchema.safeParse(validBirthData).success, 'Geçerli doğum verisi kabul edilmeli');

// Gelecek tarih testi
const futureDateData = { ...validBirthData, date: '2099-01-01' };
const resFuture = birthDataSchema.safeParse(futureDateData);
assert(!resFuture.success, 'Gelecek tarih engellenmeli');
if (!resFuture.success) {
  assert(formatZodError(resFuture.error).includes('gelecek tarih olamaz'), 'Gelecek tarih Türkçe uyarı vermeli');
}

// 1900 öncesi eski tarih testi
const ancientDateData = { ...validBirthData, date: '1850-01-01' };
assert(!birthDataSchema.safeParse(ancientDateData).success, '1900 öncesi tarih engellenmeli');

// Takvimde olmayan tarih (örn. 31 Şubat)
const invalidCalDate = { ...validBirthData, date: '2024-02-31' };
assert(!birthDataSchema.safeParse(invalidCalDate).success, 'Takvimde olmayan tarih (31 Şubat) engellenmeli');

// 25:00 veya 14:65 gibi geçersiz saatler
const invalidHour = { ...validBirthData, time: '25:00' };
assert(!birthDataSchema.safeParse(invalidHour).success, '25:00 saati engellenmeli');

const invalidMinute = { ...validBirthData, time: '14:75' };
assert(!birthDataSchema.safeParse(invalidMinute).success, 'Geçersiz dakika (14:75) engellenmeli');

// Geçersiz koordinatlar
const invalidLat = { ...validBirthData, city: { ...validBirthData.city, lat: 95 } };
assert(!birthDataSchema.safeParse(invalidLat).success, 'Geçersiz enlem (lat: 95) engellenmeli');

const invalidLon = { ...validBirthData, city: { ...validBirthData.city, lon: -195 } };
assert(!birthDataSchema.safeParse(invalidLon).success, 'Geçersiz boylam (lon: -195) engellenmeli');

// ── 2. Misafir Satın Alma (Guest Checkout) Testleri ───────────────────────
console.log('\n--- 2. GUEST CHECKOUT TESTLERİ ---');

const validCheckout = {
  email: 'yolcu@7layers.tr',
  date: '1992-04-20',
  time: '09:15',
  city: validBirthData.city,
  analysisType: 'astrology',
  selectedProfileId: 'prof_123',
  agreedTerms: true
};

assert(guestCheckoutSchema.safeParse(validCheckout).success, 'Geçerli sipariş kabul edilmeli');

// Geçersiz e-posta
const invalidEmailCheckout = { ...validCheckout, email: 'gecersiz-eposta' };
const resBadEmail = guestCheckoutSchema.safeParse(invalidEmailCheckout);
assert(!resBadEmail.success, 'Geçersiz e-posta engellenmeli');
if (!resBadEmail.success) {
  assert(formatZodError(resBadEmail.error).includes('geçerli bir e-posta'), 'E-posta format hatası mesajı dönmeli');
}

// Sözleşme onayı verilmemiş
const unagreedCheckout = { ...validCheckout, agreedTerms: false };
const resUnagreed = guestCheckoutSchema.safeParse(unagreedCheckout);
assert(!resUnagreed.success, 'Sözleşme onayı verilmeden sipariş engellenmeli');

// Fatura profili seçilmemiş
const noProfileCheckout = { ...validCheckout, selectedProfileId: '' };
assert(!guestCheckoutSchema.safeParse(noProfileCheckout).success, 'Fatura profili seçilmeden sipariş engellenmeli');

// ── 3. Fatura Profili Testleri (Bireysel & Kurumsal) ──────────────────────
console.log('\n--- 3. FATURA PROFİLİ TESTLERİ ---');

// Bireysel geçerli profil
const validIndProfile = {
  label: 'Kişisel Fatura',
  type: 'individual' as const,
  title: 'Can Yıldız',
  taxNumber: '10000000146', // Algoritmaya uygun geçerli TCKN örneği
  address: 'Bağdat Caddesi No: 42 D: 5',
  city: 'İstanbul',
  district: 'Kadıköy'
};
assert(billingProfileSchema.safeParse(validIndProfile).success, 'Geçerli bireysel profil kabul edilmeli');

// Bireysel tek kelimelik isim (Soyadı yok)
const singleWordInd = { ...validIndProfile, title: 'YalnızAhmet' };
const resSingleWord = billingProfileSchema.safeParse(singleWordInd);
assert(!resSingleWord.success, 'Soyadı olmayan tek kelimelik isim engellenmeli');
if (!resSingleWord.success) {
  assert(formatZodError(resSingleWord.error).includes('ad ve soyadınızı eksiksiz'), 'Ad soyad uyarısı dönmeli');
}

// Hatalı TCKN
const badTcknProfile = { ...validIndProfile, taxNumber: '12345678901' };
const resBadTckn = billingProfileSchema.safeParse(badTcknProfile);
assert(!resBadTckn.success, 'Algoritması bozuk TCKN engellenmeli');

// Kurumsal geçerli profil
const validCompanyProfile = {
  label: 'Şirket Faturası',
  type: 'company' as const,
  title: '7Layers Yazılım ve Danışmanlık A.Ş.',
  taxNumber: '4840847211', // Algoritmaya uygun 10 haneli VKN örneği
  taxOffice: 'Beşiktaş',
  address: 'Levent Mah. Büyükdere Cad. No: 100',
  city: 'İstanbul',
  district: 'Beşiktaş'
};
assert(billingProfileSchema.safeParse(validCompanyProfile).success, 'Geçerli kurumsal profil kabul edilmeli');

// Kurumsal vergi dairesi eksik
const missingTaxOffice = { ...validCompanyProfile, taxOffice: '' };
const resNoOffice = billingProfileSchema.safeParse(missingTaxOffice);
assert(!resNoOffice.success, 'Kurumsal profilde vergi dairesi yoksa engellenmeli');

// Kurumsal geçersiz VKN
const badVknCompany = { ...validCompanyProfile, taxNumber: '12345' };
assert(!billingProfileSchema.safeParse(badVknCompany).success, '10 haneli olmayan VKN engellenmeli');

// Çok kısa adres (< 5 karakter)
const shortAddress = { ...validIndProfile, address: 'Ev' };
assert(!billingProfileSchema.safeParse(shortAddress).success, '5 karakterden kısa adres engellenmeli');

// ── 4. Kimlik Doğrulama / Auth Testleri ────────────────────────────────────
console.log('\n--- 4. AUTH TESTLERİ ---');

// Giriş
assert(loginSchema.safeParse({ email: 'ali@example.com', password: 'password123' }).success, 'Geçerli giriş bilgisi kabul edilmeli');
assert(!loginSchema.safeParse({ email: 'ali@example.com', password: '123' }).success, '6 karakterden kısa şifre engellenmeli');

// Kayıt
assert(registerSchema.safeParse({ fullName: 'Baha Akın', email: 'baha@example.com', password: 'secretpassword' }).success, 'Geçerli kayıt bilgisi kabul edilmeli');
assert(!registerSchema.safeParse({ fullName: '', email: 'not-an-email', password: '123' }).success, 'Geçersiz kayıt engellenmeli');

// E-posta OTP doğrulama
assert(verifyEmailSchema.safeParse({ email: 'user@test.com', code: '849201' }).success, '6 haneli sayısal OTP kodu kabul edilmeli');
assert(!verifyEmailSchema.safeParse({ email: 'user@test.com', code: 'ABC12' }).success, 'Harf içeren veya 5 haneli OTP kodu engellenmeli');

// ── 5. Numeroloji Giriş Testleri ──────────────────────────────────────────
console.log('\n--- 5. NUMEROLOJİ GİRİŞ TESTLERİ ---');

assert(numerologyInputSchema.safeParse({ fullName: 'Mustafa Kemal', birthDate: '1981-05-19' }).success, 'Geçerli isim ve tarih kabul edilmeli');
assert(numerologyInputSchema.safeParse({ fullName: 'Şeyma Çağlar Özkan', birthDate: '1990-08-12' }).success, 'Türkçe karakterli isim kabul edilmeli');

// Rakam içeren isim
const numberName = { fullName: 'Ali123 Yılmaz', birthDate: '1990-08-12' };
const resNumberName = numerologyInputSchema.safeParse(numberName);
assert(!resNumberName.success, 'Rakam içeren isim engellenmeli');

// Noktalama veya özel sembol içeren isim
const symbolName = { fullName: 'Mehmet @ Demir!', birthDate: '1990-08-12' };
assert(!numerologyInputSchema.safeParse(symbolName).success, 'Özel karakter içeren isim engellenmeli');

// ── ÖZET RAPOR ────────────────────────────────────────────────────────────
console.log('\n====================================================');
console.log(`TEST SONUCU: ${passedCount} Başarılı, ${failedCount} Hatalı`);
console.log('====================================================');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 Bütün Zod doğrulama kuralları eksiksiz ve başarıyla geçti!');
}
