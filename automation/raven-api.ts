// Authenticated client for the RAVEN admin API, shared by the PC automation.
//
// Credentials live outside the repo in %USERPROFILE%\.raven\automation.env:
//   RAVEN_AUTOMATION_SECRET=...           (matches the Vercel env var)
//   RAVEN_SITE=https://reportraven.tech   (optional)
//   RAVEN_FIREWALL_BYPASS=...             (matches the "Allow RAVEN automation" Vercel
//                                          firewall rule; without it Bot Protection
//                                          answers every request with a 429 challenge)

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ENV_FILE = join(homedir(), '.raven', 'automation.env');

function loadEnv(): Record<string, string> | null {
  if (!existsSync(ENV_FILE)) return null;
  const env = Object.fromEntries(
    readFileSync(ENV_FILE, 'utf8')
      .replace(/^﻿/, '')
      .split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  );
  return env.RAVEN_AUTOMATION_SECRET ? env : null;
}

export function siteUrl(): string {
  return (loadEnv()?.RAVEN_SITE ?? 'https://reportraven.tech').replace(/\/$/, '');
}

/** Headers for every request to the site, so Vercel Bot Protection lets the automation through. */
export function siteHeaders(): Record<string, string> {
  const token = loadEnv()?.RAVEN_FIREWALL_BYPASS;
  return token ? { 'x-raven-automation': token } : {};
}

export function ravenApiReady(): boolean {
  return loadEnv() !== null;
}

/** Calls `${site}/api/v1/admin${path}` with the automation secret; throws on non-2xx. */
export async function ravenApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const env = loadEnv();
  if (!env) throw new Error(`missing ${ENV_FILE} (RAVEN_AUTOMATION_SECRET)`);
  const res = await fetch(`${siteUrl()}/api/v1/admin${path}`, {
    ...init,
    headers: {
      ...siteHeaders(),
      Authorization: `Bearer ${env.RAVEN_AUTOMATION_SECRET}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`admin${path} ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
