import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { ClearbitContactEnricher } from '../../../src/providers/clearbit/contact-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/clearbit/find-person.json');

describe('ClearbitContactEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_CLEARBIT_API_KEY = 'test-clearbit-key';
  });

  afterEach(() => {
    delete process.env.PROVIDER_CLEARBIT_API_KEY;
  });

  it('enriches contact data from fixture', async () => {
    const enricher = createFixtureEnricher(ClearbitContactEnricher, FIXTURE);
    const result = await enricher.enrich('user-001', { email: 'frodo@shire.co' });

    expect(result.data.email).toBe('frodo@shire.co');
    expect(result.data.phone).toBe('+15551234567');
    expect(result.data.socialProfiles).toHaveLength(3);

    const linkedin = result.data.socialProfiles!.find((p) => p.platform === 'linkedin');
    expect(linkedin).toEqual({
      platform: 'linkedin',
      handle: 'frodob',
      url: 'https://linkedin.com/in/frodob',
    });

    const twitter = result.data.socialProfiles!.find((p) => p.platform === 'twitter');
    expect(twitter?.handle).toBe('ringbearer');

    const github = result.data.socialProfiles!.find((p) => p.platform === 'github');
    expect(github?.handle).toBe('frodob');

    expect(result.metadata?.clearbitId).toBe('cb_person_001');
  });
});
