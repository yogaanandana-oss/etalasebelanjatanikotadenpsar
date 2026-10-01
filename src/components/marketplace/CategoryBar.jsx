import React from 'react';
import { useCategories } from '@/lib/categoriesContext';
import { Bi } from '@/components/ui/Bi';

export default function CategoryBar({ active, onChange }) {
  const { categories } = useCategories();
  const items = [{ key: 'all', label_id: 'Semua', label_en: 'All Produce', icon: '🌱' }, ...categories];

  return (
    <div className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-2 py-3">
          {items.map((cat) => {
            const isActive = active === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onChange(cat.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 h-11 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                <span className="text-base leading-none">{cat.icon || '🌱'}</span>
                <Bi
                  id={cat.label_id}
                  en={cat.label_en}
                  enClassName={isActive ? 'text-primary-foreground/70' : ''}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}