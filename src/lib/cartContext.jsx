import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { finalPrice } from '@/lib/format';
import { fetchVisibleProductIds } from '@/lib/catalog';
import { effectivePrice, itemKey as makeKey } from '@/lib/grades';

const CartContext = createContext(null);

const STORAGE_KEY = 'sayursegar_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

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
      if (ids) setItems((prev) => prev.filter((i) => ids.has(i.product.id)));
    });
  }, []);

  // product may carry options.grade = { label, label_en, weight_kg, price }
  // and options.weight (kg) for weight-priced tier products.
  const addItem = (product, options = {}) => {
    const grade = options.grade || null;
    const weight = options.weight || null;
    const key = makeKey({ product, grade, weight });
    setItems((prev) => {
      const existing = prev.find((i) => makeKey(i) === key);
      if (existing) {
        return prev.map((i) => (makeKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { product, quantity: 1, grade, weight }];
    });
    setIsOpen(true);
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((i) => makeKey(i) !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) return removeItem(key);
    setItems((prev) =>
      prev.map((i) => (makeKey(i) === key ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + effectivePrice(i) * i.quantity, 0),
    [items]
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    count,
    subtotal,
    isOpen,
    setIsOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}