import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Browser Supabase client (anon key only — safe to ship).
 * All privileged reads/writes are authorized server-side by Postgres RLS
 * using the signed JWT Supabase Auth issues after admin sign-in.
 * Returns null when Supabase env vars are absent (demo mode).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true, // keeps the short-lived JWT fresh safely
        detectSessionInUrl: false,
      },
    })
  : null;
