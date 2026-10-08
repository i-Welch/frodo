import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
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
import { verificationRoutes } from './api/routes/verifications.js';
import { reportRoutes } from './api/routes/report.js';
import { interestRoutes } from './api/routes/interest.js';
import { whitelabelRoutes } from './api/routes/whitelabel.js';
import { whitelabelAdminRoutes } from './api/routes/whitelabel-admin.js';
import { pool, TABLE_NAME, LOOKUP_TABLE_NAME } from './store/db.js';
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
import { registerAttomProvider } from './providers/attom/index.js';

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

const app = new Elysia()
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
  .get('/', ({ set }) => {
    set.redirect = 'https://reportraven.tech';
  })
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
  .listen(config.port);

logger.info(
  {
    port: config.port,
    environment: config.nodeEnv,
  },
  `Frodo server started on port ${config.port}`,
);

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down...');
  // Stop accepting new connections
  app.stop();
  // Allow in-flight requests to complete
  setTimeout(() => {
    logger.info('Shutdown complete');
    process.exit(0);
  }, 3000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { app };
