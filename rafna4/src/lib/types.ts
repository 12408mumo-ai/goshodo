/**
 * Categories are now dynamic records persisted in the backend
 * (Supabase `categories` table, or browser storage in demo mode).
 * Defaults below seed the database on first setup — nothing in the
 * storefront or admin is hard-coded to a fixed category list.
 */
export type Category = string;

export interface CategoryRecord {
  id: string;
  name: Category;
  created_at: string;
}

/** Shipped defaults — inserted once by supabase/schema.sql / demo seeding. */
export const DEFAULT_CATEGORIES: Category[] = [
  "Orthopaedic Mattresses",
  "Beddings",
  "Households",
];

export interface Product {
  id: string;
  title: string;
  category: Category;
  price: number;
  description: string;
  image_url: string;
  created_at: string;
}

export interface NewProduct {
  title: string;
  category: Category;
  price: number;
  description: string;
  image_url: string;
}
