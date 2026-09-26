import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getAdminSession } from "../lib/auth";
import { supabase } from "../lib/supabase";
import Logo from "./Logo";

/**
 * Route guard for /admin. Unauthenticated visitors are redirected to the
 * login screen. Under Supabase, the check round-trips the server and the
 * guard reacts live to sign-out or token expiry.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"checking" | "authed" | "denied">(
    "checking",
  );
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const ok = await getAdminSession();
      if (active) setState(ok ? "authed" : "denied");
    };
    void verify();
    const sub = supabase?.auth.onAuthStateChange(() => {
      void verify();
    });
    return () => {
      active = false;
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream-100">
        <Logo />
        <Loader2
          className="h-6 w-6 animate-spin text-gold-600"
          aria-label="Verifying session"
        />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
}
