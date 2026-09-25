import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, MapPin, Phone, ShieldCheck, Truck, X } from 'lucide-react';
import { EMAIL, PHONE_DISPLAY, WHATSAPP_NUMBER, formatKES } from '../lib/api';
import { useShop } from '../lib/store';

export default function ProductModal() {
  const { detailProduct: product, setDetailProduct, setCheckoutProduct } = useShop();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailProduct(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setDetailProduct]);

  useEffect(() => {
    document.body.style.overflow = product ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setDetailProduct(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl md:grid-cols-2"
          >
            <button
              type="button"
              onClick={() => setDetailProduct(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-forest-950/80 text-white backdrop-blur transition hover:bg-forest-950"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[4/3] w-full bg-ivory-100 md:aspect-auto md:min-h-[480px]">
              <img
                src={product.image_url}
                alt={product.title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/mattress-1.jpg';
                }}
              />
              <span className="absolute left-4 top-4 rounded-full bg-forest-950/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-300 backdrop-blur-sm">
                {product.category}
              </span>
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold leading-tight text-forest-950 sm:text-3xl">
                {product.title}
              </h2>
              <p className="mt-3 font-display text-2xl font-bold text-gold-600 sm:text-3xl">
                {formatKES(product.price)}
              </p>
              <div className="mt-2 h-px w-16 bg-gold-500" />
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-forest-950/70 sm:text-[15px]">
                {product.description || 'Premium quality product from Rafna Investment — inspected, genuine and backed by our trusted Kamkunji showroom.'}
              </p>

              <ul className="mt-6 space-y-3 rounded-2xl bg-ivory-50 p-4 text-sm text-forest-950/80">
                <li className="flex items-center gap-3">
                  <Truck className="h-4 w-4 shrink-0 text-gold-600" />
                  Free delivery within Nairobi &amp; surroundings
                </li>
                <li className="flex items-center gap-3">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-gold-600" />
                  Pay on Delivery available
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-gold-600" />
                  Shop pickup: Kamkunji, Nairobi
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-gold-600" />
                  Genuine quality guarantee
                </li>
              </ul>

              <button
                type="button"
                onClick={() => {
                  setDetailProduct(null);
                  setCheckoutProduct(product);
                }}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-ivory-50 transition-all hover:bg-forest-800 hover:shadow-lg active:scale-[0.98]"
              >
                Order Now
              </button>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Rafna Investment! I have a question about: ${product.title} (${formatKES(product.price)})`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-emerald-800 transition hover:bg-emerald-100"
                >
                  WhatsApp Us
                </a>
                <a
                  href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-950/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-forest-950 transition hover:bg-forest-950/5"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call Us
                </a>
              </div>
              <p className="mt-4 text-center text-xs text-forest-950/50">Questions? Email us at {EMAIL}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
