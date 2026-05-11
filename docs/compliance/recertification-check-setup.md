Recertification Check — One-time setup

The scheduled recertification check runs as a GitHub Action
(`.github/workflows/recertification-check.yml`) that authenticates to
AWS using the same OIDC role as the deploy workflow
(`AWS_DEPLOY_ROLE_ARN`), scans the production DynamoDB table, and
emails isaac@reportraven.tech via SES when any tenant is overdue or
expiring within 30 days.

Because it reuses the deploy role, there is no new IAM role or trust
policy to create.

---

1. Confirm the deploy role can read DynamoDB and send SES email

The role referenced by `AWS_DEPLOY_ROLE_ARN` must have:

- `dynamodb:Scan` and `dynamodb:GetItem` on the production tenants
  table, and
- `ses:SendEmail` from `noreply@reportraven.tech` to
  `isaac@reportraven.tech`.

The production application already exercises both of these
permissions (Dynamo for every API request; SES for OTP delivery), so
in nearly all cases this is already true. If the deploy role was
locked down to deploy-only actions, attach the additional permissions
to it.

2. SES preconditions

- The `noreply@reportraven.tech` identity (or the `reportraven.tech`
  domain identity) must be verified in SES in the configured region.
- If SES is still in the sandbox, `isaac@reportraven.tech` must be a
  verified recipient. Production SES access removes this restriction.

3. GitHub configuration

Under the `production` environment of this repo, confirm or set:

- `AWS_DEPLOY_ROLE_ARN` (variable) — already configured for the
  deploy workflow.
- `AWS_REGION` (variable) — already configured for the deploy
  workflow.
- `DYNAMODB_TABLE_PRODUCTION` (variable) — the production table name
  (whatever value `DYNAMODB_TABLE` takes in the production deploy).
  This is the only new variable the recert workflow needs.

No secrets are required — OIDC eliminates the long-lived access-key
problem.

4. Verify

Trigger the workflow manually from the Actions tab
(`Recertification Check` → `Run workflow`). The run should:

- Succeed if no tenant is overdue or expiring within 30 days.
- Send a single email to isaac@reportraven.tech and exit non-zero if
  any tenant is overdue. (Expiring-soon also triggers an email but
  exits 0.)

The workflow is scheduled daily at 13:00 UTC (9 AM ET).
