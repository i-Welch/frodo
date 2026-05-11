Recertification Check — One-time setup

The scheduled recertification check runs as a GitHub Action
(`.github/workflows/recertification-check.yml`) that authenticates to AWS
via OIDC, scans the production DynamoDB table, and emails
isaac@reportraven.tech via SES when any tenant is overdue or expiring
within 30 days.

This document is the one-time setup checklist.

---

1. GitHub Actions OIDC trust to AWS

If the existing `AWS_DEPLOY_ROLE_ARN` OIDC provider already exists in
your AWS account (`token.actions.githubusercontent.com`), skip to step 2.
Otherwise: create the OIDC identity provider in IAM following
https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services.

2. Create a narrow IAM role for the recertification check

Trust policy — allow only this workflow on this repo and branch:

```
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<ACCOUNT>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:i-Welch/frodo:*" }
    }
  }]
}
```

Permissions policy — read-only DynamoDB + send-from one SES identity to
one recipient:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:Scan", "dynamodb:GetItem"],
      "Resource": "arn:aws:dynamodb:us-east-2:<ACCOUNT>:table/<PRODUCTION_TABLE>"
    },
    {
      "Effect": "Allow",
      "Action": "ses:SendEmail",
      "Resource": [
        "arn:aws:ses:us-east-2:<ACCOUNT>:identity/noreply@reportraven.tech",
        "arn:aws:ses:us-east-2:<ACCOUNT>:identity/reportraven.tech"
      ],
      "Condition": {
        "StringEquals": { "ses:FromAddress": "noreply@reportraven.tech" },
        "ForAllValues:StringEquals": { "ses:Recipients": ["isaac@reportraven.tech"] }
      }
    }
  ]
}
```

3. SES preconditions

- The `noreply@reportraven.tech` identity (or the `reportraven.tech`
  domain identity) must be verified in SES in `us-east-2`.
- If SES is still in the sandbox, `isaac@reportraven.tech` must be a
  verified recipient. Production SES access removes this restriction.

4. GitHub configuration

Under the `production` environment of this repo, set:

- `AWS_RECERT_ROLE_ARN` (variable) — the ARN of the role created in
  step 2.
- `AWS_REGION` (variable) — `us-east-2`.
- `DYNAMODB_TABLE_PRODUCTION` (variable) — the production table name
  (whatever value `DYNAMODB_TABLE` takes in your production deploy).

No secrets are required — OIDC eliminates the long-lived access-key
problem.

5. Verify

Trigger the workflow manually from the Actions tab
(`Recertification Check` → `Run workflow`). The run should:

- Succeed if no tenant is overdue or expiring within 30 days.
- Send a single email to isaac@reportraven.tech and exit non-zero if any
  tenant is overdue. (Expiring-soon also triggers an email but exits 0.)

The workflow is scheduled daily at 13:00 UTC (9 AM ET).
