// Client for the free-audit request queue (/api/v1/admin/audit-requests).
// Used by the /audit-request command and by auto-publish.ts, which emails the
// requester once their /audit/<slug> page is live.
//
// Credentials: see raven-api.ts.
//
// Usage:
//   bun automation/audit-requests.ts list [pending|in_progress|delivered|declined]
//   bun automation/audit-requests.ts claim <id> <audit-slug> "<Institution Name>"
//   bun automation/audit-requests.ts deliver <id>
//   bun automation/audit-requests.ts decline <id> "<reason>"

import { ravenApi, ravenApiReady } from './raven-api';

export { siteUrl } from './raven-api';

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

export const auditQueueReady = ravenApiReady;

function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  return ravenApi<T>(`/audit-requests${path}`, init);
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
