import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from '../config/app-config.js';

const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = {};

if (config.dynamoEndpoint) {
  clientConfig.endpoint = config.dynamoEndpoint;
  // Local development credentials (DynamoDB Local ignores these but requires them)
  clientConfig.region = 'us-east-1';
  clientConfig.credentials = {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  };
}

/** Raw DynamoDB client — use for admin operations (CreateTable, etc.) */
export const dynamoClient = new DynamoDBClient(clientConfig);

/** Document client — use for data operations (Put, Get, Query, etc.) */
export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLE_NAME = config.dynamoTable;
export const LOOKUP_TABLE_NAME = config.dynamoLookupTable;
