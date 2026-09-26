import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  Store,
  Truck,
  X,
} from "lucide-react";
import ProductImage from "./ProductImage";
import type { Product } from "../lib/types";
import { formatKES } from "../lib/format";
import { buildOrderMessage, buildWhatsAppUrl } from "../lib/whatsapp";
import {
  sanitizeText,
  validateOrder,
  type OrderErrors,
  type OrderInput,
} from "../lib/validate";

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-espresso-900 placeholder-espresso-300 transition-colors focus:border-gold-500 focus:outline-none";

export default function OrderModal({ product, onClose }: OrderModalProps) {
  const [form, setForm] = useState<OrderInput>({
    name: "",
    phone: "",
    fulfillment: "delivery",
    location: "",
  });
  const [errors, setErrors] = useState<OrderErrors>({});
  const [sending, setSending] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  // Scroll lock + ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const update = (patch: Partial<OrderInput>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        delete (next as Record<string, unknown>)[key];
      }
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateOrder(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    const url = buildWhatsAppUrl(
      buildOrderMessage({
        productTitle: product.title,
        price: product.price,
        fulfillment: form.fulfillment,
        location: sanitizeText(form.location),
        name: sanitizeText(form.name),
        phone: form.phone.trim(),
      }),
    );
    window.open(url, "_blank", "noopener,noreferrer");
    setSending(false);
    setSentUrl(url);
  };

  const fulfillmentButton = (
    value: "delivery" | "pickup",
    icon: typeof Truck,
    label: string,
    caption: string,
  ) => {
    const Icon = icon;
    const active = form.fulfillment === value;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={active}
        onClick={() => update({ fulfillment: value })}
        className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all ${
          active
            ? "border-gold-500 bg-gold-100/60 ring-1 ring-gold-500"
            : "border-espresso-900/15 bg-white hover:border-espresso-900/35"
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-espresso-900">
          <Icon
            className={`h-4 w-4 ${active ? "text-gold-600" : "text-espresso-400"}`}
            aria-hidden
          />
          {label}
        </span>
        <span className="text-xs text-espresso-500">{caption}</span>
      </button>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${product.title}`}
    >
      <motion.button
        type="button"
        aria-label="Close order form"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-espresso-950/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream-50 shadow-lift sm:rounded-3xl"
      >
        {/* Product summary header */}
        <div className="relative h-44 overflow-hidden">
          <ProductImage
            product={product}
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-espresso-950/85 via-espresso-950/25 to-espresso-950/10"
            aria-hidden
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-cream-50/95 text-espresso-800 shadow transition-colors hover:bg-cream-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
          <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-300">
                {product.category}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-cream-50">
                {product.title}
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-gold-500 px-3.5 py-1.5 text-sm font-bold text-espresso-950 shadow">
              {formatKES(product.price)}
            </span>
          </div>
        </div>

        {sentUrl ? (
          /* WhatsApp hand-off confirmation */
          <div className="p-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-wa-600/10">
              <CheckCircle2 className="h-9 w-9 text-wa-600" aria-hidden />
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold text-espresso-900">
              Your order is ready to send
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-espresso-500">
              WhatsApp should now be open with your order pre-filled — simply
              press send and we will confirm within minutes.
            </p>
            <a
              href={sentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-wa-600 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-wa-500"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Open WhatsApp again
            </a>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-full py-2.5 text-sm font-medium text-espresso-500 transition-colors hover:text-espresso-900"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6 sm:p-7">
            {/* Fulfillment */}
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-[0.22em] text-espresso-600">
                How would you like to receive it?
              </legend>
              <div
                className="mt-3 grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-label="Fulfillment method"
              >
                {fulfillmentButton(
                  "delivery",
                  Truck,
                  "Delivery",
                  "Free within Nairobi",
                )}
                {fulfillmentButton(
                  "pickup",
                  Store,
                  "Shop Pick Up",
                  "Kamkunji, Nairobi",
                )}
              </div>
            </fieldset>

            {/* Name */}
            <div>
              <label
                htmlFor="order-name"
                className="text-xs font-semibold uppercase tracking-[0.22em] text-espresso-600"
              >
                Full Name <span className="text-clay-600">*</span>
              </label>
              <input
                id="order-name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Wanjiku Kamau"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "order-name-error" : undefined}
                className={`mt-2 ${inputBase} ${
                  errors.name ? "border-clay-600" : "border-espresso-900/15"
                }`}
              />
              {errors.name && (
                <p id="order-name-error" className="mt-1.5 text-xs text-clay-600">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="order-phone"
                className="text-xs font-semibold uppercase tracking-[0.22em] text-espresso-600"
              >
                Phone Number <span className="text-clay-600">*</span>
              </label>
              <input
                id="order-phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="e.g. 0712 345 678"
                value={form.phone}
                onChange={(e) => update({ phone: e.target.value })}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "order-phone-error" : undefined}
                className={`mt-2 ${inputBase} ${
                  errors.phone ? "border-clay-600" : "border-espresso-900/15"
                }`}
              />
              {errors.phone && (
                <p id="order-phone-error" className="mt-1.5 text-xs text-clay-600">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Location — required only for delivery */}
            {form.fulfillment === "delivery" ? (
              <div>
                <label
                  htmlFor="order-location"
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-espresso-600"
                >
                  Delivery Location <span className="text-clay-600">*</span>
                </label>
                <input
                  id="order-location"
                  type="text"
                  autoComplete="street-address"
                  placeholder="e.g. Donholm, Phase 5 — Nairobi"
                  value={form.location}
                  onChange={(e) => update({ location: e.target.value })}
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={
                    errors.location ? "order-location-error" : undefined
                  }
                  className={`mt-2 ${inputBase} ${
                    errors.location
                      ? "border-clay-600"
                      : "border-espresso-900/15"
                  }`}
                />
                {errors.location ? (
                  <p
                    id="order-location-error"
                    className="mt-1.5 text-xs text-clay-600"
                  >
                    {errors.location}
                  </p>
                ) : (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-espresso-400">
                    <Truck className="h-3.5 w-3.5" aria-hidden />
                    Free within Nairobi &amp; surroundings — pay on delivery.
                  </p>
                )}
              </div>
            ) : (
              <p className="flex items-start gap-2 rounded-xl bg-forest-100 px-4 py-3 text-xs leading-relaxed text-forest-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Pick up at our shop in Kamkunji, Nairobi — we will confirm your
                order and directions on WhatsApp.
              </p>
            )}

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-wa-600 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-wa-600/25 transition-colors hover:bg-wa-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <MessageCircle className="h-5 w-5" aria-hidden />
                )}
                Send Order via WhatsApp
              </button>
              <p className="mt-3 text-center text-xs text-espresso-400">
                No account needed — we confirm every order personally.
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}
