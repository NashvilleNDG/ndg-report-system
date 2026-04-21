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
  pdfBuffer?: Buffer;
  fileName?: string;
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
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">

        <!-- Logo row -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;padding:10px 20px;">
                  <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:-0.3px;">NDG Reports</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main card -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <!-- Card header bar -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 40px;text-align:center;">
                  <!-- Lock icon placeholder via emoji or text -->
                  <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;line-height:52px;">🔐</div>
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Password Reset</h1>
                  <p style="margin:8px 0 0;color:#c7d2fe;font-size:14px;">Nashville Digital Group · Analytics Platform</p>
                </td>
              </tr>

              <!-- Card body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Reset your password</h2>
                  <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.7;">
                    We received a request to reset the password for your NDG Reports account.
                    Click the button below to set a new password. This link expires in <strong style="color:#0f172a;">1 hour</strong>.
                  </p>

                  <!-- CTA button -->
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:10px;box-shadow:0 4px 14px rgba(79,70,229,0.35);">
                        <a href="${resetUrl}" style="display:inline-block;padding:15px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.2px;">
                          Reset My Password →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:28px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
                    Or paste this link in your browser:<br/>
                    <a href="${resetUrl}" style="color:#4f46e5;word-break:break-all;">${resetUrl}</a>
                  </p>
                  <p style="margin:20px 0 0;padding:16px;background:#fef3c7;border-radius:8px;color:#92400e;font-size:12.5px;line-height:1.6;">
                    ⚠️ If you didn't request a password reset, please ignore this email. Your account is safe.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px 28px;border-top:1px solid #f1f5f9;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:12px;">
                    Sent by <strong style="color:#64748b;">NDG Reports</strong> · Nashville Digital Group<br/>
                    This is an automated email — please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Bottom note -->
        <tr>
          <td style="padding:24px 0 0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">© 2026 Nashville Digital Group · All rights reserved</p>
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

export interface SendInviteEmailOptions {
  to: string;
  name: string;
  role: string;
  password: string;
  loginUrl: string;
}

export async function sendInviteEmail({
  to,
  name,
  role,
  password,
  loginUrl,
}: SendInviteEmailOptions) {
  const roleLabel =
    role === "ADMIN" ? "Administrator" : role === "TEAM" ? "Team Member" : "Client";

  const roleColor =
    role === "ADMIN" ? "#7c3aed" : role === "TEAM" ? "#0284c7" : "#059669";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to NDG Reports</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">

        <!-- Logo row -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;padding:10px 22px;">
                  <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:-0.3px;">NDG Reports</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main card -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

              <!-- Hero header -->
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:44px 40px 40px;text-align:center;">
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 20px;">
                    <tr>
                      <td style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;font-size:28px;">
                        👋
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.8px;line-height:1.2;">
                    Welcome to NDG Reports
                  </h1>
                  <p style="margin:0;color:#c7d2fe;font-size:14px;font-weight:500;">Nashville Digital Group · Analytics Platform</p>
                </td>
              </tr>

              <!-- Role badge row -->
              <tr>
                <td style="background:#312e81;padding:14px 40px;text-align:center;">
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                    <tr>
                      <td style="background:rgba(255,255,255,0.12);border-radius:999px;padding:5px 16px;">
                        <span style="color:#a5b4fc;font-size:12px;font-weight:600;">🎉 Your account is ready</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <p style="margin:0 0 6px;color:#64748b;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Hi ${name},</p>
                  <p style="margin:0 0 28px;color:#0f172a;font-size:16px;line-height:1.75;">
                    Your account on the <strong style="color:#4f46e5;">NDG Reports</strong> platform has been created.
                    Use the credentials below to log in and get started.
                  </p>

                  <!-- Credentials card -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                    style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:28px;">
                    <tr>
                      <td style="padding:24px 28px;">
                        <p style="margin:0 0 16px;color:#0f172a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">
                          Your Login Credentials
                        </p>

                        <!-- Email -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;">
                          <tr>
                            <td style="width:90px;color:#64748b;font-size:13px;font-weight:600;">Email</td>
                            <td style="color:#0f172a;font-size:14px;font-weight:500;">${to}</td>
                          </tr>
                        </table>

                        <!-- Password -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;">
                          <tr>
                            <td style="width:90px;color:#64748b;font-size:13px;font-weight:600;">Password</td>
                            <td>
                              <span style="display:inline-block;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:4px 12px;font-family:monospace;font-size:15px;font-weight:700;color:#4f46e5;letter-spacing:0.5px;">
                                ${password}
                              </span>
                            </td>
                          </tr>
                        </table>

                        <!-- Role -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="width:90px;color:#64748b;font-size:13px;font-weight:600;">Role</td>
                            <td>
                              <span style="display:inline-block;background:${roleColor}18;border:1px solid ${roleColor}40;border-radius:999px;padding:3px 12px;font-size:12px;font-weight:700;color:${roleColor};">
                                ${roleLabel}
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Warning -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
                    <tr>
                      <td style="background:#fef3c7;border-radius:10px;padding:14px 18px;">
                        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
                          ⚠️ <strong>Please change your password</strong> after your first login to keep your account secure.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA button -->
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:10px;box-shadow:0 4px 16px rgba(79,70,229,0.4);">
                        <a href="${loginUrl}"
                           style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:0.2px;">
                          Log In to NDG Reports →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:24px 0 0;color:#94a3b8;font-size:12.5px;line-height:1.6;">
                    Or copy this link into your browser:<br/>
                    <a href="${loginUrl}" style="color:#4f46e5;word-break:break-all;">${loginUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px 28px;border-top:1px solid #f1f5f9;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:12px;">
                    Sent by <strong style="color:#64748b;">NDG Reports</strong> · Nashville Digital Group<br/>
                    This is an automated email — please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Bottom note -->
        <tr>
          <td style="padding:24px 0 0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">© 2026 Nashville Digital Group · All rights reserved</p>
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
    subject: "You've been invited to NDG Reports 🎉",
    html,
  });
}

