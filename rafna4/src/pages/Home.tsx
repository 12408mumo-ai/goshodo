import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  Clock,
  Diamond,
  HandCoins,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import OrderModal from "../components/OrderModal";
import { Reveal } from "../components/Reveal";
import { getProducts, PRODUCTS_CHANGED_EVENT } from "../lib/products";
import { CATEGORIES_CHANGED_EVENT, getCategories } from "../lib/categories";
import {
  CATEGORY_FALLBACK_IMAGE,
  GENERIC_FALLBACK_IMAGE,
  resolveProductImage,
} from "../lib/image";
import { enquiryWhatsAppUrl } from "../lib/whatsapp";
import { useTitle } from "../lib/useTitle";
import {
  BUSINESS_EMAIL,
  BUSINESS_LOCATION,
  DISPLAY_PHONE,
  TEL_LINK,
} from "../lib/env";
import type { CategoryRecord, Product } from "../lib/types";

const TRUST_ITEMS = [
  "Free delivery within Nairobi & surroundings",
  "Pay on Delivery available",
  "Foam · Fibre · Spring orthopaedic mattresses",
  "Country-wide delivery at affordable prices",
  "Premium beddings & household goods",
  "Kamkunji, Nairobi",
];

/** Curated copy for the original collections; custom categories get an
 *  automatic blurb (product count) and an image from their products. */
const DEFAULT_BLURBS: Record<string, string> = {
  "Orthopaedic Mattresses":
    "Foam, fibre & spring builds for proper back support.",
  Beddings: "Duvets, bedsheets, pillows & throws in premium fabrics.",
  Households: "Everyday essentials, carefully chosen for Kenyan homes.",
};

const PROMISES = [
  {
    icon: BedDouble,
    title: "Orthopaedic excellence",
    text: "Every mattress is selected for proper spinal support — quality foam, breathable fibre or resilient springs.",
  },
  {
    icon: Truck,
    title: "Free Nairobi delivery",
    text: "Free delivery within Nairobi & surroundings, and country-wide delivery at genuinely affordable prices.",
  },
  {
    icon: HandCoins,
    title: "Pay on Delivery",
    text: "Inspect your order at your doorstep first, then pay — available within Nairobi & surroundings.",
  },
  {
    icon: Sparkles,
    title: "Honest quality",
    text: "Premium beddings and household essentials we would gladly use in our own homes.",
  },
] as const;

