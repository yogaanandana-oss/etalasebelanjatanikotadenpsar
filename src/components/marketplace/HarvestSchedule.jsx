import React, { useMemo } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { Sprout, Droplets, MapPin } from 'lucide-react';
import { formatShortDate } from '@/lib/format';
import { Image } from '@/components/ui/image';

// Menampilkan jadwal panen terdekat: tanggal, subak, dan wilayah Denpasar.
export default function HarvestSchedule({ products }) {
  const items = useMemo(() => {
    const today = new Date();
    return products
      .filter((p) => p.harvest_date)
      .map((p) => ({
        ...p,
        _diff: differenceInCalendarDays(new Date(p.harvest_date), today),
      }))
      .sort((a, b) => Math.abs(a._diff) - Math.abs(b._diff))
      .slice(0, 8);
  }, [products]);

  if (!items.length) return null;

  return (
    <section className="mt-6">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-display font-bold text-[1.15rem] text-foreground leading-tight">
            Jadwal Panen per Subak
          </h2>
          <p className="text-[0.7em] text-muted-foreground/70 leading-tight">
            Harvest schedule — which subak & which Denpasar area
          </p>
        </div>
        <Sprout className="w-5 h-5 text-primary shrink-0" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((p) => {
          const diff = p._diff;
          const when =
            diff === 0
              ? 'Panen hari ini'
              : diff > 0
              ? `Panen ${diff} hr lagi`
              : `Panen ${Math.abs(diff)} hr lalu`;
          return (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-lg bg-primary/10 overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-border">
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name_id || p.name} className="w-full h-full" fittingType="fill" />
                  ) : (
                    <Sprout className="w-4 h-4 text-primary" />
                  )}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[0.7em] text-muted-foreground/70">Tanggal Panen</p>
                  <p className="font-display font-bold text-foreground text-sm">
                    {formatShortDate(p.harvest_date)}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-sm text-foreground truncate">
                {p.name_id || p.name}
              </p>
              <p className="text-[0.7em] font-medium text-primary">{when}</p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {p.subak ? (
                  <span className="inline-flex items-center gap-0.5 text-[0.62rem] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">
                    <Droplets className="w-3 h-3" />{p.subak}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[0.62rem] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    <Droplets className="w-3 h-3" />Subak tidak disebut
                  </span>
                )}
                {p.farmer_location && (
                  <span className="inline-flex items-center gap-0.5 text-[0.62rem] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                    <MapPin className="w-3 h-3" />{p.farmer_location}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}