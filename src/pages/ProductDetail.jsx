const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Star, Sprout, MapPin, Leaf, CalendarClock, Tag, Plus, Clock, Truck, CheckCircle2, Loader2, Package, Pencil, Palette,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Bi } from '@/components/ui/Bi';
import { useCart } from '@/lib/cartContext';
import { formatIDR, formatShortDate, daysSince, daysUntil, finalPrice, hasDiscount } from '@/lib/format';
import { getGrades, defaultGrade, gradePrice, gradeWeightLabel, isWeightPriced } from '@/lib/grades';
import BaliPattern from '@/components/marketplace/BaliPattern';
import BaliDoodle from '@/components/marketplace/BaliDoodle';
import ProductReviews from '@/components/marketplace/ProductReviews';
import ProductEditSheet from '@/components/marketplace/ProductEditSheet';

export default function ProductDetail() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [weight, setWeight] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    db.entities.Product.get(id)
      .then((p) => {
        setProduct(p);
        const dg = defaultGrade(p);
        setSelectedGrade(dg);
        if (isWeightPriced(p) && dg?.weight_kg) setWeight(String(dg.weight_kg));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // When grade changes on a weight-priced product, prefill the grade's typical weight.
  const onGradeSelect = (g) => {
    setSelectedGrade(g);
    if (isWeightPriced(product) && g?.weight_kg) setWeight(String(g.weight_kg));
  };

  useEffect(() => {
    db.auth.me().then((u) => setIsAdmin(u?.role === 'admin')).catch(() => setIsAdmin(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !product || product.hidden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Package className="w-12 h-12 text-muted-foreground/40" />
        <p className="font-display font-bold text-foreground">Produk tidak ditemukan</p>
        <p className="text-sm text-muted-foreground/70">Product not found</p>
        <Link to="/"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1" />Kembali ke Beranda</Button></Link>
      </div>
    );
  }

  const sinceDays = daysSince(product.harvest_date);
  const untilRestock = daysUntil(product.restock_date);
  const canPreOrder = !product.in_stock && product.restock_date;
  const grades = getGrades(product);
  const weightPriced = isWeightPriced(product);
  const perKgPrice = grades.length ? gradePrice(product, selectedGrade) : 0;
  const weightNum = Number(weight) || 0;
  const price = grades.length
    ? (weightPriced ? Math.round(perKgPrice * weightNum) : perKgPrice)
    : finalPrice(product);
  const organic = !!product.is_organic;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-12">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 h-14 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <p className="font-display font-semibold text-foreground truncate">{product.name_id || product.name}</p>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="ml-auto rounded-full h-9">
              <Pencil className="w-4 h-4 mr-1.5" />Edit Produk
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <BaliPattern className="text-primary/20 mb-5" height={18} />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary/40">
            <div className="absolute top-3 left-3 z-10">
              <BaliDoodle className="text-primary/30" size={48} />
            </div>
            <Image src={product.image_url} alt={product.name} className="w-full aspect-square" fittingType="fill" />
            {hasDiscount(product) && (
              <div className="absolute top-3 right-3 inline-flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-extrabold shadow">
                <Tag className="w-4 h-4" />-{product.discount_percent}%
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${organic ? 'bg-emerald-500 text-white' : 'bg-foreground/70 text-background'}`}>
                  <Leaf className="w-3 h-3" />{organic ? 'Organik' : 'Anorganik'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Sprout className="w-3 h-3" />{sinceDays <= 0 ? 'Dipetik hari ini' : `${sinceDays} hari segar`}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-foreground text-xs font-bold">
                  <Star className="w-3 h-3 fill-accent text-accent" />{product.rating?.toFixed(1)}
                </span>
                {product.color && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
                    <Palette className="w-3.5 h-3.5" />Warna: {product.color}
                  </span>
                )}
              </div>
              <h1 className="font-display font-extrabold text-2xl text-foreground leading-tight">{product.name_id || product.name}</h1>
              <p className="text-sm text-muted-foreground">{product.name}</p>
            </div>

            <div className="flex items-baseline gap-2 flex-wrap">
              {weightPriced && grades.length && selectedGrade ? (
                <>
                  <span className="font-display font-extrabold text-2xl text-primary">{formatIDR(perKgPrice)}</span>
                  <span className="text-sm text-muted-foreground">/ kg</span>
                  <span className="text-xs text-muted-foreground">· ukuran {selectedGrade.label}</span>
                </>
              ) : (
                <>
                  <span className="font-display font-extrabold text-2xl text-primary">{formatIDR(price)}</span>
                  {grades.length && selectedGrade ? (
                    <span className="text-sm text-muted-foreground line-through">{formatIDR(finalPrice(product))}</span>
                  ) : hasDiscount(product) ? (
                    <span className="text-base text-muted-foreground line-through">{formatIDR(product.price)}</span>
                  ) : null}
                  <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                  {grades.length > 0 && selectedGrade && (
                    <span className="text-xs text-muted-foreground">· {gradeWeightLabel(selectedGrade) || 'berat belum ditentukan'}</span>
                  )}
                </>
              )}
            </div>

            {grades.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground flex flex-col leading-tight">
                  Pilih Ukuran
                  <span className="text-[0.7em] text-muted-foreground/70 font-normal leading-tight">Choose size</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {grades.map((g) => {
                    const active = selectedGrade?.label === g.label;
                    return (
                      <button
                        key={g.label}
                        onClick={() => onGradeSelect(g)}
                        className={`rounded-xl border p-3 text-center transition-colors ${
                          active ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'
                        }`}
                      >
                        <span className="block font-semibold text-sm text-foreground leading-tight">{g.label}</span>
                        {g.label_en && <span className="block text-[0.7em] text-muted-foreground/70 leading-tight">{g.label_en}</span>}
                        <span className="block text-[0.7em] text-muted-foreground mt-1 leading-tight">{gradeWeightLabel(g) || '—'}</span>
                        <span className="block font-display font-bold text-sm text-primary mt-1 leading-tight">{formatIDR(gradePrice(product, g))}{weightPriced ? '/kg' : ''}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {weightPriced && grades.length > 0 && selectedGrade && (
              <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <label htmlFor="weight-input" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-primary" />
                  Masukkan berat buah (kg)
                  <span className="text-muted-foreground/70 font-normal text-xs">· Enter fruit weight</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="weight-input"
                    type="number"
                    inputMode="decimal"
                    min="0.1"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 h-11 rounded-lg border border-border bg-card px-3 text-base font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-muted-foreground">kg</span>
                </div>
                {weightNum > 0 && (
                  <div className="flex items-center justify-between text-sm pt-1">
                    <span className="text-muted-foreground">{formatIDR(perKgPrice)} × {weightNum} kg</span>
                    <span className="font-display font-extrabold text-primary text-base">{formatIDR(price)}</span>
                  </div>
                )}
                {weightNum <= 0 && (
                  <p className="text-xs text-accent">Masukkan berat untuk menghitung harga final / Enter weight to calculate price</p>
                )}
              </div>
            )}

            {product.farmer_location && (
              <Link to="/farmers" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 hover:border-primary/40 transition-colors">
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"><MapPin className="w-5 h-5" /></span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-foreground">
                    Petani {product.farmer_location}{product.subak ? ` · ${product.subak}` : ''}
                  </span>
                  <span className="text-[0.7em] text-muted-foreground/70">Lihat daftar petani / View farmers</span>
                </span>
              </Link>
            )}

            {product.color && (
              <div className="rounded-xl border border-border bg-card p-3 space-y-3">
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-foreground">Warna: {product.color}</span>
                  <span className="text-[0.7em] text-muted-foreground/70">Color</span>
                </span>
                {product.color_image_url && (
                  <Image src={product.color_image_url} alt="Warna daging" className="w-full aspect-[3/2] rounded-[50%] object-cover ring-1 ring-border" />
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary/60 p-3">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />Panen</p>
                <p className="text-[0.65rem] text-muted-foreground/70">Harvest Date</p>
                <p className="font-semibold text-foreground mt-0.5">{formatShortDate(product.harvest_date)}</p>
              </div>
              <div className="rounded-xl bg-secondary/60 p-3">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Truck className="w-3.5 h-3.5" />Restock</p>
                <p className="text-[0.65rem] text-muted-foreground/70">Next Restock</p>
                <p className="font-semibold text-foreground mt-0.5">{formatShortDate(product.restock_date)}</p>
              </div>
            </div>

            {product.in_stock ? (
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle2 className="w-4 h-4" />Tersedia / In Stock{product.estimated_stock > 0 ? ` · ~${product.estimated_stock} ${product.unit?.replace('per ', '') || 'unit'}` : ''}</div>
            ) : canPreOrder ? (
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"><Clock className="w-4 h-4" />Pre-Order · tersedia {formatShortDate(product.restock_date)}</div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600">Stok habis / Out of stock</div>
            )}

            <Button
              onClick={() => addItem(product, { grade: selectedGrade, weight: weightPriced ? weightNum : null })}
              disabled={(!product.in_stock && !canPreOrder) || (grades.length > 0 && !selectedGrade) || (weightPriced && weightNum <= 0)}
              className="w-full h-12 text-base"
            >
              {product.in_stock
                ? <><Plus className="w-5 h-5 mr-1" /><Bi id="Tambah ke Keranjang" en="Add to Cart" /></>
                : <><Clock className="w-4 h-4 mr-1" /><Bi id="Pre-Order Sekarang" en="Pre-Order Now" /></>}
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <BaliPattern className="text-primary/20 mb-4" height={18} />
          <h2 className="font-display font-bold text-lg text-foreground mb-2">Deskripsi Produk</h2>
          <p className="text-[0.7em] text-muted-foreground/70 mb-3">Product Description</p>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
            {product.description || `${product.name_id || product.name} adalah produk segar dari petani ${product.farmer_location || 'Kota Denpasar'} yang dipanen langsung dari kebun dan dikirimkan kepada Anda.`}
          </p>
        </div>

        <ProductReviews productId={product.id} />
      </main>

      {isAdmin && (
        <ProductEditSheet
          product={product}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={(updated) => {
            setProduct(updated);
            setSelectedGrade(defaultGrade(updated));
          }}
        />
      )}
    </div>
  );
}