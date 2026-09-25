import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, MapPin, Minus, Plus, Store, Truck, X } from 'lucide-react';
import { api, buildWhatsAppLink, formatKES } from '../lib/api';
import type { Order } from '../lib/api';
import { useShop } from '../lib/store';

type Fulfillment = 'pickup' | 'delivery';

const FULFILLMENT_LABEL: Record<Fulfillment, string> = {
  pickup: 'Shop Pick Up (Kamkunji, Nairobi)',
  delivery: 'Delivery (Free within Nairobi)',
};

export default function CheckoutModal() {
  const { checkoutProduct: product, setCheckoutProduct } = useShop();
  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [waLink, setWaLink] = useState('');

  useEffect(() => {
    if (product) {
      setFulfillment('delivery');
      setFullName('');
      setPhone('');
      setLocation('');
      setQuantity(1);
      setErrors({});
      setSubmitting(false);
      setPlaced(null);
      setWaLink('');
    }
  }, [product]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCheckoutProduct(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCheckoutProduct]);

  useEffect(() => {
    document.body.style.overflow = product ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  const total = useMemo(() => (product ? Number(product.price) * quantity : 0), [product, quantity]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Please enter your full name.';
    const digits = phone.replace(/\D/g, '');
    if (!phone.trim()) next.phone = 'Please enter your phone number.';
    else if (digits.length < 9) next.phone = 'Please enter a valid phone number.';
    if (fulfillment === 'delivery' && !location.trim()) {
      next.location = 'Delivery location is required for delivery orders.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !product) return;
    setSubmitting(true);
    const payload = {
      product_id: product.id,
      product_title: product.title,
      unit_price: Number(product.price),
      quantity,
      total,
      fulfillment_type: FULFILLMENT_LABEL[fulfillment],
      full_name: fullName.trim(),
      phone: phone.trim(),
      location: fulfillment === 'delivery' ? location.trim() : location.trim() || null,
    };
    try {
      const saved = await api<Order>('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
      setPlaced(saved);
    } catch {
      setPlaced({
        id: 0,
        product_id: product.id,
        product_title: product.title,
        quantity,
        unit_price: Number(product.price),
        total,
        fulfillment_type: FULFILLMENT_LABEL[fulfillment],
        full_name: fullName.trim(),
        phone: phone.trim(),
        location: payload.location,
        status: 'new',
        created_at: new Date().toISOString(),
      });
    }
    const link = buildWhatsAppLink({
      product_title: payload.product_title,
      unit_price: payload.unit_price,
      quantity: payload.quantity,
      total: payload.total,
      fulfillment_type: payload.fulfillment_type,
      full_name: payload.full_name,
      phone: payload.phone,
      location: payload.location,
    });
    setWaLink(link);
    setSubmitting(false);
    window.open(link, '_blank', 'noopener');
  };

  const close = () => setCheckoutProduct(null);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/70 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-forest-950/5 text-forest-950 transition hover:bg-forest-950/10"
              aria-label="Close checkout"
            >
              <X className="h-5 w-5" />
            </button>

            {!placed ? (
              <form onSubmit={handleSubmit} noValidate>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-600">Checkout</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-forest-950">Complete Your Order</h2>

                <div className="mt-5 flex gap-4 rounded-2xl border border-forest-950/10 bg-ivory-50 p-3">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-20 w-24 shrink-0 rounded-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/mattress-1.jpg';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-bold text-forest-950">{product.title}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-forest-950/50">{product.category}</p>
                    <p className="mt-1 font-display text-lg font-bold text-forest-900">{formatKES(product.price)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-950/70">Fulfillment Type</p>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFulfillment('pickup')}
                      className={`flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition ${fulfillment === 'pickup'
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-forest-950/10 hover:border-forest-950/25'
                        }`}
                    >
                      <Store className={`h-5 w-5 ${fulfillment === 'pickup' ? 'text-gold-600' : 'text-forest-950/50'}`} />
                      <span className="text-sm font-bold text-forest-950">Shop Pick Up</span>
                      <span className="text-[11px] leading-snug text-forest-950/60">Kamkunji, Nairobi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillment('delivery')}
                      className={`flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition ${fulfillment === 'delivery'
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-forest-950/10 hover:border-forest-950/25'
                        }`}
                    >
                      <Truck className={`h-5 w-5 ${fulfillment === 'delivery' ? 'text-gold-600' : 'text-forest-950/50'}`} />
                      <span className="text-sm font-bold text-forest-950">Delivery</span>
                      <span className="text-[11px] leading-snug text-forest-950/60">Free within Nairobi</span>
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="co-name" className="text-xs font-bold uppercase tracking-[0.18em] text-forest-950/70">
                      Full Name *
                    </label>
                    <input
                      id="co-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Mary Wanjiku"
                      className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-forest-950 outline-none transition placeholder:text-forest-950/35 focus:ring-2 focus:ring-gold-500/50 ${errors.fullName ? 'border-red-400' : 'border-forest-950/15 focus:border-gold-500'}`}
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label htmlFor="co-phone" className="text-xs font-bold uppercase tracking-[0.18em] text-forest-950/70">
                      Phone Number *
                    </label>
                    <input
                      id="co-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0710 000000"
                      className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm text-forest-950 outline-none transition placeholder:text-forest-950/35 focus:ring-2 focus:ring-gold-500/50 ${errors.phone ? 'border-red-400' : 'border-forest-950/15 focus:border-gold-500'}`}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="co-location" className="text-xs font-bold uppercase tracking-[0.18em] text-forest-950/70">
                      Delivery Location {fulfillment === 'delivery' ? '*' : '(optional)'}
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-950/40" />
                      <input
                        id="co-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={fulfillment === 'delivery' ? 'e.g. Kileleshwa, Nairobi' : 'e.g. Estate / Town'}
                        className={`mt-1.5 w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-forest-950 outline-none transition placeholder:text-forest-950/35 focus:ring-2 focus:ring-gold-500/50 ${errors.location ? 'border-red-400' : 'border-forest-950/15 focus:border-gold-500'}`}
                      />
                    </div>
                    {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
                    {fulfillment === 'pickup' && (
                      <p className="mt-1 text-xs text-forest-950/50">Pickup point: Rafna Investment, Kamkunji, Nairobi.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-forest-950/10 bg-ivory-50 px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-forest-950/70">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-forest-950/15 text-forest-950 transition hover:bg-forest-950 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-base font-bold text-forest-950">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-forest-950/15 text-forest-950 transition hover:bg-forest-950 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-dashed border-forest-950/15 pt-4">
                  <span className="text-sm font-semibold text-forest-950/70">Order Total</span>
                  <span className="font-display text-2xl font-bold text-forest-950">{formatKES(total)}</span>
                </div>
                <p className="mt-1 text-right text-[11px] uppercase tracking-[0.14em] text-emerald-700">
                  {fulfillment === 'delivery' ? 'Free Nairobi delivery • Pay on Delivery' : 'Pay at pickup • Kamkunji, Nairobi'}
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1fa855] px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-[#188a45] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending Order…
                    </>
                  ) : (
                    'Send Order via WhatsApp'
                  )}
                </button>
                <p className="mt-3 text-center text-xs leading-relaxed text-forest-950/50">
                  Your order opens in WhatsApp addressed to Rafna Investment (0710 565055). Just press send — we confirm
                  instantly.
                </p>
              </form>
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                <h2 className="mt-4 font-display text-3xl font-bold text-forest-950">Order Ready!</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-forest-950/65">
                  Thank you, <span className="font-semibold text-forest-950">{placed.full_name}</span>. Your order for{' '}
                  <span className="font-semibold text-forest-950">
                    {placed.quantity} × {placed.product_title}
                  </span>{' '}
                  ({formatKES(placed.total)}) has been prepared in WhatsApp.
                </p>
                <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-ivory-50 p-4 text-left text-sm text-forest-950/75">
                  <p>
                    <span className="font-semibold text-forest-950">Fulfillment:</span> {placed.fulfillment_type}
                  </p>
                  {placed.location && (
                    <p className="mt-1">
                      <span className="font-semibold text-forest-950">Location:</span> {placed.location}
                    </p>
                  )}
                  <p className="mt-1">
                    <span className="font-semibold text-forest-950">Phone:</span> {placed.phone}
                  </p>
                </div>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1fa855] px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#188a45]"
                  >
                    Open WhatsApp Again
                  </a>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="mt-3 w-full rounded-xl border border-forest-950/15 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-forest-950 transition hover:bg-forest-950/5"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
