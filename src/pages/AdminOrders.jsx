const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Search, Package, Wallet, Truck, CheckCircle2,
  ChevronDown, ChevronUp, Phone, MapPin, Receipt, Lock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatIDR, finalPrice } from '@/lib/format';
import { buildCustomerMessage } from '@/lib/shopConfig';
import { STATUS_META } from '@/components/admin/OrderStatusBadge';
import { Bi } from '@/components/ui/Bi';

const FILTER_TABS = ['all', 'pending', 'paid', 'processing', 'shipped', 'completed', 'expired', 'cancelled'];

const PAYMENT_LABEL = {
  cod: 'COD (Bayar di Tempat)',
  virtual_account: 'Transfer Bank (VA)',
  qris: 'QRIS',
};

function parseItems(json) {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.entities.Order.list('-created_date', 200);
      setOrders(Array.isArray(data) ? data : data.items || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    db.auth.me().then(setMe).catch(() => setMe(null));
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (me && me.role !== 'admin') setDenied(true);
  }, [me]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (tab !== 'all' && o.status !== tab) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${o.order_ref} ${o.customer_name} ${o.customer_phone} ${o.items_summary}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, tab, query]);

  const stats = useMemo(() => {
    const sum = (pred) => orders.filter(pred).reduce((acc, o) => acc + (o.total || 0), 0);
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      paid: orders.filter((o) => o.status === 'paid').length,
      inDelivery: orders.filter((o) => ['processing', 'shipped'].includes(o.status)).length,
      revenue: sum((o) => ['paid', 'processing', 'shipped', 'completed'].includes(o.status)),
    };
  }, [orders]);

  const updateStatus = async (order, status) => {
    setUpdating(order.id);
    try {
      const updated = await db.entities.Order.update(order.id, { status });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : updated)));
      toast({ description: `Status diperbarui: ${STATUS_META[status]?.id} / Status updated: ${STATUS_META[status]?.en}` });
    } catch (e) {
      toast({ description: 'Gagal memperbarui status / Failed to update status', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-destructive" />
        </div>
        <p className="font-display font-semibold text-foreground">Akses ditolak</p>
        <p className="text-sm text-muted-foreground/70">Access denied</p>
        <p className="text-sm text-muted-foreground">Halaman ini khusus admin.</p>
        <p className="text-sm text-muted-foreground/70">This page is admin-only.</p>
        <Button asChild variant="outline" className="rounded-full mt-2">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-1.5" />Kembali / Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div className="leading-tight">
            <h1 className="font-display font-extrabold text-lg text-foreground">Kelola Pesanan</h1>
            <p className="text-[0.7em] text-muted-foreground/70">Manage Orders</p>
          </div>
          <div className="ml-auto">
            <Button variant="outline" onClick={fetchOrders} disabled={loading} className="rounded-full h-9">
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <Bi id="Segarkan" en="Refresh" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard icon={Receipt} value={stats.total} id="Total Pesanan" en="Total Orders" tone="bg-secondary text-foreground" />
          <StatCard icon={Wallet} value={stats.pending} id="Menunggu" en="Pending" tone="bg-amber-100 text-amber-700" />
          <StatCard icon={CheckCircle2} value={stats.paid} id="Dibayar" en="Paid" tone="bg-blue-100 text-blue-700" />
          <StatCard icon={Truck} value={stats.inDelivery} id="Dalam Pengiriman" en="In Delivery" tone="bg-purple-100 text-purple-700" />
          <StatCard icon={Package} value={formatIDR(stats.revenue)} id="Pendapatan" en="Revenue" tone="bg-primary/10 text-primary" money />
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari ref / nama / No. HP… / Search ref / name / phone…"
              className="pl-9 h-10 rounded-full bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {FILTER_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 h-9 px-3.5 rounded-full text-sm font-semibold transition-colors ${
                  tab === t ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                {t === 'all' ? 'Semua' : STATUS_META[t]?.id}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="h-5 w-1/3 bg-secondary rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-secondary rounded animate-pulse mt-3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="font-display font-semibold text-foreground">Tidak ada pesanan</p>
            <p className="text-sm text-muted-foreground/70 mt-1">No orders found</p>
            <p className="text-sm text-muted-foreground mt-2">Coba ubah filter atau kata kunci pencarian.</p>
            <p className="text-sm text-muted-foreground/70">Try a different filter or search term.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expanded === order.id}
                onToggle={() => setExpanded((p) => (p === order.id ? null : order.id))}
                onStatusChange={(status) => updateStatus(order, status)}
                updating={updating === order.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, value, id, en, tone, money }) {
  return (
    <Card className="p-4 rounded-xl border-border">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-display font-extrabold text-xl text-foreground leading-tight">{value}{money ? '' : ''}</p>
      <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{en}</p>
      <p className="text-xs text-muted-foreground leading-tight">{id}</p>
    </Card>
  );
}

function OrderCard({ order, expanded, onToggle, onStatusChange, updating }) {
  const items = parseItems(order.items_json);
  const created = order.created_date ? new Date(order.created_date) : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-foreground">{order.order_ref}</span>
            <StatusPill status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {order.customer_name} · {PAYMENT_LABEL[order.payment_method] || order.payment_method}
          </p>
          {created && (
            <p className="text-xs text-muted-foreground/70">
              {created.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-extrabold text-foreground">{formatIDR(order.total)}</p>
          <p className="text-xs text-muted-foreground">{order.items_summary?.split(' · ').length || 0} item</p>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4 bg-secondary/30">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Daftar Pesanan / Order Items
            </p>
            {items.length ? (
              <div className="space-y-2">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate">
                      {product.name_id || product.name} <span className="text-muted-foreground">× {quantity}{product.in_stock ? '' : ' · Pre-Order'}</span>
                    </span>
                    <span className="font-semibold text-foreground shrink-0 ml-2">{formatIDR(finalPrice(product) * quantity)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{order.items_summary}</p>
            )}
          </div>

          {/* Customer */}
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-foreground font-medium">{order.customer_name}</p>
                <p className="text-muted-foreground">{order.customer_phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-muted-foreground">{order.delivery_address}</p>
            </div>
          </div>

          {/* Status control */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">
                Ubah Status / Update Status
              </label>
              <Select value={order.status} onValueChange={onStatusChange} disabled={updating}>
                <SelectTrigger className="h-10 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.id} · {meta.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <a
              href={`https://wa.me/${(order.customer_phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(
                buildCustomerMessage({
                  orderRef: order.order_ref,
                  customerName: order.customer_name,
                  total: order.total,
                  status: order.status,
                  method: order.payment_method,
                  bank: order.bank,
                })
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold"
            >
              <Phone className="w-4 h-4" />
              Kirim Konfirmasi
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold ${meta.tone}`}>
      {meta.id}
    </span>
  );
}