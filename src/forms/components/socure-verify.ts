import type { CustomFieldComponent } from '../types.js';

/**
 * Socure Identity Verification form component.
 *
 * Multi-step inline flow:
 * 1. Collect DOB + phone → start evaluation (triggers OTP)
 * 2. Enter OTP code → verify → unlock prefill data
 * 3. Confirm/edit prefilled identity → submit KYC
 * 4. If REVIEW → launch DocV (ID scan + selfie)
 * 5. Result: ACCEPT / REJECT
 *
 * Usage: { module: 'identity', field: 'socureVerify', label: 'Identity Verification', inputType: 'socure-verify', required: true }
 */
export const socureVerifyComponent: CustomFieldComponent = {
  name: 'socure-verify',
  description: 'Socure RiskOS identity verification with Prefill, OTP, KYC, and DocV step-up',

  render(field, formToken) {
    const req = field.required ? 'required' : '';
    const mark = field.required ? '<span class="required-mark">&thinsp;*</span>' : '';
    const sdkKey = process.env.PROVIDER_SOCURE_SDK_KEY ?? '';

    return `
      <div class="socure-verify-field" id="socure-container">
        <label class="form-label"><span class="label-text">${field.label}${mark}</span></label>

        <!-- Step 1: DOB + Phone -->
        <div id="socure-step-start" class="socure-step">
          <div class="socure-card">
            <div class="socure-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <strong>Verify your identity</strong>
              <span>We'll send a verification code to your phone to confirm your identity.</span>
            </div>
          </div>
          <div class="socure-form-grid">
            <label class="form-label"><span class="label-text">Date of Birth</span>
              <input type="date" id="socure-dob" class="form-input" required />
            </label>
            <label class="form-label"><span class="label-text">Phone Number</span>
              <input type="text" id="socure-phone" class="form-input" inputmode="tel" placeholder="(555) 000-0000" data-imask="(000) 000-0000" required />
            </label>
          </div>
          <button type="button" class="btn-plaid" onclick="socureStartEval()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
            Send Verification Code
          </button>
          <p style="text-align:center;margin-top:0.75rem;"><a href="#" onclick="socureFallback();return false;" style="color:var(--gray-400);font-size:0.8rem;text-decoration:none;">Enter information manually instead</a></p>
        </div>

        <!-- Step 2: OTP Entry -->
        <div id="socure-step-otp" class="socure-step" style="display:none;">
          <div class="socure-card">
            <div class="socure-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <strong>Enter verification code</strong>
              <span>We sent a 6-digit code to your phone.</span>
            </div>
          </div>
          <div class="otp-input-wrapper" style="margin:1rem 0;">
            <input type="text" id="socure-otp-code" class="otp-input" maxlength="6" inputmode="numeric" placeholder="000000" autocomplete="one-time-code" />
          </div>
          <div id="socure-otp-error" class="socure-error" style="display:none;"></div>
          <button type="button" class="btn-plaid" onclick="socureVerifyOtp()">Verify Code</button>
        </div>

        <!-- Step 3: Confirm identity from prefill -->
        <div id="socure-step-kyc" class="socure-step" style="display:none;">
          <div class="socure-card">
            <div class="socure-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <strong>Is this you?</strong>
              <span>We found the following information linked to your phone number.</span>
            </div>
          </div>
          <div class="socure-confirm-card">
            <div class="socure-confirm-row">
              <span class="socure-confirm-label">Name</span>
              <span class="socure-confirm-value" id="socure-confirm-name">—</span>
            </div>
            <div class="socure-confirm-row">
              <span class="socure-confirm-label">SSN</span>
              <span class="socure-confirm-value" id="socure-confirm-ssn">—</span>
            </div>
          </div>
          <div id="socure-kyc-error" class="socure-error" style="display:none;"></div>
          <div style="display:flex;gap:0.75rem;">
            <button type="button" class="btn-secondary" style="flex:1;" onclick="socureFallback()">No, that's not me</button>
            <button type="button" class="btn-plaid" style="flex:1;" onclick="socureConfirmIdentity()">Yes, that's me</button>
          </div>
        </div>

        <!-- Step 4: DocV (if needed) -->
        <div id="socure-step-docv" class="socure-step" style="display:none;">
          <div class="socure-card">
            <div class="socure-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div>
              <strong>Document verification required</strong>
              <span>Please scan your government-issued ID and take a selfie to complete verification.</span>
            </div>
          </div>
          <div id="socure-docv-container"></div>
        </div>

        <!-- Loading state -->
        <div id="socure-step-loading" class="socure-step" style="display:none;">
          <div class="socure-card">
            <div class="plaid-link-spinner"></div>
            <span>Verifying your identity...</span>
          </div>
        </div>

        <!-- Success -->
        <div id="socure-step-success" class="socure-step" style="display:none;">
          <div class="socure-card socure-card-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div>
              <strong id="socure-success-title">Identity verified</strong>
              <span id="socure-success-detail">Your identity has been confirmed.</span>
            </div>
          </div>
        </div>

        <!-- Fallback: manual data collection when Socure can't verify -->
        <div id="socure-step-fallback" class="socure-step" style="display:none;">
          <div class="socure-card socure-card-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>We couldn't verify automatically. Please enter your information manually.</span>
          </div>
          <div class="socure-form-grid">
            <label class="form-label"><span class="label-text">First Name</span>
              <input type="text" id="socure-fb-first-name" class="form-input" required />
            </label>
            <label class="form-label"><span class="label-text">Last Name</span>
              <input type="text" id="socure-fb-last-name" class="form-input" required />
            </label>
            <label class="form-label"><span class="label-text">Date of Birth</span>
              <input type="date" id="socure-fb-dob" class="form-input" required />
            </label>
            <label class="form-label"><span class="label-text">Phone Number</span>
              <input type="text" id="socure-fb-phone" class="form-input" inputmode="tel" placeholder="(555) 000-0000" data-imask="(000) 000-0000" />
            </label>
            <label class="form-label"><span class="label-text">Email</span>
              <input type="email" id="socure-fb-email" class="form-input" placeholder="you@example.com" />
            </label>
            <label class="form-label"><span class="label-text">SSN</span>
              <input type="text" id="socure-fb-ssn" class="form-input" inputmode="numeric" data-imask="000-00-0000" placeholder="000-00-0000" />
            </label>
          </div>
          <button type="button" class="btn-plaid" onclick="socureSaveManual()">Continue</button>
        </div>

        <!-- Hidden input for form submission -->
        <input type="hidden" name="${field.module}.${field.field}" id="socure-result" value="" ${req} />
      </div>

      ${sdkKey ? '<script src="https://websdk.socure.com/bundle.js"><\/script>' : ''}
      <script>
        var socureFormToken = '${formToken}';
        var socureSdkKey = '${sdkKey}';
        var socureStoredPhone = '';
        var socureStoredDob = '';
        var socurePrefillData = null;

        function socureShowStep(step) {
          ['start','otp','kyc','docv','loading','success','fallback'].forEach(function(s) {
            var el = document.getElementById('socure-step-' + s);
            if (el) el.style.display = s === step ? '' : 'none';
          });
          // Re-init IMask on newly visible inputs
          if (typeof IMask !== 'undefined') {
            setTimeout(function() {
              document.querySelectorAll('[data-imask]').forEach(function(el) {
                if (!el._imask) {
                  var pattern = el.getAttribute('data-imask');
                  el._imask = IMask(el, { mask: pattern });
                }
              });
            }, 50);
          }
        }

        function socureFallback() {
          // Pre-fill fallback form with whatever we have
          if (socureStoredDob) {
            var dobEl = document.getElementById('socure-fb-dob');
            if (dobEl) dobEl.value = socureStoredDob;
          }
          socureShowStep('fallback');
        }

        function socureSaveManual() {
          var fn = document.getElementById('socure-fb-first-name').value.trim();
          var ln = document.getElementById('socure-fb-last-name').value.trim();
          if (!fn || !ln) { alert('First and last name are required'); return; }
          var ssnEl = document.getElementById('socure-fb-ssn');
          var rawSsn = ssnEl && ssnEl._imask ? ssnEl._imask.unmaskedValue : (ssnEl ? ssnEl.value.replace(/\\D/g, '') : '');
          document.getElementById('socure-result').value = JSON.stringify({
            verified: false,
            manual: true,
            firstName: fn,
            lastName: ln,
            dateOfBirth: document.getElementById('socure-fb-dob').value || undefined,
            ssn: rawSsn || undefined,
            email: document.getElementById('socure-fb-email').value.trim() || undefined
          });
          document.getElementById('socure-success-title').textContent = 'Information collected';
          document.getElementById('socure-success-detail').textContent = 'Your details have been recorded.';
          socureShowStep('success');
        }

        function socureShowError(containerId, msg) {
          var el = document.getElementById(containerId);
          if (el) { el.textContent = msg; el.style.display = ''; }
        }

        function socureHideError(containerId) {
          var el = document.getElementById(containerId);
          if (el) el.style.display = 'none';
        }

        function socureStartEval() {
          var dobEl = document.getElementById('socure-dob');
          var phoneEl = document.getElementById('socure-phone');
          var dob = dobEl.value;
          var rawPhone = phoneEl._imask ? phoneEl._imask.unmaskedValue : phoneEl.value.replace(/\\D/g, '');

          if (!dob) { dobEl.focus(); return; }
          if (rawPhone.length < 10) { phoneEl.focus(); return; }

          // Format phone to E.164
          var phone = '+1' + rawPhone;
          socureStoredPhone = phone;
          socureStoredDob = dob;

          socureShowStep('loading');

          fetch('/socure/start-evaluation', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({formToken: socureFormToken, dateOfBirth: dob, phoneNumber: phone})
          })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { socureShowStep('start'); alert(data.error); return; }
            if (data.error) { socureFallback(); return; }
            if (data.otpTriggered) {
              socureShowStep('otp');
              document.getElementById('socure-otp-code').focus();
            } else if (data.decision === 'ACCEPT') {
              document.getElementById('socure-result').value = JSON.stringify({verified:true,decision:'ACCEPT'});
              socureShowStep('success');
            } else if (data.decision === 'REJECT') {
              // Rejected — fall back to manual collection
              socureFallback();
            } else {
              // Unknown state — fall back
              socureFallback();
            }
          })
          .catch(function() { socureFallback(); });
        }

        function socureVerifyOtp() {
          var code = document.getElementById('socure-otp-code').value.trim();
          if (code.length !== 6) { document.getElementById('socure-otp-code').focus(); return; }

          socureHideError('socure-otp-error');
          socureShowStep('loading');

          fetch('/socure/verify-otp', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({formToken: socureFormToken, code: code})
          })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) {
              socureShowStep('otp');
              socureShowError('socure-otp-error', data.error + ' You can also enter your information manually.');
              // Add a skip link
              var errEl = document.getElementById('socure-otp-error');
              if (errEl && !errEl.querySelector('a')) {
                errEl.innerHTML += ' <a href="#" onclick="socureFallback();return false;" style="color:inherit;text-decoration:underline;">Enter manually</a>';
              }
              return;
            }
            if (data.decision === 'REJECT') {
              // OTP failed — offer manual entry
              socureFallback();
              return;
            }

            // Show confirmation with prefill data
            socurePrefillData = data.prefillData;
            var firstName = '';
            var lastName = '';
            var ssnLast4 = '';

            if (data.prefillData && data.prefillData.individual) {
              var ind = data.prefillData.individual;
              firstName = ind.given_name || '';
              lastName = ind.family_name || '';
              if (ind.national_id) {
                var ssn = String(ind.national_id).replace(/\D/g, '');
                ssnLast4 = ssn.length >= 4 ? '***-**-' + ssn.slice(-4) : '';
              }
            }

            if (firstName || lastName) {
              document.getElementById('socure-confirm-name').textContent = (firstName + ' ' + lastName).trim();
              document.getElementById('socure-confirm-ssn').textContent = ssnLast4 || 'Not available';
              socureShowStep('kyc');
            } else {
              // No prefill data — fall back to manual
              socureFallback();
            }
          })
          .catch(function() { socureFallback(); });
        }

        function socureConfirmIdentity() {
          // User confirmed the prefilled identity — submit KYC with the prefill data
          var ind = socurePrefillData && socurePrefillData.individual ? socurePrefillData.individual : {};

          socureHideError('socure-kyc-error');
          socureShowStep('loading');

          fetch('/socure/submit-kyc', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
              formToken: socureFormToken,
              firstName: ind.given_name || '',
              lastName: ind.family_name || '',
              email: ind.email || undefined,
              ssn: ind.national_id || undefined,
              dateOfBirth: socureStoredDob,
              phoneNumber: socureStoredPhone,
              address: ind.address ? {
                street: ind.address.line_1 || undefined,
                city: ind.address.locality || undefined,
                state: ind.address.major_admin_division || undefined,
                zip: ind.address.postal_code || undefined
              } : undefined
            })
          })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.error) { socureShowStep('kyc'); socureShowError('socure-kyc-error', data.error); return; }

            if (data.decision === 'ACCEPT') {
              document.getElementById('socure-result').value = JSON.stringify({
                verified: true, decision: 'ACCEPT', evalId: data.evalId,
                firstName: ind.given_name, lastName: ind.family_name
              });
              socureShowStep('success');
            } else if (data.decision === 'REJECT') {
              // KYC rejected — fall back to manual
              socureFallback();
            } else if (data.docvRequired && data.docvTransactionToken) {
              socureShowStep('docv');
              if (window.SocureDocVSDK && socureSdkKey) {
                window.SocureDocVSDK.launch(
                  socureSdkKey,
                  data.docvTransactionToken,
                  '#socure-docv-container',
                  {qrCodeNeeded: true, closeCaptureWindowOnComplete: true}
                );
              } else {
                document.getElementById('socure-docv-container').innerHTML =
                  '<p style="color:var(--gray-500);font-size:0.85rem;padding:1rem;">Document verification initiated. You will receive the result shortly.</p>';
              }
            } else {
              socureFallback();
            }
          })
          .catch(function() { socureFallback(); });
        }
      </script>
    `;
  },

  validate(value, field) {
    if (!field.required) return null;
    if (!value) return 'Please complete identity verification';
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (!parsed.verified) return 'Please complete identity verification';
    } catch {
      return 'Please complete identity verification';
    }
    return null;
  },

  transformValue(value) {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  },
};
