#!/usr/bin/env bun
// ---------------------------------------------------------------------------
// Frodo local development ops CLI
//
// Usage: bun scripts/ops-local.ts <command> [options]
//
// Commands:
//   health     Check local health endpoints
//   logs       Parse and filter docker compose logs
//   tables     List DynamoDB Local tables and entity distribution
//   events     Query local events by user or module
//   user       Show all data for a user
// ---------------------------------------------------------------------------

import { DynamoDBClient, ListTablesCommand, DescribeTableCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand as DocScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import {
  c,
  parseArgs,
  run,
  die,
  table,
  statusBadge,
  relativeTime,
  formatLogEntry,
  parseLogLine,
  printSection,
  printKeyValue,
  type Column,
  type LogEntry,
} from './ops-utils.js';

// ---------------------------------------------------------------------------
// Local DynamoDB client
// ---------------------------------------------------------------------------

const DYNAMO_ENDPOINT = process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000';
const TABLE_NAME = process.env.DYNAMODB_TABLE ?? 'frodo-local-main';
const LOOKUP_TABLE_NAME = process.env.DYNAMODB_LOOKUP_TABLE ?? 'frodo-local-identity-lookup';

const rawClient = new DynamoDBClient({
  endpoint: DYNAMO_ENDPOINT,
  region: 'us-east-1',
  credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
});

const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true },
});

// ---------------------------------------------------------------------------
// Command: health
// ---------------------------------------------------------------------------

