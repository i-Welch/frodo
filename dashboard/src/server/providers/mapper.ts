/**
 * Declarative field mapping from provider response schemas to module schemas.
 */

export interface FieldMapping {
  /** Source path in provider response (dot-notation, supports array notation like "accounts[0].balance" or "accounts[].id") */
  from: string;
  /** Target field in module schema */
  to: string;
  /** Optional transform function */
  transform?: (value: unknown) => unknown;
}

export interface DataMapper {
  provider: string;
  module: string;
  mappings: FieldMapping[];
}

/**
 * Extract a value from a nested object using dot-notation path.
 * Supports:
 * - Simple paths: "foo.bar.baz"
 * - Array index: "accounts[0].balance"
 * - Array wildcard: "accounts[].id" (returns array of all matching values)
 */
export function extractPath(obj: unknown, path: string): unknown {
  const segments = parsePath(path);
  return extractSegments(obj, segments);
}

/**
 * Apply all mappings from a provider response to produce module-shaped data.
 */
export function applyMappings(
  response: unknown,
  mappings: FieldMapping[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const mapping of mappings) {
    const value = extractPath(response, mapping.from);
    if (value === undefined) continue;

    result[mapping.to] = mapping.transform ? mapping.transform(value) : value;
  }

  return result;
}

/**
 * Create a mapper function from a DataMapper configuration.
 * Returns a function that transforms a provider response into module-shaped data.
 */
export function createMapper(
  config: DataMapper,
): (providerResponse: unknown) => Record<string, unknown> {
  return (providerResponse: unknown) =>
    applyMappings(providerResponse, config.mappings);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type PathSegment =
  | { type: 'key'; key: string }
  | { type: 'index'; index: number }
  | { type: 'wildcard' };

function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  const parts = path.split('.');

  for (const part of parts) {
    // Match patterns like "accounts[0]" or "accounts[]"
    const bracketMatch = part.match(/^([^[]*)\[(\d*)\]$/);
    if (bracketMatch) {
      const key = bracketMatch[1];
      const indexStr = bracketMatch[2];

      if (key) {
        segments.push({ type: 'key', key });
      }

      if (indexStr === '') {
        segments.push({ type: 'wildcard' });
      } else {
        segments.push({ type: 'index', index: parseInt(indexStr, 10) });
      }
    } else {
      segments.push({ type: 'key', key: part });
    }
  }

  return segments;
}

function extractSegments(obj: unknown, segments: PathSegment[]): unknown {
  if (segments.length === 0) return obj;
  if (obj === null || obj === undefined) return undefined;

  const [head, ...rest] = segments;

  switch (head.type) {
    case 'key': {
      if (typeof obj !== 'object') return undefined;
      const value = (obj as Record<string, unknown>)[head.key];
      return extractSegments(value, rest);
    }
    case 'index': {
      if (!Array.isArray(obj)) return undefined;
      const value = obj[head.index];
      return extractSegments(value, rest);
    }
    case 'wildcard': {
      if (!Array.isArray(obj)) return undefined;
      const results = obj.map((item) => extractSegments(item, rest));
      // Filter out undefined values
      return results.filter((v) => v !== undefined);
    }
  }
}
