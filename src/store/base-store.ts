import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamo-client.js';

// ---------------------------------------------------------------------------
// Key builders — primary table
// ---------------------------------------------------------------------------

export const keys = {
  tenant: (tenantId: string) => ({
    PK: `TENANT#${tenantId}`,
    SK: 'METADATA',
  }),

  apiKey: (tenantId: string, keyId: string) => ({
    PK: `TENANT#${tenantId}`,
    SK: `APIKEY#${keyId}`,
  }),

  userModule: (userId: string, module: string) => ({
    PK: `USER#${userId}`,
    SK: `MODULE#${module}`,
  }),

  dataEvent: (
    userId: string,
    module: string,
    ts: string,
    eventId: string,
  ) => ({
    PK: `USER#${userId}`,
    SK: `EVENT#${module}#${ts}#${eventId}`,
  }),

  tenantUserLink: (tenantId: string, userId: string) => ({
    PK: `TENANT#${tenantId}`,
    SK: `USERLINK#${userId}`,
  }),

  session: (sessionId: string) => ({
    PK: `SESSION#${sessionId}`,
    SK: 'METADATA',
  }),

  formToken: (token: string) => ({
    PK: `FORM#${token}`,
    SK: 'METADATA',
  }),

  accessLog: (tenantId: string, ts: string, userId: string) => ({
    PK: `ACCESSLOG#${tenantId}`,
    SK: `${ts}#${userId}`,
  }),

  consent: (userId: string, tenantId: string, ts: string) => ({
    PK: `USER#${userId}`,
    SK: `CONSENT#${tenantId}#${ts}`,
  }),
};

// ---------------------------------------------------------------------------
// Key builders — GSI
// ---------------------------------------------------------------------------

export const gsiKeys = {
  apiKeyPrefix: (prefix: string) => ({ GSI1PK: `APIKEY#${prefix}` }),

  eventsBySource: (source: string) => ({ GSI1PK: `EVENT#${source}` }),

  tenantsForUser: (userId: string) => ({ GSI1PK: `USER#${userId}` }),

  sessionsForUser: (userId: string) => ({ GSI1PK: `USER#${userId}` }),
};

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

export async function putItem(
  item: Record<string, unknown>,
): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );
}

export async function getItem(
  key: { PK: string; SK: string },
): Promise<Record<string, unknown> | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: key,
    }),
  );
  return (result.Item as Record<string, unknown>) ?? null;
}

export interface QueryParams {
  pk: string;
  skPrefix?: string;
  limit?: number;
  cursor?: string;
  scanForward?: boolean;
  indexName?: string;
  /** Partition key attribute name — defaults to PK (or GSI1PK for indexes). */
  pkField?: string;
  /** Sort key attribute name — defaults to SK (or GSI1SK for indexes). */
  skField?: string;
}

export interface QueryResult {
  items: Record<string, unknown>[];
  cursor?: string;
}

export async function queryItems(params: QueryParams): Promise<QueryResult> {
  const {
    pk,
    skPrefix,
    limit,
    cursor,
    scanForward = true,
    indexName,
    pkField = indexName ? 'GSI1PK' : 'PK',
    skField = indexName ? 'GSI1SK' : 'SK',
  } = params;

  const expressionNames: Record<string, string> = {
    '#pk': pkField,
  };
  const expressionValues: Record<string, unknown> = {
    ':pk': pk,
  };

  let keyCondition = '#pk = :pk';

  if (skPrefix !== undefined) {
    expressionNames['#sk'] = skField;
    expressionValues[':skPrefix'] = skPrefix;
    keyCondition += ' AND begins_with(#sk, :skPrefix)';
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: indexName,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues,
      Limit: limit,
      ScanIndexForward: scanForward,
      ExclusiveStartKey: cursor ? JSON.parse(cursor) : undefined,
    }),
  );

  return {
    items: (result.Items as Record<string, unknown>[]) ?? [],
    cursor: result.LastEvaluatedKey
      ? JSON.stringify(result.LastEvaluatedKey)
      : undefined,
  };
}

export async function deleteItem(
  key: { PK: string; SK: string },
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: key,
    }),
  );
}

/**
 * Batch-write items in chunks of 25 (DynamoDB limit).
 * All items are PutRequests to TABLE_NAME.
 */
export async function batchWriteItems(
  items: Record<string, unknown>[],
): Promise<void> {
  const CHUNK_SIZE = 25;

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);

    const requestItems = {
      [TABLE_NAME]: chunk.map((item) => ({
        PutRequest: { Item: item },
      })),
    };

    let unprocessed: typeof requestItems | undefined = requestItems;

    while (unprocessed && Object.keys(unprocessed).length > 0) {
      const result = await docClient.send(
        new BatchWriteCommand({ RequestItems: unprocessed }),
      );

      const remaining = result.UnprocessedItems;
      if (remaining && Object.keys(remaining).length > 0) {
        // Back off briefly before retrying unprocessed items
        await new Promise((resolve) => setTimeout(resolve, 100));
        unprocessed = remaining as typeof requestItems;
      } else {
        unprocessed = undefined;
      }
    }
  }
}
