// ---------------------------------------------------------------------------
// Shared utilities for ops scripts
// ---------------------------------------------------------------------------

// ---- ANSI color helpers ---------------------------------------------------

const isColorEnabled = process.env.NO_COLOR === undefined;

function wrap(code: string, text: string): string {
  return isColorEnabled ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export const c = {
  green: (t: string) => wrap('32', t),
  red: (t: string) => wrap('31', t),
  yellow: (t: string) => wrap('33', t),
  cyan: (t: string) => wrap('36', t),
  blue: (t: string) => wrap('34', t),
  magenta: (t: string) => wrap('35', t),
  bold: (t: string) => wrap('1', t),
  dim: (t: string) => wrap('2', t),
  underline: (t: string) => wrap('4', t),
};

// ---- Status badges --------------------------------------------------------

export function statusBadge(status: string): string {
  const s = status.toLowerCase();
  if (['success', 'ok', 'healthy', 'running', 'active', 'completed'].includes(s)) {
    return c.green(`[${status.toUpperCase()}]`);
  }
  if (['failure', 'failed', 'error', 'down', 'stopped'].includes(s)) {
    return c.red(`[${status.toUpperCase()}]`);
  }
  if (['in_progress', 'pending', 'degraded', 'warning', 'draining'].includes(s)) {
    return c.yellow(`[${status.toUpperCase()}]`);
  }
  return c.dim(`[${status.toUpperCase()}]`);
}

// ---- Table formatting -----------------------------------------------------

export interface Column {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'right';
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '\u2026';
}

function pad(str: string, width: number, align: 'left' | 'right' = 'left'): string {
  if (align === 'right') return str.padStart(width);
  return str.padEnd(width);
}

export function table(columns: Column[], rows: Record<string, string>[]): string {
  // Compute widths: max of header and all cell values, capped by column.width
  const widths = columns.map((col) => {
    const dataMax = rows.reduce(
      (max, row) => Math.max(max, (row[col.key] ?? '').length),
      col.header.length,
    );
    return col.width ? Math.min(dataMax, col.width) : dataMax;
  });

  const sep = '  ';
  const headerLine = columns.map((col, i) => c.bold(pad(col.header, widths[i], col.align))).join(sep);
  const divider = widths.map((w) => '\u2500'.repeat(w)).join(sep);
  const bodyLines = rows.map((row) =>
    columns
      .map((col, i) => {
        const val = row[col.key] ?? '';
        return pad(truncate(val, widths[i]), widths[i], col.align);
      })
      .join(sep),
  );

  return [headerLine, divider, ...bodyLines].join('\n');
}

// ---- Date formatting ------------------------------------------------------

export function relativeTime(dateStr: string | number): string {
  const date = typeof dateStr === 'number' ? dateStr : new Date(dateStr).getTime();
  const now = Date.now();
  const diffMs = now - date;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  return `${minutes}m ${remainSeconds}s`;
}

export function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z');
}

// ---- JSON log line parsing ------------------------------------------------

export interface LogEntry {
  level: number;
  time: number;
  msg?: string;
  event?: string;
  durationMs?: number;
  userId?: string;
  tenantId?: string;
  err?: { message?: string; stack?: string };
  [key: string]: unknown;
}

export function parseLogLine(line: string): LogEntry | null {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith('{')) return null;
  try {
    return JSON.parse(trimmed) as LogEntry;
  } catch {
    return null;
  }
}

export function levelName(level: number): string {
  if (level >= 60) return c.red('FATAL');
  if (level >= 50) return c.red('ERROR');
  if (level >= 40) return c.yellow('WARN');
  if (level >= 30) return c.green('INFO');
  if (level >= 20) return c.dim('DEBUG');
  return c.dim('TRACE');
}

export function formatLogEntry(entry: LogEntry): string {
  const ts = c.dim(new Date(entry.time).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''));
  const level = levelName(entry.level);
  const event = entry.event ? c.cyan(entry.event) : '';
  const msg = entry.msg ?? '';
  const duration = entry.durationMs != null ? c.dim(`(${entry.durationMs}ms)`) : '';

  const contextParts: string[] = [];
  if (entry.userId) contextParts.push(`user=${c.dim(entry.userId)}`);
  if (entry.tenantId) contextParts.push(`tenant=${c.dim(entry.tenantId)}`);
  const context = contextParts.length > 0 ? c.dim(contextParts.join(' ')) : '';

  const errorMsg = entry.err?.message ? c.red(` ERR: ${entry.err.message}`) : '';

  return [ts, level, event, msg, duration, context, errorMsg].filter(Boolean).join(' ');
}

// ---- CLI arg parsing ------------------------------------------------------

export interface ParsedArgs {
  command: string;
  positional: string[];
  flags: Record<string, string | true>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  // argv from Bun: [bun, script.ts, ...rest]
  const args = argv.slice(2);
  const command = args[0] ?? '';
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};

  let i = 1;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i += 1;
      }
    } else {
      positional.push(arg);
      i += 1;
    }
  }

  return { command, positional, flags };
}

// ---- Spawn helper ---------------------------------------------------------

export interface SpawnResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function run(cmd: string, args: string[]): Promise<SpawnResult> {
  const proc = Bun.spawn([cmd, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;

  return { stdout, stderr, exitCode };
}

export async function runJSON<T = unknown>(cmd: string, args: string[]): Promise<T> {
  const result = await run(cmd, args);
  if (result.exitCode !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}\n${result.stderr}`);
  }
  return JSON.parse(result.stdout) as T;
}

// ---- Error helpers --------------------------------------------------------

export function die(msg: string): never {
  console.error(c.red(`Error: ${msg}`));
  process.exit(1);
}

export function printSection(title: string): void {
  console.log(`\n${c.bold(c.underline(title))}\n`);
}

export function printKeyValue(key: string, value: string, indent = 0): void {
  const prefix = ' '.repeat(indent);
  console.log(`${prefix}${c.dim(key + ':')} ${value}`);
}
