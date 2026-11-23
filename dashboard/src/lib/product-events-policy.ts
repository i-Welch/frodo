/** Shared event contract. Never pass form contents, uploads, secrets or health values. */
export type EventProps = Record<string, string | number | boolean | null>;
export const VISITOR_COOKIE = "product_visitor";
export const SESSION_COOKIE = "product_session";
export const isEventId = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const PROPERTY_KEYS = new Set([
  "source", "src", "kind", "type", "tool", "stage", "step", "status", "plan", "product", "mode",
  "format", "count", "rows", "row_count", "valid_rows", "invalid_rows", "bucket", "size_bucket",
  "duration_bucket", "result", "success", "placement", "location", "variant", "action", "method",
  "channel", "provider", "state", "states_count", "field_count", "record_count", "form", "target", "medium",
  "cta", "pct", "compliant", "all_states", "sample", "preset", "version", "currency",
  "utm_source", "utm_medium", "utm_campaign", "reason_code", "error_code",
]);

export function cleanEventProps(input: unknown): EventProps {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const result: EventProps = {};
  for (const [key, value] of Object.entries(input)) {
    // Preserve purchase amounts only alongside an explicit currency; generic
    // form/health/loan values are outside the analytics contract.
    if (key === "value" && typeof value === "number" && Number.isFinite(value) &&
        typeof (input as Record<string, unknown>).currency === "string" &&
        /^[A-Za-z]{3}$/.test((input as Record<string, string>).currency)) {
      result.value = value;
      continue;
    }
    if (!PROPERTY_KEYS.has(key) || Object.keys(result).length >= 20) continue;
    if (typeof value === "number" && Number.isFinite(value)) result[key] = value;
    else if (typeof value === "boolean" || value === null) result[key] = value;
    else if (typeof value === "string" && value.length <= 120 && /^[a-zA-Z0-9_./: -]*$/.test(value)) {
      result[key] = value;
    }
  }
  return result;
}

export function eventPath(input: unknown): string | null {
  if (typeof input !== "string" || !input.startsWith("/") || input.startsWith("//")) return null;
  return input.split(/[?#]/, 1)[0].slice(0, 200).split("/").map((part) => {
    if (part.length > 40 || /%|@/.test(part) || /^\d+$/.test(part) || isEventId(part)) return "[id]";
    return /^[a-zA-Z0-9_.~-]*$/.test(part) ? part : "[id]";
  }).join("/");
}

export function eventCookie(headers: Headers | undefined, key: string): string | null {
  const value = headers?.get("cookie")?.split(";").map((s) => s.trim()).find((s) => s.startsWith(key + "="))?.slice(key.length + 1);
  return isEventId(value) ? value : null;
}

export interface StoredProductEvent {
  id: string;
  name: string;
  eventKey: string | null;
  origin: "client" | "server";
  visitorId: string | null;
  sessionId: string | null;
  actorId: string | null;
  accountId: string | null;
  leadId: string | null;
  objectType: string | null;
  objectId: string | null;
  path: string | null;
  properties: EventProps;
  environment: string;
  occurredAt: Date;
  isTest: boolean;
}

export interface EventContext {
  headers?: Headers;
  id?: string;
  eventKey?: string;
  actorId?: string;
  accountId?: string;
  leadId?: string;
  objectType?: string;
  objectId?: string;
  path?: string;
  detached?: boolean;
  flags?: Record<string, unknown>;
  isTest?: boolean;
}

export function makeProductEvent(name: string, props: unknown, context: EventContext = {}): StoredProductEvent {
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(name)) throw new Error("Invalid product event name");
  const h = context.detached ? undefined : context.headers;
  return {
    id: isEventId(context.id) ? context.id : crypto.randomUUID(), name,
    eventKey: context.eventKey?.slice(0, 200) ?? null, origin: "server",
    visitorId: eventCookie(h, VISITOR_COOKIE), sessionId: eventCookie(h, SESSION_COOKIE),
    actorId: context.actorId?.slice(0, 200) ?? null,
    accountId: context.accountId?.slice(0, 200) ?? null,
    leadId: context.leadId?.slice(0, 200) ?? null,
    objectType: context.objectType?.slice(0, 80) ?? null,
    objectId: context.objectId?.slice(0, 200) ?? null,
    path: eventPath(context.path), properties: cleanEventProps(props),
    environment: process.env.VERCEL_ENV ?? "development", occurredAt: new Date(),
    isTest: context.isTest === true || context.headers?.get("x-product-test") === "1" ||
      context.headers?.get("cookie")?.split(";").some((part) => part.trim() === "product_test=1") === true,
  };
}

/** Classify explicit test markers without storing these contact fields in event properties. */
export function isTestSubmission(input: { email?: string | null; name?: string | null; source?: string | null; utmSource?: string | null }): boolean {
  const email = (input.email ?? "").trim().toLowerCase();
  return /@(example\.(com|org|net)|test\.(com|local)|localhost|invalid\.local)$/.test(email) ||
    /^(test|qa|e2e|smoke)([+._-]|[0-9])/.test(email) ||
    /(^|[\s_-])(test|e2e|smoke|selftest)([\s_-]|$)/i.test(input.name ?? "") ||
    /(^|[:/_ -])(e2e|e2e-test|selftest|self-test|smoke|pipeline-check|deploy-check|doorbell-check|rename-check|handoff-verification)([:/_ -]|$)/i.test(input.source ?? "") ||
    /^(selftest|self-test|e2e|smoke|deploy-check|test)$/i.test(input.utmSource ?? "");
}

/** A database outage must not prevent the independent Vercel delivery attempt. */
export async function deliverProductEvent(event: StoredProductEvent, deps: {
  append: (event: StoredProductEvent) => Promise<boolean>;
  send: (event: StoredProductEvent) => Promise<void>;
  markSent: (id: string) => Promise<void>;
  warn: (sink: string) => void;
}) {
  let persisted = false;
  try {
    const inserted = await deps.append(event);
    if (!inserted) return { persisted: true, duplicate: true, sent: false, id: event.id };
    persisted = true;
  } catch { deps.warn("database"); }
  let sent = false;
  try { await deps.send(event); sent = true; } catch { deps.warn("vercel"); }
  if (persisted && sent) {
    try { await deps.markSent(event.id); } catch { deps.warn("delivery-status"); }
  }
  return { persisted, duplicate: false, sent, id: event.id };
}
