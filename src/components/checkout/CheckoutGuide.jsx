import React, { useState } from 'react';
import {
  Search, ShoppingBag, ClipboardList, Truck, Banknote, Building2, QrCode,
  ChevronDown, Leaf, MapPin, CheckCircle2, Info,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Bi } from '@/components/ui/Bi';

const SHOP_STEPS = [
  { icon: Search, id: 'Pilih Produk', en: 'Browse', d: 'Jelajahi sayur & buah segar.', de: 'Browse fresh produce.' },
  { icon: ShoppingBag, id: 'Keranjang', en: 'Cart', d: 'Pilih jumlah, masukkan keranjang.', de: 'Pick qty, add to cart.' },
  { icon: ClipboardList, id: 'Checkout', en: 'Checkout', d: 'Isi data pengiriman & bayar.', de: 'Fill details & pay.' },
  { icon: Truck, id: 'Terima', en: 'Receive', d: 'Kurir antar ke rumah Anda.', de: 'Courier delivers to you.' },
];

const PAY_METHODS = [
  { icon: Banknote, id: 'COD', en: 'Cash on Delivery', d: 'Bayar tunai saat pesanan tiba.', de: 'Pay cash on arrival.', tone: 'bg-accent/15 text-accent-foreground' },
  { icon: Building2, id: 'Transfer Bank (VA)', en: 'Bank Transfer', d: 'BCA · BNI · BRI · Mandiri · Permata.', de: 'Bank transfer via VA.', tone: 'bg-primary/10 text-primary' },
  { icon: QrCode, id: 'QRIS', en: 'QRIS', d: 'Scan dengan e-wallet / m-banking.', de: 'Scan with e-wallet / m-banking.', tone: 'bg-accent/15 text-accent-foreground' },
];

const AREAS = ['Denpasar Utara', 'Denpasar Timur', 'Denpasar Selatan', 'Denpasar Barat'];

export default function CheckoutGuide() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="rounded-xl border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Info className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-foreground leading-tight">Panduan Belanja & Pembayaran</p>
          <p className="text-[0.7em] text-muted-foreground/70 leading-tight">Shopping & Payment Guide</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Shopping steps */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Cara Berbelanja · How to shop</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SHOP_STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="rounded-lg border border-border p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[0.6rem] font-bold text-primary">{i + 1}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-tight">{s.id}</p>
                    <p className="text-[0.65rem] text-muted-foreground/70 leading-tight">{s.en}</p>
                    <p className="text-[0.7rem] text-muted-foreground mt-0.5 leading-tight">{s.d}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment methods */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Cara Pembayaran · How to pay</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {PAY_METHODS.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="rounded-lg border border-border p-2.5">
                    <span className={`w-7 h-7 rounded-md ${m.tone} flex items-center justify-center mb-1.5`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <p className="text-xs font-semibold text-foreground leading-tight">{m.id}</p>
                    <p className="text-[0.65rem] text-muted-foreground/70 leading-tight">{m.en}</p>
                    <p className="text-[0.7rem] text-muted-foreground mt-0.5 leading-tight">{m.d}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Areas + tips */}
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="rounded-lg bg-secondary/60 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-foreground">Area Pengiriman · Delivery Areas</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {AREAS.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 text-[0.7rem] px-1.5 py-0.5 rounded bg-card border border-border text-foreground">
                    <Leaf className="w-3 h-3 text-primary" />{a}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-secondary/60 p-3 text-[0.75rem] text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="text-xs font-semibold text-foreground">Tips · Tips</p>
              </div>
              Siapkan uang pas untuk COD, pastikan nomor HP aktif, dan periksa kesegaran saat pesanan tiba.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}