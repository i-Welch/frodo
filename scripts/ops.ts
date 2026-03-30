#!/usr/bin/env bun
// ---------------------------------------------------------------------------
// Frodo production/staging ops CLI
//
// Usage: bun scripts/ops.ts <command> [options]
//
// Commands:
//   deployments  List recent deploy workflow runs
//   services     Show ECS service status
//   logs         Query CloudWatch Logs Insights
//   status       Comprehensive health check
//   rollback     Roll back to a previous task definition
// ---------------------------------------------------------------------------

import {
  c,
  parseArgs,
  run,
  runJSON,
  die,
  table,
  statusBadge,
  relativeTime,
  formatDuration,
  formatTimestamp,
  printSection,
  printKeyValue,
  levelName,
  type Column,
  type SpawnResult,
} from './ops-utils.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

type Env = 'staging' | 'production';

const CLUSTER_PREFIX = 'frodo';
const SERVICE_NAME = 'frodo-api';
const TASK_DEF_PREFIX = 'frodo-api';
const LOG_GROUP_PREFIX = '/frodo';
const DEPLOY_WORKFLOW = 'deploy.yml';

function getEnv(flags: Record<string, string | true>): Env {
  const e = flags.env;
  if (e === 'production' || e === 'staging') return e;
  if (e && e !== true) die(`Invalid env "${e}". Use --env staging or --env production.`);
  return 'staging';
}

function clusterName(env: Env): string {
  return `${CLUSTER_PREFIX}-${env}`;
}

function taskDefFamily(env: Env): string {
  return `${TASK_DEF_PREFIX}-${env}`;
}

function logGroup(env: Env): string {
  return `${LOG_GROUP_PREFIX}/${env}/api`;
}

function awsRegion(): string {
  return process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-2';
}

function awsArgs(): string[] {
  return ['--region', awsRegion(), '--output', 'json'];
}

// ---------------------------------------------------------------------------
// Preflight checks
// ---------------------------------------------------------------------------

async function checkCli(cmd: string, hint: string): Promise<void> {
  const result = await run('which', [cmd]);
  if (result.exitCode !== 0) {
    die(`"${cmd}" not found. ${hint}`);
  }
}

async function preflight(needsAws = true, needsGh = false): Promise<void> {
  if (needsAws) await checkCli('aws', 'Install the AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html');
  if (needsGh) await checkCli('gh', 'Install the GitHub CLI: https://cli.github.com');
}

// ---------------------------------------------------------------------------
// Command: deployments
// ---------------------------------------------------------------------------

interface WorkflowRun {
  databaseId: number;
  headSha: string;
  status: string;
  conclusion: string;
  createdAt: string;
  updatedAt: string;
  displayTitle: string;
  event: string;
  headBranch: string;
  name: string;
  actor: { login: string };
}

