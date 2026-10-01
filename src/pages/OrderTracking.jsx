const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { formatIDR, formatShortDate } from '@/lib/format';
import BaliPattern from '@/components/marketplace/BaliPattern';
import PageHeader from '@/components/marketplace/PageHeader';

const PAY_LABEL = { cod: 'COD', virtual_account: 'Virtual Account', qris: 'QRIS', whatsapp: 'WhatsApp' };

const FLOW = [
  { key: 'pending', id: 'Diterima', en: 'Received', icon: Package },
  { key: 'paid', id: 'Dibayar', en: 'Paid', icon: CheckCircle2 },
  { key: 'processing', id: 'Diproses', en: 'Processing', icon: Loader2 },
  { key: 'shipped', id: 'Dikirim', en: 'Shipped', icon: Truck },
  { key: 'completed', id: 'Selesai', en: 'Completed', icon: CheckCircle2 },
];

const stepIndex = (status) => {
  if (status === 'cancelled' || status === 'expired') return -1;
  const i = FLOW.findIndex((f) => f.key === status);
  return i < 0 ? 0 : i;
};

const parseItems = (o) => {
  try {
    const a = JSON.parse(o.items_json || '[]');
    if (!Array.isArray(a)) return [];
    return a.map((it) => {
      const p = it.product || it;
      return { name: p.name_id || p.name || 'Produk', qty: Number(it.quantity ?? it.qty) || 1, price: Number(p.price ?? it.price) || 0 };
    });
  } catch { return []; }
};

export default function OrderTracking() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const isRef = /TSM/i.test(q.trim());
      const filter = isRef ? { order_ref: q.trim() } : { customer_phone: q.trim() };
      const data = await db.entities.Order.filter(filter, '-created_date', 50);
      setResults(Array.isArray(data) ? data : data.items || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-12">
      <PageHeader id="Status Pesanan" en="Order Tracking" />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="relative rounded-2xl bg-primary text-primary-foreground p-6 overflow-hidden">
          <Truck className="absolute -bottom-3 -right-3 text-primary-foreground/15" size={72} />
          <h2 className="font-display font-extrabold text-xl leading-tight">Lacak Pesanan Anda</h2>
          <p className="text-[0.8em] text-primary-foreground/80">Track Your Order</p>
          <p className="text-sm text-primary-foreground/90 mt-2 max-w-lg">
            Masukkan nomor HP atau kode pesanan (mis. TSM-...) untuk melihat status dari diproses hingga selesai dikirim.
          </p>
        </div>

        <BaliPattern className="text-primary/20" height={18} />

        <Card className="p-5 rounded-xl">
          <form onSubmit={search} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="q">Nomor HP / Kode Pesanan</Label>
              <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="0812xxxxxxx atau TSM-20260924-XXXX" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-lg">
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Search className="w-4 h-4 mr-1" />}
              Lacak / Track
            </Button>
          </form>
        </Card>

        {searched && !loading && results.length === 0 && (
          <Card className="p-8 rounded-xl text-center">
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-display font-semibold text-foreground">Pesanan tidak ditemukan</p>
            <p className="text-sm text-muted-foreground/70">No orders found · periksa kembali nomor HP/kode</p>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((o) => {
              const cur = stepIndex(o.status);
              const cancelled = o.status === 'cancelled' || o.status === 'expired';
              return (
                <Card key={o.id} className="p-5 rounded-xl space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="leading-tight">
                      <p className="font-display font-bold text-foreground">{o.order_ref}</p>
                      <p className="text-[0.7em] text-muted-foreground/70">{formatShortDate((o.created_date || '').slice(0, 10))}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-extrabold text-primary">{formatIDR(o.total)}</p>
                      <p className="text-[0.7em] text-muted-foreground/70">{PAY_LABEL[o.payment_method] || o.payment_method}</p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-semibold text-foreground">{o.customer_name}</span> · {o.customer_phone}</p>
                    <p className="text-xs">{o.delivery_address}</p>
                  </div>

                  {cancelled ? (
                    <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
                      <XCircle className="w-5 h-5" />
                      {o.status === 'cancelled' ? 'Pesanan Dibatalkan / Cancelled' : 'Pesanan Kedaluwarsa / Expired'}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        {FLOW.map((f, i) => {
                          const Icon = f.icon;
                          const done = i <= cur;
                          const active = i === cur;
                          return (
                            <div key={f.key} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'} ${active ? 'ring-2 ring-primary/30' : ''}`}>
                                  <Icon className={`w-4 h-4 ${active ? 'animate-pulse' : ''}`} />
                                </div>
                                <span className={`text-[0.6rem] font-semibold leading-tight text-center ${done ? 'text-foreground' : 'text-muted-foreground/60'}`}>{f.id}</span>
                                <span className="text-[0.55rem] text-muted-foreground/50 leading-tight text-center">{f.en}</span>
                              </div>
                              {i < FLOW.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 ${i < cur ? 'bg-primary' : 'bg-border'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">Item / Items</p>
                    {parseItems(o).map((it, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{it.name} × {it.qty} — {formatIDR(it.price * it.qty)}</p>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Link to="/"><Button variant="outline" className="rounded-full px-6"><ShoppingBag className="w-4 h-4 mr-1" />Kembali Belanja / Back to Shop</Button></Link>
        </div>
      </main>
    </div>
  );
}