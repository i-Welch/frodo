/**
 * Transactional email via Resend's HTTP API (no SDK dependency).
 *
 * Env vars:
 * - RESEND_API_KEY
 * - EMAIL_FROM (default: noreply@reportraven.tech)
 */
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@reportraven.tech';

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

/** Sends an email and returns the provider message id. */
export async function sendEmail(msg: EmailMessage): Promise<string | undefined> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: Array.isArray(msg.to) ? msg.to : [msg.to],
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { id?: string };
  return body.id;
}