async function cmdDeployments(flags: Record<string, string | true>): Promise<void> {
  await preflight(false, true);

  const env = getEnv(flags);
  const limit = typeof flags.limit === 'string' ? parseInt(flags.limit, 10) : 10;

  printSection(`Recent Deploy Runs (${env})`);

  // Fetch workflow runs
  const result = await run('gh', [
    'run', 'list',
    '--workflow', DEPLOY_WORKFLOW,
    '--limit', String(limit),
    '--json', 'databaseId,headSha,status,conclusion,createdAt,updatedAt,displayTitle,event,headBranch,name,actor',
  ]);

  if (result.exitCode !== 0) {
    die(`Failed to list workflow runs:\n${result.stderr}`);
  }

  const runs: WorkflowRun[] = JSON.parse(result.stdout);

  if (runs.length === 0) {
    console.log(c.dim('No deploy runs found.'));
    return;
  }

  const columns: Column[] = [
    { header: 'Run', key: 'id', width: 12 },
    { header: 'SHA', key: 'sha', width: 9 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'When', key: 'when', width: 14 },
    { header: 'Duration', key: 'duration', width: 10 },
    { header: 'Actor', key: 'actor', width: 20 },
    { header: 'Title', key: 'title', width: 50 },
  ];

  const rows = runs.map((r) => {
    const statusStr = r.conclusion || r.status;
    const created = new Date(r.createdAt).getTime();
    const updated = new Date(r.updatedAt).getTime();
    const duration = updated - created;

    return {
      id: String(r.databaseId),
      sha: r.headSha.slice(0, 7),
      status: statusStr === 'success'
        ? c.green(statusStr)
        : statusStr === 'failure'
          ? c.red(statusStr)
          : c.yellow(statusStr),
      when: relativeTime(r.createdAt),
      duration: formatDuration(duration),
      actor: r.actor?.login ?? 'unknown',
      title: r.displayTitle,
    };
  });

  console.log(table(columns, rows));

  // Show failure details for failed runs
  const failedRuns = runs.filter((r) => r.conclusion === 'failure');
  if (failedRuns.length > 0) {
    printSection('Failed Run Details');

    for (const failedRun of failedRuns.slice(0, 3)) {
      console.log(`${c.red('Run')} #${failedRun.databaseId} ${c.dim(`(${failedRun.headSha.slice(0, 7)})`)}`);

      // Fetch jobs for this run
      const jobsResult = await run('gh', [
        'run', 'view', String(failedRun.databaseId),
        '--json', 'jobs',
      ]);

      if (jobsResult.exitCode !== 0) {
        console.log(c.dim('  Could not fetch job details.'));
        continue;
      }

      const { jobs } = JSON.parse(jobsResult.stdout) as {
        jobs: Array<{
          name: string;
          conclusion: string;
          steps: Array<{ name: string; conclusion: string; number: number }>;
        }>;
      };

      for (const job of jobs) {
        if (job.conclusion !== 'failure') continue;
        console.log(`  ${c.red('Job:')} ${job.name}`);
        for (const step of job.steps) {
          if (step.conclusion === 'failure') {
            console.log(`    ${c.red('Failed step:')} #${step.number} ${step.name}`);
          }
        }

        // Attempt to fetch job logs (truncated)
        const logResult = await run('gh', [
          'run', 'view', String(failedRun.databaseId),
          '--log-failed',
        ]);
        if (logResult.exitCode === 0 && logResult.stdout.trim()) {
          const logLines = logResult.stdout.trim().split('\n');
          const tail = logLines.slice(-15);
          console.log(c.dim('    --- last 15 lines of failed log ---'));
          for (const line of tail) {
            console.log(c.dim(`    ${line}`));
          }
        }
      }
      console.log();
    }
  }
}

// ---------------------------------------------------------------------------
// Command: services
// ---------------------------------------------------------------------------

