# CI/CD Improvement Plan

## Source Control
- Require pull requests into `main` and keep the branch releasable.
- Prefer a linear history (squash merges) so release tags map cleanly to deployments.

## Continuous Integration
- Add `.github/workflows/ci.yml` running on push/pull requests; cache npm, run `npm run lint` and `npm run build`.
- Parameterise workflow with Node 18/20 matrix to catch version drift.
- Provide environment secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.) so integration tests can target Supabase or a Postgres container.
- Publish build artifacts for reuse by deploy jobs.

## Deployment Automation
- Staging deploy: trigger on merges to `main`, run migrations, then deploy (Fly or Supabase hosting). Gate with manual approval via environment protection.
- Production deploy: trigger on release tags; reuse build artifacts, apply migrations, run health checks, then release. Require reviewers before execution.
- Store platform tokens (Fly API, Supabase service role) as GitHub environment secrets tied to staging/production.

## Database Migrations
- Adopt a migration tool (Drizzle, Prisma, or Supabase SQL migrations) with files committed under `db/migrations/`.
- CI should run migrations against an ephemeral database to guarantee forward-only changes.
- Deployment workflow applies migrations before rolling out the app; document rollback strategy using Supabase PITR snapshots or migration reversals.

## Observability
- Post-deploy smoke tests (e.g., curl `/api/healthz`).
- Forward Supabase or Fly logs to a shared sink (Logflare, Datadog) and surface alerts in Slack.

## Release Management
- Tag every production deploy and capture the migration version applied.
- Maintain a rollback playbook covering redeploying previous tags and database restoration options.
- Update `notes/development_flow.md` once automation is live so the team follows the same process.
