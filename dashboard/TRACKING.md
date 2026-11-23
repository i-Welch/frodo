# frodo: lead and product tracking

Production tracking rollout completed 2026-11-11. All required event schemas are applied; the Vercel release is READY.

See the [portfolio rollout runbook](../../portfolio-stats/tracking/ROLLOUT.md) for coverage, data handling, test exclusions, migration order and validation limits. The live baseline and explicit production database mapping are in the adjacent portfolio `RUNBOOK.md`.

New migration(s):

- `migrations/20261111_product_events.sql`

The event ledger is `product_events`. Normal reports require `environment='production' AND NOT is_test`. Keep client interaction attempts separate from server-confirmed business outcomes. Domain records remain the source of truth for leads and product data.

Mark QA with `product_test=1` before browser interactions or `x-product-test: 1` for API requests. Automated browser sessions and explicit test submission markers are classified automatically. Test events remain in the database but are excluded from normal Vercel calls and analysis.

Deployment details and validation: `C:/Users/isaac/projects/portfolio-stats/deployment/DEPLOYMENT_REPORT.md`.
