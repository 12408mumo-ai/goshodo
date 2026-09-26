import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Logo from "../../components/Logo";
import {
  adminSignIn,
  getAdminSession,
  getLockSecondsRemaining,
} from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/env";
import { useTitle } from "../../lib/useTitle";

export default function AdminLogin() {
  useTitle("Admin Sign In — Rafna Investment");
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/admin";

  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(getLockSecondsRemaining());

  // Already signed in? Go straight to the console.
  useEffect(() => {
    let active = true;
    void getAdminSession().then((ok) => {
      if (!active) return;
      if (ok) navigate("/admin", { replace: true });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  // Live lockout countdown
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = setTimeout(
      () => setLockSeconds(getLockSecondsRemaining()),
      1000,
    );
    return () => clearTimeout(timer);
  }, [lockSeconds]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const remaining = getLockSecondsRemaining();
    if (remaining > 0) {
      setLockSeconds(remaining);
      setError(
        `Too many failed attempts. Please try again in ${remaining}s.`,
      );
      return;
    }
    setBusy(true);
    setError(null);
    const result = await adminSignIn(password);
    setBusy(false);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error ?? "Incorrect password. Please try again.");
      setLockSeconds(getLockSecondsRemaining());
      setPassword("");
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100">
        <Loader2
          className="h-7 w-7 animate-spin text-gold-600"
          aria-label="Checking session"
        />
      </div>
    );
  }

  const locked = lockSeconds > 0;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — logo doubles as the way back to the site */}
      <div className="relative hidden lg:block">
        <img
          src="/images/hero.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-forest-900/72"
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" aria-label="Back to the Rafna Investment website">
            <Logo dark />
          </Link>
          <div>
            <p className="font-display text-4xl font-semibold leading-snug text-cream-50">
              “Quality sleep and beautiful homes —
              <em className="text-gold-300"> managed beautifully.</em>”
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cream-100/60">
              <ShieldCheck className="h-4 w-4 text-gold-300" aria-hidden />
              Server-verified admin access
            </p>
          </div>
        </div>
      </div>

      {/* Sign-in form */}
      <div className="flex items-center justify-center bg-cream-100 bg-weave px-4 py-14 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-espresso-900/10 bg-cream-50 p-8 shadow-lift sm:p-10">
            <Link
              to="/"
              aria-label="Back to the Rafna Investment website"
              className="inline-block lg:hidden"
            >
              <Logo />
            </Link>

            <div className="mt-6 lg:mt-0">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-800 text-gold-300">
                <Lock className="h-5 w-5" aria-hidden />
              </span>
              <h1 className="mt-5 font-display text-3xl font-semibold text-espresso-900">
                Admin Console
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-espresso-500">
                Sign in to add products, upload photos and manage the live
                shop.
              </p>
            </div>

            {!isSupabaseConfigured && (
              <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-gold-500/40 bg-gold-100/60 px-4 py-3 text-xs leading-relaxed text-gold-700">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Demo mode — connect Supabase environment variables to enable
                production-grade, server-verified authentication.
              </p>
            )}

            <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
              <div>
                <label
                  htmlFor="admin-password"
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-espresso-600"
                >
                  Admin Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="admin-password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    disabled={locked}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "admin-login-error" : undefined}
                    className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-12 text-sm text-espresso-900 placeholder-espresso-300 transition-colors focus:border-gold-500 focus:outline-none disabled:opacity-60 ${
                      error ? "border-clay-600" : "border-espresso-900/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-espresso-400 transition-colors hover:text-espresso-800"
                  >
                    {show ? (
                      <EyeOff className="h-4.5 w-4.5" aria-hidden />
                    ) : (
                      <Eye className="h-4.5 w-4.5" aria-hidden />
                    )}
                  </button>
                </div>
                {error && (
                  <p
                    id="admin-login-error"
                    role="alert"
                    className="mt-2 text-xs font-medium text-clay-600"
                  >
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={busy || locked}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso-900 px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-cream-50 transition-colors hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Verifying…
                  </>
                ) : locked ? (
                  `Locked · ${lockSeconds}s`
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <Link
              to="/"
              className="mt-7 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-espresso-400 transition-colors hover:text-espresso-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back to website
            </Link>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-espresso-400">
            Access is monitored and rate-limited. Sessions expire
            automatically.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
