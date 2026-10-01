import React, { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, ShoppingBag, CheckCircle2, Wallet, Package, Leaf, MapPin,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatIDR, formatShortDate } from '@/lib/format';

const PAY_COLORS = { cod: 'hsl(150 100% 26%)', virtual_account: 'hsl(38 92% 50%)', qris: 'hsl(197 37% 40%)' };
const PAY_LABEL = { cod: 'COD', virtual_account: 'Virtual Account', qris: 'QRIS' };
const CAT_LABEL = {
  'Leafy Greens': 'Sayuran Berdaun',
  'Chili & Spices': 'Cabai & Rempah',
  'Fruit Vegetables': 'Sayuran Buah',
  'Fruits': 'Buah-buahan',
};
const catLabel = (c) => CAT_LABEL[c] || c || '—';
const EXCLUDE = new Set(['cancelled', 'expired']);

const parseItems = (o) => {
  try {
    const a = JSON.parse(o.items_json || '[]');
    if (!Array.isArray(a)) return [];
    return a.map((it) => {
      const p = it.product || it;
      return {
        name: p.name || it.name || 'Produk',
        name_id: p.name_id || p.name || it.name_id || it.name || '',
        qty: Number(it.quantity ?? it.qty) || 1,
        price: Number(p.price ?? it.price) || 0,
        unit: p.unit || it.unit || '',
        category: p.category || it.category || '',
      };
    });
  } catch { return []; }
};

const StatCard = ({ icon: Icon, value, id, en, tone }) => (
  <Card className="p-4 rounded-xl">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-xs text-muted-foreground font-semibold leading-tight">{id}</p>
    <p className="text-[0.65rem] text-muted-foreground/70 leading-tight">{en}</p>
    <p className="font-display font-extrabold text-lg text-foreground mt-1">{value}</p>
  </Card>
);

