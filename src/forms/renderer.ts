import { isCustomComponent, getComponent } from './components/registry.js';
import type { FormField, FormStep, FormToken } from './types.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render a complete HTML page for the given form token.
 * For multi-step forms, renders the current step.
 */
export function renderForm(formToken: FormToken): string {
  const { steps } = formToken.formDefinition;

  // Multi-step: render the current step
  if (steps && steps.length > 0) {
    const stepIndex = formToken.currentStep ?? 0;
    return renderStep(formToken, stepIndex);
  }

  // Single-step: render all fields
  const fieldsHtml = formToken.formDefinition.fields
    .map((field, i) => {
      const html = isCustomComponent(field.inputType)
        ? getComponent(field.inputType)!.render(field, formToken.token)
        : renderStandardField(field);
      return `<div class="field-group" style="animation-delay: ${i * 60}ms">${html}</div>`;
    })
    .join('\n');

  return renderPage({
    title: formToken.formDefinition.title,
    fieldsHtml,
    token: formToken.token,
    formType: formToken.formDefinition.type,
    fields: formToken.formDefinition.fields,
  });
}

/**
 * Render a single step of a multi-step form.
 */
export function renderStep(formToken: FormToken, stepIndex: number): string {
  const steps = formToken.formDefinition.steps!;
  const step = steps[stepIndex];
  const totalSteps = steps.length;
  const isLast = stepIndex === totalSteps - 1;

  const fieldsHtml = step.fields
    .map((field, i) => {
      const html = isCustomComponent(field.inputType)
        ? getComponent(field.inputType)!.render(field, formToken.token)
        : renderStandardField(field);
      return `<div class="field-group" style="animation-delay: ${i * 60}ms">${html}</div>`;
    })
    .join('\n');

  const progressHtml = renderProgress(stepIndex, totalSteps, steps);
  const descriptionHtml = step.description
    ? `<p class="step-description">${escapeHtml(step.description)}</p>`
    : '';

  // Hide the step's submit button when all fields are self-managing components
  // (e.g., plaid-link and socure-verify handle their own submit flow)
  const SELF_MANAGING_TYPES = new Set(['plaid-link', 'socure-verify']);
  const allSelfManaging = step.fields.every((f) => SELF_MANAGING_TYPES.has(f.inputType));

  const buttonLabel = isLast ? 'Submit' : 'Continue';
  const buttonIcon = isLast
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

  // Step submits to /forms/:token/step which validates, persists, and returns the next step
  const submitUrl = isLast
    ? `/forms/${formToken.token}/submit`
    : `/forms/${formToken.token}/step`;

  const collectFields = step.fields
    .map((f) => {
      const req = f.required ? 'true' : 'false';
      return `  collect.addField({ module: '${escapeJs(f.module)}', field: '${escapeJs(f.field)}', required: ${req} });`;
    })
    .join('\n');

  const collectScript = `
    <script src="/frodo-collect.js"></script>
    <script>
      var collect = new FrodoCollect({
        token: '${escapeJs(formToken.token)}',
        source: 'user',
      });
${collectFields}
    </script>
  `;

  const body = `
    <div class="card form-card">
      ${progressHtml}
      <h1>${escapeHtml(step.title)}</h1>
      ${descriptionHtml}
      <form hx-post="${submitUrl}" hx-target="body" hx-swap="innerHTML" hx-ext="json-enc" class="form-body">
        ${fieldsHtml}
        ${allSelfManaging ? '' : `<div class="step-actions">
          ${stepIndex > 0 ? '<button type="button" class="btn-secondary" onclick="history.back()">Back</button>' : '<span></span>'}
          <button type="submit" class="btn-primary">
            ${buttonLabel}
            ${buttonIcon}
          </button>
        </div>`}
      </form>
    </div>
    ${collectScript}
  `;

  return renderLayout(formToken.formDefinition.title, body);
}

function renderProgress(current: number, total: number, steps: FormStep[]): string {
  const segments = steps.map((step, i) => {
    let state = 'upcoming';
    if (i < current) state = 'completed';
    if (i === current) state = 'active';
    return `
      <div class="progress-step ${state}">
        <div class="progress-dot">
          ${state === 'completed'
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
            : `<span>${i + 1}</span>`}
        </div>
        <span class="progress-label">${escapeHtml(step.title)}</span>
      </div>`;
  }).join('\n');

  return `
    <div class="progress-bar">
      ${segments}
      <div class="progress-track">
        <div class="progress-fill" style="width: ${total > 1 ? (current / (total - 1)) * 100 : 100}%"></div>
      </div>
    </div>
  `;
}

/**
 * Render the consent page shown before identity/OTP verification forms.
 */
