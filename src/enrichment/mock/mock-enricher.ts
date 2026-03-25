import type { Enricher, EnrichmentResult } from '../types.js';
import { registerEnricher } from '../registry.js';

/**
 * Simple hash to produce a deterministic seed from userId + source.
 */
function deterministicSeed(userId: string, source: string): number {
  let hash = 0;
  const str = userId + source;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Create mock enrichers for all 7 modules, each mapped to an appropriate source.
 */
export function createMockEnrichers(): Enricher[] {
  return [
    // -----------------------------------------------------------------------
    // contact -- clearbit
    // -----------------------------------------------------------------------
    {
      source: 'clearbit',
      module: 'contact',
      async enrich(userId): Promise<EnrichmentResult> {
        const seed = deterministicSeed(userId, 'clearbit');
        return {
          data: {
            email: `user${seed % 1000}@example.com`,
            phone: `+1555${String(seed % 10000000).padStart(7, '0')}`,
            socialProfiles: [
              {
                platform: 'linkedin',
                handle: `user${seed % 1000}`,
                url: `https://linkedin.com/in/user${seed % 1000}`,
              },
            ],
          },
          metadata: { mockProvider: 'clearbit' },
        };
      },
    },

    // -----------------------------------------------------------------------
    // identity -- socure
    // -----------------------------------------------------------------------
    {
      source: 'socure',
      module: 'identity',
      async enrich(userId): Promise<EnrichmentResult> {
        const seed = deterministicSeed(userId, 'socure');
        const firstNames = ['James', 'Maria', 'Robert', 'Linda', 'David', 'Susan', 'John', 'Karen'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        const year = 1960 + (seed % 40);
        const month = String((seed % 12) + 1).padStart(2, '0');
        const day = String((seed % 28) + 1).padStart(2, '0');

        return {
          data: {
            firstName: firstNames[seed % firstNames.length],
            lastName: lastNames[seed % lastNames.length],
            dateOfBirth: `${year}-${month}-${day}`,
            ssn: `${String(seed % 999).padStart(3, '0')}-${String(seed % 99).padStart(2, '0')}-${String(seed % 9999).padStart(4, '0')}`,
          },
          metadata: { mockProvider: 'socure' },
        };
      },
    },

    // -----------------------------------------------------------------------
    // residence -- melissa
    // -----------------------------------------------------------------------
    {
      source: 'melissa',
      module: 'residence',
      async enrich(userId): Promise<EnrichmentResult> {
        const seed = deterministicSeed(userId, 'melissa');
        const cities = ['Austin', 'Denver', 'Portland', 'Seattle', 'Chicago', 'Miami', 'Boston', 'Phoenix'];
        const states = ['TX', 'CO', 'OR', 'WA', 'IL', 'FL', 'MA', 'AZ'];
        const idx = seed % cities.length;

        return {
          data: {
            currentAddress: {
              street: `${100 + (seed % 9900)} Main St`,
              city: cities[idx],
              state: states[idx],
              zip: String(10000 + (seed % 89999)),
              country: 'US',
            },
            ownershipStatus: seed % 2 === 0 ? 'own' : 'rent',
            propertyType: seed % 3 === 0 ? 'condo' : 'single-family',
            moveInDate: `${2018 + (seed % 6)}-${String((seed % 12) + 1).padStart(2, '0')}-01`,
          },
          metadata: { mockProvider: 'melissa' },
        };
      },
    },

    // -----------------------------------------------------------------------
    // financial -- plaid
    // -----------------------------------------------------------------------
    {
      source: 'plaid',
      module: 'financial',
      async enrich(userId): Promise<EnrichmentResult> {
        const seed = deterministicSeed(userId, 'plaid');
        const institutions = ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'US Bank'];
        const checking = 1000 + (seed % 49000);
        const savings = 5000 + (seed % 95000);

        return {
          data: {
            bankAccounts: [
              {
                institution: institutions[seed % institutions.length],
                accountType: 'checking',
                last4: String(seed % 10000).padStart(4, '0'),
              },
              {
                institution: institutions[(seed + 1) % institutions.length],
                accountType: 'savings',
                last4: String((seed + 1111) % 10000).padStart(4, '0'),
              },
            ],
            balances: {
              checking,
              savings,
              total: checking + savings,
            },
            incomeStreams: [
              {
                source: 'employer',
                amount: 3000 + (seed % 7000),
                frequency: 'biweekly',
              },
            ],
          },
          metadata: { mockProvider: 'plaid' },
        };
      },
    },

    // -----------------------------------------------------------------------
    // credit -- experian
    // -----------------------------------------------------------------------
    {
      source: 'experian',
      module: 'credit',
      async enrich(userId): Promise<EnrichmentResult> {
        const seed = deterministicSeed(userId, 'experian');
        const score = 580 + (seed % 270);
        const utilization = Number(((seed % 80) + 5).toFixed(1));

        return {
          data: {
            scores: [
              {
                bureau: 'experian',
                score,
                date: new Date().toISOString().split('T')[0],
              },
            ],
            openAccounts: [
              {
                creditor: 'Visa',
                accountType: 'credit_card',
                balance: 500 + (seed % 9500),
                limit: 5000 + (seed % 15000),
              },
            ],
            utilization,
          },
          metadata: { mockProvider: 'experian' },
        };
      },
    },

    // -----------------------------------------------------------------------
    // buying-patterns -- plaid (transactions source)
    // -----------------------------------------------------------------------
    {
      source: 'plaid',
      module: 'buying-patterns',
      async enrich(userId): Promise<EnrichmentResult> {
        const seed = deterministicSeed(userId, 'plaid-buying');
        const categories = ['groceries', 'dining', 'transportation', 'entertainment', 'utilities', 'shopping'];

        return {
          data: {
            spendingCategories: categories.slice(0, 4).map((category, i) => ({
              category,
              amount: 100 + ((seed + i * 137) % 900),
              percentage: Number((10 + ((seed + i * 37) % 20)).toFixed(1)),
            })),
            purchaseFrequency: {
              daily: 1 + (seed % 5),
              weekly: 7 + (seed % 20),
              monthly: 30 + (seed % 60),
            },
            averageTransactionSize: Number((15 + (seed % 85)).toFixed(2)),
          },
          metadata: { mockProvider: 'plaid' },
        };
      },
    },

    // -----------------------------------------------------------------------
    // employment -- truework
    // -----------------------------------------------------------------------
    {
      source: 'truework',
      module: 'employment',
      async enrich(userId): Promise<EnrichmentResult> {
        const seed = deterministicSeed(userId, 'truework');
        const employers = ['Acme Corp', 'Globex Inc', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises'];
        const titles = ['Software Engineer', 'Product Manager', 'Data Analyst', 'Marketing Lead', 'Sales Rep', 'Designer'];
        const idx = seed % employers.length;
        const year = 2018 + (seed % 6);

        return {
          data: {
            employer: employers[idx],
            title: titles[idx],
            startDate: `${year}-${String((seed % 12) + 1).padStart(2, '0')}-01`,
            salary: 50000 + (seed % 150000),
          },
          metadata: { mockProvider: 'truework' },
        };
      },
    },
  ];
}

/**
 * Register all mock enrichers into the enricher registry.
 */
export function registerMockEnrichers(): void {
  for (const enricher of createMockEnrichers()) {
    registerEnricher(enricher);
  }
}
