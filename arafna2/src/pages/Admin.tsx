import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderPlus,
  ImagePlus,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Package,
  Pencil,
  Plus,
  ReceiptText,
  ShieldCheck,
  Star,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import Logo from '../components/Logo';
import { ADMIN_SESSION_KEY, api, adminHeaders, formatKES } from '../lib/api';
import type { Category, Order, Product } from '../lib/api';
import { useShop } from '../lib/store';

type Tab = 'products' | 'form' | 'categories' | 'orders';

interface ProductForm {
  title: string;
  category: string;
  price: string;
  description: string;
  image_url: string;
  featured: boolean;
}

const EMPTY_FORM: ProductForm = { title: '', category: '', price: '', description: '', image_url: '', featured: false };

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const { products, categories, loading: storeLoading, refresh } = useShop();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>('products');
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [newCategory, setNewCategory] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [catUploading, setCatUploading] = useState(false);
  const [catMsg, setCatMsg] = useState('');
  const [catError, setCatError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'category' | 'order'; id: number; label: string } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (saved) {
      api<{ ok: boolean }>('/api/admin-verify', { method: 'POST', body: JSON.stringify({ password: saved }) })
        .then((r) => {
          if (r.ok) setAuthed(true);
          else sessionStorage.removeItem(ADMIN_SESSION_KEY);
        })
        .catch(() => sessionStorage.removeItem(ADMIN_SESSION_KEY));
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3200);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    return [
      { icon: Package, label: 'Products', value: String(products.length) },
      { icon: Layers, label: 'Categories', value: String(categories.length) },
      { icon: ReceiptText, label: 'Orders', value: String(orders.length) },
      { icon: Truck, label: 'Order Value', value: formatKES(revenue) },
    ];
  }, [products, categories, orders]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await api<Order[]>('/api/orders', { headers: adminHeaders() });
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setLoginError('Please enter the admin password.');
      return;
    }
    setLoggingIn(true);
    setLoginError('');
    try {
      const r = await api<{ ok: boolean }>('/api/admin-verify', { method: 'POST', body: JSON.stringify({ password }) });
      if (r.ok) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, password);
        setAuthed(true);
        setPassword('');
      } else {
        setLoginError('Incorrect password. Please try again.');
      }
    } catch {
      setLoginError('Incorrect password. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthed(false);
    setTab('products');
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileBase64 = await readFileAsBase64(file);
    const data = await api<{ url: string }>('/api/upload', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ fileName: file.name, fileBase64, contentType: file.type }),
    });
    return data.url;
  };

  const handleProductImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file (JPG, PNG or WebP).');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setUploadError('Image must be smaller than 6MB.');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      setUploadSuccess('Image uploaded successfully!');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      category: p.category,
      price: String(p.price),
      description: p.description || '',
      image_url: p.image_url,
      featured: Boolean(p.featured),
    });
    setFormError('');
    setFormSuccess('');
    setUploadError('');
    setUploadSuccess('');
    setTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
    setUploadError('');
    setUploadSuccess('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.title.trim()) return setFormError('Product title is required.');
    if (!form.category.trim()) return setFormError('Category is required — pick one or type a new one.');
    if (!form.price || Number(form.price) <= 0) return setFormError('Enter a valid price in KES.');
    if (!form.image_url.trim()) return setFormError('Please upload a product image first.');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        featured: form.featured,
      };
      if (editingId) {
        await api('/api/products', { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ id: editingId, ...payload }) });
        setFormSuccess('Product updated! It is live on the shop page.');
        setToast('Product updated successfully.');
      } else {
        await api('/api/products', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(payload) });
        setFormSuccess('Product added! It is now live on the shop page.');
        setForm(EMPTY_FORM);
        setUploadSuccess('');
        setToast('Product published to shop.');
      }
      await refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      if (confirmDelete.type === 'product') {
        await api('/api/products', { method: 'DELETE', headers: adminHeaders(), body: JSON.stringify({ id: confirmDelete.id }) });
        await refresh();
        setToast('Product deleted.');
      } else if (confirmDelete.type === 'category') {
        await api('/api/categories', { method: 'DELETE', headers: adminHeaders(), body: JSON.stringify({ id: confirmDelete.id }) });
        await refresh();
        setToast('Category deleted.');
      } else {
        await api('/api/orders', { method: 'DELETE', headers: adminHeaders(), body: JSON.stringify({ id: confirmDelete.id }) });
        setOrders((o) => o.filter((x) => x.id !== confirmDelete.id));
        setToast('Order deleted.');
      }
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  const toggleFeatured = async (p: Product) => {
    setBusyId(p.id);
    try {
      await api('/api/products', { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ id: p.id, featured: !p.featured }) });
      await refresh();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    setCatMsg('');
    if (!newCategory.trim()) return setCatError('Category name is required.');
    try {
      await api('/api/categories', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ name: newCategory.trim(), image_url: newCategoryImage.trim() || null }),
      });
      setCatMsg(`Category "${newCategory.trim()}" added — it now appears in the shop filters.`);
      setNewCategory('');
      setNewCategoryImage('');
      await refresh();
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Could not add category.');
    }
  };

  const handleCategoryImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setCatError('Please choose an image file.');
    setCatUploading(true);
    setCatError('');
    try {
      const url = await uploadImage(file);
      setNewCategoryImage(url);
      setCatMsg('Category image uploaded.');
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setCatUploading(false);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    setBusyId(id);
    try {
      await api('/api/orders', { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ id, status }) });
      setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
      setToast(`Order #${id} marked as ${status}.`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  /* ---------------- LOGIN GATE ---------------- */
  if (!authed) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-ivory-50 px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-3xl border border-forest-950/10 bg-white p-8 shadow-2xl sm:p-10"
        >
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-forest-950">
            <ShieldCheck className="h-5 w-5 text-gold-600" />
            <h1 className="font-display text-2xl font-bold">Admin Access</h1>
          </div>
          <p className="mt-2 text-center text-sm text-forest-950/60">
            This area is restricted to Rafna Investment staff. Customers cannot access the dashboard.
          </p>
          <form onSubmit={handleLogin} className="mt-6">
            <label htmlFor="admin-pw" className="text-xs font-bold uppercase tracking-[0.18em] text-forest-950/70">
              Admin Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-950/40" />
              <input
                id="admin-pw"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-forest-950/15 bg-white py-3.5 pl-11 pr-12 text-sm text-forest-950 outline-none transition placeholder:text-forest-950/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/40"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-forest-950/50 hover:bg-forest-950/5"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {loginError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" /> {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-ivory-50 transition hover:bg-forest-800 disabled:opacity-70"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                </>
              ) : (
                'Unlock Dashboard'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */
  const tabs: { key: Tab; label: string; icon: typeof Package }[] = [
    { key: 'products', label: 'Products', icon: Package },
    { key: 'form', label: editingId ? 'Edit Product' : 'Add Product', icon: Plus },
    { key: 'categories', label: 'Categories', icon: Layers },
    { key: 'orders', label: `Orders (${orders.length})`, icon: ReceiptText },
  ];

  return (
    <div className="min-h-screen bg-ivory-50">
      <div className="bg-forest-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-300">Rafna Investment</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ivory-50">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-ivory-50/60">Manage products, categories and customer orders.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-ivory-50/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ivory-50 transition hover:bg-ivory-50/10 md:self-auto"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-forest-950/10 bg-white p-5 shadow-sm">
              <s.icon className="h-5 w-5 text-gold-600" />
              <p className="mt-3 font-display text-2xl font-bold text-forest-950 sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-forest-950/50">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-forest-950/10 bg-white p-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                if (t.key === 'form' && tab !== 'form') resetForm();
                setTab(t.key);
              }}
              className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] transition ${tab === t.key ? 'bg-forest-950 text-gold-300 shadow' : 'text-forest-950/60 hover:bg-forest-950/5'}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* PRODUCTS TABLE */}
        {tab === 'products' && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-forest-950/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-950/10 p-5">
              <h2 className="font-display text-xl font-bold text-forest-950">Product Management ({products.length})</h2>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setTab('form');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-forest-950 transition hover:bg-gold-400"
              >
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>
            {storeLoading ? (
              <div className="flex items-center justify-center gap-2 p-12 text-sm text-forest-950/60">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading products…
              </div>
            ) : products.length === 0 ? (
              <p className="p-12 text-center text-sm text-forest-950/60">
                No products yet. Click &ldquo;Add Product&rdquo; to publish your first item to the shop.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-forest-950/10 bg-ivory-50 text-[11px] font-bold uppercase tracking-[0.14em] text-forest-950/60">
                      <th className="px-5 py-4">Image</th>
                      <th className="px-5 py-4">Title</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Price (KES)</th>
                      <th className="px-5 py-4">Featured</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-forest-950/5 transition hover:bg-ivory-50/60">
                        <td className="px-5 py-3">
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="h-14 rounded-lg border border-forest-950/10 object-cover"
                            style={{ width: 72 }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/mattress-1.jpg';
                            }}
                          />
                        </td>
                        <td className="max-w-[220px] px-5 py-3">
                          <p className="truncate font-semibold text-forest-950">{p.title}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-forest-950/50">{p.description}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-block rounded-full bg-forest-950/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-forest-900">
                            {p.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-bold text-forest-950">{formatKES(p.price)}</td>
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => toggleFeatured(p)}
                            disabled={busyId === p.id}
                            title={p.featured ? 'Remove from featured' : 'Mark as featured'}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${p.featured ? 'bg-gold-500 text-forest-950' : 'bg-forest-950/5 text-forest-950/40 hover:bg-forest-950/10'}`}
                          >
                            {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className={`h-4 w-4 ${p.featured ? 'fill-current' : ''}`} />}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(p)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-forest-950/15 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.08em] text-forest-950 transition hover:bg-forest-950 hover:text-white"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete({ type: 'product', id: p.id, label: p.title })}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.08em] text-red-700 transition hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD / EDIT FORM */}
        {tab === 'form' && (
          <div className="mt-6 rounded-2xl border border-forest-950/10 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-2xl font-bold text-forest-950">
              {editingId ? `Edit Product #${editingId}` : 'Add New Product'}
            </h2>
            <p className="mt-1 text-sm text-forest-950/60">
              {editingId
                ? 'Update any field and save — changes appear on the live shop instantly.'
                : 'Fill in the details and publish — the product appears on the live shop instantly.'}
            </p>

            <form onSubmit={handleSaveProduct} className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <label htmlFor="pf-title" className="text-xs font-bold uppercase tracking-[0.16em] text-forest-950/70">
                    Title *
                  </label>
                  <input
                    id="pf-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Orthopaedic Spring Mattress 6x6"
                    className="mt-1.5 w-full rounded-xl border border-forest-950/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-forest-950/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/40"
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pf-category" className="text-xs font-bold uppercase tracking-[0.16em] text-forest-950/70">
                      Category *
                    </label>
                    <input
                      id="pf-category"
                      type="text"
                      list="category-options"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Pick or type a new one"
                      className="mt-1.5 w-full rounded-xl border border-forest-950/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-forest-950/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/40"
                    />
                    <datalist id="category-options">
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label htmlFor="pf-price" className="text-xs font-bold uppercase tracking-[0.16em] text-forest-950/70">
                      Price (KES) *
                    </label>
                    <input
                      id="pf-price"
                      type="number"
                      min="1"
                      step="1"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="e.g. 45000"
                      className="mt-1.5 w-full rounded-xl border border-forest-950/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-forest-950/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/40"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="pf-desc" className="text-xs font-bold uppercase tracking-[0.16em] text-forest-950/70">
                    Description
                  </label>
                  <textarea
                    id="pf-desc"
                    rows={5}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Sizes, materials, comfort level, warranty…"
                    className="mt-1.5 w-full resize-y rounded-xl border border-forest-950/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-forest-950/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/40"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-forest-950/10 bg-ivory-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-5 w-5 accent-[#c9a24b]"
                  />
                  <span className="text-sm font-semibold text-forest-950">
                    Feature this product <span className="font-normal text-forest-950/55">(shows in homepage highlights)</span>
                  </span>
                </label>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-950/70">Product Image *</p>
                <div className="mt-1.5 overflow-hidden rounded-2xl border-2 border-dashed border-forest-950/15 bg-ivory-50">
                  {form.image_url ? (
                    <div className="relative">
                      <img src={form.image_url} alt="Product preview" className="aspect-[4/3] w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: '' })}
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest-950/85 text-white transition hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 p-8 text-center transition hover:bg-ivory-100">
                      <ImagePlus className="h-10 w-10 text-forest-950/35" />
                      <span className="text-sm font-semibold text-forest-950">Click to upload an image</span>
                      <span className="text-xs text-forest-950/50">JPG, PNG or WebP • Max 6MB • Stored in Supabase</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleProductImage(e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>

                {form.image_url && (
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-forest-950/15 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-forest-950 transition hover:bg-forest-950 hover:text-white">
                    <ImagePlus className="h-4 w-4" /> Replace Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProductImage(e.target.files?.[0])} />
                  </label>
                )}

                {uploading && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-gold-500/10 p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gold-600" />
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-gold-500/20">
                        <div className="h-full w-2/3 animate-pulse rounded-full bg-gold-500" />
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-forest-950">Uploading image to Supabase Storage…</p>
                    </div>
                  </div>
                )}
                {uploadSuccess && (
                  <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> {uploadSuccess}
                  </p>
                )}
                {uploadError && (
                  <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                    <AlertTriangle className="h-4 w-4" /> {uploadError}
                  </p>
                )}
                {form.image_url && (
                  <p className="mt-2 break-all text-[11px] text-forest-950/45">Public URL: {form.image_url}</p>
                )}
              </div>

              <div className="lg:col-span-2">
                {formError && (
                  <p className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                    <AlertTriangle className="h-4 w-4" /> {formError}
                  </p>
                )}
                {formSuccess && (
                  <p className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> {formSuccess}
                  </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-forest-950 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ivory-50 transition hover:bg-forest-800 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : editingId ? (
                      'Save Changes'
                    ) : (
                      'Publish Product'
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setTab('products');
                      }}
                      className="rounded-xl border border-forest-950/15 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-forest-950 transition hover:bg-forest-950/5"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* CATEGORIES */}
        {tab === 'categories' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="rounded-2xl border border-forest-950/10 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-forest-950">
                <FolderPlus className="h-5 w-5 text-gold-600" /> Add Custom Category
              </h2>
              <p className="mt-1 text-sm text-forest-950/60">New categories instantly appear as shop filters.</p>
              <form onSubmit={handleAddCategory} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="cat-name" className="text-xs font-bold uppercase tracking-[0.16em] text-forest-950/70">
                    Category Name *
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Baby & Kids"
                    className="mt-1.5 w-full rounded-xl border border-forest-950/15 px-4 py-3 text-sm outline-none transition placeholder:text-forest-950/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/40"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-950/70">Cover Image (optional)</p>
                  {newCategoryImage ? (
                    <div className="relative mt-1.5 overflow-hidden rounded-xl border border-forest-950/10">
                      <img src={newCategoryImage} alt="Category preview" className="aspect-[16/9] w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewCategoryImage('')}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-forest-950/85 text-white hover:bg-red-600"
                        aria-label="Remove category image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest-950/15 bg-ivory-50 px-4 py-6 text-sm font-semibold text-forest-950/70 transition hover:bg-ivory-100">
                      {catUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-5 w-5" /> Upload cover image
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCategoryImage(e.target.files?.[0])} />
                    </label>
                  )}
                </div>
                {catError && (
                  <p className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                    <AlertTriangle className="h-4 w-4" /> {catError}
                  </p>
                )}
                {catMsg && (
                  <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> {catMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={catUploading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-ivory-50 transition hover:bg-forest-800 disabled:opacity-60"
                >
                  Add Category
                </button>
              </form>
            </div>

            <div className="overflow-hidden rounded-2xl border border-forest-950/10 bg-white shadow-sm lg:col-span-3">
              <div className="border-b border-forest-950/10 p-5">
                <h2 className="font-display text-xl font-bold text-forest-950">Current Categories ({categories.length})</h2>
              </div>
              {categories.length === 0 ? (
                <p className="p-10 text-center text-sm text-forest-950/60">No categories yet.</p>
              ) : (
                <ul className="divide-y divide-forest-950/5">
                  {categories.map((c) => {
                    const count = products.filter((p) => p.category === c.name).length;
                    return (
                      <li key={c.id} className="flex items-center gap-4 p-4">
                        <img
                          src={c.image_url || '/images/showroom.jpg'}
                          alt={c.name}
                          className="h-14 rounded-lg border border-forest-950/10 object-cover"
                          style={{ width: 72 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/showroom.jpg';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-forest-950">{c.name}</p>
                          <p className="text-xs text-forest-950/55">
                            {count} {count === 1 ? 'product' : 'products'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete({ type: 'category', id: c.id, label: c.name })}
                          disabled={busyId === c.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.08em] text-red-700 transition hover:bg-red-600 hover:text-white"
                        >
                          {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          Delete
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-forest-950/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-950/10 p-5">
              <h2 className="font-display text-xl font-bold text-forest-950">Customer Orders ({orders.length})</h2>
              <button
                type="button"
                onClick={fetchOrders}
                className="rounded-xl border border-forest-950/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-forest-950 transition hover:bg-forest-950 hover:text-white"
              >
                Refresh
              </button>
            </div>
            {ordersLoading ? (
              <div className="flex items-center justify-center gap-2 p-12 text-sm text-forest-950/60">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading orders…
              </div>
            ) : orders.length === 0 ? (
              <p className="p-12 text-center text-sm text-forest-950/60">
                No orders yet. Orders placed through WhatsApp checkout will appear here automatically.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-forest-950/10 bg-ivory-50 text-[11px] font-bold uppercase tracking-[0.14em] text-forest-950/60">
                      <th className="px-5 py-4">Order</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Fulfillment</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-forest-950/5 hover:bg-ivory-50/60">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-forest-950">
                            #{o.id} — {o.product_title}
                          </p>
                          <p className="text-xs text-forest-950/55">
                            {o.quantity} × {formatKES(o.unit_price)} • {new Date(o.created_at).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-forest-950">{o.full_name}</p>
                          <p className="text-xs text-forest-950/55">{o.phone}</p>
                        </td>
                        <td className="px-5 py-3 text-xs text-forest-950/75">
                          <p>{o.fulfillment_type}</p>
                          {o.location && <p className="text-forest-950/55">{o.location}</p>}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-bold text-forest-950">{formatKES(o.total)}</td>
                        <td className="px-5 py-3">
                          <select
                            value={o.status}
                            disabled={busyId === o.id}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] outline-none ${o.status === 'fulfilled'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : o.status === 'cancelled'
                                ? 'border-red-300 bg-red-50 text-red-700'
                                : 'border-gold-500/50 bg-gold-500/10 text-gold-600'
                              }`}
                          >
                            <option value="new">New</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="fulfilled">Fulfilled</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ type: 'order', id: o.id, label: `Order #${o.id}` })}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.08em] text-red-700 transition hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/70 p-4 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            >
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-3 font-display text-xl font-bold text-forest-950">Delete {confirmDelete.label}?</h3>
              <p className="mt-2 text-sm text-forest-950/60">This action is permanent and cannot be undone.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="rounded-xl border border-forest-950/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-forest-950 hover:bg-forest-950/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busyId === confirmDelete.id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {busyId === confirmDelete.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-forest-950 px-6 py-3 text-sm font-semibold text-ivory-50 shadow-2xl"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Keep tree-shaken type import used
export type { Category };
