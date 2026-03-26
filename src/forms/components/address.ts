import type { CustomFieldComponent } from '../types.js';

const US_STATES: [string, string][] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'], ['DC', 'District of Columbia'],
];

/**
 * Structured address input with autocomplete support.
 *
 * This is a built-in example component. To integrate SmartyStreets (or any
 * address-verification service), create a new component that:
 *   1. Renders with hx-get to hit a /forms/:token/autocomplete endpoint
 *   2. Calls the SmartyStreets API inside `validate()` or `transformValue()`
 *   3. Returns the standardised/verified address from `transformValue()`
 */
export const addressComponent: CustomFieldComponent = {
  name: 'address',
  description: 'Structured address input with autocomplete support (SmartyStreets ready)',

  render(field, formToken) {
    const req = field.required ? ' required' : '';
    const mark = field.required ? '<span class="required-mark">&thinsp;*</span>' : '';
    return `
      <fieldset class="address-fieldset">
        <legend class="form-label"><span class="label-text">${field.label}${mark}</span></legend>
        <div class="address-grid">
          <label class="form-label address-street"><span class="label-text">Street</span>
            <input type="text" name="${field.field}.street" class="form-input" placeholder="123 Main St"${req} />
          </label>
          <label class="form-label address-city"><span class="label-text">City</span>
            <input type="text" name="${field.field}.city" class="form-input" placeholder="Austin"${req} />
          </label>
          <label class="form-label address-state"><span class="label-text">State</span>
            <select name="${field.field}.state" class="form-input"${req}>
              <option value="">--</option>
              ${US_STATES.map((s) => `<option value="${s[0]}">${s[0]} — ${s[1]}</option>`).join('\n              ')}
            </select>
          </label>
          <label class="form-label address-zip"><span class="label-text">ZIP</span>
            <input type="text" name="${field.field}.zip" class="form-input" inputmode="numeric" pattern="\\d{5}" placeholder="78701"${req} />
          </label>
        </div>
      </fieldset>
    `;
  },

  validate(value, field) {
    if (typeof value !== 'object' || value === null) return 'Address must be an object';
    const addr = value as Record<string, unknown>;
    if (!addr.street) return 'Street is required';
    if (!addr.city) return 'City is required';
    if (!addr.state) return 'State is required';
    if (!addr.zip) return 'ZIP code is required';
    return null;
  },

  transformValue(value) {
    // Could call SmartyStreets API to standardise/verify the address.
    // For now, pass through as-is.
    return value;
  },
};
