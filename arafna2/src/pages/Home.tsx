import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BadgeCheck, BedDouble, Headset, MapPin, Package, Phone, Quote, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { EMAIL, PHONE_DISPLAY, WHATSAPP_NUMBER } from '../lib/api';
import { useShop } from '../lib/store';

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  mattresses: '/images/mattress-1.jpg',
  mattress: '/images/mattress-1.jpg',
  bedding: '/images/bedding-1.jpg',
  beddings: '/images/bedding-1.jpg',
  household: '/images/household-1.jpg',
  households: '/images/household-1.jpg',
};

function categoryImage(name: string, imageUrl: string | null, products: { category: string; image_url: string }[]): string {
  if (imageUrl) return imageUrl;
  const key = name.toLowerCase();
  if (FALLBACK_CATEGORY_IMAGES[key]) return FALLBACK_CATEGORY_IMAGES[key];
  const match = products.find((p) => p.category.toLowerCase() === key);
  if (match) return match.image_url;
  return '/images/showroom.jpg';
}

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

export default function Home() {
  const { products, categories, loading } = useShop();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const showcase = (featured.length >= 4 ? featured : [...featured, ...products.filter((p) => !p.featured)]).slice(0, 8);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-forest-950">
        <div className="absolute inset-0">
          <img src="/images/hero.jpg" alt="Luxury bedroom with premium Rafna mattress and bedding" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/70 to-forest-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-forest-950/20" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 sm:py-32 lg:min-h-[640px] lg:px-8 lg:py-36">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-forest-950/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-gold-300 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Kamkunji • Nairobi
            </p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] text-ivory-50 sm:text-5xl lg:text-6xl">
              Sleep in Luxury.
              <span className="block text-gold-300">Live in Comfort.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory-50/80 sm:text-lg">
              Quality foam, fiber &amp; spring orthopaedic mattresses, premium bedding and household essentials —
              delivered free within Nairobi, with Pay on Delivery you can trust.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-forest-950 shadow-xl transition-all hover:bg-gold-400 hover:shadow-2xl active:scale-[0.98]"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Rafna Investment! I would like to enquire about your mattresses and bedding.')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-ivory-50/30 bg-ivory-50/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-ivory-50 backdrop-blur transition-all hover:bg-ivory-50/20"
              >
                WhatsApp Us
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ivory-50/75">
              <span className="inline-flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold-400" /> Free Nairobi delivery
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-gold-400" /> Pay on Delivery
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold-400" /> Genuine quality
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* POLICY STRIP */}
      <section className="border-b border-forest-950/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Truck, title: 'Free Nairobi Delivery', text: 'Free delivery within Nairobi & surroundings' },
            { icon: BadgeCheck, title: 'Pay on Delivery', text: 'Pay when your order arrives at your door' },
            { icon: Package, title: 'Countrywide Delivery', text: 'Affordable delivery across all of Kenya' },
            { icon: MapPin, title: 'Shop Pick Up', text: 'Collect from Kamkunji, Nairobi' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-950 text-gold-400">
                <f.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-forest-950">{f.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-forest-950/60">{f.text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-ivory-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Our Collections</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-forest-950 sm:text-4xl">Shop by Category</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.14em] text-forest-950 transition-colors hover:text-gold-600"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-ivory-200" />
              ))}
            </div>
          ) : categories.length === 0 ? null : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat, i) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                  >
                    <Link
                      to={`/shop?category=${encodeURIComponent(cat.name)}`}
                      className="group relative block h-64 overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-2xl"
                    >
                      <img
                        src={categoryImage(cat.name, cat.image_url, products)}
                        alt={cat.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/showroom.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                        <div>
                          <h3 className="font-display text-2xl font-bold text-white">{cat.name}</h3>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">
                            {count} {count === 1 ? 'product' : 'products'}
                          </p>
                        </div>
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-forest-950 transition-transform group-hover:translate-x-1">
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Handpicked for You</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-forest-950 sm:text-4xl">Featured Products</h2>
              <p className="mt-2 max-w-xl text-sm text-forest-950/60">
                Our most loved orthopaedic mattresses, bedding sets and household picks — order in one tap via WhatsApp.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl border border-forest-950/20 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-forest-950 transition hover:border-forest-950 hover:bg-forest-950 hover:text-ivory-50"
            >
              Shop All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
            ) : showcase.length === 0 ? (
              <p className="col-span-full rounded-2xl bg-ivory-50 p-8 text-center text-sm text-forest-950/60">
                New products are on the way. Please check back soon or WhatsApp us for availability.
              </p>
            ) : (
              showcase.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            )}
          </div>
        </div>
      </section>

      {/* WHY RAFNA / SHOWROOM */}
      <section className="bg-forest-950">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55 }}
            className="relative"
          >
            <img
              src="/images/showroom.jpg"
              alt="Rafna Investment showroom"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-ivory-50/10"
            />
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-gold-500 p-5 shadow-xl sm:left-8 sm:right-auto sm:w-72">
              <p className="font-display text-3xl font-bold text-forest-950">100%</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-forest-950/80">
                Genuine quality promise
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-300">Why Rafna Investment</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ivory-50 sm:text-4xl">
              Kamkunji&apos;s Trusted Sleep &amp; Home Store
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ivory-50/70 sm:text-base">
              From orthopaedic support to hotel-grade bedding, every item in our store is hand-selected for comfort,
              durability and value — backed by honest prices and friendly service.
            </p>
            <ul className="mt-8 space-y-5">
              {[
                { icon: BedDouble, title: 'Orthopaedic Expertise', text: 'Foam, fiber & spring mattresses designed for healthy backs and deeper sleep.' },
                { icon: Truck, title: 'Fast, Free Nairobi Delivery', text: 'Free delivery within Nairobi & surroundings, affordable rates countrywide.' },
                { icon: Headset, title: 'Personal Support', text: 'Talk to us on call or WhatsApp — real help from real people, Mon–Sat.' },
              ].map((f) => (
                <li key={f.title} className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ivory-50/10 text-gold-300 ring-1 ring-ivory-50/15">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold text-ivory-50">{f.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ivory-50/65">{f.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ivory-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Happy Homes</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-forest-950 sm:text-4xl">What Nairobi Says</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { name: 'Grace N. — Kilimani', text: 'Ordered an orthopaedic mattress in the morning and it arrived the same day. My back pain is gone. Pay on delivery made it so easy!' },
              { name: 'Daniel O. — Ruaka', text: 'The bedding quality is genuinely hotel-grade. Rafna confirmed my WhatsApp order in minutes and delivery was free. Highly recommended.' },
              { name: 'Faith M. — South B', text: 'I picked up from their Kamkunji shop — honest prices, warm service and quality household goods. My whole house shops here now.' },
            ].map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex flex-col rounded-2xl border border-forest-950/10 bg-white p-7 shadow-[0_2px_16px_rgba(18,50,48,0.06)]"
              >
                <Quote className="h-7 w-7 text-gold-500" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-forest-950/75">&ldquo;{t.text}&rdquo;</blockquote>
                <figcaption className="mt-5 border-t border-forest-950/10 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-forest-950">
                  {t.name}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-950 to-forest-950 p-8 sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-300">Visit or Call Us</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ivory-50 sm:text-4xl">
                  Your Comfort Is One Message Away
                </h2>
                <ul className="mt-6 space-y-3 text-sm text-ivory-50/80">
                  <li className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 shrink-0 text-gold-400" /> Kamkunji, Nairobi — shop pickup available
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-gold-400" /> {PHONE_DISPLAY} — Call / WhatsApp
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Rafna Investment! I need help choosing the right mattress.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1fa855] px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#188a45]"
                >
                  Chat on WhatsApp
                </a>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-ivory-50/25 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ivory-50 transition hover:bg-ivory-50/10"
                  >
                    Call Now
                  </a>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-ivory-50/25 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-ivory-50 transition hover:bg-ivory-50/10"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
