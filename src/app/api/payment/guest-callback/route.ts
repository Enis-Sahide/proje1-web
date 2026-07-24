import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { json, errorJson } from '@/lib/http/cors';
import { eq } from 'drizzle-orm';
import { sendGuestDownloadEmail } from '@/lib/mail/smtp';

export async function POST(request: Request) {
  try {
    const { orderId, cardName, cardNumber } = await request.json().catch(() => ({}));
    if (!orderId) {
      return errorJson('Sipariş kimliği eksik', 400);
    }
    
    // Retrieve the order details
    const [order] = await db.select().from(guestOrders).where(eq(guestOrders.id, orderId));
    if (!order) {
      return errorJson('Sipariş bulunamadı', 404);
    }
    
    if (order.paymentStatus === 'success') {
      return json({ success: true, token: order.downloadToken });
    }
    
    // Simulate simple card validations for mock checkout
    if (!cardName || !cardNumber || cardNumber.replace(/\s+/g, '').length < 16) {
      return errorJson('Lütfen geçerli ödeme bilgilerini eksiksiz doldurun.', 400);
    }
    
    // Generate secure single-use download token
    const downloadToken = 'DLT_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    
    // Update database status
    await db.update(guestOrders)
      .set({
        paymentStatus: 'success',
        downloadToken: downloadToken
      })
      .where(eq(guestOrders.id, orderId));
      
    // Send email to customer asynchronously
    sendGuestDownloadEmail(order.email, downloadToken, order.analysisType).catch((err) => {
      console.error("Failed to send guest download link email async:", err);
    });
    
    return json({ success: true, token: downloadToken });
  } catch (error: any) {
    console.error('Guest payment callback error:', error);
    return errorJson('Ödeme işlenemedi: ' + error.message, 500);
  }
}
