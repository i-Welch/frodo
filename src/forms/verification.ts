import { getModule } from '../store/user-store.js';
import { createChildLogger } from '../logger.js';

const log = createChildLogger({ module: 'identity-verification' });

/**
 * Verify a user's identity by comparing submitted PII against stored data.
 *
 * - firstName and lastName are compared case-insensitively.
 * - SSN is compared exactly (digits only).
 * - Does NOT reveal which specific field failed — returns a boolean only.
 */
export async function verifyIdentity(
  userId: string,
  submitted: { firstName: string; lastName: string; ssn: string },
): Promise<boolean> {
  const identity = await getModule(userId, 'identity');

  if (!identity) {
    log.debug({ userId }, 'No identity module found for user');
    return false;
  }

  const storedFirst = normalise(identity.firstName as string | undefined);
  const storedLast = normalise(identity.lastName as string | undefined);
  const storedSsn = digitsOnly((identity.ssn as string | undefined) ?? '');

  const submittedFirst = normalise(submitted.firstName);
  const submittedLast = normalise(submitted.lastName);
  const submittedSsn = digitsOnly(submitted.ssn);

  const match =
    storedFirst === submittedFirst &&
    storedLast === submittedLast &&
    storedSsn === submittedSsn;

  log.debug({ userId, match }, 'Identity verification result');

  return match;
}

function normalise(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}
