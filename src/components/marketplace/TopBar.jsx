import React from 'react';
import { Search, MapPin, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useSettings } from '@/lib/settingsContext';
import { shopConfig } from '@/lib/shopConfig';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TopBar({ query, onQueryChange, onOpenFilters }) {
  const { count, setIsOpen } = useCart();
  const { settings } = useSettings() || {};
  const shopName = settings?.shop_name?.value || shopConfig.shopName;

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-2 sm:gap-3 lg:gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-extrabold text-lg">E</span>
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="font-display font-extrabold text-[15px] text-foreground">{shopName}</p>
            <p className="text-[11px] text-muted-foreground -mt-0.5">Hasil Panen Segar Harian · Harvested Fresh Daily</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">Kota Denpasar</span>
          <span className="text-muted-foreground">· Bali</span>
        </div>

        <div className="flex-1 min-w-0 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Cari / Search…"
              className="pl-9 h-10 rounded-full bg-card border-border"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onOpenFilters}
          className="lg:hidden rounded-full h-10 px-3 border-border shrink-0"
          aria-label="Filter / Saring"
        >
          <SlidersHorizontal className="w-5 h-5 text-foreground" />
          <span className="hidden xs:inline font-semibold text-sm">Filter</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="relative rounded-full h-10 w-10 p-0 border-border shrink-0"
          aria-label="Buka keranjang / Open cart"
        >
          <ShoppingBag className="w-5 h-5 text-foreground" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-accent text-accent-foreground text-[11px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}