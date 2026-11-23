"use client";

import { useEffect } from "react";
import { startProductEvents, trackProductAction } from "@/lib/product-events-client";
import { eventPath } from "@/lib/product-events-policy";

/** Intent signals only: successful business milestones are recorded by the server. */
export function ProductMilestones() {
  useEffect(() => {
    let stop: (() => void) | undefined;
    try { stop = startProductEvents(); } catch { /* storage may be disabled */ }
    const started = new WeakSet<HTMLFormElement>();
    const onInput = (event: Event) => {
      const form = event.target instanceof Element ? event.target.closest("form") : null;
      if (!form || started.has(form)) return;
      started.add(form);
      trackProductAction("form_started", { form: form.id || "page-form" });
    };
    const onSubmit = () => trackProductAction("form_submitted");
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      const href = link?.getAttribute("href");
      if (!href?.startsWith("/") || href.startsWith("//") || !/(sign-up|signup|contact|pilot|design-partner|checkout|pricing|subscribe|demo|assessment)/.test(href)) return;
      trackProductAction("cta_clicked", { target: eventPath(href) });
    };
    document.addEventListener("input", onInput, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("click", onClick, true);
    return () => {
      stop?.();
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return null;
}
