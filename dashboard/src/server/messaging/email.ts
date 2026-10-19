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
  /** Overrides EMAIL_FROM, e.g. a named founder address for lead follow-ups. */
  from?: string;
  replyTo?: string;
  /** Extra MIME headers, e.g. List-Unsubscribe for newsletter issues. */
  headers?: Record<string, string>;
}

function toResend(msg: EmailMessage) {
  return {
    from: msg.from ?? EMAIL_FROM,
    to: Array.isArray(msg.to) ? msg.to : [msg.to],
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    reply_to: msg.replyTo,
    headers: msg.headers,
  };
}

function resendHeaders() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
}

/** Sends up to 100 emails in one Resend batch call. */
export async function sendEmailBatch(msgs: EmailMessage[]): Promise<void> {
  if (msgs.length === 0) return;
  if (msgs.length > 100) throw new Error('Resend batches are limited to 100 emails');
  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: resendHeaders(),
    body: JSON.stringify(msgs.map(toResend)),
  });
  if (!res.ok) {
    throw new Error(`Resend batch failed: ${res.status} ${await res.text()}`);
  }
}

/** Sends an email and returns the provider message id. */
export async function sendEmail(msg: EmailMessage): Promise<string | undefined> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: resendHeaders(),
    body: JSON.stringify(toResend(msg)),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { id?: string };
  return body.id;
}
