import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { invoices } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { issueInvoiceForTransaction, sendInvoiceToProvider } from '@/lib/billing/invoice-service';
import { isValidTCKN, isValidVKN } from '@/lib/billing/validate';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

// GET /api/admin/invoices?status=&limit= — Kesilen/bekleyen faturalar.
export async function GET(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 500);

    const base = db.select().from(invoices);
    const rows = await (status ? base.where(eq(invoices.status, status)) : base)
      .orderBy(desc(invoices.createdAt))
      .limit(limit);

    return json({ success: true, data: rows });
  } catch (error: unknown) {
    console.error('Faturalar listelenemedi:', error);
    return errorJson('Faturalar listelenemedi', 500);
  }
}

/**
 * POST /api/admin/invoices
 *
 * Gövde:
 * - `{ action: 'send', invoiceId }` — taslak/hatalı faturayı entegratöre gönderir.
 * - `{ action: 'issue', posTransactionId }` — işlem için fatura oluşturur.
 */
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const { action, invoiceId, posTransactionId } = await request.json().catch(() => ({}));

    if (action === 'send') {
      if (!invoiceId) return errorJson('invoiceId zorunludur', 400);
      const result = await sendInvoiceToProvider(invoiceId);
      if (result.status !== 'sent') {
        return errorJson(result.error || 'Fatura gönderilemedi', 502, { status: result.status });
      }
      return json({ success: true, status: result.status });
    }

    if (action === 'issue') {
      if (!posTransactionId) return errorJson('posTransactionId zorunludur', 400);
      const result = await issueInvoiceForTransaction(posTransactionId);
      return json({ success: result.status !== 'error', data: result });
    }

    return errorJson('Bilinmeyen action', 400);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[admin invoices]', msg);
    return errorJson(msg, 500);
  }
}

/**
 * PATCH /api/admin/invoices
 *
 * Gönderilmemiş (draft/error) bir faturanın alıcı bilgilerini düzeltir.
 * Gövde: `{ invoiceId, buyerName?, buyerEmail?, buyerTaxNumber?, buyerTaxOffice?, buyerAddress?, buyerCity?, buyerDistrict? }`
 */
export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const body = await request.json().catch(() => ({}) as Record<string, unknown>);
    const invoiceId = typeof body.invoiceId === 'string' ? body.invoiceId : '';
    if (!invoiceId) return errorJson('invoiceId zorunludur', 400);

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
    if (!invoice) return errorJson('Fatura bulunamadı', 404);
    if (invoice.status === 'sent') return errorJson('Gönderilmiş fatura düzenlenemez', 409);

    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
    const taxNumber = str(body.buyerTaxNumber)?.replace(/\s/g, '') ?? null;
    if (taxNumber && !(isValidTCKN(taxNumber) || isValidVKN(taxNumber))) {
      return errorJson('TCKN/VKN geçersiz', 400);
    }

    const [row] = await db
      .update(invoices)
      .set({
        buyerName: str(body.buyerName) ?? invoice.buyerName,
        buyerEmail: str(body.buyerEmail),
        buyerTaxNumber: taxNumber,
        buyerTaxOffice: str(body.buyerTaxOffice),
        buyerAddress: str(body.buyerAddress),
        buyerCity: str(body.buyerCity),
        buyerDistrict: str(body.buyerDistrict),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return json({ success: true, data: row });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[admin invoices patch]', msg);
    return errorJson(msg, 500);
  }
}
