import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, PackageSearch } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useShop } from '../lib/store';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'title';

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-forest-950/10 bg-white">
      <div className="aspect-[4/3] bg-ivory-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded bg-ivory-200" />
        <div className="h-4 w-1/2 rounded bg-ivory-200" />
        <div className="h-11 rounded-xl bg-ivory-200" />
      </div>
    </div>
  );
}

export default function Shop() {
  const { products, categories, loading, error, refresh } = useShop();
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('category') || 'All';
  const [sort, setSort] = useState<SortKey>('newest');

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const visible = useMemo(() => {
    const list = activeCategory === 'All' ? [...products] : products.filter((p) => p.category === activeCategory);
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'title':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }
    return list;
  }, [products, activeCategory, sort]);

  const setCategory = (name: string) => {
    if (name === 'All') setParams({});
    else setParams({ category: name });
  };

  return (
    <div className="bg-ivory-50">
      <div className="border-b border-forest-950/10 bg-forest-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-300">Rafna Investment</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ivory-50 sm:text-5xl">Shop Our Collection</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-50/70 sm:text-base">
            Orthopaedic mattresses, premium bedding &amp; household essentials. Tap{' '}
            <span className="font-semibold text-gold-300">Order Now</span> on any product to check out instantly via
            WhatsApp — free Nairobi delivery, Pay on Delivery.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('All')}
              className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition ${activeCategory === 'All'
                ? 'bg-forest-950 text-gold-300 shadow-md'
                : 'border border-forest-950/15 bg-white text-forest-950/70 hover:border-forest-950/40'
                }`}
            >
              All ({products.length})
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.category === c.name).length;
              const active = activeCategory === c.name;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.name)}
                  className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition ${active
                    ? 'bg-forest-950 text-gold-300 shadow-md'
                    : 'border border-forest-950/15 bg-white text-forest-950/70 hover:border-forest-950/40'
                    }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-forest-950/60">
            <ArrowUpDown className="h-4 w-4" />
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-forest-950/15 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-forest-950 outline-none focus:border-gold-500"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title">Name A–Z</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-semibold text-red-700">We couldn&apos;t load products: {error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-4 rounded-xl bg-forest-950 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"
            >
              Try Again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-forest-950/10 bg-white p-12 text-center">
            <PackageSearch className="mx-auto h-12 w-12 text-forest-950/30" />
            <h3 className="mt-4 font-display text-2xl font-bold text-forest-950">No products found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-forest-950/60">
              {activeCategory === 'All'
                ? 'Our shelves are being restocked. Please check back shortly.'
                : `Nothing in "${activeCategory}" yet. Browse everything instead.`}
            </p>
            {activeCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setCategory('All')}
                className="mt-5 rounded-xl bg-forest-950 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-forest-950/50">
              Showing {visible.length} {visible.length === 1 ? 'product' : 'products'}
              {activeCategory !== 'All' && ` in ${activeCategory}`}
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </>
        )}

        <div className="mt-12 rounded-2xl bg-forest-950 p-8 text-center sm:p-10">
          <h3 className="font-display text-2xl font-bold text-ivory-50">Can&apos;t find what you need?</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-ivory-50/70">
            We stock much more in-store at Kamkunji. Message us and we&apos;ll source it for you at an honest price.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-xl bg-gold-500 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-forest-950 transition hover:bg-gold-400"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
