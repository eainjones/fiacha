# Fiacha Codebase Improvement Plan

This document outlines a roadmap to address architectural findings, focusing on database consistency, type safety, and system integration.

## 1. Database Access Consistency
**Current State:** The application mixes usage of the Supabase Client (`@supabase/ssr`) and a direct PostgreSQL connection (`pg` in `lib/db.ts`).
**Goal:** Establish clear boundaries for data access to ensure security (RLS) and maintainability.

### Strategy: "RLS First" for UI, "Direct Access" for Systems
1.  **UI & Client Interactions (The "App"):**
    *   **Tool:** Supabase Client (`@supabase/ssr`).
    *   **Why:** Automatically handles Authentication and Row Level Security (RLS). Ensures users only see what they are allowed to see.
    *   **Usage:** Client Components, Server Components (fetching user data), and API Routes acting on behalf of a user.

2.  **System, Admin & Background Jobs:**
    *   **Tool:** Direct Postgres (`pg`) OR Supabase Admin Client (`supabase-js` with Service Key).
    *   **Why:** Bypasses RLS for maintenance tasks, heavy data aggregation, or crawler ingestion where no user session exists.
    *   **Usage:** `crawler/` scripts, `scripts/` maintenance tools, and specific Admin API endpoints.

### Action Plan
- [ ] **Rename/Refactor `lib/db.ts`:** Rename `getDb` to `getSystemDb` or `getAdminDb` to explicitly indicate that this connection bypasses standard security rules.
- [ ] **Audit:** Review all `app/` routes. If a standard user route uses `getDb`, refactor it to use the Supabase client to leverage RLS.

## 2. End-to-End Type Safety
**Current State:** Types (`Politician`, `Promise`) are manually defined in `lib/db.ts`. This creates a risk of drift between the database schema and the application code.
**Goal:** Automate type generation from the live database schema.

### Action Plan
1.  **Generate Types:** Use the Supabase CLI to generate TypeScript definitions.
    ```bash
    npx supabase gen types typescript --project-id "your-project-id" --schema public > lib/database.types.ts
    ```
2.  **Add Script:** Add a convenience script to `package.json`:
    ```json
    "types:update": "npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > lib/database.types.ts"
    ```
3.  **Refactor Code:** Replace manual interfaces in `lib/db.ts` with the generated types:
    ```typescript
    import { Database } from './database.types'
    
    // Example: specific row type
    export type Politician = Database['public']['Tables']['politicians']['Row']
    ```

## 3. Crawler Integration
**Current State:** The `crawler/` directory operates as a semi-independent silo.
**Goal:** Tightly integrate the crawler with the main application's data structures.

### Action Plan
- [ ] **Shared Types:** Once Step 2 is complete, ensure the `crawler` can import the same `database.types.ts` (or symlink it) so the scraper knows exactly what shape the database expects.
- [ ] **Unified Config:** Ensure the crawler uses the same `DATABASE_URL` logic as `lib/db.ts`. Consider exporting the connection logic from `lib/db.ts` into a shared utility package or file if the crawler moves to a separate repo, or simply import it if they stay together.

## 4. Environment Management
**Current State:** Multiple `.env` files (`.env.vercel-prod`, `.env.example`, etc.) exist, increasing the risk of configuration drift.
**Goal:** Enforce configuration presence at build time.

### Action Plan
- [ ] **Validation Schema:** Create a `lib/env.ts` file using `zod` (or manual checks) to validate environment variables on startup.
    ```typescript
    // lib/env.ts
    const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'DATABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
    
    requiredEnv.forEach((key) => {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    });
    ```
- [ ] **CI Pipeline:** Update GitHub Actions (`.github/workflows`) to fail early if these variables are missing.
