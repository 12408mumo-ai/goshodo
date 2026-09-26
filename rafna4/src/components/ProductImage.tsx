import { useEffect, useState, type ImgHTMLAttributes } from "react";
import type { Product } from "../lib/types";
import {
  CATEGORY_FALLBACK_IMAGE,
  GENERIC_FALLBACK_IMAGE,
  resolveProductImage,
} from "../lib/image";

interface ProductImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  product: Pick<Product, "image_url" | "category" | "title">;
  className?: string;
}

/**
 * Validated product image. The source is normalized before rendering, and a
 * runtime load failure swaps in the category's real photo (never a broken
 * image or grey placeholder). Identical behavior in preview and production.
 */
export default function ProductImage({
  product,
  className,
  ...rest
}: ProductImageProps) {
  const safeSrc = resolveProductImage(product);
  const [src, setSrc] = useState(safeSrc);
  const [fellBack, setFellBack] = useState(false);

  useEffect(() => {
    setSrc(safeSrc);
    setFellBack(false);
  }, [safeSrc]);

  return (
    <img
      src={src}
      alt={product.title}
      onError={() => {
        if (fellBack) return; // guard against error loops
        setFellBack(true);
        setSrc(
          CATEGORY_FALLBACK_IMAGE[product.category] ?? GENERIC_FALLBACK_IMAGE,
        );
      }}
      className={className}
      {...rest}
    />
  );
}
