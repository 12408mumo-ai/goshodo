import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cloud,
  HardDrive,
  Loader2,
  LogOut,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Logo from "../../components/Logo";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import CategoriesManager from "./CategoriesManager";
import { Toast, type ToastData } from "./Toast";
import { adminSignOut, getAdminEmail } from "../../lib/auth";
import { deleteProduct } from "../../lib/products";
import { isSupabaseConfigured } from "../../lib/env";
import { useTitle } from "../../lib/useTitle";
import type { Product } from "../../lib/types";

export default function AdminDashboard() {
  useTitle("Admin Console — Rafna Investment");
  const navigate = useNavigate();

  const [email, setEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void getAdminEmail().then(setEmail);
  }, []);

  // Auto-dismiss toasts
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5200);
    return () => clearTimeout(timer);
  }, [toast]);

  const signOut = async () => {
    await adminSignOut();
    navigate("/admin/login", { replace: true });
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteProduct(pendingDelete.id);
      setToast({
        type: "success",
        text: `“${pendingDelete.title}” was permanently deleted.`,
      });
    } catch (err) {
      setToast({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "The product could not be deleted. Please try again.",
      });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 bg-weave">
      {/* Admin top bar — logo links back to the public site */}
      <header className="sticky top-0 z-40 border-b border-espresso-900/10 bg-cream-50/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            title="Back to the website"
            aria-label="Back to the Rafna Investment website"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span
              className={`hidden items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] sm:inline-flex ${
                isSupabaseConfigured
                  ? "border-forest-500/40 bg-forest-100 text-forest-700"
                  : "border-gold-500/40 bg-gold-100 text-gold-700"
              }`}
            >
              {isSupabaseConfigured ? (
                <>
                  <Cloud className="h-3.5 w-3.5" aria-hidden /> Live database
                </>
              ) : (
                <>
                  <HardDrive className="h-3.5 w-3.5" aria-hidden /> Demo
                  storage
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-full border border-espresso-900/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-espresso-900 transition-colors hover:bg-espresso-900 hover:text-cream-50"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-600">
              Rafna Investment
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-espresso-900">
              Product Manager
            </h1>
            {email && (
              <p className="mt-2 text-sm text-espresso-400">
                Signed in as{" "}
                <span className="font-medium text-espresso-600">{email}</span>
              </p>
            )}
          </div>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-6 flex items-start gap-2.5 rounded-2xl border border-gold-500/40 bg-gold-100/60 px-5 py-4 text-sm leading-relaxed text-gold-700">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <span>
              <strong className="font-semibold">Demo mode.</strong> Supabase
              is not configured, so uploads and products are stored in this
              browser only. Set{" "}
              <code className="rounded bg-cream-50 px-1.5 py-0.5 text-xs">
                VITE_SUPABASE_URL
              </code>
              ,{" "}
              <code className="rounded bg-cream-50 px-1.5 py-0.5 text-xs">
                VITE_SUPABASE_ANON_KEY
              </code>{" "}
              and{" "}
              <code className="rounded bg-cream-50 px-1.5 py-0.5 text-xs">
                VITE_ADMIN_EMAIL
              </code>{" "}
              to enable the live database, storage and server-verified admin
              sign-in.
            </span>
          </p>
        )}

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-8">
            <ProductForm
              onSaved={(text) => setToast({ type: "success", text })}
              onError={(text) => setToast({ type: "error", text })}
            />
            <CategoriesManager
              onToast={(toast) => setToast(toast)}
            />
          </div>
          <ProductList onRequestDelete={setPendingDelete} />
        </div>
      </main>

      {/* Destructive-action confirmation */}
      <AnimatePresence>
        {pendingDelete && (
          <div
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm product deletion"
          >
            <motion.button
              type="button"
              aria-label="Cancel deletion"
              className="absolute inset-0 cursor-default bg-espresso-950/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setPendingDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md rounded-3xl bg-cream-50 p-8 text-center shadow-lift"
            >
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-clay-100 text-clay-600">
                <Trash2 className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-espresso-900">
                Delete this product?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-espresso-500">
                <span className="font-semibold text-espresso-800">
                  “{pendingDelete.title}”
                </span>{" "}
                will be permanently removed from the live shop
                {isSupabaseConfigured
                  ? ", and its photo removed from storage"
                  : ""}
                . This cannot be undone.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setPendingDelete(null)}
                  className="rounded-full border border-espresso-900/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-espresso-700 transition-colors hover:border-espresso-900/50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void confirmDelete()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-clay-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cream-50 transition-colors hover:bg-espresso-900 disabled:opacity-60"
                >
                  {deleting && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  )}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast toast={toast} />
    </div>
  );
}
