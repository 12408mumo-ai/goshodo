import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { formatKES } from '../lib/api';
import type { Product } from '../lib/api';
import { useShop } from '../lib/store';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { setCheckoutProduct, setDetailProduct } = useShop();

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-forest-950/10 bg-white shadow-[0_2px_16px_rgba(18,50,48,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(18,50,48,0.14)]"
    >
      <button
        type="button"
        onClick={() => setDetailProduct(product)}
        className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-ivory-100"
        aria-label={`View ${product.title}`}
      >
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/mattress-1.jpg';
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-forest-950/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-300 backdrop-blur-sm">
          {product.category}
        </span>
        {product.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-forest-950">
            Featured
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-5">
        <button type="button" onClick={() => setDetailProduct(product)} className="text-left">
          <h3 className="font-display text-lg font-bold leading-snug text-forest-950 transition-colors hover:text-forest-800">
            {product.title}
          </h3>
        </button>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-forest-950/60">{product.description}</p>
        )}
        <p className="mt-3 font-display text-xl font-bold text-forest-900">{formatKES(product.price)}</p>
        <div className="mt-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Free Nairobi delivery • Pay on delivery
        </div>
        <button
          type="button"
          onClick={() => setCheckoutProduct(product)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 px-5 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-ivory-50 transition-all hover:bg-forest-800 hover:shadow-lg active:scale-[0.98]"
        >
          Order Now
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
