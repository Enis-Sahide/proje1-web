import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { invoices } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

// GET /api/billing/invoices — Kullanıcının kendi faturaları (hassas alanlar hariç).
export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      invoiceDate: invoices.invoiceDate,
      buyerName: invoices.buyerName,
      buyerTaxNumber: invoices.buyerTaxNumber,
      subtotal: invoices.subtotal,
      taxAmount: invoices.taxAmount,
      total: invoices.total,
      currency: invoices.currency,
      status: invoices.status,
      documentType: invoices.documentType,
      providerDocumentNo: invoices.providerDocumentNo,
      pdfUrl: invoices.pdfUrl,
    })
    .from(invoices)
    .where(eq(invoices.userId, payload.sub))
    .orderBy(desc(invoices.invoiceDate));

  return json({ success: true, data: rows });
}
