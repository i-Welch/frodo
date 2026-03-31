import { BaseEnricher } from '../base-enricher.js';
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
// FullContact Person Enrich API response
// POST https://api.fullcontact.com/v3/person.enrich
// Auth: Bearer token
// ---------------------------------------------------------------------------

interface FullContactPersonResponse {
  fullName: string;
  ageRange: string | null;
  gender: string | null;
  location: string | null;
  title: string | null;
  organization: string | null;
  twitter: string | null;
  linkedin: string | null;
  bio: string | null;
  avatar: string | null;
  details: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class FullContactContactEnricher extends BaseEnricher<ContactData> {
  source = 'fullcontact';
  module = 'contact';
  timeoutMs = 10_000;

  protected getBaseUrl(): string {
    return 'https://api.fullcontact.com';
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
    if (!current.email && !current.phone) {
      throw new Error('FullContact enrichment requires an email or phone number');
    }

    // FullContact accepts multiple identifier types for matching.
    // Send whatever we have — email, phone, or both.
    const body: Record<string, unknown> = {};
    if (current.email) body.email = current.email;
    if (current.phone) body.phone = current.phone;

    const res = await this.http.request<FullContactPersonResponse>(
      '/v3/person.enrich',
      {
        method: 'POST',
        body,
      },
    );

    const person = res.data;
    const data: Partial<ContactData> = {};

    // FullContact doesn't return email/phone in the response for privacy
    // (they confirm a match but don't echo back PII). We keep the
    // existing values and enrich with social profiles.

    // Build social profiles from the top-level platform fields
    const socialProfiles: ContactData['socialProfiles'] = [];

    if (person.linkedin) {
      const handle = extractHandle(person.linkedin);
      socialProfiles.push({
        platform: 'linkedin',
        handle,
        url: person.linkedin,
      });
    }
    if (person.twitter) {
      const handle = extractHandle(person.twitter);
      socialProfiles.push({
        platform: 'twitter',
        handle,
        url: person.twitter,
      });
    }

    if (socialProfiles.length > 0) {
      data.socialProfiles = socialProfiles;
    }

    return {
      data: {
        ...data,
        fullName: person.fullName || undefined,
        ageRange: person.ageRange || undefined,
        gender: person.gender || undefined,
        location: person.location || undefined,
        jobTitle: person.title || undefined,
        organization: person.organization || undefined,
      } as Partial<ContactData>,
      metadata: {},
    };
  }
}

/**
 * Extract a handle/username from a social profile URL.
 * e.g., "https://twitter.com/frodob" → "frodob"
 */
function extractHandle(url: string): string {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? url;
  } catch {
    return url;
  }
}
