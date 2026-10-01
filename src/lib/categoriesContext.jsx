const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_CATEGORIES = [
  { key: 'Leafy Greens', label_id: 'Sayuran Daun', label_en: 'Leafy Greens', icon: '🥬', sort_order: 1 },
  { key: 'Chili & Spices', label_id: 'Cabai & Rempah', label_en: 'Chili & Spices', icon: '🌶️', sort_order: 2 },
  { key: 'Fruit Vegetables', label_id: 'Sayur Buah', label_en: 'Fruit Vegetables', icon: '🍅', sort_order: 3 },
  { key: 'Fruits', label_id: 'Buah', label_en: 'Fruits', icon: '🍊', sort_order: 4 },
  { key: 'Jamu', label_id: 'Jamu', label_en: 'Herbal Tonic', icon: '🍵', sort_order: 5 },
  { key: 'Flowers', label_id: 'Bunga', label_en: 'Flowers', icon: '🌸', sort_order: 6 },
  { key: 'Rice', label_id: 'Gabah & Beras', label_en: 'Rice & Grain', icon: '🌾', sort_order: 7 },
  { key: 'Farm Workers', label_id: 'Pekerja Lahan', label_en: 'Field Workers', icon: '🧑🌾', sort_order: 8 },
];

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await db.entities.Category.list('sort_order', 200);
      const list = Array.isArray(data) ? data : data.items || [];
      // Merge defaults with DB: defaults guarantee core categories
      // (incl. Bunga, Gabah & Beras, Pekerja Lahan) always render;
      // DB entries override by key and add any admin-created ones.
      const merged = {};
      DEFAULT_CATEGORIES.forEach((c) => { merged[c.key] = c; });
      list.forEach((c) => { merged[c.key] = c; });
      const result = Object.values(merged).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setCategories(result);
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const labelId = useCallback((key) => categories.find((c) => c.key === key)?.label_id || key, [categories]);
  const labelEn = useCallback((key) => categories.find((c) => c.key === key)?.label_en || key, [categories]);
  const iconFor = useCallback((key) => categories.find((c) => c.key === key)?.icon || '🌱', [categories]);

  const value = { categories, loading, refresh, labelId, labelEn, iconFor };
  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    return {
      categories: DEFAULT_CATEGORIES, loading: false, refresh: async () => {},
      labelId: (k) => k, labelEn: (k) => k, iconFor: () => '🌱',
    };
  }
  return ctx;
}