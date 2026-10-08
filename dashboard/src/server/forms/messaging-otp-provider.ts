import { createChildLogger } from '../logger';
import { sendEmail } from '../messaging/email';
import { sendSms } from '../messaging/sms';
import type { OtpProvider } from './otp-provider';

const log = createChildLogger({ module: 'messaging-otp-provider' });

/**
 * Production OTP provider using Resend (email) and Telnyx (SMS).
 *
 * Env vars: RESEND_API_KEY, EMAIL_FROM, TELNYX_API_KEY, TELNYX_FROM_NUMBER |
 * TELNYX_MESSAGING_PROFILE_ID.
 */
export class MessagingOtpProvider implements OtpProvider {
  async sendOtp(channel: 'email' | 'phone', destination: string, code: string): Promise<void> {
    if (channel === 'email') {
      const messageId = await sendEmail({
        to: destination,
        subject: `${code} is your RAVEN verification code`,
        html: buildEmailHtml(code),
        text: `Your RAVEN verification code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, please ignore this email.`,
      });
      log.info({ email: maskEmail(destination), messageId }, 'OTP email sent');
    } else {
      const messageId = await sendSms(
        destination,
        `Your RAVEN verification code is: ${code}. Expires in 10 minutes.`,
      );
      log.info({ phone: maskPhone(destination), messageId }, 'OTP SMS sent');
    }
  }
}

// ---------------------------------------------------------------------------
// Email template
// ---------------------------------------------------------------------------

function buildEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;border:1px solid #e5e5e5;overflow:hidden;">
        <tr>
          <td style="background:#0a0a0a;padding:16px 24px;">
            <span style="color:#fff;font-size:14px;font-weight:600;letter-spacing:0.12em;">RAVEN</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 24px;">
            <h1 style="margin:0 0 8px;font-size:20px;color:#0a0a0a;">Verification Code</h1>
            <p style="margin:0 0 24px;color:#525252;font-size:14px;line-height:1.5;">Enter this code to verify your identity. It expires in 10 minutes.</p>
            <div style="background:#fafafa;border:2px solid #e5e5e5;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
              <span style="font-family:'SF Mono','Fira Code',monospace;font-size:32px;font-weight:600;letter-spacing:0.3em;color:#0a0a0a;">${code}</span>
            </div>
            <p style="margin:0;color:#a3a3a3;font-size:12px;line-height:1.5;">If you didn't request this code, please ignore this email. Your account is safe.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;border-top:1px solid #e5e5e5;">
            <p style="margin:0;color:#a3a3a3;font-size:11px;">Secured by RAVEN &middot; reportraven.tech</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// PII masking for logs
// ---------------------------------------------------------------------------

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local[0]}***@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return '***';
  return `***${phone.slice(-4)}`;
}
