import { Elysia, t } from 'elysia';
import { putItem } from '../../store/base-store.js';
import { logger } from '../../logger.js';

/**
 * POST /api/v1/interest — Store early access interest signups.
 * No auth required (public endpoint).
 */
export const interestRoutes = new Elysia({ prefix: '/api/v1' }).post(
  '/interest',
  async ({ body, set }) => {
    const { name, email } = body;
    const timestamp = new Date().toISOString();

    await putItem({
      PK: 'INTEREST',
      SK: `SIGNUP#${timestamp}#${email}`,
      name,
      email,
      timestamp,
      GSI1PK: 'INTEREST',
      GSI1SK: email,
    });

    logger.info({ email }, 'New interest signup');

    set.status = 201;
    return { ok: true };
  },
  {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ format: 'email' }),
    }),
  },
);
