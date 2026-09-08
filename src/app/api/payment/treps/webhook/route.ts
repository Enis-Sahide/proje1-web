import { timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { posTransactions } from '@/db/schema';
import { json } from '@/lib/http/cors';
import { getPosSettings } from '@/lib/payment/settings';
import { verifyPayment } from '@/lib/payment/service';

export const dynamic = 'force-dynamic';

/**
 * Treps'in gönderdiği bildirim gövdesi. Yalnızca kullandığımız alanlar tiplenmiştir.
 */
interface TrepsWebhookPayload {
  NotificationType: string; // SALE | REFUND | VOID …
  OrderId: string;
  PaymentId: string;
  TransactionId: string;
  Amount: number;
  Currency: string;
  Installment: number;
  CardLastFour: string;
  CardNetwork: string;
  ExternalOrderId: string; // bizim referansımız
  PaymentStatus: number; // 10 = başarılı
  PaymentStatusCode: string; // "00" = onaylandı
  PaymentStatusMessage: string;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * POST /api/payment/treps/webhook
 *
 * Treps'in sunucudan sunucuya gönderdiği ödeme bildirimi. Kullanıcı tarayıcıyı
 * kapatsa bile ödeme burada tamamlanır.
 *
 * Gövdedeki tutar/durum bilgisine doğrudan güvenilmez; sonuç her zaman
 * `verifyPayment` ile Treps'e sorularak doğrulanır.
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TrepsWebhookPayload;

    console.log(
      `[treps webhook] ${payload.NotificationType} | ${payload.ExternalOrderId} | status=${payload.PaymentStatus}`,
    );

    // ── Güvenlik anahtarı doğrulaması ──
    const settings = await getPosSettings();
    const expected = settings?.webhookSecret || process.env.TREPS_WEBHOOK_SECRET || null;

    if (expected) {
      const incoming =
        request.headers.get('x-webhook-key') ||
        request.headers.get('x-treps-secret') ||
        request.headers.get('authorization')?.replace('Bearer ', '') ||
        '';
      if (!safeEqual(incoming, expected)) {
        console.warn('[treps webhook] geçersiz güvenlik anahtarı — istek reddedildi');
        return json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      console.warn('[treps webhook] webhook_secret tanımlı değil — doğrulama yapılamadı');
    }

    // Şimdilik yalnızca satış bildirimleri işleniyor.
    if (payload.NotificationType !== 'SALE') {
      return json({ received: true, skipped: payload.NotificationType }, { status: 200 });
    }

    const [tx] = await db
      .select()
      .from(posTransactions)
      .where(eq(posTransactions.externalOrderId, payload.ExternalOrderId));

    if (!tx) {
      // 200 dönüyoruz ki Treps gereksiz yere tekrar denemesin.
      console.error(`[treps webhook] eşleşen işlem yok: ${payload.ExternalOrderId}`);
      return json({ received: true, matched: false }, { status: 200 });
    }

    if (tx.status === 'completed') {
      return json({ received: true, alreadyCompleted: true }, { status: 200 });
    }

    // Gerçek durumu Treps'e sorar, siparişi tamamlar, faturayı tetikler.
    await verifyPayment(tx.hppToken || tx.externalOrderId);

    // Webhook'a özgü ek alanlarla kaydı zenginleştir.
    await db
      .update(posTransactions)
      .set({
        trepsOrderId: payload.OrderId,
        trepsPaymentId: payload.PaymentId,
        trepsTransactionId: payload.TransactionId,
        cardLastFour: payload.CardLastFour,
        cardBrand: payload.CardNetwork,
        installment: payload.Installment || 1,
        updatedAt: new Date(),
      })
      .where(eq(posTransactions.id, tx.id));

    return json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[treps webhook] hata:', msg);
    // 500 dönersek Treps tekrar dener — istenen davranış bu.
    return json({ error: msg }, { status: 500 });
  }
}

// Sağlık kontrolü — Treps panelinde adres doğrulaması için.
export async function GET() {
  return json({
    status: 'active',
    endpoint: '/api/payment/treps/webhook',
    accepts: 'POST',
    notificationTypes: ['SALE'],
  });
}
