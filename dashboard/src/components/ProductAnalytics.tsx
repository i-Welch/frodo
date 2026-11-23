"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import type { ComponentProps } from "react";
import { isProductTest } from "@/lib/product-events-client";
import { eventPath } from "@/lib/product-events-policy";

/** Keep explicit QA sessions out of pageviews as well as custom-event totals. */
export function Analytics(props: ComponentProps<typeof VercelAnalytics>) {
  return <VercelAnalytics {...props} beforeSend={(event) => {
    if (isProductTest()) return null;
    let url: string;
    try {
      const parsed = new URL(event.url);
      const clean = new URL(eventPath(parsed.pathname) ?? "/", parsed.origin);
      for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
        const value = parsed.searchParams.get(key);
        if (value && /^[a-zA-Z0-9_./: -]{1,120}$/.test(value)) clean.searchParams.set(key,value);
      }
      url = clean.toString();
    } catch { url = eventPath(event.url) ?? "/"; }
    const cleanEvent = { ...event, url };
    return props.beforeSend ? props.beforeSend(cleanEvent) : cleanEvent;
  }} />;
}
