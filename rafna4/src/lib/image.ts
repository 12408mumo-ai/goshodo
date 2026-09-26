import type { Category } from "./types";

/**
 * Product image URL hygiene
 * ─────────────────────────
 * Product photos originate from three sources:
 *   1. Supabase Storage / any HTTPS URL → persistent production value,
 *      ALWAYS used exactly as-is (never re-encoded to base64).
 *   2. Bundled local assets ("/images/…") → used as-is.
 *   3. Demo-mode uploads → complete "data:image/…;base64,…" URIs that must
 *      be preserved FULLY (truncation breaks them with net::ERR_INVALID_URL).
 *
 * Corruption guards applied here:
 *   - duplicated "data:image/…;base64," prefixes are collapsed to one
 *   - bare base64 JPEG payloads ("/9j/…") missing their prefix are repaired
 *   - truncated/otherwise invalid data URIs and junk values return null so
 *     callers can substitute a real category photo instead of a broken <img>
 */

export const CATEGORY_FALLBACK_IMAGE: Record<Category, string> = {
  "Orthopaedic Mattresses": "/images/products/mattress-royal.jpg",
  Beddings: "/images/products/bedding-duvet.jpg",
  Households: "/images/products/household-storage.jpg",
};

export const GENERIC_FALLBACK_IMAGE = "/images/hero.jpg";

const DATA_IMAGE_URI_RE =
  /^data:image\/(?:jpeg|jpg|png|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i;

/** Keep the LAST "data:image/…" occurrence — collapses duplicated prefixes. */
function stripDuplicateDataPrefixes(value: string): string {
  const last = value.toLowerCase().lastIndexOf("data:image/");
  return last > 0 ? value.slice(last) : value;
}

export function isValidDataImageUri(value: string): boolean {
  // Real images are never tiny; 8MB ceiling keeps pathological strings out.
  if (value.length < 64 || value.length > 8_000_000) return false;
  return DATA_IMAGE_URI_RE.test(value);
}

/**
 * Returns a safe, render-ready image source, or null when the value cannot
 * be trusted. Valid HTTPS / local / data-URI inputs are returned untouched.
 */
export function normalizeImageUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let value = raw.trim();
  if (!value) return null;

  // Complete data URI (demo-mode uploads) — preserve in full.
  if (value.toLowerCase().startsWith("data:")) {
    value = stripDuplicateDataPrefixes(value);
    return isValidDataImageUri(value) ? value : null;
  }

  // Persistent remote URL (Supabase Storage etc.) — never convert to base64.
  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).href;
    } catch {
      return null;
    }
  }

  // Bundled asset.
  if (value.startsWith("/")) return value;

  // Bare base64 JPEG payload missing its prefix → repair.
  if (value.startsWith("/9j/") && /^[a-z0-9+/=\s]+$/i.test(value)) {
    const repaired = `data:image/jpeg;base64,${value}`;
    return isValidDataImageUri(repaired) ? repaired : null;
  }

  return null;
}

/** True for storage-backed / bundled sources that survive across devices. */
export function isPersistentImageUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith("/");
}

/** Safe <img> src for a product — real category photo instead of a broken tile. */
export function resolveProductImage(product: {
  image_url: string;
  category: Category;
}): string {
  return (
    normalizeImageUrl(product.image_url) ??
    CATEGORY_FALLBACK_IMAGE[product.category] ??
    GENERIC_FALLBACK_IMAGE
  );
}

/**
 * Repair pass for stored products (idempotent): legit values pass through
 * unchanged; corrupted ones are normalized or replaced with a real photo.
 */
export function repairProductImage<
  T extends { image_url: string; category: Category },
>(product: T): { product: T; changed: boolean } {
  const stored = typeof product.image_url === "string" ? product.image_url : "";
  const normalized = normalizeImageUrl(stored);
  if (normalized !== null && normalized === stored.trim()) {
    return { product, changed: false };
  }
  const image_url =
    normalized ??
    CATEGORY_FALLBACK_IMAGE[product.category] ??
    GENERIC_FALLBACK_IMAGE;
  return { product: { ...product, image_url }, changed: true };
}
