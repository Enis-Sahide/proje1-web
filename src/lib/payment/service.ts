import 'server-only';
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { guestOrders, posTransactions } from '@/db/schema';
import { getTrepsClient, getReportProduct, normalizeProductType } from './settings';
import { getTrepsErrorMessage } from './treps/error-codes';
import type { TrepsHPPStatusResponse } from './treps/client';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'expired' | 'refunded';

export interface InitiateParams {
  guestOrderId: string;
  productType: string;
  amount: number;
  payer: {
    /** Treps'e gönderilen müşteri referansı; üye değilse sipariş id'si kullanılır. */
    customerId: string;
    name: string;
    surname: string;
    email: string;
    phone?: string;
    city?: string;
    address?: string;
  };
  /** Fatura alıcı bilgileri — checkout formunda toplanır. */
  billing?: {
    /** Kopyalandığı fatura profili (izlenebilirlik için). */
    profileId?: string | null;
    isCompany: boolean;
    /** TCKN (11 hane) veya VKN (10 hane); bireyselde boş olabilir. */
    taxNumber?: string | null;
    taxOffice?: string | null;
    address?: string | null;
    city?: string | null;
    district?: string | null;
  };
  userId?: string | null;
}

export interface InitiateResult {
  success: boolean;
  redirectUrl?: string;
  externalOrderId?: string;
  posTransactionId?: string;
  hppToken?: string;
  error?: string;
}

export interface VerifyResult {
  success: boolean;
  status: PaymentStatus;
  downloadToken?: string | null;
  externalOrderId?: string;
  error?: string;
}

/** Uygulama tabanı — Treps'in geri döneceği mutlak adres için gerekli. */
export function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function newExternalOrderId(): string {
  return `7L-${Date.now()}-${randomBytes(4).toString('hex')}`;
}

function newDownloadToken(): string {
  return `DLT_${randomBytes(16).toString('hex')}`;
}

/**
 * Treps'te bir HPP oturumu açar ve `pos_transactions`'a pending kayıt atar.
 *
 * @returns Kullanıcının yönlendirileceği Treps ödeme sayfası adresi.
 */
