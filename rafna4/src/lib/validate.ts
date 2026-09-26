import type { Category } from "./types";

/**
 * Client-side validation & sanitization. These are UX guards only —
 * server-side constraints (RLS + CHECK constraints) remain the authority.
 */

/** Strip characters that could be used for markup injection and tidy spaces. */
export const sanitizeText = (value: string): string =>
  value
    .replace(/[<>"`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ─── Order form ──────────────────────────────────────────────────────────────

export interface OrderInput {
  name: string;
  phone: string;
  fulfillment: "delivery" | "pickup";
  location: string;
}

export type OrderErrors = Partial<
  Record<"name" | "phone" | "location", string>
>;

/** Accepts 0712…, 011…, +254… and 254… Kenyan formats (spaces allowed). */
export function isValidKenyanPhone(phone: string): boolean {
  const compact = phone.replace(/[\s()+-]/g, "");
  return /^(?:254|0)(?:7|1)\d{8}$/.test(compact);
}

export function validateOrder(input: OrderInput): OrderErrors {
  const errors: OrderErrors = {};

  const name = sanitizeText(input.name);
  if (name.length < 2) {
    errors.name = "Please enter your full name.";
  } else if (name.length > 80) {
    errors.name = "Name must be 80 characters or fewer.";
  } else if (!/^[\p{L}][\p{L} .,'-]*$/u.test(name)) {
    errors.name = "Name can only contain letters, spaces and . ' -";
  }

  if (!isValidKenyanPhone(input.phone)) {
    errors.phone = "Enter a valid Kenyan number, e.g. 0712 345 678.";
  }

  // Location is ONLY required for delivery orders.
  if (input.fulfillment === "delivery") {
    const location = sanitizeText(input.location);
    if (location.length < 3) {
      errors.location = "Please enter your delivery location.";
    } else if (location.length > 120) {
      errors.location = "Location must be 120 characters or fewer.";
    }
  }

  return errors;
}

// ─── Category management ─────────────────────────────────────────────────────

/**
 * Validates a category name against the CURRENT list (never a hard-coded
 * list). `ignoreName` excludes the category being renamed from the
 * duplicate check.
 */
export function validateCategoryName(
  raw: string,
  existingNames: string[],
  ignoreName?: string,
): string | null {
  const name = sanitizeText(raw);
  if (name.length < 2) return "Category name must be at least 2 characters.";
  if (name.length > 60) return "Category name must be 60 characters or fewer.";
  if (!/^[\p{L}\p{N}](?:[\p{L}\p{N} '&().,-]*)$/u.test(name)) {
    return "Use letters, numbers, spaces and & ' ( ) - only.";
  }
  const lowered = name.toLowerCase();
  const duplicate = existingNames.some(
    (existing) =>
      existing.toLowerCase() === lowered &&
      (!ignoreName || existing.toLowerCase() !== ignoreName.toLowerCase()),
  );
  if (duplicate) return "A category with this name already exists.";
  return null;
}

// ─── Admin product form ──────────────────────────────────────────────────────

export interface ProductFields {
  title: string;
  category: string;
  price: string;
  description: string;
  imageUrl: string;
}

export type ProductErrors = Partial<
  Record<"title" | "category" | "price" | "description" | "image", string>
>;

export function validateProductFields(
  fields: ProductFields,
  hasFile: boolean,
  allowedCategories: Category[],
): ProductErrors {
  const errors: ProductErrors = {};

  const title = sanitizeText(fields.title);
  if (title.length < 2 || title.length > 120) {
    errors.title = "Enter a product title (2–120 characters).";
  }

  // Category must exist in the live, backend-managed list.
  if (allowedCategories.length === 0) {
    errors.category = "Create a category first (see Categories manager).";
  } else if (!allowedCategories.includes(fields.category)) {
    errors.category = "Choose a category.";
  }

  const price = Number(fields.price);
  if (!fields.price.trim() || !Number.isFinite(price) || price <= 0) {
    errors.price = "Enter a valid price in KES.";
  } else if (price > 5_000_000) {
    errors.price = "That price looks too high — please double-check.";
  }

  const description = sanitizeText(fields.description);
  if (description.length < 10) {
    errors.description = "Write a short description (at least 10 characters).";
  } else if (description.length > 1000) {
    errors.description = "Description must be 1000 characters or fewer.";
  }

  // A photo upload wins; the URL field is a fallback when no file is chosen.
  if (!hasFile) {
    const url = fields.imageUrl.trim();
    if (!url) {
      errors.image = "Upload a product photo, or paste an image URL.";
    } else if (!/^https?:\/\/\S+\.\S+/.test(url)) {
      errors.image = "That image URL doesn't look valid.";
    }
  }

  return errors;
}
