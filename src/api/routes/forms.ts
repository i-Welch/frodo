import crypto from 'node:crypto';
import { Elysia } from 'elysia';
import { resolveAuth, AuthError, type AuthContext } from '../middleware/api-key-auth.js';
import { createFormToken, getFormToken, updateFormToken, deleteFormToken } from '../../forms/tokens.js';
import { renderForm, renderStep, renderConsent, renderSuccess, renderError, renderOtpEntry, renderOtpSend } from '../../forms/renderer.js';
import { generateOtp, verifyOtp, isOtpExpired } from '../../forms/otp.js';
import { getOtpProvider } from '../../forms/otp-provider.js';
import { verifyIdentity } from '../../forms/verification.js';
import { recordConsent, buildConsentText } from '../../forms/consent.js';
import { isValidInputType, isCustomComponent, getComponent } from '../../forms/components/registry.js';
import { enrichModule } from '../../enrichment/engine.js';
import { getModule as getModuleDef } from '../../modules/registry.js';
import { putModule } from '../../store/user-store.js';
import { getModule } from '../../store/user-store.js';
import { appendEvent } from '../../store/event-store.js';
import { getTenant } from '../../store/tenant-store.js';
import { createSession } from '../../sessions/manager.js';
import { createChildLogger } from '../../logger.js';
import type { FormDefinition, FormToken as FormTokenType, OtpState } from '../../forms/types.js';
import type { DataEvent, FieldChange } from '../../events/types.js';
import type { ApiError } from '../../types.js';
import { VerificationTier } from '../../types.js';

const log = createChildLogger({ module: 'form-routes' });

/** OTP validity: 10 minutes. */
const OTP_EXPIRY_MS = 10 * 60 * 1000;

/** Maximum OTP attempts before lockout. */
const MAX_OTP_ATTEMPTS = 3;

// ---------------------------------------------------------------------------
// HTML response helper
// ---------------------------------------------------------------------------

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// ---------------------------------------------------------------------------
// Authenticated route: POST /forms (create a form token)
// ---------------------------------------------------------------------------

export const formCreateRoute = new Elysia({ prefix: '/forms' })
  .onError(({ error, set }) => {
    if (error instanceof AuthError) {
      set.status = 401;
      return (error as AuthError).apiError;
    }
  })
  .derive(async ({ headers }) => {
    return resolveAuth(headers) as Promise<AuthContext & Record<string, unknown>>;
  })
  .post('/', async ({ body, tenant, set }) => {
    const { formDefinition, userId, callbackUrl } = body as {
      formDefinition: FormDefinition;
      userId: string;
      callbackUrl?: string;
    };

    if (!formDefinition || !userId) {
      set.status = 400;
      const err: ApiError = {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Request body must include formDefinition and userId',
      };
      return err;
    }

    if (!formDefinition.formId || !formDefinition.title || !formDefinition.type || !formDefinition.fields) {
      set.status = 400;
      const err: ApiError = {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'formDefinition must include formId, title, type, and fields',
      };
      return err;
    }

    // Collect all fields from both flat and step-based definitions
    const allFields = formDefinition.steps
      ? formDefinition.steps.flatMap((s) => s.fields)
      : formDefinition.fields;

    // Validate all field inputTypes
    for (const field of allFields) {
      if (!isValidInputType(field.inputType)) {
        set.status = 400;
        const err: ApiError = {
          status: 400,
          code: 'BAD_REQUEST',
          message: `Unknown inputType '${field.inputType}' on field '${field.field}'`,
        };
        return err;
      }
    }

    // Validate callbackUrl if tenant has configured URLs
    if (
      callbackUrl &&
      tenant.callbackUrls.length > 0 &&
      !tenant.callbackUrls.includes(callbackUrl)
    ) {
      set.status = 400;
      const err: ApiError = {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'callbackUrl is not in the tenant\'s configured callback URLs',
      };
      return err;
    }

    // Collect requested modules from all fields (flat or step-based)
    const requestedModules = [...new Set(allFields.map((f) => f.module))];

    const token = await createFormToken({
      formDefinition,
      userId,
      tenantId: tenant.tenantId,
      callbackUrl,
      requestedModules,
    });

    set.status = 201;
    return { token, url: `/forms/${token}` };
  });

