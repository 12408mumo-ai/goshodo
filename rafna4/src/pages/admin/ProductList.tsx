import { useCallback, useEffect, useState } from "react";
import { AlertCircle, PackageOpen, RefreshCw, Trash2 } from "lucide-react";
import ProductImage from "../../components/ProductImage";
import { getProducts, PRODUCTS_CHANGED_EVENT } from "../../lib/products";
import { formatDate, formatKES } from "../../lib/format";
import type { Product } from "../../lib/types";

interface ProductListProps {
  onRequestDelete: (product: Product) => void;
}

export default function ProductList({ onRequestDelete }: ProductListProps) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProducts(await getProducts());
    } catch (err) {
      setProducts([]);
      setError(
        err instanceof Error ? err.message : "Products could not be loaded.",
      );
    }
  }, []);

  useEffect(() => {
    void load();
    const handler = () => void load();
    window.addEventListener(PRODUCTS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(PRODUCTS_CHANGED_EVENT, handler);
  }, [load]);

  return (
    <section aria-labelledby="current-products-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            id="current-products-heading"
            className="font-display text-2xl font-semibold text-espresso-900"
          >
            Current Products
          </h2>
          <p className="mt-1 text-xs text-espresso-400">
            {products === null
              ? "Loading…"
              : `${products.length} item${products.length === 1 ? "" : "s"} live on the shop`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          aria-label="Refresh product list"
          className="grid h-10 w-10 place-items-center rounded-full border border-espresso-900/15 bg-white text-espresso-600 transition-colors hover:border-espresso-900/40 hover:text-espresso-900"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-6">
        {error ? (
          <div className="rounded-2xl border border-clay-600/25 bg-white p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-clay-600" aria-hidden />
            <p className="mt-3 text-sm text-espresso-500">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-full bg-espresso-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50"
            >
              Retry
            </button>
          </div>
        ) : products === null ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-espresso-900/10 bg-white"
              >
                <div className="h-40 bg-cream-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-cream-200" />
                  <div className="h-3 w-1/2 rounded bg-cream-200" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-espresso-900/10 bg-white p-10 text-center">
            <PackageOpen
              className="mx-auto h-9 w-9 text-gold-600"
              aria-hidden
            />
            <p className="mt-3 font-display text-xl font-semibold text-espresso-900">
              No products yet
            </p>
            <p className="mt-1 text-sm text-espresso-500">
              Add your first product using the form — it goes live instantly.
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {products.map((product) => (
              <li
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-espresso-900/10 bg-white shadow-card"
              >
                <div className="relative h-40 overflow-hidden bg-cream-100">
                  <ProductImage
                    product={product}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-cream-50/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-espresso-700 shadow-sm">
                    {product.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-espresso-900">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-espresso-300">
                    Added {formatDate(product.created_at)}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-espresso-900/10 pt-3">
                    <span className="font-display text-lg font-semibold text-espresso-900">
                      {formatKES(product.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRequestDelete(product)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-clay-600/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-clay-600 transition-colors hover:bg-clay-600 hover:text-cream-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
