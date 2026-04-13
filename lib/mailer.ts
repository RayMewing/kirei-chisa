import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Pengecekan koneksi SMTP (akan muncul di log terminal/Vercel)
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Error Koneksi SMTP:", error);
  } else {
    console.log("✅ Server SMTP siap mengirim email!");
  }
});

export async function sendOTPEmail(to: string, otp: string, type: 'register' | 'admin' = 'register') {
  const subject = type === 'admin'
    ? '🔐 Kirei Chisa - Kode OTP Admin Login'
    : '✉️ Kirei Chisa - Verifikasi Email';

  const bodyHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:Inter,sans-serif;background:#f9fafb;margin:0;padding:20px;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#C41E3A,#9B172D);padding:32px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Kirei Chisa</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px;">Premium Digital Services</p>
        </div>
        <div style="padding:32px 24px;">
          <h2 style="color:#1f2937;font-size:18px;margin:0 0 8px;">${type === 'admin' ? 'Login Admin' : 'Verifikasi Email'}</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
            ${type === 'admin'
              ? 'Gunakan kode OTP berikut untuk login sebagai admin:'
              : 'Gunakan kode OTP berikut untuk verifikasi akun kamu:'}
          </p>
          <div style="background:#fff1f2;border:2px solid #fecdd3;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
            <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">Kode OTP</p>
            <p style="color:#C41E3A;font-size:36px;font-weight:700;margin:0;letter-spacing:0.2em;">${otp}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
            Kode ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini ke siapapun.
          </p>
        </div>
        <div style="background:#f9fafb;padding:16px 24px;text-align:center;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© 2026 Kirei Chisa. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Kirei Chisa <noreply@kireichisa.com>',
    to,
    subject,
    html: bodyHtml,
  });
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