export async function initiateHPPPayment(params: InitiateParams): Promise<InitiateResult> {
  try {
    const client = await getTrepsClient();
    const productType = normalizeProductType(params.productType);
    const product = await getReportProduct(productType);

    const externalOrderId = newExternalOrderId();
    // Treps ödeme bitince kullanıcıyı buraya döndürür; token ile durumu doğrularız.
    const returnUrl = `${getBaseUrl()}/api/payment/treps/callback?token=${encodeURIComponent(externalOrderId)}`;

    const res = await client.createHPP({
      externalOrderId,
      amount: params.amount,
      returnUrl,
      buyer: {
        customerId: params.payer.customerId,
        name: params.payer.name,
        surname: params.payer.surname,
        email: params.payer.email,
        phoneNumber: params.payer.phone || '',
        city: params.payer.city,
        address: params.payer.address,
      },
      products: [
        {
          productId: productType || 'report',
          category: 'Dijital Hizmet',
          name: product?.name || 'Analiz Raporu (PDF)',
          price: params.amount,
          quantity: 1,
          description: product?.description || undefined,
        },
      ],
    });

    if (!res.status || !res.data?.url) {
      return { success: false, error: res.errors || 'Ödeme sayfası oluşturulamadı' };
    }

    const [tx] = await db
      .insert(posTransactions)
      .values({
        externalOrderId,
        guestOrderId: params.guestOrderId,
        userId: params.userId ?? null,
        productType,
        amount: String(params.amount),
        status: 'pending',
        hppToken: res.data.token,
        hppUrl: res.data.url,
        payerName: `${params.payer.name} ${params.payer.surname}`.trim(),
        payerEmail: params.payer.email,
        payerPhone: params.payer.phone ?? null,
        billingProfileId: params.billing?.profileId ?? null,
        payerIsCompany: params.billing?.isCompany ?? false,
        payerTaxNumber: params.billing?.taxNumber ?? null,
        payerTaxOffice: params.billing?.taxOffice ?? null,
        payerAddress: params.billing?.address ?? params.payer.address ?? null,
        payerCity: params.billing?.city ?? params.payer.city ?? null,
        payerDistrict: params.billing?.district ?? null,
      })
      .returning({ id: posTransactions.id });

    return {
      success: true,
      redirectUrl: res.data.url,
      externalOrderId,
      posTransactionId: tx?.id,
      hppToken: res.data.token,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[payment] initiateHPPPayment:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Bir işlemin Treps'teki gerçek sonucunu sorgular ve veritabanını buna göre günceller.
 *
 * Hem kullanıcı geri dönüşünde (callback) hem webhook'ta hem de manuel
 * sorguda aynı fonksiyon çağrılır; tekrar çağrılması güvenlidir (idempotent).
 *
 * @param tokenOrOrderId - HPP tokenı (HST-…) veya bizim sipariş referansımız (7L-…)
 */
export async function verifyPayment(tokenOrOrderId: string): Promise<VerifyResult> {
  try {
    const isExternal = tokenOrOrderId.startsWith('7L-');
    const [tx] = await db
      .select()
      .from(posTransactions)
      .where(
        isExternal
          ? eq(posTransactions.externalOrderId, tokenOrOrderId)
          : eq(posTransactions.hppToken, tokenOrOrderId),
      );

    if (!tx) return { success: false, status: 'failed', error: 'İşlem bulunamadı' };

    // Zaten tamamlanmışsa Treps'e tekrar gitmeye gerek yok.
    if (tx.status === 'completed') {
      const order = tx.guestOrderId ? await getGuestOrder(tx.guestOrderId) : null;
      return {
        success: true,
        status: 'completed',
        downloadToken: order?.downloadToken ?? null,
        externalOrderId: tx.externalOrderId,
      };
    }

    if (!tx.hppToken) {
      return { success: false, status: 'failed', error: 'HPP tokenı kayıtlı değil' };
    }

    const client = await getTrepsClient();
    const hppStatus = await client.getHPPStatus(tx.hppToken);

    if (!hppStatus.status) {
      // API hatası ödeme hatası değildir — pending bırak, kullanıcı tekrar deneyebilsin.
      return { success: false, status: 'pending', error: 'Treps durum sorgusu başarısız' };
    }

    const data = hppStatus.data;
    const payment = data.order?.payments?.[0];
    let newStatus: PaymentStatus = 'pending';

    if (data.status === 2) {
      newStatus = 'expired';
    } else if (data.status === 3) {
      newStatus = 'failed';
    } else if (payment) {
      newStatus = payment.payment_status === 10 ? 'completed' : 'failed';
    }

    // İade için gereken transaction_id yalnızca order-detail ucundan gelir.
    let trepsTransactionId: string | null = null;
    if (newStatus === 'completed') {
      const detail = await client.getOrderDetail(tx.externalOrderId);
      trepsTransactionId = detail?.payments?.[0]?.transactions?.[0]?.transaction_id ?? null;
    }

    const errorCode = newStatus === 'failed' ? payment?.payment_status_code ?? null : null;

    await db
      .update(posTransactions)
      .set({
        status: newStatus,
        trepsOrderId: data.order?.oid ?? null,
        trepsPaymentId: payment?.payment_id ?? null,
        trepsTransactionId,
        installment: payment?.installment || 1,
        cardLastFour: payment?.card_last_four ?? null,
        errorCode,
        errorMessage: errorCode ? getTrepsErrorMessage(errorCode) : null,
        rawResponse: data as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(posTransactions.id, tx.id));

    if (newStatus !== 'completed') {
      if (tx.guestOrderId && (newStatus === 'failed' || newStatus === 'expired')) {
        await db
          .update(guestOrders)
          .set({ paymentStatus: 'failed' })
          .where(eq(guestOrders.id, tx.guestOrderId));
      }
      return {
        success: false,
        status: newStatus,
        externalOrderId: tx.externalOrderId,
        error: errorCode ? getTrepsErrorMessage(errorCode) : undefined,
      };
    }

    const downloadToken = await onPaymentCompleted(tx.id, tx.guestOrderId, data);
    return {
      success: true,
      status: 'completed',
      downloadToken,
      externalOrderId: tx.externalOrderId,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[payment] verifyPayment:', msg);
    return { success: false, status: 'pending', error: msg };
  }
}

async function getGuestOrder(id: string) {
  const [row] = await db.select().from(guestOrders).where(eq(guestOrders.id, id));
  return row ?? null;
}

/**
 * Ödeme başarıya döndüğünde çalışan yan etkiler: siparişi ödendi işaretle,
 * indirme belirteci üret, e-postayı gönder ve faturayı kes.
 *
 * Yan etkilerin hiçbiri ödemeyi geçersiz kılmaz — hata olursa loglanır,
 * kullanıcının ödemesi başarılı kabul edilmeye devam eder.
 */
async function onPaymentCompleted(
  posTransactionId: string,
  guestOrderId: string | null,
  trepsData: TrepsHPPStatusResponse['data'],
): Promise<string | null> {
  let downloadToken: string | null = null;

  if (guestOrderId) {
    const order = await getGuestOrder(guestOrderId);
    if (order) {
      downloadToken = order.downloadToken || newDownloadToken();
      if (order.paymentStatus !== 'success') {
        await db
          .update(guestOrders)
          .set({ paymentStatus: 'success', downloadToken })
          .where(eq(guestOrders.id, guestOrderId));

        // E-posta gönderimi ödemeyi bloke etmemeli.
        try {
          const { sendGuestDownloadEmail } = await import('@/lib/mail/smtp');
          void sendGuestDownloadEmail(order.email, downloadToken, order.analysisType).catch(
            (err: unknown) => console.error('[payment] indirme e-postası gönderilemedi:', err),
          );
        } catch (err) {
          console.error('[payment] e-posta modülü yüklenemedi:', err);
        }
      }
    }
  }

  try {
    const { issueInvoiceForTransaction } = await import('@/lib/billing/invoice-service');
    await issueInvoiceForTransaction(posTransactionId);
  } catch (err) {
    console.error('[payment] fatura kesilemedi:', err);
  }

  void trepsData;
  return downloadToken;
}

/**
 * Tamamlanmış bir işlemi iade eder ve kaydı `refunded` yapar.
 *
 * @param posTransactionId - `pos_transactions.id`
 * @param amount - Kısmi iade tutarı; verilmezse tamamı iade edilir.
 */
export async function refundTransaction(
  posTransactionId: string,
  amount?: number,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  const [tx] = await db
    .select()
    .from(posTransactions)
    .where(eq(posTransactions.id, posTransactionId));

  if (!tx) return { success: false, error: 'İşlem bulunamadı' };
  if (tx.status !== 'completed') return { success: false, error: 'Yalnızca tamamlanmış işlemler iade edilebilir' };

  try {
    const client = await getTrepsClient();

    let paymentId = tx.trepsPaymentId;
    let transactionId = tx.trepsTransactionId;

    // Eksikse order-detail üzerinden çözümle.
    if (!paymentId || !transactionId) {
      const detail = await client.getOrderDetail(tx.externalOrderId);
      paymentId = detail?.payments?.[0]?.payment_id ?? paymentId;
      transactionId = detail?.payments?.[0]?.transactions?.[0]?.transaction_id ?? transactionId;
    }

    if (!paymentId || !transactionId) {
      return { success: false, error: 'Treps payment_id / transaction_id çözümlenemedi' };
    }

    const result = await client.refund(paymentId, transactionId, amount ?? Number(tx.amount), reason);
    if (!result.status) {
      return { success: false, error: result.errors || 'İade başarısız' };
    }

    await db
      .update(posTransactions)
      .set({
        status: 'refunded',
        trepsPaymentId: paymentId,
        trepsTransactionId: transactionId,
        updatedAt: new Date(),
      })
      .where(eq(posTransactions.id, posTransactionId));

    // İade edilen siparişin indirme hakkı da düşer.
    if (tx.guestOrderId) {
      await db
        .update(guestOrders)
        .set({ paymentStatus: 'refunded', downloadToken: null })
        .where(eq(guestOrders.id, tx.guestOrderId));
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return { success: false, error: msg };
  }
}
