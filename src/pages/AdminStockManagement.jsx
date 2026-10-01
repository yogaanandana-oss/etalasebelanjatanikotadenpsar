const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Loader2, RefreshCw, Package, AlertTriangle, Truck, Sprout, CheckCircle2, ArrowLeft } from 'lucide-react';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatIDR } from '@/lib/format';
import PageHeader from '@/components/marketplace/PageHeader';

export default function AdminStockManagement() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await db.entities.Product.list('-created_date', 500);
      setProducts(Array.isArray(data) ? data : data.items || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    db.auth.me().then((u) => { setMe(u); if (u?.role !== 'admin') setDenied(true); }).catch(() => setDenied(true));
    fetchProducts();
  }, []);

  const enriched = useMemo(() => {
    return products.map((p) => {
      const restock = p.restock_date ? parseISO(p.restock_date) : null;
      const daysToRestock = restock ? differenceInCalendarDays(restock, new Date()) : null;
      return { ...p, restock, daysToRestock };
    });
  }, [products]);

  const lowStock = enriched.filter((p) => !p.in_stock);
  const soonRestock = enriched.filter((p) => p.in_stock && p.daysToRestock !== null && p.daysToRestock <= 3);
  const available = enriched.filter((p) => p.in_stock);

  const toggleStock = async (p) => {
    try {
      const updated = await db.entities.Product.update(p.id, { in_stock: !p.in_stock });
      setProducts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({ description: updated.in_stock ? 'Stok tersedia / In stock' : 'Stok habis / Out of stock' });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  const setRestock = async (p, date) => {
    try {
      const updated = await db.entities.Product.update(p.id, { restock_date: date });
      setProducts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({ description: 'Tanggal restok diperbarui / Restock date updated' });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6 text-center">
        <Lock className="w-7 h-7 text-destructive" />
        <p className="font-display font-semibold">Akses ditolak / Access denied</p>
        <Button asChild variant="outline"><Link to="/"><ArrowLeft className="w-4 h-4 mr-1" />Kembali</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader id="Manajemen Stok" en="Stock Management" />
      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading} className="rounded-full">
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />Segarkan
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : (
          <>
            <Section
              title="Hampir Habis · Butuh Restock"
              en="Low stock — needs restock"
              icon={AlertTriangle}
              tone="text-amber-600"
              items={lowStock}
              onToggle={toggleStock}
              onRestock={setRestock}
              empty="Semua produk tersedia. / All products in stock."
            />
            <Section
              title="Restock Segera (≤ 3 hari)"
              en="Restock soon (≤ 3 days)"
              icon={Truck}
              tone="text-accent"
              items={soonRestock}
              onToggle={toggleStock}
              onRestock={setRestock}
              empty="Tidak ada jadwal restock dekat. / No near restock schedules."
            />
            <Section
              title="Tersedia"
              en="Available"
              icon={CheckCircle2}
              tone="text-emerald-600"
              items={available}
              onToggle={toggleStock}
              onRestock={setRestock}
              empty="Belum ada produk. / No products."
            />
          </>
        )}
      </main>
    </div>
  );
}

function Section({ title, en, icon: Icon, tone, items, onToggle, onRestock, empty }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${tone}`} />
        <div className="leading-tight">
          <h2 className="font-display font-bold text-foreground">{title}</h2>
          <p className="text-[0.7em] text-muted-foreground/70">{en}</p>
        </div>
        <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <Card className="p-6 rounded-xl text-center text-sm text-muted-foreground">{empty}</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((p) => (
            <Card key={p.id} className="p-3 rounded-xl">
              <div className="flex items-center gap-2">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name_id || p.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground/50" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{p.name_id || p.name}</p>
                  <p className="text-[0.7em] text-muted-foreground">{formatIDR(p.price)} · {p.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full ${p.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.in_stock ? 'Tersedia' : 'Habis'}
                </span>
                {p.daysToRestock !== null && (
                  <span className="text-[0.65rem] text-muted-foreground">
                    Restock {format(p.restock, 'd MMM', { locale: idLocale })} ({p.daysToRestock === 0 ? 'hari ini' : `${p.daysToRestock}h`})
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => onToggle(p)} className="h-8">
                  {p.in_stock ? 'Tandai habis' : 'Tandai ada'}
                </Button>
                <Input
                  type="date"
                  defaultValue={p.restock_date ? p.restock_date.slice(0, 10) : ''}
                  onChange={(e) => onRestock(p, e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}