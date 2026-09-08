import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { json, errorJson } from '@/lib/http/cors';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return errorJson('Sipariş kimliği eksik', 400);
    }

    const [order] = await db.select({
      id: guestOrders.id,
      email: guestOrders.email,
      analysisType: guestOrders.analysisType,
      amount: guestOrders.amount,
      paymentStatus: guestOrders.paymentStatus,
      createdAt: guestOrders.createdAt
    }).from(guestOrders).where(eq(guestOrders.id, orderId));

    if (!order) {
      return errorJson('Sipariş bulunamadı', 404);
    }

    return json({ success: true, order });
  } catch (error: any) {
    console.error('Order info error:', error);
    return errorJson('Sipariş bilgisi alınamadı: ' + error.message, 500);
  }
}
