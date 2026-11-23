import { headers } from "next/headers";
import { sendVercelProductEvent } from "./product-events-transport";
import { appendProductEvent, markProductEventSent } from "./product-events-store";
import { cleanEventProps, deliverProductEvent, eventCookie, eventPath, isEventId, makeProductEvent,
  SESSION_COOKIE, VISITOR_COOKIE, type EventContext } from "./product-events-policy";
import { isTestSubmission } from "./product-events-policy";

import { CLIENT_EVENTS } from "./product-event-catalog";
const rate = new Map<string, { until: number; count: number }>();

if (process.env.VERCEL_ENV === "production" && !process.env.VERCEL_WEB_ANALYTICS_ENDPOINT) {
  process.env.VERCEL_WEB_ANALYTICS_ENDPOINT = "https://reportraven.tech" + "/_vercel/insights/event";
}

export async function recordProductEvent(name: string, props: unknown = {}, context: EventContext = {}) {
  let h = context.headers;
  if (!h && !context.detached) {
    try { h = new Headers(await headers()); } catch { /* worker or detached event */ }
  }
  const values = props && typeof props === "object" ? props as Record<string, unknown> : {};
  const link = (...keys: string[]) => keys.map((key) => values[key]).find((value): value is string => typeof value === "string");
  const event = makeProductEvent(name, props, { ...context, headers: h,
    actorId: context.actorId ?? link("user_id", "userId", "actor_id"),
    accountId: context.accountId ?? link("account_id", "accountId", "company_id", "companyId", "org_id", "orgId"),
    leadId: context.leadId ?? link("lead_id", "leadId"),
    isTest: context.isTest === true || isTestSubmission({
      email: link("email"), name: link("name"), source: link("source"), utmSource: link("utm_source"),
    }),
  });
  if (!process.env.VERCEL || event.isTest) {
    try { await appendProductEvent(event); return { persisted: true, duplicate: false, sent: false, id: event.id }; }
    catch { return { persisted: false, duplicate: false, sent: false, id: event.id }; }
  }
  return deliverProductEvent(event, {
    append: appendProductEvent, markSent: markProductEventSent,
    send: (item) => sendVercelProductEvent(item, { ...context, headers: h }),
    warn: (sink) => console.warn(`[product-events] ${name}: ${sink} delivery failed`),
  });
}

/** Browser actions are untrusted and cannot claim a lead, actor or account ID. */
export async function ingestProductEvents(request: Request): Promise<Response> {
  return ingestProductEventsWithStore(request, appendProductEvent);
}

export async function ingestProductEventsWithStore(request: Request, append: typeof appendProductEvent): Promise<Response> {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return Response.json({ ok: false }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return Response.json({ ok: false }, { status: 415 });
  if (Number(request.headers.get("content-length") ?? "0") > 16384) return Response.json({ ok: false }, { status: 413 });
  const key = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  if (rate.size > 10000) for (const [k, value] of rate) if (value.until <= now) rate.delete(k);
  if (rate.size >= 10000 && !rate.has(key)) return Response.json({ ok: false }, { status: 429 });
  const bucket = rate.get(key);
  if (bucket && bucket.until > now && bucket.count >= 60) return Response.json({ ok: false }, { status: 429 });
  rate.set(key, bucket && bucket.until > now ? { ...bucket, count: bucket.count + 1 } : { until: now + 60000, count: 1 });
  let data: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 16384) return Response.json({ ok: false }, { status: 413 });
    data = JSON.parse(raw);
  } catch { return Response.json({ ok: false }, { status: 400 }); }
  const events = data && typeof data === "object" && "events" in data ? data.events : null;
  if (!Array.isArray(events) || events.length < 1 || events.length > 5) return Response.json({ ok: false }, { status: 400 });
  for (const event of events) {
    if (!event || !isEventId(event.id) || !CLIENT_EVENTS.has(event.name) ||
        typeof event.occurredAt !== "string" || !Number.isFinite(Date.parse(event.occurredAt)) ||
        Date.parse(event.occurredAt) > now + 300000 || Date.parse(event.occurredAt) < now - 86400000) {
      return Response.json({ ok: false }, { status: 400 });
    }
  }
  try {
    for (const item of events) {
      const event = makeProductEvent(item.name, cleanEventProps(item.properties), { id: item.id });
      await append({ ...event, origin: "client", path: eventPath(item.path),
        isTest: item.isTest === true || request.headers.get("x-product-test") === "1" ||
          request.headers.get("cookie")?.split(";").some((part) => part.trim() === "product_test=1") === true,
        visitorId: eventCookie(request.headers, VISITOR_COOKIE),
        sessionId: eventCookie(request.headers, SESSION_COOKIE), occurredAt: new Date(item.occurredAt) });
    }
    return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch {
    console.warn("[product-events] client batch could not be persisted");
    return Response.json({ ok: false }, { status: 503 });
  }
}
