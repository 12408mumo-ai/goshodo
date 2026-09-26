/**
 * Central configuration. Only non-secret, browser-safe values live here —
 * the Supabase anon key is public by design; all privileged access is
 * enforced server-side by Row Level Security (see supabase/schema.sql).
 * The service-role key must NEVER be used in this app.
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as
  | string
  | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

/** Admin identity (a Supabase Auth user). The password is never stored here. */
export const ADMIN_EMAIL = (
  (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ??
  "rafnainvestment@gmail.com"
).trim();

/** True when the app should talk to the live Supabase backend. */
export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

export const WHATSAPP_NUMBER = "254710565055";
export const DISPLAY_PHONE = "0710 565 055";
export const TEL_LINK = "tel:+254710565055";
export const BUSINESS_EMAIL = "rafnainvestment@gmail.com";
export const BUSINESS_LOCATION = "Kamkunji, Nairobi";
