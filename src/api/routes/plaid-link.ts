import { Elysia } from 'elysia';
import { getFormToken, updateFormToken } from '../../forms/tokens.js';
import { storeProviderToken } from '../../providers/token-store.js';
import { createChildLogger } from '../../logger.js';

const log = createChildLogger({ module: 'plaid-link' });

const PLAID_BASE = process.env.PLAID_ENV === 'production'
  ? 'https://production.plaid.com'
  : process.env.PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://sandbox.plaid.com';

async function plaidRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const clientId = process.env.PROVIDER_PLAID_CLIENT_ID;
  const secret = process.env.PROVIDER_PLAID_SECRET;

  if (!clientId || !secret) {
    throw new Error('Missing PROVIDER_PLAID_CLIENT_ID or PROVIDER_PLAID_SECRET');
  }

  const res = await fetch(`${PLAID_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, secret, ...body }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = data as { error_message?: string; error_code?: string };
    throw new Error(`Plaid ${path}: ${err.error_message ?? res.statusText} (${err.error_code ?? res.status})`);
  }

  return data as T;
}

/**
 * Plaid Link routes — used by the plaid-link form component.
 *
 * POST /plaid/create-link-token  — creates a Plaid Link token for a form
 * POST /plaid/exchange-token     — exchanges the public token after Link completes
 */
export const plaidLinkRoutes = new Elysia({ prefix: '/plaid' })
  // -----------------------------------------------------------------------
  // POST /plaid/create-link-token
  // Called by the plaid-link form component when the user clicks "Connect"
  // -----------------------------------------------------------------------
  .post('/create-link-token', async ({ body, set }) => {
    const { formToken: tokenStr } = body as { formToken?: string };

    if (!tokenStr) {
      set.status = 400;
      return { error: 'formToken is required' };
    }

    const formToken = await getFormToken(tokenStr);
    if (!formToken) {
      set.status = 404;
      return { error: 'Form token expired or invalid' };
    }

    const linkToken = await plaidRequest<{ link_token: string; expiration: string }>(
      '/link/token/create',
      {
        user: { client_user_id: formToken.userId },
        client_name: 'RAVEN',
        products: ['transactions'],
        country_codes: ['US'],
        language: 'en',
        webhook: 'https://reportraven.tech/webhooks/plaid',
      },
    );

    log.debug(
      { userId: formToken.userId, linkToken: linkToken.link_token.slice(0, 20) },
      'Created Plaid Link token',
    );

    return { link_token: linkToken.link_token };
  })

  // -----------------------------------------------------------------------
  // POST /plaid/exchange-token
  // Called after Plaid Link completes successfully
  // -----------------------------------------------------------------------
  .post('/exchange-token', async ({ body, set }) => {
    const {
      formToken: tokenStr,
      publicToken,
      institutionId,
      institutionName,
      accounts,
    } = body as {
      formToken?: string;
      publicToken?: string;
      institutionId?: string;
      institutionName?: string;
      accounts?: { id: string; name: string; type: string; subtype: string; mask: string }[];
    };

    if (!tokenStr || !publicToken) {
      set.status = 400;
      return { error: 'formToken and publicToken are required' };
    }

    const formToken = await getFormToken(tokenStr);
    if (!formToken) {
      set.status = 404;
      return { error: 'Form token expired or invalid' };
    }

    // Exchange public token for access token
    const exchange = await plaidRequest<{
      access_token: string;
      item_id: string;
    }>('/item/public_token/exchange', {
      public_token: publicToken,
    });

    // Store the access token encrypted in RAVEN's token store.
    // We store it twice: once as the "primary" access_token (used by enrichers),
    // and once keyed by item_id (for multi-institution support).
    const tokenMeta = {
      itemId: exchange.item_id,
      institutionId,
      institutionName,
      accountCount: accounts?.length ?? 0,
      linkedAccounts: accounts?.map((a) => ({
        name: a.name,
        type: a.subtype || a.type,
        mask: a.mask,
      })),
    };

    // Primary token (used by enrichers that read "access_token")
    await storeProviderToken({
      userId: formToken.userId,
      provider: 'plaid',
      tokenType: 'access_token',
      value: exchange.access_token,
      metadata: tokenMeta,
    });

    // Multi-institution token keyed by item ID
    await storeProviderToken({
      userId: formToken.userId,
      provider: 'plaid',
      tokenType: `access_token#${exchange.item_id}`,
      value: exchange.access_token,
      metadata: tokenMeta,
    });

    // Store link status on the form token so the component knows it succeeded
    await updateFormToken(tokenStr, {
      plaidLinked: true,
      plaidInstitution: institutionName ?? institutionId ?? 'Unknown',
      plaidAccountCount: accounts?.length ?? 0,
    } as Record<string, unknown>);

    log.info(
      {
        userId: formToken.userId,
        institutionId,
        institutionName,
        accountCount: accounts?.length,
        itemId: exchange.item_id,
      },
      'Plaid Link completed — access token stored',
    );

    return {
      success: true,
      institution: institutionName,
      accountCount: accounts?.length ?? 0,
    };
  });