export default function AdminAnalyticsPanel({ orders, products }) {
  const valid = useMemo(() => orders.filter((o) => !EXCLUDE.has(o.status)), [orders]);
  const totalRevenue = useMemo(() => valid.reduce((s, o) => s + (Number(o.total) || 0), 0), [valid]);
  const totalOrders = valid.length;
  const completed = useMemo(() => valid.filter((o) => o.status === 'completed').length, [valid]);
  const aov = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  const daily = useMemo(() => {
    const map = new Map();
    valid.forEach((o) => {
      const day = (o.created_date || '').slice(0, 10);
      if (!day) return;
      map.set(day, (map.get(day) || 0) + (Number(o.total) || 0));
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-14)
      .map(([d, v]) => ({ date: formatShortDate(d), revenue: v }));
  }, [valid]);

  const topProducts = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => parseItems(o).forEach((it) => {
      const name = it.name_id || it.name || 'Produk';
      map.set(name, (map.get(name) || 0) + (Number(it.qty) || 1));
    }));
    return [...map.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [orders]);

  const payBreakdown = useMemo(() => {
    const map = new Map();
    valid.forEach((o) => { const k = o.payment_method || 'cod'; map.set(k, (map.get(k) || 0) + 1); });
    return [...map.entries()].map(([k, v]) => ({ name: PAY_LABEL[k] || k, value: v, key: k }));
  }, [valid]);

  const productIndex = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.name_id) map.set(p.name_id.toLowerCase(), p);
      if (p.name) map.set(p.name.toLowerCase(), p);
    });
    return map;
  }, [products]);

  const productDetail = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => parseItems(o).forEach((it) => {
      const name = it.name_id || it.name || 'Produk';
      const qty = Number(it.qty) || 1;
      const line = (Number(it.price) || 0) * qty;
      const e = map.get(name) || { name, qty: 0, revenue: 0, orders: new Set(), category: '', unit: '' };
      e.qty += qty;
      e.revenue += line;
      e.orders.add(o.id);
      if (!e.category) e.category = it.category || '';
      if (!e.unit) e.unit = it.unit || '';
      map.set(name, e);
    }));
    return [...map.values()]
      .map((e) => {
        const prod = productIndex.get(e.name.toLowerCase());
        return {
          name: e.name,
          qty: e.qty,
          revenue: e.revenue,
          orders: e.orders.size,
          avgPrice: e.qty ? Math.round(e.revenue / e.qty) : 0,
          category: e.category || prod?.category || '—',
          is_organic: !!prod?.is_organic,
          farmer_location: prod?.farmer_location || '—',
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders, productIndex]);

  const dailyDetail = useMemo(() => {
    const map = new Map();
    valid.forEach((o) => {
      const day = (o.created_date || '').slice(0, 10);
      if (!day) return;
      const e = map.get(day) || { day, orders: 0, revenue: 0 };
      e.orders += 1;
      e.revenue += Number(o.total) || 0;
      map.set(day, e);
    });
    return [...map.values()].sort((a, b) => b.day.localeCompare(a.day));
  }, [valid]);

  const payDetail = useMemo(() => {
    const map = new Map();
    valid.forEach((o) => {
      const k = o.payment_method || 'cod';
      const e = map.get(k) || { key: k, name: PAY_LABEL[k] || k, orders: 0, revenue: 0 };
      e.orders += 1;
      e.revenue += Number(o.total) || 0;
      map.set(k, e);
    });
    const total = valid.length || 1;
    return [...map.values()]
      .map((e) => ({ ...e, share: Math.round((e.orders / total) * 100) }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [valid]);

  const empty = orders.length === 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Wallet} value={formatIDR(totalRevenue)} id="Total Pendapatan" en="Total Revenue" tone="bg-primary/10 text-primary" />
        <StatCard icon={ShoppingBag} value={totalOrders} id="Total Pesanan" en="Total Orders" tone="bg-secondary text-foreground" />
        <StatCard icon={CheckCircle2} value={completed} id="Pesanan Selesai" en="Completed" tone="bg-emerald-100 text-emerald-700" />
        <StatCard icon={TrendingUp} value={formatIDR(aov)} id="Rata-rata Pesanan" en="Avg. Order Value" tone="bg-amber-100 text-amber-700" />
      </div>

      {empty ? (
        <Card className="p-10 rounded-xl text-center">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="font-display font-semibold text-foreground">Belum ada data pesanan</p>
          <p className="text-sm text-muted-foreground/70">No order data yet</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5 rounded-xl">
            <h2 className="font-display font-bold text-foreground mb-1">Pendapatan Harian</h2>
            <p className="text-[0.7em] text-muted-foreground/70 mb-4">Daily Revenue · 14 hari terakhir</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(150 100% 26%)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(150 100% 26%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(133 19% 90%)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(138 11% 50%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(138 11% 50%)" tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                  <Tooltip formatter={(v) => formatIDR(v)} contentStyle={{ borderRadius: 12, border: '1px solid hsl(133 19% 90%)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(150 100% 26%)" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 rounded-xl">
            <h2 className="font-display font-bold text-foreground mb-1">Metode Pembayaran</h2>
            <p className="text-[0.7em] text-muted-foreground/70 mb-4">Payment Methods</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payBreakdown} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                    {payBreakdown.map((e) => (
                      <Cell key={e.key} fill={PAY_COLORS[e.key] || 'hsl(150 100% 26%)'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} pesanan`} contentStyle={{ borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {payBreakdown.map((e) => (
                <span key={e.key} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PAY_COLORS[e.key] || 'hsl(150 100% 26%)' }} />
                  {e.name} · {e.value}
                </span>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-3 p-5 rounded-xl">
            <h2 className="font-display font-bold text-foreground mb-1">Produk Terlaris</h2>
            <p className="text-[0.7em] text-muted-foreground/70 mb-4">Top Selling Products · berdasarkan jumlah terjual</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(133 19% 90%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(138 11% 50%)" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(138 11% 50%)" width={120} />
                  <Tooltip cursor={{ fill: 'hsl(133 19% 95%)' }} formatter={(v) => `${v} terjual`} contentStyle={{ borderRadius: 12 }} />
                  <Bar dataKey="qty" fill="hsl(38 92% 50%)" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {!empty && (
        <div className="space-y-4">
          <Card className="p-5 rounded-xl">
            <h2 className="font-display font-bold text-foreground mb-1">Rincian Penjualan Produk</h2>
            <p className="text-[0.7em] text-muted-foreground/70 mb-4">Product Sales Detail · per produk</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4 font-semibold">Produk</th>
                    <th className="py-2 px-3 font-semibold">Kategori</th>
                    <th className="py-2 px-3 font-semibold">Organik</th>
                    <th className="py-2 px-3 font-semibold">Lokasi Petani</th>
                    <th className="py-2 px-3 font-semibold text-right">Terjual</th>
                    <th className="py-2 px-3 font-semibold text-right">Harga Avg</th>
                    <th className="py-2 pl-3 font-semibold text-right">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {productDetail.map((p) => (
                    <tr key={p.name} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground">{p.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-foreground text-xs font-medium">{catLabel(p.category)}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {p.is_organic ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            <Leaf className="w-3 h-3" />Organik
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/70">Anorganik</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />{p.farmer_location}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">{p.qty}</td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">{formatIDR(p.avgPrice)}</td>
                      <td className="py-2.5 pl-3 text-right font-display font-semibold text-foreground">{formatIDR(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-5 rounded-xl">
              <h2 className="font-display font-bold text-foreground mb-1">Pendapatan Harian</h2>
              <p className="text-[0.7em] text-muted-foreground/70 mb-4">Daily Revenue Detail</p>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-2 pr-4 font-semibold">Tanggal</th>
                      <th className="py-2 px-3 font-semibold text-right">Pesanan</th>
                      <th className="py-2 pl-3 font-semibold text-right">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyDetail.map((d) => (
                      <tr key={d.day} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-foreground">{formatShortDate(d.day)}</td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">{d.orders}</td>
                        <td className="py-2.5 pl-3 text-right font-display font-semibold text-foreground">{formatIDR(d.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5 rounded-xl">
              <h2 className="font-display font-bold text-foreground mb-1">Rincian Metode Pembayaran</h2>
              <p className="text-[0.7em] text-muted-foreground/70 mb-4">Payment Method Detail</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-2 pr-4 font-semibold">Metode</th>
                      <th className="py-2 px-3 font-semibold text-right">Pesanan</th>
                      <th className="py-2 px-3 font-semibold text-right">Share</th>
                      <th className="py-2 pl-3 font-semibold text-right">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payDetail.map((p) => (
                      <tr key={p.key} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-foreground">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: PAY_COLORS[p.key] || 'hsl(150 100% 26%)' }} />
                            {p.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">{p.orders}</td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">{p.share}%</td>
                        <td className="py-2.5 pl-3 text-right font-display font-semibold text-foreground">{formatIDR(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}