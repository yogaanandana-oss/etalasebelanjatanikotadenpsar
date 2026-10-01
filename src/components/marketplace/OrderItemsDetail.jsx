import React from 'react';
import { Image } from '@/components/ui/image';
import { formatIDR } from '@/lib/format';
import { effectivePrice, gradeFullLabel, isWeightPriced } from '@/lib/grades';

// Rincian belanja per pesanan: menampilkan tiap item, harga satuan, qty,
// grade/berat, sub-total, lalu diskon & total — sesuai orderan akun pelanggan.
export default function OrderItemsDetail({ order }) {
  let items = [];
  try {
    items = JSON.parse(order.items_json || '[]');
  } catch {
    items = [];
  }

  if (!items.length && !order.items_summary) return null;

  const subtotal = items.reduce((s, i) => s + (Number(effectivePrice(i)) || 0) * (Number(i.quantity) || 0), 0);
  const discount = Number(order.discount_amount) || 0;
  const total = Number(order.total) || 0;

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
        Rincian Belanja · Shopping Details
      </p>

      {items.length > 0 ? (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const { product, quantity, grade } = item;
            const unitPrice = effectivePrice(item);
            const lineTotal = (Number(unitPrice) || 0) * (Number(quantity) || 0);
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                  {product?.image_url ? (
                    <Image src={product.image_url} alt={product?.name || ''} className="w-full h-full" fittingType="fill" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {product?.name_id || product?.name || ''}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {quantity} × {formatIDR(unitPrice)}
                    {grade && <span className="ml-1 text-primary font-semibold">· {gradeFullLabel(grade)}</span>}
                    {isWeightPriced(product) && item.weight > 0 && (
                      <span className="ml-1 text-foreground/70 font-semibold">· {item.weight} kg</span>
                    )}
                    {product && !product.in_stock && <span className="ml-1 text-accent font-semibold">· Pre-Order</span>}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">{formatIDR(lineTotal)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{order.items_summary}</p>
      )}

      <div className="space-y-1 text-xs">
        {items.length > 0 && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex items-center justify-between text-primary">
            <span>
              Diskon{order.voucher_type && order.voucher_type !== 'none' ? ` · ${order.voucher_type === 'loyalty' ? 'Voucher Loyal' : 'Voucher Pertama'}` : ''}
            </span>
            <span>−{formatIDR(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between font-display font-bold text-foreground text-sm pt-1 border-t border-border">
          <span>Total</span>
          <span>{formatIDR(total)}</span>
        </div>
      </div>
    </div>
  );
}