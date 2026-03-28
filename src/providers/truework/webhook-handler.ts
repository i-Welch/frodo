import { getTrueworkBaseUrl } from './config.js';
import { putModule } from '../../store/user-store.js';
import { getModule } from '../../store/user-store.js';
import { createChildLogger } from '../../logger.js';
import type { WebhookHandler, WebhookEvent } from '../../webhooks/types.js';

const log = createChildLogger({ module: 'truework-webhook' });

/**
 * Truework webhook handler.
 *
 * Truework sends a webhook when a verification request completes.
 * The payload includes the verification ID and the completed reports
 * with employer, title, salary, and employment history.
 *
 * Webhook URL: https://app.reportraven.tech/webhooks/truework
 */

interface TrueworkWebhookPayload {
  hook_id: string;
  event_type: string;           // "verification_request.state.change"
  verification_request: {
    id: string;
    state: string;              // "completed", "canceled", etc.
    type: string;
    target: {
      first_name: string;
      last_name: string;
      social_security_number: string;
      company: { name: string } | null;
    };
    reports: {
      employer: { name: string };
      employee: {
        first_name: string;
        last_name: string;
        status: 'active' | 'inactive';
        hire_date: string | null;
        termination_date: string | null;
      };
      position: {
        title: string;
        start_date: string | null;
        end_date: string | null;
      };
      salary: {
        gross_pay: number | null;
        pay_frequency: string | null;
        hours_per_week: number | null;
      };
    }[];
    metadata: Record<string, unknown> | null;
  };
}

export const trueworkWebhookHandler: WebhookHandler = {
  provider: 'truework',

  validate(headers, body): boolean {
    // Truework includes the webhook token in the X-Truework-Token header.
    // Reject requests that don't match.
    const expectedToken = process.env.PROVIDER_TRUEWORK_WEBHOOK_SECRET;
    if (expectedToken) {
      const receivedToken = headers['x-truework-token'];
      if (receivedToken !== expectedToken) {
        log.warn('Truework webhook token mismatch — rejecting');
        return false;
      }
    }

    const payload = body as Record<string, unknown>;
    return !!payload?.event_type && !!payload?.verification_request;
  },

  parse(body): WebhookEvent[] {
    const payload = body as TrueworkWebhookPayload;

    // Only process completed verifications
    if (payload.verification_request.state !== 'completed') {
      log.debug(
        { state: payload.verification_request.state, id: payload.verification_request.id },
        'Truework webhook — verification not completed, skipping',
      );
      return [];
    }

    const reports = payload.verification_request.reports;
    if (!reports || reports.length === 0) {
      return [];
    }

    // We need to resolve the userId from the verification request.
    // The enricher stores the verification ID in event metadata when it creates the request.
    // We store the userId in metadata when creating the verification.
    const userId = (payload.verification_request.metadata?.ravenUserId as string) ?? '';
    if (!userId) {
      log.warn(
        { verificationId: payload.verification_request.id },
        'Truework webhook — no ravenUserId in metadata, cannot map to user',
      );
      return [];
    }

    // Parse the reports into employment data
    const primary = reports[0];
    const fields: Record<string, unknown> = {};

    fields.employer = primary.employer.name;
    if (primary.position.title) fields.title = primary.position.title;
    if (primary.position.start_date) fields.startDate = primary.position.start_date;

    if (primary.salary.gross_pay !== null) {
      fields.salary = normalizeToAnnual(primary.salary.gross_pay, primary.salary.pay_frequency);
    }

    if (reports.length > 1) {
      fields.history = reports.map((r) => ({
        employer: r.employer.name,
        title: r.position.title || undefined,
        startDate: r.position.start_date || undefined,
        endDate: r.position.end_date || undefined,
      }));
    }

    log.info(
      {
        verificationId: payload.verification_request.id,
        userId,
        employer: primary.employer.name,
        reportCount: reports.length,
      },
      'Truework verification completed via webhook',
    );

    return [{
      userId,
      module: 'employment',
      fields,
      metadata: {
        trueworkVerificationId: payload.verification_request.id,
        trueworkHookId: payload.hook_id,
        employeeStatus: primary.employee.status,
        reportCount: reports.length,
      },
    }];
  },
};

function normalizeToAnnual(grossPay: number, frequency: string | null): number {
  switch (frequency) {
    case 'annual': return grossPay;
    case 'monthly': return grossPay * 12;
    case 'bi-weekly': return grossPay * 26;
    case 'weekly': return grossPay * 52;
    case 'semi-monthly': return grossPay * 24;
    default: return grossPay;
  }
}
