import { supabase } from "./supabase";
import { isSupabaseConfigured } from "./env";
import { requireFreshAdminSession } from "./auth";
import { sanitizeText } from "./validate";
import { getProducts, writeDemoProducts, PRODUCTS_CHANGED_EVENT } from "./products";
import {
  DEFAULT_CATEGORIES,
  type Category,
  type CategoryRecord,
  type Product,
} from "./types";

/**
 * Category data layer — mirrors the product layer architecture:
 * Supabase (RLS-enforced) in production, browser storage in demo mode.
 * No category is ever hard-coded into the UI; everything renders from here.
 */

export const CATEGORIES_CHANGED_EVENT = "rafna:categories-changed";
/** Products orphaned by a category deletion are safely moved here. */
export const UNCATEGORIZED: Category = "Uncategorized";

function notifyCategoriesChanged(): void {
  window.dispatchEvent(new Event(CATEGORIES_CHANGED_EVENT));
}
function notifyBoth(): void {
  notifyCategoriesChanged();
  window.dispatchEvent(new Event(PRODUCTS_CHANGED_EVENT));
}

const DEMO_CATEGORIES_KEY = "rafna_categories_v1";

function seedDemoCategories(): CategoryRecord[] {
  return DEFAULT_CATEGORIES.map((name, i) => ({
    id: `cat-seed-${i + 1}`,
    name,
    created_at: new Date(Date.UTC(2024, 4 + i, 1)).toISOString(),
  }));
}

function readDemoCategories(): CategoryRecord[] {
  try {
    const raw = localStorage.getItem(DEMO_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed as CategoryRecord[];
    }
  } catch {
    /* fall through to seeds */
  }
  const seeded = seedDemoCategories();
  try {
    localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(seeded));
  } catch {
    /* ignore */
  }
  return seeded;
}

function writeDemoCategories(categories: CategoryRecord[]): void {
  try {
    localStorage.setItem(DEMO_CATEGORIES_KEY, JSON.stringify(categories));
  } catch {
    /* ignore */
  }
}

function validName(raw: string): Category {
  const name = sanitizeText(raw).slice(0, 60);
  if (name.length < 2) {
    throw new Error("Category name must be at least 2 characters.");
  }
  return name;
}

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoryRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,created_at")
      .order("name", { ascending: true });
    if (error) {
      throw new Error("We couldn't load the categories right now.");
    }
    return (data ?? []) as CategoryRecord[];
  }
  return readDemoCategories();
}

// ─── Writes (admin only; RLS is the server-side authority) ───────────────────

export async function addCategory(rawName: string): Promise<CategoryRecord> {
  await requireFreshAdminSession();
  const name = validName(rawName);

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("categories")
      .insert({ name })
      .select()
      .single();
    if (error) {
      throw new Error(
        error.code === "23505"
          ? "A category with this name already exists."
          : "The category could not be saved. Please sign in again and retry.",
      );
    }
    notifyCategoriesChanged();
    return data as CategoryRecord;
  }

  const current = readDemoCategories();
  if (current.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("A category with this name already exists.");
  }
  const record: CategoryRecord = {
    id: crypto.randomUUID(),
    name,
    created_at: new Date().toISOString(),
  };
  writeDemoCategories([...current, record]);
  notifyCategoriesChanged();
  return record;
}

export async function renameCategory(
  id: string,
  rawName: string,
): Promise<CategoryRecord> {
  await requireFreshAdminSession();
  const name = validName(rawName);

  if (isSupabaseConfigured && supabase) {
    const { data: existing, error: fetchError } = await supabase
      .from("categories")
      .select("name")
      .eq("id", id)
      .maybeSingle();
    if (fetchError || !existing) throw new Error("Category not found.");
    const oldName = (existing as { name: string }).name;

    // Keep product labels in sync with the rename (update is limited to the
    // category column by the database — see supabase/schema.sql).
    if (oldName !== name) {
      const { error: moveError } = await supabase
        .from("products")
        .update({ category: name })
        .eq("category", oldName);
      if (moveError) {
        throw new Error(
          "The category could not be renamed. If you upgraded from an earlier version, re-run supabase/schema.sql first.",
        );
      }
    }
    const { data, error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      throw new Error(
        error.code === "23505"
          ? "A category with this name already exists."
          : "The category could not be renamed. Please sign in again and retry.",
      );
    }
    notifyBoth();
    return data as CategoryRecord;
  }

  const current = readDemoCategories();
  const target = current.find((c) => c.id === id);
  if (!target) throw new Error("Category not found.");
  if (
    current.some(
      (c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new Error("A category with this name already exists.");
  }
  const oldName = target.name;
  writeDemoCategories(
    current.map((c) => (c.id === id ? { ...c, name } : c)),
  );
  if (oldName !== name) {
    const products = await getProducts(); // materializes demo store if needed
    writeDemoProducts(
      products.map((p: Product) =>
        p.category === oldName ? { ...p, category: name } : p,
      ),
    );
  }
  notifyBoth();
  return { ...target, name };
}

export async function deleteCategory(id: string): Promise<void> {
  await requireFreshAdminSession();

  if (isSupabaseConfigured && supabase) {
    const { data: existing, error: fetchError } = await supabase
      .from("categories")
      .select("name")
      .eq("id", id)
      .maybeSingle();
    if (fetchError || !existing) throw new Error("Category not found.");
    const name = (existing as { name: string }).name;

    // Safety first: reassign this category's products BEFORE deleting it —
    // no product is ever removed by deleting a category.
    const { error: moveError } = await supabase
      .from("products")
      .update({ category: UNCATEGORIZED })
      .eq("category", name);
    if (moveError) {
      throw new Error(
        "Products could not be reassigned, so the category was NOT deleted. If you upgraded from an earlier version, re-run supabase/schema.sql first.",
      );
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      throw new Error(
        "The category could not be deleted. Please sign in again and retry.",
      );
    }
    notifyBoth();
    return;
  }

  const current = readDemoCategories();
  const target = current.find((c) => c.id === id);
  if (!target) throw new Error("Category not found.");
  writeDemoCategories(current.filter((c) => c.id !== id));
  const products = await getProducts();
  writeDemoProducts(
    products.map((p: Product) =>
      p.category === target.name ? { ...p, category: UNCATEGORIZED } : p,
    ),
  );
  notifyBoth();
}
