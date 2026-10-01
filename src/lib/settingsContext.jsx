const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { shopConfig } from '@/lib/shopConfig';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const rows = await db.entities.Setting.list('-updated_date');
      const map = {};
      (rows || []).forEach((r) => {
        if (r && r.key) {
          const cur = map[r.key];
          if (!cur || new Date(r.updated_date || 0) >= new Date(cur.updated_date || 0)) {
            map[r.key] = r;
          }
        }
      });
      setSettings(map);
      const get = (k, fb) => (map[k] && map[k].value != null ? map[k].value : fb);
      shopConfig.shopName = get('shop_name', shopConfig.shopName);
      shopConfig.whatsappNumber = get('whatsapp_number', shopConfig.whatsappNumber);
      shopConfig.qrisMerchantName = get('qris_merchant_name', shopConfig.qrisMerchantName);
      shopConfig.qrisImage = get('qris_image', shopConfig.qrisImage);
      try {
        const parsed = JSON.parse(get('banks', JSON.stringify(shopConfig.banks)));
        if (Array.isArray(parsed)) shopConfig.banks = parsed;
      } catch {
        /* keep default banks */
      }
      const num = (k, fb) => {
        const v = get(k);
        const n = Number(v);
        return Number.isFinite(n) && v !== '' ? n : fb;
      };
      shopConfig.voucherFirstTimePercent = num('voucher_first_time_percent', shopConfig.voucherFirstTimePercent);
      shopConfig.voucherLoyaltyMinOrders = num('voucher_loyalty_min_orders', shopConfig.voucherLoyaltyMinOrders);
      shopConfig.voucherLoyaltyMinTotal = num('voucher_loyalty_min_total', shopConfig.voucherLoyaltyMinTotal);
      shopConfig.voucherLoyaltyPercent = num('voucher_loyalty_percent', shopConfig.voucherLoyaltyPercent);
    } catch {
      /* unauthenticated or error: keep defaults */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loaded, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);