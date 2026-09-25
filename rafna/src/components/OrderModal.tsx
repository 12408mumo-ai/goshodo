import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Truck, Send } from 'lucide-react';
import { formatKES, WHATSAPP_NUMBER, type Product } from '../lib/config';

interface Props {
  product: Product | null;
  onClose: () => void;
}

type Fulfillment = 'pickup' | 'delivery';

export default function OrderModal({ product, onClose }: Props) {
  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (product) {
      setFulfillment('delivery');
      setFullName('');
      setPhone('');
      setLocation('');
      setErrors({});
      setSent(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = 'Please enter your full name';
    const cleaned = phone.replace(/[\s-]/g, '');
    if (!/^(\+?254|0)?[17]\d{8}$/.test(cleaned)) e.phone = 'Enter a valid Kenyan phone number e.g. 0712 345678';
    if (fulfillment === 'delivery' && !location.trim()) e.location = 'Delivery location is required for delivery orders';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!product || !validate()) return;

    const lines = [
      'Hello Rafna Investment! I would like to place an order.',
      '',
      '*ORDER DETAILS*',
      `Product: ${product.title}`,
      `Category: ${product.category}`,
      `Price: ${formatKES(product.price)}`,
      '',
      '*FULFILLMENT*',
      fulfillment === 'pickup'
        ? 'Shop Pick Up — Kamkunji, Nairobi'
        : 'Delivery — FREE within Nairobi & Surroundings',
      '',
      '*CUSTOMER DETAILS*',
      `Full Name: ${fullName.trim()}`,
      `Phone: ${phone.trim()}`,
    ];
    if (fulfillment === 'delivery') {
      lines.push(`Delivery Location: ${location.trim()}`);
    }
    lines.push('', 'Thank you!');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
    setSent(true);
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-ivory px-4 py-3 text-[15px] text-espresso placeholder:text-espresso/35 outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20 ${
      hasError ? 'border-red-400' : 'border-line'
    }`;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/60 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-6 py-4 backdrop-blur">
              <h2 className="font-display text-lg font-semibold text-espresso">Place Your Order</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-2 text-espresso/50 transition-colors hover:bg-sand hover:text-espresso"
              >
                <X size={20} />
              </button>
            </div>

            {sent ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/15">
                  <Send size={28} className="text-[#25D366]" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-espresso">Order Sent to WhatsApp</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-espresso/60">
                  Your order for <strong>{product.title}</strong> has been prepared in WhatsApp.
                  Simply press send in the chat and our team will confirm your order right away.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-espresso px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-brass"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 pb-8 pt-5" noValidate>
                {/* Product summary */}
                <div className="flex items-center gap-4 rounded-2xl border border-line bg-ivory p-3.5">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display font-semibold text-espresso">{product.title}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-espresso/45">{product.category}</p>
                    <p className="mt-0.5 font-display font-bold text-brass-dark">{formatKES(product.price)}</p>
                  </div>
                </div>

                {/* Fulfillment */}
                <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-espresso/60">
                  Fulfillment Type
                </p>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setFulfillment('pickup')}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      fulfillment === 'pickup'
                        ? 'border-brass bg-brass/8 shadow-sm'
                        : 'border-line bg-white hover:border-espresso/25'
                    }`}
                  >
                    <Store size={20} className={fulfillment === 'pickup' ? 'text-brass' : 'text-espresso/40'} />
                    <span>
                      <span className="block text-sm font-semibold text-espresso">Shop Pick Up</span>
                      <span className="mt-0.5 block text-xs text-espresso/55">Kamkunji, Nairobi</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillment('delivery')}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      fulfillment === 'delivery'
                        ? 'border-brass bg-brass/8 shadow-sm'
                        : 'border-line bg-white hover:border-espresso/25'
                    }`}
                  >
                    <Truck size={20} className={fulfillment === 'delivery' ? 'text-brass' : 'text-espresso/40'} />
                    <span>
                      <span className="block text-sm font-semibold text-espresso">Delivery</span>
                      <span className="mt-0.5 block text-xs text-espresso/55">FREE within Nairobi &amp; surroundings</span>
                    </span>
                  </button>
                </div>

                {/* Customer fields */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="order-name" className="mb-1.5 block text-sm font-medium text-espresso">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="order-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Wanjiku"
                      className={inputClass(!!errors.fullName)}
                    />
                    {errors.fullName && <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label htmlFor="order-phone" className="mb-1.5 block text-sm font-medium text-espresso">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="order-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0712 345678"
                      className={inputClass(!!errors.phone)}
                    />
                    {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  {fulfillment === 'delivery' && (
                    <div>
                      <label htmlFor="order-location" className="mb-1.5 block text-sm font-medium text-espresso">
                        Delivery Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="order-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. South B, Nairobi — near the shopping centre"
                        className={inputClass(!!errors.location)}
                      />
                      {errors.location && <p className="mt-1.5 text-xs text-red-500">{errors.location}</p>}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 py-4 text-[15px] font-bold text-white shadow-lg shadow-[#25D366]/30 transition-all duration-200 hover:bg-[#1eb857] active:scale-[0.98]"
                >
                  <Send size={18} />
                  Send Order via WhatsApp
                </button>
                <p className="mt-3 text-center text-xs text-espresso/45">
                  Pay on delivery available within Nairobi &amp; surroundings.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
