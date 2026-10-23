import { Elysia, t } from 'elysia';
import { ConditionalCheckFailedError, putItem, queryItems } from '../../store/base-store';
import { sendEmail } from '../../messaging/email';
import { bankSnapshot, type BankSnapshot } from '../../messaging/lead-enrichment';
import { trackerMessage } from '../../messaging/bank-tracker';
import { postalAddress } from '../../messaging/newsletter';
import { createChildLogger } from '../../logger';
import { adminAuth } from './leads-admin';

type Item = Record<string, unknown>;

const log = createChildLogger({ module: 'bank-tracker' });

async function queryAll(pk: string, skPrefix?: string): Promise<Item[]> {
  const all: Item[] = [];
  let cursor: string | undefined;
  do {
    const page = await queryItems({ pk, skPrefix, cursor, limit: 500 });
    all.push(...page.items);
    cursor = page.cursor;
  } while (cursor);
  return all;
}

export interface Tracker {
  email: string;
  cert: number;
  /** Call report quarter the visitor already saw when they signed up. */
  seenQuarter?: string;
}

/** Tracker signups, one per email and bank, minus anyone who unsubscribed after signing up. */
export async function activeTrackers(): Promise<Tracker[]> {
  const latest = new Map<string, Tracker & { ts: string }>();
  for (const i of await queryAll('INTEREST', 'SIGNUP#')) {
    if (i.kind !== 'track' || typeof i.email !== 'string' || typeof i.cert !== 'number') continue;
    const email = i.email.trim().toLowerCase();
    const key = `${email}#${i.cert}`;
    const ts = i.timestamp as string;
    if (!latest.has(key) || latest.get(key)!.ts < ts) {
      latest.set(key, { email, cert: i.cert, seenQuarter: i.seenQuarter as string | undefined, ts });
    }
  }
  const unsubAt = new Map((await queryAll('UNSUB')).map((u) => [u.SK as string, u.unsubscribedAt as string]));
  return [...latest.values()]
    .filter((tr) => !unsubAt.has(tr.email) || unsubAt.get(tr.email)! < tr.ts)
    .map(({ email, cert, seenQuarter }) => ({ email, cert, seenQuarter }));
}

/**
 * POST /api/v1/admin/bank-tracker/send — emails each tracker once per new
 * quarter of their bank's call report. Safe to call daily: a quarter the
 * visitor already saw at signup, or one already sent, is skipped.
 */
export const bankTrackerAdminRoutes = new Elysia({ prefix: '/api/v1/admin/bank-tracker' })
  .onBeforeHandle(({ headers, set }) => {
    const result = adminAuth(headers as Record<string, string | undefined>, set);
    if (result) return result;
  })
  .post(
    '/send',
    async ({ body, set }) => {
      const trackers = await activeTrackers();
      if (trackers.length === 0) return { trackers: 0, sent: 0 };
      const address = postalAddress();
      if (!address) {
        set.status = 412;
        return { error: 'NEWSLETTER_POSTAL_ADDRESS is not set (CAN-SPAM requires a mailing address in every email)' };
      }
      const snapshots = new Map<number, BankSnapshot | undefined>();
      for (const cert of new Set(trackers.map((tr) => tr.cert))) {
        snapshots.set(cert, await bankSnapshot({ email: '', cert }));
      }

      const due = trackers.filter((tr) => {
        const s = snapshots.get(tr.cert);
        return s && s.quarter !== tr.seenQuarter;
      });
      if (body.dryRun) return { dryRun: true, trackers: trackers.length, due: due.length };

      let sent = 0;
      for (const tr of due) {
        const s = snapshots.get(tr.cert)!;
        try {
          await putItem(
            { PK: 'TRACKER', SK: `SENT#${s.quarter}#${tr.cert}#${tr.email}`, sentAt: new Date().toISOString() },
            { ifNotExists: true },
          );
        } catch (err) {
          if (err instanceof ConditionalCheckFailedError) continue;
          throw err;
        }
        await sendEmail(trackerMessage(s, tr.email, address));
        sent++;
      }
      log.info({ trackers: trackers.length, sent }, 'Bank tracker run');
      return { trackers: trackers.length, sent };
    },
    { body: t.Object({ dryRun: t.Optional(t.Boolean()) }) },
  );
