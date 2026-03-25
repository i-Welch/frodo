import type { VerificationTier } from '../types.js';

export interface Tenant {
  tenantId: string;
  name: string;
  permissions: TenantPermission[];
  callbackUrls: string[];
  consentAddendum?: string;
  webhookUrl?: string;
  createdAt: string; // ISO date
}

export interface TenantPermission {
  module: string;
  requiredTier: VerificationTier;
}

export interface StoredApiKey {
  keyId: string;
  tenantId: string;
  prefix: string; // first 8 chars of the random part, for GSI lookup
  hash: string; // SHA-256 of the full raw key
  environment: 'sandbox' | 'production';
  active: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface GeneratedApiKey {
  keyId: string;
  rawKey: string; // only returned once at creation time
  environment: 'sandbox' | 'production';
}