export function renderConsent(formToken: FormToken, consentText: string): string {
  const body = `
    <div class="card consent-card">
      <div class="card-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <h1>Authorization Required</h1>
      <p class="consent-subtitle">Please review and accept the following terms to continue.</p>
      <div class="consent-text">${escapeHtml(consentText)}</div>
      <form hx-post="/forms/${formToken.token}/consent" hx-target="body" hx-swap="innerHTML" hx-ext="json-enc">
        <label class="checkbox-label">
          <input type="checkbox" name="accepted" value="true" required />
          <span class="checkbox-custom"></span>
          <span>I have read and agree to the above terms</span>
        </label>
        <button type="submit" class="btn-primary">Continue</button>
      </form>
    </div>
  `;

  return renderLayout(formToken.formDefinition.title, body);
}

/**
 * Render a confirmation/success page.
 */
export function renderSuccess(message: string, callbackUrl?: string): string {
  const redirect = callbackUrl
    ? `<a href="${escapeHtml(callbackUrl)}" class="btn-primary" style="display:inline-block;text-decoration:none;margin-top:1rem;">Continue</a>
       <script>setTimeout(function(){ window.location.href="${escapeHtml(callbackUrl)}"; }, 2000);</script>`
    : '';

  const body = `
    <div class="card status-card success-card">
      <div class="status-icon success-icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h1>Verified</h1>
      <p>${escapeHtml(message)}</p>
      ${redirect}
    </div>
  `;

  return renderLayout('Success', body);
}

/**
 * Render an error page.
 */
export function renderError(message: string): string {
  const body = `
    <div class="card status-card error-card">
      <div class="status-icon error-icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h1>Verification Failed</h1>
      <p>${escapeHtml(message)}</p>
    </div>
  `;

  return renderLayout('Error', body);
}

/**
 * Render the OTP entry form.
 */
export function renderOtpEntry(formToken: FormToken, errorMessage?: string): string {
  const channel = formToken.otpState?.channel ?? 'contact';
  const errorHtml = errorMessage
    ? `<div class="otp-error">${escapeHtml(errorMessage)}</div>`
    : '';

  const body = `
    <div class="card otp-card">
      <div class="card-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h1>Enter verification code</h1>
      <p class="otp-subtitle">We sent a 6-digit code to your <strong>${escapeHtml(channel)}</strong>.</p>
      ${errorHtml}
      <form hx-post="/forms/${formToken.token}/verify-otp" hx-target="body" hx-swap="innerHTML" hx-ext="json-enc">
        <div class="otp-input-wrapper">
          <input
            type="text"
            name="code"
            maxlength="6"
            pattern="\\d{6}"
            inputmode="numeric"
            required
            autofocus
            autocomplete="one-time-code"
            class="otp-input"
            placeholder="000000"
          />
        </div>
        <button type="submit" class="btn-primary">Verify Code</button>
      </form>
      <p class="otp-hint">Didn't receive a code? Check your spam folder or request a new one.</p>
    </div>
  `;

  return renderLayout('Verification', body);
}

/**
 * Render the OTP channel selection screen (for sending OTP).
 */
export function renderOtpSend(formToken: FormToken): string {
  const body = `
    <div class="card otp-card">
      <div class="card-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </div>
      <h1>Verify your identity</h1>
      <p class="otp-subtitle">Choose how you'd like to receive your verification code.</p>
      <form hx-post="/forms/${formToken.token}/send-otp" hx-target="body" hx-swap="innerHTML" hx-ext="json-enc">
        <div class="channel-options">
          <label class="channel-option">
            <input type="radio" name="channel" value="email" checked />
            <div class="channel-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <div>
                <strong>Email</strong>
                <span>Send code to your email address</span>
              </div>
            </div>
          </label>
          <label class="channel-option">
            <input type="radio" name="channel" value="phone" />
            <div class="channel-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              <div>
                <strong>Phone</strong>
                <span>Send code to your phone number</span>
              </div>
            </div>
          </label>
        </div>
        <button type="submit" class="btn-primary">Send Code</button>
      </form>
    </div>
  `;

  return renderLayout('Verify Identity', body);
}

// ---------------------------------------------------------------------------
// Standard field rendering
// ---------------------------------------------------------------------------

