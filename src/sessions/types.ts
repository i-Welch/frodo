import type { VerificationTier } from '../types.js';

export interface UserSession {
  sessionId: string;
  userId: string;
  verifiedTier: VerificationTier;
  createdAt: string;
  expiresAt: string;
  tenantId: string;
}
