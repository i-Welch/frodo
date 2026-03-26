import { Elysia } from 'elysia';
import { resolveAuth, AuthError, type AuthContext } from '../middleware/api-key-auth.js';
import { createFormToken } from '../../forms/tokens.js';
import { getLink } from '../../store/tenant-user-store.js';
import { enrichModule } from '../../enrichment/engine.js';
import { getEnrichedModuleNames } from '../../enrichment/registry.js';
import { createChildLogger } from '../../logger.js';
import type { FormDefinition, FormStep, FormField } from '../../forms/types.js';
import type { ApiError } from '../../types.js';

const log = createChildLogger({ module: 'onboard' });

// ---------------------------------------------------------------------------
// Module → form step mapping
// ---------------------------------------------------------------------------

interface ModuleStepConfig {
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Fields to collect from the user */
  fields: FormField[];
  /** Whether this step requires Plaid Link (handled specially) */
  requiresPlaidLink?: boolean;
}

/**
 * Maps requested modules to form steps. The order matters —
 * identity/contact first, then employment, residence, then bank connection last.
 */
const MODULE_STEP_MAP: Record<string, ModuleStepConfig> = {
  identity: {
    title: 'Personal Information',
    description: 'Please provide your legal name and Social Security Number for identity verification.',
    fields: [
      { module: 'identity', field: 'firstName', label: 'First Name', inputType: 'text', required: true },
      { module: 'identity', field: 'lastName', label: 'Last Name', inputType: 'text', required: true },
      { module: 'identity', field: 'dateOfBirth', label: 'Date of Birth', inputType: 'date', required: true },
      { module: 'identity', field: 'ssn', label: 'Social Security Number', inputType: 'ssn', required: true },
    ],
  },
  contact: {
    title: 'Contact Information',
    description: 'How can we reach you?',
    fields: [
      { module: 'contact', field: 'email', label: 'Email Address', inputType: 'email', required: true },
      { module: 'contact', field: 'phone', label: 'Phone Number', inputType: 'phone', required: true },
    ],
  },
  employment: {
    title: 'Employment',
    description: 'Tell us about your current employment.',
    fields: [
      { module: 'employment', field: 'employer', label: 'Current Employer', inputType: 'text', required: true },
      { module: 'employment', field: 'title', label: 'Job Title', inputType: 'text', required: true },
      { module: 'employment', field: 'salary', label: 'Annual Salary', inputType: 'currency', required: true },
    ],
  },
  residence: {
    title: 'Home Address',
    description: 'Your current residential address.',
    fields: [
      { module: 'residence', field: 'currentAddress', label: 'Home Address', inputType: 'address', required: true },
    ],
  },
  financial: {
    title: 'Bank Verification',
    description: 'Securely connect your bank account to verify your financial information.',
    fields: [
      { module: 'financial', field: 'plaidLink', label: 'Bank Account', inputType: 'plaid-link', required: true },
    ],
    requiresPlaidLink: true,
  },
};

/** Order steps should appear in the form */
const STEP_ORDER = ['identity', 'contact', 'employment', 'residence', 'financial'];

/**
 * Build form steps from a list of requested modules.
 * Combines identity + contact into one step if both are requested.
 */
function buildFormSteps(modules: string[]): FormStep[] {
  const steps: FormStep[] = [];
  const requested = new Set(modules);

  // Combine identity + contact into a single "Personal Information" step
  if (requested.has('identity') && requested.has('contact')) {
    const identityCfg = MODULE_STEP_MAP.identity;
    const contactCfg = MODULE_STEP_MAP.contact;
    steps.push({
      title: 'Personal Information',
      description: 'Your identity and contact details.',
      fields: [...identityCfg.fields, ...contactCfg.fields],
    });
    requested.delete('identity');
    requested.delete('contact');
  }

  // Add remaining steps in order
  for (const mod of STEP_ORDER) {
    if (!requested.has(mod)) continue;
    const cfg = MODULE_STEP_MAP[mod];
    if (!cfg) continue;
    steps.push({
      title: cfg.title,
      description: cfg.description,
      fields: cfg.fields,
    });
  }

  return steps;
}

/**
 * Modules that can be enriched automatically after form completion
 * (i.e., they have enrichers registered and don't require manual input beyond
 * what the form collects).
 */
function getEnrichableModules(requested: string[]): string[] {
  const enricherModules = getEnrichedModuleNames();
  return requested.filter((m) => enricherModules.includes(m));
}

// ---------------------------------------------------------------------------
// Route: POST /api/v1/onboard
// ---------------------------------------------------------------------------

