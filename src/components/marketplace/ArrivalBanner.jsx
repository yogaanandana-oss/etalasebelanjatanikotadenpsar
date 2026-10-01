import React from 'react';
import { Sprout, Truck, Leaf } from 'lucide-react';

function Stat({ icon: Icon, value, label_id, label_en }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="leading-tight">
        <p className="font-display font-extrabold text-xl leading-none">{value}</p>
        <p className="text-[0.75rem] leading-tight text-primary-foreground/80">{label_id}</p>
        <p className="text-[0.65rem] leading-tight text-primary-foreground/60">{label_en}</p>
      </div>
    </div>
  );
}

export default function ArrivalBanner({ totalProducts, freshToday, restockingSoon }) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/85 text-primary-foreground p-6 lg:p-8 overflow-hidden relative">
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute right-12 bottom-2 opacity-20">
        <Leaf className="w-28 h-28" />
      </div>
      <div className="relative">
        <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-primary-foreground/80">
          Datang Hari Ini
        </p>
        <p className="text-[0.65rem] uppercase tracking-widest text-primary-foreground/60">
          Today's arrival
        </p>
        <h1 className="font-display font-extrabold mt-2 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05 }}>
          Dipetik Segar Setiap Hari
        </h1>
        <p className="text-[0.7em] font-semibold text-primary-foreground/70 -mt-1">Harvested Fresh Daily</p>
        <p className="mt-3 text-primary-foreground/85 max-w-md text-sm lg:text-base">
          Dari Kota Denpasar untuk dapur Anda — dipetik saat puncak kesegaran, dikirim dengan tanggal panen di setiap ikat.
        </p>
        <p className="mt-1 text-primary-foreground/70 max-w-md text-xs lg:text-sm">
          From Kota Denpasar to your kitchen — picked at peak freshness, delivered with a harvest date on every bunch.
        </p>

        <div className="flex flex-wrap gap-5 mt-6">
          <Stat icon={Sprout} value={totalProducts} label_id="Produk terdaftar" label_en="Produce listed" />
          <Stat icon={Leaf} value={freshToday} label_id="Dipetik hari ini" label_en="Harvested today" />
          <Stat icon={Truck} value={restockingSoon} label_id="Segera restock" label_en="Restocking soon" />
        </div>
      </div>
    </section>
  );
}