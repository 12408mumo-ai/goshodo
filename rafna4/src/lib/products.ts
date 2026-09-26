import { supabase } from "./supabase";
import { isSupabaseConfigured } from "./env";
import { requireFreshAdminSession } from "./auth";
import { sanitizeText } from "./validate";
import { normalizeImageUrl, repairProductImage } from "./image";
import { seedProducts } from "../data/products";
import type { Category, NewProduct, Product } from "./types";

/**
 * Product data layer.
 * - Public reads hit Supabase with the anon key → RLS allows SELECT only.
 * - Writes re-verify the admin session and rely on RLS as the authority.
 * - When Supabase env vars are absent the app runs in demo mode on top of
 *   browser storage (seeded with the sample catalogue).
 */

export const PRODUCTS_CHANGED_EVENT = "rafna:products-changed";

function notifyProductsChanged(): void {
  window.dispatchEvent(new Event(PRODUCTS_CHANGED_EVENT));
}

const DEMO_STORE_KEY = "rafna_products_v1";
export const IMAGE_BUCKET = "product-images";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,category,price,description,image_url,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      throw new Error(
        "We couldn't load the collection right now. Please try again.",
      );
    }
    return (data ?? []) as Product[];
  }
  try {
    const raw = localStorage.getItem(DEMO_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        // Repair-on-read: normalize every stored image reference and fix any
        // rows previously corrupted (e.g. truncated/duplicated data URIs).
        let dirty = false;
        const repaired = parsed.map((entry) => {
          const item = entry as Product;
          if (!item || typeof item.image_url !== "string") return item;
          const { product, changed } = repairProductImage(item);
          if (changed) dirty = true;
          return product;
        });
        if (dirty) {
          try {
            localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(repaired));
          } catch {
            /* persistence of the repair is best-effort */
          }
        }
        return repaired;
      }
    }
  } catch {
    // Corrupted store → discard it and fall back to the seed catalogue.
    try {
      localStorage.removeItem(DEMO_STORE_KEY);
    } catch {
      /* ignore */
    }
  }
  return seedProducts;
}

/** Persist the demo catalogue (used when category edits reassign products). */
export function writeDemoProducts(products: Product[]): void {
  try {
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(products));
  } catch {
    /* best effort — demo storage may be full */
  }
}

// ─── Image uploads ───────────────────────────────────────────────────────────

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file (JPG, PNG, WebP or GIF).";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "That image is larger than 8 MB. Please choose a smaller photo.";
  }
  return null;
}

export async function uploadProductImage(file: File): Promise<string> {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);

  if (isSupabaseConfigured && supabase) {
    await requireFreshAdminSession();
    // Collision-proof, date-organised object name.
    const ext = (file.type.split("/")[1] || "jpg")
      .replace("jpeg", "jpg")
      .replace(/[^a-z0-9]/g, "");
    const day = new Date().toISOString().slice(0, 10);
    const path = `products/${day}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
    if (error) {
      throw new Error(
        "The photo could not be uploaded. Please confirm the storage bucket and policies are configured, then try again.",
      );
    }
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  // Demo mode: compress and keep a data URL in browser storage.
  return fileToDataUrl(file);
}

// ─── Writes (admin only — RLS is the server-side authority) ──────────────────

export async function addProduct(input: NewProduct): Promise<Product> {
  await requireFreshAdminSession();

  // Sanitize again before persistence (defense in depth).
  // Image: validate/normalize FIRST. Complete data URIs are preserved in
  // full — truncating them produces net::ERR_INVALID_URL. Remote HTTPS URLs
  // are length-capped (the DB column allows 2000 chars) and never base64'd.
  const normalizedImage = normalizeImageUrl(input.image_url);
  if (!normalizedImage) {
    throw new Error(
      "The product image is not valid. Please upload a photo or paste a valid image URL.",
    );
  }
  const record = {
    title: sanitizeText(input.title).slice(0, 120),
    category: input.category as Category,
    price: Math.round(input.price),
    description: sanitizeText(input.description).slice(0, 1000),
    image_url: normalizedImage.startsWith("data:")
      ? normalizedImage
      : normalizedImage.slice(0, 2000),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("products")
      .insert(record)
      .select()
      .single();
    if (error) {
      throw new Error(
        "The product could not be saved. Please sign in again and retry.",
      );
    }
    notifyProductsChanged();
    return data as Product;
  }

  const product: Product = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...record,
  };
  const current = await getProducts();
  try {
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify([product, ...current]));
  } catch {
    throw new Error(
      "This browser's demo storage is full. Connect Supabase for durable product storage.",
    );
  }
  notifyProductsChanged();
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  await requireFreshAdminSession();

  if (isSupabaseConfigured && supabase) {
    // Fetch first so we can also remove the photo from storage (best-effort).
    const { data: row } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      throw new Error(
        "The product could not be deleted. Please sign in again and retry.",
      );
    }

    const url = (row as { image_url?: string } | null)?.image_url;
    const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
    if (url && url.includes(marker)) {
      const path = decodeURIComponent(
        url.slice(url.indexOf(marker) + marker.length),
      );
      await supabase.storage.from(IMAGE_BUCKET).remove([path]);
    }
  } else {
    const current = await getProducts();
    try {
      localStorage.setItem(
        DEMO_STORE_KEY,
        JSON.stringify(current.filter((p) => p.id !== id)),
      );
    } catch {
      /* ignore */
    }
  }
  notifyProductsChanged();
}

/**
 * Compress a photo to a COMPLETE, validated JPEG data URI (demo-mode only —
 * production uploads go to Supabase Storage and return persistent HTTPS URLs).
 * Compression steps down until the URI fits comfortably in browser storage.
 */
function fileToDataUrl(file: File): Promise<string> {
  const attempts = [
    { maxDim: 1400, quality: 0.82 },
    { maxDim: 1100, quality: 0.72 },
    { maxDim: 900, quality: 0.62 },
  ] as const;
  const MAX_DATA_URI_CHARS = 1_800_000; // ~1.35MB payload, localStorage-safe

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        let result = "";
        for (const { maxDim, quality } of attempts) {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Image processing is unavailable.");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          result = canvas.toDataURL("image/jpeg", quality);
          if (result.length <= MAX_DATA_URI_CHARS) break;
        }
        URL.revokeObjectURL(objectUrl);

        if (result.length > MAX_DATA_URI_CHARS) {
          throw new Error(
            "That photo is too detailed for browser storage. Please choose a smaller image or paste an image URL.",
          );
        }
        // Never store a truncated, duplicated or malformed data URI.
        const checked = normalizeImageUrl(result);
        if (!checked) {
          throw new Error(
            "The photo could not be processed. Please try a different image.",
          );
        }
        resolve(checked);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err instanceof Error ? err : new Error("Image upload failed."));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The selected file could not be read as an image."));
    };
    img.src = objectUrl;
  });
}
