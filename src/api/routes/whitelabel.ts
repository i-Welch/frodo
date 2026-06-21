import { Elysia, t } from 'elysia';
import type { FlowKind, ModuleName } from '../../whitelabel/types.js';
import { getConfig, toPublicConfig } from '../../whitelabel/config-store.js';
import { getFlow, resolveFlow } from '../../whitelabel/flows.js';
import { startIntake, getIntake, chooseTerm, submitIntake } from '../../whitelabel/service.js';

/**
 * White-label borrower experience API.
 *
 * Powers the Next.js journey (the front-end talks only to these endpoints via
 * its WhiteLabelClient seam). Public — no API key; resolution is by slug/host
 * and a short-lived intake id. Demo vs live is decided server-side by the
 * tenant/host mode, transparent to the caller.
 */
export const whitelabelRoutes = new Elysia({ prefix: '/api/v1/wl' })
  // Resolve the public config + the active flow for an entry.
  .get(
    '/context',
    ({ query, set }) => {
      const config = getConfig(query.slug);
      if (!config) {
        set.status = 404;
        return { error: 'unknown_tenant' };
      }
      const allowed = config.defaultFlows ?? (['rate_range'] as FlowKind[]);
      const flow = resolveFlow(query.flow as FlowKind | undefined, allowed) ?? allowed[0];
      return { config: toPublicConfig(config), flow: getFlow(flow) };
    },
    {
      query: t.Object({
        slug: t.String(),
        flow: t.Optional(t.String()),
      }),
    },
  )
  // Start an intake: create + run enrichment (mock in sandbox), compute rate.
  .post(
    '/intake',
    async ({ body, set }) => {
      const config = getConfig(body.slug);
      if (!config) {
        set.status = 404;
        return { error: 'unknown_tenant' };
      }
      const allowed = config.defaultFlows ?? (['rate_range'] as FlowKind[]);
      const flow = resolveFlow(body.flow as FlowKind, allowed);
      if (!flow) {
        set.status = 400;
        return { error: 'flow_not_allowed' };
      }
      const intake = await startIntake({
        slug: body.slug,
        flow,
        applicant: body.applicant,
        productId: body.productId,
        amount: body.amount,
        purpose: body.purpose,
        modules: body.modules as ModuleName[] | undefined,
      });
      set.status = 201;
      return intake;
    },
    {
      body: t.Object({
        slug: t.String(),
        flow: t.String(),
        applicant: t.Object({
          fullName: t.String({ minLength: 2 }),
          email: t.String({ format: 'email' }),
          phone: t.Optional(t.String()),
        }),
        productId: t.Optional(t.String()),
        amount: t.Optional(t.Number()),
        purpose: t.Optional(t.String()),
        modules: t.Optional(t.Array(t.String())),
      }),
    },
  )
  // Poll an intake (enrichment + computed rate).
  .get(
    '/intake/:id',
    ({ params, set }) => {
      const intake = getIntake(params.id);
      if (!intake) {
        set.status = 404;
        return { error: 'unknown_intake' };
      }
      return intake;
    },
    { params: t.Object({ id: t.String() }) },
  )
  // Rate flows: choose a term, recompute the offered rate + DTI.
  .post(
    '/intake/:id/term',
    ({ params, body, set }) => {
      const intake = chooseTerm(params.id, body.termMonths);
      if (!intake) {
        set.status = 404;
        return { error: 'unknown_intake' };
      }
      return intake;
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ termMonths: t.Number() }),
    },
  )
  // Reach the flow terminal (route to LO, lock the range, or submit for decision).
  .post(
    '/intake/:id/submit',
    ({ params, set }) => {
      const result = submitIntake(params.id);
      if (!result) {
        set.status = 404;
        return { error: 'unknown_intake' };
      }
      return result;
    },
    { params: t.Object({ id: t.String() }) },
  );
