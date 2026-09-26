import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2, Plus, Upload, X } from "lucide-react";
import {
  CATEGORIES_CHANGED_EVENT,
  getCategories,
} from "../../lib/categories";
import {
  addProduct,
  uploadProductImage,
  validateImageFile,
} from "../../lib/products";
import {
  sanitizeText,
  validateProductFields,
  type ProductErrors,
  type ProductFields,
} from "../../lib/validate";
import type { CategoryRecord } from "../../lib/types";

interface ProductFormProps {
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}

const EMPTY: ProductFields = {
  title: "",
  category: "",
  price: "",
  description: "",
  imageUrl: "",
};

const fieldBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-espresso-900 placeholder-espresso-300 transition-colors focus:border-gold-500 focus:outline-none";
const labelClass =
  "text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso-600";
const errorClass = "mt-1.5 text-xs font-medium text-clay-600";

export default function ProductForm({ onSaved, onError }: ProductFormProps) {
  const [fields, setFields] = useState<ProductFields>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">(
    "idle",
  );
  const busy = status !== "idle";

  // Live, backend-managed category list (updates instantly when the
  // Categories manager below creates / renames / deletes).
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await getCategories();
        if (active) setCategories(list);
      } catch {
        /* validation below blocks unsafe submissions if load failed */
      } finally {
        if (active) setCategoriesLoaded(true);
      }
    };
    void load();
    const handler = () => void load();
    window.addEventListener(CATEGORIES_CHANGED_EVENT, handler);
    return () => {
      active = false;
      window.removeEventListener(CATEGORIES_CHANGED_EVENT, handler);
    };
  }, []);

  // Release preview object URLs
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const set = (patch: Partial<ProductFields>) => {
    setFields((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        // map form keys to error keys (imageUrl → image)
        const errorKey = key === "imageUrl" ? "image" : key;
        delete (next as Record<string, unknown>)[errorKey];
      }
      return next;
    });
  };

  const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0] ?? null;
    if (!chosen) return;
    const problem = validateImageFile(chosen); // type + 8MB size gate
    if (problem) {
      setErrors((prev) => ({ ...prev, image: problem }));
      setFile(null);
      setPreview(null);
      e.target.value = "";
      return;
    }
    setErrors((prev) => ({ ...prev, image: undefined }));
    if (preview) URL.revokeObjectURL(preview);
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const found = validateProductFields(
      fields,
      Boolean(file),
      categories.map((c) => c.name),
    );
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    try {
      let imageUrl = fields.imageUrl.trim();
      if (file) {
        setStatus("uploading");
        imageUrl = await uploadProductImage(file);
      }
      setStatus("saving");
      const created = await addProduct({
        title: sanitizeText(fields.title),
        category: fields.category, // validated against the live category list
        price: Math.round(Number(fields.price)),
        description: sanitizeText(fields.description),
        image_url: imageUrl,
      });
      onSaved(`“${created.title}” is now live on the shop page.`);
      setFields(EMPTY);
      clearFile();
      setErrors({});
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setStatus("idle");
    }
  };

  const border = (hasError: boolean) =>
    hasError ? "border-clay-600" : "border-espresso-900/15";

  return (
    <section
      aria-labelledby="add-product-heading"
      className="rounded-3xl border border-espresso-900/10 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="flex items-center gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-500/15 text-gold-600">
          <Plus className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2
            id="add-product-heading"
            className="font-display text-2xl font-semibold text-espresso-900"
          >
            Add New Product
          </h2>
          <p className="text-xs text-espresso-400">
            New items appear on the live shop immediately.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="pf-title" className={labelClass}>
            Title <span className="text-clay-600">*</span>
          </label>
          <input
            id="pf-title"
            type="text"
            maxLength={140}
            placeholder="e.g. Royal Rest Spring Mattress 6×6"
            value={fields.title}
            onChange={(e) => set({ title: e.target.value })}
            aria-invalid={Boolean(errors.title)}
            className={`mt-2 ${fieldBase} ${border(Boolean(errors.title))}`}
          />
          {errors.title && <p className={errorClass}>{errors.title}</p>}
        </div>

        {/* Category + price */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-category" className={labelClass}>
              Category <span className="text-clay-600">*</span>
            </label>
            <select
              id="pf-category"
              value={fields.category}
              onChange={(e) => set({ category: e.target.value })}
              disabled={categoriesLoaded && categories.length === 0}
              aria-invalid={Boolean(errors.category)}
              className={`mt-2 ${fieldBase} ${border(Boolean(errors.category))} ${
                fields.category ? "" : "text-espresso-300"
              } disabled:opacity-60`}
            >
              <option value="" disabled>
                {!categoriesLoaded
                  ? "Loading categories…"
                  : categories.length === 0
                    ? "No categories yet"
                    : "Select category"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className={errorClass}>{errors.category}</p>
            ) : (
              categoriesLoaded &&
              categories.length === 0 && (
                <p className="mt-1.5 text-xs text-gold-700">
                  Create your first category in the Categories manager below.
                </p>
              )
            )}
          </div>
          <div>
            <label htmlFor="pf-price" className={labelClass}>
              Price (KES) <span className="text-clay-600">*</span>
            </label>
            <input
              id="pf-price"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="e.g. 48500"
              value={fields.price}
              onChange={(e) => set({ price: e.target.value })}
              aria-invalid={Boolean(errors.price)}
              className={`mt-2 ${fieldBase} ${border(Boolean(errors.price))}`}
            />
            {errors.price && <p className={errorClass}>{errors.price}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="pf-description" className={labelClass}>
            Description <span className="text-clay-600">*</span>
          </label>
          <textarea
            id="pf-description"
            rows={4}
            maxLength={1000}
            placeholder="A short, persuasive sentence or two about the product…"
            value={fields.description}
            onChange={(e) => set({ description: e.target.value })}
            aria-invalid={Boolean(errors.description)}
            className={`mt-2 resize-none ${fieldBase} ${border(Boolean(errors.description))}`}
          />
          <div className="mt-1.5 flex items-center justify-between">
            {errors.description ? (
              <p className={errorClass.replace("mt-1.5 ", "")}>
                {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span className="text-[10px] text-espresso-300">
              {fields.description.length}/1000
            </span>
          </div>
        </div>

        {/* Photo upload — real file picker, works from phone or computer */}
        <div>
          <span className={labelClass}>
            Product Photo <span className="text-clay-600">*</span>
          </span>
          <div className="relative mt-2">
            <label
              htmlFor="pf-image"
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                errors.image
                  ? "border-clay-600/60 bg-clay-100/40"
                  : "border-espresso-900/20 bg-cream-100/60 hover:border-gold-500 hover:bg-gold-100/40"
              }`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Selected product photo preview"
                  className="h-36 w-full rounded-lg object-cover"
                />
              ) : (
                <>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-gold-600 shadow-sm">
                    <Upload className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-espresso-700">
                    Tap to upload a product photo
                  </span>
                  <span className="text-xs text-espresso-400">
                    JPG, PNG, WebP or GIF · up to 8 MB
                  </span>
                </>
              )}
              {preview && (
                <span className="text-xs text-espresso-400">
                  Tap the photo to choose a different one
                </span>
              )}
            </label>
            <input
              id="pf-image"
              type="file"
              accept="image/*"
              onChange={pickFile}
              className="sr-only"
              aria-describedby={errors.image ? "pf-image-error" : undefined}
            />
            {preview && (
              <button
                type="button"
                onClick={clearFile}
                aria-label="Remove selected photo"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-espresso-950/70 text-cream-50 transition-colors hover:bg-espresso-950"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
          {errors.image && (
            <p id="pf-image-error" className={errorClass}>
              {errors.image}
            </p>
          )}
        </div>

        {/* Optional URL fallback */}
        <div>
          <label htmlFor="pf-image-url" className={labelClass}>
            Image URL{" "}
            <span className="font-normal normal-case tracking-normal text-espresso-400">
              (optional — used only when no photo is uploaded)
            </span>
          </label>
          <input
            id="pf-image-url"
            type="url"
            placeholder="https://…"
            value={fields.imageUrl}
            onChange={(e) => set({ imageUrl: e.target.value })}
            disabled={Boolean(file)}
            className={`mt-2 ${fieldBase} disabled:opacity-50 ${border(Boolean(errors.image && !file))}`}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso-900 px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-cream-50 transition-colors hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {status === "uploading"
            ? "Uploading photo…"
            : status === "saving"
              ? "Saving product…"
              : "Add Product"}
        </button>
      </form>
    </section>
  );
}
