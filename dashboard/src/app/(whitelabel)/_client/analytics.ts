import { track } from '@vercel/analytics';

type Val = string | number | boolean | null | undefined;

/**
 * White-label product analytics. Thin wrapper over Vercel Analytics `track`:
 * drops `undefined` values (track rejects them) and namespaces every event with
 * a `wl_` prefix at the call site.
 *
 * PRIVACY: never pass borrower PII (names, emails, phone, SSNs). Only structural
 * dimensions, slug, flow, product id/type, counts, status, are allowed.
 */
export function wlTrack(event: string, props: Record<string, Val> = {}): void {
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v !== undefined) clean[k] = v;
  }
  track(event, clean);
}
