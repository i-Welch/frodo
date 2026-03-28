import { Elysia } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
import { getLink } from '../../store/tenant-user-store.js';
import { getAllModules } from '../../store/user-store.js';
import { getEventsForUser } from '../../store/event-store.js';
import { resolveFields } from '../../events/resolver.js';
import { checkStaleness } from '../../enrichment/staleness.js';
import { listProviderTokens } from '../../providers/token-store.js';
import type { DataEvent } from '../../events/types.js';
import type { ResolvedField } from '../../events/resolver.js';
import type { ApiError } from '../../types.js';

// ---------------------------------------------------------------------------
// Report types
// ---------------------------------------------------------------------------

interface FieldMetadata {
  value: unknown;
  confidence: number;
  source: string;
  lastUpdated: string;
  isStale: boolean;
  goodBy: string;
}

interface ModuleReport {
  data: Record<string, unknown>;
  fields: Record<string, FieldMetadata>;
}

export interface BorrowerReport {
  userId: string;
  generatedAt: string;
  modules: Record<string, ModuleReport>;
  auditTrail: DataEvent[];
  staleness: {
    staleModules: {
      module: string;
      staleCount: number;
      freshCount: number;
      totalCount: number;
    }[];
  };
  riskScores: Record<string, unknown>;
  linkedProviders: string[];
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

/**
 * Borrower Report API — aggregates all data for the report view.
 * Supports both API key and Clerk auth.
 */
export const reportRoutes = new Elysia({ prefix: '/api/v1/users' })
  .onError(({ error, set }) => {
    if (error instanceof AuthError) {
      set.status = 401;
      return (error as AuthError).apiError;
    }
  })
  .derive(async ({ headers }) => {
    return resolveCombinedAuth(headers);
  })

  // -----------------------------------------------------------------------
  // GET /api/v1/users/:id/report — full borrower report
  // -----------------------------------------------------------------------
  .get('/:id/report', async ({ params, tenant, set }) => {
    // Verify tenant-user link
    const link = await getLink(tenant.tenantId, params.id);
    if (!link) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `User ${params.id} not found or not linked to this tenant`,
      };
      return err;
    }

    const userId = params.id;
    const now = new Date();

    // Fetch all data in parallel
    const [modules, eventsResult, stalenessReport, tokens] = await Promise.all([
      getAllModules(userId),
      getAllEvents(userId),
      checkStaleness(userId),
      listProviderTokens(userId),
    ]);

    // Resolve per-field metadata from events
    const allEvents = eventsResult;
    const moduleReports: Record<string, ModuleReport> = {};

    for (const [moduleName, data] of Object.entries(modules)) {
      // Get events for this module
      const moduleEvents = allEvents.filter((e) => e.module === moduleName);
      const resolved = resolveFields(moduleEvents, now);

      // Build per-field metadata
      const fields: Record<string, FieldMetadata> = {};
      for (const [fieldName, fieldData] of Object.entries(resolved)) {
        const staleModule = stalenessReport.staleModules.find((m) => m.module === moduleName);
        const isStale = staleModule?.staleFields.some((f) => f.field === fieldName) ?? false;

        fields[fieldName] = {
          value: fieldData.value,
          confidence: fieldData.confidence,
          source: fieldData.source,
          lastUpdated: fieldData.timestamp,
          isStale,
          goodBy: fieldData.goodBy,
        };
      }

      moduleReports[moduleName] = { data, fields };
    }

    // Extract risk scores from enrichment events metadata
    const riskScores = extractRiskScores(allEvents);

    // Staleness summary
    const staleness = {
      staleModules: stalenessReport.staleModules.map((m) => ({
        module: m.module,
        staleCount: m.staleFields.length,
        freshCount: m.freshFields,
        totalCount: m.totalFields,
      })),
    };

    // Linked providers
    const linkedProviders = [...new Set(tokens.map((t) => t.provider))];

    const report: BorrowerReport = {
      userId,
      generatedAt: now.toISOString(),
      modules: moduleReports,
      auditTrail: allEvents.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
      staleness,
      riskScores,
      linkedProviders,
    };

    return report;
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAllEvents(userId: string): Promise<DataEvent[]> {
  const allEvents: DataEvent[] = [];
  let cursor: string | undefined;

  do {
    const result = await getEventsForUser(userId, { cursor });
    allEvents.push(...result.events);
    cursor = result.cursor;
  } while (cursor);

  return allEvents;
}

/**
 * Extract risk scores from enrichment event metadata.
 * Socure stores risk scores (fraud, watchlist, phone risk, etc.) in event metadata.
 */
function extractRiskScores(events: DataEvent[]): Record<string, unknown> {
  const scores: Record<string, unknown> = {};

  for (const event of events) {
    if (!event.metadata) continue;

    // Socure risk scores
    if (event.source.source === 'socure') {
      if (event.metadata.decision) scores.socureDecision = event.metadata.decision;
      if (event.metadata.tags) scores.socureTags = event.metadata.tags;
      if (event.metadata.phoneRiskScore !== undefined) scores.phoneRiskScore = event.metadata.phoneRiskScore;
      if (event.metadata.emailRiskScore !== undefined) scores.emailRiskScore = event.metadata.emailRiskScore;
      if (event.metadata.addressRiskScore !== undefined) scores.addressRiskScore = event.metadata.addressRiskScore;
      if (event.metadata.fraudScore !== undefined) scores.fraudScore = event.metadata.fraudScore;
      if (event.metadata.syntheticIdentityScore !== undefined) scores.syntheticIdentityScore = event.metadata.syntheticIdentityScore;
      if (event.metadata.watchlistScore !== undefined) scores.watchlistScore = event.metadata.watchlistScore;
      if (event.metadata.kycScore !== undefined) scores.kycScore = event.metadata.kycScore;
      if (event.metadata.namePhoneCorrelationScore !== undefined) scores.namePhoneCorrelationScore = event.metadata.namePhoneCorrelationScore;
      if (event.metadata.nameAddressCorrelationScore !== undefined) scores.nameAddressCorrelationScore = event.metadata.nameAddressCorrelationScore;
    }

    // Truework verification status
    if (event.source.source === 'truework') {
      if (event.metadata.verificationId) scores.trueworkVerificationId = event.metadata.verificationId;
      if (event.metadata.state) scores.trueworkState = event.metadata.state;
      if (event.metadata.employeeStatus) scores.trueworkEmployeeStatus = event.metadata.employeeStatus;
    }

    // Plaid metadata
    if (event.source.source === 'plaid') {
      if (event.metadata.plaidRequestId) scores.plaidLastRequestId = event.metadata.plaidRequestId;
      if (event.metadata.accountCount) scores.plaidAccountCount = event.metadata.accountCount;
      if (event.metadata.institutionId) scores.plaidInstitutionId = event.metadata.institutionId;
    }
  }

  return scores;
}
