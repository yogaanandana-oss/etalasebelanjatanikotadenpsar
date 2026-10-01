const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Search, Package, Plus, Trash2, Lock, Pencil, X,
  ImagePlus, Loader2, CheckCircle2, XCircle, Settings, BarChart3, CalendarDays,
  Star, Ticket, Boxes, Eye, EyeOff, CheckSquare, Square,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatIDR, finalPrice, hasDiscount } from '@/lib/format';
import { Bi } from '@/components/ui/Bi';
import { useCategories } from '@/lib/categoriesContext';
import CategoryManager from '@/components/admin/CategoryManager';
import GradesEditor from '@/components/admin/GradesEditor';

const UNITS = ['per kg', 'per 500g', 'per bunch', 'per fruit', 'per pack', 'per ikat'];

const FARMER_LOCATIONS = ['Denpasar Utara', 'Denpasar Timur', 'Denpasar Selatan', 'Denpasar Barat'];

const todayISO = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  name_id: '',
  name: '',
  category: 'Leafy Greens',
  price: '',
  unit: 'per kg',
  image_url: '',
  description: '',
  in_stock: true,
  discount_percent: '',
  is_organic: false,
  farmer_location: 'Denpasar Utara',
  subak: '',
  qris_image_url: '',
  grades: [],
};

