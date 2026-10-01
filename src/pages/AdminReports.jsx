const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, Lock, RefreshCw, FileSpreadsheet, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatIDR } from '@/lib/format';
import { downloadCSV } from '@/lib/exportCsv';
import { useCategories } from '@/lib/categoriesContext';
import PageHeader from '@/components/marketplace/PageHeader';
import AdminAnalyticsPanel from '@/components/admin/AdminAnalyticsPanel';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const STATUS_OPTS = ['pending', 'paid', 'processing', 'shipped', 'completed', 'expired', 'cancelled'];
const STATUS_LABEL = { pending: 'Menunggu', paid: 'Dibayar', processing: 'Diproses', shipped: 'Dikirim', completed: 'Selesai', expired: 'Kedaluwarsa', cancelled: 'Dibatalkan' };
const PAY_LABEL = { cod: 'COD', virtual_account: 'Virtual Account', qris: 'QRIS' };

const TABS = [
  { key: 'analytics', id: 'Analitik', en: 'Analytics' },
  { key: 'sales', id: 'Penjualan', en: 'Sales' },
  { key: 'harvest', id: 'Panen', en: 'Harvest' },
  { key: 'stock', id: 'Stok', en: 'Stock' },
  { key: 'other', id: 'Lainnya', en: 'Others' },
];

