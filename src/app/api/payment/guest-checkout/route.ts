import { db } from '@/db/client';
import { guestOrders } from '@/db/schema';
import { json, errorJson } from '@/lib/http/cors';

export async function POST(request: Request) {
  try {
    const { email, analysisType, birthData } = await request.json().catch(() => ({}));
    if (!email || !analysisType || !birthData) {
      return errorJson('E-posta, analiz türü veya doğum verileri eksik', 400);
    }
    
    // Astrology PDF is 50 TL, Kabbalah and Human Design PDFs are 500 TL
    const amount = (analysisType === 'kabbalah' || analysisType === 'human-design' || analysisType === 'human_design') ? 500 : 50;
    const orderId = 'GORD_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    
    await db.insert(guestOrders).values({
      id: orderId,
      email,
      analysisType,
      birthData,
      amount,
      paymentStatus: 'pending'
    });
    
    return json({ success: true, orderId, amount });
  } catch (error: any) {
    console.error('Guest checkout error:', error);
    return errorJson('Sipariş oluşturulamadı: ' + error.message, 500);
  }
}
