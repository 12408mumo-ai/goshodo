import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Globe, HandCoins, ShieldCheck, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';
import { PHONE_DISPLAY, EMAIL, LOCATION, waChatLink, type Product } from '../lib/config';

const promises = [
  {
    icon: Truck,
    title: 'Free Nairobi Delivery',
    text: 'Enjoy free delivery within Nairobi & surroundings on every order.',
  },
  {
    icon: Globe,
    title: 'Country-Wide Delivery',
    text: 'We deliver across Kenya at affordable, transparent prices.',
  },
  {
    icon: HandCoins,
    title: 'Pay on Delivery',
    text: 'Pay when your order arrives — available within Nairobi & surroundings.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    text: 'Premium foam, fiber & spring construction built to last for years.',
  },
];

const categories = [
  {
    name: 'Orthopaedic Mattresses',
    image: '/images/products/spring-mattress.jpg',
    text: 'Foam, fiber & spring mattresses engineered for perfect spinal support.',
  },
  {
    name: 'Beddings',
    image: '/images/products/duvet-set.jpg',
    text: 'Duvets, sheets and pillows with a five-star hotel feel.',
  },
  {
    name: 'Households',
    image: '/images/products/cushions.jpg',
    text: 'Beautiful essentials that elevate every corner of your home.',
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
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
      setError('Could not load featured products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const featured = products.slice(0, 6);

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[560px] overflow-hidden sm:min-h-[640px]">
        <img
          src="/images/hero.jpg"
          alt="Luxury bedroom with premium mattress"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/60 to-espresso/20" />

        <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-4 sm:min-h-[640px] sm:px-6 lg:px-8">
          <div className="max-w-2xl py-20">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-brass-light"
            >
              Kamkunji, Nairobi · Est. Quality
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="mt-5 font-display text-4xl font-semibold leading-[1.08] text-cream sm:text-5xl lg:text-6xl"
            >
              Rest Like Royalty.
              <br />
              <span className="text-brass-light italic">Wake Up Renewed.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg"
            >
              Quality Foam, Fiber &amp; Spring Orthopaedic Mattresses, premium Beddings and
              Households — delivered free within Nairobi, with pay-on-delivery convenience.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.36 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/shop"
                className="flex items-center gap-2.5 rounded-full bg-brass px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-xl shadow-brass/30 transition-all duration-200 hover:bg-brass-dark active:scale-[0.98]"
              >
                Shop the Collection
                <ArrowRight size={17} />
              </Link>
              <a
                href={waChatLink('Hello Rafna Investment! I would like to enquire about your products.')}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-cream/40 px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-cream transition-colors duration-200 hover:border-brass hover:text-brass-light"
              >
                Chat on WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BADGES ============ */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {promises.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-start gap-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brass/12 text-brass">
                <p.icon size={22} strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="font-display text-[15px] font-semibold text-espresso">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-espresso/55">{p.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brass">Curated for Comfort</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-4xl">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1.5 text-sm font-semibold text-brass transition-colors hover:text-brass-dark"
          >
            View all products <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              <Link
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative block overflow-hidden rounded-3xl"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:aspect-[3/4]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl font-semibold text-cream">{cat.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-cream/70">{cat.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brass-light">
                    Explore <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="bg-sand/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brass">Customer Favourites</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-4xl">
              Featured Products
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-espresso/55 sm:text-base">
              Handpicked bestsellers our Nairobi customers love — order in one tap via WhatsApp.
            </p>
          </div>

          {loading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
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
            <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 rounded-xl bg-espresso px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brass"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} onOrder={setOrderProduct} index={i} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-espresso px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-espresso transition-all duration-200 hover:border-brass hover:bg-brass hover:text-white"
            >
              Browse Full Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ WHY RAFNA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img
              src="/images/products/pocket-spring.jpg"
              alt="Premium orthopaedic mattress"
              className="w-full rounded-3xl object-cover shadow-2xl shadow-espresso/20"
            />
            <div className="absolute -bottom-5 -right-3 rounded-2xl bg-espresso px-6 py-4 shadow-xl sm:-right-6">
              <p className="font-display text-2xl font-bold text-brass-light">1000+</p>
              <p className="text-xs uppercase tracking-[0.16em] text-cream/70">Happy Sleepers</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brass">Why Rafna Investment</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-espresso sm:text-4xl">
              Comfort You Can Trust,
              <br />
              Service You Can Count On
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-espresso/60">
              From our shop in Kamkunji, Nairobi, we have built a reputation for genuine quality —
              every mattress, duvet and household item is carefully selected to give your family
              lasting comfort at honest prices.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                'Genuine foam, fiber & spring orthopaedic mattresses in all sizes',
                'Hotel-grade beddings that transform your bedroom',
                'Free, fast delivery within Nairobi & surroundings',
                'Pay on delivery — order with total peace of mind',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ShieldCheck size={19} className="mt-0.5 shrink-0 text-brass" />
                  <span className="text-[15px] text-espresso/75">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ============ CONTACT CTA ============ */}
      <section className="bg-espresso">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brass-light">Visit or Order Today</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-cream sm:text-4xl">
                Your Best Night's Sleep
                <br />
                Is One Message Away
              </h2>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-cream/60">
                Order via WhatsApp, pick up at our Kamkunji shop, or have it delivered to your
                doorstep — free within Nairobi &amp; surroundings.
              </p>
              <a
                href={waChatLink('Hello Rafna Investment! I would like to place an order.')}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-xl shadow-[#25D366]/25 transition-all duration-200 hover:bg-[#1eb857]"
              >
                <Phone size={17} /> Order on WhatsApp
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Phone, label: 'Call / WhatsApp', value: PHONE_DISPLAY },
                { icon: Mail, label: 'Email Us', value: EMAIL },
                { icon: MapPin, label: 'Visit the Shop', value: LOCATION },
                { icon: Truck, label: 'Delivery', value: 'Free in Nairobi · Country-wide available' },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-cream/10 bg-cream/5 p-5">
                  <c.icon size={20} className="text-brass-light" />
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/45">{c.label}</p>
                  <p className="mt-1 break-words text-sm font-medium text-cream">{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
    </div>
  );
}
