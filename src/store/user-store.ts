import { keys, putItem, getItem, queryItems, deleteItem } from './base-store.js';
import { encryptFields, decryptFields } from '../crypto/encryption.js';
import { kmsService } from '../crypto/kms.js';
import type { EncryptedField } from '../crypto/types.js';
import { createChildLogger } from '../logger.js';

const log = createChildLogger({ module: 'user-store' });

// ---------------------------------------------------------------------------
// DEK management
// ---------------------------------------------------------------------------

/**
 * Get the existing DEK for a user (stored on their first module record)
 * or generate a new one via KMS.
 */
export async function getOrCreateDek(
  userId: string,
): Promise<{ plaintextDek: Buffer; encryptedDek: string }> {
  // Look for any existing module record for this user that has an encryptedDek
  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix: 'MODULE#',
    limit: 1,
  });

  if (result.items.length > 0 && result.items[0].encryptedDek) {
    const encryptedDekBase64 = result.items[0].encryptedDek as string;
    const encryptedDekBuffer = Buffer.from(encryptedDekBase64, 'base64');
    const plaintextDek = await kmsService.decryptDataKey(
      encryptedDekBuffer,
      userId,
    );
    return { plaintextDek, encryptedDek: encryptedDekBase64 };
  }

  // No existing DEK — generate a new one
  log.debug({ userId }, 'Generating new DEK for user');
  const { plaintextDek, encryptedDek } =
    await kmsService.generateDataKey(userId);
  const encryptedDekBase64 = encryptedDek.toString('base64');
  return { plaintextDek, encryptedDek: encryptedDekBase64 };
}

// ---------------------------------------------------------------------------
// Module CRUD
// ---------------------------------------------------------------------------

/**
 * Store a module's data for a user, encrypting all field values with the
 * user's DEK (envelope encryption via KMS).
 */
export async function putModule(
  userId: string,
  moduleName: string,
  data: Record<string, unknown>,
): Promise<void> {
  const { plaintextDek, encryptedDek } = await getOrCreateDek(userId);

  const encryptedData = encryptFields(plaintextDek, data);
  const key = keys.userModule(userId, moduleName);

  await putItem({
    ...key,
    userId,
    moduleName,
    encryptedDek,
    data: encryptedData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Retrieve a single module's decrypted data for a user.
 * Returns null if the module record does not exist.
 */
export async function getModule(
  userId: string,
  moduleName: string,
): Promise<Record<string, unknown> | null> {
  const key = keys.userModule(userId, moduleName);
  const item = await getItem(key);
  if (!item) return null;

  const encryptedDekBase64 = item.encryptedDek as string;
  const encryptedDekBuffer = Buffer.from(encryptedDekBase64, 'base64');
  const plaintextDek = await kmsService.decryptDataKey(
    encryptedDekBuffer,
    userId,
  );

  const encryptedData = item.data as Record<string, EncryptedField>;
  return decryptFields(plaintextDek, encryptedData);
}

/**
 * Retrieve all modules for a user, returning a map of moduleName → decrypted data.
 */
export async function getAllModules(
  userId: string,
): Promise<Record<string, Record<string, unknown>>> {
  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix: 'MODULE#',
  });

  if (result.items.length === 0) return {};

  // All items share the same user DEK — decrypt it once from the first item
  const firstItem = result.items[0];
  const encryptedDekBase64 = firstItem.encryptedDek as string;
  const encryptedDekBuffer = Buffer.from(encryptedDekBase64, 'base64');
  const plaintextDek = await kmsService.decryptDataKey(
    encryptedDekBuffer,
    userId,
  );

  const modules: Record<string, Record<string, unknown>> = {};

  for (const item of result.items) {
    const name = item.moduleName as string;
    const encryptedData = item.data as Record<string, EncryptedField>;
    modules[name] = decryptFields(plaintextDek, encryptedData);
  }

  return modules;
}

/**
 * Delete a single module record for a user.
 */
export async function deleteModule(
  userId: string,
  moduleName: string,
): Promise<void> {
  const key = keys.userModule(userId, moduleName);
  await deleteItem(key);
}

/**
 * Delete all module records for a user.
 */
export async function deleteAllModules(userId: string): Promise<void> {
  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix: 'MODULE#',
  });

  for (const item of result.items) {
    await deleteItem({
      PK: item.PK as string,
      SK: item.SK as string,
    });
  }
}
