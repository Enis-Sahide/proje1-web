import 'server-only';
import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  invoiceCounters,
  invoiceItems,
  invoiceSettings,
  invoices,
  posTransactions,
  reportProducts,
} from '@/db/schema';
import { buildUBLInvoice } from './ubl-builder';
import {
  checkEFaturaMukellef,
  sendDocumentXML,
  type BirFaturaKeys,
} from './providers/birfatura';

export const MASKED = '••••••••';

export type InvoiceSettingsRow = typeof invoiceSettings.$inferSelect;

export async function getInvoiceSettings(): Promise<InvoiceSettingsRow | null> {
  const [row] = await db
    .select()
    .from(invoiceSettings)
    .where(eq(invoiceSettings.provider, 'birfatura'));
  return row ?? null;
}

/** Admin paneline gizli anahtarları maskeleyerek döner. */
export function maskInvoiceSettings(row: InvoiceSettingsRow | null) {
  if (!row) return null;
  return {
    ...row,
    apiKey: row.apiKey ? MASKED : '',
    secretKey: row.secretKey ? MASKED : '',
    integrationKey: row.integrationKey ? MASKED : '',
  };
}

function hasProviderKeys(s: InvoiceSettingsRow | null): s is InvoiceSettingsRow {
  return Boolean(s?.isActive && s.apiKey && s.secretKey && s.integrationKey);
}

function keysFrom(s: InvoiceSettingsRow): BirFaturaKeys {
  return {
    apiKey: s.apiKey!,
    secretKey: s.secretKey!,
    integrationKey: s.integrationKey!,
    testMode: s.testMode,
  };
}

/**
 * Seri ve yıl bazlı bir sonraki fatura numarasını atomik olarak üretir.
 * Format: `EAR2026000001`.
 */
async function nextInvoiceNumber(series: string): Promise<string> {
  const year = new Date().getFullYear();
  const id = `${series}-${year}`;

  const [row] = await db
    .insert(invoiceCounters)
    .values({ id, series, year, lastNumber: 1 })
    .onConflictDoUpdate({
      target: invoiceCounters.id,
      set: { lastNumber: sql`${invoiceCounters.lastNumber} + 1` },
    })
    .returning({ lastNumber: invoiceCounters.lastNumber });

  return `${series}${year}${String(row.lastNumber).padStart(6, '0')}`;
}

/** KDV dahil tutardan matrah ve vergi tutarını ayırır. */
export function splitTax(grossAmount: number, taxRate: number) {
  const subtotal = grossAmount / (1 + taxRate / 100);
  const taxAmount = grossAmount - subtotal;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(grossAmount.toFixed(2)),
  };
}

/**
 * Tamamlanmış bir POS işlemi için fatura oluşturur ve — entegratör anahtarları
 * girilmişse — e-Arşiv/e-Fatura olarak gönderir.
 *
 * Anahtarlar yoksa fatura yalnızca dahili olarak `draft` kaydedilir; anahtarlar
 * sonradan girildiğinde admin panelinden yeniden gönderilebilir. Ödeme akışını
 * hiçbir koşulda bloke etmez.
 *
 * @param posTransactionId - `pos_transactions.id`
 * @returns Oluşturulan faturanın id'si (mükerrer çağrıda mevcut fatura)
 */
export async function issueInvoiceForTransaction(
  posTransactionId: string,
): Promise<{ invoiceId: string | null; status: string; error?: string }> {
  const [tx] = await db
    .select()
    .from(posTransactions)
    .where(eq(posTransactions.id, posTransactionId));

  if (!tx) return { invoiceId: null, status: 'error', error: 'İşlem bulunamadı' };
  if (tx.status !== 'completed') {
    return { invoiceId: null, status: 'skipped', error: 'İşlem tamamlanmamış' };
  }

  // Aynı işlem için ikinci fatura kesme.
  const [existing] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.posTransactionId, posTransactionId));
  if (existing) return { invoiceId: existing.id, status: existing.status };

  const settings = await getInvoiceSettings();
  if (settings && !settings.autoIssue) {
    return { invoiceId: null, status: 'skipped', error: 'Otomatik fatura kapalı' };
  }

  const [product] = await db
    .select()
    .from(reportProducts)
    .where(eq(reportProducts.id, tx.productType));

  const taxRate = Number(product?.taxRate ?? settings?.defaultTaxRate ?? 20);
  const gross = Number(tx.amount);
  const { subtotal, taxAmount, total } = splitTax(gross, taxRate);

  const series = settings?.invoiceSeries || 'EAR';
  const invoiceNumber = await nextInvoiceNumber(series);
  const ettn = randomUUID();
  const itemName = product?.name || 'Dijital Analiz Raporu (PDF)';

  const [invoice] = await db
    .insert(invoices)
    .values({
      posTransactionId,
      guestOrderId: tx.guestOrderId,
      invoiceNumber,
      ettn,
      buyerName: tx.payerName || tx.payerEmail || 'Nihai Tüketici',
      buyerEmail: tx.payerEmail,
      subtotal: String(subtotal),
      taxAmount: String(taxAmount),
      total: String(total),
      currency: tx.currency,
      status: 'draft',
      documentType: 'EARSIV',
      provider: settings?.provider ?? null,
    })
    .returning();

  await db.insert(invoiceItems).values({
    invoiceId: invoice.id,
    name: itemName,
    quantity: '1',
    unitPrice: String(subtotal),
    taxRate: String(taxRate),
    lineTotal: String(subtotal),
    taxAmount: String(taxAmount),
    sort: 0,
  });

  if (!hasProviderKeys(settings)) {
    // Anahtar yok → dahili taslak olarak bekler.
    return { invoiceId: invoice.id, status: 'draft' };
  }

  const sent = await sendInvoiceToProvider(invoice.id);
  return { invoiceId: invoice.id, status: sent.status, error: sent.error };
}