// ---------------------------------------------------------------------------
// Public routes: GET/POST /forms/:token/*
// ---------------------------------------------------------------------------

export const formPublicRoutes = new Elysia({ prefix: '/forms' })
  // -----------------------------------------------------------------------
  // GET /forms/:token — Render the form
  // -----------------------------------------------------------------------
  .get('/:token', async ({ params }) => {
    const formToken = await getFormToken(params.token);
    if (!formToken) {
      return html(renderError('This form link has expired or is invalid.'), 404);
    }

    const { type } = formToken.formDefinition;

    // Identity verification or OTP: show consent first
    if (type === 'identity_verification' || type === 'otp_verification') {
      const tenant = await getTenant(formToken.tenantId);
      const tenantName = tenant?.name ?? 'the requesting party';
      const modules = formToken.requestedModules ?? [];
      const consentText = buildConsentText(tenantName, modules, tenant?.consentAddendum);
      return html(renderConsent(formToken, consentText));
    }

    // Data collection: render form directly
    return html(renderForm(formToken));
  })

  // -----------------------------------------------------------------------
  // POST /forms/:token/consent — Accept consent
  // -----------------------------------------------------------------------
  .post('/:token/consent', async ({ params, body }) => {
    const formToken = await getFormToken(params.token);
    if (!formToken) {
      return html(renderError('This form link has expired or is invalid.'), 404);
    }

    const { accepted } = body as { accepted?: string | boolean };
    if (accepted !== 'true' && accepted !== true) {
      return html(renderError('You must accept the consent to continue.'), 400);
    }

    // Record consent
    const tenant = await getTenant(formToken.tenantId);
    const tenantName = tenant?.name ?? 'the requesting party';
    const modules = formToken.requestedModules ?? [];
    const consentText = buildConsentText(tenantName, modules, tenant?.consentAddendum);

    await recordConsent({
      userId: formToken.userId,
      tenantId: formToken.tenantId,
      modules,
      tier: formToken.requiredTier ?? VerificationTier.None,
      consentText,
      consentAddendum: tenant?.consentAddendum,
      accepted: true,
    });

    const { type } = formToken.formDefinition;

    if (type === 'otp_verification') {
      // Show OTP send screen
      return html(renderOtpSend(formToken));
    }

    // Identity verification: render the identity form fields
    return html(renderForm(formToken));
  })

  // -----------------------------------------------------------------------
  // POST /forms/:token/step — Submit current step and advance to next
  // -----------------------------------------------------------------------
  .post('/:token/step', async ({ params, body, headers }) => {
    const formToken = await getFormToken(params.token);
    if (!formToken) {
      return html(renderError('This form link has expired or is invalid.'), 404);
    }

    const steps = formToken.formDefinition.steps;
    if (!steps || steps.length === 0) {
      return html(renderError('This form does not have steps.'), 400);
    }

    const currentStep = formToken.currentStep ?? 0;
    const step = steps[currentStep];

    // Validate and persist the current step's data
    const raw = body as Record<string, unknown>;
    const submitted = normalizeSubmission(raw);

    const errors: string[] = [];
    for (const field of step.fields) {
      const key = `${field.module}.${field.field}`;
      let value = submitted[key];

      if (isCustomComponent(field.inputType)) {
        const component = getComponent(field.inputType)!;
        if (value === undefined) {
          value = assembleSubFields(submitted, field.field);
        }
        const err = component.validate(value, field);
        if (err) errors.push(`${field.label}: ${err}`);
      } else {
        if (field.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field.label} is required`);
        }
        if (field.pattern && typeof value === 'string' && value) {
          const re = new RegExp(`^${field.pattern}$`);
          if (!re.test(value)) errors.push(`${field.label} has an invalid format`);
        }
      }
    }

    if (errors.length > 0) {
      // Re-render the current step with errors
      // For now, show a simple error. TODO: inline field errors
      return html(renderError('Please fix the following:\\n' + errors.join('\\n')), 400);
    }

    // Persist the step's data (same logic as final submit)
    const moduleData = new Map<string, Record<string, unknown>>();
    for (const field of step.fields) {
      const key = `${field.module}.${field.field}`;
      let value = submitted[key];

      if (isCustomComponent(field.inputType)) {
        const component = getComponent(field.inputType)!;
        if (value === undefined) {
          value = assembleSubFields(submitted, field.field);
        }
        if (component.transformValue) {
          value = component.transformValue(value, field);
        }
      }

      if (value === undefined || value === null || value === '') continue;

      if (!moduleData.has(field.module)) {
        moduleData.set(field.module, {});
      }
      moduleData.get(field.module)![field.field] = value;
    }

    // Write data for this step
    for (const [moduleName, data] of moduleData) {
      const existing = await getModule(formToken.userId, moduleName);
      await putModule(formToken.userId, moduleName, {
        ...(existing ?? {}),
        ...data,
      });

      const changes: FieldChange[] = [];
      for (const [fieldName, newValue] of Object.entries(data)) {
        changes.push({
          field: fieldName,
          previousValue: existing?.[fieldName] ?? null,
          newValue,
          confidence: 1.0,
          goodBy: new Date(Date.now() + 365 * 86_400_000).toISOString(),
        });
      }

      const event: DataEvent = {
        eventId: crypto.randomUUID(),
        userId: formToken.userId,
        module: moduleName,
        source: {
          source: 'user',
          actor: `form:${formToken.formDefinition.formId}:step${currentStep}`,
          tenantId: formToken.tenantId,
        },
        changes,
        timestamp: new Date().toISOString(),
      };

      await appendEvent(event);
    }

    // Advance to the next step
    const nextStep = currentStep + 1;
    await updateFormToken(formToken.token, { currentStep: nextStep } as Partial<FormTokenType>);

    // Render the next step
    const updatedToken = { ...formToken, currentStep: nextStep };
    return html(renderStep(updatedToken, nextStep));
  })

  // -----------------------------------------------------------------------
  // POST /forms/:token/submit — Handle form submission
  // -----------------------------------------------------------------------
  .post('/:token/submit', async ({ params, body, headers }) => {
    const formToken = await getFormToken(params.token);
    if (!formToken) {
      // Detect JSON client (Frodo Collect) vs HTML browser
      const isJsonClient = isJsonRequest(headers);
      if (isJsonClient) {
        return new Response(JSON.stringify({ message: 'This form link has expired or is invalid.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return html(renderError('This form link has expired or is invalid.'), 404);
    }

    const raw = body as Record<string, unknown>;
    const isJsonClient = isJsonRequest(headers);

    // Normalize Frodo Collect format: { fields: [...], source } -> flat { "module.field": value }
    const submitted = normalizeSubmission(raw);
    const collectSource = isCollectFormat(raw) ? (raw.source as string | undefined) : undefined;
    const { type } = formToken.formDefinition;

    // ------- Identity Verification -------
    if (type === 'identity_verification') {
      // Extract identity fields from submission
      const firstName = extractField(submitted, 'identity', 'firstName') as string ?? '';
      const lastName = extractField(submitted, 'identity', 'lastName') as string ?? '';
      const ssn = extractField(submitted, 'identity', 'ssn') as string ?? '';

      const match = await verifyIdentity(formToken.userId, { firstName, lastName, ssn });

      if (!match) {
        return html(renderError('Identity verification failed. Please check your information and try again.'), 400);
      }

      // Create session on success
      const session = await createSession(
        formToken.userId,
        formToken.tenantId,
        VerificationTier.Identity,
      );

      // Clean up the form token
      await deleteFormToken(formToken.token);

      const redirectUrl = formToken.callbackUrl
        ? `${formToken.callbackUrl}${formToken.callbackUrl.includes('?') ? '&' : '?'}sessionId=${session.sessionId}`
        : undefined;

      return html(renderSuccess('Identity verified successfully.', redirectUrl));
    }

    // ------- Data Collection -------
    // Validate fields (including custom component validation)
    const errors: string[] = [];
    for (const field of formToken.formDefinition.fields) {
      const key = `${field.module}.${field.field}`;
      let value = submitted[key];

      if (isCustomComponent(field.inputType)) {
        const component = getComponent(field.inputType)!;
        // For custom components, try to assemble sub-fields into an object
        if (value === undefined) {
          value = assembleSubFields(submitted, field.field);
        }
        const err = component.validate(value, field);
        if (err) errors.push(`${field.label}: ${err}`);
      } else {
        // Standard field validation
        if (field.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field.label} is required`);
        }
        if (field.pattern && typeof value === 'string' && value) {
          const re = new RegExp(`^${field.pattern}$`);
          if (!re.test(value)) {
            errors.push(`${field.label} has an invalid format`);
          }
        }
        if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
          errors.push(`${field.label} must be at least ${field.minLength} characters`);
        }
        if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
          errors.push(`${field.label} must be at most ${field.maxLength} characters`);
        }
      }
    }

    if (errors.length > 0) {
      if (isJsonClient) {
        const errorMap: Record<string, string> = {};
        errors.forEach((e, i) => { errorMap[`field_${i}`] = e; });
        return new Response(JSON.stringify({ errors: errorMap, message: 'Validation failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return html(renderError('Validation errors:\n' + errors.join('\n')), 400);
    }

    // Write data as module updates + events
    // Group fields by module
    const moduleData = new Map<string, Record<string, unknown>>();
    for (const field of formToken.formDefinition.fields) {
      const key = `${field.module}.${field.field}`;
      let value = submitted[key];

      // Transform custom component values
      if (isCustomComponent(field.inputType)) {
        const component = getComponent(field.inputType)!;
        if (value === undefined) {
          value = assembleSubFields(submitted, field.field);
        }
        if (component.transformValue) {
          value = component.transformValue(value, field);
        }
      }

      if (!moduleData.has(field.module)) {
        moduleData.set(field.module, {});
      }
      moduleData.get(field.module)![field.field] = value;
    }

    // Persist each module's data and emit events
    let eventsCreated = 0;
    for (const [moduleName, data] of moduleData) {
      // Get existing module data for field change tracking
      const existing = await getModule(formToken.userId, moduleName);

      await putModule(formToken.userId, moduleName, {
        ...(existing ?? {}),
        ...data,
      });

      // Build field changes for the event
      const changes: FieldChange[] = [];
      for (const [fieldName, newValue] of Object.entries(data)) {
        changes.push({
          field: fieldName,
          previousValue: existing?.[fieldName] ?? null,
          newValue,
          confidence: 1.0,
          goodBy: new Date(Date.now() + 365 * 86_400_000).toISOString(),
        });
      }

      const eventSource = collectSource ?? 'user';
      const event: DataEvent = {
        eventId: crypto.randomUUID(),
        userId: formToken.userId,
        module: moduleName,
        source: {
          source: eventSource,
          actor: `form:${formToken.formDefinition.formId}`,
          tenantId: formToken.tenantId,
        },
        changes,
        timestamp: new Date().toISOString(),
      };

      await appendEvent(event);
      eventsCreated++;
    }

    // Auto-enrichment: if this form was created by /onboard, run enrichers
    const onboardModules = (formToken as unknown as Record<string, unknown>).onboardModules as string[] | undefined;
    if (onboardModules && onboardModules.length > 0) {
      log.info({ userId: formToken.userId, modules: onboardModules }, 'Auto-enriching after form completion');
      // Run enrichment in the background — don't block the user's response
      const enrichmentPromises = onboardModules.map((mod) =>
        enrichModule(formToken.userId, mod, `form:${formToken.formDefinition.formId}`, formToken.tenantId)
          .catch((err) => log.warn({ module: mod, error: String(err) }, 'Auto-enrichment failed for module')),
      );
      // Fire and forget — enrichment runs after the response is sent
      Promise.allSettled(enrichmentPromises).then((results) => {
        const succeeded = results.filter((r) => r.status === 'fulfilled').length;
        log.info({ userId: formToken.userId, succeeded, total: results.length }, 'Auto-enrichment complete');
      });
    }

    // Clean up the form token
    await deleteFormToken(formToken.token);

    // JSON response for Frodo Collect clients
    if (isJsonClient) {
      return new Response(JSON.stringify({
        eventsCreated,
        redirectUrl: formToken.callbackUrl ?? null,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return html(renderSuccess('Your information has been submitted successfully.', formToken.callbackUrl));
  })

  // -----------------------------------------------------------------------
  // POST /forms/:token/send-otp — Send an OTP code
  // -----------------------------------------------------------------------
  .post('/:token/send-otp', async ({ params, body }) => {
    const formToken = await getFormToken(params.token);
    if (!formToken) {
      return html(renderError('This form link has expired or is invalid.'), 404);
    }

    const { channel } = body as { channel?: 'email' | 'phone' };
    const otpChannel = channel === 'phone' ? 'phone' : 'email';

    // Get contact info for the user
    const contactModule = await getModule(formToken.userId, 'contact');
    if (!contactModule) {
      return html(renderError('No contact information found for this user.'), 400);
    }

    const destination = otpChannel === 'email'
      ? (contactModule.email as string)
      : (contactModule.phone as string);

    if (!destination) {
      return html(renderError(`No ${otpChannel} on file for this user.`), 400);
    }

    // Generate OTP
    const { code, hash } = generateOtp();

    // Store OTP state on the form token
    const otpState: OtpState = {
      hashedOtp: hash,
      channel: otpChannel,
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS).toISOString(),
      verifiedChannels: formToken.otpState?.verifiedChannels ?? [],
    };

    await updateFormToken(formToken.token, { otpState });

    // Send the OTP
    const provider = getOtpProvider();
    await provider.sendOtp(otpChannel, destination, code);

    // Render OTP entry form
    const updatedToken = { ...formToken, otpState };
    return html(renderOtpEntry(updatedToken));
  })

  // -----------------------------------------------------------------------
  // POST /forms/:token/verify-otp — Verify OTP code
  // -----------------------------------------------------------------------
  .post('/:token/verify-otp', async ({ params, body }) => {
    const formToken = await getFormToken(params.token);
    if (!formToken) {
      return html(renderError('This form link has expired or is invalid.'), 404);
    }

    if (!formToken.otpState) {
      return html(renderError('No OTP has been sent. Please request a new code.'), 400);
    }

    // Check if OTP has expired
    if (isOtpExpired(formToken.otpState.expiresAt)) {
      return html(renderError('Your verification code has expired. Please request a new one.'), 400);
    }

    // Check max attempts
    if (formToken.otpState.attempts >= MAX_OTP_ATTEMPTS) {
      return html(renderError('Too many failed attempts. Please request a new code.'), 400);
    }

    const { code } = body as { code?: string };
    if (!code) {
      return html(renderOtpEntry(formToken, 'Please enter the verification code.'), 400);
    }

    const valid = verifyOtp(code, formToken.otpState.hashedOtp);

    if (!valid) {
      // Increment attempts
      const updatedOtpState: OtpState = {
        ...formToken.otpState,
        attempts: formToken.otpState.attempts + 1,
      };
      await updateFormToken(formToken.token, { otpState: updatedOtpState });

      const remaining = MAX_OTP_ATTEMPTS - updatedOtpState.attempts;
      const updatedToken = { ...formToken, otpState: updatedOtpState };
      return html(
        renderOtpEntry(updatedToken, `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`),
        400,
      );
    }

    // OTP verified — determine tier and create session
    const verifiedChannels = [
      ...(formToken.otpState.verifiedChannels ?? []),
      formToken.otpState.channel,
    ];

    // Tier 1 = single channel, Tier 2 = both channels
    const tier = verifiedChannels.includes('email') && verifiedChannels.includes('phone')
      ? VerificationTier.EnhancedOTP
      : VerificationTier.BasicOTP;

    // If tier 2 is required but we only have one channel, prompt for the other
    if (
      formToken.requiredTier === VerificationTier.EnhancedOTP &&
      tier < VerificationTier.EnhancedOTP
    ) {
      // Update verified channels and prompt for the other channel
      const updatedOtpState: OtpState = {
        ...formToken.otpState,
        verifiedChannels,
      };
      await updateFormToken(formToken.token, { otpState: updatedOtpState });

      const updatedToken = { ...formToken, otpState: updatedOtpState };
      return html(renderOtpSend(updatedToken));
    }

    // Create session
    const session = await createSession(
      formToken.userId,
      formToken.tenantId,
      tier,
    );

    // Clean up the form token
    await deleteFormToken(formToken.token);

    const redirectUrl = formToken.callbackUrl
      ? `${formToken.callbackUrl}${formToken.callbackUrl.includes('?') ? '&' : '?'}sessionId=${session.sessionId}`
      : undefined;

    return html(renderSuccess('Verification successful.', redirectUrl));
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a field value from form submission data.
 * Looks for "module.field" key.
 */
function extractField(
  data: Record<string, unknown>,
  module: string,
  field: string,
): unknown {
  return data[`${module}.${field}`];
}

/**
 * Assemble sub-fields (e.g. address.street, address.city) into a single
 * object for custom component validation.
 */
function assembleSubFields(
  data: Record<string, unknown>,
  fieldPrefix: string,
): Record<string, unknown> | undefined {
  const result: Record<string, unknown> = {};
  let found = false;

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(`${fieldPrefix}.`)) {
      const subKey = key.slice(fieldPrefix.length + 1);
      result[subKey] = value;
      found = true;
    }
  }

  return found ? result : undefined;
}

/**
 * Detect if the request body is in Frodo Collect format:
 * { fields: [{ module, field, value }], source?: string }
 */
function isCollectFormat(body: Record<string, unknown>): boolean {
  return Array.isArray(body.fields) &&
    body.fields.length > 0 &&
    typeof body.fields[0] === 'object' &&
    body.fields[0] !== null &&
    'module' in body.fields[0] &&
    'field' in body.fields[0];
}

/**
 * Normalize Frodo Collect array-of-fields format into flat module.field keys.
 * If the body is already flat (standard HTML form), return it as-is.
 */
function normalizeSubmission(body: Record<string, unknown>): Record<string, unknown> {
  if (!isCollectFormat(body)) {
    return body;
  }

  const flat: Record<string, unknown> = {};
  const fields = body.fields as { module: string; field: string; value: unknown }[];
  for (const entry of fields) {
    flat[`${entry.module}.${entry.field}`] = entry.value;
  }
  return flat;
}

/**
 * Detect if the request is from a programmatic JSON client (e.g., Frodo Collect)
 * rather than an HTMX form submission from the browser.
 *
 * HTMX sends "HX-Request: true" — these should get HTML responses.
 * Frodo Collect sends plain JSON without the HX-Request header.
 */
function isJsonRequest(headers: Record<string, string | undefined>): boolean {
  // HTMX browser forms always get HTML back, even though they send JSON
  if (headers['hx-request'] === 'true') return false;
  const ct = headers['content-type'] ?? '';
  return ct.includes('application/json');
}
