import { Elysia, t } from 'elysia';
import { putItem } from '../../store/base-store';
import { logger } from '../../logger';
import { notifyLead } from '../../messaging/leads';
import { bankSnapshot } from '../../messaging/lead-enrichment';

/**
 * POST /api/v1/interest — Store marketing-site leads (newsletter signups, free
 * audit requests, demo requests, bank tracker signups) and notify the founder.
 * No auth required (public endpoint).
 */
export const interestRoutes = new Elysia({ prefix: '/api/v1' }).post(
  '/interest',
  async ({ body, set }) => {
    const { email, name, bank, cert, source, website } = body;
    const kind = body.kind ?? 'demo';
    // Tracking a bank means emailing about one specific FDIC institution.
    if (kind === 'track' && !cert) {
      set.status = 400;
      return { error: 'cert is required to track a bank' };
    }

    // Honeypot: real visitors never see or fill the hidden "website" field.
    if (website) {
      logger.warn({ source }, 'Interest honeypot tripped');
      set.status = 201;
      return { ok: true };
    }

    // Audit requesters see their bank's latest call report figures right away
    // (only for a confident FDIC match), on the page and in the confirmation email.
    // Trackers store the quarter they saw so the first update is the next one.
    const snapshot = kind === 'audit' || kind === 'track' ? await bankSnapshot({ email, bank, cert }) : undefined;

    const timestamp = new Date().toISOString();
    await putItem({
      PK: 'INTEREST',
      SK: `SIGNUP#${timestamp}#${email}`,
      kind,
      name,
      email,
      bank,
      ...(cert ? { cert } : {}),
      ...(kind === 'track' && snapshot ? { seenQuarter: snapshot.quarter } : {}),
      source,
      // Audit requests move pending -> in_progress -> delivered (see leads-admin.ts).
      ...(kind === 'audit' ? { status: 'pending' } : {}),
      timestamp,
      GSI1PK: 'INTEREST',
      GSI1SK: email,
    });

    logger.info({ email, kind, source }, 'New interest signup');
    await notifyLead({ kind, email, name, bank, source, snapshot });

    set.status = 201;
    return snapshot ? { ok: true, snapshot } : { ok: true };
  },
  {
    body: t.Object({
      email: t.String({ format: 'email', maxLength: 254 }),
      name: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
      kind: t.Optional(t.Union([t.Literal('subscribe'), t.Literal('audit'), t.Literal('demo'), t.Literal('track')])),
      bank: t.Optional(t.String({ minLength: 1, maxLength: 160 })),
      // FDIC cert from the form's bank autocomplete.
      cert: t.Optional(t.Integer({ minimum: 1, maximum: 9_999_999 })),
      source: t.Optional(t.String({ maxLength: 200 })),
      website: t.Optional(t.String({ maxLength: 200 })),
    }),
  },
);
