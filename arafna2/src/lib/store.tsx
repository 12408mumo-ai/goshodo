import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from './api';
import type { Category, Product } from './api';

interface ShopContextValue {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  checkoutProduct: Product | null;
  setCheckoutProduct: (p: Product | null) => void;
  detailProduct: Product | null;
  setDetailProduct: (p: Product | null) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([
        api<Product[]>('/api/products'),
        api<Category[]>('/api/categories'),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<ShopContextValue>(
    () => ({
      products,
      categories,
      loading,
      error,
      refresh,
      checkoutProduct,
      setCheckoutProduct,
      detailProduct,
      setDetailProduct,
    }),
    [products, categories, loading, error, refresh, checkoutProduct, detailProduct]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}
