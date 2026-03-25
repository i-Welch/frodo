import crypto from 'node:crypto';
import { lookupByIdentifier } from '../store/identity-lookup-store.js';
import type { IdentityMatch } from './types.js';

/**
 * Resolve an identity from provided identifiers.
 *
 * 1. If email provided: lookup by EMAIL
 * 2. If phone provided: lookup by PHONE
 * 3. If both match the SAME userId: return existing
 * 4. If one matches but not the other: return existing (from the match)
 * 5. If both match DIFFERENT userIds: return conflict
 * 6. If neither matches: generate new userId and return new
 */
export async function resolveIdentity(identifiers: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}): Promise<IdentityMatch> {
  const emailUserId = identifiers.email
    ? await lookupByIdentifier('EMAIL', identifiers.email)
    : null;

  const phoneUserId = identifiers.phone
    ? await lookupByIdentifier('PHONE', identifiers.phone)
    : null;

  // Both match different users -> conflict
  if (emailUserId && phoneUserId && emailUserId !== phoneUserId) {
    return {
      type: 'conflict',
      candidateIds: [emailUserId, phoneUserId],
    };
  }

  // At least one matches -> existing
  const matchedUserId = emailUserId ?? phoneUserId;
  if (matchedUserId) {
    return {
      type: 'existing',
      userId: matchedUserId,
    };
  }

  // Neither matches -> new user
  return {
    type: 'new',
    userId: crypto.randomUUID(),
  };
}
