import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { putItem, getItem, queryItems } from '../store/base-store.js';
import { docClient, TABLE_NAME } from '../store/dynamo-client.js';
import { encryptField, decryptField } from '../crypto/encryption.js';
import { kmsService } from '../crypto/kms.js';
import type { EncryptedField } from '../crypto/types.js';
import { createChildLogger } from '../logger.js';
import type { Intake, IntakeStatus, RateEstimate } from './types.js';

const log = createChildLogger({ module: 'wl-intake-store' });

/**
 * DynamoDB-backed store for the single Intake entity (Option A: id-primary).
 *
 *   PK = INTAKE#<intakeId>   SK = METADATA            (direct, strongly-consistent get)
 *   GSI1PK = TENANTINTAKE#<tenantId>  GSI1SK = <createdAt>#<intakeId>   (LO queue, newest-first)
 *
 * Borrower PII (the enriched `profile` and the `applicant` contact block) is
 * encrypted at rest with a per-intake KMS data key, exactly as
 * raw-response-store / user-store do. Loan metadata (product, amount, estimate,
 * status) is stored in plaintext so the queue can list and filter without
 * decrypting every row. Abandoned intakes carry a `ttl` and auto-expire.
 */

const ABANDON_TTL_SECONDS = 72 * 60 * 60; // 72h for never-submitted intakes
const TERMINAL: IntakeStatus[] = ['submitted', 'under_review', 'routed'];

function intakeKey(intakeId: string) {
  return { PK: `INTAKE#${intakeId}`, SK: 'METADATA' };
}

export interface StoredIntakeInput extends Intake {
  tenantId: string;
}

export async function putIntake(intake: StoredIntakeInput): Promise<void> {
  const { plaintextDek, encryptedDek } = await kmsService.generateDataKey(intake.intakeId);
  const encProfile = encryptField(plaintextDek, intake.profile);
  const encApplicant = encryptField(plaintextDek, intake.applicant);

  const item: Record<string, unknown> = {
    ...intakeKey(intake.intakeId),
    GSI1PK: `TENANTINTAKE#${intake.tenantId}`,
    GSI1SK: `${intake.createdAt}#${intake.intakeId}`,
    // Plaintext structural / loan metadata (no direct PII)
    intakeId: intake.intakeId,
    applicationId: intake.applicationId,
    tenantId: intake.tenantId,
    slug: intake.slug,
    flow: intake.flow,
    mode: intake.mode,
    status: intake.status,
    isLegalApplication: intake.isLegalApplication,
    steps: intake.steps,
    product: intake.product,
    amount: intake.amount,
    purpose: intake.purpose,
    estimate: intake.estimate,
    ltv: intake.ltv,
    dti: intake.dti,
    createdAt: intake.createdAt,
    // Encrypted PII
    encryptedDek: encryptedDek.toString('base64'),
    encProfile,
    encApplicant,
  };
  // Abandoned intakes expire; terminal ones persist.
  if (!TERMINAL.includes(intake.status)) {
    item.ttl = Math.floor(Date.now() / 1000) + ABANDON_TTL_SECONDS;
  }

  await putItem(item);
  log.debug({ intakeId: intake.intakeId, tenantId: intake.tenantId, flow: intake.flow }, 'Intake stored');
}

async function hydrate(item: Record<string, unknown>): Promise<Intake> {
  const encryptedDek = Buffer.from(item.encryptedDek as string, 'base64');
  const plaintextDek = await kmsService.decryptDataKey(encryptedDek, item.intakeId as string);
  const profile = decryptField(plaintextDek, item.encProfile as EncryptedField) as Intake['profile'];
  const applicant = decryptField(plaintextDek, item.encApplicant as EncryptedField) as Intake['applicant'];
  return {
    intakeId: item.intakeId as string,
    applicationId: item.applicationId as string | undefined,
    slug: item.slug as string,
    flow: item.flow as Intake['flow'],
    mode: item.mode as Intake['mode'],
    status: item.status as IntakeStatus,
    steps: (item.steps as Intake['steps']) ?? [],
    profile,
    applicant,
    product: item.product as Intake['product'],
    amount: item.amount as number | undefined,
    purpose: item.purpose as string | undefined,
    estimate: (item.estimate as RateEstimate | null) ?? null,
    ltv: (item.ltv as number | null) ?? null,
    dti: (item.dti as number | null) ?? null,
    isLegalApplication: Boolean(item.isLegalApplication),
    createdAt: item.createdAt as string,
  };
}

export async function getStoredIntake(intakeId: string): Promise<Intake | undefined> {
  const item = await getItem(intakeKey(intakeId));
  if (!item) return undefined;
  return hydrate(item);
}

/** LO queue: a tenant's intakes, newest-first, decrypted. */
export async function listIntakesByTenant(
  tenantId: string,
  opts?: { limit?: number; cursor?: string },
): Promise<{ intakes: Intake[]; cursor?: string }> {
  const result = await queryItems({
    pk: `TENANTINTAKE#${tenantId}`,
    indexName: 'GSI1',
    scanForward: false,
    limit: opts?.limit ?? 50,
    cursor: opts?.cursor,
  });
  const intakes = await Promise.all(result.items.map((i) => hydrate(i)));
  return { intakes, cursor: result.cursor };
}

/** Rate flows: persist a re-priced estimate + DTI (plaintext metadata only). */
export async function updateIntakeEstimate(
  intakeId: string,
  estimate: RateEstimate,
  dti: number | null,
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: intakeKey(intakeId),
      UpdateExpression: 'SET #estimate = :estimate, #dti = :dti, #status = :status',
      ExpressionAttributeNames: { '#estimate': 'estimate', '#dti': 'dti', '#status': 'status' },
      ExpressionAttributeValues: { ':estimate': estimate, ':dti': dti, ':status': 'rate_ready' },
    }),
  );
}

/** Terminal transition: set status and drop the abandonment TTL so it persists. */
export async function updateIntakeStatus(intakeId: string, status: IntakeStatus): Promise<void> {
  const terminal = TERMINAL.includes(status);
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: intakeKey(intakeId),
      UpdateExpression: terminal
        ? 'SET #status = :status REMOVE #ttl'
        : 'SET #status = :status',
      ExpressionAttributeNames: terminal
        ? { '#status': 'status', '#ttl': 'ttl' }
        : { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status },
    }),
  );
}
