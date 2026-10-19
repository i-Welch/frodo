import { Elysia, t } from 'elysia';
import { getItem, queryItems, updateItem } from '../../store/base-store';
import { deliverAudit } from '../../messaging/leads';
import { createChildLogger } from '../../logger';

const log = createChildLogger({ module: 'leads-admin' });

/**
 * Admin auth middleware — verifies Authorization: Bearer <secret>, where the
 * secret is RAVEN_ADMIN_SECRET or RAVEN_AUTOMATION_SECRET (the narrower key
 * the PC automation holds, so it never needs the full admin secret).
 */
export function adminAuth(headers: Record<string, string | undefined>, set: { status?: number | string }) {
  const secrets = [process.env.RAVEN_ADMIN_SECRET, process.env.RAVEN_AUTOMATION_SECRET]
    .map((s) => s?.trim())
    .filter(Boolean);
  if (secrets.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      set.status = 503;
      return { error: 'RAVEN_ADMIN_SECRET is not configured' } as const;
    }
    // Allow in non-production without secret
    return null;
  }

  const authHeader = headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401;
    return { error: 'Missing or invalid Authorization header' } as const;
  }

  if (!secrets.includes(authHeader.slice(7))) {
    set.status = 401;
    return { error: 'Invalid admin secret' } as const;
  }

  return null;
}

const STATUSES = ['pending', 'in_progress', 'delivered', 'declined'] as const;

/**
 * Admin routes the article automation uses to fulfill free audit requests:
 * list requests by status, and move a request along. Marking a request
 * delivered emails the requester their audit link.
 */
export const leadsAdminRoutes = new Elysia({ prefix: '/api/v1/admin/audit-requests' })
  .onBeforeHandle(({ headers, set }) => {
    const result = adminAuth(headers as Record<string, string | undefined>, set);
    if (result) return result;
  })
  .get(
    '/',
    async ({ query }) => {
      const { items } = await queryItems({ pk: 'INTEREST', skPrefix: 'SIGNUP#', scanForward: true, limit: 500 });
      const wanted = query.status ?? 'pending';
      const requests = items
        .filter((i) => i.kind === 'audit' && (i.status ?? 'pending') === wanted)
        .map((i) => ({
          id: i.SK as string,
          name: i.name as string | undefined,
          email: i.email as string,
          bank: i.bank as string | undefined,
          source: i.source as string | undefined,
          status: (i.status as string | undefined) ?? 'pending',
          auditSlug: i.auditSlug as string | undefined,
          institutionName: i.institutionName as string | undefined,
          requestedAt: i.timestamp as string,
        }));
      return { requests };
    },
    { query: t.Object({ status: t.Optional(t.Union(STATUSES.map((s) => t.Literal(s)))) }) },
  )
  .post(
    '/status',
    async ({ body, set }) => {
      const key = { PK: 'INTEREST', SK: body.id };
      const item = await getItem(key);
      if (!item || item.kind !== 'audit') {
        set.status = 404;
        return { error: 'Audit request not found' };
      }
      if (item.status === 'delivered' && body.status === 'delivered') {
        return { ok: true, alreadyDelivered: true };
      }

      // Delivery can reuse the slug and name recorded when the request was claimed.
      const auditSlug = body.auditSlug ?? (item.auditSlug as string | undefined);
      const institutionName = body.institutionName ?? (item.institutionName as string | undefined);

      if (body.status === 'delivered') {
        if (!auditSlug || !institutionName) {
          set.status = 400;
          return { error: 'auditSlug and institutionName are required to deliver' };
        }
        await deliverAudit(
          { kind: 'audit', email: item.email as string, name: item.name as string | undefined, bank: item.bank as string | undefined },
          auditSlug,
          institutionName,
        );
      }

      await updateItem(key, {
        status: body.status,
        statusUpdatedAt: new Date().toISOString(),
        ...(auditSlug ? { auditSlug } : {}),
        ...(institutionName ? { institutionName } : {}),
        ...(body.note ? { statusNote: body.note } : {}),
      });
      log.info({ id: body.id, status: body.status, auditSlug }, 'Audit request status updated');
      return { ok: true };
    },
    {
      body: t.Object({
        id: t.String({ pattern: '^SIGNUP#' }),
        status: t.Union(STATUSES.map((s) => t.Literal(s))),
        auditSlug: t.Optional(t.String({ pattern: '^[a-z0-9-]+$', maxLength: 120 })),
        institutionName: t.Optional(t.String({ maxLength: 160 })),
        note: t.Optional(t.String({ maxLength: 500 })),
      }),
    },
  );
