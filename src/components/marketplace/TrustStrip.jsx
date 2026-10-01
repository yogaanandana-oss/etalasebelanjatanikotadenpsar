import React from 'react';
import { Sprout, Leaf, MapPin, Truck } from 'lucide-react';

const FEATURES = [
  { icon: Sprout, id: 'Dipetik Segar Harian', en: 'Harvested Fresh Daily', tone: 'text-primary', bg: 'bg-primary/10' },
  { icon: Leaf, id: 'Pilihan Organik', en: 'Organic Options', tone: 'text-emerald-600', bg: 'bg-emerald-100' },
  { icon: MapPin, id: 'Petani Lokal Denpasar', en: 'Local Denpasar Farmers', tone: 'text-accent', bg: 'bg-accent/15' },
  { icon: Truck, id: 'Antar Se-Denpasar', en: 'Delivered Across Denpasar', tone: 'text-primary', bg: 'bg-primary/10' },
];

export default function TrustStrip() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {FEATURES.map((f, i) => {
        const Icon = f.icon;
        return (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${f.bg} ${f.tone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{f.id}</p>
              <p className="text-[0.7em] text-muted-foreground/70 truncate">{f.en}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}