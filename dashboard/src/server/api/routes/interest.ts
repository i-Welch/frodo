import { Elysia, t } from 'elysia';
import { putItem } from '../../store/base-store';
import { logger } from '../../logger';
import { notifyLead } from '../../messaging/leads';
import { bankSnapshot } from '../../messaging/lead-enrichment';

/**
 * POST /api/v1/interest — Store marketing-site leads (newsletter signups, free
 * audit requests, demo requests) and notify the founder.
 * No auth required (public endpoint).
 */
export const interestRoutes = new Elysia({ prefix: '/api/v1' }).post(
  '/interest',
  async ({ body, set }) => {
    const { email, name, bank, source, website } = body;
    const kind = body.kind ?? 'demo';

    // Honeypot: real visitors never see or fill the hidden "website" field.
    if (website) {
      logger.warn({ source }, 'Interest honeypot tripped');
      set.status = 201;
      return { ok: true };
    }

    const timestamp = new Date().toISOString();
    await putItem({
      PK: 'INTEREST',
      SK: `SIGNUP#${timestamp}#${email}`,
      kind,
      name,
      email,
      bank,
      source,
      // Audit requests move pending -> in_progress -> delivered (see leads-admin.ts).
      ...(kind === 'audit' ? { status: 'pending' } : {}),
      timestamp,
      GSI1PK: 'INTEREST',
      GSI1SK: email,
    });

    logger.info({ email, kind, source }, 'New interest signup');
    // Audit requesters see their bank's latest call report figures right away
    // (only for a confident FDIC match); looked up alongside the founder alert.
    const [, snapshot] = await Promise.all([
      notifyLead({ kind, email, name, bank, source }),
      kind === 'audit' ? bankSnapshot({ email, bank }) : Promise.resolve(undefined),
    ]);

    set.status = 201;
    return snapshot ? { ok: true, snapshot } : { ok: true };
  },
  {
    body: t.Object({
      email: t.String({ format: 'email', maxLength: 254 }),
      name: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
      kind: t.Optional(t.Union([t.Literal('subscribe'), t.Literal('audit'), t.Literal('demo')])),
      bank: t.Optional(t.String({ minLength: 1, maxLength: 160 })),
      source: t.Optional(t.String({ maxLength: 200 })),
      website: t.Optional(t.String({ maxLength: 200 })),
    }),
  },
);
