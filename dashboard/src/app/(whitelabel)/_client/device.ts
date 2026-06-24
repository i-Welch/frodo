/**
 * A persistent, non-secret per-device identifier kept in localStorage.
 *
 * Used to bind a verification link to the device that first opens it: the same
 * device can resume the link within its TTL (e.g. open it, close it to check
 * something, come back a few minutes later), while a forwarded link on another
 * device is locked out. It identifies a device, it is not a credential and
 * carries no PII.
 */
const KEY = 'raven_device_id';

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-no-device';
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id =
        window.crypto?.randomUUID?.() ??
        `dev-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Private mode / storage disabled: a fresh id each call means the link
    // behaves as single-open (no resume), which is the safe degradation.
    return `dev-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
}
