// Client for the free-audit request queue (/api/v1/admin/audit-requests).
// Used by the /audit-request command and by auto-publish.ts, which emails the
// requester once their /audit/<slug> page is live.
//
// Credentials live outside the repo in %USERPROFILE%\.raven\automation.env:
//   RAVEN_AUTOMATION_SECRET=...           (matches the Vercel env var)
//   RAVEN_SITE=https://reportraven.tech   (optional)
//
// Usage:
//   bun automation/audit-requests.ts list [pending|in_progress|delivered|declined]
//   bun automation/audit-requests.ts claim <id> <audit-slug> "<Institution Name>"
//   bun automation/audit-requests.ts deliver <id>
//   bun automation/audit-requests.ts decline <id> "<reason>"

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ENV_FILE = join(homedir(), '.raven', 'automation.env');

export type AuditStatus = 'pending' | 'in_progress' | 'delivered' | 'declined';

export interface AuditRequest {
  id: string;
  name?: string;
  email: string;
  bank?: string;
  source?: string;
  status: AuditStatus;
  auditSlug?: string;
  institutionName?: string;
  requestedAt: string;
}

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

export function auditQueueReady(): boolean {
  return loadEnv() !== null;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const env = loadEnv();
  if (!env) throw new Error(`missing ${ENV_FILE} (RAVEN_AUTOMATION_SECRET)`);
  const res = await fetch(`${siteUrl()}/api/v1/admin/audit-requests${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.RAVEN_AUTOMATION_SECRET}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`audit-requests ${path || '/'} ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function listAuditRequests(status: AuditStatus = 'pending'): Promise<AuditRequest[]> {
  return (await api<{ requests: AuditRequest[] }>(`?status=${status}`)).requests;
}

export async function setAuditStatus(body: {
  id: string;
  status: AuditStatus;
  auditSlug?: string;
  institutionName?: string;
  note?: string;
}): Promise<{ ok: boolean; alreadyDelivered?: boolean }> {
  return api('/status', { method: 'POST', body: JSON.stringify(body) });
}

if (import.meta.main) {
  const [cmd, id, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case 'list':
      console.log(JSON.stringify(await listAuditRequests((id as AuditStatus) ?? 'pending'), null, 2));
      break;
    case 'claim':
      if (!id || !rest[0] || !rest[1]) throw new Error('usage: claim <id> <audit-slug> "<Institution Name>"');
      console.log(await setAuditStatus({ id, status: 'in_progress', auditSlug: rest[0], institutionName: rest[1] }));
      break;
    case 'deliver':
      if (!id) throw new Error('usage: deliver <id>');
      console.log(await setAuditStatus({ id, status: 'delivered' }));
      break;
    case 'decline':
      if (!id || !rest[0]) throw new Error('usage: decline <id> "<reason>"');
      console.log(await setAuditStatus({ id, status: 'declined', note: rest[0] }));
      break;
    default:
      console.error('usage: bun automation/audit-requests.ts list|claim|deliver|decline ...');
      process.exit(1);
  }
}
