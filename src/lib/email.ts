import { Resend } from "resend";
import nodemailer from "nodemailer";

export interface TestReminderEmailPayload {
  to: string;
  recipientName: string;
  roomName: string;
  roomCode: string;
  testTitle: string;
  questionCount: number;
  durationMinutes: number;
  scheduledAt: Date;
  hostName: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

/**
 * Builds the responsive HTML email template for 15-minute test reminders.
 */
function buildReminderHtml({
  recipientName,
  roomName,
  roomCode,
  testTitle,
  questionCount,
  durationMinutes,
  scheduledAt,
  hostName,
}: TestReminderEmailPayload): string {
  const roomUrl = `${getBaseUrl()}/dashboard/room/${roomCode}`;
  const formattedTime = scheduledAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const formattedDate = scheduledAt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEET CBT Test Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #27272a;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 8px;">
                      NEET CBT • Room Test
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      ⏰ Test Starts in 15 Minutes!
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #d4d4d8; line-height: 1.6;">
                Hi <strong>${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
                Your group mock test in <strong>${roomName}</strong> is scheduled to begin in <strong>15 minutes</strong>. Get ready and enter the waiting lobby now so you don't miss the test timer!
              </p>

              <!-- Test Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      Scheduled Test
                    </div>
                    <div style="font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 14px;">
                      ${testTitle}
                    </div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="padding: 6px 0; font-size: 13px; color: #71717a;">
                          📅 Date: <strong style="color: #e4e4e7;">${formattedDate}</strong>
                        </td>
                        <td width="50%" style="padding: 6px 0; font-size: 13px; color: #71717a;">
                          ⏱️ Time: <strong style="color: #10b981;">${formattedTime}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 6px 0; font-size: 13px; color: #71717a;">
                          📝 Questions: <strong style="color: #e4e4e7;">${questionCount} Qs</strong>
                        </td>
                        <td width="50%" style="padding: 6px 0; font-size: 13px; color: #71717a;">
                          ⏳ Duration: <strong style="color: #e4e4e7;">${durationMinutes} Mins</strong>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 6px 0; font-size: 13px; color: #71717a;">
                          👑 Room Host: <strong style="color: #e4e4e7;">${hostName}</strong> (Code: <code style="background-color: #27272a; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${roomCode}</code>)
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${roomUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; text-align: center; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.4);">
                      🚀 Enter Test Room Lobby
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5; text-align: center;">
                Direct link: <a href="${roomUrl}" style="color: #818cf8; text-decoration: underline;">${roomUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #71717a;">
                Solvd NEET CBT • Smart AI Practice for Future Doctors
              </p>
              <p style="margin: 0; font-size: 10px; color: #52525b;">
                You received this email because you are a member of "${roomName}".
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
}

/**
 * Dispatches a reminder email using Resend, Nodemailer SMTP, or dev simulation.
 */
export async function sendRoomTestReminderEmail(
  payload: TestReminderEmailPayload
): Promise<SendEmailResult> {
  const subject = `⏰ Exam Reminder: "${payload.testTitle}" starts in 15 minutes (${payload.roomName})`;
  const html = buildReminderHtml(payload);

  // 1. Check if Resend is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.EMAIL_FROM || "NEET CBT Alerts <onboarding@resend.dev>";
      const result = await resend.emails.send({
        from: fromEmail,
        to: payload.to,
        subject,
        html,
      });

      if (result.error) {
        console.error("[Email Error - Resend]", result.error);
        return { success: false, error: result.error.message };
      }

      console.log(`[Email Sent - Resend] To: ${payload.to} | ID: ${result.data?.id}`);
      return { success: true, messageId: result.data?.id };
    } catch (err) {
      console.error("[Email Exception - Resend]", err);
      return { success: false, error: err instanceof Error ? err.message : "Resend delivery failed" };
    }
  }

  // 2. Check if SMTP / Gmail App Password is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"NEET CBT Room Alerts" <${process.env.SMTP_USER}>`,
        to: payload.to,
        subject,
        html,
      });

      console.log(`[Email Sent - SMTP] To: ${payload.to} | ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("[Email Exception - SMTP]", err);
      return { success: false, error: err instanceof Error ? err.message : "SMTP delivery failed" };
    }
  }

  // 3. Fallback: Development Log Simulation
  console.log("--------------------------------------------------");
  console.log("📨 [EMAIL REMINDER SIMULATED]");
  console.log(`To: ${payload.to} (${payload.recipientName})`);
  console.log(`Subject: ${subject}`);
  console.log(`Room: ${payload.roomName} (${payload.roomCode})`);
  console.log(`Scheduled At: ${payload.scheduledAt.toISOString()}`);
  console.log(`(To send live emails, set RESEND_API_KEY or SMTP_USER & SMTP_PASS in .env)`);
  console.log("--------------------------------------------------");

  return { success: true, simulated: true };
}
