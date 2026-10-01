const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import TopBar from '@/components/marketplace/TopBar';
import CategoryBar from '@/components/marketplace/CategoryBar';
import FilterSidebar from '@/components/marketplace/FilterSidebar';
import ProductCard from '@/components/marketplace/ProductCard';
import ArrivalBanner from '@/components/marketplace/ArrivalBanner';
import MobileNav from '@/components/marketplace/MobileNav';
import MobileFilters from '@/components/marketplace/MobileFilters';
import PullToRefresh from '@/components/marketplace/PullToRefresh';
import BaliPattern from '@/components/marketplace/BaliPattern';
import TrustStrip from '@/components/marketplace/TrustStrip';
import WelcomeMarquee from '@/components/marketplace/WelcomeMarquee';
import HarvestNewsMarquee from '@/components/marketplace/HarvestNewsMarquee';
import HarvestSchedule from '@/components/marketplace/HarvestSchedule';
import BaliDoodle from '@/components/marketplace/BaliDoodle';
import { Image } from '@/components/ui/image';
import { Leaf } from 'lucide-react';
import SiteFooter from '@/components/marketplace/SiteFooter';
import { daysSince, daysUntil, finalPrice } from '@/lib/format';
import { useCategories } from '@/lib/categoriesContext';

const FARMER_IMG = 'https://media.db.com/images/public/6aa8ed0c5f6fc170701cd715/da4434ab7_generated_image.png';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [filters, setFilters] = useState({
    availability: new Set(),
    harvest: new Set(),
    restock: new Set(),
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [reviewCounts, setReviewCounts] = useState({});
  const { labelId, labelEn } = useCategories();
  const productsRef = useRef(null);

  // On mobile, selecting a category scrolls down to the matching produce list.
  useEffect(() => {
    if (category === 'all') return;
    if (window.innerWidth >= 1024) return;
    const el = productsRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [category]);

  const priceBounds = useMemo(() => {
    if (!products.length) return [0, 0];
    const prices = products.map(finalPrice);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);
  const [priceRange, setPriceRange] = useState([0, 0]);
  useEffect(() => { setPriceRange(priceBounds); }, [priceBounds]);

  const loadProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await db.entities.Product.list();
      const rows = Array.isArray(data) ? data : data.items || [];
      setProducts(rows.filter((p) => !p.hidden));
    } catch {
      if (!silent) setProducts([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    db.entities.Review.list('-created_date', 500)
      .then((rows) => {
        const arr = Array.isArray(rows) ? rows : rows.items || [];
        const map = {};
        arr.forEach((r) => { map[r.product_id] = (map[r.product_id] || 0) + 1; });
        setReviewCounts(map);
      })
      .catch(() => setReviewCounts({}));
  }, []);

  const visibleProducts = products;

  const filtered = useMemo(() => {
    return visibleProducts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const catId = labelId(p.category).toLowerCase();
        const catEn = labelEn(p.category).toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.name_id?.toLowerCase().includes(q) &&
          !p.category.toLowerCase().includes(q) &&
          !catId.includes(q) &&
          !catEn.includes(q)
        )
          return false;
      }

      if (priceBounds[1] > priceBounds[0]) {
        const fp = finalPrice(p);
        if (fp < priceRange[0] || fp > priceRange[1]) return false;
      }

      if (filters.availability.size) {
        const matches = [];
        if (filters.availability.has('in_stock') && p.in_stock) matches.push(true);
        if (filters.availability.has('preorder') && !p.in_stock) matches.push(true);
        if (!matches.length) return false;
      }

      if (filters.harvest.size) {
        const since = daysSince(p.harvest_date);
        const matches = [];
        if (filters.harvest.has('fresh_today') && since <= 0) matches.push(true);
        if (filters.harvest.has('fresh_2d') && since <= 2) matches.push(true);
        if (filters.harvest.has('fresh_week') && since <= 7) matches.push(true);
        if (!matches.length) return false;
      }

      if (filters.restock.size) {
        const until = daysUntil(p.restock_date);
        const matches = [];
        if (filters.restock.has('restock_soon') && until <= 3 && until >= 0) matches.push(true);
        if (filters.restock.has('restock_week') && until <= 7 && until >= 0) matches.push(true);
        if (!matches.length) return false;
      }

      return true;
    });
  }, [visibleProducts, query, category, filters, priceRange, priceBounds]);

  const freshToday = useMemo(
    () => visibleProducts.filter((p) => daysSince(p.harvest_date) <= 0).length,
    [visibleProducts]
  );
  const restockingSoon = useMemo(
    () => visibleProducts.filter((p) => daysUntil(p.restock_date) <= 3 && daysUntil(p.restock_date) >= 0).length,
    [visibleProducts]
  );

  const headingId = category === 'all' ? 'Semua Produk' : labelId(category);
  const headingEn = category === 'all' ? 'All Produce' : category;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <PullToRefresh onRefresh={() => loadProducts(true)}>
      <TopBar query={query} onQueryChange={setQuery} onOpenFilters={() => setFiltersOpen(true)} />
      <WelcomeMarquee />
      <CategoryBar active={category} onChange={setCategory} />
      <BaliPattern className="text-primary/25" height={22} />

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="rounded-2xl overflow-hidden relative h-52 sm:h-64 mb-6">
          <Image
            src={FARMER_IMG}
            alt="Petani lokal Denpasar memanen sayur dan buah segar"
            className="w-full h-full"
            fittingType="fill"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/45 to-transparent flex items-center px-5 sm:px-9">
            <div className="text-primary-foreground max-w-md">
              <p className="text-[0.62em] font-semibold tracking-[0.28em] uppercase opacity-80">Kota Denpasar</p>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl leading-none tracking-tight drop-shadow-sm">Kota Denpasar</h1>
              <p className="mt-1.5 text-[0.72em] sm:text-sm opacity-85 font-medium">Panen segar dari petani Denpasar · Fresh harvest from Denpasar farmers</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.6em] sm:text-[0.68em] font-semibold tracking-[0.14em] uppercase opacity-90 leading-relaxed">
                <span>Etalase Belanja Tani Kota Denpasar</span>
                <span className="opacity-50">·</span>
                <span>Tim Inovasi Dinas Pertanian Kota Denpasar</span>
                <span className="opacity-50">·</span>
                <span>est 2026</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-px w-5 sm:w-7 bg-primary-foreground/40" />
                <Leaf className="w-3.5 h-3.5 opacity-90" />
                <span className="font-display font-semibold text-sm sm:text-base tracking-[0.12em]">Dukung Petani Lokal</span>
                <Leaf className="w-3.5 h-3.5 opacity-90" />
                <span className="h-px w-5 sm:w-7 bg-primary-foreground/40" />
              </div>
              <p className="text-[0.65em] opacity-70 mt-0.5 tracking-wide">Support local farmers</p>
            </div>
          </div>
        </div>

        <HarvestNewsMarquee products={visibleProducts} />
        <HarvestSchedule products={visibleProducts} />

        <div className="relative">
          <BaliDoodle className="absolute -top-1 -left-1 text-primary/20 pointer-events-none" size={56} />
          <BaliDoodle className="absolute -bottom-1 -right-1 text-primary/20 pointer-events-none scale-[-1]" size={56} />
          <ArrivalBanner
            totalProducts={visibleProducts.length}
            freshToday={freshToday}
            restockingSoon={restockingSoon}
          />
        </div>
        <BaliPattern className="text-primary/25 mt-6" height={26} />

        <div className="mt-6">
          <TrustStrip />
        </div>

        <div className="flex gap-8 mt-8">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            priceBounds={priceBounds}
            query={query}
            onQueryChange={setQuery}
          />

          <div className="flex-1 min-w-0">
            <div ref={productsRef} className="mb-4 scroll-mt-40">
              <h2 className="font-display font-bold text-[1.25rem] text-foreground leading-tight">
                {headingId}
              </h2>
              <p className="text-[0.7em] text-muted-foreground/70 leading-tight">{headingEn}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {loading
                  ? 'Memuat panen… / Loading harvest…'
                  : `${filtered.length} item tersedia · ${filtered.length} item${filtered.length === 1 ? '' : 's'} available`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="aspect-square bg-secondary/50 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-secondary rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-secondary rounded animate-pulse" />
                      <div className="h-9 bg-secondary rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <p className="font-display font-semibold text-foreground">Tidak ada produk cocok dengan filter Anda</p>
                <p className="text-sm text-muted-foreground/70 mt-1">No produce matches your filters</p>
                <p className="text-sm text-muted-foreground mt-2">Coba hapus filter atau pilih kategori lain.</p>
                <p className="text-sm text-muted-foreground/70">Try clearing filters or choosing another category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    reviewCount={reviewCounts[product.id] || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
      </PullToRefresh>
      <MobileFilters
        filters={filters}
        setFilters={setFilters}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        priceBounds={priceBounds}
        query={query}
        onQueryChange={setQuery}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      />
      <MobileNav />
    </div>
  );
}