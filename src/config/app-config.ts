export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  dynamoTable: process.env.DYNAMODB_TABLE ?? 'frodo-local-main',
  dynamoLookupTable: process.env.DYNAMODB_LOOKUP_TABLE ?? 'frodo-local-identity-lookup',
  dynamoEndpoint: process.env.DYNAMODB_ENDPOINT,
  kmsKeyId: process.env.KMS_KEY_ID ?? '',
  kmsEndpoint: process.env.KMS_ENDPOINT,
  cookieSecret: process.env.COOKIE_SECRET ?? 'local-dev-secret',
  logLevel: process.env.LOG_LEVEL ?? 'info',
};
