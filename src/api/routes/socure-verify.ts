import crypto from 'node:crypto';
import { Elysia } from 'elysia';
import { getFormToken, updateFormToken } from '../../forms/tokens.js';
import { getSocureBaseUrl, getSocureWorkflowName } from '../../providers/socure/config.js';
import { createChildLogger } from '../../logger.js';

const log = createChildLogger({ module: 'socure-verify' });

async function socureRequest<T>(path: string, method: 'POST' | 'PATCH', body: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.PROVIDER_SOCURE_API_KEY;
  if (!apiKey) throw new Error('Missing PROVIDER_SOCURE_API_KEY');

  const baseUrl = getSocureBaseUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = data as { msg?: string; message?: string };
    throw new Error(`Socure ${path}: ${err.msg ?? err.message ?? res.statusText} (${res.status})`);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

interface EvalResponse {
  eval_id: string;
  decision: 'ACCEPT' | 'REJECT' | 'REVIEW';
  status: 'CLOSED' | 'ON_HOLD';
  tags?: string[];
  data_enrichments?: {
    name: string;
    response: {
      data: Record<string, unknown>;
    };
  }[];
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * Socure verification routes — used by the Socure form component.
 *
 * POST /socure/start-evaluation    — initiate prefill + OTP
 * POST /socure/verify-otp          — verify OTP code
 * POST /socure/submit-kyc          — submit full PII for KYC
 */
export const socureVerifyRoutes = new Elysia({ prefix: '/socure' })

  // -----------------------------------------------------------------------
  // POST /socure/start-evaluation
  // Step 1: Collect DOB + phone, create evaluation → triggers OTP
  // -----------------------------------------------------------------------
  .post('/start-evaluation', async ({ body, set }) => {
    const {
      formToken: tokenStr,
      dateOfBirth,
      phoneNumber,
      diSessionToken,
    } = body as {
      formToken?: string;
      dateOfBirth?: string;
      phoneNumber?: string;
      diSessionToken?: string;
    };

    if (!tokenStr) {
      set.status = 400;
      return { error: 'formToken is required' };
    }

    const formToken = await getFormToken(tokenStr);
    if (!formToken) {
      set.status = 404;
      return { error: 'Form token expired or invalid' };
    }

    if (!dateOfBirth || !phoneNumber) {
      set.status = 400;
      return { error: 'dateOfBirth and phoneNumber are required' };
    }

    const result = await socureRequest<EvalResponse>(
      '/api/evaluation',
      'POST',
      {
        id: `raven-prefill-${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        workflow: getSocureWorkflowName(),
        data: {
          individual: {
            phone_number: phoneNumber,
            date_of_birth: dateOfBirth,
            ...(diSessionToken ? { di_session_token: diSessionToken } : {}),
            address: { country: 'US' },
          },
        },
      },
    );

    // Store eval_id on the form token for subsequent steps
    await updateFormToken(tokenStr, {
      socureEvalId: result.eval_id,
      socureDecision: result.decision,
      socureStatus: result.status,
    } as Record<string, unknown>);

    // Check if OTP was triggered
    const otpTriggered = result.tags?.includes('OTP Triggered') ?? false;

    log.info(
      { userId: formToken.userId, evalId: result.eval_id, decision: result.decision, otpTriggered },
      'Socure evaluation started',
    );

    return {
      evalId: result.eval_id,
      decision: result.decision,
      status: result.status,
      otpTriggered,
      tags: result.tags,
    };
  })

  // -----------------------------------------------------------------------
  // POST /socure/verify-otp
  // Step 2: Verify the OTP code sent to the user's phone
  // -----------------------------------------------------------------------
  .post('/verify-otp', async ({ body, set }) => {
    const {
      formToken: tokenStr,
      code,
    } = body as {
      formToken?: string;
      code?: string;
    };

    if (!tokenStr || !code) {
      set.status = 400;
      return { error: 'formToken and code are required' };
    }

    const formToken = await getFormToken(tokenStr);
    if (!formToken) {
      set.status = 404;
      return { error: 'Form token expired or invalid' };
    }

    const evalId = (formToken as unknown as Record<string, unknown>).socureEvalId as string;
    if (!evalId) {
      set.status = 400;
      return { error: 'No active Socure evaluation — start evaluation first' };
    }

    const result = await socureRequest<EvalResponse>(
      `/api/evaluation/${evalId}`,
      'PATCH',
      {
        id: `raven-otp-${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        workflow: getSocureWorkflowName(),
        data: {
          individual: {
            otp: { code },
          },
        },
      },
    );

    // Extract prefill data if available
    let prefillData: Record<string, unknown> | null = null;
    const prefillEnrichment = result.data_enrichments?.find(
      (e) => e.response?.data && (e.name === 'prefill' || e.name === 'Prefill' || e.name === 'Advanced Prefill'),
    );
    if (prefillEnrichment?.response?.data) {
      prefillData = prefillEnrichment.response.data;
    }

    await updateFormToken(tokenStr, {
      socureDecision: result.decision,
      socureStatus: result.status,
      socurePrefillData: prefillData,
    } as Record<string, unknown>);

    const otpApproved = result.tags?.includes('OTP Approved') ?? false;
    const prefillSuccessful = result.tags?.includes('Prefill Successful') ?? false;

    log.info(
      { evalId, decision: result.decision, otpApproved, prefillSuccessful },
      'Socure OTP verification result',
    );

    return {
      evalId,
      decision: result.decision,
      status: result.status,
      otpApproved,
      prefillSuccessful,
      prefillData,
      tags: result.tags,
    };
  })

  // -----------------------------------------------------------------------
  // POST /socure/submit-kyc
  // Step 3: Submit full PII for KYC + Watchlist decision
  // -----------------------------------------------------------------------
  .post('/submit-kyc', async ({ body, set }) => {
    const {
      formToken: tokenStr,
      firstName,
      lastName,
      email,
      ssn,
      dateOfBirth,
      phoneNumber,
      address,
      diSessionToken,
    } = body as {
      formToken?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      ssn?: string;
      dateOfBirth?: string;
      phoneNumber?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
      };
      diSessionToken?: string;
    };

    if (!tokenStr) {
      set.status = 400;
      return { error: 'formToken is required' };
    }

    const formToken = await getFormToken(tokenStr);
    if (!formToken) {
      set.status = 404;
      return { error: 'Form token expired or invalid' };
    }

    const evalId = (formToken as unknown as Record<string, unknown>).socureEvalId as string;
    if (!evalId) {
      set.status = 400;
      return { error: 'No active Socure evaluation — start evaluation first' };
    }

    if (!firstName || !lastName) {
      set.status = 400;
      return { error: 'firstName and lastName are required' };
    }

    const result = await socureRequest<EvalResponse>(
      `/api/evaluation/${evalId}`,
      'PATCH',
      {
        id: `raven-kyc-${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        workflow: getSocureWorkflowName(),
        data: {
          individual: {
            given_name: firstName,
            family_name: lastName,
            ...(email ? { email } : {}),
            ...(ssn ? { national_id: ssn } : {}),
            ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
            ...(phoneNumber ? { phone_number: phoneNumber } : {}),
            ...(diSessionToken ? { di_session_token: diSessionToken } : {}),
            address: {
              country: 'US',
              ...(address?.street ? { line_1: address.street } : {}),
              ...(address?.city ? { locality: address.city } : {}),
              ...(address?.state ? { major_admin_division: address.state } : {}),
              ...(address?.zip ? { postal_code: address.zip } : {}),
            },
          },
        },
      },
    );

    // Check for DocV step-up
    let docvTransactionToken: string | null = null;
    if (result.decision === 'REVIEW') {
      const docvEnrichment = result.data_enrichments?.find(
        (e) => e.response?.data?.docvTransactionToken,
      );
      if (docvEnrichment) {
        docvTransactionToken = docvEnrichment.response.data.docvTransactionToken as string;
      }
    }

    await updateFormToken(tokenStr, {
      socureDecision: result.decision,
      socureStatus: result.status,
      socureDocvToken: docvTransactionToken,
    } as Record<string, unknown>);

    // Store KYC result on the user's identity module
    if (result.decision === 'ACCEPT') {
      const { putModule } = await import('../../store/user-store.js');
      const { getModule } = await import('../../store/user-store.js');
      const existing = await getModule(formToken.userId, 'identity');
      await putModule(formToken.userId, 'identity', {
        ...(existing ?? {}),
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(dateOfBirth ? { dateOfBirth } : {}),
      });
    }

    log.info(
      {
        evalId,
        userId: formToken.userId,
        decision: result.decision,
        docvRequired: !!docvTransactionToken,
      },
      'Socure KYC result',
    );

    return {
      evalId,
      decision: result.decision,
      status: result.status,
      tags: result.tags,
      docvRequired: !!docvTransactionToken,
      docvTransactionToken,
    };
  });
