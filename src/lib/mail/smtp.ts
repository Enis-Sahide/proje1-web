import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Transporter lazily initialized to avoid connection issues on startup
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  let host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Cloudflare CDN mail.7layers.tr adresinde 465/587 portlarını proxy etmediği için
  // canlıda host mail.7layers.tr tanımlı olsa dahi doğrudan gerçek sunucu IP'sine yönlendir
  if (!host || host === 'mail.7layers.tr') {
    host = '82.163.176.104';
  }

  if (!user || !pass) {
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
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
    tls: {
      rejectUnauthorized: false,
      servername: 'mail.7layers.tr',
    },
  });

  return transporter;
}

// ─────────────────────────────────────────────────────────────
// Gönderim katmanı: RESEND_API_KEY tanımlıysa Resend (HTTP API),
// değilse eski SMTP transport'a düşer. Şablon fonksiyonları yalnızca
// bu yardımcıyı çağırır; sağlayıcı ayrıntısını bilmez.
// ─────────────────────────────────────────────────────────────
let resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

/** Aktif sağlayıcı adı — loglar ve test endpoint'i için. */
export function mailProvider(): 'resend' | 'smtp' {
  return process.env.RESEND_API_KEY ? 'resend' : 'smtp';
}

/**
 * Tek gönderim noktası. Başarıda sağlayıcının mesaj id'sini döner.
 * @throws Sağlayıcı hatası — çağıran taraf yakalar ve false döner.
 */
const DEFAULT_FROM_ADDRESS = 'noreply@7layers.tr';

/**
 * SMTP_FROM'u `Name <email>` biçimine normalize eder. Resend bu biçimi zorunlu
 * tutar; env'de yalnızca isim (ör. "7Layers") varsa adres eklenir.
 */
export function resolveFrom(): string {
  const raw = (process.env.SMTP_FROM || '').trim().replace(/^"|"$/g, '');
  if (!raw) return `7Layers <${DEFAULT_FROM_ADDRESS}>`;
  if (raw.includes('@')) return raw;
  return `${raw} <${DEFAULT_FROM_ADDRESS}>`;
}

export async function sendMail(msg: MailMessage): Promise<string> {
  const from = resolveFrom();

  const client = getResend();
  if (client) {
    const { data, error } = await client.emails.send({
      from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo,
      headers: msg.headers,
    });
    if (error) throw new Error(`Resend: ${error.name} — ${error.message}`);
    return data?.id ?? '';
  }

  const info = await getTransporter().sendMail({
    from,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    replyTo: msg.replyTo,
    headers: msg.headers,
  });
  return info?.messageId ?? '';
}

export async function sendResetPasswordEmail(email: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.7layers.tr';
  const resetLink = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

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
    const id = await sendMail({ to: email, subject: '7Layers - Şifre Sıfırlama İsteği', html });
    console.log(`[mail:${mailProvider()}] password reset → ${email} (${id})`);
    return true;
  } catch (err) {
    console.error("Failed to send reset password email:", err);
    return false;
  }
}

export async function sendGuestDownloadEmail(email: string, token: string, analysisType: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.7layers.tr';
  const downloadLink = `${appUrl}/checkout/success?token=${encodeURIComponent(token)}`;
  
  let reportName = 'Doğum Haritası Analizi Raporu';
  if (analysisType === 'kabbalah') {
    reportName = 'Kabalistik 4 Alem Harita Analizi Raporu';
  } else if (analysisType === 'human-design' || analysisType === 'human_design') {
    reportName = 'Human Design Analizi Raporu';
  }

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>7Layers Rapor İndirme</title>
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
          <p>Satın almış olduğunuz <strong>${reportName}</strong> başarıyla hazırlandı! Aşağıdaki butona tıklayarak analiz raporunuzu PDF olarak indirebilirsiniz:</p>
          
          <div class="btn-wrapper">
            <a href="${downloadLink}" class="btn" target="_blank">RAPORU PDF OLARAK İNDİR</a>
          </div>
          
          <p>İndirme bağlantısı güvenliğiniz amacıyla tek kullanımlıktır. Raporunuzu cihazınıza kaydetmeyi unutmayınız.</p>
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
    const id = await sendMail({ to: email, subject: `7Layers - ${reportName} Hazır!`, html });
    console.log(`[mail:${mailProvider()}] guest download → ${email} (${id})`);
    return true;
  } catch (err) {
    console.error("Failed to send guest download email:", err);
    return false;
  }
}

export async function sendVerificationCodeEmail(email: string, code: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.7layers.tr';

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>7Layers E-posta Doğrulama Kodu</title>
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
        .code-box {
          text-align: center;
          margin: 30px 0;
          padding: 24px;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 16px;
        }
        .code {
          font-size: 38px;
          font-weight: 800;
          color: #D4AF37;
          letter-spacing: 8px;
          font-family: monospace, Courier, monospace;
          margin: 0;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }
        .code-hint {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 10px;
          margin-bottom: 0;
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
          <h2>Hoş Geldiniz,</h2>
          <p>7Layers platformuna kaydınızı tamamlamak ve hesabınızı güvenle aktif etmek için aşağıdaki 6 haneli doğrulama kodunu kullanın:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
            <p class="code-hint">Bu kod <strong>15 dakika</strong> boyunca geçerlidir.</p>
          </div>
          
          <p>Eğer 7Layers'ta hesap oluşturma talebinde bulunmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.</p>
        </div>
        <div class="footer">
          <p>© 2026 7Layers. Tüm Hakları Saklıdır.<br>
          <a href="${appUrl}">7layers.tr</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `7Layers Kayıt Doğrulama Kodunuz: ${code}\n\nBu kod 15 dakika boyunca geçerlidir.\n\nEğer bu talebi siz yapmadıysanız bu e-postayı güvenle yok sayabilirsiniz.\n\n7layers.tr`;

  try {
    const id = await sendMail({
      to: email,
      replyTo: 'noreply@7layers.tr',
      subject: `7Layers - Doğrulama Kodunuz: ${code}`,
      text,
      html,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        Importance: 'High',
      },
    });
    console.log(`[mail:${mailProvider()}] verification code → ${email} (${id})`);
    return true;
  } catch (err) {
    console.error("Failed to send verification code email:", err);
    return false;
  }
}
