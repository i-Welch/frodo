import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { SocureIdentityEnricher } from '../../../src/providers/socure/identity-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/socure/evaluation.json');

describe('SocureIdentityEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_SOCURE_API_KEY = 'test-socure-key';
    process.env.PROVIDER_SOCURE_WORKFLOW_NAME = 'test-workflow';
    process.env.SOCURE_ENV = 'sandbox';
  });

  afterEach(() => {
    delete process.env.PROVIDER_SOCURE_API_KEY;
    delete process.env.PROVIDER_SOCURE_WORKFLOW_NAME;
    delete process.env.SOCURE_ENV;
  });

  it('enriches identity data via RiskOS Evaluation API', async () => {
    const enricher = createFixtureEnricher(SocureIdentityEnricher, FIXTURE);
    const result = await enricher.enrich('user-001', {
      firstName: 'Samwise',
      lastName: 'Gamgee',
      dateOfBirth: '1983-04-06',
    });

    // Prefill data extracted from enrichments
    expect(result.data.firstName).toBe('Samwise');
    expect(result.data.lastName).toBe('Gamgee');
    expect(result.data.dateOfBirth).toBe('1983-04-06');

    // Metadata includes KYC decision
    expect(result.metadata?.evalId).toBe('socure-eval-001');
    expect(result.metadata?.decision).toBe('ACCEPT');
    expect(result.metadata?.kycDecision).toBe('ACCEPT');
  });
});