async function cmdHealth(): Promise<void> {
  const baseUrl = process.env.APP_URL ?? 'http://localhost:3000';

  printSection('Local Health Check');

  // Basic health
  console.log(c.bold('/health'));
  try {
    const resp = await fetch(`${baseUrl}/health`);
    const body = await resp.json() as any;
    printKeyValue('  Status', statusBadge(body.status), 0);
    printKeyValue('  Uptime', `${body.uptime}s`, 0);
    printKeyValue('  Version', body.version ?? 'unknown', 0);
  } catch (err) {
    console.log(`  ${c.red('[UNREACHABLE]')} Is the app running? (bun run dev)`);
    console.log(`  ${c.dim(err instanceof Error ? err.message : String(err))}`);
  }

  console.log();

  // Deep health
  console.log(c.bold('/health/deep'));
  try {
    const resp = await fetch(`${baseUrl}/health/deep`);
    const body = await resp.json() as any;
    printKeyValue('  Status', statusBadge(body.status), 0);

    if (body.checks) {
      for (const [name, check] of Object.entries(body.checks) as [string, any][]) {
        const badge = check.status === 'ok' ? c.green('OK') : c.red('ERR');
        const latency = check.latencyMs != null ? c.dim(`${check.latencyMs}ms`) : '';
        const errMsg = check.error ? c.red(check.error) : '';
        console.log(`    ${badge} ${name} ${latency} ${errMsg}`);
      }
    }
  } catch (err) {
    console.log(`  ${c.red('[UNREACHABLE]')} ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ---------------------------------------------------------------------------
// Command: logs
// ---------------------------------------------------------------------------

function matchesFilter(entry: LogEntry, filter?: string): boolean {
  if (!filter) return true;

  if (filter === 'errors') return entry.level >= 50;
  if (filter === 'enrichment') return (entry.event ?? '').includes('enrichment');
  if (filter === 'verification') return (entry.event ?? '').includes('verification');
  if (filter === 'slow') return (entry.durationMs ?? 0) > 1000;
  if (filter.startsWith('user:')) return entry.userId === filter.slice(5);
  if (filter.startsWith('tenant:')) return entry.tenantId === filter.slice(7);

  // Fallback: simple substring match against the raw JSON
  return JSON.stringify(entry).includes(filter);
}

async function cmdLogs(flags: Record<string, string | true>): Promise<void> {
  const minutes = typeof flags.minutes === 'string' ? parseInt(flags.minutes, 10) : 5;
  const filter = typeof flags.filter === 'string' ? flags.filter : undefined;

  printSection(`Local Docker Logs (last ${minutes}m${filter ? `, filter: ${filter}` : ''})`);

  const result = await run('docker', [
    'compose', 'logs', 'app',
    '--since', `${minutes}m`,
    '--no-log-prefix',
  ]);

  if (result.exitCode !== 0) {
    // Also try "docker-compose" (older form)
    const fallback = await run('docker-compose', [
      'logs', 'app',
      '--since', `${minutes}m`,
      '--no-log-prefix',
    ]);
    if (fallback.exitCode !== 0) {
      die(`Could not fetch docker logs. Is the app running via docker compose?\n${result.stderr}`);
    }
    result.stdout = fallback.stdout;
  }

  const lines = result.stdout.split('\n');
  let matchCount = 0;

  for (const line of lines) {
    const entry = parseLogLine(line);
    if (!entry) {
      // Non-JSON line — show as-is if no filter
      if (!filter && line.trim()) {
        console.log(c.dim(line));
      }
      continue;
    }

    if (!matchesFilter(entry, filter)) continue;

    console.log(formatLogEntry(entry));
    matchCount++;
  }

  console.log(c.dim(`\n${matchCount} log entries displayed.`));
}

// ---------------------------------------------------------------------------
// Command: tables
// ---------------------------------------------------------------------------

async function cmdTables(): Promise<void> {
  printSection('DynamoDB Local Tables');

  let tableNames: string[];
  try {
    const result = await rawClient.send(new ListTablesCommand({}));
    tableNames = result.TableNames ?? [];
  } catch (err) {
    die(`Could not connect to DynamoDB Local at ${DYNAMO_ENDPOINT}.\nIs it running? (docker compose up dynamodb-local)\n${err instanceof Error ? err.message : err}`);
  }

  if (tableNames.length === 0) {
    console.log(c.dim('No tables found. Run: bun run db:create'));
    return;
  }

  for (const name of tableNames) {
    try {
      const desc = await rawClient.send(new DescribeTableCommand({ TableName: name }));
      const t = desc.Table;
      const status = t?.TableStatus ?? 'unknown';
      const itemCount = t?.ItemCount ?? 0;
      const badge = status === 'ACTIVE' ? c.green('ACTIVE') : c.yellow(status);
      console.log(`  ${badge} ${c.bold(name)} (${itemCount} items)`);

      // Show GSIs
      if (t?.GlobalSecondaryIndexes) {
        for (const gsi of t.GlobalSecondaryIndexes) {
          console.log(`    ${c.dim('GSI:')} ${gsi.IndexName} (${gsi.ItemCount ?? 0} items)`);
        }
      }
    } catch {
      console.log(`  ${c.red('[ERROR]')} ${name}`);
    }
  }

  // Entity type distribution for main table
  if (tableNames.includes(TABLE_NAME)) {
    printSection('Entity Distribution');
    try {
      const entityCounts: Record<string, number> = {};
      let lastKey: Record<string, any> | undefined;

      do {
        const result = await docClient.send(new DocScanCommand({
          TableName: TABLE_NAME,
          ProjectionExpression: 'PK',
          ExclusiveStartKey: lastKey,
        }));

        for (const item of result.Items ?? []) {
          const pk = (item.PK as string) ?? '';
          const entityType = pk.split('#')[0] || 'UNKNOWN';
          entityCounts[entityType] = (entityCounts[entityType] ?? 0) + 1;
        }

        lastKey = result.LastEvaluatedKey;
      } while (lastKey);

      const sorted = Object.entries(entityCounts).sort((a, b) => b[1] - a[1]);

      if (sorted.length === 0) {
        console.log(c.dim('  No items in table. Run: bun run db:seed'));
      } else {
        const cols: Column[] = [
          { header: 'Entity Type', key: 'type', width: 20 },
          { header: 'Count', key: 'count', width: 10, align: 'right' },
        ];
        const rows = sorted.map(([type, count]) => ({
          type,
          count: String(count),
        }));
        console.log(table(cols, rows));
      }
    } catch {
      console.log(c.dim('  Could not scan table for entity distribution.'));
    }
  }
}

// ---------------------------------------------------------------------------
// Command: events
// ---------------------------------------------------------------------------

async function cmdEvents(flags: Record<string, string | true>): Promise<void> {
  const userId = typeof flags.user === 'string' ? flags.user : undefined;
  const moduleName = typeof flags.module === 'string' ? flags.module : undefined;

  printSection('Local Events');

  if (!userId && !moduleName) {
    // Show recent events (scan, limit 50)
    console.log(c.dim('Tip: Use --user <userId> or --module <module> to filter.\n'));

    try {
      const result = await docClient.send(new DocScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':sk': 'EVENT#' },
        Limit: 100,
      }));

      const items = result.Items ?? [];
      if (items.length === 0) {
        console.log(c.dim('No events found.'));
        return;
      }

      for (const item of items.slice(0, 50)) {
        printEvent(item);
      }

      console.log(c.dim(`\n${items.length} event(s) found.`));
    } catch (err) {
      die(`Could not scan events.\n${err instanceof Error ? err.message : err}`);
    }
    return;
  }

  if (userId) {
    // Query by PK = USER#<userId>, SK begins_with EVENT#
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'EVENT#',
        },
        ScanIndexForward: false,
      }));

      const items = result.Items ?? [];
      if (items.length === 0) {
        console.log(c.dim(`No events found for user ${userId}.`));
        return;
      }

      for (const item of items) {
        printEvent(item);
      }
      console.log(c.dim(`\n${items.length} event(s) for user ${userId}.`));
    } catch (err) {
      die(`Query failed.\n${err instanceof Error ? err.message : err}`);
    }
  }

  if (moduleName) {
    // Query GSI1 by GSI1PK = EVENT#<module>
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `EVENT#${moduleName}`,
        },
        ScanIndexForward: false,
        Limit: 50,
      }));

      const items = result.Items ?? [];
      if (items.length === 0) {
        console.log(c.dim(`No events found for module "${moduleName}".`));
        return;
      }

      for (const item of items) {
        printEvent(item);
      }
      console.log(c.dim(`\n${items.length} event(s) for module "${moduleName}".`));
    } catch (err) {
      die(`Query failed.\n${err instanceof Error ? err.message : err}`);
    }
  }
}