/**
 * Kayıtlı bir faturayı entegratöre gönderir (ilk gönderim veya yeniden deneme).
 *
 * @param invoiceId - `invoices.id`
 */
export async function sendInvoiceToProvider(
  invoiceId: string,
): Promise<{ status: string; error?: string }> {
  const settings = await getInvoiceSettings();
  if (!hasProviderKeys(settings)) {
    return { status: 'draft', error: 'Faturalama entegratör anahtarları tanımlı değil' };
  }
  if (!settings.sellerTitle || !settings.sellerTaxNumber) {
    return { status: 'draft', error: 'Satıcı ünvanı / VKN tanımlı değil' };
  }

  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
  if (!invoice) return { status: 'error', error: 'Fatura bulunamadı' };
  if (invoice.status === 'sent') return { status: 'sent' };

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId));

  const keys = keysFrom(settings);

  // Alıcı VKN varsa mükellef sorgusu yap; mükellefse e-Fatura kesilir.
  let documentType: 'EARSIV' | 'EFATURA' = 'EARSIV';
  let receiverTag: string | undefined;
  if (invoice.buyerTaxNumber) {
    const check = await checkEFaturaMukellef(keys, invoice.buyerTaxNumber);
    if (check.isMukellef) {
      documentType = 'EFATURA';
      receiverTag = check.receiverTag;
    }
  }

  const xml = buildUBLInvoice({
    invoiceNo: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString().slice(0, 10),
    invoiceTime: invoice.invoiceDate.toISOString().slice(11, 19),
    invoiceType: 'SATIS',
    invoiceProfile: documentType === 'EFATURA' ? 'TICARIFATURA' : 'EARSIVFATURA',
    guid: invoice.ettn,
    currencyCode: invoice.currency,
    sellerName: settings.sellerTitle,
    sellerTaxNumber: settings.sellerTaxNumber,
    sellerTaxOffice: settings.sellerTaxOffice ?? undefined,
    sellerAddress: settings.sellerAddress ?? undefined,
    sellerCity: settings.sellerCity ?? undefined,
    sellerDistrict: settings.sellerDistrict ?? undefined,
    buyerName: invoice.buyerName,
    buyerTaxNumber: invoice.buyerTaxNumber ?? undefined,
    buyerTaxOffice: invoice.buyerTaxOffice ?? undefined,
    buyerAddress: invoice.buyerAddress ?? undefined,
    buyerCity: invoice.buyerCity ?? undefined,
    buyerDistrict: invoice.buyerDistrict ?? undefined,
    buyerEmail: invoice.buyerEmail ?? undefined,
    items: items.map((i) => ({
      name: i.name,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      taxRate: Number(i.taxRate),
    })),
  });

  const res = await sendDocumentXML(keys, xml, invoice.ettn, documentType, receiverTag);

  if (!res.success) {
    await db
      .update(invoices)
      .set({
        status: 'error',
        documentType,
        errorMessage: res.error ?? 'Entegratör hatası',
        attemptCount: invoice.attemptCount + 1,
        rawResponse: (res.data ?? null) as Record<string, unknown> | null,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));
    return { status: 'error', error: res.error };
  }

  await db
    .update(invoices)
    .set({
      status: 'sent',
      documentType,
      providerUuid: res.data?.UUID ?? invoice.ettn,
      providerDocumentNo: res.data?.DocumentNo ?? null,
      pdfUrl: res.data?.PdfLink ?? null,
      errorMessage: null,
      attemptCount: invoice.attemptCount + 1,
      rawResponse: (res.data ?? null) as Record<string, unknown> | null,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  return { status: 'sent' };
}

/** Gönderilememiş (draft/error) faturaları listeler — admin panelindeki yeniden deneme için. */
export async function listPendingInvoices(limit = 50) {
  return db
    .select()
    .from(invoices)
    .where(and(eq(invoices.status, 'draft')))
    .limit(limit);
}
