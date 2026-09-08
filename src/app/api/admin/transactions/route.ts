import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { posTransactions } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { refundTransaction, verifyPayment } from '@/lib/payment/service';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

// GET /api/admin/transactions?status=&limit= — POS işlem dökümü.
export async function GET(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 500);

    const base = db.select().from(posTransactions);
    const rows = await (status ? base.where(eq(posTransactions.status, status)) : base)
      .orderBy(desc(posTransactions.createdAt))
      .limit(limit);

    return json({ success: true, data: rows });
  } catch (error: unknown) {
    console.error('İşlemler listelenemedi:', error);
    return errorJson('İşlemler listelenemedi', 500);
  }
}

/**
 * POST /api/admin/transactions
 *
 * Tek bir işlem üzerinde yönetici aksiyonu çalıştırır.
 * Gövde: `{ id, action: 'refund' | 'verify', amount?, reason? }`
 */
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin(request))) return errorJson('Yetkisiz', 403);

    const { id, action, amount, reason } = await request.json().catch(() => ({}));
    if (!id || !action) return errorJson('id ve action zorunludur', 400);

    const [tx] = await db.select().from(posTransactions).where(eq(posTransactions.id, id));
    if (!tx) return errorJson('İşlem bulunamadı', 404);

    if (action === 'verify') {
      const result = await verifyPayment(tx.hppToken || tx.externalOrderId);
      return json({ success: result.success, data: result });
    }

    if (action === 'refund') {
      const parsed = amount === undefined || amount === null ? undefined : Number(amount);
      if (parsed !== undefined && (!Number.isFinite(parsed) || parsed <= 0)) {
        return errorJson('İade tutarı geçersiz', 400);
      }
      if (parsed !== undefined && parsed > Number(tx.amount)) {
        return errorJson('İade tutarı işlem tutarını aşamaz', 400);
      }

      const result = await refundTransaction(id, parsed, reason);
      if (!result.success) return errorJson(result.error || 'İade başarısız', 502);
      return json({ success: true });
    }

    return errorJson('Bilinmeyen action', 400);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[admin transactions]', msg);
    return errorJson(msg, 500);
  }
}