export default function Home() {
  useTitle(
    "Rafna Investment — Quality Mattresses, Beddings & Households | Nairobi",
  );
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await getProducts();
      setAllProducts(all);
      setFeatured(all.slice(0, 4));
      setError(null);
    } catch (err) {
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

  // Live category cards — new categories appear here automatically.
  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const list = await getCategories();
        if (mounted) setCategories(list);
      } catch {
        /* section simply stays hidden until a refresh succeeds */
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

  const categoryCards = useMemo(() => {
    if (!categories) return null;
    return categories.map((category) => {
      const items = allProducts.filter((p) => p.category === category.name);
      return {
        title: category.name,
        blurb:
          DEFAULT_BLURBS[category.name] ??
          (items.length > 0
            ? `${items.length} product${items.length === 1 ? "" : "s"} in this collection`
            : "Freshly curated — explore the collection"),
        image:
          items.length > 0
            ? resolveProductImage(items[0])
            : (CATEGORY_FALLBACK_IMAGE[category.name] ??
              GENERIC_FALLBACK_IMAGE),
      };
    });
  }, [categories, allProducts]);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-gold-300/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-forest-100 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-gold-600">
              <span className="h-px w-10 bg-gold-500" aria-hidden />
              Kamkunji · Nairobi
            </p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] text-espresso-900 sm:text-6xl lg:text-7xl">
              Rest well.
              <br />
              <em className="text-gold-600">Rise</em> well.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-espresso-500">
              Rafna Investment crafts better mornings — quality foam, fibre
              &amp; spring orthopaedic mattresses, premium beddings and trusted
              household essentials, delivered free within Nairobi.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-espresso-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-cream-50 transition-all hover:bg-gold-600"
              >
                Shop the Collection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={enquiryWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-wa-600/50 bg-wa-600/10 px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-wa-700 transition-all hover:bg-wa-600 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Order on WhatsApp
              </a>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-espresso-900/10 pt-8">
              {[
                ["3", "Curated collections"],
                ["100%", "Genuine quality"],
                ["Free", "Nairobi delivery"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl font-semibold text-espresso-900">
                    {value}
                  </dd>
                  <dd className="mt-1 text-xs uppercase tracking-[0.16em] text-espresso-400">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.15} className="relative">
            <div
              aria-hidden
              className="absolute -inset-3 rounded-[2.2rem] border border-gold-500/40"
            />
            <img
              src="/images/hero.jpg"
              alt="Elegant bedroom styled with a Rafna orthopaedic mattress"
              className="h-[380px] w-full rounded-[1.9rem] object-cover shadow-lift sm:h-[460px] lg:h-[560px]"
            />
            <div className="absolute -bottom-7 left-6 flex items-center gap-3 rounded-2xl border border-espresso-900/10 bg-cream-50 px-5 py-4 shadow-lift">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-800 text-gold-300">
                <HandCoins className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-espresso-900">
                  Pay on Delivery
                </p>
                <p className="text-xs text-espresso-400">
                  Within Nairobi &amp; surroundings
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trust marquee ─────────────────────────────────────────── */}
      <section className="marquee overflow-hidden border-y border-gold-500/25 bg-forest-900">
        <div className="flex w-max animate-marquee items-center py-4">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex items-center"
            >
              {TRUST_ITEMS.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center gap-4 pr-10 text-xs font-medium uppercase tracking-[0.26em] text-gold-300"
                >
                  {item}
                  <Diamond
                    className="h-2.5 w-2.5 text-gold-500"
                    aria-hidden
                    fill="currentColor"
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Collections ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-600">
            Our Collections
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-espresso-900 sm:text-5xl">
            Everything for a well-kept home
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-espresso-500">
            From orthopaedic sleep systems to the finishing touches — explore
            the three lines Nairobi households trust us for.
          </p>
        </Reveal>

        {categoryCards && categoryCards.length > 0 && (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {categoryCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.1}>
              <Link
                to={`/shop?category=${encodeURIComponent(card.title)}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-card"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-espresso-950/85 via-espresso-950/20 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="font-display text-2xl font-semibold text-cream-50">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream-100/80">
                    {card.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold-300 transition-colors group-hover:text-gold-400">
                    Shop now
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        )}
      </section>

      {/* ── Bestsellers ───────────────────────────────────────────── */}
      <section className="bg-cream-100 bg-weave">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-600">
                Bestsellers
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold text-espresso-900 sm:text-5xl">
                Loved across Nairobi
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-espresso-900/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-espresso-800 transition-all hover:border-espresso-900 hover:bg-espresso-900 hover:text-cream-50"
              >
                View full collection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>

          <div className="mt-12">
            {error ? (
              <div className="rounded-2xl border border-clay-600/30 bg-white p-8 text-center text-sm text-espresso-500">
                {error}
                <button
                  type="button"
                  onClick={() => void load()}
                  className="mt-4 rounded-full bg-espresso-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-cream-50"
                >
                  Try again
                </button>
              </div>
            ) : featured === null ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
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
            ) : featured.length === 0 ? (
              <p className="rounded-2xl border border-espresso-900/10 bg-white p-8 text-center text-sm text-espresso-500">
                New arrivals are being prepared — check back shortly or message
                us on WhatsApp.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((product, i) => (
                  <Reveal key={product.id} delay={i * 0.06} className="h-full">
                    <ProductCard product={product} onOrder={setOrderProduct} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── The Rafna promise ─────────────────────────────────────── */}
      <section className="bg-forest-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-400">
              The Rafna Promise
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-cream-50 sm:text-5xl">
              Quality you can feel.
              <br />
              Service you can trust.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08} className="h-full">
                <div className="h-full rounded-2xl border border-cream-50/10 bg-cream-50/5 p-7 transition-colors hover:border-gold-500/40">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-500/15 text-gold-300">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-cream-50">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-cream-100/65">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-stretch gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-600">
                Visit or Reach Us
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold text-espresso-900 sm:text-5xl">
                Talk to Rafna today
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-espresso-500">
                Questions about sizes, prices or delivery? Call, WhatsApp or
                visit the shop — we respond personally, fast.
              </p>
              <ul className="mt-9 space-y-5">
                {[
                  {
                    icon: Phone,
                    label: "Call us",
                    value: DISPLAY_PHONE,
                    href: TEL_LINK,
                  },
                  {
                    icon: MessageCircle,
                    label: "WhatsApp",
                    value: DISPLAY_PHONE,
                    href: enquiryWhatsAppUrl(),
                    external: true,
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: BUSINESS_EMAIL,
                    href: `mailto:${BUSINESS_EMAIL}`,
                  },
                  {
                    icon: MapPin,
                    label: "Visit the shop",
                    value: `${BUSINESS_LOCATION}, Kenya`,
                  },
                  {
                    icon: Clock,
                    label: "Opening hours",
                    value: "Mon – Sat · 8:00 AM – 6:30 PM",
                  },
                ].map((row) => (
                  <li key={row.label} className="flex items-center gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold-500/40 bg-gold-100/60 text-gold-600">
                      <row.icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-espresso-400">
                        {row.label}
                      </p>
                      {row.href ? (
                        <a
                          href={row.href}
                          {...(row.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="text-base font-medium text-espresso-900 transition-colors hover:text-gold-600"
                        >
                          {row.value}
                        </a>
                      ) : (
                        <p className="text-base font-medium text-espresso-900">
                          {row.value}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.12} className="relative">
              <div className="relative h-full min-h-[380px] overflow-hidden rounded-3xl shadow-lift">
                <img
                  src="/images/lifestyle.jpg"
                  alt="Freshly prepared bed with premium Rafna linens"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-espresso-950/85 via-espresso-950/15 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <h3 className="font-display text-3xl font-semibold text-cream-50">
                    Order in under a minute
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-cream-100/80">
                    Tap below, tell us what you need, and we will confirm price
                    and delivery right away.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={enquiryWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-wa-600 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-wa-500"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      WhatsApp Us
                    </a>
                    <a
                      href={TEL_LINK}
                      className="inline-flex items-center gap-2 rounded-full border border-cream-50/40 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-cream-50 transition-colors hover:bg-cream-50 hover:text-espresso-900"
                    >
                      <Phone className="h-4 w-4" aria-hidden />
                      {DISPLAY_PHONE}
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Policy ribbon */}
          <Reveal delay={0.1}>
            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-gold-500/30 bg-gold-500/30 sm:grid-cols-3">
              {[
                {
                  icon: Truck,
                  title: "Free delivery",
                  text: "Within Nairobi & surroundings",
                },
                {
                  icon: MapPin,
                  title: "Country-wide",
                  text: "Delivery at affordable prices",
                },
                {
                  icon: ShieldCheck,
                  title: "Pay on Delivery",
                  text: "Within Nairobi & surroundings",
                },
              ].map((policy) => (
                <div
                  key={policy.title}
                  className="flex items-center gap-4 bg-cream-50 px-7 py-6"
                >
                  <policy.icon
                    className="h-6 w-6 shrink-0 text-gold-600"
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-semibold text-espresso-900">
                      {policy.title}
                    </p>
                    <p className="text-xs text-espresso-400">{policy.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Order modal — outside animated wrappers so fixed positioning holds */}
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
