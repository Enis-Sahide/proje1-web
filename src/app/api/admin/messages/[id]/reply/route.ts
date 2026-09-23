import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { contactMessages } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { sendMail } from '@/lib/mail/smtp';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { replyText } = body;

    if (!replyText || typeof replyText !== 'string' || replyText.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Lütfen geçerli bir yanıt metni giriniz.' }, { status: 400 });
    }

    const [message] = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id));

    if (!message) {
      return NextResponse.json({ success: false, error: 'Mesaj bulunamadı.' }, { status: 404 });
    }

    const sanitizedReply = replyText.trim();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.7layers.tr';

    const replyHtml = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #05070e; color: #e2e8f0; margin: 0; padding: 24px; }
          .card { max-width: 600px; margin: 0 auto; background: #0c121e; border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #162035, #080c14); padding: 28px 24px; border-bottom: 1px solid rgba(212,175,55,0.2); text-align: center; }
          .logo-text { color: #D4AF37; font-size: 22px; font-weight: bold; letter-spacing: 0.05em; margin: 0; }
          .subtitle { color: #94a3b8; font-size: 13px; margin-top: 6px; }
          .content { padding: 28px 24px; }
          .greeting { font-size: 16px; color: #f8fafc; font-weight: 600; margin-bottom: 16px; }
          .reply-box { background: rgba(212,175,55,0.05); border-left: 3px solid #D4AF37; border-radius: 8px; padding: 18px; font-size: 15px; line-height: 1.7; color: #f1f5f9; white-space: pre-wrap; margin-bottom: 24px; }
          .quote-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; font-size: 13px; color: #94a3b8; line-height: 1.5; margin-top: 20px; }
          .quote-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 6px; }
          .footer { background: #070a12; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); }
          .btn { display: inline-block; background: #D4AF37; color: #000; font-weight: bold; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-size: 13px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="logo-text">7Layers Destek Ekibi</h1>
            <div class="subtitle">Kozmik Bilgiler & Analiz Okulu</div>
          </div>
          <div class="content">
            <div class="greeting">Merhaba Sayın ${message.name},</div>
            <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 14px;">
              Web sitemiz üzerinden ilettiğiniz <strong>${message.subjectCategory}</strong> konulu destek talebiniz ekibimiz tarafından incelenmiş ve yanıtlanmıştır:
            </p>
            
            <div class="reply-box">
${sanitizedReply}
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${appUrl}" class="btn">7Layers'ı Ziyaret Et</a>
            </div>

            <div class="quote-box">
              <div class="quote-title">Orijinal Mesajınız (${new Date(message.createdAt).toLocaleDateString('tr-TR')}):</div>
              <div>"${message.message}"</div>
              ${message.orderCode ? `<div style="margin-top: 6px; font-size: 11px; color: #D4AF37;">Sipariş Kodu: ${message.orderCode}</div>` : ''}
            </div>
          </div>
          <div class="footer">
            Her türlü soru ve talebiniz için doğrudan bu e-postaya yanıt verebilir veya <a href="mailto:info@7layers.tr" style="color: #D4AF37;">info@7layers.tr</a> adresine yazabilirsiniz.
          </div>
        </div>
      </body>
      </html>
    `;

    // 1. E-posta gönderimi
    try {
      await sendMail({
        to: message.email,
        subject: `Re: [7Layers Destek] ${message.subjectCategory}`,
        html: replyHtml,
        text: `Merhaba Sayın ${message.name},\n\n${sanitizedReply}\n\n---\nOrijinal Mesajınız:\n${message.message}\n\n7Layers Destek Ekibi\ninfo@7layers.tr`,
        replyTo: 'info@7layers.tr',
      });
    } catch (mailError) {
      console.warn('[Admin Reply API] E-posta gönderim uyarısı:', mailError);
    }

    // 2. Veritabanında güncelle
    await db
      .update(contactMessages)
      .set({
        status: 'replied',
        adminReply: sanitizedReply,
        repliedAt: new Date(),
      })
      .where(eq(contactMessages.id, id));

    return NextResponse.json({
      success: true,
      message: `${message.name} isimli kullanıcıya yanıt e-postası başarıyla iletildi.`,
    });
  } catch (error: unknown) {
    console.error('[Admin Message Reply Error]:', error);
    return NextResponse.json({ success: false, error: 'Yanıt gönderilirken hata oluştu.' }, { status: 500 });
  }
}
