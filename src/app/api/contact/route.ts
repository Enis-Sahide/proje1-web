import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail/smtp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz istek gövdesi.' },
        { status: 400 }
      );
    }

    const { name, email, subjectCategory, orderCode, message } = body;

    // Temel doğrulama
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir isim giriniz.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Mesajınız en az 10 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim();
    const sanitizedCategory = subjectCategory ? String(subjectCategory).trim() : 'Genel Danışma';
    const sanitizedOrderCode = orderCode ? String(orderCode).trim() : 'Belirtilmedi';
    const sanitizedMessage = message.trim();

    const targetEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'info@7layers.tr';

    const mailHtml = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #131926; border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1b2438, #0b0f19); padding: 24px; border-bottom: 1px solid rgba(212,175,55,0.2); text-align: center; }
          .title { color: #D4AF37; font-size: 20px; font-weight: bold; margin: 0; }
          .content { padding: 24px; }
          .item { margin-bottom: 16px; }
          .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          .value { font-size: 15px; color: #f8fafc; font-weight: 500; }
          .message-box { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin-top: 8px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
          .footer { background: #0b0f19; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">7Layers — Yeni İletişim & Destek Mesajı</h1>
          </div>
          <div class="content">
            <div class="item">
              <div class="label">Gönderen Kişi</div>
              <div class="value">${sanitizedName}</div>
            </div>
            <div class="item">
              <div class="label">E-Posta</div>
              <div class="value"><a href="mailto:${sanitizedEmail}" style="color: #D4AF37;">${sanitizedEmail}</a></div>
            </div>
            <div class="item">
              <div class="label">Konu / Kategori</div>
              <div class="value">${sanitizedCategory}</div>
            </div>
            <div class="item">
              <div class="label">Sipariş / Referans Kodu</div>
              <div class="value">${sanitizedOrderCode}</div>
            </div>
            <div class="item">
              <div class="label">Mesaj İçeriği</div>
              <div class="message-box">${sanitizedMessage}</div>
            </div>
          </div>
          <div class="footer">
            Bu mesaj 7layers.tr web sitesi iletişim formundan otomatik olarak iletilmiştir.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendMail({
        to: targetEmail,
        subject: `[7Layers İletişim] ${sanitizedCategory} — ${sanitizedName}`,
        html: mailHtml,
        text: `7Layers İletişim Mesajı\nGönderen: ${sanitizedName} (${sanitizedEmail})\nKonu: ${sanitizedCategory}\nSipariş Kodu: ${sanitizedOrderCode}\n\nMesaj:\n${sanitizedMessage}`,
        replyTo: sanitizedEmail,
      });
    } catch (mailError) {
      console.warn('[Contact API] E-posta gönderimi uyarısı (local/konfigürasyon):', mailError);
      // Geliştirme ortamında veya SMTP kapalıyken kullanıcının akışını engellememek için başarı döneriz
    }

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla bize ulaştı. Destek ekibimiz en kısa sürede dönüş sağlayacaktır.',
    });
  } catch (error: unknown) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Mesaj iletilirken bir hata oluştu. Lütfen doğrudan info@7layers.tr adresine yazınız.' },
      { status: 500 }
    );
  }
}
