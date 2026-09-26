import { supabase } from "./supabase";
import { ADMIN_EMAIL, isSupabaseConfigured } from "./env";

/**
 * Admin authentication
 * ────────────────────
 * PRODUCTION (Supabase configured): the password is verified server-side by
 * Supabase Auth, which issues a short-lived signed JWT with automatic
 * refresh. Every insert/delete is then re-authorized by Postgres Row Level
 * Security — the browser never holds a privileged secret. Supabase Auth also
 * applies its own server-side rate limiting.
 *
 * DEMO (no Supabase env vars): for local preview only, the password is
 * compared as a SHA-256 hash (never stored in plaintext) and a 2-hour
 * sessionStorage flag is set. This fallback is obviously bypassable by a
 * determined user, which is why it only unlocks browser-local storage —
 * connect Supabase for the real, RLS-enforced console.
 */

// SHA-256 hex of the initial admin password "Rafna2026!" (demo mode only).
const DEMO_PASSWORD_HASH =
  "183e3798f09f2daa0ea0202d7adcb1d20323486d520191bb2a64919053813a7d";

const THROTTLE_KEY = "rafna_admin_throttle_v1";
const DEMO_SESSION_KEY = "rafna_admin_session_v1";
const DEMO_SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60 * 1000; // 60s lockout after MAX_ATTEMPTS failures

interface ThrottleState {
  fails: number;
  lockedUntil: number;
}

function readThrottle(): ThrottleState {
  try {
    const raw = localStorage.getItem(THROTTLE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ThrottleState>;
      return {
        fails: Number(parsed.fails) || 0,
        lockedUntil: Number(parsed.lockedUntil) || 0,
      };
    }
  } catch {
    /* storage unavailable — ignore */
  }
  return { fails: 0, lockedUntil: 0 };
}

function writeThrottle(state: ThrottleState): void {
  try {
    localStorage.setItem(THROTTLE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function getLockSecondsRemaining(): number {
  return Math.max(
    0,
    Math.ceil((readThrottle().lockedUntil - Date.now()) / 1000),
  );
}

function recordFailedAttempt(): void {
  const state = readThrottle();
  const fails = state.fails + 1;
  writeThrottle({
    fails: fails >= MAX_ATTEMPTS ? 0 : fails,
    lockedUntil: fails >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0,
  });
}

function clearAttempts(): void {
  writeThrottle({ fails: 0, lockedUntil: 0 });
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface SignInResult {
  ok: boolean;
  error?: string;
}

export async function adminSignIn(password: string): Promise<SignInResult> {
  // Client-side lockout is defense-in-depth; Supabase rate-limits server-side.
  if (getLockSecondsRemaining() > 0) {
    return {
      ok: false,
      error: "Too many failed attempts. Please wait a minute and try again.",
    };
  }
  if (!password) {
    return { ok: false, error: "Please enter the admin password." };
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL.toLowerCase(),
      password,
    });
    if (error) {
      recordFailedAttempt();
      // Generic message — never reveal whether the account exists.
      return { ok: false, error: "Incorrect password. Please try again." };
    }
    clearAttempts();
    return { ok: true };
  }

  // Demo fallback: hash comparison, short-lived session flag.
  const hash = await sha256Hex(password);
  if (hash === DEMO_PASSWORD_HASH) {
    clearAttempts();
    try {
      sessionStorage.setItem(
        DEMO_SESSION_KEY,
        JSON.stringify({ exp: Date.now() + DEMO_SESSION_TTL_MS }),
      );
    } catch {
      /* ignore */
    }
    return { ok: true };
  }
  recordFailedAttempt();
  return { ok: false, error: "Incorrect password. Please try again." };
}

export async function adminSignOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  try {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * True only when a verified admin session exists.
 * Under Supabase this round-trips the server (getUser verifies the JWT).
 */
export async function getAdminSession(): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.getUser();
    const email = data.user?.email?.toLowerCase();
    return (
      !error && Boolean(data.user) && email === ADMIN_EMAIL.toLowerCase()
    );
  }
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return false;
    return Number((JSON.parse(raw) as { exp?: number }).exp) > Date.now();
  } catch {
    return false;
  }
}

export async function getAdminEmail(): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.email ?? null;
  }
  return (await getAdminSession()) ? "Demo admin (browser session)" : null;
}

/** Extra guard executed immediately before every privileged write. */
export async function requireFreshAdminSession(): Promise<void> {
  if (!(await getAdminSession())) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }
}
