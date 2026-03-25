import crypto from 'node:crypto';
import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../src/store/dynamo-client.js';

export interface TestContext {
  /** Random hex prefix for isolating test keys. */
  prefix: string;
  /** Build a PK with the test prefix baked in. */
  pk: (raw: string) => string;
  /** Delete all items whose PK starts with the test prefix. */
  cleanup: () => Promise<void>;
}

/**
 * Creates an isolated test context with a unique key prefix.
 * Use `ctx.pk(raw)` to generate prefixed partition keys, then call
 * `ctx.cleanup()` in afterAll/afterEach to remove test data.
 */
export async function createTestContext(): Promise<TestContext> {
  const prefix = crypto.randomBytes(4).toString('hex');

  function pk(raw: string): string {
    return `TEST#${prefix}#${raw}`;
  }

  async function cleanup(): Promise<void> {
    // Scan for items whose PK begins with our test prefix and delete them.
    let lastKey: Record<string, unknown> | undefined;

    do {
      const scan = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'begins_with(PK, :prefix)',
          ExpressionAttributeValues: { ':prefix': `TEST#${prefix}#` },
          ExclusiveStartKey: lastKey,
        }),
      );

      if (scan.Items && scan.Items.length > 0) {
        for (const item of scan.Items) {
          await docClient.send(
            new DeleteCommand({
              TableName: TABLE_NAME,
              Key: { PK: item.PK, SK: item.SK },
            }),
          );
        }
      }

      lastKey = scan.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (lastKey);
  }

  return { prefix, pk, cleanup };
}
