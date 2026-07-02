/**
 * backend/src/lib/supabase.js
 *
 * Supabase client using SERVICE_ROLE_KEY (full DB access — server-side only).
 * Never expose the service role key to the browser.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error(
    "[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables."
  );
}

export const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log("[supabase] Client initialized with service role key ✓");
