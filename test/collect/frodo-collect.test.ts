import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FrodoCollect } from '../../src/collect/frodo-collect.js';
import type { CollectField, CollectSubmitResult } from '../../src/collect/frodo-collect.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FrodoCollect', () => {
  describe('constructor', () => {
    it('sets defaults for endpoint and source', () => {
      const collect = new FrodoCollect({ token: 'tok-123' });
      // Verify defaults by checking submit URL construction
      // We can test this indirectly via getValues etc.
      expect(collect).toBeInstanceOf(FrodoCollect);
    });

    it('accepts custom endpoint and source', () => {
      const collect = new FrodoCollect({
        token: 'tok-456',
        endpoint: '/api/forms',
        source: 'system',
      });
      expect(collect).toBeInstanceOf(FrodoCollect);
    });
  });

  describe('addField', () => {
    it('registers a field', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addField({ module: 'contact', field: 'email', required: true });

      // Setting and getting the value proves the field key is registered
      collect.setValue('contact', 'email', 'test@example.com');
      expect(collect.getValue('contact', 'email')).toBe('test@example.com');
    });

    it('returns this for chaining', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const result = collect.addField({ module: 'contact', field: 'email' });
      expect(result).toBe(collect);
    });
  });

  describe('addFields', () => {
    it('registers multiple fields', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addFields([
        { module: 'contact', field: 'email' },
        { module: 'contact', field: 'phone' },
        { module: 'identity', field: 'firstName' },
      ]);

      collect.setValue('contact', 'email', 'a@b.com');
      collect.setValue('contact', 'phone', '555-1234');
      collect.setValue('identity', 'firstName', 'Alice');

      const values = collect.getValues();
      expect(values.contact.email).toBe('a@b.com');
      expect(values.contact.phone).toBe('555-1234');
      expect(values.identity.firstName).toBe('Alice');
    });

    it('returns this for chaining', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const result = collect.addFields([{ module: 'contact', field: 'email' }]);
      expect(result).toBe(collect);
    });
  });

  describe('setValue / getValue', () => {
    it('round-trips a string value', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.setValue('contact', 'email', 'test@example.com');
      expect(collect.getValue('contact', 'email')).toBe('test@example.com');
    });

    it('round-trips an object value', () => {
      const addr = { street: '123 Main', city: 'Hobbiton', state: 'SH', zip: '00001' };
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.setValue('residence', 'currentAddress', addr);
      expect(collect.getValue('residence', 'currentAddress')).toEqual(addr);
    });

    it('returns undefined for unset fields', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      expect(collect.getValue('contact', 'email')).toBeUndefined();
    });

    it('setValue returns this for chaining', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const result = collect.setValue('contact', 'email', 'a@b.com');
      expect(result).toBe(collect);
    });
  });

  describe('getValues', () => {
    it('groups values by module', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.setValue('contact', 'email', 'a@b.com');
      collect.setValue('contact', 'phone', '555-1234');
      collect.setValue('identity', 'firstName', 'Alice');
      collect.setValue('identity', 'lastName', 'Smith');

      const values = collect.getValues();
      expect(values).toEqual({
        contact: { email: 'a@b.com', phone: '555-1234' },
        identity: { firstName: 'Alice', lastName: 'Smith' },
      });
    });

    it('returns empty object when no values set', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      expect(collect.getValues()).toEqual({});
    });
  });

  describe('clearValue', () => {
    it('removes a specific field value', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.setValue('contact', 'email', 'a@b.com');
      collect.setValue('contact', 'phone', '555');
      collect.clearValue('contact', 'email');

      expect(collect.getValue('contact', 'email')).toBeUndefined();
      expect(collect.getValue('contact', 'phone')).toBe('555');
    });

    it('returns this for chaining', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const result = collect.clearValue('contact', 'email');
      expect(result).toBe(collect);
    });
  });

  describe('clearAll', () => {
    it('removes all values', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.setValue('contact', 'email', 'a@b.com');
      collect.setValue('identity', 'firstName', 'Alice');
      collect.clearAll();

      expect(collect.getValues()).toEqual({});
    });

    it('returns this for chaining', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const result = collect.clearAll();
      expect(result).toBe(collect);
    });
  });

  describe('validate', () => {
    it('catches required fields that are missing', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addField({ module: 'contact', field: 'email', required: true });
      collect.addField({ module: 'contact', field: 'phone', required: true });

      const errors = collect.validate();
      expect(errors['contact.email']).toBe('email is required');
      expect(errors['contact.phone']).toBe('phone is required');
    });

    it('catches required fields that are empty string', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addField({ module: 'contact', field: 'email', required: true });
      collect.setValue('contact', 'email', '');

      const errors = collect.validate();
      expect(errors['contact.email']).toBe('email is required');
    });

    it('catches required fields that are null', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addField({ module: 'contact', field: 'email', required: true });
      collect.setValue('contact', 'email', null);

      const errors = collect.validate();
      expect(errors['contact.email']).toBe('email is required');
    });

    it('runs custom validators', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addField({
        module: 'contact',
        field: 'email',
        validate: (v) => {
          if (typeof v !== 'string' || !v.includes('@')) return 'Must be a valid email';
          return null;
        },
      });
      collect.setValue('contact', 'email', 'not-an-email');

      const errors = collect.validate();
      expect(errors['contact.email']).toBe('Must be a valid email');
    });

    it('returns empty object when all fields are valid', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addField({ module: 'contact', field: 'email', required: true });
      collect.addField({
        module: 'contact',
        field: 'phone',
        validate: (v) => (typeof v === 'string' && v.length >= 7 ? null : 'Too short'),
      });
      collect.setValue('contact', 'email', 'a@b.com');
      collect.setValue('contact', 'phone', '555-1234');

      const errors = collect.validate();
      expect(errors).toEqual({});
    });

    it('skips custom validator for undefined optional fields', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addField({
        module: 'contact',
        field: 'phone',
        required: false,
        validate: () => 'should not be called',
      });

      const errors = collect.validate();
      expect(errors).toEqual({});
    });
  });

  describe('submit', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('builds correct payload format', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ eventsCreated: 2 }),
      });

      const collect = new FrodoCollect({ token: 'tok-abc', endpoint: '/forms' });
      collect.addFields([
        { module: 'contact', field: 'email', required: true },
        { module: 'identity', field: 'firstName', required: true },
      ]);
      collect.setValue('contact', 'email', 'a@b.com');
      collect.setValue('identity', 'firstName', 'Alice');

      await collect.submit();

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe('/forms/tok-abc/submit');
      expect(init.method).toBe('POST');
      expect(init.headers['Content-Type']).toBe('application/json');

      const payload = JSON.parse(init.body);
      expect(payload.source).toBe('user');
      expect(payload.fields).toEqual([
        { module: 'contact', field: 'email', value: 'a@b.com' },
        { module: 'identity', field: 'firstName', value: 'Alice' },
      ]);
    });

    it('includes transformed values', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ eventsCreated: 1 }),
      });

      const collect = new FrodoCollect({ token: 'tok-abc' });
      collect.addField({
        module: 'contact',
        field: 'email',
        required: true,
        transform: (v) => (v as string).toLowerCase().trim(),
      });
      collect.setValue('contact', 'email', '  Alice@Example.COM  ');

      await collect.submit();

      const payload = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(payload.fields[0].value).toBe('alice@example.com');
    });

    it('skips undefined fields in payload', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ eventsCreated: 1 }),
      });

      const collect = new FrodoCollect({ token: 'tok-abc' });
      collect.addField({ module: 'contact', field: 'email' });
      collect.addField({ module: 'contact', field: 'phone' });
      collect.setValue('contact', 'email', 'a@b.com');
      // phone not set

      await collect.submit();

      const payload = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(payload.fields).toHaveLength(1);
      expect(payload.fields[0].field).toBe('email');
    });

    it('returns validation errors without calling fetch', async () => {
      const collect = new FrodoCollect({ token: 'tok-abc' });
      collect.addField({ module: 'contact', field: 'email', required: true });
      // Don't set a value

      const result = await collect.submit();

      expect(result.success).toBe(false);
      expect(result.errors?.['contact.email']).toBe('email is required');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns success with eventsCreated and redirectUrl', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ eventsCreated: 2, redirectUrl: 'https://example.com/done' }),
      });

      const collect = new FrodoCollect({ token: 'tok-abc' });
      collect.addField({ module: 'contact', field: 'email', required: true });
      collect.setValue('contact', 'email', 'a@b.com');

      const result = await collect.submit();

      expect(result.success).toBe(true);
      expect(result.eventsCreated).toBe(2);
      expect(result.redirectUrl).toBe('https://example.com/done');
    });

    it('handles server error responses', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        json: async () => ({ errors: { email: 'Invalid' }, message: 'Validation failed' }),
      });

      const collect = new FrodoCollect({ token: 'tok-abc' });
      collect.addField({ module: 'contact', field: 'email', required: true });
      collect.setValue('contact', 'email', 'bad');

      const result = await collect.submit();

      expect(result.success).toBe(false);
      expect(result.errors?.email).toBe('Invalid');
    });

    it('handles network errors', async () => {
      fetchSpy.mockRejectedValue(new Error('Failed to fetch'));

      const collect = new FrodoCollect({ token: 'tok-abc' });
      collect.addField({ module: 'contact', field: 'email' });
      collect.setValue('contact', 'email', 'a@b.com');

      const result = await collect.submit();

      expect(result.success).toBe(false);
      expect(result.errors?._network).toBe('Failed to fetch');
    });

    it('uses custom source in payload', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ eventsCreated: 1 }),
      });

      const collect = new FrodoCollect({ token: 'tok-abc', source: 'system' });
      collect.addField({ module: 'contact', field: 'email' });
      collect.setValue('contact', 'email', 'a@b.com');

      await collect.submit();

      const payload = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(payload.source).toBe('system');
    });

    it('uses custom endpoint in URL', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ eventsCreated: 1 }),
      });

      const collect = new FrodoCollect({ token: 'tok-abc', endpoint: '/api/v2/forms' });
      collect.addField({ module: 'contact', field: 'email' });
      collect.setValue('contact', 'email', 'a@b.com');

      await collect.submit();

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe('/api/v2/forms/tok-abc/submit');
    });
  });

  describe('event emitter', () => {
    it('on/emit fires handlers for change events', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const handler = vi.fn();

      collect.on('change', handler);
      collect.setValue('contact', 'email', 'a@b.com');

      expect(handler).toHaveBeenCalledWith('contact', 'email', 'a@b.com');
    });

    it('off removes a handler', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const handler = vi.fn();

      collect.on('change', handler);
      collect.off('change', handler);
      collect.setValue('contact', 'email', 'a@b.com');

      expect(handler).not.toHaveBeenCalled();
    });

    it('emits error events on validation failure during submit', async () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addField({ module: 'contact', field: 'email', required: true });
      const handler = vi.fn();
      collect.on('error', handler);

      await collect.submit();

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0]).toHaveProperty('contact.email');
    });

    it('emits submit event on success', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ eventsCreated: 1 }),
      }));

      const collect = new FrodoCollect({ token: 'tok-1' });
      collect.addField({ module: 'contact', field: 'email' });
      collect.setValue('contact', 'email', 'a@b.com');

      const handler = vi.fn();
      collect.on('submit', handler);

      await collect.submit();

      expect(handler).toHaveBeenCalledWith({ eventsCreated: 1 });
    });

    it('on returns this for chaining', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const result = collect.on('change', () => {});
      expect(result).toBe(collect);
    });

    it('off returns this for chaining', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const result = collect.off('change', () => {});
      expect(result).toBe(collect);
    });

    it('clearValue emits change with undefined', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const handler = vi.fn();
      collect.on('change', handler);

      collect.setValue('contact', 'email', 'a@b.com');
      collect.clearValue('contact', 'email');

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler.mock.calls[1]).toEqual(['contact', 'email', undefined]);
    });
  });

  describe('chainable API', () => {
    it('supports full method chaining', () => {
      const collect = new FrodoCollect({ token: 'tok-1' });
      const result = collect
        .addField({ module: 'contact', field: 'email', required: true })
        .addField({ module: 'contact', field: 'phone' })
        .setValue('contact', 'email', 'a@b.com')
        .setValue('contact', 'phone', '555')
        .on('change', () => {})
        .clearValue('contact', 'phone');

      expect(result).toBe(collect);
      expect(collect.getValue('contact', 'email')).toBe('a@b.com');
      expect(collect.getValue('contact', 'phone')).toBeUndefined();
    });
  });
});