export function renderStandardField(field: FormField): string {
  const required = field.required ? ' required' : '';
  const name = `${field.module}.${field.field}`;
  const pattern = field.pattern ? ` pattern="${escapeHtml(field.pattern)}"` : '';
  const minLen = field.minLength !== undefined ? ` minlength="${field.minLength}"` : '';
  const maxLen = field.maxLength !== undefined ? ` maxlength="${field.maxLength}"` : '';
  const requiredMark = field.required ? '<span class="required-mark">&thinsp;*</span>' : '';

  switch (field.inputType) {
    case 'select':
      return `
        <label class="form-label"><span class="label-text">${escapeHtml(field.label)}${requiredMark}</span>
          <select name="${name}" class="form-input"${required}>
            <option value="">Select an option</option>
            ${(field.options ?? []).map((o) => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join('\n')}
          </select>
        </label>
      `;

    case 'radio':
      return `
        <fieldset class="form-fieldset">
          <legend class="form-label">${escapeHtml(field.label)}${requiredMark}</legend>
          <div class="radio-group">
            ${(field.options ?? []).map((o) => `
              <label class="radio-label">
                <input type="radio" name="${name}" value="${escapeHtml(o.value)}"${required} />
                <span class="radio-custom"></span>
                <span>${escapeHtml(o.label)}</span>
              </label>
            `).join('\n')}
          </div>
        </fieldset>
      `;

    case 'checkbox':
      return `
        <label class="checkbox-label">
          <input type="checkbox" name="${name}" value="true"${required} />
          <span class="checkbox-custom"></span>
          <span>${escapeHtml(field.label)}</span>
        </label>
      `;

    case 'textarea':
      return `
        <label class="form-label"><span class="label-text">${escapeHtml(field.label)}${requiredMark}</span>
          <textarea name="${name}" class="form-input form-textarea" rows="4"${required}${minLen}${maxLen}></textarea>
        </label>
      `;

    case 'ssn': {
      const ssnMask = field.mask !== false ? (field.mask ?? '000-00-0000') : '';
      const ssnMaskAttr = ssnMask ? ` data-imask="${escapeHtml(ssnMask)}"` : '';
      return `
        <label class="form-label"><span class="label-text">${escapeHtml(field.label)}${requiredMark}</span>
          <div class="input-icon-wrapper">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="text" name="${name}" class="form-input has-icon" inputmode="numeric" autocomplete="off" placeholder="000-00-0000"${ssnMaskAttr}${required} />
          </div>
        </label>
      `;
    }

    case 'currency': {
      const currMask = field.mask !== false ? (field.mask ?? 'currency') : '';
      const currMaskAttr = currMask ? ` data-imask="${escapeHtml(currMask)}"` : '';
      return `
        <label class="form-label"><span class="label-text">${escapeHtml(field.label)}${requiredMark}</span>
          <div class="input-icon-wrapper">
            <span class="input-icon currency-icon">$</span>
            <input type="text" name="${name}" class="form-input has-icon" inputmode="decimal" placeholder="0.00"${currMaskAttr}${required} />
          </div>
        </label>
      `;
    }

    case 'phone': {
      const phoneMask = field.mask !== false ? (field.mask ?? '(000) 000-0000') : '';
      const phoneMaskAttr = phoneMask ? ` data-imask="${escapeHtml(phoneMask)}"` : '';
      return `
        <label class="form-label"><span class="label-text">${escapeHtml(field.label)}${requiredMark}</span>
          <input type="text" name="${name}" class="form-input" inputmode="tel" placeholder="(555) 000-0000"${phoneMaskAttr}${required}${pattern}${minLen}${maxLen} />
        </label>
      `;
    }

    case 'date':
      return `
        <label class="form-label"><span class="label-text">${escapeHtml(field.label)}${requiredMark}</span>
          <input type="date" name="${name}" class="form-input"${required} />
        </label>
      `;

    case 'number':
      return `
        <label class="form-label"><span class="label-text">${escapeHtml(field.label)}${requiredMark}</span>
          <input type="number" name="${name}" class="form-input" inputmode="numeric"${required}${pattern}${minLen}${maxLen} />
        </label>
      `;

    case 'email':
      return `
        <label class="form-label"><span class="label-text">${escapeHtml(field.label)}${requiredMark}</span>
          <input type="email" name="${name}" class="form-input" placeholder="you@example.com"${required}${pattern}${minLen}${maxLen} />
        </label>
      `;

    case 'text':
    default:
      return `
        <label class="form-label"><span class="label-text">${escapeHtml(field.label)}${requiredMark}</span>
          <input type="text" name="${name}" class="form-input"${required}${pattern}${minLen}${maxLen} />
        </label>
      `;
  }
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

function renderPage(params: {
  title: string;
  fieldsHtml: string;
  token: string;
  formType: string;
  fields?: FormField[];
}): string {
  const collectFields = (params.fields ?? [])
    .map((f) => {
      const req = f.required ? 'true' : 'false';
      return `  collect.addField({ module: '${escapeJs(f.module)}', field: '${escapeJs(f.field)}', required: ${req} });`;
    })
    .join('\n');

  const collectScript = `
    <script src="/frodo-collect.js"></script>
    <script>
      var collect = new FrodoCollect({
        token: '${escapeJs(params.token)}',
        source: 'user',
      });
${collectFields}
    </script>
  `;

  const body = `
    <div class="card form-card">
      <h1>${escapeHtml(params.title)}</h1>
      <form hx-post="/forms/${params.token}/submit" hx-target="body" hx-swap="innerHTML" hx-ext="json-enc" class="form-body">
        ${params.fieldsHtml}
        <button type="submit" class="btn-primary">
          Submit
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </form>
    </div>
    ${collectScript}
  `;

  return renderLayout(params.title, body);
}

function renderLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — RAVEN</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cstyle%3Epath%7Bfill:%230A0A0A%7D@media(prefers-color-scheme:dark)%7Bpath%7Bfill:%23fff%7D%7D%3C/style%3E%3Cpath d='M0 0L305 0C345 0 400 2 420 30C415 75 310 140 235 195C160 255 140 400 162 512L0 512Z'/%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/htmx.org@2.0.4"></script>
  <script src="https://unpkg.com/htmx-ext-json-enc@2.0.1/json-enc.js"></script>
  <script src="https://unpkg.com/imask@7.6.1/dist/imask.min.js"></script>
  <style>${CSS}</style>
</head>
<body>
  <header class="top-bar">
    <div class="brand">
      <svg class="brand-icon" width="24" height="24" viewBox="0 0 3000 3000" fill="currentColor"><path d="M2162.9,2626.4c17.1-6.3,35.7-13.6,48.6-20.1-51.8-.7-99,.5-146.3-2.5-162.9-10.5-321.8-40.2-475.8-94.7-166.9-59.1-321-140.7-453.7-259.6-62.1-55.7-115.4-118.4-149.3-195.7-26.4-60.1-37.6-122.5-21.4-187.2,40.1-160.7,200.7-247.3,361.8-218-40.9,6.9-78.6,15.9-111.1,38.7-32.7,22.9-58.8,51.1-72.2,91.7,36.3-26.9,91.2-50.3,120.1-51.6-2.5,1.9-4.3,3.6-6.4,5-68.4,45.2-101.9,109.3-103.6,190.8-1.5,69.4,23.3,130.2,60.2,187.1,59.4,91.5,140.5,160.3,231.8,217.9,111.4,70.2,231,119.8,354.7,155.9,104,30.3,211.3,49.4,320,51.4,13.3.2,26.7,0,40,0-6.1-6.8-12.7-10.1-19-13.8-49-29.3-81.5-73.1-106-123.2-29.6-60.7-58.7-122.2-87.8-183.2-61.6-129.2-138.6-248-238.7-351.1-71.7-73.8-152.5-134.8-247.9-174.8-6.9-2.9-11.5-7.8-15.8-13.5-29.2-38.3-54-79.1-69.9-124.8-20.3-58.6-22.5-117.4.7-175.8,26.8-67.4,77.5-111.8,140.8-143.3,59.7-29.7,123.7-45.2,189.1-56.1,85.4-14.3,171.3-19.1,257.7-11.2,26.4,2.4,52.3,8.2,79.6,12.8-1.6-3.8-2.4-6.2-3.5-8.4-2.8-5.4-5.4-10.8-8.6-16-37.3-61.5-87.7-110.2-148.5-148.2-110.1-68.9-232.1-98.4-360.2-105.6-33.6-1.9-61.3-9.6-89.6-30.3-109.5-80.1-233.4-107.2-367.7-91.9-103.9,11.8-197.9,48.4-283.8,107.6-91.3,62.8-170.3,141.4-263.4,201.4,1.3,3.6,3.6,2.7,5.4,2.8,70.6,3.8,138.8-11.9,207.7-25.2-142.7,75.7-262.1,171.7-303,338.1,41.4-38.3,88-67.6,140.8-87.1-39,42-68.8,89.9-92.5,141.4-79.6,173.1-94.5,354.4-61,539.8,31.9,177,108.7,333.6,226.4,469.8,6.6,7.6,13.6,14.9,20.7,22.1,6.6,6.8,13.5,13.3,23.1,22.7l254,162c139.8,87.7,294.6,130.1,457.6,141.8,166.5,12,330.1-7.8,489.8-57.3,12.2-3.8,24.1-8.5,36-13.1s19.2-8.2,28.5-13.1l114-60.6c31.6-16.8,64.3-31.5,97.9-43.8ZM1326.1,1075.5c50.8-26.4,106-35.6,161.9-39.4,111.3-7.5,221.7-2.3,329.1,32,28.7,9.2,56.6,20.3,85.5,35-222-20.9-439.8-17.1-656.4,43.6,23-29.9,47.6-54.5,79.8-71.3ZM1150.4,943.8c31.7.5,57,26.5,56.9,58.5,0,30.6-26.9,56.6-57.6,55.9-31.8-.8-57-27-56.6-58.8.4-31.6,25.6-56,57.3-55.5Z"/><circle cx="1500" cy="1500" r="1319.5" fill="none" stroke="currentColor" stroke-width="109"/></svg>
      <span class="brand-name">RAVEN</span>
    </div>
    <span class="brand-tagline">Secure Verification</span>
  </header>
  <main class="main">
    ${bodyContent}
  </main>
  <footer class="footer">
    <span>Secured by RAVEN</span>
    <span class="footer-sep">&middot;</span>
    <a href="/legal/privacy-policy">Privacy</a>
    <span class="footer-sep">&middot;</span>
    <a href="/legal/terms-of-service">Terms</a>
  </footer>
  ${MASK_INIT_SCRIPT}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Embedded CSS
// ---------------------------------------------------------------------------

const CSS = `
  :root {
    --black: #0A0A0A;
    --gray-950: #141414;
    --gray-900: #1A1A1A;
    --gray-800: #262626;
    --gray-700: #3F3F3F;
    --gray-600: #525252;
    --gray-500: #737373;
    --gray-400: #A3A3A3;
    --gray-300: #D4D4D4;
    --gray-200: #E5E5E5;
    --gray-100: #F5F5F5;
    --gray-50: #FAFAFA;
    --white: #FFFFFF;
    --green-500: #22C55E;
    --green-50: #F0FDF4;
    --green-900: #14532D;
    --red-500: #EF4444;
    --red-50: #FEF2F2;
    --red-900: #7F1D1D;
    --radius: 10px;
    --radius-sm: 6px;
    --font: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --mono: 'IBM Plex Mono', 'SF Mono', monospace;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.06);
    --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font);
    background: var(--gray-100);
    color: var(--black);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    -webkit-font-smoothing: antialiased;
  }

  .top-bar {
    background: var(--black);
    color: var(--white);
    padding: 0 1.5rem;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .brand { display: flex; align-items: center; gap: 0.5rem; }
  .brand-icon { opacity: 0.9; }
  .brand-name { font-weight: 600; font-size: 0.85rem; letter-spacing: 0.12em; }
  .brand-tagline { font-size: 0.75rem; color: var(--gray-500); letter-spacing: 0.02em; }

  .main {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 3rem 1.5rem 4rem;
  }

  .card {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    padding: 2.5rem;
    width: 100%;
    max-width: 520px;
    animation: cardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .card h1 {
    font-size: 1.35rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin-bottom: 0.25rem;
    color: var(--black);
  }
  .card p {
    color: var(--gray-600);
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .form-body { display: flex; flex-direction: column; gap: 0; }
  .field-group {
    animation: fieldIn 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
    margin-bottom: 1.25rem;
  }
  @keyframes fieldIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .form-label {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--black);
    letter-spacing: 0.01em;
  }
  .label-text { display: inline; }
  .required-mark { color: var(--red-500); }

  .form-input {
    font-family: var(--font);
    font-size: 0.9rem;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-sm);
    background: var(--white);
    color: var(--black);
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
    width: 100%;
  }
  .form-input::placeholder { color: var(--gray-400); }
  .form-input:hover { border-color: var(--gray-400); }
  .form-input:focus { border-color: var(--black); box-shadow: 0 0 0 3px rgba(10,10,10,0.08); }
  .form-textarea { resize: vertical; min-height: 5rem; }
  select.form-input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.25rem;
  }

  .input-icon-wrapper { position: relative; display: flex; align-items: center; }
  .input-icon { position: absolute; left: 0.75rem; color: var(--gray-500); pointer-events: none; z-index: 1; }
  .currency-icon { font-family: var(--font); font-size: 0.9rem; font-weight: 500; }
  .has-icon { padding-left: 2.25rem; }

  .form-fieldset { border: none; }
  .radio-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .radio-label, .checkbox-label {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.9rem; color: var(--gray-700); cursor: pointer; padding: 0.4rem 0;
  }
  .radio-label input, .checkbox-label input { position: absolute; opacity: 0; width: 0; height: 0; }
  .radio-custom, .checkbox-custom {
    width: 18px; height: 18px; border: 2px solid var(--gray-300);
    border-radius: 50%; flex-shrink: 0; transition: all var(--transition); position: relative;
  }
  .checkbox-custom { border-radius: 4px; }
  .radio-label input:checked ~ .radio-custom,
  .checkbox-label input:checked ~ .checkbox-custom { border-color: var(--black); background: var(--black); }
  .radio-custom::after, .checkbox-custom::after { content: ''; position: absolute; display: none; }
  .radio-label input:checked ~ .radio-custom::after {
    display: block; width: 6px; height: 6px; background: var(--white);
    border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%,-50%);
  }
  .checkbox-label input:checked ~ .checkbox-custom::after {
    display: block; width: 5px; height: 9px; border: solid var(--white);
    border-width: 0 2px 2px 0; top: 1px; left: 5px; transform: rotate(45deg);
  }
  .radio-label input:focus-visible ~ .radio-custom,
  .checkbox-label input:focus-visible ~ .checkbox-custom { box-shadow: 0 0 0 3px rgba(10,10,10,0.08); }

  .btn-primary {
    font-family: var(--font); font-size: 0.9rem; font-weight: 500;
    background: var(--black); color: var(--white); border: none;
    border-radius: var(--radius-sm); padding: 0.7rem 1.5rem; cursor: pointer;
    transition: all var(--transition); display: inline-flex; align-items: center;
    justify-content: center; gap: 0.5rem; margin-top: 0.75rem; width: 100%;
    letter-spacing: 0.01em;
  }
  .btn-primary:hover { background: var(--gray-800); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
  .btn-primary:active { transform: translateY(0); background: var(--gray-950); }
  .btn-primary:focus-visible { outline: 2px solid var(--black); outline-offset: 2px; }

  .consent-card .card-icon { color: var(--black); margin-bottom: 1rem; }
  .consent-subtitle { color: var(--gray-500) !important; font-size: 0.85rem !important; }
  .consent-text {
    background: var(--gray-50); border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm); padding: 1.25rem; font-size: 0.85rem;
    line-height: 1.7; color: var(--gray-700); margin-bottom: 1.5rem;
    max-height: 240px; overflow-y: auto;
  }
  .consent-card .checkbox-label { margin-bottom: 0.5rem; }

  .otp-card .card-icon { color: var(--black); margin-bottom: 1rem; }
  .otp-subtitle { color: var(--gray-500) !important; font-size: 0.9rem !important; }
  .otp-input-wrapper { margin: 1.5rem 0; }
  .otp-input {
    font-family: var(--mono); font-size: 2rem; font-weight: 500;
    text-align: center; letter-spacing: 0.75em;
    padding: 0.75rem 1rem 0.75rem 1.75rem;
    border: 2px solid var(--gray-300); border-radius: var(--radius-sm);
    width: 100%; outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
    background: var(--gray-50); color: var(--black);
  }
  .otp-input::placeholder { color: var(--gray-300); letter-spacing: 0.5em; }
  .otp-input:focus { border-color: var(--black); box-shadow: 0 0 0 4px rgba(10,10,10,0.06); background: var(--white); }
  .otp-error {
    background: var(--red-50); color: var(--red-900);
    border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm);
    padding: 0.7rem 1rem; font-size: 0.85rem; margin-bottom: 1rem;
  }
  .otp-hint { color: var(--gray-400) !important; font-size: 0.8rem !important; text-align: center; margin-top: 1rem; margin-bottom: 0 !important; }

  .channel-options { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 0.5rem; }
  .channel-option input { position: absolute; opacity: 0; width: 0; height: 0; }
  .channel-card {
    display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem;
    border: 2px solid var(--gray-200); border-radius: var(--radius-sm);
    cursor: pointer; transition: all var(--transition);
  }
  .channel-card svg { flex-shrink: 0; color: var(--gray-500); transition: color var(--transition); }
  .channel-card div { display: flex; flex-direction: column; gap: 0.1rem; }
  .channel-card strong { font-size: 0.9rem; color: var(--black); }
  .channel-card span { font-size: 0.8rem; color: var(--gray-500); }
  .channel-option input:checked ~ .channel-card { border-color: var(--black); background: var(--gray-50); }
  .channel-option input:checked ~ .channel-card svg { color: var(--black); }
  .channel-card:hover { border-color: var(--gray-400); }
  .channel-option input:focus-visible ~ .channel-card { box-shadow: 0 0 0 3px rgba(10,10,10,0.08); }

  .status-card { text-align: center; padding: 3rem 2.5rem; }
  .status-icon { margin-bottom: 1.25rem; display: inline-flex; }
  .success-icon { color: var(--green-500); }
  .success-card h1 { color: var(--green-900); }
  .error-icon { color: var(--red-500); }
  .error-card h1 { color: var(--red-900); }

  .footer {
    text-align: center; padding: 1.25rem; font-size: 0.75rem;
    color: var(--gray-400); flex-shrink: 0; display: flex;
    justify-content: center; align-items: center; gap: 0.5rem;
  }
  .footer a { color: var(--gray-500); text-decoration: none; transition: color var(--transition); }
  .footer a:hover { color: var(--black); }
  .footer-sep { color: var(--gray-300); }

  /* --- Address component --- */
  .address-fieldset {
    border: none;
    padding: 0;
  }
  .address-fieldset > .form-label {
    margin-bottom: 0.75rem;
  }
  .address-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .address-street {
    grid-column: 1 / -1;
  }
  .address-city {
    grid-column: 1 / -1;
  }
  .address-state, .address-zip {
    grid-column: span 1;
  }

  /* --- Multi-step progress bar --- */
  .progress-bar {
    position: relative;
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    padding-bottom: 0.5rem;
  }
  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    z-index: 1;
    flex: 1;
  }
  .progress-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 600;
    border: 2px solid var(--gray-300);
    background: var(--white);
    color: var(--gray-400);
    transition: all 300ms ease;
  }
  .progress-step.active .progress-dot {
    border-color: var(--black);
    background: var(--black);
    color: var(--white);
  }
  .progress-step.completed .progress-dot {
    border-color: var(--black);
    background: var(--black);
    color: var(--white);
  }
  .progress-label {
    font-size: 0.7rem;
    color: var(--gray-400);
    text-align: center;
    max-width: 80px;
    line-height: 1.2;
  }
  .progress-step.active .progress-label { color: var(--black); font-weight: 500; }
  .progress-step.completed .progress-label { color: var(--gray-600); }
  .progress-track {
    position: absolute;
    top: 13px;
    left: 14%;
    right: 14%;
    height: 2px;
    background: var(--gray-200);
    z-index: 0;
  }
  .progress-fill {
    height: 100%;
    background: var(--black);
    transition: width 400ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .step-description {
    color: var(--gray-500) !important;
    font-size: 0.85rem !important;
    margin-bottom: 1.5rem !important;
  }
  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
  .btn-secondary {
    font-family: var(--font); font-size: 0.85rem; font-weight: 500;
    background: var(--white); color: var(--gray-600);
    border: 1px solid var(--gray-300); border-radius: var(--radius-sm);
    padding: 0.6rem 1.25rem; cursor: pointer;
    transition: all var(--transition);
  }
  .btn-secondary:hover { color: var(--black); border-color: var(--gray-400); }
  .step-actions .btn-primary { width: auto; flex: 1; max-width: 200px; margin-top: 0; }

  @media (max-width: 580px) {
    .progress-label { display: none; }
    .progress-track { left: 10%; right: 10%; }
    .step-actions .btn-primary { max-width: none; flex: 1; }
  }

  /* --- Socure Verify component --- */
  .socure-verify-field { margin-bottom: 0.25rem; }
  .socure-step { animation: fieldIn 350ms cubic-bezier(0.16, 1, 0.3, 1) both; }
  .socure-card {
    display: flex; align-items: center; gap: 1rem;
    padding: 1.25rem; border: 2px solid var(--gray-200);
    border-radius: var(--radius-sm); margin: 0.5rem 0;
  }
  .socure-card-icon { color: var(--gray-500); flex-shrink: 0; }
  .socure-card strong { font-size: 0.9rem; color: var(--black); display: block; }
  .socure-card span { font-size: 0.8rem; color: var(--gray-500); }
  .socure-card-info {
    border-color: var(--gray-300); background: var(--gray-50);
    padding: 0.9rem 1.25rem; gap: 0.75rem;
  }
  .socure-card-info svg { color: var(--gray-400); flex-shrink: 0; }
  .socure-card-info span { font-size: 0.8rem; color: var(--gray-500); }
  .socure-card-success { border-color: var(--green-500); background: var(--green-50); }
  .socure-card-success svg { color: var(--green-500); flex-shrink: 0; }
  .socure-card-success strong { color: var(--green-900); }
  .socure-card-success span { color: var(--green-900); opacity: 0.7; }
  .socure-card-error { border-color: var(--red-500); background: var(--red-50); }
  .socure-card-error svg { color: var(--red-500); flex-shrink: 0; }
  .socure-card-error strong { color: var(--red-900); }
  .socure-card-error span { color: var(--red-900); opacity: 0.7; }
  .socure-form-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0.75rem; margin: 1rem 0;
  }
  .socure-full-width { grid-column: 1 / -1; }
  .socure-confirm-card {
    background: var(--gray-50); border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm); padding: 1.25rem;
    margin: 1rem 0; display: flex; flex-direction: column; gap: 0.75rem;
  }
  .socure-confirm-row {
    display: flex; justify-content: space-between; align-items: center;
  }
  .socure-confirm-label {
    font-size: 0.8rem; font-weight: 500; color: var(--gray-500);
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .socure-confirm-value {
    font-size: 1rem; font-weight: 500; color: var(--black);
    letter-spacing: 0.02em;
  }
  .socure-error {
    background: var(--red-50); color: var(--red-900);
    border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm);
    padding: 0.7rem 1rem; font-size: 0.85rem; margin-bottom: 0.75rem;
  }
  @media (max-width: 580px) {
    .socure-form-grid { grid-template-columns: 1fr; }
  }

  /* --- Plaid Link component --- */
  .plaid-link-field { margin-bottom: 0.25rem; }
  .plaid-link-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-sm);
    margin: 0.5rem 0;
  }
  .plaid-link-icon { color: var(--gray-500); flex-shrink: 0; }
  .plaid-link-text { display: flex; flex-direction: column; gap: 0.15rem; }
  .plaid-link-text strong { font-size: 0.9rem; color: var(--black); }
  .plaid-link-text span { font-size: 0.8rem; color: var(--gray-500); }
  .plaid-link-card span { font-size: 0.85rem; color: var(--gray-500); }
  .btn-plaid {
    font-family: var(--font); font-size: 0.85rem; font-weight: 500;
    background: var(--white); color: var(--black);
    border: 1.5px solid var(--black); border-radius: var(--radius-sm);
    padding: 0.6rem 1.25rem; cursor: pointer;
    transition: all var(--transition);
    display: inline-flex; align-items: center; gap: 0.4rem;
    width: 100%;
    justify-content: center;
  }
  .btn-plaid:hover { background: var(--black); color: var(--white); }
  .btn-plaid:active { transform: translateY(1px); }
  .plaid-link-success-card {
    border-color: var(--green-500);
    background: var(--green-50);
  }
  .plaid-link-success-card svg { color: var(--green-500); flex-shrink: 0; }
  .plaid-link-success-card strong { color: var(--green-900); }
  .plaid-link-success-card span { color: var(--green-900); opacity: 0.7; }
  .plaid-link-error-card {
    border-color: var(--red-500);
    background: var(--red-50);
  }
  .plaid-link-error-card svg { color: var(--red-500); flex-shrink: 0; }
  .plaid-link-error-card strong { color: var(--red-900); }
  .plaid-link-error-card span { color: var(--red-900); opacity: 0.7; }
  .plaid-link-spinner {
    width: 20px; height: 20px;
    border: 2px solid var(--gray-200);
    border-top-color: var(--black);
    border-radius: 50%;
    animation: plaidSpin 0.6s linear infinite;
    flex-shrink: 0;
  }
  @keyframes plaidSpin { to { transform: rotate(360deg); } }

  @media (max-width: 580px) {
    .main { padding: 1.5rem 1rem 3rem; }
    .card { padding: 1.75rem 1.25rem; }
    .otp-input { font-size: 1.5rem; letter-spacing: 0.5em; padding-left: 1.25rem; }
    .brand-tagline { display: none; }
    .address-grid { grid-template-columns: 1fr; }
    .address-state, .address-zip { grid-column: span 1; }
  }
`;

// ---------------------------------------------------------------------------
// IMask initialization script
// ---------------------------------------------------------------------------

const MASK_INIT_SCRIPT = `
<script>
(function() {
  if (typeof IMask === 'undefined') return;

  var masks = {};

  function initMasks() {
    document.querySelectorAll('[data-imask]').forEach(function(el) {
      if (el._imask) return;
      var pattern = el.getAttribute('data-imask');
      var opts;
      if (pattern === 'currency') {
        opts = {
          mask: Number,
          scale: 2,
          thousandsSeparator: ',',
          padFractionalZeros: true,
          normalizeZeros: true,
          radix: '.',
          mapToRadix: ['.'],
          min: 0,
        };
      } else {
        opts = { mask: pattern };
      }
      var m = IMask(el, opts);
      el._imask = m;
      masks[el.name || el.getAttribute('data-mask-name') || ''] = m;
    });
  }

  // Init on load and after HTMX swaps (for dynamically loaded forms)
  initMasks();
  document.addEventListener('htmx:afterSwap', initMasks);

  // Before HTMX sends the request, replace masked values with unmasked raw values
  document.addEventListener('htmx:configRequest', function(e) {
    var params = e.detail.parameters;
    if (!params) return;
    document.querySelectorAll('[data-imask]').forEach(function(el) {
      var name = el.name;
      if (!name || !el._imask) return;
      // Swap the display name back to the real name if needed
      var rawName = name.replace(/^_display_/, '');
      params[rawName] = el._imask.unmaskedValue;
      if (name !== rawName) delete params[name];
    });
  });
})();
</script>`;

// ---------------------------------------------------------------------------
// Escape helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}
