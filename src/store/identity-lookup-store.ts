import {
  PutCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, LOOKUP_TABLE_NAME } from './dynamo-client.js';

// ---------------------------------------------------------------------------
// Identity lookup operations (LOOKUP_TABLE_NAME)
// ---------------------------------------------------------------------------

/**
 * Add an identifier -> userId mapping to the lookup table.
 *
 * PK = `EMAIL#alice@example.com` or `PHONE#+15551234567`
 * SK = `USER#<userId>`
 */
export async function addIdentifier(
  type: 'EMAIL' | 'PHONE',
  value: string,
  userId: string,
): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: LOOKUP_TABLE_NAME,
      Item: {
        PK: `${type}#${value}`,
        SK: `USER#${userId}`,
        userId,
        identifierType: type,
        identifierValue: value,
      },
    }),
  );
}

/**
 * Look up a userId by identifier (email or phone).
 * Returns the first matching userId or null.
 */
export async function lookupByIdentifier(
  type: 'EMAIL' | 'PHONE',
  value: string,
): Promise<string | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: LOOKUP_TABLE_NAME,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: { '#pk': 'PK' },
      ExpressionAttributeValues: { ':pk': `${type}#${value}` },
      Limit: 1,
    }),
  );

  if (!result.Items || result.Items.length === 0) return null;
  return result.Items[0].userId as string;
}

/**
 * Remove all lookup entries for a given userId.
 * Scans for items where SK = `USER#<userId>` and deletes them.
 */
export async function removeIdentifiers(userId: string): Promise<void> {
  let lastKey: Record<string, unknown> | undefined;

  do {
    const scan = await docClient.send(
      new ScanCommand({
        TableName: LOOKUP_TABLE_NAME,
        FilterExpression: 'SK = :sk',
        ExpressionAttributeValues: { ':sk': `USER#${userId}` },
        ExclusiveStartKey: lastKey,
      }),
    );

    if (scan.Items && scan.Items.length > 0) {
      for (const item of scan.Items) {
        await docClient.send(
          new DeleteCommand({
            TableName: LOOKUP_TABLE_NAME,
            Key: { PK: item.PK as string, SK: item.SK as string },
          }),
        );
      }
    }

    lastKey = scan.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);
}
