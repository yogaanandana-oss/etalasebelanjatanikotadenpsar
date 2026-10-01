import React, { createContext, useContext, useState, useEffect } from 'react';

import { fetchVisibleProductIds } from '@/lib/catalog';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'sayursegar_wishlist';

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  // Drop saved items whose product is now hidden or deleted
  useEffect(() => {
    fetchVisibleProductIds().then((ids) => {
      if (ids) setItems((prev) => prev.filter((i) => ids.has(i.id)));
    });
  }, []);

  const toggle = (product) =>
    setItems((prev) =>
      prev.find((i) => i.id === product.id)
        ? prev.filter((i) => i.id !== product.id)
        : [...prev, product]
    );

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const has = (id) => items.some((i) => i.id === id);
  const clear = () => setItems([]);

  const value = { items, toggle, remove, has, clear, count: items.length };
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}