export default function AdminProducts() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [denied, setDenied] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [uploadingQris, setUploadingQris] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const { categories, labelId } = useCategories();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.entities.Product.list('-created_date', 200);
      setProducts(Array.isArray(data) ? data : data.items || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    db.auth.me().then(setMe).catch(() => setMe(null));
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (me && me.role !== 'admin') setDenied(true);
  }, [me]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (catFilter !== 'all' && p.category !== catFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${p.name_id || ''} ${p.name || ''} ${p.category} ${p.description || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, catFilter, query]);

  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter((p) => p.in_stock).length,
    outOfStock: products.filter((p) => !p.in_stock).length,
    categories: new Set(products.map((p) => p.category)).size,
  }), [products]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      setForm((f) => ({ ...f, image_url: file_url }));
      toast({ description: 'Gambar diunggah / Image uploaded' });
    } catch {
      toast({ description: 'Gagal mengunggah / Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const onUploadQris = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQris(true);
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      setForm((f) => ({ ...f, qris_image_url: file_url }));
      toast({ description: 'Gambar QRIS diunggah / QRIS uploaded' });
    } catch {
      toast({ description: 'Gagal mengunggah / Upload failed', variant: 'destructive' });
    } finally {
      setUploadingQris(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name_id.trim() || !form.name.trim() || !form.price) {
      toast({ description: 'Lengkapi nama, harga / Complete name and price', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const grades = (form.grades || [])
        .filter((g) => g.label && String(g.label).trim())
        .map((g) => ({
          label: String(g.label).trim(),
          label_en: (g.label_en || '').trim(),
          weight_kg: g.weight_kg === '' || g.weight_kg == null ? null : Number(g.weight_kg),
          price: Number(g.price) || 0,
        }));
      const payload = {
        name: form.name.trim(),
        name_id: form.name_id.trim(),
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        image_url: form.image_url || '',
        in_stock: form.in_stock,
        description: form.description.trim(),
        discount_percent: Number(form.discount_percent) || 0,
        is_organic: form.is_organic,
        farmer_location: form.farmer_location,
        subak: form.subak.trim(),
        qris_image_url: form.qris_image_url || '',
        grades,
      };
      if (editingId) {
        const updated = await db.entities.Product.update(editingId, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p)));
        setEditingId(null);
        setForm(EMPTY);
        toast({ description: 'Produk diperbarui / Product updated' });
      } else {
        const today = todayISO();
        const created = await db.entities.Product.create({ ...payload, harvest_date: today, restock_date: today, rating: 4.8 });
        setProducts((prev) => [created, ...prev]);
        setForm(EMPTY);
        toast({ description: 'Produk ditambahkan / Product added' });
      }
    } catch (err) {
      toast({ description: 'Gagal menyimpan / Failed to save: ' + (err?.message || ''), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product) => {
    setDeleting(product.id);
    try {
      await db.entities.Product.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast({ description: 'Produk dihapus / Product removed' });
    } catch {
      toast({ description: 'Gagal menghapus / Failed to delete', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  const toggleHidden = async (product) => {
    const next = !product.hidden;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, hidden: next } : p)));
    try {
      await db.entities.Product.update(product.id, { hidden: next });
      toast({ description: next ? 'Produk disembunyikan / Product hidden' : 'Produk ditampilkan / Product visible' });
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, hidden: !next } : p)));
      toast({ description: 'Gagal mengubah / Failed to update', variant: 'destructive' });
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name_id: product.name_id || '',
      name: product.name || '',
      category: product.category || 'Leafy Greens',
      price: product.price ?? '',
      unit: product.unit || 'per kg',
      image_url: product.image_url || '',
      description: product.description || '',
      in_stock: product.in_stock !== false,
      discount_percent: product.discount_percent ?? '',
      is_organic: !!product.is_organic,
      farmer_location: product.farmer_location || 'Denpasar Utara',
      subak: product.subak || '',
      qris_image_url: product.qris_image_url || '',
      grades: Array.isArray(product.grades) ? product.grades.map((g) => ({ ...g })) : [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleSelect = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleSelectAll = () =>
    setSelected((prev) => (allSelected ? new Set() : new Set(filtered.map((p) => p.id))));
  const clearSelection = () => setSelected(new Set());

  const bulkSetHidden = async (ids, next) => {
    if (!ids.length) return;
    const updates = ids.map((id) => ({ id, hidden: next }));
    setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, hidden: next } : p)));
    clearSelection();
    try {
      await db.entities.Product.bulkUpdate(updates);
      toast({ description: next ? `${ids.length} produk disembunyikan / hidden` : `${ids.length} produk ditampilkan / visible` });
    } catch {
      fetchProducts();
      toast({ description: 'Gagal memperbarui / Failed to update', variant: 'destructive' });
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
            <h1 className="font-display font-extrabold text-lg text-foreground">Kelola Produk</h1>
            <p className="text-[0.7em] text-muted-foreground/70">Manage Products</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/admin/orders"><Package className="w-4 h-4 mr-1.5" />Pesanan</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/admin/settings"><Settings className="w-4 h-4 mr-1.5" />Pengaturan</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/admin/reports"><BarChart3 className="w-4 h-4 mr-1.5" />Analitik · Laporan</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/admin/calendar"><CalendarDays className="w-4 h-4 mr-1.5" />Kalender</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/admin/stock-management"><Boxes className="w-4 h-4 mr-1.5" />Stok</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/admin/reviews"><Star className="w-4 h-4 mr-1.5" />Ulasan</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/admin/vouchers"><Ticket className="w-4 h-4 mr-1.5" />Voucher</Link>
            </Button>
            <Button variant="outline" onClick={fetchProducts} disabled={loading} className="rounded-full h-9">
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <Bi id="Segarkan" en="Refresh" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Package} value={stats.total} id="Total Produk" en="Total Products" tone="bg-secondary text-foreground" />
          <StatCard icon={CheckCircle2} value={stats.inStock} id="Tersedia" en="In Stock" tone="bg-emerald-100 text-emerald-700" />
          <StatCard icon={XCircle} value={stats.outOfStock} id="Habis" en="Out of Stock" tone="bg-amber-100 text-amber-700" />
          <StatCard icon={Package} value={stats.categories} id="Kategori" en="Categories" tone="bg-primary/10 text-primary" />
        </div>

        <CategoryManager />

        {/* Form */}
        <Card className="rounded-xl border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            {editingId ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
            <h2 className="font-display font-bold text-foreground">
              {editingId ? 'Edit Produk' : 'Tambah Produk'}{' '}
              <span className="text-muted-foreground/70 font-normal text-sm">· {editingId ? 'Edit Product' : 'Add Product'}</span>
            </h2>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={cancelEdit} className="ml-auto rounded-full h-8">
                <X className="w-4 h-4 mr-1" />Batal / Cancel
              </Button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nama (Indonesia) <span className="text-destructive">*</span></Label>
              <Input
                value={form.name_id}
                onChange={(e) => setForm((f) => ({ ...f, name_id: e.target.value }))}
                placeholder="cth. Kangkung"
                className="h-10 bg-card"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nama (English) <span className="text-destructive">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Water Spinach"
                className="h-10 bg-card"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori / Category <span className="text-destructive">*</span></Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label_id} · {c.label_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Harga (IDR) <span className="text-destructive">*</span></Label>
                <Input
                  type="number" min="0" step="500"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="15000"
                  className="h-10 bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Satuan / Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}>
                  <SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Diskon (%) / Discount (%)</Label>
                <Input
                  type="number" min="0" max="100" step="5"
                  value={form.discount_percent}
                  onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))}
                  placeholder="0"
                  className="h-10 bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Lokasi Petani / Farmer Location</Label>
                <Select value={form.farmer_location} onValueChange={(v) => setForm((f) => ({ ...f, farmer_location: v }))}>
                  <SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FARMER_LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Subak (Irigasi Adat) / Subak</Label>
              <Input
                value={form.subak}
                onChange={(e) => setForm((f) => ({ ...f, subak: e.target.value }))}
                placeholder="cth. Subak Sembung"
                className="h-10 bg-card"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Gambar / Image</Label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
                  <span className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-dashed border-border bg-card text-sm font-medium hover:bg-secondary">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    {uploading ? 'Mengunggah…' : 'Unggah / Upload'}
                  </span>
                </label>
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-border" />
                )}
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="atau tempel URL gambar…"
                  className="h-10 bg-card flex-1"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Gambar QRIS / QRIS Image</Label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={onUploadQris} disabled={uploadingQris} />
                  <span className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-dashed border-border bg-card text-sm font-medium hover:bg-secondary">
                    {uploadingQris ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    {uploadingQris ? 'Mengunggah…' : 'Unggah QRIS / Upload'}
                  </span>
                </label>
                {form.qris_image_url && (
                  <img src={form.qris_image_url} alt="QRIS preview" className="w-14 h-14 rounded-lg object-cover border border-border bg-white p-0.5" />
                )}
                <Input
                  value={form.qris_image_url}
                  onChange={(e) => setForm((f) => ({ ...f, qris_image_url: e.target.value }))}
                  placeholder="atau tempel URL gambar QRIS…"
                  className="h-10 bg-card flex-1"
                />
              </div>
              <p className="text-[0.7em] text-muted-foreground/70">QR code merchant QRIS per produk (boleh kosong untuk ikut QRIS toko).</p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Deskripsi / Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Deskripsi singkat produk…"
                rows={3}
                className="bg-card"
              />
            </div>

            <div className="md:col-span-2">
              <GradesEditor
                grades={form.grades}
                onChange={(grades) => setForm((f) => ({ ...f, grades }))}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.in_stock}
                  onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked }))}
                  className="w-4 h-4 accent-[hsl(var(--primary))]"
                />
                <span className="font-medium text-foreground">Tersedia / In stock</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.is_organic}
                  onChange={(e) => setForm((f) => ({ ...f, is_organic: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-500"
                />
                <span className="font-medium text-foreground">Organik / Organic</span>
              </label>
              <div className="ml-auto">
                <Button type="submit" disabled={saving} className="rounded-full h-10 px-6">
                  {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : editingId ? <Pencil className="w-4 h-4 mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                  {editingId ? 'Simpan Perubahan / Update' : 'Simpan Produk / Save'}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama produk… / Search products…"
              className="pl-9 h-10 rounded-full bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            <button
              onClick={() => setCatFilter('all')}
              className={`shrink-0 h-9 px-3.5 rounded-full text-sm font-semibold transition-colors ${
                catFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border hover:text-foreground'
              }`}
            >
              Semua / All
            </button>
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCatFilter(c.key)}
                className={`shrink-0 h-9 px-3.5 rounded-full text-sm font-semibold transition-colors ${
                  catFilter === c.key ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                {c.label_id}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk selection toolbar */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
          <button
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-full text-sm font-semibold bg-secondary text-foreground hover:bg-secondary/70 transition-colors"
          >
            {allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
            {allSelected ? 'Batal Pilih / Clear' : 'Pilih Semua / Select All'}
          </button>
          {selected.size > 0 && (
            <span className="text-sm text-muted-foreground">{selected.size} produk dipilih / selected</span>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={selected.size === 0}
              onClick={() => bulkSetHidden([...selected], true)}
              className="rounded-full h-9"
            >
              <EyeOff className="w-4 h-4 mr-1.5" />Sembunyikan Dipilih / Hide Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={selected.size === 0}
              onClick={() => bulkSetHidden([...selected], false)}
              className="rounded-full h-9"
            >
              <Eye className="w-4 h-4 mr-1.5" />Tampilkan Dipilih / Show Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkSetHidden(filtered.map((p) => p.id), true)}
              className="rounded-full h-9"
            >
              <EyeOff className="w-4 h-4 mr-1.5" />Sembunyikan Semua / Hide All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkSetHidden(filtered.map((p) => p.id), false)}
              className="rounded-full h-9"
            >
              <Eye className="w-4 h-4 mr-1.5" />Tampilkan Semua / Show All
            </Button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-square bg-secondary animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-secondary rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="font-display font-semibold text-foreground">Tidak ada produk</p>
            <p className="text-sm text-muted-foreground/70 mt-1">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <ProductGridItem
                key={p.id}
                product={p}
                onDelete={removeProduct}
                deleting={deleting === p.id}
                onToggleHidden={toggleHidden}
                onEdit={startEdit}
                selected={selected.has(p.id)}
                onToggleSelect={() => toggleSelect(p.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, value, id, en, tone }) {
  return (
    <Card className="p-4 rounded-xl border-border">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-display font-extrabold text-xl text-foreground leading-tight">{value}</p>
      <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{en}</p>
      <p className="text-xs text-muted-foreground leading-tight">{id}</p>
    </Card>
  );
}

function ProductGridItem({ product, onDelete, deleting, onToggleHidden, onEdit, selected, onToggleSelect }) {
  const { labelId } = useCategories();
  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-secondary">
        <label className="absolute top-1.5 left-1.5 z-20 cursor-pointer flex items-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded accent-[hsl(var(--primary))]"
          />
        </label>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name_id || product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}
        <span className={`absolute top-1.5 left-9 rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
          product.in_stock ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
        }`}>
          {product.in_stock ? 'Tersedia' : 'Habis'}
        </span>
        {hasDiscount(product) && (
          <span className="absolute top-2 right-2 rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[0.6rem] font-extrabold">
            -{product.discount_percent}%
          </span>
        )}
        {product.is_organic && (
          <span className="absolute bottom-2 left-2 rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[0.6rem] font-bold">
            Organik
          </span>
        )}
        {product.is_sample && (
          <span className="absolute bottom-2 left-2 rounded-full bg-foreground/70 text-background px-2 py-0.5 text-[0.6rem] font-bold">
            Contoh · Sample
          </span>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            onClick={() => onEdit(product)}
            className="w-7 h-7 rounded-full bg-white/90 hover:bg-secondary text-foreground flex items-center justify-center shadow-sm transition-colors"
            aria-label="Edit / Edit"
            title="Edit / Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleHidden(product)}
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors ${
              product.hidden ? 'bg-amber-500 text-white' : 'bg-white/90 hover:bg-secondary text-foreground'
            }`}
            aria-label="Sembunyikan / Hide"
            title={product.hidden ? 'Tampilkan / Show' : 'Sembunyikan / Hide'}
          >
            {product.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDelete(product)}
            disabled={deleting}
            className="w-7 h-7 rounded-full bg-white/90 hover:bg-destructive hover:text-white text-destructive flex items-center justify-center shadow-sm transition-colors"
            aria-label="Hapus / Delete"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
        {product.hidden && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[0.65rem] font-bold flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Disembunyikan · Hidden
            </span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="font-display font-bold text-sm text-foreground leading-tight truncate">{product.name_id || product.name}</p>
        <p className="text-[0.7em] text-muted-foreground/70 truncate">{product.name}</p>
        <span className="mt-1 inline-block self-start rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
          {labelId(product.category)}
        </span>
        {product.subak && (
          <span className="mt-1 inline-block self-start text-[0.65rem] text-sky-700 truncate">
            💧 {product.subak}
          </span>
        )}
        {product.farmer_location && (
          <span className="inline-block self-start text-[0.65rem] text-muted-foreground truncate">
            📍 {product.farmer_location}
          </span>
        )}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            <p className="font-display font-extrabold text-foreground text-sm">{formatIDR(finalPrice(product))}</p>
            {hasDiscount(product) && <p className="text-[0.65rem] text-muted-foreground line-through">{formatIDR(product.price)}</p>}
          </div>
          <p className="text-[0.65rem] text-muted-foreground">{product.unit}</p>
        </div>
      </div>
    </div>
  );
}