export default function AdminReports() {
  const { toast } = useToast();
  const { labelId } = useCategories();
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState('analytics');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(() => new Set());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [od, pd, rv, vc] = await Promise.all([
        db.entities.Order.list('-created_date', 500),
        db.entities.Product.list('-created_date', 500),
        db.entities.Review.list('-created_date', 500),
        db.entities.Voucher.list('-created_date', 200),
      ]);
      setOrders(Array.isArray(od) ? od : od.items || []);
      setProducts(Array.isArray(pd) ? pd : pd.items || []);
      setReviews(Array.isArray(rv) ? rv : rv.items || []);
      setVouchers(Array.isArray(vc) ? vc : vc.items || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    db.auth.me().then((u) => { if (u?.role !== 'admin') setDenied(true); }).catch(() => setDenied(true));
    fetchAll();
  }, [fetchAll]);

  const updateOrderStatus = async (o, status) => {
    try {
      const updated = await db.entities.Order.update(o.id, { status });
      setOrders((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({ description: 'Status diperbarui / Status updated' });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  const deleteOrder = async (o) => {
    if (!confirm(`Hapus pesanan ${o.order_ref}? / Delete order ${o.order_ref}?`)) return;
    try {
      await db.entities.Order.delete(o.id);
      setOrders((prev) => prev.filter((x) => x.id !== o.id));
      toast({ description: 'Pesanan dihapus / Order deleted' });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  const toggleSelect = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.id));

  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)));

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (!confirm(`Hapus ${ids.length} pesanan terpilih? / Delete ${ids.length} selected orders?`)) return;
    try {
      await Promise.all(ids.map((id) => db.entities.Order.delete(id)));
      setOrders((prev) => prev.filter((o) => !selected.has(o.id)));
      setSelected(new Set());
      toast({ description: `${ids.length} pesanan dihapus / orders deleted` });
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  const updateProduct = async (p, field, value) => {
    try {
      const updated = await db.entities.Product.update(p.id, { [field]: value });
      setProducts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e) {
      toast({ description: 'Gagal / Failed: ' + (e?.message || ''), variant: 'destructive' });
    }
  };

  const exportSales = () => {
    downloadCSV('laporan-penjualan', orders.map((o) => ({
      Ref: o.order_ref,
      Tanggal: (o.created_date || '').slice(0, 10),
      Pelanggan: o.customer_name,
      Telepon: o.customer_phone,
      Metode: PAY_LABEL[o.payment_method] || o.payment_method,
      Status: STATUS_LABEL[o.status] || o.status,
      Total: o.total,
      Voucher: o.voucher_type || 'none',
      Diskon: o.discount_amount || 0,
    })));
  };

  const exportHarvest = () => {
    downloadCSV('laporan-panen', products.map((p) => ({
      Produk: p.name_id || p.name,
      Kategori: labelId(p.category),
      'Jml Panen': p.estimated_stock ?? 0,
      Satuan: p.unit || '',
      Panen: (p.harvest_date || '').slice(0, 10),
      Restock: (p.restock_date || '').slice(0, 10),
      Tersedia: p.in_stock ? 'Ya' : 'Tidak',
      Kecamatan: p.farmer_location || '',
      Subak: p.subak || '',
    })));
  };

  const exportStock = () => {
    downloadCSV('laporan-stok', products.map((p) => ({
      Produk: p.name_id || p.name,
      Kategori: labelId(p.category),
      Harga: p.price,
      Satuan: p.unit,
      Tersedia: p.in_stock ? 'Ya' : 'Tidak',
      Restock: (p.restock_date || '').slice(0, 10),
    })));
  };

  const exportProducts = () => downloadCSV('laporan-produk', products.map((p) => ({
    Produk: p.name_id || p.name, Kategori: labelId(p.category), Harga: p.price, Satuan: p.unit,
    Tersedia: p.in_stock ? 'Ya' : 'Tidak', Organik: p.is_organic ? 'Ya' : 'Tidak', Lokasi: p.farmer_location || '',
  })));
  const exportReviews = () => downloadCSV('laporan-ulasan', reviews.map((r) => ({
    Produk: r.product_id, Rating: r.rating, Nama: r.name, Komentar: r.comment, Disetujui: r.approved ? 'Ya' : 'Tidak',
  })));
  const exportVouchers = () => downloadCSV('laporan-voucher', vouchers.map((v) => ({
    Kode: v.code, Diskon: v.discount_percent, Aktif: v.active ? 'Ya' : 'Tidak', Keterangan: v.description || '',
  })));

  if (denied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Lock className="w-8 h-8 text-destructive" />
        <p className="font-display font-semibold">Akses ditolak / Access denied</p>
        <Button asChild variant="outline"><Link to="/"><ArrowLeft className="w-4 h-4 mr-1" />Kembali</Link></Button>
      </div>
    );
  }

  const totalRevenue = orders.filter((o) => !['cancelled', 'expired'].includes(o.status)).reduce((s, o) => s + (Number(o.total) || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader id="Laporan" en="Reports" />
      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`h-9 px-4 rounded-full text-sm font-semibold ${tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}
              >
                {t.id} <span className="text-[0.7em] opacity-70">· {t.en}</span>
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="rounded-full">
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />Segarkan
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
        ) : (
          <>
            {tab === 'analytics' && (
              <AdminAnalyticsPanel orders={orders} products={products} />
            )}

            {tab === 'sales' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-3">
                    <Card className="p-3 rounded-xl"><p className="text-xs text-muted-foreground">Total Pendapatan</p><p className="font-display font-extrabold text-foreground">{formatIDR(totalRevenue)}</p></Card>
                    <Card className="p-3 rounded-xl"><p className="text-xs text-muted-foreground">Total Pesanan</p><p className="font-display font-extrabold text-foreground">{orders.length}</p></Card>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportSales} className="rounded-full"><Download className="w-4 h-4 mr-1.5" />Export Excel</Button>
                    <Button onClick={deleteSelected} variant="destructive" disabled={!selected.size} className="rounded-full">
                      <Trash2 className="w-4 h-4 mr-1.5" />Hapus Terpilih{selected.size ? ` (${selected.size})` : ''}
                    </Button>
                  </div>
                </div>
                <Card className="p-4 rounded-xl overflow-x-auto">
                  <table className="w-full text-sm min-w-[860px]">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="py-2 pr-2 text-center">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 accent-primary cursor-pointer"
                            aria-label="Pilih semua"
                          />
                        </th>
                        <th className="py-2 pr-3 font-semibold">Ref</th>
                        <th className="py-2 px-3 font-semibold">Tanggal</th>
                        <th className="py-2 px-3 font-semibold">Pelanggan</th>
                        <th className="py-2 px-3 font-semibold">Metode</th>
                        <th className="py-2 px-3 font-semibold">Status</th>
                        <th className="py-2 pl-3 font-semibold text-right">Total</th>
                        <th className="py-2 px-3 font-semibold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-border/60 last:border-0">
                          <td className="py-2 pr-2 text-center">
                            <input
                              type="checkbox"
                              checked={selected.has(o.id)}
                              onChange={() => toggleSelect(o.id)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                              aria-label={`Pilih ${o.order_ref}`}
                            />
                          </td>
                          <td className="py-2 pr-3 font-medium text-foreground">{o.order_ref}</td>
                          <td className="py-2 px-3 text-muted-foreground">{(o.created_date || '').slice(0, 10)}</td>
                          <td className="py-2 px-3 text-muted-foreground">{o.customer_name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{PAY_LABEL[o.payment_method] || o.payment_method}</td>
                          <td className="py-2 px-3">
                            <Select value={o.status} onValueChange={(v) => updateOrderStatus(o, v)}>
                              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2 pl-3 text-right font-display font-semibold">{formatIDR(o.total)}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => deleteOrder(o)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-destructive hover:bg-destructive/10 touch-manipulation"
                              title="Hapus pesanan / Delete order"
                              aria-label="Hapus pesanan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {tab === 'harvest' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={exportHarvest} className="rounded-full"><Download className="w-4 h-4 mr-1.5" />Export Excel</Button>
                </div>
                <Card className="p-4 rounded-xl overflow-x-auto">
                  <table className="w-full text-sm min-w-[960px]">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="py-2 pr-3 font-semibold">Produk</th>
                        <th className="py-2 px-3 font-semibold">Kategori</th>
                        <th className="py-2 px-3 font-semibold text-center">Jml Panen <span className="text-[0.8em] opacity-70">(Qty)</span></th>
                        <th className="py-2 px-3 font-semibold">Kecamatan</th>
                        <th className="py-2 px-3 font-semibold">Subak</th>
                        <th className="py-2 px-3 font-semibold">Tanggal Panen</th>
                        <th className="py-2 pl-3 font-semibold">Tanggal Restock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-border/60 last:border-0">
                          <td className="py-2 pr-3 font-medium text-foreground">{p.name_id || p.name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{labelId(p.category)}</td>
                          <td className="py-2 px-3 text-center">
                            <div className="inline-flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                defaultValue={p.estimated_stock ?? 0}
                                onChange={(e) => updateProduct(p, 'estimated_stock', Number(e.target.value))}
                                className="h-8 w-20 text-xs text-center"
                              />
                              <span className="text-[0.65em] text-muted-foreground/70 whitespace-nowrap">{p.unit || ''}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-muted-foreground">{p.farmer_location || '-'}</td>
                          <td className="py-2 px-3 text-muted-foreground">{p.subak || '-'}</td>
                          <td className="py-2 px-3"><Input type="date" defaultValue={(p.harvest_date || '').slice(0, 10)} onChange={(e) => updateProduct(p, 'harvest_date', e.target.value)} className="h-8 w-40 text-xs" /></td>
                          <td className="py-2 pl-3"><Input type="date" defaultValue={(p.restock_date || '').slice(0, 10)} onChange={(e) => updateProduct(p, 'restock_date', e.target.value)} className="h-8 w-40 text-xs" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {tab === 'stock' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={exportStock} className="rounded-full"><Download className="w-4 h-4 mr-1.5" />Export Excel</Button>
                </div>
                <Card className="p-4 rounded-xl overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="py-2 pr-3 font-semibold">Produk</th>
                        <th className="py-2 px-3 font-semibold">Kategori</th>
                        <th className="py-2 px-3 font-semibold">Harga</th>
                        <th className="py-2 px-3 font-semibold text-center">Stok</th>
                        <th className="py-2 px-3 font-semibold">Tersedia</th>
                        <th className="py-2 pl-3 font-semibold">Restock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-border/60 last:border-0">
                          <td className="py-2 pr-3 font-medium text-foreground">{p.name_id || p.name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{labelId(p.category)}</td>
                          <td className="py-2 px-3 text-muted-foreground">{formatIDR(p.price)}</td>
                          <td className="py-2 px-3 text-center">
                            <Input
                              type="number"
                              min="0"
                              defaultValue={p.estimated_stock ?? 0}
                              onChange={(e) => updateProduct(p, 'estimated_stock', Number(e.target.value))}
                              className="h-8 w-20 text-xs text-center"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() => updateProduct(p, 'in_stock', !p.in_stock)}
                              className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${p.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                            >
                              {p.in_stock ? 'Tersedia' : 'Habis'}
                            </button>
                          </td>
                          <td className="py-2 pl-3"><Input type="date" defaultValue={(p.restock_date || '').slice(0, 10)} onChange={(e) => updateProduct(p, 'restock_date', e.target.value)} className="h-8 w-40 text-xs" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {tab === 'other' && (
              <div className="grid sm:grid-cols-3 gap-4">
                <ReportCard title="Produk" en="Products" count={products.length} onExport={exportProducts} />
                <ReportCard title="Ulasan" en="Reviews" count={reviews.length} onExport={exportReviews} />
                <ReportCard title="Voucher" en="Vouchers" count={vouchers.length} onExport={exportVouchers} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ReportCard({ title, en, count, onExport }) {
  return (
    <Card className="p-5 rounded-xl flex flex-col items-center text-center gap-2">
      <FileSpreadsheet className="w-8 h-8 text-primary" />
      <div className="leading-tight">
        <p className="font-display font-bold text-foreground">{title}</p>
        <p className="text-[0.7em] text-muted-foreground/70">{en}</p>
      </div>
      <p className="text-sm text-muted-foreground">{count} baris</p>
      <Button onClick={onExport} size="sm" className="rounded-full mt-1"><Download className="w-4 h-4 mr-1.5" />Export Excel</Button>
    </Card>
  );
}