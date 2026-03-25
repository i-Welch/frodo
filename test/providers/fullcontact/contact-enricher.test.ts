import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { FullContactContactEnricher } from '../../../src/providers/fullcontact/contact-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/fullcontact/person-enrich.json');

describe('FullContactContactEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_FULLCONTACT_API_KEY = 'test-fc-key';
  });

  afterEach(() => {
    delete process.env.PROVIDER_FULLCONTACT_API_KEY;
  });

  it('enriches contact data with social profiles from fixture', async () => {
    const enricher = createFixtureEnricher(FullContactContactEnricher, FIXTURE);
    const result = await enricher.enrich('user-001', { email: 'samwise@shire.co' });

    // Social profiles extracted from top-level twitter/linkedin fields
    expect(result.data.socialProfiles).toHaveLength(2);

    const twitter = result.data.socialProfiles!.find((p) => p.platform === 'twitter');
    expect(twitter).toEqual({
      platform: 'twitter',
      handle: 'samwisegardener',
      url: 'https://twitter.com/samwisegardener',
    });

    const linkedin = result.data.socialProfiles!.find((p) => p.platform === 'linkedin');
    expect(linkedin).toEqual({
      platform: 'linkedin',
      handle: 'samwise-gamgee',
      url: 'https://linkedin.com/in/samwise-gamgee',
    });

    // Metadata carries the person summary fields
    expect(result.metadata?.fullName).toBe('Samwise Gamgee');
    expect(result.metadata?.ageRange).toBe('30-39');
    expect(result.metadata?.title).toBe('Head Gardener');
    expect(result.metadata?.organization).toBe('Bag End Estate');
  });
});
