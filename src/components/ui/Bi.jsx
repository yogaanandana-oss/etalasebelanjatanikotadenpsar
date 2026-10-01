import React from 'react';
import { cn } from '@/lib/utils';

// Bilingual text: Indonesian on top, English below (smaller, muted).
export function Bi({ id, en, className, enClassName }) {
  return (
    <span className={cn('flex flex-col leading-tight', className)}>
      <span className="leading-tight">{id}</span>
      <span className={cn('text-[0.7em] text-muted-foreground/70 leading-tight', enClassName)}>{en}</span>
    </span>
  );
}