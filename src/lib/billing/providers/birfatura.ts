import 'server-only';

/**
 * BirFatura / eDönüştür e-Belge V2 istemcisi.
 *
 * Docs: https://app.swaggerhub.com/apis-docs/birfatura/ebelgeV2/1.0.0
 *
 * Fatura gönderimi UBL-TR XML'inin zip'lenip base64 olarak iletilmesiyle yapılır
 * (`SendDocument`). Sağlayıcının JSON model ucu güvenilir çalışmadığı için
 * kullanılmaz.
 */

const BASE_URL = 'https://uygulama.edonustur.com/api/outEBelgeV2';
const TEST_URL = 'https://test1.birfatura.com/api/outEBelgeV2';

export interface BirFaturaKeys {
  apiKey: string;
  secretKey: string;
  integrationKey: string;
  testMode?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ApiEnvelope<T = unknown> {
  Success?: boolean;
  Message?: string;
  message?: string;
  Result?: T;
}

async function callApi<T = unknown>(
  keys: BirFaturaKeys,
  endpoint: string,
  body?: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const base = keys.testMode ? TEST_URL : BASE_URL;
  try {
    const res = await fetch(`${base}/${endpoint}`, {
      method: 'POST',
      headers: {
        'X-Api-Key': keys.apiKey,
        'X-Secret-Key': keys.secretKey,
        'X-Integration-Key': keys.integrationKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      // JSON değilse ham metni döndürürüz
    }

    if (!res.ok) {
      const env = parsed && typeof parsed === 'object' ? (parsed as ApiEnvelope<T>) : null;
      const msg = env?.Message || env?.message || text.slice(0, 300);
      return { success: false, error: `HTTP ${res.status}: ${msg}` };
    }

    // Sağlayıcı HTTP 200 dönüp gövdede Success:false gönderebilir.
    if (parsed && typeof parsed === 'object' && 'Success' in parsed) {
      const env = parsed as ApiEnvelope<T>;
      if (env.Success === false) {
        return {
          success: false,
          error: env.Message || env.message || 'E-Belge entegratör hatası',
          data: parsed as T,
        };
      }
      return { success: true, data: (env.Result ?? parsed) as T };
    }

    return { success: true, data: (parsed ?? text) as T };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Bilinmeyen hata' };
  }
}

// ─── Bağımlılıksız zip (tek dosya, sıkıştırmasız) ────────────

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** UBL XML'ini entegratörün beklediği zip paketine sarar. */
function createZipBuffer(filename: string, content: string): Buffer {
  const filenameBuf = Buffer.from(filename);
  const contentBuf = Buffer.from(content, 'utf8');
  const crc = crc32(contentBuf);

  // Local file header (30 + dosya adı)
  const lh = Buffer.alloc(30 + filenameBuf.length);
  lh.writeUInt32LE(0x04034b50, 0);
  lh.writeUInt16LE(20, 4);
  lh.writeUInt16LE(0, 6);
  lh.writeUInt16LE(0, 8); // stored (sıkıştırmasız)
  lh.writeUInt16LE(0, 10);
  lh.writeUInt16LE(0, 12);
  lh.writeUInt32LE(crc, 14);
  lh.writeUInt32LE(contentBuf.length, 18);
  lh.writeUInt32LE(contentBuf.length, 22);
  lh.writeUInt16LE(filenameBuf.length, 26);
  lh.writeUInt16LE(0, 28);
  filenameBuf.copy(lh, 30);

  const cdOffset = lh.length + contentBuf.length;

  // Central directory (46 + dosya adı)
  const cd = Buffer.alloc(46 + filenameBuf.length);
  cd.writeUInt32LE(0x02014b50, 0);
  cd.writeUInt16LE(20, 4);
  cd.writeUInt16LE(20, 6);
  cd.writeUInt16LE(0, 8);
  cd.writeUInt16LE(0, 10);
  cd.writeUInt16LE(0, 12);
  cd.writeUInt16LE(0, 14);
  cd.writeUInt32LE(crc, 16);
  cd.writeUInt32LE(contentBuf.length, 20);
  cd.writeUInt32LE(contentBuf.length, 24);
  cd.writeUInt16LE(filenameBuf.length, 28);
  cd.writeUInt16LE(0, 30);
  cd.writeUInt16LE(0, 32);
  cd.writeUInt16LE(0, 34);
  cd.writeUInt16LE(0, 36);
  cd.writeUInt32LE(0, 38);
  cd.writeUInt32LE(0, 42);
  filenameBuf.copy(cd, 46);

  // End of central directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([lh, contentBuf, cd, eocd]);
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Alıcının e-Fatura mükellefi olup olmadığını sorgular.
 * Mükellefse e-Fatura, değilse e-Arşiv kesilmelidir.
 */
export async function checkEFaturaMukellef(
  keys: BirFaturaKeys,
  taxNo: string,
): Promise<{ isMukellef: boolean; receiverTag?: string }> {
  const res = await callApi<{ receiverTag?: string; identifier?: string; alias?: string }>(
    keys,
    'GetUserPK',
    { kn: taxNo },
  );
  if (res.success && res.data) {
    const tag = res.data.receiverTag || res.data.alias || res.data.identifier;
    if (tag) return { isMukellef: true, receiverTag: String(tag) };
  }
  return { isMukellef: false };
}

/** UBL XML olarak e-Belge gönderir. */
export async function sendDocumentXML(
  keys: BirFaturaKeys,
  ublXml: string,
  uuid: string,
  systemType: 'EFATURA' | 'EARSIV' = 'EARSIV',
  receiverTag?: string,
): Promise<ApiResponse<{ UUID?: string; DocumentNo?: string; PdfLink?: string }>> {
  const zip = createZipBuffer(`${uuid}.xml`, ublXml);
  return callApi(keys, 'SendDocument', {
    receiverTag: systemType === 'EFATURA' ? receiverTag || '' : '',
    documentBytes: zip.toString('base64'),
    isDocumentNoAuto: true,
    systemTypeCodes: systemType,
  });
}

/** Kesilmiş belgelerin PDF bağlantılarını getirir. */
export async function getPDFLinks(
  keys: BirFaturaKeys,
  uuids: string[],
  systemType: 'EFATURA' | 'EARSIV' = 'EARSIV',
): Promise<ApiResponse> {
  return callApi(keys, 'GetPDFLinkByUUID', { uuids, systemType });
}

/**
 * Kalan kontör sayısını sorgular. Anahtarların geçerliliğini doğrulamak için
 * en ucuz uç olduğundan bağlantı testinde de kullanılır.
 */
export async function getCredits(keys: BirFaturaKeys): Promise<ApiResponse<number>> {
  return callApi<number>(keys, 'GetNumberOfCredits');
}

/** Admin panelindeki "Bağlantıyı Test Et" için. */
export async function testConnection(
  keys: BirFaturaKeys,
): Promise<{ success: boolean; message: string }> {
  const res = await getCredits(keys);
  if (res.success) {
    const credits = typeof res.data === 'number' ? res.data : null;
    return {
      success: true,
      message: credits === null ? 'Bağlantı başarılı' : `Bağlantı başarılı — kalan kontör: ${credits}`,
    };
  }
  return { success: false, message: res.error || 'Entegratöre bağlanılamadı' };
}
