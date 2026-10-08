import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { config } from './config/app-config';
import { logger } from './logger';
import { requestIdMiddleware } from './api/middleware/request-id';
import { errorHandler } from './api/middleware/error-handler';
import { tenantRoutes } from './api/routes/tenants';
import { userRoutes } from './api/routes/users';
import { moduleRoutes } from './api/routes/modules';
import { eventRoutes } from './api/routes/events';
import { enrichmentRoutes } from './api/routes/enrichment';
import { accessRoutes } from './api/routes/access';
import { formCreateRoute, formPublicRoutes } from './api/routes/forms';
import { collectRoute } from './api/routes/collect';
import { webhookRoutes } from './api/routes/webhooks';
import { stalenessRoutes, adminRefreshRoute } from './api/routes/staleness';
import { providerStatusRoutes } from './api/routes/provider-status';
import { legalRoutes } from './api/routes/legal';
import { plaidLinkRoutes } from './api/routes/plaid-link';
import { onboardRoutes } from './api/routes/onboard';
import { socureVerifyRoutes } from './api/routes/socure-verify';
import { verificationRoutes } from './api/routes/verifications';
import { reportRoutes } from './api/routes/report';
import { interestRoutes } from './api/routes/interest';
import { whitelabelRoutes } from './api/routes/whitelabel';
import { whitelabelAdminRoutes } from './api/routes/whitelabel-admin';
import { pool, TABLE_NAME, LOOKUP_TABLE_NAME } from './store/db';
import { kmsService } from './crypto/kms';
// Side-effect import — registers all module schemas
import './modules/index';
// Side-effect import — registers mock enrichers for all modules
import { registerMockEnrichers } from './enrichment/mock/mock-enricher';
// Side-effect import — registers built-in custom field components
import { registerBuiltinComponents } from './forms/components/index';
import { initOtpProvider } from './forms/otp-provider';
import { registerFullContactProvider } from './providers/fullcontact/index';
import { registerMelissaProvider } from './providers/melissa/index';
import { registerSocureProvider } from './providers/socure/index';
import { registerPlaidProvider } from './providers/plaid/index';
import { registerTrueworkProvider } from './providers/truework/index';
import { registerAttomProvider } from './providers/attom/index';

if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
  registerMockEnrichers();
}
registerFullContactProvider();
registerMelissaProvider();
registerSocureProvider();
registerPlaidProvider();
registerTrueworkProvider();
registerAttomProvider();
registerBuiltinComponents();
initOtpProvider().catch((err) => logger.error({ err }, 'Failed to initialize OTP provider'));

const startTime = Date.now();

// ---------------------------------------------------------------------------
// Health check helpers
// ---------------------------------------------------------------------------

interface HealthCheckResult {
  status: 'ok' | 'error';
  latencyMs: number;
  error?: string;
}

async function checkTable(tableName: string): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await pool.query(`SELECT 1 FROM "${tableName}" LIMIT 1`);
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: 'error',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkEncryption(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Round-trip: generate a data key and unwrap it
    const { plaintextDek, encryptedDek } = await kmsService.generateDataKey('health-check');
    const decrypted = await kmsService.decryptDataKey(encryptedDek, 'health-check');
    if (!plaintextDek.equals(decrypted)) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: 'Encryption round-trip verification failed',
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

export const app = new Elysia()
  .use(
    cors({
      origin: [
        config.dashboardUrl,
        'https://reportraven.tech',
        ...(config.nodeEnv !== 'production' ? ['http://localhost:3001'] : []),
      ],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    }),
  )
  .use(requestIdMiddleware)
  .use(errorHandler)
  .get('/health', () => ({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: '1.0.0',
  }))
  .get('/health/deep', async ({ set }) => {
    const [database, databaseLookup, encryption] = await Promise.all([
      checkTable(TABLE_NAME),
      checkTable(LOOKUP_TABLE_NAME),
      checkEncryption(),
    ]);

    const checks = { database, databaseLookup, encryption };
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
  .use(verificationRoutes)
  .use(reportRoutes)
  .use(interestRoutes)
  .use(whitelabelRoutes)
  .use(whitelabelAdminRoutes)
  ;
