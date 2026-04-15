import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: true, // SSL on port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendReportEmailOptions {
  to: string;
  clientName: string;
  period: string; // e.g. "April 2026"
  reportUrl: string;
}

export interface SendPasswordResetEmailOptions {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendPasswordResetEmailOptions) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#4f46e5;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">NDG Reports</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:700;">Reset your password</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              We received a request to reset the password for your NDG Reports account.
              Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#4f46e5;border-radius:8px;">
                  <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
                    Reset Password →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;line-height:1.5;">
              Or copy this link:<br/>
              <a href="${resetUrl}" style="color:#4f46e5;">${resetUrl}</a>
            </p>
            <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              Sent by NDG Reports · Nashville Digital Group
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  await transporter.sendMail({
    from: `"NDG Reports" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your NDG Reports password",
    html,
  });
}

export async function sendReportReadyEmail({
  to,
  clientName,
  period,
  reportUrl,
}: SendReportEmailOptions) {
  const subject = `Your ${period} Report is Ready — ${clientName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#4f46e5;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">NDG Reports</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:700;">Your ${period} report is ready</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Hi there,<br/><br/>
                Your monthly marketing report for <strong style="color:#111827;">${clientName}</strong> is now available. Log in to your dashboard to view your full report including social media, website, and Google My Business performance.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#4f46e5;border-radius:8px;">
                    <a href="${reportUrl}"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
                      View My Report →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;line-height:1.5;">
                Or copy this link into your browser:<br/>
                <a href="${reportUrl}" style="color:#4f46e5;">${reportUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                Sent by NDG Reports · <a href="${reportUrl}" style="color:#4f46e5;text-decoration:none;">Nashville Digital Group</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"NDG Reports" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
