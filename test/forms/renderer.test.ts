import { describe, it, expect, beforeAll } from 'vitest';
import { renderForm, renderStandardField } from '../../src/forms/renderer.js';
import { registerBuiltinComponents } from '../../src/forms/components/index.js';
import type { FormField, FormToken } from '../../src/forms/types.js';

// Register built-in custom components before tests
beforeAll(() => {
  registerBuiltinComponents();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFormToken(overrides?: Partial<FormToken>): FormToken {
  return {
    token: 'test-token-abc',
    formDefinition: {
      formId: 'test-form',
      title: 'Test Form',
      type: 'data_collection',
      fields: [
        {
          module: 'contact',
          field: 'email',
          label: 'Email Address',
          inputType: 'email',
          required: true,
        },
      ],
    },
    userId: 'user-1',
    tenantId: 'tenant-1',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('form renderer', () => {
  describe('renderStandardField', () => {
    it('renders a text input', () => {
      const field: FormField = {
        module: 'contact',
        field: 'name',
        label: 'Full Name',
        inputType: 'text',
        required: true,
      };

      const html = renderStandardField(field);
      expect(html).toContain('type="text"');
      expect(html).toContain('name="contact.name"');
      expect(html).toContain('Full Name');
      expect(html).toContain('required');
    });

    it('renders a select field', () => {
      const field: FormField = {
        module: 'employment',
        field: 'status',
        label: 'Status',
        inputType: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      };

      const html = renderStandardField(field);
      expect(html).toContain('<select');
      expect(html).toContain('name="employment.status"');
      expect(html).toContain('Active');
      expect(html).toContain('value="active"');
      expect(html).toContain('Inactive');
    });

    it('renders an SSN field', () => {
      const field: FormField = {
        module: 'identity',
        field: 'ssn',
        label: 'Social Security Number',
        inputType: 'ssn',
        required: true,
      };

      const html = renderStandardField(field);
      expect(html).toContain('type="text"');
      expect(html).toContain('inputmode="numeric"');
      expect(html).toContain('name="identity.ssn"');
      expect(html).toContain('data-imask="000-00-0000"');
    });

    it('renders an email field', () => {
      const field: FormField = {
        module: 'contact',
        field: 'email',
        label: 'Email',
        inputType: 'email',
        required: true,
      };

      const html = renderStandardField(field);
      expect(html).toContain('type="email"');
      expect(html).toContain('required');
    });

    it('renders a textarea field', () => {
      const field: FormField = {
        module: 'employment',
        field: 'notes',
        label: 'Notes',
        inputType: 'textarea',
        maxLength: 500,
      };

      const html = renderStandardField(field);
      expect(html).toContain('<textarea');
      expect(html).toContain('maxlength="500"');
    });

    it('renders a date field', () => {
      const field: FormField = {
        module: 'identity',
        field: 'dob',
        label: 'Date of Birth',
        inputType: 'date',
      };

      const html = renderStandardField(field);
      expect(html).toContain('type="date"');
    });

    it('renders radio buttons', () => {
      const field: FormField = {
        module: 'employment',
        field: 'type',
        label: 'Employment Type',
        inputType: 'radio',
        options: [
          { label: 'Full-time', value: 'full_time' },
          { label: 'Part-time', value: 'part_time' },
        ],
      };

      const html = renderStandardField(field);
      expect(html).toContain('type="radio"');
      expect(html).toContain('value="full_time"');
      expect(html).toContain('Full-time');
    });

    it('renders a currency field', () => {
      const field: FormField = {
        module: 'financial',
        field: 'income',
        label: 'Annual Income',
        inputType: 'currency',
        required: true,
      };

      const html = renderStandardField(field);
      expect(html).toContain('type="text"');
      expect(html).toContain('inputmode="decimal"');
      expect(html).toContain('data-imask="currency"');
    });

    it('renders a checkbox field', () => {
      const field: FormField = {
        module: 'contact',
        field: 'newsletter',
        label: 'Subscribe to newsletter',
        inputType: 'checkbox',
      };

      const html = renderStandardField(field);
      expect(html).toContain('type="checkbox"');
      expect(html).toContain('Subscribe to newsletter');
    });
  });

  describe('renderForm with custom component', () => {
    it('renders the address custom component', () => {
      const formToken = makeFormToken({
        formDefinition: {
          formId: 'address-form',
          title: 'Address Form',
          type: 'data_collection',
          fields: [
            {
              module: 'residence',
              field: 'address',
              label: 'Home Address',
              inputType: 'address',
              required: true,
            },
          ],
        },
      });

      const html = renderForm(formToken);
      expect(html).toContain('address-fieldset');
      expect(html).toContain('Home Address');
      expect(html).toContain('name="address.street"');
      expect(html).toContain('name="address.city"');
      expect(html).toContain('name="address.state"');
      expect(html).toContain('name="address.zip"');
    });
  });

  describe('renderForm full page', () => {
    it('includes layout elements and HTMX', () => {
      const formToken = makeFormToken();

      const html = renderForm(formToken);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('htmx.org');
      expect(html).toContain('Test Form');
      expect(html).toContain('hx-post="/forms/test-token-abc/submit"');
      expect(html).toContain('RAVEN');
      expect(html).toContain('Submit');
    });

    it('renders multiple fields together', () => {
      const formToken = makeFormToken({
        formDefinition: {
          formId: 'multi-field-form',
          title: 'Multi-Field Form',
          type: 'data_collection',
          fields: [
            {
              module: 'contact',
              field: 'email',
              label: 'Email',
              inputType: 'email',
              required: true,
            },
            {
              module: 'contact',
              field: 'phone',
              label: 'Phone',
              inputType: 'phone',
            },
            {
              module: 'identity',
              field: 'ssn',
              label: 'SSN',
              inputType: 'ssn',
              required: true,
            },
          ],
        },
      });

      const html = renderForm(formToken);
      expect(html).toContain('type="email"');
      expect(html).toContain('inputmode="tel"');
      expect(html).toContain('data-imask="000-00-0000"');
    });
  });
});
