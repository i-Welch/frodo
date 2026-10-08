/**
 * Transactional SMS via Telnyx's REST API (JSON; no SDK dependency).
 *
 * Env vars:
 * - TELNYX_API_KEY
 * - TELNYX_FROM_NUMBER (E.164 sender), and/or TELNYX_MESSAGING_PROFILE_ID
 */
export async function sendSms(to: string, text: string): Promise<string | undefined> {
  const apiKey = process.env.TELNYX_API_KEY;
  const from = process.env.TELNYX_FROM_NUMBER;
  const profile = process.env.TELNYX_MESSAGING_PROFILE_ID;
  if (!apiKey) throw new Error('TELNYX_API_KEY is not set');
  if (!from && !profile) {
    throw new Error('Set TELNYX_FROM_NUMBER or TELNYX_MESSAGING_PROFILE_ID');
  }

  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      text,
      ...(from ? { from } : {}),
      ...(profile ? { messaging_profile_id: profile } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`Telnyx send failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: { id?: string } };
  return json.data?.id;
}
