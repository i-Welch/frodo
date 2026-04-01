import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { config } from './config/app-config.js';
import { logger } from './logger.js';
import { requestIdMiddleware } from './api/middleware/request-id.js';
import { errorHandler } from './api/middleware/error-handler.js';
import { tenantRoutes } from './api/routes/tenants.js';
import { userRoutes } from './api/routes/users.js';
import { moduleRoutes } from './api/routes/modules.js';
import { eventRoutes } from './api/routes/events.js';
import { enrichmentRoutes } from './api/routes/enrichment.js';
import { accessRoutes } from './api/routes/access.js';
import { formCreateRoute, formPublicRoutes } from './api/routes/forms.js';
import { collectRoute } from './api/routes/collect.js';
import { webhookRoutes } from './api/routes/webhooks.js';
import { stalenessRoutes, adminRefreshRoute } from './api/routes/staleness.js';
import { providerStatusRoutes } from './api/routes/provider-status.js';
import { legalRoutes } from './api/routes/legal.js';
import { plaidLinkRoutes } from './api/routes/plaid-link.js';
import { onboardRoutes } from './api/routes/onboard.js';
import { socureVerifyRoutes } from './api/routes/socure-verify.js';
import { clerkWebhookRoutes } from './api/routes/clerk-webhooks.js';
import { verificationRoutes } from './api/routes/verifications.js';
import { reportRoutes } from './api/routes/report.js';
import { interestRoutes } from './api/routes/interest.js';
import { dynamoClient, TABLE_NAME, LOOKUP_TABLE_NAME } from './store/dynamo-client.js';
import { kmsService } from './crypto/kms.js';
// Side-effect import — registers all module schemas
import './modules/index.js';
// Side-effect import — registers mock enrichers for all modules
import { registerMockEnrichers } from './enrichment/mock/mock-enricher.js';
// Side-effect import — registers built-in custom field components
import { registerBuiltinComponents } from './forms/components/index.js';
import { initOtpProvider } from './forms/otp-provider.js';
import { registerFullContactProvider } from './providers/fullcontact/index.js';
import { registerMelissaProvider } from './providers/melissa/index.js';
import { registerSocureProvider } from './providers/socure/index.js';
import { registerPlaidProvider } from './providers/plaid/index.js';
import { registerTrueworkProvider } from './providers/truework/index.js';

if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
  registerMockEnrichers();
}
registerFullContactProvider();
registerMelissaProvider();
registerSocureProvider();
registerPlaidProvider();
registerTrueworkProvider();
registerBuiltinComponents();
initOtpProvider();

const startTime = Date.now();

// ---------------------------------------------------------------------------
// Health check helpers
// ---------------------------------------------------------------------------

interface HealthCheckResult {
  status: 'ok' | 'error';
  latencyMs: number;
  error?: string;
}

async function checkDynamoTable(tableName: string): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: 'error',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkKms(): Promise<HealthCheckResult> {
  const start = Date.now();
  // In local mode, KMS uses a static key — no real service to check
  if (config.kmsEndpoint === 'local') {
    return { status: 'ok', latencyMs: Date.now() - start };
  }

  try {
    // Round-trip: generate a data key and decrypt it
    const { plaintextDek, encryptedDek } = await kmsService.generateDataKey('health-check');
    const decrypted = await kmsService.decryptDataKey(encryptedDek, 'health-check');
    // Verify round-trip integrity
    if (!plaintextDek.equals(decrypted)) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: 'KMS round-trip verification failed',
      };
    }
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: 'error',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = new Elysia()
  .use(cors({
    origin: [
      config.dashboardUrl,
      'https://reportraven.tech',
      ...(config.nodeEnv !== 'production' ? ['http://localhost:3001'] : []),
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  }))
  .use(requestIdMiddleware)
  .use(errorHandler)
  .get('/', ({ set }) => {
    set.redirect = 'https://reportraven.tech';
  })
  .get('/health', () => ({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: '1.0.0',
  }))
  .get('/health/deep', async ({ set }) => {
    const [dynamodb, dynamodbLookup, kms] = await Promise.all([
      checkDynamoTable(TABLE_NAME),
      checkDynamoTable(LOOKUP_TABLE_NAME),
      checkKms(),
    ]);

    const checks = { dynamodb, dynamodbLookup, kms };
    const allOk = Object.values(checks).every((c) => c.status === 'ok');

    if (!allOk) {
      set.status = 503;
    }

    return {
      status: allOk ? 'ok' : 'degraded',
      checks,
    };
  })
  .use(tenantRoutes)
  .use(userRoutes)
  .use(moduleRoutes)
  .use(eventRoutes)
  .use(enrichmentRoutes)
  .use(accessRoutes)
  .use(formCreateRoute)
  .use(formPublicRoutes)
  .use(collectRoute)
  .use(webhookRoutes)
  .use(stalenessRoutes)
  .use(adminRefreshRoute)
  .use(providerStatusRoutes)
  .use(legalRoutes)
  .use(plaidLinkRoutes)
  .use(onboardRoutes)
  .use(socureVerifyRoutes)
  .use(clerkWebhookRoutes)
  .use(verificationRoutes)
  .use(reportRoutes)
  .use(interestRoutes)
  .listen(config.port);

logger.info(
  {
    port: config.port,
    environment: config.nodeEnv,
  },
  `Frodo server started on port ${config.port}`,
);

export { app };
