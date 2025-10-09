# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts all Next.js routes and API handlers; co-locate data fetching with the route that renders it.
- `components/` stores reusable UI pieces (PascalCase filenames) and should stay presentation-focused.
- `lib/` contains cross-cutting helpers such as `lib/db.ts`; add new utilities by domain.
- `db/` tracks the canonical schema and Fly-specific helpers; update it whenever models change.
- `public/` serves static assets, while `notes/` records working plans—sync both with the shipped behaviour.

## Build, Test, and Development Commands
- `npm install` sets up dependencies.
- `npm run dev` boots the dev server on `http://localhost:3000` with hot reload.
- `npm run build` compiles the production bundle; run before deploying or committing large changes.
- `npm run start` verifies the production build locally.
- `npm run lint` runs `next lint`; fix warnings prior to review.
- `flyctl deploy` ships the container, and `apply_schema_fly.sh` applies the latest schema to Fly Postgres.

## Coding Style & Naming Conventions
- Write modern TypeScript, prefer async/await, and keep server-only code inside server components or route handlers.
- Match the existing 2-space indentation and no-semicolon formatting enforced by the default Next.js tooling.
- Components use PascalCase, hooks start with `use`, and route handler files mirror the URL segment they serve.
- Rely on Tailwind utility classes from `app/globals.css` before introducing custom CSS.

## Testing Guidelines
- Automated tests are not yet wired up; when adding them, place files beside the feature (`component.test.tsx`, `route.spec.ts`).
- Always run `npm run lint` and exercise critical flows using the curl examples in `notes/development_flow.md`.
- Record manual verification steps or sample payloads in the PR description so reviewers can replay them quickly.

## Commit & Pull Request Guidelines
- Use concise, imperative commit subjects ("Add promise status filter"), optionally prefixed with a Conventional Commit type.
- Squash noisy work-in-progress commits before requesting review.
- PRs must outline the change, reference the issue (if any), call out schema or env updates, and attach UI screenshots for visual tweaks.
- Note required secrets such as `DATABASE_URL` whenever they affect setup.

## Database & Environment Tips
- Configure `DATABASE_URL` locally and through `flyctl secrets`; never commit `.env` files.
- Apply schema updates with `psql $DATABASE_URL < db/schema.sql` so local, staging, and production stay aligned.
- Extend the types in `lib/db.ts` alongside schema changes to keep the API strongly typed end-to-end.
