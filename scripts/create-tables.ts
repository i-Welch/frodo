import {
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTimeToLiveCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME, LOOKUP_TABLE_NAME } from '../src/store/dynamo-client.js';

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await dynamoClient.send(
      new DescribeTableCommand({ TableName: tableName }),
    );
    return true;
  } catch (err) {
    if (err instanceof ResourceNotFoundException) {
      return false;
    }
    throw err;
  }
}

async function createMainTable(): Promise<void> {
  if (await tableExists(TABLE_NAME)) {
    console.log(`Table "${TABLE_NAME}" already exists — skipping.`);
    return;
  }

  console.log(`Creating table "${TABLE_NAME}"...`);

  await dynamoClient.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
        { AttributeName: 'GSI1PK', AttributeType: 'S' },
        { AttributeName: 'GSI1SK', AttributeType: 'S' },
        { AttributeName: 'GSI2PK', AttributeType: 'S' },
        { AttributeName: 'GSI2SK', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1',
          KeySchema: [
            { AttributeName: 'GSI1PK', KeyType: 'HASH' },
            { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        },
        {
          IndexName: 'GSI2',
          KeySchema: [
            { AttributeName: 'GSI2PK', KeyType: 'HASH' },
            { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }),
  );

  // Enable TTL on the `ttl` attribute
  await dynamoClient.send(
    new UpdateTimeToLiveCommand({
      TableName: TABLE_NAME,
      TimeToLiveSpecification: {
        AttributeName: 'ttl',
        Enabled: true,
      },
    }),
  );

  console.log(`Table "${TABLE_NAME}" created with GSI1, GSI2, and TTL.`);
}

async function createLookupTable(): Promise<void> {
  if (await tableExists(LOOKUP_TABLE_NAME)) {
    console.log(`Table "${LOOKUP_TABLE_NAME}" already exists — skipping.`);
    return;
  }

  console.log(`Creating table "${LOOKUP_TABLE_NAME}"...`);

  await dynamoClient.send(
    new CreateTableCommand({
      TableName: LOOKUP_TABLE_NAME,
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }),
  );

  console.log(`Table "${LOOKUP_TABLE_NAME}" created.`);
}

async function main() {
  console.log('Setting up DynamoDB tables...');
  await createMainTable();
  await createLookupTable();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Failed to create tables:', err);
  process.exit(1);
});
