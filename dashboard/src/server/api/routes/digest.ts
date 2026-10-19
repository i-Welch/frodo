import { Elysia, t } from 'elysia';
import { queryItems } from '../../store/base-store';
import { sendEmail } from '../../messaging/email';
import { weeklyArticles } from '../../messaging/newsletter';
import { createChildLogger } from '../../logger';
import { adminAuth } from './leads-admin';
import { activeSubscribers } from './newsletter';

const log = createChildLogger({ module: 'digest' });

const ALERT_TO = process.env.LEAD_ALERT_TO ?? 'isaac@reportraven.tech';
const ANALYTICS_URL = 'https://vercel.com/iwelchs-projects/frodo/analytics';

/**
 * POST /api/v1/admin/digest/send — emails the founder a weekly summary: leads
 * and audit requests from the past 7 days, subscriber count, articles
 * published, plus status lines the PC automation passes in (open PRs,
 * LinkedIn posts, failed runs).
 */
export const digestAdminRoutes = new Elysia({ prefix: '/api/v1/admin/digest' })
  .onBeforeHandle(({ headers, set }) => {
    const result = adminAuth(headers as Record<string, string | undefined>, set);
    if (result) return result;
  })
  .post(
    '/send',
    async ({ body }) => {
      const now = new Date();
      const since = new Date(now.getTime() - 7 * 86_400_000).toISOString();
      const { items } = await queryItems({ pk: 'INTEREST', skPrefix: `SIGNUP#`, scanForward: false, limit: 500 });
      const week = items.filter((i) => (i.timestamp as string) >= since);
      const byKind = (k: string) => week.filter((i) => i.kind === k);
      const openAudits = items.filter((i) => i.kind === 'audit' && ['pending', 'in_progress', undefined].includes(i.status as string));

      const leadLine = (i: Record<string, unknown>) =>
        `  - ${i.name ?? '(no name)'} <${i.email}>${i.bank ? `, ${i.bank}` : ''}${i.source ? ` [${i.source}]` : ''}`;
      const articles = weeklyArticles(now.toISOString().slice(0, 10));
      const subscribers = (await activeSubscribers()).length;

      const sections = [
        `RAVEN weekly digest, week ending ${now.toISOString().slice(0, 10)}`,
        '',
        `LEADS (last 7 days): ${week.length}`,
        `  Audit requests: ${byKind('audit').length}`,
        ...byKind('audit').map(leadLine),
        `  Demo requests: ${byKind('demo').length}`,
        ...byKind('demo').map(leadLine),
        `  Newsletter signups: ${byKind('subscribe').length}`,
        '',
        `AUDIT QUEUE: ${openAudits.length} open`,
        ...openAudits.map((i) => `  - ${i.bank ?? i.email}: ${i.status ?? 'pending'}${i.auditSlug ? ` (${i.auditSlug})` : ''}`),
        '',
        `SUBSCRIBERS: ${subscribers} active`,
        '',
        `PUBLISHED THIS WEEK: ${articles.length}`,
        ...articles.map((a) => `  - ${a.title}\n    https://reportraven.tech/blog/${a.slug}`),
        '',
        ...(body.automation?.length ? ['AUTOMATION', ...body.automation.map((l) => `  ${l}`), ''] : []),
        `Traffic and top pages: ${ANALYTICS_URL}`,
      ];

      await sendEmail({
        to: ALERT_TO,
        subject: `RAVEN weekly: ${week.length} lead${week.length === 1 ? '' : 's'}, ${articles.length} article${articles.length === 1 ? '' : 's'}`,
        text: sections.join('\n'),
      });
      log.info({ leads: week.length, articles: articles.length }, 'Weekly digest sent');
      return { ok: true, leads: week.length, articles: articles.length, subscribers };
    },
    { body: t.Object({ automation: t.Optional(t.Array(t.String({ maxLength: 500 }), { maxItems: 50 })) }) },
  );
