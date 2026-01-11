# Setup for Private Notes Vault (backend)

This document collects steps required to ensure your backend is configured correctly with Supabase so notes are stored in the database and are private to each user.

## 1) Environment variables

Create a `.env` file (already present in the repo for convenience, but ensure this is set in your runtime environment) with these variables:

- SUPABASE_URL: your Supabase project URL (e.g., https://xyz.supabase.co)
- SUPABASE*SERVICE_ROLE_KEY: **the service role key** (starts with `service_role*`) — you must NOT commit this value to source control.

Where to find the service role key in Supabase:

1. Go to your Supabase project dashboard
2. Open **Settings** → **API**
3. Under **Config**, copy the **Service key** (it starts with `service_role_`)

Example (do NOT commit):

```
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_XXXXXXXXXXXX
ENABLE_DEBUG_ROUTES=true
```

If you don't see a `service_role_` key in the dashboard, you may not have appropriate project permissions — log in as the project owner or an admin role that can view keys.
`ENABLE_DEBUG_ROUTES=true` enables a small diagnostic route at `/api/debug/supabase-status`.

## 2) OAuth redirect URL

Add your app origin as an OAuth redirect URL in the Supabase project settings. Common values:

- http://localhost:5173/
- http://localhost:3000/
- https://your-deployed-url/

If redirect URL is missing, Google OAuth may not return to your app after authentication.

## 3) Initialize the database (notes table + RLS policies)

Use the SQL file `db/init.sql` (in this repo) in the Supabase SQL editor or with `psql` and a service role key to create the `notes` table and Row Level Security policies that ensure users can only access their own notes.

Open the SQL editor in the Supabase dashboard and paste the contents of `db/init.sql`.

## 4) Verify connection

When `ENABLE_DEBUG_ROUTES=true` is set, you can GET `/api/debug/supabase-status` which will return JSON like:

```
{
  "configured": true,
  "serviceRole": true,
  "canQueryNotes": true,
  "error": null
}
```

If `serviceRole` is `false`, make sure `SUPABASE_SERVICE_ROLE_KEY` is set to your actual service role key.

## 5) Security notes

- The service role key must be kept secret — never include it in frontend code.
- Row Level Security is enforced in the DB to provide strong guarantees that users only access their own rows.

---

## 6) Deploying to Vercel ✅

This project is now Vercel-ready. I added an `api/index.js` serverless wrapper and a `vercel.json` that routes all traffic to the single serverless handler so your existing Express app will work without major rewrites.

Quick deploy steps:

1. Install dependencies locally (if you haven't already):

   ```bash
   npm install
   ```

2. Commit and push your branch to the repository connected to Vercel (or use `vercel` CLI to deploy directly).

3. In the Vercel dashboard for your project, add the required environment variables (do NOT commit these to source control):

   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (service role key — keep it secret)
   - `ENABLE_DEBUG_ROUTES=true` (optional)

   Use separate environments (Preview / Production) for different values.

4. Deploy via Git integration or `vercel` CLI. The `api/index.js` function will be used as a serverless handler for all routes.

Notes:

- Configure environment variables in the Vercel dashboard (Project Settings → Environment Variables).
- Do not put secrets in `vercel.json` or in your repo — always use the dashboard or `vercel env`.

### Future considerations & gotchas ⚠️

- Cold starts & limits: serverless functions have cold starts and execution limits (the `vercel.json` sets a 10s timeout and 1024MB memory for the handler). If you need long-running processes, move them to an external service (e.g., a container, Cloud Run, or scheduled jobs on a platform that supports longer runtimes).

- Connection pooling: Don't keep long-lived connections or in-memory state between invocations; rely on Supabase's HTTP calls (the `@supabase/supabase-js` client is friendly for serverless). For DB drivers that need pooling, use an external pool service or configure pooling in the provider.

- Scaling & performance: If traffic grows, consider splitting routes into smaller functions (one per major route) or migrating to a persistent server (e.g., container on Azure/GCP/AWS) for lower latency and connection pooling.

- Environment separation: Use Vercel's Preview/Production environment variables and strong secrets management. Rotate service role keys regularly.

- Observability: Add logging and Sentry/monitoring early so you can track runtime errors in production.

---

If you want, I can run a quick check and add an endpoint to explicitly initialize a user's profile and default note on first login. Would you like that?
