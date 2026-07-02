import nodemailer from 'nodemailer';

// Transporter lazily initialized to avoid connection issues on startup
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP settings are incomplete! Mails will not be sent.");
  }

  transporter = nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user: user || '',
      pass: pass || '',
    },
  });

  return transporter;
}

export async function sendResetPasswordEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.7layers.tr';
  const resetLink = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const from = process.env.SMTP_FROM || '"7Layers" <noreply@7layers.tr>';

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>7Layers Şifre Sıfırlama</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0b0f19;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 580px;
          margin: 40px auto;
          background-color: #111827;
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .header {
          background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
          padding: 40px 20px;
          text-align: center;
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
        }
        .logo-text {
          font-size: 32px;
          font-weight: bold;
          color: #D4AF37;
          letter-spacing: 3px;
          text-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
          margin: 0;
        }
        .logo-sub {
          font-size: 11px;
          color: #9ca3af;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-top: 5px;
          margin-bottom: 0;
        }
        .body {
          padding: 40px 30px;
          line-height: 1.6;
        }
        h2 {
          color: #f1f5f9;
          font-size: 22px;
          margin-top: 0;
          margin-bottom: 20px;
        }
        p {
          color: #9ca3af;
          font-size: 15px;
          margin-bottom: 24px;
        }
        .btn-wrapper {
          text-align: center;
          margin: 35px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%);
          color: #0f172a !important;
          text-decoration: none;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: bold;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.35);
          transition: all 0.3s ease;
        }
        .footer {
          background-color: #0c0f17;
          padding: 25px 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .footer a {
          color: #D4AF37;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">7LAYERS</div>
          <div class="logo-sub">KADİM BİLGİLER VE ANALİZLER</div>
        </div>
        <div class="body">
          <h2>Merhaba,</h2>
          <p>Kozmik yolculuğunuzda şifrenizi yenilemek için bir istek aldık. Aşağıdaki butona tıklayarak yeni şifrenizi hızlıca belirleyebilirsiniz:</p>
          
          <div class="btn-wrapper">
            <a href="${resetLink}" class="btn" target="_blank">ŞİFREYİ YENİLE</a>
          </div>
          
          <p>Bu bağlantı güvenlik sebebiyle <strong>30 dakika</strong> boyunca geçerlidir. Eğer şifre sıfırlama isteğini siz yapmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.</p>
        </div>
        <div class="footer">
          <p>© 2026 7Layers. Tüm Hakları Saklıdır.<br>
          Destek veya sorularınız için lütfen <a href="${appUrl}">web sitemizi</a> ziyaret edin.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getTransporter();
    await client.sendMail({
      from,
      to: email,
      subject: '7Layers - Şifre Sıfırlama İsteği',
      html,
    });
    console.log(`Password reset mail sent successfully to ${email}`);
    return true;
  } catch (err) {
    console.error("Failed to send reset password email:", err);
    return false;
  }
}
