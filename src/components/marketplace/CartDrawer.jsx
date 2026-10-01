import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { useCart } from '@/lib/cartContext';
import { formatIDR, finalPrice } from '@/lib/format';
import { effectivePrice, itemKey, gradeFullLabel, isWeightPriced } from '@/lib/grades';
import { Bi } from '@/components/ui/Bi';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, count, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="font-display font-bold flex flex-col items-start gap-0 leading-tight">
            <span className="flex items-center gap-2 leading-tight">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Keranjang Anda {count > 0 && <span className="text-muted-foreground font-normal">({count})</span>}
            </span>
            <span className="text-[0.7em] font-normal text-muted-foreground/70">Your Cart {count > 0 && `(${count})`}</span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground">Keranjang kosong</p>
            <p className="text-sm text-muted-foreground/70">Your basket is empty</p>
            <p className="text-sm text-muted-foreground">Tambahkan hasil panen segar untuk mulai belanja.</p>
            <p className="text-sm text-muted-foreground/70">Add some freshly harvested produce to get started.</p>
            <Button
              onClick={() => { setIsOpen(false); navigate('/'); }}
              className="rounded-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" />
              <Bi id="Tambah Produk Lain" en="Add more products" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => {
                const { product, quantity, grade } = item;
                const key = itemKey(item);
                const unitPrice = effectivePrice(item);
                return (
                <div key={key} className="flex gap-3 rounded-xl border border-border p-2.5">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                    <Image src={product.image_url} alt={product.name} className="w-full h-full" fittingType="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{product.name_id || product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.name} · {product.unit}</p>
                        {grade && (
                          <span className="inline-block mt-0.5 text-[0.65rem] font-semibold text-primary leading-tight">{gradeFullLabel(grade)}</span>
                        )}
                        {isWeightPriced(product) && item.weight > 0 && (
                          <span className="inline-block mt-0.5 text-[0.65rem] font-semibold text-foreground/80 leading-tight">Berat: {item.weight} kg</span>
                        )}
                        {!product.in_stock && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[0.65rem] font-bold leading-tight">Pre-Order</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(key)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        aria-label="Hapus / Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(key, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Kurangi / Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(key, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Tambah / Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-display font-bold text-sm">{formatIDR(unitPrice * quantity)}</span>
                    </div>
                  </div>
                </div>
                );
              })}
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive"
              >
                Hapus keranjang · Clear cart
              </button>
              <button
                onClick={() => { setIsOpen(false); navigate('/'); }}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4" />
                <Bi id="Tambah Produk Lain" en="Add more products" />
              </button>
            </div>

            <div className="border-t border-border px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <Bi id="Subtotal" en="Subtotal" />
                <span className="font-display font-extrabold text-lg text-foreground">{formatIDR(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Tanggal panen dikonfirmasi saat checkout. Pengiriman area Kota Denpasar.</p>
              <p className="text-xs text-muted-foreground/70">Harvest dates confirmed at checkout. Delivery across Kota Denpasar.</p>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/checkout');
                }}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Checkout · {formatIDR(subtotal)}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}