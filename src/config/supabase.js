import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Ensure .env is loaded even when this module is imported first (static ESM imports are hoisted)
dotenv.config();

let supabase = null;
let isServiceRole = false;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Detect service role key formats. Supabase can present it either as a 'service_role_*' raw key
  // or as a JWT-like token with role=service_role in its payload.
  isServiceRole = false;
  try {
    if (typeof key === "string") {
      if (key.startsWith("service_role_")) isServiceRole = true;
      else if (key.split(".").length === 3) {
        const payload = JSON.parse(
          Buffer.from(key.split(".")[1], "base64").toString()
        );
        if (payload && (payload.role === "service_role" || payload?.exp))
          isServiceRole = true;
      }
    }
  } catch (e) {
    isServiceRole = false;
  }

  try {
    supabase = createClient(process.env.SUPABASE_URL, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    // Log the creation error to help diagnosis and keep supabase null so callers can fallback
    // eslint-disable-next-line no-console
    console.error(
      "[supabase] createClient failed:",
      err && err.message ? err.message : err
    );
    supabase = null;
  }

  if (!isServiceRole) {
    // Helpful warning for developers — using an anon key here will prevent server-side operations
    // such as inserting rows when RLS is enabled on the database.
    // NOTE: This is only a warning; you must set the actual service role key in your environment.
    // Do NOT commit your service role key to source control.
    // To obtain the key go to your Supabase project -> Settings -> API -> Service key.
    // If you intentionally want to run without a service role (e.g., local dev with in-memory store), ignore this warning.
    // eslint-disable-next-line no-console
    console.warn(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY does not look like a service role key. Server-side DB operations may be blocked by Row Level Security (RLS)."
    );
  }
} else {
  // Supabase not configured — running in local/dev mode
  supabase = null;
}

export default supabase;
export { isServiceRole };