function printEvent(item: Record<string, any>): void {
  const pk = item.PK ?? '';
  const sk = item.SK ?? '';
  const source = item.source ?? item.GSI1PK?.replace('EVENT#', '') ?? 'unknown';
  const timestamp = item.createdAt ?? item.timestamp ?? '';
  const when = timestamp ? relativeTime(timestamp) : '';

  console.log(`  ${c.cyan(source)} ${c.dim(when)}`);
  console.log(`    ${c.dim('PK:')} ${pk}  ${c.dim('SK:')} ${sk}`);

  // Show changed fields if present
  if (item.fields || item.data || item.changes) {
    const payload = item.fields ?? item.data ?? item.changes;
    if (typeof payload === 'object') {
      const keys = Object.keys(payload).slice(0, 8);
      for (const key of keys) {
        const val = payload[key];
        const display = typeof val === 'object' ? JSON.stringify(val) : String(val);
        console.log(`    ${c.dim(key + ':')} ${display.length > 80 ? display.slice(0, 77) + '...' : display}`);
      }
      if (Object.keys(payload).length > 8) {
        console.log(c.dim(`    ... and ${Object.keys(payload).length - 8} more fields`));
      }
    }
  }
  console.log();
}

// ---------------------------------------------------------------------------
// Command: user
// ---------------------------------------------------------------------------

