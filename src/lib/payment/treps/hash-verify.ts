// ─── Treps 3D Secure Hash Verification ──────────────────────
// Return URL'e POST edilen parametrelerin hash doğrulaması
// Algoritma: SHA-512 → Base64

import { createHash } from "crypto";

/**
 * Treps 3D Secure return hash'ini doğrular.
 *
 * Adımlar:
 * 1. String tipindeki parametreleri al (hariç: hash, encoding, countdown)
 *    NOT: payment_status number tipi olduğu için otomatik dahil edilmez
 * 2. Key adına göre alfabetik sırala (küçük harf, en-US locale)
 * 3. Özel karakterleri escape et: \ → \\ ve | → \|
 * 4. Değerleri | ile birleştir, sonuna escape edilmiş secret key ekle
 * 5. SHA-512 → Base64
 */

const EXCLUDED_KEYS = new Set(["hash", "encoding", "countdown"]);

function escapeValue(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

/**
 * Treps'ten dönen parametrelere bakarak, elde bulunan 3D Güvenlik Anahtarı (Secret Key)
 * ile sunucu tarafında olması gereken gerçek hash değerini hesaplar.
 *
 * İşlem Algoritması:
 * - Parametreler sözlük/alfabetik sıraya göre dizilir. Sadece stringler.
 * - Kaçış (escape) gerektiren karakterler için işlem uygulanır (Pipe, Backslash vb).
 * - Birleştirilip sonuna secretKey eklenerek SHA-512 Base64 oluşturulur.
 *
 * @param params - Treps dönüşünden elde edilen payload parametreleri objesi
 * @param secretKey - Tenant/Merchant'ın Treps sistemine ait 3D gizli anahtarı
 * @returns SHA512 algoritmasıyla hesaplanan Base64 formundaki Hash değeri
 */
export function computeTrepsHash(
  params: Record<string, unknown>,
  secretKey: string
): string {
  // 1. Sadece string değerleri al, hariç tutulanları çıkar
  const stringEntries: [string, string][] = [];
  for (const [key, value] of Object.entries(params)) {
    if (EXCLUDED_KEYS.has(key)) continue;
    if (typeof value !== "string") continue;
    stringEntries.push([key, value]);
  }

  // 2. Key'e göre alfabetik sırala (küçük harf, en-US locale)
  stringEntries.sort((a, b) =>
    a[0].toLowerCase().localeCompare(b[0].toLowerCase(), "en-US")
  );

  // 3-4. Değerleri escape et ve | ile birleştir, sonuna secret key ekle
  const escapedValues = stringEntries.map(([, val]) => escapeValue(val));
  const escapedSecret = escapeValue(secretKey);
  const input = [...escapedValues, escapedSecret].join("|");

  // 5. SHA-512 → Base64
  return createHash("sha512").update(input, "utf-8").digest("base64");
}

/**
 * Gateway tarafından iletilen mevcut (received) hash değerini, kendi sunucumuzda
 * hesaplanan (computed) hash ile karşılaştırarak paketin sahte olup olmadığını teyit eder.
 *
 * @param params - Treps tarafından iletilen Request Payload / Return URL query set'i
 * @param secretKey - DB'de kayıtlı (veya ENV'deki) 3D güvenlik şifresi
 * @returns İşlem sonucu geçerlilik (valid: true/false), ve her iki hesaplanan hash değerleri
 */
export function verifyTrepsHash(
  params: Record<string, unknown>,
  secretKey: string
): { valid: boolean; computed: string; received: string } {
  const received = (params.hash as string) || "";
  const computed = computeTrepsHash(params, secretKey);

  return {
    valid: computed === received,
    computed,
    received,
  };
}

/** 3D Secure return parametreleri — type-safe interface */
export interface Treps3DReturnParams {
  threeD_status: string;         // SUCCESS | FAIL
  oid: string;                   // Sipariş ID
  payment_id: string;            // Gateway ödeme ID
  transaction_id: string;        // Gateway işlem ID
  external_order_id: string;     // Bizim order ID'miz
  external_transaction_id: string;
  complete_required: string;     // YES | NO
  payment_status: number;        // Ödeme durum kodu
  threeD_secure_type: string;    // FULL | HALF | CANCEL | NONE
  return_url: string;
  hash: string;
  duplicate_request?: string;    // YES | NO
}

/**
 * Gelen HTTP Request objesinin gövdesini (FormData/x-www-form-urlencoded),
 * 3D return parametresi tipine güvenli olarak ayrıştırıp dönüştürür.
 *
 * @param formData - Next.js Request vasıtasıyla iletilen FormData
 * @returns Tamamlanmış/Ayıklanmış Treps 3D Dönüş Parametreleri arayüzü
 */
export function parse3DReturnParams(formData: FormData): Treps3DReturnParams {
  return {
    threeD_status: (formData.get("threeD_status") as string) || "",
    oid: (formData.get("oid") as string) || "",
    payment_id: (formData.get("payment_id") as string) || "",
    transaction_id: (formData.get("transaction_id") as string) || "",
    external_order_id: (formData.get("external_order_id") as string) || "",
    external_transaction_id: (formData.get("external_transaction_id") as string) || "",
    complete_required: (formData.get("complete_required") as string) || "NO",
    payment_status: Number(formData.get("payment_status")) || 0,
    threeD_secure_type: (formData.get("threeD_secure_type") as string) || "",
    return_url: (formData.get("return_url") as string) || "",
    hash: (formData.get("hash") as string) || "",
    duplicate_request: (formData.get("duplicate_request") as string) || undefined,
  };
}

/**
 * GET isteğiyle yönlendirilen (Return URL üzerinden) search query
 * parametrelerini 3D return parametresine dönüştürür.
 *
 * @param params - Web/Tarayıcının yolladığı URL query-string objesi
 * @returns Ayrıştırılmış Treps Dönüş Parametreleri arayüzü
 */
export function parse3DReturnFromURLParams(params: URLSearchParams): Treps3DReturnParams {
  return {
    threeD_status: params.get("threeD_status") || "",
    oid: params.get("oid") || "",
    payment_id: params.get("payment_id") || "",
    transaction_id: params.get("transaction_id") || "",
    external_order_id: params.get("external_order_id") || "",
    external_transaction_id: params.get("external_transaction_id") || "",
    complete_required: params.get("complete_required") || "NO",
    payment_status: Number(params.get("payment_status")) || 0,
    threeD_secure_type: params.get("threeD_secure_type") || "",
    return_url: params.get("return_url") || "",
    hash: params.get("hash") || "",
    duplicate_request: params.get("duplicate_request") || undefined,
  };
}
