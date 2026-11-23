"use client";

import { track } from "@vercel/analytics";
import { cleanEventProps, eventPath, isEventId, SESSION_COOKIE, VISITOR_COOKIE, type EventProps } from "./product-events-policy";
import { CLIENT_EVENTS } from "./product-event-catalog";

const QUEUE = "product_event_outbox_v1";
let sending = false;
type Pending = { id: string; name: string; properties: EventProps; path: string | null; occurredAt: string; isTest: boolean };
let memoryQueue: Pending[] = [];

export function isProductTest(): boolean {
  return typeof window !== "undefined" && (navigator.webdriver === true ||
    document.cookie.split(";").some((v) => v.trim() === "product_test=1"));
}

function browserId(key: string, maxAge: number): string {
  const current = document.cookie.split(";").map((s) => s.trim()).find((s) => s.startsWith(key + "="))?.slice(key.length + 1);
  const id = isEventId(current) ? current : crypto.randomUUID();
  document.cookie = `${key}=${id}; Path=/; Max-Age=${maxAge}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  return id;
}

function readQueue(): Pending[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(QUEUE) ?? "[]");
    if (Array.isArray(data)) return data.filter((e): e is Pending =>
      !!e && isEventId(e.id) && CLIENT_EVENTS.has(e.name) &&
      Number.isFinite(Date.parse(e.occurredAt)) && Date.parse(e.occurredAt) <= Date.now() + 300000 &&
      Date.now() - Date.parse(e.occurredAt) < 86400000).slice(-50);
  } catch { /* storage can be unavailable */ }
  return memoryQueue;
}

function saveQueue(events: Pending[]) {
  memoryQueue = events.slice(-50);
  try { localStorage.setItem(QUEUE, JSON.stringify(memoryQueue)); } catch { /* in-memory fallback */ }
}

export async function flushProductEvents(): Promise<void> {
  if (sending || typeof window === "undefined") return;
  const batch = readQueue().slice(0, 5);
  if (!batch.length) return;
  sending = true;
  let hasMore = false;
  try {
    const response = await fetch("/api/product-events", {
      method: "POST", headers: { "content-type": "application/json" },
      credentials: "same-origin", keepalive: true,
      body: JSON.stringify({ events: batch }),
    });
    if (response.ok) {
      const ids = new Set(batch.map((e) => e.id));
      saveQueue(readQueue().filter((e) => !ids.has(e.id)));
      hasMore = readQueue().length > 0;
    }
  } catch { /* retain the same event IDs for the next attempt */ }
  finally { sending = false; }
  if (hasMore) void flushProductEvents();
}

/** Calls Vercel once and independently queues the same event for durable ingestion. */
export function trackProductAction(name: string, props: unknown = {}, options?: Parameters<typeof track>[2]): void {
  if (typeof window === "undefined") return;
  if (!CLIENT_EVENTS.has(name)) return;
  try {
    browserId(VISITOR_COOKIE, 15552000);
    browserId(SESSION_COOKIE, 1800);
    const event: Pending = { id: crypto.randomUUID(), name, properties: cleanEventProps(props),
      path: eventPath(location.pathname), occurredAt: new Date().toISOString(), isTest: isProductTest() };
    try { if (!event.isTest) track(name, { ...event.properties, event_id: event.id }, options); } catch { /* independent sink */ }
    saveQueue([...readQueue(), event]);
    void flushProductEvents();
  } catch { /* telemetry never breaks an action */ }
}

/** Initialize cookies before server mutations and retry queued events on reconnect. */
export function startProductEvents(): () => void {
  if (navigator.webdriver === true) document.cookie = `product_test=1; Path=/; Max-Age=1800; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  browserId(VISITOR_COOKIE, 15552000);
  browserId(SESSION_COOKIE, 1800);
  void flushProductEvents();
  const retry = () => { void flushProductEvents(); };
  window.addEventListener("online", retry);
  document.addEventListener("visibilitychange", retry);
  return () => {
    window.removeEventListener("online", retry);
    document.removeEventListener("visibilitychange", retry);
  };
}
