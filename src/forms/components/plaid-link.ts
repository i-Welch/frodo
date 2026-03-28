import type { CustomFieldComponent } from '../types.js';

/**
 * Plaid Link custom form component.
 *
 * Renders a "Connect your bank account" button that opens Plaid Link.
 * After the user completes Link, the component exchanges the public token
 * for an access token and stores it in RAVEN's encrypted token store.
 *
 * Usage in a form definition:
 *   { module: 'financial', field: 'plaidLink', label: 'Bank Account', inputType: 'plaid-link', required: true }
 *
 * The value stored on submission is: { linked: true, institution: "Chase", accountCount: 3 }
 */
export const plaidLinkComponent: CustomFieldComponent = {
  name: 'plaid-link',
  description: 'Plaid Link bank account connection widget',

  render(field, formToken) {
    const req = field.required ? 'required' : '';
    const mark = field.required ? '<span class="required-mark">&thinsp;*</span>' : '';

    return `
      <div class="plaid-link-field" id="plaid-link-container">
        <label class="form-label"><span class="label-text">${field.label}${mark}</span></label>

        <!-- Initial state: connect button -->
        <div id="plaid-link-idle" class="plaid-link-state">
          <div class="plaid-link-card">
            <div class="plaid-link-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div class="plaid-link-text">
              <strong>Connect your bank account</strong>
              <span>Securely link your bank via Plaid to verify your financial information.</span>
            </div>
          </div>
          <button type="button" id="plaid-link-btn" class="btn-plaid" onclick="openPlaidLink()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Connect Account
          </button>
        </div>

        <!-- Loading state -->
        <div id="plaid-link-loading" class="plaid-link-state" style="display:none;">
          <div class="plaid-link-card">
            <div class="plaid-link-spinner"></div>
            <span>Opening secure connection...</span>
          </div>
        </div>

        <!-- Success state -->
        <div id="plaid-link-success" class="plaid-link-state" style="display:none;">
          <div class="plaid-link-card plaid-link-success-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div>
              <strong id="plaid-institution-name">Bank connected</strong>
              <span id="plaid-account-count"></span>
            </div>
          </div>
        </div>

        <!-- Error state -->
        <div id="plaid-link-error" class="plaid-link-state" style="display:none;">
          <div class="plaid-link-card plaid-link-error-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <div>
              <strong>Connection failed</strong>
              <span id="plaid-error-msg">Please try again.</span>
            </div>
          </div>
          <button type="button" class="btn-plaid" onclick="openPlaidLink()">Try Again</button>
        </div>

        <!-- Hidden input carries the link result for form submission -->
        <input type="hidden" name="${field.module}.${field.field}" id="plaid-link-value" value="" ${req} />
      </div>

      <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
      <script>
        var plaidFormToken = '${formToken}';
        var plaidHandler = null;

        function showState(state) {
          ['idle', 'loading', 'success', 'error'].forEach(function(s) {
            document.getElementById('plaid-link-' + s).style.display = s === state ? '' : 'none';
          });
        }

        function openPlaidLink() {
          showState('loading');

          // Get a Link token from our backend
          fetch('/plaid/create-link-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formToken: plaidFormToken }),
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.error) {
              document.getElementById('plaid-error-msg').textContent = data.error;
              showState('error');
              return;
            }

            plaidHandler = Plaid.create({
              token: data.link_token,
              onSuccess: function(publicToken, metadata) {
                showState('loading');

                // Exchange the token via our backend
                fetch('/plaid/exchange-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    formToken: plaidFormToken,
                    publicToken: publicToken,
                    institutionId: metadata.institution ? metadata.institution.institution_id : null,
                    institutionName: metadata.institution ? metadata.institution.name : null,
                    accounts: metadata.accounts,
                  }),
                })
                .then(function(res) { return res.json(); })
                .then(function(result) {
                  if (result.success) {
                    document.getElementById('plaid-institution-name').textContent = result.institution || 'Bank connected';
                    document.getElementById('plaid-account-count').textContent = result.accountCount + ' account' + (result.accountCount === 1 ? '' : 's') + ' linked';
                    document.getElementById('plaid-link-value').value = JSON.stringify({
                      linked: true,
                      institution: result.institution,
                      accountCount: result.accountCount,
                    });
                    showState('success');

                    // Auto-submit the form after a short delay so the user sees the success state
                    setTimeout(function() {
                      var form = document.getElementById('plaid-link-value').closest('form');
                      if (form) {
                        // Trigger HTMX submission
                        if (window.htmx) {
                          window.htmx.trigger(form, 'submit');
                        } else {
                          form.requestSubmit();
                        }
                      }
                    }, 1500);
                  } else {
                    document.getElementById('plaid-error-msg').textContent = result.error || 'Exchange failed';
                    showState('error');
                  }
                })
                .catch(function(err) {
                  document.getElementById('plaid-error-msg').textContent = err.message;
                  showState('error');
                });
              },
              onExit: function(err) {
                if (err) {
                  document.getElementById('plaid-error-msg').textContent = err.display_message || err.error_message || 'Connection cancelled';
                  showState('error');
                } else {
                  showState('idle');
                }
              },
              onEvent: function(eventName) {
                // Could log events for analytics
              },
            });

            plaidHandler.open();
          })
          .catch(function(err) {
            document.getElementById('plaid-error-msg').textContent = err.message;
            showState('error');
          });
        }
      </script>
    `;
  },

  validate(value, field) {
    if (!field.required) return null;
    if (!value) return 'Please connect your bank account';
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (!parsed.linked) return 'Please connect your bank account';
    } catch {
      return 'Please connect your bank account';
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
