import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { formatKES, type Product } from '../lib/config';

interface Props {
  product: Product;
  onOrder: (product: Product) => void;
  index?: number;
}

export default function ProductCard({ product, onOrder, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.5), ease: 'easeOut' }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-espresso/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-espresso/85 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-cream backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-espresso">
          {product.title}
        </h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-espresso/60">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-espresso/45">Price</p>
            <p className="font-display text-xl font-bold text-brass-dark">{formatKES(product.price)}</p>
          </div>
        </div>

        <button
          onClick={() => onOrder(product)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-espresso px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cream transition-all duration-200 hover:bg-brass hover:shadow-lg hover:shadow-brass/30 active:scale-[0.98]"
        >
          <ShoppingBag size={16} />
          Order Now
        </button>
      </div>
    </motion.article>
  );
}
