import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import {
  addCategory,
  CATEGORIES_CHANGED_EVENT,
  deleteCategory,
  getCategories,
  renameCategory,
  UNCATEGORIZED,
} from "../../lib/categories";
import { getProducts, PRODUCTS_CHANGED_EVENT } from "../../lib/products";
import { validateCategoryName } from "../../lib/validate";
import type { ToastData } from "./Toast";
import type { CategoryRecord } from "../../lib/types";

interface CategoriesManagerProps {
  onToast: (toast: ToastData) => void;
}

const smallInput =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder-espresso-300 transition-colors focus:border-gold-500 focus:outline-none";
const iconButton =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors";

export default function CategoriesManager({ onToast }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<CategoryRecord[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<CategoryRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [cats, products] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      setCategories(cats);
      const tally: Record<string, number> = {};
      for (const p of products) {
        tally[p.category] = (tally[p.category] ?? 0) + 1;
      }
      setCounts(tally);
    } catch (err) {
      setCategories([]);
      setLoadError(
        err instanceof Error
          ? err.message
          : "Categories could not be loaded.",
      );
    }
  }, []);

  useEffect(() => {
    void load();
    const handler = () => void load();
    window.addEventListener(CATEGORIES_CHANGED_EVENT, handler);
    window.addEventListener(PRODUCTS_CHANGED_EVENT, handler);
    return () => {
      window.removeEventListener(CATEGORIES_CHANGED_EVENT, handler);
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, handler);
    };
  }, [load]);

  const names = (categories ?? []).map((c) => c.name);
  const countFor = (name: string) => counts[name] ?? 0;

  // ── Create ────────────────────────────────────────────────────────────────
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (adding) return;
    const problem = validateCategoryName(newName, names);
    setAddError(problem);
    if (problem) return;
    setAdding(true);
    try {
      const created = await addCategory(newName);
      setNewName("");
      onToast({
        type: "success",
        text: `“${created.name}” was added — it's now available in the shop and the product form.`,
      });
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : "The category could not be added.",
      );
    } finally {
      setAdding(false);
    }
  };

  // ── Rename (inline) ───────────────────────────────────────────────────────
  const startEdit = (category: CategoryRecord) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editingId || savingEdit) return;
    const current = categories?.find((c) => c.id === editingId);
    if (!current) return;
    const problem = validateCategoryName(editingName, names, current.name);
    setEditError(problem);
    if (problem) return;
    if (editingName.trim() === current.name) {
      cancelEdit();
      return;
    }
    setSavingEdit(true);
    try {
      const renamed = await renameCategory(editingId, editingName);
      onToast({
        type: "success",
        text: countFor(current.name)
          ? `Renamed to “${renamed.name}” — ${countFor(current.name)} product${countFor(current.name) === 1 ? "" : "s"} updated automatically.`
          : `Category renamed to “${renamed.name}”.`,
      });
      cancelEdit();
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "The category could not be renamed.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Delete (products are reassigned, never deleted) ───────────────────────
  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    const affected = countFor(pendingDelete.name);
    setDeleting(true);
    try {
      await deleteCategory(pendingDelete.id);
      onToast({
        type: "success",
        text:
          affected > 0
            ? `“${pendingDelete.name}” was deleted — ${affected} product${affected === 1 ? "" : "s"} safely moved to “${UNCATEGORIZED}”.`
            : `“${pendingDelete.name}” was deleted.`,
      });
    } catch (err) {
      onToast({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "The category could not be deleted. Please try again.",
      });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const pendingCount = pendingDelete ? countFor(pendingDelete.name) : 0;

  return (
    <section
      aria-labelledby="categories-heading"
      className="rounded-3xl border border-espresso-900/10 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-600">
            <Tags className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2
              id="categories-heading"
              className="font-display text-2xl font-semibold text-espresso-900"
            >
              Categories
            </h2>
            <p className="text-xs text-espresso-400">
              {categories === null
                ? "Loading…"
                : `${categories.length} categor${categories.length === 1 ? "y" : "ies"} · shown live on the site`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          aria-label="Refresh categories"
          className={`${iconButton} border-espresso-900/15 text-espresso-600 hover:border-espresso-900/40 hover:text-espresso-900`}
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Add new category */}
      <form onSubmit={(e) => void handleAdd(e)} className="mt-6" noValidate>
        <label
          htmlFor="cat-new"
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-600"
        >
          New Category
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="cat-new"
            type="text"
            maxLength={70}
            placeholder="e.g. Bed Frames"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setAddError(null);
            }}
            aria-invalid={Boolean(addError)}
            aria-describedby={addError ? "cat-new-error" : undefined}
            className={`${smallInput} flex-1 ${addError ? "border-clay-600" : "border-espresso-900/15"}`}
          />
          <button
            type="submit"
            disabled={adding}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-espresso-900 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-cream-50 transition-colors hover:bg-gold-600 disabled:opacity-60"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            Add
          </button>
        </div>
        {addError && (
          <p
            id="cat-new-error"
            className="mt-1.5 text-xs font-medium text-clay-600"
          >
            {addError}
          </p>
        )}
      </form>

      {/* Category list */}
      <div className="mt-6">
        {loadError ? (
          <div className="rounded-2xl border border-clay-600/25 bg-cream-50 p-6 text-center">
            <AlertCircle
              className="mx-auto h-7 w-7 text-clay-600"
              aria-hidden
            />
            <p className="mt-2 text-sm text-espresso-500">{loadError}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-full bg-espresso-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50"
            >
              Retry
            </button>
          </div>
        ) : categories === null ? (
          <ul className="space-y-2.5" aria-hidden>
            {Array.from({ length: 3 }, (_, i) => (
              <li
                key={i}
                className="h-14 animate-pulse rounded-xl border border-espresso-900/10 bg-cream-100"
              />
            ))}
          </ul>
        ) : categories.length === 0 ? (
          <p className="rounded-2xl border border-espresso-900/10 bg-cream-50 p-6 text-center text-sm text-espresso-500">
            No categories yet — add your first one above.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center gap-3 rounded-xl border border-espresso-900/10 bg-cream-50 px-4 py-3"
              >
                {editingId === category.id ? (
                  /* ── Inline rename ── */
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        maxLength={70}
                        autoFocus
                        aria-label={`Rename ${category.name}`}
                        aria-invalid={Boolean(editError)}
                        onChange={(e) => {
                          setEditingName(e.target.value);
                          setEditError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void saveEdit();
                          }
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className={`${smallInput} flex-1 py-2 ${editError ? "border-clay-600" : "border-espresso-900/20"}`}
                      />
                      <button
                        type="button"
                        onClick={() => void saveEdit()}
                        disabled={savingEdit}
                        aria-label="Save category name"
                        className={`${iconButton} border-forest-500/40 text-forest-700 hover:bg-forest-100 disabled:opacity-60`}
                      >
                        {savingEdit ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden
                          />
                        ) : (
                          <Check className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        aria-label="Cancel rename"
                        className={`${iconButton} border-espresso-900/15 text-espresso-500 hover:border-espresso-900/40 disabled:opacity-60`}
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    {editError && (
                      <p className="text-xs font-medium text-clay-600">
                        {editError}
                      </p>
                    )}
                  </div>
                ) : (
                  /* ── Display row ── */
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-espresso-900">
                        {category.name}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-espresso-400">
                        {countFor(category.name)} product
                        {countFor(category.name) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      aria-label={`Edit ${category.name}`}
                      className={`${iconButton} border-espresso-900/15 text-espresso-500 hover:border-gold-500 hover:bg-gold-100/60 hover:text-gold-700`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(category)}
                      aria-label={`Delete ${category.name}`}
                      className={`${iconButton} border-clay-600/30 text-clay-600 hover:bg-clay-600 hover:text-cream-50`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs leading-relaxed text-espresso-400">
          Renaming updates its products automatically. Deleting a category
          never deletes products — they move to “{UNCATEGORIZED}”.
        </p>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {pendingDelete && (
          <div
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm category deletion"
          >
            <motion.button
              type="button"
              aria-label="Cancel deletion"
              className="absolute inset-0 cursor-default bg-espresso-950/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setPendingDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md rounded-3xl bg-cream-50 p-8 text-center shadow-lift"
            >
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-clay-100 text-clay-600">
                <Trash2 className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-espresso-900">
                Delete this category?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-espresso-500">
                <span className="font-semibold text-espresso-800">
                  “{pendingDelete.name}”
                </span>{" "}
                will be removed.
                {pendingCount > 0 ? (
                  <>
                    {" "}
                    Its {pendingCount} product{pendingCount === 1 ? "" : "s"}{" "}
                    will <span className="font-semibold">not</span> be deleted —
                    {pendingCount === 1 ? " it" : " they"} will move to “
                    {UNCATEGORIZED}”.
                  </>
                ) : (
                  " No products use it, so nothing else changes."
                )}
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setPendingDelete(null)}
                  className="rounded-full border border-espresso-900/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-espresso-700 transition-colors hover:border-espresso-900/50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void confirmDelete()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-clay-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cream-50 transition-colors hover:bg-espresso-900 disabled:opacity-60"
                >
                  {deleting && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  )}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
