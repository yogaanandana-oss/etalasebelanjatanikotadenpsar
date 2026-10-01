import React from 'react';
import { Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bi } from '@/components/ui/Bi';
import PriceRangeFilter from '@/components/marketplace/PriceRangeFilter';

const GROUPS = [
  {
    groupKey: 'availability',
    title_id: 'Ketersediaan',
    title_en: 'Availability',
    options: [
      { id: 'in_stock', label_id: 'Tersedia sekarang', label_en: 'In stock now' },
      { id: 'preorder', label_id: 'Pesan dulu (restock)', label_en: 'Pre-order (restocking)' },
    ],
  },
  {
    groupKey: 'harvest',
    title_id: 'Tanggal Panen',
    title_en: 'Harvest Date',
    options: [
      { id: 'fresh_today', label_id: 'Dipetik hari ini', label_en: 'Harvested today' },
      { id: 'fresh_2d', label_id: 'Dipetik dalam 2 hari', label_en: 'Harvested within 2 days' },
      { id: 'fresh_week', label_id: 'Dipetik minggu ini', label_en: 'Harvested this week' },
    ],
  },
  {
    groupKey: 'restock',
    title_id: 'Status Restock',
    title_en: 'Restock Status',
    options: [
      { id: 'restock_soon', label_id: 'Restock dalam 3 hari', label_en: 'Restocking within 3 days' },
      { id: 'restock_week', label_id: 'Restock minggu ini', label_en: 'Restocking this week' },
    ],
  },
];

export default function FilterSidebar({ filters, setFilters, priceRange, setPriceRange, priceBounds, query, onQueryChange }) {
  const toggle = (key, value) => {
    setFilters((prev) => {
      const set = new Set(prev[key]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, [key]: set };
    });
  };

  const hasAny = (filters.availability.size || filters.harvest.size || filters.restock.size) > 0;

  return (
    <aside className="w-[280px] shrink-0 hidden lg:block">
      <div className="sticky top-[136px] space-y-6">
        <div>
          <h3 className="font-display font-bold text-[1.25rem] text-foreground leading-tight">Filter</h3>
          <p className="text-[0.7em] text-muted-foreground/70">Filters</p>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">Cari Produk</p>
            <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground/60 leading-tight">Search Products</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Cari kangkung, cabai… / Search…"
              className="pl-9 h-10 bg-card"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">Rentang Harga</p>
            <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground/60 leading-tight">Price Range</p>
          </div>
          <PriceRangeFilter min={priceBounds[0]} max={priceBounds[1]} value={priceRange} onChange={setPriceRange} />
        </div>

        <Separator />

        {GROUPS.map((group, i) => (
          <React.Fragment key={group.groupKey}>
            {i > 0 && <Separator />}
            <div className="space-y-3">
              <div>
                <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">{group.title_id}</p>
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground/60 leading-tight">{group.title_en}</p>
              </div>
              {group.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`${group.groupKey}-${opt.id}`}
                    checked={filters[group.groupKey].has(opt.id)}
                    onCheckedChange={() => toggle(group.groupKey, opt.id)}
                  />
                  <Label htmlFor={`${group.groupKey}-${opt.id}`} className="text-sm text-foreground cursor-pointer">
                    <Bi id={opt.label_id} en={opt.label_en} />
                  </Label>
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}

        {hasAny && (
          <button
            onClick={() =>
              setFilters({ availability: new Set(), harvest: new Set(), restock: new Set() })
            }
            className="text-sm font-semibold text-primary hover:underline"
          >
            Hapus semua filter · Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}