export async function sendReportReadyEmail({
  to,
  clientName,
  period,
  reportUrl,
  pdfBuffer,
  fileName,
}: SendReportEmailOptions) {
  const subject = `Your ${period} Marketing Report is Ready — ${clientName}`;
  const pdfName = fileName ?? `NDG-Report-${period.replace(/\s+/g, "-")}.pdf`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your ${period} Report is Ready</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;">

        <!-- Logo row -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;padding:10px 22px;">
                  <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:-0.3px;">NDG Reports</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main card -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <!-- Hero header -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#2563eb 100%);padding:44px 40px 40px;text-align:center;">
                  <!-- Chart icon area -->
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 20px;">
                    <tr>
                      <td style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:50%;width:64px;height:64px;text-align:center;vertical-align:middle;font-size:28px;">
                        📊
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.8px;line-height:1.2;">
                    Your ${period} Report<br/>is Ready
                  </h1>
                  <p style="margin:0;color:#c7d2fe;font-size:14px;font-weight:500;">${clientName}</p>
                </td>
              </tr>

              <!-- Pill tags row -->
              <tr>
                <td style="background:#312e81;padding:14px 40px;text-align:center;">
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                    <tr>
                      <td style="background:rgba(255,255,255,0.1);border-radius:999px;padding:5px 14px;margin-right:8px;">
                        <span style="color:#a5b4fc;font-size:12px;font-weight:600;">📅 ${period}</span>
                      </td>
                      <td style="width:12px;"></td>
                      <td style="background:rgba(255,255,255,0.1);border-radius:999px;padding:5px 14px;">
                        <span style="color:#a5b4fc;font-size:12px;font-weight:600;">✅ Published</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body content -->
              <tr>
                <td style="padding:40px 40px 32px;">

                  <p style="margin:0 0 6px;color:#64748b;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Hi there,</p>
                  <p style="margin:0 0 24px;color:#0f172a;font-size:16px;line-height:1.75;font-weight:400;">
                    Your monthly digital marketing performance report for
                    <strong style="color:#4f46e5;">${clientName}</strong> has been published
                    and is ready to view. Log in to your dashboard to explore your complete results.
                  </p>

                  <!-- What's inside -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:28px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="margin:0 0 14px;color:#0f172a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">What's in your report</p>
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="padding:6px 0;color:#475569;font-size:14px;">
                              <span style="display:inline-block;width:22px;text-align:center;">📱</span> Social Media Performance
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#475569;font-size:14px;">
                              <span style="display:inline-block;width:22px;text-align:center;">🌐</span> Website Analytics
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#475569;font-size:14px;">
                              <span style="display:inline-block;width:22px;text-align:center;">📍</span> Google My Business Insights
                            </td>
                          </tr>
                          ${pdfBuffer ? `<tr>
                            <td style="padding:10px 0 2px;color:#4f46e5;font-size:14px;font-weight:600;">
                              <span style="display:inline-block;width:22px;text-align:center;">📎</span> Full PDF report attached to this email
                            </td>
                          </tr>` : ""}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA button -->
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:10px;box-shadow:0 4px 16px rgba(79,70,229,0.4);">
                        <a href="${reportUrl}"
                           style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:0.2px;">
                          View My Report →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:24px 0 0;color:#94a3b8;font-size:12.5px;line-height:1.6;">
                    Or copy this link into your browser:<br/>
                    <a href="${reportUrl}" style="color:#4f46e5;word-break:break-all;">${reportUrl}</a>
                  </p>

                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding:0 40px;">
                  <div style="height:1px;background:#f1f5f9;"></div>
                </td>
              </tr>

              <!-- Footer inside card -->
              <tr>
                <td style="padding:24px 40px 28px;text-align:center;">
                  <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;line-height:1.6;">
                    Sent by <strong style="color:#64748b;">NDG Reports</strong> · Nashville Digital Group
                  </p>
                  <p style="margin:0;color:#cbd5e1;font-size:11px;">
                    This report is confidential and intended only for ${clientName}.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Bottom note -->
        <tr>
          <td style="padding:24px 0 0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">
              © 2026 Nashville Digital Group · All rights reserved
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const mailOptions: Parameters<typeof transporter.sendMail>[0] = {
    from: `"NDG Reports" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  if (pdfBuffer) {
    mailOptions.attachments = [
      {
        filename: pdfName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ];
  }

  await transporter.sendMail(mailOptions);
}
