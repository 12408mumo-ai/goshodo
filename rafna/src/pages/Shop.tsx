import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';
import { CATEGORIES, type Product } from '../lib/config';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([...CATEGORIES]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCategoryNames(data.map((c: { name: string }) => c.name));
      }
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const setCategory = (cat: string) => {
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const filters = [
    'All',
    ...Array.from(new Set([...categoryNames, ...products.map((p) => p.category)])),
  ];

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div>
      {/* Page header */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brass">The Collection</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-5xl">
              Shop Rafna Investment
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-espresso/55 sm:text-base">
              Orthopaedic mattresses, premium beddings and quality households. Free delivery within
              Nairobi &amp; surroundings — pay on delivery available.
            </p>
          </motion.div>

          {/* Category filters */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            {filters.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-5 py-2.5 text-[13px] font-semibold tracking-wide transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-espresso text-cream shadow-md'
                    : 'border border-line bg-ivory text-espresso/65 hover:border-brass hover:text-brass'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-line bg-white">
                <div className="aspect-[4/3] bg-sand" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 rounded bg-sand" />
                  <div className="h-3 w-full rounded bg-sand" />
                  <div className="h-10 w-full rounded-xl bg-sand" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-5 rounded-xl bg-espresso px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brass"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-line bg-white p-12 text-center">
            <PackageOpen size={40} className="text-espresso/25" />
            <h3 className="mt-4 font-display text-lg font-semibold text-espresso">No products here yet</h3>
            <p className="mt-2 text-sm text-espresso/55">
              New arrivals are on the way. Check back soon or browse another category.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-espresso/50">
              Showing <strong className="text-espresso">{filtered.length}</strong>{' '}
              {filtered.length === 1 ? 'product' : 'products'}
              {activeCategory !== 'All' && (
                <>
                  {' '}in <strong className="text-brass">{activeCategory}</strong>
                </>
              )}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} onOrder={setOrderProduct} index={i} />
              ))}
            </div>
          </>
        )}
      </section>

      <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
    </div>
  );
}
