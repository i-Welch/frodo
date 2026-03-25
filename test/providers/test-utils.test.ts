import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  createReplayClient,
  type RecordedResponse,
} from '../../src/providers/test-utils.js';
import { writeFileSync } from 'node:fs';

const FIXTURES_DIR = join(import.meta.dirname, '..', 'fixtures');
const TEST_FIXTURE = join(FIXTURES_DIR, '_test-replay.json');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('test-utils', () => {
  afterEach(() => {
    if (existsSync(TEST_FIXTURE)) {
      unlinkSync(TEST_FIXTURE);
    }
  });

  describe('createReplayClient', () => {
    it('replays a recorded GET response', async () => {
      const fixtures: RecordedResponse[] = [
        {
          provider: 'plaid',
          endpoint: '/accounts',
          method: 'GET',
          status: 200,
          responseBody: { accounts: [{ id: 'a1' }] },
          headers: { 'content-type': 'application/json' },
          recordedAt: new Date().toISOString(),
        },
      ];

      mkdirSync(FIXTURES_DIR, { recursive: true });
      writeFileSync(TEST_FIXTURE, JSON.stringify(fixtures));

      const client = createReplayClient(TEST_FIXTURE);
      const res = await client.request<{ accounts: { id: string }[] }>('/accounts');

      expect(res.status).toBe(200);
      expect(res.data.accounts).toHaveLength(1);
      expect(res.data.accounts[0].id).toBe('a1');
      expect(res.durationMs).toBe(0);
      expect(res.retryCount).toBe(0);
    });

    it('replays a POST response', async () => {
      const fixtures: RecordedResponse[] = [
        {
          provider: 'plaid',
          endpoint: '/link/token/create',
          method: 'POST',
          requestBody: { user: { client_user_id: 'u1' } },
          status: 200,
          responseBody: { link_token: 'link-sandbox-abc' },
          headers: { 'content-type': 'application/json' },
          recordedAt: new Date().toISOString(),
        },
      ];

      writeFileSync(TEST_FIXTURE, JSON.stringify(fixtures));

      const client = createReplayClient(TEST_FIXTURE);
      const res = await client.request<{ link_token: string }>(
        '/link/token/create',
        { method: 'POST', body: { user: { client_user_id: 'u1' } } },
      );

      expect(res.status).toBe(200);
      expect(res.data.link_token).toBe('link-sandbox-abc');
    });

    it('throws when no matching fixture found', async () => {
      const fixtures: RecordedResponse[] = [
        {
          provider: 'plaid',
          endpoint: '/accounts',
          method: 'GET',
          status: 200,
          responseBody: {},
          headers: {},
          recordedAt: new Date().toISOString(),
        },
      ];

      writeFileSync(TEST_FIXTURE, JSON.stringify(fixtures));

      const client = createReplayClient(TEST_FIXTURE);
      await expect(
        client.request('/nonexistent'),
      ).rejects.toThrow('No matching fixture');
    });

    it('throws when fixture file does not exist', () => {
      expect(() => createReplayClient('/nonexistent.json')).toThrow(
        'Fixture file not found',
      );
    });

    it('consumes fixtures in order for duplicate endpoints', async () => {
      const fixtures: RecordedResponse[] = [
        {
          provider: 'plaid',
          endpoint: '/accounts',
          method: 'GET',
          status: 200,
          responseBody: { call: 1 },
          headers: {},
          recordedAt: new Date().toISOString(),
        },
        {
          provider: 'plaid',
          endpoint: '/accounts',
          method: 'GET',
          status: 200,
          responseBody: { call: 2 },
          headers: {},
          recordedAt: new Date().toISOString(),
        },
      ];

      writeFileSync(TEST_FIXTURE, JSON.stringify(fixtures));

      const client = createReplayClient(TEST_FIXTURE);
      const res1 = await client.request<{ call: number }>('/accounts');
      const res2 = await client.request<{ call: number }>('/accounts');

      expect(res1.data.call).toBe(1);
      expect(res2.data.call).toBe(2);
    });
  });
});
