import { BaseEnricher } from '../base-enricher.js';
import { createMapper } from '../mapper.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape
// ---------------------------------------------------------------------------

interface ContactData {
  email: string;
  phone: string;
  socialProfiles: { platform: string; handle: string; url?: string }[];
}

// ---------------------------------------------------------------------------
// Clearbit Enrichment API response types
// ---------------------------------------------------------------------------

interface ClearbitPersonResponse {
  id: string;
  email: string;
  phone: string | null;
  name: { fullName: string; givenName: string; familyName: string };
  employment: { name: string; title: string; role: string } | null;
  linkedin: { handle: string } | null;
  twitter: { handle: string } | null;
  facebook: { handle: string } | null;
  github: { handle: string } | null;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

const clearbitContactMapper = createMapper({
  provider: 'clearbit',
  module: 'contact',
  mappings: [
    { from: 'email', to: 'email' },
    { from: 'phone', to: 'phone' },
  ],
});

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class ClearbitContactEnricher extends BaseEnricher<ContactData> {
  source = 'clearbit';
  module = 'contact';
  timeoutMs = 10_000;

  protected getBaseUrl(): string {
    return 'https://person.clearbit.com';
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.credentials.get('API_KEY')}`,
    };
  }

  protected async fetchData(
    userId: string,
    current: Partial<ContactData>,
  ): Promise<EnrichmentResult<ContactData>> {
    if (!current.email) {
      throw new Error('Clearbit enrichment requires an email address');
    }

    const res = await this.http.request<ClearbitPersonResponse>(
      `/v2/people/find?email=${encodeURIComponent(current.email)}`,
    );

    const person = res.data;
    const mapped = clearbitContactMapper(person);

    // Build social profiles from the various platform fields
    const socialProfiles: ContactData['socialProfiles'] = [];
    if (person.linkedin?.handle) {
      socialProfiles.push({
        platform: 'linkedin',
        handle: person.linkedin.handle,
        url: `https://linkedin.com/in/${person.linkedin.handle}`,
      });
    }
    if (person.twitter?.handle) {
      socialProfiles.push({
        platform: 'twitter',
        handle: person.twitter.handle,
        url: `https://twitter.com/${person.twitter.handle}`,
      });
    }
    if (person.github?.handle) {
      socialProfiles.push({
        platform: 'github',
        handle: person.github.handle,
        url: `https://github.com/${person.github.handle}`,
      });
    }

    const data: Partial<ContactData> = { ...mapped };
    if (socialProfiles.length > 0) {
      data.socialProfiles = socialProfiles;
    }

    return {
      data,
      metadata: {
        clearbitId: person.id,
        hasEmployment: person.employment !== null,
      },
    };
  }
}
