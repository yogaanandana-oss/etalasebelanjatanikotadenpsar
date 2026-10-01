import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Sprout, CalendarClock, Clock, MapPin, Leaf, Tag, Heart, Package } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Bi } from '@/components/ui/Bi';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { formatIDR, formatShortDate, daysSince, daysUntil, finalPrice, hasDiscount } from '@/lib/format';
import { hasGrades, minGradePrice, isWeightGraded, minGradePerKgPrice, isWeightPriced } from '@/lib/grades';

export default function ProductCard({ product, reviewCount = 0 }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const saved = has(product.id);
  const sinceDays = daysSince(product.harvest_date);
  const untilRestock = daysUntil(product.restock_date);
  const freshId =
    sinceDays <= 0 ? 'Dipetik hari ini' : sinceDays === 1 ? '1 hari segar' : `${sinceDays} hari segar`;
  const freshEn =
    sinceDays <= 0 ? 'Harvested today' : sinceDays === 1 ? '1 day fresh' : `${sinceDays} days fresh`;
  const restockId = untilRestock > 0 ? `Restock ${untilRestock}h` : 'Segera restock';
  const restockEn = untilRestock > 0 ? `Restocks in ${untilRestock}d` : 'Restocking soon';
  const canPreOrder = !product.in_stock && product.restock_date;
  const graded = hasGrades(product);
  const weightGraded = isWeightGraded(product);
  const weightPriced = isWeightPriced(product);
  const minPrice = graded ? minGradePrice(product) : null;
  // For weight-tier products, the grade price IS the per-kg price (do not divide).
  const price = weightPriced
    ? minPrice
    : weightGraded
      ? minGradePerKgPrice(product)
      : graded ? minPrice : finalPrice(product);
  const unitLabel = (weightPriced || weightGraded) ? 'per kg' : product.unit;
  const organic = !!product.is_organic;

  return (
    <div className={`group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-[0_8px_24px_rgba(20,35,25,0.08)] hover:-translate-y-0.5 flex flex-col`}>
      <Link to={`/product-details?id=${product.id}`} className="relative aspect-square bg-secondary/40 block">
        <Image
          src={product.image_url}
          alt={product.name}
          className="w-full h-full"
          fittingType="fill"
        />
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-[0.7rem] font-semibold backdrop-blur">
          <Sprout className="w-3 h-3 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="leading-tight">{freshId}</span>
            <span className="text-[0.7em] leading-tight text-primary-foreground/70">{freshEn}</span>
          </span>
        </div>
        {hasDiscount(product) && (
          <div className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-accent text-accent-foreground text-[0.7rem] font-extrabold shadow-sm">
            <Tag className="w-3 h-3 shrink-0" />
            -{product.discount_percent}%
          </div>
        )}
        <div className={`absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold backdrop-blur ${organic ? 'bg-emerald-500/90 text-white' : 'bg-foreground/70 text-background'}`}>
          <Leaf className="w-3 h-3 shrink-0" />
          {organic ? 'Organik' : 'Anorganik'}
        </div>
        {!product.in_stock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs font-bold text-center leading-tight">
              Pre-Order<br /><span className="text-[0.7em] font-medium opacity-80">Tersedia {formatShortDate(product.restock_date)}</span>
            </span>
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          aria-label="wishlist"
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
        </button>
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-[1rem] text-foreground truncate">
              {product.name_id || product.name}
            </h3>
            <p className="text-xs text-muted-foreground">{product.name}</p>
          </div>
          <div className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-foreground shrink-0">
            <Star className="w-3 h-3 fill-accent text-accent" />
            {product.rating?.toFixed(1)}
            {reviewCount > 0 && (
              <span className="text-[0.65rem] font-medium text-muted-foreground">({reviewCount})</span>
            )}
          </div>
        </div>

        {product.farmer_location && (
          <div className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-muted-foreground">
            <MapPin className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">
              Petani {product.farmer_location}
              {product.subak ? ` · ${product.subak}` : ''}
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-1.5 flex-wrap">
          {graded && (
            <span className="text-[0.65rem] font-semibold text-muted-foreground">Mulai dari</span>
          )}
          <span className="font-display font-extrabold text-[1.125rem] text-foreground">
            {formatIDR(price)}
          </span>
          {hasDiscount(product) && (
            <span className="text-xs text-muted-foreground line-through">{formatIDR(product.price)}</span>
          )}
          <span className="text-xs text-muted-foreground">{unitLabel}</span>
        </div>

        {product.in_stock && product.estimated_stock > 0 && (
          <div className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-emerald-600">
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span className="flex flex-col leading-tight">
              <span className="leading-tight">Stok: ~{product.estimated_stock} {unitLabel?.replace('per ', '') || 'unit'}</span>
              <span className="text-[0.7em] font-medium text-emerald-600/70 leading-tight">In stock</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-lg bg-secondary/60 px-2 py-1.5">
            <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground font-semibold leading-tight">Panen</p>
            <p className="text-[0.6rem] uppercase tracking-wide text-muted-foreground/70 leading-tight">Harvest</p>
            <p className="text-xs font-semibold text-foreground">{formatShortDate(product.harvest_date)}</p>
          </div>
          <div className="rounded-lg bg-secondary/60 px-2 py-1.5">
            <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground font-semibold leading-tight">Restock Berikutnya</p>
            <p className="text-[0.6rem] uppercase tracking-wide text-muted-foreground/70 leading-tight">Next Restock</p>
            <p className="text-xs font-semibold text-foreground">{formatShortDate(product.restock_date)}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-accent mt-0.5">
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="leading-tight">{restockId}</span>
            <span className="text-[0.7em] font-medium text-accent/70 leading-tight">{restockEn}</span>
          </span>
        </div>

        {graded ? (
          <Button asChild className={`mt-auto h-10 rounded-lg font-semibold w-full ${
            product.in_stock
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'bg-accent hover:bg-accent/90 text-accent-foreground'
          }`}>
            <Link to={`/product-details?id=${product.id}`}>
              {product.in_stock ? (
                <><Plus className="w-4 h-4 mr-1 shrink-0" /><Bi id="Pilih Ukuran" en="Choose size" /></>
              ) : (
                <><Clock className="w-4 h-4 mr-1 shrink-0" /><Bi id="Pre-Order" en="Pre-Order" /></>
              )}
            </Link>
          </Button>
        ) : (
          <Button
            onClick={() => addItem(product)}
            disabled={!product.in_stock && !canPreOrder}
            className={`mt-auto h-10 rounded-lg font-semibold w-full ${
              product.in_stock
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : 'bg-accent hover:bg-accent/90 text-accent-foreground'
            }`}
          >
            {product.in_stock ? (
              <>
                <Plus className="w-4 h-4 mr-1 shrink-0" />
                <Bi id="Tambah ke Keranjang" en="Add to cart" />
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-1 shrink-0" />
                <Bi id="Pre-Order" en="Pre-Order" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}