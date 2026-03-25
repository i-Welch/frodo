import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import { getModule } from '../../src/store/user-store.js';
import { getEventsForModule } from '../../src/store/event-store.js';
import { enrichModule } from '../../src/enrichment/engine.js';
import {
  registerEnricher,
  clearEnrichers,
  getEnrichers,
} from '../../src/enrichment/registry.js';
import { getSourceConfig } from '../../src/config/source-configs.js';
import type { Enricher } from '../../src/enrichment/types.js';

// Side-effect import -- registers module schemas
import '../../src/modules/index.js';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

async function ensureTable(): Promise<void> {
  try {
    await dynamoClient.send(
      new DescribeTableCommand({ TableName: TABLE_NAME }),
    );
  } catch (err) {
    if (!(err instanceof ResourceNotFoundException)) throw err;

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
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('enrichment engine', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  afterEach(() => {
    clearEnrichers();
  });

  it('enrichModule with mock enricher writes events and materializes module', async () => {
    const userId = crypto.randomUUID();

    // Register a simple mock enricher for identity
    const enricher: Enricher = {
      source: 'socure',
      module: 'identity',
      async enrich() {
        return {
          data: {
            firstName: 'Frodo',
            lastName: 'Baggins',
          },
          metadata: { mockProvider: 'socure' },
        };
      },
    };
    registerEnricher(enricher);

    const report = await enrichModule(userId, 'identity', 'test-actor', 'test-tenant');

    // Report should have one success
    expect(report.userId).toBe(userId);
    expect(report.module).toBe('identity');
    expect(report.successes).toHaveLength(1);
    expect(report.successes[0].source).toBe('socure');
    expect(report.successes[0].fields).toContain('firstName');
    expect(report.successes[0].fields).toContain('lastName');
    expect(report.failures).toHaveLength(0);

    // Events should have been written
    const events = await getEventsForModule(userId, 'identity');
    expect(events.events.length).toBeGreaterThanOrEqual(1);

    // Module should be materialized
    const moduleData = await getModule(userId, 'identity');
    expect(moduleData).not.toBeNull();
    expect(moduleData).toHaveProperty('firstName', 'Frodo');
    expect(moduleData).toHaveProperty('lastName', 'Baggins');
  });

  it('enrichModule handles enricher failure (partial success)', async () => {
    const userId = crypto.randomUUID();

    // Register a successful enricher
    const goodEnricher: Enricher = {
      source: 'socure',
      module: 'identity',
      async enrich() {
        return {
          data: { firstName: 'Samwise' },
        };
      },
    };
    registerEnricher(goodEnricher);

    // Register a failing enricher (use clearbit which has a valid source config)
    const badEnricher: Enricher = {
      source: 'clearbit',
      module: 'identity',
      async enrich() {
        throw new Error('Provider unavailable');
      },
    };
    registerEnricher(badEnricher);

    const report = await enrichModule(userId, 'identity', 'test-actor');

    // Should have one success and one failure
    expect(report.successes).toHaveLength(1);
    expect(report.successes[0].source).toBe('socure');
    expect(report.failures).toHaveLength(1);
    expect(report.failures[0].source).toBe('clearbit');
    expect(report.failures[0].error).toBe('Provider unavailable');

    // The successful data should still be materialized
    const moduleData = await getModule(userId, 'identity');
    expect(moduleData).not.toBeNull();
    expect(moduleData).toHaveProperty('firstName', 'Samwise');
  });

  it('enrichModule with timeout (slow enricher is rejected)', async () => {
    const userId = crypto.randomUUID();

    // Register a slow enricher with a very short timeout
    const slowEnricher: Enricher = {
      source: 'clearbit',
      module: 'contact',
      timeoutMs: 100,
      async enrich() {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return { data: { email: 'never@reached.com' } };
      },
    };
    registerEnricher(slowEnricher);

    const report = await enrichModule(userId, 'contact', 'test-actor');

    expect(report.failures).toHaveLength(1);
    expect(report.failures[0].source).toBe('clearbit');
    expect(report.failures[0].error).toContain('Timeout after 100ms');
    expect(report.successes).toHaveLength(0);
  });

  it('enrichModule report contains correct successes and failures', async () => {
    const userId = crypto.randomUUID();

    // Register multiple enrichers for the same module
    registerEnricher({
      source: 'socure',
      module: 'identity',
      async enrich() {
        return { data: { firstName: 'Gandalf' } };
      },
    });
    registerEnricher({
      source: 'clearbit',
      module: 'identity',
      async enrich() {
        throw new Error('Service down');
      },
    });

    const report = await enrichModule(userId, 'identity', 'test-actor', 'tenant-1');

    expect(report.userId).toBe(userId);
    expect(report.module).toBe('identity');
    expect(report.successes).toEqual([
      { source: 'socure', fields: ['firstName'] },
    ]);
    expect(report.failures).toEqual([
      { source: 'clearbit', error: 'Service down' },
    ]);
  });

  it('events written by enrichment have correct source, confidence, goodBy from source config', async () => {
    const userId = crypto.randomUUID();

    registerEnricher({
      source: 'experian',
      module: 'credit',
      async enrich() {
        return {
          data: {
            scores: [{ bureau: 'experian', score: 750 }],
            utilization: 25,
          },
        };
      },
    });

    await enrichModule(userId, 'credit', 'test-actor', 'tenant-1');

    const events = await getEventsForModule(userId, 'credit');
    // Should have at least one successful event
    const successEvents = events.events.filter((e) => e.changes.length > 0);
    expect(successEvents.length).toBeGreaterThanOrEqual(1);

    const event = successEvents[0];
    const sourceConfig = getSourceConfig('experian')!;

    // Source should match
    expect(event.source.source).toBe('experian');
    expect(event.source.actor).toBe('test-actor');
    expect(event.source.tenantId).toBe('tenant-1');

    // Each change should have the confidence from the source config
    for (const change of event.changes) {
      const expectedConfidence =
        sourceConfig.fieldConfidence?.[change.field] ?? sourceConfig.confidence;
      expect(change.confidence).toBe(expectedConfidence);

      // goodBy should be in the future
      expect(new Date(change.goodBy).getTime()).toBeGreaterThan(Date.now());
    }
  });

  it('rematerialized module contains enriched data', async () => {
    const userId = crypto.randomUUID();

    registerEnricher({
      source: 'plaid',
      module: 'financial',
      async enrich() {
        return {
          data: {
            balances: { checking: 5000, savings: 10000, total: 15000 },
          },
        };
      },
    });

    const report = await enrichModule(userId, 'financial', 'test-actor');

    expect(report.successes).toHaveLength(1);

    // Verify module was persisted with the correct data
    const moduleData = await getModule(userId, 'financial');
    expect(moduleData).not.toBeNull();
    expect(moduleData).toHaveProperty('balances');

    const balances = moduleData!.balances as Record<string, number>;
    expect(balances.checking).toBe(5000);
    expect(balances.savings).toBe(10000);
    expect(balances.total).toBe(15000);
  });

  it('enrichModule returns empty report when no enrichers are registered', async () => {
    const userId = crypto.randomUUID();

    const report = await enrichModule(userId, 'identity', 'test-actor');

    expect(report.successes).toHaveLength(0);
    expect(report.failures).toHaveLength(0);
  });

  it('enrichModule handles null current data (first enrichment)', async () => {
    const userId = crypto.randomUUID();

    registerEnricher({
      source: 'melissa',
      module: 'residence',
      async enrich(_userId, current) {
        // current should be empty object since no module data exists yet
        return {
          data: {
            currentAddress: {
              street: '123 Shire Lane',
              city: 'Hobbiton',
              state: 'ME',
              zip: '12345',
              country: 'US',
            },
          },
        };
      },
    });

    const report = await enrichModule(userId, 'residence', 'test-actor');

    expect(report.successes).toHaveLength(1);
    expect(report.successes[0].source).toBe('melissa');

    const moduleData = await getModule(userId, 'residence');
    expect(moduleData).not.toBeNull();
    expect(moduleData).toHaveProperty('currentAddress');
  });
});
