import React from 'react';
import { Sprout, CalendarClock } from 'lucide-react';
import { daysSince, daysUntil, formatShortDate } from '@/lib/format';

function Strip({ items, k }) {
  return (
    <div className="flex items-center gap-8 px-4 shrink-0">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <span key={`${k}-${i}`} className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap">
            <Icon className="w-4 h-4 shrink-0 text-primary" />
            {it.text}
          </span>
        );
      })}
    </div>
  );
}

export default function HarvestNewsMarquee({ products }) {
  const fresh = products
    .filter((p) => daysSince(p.harvest_date) <= 0)
    .slice(0, 8);
  const upcoming = products
    .filter((p) => {
      const d = daysUntil(p.restock_date);
      return d >= 0 && d <= 7;
    })
    .sort((a, b) => daysUntil(a.restock_date) - daysUntil(b.restock_date))
    .slice(0, 8);

  const items = [];
  if (fresh.length) {
    items.push({ icon: Sprout, text: `🌾 Panen segar hari ini: ${fresh.map((p) => p.name_id || p.name).join(', ')}` });
  }
  upcoming.forEach((p) => {
    const d = daysUntil(p.restock_date);
    const when = d === 0 ? 'hari ini' : d === 1 ? 'besok' : `${d} hari lagi`;
    items.push({ icon: CalendarClock, text: `🌱 Akan ada panen ${p.name_id || p.name} — ${when} (${formatShortDate(p.restock_date)})` });
  });
  if (!items.length) {
    items.push({ icon: Sprout, text: '🍂 Berita panen terbaru akan tampil di sini saat ada hasil panen segar.' });
  }

  return (
    <div className="overflow-hidden bg-accent/15 border-y border-accent/30 text-foreground">
      <div className="flex whitespace-nowrap animate-marquee py-2">
        <Strip items={items} k="a" />
        <Strip items={items} k="b" />
      </div>
    </div>
  );
}