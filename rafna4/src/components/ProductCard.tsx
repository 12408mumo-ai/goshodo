import { ArrowRight } from "lucide-react";
import ProductImage from "./ProductImage";
import type { Product } from "../lib/types";
import { formatKES } from "../lib/format";

interface ProductCardProps {
  product: Product;
  onOrder: (product: Product) => void;
}

export default function ProductCard({ product, onOrder }: ProductCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-espresso-900/10 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
        <ProductImage
          product={product}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-cream-50/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-700 shadow-sm">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-espresso-900">
          {product.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-espresso-500">
          {product.description}
        </p>
        <div className="mt-4 flex items-baseline justify-between border-t border-espresso-900/10 pt-4">
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-espresso-400">
            Price
          </span>
          <span className="font-display text-xl font-semibold text-espresso-900">
            {formatKES(product.price)}
          </span>
        </div>
        {/* Single primary action — orders are confirmed personally on WhatsApp */}
        <button
          type="button"
          onClick={() => onOrder(product)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-cream-50 transition-colors hover:bg-gold-600"
        >
          Order Now
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </article>
  );
}
