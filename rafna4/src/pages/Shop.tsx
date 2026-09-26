import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  MessageCircle,
  PackageOpen,
  RefreshCw,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import OrderModal from "../components/OrderModal";
import { Reveal } from "../components/Reveal";
import { getProducts, PRODUCTS_CHANGED_EVENT } from "../lib/products";
import { CATEGORIES_CHANGED_EVENT, getCategories } from "../lib/categories";
import { enquiryWhatsAppUrl } from "../lib/whatsapp";
import { useTitle } from "../lib/useTitle";
import {
  DEFAULT_CATEGORIES,
  type CategoryRecord,
  type Product,
} from "../lib/types";

type Filter = string; // "All" sentinel plus live, backend-managed names

export default function Shop() {
  useTitle("Shop the Collection — Rafna Investment");
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);

  // Category filters render from the live backend list (never hard-coded).
  const categoryNames = categories
    ? categories.map((c) => c.name)
    : DEFAULT_CATEGORIES;
  const raw = params.get("category");
  const active: Filter = raw && categoryNames.includes(raw) ? raw : "All";

  const load = useCallback(async () => {
    setError(null);
    try {
      setProducts(await getProducts());
    } catch (err) {
      setProducts([]);
      setError(
        err instanceof Error
          ? err.message
          : "The collection could not be loaded.",
      );
    }
  }, []);

  useEffect(() => {
    void load();
    const handler = () => void load(); // live updates after admin changes
    window.addEventListener(PRODUCTS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(PRODUCTS_CHANGED_EVENT, handler);
  }, [load]);

  // Load categories once + refresh instantly when the admin edits them
  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const list = await getCategories();
        if (mounted) setCategories(list);
      } catch {
        /* default filter list remains until a refresh succeeds */
      }
    };
    void loadCategories();
    const handler = () => void loadCategories();
    window.addEventListener(CATEGORIES_CHANGED_EVENT, handler);
    return () => {
      mounted = false;
      window.removeEventListener(CATEGORIES_CHANGED_EVENT, handler);
    };
  }, []);

  const selectFilter = (filter: Filter) => {
    setParams(filter === "All" ? {} : { category: filter }, {
      preventScrollReset: true,
    });
  };

  const visible =
    products?.filter(
      (p) => active === "All" || p.category === active,
    ) ?? [];

  const countFor = (filter: Filter) =>
    products?.filter(
      (p) => filter === "All" || p.category === filter,
    ).length;

  return (
    <>
      {/* Page header */}
      <section className="border-b border-espresso-900/10 bg-cream-100 bg-weave">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-600">
              Rafna Investment · Kamkunji
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold text-espresso-900 sm:text-6xl">
              The Collection
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-espresso-500">
              Orthopaedic mattresses, premium beddings and household
              essentials. Every order is confirmed personally on WhatsApp —
              pay on delivery within Nairobi &amp; surroundings.
            </p>
          </Reveal>

          {/* Category filter */}
          <div
            className="mt-10 flex flex-wrap gap-2.5"
            role="tablist"
            aria-label="Filter by category"
          >
            {(["All", ...categoryNames] as Filter[]).map((filter) => {
              const isActive = active === filter;
              const count = countFor(filter);
              return (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectFilter(filter)}
                  className={`rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all ${
                    isActive
                      ? "border-espresso-900 bg-espresso-900 text-cream-50"
                      : "border-espresso-900/20 bg-white/70 text-espresso-600 hover:border-espresso-900/50"
                  }`}
                >
                  {filter}
                  {typeof count === "number" && (
                    <span
                      className={`ml-2 rounded-full px-1.5 text-[10px] ${
                        isActive ? "text-gold-300" : "text-espresso-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {error ? (
          <div className="mx-auto max-w-md rounded-3xl border border-clay-600/25 bg-white p-10 text-center shadow-card">
            <AlertCircle className="mx-auto h-10 w-10 text-clay-600" aria-hidden />
            <h2 className="mt-4 font-display text-2xl font-semibold text-espresso-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-500">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-espresso-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-cream-50 transition-colors hover:bg-gold-600"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </button>
          </div>
        ) : products === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-espresso-900/10 bg-white"
              >
                <div className="aspect-[4/3] bg-cream-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 rounded bg-cream-200" />
                  <div className="h-3 w-full rounded bg-cream-200" />
                  <div className="h-10 w-full rounded-full bg-cream-200" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-espresso-900/10 bg-white p-10 text-center shadow-card">
            <PackageOpen
              className="mx-auto h-10 w-10 text-gold-600"
              aria-hidden
            />
            <h2 className="mt-4 font-display text-2xl font-semibold text-espresso-900">
              Nothing here yet
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso-500">
              This collection is being restocked. Message us on WhatsApp — we
              likely have it in store.
            </p>
            <a
              href={enquiryWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-wa-600 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-wa-500"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Ask on WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product, i) => (
              <Reveal
                key={product.id}
                delay={Math.min(i, 8) * 0.05}
                className="h-full"
              >
                <ProductCard product={product} onOrder={setOrderProduct} />
              </Reveal>
            ))}
          </div>
        )}

        {/* In-store note */}
        <Reveal className="mt-16">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-forest-900 px-8 py-10 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="font-display text-2xl font-semibold text-cream-50">
                Can&apos;t find what you need?
              </h2>
              <p className="mt-1.5 text-sm text-cream-100/70">
                Our Kamkunji shop stocks far more than we list online — ask
                and we&apos;ll confirm availability instantly.
              </p>
            </div>
            <a
              href={enquiryWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-wa-600 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-wa-500"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Message Us
            </a>
          </div>
        </Reveal>
      </section>

      <AnimatePresence>
        {orderProduct && (
          <OrderModal
            product={orderProduct}
            onClose={() => setOrderProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
