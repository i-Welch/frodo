import type { VerificationTier } from '../types';

export interface UserSession {
  sessionId: string;
  userId: string;
  verifiedTier: VerificationTier;
  createdAt: string;
  expiresAt: string;
  tenantId: string;
}