async function cmdUser(positional: string[]): Promise<void> {
  const userId = positional[0];
  if (!userId) {
    die('Usage: bun scripts/ops-local.ts user <userId>');
  }

  printSection(`User Profile: ${userId}`);

  // 1. Tenant links (GSI1 query: GSI1PK = USER#<userId>, GSI1SK begins_with TENANTLINK#)
  console.log(c.bold('Tenant Links'));
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'TENANTLINK#',
      },
    }));

    const items = result.Items ?? [];
    if (items.length === 0) {
      console.log(c.dim('  No tenant links found.'));
    } else {
      for (const item of items) {
        const tenantId = item.tenantId ?? item.GSI1SK?.replace('TENANTLINK#', '') ?? 'unknown';
        const created = item.createdAt ?? '';
        console.log(`  ${c.cyan(tenantId)}`);
        if (item.providedIdentifiers) {
          const ids = item.providedIdentifiers as Record<string, string>;
          for (const [k, v] of Object.entries(ids)) {
            printKeyValue(k, v, 4);
          }
        }
        if (created) printKeyValue('Linked', relativeTime(created), 4);
        console.log();
      }
    }
  } catch (err) {
    console.log(`  ${c.red('[ERROR]')} ${err instanceof Error ? err.message : err}`);
  }

  // 2. Events (PK = USER#<userId>, SK begins_with EVENT#)
  console.log(c.bold('Events'));
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'EVENT#',
      },
      ScanIndexForward: false,
      Limit: 20,
    }));

    const items = result.Items ?? [];
    if (items.length === 0) {
      console.log(c.dim('  No events found.'));
    } else {
      for (const item of items) {
        printEvent(item);
      }
    }
  } catch {
    console.log(c.dim('  Could not query events.'));
  }

  // 3. Sessions (GSI1 query: GSI1PK = USER#<userId>, GSI1SK begins_with SESSION#)
  console.log(c.bold('Sessions'));
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SESSION#',
      },
      ScanIndexForward: false,
      Limit: 10,
    }));

    const items = result.Items ?? [];
    if (items.length === 0) {
      console.log(c.dim('  No sessions found.'));
    } else {
      for (const item of items) {
        const sessionId = item.PK?.replace('SESSION#', '') ?? item.sessionId ?? 'unknown';
        const created = item.createdAt ?? '';
        const tenantId = item.tenantId ?? item.GSI1SK?.replace('SESSION#', '').split('#')[0] ?? '';
        console.log(`  ${c.cyan(sessionId.slice(0, 12) + '...')} tenant=${c.dim(tenantId)} ${created ? relativeTime(created) : ''}`);
      }
    }
  } catch {
    console.log(c.dim('  Could not query sessions.'));
  }
  console.log();

  // 4. Modules (PK = USER#<userId>, SK begins_with MODULE#)
  console.log(c.bold('Modules'));
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'MODULE#',
      },
    }));

    const items = result.Items ?? [];
    if (items.length === 0) {
      console.log(c.dim('  No modules found.'));
    } else {
      for (const item of items) {
        const moduleName = item.SK?.replace('MODULE#', '').split('#').pop() ?? 'unknown';
        console.log(`  ${c.cyan(moduleName)}`);

        // Print top-level fields (skip keys and metadata)
        const skipKeys = new Set(['PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK', 'ttl']);
        const fields = Object.entries(item).filter(([k]) => !skipKeys.has(k));
        for (const [k, v] of fields.slice(0, 10)) {
          const display = typeof v === 'object' ? JSON.stringify(v) : String(v);
          printKeyValue(k, display.length > 80 ? display.slice(0, 77) + '...' : display, 4);
        }
        if (fields.length > 10) {
          console.log(c.dim(`    ... and ${fields.length - 10} more fields`));
        }
        console.log();
      }
    }
  } catch {
    console.log(c.dim('  Could not query modules.'));
  }

  // 5. Access logs (GSI1 query: GSI1PK = USER#<userId>, GSI1SK begins_with ACCESSLOG#)
  console.log(c.bold('Recent Access Logs'));
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'ACCESSLOG#',
      },
      ScanIndexForward: false,
      Limit: 10,
    }));

    const items = result.Items ?? [];
    if (items.length === 0) {
      console.log(c.dim('  No access logs found.'));
    } else {
      for (const item of items) {
        const tenantId = item.tenantId ?? '';
        const accessed = item.createdAt ?? item.timestamp ?? '';
        const action = item.action ?? item.event ?? '';
        console.log(`  ${c.dim(accessed ? relativeTime(accessed) : '')} ${action} ${c.dim(`tenant=${tenantId}`)}`);
      }
    }
  } catch {
    console.log(c.dim('  Could not query access logs.'));
  }

  // 6. Identity lookups
  console.log();
  console.log(c.bold('Identity Lookups'));
  try {
    // Scan the lookup table for entries pointing to this user
    const result = await docClient.send(new DocScanCommand({
      TableName: LOOKUP_TABLE_NAME,
      FilterExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    }));

    const items = result.Items ?? [];
    if (items.length === 0) {
      console.log(c.dim('  No identity lookups found.'));
    } else {
      for (const item of items) {
        const pk = item.PK ?? '';
        const identType = pk.split('#')[0] ?? 'UNKNOWN';
        const identValue = pk.split('#').slice(1).join('#') ?? '';
        console.log(`  ${c.cyan(identType)} ${identValue}`);
      }
    }
  } catch {
    console.log(c.dim('  Could not query identity lookups.'));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const USAGE = `
${c.bold('Frodo Local Ops CLI')} - Local development debugging

${c.bold('Usage:')} bun scripts/ops-local.ts <command> [options]

${c.bold('Commands:')}
  ${c.cyan('health')}    Check local health endpoints
  ${c.cyan('logs')}      Parse and filter docker compose logs
  ${c.cyan('tables')}    List DynamoDB Local tables and entity distribution
  ${c.cyan('events')}    Query local events by user or module
  ${c.cyan('user')}      Show all data for a user

${c.bold('Examples:')}
  bun scripts/ops-local.ts health
  bun scripts/ops-local.ts logs --minutes 10 --filter errors
  bun scripts/ops-local.ts logs --filter user:abc123
  bun scripts/ops-local.ts tables
  bun scripts/ops-local.ts events --user abc123
  bun scripts/ops-local.ts events --module employment
  bun scripts/ops-local.ts user abc123

${c.bold('Environment:')}
  DYNAMODB_ENDPOINT    DynamoDB Local URL (default: http://localhost:8000)
  APP_URL              App URL (default: http://localhost:3000)
`.trim();

async function main(): Promise<void> {
  const { command, positional, flags } = parseArgs(process.argv);

  switch (command) {
    case 'health':
      return cmdHealth();
    case 'logs':
      return cmdLogs(flags);
    case 'tables':
      return cmdTables();
    case 'events':
      return cmdEvents(flags);
    case 'user':
      return cmdUser(positional);
    case 'help':
    case '--help':
    case '-h':
    case '':
      console.log(USAGE);
      return;
    default:
      console.log(USAGE);
      die(`Unknown command: "${command}"`);
  }
}

main().catch((err) => {
  console.error(c.red('Unexpected error:'), err);
  process.exit(1);
});
