import type { Duration } from '../types.js';

export interface SourceConfig {
  source: string;
  defaultTtl: Duration;
  fieldTtls?: Record<string, Duration>;
  confidence: number;
  fieldConfidence?: Record<string, number>;
}

export const sourceConfigs: Record<string, SourceConfig> = {
  user: {
    source: 'user',
    defaultTtl: { days: 365 },
    confidence: 0.6,
    fieldConfidence: {
      firstName: 0.95,
      lastName: 0.95,
      email: 0.95,
      phone: 0.9,
      income: 0.5,
    },
  },
  plaid: {
    source: 'plaid',
    defaultTtl: { days: 7 },
    confidence: 0.9,
    fieldTtls: {
      balances: { days: 1 },
      transactions: { days: 1 },
      transactionHistory: { days: 1 },
    },
  },
  experian: {
    source: 'experian',
    defaultTtl: { days: 30 },
    confidence: 0.95,
    fieldTtls: {
      scores: { days: 14 },
    },
  },
  transunion: {
    source: 'transunion',
    defaultTtl: { days: 30 },
    confidence: 0.93,
    fieldTtls: { scores: { days: 14 } },
  },
  equifax: {
    source: 'equifax',
    defaultTtl: { days: 30 },
    confidence: 0.93,
  },
  socure: {
    source: 'socure',
    defaultTtl: { days: 90 },
    confidence: 0.85,
  },
  clearbit: {
    source: 'clearbit',
    defaultTtl: { days: 30 },
    confidence: 0.8,
  },
  fullcontact: {
    source: 'fullcontact',
    defaultTtl: { days: 30 },
    confidence: 0.75,
  },
  melissa: {
    source: 'melissa',
    defaultTtl: { days: 180 },
    confidence: 0.9,
  },
  attom: {
    source: 'attom',
    defaultTtl: { days: 90 },
    confidence: 0.85,
  },
  truework: {
    source: 'truework',
    defaultTtl: { days: 90 },
    confidence: 0.9,
  },
  mx: {
    source: 'mx',
    defaultTtl: { days: 7 },
    confidence: 0.85,
  },
  finicity: {
    source: 'finicity',
    defaultTtl: { days: 7 },
    confidence: 0.88,
  },
  lexisnexis: {
    source: 'lexisnexis',
    defaultTtl: { days: 90 },
    confidence: 0.92,
    fieldConfidence: {
      firstName: 0.97,
      lastName: 0.97,
      ssn: 0.98,
      dateOfBirth: 0.95,
    },
  },
  firstamerican: {
    source: 'firstamerican',
    defaultTtl: { days: 90 },
    confidence: 0.9,
    fieldTtls: {
      currentAddress: { days: 180 },
      ownershipStatus: { days: 180 },
    },
  },
  housecanary: {
    source: 'housecanary',
    defaultTtl: { days: 30 },
    confidence: 0.88,
    fieldTtls: {
      propertyType: { days: 365 },
    },
  },
  canopy: {
    source: 'canopy',
    defaultTtl: { days: 30 },
    confidence: 0.85,
    fieldTtls: {
      paymentHistory: { days: 7 },
    },
  },
  cotality: {
    source: 'cotality',
    defaultTtl: { days: 60 },
    confidence: 0.9,
    fieldTtls: {
      propertyType: { days: 365 },
      ownershipStatus: { days: 180 },
    },
  },
  nsc: {
    source: 'nsc',
    defaultTtl: { days: 180 },
    confidence: 0.95,
  },
};

export function getSourceConfig(source: string): SourceConfig | undefined {
  return sourceConfigs[source];
}
