import { createHash } from 'node:crypto';
import { keys, putItem } from '../store/base-store.js';
import { createChildLogger } from '../logger.js';
import type { VerificationTier } from '../types.js';

const log = createChildLogger({ module: 'consent' });

/**
 * Record a consent decision to DynamoDB.
 *
 * PK = USER#<userId>, SK = CONSENT#<tenantId>#<timestamp>
 */
export async function recordConsent(params: {
  userId: string;
  tenantId: string;
  modules: string[];
  tier: VerificationTier;
  consentText: string;
  consentAddendum?: string;
  accepted: boolean;
}): Promise<void> {
  const ts = new Date().toISOString();
  const key = keys.consent(params.userId, params.tenantId, ts);

  const textHash = createHash('sha256')
    .update(params.consentText + (params.consentAddendum ?? ''))
    .digest('hex');

  await putItem({
    ...key,
    userId: params.userId,
    tenantId: params.tenantId,
    modules: params.modules,
    tier: params.tier,
    consentTextHash: textHash,
    consentAddendum: params.consentAddendum,
    accepted: params.accepted,
    timestamp: ts,
  });

  log.debug(
    { userId: params.userId, tenantId: params.tenantId, accepted: params.accepted },
    'Consent recorded',
  );
}

/**
 * Build the standard consent text shown to the user.
 */
export function buildConsentText(
  tenantName: string,
  modules: string[],
  addendum?: string,
): string {
  const moduleList = modules.join(', ');
  let text = `By continuing, you authorise ${tenantName} to access the following data: ${moduleList}. ` +
    'Your data will be handled in accordance with applicable privacy laws. ' +
    'You may revoke this consent at any time.';

  if (addendum) {
    text += ` ${addendum}`;
  }

  return text;
}
