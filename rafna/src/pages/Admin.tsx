import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  LogOut,
  Plus,
  Pencil,
  X,
  Trash2,
  ImagePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CATEGORIES, formatKES, type Product } from '../lib/config';

const SESSION_KEY = 'rafna_admin_key';
const ADMIN_PASSWORD = 'Rafna2026!';
const MAX_IMAGE_MB = 3;

export default function Admin() {
  const [adminKey, setAdminKey] = useState<string | null>(
    () => sessionStorage.getItem(SESSION_KEY)
  );

  if (!adminKey) {
    return <AdminLogin onSuccess={(key) => setAdminKey(key)} />;
  }

  return (
    <AdminDashboard
      adminKey={adminKey}
      onLogout={() => {
        sessionStorage.removeItem(SESSION_KEY);
        setAdminKey(null);
      }}
    />
  );
}

/* ================= LOGIN ================= */

function AdminLogin({ onSuccess }: { onSuccess: (key: string) => void }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, password);
      onSuccess(password);
    } else {
      setError('Incorrect password. Access denied.');
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-xl shadow-espresso/5 sm:p-10"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-espresso">
          <Lock size={24} className="text-brass-light" />
        </div>
        <h1 className="mt-6 text-center font-display text-2xl font-semibold text-espresso">
          Admin Access
        </h1>
        <p className="mt-2 text-center text-sm text-espresso/55">
          This area is restricted to Rafna Investment staff. Enter the admin password to manage the
          shop.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <label htmlFor="admin-pass" className="mb-1.5 block text-sm font-medium text-espresso">
            Admin Password
          </label>
          <div className="relative">
            <input
              id="admin-pass"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password"
              autoFocus
              className={`w-full rounded-xl border bg-ivory px-4 py-3 pr-12 text-[15px] text-espresso outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20 ${
                error ? 'border-red-400' : 'border-line'
              }`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-espresso px-5 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-brass active:scale-[0.99]"
          >
            Unlock Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function AdminDashboard({ adminKey, onLogout }: { adminKey: string; onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [catError, setCatError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setFetchError('Could not load products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data.map((c: { name: string }) => c.name));
      }
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (!name) {
      setCatError('Enter a category name');
      return;
    }
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setCatError('That category already exists');
      return;
    }
    setAddingCat(true);
    setCatError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add category');
      }
      await fetchCategories();
      setCategory(name);
      setNewCatName('');
      setShowCatInput(false);
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setAddingCat(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory(categories[0] || CATEGORIES[0]);
    setPrice('');
    setDescription('');
    setImageFile(null);
    setImagePreview('');
    setFormErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setCategory(product.category);
    setPrice(String(product.price));
    setDescription(product.description || '');
    setImageFile(null);
    setImagePreview(product.image_url);
    setFormErrors({});
    setSuccessMsg('');
    setSubmitError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormErrors((prev) => ({ ...prev, image: 'Please select an image file' }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, image: `Image must be under ${MAX_IMAGE_MB}MB` }));
      return;
    }
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Product title is required';
    if (!price || Number(price) <= 0) e.price = 'Enter a valid price in KES';
    if (!imageFile && !editingProduct) e.image = 'Please upload a product image';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSuccessMsg('');
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      // 1. Upload image to Supabase Storage (only if a new one was selected)
      let imageUrl = editingProduct?.image_url || '';
      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
          body: JSON.stringify({
            fileName: imageFile.name,
            fileBase64: base64,
            contentType: imageFile.type,
          }),
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.error || 'Image upload failed');
        }
        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      // 2. Create or update product
      const res = await fetch('/api/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({
          ...(editingProduct ? { id: editingProduct.id } : {}),
          title: title.trim(),
          category,
          price: Number(price),
          description: description.trim(),
          image_url: imageUrl,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.error || (editingProduct ? 'Failed to update product' : 'Failed to save product')
        );
      }

      setSuccessMsg(
        editingProduct
          ? `"${title.trim()}" has been updated on the live shop!`
          : `"${title.trim()}" is now live on the shop!`
      );
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.title}"? This removes it from the live shop immediately.`)) {
      return;
    }
    setDeletingId(product.id);
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ id: product.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete product');
      }
      await fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-ivory px-4 py-3 text-[15px] text-espresso placeholder:text-espresso/35 outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20 ${
      hasError ? 'border-red-400' : 'border-line'
    }`;

  const stats = categories.map((cat) => ({
    label: cat,
    count: products.filter((p) => p.category === cat).length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brass">Rafna Investment</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-espresso">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-espresso/55">Manage the live shop — add and remove products.</p>
        </div>
        <button
          onClick={onLogout}
          className="flex w-fit items-center gap-2 rounded-full border border-espresso/25 px-5 py-2.5 text-sm font-semibold text-espresso transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} /> Log Out
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-espresso p-5">
          <Package size={20} className="text-brass-light" />
          <p className="mt-3 font-display text-3xl font-bold text-cream">{products.length}</p>
          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-cream/50">Total Products</p>
        </div>
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="font-display text-3xl font-bold text-espresso">{s.count}</p>
            <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-espresso/45">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* ===== ADD PRODUCT FORM ===== */}
        <div className="h-fit rounded-3xl border border-line bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-espresso">
            {editingProduct ? (
              <>
                <Pencil size={19} className="text-brass" /> Edit Product
              </>
            ) : (
              <>
                <Plus size={20} className="text-brass" /> Add New Product
              </>
            )}
          </h2>
          {editingProduct && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-brass/10 px-3.5 py-2.5">
              <p className="truncate text-xs text-espresso/70">
                Editing: <strong>{editingProduct.title}</strong>
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
              >
                <X size={13} /> Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="p-title" className="mb-1.5 block text-sm font-medium text-espresso">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="p-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Orthopaedic Spring Mattress 5x6"
                className={inputClass(!!formErrors.title)}
              />
              {formErrors.title && <p className="mt-1.5 text-xs text-red-500">{formErrors.title}</p>}
            </div>

            <div>
              <label htmlFor="p-category" className="mb-1.5 block text-sm font-medium text-espresso">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="p-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-line bg-ivory px-4 py-3 text-[15px] text-espresso outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setShowCatInput((s) => !s);
                  setCatError('');
                }}
                className="mt-2 text-xs font-semibold text-brass hover:underline"
              >
                {showCatInput ? '\u2212 Hide custom category' : '+ Add custom category'}
              </button>
              {showCatInput && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        setCatError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                      placeholder="e.g. Curtains & Decor"
                      className="w-full rounded-xl border border-line bg-ivory px-4 py-2.5 text-sm text-espresso placeholder:text-espresso/35 outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={addingCat}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-espresso px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-cream transition-colors hover:bg-brass disabled:opacity-60"
                    >
                      {addingCat ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Add
                    </button>
                  </div>
                  {catError && <p className="mt-1.5 text-xs text-red-500">{catError}</p>}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="p-price" className="mb-1.5 block text-sm font-medium text-espresso">
                Price (KES) <span className="text-red-500">*</span>
              </label>
              <input
                id="p-price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 18500"
                className={inputClass(!!formErrors.price)}
              />
              {formErrors.price && <p className="mt-1.5 text-xs text-red-500">{formErrors.price}</p>}
            </div>

            <div>
              <label htmlFor="p-desc" className="mb-1.5 block text-sm font-medium text-espresso">
                Description
              </label>
              <textarea
                id="p-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Short, appealing description of the product..."
                className="w-full resize-none rounded-xl border border-line bg-ivory px-4 py-3 text-[15px] text-espresso placeholder:text-espresso/35 outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-espresso">
                Product Image{' '}
                {editingProduct ? (
                  <span className="font-normal text-espresso/45">(leave as is to keep current image)</span>
                ) : (
                  <span className="text-red-500">*</span>
                )}
              </span>
              <label
                htmlFor="p-image"
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors hover:border-brass hover:bg-brass/5 ${
                  formErrors.image ? 'border-red-300' : 'border-line'
                }`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-36 w-full rounded-xl object-cover" />
                ) : (
                  <>
                    <ImagePlus size={26} className="text-espresso/35" />
                    <span className="text-sm text-espresso/55">Tap to upload from your device</span>
                    <span className="text-xs text-espresso/35">JPG or PNG · max {MAX_IMAGE_MB}MB</span>
                  </>
                )}
              </label>
              <input
                ref={fileInputRef}
                id="p-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imageFile && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(editingProduct ? editingProduct.image_url : '');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-2 text-xs font-medium text-red-500 hover:underline"
                >
                  Remove selected image
                </button>
              )}
              {formErrors.image && <p className="mt-1.5 text-xs text-red-500">{formErrors.image}</p>}
            </div>

            {successMsg && (
              <p className="flex items-start gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> {successMsg}
              </p>
            )}
            {submitError && (
              <p className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={17} className="mt-0.5 shrink-0" /> {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brass px-5 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-brass-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />{' '}
                  {editingProduct ? 'Saving...' : 'Publishing...'}
                </>
              ) : editingProduct ? (
                <>
                  <Pencil size={16} /> Save Changes
                </>
              ) : (
                <>
                  <Plus size={17} /> Publish to Live Shop
                </>
              )}
            </button>
          </form>
        </div>

        {/* ===== PRODUCT LIST ===== */}
        <div>
          <h2 className="font-display text-xl font-semibold text-espresso">
            Live Products <span className="text-espresso/40">({products.length})</span>
          </h2>

          {loading ? (
            <div className="mt-6 flex items-center justify-center rounded-2xl border border-line bg-white py-20">
              <Loader2 size={26} className="animate-spin text-brass" />
            </div>
          ) : fetchError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm text-red-600">{fetchError}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 rounded-xl bg-espresso px-6 py-2.5 text-sm font-semibold text-cream hover:bg-brass"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-line bg-white p-12 text-center">
              <Package size={36} className="mx-auto text-espresso/25" />
              <p className="mt-3 text-sm text-espresso/55">
                No products yet. Add your first product using the form.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center gap-4 rounded-2xl border bg-white p-3.5 transition-shadow hover:shadow-md ${
                    editingProduct?.id === product.id
                      ? 'border-brass ring-2 ring-brass/20'
                      : 'border-line'
                  }`}
                >
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-16 w-20 shrink-0 rounded-xl object-cover sm:h-18 sm:w-24"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[15px] font-semibold text-espresso">
                      {product.title}
                    </p>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-espresso/45">
                      {product.category}
                    </p>
                    <p className="mt-1 text-sm font-bold text-brass-dark">{formatKES(product.price)}</p>
                  </div>
                  <button
                    onClick={() => startEdit(product)}
                    aria-label={`Edit ${product.title}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line text-espresso/40 transition-colors hover:border-brass hover:bg-brass/10 hover:text-brass"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    aria-label={`Delete ${product.title}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line text-espresso/40 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  >
                    {deletingId === product.id ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
