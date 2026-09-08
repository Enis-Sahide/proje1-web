/**
 * Treps POS Hata Kodları — Kullanıcı dostu mesaj çevirisi
 * Kaynak: payment/all_error_codes_all.json
 */

// BNK: Banka kaynaklı hatalar, INT: Treps dahili hatalar
const ERROR_MAP: Record<string, string> = {
  BNK001: "İşleminiz için manuel onay gerekiyor. Lütfen bankanızla iletişime geçiniz.",
  BNK004: "Kartınızla ilgili bir sorun tespit edildi. Lütfen bankanızla iletişime geçiniz.",
  BNK005: "İşleminiz gerçekleştirilemedi. Kart bilgilerinizi kontrol ediniz.",
  BNK013: "Geçersiz tutar bilgisi girildi. Lütfen tutarı kontrol ediniz.",
  BNK014: "Geçersiz kart numarası girildi. Lütfen bilgilerinizi kontrol ediniz.",
  BNK016: "Hesabınızda yeterli bakiye bulunmamaktadır.",
  BNK018: "Kartınız kullanıma kapalı. Lütfen bankanızla iletişime geçiniz.",
  BNK022: "Bu sektör için taksitli işlem yapılamaz.",
  BNK033: "Kartınızın geçerlilik süresi dolmuş.",
  BNK034: "Güvenlik nedeniyle işleminiz gerçekleştirilemedi.",
  BNK036: "Kartınız kısıtlanmış. Lütfen bankanızla iletişime geçiniz.",
  BNK041: "Kartınız kayıp olarak bildirilmiş.",
  BNK043: "Kartınız çalıntı olarak bildirilmiş.",
  BNK047: "Seçilen taksit değeri desteklenmiyor.",
  BNK051: "Kart limitiniz yetersiz. Farklı bir kart deneyiniz.",
  BNK054: "Kartın kullanım süresi geçmiş.",
  BNK061: "İşlem tutarı izin verilen sınırı aştı.",
  BNK065: "İşlem sınırınız aşıldı.",
  BNK068: "İşlem zaman aşımına uğradı. Tekrar deneyiniz.",
  BNK069: "Kartınız internet alışverişine kapalı. Lütfen bankanızla iletişime geçiniz.",
  BNK082: "Geçersiz veya hatalı CVV kodu girildi.",
  BNK084: "Geçersiz veya hatalı CVV kodu girildi.",
  BNK090: "Sistem güncellemesi yapılıyor. Daha sonra tekrar deneyiniz.",
  BNK091: "Sanal POS şu anda işlem gerçekleştiremiyor. Daha sonra tekrar deneyiniz.",
  BNK092: "İşlem zaman aşımına uğradı. Tekrar deneyiniz.",
  BNK093: "Kartınız e-ticaret işlemlere kapalı. Lütfen bankanızla iletişime geçiniz.",
  BNK094: "Aynı işlem birden fazla kez yapıldı.",
  BNK099: "İşleminiz gerçekleştirilemedi. Tekrar deneyiniz.",
  INT001: "İşlem bilgileri eksik veya geçersiz.",
  INT003: "Banka ile bağlantı hatası. Daha sonra tekrar deneyiniz.",
  INT004: "Banka yanıt vermedi. İşlem zaman aşımına uğradı.",
  INT007: "3D Secure doğrulaması başarısız oldu.",
  INT014: "Beklenmeyen bir hata oluştu. Daha sonra tekrar deneyiniz.",
  INT015: "Geçici bir sistem hatası oluştu. Daha sonra tekrar deneyiniz.",
};

// Hata kategorileri
type ErrorCategory = "card_issue" | "limit" | "security" | "system" | "input" | "unknown";

const CATEGORY_MAP: Record<string, ErrorCategory> = {
  BNK004: "card_issue", BNK005: "card_issue", BNK009: "card_issue",
  BNK014: "input", BNK023: "input", BNK080: "input", BNK082: "input", BNK084: "input",
  BNK013: "input", BNK020: "input",
  BNK016: "limit", BNK051: "limit", BNK061: "limit", BNK065: "limit", BNK073: "limit",
  BNK034: "security", BNK041: "security", BNK043: "security", BNK044: "security",
  BNK059: "security", BNK063: "security", BNK069: "security", BNK093: "security",
  BNK018: "card_issue", BNK033: "card_issue", BNK036: "card_issue", BNK037: "card_issue",
  BNK054: "card_issue", BNK062: "card_issue",
  BNK068: "system", BNK090: "system", BNK091: "system", BNK092: "system",
  INT003: "system", INT004: "system", INT007: "system", INT014: "system", INT015: "system",
};

/**
 * Treps API'sinden gelen `payment_status_code` değerine karşılık gelen
 * Türkçe, kullanıcı dostu hata açıklamalarını döndürür.
 *
 * @param code - Treps Hata Kodu numarası (örn: BNK016, INT003 vb.)
 * @returns Kullanıcı dostu onay veya ret içeren hata mesajı
 */
export function getTrepsErrorMessage(code: string | null | undefined): string {
  if (!code) return "Ödeme işlemi sırasında bir hata oluştu.";
  return ERROR_MAP[code] || `Ödeme hatası (${code}). Lütfen tekrar deneyiniz.`;
}

/**
 * Hata kodunun kategorisini döner. Geri dönen değere göre UI üzerinde
 * farklı ikonlar veya uyarı renkleri (sarı/kırmızı) gösterilmesi hedeflenebilir.
 *
 * @param code - Treps Hata Kodu
 * @returns Önceden tanımlanmış hata tipi veya standart 'unknown' tipi
 */
export function getTrepsErrorCategory(code: string | null | undefined): ErrorCategory {
  if (!code) return "unknown";
  return CATEGORY_MAP[code] || "unknown";
}

/**
 * Alınan hatanın yeniden deneme (retry) ile düzelebilme potansiyelini döner.
 * Limit aşımı gibi durumlarda denenemez (false), sistem kesintilerinde denenebilir (true).
 *
 * @param code - Treps Hata Kodu
 * @returns Sistemsel ve belirsiz geçici hatalar için true
 */
export function isTrepsErrorRetryable(code: string | null | undefined): boolean {
  if (!code) return true;
  const category = getTrepsErrorCategory(code);
  // Sistem hataları ve bilinmeyen hatalar yeniden denenebilir
  // Kart sorunları, limit ve güvenlik hataları denenmeye değmez
  return category === "system" || category === "unknown";
}
