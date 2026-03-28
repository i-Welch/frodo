import { Elysia } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
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
/**
 * Modules that REQUIRE user interaction in the form.
 * Everything else can be enriched automatically by providers.
 *
 * - identity: we always need name + SSN from the user (no enricher provides SSN)
 * - financial: requires Plaid Link (user must connect their bank)
 *
 * These modules are SKIPPED in the form (enriched automatically):
 * - employment: Truework verifies with the employer directly
 * - residence: Plaid Identity and Socure return verified addresses
 * - contact: Plaid Identity returns bank-verified email/phone, or we already have it from the onboard request
 * - credit: Plaid liabilities + bureau enrichers handle this
 * - buying-patterns: derived from Plaid transactions automatically
 * - education: NSC verification (when available)
 */

const FORM_STEPS_CONFIG: Record<string, ModuleStepConfig & { requiresUserInput: boolean }> = {
  identity: {
    title: 'Personal Information',
    description: 'We need your legal name and Social Security Number for identity verification.',
    fields: [
      { module: 'identity', field: 'firstName', label: 'First Name', inputType: 'text', required: true },
      { module: 'identity', field: 'lastName', label: 'Last Name', inputType: 'text', required: true },
      { module: 'identity', field: 'ssn', label: 'Social Security Number', inputType: 'ssn', required: true },
    ],
    requiresUserInput: true,
  },
  financial: {
    title: 'Bank Verification',
    description: 'Securely connect your bank account to verify your financial information.',
    fields: [
      { module: 'financial', field: 'plaidLink', label: 'Bank Account', inputType: 'plaid-link', required: true },
    ],
    requiresUserInput: true,
  },
  // These are only shown if we don't have the data AND can't get it from enrichers
  contact: {
    title: 'Contact Information',
    description: 'How can we reach you?',
    fields: [
      { module: 'contact', field: 'email', label: 'Email Address', inputType: 'email', required: true },
      { module: 'contact', field: 'phone', label: 'Phone Number', inputType: 'phone', required: true },
    ],
    requiresUserInput: false, // Plaid Identity returns bank-verified email/phone
  },
  employment: {
    title: 'Employment',
    description: 'Tell us about your current employment.',
    fields: [
      { module: 'employment', field: 'employer', label: 'Current Employer', inputType: 'text', required: true },
      { module: 'employment', field: 'title', label: 'Job Title', inputType: 'text', required: true },
      { module: 'employment', field: 'salary', label: 'Annual Salary', inputType: 'currency', required: true },
    ],
    requiresUserInput: false, // Truework verifies with employer directly
  },
  residence: {
    title: 'Home Address',
    description: 'Your current residential address.',
    fields: [
      { module: 'residence', field: 'currentAddress', label: 'Home Address', inputType: 'address', required: true },
    ],
    requiresUserInput: false, // Plaid Identity / Socure return verified addresses
  },
};

/** Order steps should appear in the form */
const STEP_ORDER = ['identity', 'financial'];

/**
 * Build form steps from a list of requested modules.
 * Only includes steps that REQUIRE user interaction.
 * Modules that can be enriched automatically are skipped.
 *
 * If contact info (email/phone) was provided in the onboard request,
 * the contact step is skipped since we already have it.
 */
function buildFormSteps(modules: string[], providedPerson?: { email?: string; phone?: string; firstName?: string; lastName?: string }): FormStep[] {
  const steps: FormStep[] = [];
  const requested = new Set(modules);

  // Identity: always show (we need name + SSN), but skip fields we already have
  if (requested.has('identity')) {
    const identityFields = [...FORM_STEPS_CONFIG.identity.fields];

    // If we already have first/last name from the onboard request, remove those fields
    // (they'll be pre-seeded in the module, but we still need SSN)
    const filteredFields = identityFields.filter((f) => {
      if (f.field === 'firstName' && providedPerson?.firstName) return false;
      if (f.field === 'lastName' && providedPerson?.lastName) return false;
      return true;
    });

    // If all we need is SSN (name was provided), simplify the title
    const hasNameFields = filteredFields.some((f) => f.field === 'firstName' || f.field === 'lastName');

    steps.push({
      title: hasNameFields ? 'Personal Information' : 'Identity Verification',
      description: hasNameFields
        ? 'We need your legal name and Social Security Number for identity verification.'
        : 'Please provide your Social Security Number to verify your identity.',
      fields: filteredFields,
    });
  }

  // Contact: only show if we DON'T have email/phone from the onboard request
  // AND Plaid (financial) is not being requested (Plaid Identity provides contact info)
  if (requested.has('contact') && !providedPerson?.email && !providedPerson?.phone && !requested.has('financial')) {
    steps.push({
      title: FORM_STEPS_CONFIG.contact.title,
      description: FORM_STEPS_CONFIG.contact.description,
      fields: FORM_STEPS_CONFIG.contact.fields,
    });
  }

  // Financial: always show if requested (Plaid Link requires user interaction)
  if (requested.has('financial')) {
    steps.push({
      title: FORM_STEPS_CONFIG.financial.title,
      description: FORM_STEPS_CONFIG.financial.description,
      fields: FORM_STEPS_CONFIG.financial.fields,
    });
  }

  // Employment, Residence, Credit, Buying Patterns, Education:
  // These are all enriched automatically — NO form steps needed.
  // Truework handles employment, Plaid Identity/Socure handle residence,
  // Plaid liabilities handle credit, Plaid transactions handle buying patterns.

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
    return resolveCombinedAuth(headers);
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
  .post('/onboard', async ({ body, tenant, apiKey, clerkUserId, set }) => {
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

        if (person.email) await addIdentifier('EMAIL', person.email, userId);
        if (person.phone) await addIdentifier('PHONE', person.phone, userId);
      }
    }

    // Build the form
    const steps = buildFormSteps(modules, person);
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

    const baseUrl = process.env.BASE_URL ?? 'https://app.reportraven.tech';
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

    // Create verification tracking record
    const { createVerification } = await import('../../store/verification-store.js');
    const borrowerName = [person?.firstName, person?.lastName].filter(Boolean).join(' ') || undefined;
    const verification = await createVerification({
      tenantId: tenant.tenantId,
      userId,
      status: linkSent ? 'form_sent' : 'created',
      modules,
      borrowerName,
      borrowerEmail: person?.email,
      borrowerPhone: person?.phone,
      formToken: formTokenStr,
      formUrl,
      createdBy: (apiKey as { keyId?: string } | undefined)?.keyId ?? (clerkUserId as string | undefined) ?? 'unknown',
    });

    log.info(
      { userId, tenantId: tenant.tenantId, modules, steps: steps.length, verificationId: verification.requestId },
      'Onboarding initiated',
    );

    set.status = 201;
    return {
      userId,
      verificationId: verification.requestId,
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
