import type { EventContext, StoredProductEvent } from "./product-events-policy";

const PUBLIC_ORIGIN = "https://reportraven.tech";

/** Vercel's event transport, with a sanitized URL and an observable HTTP result.
 * The SDK's server transport uses the full request-context URL and swallows HTTP
 * failures. Form tokens, query strings and private headers must not be forwarded.
 */
export async function sendVercelProductEvent(event: StoredProductEvent, context: EventContext): Promise<void> {
  const endpoint = process.env.VERCEL_WEB_ANALYTICS_ENDPOINT ?? `${PUBLIC_ORIGIN}/_vercel/insights/event`;
  const h = context.detached ? undefined : context.headers;
  const headers: Record<string, string> = { "content-type": "application/json", "x-va-server": "1" };
  headers["user-agent"] = h?.get("user-agent") ?? "ProductEvents/1.0";
  const ip = h?.get("x-vercel-forwarded-for") ?? h?.get("x-forwarded-for");
  if (ip) headers["x-vercel-ip"] = ip.split(",")[0].trim();
  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) headers["x-vercel-protection-bypass"] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const response = await fetch(endpoint, {
    method: "POST", headers, signal: AbortSignal.timeout(5000),
    body: JSON.stringify({
      o: PUBLIC_ORIGIN + (event.path ?? "/"), ts: event.occurredAt.getTime(), r: "",
      sdkn: "@vercel/analytics/server", sdkv: "2.0.1", en: event.name,
      ed: { ...event.properties, event_id: event.id },
      ...(context.flags ? { f: { p: context.flags } } : {}),
    }),
  });
  if (!response.ok) throw new Error(`Vercel event endpoint returned ${response.status}`);
}