async function cmdServices(flags: Record<string, string | true>): Promise<void> {
  await preflight(true);

  const env = getEnv(flags);
  const cluster = clusterName(env);

  printSection(`ECS Service Status (${env})`);

  // Describe the service
  let svcData: any;
  try {
    svcData = await runJSON('aws', [
      'ecs', 'describe-services',
      '--cluster', cluster,
      '--services', SERVICE_NAME,
      ...awsArgs(),
    ]);
  } catch (err) {
    die(`Failed to describe ECS service. Is your AWS CLI configured?\n${err instanceof Error ? err.message : err}`);
  }

  const service = svcData.services?.[0];
  if (!service) {
    die(`Service "${SERVICE_NAME}" not found in cluster "${cluster}".`);
  }

  printKeyValue('Service', service.serviceName);
  printKeyValue('Status', statusBadge(service.status));
  printKeyValue('Running Tasks', `${c.bold(String(service.runningCount))} / ${service.desiredCount} desired`);
  printKeyValue('Task Definition', service.taskDefinition?.split('/').pop() ?? 'unknown');
  printKeyValue('Launch Type', service.launchType ?? 'unknown');

  // Deployments
  if (service.deployments?.length > 0) {
    printSection('Deployments');
    const depCols: Column[] = [
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Task Def', key: 'taskDef', width: 40 },
      { header: 'Running', key: 'running', width: 8, align: 'right' },
      { header: 'Desired', key: 'desired', width: 8, align: 'right' },
      { header: 'Pending', key: 'pending', width: 8, align: 'right' },
      { header: 'Updated', key: 'updated', width: 16 },
    ];
    const depRows = service.deployments.map((d: any) => ({
      status: d.rolloutState === 'COMPLETED'
        ? c.green(d.rolloutState)
        : d.rolloutState === 'FAILED'
          ? c.red(d.rolloutState)
          : c.yellow(d.rolloutState ?? d.status),
      taskDef: d.taskDefinition?.split('/').pop() ?? 'unknown',
      running: String(d.runningCount),
      desired: String(d.desiredCount),
      pending: String(d.pendingCount),
      updated: relativeTime(d.updatedAt),
    }));
    console.log(table(depCols, depRows));
  }

  // List recent task definitions
  printSection('Recent Task Definitions');
  try {
    const tdList = await runJSON<any>('aws', [
      'ecs', 'list-task-definitions',
      '--family-prefix', taskDefFamily(env),
      '--sort', 'DESC',
      '--max-items', '5',
      ...awsArgs(),
    ]);

    for (const arn of (tdList.taskDefinitionArns ?? [])) {
      const td = await runJSON<any>('aws', [
        'ecs', 'describe-task-definition',
        '--task-definition', arn,
        '--query', 'taskDefinition',
        ...awsArgs(),
      ]);
      const image = td.containerDefinitions?.[0]?.image ?? 'unknown';
      const tag = image.split(':').pop() ?? 'unknown';
      const rev = `rev ${td.revision}`;
      console.log(`  ${c.cyan(rev.padEnd(8))}  image: ${c.dim(tag.slice(0, 12))}  registered: ${c.dim(formatTimestamp(td.registeredAt ?? ''))}`);
    }
  } catch {
    console.log(c.dim('  Could not list task definitions.'));
  }

  // Check for stopped tasks
  printSection('Stopped Tasks');
  try {
    const stoppedResult = await runJSON<any>('aws', [
      'ecs', 'list-tasks',
      '--cluster', cluster,
      '--service-name', SERVICE_NAME,
      '--desired-status', 'STOPPED',
      '--max-items', '5',
      ...awsArgs(),
    ]);

    const stoppedArns: string[] = stoppedResult.taskArns ?? [];
    if (stoppedArns.length === 0) {
      console.log(c.green('  No stopped tasks.'));
    } else {
      const described = await runJSON<any>('aws', [
        'ecs', 'describe-tasks',
        '--cluster', cluster,
        '--tasks', ...stoppedArns,
        ...awsArgs(),
      ]);
      for (const task of (described.tasks ?? [])) {
        const container = task.containers?.[0];
        const reason = task.stoppedReason ?? 'unknown';
        const exitCode = container?.exitCode ?? 'N/A';
        const taskId = (task.taskArn as string).split('/').pop() ?? 'unknown';
        console.log(`  ${c.red(taskId.slice(0, 12))}  exit=${exitCode}  reason: ${c.dim(reason)}`);
      }
    }
  } catch {
    console.log(c.dim('  Could not list stopped tasks.'));
  }

  // Health check
  printSection('Health Check');
  const healthUrl = env === 'production'
    ? process.env.PRODUCTION_URL
    : process.env.STAGING_URL;

  if (!healthUrl) {
    console.log(c.dim(`  Set ${env === 'production' ? 'PRODUCTION_URL' : 'STAGING_URL'} env var to enable health checks.`));
  } else {
    try {
      const resp = await fetch(`${healthUrl}/health`);
      const body = await resp.json() as any;
      console.log(`  ${statusBadge(body.status)}  uptime: ${body.uptime}s  version: ${body.version ?? 'unknown'}`);
    } catch (err) {
      console.log(`  ${c.red('[UNREACHABLE]')} ${err instanceof Error ? err.message : err}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Command: logs
// ---------------------------------------------------------------------------

function buildLogInsightsQuery(filter?: string): string {
  const baseFields = 'fields @timestamp, level, event, msg, durationMs, userId, tenantId, @message';

  if (!filter) {
    return `${baseFields} | sort @timestamp desc | limit 200`;
  }

  // Named filter presets
  if (filter === 'errors') {
    return `${baseFields} | filter level >= 50 | sort @timestamp desc | limit 200`;
  }
  if (filter === 'enrichment') {
    return `${baseFields} | filter event like /enrichment/ | sort @timestamp desc | limit 200`;
  }
  if (filter === 'verification') {
    return `${baseFields} | filter event like /verification/ | sort @timestamp desc | limit 200`;
  }
  if (filter === 'slow') {
    return `${baseFields} | filter durationMs > 1000 | sort @timestamp desc | limit 200`;
  }
  if (filter.startsWith('user:')) {
    const userId = filter.slice(5);
    return `${baseFields} | filter userId = "${userId}" | sort @timestamp desc | limit 200`;
  }
  if (filter.startsWith('tenant:')) {
    const tenantId = filter.slice(7);
    return `${baseFields} | filter tenantId = "${tenantId}" | sort @timestamp desc | limit 200`;
  }

  // Raw query string
  return `${baseFields} | ${filter} | sort @timestamp desc | limit 200`;
}

async function cmdLogs(flags: Record<string, string | true>): Promise<void> {
  await preflight(true);

  const env = getEnv(flags);
  const minutes = typeof flags.minutes === 'string' ? parseInt(flags.minutes, 10) : 30;
  const filter = typeof flags.filter === 'string' ? flags.filter : undefined;

  const lg = logGroup(env);
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - minutes * 60;
  const query = buildLogInsightsQuery(filter);

  printSection(`CloudWatch Logs (${env}) - last ${minutes}m`);
  console.log(c.dim(`Log group: ${lg}`));
  console.log(c.dim(`Query: ${query}`));
  console.log();

  // Start the query
  let queryId: string;
  try {
    const startResult = await runJSON<any>('aws', [
      'logs', 'start-query',
      '--log-group-name', lg,
      '--start-time', String(startTime),
      '--end-time', String(now),
      '--query-string', query,
      ...awsArgs(),
    ]);
    queryId = startResult.queryId;
  } catch (err) {
    die(`Failed to start log query. Check that log group "${lg}" exists.\n${err instanceof Error ? err.message : err}`);
  }

  console.log(c.dim(`Query started (${queryId}). Waiting for results...`));

  // Poll for results
  let attempts = 0;
  const maxAttempts = 30;
  let results: any[] = [];

  while (attempts < maxAttempts) {
    await Bun.sleep(1000);
    attempts++;

    const queryResult = await runJSON<any>('aws', [
      'logs', 'get-query-results',
      '--query-id', queryId,
      ...awsArgs(),
    ]);

    if (queryResult.status === 'Complete') {
      results = queryResult.results ?? [];
      break;
    }
    if (queryResult.status === 'Failed' || queryResult.status === 'Cancelled') {
      die(`Query ${queryResult.status.toLowerCase()}.`);
    }
  }

  if (attempts >= maxAttempts) {
    die('Query timed out after 30 seconds.');
  }

  console.log(c.dim(`Found ${results.length} log entries.\n`));

  if (results.length === 0) return;

  // Each result is an array of {field, value} objects
  for (const entry of results) {
    const fields: Record<string, string> = {};
    for (const f of entry) {
      fields[f.field] = f.value;
    }

    const ts = fields['@timestamp'] ?? '';
    const level = parseInt(fields.level ?? '30', 10);
    const event = fields.event ?? '';
    const msg = fields.msg ?? '';
    const duration = fields.durationMs ? `(${fields.durationMs}ms)` : '';
    const userId = fields.userId ? `user=${fields.userId}` : '';
    const tenantId = fields.tenantId ? `tenant=${fields.tenantId}` : '';

    const parts = [
      c.dim(ts),
      levelName(level),
      event ? c.cyan(event) : '',
      msg,
      duration ? c.dim(duration) : '',
      userId ? c.dim(userId) : '',
      tenantId ? c.dim(tenantId) : '',
    ].filter(Boolean);

    console.log(parts.join(' '));
  }
}

// ---------------------------------------------------------------------------
// Command: status
// ---------------------------------------------------------------------------

async function cmdStatus(flags: Record<string, string | true>): Promise<void> {
  await preflight(true);

  const env = getEnv(flags);
  const cluster = clusterName(env);
  const issues: string[] = [];

  printSection(`System Status (${env})`);

  // 1. Health endpoint
  const healthUrl = env === 'production'
    ? process.env.PRODUCTION_URL
    : process.env.STAGING_URL;

  console.log(c.bold('Health Endpoint'));
  if (!healthUrl) {
    console.log(c.dim(`  Set ${env === 'production' ? 'PRODUCTION_URL' : 'STAGING_URL'} env var. Skipping.`));
    issues.push('Health URL not configured');
  } else {
    try {
      const deepResp = await fetch(`${healthUrl}/health/deep`);
      const deepBody = await deepResp.json() as any;

      if (deepResp.status === 200 && deepBody.status === 'ok') {
        console.log(`  ${statusBadge('ok')} Deep health check passed`);
      } else {
        console.log(`  ${statusBadge('degraded')} Status: ${deepBody.status}`);
        issues.push(`Health check: ${deepBody.status}`);
      }

      if (deepBody.checks) {
        for (const [name, check] of Object.entries(deepBody.checks) as [string, any][]) {
          const badge = check.status === 'ok' ? c.green('OK') : c.red('ERR');
          const latency = check.latencyMs != null ? c.dim(`${check.latencyMs}ms`) : '';
          const errMsg = check.error ? c.red(check.error) : '';
          console.log(`    ${badge} ${name} ${latency} ${errMsg}`);
          if (check.status !== 'ok') {
            issues.push(`${name}: ${check.error ?? 'unhealthy'}`);
          }
        }
      }
    } catch (err) {
      console.log(`  ${c.red('[UNREACHABLE]')} ${err instanceof Error ? err.message : err}`);
      issues.push('Health endpoint unreachable');
    }
  }
  console.log();

  // 2. ECS service
  console.log(c.bold('ECS Service'));
  try {
    const svcData = await runJSON<any>('aws', [
      'ecs', 'describe-services',
      '--cluster', cluster,
      '--services', SERVICE_NAME,
      ...awsArgs(),
    ]);

    const svc = svcData.services?.[0];
    if (!svc) {
      console.log(`  ${c.red('[NOT FOUND]')} Service not found`);
      issues.push('ECS service not found');
    } else {
      const running = svc.runningCount ?? 0;
      const desired = svc.desiredCount ?? 0;
      const runBadge = running >= desired ? c.green(String(running)) : c.red(String(running));
      console.log(`  Tasks: ${runBadge} / ${desired} desired`);

      if (running < desired) {
        issues.push(`Only ${running}/${desired} tasks running`);
      }

      // Check deployment status
      const primaryDeployment = svc.deployments?.find((d: any) => d.status === 'PRIMARY');
      if (primaryDeployment) {
        const rollout = primaryDeployment.rolloutState;
        if (rollout === 'IN_PROGRESS') {
          console.log(`  ${c.yellow('[DEPLOYING]')} Deployment in progress`);
          issues.push('Deployment in progress');
        } else if (rollout === 'FAILED') {
          console.log(`  ${c.red('[DEPLOY FAILED]')}`);
          issues.push('Last deployment failed');
        } else {
          console.log(`  ${statusBadge('ok')} Last deployment: ${rollout ?? 'stable'}`);
        }
      }
    }
  } catch (err) {
    console.log(`  ${c.red('[ERROR]')} ${err instanceof Error ? err.message : err}`);
    issues.push('Could not query ECS');
  }
  console.log();

  // 3. Recent error logs
  console.log(c.bold('Recent Errors (last 5 minutes)'));
  try {
    const lg = logGroup(env);
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - 5 * 60;
    const errQuery = 'fields @timestamp, level, event, msg | filter level >= 50 | sort @timestamp desc | limit 20';

    const startResult = await runJSON<any>('aws', [
      'logs', 'start-query',
      '--log-group-name', lg,
      '--start-time', String(startTime),
      '--end-time', String(now),
      '--query-string', errQuery,
      ...awsArgs(),
    ]);

    // Wait for results
    let errResults: any[] = [];
    for (let i = 0; i < 15; i++) {
      await Bun.sleep(1000);
      const qr = await runJSON<any>('aws', [
        'logs', 'get-query-results',
        '--query-id', startResult.queryId,
        ...awsArgs(),
      ]);
      if (qr.status === 'Complete') {
        errResults = qr.results ?? [];
        break;
      }
    }

    if (errResults.length === 0) {
      console.log(`  ${c.green('No errors')} in the last 5 minutes`);
    } else {
      console.log(`  ${c.red(`${errResults.length} error(s)`)} found:`);
      for (const entry of errResults.slice(0, 10)) {
        const fields: Record<string, string> = {};
        for (const f of entry) fields[f.field] = f.value;
        console.log(`    ${c.dim(fields['@timestamp'] ?? '')} ${c.red(fields.event ?? '')} ${fields.msg ?? ''}`);
      }
      issues.push(`${errResults.length} errors in last 5 minutes`);
    }
  } catch {
    console.log(c.dim('  Could not query error logs.'));
  }
  console.log();

  // 4. DynamoDB tables
  console.log(c.bold('DynamoDB Tables'));
  const tableNames = env === 'staging'
    ? ['frodo-staging-main', 'frodo-staging-identity-lookup']
    : ['frodo-production-main', 'frodo-production-identity-lookup'];

  for (const tbl of tableNames) {
    try {
      const desc = await runJSON<any>('aws', [
        'dynamodb', 'describe-table',
        '--table-name', tbl,
        ...awsArgs(),
      ]);
      const t = desc.Table;
      const status = t.TableStatus;
      const itemCount = t.ItemCount ?? 'unknown';
      const badge = status === 'ACTIVE' ? c.green('ACTIVE') : c.yellow(status);
      console.log(`  ${badge} ${tbl} (${itemCount} items)`);
    } catch {
      console.log(`  ${c.red('[ERROR]')} ${tbl}: could not describe`);
      issues.push(`DynamoDB table ${tbl} not accessible`);
    }
  }
  console.log();

  // Summary
  printSection('Summary');
  if (issues.length === 0) {
    console.log(c.green(c.bold('  HEALTHY')) + ' - All checks passed');
  } else if (issues.some((i) => i.includes('unreachable') || i.includes('not found') || i.includes('DOWN'))) {
    console.log(c.red(c.bold('  DOWN')) + ' - Critical issues detected');
    for (const issue of issues) {
      console.log(`    ${c.red('-')} ${issue}`);
    }
  } else {
    console.log(c.yellow(c.bold('  DEGRADED')) + ` - ${issues.length} issue(s) detected`);
    for (const issue of issues) {
      console.log(`    ${c.yellow('-')} ${issue}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Command: rollback
// ---------------------------------------------------------------------------

async function cmdRollback(flags: Record<string, string | true>): Promise<void> {
  await preflight(true);

  const env = getEnv(flags);
  const cluster = clusterName(env);
  const family = taskDefFamily(env);
  const toRevision = typeof flags.to === 'string' ? flags.to : undefined;

  printSection(`Rollback (${env})`);

  // List recent task definitions
  let tdArns: string[];
  try {
    const tdList = await runJSON<any>('aws', [
      'ecs', 'list-task-definitions',
      '--family-prefix', family,
      '--sort', 'DESC',
      '--max-items', '5',
      ...awsArgs(),
    ]);
    tdArns = tdList.taskDefinitionArns ?? [];
  } catch (err) {
    die(`Could not list task definitions.\n${err instanceof Error ? err.message : err}`);
  }

  if (tdArns.length === 0) {
    die('No task definitions found.');
  }

  // Describe each one
  interface TdInfo {
    arn: string;
    revision: number;
    imageTag: string;
    registeredAt: string;
  }

  const tdInfos: TdInfo[] = [];
  for (const arn of tdArns) {
    const td = await runJSON<any>('aws', [
      'ecs', 'describe-task-definition',
      '--task-definition', arn,
      '--query', 'taskDefinition',
      ...awsArgs(),
    ]);
    const image = td.containerDefinitions?.[0]?.image ?? 'unknown';
    const tag = image.split(':').pop() ?? 'unknown';
    tdInfos.push({
      arn,
      revision: td.revision,
      imageTag: tag,
      registeredAt: td.registeredAt ?? '',
    });
  }

  const tdCols: Column[] = [
    { header: '#', key: 'idx', width: 3, align: 'right' },
    { header: 'Revision', key: 'revision', width: 10 },
    { header: 'Image Tag', key: 'imageTag', width: 14 },
    { header: 'Registered', key: 'registered', width: 24 },
    { header: 'ARN', key: 'arn', width: 60 },
  ];

  const tdRows = tdInfos.map((td, i) => ({
    idx: String(i + 1),
    revision: String(td.revision),
    imageTag: td.imageTag.slice(0, 12),
    registered: td.registeredAt ? formatTimestamp(td.registeredAt) : 'unknown',
    arn: td.arn,
  }));

  console.log(table(tdCols, tdRows));
  console.log();

  // Determine target
  let targetArn: string;

  if (toRevision) {
    // Find the matching revision
    const match = tdInfos.find((td) => String(td.revision) === toRevision);
    if (!match) {
      die(`Revision ${toRevision} not found in recent definitions. Available: ${tdInfos.map((t) => t.revision).join(', ')}`);
    }
    targetArn = match.arn;
    console.log(`Rolling back to revision ${c.bold(toRevision)} (${match.imageTag.slice(0, 12)})`);
  } else {
    // Interactive prompt
    const prompt = `Select revision to roll back to (1-${tdInfos.length}), or 'q' to quit: `;
    process.stdout.write(c.bold(prompt));

    const reader = Bun.stdin.stream().getReader();
    const { value } = await reader.read();
    reader.releaseLock();
    const input = new TextDecoder().decode(value).trim();

    if (input === 'q' || input === '') {
      console.log('Cancelled.');
      return;
    }

    const idx = parseInt(input, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= tdInfos.length) {
      die(`Invalid selection "${input}".`);
    }

    targetArn = tdInfos[idx].arn;
    console.log(`\nRolling back to revision ${c.bold(String(tdInfos[idx].revision))} (${tdInfos[idx].imageTag.slice(0, 12)})`);
  }

  // Confirm for production
  if (env === 'production') {
    process.stdout.write(c.red(c.bold('\nWARNING: This is PRODUCTION. Type "yes" to confirm: ')));
    const reader = Bun.stdin.stream().getReader();
    const { value } = await reader.read();
    reader.releaseLock();
    const confirm = new TextDecoder().decode(value).trim();
    if (confirm !== 'yes') {
      console.log('Cancelled.');
      return;
    }
  }

  // Update the service
  console.log(`\n${c.yellow('Updating service...')}`);

  try {
    await runJSON<any>('aws', [
      'ecs', 'update-service',
      '--cluster', cluster,
      '--service', SERVICE_NAME,
      '--task-definition', targetArn,
      ...awsArgs(),
    ]);
    console.log(c.green('Service updated. New deployment started.'));
  } catch (err) {
    die(`Failed to update service.\n${err instanceof Error ? err.message : err}`);
  }

  // Show deployment status
  console.log(c.dim('Checking deployment status...'));
  await Bun.sleep(3000);

  try {
    const svcData = await runJSON<any>('aws', [
      'ecs', 'describe-services',
      '--cluster', cluster,
      '--services', SERVICE_NAME,
      ...awsArgs(),
    ]);
    const svc = svcData.services?.[0];
    if (svc?.deployments) {
      for (const dep of svc.deployments) {
        const state = dep.rolloutState ?? dep.status;
        console.log(`  ${statusBadge(state)} running=${dep.runningCount} desired=${dep.desiredCount} ${c.dim(dep.taskDefinition?.split('/').pop() ?? '')}`);
      }
    }
  } catch {
    console.log(c.dim('  Could not fetch deployment status.'));
  }

  console.log(`\n${c.dim('Use')} bun scripts/ops.ts services --env ${env} ${c.dim('to monitor progress.')}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const USAGE = `
${c.bold('Frodo Ops CLI')} - Production/staging operations

${c.bold('Usage:')} bun scripts/ops.ts <command> [options]

${c.bold('Commands:')}
  ${c.cyan('deployments')}  List recent deploy workflow runs
  ${c.cyan('services')}     Show ECS service status and task definitions
  ${c.cyan('logs')}         Query CloudWatch Logs Insights
  ${c.cyan('status')}       Comprehensive system health check
  ${c.cyan('rollback')}     Roll back to a previous task definition

${c.bold('Global Options:')}
  --env <staging|production>   Target environment (default: staging)

${c.bold('Examples:')}
  bun scripts/ops.ts deployments --limit 5
  bun scripts/ops.ts services --env production
  bun scripts/ops.ts logs --env staging --minutes 60 --filter errors
  bun scripts/ops.ts logs --filter user:abc123
  bun scripts/ops.ts logs --filter slow
  bun scripts/ops.ts status --env production
  bun scripts/ops.ts rollback --env staging --to 42
`.trim();

async function main(): Promise<void> {
  const { command, flags } = parseArgs(process.argv);

  switch (command) {
    case 'deployments':
      return cmdDeployments(flags);
    case 'services':
      return cmdServices(flags);
    case 'logs':
      return cmdLogs(flags);
    case 'status':
      return cmdStatus(flags);
    case 'rollback':
      return cmdRollback(flags);
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
