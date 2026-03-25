import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { SocureIdentityEnricher } from '../../../src/providers/socure/identity-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/socure/id-plus.json');

describe('SocureIdentityEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_SOCURE_API_KEY = 'test-socure-key';
  });

  afterEach(() => {
    delete process.env.PROVIDER_SOCURE_API_KEY;
  });

  it('enriches identity data from fixture', async () => {
    const enricher = createFixtureEnricher(SocureIdentityEnricher, FIXTURE);
    const result = await enricher.enrich('user-001', {
      firstName: 'Samwise',
      lastName: 'Gamgee',
    });

    expect(result.data.firstName).toBe('Samwise');
    expect(result.data.lastName).toBe('Gamgee');
    expect(result.data.dateOfBirth).toBe('1983-04-06');

    expect(result.metadata?.socureReferenceId).toBe('socure-ref-001');
    expect(result.metadata?.correlationScore).toBe(0.95);
  });
});
