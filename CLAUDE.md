# CLAUDE.md

## Rules

### No URL-encoded form submissions

Never use `application/x-www-form-urlencoded` for form submissions in this project. All form data must be submitted as `application/json`. This applies to both server-rendered HTML forms (use HTMX `hx-ext="json-enc"`) and the Frodo Collect client library. Form data contains sensitive PII (SSNs, names, addresses, financial data) that must not appear in URL-encoded format where it can leak into server access logs, browser history, or proxy logs.
