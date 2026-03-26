import { BaseEnricher } from '../base-enricher.js';
import { getProviderToken } from '../token-store.js';
import { getPlaidBaseUrl } from './config.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape — targets identity + contact
// Plaid identity/get returns the name, address, email, phone the bank has
// on file. We cross-reference this with what we already have.
// ---------------------------------------------------------------------------

interface IdentityData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

// ---------------------------------------------------------------------------
// Plaid Identity API response
// POST /identity/get
// ---------------------------------------------------------------------------

interface PlaidIdentityResponse {
  accounts: {
    account_id: string;
    owners: {
      names: string[];
      phone_numbers: {
        data: string;
        primary: boolean;
        type: string;
      }[];
      emails: {
        data: string;
        primary: boolean;
        type: string;
      }[];
      addresses: {
        data: {
          street: string;
          city: string;
          region: string;
          postal_code: string;
          country: string;
        };
        primary: boolean;
      }[];
      date_of_birth: string | null;
    }[];
  }[];
  request_id: string;
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class PlaidIdentityEnricher extends BaseEnricher<IdentityData> {
  source = 'plaid';
  module = 'identity';
  timeoutMs = 15_000;

  protected getBaseUrl(): string {
    return getPlaidBaseUrl();
  }

  protected async fetchData(
    userId: string,
    _current: Partial<IdentityData>,
  ): Promise<EnrichmentResult<IdentityData>> {
    const token = await getProviderToken(userId, 'plaid', 'access_token');
    if (!token) {
      throw new Error('No Plaid access token — user must complete Plaid Link');
    }

    const res = await this.http.request<PlaidIdentityResponse>(
      '/identity/get',
      {
        method: 'POST',
        body: {
          access_token: token.value,
          client_id: this.credentials.get('CLIENT_ID'),
          secret: this.credentials.get('SECRET'),
        },
      },
    );

    // Collect identity from the first account's owners
    const owners = res.data.accounts.flatMap((a) => a.owners);
    if (owners.length === 0) {
      return { data: {} };
    }

    const primaryOwner = owners[0];
    const data: Partial<IdentityData> = {};

    // Parse full name into first/last
    if (primaryOwner.names.length > 0) {
      const fullName = primaryOwner.names[0];
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        data.firstName = parts[0];
        data.lastName = parts.slice(1).join(' ');
      } else if (parts.length === 1) {
        data.firstName = parts[0];
      }
    }

    if (primaryOwner.date_of_birth) {
      data.dateOfBirth = primaryOwner.date_of_birth;
    }

    // Collect emails, phones, addresses as metadata for cross-referencing
    const primaryEmail = primaryOwner.emails.find((e) => e.primary)?.data
      ?? primaryOwner.emails[0]?.data;
    const primaryPhone = primaryOwner.phone_numbers.find((p) => p.primary)?.data
      ?? primaryOwner.phone_numbers[0]?.data;
    const primaryAddress = primaryOwner.addresses.find((a) => a.primary)?.data
      ?? primaryOwner.addresses[0]?.data;

    return {
      data,
      metadata: {
        plaidRequestId: res.data.request_id,
        bankVerifiedEmail: primaryEmail,
        bankVerifiedPhone: primaryPhone,
        bankVerifiedAddress: primaryAddress,
        ownerCount: owners.length,
        nameCount: primaryOwner.names.length,
      },
    };
  }
}