export const onboardRoutes = new Elysia({ prefix: '/api/v1' })
  .onError(({ error, set }) => {
    if (error instanceof AuthError) {
      set.status = 401;
      return error.apiError;
    }
  })
  .derive(async ({ headers }) => {
    return resolveAuth(headers) as Promise<AuthContext & Record<string, unknown>>;
  })

  /**
   * POST /api/v1/onboard
   *
   * Banking customer sends minimal info about a person they want to onboard.
   * RAVEN creates a user, generates a tailored form link, and optionally
   * sends it to the person. After the person completes the form, enrichment
   * runs automatically.
   *
   * Request body:
   * {
   *   "modules": ["identity", "contact", "financial", "credit"],
   *   "person": {
   *     "email": "jane@example.com",
   *     "phone": "+15551234567",
   *     "firstName": "Jane",
   *     "lastName": "Doe"
   *   },
   *   "sendLink": true,           // optional — send the form link via email/SMS
   *   "callbackUrl": "https://...", // optional — redirect after form completion
   *   "webhookUrl": "https://..."   // optional — POST notification when enrichment completes
   * }
   *
   * Response:
   * {
   *   "userId": "...",
   *   "formUrl": "https://reportraven.tech/forms/...",
   *   "formToken": "...",
   *   "modules": ["identity", "contact", "financial", "credit"],
   *   "steps": 3,
   *   "linkSent": true
   * }
   */
  .post('/onboard', async ({ body, tenant, apiKey, set }) => {
    const {
      modules,
      person,
      sendLink,
      callbackUrl,
      webhookUrl,
    } = body as {
      modules: string[];
      person?: {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
      };
      sendLink?: boolean;
      callbackUrl?: string;
      webhookUrl?: string;
    };

    // Validate
    if (!modules || modules.length === 0) {
      set.status = 400;
      const err: ApiError = {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'modules array is required and must not be empty',
      };
      return err;
    }

    // Create or find the user
    const { resolveIdentity } = await import('../../identity/resolver.js');
    const { createLink } = await import('../../store/tenant-user-store.js');

    const identifiers = {
      email: person?.email,
      phone: person?.phone,
      firstName: person?.firstName,
      lastName: person?.lastName,
    };

    const match = await resolveIdentity(identifiers);
    const userId = match.userId!;

    // Ensure tenant-user link exists
    const existingLink = await getLink(tenant.tenantId, userId);
    if (!existingLink) {
      await createLink({
        tenantId: tenant.tenantId,
        userId,
        providedIdentifiers: identifiers,
        createdAt: new Date().toISOString(),
      });
    }

    // Seed identity data if provided
    if (person?.email || person?.phone || person?.firstName || person?.lastName) {
      const { putModule } = await import('../../store/user-store.js');
      const { getModule } = await import('../../store/user-store.js');
      const { addIdentifier } = await import('../../store/identity-lookup-store.js');

      if (person.firstName || person.lastName) {
        const existing = await getModule(userId, 'identity');
        await putModule(userId, 'identity', {
          ...(existing ?? {}),
          ...(person.firstName ? { firstName: person.firstName } : {}),
          ...(person.lastName ? { lastName: person.lastName } : {}),
        });
      }

      if (person.email || person.phone) {
        const existing = await getModule(userId, 'contact');
        await putModule(userId, 'contact', {
          ...(existing ?? {}),
          ...(person.email ? { email: person.email } : {}),
          ...(person.phone ? { phone: person.phone } : {}),
        });

        if (person.email) await addIdentifier('email', person.email, userId);
        if (person.phone) await addIdentifier('phone', person.phone, userId);
      }
    }

    // Build the form
    const steps = buildFormSteps(modules);
    const allFields = steps.flatMap((s) => s.fields);
    const requestedModules = [...new Set(allFields.map((f) => f.module))];

    const formDef: FormDefinition = {
      formId: `onboard-${tenant.tenantId.slice(0, 8)}-${Date.now()}`,
      title: 'Verify Your Information',
      type: 'data_collection',
      fields: [], // ignored when steps present
      steps,
      expiresIn: { hours: 24 },
    };

    const formTokenStr = await createFormToken({
      formDefinition: formDef,
      userId,
      tenantId: tenant.tenantId,
      callbackUrl,
      requestedModules,
    });

    // Store enrichment config on the form token for post-completion auto-enrichment
    const { updateFormToken } = await import('../../forms/tokens.js');
    await updateFormToken(formTokenStr, {
      onboardModules: modules,
      onboardWebhookUrl: webhookUrl,
    } as Record<string, unknown>);

    const baseUrl = process.env.BASE_URL ?? 'https://reportraven.tech';
    const formUrl = `${baseUrl}/forms/${formTokenStr}`;

    // Send the link if requested
    let linkSent = false;
    if (sendLink && person?.email) {
      // TODO: integrate with an email provider (SendGrid, SES, etc.)
      // For now, log it
      log.info(
        { userId, email: person.email, formUrl },
        'Form link ready to send (email provider not yet configured)',
      );
      linkSent = false; // Will be true once email sending is implemented
    }

    log.info(
      { userId, tenantId: tenant.tenantId, modules, steps: steps.length },
      'Onboarding initiated',
    );

    set.status = 201;
    return {
      userId,
      formUrl,
      formToken: formTokenStr,
      modules,
      steps: steps.length,
      linkSent,
    };
  })

  /**
   * GET /api/v1/onboard/:userId/status
   *
   * Check the status of an onboarding — which modules have data,
   * which are still pending.
   */
  .get('/onboard/:userId/status', async ({ params, tenant, set }) => {
    const link = await getLink(tenant.tenantId, params.userId);
    if (!link) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `User ${params.userId} not found or not linked to this tenant`,
      };
      return err;
    }

    const { getModule } = await import('../../store/user-store.js');
    const { listProviderTokens } = await import('../../providers/token-store.js');

    const moduleStatus: Record<string, { hasData: boolean; fieldCount: number }> = {};
    const allModules = ['identity', 'contact', 'financial', 'credit', 'employment', 'residence', 'buying-patterns', 'education'];

    for (const mod of allModules) {
      const data = await getModule(params.userId, mod);
      moduleStatus[mod] = {
        hasData: data !== null && Object.keys(data).length > 0,
        fieldCount: data ? Object.keys(data).length : 0,
      };
    }

    const tokens = await listProviderTokens(params.userId);
    const linkedProviders = [...new Set(tokens.map((t) => t.provider))];

    return {
      userId: params.userId,
      modules: moduleStatus,
      linkedProviders,
      providerTokenCount: tokens.length,
    };
  });
