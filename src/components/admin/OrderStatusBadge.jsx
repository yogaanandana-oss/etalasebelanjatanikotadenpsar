import React from 'react';
import { cn } from '@/lib/utils';

export const STATUS_META = {
  pending:    { id: 'Menunggu',   en: 'Pending',     tone: 'bg-amber-100 text-amber-700 border-amber-200' },
  paid:       { id: 'Dibayar',    en: 'Paid',        tone: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { id: 'Diproses',   en: 'Processing',  tone: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  shipped:    { id: 'Dikirim',    en: 'Shipped',     tone: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed:  { id: 'Selesai',    en: 'Completed',   tone: 'bg-primary/15 text-primary border-primary/20' },
  expired:    { id: 'Kedaluwarsa', en: 'Expired',    tone: 'bg-muted text-muted-foreground border-border' },
  cancelled:  { id: 'Dibatalkan', en: 'Cancelled',   tone: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function OrderStatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={cn('inline-flex flex-col leading-tight rounded-full border px-2.5 py-1 text-xs font-semibold', meta.tone)}>
      <span className="leading-tight">{meta.id}</span>
      <span className="text-[0.65em] font-medium opacity-70 leading-tight">{meta.en}</span>
    </span>
  );
}